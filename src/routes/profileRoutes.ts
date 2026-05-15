import { Router } from "express"

import { getMyDashboardMetrics, getMyProfile, updateMyProfile } from "../controllers/profileController.js"
import { authenticate } from "../middlewares/auth.js"

export const profileRoutes = Router()

profileRoutes.get("/me", authenticate, getMyProfile)
profileRoutes.get("/me/dashboard", authenticate, getMyDashboardMetrics)
profileRoutes.put("/me", authenticate, updateMyProfile)
