import { assertAdmin, json } from "./_auth.js";
import {
  buildContentFromNormalized,
  ensurePayloadDefaults,
  loadLegacyContent,
  saveLegacyContent,
  saveNormalizedContent,
} from "./_content-store.js";

async function loadContent(env) {
  const normalized = await buildContentFromNormalized(env);
  if (normalized) return ensurePayloadDefaults(normalized);
  const legacy = await loadLegacyContent(env);
  if (legacy) return ensurePayloadDefaults(legacy.content);
  return ensurePayloadDefaults({});
}

export async function onRequestGet(context) {
  const authError = assertAdmin(context);
  if (authError) return authError;
  try {
    const content = await loadContent(context.env);
    return json(
      { hackathons: content.hackathons, eventDetails: content.eventDetails, seo: content.seo },
      200
    );
  } catch {
    return json({ error: "Unable to read hackathons." }, 500);
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
  try {
    const content = await loadContent(context.env);
    content.hackathons = Array.isArray(payload.hackathons) ? payload.hackathons : content.hackathons;
    content.eventDetails = payload.eventDetails || content.eventDetails;
    content.seo = payload.seo || content.seo;
    try {
      const result = await saveNormalizedContent(context.env, content);
      return json({ message: "Hackathons updated.", updatedAt: result.updatedAt }, 200);
    } catch {
      const legacy = await saveLegacyContent(context.env, content);
      return json(
        {
          message: "Hackathons saved to legacy storage. Run latest migrations for normalized mode.",
          updatedAt: legacy.updatedAt,
        },
        200
      );
    }
  } catch {
    return json({ error: "Unable to update hackathons." }, 500);
  }
}
