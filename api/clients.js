const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

// Esta função lida com todas as requisições para /api/clients
export default async function handler(req, res) {
    try {
        const client = await pool.connect();

        // Rota para buscar todos os clientes (GET)
        if (req.method === 'GET') {
            const result = await client.query('SELECT * FROM clients ORDER BY id DESC');
            res.status(200).json(result.rows);
        }
        // Rota para adicionar um novo cliente (POST)
        else if (req.method === 'POST') {
            const { name, startDate, cpf, phone, loanValue, dailyValue, paymentDates } = req.body;
            const query = `
        INSERT INTO clients (name, "startDate", cpf, phone, "loanValue", "dailyValue", "paymentDates") 
        VALUES ($1, $2, $3, $4, $5, $6, $7) 
        RETURNING *
      `;
            const values = [name, startDate, cpf, phone, loanValue, dailyValue, JSON.stringify(paymentDates)];
            const result = await client.query(query, values);
            res.status(201).json(result.rows[0]);
        }
        // Rota para atualizar um cliente (PUT)
        else if (req.method === 'PUT') {
            const { id, name, startDate, cpf, phone, loanValue, dailyValue, paymentDates } = req.body;
            if (!id) return res.status(400).json({ error: 'Client ID is required' });

            const query = `
            UPDATE clients 
            SET name = $1, "startDate" = $2, cpf = $3, phone = $4, "loanValue" = $5, "dailyValue" = $6, "paymentDates" = $7
            WHERE id = $8
            RETURNING *
        `;
            const values = [name, startDate, cpf, phone, loanValue, dailyValue, JSON.stringify(paymentDates), id];
            const result = await client.query(query, values);
            res.status(200).json(result.rows[0]);
        }
        // Rota para deletar um cliente (DELETE)
        else if (req.method === 'DELETE') {
            const { id } = req.query; // Pega o id da URL, ex: /api/clients?id=123
            if (!id) return res.status(400).json({ error: 'Client ID is required' });

            await client.query('DELETE FROM clients WHERE id = $1', [id]);
            res.status(204).send(); // 204 No Content
        }
        // Método não permitido
        else {
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }

        client.release();
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}