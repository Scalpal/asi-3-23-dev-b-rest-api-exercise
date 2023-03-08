export const up = async (knex) => {
  await knex.schema.createTable("users", (table) => {
    table.increments("id")
    table.text("email").notNullable()
    table.text("passwordHash").notNullable()
    table.text("passwordSalt").notNullable()
    table.timestamps(true, true, true)
  })
  await knex.schema.createTable("posts", (table) => {
    table.increments("id")
    table.text("title").notNullable()
    table.text("content").notNullable()
    table.datetime("publishedAt")
    table.timestamps(true, true, true)
    table.integer("userId").notNullable().references("id").inTable("users")
  })
}

export const down = async (knex) => {
  await knex.schema.dropTable("posts")
  await knex.schema.dropTable("users")
}
