/* ── Header scroll ──────────────────────────────────────── */
const hdr = document.getElementById('site-header');
window.addEventListener('scroll', () => {
  hdr.classList.toggle('scrolled', scrollY > 50);
}, { passive: true });

/* ── Mobile menu ────────────────────────────────────────── */
const burger = document.getElementById('hamburger');
const nav    = document.getElementById('nav-links');
burger.addEventListener('click', () => {
  nav.classList.toggle('open');
  const [a, b, c] = burger.querySelectorAll('span');
  const o = nav.classList.contains('open');
  a.style.transform = o ? 'rotate(45deg) translate(5px,5px)'  : '';
  b.style.opacity   = o ? '0' : '';
  c.style.transform = o ? 'rotate(-45deg) translate(5px,-5px)' : '';
});
nav.querySelectorAll('a').forEach(a => a.addEventListener('click', () => {
  nav.classList.remove('open');
  burger.querySelectorAll('span').forEach(s => { s.style.transform = ''; s.style.opacity = ''; });
}));

/* ── Profession tabs ────────────────────────────────────── */
function showProf(type) {
  document.querySelectorAll('.prof-card').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.prof-panel').forEach(p => p.classList.remove('active'));
  const card  = document.getElementById('tab-' + type);
  const panel = document.getElementById('detail-' + type);
  if (!card || !panel) return;
  card.classList.add('active');
  panel.classList.add('active');
  setTimeout(() => panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80);
}

/* ── FAQ accordion ──────────────────────────────────────── */
function toggleFAQ(btn) {
  const isOpen = btn.classList.contains('open');
  document.querySelectorAll('.fqb').forEach(b => {
    b.classList.remove('open');
    b.nextElementSibling.classList.remove('open');
  });
  if (!isOpen) {
    btn.classList.add('open');
    btn.nextElementSibling.classList.add('open');
  }
}

/* ── Form ───────────────────────────────────────────────── */
function handleForm(e) {
  e.preventDefault();
  document.getElementById('contact-form').style.display = 'none';
  document.getElementById('form-ok').style.display = 'block';
}

/* ── Image upload (bug-fixed) ───────────────────────────── */
function triggerUpload(id) {
  const el = document.getElementById(id);
  if (el) el.click();
}
function previewImg(input, slotId) {
  const file = input.files[0];
  if (!file) return;
  const reader = new FileReader();
  reader.onload = e => {
    const slot = document.getElementById(slotId);
    if (!slot) return;
    let img = slot.querySelector('img.preview');
    if (!img) { img = document.createElement('img'); img.className = 'preview'; slot.appendChild(img); }
    img.src = e.target.result;
    slot.classList.add('has-image');
    slot.querySelectorAll('.slot-ph,.pb-overlay').forEach(el => el.style.display = 'none');
  };
  reader.readAsDataURL(file);
}

/* ── Counter animation ──────────────────────────────────── */
function animateCount(el) {
  const target = parseFloat(el.dataset.count);
  if (isNaN(target)) return;
  const prefix  = el.dataset.prefix  || '';
  const suffix  = el.dataset.suffix  || '';
  const isFloat = !Number.isInteger(target);
  const frames  = 90;
  let frame = 0;
  const timer = setInterval(() => {
    frame++;
    const progress = frame / frames;
    const eased = 1 - Math.pow(1 - progress, 3); // ease-out cubic
    const current = target * eased;
    el.textContent = prefix + (isFloat ? current.toFixed(1) : Math.round(current)) + suffix;
    if (frame >= frames) { el.textContent = prefix + (isFloat ? target.toFixed(1) : target) + suffix; clearInterval(timer); }
  }, 1000 / 60);
}

/* ── Scroll reveal + counter observer ──────────────────── */
const revealObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) { e.target.classList.add('in-view'); revealObs.unobserve(e.target); }
  });
}, { threshold: 0.1, rootMargin: '0px 0px -40px 0px' });
document.querySelectorAll('.reveal, .reveal-left, .reveal-right').forEach(el => revealObs.observe(el));

const counterObs = new IntersectionObserver(entries => {
  entries.forEach(e => {
    if (e.isIntersecting) {
      e.target.querySelectorAll('[data-count]').forEach(animateCount);
      counterObs.unobserve(e.target);
    }
  });
}, { threshold: 0.4 });
document.querySelectorAll('.hero-kpis').forEach(el => counterObs.observe(el));

