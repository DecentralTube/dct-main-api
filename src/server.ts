import express, { Application, Request, Response } from "express"
import routes from "./routes"

export default function createServer() {
  const app: Application = express()

  app.get("/", (req: Request, res: Response) => {
    res.send("Hello World!")
  })
  // For parsing application/json
  app.use(express.json())

  app.use(routes)

  return app
}
