// Tell the non-Google search engines that pages changed.
//
// IndexNow is one POST that Bing, Yandex, Seznam.cz and Naver all consume —
// no accounts, no dashboards. Ownership is proved by serving the key back at
// https://<host>/<key>.txt, which is why the key lives in public/ and is not
// a secret.
//
// Google does not participate; it has its own sitemap and Search Console.
//
//   npm run indexnow

const KEY = "744389a8fb2deeee9c89cf32c78577b7";
const HOST = "clipspace.djt-group.com";
const URLS = [`https://${HOST}`, `https://${HOST}/privacy`];

const keyUrl = `https://${HOST}/${KEY}.txt`;

// If the key file is not reachable the submission is rejected without saying
// so, so check it first rather than reporting a false success.
const check = await fetch(keyUrl);
const served = check.ok ? (await check.text()).trim() : null;
if (served !== KEY) {
  console.error(`key file not serving correctly at ${keyUrl}`);
  console.error(`  status ${check.status}, body ${JSON.stringify(served)}`);
  process.exit(1);
}
console.log(`key verified at ${keyUrl}`);

const res = await fetch("https://api.indexnow.org/indexnow", {
  method: "POST",
  headers: { "Content-Type": "application/json; charset=utf-8" },
  body: JSON.stringify({
    host: HOST,
    key: KEY,
    keyLocation: keyUrl,
    urlList: URLS,
  }),
});

// 200 means accepted, 202 means accepted but the key is still being verified.
console.log(`IndexNow: ${res.status} ${res.statusText}`);
console.log(await res.text().catch(() => ""));
if (![200, 202].includes(res.status)) process.exit(1);
for (const u of URLS) console.log(`  submitted ${u}`);
