import * as Express from "express"
import AppLogic from "../../app-logic/index"
import * as passport from "passport"
import checkIsInRole from "../../midelvares/checkIsInRole"

const authOptions = {
  session: false,
}

export const start = ({
  appLogic,
  expressApp,
}: {
  appLogic: AppLogic
  expressApp: Express.Express
}) => {
  const getLeads = async (req, res) => {
    try {
      const { filter, range, sort } = req.query

      const _sort = { sortBy: sort[0], sortOrder: sort[1] }
      const limit = { start: range[0], offset: range[1] }

      let condition
      if (filter && Object.keys(filter).length) {
        condition = filter
      }

      const [leads, count]: any = await appLogic.leads.getLeadsAll(
        condition,
        _sort,
        limit,
      )

      let contentRange
      if (count === 0) contentRange = "*/0"
      else if (range) contentRange = `${range[0]}-${range[1]}/${count}`
      else contentRange = `${count - 1}/${count}`
      res.set("Content-Range", `leads ${contentRange}`)
      res.json(leads)
    } catch (e) {
      res.status(500).json({ message: e.message })
    }
  }

  expressApp
    .route("/api/admin/leads")
    .all(passport.authenticate("jwt", authOptions), checkIsInRole("admin"))
    .get(getLeads)
}