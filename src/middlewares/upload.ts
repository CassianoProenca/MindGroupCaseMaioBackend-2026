import multer from "multer"

export const upload = multer({
  storage: multer.memoryStorage(),
  limits: {
    fileSize: 4 * 1024 * 1024,
  },
  fileFilter: (_request, file, callback) => {
    if (!file.mimetype.startsWith("image/")) {
      callback(new Error("O banner precisa ser uma imagem."))
      return
    }

    callback(null, true)
  },
})
