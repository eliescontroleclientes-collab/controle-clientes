import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        return res.status(405).end();
    }

    const { name, value } = req.body;
    if (!name || value === undefined) {
        return res.status(400).json({ error: 'Nome e valor da configuração são obrigatórios.' });
    }

    const db = await pool.connect();
    try {
        // Usa a sintaxe "UPSERT" para inserir ou atualizar a configuração
        const query = `
            INSERT INTO configurations (config_name, config_value) 
            VALUES ($1, $2)
            ON CONFLICT (config_name) 
            DO UPDATE SET config_value = EXCLUDED.config_value;
        `;
        await db.query(query, [name, value]);
        res.status(200).json({ success: true });
    } catch (error) {
        console.error('API /save-config error:', error);
        res.status(500).json({ error: 'Erro ao salvar configuração.' });
    } finally {
        db.release();
    }
}