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

        const sheet = workbook.addWorksheet('Painel de Controle');

        // Configuração geral da página (opcional, mas ajuda na visualização)
        sheet.properties.defaultRowHeight = 20;

        // Título Principal
        sheet.mergeCells('A1:R3');
        const titleCell = sheet.getCell('A1');
        titleCell.value = 'PAINEL DE CONTROLE DE CLIENTES';
        titleCell.font = { name: 'Calibri', size: 26, bold: true };
        titleCell.alignment = { vertical: 'middle', horizontal: 'center' };

        let currentRow = 4; // Linha inicial para o primeiro cliente

        clients.forEach(client => {
            const startRow = currentRow;

            // --- BLOCO DE CABEÇALHOS ---
            const headerStyle = { font: { name: 'Calibri', size: 11, bold: true }, alignment: { vertical: 'middle', horizontal: 'center' } };
            sheet.getCell(`A${startRow}`).value = 'ID';
            sheet.getCell(`B${startRow}`).value = 'Nome';
            sheet.getCell(`C${startRow}`).value = 'Valor do Empréstimo';
            sheet.getCell(`D${startRow}`).value = 'Valor Parcela';
            sheet.getCell(`E${startRow}`).value = 'Data Quitação';

            sheet.mergeCells(`F${startRow}:L${startRow}`);
            sheet.getCell(`F${startRow}`).value = 'CALENDARIO DE PAGAMENTOS';

            sheet.mergeCells(`M${startRow}:R${startRow}`);
            sheet.getCell(`M${startRow}`).value = 'OBSERVAÇÃO';

            // Aplica estilo a todos os cabeçalhos da linha
            sheet.getRow(startRow).eachCell(cell => Object.assign(cell, headerStyle));

            // --- BLOCO DE DADOS (5 LINHAS) ---
            const dataAlignment = { vertical: 'middle', horizontal: 'center' };

            // ID (mesclado)
            sheet.mergeCells(`A${startRow + 1}:A${startRow + 5}`);
            const idCell = sheet.getCell(`A${startRow + 1}`);
            idCell.value = client.id;
            idCell.alignment = dataAlignment;
            idCell.font = { name: 'Calibri', size: 11 };

            // Dados Coluna B
            sheet.getCell(`B${startRow + 1}`).value = client.name;
            sheet.getCell(`B${startRow + 2}`).value = 'Status';
            sheet.getCell(`B${startRow + 3}`).value = calculateClientStatus(client);
            sheet.getCell(`B${startRow + 4}`).value = 'Saldo';
            sheet.getCell(`B${startRow + 5}`).value = { formula: `D${startRow + 5}`, result: parseFloat(client.saldo) };
            sheet.getCell(`B${startRow + 5}`).numFmt = '"R$"#,##0.00';

            // Dados Coluna C
            sheet.getCell(`C${startRow + 1}`).value = 'Data Início';
            sheet.getCell(`C${startRow + 2}`).value = client.startDate ? new Date(client.startDate) : 'N/A';
            sheet.getCell(`C${startRow + 3}`).value = 'Data Final Estimada';
            sheet.getCell(`C${startRow + 4}`).value = client.paymentDates && client.paymentDates.length > 0 ? new Date(client.paymentDates[client.paymentDates.length - 1].date) : 'N/A';

            // Dados Coluna D
            sheet.getCell(`D${startRow + 1}`).value = 'Nº de Parcelas';
            sheet.getCell(`D${startRow + 2}`).value = client.installments;
            sheet.getCell(`D${startRow + 3}`).value = 'Frequência';
            sheet.getCell(`D${startRow + 4}`).value = client.frequency === 'daily' ? 'Diário' : 'Semanal';
            sheet.getCell(`D${startRow + 5}`).value = parseFloat(client.saldo); // Valor para a fórmula do saldo

            // Dados Coluna E (Data Quitação)
            let lastPaymentDate = null;
            if (client.paymentDates && client.paymentDates.every(p => p.status === 'paid')) {
                const paidDates = client.paymentDates.map(p => new Date(p.paidAt)).filter(d => !isNaN(d));
                if (paidDates.length > 0) lastPaymentDate = new Date(Math.max.apply(null, paidDates));
            }
            sheet.getCell(`E${startRow + 1}`).value = lastPaymentDate;

            // Formatações e estilos de dados
            sheet.getCell(`C${startRow + 2}`).numFmt = 'dd/mm/yyyy';
            sheet.getCell(`C${startRow + 4}`).numFmt = 'dd/mm/yyyy';
            sheet.getCell(`E${startRow + 1}`).numFmt = 'dd/mm/yyyy';
            sheet.getCell(`C${startRow + 5}`).value = { formula: `C${startRow + 1}.value`, result: parseFloat(client.loanValue) };
            sheet.getCell(`C${startRow + 5}`).numFmt = '"R$"#,##0.00';
            sheet.getCell(`D${startRow + 5}`).numFmt = '"R$"#,##0.00';

            // Centraliza os dados
            for (let i = 1; i <= 5; i++) {
                sheet.getCell(`B${startRow + i}`).alignment = dataAlignment;
                sheet.getCell(`C${startRow + i}`).alignment = dataAlignment;
                sheet.getCell(`D${startRow + i}`).alignment = dataAlignment;
                sheet.getCell(`E${startRow + i}`).alignment = dataAlignment;
            }


            // Calendário de Pagamentos (F a L)
            const calendarCols = 7;
            let calRow = startRow + 1;
            let calCol = 6; // Coluna F
            (client.paymentDates || []).forEach(p => {
                const dateCell = sheet.getCell(calRow, calCol);
                dateCell.value = new Date(p.date);
                dateCell.numFmt = 'dd/mm';
                dateCell.alignment = dataAlignment;
                if (p.status === 'paid') {
                    dateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D1E7DD' } };
                } else if (p.status === 'late') {
                    dateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8D7DA' } };
                } else { // pending
                    dateCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3CD' } };
                }

                calCol++;
                if (calCol > 12) { // Passou da coluna L
                    calCol = 6; // Volta para a F
                    calRow++;
                }
            });

            // Observação (mesclado)
            sheet.mergeCells(`M${startRow + 1}:R${startRow + 5}`);
            const obsCell = sheet.getCell(`M${startRow + 1}`);
            obsCell.alignment = { vertical: 'top', horizontal: 'left', wrapText: true };

            // --- LINHA DE SEPARAÇÃO ---
            currentRow = startRow + 6;
            sheet.mergeCells(`A${currentRow}:R${currentRow}`);
            const separatorCell = sheet.getCell(`A${currentRow}`);
            separatorCell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FF000000' } }; // Preto

            currentRow++; // Prepara para o próximo cliente
        });

        // Envia o arquivo para o navegador
        res.setHeader('Content-Type', 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet');
        res.setHeader('Content-Disposition', 'attachment; filename="relatorio_clientes_detalhado.xlsx"');
        await workbook.xlsx.write(res);
        res.end();

    } catch (error) {
        console.error('API /export error:', error);
        res.status(500).json({ error: 'Erro ao gerar a planilha.' });
    } finally {
        db.release();
    }
}