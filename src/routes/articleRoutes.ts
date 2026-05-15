import { Router } from "express"

import {
  createArticle,
  deleteArticle,
  getArticle,
  getArticleBanner,
  listArticles,
  updateArticle,
} from "../controllers/articleController.js"
import { createComment, listComments } from "../controllers/commentController.js"
import { authenticate } from "../middlewares/auth.js"
import { upload } from "../middlewares/upload.js"

export const articleRoutes = Router()

articleRoutes.get("/", listArticles)
articleRoutes.get("/:id", getArticle)
articleRoutes.get("/:id/banner", getArticleBanner)
articleRoutes.get("/:id/comments", listComments)
articleRoutes.post("/:id/comments", authenticate, createComment)
articleRoutes.post("/", authenticate, upload.single("banner"), createArticle)
articleRoutes.put("/:id", authenticate, upload.single("banner"), updateArticle)
articleRoutes.delete("/:id", authenticate, deleteArticle)
