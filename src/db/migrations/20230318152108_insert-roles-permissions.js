export const up = async (knex) => {
  await knex("role").insert([
    {
      name: "user",
    },
    {
      name: "admin"
    }, 
    {
      name: "manager"
    }
  ])

  await knex("permissions").insert([
    {
      roleId: 1,
      permission_key: "users",
      permission_value: "RU"
    },
    {
      roleId: 1,
      permission_key: "pages",
      permission_value: "RU"
    },
    {
      roleId: 1,
      permission_key: "navigationMenu",
      permission_value: "R"
    },
    {
      roleId: 2,
      permission_key: "users",
      permission_value: "CRUD"
    },
    {
      roleId: 2,
      permission_key: "pages",
      permission_value: "CRD"
    },
    {
      roleId: 2,
      permission_key: "navigationMenu",
      permission_value: "CRUD"
    },
    {
      roleId: 3,
      permission_key: "users",
      permission_value: "CRUD"
    },
    {
      roleId: 3,
      permission_key: "pages",
      permission_value: "CRD"
    },
    {
      roleId: 3,
      permission_key: "navigationMenu",
      permission_value: "CRUD"
    }
  ])
}

export const down = async (knex) => {
  await knex("pages").del()
  await knex("users").del()
  await knex("permissions").del()
  await knex("role").del()
}
