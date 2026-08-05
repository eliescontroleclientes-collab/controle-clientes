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

function cleanPatternNeighborhoods(value) {
    if (!Array.isArray(value)) return [];

    const cleaned = [];
    const seen = new Set();

    value.forEach(item => {
        const city = cleanName(item?.city);
        const neighborhood = cleanName(item?.neighborhood);

        if (!ALLOWED_CITIES.includes(city) || !neighborhood || neighborhood.length > 150) {
            return;
        }

        const key = `${normalizeForComparison(city)}|||${normalizeForComparison(neighborhood)}`;
        if (seen.has(key)) return;

        seen.add(key);
        cleaned.push({ city, neighborhood });
    });

    return cleaned;
}

function validatePattern(name, neighborhoods) {
    if (!name) {
        return 'O nome do padrão é obrigatório.';
    }

    if (name.length > 120) {
        return 'O nome do padrão deve ter no máximo 120 caracteres.';
    }

    if (!Array.isArray(neighborhoods) || neighborhoods.length === 0) {
        return 'O padrão deve ter pelo menos um bairro.';
    }

    return null;
}

async function ensurePatternNameIsUnique(db, name, ignoredId = null) {
    const result = await db.query(`
        SELECT id, name
        FROM route_patterns
        WHERE ($1::int IS NULL OR id <> $1)
    `, [ignoredId]);

    return result.rows.find(pattern =>
        normalizeForComparison(pattern.name) === normalizeForComparison(name)
    ) || null;
}

async function handleRoutePatterns(req, res, db) {
    if (req.method === 'GET') {
        const result = await db.query(`
            SELECT id, name, neighborhoods, created_at, updated_at
            FROM route_patterns
            ORDER BY name ASC
        `);

        return res.status(200).json({ patterns: result.rows });
    }

    if (req.method === 'POST') {
        const name = cleanName(req.body?.name);
        const neighborhoods = cleanPatternNeighborhoods(req.body?.neighborhoods);
        const validationError = validatePattern(name, neighborhoods);

        if (validationError) {
            return res.status(400).json({ error: validationError });
        }

        const duplicate = await ensurePatternNameIsUnique(db, name);
        if (duplicate) {
            return res.status(409).json({
                error: `Já existe um padrão chamado "${duplicate.name}".`
            });
        }

        const result = await db.query(`
            INSERT INTO route_patterns (name, neighborhoods)
            VALUES ($1, $2::jsonb)
            RETURNING id, name, neighborhoods, created_at, updated_at
        `, [name, JSON.stringify(neighborhoods)]);

        return res.status(201).json(result.rows[0]);
    }

    if (req.method === 'PUT') {
        const id = parseInt(req.body?.id, 10);
        const name = cleanName(req.body?.name);
        const neighborhoods = cleanPatternNeighborhoods(req.body?.neighborhoods);
        const validationError = validatePattern(name, neighborhoods);

        if (!id) {
            return res.status(400).json({ error: 'ID do padrão inválido.' });
        }

        if (validationError) {
            return res.status(400).json({ error: validationError });
        }

        const duplicate = await ensurePatternNameIsUnique(db, name, id);
        if (duplicate) {
            return res.status(409).json({
                error: `Já existe um padrão chamado "${duplicate.name}".`
            });
        }

        const result = await db.query(`
            UPDATE route_patterns
            SET name = $1,
                neighborhoods = $2::jsonb,
                updated_at = NOW()
            WHERE id = $3
            RETURNING id, name, neighborhoods, created_at, updated_at
        `, [name, JSON.stringify(neighborhoods), id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Padrão não encontrado.' });
        }

        return res.status(200).json(result.rows[0]);
    }

    if (req.method === 'DELETE') {
        const id = parseInt(req.query?.id, 10);

        if (!id) {
            return res.status(400).json({ error: 'ID do padrão inválido.' });
        }

        const result = await db.query(`
            DELETE FROM route_patterns
            WHERE id = $1
            RETURNING id, name
        `, [id]);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'Padrão não encontrado.' });
        }

        return res.status(200).json({
            success: true,
            deleted: result.rows[0]
        });
    }

    res.setHeader('Allow', ['GET', 'POST', 'PUT', 'DELETE']);
    return res.status(405).end(`Method ${req.method} Not Allowed`);
}

export default async function handler(req, res) {
    const authHeader = req.headers.authorization;
    const token = authHeader && authHeader.split(' ')[1];

    if (token !== process.env.API_SECRET_TOKEN) {
        return res.status(401).json({ error: 'Acesso Negado.' });
    }

    const db = await pool.connect();

    try {
        const resource = cleanName(req.query?.resource || req.body?.resource).toLowerCase();

        if (resource === 'pattern' || resource === 'patterns') {
            return await handleRoutePatterns(req, res, db);
        }

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

            await db.query(`
                UPDATE clients
                SET cidade_rota = $1,
                    bairro_rota = $2
                WHERE cidade_rota = $3
                  AND bairro_rota = $4
            `, [city, name, current.city, current.name]);

            const patternRows = await db.query(`
                SELECT id, neighborhoods
                FROM route_patterns
                FOR UPDATE
            `);

            for (const pattern of patternRows.rows) {
                const neighborhoods = Array.isArray(pattern.neighborhoods)
                    ? pattern.neighborhoods
                    : [];
                let changed = false;

                const updatedNeighborhoods = neighborhoods.map(item => {
                    if (item.city === current.city && item.neighborhood === current.name) {
                        changed = true;
                        return { city, neighborhood: name };
                    }
                    return item;
                });

                if (changed) {
                    await db.query(`
                        UPDATE route_patterns
                        SET neighborhoods = $1::jsonb,
                            updated_at = NOW()
                        WHERE id = $2
                    `, [JSON.stringify(updatedNeighborhoods), pattern.id]);
                }
            }

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

            const patternRows = await db.query(`
                SELECT id, name, neighborhoods
                FROM route_patterns
            `);

            const patternsUsingNeighborhood = patternRows.rows.filter(pattern =>
                (Array.isArray(pattern.neighborhoods) ? pattern.neighborhoods : []).some(item =>
                    item.city === current.city && item.neighborhood === current.name
                )
            );

            if (patternsUsingNeighborhood.length > 0) {
                const patternNames = patternsUsingNeighborhood
                    .slice(0, 3)
                    .map(pattern => pattern.name)
                    .join(', ');

                return res.status(409).json({
                    error: `Não é possível remover "${current.name}" porque ele está salvo em ${patternsUsingNeighborhood.length} padrão(ões) de rota${patternNames ? `: ${patternNames}` : ''}. Atualize ou exclua esses padrões primeiro.`
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
            error: 'Erro interno do servidor ao gerenciar bairros e padrões de rota.'
        });
    } finally {
        db.release();
    }
}
