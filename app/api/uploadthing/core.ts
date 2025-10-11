import { createUploadthing, type FileRouter } from "uploadthing/next"
import { getCurrentUser } from "@/lib/auth"

const f = createUploadthing()

export const ourFileRouter = {
  attachmentUploader: f({
    pdf: { maxFileSize: "4MB", maxFileCount: 5 },
    image: { maxFileSize: "4MB", maxFileCount: 5 },
  })
    .middleware(async () => {
      const user = await getCurrentUser()

      if (!user) throw new Error("Unauthorized")

      return { userId: user.id }
    })
    .onUploadComplete(async ({ metadata, file }) => {
      console.log("Upload complete for userId:", metadata.userId)
      console.log("File URL:", file.url)

      return { uploadedBy: metadata.userId, url: file.url }
    }),
} satisfies FileRouter

export type OurFileRouter = typeof ourFileRouter
