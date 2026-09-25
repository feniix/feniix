// Replaces the block between the articles markers in README.md with the
// three newest items from the site's RSS feed. No dependencies.
import { readFileSync, writeFileSync } from 'node:fs';

const FEED = 'https://feniix-hq.net/rss.xml';
const COUNT = 3;

const xml = await (await fetch(FEED)).text();
const items = [...xml.matchAll(/<item>([\s\S]*?)<\/item>/g)]
  .map(([, body]) => ({
    title: /<title>(?:<!\[CDATA\[)?(.*?)(?:\]\]>)?<\/title>/s.exec(body)?.[1]?.trim(),
    link: /<link>(.*?)<\/link>/s.exec(body)?.[1]?.trim(),
  }))
  .filter((i) => i.title && i.link)
  .slice(0, COUNT);

if (items.length === 0) throw new Error('No items parsed from the feed');

const block = items.map((i) => `- [${i.title}](${i.link})`).join('\n');
const readme = readFileSync('README.md', 'utf8');
const updated = readme.replace(
  /(<!-- articles:start -->\n)[\s\S]*?(\n<!-- articles:end -->)/,
  `$1${block}$2`,
);
if (updated === readme) console.log('README unchanged');
writeFileSync('README.md', updated);
