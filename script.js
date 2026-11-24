// COLE AQUI A URL DO SEU GOOGLE APPS SCRIPT (/exec)
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwZQxEHK3bCsHYjFX2oFbbquPbP4F_boufquTLc_gGKZbOKsIY3ESTfFy0dseI0Ffza/exec";

// Estado do Jogo
let player = { name: "", role: "" };
let visited = { guiados: false, naoGuiados: false };
let currentCategory = "guiados";
let currentMediaIndex = 0;
let simInterval = null;

// Banco de Dados dos Meios de Transmissão (velocidade em Mbps para cálculo real)
const mediaData = {
  guiados: [
    {
      name: "Cabo Coaxial (RG-59 / RG-6)",
      icon: "📺",
      type: "Sinal Elétrico (Cobre + Malha)",
      speedText: "10 Mbps a 1 Gbps (DOCSIS)",
      speedMbps: 100,
      range: "Até 500 metros (sem repetidor)",
      use: "TV a cabo, internet via cabo (operadoras) e sistemas antigos de CFTV.",
      comparison: "Boa blindagem contra interferência eletromagnética, porém rígido e difícil de instalar em curvas.",
      pulseColor: "#f59e0b",
      animDuration: "2.2s"
    },
    {
      name: "Par Trançado CAT4",
      icon: "☎️",
      type: "Sinal Elétrico (4 Pares de Cobre)",
      speedText: "Até 16 Mbps",
      speedMbps: 16,
      range: "Até 100 metros (16 MHz)",
      use: "Redes Token Ring antigas e telefonia nos anos 1990 (obsoleto para internet atual).",
      comparison: "Barato e flexível, mas taxa de transmissão muito baixa para padrões atuais.",
      pulseColor: "#94a3b8",
      animDuration: "3.5s"
    },
    {
      name: "Par Trançado CAT5e",
      icon: "🔌",
      type: "Sinal Elétrico (Cobre Trançado)",
      speedText: "Até 1 Gbps (1.000 Mbps)",
      speedMbps: 1000,
      range: "Até 100 metros (100 MHz)",
      use: "Redes domésticas, escritórios e laboratórios de informática.",
      comparison: "Excelente custo-benefício. O trançamento reduz a diafonia (crosstalk), mas sofre interferência perto de cabos de energia.",
      pulseColor: "#38bdf8",
      animDuration: "1.1s"
    },
    {
      name: "Par Trançado CAT6 / CAT6a",
      icon: "🔗",
      type: "Sinal Elétrico (Com separador interno)",
      speedText: "1 Gbps até 10 Gbps (CAT6a)",
      speedMbps: 10000,
      range: "55m (10Gbps no CAT6) ou 100m (CAT6a - 500 MHz)",
      use: "Redes corporativas, servidores locais e pontos de acesso Wi-Fi 6/7.",
      comparison: "Possui separador plástico interno (cruzeta) que isola os pares e garante altíssima velocidade em cobre.",
      pulseColor: "#0ea5e9",
      animDuration: "0.55s"
    },
    {
      name: "Fibra Óptica (Monomodo / Multimodo)",
      icon: "💡",
      type: "Pulsos de Luz (Laser / LED)",
      speedText: "10 Gbps a +100 Gbps",
      speedMbps: 40000,
      range: "De 500m (Multimodo) até +80 km (Monomodo)",
      use: "Backbones de internet, cabos submarinos, provedores (FTTH) e interligação de prédios.",
      comparison: "Imune a interferências eletromagnéticas e altíssima velocidade. Desvantagem: custo de fusão e fragilidade se dobrada bruscamente.",
      pulseColor: "#22c55e",
      animDuration: "0.22s"
    }
  ],
  "nao-guiados": [
    {
      name: "Infravermelho (IrDA)",
      icon: "🔦",
      type: "Ondas de Luz Invisível",
      speedText: "115 kbps a 4 Mbps",
      speedMbps: 4,
      range: "Até 5 metros (Exige visada direta)",
      use: "Controles remotos de TV, ar-condicionado e sensores de curta distância.",
      comparison: "Muito barato e sem interferência de rádio, mas não atravessa paredes nem obstáculos.",
      pulseColor: "#ef4444",
      animDuration: "4.0s"
    },
    {
      name: "Bluetooth (5.0 / 5.3)",
      icon: "🎧",
      type: "Ondas de Rádio (2.4 GHz - WPAN)",
      speedText: "2 Mbps a 50 Mbps",
      speedMbps: 24,
      range: "10 a 100 metros",
      use: "Fones sem fio, smartwatches, periféricos e dispositivos IoT de baixo consumo.",
      comparison: "Consome pouquíssima bateria e pareia rápido, mas tem alcance e largura de banda limitados.",
      pulseColor: "#3b82f6",
      animDuration: "2.5s"
    },
    {
      name: "Wi-Fi 5 / Wi-Fi 6 (IEEE 802.11ac/ax)",
      icon: "📶",
      type: "Ondas de Rádio (2.4 GHz e 5 GHz)",
      speedText: "600 Mbps a 9.6 Gbps (teórico)",
      speedMbps: 1200,
      range: "30 a 100 metros (ambientes internos)",
      use: "Acesso sem fio local em residências, escolas, empresas e smartphones.",
      comparison: "Mobilidade total sem cabos, mas sofre atenuação com paredes, distância e congestionamento de canais.",
      pulseColor: "#38bdf8",
      animDuration: "0.9s"
    },
    {
      name: "Rádio Enlace / Micro-ondas Terrestre",
      icon: "📡",
      type: "Ondas Eletromagnéticas Direcionais",
      speedText: "100 Mbps a 10 Gbps",
      speedMbps: 2000,
      range: "10 km a 50 km (Torres com visada direta)",
      use: "Interligação entre torres de celular, provedores regionais e áreas rurais.",
      comparison: "Leva internet a locais onde passar fibra é inviável, porém exige alinhamento preciso e sofre com chuvas fortes.",
      pulseColor: "#a855f7",
      animDuration: "0.75s"
    },
    {
      name: "Comunicação via Satélite (GEO / LEO)",
      icon: "🛰️",
      type: "Micro-ondas Espaciais",
      speedText: "50 Mbps a 500 Mbps",
      speedMbps: 250,
      range: "Cobertura Global (550 km LEO a 35.786 km GEO)",
      use: "Regiões remotas (Amazônia, oceanos), navios, aviões e zonas sem infraestrutura terrestre.",
      comparison: "Cobre qualquer ponto do planeta. Satélites geoestacionários (GEO) têm alta latência (~600ms), enquanto órbita baixa (LEO) reduz para ~30ms.",
      pulseColor: "#eab308",
      animDuration: "1.6s"
    }
  ]
};

