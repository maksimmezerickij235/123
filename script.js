/* ========================================
   Birthday Website - JavaScript (Red Velvet Edition)
   ======================================== */

// ========================================
// Инициализация при загрузке
// ========================================

document.addEventListener('DOMContentLoaded', () => {
    createParticles();
    createFloatingElements();
    initScrollAnimations();
    createHearts();
    initParallax();
    createRosePetals();
});

// ========================================
// Анимированные частицы на фоне
// ========================================

function createParticles() {
    const particlesContainer = document.getElementById('particles');
    const particleCount = 60;

    for (let i = 0; i < particleCount; i++) {
        const particle = document.createElement('div');
        particle.className = 'particle';

        // Случайная позиция и размер
        particle.style.left = Math.random() * 100 + '%';
        particle.style.width = (Math.random() * 20 + 8) + 'px';
        particle.style.height = particle.style.width;

        // Случайная задержка анимации
        particle.style.animationDelay = Math.random() * 15 + 's';
        particle.style.animationDuration = (Math.random() * 10 + 15) + 's';

        particlesContainer.appendChild(particle);
    }
}

// ========================================
// Летающие элементы (сердца, звёзды, подарки)
// ========================================

function createFloatingElements() {
    const container = document.createElement('div');
    container.className = 'floating-elements';
    document.body.appendChild(container);

    const elements = ['💖', '⭐', '🎁', '💝', '✨', '🌹', '💫', '🎀'];
    const elementCount = 20;

    for (let i = 0; i < elementCount; i++) {
        setTimeout(() => {
            const el = document.createElement('div');
            el.className = 'floating-element';
            el.textContent = elements[Math.floor(Math.random() * elements.length)];
            el.style.left = Math.random() * 100 + '%';
            el.style.animationDelay = Math.random() * 20 + 's';
            el.style.animationDuration = (Math.random() * 15 + 20) + 's';
            el.style.fontSize = (Math.random() * 2 + 1.5) + 'rem';

            container.appendChild(el);

            // Удаляем и создаём заново для бесконечности
            setTimeout(() => {
                el.remove();
            }, 35000);
        }, i * 1000);
    }
}

// ========================================
// Прокрутка к секции с пожеланиями
// ========================================

function scrollToWishes() {
    document.getElementById('wishes').scrollIntoView({
        behavior: 'smooth'
    });
}

// ========================================
// Анимации при прокрутке (расширенные)
// ========================================

function initScrollAnimations() {
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach((entry, index) => {
            if (entry.isIntersecting) {
                // Добавляем задержку для каскадного эффекта
                setTimeout(() => {
                    entry.target.classList.add('visible');
                    createSparkles(entry.target);
                }, index * 100);
            }
        });
    }, observerOptions);

    // Наблюдаем за элементами
    document.querySelectorAll('.animate-on-scroll, .wish-card, .wish-item, .gallery-item').forEach(el => {
        observer.observe(el);
    });

    // Наблюдаем за финальной секцией
    const finalObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                createConfetti();
                createHeartsAnimation();
            }
        });
    }, { threshold: 0.3 });

    const finalContent = document.querySelector('.final-content');
    if (finalContent) {
        finalObserver.observe(finalContent);
    }

    // Наблюдаем за секцией сюрприза
    const surpriseObserver = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                createSparklesAround(entry.target);
            }
        });
    }, { threshold: 0.5 });

    const surpriseSection = document.querySelector('.surprise');
    if (surpriseSection) {
        surpriseObserver.observe(surpriseSection);
    }
}

// ========================================
// Музыка
// ========================================

let isPlaying = false;
const audio = document.getElementById('birthday-music');
const musicBtn = document.getElementById('music-btn');
const volumeSlider = document.getElementById('volume-slider');
const volumeControl = document.getElementById('volume-control');
const volumeValue = document.getElementById('volume-value');

// Установка начальной громкости (30%)
if (audio) {
    audio.volume = 0.3;
}

