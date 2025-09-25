document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    const loginError = document.getElementById('login-error');
    const music = document.getElementById('background-music');
    const volumeBtn = document.getElementById('volume-btn');
    const volumeSlider = document.getElementById('volume-slider');

    // Tenta dar play na música (navegadores modernos podem bloquear)
    music.play().catch(error => console.log("Autoplay bloqueado pelo navegador. O usuário precisa interagir."));

    // Lógica do Player de Música
    volumeBtn.addEventListener('click', () => {
        music.muted = !music.muted;
        if (music.muted) {
            volumeSlider.value = 0;
            volumeBtn.innerHTML = '<i class="bi bi-volume-mute-fill"></i>';
        } else {
            // Se o volume era 0, define um padrão
            if (music.volume === 0) {
                music.volume = 0.5;
            }
            volumeSlider.value = music.volume * 100;
            volumeBtn.innerHTML = '<i class="bi bi-volume-up-fill"></i>';
        }
    });

    volumeSlider.addEventListener('input', (e) => {
        const volume = e.target.value / 100;
        music.volume = volume;
        music.muted = volume === 0;

        if (music.muted) {
            volumeBtn.innerHTML = '<i class="bi bi-volume-mute-fill"></i>';
        } else {
            volumeBtn.innerHTML = '<i class="bi bi-volume-up-fill"></i>';
        }
    });

    // Lógica do Formulário de Login
    loginForm.addEventListener('submit', async (e) => {
        e.preventDefault();
        const username = usernameInput.value;
        const password = passwordInput.value;
        const spinner = loginBtn.querySelector('.spinner-border');

        loginBtn.disabled = true;
        spinner.style.display = 'inline-block';
        loginError.style.display = 'none';

        try {
            const response = await fetch('/api/login', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ username, password })
            });

            if (response.ok) {
                sessionStorage.setItem('isAuthenticated', 'true');
                window.location.href = '/index.html';
            } else {
                loginError.style.display = 'block';
            }
        } catch (error) {
            console.error("Erro ao tentar fazer login:", error);
            loginError.textContent = 'Erro de conexão. Tente novamente.';
            loginError.style.display = 'block';
        } finally {
            loginBtn.disabled = false;
            spinner.style.display = 'none';
        }
    });
});