#!/usr/bin/env node
import { Server } from "@modelcontextprotocol/sdk/server/index.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from "@modelcontextprotocol/sdk/types.js";
import { Resend } from "resend";

const RESEND_API_KEY = process.env.RESEND_API_KEY;

if (!RESEND_API_KEY) {
  console.error("RESEND_API_KEY environment variable is required");
  process.exit(1);
}

const resend = new Resend(RESEND_API_KEY);

const server = new Server(
  {
    name: "resend-mcp-server",
    version: "1.0.0",
  },
  {
    capabilities: {
      tools: {},
    },
  }
);

// List available tools
server.setRequestHandler(ListToolsRequestSchema, async () => {
  return {
    tools: [
      {
        name: "send_email",
        description: "Send an email using Resend",
        inputSchema: {
          type: "object",
          properties: {
            from: {
              type: "string",
              description: "Sender email address (must be verified domain)",
            },
            to: {
              type: "string",
              description: "Recipient email address",
            },
            subject: {
              type: "string",
              description: "Email subject",
            },
            html: {
              type: "string",
              description: "HTML email content",
            },
            text: {
              type: "string",
              description: "Plain text email content (optional)",
            },
          },
          required: ["from", "to", "subject", "html"],
        },
      },
      {
        name: "list_emails",
        description: "List recent emails sent through Resend",
        inputSchema: {
          type: "object",
          properties: {
            limit: {
              type: "number",
              description: "Number of emails to retrieve (default: 10, max: 100)",
              default: 10,
            },
          },
        },
      },
      {
        name: "get_email",
        description: "Get details of a specific email by ID",
        inputSchema: {
          type: "object",
          properties: {
            email_id: {
              type: "string",
              description: "The email ID to retrieve",
            },
          },
          required: ["email_id"],
        },
      },
      {
        name: "list_domains",
        description: "List all verified domains in Resend",
        inputSchema: {
          type: "object",
          properties: {},
        },
      },
    ],
  };
});

// Handle tool calls
server.setRequestHandler(CallToolRequestSchema, async (request) => {
  const { name, arguments: args } = request.params;

  try {
    switch (name) {
      case "send_email": {
        const { from, to, subject, html, text } = args;
        const result = await resend.emails.send({
          from,
          to,
          subject,
          html,
          text,
        });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "list_emails": {
        const limit = args.limit || 10;
        const result = await resend.emails.list({ limit });

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "get_email": {
        const { email_id } = args;
        const result = await resend.emails.get(email_id);

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      case "list_domains": {
        const result = await resend.domains.list();

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(result, null, 2),
            },
          ],
        };
      }

      default:
        throw new Error(`Unknown tool: ${name}`);
    }
  } catch (error) {
    return {
      content: [
        {
          type: "text",
          text: `Error: ${error.message}`,
        },
      ],
      isError: true,
    };
  }
});

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("Resend MCP Server running on stdio");
}

main().catch((error) => {
  console.error("Fatal error:", error);
  process.exit(1);
});

