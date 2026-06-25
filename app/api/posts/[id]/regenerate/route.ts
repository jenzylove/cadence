import { query, rowsToObjects } from "@/lib/db/client"
import { generatePostsForProduct } from "@/lib/generate"
import { NextResponse } from "next/server"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const postId = parseInt(id, 10)

    const postResult = await query(
      `SELECT po.id, po.platform, po.angle, p.name as product_name, p.details as product_details
       FROM posts po
       JOIN products p ON po.product_id = p.id
       WHERE po.id = :id`,
      [{ name: "id", value: { longValue: postId } }]
    )
    const existing = rowsToObjects(postResult)

    if (existing.length === 0) {
      return NextResponse.json(
        { success: false, error: "Post not found" },
        { status: 404 }
      )
    }

    const post = existing[0] as {
      id: number
      platform: string
      angle: string
      product_name: string
      product_details: string | null
    }

    // Generate a single fresh post for the same platform, asking for just that one angle
    const generated = await generatePostsForProduct(
      post.product_name,
      post.product_details,
      [post.platform]
    )

    const newCaption = generated[0]?.caption ?? ""
    const newHashtags = generated[0]?.hashtags ?? ""

    await query(
      "UPDATE posts SET caption = :caption, hashtags = :hashtags, status = 'queued' WHERE id = :id",
      [
        { name: "caption", value: { stringValue: newCaption } },
        { name: "hashtags", value: { stringValue: newHashtags } },
        { name: "id", value: { longValue: postId } },
      ]
    )

    const result = await query(
      "SELECT id, product_id, platform, angle, caption, hashtags, scheduled_for, status FROM posts WHERE id = :id",
      [{ name: "id", value: { longValue: postId } }]
    )

    return NextResponse.json({ success: true, data: rowsToObjects(result)[0] })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}