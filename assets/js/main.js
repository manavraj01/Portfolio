(() => {
  'use strict';

  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;

  /* ---------------- footer year ---------------- */
  const yearEl = document.getElementById('year');
  if (yearEl) yearEl.textContent = new Date().getFullYear();

  /* ---------------- nav scrolled state ---------------- */
  const nav = document.getElementById('siteNav');
  const onScroll = () => {
    if (window.scrollY > 24) nav.classList.add('scrolled');
    else nav.classList.remove('scrolled');
  };
  onScroll();
  window.addEventListener('scroll', onScroll, { passive: true });

  /* ---------------- mobile nav toggle ---------------- */
  const navToggle = document.getElementById('navToggle');
  const navLinksEl = document.getElementById('navLinks');
  navToggle.addEventListener('click', () => {
    navToggle.classList.toggle('open');
    navLinksEl.classList.toggle('mobile-open');
  });
  navLinksEl.querySelectorAll('a').forEach(a => {
    a.addEventListener('click', () => {
      navToggle.classList.remove('open');
      navLinksEl.classList.remove('mobile-open');
    });
  });

  /* ---------------- scroll spy ---------------- */
  const sections = [...document.querySelectorAll('main section[id]')];
  const navLinkMap = new Map();
  document.querySelectorAll('.nav-link').forEach(link => {
    navLinkMap.set(link.getAttribute('href').slice(1), link);
  });

  const spyObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      const link = navLinkMap.get(entry.target.id);
      if (!link) return;
      if (entry.isIntersecting) {
        navLinkMap.forEach(l => l.classList.remove('active'));
        link.classList.add('active');
      }
    });
  }, { rootMargin: '-45% 0px -50% 0px', threshold: 0 });

  sections.forEach(s => spyObserver.observe(s));

  /* ---------------- reveal on scroll ---------------- */
  const revealEls = document.querySelectorAll('.reveal, .card-visual');
  const revealObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (entry.isIntersecting) {
        entry.target.classList.add('in-view');
        revealObserver.unobserve(entry.target);
      }
    });
  }, { threshold: 0.15 });
  revealEls.forEach(el => revealObserver.observe(el));

  /* ---------------- project filter ---------------- */
  const filterBtns = document.querySelectorAll('.filter-btn');
  const projectCards = document.querySelectorAll('.project-card');

  filterBtns.forEach(btn => {
    btn.addEventListener('click', () => {
      filterBtns.forEach(b => b.classList.remove('active'));
      btn.classList.add('active');
      const cat = btn.dataset.filter;

      projectCards.forEach(card => {
        const match = cat === 'all' || card.dataset.category === cat;
        if (match) {
          card.style.display = '';
          requestAnimationFrame(() => card.classList.add('show'));
        } else {
          card.classList.remove('show');
          setTimeout(() => {
            if (!card.classList.contains('show')) card.style.display = 'none';
          }, 280);
        }
      });
    });
  });

  /* ---------------- architecture modal ---------------- */
  const archModal = document.getElementById('archModal');
  const archModalTitle = document.getElementById('archModalTitle');
  const archModalTag = document.getElementById('archModalTag');
  const archModalBody = document.getElementById('archModalBody');
  const catLabels = { backend: 'Backend & Enterprise', cloud: 'Cloud & Systems', ml: 'Machine Learning', genai: 'Generative AI' };
  let lastFocused = null;

  function openArch(key, title, category) {
    const tpl = document.getElementById('tpl-arch-' + key);
    if (!tpl || !archModal) return;
    archModalBody.innerHTML = '';
    archModalBody.appendChild(tpl.content.cloneNode(true));
    archModalTitle.textContent = title;
    archModalTag.textContent = catLabels[category] || 'Architecture';
    archModalTag.className = 'modal-eyebrow cat-' + category;
    lastFocused = document.activeElement;
    archModal.classList.add('open');
    document.body.style.overflow = 'hidden';
    archModal.querySelector('.modal-close').focus();
  }

  function closeArch() {
    if (!archModal) return;
    archModal.classList.remove('open');
    document.body.style.overflow = '';
    if (lastFocused) lastFocused.focus();
  }

  document.querySelectorAll('[data-arch]').forEach(btn => {
    btn.addEventListener('click', () => {
      const card = btn.closest('.project-card');
      const title = card ? card.querySelector('.project-title').textContent : '';
      const category = card ? card.dataset.category : '';
      openArch(btn.dataset.arch, title, category);
    });
  });

  if (archModal) {
    archModal.addEventListener('click', (e) => { if (e.target === archModal) closeArch(); });
    archModal.querySelector('.modal-close').addEventListener('click', closeArch);
    document.addEventListener('keydown', (e) => { if (e.key === 'Escape' && archModal.classList.contains('open')) closeArch(); });
  }

  /* ---------------- hero role rotator ---------------- */
  const roles = [
    'scalable backend systems',
    'production ML pipelines',
    'cloud & systems automation',
    'cross-platform mobile apps',
    'generative AI applications'
  ];
  const rotatorEl = document.getElementById('roleRotator');

  if (rotatorEl && !reduceMotion) {
    let roleIndex = 0;
    let charIndex = roles[0].length;
    let deleting = false;

    const tick = () => {
      const current = roles[roleIndex];
      if (!deleting) {
        charIndex++;
        if (charIndex >= current.length) {
          deleting = true;
          setTimeout(tick, 1800);
          return;
        }
      } else {
        charIndex--;
        if (charIndex <= 0) {
          deleting = false;
          roleIndex = (roleIndex + 1) % roles.length;
          setTimeout(tick, 400);
          return;
        }
      }
      rotatorEl.textContent = current.slice(0, charIndex);
      setTimeout(tick, deleting ? 28 : 45);
    };

    setTimeout(tick, 1600);
  }

  /* ---------------- stat count-up ---------------- */
  const statEls = document.querySelectorAll('.stat-num');
  const statObserver = new IntersectionObserver((entries) => {
    entries.forEach(entry => {
      if (!entry.isIntersecting) return;
      statObserver.unobserve(entry.target);
      const target = parseInt(entry.target.dataset.count, 10);
      if (reduceMotion) { entry.target.textContent = target; return; }
      const duration = 1200;
      const start = performance.now();
      const step = (now) => {
        const p = Math.min((now - start) / duration, 1);
        const eased = 1 - Math.pow(1 - p, 3);
        entry.target.textContent = Math.round(eased * target);
        if (p < 1) requestAnimationFrame(step);
      };
      requestAnimationFrame(step);
    });
  }, { threshold: 0.4 });
  statEls.forEach(el => statObserver.observe(el));

  /* ---------------- hero constellation canvas ---------------- */
  const canvas = document.getElementById('constellation');
  if (canvas && !reduceMotion) {
    const ctx = canvas.getContext('2d');
    let w, h, nodes;
    const NODE_COUNT = 46;
    const LINK_DIST = 130;

    function resize() {
      w = canvas.width = canvas.offsetWidth * devicePixelRatio;
      h = canvas.height = canvas.offsetHeight * devicePixelRatio;
    }

    function makeNodes() {
      nodes = Array.from({ length: NODE_COUNT }, () => ({
        x: Math.random() * w,
        y: Math.random() * h,
        vx: (Math.random() - 0.5) * 0.25 * devicePixelRatio,
        vy: (Math.random() - 0.5) * 0.25 * devicePixelRatio,
        r: (Math.random() * 1.4 + 0.6) * devicePixelRatio
      }));
    }

    resize();
    makeNodes();
    window.addEventListener('resize', () => { resize(); makeNodes(); });

    function frame() {
      ctx.clearRect(0, 0, w, h);
      for (const n of nodes) {
        n.x += n.vx; n.y += n.vy;
        if (n.x < 0 || n.x > w) n.vx *= -1;
        if (n.y < 0 || n.y > h) n.vy *= -1;
      }
      for (let i = 0; i < nodes.length; i++) {
        for (let j = i + 1; j < nodes.length; j++) {
          const a = nodes[i], b = nodes[j];
          const dx = a.x - b.x, dy = a.y - b.y;
          const dist = Math.sqrt(dx * dx + dy * dy);
          if (dist < LINK_DIST * devicePixelRatio) {
            const alpha = (1 - dist / (LINK_DIST * devicePixelRatio)) * 0.35;
            ctx.strokeStyle = `rgba(91,140,255,${alpha})`;
            ctx.lineWidth = devicePixelRatio;
            ctx.beginPath();
            ctx.moveTo(a.x, a.y);
            ctx.lineTo(b.x, b.y);
            ctx.stroke();
          }
        }
      }
      for (const n of nodes) {
        ctx.beginPath();
        ctx.arc(n.x, n.y, n.r, 0, Math.PI * 2);
        ctx.fillStyle = 'rgba(139,107,255,0.55)';
        ctx.fill();
      }
      requestAnimationFrame(frame);
    }
    requestAnimationFrame(frame);
  }
})();
