// ARQUIVO: /api/financial-summary.js
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
    // --- SEGURANÇA ---
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token !== process.env.API_SECRET_TOKEN) {
        return res.status(401).json({ error: 'Acesso Negado.' });
    }
    // -----------------

    if (req.method !== 'GET') {
        return res.status(405).end();
    }

    const db = await pool.connect();

    try {
        const { startDate, endDate } = req.query;

        // ============================================================
        // MODO 1: RELATÓRIO POR DATA (Se enviou startDate e endDate)
        // ============================================================
        if (startDate && endDate) {
            // Converter para objetos Date (Zerando horas)
            const start = new Date(startDate + 'T00:00:00Z');
            const end = new Date(endDate + 'T23:59:59Z');

            // Busca clientes e extrai apenas as datas de pagamento
            const result = await db.query('SELECT "paymentDates" FROM clients');
            const clients = result.rows;

            let totalRevenue = 0;
            let paymentsCount = 0;

            clients.forEach(client => {
                const paymentDates = client.paymentDates || [];
                paymentDates.forEach(installment => {
                    // Verifica se existe o histórico de pagamentos dentro da parcela
                    if (installment.payments && Array.isArray(installment.payments)) {
                        installment.payments.forEach(paymentItem => {
                            const payDate = new Date(paymentItem.registeredDate);
                            // Filtra pela data
                            if (payDate >= start && payDate <= end) {
                                totalRevenue += parseFloat(paymentItem.paidValue || 0);
                                paymentsCount++;
                            }
                        });
                    }
                });
            });

            return res.status(200).json({
                totalRevenue,
                paymentsCount,
                period: { start: startDate, end: endDate }
            });
        }

        // ============================================================
        // MODO 2: RESUMO GERAL (Padrão - Sem datas)
        // ============================================================
        const result = await db.query('SELECT "loanValue", "dailyValue", installments, "paymentDates" FROM clients');
        const clients = result.rows;

        let totalLoaned = 0;
        let totalOverduePrincipal = 0;
        let totalReceived = 0;
        let totalLateInstallments = 0;
        let totalInstallments = 0;
        let totalPendingToReceive = 0;

        const timeZone = 'America/Cuiaba';
        const today = new Date(new Date().toLocaleString("en-US", { timeZone }));
        today.setHours(0, 0, 0, 0);

        clients.forEach(client => {
            const loanValue = parseFloat(client.loanValue) || 0;
            const installmentValue = parseFloat(client.dailyValue) || 0;
            const paymentDates = client.paymentDates || [];

            totalLoaned += loanValue;
            totalInstallments += client.installments || 0;

            paymentDates.forEach(p => {
                const installmentDate = new Date(p.date);

                if (p.status === 'paid') {
                    totalReceived += installmentValue;
                }
                else if (installmentDate < today) {
                    totalOverduePrincipal += installmentValue;
                    totalLateInstallments++;
                }
                else if (installmentDate >= today) {
                    totalPendingToReceive += installmentValue;
                }
            });
        });

        const defaultRate = totalInstallments > 0 ? (totalLateInstallments / totalInstallments) * 100 : 0;

        return res.status(200).json({
            totalLoaned,
            totalOverduePrincipal,
            totalReceived,
            totalPendingToReceive,
            defaultRate
        });

    } catch (error) {
        console.error('API /financial-summary error:', error);
        res.status(500).json({ error: 'Erro ao calcular dados.' });
    } finally {
        db.release();
    }
}