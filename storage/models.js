module.exports = (DataTypes) => ({
  tablePrototype: {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true,
    }
  },
  tables: {
    Activity: {
      owner: DataTypes.STRING,
      name: DataTypes.STRING,
      _options: {
        classMethods: {
          getQuery(query) {
            // query.where = { };
            return query;
          },
          makeAssociations(models) {
            models.Activity.hasMany(models.Session);
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
        classMethods: {
          getQuery(query, models, user) {
            query.include = [{
              model: models.Session,
              where: { state: { $in: user ? ['published', 'draft', 'unpublished'] : ['published'] } },
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
      activityType: DataTypes.STRING,
      preparation: DataTypes.STRING(2048),
      leader: DataTypes.STRING,
      image: DataTypes.STRING(512),
      hasCoaching: DataTypes.BOOLEAN,
      location: DataTypes.STRING,
      locationData: DataTypes.JSON,
      meetingPoint: DataTypes.STRING,
      attendanceType: DataTypes.STRING,
      price: {
        type: DataTypes.FLOAT(2),
        validate: { min: 0 }
      },
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
      endTime: DataTypes.TIME,
      startDate: DataTypes.DATE,
      startTime: DataTypes.TIME,
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
            const missingFields = Object.keys(required).filter(field => !session[field]);
            if (missingFields.length) errors.push(`Please enter a ${missingFields.map(field => `<a data-tab="${required[field].tab}" data-field="${field}">${required[field].pretty || field}</a>`).join(', ')}`);
            if (!(session.schedule && session.schedule.length >= 1)) errors.push('You must add a <a data-tab="schedule">schedule</a>');
            if (errors.length) throw new Error(`We can't publish this yet! ${errors.join('; ')}`);
            return true;
          },
          setDeleted() {
            return this.state === 'draft' ? this.destroy() : this.update({ state: 'deleted' });
          }
        },
        classMethods: {
          getQuery(query, models, user) {
            query.include = [models.Organizer, models.Activity];
            if (!('where' in query)) query.where = {};
            query.where.state = user ? { $not: 'deleted' } : 'published';
            if ('owner' in query.where && query.where.owner !== user) {
              return Error('Must be logged in to search by owner');
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
            models.Session.belongsTo(models.Activity);
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
          }
        }
      }
    }
  }
});