/* ── Market Chart ───────────────────────────────────────── */
const chartData = [
  { year: '2021', val: 2.1,  proj: false },
  { year: '2022', val: 2.9,  proj: false },
  { year: '2023', val: 3.5,  proj: false },
  { year: '2024', val: 4.2,  proj: false },
  { year: '2026', val: 5.9,  proj: true  },
  { year: '2028', val: 7.2,  proj: true  },
  { year: '2030', val: 9.08, proj: true  },
];
const maxVal = Math.max(...chartData.map(d => d.val));

function buildChart() {
  const area = document.getElementById('market-chart');
  if (!area) return;

  const wrap = document.createElement('div');
  wrap.style.cssText = 'position:relative;height:240px;padding-left:48px;padding-bottom:32px';

  // Grid lines
  [2, 4, 6, 8, 10].forEach(v => {
    const pct = (v / maxVal) * 200;
    if (pct > 200) return;
    const y = 200 - pct;
    const line = document.createElement('div');
    line.style.cssText = `position:absolute;left:48px;right:0;top:${y}px;border-top:1px dashed rgba(0,0,0,.07)`;
    const lbl = document.createElement('span');
    lbl.textContent = '$' + v + 'B';
    lbl.style.cssText = 'position:absolute;right:100%;padding-right:8px;font-size:.61rem;color:#96A8B6;transform:translateY(-50%);white-space:nowrap;top:0';
    line.appendChild(lbl);
    wrap.appendChild(line);
  });

  // Bars container
  const bars = document.createElement('div');
  bars.style.cssText = 'display:flex;align-items:flex-end;gap:6px;height:200px;position:relative;z-index:1';

  chartData.forEach(d => {
    const col = document.createElement('div');
    col.style.cssText = 'display:flex;flex-direction:column;align-items:center;flex:1;position:relative';

    const bar = document.createElement('div');
    const targetH = Math.round((d.val / maxVal) * 200);
    bar.style.cssText = `width:72%;height:0;border-radius:5px 5px 0 0;transition:height 1.1s cubic-bezier(.22,.68,0,1.1);cursor:default;position:relative`;
    bar.className = d.proj ? 'cb-bar pjt' : 'cb-bar act';
    bar.dataset.h = targetH;
    bar.style.background = d.proj ? 'var(--teal-lt)' : 'var(--teal)';
    if (d.proj) { bar.style.border = '2px solid var(--teal)'; }

    // Tooltip
    const tip = document.createElement('div');
    tip.textContent = '$' + d.val + 'B';
    tip.style.cssText = 'position:absolute;top:-28px;left:50%;transform:translateX(-50%);background:var(--teal-dk);color:#fff;font-size:.68rem;font-weight:700;padding:3px 8px;border-radius:6px;white-space:nowrap;opacity:0;transition:opacity .2s;pointer-events:none';
    bar.appendChild(tip);
    bar.addEventListener('mouseenter', () => tip.style.opacity = '1');
    bar.addEventListener('mouseleave', () => tip.style.opacity = '0');

    const yr = document.createElement('div');
    yr.textContent = d.year;
    yr.style.cssText = 'font-size:.67rem;color:#96A8B6;font-weight:500;position:absolute;bottom:-26px;left:50%;transform:translateX(-50%);white-space:nowrap';

    col.appendChild(bar);
    col.appendChild(yr);
    bars.appendChild(col);
  });

  wrap.appendChild(bars);
  area.appendChild(wrap);

  // Animate on scroll into view
  const obs = new IntersectionObserver(entries => {
    if (entries[0].isIntersecting) {
      bars.querySelectorAll('.cb-bar').forEach((bar, i) => {
        setTimeout(() => { bar.style.height = bar.dataset.h + 'px'; }, i * 100);
      });
      obs.disconnect();
    }
  }, { threshold: 0.3 });
  obs.observe(area);
}
buildChart();

/* ── Subtle card tilt (desktop) ─────────────────────────── */
if (window.innerWidth > 1024) {
  document.querySelectorAll('.lcard, .reg-card, .biz-card').forEach(card => {
    card.addEventListener('mousemove', e => {
      const r = card.getBoundingClientRect();
      const x = (e.clientX - r.left - r.width / 2)  / r.width;
      const y = (e.clientY - r.top  - r.height / 2) / r.height;
      card.style.transform = `translateY(-3px) rotateX(${-y * 4}deg) rotateY(${x * 4}deg)`;
      card.style.transition = 'transform 0.08s ease';
    });
    card.addEventListener('mouseleave', () => {
      card.style.transform = '';
      card.style.transition = 'transform 0.4s ease, border-color 0.25s, box-shadow 0.25s';
    });
  });
}
