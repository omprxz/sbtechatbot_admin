import { NextResponse } from 'next/server';
import { db } from '@/libs/db';
import { verifyJwt } from '@/middleware/verifyJwt';

export async function GET(req) {
    const { isValid, message, user } = await verifyJwt(req);
    if (!isValid) return NextResponse.json({ message }, { status: 403 });

    const url = new URL(req.url);
    let connection;

    try {
        connection = await db();

        if (!url.searchParams.get('page') || url.searchParams.get('page') === "all") {
            const [files] = await connection.execute(
                `SELECT df.id, df.name, df.size, df.type, df.created_by, df.status, df.category, df.access_link, df.created_at, a.name AS created_by_name 
                FROM dataset_files df 
                JOIN admin a ON df.created_by = a.id 
                ORDER BY df.created_at DESC`
            );
            return NextResponse.json({ files });
        }

        const page = parseInt(url.searchParams.get('page'), 10) || 1;
        const limit = parseInt(url.searchParams.get('limit'), 10) || 10;
        
        if (isNaN(page) || isNaN(limit) || page < 1 || limit < 1) {
            return NextResponse.json({ message: 'Invalid pagination parameters' }, { status: 400 });
        }

        const offset = (page - 1) * limit;

        const [files] = await connection.execute(
            `SELECT df.id, df.name, df.size, df.type, df.created_by, df.status, df.category, df.access_link, df.created_at, a.name AS created_by_name 
            FROM dataset_files df 
            JOIN admin a ON df.created_by = a.id 
            ORDER BY df.created_at DESC 
            LIMIT ${limit} OFFSET ${offset}`
        );

        const [[{ count }]] = await connection.execute(`SELECT COUNT(*) as count FROM dataset_files`);
        const totalPages = Math.ceil(count / limit);

        return NextResponse.json({ files, totalPages });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ message: 'An error occurred while fetching files.', error: error.message }, { status: 500 });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}
