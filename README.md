# UmamiCraft 🍳✨

> **Colección Gastronómica & Cocktails de Autor** • Catálogo de **303 Recetas Curadas del Mundo**  
> Plataforma web gastronómica de alto rendimiento, optimizada para SEO, Pinterest Rich Pins, soporte multilingüe y administración en tiempo real.

---

## 🌟 Novedades y Características Principales

### 🍽️ 1. Catálogo de 303 Recetas Icónicas
* **Trilogía Proteica & Saludable con Queso Cottage (#301, #302, #303):**
  * **Pasta con Salsa Cremosa de Queso Cottage y Albahaca (#301 - Italia):** Salsa aterciopelada y ligera que reemplaza la crema de leche, logrando alta proteína con emulsión de agua de cocción y parmesano.
  * **Tostada de Masa Madre con Queso Cottage, Palta y Huevo (#302 - Australia):** Desayuno/brunch gourmet con pan de masa madre crujiente, base abundante de cottage, láminas de palta hass, huevo a la plancha de yema tierna y lluvia de semillas tostadas.
  * **Panqueques Esponjosos de Cottage y Avena (#303 - Estados Unidos):** Dulces, esponjosos, sin harinas refinadas ni manteca, licuados con avena y decorados con miel pura y frutos rojos.
* **Hito #300:** *Pollo Frito Estilo Kentucky KFC con su fórmula secreta de 11 hierbas y especias (Estados Unidos)* con técnica de doble rebozado (*double dredge*) y marinado en buttermilk.
* **Sándwich de Kebab a la Parrilla (#293):** Cilindros de carne especiada estilo Adana en baguette artesanal con semillas, cebollas moradas al sumac, pepinillos encurtidos y salsa blanca cremosa.
* **Colección de Sándwiches & Hamburguesas de Culto:** *Wisconsin Butter Burger, Oklahoma Onion Smash, Patty Melt, Slider White Castle, Bánh Mì vietnamita, Francesinha de Oporto, Chivito uruguayo, Tamago Sando japonés, Vada Pav indio, Torta Ahogada mexicana, Bocadillo de calamares de Madrid, Fischbrötchen de Hamburgo, Reuben neoyorquino, Panino con Porchetta romano, Sándwich de Vacío argentino*, entre otros.
* **Coctelería de Autor & Clásicos:** Tragos reales con cristalería, tipo de hielo y medidas precisas en ml/oz.
* **Ficha Técnica Completa:** Tiempos detallados (prep, cocción, reposo), temperaturas, porciones, calorías y etiquetas dietarias.

---

### 🚀 2. Arquitectura Técnica & Rendimiento
* **Zero Bloat (Single Page Application Limpia):** Toda la aplicación corre sobre un único `index.html` hiper optimizado sin generar cientos de archivos HTML redundantes en disco.
* **Serverless On-The-Fly (`api/index.js`):** Inyección dinámica de metadatos Open Graph y Schema.org (`@type: "Recipe"`) al vuelo mediante funciones serverless en Vercel para rutas limpias `/receta/:slug`.
* **Carga Progresiva Inteligente:** Para evitar la descarga simultánea e innecesaria de imágenes, el index carga por lotes de **24 recetas** con el botón interactivo *"🍽️ Mostrar más recetas (+24)"*, logrando una carga instantánea y ultra liviana en dispositivos móviles.
* **Rutas Limpias con Base Absoluta:** Integración de `<base href="/">` y resolución de enlaces profundos para que cualquier URL directa abra la receta inmediatamente sin pantallas de espera.
* **Navegación al Home:** Clic en el logo `UmamiCraft` reinicia filtros y vuelve a la portada de forma fluida.

---

### 📌 3. Motor de Viralización en Pinterest & SEO
* **Rich Pins de Receta 100% Verificados:** Validados en MadeToSpark y Pinterest Crawler. Muestran ingredientes, tiempos en formato ISO 8601 y porciones en la tarjeta de Pinterest.
* **Carga Masiva (Bulk Upload) en 3 Idiomas:**
  * 🇪🇸 **Español:** `pinterest_pins_all.csv` (303), `lote_1.csv` (150) y `lote_2.csv` (153)
  * 🇺🇸 **Inglés:** `pinterest_pins_en_all.csv` (303), `lote_1.csv` (150) y `lote_2.csv` (153) con `?lang=en`
  * 🇧🇷 **Portugués:** `pinterest_pins_pt_all.csv` (303), `lote_1.csv` (150) y `lote_2.csv` (153) con `?lang=pt`
* **Publicación Automática vía RSS:** Feed gastronómico validado en `https://umamicraft.vercel.app/feed.xml`.
* **Verificación de Dominio:** Doble verificación implementada mediante meta tag en `<head>` y archivo estático `pinterest-e7b92.html`.
* **Sitemaps Multilingües:** `sitemap.xml` (índice maestro), `sitemap-es.xml`, `sitemap-en.xml` y `sitemap-pt.xml` con 304 URLs cada uno (Home + 303 recetas) y `robots.txt` optimizado.

---

### 🌐 4. Experiencia de Usuario (UX)
* **Traducción Instantánea (ES / EN / PT):** Selector de banderas nativo en el header con protección contra traducción errónea (`class="notranslate"`).
* **Escalador Dinámico de Porciones:** Control interactivo `[-] 4 porciones [+]` que recalcula cantidades de ingredientes en tiempo real, soportando fracciones, números mixtos, rangos y decimales.
* **Checklist Interactivo:** Marcador de ingredientes comprados y pasos de preparación completados guardados en `localStorage`.
* **Modo Cocina (Screen Wake Lock API):** Evita que la pantalla del móvil o tablet se apague mientras se manipulan alimentos.
* **Modo Oscuro / Claro:** Detección automática y persistencia de preferencias.
* **Herramientas de Difusión:** Botones integrados para WhatsApp, Pinterest, Telegram, X (Twitter) y Facebook con enlaces profundos.

---

### 🔐 5. Panel de Control & Acceso Secreto `π` (Admin CMS)
* **Autenticación Criptográfica:** Protección con SHA-256 y salt `9c95224ab0c1d474`.
* **Métricas Geográficas Avanzadas:**
  * **Presencia por Continentes:** Europa, América, Asia & Oceanía, Medio Oriente & África.
  * **Top 10 Países Líderes:** Ranking con medallas (🥇, 🥈, 🥉), banderas nacionales y barras porcentuales.
  * **Atlas de 44 Países:** Tarjetas interactivas que al hacer clic filtran el listado de recetas por ese país.
* **Edición Rápida al Vuelo `π`:** 
  * Botón discreto `π` en el pie de página para ir a `admin.html`.
  * Botón `π` en cada tarjeta del menú y en la esquina inferior izquierda de cada receta abierta: solicita la contraseña de administrador y abre directamente el editor visual de esa receta sin salir de la vista pública.
* **Copias de Seguridad:** Exportación e importación de la base de datos completa en JSON.

---

## 📂 Estructura del Proyecto

```text
├── api/
│   └── index.js                   # Serverless function Vercel (Dynamic OpenGraph & Schema.org)
├── images/                        # Fotografías gastronómicas en alta definición
├── index.html                     # Aplicación web pública (SPA, 300 recetas)
├── admin.html                     # Panel de control y métricas avanzadas (SHA-256)
├── recetas_pro.json               # Base de datos maestra (300 recetas curadas)
├── feed.xml                       # Feed RSS para autopublicación en Pinterest
├── sitemap.xml                    # Índice maestro de sitemaps
├── sitemap-es.xml                 # Sitemap en Español (301 URLs)
├── sitemap-en.xml                 # Sitemap en Inglés (301 URLs)
├── sitemap-pt.xml                 # Sitemap en Portugués (301 URLs)
├── robots.txt                     # Instrucciones de indexación para buscadores
├── vercel.json                    # Rutas limpias (/receta/:slug y /admin)
├── pinterest-e7b92.html           # Verificación oficial de dominio en Pinterest
├── pinterest_pins_*.csv           # Archivos masivos de carga para Pinterest (ES, EN, PT)
└── server.py                      # Servidor backend de desarrollo local
```

---

## 🛠️ Despliegue en Producción
* **Vercel:** `https://umamicraft.vercel.app/`
* **GitHub Pages:** `https://pagliardini-cell.github.io/umamicraft/`
* Para actualizar producción, sincronizar el contenido de `publicar_github/` con la rama principal del repositorio.
