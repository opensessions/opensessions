const { sendEmail, sendPublishedEmail, getStyledElement } = require('../server/middlewares/email');
const { SERVICE_LOCATION, SERVICE_EMAIL_ADMIN, EMAILS_INBOUND_URL } = process.env;
const { sortSchedule, parseSchedule } = require('../utils/calendar');
const { sendTweet } = require('../server/middlewares/twitter');

const { reqToSearch, sessionToItem } = require('../server/middlewares/rdpe');

const { getUserByEmail, getUserById } = require('./users');

const deg2rad = deg => deg * (Math.PI / 180);

function getDistanceFromLatLonInKm(lat1, lon1, lat2, lon2) {
  const EARTH_RADIUS_KM = 6371;
  const dLat = deg2rad(lat2 - lat1); // deg2rad below
  const dLon = deg2rad(lon2 - lon1);
  const a =
    (Math.sin(dLat / 2) * Math.sin(dLat / 2)) +
    (Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) * Math.sin(dLon / 2) * Math.sin(dLon / 2));
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const d = EARTH_RADIUS_KM * c; // Distance in km
  return d;
}

const prefixTypes = {
  socialWebsite: ['http://', 'https://'],
  socialFacebook: ['https://facebook.com/', 'https://www.facebook.com/'],
  socialInstagram: ['@'],
  socialTwitter: ['@'],
  socialHashtag: ['#']
};