// 12 Questões Objetivas
const quizQuestions = [
  {
    q: "1. Qual é a principal diferença entre meios guiados e não guiados?",
    options: [
      "Meios guiados usam cabos físicos para confinar o sinal; não guiados propagam ondas pelo ar/espaço.",
      "Meios guiados funcionam apenas sem eletricidade; não guiados precisam de fibra óptica.",
      "Meios não guiados são sempre mais rápidos que qualquer cabo físico.",
      "Não existe diferença técnica, apenas o preço do equipamento."
    ],
    answer: 0
  },
  {
    q: "2. Qual meio de transmissão transporta dados através de pulsos de luz?",
    options: ["Cabo Coaxial", "Par Trançado CAT6", "Fibra Óptica", "Cabo Serial"],
    answer: 2
  },
  {
    q: "3. Por que os fios dentro de um cabo UTP (CAT5e/CAT6) são trançados em pares?",
    options: [
      "Para economizar plástico no revestimento externo.",
      "Para reduzir a interferência eletromagnética e a diafonia (crosstalk) entre os pares.",
      "Para permitir que o cabo transporte água e energia elétrica juntos.",
      "Apenas por estética visual dentro do rack."
    ],
    answer: 1
  },
  {
    q: "4. Qual distância máxima recomendada para um segmento de cabo Par Trançado (CAT5e/CAT6) em redes Ethernet?",
    options: ["10 metros", "50 metros", "100 metros", "1.000 metros"],
    answer: 2
  },
  {
    q: "5. Qual destes meios é TOTALMENTE imune a interferências eletromagnéticas (motores, raios, rede elétrica)?",
    options: ["Cabo Coaxial RG-6", "Par Trançado CAT5e", "Fibra Óptica", "Wi-Fi 2.4 GHz"],
    answer: 2
  },
  {
    q: "6. O cabo CAT4 é considerado obsoleto hoje em dia porque sua velocidade máxima era de apenas:",
    options: ["16 Mbps", "1 Gbps", "10 Gbps", "100 Gbps"],
    answer: 0
  },
  {
    q: "7. Qual meio não guiado exige 'visada direta' (linha de visão sem obstáculos) e tem alcance de poucos metros?",
    options: ["Wi-Fi 6", "Satélite LEO", "Infravermelho (IrDA)", "Bluetooth"],
    answer: 2
  },
  {
    q: "8. Qual tecnologia sem fio é padronizada pela norma IEEE 802.11?",
    options: ["Bluetooth", "Wi-Fi", "5G", "NFC"],
    answer: 1
  },
  {
    q: "9. Qual é a principal vantagem da comunicação via satélite em relação à fibra óptica?",
    options: [
      "Menor latência (ping) em jogos online.",
      "Cobertura em áreas remotas, florestas e oceanos onde não há cabos.",
      "Velocidade superior a 100 Tbps.",
      "Não sofre interferência climática."
    ],
    answer: 1
  },
  {
    q: "10. O cabo Coaxial possui uma malha metálica ao redor do condutor central com o objetivo de:",
    options: [
      "Aumentar o peso do cabo.",
      "Servir como blindagem contra ruídos e interferências externas.",
      "Emitir sinal Wi-Fi pelo caminho.",
      "Resfriar o núcleo de vidro."
    ],
    answer: 1
  },
  {
    q: "11. Ao transferir um arquivo de 2 GB, qual meio realizará a tarefa no MENOR tempo?",
    options: ["Par Trançado CAT4", "Bluetooth 5.0", "Cabo Coaxial", "Fibra Óptica"],
    answer: 3
  },
  {
    q: "12. Qual característica diferencia um cabo CAT6 de um CAT5e?",
    options: [
      "O CAT6 suporta frequências maiores (250 MHz) e possui separador interno contra interferências.",
      "O CAT6 usa luz laser em vez de cobre.",
      "O CAT5e tem 8 fios e o CAT6 tem apenas 2 fios.",
      "O CAT6 não usa conector RJ-45."
    ],
    answer: 0
  }
];

