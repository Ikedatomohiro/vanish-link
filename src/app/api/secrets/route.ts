import { NextRequest, NextResponse } from "next/server";
import { getRedis, TTL_OPTIONS, type SecretRecord } from "@/lib/redis";
import { getRatelimit } from "@/lib/rate-limit";
import { createSecretSchema } from "@/lib/schemas";

export async function POST(request: NextRequest) {
  try {
    const ip = request.headers.get("x-forwarded-for") ?? "anonymous";
    const { success } = await getRatelimit().limit(ip);
    if (!success) {
      return NextResponse.json(
        { error: "リクエストが多すぎます。しばらく待ってから再試行してください。" },
        { status: 429 }
      );
    }

    const body = await request.json();
    const parsed = createSecretSchema.safeParse(body);

    if (!parsed.success) {
      return NextResponse.json(
        { error: "入力データが不正です", details: parsed.error.flatten() },
        { status: 400 }
      );
    }

    const { encryptedData, hasPassword, salt, ttl } = parsed.data;

    const id = crypto.randomUUID();
    const key = `secret:${id}`;
    const ttlSeconds = TTL_OPTIONS[ttl];

    const record: SecretRecord = {
      encryptedData,
      hasPassword,
      salt,
      createdAt: Date.now(),
    };

    await getRedis().set(key, JSON.stringify(record), { ex: ttlSeconds });

    return NextResponse.json({ id, expiresIn: ttlSeconds }, { status: 201 });
  } catch {
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