function toggleMusic() {
    if (!audio) return;

    if (isPlaying) {
        audio.pause();
        musicBtn.classList.remove('playing');
        musicBtn.innerHTML = '<span class="music-icon">🎵</span>';
        volumeSlider.classList.remove('visible');
    } else {
        audio.play().catch(e => {
            console.log('Audio play failed:', e);
        });
        musicBtn.classList.add('playing');
        musicBtn.innerHTML = '<span class="music-icon">🔊</span>';
        volumeSlider.classList.add('visible');
    }
    isPlaying = !isPlaying;
}

function changeVolume(value) {
    if (!audio) return;
    audio.volume = value / 100;
    volumeValue.textContent = value + '%';
}

// Показывать ползунок при наведении на кнопку
if (musicBtn) {
    musicBtn.addEventListener('mouseenter', () => {
        if (isPlaying) {
            volumeSlider.classList.add('visible');
        }
    });

    musicBtn.addEventListener('mouseleave', () => {
        setTimeout(() => {
            if (!volumeSlider.matches(':hover')) {
                volumeSlider.classList.remove('visible');
            }
        }, 300);
    });
}

// Не скрывать, если мышь на ползунке
if (volumeSlider) {
    volumeSlider.addEventListener('mouseenter', () => {
        volumeSlider.classList.add('visible');
    });

    volumeSlider.addEventListener('mouseleave', () => {
        setTimeout(() => {
            volumeSlider.classList.remove('visible');
        }, 300);
    });
}

// ========================================
// Сюрприз
// ========================================

function openSurprise() {
    const surpriseContent = document.getElementById('surprise-content');
    const surpriseBtn = document.getElementById('surprise-btn');
    const video = document.getElementById('surprise-video');

    if (surpriseContent) {
        surpriseContent.classList.add('visible');
    }
    if (surpriseBtn) {
        surpriseBtn.style.display = 'none';
    }

    // Запуск видео
    if (video) {
        video.play().catch(e => {
            console.log('Video autoplay failed:', e);
        });
    }

    // Конфетти
    createConfetti();

    // Лепестки роз
    createRosePetalsBurst();
}

function createFireworks() {
    const fireworksContainer = document.getElementById('fireworks');
    if (!fireworksContainer) return;

    const colors = ['#d4af37', '#f4d03f', '#c41e3a', '#ff6b6b', '#ffd700'];

    for (let i = 0; i < 15; i++) {
        setTimeout(() => {
            const firework = document.createElement('div');
            firework.className = 'firework';
            firework.style.left = Math.random() * 100 + '%';
            firework.style.top = Math.random() * 100 + '%';
            firework.style.color = colors[Math.floor(Math.random() * colors.length)];
            firework.style.background = firework.style.color;

            fireworksContainer.appendChild(firework);

            // Удаляем после анимации
            setTimeout(() => {
                firework.remove();
            }, 1000);
        }, i * 200);
    }
}

// ========================================
// Конфетти
// ========================================

function createConfetti() {
    const colors = ['#d4af37', '#f4d03f', '#c41e3a', '#8b0000', '#ff6b6b', '#fff8f0'];
    const shapes = ['circle', 'square', 'triangle', 'diamond'];

    for (let i = 0; i < 150; i++) {
        setTimeout(() => {
            const confetti = document.createElement('div');
            confetti.className = 'confetti';

            // Случайная позиция
            confetti.style.left = Math.random() * 100 + '%';

            // Случайный цвет
            confetti.style.background = colors[Math.floor(Math.random() * colors.length)];

            // Случайная форма
            const shape = shapes[Math.floor(Math.random() * shapes.length)];
            if (shape === 'circle') {
                confetti.style.borderRadius = '50%';
            } else if (shape === 'square') {
                confetti.style.borderRadius = '0';
            } else if (shape === 'diamond') {
                confetti.style.transform = 'rotate(45deg)';
                confetti.style.borderRadius = '0';
            } else {
                confetti.style.width = '0';
                confetti.style.height = '0';
                confetti.style.background = 'transparent';
                confetti.style.borderLeft = '6px solid transparent';
                confetti.style.borderRight = '6px solid transparent';
                confetti.style.borderBottom = '12px solid ' + colors[Math.floor(Math.random() * colors.length)];
            }

            // Случайный размер
            const size = Math.random() * 12 + 8;
            if (shape !== 'triangle') {
                confetti.style.width = size + 'px';
                confetti.style.height = size + 'px';
            }

            // Случайная задержка
            confetti.style.animationDelay = Math.random() * 3 + 's';

            document.body.appendChild(confetti);

            // Удаляем после падения
            setTimeout(() => {
                confetti.remove();
            }, 7000);
        }, i * 40);
    }
}

