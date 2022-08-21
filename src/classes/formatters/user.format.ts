import { User } from "@prisma/client"

export default class Format {
  error: boolean
  msg: string
  status: number
  count?: number
  data: User[] | User | null

  constructor(error: boolean, data: User[] | null, msg?: string) {
    //* default values
    this.error = error
    this.status = error ? 500 : 200
    this.msg = error ? "server error" : "success"

    //* (400) - Missing param error
    if (msg == "missing params") {
      this.msg = msg
      this.status = 400
      this.data = null
      return
    }

    //* (404) - Not found error
    if (data == null || !data[0]) {
      this.error = true
      this.status = 404
      this.msg = "not found"
      this.data = null
      return
    }

    //* Format data
    if (data != null) {
      //* Multiple users
      if (data[1]) {
        this.count = data.length
        this.data = data
        return
      }
      //* One user
      this.data = data[0]
    } else this.data = null
  }
}
