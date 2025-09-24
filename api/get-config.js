import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).end();
    }

    const { name } = req.query;
    if (!name) {
        return res.status(400).json({ error: 'Nome da configuração é obrigatório.' });
    }

    const db = await pool.connect();
    try {
        const result = await db.query('SELECT config_value FROM configurations WHERE config_name = $1', [name]);
        if (result.rows.length > 0) {
            res.status(200).json({ value: result.rows[0].config_value });
        } else {
            // É normal não encontrar na primeira vez, então retornamos um objeto vazio.
            res.status(200).json({ value: null });
        }
    } catch (error) {
        console.error('API /get-config error:', error);
        res.status(500).json({ error: 'Erro ao buscar configuração.' });
    } finally {
        db.release();
    }
}