

import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

export const runtime = "nodejs";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

async function readJsonBody(request: Request) {
  try {
    return await request.json();
  } catch {
    return null;
  }
}

async function verifyAdmin(request: Request) {
  if (!supabaseUrl || !supabaseAnonKey || !supabaseServiceRoleKey) {
    return {
      errorResponse: NextResponse.json(
        { error: "Supabase environment variables are not configured." },
        { status: 500 }
      ),
    };
  }

  const authHeader = request.headers.get("authorization");
  const token = authHeader?.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return {
      errorResponse: NextResponse.json({ error: "Missing authorization token." }, { status: 401 }),
    };
  }

  const userClient = createClient(supabaseUrl, supabaseAnonKey, {
    global: {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    },
  });

  const serviceClient = createClient(supabaseUrl, supabaseServiceRoleKey, {
    auth: {
      persistSession: false,
      autoRefreshToken: false,
    },
  });

  const {
    data: { user },
    error: userError,
  } = await userClient.auth.getUser();

  if (userError || !user) {
    return {
      errorResponse: NextResponse.json({ error: "Unable to verify user." }, { status: 401 }),
    };
  }

  const { data: requesterProfile, error: requesterProfileError } = await userClient
    .from("profiles")
    .select("role")
    .eq("id", user.id)
    .single();

  if (requesterProfileError || requesterProfile?.role !== "admin") {
    return {
      errorResponse: NextResponse.json({ error: "Admin access required." }, { status: 403 }),
    };
  }

  return { serviceClient };
}

export async function POST(request: Request) {
  const { errorResponse, serviceClient } = await verifyAdmin(request);

  if (errorResponse) return errorResponse;

  if (!serviceClient) {
    return NextResponse.json({ error: "Unable to initialize admin client." }, { status: 500 });
  }

  const body = await readJsonBody(request);

  if (!body || body.confirmation !== "RESET") {
    return NextResponse.json({ error: "Reset confirmation is required." }, { status: 400 });
  }

  const { error: updatesError } = await serviceClient
    .from("updates")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (updatesError) {
    return NextResponse.json({ error: updatesError.message }, { status: 400 });
  }

  const { error: cowHistoryError } = await serviceClient
    .from("cow_total_changes")
    .delete()
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (cowHistoryError) {
    return NextResponse.json({ error: cowHistoryError.message }, { status: 400 });
  }

  const { error: schoolsError } = await serviceClient
    .from("schools")
    .update({ completed_cows: 0, damaged_devices: 0 })
    .neq("id", "00000000-0000-0000-0000-000000000000");

  if (schoolsError) {
    return NextResponse.json({ error: schoolsError.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}