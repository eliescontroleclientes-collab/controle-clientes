// /api/client-data.js
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// ### INÍCIO DA ALTERAÇÃO: Nova função para calcular dias úteis ###
function calculateBusinessDays(startDate, endDate) {
    let count = 0;
    const curDate = new Date(startDate.getTime());
    while (curDate < endDate) {
        const dayOfWeek = curDate.getUTCDay(); // 0 = Domingo, 6 = Sábado
        if (dayOfWeek !== 0 && dayOfWeek !== 6) {
            count++;
        }
        curDate.setUTCDate(curDate.getUTCDate() + 1);
    }
    return count;
}
// ### FIM DA ALTERAÇÃO ###

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
        const clientResult = await db.query('SELECT * FROM clients WHERE id = $1', [clientId]);
        if (clientResult.rows.length === 0) {
            return res.status(404).json({ error: 'Cliente não encontrado.' });
        }
        const client = clientResult.rows[0];

        const interestRate = parseFloat(client.taxa_juros) || 0;
        const installmentValue = parseFloat(client.dailyValue);
        let totalInterest = 0;
        let totalPrincipalLate = 0;
        let lateInstallmentsCount = 0;
        let paidInstallmentsCount = 0;
        let pendingInstallmentsCount = 0;

        const timeZone = 'America/Cuiaba';
        const today = new Date(new Date().toLocaleString("en-US", { timeZone }));
        today.setHours(0, 0, 0, 0);

        (client.paymentDates || []).forEach(p => {
            if (p.status === 'paid') {
                paidInstallmentsCount++;
                return;
            }

            pendingInstallmentsCount++;
            const installmentDate = new Date(p.date);

            if (installmentDate < today) {
                lateInstallmentsCount++;
                totalPrincipalLate += installmentValue;

                // ### INÍCIO DA ALTERAÇÃO: Troca do cálculo de dias ###
                // Em vez de calcular a diferença direta, agora contamos apenas os dias úteis.
                const businessDaysLate = calculateBusinessDays(installmentDate, today);
                totalInterest += businessDaysLate * installmentValue * (interestRate / 100);
                // ### FIM DA ALTERAÇÃO ###
            }
        });

        let todayInstallmentStatus = 'Em Dia';
        const todayInstallment = (client.paymentDates || []).find(p => {
            const installmentDate = new Date(p.date);
            return installmentDate.getTime() === today.getTime();
        });

        if (todayInstallment && todayInstallment.status !== 'paid') {
            todayInstallmentStatus = 'Pendente';
        }

        let totalToPayNow = totalPrincipalLate + totalInterest;
        if (todayInstallmentStatus === 'Pendente') {
            totalToPayNow += installmentValue;
        }

        const totalInstallments = client.installments;

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