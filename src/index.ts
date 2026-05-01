import { runAgent } from "./llm";

async function main() {
  const questions = [
    "How many pending orders do I have?",
    "What is my total revenue so far?",
    "Give me a summary of all my orders by status",
    "Who is my most valuable customer?",
    "Show me all orders above $80",
    "Which customer has the most orders?",
  ];

  // Test each question one by one
  for (const question of questions) {
    console.log(`\n=============================`);
    console.log(`Question: ${question}`);
    const answer = await runAgent(question);
    console.log(`Answer: ${answer}`);
  }
}

main();