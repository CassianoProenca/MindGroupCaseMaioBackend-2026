const WORDS_PER_MINUTE = 220
const IMAGE_SECONDS = 12

function stripMarkdown(content: string) {
  return content
    .replace(/!\[[^\]]*]\([^)]+\)/g, " ")
    .replace(/<img\b[^>]*>/gi, " ")
    .replace(/```[\s\S]*?```/g, " ")
    .replace(/`[^`]+`/g, " ")
    .replace(/[#>*_~[\]()]/g, " ")
    .replace(/\s+/g, " ")
    .trim()
}

export function getReadingTimeMinutes(content: string) {
  const markdownImages = content.match(/!\[[^\]]*]\([^)]+\)/g)?.length ?? 0
  const htmlImages = content.match(/<img\b[^>]*>/gi)?.length ?? 0
  const plainText = stripMarkdown(content)
  const words = plainText ? plainText.split(/\s+/).filter(Boolean).length : 0
  const readingSeconds = (words / WORDS_PER_MINUTE) * 60 + (markdownImages + htmlImages) * IMAGE_SECONDS

  return Math.max(1, Math.ceil(readingSeconds / 60))
}
