/* ============================================================
   LUMIÈRE BLANCHE — Tirage IA
   Module complet : cartes, flip, appel API Claude
   ============================================================ */

(function () {
  'use strict';

  // ── Deck complet de 22 arcanes majeurs ──
  const DECK = [
    { id: 0,  name: 'Le Mat',         emoji: '🃏', keywords: 'Liberté · Nouveau départ · Innocence',   energy: 'Féminin-Neutre', element: 'Air' },
    { id: 1,  name: 'Le Bateleur',    emoji: '🎩', keywords: 'Habileté · Créativité · Pouvoir',        energy: 'Masculin',       element: 'Feu' },
    { id: 2,  name: 'La Papesse',     emoji: '📖', keywords: 'Intuition · Mystère · Sagesse',           energy: 'Féminin',        element: 'Eau' },
    { id: 3,  name: "L'Impératrice",  emoji: '🌸', keywords: 'Abondance · Fertilité · Création',       energy: 'Féminin',        element: 'Terre' },
    { id: 4,  name: "L'Empereur",     emoji: '👑', keywords: 'Autorité · Structure · Stabilité',       energy: 'Masculin',       element: 'Feu' },
    { id: 5,  name: 'Le Pape',        emoji: '🔮', keywords: 'Tradition · Guidance · Spiritualité',    energy: 'Masculin',       element: 'Terre' },
    { id: 6,  name: "L'Amoureux",     emoji: '💞', keywords: 'Choix · Amour · Dualité',                energy: 'Féminin-Masculin', element: 'Air' },
    { id: 7,  name: 'Le Chariot',     emoji: '🏆', keywords: 'Victoire · Volonté · Maîtrise',          energy: 'Masculin',       element: 'Eau' },
    { id: 8,  name: 'La Force',       emoji: '🦁', keywords: 'Courage · Patience · Maîtrise intérieure', energy: 'Féminin',      element: 'Feu' },
    { id: 9,  name: "L'Hermite",      emoji: '🕯️', keywords: 'Solitude · Recherche · Sagesse intérieure', energy: 'Masculin',  element: 'Terre' },
    { id: 10, name: 'La Roue',        emoji: '☯️', keywords: 'Cycles · Destin · Transformation',       energy: 'Neutre',         element: 'Feu' },
    { id: 11, name: 'La Justice',     emoji: '⚖️', keywords: 'Équilibre · Vérité · Karma',             energy: 'Féminin',        element: 'Air' },
    { id: 12, name: 'Le Pendu',       emoji: '🌀', keywords: 'Sacrifice · Lâcher-prise · Révélation',  energy: 'Masculin',       element: 'Eau' },
    { id: 13, name: "L'Arcane XIII",  emoji: '🌑', keywords: 'Transformation · Fin · Renaissance',     energy: 'Neutre',         element: 'Eau' },
    { id: 14, name: 'La Tempérance',  emoji: '🌊', keywords: 'Harmonie · Patience · Équilibre',        energy: 'Féminin',        element: 'Feu' },
    { id: 15, name: 'Le Diable',      emoji: '🔗', keywords: 'Attachement · Matière · Illusion',       energy: 'Masculin',       element: 'Terre' },
    { id: 16, name: 'La Maison Dieu', emoji: '⚡', keywords: 'Rupture · Révélation · Libération',      energy: 'Neutre',         element: 'Feu' },
    { id: 17, name: "L'Étoile",       emoji: '⭐', keywords: 'Espoir · Renouveau · Guidance divine',   energy: 'Féminin',        element: 'Air' },
    { id: 18, name: 'La Lune',        emoji: '🌙', keywords: 'Inconscient · Illusion · Intuition',     energy: 'Féminin',        element: 'Eau' },
    { id: 19, name: 'Le Soleil',      emoji: '☀️', keywords: 'Joie · Vitalité · Succès',               energy: 'Masculin',       element: 'Feu' },
    { id: 20, name: 'Le Jugement',    emoji: '📯', keywords: 'Éveil · Renaissance · Appel intérieur',  energy: 'Neutre',         element: 'Feu' },
    { id: 21, name: 'Le Monde',       emoji: '🌍', keywords: 'Accomplissement · Totalité · Intégration', energy: 'Féminin',     element: 'Terre' },
  ];

  // ── Positions du tirage ──
  const POSITIONS = [
    { label: 'Le Passé',    desc: 'Ce qui vous a formé' },
    { label: 'Le Présent',  desc: 'Où vous en êtes' },
    { label: "L'Avenir",   desc: 'Ce qui s\'annonce' },
  ];

  // ── State ──
  let currentDraw = [];
  let flippedCount = 0;
  let isLoadingAI = false;

  // ── DOM refs ──
  const cardsArea      = document.getElementById('cardsArea');
  const tirageBtn      = document.getElementById('tirageBtn');
  const readingResult  = document.getElementById('readingResult');
  const readingLoading = document.getElementById('readingLoading');
  const readingContent = document.getElementById('readingContent');
  const readingError   = document.getElementById('readingError');
  const readingText    = document.getElementById('readingText');
  const readingCardsSummary = document.getElementById('readingCardsSummary');
  const intentionInput = document.getElementById('intentionInput');
  const intentionCount = document.getElementById('intentionCount');
  const tirageHint     = document.getElementById('tirageHint');
  const copyReading    = document.getElementById('copyReading');
  const bookAfterReading = document.getElementById('bookAfterReading');

  // ── Section tirage absente de la page : on n'initialise rien ──
  if (!cardsArea || !tirageBtn || !intentionInput) return;

  // ── Intention counter ──
  intentionInput.addEventListener('input', () => {
    intentionCount.textContent = intentionInput.value.length;
  });

  // ── Draw 3 unique cards ──
  function drawCards() {
    const shuffled = [...DECK].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3).map((card, i) => ({
      ...card,
      position: POSITIONS[i],
      reversed: Math.random() < 0.25, // 25% chance reversed
    }));
  }

  // ── Build card HTML ──
  function buildCard(card, index) {
    const el = document.createElement('div');
    el.className = 'tarot-card';
    el.dataset.index = index;

    // Color per element
    const elementColors = {
      'Feu': '#f59e0b', 'Eau': '#22d3ee',
      'Terre': '#34d399', 'Air': '#a78bfa'
    };
    const color = elementColors[card.element] || '#d4af37';
    el.style.setProperty('--card-glow', color + '55');

    el.innerHTML = `
      <div class="card-position-label">${card.position.label}</div>
      <div class="card-inner">
        <div class="card-face card-back">
          <div class="card-back-pattern"></div>
          <span class="card-back-symbol">✦</span>
        </div>
        <div class="card-face card-front ${card.reversed ? 'card-reversed' : ''}">
          <div class="card-front-element" style="color:${color}">${card.element}</div>
          <div class="card-front-art" style="filter: drop-shadow(0 0 12px ${color})">${card.emoji}</div>
          <div class="card-front-name">${card.name}${card.reversed ? ' ↓' : ''}</div>
          <div class="card-front-keywords">${card.keywords}</div>
        </div>
      </div>
      <p class="card-prompt">Retourner</p>
    `;

    // Click to flip
    el.addEventListener('click', () => flipCard(el, index));

    // Entrance animation stagger
    el.style.opacity = '0';
    el.style.transform = 'translateY(50px) scale(0.9)';
    setTimeout(() => {
      el.style.transition = 'opacity 0.7s ease, transform 0.7s cubic-bezier(0.25,0.8,0.25,1)';
      el.style.opacity = '1';
      el.style.transform = 'translateY(0) scale(1)';
    }, index * 250 + 100);

    return el;
  }

  // ── Flip card ──
  function flipCard(el, index) {
    if (el.classList.contains('flipped') || isLoadingAI) return;
    el.classList.add('flipped');
    el.querySelector('.card-prompt').style.display = 'none';
    flippedCount++;
    updateHint();
    if (flippedCount === 3) {
      setTimeout(() => triggerAIReading(), 600);
    }
  }

  // ── Update hint text ──
  function updateHint() {
    if (!tirageHint) return;
    const remaining = 3 - flippedCount;
    if (remaining > 0) {
      tirageHint.textContent = `✦ ${remaining} carte${remaining > 1 ? 's' : ''} à retourner`;
    } else {
      tirageHint.textContent = 'L\'IA analyse votre tirage...';
    }
  }

  // ── Build & render deck ──
  function buildDeck() {
    cardsArea.innerHTML = '';
    flippedCount = 0;
    currentDraw = drawCards();
    readingResult.style.display = 'none';
    if (tirageHint) tirageHint.textContent = 'Cliquez sur chaque carte pour la retourner';

    currentDraw.forEach((card, i) => {
      const el = buildCard(card, i);
      cardsArea.appendChild(el);
    });

    // Re-bind hover for custom cursor
    document.querySelectorAll('.tarot-card').forEach(el => {
      const cursor = document.getElementById('cursor');
      if (cursor) {
        el.addEventListener('mouseenter', () => cursor.classList.add('hover'));
        el.addEventListener('mouseleave', () => cursor.classList.remove('hover'));
      }
    });
  }

  // ── Trigger AI reading ──
  async function triggerAIReading() {
    isLoadingAI = true;
    readingResult.style.display = 'block';
    readingLoading.style.display = 'flex';
    readingContent.style.display = 'none';
    readingError.style.display = 'none';

    // Build cards summary display
    readingCardsSummary.innerHTML = currentDraw.map(c =>
      `<span class="reading-card-chip">${c.emoji} ${c.name}${c.reversed ? ' ↓' : ''}</span>`
    ).join('');

    // Scroll to result
    setTimeout(() => readingResult.scrollIntoView({ behavior: 'smooth', block: 'center' }), 200);

    const intention = intentionInput.value.trim();
    const prompt = buildPrompt(currentDraw, intention);

    try {
      const text = await callAnthropicAPI(prompt);
      readingLoading.style.display = 'none';
      readingContent.style.display = 'block';
      typewriterEffect(readingText, text);
    } catch (err) {
      console.error('[LumièreBlanche] Erreur API:', err);
      readingLoading.style.display = 'none';
      readingError.style.display = 'block';
    } finally {
      isLoadingAI = false;
    }
  }

  // ── Build AI prompt ──
  function buildPrompt(cards, intention) {
    const cardDetails = cards.map((c, i) => `
- Position ${i + 1} (${c.position.label} — ${c.position.desc}) : ${c.name}${c.reversed ? ' RENVERSÉE' : ''}
  Mots-clés : ${c.keywords}
  Énergie : ${c.energy} | Élément : ${c.element}`).join('');

    return `Tu es une lectrice de tarot spirituelle et bienveillante nommée Lumière Blanche, spécialisée dans la guidance des âmes en quête de sens. Tu parles en français avec une voix douce, poétique et profonde.

L'utilisateur a tiré 3 cartes du Tarot de Marseille :
${cardDetails}

${intention ? `Intention / Question de l'utilisateur : "${intention}"` : 'L\'utilisateur n\'a pas précisé d\'intention particulière — propose une lecture générale sur son chemin de vie.'}

Rédige une lecture de tarot en français d'environ 200 à 250 mots. Structure ta réponse en 3 paragraphes :
1. L'énergie générale du tirage et ce qu'il révèle
2. Le message central de la combinaison des 3 cartes ensemble
3. Un conseil concret et bienveillant pour la période à venir

Utilise un langage poétique, imagé et spirituel. Mentionne les cartes par leur nom. Si une carte est renversée, intègre cette nuance dans l'interprétation (énergie bloquée, retournée vers l'intérieur). Ne commence pas par "Je" mais par une formule évocatrice. Termine par une phrase d'encouragement lumineux.`;
  }

  // ── Call Anthropic API ──
  async function callAnthropicAPI(prompt) {
    // Verify config
    if (typeof LB_CONFIG === 'undefined') {
      throw new Error('LB_CONFIG non défini. Vérifiez que js/config.js est bien chargé.');
    }

    // Use proxy in production if configured
    if (LB_CONFIG.USE_PROXY) {
      const res = await fetch(LB_CONFIG.PROXY_URL, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ prompt, model: LB_CONFIG.AI_MODEL }),
      });
      if (!res.ok) throw new Error(`Proxy error: ${res.status}`);
      const data = await res.json();
      return data.text;
    }

    // Direct call (development / quand clé dans config)
    if (!LB_CONFIG.ANTHROPIC_API_KEY || LB_CONFIG.ANTHROPIC_API_KEY === 'YOUR_ANTHROPIC_API_KEY_HERE') {
      throw new Error('Clé API non configurée dans js/config.js');
    }

    const res = await fetch('https://api.anthropic.com/v1/messages', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'x-api-key': LB_CONFIG.ANTHROPIC_API_KEY,
        'anthropic-version': '2023-06-01',
        'anthropic-dangerous-direct-browser-access': 'true',
      },
      body: JSON.stringify({
        model: LB_CONFIG.AI_MODEL || 'claude-opus-4-5',
        max_tokens: 600,
        messages: [{ role: 'user', content: prompt }],
      }),
    });

    if (!res.ok) {
      const errData = await res.json().catch(() => ({}));
      throw new Error(`API error ${res.status}: ${errData.error?.message || 'Unknown error'}`);
    }

    const data = await res.json();
    return data.content?.[0]?.text || '';
  }

  // ── Typewriter effect for reading text ──
  function typewriterEffect(el, text, speed = 18) {
    el.textContent = '';
    let i = 0;
    function type() {
      if (i < text.length) {
        el.textContent += text[i];
        i++;
        setTimeout(type, speed);
      }
    }
    type();
  }

  // ── Copy reading to clipboard ──
  copyReading.addEventListener('click', () => {
    const text = readingText.textContent;
    if (!text) return;
    navigator.clipboard.writeText(text).then(() => {
      copyReading.querySelector('span').textContent = 'Copié ✓';
      setTimeout(() => { copyReading.querySelector('span').textContent = 'Copier la lecture'; }, 2000);
    }).catch(() => {
      // Fallback
      const ta = document.createElement('textarea');
      ta.value = text;
      document.body.appendChild(ta);
      ta.select();
      document.execCommand('copy');
      document.body.removeChild(ta);
      copyReading.querySelector('span').textContent = 'Copié ✓';
      setTimeout(() => { copyReading.querySelector('span').textContent = 'Copier la lecture'; }, 2000);
    });
  });

  // ── Book after reading ──
  bookAfterReading.addEventListener('click', () => {
    document.getElementById('reservation').scrollIntoView({ behavior: 'smooth' });
  });

  // ── New draw button ──
  tirageBtn.addEventListener('click', () => {
    buildDeck();
  });

  // ── Init ──
  buildDeck();

})();
