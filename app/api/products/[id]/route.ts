import { query, rowsToObjects } from "@/lib/db/client"
import { requireSessionBusinessId, UnauthenticatedError } from "@/lib/session"
import { NextResponse } from "next/server"

export async function DELETE(
  request: Request,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const businessId = await requireSessionBusinessId()
    const { id } = await params
    const productId = parseInt(id, 10)

    if (isNaN(productId)) {
      return NextResponse.json(
        { success: false, error: "Invalid product id" },
        { status: 400 }
      )
    }

    const ownerResult = await query(
      "SELECT business_id FROM products WHERE id = :id",
      [{ name: "id", value: { longValue: productId } }]
    )
    const owner = rowsToObjects(ownerResult)[0] as { business_id: number } | undefined

    if (!owner || owner.business_id !== businessId) {
      return NextResponse.json(
        { success: false, error: "Product not found" },
        { status: 404 }
      )
    }

    await query("DELETE FROM products WHERE id = :id", [
      { name: "id", value: { longValue: productId } },
    ])

    return NextResponse.json({ success: true })
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