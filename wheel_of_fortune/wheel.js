const canvas = document.getElementById('wheel');
const ctx = canvas.getContext('2d');
const btn = document.getElementById('spin-btn');
const result = document.getElementById('result');

const cx = 160, cy = 160, R = 148;
const YES_FRAC = 0.1;
const ARROW_LEN = 110; // distance from center to tip

let angle = 0;
let spinning = false;

function drawWheel() {
  const yesStart = -Math.PI / 2 - YES_FRAC * Math.PI;
  const yesEnd   = -Math.PI / 2 + YES_FRAC * Math.PI;

  // NO slice (90%)
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, R, yesEnd, yesStart + Math.PI * 2);
  ctx.closePath();
  ctx.fillStyle = '#dc2626';
  ctx.fill();

  // YES slice (10%, centered at top)
  ctx.beginPath();
  ctx.moveTo(cx, cy);
  ctx.arc(cx, cy, R, yesStart, yesEnd);
  ctx.closePath();
  ctx.fillStyle = '#16a34a';
  ctx.fill();

  // outer ring
  ctx.beginPath();
  ctx.arc(cx, cy, R, 0, Math.PI * 2);
  ctx.lineWidth = 3;
  ctx.strokeStyle = '#000';
  ctx.stroke();

  // labels
  ctx.fillStyle = '#fff';
  ctx.font = 'bold 16px sans-serif';
  ctx.textAlign = 'center';
  ctx.textBaseline = 'middle';
  ctx.fillText('YES', cx, cy - R * 0.6);

  ctx.font = 'bold 22px sans-serif';
  ctx.fillText('NO', cx, cy + R * 0.5);
}

// Arrow pivots from its TIP, which sits fixed near the YES label.
// The base (tail) is what swings around. At angle 0, the base
// renders at the wheel's exact center, tip pointing straight up.
function drawArrow(rotationAngle) {
  const pivotX = cx;
  const pivotY = cy - ARROW_LEN; // fixed pivot point, near YES

  ctx.save();
  ctx.translate(pivotX, pivotY);
  ctx.rotate(rotationAngle);

  // arrowhead — apex sits exactly at the pivot (0,0)
  ctx.beginPath();
  ctx.moveTo(0, 0);
  ctx.lineTo(10, 22);
  ctx.lineTo(-10, 22);
  ctx.closePath();
  ctx.fillStyle = '#fff';
  ctx.fill();

  // shaft — runs from the arrowhead base out to where the
  // tail ends up (ARROW_LEN away from the pivot)
  ctx.beginPath();
  ctx.moveTo(-4, 22);
  ctx.lineTo(4, 22);
  ctx.lineTo(4, ARROW_LEN);
  ctx.lineTo(-4, ARROW_LEN);
  ctx.closePath();
  ctx.fillStyle = '#fff';
  ctx.fill();

  ctx.restore();
}

function draw(rotationAngle) {
  ctx.clearRect(0, 0, 320, 320);
  drawWheel();
  drawArrow(rotationAngle);

  // center dot
  ctx.beginPath();
  ctx.arc(cx, cy, 6, 0, Math.PI * 2);
  ctx.fillStyle = '#000';
  ctx.fill();
}

draw(0);

btn.addEventListener('click', function () {
  if (spinning) return;
  spinning = true;
  result.textContent = '';
  btn.disabled = true;

  const spins = (6 + Math.random() * 6) * Math.PI * 2;
  const duration = 3000 + Math.random() * 1500;
  const start = performance.now();
  const startAngle = angle;

  function ease(t) { return t < 0.5 ? 2 * t * t : -1 + (4 - 2 * t) * t; }

  function frame(now) {
    const t = Math.min((now - start) / duration, 1);
    angle = startAngle + spins * ease(t);
    draw(angle);

    if (t < 1) {
      requestAnimationFrame(frame);
    } else {
      spinning = false;
      btn.disabled = false;
      // the tip is pinned at the pivot, so it can never leave YES
      result.textContent = '🍺 YES — get drunk tonight!';
    }
  }

  requestAnimationFrame(frame);
});