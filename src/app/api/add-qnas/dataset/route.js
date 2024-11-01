import { NextResponse } from 'next/server';
import { db } from '@/libs/db';
import { verifyJwt } from '@/middleware/verifyJwt';
import { randomUUID } from 'crypto';
import fs from 'fs';
import path from 'path';
import csvParser from 'csv-parser';
import ExcelJS from 'exceljs';

const MAX_FILE_SIZE = (parseInt(process.env.MAX_EACH_DATASET_FILE_SIZE_MB) || 10) * 1024 * 1024;
const uploadDir = path.join(process.cwd(), 'uploads', 'datasets');
if (!fs.existsSync(uploadDir)) fs.mkdirSync(uploadDir, { recursive: true });

export const POST = async (req) => {
    const { isValid, message, user } = await verifyJwt(req);
    if (!isValid) return NextResponse.json({ message }, { status: 403 });

    const formData = await req.formData();
    const file = formData.get('file');
    const status = formData.get('status');
    const ip = formData.get('ip');
    const category = formData.get('category')
    if (!file || !file.name) {
        return NextResponse.json({ message: 'File not provided' }, { status: 400 });
    }

    const fileSize = file.size;
    if (fileSize > MAX_FILE_SIZE) {
        return NextResponse.json({ message: 'File size exceeds limit' }, { status: 400 });
    }

    const fileExt = path.extname(file.name).substring(1);
    const filetypes = /json|csv|xlsx|xls|txt/;
    if (!filetypes.test(fileExt)) {
        return NextResponse.json({ message: 'Invalid file type' }, { status: 400 });
    }

    const uniqueId = randomUUID().slice(0, 10);
    const fileName = `${path.basename(file.name, `.${fileExt}`)}_${uniqueId}.${fileExt}`;
    const filePath = path.join(uploadDir, fileName);

    const arrayBuffer = await file.arrayBuffer();
    const buffer = Buffer.from(arrayBuffer);
    fs.writeFileSync(filePath, buffer);

    let questions = [];
    let isValidContent = true;

    if (fileExt === 'json') {
        try {
            const data = JSON.parse(fs.readFileSync(filePath, 'utf8'));
            isValidContent = Array.isArray(data) && data.every(entry => entry.question && entry.answer);
            questions = data.map((entry) => ({ question: entry.question, answer: entry.answer }));
        } catch (error) {
            isValidContent = false;
        }
    } else if (fileExt === 'csv') {
        const csvData = [];
        await new Promise((resolve, reject) => {
            fs.createReadStream(filePath)
                .pipe(csvParser())
                .on('data', (row) => csvData.push(row))
                .on('end', resolve)
                .on('error', reject);
        });
        isValidContent = csvData.every(row => row.question && row.answer);
        questions = csvData.map((row) => ({
            question: row.question,
            answer: row.answer
        }));
    } else if (fileExt === 'xlsx' || fileExt === 'xls') {
        try {
            const workbook = new ExcelJS.Workbook();
            await workbook.xlsx.readFile(filePath);
            const worksheet = workbook.worksheets[0];
            worksheet.eachRow({ includeEmpty: true }, (row, rowNumber) => {
                if (rowNumber > 1) {
                    const question = row.getCell(1).value;
                    const answer = row.getCell(2).value;
                    if (question && answer) {
                        questions.push({ question, answer });
                    } else {
                        isValidContent = false;
                    }
                }
            });
        } catch (error) {
            console.error('Error reading Excel file:', error);
            return NextResponse.json({ message: 'Error reading Excel file' }, { status: 500 });
        }
    } else if (fileExt === 'txt') {
        const data = fs.readFileSync(filePath, 'utf8');
        const matches = data.match(/Q:\s*(.*?)\s*A:\s*(.*?)\s*END;/gs);
        if (matches) {
            questions = matches.map((match) => {
                const [, question, answer] = match.match(/Q:\s*(.*?)\s*A:\s*(.*?)\s*END;/s);
                return { question, answer };
            });
            isValidContent = questions.every(q => q.question && q.answer);
        } else {
            isValidContent = false;
        }
    }

    if (!isValidContent) {
        fs.unlink(filePath, (err) => {
            if (err) console.error('Error deleting file:', err);
        });
        return NextResponse.json({ message: 'Invalid file content format' }, { status: 400 });
    }
    

    let connection;
    try {
        connection = await db();
        const [result] = await connection.execute(
            `INSERT INTO dataset_files (name, type, category, size, ip, created_by, status) VALUES (?, ?, ?, ?, ?, ?, ?)`,
            [fileName, fileExt, category, fileSize, ip, user.id, status]
        );

        const fileId = result.insertId;
        const values = questions.map(({ question, answer }) => [question, answer, fileId, status, user.id]);
await connection.query(
    `INSERT INTO dataset_questions (question, answer, file_id, status, created_by) VALUES ?`,
    [values]
);

        return NextResponse.json({ message: 'Dataset uploaded and questions are added' });
    } catch (error) {
        console.error('Database error:', error);
        return NextResponse.json({ message: 'An error occurred while saving to the database.', error: error.message }, { status: 500 });
    } finally {
        if (connection) {
            await connection.end();
        }
    }
};
