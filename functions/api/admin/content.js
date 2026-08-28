import { assertAdmin, json } from "./_auth.js";
import {
  buildContentFromNormalized,
  ensurePayloadDefaults,
  loadLegacyContent,
  saveLegacyContent,
  saveNormalizedContent,
} from "./_content-store.js";

function parsePayload(payload) {
  if (!payload || typeof payload !== "object") return false;
  const mustHave = ["siteConfig", "home", "about", "hackathons", "eventDetails", "projects"];
  return mustHave.every((field) => Object.prototype.hasOwnProperty.call(payload, field));
}

export async function onRequestGet(context) {
  const authError = assertAdmin(context);
  if (authError) return authError;
  try {
    const normalized = await buildContentFromNormalized(context.env);
    if (normalized) {
      return json(
        { source: "normalized", content: ensurePayloadDefaults(normalized), updatedAt: null },
        200
      );
    }
    const legacy = await loadLegacyContent(context.env);
    if (legacy) {
      return json(
        {
          source: "legacy_site_content",
          content: ensurePayloadDefaults(legacy.content),
          updatedAt: legacy.updatedAt,
        },
        200
      );
    }
    return json({ content: null, source: "empty" }, 200);
  } catch {
    return json({ error: "Unable to read site content." }, 500);
  }
}

export async function onRequestPost(context) {
  const authError = assertAdmin(context);
  if (authError) return authError;

  let payload;
  try {
    payload = await context.request.json();
  } catch {
    return json({ error: "Invalid JSON payload." }, 400);
  }

  if (!parsePayload(payload)) {
    return json(
      {
        error:
          "Payload shape is invalid. Required top-level fields: siteConfig, home, about, hackathons, eventDetails, projects.",
      },
      400
    );
  }

  try {
    const result = await saveNormalizedContent(context.env, payload);
    return json({ message: "Content updated successfully.", updatedAt: result.updatedAt }, 200);
  } catch {
    try {
      const legacy = await saveLegacyContent(context.env, payload);
      return json(
        {
          message:
            "Content saved to legacy storage. Run latest migrations to enable normalized CMS tables.",
          updatedAt: legacy.updatedAt,
          source: "legacy_site_content",
        },
        200
      );
    } catch {
      return json({ error: "Failed to persist content." }, 500);
    }
  }
}
