import NavigationMenuChildRelationModel from "../db/models/NavigationMenuChildRelationModel.js"
import NavigationMenuModel, { getChildMenuPages } from "../db/models/NavigationMenuModel.js"
import NavigationMenuPagesRelationModel from "../db/models/NavigationMenuPagesRelationModel.js"
import PageModel from "../db/models/PageModel.js"
import auth from "../middlewares/auth.js"
import checkPermissions from "../middlewares/checkPermissions.js"
import validate from "../middlewares/validate.js"
import {
  stringValidator
} from "../validators.js"


const prepareNavigationMenuRoutes = ({ app }) => {
  app.get("/navigationMenu", async (req, res) => {
    const navigationMenus = await NavigationMenuModel.query()
      .select("*")
    
      const [countResult] = await NavigationMenuModel.query()
        .clone()
        .clearSelect()
        .clearOrder()
        .count()

      const count = Number.parseInt(countResult.count, 10)

    res.send({ result: navigationMenus, meta: count })
  })

  app.get("/navigationMenu/:navigationMenuId", async (req, res) => {
    const result = {}

    const { id, name } = await NavigationMenuModel.query().findById(req.params.navigationMenuId)
    
    result.id = id
    result.name = name
    
    // Get child pages of the navigation menu
    const navigationMenuPagesRelations = await NavigationMenuPagesRelationModel.query()
      .select("*")
      .where("navigationMenuId", req.params.navigationMenuId)
        
    if (navigationMenuPagesRelations) {
      const childrenPages = []

      for (let i = 0; i < navigationMenuPagesRelations.length; i++) {
        const res = navigationMenuPagesRelations[i]
        const page = await PageModel.query("").findById(res.pageId)
        childrenPages.push(page)
      }

      result.childrenPages = childrenPages
    }

    result.childrenMenus = await getChildMenuPages(req.params.navigationMenuId)

    res.send({ result: result })

    
    // const [countResult] = await NavigationMenuModel.query()
    //   .clone()
    //   // .clearSelect()
    //   // .clearOrder()
    //   .count()

    // const count = Number.parseInt(countResult.count, 10)

    // res.send({ result: r, meta: count })
  })


  app.post(
    "/navigationMenu",
    auth,
    checkPermissions,
    validate({
      body: {
        name: stringValidator.required(),
      }
    }),
    async(req, res) => { 
      const { name } = req.body

      const navigationMenu = await NavigationMenuModel.query()
        .insert({
          name,
        })
        .returning("*")
      
      res.send({ result: navigationMenu })
    }
  )


  app.post(
    "/navigationMenu/addPage",
    auth,
    checkPermissions,
    
    async (req, res) => {
      const { navigationMenuId, pageId } = req.body

      const page = await PageModel.query().findById(pageId)
      const navigationMenu = await NavigationMenuModel.query().findById(navigationMenuId)

      if (!page || !navigationMenu) {
        res.status(404).send({ error: "Not found" })

        return
      }

      const checkNavPageRelationExist = await NavigationMenuPagesRelationModel.query()
        .select("*")
        .where("navigationMenuId", navigationMenuId)
        .where("pageId", pageId)
      
      console.log(checkNavPageRelationExist)
      
      if (checkNavPageRelationExist.length > 0) {
        res.status(401).send({ error: "Already exists" })

        return
      }    

      const navMenuPageRelation = await NavigationMenuPagesRelationModel.query()
        .insert({
          navigationMenuId,
          pageId
        })
        .returning("*")
      
      res.send({ result: navMenuPageRelation })
    }
  )


  app.post(
    "/navigationMenu/addNavigationMenu",
    auth,
    checkPermissions,
    
    async (req, res) => {
      const { navigationMenuId, navigationMenuChildId } = req.body

      const navigationMenu = await NavigationMenuModel.query().findById(navigationMenuId)
      const navigationMenuChild = await NavigationMenuModel.query().findById(navigationMenuChildId)

      if (!navigationMenu || !navigationMenuChild) {
        res.status(404).send({ error: "Not found" })

        return
      }

      const checkNavPageRelationExist = await NavigationMenuChildRelationModel.query()
        .select("*")
        .where("navigationMenuId", navigationMenuId)
        .where("navigationMenuChildId", navigationMenuChildId)
      
      console.log("checkNavPageRelationExist : ", checkNavPageRelationExist)
      
      if (checkNavPageRelationExist.length > 0) {
        res.status(422).send({ error: "Already exists" })

        return
      }    

      // Exemple : if menu 1 has as a child menu 2, you can't add menu 1 as a child of menu 2 after
      const checkIsNotAlreadyParent = await NavigationMenuChildRelationModel.query()
        .select("*")
        .where("navigationMenuId", navigationMenuChildId)
        .where("navigationMenuChildId", navigationMenuId)

      if (checkIsNotAlreadyParent.length > 0) {
        res.status(422).send({ error: "Impossible relation" })

        return
      } 
      
      const navMenuPageRelation = await NavigationMenuChildRelationModel.query()
        .insert({
          navigationMenuId,
          navigationMenuChildId
        })
        .returning("*")
      
      res.send({ result: navMenuPageRelation })
    }
  )

  app.patch(
    "/navigationMenu/:navigationMenuId",
    auth,
    checkPermissions,
    validate({
      body: {
        name: stringValidator.required()
      }
    }), 
    async (req, res) => {
      const { name } = req.body

      const navigationMenu = await NavigationMenuModel.query()
        .findById(req.params.navigationMenuId)
      
      if (!navigationMenu) {
        res.status(404).send({ error: "Navigation menu not found" })

        return
      }

      const updatedMenu  = await NavigationMenuModel.query().update({
          ...(name ? { name } : {}),
        })
        .where("id", req.params.navigationMenuId)
        .returning("*")
      
      res.send({ result: updatedMenu ,message: "Navigation menu successfully updated !" })
    }
  )
  

  app.delete(
    "/navigationMenu/:navigationMenuId",
    auth,
    checkPermissions,

    async (req, res) => {
      const navigationMenu = await NavigationMenuModel.query()
        .findById(req.params.navigationMenuId)
      
      if (!navigationMenu) {
        res.status(404).send({ error: "Navigation menu not found" })

        return
      }

      // Delete all relations of pages with this navigation menu
      await NavigationMenuPagesRelationModel.query()
        .delete()
        .where("navigationMenuId", req.params.navigationMenuId)
      
      // Delete all relations in [navigationMenuChildRelation table] of this navigation menu as a parent menu
      await NavigationMenuChildRelationModel.query()
        .delete()
        .where("navigationMenuId", req.params.navigationMenuId)
      
      // Delete all relations in [navigationMenuChildRelation table] of this navigation menu as a child menu
      await NavigationMenuChildRelationModel.query()
        .delete()
        .where("navigationMenuChildId", req.params.navigationMenuId)      
      
      const deletedMenu = await NavigationMenuModel.query()
        .delete()
        .where("id", navigationMenu.id)
      
      res.send({ result: deletedMenu , message: "Navigation menu deleted successfully !"})
    }
  )
}

export default prepareNavigationMenuRoutes