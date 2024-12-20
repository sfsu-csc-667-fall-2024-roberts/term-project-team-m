import pgp from "pg-promise";

// This is where the project connects to the postgres database
const pgpInstance = pgp();
const connection = pgpInstance(process.env.DATABASE_URL);

export { pgpInstance as pgp };

export default connection;
