// Mobile burger menu
(function initBurger() {
  const burger  = document.querySelector('.nav-burger');
  const menu    = document.getElementById('mobile-menu');
  const close   = document.querySelector('.mobile-menu-close');
  const links   = document.querySelectorAll('.mobile-menu-link');
  if (!burger || !menu) return;

  function openMenu() {
    menu.classList.add('is-open');
    menu.removeAttribute('aria-hidden');
    burger.setAttribute('aria-expanded', 'true');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    burger.setAttribute('aria-expanded', 'false');
    document.body.style.overflow = '';
  }

  burger.addEventListener('click', openMenu);
  if (close) close.addEventListener('click', closeMenu);
  links.forEach(l => l.addEventListener('click', closeMenu));
  menu.addEventListener('click', (e) => { if (e.target === menu) closeMenu(); });
  document.addEventListener('keydown', (e) => { if (e.key === 'Escape') closeMenu(); });
})();

// Custom cursor tracking
(function initCursor() {
  const cursor = document.getElementById('cursor');
  if (!cursor) return;
  let raf;
  let mx = -100, my = -100;
  document.addEventListener('mousemove', (e) => {
    mx = e.clientX; my = e.clientY;
    if (!raf) raf = requestAnimationFrame(() => {
      cursor.style.left = mx + 'px';
      cursor.style.top = my + 'px';
      raf = null;
    });
  });
  document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });
})();

const nav = document.querySelector("nav");
const heroLabel = document.querySelector(".hero-label");

function updateNavState() {
  if (!nav) return;

  const threshold = heroLabel
    ? heroLabel.getBoundingClientRect().top + window.scrollY - nav.offsetHeight
    : 120;

  if (window.scrollY >= threshold) {
    nav.classList.add("scrolled");
    document.body.classList.add("page-scrolled");
  } else {
    nav.classList.remove("scrolled");
    document.body.classList.remove("page-scrolled");
  }
}

window.addEventListener("scroll", updateNavState, { passive: true });
window.addEventListener("resize", updateNavState);
updateNavState();

(function initBottomNavReveal() {
  const bottomNav = document.querySelector(".bottom-nav");
  const firstBlock = document.querySelector("#hero, .pp-hero");
  if (!bottomNav || !firstBlock) return;

  function updateBottomNavState() {
    const threshold = firstBlock.offsetTop + firstBlock.offsetHeight * 0.1;
    document.body.classList.toggle("bottom-nav-visible", window.scrollY >= threshold);
  }

  window.addEventListener("scroll", updateBottomNavState, { passive: true });
  window.addEventListener("resize", updateBottomNavState);
  updateBottomNavState();
})();

(function initServicesEditorial() {
  const section = document.getElementById("services-editorial");
  if (!section) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  function startCountUp(el) {
    const finalNum = Number.parseInt(el.getAttribute("data-target"), 10);
    if (!Number.isFinite(finalNum)) return;

    let frame = 0;
    const totalFrames = 18;
    const timer = window.setInterval(() => {
      frame += 1;
      if (frame < totalFrames) {
        const converging = frame > totalFrames - 4;
        const nextValue = converging ? finalNum : Math.floor(Math.random() * 9) + 1;
        el.textContent = String(nextValue).padStart(2, "0");
        return;
      }

      el.textContent = String(finalNum).padStart(2, "0");
      window.clearInterval(timer);
    }, 42);
  }

  const revealTargets = section.querySelectorAll(".ed-header, .ed-card, .ed-cta-block");
  if ("IntersectionObserver" in window) {
    const revealObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;

        const el = entry.target;
        el.classList.add("ed-visible");

        if (!prefersReduced && el.classList.contains("ed-card")) {
          const numEl = el.querySelector(".ed-num");
          if (numEl) {
            const delay = Number.parseFloat(window.getComputedStyle(el).transitionDelay || "0") * 1000;
            window.setTimeout(() => startCountUp(numEl), delay + 350);
          }
        }

        revealObserver.unobserve(el);
      });
    }, { threshold: 0.12 });

    revealTargets.forEach((el) => revealObserver.observe(el));
  } else {
    revealTargets.forEach((el) => el.classList.add("ed-visible"));
  }

  if (!prefersReduced && "IntersectionObserver" in window) {
    const shimmerTargets = section.querySelectorAll(".ed-heading, .ed-cta-title");
    const shimmerObserver = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add("ed-shimmer");
        shimmerObserver.unobserve(entry.target);
      });
    }, { threshold: 0.6 });

    shimmerTargets.forEach((el) => shimmerObserver.observe(el));
  }

  if (!prefersReduced) {
    section.querySelectorAll(".ed-card").forEach((card) => {
      card.addEventListener("touchstart", (event) => {
        const touch = event.touches[0];
        if (!touch) return;

        const rect = card.getBoundingClientRect();
        const size = Math.max(rect.width, rect.height) * 2.2;
        const ripple = document.createElement("span");
        ripple.className = "ed-ripple";
        ripple.style.width = `${size}px`;
        ripple.style.height = `${size}px`;
        ripple.style.left = `${touch.clientX - rect.left - size / 2}px`;
        ripple.style.top = `${touch.clientY - rect.top - size / 2}px`;
        card.appendChild(ripple);

        window.setTimeout(() => ripple.remove(), 850);
      }, { passive: true });
    });

    const ctaButton = section.querySelector(".ed-btn");
    if (ctaButton) {
      window.setTimeout(() => ctaButton.classList.add("ed-pulse-active"), 2200);
    }
  }
})();

