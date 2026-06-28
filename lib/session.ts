import { cookies } from "next/headers"
import { SignJWT, jwtVerify } from "jose"

const SESSION_COOKIE = "cadence_session"
const SESSION_DURATION = 60 * 60 * 24 * 30 // 30 days, in seconds

function getSecretKey() {
  const secret = process.env.SESSION_SECRET
  if (!secret) {
    throw new Error("SESSION_SECRET environment variable is not set")
  }
  return new TextEncoder().encode(secret)
}

export async function setSessionCookie(businessId: number) {
  const token = await new SignJWT({ businessId })
    .setProtectedHeader({ alg: "HS256" })
    .setIssuedAt()
    .setExpirationTime(`${SESSION_DURATION}s`)
    .sign(getSecretKey())

  const cookieStore = await cookies()
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    path: "/",
    maxAge: SESSION_DURATION,
  })
}

export async function getSessionBusinessId(): Promise<number | null> {
  const cookieStore = await cookies()
  const token = cookieStore.get(SESSION_COOKIE)?.value
  if (!token) return null

  try {
    const { payload } = await jwtVerify(token, getSecretKey())
    return typeof payload.businessId === "number" ? payload.businessId : null
  } catch {
    return null
  }
}

export class UnauthenticatedError extends Error {
  constructor() {
    super("unauthenticated")
  }
}

export async function requireSessionBusinessId(): Promise<number> {
  const businessId = await getSessionBusinessId()
  if (businessId === null) {
    throw new UnauthenticatedError()
  }
  return businessId
}
