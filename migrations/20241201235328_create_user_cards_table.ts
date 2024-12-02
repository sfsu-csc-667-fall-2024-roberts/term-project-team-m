import { Knex } from 'knex';

// This migration file will create a `users` table
exports.up = async function(knex: Knex): Promise<void> {
  await knex.schema.createTable('user_cards', (table) => {
    table.integer('card ID');
    table.integer('user ID');
    table.integer('card Order');
    table.string('card type');

    //table.timestamp('drawn_at').defaultTo(knex.fn.now());  // Timestamp for creation
  });
};

exports.down = async function(knex: Knex): Promise<void> {
  // This function is used to revert the changes made in the `up` function.
  await knex.schema.dropTableIfExists('user_cards');
};