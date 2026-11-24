// COLE AQUI A URL DO SEU GOOGLE APPS SCRIPT (/exec)
const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbwZQxEHK3bCsHYjFX2oFbbquPbP4F_boufquTLc_gGKZbOKsIY3ESTfFy0dseI0Ffza/exec";

const QUIZ_LENGTH = 12;

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
      image: "assets/img/cabo-coaxial.jpg",
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
      image: "assets/img/par-trancado-cat4.jpg",
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
      image: "assets/img/par-trancado-cat5e.jpg",
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
      image: "assets/img/par-trancado-cat6.jpg",
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
      image: "assets/img/fibra-optica.jpg",
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
      image: "assets/img/infravermelho-irda.jpg",
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
      image: "assets/img/bluetooth.jpg",
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
      image: "assets/img/wifi.jpg",
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
      image: "assets/img/radio-enlace.jpg",
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
      image: "assets/img/satelite.jpg",
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

// Banco com 24 Questões Objetivas (12 sorteadas por partida, com alternativas embaralhadas)
const questionBank = [
  {
    q: "Qual é a principal diferença entre meios guiados e não guiados?",
    options: [
      "Meios guiados usam cabos físicos para confinar o sinal; não guiados propagam ondas pelo ar/espaço.",
      "Meios guiados funcionam apenas sem eletricidade; não guiados precisam de fibra óptica.",
      "Meios não guiados são sempre mais rápidos que qualquer cabo físico.",
      "Não existe diferença técnica, apenas o preço do equipamento."
    ],
    answer: 0
  },
  {
    q: "Qual meio de transmissão transporta dados através de pulsos de luz?",
    options: ["Cabo Coaxial", "Par Trançado CAT6", "Fibra Óptica", "Cabo Serial"],
    answer: 2
  },
  {
    q: "Por que os fios dentro de um cabo UTP (CAT5e/CAT6) são trançados em pares?",
    options: [
      "Para economizar plástico no revestimento externo.",
      "Para reduzir a interferência eletromagnética e a diafonia (crosstalk) entre os pares.",
      "Para permitir que o cabo transporte água e energia elétrica juntos.",
      "Apenas por estética visual dentro do rack."
    ],
    answer: 1
  },
  {
    q: "Qual distância máxima recomendada para um segmento de cabo Par Trançado (CAT5e/CAT6) em redes Ethernet?",
    options: ["10 metros", "50 metros", "100 metros", "1.000 metros"],
    answer: 2
  },
  {
    q: "Qual destes meios é TOTALMENTE imune a interferências eletromagnéticas (motores, raios, rede elétrica)?",
    options: ["Cabo Coaxial RG-6", "Par Trançado CAT5e", "Fibra Óptica", "Wi-Fi 2.4 GHz"],
    answer: 2
  },
  {
    q: "O cabo CAT4 é considerado obsoleto hoje em dia porque sua velocidade máxima era de apenas:",
    options: ["16 Mbps", "1 Gbps", "10 Gbps", "100 Gbps"],
    answer: 0
  },
  {
    q: "Qual meio não guiado exige 'visada direta' (linha de visão sem obstáculos) e tem alcance de poucos metros?",
    options: ["Wi-Fi 6", "Satélite LEO", "Infravermelho (IrDA)", "Bluetooth"],
    answer: 2
  },
  {
    q: "Qual tecnologia sem fio é padronizada pela norma IEEE 802.11?",
    options: ["Bluetooth", "Wi-Fi", "5G", "NFC"],
    answer: 1
  },
  {
    q: "Qual é a principal vantagem da comunicação via satélite em relação à fibra óptica?",
    options: [
      "Menor latência (ping) em jogos online.",
      "Cobertura em áreas remotas, florestas e oceanos onde não há cabos.",
      "Velocidade superior a 100 Tbps.",
      "Não sofre interferência climática."
    ],
    answer: 1
  },
  {
    q: "O cabo Coaxial possui uma malha metálica ao redor do condutor central com o objetivo de:",
    options: [
      "Aumentar o peso do cabo.",
      "Servir como blindagem contra ruídos e interferências externas.",
      "Emitir sinal Wi-Fi pelo caminho.",
      "Resfriar o núcleo de vidro."
    ],
    answer: 1
  },
  {
    q: "Ao transferir um arquivo de 2 GB, qual meio realizará a tarefa no MENOR tempo?",
    options: ["Par Trançado CAT4", "Bluetooth 5.0", "Cabo Coaxial", "Fibra Óptica"],
    answer: 3
  },
  {
    q: "Qual característica diferencia um cabo CAT6 de um CAT5e?",
    options: [
      "O CAT6 suporta frequências maiores (250 MHz) e possui separador interno contra interferências.",
      "O CAT6 usa luz laser em vez de cobre.",
      "O CAT5e tem 8 fios e o CAT6 tem apenas 2 fios.",
      "O CAT6 não usa conector RJ-45."
    ],
    answer: 0
  },
  {
    q: "Qual tipo de fibra óptica é mais indicada para longas distâncias (dezenas de quilômetros) com um único feixe de luz?",
    options: ["Fibra Monomodo", "Fibra Multimodo", "Fibra Coaxial", "Fibra Plástica IrDA"],
    answer: 0
  },
  {
    q: "Qual conector é o padrão mais comum nas extremidades de cabos de par trançado em redes Ethernet?",
    options: ["BNC", "RJ-45", "SC-APC", "HDMI"],
    answer: 1
  },
  {
    q: "O que significa a sigla UTP em cabos de par trançado?",
    options: [
      "Universal Transmission Protocol",
      "Unshielded Twisted Pair (Par Trançado Não Blindado)",
      "Ultra Transfer Port",
      "Unified Terminal Plug"
    ],
    answer: 1
  },
  {
    q: "Por que dobrar uma fibra óptica em ângulos muito fechados prejudica o sinal?",
    options: [
      "Porque derrete o revestimento de cobre.",
      "Porque pode causar microfraturas ou perda da reflexão interna total da luz.",
      "Porque inverte a polaridade elétrica.",
      "Porque aumenta a frequência do Bluetooth."
    ],
    answer: 1
  },
  {
    q: "Qual é uma vantagem típica de satélites de órbita terrestre baixa (LEO) frente aos geoestacionários (GEO)?",
    options: [
      "Menor distância até a Terra, reduzindo a latência (tempo de resposta).",
      "Eliminam totalmente a necessidade de antenas.",
      "Funcionam apenas debaixo d'água.",
      "Têm alcance limitado a 50 metros."
    ],
    answer: 0
  },
  {
    q: "Em ambientes com muitas paredes de concreto ou espelhos, qual comportamento ocorre com o sinal Wi-Fi?",
    options: [
      "Atenuação e reflexões que reduzem a intensidade e o alcance do sinal.",
      "Aumento automático da velocidade em 10 vezes.",
      "Conversão do sinal de rádio em pulso óptico.",
      "Nenhuma alteração, pois paredes amplificam ondas de rádio."
    ],
    answer: 0
  },
  {
    q: "Qual meio não guiado é mais voltado para redes pessoais de curto alcance (WPAN) e baixo consumo de energia em fones e sensores?",
    options: ["Bluetooth", "Rádio Enlace de 30 km", "Satélite GEO", "Cabo CAT6a"],
    answer: 0
  },
  {
    q: "O que caracteriza um rádio enlace (micro-ondas terrestre) entre duas torres?",
    options: [
      "Uso de cabos submarinos intercontinentais.",
      "Feixe direcional que exige visada direta e pode sofrer atenuação em chuvas intensas.",
      "Conexão limitada a controles remotos dentro de uma sala.",
      "Transmissão apenas por corrente contínua em cobre."
    ],
    answer: 1
  },
  {
    q: "Qual categoria de par trançado atinge até 10 Gbps na distância padrão completa de 100 metros?",
    options: ["CAT4", "CAT5", "CAT6a", "RG-59"],
    answer: 2
  },
  {
    q: "Qual meio guiado foi amplamente usado em redes antigas e em TV a cabo/DOCSIS, mas perdeu espaço para par trançado e fibra em LANs?",
    options: ["Cabo Coaxial", "Infravermelho", "Bluetooth", "Satélite"],
    answer: 0
  },
  {
    q: "Por que a fibra óptica é a escolha padrão para cabos submarinos que ligam continentes?",
    options: [
      "Porque o cobre não existe no fundo do mar.",
      "Porque oferece altíssima capacidade, baixa atenuação em longas distâncias e não sofre interferência eletromagnética.",
      "Porque dispensa qualquer equipamento de transmissão nas pontas.",
      "Porque funciona sem necessidade de cabos."
    ],
    answer: 1
  },
  {
    q: "Se um cabo de rede CAT5e passa muito próximo a um motor industrial ou fiação elétrica de alta potência, o que pode acontecer?",
    options: [
      "Interferência eletromagnética causando perda de pacotes ou queda de desempenho.",
      "O cabo se transforma em fibra óptica monomodo.",
      "A distância máxima passa a ser de 80 km.",
      "O sinal de rádio melhora automaticamente."
    ],
    answer: 0
  }
];

