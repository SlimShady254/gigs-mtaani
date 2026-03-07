import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { config } from "../config.js";

export type PersistedUser = {
  id: string;
  campus_email: string;
  phone_e164: string;
  password_hash: string;
  role: "STUDENT" | "ADMIN";
  status: "ACTIVE" | "PENDING_VERIFICATION" | "SUSPENDED" | "DELETED";
  display_name: string;
  campus_id: string;
  mfa_enabled: boolean;
  failed_login_attempts: number;
  lockout_until: string | null;
  email_verified_at: string | null;
  created_at: string;
  updated_at: string;
};

type ActivityLogInput = {
  userId?: string | null;
  action: string;
  metadata?: Record<string, unknown>;
  requestId?: string | null;
  ipHash?: string | null;
};

let adminClient: SupabaseClient | null = null;

export function isSupabaseEnabled(): boolean {
  return Boolean(config.SUPABASE_URL && config.SUPABASE_SERVICE_KEY);
}

function getAdminClient(): SupabaseClient {
  if (!isSupabaseEnabled()) {
    throw new Error("Supabase is not configured.");
  }

  if (!adminClient) {
    adminClient = createClient(config.SUPABASE_URL, config.SUPABASE_SERVICE_KEY, {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    });
  }

  return adminClient;
}

export async function upsertUser(user: PersistedUser): Promise<void> {
  if (!isSupabaseEnabled()) return;
  const client = getAdminClient();
  const { error } = await client.from("app_users").upsert(user, { onConflict: "id" });
  if (error) throw error;
}

export async function findUserByIdentifier(identifier: string): Promise<PersistedUser | null> {
  if (!isSupabaseEnabled()) return null;
  const client = getAdminClient();
  const normalized = identifier.trim().toLowerCase();

  const emailResult = await client
    .from("app_users")
    .select("*")
    .eq("campus_email", normalized)
    .maybeSingle<PersistedUser>();
  if (emailResult.error) throw emailResult.error;
  if (emailResult.data) return emailResult.data;

  const phoneResult = await client
    .from("app_users")
    .select("*")
    .eq("phone_e164", identifier.trim())
    .maybeSingle<PersistedUser>();
  if (phoneResult.error) throw phoneResult.error;
  return phoneResult.data ?? null;
}

export async function findUserById(userId: string): Promise<PersistedUser | null> {
  if (!isSupabaseEnabled()) return null;
  const client = getAdminClient();
  const result = await client.from("app_users").select("*").eq("id", userId).maybeSingle<PersistedUser>();
  if (result.error) throw result.error;
  return result.data ?? null;
}

export async function logActivity(entry: ActivityLogInput): Promise<void> {
  if (!isSupabaseEnabled()) return;
  const client = getAdminClient();
  const { error } = await client.from("activity_logs").insert({
    user_id: entry.userId ?? null,
    action: entry.action,
    metadata: entry.metadata ?? {},
    request_id: entry.requestId ?? null,
    ip_hash: entry.ipHash ?? null
  });
  if (error) throw error;
}

export async function pingSupabase(): Promise<{ ok: boolean; detail: string }> {
  if (!isSupabaseEnabled()) {
    return { ok: false, detail: "Supabase not configured" };
  }

  const client = getAdminClient();
  const { error } = await client
    .from("app_users")
    .select("id", { head: true, count: "exact" })
    .limit(1);
  if (error) {
    return { ok: false, detail: error.message };
  }

  return { ok: true, detail: "ok" };
}