module.exports = (DataTypes) => ({
  tablePrototype: {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true,
    }
  },
  tables: {
    SessionActivity: {
      _options: {}
    },
    Threads: {
      originEmail: DataTypes.STRING(256),
      metadata: DataTypes.JSON,
      _options: {}
    },
    Analysis: {
      analysis: DataTypes.JSON,
      _options: {
        freezeTableName: true,
        classMethods: {
          getQuery(query) {
            query.order = [['createdAt', 'ASC']];
            return query;
          },
          getActions(models, req) {
            const actions = [];
            if (req.isAdmin) {
              actions.push('view');
            }
            return actions;
          }
        }
      }
    },
    Partner: {
      userId: DataTypes.STRING,
      data: DataTypes.JSON,
      _options: {
        freezeTableName: true,
        classMethods: {
          getQuery(query) {
            return query;
          },
          getActions(models, req) {
            const actions = [];
            if (req.isAdmin) {
              actions.push('new');
              actions.push('view');
            }
            return actions;
          },
          new(req, models) {
            const { userId } = req.body;
            return getUserById(userId).then(user => {
              const { picture, name } = user;
              return models.Partner.create({ userId, data: { picture, name } });
            });
          }
        },
        instanceMethods: {
          getActions(models, req) {
            const actions = [];
            if (req.isAdmin || (req.user && req.user === this.owner)) {
              actions.push('view');
              actions.push('edit');
            }
            if (req.isAdmin) {
              actions.push('enable');
              actions.push('disable');
              actions.push('delete');
            }
            actions.push('rdpe');
            return actions;
          },
          delete() {
            return this.destroy();
          },
          rdpe(req, models) {
            const { uuid, userId } = this;
            const options = { legacyOrganizerMerge: true, URL: `/api/partner/${uuid}/action/rdpe` };
            return models.Session.findAll(reqToSearch(req, models, { owner: userId })).then(rawSessions => {
              const sessions = rawSessions.map(session => sessionToItem(session, options, s => s.owner === userId));
              const next = {};
              if (sessions.length) {
                const lastSession = sessions[sessions.length - 1];
                next.from = lastSession.modified;
                next.after = lastSession.id;
              } else {
                ['from', 'after'].filter(key => key in req.query).forEach(key => (next[key] = req.query[key]));
              }
              return {
                items: sessions,
                next: `/api/partner/${uuid}/action/rdpe?${Object.keys(next).map(key => [key, encodeURIComponent(next[key])].join('=')).join('&')}`,
                license: 'https://creativecommons.org/licenses/by/4.0/',
                raw: true
              };
            });
          }
        }
      }
    },
    Activity: {
      owner: DataTypes.STRING,
      name: {
        type: DataTypes.STRING,
        validate: {
          not: /[£$%\\!?:;,.]/
        }
      },
      _options: {
        getterMethods: {
          href() {
            return `/${this.Model.name.toLowerCase()}/${this.uuid}`;
          },
        },
        hooks: {
          afterCreate(activity) {
            return sendEmail('Someone has added a new activity on Open Sessions', SERVICE_EMAIL_ADMIN, `
              <p>A new activity has been created on Open Sessions.</p>
              <p>It's called ${activity.name} and the session it is attached to may still be in draft mode.</p>
            `, { substitutions: { '-title-': 'New activity', '-titleClass-': 'large' } });
          }
        },
        instanceMethods: {
          delete() {
            return this.destroy();
          },
          merge(req, models, user) {
            if (!(req.body && req.body.target)) return Promise.reject({ message: 'No target activity selected' });
            const { target } = req.body;
            const src = this;
            const isAdmin = req.isAdmin;
            return models.Session.findAll(models.Session.getQuery({ where: { activityId: src.uuid } }, models, user, isAdmin))
              .then(sessions => Promise.all(sessions.map(s => s.setActivities(s.Activities.map(a => (a.uuid === src.uuid ? target : a.uuid))))))
              .then(() => src.destroy())
              .then(() => ({ message: 'Activities merged!' }));
          },
          giveParent(req) {
            if (!req.body.parentUuid) return Promise.reject({ message: 'Invalid parent ID' });
            return this.update({ parentUuid: req.body.parentUuid }).then(instance => ({ message: 'Parent added!', instance }));
          },
          removeParent() {
            return this.setParent(null).then(instance => ({ message: 'Parent removed!', instance }));
          },
          getActions(models, req) {
            return models.Activity.getInstanceActions(this, models, req);
          },
          rename(req) {
            return this.update({ name: req.body.name }).then(instance => ({ message: 'Renamed!', instance }));
          }
        },
        classMethods: {
          getQuery(query, models) {
            if (!query) query = {};
            let depth = 0;
            if (query.where && query.where.depth) {
              depth = parseInt(query.where.depth, 10);
              delete query.where.depth;
            }
            switch (depth) {
              case 0:
              default:
                break;
              case 1:
                query.attributes = ['uuid', 'name', 'owner', 'createdAt', 'updatedAt', [DataTypes.fn('COUNT', DataTypes.col('Sessions.uuid')), 'SessionsCount'], [DataTypes.fn('COUNT', DataTypes.col('Sessions.SessionActivity.uuid')), 'SessionsActivitiesCount']];
                query.include = [{ model: models.Session, through: { model: models.SessionActivity, attributes: [] }, required: false, where: { state: 'published' }, attributes: [] }];
                query.group = ['Activity.uuid'];
                break;
            }
            return query;
          },
          getActions(models, req) {
            const actions = ['list'];
            if (req.user) actions.push('new');
            return actions;
          },
          getInstanceActions(instance, models, req) {
            const actions = [];
            actions.push('view');
            if (req.isAdmin) {
              actions.push('merge');
              actions.push('giveParent');
              actions.push('delete');
              if (instance.parentUuid) actions.push('removeParent');
              actions.push('rename');
            }
            return actions;
          },
          new(req, models) {
            const { name } = req.body;
            if (!name) return Promise.reject({ raw: true, error: 'You must enter a name' });
            const cleanName = name.replace(/[^a-zA-Z ]/g, '').trim();
            if (!cleanName) return Promise.reject({ raw: true, error: `"${name}" is not a valid name` });
            return models.Activity.findAll({ where: { name: { $iLike: cleanName } } }).then(activities => {
              if (activities.length) return Promise.reject({ raw: true, error: 'Activity with a similar name already exists' });
              return models.Activity.create({ name: cleanName }).then(instance => ({ raw: true, instance }));
            });
          },
          list(req, models) {
            return models.Activity.sequelize.query(`
              SELECT
                "Activity"."uuid", "Activity"."name", "Activity"."createdAt", "Activity"."parentUuid",
                case when count("Sessions") = 0 then '[]' else JSON_AGG(JSON_BUILD_OBJECT('uuid', "Sessions"."uuid", 'title', "Sessions"."title")) end AS "Sessions",
                COALESCE((SELECT json_agg(JSON_BUILD_OBJECT('uuid', "Children"."uuid", 'name', "Children"."name"))
                  FROM "Activities" as "Children"
                  WHERE "Children"."parentUuid" = "Activity".uuid ), '[]'::json) as "Children"
              FROM "Activities" AS "Activity"
              LEFT OUTER JOIN (
                "SessionActivities" AS "Sessions.SessionActivity"
                INNER JOIN "Sessions" AS "Sessions" ON "Sessions"."uuid" = "Sessions.SessionActivity"."SessionUuid"
              ) ON "Activity"."uuid" = "Sessions.SessionActivity"."ActivityUuid" AND "Sessions"."state" = 'published'
                GROUP BY "Activity"."uuid"
                ORDER BY "Activity"."name";
            `).then(([instances]) => ({ instances: instances.map(instance => Object.assign(instance, { actions: models.Activity.getInstanceActions(instance, models, req) })), raw: true }));
          },
          makeAssociations(models) {
            models.Activity.belongsToMany(models.Session, { through: models.SessionActivity });
            models.Activity.belongsTo(models.Activity, { as: 'parent' });
          }
        }
      }
    },
    Organizer: {
      owner: DataTypes.STRING,
      slug: { type: DataTypes.STRING(32), unique: true },
      name: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: true
        }
      },
      image: DataTypes.STRING(512),
      members: DataTypes.JSON,
      data: DataTypes.JSON,
      _options: {
        getterMethods: {
          href() {
            return `/${this.Model.name.toLowerCase()}/${this.slug || this.uuid}`;
          },
          info() {
            const attr = name => (this.data ? this.data[name] : null);
            return {
              contact: {
                name: attr('contactName'),
                phone: attr('contactPhone'),
                email: attr('contactEmail')
              },
              social: {
                website: attr('socialWebsite'),
                facebook: attr('socialFacebook'),
                instagram: attr('socialInstagram'),
                hashtag: attr('socialHashtag'),
                twitter: attr('socialTwitter')
              },
              location: attr('location')
            };
          }
        },
        instanceMethods: {
          delete() {
            return this.destroy();
          },
          addMember(req) {
            return getUserByEmail(req.body.email)
              .then(user => this.update({ members: (this.members || []).concat({ email: user.email, user_id: user.user_id, picture: user.picture, name: user.name }) }))
              .then(() => ({}));
          },
          removeMember(req) {
            return this.update({ members: (this.members || []).filter(member => member.user_id !== req.body.user_id) }).then(() => ({}));
          },
          getOwners() {
            return [this.owner].concat(this.members ? this.members.map(user => user.user_id) : []).filter(v => v);
          },
          getActions(models, req) {
            const actions = ['view'];
            const user = req.user ? req.user.sub : null;
            const isOwner = user && this.getOwners().some(id => id === user);
            if (isOwner) {
              actions.push('edit');
              actions.push('addMember');
              actions.push('removeMember');
              if (!this.Sessions || this.Sessions.length === 0) {
                actions.push('delete');
              }
            }
            return actions;
          }
        },
        classMethods: {
          getQuery(query, models, user) {
            const uuidFormat = /[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}/;
            if (query.where.uuid) {
              const { uuid } = query.where;
              if (!uuidFormat.test(uuid)) {
                delete query.where.uuid;
                query.where.slug = uuid;
              }
            }
            let depth = 0;
            if (query.where && query.where.depth) {
              depth = parseInt(query.where.depth, 10);
              delete query.where.depth;
            }
            if (depth === 1) {
              const sessionQuery = models.Session.getQuery({}, models, user);
              query.include = [{
                model: models.Session,
                where: sessionQuery.where,
                required: false
              }];
            }
            return query;
          },
          makeAssociations(models) {
            models.Organizer.hasMany(models.Session);
          }
        },
        hooks: {
          beforeUpdate(instance) {
            const { data } = instance;
            if (instance.changed('data') && data) {
              if (data.socialFacebook && data.socialFacebook.match(' ')) {
                data.socialFacebook = `https://facebook.com/search/pages/?q=${data.socialFacebook.replace(' ', '+')}`;
              }
              Object.keys(prefixTypes).filter(type => data[type]).forEach(type => {
                const val = data[type];
                const prefixes = prefixTypes[type];
                if (!prefixes.some(prefix => val.indexOf(prefix) === 0)) data[type] = `${prefixes[0]}${val}`;
              });
              instance.data = data;
            }
            if (instance.changed('slug')) {
              instance.slug = instance.slug.replace(/[/\.]/g, '');
            }
          }
        }
      }
    },
    Session: {
      state: {
        type: DataTypes.STRING,
        defaultValue: 'draft',
        validate: {
          isIn: [['draft', 'published', 'unpublished', 'deleted']]
        }
      },
      owner: DataTypes.STRING,
      title: DataTypes.STRING(50),
      description: DataTypes.STRING(2048),
      preparation: DataTypes.STRING(2048),
      leader: DataTypes.STRING,
      image: DataTypes.STRING(512),
      hasCoaching: DataTypes.BOOLEAN,
      location: DataTypes.STRING,
      locationData: DataTypes.JSON,
      meetingPoint: DataTypes.STRING,
      pricing: DataTypes.JSON,
      genderRestriction: {
        type: DataTypes.STRING(16),
        defaultValue: 'mixed',
        validate: {
          isIn: [['mixed', 'male', 'female']]
        }
      },
      minAgeRestriction: DataTypes.INTEGER,
      maxAgeRestriction: DataTypes.INTEGER,
      abilityRestriction: DataTypes.JSON,
      contactName: DataTypes.STRING(50),
      contactPhone: DataTypes.STRING,
      contactEmail: DataTypes.STRING,
      schedule: DataTypes.JSON,
      socialWebsite: DataTypes.STRING(256),
      socialFacebook: DataTypes.STRING(256),
      socialInstagram: DataTypes.STRING(64),
      socialTwitter: DataTypes.STRING(64),
      socialHashtag: DataTypes.STRING(64),
      analytics: DataTypes.JSON,
      metadata: DataTypes.JSON,
      _options: {
        getterMethods: {
          href() {
            return `/${this.Model.name.toLowerCase()}/${this.uuid}`;
          },
          absoluteURL() {
            return `${SERVICE_LOCATION}/${this.Model.name.toLowerCase()}/${this.uuid}`;
          },
          aggregators() {
            // figure out which Get Active location
            const { state, locationData, location, genderRestriction } = this;
            if (state !== 'published') return [];
            const getActivePath = `/results/list?activity=&location=${location}&lat=${locationData ? locationData.lat : ''}&lng=${locationData ? locationData.lng : ''}&radius=4&sortBy=distance`;
            const info = {
              GetActiveLondon: {
                name: 'Get Active London',
                img: [SERVICE_LOCATION, 'images/aggregators/getactivelondon.png'].join('/'),
                description: 'Get Active London is in its live beta testing phase, but already receives 100s of visits a week from people looking for ways to be more active',
                href: ['https://beta.getactivelondon.com', getActivePath].join('')
              },
              GetActiveEssex: {
                name: 'Get Active Essex',
                img: [SERVICE_LOCATION, 'images/aggregators/getactiveessex.png'].join('/'),
                description: 'Get Active Essex is in its live beta testing phase, but already receives 100s of visits a week from people looking for ways to be more active',
                href: ['https://www.getactiveessex.com', getActivePath].join('')
              },
              GirlsMove: {
                name: 'Girls Move',
                img: [SERVICE_LOCATION, 'images/aggregators/girlsmovelondon.png'].join('/'),
                description: 'The girls only physical activity finder for London',
                href: ['https://girlsmove.london', getActivePath].join('')
              },
              GetActiveHampshire: {
                name: 'Get Active Hampshire & Isle of Wight',
                img: [SERVICE_LOCATION, 'images/aggregators/getactivehampshire.png'].join('/'),
                description: 'Get Active Hampshire is in its live beta testing phase, but already receives 100s of visits a week from people looking for ways to be more active',
                href: ['https://www.getactivehampshire.com', getActivePath].join('')
              }
            };
            let aggregators = [];
            const regions = [
              { name: 'GetActiveLondon', lng: -.1278, lat: 51.5074, radius: 35.4 },
              { name: 'GetActiveEssex', lng: .4691, lat: 51.7343, radius: 38 },
              { name: 'GetActiveHampshire', lng: -1.2997, lat: 51.02721, radius: 50 }
            ];
            if (locationData) {
              const { lat, lng } = locationData;
              if (lat && lng) {
                const matches = regions.map(region => {
                  const distance = getDistanceFromLatLonInKm(lat, lng, region.lat, region.lng);
                  return { match: region.radius / distance, name: region.name };
                }).sort((a, b) => b.match - a.match).filter(region => region.match >= .9);
                aggregators = aggregators.concat(matches.map(region => region.name));
              }
            }
            if (genderRestriction) {
              if (aggregators.some(agg => agg === 'GetActiveLondon') && genderRestriction === 'female') {
                aggregators.push('GirlsMove');
              }
            }
            return aggregators.map(name => info[name]);
          },
          sortedSchedule() {
            if (this.schedule && this.schedule.length) {
              return sortSchedule(this.schedule);
            }
            return [];
          },
          info() {
            const { Organizer } = this;
            let attr = name => this[name];
            let location = { address: this.location, data: this.locationData };
            if (Organizer && Organizer.data) {
              attr = name => Organizer.data[name] || this[name];
              if (Organizer.data.location) {
                location = {
                  address: Organizer.data.location.address || location.address,
                  data: Object.keys(Organizer.data.location.data).length ? Organizer.data.location.data : location.data
                };
              }
            }
            return {
              contact: {
                name: attr('contactName'),
                phone: attr('contactPhone'),
                email: attr('contactEmail')
              },
              social: {
                website: attr('socialWebsite'),
                facebook: attr('socialFacebook'),
                instagram: attr('socialInstagram'),
                hashtag: attr('socialHashtag'),
                twitter: attr('socialTwitter')
              },
              location
            };
          }
        },
        instanceMethods: {
          canPublish() {
            const session = this;
            const required = {
              title: { tab: 'description', pretty: 'Session Title' },
              OrganizerUuid: { tab: 'description', pretty: 'Organiser Name' },
              description: { tab: 'description', pretty: 'Session Description' },
              leader: { tab: 'additional', pretty: 'Leader' }
            };
            const requiredInfo = {
              'location.address': { tab: 'location', pretty: 'Address' }
            };
            const errors = [];
            const missingFields = Object.keys(required).filter(key => !session[key]).map(key => required[key]);
            if (missingFields.length) {
              errors.push(`Please enter a ${missingFields
                .map((field, key) => `${key && key + 1 === missingFields.length ? 'and ' : ''}<a data-tab="${field.tab}" data-field="${field.pretty}">${field.pretty}</a>`)
                .join(', ')}`);
            }
            const missingInfo = Object.keys(requiredInfo).map(key => key.split('.')).filter(([k1, k2]) => !(session.info[k1] && session.info[k1][k2])).map(keys => requiredInfo[keys.join('.')]);
            if (missingInfo.length) {
              errors.push(`Please enter a ${missingInfo
                .map((field, key) => `${key && key + 1 === missingInfo.length ? 'and ' : ''}<a data-tab="${field.tab}" data-field="${field.pretty}">${field.pretty}</a>`)
                .join(', ')}`);
            }
            if (session.Activities && !session.Activities.length) {
              errors.push('You need to add an <a data-tab="description" data-field="Activity Type">activity type</a>');
            }
            const organizerHasFlag = flag => session.Organizer && session.Organizer.data && session.Organizer.data[flag] && session.Organizer.data[flag] !== 'false';
            if (!organizerHasFlag('noContact')) {
              if (!['email', 'phone'].some(key => session.info.contact[key])) {
                errors.push('You must add at least one method of <a data-tab="contact" data-field="Contact">contact</a>');
              }
            }
            if (!organizerHasFlag('noSchedule')) {
              if (!session.sortedSchedule.length) {
                errors.push('You must add a <a data-tab="schedule" data-field="schedule">schedule</a>');
              } else if (session.sortedSchedule.some(slot => slot.hasOccurred)) {
                errors.push('Some of your <a data-tab="schedule" data-field="schedule">schedule</a> is out of date');
              } else if (!session.schedule.every(slot => slot.startDate && slot.startTime && slot.endTime)) {
                errors.push('You must complete <a data-tab="schedule" data-field="schedule">schedule</a> information');
              }
            }
            if (!organizerHasFlag('noPricing')) {
              if (session.pricing && session.pricing.prices && session.pricing.prices.length) {
                if (!session.pricing.prices.every(band => band.price)) {
                  errors.push('You need to complete <a data-tab="pricing" data-field="pricing">pricing</a> information');
                }
              }
            }
            if (errors.length) throw new Error(`<b>We can't publish this yet!</b> ${errors.join('. ')}`);
            return true;
          },
          getOwners() {
            return [this.owner].concat(this.Organizer && this.Organizer.members ? this.Organizer.members.map(user => user.user_id) : []);
          },
          getActions(models, req) {
            const actions = [];
            const user = req.user ? req.user.sub : null;
            const isOwner = user && this.getOwners().some(id => id === user);
            actions.push('message');
            if ((isOwner && this.state !== 'deleted') || this.state === 'published') actions.push('view');
            if (isOwner) {
              if (this.state === 'published') {
                actions.push('unpublish');
                if (this.sortedSchedule.some(slot => slot.hasOccurred)) {
                  actions.push('updateMySchedule');
                }
              } else {
                actions.push('edit');
                actions.push('publish');
                actions.push('setActivitiesAction');
              }
              actions.push('duplicate');
              actions.push('delete');
            } else if (!req.isAdmin) {
              actions.push('trackView');
            }
            if (req.isAdmin) {
              if (this.state === 'published') actions.push('touch');
            }
            return actions;
          },
          touch() {
            this.changed('updatedAt', true);
            return this.update({ updatedAt: new Date() }, { returning: true }).then(instance => ({ message: 'Session re-published', messageType: 'success', instance }));
          },
          publish() {
            return this.update({ state: 'published' }, { returning: true }).then(instance => ({ message: 'Your session has been published!', messageType: 'success', redirect: instance.href, instance }));
          },
          unpublish() {
            return this.update({ state: 'unpublished' }, { returning: true }).then(instance => ({ message: 'Your session has been unpublished!', messageType: 'warn', redirect: `${instance.href}/edit`, instance }));
          },
          updateMySchedule() {
            const { sortedSchedule } = this;
            const incDate = (date, inc) => new Date(date.setDate(date.getDate() + inc));
            const now = Date.now();
            const diffWeeks = sortedSchedule.filter(slot => slot.hasOccurred).map(({ start }) => now - start.getTime()).map(ms => ms / (1000 * 60 * 60 * 24 * 7)).map(Math.ceil);
            const maxDiff = Math.max.apply(undefined, diffWeeks) || 1;
            const newSchedule = sortedSchedule.map(({ start, end }) => ({ start: incDate(start, maxDiff * 7), end: incDate(end, maxDiff * 7) })).map(({ start, end }) => ({ startDate: start.toISOString().substr(0, 10), startTime: start.toTimeString().substr(0, 8), endTime: end.toTimeString().substr(0, 8) }));
            return this.update({ schedule: newSchedule }, { returning: true }).then(instance => ({ message: 'Your session schedule has been updated (all dates now in the future)', redirect: this.href, instance }));
          },
          trackView() {
            const analytics = this.analytics || {};
            analytics.views = (analytics.views || 0) + 1;
            return this.update({ analytics }, { silent: true }).then(() => ({}));
          },
          delete() {
            return (this.state === 'draft' ? this.destroy() : this.update({ state: 'deleted' })).then(() => ({ message: 'Deletion successful!' }));
          },
          duplicate(req) {
            const data = this.dataValues;
            delete data.uuid;
            if (req.body && req.body.title) data.title = req.body.title;
            return req.Model.create(data).then(instance => ({ instance, message: 'Session duplicated!', redirect: instance.href }));
          },
          message(req, models) {
            const { name, email, message } = req.body;
            const session = this;
            const missingFields = ['name', 'email', 'message'].filter(key => !req.body[key]);
            if (missingFields.length) return Promise.reject({ instance: this, message: `Incomplete form (${missingFields.join(', ')})` });
            const nextDate = session.sortedSchedule.length ? parseSchedule(session.sortedSchedule[0]) : false;
            return models.Threads.create({ originEmail: email, metadata: { SessionUuid: session.uuid } })
              .then(thread => sendEmail(`${name} has a question about ${session.title}`, session.info.contact.email, `
                <div class="message">
                  ${getStyledElement('messageSrc', 'Message from Open Sessions user')}
                  <div class="msgBody">${message}</div>
                  <div class="from">${name}</div>
                </div>
                <br />
                ${getStyledElement('session', `
                  <div style="padding:1em;">
                    <img src="${session.image}" />
                    <h1><a href="${session.absoluteURL}">${session.title}</a></h1>
                    <table style="text-align: center;"><tr>
                      <td>
                        <img src="${SERVICE_LOCATION}/images/map-pin.png" style="max-height: 2em;" />
                        <p>${session.location.replace(/,/, '<br>')}</p>
                      </td>
                      <td>
                        <img src="${SERVICE_LOCATION}/images/calendar.png" style="max-height: 2em;" />
                        <p>${nextDate ? `Next occuring: <br />${nextDate.date} <b>at ${nextDate.time}</b>` : 'No upcoming sessions'}</p>
                      </td>
                    </tr></table>
                  </div>
                  ${getStyledElement('aggSrcContainer', getStyledElement('aggSrcImg', '', { style: { 'background-image': `url(${SERVICE_LOCATION}/images/open-sessions.png)` } }))}
                `, { class: 'session', style: 'padding: 0' })}
                ${getStyledElement('sessionLink', getStyledElement('sessionLinkA', 'View or edit your session on Open Sessions', { href: session.absoluteURL }, 'a'), {}, 'p')}
              `, { substitutions: { '-title-': `Reply to ${name} by replying to this email`, '-signoffClass-': 'hide' }, replyTo: `${thread.uuid}@${EMAILS_INBOUND_URL}`, bcc: SERVICE_EMAIL_ADMIN }))
              .then({ message: `Message sent! Replies will be sent to ${email}` });
          },
          setActivitiesAction(req) {
            let { uuids } = req.body;
            uuids = uuids.filter(uuid => uuid !== null).map(uuid => (typeof uuid === 'object' ? uuid.uuid : uuid));
            return this.setActivities(uuids.length ? uuids : null).then(() => ({ uuids }));
          }
        },
        classMethods: {
          getQuery(query, models, user, isAdmin) {
            query.include = [models.Organizer, { model: models.Activity, through: models.SessionActivity }];
            if (query.where) {
              if (query.where.activityId) {
                query.where = [`"Activities"."uuid" = '${query.where.activityId}'`];
              }
              if (query.where.activity) {
                query.where = [`"Activities"."name" = '${query.where.activity}'`];
              }
            }
            if (!query.order) query.order = [['updatedAt', 'ASC']];
            let viewPermissions = { state: 'published' };
            if (isAdmin) {
              viewPermissions = { state: { $not: 'deleted' } };
            } else if (user) {
              viewPermissions = {
                $or: [
                  { state: { $not: 'deleted' }, owner: user },
                  { state: 'published' }
                ]
              };
            }
            query.where = query.where ? { $and: [query.where, viewPermissions] } : viewPermissions;
            return query;
          },
          queryParse(query) {
            if (query.state) query.state = query.state.split(',');
            return query;
          },
          getPrototype(models, user) {
            const prototype = {};
            if (user) {
              return models.Organizer.findOne({ where: { owner: user }, order: ['updatedAt'] }).then(organizer => {
                prototype.OrganizerUuid = organizer.uuid;
                return prototype;
              }).catch(() => prototype);
            }
            return Promise.resolve(prototype);
          },
          makeAssociations(models) {
            models.Session.belongsTo(models.Organizer);
            models.Session.belongsToMany(models.Activity, { through: models.SessionActivity });
          }
        },
        hooks: {
          beforeUpdate(instance) {
            if (instance.changed('state')) {
              if (instance.state === 'published') {
                try {
                  instance.canPublish();
                } catch (err) {
                  throw err;
                }
                if (instance.previous('state') === 'draft') {
                  sendPublishedEmail(instance, 'Your session was published');
                  const { title, socialTwitter, socialHashtag, Organizer, absoluteURL } = instance;
                  if (socialTwitter) sendTweet([title, 'was just published', socialTwitter ? `by ${socialTwitter} (${Organizer.name})!` : `by ${Organizer.name}!`, socialHashtag, absoluteURL].filter(t => t).join(' '));
                } else if (instance.previous('state') === 'unpublished') {
                  sendPublishedEmail(instance, 'Your session was updated');
                }
              } else if (instance.state === 'draft') {
                if (instance.previous('state') === 'published') instance.state = 'unpublished';
              }
            }
            if (instance.socialFacebook && instance.socialFacebook.match(' ')) {
              instance.socialFacebook = `https://facebook.com/search/pages/?q=${instance.socialFacebook.replace(' ', '+')}`;
            }
            Object.keys(prefixTypes).filter(type => instance.changed(type) && instance[type]).forEach(type => {
              const val = instance[type];
              const prefixes = prefixTypes[type];
              if (!prefixes.some(prefix => val.indexOf(prefix) === 0)) instance[type] = `${prefixes[0]}${val}`;
            });
          }
        }
      }
    }
  }
});
