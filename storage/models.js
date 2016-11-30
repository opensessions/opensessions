const email = require('../server/middlewares/email');

const MULTI_ACTIVITY = true;

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
      _options: {
        makeAssociations(models) {
          models.SessionActivity.hasOne(models.Session);
          models.SessionActivity.hasOne(models.Activity);
        }
      }
    },
    Activity: {
      owner: DataTypes.STRING,
      name: {
        type: DataTypes.STRING,
        validate: {
          not: ['[£$%/\\!?:;,.]', '']
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
          getActions(models, user) {
            const actions = [];
            // if (user && user === this.owner && this.get('SessionsCount') === '0') {
            if (user && user === this.owner) {
              actions.push('delete');
            }
            return actions;
          }
        },
        hooks: {
          afterCreate(instance) {
            return email.sendEmail('Someone has added a new activity on Open Sessions', 'hello+activity@opensessions.io', `
              <p>A new activity has been created on Open Sessions.</p>
              <p>It's called ${instance.name} and the session it is attached to may still be in draft mode.</p>
            `, { '-title-': 'New activity' });
          }
        },
        classMethods: {
          getQuery(query, models) {
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
          getActions(models, user) {
            const actions = [];
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
          getActions(models, user) {
            const actions = [];
            actions.push('message');
            if (user && user === this.owner) {
              actions.push('edit');
              actions.push('duplicate');
              actions.push('delete');
              actions.push('setActivitiesAction');
            }
            return actions;
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
          message(req) {
            const message = req.body;
            if (['name', 'from', 'body'].filter(name => message[name]).length < 3) return Promise.reject('Incomplete form');
            return email.sendEmail('Someone has submitted a question on Open Sessions', 'hello+organizer@opensessions.io', `
              <p>Hey, ${this.contactName} &lt;${this.contactEmail}&gt;! A message has been sent on Open Sessions.</p>
              <p>Here's the message:</p>
              <p style="padding:.5em;white-space:pre;background:#FFF;">From: ${message.name} &lt;${message.from}&gt;</p>
              <p style="padding:.5em;white-space:pre;background:#FFF;">${message.body}</p>
            `, { '-title-': 'Organizer communication' });
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
            if (MULTI_ACTIVITY) {
              models.Session.belongsToMany(models.Activity, { through: models.SessionActivity });
            } else {
              models.Session.belongsTo(models.Activity);
            }
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
              if (prepend.map(pre => val.indexOf(pre)).indexOf(0) === -1) instance[type] = `${prepend[0]}${val}`;
            });
          }
        }
      }
    }
  }
});
