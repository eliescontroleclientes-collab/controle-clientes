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

        // ######### INÍCIO DA NOVA LÓGICA UNIFICADA #########

        // Ordena TODAS as parcelas por data, da mais antiga para a mais nova.
        paymentDates.sort((a, b) => new Date(a.date) - new Date(b.date));

        // Encontra o índice da primeira parcela pendente que vence NA DATA do pagamento ou DEPOIS.
        // Isso define nosso ponto de partida para a reconciliação.
        const startIndex = paymentDates.findIndex(p => p.status !== 'paid' && new Date(p.date) >= new Date(paymentDate + 'T00:00:00.000Z'));

        // Se encontrarmos um ponto de partida, criamos uma lista de parcelas a serem processadas a partir dali.
        // Se não (ex: todas as parcelas já venceram), processamos todas as pendentes.
        const installmentsToProcess = startIndex !== -1
            ? paymentDates.slice(startIndex)
            : paymentDates.filter(p => p.status !== 'paid');

        // Itera sobre a lista de parcelas a serem quitadas e aplica o saldo
        for (const payment of installmentsToProcess) {
            if (currentBalance >= installmentValue) {
                currentBalance -= installmentValue;
                payment.status = 'paid';
                // A data do pagamento é a data que o usuário informou no modal
                payment.paidAt = new Date(paymentDate + 'T00:00:00.000Z').toISOString();
            } else {
                // Para o loop se o saldo não for suficiente para a próxima parcela
                break;
            }
        }
        // ######### FIM DA NOVA LÓGICA UNIFICADA #########

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