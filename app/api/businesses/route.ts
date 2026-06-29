import { query, rowsToObjects } from "@/lib/db/client"
import { NextResponse } from "next/server"

// Business creation now happens through POST /api/auth (signup), which
// hashes a password and issues the session cookie. The old passwordless
// POST here has been removed so there's no unauthenticated way to create
// a business.

export async function GET() {
  try {
    const result = await query(
      "SELECT id, name, category, platforms, created_at FROM businesses ORDER BY created_at DESC"
    )
    const rows = rowsToObjects(result)
    return NextResponse.json({ success: true, data: rows })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}