import { NextResponse } from "next/server";
import type { GameMode } from "@/game/GameConfig";
import { clampScore, cleanPlayerName, type HighScore } from "@/lib/scores";
import { getSupabase, isSupabaseConfigured } from "@/lib/supabase";

const LIMIT = 10;

function parseMode(value: string | null): GameMode | null {
  return value === "A" || value === "B" ? value : null;
}

export async function GET(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  }

  const mode = parseMode(new URL(req.url).searchParams.get("mode"));
  if (!mode) {
    return NextResponse.json({ error: "mode must be A or B" }, { status: 400 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  }

  const { data, error } = await supabase
    .from("high_scores")
    .select("player_name, score, game_mode, created_at")
    .eq("game_mode", mode)
    .order("score", { ascending: false })
    .order("created_at", { ascending: true })
    .limit(LIMIT);

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ scores: (data ?? []) as HighScore[] });
}

export async function POST(req: Request) {
  if (!isSupabaseConfigured()) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  }

  let body: unknown;
  try {
    body = await req.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON" }, { status: 400 });
  }

  if (!body || typeof body !== "object") {
    return NextResponse.json({ error: "Invalid payload" }, { status: 400 });
  }

  const raw = body as Record<string, unknown>;
  const mode = parseMode(typeof raw.game_mode === "string" ? raw.game_mode : null);
  const score = clampScore(typeof raw.score === "number" ? raw.score : Number(raw.score));
  const player_name = cleanPlayerName(
    typeof raw.player_name === "string" ? raw.player_name : "",
  );

  if (!mode) {
    return NextResponse.json({ error: "game_mode must be A or B" }, { status: 400 });
  }

  const supabase = getSupabase();
  if (!supabase) {
    return NextResponse.json({ error: "Supabase is not configured" }, { status: 503 });
  }

  const { error } = await supabase.from("high_scores").insert({
    player_name,
    score,
    game_mode: mode,
  });

  if (error) {
    return NextResponse.json({ error: error.message }, { status: 500 });
  }

  return NextResponse.json({ ok: true });
}
