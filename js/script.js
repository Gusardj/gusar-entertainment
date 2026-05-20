// Mobile burger menu
(function initBurger() {
  const burger  = document.querySelector('.nav-burger');
  const menu    = document.getElementById('mobile-menu');
  const close   = document.querySelector('.mobile-menu-close');
  if (!burger || !menu) return;
  const links   = menu.querySelectorAll('a');

  function openMenu() {
    menu.classList.add('is-open');
    menu.removeAttribute('aria-hidden');
    burger.setAttribute('aria-expanded', 'true');
    document.body.classList.add('mobile-menu-open');
    document.body.classList.remove('bottom-nav-visible', 'nav-hidden');
    document.body.style.overflow = 'hidden';
  }
  function closeMenu() {
    menu.classList.remove('is-open');
    menu.setAttribute('aria-hidden', 'true');
    burger.setAttribute('aria-expanded', 'false');
    document.body.classList.remove('mobile-menu-open');
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
      cursor.style.transform = `translate(${mx - 5}px, ${my - 5}px)`;
      raf = null;
    });
  });
  document.addEventListener('mouseleave', () => { cursor.style.opacity = '0'; });
  document.addEventListener('mouseenter', () => { cursor.style.opacity = '1'; });
})();

const nav = document.querySelector("nav");
const heroLabel = document.querySelector(".hero-label");

let navThreshold = 120;
let navScrolled = null;
function computeNavThreshold() {
  if (heroLabel && nav) {
    navThreshold = heroLabel.getBoundingClientRect().top + window.scrollY - nav.offsetHeight;
  }
}

let navRaf;
function updateNavState() {
  if (!nav) return;
  if (navRaf) return;
  navRaf = requestAnimationFrame(() => {
    navRaf = null;
    const shouldBeScrolled = window.scrollY >= navThreshold;
    if (shouldBeScrolled === navScrolled) return;

    navScrolled = shouldBeScrolled;
    nav.classList.toggle("scrolled", shouldBeScrolled);
    document.body.classList.toggle("page-scrolled", shouldBeScrolled);
  });
}

window.addEventListener("scroll", updateNavState, { passive: true });
window.addEventListener("resize", () => { computeNavThreshold(); updateNavState(); });
computeNavThreshold();
updateNavState();

(function initMobileViewportLock() {
  const isCoarsePointer = window.matchMedia("(pointer: coarse)").matches;
  if (!isCoarsePointer) return;

  // Safari-only pinch gesture prevention (not needed for scroll)
  const preventZoomGesture = (event) => event.preventDefault();
  ["gesturestart", "gesturechange", "gestureend"].forEach((eventName) => {
    document.addEventListener(eventName, preventZoomGesture, { passive: false });
  });
  // Double-tap zoom is already disabled via viewport meta (user-scalable=no, maximum-scale=1.0)
  // The old touchend preventDefault was blocking normal scroll re-touches within 300ms
})();

