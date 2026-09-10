import { generateClientTokenFromReadWriteToken } from '@vercel/blob/client';

export default async function handler(request) {
  try {
    const body = await request.json();
    const payload = body && body.payload ? body.payload : {};
    const pathname = payload.pathname || 'file';

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

    return Response.json({ clientToken });
  } catch (error) {
    console.error('blob token error:', error);
    return Response.json(
      { error: error.message || 'Failed to generate token' },
      { status: 400 },
    );
  }
}