/* eslint-disable camelcase */

const GameCardsTable = "game_cards";

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable(GameCardsTable, {
    id: {
      type: "serial",
      primaryKey: true,
    },
    suit: {
      type: "integer",
      notNull: true,
    },
    value: {
      type: "integer",
      notNull: true,
    },
    card_name: {
      type: "varchar",
    },
    user_id: {
      type: "integer",
      references: '"users"',
      onDelete: "SET NULL",
    },
    game_id: {
      type: "integer",
      references: '"games"',
      onDelete: "CASCADE",
    },
    location: {
      type: "varchar",
      notNull: true,
    },
  });
  
  // Theoretically should improve query performance when filtering by game_id
  pgm.createIndex(GameCardsTable, "game_id");
};

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable(GameCardsTable);
};
