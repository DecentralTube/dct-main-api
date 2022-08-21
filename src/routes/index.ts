import { Router } from "express"

//? Imports
import user from "./user"
import video from "./video"

const router = Router()

//? Routes
router.use("/user", user)
router.use("/video", video)

export default router
