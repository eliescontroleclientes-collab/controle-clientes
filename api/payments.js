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

        // 1. Busca o cliente e trava a linha para a transação
        const clientResult = await db.query('SELECT * FROM clients WHERE id = $1 FOR UPDATE', [clientId]);
        if (clientResult.rows.length === 0) {
            throw new Error('Cliente não encontrado.');
        }

        let client = clientResult.rows[0];
        let currentBalance = parseFloat(client.saldo) + paymentValue;
        let paymentDates = client.paymentDates || [];
        const installmentValue = parseFloat(client.dailyValue);

        // ######### INÍCIO DA NOVA LÓGICA HIERÁRQUICA E CONTEXTUAL #########

        // Helper function para quitar uma parcela e evitar repetição de código
        const payInstallment = (installment) => {
            // Garante que a parcela existe, não está paga e que há saldo suficiente
            if (installment && installment.status !== 'paid' && currentBalance >= installmentValue) {
                currentBalance -= installmentValue;
                installment.status = 'paid';
                installment.paidAt = new Date(paymentDate + 'T00:00:00.000Z').toISOString();
            }
        };

        // Define as datas de referência
        const referenceDateTime = new Date(paymentDate + 'T00:00:00.000Z').getTime();
        const timeZone = 'America/Cuiaba';
        const todayInCuiaba = new Date().toLocaleDateString('en-CA', { timeZone });

        // 1. Separa todas as parcelas pendentes em categorias baseadas na data de referência
        const allPendingInstallments = paymentDates.filter(p => p.status !== 'paid');

        const referenceInstallment = allPendingInstallments.find(p => new Date(p.date).getTime() === referenceDateTime);
        const pastDueInstallments = allPendingInstallments
            .filter(p => new Date(p.date).getTime() < referenceDateTime)
            .sort((a, b) => new Date(a.date) - new Date(b.date)); // Mais antigas primeiro

        const todayInstallment = allPendingInstallments.find(p => p.date.startsWith(todayInCuiaba) && new Date(p.date).getTime() !== referenceDateTime);

        const futureInstallments = allPendingInstallments
            .filter(p => ![referenceInstallment, ...pastDueInstallments, todayInstallment].includes(p))
            .sort((a, b) => new Date(a.date) - new Date(b.date)); // Mais próximas primeiro

        // 2. Aplica o pagamento seguindo a hierarquia definitiva

        // Prioridade 1: A parcela da data de referência
        payInstallment(referenceInstallment);

        // Prioridade 2: Todas as parcelas ANTERIORES à data de referência (da mais antiga para a mais nova)
        for (const payment of pastDueInstallments) {
            payInstallment(payment);
        }

        // Prioridade 3: A parcela do dia atual (se ainda não foi paga e sobrar saldo)
        payInstallment(todayInstallment);

        // Prioridade 4: Todas as parcelas futuras (da mais próxima para a mais distante)
        for (const payment of futureInstallments) {
            payInstallment(payment);
        }

        // ######### FIM DA NOVA LÓGICA #########

        // 3. Atualiza o cliente com o novo saldo e o status das parcelas
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