// Load Configuration
fetch('config.json')
    .then(response => response.json())
    .then(config => {
        initializePortfolio(config);
    })
    .catch(error => {
        console.error('Error loading config:', error);
        document.getElementById('console-loader').innerHTML = '<p class="text-white text-center">Error loading configuration.<br>Please check console.</p>';
    });

function initializePortfolio(config) {
    // Meta & Theme
    document.title = config.meta.title;
    const root = document.documentElement;
    const colors = config.theme.colors;
    for (const key in colors) {
        root.style.setProperty(`--${key}-color`, colors[key]);
    }

    // CV Download Button
    const downloadBtn = document.getElementById('downloadCV');
    if (config.settings.show_cv_download) {
        downloadBtn.style.display = 'block';
        downloadBtn.onclick = () => {
                setTimeout(() => {
                const link = document.createElement('a');
                link.href = config.settings.cv_file_path;
                link.download = config.settings.cv_file_path;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
            }, 500);
        };
    }

    // Profile
    const profileImg = document.getElementById('profile-img');
    profileImg.src = config.profile.image_url;
    profileImg.alt = config.profile.name;
    document.getElementById('profile-name').textContent = config.profile.name;
    document.getElementById('profile-subtitle').textContent = config.profile.subtitle;

    const badgesContainer = document.getElementById('profile-badges');
    const badgesFragment = document.createDocumentFragment();
    config.profile.badges.forEach(badge => {
        const span = document.createElement('span');
        span.className = `badge ${badge.color_class} me-1`;
        span.textContent = badge.text;
        badgesFragment.appendChild(span);
    });
    badgesContainer.appendChild(badgesFragment);

    const renderSocialLinks = (containerId, classNames = "text-white") => {
            const container = document.getElementById(containerId);
            container.innerHTML = '';
            const fragment = document.createDocumentFragment();
            config.profile.social_links.forEach(link => {
                const a = document.createElement('a');
                a.href = link.url;
                a.target = "_blank";
                a.className = classNames;
                if(containerId === 'contact-social-links') a.className += " col-6";
                a.style.textDecoration = "none";
                a.innerHTML = `<i class="${link.icon} fa-3x"></i>`;
                fragment.appendChild(a);
            });
            container.appendChild(fragment);
    };
    renderSocialLinks('social-links');
    renderSocialLinks('contact-social-links');


    // Current Focus
    const focusContainer = document.getElementById('current-focus-container');
    const focusFragment = document.createDocumentFragment();
    config.current_focus.forEach(item => {
        const col = document.createElement('div');
        col.className = 'col-md-6';
        col.innerHTML = `
            <div class="d-flex align-items-center mb-3">
                <i class="${item.icon} fa-2x text-primary me-3"></i>
                <div>
                    <h3 class="h5 mb-1">${item.title}</h3>
                    <p class="mb-0">${item.text}</p>
                </div>
            </div>
        `;
        focusFragment.appendChild(col);
    });
    focusContainer.appendChild(focusFragment);

    // Summary
    document.getElementById('summary-text').textContent = config.summary;

    // Experience
    const expContainer = document.getElementById('experience-container');
    const expFragment = document.createDocumentFragment();
    config.experience.forEach(job => {
        const card = document.createElement('div');
        card.className = 'card experience-card p-4';

        const listItems = job.description.map(desc => `<li>${desc.replace(/\*\*(.*?)\*\*/g, '<strong>$1</strong>')}</li>`).join('');

        card.innerHTML = `
            <div class="d-flex align-items-start mb-3">
                <img src="${job.logo}" alt="${job.company}" class="company-logo me-3" loading="lazy" width="50" height="50">
                <div>
                    <h3 class="h5 mb-1">${job.role}</h3>
                    <div class="d-flex flex-wrap align-items-center mb-2">
                        <span class="me-3">${job.company}</span>
                        <span class="me-3"><i class="fas fa-map-marker-alt me-1"></i> ${job.location}</span>
                        <span><i class="fas fa-calendar-alt me-1"></i> ${job.period}</span>
                    </div>
                </div>
            </div>
            <ul>${listItems}</ul>
        `;
        expFragment.appendChild(card);
    });
    expContainer.appendChild(expFragment);

    // Skills
    const renderSkillBars = (containerId, skills) => {
        const container = document.getElementById(containerId);
        const fragment = document.createDocumentFragment();
        skills.forEach(skill => {
            const div = document.createElement('div');
            div.className = 'skill-bar-container';
            let badgesHtml = '';
            if (skill.tags) {
                badgesHtml = '<div class="mt-2">' + skill.tags.map(tag => `<span class="badge bg-secondary me-1 mb-1">${tag}</span>`).join('') + '</div>';
            }
            div.innerHTML = `
                <div class="skill-label">
                    <span>${skill.name}</span>
                    <span>${skill.level}</span>
                </div>
                <div class="skill-bar">
                    <div class="skill-progress" style="width: ${skill.percentage}%"></div>
                </div>
                ${badgesHtml}
            `;
            fragment.appendChild(div);
        });
        container.appendChild(fragment);
    };
    renderSkillBars('skills-game-engines', config.skills.game_engines);
    renderSkillBars('skills-languages', config.skills.programming_languages);

    // Lazy load Chart.js only when the chart is about to come into view
    const skillsRadarCanvas = document.getElementById('skillsRadar');

    const chartObserver = new IntersectionObserver((entries, observer) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                // Disconnect observer to run only once
                observer.disconnect();

                // Dynamically load Chart.js
                const script = document.createElement('script');
                script.src = "https://cdn.jsdelivr.net/npm/chart.js";
                script.onload = () => {
                    initRadarChart(config.skills.radar_chart);
                };
                document.body.appendChild(script);
            }
        });
    }, { threshold: 0.1, rootMargin: "200px" });

    chartObserver.observe(skillsRadarCanvas);

    function initRadarChart(chartData) {
        const ctx = skillsRadarCanvas.getContext('2d');
        new Chart(ctx, {
            type: 'radar',
            data: {
                labels: chartData.labels,
                datasets: [{
                    label: 'Skill Level',
                    data: chartData.data,
                    backgroundColor: 'rgba(110, 72, 170, 0.2)',
                    borderColor: 'rgba(110, 72, 170, 1)',
                    borderWidth: 2,
                    pointBackgroundColor: 'rgba(110, 72, 170, 1)',
                    pointRadius: 4
                }]
            },
            options: {
                responsive: true,
                scales: {
                    r: {
                        min: 0,
                        max: 100,
                        angleLines: { color: 'rgba(255, 255, 255, 0.1)' },
                        grid: { color: 'rgba(255, 255, 255, 0.1)' },
                        pointLabels: { color: '#fff', font: { size: 12 } },
                        ticks: { display: false }
                    }
                },
                plugins: { legend: { labels: { color: '#fff' } } }
            }
        });
    }

    // Toolbox
    const toolboxContainer = document.getElementById('toolbox-container');
    const toolboxFragment = document.createDocumentFragment();

    const renderToolboxCategory = (title, items) => {
        const col = document.createElement('div');
        col.className = 'col-md-4 mb-4';
        const itemsHtml = items.map(item => {
            let iconHtml = '';
            if (item.icon_url) {
                iconHtml = `<img src="${item.icon_url}" width="20" height="20" class="me-1" loading="lazy">`;
            } else if (item.icon_class) {
                iconHtml = `<i class="${item.icon_class} me-1"></i>`;
            }
            return `<span class="badge bg-secondary p-2 d-flex align-items-center">${iconHtml} ${item.name}</span>`;
        }).join('');

        col.innerHTML = `
            <div class="card experience-card p-4 h-100">
                <h3 class="h5 mb-3">${title}</h3>
                <div class="d-flex flex-wrap gap-2">${itemsHtml}</div>
            </div>
        `;
        toolboxFragment.appendChild(col);
    };
    renderToolboxCategory("Game Engines", config.toolbox.game_engines);
    renderToolboxCategory("Languages", config.toolbox.languages);
    renderToolboxCategory("Tools & Platforms", config.toolbox.tools);
    toolboxContainer.appendChild(toolboxFragment);


    // Projects
    const projectsContainer = document.getElementById('projects-container');
    const moreProjectsContainer = document.getElementById('moreProjects');
    const showMoreBtn = document.getElementById('showMoreProjects');

    const projectsFragment = document.createDocumentFragment();
    const moreProjectsFragment = document.createDocumentFragment();
    let hiddenProjectsCount = 0;

    config.projects.forEach(project => {
        const col = document.createElement('div');
        col.className = 'col-md-6 mb-4';

        const techBadges = project.technologies.map(t => `<span class="badge bg-secondary me-1">${t}</span>`).join('');

        col.innerHTML = `
            <div class="card experience-card h-100">
                <div class="card-body">
                    <h3 class="h5">${project.title}</h3>
                    <p class="small">${project.subtitle}</p>
                    <p class="mb-3">${project.description}</p>
                    <div class="d-flex justify-content-between align-items-center">
                        <div>${techBadges}</div>
                        <div>
                            <a href="${project.demo_link}" target="_blank" class="btn btn-sm btn-outline-light me-1"><i class="fas fa-external-link-alt me-1"></i>Demo</a>
                            <a href="${project.source_link}" target="_blank" class="btn btn-sm btn-outline-light"><i class="fab fa-github me-1"></i>Source</a>
                        </div>
                    </div>
                </div>
            </div>
        `;

        if (project.hidden_initially) {
            moreProjectsFragment.appendChild(col);
            hiddenProjectsCount++;
        } else {
            projectsFragment.appendChild(col);
        }
    });

    projectsContainer.appendChild(projectsFragment);
    moreProjectsContainer.appendChild(moreProjectsFragment);

    if (hiddenProjectsCount > 0) {
        showMoreBtn.style.display = 'inline-block';
        showMoreBtn.addEventListener('click', function() {
            if (moreProjectsContainer.style.display === 'none') {
                moreProjectsContainer.style.display = 'flex';
                this.textContent = 'Show Less Projects';
            } else {
                moreProjectsContainer.style.display = 'none';
                this.textContent = 'Show More Projects';
            }
        });
    }

    // Stats
    const statsContainer = document.getElementById('stats-container');
    const statsFragment = document.createDocumentFragment();
    config.stats.forEach(stat => {
        const col = document.createElement('div');
        col.className = 'col-md-3 col-6 mb-4';
        col.innerHTML = `
            <div class="card experience-card p-3 h-100">
                <div class="stat-icon mb-2">
                    <i class="${stat.icon} fa-3x text-primary"></i>
                </div>
                <h3 class="h4 mb-0 counter" data-target="${stat.value}">${stat.value}</h3>
                <p class="mb-0">${stat.label}</p>
            </div>
        `;
        statsFragment.appendChild(col);
    });
    statsContainer.appendChild(statsFragment);
    // Init counters
    initCounters();

    // Awards
    const awardsContainer = document.getElementById('awards-container');
    const awardsFragment = document.createDocumentFragment();
    config.awards.forEach(award => {
        const card = document.createElement('div');
        card.className = 'card experience-card p-4';
        card.innerHTML = `
            <div class="d-flex align-items-start">
                <div class="me-4"><i class="${award.icon} fa-3x ${award.icon_color}"></i></div>
                <div>
                    <h3 class="h5 mb-1">${award.title}</h3>
                    <div class="d-flex flex-wrap align-items-center mb-2">
                        <span class="me-3">${award.company}</span>
                        <span><i class="fas fa-calendar-alt me-1"></i> ${award.date}</span>
                    </div>
                    <p class="mb-0">${award.description}</p>
                </div>
            </div>
        `;
        awardsFragment.appendChild(card);
    });
    awardsContainer.appendChild(awardsFragment);

    // Education
    const eduContainer = document.getElementById('education-container');
    const eduFragment = document.createDocumentFragment();
    config.education.forEach(edu => {
            const card = document.createElement('div');
        card.className = 'card experience-card p-4';
        card.innerHTML = `
            <div class="d-flex align-items-start">
                <div class="me-4"><i class="${edu.icon} fa-3x text-primary"></i></div>
                <div>
                    <h3 class="h5 mb-1">${edu.title}</h3>
                    <div class="d-flex flex-wrap align-items-center mb-2">
                        <span class="me-3">${edu.institution}</span>
                        <span><i class="fas fa-calendar-alt me-1"></i> ${edu.period}</span>
                    </div>
                </div>
            </div>
        `;
        eduFragment.appendChild(card);
    });
    eduContainer.appendChild(eduFragment);

    // Contact
    const contactList = document.getElementById('contact-info-list');
    contactList.innerHTML = `
        <li class="mb-3"><i class="fas fa-envelope me-2 text-primary"></i> <a href="mailto:${config.contact.email_primary}" class="text-white">${config.contact.email_primary}</a></li>
        <li class="mb-3"><i class="fas fa-envelope me-2 text-primary"></i> <a href="mailto:${config.contact.email_secondary}" class="text-white">${config.contact.email_secondary}</a></li>
        <li class="mb-3"><i class="fas fa-phone me-2 text-primary"></i> <a href="tel:${config.contact.phone.replace(/[\s-]/g, '')}" class="text-white">${config.contact.phone}</a></li>
        <li class="mb-3"><i class="fas fa-map-marker-alt me-2 text-primary"></i> <span>${config.contact.location}</span></li>
    `;


    // Particles
    if (window.innerWidth < 768) {
        config.particles.number.value = 20; // Reduce particles on mobile
        config.particles.move.enable = true; // Ensure movement is enabled but maybe slower?
    }
    particlesJS('particles-js', config.particles);

    // Hide Loader
    const loader = document.getElementById('console-loader');
    loader.style.opacity = '0';
    setTimeout(function () {
        loader.style.display = "none";
        loader.classList.remove("d-flex");
    }, 500);

    // Observe Animations
    observeAnimations();
}

