import type { Request, Response } from "express"

import { profileSchema } from "../schemas/profileSchemas.js"
import * as profileService from "../services/profileService.js"
import { getPagination, makePaginationMeta } from "../utils/pagination.js"
import { requireUser } from "../utils/requireUser.js"

export async function getMyProfile(request: Request, response: Response) {
  const user = requireUser(request)
  const profile = await profileService.getMyProfile(user.id)
  response.json({ profile })
}

export async function updateMyProfile(request: Request, response: Response) {
  const user = requireUser(request)
  const data = profileSchema.parse(request.body)
  const { profile, token } = await profileService.updateMyProfile(user.id, data)
  response.json({ profile, token })
}

export async function getMyDashboardMetrics(request: Request, response: Response) {
  const user = requireUser(request)
  const metrics = await profileService.getMyDashboardMetrics(user.id)
  response.json({ metrics })
}

export async function getMyRecentActivity(request: Request, response: Response) {
  const user = requireUser(request)
  const { page, perPage, skip, take } = getPagination(request, { defaultPerPage: 3 })
  const { items, total } = await profileService.getMyRecentActivity({ userId: user.id, skip, take })
  response.json({ activity: items, meta: makePaginationMeta(total, page, perPage) })
}
