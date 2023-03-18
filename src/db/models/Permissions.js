import BaseModel from "./BaseModel.js"
import RoleModel from "./RoleModel.js"

class PermissionsModel extends BaseModel {
  static tableName = "permissions"

  static relationMappings() {
    return {
      role: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: RoleModel,
        join: {
          from: "permissions.roleId",
          to: "role.id",
        },
      },
    }
  }
}

export default PermissionsModel