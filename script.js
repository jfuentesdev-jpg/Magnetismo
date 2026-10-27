// ================= NAVEGACIÓN ENTRE PÁGINAS =================
function switchPage(pageId) {
  document.querySelectorAll('.page').forEach(page => {
    page.classList.remove('active');
  });

  document.querySelectorAll('.nav-btn').forEach(btn => {
    btn.classList.remove('active');
  });

  const targetPage = document.getElementById(`page-${pageId}`);
  if (targetPage) {
    targetPage.classList.add('active');
  }

  const activeBtn = Array.from(document.querySelectorAll('.nav-btn')).find(
    btn => btn.getAttribute('onclick').includes(pageId)
  );
  if (activeBtn) {
    activeBtn.classList.add('active');
  }

  if (pageId === 'simulator') {
    restartCurrentSimulation();
  }
}

// ================= GESTIÓN DE SIMULACIONES (MODOS) =================
let currentSimMode = 'magnets'; // 'magnets' o 'motor'

function setSimMode(mode) {
  currentSimMode = mode;
  document.getElementById('btnModeMagnets').classList.toggle('active', mode === 'magnets');
  document.getElementById('btnModeMotor').classList.toggle('active', mode === 'motor');
  document.getElementById('btnModeCompass').classList.toggle('active', mode === 'compass');

  document.getElementById('controlsMagnets').style.display = (mode === 'magnets') ? 'flex' : 'none';
  document.getElementById('controlsMotor').style.display = (mode === 'motor') ? 'flex' : 'none';
  document.getElementById('controlsCompass').style.display = (mode === 'compass') ? 'flex' : 'none';

  restartCurrentSimulation();
}

function restartCurrentSimulation() {
  if (currentSimMode === 'magnets') {
    initMagnetSim();
  } else if (currentSimMode === 'compass') {
    initCompassSim();
  } else {
    initMotorSim();
  }
}

// ================= CONFIGURACIÓN DE CANVAS Y ANIMACIÓN =================
const canvas = document.getElementById('magnetCanvas');
const ctx = canvas.getContext('2d');
const simStatus = document.getElementById('simStatus');
let animationFrameId = null;

function stopCurrentAnim() {
  if (animationFrameId) {
    cancelAnimationFrame(animationFrameId);
    animationFrameId = null;
  }
}

// ================= MODO 1: IMANES Y CAMPO MAGNÉTICO =================
let magnets = [
  { x: 220, y: 225, w: 140, h: 60, leftPolarity: 'N', rightPolarity: 'S', isDragging: false },
  { x: 580, y: 225, w: 140, h: 60, leftPolarity: 'N', rightPolarity: 'S', isDragging: false }
];

// Objetos arrastrables del modo de simulación actual
let dragTargets = magnets;

let dragOffsetX = 0;
let dragOffsetY = 0;
let draggedMagnet = null;

function togglePolarity(magnetNumber) {
  const index = magnetNumber - 1;
  const temp = magnets[index].leftPolarity;
  magnets[index].leftPolarity = magnets[index].rightPolarity;
  magnets[index].rightPolarity = temp;
}

function resetMagnets() {
  magnets[0].x = 220;
  magnets[0].y = 225;
  magnets[1].x = 580;
  magnets[1].y = 225;
}

// Eventos de arrastre para imanes
canvas.onmousedown = null;
canvas.onmousemove = null;
canvas.onmouseup = null;

function initMagnetSim() {
  stopCurrentAnim();
  dragTargets = magnets;

  canvas.onmousedown = startDrag;
  canvas.onmousemove = drag;
  canvas.onmouseup = endDrag;
  canvas.ontouchstart = (e) => startDrag(e.touches[0]);
  canvas.ontouchmove = (e) => { e.preventDefault(); drag(e.touches[0]); };
  canvas.ontouchend = endDrag;

  runMagnetLoop();
}

