import { query, rowsToObjects } from "@/lib/db/client"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { name, details, photoUrls } = body

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { success: false, error: "Product name is required" },
        { status: 400 }
      )
    }

    const result = await query(
  `INSERT INTO products (name, details, photo_urls)
   VALUES (:name, :details, :photoUrls)
   RETURNING id, name, details, photo_urls, created_at`,
  [
    { name: "name", value: { stringValue: name } },
    { name: "details", value: details ? { stringValue: details } : { isNull: true } },
    { name: "photoUrls", value: { stringValue: JSON.stringify(photoUrls ?? []) } },
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
      "SELECT id, name, details, photo_urls, created_at FROM products ORDER BY created_at DESC"
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