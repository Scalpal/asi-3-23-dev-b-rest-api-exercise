import BaseModel from "./BaseModel.js"

class NavigationMenuModel extends BaseModel {
  static tableName = "navigationMenu"

  static modifiers = {
    paginate: (query, limit, page) => {
      return query.limit(limit).offset((page - 1) * limit)
    },
  }

  static relationMappings() {
    return {
      creatorId: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: NavigationMenuModel,
        join: {
          from: "navigationMenu.parentId",
          to: "navigationMenu.id",
        },
      },
    }
  }
}

export default NavigationMenuModel
