// --- START OF FILE backup-db.js ---

const { Pool } = require('pg');

// ######### INÍCIO DA CORREÇÃO ROBUSTA #########
// 1. Importa o módulo. O resultado pode ser a própria função ou um objeto.
const pgGod = require('pg-god');
// 2. Extrai a função 'dump' de forma segura, cobrindo ambos os cenários (ESM e CJS).
const dump = pgGod.default || pgGod;
// ######### FIM DA CORREÇÃO ROBUSTA #########

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    // Adiciona um log para depuração, para ter certeza que 'dump' é uma função
    if (typeof dump !== 'function') {
        console.error('Falha crítica: pg-god não foi importado como uma função.', { importedModule: pgGod });
        return res.status(500).send('Erro de configuração interna do servidor ao carregar a dependência de backup.');
    }

    const db = await pool.connect();
    try {
        res.setHeader('Content-Type', 'application/sql');
        res.setHeader('Content-Disposition', `attachment; filename="backup_clientes_${new Date().toISOString().split('T')[0]}.sql"`);

        const dumpStream = await dump(db);

        // Direciona o fluxo de dados do backup diretamente para a resposta da API
        dumpStream.pipe(res);

        // Tratamento de erros durante o streaming
        dumpStream.on('error', (err) => {
            console.error('Erro durante o stream do backup:', err);
            if (!res.headersSent) {
                res.status(500).send('Erro ao gerar backup.');
            }
            res.end();
        });

    } catch (error) {
        console.error('API /backup-db error:', error);
        if (!res.headersSent) {
            res.status(500).json({ error: 'Erro interno do servidor.' });
        }
    } finally {
        res.on('finish', () => {
            db.release();
        });
    }
};