import Anthropic from "@anthropic-ai/sdk"

const anthropic = new Anthropic({
  apiKey: process.env.ANTHROPIC_API_KEY,
})

const ANGLE_NAMES = ["benefit", "proof", "howto", "bts", "question", "offer", "story"]

const ANGLE_MEANINGS: Record<string, string> = {
  benefit: "highlight what the customer gains, specific to what this exact product does",
  proof: "social proof, customer reaction, or results",
  howto: "a quick tip or use-case for the product",
  bts: "behind-the-scenes — but only if there's a real making/sourcing/curating story. If the business resells or distributes an existing product rather than making it, use this slot instead for a tip about how to use the product correctly, or why this specific item was chosen to sell",
  question: "an engaging question that invites replies",
  offer: "a promotion, urgency, or call to action",
  story: "the founder's or brand's deeper why",
}

type GeneratedPost = {
  platform: string
  angle: string
  caption: string
  hashtags: string
}

export async function generatePostsForProduct(
  productName: string,
  productDetails: string | null,
  platforms: string[],
  category: string = "other"
): Promise<GeneratedPost[]> {
  // Cycle through the business's actual platforms across the 7 angles,
  // so every angle still gets covered, but only on platforms the business uses.
  const assignments = ANGLE_NAMES.map((angle, i) => ({
    angle,
    platform: platforms[i % platforms.length],
  }))

  const prompt = `You're writing social media captions for a small ${category} business selling "${productName}". Every caption must be directly relevant to what this specific product is and does, not about packaging, shipping, or unrelated business operations unless the angle specifically calls for that.
${productDetails ? `Product details: ${productDetails}` : ""}

This business only posts on these platforms: ${platforms.join(", ")}.

Write exactly ${assignments.length} captions, one for each of these platform/angle combinations:
${assignments.map((a, i) => `${i + 1}. Platform: ${a.platform}, Angle: ${a.angle} (${ANGLE_MEANINGS[a.angle]})`).join("\n")}

Match each caption's length and tone to its platform. Instagram is warm and visual. X is short and punchy. LinkedIn is narrative and professional. TikTok is casual and hook-first. Facebook is conversational and community-oriented. WhatsApp is a short, direct broadcast message to existing customers, written like a quick personal update, not a public post, often just 1-2 sentences.

Hard rules, follow exactly:
- Never use em dashes or double hyphens (— or --) anywhere in any caption. Use a period, comma, or just a line break instead.
- Never start a caption with "Imagine", "Picture this", "Introducing", or "Ever wonder". These are overused AI defaults.
- Do not use the words "elevate", "unlock", "seamless", "journey", "game-changer", or "passionate" anywhere.
- Write like a real small business owner posting between customers, not a copywriter pitching a brand. Plain words. Specific details from the product, not vague claims.
- Each caption must sound distinct from the others. Vary sentence length and structure. No two captions should open the same way.

Respond ONLY with a JSON array, no other text, no markdown formatting. Each object must have exactly these keys: "platform", "angle", "caption", "hashtags" (a string of 2-4 relevant hashtags separated by spaces, or empty string for LinkedIn).`

  const response = await anthropic.messages.create({
    model: "claude-sonnet-4-6",
    max_tokens: 2500,
    messages: [{ role: "user", content: prompt }],
  })

  const textBlock = response.content.find((block) => block.type === "text")
  if (!textBlock || textBlock.type !== "text") {
    throw new Error("No text response from Claude")
  }

  const cleaned = textBlock.text.replace(/```json|```/g, "").trim()
  const posts = JSON.parse(cleaned) as GeneratedPost[]

  return posts
}