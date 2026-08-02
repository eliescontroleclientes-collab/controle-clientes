const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

export default async function handler(req, res) {
    // --- BLOCO DE SEGURANÇA NOVO ---
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1]; // Pega o token depois de "Bearer"

    if (token !== process.env.API_SECRET_TOKEN) {
        return res.status(401).json({ error: 'Acesso Negado. Token inválido ou ausente.' });
    }
    // ----------------------------------

    try {
        const db = await pool.connect();

        if (req.method === 'GET') {
            // 1. Pega os parâmetros da URL ou usa valores padrão
            const page = parseInt(req.query.page) || 1;
            const limit = parseInt(req.query.limit) || 15; // Define 15 clientes por página como padrão
            const offset = (page - 1) * limit;

            // 2. Faz duas consultas: uma para pegar o total de clientes e outra para pegar a página atual
            const totalResult = await db.query('SELECT COUNT(*) AS total FROM clients');
            const totalClients = parseInt(totalResult.rows[0].total, 10);

            // QUERY ATUALIZADA COM JOIN
            const queryText = `
                SELECT c.*, r.name as responsible_name 
                FROM clients c 
                LEFT JOIN responsibles r ON c.responsible_id = r.id 
                ORDER BY c.id ASC LIMIT $1 OFFSET $2
            `;
            const result = await db.query(queryText, [limit, offset]);

            // 3. Retorna um objeto contendo os clientes da página e o total
            res.status(200).json({
                clients: result.rows,
                total: totalClients
            });
        }
        else if (req.method === 'POST') {
            const {
                id, name, startDate, cpf, phone, loanValue, dailyValue,
                paymentDates, installments, frequency, localizacao, bairro,
                cidade_rota, bairro_rota, profissao, original_client_id,
                taxa_juros, responsible_id
            } = req.body;

            if (!id) {
                return res.status(400).json({ error: 'O ID do cliente é obrigatório.' });
            }

            const query = `
                INSERT INTO clients (
                    id, name, "startDate", cpf, phone, "loanValue", "dailyValue",
                    "paymentDates", installments, frequency, files, saldo,
                    localizacao, bairro, cidade_rota, bairro_rota, profissao,
                    observacoes, original_client_id, taxa_juros, responsible_id
                ) 
                VALUES (
                    $1, $2, $3, $4, $5, $6, $7, $8, $9, $10,
                    '[]'::jsonb, 0.00, $11, $12, $13, $14, $15, '',
                    $16, $17, $18
                ) 
                RETURNING *
            `;

            const values = [
                id,
                name,
                startDate,
                cpf,
                phone,
                loanValue,
                dailyValue,
                JSON.stringify(paymentDates),
                installments,
                frequency,
                localizacao,
                bairro,
                cidade_rota || null,
                bairro_rota || null,
                profissao,
                original_client_id || null,
                taxa_juros,
                responsible_id || null
            ];

            const result = await db.query(query, values);
            res.status(201).json(result.rows[0]);
        }
        else if (req.method === 'PUT') {
            // ######### INÍCIO DA ALTERAÇÃO: LÓGICA DE RESET #########
            const { id, resetPayments, ...clientData } = req.body;
            if (!id) return res.status(400).json({ error: 'Client ID is required' });

            if (resetPayments) {
                const clientResult = await db.query('SELECT "paymentDates" FROM clients WHERE id = $1', [id]);
                if (clientResult.rows.length === 0) throw new Error("Cliente não encontrado para reset.");

                let paymentDates = clientResult.rows[0].paymentDates || [];

                // ### INÍCIO DA CORREÇÃO DO BUG ###
                // A lógica agora limpa todos os campos relacionados ao pagamento.
                paymentDates.forEach(p => {
                    p.status = 'pending';       // 1. Volta o status para pendente
                    delete p.paidAt;            // 2. Remove a data de pagamento antiga (se houver)
                    delete p.paidValue;         // 3. Remove o valor pago antigo (se houver)
                    delete p.payments;          // 4. Remove a lista de pagamentos (CRÍTICO)
                });
                // ### FIM DA CORREÇÃO DO BUG ###

                const resetQuery = `UPDATE clients SET saldo = 0.00, "paymentDates" = $1 WHERE id = $2 RETURNING *`;
                const result = await db.query(resetQuery, [JSON.stringify(paymentDates), id]);
                return res.status(200).json(result.rows[0]);
            }
            // ######### FIM DA ALTERAÇÃO #########

            // LÓGICA NORMAL DE ATUALIZAÇÃO
            const {
                name, startDate, cpf, phone, loanValue, dailyValue, paymentDates,
                installments, frequency, files, saldo, localizacao, bairro,
                cidade_rota, bairro_rota, profissao, observacoes, taxa_juros,
                reminder_paused_until, is_risk, reminder_pause_note, responsible_id
            } = clientData;

            const query = `
                UPDATE clients 
                SET name = $1,
                    "startDate" = $2,
                    cpf = $3,
                    phone = $4,
                    "loanValue" = $5,
                    "dailyValue" = $6,
                    "paymentDates" = $7,
                    installments = $8,
                    frequency = $9,
                    files = $10,
                    saldo = $11,
                    localizacao = $12,
                    bairro = $13,
                    profissao = $14,
                    observacoes = $15,
                    taxa_juros = $17,
                    reminder_paused_until = $18,
                    is_risk = $19,
                    reminder_pause_note = $20,
                    responsible_id = $21,
                    cidade_rota = $22,
                    bairro_rota = $23
                WHERE id = $16
                RETURNING *
            `;

            const values = [
                name,
                startDate,
                cpf,
                phone,
                loanValue,
                dailyValue,
                JSON.stringify(paymentDates),
                installments,
                frequency,
                JSON.stringify(files || []),
                saldo || 0.00,
                localizacao,
                bairro,
                profissao,
                observacoes,
                id,
                taxa_juros,
                reminder_paused_until || null,
                is_risk || false,
                reminder_pause_note || '',
                responsible_id || null,
                cidade_rota || null,
                bairro_rota || null
            ];

            const result = await db.query(query, values);
            res.status(200).json(result.rows[0]);

        } else if (req.method === 'DELETE') {
            const { id } = req.query;
            if (!id) return res.status(400).json({ error: 'Client ID is required' });
            await db.query('DELETE FROM clients WHERE id = $1', [id]);
            res.status(204).send();
        } else {
            res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
            res.status(405).end(`Method ${req.method} Not Allowed`);
        }

        db.release();
    } catch (error) {
        console.error('API Error:', error);
        if (error.code === '23505') {
            return res.status(409).json({ error: 'Este ID de cliente já está em uso.' });
        }
        res.status(500).json({ error: 'Internal Server Error' });
    }
}
