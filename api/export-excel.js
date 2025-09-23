import { Pool } from 'pg';
import ExcelJS from 'exceljs';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Helper para calcular status (cópia simplificada, sem HTML)
function calculateClientStatusText(client) {
    if (!client.paymentDates || client.paymentDates.length === 0) return "Sem dados";
    if (client.paymentDates.every(p => p.status === 'paid')) return "Empréstimo Concluído";

    const timeZone = 'America/Cuiaba';
    const todayInCuiaba = new Date().toLocaleDateString('en-CA', { timeZone });
    const cuiabaTodayUTCMidnight = new Date(todayInCuiaba + 'T00:00:00.000Z').getTime();

    let lateCount = 0;
    let isPendingToday = false;

    client.paymentDates.forEach(p => {
        const paymentDateTime = new Date(p.date).getTime();
        if (p.status !== 'paid') {
            if (paymentDateTime < cuiabaTodayUTCMidnight) lateCount++;
            else if (paymentDateTime === cuiabaTodayUTCMidnight) isPendingToday = true;
        }
    });

    if (lateCount > 0) return `Atrasado (${lateCount})`;
    if (isPendingToday) return "Pendente";
    return "Em Dia";
}

export default async function handler(req, res) {
    const db = await pool.connect();
    try {
        const result = await db.query('SELECT * FROM clients ORDER BY id ASC');
        const clients = result.rows;

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Sistema de Controle';
        workbook.created = new Date();

        // Aba de Empréstimos
        const loansSheet = workbook.addWorksheet('Empréstimos');
        const paymentColumns = [];
        const maxInstallments = Math.max(...clients.map(c => c.installments || 0), 0);
        for (let i = 1; i <= maxInstallments; i++) {
            paymentColumns.push({ header: `Venc. Parcela ${i}`, key: `venc${i}` });
            paymentColumns.push({ header: `Status Parcela ${i}`, key: `status${i}` });
            paymentColumns.push({ header: `Data Pag. ${i}`, key: `pagoem${i}` });
        }

        loansSheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Nome', key: 'name', width: 30 },
            { header: 'CPF', key: 'cpf', width: 15 },
            { header: 'Telefone', key: 'phone', width: 15 },
            { header: 'Data Início', key: 'startDate', width: 15 },
            { header: 'Data Final Estimada', key: 'endDate', width: 20 },
            { header: 'Valor Empréstimo', key: 'loanValue', width: 20, style: { numFmt: '"R$"#,##0.00' } },
            { header: 'Valor Parcela', key: 'dailyValue', width: 20, style: { numFmt: '"R$"#,##0.00' } },
            { header: 'Status Geral', key: 'status', width: 20 },
            ...paymentColumns
        ];

        // Aba de Dados Pessoais
        const personalSheet = workbook.addWorksheet('Dados Pessoais');
        personalSheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Nome', key: 'name', width: 30 },
            { header: 'Profissão', key: 'profissao', width: 25 },
            { header: 'Bairro', key: 'bairro', width: 25 },
            { header: 'Localização', key: 'localizacao', width: 40 },
        ];


        clients.forEach(client => {
            const paymentDates = client.paymentDates || [];
            const endDate = paymentDates.length > 0 ? new Date(paymentDates[paymentDates.length - 1].date) : null;

            const loanRowData = {
                id: client.id,
                name: client.name,
                cpf: client.cpf,
                phone: client.phone,
                startDate: client.startDate ? new Date(client.startDate) : '',
                endDate: endDate,
                loanValue: parseFloat(client.loanValue),
                dailyValue: parseFloat(client.dailyValue),
                status: calculateClientStatusText(client),
            };

            paymentDates.forEach((p, index) => {
                loanRowData[`venc${index + 1}`] = new Date(p.date);
                loanRowData[`status${index + 1}`] = p.status;
                loanRowData[`pagoem${index + 1}`] = p.paidAt ? new Date(p.paidAt) : '';
            });

            const loanRow = loansSheet.addRow(loanRowData);

            // Adiciona cor às células de status da parcela
            for (let i = 0; i < paymentDates.length; i++) {
                const cell = loanRow.getCell(`status${i + 1}`);
                if (cell.value === 'paid') cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D1E7DD' } };
                if (cell.value === 'late' || (paymentDates[i].status !== 'paid' && new Date(paymentDates[i].date) < new Date())) {
                    cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8D7DA' } };
                }
            }

            // Preenche a aba de dados pessoais
            personalSheet.addRow({
                id: client.id,
                name: client.name,
                profissao: client.profissao,
                bairro: client.bairro,
                localizacao: client.localizacao,
            });
        });

        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="relatorio_clientes.xlsx"');

        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('API /export-excel error:', error);
        res.status(500).json({ error: 'Erro ao gerar planilha.' });
    } finally {
        db.release();
    }
}