import hashPassword from "../src/db/hashPassword.js"

// npx knex seed:run

export const seed = async (knex) => {
  await knex("navigationMenuChildRelation").del()
  await knex("navigationMenuPagesRelation").del()
  await knex("navigationMenu").del()
  await knex("permissions").del()
  await knex("pages").del()
  await knex("users").del()
  await knex("role").del()

  // Insert seed entries for roles
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

  // Insert seed entries for permissions
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
      permission_value: ""
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

  const [passwordHash, passwordSalt] = await hashPassword("Password123*")

  // Get the id of the roles
  const [userRole, adminRole, managerRole] = await knex("role").select("id")

  // Inserts seed entries for users table
  await knex("users").insert([
    { email: "user@example.com", firstName: "John", lastName: "Doe", passwordHash: passwordHash, passwordSalt: passwordSalt, roleId: userRole.id },
    { email: "admin@example.com", firstName: "Jane", lastName: "Doe", passwordHash: passwordHash, passwordSalt: passwordSalt, roleId: adminRole.id },
    { email: "manager@example.com", firstName: "Bob", lastName: "Smith", passwordHash: passwordHash, passwordSalt: passwordSalt, roleId: managerRole.id }
  ])

  // Get the id of the users
  const [user, admin, manager] = await knex("users").select("id")

  // Inserts seed entries for pages table
  await knex("pages").insert([
    { title: "Welcome to my website", content: "Lorem ipsum dolor sit amet, consectetur adipiscing elit.", slug: "welcome", creator: admin.id, usersWhoModified: "[]", status: "published" },
    { title: "About us", content: "We are a team of passionate developers.", slug: "about-us", creator: admin.id, usersWhoModified: "[]", status: "published" },
    { title: "Contact", content: "You can reach us at contact@example.com.", slug: "contact", creator: manager.id, usersWhoModified: "[]", status: "published" },
    { title: "page4", content: "You can reach us at page4@example.com.", slug: "page4", creator: admin.id, usersWhoModified: "[]", status: "published" },
    { title: "page5", content: "You can reach us at page5@example.com.", slug: "page5", creator: admin.id, usersWhoModified: "[]", status: "published" },
    { title: "page6", content: "You can reach us at page6@example.com.", slug: "page6", creator: admin.id, usersWhoModified: "[]", status: "draft" },
    { title: "page7", content: "You can reach us at page7@example.com.", slug: "page7", creator: admin.id, usersWhoModified: "[]", status: "published" },
    { title: "page8", content: "You can reach us at page8@example.com.", slug: "page8", creator: manager.id, usersWhoModified: "[]", status: "published" },
    { title: "page9", content: "You can reach us at page9@example.com.", slug: "page9", creator: manager.id, usersWhoModified: "[]", status: "published" },
    { title: "page10", content: "You can reach us at page10@example.com.", slug: "page10", creator: manager.id, usersWhoModified: "[]", status: "published" },
    { title: "page11", content: "You can reach us at page11@example.com.", slug: "page11", creator: manager.id, usersWhoModified: "[]", status: "published" }
  ])

  // Inserts seed entries for navigationMenu table
  await knex("navigationMenu").insert([
    { name: "Main menu" },
    { name: "Secondary menu" },
    { name: "Third menu" },
    { name: "Drawer menu" },
    { name: "Burger menu" }
  ])

  // Inserts seed entries for navigationMenuPagesRelation 
  await knex("navigationMenuPagesRelation").insert([
    { navigationMenuId: 1, pageId: 1 },
    { navigationMenuId: 2, pageId: 2 },
    { navigationMenuId: 4, pageId: 5 },
  ])

  await knex("navigationMenuChildRelation").insert([
    { navigationMenuId: 1, navigationMenuChildId: 2 },
    { navigationMenuId: 2, navigationMenuChildId: 3 },
    { navigationMenuId: 4, navigationMenuChildId: 5 }
  ])
}