
import SQL from '../mysql-pool/mysql-pool'

import { Lead } from "./types"

export interface FindOptions {
  sort_by?: [string, "ASC" |"DESC"]
  fields?: string[]
  where_additions?: string[]
}

export default class Leads {
  constructor(private sql: SQL) {}

  async deleteAll() {
    return this.sql.query("delete from leads")
  }

  async insert(lead: Lead) {
    let status = await this.sql.query("INSERT INTO leads SET ?", lead)
    const success = (status.affectedRows != 0)
    return [success, (success) ? status.insertId : null]
  }

  async update(_id: number, lead: Lead) {
    let status = await this.sql.query("UPDATE leads SET ? WHERE id = ?", [
      lead,
      _id,
    ])
    return status.affectedRows != 0
  }

  async find(condition_obj: object, options: FindOptions) {
    if (!options) options = {}
    const {where_additions, sort_by, fields} = options
    let conditions = Object.keys(condition_obj).map(key => {
      return `${key} = '${condition_obj[key]}'`
    })
    if (where_additions) {
      conditions = conditions.concat(where_additions)
    }
    let condition = "WHERE " + conditions.join(" AND ")
    let fields_str = "*"
    if (fields) {
      if (Array.isArray(fields) && fields.length) {
        fields_str = fields.join(", ")
      }
    }
    let sql = `SELECT ${fields_str} FROM leads ${condition}`
    if (sort_by) {
      if (Array.isArray(sort_by) && sort_by.length) {
        sql += ` ORDER BY ${sort_by[0]} ${sort_by[1]}`
      }
    }
    //console.log({sql})
    let rows = await this.sql.query(sql)
    rows = rows.map(row => Object.assign({}, row))
    //console.log({rows})
    return rows
  }

  async remove(id: number) {
    let status = await this.sql.query("DELETE FROM leads WHERE id = ?", id)
    return status.affectedRows != 0
  }
}