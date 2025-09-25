export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end('Method Not Allowed');
    }

    try {
        const { username, password } = req.body;

        const correctUser = process.env.LOGIN_USER;
        const correctPassword = process.env.LOGIN_PASSWORD;

        if (!correctUser || !correctPassword) {
            console.error("Variáveis de ambiente de login não estão definidas.");
            return res.status(500).json({ error: 'Erro de configuração do servidor.' });
        }

        if (username === correctUser && password === correctPassword) {
            res.status(200).json({ success: true });
        } else {
            res.status(401).json({ success: false }); // 401 Unauthorized
        }

    } catch (error) {
        console.error('API /login error:', error);
        res.status(500).json({ error: 'Erro interno do servidor.' });
    }
}