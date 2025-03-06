import { checkStatus } from "./db";

async function run() {
  await checkStatus();
}

run();
