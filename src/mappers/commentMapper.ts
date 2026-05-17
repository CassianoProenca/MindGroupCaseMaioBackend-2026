type CommentEntity = {
  id: number
  content: string
  createdAt: Date
  updatedAt: Date
  author: {
    id: number
    name: string
    email: string
    avatarUrl: string | null
  }
}

export function mapComment(comment: CommentEntity) {
  return {
    id: comment.id,
    content: comment.content,
    createdAt: comment.createdAt,
    updatedAt: comment.updatedAt,
    author: comment.author,
  }
}
