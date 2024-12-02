import { Knex } from 'knex';

// This migration file will create a `users` table
exports.up = async function(knex: Knex): Promise<void> {
  await knex.schema.createTable('chatlog', (table) => {
    table.increments('id').primary();  // Auto-incrementing primary key
    table.integer('user ID').notNullable();
    table.integer('game ID');
    table.string('message');

    //table.timestamp('created_at').defaultTo(knex.fn.now());  // Timestamp for creation
  });
};

exports.down = async function(knex: Knex): Promise<void> {
  // This function is used to revert the changes made in the `up` function.
  await knex.schema.dropTableIfExists('chatlog');
};