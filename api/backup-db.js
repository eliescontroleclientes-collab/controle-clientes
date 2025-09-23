import { spawn } from 'child_process';
import multiparty from 'multiparty';
import fs from 'fs';

export const config = {
    api: {
        bodyParser: false,
    },
};

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    try {
        const databaseUrl = process.env.DATABASE_URL;
        if (!databaseUrl) {
            throw new Error("DATABASE_URL não está configurada.");
        }

        const form = new multiparty.Form();
        const { files } = await new Promise((resolve, reject) => {
            form.parse(req, (err, fields, files) => {
                if (err) reject(err);
                resolve({ files });
            });
        });

        if (!files.backupFile || files.backupFile.length === 0) {
            return res.status(400).json({ error: "Nenhum arquivo de backup enviado." });
        }

        const backupFilePath = files.backupFile[0].path;

        const psql = spawn('psql', [databaseUrl]);

        const stream = fs.createReadStream(backupFilePath);
        stream.pipe(psql.stdin);

        let errorOutput = '';
        psql.stderr.on('data', (data) => {
            errorOutput += data.toString();
        });

        await new Promise((resolve, reject) => {
            psql.on('close', (code) => {
                fs.unlinkSync(backupFilePath); // Limpa o arquivo temporário
                if (code === 0) {
                    resolve();
                } else {
                    console.error(`psql stderr: ${errorOutput}`);
                    reject(new Error(`Processo de restauração falhou com código ${code}.`));
                }
            });
            psql.on('error', (err) => {
                fs.unlinkSync(backupFilePath);
                reject(err);
            });
        });

        res.status(200).json({ message: "Backup restaurado com sucesso!" });

    } catch (error) {
        console.error('API /restore-db error:', error);
        res.status(500).json({ error: 'Erro ao restaurar backup: ' + error.message });
    }
}