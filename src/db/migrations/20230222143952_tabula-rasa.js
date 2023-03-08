export const up = async (knex) => {
  await knex.schema.dropTable("products")
  await knex.schema.dropTable("categories")
  await knex.schema.dropTable("users")
}

export const down = async (knex) => {
  await knex.schema.createTable("categories", (table) => {
    table.increments("id")
    table.text("name").notNullable().unique()
  })
  await knex.schema.createTable("products", (table) => {
    table.increments("id")
    table.text("name").notNullable()
    table.integer("price", 4).notNullable()
    table.integer("categoryId").references("id").inTable("categories")
  })
  await knex.schema.createTable("users", (table) => {
    table.increments("id")
    table.text("firstName").notNullable()
    table.text("lastName").notNullable()
    table.text("email").notNullable().unique()
  })
}
