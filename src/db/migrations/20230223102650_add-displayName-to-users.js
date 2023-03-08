export const up = async (knex) => {
  await knex.schema.alterTable("users", (table) => {
    table.text("displayName")
  })

  await knex("users").update({ displayName: knex.ref("email") })

  await knex.schema.alterTable("users", (table) => {
    table.text("displayName").notNullable().alter()
  })
}

export const down = async (knex) => {
  await knex.schema.alterTable("users", (table) => {
    table.dropColumn("displayName")
  })
}
