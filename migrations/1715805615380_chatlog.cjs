/* eslint-disable camelcase */

const ChatlogTable = "chatlog";

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable(ChatlogTable, {
    user_id: {
      type: "int",
      //notNull: true,
    },

    game_id: {
      type: "int",
      //notNull: true,
    },

    message: {
      type: "varchar",
    },
    
    created_at: {
        type: "timestamp",
        //notNull: true,
        default: pgm.func("current_timestamp"),
      },
  });
};
// primary key is user_id, game_id


/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable(ChatlogTable);
};
