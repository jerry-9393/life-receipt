import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const body = await req.json();
    const { password } = body;

    const adminPassword = process.env.ADMIN_PASSWORD;

    if (!adminPassword) {
      return NextResponse.json(
        { error: "관리자 비밀번호가 설정되지 않았습니다." },
        { status: 500 }
      );
    }

    if (password === adminPassword) {
      return NextResponse.json({ success: true });
    } else {
      return NextResponse.json(
        { error: "비밀번호가 올바르지 않습니다." },
        { status: 401 }
      );
    }
  } catch (error) {
    console.error("Verify Error:", error);
    return NextResponse.json(
      { error: "인증 중 에러가 발생했습니다." },
      { status: 500 }
    );
  }
}
