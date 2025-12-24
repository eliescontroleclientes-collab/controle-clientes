// ARQUIVO: api/holidays.js
import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Função auxiliar para verificar se é fim de semana
const isWeekend = (date) => {
    const day = date.getUTCDay();
    return day === 0 || day === 6; // 0=Domingo, 6=Sábado
};

// Função para formatar data YYYY-MM-DD
const formatDate = (date) => date.toISOString().split('T')[0];

export default async function handler(req, res) {
    // --- SEGURANÇA ---
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];
    if (token !== process.env.API_SECRET_TOKEN) {
        return res.status(401).json({ error: 'Acesso Negado.' });
    }
    // -----------------

    const db = await pool.connect();

    try {
        if (req.method === 'GET') {
            // Retorna lista de feriados cadastrados
            const result = await db.query('SELECT * FROM holidays ORDER BY date DESC');
            return res.status(200).json(result.rows);
        }

        else if (req.method === 'POST') {
            const { date, description } = req.body;
            if (!date) return res.status(400).json({ error: 'Data é obrigatória.' });

            await db.query('BEGIN'); // Inicia transação de segurança

            // 1. Salva o feriado no banco
            const insertQuery = `
                INSERT INTO holidays (date, description) VALUES ($1, $2)
                ON CONFLICT (date) DO NOTHING;
            `;
            await db.query(insertQuery, [date, description || 'Feriado']);

            // 2. Busca TODOS os clientes para recalcular
            const clientsResult = await db.query('SELECT id, "paymentDates", frequency FROM clients');
            const clients = clientsResult.rows;

            const holidayDateStr = date; // Ex: "2024-12-25"
            const holidayTimestamp = new Date(holidayDateStr + 'T00:00:00Z').getTime();

            // 3. Loop em cada cliente
            for (const client of clients) {
                let paymentDates = client.paymentDates || [];
                let hasChanges = false;

                // Vamos processar as datas
                // Se for DIÁRIO: Efeito Dominó (empurra tudo pra frente)
                if (client.frequency === 'daily') {
                    for (let i = 0; i < paymentDates.length; i++) {
                        // Só mexe se não estiver pago
                        if (paymentDates[i].status === 'paid') continue;

                        const currentPaymentDate = new Date(paymentDates[i].date);
                        const currentStr = formatDate(currentPaymentDate);

                        // Se a parcela cair EXATAMENTE no feriado OU se ela já foi empurrada para o feriado por uma anterior
                        // Precisamos verificar se a data atual bate com o feriado inserido
                        if (currentStr === holidayDateStr) {
                            hasChanges = true;

                            // A partir daqui, empurra ESTA e TODAS as próximas parcelas pendentes
                            for (let j = i; j < paymentDates.length; j++) {
                                if (paymentDates[j].status === 'paid') continue; // Pula as pagas (segurança extra)

                                // Pega a data atual da parcela e soma 1 dia
                                let d = new Date(paymentDates[j].date);
                                d.setUTCDate(d.getUTCDate() + 1);

                                // Se cair em fim de semana, avança
                                while (isWeekend(d)) {
                                    d.setUTCDate(d.getUTCDate() + 1);
                                }
                                // NOTA: Não verificamos recursivamente outros feriados aqui para não travar o loop,
                                // mas o ideal seria rodar feriado por feriado.

                                paymentDates[j].date = d.toISOString();
                            }
                            // Como já aplicamos o efeito dominó, podemos parar de verificar este cliente
                            break;
                        }
                    }
                }
                // Se for SEMANAL, QUINZENAL ou MENSAL: Apenas adia a parcela específica
                else {
                    for (let i = 0; i < paymentDates.length; i++) {
                        if (paymentDates[i].status === 'paid') continue;

                        const currentStr = formatDate(new Date(paymentDates[i].date));

                        if (currentStr === holidayDateStr) {
                            hasChanges = true;
                            let d = new Date(paymentDates[i].date);
                            d.setUTCDate(d.getUTCDate() + 1);

                            // Avança se for fim de semana
                            while (isWeekend(d)) {
                                d.setUTCDate(d.getUTCDate() + 1);
                            }
                            paymentDates[i].date = d.toISOString();
                        }
                    }
                }

                // Se houve mudança, salva no banco
                if (hasChanges) {
                    await db.query(
                        'UPDATE clients SET "paymentDates" = $1 WHERE id = $2',
                        [JSON.stringify(paymentDates), client.id]
                    );
                }
            }

            await db.query('COMMIT'); // Salva tudo
            res.status(200).json({ success: true, message: 'Feriado aplicado e calendários atualizados.' });
        }
        else {
            res.setHeader('Allow', ['GET', 'POST']);
            res.status(405).end();
        }
    } catch (error) {
        await db.query('ROLLBACK'); // Se der erro, cancela tudo
        console.error('Erro no feriado:', error);
        res.status(500).json({ error: 'Erro ao processar feriado.' });
    } finally {
        db.release();
    }
}