// Global scroll reveal — adds .visible to any .reveal element as it enters the viewport
(function initReveal() {
  const els = document.querySelectorAll('.reveal:not(.visible)');
  if (!els.length) return;

  if ('IntersectionObserver' in window) {
    const observer = new IntersectionObserver((entries) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) return;
        entry.target.classList.add('visible');
        observer.unobserve(entry.target);
      });
    }, { threshold: 0.08 });

    els.forEach((el) => observer.observe(el));
  } else {
    els.forEach((el) => el.classList.add('visible'));
  }
})();

// Proposal quiz controller. Kept global because the existing HTML uses inline handlers.
(function initProposalQuiz() {
  const quiz = document.getElementById('quiz-section');
  if (!quiz) return;

  const totalSteps = 5;
  let currentStep = 1;
  let budgetPersonal = false;

  const stepEls = Array.from(quiz.querySelectorAll('.qstep'));
  const progressLabel = document.getElementById('qProgressLabel');
  const progressBar = document.getElementById('qProgressBar');
  const progressFill = document.getElementById('qProgressFill');
  const successScreen = document.getElementById('qSuccessScreen');
  const submitBtn = document.getElementById('qSubmitBtn');
  const waLink = document.getElementById('qWaLink');

  function selectedText(selector) {
    return quiz.querySelector(selector)?.dataset.val || '';
  }

  function selectedList(selector) {
    return Array.from(quiz.querySelectorAll(selector)).map((el) => el.dataset.val).filter(Boolean);
  }

  function getField(id) {
    return document.getElementById(id);
  }

  function getValue(id) {
    return getField(id)?.value.trim() || '';
  }

  function setError(step, visible) {
    const err = document.getElementById(`qerr${step}`);
    if (!err) return;
    err.classList.toggle('show', Boolean(visible));
  }

  function updateProgress() {
    if (progressLabel) progressLabel.textContent = `Step ${currentStep} of ${totalSteps}`;
    if (progressBar) progressBar.setAttribute('aria-valuenow', String(currentStep));
    if (progressFill) progressFill.style.width = `${(currentStep / totalSteps) * 100}%`;
  }

  function showStep(step, direction = 'next') {
    currentStep = Math.max(1, Math.min(totalSteps, step));
    stepEls.forEach((el) => {
      el.classList.remove('active', 'back');
      if (el.id === `qstep${currentStep}`) {
        el.classList.add('active');
        if (direction === 'back') el.classList.add('back');
      }
    });
    if (successScreen) successScreen.classList.remove('active');
    updateProgress();
  }

  function validateStep(step) {
    setError(step, false);

    if (step === 1) {
      const hasType = Boolean(quiz.querySelector('#qEventTypeChoices .qchoice.selected'));
      setError(1, !hasType);
      return hasType;
    }

    if (step === 2) {
      const hasServices = quiz.querySelectorAll('.qsvc.selected').length > 0;
      const hasCustom = getValue('qCustomService').length > 0;
      setError(2, !hasServices && !hasCustom);
      return hasServices || hasCustom;
    }

    if (step === 3) {
      const valid = getValue('qEventDate').length > 0 && getValue('qEventLocation').length > 0;
      setError(3, !valid);
      return valid;
    }

    if (step === 5) {
      const valid = getValue('qContactName').length > 0
        && getValue('qContactPhone').length > 0
        && Boolean(getField('qConsentCheck')?.checked);
      setError(5, !valid);
      return valid;
    }

    return true;
  }

  function formatGuests(raw) {
    const value = Number(raw);
    if (value >= 100) return '1000+';
    return String(Math.max(0, value * 10));
  }

  function formatMoney(raw) {
    return Number(raw).toLocaleString('en-US');
  }

  window.qSelectChoice = function qSelectChoice(el, groupId) {
    const group = document.getElementById(groupId);
    if (!group || !el) return;
    group.querySelectorAll('.qchoice').forEach((choice) => choice.classList.remove('selected'));
    el.classList.add('selected');
    setError(1, false);
  };

  window.qSelectPill = function qSelectPill(el, groupId) {
    const group = document.getElementById(groupId);
    if (!group || !el) return;
    group.querySelectorAll('.qpill').forEach((pill) => pill.classList.remove('selected'));
    el.classList.add('selected');
  };

  window.qNextStep = function qNextStep(step) {
    if (!validateStep(step)) return;
    showStep(step + 1);
  };

  window.qPrevStep = function qPrevStep(step) {
    showStep(step - 1, 'back');
  };

  window.qUpdateGuests = function qUpdateGuests(input) {
    const output = document.getElementById('qGuestVal');
    const suffix = document.getElementById('qGuestSuffix');
    if (!output || !input) return;
    output.textContent = formatGuests(input.value);
    if (suffix) suffix.textContent = '';
  };

  window.qUpdateBudget = function qUpdateBudget(input) {
    const output = document.getElementById('qBudgetVal');
    if (!output || !input) return;
    output.textContent = formatMoney(input.value);
  };

  window.qToggleBudgetPersonal = function qToggleBudgetPersonal() {
    budgetPersonal = !budgetPersonal;
    const sliderBlock = document.getElementById('qBudgetSliderBlock');
    const personalBlock = document.getElementById('qBudgetPersonalBlock');
    const toggleBtn = document.getElementById('qBudgetToggleBtn');

    if (sliderBlock) sliderBlock.style.display = budgetPersonal ? 'none' : '';
    if (personalBlock) personalBlock.classList.toggle('active', budgetPersonal);
    if (toggleBtn) {
      toggleBtn.textContent = budgetPersonal
        ? '←  Show budget slider'
        : "💬  I'd prefer to discuss the budget personally";
    }
  };

  window.qPreselectTag = function qPreselectTag(value) {
    const target = Array.from(document.querySelectorAll('#qEventTypeChoices .qchoice'))
      .find((el) => el.dataset.val === value);
    if (target) window.qSelectChoice(target, 'qEventTypeChoices');
    showStep(1);
    window.setTimeout(() => {
      document.getElementById('quiz')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 20);
  };

  const GAS_URL = 'https://script.google.com/macros/s/AKfycbyERCBhNWg5FZMPO96XJK_3Wo_9eslOugO8GNGDeYnRJHcblYYJU-bM28SwTblAQHhM/exec';

  window.qSubmitQuiz = async function qSubmitQuiz() {
    if (!validateStep(5)) return;

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
    }

    const eventType = selectedText('#qEventTypeChoices .qchoice.selected') || 'Not selected';
    const services = selectedList('.qsvc.selected');
    const customService = getValue('qCustomService');
    if (customService) services.push(customService);

    const budget = budgetPersonal
      ? 'Discuss personally'
      : `$${formatMoney(getField('qBudgetSlider')?.value || 5000)}`;

    const message = [
      'New event proposal request',
      `Event type: ${eventType}`,
      `Services: ${services.join(', ') || 'Not selected'}`,
      `Date: ${getValue('qEventDate') || 'Not provided'}`,
      `Location: ${getValue('qEventLocation') || 'Not provided'}`,
      `Guests: ${formatGuests(getField('qGuestSlider')?.value || 10)}`,
      `Budget: ${budget}`,
      `Name: ${getValue('qContactName')}`,
      `Phone: ${getValue('qContactPhone')}`,
      `Email: ${getValue('qContactEmail') || 'Not provided'}`,
      `Heard from: ${selectedText('#qHeardPills .qpill.selected') || 'Not selected'}`,
      `Preferred contact: ${selectedList('.qcmethod.selected').join(', ') || 'Not selected'}`,
      `Notes: ${getValue('qContactNotes') || 'None'}`
    ].join('\n');

    if (waLink) {
      waLink.href = `https://wa.me/19402793660?text=${encodeURIComponent(message)}`;
    }

    try {
      await fetch(GAS_URL, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'EventProposal',
          eventType,
          services: services.join(', ') || 'Not selected',
          date: getValue('qEventDate') || 'Not provided',
          location: getValue('qEventLocation') || 'Not provided',
          guests: formatGuests(getField('qGuestSlider')?.value || 10),
          budget,
          name: getValue('qContactName'),
          phone: getValue('qContactPhone'),
          email: getValue('qContactEmail') || 'Not provided',
          heardFrom: selectedText('#qHeardPills .qpill.selected') || 'Not selected',
          preferredContact: selectedList('.qcmethod.selected').join(', ') || 'Not selected',
          notes: getValue('qContactNotes') || 'None'
        })
      });
    } catch (e) {
      console.error('Webhook error:', e);
    }

    window.setTimeout(() => {
      stepEls.forEach((el) => el.classList.remove('active'));
      if (successScreen) successScreen.classList.add('active');
      if (progressLabel) progressLabel.textContent = 'Request received';
      if (progressFill) progressFill.style.width = '100%';
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Get My Proposal →';
      }
    }, 350);
  };

  quiz.addEventListener('input', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.matches('#qEventDate, #qEventLocation')) setError(3, false);
    if (target.matches('#qContactName, #qContactPhone, #qConsentCheck')) setError(5, false);
    if (target.matches('#qCustomService')) setError(2, false);
  });

  quiz.querySelectorAll('.qsvc').forEach((svc) => {
    svc.addEventListener('click', () => setError(2, false));
  });

  const topButton = quiz.querySelector('.qbtn-home');
  if (topButton) {
    topButton.addEventListener('click', (event) => {
      event.preventDefault();
      showStep(1);
      window.scrollTo({ top: 0, behavior: 'smooth' });
    });
  }

  window.qUpdateGuests(getField('qGuestSlider'));
  window.qUpdateBudget(getField('qBudgetSlider'));
  showStep(1);
})();
