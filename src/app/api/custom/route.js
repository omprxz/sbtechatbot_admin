import { db } from "@/libs/db";
import { NextResponse } from "next/server";

export async function GET(request) {
    const connection = await db();
    const url = new URL(request.url);
    const page = url.searchParams.get('page') || '1';
    const limit = url.searchParams.get('limit') || '10';

    const pageNum = page === 'all' ? null : parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    try {
        let questions;
        if (pageNum === null) {
            [questions] = await connection.execute(
                `SELECT dq.*, a.name AS created_by_name 
                 FROM dataset_questions dq 
                 LEFT JOIN admin a ON dq.created_by = a.id 
                 WHERE dq.file_id IS NULL`
            );
        } else {
            const offset = (pageNum - 1) * limitNum;
            [questions] = await connection.execute(
                `SELECT dq.*, a.name AS created_by_name 
                 FROM dataset_questions dq 
                 LEFT JOIN admin a ON dq.created_by = a.id 
                 WHERE dq.file_id IS NULL 
                 LIMIT ${limitNum} OFFSET ${offset}`
            );
        }

        const [totalCount] = await connection.execute(
            `SELECT COUNT(*) AS count FROM dataset_questions WHERE file_id IS NULL`
        );

        if (questions.length > 0) {
            return NextResponse.json(
                { questions, totalCount: totalCount[0]?.count || 0 }, 
                { status: 200 }
            );
        } else {
            return NextResponse.json(
                { message: 'No custom questions found.' }, 
                { status: 404 }
            );
        }
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json(
            { message: 'An error occurred while fetching questions.', error: error.message },
            { status: 500 }
        );
    } finally {
        await connection.end();
    }
}
