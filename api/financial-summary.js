// /api/financial-summary.js
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
    if (req.method !== 'GET') {
        return res.status(405).end();
    }

    const db = await pool.connect();
    try {
        // Busca todos os clientes de uma vez para os cálculos.
        // Para sistemas muito grandes, otimizações seriam necessárias, mas para centenas de clientes isso é eficiente.
        const result = await db.query('SELECT "loanValue", "dailyValue", installments, "paymentDates" FROM clients');
        const clients = result.rows;

        let totalLoaned = 0;
        let totalOverduePrincipal = 0;
        let totalReceived = 0;
        let totalLateInstallments = 0;
        let totalInstallments = 0;

        const timeZone = 'America/Cuiaba';
        const today = new Date(new Date().toLocaleString("en-US", { timeZone }));
        today.setHours(0, 0, 0, 0);

        clients.forEach(client => {
            const loanValue = parseFloat(client.loanValue) || 0;
            const installmentValue = parseFloat(client.dailyValue) || 0;
            const paymentDates = client.paymentDates || [];

            // 1. Calcula o Total Emprestado
            totalLoaned += loanValue;

            // 2. Calcula o Total de Parcelas do Sistema
            totalInstallments += client.installments || 0;

            paymentDates.forEach(p => {
                const installmentDate = new Date(p.date);

                // 3. Calcula o Total Recebido (soma de todas as parcelas pagas)
                if (p.status === 'paid') {
                    totalReceived += installmentValue;
                }
                // 4. Calcula o Total em Atraso (soma das parcelas vencidas e não pagas)
                else if (installmentDate < today) {
                    totalOverduePrincipal += installmentValue;
                    totalLateInstallments++; // Conta para a taxa de inadimplência
                }
            });
        });

        // 5. Calcula a Taxa de Inadimplência
        const defaultRate = totalInstallments > 0 ? (totalLateInstallments / totalInstallments) * 100 : 0;

        res.status(200).json({
            totalLoaned,
            totalOverduePrincipal,
            totalReceived,
            defaultRate
        });

    } catch (error) {
        console.error('API /financial-summary error:', error);
        res.status(500).json({ error: 'Erro ao calcular o resumo financeiro.' });
    } finally {
        db.release();
    }
}