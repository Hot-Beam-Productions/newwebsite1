interface Env {
  IG_TOKENS: KVNamespace;
  VERCEL_TOKEN: string;
  VERCEL_PROJECT_ID: string;
  VERCEL_TEAM_ID?: string;
  REFRESH_AUTH_TOKEN?: string;
}

const IG_TOKEN_KEY = "instagram_access_token";
const REQUEST_TIMEOUT_MS = 12_000;

const worker = {
  async scheduled(_event: ScheduledEvent, env: Env, ctx: ExecutionContext): Promise<void> {
    ctx.waitUntil(refreshToken(env));
  },

  async fetch(request: Request, env: Env): Promise<Response> {
    const url = new URL(request.url);

    if (url.pathname === "/refresh") {
      if (request.method !== "POST") {
        return Response.json({ success: false, error: "Method Not Allowed" }, { status: 405 });
      }

      if (!isAuthorizedRequest(request, env)) {
        return Response.json({ success: false, error: "Unauthorized" }, { status: 401 });
      }

      try {
        const result = await refreshToken(env);
        return Response.json(result);
      } catch {
        return Response.json({ success: false, error: "Refresh failed" }, { status: 500 });
      }
    }

    return Response.json({ status: "ok", hint: "POST /refresh" });
  },
};

export default worker;

function isAuthorizedRequest(request: Request, env: Env): boolean {
  if (!env.REFRESH_AUTH_TOKEN) return false;

  const authHeader = request.headers.get("Authorization");
  if (!authHeader?.startsWith("Bearer ")) return false;

  const providedToken = authHeader.slice(7).trim();
  return constantTimeEqual(providedToken, env.REFRESH_AUTH_TOKEN);
}

function constantTimeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;

  let mismatch = 0;
  for (let i = 0; i < a.length; i++) {
    mismatch |= a.charCodeAt(i) ^ b.charCodeAt(i);
  }

  return mismatch === 0;
}

function buildVercelQuery(teamId: string | undefined): string {
  const params = new URLSearchParams();
  if (teamId) {
    params.set("teamId", teamId);
  }
  const query = params.toString();
  return query ? `?${query}` : "";
}

async function fetchJson<T>(url: string, init: RequestInit): Promise<T> {
  const response = await fetch(url, {
    ...init,
    signal: AbortSignal.timeout(REQUEST_TIMEOUT_MS),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Request failed (${response.status}): ${text}`);
  }

  return (await response.json()) as T;
}

async function refreshToken(env: Env): Promise<{ success: boolean; message: string }> {
  if (!env.VERCEL_TOKEN || !env.VERCEL_PROJECT_ID) {
    throw new Error("Missing required Vercel environment variables");
  }

  const currentToken = await env.IG_TOKENS.get(IG_TOKEN_KEY);
  if (!currentToken) {
    throw new Error("No Instagram token found in KV. Seed it first.");
  }

  const igUrl = new URL("https://graph.instagram.com/refresh_access_token");
  igUrl.searchParams.set("grant_type", "ig_refresh_token");
  igUrl.searchParams.set("access_token", currentToken);

  const igData = await fetchJson<{
    access_token: string;
    token_type: string;
    expires_in: number;
  }>(igUrl.toString(), { method: "GET" });

  const newToken = igData.access_token;
  if (!newToken) {
    throw new Error("Instagram refresh did not return an access token");
  }

  await env.IG_TOKENS.put(IG_TOKEN_KEY, newToken, {
    expirationTtl: igData.expires_in,
  });

  await updateVercelEnvVar(env, newToken);
  await triggerVercelRedeploy(env);

  return {
    success: true,
    message: `Token refreshed. Expires in ${Math.round(igData.expires_in / 86400)} days.`,
  };
}

async function updateVercelEnvVar(env: Env, newToken: string): Promise<void> {
  const query = buildVercelQuery(env.VERCEL_TEAM_ID);
  const baseUrl = `https://api.vercel.com/v9/projects/${env.VERCEL_PROJECT_ID}/env`;
  const headers = {
    Authorization: `Bearer ${env.VERCEL_TOKEN}`,
    "Content-Type": "application/json",
  };

  const listData = await fetchJson<{
    envs: Array<{ id: string; key: string }>;
  }>(`${baseUrl}${query}`, { headers });

  const igEnvVars = listData.envs.filter((entry) => entry.key === "INSTAGRAM_ACCESS_TOKEN");
  if (igEnvVars.length === 0) {
    throw new Error("INSTAGRAM_ACCESS_TOKEN not found in Vercel project env vars");
  }

  for (const envVar of igEnvVars) {
    await fetchJson(`${baseUrl}/${envVar.id}${query}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ value: newToken }),
    });
  }
}

async function triggerVercelRedeploy(env: Env): Promise<void> {
  const query = buildVercelQuery(env.VERCEL_TEAM_ID);
  const headers = {
    Authorization: `Bearer ${env.VERCEL_TOKEN}`,
    "Content-Type": "application/json",
  };

  const deploymentsData = await fetchJson<{
    deployments: Array<{ uid: string }>;
  }>(
    `https://api.vercel.com/v6/deployments?projectId=${env.VERCEL_PROJECT_ID}&target=production&limit=1${query ? `&${query.slice(1)}` : ""}`,
    { headers }
  );

  const latestDeployment = deploymentsData.deployments[0];
  if (!latestDeployment) {
    throw new Error("No production deployment found to redeploy");
  }

  await fetchJson(`https://api.vercel.com/v13/deployments${query}`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      name: env.VERCEL_PROJECT_ID,
      deploymentId: latestDeployment.uid,
      target: "production",
    }),
  });
}
