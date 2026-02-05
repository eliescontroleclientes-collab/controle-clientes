// ARQUIVO: api/login.js
export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end('Method Not Allowed');
    }

    try {
        const { username, password } = req.body;

        const apiToken = process.env.API_SECRET_TOKEN;

        // Credenciais ADMIN
        const adminUser = process.env.LOGIN_USER;
        const adminPass = process.env.LOGIN_PASSWORD;

        // Credenciais COBRADOR
        const cobradorUser = process.env.COBRADOR_USER;
        const cobradorPass = process.env.COBRADOR_PASSWORD;

        if (!apiToken) {
            return res.status(500).json({ error: 'Erro de configuração do servidor.' });
        }

        // Verifica se é ADMIN
        if (username === adminUser && password === adminPass) {
            return res.status(200).json({
                success: true,
                token: apiToken,
                role: 'admin' // <--- Identifica como CHEFE
            });
        }

        // Verifica se é COBRADOR
        if (username === cobradorUser && password === cobradorPass) {
            return res.status(200).json({
                success: true,
                token: apiToken,
                role: 'cobrador' // <--- Identifica como FUNCIONÁRIO
            });
        }

        // Se não for nenhum dos dois
        res.status(401).json({ success: false });

    } catch (error) {
        console.error('API /login error:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}