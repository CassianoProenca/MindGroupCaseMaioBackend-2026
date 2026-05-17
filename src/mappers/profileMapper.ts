type ProfileEntity = {
  id: number
  name: string
  email: string
  bio: string | null
  avatarUrl: string | null
  role: string
  createdAt: Date
  updatedAt: Date
}

export function mapProfile(user: ProfileEntity) {
  return {
    id: user.id,
    name: user.name,
    email: user.email,
    bio: user.bio,
    avatarUrl: user.avatarUrl,
    role: user.role,
    createdAt: user.createdAt,
    updatedAt: user.updatedAt,
  }
}