function startDrag(e) {
  if (!dragTargets.length) return;
  const rect = canvas.getBoundingClientRect();
  const mouseX = e.clientX - rect.left;
  const mouseY = e.clientY - rect.top;

  dragTargets.forEach(m => {
    if (
      mouseX >= m.x - m.w/2 && mouseX <= m.x + m.w/2 &&
      mouseY >= m.y - m.h/2 && mouseY <= m.y + m.h/2
    ) {
      m.isDragging = true;
      draggedMagnet = m;
      dragOffsetX = mouseX - m.x;
      dragOffsetY = mouseY - m.y;
    }
  });
}

function drag(e) {
  if (!draggedMagnet) return;
  const rect = canvas.getBoundingClientRect();
  draggedMagnet.x = e.clientX - rect.left - dragOffsetX;
  draggedMagnet.y = e.clientY - rect.top - dragOffsetY;
}

function endDrag() {
  if (draggedMagnet) {
    draggedMagnet.isDragging = false;
    draggedMagnet = null;
  }
}

function runMagnetLoop() {
  if (currentSimMode !== 'magnets') return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const m1 = magnets[0];
  const m2 = magnets[1];

  const m1RightPole = { x: m1.x + m1.w / 2, y: m1.y, pole: m1.rightPolarity };
  const m2LeftPole = { x: m2.x - m2.w / 2, y: m2.y, pole: m2.leftPolarity };

  const dx = m2LeftPole.x - m1RightPole.x;
  const dy = m2LeftPole.y - m1RightPole.y;
  const distance = Math.sqrt(dx * dx + dy * dy);

  // Física de atracción / repulsión
  if (distance < 250) {
    const force = (250 - distance) * 0.03;
    const isAttracting = m1RightPole.pole !== m2LeftPole.pole;

    if (isAttracting) {
      simStatus.textContent = "🧲 ¡Se Atraen! Polos opuestos crean una fuerza de unión";
      simStatus.style.color = "#00f0ff";
      if (!m1.isDragging) m1.x += (dx / distance) * force * 0.5;
      if (!m2.isDragging) m2.x -= (dx / distance) * force * 0.5;
    } else {
      simStatus.textContent = "⚡ ¡Se Repelen! Polos iguales se rechazan mutuamente";
      simStatus.style.color = "#ff007f";
      if (!m1.isDragging) m1.x -= (dx / distance) * force * 0.5;
      if (!m2.isDragging) m2.x += (dx / distance) * force * 0.5;
    }
  } else {
    simStatus.textContent = "Acerca los imanes para ver la fuerza magnética y sus líneas de campo";
    simStatus.style.color = "#ffee00";
  }

  // Dibujar Líneas de Campo Magnético entre los imanes
  drawMagneticFieldLines(m1RightPole, m2LeftPole, m1RightPole.pole !== m2LeftPole.pole);

  // Dibujar imanes
  drawMagnet(m1);
  drawMagnet(m2);

  animationFrameId = requestAnimationFrame(runMagnetLoop);
}

function drawMagneticFieldLines(p1, p2, isAttract) {
  ctx.strokeStyle = isAttract ? 'rgba(0, 240, 255, 0.4)' : 'rgba(255, 0, 127, 0.4)';
  ctx.lineWidth = 2;
  ctx.setLineDash([5, 5]);

  // Curvas de campo magnético superior e inferior
  for (let i = -2; i <= 2; i++) {
    if (i === 0) continue;
    ctx.beginPath();
    let offsetY = i * 35;
    ctx.moveTo(p1.x, p1.y);
    ctx.bezierCurveTo(p1.x + 50, p1.y + offsetY * 1.5, p2.x - 50, p2.y + offsetY * 1.5, p2.x, p2.y);
    ctx.stroke();
  }
  ctx.setLineDash([]); // Resetear guiones
}

