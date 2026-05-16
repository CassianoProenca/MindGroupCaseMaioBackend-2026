import { Router } from "express"

import {
  getMyDashboardMetrics,
  getMyProfile,
  getMyRecentActivity,
  updateMyProfile,
} from "../controllers/profileController.js"
import { authenticate } from "../middlewares/auth.js"

export const profileRoutes = Router()

profileRoutes.get("/me", authenticate, getMyProfile)
profileRoutes.get("/me/dashboard", authenticate, getMyDashboardMetrics)
profileRoutes.get("/me/recent-activity", authenticate, getMyRecentActivity)
profileRoutes.put("/me", authenticate, updateMyProfile)
