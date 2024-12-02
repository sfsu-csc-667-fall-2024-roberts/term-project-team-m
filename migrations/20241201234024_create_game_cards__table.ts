import { Knex } from 'knex';

// This migration file will create a `users` table
exports.up = async function(knex: Knex): Promise<void> {
  await knex.schema.createTable('game_cards', (table) => {
    table.increments('id').primary();  // Auto-incrementing primary key
    table.integer('suit').notNullable();
    table.integer('value').notNullable();
    table.string('card name');
    table.integer('user ID'); 
    table.integer('game ID');
    table.integer('location');

    //table.timestamp('started_at').defaultTo(knex.fn.now());  // Timestamp for creation
    //table.timestamp('ended_at').defaultTo(knex.fn.now());  // Timestamp for creation
  });
};

exports.down = async function(knex: Knex): Promise<void> {
  // This function is used to revert the changes made in the `up` function.
  await knex.schema.dropTableIfExists('game_cards');
};