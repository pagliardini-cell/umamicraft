const fs = require('fs');
const path = require('path');

const charmap = {
  'ı': 'i', 'İ': 'i', 'ø': 'o', 'Ø': 'o', 'æ': 'ae', 'Æ': 'ae', 'œ': 'oe', 'Œ': 'oe', 'ß': 'ss',
  'ð': 'd', 'þ': 'th'
};

function makeSlug(title) {
  let t = String(title || '');
  for (const [k, v] of Object.entries(charmap)) t = t.replaceAll(k, v);
  return t.normalize('NFKD').replace(/[\u0300-\u036f]/g, '').toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}

function parseDurationIso(s) {
  if (!s) return null;
  let tot = 0;
  const hm = s.match(/(\d+)\s*(?:hora|hr|h)/i);
  const mm = s.match(/(\d+)\s*(?:min|m)/i);
  if (hm) tot += parseInt(hm[1], 10) * 60;
  if (mm) tot += parseInt(mm[1], 10);
  if (!hm && !mm) {
    const num = s.match(/\d+/);
    if (num) tot = parseInt(num[0], 10);
  }
  if (tot <= 0) return null;
  const hrs = Math.floor(tot / 60);
  const mins = tot % 60;
  let iso = 'PT';
  if (hrs > 0) iso += `${hrs}H`;
  if (mins > 0) iso += `${mins}M`;
  return iso !== 'PT' ? iso : null;
}

module.exports = (req, res) => {
  const querySlug = req.query.receta || req.query.r;
  const indexPath = path.join(process.cwd(), 'index.html');
  let html = fs.readFileSync(indexPath, 'utf8');

  if (!querySlug) {
    res.setHeader('Content-Type', 'text/html; charset=utf-8');
    return res.status(200).send(html);
  }

  try {
    const recipesPath = path.join(process.cwd(), 'recetas_pro.json');
    const recipes = JSON.parse(fs.readFileSync(recipesPath, 'utf8'));

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
      const title = `Receta de ${recipe.title} | UmamiCraft`;
      const desc = recipe.story ? recipe.story.slice(0, 155).trim() + '...' : 'Receta tradicional curada paso a paso en UmamiCraft.';
      const imgUrl = recipe.image.startsWith('http') ? recipe.image : `https://umamicraft.vercel.app/${recipe.image}`;
      const pageUrl = `https://umamicraft.vercel.app/receta/${foundSlug}`;

      const ingredients = [];
      if (recipe.ingredient_groups) {
        recipe.ingredient_groups.forEach(g => {
          if (g.items) ingredients.push(...g.items);
        });
      } else if (recipe.ingredients) {
        ingredients.push(...recipe.ingredients);
      }

      const instructions = [];
      if (recipe.step_groups) {
        let pos = 1;
        recipe.step_groups.forEach(sg => {
          const steps = sg.steps || sg.items || [];
          steps.forEach(st => {
            instructions.push({ "@type": "HowToStep", "position": pos++, "text": st });
          });
        });
      } else if (recipe.steps) {
        recipe.steps.forEach((st, idx) => {
          instructions.push({ "@type": "HowToStep", "position": idx + 1, "text": st });
        });
      }

      const schema = {
        "@context": "https://schema.org",
        "@type": "Recipe",
        "name": recipe.title,
        "description": desc,
        "image": [imgUrl],
        "recipeYield": recipe.servings || "4 porciones",
        "recipeCategory": recipe.category || "General",
        "recipeCuisine": recipe.country || "Internacional",
        "keywords": (recipe.tags || []).join(", "),
        "recipeIngredient": ingredients,
        "recipeInstructions": instructions
      };

      const prepIso = parseDurationIso(recipe.prep_time);
      if (prepIso) schema.prepTime = prepIso;
      const cookIso = parseDurationIso(recipe.cook_time);
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

      html = html.replace(/<title>[\s\S]*?<\/title>/i, `<title>${title}</title>`);
      html = html.replace(/<meta property="og:type" content="[^"]*">/i, `<meta property="og:type" content="article">`);
      html = html.replace(/<meta property="og:title" content="[^"]*">/i, `<meta property="og:title" content="${title}">`);
      html = html.replace(/<meta property="og:description" content="[^"]*">/i, `<meta property="og:description" content="${desc.replace(/"/g, '&quot;')}">`);
      html = html.replace(/<meta property="og:image" content="[^"]*">/i, `<meta property="og:image" content="${imgUrl}">`);
      html = html.replace(/<meta name="twitter:image" content="[^"]*">/i, `<meta name="twitter:image" content="${imgUrl}">`);
      html = html.replace(/<link rel="canonical" href="[^"]*">/i, `<link rel="canonical" href="${pageUrl}">`);
      html = html.replace('</head>', `${schemaScript}\n</head>`);
    }
  } catch (err) {
    console.error('Error injecting recipe metadata:', err);
  }

  res.setHeader('Content-Type', 'text/html; charset=utf-8');
  res.status(200).send(html);
};
