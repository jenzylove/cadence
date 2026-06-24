import { query, rowsToObjects } from "@/lib/db/client"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const result = await query(
      `SELECT id, product_id, platform, angle, caption, hashtags, scheduled_for, status, created_at
       FROM posts ORDER BY scheduled_for ASC`
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