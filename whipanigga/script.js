(() => {
  'use strict';

  // ---------------------------------------------------------------
  // Screen elements
  // ---------------------------------------------------------------
  // There's only one real "screen" now (the game, which is always
  // running). Home / pause / round-over are transparent overlays on
  // top of it — see the .overlay rules in style.css.
  const homeOverlay = document.getElementById('home-overlay');
  const pauseOverlay = document.getElementById('pause-overlay');
  const roundoverOverlay = document.getElementById('roundover-overlay');
  const hud = document.getElementById('hud');
  const pauseBtn = document.getElementById('pause-btn');
  const hintEl = document.querySelector('.hint');

  document.getElementById('play-btn').addEventListener('click', () => {
    homeOverlay.classList.remove('active');
    hud.classList.remove('hidden');
    pauseBtn.classList.remove('hidden');
    hintEl.classList.remove('hidden');
    startGame();
  });

  document.getElementById('playagain-btn').addEventListener('click', () => {
    startGame();
  });

  // ---------------------------------------------------------------
  // Assets
  // ---------------------------------------------------------------
  // Drop backgroundmole.png, bush.png and mole.png in the assets/
  // folder next to index.html. Until they exist (or while they're
  // loading), the game draws labeled placeholder shapes instead, so
  // it's playable right away.
  //
  // moleHit is the image shown for the split-second after a mole is
  // successfully whacked. Point this at your hit-reaction image's
  // exact filename — it must be a different file from `mole` above,
  // or you won't see any change when you score a hit.
  const ASSET_PATHS = {
    background: 'assets/backgroundmole.png',
    bush: 'assets/bush.png',
    mole: 'assets/mole.png',
    moleHit: 'assets/mole_hit.png',
    whipRest: 'assets/whip_rest.png',
    whipMove1: 'assets/whip_move_1.png',
    whipMove2: 'assets/whip_move_2.png',
    whipStrike: 'assets/whip_strike.png',
  };

  function loadImage(src) {
    const img = new Image();
    img.loaded = false;
    img.failed = false;
    img.onload = () => { img.loaded = true; };
    img.onerror = () => {
      img.failed = true;
      console.warn('Failed to load image: ' + src + ' — check the filename, extension, and folder path (both are case-sensitive).');
    };
    img.src = src;
    return img;
  }

  const images = {
    background: loadImage(ASSET_PATHS.background),
    bush: loadImage(ASSET_PATHS.bush),
    mole: loadImage(ASSET_PATHS.mole),
    moleHit: loadImage(ASSET_PATHS.moleHit),
    whipRest: loadImage(ASSET_PATHS.whipRest),
    whipMove1: loadImage(ASSET_PATHS.whipMove1),
    whipMove2: loadImage(ASSET_PATHS.whipMove2),
    whipStrike: loadImage(ASSET_PATHS.whipStrike),
  };

  // ---------------------------------------------------------------
  // TUNABLE SIZES — edit these until the art lines up the way you
  // want. Nothing else in this file needs to change to re-scale
  // things. All sizes are in pixels unless noted otherwise.
  // ---------------------------------------------------------------
  const CONFIG = {
    bush: {
      width: 220,   // rendered width of bush.png
      height: 220,  // rendered height of bush.png
    },
    mole: {
      width: 230,       // rendered width of mole.png
      height: 430,      // rendered height of mole.png
      popHeight: 325,   // how far up the mole/animal rises out of the ground
      riseSpeed: 220,   // px per second while popping up
      fallSpeed: 420,   // px per second while ducking back down
      // Fine-tune where the mole pops out relative to the bush's
      // bounding box. If bush.png has empty/transparent space above
      // the actual foliage, the mole will look like it's floating —
      // increase this (in px) to push the pop point further down
      // into the bush; decrease (or go negative) to push it higher.
      popOffsetY: 125,
    },
    // Hole layout — 3 columns on the top row, 2 in the middle row,
    // 3 on the bottom row. x/y are fractions of the screen (0 to 1);
    // x/y is the *ground point* the bush and mole are anchored to
    // (bottom-center). Stays responsive at any window size since
    // it's percentage-based rather than fixed pixels. Add/remove
    // rows or entries, or drag the numbers around, to relayout.
    holes: [
      // top row (3)
      { x: 0.20, y: 0.30 },
      { x: 0.50, y: 0.28 },
      { x: 0.80, y: 0.30 },
      // middle row (2)
      { x: 0.35, y: 0.55 },
      { x: 0.65, y: 0.55 },
      // bottom row (3)
      { x: 0.20, y: 0.82 },
      { x: 0.50, y: 0.85 },
      { x: 0.80, y: 0.82 },
    ],
    timing: {
      minWait: 1200,     // shortest time (ms) a hole waits before popping again
      maxWait: 3000,     // longest time (ms) a hole waits before popping again
      upDuration: 500,   // how long the animal stays fully up before retreating
      roundSeconds: 30,  // length of a round, in seconds
    },
    // How much of the popped-up animal counts as "hit" — 0.1 means it
    // becomes clickable once it's 10% of the way up.
    hitThreshold: 0.1,
    // Custom whip cursor. width/height is the rendered sprite size.
    // hotspotX/hotspotY is the offset (in px, from the sprite's
    // top-left corner) that should line up with the actual pointer
    // position — e.g. the tip of the whip handle. Adjust these until
    // the cursor "feels" aligned with what you're clicking.
    // frameDuration is how long (ms) each step of the click animation
    // shows before advancing to the next one.
    cursor: {
      width: 300,
      height: 300,
      hotspotX: 52,
      hotspotY: 204,
      frameDuration: 70,
    },
  };

  // ---------------------------------------------------------------
  // Game loop
  // ---------------------------------------------------------------
  const canvas = document.getElementById('game-canvas');
  const ctx = canvas.getContext('2d');
  const scoreDisplay = document.getElementById('score-display');
  const timerDisplay = document.getElementById('timer-display');
  const fpsDisplay = document.getElementById('fps-display');
  const resumeBtn = document.getElementById('resume-btn');
  const finalScoreDisplay = document.getElementById('final-score-display');

  let rafId = null;
  let running = false;
  let paused = false;
  let lastTime = 0;
  let fpsTimer = 0;
  let fpsFrames = 0;

  const state = {
    score: 0,
    timeLeft: CONFIG.timing.roundSeconds,
    roundOver: false,
    // True before the player has hit Play (and again isn't used after
    // that — there's no "back to menu" anymore). While true, moles still
    // pop up for visual flavor behind the home overlay, but the timer
    // doesn't run and clicks don't score.
    attract: true,
    // One entry per hole in CONFIG.holes, same index.
    // moleState: 'hidden' | 'rising' | 'up' | 'falling'
    // progress: 0 (fully down) to 1 (fully up)
    // hit: true from the moment a mole is successfully whacked until it
    //      fully retreats — this is what makes it immune to further hits
    //      while it's on its way down, so spam-clicking can't keep
    //      resetting the hit animation and cancel the retreat.
    holes: [],
    // Only one mole is ever active at once — see resetHoles().
    activeHoleIndex: -1,
    nextSpawnAt: 0,
  };

  function randRange(min, max) {
    return min + Math.random() * (max - min);
  }

  function formatTime(seconds) {
    const s = Math.max(0, Math.ceil(seconds));
    const m = Math.floor(s / 60);
    const rem = s % 60;
    return m + ':' + String(rem).padStart(2, '0');
  }

  function resetHoles() {
    const now = performance.now();
    state.holes = CONFIG.holes.map(() => ({
      moleState: 'hidden',
      progress: 0,
      hit: false,
      upUntil: 0,
    }));
    // Only one mole is ever active at a time — this tracks which hole
    // (if any) currently has one, and when the next one is allowed to pop.
    state.activeHoleIndex = -1;
    state.nextSpawnAt = now + randRange(CONFIG.timing.minWait, CONFIG.timing.maxWait);
  }

  function resizeCanvas() {
    // Fullscreen internal resolution — hole positions are percentage
    // based so this stays correct at any window size.
    canvas.width = window.innerWidth;
    canvas.height = window.innerHeight;
  }
  window.addEventListener('resize', resizeCanvas);

  // ---------------------------------------------------------------
  // Custom whip cursor
  // ---------------------------------------------------------------
  let cursorX = null;
  let cursorY = null;
  let cursorClickStartAt = null; // set on click; drives the move1 -> move2 -> strike -> rest sequence

  function canvasToLocal(clientX, clientY) {
    const rect = canvas.getBoundingClientRect();
    return {
      x: (clientX - rect.left) * (canvas.width / rect.width),
      y: (clientY - rect.top) * (canvas.height / rect.height),
    };
  }

  canvas.addEventListener('mousemove', (e) => {
    const p = canvasToLocal(e.clientX, e.clientY);
    cursorX = p.x;
    cursorY = p.y;
  });
  canvas.addEventListener('mouseleave', () => {
    cursorX = null;
    cursorY = null;
  });

  canvas.addEventListener('click', onCanvasClick);
  canvas.addEventListener('touchstart', (e) => {
    e.preventDefault();
    const touch = e.touches[0];
    const p = canvasToLocal(touch.clientX, touch.clientY);
    cursorX = p.x;
    cursorY = p.y;
    cursorClickStartAt = performance.now();
    handleHit(touch.clientX, touch.clientY);
  }, { passive: false });

  function onCanvasClick(e) {
    cursorClickStartAt = performance.now();
    handleHit(e.clientX, e.clientY);
  }

  function handleHit(clientX, clientY) {
    if (!running || paused || state.roundOver || state.attract) return;
    const rect = canvas.getBoundingClientRect();
    const x = (clientX - rect.left) * (canvas.width / rect.width);
    const y = (clientY - rect.top) * (canvas.height / rect.height);

    // Check topmost (last-drawn) holes first so overlapping hit areas
    // feel natural.
    for (let i = state.holes.length - 1; i >= 0; i--) {
      const h = state.holes[i];
      // h.hit means this mole was already whacked and is retreating —
      // it's immune until it's fully back down, so mashing the click
      // can't keep re-triggering the hit and cancelling the retreat.
      if (h.moleState === 'hidden' || h.progress < CONFIG.hitThreshold || h.hit) continue;

      const hole = CONFIG.holes[i];
      const groundX = hole.x * canvas.width;
      const groundY = hole.y * canvas.height;
      const moleGroundY = groundY - CONFIG.bush.height + CONFIG.mole.popOffsetY; // top edge of the bush, fine-tuned
      const moleTopY = moleGroundY - CONFIG.mole.popHeight * h.progress;
      const visibleHeight = CONFIG.mole.popHeight * h.progress;

      const boxX = groundX - CONFIG.mole.width / 2;
      const boxY = moleTopY;
      const boxW = CONFIG.mole.width;
      const boxH = visibleHeight;

      if (x >= boxX && x <= boxX + boxW && y >= boxY && y <= boxY + boxH) {
        h.progress = 1; // snap fully up so the fall — and the hit image — always plays out completely
        h.moleState = 'falling';
        h.hit = true; // immune from here until it fully retreats (moleState becomes 'hidden')
        state.score += 1;
        scoreDisplay.textContent = state.score;
        break; // one hit per click
      }
    }
  }

  window.addEventListener('keydown', (e) => {
    if (e.key === 'Escape' && running && !state.roundOver && !state.attract) togglePause();
  });

  pauseBtn.addEventListener('click', togglePause);
  resumeBtn.addEventListener('click', togglePause);

  function togglePause() {
    paused = !paused;
    pauseOverlay.classList.toggle('active', paused);
    if (!paused) lastTime = performance.now();
  }

  function startGame() {
    state.attract = false;
    state.score = 0;
    state.timeLeft = CONFIG.timing.roundSeconds;
    state.roundOver = false;
    scoreDisplay.textContent = '0';
    timerDisplay.textContent = formatTime(state.timeLeft);
    paused = false;
    pauseOverlay.classList.remove('active');
    roundoverOverlay.classList.remove('active');
    resizeCanvas();
    resetHoles();

    running = true;
    lastTime = performance.now();
    if (!rafId) rafId = requestAnimationFrame(loop);
  }

  function endRound() {
    state.roundOver = true;
    // Snap every hole back down for a clean freeze-frame.
    state.holes.forEach((h) => {
      h.moleState = 'hidden';
      h.progress = 0;
    });
    state.activeHoleIndex = -1;
    finalScoreDisplay.textContent = 'Score: ' + state.score;
    roundoverOverlay.classList.add('active');
  }

  function loop(timestamp) {
    if (!running) return;
    rafId = requestAnimationFrame(loop);

    const dt = Math.min((timestamp - lastTime) / 1000, 0.1); // clamp for tab-switch spikes
    lastTime = timestamp;

    fpsFrames++;
    fpsTimer += dt;
    if (fpsTimer >= 0.5) {
      fpsDisplay.textContent = Math.round(fpsFrames / fpsTimer) + ' FPS';
      fpsFrames = 0;
      fpsTimer = 0;
    }

    if (!paused && !state.roundOver) {
      update(dt, timestamp);
    }
    render(timestamp);
  }

  function update(dt, now) {
    const { mole, timing } = CONFIG;

    // While the home overlay is up, moles still animate for visual
    // flavor, but the round timer doesn't run.
    if (!state.attract) {
      state.timeLeft -= dt;
      if (state.timeLeft <= 0) {
        state.timeLeft = 0;
        timerDisplay.textContent = formatTime(0);
        endRound();
        return;
      }
      timerDisplay.textContent = formatTime(state.timeLeft);
    }

    // Only one hole is ever active at a time. If none is active and
    // the wait is over, pick a random hole to pop up next.
    if (state.activeHoleIndex === -1) {
      if (now >= state.nextSpawnAt) {
        const idx = Math.floor(Math.random() * state.holes.length);
        state.activeHoleIndex = idx;
        const h = state.holes[idx];
        h.moleState = 'rising';
        h.progress = 0;
        h.hit = false;
      }
    } else {
      const h = state.holes[state.activeHoleIndex];
      switch (h.moleState) {
        case 'rising':
          h.progress += (dt * mole.riseSpeed) / mole.popHeight;
          if (h.progress >= 1) {
            h.progress = 1;
            h.moleState = 'up';
            h.upUntil = now + timing.upDuration;
          }
          break;

        case 'up':
          if (now >= h.upUntil) {
            h.moleState = 'falling';
          }
          break;

        case 'falling':
          h.progress -= (dt * mole.fallSpeed) / mole.popHeight;
          if (h.progress <= 0) {
            h.progress = 0;
            h.moleState = 'hidden';
            h.hit = false;
            state.activeHoleIndex = -1;
            state.nextSpawnAt = now + randRange(timing.minWait, timing.maxWait);
          }
          break;
      }
    }
  }

  function render(now) {
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    drawBackground();

    CONFIG.holes.forEach((hole, i) => {
      const h = state.holes[i];
      const groundX = hole.x * canvas.width;
      const groundY = hole.y * canvas.height;
      const moleGroundY = groundY - CONFIG.bush.height + CONFIG.mole.popOffsetY; // top edge of the bush, fine-tuned

      if (h && h.progress > 0) {
        drawMole(groundX, moleGroundY, h.progress, h.hit);
      }
      drawBush(groundX, groundY);
    });

    drawCursor(now);
  }

  function drawBackground() {
    const img = images.background;
    if (img.loaded && !img.failed) {
      // Cover-fit: scale the image to fill the canvas without distortion.
      const scale = Math.max(canvas.width / img.width, canvas.height / img.height);
      const drawW = img.width * scale;
      const drawH = img.height * scale;
      const dx = (canvas.width - drawW) / 2;
      const dy = (canvas.height - drawH) / 2;
      ctx.drawImage(img, dx, dy, drawW, drawH);
    } else {
      // Fallback: simple grass-colored backdrop so the game is still playable.
      ctx.fillStyle = '#4a7c3f';
      ctx.fillRect(0, 0, canvas.width, canvas.height);
      ctx.fillStyle = 'rgba(255,255,255,0.5)';
      ctx.font = '14px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('add backgroundmole.png to this folder', canvas.width / 2, 30);
    }
  }

  function drawBush(groundX, groundY) {
    const { width: w, height: h } = CONFIG.bush;
    const x = groundX - w / 2;
    const y = groundY - h; // anchored bottom-center at the ground point

    const img = images.bush;
    if (img.loaded && !img.failed) {
      ctx.drawImage(img, x, y, w, h);
    } else {
      ctx.fillStyle = '#2f6b2f';
      ctx.beginPath();
      ctx.ellipse(groundX, groundY - h * 0.4, w / 2, h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(255,255,255,0.7)';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText('bush.png', groundX, groundY - h * 0.4);
    }
  }

  function drawMole(groundX, moleGroundY, progress, hit) {
    const { width: w, height: h } = CONFIG.mole;

    // Clip to everything above the bush's top edge so the animal
    // appears to rise up out of the top of the bush rather than
    // floating above/below it.
    ctx.save();
    ctx.beginPath();
    ctx.rect(0, 0, canvas.width, moleGroundY);
    ctx.clip();

    const topY = moleGroundY - CONFIG.mole.popHeight * progress;
    const img = hit ? images.moleHit : images.mole;

    if (img.loaded && !img.failed) {
      ctx.drawImage(img, groundX - w / 2, topY, w, h);
    } else {
      ctx.fillStyle = hit ? '#e0533d' : '#c98b4b';
      ctx.beginPath();
      ctx.ellipse(groundX, topY + h / 2, w / 2, h / 2, 0, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.6)';
      ctx.font = '11px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(hit ? 'mole_hit.png' : 'mole.png', groundX, topY + h / 2);
    }

    ctx.restore();
  }

  function drawCursor(now) {
    if (cursorX === null || cursorY === null) return;

    const { width: w, height: h, hotspotX, hotspotY, frameDuration } = CONFIG.cursor;

    let img = images.whipRest;
    let fallbackColor = '#ffffff';
    let fallbackLabel = 'whip_rest.png';

    if (cursorClickStartAt !== null) {
      const elapsed = now - cursorClickStartAt;
      if (elapsed < frameDuration) {
        img = images.whipMove1; fallbackColor = '#ffe066'; fallbackLabel = 'whip_move_1.png';
      } else if (elapsed < frameDuration * 2) {
        img = images.whipMove2; fallbackColor = '#ffa94d'; fallbackLabel = 'whip_move_2.png';
      } else if (elapsed < frameDuration * 3) {
        img = images.whipStrike; fallbackColor = '#ff6b6b'; fallbackLabel = 'whip_strike.png';
      } else {
        cursorClickStartAt = null; // sequence finished, back to rest
      }
    }

    const x = cursorX - hotspotX;
    const y = cursorY - hotspotY;

    if (img.loaded && !img.failed) {
      ctx.drawImage(img, x, y, w, h);
    } else {
      ctx.fillStyle = fallbackColor;
      ctx.beginPath();
      ctx.arc(cursorX, cursorY, 12, 0, Math.PI * 2);
      ctx.fill();
      ctx.fillStyle = 'rgba(0,0,0,0.7)';
      ctx.font = '10px monospace';
      ctx.textAlign = 'center';
      ctx.fillText(fallbackLabel, cursorX, cursorY + 24);
    }
  }

  // Kick off immediately in "attract" mode: the canvas is live and
  // moles pop up behind the home overlay, but scoring/timer are inert
  // until Play is pressed (see startGame()).
  resizeCanvas();
  resetHoles();
  running = true;
  lastTime = performance.now();
  rafId = requestAnimationFrame(loop);
})();
