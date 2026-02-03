import { auth } from "@/lib/auth";
import { toNextJsHandler } from "better-auth/next-js";

export const runtime = "nodejs"; // Force Node.js runtime for libSQL compatibility

export const { GET, POST } = toNextJsHandler(auth);
