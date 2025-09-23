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

        // Define "hoje" com base no fuso horário de Cuiabá
        const timeZone = 'America/Cuiaba';
        const todayInCuiaba = new Date().toLocaleDateString('en-CA', { timeZone }); // Formato YYYY-MM-DD
        const cuiabaTodayUTCMidnight = new Date(todayInCuiaba + 'T00:00:00.000Z');

        // 2. Separa as parcelas pendentes em categorias
        const todayInstallment = paymentDates.find(p => p.status !== 'paid' && p.date.startsWith(todayInCuiaba));
        const lateInstallments = paymentDates
            .filter(p => p.status !== 'paid' && new Date(p.date) < cuiabaTodayUTCMidnight)
            .sort((a, b) => new Date(a.date) - new Date(b.date)); // Mais antigas primeiro
        const futureInstallments = paymentDates
            .filter(p => p.status !== 'paid' && new Date(p.date) > cuiabaTodayUTCMidnight)
            .sort((a, b) => new Date(a.date) - new Date(b.date)); // Mais próximas primeiro

        // 3. Implementa a nova hierarquia de quitação

        // Prioridade 1: Pagar a parcela de hoje
        if (todayInstallment && currentBalance >= installmentValue) {
            currentBalance -= installmentValue;
            todayInstallment.status = 'paid';
            todayInstallment.paidAt = new Date(paymentDate).toISOString();
        }

        // Prioridade 2: Pagar as parcelas atrasadas (da mais antiga para a mais nova)
        for (const payment of lateInstallments) {
            if (currentBalance >= installmentValue) {
                currentBalance -= installmentValue;
                payment.status = 'paid';
                payment.paidAt = new Date(paymentDate).toISOString();
            } else {
                break; // Para se o saldo não for suficiente
            }
        }

        // Prioridade 3: Usar o saldo restante para pagar parcelas futuras (da mais próxima para a mais distante)
        for (const payment of futureInstallments) {
            if (currentBalance >= installmentValue) {
                currentBalance -= installmentValue;
                payment.status = 'paid';
                payment.paidAt = new Date(paymentDate).toISOString();
            } else {
                break;
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