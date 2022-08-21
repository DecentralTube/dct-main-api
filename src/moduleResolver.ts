import "dotenv/config"
import "module-alias/register"
import path from "path"

import moduleAlias from "module-alias"

const env: string = process.env.NODE_ENV || "development"

//? Register alias
if (env == "development") {
  moduleAlias.addAlias("@src", __dirname + "/")
  moduleAlias.addAlias("@class", __dirname + "/classes/")
  moduleAlias.addAlias("@formats", __dirname + "/classes/formatters/")
} else if (env == "production") {
  moduleAlias.addAlias("@src", path.join(__dirname + "/../build/"))
  moduleAlias.addAlias("@class", path.join(__dirname + "/../build/classes/"))
  moduleAlias.addAlias(
    "@formats",
    path.join(__dirname + "/../build/classes/formatters/")
  )
}
