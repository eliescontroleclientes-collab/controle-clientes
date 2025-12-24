// /api/financial-summary.js
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
    // --- BLOCO DE SEGURANÇA NOVO ---
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token !== process.env.API_SECRET_TOKEN) {
        return res.status(401).json({ error: 'Acesso Negado.' });
    }
    // ----------------------------------

    if (req.method !== 'GET') {
        return res.status(405).end();
    }

    const db = await pool.connect();
    try {
        const result = await db.query('SELECT "loanValue", "dailyValue", installments, "paymentDates" FROM clients');
        const clients = result.rows;

        let totalLoaned = 0;
        let totalOverduePrincipal = 0;
        let totalReceived = 0;
        let totalLateInstallments = 0;
        let totalInstallments = 0;
        // ### INÍCIO DA ADIÇÃO ###
        let totalPendingToReceive = 0; // Nova variável para a métrica
        // ### FIM DA ADIÇÃO ###

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
                // ### INÍCIO DA ADIÇÃO ###
                // Se a parcela não está paga e a data é hoje ou no futuro, entra no novo cálculo
                else if (installmentDate >= today) {
                    totalPendingToReceive += installmentValue;
                }
                // ### FIM DA ADIÇÃO ###
            });
        });

        const defaultRate = totalInstallments > 0 ? (totalLateInstallments / totalInstallments) * 100 : 0;

        res.status(200).json({
            totalLoaned,
            totalOverduePrincipal,
            totalReceived,
            totalPendingToReceive, // Adiciona o novo valor à resposta da API
            defaultRate
        });

    } catch (error) {
        console.error('API /financial-summary error:', error);
        res.status(500).json({ error: 'Erro ao calcular o resumo financeiro.' });
    } finally {
        db.release();
    }
}