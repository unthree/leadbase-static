import { NextResponse } from "next/server";

// OpenAPI spec so external agents (ChatGPT Custom GPT Actions, or any
// HTTP-capable agent) can control Mission Control. Auth: x-api-key header
// matching the MC_API_KEY env var.

export const dynamic = "force-dynamic";

export async function GET(req) {
  const origin = new URL(req.url).origin;
  return NextResponse.json({
    openapi: "3.1.0",
    info: {
      title: "Mission Control API",
      version: "0.1.0",
      description:
        "Read and update the Personal OS mission control: tasks, video ideas, newsletter sources/drafts, research history, and sponsor prospects. Each store is a single JSON document: GET it, modify it, PUT the whole document back."
    },
    servers: [{ url: origin }],
    components: {
      securitySchemes: {
        ApiKeyAuth: { type: "apiKey", in: "header", name: "x-api-key" }
      }
    },
    security: [{ ApiKeyAuth: [] }],
    paths: {
      "/api/state/{name}": {
        get: {
          operationId: "getStore",
          summary: "Read a data store",
          parameters: [
            {
              name: "name",
              in: "path",
              required: true,
              schema: {
                type: "string",
                enum: ["tasks", "ideas", "newsletter", "research", "sponsors"]
              }
            }
          ],
          responses: { 200: { description: "The full JSON document for this store" } }
        },
        put: {
          operationId: "putStore",
          summary: "Replace a data store",
          description:
            "Replaces the entire document. Always GET first, apply your change to the returned JSON, then PUT the whole modified document back — never PUT a partial object.",
          parameters: [
            {
              name: "name",
              in: "path",
              required: true,
              schema: {
                type: "string",
                enum: ["tasks", "ideas", "newsletter", "research", "sponsors"]
              }
            }
          ],
          requestBody: {
            required: true,
            content: { "application/json": { schema: { type: "object" } } }
          },
          responses: { 200: { description: "Saved" } }
        }
      },
      "/api/generate": {
        post: {
          operationId: "generate",
          summary: "Run an AI job",
          requestBody: {
            required: true,
            content: {
              "application/json": {
                schema: {
                  type: "object",
                  properties: {
                    kind: { type: "string", enum: ["newsletter", "research", "sponsors"] },
                    input: { type: "string" }
                  },
                  required: ["kind"]
                }
              }
            }
          },
          responses: { 200: { description: "{ok, model, text}" } }
        }
      }
    }
  });
}