// ========================================
// Летающие сердечки
// ========================================

function createHearts() {
    const heartsContainer = document.getElementById('hearts');
    if (!heartsContainer) return;

    const hearts = ['💖', '💕', '💗', '💓', '💝', '❤️', '💘', '❣️'];

    for (let i = 0; i < 20; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.className = 'heart';
            heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
            heart.style.left = Math.random() * 100 + '%';
            heart.style.animationDelay = Math.random() * 3 + 's';

            heartsContainer.appendChild(heart);

            // Удаляем после анимации
            setTimeout(() => {
                heart.remove();
            }, 4000);
        }, i * 150);
    }
}

function createHeartsAnimation() {
    const heartsContainer = document.getElementById('hearts');
    if (!heartsContainer) return;

    const hearts = ['💖', '💕', '💗', '💓', '💝', '❤️'];

    // Создаём больше сердечек
    for (let i = 0; i < 30; i++) {
        setTimeout(() => {
            const heart = document.createElement('div');
            heart.className = 'heart';
            heart.textContent = hearts[Math.floor(Math.random() * hearts.length)];
            heart.style.left = Math.random() * 100 + '%';
            heart.style.animationDelay = Math.random() * 2 + 's';
            heart.style.fontSize = (Math.random() * 1.5 + 2) + 'rem';

            heartsContainer.appendChild(heart);

            setTimeout(() => {
                heart.remove();
            }, 4000);
        }, i * 100);
    }
}

// ========================================
// Искры вокруг элементов
// ========================================

function createSparkles(element) {
    const rect = element.getBoundingClientRect();
    const sparkleCount = 10;

    for (let i = 0; i < sparkleCount; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.left = (rect.left + Math.random() * rect.width) + 'px';
            sparkle.style.top = (rect.top + Math.random() * rect.height) + 'px';

            document.body.appendChild(sparkle);

            setTimeout(() => {
                sparkle.remove();
            }, 1000);
        }, i * 100);
    }
}

function createSparklesAround(element) {
    const rect = element.getBoundingClientRect();
    const positions = [
        { x: 0, y: 0 },
        { x: 1, y: 0 },
        { x: 0, y: 1 },
        { x: 1, y: 1 },
        { x: 0.5, y: 0 },
        { x: 0.5, y: 1 },
        { x: 0, y: 0.5 },
        { x: 1, y: 0.5 }
    ];

    positions.forEach((pos, index) => {
        setTimeout(() => {
            for (let i = 0; i < 5; i++) {
                const sparkle = document.createElement('div');
                sparkle.className = 'sparkle';
                sparkle.style.left = (rect.left + pos.x * rect.width + (Math.random() - 0.5) * 100) + 'px';
                sparkle.style.top = (rect.top + pos.y * rect.height + (Math.random() - 0.5) * 100) + 'px';

                document.body.appendChild(sparkle);

                setTimeout(() => {
                    sparkle.remove();
                }, 1000);
            }
        }, index * 200);
    });
}

// ========================================
// Параллакс эффект для мыши
// ========================================

