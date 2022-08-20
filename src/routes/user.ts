import "../moduleResolver"
import { Router, Request, Response } from "express"
import Format from "@class/responseFormat"

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const router = Router()

//* @route GET /user
//* @desc Get users
//* @access PRIVATE
router.get("/", async (_req: Request, res: Response) => {
  const data = await prisma.user.findMany()
  const resa = new Format(false, data)
  res.json(resa)
})

//* @route GET /user/:id
//* @desc Get user
//* @access PRIVATE
router.get("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)

  const data = await prisma.user.findUnique({
    where: {
      id: id
    }
  })

  res.json(data ? new Format(false, [data]) : new Format(true, null))
})

//* @route POST /user
//* @desc Post new user
//* @access PRIVATE
router.post("/", async (req: Request, res: Response) => {
  const { name, username, password } = req.body

  if (!name || !username || !password) {
    res.json(new Format(true, req.body, "missing params"))
  }

  const user = await prisma.user.create({
    data: {
      name,
      password,
      username
    }
  })

  res.json(new Format(false, [user]))
})

//* @route DELETE /user
//* @desc Delete user
//* @access PRIVATE
router.delete("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)

  const exists = await prisma.user.findUnique({
    where: {
      id: id
    }
  })

  if (!exists) {
    res.json(new Format(true, null))
  }

  const user = await prisma.user.delete({
    where: {
      id: id
    }
  })

  res.json(new Format(false, [user]))
})

//* @route PUT /user
//* @desc Update user
//* @access PRIVATE
router.put("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  const updatedUser = req.body

  const exists = await prisma.user.findUnique({
    where: {
      id: id
    }
  })

  if (!exists) {
    res.json(new Format(true, null))
  }

  const user = await prisma.user.update({
    where: {
      id: id
    },
    data: updatedUser
  })

  res.json(new Format(false, [user]))
})

export default router
