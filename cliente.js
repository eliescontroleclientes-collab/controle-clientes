// /cliente.js
document.addEventListener('DOMContentLoaded', () => {
    const clientId = sessionStorage.getItem('client_id');

    // Guardião de Autenticação
    if (!clientId) {
        window.location.href = '/cliente-login.html';
        return;
    }

    // Movemos as constantes para dentro do escopo do DOMContentLoaded
    // para garantir que os elementos já existam quando o script rodar.
    const loadingSpinner = document.getElementById('loading-spinner');
    const dashboardContent = document.getElementById('dashboard-content');
    const logoutBtn = document.getElementById('logout-btn');
    const payNowBtn = document.getElementById('pay-now-btn');
    const paymentDetailsModalEl = document.getElementById('paymentDetailsModal');
    const modalTotalToPayEl = document.getElementById('modal-total-to-pay');
    const modalPixKeyEl = document.getElementById('modal-pix-key');
    const copyPixKeyBtn = document.getElementById('copy-pix-key-btn');

    const formatCurrency = (value) => {
        if (isNaN(value)) return "R$ 0,00";
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    function updateClock() {
        const clockTimeEl = document.getElementById('clock-time');
        const clockDateEl = document.getElementById('clock-date');
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

    const loadDashboard = async () => {
        try {
            const response = await fetch(`/api/client-data?clientId=${clientId}`);
            if (!response.ok) {
                throw new Error('Não foi possível carregar seus dados. Tente fazer login novamente.');
            }
            const data = await response.json();

            // Preenche os dados no painel
            document.getElementById('client-name').textContent = data.clientName.split(' ')[0];
            document.getElementById('loan-value').textContent = formatCurrency(data.loanValue);
            document.getElementById('installment-value').textContent = formatCurrency(data.installmentValue);
            document.getElementById('paid-installments').textContent = `${data.paidInstallments} de ${data.totalInstallments}`;
            document.getElementById('pending-installments').textContent = data.pendingInstallments;
            document.getElementById('total-installments').textContent = data.totalInstallments;
            document.getElementById('late-installments').textContent = data.lateInstallments;
            document.getElementById('total-interest').textContent = formatCurrency(data.totalInterest);
            document.getElementById('total-to-pay-now').textContent = formatCurrency(data.totalToPayNow);

            const todayStatusEl = document.getElementById('today-installment-status');
            if (data.todayInstallmentStatus === 'Pendente') {
                todayStatusEl.textContent = 'Pendente';
                todayStatusEl.className = 'text-warning fw-bold';
            } else {
                todayStatusEl.textContent = 'Em Dia';
                todayStatusEl.className = 'text-success fw-bold';
            }

            // Renderiza o calendário
            renderCalendar(data.paymentDates);

            // Mostra o conteúdo e esconde o spinner
            loadingSpinner.classList.add('d-none');
            dashboardContent.classList.remove('d-none');

            // ### CORREÇÃO: LIGAR OS EVENTOS DEPOIS QUE O DASHBOARD ESTÁ VISÍVEL ###
            setupEventListeners();

        } catch (error) {
            alert(error.message);
            sessionStorage.removeItem('client_id');
            window.location.href = '/cliente-login.html';
        }
    };

    const renderCalendar = (paymentDates) => {
        const calendar = document.getElementById('payment-calendar');
        calendar.innerHTML = '';
        if (!paymentDates || paymentDates.length === 0) return;

        const timeZone = 'America/Cuiaba';
        const todayInCuiabaStr = new Date().toLocaleDateString('en-CA', { timeZone });
        const cuiabaTodayUTCMidnight = new Date(todayInCuiabaStr + 'T00:00:00.000Z').getTime();

        paymentDates.forEach(payment => {
            const dayDiv = document.createElement('div');
            const installmentDate = new Date(payment.date);
            const installmentTime = installmentDate.getTime();

            dayDiv.textContent = installmentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });
            dayDiv.classList.add('calendar-day');

            if (payment.status === 'paid') {
                dayDiv.classList.add('status-paid');
            } else if (installmentTime < cuiabaTodayUTCMidnight) {
                dayDiv.classList.add('status-late');
            } else if (installmentTime === cuiabaTodayUTCMidnight) {
                dayDiv.classList.add('status-pending');
            } else {
                dayDiv.classList.add('status-future');
            }
            calendar.appendChild(dayDiv);
        });
    };

    // ### NOVA FUNÇÃO PARA ORGANIZAR OS EVENT LISTENERS ###
    const setupEventListeners = () => {
        logoutBtn.addEventListener('click', () => {
            sessionStorage.removeItem('client_id');
            window.location.href = '/cliente-login.html';
        });

        payNowBtn.addEventListener('click', async () => {
            const totalToPayText = document.getElementById('total-to-pay-now').textContent;
            modalTotalToPayEl.textContent = totalToPayText;
            modalPixKeyEl.value = 'Buscando...';

            const paymentModal = new bootstrap.Modal(paymentDetailsModalEl);
            paymentModal.show();

            try {
                const response = await fetch('/api/get-config?name=pix_key');
                const data = await response.json();
                modalPixKeyEl.value = data.value || 'Chave PIX não configurada.';
            } catch (error) {
                console.error('Erro ao buscar chave PIX:', error);
                modalPixKeyEl.value = 'Erro ao buscar a chave.';
            }
        });

        copyPixKeyBtn.addEventListener('click', () => {
            modalPixKeyEl.select();
            document.execCommand('copy');

            const originalText = copyPixKeyBtn.innerHTML;
            copyPixKeyBtn.innerHTML = '<i class="bi bi-clipboard-check"></i> Copiado!';
            copyPixKeyBtn.classList.remove('btn-outline-secondary');
            copyPixKeyBtn.classList.add('btn-success');

            setTimeout(() => {
                copyPixKeyBtn.innerHTML = originalText;
                copyPixKeyBtn.classList.remove('btn-success');
                copyPixKeyBtn.classList.add('btn-outline-secondary');
            }, 2000);
        });
    };

    // --- INICIALIZAÇÃO ---
    updateClock();
    setInterval(updateClock, 1000);
    loadDashboard(); // A única chamada principal aqui
});