function drawMagnet(m) {
  const halfW = m.w / 2;
  const halfH = m.h / 2;

  ctx.save();
  ctx.translate(m.x, m.y);

  // Polo Izquierdo
  ctx.fillStyle = m.leftPolarity === 'N' ? '#ff3b30' : '#007aff';
  ctx.beginPath();
  ctx.roundRect(-halfW, -halfH, halfW, m.h, [10, 0, 0, 10]);
  ctx.fill();

  // Polo Derecho
  ctx.fillStyle = m.rightPolarity === 'N' ? '#ff3b30' : '#007aff';
  ctx.beginPath();
  ctx.roundRect(0, -halfH, halfW, m.h, [0, 10, 10, 0]);
  ctx.fill();

  ctx.strokeStyle = '#ffffff';
  ctx.lineWidth = 2;
  ctx.strokeRect(-halfW, -halfH, m.w, m.h);

  // Textos
  ctx.fillStyle = '#ffffff';
  ctx.font = 'bold 20px Fredoka One, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText(m.leftPolarity, -halfW / 2, 0);
  ctx.fillText(m.rightPolarity, halfW / 2, 0);

  ctx.restore();
}


// ================= MODO 2: MOTOR ELÉCTRICO Y FUERZA ELECTROMAGNÉTICA =================
let motorAngle = 0;
let motorSpeed = 0.03;
let currentDirection = 1; // 1 o -1

function toggleMotorSpeed() {
  motorSpeed = motorSpeed === 0.03 ? 0.08 : 0.03;
}

function toggleCurrentDirection() {
  currentDirection *= -1;
}

function initMotorSim() {
  stopCurrentAnim();

  // Limpiar eventos de interacción en este modo
  canvas.onmousedown = null;
  canvas.onmousemove = null;
  canvas.onmouseup = null;
  canvas.ontouchstart = null;
  canvas.ontouchmove = null;
  canvas.ontouchend = null;
  dragTargets = [];

  runMotorLoop();
}

function runMotorLoop() {
  if (currentSimMode !== 'motor') return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  motorAngle += motorSpeed * currentDirection;

  const centerX = canvas.width / 2;
  const centerY = canvas.height / 2;

  simStatus.textContent = "⚡ Motor en funcionamiento: La corriente crea fuerza electromagnética (Fuerza de Lorentz) que hace girar la bobina.";
  simStatus.style.color = "#00f0ff";

  // 1. Dibujar Imanes Permanentes Externos (Estator: Izq Norte, Der Sur)
  // Imán Izquierdo (Norte - Rojo)
  ctx.fillStyle = '#ff3b30';
  ctx.fillRect(100, centerY - 80, 60, 160);
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 24px Fredoka One';
  ctx.textAlign = 'center';
  ctx.fillText('N', 130, centerY);

  // Imán Derecho (Sur - Azul)
  ctx.fillStyle = '#007aff';
  ctx.fillRect(canvas.width - 160, centerY - 80, 60, 160);
  ctx.fillStyle = '#fff';
  ctx.fillText('S', canvas.width - 130, centerY);

  // 2. Líneas del Campo Magnético del Estator (de N a S)
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.25)';
  ctx.lineWidth = 2;
  for (let i = -2; i <= 2; i++) {
    ctx.beginPath();
    ctx.moveTo(160, centerY + i * 30);
    ctx.lineTo(canvas.width - 160, centerY + i * 30);
    ctx.stroke();
  }

  // 3. Dibujar la Bobina / Rotor Giratorio
  ctx.save();
  ctx.translate(centerX, centerY);
  ctx.rotate(motorAngle);

  // Marco de la bobina
  ctx.strokeStyle = '#ffee00';
  ctx.lineWidth = 8;
  ctx.strokeRect(-90, -45, 180, 90);

  // Núcleo central
  ctx.fillStyle = '#333';
  ctx.beginPath();
  ctx.arc(0, 0, 20, 0, Math.PI * 2);
  ctx.fill();
  ctx.strokeStyle = '#ffee00';
  ctx.lineWidth = 3;
  ctx.stroke();

  // Indicador de corriente circulando (electrones animados)
  ctx.fillStyle = '#00f0ff';
  let electronOffset = (Date.now() / 30) % 40;
  ctx.beginPath();
  ctx.arc(-70 + electronOffset, -45, 5, 0, Math.PI * 2);
  ctx.arc(70 - electronOffset, 45, 5, 0, Math.PI * 2);
  ctx.fill();

  ctx.restore();

  // 4. Vectores de Fuerza Electromagnética (Fuerza de Lorentz)
  // Un lado sube y el otro baja creando el torque
  ctx.fillStyle = '#ff007f';
  ctx.font = 'bold 16px Nunito';
  ctx.fillText('↑ Fuerza Magnética (Sube)', centerX - 160, centerY - 70);
  ctx.fillText('↓ Fuerza Magnética (Baja)', centerX + 160, centerY + 80);

  animationFrameId = requestAnimationFrame(runMotorLoop);
}

