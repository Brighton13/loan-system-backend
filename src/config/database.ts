// import { Sequelize } from 'sequelize';
 import dotenv from 'dotenv';

 dotenv.config();

// const sequelize = new Sequelize({
//   host: process.env.DB_HOST || 'localhost',
//   port: parseInt(process.env.DB_PORT || '5432'),
//   database: process.env.DB_NAME || 'loan_management',
//   username: process.env.DB_USER || 'postgres',
//   password: process.env.DB_PASSWORD || 'root',
//   dialect: 'postgres',
//   logging: false,
//   pool: {
//     max: 10,
//     min: 0,
//     acquire: 30000,
//     idle: 10000,
//   },
// });

// export default sequelize;


// src/db.ts
import { Sequelize } from "sequelize";

declare global {
  // allow global 'var' in TS
  // eslint-disable-next-line no-var
  var __sequelize: Sequelize | undefined;
}

export const getSequelize = () => {
  if (!global.__sequelize) {
    if (!process.env.DATABASE_URL) {
      throw new Error("DATABASE_URL is not set");
    }

    global.__sequelize = new Sequelize(process.env.DATABASE_URL, {
      dialect: "postgres",
      protocol: "postgres",
      logging: false,
      pool: {
        // small pool for serverless
        max: 1,
        min: 0,
        idle: 0,
        acquire: 10000,
      },
      dialectOptions: {
        // enable if your provider requires SSL (most do)
        ssl:
          process.env.PGSSL === "true"
            ? { require: true, rejectUnauthorized: false }
            : undefined,
      },
    });
  }
  return global.__sequelize;
};
