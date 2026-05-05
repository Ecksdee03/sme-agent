import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { z } from "zod";
import { getOrdersByStatus, getTotalRevenue, getOrderSummary, runRawQuery } from "./db";
import * as dotenv from "dotenv";
dotenv.config();

// Create MCP server
const server = new McpServer({
  name: "sme-agent",
  version: "1.0.0",
});

server.tool(
  "get_orders_by_status",
  "Get all orders with a specific status (pending, active, or completed)",
  { status: z.string().describe("The order status: pending, active, or completed") },
  async ({ status }) => {
    const result = await getOrdersByStatus(status);
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  }
);

server.tool(
  "get_total_revenue",
  "Get the total revenue from all completed orders",
  {},
  async () => {
    const result = await getTotalRevenue();
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  }
);

server.tool(
  "get_order_summary",
  "Get a count of orders grouped by status",
  {},
  async () => {
    const result = await getOrderSummary();
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  }
);

server.tool(
  "query_database",
  "Run a read-only SQL query. Tables: orders (id, customer_id, status, amount, created_at), customers (id, name, email)",
  { sql: z.string().describe("A SELECT SQL query only") },
  async ({ sql }) => {
    if (!sql.trim().toLowerCase().startsWith("select")) {
      throw new Error("Only SELECT queries are allowed");
    }
    const result = await runRawQuery(sql);
    return {
      content: [{ type: "text", text: JSON.stringify(result) }],
    };
  }
);

// Start the server
async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
  console.error("MCP Server running");
}

main().catch(console.error);