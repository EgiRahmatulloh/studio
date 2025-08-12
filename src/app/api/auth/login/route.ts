import { NextRequest, NextResponse } from "next/server";
import { authenticateUser, generateToken } from "@/lib/auth";

export async function POST(req: NextRequest) {
  try {
    const { username, password } = await req.json();

    if (!username || !password) {
      return NextResponse.json(
        { error: "Username dan password harus diisi" },
        { status: 400 }
      );
    }

    const user = await authenticateUser(username, password);
    if (!user) {
      return NextResponse.json(
        { error: "Username atau password salah" },
        { status: 401 }
      );
    }

    const token = generateToken(user);

    const response = NextResponse.json({
      message: "Login berhasil",
      user: {
        id: user.id,
        email: user.email,
        username: user.username,
        fullName: user.fullName,
        posyanduName: user.posyanduName,
        role: user.role,
        permissions: user.permissions,
      },
      token,
    });

    // Set cookie untuk browser
    response.cookies.set("auth-token", token, {
      httpOnly: true,
      secure: process.env.NODE_ENV === "production",
      sameSite: "strict",
      maxAge: 24 * 60 * 60, // 24 jam
    });

    return response;
  } catch (error) {
    console.error("Login error:", error);
    return NextResponse.json(
      { error: "Terjadi kesalahan server" },
      { status: 500 }
    );
  }
}
