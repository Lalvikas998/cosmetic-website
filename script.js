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

/* ── Journey pathway — static connector line drawn through the circles ── */
(function initJourney() {
  const wrap = document.getElementById('jny-wrap');
  if (!wrap) return;
  const svg  = document.getElementById('jny-wave-svg');
  const path = document.getElementById('jny-wave-path');
  const startDot = document.getElementById('jny-wave-start-dot');
  const steps = Array.from(wrap.querySelectorAll('.jny-step'));
  if (!svg || !path || !steps.length) return;

  function smoothPath(pts) {
    if (pts.length < 2) return '';
    let d = `M${pts[0].x},${pts[0].y}`;
    for (let i = 0; i < pts.length - 1; i++) {
      const p0 = pts[i === 0 ? 0 : i - 1];
      const p1 = pts[i];
      const p2 = pts[i + 1];
      const p3 = pts[i + 2 < pts.length ? i + 2 : i + 1];
      const c1x = p1.x + (p2.x - p0.x) / 6;
      const c1y = p1.y + (p2.y - p0.y) / 6;
      const c2x = p2.x - (p3.x - p1.x) / 6;
      const c2y = p2.y - (p3.y - p1.y) / 6;
      d += ` C${c1x},${c1y} ${c2x},${c2y} ${p2.x},${p2.y}`;
    }
    return d;
  }

  function draw() {
    if (window.innerWidth <= 1100 || wrap.offsetHeight === 0) {
      path.removeAttribute('d');
      if (startDot) startDot.setAttribute('r', '0');
      return;
    }
    const wrapRect = wrap.getBoundingClientRect();
    svg.setAttribute('viewBox', `0 0 ${wrapRect.width} ${wrapRect.height}`);
    const pts = steps.map(s => {
      const circle = s.querySelector('.jny-num-wrap');
      const r = circle.getBoundingClientRect();
      return {
        x: r.left + r.width / 2 - wrapRect.left,
        y: r.top + r.height / 2 - wrapRect.top
      };
    });
    /* Lead-in: the CTA is the journey's starting point. Route the line up
       from the button, hug the wrap's left edge clear of every card, then
       hook right into step 1 — the first node the journey flows into.
       Drawn as its own subpath (not chained into the steps' Catmull-Rom
       array) so step 2's position can't pull the curve's tangent at
       step 1 downward into step 1's own paragraph text. */
    const cta = document.getElementById('jny-cta');
    let ctaPt = null;
    let leadD = '';
    if (cta) {
      const firstPt = pts[0];
      const r = cta.getBoundingClientRect();
      const ctaX = r.left + r.width / 2 - wrapRect.left;
      const ctaTopY = r.top - wrapRect.top - 16;
      const edgeX = -28;
      ctaPt = { x: ctaX, y: ctaTopY };
      leadD = smoothPath([
        ctaPt,
        { x: edgeX, y: ctaTopY },
        { x: edgeX, y: firstPt.y + 40 },
        firstPt
      ]) + ' ';
    }
    path.setAttribute('d', leadD + smoothPath(pts));
    if (startDot) {
      if (ctaPt) {
        startDot.setAttribute('cx', ctaPt.x);
        startDot.setAttribute('cy', ctaPt.y);
        startDot.setAttribute('r', '5');
      } else {
        startDot.setAttribute('r', '0');
      }
    }
  }

  draw();
  window.addEventListener('load', draw);
  let resizeTimer;
  window.addEventListener('resize', () => {
    clearTimeout(resizeTimer);
    resizeTimer = setTimeout(draw, 150);
  });
})();

/* ── State requirements explorer ─────────────────────────────────────
   Data-driven: one state list + a profession-rule table generate the
   map, the two pickers and the entire detail panel (cards + accordion).
   ────────────────────────────────────────────────────────────────── */
