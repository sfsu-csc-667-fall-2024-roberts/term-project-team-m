import { Knex } from 'knex';
import * as dotenv from 'dotenv';

dotenv.config(); // Load environment variables from .env file

const knexConfig: Knex.Config = {
  client: 'mysql2', // Use MySQL2 client
  connection: {
    host: process.env.DB_HOST || 'localhost',  // Default to localhost if not defined
    user: process.env.DB_USER || 'root',       // Default to 'root' user if not defined
    password: process.env.DB_PASSWORD || 'Elite2699',   // Default to empty string if not defined
    database: process.env.DB_NAME || 'sys',  // Default to 'my_database' if not defined
    charset: 'utf8mb4',  // Ensures proper UTF-8 encoding for special characters
  },
  migrations: {
    tableName: 'knex_migrations', // Table to track migrations
    directory: './migrations',    // Directory where migration files are stored
  },
  /**seeds: {
    directory: './seeds', // Directory where seed files are stored (optional)
  },**/
};

export default knexConfig;

// 'npm install knex mysql2' to first install dependencies, I am on mysql2 version 3.11.5 and knex Version 3.1.0
// I am on node version 23.3.0 and npm version 10.9.1
// install mysql workbench for DB GUI editor, I am on version 8.0.40
// install mysql community server via homebrew, I am on version 9.0.1
// dot env setup

// use 'npx knex migrate:make create_users_table' to generate migration script to create a user table (just one example)
// use 'npx knex migrate:latest' to apply latest script changes


