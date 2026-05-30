import type { VercelRequest, VercelResponse } from "@vercel/node";
import { createApp } from "../src/app.js";

let app: ReturnType<typeof createApp> | undefined;
let initError: Error | undefined;

export default function handler(req: VercelRequest, res: VercelResponse) {
  try {
    if (initError) throw initError;
    if (!app) app = createApp();
    return app(req, res);
  } catch (error) {
    initError = error instanceof Error ? error : new Error(String(error));
    console.error("[api] failed to start:", initError);
    res.status(500).json({ error: initError.message });
  }
}
