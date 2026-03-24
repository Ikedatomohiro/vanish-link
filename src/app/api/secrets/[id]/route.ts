import { NextRequest, NextResponse } from "next/server";
import { getRedis, type SecretRecord } from "@/lib/redis";

export async function GET(
  _request: NextRequest,
  { params }: { params: Promise<{ id: string }> }
) {
  try {
    const { id } = await params;
    const key = `secret:${id}`;

    const data = await getRedis().getdel(key);

    if (!data) {
      return NextResponse.json(
        { error: "このリンクはすでに消滅したか、存在しません。" },
        { status: 404 }
      );
    }

    // Upstash SDKは自動でJSONパースするため、stringの場合もobjectの場合もある
    const record: SecretRecord =
      typeof data === "string" ? JSON.parse(data) : data;

    return NextResponse.json({
      encryptedData: record.encryptedData,
      hasPassword: record.hasPassword,
      salt: record.salt,
    });
  } catch {
    return NextResponse.json(
      { error: "サーバーエラーが発生しました" },
      { status: 500 }
    );
  }
}
