import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
    if (req.method !== 'POST' && req.method !== 'DELETE') {
        res.setHeader('Allow', ['POST', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    }

    const db = await pool.connect();
    try {
        await db.query('BEGIN');

        if (req.method === 'POST') {
            const { clientId, paymentValue, paymentDate } = req.body;
            if (!clientId || !paymentValue || !paymentDate) {
                return res.status(400).json({ error: 'Dados do pagamento incompletos.' });
            }

            const clientResult = await db.query('SELECT * FROM clients WHERE id = $1 FOR UPDATE', [clientId]);
            if (clientResult.rows.length === 0) throw new Error('Cliente não encontrado.');

            let client = clientResult.rows[0];
            let currentBalance = parseFloat(client.saldo) + paymentValue;
            let paymentDates = client.paymentDates || [];
            const installmentValue = parseFloat(client.dailyValue);

            // Helper que agora adiciona um pagamento à lista de uma parcela
            const payInstallment = (installment, valueToPay) => {
                // Garante que a lista de pagamentos exista
                if (!installment.payments) {
                    installment.payments = [];
                }
                // Adiciona o novo registro de pagamento
                installment.payments.push({
                    paidAt: new Date().toISOString(), // Usamos a data/hora atual como ID único
                    paidValue: valueToPay,
                    registeredDate: new Date(paymentDate + 'T00:00:00.000Z').toISOString()
                });
                // Atualiza o status geral da parcela
                installment.status = 'paid';
            };

            // Loop para consumir o saldo recebido
            while (currentBalance >= installmentValue) {
                // Encontra a próxima parcela pendente, começando pela mais antiga
                const nextInstallmentToPay = paymentDates
                    .filter(p => p.status !== 'paid')
                    .sort((a, b) => new Date(a.date) - new Date(b.date))[0];

                // Se não houver mais parcelas pendentes, para o loop
                if (!nextInstallmentToPay) {
                    break;
                }

                // Quita a parcela e deduz do saldo
                payInstallment(nextInstallmentToPay, installmentValue);
                currentBalance -= installmentValue;
            }

            const updateQuery = 'UPDATE clients SET saldo = $1, "paymentDates" = $2 WHERE id = $3 RETURNING *';
            const updatedResult = await db.query(updateQuery, [currentBalance.toFixed(2), JSON.stringify(paymentDates), clientId]);

            await db.query('COMMIT');
            return res.status(200).json(updatedResult.rows[0]);

        } else if (req.method === 'DELETE') {
            const { clientId, paymentDate, paidAt } = req.body; // Agora recebemos o 'paidAt' para identificar o pagamento
            if (!clientId || !paymentDate || !paidAt) {
                return res.status(400).json({ error: 'Dados para exclusão incompletos.' });
            }

            const clientResult = await db.query('SELECT * FROM clients WHERE id = $1 FOR UPDATE', [clientId]);
            if (clientResult.rows.length === 0) throw new Error('Cliente não encontrado.');

            let client = clientResult.rows[0];
            let paymentDates = client.paymentDates || [];

            const installmentToRevert = paymentDates.find(p => p.date === paymentDate);

            if (!installmentToRevert || !installmentToRevert.payments || installmentToRevert.payments.length === 0) {
                throw new Error('Nenhum pagamento encontrado para esta data.');
            }

            // Filtra a lista de pagamentos, removendo o que corresponde ao 'paidAt'
            installmentToRevert.payments = installmentToRevert.payments.filter(p => p.paidAt !== paidAt);

            // Se a lista de pagamentos ficar vazia, a parcela volta a ser pendente
            if (installmentToRevert.payments.length === 0) {
                installmentToRevert.status = 'pending';
                delete installmentToRevert.payments; // Remove o campo para limpar a estrutura
            }

            // O saldo do cliente NÃO é alterado, conforme solicitado

            const updateQuery = 'UPDATE clients SET "paymentDates" = $1 WHERE id = $2 RETURNING *';
            const updatedResult = await db.query(updateQuery, [JSON.stringify(paymentDates), clientId]);

            await db.query('COMMIT');
            return res.status(200).json(updatedResult.rows[0]);
        }
    } catch (error) {
        await db.query('ROLLBACK');
        console.error('API /payments error:', error);
        res.status(500).json({ error: 'Erro interno do servidor ao processar pagamento.' });
    } finally {
        db.release();
    }
}