function initParallax() {
    let mouseX = 0;
    let mouseY = 0;

    document.addEventListener('mousemove', (e) => {
        mouseX = e.clientX / window.innerWidth;
        mouseY = e.clientY / window.innerHeight;

        // Лёгкое движение частиц
        document.querySelectorAll('.particle').forEach((particle, index) => {
            const speed = (index % 5 + 1) * 0.3;
            const x = (mouseX - 0.5) * speed * 30;
            const y = (mouseY - 0.5) * speed * 30;
            particle.style.transform = `translate(${x}px, ${y}px)`;
        });

        // Движение для заголовка
        const heroTitle = document.querySelector('.hero-title');
        if (heroTitle) {
            const titleX = (mouseX - 0.5) * 20;
            const titleY = (mouseY - 0.5) * 10;
            heroTitle.style.transform = `translate(${titleX}px, ${titleY}px)`;
        }
    });
}

// ========================================
// Лепестки роз
// ========================================

function createRosePetals() {
    const petalCount = 15;

    for (let i = 0; i < petalCount; i++) {
        setTimeout(() => {
            createRosePetal();
        }, i * 500);
    }

    // Продолжаем создавать лепестки
    setInterval(() => {
        createRosePetal();
    }, 2000);
}

function createRosePetal() {
    const petal = document.createElement('div');
    petal.className = 'rose-petal';
    petal.style.left = Math.random() * 100 + '%';
    petal.style.animationDuration = (Math.random() * 4 + 6) + 's';
    petal.style.transform = `rotate(${Math.random() * 360}deg)`;

    document.body.appendChild(petal);

    setTimeout(() => {
        petal.remove();
    }, 10000);
}

function createRosePetalsBurst() {
    for (let i = 0; i < 50; i++) {
        setTimeout(() => {
            const petal = document.createElement('div');
            petal.className = 'rose-petal';
            petal.style.left = (50 + (Math.random() - 0.5) * 50) + '%';
            petal.style.animationDuration = (Math.random() * 3 + 4) + 's';
            petal.style.transform = `rotate(${Math.random() * 360}deg)`;
            petal.style.top = '20%';

            document.body.appendChild(petal);

            setTimeout(() => {
                petal.remove();
            }, 8000);
        }, i * 50);
    }
}

// ========================================
// Интерактивные элементы галереи
// ========================================

document.querySelectorAll('.gallery-item').forEach(item => {
    item.addEventListener('click', function() {
        // Увеличение при клике
        this.style.transform = 'scale(1.08) rotate(0deg)';
        setTimeout(() => {
            this.style.transform = '';
        }, 300);

        // Создаём искры
        createSparkles(this);
    });
});

// ========================================
// Анимация кнопок при наведении
// ========================================

document.querySelectorAll('.btn').forEach(btn => {
    btn.addEventListener('mouseenter', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Создаём эффект ripple
        const ripple = document.createElement('span');
        ripple.style.position = 'absolute';
        ripple.style.borderRadius = '50%';
        ripple.style.background = 'rgba(212, 175, 55, 0.5)';
        ripple.style.transform = 'scale(0)';
        ripple.style.animation = 'ripple 0.6s linear';
        ripple.style.left = (x - 25) + 'px';
        ripple.style.top = (y - 25) + 'px';
        ripple.style.width = '50px';
        ripple.style.height = '50px';
        ripple.style.pointerEvents = 'none';

        this.style.position = 'relative';
        this.style.overflow = 'hidden';
        this.appendChild(ripple);

        setTimeout(() => ripple.remove(), 600);
    });
});

// Добавляем стили для ripple эффекта
const style = document.createElement('style');
style.textContent = `
    @keyframes ripple {
        to {
            transform: scale(4);
            opacity: 0;
        }
    }
`;
document.head.appendChild(style);

// ========================================
// Динамическое создание элементов при скролле
// ========================================

let lastScrollY = window.scrollY;
let scrollTimeout;

