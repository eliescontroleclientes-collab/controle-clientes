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

        // Estilos Padrão
        const titleFont = { name: 'Calibri', size: 26, bold: true };
        const headerFont = { name: 'Calibri', size: 11, bold: true };
        const defaultFont = { name: 'Calibri', size: 11 };
        const centerAlignment = { vertical: 'middle', horizontal: 'center', wrapText: true };

        // Título Principal
        sheet.mergeCells('A1:R3');
        const titleCell = sheet.getCell('A1');
        titleCell.value = 'PAINEL DE CONTROLE DE CLIENTES';
        titleCell.font = titleFont;
        titleCell.alignment = centerAlignment;

        let currentRow = 4; // Começa na linha 4

        clients.forEach(client => {
            const startRow = currentRow;

            // --- Bloco de Informações do Cliente ---

            // ID
            sheet.getCell(`A${startRow}`).value = 'ID';
            sheet.mergeCells(`A${startRow + 1}:A${startRow + 5}`);
            sheet.getCell(`A${startRow + 1}`).value = client.id;

            // Nome
            sheet.getCell(`B${startRow}`).value = 'Nome';
            sheet.getCell(`B${startRow + 1}`).value = client.name;

            // Status
            sheet.getCell(`B${startRow + 2}`).value = 'Status';
            sheet.getCell(`B${startRow + 3}`).value = calculateClientStatus(client);

            // Saldo
            sheet.getCell(`B${startRow + 4}`).value = 'Saldo';
            const balanceCell = sheet.getCell(`B${startRow + 5}`);
            balanceCell.value = parseFloat(client.saldo || 0);
            balanceCell.numFmt = '"R$"#,##0.00';


            // Valor Empréstimo
            sheet.getCell(`C${startRow}`).value = 'Valor do Empréstimo';
            const loanCell = sheet.getCell(`C${startRow + 1}`);
            loanCell.value = parseFloat(client.loanValue || 0);
            loanCell.numFmt = '"R$"#,##0.00';

            // Data Início
            sheet.getCell(`C${startRow + 2}`).value = 'Data Início';
            sheet.getCell(`C${startRow + 3}`).value = client.startDate ? new Date(client.startDate) : null;

            // Data Final Estimada
            sheet.getCell(`C${startRow + 4}`).value = 'Data Final Estimada';
            sheet.getCell(`C${startRow + 5}`).value = (client.paymentDates && client.paymentDates.length > 0) ? new Date(client.paymentDates[client.paymentDates.length - 1].date) : null;

            // Valor Parcela
            sheet.getCell(`D${startRow}`).value = 'Valor Parcela';
            const installmentValueCell = sheet.getCell(`D${startRow + 1}`);
            installmentValueCell.value = parseFloat(client.dailyValue || 0);
            installmentValueCell.numFmt = '"R$"#,##0.00';

            // Nº de Parcelas
            sheet.getCell(`D${startRow + 2}`).value = 'Nº de Parcelas';
            sheet.getCell(`D${startRow + 3}`).value = client.installments;

            // Frequência
            sheet.getCell(`D${startRow + 4}`).value = 'Frequência';
            sheet.getCell(`D${startRow + 5}`).value = client.frequency === 'daily' ? 'Diária' : 'Semanal';

            // Data Quitação
            sheet.getCell(`E${startRow}`).value = 'Data Quitação';
            if (calculateClientStatus(client) === 'Empréstimo Concluído') {
                const paidDates = client.paymentDates.map(p => new Date(p.paidAt)).filter(d => !isNaN(d));
                if (paidDates.length > 0) {
                    sheet.getCell(`E${startRow + 1}`).value = new Date(Math.max.apply(null, paidDates));
                }
            }

            // --- Bloco do Calendário ---
            sheet.mergeCells(`F${startRow}:L${startRow}`);
            sheet.getCell(`F${startRow}`).value = 'CALENDÁRIO DE PAGAMENTOS';

            if (client.paymentDates && client.paymentDates.length > 0) {
                const firstPaymentDate = new Date(client.paymentDates[0].date);
                let calendarStartDate = new Date(firstPaymentDate);
                // Leva a data para a segunda-feira anterior para iniciar o grid
                while (calendarStartDate.getUTCDay() !== 1) {
                    calendarStartDate.setUTCDate(calendarStartDate.getUTCDate() - 1);
                }

                let calendarRow = startRow + 1;
                let calendarCol = 6; // Coluna F

                for (let i = 0; i < 35; i++) { // Renderiza no máximo 5 semanas
                    const cell = sheet.getCell(calendarRow, calendarCol);
                    cell.value = new Date(calendarStartDate);

                    const payment = client.paymentDates.find(p => p.date.startsWith(calendarStartDate.toISOString().split('T')[0]));
                    const dayOfWeek = calendarStartDate.getUTCDay();

                    if (payment) {
                        if (payment.status === 'paid') cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D1E7DD' } };
                        else if (payment.status === 'late') cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8D7DA' } };
                        else cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3CD' } };
                    } else if (dayOfWeek === 0 || dayOfWeek === 6) {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'E9ECEF' } };
                    }

                    calendarStartDate.setUTCDate(calendarStartDate.getUTCDate() + 1);
                    calendarCol++;
                    if (calendarCol > 12) { // Coluna L
                        calendarCol = 6;
                        calendarRow++;
                    }
                }
            }

            // --- Bloco de Observação ---
            sheet.mergeCells(`M${startRow}:R${startRow}`);
            sheet.getCell(`M${startRow}`).value = 'OBSERVAÇÃO';
            sheet.mergeCells(`M${startRow + 1}:R${startRow + 5}`);


            // --- Aplica Estilos no Card Inteiro ---
            for (let r = startRow; r <= startRow + 5; r++) {
                for (let c = 1; c <= 18; c++) { // A to R
                    const cell = sheet.getCell(r, c);
                    cell.alignment = centerAlignment;
                    cell.font = defaultFont;
                    if (r === startRow) cell.font = headerFont;
                    if (c === 1 && r > startRow) cell.font = headerFont; // Deixa ID em negrito
                    if (r % 2 === 0 && c > 1 && c < 6) cell.font = headerFont; // Deixa labels em negrito
                    cell.border = { top: { style: 'thin' }, left: { style: 'thin' }, bottom: { style: 'thin' }, right: { style: 'thin' } };
                }
            }
            for (let c = 6; c <= 12; c++) { // Formata datas do calendário
                for (let r = startRow + 1; r <= startRow + 5; r++) {
                    sheet.getCell(r, c).numFmt = 'dd/mm';
                }
            }
            ['C', 'D', 'E'].forEach(col => { // Formata as datas principais
                sheet.getCell(`${col}${startRow + 3}`).numFmt = 'dd/mm/yyyy';
                sheet.getCell(`${col}${startRow + 5}`).numFmt = 'dd/mm/yyyy';
            });
            sheet.getCell(`E${startRow + 1}`).numFmt = 'dd/mm/yyyy';

            // --- Linha Separadora ---
            currentRow += 6; // Pula as 6 linhas do card
            sheet.mergeCells(`A${currentRow}:R${currentRow}`);
            sheet.getRow(currentRow).fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: '000000' } };
            currentRow++; // Vai para a próxima linha para o próximo cliente
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