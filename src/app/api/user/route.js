import { NextResponse } from "next/server";
import { verifyJwt } from "@/middleware/verifyJwt";
import { db } from "@/libs/db";
import { cookies } from "next/headers";
import jwt from "jsonwebtoken";

export async function PUT(req){
    const cookieStore = await cookies()
    const { isValid, message, user } = await verifyJwt(req);
  
  if (!isValid) {
    return NextResponse.json({ message }, { status: isValid ? 200 : 403 });
  }
    
    const {name, email, phone} = await req.json()
    if(!name || !email){
        return NextResponse.json({message: "Name and email are required"}, {status: 400})
    }
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if(!emailRegex.test(email)){
        return NextResponse.json({message: "Invalid email"}, {status: 400})
    }
let connection;
    try{
        connection = await db()
        const id = user?.id
        let updateSql = ''
        let updateResult = ''
        if(phone){
            updateSql = `UPDATE admin SET name = ?, email = ?, phone = ? WHERE id = ?`
         updateResult = await connection.execute(updateSql, [name, email, phone, id])
        }else{
            updateSql = `UPDATE admin SET name = ?, email = ? WHERE id = ?`
            updateResult = await connection.execute(updateSql, [name, email, id])
        }
        
        if(updateResult.affectedRows === 0){
            return NextResponse.json({message: "Failed to update"}, {status: 500})
        }else{
            const token = jwt.sign(
                { id: user.id, email: email, name: name, phone: phone },
                process.env.JWT_SECRET,
                { expiresIn: "30d" }
            );
            cookieStore.set("token", token, {
                httpOnly: true,
                maxAge: 60 * 60 * 24 * 30
            });
            return NextResponse.json({message: "Updated successfully"}, {status: 200})
        }
    } catch(error){
        return NextResponse.json({message: "Failed to update"}, {status: 500})
    } finally {
        if (connection) {
            await connection.end();
        }
    }
    }

export async function GET(req){
    const { isValid, message, user } = await verifyJwt(req);
  
  if (!isValid) {
    return NextResponse.json({ message }, { status: isValid ? 200 : 403 });
  }
    let connection; 
    const id = user?.id
    try{
        connection = await db()
        const [rows] = await connection.execute(`SELECT id, name, email, phone, created_at FROM admin WHERE id = ?`, [id])
        if(rows.length === 0){
            return NextResponse.json({message: "User not found"}, {status: 404})
        }else{
            return NextResponse.json({user: rows[0]}, {status: 200})
        }
    } catch(error){
        return NextResponse.json({message: "Failed to fetch user"}, {status: 500})
    } finally {
        if (connection) {
            await connection.end();
        }
    }
}
