(() => {
  'use strict';

  const state = { config: null, category: 'All', query: '', expanded: false };
  const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
  const $ = (selector, root = document) => root.querySelector(selector);
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

  function initializeTheme() {
    const saved = safeStorage('get', 'portfolio-theme');
    const preferred = window.matchMedia('(prefers-color-scheme: light)').matches ? 'light' : 'dark';
    setTheme(saved === 'light' || saved === 'dark' ? saved : preferred);
    $('#themeToggle').addEventListener('click', () => {
      const next = document.documentElement.dataset.theme === 'dark' ? 'light' : 'dark';
      setTheme(next);
      safeStorage('set', 'portfolio-theme', next);
    });
  }

  function setTheme(theme) {
    document.documentElement.dataset.theme = theme;
    $('meta[name="theme-color"]').content = theme === 'dark' ? '#080a11' : '#edf1f8';
    const button = $('#themeToggle');
    const nextTheme = theme === 'dark' ? 'light' : 'dark';
    button.setAttribute('aria-label', `Switch to ${nextTheme} theme`);
    button.title = `Switch to ${nextTheme} theme`;
  }

  function initializeNavigation() {
    const menuButton = $('#menuToggle');
    const nav = $('#navLinks');
    const closeMenu = () => { nav.classList.remove('open'); menuButton.setAttribute('aria-expanded', 'false'); menuButton.setAttribute('aria-label', 'Open navigation'); };
    menuButton.addEventListener('click', () => {
      const open = nav.classList.toggle('open');
      menuButton.setAttribute('aria-expanded', String(open));
      menuButton.setAttribute('aria-label', open ? 'Close navigation' : 'Open navigation');
    });
    nav.addEventListener('click', event => { if (event.target.matches('a')) closeMenu(); });
    document.addEventListener('keydown', event => { if (event.key === 'Escape') closeMenu(); });
    document.addEventListener('click', event => { if (!event.target.closest('.nav')) closeMenu(); });

    if ('IntersectionObserver' in window) {
      const links = [...nav.querySelectorAll('a')];
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

  function makeExternalLink(url, label, symbol) {
    const link = create('a', 'circle-link', symbol);
    link.href = url;
    link.target = '_blank';
    link.rel = 'noopener noreferrer';
    link.setAttribute('aria-label', label);
    link.title = label;
    return link;
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

    visible.forEach((project, index) => {
      const article = create('article', 'project-card reveal');
      article.style.setProperty('--project-glow', project.color);
      article.style.setProperty('--project-tint', `${project.color}25`);

      const top = create('div', 'project-top');
      top.append(create('span', 'project-number', `${String(index + 1).padStart(2, '0')} · ${project.category} · ${project.updated}`));
      top.append(create('h3', '', project.title), create('p', '', project.description));

      const bottom = create('div', 'project-bottom');
      const tags = create('div', 'tags');
      project.technologies.forEach(technology => tags.append(create('span', 'tag', technology)));
      const links = create('div', 'project-links');
      if (project.demo) links.append(makeExternalLink(project.demo, `Open ${project.title} live demo`, '↗'));
      links.append(makeExternalLink(project.source, `View ${project.title} source on GitHub`, '⌘'));
      bottom.append(tags, links);
      article.append(top, bottom);
      grid.append(article);
    });

    $('#emptyProjects').hidden = matching.length !== 0;
    const showMore = $('#showMore');
    const canExpand = allProjects.length > 6 && state.category === 'All' && !normalizedQuery;
    showMore.hidden = !canExpand;
    showMore.textContent = state.expanded ? 'Show fewer projects' : `Show all ${allProjects.length} projects`;
    observeReveals(grid);
  }

  function initializeProjectControls() {
    const categories = ['All', ...new Set(state.config.projects.map(project => project.category))];
    const filters = $('#projectFilters');
    categories.forEach(category => {
      const button = create('button', 'filter-button', category);
      button.type = 'button';
      button.setAttribute('aria-pressed', String(category === state.category));
      button.addEventListener('click', () => {
        state.category = category;
        state.expanded = category !== 'All';
        [...filters.children].forEach(item => item.setAttribute('aria-pressed', String(item === button)));
        renderProjects();
      });
      filters.append(button);
    });
    $('#projectSearch').addEventListener('input', event => { state.query = event.target.value; renderProjects(); });
    $('#showMore').addEventListener('click', () => { state.expanded = !state.expanded; renderProjects(); if (!state.expanded) $('#work').scrollIntoView(); });
  }

  function renderGitHub() {
    const container = $('#githubRepos');
    state.config.github.recentRepositories.forEach(repository => {
      const card = create('article', 'github-repo-card glass');
      const header = create('div', 'repo-header');
      const identity = create('div');
      identity.append(create('span', 'repo-kicker', `${repository.language} · Updated ${repository.updated}`), create('h3', '', repository.name));
      header.append(identity, makeExternalLink(repository.url, `View ${repository.name} on GitHub`, '↗'));
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

  function renderExperience() {
    const container = $('#experienceList');
    state.config.experience.forEach(job => {
      const item = create('article', 'timeline-item reveal');
      const period = create('div', 'timeline-period', job.period);
      const role = create('div', 'timeline-role');
      role.append(create('h3', '', job.role), create('p', '', job.company));
      item.append(period, role, create('p', 'timeline-description', job.summary));
      container.append(item);
    });
  }

  function renderAbout() {
    const skillCloud = $('#skillCloud');
    state.config.profile.skills.forEach(skill => skillCloud.append(create('span', 'skill-pill', skill)));
    const focusGrid = $('#focusGrid');
    state.config.focus.forEach(item => {
      const card = create('article', 'focus-card reveal');
      card.append(create('div', 'focus-icon', item.icon), create('h3', '', item.title), create('p', '', item.text));
      focusGrid.append(card);
    });
  }

  function observeReveals(root = document) {
    const items = [...root.querySelectorAll('.reveal:not(.is-visible)')];
    if (reduceMotion || !('IntersectionObserver' in window)) { items.forEach(item => item.classList.add('is-visible')); return; }
    const observer = new IntersectionObserver((entries, currentObserver) => {
      entries.forEach(entry => {
        if (entry.isIntersecting) { entry.target.classList.add('is-visible'); currentObserver.unobserve(entry.target); }
      });
    }, { threshold: 0.08, rootMargin: '0px 0px -30px' });
    items.forEach((item, index) => { item.style.transitionDelay = `${Math.min(index % 4, 3) * 70}ms`; observer.observe(item); });
  }

  async function refreshGitHubCount(username, fallback) {
    const counters = [$('#repoCount'), $('#githubRepoCount')].filter(Boolean);
    const updateCounters = value => counters.forEach(counter => { counter.textContent = value; });
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

  async function initialize() {
    initializeTheme();
    initializeNavigation();
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
  }

  document.addEventListener('DOMContentLoaded', initialize);
})();
