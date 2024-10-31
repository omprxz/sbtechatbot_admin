import { db } from "@/libs/db";
import { NextResponse } from "next/server";

export async function GET(request) {
    let connection;

    try {
        connection = await db();

        const url = new URL(request.url);
        const page = url.searchParams.get('page') || 'all';
        const limit = url.searchParams.get('limit') || '10';

        const pageNum = page === 'all' ? null : parseInt(page, 10);
        const limitNum = parseInt(limit, 10);

        let questions;

        if (pageNum === null) {
            [questions] = await connection.execute(
                `SELECT dq.*, a.name AS created_by_name 
                 FROM dataset_questions dq 
                 LEFT JOIN admin a ON dq.created_by = a.id`
            );
        } else {
            const offset = (pageNum - 1) * limitNum;
            [questions] = await connection.execute(
                `SELECT dq.*, a.name AS created_by_name 
                 FROM dataset_questions dq 
                 LEFT JOIN admin a ON dq.created_by = a.id 
                 LIMIT ${limitNum} OFFSET ${offset}`
            );
        }

        const [totalCountResult] = await connection.execute(
            `SELECT COUNT(*) AS count FROM dataset_questions`
        );
        const totalCount = totalCountResult[0].count;

        if (questions.length > 0) {
            return NextResponse.json({ questions, totalCount }, { status: 200 });
        } else {
            return NextResponse.json({ message: 'No questions found for this dataset.' }, { status: 404 });
        }
    } catch (error) {
        console.error('Database error:', error.message);
        return NextResponse.json({ message: 'An error occurred while fetching questions.', error: error.message }, { status: 500 });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}
