(() => {
  'use strict';

  const state = {
    config: null,
    category: 'All',
    query: '',
    expanded: false,
    lastFocused: null,
    modalTimer: null,
    menuOpen: false,
    initialized: false,
    tooltipResizeBound: false,
    tooltipResizeTimer: null
  };
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
    if (meta) meta.content = theme === 'dark' ? '#080a0e' : '#f2f4f7';
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
    const indicator = $('#navIndicator');
    const progress = $('#navProgress');
    const links = [...nav.querySelectorAll('.nav-links a')];
    const sections = links.map(link => $(link.getAttribute('href'))).filter(Boolean);
    let activeLink = null;

    const moveIndicator = link => {
      if (!indicator || !link || link.offsetParent === null) return;
      indicator.style.width = `${link.offsetWidth}px`;
      indicator.style.transform = `translateX(${link.offsetLeft}px)`;
      indicator.classList.add('is-visible');
    };

    const activateLink = link => {
      activeLink = link || null;
      links.forEach(item => {
        const active = item === activeLink;
        item.classList.toggle('active', active);
        if (active) item.setAttribute('aria-current', 'location');
        else item.removeAttribute('aria-current');
      });
      if (activeLink) moveIndicator(activeLink);
      else if (indicator) indicator.classList.remove('is-visible');
    };

    const updateScrollState = () => {
      nav.classList.toggle('is-scrolled', window.scrollY > 18);
      const scrollable = Math.max(document.documentElement.scrollHeight - window.innerHeight, 1);
      const ratio = Math.min(Math.max(window.scrollY / scrollable, 0), 1);
      if (progress) progress.style.transform = `scaleX(${ratio})`;

      const marker = window.scrollY + window.innerHeight * .38;
      let nextLink = null;
      sections.forEach((section, index) => {
        if (section.offsetTop <= marker) nextLink = links[index];
      });
      if (nextLink !== activeLink) activateLink(nextLink);
    };

    updateScrollState();
    window.addEventListener('scroll', updateScrollState, { passive: true });
    window.addEventListener('resize', () => {
      updateScrollState();
      if (activeLink) moveIndicator(activeLink);
    });

    const openMenu = () => {
      state.menuOpen = true;
      state.lastFocused = document.activeElement;
      sheet.inert = false;
      sheet.classList.add('open');
      sheet.setAttribute('aria-hidden', 'false');
      menuButton.setAttribute('aria-expanded', 'true');
      menuButton.setAttribute('aria-label', 'Close navigation');
      $('main').inert = true;
      $('.footer').inert = true;
      document.body.style.overflow = 'hidden';
    };
    const closeMenu = ({ restoreFocus = false } = {}) => {
      if (!state.menuOpen) return;
      state.menuOpen = false;
      sheet.classList.remove('open');
      sheet.setAttribute('aria-hidden', 'true');
      sheet.inert = true;
      menuButton.setAttribute('aria-expanded', 'false');
      menuButton.setAttribute('aria-label', 'Open navigation');
      $('main').inert = false;
      $('.footer').inert = false;
      document.body.style.overflow = '';
      if (restoreFocus) menuButton.focus();
    };
    menuButton.addEventListener('click', () => {
      if (state.menuOpen) closeMenu(); else openMenu();
    });
    sheet.addEventListener('click', event => { if (event.target.closest('a')) closeMenu({ restoreFocus: true }); });
    document.addEventListener('keydown', event => {
      if (!state.menuOpen) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        closeMenu({ restoreFocus: true });
        return;
      }
      if (event.key !== 'Tab') return;
      const menuFocusables = [menuButton, ...sheet.querySelectorAll('a[href]')];
      const first = menuFocusables[0];
      const last = menuFocusables[menuFocusables.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });

    window.addEventListener('load', updateScrollState, { once: true });
    if ('ResizeObserver' in window) {
      const layoutObserver = new ResizeObserver(updateScrollState);
      layoutObserver.observe($('#main'));
    }
  }

  /* ------------------------------ Back to top -------------------------------- */
  function initializeBackToTop() {
    const button = $('#backTop');
    if (!button) return;
    const update = () => button.classList.toggle('is-emphasized', window.scrollY > 600);
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
        glow.style.transform = `translate3d(${x}px, ${y}px, 0)`;
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
      card.style.setProperty('--sheen-x', `${(relX + .5) * 100}%`);
      card.style.setProperty('--sheen-y', `${(relY + .5) * 100}%`);
      card.style.transform = `perspective(1000px) rotateY(${relX * 6}deg) rotateX(${relY * -6}deg) scale(1.012)`;
    });
    stage.addEventListener('pointerleave', () => {
      card.style.transform = 'perspective(1000px) rotateX(0) rotateY(0) scale(1)';
      card.style.setProperty('--sheen-x', '50%');
      card.style.setProperty('--sheen-y', '30%');
    });
  }

  /* ------------------------- Pointer-aware surface light ------------------------- */
  function initializeSurfaceLighting() {
    if (isTouch || reduceMotion) return;
    let frame = null;
    let activeSurface = null;
    let pointerX = 0;
    let pointerY = 0;
    document.addEventListener('pointermove', event => {
      const surface = event.target.closest('.project-card');
      if (!surface) return;
      activeSurface = surface;
      pointerX = event.clientX;
      pointerY = event.clientY;
      if (frame) return;
      frame = requestAnimationFrame(() => {
        const rect = activeSurface.getBoundingClientRect();
        activeSurface.style.setProperty('--pointer-x', `${pointerX - rect.left}px`);
        activeSurface.style.setProperty('--pointer-y', `${pointerY - rect.top}px`);
        frame = null;
      });
    }, { passive: true });
  }

  /* ------------------------------- Counters ------------------------------------ */
  function animateCount(element) {
    const target = Number(element.dataset.count);
    if (element.dataset.static || Number.isNaN(target)) { element.textContent = element.dataset.static || target; return; }
    const suffix = element.dataset.suffix || '';
    if (reduceMotion || element.hasAttribute('data-immediate')) { element.textContent = target + suffix; return; }
    const duration = 900;
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
      image.decoding = 'async';
      image.width = 960;
      image.height = 600;
      const markLoaded = () => image.classList.add('is-loaded');
      image.addEventListener('load', markLoaded, { once: true });
      if (image.complete && image.naturalWidth > 0) markLoaded();
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

    const action = create('button', 'project-card-action');
    action.type = 'button';
    action.setAttribute('aria-label', `View details for ${project.title}`);
    action.addEventListener('click', () => openProjectModal(project));
    article.append(media, body, action);

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
    grid.classList.remove('is-loading');
    grid.setAttribute('aria-busy', 'false');

    visible.forEach((project, index) => grid.append(buildProjectCard(project, index)));

    const count = $('#projectCount');
    if (count) {
      const projectWord = matching.length === 1 ? 'project' : 'projects';
      count.textContent = visible.length < matching.length
        ? `${visible.length} of ${matching.length} ${projectWord}`
        : `${matching.length} ${projectWord}`;
    }
    $('#emptyProjects').hidden = matching.length !== 0;
    const showMore = $('#showMore');
    const canExpand = allProjects.length > 6 && state.category === 'All' && !normalizedQuery;
    showMore.hidden = !canExpand;
    showMore.textContent = state.expanded ? 'Show fewer projects' : `Show all ${allProjects.length} projects`;
    observeReveals(grid);
  }

  function moveFilterIndicator(button) {
    const indicator = $('.filter-indicator');
    if (!indicator || !button) return;
    indicator.style.width = `${button.offsetWidth}px`;
    indicator.style.transform = `translateX(${button.offsetLeft}px)`;
  }

  function initializeProjectControls() {
    const categories = ['All', ...new Set(state.config.projects.map(project => project.category))];
    const filters = $('#projectFilters');
    const indicator = create('span', 'filter-indicator');
    filters.append(indicator);
    categories.forEach(category => {
      const button = create('button', 'filter-button', category);
      button.type = 'button';
      const selected = category === state.category;
      button.classList.toggle('is-active', selected);
      button.setAttribute('aria-pressed', String(selected));
      button.addEventListener('click', () => {
        state.category = category;
        state.expanded = category !== 'All';
        [...filters.querySelectorAll('.filter-button')].forEach(item => {
          const active = item === button;
          item.classList.toggle('is-active', active);
          item.setAttribute('aria-pressed', String(active));
        });
        moveFilterIndicator(button);
        button.scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth', block: 'nearest', inline: 'center' });
        renderProjects();
      });
      filters.append(button);
    });
    moveFilterIndicator($('.filter-button.is-active'));
    requestAnimationFrame(() => moveFilterIndicator($('.filter-button.is-active')));
    window.addEventListener('resize', () => moveFilterIndicator($('.filter-button.is-active')));

    const search = $('#projectSearch');
    search.addEventListener('input', event => { state.query = event.target.value; renderProjects(); });
    $('#showMore').addEventListener('click', () => {
      state.expanded = !state.expanded;
      renderProjects();
      if (!state.expanded) $('#work').scrollIntoView({ behavior: reduceMotion ? 'auto' : 'smooth' });
    });

    $('#clearProjectFilters').addEventListener('click', () => {
      state.category = 'All';
      state.query = '';
      state.expanded = false;
      search.value = '';
      const allButton = [...filters.querySelectorAll('.filter-button')].find(button => button.textContent === 'All');
      [...filters.querySelectorAll('.filter-button')].forEach(button => {
        const active = button === allButton;
        button.classList.toggle('is-active', active);
        button.setAttribute('aria-pressed', String(active));
      });
      moveFilterIndicator(allButton);
      renderProjects();
      search.focus();
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

    clearTimeout(state.modalTimer);
    state.lastFocused = document.activeElement;
    backdrop.hidden = false;
    backdrop.setAttribute('aria-hidden', 'false');
    $('main').inert = true;
    $('.site-header').inert = true;
    $('.footer').inert = true;
    document.body.style.overflow = 'hidden';
    requestAnimationFrame(() => {
      backdrop.classList.add('open');
      $('#modalClose').focus();
    });
  }

  function closeProjectModal() {
    const backdrop = $('#modalBackdrop');
    if (backdrop.hidden) return;
    backdrop.classList.remove('open');
    backdrop.setAttribute('aria-hidden', 'true');
    document.body.style.overflow = '';
    $('main').inert = false;
    $('.site-header').inert = false;
    $('.footer').inert = false;
    const returnTarget = state.lastFocused;
    state.modalTimer = setTimeout(() => {
      backdrop.hidden = true;
      if (returnTarget?.isConnected) returnTarget.focus();
    }, reduceMotion ? 0 : 400);
  }

  function initializeModal() {
    const backdrop = $('#modalBackdrop');
    $('#modalClose').addEventListener('click', closeProjectModal);
    backdrop.addEventListener('click', event => { if (event.target === backdrop) closeProjectModal(); });
    document.addEventListener('keydown', event => {
      if (backdrop.hidden) return;
      if (event.key === 'Escape') {
        event.preventDefault();
        closeProjectModal();
        return;
      }
      if (event.key !== 'Tab') return;
      const focusable = [...backdrop.querySelectorAll('a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])')]
        .filter(element => !element.hidden && element.getClientRects().length);
      if (!focusable.length) return;
      const first = focusable[0];
      const last = focusable[focusable.length - 1];
      if (event.shiftKey && document.activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && document.activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    });
  }

  /* -------------------------------- GitHub -------------------------------------- */
  function renderGitHub() {
    const container = $('#githubRepos');
    container.replaceChildren();
    container.classList.remove('is-loading');
    container.setAttribute('aria-busy', 'false');
    state.config.github.recentRepositories.forEach(repository => {
      const card = create('li', 'github-repo-card glass');
      const header = create('div', 'repo-header');
      const identity = create('div');
      identity.append(create('span', 'repo-kicker', `${repository.language} · Updated ${repository.updated}`), create('h3', '', repository.name));
      const repositoryLink = create('a', 'repo-source-link', 'Repository ↗');
      repositoryLink.href = repository.url;
      repositoryLink.target = '_blank';
      repositoryLink.rel = 'noopener noreferrer';
      repositoryLink.setAttribute('aria-label', `Repository for ${repository.name} on GitHub`);
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

  /* ------------------------------ Interface icons ------------------------------- */
  const ICONS = {
    build: [
      ['path', { d: 'M8.5 8.5h7a5 5 0 0 1 4.82 3.68l1 3.67a2.5 2.5 0 0 1-4.04 2.59l-1.95-1.69H8.67l-1.95 1.69a2.5 2.5 0 0 1-4.04-2.59l1-3.67A5 5 0 0 1 8.5 8.5Z' }],
      ['path', { d: 'M7 11.5v3m-1.5-1.5h3M16.5 12.25h.01M18.25 14h.01' }]
    ],
    explore: [
      ['circle', { cx: '12', cy: '12', r: '2.25' }],
      ['path', { d: 'M19.5 12c0 4.14-3.36 7.5-7.5 7.5S4.5 16.14 4.5 12 7.86 4.5 12 4.5c2.28 0 4.32 1.02 5.7 2.62' }],
      ['path', { d: 'M12 2.5c2.4 2.07 3.75 5.47 3.75 9.5S14.4 19.43 12 21.5M2.5 12h19' }]
    ],
    collaborate: [
      ['circle', { cx: '9', cy: '8', r: '3' }],
      ['path', { d: 'M3.5 19c.4-3.3 2.16-5 5.5-5s5.1 1.7 5.5 5M15.5 5.5a3 3 0 0 1 0 5.8M16.5 14c2.45.33 3.78 1.88 4 4.5' }]
    ],
    award: [
      ['path', { d: 'm12 3 2.5 5.06 5.58.81-4.04 3.94.96 5.56-5-2.63-5 2.63.96-5.56-4.04-3.94 5.58-.81L12 3Z' }]
    ]
  };

  function createSvgIcon(name, className = 'ui-icon') {
    const namespace = 'http://www.w3.org/2000/svg';
    const svg = document.createElementNS(namespace, 'svg');
    svg.setAttribute('viewBox', '0 0 24 24');
    svg.setAttribute('aria-hidden', 'true');
    if (className) svg.setAttribute('class', className);
    (ICONS[name] || ICONS.explore).forEach(([tag, attributes]) => {
      const child = document.createElementNS(namespace, tag);
      Object.entries(attributes).forEach(([attribute, value]) => child.setAttribute(attribute, value));
      svg.append(child);
    });
    return svg;
  }

  /* ------------------------------- Experience ------------------------------------ */
  function renderExperience() {
    const container = $('#experienceList');
    container.replaceChildren();
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
  function alignSkillTooltips() {
    const gutter = 12;
    const notes = $$('.skill-note');
    notes.forEach(note => note.style.setProperty('--tooltip-offset', '0px'));
    const measurements = notes.map(note => ({ note, rect: note.getBoundingClientRect() }));
    measurements.forEach(({ note, rect }) => {
      let offset = 0;
      if (rect.left < gutter) offset = gutter - rect.left;
      else if (rect.right > window.innerWidth - gutter) offset = window.innerWidth - gutter - rect.right;
      note.style.setProperty('--tooltip-offset', `${offset}px`);
    });
  }

  function renderAbout() {
    const skillCloud = $('#skillCloud');
    skillCloud.replaceChildren();
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
    alignSkillTooltips();
    if (!state.tooltipResizeBound) {
      state.tooltipResizeBound = true;
      window.addEventListener('resize', () => {
        clearTimeout(state.tooltipResizeTimer);
        state.tooltipResizeTimer = setTimeout(alignSkillTooltips, 100);
      });
    }
    const specialtyRow = $('#specialtyRow');
    if (specialtyRow && Array.isArray(state.config.profile.specialties)) {
      state.config.profile.specialties.forEach(specialty => {
        specialtyRow.append(create('li', 'specialty-chip', specialty));
      });
    }
    const focusGrid = $('#focusGrid');
    focusGrid.replaceChildren();
    state.config.focus.forEach(item => {
      const card = create('article', 'focus-card reveal');
      const icon = create('span', 'focus-icon');
      const iconName = item.title === 'Building' ? 'build' : item.title === 'Open to' ? 'collaborate' : 'explore';
      icon.append(createSvgIcon(iconName));
      card.append(icon, create('h3', '', item.title), create('p', '', item.text));
      focusGrid.append(card);
    });
  }

  /* ------------------------------- Recognition ------------------------------------- */
  function renderAwards() {
    const grid = $('#awardsGrid');
    if (!grid || !Array.isArray(state.config.awards)) return;
    grid.replaceChildren();
    state.config.awards.forEach(award => {
      const card = create('article', 'award-card reveal');
      const icon = create('div', 'award-icon');
      icon.setAttribute('aria-hidden', 'true');
      icon.append(createSvgIcon('award'));
      const copy = create('div');
      copy.append(create('span', 'award-meta', `${award.issuer} · ${award.period}`), create('h3', '', award.title), create('p', '', award.description));
      card.append(icon, copy);
      grid.append(card);
    });
  }

  /* ------------------------------- Foundations ------------------------------------- */
  function renderFoundations() {
    const educationList = $('#educationList');
    const certificationList = $('#certificationList');
    educationList?.replaceChildren();
    certificationList?.replaceChildren();
    if (educationList && Array.isArray(state.config.education)) {
      state.config.education.forEach(entry => {
        const item = create('div', 'foundations-item');
        item.append(create('span', 'foundations-period', entry.period));
        const copy = create('div');
        copy.append(create('p', 'foundations-title', entry.credential), create('p', 'foundations-sub', entry.school));
        item.append(copy);
        educationList.append(item);
      });
    }
    if (certificationList && Array.isArray(state.config.certifications)) {
      state.config.certifications.forEach(entry => {
        const item = create('div', 'foundations-item');
        item.append(create('span', 'foundations-period', entry.period));
        const copy = create('div');
        copy.append(create('p', 'foundations-title', entry.title), create('p', 'foundations-sub', entry.issuer));
        item.append(copy);
        certificationList.append(item);
      });
    }
  }

  /* ----------------------------------- Maker ---------------------------------------- */
  function renderMaker() {
    const grid = $('#makerGrid');
    if (!grid || !Array.isArray(state.config.maker)) return;
    grid.replaceChildren();
    state.config.maker.forEach((entry, index) => {
      const card = create('article', 'maker-card reveal');
      const itemIndex = create('span', 'maker-index', String(index + 1).padStart(2, '0'));
      itemIndex.setAttribute('aria-hidden', 'true');
      card.append(itemIndex, create('span', 'maker-year', entry.year), create('h3', '', entry.title), create('p', '', entry.description));
      if (entry.url) {
        const link = create('a', 'maker-link', 'View on GitHub ');
        const arrow = create('span', '', '↗');
        arrow.setAttribute('aria-hidden', 'true');
        link.append(arrow);
        link.href = entry.url;
        link.target = '_blank';
        link.rel = 'noopener noreferrer';
        card.append(link);
      }
      grid.append(card);
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
    items.forEach((item, index) => { item.style.transitionDelay = `${Math.min(index % 3, 2) * 50}ms`; observer.observe(item); });
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

  /* ---------------------------------- Marquee --------------------------------- */
  // Languages, software and tools featured across the GitHub profile (README,
  // config toolbox) and portfolio projects. Rendered with Devicon logos inside
  // light rounded tiles so dark brand marks stay visible on the dark theme.
  const MARQUEE_ICONS = [
    // Game engines
    { devicon: 'unity', label: 'Unity' },
    { devicon: 'unrealengine', label: 'Unreal Engine' },
    { devicon: 'godot', label: 'Godot' },
    // Languages
    { devicon: 'csharp', label: 'C#' },
    { devicon: 'cplusplus', label: 'C++' },
    { devicon: 'python', label: 'Python' },
    { devicon: 'javascript', label: 'JavaScript' },
    { devicon: 'typescript', label: 'TypeScript' },
    // Web & backend
    { devicon: 'nodejs', label: 'Node.js' },
    { devicon: 'html5', label: 'HTML' },
    { devicon: 'css3', label: 'CSS' },
    { devicon: 'php', label: 'PHP' },
    { devicon: 'mysql', label: 'MySQL' },
    // Mobile & AR (ARKit / ARCore shipping)
    { devicon: 'flutter', label: 'Flutter' },
    { devicon: 'android', label: 'Android' },
    { devicon: 'apple', label: 'iOS' },
    // Hardware
    { devicon: 'arduino', label: 'Arduino' },
    // Version control & CI/CD
    { devicon: 'git', label: 'Git' },
    { devicon: 'github', label: 'GitHub' },
    { devicon: 'gitlab', label: 'GitLab' },
    { devicon: 'githubactions', label: 'GitHub Actions' },
    // Tools & cloud
    { devicon: 'photoshop', label: 'Photoshop' },
    { devicon: 'googlecloud', label: 'Google Cloud' }
  ];

  const DEVICON_ICON_URL = devicon =>
    `https://cdn.jsdelivr.net/npm/devicon@2.17.0/icons/${devicon}/${devicon}-original.svg`;

  const createMarqueeChip = ({ devicon, label }) => {
    const chip = document.createElement('span');
    chip.className = 'marquee-chip';
    chip.title = label;
    const iconWrap = create('span', 'marquee-icon-wrap');
    const fallback = create('span', 'marquee-icon-fallback', label.slice(0, 1));
    const icon = document.createElement('img');
    icon.className = 'marquee-icon';
    icon.src = DEVICON_ICON_URL(devicon);
    icon.width = 24;
    icon.height = 24;
    icon.loading = 'lazy';
    icon.decoding = 'async';
    icon.alt = '';
    icon.setAttribute('draggable', 'false');
    icon.addEventListener('error', () => iconWrap.classList.add('is-error'), { once: true });
    iconWrap.append(fallback, icon);
    chip.append(iconWrap, create('span', 'marquee-chip-label', label));
    return chip;
  };

  // The loop uses two identical groups and translates by -50%. Each group must be
  // at least as wide as the visible strip, so repeat the icons enough times to
  // cover the widest viewport and keep the animation perfectly seamless.
  function initializeMarquee() {
    const track = $('#marqueeTrack');
    const mask = $('#marqueeMask');
    if (!track || !mask) return;

    const buildGroup = hidden => {
      const group = document.createElement('div');
      group.className = 'marquee-group';
      if (hidden) group.setAttribute('aria-hidden', 'true');
      MARQUEE_ICONS.forEach(item => group.appendChild(createMarqueeChip(item)));
      return group;
    };

    const rebuild = () => {
      while (track.firstChild) track.removeChild(track.firstChild);
      // Measure one full pass to decide how many repeats each half needs.
      const probe = buildGroup(false);
      track.appendChild(probe);
      const estimatedPassWidth = MARQUEE_ICONS.length * 112;
      const passWidth = probe.offsetWidth || estimatedPassWidth;
      track.removeChild(probe);
      const visible = Math.max(mask.clientWidth || 800, 1);
      const repeats = Math.min(4, Math.max(1, Math.ceil(visible / passWidth) + 1));
      const makeHalf = hidden => {
        const half = document.createElement('div');
        half.className = 'marquee-group';
        if (hidden) half.setAttribute('aria-hidden', 'true');
        for (let index = 0; index < repeats; index += 1) {
          MARQUEE_ICONS.forEach(item => half.appendChild(createMarqueeChip(item)));
        }
        return half;
      };
      track.appendChild(makeHalf(false));
      track.appendChild(makeHalf(true));
    };

    rebuild();
    let resizeTimer = null;
    window.addEventListener('resize', () => {
      clearTimeout(resizeTimer);
      resizeTimer = setTimeout(rebuild, 150);
    });
  }

  /* ----------------------------------- Init ------------------------------------------ */
  async function initialize() {
    if (state.initialized) return;
    state.initialized = true;
    initializeTheme();
    initializeImageFallbacks();
    initializeNavigation();
    initializeBackToTop();
    initializeCursorGlow();
    initializeMagnetic();
    initializePortraitTilt();
    initializeSurfaceLighting();
    initializeModal();
    initializeMarquee();
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
      renderAwards();
      renderFoundations();
      renderMaker();
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
