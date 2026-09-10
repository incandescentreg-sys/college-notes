export const config = { runtime: 'nodejs' };

export default async function handler(request) {
  try {
    const body = await request.json();
    const pathname = (body && body.payload && body.payload.pathname) || 'file';

    const rw = process.env.BLOB_READ_WRITE_TOKEN;
    if (!rw) {
      return Response.json({ error: 'BLOB_READ_WRITE_TOKEN is not set' }, { status: 500 });
    }

    const parts = rw.split('_');
    const storeId = parts[3] || '';
    if (!storeId) {
      return Response.json({ error: 'Could not parse store id from token' }, { status: 500 });
    }

    const payloadObj = {
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
    };

    const payload = btoa(JSON.stringify(payloadObj));

    const key = await crypto.subtle.importKey(
      'raw',
      new TextEncoder().encode(rw),
      { name: 'HMAC', hash: 'SHA-256' },
      false,
      ['sign'],
    );
    const sig = await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(payload));
    const securedKey = Array.from(new Uint8Array(sig))
      .map((b) => b.toString(16).padStart(2, '0'))
      .join('');

    const clientToken = `vercel_blob_client_${storeId}_${btoa(securedKey + '.' + payload)}`;

    return Response.json({ clientToken, storeId });
  } catch (error) {
    console.error('blob token error:', error);
    return Response.json(
      { error: error.message || 'Failed to generate token' },
      { status: 400 },
    );
  }
}