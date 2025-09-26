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

        // ######### INÍCIO DA LÓGICA CORRIGIDA #########

        // Helper para quitar uma parcela. Continua igual.
        const payInstallment = (installment) => {
            if (installment && installment.status !== 'paid' && currentBalance >= installmentValue) {
                currentBalance -= installmentValue;
                installment.status = 'paid';
                installment.paidAt = new Date(paymentDate + 'T00:00:00.000Z').toISOString();
                return true; // Retorna true se a parcela foi paga
            }
            return false; // Retorna false se não foi paga
        };

        const referenceDateTime = new Date(paymentDate + 'T00:00:00.000Z').getTime();

        // 1. Tenta pagar a parcela da data de referência primeiro, se ela existir e estiver pendente.
        const referenceInstallment = paymentDates.find(p => new Date(p.date).getTime() === referenceDateTime);
        payInstallment(referenceInstallment);

        // 2. Cria UMA ÚNICA LISTA com TODAS as outras parcelas pendentes.
        //    Isso remove a separação complexa e fonte do bug entre passado, hoje e futuro.
        let remainingPendingInstallments = paymentDates
            .filter(p => p.status !== 'paid')
            .sort((a, b) => new Date(a.date) - new Date(b.date)); // Ordena da mais antiga para a mais nova.

        // 3. Itera sobre a fila ordenada, pagando uma por uma até o saldo acabar.
        //    Esta é a correção principal: ele sempre pagará a próxima parcela cronológica disponível.
        for (const payment of remainingPendingInstallments) {
            if (currentBalance < installmentValue) {
                break; // Para o loop se não houver mais saldo para a próxima parcela.
            }
            payInstallment(payment);
        }

        // ######### FIM DA LÓGICA CORRIGIDA #########

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