(function initMobileFab() {
  const fab = document.querySelector(".mobile-fab");
  const toggle = document.querySelector(".mobile-fab-toggle");
  if (!fab || !toggle) return;

  const actions = fab.querySelectorAll(".mobile-fab-action");
  const mobileQuery = window.matchMedia("(max-width: 900px)");
  const directionThreshold = 8;
  let lastScrollY = window.scrollY;
  let ticking = false;
  let scrollStopTimer = 0;
  let fabOpen = false;
  let fabHidden = false;
  let navHidden = document.body.classList.contains("nav-hidden");

  function setBodyNavHidden(hidden) {
    if (navHidden === hidden) return;
    navHidden = hidden;
    document.body.classList.toggle("nav-hidden", hidden);
  }

  function setOpen(open) {
    if (fabOpen === open) return;
    fabOpen = open;
    fab.classList.toggle("is-open", open);
    toggle.setAttribute("aria-expanded", String(open));
    toggle.setAttribute("aria-label", open ? "Close quick contact actions" : "Open quick contact actions");
  }

  function setHidden(hidden) {
    if (fabHidden === hidden) return;
    fabHidden = hidden;
    fab.classList.toggle("is-hidden", hidden);
    if (hidden) setOpen(false);
  }

  function isBlocked() {
    return document.body.classList.contains("mobile-menu-open")
      || document.body.classList.contains("collab-modal-open")
      || document.body.classList.contains("quiz-in-view");
  }

  function showAfterScrollStops() {
    window.clearTimeout(scrollStopTimer);
    scrollStopTimer = window.setTimeout(() => {
      if (mobileQuery.matches && !isBlocked()) setHidden(false);
    }, 180);
  }

  function updateFabOnScroll() {
    const currentScrollY = window.scrollY;
    const deltaY = currentScrollY - lastScrollY;
    lastScrollY = currentScrollY;

    if (!mobileQuery.matches || isBlocked()) {
      setHidden(isBlocked());
      setBodyNavHidden(false);
      return;
    }

    if (currentScrollY <= 4 || deltaY < -directionThreshold) {
      setHidden(false);
      setBodyNavHidden(false);
      return;
    }

    if (deltaY > directionThreshold) {
      setHidden(true);
      setBodyNavHidden(true);
    }

    showAfterScrollStops();
  }

  function requestFabUpdate() {
    if (ticking) return;
    ticking = true;
    requestAnimationFrame(() => {
      updateFabOnScroll();
      ticking = false;
    });
  }

  toggle.addEventListener("click", () => {
    if (!mobileQuery.matches) return;
    setHidden(false);
    setOpen(!fab.classList.contains("is-open"));
  });

  actions.forEach((action) => {
    action.addEventListener("click", () => setOpen(false));
  });

  document.addEventListener("click", (event) => {
    if (!fab.contains(event.target)) setOpen(false);
  });

  document.addEventListener("keydown", (event) => {
    if (event.key === "Escape") setOpen(false);
  });

  window.addEventListener("scroll", requestFabUpdate, { passive: true });
  window.addEventListener("resize", () => {
    setOpen(false);
    setHidden(isBlocked());
    setBodyNavHidden(false);
    lastScrollY = window.scrollY;
  });
  window.addEventListener("load", () => setHidden(isBlocked()));

  const quizSection = document.getElementById("quiz-section");
  if (quizSection && "IntersectionObserver" in window) {
    const quizObserver = new IntersectionObserver((entries) => {
      const inView = entries.some((entry) => entry.isIntersecting);
      document.body.classList.toggle("quiz-in-view", inView);
      setHidden(inView);
    }, { threshold: 0.08, rootMargin: "0px 0px -12% 0px" });
    quizObserver.observe(quizSection);
  }
})();

