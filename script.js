document.addEventListener('DOMContentLoaded', () => {
    if (sessionStorage.getItem('isAuthenticated') !== 'true') {
        window.location.href = '/login.html';
        return;
    }

    // ADICIONE ESSA LINHA AQUI:
    const token = sessionStorage.getItem('authToken');
    const userRole = sessionStorage.getItem('userRole'); // Pega o cargo (admin ou cobrador)

    // NOVA VARIÁVEL GLOBAL
    let globalHolidays = [];
    let globalResponsiblesList = []; // Cache da lista

    let easterEggPlayed = false;

    function playBolsonaroMeme() {
        if (easterEggPlayed) return;
        easterEggPlayed = true;

        const overlay = document.createElement("div");
        overlay.style.position = "fixed";
        overlay.style.top = "0";
        overlay.style.left = "0";
        overlay.style.width = "100vw";
        overlay.style.height = "100vh";
        overlay.style.background = "black";
        overlay.style.zIndex = "999999";
        overlay.style.display = "flex";
        overlay.style.alignItems = "center";
        overlay.style.justifyContent = "center";

        const video = document.createElement("video");
        video.src = "bolsonaro.mp4"; // nome do vídeo
        video.autoplay = true;
        video.playsInline = true;
        video.style.width = "100%";
        video.style.height = "100%";
        video.style.objectFit = "cover";

        overlay.appendChild(video);
        document.body.appendChild(overlay);

        const fechar = () => {
            overlay.remove();
            easterEggPlayed = false;
        };

        video.addEventListener("ended", fechar);
        overlay.addEventListener("click", fechar);

        video.play().catch(() => { });
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
    const routesBtn = document.getElementById('routes-btn');
    const routesModalEl = document.getElementById('routesModal');
    const routeCityFilter = document.getElementById('routeCityFilter');
    const routeNeighborhoodSelect = document.getElementById('routeNeighborhoodSelect');
    const addRouteNeighborhoodBtn = document.getElementById('addRouteNeighborhoodBtn');
    const routeEligibleSummary = document.getElementById('routeEligibleSummary');
    const routeOrderList = document.getElementById('routeOrderList');
    const generateRoutesBtn = document.getElementById('generateRoutesBtn');
    const routesResultModalEl = document.getElementById('routesResultModal');
    const routesResultContainer = document.getElementById('routesResultContainer');
    const copyAllRoutesBtn = document.getElementById('copyAllRoutesBtn');
    const routePatternSelect = document.getElementById('routePatternSelect');
    const applyRoutePatternBtn = document.getElementById('applyRoutePatternBtn');
    const deleteRoutePatternBtn = document.getElementById('deleteRoutePatternBtn');
    const routePatternNameInput = document.getElementById('routePatternNameInput');
    const saveRoutePatternBtn = document.getElementById('saveRoutePatternBtn');
    const updateRoutePatternBtn = document.getElementById('updateRoutePatternBtn');
    const routePatternFeedback = document.getElementById('routePatternFeedback');

    const agreementsBtn = document.getElementById('agreements-btn');
    const agreementsBadge = document.getElementById('agreements-badge');
    const agreementsModalEl = document.getElementById('agreementsModal');
    const agreementsTodaySection = document.getElementById('agreements-today-section');
    const agreementsTodayList = document.getElementById('agreements-today-list');
    const agreementsUpcomingList = document.getElementById('agreements-upcoming-list');
    const responsibleSelect = document.getElementById('responsibleSelect');
    const manageResponsiblesBtn = document.getElementById('manage-responsibles-btn');
    const responsiblesModalEl = document.getElementById('responsiblesModal');
    const newRespNameInput = document.getElementById('newRespName');
    const saveNewRespBtn = document.getElementById('saveNewRespBtn');
    const responsiblesList = document.getElementById('responsiblesList');

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
    const panelRouteNeighborhood = document.getElementById('panel-route-neighborhood');
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
    const riskBtn = document.getElementById('risk-btn');
    const vipOfferBtn = document.getElementById('vip-offer-btn');
    const vipStrategyModalEl = document.getElementById('vipStrategyModal');
    const vipResgateBtn = document.getElementById('vip-resgate-btn');
    const vipQuitacaoOfertaBtn = document.getElementById('vip-quitacao-oferta-btn');
    const vipQuitacaoSecaBtn = document.getElementById('vip-quitacao-seca-btn');
    // --- ELEMENTOS DO MODAL DE ADIÇÃO ---
    const addClientModalEl = document.getElementById('addClientModal');
    const addClientForm = document.getElementById('add-client-form');
    const clientIdInput = document.getElementById('clientId');
    const clientCPFInput = document.getElementById('clientCPF');
    const clientPhoneInput = document.getElementById('clientPhone');
    const locationInput = document.getElementById('location');
    const neighborhoodInput = document.getElementById('neighborhood');
    const routeCitySelect = document.getElementById('routeCity');
    const routeNeighborhoodSelectInput = document.getElementById('routeNeighborhood');
    const routeNeighborhoodSuggestions = document.getElementById('routeNeighborhoodSuggestions');
    const routeNewNeighborhoodInput = document.getElementById('routeNewNeighborhood');
    const addNeighborhoodBtn = document.getElementById('addNeighborhoodBtn');
    const editNeighborhoodBtn = document.getElementById('editNeighborhoodBtn');
    const removeNeighborhoodBtn = document.getElementById('removeNeighborhoodBtn');
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
    const pauseNoteInput = document.getElementById('pauseNoteInput');
    const reminderPauseNoteDisplay = document.getElementById('reminder-pause-note-display');
    // --- ELEMENTOS DO MODAL DE EDIÇÃO ---
    const editClientModalEl = document.getElementById('editClientModal');
    const editClientForm = document.getElementById('edit-client-form');
    const editClientIdDisplay = document.getElementById('editClientIdDisplay');
    const editClientCPFInput = document.getElementById('editClientCPF');
    const editClientPhoneInput = document.getElementById('editClientPhone');
    const editLocationInput = document.getElementById('editLocation');
    const editNeighborhoodInput = document.getElementById('editNeighborhood');
    const editRouteCitySelect = document.getElementById('editRouteCity');
    const editRouteNeighborhoodSelect = document.getElementById('editRouteNeighborhood');
    const editRouteNeighborhoodSuggestions = document.getElementById('editRouteNeighborhoodSuggestions');
    const editRouteNewNeighborhoodInput = document.getElementById('editRouteNewNeighborhood');
    const editAddNeighborhoodBtn = document.getElementById('editAddNeighborhoodBtn');
    const editEditNeighborhoodBtn = document.getElementById('editEditNeighborhoodBtn');
    const editRemoveNeighborhoodBtn = document.getElementById('editRemoveNeighborhoodBtn');
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

    // --- ELEMENTOS DO AVISO PERSONALIZADO ---
    const customMessageBtn = document.getElementById('custom-message-btn');
    const customMessageModalEl = document.getElementById('customMessageModal');
    const customMsgCountText = document.getElementById('custom-msg-count-text');
    const customMessageInput = document.getElementById('customMessageInput');
    const sendCustomMsgBtn = document.getElementById('send-custom-msg-btn');
    let clientsForCustomMsg = []; // Estado para guardar a lista filtrada

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

    // Estado da geração de rotas
    let selectedRouteNeighborhoods = [];
    let routeGroupsByKey = new Map();
    let generatedRoutesFullText = '';
    let savedRoutePatterns = [];

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

    const baseNeighborhoodsByCity = window.BAIRROS_POR_CIDADE || {};
    let neighborhoodsByCity = {
        "Cuiabá": [...(baseNeighborhoodsByCity["Cuiabá"] || [])],
        "Várzea Grande": [...(baseNeighborhoodsByCity["Várzea Grande"] || [])]
    };
    let neighborhoodCatalogRecords = [];

    function normalizeNeighborhoodText(value) {
        return String(value || '')
            .normalize('NFD')
            .replace(/[\u0300-\u036f]/g, '')
            .toLocaleLowerCase('pt-BR')
            .trim();
    }

    function getNeighborhoodsForCity(city) {
        return [...(neighborhoodsByCity[city] || [])]
            .sort((a, b) => a.localeCompare(b, 'pt-BR'));
    }

    function getNeighborhoodRecord(city, name) {
        const normalizedName = normalizeNeighborhoodText(name);
        return neighborhoodCatalogRecords.find(record =>
            record.city === city &&
            normalizeNeighborhoodText(record.name) === normalizedName
        ) || null;
    }

    function closeNeighborhoodSuggestions(suggestionsElement) {
        suggestionsElement.innerHTML = '';
        suggestionsElement.classList.add('d-none');
    }

    function renderNeighborhoodSuggestions(config) {
        const {
            citySelect,
            neighborhoodInput,
            suggestionsElement
        } = config;

        const city = citySelect.value;
        if (!city || neighborhoodInput.disabled) {
            closeNeighborhoodSuggestions(suggestionsElement);
            return;
        }

        const term = normalizeNeighborhoodText(neighborhoodInput.value);
        const matches = getNeighborhoodsForCity(city)
            .filter(name => !term || normalizeNeighborhoodText(name).includes(term));

        suggestionsElement.innerHTML = '';

        if (matches.length === 0) {
            const emptyItem = document.createElement('div');
            emptyItem.className = 'list-group-item text-muted small';
            emptyItem.textContent = 'Nenhum bairro encontrado.';
            suggestionsElement.appendChild(emptyItem);
        } else {
            matches.forEach(name => {
                const button = document.createElement('button');
                button.type = 'button';
                button.className = 'list-group-item list-group-item-action neighborhood-suggestion';
                button.dataset.neighborhood = name;
                button.textContent = name;
                suggestionsElement.appendChild(button);
            });
        }

        suggestionsElement.classList.remove('d-none');
    }

    function updateNeighborhoodManagerState(config) {
        const {
            citySelect,
            neighborhoodInput,
            newNeighborhoodInput,
            addButton,
            editButton,
            removeButton,
            requiresUnlock = false
        } = config;

        const citySelected = Boolean(citySelect.value);
        const managerUnlocked = !requiresUnlock || !newNeighborhoodInput.readOnly;
        const selectedRecord = citySelected
            ? getNeighborhoodRecord(citySelect.value, neighborhoodInput.value)
            : null;
        const hasNewName = Boolean(newNeighborhoodInput.value.trim());

        newNeighborhoodInput.disabled = !citySelected || !managerUnlocked;
        addButton.disabled = !citySelected || !managerUnlocked || !hasNewName;
        editButton.disabled = !citySelected || !managerUnlocked || !selectedRecord || !hasNewName;
        removeButton.disabled = !citySelected || !managerUnlocked || !selectedRecord;
    }

    function configureNeighborhoodInput(config, selectedValue = '') {
        const {
            citySelect,
            neighborhoodInput,
            suggestionsElement
        } = config;

        const citySelected = Boolean(citySelect.value);
        neighborhoodInput.disabled = !citySelected;
        neighborhoodInput.value = selectedValue || '';

        if (!citySelected) {
            neighborhoodInput.placeholder = 'Selecione primeiro a cidade...';
        } else {
            neighborhoodInput.placeholder = 'Pesquise pelo nome do bairro...';
        }

        closeNeighborhoodSuggestions(suggestionsElement);
        updateNeighborhoodManagerState(config);
    }

    function rebuildNeighborhoodsByCity() {
        const rebuilt = {
            "Cuiabá": [],
            "Várzea Grande": []
        };

        neighborhoodCatalogRecords.forEach(record => {
            if (!rebuilt[record.city]) rebuilt[record.city] = [];
            rebuilt[record.city].push(record.name);
        });

        Object.keys(rebuilt).forEach(city => {
            rebuilt[city] = [...new Set(rebuilt[city])]
                .sort((a, b) => a.localeCompare(b, 'pt-BR'));
        });

        neighborhoodsByCity = rebuilt;
    }

    async function loadNeighborhoodCatalog() {
        try {
            const response = await fetch('/api/neighborhoods', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Falha ao carregar bairros.');
            }

            const data = await response.json();
            neighborhoodCatalogRecords = Array.isArray(data)
                ? data
                : (data.neighborhoods || []);

            rebuildNeighborhoodsByCity();
        } catch (error) {
            console.error('Erro ao carregar catálogo de bairros:', error);

            // Fallback: mantém a lista fixa atual caso a nova API ainda não esteja disponível.
            neighborhoodCatalogRecords = [];
            neighborhoodsByCity = {
                "Cuiabá": [...(baseNeighborhoodsByCity["Cuiabá"] || [])],
                "Várzea Grande": [...(baseNeighborhoodsByCity["Várzea Grande"] || [])]
            };
        }

        configureNeighborhoodInput(addNeighborhoodConfig, routeNeighborhoodSelectInput.value);
        configureNeighborhoodInput(editNeighborhoodConfig, editRouteNeighborhoodSelect.value);
    }

    async function requestNeighborhoodCatalog(method, payload = null, id = null) {
        const url = id
            ? `/api/neighborhoods?id=${encodeURIComponent(id)}`
            : '/api/neighborhoods';

        const options = {
            method,
            headers: {
                'Authorization': `Bearer ${token}`
            }
        };

        if (payload) {
            options.headers['Content-Type'] = 'application/json';
            options.body = JSON.stringify(payload);
        }

        const response = await fetch(url, options);
        const data = await response.json().catch(() => ({}));

        if (!response.ok) {
            throw new Error(data.error || 'Não foi possível atualizar o bairro.');
        }

        return data;
    }

    function updateClientsAfterNeighborhoodRename(city, oldName, newName) {
        const arrays = [
            allClientsForSearch,
            clients,
            activeClients,
            settledClients,
            overdueClients
        ];

        arrays.forEach(list => {
            (list || []).forEach(client => {
                if (
                    client.cidade_rota === city &&
                    normalizeNeighborhoodText(client.bairro_rota) === normalizeNeighborhoodText(oldName)
                ) {
                    client.bairro_rota = newName;
                }
            });
        });

        updateFilterPanel();

        if (selectedClientId !== null) {
            renderClientPanel(selectedClientId);
        }

        if (searchInput.value) {
            filterClientList();
        } else if (activeFilterButton) {
            activeFilterButton.click();
        } else {
            renderClientList();
        }
    }

    async function addNeighborhoodFromConfig(config) {
        const city = config.citySelect.value;
        const name = config.newNeighborhoodInput.value.trim();

        if (!city || !name) {
            alert('Selecione a cidade e digite o nome do novo bairro.');
            return;
        }

        config.addButton.disabled = true;

        try {
            const created = await requestNeighborhoodCatalog('POST', { city, name });
            await loadNeighborhoodCatalog();

            config.neighborhoodInput.value = created.name || name;
            config.newNeighborhoodInput.value = '';
            closeNeighborhoodSuggestions(config.suggestionsElement);
            updateNeighborhoodManagerState(config);

            alert(`Bairro "${created.name || name}" adicionado com sucesso.`);
        } catch (error) {
            alert(error.message);
        } finally {
            updateNeighborhoodManagerState(config);
        }
    }

    async function editNeighborhoodFromConfig(config) {
        const city = config.citySelect.value;
        const selectedName = config.neighborhoodInput.value.trim();
        const newName = config.newNeighborhoodInput.value.trim();
        const record = getNeighborhoodRecord(city, selectedName);

        if (!record) {
            alert('Selecione um Bairro 2 válido para editar.');
            return;
        }

        if (!newName) {
            alert('Digite o novo nome do bairro no campo "Adicionar novo bairro".');
            return;
        }

        if (!confirm(`Alterar "${record.name}" para "${newName}"? Os clientes desse bairro também serão atualizados.`)) {
            return;
        }

        config.editButton.disabled = true;

        try {
            const updated = await requestNeighborhoodCatalog('PUT', {
                id: record.id,
                city,
                name: newName
            });

            updateClientsAfterNeighborhoodRename(city, record.name, updated.name || newName);
            await loadNeighborhoodCatalog();

            config.neighborhoodInput.value = updated.name || newName;
            config.newNeighborhoodInput.value = '';
            closeNeighborhoodSuggestions(config.suggestionsElement);
            updateNeighborhoodManagerState(config);

            alert(`Bairro atualizado para "${updated.name || newName}".`);
        } catch (error) {
            alert(error.message);
        } finally {
            updateNeighborhoodManagerState(config);
        }
    }

    async function removeNeighborhoodFromConfig(config) {
        const city = config.citySelect.value;
        const selectedName = config.neighborhoodInput.value.trim();
        const record = getNeighborhoodRecord(city, selectedName);

        if (!record) {
            alert('Selecione um Bairro 2 válido para remover.');
            return;
        }

        if (!confirm(`Remover "${record.name}" da lista de bairros de ${city}?`)) {
            return;
        }

        config.removeButton.disabled = true;

        try {
            await requestNeighborhoodCatalog('DELETE', null, record.id);
            await loadNeighborhoodCatalog();

            config.neighborhoodInput.value = '';
            config.newNeighborhoodInput.value = '';
            closeNeighborhoodSuggestions(config.suggestionsElement);
            updateNeighborhoodManagerState(config);

            alert(`Bairro "${record.name}" removido da lista.`);
        } catch (error) {
            alert(error.message);
        } finally {
            updateNeighborhoodManagerState(config);
        }
    }

    function setupNeighborhoodCombobox(config) {
        config.citySelect.addEventListener('change', () => {
            config.neighborhoodInput.value = '';
            config.newNeighborhoodInput.value = '';
            configureNeighborhoodInput(config);
        });

        config.neighborhoodInput.addEventListener('focus', () => {
            renderNeighborhoodSuggestions(config);
        });

        config.neighborhoodInput.addEventListener('input', () => {
            renderNeighborhoodSuggestions(config);
            updateNeighborhoodManagerState(config);
        });

        config.neighborhoodInput.addEventListener('keydown', (event) => {
            if (event.key === 'Escape') {
                closeNeighborhoodSuggestions(config.suggestionsElement);
                return;
            }

            if (event.key === 'Enter') {
                const firstSuggestion = config.suggestionsElement
                    .querySelector('.neighborhood-suggestion');

                if (firstSuggestion) {
                    event.preventDefault();
                    config.neighborhoodInput.value = firstSuggestion.dataset.neighborhood;
                    closeNeighborhoodSuggestions(config.suggestionsElement);
                    updateNeighborhoodManagerState(config);
                }
            }
        });

        config.suggestionsElement.addEventListener('click', (event) => {
            const selectedButton = event.target.closest('.neighborhood-suggestion');
            if (!selectedButton) return;

            config.neighborhoodInput.value = selectedButton.dataset.neighborhood;
            closeNeighborhoodSuggestions(config.suggestionsElement);
            updateNeighborhoodManagerState(config);
        });

        config.newNeighborhoodInput.addEventListener('input', () => {
            updateNeighborhoodManagerState(config);
        });

        config.addButton.addEventListener('click', () => addNeighborhoodFromConfig(config));
        config.editButton.addEventListener('click', () => editNeighborhoodFromConfig(config));
        config.removeButton.addEventListener('click', () => removeNeighborhoodFromConfig(config));
    }

    const addNeighborhoodConfig = {
        citySelect: routeCitySelect,
        neighborhoodInput: routeNeighborhoodSelectInput,
        suggestionsElement: routeNeighborhoodSuggestions,
        newNeighborhoodInput: routeNewNeighborhoodInput,
        addButton: addNeighborhoodBtn,
        editButton: editNeighborhoodBtn,
        removeButton: removeNeighborhoodBtn,
        requiresUnlock: false
    };

    const editNeighborhoodConfig = {
        citySelect: editRouteCitySelect,
        neighborhoodInput: editRouteNeighborhoodSelect,
        suggestionsElement: editRouteNeighborhoodSuggestions,
        newNeighborhoodInput: editRouteNewNeighborhoodInput,
        addButton: editAddNeighborhoodBtn,
        editButton: editEditNeighborhoodBtn,
        removeButton: editRemoveNeighborhoodBtn,
        requiresUnlock: true
    };

    setupNeighborhoodCombobox(addNeighborhoodConfig);
    setupNeighborhoodCombobox(editNeighborhoodConfig);

    document.addEventListener('click', (event) => {
        if (!event.target.closest('.neighborhood-combobox')) {
            closeNeighborhoodSuggestions(routeNeighborhoodSuggestions);
            closeNeighborhoodSuggestions(editRouteNeighborhoodSuggestions);
        }
    });

    function getCuiabaToday() {
        const timeZone = 'America/Cuiaba';
        const todayString = new Date().toLocaleDateString('en-CA', { timeZone });
        return {
            timeZone,
            todayString,
            today: new Date(todayString + 'T00:00:00.000Z')
        };
    }

    function getLateInstallments(client) {
        const { today } = getCuiabaToday();
        return (client.paymentDates || []).filter(payment =>
            new Date(payment.date) < today && payment.status !== 'paid'
        );
    }

    function buildCollectionMessage(client, chargeInterest, customObservation = '') {
        const { timeZone, todayString, today } = getCuiabaToday();

        const lateInstallments = (client.paymentDates || []).filter(payment =>
            new Date(payment.date) < today && payment.status !== 'paid'
        );

        const todayInstallment = (client.paymentDates || []).find(payment =>
            payment.date.startsWith(todayString) && payment.status !== 'paid'
        );

        let totalInterest = 0;

        if (chargeInterest && lateInstallments.length > 0) {
            const clientInterestRate = parseFloat(client.taxa_juros || 20) / 100;
            const interestPerInstallment = parseFloat(client.dailyValue) * clientInterestRate;
            totalInterest = lateInstallments.length * interestPerInstallment;
        }

        let totalValue = lateInstallments.length * parseFloat(client.dailyValue || 0);
        totalValue += totalInterest;

        if (todayInstallment) {
            totalValue += parseFloat(client.dailyValue || 0);
        }

        const clientBalance = parseFloat(client.saldo || 0);
        if (clientBalance > 0) {
            totalValue -= clientBalance;
        }

        if (totalValue < 0) totalValue = 0;

        const standardizedNeighborhood = client.bairro_rota
            ? `${client.bairro_rota}${client.cidade_rota ? ` - ${client.cidade_rota}` : ''}`
            : 'N/A';

        let message = `*Cliente:* ${client.name}\n`;
        message += `*Telefone:* ${client.phone ? formatPhone(client.phone) : 'N/A'}\n`;
        message += `*Profissão:* ${client.profissao || 'N/A'}\n`;
        message += `*Bairro:* ${client.bairro || 'N/A'}\n`;
        message += `*Bairro 2:* ${standardizedNeighborhood}\n\n`;

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

        return message;
    }

    async function copyTextToClipboard(text) {
        if (navigator.clipboard && window.isSecureContext) {
            await navigator.clipboard.writeText(text);
            return;
        }

        const temporaryTextarea = document.createElement('textarea');
        temporaryTextarea.value = text;
        temporaryTextarea.style.position = 'fixed';
        temporaryTextarea.style.opacity = '0';
        document.body.appendChild(temporaryTextarea);
        temporaryTextarea.select();
        document.execCommand('copy');
        temporaryTextarea.remove();
    }

    async function copyWithButtonFeedback(button, text) {
        try {
            await copyTextToClipboard(text);

            const originalHTML = button.innerHTML;
            button.innerHTML = '<i class="bi bi-check-lg"></i> Copiado!';
            button.disabled = true;

            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.disabled = false;
            }, 1600);
        } catch (error) {
            console.error('Erro ao copiar:', error);
            alert('Não foi possível copiar o texto.');
        }
    }

    const routeImageClipboardCache = new Map();

    function isRoutePreviewImage(file) {
        const source = `${file?.name || ''} ${file?.url || ''}`.toLowerCase();
        return /\.(png|jpe?g|webp|gif|bmp|avif)(?:$|[?#\s])/.test(source);
    }

    function getRouteFileExtension(file) {
        const fileName = String(file?.name || '').split('?')[0];
        const parts = fileName.split('.');
        return parts.length > 1 ? parts.pop().toUpperCase() : 'ARQUIVO';
    }

    function convertImageBlobToPng(blob) {
        if (blob.type === 'image/png') return Promise.resolve(blob);

        return new Promise((resolve, reject) => {
            const imageUrl = URL.createObjectURL(blob);
            const image = new Image();

            image.onload = () => {
                try {
                    const canvas = document.createElement('canvas');
                    canvas.width = image.naturalWidth;
                    canvas.height = image.naturalHeight;

                    const context = canvas.getContext('2d');
                    if (!context) {
                        throw new Error('Não foi possível preparar a imagem para cópia.');
                    }

                    context.drawImage(image, 0, 0);
                    canvas.toBlob(pngBlob => {
                        URL.revokeObjectURL(imageUrl);

                        if (!pngBlob) {
                            reject(new Error('Não foi possível converter a imagem para PNG.'));
                            return;
                        }

                        resolve(pngBlob);
                    }, 'image/png');
                } catch (error) {
                    URL.revokeObjectURL(imageUrl);
                    reject(error);
                }
            };

            image.onerror = () => {
                URL.revokeObjectURL(imageUrl);
                reject(new Error('Não foi possível carregar a imagem para cópia.'));
            };

            image.src = imageUrl;
        });
    }

    async function prepareRouteImageForClipboard(client, file) {
        if (!file?.key) {
            throw new Error('Este arquivo antigo não possui a chave necessária para cópia direta.');
        }

        const cacheKey = `${client.id}|||${file.key}`;
        if (routeImageClipboardCache.has(cacheKey)) {
            return routeImageClipboardCache.get(cacheKey);
        }

        const response = await fetch(
            `/api/upload?clientId=${encodeURIComponent(client.id)}&key=${encodeURIComponent(file.key)}`,
            {
                headers: {
                    'Authorization': `Bearer ${token}`
                }
            }
        );

        if (!response.ok) {
            let message = 'Não foi possível carregar a imagem.';
            try {
                const errorData = await response.json();
                message = errorData.error || message;
            } catch (_) {
                // Mantém a mensagem padrão quando a resposta não for JSON.
            }
            throw new Error(message);
        }

        const originalBlob = await response.blob();
        if (!originalBlob.type.startsWith('image/')) {
            throw new Error('O arquivo selecionado não é uma imagem.');
        }

        const pngBlob = await convertImageBlobToPng(originalBlob);
        routeImageClipboardCache.set(cacheKey, pngBlob);
        return pngBlob;
    }

    async function copyRouteImageToClipboard(button, client, file) {
        const originalHTML = button.dataset.originalHtml || button.innerHTML;
        button.dataset.originalHtml = originalHTML;

        try {
            if (!navigator.clipboard?.write || typeof ClipboardItem === 'undefined' || !window.isSecureContext) {
                throw new Error('O navegador não permite copiar imagens diretamente. Use o botão Abrir e copie a imagem pela nova aba.');
            }

            button.disabled = true;
            button.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Preparando';

            const pngBlob = await prepareRouteImageForClipboard(client, file);

            await navigator.clipboard.write([
                new ClipboardItem({ 'image/png': pngBlob })
            ]);

            button.innerHTML = '<i class="bi bi-check-lg"></i> Copiada';
            button.classList.remove('btn-outline-success');
            button.classList.add('btn-success');

            setTimeout(() => {
                button.innerHTML = originalHTML;
                button.classList.remove('btn-success');
                button.classList.add('btn-outline-success');
                button.disabled = false;
            }, 1800);
        } catch (error) {
            console.error('Erro ao copiar imagem:', error);

            const cacheKey = file?.key ? `${client.id}|||${file.key}` : null;
            const imageIsPrepared = cacheKey && routeImageClipboardCache.has(cacheKey);

            button.disabled = false;
            button.innerHTML = imageIsPrepared
                ? '<i class="bi bi-clipboard"></i> Clique novamente'
                : originalHTML;

            if (imageIsPrepared && error?.name === 'NotAllowedError') {
                button.title = 'A imagem já foi preparada. Clique novamente para copiar.';
                return;
            }

            alert(error.message || 'Não foi possível copiar a imagem.');
        }
    }

    function toggleRouteClientDetails(summary, body, chevron) {
        const willExpand = body.classList.contains('d-none');
        body.classList.toggle('d-none', !willExpand);
        summary.setAttribute('aria-expanded', String(willExpand));
        chevron.classList.toggle('bi-chevron-down', !willExpand);
        chevron.classList.toggle('bi-chevron-up', willExpand);
    }

    function setRoutePatternFeedback(message = '', type = 'muted') {
        routePatternFeedback.textContent = message;
        routePatternFeedback.className = `small mt-2 text-${type}`;
    }

    function getSelectedRoutePattern() {
        const selectedId = Number(routePatternSelect.value);
        if (!Number.isInteger(selectedId) || selectedId <= 0) return null;
        return savedRoutePatterns.find(pattern => pattern.id === selectedId) || null;
    }

    function updateRoutePatternControls() {
        const selectedPattern = getSelectedRoutePattern();
        const hasSelectedPattern = Boolean(selectedPattern);

        applyRoutePatternBtn.disabled = !hasSelectedPattern;
        deleteRoutePatternBtn.disabled = !hasSelectedPattern;
        updateRoutePatternBtn.disabled = !hasSelectedPattern;

        if (selectedPattern) {
            routePatternNameInput.value = selectedPattern.name;
        }
    }

    function renderRoutePatternOptions(preferredId = null) {
        const currentValue = preferredId ?? (Number(routePatternSelect.value) || '');

        routePatternSelect.innerHTML =
            '<option value="">Montagem manual / selecione um padrão...</option>';

        savedRoutePatterns
            .slice()
            .sort((a, b) => a.name.localeCompare(b.name, 'pt-BR'))
            .forEach(pattern => {
                const option = document.createElement('option');
                option.value = String(pattern.id);
                option.textContent = `${pattern.name} (${pattern.neighborhoods.length} bairro(s))`;
                routePatternSelect.appendChild(option);
            });

        if (currentValue && savedRoutePatterns.some(pattern => pattern.id === Number(currentValue))) {
            routePatternSelect.value = String(currentValue);
        } else {
            routePatternSelect.value = '';
        }

        updateRoutePatternControls();
    }

    async function loadRoutePatterns(preferredId = null) {
        try {
            const response = await fetch('/api/neighborhoods?resource=patterns', {
                headers: { 'Authorization': `Bearer ${token}` }
            });

            if (!response.ok) {
                const errorData = await response.json().catch(() => ({}));
                throw new Error(errorData.error || 'Não foi possível carregar os padrões.');
            }

            const data = await response.json();
            savedRoutePatterns = Array.isArray(data.patterns) ? data.patterns : [];
            renderRoutePatternOptions(preferredId);
        } catch (error) {
            console.error('Erro ao carregar padrões de rota:', error);
            savedRoutePatterns = [];
            renderRoutePatternOptions();
            setRoutePatternFeedback(error.message, 'danger');
        }
    }

    function getCurrentRoutePatternPayload() {
        return selectedRouteNeighborhoods.map(item => ({
            city: item.city,
            neighborhood: item.neighborhood
        }));
    }

    function applyRoutePattern(pattern) {
        if (!pattern || !Array.isArray(pattern.neighborhoods)) return;

        rebuildRouteGroups();

        const applied = [];
        let ignoredCount = 0;

        pattern.neighborhoods.forEach(item => {
            const key = getRouteKey(item.city, item.neighborhood);
            const group = routeGroupsByKey.get(key);

            if (!group || group.clients.length === 0) {
                ignoredCount++;
                return;
            }

            if (!applied.some(selected => selected.key === key)) {
                applied.push({
                    key,
                    city: group.city,
                    neighborhood: group.neighborhood
                });
            }
        });

        selectedRouteNeighborhoods = applied;
        refreshRouteNeighborhoodOptions();
        renderRouteOrderList();

        if (applied.length === 0) {
            setRoutePatternFeedback(
                'O padrão foi carregado, mas nenhum dos bairros possui clientes elegíveis agora.',
                'warning'
            );
            return;
        }

        const ignoredMessage = ignoredCount > 0
            ? ` ${ignoredCount} bairro(s) sem clientes elegíveis foram ignorados.`
            : '';

        setRoutePatternFeedback(
            `Padrão "${pattern.name}" aplicado com ${applied.length} bairro(s).${ignoredMessage}`,
            'success'
        );
    }

    async function saveRoutePattern(isUpdate = false) {
        const name = routePatternNameInput.value.trim();
        const neighborhoods = getCurrentRoutePatternPayload();
        const selectedPattern = getSelectedRoutePattern();

        if (!name) {
            setRoutePatternFeedback('Digite um nome para o padrão.', 'danger');
            routePatternNameInput.focus();
            return;
        }

        if (neighborhoods.length === 0) {
            setRoutePatternFeedback(
                'Adicione pelo menos um bairro em "Ordem da rota" antes de salvar.',
                'danger'
            );
            return;
        }

        if (isUpdate && !selectedPattern) {
            setRoutePatternFeedback('Selecione um padrão salvo para atualizar.', 'danger');
            return;
        }

        const button = isUpdate ? updateRoutePatternBtn : saveRoutePatternBtn;
        const originalHTML = button.innerHTML;
        button.disabled = true;
        button.innerHTML = '<span class="spinner-border spinner-border-sm"></span> Salvando...';

        try {
            const response = await fetch('/api/neighborhoods', {
                method: isUpdate ? 'PUT' : 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify({
                    resource: 'pattern',
                    ...(isUpdate ? { id: selectedPattern.id } : {}),
                    name,
                    neighborhoods
                })
            });

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.error || 'Não foi possível salvar o padrão.');
            }

            await loadRoutePatterns(data.id);
            setRoutePatternFeedback(
                isUpdate ? 'Padrão atualizado com sucesso.' : 'Padrão criado com sucesso.',
                'success'
            );
        } catch (error) {
            console.error('Erro ao salvar padrão de rota:', error);
            setRoutePatternFeedback(error.message, 'danger');
        } finally {
            button.innerHTML = originalHTML;
            button.disabled = false;
            updateRoutePatternControls();
        }
    }

    async function deleteSelectedRoutePattern() {
        const selectedPattern = getSelectedRoutePattern();
        if (!selectedPattern) return;

        if (!confirm(`Excluir o padrão "${selectedPattern.name}"?`)) return;

        const originalHTML = deleteRoutePatternBtn.innerHTML;
        deleteRoutePatternBtn.disabled = true;
        deleteRoutePatternBtn.innerHTML = '<span class="spinner-border spinner-border-sm"></span>';

        try {
            const response = await fetch(
                `/api/neighborhoods?resource=pattern&id=${encodeURIComponent(selectedPattern.id)}`,
                {
                    method: 'DELETE',
                    headers: { 'Authorization': `Bearer ${token}` }
                }
            );

            const data = await response.json().catch(() => ({}));
            if (!response.ok) {
                throw new Error(data.error || 'Não foi possível excluir o padrão.');
            }

            routePatternNameInput.value = '';
            await loadRoutePatterns();
            setRoutePatternFeedback('Padrão excluído com sucesso.', 'success');
        } catch (error) {
            console.error('Erro ao excluir padrão de rota:', error);
            setRoutePatternFeedback(error.message, 'danger');
        } finally {
            deleteRoutePatternBtn.innerHTML = originalHTML;
            updateRoutePatternControls();
        }
    }

    function getRouteKey(city, neighborhood) {
        return `${city}|||${neighborhood}`;
    }

    function isUpcomingAgreement(client) {
        const { todayString } = getCuiabaToday();
        const pauseDate = client.reminder_paused_until
            ? client.reminder_paused_until.split('T')[0]
            : null;

        return Boolean(pauseDate && pauseDate > todayString);
    }

    function getRequiredLateCountForRoute(client) {
        return ['weekly', 'biweekly', 'monthly'].includes(client.frequency)
            ? 1
            : 3;
    }

    function getEligibleRouteClients() {
        return allClientsForSearch.filter(client => {
            if (!client.cidade_rota || !client.bairro_rota) return false;
            if (isUpcomingAgreement(client)) return false;

            const lateCount = getLateInstallments(client).length;
            return lateCount >= getRequiredLateCountForRoute(client);
        });
    }

    function rebuildRouteGroups() {
        routeGroupsByKey = new Map();

        getEligibleRouteClients().forEach(client => {
            const key = getRouteKey(client.cidade_rota, client.bairro_rota);

            if (!routeGroupsByKey.has(key)) {
                routeGroupsByKey.set(key, {
                    key,
                    city: client.cidade_rota,
                    neighborhood: client.bairro_rota,
                    clients: []
                });
            }

            routeGroupsByKey.get(key).clients.push(client);
        });

        routeGroupsByKey.forEach(group => {
            group.clients.sort((a, b) => a.id - b.id);
        });
    }

    function refreshRouteNeighborhoodOptions() {
        rebuildRouteGroups();

        const selectedKeys = new Set(selectedRouteNeighborhoods.map(item => item.key));
        const cityFilter = routeCityFilter.value;

        const availableGroups = Array.from(routeGroupsByKey.values())
            .filter(group => !cityFilter || group.city === cityFilter)
            .filter(group => !selectedKeys.has(group.key))
            .sort((a, b) => {
                const cityCompare = a.city.localeCompare(b.city, 'pt-BR');
                return cityCompare || a.neighborhood.localeCompare(b.neighborhood, 'pt-BR');
            });

        routeNeighborhoodSelect.innerHTML = '<option value="">Selecione um bairro...</option>';

        availableGroups.forEach(group => {
            const option = document.createElement('option');
            option.value = group.key;
            option.textContent = `${group.neighborhood} — ${group.city} (${group.clients.length} cliente(s))`;
            routeNeighborhoodSelect.appendChild(option);
        });

        const eligibleClientsCount = getEligibleRouteClients().length;
        routeEligibleSummary.textContent =
            `${eligibleClientsCount} cliente(s) elegível(is) em ${routeGroupsByKey.size} bairro(s).`;

        addRouteNeighborhoodBtn.disabled = availableGroups.length === 0;
        generateRoutesBtn.disabled = selectedRouteNeighborhoods.length === 0;
    }

    function renderRouteOrderList() {
        routeOrderList.innerHTML = '';

        if (selectedRouteNeighborhoods.length === 0) {
            routeOrderList.innerHTML =
                '<div class="list-group-item text-muted">Nenhum bairro adicionado.</div>';
            generateRoutesBtn.disabled = true;
            return;
        }

        selectedRouteNeighborhoods.forEach((item, index) => {
            const group = routeGroupsByKey.get(item.key);
            const clientCount = group ? group.clients.length : 0;

            const row = document.createElement('div');
            row.className = 'list-group-item d-flex justify-content-between align-items-center gap-3';

            const label = document.createElement('div');
            label.innerHTML = `
                <strong>${index + 1}. ${item.neighborhood}</strong>
                <span class="text-muted">— ${item.city}</span>
                <span class="badge bg-danger ms-2">${clientCount} cliente(s)</span>
            `;

            const controls = document.createElement('div');
            controls.className = 'btn-group btn-group-sm';
            controls.innerHTML = `
                <button type="button" class="btn btn-outline-secondary route-order-action"
                    data-action="up" data-index="${index}" ${index === 0 ? 'disabled' : ''}
                    title="Subir"><i class="bi bi-arrow-up"></i></button>
                <button type="button" class="btn btn-outline-secondary route-order-action"
                    data-action="down" data-index="${index}"
                    ${index === selectedRouteNeighborhoods.length - 1 ? 'disabled' : ''}
                    title="Descer"><i class="bi bi-arrow-down"></i></button>
                <button type="button" class="btn btn-outline-danger route-order-action"
                    data-action="remove" data-index="${index}"
                    title="Remover"><i class="bi bi-x-lg"></i></button>
            `;

            row.appendChild(label);
            row.appendChild(controls);
            routeOrderList.appendChild(row);
        });

        generateRoutesBtn.disabled = false;
    }

    function renderGeneratedRoutes(chargeInterest) {
        routesResultContainer.innerHTML = '';
        const completeRouteParts = [];

        selectedRouteNeighborhoods.forEach((selectedItem, routeIndex) => {
            const group = routeGroupsByKey.get(selectedItem.key);
            if (!group || group.clients.length === 0) return;

            const section = document.createElement('section');
            section.className = 'route-result-section card shadow-sm mb-4';

            const sectionHeader = document.createElement('div');
            sectionHeader.className =
                'card-header bg-dark text-white d-flex justify-content-between align-items-center';

            const heading = document.createElement('div');
            heading.innerHTML = `
                <strong>ROTA ${routeIndex + 1} — ${group.neighborhood}</strong>
                <span class="ms-2 opacity-75">${group.city}</span>
            `;

            const groupMessages = group.clients.map(client =>
                buildCollectionMessage(client, chargeInterest)
            );

            const groupText =
                `ROTA ${routeIndex + 1} — ${group.neighborhood} — ${group.city}\n\n` +
                groupMessages.join('\n\n----------------------------------------\n\n');

            completeRouteParts.push(groupText);

            const copyGroupButton = document.createElement('button');
            copyGroupButton.type = 'button';
            copyGroupButton.className = 'btn btn-light btn-sm';
            copyGroupButton.innerHTML = '<i class="bi bi-clipboard"></i> Copiar bairro';
            copyGroupButton.addEventListener('click', () =>
                copyWithButtonFeedback(copyGroupButton, groupText)
            );

            sectionHeader.appendChild(heading);
            sectionHeader.appendChild(copyGroupButton);
            section.appendChild(sectionHeader);

            const sectionBody = document.createElement('div');
            sectionBody.className = 'card-body';

            group.clients.forEach((client, clientIndex) => {
                const message = groupMessages[clientIndex];
                const lateCount = getLateInstallments(client).length;
                const clientFiles = Array.isArray(client.files) ? client.files : [];

                const clientCard = document.createElement('div');
                clientCard.className = 'route-client-card border rounded mb-3 bg-light overflow-hidden';

                const clientTop = document.createElement('div');
                clientTop.className =
                    'route-client-summary d-flex flex-wrap justify-content-between align-items-center gap-2 p-3';
                clientTop.setAttribute('role', 'button');
                clientTop.setAttribute('tabindex', '0');
                clientTop.setAttribute('aria-expanded', 'false');
                clientTop.title = 'Clique para expandir ou recolher os dados do cliente';

                const clientTitle = document.createElement('div');
                clientTitle.className = 'd-flex align-items-center flex-wrap gap-2';

                const chevron = document.createElement('i');
                chevron.className = 'bi bi-chevron-down route-client-chevron';

                const titleText = document.createElement('strong');
                titleText.textContent = `${clientIndex + 1}. #${client.id} — ${client.name}`;

                const lateBadge = document.createElement('span');
                lateBadge.className = 'badge bg-danger';
                lateBadge.textContent = `${lateCount} atrasada(s)`;

                const expandHint = document.createElement('small');
                expandHint.className = 'text-muted route-client-expand-hint';
                expandHint.textContent = 'Clique para ver os dados';

                clientTitle.appendChild(chevron);
                clientTitle.appendChild(titleText);
                clientTitle.appendChild(lateBadge);
                clientTitle.appendChild(expandHint);

                const actions = document.createElement('div');
                actions.className = 'd-flex gap-2 route-client-actions';

                if (client.localizacao) {
                    const mapLink = document.createElement('a');
                    mapLink.href = client.localizacao;
                    mapLink.target = '_blank';
                    mapLink.rel = 'noopener noreferrer';
                    mapLink.className = 'btn btn-outline-primary btn-sm';
                    mapLink.innerHTML = '<i class="bi bi-geo-alt-fill"></i> Mapa';
                    mapLink.addEventListener('click', event => event.stopPropagation());
                    actions.appendChild(mapLink);
                }

                const copyClientButton = document.createElement('button');
                copyClientButton.type = 'button';
                copyClientButton.className = 'btn btn-success btn-sm';
                copyClientButton.innerHTML = '<i class="bi bi-clipboard"></i> Copiar cliente';
                copyClientButton.addEventListener('click', event => {
                    event.stopPropagation();
                    copyWithButtonFeedback(copyClientButton, message);
                });
                actions.appendChild(copyClientButton);

                clientTop.appendChild(clientTitle);
                clientTop.appendChild(actions);

                const clientDetails = document.createElement('div');
                clientDetails.className = 'route-client-details d-none px-3 pb-3';

                const textarea = document.createElement('textarea');
                textarea.className = 'form-control route-client-text';
                textarea.rows = 13;
                textarea.readOnly = true;
                textarea.value = message;
                textarea.addEventListener('click', event => event.stopPropagation());

                clientDetails.appendChild(textarea);

                const toggleDetails = () =>
                    toggleRouteClientDetails(clientTop, clientDetails, chevron);

                clientTop.addEventListener('click', event => {
                    if (event.target.closest('button, a, textarea')) return;
                    toggleDetails();
                });

                clientTop.addEventListener('keydown', event => {
                    if (event.key !== 'Enter' && event.key !== ' ') return;
                    if (event.target.closest('button, a')) return;
                    event.preventDefault();
                    toggleDetails();
                });

                clientCard.appendChild(clientTop);
                clientCard.appendChild(clientDetails);

                const filesFooter = document.createElement('div');
                filesFooter.className = 'route-client-files border-top bg-white p-3';

                const filesHeading = document.createElement('div');
                filesHeading.className = 'd-flex justify-content-between align-items-center mb-2';

                const filesTitle = document.createElement('small');
                filesTitle.className = 'fw-bold text-secondary';
                filesTitle.innerHTML = '<i class="bi bi-images me-1"></i> Documentos anexados';

                const filesCount = document.createElement('small');
                filesCount.className = 'text-muted';
                filesCount.textContent = `${clientFiles.length} arquivo(s)`;

                filesHeading.appendChild(filesTitle);
                filesHeading.appendChild(filesCount);
                filesFooter.appendChild(filesHeading);

                if (clientFiles.length === 0) {
                    const emptyFiles = document.createElement('small');
                    emptyFiles.className = 'text-muted';
                    emptyFiles.textContent = 'Nenhum documento anexado.';
                    filesFooter.appendChild(emptyFiles);
                } else {
                    const filesGrid = document.createElement('div');
                    filesGrid.className = 'route-file-grid';

                    clientFiles.forEach(file => {
                        const fileTile = document.createElement('div');
                        fileTile.className = 'route-file-tile';
                        fileTile.title = file.name || 'Arquivo anexado';

                        if (isRoutePreviewImage(file)) {
                            const imageLink = document.createElement('a');
                            imageLink.href = file.url;
                            imageLink.target = '_blank';
                            imageLink.rel = 'noopener noreferrer';
                            imageLink.className = 'route-file-preview-link';
                            imageLink.title = 'Clique para abrir a imagem em tamanho completo';

                            const image = document.createElement('img');
                            image.src = file.url;
                            image.alt = file.name || 'Imagem anexada';
                            image.loading = 'lazy';
                            image.className = 'route-file-thumbnail';

                            imageLink.appendChild(image);
                            fileTile.appendChild(imageLink);

                            const copyImageButton = document.createElement('button');
                            copyImageButton.type = 'button';
                            copyImageButton.className = 'btn btn-outline-success btn-sm route-copy-image-btn';
                            copyImageButton.innerHTML = '<i class="bi bi-clipboard"></i> Copiar';
                            copyImageButton.title = 'Copiar imagem para colar no WhatsApp com Ctrl + V';
                            copyImageButton.addEventListener('click', event => {
                                event.stopPropagation();
                                copyRouteImageToClipboard(copyImageButton, client, file);
                            });

                            fileTile.appendChild(copyImageButton);
                        } else {
                            const fileLink = document.createElement('a');
                            fileLink.href = file.url;
                            fileLink.target = '_blank';
                            fileLink.rel = 'noopener noreferrer';
                            fileLink.className = 'route-non-image-file';
                            fileLink.title = 'Abrir documento';

                            const fileIcon = document.createElement('i');
                            fileIcon.className = 'bi bi-file-earmark-text route-file-icon';

                            const extension = document.createElement('span');
                            extension.className = 'route-file-extension';
                            extension.textContent = getRouteFileExtension(file);

                            fileLink.appendChild(fileIcon);
                            fileLink.appendChild(extension);
                            fileTile.appendChild(fileLink);
                        }

                        const fileName = document.createElement('div');
                        fileName.className = 'route-file-name';
                        fileName.textContent = file.name || 'Arquivo';
                        fileTile.appendChild(fileName);

                        filesGrid.appendChild(fileTile);
                    });

                    filesFooter.appendChild(filesGrid);
                }

                clientCard.appendChild(filesFooter);
                sectionBody.appendChild(clientCard);
            });

            section.appendChild(sectionBody);
            routesResultContainer.appendChild(section);
        });

        generatedRoutesFullText =
            completeRouteParts.join('\n\n========================================\n\n');
    }

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
        freqWeeklyRadio.disabled = false;
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
        editFreqWeeklyRadio.disabled = false;
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
            // --- CAMINHO A: COBRADOR (Paginação Local + Ordenação por Atraso) ---
            if (userRole === 'cobrador') {
                // 1. Baixa TODOS os clientes
                const response = await fetch(`/api/clients?page=1&limit=9999`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) throw new Error('Falha ao carregar clientes.');
                const data = await response.json();

                // 2. Filtra apenas os atrasados/pendentes
                let allCobradorClients = data.clients.filter(client => {
                    const status = calculateClientStatus(client);
                    return status.includes('Atrasado');
                });

                // =========================================================
                // 3. NOVO: ORDENAÇÃO POR GRAVIDADE (Mais parcelas atrasadas primeiro)
                // =========================================================
                const timeZone = 'America/Cuiaba';
                const todayInCuiaba = new Date().toLocaleDateString('en-CA', { timeZone });
                const todayTimestamp = new Date(todayInCuiaba + 'T00:00:00.000Z').getTime();

                allCobradorClients.sort((a, b) => {
                    // Função auxiliar para contar parcelas vencidas (data menor que hoje)
                    const countLate = (c) => {
                        return (c.paymentDates || []).filter(p => {
                            const pDate = new Date(p.date).getTime();
                            return pDate < todayTimestamp && p.status !== 'paid';
                        }).length;
                    };

                    const lateA = countLate(a);
                    const lateB = countLate(b);

                    // Ordena do Maior para o Menor (Descrescente)
                    return lateB - lateA;
                });
                // =========================================================

                // 4. Atualiza o TOTAL
                totalClients = allCobradorClients.length;

                // 5. Cria a "Página" manualmente
                const startIndex = (currentPage - 1) * clientsPerPage;
                const endIndex = startIndex + clientsPerPage;

                clients = allCobradorClients.slice(startIndex, endIndex);

                // 6. Renderiza
                renderClientList(clients);
                renderPaginationControls();
            }

            // --- CAMINHO B: ADMIN (Paginação no Servidor - Original) ---
            else {
                const response = await fetch(`/api/clients?page=${currentPage}&limit=${clientsPerPage}`, {
                    headers: { 'Authorization': `Bearer ${token}` }
                });

                if (!response.ok) throw new Error('Falha ao carregar clientes.');
                const data = await response.json();

                clients = data.clients;
                totalClients = data.total;

                renderClientList(clients);
                renderPaginationControls();
            }

            // Mantém o cache para a barra de pesquisa funcionar em ambos os casos
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

        // (O BLOCO DE FILTRO DO COBRADOR FOI REMOVIDO DAQUI, POIS JÁ É FEITO NO LOAD)

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

            // LÓGICA DE COR: Se for risco, fica vermelho e negrito
            const nameClass = client.is_risk ? 'text-danger fw-bold' : '';
            // Ícone visual ao lado do nome (opcional, mas ajuda)
            const riskIcon = client.is_risk ? '<i class="bi bi-exclamation-triangle-fill me-1"></i>' : '';

            const status = calculateClientStatus(client);
            const startDateDisplay = client.startDate ? new Date(client.startDate).toLocaleDateString('pt-BR', { timeZone: 'UTC' }) : 'N/A';

            // ATUALIZE ESSA LINHA:
            tr.innerHTML = `<td>#${client.id}</td><td class="${nameClass}">${riskIcon}${client.name}</td><td>${status}</td><td>${startDateDisplay}</td>`;

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

            // LÓGICA DA NOTA (NOVO)
            if (client.reminder_pause_note) {
                reminderPauseNoteDisplay.textContent = `Nota: ${client.reminder_pause_note}`;
                reminderPauseNoteDisplay.classList.remove('d-none');
            } else {
                reminderPauseNoteDisplay.classList.add('d-none');
            }

        } else {
            // Não está pausado (ou a data chegou/passou)
            reminderStatusContainer.classList.add('d-none');
            pauseReminderBtn.classList.remove('d-none');
        }

        // LÓGICA DO BOTÃO DE RISCO
        if (client.is_risk) {
            riskBtn.classList.remove('btn-outline-secondary');
            riskBtn.classList.add('btn-danger'); // Fica vermelho ativado
            document.getElementById('panel-name').classList.add('text-danger'); // Título vermelho
        } else {
            riskBtn.classList.remove('btn-danger');
            riskBtn.classList.add('btn-outline-secondary'); // Fica cinza desativado
            document.getElementById('panel-name').classList.remove('text-danger');
        }

        // LÓGICA DO BOTÃO OFERTA VIP
        // Regra: Empréstimo Concluído (Tudo Pago) E NÃO é Risco
        const isCompleted = client.paymentDates && client.paymentDates.every(p => p.status === 'paid');

        if (isCompleted && !client.is_risk) {
            vipOfferBtn.classList.remove('d-none');
        } else {
            vipOfferBtn.classList.add('d-none');
        }

        panelProfession.textContent = client.profissao || 'N/A';
        panelNeighborhood.textContent = client.bairro || 'N/A';
        panelRouteNeighborhood.textContent = client.bairro_rota
            ? `${client.bairro_rota}${client.cidade_rota ? ` — ${client.cidade_rota}` : ''}`
            : 'Não informado';
        if (client.localizacao) {
            panelLocation.textContent = 'Ver no mapa';
            panelLocation.href = client.localizacao;
            panelLocation.parentElement.style.display = 'block';
        } else {
            panelLocation.parentElement.style.display = 'none';
        }

        // A API agora nos envia o 'responsible_name', então podemos usá-lo
        const respName = client.responsible_name || "Não informado";
        document.getElementById('panel-responsible').textContent = respName;
        // ===============================================

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

                // LÓGICA DE PERMISSÃO:
                // Se for cobrador, a string do botão de excluir fica vazia.
                // Se for admin, cria o botão normal.
                const deleteButtonHTML = (userRole === 'cobrador')
                    ? ''
                    : `<button class="btn btn-outline-danger btn-sm delete-file-btn" data-filename="${file.name}" title="Excluir Arquivo"><i class="bi bi-trash"></i></button>`;

                li.innerHTML = `
                    <span><i class="bi bi-file-earmark-text"></i> ${file.name}</span>
                    <div>
                        <a href="${file.url}" target="_blank" class="btn btn-outline-primary btn-sm" title="Ver Arquivo"><i class="bi bi-eye"></i></a> 
                        ${deleteButtonHTML}
                    </div>
                `;
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
        applyCobradorRestrictions();
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
            updateAgreementsButton(); // <-- ADICIONE AQUI
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

        if (searchTerm === "bolsonaro") {
            playBolsonaroMeme();
        }

        activeFilterButton = null;

        if (!searchTerm) {
            // Se limpou a busca, recarrega a lista padrão
            loadClients();

            // CORREÇÃO: Força a exibição da barra para TODO MUNDO ('flex').
            // O loadClients() já cuidou de montar os botões certos (1, 2, 3...) tanto pro Admin quanto pro Cobrador.
            paginationControls.style.display = 'flex';

            filterClearBtn.classList.add('d-none');
            return;
        }

        paginationControls.style.display = 'none';
        filterClearBtn.classList.remove('d-none');

        const filteredClients = allClientsForSearch.filter(client => {
            const idMatch = client.id.toString().toLowerCase().includes(searchTerm);
            const nameMatch = client.name.toLowerCase().includes(searchTerm);
            const matchesSearch = idMatch || nameMatch;

            let matchesRole = true;
            if (userRole === 'cobrador') {
                const status = calculateClientStatus(client);
                matchesRole = status.includes('Atrasado');
            }

            return matchesSearch && matchesRole;
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
        routeNewNeighborhoodInput.value = '';
        configureNeighborhoodInput(addNeighborhoodConfig);
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
            cidade_rota: routeCitySelect.value || null,
            bairro_rota: routeNeighborhoodSelectInput.value || null,
            profissao: professionInput.value,
            taxa_juros: parseFloat(interestRateClientInput.value) || 20,
            original_client_id: null,
            responsible_id: document.getElementById('responsibleSelect').value || null, // <--- PEGA O ID
        };

        try {
            // 1. CRIA O CLIENTE (Já estava certo)
            const response = await fetch('/api/clients', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${token}`
                },
                body: JSON.stringify(clientData),
            });
            if (!response.ok) {
                const err = await response.json();
                throw new Error(err.error || 'Falha ao criar o registro do cliente.');
            }
            const newClient = await response.json();

            // 2. CRIA O LOGIN (Opcional)
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

            // 3. UPLOAD DE ARQUIVOS (AQUI ESTAVA O PROBLEMA)
            if (newClientFiles.length > 0) {
                const uploadPromises = newClientFiles.map(file => {
                    const formData = new FormData();
                    formData.append('file', file);
                    formData.append('clientId', newClient.id);

                    // CORREÇÃO APLICADA AQUI: ADICIONADO O HEADER DE AUTORIZAÇÃO
                    return fetch('/api/upload', {
                        method: 'POST',
                        headers: {
                            'Authorization': `Bearer ${token}` // <--- AGORA VAI FUNCIONAR
                        },
                        body: formData
                    });
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
        updateAgreementsButton(); // <-- ADICIONE AQUI

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
        editRouteCitySelect.value = client.cidade_rota || '';
        editRouteNewNeighborhoodInput.value = '';
        editRouteNewNeighborhoodInput.readOnly = true;
        configureNeighborhoodInput(
            editNeighborhoodConfig,
            client.bairro_rota || ''
        );
        editRouteCitySelect.disabled = true;
        editRouteNeighborhoodSelect.disabled = true;
        editRouteNewNeighborhoodInput.disabled = true;
        editAddNeighborhoodBtn.disabled = true;
        editEditNeighborhoodBtn.disabled = true;
        editRemoveNeighborhoodBtn.disabled = true;
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
            cidade_rota: editRouteCitySelect.value || null,
            bairro_rota: editRouteNeighborhoodSelect.value || null,
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

        const chargeInterest =
            document.querySelector('input[name="chargeInterest"]:checked').value === 'yes';

        const customObservation = collectionObservationInput.value.trim();

        collectionResultText.value =
            buildCollectionMessage(client, chargeInterest, customObservation);

        bootstrap.Modal.getInstance(collectionModalEl).hide();
        new bootstrap.Modal(collectionResultModalEl).show();
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

    routesBtn.addEventListener('click', async () => {
        selectedRouteNeighborhoods = [];
        generatedRoutesFullText = '';
        routeCityFilter.value = '';
        routePatternSelect.value = '';
        routePatternNameInput.value = '';
        setRoutePatternFeedback();
        document.getElementById('routeChargeInterestYes').checked = true;

        refreshRouteNeighborhoodOptions();
        renderRouteOrderList();
        await loadRoutePatterns();

        new bootstrap.Modal(routesModalEl).show();
    });

    routePatternSelect.addEventListener('change', () => {
        if (!routePatternSelect.value) {
            routePatternNameInput.value = '';
        }
        updateRoutePatternControls();
        setRoutePatternFeedback();
    });

    applyRoutePatternBtn.addEventListener('click', () => {
        const selectedPattern = getSelectedRoutePattern();
        if (selectedPattern) applyRoutePattern(selectedPattern);
    });

    saveRoutePatternBtn.addEventListener('click', () => saveRoutePattern(false));
    updateRoutePatternBtn.addEventListener('click', () => saveRoutePattern(true));
    deleteRoutePatternBtn.addEventListener('click', deleteSelectedRoutePattern);

    routeCityFilter.addEventListener('change', refreshRouteNeighborhoodOptions);

    addRouteNeighborhoodBtn.addEventListener('click', () => {
        const selectedKey = routeNeighborhoodSelect.value;
        if (!selectedKey) return;

        const group = routeGroupsByKey.get(selectedKey);
        if (!group) return;

        selectedRouteNeighborhoods.push({
            key: group.key,
            city: group.city,
            neighborhood: group.neighborhood
        });

        refreshRouteNeighborhoodOptions();
        renderRouteOrderList();
    });

    routeOrderList.addEventListener('click', (event) => {
        const button = event.target.closest('.route-order-action');
        if (!button) return;

        const index = Number(button.dataset.index);
        const action = button.dataset.action;

        if (!Number.isInteger(index) || !selectedRouteNeighborhoods[index]) return;

        if (action === 'up' && index > 0) {
            [selectedRouteNeighborhoods[index - 1], selectedRouteNeighborhoods[index]] =
                [selectedRouteNeighborhoods[index], selectedRouteNeighborhoods[index - 1]];
        } else if (action === 'down' && index < selectedRouteNeighborhoods.length - 1) {
            [selectedRouteNeighborhoods[index + 1], selectedRouteNeighborhoods[index]] =
                [selectedRouteNeighborhoods[index], selectedRouteNeighborhoods[index + 1]];
        } else if (action === 'remove') {
            selectedRouteNeighborhoods.splice(index, 1);
        }

        refreshRouteNeighborhoodOptions();
        renderRouteOrderList();
    });

    generateRoutesBtn.addEventListener('click', () => {
        if (selectedRouteNeighborhoods.length === 0) {
            alert('Adicione pelo menos um bairro à rota.');
            return;
        }

        const chargeInterest =
            document.querySelector('input[name="routeChargeInterest"]:checked').value === 'yes';

        // Atualiza os grupos para considerar os dados mais recentes dos clientes.
        rebuildRouteGroups();
        renderGeneratedRoutes(chargeInterest);

        if (!generatedRoutesFullText) {
            alert('Nenhum cliente elegível foi encontrado nos bairros selecionados.');
            return;
        }

        bootstrap.Modal.getInstance(routesModalEl).hide();
        new bootstrap.Modal(routesResultModalEl).show();
    });

    copyAllRoutesBtn.addEventListener('click', () => {
        if (!generatedRoutesFullText) return;
        copyWithButtonFeedback(copyAllRoutesBtn, generatedRoutesFullText);
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
            const response = await fetch('/api/settings?type=config&name=pix_key', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
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
            await fetch('/api/settings?type=config', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
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
        const todayDateObj = new Date(todayInCuiaba + 'T00:00:00.000Z');

        reminderQueueList.innerHTML = '';

        // Emojis normais (agora funcionam pois vão via Clipboard)
        const i = {
            bell: '🔔', user: '👤', calendar: '📅', cross: '❌',
            day: '🗓️', chart: '📉', check: '✅', money: '💰',
            pix: '💠', key: '🔑', build: '🏢', bank: '🏦'
        };

        clientsToRemind.forEach((client) => {
            const installmentValue = parseFloat(client.dailyValue);
            const installmentFormatted = formatCurrency(installmentValue);

            // Identifica atrasadas e a parcela de hoje
            const lateInstallments = (client.paymentDates || []).filter(p => new Date(p.date) < todayDateObj && p.status !== 'paid');
            const lateCount = lateInstallments.length;
            const isPendingToday = (client.paymentDates || []).some(p => p.date.startsWith(todayInCuiaba) && p.status !== 'paid');

            // --- 1. SOMA DE PARCELAS PENDENTES (Atrasadas + A de Hoje) ---
            const totalPendingCount = lateCount + (isPendingToday ? 1 : 0);

            // Calcula Juros (Apenas sobre as atrasadas)
            let totalInterest = 0;
            if (lateCount > 0) {
                const clientInterestRate = parseFloat(client.taxa_juros || 20) / 100;
                totalInterest = lateCount * (installmentValue * clientInterestRate);
            }

            // --- 2. CÁLCULO DO VALOR TOTAL COM DESCONTO DE SALDO ---
            let totalValue = (totalPendingCount * installmentValue) + totalInterest;

            const clientBalance = parseFloat(client.saldo || 0);
            if (clientBalance > 0) {
                totalValue -= clientBalance; // Desconta o saldo (crédito) do cliente
            }
            if (totalValue < 0) totalValue = 0; // Previne ficar valor negativo

            // --- EXTRAÇÃO DO PRIMEIRO NOME ---
            const firstName = client.name.split(' ')[0];

            // --- 3. MONTAGEM DA NOVA MENSAGEM ENXUTA ---
            let message = `${i.user} *Cliente:* ${firstName}\n`;
            message += `${i.calendar} *Data:* ${todayFormatted}\n`;
            message += `-----------------------------------\n`;
            message += `${i.cross} *${totalPendingCount}x Parcela(s) Pendentes:* ${installmentFormatted}\n`;

            if (totalInterest > 0) {
                message += `${i.chart} *Juros calculados:* ${formatCurrency(totalInterest)}\n`;
            } else {
                message += `${i.chart} *Juros calculados:* R$ 0,00\n`;
            }

            message += `${i.money} *VALOR TOTAL:* *${formatCurrency(totalValue)}*\n`;
            message += `-----------------------------------\n`;
            message += `${i.key} *Pix:* ${pixKey}`;

            if (message) {
                // Link apenas com o telefone (sem texto)
                const whatsappUrl = `https://wa.me/55${client.phone.replace(/\D/g, '')}`;

                const listItem = document.createElement('a');
                listItem.href = whatsappUrl;
                listItem.className = 'list-group-item list-group-item-action reminder-link';

                // Guardamos a mensagem aqui escondida para copiar depois
                listItem.setAttribute('data-message', message);

                const iconClass = lateCount > 0 ? 'text-danger' : 'text-warning';

                // Na lista visual do sistema, mantive o nome COMPLETO para você não se confundir
                // Mas na mensagem copiada (data-message acima) vai só o primeiro nome.
                listItem.innerHTML = `
                    <div class="d-flex justify-content-between align-items-center">
                        <div>
                            <i class="bi bi-whatsapp me-2 ${iconClass}"></i> 
                            Enviar para <strong>${client.name}</strong>
                        </div>
                        <span class="badge bg-light text-dark border"><i class="bi bi-clipboard"></i> Copiar e Abrir</span>
                    </div>
                `;

                reminderQueueList.appendChild(listItem);
            }
        });

        bootstrap.Modal.getInstance(reminderConfirmationModalEl).hide();
        new bootstrap.Modal(reminderQueueModalEl).show();
    });

    // =====================================================================
    // LÓGICA DE AVISOS EM MASSA (PERSONALIZADO E RENOVAÇÃO)
    // =====================================================================

    const sendRenewalMsgBtn = document.getElementById('send-renewal-msg-btn');
    const renewalMsgCountText = document.getElementById('renewal-msg-count-text');
    let clientsForRenewalMsg = [];

    // 1. Ao clicar no botão principal (abre o modal e calcula tudo)
    customMessageBtn.addEventListener('click', () => {

        // --- FILTRO 1: AVISO PERSONALIZADO (Idêntico ao seu original) ---
        clientsForCustomMsg = allClientsForSearch.filter(client => {
            const status = calculateClientStatus(client);
            return !status.includes('Empréstimo Concluído');
        });

        if (clientsForCustomMsg.length === 0) {
            alert('Nenhum cliente elegível encontrado (todos estão com empréstimo concluído).');
            return; // Impede abrir se não tiver ninguém ativo
        }

        // --- FILTRO 2: AVISO DE RENOVAÇÃO (Atualizado com tolerância) ---
        clientsForRenewalMsg = allClientsForSearch.filter(client => {
            const status = calculateClientStatus(client);

            // Se o empréstimo já acabou, descarta.
            if (status.includes('Empréstimo Concluído')) return false;

            // 1. Calcula exatamente quantas parcelas estão vencidas (menor que hoje) e não pagas
            const timeZone = 'America/Cuiaba';
            const todayInCuiaba = new Date().toLocaleDateString('en-CA', { timeZone });
            const todayDateObj = new Date(todayInCuiaba + 'T00:00:00.000Z');

            const lateCount = (client.paymentDates || []).filter(p => new Date(p.date) < todayDateObj && p.status !== 'paid').length;

            // REGRA A: Pode ter no MÁXIMO 2 parcelas em atraso. Se tiver 3 ou mais, descarta.
            if (lateCount > 2) {
                return false;
            }

            // 2. Conta quantas parcelas já foram pagas
            const paidInstallments = client.paymentDates ? client.paymentDates.filter(p => p.status === 'paid').length : 0;

            // REGRA B: Frequência e mínimo de pagamentos
            if (client.frequency === 'daily' && paidInstallments >= 10) return true;
            if (client.frequency === 'weekly' && paidInstallments >= 2) return true;

            return false;
        });

        // Preenche os contadores na tela
        customMsgCountText.innerHTML = `O sistema preparará mensagens para <strong>${clientsForCustomMsg.length} cliente(s)</strong> ativos.`;
        renewalMsgCountText.innerHTML = `O sistema encontrou <strong>${clientsForRenewalMsg.length} cliente(s)</strong> elegíveis para renovação.`;
        customMessageInput.value = ''; // Limpa a caixa

        // Abre o Modal
        new bootstrap.Modal(customMessageModalEl).show();
    });

    // 2. Ação do Botão: GERAR AVISO PERSONALIZADO
    sendCustomMsgBtn.addEventListener('click', () => {
        const customText = customMessageInput.value.trim();

        if (!customText) {
            alert('Por favor, digite ou cole um texto para enviar.');
            return;
        }

        reminderQueueList.innerHTML = ''; // Limpa a fila

        clientsForCustomMsg.forEach((client) => {
            const whatsappUrl = `https://wa.me/55${client.phone.replace(/\D/g, '')}`;
            const listItem = document.createElement('a');
            listItem.href = whatsappUrl;
            listItem.className = 'list-group-item list-group-item-action reminder-link';
            listItem.setAttribute('data-message', customText);

            listItem.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <i class="bi bi-chat-dots-fill me-2 text-secondary"></i> 
                        Enviar para <strong>${client.name}</strong>
                    </div>
                    <span class="badge bg-light text-dark border"><i class="bi bi-clipboard"></i> Copiar e Abrir</span>
                </div>
            `;
            reminderQueueList.appendChild(listItem);
        });

        bootstrap.Modal.getInstance(customMessageModalEl).hide();
        new bootstrap.Modal(reminderQueueModalEl).show();
    });

    // 3. Ação do Botão: GERAR OFERTAS DE RENOVAÇÃO
    sendRenewalMsgBtn.addEventListener('click', () => {
        if (clientsForRenewalMsg.length === 0) {
            alert('Nenhum cliente cumpre as regras de renovação no momento.');
            return;
        }

        reminderQueueList.innerHTML = ''; // Limpa a fila

        clientsForRenewalMsg.forEach(client => {
            // Cálculos da Dívida e do Valor a Receber
            const totalInstallments = client.paymentDates ? client.paymentDates.length : 0;
            const paidInstallments = client.paymentDates ? client.paymentDates.filter(p => p.status === 'paid').length : 0;
            const remainingInstallments = totalInstallments - paidInstallments;

            const installmentValue = parseFloat(client.dailyValue);
            const currentLoanValue = parseFloat(client.loanValue); // Variável Y

            // Dívida que falta = Quantas parcelas faltam vezes o valor da parcela
            let currentDebt = remainingInstallments * installmentValue;

            // Desconta se o cliente tiver crédito (saldo a mais)
            const clientBalance = parseFloat(client.saldo || 0);
            if (clientBalance > 0) { currentDebt -= clientBalance; }
            if (currentDebt < 0) { currentDebt = 0; }

            // Variável X = Valor do novo empréstimo menos a dívida velha
            let netReceiveValue = currentLoanValue - currentDebt;
            if (netReceiveValue < 0) { netReceiveValue = 0; }

            // Formatação dos valores
            const formattedLoan = formatCurrency(currentLoanValue);
            const formattedDebt = formatCurrency(currentDebt); // O valor restante
            const formattedReceive = formatCurrency(netReceiveValue);

            // Pega apenas o primeiro nome do cliente
            const firstName = client.name.split(' ')[0];

            // MONTAGEM DO TEXTO ATUALIZADA
            let msg = `🎉 *${firstName}*, você tem uma oportunidade de renovação!\n\n`;
            msg += `💵 Empréstimo: *${formattedLoan}*\n`;
            msg += `📋 Valor restante: *${formattedDebt}*\n`;
            msg += `💰 Você recebe: *${formattedReceive}*\n\n`;
            msg += `✅ Renovamos seu contrato.\n`;
            msg += `✅ Descontamos o valor restante.\n`;
            msg += `💰 Você recebe a diferença na hora.\n\n`;
            msg += `📲 Responda esta mensagem para renovar.`;

            // Criar o link na fila
            const whatsappUrl = `https://wa.me/55${client.phone.replace(/\D/g, '')}`;
            const listItem = document.createElement('a');
            listItem.href = whatsappUrl;
            listItem.className = 'list-group-item list-group-item-action reminder-link';
            listItem.setAttribute('data-message', msg);

            listItem.innerHTML = `
                <div class="d-flex justify-content-between align-items-center">
                    <div>
                        <i class="bi bi-gift-fill me-2 text-success"></i> 
                        Oferta para <strong>${client.name.split(' ')[0]}</strong>
                    </div>
                    <span class="badge bg-light text-dark border"><i class="bi bi-clipboard"></i> Copiar e Abrir</span>
                </div>
            `;

            reminderQueueList.appendChild(listItem);
        });

        bootstrap.Modal.getInstance(customMessageModalEl).hide();
        new bootstrap.Modal(reminderQueueModalEl).show();
    });
    // =====================================================================

    // --- LÓGICA DE COPIAR E ABRIR WHATSAPP (HÍBRIDA WEB/APP) ---

    // 1. Configuração do Botão de Alternância (Switch)
    const waModeToggle = document.getElementById('wa-mode-toggle');

    // Ao carregar a página, verifica se o usuário já tinha escolhido 'app' antes
    if (localStorage.getItem('wa_opener_mode') === 'app') {
        waModeToggle.checked = true;
    }

    // Ao clicar no botão, salva a preferência para o futuro
    waModeToggle.addEventListener('change', () => {
        localStorage.setItem('wa_opener_mode', waModeToggle.checked ? 'app' : 'web');
    });

    // 2. Lógica do Clique na Lista de Clientes
    reminderQueueList.addEventListener('click', (e) => {
        const link = e.target.closest('.reminder-link');
        if (!link) return;

        e.preventDefault(); // Impede o link padrão

        const message = link.getAttribute('data-message');

        // Pega apenas o número limpo do link original
        const rawPhone = link.href.split('phone=')[1] || link.href.split('/').pop();

        // --- DECISÃO DO LINK BASEADA NO BOTÃO ---
        let targetUrl;

        if (waModeToggle.checked) {
            // MODO APP (Windows Instalado): Protocolo whatsapp://
            targetUrl = `whatsapp://send?phone=${rawPhone}`;
        } else {
            // MODO WEB (Navegador): Link direto web.whatsapp.com
            targetUrl = `https://web.whatsapp.com/send?phone=${rawPhone}`;
        }

        // Copia para a área de transferência
        navigator.clipboard.writeText(message).then(() => {
            // Feedback Visual (Botão Verde "Copiado")
            const badge = link.querySelector('.badge');
            const originalBadgeText = badge.innerHTML;

            badge.classList.remove('bg-light', 'text-dark');
            badge.classList.add('bg-success', 'text-white');
            badge.innerHTML = '<i class="bi bi-check"></i> Copiado!';

            // Marca a linha como "já clicada" (riscado e verde claro)
            link.classList.add('active');
            link.style.backgroundColor = '#d1e7dd';
            link.style.textDecoration = 'line-through';

            // Abre o WhatsApp
            setTimeout(() => {
                if (waModeToggle.checked) {
                    // MODO APP: Abre na mesma janela para o navegador disparar o aplicativo
                    window.location.href = targetUrl;
                } else {
                    // MODO WEB: Abre em nova aba
                    window.open(targetUrl, '_blank');
                }

                // Restaura o texto do botão "Copiar" depois de 3 segundos
                setTimeout(() => {
                    badge.classList.remove('bg-success', 'text-white');
                    badge.classList.add('bg-light', 'text-dark');
                    badge.innerHTML = originalBadgeText;
                }, 3000);
            }, 300);

        }).catch(err => {
            console.error('Erro ao copiar: ', err);
            // Fallback: se falhar a cópia, tenta abrir o link mesmo assim
            window.open(targetUrl, '_blank');
        });
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
                        document.getElementById('editClientCPF').readOnly = false;
                        editProfessionInput.readOnly = false;
                        editNeighborhoodInput.readOnly = false;
                        editRouteCitySelect.disabled = false;
                        editRouteNeighborhoodSelect.readOnly = false;
                        editRouteNeighborhoodSelect.disabled = !editRouteCitySelect.value;
                        editRouteNewNeighborhoodInput.readOnly = false;
                        editRouteNewNeighborhoodInput.disabled = !editRouteCitySelect.value;
                        updateNeighborhoodManagerState(editNeighborhoodConfig);
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
        pauseDateInput.value = '';
        pauseNoteInput.value = ''; // <--- LIMPA A NOTA ANTERIOR
        new bootstrap.Modal(pauseReminderModalEl).show();
    });

    // 2. Salvar a pausa
    savePauseBtn.addEventListener('click', async () => {
        if (!selectedClientId || !pauseDateInput.value) return;

        const client = allClientsForSearch.find(c => c.id === selectedClientId);
        if (!client) return;

        // ATUALIZAÇÃO: SALVA A DATA E A NOTA
        const updatedData = {
            ...client,
            reminder_paused_until: pauseDateInput.value,
            reminder_pause_note: pauseNoteInput.value // <--- PEGA O TEXTO
        };

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

        // ATUALIZAÇÃO: LIMPA A DATA E A NOTA
        const updatedData = {
            ...client,
            reminder_paused_until: null,
            reminder_pause_note: '' // <--- LIMPA A NOTA NO BANCO
        };

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

    // --- LÓGICA DO RELATÓRIO INDIVIDUAL DO CLIENTE (ATUALIZADA COM JUROS) ---

    clientReportBtn.addEventListener('click', () => {
        if (!selectedClientId) return;
        const client = allClientsForSearch.find(c => c.id === selectedClientId);
        if (!client) return;

        // 1. Configurações de Data (Para identificar o que é atraso hoje)
        const timeZone = 'America/Cuiaba';
        const todayInCuiaba = new Date().toLocaleDateString('en-CA', { timeZone });
        const todayDateObj = new Date(todayInCuiaba + 'T00:00:00.000Z');

        // 2. Cálculos Básicos
        const totalInstallments = client.paymentDates ? client.paymentDates.length : 0;
        const paidInstallments = client.paymentDates ? client.paymentDates.filter(p => p.status === 'paid').length : 0;
        const remainingInstallments = totalInstallments - paidInstallments;
        const installmentValue = parseFloat(client.dailyValue);

        // 3. Cálculo de Juros por Atraso
        // Filtra parcelas com data menor que hoje e não pagas
        const lateInstallments = (client.paymentDates || []).filter(p => new Date(p.date) < todayDateObj && p.status !== 'paid');
        const lateCount = lateInstallments.length;

        let totalInterest = 0;
        if (lateCount > 0) {
            const clientInterestRate = parseFloat(client.taxa_juros || 20) / 100;
            const interestPerInstallment = installmentValue * clientInterestRate;
            totalInterest = lateCount * interestPerInstallment;
        }

        // 4. Saldo Final (Principal Restante + Juros)
        const baseRemainingValue = remainingInstallments * installmentValue;
        let finalSettlementValue = baseRemainingValue + totalInterest;

        // NOVO: Verifica se tem Saldo (Crédito) e abate da quitação
        const clientReportBalance = parseFloat(client.saldo || 0);
        if (clientReportBalance > 0) {
            finalSettlementValue -= clientReportBalance;
        }
        if (finalSettlementValue < 0) finalSettlementValue = 0; // Evita mostrar valor negativo

        // Calcula porcentagem concluída
        const progress = totalInstallments > 0 ? Math.round((paidInstallments / totalInstallments) * 100) : 0;

        // 5. Montagem do Texto
        let msg = `📊 *EXTRATO DE EMPRÉSTIMO* 📊\n\n`;
        msg += `Olá, *${client.name.split(' ')[0]}*! Aqui está o resumo atualizado do seu contrato:\n\n`;

        msg += `💰 *Valor da Parcela:* ${formatCurrency(installmentValue)}\n`;
        msg += `✅ *Parcelas Pagas:* ${paidInstallments} de ${totalInstallments}\n`;
        msg += `⏳ *Restantes:* ${remainingInstallments} parcelas\n`;

        // SE TIVER ATRASO, ADICIONA O ALERTA E OS JUROS
        if (lateCount > 0) {
            msg += `\n❌ *Atenção:* Constam ${lateCount} parcela(s) em atraso.\n`;
            msg += `📉 *Juros Acumulados:* ${formatCurrency(totalInterest)}\n`;
        }

        msg += `\n📉 *Progresso:* ${progress}% concluído\n`;

        // O valor final aqui já inclui os juros somados
        msg += `🏁 *Saldo para Quitação:* *${formatCurrency(finalSettlementValue)}*\n\n`;

        msg += `_Continue pagando em dia para manter seu crédito sempre disponível!_ 🤝`;

        // 6. Exibir
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

    // 1. CLIQUE NO BOTÃO DE RISCO (Toggle)
    riskBtn.addEventListener('click', async () => {
        if (!selectedClientId) return;
        const client = allClientsForSearch.find(c => c.id === selectedClientId);
        if (!client) return;

        // Inverte o status atual
        const newRiskStatus = !client.is_risk;

        // Feedback visual imediato no botão
        riskBtn.disabled = true;

        try {
            const updatedClient = await updateClient({ ...client, is_risk: newRiskStatus });
            if (updatedClient) {
                updateClientData(updatedClient);
            }
        } catch (err) {
            console.error(err);
            alert('Erro ao alterar status de risco.');
        } finally {
            riskBtn.disabled = false;
        }
    });

    // Função auxiliar para enviar mensagem VIP
    const sendVipMessage = (msgType) => {
        if (!selectedClientId) return;
        const client = allClientsForSearch.find(c => c.id === selectedClientId);

        const firstName = client.name.split(' ')[0];
        const rawPhone = client.phone.replace(/\D/g, '');

        // Emojis (Via código)
        const i = {
            star: String.fromCodePoint(0x2B50),
            party: String.fromCodePoint(0x1F389),
            hand: String.fromCodePoint(0x1F91D),
            money: String.fromCodePoint(0x1F4B8),
            check: String.fromCodePoint(0x2705),
            rocket: String.fromCodePoint(0x1F680)
        };

        let msg = "";

        if (msgType === 'resgate') {
            msg = `${i.star} *OFERTA ESPECIAL* ${i.star}\n\n`;
            msg += `Olá, *${firstName}*! Tudo bem?\n\n`;
            msg += `Passando para te avisar que, como você é um cliente VIP, liberamos uma condição especial para você hoje.\n\n`;
            msg += `${i.money} *Limite pré-aprovado disponível!*\n\n`;
            msg += `Tem interesse em simular sem compromisso? É só responder aqui. ${i.hand}`;
        }
        else if (msgType === 'quitacao_oferta') {
            msg = `${i.check} *QUITAÇÃO CONFIRMADA* ${i.check}\n\n`;
            msg += `Parabéns, *${firstName}*! Seu empréstimo foi finalizado com sucesso no nosso sistema. ${i.party}\n\n`;
            msg += `Gostamos muito de ter você como cliente! Por isso, seu cadastro já está liberado para uma *nova renovação imediata*.\n\n`;
            msg += `${i.rocket} Vamos fazer uma nova simulação agora?`;
        }
        else if (msgType === 'quitacao_seca') {
            msg = `${i.check} *QUITAÇÃO CONFIRMADA* ${i.check}\n\n`;
            msg += `Olá, *${firstName}*.\n\n`;
            msg += `Passando para confirmar que recebemos sua última parcela e seu empréstimo foi *100% quitado* no nosso sistema.`;
        }

        // Copia e Abre
        navigator.clipboard.writeText(msg).then(() => {
            // Fecha o modal
            bootstrap.Modal.getInstance(vipStrategyModalEl).hide();

            // Verifica Web/App e abre
            const savedMode = localStorage.getItem('wa_opener_mode');
            let targetUrl = (savedMode === 'app')
                ? `whatsapp://send?phone=${rawPhone}`
                : `https://web.whatsapp.com/send?phone=${rawPhone}`;

            if (savedMode === 'app') window.location.href = targetUrl;
            else window.open(targetUrl, '_blank');
        });
    };

    // 2. Botão Principal (Abre o Modal)
    vipOfferBtn.addEventListener('click', () => {
        if (!selectedClientId) return;
        // Apenas abre o modal de escolha
        new bootstrap.Modal(vipStrategyModalEl).show();
    });

    // 3. Botões do Modal (Chamam a função acima)
    vipResgateBtn.addEventListener('click', () => sendVipMessage('resgate'));
    vipQuitacaoOfertaBtn.addEventListener('click', () => sendVipMessage('quitacao_oferta'));
    vipQuitacaoSecaBtn.addEventListener('click', () => sendVipMessage('quitacao_seca'));

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

    function applyCobradorRestrictions() {
        if (userRole !== 'cobrador') return; // Se for admin, não faz nada

        // Lista de IDs de elementos para ESCONDER do cobrador
        const elementsToHide = [
            'holiday-btn',          // Feriados
            'download-sheet-btn',   // Planilha
            'add-client-btn',       // Adicionar Novo (Você precisa por esse ID no HTML)
            'edit-client-btn',      // Editar Dados
            'delete-client-btn',    // Excluir Cliente
            'renewal-btn',          // Renovação
            'vip-offer-btn',        // Oferta VIP
            'risk-btn',             // Botão Risco
            'summary-total-loaned',
            'financial-summary-card',
            'upload-file-form', // <--- NOVO: ESCONDE O INPUT DE ARQUIVOS
        ];

        elementsToHide.forEach(id => {
            const el = document.getElementById(id);
            if (el) el.classList.add('d-none'); // Esconde visualmente
        });

        // Esconde o painel de filtros rápidos (pois ele só verá atrasados)
        const filterPanel = document.getElementById('filter-active-btn')?.closest('.card');
        if (filterPanel) filterPanel.classList.add('d-none');
    }

    // FUNÇÃO 1: ATUALIZA O NÚMERO NO BOTÃO
    function updateAgreementsButton() {
        const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Cuiaba' });

        // Filtra clientes cujo acordo vence EXATAMENTE hoje
        let dueToday = allClientsForSearch.filter(client => {
            const pauseDate = client.reminder_paused_until ? client.reminder_paused_until.split('T')[0] : null;
            return pauseDate === todayStr;
        });

        // FILTRO DO COBRADOR (Só conta se estiver atrasado)
        if (userRole === 'cobrador') {
            dueToday = dueToday.filter(client => {
                const status = calculateClientStatus(client);
                return status.includes('Atrasado');
            });
        }

        if (dueToday.length > 0) {
            agreementsBadge.textContent = dueToday.length;
            agreementsBadge.classList.remove('d-none');
            agreementsBtn.classList.add('btn-danger');
        } else {
            agreementsBadge.classList.add('d-none');
            agreementsBtn.classList.remove('btn-danger');
        }
    }

    // FUNÇÃO 2: PREENCHE O MODAL COM A LISTA
    function renderAgreementsModal() {
        const todayStr = new Date().toLocaleDateString('en-CA', { timeZone: 'America/Cuiaba' });

        agreementsTodayList.innerHTML = '';
        agreementsUpcomingList.innerHTML = '';
        agreementsTodaySection.classList.add('d-none');

        // 1. Filtra clientes com pausas ativas
        let activeAgreements = allClientsForSearch.filter(client =>
            client.reminder_paused_until && client.reminder_paused_until.split('T')[0] >= todayStr
        );

        // 2. FILTRO DO COBRADOR (Mantido)
        if (userRole === 'cobrador') {
            activeAgreements = activeAgreements.filter(client => {
                const status = calculateClientStatus(client);
                return status.includes('Atrasado');
            });
        }

        const dueToday = activeAgreements.filter(c => c.reminder_paused_until.split('T')[0] === todayStr);
        const upcoming = activeAgreements.filter(c => c.reminder_paused_until.split('T')[0] > todayStr);

        upcoming.sort((a, b) => new Date(a.reminder_paused_until) - new Date(b.reminder_paused_until));

        // HELPER PARA BOTÃO DE EXCLUIR (NOVO)
        const getDeleteBtn = (clientId) => {
            if (userRole === 'cobrador') return '';
            return `<button class="btn btn-sm text-danger delete-agreement-btn ms-2" data-client-id="${clientId}" title="Cancelar Acordo"><i class="bi bi-x-lg"></i></button>`;
        };

        // Renderiza HOJE
        if (dueToday.length > 0) {
            agreementsTodaySection.classList.remove('d-none');
            dueToday.forEach(client => {
                const item = document.createElement('div');
                item.className = 'list-group-item list-group-item-warning';
                item.innerHTML = `
                    <div class="d-flex w-100 justify-content-between align-items-start">
                        <div>
                            <h6 class="mb-1">
                                <a href="#" class="text-dark agreement-client-link fw-bold" data-client-id="${client.id}">${client.name}</a>
                            </h6>
                            <p class="mb-0 small fst-italic text-muted">"${client.reminder_pause_note || 'Sem anotação.'}"</p>
                        </div>
                        <div class="text-end">
                            <small class="d-block text-muted">ID: ${client.id}</small>
                            ${getDeleteBtn(client.id)}
                        </div>
                    </div>
                `;
                agreementsTodayList.appendChild(item);
            });
        }

        // Renderiza FUTUROS
        if (upcoming.length > 0) {
            upcoming.forEach(client => {
                const pauseDateParts = client.reminder_paused_until.split('T')[0].split('-');
                const formattedDate = `${pauseDateParts[2]}/${pauseDateParts[1]}`;

                const item = document.createElement('div');
                item.className = 'list-group-item';
                item.innerHTML = `
                    <div class="d-flex w-100 justify-content-between align-items-start">
                        <div>
                            <h6 class="mb-1">
                                <a href="#" class="text-dark agreement-client-link fw-bold" data-client-id="${client.id}">${client.name}</a>
                            </h6>
                            <p class="mb-0 small fst-italic text-muted">"${client.reminder_pause_note || 'Sem anotação.'}"</p>
                        </div>
                        <div class="text-end">
                            <span class="badge bg-primary rounded-pill mb-1">${formattedDate}</span>
                            <div>${getDeleteBtn(client.id)}</div>
                        </div>
                    </div>
                `;
                agreementsUpcomingList.appendChild(item);
            });
        } else {
            if (dueToday.length === 0) {
                agreementsUpcomingList.innerHTML = '<p class="text-muted small">Nenhum acordo agendado para exibição.</p>';
            }
        }
    }

    agreementsBtn.addEventListener('click', () => {
        renderAgreementsModal();
        new bootstrap.Modal(agreementsModalEl).show();
    });

    // --- LÓGICA UNIFICADA: CLICAR NO NOME (ABRIR) OU NO X (EXCLUIR) ---

    const handleAgreementListAction = async (e) => {
        // NÃO TEM e.preventDefault() GLOBAL AQUI, pois pode bloquear o scroll ou outros eventos
        // Usamos preventDefault apenas se clicarmos nos botões específicos.

        // CASO 1: Clicou no botão "X" (Excluir Acordo)
        const deleteBtn = e.target.closest('.delete-agreement-btn');
        if (deleteBtn) {
            e.preventDefault();
            const clientId = parseInt(deleteBtn.dataset.clientId, 10);
            const client = allClientsForSearch.find(c => c.id === clientId);

            if (!client) return;
            if (!confirm(`Deseja cancelar o acordo de ${client.name}? O cliente voltará para a lista de cobrança.`)) return;

            // Remove a pausa e a nota
            const updatedData = {
                ...client,
                reminder_paused_until: null,
                reminder_pause_note: ''
            };

            try {
                // Atualiza no banco
                const updatedClient = await updateClient(updatedData);
                if (updatedClient) {
                    updateClientData(updatedClient); // Atualiza tudo (botão, lista, painel)
                    renderAgreementsModal(); // Reconstrói a lista do modal na hora
                }
            } catch (err) {
                alert('Erro ao cancelar acordo.');
            }
            return;
        }

        // CASO 2: Clicou no Nome (Abrir Perfil)
        const link = e.target.closest('.agreement-client-link');
        if (link) {
            e.preventDefault();
            const clientId = parseInt(link.dataset.clientId, 10);
            renderClientPanel(clientId);
            bootstrap.Modal.getInstance(agreementsModalEl).hide();
        }
    };

    // Aplica o "ouvinte inteligente" para as duas listas
    agreementsTodayList.addEventListener('click', handleAgreementListAction);
    agreementsUpcomingList.addEventListener('click', handleAgreementListAction);

    async function loadResponsibles() {
        try {
            const response = await fetch('/api/settings?type=responsibles', {
                headers: { 'Authorization': `Bearer ${token}` }
            });
            globalResponsiblesList = await response.json();
            updateResponsibleSelects();
        } catch (e) { console.error(e); }
    }

    function updateResponsibleSelects() {
        // Limpa e preenche o dropdown
        responsibleSelect.innerHTML = '<option value="">Selecione o responsável...</option>';

        globalResponsiblesList.forEach(resp => {
            // Só mostra no dropdown se estiver ATIVO
            if (resp.active) {
                const option = document.createElement('option');
                option.value = resp.id;
                option.textContent = resp.name;
                responsibleSelect.appendChild(option);
            }
        });
    }

    manageResponsiblesBtn.addEventListener('click', () => {
        renderResponsiblesList();
        new bootstrap.Modal(responsiblesModalEl).show();
    });

    saveNewRespBtn.addEventListener('click', async () => {
        const name = newRespNameInput.value;
        if (!name) return;

        // URL ATUALIZADA AQUI:
        await fetch('/api/settings?type=responsibles', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
            body: JSON.stringify({ name })
        });

        newRespNameInput.value = '';
        await loadResponsibles(); // Recarrega dropdown e lista
        renderResponsiblesList();
    });

    function renderResponsiblesList() {
        responsiblesList.innerHTML = '';
        globalResponsiblesList.forEach(resp => {
            const li = document.createElement('li');
            li.className = 'list-group-item d-flex justify-content-between align-items-center';

            const statusColor = resp.active ? 'text-success' : 'text-muted text-decoration-line-through';
            const toggleIcon = resp.active ? 'bi-toggle-on' : 'bi-toggle-off';

            li.innerHTML = `
                <span class="${statusColor}">${resp.name}</span>
                <div>
                    <button class="btn btn-sm btn-link text-dark toggle-resp-btn" data-id="${resp.id}" data-active="${resp.active}">
                        <i class="bi ${toggleIcon} fs-5"></i>
                    </button>
                    <button class="btn btn-sm btn-link text-danger delete-resp-btn" data-id="${resp.id}">
                        <i class="bi bi-trash"></i>
                    </button>
                </div>
            `;
            responsiblesList.appendChild(li);
        });
    }

    // Eventos da lista (Toggle e Delete)
    responsiblesList.addEventListener('click', async (e) => {
        const toggleBtn = e.target.closest('.toggle-resp-btn');
        const deleteBtn = e.target.closest('.delete-resp-btn');

        if (toggleBtn) {
            const id = toggleBtn.dataset.id;
            const newStatus = toggleBtn.dataset.active === 'true' ? false : true;
            await fetch('/api/settings?type=responsibles', {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json', 'Authorization': `Bearer ${token}` },
                body: JSON.stringify({ id, active: newStatus })
            });
            await loadResponsibles();
            renderResponsiblesList();
        }

        if (deleteBtn) {
            if (!confirm('Tem certeza? Clientes vinculados ficarão como "Não informado".')) return;
            await fetch(`/api/settings?type=responsibles?id=${deleteBtn.dataset.id}`, {
                method: 'DELETE',
                headers: { 'Authorization': `Bearer ${token}` }
            });
            await loadResponsibles();
            renderResponsiblesList();
        }
    });

    configureNeighborhoodInput(addNeighborhoodConfig);
    configureNeighborhoodInput(editNeighborhoodConfig);
    loadNeighborhoodCatalog();

    updateClock();
    setInterval(updateClock, 1000);
    loadHolidaysForCache();
    loadClients();
    loadFinancialSummary();
    applyCobradorRestrictions();
    loadResponsibles()
});