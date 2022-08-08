import { User } from "@prisma/client"

export default class Format {
  error: boolean
  msg: string
  status: number
  data: User[] | User | null

  constructor(error: boolean, data: User[] | User | null, msg?: string) {
    this.error = error
    this.status = 500
    this.msg = "server error"
    this.data = data
    if (error == false) {
      this.status = 200
      this.msg = "success"
    }
    if (data == null) {
      this.error = true
      this.status = 404
      this.msg = "not found"
      this.data = null
      return
    }
    if (msg == "missing params") {
      this.msg = msg
      this.status = 400
    }
  }
}
