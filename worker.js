import { onRequestOptions as chatOptions, onRequestPost as chatPost } from "./functions/api/chat.js";
import {
  onRequestOptions as hitsOptions,
  onRequestGet as hitsGet,
  onRequestPost as hitsPost,
} from "./functions/api/hits.js";

export default {
  async fetch(request, env) {
    const url = new URL(request.url);

    if (url.pathname === "/api/chat" || url.pathname === "/api/chat/") {
      if (request.method === "OPTIONS") return chatOptions();
      if (request.method === "POST") return chatPost({ request, env });

      return new Response("Method Not Allowed", {
        status: 405,
        headers: { Allow: "POST, OPTIONS" },
      });
    }

    if (url.pathname === "/api/hits" || url.pathname === "/api/hits/") {
      if (request.method === "OPTIONS") return hitsOptions();
      if (request.method === "GET") return hitsGet({ request, env });
      if (request.method === "POST") return hitsPost({ request, env });

      return new Response("Method Not Allowed", {
        status: 405,
        headers: { Allow: "GET, POST, OPTIONS" },
      });
    }

    return env.ASSETS.fetch(request);
  },
};
