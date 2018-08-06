import * as Chance from "chance"
import * as _ from "lodash"

const chance = Chance()
import API from "../../frontend/src/api/index"

import * as RoutesForTests from "./utils/routes.for.tests"
import * as ValidatedUserForTests from "./utils/user.for.tests"

const mock_lead = (overload = {}) => {
  return Object.assign(
    {
      lead_type: "realestate",
      type: "Sell",
      bedrooms_baths: "2BR / 2BA",
      date: new Date().valueOf(),
      size: chance.integer({ min: 1, max: 20 }),
      description: chance.sentence({
        words: chance.integer({ min: 1, max: 9 }),
      }),
      state: chance.state(),
      housing_type: "Cardboard Box",
      bought_from: null,
      forSale: true,
      ownerId: 0,
      contact_person: chance.name(),
      telephone: chance.phone(),
      active: true,
      price: parseInt(
        chance
          .integer()
          .toString()
          .substring(0, 7)
          .slice(1, -1),
      ),
    },
    overload,
  )
}

var { request, appLogic, ApiForToken } = RoutesForTests.create()

beforeEach(async () => {
  await appLogic.models.leads.deleteAll()
})

test.skip("getting my sold_leads should work", async () => {
  var { user, token } = await ValidatedUserForTests.create({
    users: appLogic.models.users,
  })
  var { user: user2, token: token2 } = await ValidatedUserForTests.create({
    users: appLogic.models.users,
  })
  const lead = mock_lead({
    bought_from: user.id,
  })
  const { insertId } = await appLogic.models.leads.insertLead(lead)
  expect(insertId).toBeTruthy()
  //body = await ApiForToken(token2).leads.buyLeadsBuy([insertId])

  const res = await request
    .get("/leads/sold")
    .set({
      cookie: "token=" + token,
    })
    .send({
      filters: [["name", "testlead"]],
    })
  expect(res.error).toBeFalsy()
  const [record] = res.body.list
  expect(record.id).toBe(insertId)
})

test("user adds lead and see it as his lead for sale", async () => {
  var { user, token } = await ValidatedUserForTests.create({
    users: appLogic.models.users,
  })
  const lead = mock_lead({})

  await ApiForToken(token).leads.sellLeadsAddByForm(lead)
  let body = await ApiForToken(token).leads.sellLeadsGetList({})
  expect(body.list.length).toBe(1)
  expect(body.list[0].ownerId).toBe(user.id)
})

test(`
  user adds lead, 
  user2 buys it, 
  user1 balance is increased 
  user2 balance is decreased
  both get notifications`, async () => {
  var { user: user1_1, token: token1 } = await ValidatedUserForTests.create({
    users: appLogic.models.users,
  })
  var { user: user2_1, token: token2 } = await ValidatedUserForTests.create({
    users: appLogic.models.users,
  })
  const lead = mock_lead()

  await ApiForToken(token1).leads.sellLeadsAddByForm(lead)
  let body = await ApiForToken(token2).leads.buyLeadsGetList()
  let [old_record] = body.list
  body = await ApiForToken(token2).leads.buyLeadsBuy([old_record.id])
  let n = await ApiForToken(token1).notifications.getNotifications()
  expect(n.length).toBe(1)
  let { user: user1_2 } = await ApiForToken(token1).users.getMe()
  let { user: user2_2 } = await ApiForToken(token2).users.getMe()
  expect(user1_2.balance).toBe(lead.price)
  expect(user2_2.balance).toBe(-lead.price)
})

test("1st user adds lead, 2nd user buys it, everything should work", async () => {
  var { user: user1, token: token1 } = await ValidatedUserForTests.create({
    users: appLogic.models.users,
  })
  var { user: user2, token: token2 } = await ValidatedUserForTests.create({
    users: appLogic.models.users,
  })
  const lead = mock_lead()

  await ApiForToken(token1).leads.sellLeadsAddByForm(lead)
  let body = await ApiForToken(token2).leads.buyLeadsGetList()
  expect(body.error).toBeFalsy()
  expect(body.list.length).toBe(1)
  let [old_record] = body.list
  expect(old_record.ownerId).toBe(user1.id)
  body = await ApiForToken(token2).leads.buyLeadsBuy([body.list[0].id])
  body = await ApiForToken(token2).leads.getMyLeads({})
  expect(body.list.length).toBe(1)
  let [new_record] = body.list
  expect(new_record.ownerId).toBe(user2.id)
  expect(new_record.description).toBe(lead.description)
  expect(new_record.forSale).toBeFalsy()
})

