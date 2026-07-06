// Vercel serverless entry point. All requests under /api/* are routed here
// (see vercel.json rewrites) and forwarded to the Express app exported by
// server.ts, which continues to also work as a normal Node/Cloud Run server.
export { default } from '../server.ts';
