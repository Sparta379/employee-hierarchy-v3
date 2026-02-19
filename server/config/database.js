require('dotenv').config({ path: require('path').join(__dirname, '../.env') });
const { Sequelize } = require('sequelize');

let sequelize;
const dbUrl = process.env.DATABASE_URL || '';

if (process.env.NODE_ENV === 'production' || dbUrl.includes('neon.tech')) {
  // setup for neon/vercel production
  sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    dialectModule: require('pg'), // fix: explicitly tell sequelize to use pg
    protocol: 'postgres',
    logging: false,
    dialectOptions: {
      ssl: {
        require: true,
        rejectUnauthorized: false
      }
    }
  });
} else {
  // local dev setup
  sequelize = new Sequelize(dbUrl, {
    dialect: 'postgres',
    dialectModule: require('pg'),
    logging: false
  });
}

module.exports = sequelize;
