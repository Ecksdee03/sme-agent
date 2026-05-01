// src/llm.ts
import Anthropic from "@anthropic-ai/sdk";
import * as dotenv from "dotenv";
import { toolDefinitions, executeTool } from "./tools";
dotenv.config();

const client = new Anthropic({ apiKey: process.env.ANTHROPIC_API_KEY });

export async function runAgent(userQuestion: string): Promise<string> {
  console.log("\n--- Agent starting ---");

  // Start the conversation with the user's question
  const messages: Anthropic.MessageParam[] = [
    { role: "user", content: userQuestion }
  ];

  // Keep looping until the LLM gives a final answer
  while (true) {
    const response = await client.messages.create({
      model: "claude-opus-4-5",
      max_tokens: 1024,
      system: "You are a helpful assistant for a Singapore SME shop owner. Answer questions about their orders and revenue clearly and concisely.",
      tools: toolDefinitions,
      messages,
    });

    console.log("LLM stop reason:", response.stop_reason);

    // If LLM is done, extract and return the final text
    if (response.stop_reason === "end_turn") {
      const textBlock = response.content.find(b => b.type === "text");
      return textBlock && textBlock.type === "text"
        ? textBlock.text
        : "No response generated";
    }

    // If LLM wants to use a tool
    if (response.stop_reason === "tool_use") {
      // Find which tool it wants to call
      const toolUseBlock = response.content.find(b => b.type === "tool_use");
      if (!toolUseBlock || toolUseBlock.type !== "tool_use") break;

      console.log(`LLM calling tool: ${toolUseBlock.name}`);
      console.log(`With input:`, toolUseBlock.input);

      // Execute the tool
      const toolResult = await executeTool(
        toolUseBlock.name,
        toolUseBlock.input as Record<string, string>
      );

      console.log(`Tool result:`, toolResult);

      // Add the LLM's response and tool result back to conversation history
      messages.push({ role: "assistant", content: response.content });
      messages.push({
        role: "user",
        content: [{
          type: "tool_result",
          tool_use_id: toolUseBlock.id,
          content: JSON.stringify(toolResult),
        }],
      });
      // Loop continues — LLM will now read the tool result and respond
    }
  }

  return "Agent ended unexpectedly";
}