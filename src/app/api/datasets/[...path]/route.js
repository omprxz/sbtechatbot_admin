import path from 'path';
import fs from 'fs';

export async function GET(req, { params }) {
  const filePath = path.join(process.cwd(), 'uploads/datasets', ...await params.path);
  if (!fs.existsSync(filePath)) {
    return new Response('File not found', { status: 404 });
  }

  const file = fs.readFileSync(filePath);
  return new Response(file, {
    headers: { 'Content-Type': 'application/octet-stream' },
  });
}
