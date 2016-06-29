'use strict';
const sequelize = require('sequelize');
const dotenv = require('dotenv');
dotenv.load();

class PostgresStorage {
  constructor() {
    const isDev = process.env.NODE_ENV !== 'production';
    if (isDev) {
      this.DATABASE_URL = `postgres://${process.env.DATABASE_USER}:${process.env.DATABASE_PASS}@${process.env.DATABASE_HOST}:5432/${process.env.DATABASE_NAME}`;
      this.dropModels();
    } else {
      this.DATABASE_URL = process.env.DATABASE_URL;
      this.syncModels();
    }
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
      name: sequelize.STRING,
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
      price: sequelize.FLOAT(2),
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
