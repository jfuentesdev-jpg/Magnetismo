# 🧲 MagneWorld — El Fascinante Mundo del Magnetismo

Web educativa e interactiva sobre el **magnetismo**, sus **usos en la vida diaria** y los **motores eléctricos**. Pensada para explorar la ciencia de forma visual y divertida, con simulaciones en tiempo real.

## ✨ Qué incluye

- **📖 Contenido educativo:** qué es el magnetismo, los polos, el campo magnético terrestre y datos curiosos (tortugas marinas, trenes Maglev, auroras boreales).
- **🎯 Sección de usos:** motores eléctricos, trenes Maglev, resonancia magnética (MRI), altavoces, discos duros, cocinas de inducción y brújulas.
- **🧪 Simuladores en canvas**:
  - *Imanes y campo magnético:* arrastra dos imanes y observa atracción, repulsión y líneas de campo.
  - *Motor eléctrico:* mira la fuerza electromagnética (Fuerza de Lorentz) girar la bobina, controla velocidad e invierte la corriente.
  - *Brújula y navegación:* arrastra un imán cerca de la brújula y observa cómo su campo domina (o no) al campo terrestre.
- **🎮 Quiz interactivo:** 6 preguntas sobre los usos del magnetismo con explicación en cada respuesta y puntaje final.

## 🚀 Cómo verlo

Está hecho con HTML, CSS y JavaScript **nativos** — no necesita instalación ni dependencias:

1. Abre `index.html` en cualquier navegador moderno (Chrome, Edge, Firefox).
2. O compártelo directo si lo publicas con GitHub Pages (ver abajo).

## 🛠️ Estructura del proyecto

```
magnetismo/
├── index.html   → estructura: inicio, usos, simulador y quiz
├── styles.css   → tema neón oscuro, responsive y animaciones
├── script.js    → navegación, física de los 3 simuladores y quiz
└── README.md    → esta documentación
```

## 💻 Cómo modificarlo

- **Textos y tarjetas:** edita `index.html` (cada tarjeta usa las clases `card` / `pulse-hover`).
- **Colores del tema:** variables CSS al inicio de `styles.css` (`--neon-cyan`, `--neon-pink`, etc.).
- **Preguntas del quiz:** arreglo `quizQuestions` en `script.js` — agrega objetos con `question`, `options`, `correct` e `explanation`.
- **Física de la brújula:** constantes `COMPASS_K`, `EARTH_BIAS` y `STRONG_FIELD` en `script.js`.

## ⚠️ Limitaciones conocidas

- Las imágenes (Unsplash) y tipografías (Google Fonts) se cargan de servicios externos: **requiere internet** para verse completo.
- Es una web estática: no guarda puntajes entre sesiones ni en un servidor.

## 🌐 Publicar con GitHub Pages

1. Sube esta carpeta a un repositorio.
2. Ve a **Settings → Pages → Build and deployment**.
3. En *Branch* elige `main` y carpeta `/ (root)`, y guarda.
4. En unos minutos estará disponible en `https://TU_USUARIO.github.io/NOMBRE_DEL_REPO/`.

## 🧰 Tecnología

HTML5 semántico · CSS3 responsive · JavaScript ES6+ · Canvas 2D — sin frameworks ni librerías.

---
Creado para explorar la ciencia de forma divertida ⚡
