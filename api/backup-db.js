const { Pool } = require('pg');
// ######### INÍCIO DA CORREÇÃO DEFINITIVA #########
// 1. Importa o "envelope" da biblioteca.
const pgGod = require('pg-god');
// 2. Extrai a função 'dump' real da propriedade '.default'.
const dump = pgGod.default;
// ######### FIM DA CORREÇÃO DEFINITIVA #########

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

        // 3. Agora, a variável 'dump' contém a função correta e a chamada funcionará.
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