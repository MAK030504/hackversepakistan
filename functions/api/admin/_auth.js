export const JSON_HEADERS = { "content-type": "application/json; charset=utf-8" };

export function json(data, status = 200) {
  return new Response(JSON.stringify(data), { status, headers: JSON_HEADERS });
}

export function assertAdmin(context) {
  const adminToken = context.env.ADMIN_TOKEN;
  if (!adminToken) {
    return json({ error: "ADMIN_TOKEN is not configured in environment." }, 503);
  }
  const provided = context.request.headers.get("x-admin-token") || "";
  if (provided !== adminToken) {
    return json({ error: "Unauthorized." }, 401);
  }
  return null;
}