(function initServicesEditorial() {
  const section = document.getElementById("services-editorial");
  if (!section) return;

  const prefersReduced = window.matchMedia("(prefers-reduced-motion: reduce)").matches;

  // ── Service card modal ──────────────────────────────────────
  const modalOverlay = document.createElement("div");
  modalOverlay.className = "svc-modal-overlay";
  modalOverlay.setAttribute("role", "dialog");
  modalOverlay.setAttribute("aria-modal", "true");
  modalOverlay.setAttribute("aria-labelledby", "svc-modal-title");
  modalOverlay.hidden = true;
  modalOverlay.innerHTML = [
    '<div class="svc-modal-box">',
    '  <button class="svc-modal-close" type="button" aria-label="Close">×</button>',
    '  <span class="svc-modal-num"></span>',
    '  <h3 class="svc-modal-title" id="svc-modal-title"></h3>',
    '  <p class="svc-modal-copy"></p>',
    '  <div class="svc-modal-divider"></div>',
    '  <ul class="svc-modal-list"></ul>',
    "</div>",
  ].join("");
  document.body.appendChild(modalOverlay);

  const modalBox     = modalOverlay.querySelector(".svc-modal-box");
  const modalNum     = modalOverlay.querySelector(".svc-modal-num");
  const modalTitle   = modalOverlay.querySelector(".svc-modal-title");
  const modalCopy    = modalOverlay.querySelector(".svc-modal-copy");
  const modalList    = modalOverlay.querySelector(".svc-modal-list");
  const modalClose   = modalOverlay.querySelector(".svc-modal-close");

  function openSvcModal(num, title, copy, items) {
    modalNum.textContent   = num;
    modalTitle.textContent = title;
    modalCopy.textContent  = copy;
    modalList.innerHTML    = items.map((t) => "<li>" + t + "</li>").join("");
    modalOverlay.hidden    = false;
    document.body.style.overflow = "hidden";
    // Double rAF so the hidden→visible transition fires
    requestAnimationFrame(function () {
      requestAnimationFrame(function () {
        modalOverlay.classList.add("is-visible");
      });
    });
    modalClose.focus();
  }

  function closeSvcModal() {
    modalOverlay.classList.remove("is-visible");
    document.body.style.overflow = "";
    modalOverlay.addEventListener("transitionend", function handler() {
      modalOverlay.hidden = true;
      modalOverlay.removeEventListener("transitionend", handler);
    });
  }

  modalClose.addEventListener("click", closeSvcModal);
  modalOverlay.addEventListener("click", function (e) {
    if (e.target === modalOverlay) closeSvcModal();
  });
  document.addEventListener("keydown", function (e) {
    if (e.key === "Escape" && !modalOverlay.hidden) closeSvcModal();
  });

  section.querySelectorAll(".ed-details-toggle").forEach(function (toggle) {
    const card = toggle.closest(".ed-card");
    if (!card) return;
    const detailsId  = toggle.getAttribute("aria-controls");
    const detailsEl  = document.getElementById(detailsId);
    const titleEl    = card.querySelector(".ed-card-title");
    const copyEl     = card.querySelector(".ed-card-copy");
    const numEl      = card.querySelector(".ed-num");

    const num   = numEl   ? numEl.textContent.trim()   : "";
    const title = titleEl ? titleEl.textContent.trim() : "";
    const copy  = copyEl  ? copyEl.textContent.trim()  : "";
    const items = detailsEl
      ? Array.from(detailsEl.querySelectorAll("li")).map(function (li) { return li.innerHTML.trim(); })
      : [];

    toggle.addEventListener("click", function () {
      openSvcModal(num, title, copy, items);
    });
  });
  // ────────────────────────────────────────────────────────────

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

  const revealTargets = section.querySelectorAll(".ed-header, .ed-card, .ed-mini-cta, .ed-cta-block");
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

  const totalSteps = 4;
  let currentStep = 1;
  let budgetPersonal = false;
  let stepTransitionTimer = 0;
  let lastSubmissionPayload = null;

  const stepEls = Array.from(quiz.querySelectorAll('.qstep'));
  const progressLabel = document.getElementById('qProgressLabel');
  const progressBar = document.getElementById('qProgressBar');
  const progressFill = document.getElementById('qProgressFill');
  const successScreen = document.getElementById('qSuccessScreen');
  const submitBtn = document.getElementById('qSubmitBtn');
  const waLink = document.getElementById('qWaLink');
  const benefitsBlock = document.getElementById('qBenefits');
  const badgeCompact = document.getElementById('qBadgeCompact');
  const reducedMotion = window.matchMedia('(prefers-reduced-motion: reduce)');

  function setText(id, value) {
    const el = document.getElementById(id);
    if (el) el.textContent = value;
  }

  function setSuccessMessage(firstName, contactMethod) {
    const el = document.getElementById('qSuccessMessage');
    if (!el) return;
    const safeName = firstName || 'there';
    const via = contactMethod && contactMethod !== 'Not selected' ? ` via ${contactMethod}` : '';
    el.replaceChildren(
      'Thank you, ',
      Object.assign(document.createElement('strong'), { textContent: safeName }),
      `. Your proposal is on the way! We'll reach out`,
      Object.assign(document.createElement('strong'), { textContent: via }),
      Object.assign(document.createElement('strong'), { textContent: ' within 24 hours' }),
      '.'
    );
  }

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

  function updateBenefitsVisibility() {
    if (benefitsBlock) benefitsBlock.hidden = currentStep !== 1;
    if (badgeCompact) badgeCompact.hidden = currentStep === 1;
  }

  function updateStep1ButtonText() {
    const btn = document.getElementById('qNextBtn1');
    if (!btn) return;
    const sel = quiz.querySelector('#qEventTypeChoices .qchoice.selected');
    if (!sel) { btn.textContent = 'Continue →'; return; }
    const val = sel.dataset.val || '';
    const label = val === 'Something Else' ? 'Continue →' : `Continue with ${val} →`;
    btn.textContent = label;
  }

  function updateStepsNav() {
    quiz.querySelectorAll('.qsn-step, .pstep').forEach((dot) => {
      const s = parseInt(dot.dataset.step, 10);
      dot.classList.remove('active', 'done');
      if (s === currentStep) dot.classList.add('active');
      else if (s < currentStep) dot.classList.add('done');
    });
  }

  function syncStepUi() {
    updateProgress();
    updateBenefitsVisibility();
    updateStepsNav();

    const companyWrap = document.getElementById('qCompanyWrap');
    if (companyWrap && currentStep === 4) {
      const eventType = selectedText('#qEventTypeChoices .qchoice.selected');
      companyWrap.style.display = ['Corporate', 'Brand Launch'].includes(eventType) ? '' : 'none';
    }
  }

  function showStep(step, direction = 'next') {
    const nextStep = Math.max(1, Math.min(totalSteps, step));
    const currentEl = stepEls.find((el) => el.classList.contains('active'));
    const nextEl = document.getElementById(`qstep${nextStep}`);
    const isBack = direction === 'back';
    const shouldAnimate = currentEl && nextEl && currentEl !== nextEl && !reducedMotion.matches;

    window.clearTimeout(stepTransitionTimer);
    currentStep = nextStep;
    if (successScreen) successScreen.classList.remove('active');
    syncStepUi();

    stepEls.forEach((el) => {
      el.classList.remove('step-exit', 'step-exit-back', 'step-enter', 'step-enter-back', 'step-enter-active', 'back');
    });

    if (!nextEl) return;

    if (!shouldAnimate) {
      stepEls.forEach((el) => el.classList.toggle('active', el === nextEl));
      return;
    }

    currentEl.classList.add('step-exit');
    if (isBack) currentEl.classList.add('step-exit-back');

    stepTransitionTimer = window.setTimeout(() => {
      stepEls.forEach((el) => el.classList.remove('active', 'step-exit', 'step-exit-back'));
      nextEl.classList.add('active', 'step-enter');
      if (isBack) nextEl.classList.add('step-enter-back');

      window.requestAnimationFrame(() => {
        nextEl.classList.add('step-enter-active');
        nextEl.classList.remove('step-enter', 'step-enter-back');
      });
    }, 200);
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
      setError(2, !hasServices);
      return hasServices;
    }

    if (step === 3) {
      const hasDate = getValue('qEventDate').length > 0 || Boolean(quiz.querySelector('#qDateOptions .qdate-option.selected'));
      const valid = hasDate && getValue('qEventLocation').length > 0;
      setError(3, !valid);
      return valid;
    }

    if (step === 4) {
      const valid = getValue('qContactFirstName').length > 0
        && getValue('qContactPhone').length > 0
        && Boolean(getField('qConsentCheck')?.checked);
      setError(4, !valid);
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
    if (groupId === 'qEventTypeChoices') {
      const otherWrap = document.getElementById('qOtherEventWrap');
      if (otherWrap) otherWrap.classList.toggle('visible', el.dataset.val === 'Something Else');
      updateStep1ButtonText();
    }
  };

  window.qSelectService = function qSelectService(el) {
    if (!el) return;
    const isEscape = el.classList.contains('qsvc--escape');
    const wasSelected = el.classList.contains('selected');

    if (isEscape) {
      quiz.querySelectorAll('.qsvc').forEach((svc) => svc.classList.remove('selected'));
      el.classList.toggle('selected', !wasSelected);
    } else {
      quiz.querySelectorAll('.qsvc--escape').forEach((svc) => svc.classList.remove('selected'));
      el.classList.toggle('selected');
    }

    setError(2, false);
  };

  window.qSelectPill = function qSelectPill(el, groupId) {
    const group = document.getElementById(groupId);
    if (!group || !el) return;
    group.querySelectorAll('.qpill').forEach((pill) => pill.classList.remove('selected'));
    el.classList.add('selected');
  };

  window.qSelectDateOption = function qSelectDateOption(el) {
    const group = document.getElementById('qDateOptions');
    const dateInput = getField('qEventDate');
    if (!group || !el) return;
    group.querySelectorAll('.qdate-option').forEach((option) => option.classList.remove('selected'));
    el.classList.add('selected');
    if (dateInput) dateInput.value = '';
    setError(3, false);
  };

  window.qToggleContact = function qToggleContact(el) {
    if (!el) return;
    const group = document.getElementById('qContactMethods');
    quiz.querySelectorAll('#qContactMethods .qcmethod').forEach((m) => m.classList.remove('selected'));
    el.classList.add('selected');
    if (group) {
      group.dataset.selectedContact = el.dataset.val || el.textContent.trim();
    }
  };

  window.qToggleBudgetPersonal = function qToggleBudgetPersonal() {
    budgetPersonal = !budgetPersonal;
    const sliderBlock = document.getElementById('qBudgetSliderBlock');
    const personalBlock = document.getElementById('qBudgetPersonalBlock');
    if (sliderBlock) sliderBlock.style.display = budgetPersonal ? 'none' : '';
    if (personalBlock) personalBlock.classList.toggle('active', budgetPersonal);
  };

  window.qToggleNotes = function qToggleNotes() {
    const wrap = document.getElementById('qNotesWrap');
    const btn = document.getElementById('qNotesToggle');
    if (!wrap || !btn) return;
    const open = wrap.style.display === 'none' || wrap.style.display === '';
    wrap.style.display = open ? 'block' : 'none';
    btn.textContent = open ? '− Hide notes' : '+ Add notes or special requests';
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

  window.qPreselectTag = function qPreselectTag(value) {
    const target = Array.from(document.querySelectorAll('#qEventTypeChoices .qchoice'))
      .find((el) => el.dataset.val === value);
    if (target) window.qSelectChoice(target, 'qEventTypeChoices');
    showStep(1);
    window.setTimeout(() => {
      document.getElementById('quiz')?.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }, 20);
  };

  const SCRIPT_URL = 'https://script.google.com/macros/s/AKfycbzPC0VDPbvB5WPCSHE9SFbiVrwrBhZ6XsqZwPDvrhpEE2wwjB4zmKKVK-kWCO47eJIn/exec';

  window.qSubmitQuiz = async function qSubmitQuiz() {
    if (!validateStep(4)) return;

    if (submitBtn) {
      submitBtn.disabled = true;
      submitBtn.textContent = 'Sending...';
    }

    const eventTypeRaw = selectedText('#qEventTypeChoices .qchoice.selected') || 'Not selected';
    const otherEventText = getValue('qOtherEventText');
    const eventType = eventTypeRaw === 'Something Else' && otherEventText ? `Something Else: ${otherEventText}` : eventTypeRaw;
    const services = selectedList('.qsvc.selected');

    const budget = budgetPersonal
      ? 'Discuss personally'
      : `$${formatMoney(getField('qBudgetSlider')?.value || 5000)}`;
    const eventDate = getValue('qEventDate') || selectedText('#qDateOptions .qdate-option.selected') || 'Not provided';
    const notes = getValue('qContactNotes') || 'None';
    const firstName = getValue('qContactFirstName');
    const contactName = [firstName, getValue('qContactLastName')].filter(Boolean).join(' ');
    const contactGroup = document.getElementById('qContactMethods');
    const preferredContact = (contactGroup?.dataset.selectedContact || Array.from(quiz.querySelectorAll('#qContactMethods .qcmethod.selected'))
      .map((el) => el.dataset.val || el.textContent.trim())
      .filter(Boolean)
      .join(', ')) || 'Not selected';
    const heardFrom = getValue('qHeardSource') || 'Not provided';

    const message = [
      'New event proposal request',
      `Event type: ${eventType}`,
      `Services: ${services.join(', ') || 'Not selected'}`,
      `Date: ${eventDate}`,
      `Location: ${getValue('qEventLocation') || 'Not provided'}`,
      `Guests: ${formatGuests(getField('qGuestSlider')?.value || 10)}`,
      `Budget: ${budget}`,
      `Name: ${contactName}`,
      `Phone: ${getValue('qContactPhone')}`,
      `Email: ${getValue('qContactEmail') || 'Not provided'}`,
      `Company: ${getValue('qContactCompany') || 'Not provided'}`,
      `Heard from: ${heardFrom}`,
      `Preferred contact: ${preferredContact}`,
      `Notes: ${notes}`
    ].join('\n');

    if (waLink) {
      waLink.href = `https://wa.me/19402793660?text=${encodeURIComponent(message)}`;
    }

    const payload = {
      type: 'EventProposal',
      eventType,
      services: services.join(', ') || 'Not selected',
      date: eventDate,
      eventDate,
      event_date: eventDate,
      Data: eventDate,
      location: getValue('qEventLocation') || 'Not provided',
      guests: formatGuests(getField('qGuestSlider')?.value || 10),
      budget,
      name: contactName,
      firstName: getValue('qContactFirstName'),
      lastName: getValue('qContactLastName'),
      phone: getValue('qContactPhone'),
      email: getValue('qContactEmail') || 'Not provided',
      company: getValue('qContactCompany') || 'Not provided',
      heardFrom,
      source: heardFrom,
      preferredContact,
      prefContact: preferredContact,
      preferredContactMethod: preferredContact,
      preferred_contact_method: preferredContact,
      contactMethod: preferredContact,
      contact_method: preferredContact,
      contactVia: preferredContact,
      contact_via: preferredContact,
      contact: preferredContact,
      contactPreference: preferredContact,
      contact_preference: preferredContact,
      preferred_contact: preferredContact,
      ContactVia: preferredContact,
      Contact: preferredContact,
      'Contact via': preferredContact,
      'Contact Via': preferredContact,
      'Preferred contact': preferredContact,
      debugContact: preferredContact,
      notes,
      vision: notes
    };
    lastSubmissionPayload = payload;

    fetch(SCRIPT_URL, {
      method: 'POST',
      mode: 'no-cors',
      keepalive: true,
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    }).catch((e) => {
      console.error('Webhook error:', e);
    });

    setSuccessMessage(firstName, preferredContact);
    setText('qSummaryEvent', eventType);
    setText('qSummaryServices', services.join(', ') || 'Not selected');
    setText('qSummaryDate', eventDate);
    setText('qSummaryLocation', getValue('qEventLocation') || 'Not provided');
    setText('qSummaryGuests', formatGuests(getField('qGuestSlider')?.value || 10));
    setText('qSummaryBudget', budget);

    window.setTimeout(() => {
      stepEls.forEach((el) => el.classList.remove('active'));
      if (successScreen) successScreen.classList.add('active');
      if (progressLabel) progressLabel.textContent = 'Request received';
      if (progressFill) progressFill.style.width = '100%';
      if (benefitsBlock) benefitsBlock.hidden = true;
      if (badgeCompact) badgeCompact.hidden = true;
      if (submitBtn) {
        submitBtn.disabled = false;
        submitBtn.textContent = 'Get My Proposal →';
      }
    }, 350);
  };

  quiz.addEventListener('input', (event) => {
    const target = event.target;
    if (!(target instanceof HTMLElement)) return;
    if (target.matches('#qEventDate')) {
      quiz.querySelectorAll('#qDateOptions .qdate-option').forEach((option) => option.classList.remove('selected'));
      setError(3, false);
    }
    if (target.matches('#qEventLocation')) setError(3, false);
    if (target.matches('#qContactFirstName, #qContactPhone, #qConsentCheck')) setError(4, false);
  });

  const heardSelect = document.getElementById('qHeardSelect');
  if (heardSelect) {
    heardSelect.addEventListener('change', () => {
      if (!heardSelect.value) return;
      fetch(SCRIPT_URL, {
        method: 'POST',
        mode: 'no-cors',
        keepalive: true,
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type: 'EventProposalAttribution',
          heardFrom: heardSelect.value,
          source: heardSelect.value,
          name: lastSubmissionPayload?.name || '',
          phone: lastSubmissionPayload?.phone || '',
          email: lastSubmissionPayload?.email || ''
        })
      }).catch((e) => {
        console.error('Attribution webhook error:', e);
      });
    }, { once: true });
  }

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

// ==========================================================================
// MASONRY LIGHTBOX LOGIC
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  const lightboxLinks = document.querySelectorAll('.masonry-item[data-lightbox]');
  const lightboxModal = document.getElementById('custom-lightbox');

  if (!lightboxModal || lightboxLinks.length === 0) return;

  const lightboxImage = document.getElementById('lightbox-image');
  const lightboxCloseBtn = document.querySelector('.lightbox-close');
  const lightboxOverlay = document.querySelector('.lightbox-overlay');

  const openLightbox = (e) => {
    e.preventDefault();
    const largeImageUrl = e.currentTarget.getAttribute('href');
    lightboxImage.setAttribute('src', largeImageUrl);
    lightboxModal.classList.add('is-active');
    document.body.style.overflow = 'hidden';
  };

  const closeLightbox = () => {
    lightboxModal.classList.remove('is-active');
    document.body.style.overflow = '';
    setTimeout(() => {
      lightboxImage.setAttribute('src', '');
    }, 400);
  };

  lightboxLinks.forEach(link => {
    link.addEventListener('click', openLightbox);
  });

  lightboxCloseBtn.addEventListener('click', closeLightbox);
  lightboxOverlay.addEventListener('click', closeLightbox);

  document.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && lightboxModal.classList.contains('is-active')) {
      closeLightbox();
    }
  });
});

