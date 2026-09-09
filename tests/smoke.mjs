import { readFile, access } from 'node:fs/promises';
import assert from 'node:assert/strict';

const root = new URL('../', import.meta.url);
const read = file => readFile(new URL(file, root), 'utf8');
const requiredFiles = ['index.html', 'styles.css', 'script.js', 'config.json', 'favicon.svg', 'site.webmanifest', 'robots.txt', 'sitemap.xml', '404.html', 'SECURITY.md'];
await Promise.all(requiredFiles.map(file => access(new URL(file, root))));

const [html, css, script, configText, manifestText] = await Promise.all([
  read('index.html'), read('styles.css'), read('script.js'), read('config.json'), read('site.webmanifest')
]);
const config = JSON.parse(configText);
const manifest = JSON.parse(manifestText);

assert.match(html, /<html lang="en"/, 'Document language is required');
assert.match(html, /<meta name="description"/, 'Meta description is required');
assert.match(html, /<link rel="canonical"/, 'Canonical URL is required');
assert.match(html, /class="skip-link"/, 'Skip link is required');
assert.match(html, /<main id="main">/, 'Main landmark is required');
assert.match(html, /aria-label="Primary navigation"/, 'Navigation label is required');
assert.match(css, /prefers-reduced-motion/, 'Reduced motion styles are required');
assert.match(css, /\[data-theme="light"\]/, 'A first-class light palette is required');
for (const token of ['--material-primary', '--material-secondary', '--material-tinted', '--material-floating', '--blur-sm', '--blur-md', '--blur-lg', '--radius-xl', '--duration-standard', '--z-dialog']) {
  assert.ok(css.includes(token), `Missing design token ${token}`);
}
assert.match(html, /class="nav-indicator"/, 'The spatial navigation indicator is required');
assert.match(html, /class="skeleton-card/, 'Project loading skeletons are required');
assert.match(html, /id="clearProjectFilters"/, 'The project empty-state reset is required');
assert.equal((html.match(/<\/body>/g) || []).length, 1, 'Document must have one closing body tag');
assert.equal((html.match(/<\/html>/g) || []).length, 1, 'Document must have one closing html tag');
assert.doesNotMatch(html, /bootstrap|font-awesome|particles\.js|sweetalert/i, 'Heavy legacy CDN dependencies should not return');
assert.doesNotMatch(script, /innerHTML\s*=/, 'Structured config content should not be injected via innerHTML');
assert.match(script, /create\('button', 'project-card-action'\)/, 'Project cards require a native keyboard control');
assert.match(script, /\.inert\s*=\s*true/, 'Overlay focus isolation is required');

assert.ok(Array.isArray(config.projects) && config.projects.length >= 8, 'At least eight portfolio projects are expected');
assert.ok(Array.isArray(config.github.recentRepositories) && config.github.recentRepositories.length >= 3, 'Recent GitHub repositories are incomplete');
assert.ok(Array.isArray(config.experience) && config.experience.length >= 4, 'Experience history is incomplete');
assert.ok(Array.isArray(config.profile.skills) && config.profile.skills.length >= 10, 'Toolbox is incomplete');

for (const [index, project] of config.projects.entries()) {
  const label = `projects[${index}]`;
  for (const key of ['title', 'description', 'category', 'source', 'updated', 'color']) assert.equal(typeof project[key], 'string', `${label}.${key} must be a string`);
  assert.ok(project.source.startsWith('https://github.com/KetanDutt/'), `${label}.source must link to KetanDutt GitHub`);
  assert.ok(Array.isArray(project.technologies) && project.technologies.length > 0, `${label} needs technologies`);
  if (project.demo) assert.ok(project.demo.startsWith('https://'), `${label}.demo must use HTTPS`);
}

const ids = [...html.matchAll(/\sid="([^"]+)"/g)].map(match => match[1]);
assert.equal(new Set(ids).size, ids.length, 'HTML ids must be unique');
for (const id of ['top', 'main', 'work', 'projectsGrid', 'github', 'githubRepos', 'experience', 'about', 'contact']) assert.ok(ids.includes(id), `Missing #${id}`);

const hrefs = [...html.matchAll(/\shref="([^"]+)"/g)].map(match => match[1]);
for (const href of hrefs.filter(value => value.startsWith('#'))) assert.ok(ids.includes(href.slice(1)), `Internal link target ${href} does not exist`);
const localHrefs = hrefs.filter(value => !/^(?:#|https?:|mailto:|tel:)/.test(value));
await Promise.all(localHrefs.map(href => access(new URL(href.split(/[?#]/)[0], root))));

// GitHub Pages serves paths case-sensitively. Validate every local image source so
// a filename-case mismatch cannot silently ship another broken portrait or card.
const imageSources = [...html.matchAll(/<img\b[^>]*\ssrc="([^"]+)"/g)].map(match => match[1]);
const localImageSources = imageSources.filter(value => !/^(?:https?:|data:)/.test(value));
await Promise.all(localImageSources.map(src => access(new URL(src.split(/[?#]/)[0], root))));
assert.ok(localImageSources.includes('assets/ketan.jpg'), 'Hero portrait must use the case-correct asset path');
assert.ok(localImageSources.includes('assets/ketan160.jpg'), 'GitHub portrait must use the case-correct asset path');
assert.equal((html.match(/class="orbit-pill"/g) || []).length, 10, 'The hero skill orbit should contain ten skills');
assert.match(script, /showMore.*addEventListener/s, 'Show-more button must have a click handler');
assert.match(script, /menuButton\.addEventListener\('click'/, 'Mobile navigation button must have a click handler');
assert.match(script, /themeToggle.*addEventListener\('click'/s, 'Theme button must have a click handler');

assert.equal(manifest.start_url, '/', 'Manifest should start at the site root');
assert.equal(manifest.display, 'standalone', 'Manifest display mode should be standalone');
console.log(`✓ ${requiredFiles.length} production files, ${config.projects.length} projects, and accessibility/SEO hooks validated.`);
