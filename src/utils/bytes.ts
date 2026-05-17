export function toPrismaBytes(buffer: Buffer) {
  const bytes = new Uint8Array(buffer.length)
  bytes.set(buffer)
  return bytes
}
