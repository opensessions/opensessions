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
            query.where = {  };
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
      _options: {
        getterMethods: {
          href() {
            return `/${this.Model.name.toLowerCase()}/${this.uuid}`;
          }
        },
        instanceMethods: {
          canPublish() {
            const session = this;
            const requiredFields = ['title', 'OrganizerUuid', 'description', 'leader', 'location'];
            const prettyNames = { OrganizerUuid: 'organizer', startDate: 'start date', startTime: 'start time' };
            const errors = [];
            const missingFields = requiredFields.filter(field => !session[field]).map(field => (field in prettyNames ? prettyNames[field] : field));
            if (missingFields.length) errors.push(`missing fields (${missingFields.join(', ')})`);
            if (!(session.schedule && session.schedule.length >= 1)) errors.push('you must add a schedule');
            if (errors.length) throw new Error(`Can't publish yet: ${errors.join('; ')}`);
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
