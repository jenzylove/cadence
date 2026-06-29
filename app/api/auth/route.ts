import { query, rowsToObjects } from "@/lib/db/client"
import { setSessionCookie } from "@/lib/session"
import bcrypt from "bcryptjs"
import { NextResponse } from "next/server"

const MIN_PASSWORD_LENGTH = 8

export async function POST(request: Request) {
  try {
    const body = await request.json()
    const { mode, name, password, category, platforms } = body

    if (mode !== "signup" && mode !== "login") {
      return NextResponse.json(
        { success: false, error: "Invalid auth mode" },
        { status: 400 }
      )
    }
    if (!name || typeof name !== "string" || !name.trim()) {
      return NextResponse.json(
        { success: false, error: "Business name is required" },
        { status: 400 }
      )
    }
    if (!password || typeof password !== "string") {
      return NextResponse.json(
        { success: false, error: "Password is required" },
        { status: 400 }
      )
    }

    if (mode === "signup") {
      if (password.length < MIN_PASSWORD_LENGTH) {
        return NextResponse.json(
          { success: false, error: `Password must be at least ${MIN_PASSWORD_LENGTH} characters` },
          { status: 400 }
        )
      }

      const platformsStr =
        Array.isArray(platforms) && platforms.length > 0
          ? platforms.join(",")
          : "instagram,x,linkedin"
      const passwordHash = await bcrypt.hash(password, 10)

      let rows
      try {
        const result = await query(
          `INSERT INTO businesses (name, password_hash, category, platforms)
           VALUES (:name, :passwordHash, :category, :platforms)
           RETURNING id, name, category, platforms, created_at`,
          [
            { name: "name", value: { stringValue: name.trim() } },
            { name: "passwordHash", value: { stringValue: passwordHash } },
            { name: "category", value: { stringValue: category || "other" } },
            { name: "platforms", value: { stringValue: platformsStr } },
          ]
        )
        rows = rowsToObjects(result)
      } catch (error) {
        const message = error instanceof Error ? error.message : String(error)
        // Postgres unique_violation on businesses.name
        if (/duplicate key|unique/i.test(message)) {
          return NextResponse.json(
            { success: false, error: "That business name is already taken" },
            { status: 409 }
          )
        }
        throw error
      }

      const business = rows[0] as { id: number }
      await setSessionCookie(business.id)
      return NextResponse.json({ success: true, data: rows[0] })
    }

    // mode === "login"
    const result = await query(
      "SELECT id, name, password_hash, category, platforms, created_at FROM businesses WHERE name = :name",
      [{ name: "name", value: { stringValue: name.trim() } }]
    )
    const rows = rowsToObjects(result)
    const business = rows[0] as
      | { id: number; password_hash: string | null }
      | undefined

    if (!business || !business.password_hash) {
      return NextResponse.json(
        { success: false, error: "Incorrect business name or password" },
        { status: 401 }
      )
    }

    const valid = await bcrypt.compare(password, business.password_hash)
    if (!valid) {
      return NextResponse.json(
        { success: false, error: "Incorrect business name or password" },
        { status: 401 }
      )
    }

    await setSessionCookie(business.id)
    const { password_hash, ...safe } = business as Record<string, unknown>
    void password_hash
    return NextResponse.json({ success: true, data: safe })
  } catch (error) {
    return NextResponse.json(
      { success: false, error: error instanceof Error ? error.message : String(error) },
      { status: 500 }
    )
  }
}