// ==========================================================================
// MOBILE INSTAGRAM FEED ROTATION
// ==========================================================================
document.addEventListener('DOMContentLoaded', () => {
  const grid = document.querySelector('#portfolio .masonry-grid');
  if (!grid) return;

  const links = Array.from(grid.querySelectorAll('.masonry-item[data-lightbox]'));
  if (links.length <= 4) return;

  const photos = links.map((link) => {
    const image = link.querySelector('img');
    return {
      href: link.getAttribute('href'),
      src: image?.getAttribute('src') || link.getAttribute('href'),
      alt: image?.getAttribute('alt') || 'GUSAR event photo'
    };
  });

  const visibleLinks = links.slice(0, 4);
  const mobileQuery = window.matchMedia('(max-width: 768px)');
  let rotationTimer = null;
  let rotationStep = 0;

  const setPhoto = (link, photo) => {
    const image = link.querySelector('img');
    link.setAttribute('href', photo.href);
    if (image) {
      image.setAttribute('src', photo.src);
      image.setAttribute('alt', photo.alt);
    }
  };

  const resetPhotos = () => {
    photos.forEach((photo, index) => {
      if (links[index]) setPhoto(links[index], photo);
    });
  };

  const stopRotation = () => {
    if (rotationTimer) {
      window.clearInterval(rotationTimer);
      rotationTimer = null;
    }
    grid.classList.remove('is-mobile-rotating');
    visibleLinks.forEach((link) => link.classList.remove('is-swapping'));
    resetPhotos();
    rotationStep = 0;
  };

  const startRotation = () => {
    if (rotationTimer) return;

    grid.classList.add('is-mobile-rotating');
    visibleLinks.forEach((link, index) => setPhoto(link, photos[index]));

    rotationTimer = window.setInterval(() => {
      const slotIndex = rotationStep % visibleLinks.length;
      const photoIndex = (rotationStep + visibleLinks.length) % photos.length;
      const slot = visibleLinks[slotIndex];

      slot.classList.add('is-swapping');
      window.setTimeout(() => {
        setPhoto(slot, photos[photoIndex]);
        window.requestAnimationFrame(() => {
          window.setTimeout(() => {
            slot.classList.remove('is-swapping');
          }, 40);
        });
      }, 780);

      rotationStep = (rotationStep + 1) % photos.length;
    }, 1600);
  };

  const syncRotation = () => {
    if (mobileQuery.matches) {
      startRotation();
    } else {
      stopRotation();
    }
  };

  syncRotation();

  if (typeof mobileQuery.addEventListener === 'function') {
    mobileQuery.addEventListener('change', syncRotation);
  } else if (typeof mobileQuery.addListener === 'function') {
    mobileQuery.addListener(syncRotation);
  }
});
