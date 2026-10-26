const test = require('node:test');
const assert = require('node:assert/strict');
const fs = require('node:fs');
const path = require('node:path');
const c = require('../content-utils');
const html = fs.readFileSync(path.join(__dirname, '../index.html'), 'utf8');
test('SEO title, H1 and admin data stay consistent', () => {
 const title = html.match(/<title>(.*?)<\/title>/)[1];
 assert.ok(html.includes('const mainTitle = "' + title + '"'));
 assert.equal((html.match(/<h1\b/g) || []).length, 1);
 assert.equal(html.match(/<h1[^>]*>(.*?)<\/h1>/)[1], c.read(html).about.title);
 assert.ok(!html.includes('�'));
 assert.ok(html.includes('name="yandex-verification" content="dd0011bc16b28a90"'));
});
test('FAQ structured data matches readable HTML', () => {
 const schema = JSON.parse(html.match(/<script type="application\/ld\+json">([\s\S]*?)<\/script>/)[1]);
 const faq = schema.find(x => x['@type'] === 'FAQPage');
 for (const q of faq.mainEntity) {
  assert.ok(html.includes('<summary>' + q.name + '</summary>'));
  assert.ok(html.includes('<p>' + q.acceptedAnswer.text + '</p>'));
 }
 const section = html.match(/<section class="show-services"[\s\S]*?<\/section>/)[0];
 for (const keyword of ['Шоу-балет на свадьбу', 'Шоу-балет на юбилей', 'Танцевальное шоу на корпоратив', 'Артисты на праздник']) assert.ok(section.includes(keyword));
 const published = c.write(html, c.read(html));
 assert.ok(published.includes(section));
});
