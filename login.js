document.addEventListener('DOMContentLoaded', () => {
    const loginForm = document.getElementById('login-form');
    const usernameInput = document.getElementById('username');
    const passwordInput = document.getElementById('password');
    const loginBtn = document.getElementById('login-btn');
    const loginError = document.getElementById('login-error');
    const music = document.getElementById('background-music');
    const volumeBtn = document.getElementById('volume-btn');
    const volumeSlider = document.getElementById('volume-slider');

    let hasInteracted = false;

    const startMusic = () => {
        if (!hasInteracted) {
            hasInteracted = true;
            music.play().catch(error => {
                console.log("Autoplay falhou mesmo após interação. O usuário deve controlar manualmente.");
            });
        }
    };

    document.body.addEventListener('click', startMusic, { once: true });
    usernameInput.addEventListener('keydown', startMusic, { once: true });
    passwordInput.addEventListener('keydown', startMusic, { once: true });


    // Lógica do Player de Música
    volumeBtn.addEventListener('click', () => {
        startMusic();

        music.muted = !music.muted;
        if (music.muted) {
            volumeSlider.value = 0;
            volumeBtn.innerHTML = '<i class="bi bi-volume-mute-fill"></i>';
        } else {
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

    // ######### INÍCIO DA INICIALIZAÇÃO DO PARTICLES.JS #########
    particlesJS('particles-js', {
        "particles": {
            "number": {
                "value": 160, // Quantidade de flocos
                "density": {
                    "enable": true,
                    "value_area": 800
                }
            },
            "color": {
                "value": "#ffffff"
            },
            "shape": {
                "type": "circle",
            },
            "opacity": {
                "value": 0.5,
                "random": true,
            },
            "size": {
                "value": 3,
                "random": true,
            },
            "line_linked": {
                "enable": false
            },
            "move": {
                "enable": true,
                "speed": 1, // Velocidade da queda
                "direction": "bottom",
                "random": false,
                "straight": false,
                "out_mode": "out",
                "bounce": false
            }
        },
        "interactivity": {
            "detect_on": "canvas",
            "events": {
                "onhover": {
                    "enable": false
                },
                "onclick": {
                    "enable": false
                },
                "resize": true
            }
        },
        "retina_detect": true
    });
    // ######### FIM DA INICIALIZAÇÃO #########

});