test("getting all leads should work", async () => {
  var { user: user1, token: token1 } = await ValidatedUserForTests.create({
    users: appLogic.models.users,
  })
  var { user: user2, token: token2 } = await ValidatedUserForTests.create({
    users: appLogic.models.users,
  })

  const lead = mock_lead({
    name: "testlead 1",
  })

  const lead2 = mock_lead({
    name: "unique",
  })

  await ApiForToken(token1).leads.sellLeadsAddByForm(lead)
  var body = await ApiForToken(token2).leads.buyLeadsGetList()
  expect(body.total).toBe(1)
  expect(body.error).toBeFalsy()
  expect(typeof body.list).toEqual("object")

  await ApiForToken(token1).leads.sellLeadsAddByForm(lead2)

  var body = await ApiForToken(token2).leads.buyLeadsGetList({
    search: "unique",
  })
  expect(body.total).toBe(1)
  expect(body.error).toBeFalsy()
  expect(typeof body.list).toEqual("object")
})

test(`user1 add a lead
      user2 buys it 
      user2 move it for sale 
      user1 buys it back, for symetry`, async () => {
  var { user, token } = await ValidatedUserForTests.create({
    users: appLogic.models.users,
  })
  var { user: user2, token: token2 } = await ValidatedUserForTests.create({
    users: appLogic.models.users,
  })
  const lead = mock_lead()
  let body = await ApiForToken(token).leads.sellLeadsAddByForm(lead)
  body = await ApiForToken(token2).leads.buyLeadsGetList()
  body = await ApiForToken(token2).leads.buyLeadsBuy([body.list[0].id])
  body = await ApiForToken(token2).leads.getMyLeads({})
  const [record] = body.list
  body = await ApiForToken(token2).leads.myLeadsMoveToSell([body.list[0].id])
  expect(body.error).toBeFalsy()
  expect(record.description).toBe(lead.description)
})

test("user1 add lead, user2 buys it and then he sees it as his lead under /my-leads", async () => {
  var { user, token } = await ValidatedUserForTests.create({
    users: appLogic.models.users,
  })
  var { user: user2, token: token2 } = await ValidatedUserForTests.create({
    users: appLogic.models.users,
  })
  const lead = mock_lead()
  let body = await ApiForToken(token).leads.sellLeadsAddByForm(lead)
  body = await ApiForToken(token2).leads.buyLeadsGetList()
  body = await ApiForToken(token2).leads.buyLeadsBuy([body.list[0].id])
  body = await ApiForToken(token2).leads.getMyLeads({})
  expect(body.error).toBeFalsy()
  const [record] = body.list
  expect(record.description).toBe(lead.description)
})

test("getting my leads at order should work", async () => {
  var { user, token } = await ValidatedUserForTests.create({
    users: appLogic.models.users,
  })
  let body
  const lead = mock_lead({
    description: "testlead1",
    phone: "0001",
  })
  const lead2 = mock_lead({
    description: "testlead2",
    phone: "0002",
  })

  body = await ApiForToken(token).leads.sellLeadsAddByForm(lead)
  expect(body.error).toBeFalsy()

  body = await ApiForToken(token).leads.sellLeadsAddByForm(lead2)
  expect(body.error).toBeFalsy()

  // get leads ordered by date, order should be [lead2, lead]
  body = await ApiForToken(token).leads.buyLeadsGetList({
    page: 0,
    limit: 5,
    sortBy: "description",
  })
  expect(body.error).toBeFalsy()
  const [record1, record2] = body.list
  expect(record1.description).toBe(lead2.description)
  expect(record2.description).toBe(lead.description)

  // get leads ordered by phone, order should be [lead2, lead]
  body = await ApiForToken(token).leads.buyLeadsGetList({
    page: 0,
    limit: 5,
    sortBy: "phone",
  })
  expect(body.error).toBeFalsy()
  const [record3, record4] = body.list
  expect(record4.description).toBe(lead.description)
  expect(record3.description).toBe(lead2.description)

  body = await ApiForToken(token).leads.buyLeadsGetList({
    page: 0,
    limit: 1,
    sortBy: "phone",
  })
  expect(body.list.length).toBe(1)
})

test("adding a lead should fail without email", async () => {
  var { user, token } = await ValidatedUserForTests.create({
    users: appLogic.models.users,
  })

  const lead = mock_lead({
    description: " ",
  })
  let result = await ApiForToken(token).leads.sellLeadsAddByForm(lead)
  expect(result.error).toBeTruthy()
  const error_json = JSON.parse(result.error)
  expect(error_json.description[0]).toBe("too short")
})

test("adding a lead should fail without token", async () => {
  var { user, token } = await ValidatedUserForTests.create({
    users: appLogic.models.users,
  })
  const lead = mock_lead()
  let result = await ApiForToken(" ").leads.sellLeadsAddByForm(lead)
  expect(result.error).toBeTruthy()
})

test("adding a lead should success with data A", async () => {
  var { user, token } = await ValidatedUserForTests.create({
    users: appLogic.models.users,
  })
  const lead = mock_lead()
  let result = await ApiForToken(token).leads.sellLeadsAddByForm(lead)
  expect(result.response.affectedRows).toBeTruthy()
  let body = await ApiForToken(token).leads.buyLeadsGetList()
  let [record] = body.list
  expect(record.forSale).toBeTruthy()
})
