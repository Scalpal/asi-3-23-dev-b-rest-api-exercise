export const up = async (knex) => {
  await knex.schema.createTable("products", (table) => {
    table.increments("id")
    table.text("name").notNullable()
    table.integer("price", 4).notNullable()
    table.integer("categoryId").references("id").inTable("categories")
  })
}

export const down = async (knex) => {
  await knex.schema.dropTable("products")
}
