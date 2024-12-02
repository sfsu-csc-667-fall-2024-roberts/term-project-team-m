import { Knex } from 'knex';

// This migration file will create a `users` table
exports.up = async function(knex: Knex): Promise<void> {
  await knex.schema.createTable('game_state', (table) => {
    table.integer('game ID');
    table.boolean('active');
    table.integer('turn user ID');
    table.integer('turn number');
    table.integer('round number');


    //table.timestamp('created_at').defaultTo(knex.fn.now());  // Timestamp for creation
  });
};

exports.down = async function(knex: Knex): Promise<void> {
  // This function is used to revert the changes made in the `up` function.
  await knex.schema.dropTableIfExists('game_state');
};