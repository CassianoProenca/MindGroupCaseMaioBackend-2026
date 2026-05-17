import { prisma } from "../config/prisma.js"
import { publicUserSelect } from "../mappers/userMapper.js"

export function findByEmail(email: string) {
  return prisma.user.findUnique({ where: { email } })
}

export function findById(id: number) {
  return prisma.user.findUnique({ where: { id } })
}

export function findPublicById(id: number) {
  return prisma.user.findUnique({ where: { id }, select: publicUserSelect })
}

const profileSelect = {
  id: true,
  name: true,
  email: true,
  bio: true,
  avatarUrl: true,
  role: true,
  createdAt: true,
  updatedAt: true,
} as const

export function findProfileById(id: number) {
  return prisma.user.findUnique({ where: { id }, select: profileSelect })
}

type CreateUserData = {
  name: string
  email: string
  passwordHash: string
}

export function create(data: CreateUserData) {
  return prisma.user.create({ data, select: publicUserSelect })
}

type UpdateProfileData = {
  name: string
  bio: string | null | undefined
  avatarUrl: string | null
}

export function updateProfile(id: number, data: UpdateProfileData) {
  return prisma.user.update({ where: { id }, data, select: profileSelect })
}

export function findByResetTokenHash(resetTokenHash: string) {
  return prisma.user.findFirst({ where: { resetTokenHash } })
}

type ResetTokenData = {
  resetTokenHash: string
  resetTokenExpiresAt: Date
}

export function setResetToken(id: number, data: ResetTokenData) {
  return prisma.user.update({ where: { id }, data })
}

export function clearResetTokenAndSetPassword(id: number, passwordHash: string) {
  return prisma.user.update({
    where: { id },
    data: {
      passwordHash,
      resetTokenHash: null,
      resetTokenExpiresAt: null,
    },
  })
}
