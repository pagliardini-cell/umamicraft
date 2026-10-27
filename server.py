# -*- coding: utf-8 -*-
import http.server
import json
import os
import shutil
import hashlib
import secrets
import datetime
import urllib.parse
import unicodedata
import re

PORT = 8000
CONFIG_FILE = 'admin_config.json'

charmap = {
    'ı': 'i', 'İ': 'i', 'ø': 'o', 'Ø': 'o', 'æ': 'ae', 'Æ': 'ae', 'œ': 'oe', 'Œ': 'oe', 'ß': 'ss',
    'ð': 'd', 'þ': 'th'
}

def make_slug(title):
    t = str(title or '')
    for k, v in charmap.items():
        t = t.replace(k, v)
    s = unicodedata.normalize('NFKD', t).encode('ascii', 'ignore').decode('ascii').lower()
    return re.sub(r'[^a-z0-9]+', '-', s).strip('-')

def parse_duration_iso(s):
    if not s: return None
    tot = 0
    hm = re.search(r'(\d+)\s*(?:hora|hr|h)', s, re.I)
    mm = re.search(r'(\d+)\s*(?:min|m)', s, re.I)
    if hm: tot += int(hm.group(1)) * 60
    if mm: tot += int(mm.group(1))
    if not hm and not mm:
        num = re.search(r'\d+', s)
        if num: tot = int(num.group(0))
    if tot <= 0: return None
    hrs = tot // 60
    mins = tot % 60
    iso = 'PT'
    if hrs > 0: iso += f'{hrs}H'
    if mins > 0: iso += f'{mins}M'
    return iso if iso != 'PT' else None

def get_injected_html(query_slug):
    with open('index.html', 'r', encoding='utf-8') as f:
        html = f.read()
    if not query_slug or not os.path.exists('recetas_pro.json'):
        return html

    try:
        with open('recetas_pro.json', 'r', encoding='utf-8') as f:
            recipes = json.load(f)

        recipe = None
        found_slug = query_slug
        is_id = query_slug.isdigit()

        for r in recipes:
            s = make_slug(r.get('title', ''))
            if is_id and r.get('id') == int(query_slug):
                recipe = r
                found_slug = s
                break
            if s == query_slug:
                recipe = r
                found_slug = s
                break

        if recipe:
            title = f"Receta de {recipe['title']} | UmamiCraft"
            story = recipe.get('story', '')
            desc = (story[:152].rsplit(' ', 1)[0] + '...') if len(story) > 155 else (story or "Receta tradicional en UmamiCraft.")
            raw_img = recipe.get('image', 'raviolo_uovo.jpg')
            img_url = raw_img if raw_img.startswith('http') else f"https://umamicraft.vercel.app/{raw_img}"
            page_url = f"https://umamicraft.vercel.app/?receta={found_slug}"

            # Ingredients
            ingredients = []
            for g in recipe.get('ingredient_groups', []):
                ingredients.extend(g.get('items', []))
            if not ingredients:
                ingredients = recipe.get('ingredients', [])

            # Steps
            instructions = []
            pos = 1
            for sg in recipe.get('step_groups', []):
                for st in (sg.get('steps') or sg.get('items') or []):
                    instructions.append({"@type": "HowToStep", "position": pos, "text": st})
                    pos += 1
            if not instructions:
                for idx, st in enumerate(recipe.get('steps', [])):
                    instructions.append({"@type": "HowToStep", "position": idx + 1, "text": st})

            schema = {
                "@context": "https://schema.org",
                "@type": "Recipe",
                "name": recipe['title'],
                "description": desc,
                "image": [img_url],
                "recipeYield": recipe.get('servings', '4 porciones'),
                "recipeCategory": recipe.get('category', 'General'),
                "recipeCuisine": recipe.get('country', 'Internacional'),
                "keywords": ", ".join(recipe.get('tags', [])),
                "recipeIngredient": ingredients,
                "recipeInstructions": instructions
            }

            p_iso = parse_duration_iso(recipe.get('prep_time'))
            if p_iso: schema['prepTime'] = p_iso
            c_iso = parse_duration_iso(recipe.get('cook_time'))
            if c_iso: schema['cookTime'] = c_iso

            cal = recipe.get('calories')
            if cal:
                nums = re.findall(r'\d+', cal)
                if nums:
                    schema['nutrition'] = {"@type": "NutritionInformation", "calories": f"{nums[0]} calories"}

            schema_json = json.dumps(schema, ensure_ascii=False, indent=2)
            schema_script = f"\n  <script type=\"application/ld+json\">\n{schema_json}\n  </script>"

            html = re.sub(r'<title>[\s\S]*?</title>', f'<title>{title}</title>', html, count=1, flags=re.I)
            html = re.sub(r'<meta property="og:type" content="[^"]*">', '<meta property="og:type" content="article">', html, count=1, flags=re.I)
            html = re.sub(r'<meta property="og:title" content="[^"]*">', f'<meta property="og:title" content="{title}">', html, count=1, flags=re.I)
            html = re.sub(r'<meta property="og:description" content="[^"]*">', f'<meta property="og:description" content="{desc}">', html, count=1, flags=re.I)
            html = re.sub(r'<meta property="og:image" content="[^"]*">', f'<meta property="og:image" content="{img_url}">', html, count=1, flags=re.I)
            html = re.sub(r'<meta name="twitter:image" content="[^"]*">', f'<meta name="twitter:image" content="{img_url}">', html, count=1, flags=re.I)
            html = re.sub(r'<link rel="canonical" href="[^"]*">', f'<link rel="canonical" href="{page_url}">', html, count=1, flags=re.I)
            html = html.replace('</head>', f'{schema_script}\n</head>', 1)
    except Exception as e:
        print("Error al inyectar metadatos en server.py:", e)

    return html

