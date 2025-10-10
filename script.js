document.addEventListener('DOMContentLoaded', () => {

    if (sessionStorage.getItem('isAuthenticated') !== 'true') {
        window.location.href = '/login.html';
        return;
    }

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
        if (frequency === 'daily') {
            let firstDate = new Date(startDateStr + 'T00:00:00Z');
            firstDate.setUTCDate(firstDate.getUTCDate() + 1);
            while (firstDate.getUTCDay() === 0 || firstDate.getUTCDay() === 6) {
                firstDate.setUTCDate(firstDate.getUTCDate() + 1);
            }
            currentDate = firstDate;
        } else if (frequency === 'weekly') {
            let firstDate = new Date(startDateStr + 'T00:00:00Z');
            firstDate.setUTCDate(firstDate.getUTCDate() + 7);
            currentDate = firstDate;
        } else {
            return [];
        }
        if (frequency === 'daily') {
            let businessDaysCount = 0;
            while (businessDaysCount < installments) {
                const dayOfWeek = currentDate.getUTCDay();
                if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                    businessDaysCount++;
                    paymentDates.push({ date: new Date(currentDate).toISOString(), status: 'pending' });
                }
                currentDate.setUTCDate(currentDate.getUTCDate() + 1);
            }
        } else if (frequency === 'weekly') {
            for (let i = 0; i < installments; i++) {
                paymentDates.push({ date: new Date(currentDate).toISOString(), status: 'pending' });
                currentDate.setUTCDate(currentDate.getUTCDate() + 7);
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
            const response = await fetch(`/api/clients?page=${currentPage}&limit=${clientsPerPage}`);
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
                headers: { 'Content-Type': 'application/json' },
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
    function renderClientList() {
        clientListBody.innerHTML = '';
        if (clients.length === 0) {
            clientListBody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Nenhum cliente cadastrado.</td></tr>';
            return;
        }
        clients.forEach(client => {
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
            if (searchInput.value === '') {
                renderClientList();
            }
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
            const paidDates = client.paymentDates.map(p => new Date(p.paidAt)).filter(d => !isNaN(d));
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
        calendarTitle.textContent = `Calendário de Pagamentos (${client.installments || ''}x ${client.frequency === 'weekly' ? 'Semanal' : 'Diário'})`;

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

                        if (payment.paidAt) {
                            const paidAtDate = new Date(payment.paidAt).setUTCHours(0, 0, 0, 0);
                            const dueDate = new Date(payment.date).setUTCHours(0, 0, 0, 0);
                            const diffDays = (paidAtDate - dueDate) / (1000 * 60 * 60 * 24);

                            let tooltipText = '';
                            let tooltipColor = '';

                            if (diffDays === 0) {
                                tooltipText = 'Pago no dia';
                                tooltipColor = 'green';
                            } else if (diffDays === 1) {
                                tooltipText = 'Pago com 1 dia de atraso';
                                tooltipColor = 'orange';
                            } else if (diffDays > 1) {
                                tooltipText = `Pago com ${diffDays} dias de atraso`;
                                tooltipColor = 'red';
                            } else {
                                tooltipText = `Pago ${-diffDays} dia(s) adiantado`;
                                tooltipColor = 'green';
                            }

                            const tooltip = document.createElement('span');
                            tooltip.className = `tooltip-text ${tooltipColor}`;
                            tooltip.textContent = tooltipText;
                            dayDiv.appendChild(tooltip);
                        }
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

        if (lateCount >= 3) {
            generateCollectionBtn.disabled = false;
            generateCollectionBtn.title = "Gerar Aviso de Cobrança";
        } else {
            generateCollectionBtn.disabled = true;
            generateCollectionBtn.title = "Disponível apenas para clientes com 3 ou mais parcelas em atraso.";
        }
        if (searchInput.value !== '') {
            filterClientList();
        } else {
            renderClientList();
        }
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
            const response = await fetch(`/api/clients?page=1&limit=9999`);
            const data = await response.json();
            allClientsForSearch = data.clients;
        } catch (error) {
            console.error('Erro ao buscar todos os clientes para pesquisa:', error);
        }
    }

    function renderPaginationControls() {
        paginationControls.innerHTML = '';
        const totalPages = Math.ceil(totalClients / clientsPerPage);

        if (totalPages <= 1) return;

        const prevLi = document.createElement('li');
        prevLi.className = `page-item ${currentPage === 1 ? 'disabled' : ''}`;
        prevLi.innerHTML = `<a class="page-link" href="#" data-page="${currentPage - 1}">Anterior</a>`;
        paginationControls.appendChild(prevLi);

        for (let i = 1; i <= totalPages; i++) {
            const li = document.createElement('li');
            li.className = `page-item ${i === currentPage ? 'active' : ''}`;
            li.innerHTML = `<a class="page-link" href="#" data-page="${i}">${i}</a>`;
            paginationControls.appendChild(li);
        }

        const nextLi = document.createElement('li');
        nextLi.className = `page-item ${currentPage === totalPages ? 'disabled' : ''}`;
        nextLi.innerHTML = `<a class="page-link" href="#" data-page="${currentPage + 1}">Próximo</a>`;
        paginationControls.appendChild(nextLi);
    }

    function filterClientList() {
        const searchTerm = searchInput.value.toLowerCase();
        if (!searchTerm) {
            renderClientList();
            paginationControls.style.display = 'flex';
            return;
        }

        paginationControls.style.display = 'none';
        clientListBody.innerHTML = '';

        const filteredClients = allClientsForSearch.filter(client => {
            const idMatch = client.id.toString().toLowerCase().includes(searchTerm);
            const nameMatch = client.name.toLowerCase().includes(searchTerm);
            return idMatch || nameMatch;
        });

        if (filteredClients.length === 0) {
            clientListBody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Nenhum cliente encontrado.</td></tr>';
            return;
        }

        filteredClients.forEach(client => {
            const tr = document.createElement('tr');
            tr.dataset.clientId = client.id;
            tr.className = client.id === selectedClientId ? 'table-active' : '';
            const status = calculateClientStatus(client);
            const startDateDisplay = client.startDate ? new Date(client.startDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A';
            tr.innerHTML = `<td>#${client.id}</td><td>${client.name}</td><td>${status}</td><td>${startDateDisplay}</td>`;
            clientListBody.appendChild(tr);
        });
    }

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
                headers: { 'Content-Type': 'application/json' },
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
                headers: { 'Content-Type': 'application/json' },
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
            const clientId = selectedClientId;
            const clientIndexAll = allClientsForSearch.findIndex(c => c.id === clientId);
            if (clientIndexAll !== -1) {
                allClientsForSearch[clientIndexAll] = updatedClient;
            }

            const clientIndexPaginated = clients.findIndex(c => c.id === clientId);
            if (clientIndexPaginated !== -1) {
                clients[clientIndexPaginated] = updatedClient;
            }

            renderClientPanel(clientId);
            renderClientList();
            loadFinancialSummary();
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
                headers: { 'Content-Type': 'application/json' },
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

    function updateClientData(updatedClient) {
        const clientId = updatedClient.id;

        const clientIndexAll = allClientsForSearch.findIndex(c => c.id === clientId);
        if (clientIndexAll !== -1) {
            allClientsForSearch[clientIndexAll] = updatedClient;
        }

        const clientIndexPaginated = clients.findIndex(c => c.id === clientId);
        if (clientIndexPaginated !== -1) {
            clients[clientIndexPaginated] = updatedClient;
        }

        renderClientPanel(clientId);
        renderClientList();
        loadFinancialSummary();
    }

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
        if (client.frequency === 'weekly') {
            document.getElementById('editFreqWeekly').checked = true;
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
            allClientsForSearch[clientIndex] = updatedClient;
            if (clients.some(c => c.id === clientId)) {
                const paginatedIndex = clients.findIndex(c => c.id === clientId);
                clients[paginatedIndex] = updatedClient;
            }
            renderClientPanel(clientId);
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

    // ### REMOVIDO ### O 'event listener' do formulário 'Sincronizar'
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
            const response = await fetch('/api/upload', { method: 'POST', body: formData });
            if (!response.ok) throw new Error((await response.json()).error || 'Falha no upload.');
            const updatedClient = await response.json();
            const clientIndex = clients.findIndex(c => c.id === selectedClientId);
            clients[clientIndex] = updatedClient;
            renderClientPanel(selectedClientId);
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ clientId: selectedClientId, fileName: fileName })
            });
            if (!response.ok) throw new Error((await response.json()).error || 'Falha ao excluir arquivo.');
            const updatedClient = await response.json();
            const clientIndex = clients.findIndex(c => c.id === selectedClientId);
            clients[clientIndex] = updatedClient;
            renderClientPanel(selectedClientId);
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
            const response = await fetch('/api/export');
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

        const clientIndex = clients.findIndex(c => c.id === selectedClientId);
        if (clientIndex === -1) return;

        const updatedClientData = {
            ...clients[clientIndex],
            observacoes: observationsTextarea.value,
        };

        saveObservationsBtn.disabled = true;

        try {
            const updatedClient = await updateClient(updatedClientData);
            if (updatedClient) {
                clients[clientIndex] = updatedClient;
                renderClientPanel(selectedClientId);
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
            lateInstallments.forEach(p => {
                const installmentDate = new Date(p.date);
                const businessDaysLate = calculateBusinessDays(installmentDate, today);
                totalInterest += businessDaysLate * parseFloat(client.dailyValue) * clientInterestRate;
            });
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
        clientsToRemind = allClientsForSearch.filter(client => {
            const status = calculateClientStatus(client);
            return status.includes('Pendente') || status.includes('Atrasado');
        });

        if (clientsToRemind.length === 0) {
            alert('Nenhum cliente com parcelas pendentes ou em atraso foi encontrado.');
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
        const timeZone = 'America/Cuiaba';
        const todayFormatted = new Date().toLocaleDateString('pt-BR', { timeZone });
        const todayInCuiaba = new Date().toLocaleDateString('en-CA', { timeZone });
        const today = new Date(todayInCuiaba + 'T00:00:00.000Z');

        reminderQueueList.innerHTML = '';

        clientsToRemind.forEach((client) => {
            const firstName = client.name.split(' ')[0];
            const installmentValue = formatCurrency(client.dailyValue);

            const lateInstallments = (client.paymentDates || []).filter(p => new Date(p.date) < today && p.status !== 'paid');
            const hasLate = lateInstallments.length > 0;
            const lateCount = lateInstallments.length;

            const isPendingToday = (client.paymentDates || []).some(p => p.date.startsWith(todayInCuiaba) && p.status !== 'paid');

            let message = '';

            if (isPendingToday && !hasLate) {
                message = `Olá ${firstName}, a parcela de hoje (${todayFormatted}) no valor de ${installmentValue} ainda consta como pendente em nosso sistema.\n\n`;
                message += `Chave PIX: ${pixKey}\n\n`;
                message += `Se o pagamento já foi realizado, por favor desconsidere esta mensagem automática.`;
            }
            else if (isPendingToday && hasLate) {
                message = `Olá ${firstName}, a parcela de hoje (${todayFormatted}) no valor de ${installmentValue} está pendente.\n\n`;
                message += `Além disso, notamos que você possui *${lateCount} parcela(s) anterior(es) em atraso*.\n\n`;
                message += `Chave PIX para regularização: ${pixKey}\n\n`;
                message += `Se o pagamento já foi realizado, por favor desconsidere esta mensagem automática.`;
            }
            else if (!isPendingToday && hasLate) {
                const clientInterestRate = parseFloat(client.taxa_juros || 20) / 100;
                let totalInterest = 0;
                lateInstallments.forEach(p => {
                    const installmentDate = new Date(p.date);
                    const businessDaysLate = calculateBusinessDays(installmentDate, today);
                    totalInterest += businessDaysLate * parseFloat(client.dailyValue) * clientInterestRate;
                });
                const totalPrincipal = lateCount * parseFloat(client.dailyValue);
                const totalDue = totalPrincipal + totalInterest;

                message = `Olá ${firstName}, identificamos que você possui *${lateCount} parcela(s) em atraso* em nosso sistema.\n\n`;
                message += `O valor total para regularizar sua situação hoje é de *${formatCurrency(totalDue)}* (incluindo juros).\n\n`;
                message += `Chave PIX para pagamento: ${pixKey}`;
            }

            if (message) {
                const encodedMessage = encodeURIComponent(message);
                const whatsappUrl = `https://wa.me/55${client.phone.replace(/\D/g, '')}?text=${encodedMessage}`;

                const listItem = document.createElement('a');
                listItem.href = whatsappUrl;
                listItem.target = '_blank';
                listItem.rel = 'noopener noreferrer';
                listItem.className = 'list-group-item list-group-item-action';
                listItem.innerHTML = `<i class="bi bi-whatsapp me-2"></i> Enviar para <strong>${client.name}</strong>`;

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
                    // ### REMOVIDO ### O 'else if' para 'configInterest'
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
            const response = await fetch(`/api/clients?id=${selectedClientId}`, { method: 'DELETE' });
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
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ id: selectedClientId, resetPayments: true })
            });
            if (!response.ok) throw new Error('Falha ao resetar pagamentos.');

            const updatedClient = await response.json();
            const clientId = selectedClientId;

            const clientIndexAll = allClientsForSearch.findIndex(c => c.id === clientId);
            if (clientIndexAll !== -1) {
                allClientsForSearch[clientIndexAll] = updatedClient;
            }

            const clientIndexPaginated = clients.findIndex(c => c.id === clientId);
            if (clientIndexPaginated !== -1) {
                clients[clientIndexPaginated] = updatedClient;
            }

            renderClientPanel(clientId);
            renderClientList();

            alert('Pagamentos e saldo resetados com sucesso!');
            loadFinancialSummary();

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

    // ### REMOVIDO ### O 'event listener' do botão 'configInterestBtn'
    // ### REMOVIDO ### O 'event listener' do botão 'saveInterestBtn'

    async function loadFinancialSummary() {
        const totalLoanedEl = document.getElementById('summary-total-loaned');
        const totalReceivedEl = document.getElementById('summary-total-received');
        const totalOverdueEl = document.getElementById('summary-total-overdue');
        const defaultRateEl = document.getElementById('summary-default-rate');

        try {
            const response = await fetch('/api/financial-summary');
            if (!response.ok) {
                throw new Error('Falha ao buscar dados do resumo.');
            }
            const data = await response.json();

            totalLoanedEl.textContent = formatCurrency(data.totalLoaned);
            totalReceivedEl.textContent = formatCurrency(data.totalReceived);
            totalOverdueEl.textContent = formatCurrency(data.totalOverduePrincipal);
            defaultRateEl.textContent = `${data.defaultRate.toFixed(2)}%`;

        } catch (error) {
            console.error('Erro ao carregar resumo financeiro:', error);
            const errorMessage = 'Erro ao carregar';
            totalLoanedEl.textContent = errorMessage;
            totalReceivedEl.textContent = errorMessage;
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

    loadClients();
    loadFinancialSummary();
});