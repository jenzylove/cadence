import { query, rowsToObjects } from "@/lib/db/client"
import { generatePostsForProduct } from "@/lib/generate"
import { NextResponse } from "next/server"

export async function POST(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params
    const productId = parseInt(id, 10)

    if (isNaN(productId)) {
      return NextResponse.json(
        { success: false, error: "Invalid product id" },
        { status: 400 }
      )
    }

    const productResult = await query(
      `SELECT p.id, p.name, p.details, b.platforms
       FROM products p
       JOIN businesses b ON p.business_id = b.id
       WHERE p.id = :id`,
      [{ name: "id", value: { longValue: productId } }]
    )
    const products = rowsToObjects(productResult)

    if (products.length === 0) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      )
    }

    const product = products[0] as {
      id: number
      name: string
      details: string | null
      platforms: string
    }

    const platformList = product.platforms.split(",").map((p) => p.trim())
    
// Clear out any existing posts for this product before generating a fresh batch
await query("DELETE FROM posts WHERE product_id = :productId", [
  { name: "productId", value: { longValue: productId } },
])

    const generatedPosts = await generatePostsForProduct(
      product.name,
      product.details,
      platformList
    )

    const savedPosts = []
    for (let i = 0; i < generatedPosts.length; i++) {
      const post = generatedPosts[i]
      const scheduledFor = new Date()
      scheduledFor.setDate(scheduledFor.getDate() + i)

      const insertResult = await query(
        `INSERT INTO posts (product_id, platform, angle, caption, hashtags, scheduled_for, status)
         VALUES (:productId, :platform, :angle, :caption, :hashtags, :scheduledFor, 'queued')
         RETURNING id, product_id, platform, angle, caption, hashtags, scheduled_for, status, created_at`,
        [
          { name: "productId", value: { longValue: productId } },
          { name: "platform", value: { stringValue: post.platform } },
          { name: "angle", value: { stringValue: post.angle } },
          { name: "caption", value: { stringValue: post.caption } },
          { name: "hashtags", value: { stringValue: post.hashtags ?? "" } },
          { name: "scheduledFor", value: { stringValue: scheduledFor.toISOString() } },
        ]
      )
      savedPosts.push(rowsToObjects(insertResult)[0])
    }

    return NextResponse.json({ success: true, data: savedPosts })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}