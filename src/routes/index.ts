import { Router } from "express"

//? Imports
import user from "./user"

const router = Router()

//? Routes
router.use("/user", user)

export default router
