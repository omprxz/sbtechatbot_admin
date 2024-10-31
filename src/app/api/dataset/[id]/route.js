import { db } from "@/libs/db";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {
    const { id: dataset_id } = params;
    if (!dataset_id) {
        return NextResponse.json({ message: 'Dataset ID is required.' }, { status: 400 });
    }

    const connection = await db();
    const url = new URL(request.url);
    const page = url.searchParams.get('page') || '1';
    const limit = url.searchParams.get('limit') || '10';

    const pageNum = page === 'all' ? null : parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    try {
        let questions;
        if (pageNum === null) {
            [questions] = await connection.execute(`SELECT * FROM dataset_questions WHERE file_id = ?`, [dataset_id]);
        } else {
            const offset = (pageNum - 1) * limitNum;
            [questions] = await connection.execute(
                `SELECT * FROM dataset_questions WHERE file_id = ? LIMIT ${limitNum} OFFSET ${offset}`,
                [dataset_id]
            );
        }

        const [dataset] = await connection.execute(`SELECT * FROM dataset_files WHERE id = ?`, [dataset_id]);

        if (questions.length > 0) {
            return NextResponse.json({ questions, totalQuestions: questions.length, dataset: dataset[0] }, { status: 200 });
        } else {
            return NextResponse.json({ message: 'No questions found for this dataset.' }, { status: 404 });
        }
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ message: 'An error occurred while fetching questions.', error: error.message }, { status: 500 });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}
