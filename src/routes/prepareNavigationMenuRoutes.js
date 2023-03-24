import NavigationMenuChildRelationModel from "../db/models/NavigationMenuChildRelationModel.js"
import NavigationMenuModel from "../db/models/NavigationMenuModel.js"
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

    const { id, name } = await NavigationMenuModel.query()
      .findById(req.params.navigationMenuId)
    
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

    // Get child pages of the navigation menu
    const navigationMenuChildRelations = await NavigationMenuChildRelationModel.query()
      .select("*")
      .where("navigationMenuId", req.params.navigationMenuId)
            
    if (navigationMenuChildRelations) {
      const childrenMenus = []

      for (let i = 0; i < navigationMenuChildRelations.length; i++) {
        const res = navigationMenuChildRelations[i]
        const menu = await NavigationMenuModel.query().findById(res.navigationMenuChildId)
        childrenMenus.push(menu)
      }

      result.childrenMenus = childrenMenus
    }

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
      const { name, parentId } = req.body

      // Check if the parentId of the navMenu the user want to put exists
      if (parentId) {
        const navMenuCheck = await NavigationMenuModel.query().findById(parentId)

        if (!navMenuCheck) {
          res.status(404).send({ error: "Navigation menu not found" })

          return
        }
      }

      const navigationMenu = await NavigationMenuModel.query()
        .insert({
          name,
          parentId: parentId ? parentId : null
        })
        .returning("*")
      
      res.send({ result: navigationMenu })
    }
  )


  app.post("/navigationMenu/addPage", auth, checkPermissions, async (req, res) => {
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
    
    if (checkNavPageRelationExist) {
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
  })


  app.post("/navigationMenu/addNavigationMenu", auth, checkPermissions, async (req, res) => {
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
      res.status(401).send({ error: "Already exists" })

      return
    }    

    const navMenuPageRelation = await NavigationMenuChildRelationModel.query()
      .insert({
        navigationMenuId,
        navigationMenuChildId
      })
      .returning("*")
    
    res.send({ result: navMenuPageRelation })
  })
  

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

      // const navMenuPages = await NavigationMenuPagesRelationModel.query()
      //   .select("*")
      //   .where("navigationMenuId", req.params.navigationMenuId)
      
      console.log(navigationMenu)

      res.send({ result: navigationMenu })
    }
  )
}

export default prepareNavigationMenuRoutes