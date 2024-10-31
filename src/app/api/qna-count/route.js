import { db } from "@/libs/db";
import { NextResponse } from "next/server";

export async function GET(request) {
    let connection;

    try {
        connection = await db();
        
        const [result] = await connection.execute(
            `SELECT COUNT(*) AS total_questions FROM dataset_questions`
        );

        const totalQuestions = result[0].total_questions;

        return NextResponse.json({ totalQuestions }, { status: 200 });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ message: 'An error occurred while fetching the question count.', error: error.message }, { status: 500 });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}
