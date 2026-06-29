import { requireSessionBusinessId, UnauthenticatedError } from "@/lib/session"
import { lookup } from "node:dns/promises"
import { isIP } from "node:net"
import { NextResponse } from "next/server"

export const runtime = "nodejs"

const FETCH_TIMEOUT_MS = 5000
const MAX_REDIRECTS = 3
const MAX_BYTES = 2_000_000 // 2 MB cap on scanned HTML

function isPrivateIPv4(ip: string): boolean {
  const parts = ip.split(".").map(Number)
  if (parts.length !== 4 || parts.some((n) => Number.isNaN(n))) return true
  const [a, b] = parts
  if (a === 0 || a === 10 || a === 127) return true
  if (a === 169 && b === 254) return true // link-local incl. cloud metadata (169.254.169.254)
  if (a === 172 && b >= 16 && b <= 31) return true
  if (a === 192 && b === 168) return true
  if (a === 100 && b >= 64 && b <= 127) return true // CGNAT
  if (a >= 224) return true // multicast / reserved
  return false
}

function isPrivateIPv6(ip: string): boolean {
  const v = ip.toLowerCase()
  if (v === "::1" || v === "::") return true
  if (v.startsWith("fe80")) return true // link-local
  if (v.startsWith("fc") || v.startsWith("fd")) return true // unique local
  const mapped = v.match(/::ffff:(\d+\.\d+\.\d+\.\d+)$/)
  if (mapped) return isPrivateIPv4(mapped[1])
  return false
}

function isBlockedAddress(ip: string): boolean {
  const family = isIP(ip)
  if (family === 4) return isPrivateIPv4(ip)
  if (family === 6) return isPrivateIPv6(ip)
  return true // unknown family -> block
}

// Fetch following redirects manually, re-validating the resolved IP of every
// hop so a redirect can't bounce us to an internal/metadata address.
async function safeFetch(initialUrl: string): Promise<Response> {
  let current = initialUrl
  for (let hop = 0; hop <= MAX_REDIRECTS; hop++) {
    const parsed = new URL(current)
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      throw new Error("Only http and https URLs are supported")
    }

    const { address } = await lookup(parsed.hostname)
    if (isBlockedAddress(address)) {
      throw new Error("That URL points to a disallowed address")
    }

    const controller = new AbortController()
    const timer = setTimeout(() => controller.abort(), FETCH_TIMEOUT_MS)
    let res: Response
    try {
      res = await fetch(current, {
        signal: controller.signal,
        redirect: "manual",
        headers: { "user-agent": "CadenceBot/1.0 (+product-import)" },
      })
    } finally {
      clearTimeout(timer)
    }

    if (res.status >= 300 && res.status < 400) {
      const location = res.headers.get("location")
      if (!location) return res
      current = new URL(location, current).toString()
      continue
    }
    return res
  }
  throw new Error("Too many redirects")
}

function decodeEntities(text: string): string {
  return text
    .replace(/&amp;/g, "&")
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/&#x27;/g, "'")
    .replace(/&lt;/g, "<")
    .replace(/&gt;/g, ">")
    .trim()
}

function extractMeta(html: string, property: string): string | null {
  const patterns = [
    new RegExp(`<meta[^>]+(?:property|name)=["']${property}["'][^>]+content=["']([^"']*)["']`, "i"),
    new RegExp(`<meta[^>]+content=["']([^"']*)["'][^>]+(?:property|name)=["']${property}["']`, "i"),
  ]
  for (const re of patterns) {
    const match = html.match(re)
    if (match) return decodeEntities(match[1])
  }
  return null
}

export async function POST(request: Request) {
  try {
    await requireSessionBusinessId()

    const body = await request.json()
    const { url } = body
    if (!url || typeof url !== "string") {
      return NextResponse.json(
        { success: false, error: "A URL is required" },
        { status: 400 }
      )
    }

    let parsed: URL
    try {
      parsed = new URL(url)
    } catch {
      return NextResponse.json(
        { success: false, error: "That doesn't look like a valid URL" },
        { status: 400 }
      )
    }
    if (parsed.protocol !== "http:" && parsed.protocol !== "https:") {
      return NextResponse.json(
        { success: false, error: "Only http and https URLs are supported" },
        { status: 400 }
      )
    }

    let res: Response
    try {
      res = await safeFetch(parsed.toString())
    } catch (error) {
      return NextResponse.json(
        { success: false, error: error instanceof Error ? error.message : "Could not fetch that URL" },
        { status: 400 }
      )
    }

    if (!res.ok) {
      return NextResponse.json(
        { success: false, error: `The page returned status ${res.status}` },
        { status: 400 }
      )
    }

    const contentLength = Number(res.headers.get("content-length") ?? 0)
    if (contentLength && contentLength > MAX_BYTES) {
      return NextResponse.json(
        { success: false, error: "That page is too large to import" },
        { status: 400 }
      )
    }

    const html = (await res.text()).slice(0, MAX_BYTES)

    const ogTitle = extractMeta(html, "og:title")
    const titleTag = html.match(/<title[^>]*>([^<]*)<\/title>/i)
    const name = ogTitle || (titleTag ? decodeEntities(titleTag[1]) : "")
    const details = extractMeta(html, "og:description") || extractMeta(html, "description") || ""
    const photoUrl = extractMeta(html, "og:image") || ""

    return NextResponse.json({
      success: true,
      data: { name, details, photoUrl },
    })
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
