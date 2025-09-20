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
    // NOVOS ELEMENTOS DO DOM PARA ARQUIVOS
    const fileList = document.getElementById('file-list');
    const uploadFileForm = document.getElementById('upload-file-form');
    const fileInput = document.getElementById('file-input');
    const uploadBtn = document.getElementById('upload-btn');
    const uploadProgressBarContainer = document.getElementById('upload-progress-bar-container');
    const uploadProgressBar = document.getElementById('upload-progress-bar');


    // --- ESTADO DA APLICAÇÃO ---
    let clients = [];
    let selectedClientId = null;

    // --- FUNÇÕES DE API (COMUNICAÇÃO COM O BACK-END) ---

    // Carrega clientes do banco de dados
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

    // Atualiza um cliente no banco de dados
    async function updateClient(clientData) {
        try {
            const response = await fetch('/api/clients', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(clientData),
            });
            if (!response.ok) throw new Error('Falha ao atualizar cliente.');
            return await response.json();
        } catch (error) {
            console.error('Erro em updateClient:', error);
            alert('Não foi possível salvar as alterações do cliente.');
        }
    }


    // --- FUNÇÕES DE RENDERIZAÇÃO (PRATICAMENTE INALTERADAS) ---
    function renderClientList() {
        clientListBody.innerHTML = '';
        if (clients.length === 0) {
            clientListBody.innerHTML = '<tr><td colspan="4" class="text-center text-muted">Nenhum cliente cadastrado.</td></tr>';
            return;
        }

        // Não precisa mais ordenar aqui, o back-end já faz isso (ORDER BY id DESC)
        clients.forEach(client => {
            const tr = document.createElement('tr');
            tr.dataset.clientId = client.id;
            tr.className = client.id === selectedClientId ? 'table-active' : '';

            const today = new Date().setHours(0, 0, 0, 0);
            const paymentsDue = (client.paymentDates || []).filter(p => new Date(p.date).setHours(0, 0, 0, 0) < today && p.status !== 'paid').length;
            const status = paymentsDue > 0 ? '<span class="badge bg-danger">Atrasado</span>' : '<span class="badge bg-success">Em Dia</span>';
            // Correção para datas que podem ser nulas
            const startDateDisplay = client.startDate ? new Date(client.startDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A';


            tr.innerHTML = `
                <td>#${client.id}</td>
                <td>${client.name}</td>
                <td>${status}</td>
                <td>${startDateDisplay}</td>
            `;
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
        const paymentsDue = (client.paymentDates || []).filter(p => new Date(p.date).setHours(0, 0, 0, 0) < today && p.status !== 'paid').length;
        document.getElementById('panel-status').innerHTML = paymentsDue > 0 ? '<span class="badge bg-danger">Atrasado</span>' : '<span class="badge bg-success">Em Dia</span>';

        const currencyFormatter = new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' });
        document.getElementById('panel-loan-value').textContent = currencyFormatter.format(client.loanValue || 0);
        document.getElementById('panel-daily-value').textContent = currencyFormatter.format(client.dailyValue || 0);
        document.getElementById('panel-start-date').textContent = client.startDate ? new Date(client.startDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'A preencher';

        calendar.innerHTML = '';
        if (!client.startDate || !client.paymentDates || client.paymentDates.length === 0) {
            document.getElementById('panel-end-date').textContent = 'N/A';
            calendar.innerHTML = '<p class="text-center text-muted">Preencha os dados financeiros para gerar o calendário.</p>';
        } else {
            const firstPaymentDate = new Date(client.paymentDates[0].date);
            const lastPaymentDate = new Date(client.paymentDates[client.paymentDates.length - 1].date);
            document.getElementById('panel-end-date').textContent = lastPaymentDate.toLocaleDateString('pt-BR', { timeZone: 'UTC' });

            let currentDate = new Date(firstPaymentDate);
            const firstDayOfWeek = new Date(currentDate.toLocaleString('en-US', { timeZone: 'UTC' })).getDay();

            for (let i = 0; i < (firstDayOfWeek === 0 ? 6 : firstDayOfWeek - 1); i++) {
                calendar.appendChild(document.createElement('div'));
            }

            while (currentDate <= lastPaymentDate) {
                const dayDiv = document.createElement('div');
                const dayOfWeek = currentDate.getUTCDay();
                dayDiv.textContent = currentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });
                dayDiv.classList.add('calendar-day');

                if (dayOfWeek === 0 || dayOfWeek === 6) {
                    dayDiv.classList.add('status-weekend');
                } else {
                    const payment = client.paymentDates.find(p => new Date(p.date).setUTCHours(0, 0, 0, 0) === new Date(currentDate).setUTCHours(0, 0, 0, 0));
                    if (payment) {
                        dayDiv.dataset.date = payment.date;
                        const paymentDateMidnight = new Date(payment.date).setUTCHours(0, 0, 0, 0);
                        const todayUTC = new Date(new Date().toISOString().split('T')[0]).getTime();

                        if (payment.status === 'paid') {
                            dayDiv.classList.add('status-paid');
                        } else if (paymentDateMidnight < todayUTC) {
                            dayDiv.classList.add('status-late');
                            payment.status = 'late';
                        } else {
                            dayDiv.classList.add('status-pending');
                        }
                    } else {
                        dayDiv.classList.add('status-future');
                    }
                }
                calendar.appendChild(dayDiv);
                currentDate.setUTCDate(currentDate.getUTCDate() + 1);
            }
        }

        // NOVO: Renderizar a lista de arquivos
        fileList.innerHTML = ''; // Limpa a lista anterior
        if (client.files && client.files.length > 0) {
            client.files.forEach(file => {
                const li = document.createElement('li');
                li.className = 'list-group-item d-flex justify-content-between align-items-center';
                li.innerHTML = `
                    <span>
                        <i class="bi bi-file-earmark-text"></i> ${file.name}
                    </span>
                    <div>
                        <a href="${file.url}" target="_blank" class="btn btn-outline-primary btn-sm" title="Ver Arquivo">
                            <i class="bi bi-eye"></i>
                        </a>
                        <button class="btn btn-outline-danger btn-sm delete-file-btn" data-filename="${file.name}" title="Excluir Arquivo">
                            <i class="bi bi-trash"></i>
                        </button>
                    </div>
                `;
                fileList.appendChild(li);
            });
        } else {
            fileList.innerHTML = '<li class="list-group-item text-muted">Nenhum arquivo encontrado.</li>';
        }

        renderClientList();
    }

    // Gera datas de pagamento (função auxiliar, sem alterações)
    function generatePaymentDates(startDateStr) {
        if (!startDateStr) return [];
        const paymentDates = [];
        let currentDate = new Date(startDateStr + 'T00:00:00Z'); // Usar UTC
        let businessDaysCount = 0;
        while (businessDaysCount < 20) {
            const dayOfWeek = currentDate.getUTCDay();
            if (dayOfWeek !== 0 && dayOfWeek !== 6) {
                businessDaysCount++;
                paymentDates.push({ date: currentDate.toISOString(), status: 'pending' });
            }
            currentDate.setUTCDate(currentDate.getUTCDate() + 1);
        }
        return paymentDates;
    }

    // --- EVENT LISTENERS (AGORA USAM FUNÇÕES DE API) ---

    addClientForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const newClient = {
            name: document.getElementById('clientName').value,
            startDate: document.getElementById('startDate').value || null,
            cpf: document.getElementById('clientCPF').value,
            phone: document.getElementById('clientPhone').value,
            loanValue: parseFloat(document.getElementById('loanValue').value),
            dailyValue: parseFloat(document.getElementById('dailyValue').value),
            paymentDates: generatePaymentDates(document.getElementById('startDate').value)
        };

        try {
            const response = await fetch('/api/clients', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(newClient),
            });
            if (!response.ok) throw new Error('Falha ao adicionar cliente.');

            await loadClients(); // Recarrega a lista do servidor
            addClientForm.reset();
            const modal = bootstrap.Modal.getInstance(document.getElementById('addClientModal'));
            modal.hide();
        } catch (error) {
            console.error('Erro ao adicionar cliente:', error);
            alert('Não foi possível adicionar o novo cliente.');
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
        const todayPayment = client.paymentDates.find(p => p.date.startsWith(todayStr));

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
        const payment = client.paymentDates.find(p => p.date === paymentDateStr);
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
        document.getElementById('editStartDate').value = client.startDate || '';
        document.getElementById('editClientCPF').value = client.cpf || '';
        document.getElementById('editClientPhone').value = client.phone || '';
        document.getElementById('editLoanValue').value = client.loanValue || '';
        document.getElementById('editDailyValue').value = client.dailyValue || '';

        const modal = new bootstrap.Modal(document.getElementById('editClientModal'));
        modal.show();
    });

    editClientForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const clientId = parseInt(document.getElementById('editClientId').value);
        const clientIndex = clients.findIndex(c => c.id === clientId);
        if (clientIndex === -1) return;

        // Manter arquivos existentes ao editar
        const currentClient = clients[clientIndex];
        const updatedClientData = {
            id: clientId,
            name: document.getElementById('editClientName').value,
            startDate: document.getElementById('editStartDate').value || null,
            cpf: document.getElementById('editClientCPF').value,
            phone: document.getElementById('editClientPhone').value,
            loanValue: parseFloat(document.getElementById('editLoanValue').value),
            dailyValue: parseFloat(document.getElementById('editDailyValue').value),
            paymentDates: generatePaymentDates(document.getElementById('editStartDate').value),
            files: currentClient.files || [] // Mantém os arquivos
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

                await loadClients(); // Recarrega a lista
                renderClientPanel(null); // Reseta o painel
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
                const newClient = {
                    name: name,
                    startDate: null,
                    cpf: '',
                    phone: '',
                    loanValue: 0,
                    dailyValue: 0,
                    paymentDates: []
                };

                try {
                    const response = await fetch('/api/clients', {
                        method: 'POST',
                        headers: { 'Content-Type': 'application/json' },
                        body: JSON.stringify(newClient),
                    });
                    if (response.ok) {
                        newClientsAddedCount++;
                    }
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

    // --- NOVO: EVENT LISTENERS PARA ARQUIVOS ---

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
    loadClients(); // Carrega os dados do servidor ao iniciar a página
});