let currentQuestion = 0;
let score = 0;

// 1. Login e Mensagem Personalizada
document.getElementById("form-login").addEventListener("submit", function (e) {
  e.preventDefault();
  player.name = document.getElementById("player-name").value.trim();
  player.role = document.getElementById("player-role").value;

  const welcomeEl = document.getElementById("welcome-message");
  let customMsg = "";

  if (player.role === "Estudante Ana Teles") {
    customMsg = `👋 Fala, <strong>${player.name}</strong>! Que orgulho ver um estudante da <strong>Escola Ana Teles</strong> explorando Redes de Computadores! Mostre que você domina a infraestrutura!`;
  } else if (player.role === "Professor(a)") {
    customMsg = `🎓 Seja muito bem-vindo(a), <strong>Prof. ${player.name}</strong>! É uma honra receber você no nosso estande técnico. Sinta-se à vontade para testar nosso simulador!`;
  } else {
    customMsg = `🌟 Olá, <strong>${player.name}</strong>! Seja bem-vindo(a) à nossa Feira das Profissões! Prepare-se para descobrir o que acontece por trás da internet!`;
  }

  welcomeEl.innerHTML = customMsg;
  switchScreen("screen-hub");
});

function switchScreen(screenId) {
  document.querySelectorAll(".card").forEach(c => c.classList.add("hidden"));
  document.getElementById(screenId).classList.remove("hidden");
}

// 2. Abrir Módulos e Desbloqueio do Quiz
function openModule(category) {
  currentCategory = category;
  currentMediaIndex = 0;

  if (category === "guiados") {
    visited.guiados = true;
    const tag = document.getElementById("tag-guiados");
    tag.textContent = "✔ Explorado";
    tag.classList.add("done");
    document.getElementById("module-title").textContent = "🔌 Meios Guiados (Cabos)";
  } else {
    visited.naoGuiados = true;
    const tag = document.getElementById("tag-nao-guiados");
    tag.textContent = "✔ Explorado";
    tag.classList.add("done");
    document.getElementById("module-title").textContent = "📶 Meios Não Guiados (Sem Fio)";
  }

  checkQuizUnlock();
  renderMediaTabs();
  loadMediaDetails(0);
  switchScreen("screen-simulator");
}

