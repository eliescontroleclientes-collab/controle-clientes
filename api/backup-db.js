// --- START OF FILE backup-db.js ---

const { Pool } = require('pg');
// A forma correta de importar o 'pg-god' é diretamente para a variável,
// pois a biblioteca exporta a função 'dump' como seu módulo principal.
const dump = require('pg-god');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

module.exports = async (req, res) => {
    if (req.method !== 'GET') {
        res.setHeader('Allow', ['GET']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const db = await pool.connect();
    try {
        res.setHeader('Content-Type', 'application/sql');
        res.setHeader('Content-Disposition', `attachment; filename="backup_clientes_${new Date().toISOString().split('T')[0]}.sql"`);

        // Agora, a variável 'dump' contém a função correta e a chamada funcionará.
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
        // A resposta do stream cuidará de liberar o cliente
        res.on('finish', () => {
            db.release();
        });
    }
};