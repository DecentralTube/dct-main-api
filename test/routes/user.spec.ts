import { expect } from "chai"
import request from "supertest"

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import createServer from "@src/server"
const app = createServer()

const route = "/" + "user"

describe("> USER route", () => {
  //* Route check
  it(`"${route}" \t\t-> GET - returns OK`, (done) => {
    request(app).get(route).expect(200, done)
  })

  //* GET
  it(`"${route}" \t\t-> GET - responds with proper format`, async () => {
    const response = await request(app)
      .get(route)
      .then((res) => res.body)
      .catch((e) => {
        throw new Error(e)
      })

    expect(response).to.be.an("object")
    expect(response).to.have.own.property("error")
    expect(response).to.have.own.property("status")
    expect(response).to.have.own.property("data")

    let data = response.data

    if (!data) {
      expect(data).to.be.null
      return
    }

    if (data[1]) {
      data = data[0]
      expect(response).to.have.own.property("count").to.be.a("number")
    }

    expect(data).to.have.own.property("id").to.be.a("number")
    expect(data).to.have.own.property("name").to.be.a("string")
    expect(data).to.have.own.property("password").to.be.a("string")
    expect(data).to.have.own.property("username").to.be.a("string")
    expect(data).to.have.own.property("createdAt").to.be.a("string")
    expect(data).to.have.own.property("updatedAt").to.be.a("string")
  })

  //* Error messages
  it(`"${route}" \t\t-> GET - responds with good error messages`, async () => {
    const response = await request(app)
      .get(route)
      .then((res) => res.body)
      .catch((e) => {
        throw new Error(e)
      })

    if (!response.data) {
      expect(response.error).to.be.true
      expect(response.status).equal(404 || 500)
      expect(response.data).to.be.null

      if (response.status == 404) expect(response.msg).equal("not found")
      if (response.status == 500) expect(response.msg).equal("server error")
    }
  })

  //* GET unique
  it(`"${route}/:id" \t-> GET - responds with one user`, async () => {
    const created = await request(app)
      .post(route)
      .set("Content-Type", "application/json")
      .send({
        name: String(Math.random()),
        password: String(Math.random()),
        username: String(Math.random())
      })
      .then((res) => res.body)
      .then((body) => body.data)
      .catch((e) => {
        throw new Error(e)
      })

    const response = await request(app)
      .get(`${route}/${created.id}`)
      .then((res) => res.body)
      .catch((e) => {
        throw new Error(e)
      })

    await deleteTestUser(`${route}/${response.data.id}`)

    expect(response).to.be.an("object")
    expect(response).to.have.own.property("error").to.be.a("boolean")
    expect(response).to.have.own.property("status")
    expect(response).to.have.own.property("data")
    if (response?.data) expect(response.data).to.be.an("object")
  })

  //* GET 404 Check
  it(`"${route}/1000" \t-> GET - responds with 404 error`, async () => {
    const response = await request(app)
      .get(route + "/1000")
      .then((res) => res.body)
      .catch((e) => {
        throw new Error(e)
      })

    expect(response).to.be.an("object")
    expect(response).to.have.own.property("error").to.be.true
    expect(response).to.have.own.property("status").eql(404)
    expect(response).to.have.own.property("data").to.be.null
  })

  //* POST user
  it(`"${route}" \t\t-> POST - creates a user without errors`, async () => {
    const created = await request(app)
      .post(route)
      .set("Content-Type", "application/json")
      .send({
        name: String(Math.random()),
        password: String(Math.random()),
        username: String(Math.random())
      })
      .then((res) => res.body)
      .catch((e) => {
        throw new Error(e)
      })

    if (!created) throw new Error("not created")

    expect(created).to.be.an("object")
    expect(created).to.have.own.property("error").to.be.false
    expect(created).to.have.own.property("status").to.eql(200)
    expect(created).to.have.own.property("data").to.be.an("object")

    const delete_url = `${route}/${created.data.id}`
    await deleteTestUser(delete_url)
  })

  //* POST missing params check
  it(`"${route}" \t\t-> POST - throws error when missing params`, async () => {
    const expectedError = await request(app)
      .post(route)
      .set("Content-Type", "application/json")
      .send({
        name: String(Math.random()),
        password: String(Math.random())
      })
      .then((res) => res.body)
      .catch((e) => {
        throw new Error(e)
      })

    expect(expectedError).to.have.own.property("error").to.be.true
    expect(expectedError).to.have.own.property("status").to.eql(400)
    expect(expectedError).to.have.own.property("data").to.be.null
    expect(expectedError).to.have.own.property("msg").to.eql("missing params")
  })

  //* DELETE user
  it(`"${route}/:id" \t-> DELETE - deletes user`, async () => {
    const created = await request(app)
      .post(route)
      .set("Content-Type", "application/json")
      .send({
        name: String(Math.random()),
        password: String(Math.random()),
        username: String(Math.random())
      })
      .then((res) => res.body)
      .catch((e) => {
        throw new Error(e)
      })

    if (created) {
      const id = created.data.id
      const url = `${route}/${id}`

      const deleted = await request(app)
        .delete(url)
        .then((res) => res.body)
        .catch((e) => {
          throw new Error(e)
        })

      expect(deleted).to.be.an("object")
      expect(deleted).to.have.own.property("error").to.be.false
      expect(deleted).to.have.own.property("status").to.eql(200)
      expect(deleted).to.have.own.property("data").to.be.an("object")
      expect(deleted.data.id).equal(id)
    } else throw new Error("not created")
  })

  //* DELETE 404 Check
  it(`"${route}/1000" \t-> DELETE - responds with 404`, async () => {
    const deleted = await request(app)
      .delete(route + "/1000")
      .then((res) => res.body)
      .catch((e) => {
        throw new Error(e)
      })

    expect(deleted).to.be.an("object")
    expect(deleted).to.have.own.property("error").to.be.true
    expect(deleted).to.have.own.property("status").to.eql(404)
    expect(deleted).to.have.own.property("data").to.be.null
    expect(deleted).to.have.own.property("msg").to.eql("not found")
  })

  //* PUT user
  it(`"${route}/:id" \t-> PUT - edit user without errors`, async () => {
    const created = await request(app)
      .post(route)
      .set("Content-Type", "application/json")
      .send({
        name: String(Math.random()),
        password: String(Math.random()),
        username: String(Math.random())
      })
      .then((res) => res.body)
      .catch((e) => {
        throw new Error(e)
      })

    if (!created) {
      throw new Error("not created")
    }

    const created_id = created.data.id
    const edit_url = `${route}/${created_id}`

    const edited = await request(app)
      .put(edit_url)
      .set("Content-Type", "application/json")
      .send({
        name: String(Math.random()),
        password: String(Math.random()),
        username: String(Math.random())
      })
      .then((res) => res.body)
      .catch((e) => {
        throw new Error(e)
      })

    expect(edited).to.be.an("object")
    expect(edited).to.have.own.property("error").to.be.false
    expect(edited).to.have.own.property("status").to.eql(200)
    expect(edited).to.have.own.property("data").to.be.an("object")
    expect(edited.data.id).equal(created_id)

    if (!edited) {
      throw new Error("not edited")
    }

    const edited_id = edited.data.id
    const delete_url = `${route}/${edited_id}`
    await deleteTestUser(delete_url)
  })

  //* PUT 404 Check
  it(`"${route}/:1000" \t-> PUT - responds with 404`, async () => {
    const update = await request(app)
      .put(route + "/1000")
      .then((res) => res.body)
      .catch((e) => {
        throw new Error(e)
      })

    expect(update).to.be.an("object")
    expect(update).to.have.own.property("error").to.be.true
    expect(update).to.have.own.property("status").to.eql(404)
    expect(update).to.have.own.property("data").to.be.null
    expect(update).to.have.own.property("msg").to.eql("not found")
  })
})

async function deleteTestUser(url: string) {
  await request(app)
    .delete(url)
    .catch((e) => {
      throw new Error(e)
    })
}