function checkQuizUnlock() {
  if (visited.guiados && visited.naoGuiados) {
    const btnQuiz = document.getElementById("btn-quiz");
    const tagQuiz = document.getElementById("tag-quiz");
    btnQuiz.disabled = false;
    btnQuiz.classList.remove("locked");
    tagQuiz.textContent = "🔓 Liberado!";
    tagQuiz.classList.add("done");
  }
}

function backToHub() {
  clearInterval(simInterval);
  switchScreen("screen-hub");
}

// 3. Renderizar Abas e Detalhes do Meio Selecionado
function renderMediaTabs() {
  const container = document.getElementById("media-selector");
  container.innerHTML = "";
  mediaData[currentCategory].forEach((item, index) => {
    const btn = document.createElement("button");
    btn.className = "media-tab" + (index === 0 ? " active" : "");
    btn.textContent = `${item.icon} ${item.name.split(" (")[0]}`;
    btn.onclick = () => {
      document.querySelectorAll(".media-tab").forEach(b => b.classList.remove("active"));
      btn.classList.add("active");
      loadMediaDetails(index);
    };
    container.appendChild(btn);
  });
}

function loadMediaDetails(index) {
  currentMediaIndex = index;
  const item = mediaData[currentCategory][index];

  document.getElementById("media-icon").textContent = item.icon;
  document.getElementById("media-name").textContent = item.name;
  document.getElementById("media-type-badge").textContent = item.type;
  document.getElementById("media-speed").textContent = item.speedText;
  document.getElementById("media-range").textContent = item.range;
  document.getElementById("media-use").textContent = item.use;
  document.getElementById("media-comparison").textContent = item.comparison;

  // Configurar Animação
  const channel = document.getElementById("signal-channel");
  const pulse = document.getElementById("signal-pulse");
  if (currentCategory === "nao-guiados") {
    channel.classList.add("wireless");
    document.getElementById("signal-description").textContent = "Propagação por ondas eletromagnéticas no espaço livre";
  } else {
    channel.classList.remove("wireless");
    document.getElementById("signal-description").textContent = "Sinal confinado fisicamente no interior do cabo";
  }

  pulse.style.background = item.pulseColor;
  pulse.style.boxShadow = `0 0 12px ${item.pulseColor}`;
  pulse.style.animationDuration = item.animDuration;

  runTransferSimulation();
}

// 4. Simulador de Tempo de Transferência
function runTransferSimulation() {
  clearInterval(simInterval);
  const item = mediaData[currentCategory][currentMediaIndex];
  const fileSizeGB = parseFloat(document.getElementById("file-size").value);

  // Conversão: 1 GB = 8.000 Megabits (decimal de redes)
  const totalMegabits = fileSizeGB * 8000;
  // Considerando eficiência real aproximada de 85% do protocolo
  const effectiveMbps = item.speedMbps * 0.85;
  const secondsReal = totalMegabits / effectiveMbps;

  const progressBar = document.getElementById("sim-progress");
  const resultText = document.getElementById("sim-result");
  progressBar.style.width = "0%";

  // Formatar tempo legível
  let formattedTime = "";
  if (secondsReal < 1) {
    formattedTime = `${(secondsReal * 1000).toFixed(0)} milissegundos (Instantâneo!)`;
  } else if (secondsReal < 60) {
    formattedTime = `${secondsReal.toFixed(1)} segundos`;
  } else {
    const mins = Math.floor(secondsReal / 60);
    const secs = Math.round(secondsReal % 60);
    formattedTime = `${mins} min e ${secs} seg`;
  }

  // Animação visual acelerada proporcional (entre 0.4s e 4s na tela)
  const visualDurationMs = Math.min(Math.max(secondsReal * 80, 400), 4000);
  const stepTime = 40;
  const increment = (stepTime / visualDurationMs) * 100;
  let progress = 0;

  resultText.textContent = `Calculando envio de ${fileSizeGB} GB via ${item.name}...`;

  simInterval = setInterval(() => {
    progress += increment;
    if (progress >= 100) {
      progress = 100;
      clearInterval(simInterval);
      resultText.innerHTML = `✅ Tempo estimado real para <strong>${fileSizeGB} GB</strong>: <u>${formattedTime}</u> (Taxa efetiva ~${effectiveMbps.toFixed(0)} Mbps)`;
    }
    progressBar.style.width = progress + "%";
  }, stepTime);
}

