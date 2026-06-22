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
  let clock = 0;

  const GRAVITY = 1300;
  const JUMP_VELOCITY = -680;
  const FRENZY_MAX = 100;
  let decor = { clouds: [], stars: [] };

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

  function buildDecor() {
    decor.clouds = [];
    for (let i = 0; i < 6; i++) {
      decor.clouds.push({
        x: rand(-40, W + 40), y: rand(20, H - 80),
        scale: rand(0.6, 1.4), speed: rand(6, 18), puff: Math.floor(rand(3, 5)),
      });
    }
    decor.stars = [];
    for (let i = 0; i < 18; i++) {
      decor.stars.push({ x: rand(0, W), y: rand(0, H * 0.7), r: rand(1, 2.6), tw: rand(0, Math.PI * 2) });
    }
  }

  function buildLevel() {
    platforms = buildPlatforms(level - 1);
    buildDecor();
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
    clock += dt;
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
    for (const c of decor.clouds) {
      c.x += c.speed * dt;
      if (c.x > W + 60) c.x = -60;
    }
    for (const s of decor.stars) s.tw += dt * 2;

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
      player.vy = JUMP_VELOCITY;
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
      fruits.push({
        x: t.x + t.w / 2 - 8, y: t.y, w: 16, h: 16, vy: -80, life: 5,
        kind: choice(['cherry', 'apple', 'grape', 'star']),
      });
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

  // ---------- Render helpers ----------
  function roundRect(x, y, w, h, r) {
    ctx.beginPath();
    ctx.moveTo(x + r, y);
    ctx.arcTo(x + w, y, x + w, y + h, r);
    ctx.arcTo(x + w, y + h, x, y + h, r);
    ctx.arcTo(x, y + h, x, y, r);
    ctx.arcTo(x, y, x + w, y, r);
    ctx.closePath();
  }

  function drawCloudShape(cx, cy, scale, puffs) {
    const r = 16 * scale;
    ctx.beginPath();
    for (let i = 0; i < puffs; i++) {
      const px = cx + (i - (puffs - 1) / 2) * r * 1.2;
      const py = cy + (i % 2 === 0 ? 0 : -r * 0.35);
      ctx.moveTo(px + r, py);
      ctx.arc(px, py, r, 0, Math.PI * 2);
    }
    ctx.fill();
  }

  function drawEyes(cx, cy, spacing, eyeR, lookDir, blinkPhase) {
    const blink = Math.max(0.15, Math.abs(Math.sin(blinkPhase)));
    for (const side of [-1, 1]) {
      const ex = cx + side * spacing;
      ctx.fillStyle = '#fff';
      ctx.beginPath();
      ctx.ellipse(ex, cy, eyeR, eyeR * blink, 0, 0, Math.PI * 2);
      ctx.fill();
      if (blink > 0.3) {
        ctx.fillStyle = '#1a1a2e';
        ctx.beginPath();
        ctx.arc(ex + lookDir * eyeR * 0.4, cy + eyeR * 0.15, eyeR * 0.45, 0, Math.PI * 2);
        ctx.fill();
        ctx.fillStyle = '#fff';
        ctx.beginPath();
        ctx.arc(ex + lookDir * eyeR * 0.4 - eyeR * 0.15, cy - eyeR * 0.15, eyeR * 0.15, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  // ---------- Render ----------
  function drawBackground() {
    const hue = (level * 40) % 360;
    const grad = ctx.createLinearGradient(0, 0, 0, H);
    grad.addColorStop(0, `hsl(${hue}, 70%, 78%)`);
    grad.addColorStop(0.6, `hsl(${hue + 25}, 70%, 62%)`);
    grad.addColorStop(1, `hsl(${hue + 45}, 55%, 42%)`);
    ctx.fillStyle = grad;
    ctx.fillRect(0, 0, W, H);

    ctx.fillStyle = 'rgba(255,255,255,0.85)';
    for (const s of decor.stars) {
      const a = 0.4 + 0.6 * Math.abs(Math.sin(s.tw));
      ctx.globalAlpha = a;
      ctx.beginPath();
      ctx.arc(s.x, s.y, s.r, 0, Math.PI * 2);
      ctx.fill();
    }
    ctx.globalAlpha = 1;

    ctx.fillStyle = 'rgba(255,255,255,0.9)';
    for (const c of decor.clouds) {
      drawCloudShape(c.x, c.y, c.scale, c.puff);
    }

    // soft sun glow
    const sunGrad = ctx.createRadialGradient(W - 90, 80, 5, W - 90, 80, 70);
    sunGrad.addColorStop(0, 'rgba(255, 245, 200, 0.95)');
    sunGrad.addColorStop(1, 'rgba(255, 245, 200, 0)');
    ctx.fillStyle = sunGrad;
    ctx.fillRect(W - 170, 0, 170, 170);
  }

  function drawPlatforms() {
    for (const p of platforms) {
      ctx.save();
      ctx.shadowColor = 'rgba(0,0,0,0.18)';
      ctx.shadowBlur = 6;
      ctx.shadowOffsetY = 4;
      const grad = ctx.createLinearGradient(p.x, p.y, p.x, p.y + p.h);
      grad.addColorStop(0, '#fff7fb');
      grad.addColorStop(1, '#ffd3ec');
      ctx.fillStyle = grad;
      roundRect(p.x, p.y, p.w, Math.max(p.h, 16), 10);
      ctx.fill();
      ctx.restore();

      // little candy dots on top for personality
      ctx.fillStyle = `hsl(${(level * 50) % 360}, 75%, 70%)`;
      for (let dx = 14; dx < p.w - 10; dx += 34) {
        ctx.beginPath();
        ctx.arc(p.x + dx, p.y + 4, 3, 0, Math.PI * 2);
        ctx.fill();
      }
    }
  }

  function drawPlayer() {
    ctx.save();
    if (player.invuln > 0 && Math.floor(player.invuln * 10) % 2 === 0) ctx.globalAlpha = 0.35;
    const cx = player.x + player.w / 2;
    const cy = player.y + player.h / 2;
    const squish = player.onGround ? 1 + Math.sin(clock * 10) * 0.02 : 1;

    // feet
    ctx.fillStyle = '#1a8f4a';
    ctx.beginPath();
    ctx.ellipse(cx - 9, player.y + player.h - 2, 7, 5, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 9, player.y + player.h - 2, 7, 5, 0, 0, Math.PI * 2);
    ctx.fill();

    // body
    const bodyGrad = ctx.createRadialGradient(cx - 6, cy - 10, 4, cx, cy, player.w);
    if (frenzyActive > 0) {
      bodyGrad.addColorStop(0, '#fff6b0');
      bodyGrad.addColorStop(1, '#ffb800');
    } else {
      bodyGrad.addColorStop(0, '#b6ffd8');
      bodyGrad.addColorStop(1, '#3ddc84');
    }
    ctx.fillStyle = bodyGrad;
    ctx.beginPath();
    ctx.ellipse(cx, cy + 2, (player.w / 2 + 3) * squish, player.h / 2 + 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(20,90,50,0.5)';
    ctx.lineWidth = 2;
    ctx.stroke();

    // little antenna
    ctx.strokeStyle = frenzyActive > 0 ? '#ffb800' : '#3ddc84';
    ctx.lineWidth = 3;
    ctx.beginPath();
    ctx.moveTo(cx, player.y - 2);
    ctx.lineTo(cx + player.facing * 4, player.y - 12);
    ctx.stroke();
    ctx.fillStyle = '#ff6fae';
    ctx.beginPath();
    ctx.arc(cx + player.facing * 4, player.y - 12, 4, 0, Math.PI * 2);
    ctx.fill();

    // eyes
    drawEyes(cx, cy - 4, 7, 6, player.facing, clock * 1.2);

    // blush
    ctx.fillStyle = 'rgba(255,120,160,0.55)';
    ctx.beginPath();
    ctx.ellipse(cx - 12, cy + 6, 4, 2.5, 0, 0, Math.PI * 2);
    ctx.ellipse(cx + 12, cy + 6, 4, 2.5, 0, 0, Math.PI * 2);
    ctx.fill();

    ctx.restore();
  }

  function drawCuteMonster(en) {
    const cx = en.x + en.w / 2;
    const cy = en.y + en.h / 2;
    const bob = Math.sin(clock * 5 + en.x) * 2;

    ctx.save();
    ctx.translate(0, bob);

    // ears / horns
    ctx.fillStyle = en.color;
    if (en.type === 'fast') {
      ctx.beginPath();
      ctx.moveTo(cx - en.w * 0.3, cy - en.h * 0.4);
      ctx.lineTo(cx - en.w * 0.15, cy - en.h * 0.9);
      ctx.lineTo(cx, cy - en.h * 0.4);
      ctx.fill();
    } else if (en.type === 'boss') {
      ctx.fillStyle = '#ffd54a';
      for (let i = -1; i <= 1; i++) {
        ctx.beginPath();
        ctx.moveTo(cx + i * en.w * 0.25 - 6, cy - en.h * 0.45);
        ctx.lineTo(cx + i * en.w * 0.25, cy - en.h * 0.45 - 14);
        ctx.lineTo(cx + i * en.w * 0.25 + 6, cy - en.h * 0.45);
        ctx.fill();
      }
    }

    // body
    const grad = ctx.createRadialGradient(cx - en.w * 0.15, cy - en.h * 0.2, 3, cx, cy, en.w * 0.7);
    grad.addColorStop(0, '#ffffff');
    grad.addColorStop(0.25, en.color);
    grad.addColorStop(1, en.color);
    ctx.fillStyle = grad;
    ctx.beginPath();
    ctx.ellipse(cx, cy, en.w / 2, en.h / 2, 0, 0, Math.PI * 2);
    ctx.fill();
    ctx.strokeStyle = 'rgba(0,0,0,0.25)';
    ctx.lineWidth = 1.5;
    ctx.stroke();

    drawEyes(cx, cy - en.h * 0.08, en.w * 0.2, en.w * 0.16, Math.sign(en.vx) || 1, clock * 1.6 + cx);

    // angry eyebrows / mouth
    ctx.strokeStyle = '#1a1a2e';
    ctx.lineWidth = 2;
    if (en.angry) {
      ctx.beginPath();
      ctx.moveTo(cx - en.w * 0.28, cy - en.h * 0.28);
      ctx.lineTo(cx - en.w * 0.1, cy - en.h * 0.2);
      ctx.moveTo(cx + en.w * 0.28, cy - en.h * 0.28);
      ctx.lineTo(cx + en.w * 0.1, cy - en.h * 0.2);
      ctx.stroke();
    }
    ctx.beginPath();
    ctx.arc(cx, cy + en.h * 0.18, en.w * 0.14, 0.15 * Math.PI, 0.85 * Math.PI);
    ctx.stroke();

    if (en.type === 'boss') {
      const barW = en.w + 10;
      ctx.fillStyle = 'rgba(255,255,255,0.85)';
      roundRect(en.x - 5, en.y - 18, barW, 8, 4);
      ctx.fill();
      ctx.fillStyle = '#ff5577';
      roundRect(en.x - 5, en.y - 18, barW * Math.max(0, en.hp / en.maxHp), 8, 4);
      ctx.fill();
    }
    ctx.restore();
  }

  function drawEnemies() {
    for (const en of enemies) drawCuteMonster(en);
  }

  function drawBubbles() {
    for (const b of bubbles) {
      const cx = b.x + b.w / 2, cy = b.y + b.h / 2, r = b.w / 2;
      ctx.save();
      ctx.globalAlpha = 0.85;
      const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 1, cx, cy, r);
      if (b.special === 'rainbow') {
        grad.addColorStop(0, '#fff');
        grad.addColorStop(0.5, '#ff9bea');
        grad.addColorStop(1, '#a06bff');
      } else {
        grad.addColorStop(0, '#ffffff');
        grad.addColorStop(0.5, '#bdeeff');
        grad.addColorStop(1, '#6fc8ff');
      }
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = 'rgba(255,255,255,0.9)';
      ctx.lineWidth = 1.5;
      ctx.stroke();
      ctx.restore();
    }
  }

  function drawTrapped() {
    for (const t of trapped) {
      const flashing = t.life < 1.5;
      if (flashing && Math.floor(t.life * 8) % 2 === 0) continue;
      const cx = t.x + t.w / 2, cy = t.y + t.h / 2, r = Math.max(t.w, t.h) / 2 + 6;

      ctx.save();
      const grad = ctx.createRadialGradient(cx - r * 0.3, cy - r * 0.3, 2, cx, cy, r);
      grad.addColorStop(0, 'rgba(255,255,255,0.55)');
      grad.addColorStop(0.6, t.rainbow ? 'rgba(255,140,230,0.25)' : 'rgba(180,230,255,0.25)');
      grad.addColorStop(1, 'rgba(255,255,255,0.05)');
      ctx.fillStyle = grad;
      ctx.beginPath();
      ctx.arc(cx, cy, r, 0, Math.PI * 2);
      ctx.fill();
      ctx.strokeStyle = t.rainbow ? '#ff7be0' : '#ffffff';
      ctx.lineWidth = 2;
      ctx.stroke();

      // glossy highlight crescent
      ctx.strokeStyle = 'rgba(255,255,255,0.8)';
      ctx.lineWidth = 3;
      ctx.beginPath();
      ctx.arc(cx, cy, r - 4, Math.PI * 1.1, Math.PI * 1.5);
      ctx.stroke();

      ctx.globalAlpha = 0.9;
      const bodyGrad = ctx.createRadialGradient(cx - t.w * 0.15, cy - t.h * 0.2, 2, cx, cy, t.w * 0.6);
      bodyGrad.addColorStop(0, '#ffffff');
      bodyGrad.addColorStop(0.3, t.color);
      bodyGrad.addColorStop(1, t.color);
      ctx.fillStyle = bodyGrad;
      ctx.beginPath();
      ctx.ellipse(cx, cy, t.w / 2, t.h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      drawEyes(cx, cy - t.h * 0.08, t.w * 0.2, t.w * 0.15, 1, clock * 2 + cx);
      ctx.globalAlpha = 1;
      ctx.restore();
    }
  }

  function drawFruitShape(f) {
    const cx = f.x + f.w / 2, cy = f.y + f.h / 2;
    ctx.save();
    switch (f.kind) {
      case 'cherry':
        ctx.strokeStyle = '#2e7d32'; ctx.lineWidth = 1.5;
        ctx.beginPath(); ctx.moveTo(cx, cy - 8); ctx.lineTo(cx + 3, cy - 12); ctx.stroke();
        ctx.fillStyle = '#e53950';
        for (const dx of [-4, 4]) {
          ctx.beginPath(); ctx.arc(cx + dx, cy + 2, 5.5, 0, Math.PI * 2); ctx.fill();
        }
        break;
      case 'apple':
        ctx.fillStyle = '#ff4d4d';
        ctx.beginPath(); ctx.arc(cx, cy + 1, 8, 0, Math.PI * 2); ctx.fill();
        ctx.fillStyle = '#3c9c3c';
        ctx.beginPath(); ctx.ellipse(cx + 4, cy - 8, 4, 2.5, 0.6, 0, Math.PI * 2); ctx.fill();
        break;
      case 'grape':
        ctx.fillStyle = '#9b59d0';
        for (const [dx, dy] of [[-4, -3], [4, -3], [0, 0], [-4, 5], [4, 5]]) {
          ctx.beginPath(); ctx.arc(cx + dx, cy + dy, 4, 0, Math.PI * 2); ctx.fill();
        }
        break;
      case 'star':
      default: {
        ctx.fillStyle = '#ffd23f';
        ctx.beginPath();
        for (let i = 0; i < 5; i++) {
          const a = -Math.PI / 2 + i * (Math.PI * 2 / 5);
          const a2 = a + Math.PI / 5;
          ctx.lineTo(cx + Math.cos(a) * 8, cy + Math.sin(a) * 8);
          ctx.lineTo(cx + Math.cos(a2) * 3.5, cy + Math.sin(a2) * 3.5);
        }
        ctx.closePath();
        ctx.fill();
      }
    }
    ctx.restore();
  }

  function drawFruits() {
    for (const f of fruits) drawFruitShape(f);
  }

  function drawParticles() {
    for (const p of particles) {
      ctx.globalAlpha = Math.max(0, 1 - p.age / p.life);
      ctx.fillStyle = p.color;
      ctx.beginPath();
      ctx.arc(p.x, p.y, p.size, 0, Math.PI * 2);
      ctx.fill();
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
