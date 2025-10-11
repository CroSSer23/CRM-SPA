import { createUploadthing, type FileRouter } from "uploadthing/next"
import { auth } from "@clerk/nextjs"

const f = createUploadthing()

export const ourFileRouter = {
  attachmentUploader: f({
    pdf: { maxFileSize: "4MB", maxFileCount: 5 },
    image: { maxFileSize: "4MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      const { userId } = auth()

      if (!userId) throw new Error("Unauthorized")

      return { userId }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId)
      console.log("File URL:", file.url)

      return { uploadedBy: metadata.userId, url: file.url }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter

