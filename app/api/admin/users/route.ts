import { createClient } from "@supabase/supabase-js";
import { NextResponse } from "next/server";

const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
const supabaseServiceRoleKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

type Role = "intern" | "supervisor" | "admin";

function isValidRole(role: string): role is Role {
  return ["intern", "supervisor", "admin"].includes(role);
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
  const token = authHeader?.replace("Bearer ", "");

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

  const serviceClient = createClient(supabaseUrl, supabaseServiceRoleKey);

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

  return { user, serviceClient };
}

export async function POST(request: Request) {
  const { errorResponse, serviceClient } = await verifyAdmin(request);

  if (errorResponse) return errorResponse;

  if (!serviceClient) {
    return NextResponse.json({ error: "Unable to initialize admin client." }, { status: 500 });
  }

  const body = await request.json();
  const fullName = String(body.fullName ?? "").trim();
  const email = String(body.email ?? "").trim().toLowerCase();
  const password = String(body.password ?? "");
  const role = String(body.role ?? "intern");

  if (!fullName || !email || !password) {
    return NextResponse.json({ error: "Full name, email, and password are required." }, { status: 400 });
  }

  if (!isValidRole(role)) {
    return NextResponse.json({ error: "Invalid role selected." }, { status: 400 });
  }

  if (password.length < 6) {
    return NextResponse.json({ error: "Password must be at least 6 characters." }, { status: 400 });
  }

  const { data: createdUserData, error: createUserError } = await serviceClient.auth.admin.createUser({
    email,
    password,
    email_confirm: true,
    user_metadata: {
      full_name: fullName,
    },
  });

  if (createUserError || !createdUserData.user) {
    return NextResponse.json(
      { error: createUserError?.message ?? "Unable to create user." },
      { status: 400 }
    );
  }

  const { error: profileError } = await serviceClient.from("profiles").upsert({
    id: createdUserData.user.id,
    full_name: fullName,
    role,
  });

  if (profileError) {
    await serviceClient.auth.admin.deleteUser(createdUserData.user.id);

    return NextResponse.json(
      { error: profileError.message },
      { status: 400 }
    );
  }

  return NextResponse.json({
    profile: {
      id: createdUserData.user.id,
      full_name: fullName,
      role,
      created_at: createdUserData.user.created_at,
    },
  });
}

export async function DELETE(request: Request) {
  const { errorResponse, user, serviceClient } = await verifyAdmin(request);

  if (errorResponse) return errorResponse;

  if (!user || !serviceClient) {
    return NextResponse.json({ error: "Unable to initialize admin client." }, { status: 500 });
  }

  const body = await request.json();
  const userId = String(body.userId ?? "").trim();

  if (!userId) {
    return NextResponse.json({ error: "User ID is required." }, { status: 400 });
  }

  if (userId === user.id) {
    return NextResponse.json({ error: "You cannot delete your own account." }, { status: 400 });
  }

  const { count: adminCount, error: adminCountError } = await serviceClient
    .from("profiles")
    .select("id", { count: "exact", head: true })
    .eq("role", "admin");

  if (adminCountError) {
    return NextResponse.json({ error: adminCountError.message }, { status: 400 });
  }

  const { data: targetProfile, error: targetProfileError } = await serviceClient
    .from("profiles")
    .select("role")
    .eq("id", userId)
    .single();

  if (targetProfileError) {
    return NextResponse.json({ error: targetProfileError.message }, { status: 400 });
  }

  if (targetProfile?.role === "admin" && (adminCount ?? 0) <= 1) {
    return NextResponse.json({ error: "You cannot delete the last admin account." }, { status: 400 });
  }

  const { error: profileDeleteError } = await serviceClient.from("profiles").delete().eq("id", userId);

  if (profileDeleteError) {
    return NextResponse.json({ error: profileDeleteError.message }, { status: 400 });
  }

  const { error: authDeleteError } = await serviceClient.auth.admin.deleteUser(userId);

  if (authDeleteError) {
    return NextResponse.json({ error: authDeleteError.message }, { status: 400 });
  }

  return NextResponse.json({ success: true });
}