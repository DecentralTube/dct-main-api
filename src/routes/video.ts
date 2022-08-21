import "../moduleResolver"
import { Router, Request, Response } from "express"
import Format from "@formats/video.format"

import { PrismaClient } from "@prisma/client"

const prisma = new PrismaClient()
const router = Router()

//* @route GET /video
//* @desc Get videos
//* @access PRIVATE
router.get("/", async (_req: Request, res: Response) => {
  const data = await prisma.video.findMany()
  res.json(new Format(false, data))
})

//* @route GET /video/:id
//* @desc Get video
//* @access PRIVATE
router.get("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)

  const data = await prisma.video.findUnique({
    where: {
      id: id
    }
  })

  res.json(data ? new Format(false, [data]) : new Format(true, null))
})

//* @route POST /video
//* @desc Post new video
//* @access PRIVATE
router.post("/", async (req: Request, res: Response) => {
  const { title, video, authorUsername } = req.body

  if (!title || !video || !authorUsername) {
    res.json(new Format(true, req.body, "missing params"))
    return
  }

  const newVideo = await prisma.video.create({
    data: {
      title,
      video,
      authorUsername
    }
  })

  res.json(new Format(false, [newVideo]))
})

//* @route DELETE /video
//* @desc Delete video
//* @access PRIVATE
router.delete("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)

  const exists = await prisma.video.findUnique({
    where: {
      id: id
    }
  })

  if (!exists) {
    res.json(new Format(true, null))
  }

  const video = await prisma.video.delete({
    where: {
      id: id
    }
  })

  res.json(new Format(false, [video]))
})

//* @route PUT /video
//* @desc Update video
//* @access PRIVATE
router.put("/:id", async (req: Request, res: Response) => {
  const id = parseInt(req.params.id)
  const updatedVideo = req.body

  const exists = await prisma.video.findUnique({
    where: {
      id: id
    }
  })

  if (!exists) {
    res.json(new Format(true, null))
  }

  const video = await prisma.video.update({
    where: {
      id: id
    },
    data: updatedVideo
  })

  res.json(new Format(false, [video]))
})

export default router
