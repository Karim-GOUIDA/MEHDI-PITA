const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'content-type',
  'Access-Control-Allow-Methods': 'GET, POST, OPTIONS'
};

const jsonResponse = (body: unknown, status = 200) =>
  new Response(JSON.stringify(body), {
    status,
    headers: { ...corsHeaders, 'Content-Type': 'application/json' }
  });

Deno.serve(async (request) => {
  if (request.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders });
  }

  const projectUrl = Deno.env.get('SUPABASE_URL');
  const serviceRoleKey = Deno.env.get('SUPABASE_SERVICE_ROLE_KEY');
  const adminPassword = Deno.env.get('ADMIN_PASSWORD');

  if (!projectUrl || !serviceRoleKey || !adminPassword) {
    console.error('Missing Supabase function environment configuration.');
    return jsonResponse({ error: 'Shared storage is not configured on the server.' }, 500);
  }

  const restUrl = `${projectUrl.replace(/\/+$/, '')}/rest/v1/site_data`;
  const restHeaders = {
    apikey: serviceRoleKey,
    Authorization: `Bearer ${serviceRoleKey}`,
    'Content-Type': 'application/json'
  };

  try {
    if (request.method === 'GET') {
      const response = await fetch(`${restUrl}?id=eq.1&select=platforms,videos,updated_at`, {
        headers: restHeaders
      });
      if (!response.ok) {
        console.error('Supabase read failed:', response.status, await response.text());
        return jsonResponse({ error: 'Could not load shared site data.' }, 502);
      }

      const [row] = await response.json();
      return jsonResponse({
        success: true,
        data: row
          ? {
              platforms: row.platforms,
              videos: row.videos,
              updatedAt: row.updated_at
            }
          : null
      });
    }

    if (request.method !== 'POST') {
      return jsonResponse({ error: 'Method not allowed.' }, 405);
    }

    const body = await request.json();
    if (typeof body.password !== 'string' || body.password !== adminPassword) {
      return jsonResponse({ error: 'Invalid admin credentials.' }, 401);
    }

    if (body.action === 'login') {
      return jsonResponse({ success: true });
    }

    if (
      body.action !== 'save' ||
      !body.data ||
      !Array.isArray(body.data.platforms) ||
      !Array.isArray(body.data.videos)
    ) {
      return jsonResponse({ error: 'Invalid site data.' }, 400);
    }

    const response = await fetch(`${restUrl}?on_conflict=id`, {
      method: 'POST',
      headers: { ...restHeaders, Prefer: 'resolution=merge-duplicates,return=minimal' },
      body: JSON.stringify({
        id: 1,
        platforms: body.data.platforms,
        videos: body.data.videos,
        updated_at: new Date().toISOString()
      })
    });

    if (!response.ok) {
      console.error('Supabase write failed:', response.status, await response.text());
      return jsonResponse({ error: 'Could not save shared site data.' }, 502);
    }

    return jsonResponse({ success: true });
  } catch (error) {
    console.error('Site data function failed:', error);
    return jsonResponse({ error: 'The shared data service encountered an error.' }, 500);
  }
});
