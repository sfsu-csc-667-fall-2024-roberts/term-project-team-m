/* eslint-disable camelcase */

const UsersTable = "users";

/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.up = (pgm) => {
  pgm.createTable(UsersTable, {
    id: "id", // Primary key

    email: {
      type: "varchar(256)",
      notNull: true,
      unique: true,
    },

    password: {
      type: "varchar(60)",
      notNull: true,
    },

    /*
    username: {
      type: "varchar(256)",
      unique: true,
    },
    // Coommenting out because this website does not have usernames during registration, only Email and password.
    */

    salt: {
      type: "varchar(255)",
    },

    profile_img: {
      type: "varchar(256)",
    },

    created_at: {
      type: "timestamp",
      default: pgm.func("current_timestamp"),
    },
    
    modified_at: {
      type: "timestamp",
      unique: pgm.func("current_timestamp"),
    },
  });
};




/**
 * @param {import("node-pg-migrate/dist/types").MigrationBuilder} pgm
 */
exports.down = (pgm) => {
  pgm.dropTable(UsersTable);
};
