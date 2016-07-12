module.exports = (DataTypes) => ({
  tablePrototype: {
    uuid: {
      type: DataTypes.UUID,
      defaultValue: DataTypes.UUIDV1,
      primaryKey: true,
    }
  },
  tables: {
    Organizer: {
      owner: DataTypes.STRING,
      name: {
        type: DataTypes.STRING,
        validate: {
          notEmpty: true
        }
      },
      _options: {
        getterMethods: {
          href() {
            return `/${this.Model.name.toLowerCase()}/${this.uuid}`;
          },
          displayName() {
            return this.name;
          },
        }
      }
    },
    Session: {
      state: {
        type: DataTypes.STRING,
        defaultValue: 'draft',
        validation: {
          isIn: ['draft', 'published', 'unpublished', 'deleted']
        }
      },
      owner: DataTypes.STRING,
      title: DataTypes.STRING(50),
      description: DataTypes.STRING(2048),
      activityType: DataTypes.STRING,
      preparation: DataTypes.STRING(2048),
      leader: DataTypes.STRING,
      hasCoaching: DataTypes.BOOLEAN,
      location: DataTypes.STRING,
      locationData: DataTypes.JSON,
      meetingPoint: DataTypes.STRING,
      attendanceType: DataTypes.STRING,
      price: DataTypes.FLOAT(2),
      quantity: DataTypes.INTEGER,
      genderRestriction: {
        type: DataTypes.STRING(16),
        defaultValue: 'mixed',
        validation: {
          isIn: ['mixed', 'male', 'female']
        }
      },
      minAgeRestriction: DataTypes.INTEGER,
      maxAgeRestriction: DataTypes.INTEGER,
      contactPhone: DataTypes.STRING,
      contactEmail: DataTypes.STRING,
      endTime: DataTypes.TIME,
      startDate: DataTypes.DATE,
      startTime: DataTypes.TIME,
      _options: {
        getterMethods: {
          href() {
            return `/${this.Model.name.toLowerCase()}/${this.uuid}`;
          },
          displayName() {
            return `${this.title || 'Untitled'}${this.state === 'draft' ? ' (draft)' : ''}`;
          },
        },
        instanceMethods: {
          canPublish() {
            const session = this;
            const requiredFields = ['title', 'description', 'location', 'price', 'OrganizerUuid', 'startDate', 'startTime'];
            const errors = [];
            requiredFields.forEach((field) => {
              if (!session[field]) {
                errors.push(field);
              }
            });
            if (errors.length) throw new Error(`Missing fields: ${errors.join(', ')}`);
            return true;
          }
        },
        hooks: {
          beforeUpdate(instance) {
            if (instance.state === 'published') {
              try {
                instance.canPublish();
              } catch (err) {
                instance.state = 'draft';
                throw err;
              }
            }
          }
        }
      }
    }
  },
  associations: [
    {
      source: 'Session',
      type: 'belongsTo',
      target: 'Organizer'
    },
    {
      source: 'Organizer',
      type: 'hasMany',
      target: 'Session'
    }
  ]
});
