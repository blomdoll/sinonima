# Sinónima

Editor de texto con sugerencias de sinónimos en tiempo real, sin backend ni APIs externas.

**→ [Ver demo en vivo](https://sinonima.vercel.app)**

---

## ¿Qué hace?

Mientras escribís, Sinónima detecta automáticamente la última palabra y muestra sus sinónimos en un panel lateral. Al hacer click en uno, lo reemplaza directamente en el texto.

Todo funciona de forma local, sin conexión a internet después de cargar la página.

## Funcionalidades

- Sugerencias de sinónimos en tiempo real con debounce de 400ms
- Reemplazo de palabras con un click, preservando el contexto del texto
- Normalización de texto: busca sinónimos ignorando acentos y mayúsculas
- Búsqueda inversa: si escribís un sinónimo, encuentra la palabra raíz y sus variantes
- Modo claro / oscuro con persistencia en `localStorage`
- Contador de palabras en tiempo real
- Botón de copiar texto al portapapeles (con fallback para navegadores más antiguos)
- Menú responsive con hamburguesa para móvil
- Diccionario embebido en JSON (sin llamadas a APIs externas)

## Tecnologías

- HTML5
- CSS3 (custom properties, diseño responsive)
- JavaScript vanilla (sin frameworks)
- Vercel (deploy)

## Correr localmente

```bash
git clone https://github.com/blomdoll/sinonima.git
cd sinonima
# Abrir index.html en el navegador
# o usar un servidor local:
npx serve .
```

> El archivo `sinonimos.json` se carga vía `fetch`, por lo que necesitás un servidor local (no funciona abriendo el HTML directamente como archivo).

## Estructura

```
sinonima/
├── index.html       # App completa (HTML + JS inline)
├── styles.css       # Estilos y variables de tema
└── sinonimos.json   # Diccionario de sinónimos en español
```

---

Creado por [@blomdoll](https://github.com/blomdoll)
