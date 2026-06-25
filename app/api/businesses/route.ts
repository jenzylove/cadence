import { query, rowsToObjects } from "@/lib/db/client"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, category, platforms } = body

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { success: false, error: "Business name is required" },
        { status: 400 }
      )
    }

    const platformsStr = Array.isArray(platforms) && platforms.length > 0
      ? platforms.join(",")
      : "instagram,x,linkedin"

    const result = await query(
      `INSERT INTO businesses (name, category, platforms)
       VALUES (:name, :category, :platforms)
       RETURNING id, name, category, platforms, created_at`,
      [
        { name: "name", value: { stringValue: name } },
        { name: "category", value: { stringValue: category || "other" } },
        { name: "platforms", value: { stringValue: platformsStr } },
      ]
    )

    const rows = rowsToObjects(result)
    return NextResponse.json({ success: true, data: rows[0] })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const result = await query(
      "SELECT id, name, category, platforms, created_at FROM businesses ORDER BY created_at DESC"
    )
    const rows = rowsToObjects(result)
    return NextResponse.json({ success: true, data: rows })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}