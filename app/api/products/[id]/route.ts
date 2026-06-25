import { query } from "@/lib/db/client"
import { NextResponse } from "next/server"

export async function DELETE(
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

    await query("DELETE FROM products WHERE id = :id", [
      { name: "id", value: { longValue: productId } },
    ])

    return NextResponse.json({ success: true })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}