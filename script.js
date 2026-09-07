(() => {
  'use strict';

  const state = { config: null, category: 'All', query: '', expanded: false };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const isTouch = window.matchMedia('(hover: none)').matches;
  const $ = (selector, root = document) => root.querySelector(selector);
  const $$ = (selector, root = document) => [...root.querySelectorAll(selector)];
  const create = (tag, className, text) => {
    const element = document.createElement(tag);
    if (className) element.className = className;
    if (text !== undefined) element.textContent = text;
    return element;
  };

  function safeStorage(action, key, value) {
    try { return action === 'get' ? localStorage.getItem(key) : localStorage.setItem(key, value); }
    catch { return null; }
  }

  /* --------------------------------- Theme ------------------------------------ */
  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    const meta = $('meta[name="theme-color"]');
    if (meta) meta.content = theme === 'dark' ? '#08090b' : '#f3f4f7';
    const button = $('#themeToggle');
    if (!button) return;
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    button.setAttribute('aria-label', `Switch to ${nextTheme} theme`);
    button.title = `Switch to ${nextTheme} theme`;
  }

  function initializeTheme() {
    const saved = safeStorage('get', 'portfolio-theme');
    const preferred = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    setTheme(saved === 'light' || saved === 'dark' ? saved : preferred);
    const themeToggle = $('#themeToggle');
    if (!themeToggle) return;
    themeToggle.addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      setTheme(next);
      safeStorage('set', 'portfolio-theme', next);
    });
  }

  /* ----------------------------- Image fallbacks ---------------------------- */
  function initializeImageFallbacks() {
    $$('img[data-avatar]').forEach(image => {
      const showFallback = () => image.classList.add('image-error');
      image.addEventListener('error', showFallback, { once: true });
      if (image.complete && image.naturalWidth === 0) showFallback();
    });
  }

  /* -------------------------------- Navigation ------------------------------- */
  function initializeNavigation() {
    const nav = $('#siteNav');
    const menuButton = $('#menuToggle');
    const sheet = $('#navSheet');

    const setScrolled = () => nav.classList.toggle('is-scrolled', window.scrollY > 12);
    setScrolled();
    window.addEventListener('scroll', setScrolled, { passive: true });

    const openMenu = () => {
      sheet.classList.add('open');
      sheet.setAttribute('aria-hidden', 'false');
      menuButton.setAttribute('aria-expanded', 'true');
      menuButton.setAttribute('aria-label', 'Close navigation');
      document.body.style.overflow = 'hidden';
    };
    const closeMenu = () => {
      sheet.classList.remove('open');
      sheet.setAttribute('aria-hidden', 'true');
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open navigation');
      document.body.style.overflow = '';
    };
    menuButton.addEventListener('click', () => {
      if (sheet.classList.contains('open')) closeMenu(); else openMenu();
    });
    sheet.addEventListener('click', event => { if (event.target.matches('a')) closeMenu(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });

    if ('IntersectionObserver' in window) {
      const links = [...nav.querySelectorAll('.nav-links a')];
      const sections = links.map(link => $(link.getAttribute('href'))).filter(Boolean);
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (!entry.isIntersecting) return;
          links.forEach(link => {
            const active = link.getAttribute('href') === `#${entry.target.id}`;
            link.classList.toggle('active', active);
            if (active) link.setAttribute('aria-current', 'location');
            else link.removeAttribute('aria-current');
          });
        });
      }, { rootMargin: '-25% 0px -65%' });
      sections.forEach(section => observer.observe(section));
    }
  }

  /* ------------------------------ Back to top -------------------------------- */
  function initializeBackToTop() {
    const button = $('#backTop');
    if (!button) return;
    const update = () => button.style.opacity = window.scrollY > 600 ? '1' : '.4';
    update();
    window.addEventListener('scroll', update, { passive: true });
  }

  /* ------------------------------ Cursor glow --------------------------------- */
  function initializeCursorGlow() {
    if (isTouch || reduceMotion) return;
    const glow = $('#cursorGlow');
    if (!glow) return;
    let raf = null;
    let x = 0, y = 0;
    window.addEventListener('pointermove', event => {
      x = event.clientX; y = event.clientY;
      glow.classList.add('is-active');
      if (raf) return;
      raf = requestAnimationFrame(() => {
        glow.style.transform = `translate3d(${x - 240}px, ${y - 240}px, 0)`;
        raf = null;
      });
    });
    document.addEventListener('pointerleave', () => glow.classList.remove('is-active'));
  }

  /* ------------------------------ Magnetic buttons ---------------------------- */
  function initializeMagnetic() {
    if (isTouch || reduceMotion) return;
    $$('[data-magnetic]').forEach(element => {
      const strength = 14;
      element.addEventListener('pointermove', event => {
        const rect = element.getBoundingClientRect();
        const relX = event.clientX - rect.left - rect.width / 2;
        const relY = event.clientY - rect.top - rect.height / 2;
        element.style.transform = `translate(${(relX / rect.width) * strength}px, ${(relY / rect.height) * strength}px)`;
      });
      element.addEventListener('pointerleave', () => { element.style.transform = ''; });
    });
  }

  /* ------------------------------ Portrait tilt -------------------------------- */
  function initializePortraitTilt() {
    if (isTouch || reduceMotion) return;
    const stage = $('.portrait-stage');
    const card = $('#portraitCard');
    if (!stage || !card) return;
    stage.addEventListener('pointermove', event => {
      const rect = stage.getBoundingClientRect();
      const relX = (event.clientX - rect.left) / rect.width - 0.5;
      const relY = (event.clientY - rect.top) / rect.height - 0.5;
      card.style.transform = `perspective(1000px) rotateY(${relX * 8}deg) rotateX(${relY * -8}deg) scale(1.015)`;
    });
    stage.addEventListener('pointerleave', () => { card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)'; });
  }

  /* ------------------------------- Counters ------------------------------------ */
  function animateCount(element) {
    const target = Number(element.dataset.count);
    if (element.dataset.static || Number.isNaN(target)) { element.textContent = element.dataset.static || target; return; }
    const suffix = element.dataset.suffix || '';
    if (reduceMotion) { element.textContent = target + suffix; return; }
    const duration = 1200;
    const start = performance.now();
    const step = now => {
      const progress = Math.min((now - start) / duration, 1);
      const eased = 1 - Math.pow(1 - progress, 3);
      element.textContent = Math.round(target * eased) + suffix;
      if (progress < 1) requestAnimationFrame(step);
    };
    requestAnimationFrame(step);
  }

  function initializeCounters() {
    const counters = $$('[data-count]');
    if (!counters.length || !('IntersectionObserver' in window)) { counters.forEach(animateCount); return; }
    const observer = new IntersectionObserver((entries, obs) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { animateCount(entry.target); obs.unobserve(entry.target); }
      });
    }, { threshold: 0.6 });
    counters.forEach(counter => observer.observe(counter));
  }

  /* -------------------------------- Projects ------------------------------------ */
  function buildMediaElement(project) {
    if (project.image) {
      const image = create('img');
      image.src = project.image;
      image.alt = '';
      image.loading = 'lazy';
      image.width = 960;
      image.height = 600;
      return image;
    }
    const empty = create('div', 'project-media-empty');
    empty.style.setProperty('--tint', `${project.color}30`);
    const glyph = create('span', '', '✦');
    glyph.setAttribute('aria-hidden', 'true');
    empty.append(glyph);
    return empty;
  }

  function buildProjectCard(project, index) {
    const article = create('article', 'project-card reveal');
    if (project.featured) article.classList.add('is-featured');
    article.style.setProperty('--tint', `${project.color}26`);
    article.setAttribute('role', 'button');
    article.setAttribute('tabindex', '0');
    article.setAttribute('aria-label', `View details for ${project.title}`);
    article.dataset.index = String(index);
    article.dataset.hasImage = String(Boolean(project.image));

    const media = create('div', 'project-media');
    media.dataset.hasImage = String(Boolean(project.image));
    media.append(buildMediaElement(project));

    const body = create('div', 'project-body');
    const topRow = create('div', 'project-top-row');
    topRow.append(create('span', 'project-number', `${String(index + 1).padStart(2, '0')} · ${project.category} · ${project.updated}`));
    body.append(topRow, create('h3', '', project.title), create('p', 'project-desc', project.description));

    const bottom = create('div', 'project-bottom');
    const tags = create('div', 'tags');
    project.technologies.forEach(technology => tags.append(create('span', 'tag', technology)));
    const cta = create('span', 'project-cta', 'View project ');
    const ctaArrow = create('span', '', '→');
    ctaArrow.setAttribute('aria-hidden', 'true');
    cta.append(ctaArrow);
    bottom.append(tags, cta);
    body.append(bottom);

    article.append(media, body);

    const openHandler = () => openProjectModal(project);
    article.addEventListener('click', openHandler);
    article.addEventListener('keydown', event => {
      if (event.key === 'Enter' || event.key === ' ') { event.preventDefault(); openHandler(); }
    });

    return article;
  }

  function renderProjects() {
    const grid = $('#projectsGrid');
    const allProjects = state.config.projects;
    const normalizedQuery = state.query.trim().toLowerCase();
    const matching = allProjects.filter(project => {
      const categoryMatch = state.category === 'All' || project.category === state.category;
      const searchable = `${project.title} ${project.description} ${project.category} ${project.technologies.join(' ')}`.toLowerCase();
      return categoryMatch && searchable.includes(normalizedQuery);
    });
    const limited = !state.expanded && state.category === 'All' && !normalizedQuery;
    const visible = limited ? matching.slice(0, 6) : matching;
    grid.replaceChildren();

    visible.forEach((project, index) => grid.append(buildProjectCard(project, index)));

    $('#emptyProjects').hidden = matching.length !== 0;
    const showMore = $('#showMore');
    const canExpand = allProjects.length > 6 && state.category === 'All' && !normalizedQuery;
    showMore.hidden = !canExpand;
    showMore.textContent = state.expanded ? 'Show fewer projects' : `Show all ${allProjects.length} projects`;
    observeReveals(grid);
  }

  function moveFilterIndicator(button) {
    const indicator = $('.filter-indicator');
    const filters = $('#projectFilters');
    if (!indicator || !button) return;
    const filterRect = filters.getBoundingClientRect();
    const rect = button.getBoundingClientRect();
    indicator.style.width = `${rect.width}px`;
    indicator.style.transform = `translateX(${rect.left - filterRect.left}px)`;
  }

  function initializeProjectControls() {
    const categories = ['All', ...new Set(state.config.projects.map(project => project.category))];
    const filters = $('#projectFilters');
    const indicator = create('span', 'filter-indicator');
    filters.append(indicator);
    categories.forEach(category => {
      const button = create('button', 'filter-button', category);
      button.type = 'button';
      if (category === state.category) button.classList.add('is-active');
      button.addEventListener('click', () => {
        state.category = category;
        state.expanded = category !== 'All';
        [...filters.querySelectorAll('.filter-button')].forEach(item => item.classList.toggle('is-active', item === button));
        moveFilterIndicator(button);
        renderProjects();
      });
      filters.append(button);
    });
    requestAnimationFrame(() => moveFilterIndicator($('.filter-button.is-active')));
    window.addEventListener('resize', () => moveFilterIndicator($('.filter-button.is-active')));

    $('#projectSearch').addEventListener('input', event => { state.query = event.target.value; renderProjects(); });
    $('#showMore').addEventListener('click', () => {
      state.expanded = !state.expanded;
      renderProjects();
      if (!state.expanded) $('#work').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    });
  }

  /* --------------------------------- Modal ---------------------------------------- */
  function openProjectModal(project) {
    const backdrop = $('#modalBackdrop');
    $('#modalMeta').textContent = `${project.category} · ${project.updated}`;
    $('#modalTitle').textContent = project.title;
    $('#modalDescription').textContent = project.description;
    const media = $('#modalMedia');
    media.replaceChildren(buildMediaElement(project));

    const tags = $('#modalTags');
    tags.replaceChildren();
    project.technologies.forEach(technology => tags.append(create('span', 'tag', technology)));

    const links = $('#modalLinks');
    links.replaceChildren();
    if (project.demo) {
      const demoLink = create('a', 'button button-primary', 'Live demo ↗');
      demoLink.href = project.demo; demoLink.target = '_blank'; demoLink.rel = 'noopener noreferrer';
      links.append(demoLink);
    }
    const sourceLink = create('a', 'button button-secondary', 'Source ↗');
    sourceLink.href = project.source; sourceLink.target = '_blank'; sourceLink.rel = 'noopener noreferrer';
    links.append(sourceLink);

    backdrop.hidden = false;
    requestAnimationFrame(() => backdrop.classList.add('open'));
    document.body.style.overflow = 'hidden';
    state.lastFocused = document.activeElement;
    $('#modalClose').focus();
  }

  function closeProjectModal() {
    const backdrop = $('#modalBackdrop');
    backdrop.classList.remove('open');
    document.body.style.overflow = '';
    setTimeout(() => { backdrop.hidden = true; }, 350);
    if (state.lastFocused) state.lastFocused.focus();
  }

  function initializeModal() {
    $('#modalClose').addEventListener('click', closeProjectModal);
    $('#modalBackdrop').addEventListener('click', event => { if (event.target === $('#modalBackdrop')) closeProjectModal(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape' && !$('#modalBackdrop').hidden) closeProjectModal(); });
  }

  /* -------------------------------- GitHub -------------------------------------- */
  function renderGitHub() {
    const container = $('#githubRepos');
    state.config.github.recentRepositories.forEach(repository => {
      const card = create('article', 'github-repo-card glass');
      const header = create('div', 'repo-header');
      const identity = create('div');
      identity.append(create('span', 'repo-kicker', `${repository.language} · Updated ${repository.updated}`), create('h3', '', repository.name));
      const repositoryLink = create('a', 'repo-source-link', 'Repository ↗');
      repositoryLink.href = repository.url;
      repositoryLink.target = '_blank';
      repositoryLink.rel = 'noopener noreferrer';
      repositoryLink.setAttribute('aria-label', `View ${repository.name} on GitHub`);
      header.append(identity, repositoryLink);
      card.append(header, create('p', '', repository.description));
      if (repository.demo) {
        const demo = create('a', 'repo-demo-link', 'Open live demo →');
        demo.href = repository.demo;
        demo.target = '_blank';
        demo.rel = 'noopener noreferrer';
        card.append(demo);
      }
      container.append(card);
    });
  }

  /* ------------------------------- Experience ------------------------------------ */
  function renderExperience() {
    const container = $('#experienceList');
    state.config.experience.forEach((job, index) => {
      const item = create('article', 'timeline-item reveal');
      if (index === 0) item.classList.add('is-active');
      const period = create('div', 'timeline-period', job.period);
      const role = create('div', 'timeline-role');
      const company = job.location ? `${job.company} · ${job.location}` : job.company;
      role.append(create('h3', '', job.role), create('p', '', company));
      const desc = create('div');
      desc.className = 'timeline-description-wrap';
      desc.append(create('p', 'timeline-description', job.summary));
      if (Array.isArray(job.focus) && job.focus.length) {
        const focusRow = create('div', 'timeline-focus');
        job.focus.forEach(tech => focusRow.append(create('span', 'tag', tech)));
        desc.append(focusRow);
      }
      item.append(period, role, desc);
      container.append(item);
    });

    if ('IntersectionObserver' in window) {
      const items = $$('.timeline-item', container);
      const observer = new IntersectionObserver(entries => {
        entries.forEach(entry => {
          if (entry.isIntersecting) items.forEach(item => item.classList.toggle('is-active', item === entry.target));
        });
      }, { threshold: 0.5, rootMargin: '-20% 0px -20%' });
      items.forEach(item => observer.observe(item));
    }
  }

  /* ---------------------------------- About --------------------------------------- */
  function renderAbout() {
    const skillCloud = $('#skillCloud');
    state.config.profile.skills.forEach(skill => {
      const pill = create('span', 'skill-pill');
      pill.tabIndex = 0;
      pill.textContent = skill.name;
      if (skill.note) {
        const note = create('span', 'skill-note', skill.note);
        pill.append(note);
      }
      skillCloud.append(pill);
    });
    const focusGrid = $('#focusGrid');
    state.config.focus.forEach(item => {
      const card = create('article', 'focus-card reveal');
      card.append(create('span', 'focus-icon', item.icon), create('h3', '', item.title), create('p', '', item.text));
      focusGrid.append(card);
    });
  }

  /* --------------------------------- Reveals --------------------------------------- */
  function observeReveals(root = document) {
    const items = [...root.querySelectorAll('.reveal:not(.is-visible)')];
    if (reduceMotion || !('IntersectionObserver' in window)) { items.forEach(item => item.classList.add('is-visible')); return; }
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); currentObserver.unobserve(entry.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -40px' });
    items.forEach((item, index) => { item.style.transitionDelay = `${Math.min(index % 4, 3) * 80}ms`; observer.observe(item); });
  }

  /* ------------------------------- GitHub live count --------------------------------- */
  async function refreshGitHubCount(username, fallback) {
    const counters = [$('#repoCount'), $('#statRepos')].filter(Boolean);
    const updateCounters = value => counters.forEach(counter => {
      counter.dataset.count = String(value);
      const suffix = counter.dataset.suffix || '';
      counter.textContent = value + suffix;
    });
    updateCounters(fallback);
    const cacheKey = `github-profile-${username}`;
    try {
      const cached = JSON.parse(safeStorage('get', cacheKey) || 'null');
      if (cached && Date.now() - cached.savedAt < 3_600_000) { updateCounters(cached.publicRepos); return; }
      const controller = new AbortController();
      const timeout = setTimeout(() => controller.abort(), 3500);
      const response = await fetch(`https://api.github.com/users/${encodeURIComponent(username)}`, { signal: controller.signal, headers: { Accept: 'application/vnd.github+json' } });
      clearTimeout(timeout);
      if (!response.ok) return;
      const profile = await response.json();
      if (Number.isInteger(profile.public_repos)) {
        updateCounters(profile.public_repos);
        safeStorage('set', cacheKey, JSON.stringify({ publicRepos: profile.public_repos, savedAt: Date.now() }));
      }
    } catch { /* Static fallback keeps the portfolio useful offline and under API rate limits. */ }
  }

  /* ----------------------------------- Init ------------------------------------------ */
  async function initialize() {
    initializeTheme();
    initializeImageFallbacks();
    initializeNavigation();
    initializeBackToTop();
    initializeCursorGlow();
    initializeMagnetic();
    initializePortraitTilt();
    initializeModal();
    $('#year').textContent = new Date().getFullYear();
    try {
      const response = await fetch('config.json');
      if (!response.ok) throw new Error(`Configuration request failed: ${response.status}`);
      state.config = await response.json();
      initializeProjectControls();
      renderProjects();
      renderGitHub();
      renderExperience();
      renderAbout();
      refreshGitHubCount(state.config.profile.github, state.config.profile.publicRepos);
    } catch (error) {
      console.error(error);
      const errorMessage = create('p', 'empty-state glass', 'Project details could not be loaded. Please visit GitHub using the link above.');
      $('#projectsGrid').replaceWith(errorMessage);
      $('#showMore').hidden = true;
    }
    observeReveals();
    initializeCounters();
  }

  document.addEventListener('DOMContentLoaded', initialize);
})();
