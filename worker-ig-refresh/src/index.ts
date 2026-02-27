interface Env {
  IG_TOKENS: KVNamespace;
  VERCEL_TOKEN: string;
  VERCEL_PROJECT_ID: string;
  VERCEL_TEAM_ID?: string;
  REFRESH_AUTH_TOKEN?: string;
}

const IG_TOKEN_KEY = "instagram_access_token";

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
        return Response.json(
          { success: false, error: "Refresh failed" },
          { status: 500 }
        );
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
  return providedToken === env.REFRESH_AUTH_TOKEN;
}

async function refreshToken(env: Env): Promise<{ success: boolean; message: string }> {
  // 1. Read current token from KV
  const currentToken = await env.IG_TOKENS.get(IG_TOKEN_KEY);
  if (!currentToken) {
    throw new Error("No Instagram token found in KV. Seed it first.");
  }

  // 2. Refresh the token via Instagram Graph API
  const igResponse = await fetch(
    `https://graph.instagram.com/refresh_access_token?grant_type=ig_refresh_token&access_token=${currentToken}`
  );

  if (!igResponse.ok) {
    const body = await igResponse.text();
    throw new Error(`Instagram refresh failed (${igResponse.status}): ${body}`);
  }

  const igData = (await igResponse.json()) as {
    access_token: string;
    token_type: string;
    expires_in: number;
  };

  const newToken = igData.access_token;

  // 3. Store the new token in KV (expires_in is in seconds, typically 5184000 = 60 days)
  await env.IG_TOKENS.put(IG_TOKEN_KEY, newToken, {
    expirationTtl: igData.expires_in,
  });

  // 4. Update the Vercel environment variable
  await updateVercelEnvVar(env, newToken);

  // 5. Trigger a Vercel redeployment
  await triggerVercelRedeploy(env);

  return {
    success: true,
    message: `Token refreshed. Expires in ${Math.round(igData.expires_in / 86400)} days.`,
  };
}

async function updateVercelEnvVar(env: Env, newToken: string): Promise<void> {
  const teamQuery = env.VERCEL_TEAM_ID ? `&teamId=${env.VERCEL_TEAM_ID}` : "";
  const baseUrl = `https://api.vercel.com/v9/projects/${env.VERCEL_PROJECT_ID}/env`;
  const headers = {
    Authorization: `Bearer ${env.VERCEL_TOKEN}`,
    "Content-Type": "application/json",
  };

  // List env vars to find the INSTAGRAM_ACCESS_TOKEN IDs
  const listRes = await fetch(`${baseUrl}?${teamQuery}`, { headers });
  if (!listRes.ok) {
    throw new Error(`Vercel list env vars failed (${listRes.status})`);
  }

  const listData = (await listRes.json()) as {
    envs: Array<{ id: string; key: string; target: string[] }>;
  };

  const igEnvVars = listData.envs.filter((e) => e.key === "INSTAGRAM_ACCESS_TOKEN");

  if (igEnvVars.length === 0) {
    throw new Error("INSTAGRAM_ACCESS_TOKEN not found in Vercel project env vars");
  }

  // Update each matching env var (production, development, etc.)
  for (const envVar of igEnvVars) {
    const patchRes = await fetch(`${baseUrl}/${envVar.id}?${teamQuery}`, {
      method: "PATCH",
      headers,
      body: JSON.stringify({ value: newToken }),
    });

    if (!patchRes.ok) {
      const body = await patchRes.text();
      throw new Error(`Vercel env update failed for ${envVar.id} (${patchRes.status}): ${body}`);
    }
  }
}

async function triggerVercelRedeploy(env: Env): Promise<void> {
  const teamQuery = env.VERCEL_TEAM_ID ? `&teamId=${env.VERCEL_TEAM_ID}` : "";
  const headers = {
    Authorization: `Bearer ${env.VERCEL_TOKEN}`,
    "Content-Type": "application/json",
  };

  // Get the latest production deployment to redeploy it
  const deploymentsRes = await fetch(
    `https://api.vercel.com/v6/deployments?projectId=${env.VERCEL_PROJECT_ID}&target=production&limit=1${teamQuery}`,
    { headers }
  );

  if (!deploymentsRes.ok) return;

  const deploymentsData = (await deploymentsRes.json()) as {
    deployments: Array<{ uid: string }>;
  };

  const latestDeployment = deploymentsData.deployments[0];
  if (!latestDeployment) return;

  await fetch(`https://api.vercel.com/v13/deployments?${teamQuery}`, {
    method: "POST",
    headers,
    body: JSON.stringify({
      name: env.VERCEL_PROJECT_ID,
      deploymentId: latestDeployment.uid,
      target: "production",
    }),
  });
}