let activeQuestions = [];
let currentQuestion = 0;
let score = 0;

// Embaralhamento Fisher-Yates genérico
function shuffleArray(list) {
  const copy = list.slice();
  for (let i = copy.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [copy[i], copy[j]] = [copy[j], copy[i]];
  }
  return copy;
}

// Sorteia `count` questões e embaralha as alternativas de cada uma sem perder o gabarito
function drawRandomQuestions(bank, count) {
  const selectedQuestions = shuffleArray(bank).slice(0, Math.min(count, bank.length));

  return selectedQuestions.map((qObj) => {
    const indexedOptions = qObj.options.map((text, idx) => ({
      text,
      isCorrect: idx === qObj.answer
    }));

    const shuffledOptions = shuffleArray(indexedOptions);

    return {
      q: qObj.q,
      options: shuffledOptions.map((item) => item.text),
      answer: shuffledOptions.findIndex((item) => item.isCorrect)
    };
  });
}

// 1. Login e Mensagem Personalizada
document.getElementById("form-login").addEventListener("submit", function (e) {
  e.preventDefault();
  player.name = document.getElementById("player-name").value.trim();
  player.role = document.getElementById("player-role").value;

  const welcomeEl = document.getElementById("welcome-message");
  let customMsg = "";

  if (player.role === "Estudante Ana Teles") {
    customMsg = `👋 Fala, <strong>${escapeHtml(player.name)}</strong>! Que orgulho ver um estudante da <strong>Escola Ana Teles</strong> explorando Redes de Computadores! Mostre que você domina a infraestrutura!`;
  } else if (player.role === "Professor(a)") {
    customMsg = `🎓 Seja muito bem-vindo(a), <strong>Prof. ${escapeHtml(player.name)}</strong>! É uma honra receber você no nosso estande técnico. Sinta-se à vontade para testar nosso simulador!`;
  } else {
    customMsg = `🌟 Olá, <strong>${escapeHtml(player.name)}</strong>! Seja bem-vindo(a) à nossa Feira das Profissões! Prepare-se para descobrir o que acontece por trás da internet!`;
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

function setFallbackIcon(imgEl, iconEl, fallbackEmoji) {
  imgEl.classList.add("hidden");
  imgEl.removeAttribute("src");
  iconEl.textContent = fallbackEmoji;
  iconEl.classList.remove("hidden");
}

function loadMediaDetails(index) {
  currentMediaIndex = index;
  const item = mediaData[currentCategory][index];

  const imgEl = document.getElementById("media-image");
  const iconEl = document.getElementById("media-icon");

  // Exibe ícone reserva por padrão até confirmar carregamento da imagem
  setFallbackIcon(imgEl, iconEl, item.icon);

  if (item.image) {
    imgEl.alt = item.name;
    imgEl.onload = () => {
      iconEl.classList.add("hidden");
      imgEl.classList.remove("hidden");
    };
    imgEl.onerror = () => {
      setFallbackIcon(imgEl, iconEl, item.icon);
    };
    imgEl.src = item.image;
  }

  document.getElementById("media-name").textContent = item.name;
  document.getElementById("media-type-badge").textContent = item.type;
  document.getElementById("media-speed").textContent = item.speedText;
  document.getElementById("media-range").textContent = item.range;
  document.getElementById("media-use").textContent = item.use;
  document.getElementById("media-comparison").textContent = item.comparison;

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

  const totalMegabits = fileSizeGB * 8000;
  const effectiveMbps = item.speedMbps * 0.85;
  const secondsReal = totalMegabits / effectiveMbps;

  const progressBar = document.getElementById("sim-progress");
  const resultText = document.getElementById("sim-result");
  progressBar.style.width = "0%";

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

// 5. Lógica do Quiz (Sorteia 12 das 24 questões e embaralha alternativas)
function startQuiz() {
  activeQuestions = drawRandomQuestions(questionBank, QUIZ_LENGTH);
  currentQuestion = 0;
  score = 0;
  switchScreen("screen-quiz");
  renderQuestion();
}

function renderQuestion() {
  const qObj = activeQuestions[currentQuestion];
  document.getElementById("quiz-progress").textContent = `Questão ${currentQuestion + 1} de ${activeQuestions.length}`;
  document.getElementById("quiz-score-live").textContent = `Acertos: ${score}`;
  document.getElementById("question-text").textContent = `${currentQuestion + 1}. ${qObj.q}`;

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
  const qObj = activeQuestions[currentQuestion];
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
    if (currentQuestion < activeQuestions.length) {
      renderQuestion();
    } else {
      finishQuiz();
    }
  }, 1100);
}

// 6. Finalização, Premiação e Envio para Google Sheets
function finishQuiz() {
  switchScreen("screen-result");
  const total = activeQuestions.length;
  const trophy = document.getElementById("trophy-icon");
  const prizeBox = document.getElementById("prize-box");
  let premioStatus = "Participação";

  document.getElementById("result-summary").innerHTML =
    `<strong>${escapeHtml(player.name)}</strong> (${escapeHtml(player.role)}), você acertou <strong>${score} de ${total}</strong> questões!`;

  if (score === total) {
    trophy.textContent = "👑";
    premioStatus = `PREMIAÇÃO MÁXIMA (${total}/${total})`;
    prizeBox.innerHTML = `🎉 <strong>GABARITOU! PARABÉNS!</strong><br>Mostre esta tela para a equipe do estande de Informática para retirar seu <strong>BRINDE EXCLUSIVO</strong>!`;
    prizeBox.style.borderColor = "#22c55e";
  } else if (score >= 9) {
    trophy.textContent = "🥇";
    premioStatus = "Medalha de Ouro (9-11)";
    prizeBox.innerHTML = `🔥 <strong>Excelente desempenho!</strong> Você já manda muito bem em infraestrutura de redes!`;
    prizeBox.style.borderColor = "#f59e0b";
  } else if (score >= 6) {
    trophy.textContent = "🥈";
    premioStatus = "Medalha de Prata (6-8)";
    prizeBox.innerHTML = `👏 <strong>Bom trabalho!</strong> Você acertou mais da metade do desafio!`;
    prizeBox.style.borderColor = "#38bdf8";
  } else {
    trophy.textContent = "📘";
    premioStatus = "Aprendiz de Redes (<6)";
    prizeBox.innerHTML = `💡 <strong>Valeu pela participação!</strong> Que tal revisar os simuladores e tentar novamente?`;
    prizeBox.style.borderColor = "#64748b";
  }

  sendToGoogleSheets(premioStatus, total);
}

function sendToGoogleSheets(premioStatus, totalQuestions) {
  const syncEl = document.getElementById("sync-status");

  if (GOOGLE_SCRIPT_URL.includes("SEU_ID_AQUI")) {
    syncEl.textContent = "⚠️ Configure a URL do Google Apps Script no script.js para salvar na planilha.";
    return;
  }

  syncEl.textContent = "⏳ Registrando sua participação na planilha da feira...";
  syncEl.style.color = "#94a3b8";

  fetch(GOOGLE_SCRIPT_URL, {
    method: "POST",
    mode: "no-cors",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      nome: player.name,
      perfil: player.role,
      pontuacao: score,
      total: totalQuestions,
      premio: premioStatus
    })
  })
    .then(() => {
      syncEl.textContent = "✅ Participação registrada com sucesso no ranking da feira!";
      syncEl.style.color = "#22c55e";
    })
    .catch(() => {
      syncEl.textContent = "❌ Não foi possível conectar à planilha (verifique a internet).";
      syncEl.style.color = "#ef4444";
    });
}

