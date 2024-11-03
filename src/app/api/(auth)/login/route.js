import { NextResponse } from "next/server";
import bcrypt from "bcrypt";
import { db } from "@/libs/db";
import jwt from "jsonwebtoken";
import { cookies } from "next/headers";

export async function GET() {
    const cookieStore = await cookies();
    return NextResponse.json({ message: "Login", token: cookieStore.get("token")?.value }, { status: 200 });
}

export async function POST(req) {
    const { email, password } = await req.json();
    const JWT_SECRET = process.env.JWT_SECRET;
    if (!email || !password) {
        return NextResponse.json({ message: "Email and password are required" }, { status: 400 });
    }

    const cookieStore = await cookies();
    let connection;

    try {
        connection = await db();
        const sql = `SELECT * FROM admin WHERE email = ?`;
        const result = await connection.execute(sql, [email]);

        if (result[0].length === 0) {
            return NextResponse.json({ message: "Invalid email" }, { status: 400 });
        }

        const user = result[0][0];
        const passwordMatch = await bcrypt.compare(password, user.password);

        if (!passwordMatch) {
            return NextResponse.json({ message: "Invalid email or password" }, { status: 400 });
        }

        const token = jwt.sign(
            { id: user.id, email: user.email, name: user.name, phone: user.phone },
            JWT_SECRET,
            { expiresIn: "30d" }
        );

        const response = NextResponse.json({ message: "Login successful" }, { status: 200 });
        cookieStore.set("token", token, {
            httpOnly: true,
            maxAge: 60 * 60 * 24 * 30
        });

        return response;
    } catch (error) {
        return NextResponse.json({ message: "Database error", error: error.message }, { status: 500 });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}