window.addEventListener('scroll', () => {
    clearTimeout(scrollTimeout);

    scrollTimeout = setTimeout(() => {
        const currentScrollY = window.scrollY;
        const scrollDiff = Math.abs(currentScrollY - lastScrollY);

        // Создаём искры при прокрутке
        if (scrollDiff > 50) {
            createScrollSparkles();
            lastScrollY = currentScrollY;
        }
    }, 100);
});

function createScrollSparkles() {
    const sparkleCount = 5;

    for (let i = 0; i < sparkleCount; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.left = Math.random() * 100 + '%';
            sparkle.style.top = (window.scrollY + Math.random() * window.innerHeight) + 'px';
            sparkle.style.position = 'absolute';

            document.body.appendChild(sparkle);

            setTimeout(() => {
                sparkle.remove();
            }, 1000);
        }, i * 100);
    }
}

// ========================================
// Счётчик дней (опционально)
// ========================================

function updateYear() {
    const yearElement = document.querySelector('.footer-year');
    if (yearElement) {
        yearElement.textContent = new Date().getFullYear();
    }
}

updateYear();

// ========================================
// Поздравление в консоли
// ========================================

console.log(`
    💖 С Днём Рождения, Маргарита! 💖

    ✨ Пусть каждый день будет наполнен счастьем!
    🌟 Все мечты обязательно сбудутся!
    🎂 Наслаждайся своим днём!

    С любовью и теплом 💕
`);

// ========================================
// Слайдер для галереи
// ========================================

// Функция для переворота карточек предсказаний
function revealPrediction(card) {
    card.classList.toggle('revealed');
    
    // Создаём искры при перевороте
    const rect = card.getBoundingClientRect();
    for (let i = 0; i < 8; i++) {
        setTimeout(() => {
            const sparkle = document.createElement('div');
            sparkle.className = 'sparkle';
            sparkle.style.left = (rect.left + Math.random() * rect.width) + 'px';
            sparkle.style.top = (rect.top + Math.random() * rect.height) + 'px';
            sparkle.style.position = 'fixed';
            sparkle.style.zIndex = '1000';
            
            document.body.appendChild(sparkle);
            
            setTimeout(() => {
                sparkle.remove();
            }, 1000);
        }, i * 50);
    }
}

// ========================================
// Дополнительная анимация для заголовков
// ========================================

window.addEventListener('load', () => {
    // Дополнительная анимация для уверенности
    setTimeout(() => {
        document.querySelectorAll('.title-line').forEach((line, index) => {
            line.style.animationDelay = (0.5 + index * 0.5) + 's';
        });
    }, 100);
});

// ========================================
// Анимация иконок в пожеланиях
// ========================================

document.querySelectorAll('.wish-item-icon, .wish-icon').forEach(icon => {
    icon.addEventListener('mouseenter', function() {
        this.style.animation = 'iconPulse 0.5s ease-in-out infinite';
    });

    icon.addEventListener('mouseleave', function() {
        this.style.animation = 'iconPulse 2s ease-in-out infinite';
    });
});

// ========================================
// Эффект свечения для карточек
// ========================================

document.querySelectorAll('.wish-card, .wish-item').forEach(card => {
    card.addEventListener('mousemove', function(e) {
        const rect = this.getBoundingClientRect();
        const x = e.clientX - rect.left;
        const y = e.clientY - rect.top;

        // Создаём эффект свечения
        const glow = document.createElement('div');
        glow.style.position = 'absolute';
        glow.style.width = '100px';
        glow.style.height = '100px';
        glow.style.background = 'radial-gradient(circle, rgba(212, 175, 55, 0.3) 0%, transparent 70%)';
        glow.style.borderRadius = '50%';
        glow.style.left = (x - 50) + 'px';
        glow.style.top = (y - 50) + 'px';
        glow.style.pointerEvents = 'none';
        glow.style.opacity = '0';
        glow.style.transition = 'opacity 0.3s';

        this.style.position = 'relative';
        this.appendChild(glow);

        setTimeout(() => {
            glow.style.opacity = '1';
        }, 10);

        setTimeout(() => {
            glow.remove();
        }, 500);
    });
});
