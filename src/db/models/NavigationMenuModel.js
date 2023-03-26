import BaseModel from "./BaseModel.js"
import NavigationMenuChildRelationModel from "./NavigationMenuChildRelationModel.js"
import NavigationMenuPagesRelationModel from "./NavigationMenuPagesRelationModel.js"
import PageModel from "./PageModel.js"

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
      modify: (query) => query.select("id", "name"),
    }
  }
}

export const getAllMenuChilds = async (navMenuId) => {
  const finalResult = []

  // Get child menus related to the current navigation menu (with id in param)
  const navigationMenuChildRelations = await NavigationMenuChildRelationModel.query()
    .select("*")
    .where("navigationMenuId", navMenuId)
  
  for (let i = 0; i < navigationMenuChildRelations.length ; i++) {
    const { navigationMenuChildId } = navigationMenuChildRelations[i]
    const menu = await NavigationMenuModel.query().findById(navigationMenuChildId)

    // Get child pages related to the current navigation menu
    const navigationMenuPagesRelations = await NavigationMenuPagesRelationModel.query()
      .select("*")
      .where("navigationMenuId", navigationMenuChildId)
        
    if (navigationMenuPagesRelations) {
      const childrenPages = []

      for (let i = 0; i < navigationMenuPagesRelations.length; i++) {
        const { pageId } = navigationMenuPagesRelations[i]
        const page = await PageModel.query().findById(pageId)
        childrenPages.push(page)
      }

      menu.childrenPages = childrenPages
    }

    // Get child menus related to the current CHILD navigation menu
    const childrenMenus = []
    const navigationMenuChilds = await NavigationMenuChildRelationModel.query()
      .select("*")
      .where("navigationMenuId", menu.id)
        
    
    // Loop on child menus of the current child navigation menu
    for (let i = 0; i < navigationMenuChilds.length; i++) {
      const { navigationMenuChildId } = navigationMenuChilds[i]
      const childMenu = await NavigationMenuModel.query().findById(navigationMenuChildId)

      // Get child pages related to the current child navigation menu
      const navigationMenuPagesRelations = await NavigationMenuPagesRelationModel.query()
        .select("*")
        .where("navigationMenuId", childMenu.id)
          
      if (navigationMenuPagesRelations) {
        const childrenPages = []

        for (let i = 0; i < navigationMenuPagesRelations.length; i++) {
          const { pageId } = navigationMenuPagesRelations[i]
          const page = await PageModel.query().findById(pageId)
          childrenPages.push(page)
        }

        childMenu.childrenPages = childrenPages
      }

      // If the current child navigation menu has child navigation menu too,
      // we recursively get the child's child menus and pages again
      childMenu.childrenMenus = await getAllMenuChilds(childMenu.id)

      childrenMenus.push(childMenu)
    }
    menu.childrenMenus = childrenMenus
    
    // menu: { id: x, name: menuName, childrenPages: [], childrenMenus: [] }
    finalResult.push(menu)
  }  

  return finalResult
}

export default NavigationMenuModel
