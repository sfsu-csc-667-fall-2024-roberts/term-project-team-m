import { Knex } from 'knex';

// This migration file will create a `users` table
exports.up = async function(knex: Knex): Promise<void> {
  await knex.schema.createTable('game_users', (table) => {
    table.increments('user id');
    table.integer('game ID').notNullable();  
    table.integer('seat');  
    table.integer('turn number');  

   
    //table.timestamp('started_at').defaultTo(knex.fn.now());  // Timestamp for creation
    //table.timestamp('ended_at').defaultTo(knex.fn.now());  // Timestamp for creation
  });
};

exports.down = async function(knex: Knex): Promise<void> {
  // This function is used to revert the changes made in the `up` function.
  await knex.schema.dropTableIfExists('game_users');
};