declare global {
  namespace Express {
    interface Request {
      user?: {
        id: number
        name: string
        email: string
        bio: string | null
        avatarUrl: string | null
        role: string
      }
    }
  }
}

export {}
