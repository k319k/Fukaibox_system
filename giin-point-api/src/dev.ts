import { serve } from "@hono/node-server";
import app from "./index";

const port = 3001;

console.log(`Server is running on port ${port} (Local Mode)`);

serve({
    fetch: app.fetch,
    port
});
