import { NextResponse } from "next/server";
import { db } from "@/libs/db";
import bcrypt from "bcrypt";

export async function POST(req) {
    let { name, email, phone, password, access_code } = await req.json();
    const REGISTER_ACCESS_CODES = JSON.parse(process.env.REGISTER_ACCESS_CODES);

    if (!name || !email || !password) {
        return NextResponse.json({ message: "Name, email and password are required" }, { status: 400 });
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
        return NextResponse.json({ message: "Invalid email" }, { status: 400 });
    }
    
    if (REGISTER_ACCESS_CODES.includes(access_code)) {
        password = await bcrypt.hash(password, 10);
        let connection;

        try {
            connection = await db();
            const emailDuplicacySql = `SELECT * FROM admin WHERE email = ?`;
            const emailDuplicacy = await connection.execute(emailDuplicacySql, [email]);
            if (emailDuplicacy[0].length > 0) {
                return NextResponse.json({ message: "Email already exists" }, { status: 400 });
            }

            const phoneDuplicacySql = `SELECT * FROM admin WHERE phone = ?`;
            const phoneDuplicacy = await connection.execute(phoneDuplicacySql, [phone]);
            if (phoneDuplicacy[0].length > 0) {
                return NextResponse.json({ message: "Phone already exists" }, { status: 400 });
            }

            const ip = req.headers.get('x-forwarded-for') || req.socket.remoteAddress || "Unknown IP";
            const insertSql = `INSERT INTO admin (name, email, phone, password, ip) VALUES (?, ?, ?, ?, ?)`;
            const insertResult = await connection.execute(insertSql, [name, email, phone, password, ip]);
            if (insertResult.affectedRows === 0) {
                return NextResponse.json({ message: "Failed to register" }, { status: 500 });
            } else {
                return NextResponse.json({ message: "Registered successfully" }, { status: 200 });
            }
        } catch (error) {
            return NextResponse.json({ message: "Database error", error: error.message }, { status: 500 });
        } finally {
            if (connection) {
                await connection.end();
            }
        }
    } else {
        return NextResponse.json({ message: "Invalid access code." }, { status: 403 });
    }
}
