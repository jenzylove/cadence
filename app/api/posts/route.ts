import { query, rowsToObjects } from "@/lib/db/client"
import { requireSessionBusinessId, UnauthenticatedError } from "@/lib/session"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const businessId = await requireSessionBusinessId()

    const result = await query(
      `SELECT po.id, po.product_id, po.platform, po.angle, po.caption, po.hashtags, po.scheduled_for, po.status, po.created_at
       FROM posts po
       JOIN products p ON po.product_id = p.id
       WHERE p.business_id = :businessId
       ORDER BY po.scheduled_for ASC`,
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