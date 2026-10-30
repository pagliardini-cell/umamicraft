# UmamiCraft 🍳✨

> **Colección Gastronómica & Cocktails de Autor** • Cocina Internacional Auténtica  
> Plataforma web gastronómica y **Progressive Web App (PWA)** de alto rendimiento, optimizada para Google Search Console, Google Analytics 4, protocolo IndexNow, Pinterest Business RSS multilingüe y administración en tiempo real.

---

## 🌟 Novedades y Características Principales

### 🍽️ 1. Catálogo Gastronómico Internacional en Constante Expansión
* **🍜 Gran Colección Canónica de Ramen Japonés:** Cobertura exhaustiva de estilos regionales auténticos con caldos tradicionales (*Tonkotsu, Shoyu, Miso, Shio, Tsukemen, Champon, Abura Soba, Tantanmen, Kitakata, Iekei, Asahikawa, Morioka Reimen, Onomichi, Tokushima, Wakayama, Kumamoto, Toyama Black, Sakata*, entre otros).
* **🦐 Recetas de Autor:** Creaciones culinarias propias y técnicas contemporáneas (*Camarones al Papel Aluminio en Sartén con Mozzarella, Yemas de Huevo Curadas, Guiso de Lentejas Criollo de Autor*, entre otras).
* **🍞 Panadería & Masas Artesanales:** *Focaccia Genovese Clásica sin Amasado (Ligur)* con fermentación en frío, salmuera de oliva virgen extra y sal marina en escamas.
* **🧀 Opciones Saludables & Proteicas con Queso Cottage:** Pastas cremosas con albahaca fresca sin crema pesada, tostadas de masa madre con palta y huevo, y panqueques esponjosos de avena y frutos rojos.
* **🍔 Sándwiches & Hamburguesas de Culto del Mundo:** *Wisconsin Butter Burger, Oklahoma Onion Smash, Patty Melt, White Castle Slider, Bánh Mì vietnamita, Francesinha de Oporto, Chivito uruguayo, Tamago Sando japonés, Vada Pav indio, Torta Ahogada mexicana, Bocadillo de calamares madrileño, Fischbrötchen de Hamburgo, Reuben neoyorquino, Panino con Porchetta romano, Sándwich de Vacío argentino, Kebab Adana*, entre otros.
* **🍸 Coctelería de Autor & Clásicos:** Fichas de coctelería con cristalería adecuada, tipo de hielo y medidas precisas en ml/oz.
* **📋 Ficha Técnica Culinaria Completa:** Tiempos precisos (preparación, cocción, reposo), temperaturas, porciones dinámicas escalables, cálculo calórico y etiquetas dietarias (*Sin Gluten, Keto, Vegetariano, Alto en Proteína*).

---

### 📱 2. Progressive Web App (PWA) & Experiencia Móvil
* **Instalable como App Nativa:** En Android (Chrome/Edge) y iPhone/iPad (Safari vía «Agregar a Inicio»). Abre a pantalla completa en modo `standalone` sin barra del navegador.
* **Iconos de Marca en Alta Resolución:** Iconos adaptativos `icon-192.png`, `icon-512.png`, `apple-touch-icon.png` y `favicon.png` diseñados para pantallas Retina y AMOLED.
* **Soporte Offline Completo (`sw.js`):** El Service Worker almacena en caché la interfaz y las recetas consultadas para que la app funcione sin conexión en el supermercado o cocina.
* **Atajos Rápidos de Pantalla de Inicio:** Accesos directos a *Lista de Compras*, *Recetas Favoritas* y *Receta al Azar*.
* **Modo Cocina (Screen Wake Lock API):** Evita que la pantalla del móvil se apague mientras se cocina.

---

### 🛒 3. Lista de Compras Inteligente
* **Agregar Ingredientes con 1 Clic:** Botón para sumar todos los ingredientes de una receta escalados a las porciones elegidas, o botones individuales `🛒+` para sumar solo los ingredientes faltantes.
* **Multi-Receta & Agrupación:** Agrupa los ingredientes por plato si planeas cocinar varias recetas.
* **Checklist Interactivo:** Permite tachar productos en el supermercado a medida que se compran.
* **🟢 Enviar a WhatsApp:** Genera un mensaje formateado con viñetas `◻️` y `✅` listo para enviar por WhatsApp a ti mismo o a familiares.
* **Persistencia Local:** Los artículos se guardan de forma privada en el dispositivo (`localStorage`).

---

