const { sendEmail } = require('../server/middlewares/email');
const { SERVICE_LOCATION, SERVICE_EMAIL, EMAILS_INBOUND_URL } = process.env;

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
            `, { substitutions: { '-title-': 'New activity' } });
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
            const user = req.user ? req.user.sub : null;
            if (user && user === this.owner && (!this.Sessions || this.Sessions.length === 0)) {
              actions.push('delete');
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
          region() {
            // figure out which Get Active location
            const { locationData } = this;
            const regions = [
              { name: 'London', lng: .1278, lat: 51.5074, radius: .5640 },
              { name: 'Essex', lng: .4691, lat: 51.7343, radius: .5 }
            ];
            let regionMatches;
            if (locationData) {
              const { lat, lng } = locationData;
              if (lat && lng) {
                regionMatches = regions.map(region => {
                  const distance = Math.sqrt(Math.pow(lat - region.lat, 2) + Math.pow(lng - region.lng, 2));
                  return { match: region.radius / distance, name: region.name };
                }).sort((a, b) => b.match - a.match);
                return regionMatches.filter(region => region.match >= .75).map(region => region.name);
              }
            }
            return undefined;
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
              location: { tab: 'location', pretty: 'Address' }
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
          getActions(models, req) {
            const actions = [];
            const user = req.user ? req.user.sub : null;
            actions.push('message');
            if (user && user === this.owner) {
              actions.push('edit');
              actions.push('duplicate');
              actions.push('delete');
              actions.push('setActivitiesAction');
            }
            return actions;
          },
          sendPublishedEmail() {
            const session = this;
            const nextSchedule = null;
            const aggregators = {
              GetActiveLondon: {
                name: 'Get Active London',
                img: ''
              },
              GetActiveEssex: {
                name: 'Get Active Essex',
                img: ''
              },
              GirlsMove: {
                name: 'Girls Move',
                img: ''
              }
            };
            if (session.contactEmail) {
              sendEmail('Your session has been published!', session.contactEmail, `
                <p>Dear ${session.contactName}</p>
                <p>Great news!</p>
                <p>You have successfully listed your session on Open Sessions.</p>
                <div class="session">
                  <h1>${session.title}</h1>
                  <table>
                    <tr>
                      <td><img src="${session.image}" /></td>
                      <td><a href=""><img src="${SERVICE_LOCATION}/images/fake-map.png" /></a></td>
                    </tr>
                    <tr>
                      <td>Next session: ${nextSchedule}</td>
                      <td><a href=""><img src="${SERVICE_LOCATION}/images/fake-map.png" /></a></td>
                    </tr>
                  </table>
                </div>
                <h1>Where does my session appear?</h1>
                <ol class="aggregators">
                  ${session.aggregators.map(name => aggregators[name]).map(aggregator => `<li>
                    <img src="${aggregator.img}" />
                    <div class="info">
                      <h2>${aggregator.name}</h2>
                      <p>${aggregator.description}</p>
                    </div>
                  </li>`)}
                  <li class="info">
                    Your session appears on ${session.aggregators.length} activity finders.
                  </li>
                </ol>
                <h1>What next?</h1>
                <p>Lorem ipsum dolor sit amet, vocent alienum cu vis, et vix justo detracto.</p>
              `, { substitutions: { '-title-': 'Your session was published!' } });
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
            return models.Threads.create({ originEmail: message.from, metadata: { SessionUuid: session.uuid } })
              .then(thread => sendEmail('Someone has submitted a question on Open Sessions', session.contactEmail, `
                <p>Hey, ${session.contactName}! A message has been sent on Open Sessions.</p>
                <p>Here's the message:</p>
                <p style="padding:.5em;white-space:pre;background:#FFF;">From: ${message.name}</p>
                <p style="padding:.5em;white-space:pre;background:#FFF;">${message.body}</p>
              `, { substitutions: { '-title-': 'Organizer communication' }, replyTo: `${thread.uuid}@${EMAILS_INBOUND_URL}`, bcc: SERVICE_EMAIL }));
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
              } else if (instance.state === 'draft') {
                if (instance.previous('state') === 'published') instance.state = 'unpublished';
              }
            }
            const socialPrepend = {
              socialWebsite: ['http://', 'https://'],
              socialFacebook: 'https://facebook.com/',
              socialInstagram: '@',
              socialTwitter: '@',
              socialHashtag: '#'
            };
            Object.keys(socialPrepend).filter(type => instance.changed(type) && instance[type]).forEach(type => {
              const val = instance[type];
              let prepend = socialPrepend[type];
              if (!(prepend instanceof Array)) prepend = [prepend];
              if (!(prepend.some(pre => val.indexOf(pre) === 0))) instance[type] = `${prepend[0]}${val}`;
            });
          }
        }
      }
    }
  }
});
