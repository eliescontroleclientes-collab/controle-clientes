const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: {
        rejectUnauthorized: false
    }
});

export default async function handler(req, res) {
    const dbClient = await pool.connect();
    try {
        if (req.method === 'GET') {
            const result = await dbClient.query('SELECT * FROM clients ORDER BY id DESC');
            res.status(200).json(result.rows);
        }
        else if (req.method === 'POST') {
            // ATUALIZADO: para incluir installments e frequency
            const { name, startDate, cpf, phone, loanValue, installmentValue, paymentDates, installments, frequency } = req.body;
            const query = `
                INSERT INTO clients (name, "startDate", cpf, phone, "loanValue", "installmentValue", "paymentDates", installments, frequency) 
                VALUES ($1, $2, $3, $4, $5, $6, $7, $8, $9) 
                RETURNING *
            `;
            const values = [name, startDate, cpf, phone, loanValue, installmentValue, JSON.stringify(paymentDates), installments, frequency];
            const result = await dbClient.query(query, values);
            res.status(201).json(result.rows[0]);
        }
        else if (req.method === 'PUT') {
            // ATUALIZADO: para incluir os novos campos, caso sejam enviados
            const { id, name, startDate, cpf, phone, loanValue, installmentValue, paymentDates, installments, frequency, files } = req.body;
            if (!id) return res.status(400).json({ error: 'Client ID is required' });

            const query = `
                UPDATE clients 
                SET name = $1, "startDate" = $2, cpf = $3, phone = $4, "loanValue" = $5, 
                    "installmentValue" = $6, "paymentDates" = $7, installments = $8, frequency = $9, files = $10
                WHERE id = $11
                RETURNING *
            `;
            const values = [name, startDate, cpf, phone, loanValue, installmentValue, JSON.stringify(paymentDates), installments, frequency, JSON.stringify(files), id];
            const result = await dbClient.query(query, values);
            res.status(200).json(result.rows[0]);
        }
        else if (req.method === 'DELETE') {
            const { id } = req.query;
            if (!id) return res.status(400).json({ error: 'Client ID is required' });
            await dbClient.query('DELETE FROM clients WHERE id = $1', [id]);
            res.status(204).send();
        }
        else {
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }
    } catch (error) {
        console.error('API Error:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    } finally {
        dbClient.release();
    }
}