// /api/client-auth.js
import { Pool } from 'pg';
import bcrypt from 'bcryptjs';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const SALT_ROUNDS = 10; // Fator de custo para o hash da senha

export default async function handler(req, res) {
    if (req.method === 'POST') {
        // Lógica de Login
        const { username, password } = req.body;
        if (!username || !password) {
            return res.status(400).json({ error: 'Usuário e senha são obrigatórios.' });
        }

        const db = await pool.connect();
        try {
            const result = await db.query('SELECT client_id, password_hash FROM client_logins WHERE username = $1', [username]);
            if (result.rows.length === 0) {
                return res.status(401).json({ error: 'Credenciais inválidas.' });
            }

            const loginInfo = result.rows[0];
            const isPasswordCorrect = await bcrypt.compare(password, loginInfo.password_hash);

            if (isPasswordCorrect) {
                // Login bem-sucedido, retorna o ID do cliente para o front-end
                res.status(200).json({ success: true, clientId: loginInfo.client_id });
            } else {
                res.status(401).json({ error: 'Credenciais inválidas.' });
            }

        } catch (error) {
            console.error('API /client-auth error:', error);
            res.status(500).json({ error: 'Erro interno do servidor.' });
        } finally {
            db.release();
        }

    } else if (req.method === 'PUT') {
        // ### INÍCIO DA ALTERAÇÃO CORRIGIDA ###
        // Lógica para CRIAR ou ATUALIZAR um login de cliente
        const { clientId, username, password } = req.body;
        if (!clientId || !username) { // A senha agora é opcional na validação inicial
            return res.status(400).json({ error: 'ID do cliente e nome de usuário são obrigatórios.' });
        }

        const db = await pool.connect();
        try {
            // Se uma senha foi fornecida, criamos o hash dela.
            if (password && password.trim() !== '') {
                const passwordHash = await bcrypt.hash(password, SALT_ROUNDS);
                const query = `
                    INSERT INTO client_logins (client_id, username, password_hash)
                    VALUES ($1, $2, $3)
                    ON CONFLICT (client_id) DO UPDATE SET username = $2, password_hash = $3;
                `;
                await db.query(query, [clientId, username, passwordHash]);
            } else {
                // Se a senha estiver em branco, atualizamos apenas o nome de usuário.
                // Isso também funciona para criar um novo login sem senha (não recomendado, mas possível)
                const query = `
                    INSERT INTO client_logins (client_id, username, password_hash)
                    VALUES ($1, $2, (SELECT password_hash FROM client_logins WHERE client_id = $1))
                    ON CONFLICT (client_id) DO UPDATE SET username = $2;
                `;
                // A subquery (SELECT password_hash...) garante que o hash existente não seja apagado
                // caso o usuário esteja apenas mudando o nome de usuário.
                await db.query(query, [clientId, username]);
            }

            res.status(201).json({ success: true, message: 'Login do cliente criado/atualizado com sucesso.' });

        } catch (error) {
            console.error('API /client-auth PUT error:', error);
            if (error.code === '23505') { // Erro de violação de unicidade (username já existe)
                return res.status(409).json({ error: 'Este nome de usuário já está em uso.' });
            }
            res.status(500).json({ error: 'Erro ao criar/atualizar login para o cliente.' });
        } finally {
            db.release();
        }
        // ### FIM DA ALTERAÇÃO CORRIGIDA ###

    } else {
        res.setHeader('Allow', ['POST', 'PUT']);
        res.status(405).end();
    }
}