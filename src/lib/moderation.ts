// Image moderation via Sightengine (https://sightengine.com/docs).
// We moderate by passing the already-uploaded image URL (UploadThing cloud URL)
// to the check endpoint — no re-upload of bytes from our server.

const SIGHTENGINE_ENDPOINT = "https://api.sightengine.com/1.0/check.json";

// Comma-separated model list. Overridable via env for tuning without code changes.
// `violence` catches fighting/blood scenes that gore-2.0 misses (e.g. combat sports).
const MODELS = process.env.SIGHTENGINE_MODELS ?? "nudity-2.1,gore-2.0,violence,offensive";

// Confidence threshold (0–1) above which a category flags the image as unsafe.
// 0.2 is strict — catches borderline content like sports blood, suggestive images, etc.
const THRESHOLD = Number(process.env.SIGHTENGINE_THRESHOLD ?? 0.2);

interface SightengineResponse {
  status: "success" | "failure";
  error?: { type: string; code: number; message: string };
  nudity?: {
    sexual_activity?: number;
    sexual_display?: number;
    erotica?: number;
    very_suggestive?: number;
    suggestive?: number;
    mildly_suggestive?: number;
    none?: number;
  };
  gore?: { prob?: number };
  violence?: { prob?: number };
  offensive?: { prob?: number };
}

// nudity-2.1 scores are inclusive (a high `sexual_activity` implies the milder
// classes too). We flag only the explicit/strongly-suggestive classes.
function isResponseSafe(data: SightengineResponse): boolean {
  const n = data.nudity;
  if (n) {
    const explicit = Math.max(
      n.sexual_activity ?? 0,
      n.sexual_display ?? 0,
      n.erotica ?? 0,
      n.very_suggestive ?? 0
    );
    if (explicit >= THRESHOLD) return false;
  }
  if ((data.gore?.prob ?? 0) >= THRESHOLD) return false;
  if ((data.violence?.prob ?? 0) >= THRESHOLD) return false;
  if ((data.offensive?.prob ?? 0) >= THRESHOLD) return false;
  return true;
}

// api.sightengine.com resolves to several EU IPs and Node's fetch (undici) has a
// 10s connect timeout with no IP failover — a slow/unresponsive IP hangs the whole
// call. Retry with a short per-attempt timeout so DNS re-resolves to a live IP.
const MAX_ATTEMPTS = 3;
const PER_ATTEMPT_TIMEOUT_MS = 8_000;

async function fetchWithRetry(url: string, init?: RequestInit): Promise<Response> {
  let lastErr: unknown;
  for (let attempt = 1; attempt <= MAX_ATTEMPTS; attempt++) {
    try {
      return await fetch(url, { ...init, signal: AbortSignal.timeout(PER_ATTEMPT_TIMEOUT_MS) });
    } catch (err) {
      lastErr = err;
      if (attempt < MAX_ATTEMPTS) {
        await new Promise((resolve) => setTimeout(resolve, 500));
      }
    }
  }
  throw lastErr;
}

export async function isSafeImage(imageUrl: string): Promise<boolean> {
  const apiUser = process.env.SIGHTENGINE_API_USER;
  const apiSecret = process.env.SIGHTENGINE_API_SECRET;
  if (!apiUser || !apiSecret) {
    throw new Error("SIGHTENGINE_API_USER / SIGHTENGINE_API_SECRET is not set");
  }

  const params = new URLSearchParams({
    url: imageUrl,
    models: MODELS,
    api_user: apiUser,
    api_secret: apiSecret,
  });

  const res = await fetchWithRetry(`${SIGHTENGINE_ENDPOINT}?${params.toString()}`);
  const data = (await res.json()) as SightengineResponse;

  if (data.status !== "success") {
    throw new Error(
      `Sightengine moderation failed: ${data.error?.message ?? `HTTP ${res.status}`}`
    );
  }

  return isResponseSafe(data);
}

export async function checkImagesAreSafe(
  imageUrls: string[]
): Promise<{ safe: boolean; flaggedIndex?: number }> {
  for (let i = 0; i < imageUrls.length; i++) {
    const safe = await isSafeImage(imageUrls[i]);
    if (!safe) return { safe: false, flaggedIndex: i };
  }
  return { safe: true };
}

const TEXT_ENDPOINT = "https://api.sightengine.com/1.0/text/check.json";

interface SightengineTextMatch {
  type: string;
  match: string;
  start: number;
  end: number;
  intensity?: string;
}

interface SightengineTextCategory {
  matches: SightengineTextMatch[];
}

interface SightengineTextResponse {
  status: "success" | "failure";
  error?: { type: string; code: number; message: string };
  profanity?: SightengineTextCategory;
  sexual?: SightengineTextCategory;
  hate?: SightengineTextCategory;
  violence?: SightengineTextCategory;
  drug?: SightengineTextCategory;
  weapon?: SightengineTextCategory;
  extremism?: SightengineTextCategory;
}

function isTextResponseSafe(data: SightengineTextResponse): boolean {
  return [
    data.profanity,
    data.sexual,
    data.hate,
    data.violence,
    data.drug,
    data.weapon,
    data.extremism,
  ].every((cat) => !cat?.matches?.length);
}

export async function checkTextIsSafe(title: string, description: string): Promise<boolean> {
  const apiUser = process.env.SIGHTENGINE_API_USER;
  const apiSecret = process.env.SIGHTENGINE_API_SECRET;
  if (!apiUser || !apiSecret) {
    throw new Error("SIGHTENGINE_API_USER / SIGHTENGINE_API_SECRET is not set");
  }

  const text = [title, description].filter(Boolean).join(" ");

  const body = new URLSearchParams({
    text,
    lang: "en",
    mode: "standard",
    api_user: apiUser,
    api_secret: apiSecret,
  });

  const res = await fetchWithRetry(TEXT_ENDPOINT, {
    method: "POST",
    headers: { "Content-Type": "application/x-www-form-urlencoded" },
    body: body.toString(),
  });

  const data = (await res.json()) as SightengineTextResponse;

  if (data.status !== "success") {
    throw new Error(
      `Sightengine text moderation failed: ${data.error?.message ?? `HTTP ${res.status}`}`
    );
  }

  return isTextResponseSafe(data);
}
