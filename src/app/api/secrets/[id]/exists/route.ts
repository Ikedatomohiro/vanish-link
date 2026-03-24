import { NextRequest, NextResponse } from "next/server";
import { getRedis } from "@/lib/redis";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const key = `secret:${id}`;
    const redis = getRedis();

    const exists = await redis.exists(key);

    if (exists) {
      const data = await redis.get<string>(key);
      if (data) {
        const record = JSON.parse(data);
        return NextResponse.json({
          exists: true,
          hasPassword: record.hasPassword ?? false,
        });
      }
    }

    return NextResponse.json({ exists: false, hasPassword: false });
  } catch {
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
