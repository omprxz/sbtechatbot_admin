import { NextResponse } from "next/server";
import { db } from "@/libs/db";

export const GET = async () => {
    const connection = await db();

    try {
        const [categories] = await connection.execute(`
            SELECT DISTINCT category FROM dataset_files WHERE category IS NOT NULL
        `);

        const categoryList = categories.map(item => item.category);

        return NextResponse.json({ categories: categoryList }, { status: 200 });
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ message: "An error occurred while fetching categories.", error: error.message }, { status: 500 });
    } finally {
        await connection.end();
    }
};
