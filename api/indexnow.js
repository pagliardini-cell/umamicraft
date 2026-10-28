// Serverless Function para Vercel: /api/indexnow
const https = require('https');
const fs = require('fs');
const path = require('path');

const HOST = 'umamicraft.vercel.app';
const KEY = '2677b8b956ff201792a88409d8c8b876';
const KEY_LOCATION = `https://${HOST}/${KEY}.txt`;

const charmap = {
  'ı': 'i', 'İ': 'i', 'ø': 'o', 'Ø': 'o', 'æ': 'ae', 'Æ': 'ae', 'œ': 'oe', 'Œ': 'oe', 'ß': 'ss',
  'ð': 'd', 'þ': 'th'
};

function makeSlug(title) {
  let t = String(title || '');
  for (const [k, v] of Object.entries(charmap)) t = t.replaceAll(k, v);
  return t.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type, Authorization');

  if (req.method === 'OPTIONS') {
    return res.status(200).end();
  }

  try {
    const recipesPath = path.join(process.cwd(), 'recetas_pro.json');
    let recipes = [];
    if (fs.existsSync(recipesPath)) {
      recipes = JSON.parse(fs.readFileSync(recipesPath, 'utf8'));
    }

    const recentParam = req.query.recent ? parseInt(req.query.recent, 10) : null;
    if (recentParam && recentParam > 0) {
      recipes = recipes.slice(-recentParam);
    }

    const seen = {};
    const urlList = [
      `https://${HOST}/`,
      `https://${HOST}/?lang=en`,
      `https://${HOST}/?lang=pt`
    ];

    for (const r of recipes) {
      const base = makeSlug(r.title);
      let slug = base;
      if (seen[base]) {
        seen[base]++;
        slug = `${base}-${seen[base]}`;
      } else {
        seen[base] = 1;
      }
      urlList.push(`https://${HOST}/receta/${slug}`);
      urlList.push(`https://${HOST}/receta/${slug}?lang=en`);
      urlList.push(`https://${HOST}/receta/${slug}?lang=pt`);
    }

    const payload = JSON.stringify({
      host: HOST,
      key: KEY,
      keyLocation: KEY_LOCATION,
      urlList: urlList
    });

    const sendPing = (endpointUrl) => {
      return new Promise((resolve) => {
        const u = new URL(endpointUrl);
        const opt = {
          hostname: u.hostname,
          path: u.pathname,
          method: 'POST',
          headers: {
            'Content-Type': 'application/json; charset=utf-8',
            'Content-Length': Buffer.byteLength(payload),
            'User-Agent': 'UmamiCraft-IndexNow-Vercel/1.0'
          },
          timeout: 10000
        };

        const postReq = https.request(opt, (response) => {
          let data = '';
          response.on('data', (c) => data += c);
          response.on('end', () => {
            resolve({
              endpoint: endpointUrl,
              status: response.statusCode,
              body: data
            });
          });
        });

        postReq.on('error', (err) => {
          resolve({
            endpoint: endpointUrl,
            error: err.message
          });
        });

        postReq.write(payload);
        postReq.end();
      });
    };

    const results = await Promise.all([
      sendPing('https://api.indexnow.org/indexnow'),
      sendPing('https://www.bing.com/indexnow')
    ]);

    return res.status(200).json({
      ok: true,
      totalUrls: urlList.length,
      host: HOST,
      keyLocation: KEY_LOCATION,
      results: results
    });
  } catch (err) {
    return res.status(500).json({
      ok: false,
      error: err.message
    });
  }
};
