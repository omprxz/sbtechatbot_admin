import { db } from "@/libs/db";
import { NextResponse } from "next/server";

export async function PUT(request, { params }) {
    const { id } = params;
    let connection;

    try {
        connection = await db();
        const body = await request.json();
        const updates = [];
        const values = [];

        if (body.question !== undefined) {
            updates.push("question = ?");
            values.push(body.question);
        }

        if (body.answer !== undefined) {
            updates.push("answer = ?");
            values.push(body.answer);
        }

        if (body.status !== undefined) {
            updates.push("status = ?");
            values.push(body.status);
        }

        if (updates.length === 0) {
            return NextResponse.json({ message: 'No fields provided for update' }, { status: 400 });
        }

        const sql = `UPDATE dataset_questions SET ${updates.join(", ")} WHERE id = ?`;
        values.push(id);
        const [result] = await connection.execute(sql, values);

        if (result.affectedRows === 1) {
            return NextResponse.json({ message: 'Question updated successfully' }, { status: 200 });
        } else {
            return NextResponse.json({ message: 'No question found with this ID or no changes made' }, { status: 404 });
        }
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ message: 'An error occurred while updating the question.', error: error.message }, { status: 500 });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}

export async function DELETE(request, { params }) {
    const { id } = params;
    let connection;

    try {
        connection = await db();
        const [result] = await connection.execute(
            `DELETE FROM dataset_questions WHERE id = ?`, 
            [id]
        );

        if (result.affectedRows === 1) {
            return NextResponse.json({ message: 'Question deleted successfully' }, { status: 200 });
        } else {
            return NextResponse.json({ message: 'No question found with this ID' }, { status: 404 });
        }
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ message: 'An error occurred while deleting the question.', error: error.message }, { status: 500 });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}
