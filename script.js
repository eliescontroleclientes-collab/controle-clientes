document.addEventListener('DOMContentLoaded', () => {
    // --- ELEMENTOS DO DOM ---
    const clientListBody = document.getElementById('client-list-body');
    const panelPlaceholder = document.getElementById('panel-placeholder');
    const panelDetails = document.getElementById('panel-details');
    const addClientForm = document.getElementById('add-client-form');
    const markPaidBtn = document.getElementById('mark-paid-btn');
    const calendar = document.getElementById('payment-calendar');
    const editClientBtn = document.getElementById('edit-client-btn');
    const deleteClientBtn = document.getElementById('delete-client-btn');
    const editClientForm = document.getElementById('edit-client-form');
    const syncClientsForm = document.getElementById('sync-clients-form');
    const fileList = document.getElementById('file-list');
    const uploadFileForm = document.getElementById('upload-file-form');
    const fileInput = document.getElementById('file-input');
    const uploadBtn = document.getElementById('upload-btn');
    const uploadProgressBarContainer = document.getElementById('upload-progress-bar-container');
    const uploadProgressBar = document.getElementById('upload-progress-bar');
    // --- ELEMENTOS DO MODAL DE ADIÇÃO ---
    const addClientModalEl = document.getElementById('addClientModal');
    const newClientDropZone = document.getElementById('new-client-drop-zone');
    const newClientFileInput = document.getElementById('new-client-file-input');
    const newClientFileList = document.getElementById('new-client-file-list');
    const saveClientBtn = document.getElementById('save-client-btn');
    // --- ELEMENTOS DOS NOVOS CAMPOS DINÂMICOS ---
    const clientCPFInput = document.getElementById('clientCPF');
    const clientPhoneInput = document.getElementById('clientPhone');
    const loanValueInput = document.getElementById('loanValue');
    const installmentValueInput = document.getElementById('installmentValue');
    const installmentsInput = document.getElementById('installments');
    const frequencyWeeklyRadio = document.getElementById('frequency-weekly');
    const frequencyDailyRadio = document.getElementById('frequency-daily');

    // --- ESTADO DA APLICAÇÃO ---
    let clients = [];
    let selectedClientId = null;
    let newClientFiles = [];

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
                const error = await response.json();
                throw new Error(error.error || 'Falha ao atualizar cliente.');
            }
            return await response.json();
        } catch (error) {
            console.error('Erro em updateClient:', error);
            alert('Não foi possível salvar as alterações do cliente.');
        }
    }

    // --- FUNÇÕES DE FORMATAÇÃO E MÁSCARA (NOVO) ---
    const formatCurrency = (value) => {
        if (!value && value !== 0) return '';
        const number = parseFloat(value);
        if (isNaN(number)) return '';
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(number);
    };

    const parseCurrency = (value) => {
        if (typeof value !== 'string') return 0;
        return parseFloat(value.replace(/[^0-9,-]+/g, "").replace(",", ".")) || 0;
    };

    const applyInputMasks = (input, maskFunction) => {
        const handler = (event) => {
            const value = event.target.value;
            event.target.value = maskFunction(value);
        };
        input.addEventListener('input', handler);
    };

    const formatCPF = (value) => value.replace(/\D/g, '').slice(0, 11).replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
    const formatPhone = (value) => {
        let r = value.replace(/\D/g, '').slice(0, 11);
        if (r.length > 10) r = r.replace(/^(\d\d)(\d{5})(\d{4}).*/, '($1) $2-$3');
        else if (r.length > 5) r = r.replace(/^(\d\d)(\d{4})(\d{0,4}).*/, '($1) $2-$3');
        else if (r.length > 2) r = r.replace(/^(\d\d)(\d{0,5}).*/, '($1) $2');
        else r = r.replace(/^(\d*)/, '($1');
        return r;
    };

    // --- FUNÇÕES DE CÁLCULO (NOVO) ---
    function updateInstallmentLogic() {
        const loanValue = parseCurrency(loanValueInput.value);
        const installments = parseInt(installmentsInput.value, 10) || 1;

        if (installments <= 9) {
            frequencyWeeklyRadio.disabled = false;
        } else {
            frequencyWeeklyRadio.disabled = true;
            frequencyDailyRadio.checked = true;
        }

        if (loanValue > 0 && installments > 0) {
            const totalLoan = loanValue * 1.20;
            const installmentValue = totalLoan / installments;
            installmentValueInput.value = formatCurrency(installmentValue);
        } else {
            installmentValueInput.value = formatCurrency(0);
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
            const today = new Date().setHours(0, 0, 0, 0);
            const paymentsDue = (client.paymentDates || []).filter(p => new Date(p.date).setHours(0, 0, 0, 0) < today && p.status !== 'paid').length;
            const status = paymentsDue > 0 ? '<span class="badge bg-danger">Atrasado</span>' : '<span class="badge bg-success">Em Dia</span>';
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
        document.getElementById('panel-cpf-phone').textContent = `CPF: ${client.cpf || 'N/A'} | Tel: ${client.phone || 'N/A'}`;
        const today = new Date().setHours(0, 0, 0, 0);
        const paymentsDue = (client.paymentdates || []).filter(p => new Date(p.date).setHours(0, 0, 0, 0) < today && p.status !== 'paid').length;
        document.getElementById('panel-status').innerHTML = paymentsDue > 0 ? '<span class="badge bg-danger">Atrasado</span>' : '<span class="badge bg-success">Em Dia</span>';

        document.getElementById('panel-loan-value').textContent = formatCurrency(client.loanvalue);
        document.getElementById('panel-installment-value').textContent = formatCurrency(client.installmentvalue);
        document.getElementById('panel-installments').textContent = `${client.installments || 'N/A'}x`;
        document.getElementById('panel-frequency').textContent = client.frequency === 'daily' ? 'Diário' : (client.frequency === 'weekly' ? 'Semanal' : 'N/A');
        document.getElementById('panel-start-date').textContent = client.startdate ? new Date(client.startdate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'A preencher';

        calendar.innerHTML = '';
        if (!client.startdate || !client.paymentdates || client.paymentdates.length === 0) {
            document.getElementById('panel-end-date').textContent = 'N/A';
            calendar.innerHTML = '<p class="text-center text-muted">Não foi possível gerar o calendário.</p>';
        } else {
            const paymentDates = client.paymentdates.map(p => ({ ...p, date: new Date(p.date) }));
            const allCalendarDates = [];
            let currentDate = new Date(paymentDates[0].date);
            const lastPaymentDate = new Date(paymentDates[paymentDates.length - 1].date);
            document.getElementById('panel-end-date').textContent = lastPaymentDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' });

            while (currentDate <= lastPaymentDate) {
                allCalendarDates.push(new Date(currentDate));
                currentDate.setUTCDate(currentDate.getUTCDate() + 1);
            }

            const firstDayOfWeek = allCalendarDates[0].getUTCDay();
            for (let i = 0; i < firstDayOfWeek; i++) {
                calendar.appendChild(document.createElement('div'));
            }

            allCalendarDates.forEach(date => {
                const dayDiv = document.createElement('div');
                dayDiv.textContent = date.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });
                dayDiv.classList.add('calendar-day');

                const payment = paymentDates.find(p => p.date.getTime() === date.getTime());
                if (payment) {
                    dayDiv.dataset.date = payment.date.toISOString();
                    const paymentDateMidnight = new Date(payment.date).setUTCHours(0, 0, 0, 0);
                    const todayUTC = new Date(new Date().toISOString().split('T')[0]).getTime();
                    if (payment.status === 'paid') dayDiv.classList.add('status-paid');
                    else if (paymentDateMidnight < todayUTC) dayDiv.classList.add('status-late');
                    else dayDiv.classList.add('status-pending');
                } else {
                    const dayOfWeek = date.getUTCDay();
                    if (dayOfWeek === 0 || dayOfWeek === 6) dayDiv.classList.add('status-weekend');
                    else dayDiv.classList.add('status-future');
                }
                calendar.appendChild(dayDiv);
            });
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

    function generatePaymentDates(startDateStr, installments, frequency) {
        if (!startDateStr || !installments || !frequency) return [];
        const paymentDates = [];
        let currentDate = new Date(startDateStr + 'T00:00:00Z');

        for (let i = 0; i < installments; i++) {
            if (frequency === 'daily') {
                let dayOfWeek = currentDate.getUTCDay();
                while (dayOfWeek === 0 || dayOfWeek === 6) {
                    currentDate.setUTCDate(currentDate.getUTCDate() + 1);
                    dayOfWeek = currentDate.getUTCDay();
                }
            }
            paymentDates.push({ date: new Date(currentDate).toISOString(), status: 'pending' });

            if (frequency === 'daily') {
                currentDate.setUTCDate(currentDate.getUTCDate() + 1);
            } else {
                currentDate.setUTCDate(currentDate.getUTCDate() + 7);
            }
        }
        return paymentDates;
    }

    function handleNewFiles(files) {
        for (const file of files) {
            if (!newClientFiles.some(f => f.name === file.name && f.size === file.size)) {
                newClientFiles.push(file);
            }
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
    applyInputMasks(clientCPFInput, formatCPF);
    applyInputMasks(clientPhoneInput, formatPhone);
    loanValueInput.addEventListener('input', (e) => {
        const value = parseCurrency(e.target.value);
        e.target.value = formatCurrency(value);
        updateInstallmentLogic();
    });
    installmentsInput.addEventListener('input', updateInstallmentLogic);
    document.querySelectorAll('input[name="frequency"]').forEach(radio => radio.addEventListener('change', updateInstallmentLogic));

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
        updateInstallmentLogic();
    });

    addClientForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const saveBtnSpinner = saveClientBtn.querySelector('.spinner-border');
        saveClientBtn.disabled = true;
        saveBtnSpinner.style.display = 'inline-block';

        const installments = parseInt(installmentsInput.value);
        const frequency = document.querySelector('input[name="frequency"]:checked').value;
        const startDate = document.getElementById('startDate').value || null;

        const clientData = {
            name: document.getElementById('clientName').value,
            startDate: startDate,
            cpf: clientCPFInput.value,
            phone: clientPhoneInput.value,
            loanValue: parseCurrency(loanValueInput.value),
            installmentValue: parseCurrency(installmentValueInput.value),
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
            const newClientId = newClient.id;

            if (newClientFiles.length > 0) {
                const uploadPromises = newClientFiles.map(file => {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('clientId', newClientId);
                    return fetch('/api/upload', { method: 'POST', body: formData });
                });
                await Promise.all(uploadPromises);
            }
            await loadClients();
            const modal = bootstrap.Modal.getInstance(addClientModalEl);
            modal.hide();
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
            renderClientPanel(clientId);
        }
    });

    markPaidBtn.addEventListener('click', async () => {
        if (selectedClientId === null) return;
        const clientIndex = clients.findIndex(c => c.id === selectedClientId);
        if (clientIndex === -1) return;
        const client = clients[clientIndex];
        const todayStr = new Date().toISOString().split('T')[0];
        const todayPayment = client.paymentdates.find(p => p.date.startsWith(todayStr));
        if (todayPayment) {
            if (todayPayment.status !== 'paid') {
                todayPayment.status = 'paid';
                const updatedClient = await updateClient(client);
                if (updatedClient) {
                    clients[clientIndex] = updatedClient;
                    renderClientPanel(selectedClientId);
                    alert('Pagamento de hoje marcado como recebido!');
                }
            } else {
                alert('O pagamento de hoje já foi marcado como recebido.');
            }
        } else {
            alert('Não há uma parcela de pagamento agendada para hoje.');
        }
    });

    calendar.addEventListener('click', async (e) => {
        const dayDiv = e.target.closest('.calendar-day:not(.status-weekend)');
        if (!dayDiv || !dayDiv.dataset.date || selectedClientId === null) return;
        const clientIndex = clients.findIndex(c => c.id === selectedClientId);
        const client = clients[clientIndex];
        const paymentDateStr = dayDiv.dataset.date;
        const payment = client.paymentdates.find(p => p.date === paymentDateStr);
        if (!payment) return;
        const newStatus = prompt(`Alterar status para o dia ${new Date(payment.date).toLocaleDateString('pt-BR', { timeZone: 'UTC' })}.\n\nDigite "pago" ou "pendente":`, payment.status);
        if (newStatus) {
            const statusCleaned = newStatus.toLowerCase().trim();
            if (['pago', 'pendente'].includes(statusCleaned)) {
                payment.status = statusCleaned === 'pago' ? 'paid' : 'pending';
                const updatedClient = await updateClient(client);
                if (updatedClient) {
                    clients[clientIndex] = updatedClient;
                    renderClientPanel(selectedClientId);
                }
            } else {
                alert('Status inválido. Por favor, use "pago" ou "pendente".');
            }
        }
    });

    editClientBtn.addEventListener('click', () => {
        if (selectedClientId === null) return;
        const client = clients.find(c => c.id === selectedClientId);
        if (!client) return;
        document.getElementById('editClientId').value = client.id;
        document.getElementById('editClientName').value = client.name;
        document.getElementById('editStartDate').value = client.startdate ? client.startdate.split('T')[0] : '';
        document.getElementById('editClientCPF').value = client.cpf || '';
        document.getElementById('editClientPhone').value = client.phone || '';
        document.getElementById('editLoanValue').value = formatCurrency(client.loanvalue);
        document.getElementById('editInstallmentValue').value = formatCurrency(client.installmentvalue);

        const modal = new bootstrap.Modal(document.getElementById('editClientModal'));
        modal.show();
    });

    editClientForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const clientId = parseInt(document.getElementById('editClientId').value);
        const clientIndex = clients.findIndex(c => c.id === clientId);
        if (clientIndex === -1) return;
        const currentClient = clients[clientIndex];

        // A lógica de edição precisará ser expandida para incluir os novos campos
        // Por agora, estamos apenas salvando os campos existentes
        const updatedClientData = {
            ...currentClient, // Mantém os campos não editados como installments, frequency, etc.
            id: clientId,
            name: document.getElementById('editClientName').value,
            startDate: document.getElementById('editStartDate').value || null,
            cpf: document.getElementById('editClientCPF').value,
            phone: document.getElementById('editClientPhone').value,
            loanValue: parseCurrency(document.getElementById('editLoanValue').value),
            // NOTE: A edição de parcelas e frequência precisaria de uma UI dedicada no modal de edição
        };
        const updatedClient = await updateClient(updatedClientData);
        if (updatedClient) {
            clients[clientIndex] = updatedClient;
            renderClientPanel(clientId);
        }
        const modal = bootstrap.Modal.getInstance(document.getElementById('editClientModal'));
        modal.hide();
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
                const newClient = { name: name, startDate: null, cpf: '', phone: '', loanValue: 0, installmentValue: 0, paymentDates: [], installments: 0, frequency: 'daily' };
                try {
                    const response = await fetch('/api/clients', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newClient),
                    });
                    if (response.ok) newClientsAddedCount++;
                } catch (error) {
                    console.error(`Erro ao adicionar ${name}:`, error);
                }
            }
        }
        if (newClientsAddedCount > 0) {
            await loadClients();
            alert(`${newClientsAddedCount} novo(s) cliente(s) foram adicionado(s) com sucesso!`);
        } else {
            alert('Nenhum cliente novo foi encontrado na lista para adicionar.');
        }
        const modal = bootstrap.Modal.getInstance(document.getElementById('syncClientsModal'));
        modal.hide();
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
            const response = await fetch('/api/upload', {
                method: 'POST',
                body: formData,
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Falha no upload.');
            }
            const updatedClient = await response.json();
            const clientIndex = clients.findIndex(c => c.id === selectedClientId);
            clients[clientIndex] = updatedClient;
            renderClientPanel(selectedClientId);
            uploadProgressBar.style.width = '100%';
            uploadProgressBar.textContent = 'Concluído!';
            uploadProgressBar.classList.add('bg-success');
            setTimeout(() => {
                uploadProgressBarContainer.style.display = 'none';
            }, 2000);
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
        if (!selectedClientId || !fileName) return;
        if (!confirm(`Tem certeza que deseja excluir o arquivo "${fileName}"?`)) {
            return;
        }
        try {
            const response = await fetch('/api/upload', {
                method: 'DELETE',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({
                    clientId: selectedClientId,
                    fileName: fileName
                })
            });
            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.error || 'Falha ao excluir arquivo.');
            }
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
    loadClients();
});