export default {
  client: "pg",
  connection: {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    user: "pascal",
    password: process.env.DB_PASSWORD,
    database: "crm",
  },
  migrations: {
    directory: "./src/db/migrations",
    stub: "./src/db/migration.stub",
  },
}
