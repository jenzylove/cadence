import { query, rowsToObjects } from "@/lib/db/client"
import { requireSessionBusinessId, UnauthenticatedError } from "@/lib/session"
import { NextResponse } from "next/server"

export async function GET(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const sessionBusinessId = await requireSessionBusinessId()
    const { id } = await params
    const businessId = parseInt(id, 10)

    if (isNaN(businessId)) {
      return NextResponse.json(
        { success: false, error: "Invalid business id" },
        { status: 400 }
      )
    }

    if (businessId !== sessionBusinessId) {
      return NextResponse.json(
        { success: false, error: "Forbidden" },
        { status: 403 }
      )
    }

    const result = await query(
      `SELECT po.approved_at
       FROM posts po
       JOIN products p ON po.product_id = p.id
       WHERE p.business_id = :businessId AND po.status = 'approved'
       ORDER BY po.approved_at DESC
       LIMIT 1`,
      [{ name: "businessId", value: { longValue: businessId } }]
    )

    const rows = rowsToObjects(result)

    if (rows.length === 0) {
      return NextResponse.json({
        success: true,
        data: { type: "none", message: "Nothing approved yet. Your first post is one tap away." },
      })
    }

    const lastApproved = new Date(rows[0].approved_at as string)
    const daysSince = Math.floor((Date.now() - lastApproved.getTime()) / (1000 * 60 * 60 * 24))

    let message: string
    let type: string

    if (daysSince === 0) {
      type = "good"
      message = "You approved something today. The queue is moving."
    } else if (daysSince === 1) {
      type = "neutral"
      message = "It's been a day since your last approval. Worth a quick check-in."
    } else if (daysSince <= 6) {
      type = "warning"
      message = `It's been ${daysSince} days since you approved a post. The queue is filling up faster than you're using it.`
    } else {
      type = "alert"
      message = `It's been over a week since you approved a post. Your business has been quiet on socials this whole time.`
    }

    return NextResponse.json({ success: true, data: { type, message, daysSince } })
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