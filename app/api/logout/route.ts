import { NextResponse } from "next/server"
import { deleteSession } from "@/lib/jwt"
import { redirect } from "next/navigation"

export async function POST() {
  await deleteSession()
  redirect("/")
}
