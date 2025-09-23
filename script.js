document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DO DOM ---
    const clientListBody = document.getElementById('client-list-body');
    const panelPlaceholder = document.getElementById('panel-placeholder');
    const panelDetails = document.getElementById('panel-details');
    const markPaidBtn = document.getElementById('mark-paid-btn');
    const calendar = document.getElementById('payment-calendar');
    const editClientBtn = document.getElementById('edit-client-btn');
    const deleteClientBtn = document.getElementById('delete-client-btn');
    const syncClientsForm = document.getElementById('sync-clients-form');
    // ELEMENTOS DO PAINEL DE DETALHES
    const fileList = document.getElementById('file-list');
    const uploadFileForm = document.getElementById('upload-file-form');
    const fileInput = document.getElementById('file-input');
    const uploadBtn = document.getElementById('upload-btn');
    const uploadProgressBarContainer = document.getElementById('upload-progress-bar-container');
    const uploadProgressBar = document.getElementById('upload-progress-bar');
    const panelBalance = document.getElementById('panel-balance');
    // --- ELEMENTOS DO MODAL DE ADIÇÃO ---
    const addClientModalEl = document.getElementById('addClientModal');
    const addClientForm = document.getElementById('add-client-form');
    const clientCPFInput = document.getElementById('clientCPF');
    const clientPhoneInput = document.getElementById('clientPhone');
    const loanValueInput = document.getElementById('loanValue');
    const installmentsInput = document.getElementById('installments');
    const installmentValueInput = document.getElementById('installmentValue');
    const freqDailyRadio = document.getElementById('freqDaily');
    const freqWeeklyRadio = document.getElementById('freqWeekly');
    const newClientDropZone = document.getElementById('new-client-drop-zone');
    const newClientFileInput = document.getElementById('new-client-file-input');
    const newClientFileList = document.getElementById('new-client-file-list');
    const saveClientBtn = document.getElementById('save-client-btn');
    // --- ELEMENTOS DO MODAL DE EDIÇÃO ---
    const editClientForm = document.getElementById('edit-client-form');
    const editClientCPFInput = document.getElementById('editClientCPF');
    const editClientPhoneInput = document.getElementById('editClientPhone');
    const editLoanValueInput = document.getElementById('editLoanValue');
    const editInstallmentsInput = document.getElementById('editInstallments');
    const editInstallmentValueInput = document.getElementById('editInstallmentValue');
    const editFreqWeeklyRadio = document.getElementById('editFreqWeekly');
    // --- ELEMENTOS DO RELÓGIO E MODAL DE PAGAMENTO ---
    const clockTimeEl = document.getElementById('clock-time');
    const clockDateEl = document.getElementById('clock-date');
    const paymentModalEl = document.getElementById('paymentModal');
    const paymentModalTitle = document.getElementById('paymentModalTitle');
    const paymentValueInput = document.getElementById('paymentValueInput');
    const paymentDateInput = document.getElementById('paymentDateInput');
    const registerPaymentBtn = document.getElementById('registerPaymentBtn');

    // --- ESTADO DA APLICAÇÃO ---
    let clients = [];
    let selectedClientId = null;
    let newClientFiles = [];

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
    function updateInstallmentValue() {
        const loanValue = parseCurrency(loanValueInput.value);
        const installments = parseInt(installmentsInput.value, 10);
        if (!isNaN(loanValue) && !isNaN(installments) && installments > 0) {
            const totalLoan = loanValue * 1.20;
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
        if (!isNaN(loanValue) && !isNaN(installments) && installments > 0) {
            const totalLoan = loanValue * 1.20;
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
        const timeZone = 'America/Cuiaba';
        const todayInCuiaba = new Date().toLocaleDateString('en-CA', { timeZone });
        const cuiabaTodayUTCMidnight = new Date(todayInCuiaba + 'T00:00:00.000Z').getTime();

        let lateCount = 0;
        let isPendingToday = false;
        let advancedCount = 0;

        if (!client.paymentDates || client.paymentDates.length === 0) {
            return '<span class="badge bg-secondary">Sem dados</span>';
        }

        client.paymentDates.forEach(p => {
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
            const response = await fetch('/api/clients');
            if (!response.ok) throw new Error('Falha ao carregar clientes.');
            clients = await response.json();
            renderClientList();
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
        const client = clients.find(c => c.id === clientId);
        if (!client) {
            panelPlaceholder.classList.remove('d-none');
            panelDetails.classList.add('d-none');
            selectedClientId = null;
            renderClientList();
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
        document.getElementById('panel-loan-value').textContent = formatCurrency(client.loanValue || 0);
        document.getElementById('panel-daily-value').textContent = formatCurrency(client.dailyValue || 0);
        document.getElementById('panel-start-date').textContent = client.startDate ? new Date(client.startDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'A preencher';
        panelBalance.textContent = formatCurrency(client.saldo || 0);
        panelBalance.className = (client.saldo > 0) ? 'text-success fw-bold' : 'fw-bold';

        const calendarTitle = document.querySelector('#panel-details h6:nth-of-type(3)');
        calendarTitle.textContent = `Calendário de Pagamentos (${client.installments || ''}x ${client.frequency === 'weekly' ? 'Semanal' : 'Diário'})`;

        calendar.innerHTML = '';
        if (!client.startDate || !client.paymentDates || client.paymentDates.length === 0) {
            document.getElementById('panel-end-date').textContent = 'N/A';
            calendar.innerHTML = '<p class="text-center text-muted">Preencha os dados financeiros para gerar o calendário.</p>';
        } else {
            const paymentDates = client.paymentDates.map(p => new Date(p.date));
            const firstPaymentDate = paymentDates[0];
            const lastPaymentDate = paymentDates[paymentDates.length - 1];
            document.getElementById('panel-end-date').textContent = lastPaymentDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' });

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
                // ######### INÍCIO DA CORREÇÃO: dayOfWeek definido aqui #########
                const dayOfWeek = currentDate.getUTCDay();
                // ######### FIM DA CORREÇÃO #########

                dayDiv.textContent = currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });
                dayDiv.classList.add('calendar-day');

                const payment = client.paymentDates.find(p => new Date(p.date).setUTCHours(0, 0, 0, 0) === new Date(currentDate).setUTCHours(0, 0, 0, 0));

                if (payment) {
                    dayDiv.dataset.date = payment.date;
                    const paymentDateMidnight = new Date(payment.date).getTime();

                    if (payment.status === 'paid') dayDiv.classList.add('status-paid');
                    else if (paymentDateMidnight < cuiabaTodayUTCMidnight) {
                        dayDiv.classList.add('status-late');
                    } else dayDiv.classList.add('status-pending');
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
        renderClientList();
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

    // --- EVENT LISTENERS ---

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
            name: document.getElementById('clientName').value,
            startDate: startDate,
            cpf: clientCPFInput.value.replace(/\D/g, ''),
            phone: clientPhoneInput.value.replace(/\D/g, ''),
            loanValue: parseCurrency(loanValueInput.value),
            dailyValue: parseCurrency(installmentValueInput.value),
            installments: installments,
            frequency: frequency,
            paymentDates: generatePaymentDates(startDate, installments, frequency)
        };

        try {
            const response = await fetch('/api/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(clientData),
            });
            if (!response.ok) throw new Error('Falha ao criar o registro do cliente.');
            const newClient = await response.json();
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
        if (row && row.dataset.clientId) renderClientPanel(parseInt(row.dataset.clientId));
    });

    markPaidBtn.addEventListener('click', () => {
        if (selectedClientId === null) return;
        const client = clients.find(c => c.id === selectedClientId);
        if (!client) return;

        paymentModalTitle.textContent = "Registrar Pagamento";
        paymentValueInput.value = formatCurrency(client.dailyValue);
        paymentDateInput.value = new Date().toLocaleDateString('en-CA');

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

            // ######### INÍCIO DA CORREÇÃO: Atualização da lista #########
            await loadClients(); // Recarrega TODOS os clientes para garantir consistência
            renderClientPanel(selectedClientId); // Re-renderiza o painel para manter a seleção
            // ######### FIM DA CORREÇÃO #########

            bootstrap.Modal.getInstance(paymentModalEl).hide();

        } catch (error) {
            console.error('Erro ao registrar pagamento:', error);
            alert(`Erro: ${error.message}`);
        } finally {
            registerPaymentBtn.disabled = false;
        }
    });

    calendar.addEventListener('click', (e) => {
        const dayDiv = e.target.closest('.calendar-day:not(.status-weekend)');
        if (!dayDiv || selectedClientId === null) return;

        const client = clients.find(c => c.id === selectedClientId);
        if (!client) return;

        paymentModalTitle.textContent = "Registrar Pagamento";
        paymentValueInput.value = formatCurrency(client.dailyValue);
        paymentDateInput.value = new Date().toLocaleDateString('en-CA');

        new bootstrap.Modal(paymentModalEl).show();
    });

    editClientBtn.addEventListener('click', () => {
        if (selectedClientId === null) return;
        const client = clients.find(c => c.id === selectedClientId);
        if (!client) return;

        document.getElementById('editClientId').value = client.id;
        document.getElementById('editClientName').value = client.name;
        document.getElementById('editStartDate').value = client.startDate ? client.startDate.split('T')[0] : '';
        editClientCPFInput.value = client.cpf ? formatCPF(client.cpf) : '';
        editClientPhoneInput.value = client.phone ? formatPhone(client.phone) : '';
        editLoanValueInput.value = formatCurrency(client.loanValue || 0);
        editInstallmentsInput.value = client.installments || 20;
        editInstallmentValueInput.value = formatCurrency(client.dailyValue || 0);

        toggleEditPaymentFrequency();
        if (client.frequency === 'weekly') {
            document.getElementById('editFreqWeekly').checked = true;
        } else {
            document.getElementById('editFreqDaily').checked = true;
        }

        new bootstrap.Modal(document.getElementById('editClientModal')).show();
    });

    editClientForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const clientId = parseInt(document.getElementById('editClientId').value);
        const clientIndex = clients.findIndex(c => c.id === clientId);
        if (clientIndex === -1) return;

        const installments = parseInt(editInstallmentsInput.value);
        const frequency = document.querySelector('input[name="editPaymentFrequency"]:checked').value;
        const startDate = document.getElementById('editStartDate').value || null;

        const updatedClientData = {
            id: clientId,
            name: document.getElementById('editClientName').value,
            startDate: startDate,
            cpf: editClientCPFInput.value.replace(/\D/g, ''),
            phone: editClientPhoneInput.value.replace(/\D/g, ''),
            loanValue: parseCurrency(editLoanValueInput.value),
            dailyValue: parseCurrency(editInstallmentValueInput.value),
            installments: installments,
            frequency: frequency,
            paymentDates: generatePaymentDates(startDate, installments, frequency),
            files: clients[clientIndex].files || [],
            saldo: clients[clientIndex].saldo || 0.00
        };
        const updatedClient = await updateClient(updatedClientData);
        if (updatedClient) {
            clients[clientIndex] = updatedClient;
            renderClientPanel(clientId);
        }
        bootstrap.Modal.getInstance(document.getElementById('editClientModal')).hide();
    });

    deleteClientBtn.addEventListener('click', async () => {
        if (selectedClientId === null) return;
        const client = clients.find(c => c.id === selectedClientId);
        if (!client) return;
        if (confirm(`Tem certeza que deseja excluir o cliente "${client.name}"? Esta ação não pode ser desfeita.`)) {
            try {
                const response = await fetch(`/api/clients?id=${selectedClientId}`, { method: 'DELETE' });
                if (!response.ok) throw new Error('Falha ao excluir cliente.');
                await loadClients();
                renderClientPanel(null);
            } catch (error) {
                console.error("Erro ao deletar:", error);
                alert("Não foi possível excluir o cliente.");
            }
        }
    });

    syncClientsForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const nameList = document.getElementById('clientNameList').value;
        const names = nameList.split('\n').map(name => name.trim()).filter(name => name.length > 0);
        if (names.length === 0) {
            alert('Por favor, insira pelo menos um nome.');
            return;
        }
        let newClientsAddedCount = 0;
        const existingNames = clients.map(c => c.name.toLowerCase());
        for (const name of names) {
            if (!existingNames.includes(name.toLowerCase())) {
                const newClient = { name: name, startDate: null, cpf: '', phone: '', loanValue: 0, dailyValue: 0, paymentDates: [] };
                try {
                    const response = await fetch('/api/clients', { method: 'POST', headers: { 'Content-Type': 'application/json' }, body: JSON.stringify(newClient) });
                    if (response.ok) newClientsAddedCount++;
                } catch (error) { console.error(`Erro ao adicionar ${name}:`, error); }
            }
        }
        if (newClientsAddedCount > 0) {
            await loadClients();
            alert(`${newClientsAddedCount} novo(s) cliente(s) foram adicionado(s) com sucesso!`);
        } else alert('Nenhum cliente novo foi encontrado na lista para adicionar.');
        bootstrap.Modal.getInstance(document.getElementById('syncClientsModal')).hide();
        syncClientsForm.reset();
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
            console.error('Erro no upload:', error);
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

    // --- INICIALIZAÇÃO ---
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
});