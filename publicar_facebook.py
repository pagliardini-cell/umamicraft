# -*- coding: utf-8 -*-
"""
=============================================================================
 UmamiCraft — Auto-Publicador Oficial para Facebook (Meta Graph API)
=============================================================================
Soporta publicaciones trilingües (Español, Inglés, Portugués) con links
específicos por idioma, foto HD (local o URL remota), hashtags del plato
específico (ej: #Tahini, #Milanesa, #Focaccia) y límite seguro de caracteres.
"""

import os
import sys
import json
import time
import argparse
import datetime
import unicodedata
import re
import urllib.request
import urllib.parse
from pathlib import Path

if sys.platform == "win32":
    try:
        sys.stdout.reconfigure(encoding="utf-8", errors="replace")
    except Exception:
        pass

CONFIG_FILE = "facebook_config.json"
HISTORIAL_FILE = "facebook_publicadas.json"
RECETAS_FILE = "recetas_pro.json"
BASE_URL = "https://umamicraft.vercel.app"

COUNTRY_FLAGS = {
    "Argentina": "🇦🇷", "Italia": "🇮🇹", "Japón": "🇯🇵", "Mexico": "🇲🇽", "México": "🇲🇽",
    "España": "🇪🇸", "Francia": "🇫🇷", "China": "🇨🇳", "Perú": "🇵🇪", "Chile": "🇨🇱",
    "Brasil": "🇧🇷", "Estados Unidos": "🇺🇸", "Reino Unido": "🇬🇧", "Grecia": "🇬🇷",
    "Turquía": "🇹🇷", "India": "🇮🇳", "Alemania": "🇩🇪", "Tailandia": "🇹🇭", "Vietnam": "🇻🇳",
    "Colombia": "🇨🇴", "Uruguay": "🇺🇾", "Paraguay": "🇵🇾", "Bolivia": "🇧🇴", "Venezuela": "🇻🇪",
    "Cuba": "🇨🇺", "Corea del Sur": "🇰🇷", "Marruecos": "🇲🇦", "Líbano": "🇱🇧", "Portugal": "🇵🇹",
    "Palestina": "🇵🇸", "Medio Oriente": "🌍"
}

_TRANSLATION_MEMO = {}

def clean_tag(s):
    if not s: return ""
    s = unicodedata.normalize("NFKD", str(s)).encode("ASCII", "ignore").decode("utf-8")
    s = re.sub(r"[^a-zA-Z0-9]", "", s)
    return s

def generar_hashtags(receta):
    tags_finales = []
    
    # 1. Nombre principal del plato (ej: #Tahini, #Focaccia, #Milanesa, #Panqueque)
    titulo_limpio = receta.get("title", "").split("(")[0].strip()
    palabras = [clean_tag(w) for w in titulo_limpio.split() if len(clean_tag(w)) >= 4]
    if palabras:
        tags_finales.append("#" + palabras[0])
        
    # 2. Tags propios de ingredientes y tipo de comida
    pais = clean_tag(receta.get("country", ""))
    for t in receta.get("tags", []):
        ct = clean_tag(t)
        if ct and len(ct) >= 4 and ct.lower() != pais.lower():
            ht = "#" + ct
            if ht not in tags_finales and len(tags_finales) < 5:
                tags_finales.append(ht)
                
    # 3. País
    if pais and ("#" + pais) not in tags_finales:
        tags_finales.append("#" + pais)
        
    # 4. Comunidad y alcance global
    tags_finales.extend(["#UmamiCraft", "#Recetas", "#Recipes", "#Receitas", "#FoodLovers"])
    return " ".join(tags_finales)

def traducir(texto, lang):
    if not texto or not str(texto).strip() or lang == "es":
        return texto
    key = f"{lang}:{texto}"
    if key in _TRANSLATION_MEMO:
        return _TRANSLATION_MEMO[key]
    try:
        url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl=es&tl=" + lang + "&dt=t&q=" + urllib.parse.quote(str(texto))
        req = urllib.request.Request(url, headers={"User-Agent": "Mozilla/5.0"})
        with urllib.request.urlopen(req, timeout=5) as resp:
            data = json.loads(resp.read().decode("utf-8"))
            traducido = "".join([x[0] for x in data[0] if x[0]])
            _TRANSLATION_MEMO[key] = traducido
            return traducido
    except Exception:
        return texto

def cargar_config():
    cfg = {"PAGE_ID": "", "PAGE_ACCESS_TOKEN": ""}
    if os.path.exists(CONFIG_FILE):
        try:
            with open(CONFIG_FILE, "r", encoding="utf-8") as f:
                cfg.update(json.load(f))
        except Exception:
            pass
    if os.environ.get("FB_PAGE_ID"):
        cfg["PAGE_ID"] = os.environ.get("FB_PAGE_ID")
    if os.environ.get("FB_PAGE_ACCESS_TOKEN"):
        cfg["PAGE_ACCESS_TOKEN"] = os.environ.get("FB_PAGE_ACCESS_TOKEN")
    return cfg

