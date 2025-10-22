// server/config/database.js
const { Sequelize } = require('sequelize');
const path = require('path');
require('dotenv').config({ path: path.resolve(__dirname, '../.env') });

const DIALECT = process.env.DB_DIALECT || 'sqlite';

let sequelize;
if (DIALECT === 'sqlite') {
  const storage = process.env.DB_STORAGE || path.resolve(__dirname, '../../database/restaurant.db');
  sequelize = new Sequelize({ dialect: 'sqlite', storage, logging: false });
} else if (DIALECT === 'postgres') {
  const url =
    process.env.DATABASE_URL ||
    `postgres://${process.env.DB_USER}:${process.env.DB_PASS}@${process.env.DB_HOST || 'localhost'}:${process.env.DB_PORT || 5432}/${process.env.DB_NAME}`;
  sequelize = new Sequelize(url, { dialect: 'postgres', logging: false });
} else {
  throw new Error(`DB_DIALECT no soportado: ${DIALECT}`);
}

module.exports = { sequelize };
