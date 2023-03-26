import BaseModel from "./BaseModel.js"

class UserModel extends BaseModel {
  static tableName = "users"

  static modifiers = {
    paginate: (query, limit, page) => {
      return query.limit(limit).offset((page - 1) * limit)
    },
  }

  static relationMappings() {
    return {
      role: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: UserModel,
        join: {
          from: "users.roleId",
          to: "role.id",
        },
        modify: (query) => query.select("id", "displayName"),
      },
    }
  }
}

export default UserModel