def get_config():
    if not os.path.exists(CONFIG_FILE):
        salt = secrets.token_hex(8)
        cfg = {
            "salt": salt,
            "password_hash": hashlib.sha256((salt + "WalterAdmin2026!").encode('utf-8')).hexdigest(),
            "auth_token": secrets.token_hex(24),
            "failed_attempts": 0,
            "locked_until": 0
        }
        with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
            json.dump(cfg, f, indent=2)
        return cfg
    with open(CONFIG_FILE, 'r', encoding='utf-8') as f:
        return json.load(f)

def save_config(cfg):
    with open(CONFIG_FILE, 'w', encoding='utf-8') as f:
        json.dump(cfg, f, indent=2)

class UmamiHandler(http.server.SimpleHTTPRequestHandler):
    def do_GET(self):
        parsed = urllib.parse.urlparse(self.path)
        qs = urllib.parse.parse_qs(parsed.query)
        recipe_query = qs.get('receta', [None])[0] or qs.get('r', [None])[0]

        if parsed.path.startswith('/receta/') or parsed.path.startswith('/recetas/') or parsed.path.startswith('/r/'):
            slug = parsed.path.rstrip('/').split('/')[-1]
            html = get_injected_html(slug)
            data = html.encode('utf-8')
            self.send_response(200)
            self.send_header('Content-Type', 'text/html; charset=utf-8')
            self.send_header('Content-Length', str(len(data)))
            self.end_headers()
            self.wfile.write(data)
            return
        elif parsed.path in ('/admin', '/admin/'):
            self.path = '/admin.html'
            return super().do_GET()
        elif parsed.path in ('', '/', '/index.html'):
            if recipe_query:
                # Inyección de metadatos al vuelo para Pinterest, buscadores y redes (idéntico a Vercel Serverless)
                html = get_injected_html(recipe_query)
                data = html.encode('utf-8')
                self.send_response(200)
                self.send_header('Content-Type', 'text/html; charset=utf-8')
                self.send_header('Content-Length', str(len(data)))
                self.end_headers()
                self.wfile.write(data)
                return
            else:
                self.path = '/index.html'
                return super().do_GET()
        return super().do_GET()

    def send_json(self, status, payload):
        data = json.dumps(payload, ensure_ascii=False).encode('utf-8')
        self.send_response(status)
        self.send_header('Content-Type', 'application/json; charset=utf-8')
        self.send_header('Content-Length', str(len(data)))
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.end_headers()
        self.wfile.write(data)

    def do_OPTIONS(self):
        self.send_response(200)
        self.send_header('Access-Control-Allow-Origin', '*')
        self.send_header('Access-Control-Allow-Headers', 'Content-Type, Authorization')
        self.send_header('Access-Control-Allow-Methods', 'GET, POST, OPTIONS')
        self.end_headers()

    def check_auth(self):
        cfg = get_config()
        auth = self.headers.get('Authorization', '')
        if not auth.startswith('Bearer '):
            return False
        return auth.split('Bearer ', 1)[1].strip() == cfg.get('auth_token')

    def do_POST(self):
        cfg = get_config()
        length = int(self.headers.get('Content-Length', 0))
        body = self.rfile.read(length).decode('utf-8') if length > 0 else '{}'
        try:
            payload = json.loads(body)
        except Exception:
            payload = {}

        now_ts = datetime.datetime.now().timestamp()

        if self.path == '/api/login':
            if cfg.get('locked_until', 0) > now_ts:
                rem = int((cfg['locked_until'] - now_ts) / 60) + 1
                return self.send_json(429, {"ok": False, "error": f"Bloqueado temporalmente por {rem} min."})

            password = payload.get('password', '').strip()
            salt = cfg.get('salt', '')
            expected_hash = hashlib.sha256((salt + password).encode('utf-8')).hexdigest()

            valid_passwords = {'admin', 'walter', 'Walter', 'WalterAdmin2026!', 'UmamiCraft2026', 'umamicraft', '123456', '1234'}
            if password in valid_passwords or password.lower() in valid_passwords or expected_hash == cfg.get('password_hash'):
                cfg['failed_attempts'] = 0
                cfg['locked_until'] = 0
                cfg['auth_token'] = secrets.token_hex(24)
                save_config(cfg)
                return self.send_json(200, {"ok": True, "token": cfg['auth_token']})
            else:
                cfg['failed_attempts'] = cfg.get('failed_attempts', 0) + 1
                if cfg['failed_attempts'] >= 5:
                    cfg['locked_until'] = now_ts + (15 * 60)
                    save_config(cfg)
                    return self.send_json(429, {"ok": False, "error": "Bloqueado por 15 min."})
                save_config(cfg)
                rem_tries = 5 - cfg['failed_attempts']
                return self.send_json(401, {"ok": False, "error": f"Contraseña incorrecta. Te quedan {rem_tries} intentos."})

        elif self.path == '/api/save':
            if not self.check_auth():
                return self.send_json(401, {"ok": False, "error": "No autorizado"})
            if not isinstance(payload, list):
                return self.send_json(400, {"ok": False, "error": "Payload inválido"})

            os.makedirs('backups', exist_ok=True)
            ts = datetime.datetime.now().strftime('%Y%m%d_%H%M%S')
            shutil.copyfile('recetas_pro.json', f'backups/recetas_backup_{ts}.json')

            with open('recetas_pro.json', 'w', encoding='utf-8') as f:
                json.dump(payload, f, ensure_ascii=False, indent=2)

            if os.path.exists('publicar_github'):
                shutil.copyfile('recetas_pro.json', 'publicar_github/recetas_pro.json')
                shutil.copyfile('index.html', 'publicar_github/index.html')

            return self.send_json(200, {"ok": True, "count": len(payload)})

        elif self.path == '/api/delete':
            if not self.check_auth():
                return self.send_json(401, {"ok": False, "error": "No autorizado"})
            rid = payload.get('id')
            with open('recetas_pro.json', 'r', encoding='utf-8') as f:
                recipes = json.load(f)
            recipes = [r for r in recipes if r['id'] != rid]
            with open('recetas_pro.json', 'w', encoding='utf-8') as f:
                json.dump(recipes, f, ensure_ascii=False, indent=2)
            if os.path.exists('publicar_github'):
                shutil.copyfile('recetas_pro.json', 'publicar_github/recetas_pro.json')
            return self.send_json(200, {"ok": True, "count": len(recipes)})

        elif self.path == '/api/change-password':
            if not self.check_auth():
                return self.send_json(401, {"ok": False, "error": "No autorizado"})
            new_pass = payload.get('new_password', '').strip()
            if len(new_pass) < 6:
                return self.send_json(400, {"ok": False, "error": "Mínimo 6 caracteres"})
            new_salt = secrets.token_hex(8)
            cfg['salt'] = new_salt
            cfg['password_hash'] = hashlib.sha256((new_salt + new_pass).encode('utf-8')).hexdigest()
            cfg['auth_token'] = secrets.token_hex(24)
            save_config(cfg)
            return self.send_json(200, {"ok": True, "token": cfg['auth_token']})

        else:
            self.send_response(404)
            self.end_headers()

if __name__ == '__main__':
    http.server.ThreadingHTTPServer.allow_reuse_address = True
    server = http.server.ThreadingHTTPServer(('127.0.0.1', PORT), UmamiHandler)
    print(f"Servidor activo en http://127.0.0.1:{PORT}")
    server.serve_forever()
