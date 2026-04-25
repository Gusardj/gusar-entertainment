(function () {
    'use strict';

    // ===== 1. LOGO: ИДЕАЛЬНОЕ ВЫРАВНИВАНИЕ ШИРИНЫ (WEBLIUM LOGIC) =====
    // Этот код просчитывает ширину "GUSAR" и растягивает "Entertainment" точно под него
    function matchLogoWidths () {
        const main = document.getElementById('ghLogoMain');
        const sub  = document.getElementById('ghLogoSub');
        if (!main || !sub) return;

        const mainW = main.getBoundingClientRect().width;
        if (mainW === 0) { setTimeout(matchLogoWidths, 60); return; }

        sub.style.letterSpacing = '0em';
        const subNatural = sub.getBoundingClientRect().width;
        const subText    = sub.textContent || sub.innerText;
        const gaps       = subText.length - 1;

        if (gaps < 1) return;

        const extraPerGap = (mainW - subNatural) / gaps;
        const subFontSize = parseFloat(getComputedStyle(sub).fontSize) || 6.5;
        const emValue     = extraPerGap / subFontSize;

        sub.style.letterSpacing = emValue.toFixed(4) + 'em';
    }

    // Запускаем только когда шрифты полностью загрузились, чтобы расчет был точным
    if (document.fonts && document.fonts.ready) {
        document.fonts.ready.then(matchLogoWidths);
    } else {
        window.addEventListener('load', matchLogoWidths);
    }

    // ===== 2. GLASS HEADER: ЗАТЕМНЕНИЕ ПРИ СКРОЛЛЕ =====
    const hdr = document.getElementById('glass-header');
    window.addEventListener('scroll', function () {
        if (!hdr) return;
        if (window.scrollY > 40) {
            hdr.classList.add('gh-scrolled'); // Добавляем класс из нового CSS
        } else {
            hdr.classList.remove('gh-scrolled');
        }
    }, { passive: true });

    // ===== 3. ПЛАВНЫЙ СКРОЛЛ ПО ЯКОРЯМ =====
    document.querySelectorAll('a[href^="#"]').forEach(function (a) {
        a.addEventListener('click', function (e) {
            const id = this.getAttribute('href');
            if (id === '#') { 
                e.preventDefault(); 
                window.scrollTo({ top: 0, behavior: 'smooth' }); 
                return; 
            }
            const target = document.querySelector(id);
            if (target) { 
                e.preventDefault(); 
                target.scrollIntoView({ behavior: 'smooth', block: 'start' }); 
            }
        });
    });

    // ===== 4. ПОЯВЛЕНИЕ ЭЛЕМЕНТОВ ПРИ СКРОЛЛЕ (ОПТИМИЗИРОВАНО) =====
    // Твоя логика IntersectionObserver, адаптированная под новые классы .reveal
    const observerOptions = {
        threshold: 0.1,
        rootMargin: '0px 0px -50px 0px'
    };

    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.classList.add('visible');
                observer.unobserve(entry.target);
            }
        });
    }, observerOptions);

    document.querySelectorAll('.reveal').forEach(el => {
        observer.observe(el);
    });

    // ===== 5. ПАРАЛЛАКС В HERO СЕКЦИИ =====
    // Адаптировано под новый ID блока Hero
    const hero = document.getElementById('hero-clean-block');
    if (hero) {
        hero.addEventListener('mousemove', (e) => {
            const x = (e.clientX / window.innerWidth - 0.5) * 30;
            const y = (e.clientY / window.innerHeight - 0.5) * 30;
            
            // Легкое смещение центрального контента для эффекта глубины
            const content = hero.querySelector('.hcb-content');
            if (content) {
                content.style.transform = `translate(${-x}px, ${-y}px)`;
            }
        });
    }

    // ===== 6. БРЕНДИНГ КОНСОЛИ =====
    console.log('%c GUSAR ENTERTAINMENT ', 'background: #C9A961; color: #0a0a0a; font-size: 16px; font-weight: bold; padding: 8px;');

})();