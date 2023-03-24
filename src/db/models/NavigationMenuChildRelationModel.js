import BaseModel from "./BaseModel.js"
import NavigationMenuModel from "./NavigationMenuModel.js"

class NavigationMenuChildRelationModel extends BaseModel {
  static tableName = "navigationMenuChildRelation"

  static modifiers = {
    paginate: (query, limit, page) => {
      return query.limit(limit).offset((page - 1) * limit)
    },
  }

  static relationMappings() {
    return {
      navMenuId: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: NavigationMenuModel,
        join: {
          from: "navigationMenuPagesRelation.navigationMenuId",
          to: "navigationMenu.id",
        },
      },
      navMenuChildId: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: NavigationMenuModel,
        join: {
          from: "navigationMenuChildRelation.navigationMenuChildId",
          to: "navigationMenu.id",
        },
      },
    }
  }
}

export default NavigationMenuChildRelationModel
