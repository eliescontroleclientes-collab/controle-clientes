import { S3Client, GetObjectCommand } from '@aws-sdk/client-s3';
import { Pool } from 'pg';

const s3Client = new S3Client({
    region: 'auto',
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

async function bodyToBuffer(body) {
    if (!body) {
        throw new Error('O arquivo retornou sem conteúdo.');
    }

    if (typeof body.transformToByteArray === 'function') {
        return Buffer.from(await body.transformToByteArray());
    }

    const chunks = [];
    for await (const chunk of body) {
        chunks.push(Buffer.isBuffer(chunk) ? chunk : Buffer.from(chunk));
    }

    return Buffer.concat(chunks);
}

export default async function handler(req, res) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token !== process.env.API_SECRET_TOKEN) {
        return res.status(401).json({ error: 'Acesso Negado.' });
    }

    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const clientId = Number.parseInt(req.query.clientId, 10);
    const fileKey = String(req.query.key || '').trim();

    if (!Number.isInteger(clientId) || !fileKey) {
        return res.status(400).json({ error: 'Cliente ou arquivo inválido.' });
    }

    const db = await pool.connect();

    try {
        const clientResult = await db.query(
            'SELECT files FROM clients WHERE id = $1',
            [clientId]
        );

        if (clientResult.rows.length === 0) {
            return res.status(404).json({ error: 'Cliente não encontrado.' });
        }

        const clientFiles = Array.isArray(clientResult.rows[0].files)
            ? clientResult.rows[0].files
            : [];

        const registeredFile = clientFiles.find(file => file?.key === fileKey);

        if (!registeredFile) {
            return res.status(404).json({
                error: 'Este arquivo não está vinculado ao cliente informado.'
            });
        }

        const object = await s3Client.send(new GetObjectCommand({
            Bucket: process.env.R2_BUCKET_NAME,
            Key: fileKey,
        }));

        const fileBuffer = await bodyToBuffer(object.Body);
        const contentType = object.ContentType || 'application/octet-stream';

        res.setHeader('Content-Type', contentType);
        res.setHeader('Content-Length', String(fileBuffer.length));
        res.setHeader('Content-Disposition', 'inline');
        res.setHeader('Cache-Control', 'private, max-age=300');

        return res.status(200).send(fileBuffer);
    } catch (error) {
        console.error('API /file-content error:', error);
        return res.status(500).json({ error: 'Não foi possível carregar o arquivo.' });
    } finally {
        db.release();
    }
}
