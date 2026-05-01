import { createClient } from "@supabase/supabase-js";
import * as dotenv from "dotenv";
dotenv.config();

const supabase = createClient(
  process.env.SUPABASE_URL!,    
  process.env.SUPABASE_KEY!
);

// Get all orders filtered by status
export async function getOrdersByStatus(status: string) {
  const { data, error } = await supabase
    .from("orders")
    .select("*, customers(name)")   // also fetch the customer name
    .eq("status", status);          // .eq means "where status = ?"
  if (error) throw new Error(error.message);
  return data;
}

// Get total revenue from completed orders
export async function getTotalRevenue() {
  const { data, error } = await supabase
    .from("orders")
    .select("amount")
    .eq("status", "completed");

  if (error) throw new Error(error.message);

  const total = data.reduce((sum, order) => sum + Number(order.amount), 0);
  return total;
}

// Get count of orders grouped by status
export async function getOrderSummary() {
  const { data, error } = await supabase
    .from("orders")
    .select("status");

  if (error) throw new Error(error.message);

  // Count how many of each status
  const summary: Record<string, number> = {};
  data.forEach(order => {
    summary[order.status] = (summary[order.status] || 0) + 1;
  });

  return summary;
}

export async function runRawQuery(sql: string) {
  const { data, error } = await supabase.rpc("run_query", { sql });
  if (error) throw new Error(error.message);
  return data;
}