import crypto from 'crypto';

export default async function handler(req, res) {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST,OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  if (req.method === 'OPTIONS') return res.status(200).end();
  if (req.method !== 'POST') return res.status(405).json({ error: 'Method not allowed' });

  try {
    let bodyStr = '';
    for await (const chunk of req) bodyStr += chunk;
    const body = JSON.parse(bodyStr);
    const pathname = (body.payload && body.payload.pathname) || 'file';

    const rw = process.env.BLOB_READ_WRITE_TOKEN;
    if (!rw) return res.status(500).json({ error: 'BLOB_READ_WRITE_TOKEN is not set' });

    const parts = rw.split('_');
    const storeId = parts[3] || '';
    if (!storeId) return res.status(500).json({ error: 'Could not parse store id from token' });

    const payloadObj = {
      pathname,
      allowedContentTypes: [
        'application/pdf',
        'image/png', 'image/jpeg', 'image/gif', 'image/webp', 'image/svg+xml',
        'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
        'application/vnd.ms-excel',
        'text/plain', 'text/markdown', 'text/csv', 'application/json',
        'application/zip', 'application/x-zip-compressed',
        'application/msword',
        'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
      ],
      maximumSizeInBytes: 50 * 1024 * 1024,
      addRandomSuffix: true,
      validUntil: Date.now() + 60 * 60 * 1000,
    };

    const payload = Buffer.from(JSON.stringify(payloadObj)).toString('base64');
    const sig = crypto.createHmac('sha256', rw).update(payload).digest('hex');
    const clientToken = `vercel_blob_client_${storeId}_${Buffer.from(sig + '.' + payload).toString('base64')}`;

    return res.status(200).json({ clientToken });
  } catch (error) {
    console.error('blob token error:', error);
    return res.status(400).json({ error: error.message || 'Failed to generate token' });
  }
}