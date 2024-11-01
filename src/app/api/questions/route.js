import { db } from "@/libs/db";
import { NextResponse } from "next/server";

export async function GET(request, { params }) {

    const connection = await db();
    const url = new URL(request.url);
    const page = url.searchParams.get('page') || '1';
    const limit = url.searchParams.get('limit') || '10';
    const search = url.searchParams.get('search') || '';

    const pageNum = page === 'all' ? null : parseInt(page, 10);
    const limitNum = parseInt(limit, 10);

    try {
        let questions;
        if (pageNum === null) {
            [questions] = await connection.execute(`SELECT * FROM dataset_questions`);
        } else {
            const offset = (pageNum - 1) * limitNum;
            if(search){
            [questions] = await connection.execute(
                `SELECT * FROM dataset_questions WHERE (question LIKE ? OR answer LIKE ?) LIMIT ${limitNum} OFFSET ${offset}`,
                [`%${search}%`, `%${search}%`]
            );
        }else{
            [questions] = await connection.execute(
                `SELECT * FROM dataset_questions LIMIT ${limitNum} OFFSET ${offset}`
            );
        }
        }

        const [totalQ] = await connection.execute(`select count(*) as count from dataset_questions`)

        if (questions.length > 0) {
            return NextResponse.json({ questions, totalQuestions: totalQ[0].count,}, { status: 200 });
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