def cargar_historial():
    if os.path.exists(HISTORIAL_FILE):
        try:
            with open(HISTORIAL_FILE, "r", encoding="utf-8") as f:
                return json.load(f)
        except Exception:
            return []
    return []

def registrar_publicacion(receta_id, post_id, scheduled_time=None):
    historial = cargar_historial()
    entrada = {
        "receta_id": receta_id,
        "facebook_post_id": post_id,
        "fecha_registro": datetime.datetime.now().isoformat(),
        "programada_para": scheduled_time
    }
    historial.append(entrada)
    with open(HISTORIAL_FILE, "w", encoding="utf-8") as f:
        json.dump(historial, f, indent=2, ensure_ascii=False)

def recortar(texto, max_len=130):
    if not texto: return ""
    texto = texto.strip()
    if len(texto) <= max_len: return texto
    return texto[:max_len-3].rstrip() + "..."

def formatear_post_trilingue(receta):
    receta_id = receta.get("id")
    titulo_es = receta.get("title", "")
    pais = receta.get("country", "")
    bandera = COUNTRY_FLAGS.get(pais, "🌍")
    
    historia = receta.get("story", "")
    intro_es = ""
    if historia:
        frases = [s.strip() for s in historia.split(".") if s.strip()]
        intro_es = frases[0] + "." if frases else historia
    intro_es = recortar(intro_es, 120)
    
    titulo_en = traducir(titulo_es, "en")
    intro_en = traducir(intro_es, "en")
    titulo_pt = traducir(titulo_es, "pt")
    intro_pt = traducir(intro_es, "pt")
    
    link_es = f"{BASE_URL}/r/{receta_id}.html"
    link_en = f"{BASE_URL}/?r={receta_id}&lang=en"
    link_pt = f"{BASE_URL}/?r={receta_id}&lang=pt"
    
    texto = f"✨ UMAMICRAFT GLOBAL COLLECTION {bandera}\n\n"
    
    texto += f"🇪🇸 {titulo_es}\n"
    if intro_es: texto += f"{intro_es}\n"
    texto += f"👉 Receta: {link_es}\n\n"
    
    texto += f"🇺🇸 {titulo_en}\n"
    if intro_en: texto += f"{intro_en}\n"
    texto += f"👉 Recipe: {link_en}\n\n"
    
    texto += f"🇧🇷 {titulo_pt}\n"
    if intro_pt: texto += f"{intro_pt}\n"
    texto += f"👉 Receita: {link_pt}\n\n"
    
    # Hashtags específicos del plato + ingredientes + marca (<800 caracteres)
    texto += generar_hashtags(receta)
    
    return texto

