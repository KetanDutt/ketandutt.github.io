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
assert.doesNotMatch(html, /bootstrap|font-awesome|particles\.js|sweetalert/i, 'Heavy legacy CDN dependencies should not return');
assert.doesNotMatch(script, /innerHTML\s*=/, 'Structured config content should not be injected via innerHTML');

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
assert.match(script, /showMore.*addEventListener/s, 'Show-more button must have a click handler');
assert.match(script, /menuButton\.addEventListener\('click'/, 'Mobile navigation button must have a click handler');
assert.match(script, /themeToggle.*addEventListener\('click'/s, 'Theme button must have a click handler');

assert.equal(manifest.start_url, '/', 'Manifest should start at the site root');
assert.equal(manifest.display, 'standalone', 'Manifest display mode should be standalone');
console.log(`✓ ${requiredFiles.length} production files, ${config.projects.length} projects, and accessibility/SEO hooks validated.`);