// ================= MODO 3: BRÚJULA Y NAVEGACIÓN =================
let compassMagnet = { x: 660, y: 370, w: 140, h: 60, leftPolarity: 'N', rightPolarity: 'S', isDragging: false };
let compassAngle = -Math.PI / 2; // La aguja inicia apuntando "al Norte" (arriba)
const COMPASS_K = 3000;      // Fuerza de los polos del imán
const EARTH_BIAS = 0.06;     // Campo base de la Tierra (vector hacia arriba)
const STRONG_FIELD = 0.08;   // Umbral: cuando el imán domina al campo terrestre

function toggleCompassPolarity() {
  const temp = compassMagnet.leftPolarity;
  compassMagnet.leftPolarity = compassMagnet.rightPolarity;
  compassMagnet.rightPolarity = temp;
}

function resetCompass() {
  compassMagnet.x = 660;
  compassMagnet.y = 370;
}

function initCompassSim() {
  stopCurrentAnim();
  dragTargets = [compassMagnet];

  canvas.onmousedown = startDrag;
  canvas.onmousemove = drag;
  canvas.onmouseup = endDrag;
  canvas.ontouchstart = (e) => startDrag(e.touches[0]);
  canvas.ontouchmove = (e) => { e.preventDefault(); drag(e.touches[0]); };
  canvas.ontouchend = endDrag;

  runCompassLoop();
}

function runCompassLoop() {
  if (currentSimMode !== 'compass') return;
  ctx.clearRect(0, 0, canvas.width, canvas.height);

  const cx = canvas.width / 2;
  const cy = canvas.height / 2;

  // 1. Campo magnético del imán sobre la brújula (modelo de dos polos)
  const poles = [
    { x: compassMagnet.x - compassMagnet.w / 2, y: compassMagnet.y, sign: compassMagnet.leftPolarity === 'N' ? 1 : -1 },
    { x: compassMagnet.x + compassMagnet.w / 2, y: compassMagnet.y, sign: compassMagnet.rightPolarity === 'N' ? 1 : -1 }
  ];
  let fx = 0;
  let fy = 0;

  poles.forEach(p => {
    const dx = cx - p.x;
    const dy = cy - p.y;
    const r = Math.sqrt(dx * dx + dy * dy);
    if (r > 1) {
      const strength = COMPASS_K / (r * r * r);
      fx += p.sign * dx * strength;
      fy += p.sign * dy * strength;
    }
  });

  const magnetField = Math.hypot(fx, fy);

  // 2. Dirección del campo total: imán + campo terrestre (hacia "arriba")
  const targetAngle = Math.atan2(fy - EARTH_BIAS, fx);

  // La aguja gira suavemente hacia la dirección del campo (efecto realista)
  let diff = targetAngle - compassAngle;
  diff = Math.atan2(Math.sin(diff), Math.cos(diff));
  compassAngle += diff * 0.12;

  // 3. Mensaje de estado
  if (magnetField > STRONG_FIELD) {
    simStatus.textContent = "🧭 ¡El imán domina! Su campo es más fuerte que el de la Tierra y gira la aguja";
    simStatus.style.color = "#00f0ff";
  } else {
    simStatus.textContent = "🌍 La aguja apunta al Norte: el campo de la Tierra gobierna la brújula";
    simStatus.style.color = "#ffee00";
  }

  drawCompass(cx, cy, compassAngle);
  drawMagnet(compassMagnet);

  animationFrameId = requestAnimationFrame(runCompassLoop);
}

