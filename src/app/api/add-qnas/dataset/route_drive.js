import { google } from 'googleapis';
import { NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';
import { v4 as uuidv4 } from 'uuid';

const SCOPES = ['https://www.googleapis.com/auth/drive'];
const MAX_FILE_SIZE = 10 * 1024 * 1024; // 10 MB
const MAX_FILES = 10; // Maximum number of files allowed
const rootDir = "./tmp/";
const dir = path.join(process.cwd(), rootDir); // Use process.cwd() for absolute path

// Create temporary directory if it doesn't exist
if (!fs.existsSync(dir)) {
    fs.mkdirSync(dir);
}

// Function to authorize the Google Drive API
async function authorize() {
    const googleApi = JSON.parse(process.env.DRIVE_CREDS);
    const jwtClient = new google.auth.JWT(
        googleApi.client_email,
        null,
        googleApi.private_key,
        SCOPES
    );
    await jwtClient.authorize();
    return jwtClient;
}

// Function to upload a single file to a specified folder
async function uploadFile(authClient, file, parents) {
    return new Promise((resolve, reject) => {
        const drive = google.drive({ version: 'v3', auth: authClient });
        const fileName = `${path.basename(file.originalname, path.extname(file.originalname))}_${uuidv4()}${path.extname(file.originalname).toLowerCase()}`;
        
        const fileMetaData = {
            name: fileName,
            parents: [parents]
        };

        // Create a readable stream from the file buffer
        const media = {
            body: fs.createReadStream(file.path), // Read the temporary file from disk
            mimeType: file.mimetype
        };

        drive.files.create({
            resource: fileMetaData,
            media: media
        }, async (err, file) => {
            if (err) {
                reject(err);
            } else {
                try {
                    await drive.permissions.create({
                        fileId: file.data.id,
                        requestBody: {
                            role: 'reader',
                            type: 'anyone'
                        }
                    });
                    resolve(file.data.id);
                } catch (err) {
                    reject(err);
                }
            }
        });
    });
}

// API route handler
export async function POST(request) {
    try {
        const authClient = await authorize();
        const formData = await request.formData();
        const files = formData.getAll('files'); // Assuming 'files' is the key for multiple file uploads
        const folderId = process.env.DRIVE_FOLDER_ID; // Get the folder ID from environment variables

        // Validate the number of files and their sizes
        if (files.length === 0 || files.length > MAX_FILES) {
            return NextResponse.json(
                { error: 'Please upload between 1 and 10 files.' },
                { status: 400 }
            );
        }

        const fileDetails = [];

        for (const file of files) {
            // Validate file size
            if (file.size > MAX_FILE_SIZE) {
                return NextResponse.json(
                    { error: `File ${file.name} exceeds the 10 MB size limit.` },
                    { status: 400 }
                );
            }

            // Save the file temporarily
            const filePath = path.join(dir, `${uuidv4()}_${file.name}`);
            const buffer = Buffer.from(await file.arrayBuffer()); // Convert file buffer to Node.js Buffer
            fs.writeFileSync(filePath, buffer); // Write the buffer to a temporary file

            // Upload the file and gather details
            console.log({ path: filePath, originalname: file.name, mimetype: file.type });
            const details = await uploadFile(authClient, { path: filePath, originalname: file.name, mimetype: file.type }, folderId);
            fileDetails.push(details);
        }

        return NextResponse.json(fileDetails, { status: 200 });
    } catch (error) {
        return NextResponse.json(
            { error: error.message },
            { status: 500 }
        );
    }
}
