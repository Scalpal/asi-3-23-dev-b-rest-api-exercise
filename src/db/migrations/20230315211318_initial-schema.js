export const up = async (knex) => {
	await knex.schema.createTable("role", (table) => {
		table.increments("id")
		table.text("name").notNullable().unique()
	})

	await knex.schema.createTable("permissions", (table) => {
		table.integer("roleId").notNullable().references("id").inTable("role"),
		table.text("permission_key").notNullable()
		table.text("permission_value").notNullable()
	})

	await knex.schema.createTable("users", (table) => {
		table.increments("id")
		table.text("email").notNullable().unique()
		table.text("firstName").notNullable()
		table.text("lastName").notNullable()
		table.text("passwordHash").notNullable()
		table.text("passwordSalt").notNullable()
		table.timestamps(true, true, true)
		table.integer("roleId").notNullable().references("id").inTable("role")
	})

	await knex.schema.createTable("pages", (table) => {
		table.increments("id")
		table.text("title").notNullable().unique()
		table.text("content").notNullable()
		table.text("slug").notNullable().unique()
		table.integer("creator").notNullable().references("id").inTable("users")
		table.json("usersWhoModified").notNullable()
		table.timestamps(true, true, true)
		table.enum("status", ["draft", "published"]).notNullable().defaultTo("draft")
	})
}

export const down = async (knex) => {
	await knex.schema.dropTable("pages")
	await knex.schema.dropTable("users")
	await knex.schema.dropTable("permissions")
	await knex.schema.dropTable("role")
}
