const { sendEmail } = require('../server/middlewares/email');
const { SERVICE_LOCATION, SERVICE_EMAIL, EMAILS_INBOUND_URL, GOOGLE_MAPS_API_STATICIMAGES_KEY } = process.env;
const { parseSchedule, nextSchedule } = require('../utils/calendar');

function getStaticMapUrl(center, zoom, size, marker) {
  const [lat, lng] = center;
  const opts = {
    center: center.join(','),
    zoom,
    size,
    markers: Object.keys(marker).map(key => [key, marker[key]].join(':')).concat([lat, lng].join(',')).join('%7C'),
    key: GOOGLE_MAPS_API_STATICIMAGES_KEY
  };
  return `https://maps.googleapis.com/maps/api/staticmap?${Object.keys(opts).map(key => [key, opts[key]].join('=')).join('&')}`;
}

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
    /* Messages: {
      from: DataTypes.STRING(256),
      to: DataTypes.STRING(256),
      body: DataTypes.STRING(4096),
      metadata: DataTypes.JSON,
      _options: {
        classMethods: {
          makeAssociations(models) {
            models.Messages.hasOne(models.Messages, { as: 'previous' });
          }
        },
        instanceMethods: {
          reply(req) {
            const email = parseEmailRequest(req);
            return this.models.Message.create({
              to: this.from,
              from: this.to,
              body: email.body,
              previous: this
            });
          },
          view(req) {
            const { user } = req;
            if (user) {
              this.metadata = { ...this.metadata, seen: true };
              return this.save();
            }
            return Promise.reject('Must be user');
          },
          getActions(models, req) {
            const actions = [];
            const email = parseEmailRequest(req);
            if (email.from === this.from && email.uuid === this.uuid) {
              actions.push('view');
              actions.push('reply');
            }
            return actions;
          }
        },
        hooks: {
          afterCreate(instance) {
            const { SERVICE_LOCATION } = process.env;
            const { session } = this.metadata;
            return sendEmail(`${instance.from} has submitted a question on Open Sessions`, SERVICE_EMAIL, `
              <p>Hey, ${session.contactName}! A message has been sent on <a href="${SERVICE_LOCATION}">Open Sessions</a>.</p>
              <p>Here's the message:</p>
              <p style="padding:.5em;white-space:pre;background:#FFF;">From: ${this.from}</p>
              <p style="padding:.5em;white-space:pre;background:#FFF;">${this.body}</p>
            `, { substitutions: { '-title-': 'Organizer communication' } });
          }
        }
      }
    }, */
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
        instanceMethods: {
          delete() {
            return this.destroy();
          },
          getActions(models, req) {
            const actions = [];
            // if (user && user === this.owner && this.get('SessionsCount') === '0') {
            actions.push('view');
            if (req.user) {
              // if (user === this.owner) actions.push('delete');
              if (req.isAdmin) actions.push('delete');
            }
            return actions;
          }
        },
        hooks: {
          afterCreate(activity) {
            return sendEmail('Someone has added a new activity on Open Sessions', SERVICE_EMAIL, `
              <p>A new activity has been created on Open Sessions.</p>
              <p>It's called ${activity.name} and the session it is attached to may still be in draft mode.</p>
            `, { substitutions: { '-title-': 'New activity', '-titleClass-': 'large' } });
          }
        },
        classMethods: {
          getQuery(query) {
            if (!query) query = {};
            // query.attributes = ['uuid', 'name', 'owner', 'Activity.createdAt', 'Activity.updatedAt'];
            // query.include = [{ model: models.Session, through: models.SessionActivity, required: false }];
            return query;
          },
          makeAssociations(models) {
            models.Activity.belongsToMany(models.Session, { through: models.SessionActivity });
          }
        }
      }
    },
    Organizer: {
      owner: DataTypes.STRING,
      name: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: true
        }
      },
      image: DataTypes.STRING(512),
      members: DataTypes.JSON,
      _options: {
        getterMethods: {
          href() {
            return `/${this.Model.name.toLowerCase()}/${this.uuid}`;
          },
        },
        instanceMethods: {
          delete() {
            return this.destroy();
          },
          addMember(req, models, authClient) {
            console.log('addMember', this, req.body);
            return authClient.getUsers({ q: `email:"${req.body.email}"` })
              .then(users => users[0])
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
            const sessionQuery = models.Session.getQuery({}, models, user);
            query.include = [{
              model: models.Session,
              where: sessionQuery.where,
              required: false
            }];
            return query;
          },
          makeAssociations(models) {
            models.Organizer.hasMany(models.Session);
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
      quantity: DataTypes.INTEGER,
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
            const { locationData, location, genderRestriction } = this;
            const getActivePath = `/results/list?activity=&location=${location}&lat=${locationData ? locationData.lat : ''}&lng=${locationData ? locationData.lng : ''}&radius=4&sortBy=distance`;
            const info = {
              GetActiveLondon: {
                name: 'Get Active London',
                img: [SERVICE_LOCATION, 'images/aggregators/getactivelondon.png'].join('/'),
                description: 'The Get Active physical activity finder for the London area',
                href: ['https://beta.getactivelondon.com', getActivePath].join('')
              },
              GetActiveEssex: {
                name: 'Get Active Essex',
                img: [SERVICE_LOCATION, 'images/aggregators/getactiveessex.png'].join('/'),
                description: 'The Get Active physical activity finder for the Essex area',
                href: ['https://www.getactiveessex.com', getActivePath].join('')
              },
              GirlsMove: {
                name: 'Girls Move',
                img: [SERVICE_LOCATION, 'images/aggregators/girlsmovelondon.png'].join('/'),
                description: 'The girls only physical activity finder for London',
                href: ['https://girlsmove.london', getActivePath].join('')
              }
            };
            let aggregators = [];
            const regions = [
              { name: 'GetActiveLondon', lng: -.1278, lat: 51.5074, radius: 35.4 },
              { name: 'GetActiveEssex', lng: .4691, lat: 51.7343, radius: 38 }
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
              if (aggregators.indexOf('GetActiveLondon') !== -1 && genderRestriction === 'female') {
                aggregators.push('GirlsMove');
              }
            }
            return aggregators.map(name => info[name]);
          }
        },
        instanceMethods: {
          canPublish() {
            const session = this;
            const required = {
              title: { tab: 'description', pretty: 'Session Title' },
              OrganizerUuid: { tab: 'description', pretty: 'Organiser Name' },
              description: { tab: 'description', pretty: 'Session Description' },
              leader: { tab: 'additional', pretty: 'Leader' },
              location: { tab: 'location', pretty: 'Address' },
              contactName: { tab: 'contact', pretty: 'Full name' },
              contactEmail: { tab: 'contact', pretty: 'Email address' }
            };
            const errors = [];
            const missingFields = Object.keys(required).filter(key => !session[key]).map(key => required[key]);
            if (missingFields.length) {
              errors.push(`Please enter a ${missingFields
                .map((field, key) => `${key && key + 1 === missingFields.length ? 'and ' : ''}<a data-tab="${field.tab}" data-field="${field.pretty}">${field.pretty}</a>`)
                .join(', ')}`);
            }
            if (session.Activities && !session.Activities.length) {
              errors.push('You need to add an <a data-tab="description" data-field="Activity Type">activity type</a>');
            }
            if (session.schedule && session.schedule.length) {
              if (!session.schedule.every(slot => slot.startDate && slot.startTime && slot.endTime)) {
                errors.push('You must complete <a data-tab="schedule" data-field="schedule">schedule</a> information');
              }
            } else {
              errors.push('You must add a <a data-tab="schedule" data-field="schedule">schedule</a>');
            }
            if (session.pricing && session.pricing.prices && session.pricing.prices.length) {
              if (!session.pricing.prices.every(band => band.price)) {
                errors.push('You need to complete <a data-tab="pricing" data-field="pricing">pricing</a> information');
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
              actions.push('edit');
              actions.push('duplicate');
              actions.push('delete');
              actions.push('setActivitiesAction');
            }
            return actions;
          },
          sendPublishedEmail(subject) {
            const session = this;
            const { contactEmail, pricing, schedule } = session;
            const nextSlot = nextSchedule(schedule);
            const parsedSlot = nextSlot ? parseSchedule(nextSlot) : false;
            if (contactEmail) {
              const prices = pricing && pricing.prices ? pricing.prices.map(band => parseFloat(band.price)).sort((a, b) => (a > b ? 1 : -1)) : [0];
              const { lat, lng } = session.locationData;
              sendEmail(subject, session.contactEmail, `
                <p>Dear ${session.contactName || 'Open Sessions user'},</p>
                <p>Great news!</p>
                <p>You have successfully listed your session on Open Sessions.</p>
                <div class="session compact">
                  <h1>${session.title}</h1>
                  <table>
                    <tr class="images">
                      <td>${session.image ? `<img src="${session.image}" />` : `<img src="${SERVICE_LOCATION}/images/placeholder.png" />`}</td>
                      <td><img src="${getStaticMapUrl([lat, lng], 13, '360x240', { color: 'blue', label: 'S', icon: `${SERVICE_LOCATION}/images/map-pin-active.png` })}" /></td>
                    </tr>
                    <tr>
                      <td style="border-right:1px solid #EEE;">
                        <img src="${SERVICE_LOCATION}/images/calendar.png" width="42" height="42" />
                        <p class="label">Next session:</p>
                        <p>${parsedSlot ? `${parsedSlot.date} <b>at ${parsedSlot.time}</b>` : 'No upcoming session'}</p>
                      </td>
                      <td style="border-left:1px solid #EEE;">
                        <p class="label">Address:</p>
                        <p>${session.location.split(',').join('<br />')}</p>
                        <p class="label">Price:</p>
                        <p>from <b>${prices[0] ? `£${prices[0].toFixed(2)}` : '<span class="is-free">FREE</span>'}</b></p>
                      </td>
                    </tr>
                  </table>
                  <a class="view-link" href="${session.absoluteURL}">View or edit your session on Open Sessions</a>
                </div>
                <h1>Where does my session appear?</h1>
                <ol class="aggregators">
                  ${session.aggregators.map(aggregator => `<li>
                    <img src="${aggregator.img}" />
                    <div class="info">
                      <h2>${aggregator.name}</h2>
                      <p>${aggregator.description}</p>
                      <a href="${aggregator.href}">View your session on ${aggregator.name}</a>
                    </div>
                  </li>`).join('')}
                  <li class="meta-info">
                    ${session.aggregators.length ? `Your session appears on ${session.aggregators.length} activity finders` : 'We couldn\'t work out where your session appears yet'}
                  </li>
                </ol>
                <h1>What next?</h1>
                <p>You can update your session at any time - just go to the edit page, update and click publish again. Share it with your friends and social networks to help people find your sessions.</p>
              `, { substitutions: { '-title-': 'Your session was published!', '-titleClass-': 'large' } });
            }
          },
          delete() {
            return this.state === 'draft' ? this.destroy() : this.update({ state: 'deleted' }).then(() => Promise.resolve({ message: 'delete success' }));
          },
          duplicate(req) {
            const data = this.dataValues;
            delete data.uuid;
            data.title = data.title.match(/\(duplicated\)$/g) ? data.title : `${data.title} (duplicated)`;
            return req.Model.create(data).then(instance => ({ instance }));
          },
          message(req, models) {
            const message = req.body;
            const session = this;
            if (['name', 'from', 'body'].some(name => !message[name])) return Promise.reject('Incomplete form');
            const nextSlot = nextSchedule(session.schedule);
            const nextDate = nextSlot ? parseSchedule(nextSlot) : false;
            return models.Threads.create({ originEmail: message.from, metadata: { SessionUuid: session.uuid } })
              .then(thread => sendEmail(`Open Sessions - New question from ${message.name}`, session.contactEmail, `
                <div class="message">
                  <div class="msgBody">${message.body}</div>
                  <div class="from">${message.name}</div>
                </div>
                <br />
                <div class="session">
                  <img src="${session.image}" />
                  <h1><a href="${session.absoluteURL}">${session.title}</a></h1>
                  <table><tr>
                    <td>
                      <img src="${SERVICE_LOCATION}/images/map-pin.png" />
                      <p>${session.location.replace(/,/, '<br>')}</p>
                    </td>
                    <td>
                      <img src="${SERVICE_LOCATION}/images/calendar.png" />
                      <p>${nextDate ? `Next occuring: <br />${nextDate.date} <b>at ${nextDate.time}</b>` : 'No upcoming sessions'}</p>
                    </td>
                  </tr></table>
                </div>
                <p class="session-link"><a href="${session.absoluteURL}">View or edit your session on Open Sessions</a></p>
              `, { substitutions: { '-title-': `Reply to ${message.name} by replying to this email`, '-signoffClass-': 'hide' }, replyTo: `${thread.uuid}@${EMAILS_INBOUND_URL}`, bcc: SERVICE_EMAIL }));
          },
          setActivitiesAction(req) {
            let { uuids } = req.body;
            uuids = uuids.filter(uuid => uuid !== null).map(uuid => (typeof uuid === 'object' ? uuid.uuid : uuid));
            return this.setActivities(uuids.length ? uuids : null).then(() => ({ uuids }));
          }
        },
        classMethods: {
          getQuery(query, models, user) {
            query.include = [models.Organizer, { model: models.Activity, through: models.SessionActivity }];
            query.where = { $and: query.where ? [query.where] : [] };
            if (user) {
              query.where.$and.push({
                $or: [
                  { state: { $not: 'deleted' }, owner: user },
                  { state: 'published' }
                ]
              });
            } else {
              query.where.$and.push({ state: 'published' });
            }
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
                  instance.sendPublishedEmail('Your session has been published!');
                } else if (instance.previous('state') === 'unpublished') {
                  instance.sendPublishedEmail('Your session has been updated!');
                }
              } else if (instance.state === 'draft') {
                if (instance.previous('state') === 'published') instance.state = 'unpublished';
              }
            }
            const prefixTypes = {
              socialWebsite: ['http://', 'https://'],
              socialFacebook: ['https://facebook.com/'],
              socialInstagram: ['@'],
              socialTwitter: ['@'],
              socialHashtag: ['#']
            };
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
