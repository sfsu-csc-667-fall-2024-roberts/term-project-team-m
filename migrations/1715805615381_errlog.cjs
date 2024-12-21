/* eslint-disable camelcase */

const ErrorLogTable = "errlog";

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable(ErrorLogTable, {
    err_id: {
      type: "int",
      //notNull: true,
    },

    user_id: {
      type: "int",
      //notNull: true,
    },
    game_id: {
      type: "int",
    },

    err_message: {
      type: "varchar",
    },
    
    created_at: {
        type: "timestamp",
        //notNull: true,
        default: pgm.func("current_timestamp"),
      },
  });
};
// primary key is err_id


/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable(ErrorLogTable);
};
