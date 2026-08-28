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
      {
        globalSettings: content.globalSettings,
        siteConfig: content.siteConfig,
        navigation: content.navigation,
        seo: content.seo,
      },
      200
    );
  } catch {
    return json({ error: "Unable to read settings." }, 500);
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
    content.globalSettings = payload.globalSettings || content.globalSettings;
    content.siteConfig = payload.siteConfig || content.siteConfig;
    content.navigation = payload.navigation || content.navigation;
    content.seo = payload.seo || content.seo;
    try {
      const result = await saveNormalizedContent(context.env, content);
      return json({ message: "Settings updated.", updatedAt: result.updatedAt }, 200);
    } catch {
      const legacy = await saveLegacyContent(context.env, content);
      return json(
        {
          message: "Settings saved to legacy storage. Run latest migrations for normalized mode.",
          updatedAt: legacy.updatedAt,
        },
        200
      );
    }
  } catch {
    return json({ error: "Unable to update settings." }, 500);
  }
}
