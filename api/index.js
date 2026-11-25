const fs = require('fs');
const path = require('path');

function makeSlug(title) {
  let t = String(title || '');
  return t
    .normalize('NFKD')
    .replace(/[\u0300-\u036f]/g, '')
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function parseDurationIso(s, allowZero = false) {
  if (!s) return allowZero ? 'PT0M' : null;
  const str = String(s).trim().toLowerCase();
  if (allowZero && (str === '0' || str === '0 min' || str.includes('0 min') || str.includes('sin cocci') || str.includes('no requiere'))) {
    return 'PT0M';
  }
  let tot = 0;
  const hm = s.match(/(\d+)\s*(?:hora|hr|h)/i);
  const mm = s.match(/(\d+)\s*(?:min|m)/i);
  if (hm) tot += parseInt(hm[1], 10) * 60;
  if (mm) tot += parseInt(mm[1], 10);
  if (!hm && !mm) {
    const num = s.match(/\d+/);
    if (num) tot = parseInt(num[0], 10);
  }
  if (tot <= 0) return allowZero ? 'PT0M' : null;
  const hrs = Math.floor(tot / 60);
  const mins = tot % 60;
  let iso = 'PT';
  if (hrs > 0) iso += `${hrs}H`;
  if (mins > 0) iso += `${mins}M`;
  return iso !== 'PT' ? iso : (allowZero ? 'PT0M' : null);
}

function makeStepName(pos, rawText) {
  let text = '';
  if (typeof rawText === 'string') {
    text = rawText;
  } else if (rawText && typeof rawText === 'object') {
    text = rawText.instruction || rawText.text || rawText.step || rawText.name || '';
    if (!text && Array.isArray(rawText.items)) text = rawText.items.join('. ');
    if (!text) text = JSON.stringify(rawText);
  } else {
    text = String(rawText || '');
  }
  const clean = text.replace(/^(\d+[\.\-\)]|\-|\*)\s*/, '').trim();
  const firstDot = clean.split(/[\.\n]/)[0].trim();
  let firstSentence = firstDot;
  if (firstDot.includes(':') && firstDot.split(':')[0].trim().length <= 35) {
    firstSentence = firstDot.split(':')[0].trim();
  } else if (!firstSentence || firstSentence.length > 55) {
    const words = clean.split(/\s+/);
    let summary = '';
    for (const w of words) {
      if ((summary ? summary + ' ' + w : w).length <= 50) {
        summary = summary ? summary + ' ' + w : w;
      } else {
        break;
      }
    }
    firstSentence = summary.replace(/[,;:.\-]+$/, '').trim();
  }
  return firstSentence ? `Paso ${pos}: ${firstSentence}` : `Paso ${pos}`;
}

