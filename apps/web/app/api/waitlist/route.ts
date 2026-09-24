import { NextResponse } from "next/server";
import { waitlistClient } from "@/lib/supabase";

const EMAIL_RE = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

export async function POST(req: Request) {
  let email: unknown;
  try {
    ({ email } = await req.json());
  } catch {
    return NextResponse.json({ error: "That request didn't look right — try again." }, { status: 400 });
  }

  if (typeof email !== "string" || !EMAIL_RE.test(email.trim())) {
    return NextResponse.json({ error: "Enter a valid email address." }, { status: 400 });
  }
  const normalized = email.trim().toLowerCase();

  const supabase = waitlistClient();
  if (!supabase) {
    // Env not configured — don't pretend it worked.
    return NextResponse.json(
      { error: "The waitlist isn't wired up in this environment yet. Try again later." },
      { status: 503 },
    );
  }

  const { error } = await supabase.from("waitlist").insert({ email: normalized, source: "landing" });

  // Duplicate email (unique violation) is treated as success, without leaking whether it existed.
  if (error && error.code !== "23505") {
    return NextResponse.json({ error: "Couldn't save that — give it another moment and retry." }, { status: 502 });
  }

  return NextResponse.json({ ok: true }, { status: 200 });
}
