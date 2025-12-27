#!/usr/bin/env node

import { Server } from '@modelcontextprotocol/sdk/server/index.js';
import { StdioServerTransport } from '@modelcontextprotocol/sdk/server/stdio.js';
import {
  CallToolRequestSchema,
  ListToolsRequestSchema,
} from '@modelcontextprotocol/sdk/types.js';
import Stripe from 'stripe';

const STRIPE_SECRET_KEY = process.env.STRIPE_SECRET_KEY;

if (!STRIPE_SECRET_KEY) {
  console.error('STRIPE_SECRET_KEY environment variable is required');
  process.exit(1);
}

const stripe = new Stripe(STRIPE_SECRET_KEY, {
  apiVersion: '2025-01-27.acacia',
});

const server = new Server(
  {
    name: 'mcp-stripe-server',
    version: '1.0.0',
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
        name: 'list_payments',
        description: 'List recent Stripe payment intents with optional filters',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Number of payments to retrieve (default: 10, max: 100)',
              default: 10,
            },
            customer: {
              type: 'string',
              description: 'Filter by customer ID',
            },
          },
        },
      },
      {
        name: 'get_payment',
        description: 'Get details of a specific payment intent by ID',
        inputSchema: {
          type: 'object',
          properties: {
            payment_intent_id: {
              type: 'string',
              description: 'The payment intent ID to retrieve',
            },
          },
          required: ['payment_intent_id'],
        },
      },
      {
        name: 'list_customers',
        description: 'List Stripe customers',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Number of customers to retrieve (default: 10, max: 100)',
              default: 10,
            },
            email: {
              type: 'string',
              description: 'Filter by customer email',
            },
          },
        },
      },
      {
        name: 'get_customer',
        description: 'Get details of a specific customer by ID',
        inputSchema: {
          type: 'object',
          properties: {
            customer_id: {
              type: 'string',
              description: 'The customer ID to retrieve',
            },
          },
          required: ['customer_id'],
        },
      },
      {
        name: 'list_charges',
        description: 'List recent Stripe charges',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Number of charges to retrieve (default: 10, max: 100)',
              default: 10,
            },
            customer: {
              type: 'string',
              description: 'Filter by customer ID',
            },
          },
        },
      },
      {
        name: 'list_checkout_sessions',
        description: 'List recent Stripe checkout sessions',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Number of sessions to retrieve (default: 10, max: 100)',
              default: 10,
            },
            customer: {
              type: 'string',
              description: 'Filter by customer ID',
            },
          },
        },
      },
      {
        name: 'get_checkout_session',
        description: 'Get details of a specific checkout session by ID',
        inputSchema: {
          type: 'object',
          properties: {
            session_id: {
              type: 'string',
              description: 'The checkout session ID to retrieve',
            },
          },
          required: ['session_id'],
        },
      },
      {
        name: 'list_refunds',
        description: 'List recent refunds',
        inputSchema: {
          type: 'object',
          properties: {
            limit: {
              type: 'number',
              description: 'Number of refunds to retrieve (default: 10, max: 100)',
              default: 10,
            },
          },
        },
      },
      {
        name: 'get_balance',
        description: 'Get current Stripe account balance',
        inputSchema: {
          type: 'object',
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
      case 'list_payments': {
        const limit = Math.min(args.limit || 10, 100);
        const params = { limit };
        if (args.customer) params.customer = args.customer;
        
        const paymentIntents = await stripe.paymentIntents.list(params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(paymentIntents.data, null, 2),
            },
          ],
        };
      }

      case 'get_payment': {
        const paymentIntent = await stripe.paymentIntents.retrieve(args.payment_intent_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(paymentIntent, null, 2),
            },
          ],
        };
      }

      case 'list_customers': {
        const limit = Math.min(args.limit || 10, 100);
        const params = { limit };
        if (args.email) params.email = args.email;
        
        const customers = await stripe.customers.list(params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(customers.data, null, 2),
            },
          ],
        };
      }

      case 'get_customer': {
        const customer = await stripe.customers.retrieve(args.customer_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(customer, null, 2),
            },
          ],
        };
      }

      case 'list_charges': {
        const limit = Math.min(args.limit || 10, 100);
        const params = { limit };
        if (args.customer) params.customer = args.customer;
        
        const charges = await stripe.charges.list(params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(charges.data, null, 2),
            },
          ],
        };
      }

      case 'list_checkout_sessions': {
        const limit = Math.min(args.limit || 10, 100);
        const params = { limit };
        if (args.customer) params.customer = args.customer;
        
        const sessions = await stripe.checkout.sessions.list(params);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(sessions.data, null, 2),
            },
          ],
        };
      }

      case 'get_checkout_session': {
        const session = await stripe.checkout.sessions.retrieve(args.session_id);
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(session, null, 2),
            },
          ],
        };
      }

      case 'list_refunds': {
        const limit = Math.min(args.limit || 10, 100);
        const refunds = await stripe.refunds.list({ limit });
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(refunds.data, null, 2),
            },
          ],
        };
      }

      case 'get_balance': {
        const balance = await stripe.balance.retrieve();
        return {
          content: [
            {
              type: 'text',
              text: JSON.stringify(balance, null, 2),
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
          type: 'text',
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
  console.error('Stripe MCP server running on stdio');
}

main().catch((error) => {
  console.error('Server error:', error);
  process.exit(1);
});