(function initStates() {
  const root = document.getElementById('states');
  if (!root) return;

  const PROFESSIONS = [
    { code: 'rn',      label: 'Registered Nurse',     short: 'RN'  },
    { code: 'en',      label: 'Enrolled Nurse',       short: 'EN'  },
    { code: 'np',      label: 'Nurse Practitioner',   short: 'NP'  },
    { code: 'doctor',  label: 'Doctor',                short: 'Dr'  },
    { code: 'dentist', label: 'Dentist',                short: 'Dt'  },
  ];

  /* Australia-wide scope-of-practice baseline — these four facts are
     determined by national AHPRA scope, not state law, so they don't
     vary by state. Score delta nudges the Business Difficulty Index
     up/down per profession relative to a state's RN baseline score. */
  const PROF_BASE = {
    rn:      { prescribe: 'no',      inject: 'yes',     prescriberReq: 'yes', dispense: 'no',      own: 'state',  storeBuy: 'no',  scoreDelta: 0  },
    en:      { prescribe: 'no',      inject: 'limited',  prescriberReq: 'yes', dispense: 'no',      own: 'no',     storeBuy: 'no',  scoreDelta: 1  },
    np:      { prescribe: 'yes',     inject: 'yes',      prescriberReq: 'no',  dispense: 'no',      own: 'yes',    storeBuy: 'yes', scoreDelta: -3 },
    doctor:  { prescribe: 'yes',     inject: 'yes',      prescriberReq: 'no',  dispense: 'yes',     own: 'yes',    storeBuy: 'yes', scoreDelta: -4 },
    dentist: { prescribe: 'limited', inject: 'limited',  prescriberReq: 'no',  dispense: 'limited', own: 'yes',    storeBuy: 'yes', scoreDelta: -3 },
  };

  const STATES = [
    {
      code: 'QLD', name: 'Queensland', tag: 'Most Regulated', act: 'Medicines and Poisons Act 2019 (QLD)', score: 9,
      ownNote: 'Allowed only under a strict doctor/NP custody model — no independent stock holding for RNs.',
      accordion: [
        ['Prescribing Rules', 'Only doctors and nurse practitioners may prescribe S4 cosmetic injectables. RNs must work from a valid, patient-specific prescription before every treatment — standing orders are not accepted.'],
        ['Medicine Custody Requirements', 'S4 stock must remain under the exclusive custody of the prescribing doctor or NP at all times. RNs cannot buy, store or hold multi-use vials under any circumstances.'],
        ['Clinic Ownership Models', 'RN-led clinics are legal only under a remote prescriber model — a doctor/NP consults and dispenses patient-specific medicine, the RN injects. No stock is held onsite by the RN.'],
        ['Advertising & Marketing Requirements', "All advertising must comply with AHPRA's National Law restrictions on therapeutic claims, before/after imagery and testimonials — enforcement in QLD has increased markedly since 2023."],
        ['Business Considerations', 'Budget for a formal prescriber arrangement, professional indemnity insurance covering cosmetic procedures, and compliant record-keeping for every S4 dispensing event.'],
        ['Common Mistakes', "The most common compliance breach is an RN personally purchasing or pre-ordering stock 'on behalf of' the clinic — this is treated as unlawful possession, even if a doctor reimburses the cost."],
      ],
    },
    {
      code: 'NSW', name: 'New South Wales', tag: 'Moderate Regulation', act: 'Poisons and Therapeutic Goods Act 1966 (NSW)', score: 6,
      ownNote: 'Allowed under a doctor/NP-led model; clinic structuring is more flexible than QLD but custody rules still apply.',
      accordion: [
        ['Prescribing Rules', 'Prescriptions must be issued by an AHPRA-registered doctor or NP following an appropriate consultation; telehealth consultations are accepted where clinically appropriate.'],
        ['Medicine Custody Requirements', "S4 medicines must be stored under the prescriber's authority. NSW Health permits slightly more flexible record-keeping for multi-clinic prescriber arrangements than QLD."],
        ['Clinic Ownership Models', 'RNs can co-own or manage a clinic alongside a prescribing doctor/NP, provided the prescriber retains clinical and medicine-custody responsibility.'],
        ['Advertising & Marketing Requirements', "Subject to the same AHPRA National Law restrictions as all states — no therapeutic claims, misleading before/afters, or unapproved testimonials."],
        ['Business Considerations', 'Factor in NSW Health facility registration if treatments are performed in a registered medical practice setting.'],
        ['Common Mistakes', "Assuming a remote/telehealth prescriber arrangement removes the need for a documented clinical governance framework — it doesn't."],
      ],
    },
    {
      code: 'VIC', name: 'Victoria', tag: 'Moderate Regulation', act: 'Drugs, Poisons and Controlled Substances Act 1981 (VIC)', score: 6,
      ownNote: "Allowed under prescriber-led models; Victoria publishes specific guidance for nurse-administered cosmetic injectables.",
      accordion: [
        ['Prescribing Rules', 'A valid prescription from a doctor or NP is required before each treatment episode; Victoria publishes specific guidance for nurses administering Schedule 4 cosmetic injectables.'],
        ['Medicine Custody Requirements', 'Possession and supply of S4 medicines is restricted to authorised prescribers — consistent with the national Poisons Standard.'],
        ['Clinic Ownership Models', 'Multi-disciplinary clinic structures are common and well-supported by existing Victorian guidance for cosmetic practice.'],
        ['Advertising & Marketing Requirements', "Cosmetic procedure advertising is monitored under both AHPRA's National Law and Victorian consumer protection law."],
        ['Business Considerations', "Victoria's Health Complaints Commissioner has specific oversight of cosmetic procedures — factor this into your complaints-handling policy."],
        ['Common Mistakes', 'Underestimating the documentation expected for informed consent specific to cosmetic (non-therapeutic) procedures.'],
      ],
    },
    {
      code: 'WA', name: 'Western Australia', tag: 'Balanced Approach', act: 'Medicines and Poisons Act 2014 (WA)', score: 5,
      ownNote: "Allowed with a prescriber arrangement; WA's geographic spread means remote/telehealth prescriber models are common.",
      accordion: [
        ['Prescribing Rules', "Standard AHPRA prescribing rules apply; WA's large regional footprint means telehealth prescriber consultations are widely accepted."],
        ['Medicine Custody Requirements', 'S4 custody sits with the prescriber. WA Health guidance accommodates remote prescriber models for regional and outer-metro clinics.'],
        ['Clinic Ownership Models', 'RN-led clinics operating under a remote or visiting prescriber model are common, particularly outside Perth.'],
        ['Advertising & Marketing Requirements', 'Same national AHPRA restrictions apply; WA Health also monitors cosmetic procedure advertising directly.'],
        ['Business Considerations', 'Travel and locum costs for visiting prescribers should be budgeted for regional clinics.'],
        ['Common Mistakes', 'Relying on a verbal or informal prescriber arrangement instead of a documented agreement — WA Health expects this in writing.'],
      ],
    },
    {
      code: 'SA', name: 'South Australia', tag: 'Balanced Approach', act: 'Controlled Substances Act 1984 (SA)', score: 5,
      ownNote: 'Allowed under prescriber oversight; SA Health applies the standard national framework without extra state-specific restrictions.',
      accordion: [
        ['Prescribing Rules', 'Prescriptions must come from an authorised doctor or NP; no additional state-specific prescribing restrictions beyond the national framework.'],
        ['Medicine Custody Requirements', 'Custody and supply of S4 medicines follows the Controlled Substances Act 1984 — consistent with national Poisons Standard scheduling.'],
        ['Clinic Ownership Models', 'Standard prescriber-led ownership models apply with no unusual state-specific restrictions.'],
        ['Advertising & Marketing Requirements', "AHPRA's National Law restrictions apply; SA Health does not impose additional advertising rules beyond this."],
        ['Business Considerations', "SA's smaller market means networking with local prescribers early is particularly valuable."],
        ['Common Mistakes', "Assuming SA's lighter-touch regulation means clinical governance documentation isn't required — it still is."],
      ],
    },
    {
      code: 'TAS', name: 'Tasmania', tag: 'More Flexible', act: 'Poisons Act 1971 (TAS)', score: 4,
      ownNote: "Allowed under prescriber oversight; Tasmania's small market means most clinics work with a handful of established prescribers.",
      accordion: [
        ['Prescribing Rules', 'Standard national prescribing rules apply, administered under the Poisons Act 1971 (TAS).'],
        ['Medicine Custody Requirements', 'Custody sits with the prescriber, consistent with the national Poisons Standard scheduling for S4 medicines.'],
        ['Clinic Ownership Models', "Tasmania's small, close-knit market means most RN-led clinics work with a small number of established local prescribers."],
        ['Advertising & Marketing Requirements', "AHPRA's National Law restrictions apply uniformly across all of Tasmania's health districts."],
        ['Business Considerations', 'Limited local training-provider presence means budgeting for interstate travel to attend practical training.'],
        ['Common Mistakes', 'Underestimating how few local prescribers are available — securing a prescriber arrangement early is essential.'],
      ],
    },
    {
      code: 'ACT', name: 'Australian Capital Territory', tag: 'More Flexible', act: 'Medicines, Poisons and Therapeutic Goods Act 2008 (ACT)', score: 4,
      ownNote: "Allowed under prescriber oversight; the ACT's compact geography makes co-located prescriber arrangements straightforward.",
      accordion: [
        ['Prescribing Rules', "Standard AHPRA prescribing rules apply, administered under the ACT's Medicines, Poisons and Therapeutic Goods Act 2008."],
        ['Medicine Custody Requirements', 'Custody and supply of S4 medicines follows the national Poisons Standard, with no additional ACT-specific restrictions.'],
        ['Clinic Ownership Models', "The ACT's compact geography makes co-located, in-person prescriber arrangements straightforward to establish."],
        ['Advertising & Marketing Requirements', "AHPRA's National Law restrictions apply; the ACT does not impose additional advertising-specific rules."],
        ['Business Considerations', "Canberra's market is small but stable — building a local referral network is valuable for steady patient flow."],
        ['Common Mistakes', 'Overlooking Commonwealth workplace policies on cosmetic procedure advertising aimed at government staff.'],
      ],
    },
    {
      code: 'NT', name: 'Northern Territory', tag: 'Most Flexible', act: 'Medicines, Poisons and Therapeutic Goods Act 2012 (NT)', score: 3,
      ownNote: "Allowed under prescriber oversight; remote prescriber and telehealth models are well-established given the NT's vast distances.",
      accordion: [
        ['Prescribing Rules', "Standard national prescribing rules apply; telehealth prescriber consultations are widely used given the NT's remote geography."],
        ['Medicine Custody Requirements', 'Custody sits with the prescriber under the national Poisons Standard; remote dispensing arrangements are well-established in the NT.'],
        ['Clinic Ownership Models', "Remote/telehealth prescriber-led models are common and well-supported, reflecting the NT's geographic spread."],
        ['Advertising & Marketing Requirements', "AHPRA's National Law restrictions apply uniformly across the Territory."],
        ['Business Considerations', 'Factor in higher freight and logistics costs for medicine supply chains given the NT\'s remoteness.'],
        ['Common Mistakes', 'Underestimating delivery and supply-chain lead times when relying on a remote prescriber model.'],
      ],
    },
  ];

  const CARD_DEFS = [
    { key: 'prescribe',     label: 'Can Prescribe?',              sub: 'S4 cosmetic injectables' },
    { key: 'inject',        label: 'Can Inject?',                 sub: 'After appropriate prescription' },
    { key: 'own',           label: 'Can Own / Open a Clinic?',    sub: 'Cosmetic injectable business' },
    { key: 'storeS4',       label: 'Can Store S4 Medicines?',     sub: 'Botox, fillers & other S4' },
    { key: 'buyS4',         label: 'Can Buy S4 Medicines?',       sub: 'Purchasing as clinic stock' },
    { key: 'prescriberReq', label: 'Prescriber Required?',        sub: 'Before every treatment' },
    { key: 'dispense',      label: 'Can Dispense to Patients?',   sub: 'Supplying labelled medicine' },
  ];

  const VAL_LABEL = { yes: 'Yes', no: 'No', limited: 'Limited' };

  let activeState = STATES[0].code;
  let activeProf  = PROFESSIONS[0].code;
  let wallGroup   = null;

  function getState(code) { return STATES.find(s => s.code === code); }

  function effectiveScore(state, profCode) {
    const delta = PROF_BASE[profCode].scoreDelta;
    return Math.max(1, Math.min(10, state.score + delta));
  }

  function scoreColor(score) {
    if (score >= 8) return '#DC2626';
    if (score >= 6) return '#D97706';
    if (score >= 4) return '#0F766E';
    return '#0EA371';
  }

  /* per-state color accent + icon SVG */
  const ST_META = {
    QLD: { color: '#FF6B6B', bg: 'rgba(255,107,107,.18)', icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 22s8-4 8-10V5l-8-3-8 3v7c0 6 8 10 8 10z"/></svg>' },
    NSW: { color: '#F59E0B', bg: 'rgba(245,158,11,.18)',  icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="9" width="18" height="13" rx="2"/><path d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2"/><line x1="8" y1="21" x2="8" y2="9"/><line x1="16" y1="21" x2="16" y2="9"/></svg>' },
    VIC: { color: '#A855F7', bg: 'rgba(168,85,247,.18)',  icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="12 2 15.09 8.26 22 9.27 17 14.14 18.18 21.02 12 17.77 5.82 21.02 7 14.14 2 9.27 8.91 8.26 12 2"/></svg>' },
    WA:  { color: '#3B82F6', bg: 'rgba(59,130,246,.18)',  icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10A15.3 15.3 0 0 1 8 12 15.3 15.3 0 0 1 12 2z"/></svg>' },
    SA:  { color: '#10B981', bg: 'rgba(16,185,129,.18)',  icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"/><line x1="12" y1="1" x2="12" y2="3"/><line x1="12" y1="21" x2="12" y2="23"/><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"/><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"/><line x1="1" y1="12" x2="3" y2="12"/><line x1="21" y1="12" x2="23" y2="12"/><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"/><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"/></svg>' },
    TAS: { color: '#06B6D4', bg: 'rgba(6,182,212,.18)',   icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><polygon points="3 20 21 20 12 4 3 20"/><line x1="8" y1="20" x2="8" y2="13"/><line x1="16" y1="20" x2="16" y2="13"/></svg>' },
    ACT: { color: '#F97316', bg: 'rgba(249,115,22,.18)',  icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="22" x2="21" y2="22"/><line x1="6" y1="18" x2="6" y2="11"/><line x1="10" y1="18" x2="10" y2="11"/><line x1="14" y1="18" x2="14" y2="11"/><line x1="18" y1="18" x2="18" y2="11"/><polygon points="12 2 20 7 4 7"/></svg>' },
    NT:  { color: '#22D3EE', bg: 'rgba(34,211,238,.18)',  icon: '<svg width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v20"/><path d="M2 12h20"/><path d="M4.93 4.93l14.14 14.14"/><path d="M19.07 4.93L4.93 19.07"/></svg>' },
  };

  function dotRowHTML(cls, score, color) {
    let h = '';
    for (let i = 1; i <= 10; i++)
      h += `<span class="${cls}" style="background:${i <= score ? color : 'rgba(255,255,255,.12)'}"></span>`;
    return h;
  }

  /* ── Render: state tabs (step 1) ───────────────────────────── */
  function renderStateGrid() {
    const grid = document.getElementById('st-state-grid');
    if (!grid) return;
    grid.innerHTML = STATES.map(s => {
      const score = effectiveScore(s, activeProf);
      const color = scoreColor(score);
      const m = ST_META[s.code] || { color: '#17A89C', bg: 'rgba(23,168,156,.18)', icon: '' };
      const active = s.code === activeState;
      return `
        <button class="st-tab${active ? ' active' : ''}" data-state="${s.code}"
          onclick="selectState('${s.code}')"
          style="${active ? `border-color:${m.color};box-shadow:0 0 20px ${m.bg}` : ''}">
          <div class="st-tab-icon" style="background:${m.bg};color:${m.color}">${m.icon}</div>
          <span class="st-tab-abbr">${s.code}</span>
          <span class="st-tab-name">${s.name}</span>
          <span class="st-tab-score" style="color:${color}">${score}/10</span>
        </button>`;
    }).join('');
  }

  /* ── Render: profession cards (step 2) ─────────────────────── */
  function renderProfGrid() {
    const grid = document.getElementById('st-prof-grid');
    if (!grid) return;
    grid.innerHTML = PROFESSIONS.map(p => {
      const active = p.code === activeProf;
      return `
        <button class="st-pcard${active ? ' active' : ''}" data-prof="${p.code}" onclick="selectProfession('${p.code}')">
          <span class="st-pcard-icon">${p.short}</span>
          <span>
            <span class="st-pcard-lbl">${p.label}</span>
            <span class="st-pcard-sub">${p.short}</span>
          </span>
        </button>`;
    }).join('');
  }

  /* ── Render: 2-panel detail (overview + requirements) ──────── */
  function renderDetail() {
    const wrap = document.getElementById('st-detail');
    if (!wrap) return;
    const state = getState(activeState);
    const prof  = PROFESSIONS.find(p => p.code === activeProf);
    const base  = PROF_BASE[activeProf];
    const score = effectiveScore(state, activeProf);
    const color = scoreColor(score);
    const m     = ST_META[activeState] || { color: '#17A89C', bg: 'rgba(23,168,156,.18)' };

    const values = {
      prescribe:    base.prescribe,
      inject:       base.inject,
      own:          base.own === 'state' ? 'limited' : base.own,
      prescriberReq: base.prescriberReq,
    };

    /* Can-perform strip */
    const CAN_DEFS = [
      { key: 'prescribe',     lbl: 'Can Prescribe?' },
      { key: 'inject',        lbl: 'Can Inject?' },
      { key: 'own',           lbl: 'Can Own a Clinic?' },
      { key: 'prescriberReq', lbl: 'Prescriber Required?' },
    ];
    const canHTML = CAN_DEFS.map(d => {
      const val = values[d.key];
      const cls = val === 'yes' ? 'st-can-y' : val === 'no' ? 'st-can-n' : 'st-can-l';
      const lbl = val === 'yes' ? 'Yes' : val === 'no' ? 'No' : 'Limited';
      return `<div class="st-can-row ${cls}">
        <span class="st-can-lbl">${d.lbl}</span>
        <span class="st-can-val"><span class="st-can-ico"></span>${lbl}</span>
      </div>`;
    }).join('');

    /* Highlights from first 3 accordion items */
    const hlHTML = state.accordion.slice(0, 3).map(item => `
      <div class="st-ov-hl">
        <span class="st-ov-hl-dot" style="background:${m.color}"></span>
        <span class="st-ov-hl-txt"><strong>${item[0]}:</strong> ${item[1].substring(0, 90)}…</span>
      </div>`).join('');

    /* Requirements accordion */
    const raccHTML = state.accordion.map((item, i) => `
      <div class="st-racc-item">
        <button class="st-racc-btn${i === 0 ? ' open' : ''}" onclick="toggleRacc(this)">
          ${item[0]}
          <span class="st-racc-ico">+</span>
        </button>
        <div class="st-racc-body${i === 0 ? ' open' : ''}"><p>${item[1]}</p></div>
      </div>`).join('');

    wrap.innerHTML = `
      <div class="st-panel">
        <div class="st-panel-hdr">
          <span class="st-panel-num" style="background:${m.bg};border-color:${m.color};color:${m.color}">3</span>
          <span class="st-panel-title">Overview — ${state.name}</span>
        </div>
        <div class="st-ov-metrics">
          <div class="st-ov-metric">
            <div class="st-ov-mlbl">Difficulty</div>
            <div class="st-ov-mscore" style="color:${color}">${score}<span>/10</span></div>
            <div class="st-ov-dots">${dotRowHTML('st-ov-dot', score, color)}</div>
          </div>
          <div class="st-ov-metric">
            <div class="st-ov-mlbl">Regulation</div>
            <div class="st-ov-mval" style="color:${m.color};font-size:.78rem">${state.tag}</div>
          </div>
          <div class="st-ov-metric" style="grid-column:1/-1">
            <div class="st-ov-mlbl">Profession</div>
            <div class="st-ov-mval" style="color:rgba(255,255,255,.75)">${prof.label}</div>
          </div>
        </div>
        <div class="st-ov-hl-title">Key Highlights</div>
        ${hlHTML}
        <a href="#" class="st-ov-link" onclick="return false">
          <svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.2"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
          Download ${state.code} Guidelines
        </a>
      </div>
      <div class="st-panel">
        <div class="st-panel-hdr">
          <span class="st-panel-num" style="background:${m.bg};border-color:${m.color};color:${m.color}">4</span>
          <span class="st-panel-title">Requirements</span>
        </div>
        <div class="st-can-hdr">What you can do</div>
        ${canHTML}
        <div class="st-can-hdr" style="margin-top:14px">Detailed breakdown</div>
        <div class="st-req-acc">${raccHTML}</div>
      </div>`;
  }

  /* ── Build wall layer ─────────────────────────────────────── */
  function initWallLayer() {
    const svg = document.getElementById('st-map-svg');
    if (!svg) return;
    const shapes = [...svg.querySelectorAll('.st-shape')];
    if (!shapes.length) return;
    wallGroup = document.createElementNS('http://www.w3.org/2000/svg', 'g');
    wallGroup.id = 'st-wall-group';
    shapes.forEach(shape => {
      const wall = shape.cloneNode(true);
      wall.className.baseVal = '';
      wall.removeAttribute('id');
      wall.querySelectorAll('[id]').forEach(el => el.removeAttribute('id'));
      wall.setAttribute('filter', 'url(#st-wf-gray)');
      wall.setAttribute('fill', '#EAEDF3');
      wall.setAttribute('stroke', 'none');
      wall.setAttribute('pointer-events', 'none');
      wall.dataset.state = shape.dataset.state;
      wallGroup.appendChild(wall);
    });
    svg.insertBefore(wallGroup, shapes[0]);
  }

  /* ── Render: map highlight + floating badge ─────────────────── */
  function renderMap() {
    document.querySelectorAll('.st-shape, .st-label').forEach(el => {
      el.classList.toggle('active', el.dataset.state === activeState);
    });
    if (wallGroup) {
      wallGroup.querySelectorAll('[data-state]').forEach(el => {
        el.setAttribute('filter', `url(#${el.dataset.state === activeState ? 'st-wf-teal' : 'st-wf-gray'})`);
      });
      const activeWall = wallGroup.querySelector(`[data-state="${activeState}"]`);
      if (activeWall) wallGroup.appendChild(activeWall);
    }
    const state   = getState(activeState);
    const score   = effectiveScore(state, activeProf);
    const color   = scoreColor(score);
    const titleEl = document.getElementById('st-badge-title');
    const subEl   = document.getElementById('st-badge-sub');
    const dotsEl  = document.getElementById('st-badge-dots');
    if (titleEl) titleEl.textContent = state.name;
    if (subEl)   subEl.textContent   = `${state.tag} · Difficulty ${score}/10`;
    if (dotsEl)  dotsEl.innerHTML    = dotRowHTML('st-badge-dot', score, color);
  }

  window.toggleRacc = function(btn) {
    const isOpen = btn.classList.contains('open');
    const panel  = btn.closest('.st-panel');
    panel.querySelectorAll('.st-racc-btn').forEach(b => {
      b.classList.remove('open');
      b.nextElementSibling.classList.remove('open');
    });
    if (!isOpen) {
      btn.classList.add('open');
      btn.nextElementSibling.classList.add('open');
    }
  };

  function renderAll() {
    renderStateGrid();
    renderProfGrid();
    renderDetail();
    renderMap();
  }

  window.selectState = function (code) {
    activeState = code;
    renderAll();
  };
  window.selectProfession = function (code) {
    activeProf = code;
    renderAll();
  };

  /* Map shapes are clickable — click syncs the tab selector */
  document.querySelectorAll('.st-shape').forEach(el => {
    el.addEventListener('click', () => window.selectState(el.dataset.state));
  });

  initWallLayer();
  renderAll();
})();
