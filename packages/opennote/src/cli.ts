#!/usr/bin/env node

import { createCli } from "./index.js";

export { createCli };

export async function main() {
  const cli = createCli();
  await cli.parseAsync(process.argv);
}

export async function runCli() {
  try {
    await main();
  } catch (error) {
    console.error("Error:", error);
    process.exit(1);
  }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  runCli();
}
