import { query, rowsToObjects } from "@/lib/db/client"
import { NextResponse } from "next/server"

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const businessId = searchParams.get("businessId")

    const sql = businessId
      ? `SELECT po.id, po.product_id, po.platform, po.angle, po.caption, po.hashtags, po.scheduled_for, po.status, po.created_at
         FROM posts po
         JOIN products p ON po.product_id = p.id
         WHERE p.business_id = :businessId
         ORDER BY po.scheduled_for ASC`
      : `SELECT id, product_id, platform, angle, caption, hashtags, scheduled_for, status, created_at
         FROM posts ORDER BY scheduled_for ASC`

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