// 7. Carregamento do Top 5 Ranking ao Vivo (doGet)
async function loadRanking() {
  const listEl = document.getElementById("ranking-list");
  if (!listEl) return;

  if (GOOGLE_SCRIPT_URL.includes("SEU_ID_AQUI")) {
    listEl.innerHTML = `<li class="ranking-empty">Configure a URL do Apps Script para exibir o ranking.</li>`;
    return;
  }

  listEl.innerHTML = `<li class="ranking-empty">⏳ Buscando pontuações...</li>`;

  try {
    const response = await fetch(GOOGLE_SCRIPT_URL);
    const data = await response.json();

    if (!data.ranking || data.ranking.length === 0) {
      listEl.innerHTML = `<li class="ranking-empty">Nenhuma pontuação registrada ainda. Seja o primeiro!</li>`;
      return;
    }

    const medals = ["🥇", "🥈", "🥉", "4º", "5º"];
    listEl.innerHTML = "";

    data.ranking.forEach((playerRow, idx) => {
      const li = document.createElement("li");
      li.className = "ranking-item";
      li.innerHTML = `
        <span>${medals[idx] || (idx + 1) + "º"} <strong>${escapeHtml(playerRow.nome)}</strong> <small style="color:#94a3b8">(${escapeHtml(playerRow.perfil)})</small></span>
        <span class="ranking-score">${playerRow.pontuacao}/${playerRow.total}</span>
      `;
      listEl.appendChild(li);
    });
  } catch (err) {
    listEl.innerHTML = `<li class="ranking-empty">⚠️ Não foi possível carregar o ranking agora.</li>`;
  }
}

