import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
    // ### INÍCIO DA MODIFICAÇÃO: Permitir o método DELETE ###
    if (req.method !== 'POST' && req.method !== 'DELETE') {
        res.setHeader('Allow', ['POST', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }
    // ### FIM DA MODIFICAÇÃO ###

    const db = await pool.connect();
    try {
        // ### INÍCIO DA MODIFICAÇÃO: Lógica separada para POST e DELETE ###
        if (req.method === 'POST') {
            const { clientId, paymentValue, paymentDate } = req.body;
            if (!clientId || !paymentValue || !paymentDate) {
                return res.status(400).json({ error: 'Dados do pagamento incompletos.' });
            }

            await db.query('BEGIN');

            const clientResult = await db.query('SELECT * FROM clients WHERE id = $1 FOR UPDATE', [clientId]);
            if (clientResult.rows.length === 0) throw new Error('Cliente não encontrado.');

            let client = clientResult.rows[0];
            let currentBalance = parseFloat(client.saldo) + paymentValue;
            let paymentDates = client.paymentDates || [];
            const installmentValue = parseFloat(client.dailyValue);

            const payInstallment = (installment) => {
                if (installment && installment.status !== 'paid' && currentBalance >= installmentValue) {
                    currentBalance -= installmentValue;
                    installment.status = 'paid';
                    installment.paidAt = new Date(paymentDate + 'T00:00:00.000Z').toISOString();
                    return true;
                }
                return false;
            };

            const referenceDateTime = new Date(paymentDate + 'T00:00:00.000Z').getTime();
            const referenceInstallment = paymentDates.find(p => new Date(p.date).getTime() === referenceDateTime);
            payInstallment(referenceInstallment);

            let remainingPendingInstallments = paymentDates
                .filter(p => p.status !== 'paid')
                .sort((a, b) => new Date(a.date) - new Date(b.date));

            for (const payment of remainingPendingInstallments) {
                if (currentBalance < installmentValue) break;
                payInstallment(payment);
            }

            const updateQuery = 'UPDATE clients SET saldo = $1, "paymentDates" = $2 WHERE id = $3 RETURNING *';
            const updatedResult = await db.query(updateQuery, [currentBalance.toFixed(2), JSON.stringify(paymentDates), clientId]);

            await db.query('COMMIT');
            res.status(200).json(updatedResult.rows[0]);

        } else if (req.method === 'DELETE') {
            // ### INÍCIO DA ADIÇÃO: Lógica para excluir um pagamento ###
            const { clientId, paymentDate } = req.body;
            if (!clientId || !paymentDate) {
                return res.status(400).json({ error: 'ID do cliente e data da parcela são obrigatórios.' });
            }

            await db.query('BEGIN');

            const clientResult = await db.query('SELECT * FROM clients WHERE id = $1 FOR UPDATE', [clientId]);
            if (clientResult.rows.length === 0) throw new Error('Cliente não encontrado.');

            let client = clientResult.rows[0];
            let currentBalance = parseFloat(client.saldo);
            let paymentDates = client.paymentDates || [];
            const installmentValue = parseFloat(client.dailyValue);

            const installmentToRevert = paymentDates.find(p => p.date === paymentDate);

            if (!installmentToRevert || installmentToRevert.status !== 'paid') {
                throw new Error('Parcela não encontrada ou não está paga.');
            }

            // Reverte o status da parcela e remove a data de pagamento
            installmentToRevert.status = 'pending';
            delete installmentToRevert.paidAt;

            // Devolve o valor da parcela para o saldo do cliente
            currentBalance += installmentValue;

            // Atualiza o banco de dados
            const updateQuery = 'UPDATE clients SET saldo = $1, "paymentDates" = $2 WHERE id = $3 RETURNING *';
            const updatedResult = await db.query(updateQuery, [currentBalance.toFixed(2), JSON.stringify(paymentDates), clientId]);

            await db.query('COMMIT');
            res.status(200).json(updatedResult.rows[0]);
            // ### FIM DA ADIÇÃO ###
        }
        // ### FIM DA MODIFICAÇÃO ###
    } catch (error) {
        await db.query('ROLLBACK');
        console.error('API /payments error:', error);
        res.status(500).json({ error: 'Erro interno do servidor ao processar pagamento.' });
    } finally {
        db.release();
    }
}