import { Router } from "express"

import {
  createArticle,
  createCategory,
  deleteArticle,
  deleteCategory,
  getArticle,
  getArticleBanner,
  listCategories,
  listArticles,
  updateCategory,
  updateArticle,
} from "../controllers/articleController.js"
import { createComment, listComments } from "../controllers/commentController.js"
import {
  getArticleLikeStatus,
  likeArticle,
  registerArticleRead,
  registerArticleView,
  unlikeArticle,
} from "../controllers/engagementController.js"
import { authenticate, optionalAuthenticate } from "../middlewares/auth.js"
import { upload } from "../middlewares/upload.js"

export const articleRoutes = Router()

articleRoutes.get("/", listArticles)
articleRoutes.get("/categories", listCategories)
articleRoutes.post("/categories", authenticate, createCategory)
articleRoutes.put("/categories/:categoryId", authenticate, updateCategory)
articleRoutes.delete("/categories/:categoryId", authenticate, deleteCategory)
articleRoutes.get("/:id", getArticle)
articleRoutes.get("/:id/banner", getArticleBanner)
articleRoutes.get("/:id/comments", listComments)
articleRoutes.get("/:id/like", authenticate, getArticleLikeStatus)
articleRoutes.post("/:id/comments", authenticate, createComment)
articleRoutes.post("/:id/view", registerArticleView)
articleRoutes.post("/:id/read", optionalAuthenticate, registerArticleRead)
articleRoutes.post("/:id/like", authenticate, likeArticle)
articleRoutes.delete("/:id/like", authenticate, unlikeArticle)
articleRoutes.post("/", authenticate, upload.single("banner"), createArticle)
articleRoutes.put("/:id", authenticate, upload.single("banner"), updateArticle)
articleRoutes.delete("/:id", authenticate, deleteArticle)
