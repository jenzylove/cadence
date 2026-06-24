import { RDSDataClient, ExecuteStatementCommand } from "@aws-sdk/client-rds-data"
import { readFileSync } from "fs"
import { fileURLToPath } from "url"
import { dirname, join } from "path"
import dotenv from "dotenv"

const __dirname = dirname(fileURLToPath(import.meta.url))
dotenv.config({ path: join(__dirname, "..", "..", ".env.local") })

const client = new RDSDataClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY,
  },
})

const sql = readFileSync(join(__dirname, "schema.sql"), "utf-8")

const statements = sql
  .split(";")
  .map((s) => s.trim())
  .filter((s) => s.length > 0)

async function run() {
  for (const statement of statements) {
    console.log("Running:", statement.slice(0, 60), "...")
    const command = new ExecuteStatementCommand({
      resourceArn: process.env.AURORA_CLUSTER_ARN,
      secretArn: process.env.AURORA_SECRET_ARN,
      database: process.env.AURORA_DATABASE_NAME,
      sql: statement,
    })
    await client.send(command)
    console.log("✓ done")
  }
  console.log("Schema setup complete.")
}

run().catch((err) => {
  console.error("Setup failed:", err)
  process.exit(1)
})