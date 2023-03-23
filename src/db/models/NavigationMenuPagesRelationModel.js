import BaseModel from "./BaseModel.js"
import NavigationMenuModel from "./NavigationMenuModel.js"
import PageModel from "./PageModel.js"

class NavigationMenuPagesRelationModel extends BaseModel {
  static tableName = "navigationMenuPagesRelation"

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
      pageIdRel: {
        relation: BaseModel.BelongsToOneRelation,
        modelClass: PageModel,
        join: {
          from: "navigationMenuPagesRelation.pageId",
          to: "pages.id",
        },
      },
    }
  }
}

export default NavigationMenuPagesRelationModel
