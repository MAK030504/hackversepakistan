const http = require("http");
const fs = require("fs");
const path = require("path");

const host = "127.0.0.1";
const port = Number(process.env.PORT) || 5500;
const rootDir = __dirname;
const dataDir = path.join(rootDir, "data");
const subscribersFile = path.join(dataDir, "subscribers.json");

const contentTypes = {
  ".html": "text/html; charset=utf-8",
  ".css": "text/css; charset=utf-8",
  ".js": "application/javascript; charset=utf-8",
  ".json": "application/json; charset=utf-8",
  ".png": "image/png",
  ".jpg": "image/jpeg",
  ".jpeg": "image/jpeg",
  ".webp": "image/webp",
  ".svg": "image/svg+xml",
};

function sendJson(res, statusCode, payload) {
  res.writeHead(statusCode, { "Content-Type": contentTypes[".json"] });
  res.end(JSON.stringify(payload));
}

function ensureDataFile() {
  if (!fs.existsSync(dataDir)) {
    fs.mkdirSync(dataDir, { recursive: true });
  }
  if (!fs.existsSync(subscribersFile)) {
    fs.writeFileSync(subscribersFile, "[]", "utf8");
  }
}

function readSubscribers() {
  ensureDataFile();
  const raw = fs.readFileSync(subscribersFile, "utf8").replace(/^\uFEFF/, "");
  try {
    const parsed = JSON.parse(raw);
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function writeSubscribers(subscribers) {
  fs.writeFileSync(subscribersFile, JSON.stringify(subscribers, null, 2), "utf8");
}

function isValidEmail(email) {
  return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

function normalizeWhatsapp(whatsapp) {
  return String(whatsapp || "").replace(/\s+/g, "").trim();
}

function isValidWhatsapp(whatsapp) {
  return /^\+?[0-9]{10,15}$/.test(whatsapp);
}

function parseJsonBody(rawBody) {
  if (!rawBody || !rawBody.trim()) {
    return {};
  }
  return JSON.parse(rawBody);
}

function handleNotify(req, res) {
  let body = "";
  req.on("data", (chunk) => {
    body += chunk;
    if (body.length > 10_000) {
      req.destroy();
    }
  });

  req.on("end", () => {
    let payload;
    try {
      payload = parseJsonBody(body);
    } catch {
      sendJson(res, 400, { error: "Invalid request payload." });
      return;
    }

    const { email, whatsapp } = payload;
    const normalizedEmail = String(email || "").trim().toLowerCase();
    const normalizedWhatsapp = normalizeWhatsapp(whatsapp);

    if (!isValidEmail(normalizedEmail)) {
      sendJson(res, 400, { error: "Please provide a valid email address." });
      return;
    }
    if (!isValidWhatsapp(normalizedWhatsapp)) {
      sendJson(res, 400, { error: "Please provide a valid WhatsApp number." });
      return;
    }

    const subscribers = readSubscribers();
    const exists = subscribers.some(
      (entry) =>
        entry &&
        typeof entry === "object" &&
        (entry.email === normalizedEmail || entry.whatsapp === normalizedWhatsapp)
    );
    if (exists) {
      sendJson(res, 200, { message: "You are already on our notify list." });
      return;
    }

    subscribers.push({
      email: normalizedEmail,
      whatsapp: normalizedWhatsapp,
      subscribedAt: new Date().toISOString(),
    });

    try {
      writeSubscribers(subscribers);
    } catch {
      sendJson(res, 500, { error: "Unable to save your details right now. Please try again." });
      return;
    }

    sendJson(res, 201, { message: "Thanks. We'll notify you before launch." });
  });
}

function serveStatic(req, res) {
  const safeUrlPath = decodeURIComponent((req.url || "/").split("?")[0]);
  const relativePath = safeUrlPath === "/" ? "index.html" : safeUrlPath.replace(/^\/+/, "");
  const filePath = path.normalize(path.join(rootDir, relativePath));

  if (!filePath.startsWith(rootDir)) {
    sendJson(res, 403, { error: "Forbidden path." });
    return;
  }

  fs.readFile(filePath, (error, data) => {
    if (error) {
      if (error.code === "ENOENT") {
        sendJson(res, 404, { error: "Not found." });
      } else {
        sendJson(res, 500, { error: "Failed to read file." });
      }
      return;
    }

    const ext = path.extname(filePath).toLowerCase();
    const contentType = contentTypes[ext] || "application/octet-stream";
    res.writeHead(200, { "Content-Type": contentType });
    res.end(data);
  });
}

const server = http.createServer((req, res) => {
  if (req.method === "POST" && req.url === "/api/notify") {
    handleNotify(req, res);
    return;
  }

  if (req.method === "GET") {
    serveStatic(req, res);
    return;
  }

  sendJson(res, 405, { error: "Method not allowed." });
});

server.listen(port, host, () => {
  console.log(`HackVerse server running at http://${host}:${port}`);
});
