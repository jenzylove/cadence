import { query, rowsToObjects } from "@/lib/db/client"
import { getSessionBusinessId } from "@/lib/session"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const businessId = await getSessionBusinessId()
    if (businessId === null) {
      return NextResponse.json(
        { success: false, error: "unauthenticated" },
        { status: 401 }
      )
    }

    const result = await query(
      "SELECT id, name, category, platforms, created_at FROM businesses WHERE id = :id",
      [{ name: "id", value: { longValue: businessId } }]
    )
    const rows = rowsToObjects(result)

    if (rows.length === 0) {
      return NextResponse.json(
        { success: false, error: "unauthenticated" },
        { status: 401 }
      )
    }

    return NextResponse.json({ success: true, data: rows[0] })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
