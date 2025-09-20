import { S3Client, PutObjectCommand, DeleteObjectCommand } from "@aws-sdk/client-s3";
import multiparty from 'multiparty';
import fs from 'fs';
import { Pool } from 'pg';

// Configuração do S3 Client para apontar para o Cloudflare R2
const s3Client = new S3Client({
    region: "auto",
    endpoint: `https://674bc78420777b3b523b6385634276c4.r2.cloudflarestorage.com`,
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

export default async function handler(req, res) {
    const dbClient = await pool.connect();
    try {
        if (req.method === 'POST') {
            // Lógica de Upload
            const form = new multiparty.Form();
            const { fields, files } = await new Promise((resolve, reject) => {
                form.parse(req, (err, fields, files) => {
                    if (err) reject(err);
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

            res.status(200).json(result.rows[0]);

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

            res.status(200).json(result.rows[0]);

        } else {
            res.setHeader('Allow', ['POST', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error('API /upload error:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    } finally {
        dbClient.release();
    }
}