import { query, rowsToObjects } from "@/lib/db/client"
import { requireSessionBusinessId, UnauthenticatedError } from "@/lib/session"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const businessId = await requireSessionBusinessId()
    const body = await request.json()
    const { name, details, photoUrls } = body

    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { success: false, error: "Product name is required" },
        { status: 400 }
      )
    }

    const result = await query(
      `INSERT INTO products (business_id, name, details, photo_urls)
       VALUES (:businessId, :name, :details, :photoUrls)
       RETURNING id, business_id, name, details, photo_urls, created_at`,
      [
        { name: "businessId", value: { longValue: businessId } },
        { name: "name", value: { stringValue: name } },
        { name: "details", value: details ? { stringValue: details } : { isNull: true } },
        { name: "photoUrls", value: { stringValue: JSON.stringify(photoUrls ?? []) } },
      ]
    )

    const rows = rowsToObjects(result)
    return NextResponse.json({ success: true, data: rows[0] })
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return NextResponse.json({ success: false, error: "unauthenticated" }, { status: 401 })
    }
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function GET() {
  try {
    const businessId = await requireSessionBusinessId()

    const result = await query(
      "SELECT id, business_id, name, details, photo_urls, created_at FROM products WHERE business_id = :businessId ORDER BY created_at DESC",
      [{ name: "businessId", value: { longValue: businessId } }]
    )
    const rows = rowsToObjects(result)
    return NextResponse.json({ success: true, data: rows })
  } catch (error) {
    if (error instanceof UnauthenticatedError) {
      return NextResponse.json({ success: false, error: "unauthenticated" }, { status: 401 })
    }
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}