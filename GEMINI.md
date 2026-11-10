# PROTOCOLO EDITORIAL Y DE ESTILO PERMANENTE (MIS RECETAS)

Este documento establece las reglas obligatorias e inmutables para la creación, edición y catalogación de recetas en este proyecto.

---

## 1. Reglas Estrictas para Títulos de Recetas

1. **Estructura fija obligatoria:**
   `Nombre del Plato (País)`
   - El paréntesis final contiene **ÚNICAMENTE** el nombre del país (ej: `(Argentina)`, `(Japón)`, `(Paraguay)`, `(Venezuela)`).

2. **Prohibición expresa en títulos:**
   - **JAMÁS** incluir palabras como: *"Tradicional"*, *"Tradicionales"*, *"Clásico"*, *"Auténtico"*, *"Receta Fácil"*, *"Cómo hacer"*, *"Paso a paso"* en el título principal.
   - El título debe ser limpio, corto, sobrio y directo al grano culinario.
   - **Ejemplos correctos:**
     - `Pastel Mandi'o - Empanadas de Mandioca (Paraguay)`
     - `Arepas Caseras de Maíz (Venezuela)`
     - `Roti - Pan Plano en Sartén (India)`
     - `Okonomiyaki de Osaka a la Plancha (Japón)`
     - `Rogan Josh de Cordero (India)`
     - `Empanadas de Pino (Chile)`
     - `Bizcochuelo Esponjoso de Vainilla (Argentina)`
   - **Ejemplos INCORRECTOS (prohibidos):**
     - ❌ `Pastel Mandi'o Tradicional Paraguayo (Paraguay)`
     - ❌ `Arepas Tradicionales de Masa Casera (Venezuela)`
     - ❌ `Roti Tradicional sin Horno (India)`

3. **Ubicación de palabras clave SEO:**
   - Todas las palabras de búsqueda ("tradicional", "sin horno", "en sartén", "receta fácil", "paso a paso", "cómo hacer") van **EXCLUSIVAMENTE** a:
     - `tags`: lista de términos para los motores de búsqueda y filtros.
     - `story`: reseña histórica y cultural del plato.
     - `notes`: consejos culinarios y secretos del chef.
   - De este modo, Google indexa y posiciona la receta con máxima fuerza sin afear el título visible para el usuario.

---

## 2. Reglas Estrictas para Fotografías

1. **Formato apaisado obligatorio (16:9 o 4:3 horizontal):**
   - La referencia definitiva es la foto de las **Empanadas de Pino** (1024x572, ratio 16:9): formato panorámico horizontal que encaja perfecto en las tarjetas y modales sin recortar la comida ni dejar bandas negras.
   - Prohibidas las fotos verticales tipo historia de celular que cortan el plato.

2. **Criterio estético y composición:**
   - **Comida real con corte:** mostrar una pieza abierta o cortada al medio que exhiba el corazón del plato, la humedad del relleno y la textura de la masa.
   - **Contexto de mesa real:** tablas rústicas de madera, fuentes o platos de cerámica reales, cuencos con salsa/acompañamiento (ej. pebre con cuchara de madera), migajas naturales de cocción.
   - **Cero imágenes artificiales de IA:** nada de brillo plástico, colores hiper-saturados o comida sintética.
   
3. **Prioridad absoluta a fotos enviadas por el autor/usuario:**
   - Cada vez que el usuario comparta una imagen, esa imagen es la referencia definitiva:
     - Se guarda localmente en `img/` como respaldo maestro.
     - Se sube inmediatamente a Google CDN (`lh3.googleusercontent.com`) para obtener la URL directa de alta velocidad.
     - **NO** se sube a `publicar_github/img/` ya que está excluida en `.gitignore` para mantener Vercel y GitHub ultra livianos.

---

## 3. Sincronización Técnica

- Cada cambio en títulos o recetas debe reflejarse en:
  1. `recetas_pro.json` (raíz).
  2. `publicar_github/recetas_pro.json`.
- Servidor de imágenes: 100% de las imágenes se sirven desde los servidores de Google CDN / Blogger (`lh3.googleusercontent.com`).
- No ejecutar `git push` (el usuario gestiona los envíos mediante GitHub Desktop).

---

## 4. Voz Autoral y Genealogía Familiar (Obligatorio e Inmutable)

1. **Voz en primera persona estricta:**
   - **PROHIBIDO TERMINANTEMENTE** hablar de Walter Pagliardini en tercera persona (ej: ❌ *"la madre de Walter"*, ❌ *"en la familia de Walter"*, ❌ *"según Walter"*).
   - Todos los relatos, anécdotas familiares, historias de origen (`story`) y secretos de cocina (`notes`) deben estar redactados en **PRIMERA PERSONA** (ej: ✔️ *"mi mamá"*, ✔️ *"mi abuela Pina"*, ✔️ *"en mi cocina"*, ✔️ *"cuando preparo este plato"*).
   - Walter cocina desde los 10 años, con devoción absoluta por la cocina oriental, la gastronomía tradicional y el legado culinario familiar.

2. **Árbol Genealógico y Raíces Familiares del Autor:**
   - **Madre de Walter (¡VIVA!):** De apellido **Pettis**.
   - **Rama Materna:**
     - **Abuelo Materno:** **Ricardo José Pettis Pelerán** (1904–1977, Buenos Aires).
     - **Abuela Materna:** **Josefa Fernández Santamarina** ("Abuela Pina"), originaria de **Asturias** (España).
     - **Bisabuelo:** **Fernando Pascacio Pettis** (1867–1920), nacido en **Montevideo, Uruguay** (Parroquia San Agustín / La Unión, FamilySearch ID: `9Q7L-6PT`).
     - **Bisabuela:** **Onésima Benita Pelerán Éspora** (1868–1904, Buenos Aires).
     - **Raíz Francesa Pelerán:** Descendientes directos de **Estevan Antonio Pelerán** (Étienne Antonin Pellerin, n. ~1802), originario de **Toulon** (Var, Provenza-Alpes-Costa Azul, Francia).
   - **Rama Paterna:**
     - **Pagliardini:** Originarios de **Borgo Pace** (Provincia de Pesaro y Urbino, región de Las Marcas / Umbría, Italia). Padre de Walter.
     - **Lemmi:** Originarios de **Villa Collemandina** (comuna de la Garfagnana, Provincia de Lucca, Toscana, Italia). Abuela paterna de Walter.


