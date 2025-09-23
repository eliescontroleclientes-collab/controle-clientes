import { Pool } from 'pg';
import ExcelJS from 'exceljs';

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: { rejectUnauthorized: false }
});

// Helper para calcular status (simplificado para o Excel)
function calculateClientStatus(client) {
    if (!client.paymentDates || client.paymentDates.length === 0) return "Sem dados";
    if (client.paymentDates.every(p => p.status === 'paid')) return "Empréstimo Concluído";
    const timeZone = 'America/Cuiaba';
    const todayInCuiaba = new Date().toLocaleDateString('en-CA', { timeZone });
    const cuiabaTodayUTCMidnight = new Date(todayInCuiaba + 'T00:00:00.000Z').getTime();
    let lateCount = client.paymentDates.filter(p => new Date(p.date).getTime() < cuiabaTodayUTCMidnight && p.status !== 'paid').length;
    if (lateCount > 0) return `Atrasado (${lateCount})`;
    return "Em Dia";
}

// Helper para formatar moeda
const formatCurrency = (value) => {
    const number = parseFloat(value);
    if (isNaN(number)) return "";
    return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(number);
};

export default async function handler(req, res) {
    const db = await pool.connect();
    try {
        const result = await db.query('SELECT * FROM clients ORDER BY id ASC');
        const clients = result.rows;

        const workbook = new ExcelJS.Workbook();
        workbook.creator = 'Sistema de Controle';
        workbook.created = new Date();

        const loansSheet = workbook.addWorksheet('Empréstimos');
        const personalDataSheet = workbook.addWorksheet('Dados Pessoais');

        // --- Configuração da Aba "Dados Pessoais" (sem alteração) ---
        personalDataSheet.columns = [
            { header: 'ID', key: 'id', width: 10 },
            { header: 'Nome', key: 'name', width: 35 },
            { header: 'CPF', key: 'cpf', width: 15 },
            { header: 'Telefone', key: 'phone', width: 18 },
            { header: 'Profissão', key: 'profissao', width: 25 },
            { header: 'Bairro', key: 'bairro', width: 25 },
            { header: 'Localização', key: 'localizacao', width: 40 }
        ];
        clients.forEach(client => {
            personalDataSheet.addRow({
                id: client.id, name: client.name, cpf: client.cpf, phone: client.phone,
                profissao: client.profissao, bairro: client.bairro, localizacao: client.localizacao
            });
        });

        // --- Configuração da Aba "Empréstimos" (NOVA LÓGICA DE BLOCOS) ---
        const DATES_PER_ROW = 7; // Define quantas datas por linha no bloco
        const BLOCK_HEIGHT = 5; // Altura de cada bloco de cliente

        // Headers principais
        loansSheet.getRow(1).values = ['ID', 'Nome', 'Valor do Empréstimo', 'Valor Parcela', 'Data Quitação', 'Calendário de Pagamentos'];
        loansSheet.getRow(1).font = { bold: true };
        loansSheet.columns = [
            { key: 'id', width: 10 }, { key: 'name', width: 35 }, { key: 'loanValue', width: 20 },
            { key: 'dailyValue', width: 18 }, { key: 'settlementDate', width: 15 },
        ];

        let currentRow = 2; // Começa a preencher a partir da linha 2

        clients.forEach(client => {
            const startRow = currentRow;
            const endRow = startRow + BLOCK_HEIGHT - 1;

            // Mescla as células das colunas de informação
            loansSheet.mergeCells(`A${startRow}:A${endRow}`);
            loansSheet.mergeCells(`B${startRow}:B${endRow}`);
            loansSheet.mergeCells(`C${startRow}:C${endRow}`);
            loansSheet.mergeCells(`D${startRow}:D${endRow}`);
            loansSheet.mergeCells(`E${startRow}:E${endRow}`);

            // Centraliza o conteúdo verticalmente
            ['A', 'B', 'C', 'D', 'E'].forEach(col => {
                loansSheet.getCell(`${col}${startRow}`).alignment = { vertical: 'middle', horizontal: 'left' };
            });

            // Preenche as informações em bloco
            loansSheet.getCell(`A${startRow}`).value = client.id;
            loansSheet.getCell(`B${startRow}`).value = client.name;
            loansSheet.getCell(`C${startRow}`).value = { formula: `"${formatCurrency(client.loanValue)}"` }; // Formatado como texto
            loansSheet.getCell(`D${startRow}`).value = { formula: `"${formatCurrency(client.dailyValue)}"` };

            // Preenche as informações secundárias nas linhas abaixo
            loansSheet.getCell(`B${startRow + 1}`).value = 'Status';
            loansSheet.getCell(`C${startRow + 1}`).value = calculateClientStatus(client);
            loansSheet.getCell(`B${startRow + 2}`).value = 'Data Início';
            loansSheet.getCell(`C${startRow + 2}`).value = client.startDate ? new Date(client.startDate) : null;
            loansSheet.getCell(`D${startRow + 2}`).value = 'Nº de Parcelas';
            loansSheet.getCell(`E${startRow + 2}`).value = client.installments;
            loansSheet.getCell(`B${startRow + 3}`).value = 'Saldo';
            loansSheet.getCell(`C${startRow + 3}`).value = { formula: `"${formatCurrency(client.saldo)}"` };
            loansSheet.getCell(`B${startRow + 4}`).value = 'Data Final Estimada';
            const endDate = client.paymentDates && client.paymentDates.length > 0 ? new Date(client.paymentDates[client.paymentDates.length - 1].date) : null;
            loansSheet.getCell(`C${startRow + 4}`).value = endDate;
            loansSheet.getCell(`D${startRow + 4}`).value = 'Frequência';
            loansSheet.getCell(`E${startRow + 4}`).value = client.frequency;

            // Calcula e preenche a data de quitação
            if (client.paymentDates && client.paymentDates.every(p => p.status === 'paid')) {
                const paidDates = client.paymentDates.map(p => new Date(p.paidAt)).filter(d => !isNaN(d));
                if (paidDates.length > 0) {
                    loansSheet.getCell(`E${startRow}`).value = new Date(Math.max.apply(null, paidDates));
                }
            }


            // Preenche o bloco de datas e colore as células
            if (client.paymentDates) {
                client.paymentDates.forEach((p, index) => {
                    const rowOffset = Math.floor(index / DATES_PER_ROW);
                    const colOffset = index % DATES_PER_ROW;
                    const cell = loansSheet.getCell(startRow + rowOffset, 6 + colOffset); // Coluna F em diante

                    cell.value = new Date(p.date);
                    cell.numFmt = 'dd/mm/yyyy';

                    // Aplica a cor baseada no status
                    if (p.status === 'paid') {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'D1E7DD' } };
                    } else if (p.status === 'late') {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'F8D7DA' } };
                    } else if (p.status === 'pending') {
                        cell.fill = { type: 'pattern', pattern: 'solid', fgColor: { argb: 'FFF3CD' } };
                    }
                });
            }

            currentRow += BLOCK_HEIGHT + 1; // Pula para o próximo bloco com uma linha de espaço
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