// 8. Reiniciar Jogo sem recarregar a página inteira e atualizar Ranking
function resetGame() {
  clearInterval(simInterval);
  player = { name: "", role: "" };
  visited = { guiados: false, naoGuiados: false };
  currentCategory = "guiados";
  currentMediaIndex = 0;
  activeQuestions = [];
  currentQuestion = 0;
  score = 0;

  document.getElementById("form-login").reset();

  const tagGuiados = document.getElementById("tag-guiados");
  tagGuiados.textContent = "Pendente";
  tagGuiados.classList.remove("done");

  const tagNaoGuiados = document.getElementById("tag-nao-guiados");
  tagNaoGuiados.textContent = "Pendente";
  tagNaoGuiados.classList.remove("done");

  const btnQuiz = document.getElementById("btn-quiz");
  const tagQuiz = document.getElementById("tag-quiz");
  btnQuiz.disabled = true;
  btnQuiz.classList.add("locked");
  tagQuiz.textContent = "🔒 Bloqueado";
  tagQuiz.classList.remove("done");

  switchScreen("screen-login");
  loadRanking();
}

function escapeHtml(text) {
  const div = document.createElement("div");
  div.textContent = text;
  return div.innerHTML;
}

// Inicializa o ranking ao carregar a página e atualiza a cada 30 segundos
window.addEventListener("DOMContentLoaded", () => {
  loadRanking();
  setInterval(loadRanking, 30000);
});