function drawCompass(cx, cy, angle) {
  ctx.save();
  ctx.translate(cx, cy);

  // Carcasa con brillo neón
  ctx.beginPath();
  ctx.arc(0, 0, 82, 0, Math.PI * 2);
  ctx.fillStyle = '#14113a';
  ctx.fill();
  ctx.strokeStyle = 'rgba(0, 240, 255, 0.8)';
  ctx.lineWidth = 5;
  ctx.shadowColor = '#00f0ff';
  ctx.shadowBlur = 18;
  ctx.stroke();
  ctx.shadowBlur = 0;

  // Marcas del dial
  ctx.strokeStyle = 'rgba(255, 255, 255, 0.25)';
  ctx.lineWidth = 2;
  for (let i = 0; i < 24; i++) {
    const a = (i / 24) * Math.PI * 2;
    const x1 = Math.cos(a) * 70;
    const y1 = Math.sin(a) * 70;
    const x2 = Math.cos(a) * 76;
    const y2 = Math.sin(a) * 76;
    ctx.beginPath();
    ctx.moveTo(x1, y1);
    ctx.lineTo(x2, y2);
    ctx.stroke();
  }

  // Rosa de los vientos (puntos geográficos fijos)
  ctx.fillStyle = 'rgba(255, 255, 255, 0.85)';
  ctx.font = 'bold 18px Fredoka One, sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('N', 0, -58);
  ctx.fillText('S', 0, 58);
  ctx.fillText('O', -58, 0);
  ctx.fillText('E', 58, 0);

  // Aguja (gira según el campo magnético calculado)
  ctx.rotate(angle);

  ctx.fillStyle = '#ff3b30'; // Punta N roja
  ctx.beginPath();
  ctx.moveTo(62, 0);
  ctx.lineTo(10, -9);
  ctx.lineTo(10, 9);
  ctx.closePath();
  ctx.fill();

  ctx.fillStyle = '#dfe3ee'; // Cola gris
  ctx.beginPath();
  ctx.moveTo(-48, 0);
  ctx.lineTo(-10, -9);
  ctx.lineTo(-10, 9);
  ctx.closePath();
  ctx.fill();

  ctx.restore();

  // Pivote central
  ctx.beginPath();
  ctx.arc(cx, cy, 7, 0, Math.PI * 2);
  ctx.fillStyle = '#ffee00';
  ctx.fill();
  ctx.strokeStyle = '#12102b';
  ctx.lineWidth = 2;
  ctx.stroke();
}

// ================= QUIZ: ¿CUÁNTO SABES DE LOS USOS? =================
const quizQuestions = [
  {
    question: "¿Cuál es el uso del magnetismo que permite 'fotografiar' el interior del cuerpo sin cirugía ni radiación?",
    options: ["Radiografía", "Resonancia magnética (MRI)", "Termómetro digital", "Electrocardiograma"],
    correct: 1,
    explanation: "La MRI usa un potente campo magnético que alinea los átomos de tu cuerpo y los hace emitir una señal que se convierte en imagen."
  },
  {
    question: "Los trenes Maglev flotan sobre los rieles y alcanzan más de 600 km/h gracias a...",
    options: ["Turbinas de gran potencia", "Ruedas de fibra de carbono", "Levitación magnética", "Cables de acero"],
    correct: 2,
    explanation: "La repulsión entre imanes levanta el tren y, como no roza con nada, puede volar a velocidades altísimas."
  },
  {
    question: "¿Qué dispositivo convierte la corriente eléctrica de una bobina, dentro de un imán, en el sonido que escuchas?",
    options: ["El altavoz", "La brújula", "El disco duro", "El transformador"],
    correct: 0,
    explanation: "En el altavoz, la bobina vibra dentro del campo magnético y empuja el aire creando ondas de sonido."
  },
  {
    question: "Un disco duro guarda tus archivos gracias a...",
    options: ["Luz láser", "Dominios imantados en un disco", "Vapor de agua", "Pilas de botón"],
    correct: 1,
    explanation: "Bits con polaridad magnética (N o S) representan los ceros y unos de tus datos."
  },
  {
    question: "Si una olla calienta sin llama ni resistencia visible, el fogón usa...",
    options: ["Gas comprimido", "Electricidad estática", "Energía solar", "Inducción magnética"],
    correct: 3,
    explanation: "Un campo magnético oscilante induce corrientes en el metal de la olla y la calienta directamente."
  },
  {
    question: "¿Por qué la aguja de una brújula siempre señala el norte?",
    options: ["Porque es más pesada de un lado", "Por el campo magnético de la Tierra", "Por el magnetismo del Sol", "Por la gravedad"],
    correct: 1,
    explanation: "El núcleo terrestre genera un campo magnético colosal que alinea la aguja, como si el planeta fuera un imán gigante."
  }
];

