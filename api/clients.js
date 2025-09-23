const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

export default async function handler(req, res) {
    try {
        const db = await pool.connect();

        // Rota para buscar todos os clientes (GET)
        if (req.method === 'GET') {
            const result = await db.query('SELECT * FROM clients ORDER BY id ASC');
            res.status(200).json(result.rows);
        }
        // Rota para adicionar um novo cliente (POST)
        else if (req.method === 'POST') {
            const { id, name, startDate, cpf, phone, loanValue, dailyValue, paymentDates, installments, frequency, localizacao, bairro, profissao } = req.body;

            if (!id) {
                return res.status(400).json({ error: 'O ID do cliente é obrigatório.' });
            }

            const query = `
                INSERT INTO clients (id, name, "startDate", cpf, phone, "loanValue", "dailyValue", "paymentDates", installments, frequency, files, saldo, localizacao, bairro, profissao, observacoes) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9, $10, '[]'::jsonb, 0.00, $11, $12, $13, '') 
                RETURNING *
            `;
            const values = [id, name, startDate, cpf, phone, loanValue, dailyValue, JSON.stringify(paymentDates), installments, frequency, localizacao, bairro, profissao];
            const result = await db.query(query, values);
            res.status(201).json(result.rows[0]);
        }
        // Rota para atualizar um cliente (PUT) - ATUALIZADA
        else if (req.method === 'PUT') {
            const { id, name, startDate, cpf, phone, loanValue, dailyValue, paymentDates, installments, frequency, files, saldo, localizacao, bairro, profissao, observacoes } = req.body; // observacoes adicionado
            if (!id) return res.status(400).json({ error: 'Client ID is required' });

            const query = `
                UPDATE clients 
                SET name = $1, "startDate" = $2, cpf = $3, phone = $4, "loanValue" = $5, "dailyValue" = $6, "paymentDates" = $7, installments = $8, frequency = $9, files = $10, saldo = $11, localizacao = $12, bairro = $13, profissao = $14, observacoes = $15
                WHERE id = $16
                RETURNING *
            `;
            const values = [name, startDate, cpf, phone, loanValue, dailyValue, JSON.stringify(paymentDates), installments, frequency, JSON.stringify(files || []), saldo || 0.00, localizacao, bairro, profissao, observacoes, id]; // observacoes adicionado
            const result = await db.query(query, values);
            res.status(200).json(result.rows[0]);
        }
        // Rota para deletar um cliente (DELETE)
        else if (req.method === 'DELETE') {
            const { id } = req.query;
            if (!id) return res.status(400).json({ error: 'Client ID is required' });
            await db.query('DELETE FROM clients WHERE id = $1', [id]);
            res.status(204).send();
        }
        // Método não permitido
        else {
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }

        db.release();
    } catch (error) {
        console.error('API Error:', error);
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Este ID de cliente já está em uso.' });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
}