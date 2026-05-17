export const publicUserSelect = {
  id: true,
  name: true,
  email: true,
  bio: true,
  avatarUrl: true,
  role: true,
} as const

type PublicUserEntity = {
  id: number
  name: string
  email: string
  bio: string | null
  avatarUrl: string | null
  role: string
}

export function mapPublicUser(user: PublicUserEntity) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    role: user.role,
  }
}
