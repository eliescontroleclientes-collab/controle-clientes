// ARQUIVO: api/settings.js
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
    // SEGURANÇA
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (token !== process.env.API_SECRET_TOKEN) {
        return res.status(401).json({ error: 'Acesso Negado.' });
    }

    const db = await pool.connect();
    const { type } = req.query; // Define se vamos mexer em 'config' ou 'responsibles'

    try {
        // ============================================================
        // TIPO 1: CONFIGURAÇÕES GERAIS (Chave Pix, etc)
        // ============================================================
        if (type === 'config') {

            // GET (Ler Configuração)
            if (req.method === 'GET') {
                const { name } = req.query;
                const result = await db.query('SELECT config_value FROM configurations WHERE config_name = $1', [name]);
                return res.status(200).json({ value: result.rows.length > 0 ? result.rows[0].config_value : null });
            }

            // POST (Salvar Configuração)
            if (req.method === 'POST') {
                const { name, value } = req.body;
                const query = `
                    INSERT INTO configurations (config_name, config_value) VALUES ($1, $2)
                    ON CONFLICT (config_name) DO UPDATE SET config_value = EXCLUDED.config_value;
                `;
                await db.query(query, [name, value]);
                return res.status(200).json({ success: true });
            }
        }

        // ============================================================
        // TIPO 2: GESTÃO DE RESPONSÁVEIS
        // ============================================================
        if (type === 'responsibles') {

            // GET (Listar)
            if (req.method === 'GET') {
                const result = await db.query('SELECT * FROM responsibles ORDER BY active DESC, name ASC');
                return res.status(200).json(result.rows);
            }

            // POST (Criar Novo)
            if (req.method === 'POST') {
                const { name } = req.body;
                if (!name) return res.status(400).json({ error: 'Nome obrigatório' });
                const result = await db.query('INSERT INTO responsibles (name, active) VALUES ($1, true) RETURNING *', [name]);
                return res.status(201).json(result.rows[0]);
            }

            // PUT (Ativar/Desativar)
            if (req.method === 'PUT') {
                const { id, active } = req.body;
                await db.query('UPDATE responsibles SET active = $1 WHERE id = $2', [active, id]);
                return res.status(200).json({ success: true });
            }

            // DELETE (Excluir)
            if (req.method === 'DELETE') {
                const { id } = req.query;
                await db.query('DELETE FROM responsibles WHERE id = $1', [id]);
                return res.status(200).json({ success: true });
            }
        }

        // Se não cair em nenhum if
        return res.status(400).json({ error: 'Tipo de requisição inválido.' });

    } catch (error) {
        console.error('API Settings Error:', error);
        res.status(500).json({ error: 'Erro interno.' });
    } finally {
        db.release();
    }
}