export default async function handler(req, res) {
    if (req.method !== 'POST') {
        res.setHeader('Allow', ['POST']);
        return res.status(405).end('Method Not Allowed');
    }

    try {
        const { password } = req.body;
        const correctPassword = process.env.EDIT_FORM_PASSWORD;

        if (!correctPassword) {
            // Medida de segurança: se a variável de ambiente não estiver configurada no servidor.
            console.error("A variável de ambiente EDIT_FORM_PASSWORD não está definida.");
            return res.status(500).json({ success: false, error: 'Erro de configuração do servidor.' });
        }

        if (password === correctPassword) {
            res.status(200).json({ success: true });
        } else {
            res.status(401).json({ success: false, error: 'Senha incorreta.' });
        }

    } catch (error) {
        console.error('API /verify-password error:', error);
        res.status(500).json({ success: false, error: 'Erro interno do servidor.' });
    }
}