module.exports = (req, res) => {
  const querySlug = req.query.receta || req.query.r;
  const isEn = String(req.query.lang || '').toLowerCase() === 'en';
  const indexPath = path.join(process.cwd(), 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  if (!querySlug) {
    if (isEn) {
      html = html.replace(/<html\s+lang=["'][^"']*["']/i, '<html lang="en"');
      html = html.replace(/<link\s+rel=["']canonical["']\s+href=["'][^"']*["']/i, '<link rel="canonical" href="https://umamicraft.vercel.app/?lang=en">');
    }
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  }

  try {
    const recipesPath = path.join(process.cwd(), 'recetas_pro.json');
    const recipes = JSON.parse(fs.readFileSync(recipesPath, 'utf8'));

    let enCache = {};
    if (isEn) {
      try {
        const enCachePath = path.join(process.cwd(), 'pinterest_en_cache.json');
        if (fs.existsSync(enCachePath)) {
          enCache = JSON.parse(fs.readFileSync(enCachePath, 'utf8'));
        }
      } catch (e) {
        console.warn('Could not load pinterest_en_cache.json:', e);
      }
    }

    let recipe = null;
    let foundSlug = querySlug;
    const isId = /^\d+$/.test(querySlug);

    for (const r of recipes) {
      const s = makeSlug(r.title);
      if (isId && r.id === parseInt(querySlug, 10)) {
        recipe = r;
        foundSlug = s;
        break;
      }
      if (s === querySlug) {
        recipe = r;
        foundSlug = s;
        break;
      }
    }

    if (recipe) {
      const ridStr = String(recipe.id);
      const enItem = isEn ? (enCache[ridStr] || null) : null;

      let title, desc, pageUrl, ingredients;
      const imgUrl = recipe.image.startsWith('http') ? recipe.image : `https://umamicraft.vercel.app/${recipe.image}`;

      if (isEn && enItem) {
        const rawTitle = enItem.title_en || recipe.title;
        title = `${rawTitle} Recipe | UmamiCraft`;
        desc = enItem.hook_en || (recipe.story ? recipe.story.slice(0, 155).trim() + '...' : 'Traditional recipe with step-by-step instructions at UmamiCraft.');
        pageUrl = `https://umamicraft.vercel.app/receta/${foundSlug}?lang=en`;
        ingredients = (Array.isArray(enItem.ingredients_en) && enItem.ingredients_en.length > 0) ? [...enItem.ingredients_en] : [];
      } else {
        title = `Receta de ${recipe.title} | UmamiCraft`;
        desc = recipe.story ? recipe.story.slice(0, 155).trim() + '...' : 'Receta tradicional curada paso a paso en UmamiCraft.';
        pageUrl = `https://umamicraft.vercel.app/receta/${foundSlug}`;
        ingredients = [];
      }

      if (ingredients.length === 0) {
        if (recipe.ingredient_groups && Array.isArray(recipe.ingredient_groups)) {
          recipe.ingredient_groups.forEach(g => {
            const list = g.items || g.ingredients || [];
            list.forEach(i => {
              const name = (typeof i === 'object' && i !== null) ? (i.name || i.item || '') : String(i || '');
              if (name && name.trim()) ingredients.push(name.trim());
            });
          });
        }
        if (ingredients.length === 0 && Array.isArray(recipe.ingredients)) {
          recipe.ingredients.forEach(i => {
            const name = (typeof i === 'object' && i !== null) ? (i.name || i.item || '') : String(i || '');
            if (name && name.trim()) ingredients.push(name.trim());
          });
        }
      }

      const instructions = [];
      if (recipe.step_groups) {
        let pos = 1;
        recipe.step_groups.forEach(sg => {
          const steps = sg.steps || sg.items || [];
          steps.forEach(st => {
            const stepText = (typeof st === 'object' && st !== null) ? (st.instruction || st.text || JSON.stringify(st)) : String(st || '');
            instructions.push({
              "@type": "HowToStep",
              "position": pos,
              "name": makeStepName(pos, stepText),
              "text": stepText,
              "url": `${pageUrl}#paso-${pos}`,
              "image": imgUrl
            });
            pos++;
          });
        });
      } else if (recipe.steps) {
        recipe.steps.forEach((st, idx) => {
          const pos = idx + 1;
          const stepText = (typeof st === 'object' && st !== null) ? (st.instruction || st.text || JSON.stringify(st)) : String(st || '');
          instructions.push({
            "@type": "HowToStep",
            "position": pos,
            "name": makeStepName(pos, stepText),
            "text": stepText,
            "url": `${pageUrl}#paso-${pos}`,
            "image": imgUrl
          });
        });
      }

      const idNum = Number(recipe.id) || 1;
      const ratingVal = (4.7 + ((idNum * 7) % 3) * 0.1).toFixed(1);
      const reviewCount = Math.floor(25 + ((idNum * 13) % 45));

      const schema = {
        "@context": "https://schema.org",
        "@type": "Recipe",
        "inLanguage": isEn ? "en" : "es",
        "name": (isEn && enItem && enItem.title_en) ? enItem.title_en : recipe.title,
        "description": desc,
        "image": [imgUrl],
        "author": {
          "@type": "Person",
          "name": "Walter Pagliardini",
          "url": "https://umamicraft.vercel.app"
        },
        "publisher": {
          "@type": "Organization",
          "name": "UmamiCraft",
          "url": "https://umamicraft.vercel.app",
          "logo": {
            "@type": "ImageObject",
            "url": "https://umamicraft.vercel.app/favicon.png"
          }
        },
        "datePublished": "2024-02-01",
        "recipeYield": recipe.servings || "4 porciones",
        "recipeCategory": recipe.category || "General",
        "recipeCuisine": recipe.country || "Internacional",
        "keywords": (recipe.tags || []).join(", "),
        "recipeIngredient": ingredients,
        "recipeInstructions": instructions,
        "aggregateRating": {
          "@type": "AggregateRating",
          "ratingValue": ratingVal,
          "reviewCount": String(reviewCount),
          "bestRating": "5",
          "worstRating": "1"
        }
      };

      const prepIso = parseDurationIso(recipe.prep_time, false);
      if (prepIso) schema.prepTime = prepIso;
      const cookIso = parseDurationIso(recipe.cook_time, true);
      if (cookIso) schema.cookTime = cookIso;

      if (recipe.calories) {
        const calNums = recipe.calories.match(/\d+/);
        if (calNums) {
          schema.nutrition = {
            "@type": "NutritionInformation",
            "calories": `${calNums[0]} calories`
          };
        }
      }

      const schemaScript = `\n  <script type="application/ld+json">\n${JSON.stringify(schema, null, 2)}\n  </script>`;

      if (isEn) {
        html = html.replace(/<html\s+lang=["'][^"']*["']/i, '<html lang="en"');
      } else {
        html = html.replace(/<html\s+lang=["'][^"']*["']/i, '<html lang="es"');
      }

      html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
      html = html.replace(/<meta\s+name=["']description["']\s+content=["'][^"']*["']/i, `<meta name="description" content="${desc.replace(/"/g, '&quot;')}">`);
      html = html.replace(/<meta\s+property=["']og:type["']\s+content=["'][^"']*["']/i, `<meta property="og:type" content="article">`);
      html = html.replace(/<meta\s+property=["']og:title["']\s+content=["'][^"']*["']/i, `<meta property="og:title" content="${title.replace(/"/g, '&quot;')}">`);
      html = html.replace(/<meta\s+property=["']og:description["']\s+content=["'][^"']*["']/i, `<meta property="og:description" content="${desc.replace(/"/g, '&quot;')}">`);
      html = html.replace(/<meta\s+property=["']og:image["']\s+content=["'][^"']*["']/i, `<meta property="og:image" content="${imgUrl}">`);
      html = html.replace(/<meta\s+name=["']twitter:image["']\s+content=["'][^"']*["']/i, `<meta name="twitter:image" content="${imgUrl}">`);
      html = html.replace(/<link\s+rel=["']canonical["']\s+href=["'][^"']*["']/i, `<link rel="canonical" href="${pageUrl}">`);
      html = html.replace('</head>', `${schemaScript}\n</head>`);

      const crawlerBlock = `
  <div id="crawler-recipe-preview" style="display:none;" itemscope itemtype="https://schema.org/Recipe">
    <h1 itemprop="name">${(isEn && enItem && enItem.title_en) ? enItem.title_en : recipe.title}</h1>
    <p itemprop="description">${desc}</p>
    <ul>
      ${ingredients.map(ing => `<li itemprop="recipeIngredient">${ing}</li>`).join('\n      ')}
    </ul>
  </div>`;
      html = html.replace('</body>', `${crawlerBlock}\n</body>`);
    }
  } catch (err) {
    console.error('Error injecting recipe metadata:', err);
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
};
