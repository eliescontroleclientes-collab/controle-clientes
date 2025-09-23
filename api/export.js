import { Pool } from 'pg';
import ExcelJS from 'exceljs';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Helper function to calculate status (replicated from frontend for backend use)
function calculateClientStatus(client) {
    if (!client.paymentDates || client.paymentDates.length === 0) {
        return "Sem dados";
    }
    if (client.paymentDates.every(p => p.status === 'paid')) {
        return "Empréstimo Concluído";
    }
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
    if (lateCount > 0) {
        let statusText = `Atrasado (${lateCount})`;
        if (isPendingToday) statusText += ` | Pendente Hoje`;
        return statusText;
    }
    if (isPendingToday) return "Pendente";
    return "Em Dia"; // Simplified version for brevity in Excel
}

export default async function handler(req, res) {
    const db = await pool.connect();
    try {
        const result = await db.query('SELECT * FROM clients ORDER BY id ASC');
        const clients = result.rows;

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Sistema de Controle';
        workbook.created = new Date();

        // Aba 1: Empréstimos
        const loansSheet = workbook.addWorksheet('Empréstimos');
        const personalDataSheet = workbook.addWorksheet('Dados Pessoais');

        // Headers da aba de Dados Pessoais
        personalDataSheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Nome', key: 'name', width: 35 },
            { header: 'CPF', key: 'cpf', width: 15 },
            { header: 'Telefone', key: 'phone', width: 18 },
            { header: 'Profissão', key: 'profissao', width: 25 },
            { header: 'Bairro', key: 'bairro', width: 25 },
            { header: 'Localização', key: 'localizacao', width: 40 }
        ];

        // Headers da aba de Empréstimos (dinâmicos)
        const baseLoanHeaders = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Nome', key: 'name', width: 35 },
            { header: 'Status', key: 'status', width: 25 },
            { header: 'Data Início', key: 'startDate', width: 15 },
            { header: 'Data Final Estimada', key: 'endDate', width: 20 },
            { header: 'Data Quitação', key: 'settlementDate', width: 15 },
            { header: 'Valor Empréstimo', key: 'loanValue', width: 20, style: { numFmt: '"R$"#,##0.00' } },
            { header: 'Valor Parcela', key: 'dailyValue', width: 18, style: { numFmt: '"R$"#,##0.00' } },
            { header: 'Saldo', key: 'saldo', width: 15, style: { numFmt: '"R$"#,##0.00' } }
        ];

        let maxInstallments = 0;
        clients.forEach(c => {
            if (c.installments > maxInstallments) maxInstallments = c.installments;
        });

        for (let i = 1; i <= maxInstallments; i++) {
            baseLoanHeaders.push({ header: `Venc. Parcela ${i}`, key: `venc${i}`, width: 15 });
            baseLoanHeaders.push({ header: `Status Parcela ${i}`, key: `status${i}`, width: 15 });
            baseLoanHeaders.push({ header: `Data Pag. ${i}`, key: `paidAt${i}`, width: 15 });
        }
        loansSheet.columns = baseLoanHeaders;

        // Preenchendo os dados
        clients.forEach(client => {
            // Adiciona dados pessoais
            personalDataSheet.addRow({
                id: client.id,
                name: client.name,
                cpf: client.cpf,
                phone: client.phone,
                profissao: client.profissao,
                bairro: client.bairro,
                localizacao: client.localizacao
            });

            // Adiciona dados do empréstimo
            let lastPaymentDate = null;
            if (client.paymentDates && client.paymentDates.every(p => p.status === 'paid')) {
                const paidDates = client.paymentDates.map(p => new Date(p.paidAt)).filter(d => !isNaN(d));
                if (paidDates.length > 0) lastPaymentDate = new Date(Math.max.apply(null, paidDates));
            }

            const loanRow = {
                id: client.id,
                name: client.name,
                status: calculateClientStatus(client),
                startDate: client.startDate,
                endDate: client.paymentDates && client.paymentDates.length > 0 ? new Date(client.paymentDates[client.paymentDates.length - 1].date) : null,
                settlementDate: lastPaymentDate,
                loanValue: parseFloat(client.loanValue),
                dailyValue: parseFloat(client.dailyValue),
                saldo: parseFloat(client.saldo)
            };

            (client.paymentDates || []).forEach((p, index) => {
                loanRow[`venc${index + 1}`] = new Date(p.date);
                loanRow[`status${index + 1}`] = p.status;
                loanRow[`paidAt${index + 1}`] = p.paidAt ? new Date(p.paidAt) : null;
            });
            loansSheet.addRow(loanRow);
        });

        // Estilizando as células de status
        loansSheet.eachRow((row, rowNumber) => {
            if (rowNumber > 1) { // Pula o cabeçalho
                for (let i = 1; i <= maxInstallments; i++) {
                    const statusCell = row.getCell(`status${i}`);
                    if (statusCell.value === 'paid') {
                        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D1E7DD' } };
                    } else if (statusCell.value === 'late') {
                        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8D7DA' } };
                    } else if (statusCell.value === 'pending') {
                        statusCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3CD' } };
                    }
                }
            }
        });


        // Envia o arquivo para o navegador
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="relatorio_clientes.xlsx"');
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('API /export error:', error);
        res.status(500).json({ error: 'Erro ao gerar a planilha.' });
    } finally {
        db.release();
    }
}