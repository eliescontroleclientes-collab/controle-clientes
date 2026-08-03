import { S3Client, PutObjectCommand, DeleteObjectCommand, GetObjectCommand } from "@aws-sdk/client-s3";
import multiparty from 'multiparty';
import fs from 'fs';
import { Pool } from 'pg';

// Configuração do S3 Client para apontar para o Cloudflare R2
const s3Client = new S3Client({
    region: "auto",
    endpoint: `https://${process.env.R2_ACCOUNT_ID}.r2.cloudflarestorage.com`,
    credentials: {
        accessKeyId: process.env.R2_ACCESS_KEY_ID,
        secretAccessKey: process.env.R2_SECRET_ACCESS_KEY,
    },
});

// Configuração do Banco de Dados
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

export const config = {
    api: {
        bodyParser: false, // Desativa o parser padrão para lidarmos com multipart/form-data
    },
};

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
    // --- BLOCO DE SEGURANÇA ---
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (token !== process.env.API_SECRET_TOKEN) {
        return res.status(401).json({ error: 'Acesso Negado.' });
    }
    // --------------------------

    const dbClient = await pool.connect();
    try {
        if (req.method === 'GET') {
            // Lógica de leitura segura do arquivo para copiar a imagem no navegador
            const clientId = Number.parseInt(req.query.clientId, 10);
            const fileKey = String(req.query.key || '').trim();

            if (!Number.isInteger(clientId) || !fileKey) {
                return res.status(400).json({ error: 'Cliente ou arquivo inválido.' });
            }

            const clientResult = await dbClient.query(
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

        } else if (req.method === 'POST') {
            // Lógica de Upload
            const form = new multiparty.Form();
            const { fields, files } = await new Promise((resolve, reject) => {
                form.parse(req, (err, fields, files) => {
                    if (err) return reject(err);
                    resolve({ fields, files });
                });
            });

            const clientId = fields.clientId[0];
            const file = files.file[0];
            const fileContent = fs.readFileSync(file.path);

            // Sanitiza o nome do arquivo para evitar problemas
            const originalFileName = file.originalFilename.replace(/[^a-zA-Z0-9._-]/g, '');
            const fileKey = `${clientId}/${Date.now()}-${originalFileName}`;

            // Envia o arquivo para o R2
            await s3Client.send(new PutObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME,
                Key: fileKey,
                Body: fileContent,
                ContentType: file.headers['content-type'],
            }));

            const fileUrl = `${process.env.R2_PUBLIC_URL}/${fileKey}`;
            const newFileData = { name: originalFileName, url: fileUrl, key: fileKey };

            // Atualiza o registro do cliente no banco de dados
            const updateQuery = `
                UPDATE clients 
                SET files = COALESCE(files, '[]'::jsonb) || $1::jsonb
                WHERE id = $2
                RETURNING *;
            `;
            const result = await dbClient.query(updateQuery, [JSON.stringify(newFileData), clientId]);

            return res.status(200).json(result.rows[0]);

        } else if (req.method === 'DELETE') {
            // Lógica de Exclusão
            const { clientId, fileName } = req.body;

            const clientResult = await dbClient.query('SELECT files FROM clients WHERE id = $1', [clientId]);
            const clientFiles = clientResult.rows[0]?.files || [];
            const fileToDelete = clientFiles.find(f => f.name === fileName);

            if (!fileToDelete) {
                return res.status(404).json({ error: "Arquivo não encontrado no registro do cliente." });
            }

            // Deleta o arquivo do R2
            await s3Client.send(new DeleteObjectCommand({
                Bucket: process.env.R2_BUCKET_NAME,
                Key: fileToDelete.key,
            }));

            // Remove o arquivo da lista no banco de dados
            const updatedFiles = clientFiles.filter(f => f.name !== fileName);
            const updateQuery = 'UPDATE clients SET files = $1 WHERE id = $2 RETURNING *;';
            const result = await dbClient.query(updateQuery, [JSON.stringify(updatedFiles), clientId]);

            return res.status(200).json(result.rows[0]);

        } else {
            res.setHeader('Allow', ['GET', 'POST', 'DELETE']);
            return res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error('API /upload error:', error);
        return res.status(500).json({ error: 'Erro interno do servidor.' });
    } finally {
        dbClient.release();
    }
}