function observeAnimations() {
    const observer = new IntersectionObserver((entries) => {
        entries.forEach(entry => {
            if (entry.isIntersecting) {
                entry.target.style.opacity = 1;
                entry.target.style.transform = 'translateY(0)';
            }
        });
    }, { threshold: 0.1 });

    document.querySelectorAll('.experience-card').forEach(card => {
        card.style.opacity = 0;
        card.style.transform = 'translateY(20px)';
        card.style.transition = 'all 0.5s ease';
        observer.observe(card);
    });
}

function initCounters() {
    const counters = document.querySelectorAll('.counter');
    const speed = 200;

    counters.forEach(counter => {
        const target = +counter.getAttribute('data-target');
        let count = 0; // Start from 0
        const increment = target / speed;

        const updateCount = () => {
            count += increment;
            const newCount = Math.ceil(count);
            if (newCount < target) {
                counter.innerText = newCount;
                requestAnimationFrame(updateCount);
            } else {
                counter.innerText = target.toLocaleString() + "+";
            }
        };
        updateCount();
    });
}

// Theme Toggle Logic
document.addEventListener('DOMContentLoaded', function () {
    // Theme toggle is hidden by default in CSS, if needed it can be re-enabled or controlled via config
    const themeToggle = document.getElementById('themeToggle');
    const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
    let currentTheme = prefersDark ? 'dark' : 'light';

    document.documentElement.setAttribute('data-theme', currentTheme);
    updateThemeIcon();

    themeToggle.addEventListener('click', function () {
        currentTheme = currentTheme === 'dark' ? 'light' : 'dark';
        document.documentElement.setAttribute('data-theme', currentTheme);
        updateThemeIcon();
    });

    function updateThemeIcon() {
        const icon = themeToggle.querySelector('i');
        if (currentTheme === 'dark') {
            icon.classList.remove('fa-moon');
            icon.classList.add('fa-sun');
        } else {
            icon.classList.remove('fa-sun');
            icon.classList.add('fa-moon');
        }
    }
});

// Contact form handling (Keep as is)
document.getElementById('contactForm').addEventListener('submit', function (e) {
    e.preventDefault();
    Swal.fire({
        title: 'Message Sent!',
        text: 'Thank you for reaching out. I will get back to you soon.',
        icon: 'success',
        confirmButtonText: 'Great!',
        theme: "dark"
    });
    this.reset();
});
