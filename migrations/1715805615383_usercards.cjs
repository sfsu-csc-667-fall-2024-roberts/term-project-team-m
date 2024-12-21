/* eslint-disable camelcase */

const UserCardsTable = "usercards";

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable(UserCardsTable, {
    card_id: {
      type: "int",
      //notNull: true,
    },

    user_id: {
      type: "int",
      //notNull: true,
    },

    card_order: {
      type: "int",
    },

    card_type: {
      type: "varchar",
    },
    
    drawn_at: {
        type: "timestamp",
        //notNull: true,
        default: pgm.func("current_timestamp"),
      },
  });
};
//primary key is userID, cardID



/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable(UserCardsTable);
};
