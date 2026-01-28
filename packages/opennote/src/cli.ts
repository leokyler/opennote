#!/usr/bin/env node

import { createCli } from "./index.js";

export async function main() {
  const cli = createCli();
  await cli.parseAsync(process.argv);
}

main().catch((error) => {
  console.error("Error:", error);
  process.exit(1);
});

if (import.meta.url === `file://${process.argv[1]}`) {
  main().catch((error) => {
    console.error("Error:", error);
    process.exit(1);
  });
}
