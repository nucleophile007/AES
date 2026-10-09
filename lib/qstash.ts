import { Client } from "@upstash/qstash";

const token = process.env.QSTASH_TOKEN || "";

export const qstash = new Client({
  token: token || "dummy_token",
});
