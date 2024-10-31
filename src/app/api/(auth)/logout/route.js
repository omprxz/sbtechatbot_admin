import { NextResponse } from "next/server";
import { cookies } from "next/headers";

export async function POST() {
    const cookieStore = await cookies();
    cookieStore.set("token", "", {
        httpOnly: true,
        maxAge: -1
    });
    return NextResponse.json({ message: "Logout successful" }, { status: 200 });
}