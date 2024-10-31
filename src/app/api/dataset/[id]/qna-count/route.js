import { db } from "@/libs/db";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    const { id } = params;
    const connection = await db();

    try {
        const [result] = await connection.execute(
            `SELECT COUNT(*) AS total_questions FROM dataset_questions WHERE file_id = ?`,
            [id]
        );

        const totalQuestions = result[0]?.total_questions || 0;

        return NextResponse.json({ totalQuestions }, { status: 200 });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            { message: 'An error occurred while fetching the question count.', error: error.message },
            { status: 500 }
        );
    } finally {
        if (connection) await connection.end();
    }
}
