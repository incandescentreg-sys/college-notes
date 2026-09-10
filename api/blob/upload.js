import { generateClientTokenFromReadWriteToken } from '@vercel/blob/client';

export const config = { runtime: 'nodejs' };

export default async function handler(request) {
  const start = process.hrtime.bigint();
  try {
    const body = await request.json();
    const payload = body && body.payload ? body.payload : {};
    const pathname = payload.pathname || 'file';

    if (!process.env.BLOB_READ_WRITE_TOKEN) {
      return Response.json(
        { error: 'BLOB_READ_WRITE_TOKEN is not set. Create a Blob Store in Vercel Storage.' },
        { status: 500 },
      );
    }

    const clientToken = await generateClientTokenFromReadWriteToken({
      pathname,
      allowedContentTypes: [
        'application/pdf',
        'image/png',
        'image/jpeg',
        'image/gif',
        'image/webp',
        'image/svg+xml',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/plain',
        'text/markdown',
        'text/csv',
        'application/json',
        'application/zip',
        'application/x-zip-compressed',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
      maximumSizeInBytes: 50 * 1024 * 1024,
      addRandomSuffix: true,
      validUntil: Date.now() + 60 * 60 * 1000,
    });

    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    console.log(`blob token OK in ${ms.toFixed(0)}ms for ${pathname}`);

    return Response.json({ clientToken });
  } catch (error) {
    const ms = Number(process.hrtime.bigint() - start) / 1e6;
    console.error(`blob token error after ${ms.toFixed(0)}ms:`, error);
    return Response.json(
      { error: error.message || 'Failed to generate token' },
      { status: 400 },
    );
  }
}