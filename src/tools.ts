// src/tools.ts
import Anthropic from "@anthropic-ai/sdk";
import { getOrdersByStatus, getTotalRevenue, getOrderSummary, runRawQuery } from "./db";

// These definitions tell the LLM what tools exist and what parameters they need
export const toolDefinitions: Anthropic.Tool[] = [
  {
    name: "get_orders_by_status",
    description: "Get all orders with a specific status (pending, active, or completed)",
    input_schema: {
      type: "object",
      properties: {
        status: {
          type: "string",
          description: "The order status to filter by: pending, active, or completed",
        },
      },
      required: ["status"],
    },
  },
  {
    name: "get_total_revenue",
    description: "Get the total revenue from all completed orders",
    input_schema: {
      type: "object",
      properties: {},   // no parameters needed
      required: [],
    },
  },
  {
    name: "get_order_summary",
    description: "Get a count of orders grouped by their status",
    input_schema: {
      type: "object",
      properties: {},
      required: [],
    },
  },
  {
    name: "query_database",
    description: `Run a read-only SQL query against the SME database to answer any question not covered by other tools.
      Tables available:
      - orders (id, customer_id, status TEXT ('pending'/'active'/'completed'), amount NUMERIC, created_at TIMESTAMP)
      - customers (id, name TEXT, email TEXT)
      Only use this tool when the other tools cannot answer the question.`,
    input_schema: {
      type: "object",
      properties: {
        sql: {
          type: "string",
          description: "A read-only SELECT SQL query. Must start with SELECT.",
        },
      },
      required: ["sql"],
    },
  },
];

// This function actually runs the tool the LLM chose
export async function executeTool(name: string, input: Record<string, string>) {
  if (name === "get_orders_by_status") {
    const orders = await getOrdersByStatus(input.status);
    return orders;
  }

  if (name === "get_total_revenue") {
    const total = await getTotalRevenue();
    return { total_revenue: total };
  }

  if (name === "get_order_summary") {
    const summary = await getOrderSummary();
    return summary;
  }

  if (name === "query_database") {
    const result = await runRawQuery(input.sql);
    return result;
  }

  throw new Error(`Unknown tool: ${name}`);
}