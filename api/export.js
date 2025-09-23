import { Pool } from 'pg';
import ExcelJS from 'exceljs';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Helper function to calculate status (replicated from frontend)
function calculateClientStatus(client) {
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

    if (lateCount > 0) {
        let statusText = `Atrasado (${lateCount})`;
        if (isPendingToday) statusText += ` | Pendente Hoje`;
        return statusText;
    }
    if (isPendingToday) return "Pendente";

    // Simplified for Excel, as "Adiantado" can be inferred if all past are paid
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

        const sheet = workbook.addWorksheet('Painel de Clientes');

        // --- Configurações de Estilo ---
        const titleFont = { name: 'Calibri', size: 26, bold: true };
        const headerFont = { name: 'Calibri', size: 11, bold: true };
        const defaultFont = { name: 'Calibri', size: 11 };
        const centerAlignment = { vertical: 'middle', horizontal: 'center', wrapText: true };
        const thinBorder = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };

        // Definindo a largura das colunas
        sheet.columns = [
            { key: 'A', width: 10 }, { key: 'B', width: 50 }, { key: 'C', width: 20 },
            { key: 'D', width: 15 }, { key: 'E', width: 15 }, { key: 'F', width: 12 },
            { key: 'G', width: 12 }, { key: 'H', width: 12 }, { key: 'I', width: 12 },
            { key: 'J', width: 12 }, { key: 'K', width: 12 }, { key: 'L', width: 12 },
            { key: 'M', width: 10 }, { key: 'N', width: 10 }, { key: 'O', width: 10 },
            { key: 'P', width: 10 }, { key: 'Q', width: 10 }, { key: 'R', width: 10 }
        ];

        // --- Título Principal ---
        sheet.mergeCells('A1:R3');
        const titleCell = sheet.getCell('A1');
        titleCell.value = 'PAINEL DE CONTROLE DE CLIENTES';
        titleCell.font = titleFont;
        titleCell.alignment = centerAlignment;
        titleCell.border = thinBorder;


        let currentRow = 4; // Começa na linha 4

        clients.forEach(client => {
            const startRow = currentRow;

            // --- Bloco de Informações do Cliente ---
            sheet.getCell(`A${startRow}`).value = 'ID';
            sheet.mergeCells(`A${startRow + 1}:A${startRow + 5}`);
            const idCell = sheet.getCell(`A${startRow + 1}`);
            idCell.value = client.id;
            // ######### CORREÇÃO DE ALINHAMENTO #########
            idCell.alignment = centerAlignment;

            sheet.getCell(`B${startRow}`).value = 'Nome';
            sheet.getCell(`B${startRow + 1}`).value = client.name;
            sheet.getCell(`B${startRow + 2}`).value = 'Status';
            sheet.getCell(`B${startRow + 3}`).value = calculateClientStatus(client);
            sheet.getCell(`B${startRow + 4}`).value = 'Saldo';
            const balanceCell = sheet.getCell(`B${startRow + 5}`);
            balanceCell.value = parseFloat(client.saldo || 0);
            balanceCell.numFmt = '"R$"#,##0.00';

            sheet.getCell(`C${startRow}`).value = 'Valor do Empréstimo';
            const loanCell = sheet.getCell(`C${startRow + 1}`);
            loanCell.value = parseFloat(client.loanValue || 0);
            loanCell.numFmt = '"R$"#,##0.00';
            sheet.getCell(`C${startRow + 2}`).value = 'Data Início';
            sheet.getCell(`C${startRow + 3}`).value = client.startDate ? new Date(client.startDate) : null;
            sheet.getCell(`C${startRow + 4}`).value = 'Data Final Estimada';
            sheet.getCell(`C${startRow + 5}`).value = (client.paymentDates && client.paymentDates.length > 0) ? new Date(client.paymentDates[client.paymentDates.length - 1].date) : null;

            sheet.getCell(`D${startRow}`).value = 'Valor Parcela';
            const installmentValueCell = sheet.getCell(`D${startRow + 1}`);
            installmentValueCell.value = parseFloat(client.dailyValue || 0);
            installmentValueCell.numFmt = '"R$"#,##0.00';
            sheet.getCell(`D${startRow + 2}`).value = 'Nº de Parcelas';
            sheet.getCell(`D${startRow + 3}`).value = client.installments;
            sheet.getCell(`D${startRow + 4}`).value = 'Frequência';
            sheet.getCell(`D${startRow + 5}`).value = client.frequency === 'daily' ? 'Diária' : 'Semanal';

            sheet.getCell(`E${startRow}`).value = 'Data Quitação';
            if (calculateClientStatus(client) === 'Empréstimo Concluído') {
                const paidDates = client.paymentDates.map(p => new Date(p.paidAt)).filter(d => !isNaN(d));
                if (paidDates.length > 0) {
                    sheet.getCell(`E${startRow + 1}`).value = new Date(Math.max.apply(null, paidDates));
                }
            }

            // --- Bloco do Calendário ---
            sheet.mergeCells(`F${startRow}:L${startRow}`);
            const calendarTitleCell = sheet.getCell(`F${startRow}`);
            calendarTitleCell.value = 'CALENDÁRIO DE PAGAMENTOS';
            // ######### CORREÇÃO DE ALINHAMENTO #########
            calendarTitleCell.alignment = centerAlignment;

            if (client.paymentDates && client.paymentDates.length > 0) {
                const firstPaymentDate = new Date(client.paymentDates[0].date);
                let calendarStartDate = new Date(firstPaymentDate);

                let dayOfWeek = calendarStartDate.getUTCDay();
                calendarStartDate.setUTCDate(calendarStartDate.getUTCDate() - (dayOfWeek === 0 ? 6 : dayOfWeek - 1));

                let calendarRow = startRow + 1;
                let calendarCol = 6;

                const timeZone = 'America/Cuiaba';
                const todayInCuiaba = new Date().toLocaleDateString('en-CA', { timeZone });
                const cuiabaTodayUTCMidnight = new Date(todayInCuiaba + 'T00:00:00.000Z').getTime();

                for (let i = 0; i < 35; i++) {
                    const cell = sheet.getCell(calendarRow, calendarCol);
                    cell.value = new Date(calendarStartDate);
                    // ######### CORREÇÃO DO FORMATO DA DATA #########
                    cell.numFmt = 'dd/mm';

                    const currentDayStr = calendarStartDate.toISOString().split('T')[0];
                    const payment = client.paymentDates.find(p => p.date.startsWith(currentDayStr));
                    const currentDayOfWeek = calendarStartDate.getUTCDay();

                    if (payment) {
                        const paymentDateTime = new Date(payment.date).getTime();
                        if (payment.status === 'paid') {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D1E7DD' } };
                        } else if (paymentDateTime < cuiabaTodayUTCMidnight) {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8D7DA' } };
                        } else if (paymentDateTime === cuiabaTodayUTCMidnight) {
                            cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3CD' } };
                        }
                    } else if (currentDayOfWeek === 0 || currentDayOfWeek === 6) {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E9ECEF' } };
                    }

                    calendarStartDate.setUTCDate(calendarStartDate.getUTCDate() + 1);
                    calendarCol++;
                    if (calendarCol > 12) {
                        calendarCol = 6;
                        calendarRow++;
                    }
                }
            }

            // --- Bloco de Observação ---
            sheet.mergeCells(`M${startRow}:R${startRow}`);
            const observationTitleCell = sheet.getCell(`M${startRow}`);
            observationTitleCell.value = 'OBSERVAÇÃO';
            // ######### CORREÇÃO DE ALINHAMENTO #########
            observationTitleCell.alignment = centerAlignment;
            sheet.mergeCells(`M${startRow + 1}:R${startRow + 5}`);


            // --- Aplica Estilos no Card Inteiro ---
            for (let r = startRow; r <= startRow + 5; r++) {
                for (let c = 1; c <= 18; c++) {
                    const cell = sheet.getCell(r, c);
                    if (!cell.isMerged) {
                        cell.alignment = centerAlignment;
                        cell.font = defaultFont;
                    }
                    cell.border = thinBorder;
                }
            }
            sheet.getRow(startRow).font = headerFont;
            sheet.getCell(`B${startRow + 2}`).font = headerFont;
            sheet.getCell(`B${startRow + 4}`).font = headerFont;
            sheet.getCell(`C${startRow + 2}`).font = headerFont;
            sheet.getCell(`C${startRow + 4}`).font = headerFont;
            sheet.getCell(`D${startRow + 2}`).font = headerFont;
            sheet.getCell(`D${startRow + 4}`).font = headerFont;
            sheet.getCell(`A${startRow + 1}`).font = { name: 'Calibri', size: 11, bold: true };

            sheet.getCell(`C${startRow + 3}`).numFmt = 'dd/mm/yyyy';
            sheet.getCell(`C${startRow + 5}`).numFmt = 'dd/mm/yyyy';
            sheet.getCell(`E${startRow + 1}`).numFmt = 'dd/mm/yyyy';

            // --- Linha Separadora ---
            currentRow += 6;
            sheet.mergeCells(`A${currentRow}:R${currentRow}`);
            sheet.getRow(currentRow).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } };
            sheet.getRow(currentRow).height = 5;
            currentRow++;
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