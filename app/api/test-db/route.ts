import { query, rowsToObjects } from "@/lib/db/client"
import { NextResponse } from "next/server"

export async function GET() {
  try {
    const result = await query("SELECT NOW() as current_time, version() as pg_version")
    const rows = rowsToObjects(result)
    return NextResponse.json({ success: true, data: rows })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}