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
function showProf(type, skipScroll) {
  document.querySelectorAll('.prof-card').forEach(c => c.classList.remove('active'));
  document.querySelectorAll('.prof-panel').forEach(p => p.classList.remove('active'));
  const card  = document.getElementById('tab-' + type);
  const panel = document.getElementById('detail-' + type);
  if (!card || !panel) return;
  card.classList.add('active');
  panel.classList.add('active');
  if (!skipScroll) {
    setTimeout(() => panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' }), 80);
  }
}

/* Hover previews panel without scrolling; last hovered/clicked stays visible */
document.querySelectorAll('.prof-card').forEach(card => {
  card.addEventListener('mouseenter', () => {
    showProf(card.id.replace('tab-', ''), true);
  });
});

/* Show nurses panel by default so the feature is immediately visible */
showProf('nurses', true);

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

/* ── Market Chart — animated SVG line ───────────────────── */
function buildChart() {
  const area = document.getElementById('market-chart');
  if (!area) return;

  const data = [
    { year: '2021', val: 2.1,  proj: false },
    { year: '2022', val: 2.9,  proj: false },
    { year: '2023', val: 3.5,  proj: false },
    { year: '2024', val: 4.2,  proj: false },
    { year: '2026', val: 5.9,  proj: true  },
    { year: '2028', val: 7.2,  proj: true  },
    { year: '2030', val: 9.08, proj: true  },
  ];

  const W = 760, H = 260;
  const padL = 56, padR = 44, padT = 28, padB = 44;
  const chartW = W - padL - padR, chartH = H - padT - padB, maxV = 10;
  const xS = i => padL + (i / (data.length - 1)) * chartW;
  const yS = v => padT + chartH - (v / maxV) * chartH;
  const ns = 'http://www.w3.org/2000/svg';
  const mk = (tag, attrs) => {
    const e = document.createElementNS(ns, tag);
    Object.entries(attrs).forEach(([k, v]) => e.setAttribute(k, String(v)));
    return e;
  };
  const an = attrs => mk('animate', attrs);

  const svg = mk('svg', { viewBox: `0 0 ${W} ${H}` });
  svg.style.cssText = 'width:100%;height:auto;overflow:visible;display:block';

  /* defs */
  const defs = mk('defs', {});
  const grad = mk('linearGradient', { id:'lcFill', x1:'0', y1:'0', x2:'0', y2:'1' });
  [['0%','0.16'],['100%','0.01']].forEach(([off, op]) => {
    grad.appendChild(mk('stop', { offset:off, 'stop-color':'#0F766E', 'stop-opacity':op }));
  });
  defs.appendChild(grad);
  const clip = mk('clipPath', { id:'lcClip' });
  const clipR = mk('rect', { id:'lcClipRect', x: padL - 4, y:0, width:0, height:H });
  clip.appendChild(clipR);
  defs.appendChild(clip);
  svg.appendChild(defs);

  /* grid lines + Y labels */
  [0,2,4,6,8,10].forEach(v => {
    const y = yS(v);
    const gl = mk('line', { x1:padL, x2:W-padR, y1:y, y2:y,
      stroke: v===0 ? 'rgba(15,118,110,.22)' : 'rgba(0,0,0,.06)',
      'stroke-width': v===0 ? '1.5' : '1' });
    if (v > 0) gl.setAttribute('stroke-dasharray', '4 4');
    svg.appendChild(gl);
    const tl = mk('text', { x:padL-9, y:y+4, 'text-anchor':'end',
      'font-size':'11', 'font-family':'Inter,sans-serif', fill:'#96A8B6' });
    tl.textContent = v===0 ? '$0' : `$${v}B`;
    svg.appendChild(tl);
  });

  /* Y axis */
  svg.appendChild(mk('line', { x1:padL, x2:padL, y1:padT-4, y2:yS(0),
    stroke:'rgba(0,0,0,.12)', 'stroke-width':'1.5' }));

  /* data points */
  const pts = data.map((d, i) => ({ ...d, x:xS(i), y:yS(d.val) }));
  const pathD = pts.map((p,i) => `${i===0?'M':'L'}${p.x},${p.y}`).join(' ');
  const splitIdx = pts.findIndex(p => p.proj);

  /* area fill */
  svg.appendChild(mk('path', {
    d: pathD + ` L${pts[pts.length-1].x},${yS(0)} L${pts[0].x},${yS(0)} Z`,
    fill:'url(#lcFill)', 'clip-path':'url(#lcClip)'
  }));

  /* solid segment (actual data 2021–2024) */
  svg.appendChild(mk('path', {
    d: pts.slice(0,splitIdx).map((p,i) => `${i===0?'M':'L'}${p.x},${p.y}`).join(' '),
    fill:'none', stroke:'#0F766E', 'stroke-width':'2.5',
    'stroke-linecap':'round', 'stroke-linejoin':'round', 'clip-path':'url(#lcClip)'
  }));

  /* dashed segment (projected 2024–2030) */
  svg.appendChild(mk('path', {
    d: pts.slice(splitIdx-1).map((p,i) => `${i===0?'M':'L'}${p.x},${p.y}`).join(' '),
    fill:'none', stroke:'#0F766E', 'stroke-width':'2.5',
    'stroke-linecap':'round', 'stroke-linejoin':'round',
    'stroke-dasharray':'8 5', opacity:'0.65', 'clip-path':'url(#lcClip)'
  }));

  /* X axis labels */
  pts.forEach(p => {
    svg.appendChild(mk('line', { x1:p.x, x2:p.x, y1:yS(0), y2:yS(0)+5, stroke:'rgba(0,0,0,.12)' }));
    const lb = mk('text', { x:p.x, y:yS(0)+20, 'text-anchor':'middle',
      'font-size':'11', 'font-family':'Inter,sans-serif',
      fill: p.year==='2030'?'#0F766E':'#96A8B6',
      'font-weight': p.year==='2030'?'700':'400' });
    lb.textContent = p.year;
    svg.appendChild(lb);
  });

  /* dots on non-last points */
  pts.slice(0,-1).forEach(p => svg.appendChild(mk('circle', {
    cx:p.x, cy:p.y, r:'3.5', fill:'#fff', stroke:'#0F766E',
    'stroke-width':'2', 'clip-path':'url(#lcClip)'
  })));

  /* ── SPARKLE GROUP at $9.08B endpoint ── */
  const lp = pts[pts.length - 1];
  const sg = mk('g', { 'clip-path':'url(#lcClip)' });

  /* ripple rings */
  ['0s','1s'].forEach(begin => {
    const ring = mk('circle', { cx:lp.x, cy:lp.y, r:'7', fill:'none',
      stroke:'#0F766E', 'stroke-width':'1.5' });
    ring.appendChild(an({ attributeName:'r', from:'7', to:'26', dur:'2s', begin, repeatCount:'indefinite' }));
    ring.appendChild(an({ attributeName:'opacity', from:'0.6', to:'0', dur:'2s', begin, repeatCount:'indefinite' }));
    sg.appendChild(ring);
  });

  /* core pulsing dot */
  const core = mk('circle', { cx:lp.x, cy:lp.y, r:'5.5', fill:'#0F766E' });
  core.appendChild(an({ attributeName:'opacity', values:'1;0.75;1', dur:'1.6s', repeatCount:'indefinite' }));
  sg.appendChild(core);
  sg.appendChild(mk('circle', { cx:lp.x, cy:lp.y, r:'2.5', fill:'#fff' }));

  /* value label above endpoint */
  const vl = mk('text', { x:lp.x, y:lp.y-16, 'text-anchor':'middle',
    'font-size':'12', 'font-weight':'700', 'font-family':'Inter,sans-serif',
    fill:'#0F766E', 'clip-path':'url(#lcClip)' });
  vl.textContent = '$9.08B';
  svg.appendChild(vl);
  svg.appendChild(sg);
  area.appendChild(svg);

  /* animate: expand clip rect from left on scroll */
  new IntersectionObserver(entries => {
    if (!entries[0].isIntersecting) return;
    const rect = document.getElementById('lcClipRect');
    if (!rect) return;
    let t0 = null;
    const dur = 1900;
    (function step(ts) {
      if (!t0) t0 = ts;
      const raw = Math.min((ts - t0) / dur, 1);
      const ease = raw < 0.5 ? 2*raw*raw : 1 - Math.pow(-2*raw+2, 2)/2;
      rect.setAttribute('width', String(ease * (chartW + 8)));
      if (raw < 1) requestAnimationFrame(step);
    })(performance.now());
  }, { threshold: 0.3 }).observe(area);
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
