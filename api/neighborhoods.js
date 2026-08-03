import { Pool } from 'pg';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

const ALLOWED_CITIES = ['Cuiabá', 'Várzea Grande'];

function cleanName(value) {
    return String(value || '').trim().replace(/\s+/g, ' ');
}

function normalizeForComparison(value) {
    return cleanName(value)
        .normalize('NFD')
        .replace(/[\u0300-\u036f]/g, '')
        .toLocaleLowerCase('pt-BR');
}

function validateNeighborhood(city, name) {
    if (!ALLOWED_CITIES.includes(city)) {
        return 'Cidade inválida. Use Cuiabá ou Várzea Grande.';
    }

    if (!name) {
        return 'O nome do bairro é obrigatório.';
    }

    if (name.length > 150) {
        return 'O nome do bairro deve ter no máximo 150 caracteres.';
    }

    return null;
}

export default async function handler(req, res) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token !== process.env.API_SECRET_TOKEN) {
        return res.status(401).json({ error: 'Acesso Negado.' });
    }

    const db = await pool.connect();

    try {
        if (req.method === 'GET') {
            const result = await db.query(`
                SELECT id, city, name
                FROM route_neighborhoods
                ORDER BY city ASC, name ASC
            `);

            return res.status(200).json({
                neighborhoods: result.rows
            });
        }

        if (req.method === 'POST') {
            const city = cleanName(req.body?.city);
            const name = cleanName(req.body?.name);
            const validationError = validateNeighborhood(city, name);

            if (validationError) {
                return res.status(400).json({ error: validationError });
            }

            const cityNeighborhoods = await db.query(`
                SELECT id, name
                FROM route_neighborhoods
                WHERE city = $1
            `, [city]);

            const duplicate = cityNeighborhoods.rows.find(item =>
                normalizeForComparison(item.name) === normalizeForComparison(name)
            );

            if (duplicate) {
                return res.status(409).json({
                    error: `O bairro "${duplicate.name}" já existe em ${city}.`
                });
            }

            const result = await db.query(`
                INSERT INTO route_neighborhoods (city, name)
                VALUES ($1, $2)
                RETURNING id, city, name
            `, [city, name]);

            return res.status(201).json(result.rows[0]);
        }

        if (req.method === 'PUT') {
            const id = parseInt(req.body?.id, 10);
            const city = cleanName(req.body?.city);
            const name = cleanName(req.body?.name);
            const validationError = validateNeighborhood(city, name);

            if (!id) {
                return res.status(400).json({ error: 'ID do bairro inválido.' });
            }

            if (validationError) {
                return res.status(400).json({ error: validationError });
            }

            await db.query('BEGIN');

            const currentResult = await db.query(`
                SELECT id, city, name
                FROM route_neighborhoods
                WHERE id = $1
                FOR UPDATE
            `, [id]);

            if (currentResult.rows.length === 0) {
                await db.query('ROLLBACK');
                return res.status(404).json({ error: 'Bairro não encontrado.' });
            }

            const current = currentResult.rows[0];

            const cityNeighborhoods = await db.query(`
                SELECT id, name
                FROM route_neighborhoods
                WHERE city = $1
                  AND id <> $2
            `, [city, id]);

            const duplicate = cityNeighborhoods.rows.find(item =>
                normalizeForComparison(item.name) === normalizeForComparison(name)
            );

            if (duplicate) {
                await db.query('ROLLBACK');
                return res.status(409).json({
                    error: `O bairro "${duplicate.name}" já existe em ${city}.`
                });
            }

            const result = await db.query(`
                UPDATE route_neighborhoods
                SET city = $1, name = $2
                WHERE id = $3
                RETURNING id, city, name
            `, [city, name, id]);

            // Mantém os clientes sincronizados quando um bairro é renomeado.
            await db.query(`
                UPDATE clients
                SET cidade_rota = $1,
                    bairro_rota = $2
                WHERE cidade_rota = $3
                  AND bairro_rota = $4
            `, [city, name, current.city, current.name]);

            await db.query('COMMIT');
            return res.status(200).json(result.rows[0]);
        }

        if (req.method === 'DELETE') {
            const id = parseInt(req.query?.id, 10);

            if (!id) {
                return res.status(400).json({ error: 'ID do bairro inválido.' });
            }

            const currentResult = await db.query(`
                SELECT id, city, name
                FROM route_neighborhoods
                WHERE id = $1
            `, [id]);

            if (currentResult.rows.length === 0) {
                return res.status(404).json({ error: 'Bairro não encontrado.' });
            }

            const current = currentResult.rows[0];

            const usageResult = await db.query(`
                SELECT COUNT(*)::int AS total
                FROM clients
                WHERE cidade_rota = $1
                  AND bairro_rota = $2
            `, [current.city, current.name]);

            const clientsUsingNeighborhood = usageResult.rows[0]?.total || 0;

            if (clientsUsingNeighborhood > 0) {
                return res.status(409).json({
                    error: `Não é possível remover "${current.name}" porque ele está sendo usado por ${clientsUsingNeighborhood} cliente(s). Edite o bairro ou atualize esses clientes primeiro.`
                });
            }

            await db.query(
                'DELETE FROM route_neighborhoods WHERE id = $1',
                [id]
            );

            return res.status(200).json({
                success: true,
                deleted: current
            });
        }

        res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
        return res.status(405).end(`Method ${req.method} Not Allowed`);
    } catch (error) {
        try {
            await db.query('ROLLBACK');
        } catch (_) {
            // Nenhuma transação ativa.
        }

        console.error('API /neighborhoods error:', error);
        return res.status(500).json({
            error: 'Erro interno do servidor ao gerenciar bairros.'
        });
    } finally {
        db.release();
    }
}
