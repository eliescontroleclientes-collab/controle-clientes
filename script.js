document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('isAuthenticated') !== 'true') {
        window.location.href = '/login.html';
        return;
    }

    // ADICIONE ESSA LINHA AQUI:
    const token = sessionStorage.getItem('authToken');

    // NOVA VARIÁVEL GLOBAL
    let globalHolidays = [];

    // --- ELEMENTOS DO DOM ---
    const clientListBody = document.getElementById('client-list-body');
    const panelPlaceholder = document.getElementById('panel-placeholder');
    const panelDetails = document.getElementById('panel-details');
    const markPaidBtn = document.getElementById('mark-paid-btn');
    const calendar = document.getElementById('payment-calendar');
    const editClientBtn = document.getElementById('edit-client-btn');
    const deleteClientBtn = document.getElementById('delete-client-btn');
    const searchInput = document.getElementById('searchInput');
    const downloadSheetBtn = document.getElementById('download-sheet-btn');
    const downloadSpinner = document.getElementById('download-spinner');

    const filterActiveBtn = document.getElementById('filter-active-btn');
    const filterSettledBtn = document.getElementById('filter-settled-btn');
    const filterOverdueBtn = document.getElementById('filter-overdue-btn');
    const filterClearBtn = document.getElementById('filter-clear-btn');
    const activeCountSpan = document.getElementById('active-count');
    const settledCountSpan = document.getElementById('settled-count');
    const overdueCountSpan = document.getElementById('overdue-count');
    const openReportBtn = document.getElementById('open-report-btn');
    const reportModalEl = document.getElementById('reportModal');
    const reportStartDate = document.getElementById('reportStartDate');
    const reportEndDate = document.getElementById('reportEndDate');
    const generateReportBtn = document.getElementById('generate-report-btn');
    const reportResultDiv = document.getElementById('report-result');
    const reportTotalValue = document.getElementById('report-total-value');
    const reportCount = document.getElementById('report-count');
    const reportSpinner = document.getElementById('report-spinner');
    const quickDateBtns = document.querySelectorAll('.quick-date-btn');
    const clientReportBtn = document.getElementById('client-report-btn');
    const clientReportModalEl = document.getElementById('clientReportModal');
    const clientReportText = document.getElementById('clientReportText');
    const copyClientReportBtn = document.getElementById('copy-client-report-btn');

    // ELEMENTOS DO PAINEL DE DETALHES
    const fileList = document.getElementById('file-list');
    const uploadFileForm = document.getElementById('upload-file-form');
    const fileInput = document.getElementById('file-input');
    const uploadBtn = document.getElementById('upload-btn');
    const uploadProgressBarContainer = document.getElementById('upload-progress-bar-container');
    const uploadProgressBar = document.getElementById('upload-progress-bar');
    const panelBalance = document.getElementById('panel-balance');
    const panelProfession = document.getElementById('panel-profession');
    const panelNeighborhood = document.getElementById('panel-neighborhood');
    const panelLocation = document.getElementById('panel-location');
    const settlementDateRow = document.getElementById('settlement-date-row');
    const panelSettlementDate = document.getElementById('panel-settlement-date');
    const panelFirstInstallmentDate = document.getElementById('panel-first-installment-date');
    const observationsTextarea = document.getElementById('observations-textarea');
    const editObservationsBtn = document.getElementById('edit-observations-btn');
    const saveObservationsBtn = document.getElementById('save-observations-btn');
    const generateCollectionBtn = document.getElementById('generate-collection-btn');
    const collectionModalEl = document.getElementById('collectionModal');
    const generateCollectionTextBtn = document.getElementById('generate-collection-text-btn');
    const collectionObservationInput = document.getElementById('collectionObservation');
    const collectionResultModalEl = document.getElementById('collectionResultModal');
    const collectionResultText = document.getElementById('collectionResultText');
    const copyCollectionTextBtn = document.getElementById('copy-collection-text-btn');
    const reminderQueueModalEl = document.getElementById('reminderQueueModal');
    const reminderQueueList = document.getElementById('reminder-queue-list');
    const pauseReminderBtn = document.getElementById('pause-reminder-btn');
    const reminderStatusContainer = document.getElementById('reminder-status-container');
    const reminderPausedDateEl = document.getElementById('reminder-paused-date');
    const removePauseBtn = document.getElementById('remove-pause-btn');
    const pauseReminderModalEl = document.getElementById('pauseReminderModal');
    const pauseDateInput = document.getElementById('pauseDateInput');
    const savePauseBtn = document.getElementById('save-pause-btn');
    const renewalBtn = document.getElementById('renewal-btn');
    const renewalModalEl = document.getElementById('renewalModal');
    const renewalTextResult = document.getElementById('renewalTextResult');
    const copyRenewalBtn = document.getElementById('copy-renewal-btn');
    // --- ELEMENTOS DO MODAL DE ADIÇÃO ---
    const addClientModalEl = document.getElementById('addClientModal');
    const addClientForm = document.getElementById('add-client-form');
    const clientIdInput = document.getElementById('clientId');
    const clientCPFInput = document.getElementById('clientCPF');
    const clientPhoneInput = document.getElementById('clientPhone');
    const locationInput = document.getElementById('location');
    const neighborhoodInput = document.getElementById('neighborhood');
    const professionInput = document.getElementById('profession');
    const loanValueInput = document.getElementById('loanValue');
    const installmentsInput = document.getElementById('installments');
    const installmentValueInput = document.getElementById('installmentValue');
    const freqDailyRadio = document.getElementById('freqDaily');
    const freqWeeklyRadio = document.getElementById('freqWeekly');
    const newClientDropZone = document.getElementById('new-client-drop-zone');
    const newClientFileInput = document.getElementById('new-client-file-input');
    const newClientFileList = document.getElementById('new-client-file-list');
    const saveClientBtn = document.getElementById('save-client-btn');
    const clientUsernameInput = document.getElementById('clientUsername');
    const clientPasswordInput = document.getElementById('clientPassword');
    const interestRateClientInput = document.getElementById('interestRateClientInput');
    // --- ELEMENTOS DO MODAL DE EDIÇÃO ---
    const editClientModalEl = document.getElementById('editClientModal');
    const editClientForm = document.getElementById('edit-client-form');
    const editClientIdDisplay = document.getElementById('editClientIdDisplay');
    const editClientCPFInput = document.getElementById('editClientCPF');
    const editClientPhoneInput = document.getElementById('editClientPhone');
    const editLocationInput = document.getElementById('editLocation');
    const editNeighborhoodInput = document.getElementById('editNeighborhood');
    const editProfessionInput = document.getElementById('editProfession');
    const editLoanValueInput = document.getElementById('editLoanValue');
    const editInstallmentsInput = document.getElementById('editInstallments');
    const editInstallmentValueInput = document.getElementById('editInstallmentValue');
    const editFreqWeeklyRadio = document.getElementById('editFreqWeekly');
    const unlockEditBtn = document.getElementById('unlock-edit-btn');
    const saveEditBtn = document.getElementById('save-edit-btn');
    const editClientUsernameInput = document.getElementById('editClientUsername');
    const editClientPasswordInput = document.getElementById('editClientPassword');
    const editInterestRateClientInput = document.getElementById('editInterestRateClientInput');
    // --- ELEMENTOS DO RELÓGIO E MODAIS DE PAGAMENTO/SENHA ---
    const clockTimeEl = document.getElementById('clock-time');
    const clockDateEl = document.getElementById('clock-date');
    const paymentModalEl = document.getElementById('paymentModal');
    const paymentModalTitle = document.getElementById('paymentModalTitle');
    const paymentValueInput = document.getElementById('paymentValueInput');
    const paymentDateInput = document.getElementById('paymentDateInput');
    const registerPaymentBtn = document.getElementById('registerPaymentBtn');
    const registerPaymentForm = document.getElementById('register-payment-form');
    const paymentListContainer = document.getElementById('payment-list-container');
    const passwordModalEl = document.getElementById('passwordModal');
    const passwordForm = document.getElementById('password-form');
    const passwordInput = document.getElementById('passwordInput');
    const passwordError = document.getElementById('password-error');
    const resetPaymentsBtn = document.getElementById('reset-payments-btn');
    const confirmationModalEl = document.getElementById('confirmationModal');
    const confirmationModalTitle = document.getElementById('confirmationModalTitle');
    const confirmationModalBody = document.getElementById('confirmationModalBody');
    const confirmActionBtn = document.getElementById('confirmActionBtn');
    const reminderBtn = document.getElementById('reminder-btn');
    const pixKeySetupModalEl = document.getElementById('pixKeySetupModal');
    const pixKeyInput = document.getElementById('pixKeyInput');
    const savePixKeyBtn = document.getElementById('save-pix-key-btn');
    const reminderConfirmationModalEl = document.getElementById('reminderConfirmationModal');
    const reminderCountText = document.getElementById('reminder-count-text');
    const pixKeyDisplay = document.getElementById('pixKeyDisplay');
    const changePixKeyBtn = document.getElementById('change-pix-key-btn');
    const sendRemindersBtn = document.getElementById('send-reminders-btn');
    const paginationControls = document.getElementById('pagination-controls');
    const holidayBtn = document.getElementById('holiday-btn');
    const holidayModalEl = document.getElementById('holidayModal');
    const holidayList = document.getElementById('holidayList');
    const addHolidayForm = document.getElementById('add-holiday-form');
    const holidayDateInput = document.getElementById('holidayDateInput');

    // --- ESTADO DA APLICAÇÃO ---
    let clients = [];
    let selectedClientId = null;
    let allClientsForSearch = [];
    let currentPage = 1;
    const clientsPerPage = 15;
    let totalClients = 0;
    let newClientFiles = [];
    let clientsToRemind = [];
    let pendingSecureAction = null;
    let actionToConfirm = null;
    let originalFinancialData = {};
    let currentInstallmentDate = null;
    let activeClients = [];
    let settledClients = [];
    let overdueClients = [];
    // ### INÍCIO DA ADIÇÃO ###
    let activeFilterButton = null; // Guarda qual botão de filtro está ativo
    // ### FIM DA ADIÇÃO ###

    // --- FUNÇÕES DE MÁSCARA E FORMATAÇÃO ---
    const formatCPF = (value) => value.replace(/\D/g, '').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    const formatPhone = (value) => {
        let r = value.replace(/\D/g, '');
        r = r.replace(/^0/, '');
        if (r.length > 10) r = r.replace(/^(\d\d)(\d{5})(\d{4}).*/, '($1) $2-$3');
        else if (r.length > 5) r = r.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, '($1) $2-$3');
        else if (r.length > 2) r = r.replace(/^(\d\d)(\d{0,5}).*/, '($1) $2');
        else r = r.replace(/^(\d*)/, '($1');
        return r;
    };
    const formatCurrency = (value) => {
        if (isNaN(value)) return "";
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };
    const parseCurrency = (value) => {
        if (typeof value === 'number') return value;
        return Number(String(value).replace(/[^0-9,-]+/g, "").replace(",", "."));
    };

    // --- FUNÇÕES DE LÓGICA DE NEGÓCIO ---
    function calculateBusinessDays(startDate, endDate) {
        let count = 0;
        const curDate = new Date(startDate.getUTCFullYear(), startDate.getUTCMonth(), startDate.getUTCDate());
        const lastDate = new Date(endDate.getUTCFullYear(), endDate.getUTCMonth(), endDate.getUTCDate());

        while (curDate < lastDate) {
            const dayOfWeek = curDate.getUTCDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                count++;
            }
            curDate.setUTCDate(curDate.getUTCDate() + 1);
        }
        return count;
    }

    function updateInstallmentValue() {
        const loanValue = parseCurrency(loanValueInput.value);
        const installments = parseInt(installmentsInput.value, 10);
        const interestRatePercent = parseFloat(interestRateClientInput.value) || 20;

        if (!isNaN(loanValue) && !isNaN(installments) && installments > 0) {
            const interestMultiplier = 1 + (interestRatePercent / 100);
            const totalLoan = loanValue * interestMultiplier;
            const installmentValue = totalLoan / installments;
            installmentValueInput.value = formatCurrency(installmentValue);
        } else {
            installmentValueInput.value = "";
        }
    }

    function togglePaymentFrequency() {
        const installments = parseInt(installmentsInput.value, 10);
        if (installments <= 9) {
            freqWeeklyRadio.disabled = false;
        } else {
            freqWeeklyRadio.disabled = true;
            freqWeeklyRadio.checked = false;
            freqDailyRadio.checked = true;
        }
    }

    function updateEditInstallmentValue() {
        const loanValue = parseCurrency(editLoanValueInput.value);
        const installments = parseInt(editInstallmentsInput.value, 10);
        const interestRatePercent = parseFloat(editInterestRateClientInput.value) || 20;

        if (!isNaN(loanValue) && !isNaN(installments) && installments > 0) {
            const interestMultiplier = 1 + (interestRatePercent / 100);
            const totalLoan = loanValue * interestMultiplier;
            const installmentValue = totalLoan / installments;
            editInstallmentValueInput.value = formatCurrency(installmentValue);
        } else {
            editInstallmentValueInput.value = "";
        }
    }

    function toggleEditPaymentFrequency() {
        const installments = parseInt(editInstallmentsInput.value, 10);
        if (installments <= 9) {
            editFreqWeeklyRadio.disabled = false;
        } else {
            editFreqWeeklyRadio.disabled = true;
            editFreqWeeklyRadio.checked = false;
            document.getElementById('editFreqDaily').checked = true;
        }
    }

    function generatePaymentDates(startDateStr, installments, frequency) {
        if (!startDateStr || !installments || !frequency) return [];
        const paymentDates = [];

        let currentDate;

        // Funçãozinha auxiliar para checar se é feriado (usa a variável que criamos no passo anterior)
        const isHoliday = (dateObj) => {
            const dateString = dateObj.toISOString().split('T')[0];
            return globalHolidays.includes(dateString);
        };

        // --- CONFIGURAÇÃO DA DATA INICIAL ---

        if (frequency === 'daily') {
            let firstDate = new Date(startDateStr + 'T00:00:00Z');
            firstDate.setUTCDate(firstDate.getUTCDate() + 1);

            // Avança se for Sábado (6), Domingo (0) OU Feriado (isHoliday)
            while (firstDate.getUTCDay() === 0 || firstDate.getUTCDay() === 6 || isHoliday(firstDate)) {
                firstDate.setUTCDate(firstDate.getUTCDate() + 1);
            }
            currentDate = firstDate;
        }
        else if (frequency === 'weekly') {
            let firstDate = new Date(startDateStr + 'T00:00:00Z');
            firstDate.setUTCDate(firstDate.getUTCDate() + 7);
            // Semanal geralmente não pula feriado automaticamente na regra padrão, 
            // mas se quiser pular, basta adicionar o while aqui igual ao daily.
            currentDate = firstDate;
        }
        else if (frequency === 'biweekly') {
            let firstDate = new Date(startDateStr + 'T00:00:00Z');
            firstDate.setUTCDate(firstDate.getUTCDate() + 15);

            // Avança se for Sábado (6), Domingo (0) OU Feriado
            while (firstDate.getUTCDay() === 0 || firstDate.getUTCDay() === 6 || isHoliday(firstDate)) {
                firstDate.setUTCDate(firstDate.getUTCDate() + 1);
            }
            currentDate = firstDate;
        }
        else if (frequency === 'monthly') {
            let firstDate = new Date(startDateStr + 'T00:00:00Z');
            firstDate.setUTCMonth(firstDate.getUTCMonth() + 1);

            // Avança se for Sábado (6), Domingo (0) OU Feriado
            while (firstDate.getUTCDay() === 0 || firstDate.getUTCDay() === 6 || isHoliday(firstDate)) {
                firstDate.setUTCDate(firstDate.getUTCDate() + 1);
            }
            currentDate = firstDate;
        } else {
            return [];
        }

        // --- GERAÇÃO DAS DATAS ---

        if (frequency === 'daily') {
            let businessDaysCount = 0;
            while (businessDaysCount < installments) {
                const dayOfWeek = currentDate.getUTCDay();

                // Só conta como parcela válida se NÃO for Domingo, NÃO for Sábado E NÃO for Feriado
                if (dayOfWeek !== 0 && dayOfWeek !== 6 && !isHoliday(currentDate)) {
                    businessDaysCount++;
                    paymentDates.push({ date: new Date(currentDate).toISOString(), status: 'pending' });
                }
                currentDate.setUTCDate(currentDate.getUTCDate() + 1);
            }
        }
        else if (frequency === 'weekly') {
            for (let i = 0; i < installments; i++) {
                paymentDates.push({ date: new Date(currentDate).toISOString(), status: 'pending' });
                currentDate.setUTCDate(currentDate.getUTCDate() + 7);
            }
        }
        else if (frequency === 'biweekly') {
            for (let i = 0; i < installments; i++) {
                paymentDates.push({ date: new Date(currentDate).toISOString(), status: 'pending' });

                currentDate.setUTCDate(currentDate.getUTCDate() + 15);

                // Ajusta se cair no fim de semana OU Feriado
                while (currentDate.getUTCDay() === 0 || currentDate.getUTCDay() === 6 || isHoliday(currentDate)) {
                    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
                }
            }
        }
        else if (frequency === 'monthly') {
            for (let i = 0; i < installments; i++) {
                paymentDates.push({ date: new Date(currentDate).toISOString(), status: 'pending' });

                currentDate.setUTCMonth(currentDate.getUTCMonth() + 1);

                // Ajusta se cair no fim de semana OU Feriado
                while (currentDate.getUTCDay() === 0 || currentDate.getUTCDay() === 6 || isHoliday(currentDate)) {
                    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
                }
            }
        }

        return paymentDates;
    }

    function calculateClientStatus(client) {
        if (!client.paymentDates || client.paymentDates.length === 0) {
            return '<span class="badge bg-secondary">Sem dados</span>';
        }

        const allPaid = client.paymentDates.every(p => p.status === 'paid');
        if (allPaid) {
            return '<span class="badge bg-dark">Empréstimo Concluído</span>';
        }
        return getFinancialStatus(client);
    }

    function getFinancialStatus(client) {
        const timeZone = 'America/Cuiaba';
        const todayInCuiaba = new Date().toLocaleDateString('en-CA', { timeZone });
        const cuiabaTodayUTCMidnight = new Date(todayInCuiaba + 'T00:00:00.000Z').getTime();

        let lateCount = 0;
        let isPendingToday = false;
        let advancedCount = 0;

        (client.paymentDates || []).forEach(p => {
            const paymentDateTime = new Date(p.date).getTime();
            if (p.status !== 'paid') {
                if (paymentDateTime < cuiabaTodayUTCMidnight) {
                    lateCount++;
                } else if (paymentDateTime === cuiabaTodayUTCMidnight) {
                    isPendingToday = true;
                }
            } else {
                if (paymentDateTime > cuiabaTodayUTCMidnight) {
                    advancedCount++;
                }
            }
        });

        if (lateCount > 0) {
            let statusText = `<span class="badge bg-danger">Atrasado (${lateCount})</span>`;
            if (isPendingToday) {
                statusText += ` <span class="badge bg-warning text-dark">Pendente Hoje</span>`;
            }
            return statusText;
        }
        if (isPendingToday) {
            return '<span class="badge bg-warning text-dark">Pendente</span>';
        }
        if (advancedCount > 0) {
            return `<span class="badge bg-info text-dark">Adiantado (${advancedCount})</span>`;
        }
        return '<span class="badge bg-success">Em Dia</span>';
    }

    // --- FUNÇÕES DE API ---
    async function loadClients() {
        try {
            // MUDANÇA AQUI: Adicionado o segundo parâmetro com headers
            const response = await fetch(`/api/clients?page=${currentPage}&limit=${clientsPerPage}`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) throw new Error('Falha ao carregar clientes.');
            const data = await response.json();
            clients = data.clients;
            totalClients = data.total;

            renderClientList();
            renderPaginationControls();
            fetchAllClientsForSearch();
        } catch (error) {
            console.error('Erro em loadClients:', error);
            alert('Não foi possível carregar os clientes do servidor.');
        }
    }

    async function updateClient(clientData) {
        try {
            const response = await fetch('/api/clients', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // <--- ADICIONE ESSA LINHA
                },
                body: JSON.stringify(clientData),
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Falha ao atualizar cliente.');
            }
            return await response.json();
        } catch (error) {
            console.error('Erro em updateClient:', error);
            alert('Não foi possível salvar as alterações do cliente.');
        }
    }

    // --- FUNÇÕES DE RENDERIZAÇÃO ---
    function renderClientList(clientsToRender = clients) {
        clientListBody.innerHTML = '';
        if (clientsToRender.length === 0) {
            const message = (searchInput.value || filterClearBtn.classList.contains('d-none') === false)
                ? 'Nenhum cliente encontrado para o filtro aplicado.'
                : 'Nenhum cliente cadastrado.';
            clientListBody.innerHTML = `<tr><td colspan="4" class="text-center text-muted">${message}</td></tr>`;
            return;
        }
        clientsToRender.forEach(client => {
            const tr = document.createElement('tr');
            tr.dataset.clientId = client.id;
            tr.className = client.id === selectedClientId ? 'table-active' : '';
            const status = calculateClientStatus(client);
            const startDateDisplay = client.startDate ? new Date(client.startDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A';
            tr.innerHTML = `<td>#${client.id}</td><td>${client.name}</td><td>${status}</td><td>${startDateDisplay}</td>`;
            clientListBody.appendChild(tr);
        });
    }

    function renderClientPanel(clientId) {
        const client = allClientsForSearch.find(c => c.id === clientId);
        if (!client) {
            panelPlaceholder.classList.remove('d-none');
            panelDetails.classList.add('d-none');
            selectedClientId = null;
            // ### INÍCIO DA ALTERAÇÃO ###
            // Remove a lógica de renderização da lista daqui para centralizar em 'updateClientData'
            // ### FIM DA ALTERAÇÃO ###
            return;
        }
        selectedClientId = clientId;
        panelPlaceholder.classList.add('d-none');
        panelDetails.classList.remove('d-none');
        document.getElementById('panel-id').textContent = `#${client.id}`;
        document.getElementById('panel-name').textContent = client.name;
        const formattedCPF = client.cpf ? formatCPF(client.cpf) : 'N/A';
        const formattedPhone = client.phone ? formatPhone(client.phone) : 'N/A';
        document.getElementById('panel-cpf-phone').textContent = `CPF: ${formattedCPF} | Tel: ${formattedPhone}`;
        document.getElementById('panel-status').innerHTML = calculateClientStatus(client);
        // Lógica do Botão de Renovação (R)
        // Condição: Nenhuma parcela paga (significa que é novo ou recém renovado/resetado)
        const paidInstallmentsCount = (client.paymentDates || []).filter(p => p.status === 'paid').length;

        if (paidInstallmentsCount === 0) {
            renewalBtn.classList.remove('d-none');
        } else {
            renewalBtn.classList.add('d-none');
        }
        // Lógica de Visualização da Pausa (ATUALIZADA)
        const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Cuiaba' });
        // Garante que pegamos só a parte YYYY-MM-DD da data do banco
        const pauseDateClean = client.reminder_paused_until ? client.reminder_paused_until.split('T')[0] : null;

        // MUDANÇA: Trocamos o '>=' por '>'
        // "Se a data da pausa for MAIOR que hoje (futuro), então mostra o aviso."
        // "Se for IGUAL ou MENOR (hoje ou passado), esconde o aviso e libera."
        if (pauseDateClean && pauseDateClean > todayStr) {
            // Está pausado
            reminderStatusContainer.classList.remove('d-none');
            pauseReminderBtn.classList.add('d-none');

            const pauseDateParts = pauseDateClean.split('-');
            reminderPausedDateEl.textContent = `${pauseDateParts[2]}/${pauseDateParts[1]}/${pauseDateParts[0]}`;
        } else {
            // Não está pausado (ou a data chegou/passou)
            reminderStatusContainer.classList.add('d-none');
            pauseReminderBtn.classList.remove('d-none');
        }

        panelProfession.textContent = client.profissao || 'N/A';
        panelNeighborhood.textContent = client.bairro || 'N/A';
        if (client.localizacao) {
            panelLocation.textContent = 'Ver no mapa';
            panelLocation.href = client.localizacao;
            panelLocation.parentElement.style.display = 'block';
        } else {
            panelLocation.parentElement.style.display = 'none';
        }

        const allPaid = client.paymentDates && client.paymentDates.every(p => p.status === 'paid');
        if (allPaid) {
            const paidDates = (client.paymentDates || [])
                .flatMap(p => p.payments || [])
                .map(pm => new Date(pm.paidAt))
                .filter(d => !isNaN(d));
            if (paidDates.length > 0) {
                const lastPaymentDate = new Date(Math.max.apply(null, paidDates));
                panelSettlementDate.textContent = lastPaymentDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
                settlementDateRow.style.display = 'block';
            }
        } else {
            settlementDateRow.style.display = 'none';
        }

        document.getElementById('panel-loan-value').textContent = formatCurrency(client.loanValue || 0);
        document.getElementById('panel-daily-value').textContent = formatCurrency(client.dailyValue || 0);
        document.getElementById('panel-interest-rate').textContent = `${parseFloat(client.taxa_juros || 20).toFixed(2)}%`;
        document.getElementById('panel-start-date').textContent = client.startDate ? new Date(client.startDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A';
        if (client.paymentDates && client.paymentDates.length > 0) {
            const firstInstallment = new Date(client.paymentDates[0].date);
            panelFirstInstallmentDate.textContent = firstInstallment.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
            const lastInstallment = new Date(client.paymentDates[client.paymentDates.length - 1].date);
            document.getElementById('panel-end-date').textContent = lastInstallment.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        } else {
            panelFirstInstallmentDate.textContent = 'N/A';
            document.getElementById('panel-end-date').textContent = 'N/A';
        }
        panelBalance.textContent = formatCurrency(client.saldo || 0);
        panelBalance.className = (client.saldo > 0) ? 'text-success fw-bold' : 'fw-bold';

        const calendarTitle = document.querySelector('#panel-details h6:nth-of-type(3)');
        // Cria um mapa de nomes para ficar bonito
        const freqNames = {
            'daily': 'Diário',
            'weekly': 'Semanal',
            'biweekly': 'Quinzenal',
            'monthly': 'Mensal'
        };
        const freqLabel = freqNames[client.frequency] || 'Diário'; // Padrão se não achar
        calendarTitle.textContent = `Calendário de Pagamentos (${client.installments || ''}x ${freqLabel})`;

        calendar.innerHTML = '';
        if (!client.startDate || !client.paymentDates || client.paymentDates.length === 0) {
            calendar.innerHTML = '<p class="text-center text-muted">Preencha os dados financeiros para gerar o calendário.</p>';
        } else {
            const paymentDates = client.paymentDates.map(p => new Date(p.date));
            const firstPaymentDate = paymentDates[0];
            const lastPaymentDate = paymentDates[paymentDates.length - 1];
            let currentDate = new Date(firstPaymentDate);
            while (currentDate.getUTCDay() !== 1) {
                currentDate.setUTCDate(currentDate.getUTCDate() - 1);
            }
            let calendarEndDate = new Date(lastPaymentDate);
            while (calendarEndDate.getUTCDay() !== 0) {
                calendarEndDate.setUTCDate(calendarEndDate.getUTCDate() + 1);
            }
            const timeZone = 'America/Cuiaba';
            const todayInCuiaba = new Date().toLocaleDateString('en-CA', { timeZone });
            const cuiabaTodayUTCMidnight = new Date(todayInCuiaba + 'T00:00:00.000Z').getTime();
            while (currentDate <= calendarEndDate) {
                const dayDiv = document.createElement('div');
                const dayOfWeek = currentDate.getUTCDay();
                dayDiv.textContent = currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });
                dayDiv.classList.add('calendar-day');

                const payment = client.paymentDates.find(p => new Date(p.date).setUTCHours(0, 0, 0, 0) === new Date(currentDate).setUTCHours(0, 0, 0, 0));

                if (payment) {
                    dayDiv.dataset.date = payment.date;
                    const paymentDateMidnight = new Date(payment.date).getTime();

                    if (payment.status === 'paid') {
                        dayDiv.classList.add('status-paid');
                    } else if (paymentDateMidnight < cuiabaTodayUTCMidnight) {
                        dayDiv.classList.add('status-late');
                    } else {
                        dayDiv.classList.add('status-pending');
                    }
                } else if (dayOfWeek === 0 || dayOfWeek === 6) {
                    dayDiv.classList.add('status-weekend');
                } else {
                    dayDiv.classList.add('status-future');
                }
                calendar.appendChild(dayDiv);
                currentDate.setUTCDate(currentDate.getUTCDate() + 1);
            }
        }
        fileList.innerHTML = '';
        if (client.files && client.files.length > 0) {
            client.files.forEach(file => {
                const li = document.createElement('li');
                li.className = 'list-group-item d-flex justify-content-between align-items-center';
                li.innerHTML = `<span><i class="bi bi-file-earmark-text"></i> ${file.name}</span><div><a href="${file.url}" target="_blank" class="btn btn-outline-primary btn-sm" title="Ver Arquivo"><i class="bi bi-eye"></i></a> <button class="btn btn-outline-danger btn-sm delete-file-btn" data-filename="${file.name}" title="Excluir Arquivo"><i class="bi bi-trash"></i></button></div>`;
                fileList.appendChild(li);
            });
        } else {
            fileList.innerHTML = '<li class="list-group-item text-muted">Nenhum arquivo encontrado.</li>';
        }

        observationsTextarea.value = client.observacoes || '';
        observationsTextarea.readOnly = true;
        editObservationsBtn.classList.remove('d-none');
        saveObservationsBtn.classList.add('d-none');

        const timeZone = 'America/Cuiaba';
        const todayInCuiaba = new Date().toLocaleDateString('en-CA', { timeZone });
        const cuiabaTodayUTCMidnight = new Date(todayInCuiaba + 'T00:00:00.000Z').getTime();
        const lateCount = (client.paymentDates || []).filter(p => new Date(p.date).getTime() < cuiabaTodayUTCMidnight && p.status !== 'paid').length;

        if (lateCount >= 1) {
            generateCollectionBtn.disabled = false;
            generateCollectionBtn.title = "Gerar Aviso de Cobrança";
        } else {
            generateCollectionBtn.disabled = true;
            generateCollectionBtn.title = "Disponível apenas para clientes com parcelas em atraso.";
        }

        // ### INÍCIO DA ALTERAÇÃO ###
        // A lógica de renderização da lista foi movida para a função `updateClientData`
        // e para os próprios filtros, então este bloco não é mais necessário aqui.
        // ### FIM DA ALTERAÇÃO ###
    }

    function handleNewFiles(files) {
        for (const file of files) {
            if (!newClientFiles.some(f => f.name === file.name && f.size === file.size)) newClientFiles.push(file);
        }
        renderNewClientFileList();
    }

    function renderNewClientFileList() {
        newClientFileList.innerHTML = '';
        if (newClientFiles.length === 0) return;
        newClientFiles.forEach((file, index) => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';
            li.innerHTML = `<span><i class="bi bi-file-earmark-zip"></i> ${file.name}</span><button type="button" class="btn-close" aria-label="Remover" data-index="${index}"></button>`;
            newClientFileList.appendChild(li);
        });
    }

    async function fetchAllClientsForSearch() {
        try {
            // MUDANÇA AQUI:
            const response = await fetch(`/api/clients?page=1&limit=9999`, {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });
            const data = await response.json();
            allClientsForSearch = data.clients;
            updateFilterPanel();
        } catch (error) {
            console.error('Erro ao buscar todos os clientes para pesquisa:', error);
        }
    }

    function renderPaginationControls() {
        paginationControls.innerHTML = '';
        const totalPages = Math.ceil(totalClients / clientsPerPage);

        if (totalPages <= 1) return;

        // Função auxiliar para criar o HTML do botão
        const createPageItem = (text, pageNumber, isActive = false, isDisabled = false) => {
            const li = document.createElement('li');
            li.className = `page-item ${isActive ? 'active' : ''} ${isDisabled ? 'disabled' : ''}`;

            // Se for desativado (como "..."), não colocamos data-page para não ser clicável
            const dataAttr = isDisabled ? '' : `data-page="${pageNumber}"`;
            li.innerHTML = `<a class="page-link" href="#" ${dataAttr}>${text}</a>`;
            return li;
        };

        // 1. Botão "Anterior"
        paginationControls.appendChild(createPageItem('Anterior', currentPage - 1, false, currentPage === 1));

        // Lógica para definir quais números mostrar
        const pagesToShow = [];

        // Sempre mostra a página 1
        pagesToShow.push(1);

        // Define o intervalo ao redor da página atual (ex: 2 antes e 2 depois)
        let startPage = Math.max(2, currentPage - 2);
        let endPage = Math.min(totalPages - 1, currentPage + 2);

        // Se houver um buraco grande entre o 1 e o início do intervalo, adiciona "..."
        if (startPage > 2) {
            pagesToShow.push('...');
        }

        // Adiciona as páginas do intervalo
        for (let i = startPage; i <= endPage; i++) {
            pagesToShow.push(i);
        }

        // Se houver um buraco grande entre o fim do intervalo e a última página, adiciona "..."
        if (endPage < totalPages - 1) {
            pagesToShow.push('...');
        }

        // Sempre mostra a última página (se não for a 1)
        if (totalPages > 1) {
            pagesToShow.push(totalPages);
        }

        // 2. Renderiza os números calculados
        pagesToShow.forEach(page => {
            if (page === '...') {
                paginationControls.appendChild(createPageItem('...', null, false, true));
            } else {
                paginationControls.appendChild(createPageItem(page, page, page === currentPage));
            }
        });

        // 3. Botão "Próximo"
        paginationControls.appendChild(createPageItem('Próximo', currentPage + 1, false, currentPage === totalPages));
    }

    function filterClientList() {
        const searchTerm = searchInput.value.toLowerCase();
        // ### INÍCIO DA ALTERAÇÃO ###
        activeFilterButton = null; // Limpa o filtro de botão quando a busca por texto é usada
        // ### FIM DA ALTERAÇÃO ###
        if (!searchTerm) {
            renderClientList();
            paginationControls.style.display = 'flex';
            filterClearBtn.classList.add('d-none');
            return;
        }

        paginationControls.style.display = 'none';
        filterClearBtn.classList.remove('d-none');

        const filteredClients = allClientsForSearch.filter(client => {
            const idMatch = client.id.toString().toLowerCase().includes(searchTerm);
            const nameMatch = client.name.toLowerCase().includes(searchTerm);
            return idMatch || nameMatch;
        });

        renderClientList(filteredClients);
    }

    function updateFilterPanel() {
        activeClients = [];
        settledClients = [];
        overdueClients = [];

        allClientsForSearch.forEach(client => {
            const status = calculateClientStatus(client);
            if (status.includes('Empréstimo Concluído')) {
                settledClients.push(client);
            } else {
                activeClients.push(client);
            }
            if (status.includes('Atrasado')) {
                overdueClients.push(client);
            }
        });

        activeCountSpan.textContent = activeClients.length;
        settledCountSpan.textContent = settledClients.length;
        overdueCountSpan.textContent = overdueClients.length;
    }

    function handleFilterClick(clientsToShow, buttonEl) {
        searchInput.value = '';
        renderClientList(clientsToShow);
        paginationControls.style.display = 'none';
        filterClearBtn.classList.remove('d-none');
        // ### INÍCIO DA ALTERAÇÃO ###
        activeFilterButton = buttonEl; // Guarda qual botão foi clicado
        // ### FIM DA ALTERAÇÃO ###
    }

    filterActiveBtn.addEventListener('click', () => handleFilterClick(activeClients, filterActiveBtn));

    filterSettledBtn.addEventListener('click', () => handleFilterClick(settledClients, filterSettledBtn));

    filterOverdueBtn.addEventListener('click', () => {
        const sortedOverdue = [...overdueClients].sort((a, b) => {
            const statusA = calculateClientStatus(a);
            const statusB = calculateClientStatus(b);
            const lateCountA = parseInt((statusA.match(/Atrasado \((\d+)\)/) || [0, 0])[1], 10);
            const lateCountB = parseInt((statusB.match(/Atrasado \((\d+)\)/) || [0, 0])[1], 10);
            return lateCountB - lateCountA;
        });
        handleFilterClick(sortedOverdue, filterOverdueBtn);
    });

    filterClearBtn.addEventListener('click', () => {
        searchInput.value = '';
        filterClearBtn.classList.add('d-none');
        paginationControls.style.display = 'flex';
        // ### INÍCIO DA ALTERAÇÃO ###
        activeFilterButton = null; // Limpa o filtro de botão
        // ### FIM DA ALTERAÇÃO ###
        renderClientList(clients);
    });

    // --- EVENT LISTENERS ---

    paginationControls.addEventListener('click', (e) => {
        e.preventDefault();
        const target = e.target.closest('a');
        if (!target || target.parentElement.classList.contains('disabled') || target.parentElement.classList.contains('active')) {
            return;
        }
        currentPage = parseInt(target.dataset.page, 10);
        loadClients();
    });

    clientCPFInput.addEventListener('input', (e) => e.target.value = formatCPF(e.target.value));
    clientPhoneInput.addEventListener('input', (e) => e.target.value = formatPhone(e.target.value));
    loanValueInput.addEventListener('input', (e) => {
        let digits = e.target.value.replace(/\D/g, '');
        if (digits === "") {
            e.target.value = "";
            updateInstallmentValue();
            return;
        }
        const numberValue = Number(digits) / 100;
        e.target.value = formatCurrency(numberValue);
        updateInstallmentValue();
    });
    installmentsInput.addEventListener('input', () => {
        updateInstallmentValue();
        togglePaymentFrequency();
    });
    interestRateClientInput.addEventListener('input', updateInstallmentValue);
    editClientCPFInput.addEventListener('input', (e) => e.target.value = formatCPF(e.target.value));
    editClientPhoneInput.addEventListener('input', (e) => e.target.value = formatPhone(e.target.value));
    editLoanValueInput.addEventListener('input', (e) => {
        let digits = e.target.value.replace(/\D/g, '');
        if (digits === "") {
            e.target.value = "";
            updateEditInstallmentValue();
            return;
        }
        const numberValue = Number(digits) / 100;
        e.target.value = formatCurrency(numberValue);
        updateEditInstallmentValue();
    });
    editInstallmentsInput.addEventListener('input', () => {
        updateEditInstallmentValue();
        toggleEditPaymentFrequency();
    });

    editInterestRateClientInput.addEventListener('input', updateEditInstallmentValue);

    paymentValueInput.addEventListener('input', (e) => {
        let digits = e.target.value.replace(/\D/g, '');
        if (digits === "") {
            e.target.value = "";
            return;
        }
        const numberValue = Number(digits) / 100;
        e.target.value = formatCurrency(numberValue);
    });

    newClientDropZone.addEventListener('click', () => newClientFileInput.click());
    newClientFileInput.addEventListener('change', (e) => handleNewFiles(e.target.files));
    ['dragenter', 'dragover', 'dragleave', 'drop'].forEach(eventName => newClientDropZone.addEventListener(eventName, (e) => { e.preventDefault(); e.stopPropagation(); }, false));
    newClientDropZone.addEventListener('dragenter', () => newClientDropZone.classList.add('dragover'));
    newClientDropZone.addEventListener('dragleave', () => newClientDropZone.classList.remove('dragover'));
    newClientDropZone.addEventListener('drop', (e) => {
        newClientDropZone.classList.remove('dragover');
        handleNewFiles(e.dataTransfer.files);
    });
    newClientFileList.addEventListener('click', (e) => {
        if (e.target.matches('.btn-close')) {
            const index = parseInt(e.target.dataset.index, 10);
            newClientFiles.splice(index, 1);
            renderNewClientFileList();
        }
    });
    addClientModalEl.addEventListener('hidden.bs.modal', () => {
        addClientForm.reset();
        clientUsernameInput.value = '';
        clientPasswordInput.value = '';
        newClientFiles = [];
        renderNewClientFileList();
        togglePaymentFrequency();
    });

    addClientForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const saveBtnSpinner = saveClientBtn.querySelector('.spinner-border');
        saveClientBtn.disabled = true;
        saveBtnSpinner.style.display = 'inline-block';

        const installments = parseInt(installmentsInput.value);
        const frequency = document.querySelector('input[name="paymentFrequency"]:checked').value;
        const startDate = document.getElementById('startDate').value || null;

        const clientData = {
            id: parseInt(clientIdInput.value, 10),
            name: document.getElementById('clientName').value,
            startDate: startDate,
            cpf: clientCPFInput.value.replace(/\D/g, ''),
            phone: clientPhoneInput.value.replace(/\D/g, ''),
            loanValue: parseCurrency(loanValueInput.value),
            dailyValue: parseCurrency(installmentValueInput.value),
            installments: installments,
            frequency: frequency,
            paymentDates: generatePaymentDates(startDate, installments, frequency),
            localizacao: locationInput.value,
            bairro: neighborhoodInput.value,
            profissao: professionInput.value,
            taxa_juros: parseFloat(interestRateClientInput.value) || 20,
            original_client_id: null
        };

        try {
            const response = await fetch('/api/clients', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // <--- ADICIONE ESSA LINHA
                },
                body: JSON.stringify(clientData),
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Falha ao criar o registro do cliente.');
            }
            const newClient = await response.json();

            const clientUsername = clientUsernameInput.value.trim();
            const clientPassword = clientPasswordInput.value.trim();

            if (clientUsername && clientPassword) {
                try {
                    const loginResponse = await fetch('/api/client-auth', {
                        method: 'PUT',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify({
                            clientId: newClient.id,
                            username: clientUsername,
                            password: clientPassword
                        })
                    });
                    if (!loginResponse.ok) {
                        const loginError = await loginResponse.json();
                        alert(`Cliente #${newClient.id} criado, mas falha ao criar o login: ${loginError.error}`);
                    }
                } catch (loginError) {
                    alert(`Cliente #${newClient.id} criado, mas ocorreu um erro de conexão ao criar o login.`);
                }
            }

            if (newClientFiles.length > 0) {
                const uploadPromises = newClientFiles.map(file => {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('clientId', newClient.id);
                    return fetch('/api/upload', { method: 'POST', body: formData });
                });
                await Promise.all(uploadPromises);
            }
            await loadClients();
            loadFinancialSummary();
            bootstrap.Modal.getInstance(addClientModalEl).hide();
        } catch (error) {
            console.error('Erro ao adicionar cliente:', error);
            alert(`Não foi possível adicionar o novo cliente. Erro: ${error.message}`);
        } finally {
            saveClientBtn.disabled = false;
            saveBtnSpinner.style.display = 'none';
        }
    });

    clientListBody.addEventListener('click', (e) => {
        const row = e.target.closest('tr');
        if (row && row.dataset.clientId) {
            const clientId = parseInt(row.dataset.clientId);
            selectedClientId = clientId;
            renderClientPanel(clientId);
        }
    });

    markPaidBtn.addEventListener('click', () => {
        if (selectedClientId === null) return;
        const client = allClientsForSearch.find(c => c.id === selectedClientId);
        if (!client) return;
        currentInstallmentDate = null;
        paymentValueInput.value = formatCurrency(client.dailyValue);
        paymentDateInput.value = new Date().toLocaleDateString('en-CA');
        paymentListContainer.innerHTML = '<p class="text-muted">Nenhum dia selecionado no calendário.</p>';
        new bootstrap.Modal(paymentModalEl).show();
    });

    registerPaymentBtn.addEventListener('click', async () => {
        const paymentValue = parseCurrency(paymentValueInput.value);
        const paymentDate = paymentDateInput.value;

        if (isNaN(paymentValue) || paymentValue <= 0 || !paymentDate) {
            alert('Por favor, insira um valor e uma data válidos.');
            return;
        }

        registerPaymentBtn.disabled = true;

        try {
            const response = await fetch('/api/payments', {
                method: 'POST',
                // ADICIONE AQUI O AUTHORIZATION:
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    clientId: selectedClientId,
                    paymentValue: paymentValue,
                    paymentDate: paymentDate
                })
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Falha ao registrar pagamento.');
            }

            const updatedClient = await response.json();
            updateClientData(updatedClient);
            bootstrap.Modal.getInstance(paymentModalEl).hide();

        } catch (error) {
            console.error('Erro ao registrar pagamento:', error);
            alert(`Erro: ${error.message}`);
        } finally {
            registerPaymentBtn.disabled = false;
        }
    });

    calendar.addEventListener('click', (e) => {
        const dayDiv = e.target.closest('.calendar-day');
        if (!dayDiv || !dayDiv.dataset.date || selectedClientId === null) return;

        const client = allClientsForSearch.find(c => c.id === selectedClientId);
        if (!client) return;

        const clickedDateISO = dayDiv.dataset.date;
        currentInstallmentDate = clickedDateISO;
        const installment = client.paymentDates.find(p => p.date === clickedDateISO);
        paymentValueInput.value = formatCurrency(client.dailyValue);
        paymentDateInput.value = clickedDateISO.split('T')[0];

        paymentListContainer.innerHTML = '';
        if (installment && installment.payments && installment.payments.length > 0) {
            installment.payments.forEach(payment => {
                const paymentItem = document.createElement('div');
                paymentItem.className = 'd-flex justify-content-between align-items-center border-bottom py-2';

                const registeredDate = new Date(payment.registeredDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
                const valueFormatted = formatCurrency(payment.paidValue);

                paymentItem.innerHTML = `
                    <span>Registrado em <strong>${registeredDate}</strong> - Valor: <strong>${valueFormatted}</strong></span>
                    <button class="btn btn-outline-danger btn-sm delete-payment-btn" data-paid-at="${payment.paidAt}">
                        <i class="bi bi-trash"></i>
                    </button>
                `;
                paymentListContainer.appendChild(paymentItem);
            });
        } else {
            paymentListContainer.innerHTML = '<p class="text-muted">Nenhum pagamento registrado para esta data.</p>';
        }

        new bootstrap.Modal(paymentModalEl).show();
    });

    paymentListContainer.addEventListener('click', async (e) => {
        const deleteBtn = e.target.closest('.delete-payment-btn');
        if (!deleteBtn) return;

        const paidAt = deleteBtn.dataset.paidAt;
        if (!selectedClientId || !currentInstallmentDate || !paidAt) return;

        if (!confirm('Tem certeza que deseja excluir este registro de pagamento específico?')) {
            return;
        }

        deleteBtn.disabled = true;

        try {
            const response = await fetch('/api/payments', {
                method: 'DELETE',
                // ADICIONE AQUI O AUTHORIZATION:
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    clientId: selectedClientId,
                    paymentDate: currentInstallmentDate,
                    paidAt: paidAt
                }),
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Falha ao excluir o registro.');
            }

            const updatedClient = await response.json();
            updateClientData(updatedClient);

            const updatedInstallment = updatedClient.paymentDates.find(p => p.date === currentInstallmentDate);
            paymentListContainer.innerHTML = '';
            if (updatedInstallment && updatedInstallment.payments && updatedInstallment.payments.length > 0) {
                updatedInstallment.payments.forEach(payment => {
                    const paymentItem = document.createElement('div');
                    paymentItem.className = 'd-flex justify-content-between align-items-center border-bottom py-2';
                    const registeredDate = new Date(payment.registeredDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' });
                    const valueFormatted = formatCurrency(payment.paidValue);
                    paymentItem.innerHTML = `
                        <span>Registrado em <strong>${registeredDate}</strong> - Valor: <strong>${valueFormatted}</strong></span>
                        <button class="btn btn-outline-danger btn-sm delete-payment-btn" data-paid-at="${payment.paidAt}">
                            <i class="bi bi-trash"></i>
                        </button>
                    `;
                    paymentListContainer.appendChild(paymentItem);
                });
            } else {
                paymentListContainer.innerHTML = '<p class="text-muted">Nenhum pagamento registrado para esta data.</p>';
            }

        } catch (error) {
            console.error('Erro ao excluir pagamento:', error);
            alert(`Erro: ${error.message}`);
        } finally {
            deleteBtn.disabled = false;
        }
    });

    // ### INÍCIO DA ALTERAÇÃO: Função central de atualização de dados e UI ###
    function updateClientData(updatedClient) {
        const clientId = updatedClient.id;

        // Atualiza os dados do cliente nos arrays de cache do frontend
        const clientIndexAll = allClientsForSearch.findIndex(c => c.id === clientId);
        if (clientIndexAll !== -1) {
            allClientsForSearch[clientIndexAll] = updatedClient;
        }

        const clientIndexPaginated = clients.findIndex(c => c.id === clientId);
        if (clientIndexPaginated !== -1) {
            clients[clientIndexPaginated] = updatedClient;
        }

        // Atualiza os painéis e contadores
        updateFilterPanel();
        renderClientPanel(clientId);
        loadFinancialSummary();

        // Lógica para reaplicar o filtro ativo e atualizar a lista
        if (searchInput.value) {
            // Se a busca por texto estiver ativa, reaplica
            filterClientList();
        } else if (activeFilterButton) {
            // Se um botão de filtro estiver ativo, simula o clique nele para recarregar sua lista
            activeFilterButton.click();
        } else {
            // Se nenhum filtro estiver ativo, apenas renderiza a lista paginada atual
            renderClientList();
        }
    }
    // ### FIM DA ALTERAÇÃO ###

    // Função auxiliar para definir datas (Hoje - X dias)
    function setDateRange(daysBack) {
        const end = new Date();
        const start = new Date();
        start.setDate(end.getDate() - daysBack);

        reportEndDate.value = end.toISOString().split('T')[0];
        reportStartDate.value = start.toISOString().split('T')[0];
    }

    // 1. Ao abrir o modal, define o padrão (30 dias)
    openReportBtn.addEventListener('click', () => {
        setDateRange(30); // Padrão: Últimos 30 dias
        reportResultDiv.classList.add('d-none');
        new bootstrap.Modal(reportModalEl).show();
        // Dispara a consulta automaticamente ao abrir
        generateReportBtn.click();
    });

    // 2. Botões Rápidos (7, 15, 30 dias)
    quickDateBtns.forEach(btn => {
        btn.addEventListener('click', (e) => {
            // Remove active de todos e adiciona no clicado
            quickDateBtns.forEach(b => b.classList.remove('active'));
            e.target.classList.add('active');

            const days = parseInt(e.target.dataset.days);
            setDateRange(days);
            generateReportBtn.click(); // Já consulta ao clicar
        });
    });

    // 3. Consultar API
    generateReportBtn.addEventListener('click', async () => {
        const start = reportStartDate.value;
        const end = reportEndDate.value;

        if (!start || !end) {
            alert('Por favor, selecione as datas de início e fim.');
            return;
        }

        // UI Loading
        generateReportBtn.disabled = true;
        reportResultDiv.classList.add('d-none');
        reportSpinner.classList.remove('d-none');

        try {
            const token = sessionStorage.getItem('authToken');
            const response = await fetch(`/api/financial-summary?startDate=${start}&endDate=${end}`, {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) throw new Error('Erro ao buscar relatório.');

            const data = await response.json();

            reportTotalValue.textContent = formatCurrency(data.totalRevenue);
            reportCount.textContent = data.paymentsCount;

            reportSpinner.classList.add('d-none');
            reportResultDiv.classList.remove('d-none');

        } catch (error) {
            console.error(error);
            alert('Erro ao gerar relatório.');
            reportSpinner.classList.add('d-none');
        } finally {
            generateReportBtn.disabled = false;
        }
    });


    editClientBtn.addEventListener('click', () => {
        if (selectedClientId === null) return;
        const client = allClientsForSearch.find(c => c.id === selectedClientId);
        if (!client) return;

        const modal = new bootstrap.Modal(editClientModalEl);

        saveEditBtn.classList.add('d-none');
        unlockEditBtn.classList.remove('d-none');
        const formElements = Array.from(editClientForm.elements);
        formElements.forEach(el => el.readOnly = true);
        document.querySelectorAll('input[name="editPaymentFrequency"]').forEach(radio => radio.disabled = true);

        editClientIdDisplay.value = `#${client.id}`;
        document.getElementById('editClientName').value = client.name;
        document.getElementById('editStartDate').value = client.startDate ? client.startDate.split('T')[0] : '';
        editClientCPFInput.value = client.cpf ? formatCPF(client.cpf) : '';
        editClientPhoneInput.value = client.phone ? formatPhone(client.phone) : '';
        editLocationInput.value = client.localizacao || '';
        editNeighborhoodInput.value = client.bairro || '';
        editProfessionInput.value = client.profissao || '';
        editLoanValueInput.value = formatCurrency(client.loanValue || 0);
        editInterestRateClientInput.value = parseFloat(client.taxa_juros || 20).toFixed(1);
        editInstallmentsInput.value = client.installments || 20;
        editInstallmentValueInput.value = formatCurrency(client.dailyValue || 0);

        toggleEditPaymentFrequency();
        // Removemos a seleção anterior e aplicamos a nova
        document.querySelectorAll('input[name="editPaymentFrequency"]').forEach(el => el.checked = false);

        if (client.frequency === 'weekly') {
            document.getElementById('editFreqWeekly').checked = true;
        } else if (client.frequency === 'biweekly') {
            document.getElementById('editFreqBiweekly').checked = true;
        } else if (client.frequency === 'monthly') {
            document.getElementById('editFreqMonthly').checked = true;
        } else {
            document.getElementById('editFreqDaily').checked = true;
        }

        editClientUsernameInput.value = '';
        editClientPasswordInput.value = '';

        originalFinancialData = {
            startDate: document.getElementById('editStartDate').value,
            loanValue: editLoanValueInput.value,
            interestRate: editInterestRateClientInput.value,
            installments: editInstallmentsInput.value,
            frequency: document.querySelector('input[name="editPaymentFrequency"]:checked').value
        };

        modal.show();
    });

    editClientForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const clientId = parseInt(selectedClientId);
        const clientIndex = allClientsForSearch.findIndex(c => c.id === clientId);
        if (clientIndex === -1) return;

        const currentFinancialData = {
            startDate: document.getElementById('editStartDate').value,
            loanValue: editLoanValueInput.value,
            interestRate: editInterestRateClientInput.value,
            installments: editInstallmentsInput.value,
            frequency: document.querySelector('input[name="editPaymentFrequency"]:checked').value
        };

        const hasFinancialChanges =
            currentFinancialData.startDate !== originalFinancialData.startDate ||
            currentFinancialData.loanValue !== originalFinancialData.loanValue ||
            currentFinancialData.interestRate !== originalFinancialData.interestRate ||
            currentFinancialData.installments !== originalFinancialData.installments ||
            currentFinancialData.frequency !== originalFinancialData.frequency;

        let newPaymentDates = allClientsForSearch[clientIndex].paymentDates;

        if (hasFinancialChanges) {
            if (!confirm('Você alterou dados financeiros críticos. Isso irá resetar e refazer o calendário de pagamentos do cliente. Deseja continuar?')) {
                return;
            }
            newPaymentDates = generatePaymentDates(
                currentFinancialData.startDate,
                parseInt(currentFinancialData.installments, 10),
                currentFinancialData.frequency
            );
        }

        const updatedClientData = {
            ...allClientsForSearch[clientIndex],
            name: document.getElementById('editClientName').value,
            phone: editClientPhoneInput.value.replace(/\D/g, ''),
            localizacao: editLocationInput.value,
            bairro: editNeighborhoodInput.value,
            profissao: editProfessionInput.value,
            startDate: currentFinancialData.startDate,
            loanValue: parseCurrency(currentFinancialData.loanValue),
            taxa_juros: parseFloat(currentFinancialData.interestRate),
            installments: parseInt(currentFinancialData.installments, 10),
            dailyValue: parseCurrency(editInstallmentValueInput.value),
            frequency: currentFinancialData.frequency,
            paymentDates: newPaymentDates
        };

        const updatedClient = await updateClient(updatedClientData);
        if (updatedClient) {
            updateClientData(updatedClient);
        }

        const clientUsername = editClientUsernameInput.value.trim();
        const clientPassword = editClientPasswordInput.value.trim();

        if (clientUsername) {
            try {
                const loginResponse = await fetch('/api/client-auth', {
                    method: 'PUT',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        clientId: clientId,
                        username: clientUsername,
                        password: clientPassword
                    })
                });
                if (!loginResponse.ok) {
                    const loginError = await loginResponse.json();
                    alert(`Falha ao atualizar o login do cliente: ${loginError.error}`);
                }
            } catch (loginError) {
                alert(`Ocorreu um erro de conexão ao atualizar o login do cliente.`);
            }
        }

        const editModalInstance = bootstrap.Modal.getInstance(editClientModalEl);
        if (editModalInstance) {
            editModalInstance.hide();
        }
    });

    uploadFileForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        if (!selectedClientId || fileInput.files.length === 0) return;
        const file = fileInput.files[0];
        const formData = new FormData();
        formData.append('file', file);
        formData.append('clientId', selectedClientId);
        uploadProgressBar.style.width = '0%';
        uploadProgressBar.textContent = '0%';
        uploadProgressBar.classList.remove('bg-danger', 'bg-success');
        uploadProgressBarContainer.style.display = 'block';
        uploadBtn.disabled = true;
        try {
            const response = await fetch('/api/upload', {
                method: 'POST',
                // ADICIONE ISSO:
                headers: {
                    'Authorization': `Bearer ${token}`
                },
                body: formData
            });
            if (!response.ok) throw new Error((await response.json()).error || 'Falha no upload.');
            const updatedClient = await response.json();
            updateClientData(updatedClient);
            uploadProgressBar.style.width = '100%';
            uploadProgressBar.textContent = 'Concluído!';
            uploadProgressBar.classList.add('bg-success');
            setTimeout(() => { uploadProgressBarContainer.style.display = 'none'; }, 2000);
        } catch (error) {
            console.error('Erro ao upload:', error);
            alert(`Erro: ${error.message}`);
            uploadProgressBar.textContent = 'Falhou!';
            uploadProgressBar.classList.add('bg-danger');
        } finally {
            uploadFileForm.reset();
            uploadBtn.disabled = false;
        }
    });

    fileList.addEventListener('click', async (e) => {
        const deleteBtn = e.target.closest('.delete-file-btn');
        if (!deleteBtn) return;
        const fileName = deleteBtn.dataset.filename;
        if (!selectedClientId || !fileName || !confirm(`Tem certeza que deseja excluir o arquivo "${fileName}"?`)) return;
        try {
            const response = await fetch('/api/upload', {
                method: 'DELETE',
                // ADICIONE ISSO:
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ clientId: selectedClientId, fileName: fileName })
            });
            if (!response.ok) throw new Error((await response.json()).error || 'Falha ao excluir arquivo.');
            const updatedClient = await response.json();
            updateClientData(updatedClient);
        } catch (error) {
            console.error('Erro ao excluir:', error);
            alert(`Erro: ${error.message}`);
        }
    });

    searchInput.addEventListener('input', filterClientList);

    downloadSheetBtn.addEventListener('click', async () => {
        downloadSpinner.style.display = 'inline-block';
        downloadSheetBtn.disabled = true;

        try {
            // MUDANÇA AQUI: Adicionar o segundo parâmetro com headers
            const response = await fetch('/api/export', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Falha ao gerar a planilha.');
            }

            const blob = await response.blob();
            const url = window.URL.createObjectURL(blob);
            const a = document.createElement('a');
            a.style.display = 'none';
            a.href = url;

            const date = new Date().toLocaleDateString('pt-BR').replace(/\//g, '-');
            a.download = `relatorio_clientes_${date}.xlsx`;

            document.body.appendChild(a);
            a.click();
            window.URL.revokeObjectURL(url);
            a.remove();

        } catch (error) {
            console.error("Erro ao baixar planilha:", error);
            alert(`Não foi possível baixar a planilha. Erro: ${error.message}`);
        } finally {
            downloadSpinner.style.display = 'none';
            downloadSheetBtn.disabled = false;
        }
    });

    editObservationsBtn.addEventListener('click', () => {
        observationsTextarea.readOnly = false;
        editObservationsBtn.classList.add('d-none');
        saveObservationsBtn.classList.remove('d-none');
        observationsTextarea.focus();
    });

    saveObservationsBtn.addEventListener('click', async () => {
        if (selectedClientId === null) return;
        const clientIndex = allClientsForSearch.findIndex(c => c.id === selectedClientId);
        if (clientIndex === -1) return;

        const updatedClientData = {
            ...allClientsForSearch[clientIndex],
            observacoes: observationsTextarea.value,
        };

        saveObservationsBtn.disabled = true;

        try {
            const updatedClient = await updateClient(updatedClientData);
            if (updatedClient) {
                updateClientData(updatedClient);
                alert('Observações salvas com sucesso!');
            }
        } catch (error) {
            console.error('Erro ao salvar observações:', error);
            alert('Não foi possível salvar as observações.');
        } finally {
            saveObservationsBtn.disabled = false;
        }
    });

    generateCollectionBtn.addEventListener('click', () => {
        if (selectedClientId === null) return;
        document.getElementById('collection-form').reset();
        const modal = new bootstrap.Modal(collectionModalEl);
        modal.show();
    });

    generateCollectionTextBtn.addEventListener('click', () => {
        if (selectedClientId === null) return;
        const client = allClientsForSearch.find(c => c.id === selectedClientId);
        if (!client) return;

        const chargeInterest = document.querySelector('input[name="chargeInterest"]:checked').value === 'yes';
        const customObservation = collectionObservationInput.value.trim();

        const timeZone = 'America/Cuiaba';
        const todayInCuiaba = new Date().toLocaleDateString('en-CA', { timeZone });
        const today = new Date(todayInCuiaba + 'T00:00:00.000Z');

        const lateInstallments = (client.paymentDates || []).filter(p => new Date(p.date) < today && p.status !== 'paid');
        const todayInstallment = (client.paymentDates || []).find(p => p.date.startsWith(todayInCuiaba) && p.status !== 'paid');

        let totalInterest = 0;
        if (chargeInterest && lateInstallments.length > 0) {
            const clientInterestRate = parseFloat(client.taxa_juros || 20) / 100;
            const interestPerInstallment = parseFloat(client.dailyValue) * clientInterestRate;
            totalInterest = lateInstallments.length * interestPerInstallment;
        }

        let totalValue = 0;
        totalValue += lateInstallments.length * parseFloat(client.dailyValue);
        totalValue += totalInterest;
        if (todayInstallment) {
            totalValue += parseFloat(client.dailyValue);
        }

        let message = `*Cliente:* ${client.name}\n`;
        message += `*Telefone:* ${client.phone ? formatPhone(client.phone) : 'N/A'}\n`;
        message += `*Profissão:* ${client.profissao || 'N/A'}\n`;
        message += `*Bairro:* ${client.bairro || 'N/A'}\n\n`;

        message += `*Data da Cobrança:* ${new Date().toLocaleDateString('pt-BR', { timeZone })}\n\n`;

        if (customObservation) {
            message += `*Obs:* ${customObservation}\n\n`;
        }

        message += `${lateInstallments.length} Parcela(s) de ${formatCurrency(client.dailyValue)} em atraso\n`;
        message += `Parcela de Hoje Pendente? ${todayInstallment ? 'Sim' : 'Não'}\n`;
        message += `Juros por atraso: ${formatCurrency(totalInterest)}\n\n`;
        message += `*Valor total: ${formatCurrency(totalValue)}*\n`;
        message += `_(Pra ficar em dias até hoje)_\n\n`;
        message += `*Localização:* ${client.localizacao || 'N/A'}`;

        collectionResultText.value = message;
        bootstrap.Modal.getInstance(collectionModalEl).hide();
        const resultModal = new bootstrap.Modal(collectionResultModalEl);
        resultModal.show();
    });

    copyCollectionTextBtn.addEventListener('click', () => {
        collectionResultText.select();
        document.execCommand('copy');

        const originalText = copyCollectionTextBtn.innerHTML;
        copyCollectionTextBtn.innerHTML = '<i class="bi bi-check-lg"></i> Copiado!';
        copyCollectionTextBtn.classList.remove('btn-success');
        copyCollectionTextBtn.classList.add('btn-secondary');

        setTimeout(() => {
            copyCollectionTextBtn.innerHTML = originalText;
            copyCollectionTextBtn.classList.remove('btn-secondary');
            copyCollectionTextBtn.classList.add('btn-success');
        }, 2000);
    });

    reminderBtn.addEventListener('click', async () => {
        const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Cuiaba' }); // Data de hoje YYYY-MM-DD

        clientsToRemind = allClientsForSearch.filter(client => {
            const status = calculateClientStatus(client);
            const isLateOrPending = status.includes('Pendente') || status.includes('Atrasado');

            // Verifica se está pausado (LÓGICA CORRIGIDA)
            const pauseDateClean = client.reminder_paused_until ? client.reminder_paused_until.split('T')[0] : null;

            // Só considera pausado se a data definida for NO FUTURO (Maior que hoje).
            // Se for hoje (Igual), já considera ativo.
            const isPaused = pauseDateClean && pauseDateClean > todayStr;

            return isLateOrPending && !isPaused;
        });

        if (clientsToRemind.length === 0) {
            alert('Nenhum cliente elegível para cobrança no momento (verifique se estão pausados).');
            return;
        }

        try {
            const response = await fetch('/api/get-config?name=pix_key');
            const data = await response.json();

            if (data.value) {
                reminderCountText.textContent = `O sistema irá preparar mensagens para ${clientsToRemind.length} cliente(s).`;
                pixKeyDisplay.value = data.value;
                new bootstrap.Modal(reminderConfirmationModalEl).show();
            } else {
                new bootstrap.Modal(pixKeySetupModalEl).show();
            }
        } catch (error) {
            console.error("Erro ao buscar chave PIX:", error);
            alert("Não foi possível buscar a configuração da chave PIX.");
        }
    });

    savePixKeyBtn.addEventListener('click', async () => {
        const newPixKey = pixKeyInput.value.trim();
        if (!newPixKey) {
            alert("Por favor, insira uma chave PIX.");
            return;
        }

        try {
            await fetch('/api/save-config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ name: 'pix_key', value: newPixKey })
            });

            bootstrap.Modal.getInstance(pixKeySetupModalEl).hide();
            reminderCountText.textContent = `O sistema irá preparar mensagens para ${clientsToRemind.length} cliente(s).`;
            pixKeyDisplay.value = newPixKey;
            new bootstrap.Modal(reminderConfirmationModalEl).show();
        } catch (error) {
            console.error("Erro ao salvar chave PIX:", error);
            alert("Não foi possível salvar a nova chave PIX.");
        }
    });

    changePixKeyBtn.addEventListener('click', () => {
        bootstrap.Modal.getInstance(reminderConfirmationModalEl).hide();
        const setupModal = new bootstrap.Modal(pixKeySetupModalEl);
        pixKeyInput.value = pixKeyDisplay.value;
        setupModal.show();
    });

    sendRemindersBtn.addEventListener('click', () => {
        const pixKey = pixKeyDisplay.value;

        // Configurações de Data
        const timeZone = 'America/Cuiaba';
        const todayFormatted = new Date().toLocaleDateString('pt-BR', { timeZone });
        const todayInCuiaba = new Date().toLocaleDateString('en-CA', { timeZone });
        const todayDateObj = new Date(todayInCuiaba + 'T00:00:00.000Z');

        reminderQueueList.innerHTML = '';

        // Dicionário de Emojis (Usando código Unicode para não bugar)
        const i = {
            bell: '\uD83D\uDD14',      // 🔔
            user: '\uD83D\uDC64',      // 👤
            calendar: '\uD83D\uDCC5',  // 📅
            cross: '\u274C',           // ❌
            day: '\uD83D\uDDD3\uFE0F', // 🗓️
            chart: '\uD83D\uDCC9',     // 📉
            check: '\u2705',           // ✅
            money: '\uD83D\uDCB0',     // 💰
            pix: '\uD83D\uDCA0',       // 💠
            key: '\uD83D\uDD11',       // 🔑
            build: '\uD83C\uDFE2',     // 🏢
            bank: '\uD83C\uDFE6'       // 🏦
        };

        clientsToRemind.forEach((client) => {
            const installmentValue = parseFloat(client.dailyValue);
            const installmentFormatted = formatCurrency(installmentValue);

            const lateInstallments = (client.paymentDates || []).filter(p => new Date(p.date) < todayDateObj && p.status !== 'paid');
            const lateCount = lateInstallments.length;

            const isPendingToday = (client.paymentDates || []).some(p => p.date.startsWith(todayInCuiaba) && p.status !== 'paid');

            // --- CÁLCULO ---
            let totalInterest = 0;
            if (lateCount > 0) {
                const clientInterestRate = parseFloat(client.taxa_juros || 20) / 100;
                const interestPerInstallment = installmentValue * clientInterestRate;
                totalInterest = lateCount * interestPerInstallment;
            }

            let totalValue = (lateCount * installmentValue) + totalInterest;
            if (isPendingToday) {
                totalValue += installmentValue;
            }

            // --- MONTAGEM DA MENSAGEM (Usando os códigos) ---
            let message = `${i.bell} *LEMBRETE DE COBRANÇA* ${i.bell}\n\n`;

            message += `${i.user} *Cliente:* ${client.name}\n`;
            message += `${i.calendar} *Data:* ${todayFormatted}\n`;
            message += `-----------------------------------\n`;

            if (lateCount > 0) {
                // MODELO 1: COM ATRASO
                message += `${i.cross} *${lateCount}x Parcela(s) em Atraso:* ${installmentFormatted}\n`;

                if (isPendingToday) {
                    message += `${i.day} *Parcela de Hoje:* ${installmentFormatted}\n`;
                }

                message += `${i.chart} *Juros calculados:* ${formatCurrency(totalInterest)}\n`;
            } else {
                // MODELO 2: SÓ HOJE
                message += `${i.day} *Parcela de Hoje:* ${installmentFormatted}\n`;
                message += `${i.check} *Juros:* R$ 0,00\n`;
            }

            message += `\n${i.money} *VALOR TOTAL:* *${formatCurrency(totalValue)}*\n`;
            message += `_(Para regularizar até hoje)_\n`;
            message += `-----------------------------------\n\n`;

            message += `${i.pix} *DADOS PARA PAGAMENTO*\n`;
            message += `${i.key} *Pix:* ${pixKey}\n`;
            message += `${i.build} *Nome:* On Comércio e Serviços\n`;
            message += `${i.bank} *Banco:* C6 Bank`;

            // --- GERAÇÃO DO LINK ---
            if (message) {
                const encodedMessage = encodeURIComponent(message);
                const whatsappUrl = `https://wa.me/55${client.phone.replace(/\D/g, '')}?text=${encodedMessage}`;

                const listItem = document.createElement('a');
                listItem.href = whatsappUrl;
                listItem.target = '_blank';
                listItem.rel = 'noopener noreferrer';
                listItem.className = 'list-group-item list-group-item-action';

                const iconClass = lateCount > 0 ? 'text-danger' : 'text-warning';

                listItem.innerHTML = `<i class="bi bi-whatsapp me-2 ${iconClass}"></i> Enviar para <strong>${client.name}</strong>`;

                reminderQueueList.appendChild(listItem);
            }
        });

        bootstrap.Modal.getInstance(reminderConfirmationModalEl).hide();
        new bootstrap.Modal(reminderQueueModalEl).show();
    });

    reminderQueueList.addEventListener('click', (e) => {
        const clickedLink = e.target.closest('a');
        if (clickedLink) {
            clickedLink.classList.add('active');
            clickedLink.style.backgroundColor = '#d1e7dd';
            clickedLink.style.textDecoration = 'line-through';
        }
    });

    deleteClientBtn.addEventListener('click', () => {
        if (selectedClientId === null) return;
        pendingSecureAction = 'delete';
        const passwordModal = new bootstrap.Modal(passwordModalEl);
        passwordModal.show();
    });

    resetPaymentsBtn.addEventListener('click', () => {
        if (selectedClientId === null) return;
        pendingSecureAction = 'reset';
        const passwordModal = new bootstrap.Modal(passwordModalEl);
        passwordModal.show();
    });

    passwordForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const enteredPassword = passwordInput.value;
        passwordInput.classList.remove('is-invalid');
        passwordError.style.display = 'none';

        try {
            const response = await fetch('/api/verify-password', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ password: enteredPassword })
            });

            const result = await response.json();
            const passwordModalInstance = bootstrap.Modal.getInstance(passwordModalEl);

            if (result.success) {
                passwordModalEl.addEventListener('hidden.bs.modal', async () => {
                    passwordForm.reset();

                    if (pendingSecureAction === 'unlockEdit') {
                        document.getElementById('editClientName').readOnly = false;
                        editClientPhoneInput.readOnly = false;
                        editProfessionInput.readOnly = false;
                        editNeighborhoodInput.readOnly = false;
                        editLocationInput.readOnly = false;
                        editClientUsernameInput.readOnly = false;
                        editClientPasswordInput.readOnly = false;
                        document.getElementById('editStartDate').readOnly = false;
                        editLoanValueInput.readOnly = false;
                        editInterestRateClientInput.readOnly = false;
                        editInstallmentsInput.readOnly = false;
                        document.querySelectorAll('input[name="editPaymentFrequency"]').forEach(radio => radio.disabled = false);

                        unlockEditBtn.classList.add('d-none');
                        saveEditBtn.classList.remove('d-none');
                    } else if (pendingSecureAction === 'delete') {
                        actionToConfirm = executeDelete;
                        confirmationModalTitle.textContent = 'Confirmar Exclusão';
                        confirmationModalBody.textContent = `Tem certeza que deseja excluir o cliente selecionado? Esta ação não pode ser desfeita.`;
                        new bootstrap.Modal(confirmationModalEl).show();
                    } else if (pendingSecureAction === 'reset') {
                        actionToConfirm = executeResetPayments;
                        confirmationModalTitle.textContent = 'Confirmar Reset';
                        confirmationModalBody.textContent = `Tem certeza que deseja resetar TODOS os pagamentos e o saldo deste cliente?`;
                        new bootstrap.Modal(confirmationModalEl).show();
                    }
                    pendingSecureAction = null;
                }, { once: true });

                passwordModalInstance.hide();
            } else {
                passwordInput.classList.add('is-invalid');
                passwordError.style.display = 'block';
            }
        } catch (error) {
            console.error("Erro ao verificar senha:", error);
            alert("Ocorreu um erro ao tentar verificar a senha.");
        }
    });

    confirmActionBtn.addEventListener('click', async () => {
        if (typeof actionToConfirm === 'function') {
            await actionToConfirm();
        }
        bootstrap.Modal.getInstance(confirmationModalEl).hide();
        actionToConfirm = null;
    });

    async function executeDelete() {
        try {
            // ADICIONE AS CHAVES E O HEADER AQUI:
            const response = await fetch(`/api/clients?id=${selectedClientId}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}` // <--- ADICIONE ESSA LINHA
                }
            });

            if (!response.ok) throw new Error('Falha ao excluir cliente.');
            await loadClients();
            renderClientPanel(null);
            loadFinancialSummary();
        } catch (error) {
            console.error("Erro ao deletar:", error);
            alert("Não foi possível excluir o cliente.");
        }
    }

    async function executeResetPayments() {
        try {
            const response = await fetch('/api/clients', {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}` // <--- ADICIONE ESSA LINHA
                },
                body: JSON.stringify({ id: selectedClientId, resetPayments: true })
            });
            if (!response.ok) throw new Error('Falha ao resetar pagamentos.');

            const updatedClient = await response.json();
            updateClientData(updatedClient);
            alert('Pagamentos e saldo resetados com sucesso!');

        } catch (error) {
            console.error("Erro ao resetar pagamentos:", error);
            alert("Não foi possível resetar os pagamentos.");
        }
    }

    unlockEditBtn.addEventListener('click', () => {
        pendingSecureAction = 'unlockEdit';
        const passwordModal = new bootstrap.Modal(passwordModalEl);
        passwordModal.show();
    });

    // 1. Abrir modal
    holidayBtn.addEventListener('click', () => {
        loadHolidays();
        new bootstrap.Modal(holidayModalEl).show();
    });

    // 2. Carregar lista de feriados
    async function loadHolidays() {
        holidayList.innerHTML = '<li class="list-group-item text-muted">Carregando...</li>';
        try {
            const response = await fetch('/api/holidays', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const holidays = await response.json();

            holidayList.innerHTML = '';
            if (holidays.length === 0) {
                holidayList.innerHTML = '<li class="list-group-item text-muted">Nenhum feriado cadastrado.</li>';
                return;
            }

            holidays.forEach(h => {
                const li = document.createElement('li');
                li.className = 'list-group-item d-flex justify-content-between';
                // Ajusta data para evitar problema de fuso horário na visualização
                const dateParts = h.date.split('T')[0].split('-');
                const dateDisplay = `${dateParts[2]}/${dateParts[1]}/${dateParts[0]}`; // DD/MM/YYYY

                li.innerHTML = `<span>${dateDisplay}</span> <span class="badge bg-secondary">${h.description || 'Feriado'}</span>`;
                holidayList.appendChild(li);
            });
        } catch (error) {
            holidayList.innerHTML = '<li class="list-group-item text-danger">Erro ao carregar.</li>';
        }
    }

    // 3. Adicionar Feriado (A PARTE CRÍTICA)
    addHolidayForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const date = holidayDateInput.value;
        if (!date) return;

        if (!confirm(`ATENÇÃO: Isso irá alterar o calendário de TODOS os clientes que têm parcela em ${date.split('-').reverse().join('/')}. Deseja continuar?`)) {
            return;
        }

        const btn = document.getElementById('addHolidayBtn');
        const originalText = btn.innerHTML;
        btn.disabled = true;
        btn.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Processando...';

        try {
            const response = await fetch('/api/holidays', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({ date: date, description: 'Feriado Manual' })
            });

            if (!response.ok) throw new Error('Falha ao aplicar feriado.');

            alert('Feriado aplicado com sucesso! Os calendários foram atualizados.');
            holidayDateInput.value = '';
            loadHolidays();

            // Recarrega a tela atual para refletir mudanças se estiver vendo algum cliente
            if (selectedClientId) {
                renderClientPanel(selectedClientId);
            }
            await loadClients(); // Atualiza a lista geral

        } catch (error) {
            console.error(error);
            alert('Erro ao aplicar feriado. Tente novamente.');
        } finally {
            btn.disabled = false;
            btn.innerHTML = originalText;
        }
    });

    // 1. Abrir modal de pausa
    pauseReminderBtn.addEventListener('click', () => {
        if (!selectedClientId) return;
        pauseDateInput.value = ''; // Limpa anterior
        new bootstrap.Modal(pauseReminderModalEl).show();
    });

    // 2. Salvar a pausa
    savePauseBtn.addEventListener('click', async () => {
        if (!selectedClientId || !pauseDateInput.value) return;

        const client = allClientsForSearch.find(c => c.id === selectedClientId);
        if (!client) return;

        // Atualiza apenas o campo de pausa
        const updatedData = { ...client, reminder_paused_until: pauseDateInput.value };

        // Desabilita botão para evitar duplo clique
        savePauseBtn.disabled = true;
        savePauseBtn.textContent = 'Salvando...';

        try {
            const updatedClient = await updateClient(updatedData);
            if (updatedClient) {
                updateClientData(updatedClient);
                bootstrap.Modal.getInstance(pauseReminderModalEl).hide();
            }
        } catch (err) {
            console.error(err);
            alert('Erro ao salvar pausa.');
        } finally {
            savePauseBtn.disabled = false;
            savePauseBtn.textContent = 'Confirmar Pausa';
        }
    });

    // 3. Remover a pausa
    removePauseBtn.addEventListener('click', async () => {
        if (!selectedClientId) return;
        const client = allClientsForSearch.find(c => c.id === selectedClientId);
        if (!client) return;

        if (!confirm('Deseja voltar a receber lembretes deste cliente imediatamente?')) return;

        const updatedData = { ...client, reminder_paused_until: null }; // Envia null para limpar

        try {
            const updatedClient = await updateClient(updatedData);
            if (updatedClient) {
                updateClientData(updatedClient);
            }
        } catch (err) {
            alert('Erro ao remover pausa.');
        }
    });

    renewalBtn.addEventListener('click', () => {
        if (!selectedClientId) return;
        const client = allClientsForSearch.find(c => c.id === selectedClientId);
        if (!client) return;

        // Formatação de datas
        const startDate = new Date(client.startDate);
        const startDay = startDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' });

        let firstPayment = 'N/A';
        if (client.paymentDates && client.paymentDates.length > 0) {
            const fpDate = new Date(client.paymentDates[0].date);
            firstPayment = fpDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' });
        }

        // Formatação de valores
        const loanVal = formatCurrency(client.loanValue);
        const installVal = formatCurrency(client.dailyValue);

        // Mapeamento de frequência para texto bonito
        const freqMap = {
            'daily': 'Diário',
            'weekly': 'Semanal',
            'biweekly': 'Quinzenal',
            'monthly': 'Mensal'
        };
        const freqText = freqMap[client.frequency] || 'Diário';

        // MONTAGEM DO TEXTO
        let msg = `✨ *RENOVAÇÃO DE EMPRÉSTIMO* ✨\n\n`;
        msg += `Olá, *${client.name.split(' ')[0]}*! Tudo certo? 🤝\n`;
        msg += `Seguem os detalhes da sua renovação confirmada:\n\n`;

        msg += `📅 *Data:* ${startDay}\n`;
        msg += `💰 *Valor:* ${loanVal}\n`;
        msg += `🔢 *Parcelas:* ${client.installments}x de ${installVal}\n`;
        msg += `🔄 *Frequência:* ${freqText}\n`;
        msg += `🚀 *1ª Parcela:* ${firstPayment}\n\n`;

        msg += `⚠️ _Lembrete Importante: Manter o pagamento em dia evita a cobrança de juros adicionais e garante renovações futuras._\n\n`;

        msg += `Conta comigo! Qualquer dúvida, estou à disposição. 👊`;

        renewalTextResult.value = msg;
        new bootstrap.Modal(renewalModalEl).show();
    });

    copyRenewalBtn.addEventListener('click', () => {
        renewalTextResult.select();
        document.execCommand('copy');

        const originalText = copyRenewalBtn.innerHTML;
        copyRenewalBtn.innerHTML = '<i class="bi bi-check-lg"></i> Copiado!';
        copyRenewalBtn.classList.remove('btn-success');
        copyRenewalBtn.classList.add('btn-dark');

        setTimeout(() => {
            copyRenewalBtn.innerHTML = originalText;
            copyRenewalBtn.classList.remove('btn-dark');
            copyRenewalBtn.classList.add('btn-success');
        }, 2000);
    });

    // --- LÓGICA DO RELATÓRIO INDIVIDUAL DO CLIENTE ---

    clientReportBtn.addEventListener('click', () => {
        if (!selectedClientId) return;
        const client = allClientsForSearch.find(c => c.id === selectedClientId);
        if (!client) return;

        // 1. Cálculos Matemáticos
        const totalInstallments = client.paymentDates ? client.paymentDates.length : 0;
        const paidInstallments = client.paymentDates ? client.paymentDates.filter(p => p.status === 'paid').length : 0;
        const remainingInstallments = totalInstallments - paidInstallments;

        const installmentValue = parseFloat(client.dailyValue);
        const remainingValue = remainingInstallments * installmentValue;

        // Calcula porcentagem concluída (opcional, mas fica bonito)
        const progress = totalInstallments > 0 ? Math.round((paidInstallments / totalInstallments) * 100) : 0;

        // 2. Montagem do Texto
        let msg = `📊 *EXTRATO DE EMPRÉSTIMO* 📊\n\n`;
        msg += `Olá, *${client.name.split(' ')[0]}*! Aqui está o resumo atualizado do seu contrato:\n\n`;

        msg += `💰 *Valor da Parcela:* ${formatCurrency(installmentValue)}\n`;
        msg += `✅ *Parcelas Pagas:* ${paidInstallments} de ${totalInstallments}\n`;
        msg += `⏳ *Restantes:* ${remainingInstallments} parcelas\n\n`;

        msg += `📉 *Progresso:* ${progress}% concluído\n`;
        msg += `🏁 *Saldo para Quitação:* *${formatCurrency(remainingValue)}*\n\n`;

        msg += `_Continue pagando em dia para manter seu crédito sempre disponível!_ 🤝`;

        // 3. Exibir
        clientReportText.value = msg;
        new bootstrap.Modal(clientReportModalEl).show();
    });

    copyClientReportBtn.addEventListener('click', () => {
        clientReportText.select();
        document.execCommand('copy');

        const originalText = copyClientReportBtn.innerHTML;
        copyClientReportBtn.innerHTML = '<i class="bi bi-check-lg"></i> Copiado!';

        setTimeout(() => {
            copyClientReportBtn.innerHTML = originalText;
        }, 2000);
    });

    // --- CARREGAR FERIADOS PARA A MEMÓRIA ---
    async function loadHolidaysForCache() {
        try {
            const response = await fetch('/api/holidays', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            const data = await response.json();
            // Salva apenas as strings de data (YYYY-MM-DD) na memória
            globalHolidays = data.map(h => h.date.split('T')[0]);
        } catch (error) {
            console.error('Erro ao carregar feriados:', error);
        }
    }

    async function loadFinancialSummary() {
        const totalLoanedEl = document.getElementById('summary-total-loaned');
        const totalReceivedEl = document.getElementById('summary-total-received');
        const totalPendingEl = document.getElementById('summary-total-pending');
        const totalOverdueEl = document.getElementById('summary-total-overdue');
        const defaultRateEl = document.getElementById('summary-default-rate');

        try {
            // MUDANÇA AQUI:
            const response = await fetch('/api/financial-summary', {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            });

            if (!response.ok) {
                throw new Error('Falha ao buscar dados do resumo.');
            }
            const data = await response.json();

            totalLoanedEl.textContent = formatCurrency(data.totalLoaned);
            totalReceivedEl.textContent = formatCurrency(data.totalReceived);
            totalPendingEl.textContent = formatCurrency(data.totalPendingToReceive);
            totalOverdueEl.textContent = formatCurrency(data.totalOverduePrincipal);
            defaultRateEl.textContent = `${data.defaultRate.toFixed(2)}%`;

        } catch (error) {
            console.error('Erro ao carregar resumo financeiro:', error);
            const errorMessage = 'Erro ao carregar';
            totalLoanedEl.textContent = errorMessage;
            totalReceivedEl.textContent = errorMessage;
            totalPendingEl.textContent = errorMessage;
            totalOverdueEl.textContent = errorMessage;
            defaultRateEl.textContent = errorMessage;
        }
    }

    // --- INICIALIZAÇÃO ---

    const tooltipTriggerList = [].slice.call(document.querySelectorAll('[data-bs-toggle="tooltip"]'));
    tooltipTriggerList.map(function (tooltipTriggerEl) {
        return new bootstrap.Tooltip(tooltipTriggerEl);
    });

    function updateClock() {
        if (!clockTimeEl || !clockDateEl) return;
        const now = new Date();
        const timeZone = 'America/Cuiaba';

        const timeOptions = { timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false };
        const dateOptions = { timeZone, weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };

        clockTimeEl.textContent = now.toLocaleTimeString('pt-BR', timeOptions);

        let dateString = now.toLocaleDateString('pt-BR', dateOptions);
        dateString = dateString.charAt(0).toUpperCase() + dateString.slice(1);
        clockDateEl.textContent = dateString;
    }

    updateClock();
    setInterval(updateClock, 1000);
    loadHolidaysForCache();
    loadClients();
    loadFinancialSummary();
});