'use strict';
const sequelize = require('sequelize');
const dotenv = require('dotenv');

dotenv.config({ silent: true });
dotenv.load();

class PostgresStorage {
  constructor() {
    this.DATABASE_URL = process.env.DATABASE_URL;
    this.syncModels();
  }
  dropModels() {
    const db = this.getInstance();
    return db.query(`drop owned by ${process.env.DATABASE_USER}`).then(() => db.sync());
  }
  syncModels() {
    const db = this.getInstance();
    return db.sync();
  }
  createModels(db) {
    const uuid = {
      type: sequelize.UUID,
      defaultValue: sequelize.UUIDV1,
      primaryKey: true,
    };
    db.define('Sport', {
      // meta
      uuid,
      name: sequelize.STRING,
    });
    const Organizer = db.define('Organizer', {
      // meta
      uuid,
      owner: sequelize.STRING,
      name: {
        type: sequelize.STRING,
        validate: {
          notEmpty: true
        }
      },
    }, {
      getterMethods: {
        href() {
          return `/organizer/${this.uuid}`;
        },
        displayName() {
          return this.name;
        },
      },
      classMethods: {
        getQuery(req) {
          return {
            where: { owner: req.user.user_id },
            include: [db.models.Session],
          };
        },
      },
    });
    const Session = db.define('Session', {
      // meta
      uuid,
      state: {
        type: sequelize.STRING,
        defaultValue: 'draft',
        validation: {
          isIn: ['draft', 'published', 'deleted']
        }
      },
      owner: sequelize.STRING,
      // description
      title: sequelize.STRING(50),
      description: sequelize.STRING(2048),
      activityType: sequelize.STRING,
      // description
      preparation: sequelize.STRING(2048),
      leader: sequelize.STRING,
      hasCoaching: sequelize.BOOLEAN,
      // location
      location: sequelize.STRING,
      locationData: sequelize.JSON,
      meetingPoint: sequelize.STRING,
      // price
      attendanceType: sequelize.STRING,
      price: sequelize.FLOAT(2),
      quantity: sequelize.INTEGER,
      // restriction
      genderRestriction: {
        type: sequelize.STRING(16),
        defaultValue: 'mixed',
        validation: {
          isIn: ['mixed', 'male', 'female']
        }
      },
      minAgeRestriction: sequelize.INTEGER,
      maxAgeRestriction: sequelize.INTEGER,
      // contact
      contactPhone: sequelize.STRING,
      contactEmail: sequelize.STRING,
      // schedule details
      endTime: sequelize.TIME,
      startDate: sequelize.DATE,
      startTime: sequelize.TIME,
    }, {
      getterMethods: {
        href() {
          return `/session/${this.uuid}`;
        },
        displayName() {
          return `${this.title || 'Untitled'}${this.state === 'draft' ? ' (draft)' : ''}`;
        },
      },
      instanceMethods: {
        canPublish() {
          const session = this;
          const requiredFields = ['title', 'description', 'OrganizerUuid', 'startDate'];
          let canPublish = true;
          requiredFields.forEach((field) => {
            if (!session[field]) {
              canPublish = false;
            }
          });
          return canPublish;
        }
      },
      hooks: {
        beforeValidate(instance) {
          if (instance.state === 'published') {
            if (!instance.canPublish()) {
              instance.state = 'draft';
              console.log('INVALID SESSION PUBLISH ATTEMPT, RESET TO DRAFT');
            }
          }
        }
      }
    });
    Session.belongsTo(Organizer);
    Organizer.hasMany(Session);
    return db;
  }
  getInstance() {
    if (!this.instance) {
      const DATABASE_URL = this.DATABASE_URL;
      const instance = new sequelize(DATABASE_URL, {
        dialect: 'postgres',
        logging: false,
        omitNull: true,
      });
      this.instance = this.createModels(instance);
    }
    return this.instance;
  }
}

module.exports = PostgresStorage;
