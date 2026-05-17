import type { Request, Response } from "express"

import { profileSchema } from "../schemas/profileSchemas.js"
import * as profileService from "../services/profileService.js"
import { makePaginationMeta } from "../utils/pagination.js"
import { requireUser } from "../utils/requireUser.js"

const MAX_RECENT_ACTIVITY_PER_PAGE = 50
const DEFAULT_RECENT_ACTIVITY_PER_PAGE = 3

function toPositiveInteger(value: unknown, fallback: number) {
  const parsed = Number(value)
  return Number.isInteger(parsed) && parsed > 0 ? parsed : fallback
}

export async function getMyProfile(request: Request, response: Response) {
  const user = requireUser(request)
  const profile = await profileService.getMyProfile(user.id)
  response.json({ profile })
}

export async function updateMyProfile(request: Request, response: Response) {
  const user = requireUser(request)
  const data = profileSchema.parse(request.body)
  const profile = await profileService.updateMyProfile(user.id, data)
  response.json({ profile })
}

export async function getMyDashboardMetrics(request: Request, response: Response) {
  const user = requireUser(request)
  const metrics = await profileService.getMyDashboardMetrics(user.id)
  response.json({ metrics })
}

export async function getMyRecentActivity(request: Request, response: Response) {
  const user = requireUser(request)
  const page = toPositiveInteger(request.query.page, 1)
  const perPage = Math.min(
    toPositiveInteger(request.query.perPage, DEFAULT_RECENT_ACTIVITY_PER_PAGE),
    MAX_RECENT_ACTIVITY_PER_PAGE,
  )

  const { items, total } = await profileService.getMyRecentActivity({ userId: user.id, page, perPage })
  response.json({ activity: items, meta: makePaginationMeta(total, page, perPage) })
}
