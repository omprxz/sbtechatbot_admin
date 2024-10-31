import { NextResponse } from "next/server";
import { db } from "@/libs/db";
import { verifyJwt } from "@/middleware/verifyJwt";

export const POST = async (req) => {
  const { isValid, message, user } = await verifyJwt(req);
  if (!isValid) return NextResponse.json({ message }, { status: 403 });

  let { question, answer, status } = await req.json();
  if (!status) status = "active";
  if (!question) return NextResponse.json({ message: "Question is required" }, { status: 400 });

  let connection;

  try {
    connection = await db();
    const [result] = await connection.execute(
      `INSERT INTO dataset_questions (question, answer, status, created_by) VALUES (?, ?, ?, ?)`,
      [question, answer || null, status, user.id]
    );

    console.log(result);

    return NextResponse.json({ message: "Custom QnA added" }, { status: 201 });
  } catch (error) {
    console.error("Database error:", error);
    return NextResponse.json({ message: "An error occurred while adding the question.", error: error.message }, { status: 500 });
  } finally {
    if (connection) {
      await connection.end();
    }
  }
};
