// /api/client-data.js
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).end();
    }

    const { clientId } = req.query;
    if (!clientId) {
        return res.status(400).json({ error: 'ID do cliente é obrigatório.' });
    }

    const db = await pool.connect();
    try {
        // 1. Buscar a taxa de juros da configuração
        const configResult = await db.query("SELECT config_value FROM configurations WHERE config_name = 'juros_cliente'");
        const interestRate = parseFloat(configResult.rows[0]?.config_value) || 0; // Padrão 0 se não configurado

        // 2. Buscar os dados do cliente
        const clientResult = await db.query('SELECT * FROM clients WHERE id = $1', [clientId]);
        if (clientResult.rows.length === 0) {
            return res.status(404).json({ error: 'Cliente não encontrado.' });
        }
        const client = clientResult.rows[0];

        // 3. Calcular Juros e totais
        const installmentValue = parseFloat(client.dailyValue);
        let totalInterest = 0;
        let totalPrincipalLate = 0;
        let lateInstallmentsCount = 0;
        let paidInstallmentsCount = 0;
        let pendingInstallmentsCount = 0;

        const timeZone = 'America/Cuiaba';
        const today = new Date(new Date().toLocaleString("en-US", { timeZone }));
        today.setHours(0, 0, 0, 0); // Zera a hora para comparar apenas a data

        client.paymentDates.forEach(p => {
            if (p.status === 'paid') {
                paidInstallmentsCount++;
                return;
            }

            pendingInstallmentsCount++;
            const installmentDate = new Date(p.date);

            if (installmentDate < today) {
                lateInstallmentsCount++;
                totalPrincipalLate += installmentValue;

                // Calcula a diferença de dias (incluindo fins de semana)
                const diffTime = Math.abs(today - installmentDate);
                const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));

                // Calcula o juro para esta parcela e adiciona ao total
                totalInterest += diffDays * installmentValue * (interestRate / 100);
            }
        });

        // ### INÍCIO DA ADIÇÃO DA LÓGICA ###
        let todayInstallmentStatus = 'Em Dia'; // Padrão
        const todayInstallment = client.paymentDates.find(p => {
            const installmentDate = new Date(p.date);
            return installmentDate.getTime() === today.getTime();
        });

        if (todayInstallment && todayInstallment.status !== 'paid') {
            todayInstallmentStatus = 'Pendente';
        }
        // ### FIM DA ADIÇÃO DA LÓGICA ###

        const totalToPayNow = totalPrincipalLate + totalInterest;
        const totalInstallments = client.installments;

        // 4. Montar o objeto de resposta
        const responseData = {
            clientName: client.name,
            loanValue: client.loanValue,
            installmentValue: client.dailyValue,
            paymentDates: client.paymentDates,
            paidInstallments: paidInstallmentsCount,
            pendingInstallments: pendingInstallmentsCount,
            totalInstallments: totalInstallments,
            lateInstallments: lateInstallmentsCount,
            totalInterest: totalInterest,
            totalToPayNow: totalToPayNow,
            todayInstallmentStatus: todayInstallmentStatus
        };

        res.status(200).json(responseData);

    } catch (error) {
        console.error('API /client-data error:', error);
        res.status(500).json({ error: 'Erro ao buscar dados do cliente.' });
    } finally {
        db.release();
    }
}