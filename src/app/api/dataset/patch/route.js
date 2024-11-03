import { NextResponse } from "next/server";
import { db } from "@/libs/db";
import { verifyJwt } from "@/middleware/verifyJwt";
import fs from "fs/promises"; // Using promises-based fs module
import path from "path";

export async function POST(req) {
    const body = await req.json();
    const { isValid, message, user } = await verifyJwt(req);
    if (!isValid) return NextResponse.json({ message }, { status: 403 });

    let connection;
    try {
        connection = await db();

        const id = body.id;

        switch (body.action) {
            case "status": {
                const newStatus = body.status;
                const [resultStatus] = await connection.execute(
                    "UPDATE dataset_files SET status = ? WHERE id = ?",
                    [newStatus, id]
                );

                if (resultStatus.affectedRows === 1) {
                    await connection.execute(
                        `UPDATE dataset_questions SET status = ? where file_id = ?`, 
                        [newStatus, id]
                    );
                    return NextResponse.json({ message: "Status updated successfully" }, { status: 200 });
                } else {
                    return NextResponse.json({ message: "Failed to update status" }, { status: 500 });
                }
            }

            case "category": {
                const newCategory = body.category;
                const [resultCategory] = await connection.execute(
                    "UPDATE dataset_files SET category = ? WHERE id = ?",
                    [newCategory, id]
                );

                if (resultCategory.affectedRows === 1) {
                    return NextResponse.json({ message: "Category updated successfully" }, { status: 200 });
                } else {
                    return NextResponse.json({ message: "Failed to update category" }, { status: 500 });
                }
            }

            case "categoryToNull": {
                const [resultCategory] = await connection.execute(
                    "UPDATE dataset_files SET category = NULL WHERE id = ?",
                    [id]
                );

                if (resultCategory.affectedRows === 1) {
                    return NextResponse.json({ message: "Category set to NULL successfully" }, { status: 200 });
                } else {
                    return NextResponse.json({ message: "Failed to update category" }, { status: 500 });
                }
            }

            case "delete": {
                try {
                    const [fileDetails] = await connection.execute(
                        "SELECT name FROM dataset_files WHERE id = ?",
                        [id]
                    );

                    if (fileDetails.length === 0) {
                        return NextResponse.json({ message: "File data not found" }, { status: 404 });
                    }

                    const fileName = fileDetails[0].name;
                    const filePath = path.join(process.cwd(), 'tmp', fileName);

                    try{
                    await fs.unlink(filePath);
                    }catch(e){
                        console.log(e?.message)
                    }

                    const [resultDelete] = await connection.execute(
                        "DELETE FROM dataset_files WHERE id = ?",
                        [id]
                    );

                    if (resultDelete.affectedRows === 1) {
                        await connection.execute(
                            "DELETE FROM dataset_questions WHERE file_id = ?",
                            [id]
                        );

                        return NextResponse.json({ message: "File and associated questions deleted successfully" }, { status: 200 });
                    } else {
                        return NextResponse.json({ message: "Failed to delete file from database" }, { status: 500 });
                    }
                } catch (error) {
                    console.error("File deletion error:", error);
                    return NextResponse.json({ message: "Failed to delete file from uploads directory", error: error.message }, { status: 500 });
                }
            }

            default:
                return NextResponse.json({ message: "Invalid action" }, { status: 400 });
        }
    } catch (error) {
        console.error("Database error:", error);
        return NextResponse.json({ message: "An error occurred", error: error.message }, { status: 500 });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}
