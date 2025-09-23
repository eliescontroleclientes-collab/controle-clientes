import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const { clientId, paymentValue, paymentDate } = req.body;
    if (!clientId || !paymentValue || !paymentDate) {
        return res.status(400).json({ error: 'Dados do pagamento incompletos.' });
    }

    const db = await pool.connect();
    try {
        await db.query('BEGIN');

        // 1. Busca o cliente para garantir que ele existe e trava a linha para a transação
        const clientResult = await db.query('SELECT * FROM clients WHERE id = $1 FOR UPDATE', [clientId]);
        if (clientResult.rows.length === 0) {
            throw new Error('Cliente não encontrado.');
        }

        let client = clientResult.rows[0];
        let currentBalance = parseFloat(client.saldo) + paymentValue;
        let paymentDates = client.paymentDates || [];

        // 2. Ordena as parcelas para garantir que as mais antigas sejam pagas primeiro
        paymentDates.sort((a, b) => new Date(a.date) - new Date(b.date));

        // 3. Itera sobre as parcelas e tenta quitá-las com o saldo
        for (const payment of paymentDates) {
            if (payment.status !== 'paid') {
                const installmentValue = parseFloat(client.dailyValue);
                if (currentBalance >= installmentValue) {
                    currentBalance -= installmentValue;
                    payment.status = 'paid';
                    payment.paidAt = new Date(paymentDate).toISOString();
                } else {
                    // Para aqui se o saldo não for suficiente para a próxima parcela
                    break;
                }
            }
        }

        // 4. Atualiza o cliente com o novo saldo e o status das parcelas
        const updateQuery = 'UPDATE clients SET saldo = $1, "paymentDates" = $2 WHERE id = $3 RETURNING *';
        const updatedResult = await db.query(updateQuery, [currentBalance.toFixed(2), JSON.stringify(paymentDates), clientId]);

        await db.query('COMMIT');

        res.status(200).json(updatedResult.rows[0]);

    } catch (error) {
        await db.query('ROLLBACK');
        console.error('API /payments error:', error);
        res.status(500).json({ error: 'Erro interno do servidor ao processar pagamento.' });
    } finally {
        db.release();
    }
}