def publicar_en_facebook(receta, config, scheduled_timestamp=None, dry_run=False):
    page_id = config.get("PAGE_ID", "").strip()
    token = config.get("PAGE_ACCESS_TOKEN", "").strip()
    
    receta_id = receta.get("id")
    titulo = receta.get("title")
    imagen_str = receta.get("image", "").strip()
    
    caption = formatear_post_trilingue(receta)
    
    is_url = imagen_str.startswith("http://") or imagen_str.startswith("https://")
    ruta_local = os.path.join(os.getcwd(), imagen_str) if (imagen_str and not is_url) else None
    has_local = ruta_local and os.path.exists(ruta_local)
    
    if dry_run:
        print(f"\n=======================================================")
        print(f" [DRY RUN] Receta #{receta_id}: {titulo}")
        print(f" Imagen: {'URL Remota' if is_url else ('Local' if has_local else 'No encontrada')}")
        print(f" Longitud: {len(caption)} caracteres")
        print(f"---------------- Texto --------------------------------")
        print(caption)
        print(f"=======================================================\n")
        return {"id": "dry_run_post_id"}
    
    if not page_id or not token:
        print("❌ Error: Falta configurar PAGE_ID o PAGE_ACCESS_TOKEN.")
        return None
        
    endpoint = f"https://graph.facebook.com/v21.0/{page_id}/photos"
    
    if is_url:
        data_dict = {"url": imagen_str, "caption": caption, "access_token": token}
        if scheduled_timestamp:
            data_dict["published"] = "false"
            data_dict["scheduled_publish_time"] = str(int(scheduled_timestamp))
        payload = urllib.parse.urlencode(data_dict).encode("utf-8")
        req = urllib.request.Request(endpoint, data=payload)
    elif has_local:
        boundary = "----UmamiCraftBoundary" + str(int(time.time()))
        body = bytearray()
        fields = {"caption": caption, "access_token": token}
        if scheduled_timestamp:
            fields["published"] = "false"
            fields["scheduled_publish_time"] = str(int(scheduled_timestamp))
        for k, v in fields.items():
            body.extend(f"--{boundary}\r\n".encode("utf-8"))
            body.extend(f'Content-Disposition: form-data; name="{k}"\r\n\r\n'.encode("utf-8"))
            body.extend(f"{v}\r\n".encode("utf-8"))
        filename = os.path.basename(ruta_local)
        content_type = "image/jpeg" if filename.lower().endswith((".jpg", ".jpeg")) else "image/png"
        with open(ruta_local, "rb") as img_f:
            body.extend(f"--{boundary}\r\n".encode("utf-8"))
            body.extend(f'Content-Disposition: form-data; name="source"; filename="{filename}"\r\n'.encode("utf-8"))
            body.extend(f"Content-Type: {content_type}\r\n\r\n".encode("utf-8"))
            body.extend(img_f.read())
            body.extend(b"\r\n")
        body.extend(f"--{boundary}--\r\n".encode("utf-8"))
        req = urllib.request.Request(endpoint, data=body)
        req.add_header("Content-Type", f"multipart/form-data; boundary={boundary}")
    else:
        feed_endpoint = f"https://graph.facebook.com/v21.0/{page_id}/feed"
        data_dict = {"message": caption, "access_token": token}
        if scheduled_timestamp:
            data_dict["published"] = "false"
            data_dict["scheduled_publish_time"] = str(int(scheduled_timestamp))
        payload = urllib.parse.urlencode(data_dict).encode("utf-8")
        req = urllib.request.Request(feed_endpoint, data=payload)

    try:
        with urllib.request.urlopen(req, timeout=30) as resp:
            resultado = json.loads(resp.read().decode("utf-8"))
            post_id = resultado.get("id") or resultado.get("post_id")
            print(f"✅ Receta #{receta_id} publicada con éxito en Facebook! Post ID: {post_id}")
            registrar_publicacion(receta_id, post_id, scheduled_time=scheduled_timestamp)
            return resultado
    except urllib.error.HTTPError as e:
        error_msg = e.read().decode("utf-8", errors="replace")
        print(f"❌ Error HTTP {e.code} al publicar receta #{receta_id}: {error_msg}")
        return None
    except Exception as e:
        print(f"❌ Error al publicar receta #{receta_id}: {e}")
        return None

def main():
    parser = argparse.ArgumentParser(description="Auto-publicador trilingüe de UmamiCraft en Facebook")
    parser.add_argument("--dry-run", action="store_true", help="Simula sin enviar nada")
    parser.add_argument("--test", action="store_true", help="Publica 1 receta pendiente")
    parser.add_argument("--receta", type=int, help="ID de receta puntual")
    parser.add_argument("--siguientes", type=int, default=10, help="Publicar las siguientes N recetas no publicadas (por defecto: 10)")
    parser.add_argument("--pausa", type=int, default=10, help="Segundos de pausa anti-spam")
    
    args = parser.parse_args()
    config = cargar_config()
    
    if not os.path.exists(RECETAS_FILE):
        print(f"❌ No se encontró {RECETAS_FILE}")
        return
        
    with open(RECETAS_FILE, "r", encoding="utf-8") as f:
        recetas = json.load(f)
        
    historial = cargar_historial()
    publicadas_ids = {entry["receta_id"] for entry in historial}
    
    if args.receta:
        receta = next((r for r in recetas if r.get("id") == args.receta), None)
        if not receta:
            print(f"❌ Receta #{args.receta} no encontrada")
            return
        publicar_en_facebook(receta, config, dry_run=args.dry_run)
        return
        
    if args.test:
        candidata = next((r for r in recetas if r.get("id") not in publicadas_ids), None)
        if not candidata:
            print("✨ ¡Todas las recetas ya fueron publicadas!")
            return
        publicar_en_facebook(candidata, config, dry_run=args.dry_run)
        return

    pendientes = [r for r in recetas if r.get("id") not in publicadas_ids]
    if not pendientes:
        print("✨ ¡Felicitaciones! Todas las recetas del catálogo ya fueron publicadas en Facebook.")
        return
        
    lote = pendientes[:args.siguientes]
    print(f"🚀 Publicando las siguientes {len(lote)} recetas pendientes en Facebook (trilingües con hashtags específicos)...")
    print(f"📊 Restantes en el catálogo: {len(pendientes) - len(lote)} recetas.")
    print(f"⏱️ Pausa anti-spam: {args.pausa}s entre publicaciones.\n")
    
    for idx, r in enumerate(lote):
        print(f"[{idx+1}/{len(lote)}] Publicando #{r.get('id')}: {r.get('title')}...")
        publicar_en_facebook(r, config, dry_run=args.dry_run)
        if not args.dry_run and idx < len(lote) - 1:
            print(f"   ⏳ Esperando {args.pausa}s antes de la siguiente para cuidar la cuenta...")
            time.sleep(args.pausa)
            
    print("\n🎉 ¡Lote de hoy completado con éxito en Facebook!")

if __name__ == "__main__":
    main()
