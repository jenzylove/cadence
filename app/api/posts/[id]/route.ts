import { query, rowsToObjects } from "@/lib/db/client"
import { NextResponse } from "next/server"

export async function PATCH(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const postId = parseInt(id, 10)
    const body = await request.json()
    const { status, caption } = body

    if (isNaN(postId)) {
      return NextResponse.json(
        { success: false, error: "Invalid post id" },
        { status: 400 }
      )
    }

    if (status) {
  await query(
    "UPDATE posts SET status = :status, approved_at = :approvedAt WHERE id = :id",
    [
      { name: "status", value: { stringValue: status } },
      { name: "approvedAt", value: status === "approved" ? { stringValue: new Date().toISOString() } : { isNull: true } },
      { name: "id", value: { longValue: postId } },
    ]
  )
}

    if (caption) {
      await query(
        "UPDATE posts SET caption = :caption WHERE id = :id",
        [
          { name: "caption", value: { stringValue: caption } },
          { name: "id", value: { longValue: postId } },
        ]
      )
    }

    const result = await query(
      "SELECT id, product_id, platform, angle, caption, hashtags, scheduled_for, status FROM posts WHERE id = :id",
      [{ name: "id", value: { longValue: postId } }]
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