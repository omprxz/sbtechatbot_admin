import { NextResponse } from "next/server";
import { db } from "@/libs/db";
import { verifyJwt } from "@/middleware/verifyJwt";
import bcrypt from "bcrypt";

export async function PATCH(req) {
    let connection;
    try {
        const { isValid, message, user } = await verifyJwt(req);
      
        if (!isValid) {
            return NextResponse.json({ message }, { status: 403 });
        }

        connection = await db();
        const { oldPassword, newPassword } = await req.json();

        if (!oldPassword || !newPassword) {
            return NextResponse.json({ message: "Old and new password are required" }, { status: 400 });
        }

        const id = user?.id;
        const sql = `SELECT * FROM admin WHERE id = ?`;
        const [rows] = await connection.execute(sql, [id]);
        const userData = rows[0];

        if (!userData) {
            return NextResponse.json({ message: "User not found" }, { status: 404 });
        }

        const isMatch = await bcrypt.compare(oldPassword, userData.password);
        if (!isMatch) {
            return NextResponse.json({ message: "Incorrect old password" }, { status: 400 });
        }

        const newPasswordHash = await bcrypt.hash(newPassword, 10);
        const updateSql = `UPDATE admin SET password = ? WHERE id = ?`;
        const [updateResult] = await connection.execute(updateSql, [newPasswordHash, id]);

        if (updateResult.affectedRows === 0) {
            return NextResponse.json({ message: "Failed to update" }, { status: 500 });
        } else {
            return NextResponse.json({ message: "Password updated successfully" }, { status: 200 });
        }
    } catch (error) {
        console.error("Error updating password:", error.message);
        return NextResponse.json({ message: "An error occurred while updating password" }, { status: 500 });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}
