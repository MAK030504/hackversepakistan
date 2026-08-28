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
        mediaLibrary: content.mediaLibrary,
        globalMedia: {
          logoUrl: content.globalSettings.logoUrl || "",
          faviconUrl: content.globalSettings.faviconUrl || "",
          socialPreviewImage: content.globalSettings.socialPreviewImage || "",
        },
      },
      200
    );
  } catch {
    return json({ error: "Unable to read media library." }, 500);
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
    content.mediaLibrary = Array.isArray(payload.mediaLibrary)
      ? payload.mediaLibrary
      : content.mediaLibrary;
    content.globalSettings.logoUrl =
      payload.globalMedia?.logoUrl ?? content.globalSettings.logoUrl;
    content.globalSettings.faviconUrl =
      payload.globalMedia?.faviconUrl ?? content.globalSettings.faviconUrl;
    content.globalSettings.socialPreviewImage =
      payload.globalMedia?.socialPreviewImage ??
      content.globalSettings.socialPreviewImage;
    try {
      const result = await saveNormalizedContent(context.env, content);
      return json({ message: "Media updated.", updatedAt: result.updatedAt }, 200);
    } catch {
      const legacy = await saveLegacyContent(context.env, content);
      return json(
        {
          message:
            "Media saved to legacy storage. Run latest migrations for normalized mode.",
          updatedAt: legacy.updatedAt,
        },
        200
      );
    }
  } catch {
    return json({ error: "Unable to update media library." }, 500);
  }
}
