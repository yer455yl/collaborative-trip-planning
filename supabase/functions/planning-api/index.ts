// Supabase Edge entrypoint. No cloud deployment is implied by this file.
import { createPlanningHandler } from './handler.mjs';
Deno.serve(createPlanningHandler({
  supabaseUrl: Deno.env.get('SUPABASE_URL'),
  anonKey: Deno.env.get('SUPABASE_ANON_KEY'),
  allowedOrigins: (Deno.env.get('PLANNING_ALLOWED_ORIGINS') ?? '').split(',').filter(Boolean),
  plannerUrl: Deno.env.get('PLANNER_URL'),
  plannerKey: Deno.env.get('PLANNER_API_KEY'),
}));
