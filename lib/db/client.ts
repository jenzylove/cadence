import { RDSDataClient, ExecuteStatementCommand, type SqlParameter } from "@aws-sdk/client-rds-data"

const client = new RDSDataClient({
  region: process.env.AWS_REGION,
  credentials: {
    accessKeyId: process.env.AWS_ACCESS_KEY_ID!,
    secretAccessKey: process.env.AWS_SECRET_ACCESS_KEY!,
  },
})

const resourceArn = process.env.AURORA_CLUSTER_ARN!
const secretArn = process.env.AURORA_SECRET_ARN!
const database = process.env.AURORA_DATABASE_NAME!

/**
 * Runs a SQL statement against Aurora via the RDS Data API.
 * Pass named parameters as { name: "foo", value: "bar" } objects.
 */
export async function query(sql: string, parameters: SqlParameter[] = [], retries = 2) {
  const command = new ExecuteStatementCommand({
    resourceArn,
    secretArn,
    database,
    sql,
    parameters,
    includeResultMetadata: true,
  })

  try {
    const response = await client.send(command)
    return response
  } catch (error) {
    const isResuming =
      error instanceof Error && error.name === "DatabaseResumingException"

    if (isResuming && retries > 0) {
      await new Promise((resolve) => setTimeout(resolve, 3000))
      return query(sql, parameters, retries - 1)
    }
    throw error
  }
}

/**
 * Converts a Data API result into an array of plain JS objects,
 * keyed by column name, with values unwrapped from the AWS field format.
 */
export function rowsToObjects(response: Awaited<ReturnType<typeof query>>) {
  const columns = response.columnMetadata?.map((c) => c.name!) ?? []
  const records = response.records ?? []

  return records.map((record) => {
    const obj: Record<string, unknown> = {}
    record.forEach((field, i) => {
      const colName = columns[i]
      if (field.isNull) {
        obj[colName] = null
      } else if (field.stringValue !== undefined) {
        obj[colName] = field.stringValue
      } else if (field.longValue !== undefined) {
        obj[colName] = field.longValue
      } else if (field.doubleValue !== undefined) {
        obj[colName] = field.doubleValue
      } else if (field.booleanValue !== undefined) {
        obj[colName] = field.booleanValue
      } else {
        obj[colName] = null
      }
    })
    return obj
  })
}