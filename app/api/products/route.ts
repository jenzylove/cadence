import { query, rowsToObjects } from "@/lib/db/client"
import { NextResponse } from "next/server"

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { businessId, name, details, photoUrls } = body

    if (!businessId) {
      return NextResponse.json(
        { success: false, error: "businessId is required" },
        { status: 400 }
      )
    }
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
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get("businessId")

    const sql = businessId
      ? "SELECT id, business_id, name, details, photo_urls, created_at FROM products WHERE business_id = :businessId ORDER BY created_at DESC"
      : "SELECT id, business_id, name, details, photo_urls, created_at FROM products ORDER BY created_at DESC"

    const params = businessId
      ? [{ name: "businessId", value: { longValue: parseInt(businessId, 10) } }]
      : []

    const result = await query(sql, params)
    const rows = rowsToObjects(result)
    return NextResponse.json({ success: true, data: rows })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}