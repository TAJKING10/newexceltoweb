import { serve } from "https://deno.land/std@0.168.0/http/server.ts"
import { createClient } from 'https://esm.sh/@supabase/supabase-js@2'

const corsHeaders = {
  'Access-Control-Allow-Origin': '*',
  'Access-Control-Allow-Headers': 'authorization, x-client-info, apikey, content-type',
}

interface HealthCheckResult {
  status: 'healthy' | 'unhealthy';
  timestamp: string;
  version: string;
  checks: {
    database: boolean;
    auth: boolean;
    storage: boolean;
  };
  uptime: number;
  memory?: {
    used: number;
    total: number;
  };
}

serve(async (req) => {
  // Handle CORS preflight requests
  if (req.method === 'OPTIONS') {
    return new Response('ok', { headers: corsHeaders })
  }

  try {
    const supabaseClient = createClient(
      Deno.env.get('SUPABASE_URL') ?? '',
      Deno.env.get('SUPABASE_SERVICE_ROLE_KEY') ?? ''
    )

    const startTime = Date.now();
    const checks = {
      database: false,
      auth: false,
      storage: false,
    };

    // Check database connectivity
    try {
      const { data, error } = await supabaseClient
        .from('system_settings')
        .select('id')
        .limit(1);
      
      checks.database = !error;
    } catch (error) {
      console.error('Database check failed:', error);
      checks.database = false;
    }

    // Check auth service
    try {
      const { data, error } = await supabaseClient.auth.getSession();
      checks.auth = !error;
    } catch (error) {
      console.error('Auth check failed:', error);
      checks.auth = false;
    }

    // Check storage service
    try {
      const { data, error } = await supabaseClient.storage.listBuckets();
      checks.storage = !error;
    } catch (error) {
      console.error('Storage check failed:', error);
      checks.storage = false;
    }

    // Calculate uptime (simplified - in production you'd track actual start time)
    const uptime = Date.now() - startTime;

    // Get memory usage (if available)
    let memory;
    try {
      const memInfo = Deno.systemMemoryInfo?.();
      if (memInfo) {
        memory = {
          used: memInfo.total - memInfo.free,
          total: memInfo.total,
        };
      }
    } catch (error) {
      // Memory info not available
    }

    const healthResult: HealthCheckResult = {
      status: Object.values(checks).every(check => check) ? 'healthy' : 'unhealthy',
      timestamp: new Date().toISOString(),
      version: Deno.env.get('APP_VERSION') || '1.0.0',
      checks,
      uptime,
      memory,
    };

    const statusCode = healthResult.status === 'healthy' ? 200 : 503;

    return new Response(
      JSON.stringify(healthResult, null, 2),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: statusCode,
      }
    )

  } catch (error) {
    console.error('Health check error:', error);
    
    const errorResult: HealthCheckResult = {
      status: 'unhealthy',
      timestamp: new Date().toISOString(),
      version: Deno.env.get('APP_VERSION') || '1.0.0',
      checks: {
        database: false,
        auth: false,
        storage: false,
      },
      uptime: 0,
    };

    return new Response(
      JSON.stringify(errorResult, null, 2),
      {
        headers: { 
          ...corsHeaders, 
          'Content-Type': 'application/json' 
        },
        status: 503,
      }
    )
  }
})