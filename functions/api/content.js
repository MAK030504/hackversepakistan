import { json } from "./admin/_auth.js";
import { buildContentFromNormalized, loadLegacyContent } from "./admin/_content-store.js";

export async function onRequestGet(context) {
  try {
    const normalized = await buildContentFromNormalized(context.env);
    if (normalized) {
      return json(
        {
          source: "normalized",
          updatedAt: new Date().toISOString(),
          content: normalized,
        },
        200
      );
    }

    const legacy = await loadLegacyContent(context.env);
    if (!legacy) {
      return json(
        { error: "No admin content found. Falling back to static content file." },
        404
      );
    }

    return json({
      source: "legacy_site_content",
      updatedAt: legacy.updatedAt,
      content: legacy.content,
    });
  } catch {
    return json({ error: "Unable to read site content right now." }, 500);
  }
}

export function onRequestPost() {
  return json({ error: "Method not allowed." }, 405);
}
