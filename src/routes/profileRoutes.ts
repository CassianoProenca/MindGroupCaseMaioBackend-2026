import { Router } from "express"

import { getMyProfile, updateMyProfile } from "../controllers/profileController.js"
import { authenticate } from "../middlewares/auth.js"

export const profileRoutes = Router()

profileRoutes.get("/me", authenticate, getMyProfile)
profileRoutes.put("/me", authenticate, updateMyProfile)
