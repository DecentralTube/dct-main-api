import { expect } from "chai"
import request from "supertest"

// eslint-disable-next-line @typescript-eslint/ban-ts-comment
// @ts-ignore
import createServer from "@src/server"
const app = createServer()

describe("> USER route", () => {
  //? Route check
  it("`/user` \t\t-> GET - returns OK", (done) => {
    request(app).get("/user").expect(200, done)
  })

  //? GET
  it("`/user` \t\t-> GET - responds with proper format", async () => {
    const response = await request(app)
      .get("/user")
      .then((res) => (res = res.body))
      .catch((e) => {
        throw new Error(e)
      })

    expect(response).to.be.an("object")
    expect(response).to.have.own.property("error")
    expect(response).to.have.own.property("status")
    expect(response).to.have.own.property("data")
  })

  //? Error messages
  it("`/user` \t\t-> GET - responds with good error messages", async () => {
    const response = await request(app)
      .get("/user")
      .then((res) => res.body)
      .catch((e) => {
        throw new Error(e)
      })

    const data = response.data
    if (!data) {
      expect(response.error).to.be.true
      expect(response.status).equal(404 || 500)
      expect(response.data).to.be.null

      if (response.status == 404) expect(response.msg).equal("not found")
      if (response.status == 500) expect(response.msg).equal("server error")
    }
  })

  //? GET unique
  it("`/user/:id` \t-> GET - responds with one user", async () => {
    const created = await request(app)
      .post("/user")
      .set("Content-Type", "application/json")
      .send({
        name: String(Math.random()),
        password: String(Math.random()),
        username: String(Math.random())
      })
      .then((res) => res.body.data)
      .catch((e) => {
        throw new Error(e)
      })
    const response = await request(app)
      .get(`/user/${created.id}`)
      .then((res) => res.body)
      .catch((e) => {
        throw new Error(e)
      })

    await deleteTestUser(`/user/${response.data.id}`)

    expect(response).to.be.an("object")
    expect(response).to.have.own.property("error").to.be.a("boolean")
    expect(response).to.have.own.property("status")
    expect(response).to.have.own.property("data")
    if (response?.data) expect(response.data).to.be.an("object")
  })

  //? GET 404 Check
  it("`/user/1000` \t-> GET - responds with 404 error", async () => {
    const response = await request(app)
      .get("/user/1000")
      .then((res) => res.body)
      .catch((e) => {
        throw new Error(e)
      })

    expect(response).to.be.an("object")
    expect(response).to.have.own.property("error").to.be.true
    expect(response).to.have.own.property("status").eql(404)
    expect(response).to.have.own.property("data").to.be.null
  })

  //? POST user
  it("`/user` \t\t-> POST - creates a user without errors", async () => {
    const created = await request(app)
      .post("/user")
      .set("Content-Type", "application/json")
      .send({
        name: String(Math.random()),
        password: String(Math.random()),
        username: String(Math.random())
      })
      .catch((e) => {
        throw new Error(e)
      })

    if (!created?.body) throw new Error("not created")

    expect(created.body).to.be.an("object")
    expect(created.body).to.have.own.property("error").to.be.false
    expect(created.body).to.have.own.property("status").to.eql(200)
    expect(created.body).to.have.own.property("data").to.be.an("object")

    const id = created.body.data.id
    const delete_url = `/user/${id}`
    await deleteTestUser(delete_url)
  })

  //? POST missing params check
  it("`/user` \t\t-> POST - throws error when missing params", async () => {
    const expectedError = await request(app)
      .post("/user")
      .set("Content-Type", "application/json")
      .send({
        name: String(Math.random()),
        password: String(Math.random())
      })
      .catch((e) => {
        throw new Error(e)
      })
    const error = expectedError.body
    expect(error).to.have.own.property("error").to.be.true
    expect(error).to.have.own.property("status").to.eql(400)
    expect(error).to.have.own.property("data").to.be.null
    expect(error).to.have.own.property("msg").to.eql("missing params")
  })

  //? DELETE user
  it("`/user/:id` \t-> DELETE - deletes user", async () => {
    const created = await request(app)
      .post("/user")
      .set("Content-Type", "application/json")
      .send({
        name: String(Math.random()),
        password: String(Math.random()),
        username: String(Math.random())
      })
      .catch((e) => {
        throw new Error(e)
      })

    if (created?.body) {
      const id = created.body.data.id
      const url = `/user/${id}`

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

  //? DELETE 404 Check
  it("`/user/1000` \t-> DELETE - responds with 404", async () => {
    const deleted = await request(app)
      .delete("/user/1000")
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

  //? PUT user
  it("`/user/:id` \t-> PUT - edit user without errors", async () => {
    const created = await request(app)
      .post("/user")
      .set("Content-Type", "application/json")
      .send({
        name: String(Math.random()),
        password: String(Math.random()),
        username: String(Math.random())
      })
      .catch((e) => {
        throw new Error(e)
      })

    if (!created.body) {
      throw new Error("not created")
    }

    const created_id = created.body.data.id
    const edit_url = `/user/${created_id}`

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
    const delete_url = `/user/${edited_id}`
    await deleteTestUser(delete_url)
  })

  //? PUT 404 Check
  it("`/user/1000` \t-> PUT - responds with 404", async () => {
    const update = await request(app)
      .put("/user/1000")
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
