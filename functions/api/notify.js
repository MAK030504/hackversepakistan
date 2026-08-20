const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };

function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeWhatsapp(value) {
  return String(value || "").replace(/\s+/g, "").trim();
}

function isValidWhatsapp(whatsapp) {
  return /^\+?[0-9]{10,15}$/.test(whatsapp);
}

export async function onRequestPost(context) {
  let payload;
  try {
    payload = await context.request.json();
  } catch {
    return json({ error: "Invalid request payload." }, 400);
  }

  const email = String(payload?.email || "").trim().toLowerCase();
  const whatsapp = normalizeWhatsapp(payload?.whatsapp);

  if (!isValidEmail(email)) {
    return json({ error: "Please provide a valid email address." }, 400);
  }
  if (!isValidWhatsapp(whatsapp)) {
    return json({ error: "Please provide a valid WhatsApp number." }, 400);
  }

  try {
    const existing = await context.env.DB.prepare(
      "SELECT id FROM subscribers WHERE email = ?1 OR whatsapp = ?2 LIMIT 1"
    )
      .bind(email, whatsapp)
      .first();

    if (existing) {
      return json({ message: "You are already on our notify list." }, 200);
    }

    await context.env.DB.prepare(
      "INSERT INTO subscribers (email, whatsapp, subscribed_at) VALUES (?1, ?2, ?3)"
    )
      .bind(email, whatsapp, new Date().toISOString())
      .run();

    return json({ message: "Thanks. We'll notify you before launch." }, 201);
  } catch {
    return json({ error: "Unable to save your details right now. Please try again." }, 500);
  }
}

export function onRequestGet() {
  return json({ error: "Method not allowed." }, 405);
}

export function onRequestPut() {
  return json({ error: "Method not allowed." }, 405);
}

export function onRequestDelete() {
  return json({ error: "Method not allowed." }, 405);
}

export function onRequestPatch() {
  return json({ error: "Method not allowed." }, 405);
}