let quizIndex = 0;
let quizScore = 0;

function renderQuizQuestion() {
  const q = quizQuestions[quizIndex];
  document.getElementById('quizProgress').textContent = `Pregunta ${quizIndex + 1} de ${quizQuestions.length} · Puntos: ${quizScore}`;
  document.getElementById('quizQuestion').textContent = q.question;

  const feedback = document.getElementById('quizFeedback');
  feedback.textContent = '';
  feedback.style.color = '';

  document.getElementById('quizNextBtn').hidden = true;

  const container = document.getElementById('quizOptions');
  container.innerHTML = '';
  q.options.forEach((option, i) => {
    const btn = document.createElement('button');
    btn.type = 'button';
    btn.className = 'option-btn';
    btn.textContent = option;
    btn.addEventListener('click', () => answerQuizQuestion(i));
    container.appendChild(btn);
  });
}

function answerQuizQuestion(chosen) {
  const q = quizQuestions[quizIndex];
  const buttons = document.querySelectorAll('#quizOptions .option-btn');
  const feedback = document.getElementById('quizFeedback');

  buttons.forEach((btn, i) => {
    btn.disabled = true;
    if (i === q.correct) btn.classList.add('correct');
    if (i === chosen && chosen !== q.correct) btn.classList.add('wrong');
  });

  if (chosen === q.correct) {
    quizScore++;
    feedback.textContent = `✅ ¡Correcto! ${q.explanation}`;
    feedback.style.color = '#00ffaa';
  } else {
    feedback.textContent = `❌ La respuesta era: ${q.options[q.correct]}. ${q.explanation}`;
    feedback.style.color = '#ff3b30';
  }

  document.getElementById('quizProgress').textContent = `Pregunta ${quizIndex + 1} de ${quizQuestions.length} · Puntos: ${quizScore}`;

  const nextBtn = document.getElementById('quizNextBtn');
  nextBtn.hidden = false;
  nextBtn.textContent = (quizIndex === quizQuestions.length - 1) ? 'Ver Resultado 🏆' : 'Siguiente ➜';
}

function nextQuizQuestion() {
  if (quizIndex === quizQuestions.length - 1) {
    showQuizResult();
    return;
  }
  quizIndex++;
  renderQuizQuestion();
}

function showQuizResult() {
  document.getElementById('quizProgress').textContent = `Juego terminado · Puntaje: ${quizScore} de ${quizQuestions.length}`;

  document.getElementById('quizQuestion').textContent =
    quizScore === quizQuestions.length ? '¡Magnífico! 🧲 Eres experto en magnetismo' :
    quizScore >= 4 ? '¡Muy bien! El magnetismo ya no tiene secretos para ti' :
    quizScore >= 2 ? '¡Buen intento! Estás en camino ⚡' :
    'El magnetismo te espera: revisa la sección de usos 🔁';

  document.getElementById('quizOptions').innerHTML = '';
  document.getElementById('quizFeedback').textContent = '';

  const nextBtn = document.getElementById('quizNextBtn');
  nextBtn.hidden = false;
  nextBtn.textContent = '🔄 Jugar de nuevo';
  nextBtn.onclick = restartQuiz;
}

function restartQuiz() {
  quizIndex = 0;
  quizScore = 0;
  const nextBtn = document.getElementById('quizNextBtn');
  nextBtn.onclick = nextQuizQuestion;
  renderQuizQuestion();
}

// Iniciar app al cargar
window.onload = () => {
  initMagnetSim();
  renderQuizQuestion();
};