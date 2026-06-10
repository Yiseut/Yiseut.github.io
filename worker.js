import { onRequestOptions, onRequestPost } from "./functions/api/chat.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/chat" || url.pathname === "/api/chat/") {
      if (request.method === "OPTIONS") return onRequestOptions();
      if (request.method === "POST") return onRequestPost({ request, env });

      return new Response("Method Not Allowed", {
        status: 405,
        headers: { Allow: "POST, OPTIONS" },
      });
    }

    return env.ASSETS.fetch(request);
  },
};
