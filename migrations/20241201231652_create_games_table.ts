import { Knex } from 'knex';

// This migration file will create a `users` table
exports.up = async function(knex: Knex): Promise<void> {
  await knex.schema.createTable('games', (table) => {
    table.increments('id').primary();  // Auto-incrementing primary key
    table.string('game status');
    table.integer('players allowed').notNullable();  
    table.string('password');
    table.integer('game pile value');  
    table.integer('player turn');  


    //table.timestamp('created_at').defaultTo(knex.fn.now());  // Timestamp for creation
    //table.timestamp('started_at').defaultTo(knex.fn.now());  // Timestamp for creation
    //table.timestamp('ended_at').defaultTo(knex.fn.now());  // Timestamp for creation
    //table.timestamp('updated_at').defaultTo(knex.fn.now()).alter();  // Timestamp for last update
  });
};

exports.down = async function(knex: Knex): Promise<void> {
  // This function is used to revert the changes made in the `up` function.
  await knex.schema.dropTableIfExists('games');
};