// 5. Lógica do Quiz
function startQuiz() {
  currentQuestion = 0;
  score = 0;
  switchScreen("screen-quiz");
  renderQuestion();
}

function renderQuestion() {
  const qObj = quizQuestions[currentQuestion];
  document.getElementById("quiz-progress").textContent = `Questão ${currentQuestion + 1} de ${quizQuestions.length}`;
  document.getElementById("quiz-score-live").textContent = `Acertos: ${score}`;
  document.getElementById("question-text").textContent = qObj.q;

  const optionsDiv = document.getElementById("options-container");
  optionsDiv.innerHTML = "";

  qObj.options.forEach((optText, idx) => {
    const btn = document.createElement("button");
    btn.className = "option-btn";
    btn.textContent = optText;
    btn.onclick = () => selectAnswer(idx, btn);
    optionsDiv.appendChild(btn);
  });
}

function selectAnswer(selectedIdx, btnClicked) {
  const qObj = quizQuestions[currentQuestion];
  const buttons = document.querySelectorAll(".option-btn");
  buttons.forEach(b => (b.disabled = true));

  if (selectedIdx === qObj.answer) {
    btnClicked.classList.add("correct");
    score++;
  } else {
    btnClicked.classList.add("wrong");
    buttons[qObj.answer].classList.add("correct");
  }

  setTimeout(() => {
    currentQuestion++;
    if (currentQuestion < quizQuestions.length) {
      renderQuestion();
    } else {
      finishQuiz();
    }
  }, 1100);
}

// 6. Finalização, Premiação e Envio para Google Sheets
function finishQuiz() {
  switchScreen("screen-result");
  const total = quizQuestions.length;
  const trophy = document.getElementById("trophy-icon");
  const prizeBox = document.getElementById("prize-box");
  let premioStatus = "Participação";

  document.getElementById("result-summary").innerHTML =
    `<strong>${player.name}</strong> (${player.role}), você acertou <strong>${score} de ${total}</strong> questões!`;

  if (score === total) {
    trophy.textContent = "👑";
    premioStatus = "PREMIAÇÃO MÁXIMA (12/12)";
    prizeBox.innerHTML = `🎉 <strong>GABARITOU! PARABÉNS!</strong><br>Mostre esta tela para a equipe do estande de Informática para retirar seu <strong>BRINDE EXCLUSIVO</strong>!`;
    prizeBox.style.borderColor = "#22c55e";
  } else if (score >= 9) {
    trophy.textContent = "🥇";
    premioStatus = "Medalha de Ouro (9-11)";
    prizeBox.innerHTML = `🔥 <strong>Excelente desempenho!</strong> Você já manda muito bem em infraestrutura de redes!`;
  } else if (score >= 6) {
    trophy.textContent = "🥈";
    premioStatus = "Medalha de Prata (6-8)";
    prizeBox.innerHTML = `👏 <strong>Bom trabalho!</strong> Você acertou mais da metade do desafio!`;
  } else {
    trophy.textContent = "📘";
    premioStatus = "Aprendiz de Redes (<6)";
    prizeBox.innerHTML = `💡 <strong>Valeu pela participação!</strong> Que tal revisar os simuladores e tentar novamente?`;
  }

  // Enviar dados para o Google Drive (Planilha)
  sendToGoogleSheets(premioStatus);
}

function sendToGoogleSheets(premioStatus) {
  const syncEl = document.getElementById("sync-status");

  if (GOOGLE_SCRIPT_URL.includes("SEU_ID_AQUI")) {
    syncEl.textContent = "⚠️ Configure a URL do Google Apps Script no script.js para salvar na planilha.";
    return;
  }

  fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors", // Evita bloqueio de CORS no GitHub Pages
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: player.name,
      perfil: player.role,
      pontuacao: score,
      total: quizQuestions.length,
      premio: premioStatus
    })
  })
    .then(() => {
      syncEl.textContent = "✅ Participação registrada com sucesso na planilha do estande!";
      syncEl.style.color = "#22c55e";
    })
    .catch(() => {
      syncEl.textContent = "❌ Não foi possível conectar à planilha (verifique a internet).";
      syncEl.style.color = "#ef4444";
    });
}
