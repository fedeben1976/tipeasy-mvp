/* Bubble Bobble Deluxe — vanilla JS / Canvas, no external assets. */

(() => {
  const canvas = document.getElementById('game');
  const ctx = canvas.getContext('2d');
  const W = canvas.width, H = canvas.height;

  const scoreEl = document.getElementById('score');
  const livesEl = document.getElementById('lives');
  const levelEl = document.getElementById('level');
  const frenzyInner = document.getElementById('frenzyBarInner');
  const overlay = document.getElementById('overlay');
  const gameoverEl = document.getElementById('gameover');
  const startBtn = document.getElementById('startBtn');
  const saveScoreBtn = document.getElementById('saveScoreBtn');
  const nameInput = document.getElementById('nameInput');
  const finalScoreEl = document.getElementById('finalScore');
  const leaderboardEl = document.getElementById('leaderboard');

  // ---------- Audio (synth, no assets) ----------
  const actx = new (window.AudioContext || window.webkitAudioContext)();
  function beep(freq, dur = 0.08, type = 'square', vol = 0.08, slideTo = null) {
    const osc = actx.createOscillator();
    const gain = actx.createGain();
    osc.type = type;
    osc.frequency.setValueAtTime(freq, actx.currentTime);
    if (slideTo) osc.frequency.exponentialRampToValueAtTime(slideTo, actx.currentTime + dur);
    gain.gain.setValueAtTime(vol, actx.currentTime);
    gain.gain.exponentialRampToValueAtTime(0.001, actx.currentTime + dur);
    osc.connect(gain).connect(actx.destination);
    osc.start();
    osc.stop(actx.currentTime + dur);
  }
  const sfx = {
    shoot: () => beep(520, 0.06, 'square', 0.05, 700),
    trap: () => beep(300, 0.12, 'triangle', 0.07, 500),
    pop: (combo) => beep(440 + combo * 60, 0.12, 'sawtooth', 0.08, 880 + combo * 60),
    fruit: () => beep(900, 0.08, 'sine', 0.06, 1200),
    jump: () => beep(220, 0.08, 'square', 0.04, 320),
    hit: () => beep(120, 0.25, 'sawtooth', 0.12, 60),
    frenzy: () => beep(200, 0.4, 'sine', 0.1, 1000),
    levelup: () => beep(440, 0.3, 'triangle', 0.1, 880),
    gameover: () => beep(200, 0.6, 'sawtooth', 0.12, 50),
  };

  // ---------- Input ----------
  const keys = {};
  window.addEventListener('keydown', (e) => { keys[e.code] = true; });
  window.addEventListener('keyup', (e) => { keys[e.code] = false; });

  // ---------- Utility ----------
  const rand = (a, b) => a + Math.random() * (b - a);
  const choice = (arr) => arr[Math.floor(Math.random() * arr.length)];
  const aabb = (a, b) =>
    a.x < b.x + b.w && a.x + a.w > b.x && a.y < b.y + b.h && a.y + a.h > b.y;

  // ---------- Level layouts ----------
  function buildPlatforms(levelIdx) {
    const variants = [
      [
        { x: 0, y: 580, w: 800, h: 20 },
        { x: 60, y: 460, w: 200, h: 16 },
        { x: 540, y: 460, w: 200, h: 16 },
        { x: 300, y: 360, w: 200, h: 16 },
        { x: 60, y: 260, w: 200, h: 16 },
        { x: 540, y: 260, w: 200, h: 16 },
        { x: 300, y: 150, w: 200, h: 16 },
      ],
      [
        { x: 0, y: 580, w: 800, h: 20 },
        { x: 0, y: 440, w: 260, h: 16 },
        { x: 280, y: 440, w: 240, h: 16 },
        { x: 540, y: 440, w: 260, h: 16 },
        { x: 120, y: 300, w: 220, h: 16 },
        { x: 460, y: 300, w: 220, h: 16 },
        { x: 300, y: 170, w: 200, h: 16 },
      ],
      [
        { x: 0, y: 580, w: 800, h: 20 },
        { x: 100, y: 480, w: 600, h: 16 },
        { x: 0, y: 360, w: 260, h: 16 },
        { x: 540, y: 360, w: 260, h: 16 },
        { x: 280, y: 240, w: 240, h: 16 },
        { x: 60, y: 130, w: 220, h: 16 },
        { x: 520, y: 130, w: 220, h: 16 },
      ],
    ];
    return variants[levelIdx % variants.length];
  }

  // ---------- Game State ----------
  let state = 'menu'; // menu | playing | levelclear | gameover
  let score = 0, lives = 3, level = 1;
  let combo = 0, comboTimer = 0;
  let frenzy = 0, frenzyActive = 0; // 0..100 meter, frenzyActive = seconds remaining
  let particles = [];
  let floatingTexts = [];
  let shake = 0;
  let platforms = [];
  let player = { x: -999, y: -999, w: 0, h: 0, facing: 1, invuln: 0 };
  let enemies = [], bubbles = [], trapped = [], fruits = [];
  let enemiesToSpawnTotal = 0;

  const GRAVITY = 1400;
  const FRENZY_MAX = 100;

  function resetGameVars() {
    score = 0; lives = 3; level = 1;
    combo = 0; comboTimer = 0;
    frenzy = 0; frenzyActive = 0;
    particles = []; floatingTexts = []; shake = 0;
  }

  function spawnPlayer() {
    player = {
      x: 380, y: 500, w: 28, h: 32, vx: 0, vy: 0,
      facing: 1, onGround: false, shootCd: 0, invuln: 0,
    };
  }

  function makeEnemy(type, x, y) {
    const base = {
      bubble: { speed: 70, hp: 1, color: '#3ad1ff', score: 100, w: 26, h: 22 },
      fast: { speed: 140, hp: 1, color: '#ff7a3a', score: 150, w: 24, h: 20 },
      boss: { speed: 90, hp: 6, color: '#b03aff', score: 1000, w: 56, h: 50 },
    }[type];
    return {
      type, x, y, vx: choice([-1, 1]) * base.speed, vy: 0,
      w: base.w, h: base.h, color: base.color, hp: base.hp, maxHp: base.hp,
      scoreValue: base.score, state: 'walk', jumpCd: rand(1, 3), angry: false,
    };
  }

  function buildLevel() {
    platforms = buildPlatforms(level - 1);
    spawnPlayer();
    bubbles = [];
    trapped = [];
    fruits = [];
    enemies = [];

    const isBoss = level % 5 === 0;
    if (isBoss) {
      enemies.push(makeEnemy('boss', 400, 200));
      enemiesToSpawnTotal = 1;
    } else {
      const count = Math.min(3 + level, 9);
      enemiesToSpawnTotal = count;
      for (let i = 0; i < count; i++) {
        const plat = choice(platforms);
        const fast = Math.random() < Math.min(0.15 + level * 0.03, 0.6);
        enemies.push(makeEnemy(fast ? 'fast' : 'bubble',
          rand(plat.x + 10, plat.x + plat.w - 30), plat.y - 30));
      }
    }
  }

  function startGame() {
    resetGameVars();
    buildLevel();
    state = 'playing';
    overlay.classList.remove('show');
    overlay.classList.add('hidden');
    gameoverEl.classList.add('hidden');
  }

  function nextLevel() {
    level++;
    sfx.levelup();
    addFloatingText(W / 2, H / 2, `NIVEL ${level}!`, '#ffea00', 28);
    buildLevel();
  }

  // ---------- Effects ----------
  function addParticles(x, y, color, n = 10) {
    for (let i = 0; i < n; i++) {
      particles.push({
        x, y, vx: rand(-180, 180), vy: rand(-220, -40),
        life: rand(0.3, 0.7), age: 0, color, size: rand(2, 5),
      });
    }
  }

  function addFloatingText(x, y, text, color = '#fff', size = 18) {
    floatingTexts.push({ x, y, text, color, size, age: 0, life: 0.9 });
  }

  function triggerFrenzy() {
    frenzyActive = 8;
    frenzy = 0;
    shake = 12;
    sfx.frenzy();
    addFloatingText(W / 2, 100, 'BUBBLE FRENZY!!', '#ff00d4', 34);
  }

  // ---------- Physics helpers ----------
  function applyPlatformCollision(entity, wasFalling) {
    entity.onGround = false;
    for (const p of platforms) {
      const feetPrev = entity.y + entity.h - entity.vy0 * 0; // unused, kept simple
      if (
        entity.x + entity.w > p.x && entity.x < p.x + p.w &&
        entity.y + entity.h >= p.y && entity.y + entity.h <= p.y + 18 &&
        entity.vy >= 0
      ) {
        entity.y = p.y - entity.h;
        entity.vy = 0;
        entity.onGround = true;
      }
    }
    if (entity.y + entity.h >= H) {
      entity.y = H - entity.h;
      entity.vy = 0;
      entity.onGround = true;
    }
  }

  // ---------- Update ----------
  function update(dt) {
    if (state !== 'playing') return;

    if (comboTimer > 0) comboTimer -= dt; else combo = 0;
    if (frenzyActive > 0) frenzyActive -= dt;
    shake = Math.max(0, shake - dt * 30);

    updatePlayer(dt);
    updateEnemies(dt);
    updateBubbles(dt);
    updateTrapped(dt);
    updateFruits(dt);
    updateParticles(dt);
    updateFloatingTexts(dt);

    if (enemies.length === 0) {
      state = 'levelclear';
      setTimeout(() => { if (state === 'levelclear') nextLevel(); state = 'playing'; }, 1200);
    }

    refreshHud();
  }

  function updatePlayer(dt) {
    const speed = frenzyActive > 0 ? 280 : 220;
    let moving = false;
    if (keys['ArrowLeft'] || keys['KeyA']) { player.vx = -speed; player.facing = -1; moving = true; }
    else if (keys['ArrowRight'] || keys['KeyD']) { player.vx = speed; player.facing = 1; moving = true; }
    else player.vx = 0;

    if ((keys['ArrowUp'] || keys['Space'] || keys['KeyW']) && player.onGround) {
      player.vy = -520;
      player.onGround = false;
      sfx.jump();
    }

    player.shootCd -= dt;
    if ((keys['KeyZ'] || keys['ControlLeft'] || keys['ControlRight']) && player.shootCd <= 0) {
      shootBubble();
      player.shootCd = frenzyActive > 0 ? 0.12 : 0.32;
    }

    player.vy += GRAVITY * dt;
    player.x += player.vx * dt;
    player.y += player.vy * dt;
    player.x = Math.max(0, Math.min(W - player.w, player.x));

    applyPlatformCollision(player);
    if (player.invuln > 0) player.invuln -= dt;

    // touch trapped bubble to pop (walk into it)
    for (let i = trapped.length - 1; i >= 0; i--) {
      const t = trapped[i];
      if (aabb(player, t)) popTrapped(i);
    }

    // enemy contact damage
    for (const en of enemies) {
      if (en.state === 'walk' && player.invuln <= 0 && aabb(player, en)) {
        damagePlayer();
      }
    }
  }

  function shootBubble() {
    sfx.shoot();
    const speed = frenzyActive > 0 ? 460 : 340;
    bubbles.push({
      x: player.x + player.w / 2 - 10,
      y: player.y + 6,
      w: 22, h: 22,
      vx: player.facing * speed,
      vy: -40,
      life: 1.4,
      special: frenzyActive > 0 && Math.random() < 0.4 ? 'rainbow' : 'normal',
    });
  }

  function updateBubbles(dt) {
    for (let i = bubbles.length - 1; i >= 0; i--) {
      const b = bubbles[i];
      b.vy -= 260 * dt; // bubbles curve upward like the original
      b.vy = Math.max(b.vy, -120);
      b.x += b.vx * dt;
      b.y += b.vy * dt;
      b.life -= dt;
      b.vx *= 0.985;

      let hit = false;
      for (let j = enemies.length - 1; j >= 0; j--) {
        const en = enemies[j];
        if (en.state === 'walk' && aabb(b, en)) {
          trapEnemy(j, b.special === 'rainbow');
          hit = true;
          break;
        }
      }
      if (hit || b.life <= 0 || b.x < -30 || b.x > W + 30 || b.y < -30) {
        bubbles.splice(i, 1);
      }
    }
  }

  function trapEnemy(idx, rainbow) {
    const en = enemies[idx];
    en.hp -= rainbow ? 3 : 1;
    if (en.hp > 0) {
      // boss takes multiple bubble hits before trapping
      addParticles(en.x + en.w / 2, en.y + en.h / 2, en.color, 6);
      return;
    }
    enemies.splice(idx, 1);
    sfx.trap();
    trapped.push({
      x: en.x, y: en.y, w: en.w, h: en.h,
      vy: -30, color: en.color, life: rainbow ? 8 : 5.5,
      maxLife: rainbow ? 8 : 5.5, scoreValue: en.scoreValue,
      rainbow, bob: 0,
    });
  }

  function updateTrapped(dt) {
    for (let i = trapped.length - 1; i >= 0; i--) {
      const t = trapped[i];
      t.bob += dt * 4;
      t.y += Math.sin(t.bob) * 0.6;
      t.y -= 6 * dt;
      t.life -= dt;
      if (t.life <= 0) {
        // escapes! becomes an angry enemy again
        enemies.push(Object.assign(makeEnemy('fast', t.x, t.y), { color: '#ff1744', angry: true }));
        trapped.splice(i, 1);
        addFloatingText(t.x, t.y, '¡ESCAPÓ!', '#ff5555', 14);
      }
    }
  }

  function popTrapped(idx) {
    const t = trapped[idx];
    trapped.splice(idx, 1);
    combo++;
    comboTimer = 1.1;
    frenzy = Math.min(FRENZY_MAX, frenzy + (t.rainbow ? 25 : 12));
    if (frenzy >= FRENZY_MAX && frenzyActive <= 0) triggerFrenzy();

    const mult = (frenzyActive > 0 ? 2 : 1) * Math.min(combo, 8);
    const gained = t.scoreValue * mult;
    score += gained;
    sfx.pop(combo);
    addParticles(t.x + t.w / 2, t.y + t.h / 2, t.color, 16);
    addFloatingText(t.x, t.y - 10, `+${gained}${combo > 1 ? ` x${combo}` : ''}`,
      combo > 3 ? '#ffea00' : '#fff', 14 + Math.min(combo, 6) * 2);

    if (Math.random() < 0.6) {
      fruits.push({ x: t.x + t.w / 2 - 8, y: t.y, w: 16, h: 16, vy: -80, life: 5 });
    }
  }

  function updateFruits(dt) {
    for (let i = fruits.length - 1; i >= 0; i--) {
      const f = fruits[i];
      f.vy += GRAVITY * 0.5 * dt;
      f.y += f.vy * dt;
      f.life -= dt;
      if (f.y + f.h > H - 20) { f.y = H - 20 - f.h; f.vy = 0; }
      if (aabb(player, f)) {
        score += 50 * Math.max(1, combo);
        sfx.fruit();
        addFloatingText(f.x, f.y, '+50', '#7CFC00', 14);
        fruits.splice(i, 1);
        continue;
      }
      if (f.life <= 0) fruits.splice(i, 1);
    }
  }

  function updateEnemies(dt) {
    const slowFactor = frenzyActive > 0 ? 0.5 : 1;
    for (const en of enemies) {
      if (en.state !== 'walk') continue;
      en.x += en.vx * slowFactor * dt;
      en.vy += GRAVITY * dt;
      en.y += en.vy * dt;

      if (en.x < 0 || en.x + en.w > W) { en.vx *= -1; en.x = Math.max(0, Math.min(W - en.w, en.x)); }

      applyPlatformCollision(en);

      en.jumpCd -= dt;
      if (en.jumpCd <= 0 && en.onGround) {
        en.jumpCd = rand(1.5, 3.5);
        if (Math.random() < 0.4) en.vy = -380;
        if (Math.random() < 0.3) en.vx *= -1;
      }
    }
  }

  function damagePlayer() {
    lives--;
    player.invuln = 1.5;
    shake = 14;
    sfx.hit();
    combo = 0;
    addFloatingText(player.x, player.y - 10, '-1 VIDA', '#ff3333', 16);
    if (lives <= 0) {
      endGame();
    } else {
      player.x = 380; player.y = 500; player.vx = 0; player.vy = 0;
    }
  }

  function updateParticles(dt) {
    for (let i = particles.length - 1; i >= 0; i--) {
      const p = particles[i];
      p.age += dt;
      p.vy += 600 * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      if (p.age >= p.life) particles.splice(i, 1);
    }
  }

  function updateFloatingTexts(dt) {
    for (let i = floatingTexts.length - 1; i >= 0; i--) {
      const t = floatingTexts[i];
      t.age += dt;
      t.y -= 30 * dt;
      if (t.age >= t.life) floatingTexts.splice(i, 1);
    }
  }

  function endGame() {
    state = 'gameover';
    sfx.gameover();
    finalScoreEl.textContent = `Puntaje final: ${score} — Nivel ${level}`;
    gameoverEl.classList.remove('hidden');
  }

  // ---------- HUD ----------
  function refreshHud() {
    scoreEl.textContent = `SCORE: ${score}`;
    livesEl.textContent = `VIDAS: ${Math.max(0, lives)}`;
    levelEl.textContent = `NIVEL: ${level}`;
    frenzyInner.style.width = `${frenzyActive > 0 ? 100 : frenzy}%`;
  }

  // ---------- Render ----------
  function drawBackground() {
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    const hue = (level * 35) % 360;
    grad.addColorStop(0, `hsl(${hue}, 60%, 18%)`);
    grad.addColorStop(1, `hsl(${hue + 40}, 60%, 8%)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);
  }

  function drawPlatforms() {
    ctx.fillStyle = '#ff66cc';
    for (const p of platforms) {
      ctx.fillStyle = '#3a2a6a';
      ctx.fillRect(p.x, p.y, p.w, p.h);
      ctx.fillStyle = '#ff99e6';
      ctx.fillRect(p.x, p.y, p.w, 4);
    }
  }

  function drawPlayer() {
    ctx.save();
    if (player.invuln > 0 && Math.floor(player.invuln * 10) % 2 === 0) ctx.globalAlpha = 0.3;
    ctx.fillStyle = frenzyActive > 0 ? '#ffea00' : '#4ade80';
    ctx.fillRect(player.x, player.y, player.w, player.h);
    ctx.fillStyle = '#0a0a1a';
    const eyeX = player.facing > 0 ? player.x + 18 : player.x + 4;
    ctx.fillRect(eyeX, player.y + 8, 5, 5);
    ctx.restore();
  }

  function drawEnemies() {
    for (const en of enemies) {
      ctx.fillStyle = en.color;
      ctx.beginPath();
      ctx.ellipse(en.x + en.w / 2, en.y + en.h / 2, en.w / 2, en.h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = '#0a0a1a';
      ctx.fillRect(en.x + en.w * 0.6, en.y + en.h * 0.3, 4, 4);
      if (en.type === 'boss') {
        ctx.fillStyle = '#fff';
        ctx.fillRect(en.x, en.y - 14, en.w, 6);
        ctx.fillStyle = '#ff1744';
        ctx.fillRect(en.x, en.y - 14, en.w * (en.hp / en.maxHp), 6);
      }
    }
  }

  function drawBubbles() {
    for (const b of bubbles) {
      ctx.strokeStyle = b.special === 'rainbow' ? '#ff00d4' : '#9be7ff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(b.x + b.w / 2, b.y + b.h / 2, b.w / 2, 0, Math.PI * 2);
      ctx.stroke();
    }
  }

  function drawTrapped() {
    for (const t of trapped) {
      const flashing = t.life < 1.5;
      if (flashing && Math.floor(t.life * 8) % 2 === 0) continue;
      ctx.strokeStyle = t.rainbow ? '#ff00d4' : '#fff';
      ctx.lineWidth = 2;
      ctx.beginPath();
      ctx.arc(t.x + t.w / 2, t.y + t.h / 2, Math.max(t.w, t.h) / 2 + 4, 0, Math.PI * 2);
      ctx.stroke();
      ctx.globalAlpha = 0.85;
      ctx.fillStyle = t.color;
      ctx.beginPath();
      ctx.ellipse(t.x + t.w / 2, t.y + t.h / 2, t.w / 2, t.h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.globalAlpha = 1;
    }
  }

  function drawFruits() {
    ctx.fillStyle = '#ff3b3b';
    for (const f of fruits) {
      ctx.beginPath();
      ctx.arc(f.x + f.w / 2, f.y + f.h / 2, f.w / 2, 0, Math.PI * 2);
      ctx.fill();
    }
  }

  function drawParticles() {
    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, 1 - p.age / p.life);
      ctx.fillStyle = p.color;
      ctx.fillRect(p.x, p.y, p.size, p.size);
    }
    ctx.globalAlpha = 1;
  }

  function drawFloatingTexts() {
    for (const t of floatingTexts) {
      ctx.globalAlpha = Math.max(0, 1 - t.age / t.life);
      ctx.fillStyle = t.color;
      ctx.font = `bold ${t.size}px Trebuchet MS, Arial`;
      ctx.textAlign = 'center';
      ctx.fillText(t.text, t.x, t.y);
    }
    ctx.globalAlpha = 1;
    ctx.textAlign = 'left';
  }

  function render() {
    ctx.save();
    if (shake > 0.2) {
      ctx.translate(rand(-shake, shake), rand(-shake, shake));
    }
    drawBackground();
    drawPlatforms();
    drawFruits();
    drawTrapped();
    drawEnemies();
    drawBubbles();
    drawPlayer();
    drawParticles();
    drawFloatingTexts();

    if (frenzyActive > 0) {
      ctx.fillStyle = 'rgba(255, 0, 212, 0.06)';
      ctx.fillRect(0, 0, W, H);
    }
    ctx.restore();
  }

  // ---------- Main loop ----------
  let last = performance.now();
  function loop(now) {
    const dt = Math.min(0.033, (now - last) / 1000);
    last = now;
    update(dt);
    render();
    requestAnimationFrame(loop);
  }

  // ---------- Leaderboard ----------
  const LB_KEY = 'bbdeluxe_leaderboard';
  function getLeaderboard() {
    try { return JSON.parse(localStorage.getItem(LB_KEY)) || []; }
    catch { return []; }
  }
  function saveLeaderboard(list) {
    localStorage.setItem(LB_KEY, JSON.stringify(list));
  }
  function renderLeaderboard() {
    const list = getLeaderboard();
    leaderboardEl.innerHTML = '<strong>TOP BUBBLERS</strong>' +
      (list.length ? '' : '<div>Sin puntajes aún</div>') +
      list.map((e, i) => `<div><span>${i + 1}. ${e.name}</span><span>${e.score}</span></div>`).join('');
  }

  startBtn.addEventListener('click', () => {
    actx.resume();
    startGame();
  });

  saveScoreBtn.addEventListener('click', () => {
    const name = (nameInput.value || 'Jugador').slice(0, 10);
    const list = getLeaderboard();
    list.push({ name, score });
    list.sort((a, b) => b.score - a.score);
    saveLeaderboard(list.slice(0, 5));
    gameoverEl.classList.add('hidden');
    overlay.classList.remove('hidden');
    overlay.classList.add('show');
    renderLeaderboard();
  });

  renderLeaderboard();
  requestAnimationFrame((t) => { last = t; loop(t); });
})();
