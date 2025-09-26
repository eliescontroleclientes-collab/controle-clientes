// /cliente.js
document.addEventListener('DOMContentLoaded', () => {
    const clientId = sessionStorage.getItem('client_id');
    const loadingSpinner = document.getElementById('loading-spinner');
    const dashboardContent = document.getElementById('dashboard-content');
    const logoutBtn = document.getElementById('logout-btn');

    // ### INÍCIO DA ADIÇÃO: CONSTANTES DO MODAL DE PAGAMENTO ###
    const payNowBtn = document.getElementById('pay-now-btn');
    const paymentDetailsModalEl = document.getElementById('paymentDetailsModal');
    const modalTotalToPayEl = document.getElementById('modal-total-to-pay');
    const modalPixKeyEl = document.getElementById('modal-pix-key');
    const copyPixKeyBtn = document.getElementById('copy-pix-key-btn');
    // ### FIM DA ADIÇÃO ###

    // Guardião de Autenticação
    if (!clientId) {
        window.location.href = '/cliente-login.html';
        return;
    }

    const formatCurrency = (value) => {
        if (isNaN(value)) return "R$ 0,00";
        return new Intl.NumberFormat('pt-BR', { style: 'currency', currency: 'BRL' }).format(value);
    };

    // ### INÍCIO DA ADIÇÃO: FUNÇÃO DO RELÓGIO ###
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
    // ### FIM DA ADIÇÃO: FUNÇÃO DO RELÓGIO ###

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

            // ### INÍCIO DA ADIÇÃO: LÓGICA DO STATUS DA PARCELA DE HOJE ###
            const todayStatusEl = document.getElementById('today-installment-status');
            if (data.todayInstallmentStatus === 'Pendente') {
                todayStatusEl.textContent = 'Pendente';
                todayStatusEl.className = 'text-warning fw-bold';
            } else {
                todayStatusEl.textContent = 'Em Dia';
                todayStatusEl.className = 'text-success fw-bold';
            }
            // ### FIM DA ADIÇÃO ###

            // Renderiza o calendário
            renderCalendar(data.paymentDates);

            // Mostra o conteúdo e esconde o spinner
            loadingSpinner.classList.add('d-none');
            dashboardContent.classList.remove('d-none');

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

        // ### INÍCIO DA CORREÇÃO - LÓGICA DE DATA IDÊNTICA AO script.js ###
        const timeZone = 'America/Cuiaba';
        // 1. Pega a data de hoje em Cuiabá como string 'YYYY-MM-DD'
        const todayInCuiabaStr = new Date().toLocaleDateString('en-CA', { timeZone });
        // 2. Cria um objeto Date representando a meia-noite UTC desse dia.
        //    Isso garante uma comparação precisa com as datas do banco (que são UTC).
        const cuiabaTodayUTCMidnight = new Date(todayInCuiabaStr + 'T00:00:00.000Z').getTime();
        // ### FIM DA CORREÇÃO ###

        paymentDates.forEach(payment => {
            const dayDiv = document.createElement('div');
            // As datas de pagamento já vêm como UTC do banco, então podemos criar o objeto Date diretamente
            const installmentDate = new Date(payment.date);
            const installmentTime = installmentDate.getTime();

            dayDiv.textContent = installmentDate.toLocaleDateString('pt-BR', { day: '2-digit', month: '2-digit', timeZone: 'UTC' });
            dayDiv.classList.add('calendar-day');

            // ### LÓGICA DE CORES USANDO A NOVA VARIÁVEL PRECISA ###
            if (payment.status === 'paid') {
                dayDiv.classList.add('status-paid'); // Verde para pago
            } else if (installmentTime < cuiabaTodayUTCMidnight) {
                dayDiv.classList.add('status-late'); // Vermelho para atrasado
            } else if (installmentTime === cuiabaTodayUTCMidnight) {
                dayDiv.classList.add('status-pending'); // Amarelo para hoje (se pendente)
            } else {
                // Nenhuma classe de cor especial para dias futuros pendentes
                dayDiv.classList.add('status-future');
            }
            calendar.appendChild(dayDiv);
        });
    };

    logoutBtn.addEventListener('click', () => {
        sessionStorage.removeItem('client_id');
        window.location.href = '/cliente-login.html';
    });

    // ### INÍCIO DA ADIÇÃO: LISTENERS DO MODAL DE PAGAMENTO ###
    payNowBtn.addEventListener('click', async () => {
        // Pega o valor total que já foi calculado e está no botão
        const totalToPayText = document.getElementById('total-to-pay-now').textContent;
        modalTotalToPayEl.textContent = totalToPayText;

        // Limpa o campo da chave PIX e mostra um "carregando"
        modalPixKeyEl.value = 'Buscando...';

        const paymentModal = new bootstrap.Modal(paymentDetailsModalEl);
        paymentModal.show();

        // Busca a chave PIX da API
        try {
            const response = await fetch('/api/get-config?name=pix_key');
            const data = await response.json();

            if (data.value) {
                modalPixKeyEl.value = data.value;
            } else {
                modalPixKeyEl.value = 'Chave PIX não configurada.';
            }
        } catch (error) {
            console.error('Erro ao buscar chave PIX:', error);
            modalPixKeyEl.value = 'Erro ao buscar a chave.';
        }
    });

    copyPixKeyBtn.addEventListener('click', () => {
        modalPixKeyEl.select();
        document.execCommand('copy');

        // Feedback visual para o usuário
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

    // ### INÍCIO DA ADIÇÃO: INICIALIZAÇÃO DO RELÓGIO ###
    updateClock();
    setInterval(updateClock, 1000);
    // ### FIM DA ADIÇÃO ###

    // Carrega os dados ao iniciar
    loadDashboard();
});