// ARQUIVO: /api/login.js

export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end('Method Not Allowed');
    }

    try {
        const { username, password } = req.body;

        const correctUser = process.env.LOGIN_USER;
        const correctPassword = process.env.LOGIN_PASSWORD;
        // O novo Token que você criou no .env
        const apiToken = process.env.API_SECRET_TOKEN;

        if (!correctUser || !correctPassword || !apiToken) {
            console.error("Variáveis de ambiente de login ou token não estão definidas.");
            return res.status(500).json({ error: 'Erro de configuração do servidor.' });
        }

        if (username === correctUser && password === correctPassword) {
            // MUDANÇA AQUI: Retornamos o token para o frontend
            res.status(200).json({ success: true, token: apiToken });
        } else {
            res.status(401).json({ success: false });
        }

    } catch (error) {
        console.error('API /login error:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}