### 📈 4. Analítica, Métricas & SEO de Nueva Generación
* **Google Analytics 4 Oficial (`G-WEF6K9K64Q`):** Medición de tráfico en tiempo real, páginas más vistas, países de procedencia y eventos de navegación.
* **Vercel Web Analytics:** Telemetría nativa de rendimiento y visitantes sin cookies.
* **Protocolo IndexNow (Bing, Yandex, Seznam, Naver):** Envío masivo automatizado de URLs multilingües (español, inglés y portugués + portadas) para indexación inmediata.
* **Google Sitelinks Searchbox:** Estructura de datos Schema.org (`WebSite` + `SearchAction`) para integrar el buscador de UmamiCraft directamente en los resultados de Google.
* **Sitemaps XML Multilingües:** `sitemap.xml` (índice maestro), `sitemap-es.xml`, `sitemap-en.xml` y `sitemap-pt.xml` con atributos `hreflang`.
* **Protección de Rastreo (`robots.txt`):** Directivas `Disallow: /admin` para concentrar el 100% de la cuota de rastreo (*Crawl Budget*) en las recetas públicas.

---

### 📌 5. Sindicación en Pinterest Business (3 Idiomas)
* **Feeds RSS Dedicados para Auto-Publicación:**
  * 🇪🇸 **Español:** `https://umamicraft.vercel.app/feed.xml` *(o `/feed-es.xml`)*
  * 🇬🇧 **Inglés:** `https://umamicraft.vercel.app/feed-en.xml`
  * 🇧🇷 **Portugués:** `https://umamicraft.vercel.app/feed-pt.xml`
* **Especificación Optimizada:** Orden cronológico inverso, etiquetas `<enclosure>` y `<media:content>` de imagen, descripciones enriquecidas con CDATA y fechas RFC 822.
* **Cargas Masivas (CSV):** Archivos de catálogo generados automáticamente para Pinterest en los 3 idiomas.

---

### ⚙️ 6. Sistema de Automatización & Activadores Locales
* **File Watcher en Tiempo Real (`server.py`):** Detecta automáticamente cualquier edición directa en `recetas_pro.json` y ejecuta la compilación del catálogo sin intervención manual.
* **Activador Maestro (`actualizar.bat` / `actualizar_catalogo.py`):**
  1. Valida la integridad sintáctica del JSON.
  2. Crea un backup fechado en `backups/`.
  3. Sincroniza archivos hacia `publicar_github/`.
  4. Regenera sitemaps multilingües, feeds RSS de Pinterest y páginas estáticas.
  5. Notifica automáticamente a IndexNow.

---

## 📂 Estructura del Proyecto

```text
├── api/
│   ├── index.js                   # Serverless SSR en Vercel (OpenGraph & Schema.org dinámico)
│   └── indexnow.js                # Serverless Endpoint para notificaciones de IndexNow
├── index.html                     # Aplicación web pública y PWA (SPA interactiva)
├── admin.html                     # Panel de control, editor visual y métricas (SHA-256)
├── recetas_pro.json               # Base de datos maestra de recetas curadas
├── manifest.json                  # Manifiesto oficial PWA para instalación móvil
├── sw.js                          # Service Worker para funcionamiento offline y caché
├── icon-192.png / icon-512.png    # Iconos oficiales de la aplicación
├── apple-touch-icon.png           # Icono para dispositivos iOS / iPadOS
├── feed*.xml                      # Feeds RSS multilingües para Pinterest (ES, EN, PT)
├── sitemap*.xml                   # Sitemaps XML multilingües (Maestro, ES, EN, PT)
├── robots.txt                     # Instrucciones de rastreo optimizadas
├── vercel.json                    # Configuración de rutas limpias, rewrites y caché
├── actualizar_catalogo.py         # Script maestro de compilación y sincronización
├── actualizar.bat                 # Ejecutable de 1 clic para Windows
├── notificar_indexnow.py          # Script cliente de envío a la API de IndexNow
└── server.py                      # Servidor backend de desarrollo con File Watcher
```

---

## 🛠️ Despliegue en Producción
* **URL Pública:** [https://umamicraft.vercel.app/](https://umamicraft.vercel.app/)
* **Repositorio GitHub:** [https://github.com/pagliardini-cell/umamicraft](https://github.com/pagliardini-cell/umamicraft)
* Para actualizar la web en producción, subir el contenido de la carpeta [`publicar_github/`](file:///c:/Users/Walter/Desktop/mis%20recetas/publicar_github/) a la rama principal de GitHub. Vercel desplegará los cambios en 30 segundos de forma 100% gratuita.
