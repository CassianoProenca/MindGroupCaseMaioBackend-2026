import { describe, expect, it } from "vitest"

import { mapPublicUser, publicUserSelect } from "../../src/mappers/userMapper.js"

describe("mapPublicUser", () => {
  it("exclui dados sensiveis e preserva campos publicos", () => {
    const result = mapPublicUser({
      id: 1,
      name: "Ana",
      email: "ana@example.com",
      bio: null,
      avatarUrl: null,
      role: "AUTHOR",
    })
    expect(result).toEqual({
      id: 1,
      name: "Ana",
      email: "ana@example.com",
      bio: null,
      avatarUrl: null,
      role: "AUTHOR",
    })
    expect(result).not.toHaveProperty("passwordHash")
  })

  it("publicUserSelect nao expoe passwordHash", () => {
    expect(publicUserSelect).not.toHaveProperty("passwordHash")
    expect(publicUserSelect).toMatchObject({
      id: true,
      name: true,
      email: true,
      bio: true,
      avatarUrl: true,
      role: true,
    })
  })
})
