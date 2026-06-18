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
  const area = document.getElementById('market-chart') || document.getElementById('opp-chart-area');
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

/* ═══════════════════════════════════════════════════════
   OPP SECTION — Dashboard interactions
═══════════════════════════════════════════════════════ */
(function() {
  /* ── Data ── */
  var CHART = {
    value: {
      label:'Market Value', unit:'B', prefix:'$', max:10, line:true,
      pts:[{y:'2021',v:2.1,p:false},{y:'2022',v:2.9,p:false},{y:'2023',v:3.5,p:false},
           {y:'2024',v:4.2,p:false},{y:'2026',v:5.9,p:true},{y:'2028',v:7.2,p:true},{y:'2030',v:9.08,p:true}]
    },
    growth: {
      label:'Growth Rate', unit:'%', prefix:'', max:50, line:false,
      pts:[{y:'2022',v:38,p:false},{y:'2023',v:21,p:false},{y:'2024',v:20,p:false},
           {y:'2026',v:19,p:true},{y:'2028',v:22,p:true},{y:'2030',v:26,p:true}]
    },
    opps: {
      label:'Opportunities', unit:'K', prefix:'', max:12, line:false,
      pts:[{y:'2021',v:2,p:false},{y:'2022',v:2.8,p:false},{y:'2023',v:3.5,p:false},
           {y:'2024',v:4.2,p:false},{y:'2026',v:6,p:true},{y:'2028',v:8,p:true},{y:'2030',v:10,p:true}]
    }
  };

  var CARDS = [
    { key:'growing', title:'Growing Industry',
      desc:'The cosmetic injectables market is expanding rapidly, creating more clinics, more roles and increasing opportunities for skilled professionals.',
      why:['More clinics opening across Australia','Increased demand for skilled injectors','More employment and contractor opportunities','Greater business ownership prospects'] },
    { key:'flexible', title:'Flexible Lifestyle',
      desc:'This field uniquely supports professionals who want full control over their schedule, income and working environment.',
      why:['Control your own hours and availability','Work across multiple clinics as a contractor','Part-time or full-time options available','Schedule around life and family commitments'] },
    { key:'impact', title:'Meaningful Impact',
      desc:"You'll make a measurable difference in how patients feel about themselves — combining clinical excellence with genuine patient care.",
      why:['Visible and lasting patient outcomes','Evidence-based clinical practice framework','Builds deep patient trust and loyalty','Rewarding career with real human purpose'] },
    { key:'diverse', title:'Diverse Opportunities',
      desc:'From clinical roles to education, mentoring, training, and clinic ownership — the pathways in this industry are remarkably diverse.',
      why:['Multiple career pathways to choose from','Employed and self-employed model options','Education and leadership opportunities','Metro and regional clinic opportunities'] },
    { key:'business', title:'Business Potential',
      desc:'As a private-pay industry, your income is directly linked to your skill, reputation, and volume — not government rebate schedules.',
      why:['Private pay — not capped by Medicare','Income directly tied to your skill level','Scale with volume and your reputation','Clear pathway to clinic ownership'] },
    { key:'growth', title:'Continuous Growth',
      desc:'Your career does not plateau in this field. From injector to clinic director, educator, or medical director — growth is genuinely continuous.',
      why:['Progress at your own pace and timeline','Advanced training and CPD opportunities','Leadership and mentoring roles available','Industry recognition and influence grows'] }
  ];

  var PROF_MEANS = {
    growing:{ rn:['Growing demand for skilled injectors','More contractor opportunities available','Greater clinic ownership pathways open up','Multiple career progression options'],
               doctor:['Expansion into high-growth private sector','Cosmetic business ownership potential','Educational and leadership pathways','Greater flexibility in practice models'],
               np:['Growing demand for prescribing practitioners','Autonomous practice opportunities expanding','Clinic ownership with full prescribing rights','Industry recognition of NP scope growing'],
               dentist:['Facial aesthetics as a natural extension','Growing patient demand in dental practices','Additional revenue stream within practice','Rapidly growing patient acceptance'] },
    flexible:{ rn:['Part-time and casual clinic work available','Contractor models with multiple clients','Set your own hours and schedule','Scale up or down as lifestyle demands'],
               doctor:['Private cosmetic work on your own schedule','Supplement existing practice income','Full or part-time cosmetic specialisation','Clinic director and leadership opportunities'],
               np:['Autonomous practice with full flexibility','Set your own consultation schedule','No dependence on a prescribing arrangement','Multiple clinic or private practice options'],
               dentist:['Add cosmetic services to existing schedule','Integrate into dental practice gradually','Maintain dental income while diversifying','Flexible cosmetic treatment session scheduling'] },
    impact:{ rn:['Build loyal long-term patient relationships','Visible patient outcomes and confidence boosts','Evidence-based clinical cosmetic practice','A career with real human meaning and reward'],
             doctor:['Advanced clinical aesthetics and leadership','Patient wellbeing and confidence outcomes','Educational impact on other practitioners','Leadership in evidence-based cosmetic care'],
             np:['Full scope autonomous cosmetic practice','Direct patient outcomes without an intermediary','Lead evidence-based aesthetic practice','Mentor and guide other practitioners'],
             dentist:['Holistic facial aesthetic patient outcomes','Natural extension of existing facial expertise','Enhanced patient experience and satisfaction','Evidence-based facial rejuvenation pathways'] },
    diverse:{ rn:['Employed, contracting or ownership pathways','Clinical, educational and mentoring roles','Opportunities across metro and regional areas','Industry events and leadership involvement'],
              doctor:['Own and operate clinics independently','Full prescribing authority gives you an edge','Educator, trainer and mentor pathways','Aesthetic medicine leadership opportunities'],
              np:['Full independent practice pathways available','Prescribing and ownership rights combined','Education and training leadership roles','Industry advisory and leadership positions'],
              dentist:['Cosmetic dentistry practice expansion','Standalone cosmetic clinic ownership','Educational pathways in facial aesthetics','Industry mentoring and training roles'] },
    business:{ rn:['Clinic ownership without self-prescribing','Revenue not tied to Medicare rebate schedules','Build a loyal repeat-client base over time','Scale income with volume and clinical skill'],
               doctor:['Highest income potential in the entire field','Own and prescribe completely independently','Multiple clinic ownership pathways available','Scale to multiple locations and teams'],
               np:['Business ownership with self-prescribing rights','Highest autonomy in nursing-based model','Full clinical governance over your own practice','No ongoing prescriber arrangement fees required'],
               dentist:['Premium service tier within dental practice','Private-pay cosmetic revenue stream','Diversified income beyond dental rebates','Business expansion into the aesthetics sector'] },
    growth:{ rn:['Progressing from injector to senior injector','Contractor and business ownership options','Mentoring and training roles become available','Advanced training in anatomy and techniques'],
             doctor:['Doctor Injector to Clinic Director pathway','Educator and trainer opportunities at scale','Medical director roles widely available','Industry leadership and advisory positions'],
             np:['Independent Practitioner to Clinic Owner','Industry leadership pathways available','Advanced autonomous clinical roles','Educator and mentor opportunities'],
             dentist:['Advanced facial aesthetic specialisation','Clinic expansion beyond dental scope','Educator in facial anatomy and aesthetics','Clinic Director and Business Owner pathways'] }
  };

  var CAREERS = {
    rn:     ['Cosmetic Nurse / Injector','Senior Injector','Contractor','Clinic Owner'],
    doctor: ['Doctor Injector','Advanced Practitioner','Clinic Director','Educator'],
    np:     ['Injector','Independent Practitioner','Clinic Owner','Industry Leader'],
    dentist:['Dentist Injector','Advanced Facial Aesthetics','Business Expansion','Clinic Owner']
  };

  var ICONS = [
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><polyline points="23 6 13.5 15.5 8.5 10.5 1 18"/><polyline points="17 6 23 6 23 12"/></svg>',
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><rect x="3" y="4" width="18" height="18" rx="2"/><line x1="16" y1="2" x2="16" y2="6"/><line x1="8" y1="2" x2="8" y2="6"/><line x1="3" y1="10" x2="21" y2="10"/></svg>',
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M20.84 4.61a5.5 5.5 0 0 0-7.78 0L12 5.67l-1.06-1.06a5.5 5.5 0 0 0-7.78 7.78l1.06 1.06L12 21.23l7.78-7.78 1.06-1.06a5.5 5.5 0 0 0 0-7.78z"/></svg>',
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><circle cx="12" cy="12" r="10"/><line x1="2" y1="12" x2="22" y2="12"/><path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z"/></svg>',
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/><line x1="2" y1="20" x2="22" y2="20"/></svg>',
    '<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8"><path d="M22 2L11 13"/><path d="M22 2L15 22 11 13 2 9l20-7z"/></svg>'
  ];
  var ICO_CLASSES = ['opp-ico-teal','opp-ico-blue','opp-ico-pink','opp-ico-cyan','opp-ico-amber','opp-ico-indigo'];
  var PROF_LABELS = { rn:'Registered Nurses', doctor:'Doctors', np:'Nurse Practitioners', dentist:'Dentists' };

  var activeTab = 'value';
  var activeProf = 'rn';
  var openCard = -1;
  var chartAnimated = false;

  /* ── Chart ── */
  function buildOppChart(tab, animate) {
    var area = document.getElementById('opp-chart-area');
    if (!area) return;
    area.innerHTML = '';
    var cfg = CHART[tab];
    if (!cfg) return;
    if (cfg.line) drawLineChart(area, cfg, animate);
    else drawBarChart(area, cfg, animate);
  }

  function svgEl(tag, attrs) {
    var e = document.createElementNS('http://www.w3.org/2000/svg', tag);
    Object.keys(attrs).forEach(function(k){ e.setAttribute(k, attrs[k]); });
    return e;
  }

  function drawLineChart(area, cfg, animate) {
    var W=740, H=210, pL=48, pR=80, pT=28, pB=36;
    var cW=W-pL-pR, cH=H-pT-pB, maxV=cfg.max;
    var pts = cfg.pts;
    var xS = function(i){ return pL + (i/(pts.length-1))*cW; };
    var yS = function(v){ return pT + cH - (v/maxV)*cH; };
    var svg = svgEl('svg',{viewBox:'0 0 '+W+' '+H});
    svg.style.cssText='width:100%;height:auto;overflow:visible;display:block';

    var defs = svgEl('defs',{});
    var grad = svgEl('linearGradient',{id:'oppFill',x1:'0',y1:'0',x2:'0',y2:'1'});
    [['0%','0.18'],['100%','0.01']].forEach(function(s){
      var stop=svgEl('stop',{offset:s[0],'stop-color':'#0F766E','stop-opacity':s[1]});
      grad.appendChild(stop);
    });
    defs.appendChild(grad);
    var clip=svgEl('clipPath',{id:'oppClip'});
    var clipR=svgEl('rect',{id:'oppClipR',x:pL-4,y:0,width:animate?0:cW+8,height:H});
    clip.appendChild(clipR); defs.appendChild(clip);
    svg.appendChild(defs);

    [0,2,4,6,8,10].forEach(function(v){
      var y=yS(v);
      svg.appendChild(svgEl('line',{x1:pL,x2:W-pR,y1:y,y2:y,
        stroke:v===0?'rgba(15,118,110,.22)':'rgba(0,0,0,.06)',
        'stroke-width':v===0?'1.5':'1','stroke-dasharray':v>0?'4 4':'none'}));
      var t=svgEl('text',{x:pL-7,y:y+4,'text-anchor':'end','font-size':'10','font-family':'Inter,sans-serif',fill:'#94A3B8'});
      t.textContent=v===0?'$0':'$'+v+'B'; svg.appendChild(t);
    });

    var coordPts = pts.map(function(d,i){ return {x:xS(i),y:yS(d.v),d:d}; });
    var pathD = coordPts.map(function(p,i){ return (i===0?'M':'L')+p.x+','+p.y; }).join(' ');
    var splitIdx = pts.findIndex ? pts.findIndex(function(p){ return p.p; }) : 4;

    svg.appendChild(svgEl('path',{
      d:pathD+' L'+coordPts[coordPts.length-1].x+','+yS(0)+' L'+coordPts[0].x+','+yS(0)+' Z',
      fill:'url(#oppFill)','clip-path':'url(#oppClip)'
    }));
    svg.appendChild(svgEl('path',{
      d:coordPts.slice(0,splitIdx).map(function(p,i){ return (i===0?'M':'L')+p.x+','+p.y; }).join(' '),
      fill:'none',stroke:'#0F766E','stroke-width':'2.5','stroke-linecap':'round','stroke-linejoin':'round','clip-path':'url(#oppClip)'
    }));
    svg.appendChild(svgEl('path',{
      d:coordPts.slice(splitIdx-1).map(function(p,i){ return (i===0?'M':'L')+p.x+','+p.y; }).join(' '),
      fill:'none',stroke:'#0F766E','stroke-width':'2.5','stroke-linecap':'round','stroke-linejoin':'round',
      'stroke-dasharray':'7 5',opacity:'0.6','clip-path':'url(#oppClip)'
    }));

    coordPts.forEach(function(p){
      svg.appendChild(svgEl('line',{x1:p.x,x2:p.x,y1:yS(0),y2:yS(0)+4,stroke:'rgba(0,0,0,.1)'}));
      var lb=svgEl('text',{x:p.x,y:yS(0)+16,'text-anchor':'middle','font-size':'10','font-family':'Inter,sans-serif',
        fill:p.d.y==='2030'?'#0F766E':'#94A3B8','font-weight':p.d.y==='2030'?'700':'400'});
      lb.textContent=p.d.y; svg.appendChild(lb);
    });

    coordPts.slice(0,-1).forEach(function(p){
      svg.appendChild(svgEl('circle',{cx:p.x,cy:p.y,r:'3.5',fill:'#fff',stroke:'#0F766E','stroke-width':'2','clip-path':'url(#oppClip)'}));
    });

    var lp=coordPts[coordPts.length-1];
    var sg=svgEl('g',{'clip-path':'url(#oppClip)'});
    ['0s','1s'].forEach(function(b){
      var ring=svgEl('circle',{cx:lp.x,cy:lp.y,r:'7',fill:'none',stroke:'#0F766E','stroke-width':'1.5'});
      var a1=svgEl('animate',{attributeName:'r',from:'7',to:'24',dur:'2s',begin:b,repeatCount:'indefinite'});
      var a2=svgEl('animate',{attributeName:'opacity',from:'0.6',to:'0',dur:'2s',begin:b,repeatCount:'indefinite'});
      ring.appendChild(a1); ring.appendChild(a2); sg.appendChild(ring);
    });
    var core=svgEl('circle',{cx:lp.x,cy:lp.y,r:'5',fill:'#0F766E'});
    sg.appendChild(core); sg.appendChild(svgEl('circle',{cx:lp.x,cy:lp.y,r:'2.5',fill:'#fff'}));
    var vl=svgEl('text',{x:lp.x-12,y:lp.y-14,'text-anchor':'end','font-size':'11','font-weight':'700',
      'font-family':'Inter,sans-serif',fill:'#0F766E'});
    vl.textContent='$9.0B'; svg.appendChild(vl); svg.appendChild(sg);
    area.appendChild(svg);

    // Tooltip hit areas
    var tooltip=document.getElementById('opp-tooltip');
    var chartCard=document.getElementById('opp-chart-card');
    coordPts.forEach(function(p){
      var hit=svgEl('circle',{cx:p.x,cy:p.y,r:'14',fill:'transparent','clip-path':'url(#oppClip)',style:'cursor:pointer'});
      hit.addEventListener('mouseenter',function(){
        if (!tooltip || !chartCard) return;
        var svgRect=svg.getBoundingClientRect();
        var cRect=chartCard.getBoundingClientRect();
        var scale=svgRect.width/W;
        var rx=svgRect.left+p.x*scale-cRect.left;
        var ry=svgRect.top+p.y*scale-cRect.top;
        tooltip.style.left=(rx>cRect.width/2?(rx-160)+'px':(rx+10)+'px');
        tooltip.style.top=(ry-80)+'px';
        tooltip.style.display='block';
        document.getElementById('opp-tt-year').textContent=p.d.y;
        document.getElementById('opp-tt-lbl').textContent='Projected Market Value';
        document.getElementById('opp-tt-val').textContent='$'+p.d.v.toFixed(1)+' Billion';
      });
      hit.addEventListener('mouseleave',function(){ tooltip.style.display='none'; });
      svg.appendChild(hit);
    });

    if (animate) {
      var rect=document.getElementById('oppClipR');
      if (!rect) return;
      var t0=null, dur=1800;
      (function step(ts){
        if (!t0) t0=ts;
        var raw=Math.min((ts-t0)/dur,1);
        var ease=raw<0.5?2*raw*raw:1-Math.pow(-2*raw+2,2)/2;
        rect.setAttribute('width',String(ease*(cW+8)));
        if (raw<1) requestAnimationFrame(step);
      })(performance.now());
    }
  }

  function drawBarChart(area, cfg, animate) {
    var W=680, H=210, pL=48, pR=32, pT=22, pB=36;
    var cW=W-pL-pR, cH=H-pT-pB;
    var pts=cfg.pts, maxV=cfg.max;
    var bW=Math.floor(cW/pts.length*0.55);
    var gap=(cW-bW*pts.length)/(pts.length);
    var xC=function(i){ return pL+gap/2+i*(bW+gap)+bW/2; };
    var yS=function(v){ return pT+cH-(v/maxV)*cH; };
    var svg=svgEl('svg',{viewBox:'0 0 '+W+' '+H});
    svg.style.cssText='width:100%;height:auto;overflow:visible;display:block';

    var defs=svgEl('defs',{});
    var grad=svgEl('linearGradient',{id:'oppBarGrad',x1:'0',y1:'0',x2:'0',y2:'1'});
    var s1=svgEl('stop',{offset:'0%','stop-color':'#14B8A6','stop-opacity':'1'});
    var s2=svgEl('stop',{offset:'100%','stop-color':'#0F766E','stop-opacity':'1'});
    grad.appendChild(s1); grad.appendChild(s2); defs.appendChild(grad);
    svg.appendChild(defs);

    [0,Math.round(maxV*0.25),Math.round(maxV*0.5),Math.round(maxV*0.75),maxV].forEach(function(v){
      var y=yS(v);
      svg.appendChild(svgEl('line',{x1:pL,x2:W-pR,y1:y,y2:y,stroke:'rgba(0,0,0,.06)','stroke-width':'1','stroke-dasharray':'4 4'}));
      var t=svgEl('text',{x:pL-7,y:y+4,'text-anchor':'end','font-size':'10','font-family':'Inter,sans-serif',fill:'#94A3B8'});
      t.textContent=cfg.prefix+v+cfg.unit; svg.appendChild(t);
    });

    pts.forEach(function(d,i){
      var bH=((d.v/maxV)*cH);
      var x=xC(i)-bW/2;
      var yr=yS(0);
      var bar=svgEl('rect',{
        x:x,y:animate?yr:yr-bH,width:bW,height:animate?0:bH,
        fill:d.p?'rgba(15,118,110,.25)':'url(#oppBarGrad)',rx:'4',
        style:'transition:height .5s cubic-bezier(.4,0,.2,1) '+(i*0.06)+'s,y .5s cubic-bezier(.4,0,.2,1) '+(i*0.06)+'s'
      });
      if (d.p) bar.setAttribute('stroke','rgba(15,118,110,.4)'), bar.setAttribute('stroke-width','1');
      svg.appendChild(bar);
      var vt=svgEl('text',{x:xC(i),y:animate?yr-4:yr-bH-4,'text-anchor':'middle','font-size':'10','font-weight':'700',
        'font-family':'Inter,sans-serif',fill:d.p?'#94A3B8':'#0F766E',
        style:'transition:y .5s cubic-bezier(.4,0,.2,1) '+(i*0.06)+'s'});
      vt.textContent=cfg.prefix+d.v+cfg.unit;
      svg.appendChild(vt);
      if (animate) {
        setTimeout(function(bar,vt,bH,yr){ bar.setAttribute('height',bH); bar.setAttribute('y',yr-bH); vt.setAttribute('y',yr-bH-4); }, 80, bar, vt, bH, yr);
      }
      svg.appendChild(svgEl('line',{x1:xC(i),x2:xC(i),y1:yr,y2:yr+4,stroke:'rgba(0,0,0,.1)'}));
      var lb=svgEl('text',{x:xC(i),y:yr+16,'text-anchor':'middle','font-size':'10','font-family':'Inter,sans-serif',fill:'#94A3B8'});
      lb.textContent=d.y; svg.appendChild(lb);
    });
    area.appendChild(svg);
  }

  /* ── Tabs ── */
  function initTabs() {
    var tabs=document.querySelectorAll('#opp-chart-tabs .opp-tab');
    tabs.forEach(function(btn){
      btn.addEventListener('click',function(){
        tabs.forEach(function(b){ b.classList.remove('active'); });
        btn.classList.add('active');
        activeTab=btn.dataset.tab;
        buildOppChart(activeTab, true);
      });
    });
  }

  /* ── Count-up ── */
  function initCountUp() {
    var els=document.querySelectorAll('.opp-m-val[data-target]');
    if (!els.length) return;
    var obs=new IntersectionObserver(function(entries){
      entries.forEach(function(entry){
        if (!entry.isIntersecting) return;
        var el=entry.target;
        var target=parseFloat(el.dataset.target);
        var prefix=el.dataset.prefix||'';
        var suffix=el.dataset.suffix||'';
        var isDecimal=target!==Math.floor(target);
        var duration=1200;
        var t0=null;
        (function step(ts){
          if (!t0) t0=ts;
          var prog=Math.min((ts-t0)/duration,1);
          var ease=1-Math.pow(1-prog,3);
          var val=target*ease;
          el.textContent=prefix+(isDecimal?val.toFixed(1):Math.round(val))+suffix;
          if (prog<1) requestAnimationFrame(step);
        })(performance.now());
        obs.unobserve(el);
      });
    },{threshold:0.5});
    els.forEach(function(el){ obs.observe(el); });
  }

  /* ── Chart on scroll ── */
  function initChartObserver() {
    var area=document.getElementById('opp-chart-area');
    if (!area) return;
    var obs=new IntersectionObserver(function(entries){
      if (!entries[0].isIntersecting||chartAnimated) return;
      chartAnimated=true;
      buildOppChart(activeTab, true);
    },{threshold:0.3});
    obs.observe(area);
  }

  /* ── Profession filter ── */
  function initChips() {
    var chips=document.querySelectorAll('#opp-chips .opp-chip');
    chips.forEach(function(chip){
      chip.addEventListener('click',function(){
        chips.forEach(function(c){ c.classList.remove('active'); });
        chip.classList.add('active');
        activeProf=chip.dataset.prof;
        if (openCard>=0) renderPanel(openCard);
      });
    });
  }

  /* ── Cards + Panel ── */
  window.oppToggleCard = function(idx) {
    var cards=document.querySelectorAll('.opp-card');
    var panel=document.getElementById('opp-panel');
    if (openCard===idx) {
      oppClosePanel();
      return;
    }
    cards.forEach(function(c){ c.classList.remove('active'); });
    cards[idx].classList.add('active');
    openCard=idx;
    renderPanel(idx);
    if (panel.style.maxHeight==='0px'||!panel.style.maxHeight) {
      panel.style.maxHeight=document.getElementById('opp-panel-wrap').scrollHeight+'px';
    }
    setTimeout(function(){
      panel.style.maxHeight=document.getElementById('opp-panel-wrap').scrollHeight+'px';
      panel.scrollIntoView({behavior:'smooth',block:'nearest'});
    },50);
  };

  window.oppClosePanel = function() {
    var panel=document.getElementById('opp-panel');
    if (panel) panel.style.maxHeight='0px';
    document.querySelectorAll('.opp-card').forEach(function(c){ c.classList.remove('active'); });
    openCard=-1;
  };

  function renderPanel(idx) {
    var card=CARDS[idx];
    var prof=activeProf;

    // Icon
    var icoEl=document.getElementById('opp-pi-ico');
    icoEl.className='opp-pi-ico '+ICO_CLASSES[idx];
    icoEl.innerHTML=ICONS[idx];

    document.getElementById('opp-pi-title').textContent=card.title;
    document.getElementById('opp-pi-sub').textContent='Impact for '+PROF_LABELS[prof];
    document.getElementById('opp-pi-desc').textContent=card.desc;

    // Why This Matters (static)
    var whyEl=document.getElementById('opp-why-list');
    whyEl.innerHTML=card.why.map(function(t){ return '<li>'+t+'</li>'; }).join('');

    // What This Means For You (dynamic)
    var youEl=document.getElementById('opp-you-list');
    var means=PROF_MEANS[card.key][prof];
    youEl.innerHTML=means.map(function(t){ return '<li>'+t+'</li>'; }).join('');

    // Career path
    var cpEl=document.getElementById('opp-career-path');
    var steps=CAREERS[prof];
    cpEl.innerHTML=steps.map(function(s,i){
      return '<div class="opp-cp-step"><div class="opp-cp-num">'+(i+1)+'</div><span class="opp-cp-label">'+s+'</span></div>'+(i<steps.length-1?'<div class="opp-cp-arrow">↓</div>':'');
    }).join('');

  }

  /* ── Init ── */
  initTabs();
  initChips();
  initCountUp();
  initChartObserver();
}());

/* ═══════════════════════════════════════════════════════
   CHAT WIDGET
═══════════════════════════════════════════════════════ */
(function() {
  var cwOpen = false;
  var cwFirstOpen = true;
  var cwTypingEl = null;

  /* ── Knowledge base ── */
  var RULES = [
    { rx:/^(hi|hello|hey|howdy|hiya|good\s+(morning|afternoon|evening))\b/i,
      r:"Hi there! 👋 I'm IAHPA's virtual assistant. I can help you explore careers in cosmetic injectables, training pathways, clinic setup, and more.\n\nWhat can I help you with today?",
      chips:['Career pathways','Training & courses','How to get started','Market opportunity'] },

    { rx:/\biahpa\b|who are you|about iahpa|what is this|what do you (do|offer)/i,
      r:"IAHPA — the **Institute of Aesthetic and Healthcare Professionals Australia** — is a leading education and support hub for healthcare professionals entering the cosmetic injectables industry.\n\nWe provide:\n• Career guidance and training pathways\n• Job placement and mentoring support\n• Clinic launch resources\n• Ongoing CPD and professional development\n\nOur mission: helping qualified healthcare professionals transition into this rapidly growing field safely and confidently.",
      chips:['Training & courses','Career pathways','Contact IAHPA'] },

    { rx:/\b(career|pathway|profession|which profession|job|role|options|qualify|suited)\b/i,
      r:"IAHPA supports four professional groups entering cosmetic injectables:\n\n**Registered Nurses (RN)**\nMost common entry. Work under or alongside a prescriber.\n\n**Nurse Practitioners (NP)**\nIndependent prescribing rights — highest nursing autonomy.\n\n**Doctors (GP/Specialist)**\nFull prescribing authority, highest earning potential.\n\n**Dentists**\nNatural fit — existing facial anatomy expertise.\n\nWhich best describes you?",
      chips:["I'm an RN","I'm a Doctor","I'm an NP","I'm a Dentist"] },

    { rx:/\brn\b|registered nurse/i,
      r:"As a **Registered Nurse**, you're one of the most common entrants into cosmetic injectables — and for good reason.\n\n✅ Already trained in anatomy, pharmacology, and patient care\n✅ Work as a cosmetic injector under a prescriber arrangement\n✅ **Career path:** Injector → Senior Injector → Contractor → Clinic Owner\n\n**Key requirements:**\n• Current AHPRA registration\n• Cosmetic injectable training (theory + practical)\n• Prescriber arrangement in place\n• Professional indemnity insurance\n\nReady to take the next step?",
      chips:['Training requirements','Prescriber arrangement','Get Job Guidance','Request a callback'] },

    { rx:/\bdoctor\b|\bgp\b|physician|medical doctor|mbbs|\bmd\b/i,
      r:"As a **Doctor**, you have the highest level of autonomy in this field.\n\n✅ Full independent prescribing authority\n✅ Can own and operate a clinic completely independently\n✅ Highest income potential in cosmetic injectables\n✅ **Career path:** Doctor Injector → Clinic Director → Educator\n\n**Key requirements:**\n• Current AHPRA registration\n• Cosmetic injectable training\n• Professional indemnity and business insurance\n• TGA-compliant advertising\n\nWant to explore training or clinic setup?",
      chips:['Training requirements','Clinic setup','Income potential','Request a callback'] },

    { rx:/\bnp\b|nurse practitioner|advanced practice nurse/i,
      r:"As a **Nurse Practitioner**, you hold the most autonomous nursing-based position in Australia.\n\n✅ Independent prescribing rights — no arrangement needed\n✅ Can own and operate your own clinic\n✅ Full clinical governance over your practice\n✅ **Career path:** Independent Practitioner → Clinic Owner → Industry Leader\n\n**Key requirements:**\n• Current AHPRA registration (NP endorsement)\n• Cosmetic injectable training\n• Premises registration\n• Professional indemnity insurance",
      chips:['Training requirements','Clinic setup','Get Job Guidance','Request a callback'] },

    { rx:/dentist|dental|oral/i,
      r:"As a **Dentist**, cosmetic injectables are a natural extension of your facial anatomy expertise.\n\n✅ Deep facial anatomy knowledge already in place\n✅ Integrate cosmetic treatments into your existing practice\n✅ Add a private-pay revenue stream\n✅ **Career path:** Dentist Injector → Advanced Facial Aesthetics → Clinic Owner\n\n**Key requirements:**\n• Current AHPRA registration\n• Cosmetic injectable training\n• Review of premises approval\n• TGA advertising compliance",
      chips:['Training requirements','Adding to my practice','Clinic setup','Request a callback'] },

    { rx:/train|course|study|learn|certif|qualif|education|module|theory|practical|workshop/i,
      r:"To practise cosmetic injectables in Australia you'll need specialised training covering:\n\n📚 **Theory**\n• Facial anatomy (in depth)\n• Pharmacology of neurotoxins and dermal fillers\n• Patient assessment and consent\n• Complication recognition and management\n\n💉 **Practical**\n• Supervised injection techniques\n• Botulinum toxin (anti-wrinkle)\n• Dermal filler placement\n• Emergency protocols (hyaluronidase administration)\n\nTraining requirements vary by profession. IAHPA can guide you to the right pathway for your background.",
      chips:['Request a callback','Career pathways','Prescriber requirements'] },

    { rx:/prescri|schedule 4|\bs4\b|tga|toxin|botox|filler|administer/i,
      r:"Cosmetic injectables (botulinum toxin, dermal fillers) are **Schedule 4 medicines** in Australia — they require a valid prescription.\n\n**Who can prescribe:**\n• ✅ Doctors — independently\n• ✅ Nurse Practitioners — independently, within scope\n• ✅ Dentists — within facial scope\n• ❌ Registered Nurses — require a prescriber arrangement\n\nFor **RNs**, a prescribing arrangement with an AHPRA-registered medical practitioner must be in place before administering any injectables.",
      chips:["RN prescriber options","Clinic setup","I'm an NP",'Request a callback'] },

    { rx:/clinic|open a|setup|start a business|own|ownership|launch|premises|facility/i,
      r:"Launching your own cosmetic clinic involves **6 key steps**:\n\n1️⃣ **Understand your pathway** — Your profession determines your model\n2️⃣ **Establish your prescriber model** — Prescribe independently or via arrangement\n3️⃣ **Facility and compliance** — Premises registration, equipment, sterilisation\n4️⃣ **Insurance and legal** — Professional indemnity + public liability\n5️⃣ **Advertising compliance** — TGA and state regulations\n6️⃣ **Ongoing CPD** — Stay current with industry standards\n\nOur **Clinic Launch Planner** on the website walks through each step in detail.",
      chips:['Prescriber arrangement','Insurance requirements','TGA advertising','Request a callback'] },

    { rx:/insur|indemnity|liability|cover|policy/i,
      r:"Insurance is non-negotiable for any cosmetic injectable practitioner:\n\n🛡️ **Professional Indemnity Insurance**\nCovers claims relating to your clinical practice and patient outcomes.\n\n🏢 **Public Liability Insurance**\nCovers third-party injury or property damage at your clinic.\n\nIf operating as a business owner, also consider:\n• Business interruption cover\n• Employer's liability (if employing staff)\n\n⚠️ Always confirm your policy specifically covers Schedule 4 cosmetic procedures — general nursing indemnity may not be sufficient.",
      chips:['Clinic setup','Legal requirements','Request a callback'] },

    { rx:/advertis|social media|instagram|facebook|promot|before and after|testimonial/i,
      r:"Advertising cosmetic procedures in Australia is strictly regulated by the **TGA** and state health regulators.\n\n⚠️ **Key rules:**\n• Cannot advertise Schedule 4 medicines (botulinum toxin, fillers) directly to the public\n• Before-and-after photos require careful compliance steps\n• Testimonials promoting S4 medicines are prohibited\n• QLD and NSW have additional state-specific clinic regulations\n\n✅ **What you can do:**\n• Promote your clinic's services (not specific medicines)\n• Share educational content in compliant ways\n• Use TGA-compliant messaging frameworks\n\nThis is Step 5 of our Clinic Launch Planner.",
      chips:['Clinic setup steps','Request a callback'] },

    { rx:/cpd|continuing|professional development|ongoing|upskill|advanced training/i,
      r:"**Ongoing CPD** is essential in cosmetic injectables — this is a rapidly evolving field.\n\n**What ongoing CPD covers:**\n• New product and technique training\n• Advanced anatomy workshops\n• Complication management updates\n• Business and regulatory changes\n\nAs an IAHPA member, you'll have access to ongoing education resources, webinars, and industry events to keep your skills current.\n\nStep 6 of our Clinic Launch Planner is dedicated to CPD requirements for your profession.",
      chips:['Clinic setup steps','Training requirements','Request a callback'] },

    { rx:/income|salary|earn|pay|money|revenue|wage|how much|profit|lucrative/i,
      r:"Cosmetic injectables is a **private-pay industry** — income is not capped by Medicare rebate schedules.\n\n💰 **Typical AU earning ranges:**\n• Employed RN injector: $80K–$130K+\n• Contractor (RN/NP): $100K–$200K+ (volume-dependent)\n• Doctor injector: $150K–$350K+\n• Clinic owner: Uncapped — scales with volume and reputation\n\nAs you build your client base and reputation, your income grows accordingly. Many clinic owners across Australia generate substantial returns.",
      chips:['Career pathways','Clinic ownership','Get Job Guidance','Request a callback'] },

    { rx:/market|industry|growth|demand|future|outlook|billion|growing|opportunity|statistic/i,
      r:"The Australian cosmetic injectables market is one of the fastest-growing healthcare sectors:\n\n📊 **Key figures (2021–2030):**\n• **19.3% CAGR** — Annual growth rate\n• **$9 Billion** — Projected market value by 2030\n• **10,000+** — Emerging career opportunities\n• Market set to **nearly quadruple** from its 2021 baseline\n\n🚀 **Drivers:**\n• Rising social acceptance of cosmetic treatments\n• Ageing population seeking non-surgical options\n• More clinics opening metro and regional areas\n• Expanding range of injectable treatments available",
      chips:['Career pathways','Income potential','Get started now','Request a callback'] },

    { rx:/\bahpra\b|register|registration|licence|license/i,
      r:"All practitioners in cosmetic injectables must hold current **AHPRA registration** in their profession:\n\n• **RN / NP** → Nursing and Midwifery Board of Australia (NMBA)\n• **Doctor** → Medical Board of Australia\n• **Dentist** → Dental Board of Australia\n\nYour AHPRA registration must be current and in good standing before commencing any cosmetic injectable practice. Registration type directly affects your prescribing rights and available business models.",
      chips:['Prescriber requirements','Career pathways','Request a callback'] },

    { rx:/get started|first step|how do i start|begin|where do i start|new to|starting out|entry/i,
      r:"Here's how most practitioners get started:\n\n**Step 1 — Confirm your pathway**\nYour profession (RN, NP, Doctor, Dentist) determines your options.\n\n**Step 2 — Complete training**\nTheory + practical training specific to cosmetic injectables.\n\n**Step 3 — Secure your prescriber model**\nIndependent (NP/Doctor) or via arrangement (RN).\n\n**Step 4 — Get insured**\nProfessional indemnity + public liability.\n\n**Step 5 — Find a position or launch a clinic**\nEmployed, contractor, or your own practice.\n\nOur **Get Job Guidance** tool gives you a personalised pathway based on your profession, state, and goals.",
      chips:['Use Get Job Guidance','Training requirements','Career pathways','Request a callback'] },

    { rx:/experience|years|background|need experience|how long|new grad|fresh|entry level/i,
      r:"Experience requirements depend on your profession:\n\n**RN:** Most providers recommend at least 1–2 years of clinical experience — solid anatomy and cannulation skills are a real advantage.\n\n**Doctor / NP:** Your clinical specialty background is your foundation. Additional cosmetic injectable training builds on this.\n\n**Dentist:** Your existing facial anatomy knowledge is a head start — dedicated training bridges the gap.\n\nYou don't need prior cosmetic medicine experience — that's exactly what IAHPA's training and guidance is designed for.",
      chips:['Training requirements','Career pathways','Get Job Guidance','Request a callback'] },

    { rx:/flexible|part.?time|casual|work.*life|lifestyle|freedom|schedule|balance/i,
      r:"One of the most appealing aspects of cosmetic injectables is **flexibility**:\n\n⏰ **Work on your terms:**\n• Part-time or full-time options\n• Contractor across multiple clinics\n• Set your own consultation schedule\n• Scale up or down as your lifestyle demands\n\nMany practitioners supplement their existing healthcare role with cosmetic work before transitioning fully. Others build thriving full-time practices from scratch.",
      chips:['Career pathways','Income potential','Clinic ownership','Request a callback'] },

    { rx:/location|australia|which state|qld|queensland|nsw|vic|wa|sa|tas|nt|act|sydney|melbourne|brisbane|perth/i,
      r:"IAHPA supports practitioners across **all Australian states and territories**:\n\n• Queensland (QLD)\n• New South Wales (NSW)\n• Victoria (VIC)\n• Western Australia (WA)\n• South Australia (SA)\n• Tasmania (TAS)\n• ACT and Northern Territory\n\nRegulations can vary by state — for example, QLD and NSW have specific clinic registration requirements. We can guide you on requirements specific to your location.",
      chips:['Clinic setup','Advertising compliance','Request a callback'] },

    { rx:/cost|fee|price|how much does|afford|invest|expense/i,
      r:"Entry costs vary by your pathway:\n\n**Training:** Theory + practical workshops — typically a few thousand dollars, varying by provider and depth of training.\n\n**Clinic setup (if opening your own):**\n• Equipment and consumables\n• Premises registration and compliance\n• Insurance premiums\n• Initial stock and marketing\n\nFor specific course fees and investment requirements, our team can provide a tailored breakdown based on your situation.",
      chips:['Request a callback','Training requirements','Clinic setup'] },

    { rx:/job guid|placement|find a job|find work|employment|hired|position/i,
      r:"Our **Get Job Guidance** tool is built specifically for healthcare professionals entering cosmetic injectables:\n\n**Step 1 — Career Assessment**\nYour profession, state, experience, and career goal.\n\n**Step 2 — Personalised Results**\nTailored insights, readiness score, and recommended next steps.\n\n**Step 3 — Connections**\nMatch with doctors/clinics, or speak directly with our team.\n\nFind this tool in the **Registered Nurse** section — or click below to open it now.",
      chips:['Use Get Job Guidance','Request a callback','Career pathways'] },

    { rx:/contact|reach|speak|talk|ring|call|email|phone|enquir|support|team/i,
      r:"You can reach the IAHPA team through the **Contact section** at the bottom of the page. We're happy to discuss:\n\n• Course options and enrolments\n• Career guidance tailored to your background\n• Clinic launch support\n• Any questions about entering the field\n\nOr request a callback below and we'll reach out at a time that suits you.",
      chips:['Request a callback','Go to Contact section'] },

    { rx:/thank|thanks|cheers|appreciate|helpful|great|perfect|awesome|amazing/i,
      r:"You're welcome! 😊 Feel free to ask anything else — career pathways, training, clinic setup, income — I'm here to help. Our team is also available if you'd like to speak to someone directly.",
      chips:['Ask another question','Request a callback','Contact IAHPA'] }
  ];

  var FALLBACK_R = "That's a great question — I may not have the full detail on that right now, but our IAHPA team definitely can help. Would you like to request a callback or explore more topics below?";
  var FALLBACK_CHIPS = ['Career pathways','Training & courses','Clinic setup','Request a callback'];

  /* ── Special chip actions ── */
  var ACTIONS = {
    'Request a callback': function() {
      cwBotReply("To request a callback, head to our **Contact section** below 👇 Fill in your details and our team will reach out within 1 business day.", ['Go to Contact section']);
    },
    'Go to Contact section': function() {
      cwBotReply("Taking you to our contact section now…", []);
      setTimeout(function() {
        var el = document.getElementById('contact');
        if (el) { el.scrollIntoView({behavior:'smooth'}); cwToggle(); }
        else window.location.href='#contact';
      }, 700);
    },
    'Use Get Job Guidance': function() {
      cwBotReply("Opening the Get Job Guidance tool for you…", []);
      setTimeout(function() {
        if (typeof openGgModal === 'function') openGgModal();
        cwToggle();
      }, 700);
    },
    'Contact IAHPA': function() {
      ACTIONS['Go to Contact section']();
    }
  };

  /* ── DOM helpers ── */
  function cwFormat(t) {
    return t.replace(/\*\*(.*?)\*\*/g,'<strong>$1</strong>').replace(/\n/g,'<br>');
  }
  function cwMsgs() { return document.getElementById('cw-msgs'); }
  function cwScrollBottom() {
    var m=cwMsgs(); if(m) setTimeout(function(){ m.scrollTop=m.scrollHeight; },50);
  }

  /* ── Add user message ── */
  function cwAddUser(text) {
    var m=cwMsgs(); if(!m) return;
    var g=document.createElement('div'); g.className='cw-grp user';
    var row=document.createElement('div'); row.className='cw-row';
    var b=document.createElement('div'); b.className='cw-bbl';
    b.textContent=text; row.appendChild(b); g.appendChild(row);
    m.appendChild(g); cwScrollBottom();
  }

  /* ── Show typing indicator ── */
  function cwShowTyping() {
    var m=cwMsgs(); if(!m||cwTypingEl) return;
    var d=document.createElement('div'); d.className='cw-typing';
    d.innerHTML='<div class="cw-av">AI</div><div class="cw-dots"><span></span><span></span><span></span></div>';
    cwTypingEl=d; m.appendChild(d); cwScrollBottom();
  }
  function cwHideTyping() {
    if(cwTypingEl&&cwTypingEl.parentNode) cwTypingEl.parentNode.removeChild(cwTypingEl);
    cwTypingEl=null;
  }

  /* ── Add bot message ── */
  function cwAddBot(text, chips) {
    var m=cwMsgs(); if(!m) return;
    var g=document.createElement('div'); g.className='cw-grp bot';
    var row=document.createElement('div'); row.className='cw-row';
    var av=document.createElement('div'); av.className='cw-av'; av.textContent='AI';
    var b=document.createElement('div'); b.className='cw-bbl'; b.innerHTML=cwFormat(text);
    row.appendChild(av); row.appendChild(b); g.appendChild(row);
    if(chips&&chips.length) {
      var wrap=document.createElement('div'); wrap.className='cw-chips';
      chips.forEach(function(c) {
        var btn=document.createElement('button'); btn.className='cw-chip';
        if(ACTIONS[c]) btn.classList.add('cw-action-chip');
        btn.textContent=c;
        btn.onclick=function(){ cwChipClick(c, btn.closest('.cw-chips')); };
        wrap.appendChild(btn);
      });
      g.appendChild(wrap);
    }
    m.appendChild(g); cwScrollBottom();
  }

  /* ── Chip click: disable the chip row then process ── */
  function cwChipClick(label, chipsEl) {
    if(chipsEl) chipsEl.querySelectorAll('.cw-chip').forEach(function(b){ b.disabled=true; b.style.opacity='.5'; });
    if(ACTIONS[label]) {
      ACTIONS[label]();
    } else {
      cwAddUser(label);
      cwProcessQuery(label);
    }
  }

  /* ── Bot reply with typing delay ── */
  function cwBotReply(text, chips) {
    cwShowTyping();
    var delay = Math.min(600 + text.length * 2, 1400);
    setTimeout(function() {
      cwHideTyping();
      cwAddBot(text, chips);
    }, delay);
  }

  /* ── Match against rules ── */
  function cwMatch(q) {
    for(var i=0;i<RULES.length;i++) {
      if(RULES[i].rx.test(q)) return RULES[i];
    }
    return null;
  }

  /* ── Process query ── */
  function cwProcessQuery(q) {
    var rule = cwMatch(q);
    if(rule) cwBotReply(rule.r, rule.chips);
    else cwBotReply(FALLBACK_R, FALLBACK_CHIPS);
  }

  /* ── Send from input ── */
  window.cwSend = function() {
    var inp=document.getElementById('cw-input');
    if(!inp) return;
    var v=inp.value.trim(); if(!v) return;
    inp.value='';
    cwAddUser(v);
    cwProcessQuery(v);
  };

  window.cwKey = function(e) {
    if(e.key==='Enter'||e.keyCode===13) cwSend();
  };

  /* ── Toggle open/close ── */
  window.cwToggle = function() {
    cwOpen=!cwOpen;
    document.getElementById('cw').classList.toggle('open',cwOpen);
    document.getElementById('cw-panel').setAttribute('aria-hidden',String(!cwOpen));
    document.getElementById('cw-badge').classList.add('hidden');
    if(cwOpen) {
      if(cwFirstOpen) {
        cwFirstOpen=false;
        setTimeout(function(){
          cwShowTyping();
          setTimeout(function(){
            cwHideTyping();
            cwAddBot("Hi there! 👋 I'm IAHPA's virtual assistant.\n\nI can help you explore careers in cosmetic injectables, training requirements, clinic setup, income potential, and more. What would you like to know?",
              ['Career pathways','Training & courses','How to get started','Market opportunity']);
          }, 900);
        }, 300);
      }
      setTimeout(function(){ var i=document.getElementById('cw-input'); if(i) i.focus(); },300);
    }
  };
}());

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

  let activeState  = STATES[0].code;
  let activeProf   = PROFESSIONS[0].code;
  let wallGroup    = null;
  let capCardData  = [];

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
      const bgLight = m.bg.replace(',.18)', ',.05)');
      const activeSt = active
        ? `border-color:${m.color};background:linear-gradient(150deg,${m.bg} 0%,${bgLight} 100%);box-shadow:0 4px 16px ${m.bg},inset 0 1px 0 rgba(255,255,255,.7);`
        : '';
      const riskLbl = score >= 8 ? 'Very High' : score >= 6 ? 'High' : score >= 4 ? 'Moderate' : 'Lower';
      return `
        <button class="st-tab${active ? ' active' : ''}" data-state="${s.code}"
          onclick="selectState('${s.code}')"
          style="${activeSt}">
          <div class="st-tab-icon" style="background:${m.bg};color:${m.color}">${m.icon}</div>
          <span class="st-tab-abbr">${s.code}</span>
          <span class="st-tab-name">${s.name}</span>
          <span class="st-tab-tag">${s.tag}</span>
          <div class="st-tab-score-row">
            <span class="st-tab-risk-lbl">Risk</span>
            <span class="st-tab-score" style="color:${color}">${score}/10</span>
          </div>
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

  /* ── Render: capability card grid ──────────────────────── */
  function renderDetail() {
    const wrap = document.getElementById('st-detail');
    if (!wrap) return;
    const state = getState(activeState);
    const prof  = PROFESSIONS.find(p => p.code === activeProf);
    const base  = PROF_BASE[activeProf];
    const score = effectiveScore(state, activeProf);
    const color = scoreColor(score);

    const ownVal  = base.own === 'state' ? 'limited' : base.own;
    const ownNote = base.own === 'state' ? state.ownNote
      : base.own === 'yes' ? 'Standard business ownership rules apply — no profession-specific restrictions.'
      : 'Independent practice ownership is not a recognised model for this profession.';

    const accMap = {};
    state.accordion.forEach(([t, b]) => { accMap[t] = b; });

    const arrowSVG = `<svg width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M5 12h14M12 5l7 7-7 7"/></svg>`;

    const ICONS = {
      prescribe:  `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/><path d="m9 12 2 2 4-4"/></svg>`,
      inject:     `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m18 2 4 4-14 14H4v-4L18 2Z"/><path d="m8 8 4 4"/><path d="m14 2 4 4"/></svg>`,
      clinic:     `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="9" width="18" height="13" rx="2"/><path d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2"/><path d="M9 22v-6h6v6"/></svg>`,
      store:      `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
      buy:        `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>`,
      prescriber: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>`,
      dispense:   `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>`,
      difficulty: `<svg width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/><circle cx="12" cy="12" r="4"/></svg>`,
    };

    capCardData = [
      { title:'Can Prescribe?',           iconKey:'prescribe',  iconColor:'#7C3AED', iconBg:'rgba(124,58,237,.12)', val:base.prescribe,       detailKey:'Prescribing Rules',            note: base.prescribe==='no'?'Only doctors and nurse practitioners are authorised prescribers in Australia.':base.prescribe==='yes'?'This profession holds prescribing authority and can issue patient-specific prescriptions.':'Limited prescribing rights apply — consult state health department guidance.',      profNote: base.prescribe==='no'?`As a ${prof.label}, you cannot prescribe. A valid prescription from an authorised doctor or NP is required before you may administer any treatment.`:base.prescribe==='yes'?`As a ${prof.label}, you hold prescribing authority under AHPRA and may prescribe S4 cosmetic injectables directly.`:'' },
      { title:'Can Inject?',              iconKey:'inject',     iconColor:'#059669', iconBg:'rgba(5,150,105,.12)',  val:base.inject,           detailKey:'Prescribing Rules',            note: base.inject==='yes'?'You may administer S4 cosmetic injectables once a valid prescription has been issued.':base.inject==='no'?'Injecting S4 cosmetic medicines is not within scope for this profession.':'Enrolled Nurses may inject only under direct in-person supervision of an RN or doctor.',          profNote: base.inject==='limited'?'ENs must be directly supervised by a registered nurse or medical officer for every injection — independent injection is not permitted.':base.inject==='yes'?'A valid patient-specific prescription must be in place before any injectable is administered. Verbal or standing orders are not accepted.':'' },
      { title:'Can Own a Clinic?',        iconKey:'clinic',     iconColor:'#F59E0B', iconBg:'rgba(245,158,11,.12)', val:ownVal,                detailKey:'Clinic Ownership Models',      note: ownNote,                                                                                                                                                                                                                            profNote: base.own==='state'?`In ${state.name}: ${state.ownNote}`:''},
      { title:'Can Store S4 Medicines?',  iconKey:'store',      iconColor:'#DC2626', iconBg:'rgba(220,38,38,.12)',  val:base.storeBuy,         detailKey:'Medicine Custody Requirements', note: base.storeBuy==='no'?'S4 medicine custody must remain exclusively with the prescribing doctor or NP at all times.':'Strict custody and control obligations apply under the national Poisons Standard.',         profNote: base.storeBuy==='no'?'Purchasing, storing or holding S4 stock — even temporarily — constitutes unlawful possession if you are not an authorised person under the relevant Poisons Act.':'' },
      { title:'Can Buy S4 Medicines?',    iconKey:'buy',        iconColor:'#4F46E5', iconBg:'rgba(79,70,229,.12)',  val:base.storeBuy,         detailKey:'Medicine Custody Requirements', note: base.storeBuy==='no'?'Purchasing or pre-ordering S4 stock on behalf of a clinic constitutes unlawful possession.':'You may purchase S4 medicines subject to applicable regulatory controls.',               profNote: base.storeBuy==='no'?'Even reimbursing a prescriber for medicines already purchased does not transfer lawful ownership. The authorised prescriber must remain the buyer at all times.':'' },
      { title:'Prescriber Required?',     iconKey:'prescriber', iconColor:'#2563EB', iconBg:'rgba(37,99,235,.12)',  val:base.prescriberReq,   detailKey:'Prescribing Rules',            note: base.prescriberReq==='yes'?'A valid patient-specific prescription is required before every treatment.':'This profession holds prescribing rights — no external prescriber is needed.',                          profNote: base.prescriberReq==='yes'?'Prescriptions must be patient-specific. Blanket or standing orders are not accepted — the prescriber must consult the patient and document clinical appropriateness before issuing each prescription.':'' },
      { title:'Can Dispense to Patients?',iconKey:'dispense',   iconColor:'#D97706', iconBg:'rgba(217,119,6,.12)',  val:base.dispense,         detailKey:'Medicine Custody Requirements', note: base.dispense==='no'?'Supplying labelled medicine directly to patients is not authorised for this profession.':base.dispense==='yes'?'You may dispense medicines subject to applicable licensing requirements.':'Limited dispensing may apply — verify with your state health department.',         profNote:'Dispensing (supply of labelled medicine to a patient) is distinct from administering an injection. Most states restrict dispensing authority to doctors and pharmacists.' },
      { title:'Business Difficulty',      iconKey:'difficulty', iconColor:color,     iconBg:'rgba(15,118,110,.1)',  val:null, score, color,    detailKey:'Business Considerations',      note:`${state.name} is rated "${state.tag}" for ${prof.label.toLowerCase()}-led cosmetic practice.`,                                                                                                            profNote:`Score: ${score}/10 — This reflects the combined regulatory burden for ${prof.label.toLowerCase()}s in ${state.name}, including prescriber requirements, medicine custody obligations, and clinic setup complexity.`, act: state.act },
    ];

    const VAL_LBL = { yes:'Yes', no:'No', limited:'Limited', null:null };
    const VAL_CLS = { yes:'st-cap-y', no:'st-cap-n', limited:'st-cap-l' };

    const cardsHTML = capCardData.map((c, i) => {
      const icon = `<div class="st-cap-icon-wrap" style="background:${c.iconBg};color:${c.iconColor}">${ICONS[c.iconKey]}</div>`;
      if (c.val === null) { /* difficulty card */
        return `<div class="st-cap-card st-cap-diff" onclick="openCapModal(${i})">
          <div class="st-cap-card-top">${icon}</div>
          <div class="st-cap-title">${c.title}</div>
          <div class="st-cap-score" style="color:${c.color}">${c.score}<span>/10</span></div>
          <div class="st-cap-dots">${dotRowHTML('st-cap-dot', c.score, c.color)}</div>
          <p class="st-cap-desc">${c.note}</p>
          <div class="st-cap-more">View details ${arrowSVG}</div>
        </div>`;
      }
      const cls = VAL_CLS[c.val] || 'st-cap-l';
      const lbl = VAL_LBL[c.val] || 'Limited';
      const ico = c.val==='yes'?'✓':c.val==='no'?'✕':'–';
      return `<div class="st-cap-card ${cls}" onclick="openCapModal(${i})">
        <div class="st-cap-card-top">
          ${icon}
          <span class="st-cap-pill"><span class="st-cap-pill-ico">${ico}</span>${lbl}</span>
        </div>
        <div class="st-cap-title">${c.title}</div>
        <p class="st-cap-desc">${c.note}</p>
        <div class="st-cap-more">View details ${arrowSVG}</div>
      </div>`;
    }).join('');

    wrap.innerHTML = `<div class="st-cap-grid">${cardsHTML}</div>`;
  }

  window.openCapModal = function(idx) {
    const c = capCardData[idx];
    if (!c) return;
    const state = getState(activeState);
    const prof  = PROFESSIONS.find(p => p.code === activeProf);
    const base  = PROF_BASE[activeProf];
    const accMap = {};
    state.accordion.forEach(([t, b]) => { accMap[t] = b; });
    const detail = accMap[c.detailKey] || c.note;

    const VAL_LBL    = { yes:'Yes', no:'No', limited:'Limited' };
    const pillColors = { yes:'rgba(15,118,110,.12)', no:'rgba(220,38,38,.12)', limited:'rgba(217,119,6,.12)' };
    const txtColors  = { yes:'#0F766E', no:'#DC2626', limited:'#D97706' };
    const icos       = { yes:'✓', no:'✕', limited:'–' };

    let pillHTML;
    if (c.val === null) {
      pillHTML = `<div class="st-modal-pill" style="background:rgba(15,118,110,.1);color:${c.color}">
        <span style="font-family:var(--serif);font-size:1.1rem;font-weight:700">${c.score}</span>
        <span style="opacity:.55">/10 Difficulty</span></div>`;
    } else {
      pillHTML = `<div class="st-modal-pill" style="background:${pillColors[c.val]||pillColors.limited};color:${txtColors[c.val]||txtColors.limited}">
        ${icos[c.val]||'–'} ${VAL_LBL[c.val]||'Limited'}</div>`;
    }

    const ICONS_LARGE = {
      prescribe:  `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M9 5H7a2 2 0 0 0-2 2v12a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2V7a2 2 0 0 0-2-2h-2"/><rect x="9" y="3" width="6" height="4" rx="2"/><path d="m9 12 2 2 4-4"/></svg>`,
      inject:     `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m18 2 4 4-14 14H4v-4L18 2Z"/><path d="m8 8 4 4"/><path d="m14 2 4 4"/></svg>`,
      clinic:     `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="9" width="18" height="13" rx="2"/><path d="M3 9V7a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2v2"/><path d="M9 22v-6h6v6"/></svg>`,
      store:      `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><rect width="18" height="11" x="3" y="11" rx="2"/><path d="M7 11V7a5 5 0 0 1 10 0v4"/></svg>`,
      buy:        `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="21" r="1"/><circle cx="19" cy="21" r="1"/><path d="M2.05 2.05h2l2.66 12.42a2 2 0 0 0 2 1.58h9.78a2 2 0 0 0 1.95-1.57l1.65-7.43H5.12"/></svg>`,
      prescriber: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M16 21v-2a4 4 0 0 0-4-4H6a4 4 0 0 0-4 4v2"/><circle cx="9" cy="7" r="4"/><polyline points="16 11 18 13 22 9"/></svg>`,
      dispense:   `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="m10.5 20.5 10-10a4.95 4.95 0 1 0-7-7l-10 10a4.95 4.95 0 1 0 7 7Z"/><path d="m8.5 8.5 7 7"/></svg>`,
      difficulty: `<svg width="28" height="28" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round"><path d="M12 2v2M12 20v2M4.93 4.93l1.41 1.41M17.66 17.66l1.41 1.41M2 12h2M20 12h2M4.93 19.07l1.41-1.41M17.66 6.34l1.41-1.41"/><circle cx="12" cy="12" r="4"/></svg>`,
    };

    /* Context banner */
    const contextHTML = `<div class="st-modal-context"><span>${state.name}</span> · <span>${prof.label}</span></div>`;

    /* Secondary accordion section */
    const secCfg = {
      prescribe:  { lbl:`Advertising Rules — ${state.name}`,       key:'Advertising & Marketing Requirements' },
      inject:     { lbl:`Prescription Requirements — ${state.name}`, key:'Prescribing Rules' },
      clinic:     { lbl:`Business Setup — ${state.name}`,          key:'Business Considerations' },
      store:      { lbl:`Common Mistakes — ${state.name}`,         key:'Common Mistakes' },
      buy:        { lbl:`Common Mistakes — ${state.name}`,         key:'Common Mistakes' },
      prescriber: { lbl:`Common Mistakes — ${state.name}`,         key:'Common Mistakes' },
      dispense:   { lbl:`Prescribing Context — ${state.name}`,     key:'Prescribing Rules' },
    };
    const sec = secCfg[c.iconKey];
    const secBody = sec && sec.key !== c.detailKey ? accMap[sec.key] : null;
    const secondaryHTML = secBody
      ? `<div class="st-modal-divider"></div><div class="st-modal-lbl">${sec.lbl}</div>
         <div class="st-modal-body">${secBody.split('\n\n').filter(Boolean).map(p=>`<p>${p}</p>`).join('')}</div>`
      : '';

    /* Difficulty card: full accordion breakdown */
    let diffHTML = '';
    if (c.iconKey === 'difficulty') {
      const adjNote = c.score >= 8
        ? `Very high compliance burden for ${prof.label.toLowerCase()}s: prescriber required for every treatment, strict custody rules, and active enforcement.`
        : c.score >= 6
        ? `Moderate compliance burden: prescriber arrangement and custody rules apply, but the framework is more accommodating than QLD.`
        : c.score >= 4
        ? `Below-average compliance burden: standard national rules apply without extra state-specific restrictions — prescriber arrangement still required.`
        : `Lower compliance burden: national standard framework only, telehealth prescribers widely accepted, simpler logistics than eastern states.`;
      diffHTML = `<div class="st-modal-divider"></div>
        <div class="st-modal-lbl">Score Breakdown — ${prof.label} in ${state.name}</div>
        <div class="st-modal-body"><p>${adjNote}</p></div>` +
        state.accordion.map(([t, b]) =>
          `<div class="st-modal-divider"></div>
           <div class="st-modal-lbl">${t}</div>
           <div class="st-modal-body"><p>${b}</p></div>`
        ).join('');
    }

    /* Compliance checklist — specific to state + profession */
    let pts = [];
    if (c.iconKey === 'prescribe') {
      if (base.prescribe === 'no') pts = [
        `As a ${prof.label}, you cannot issue prescriptions — all S4 cosmetic injectable prescriptions must come from a registered doctor or nurse practitioner.`,
        'You must sight a valid, patient-specific written prescription before commencing any treatment. Verbal authority from a prescriber is not a substitute.',
        'Prescriptions must specify: patient name, date, product name, concentration, dose, and injection site(s).',
        `In ${state.name}: ${(accMap['Prescribing Rules']||'').split('.')[0]}.`,
      ];
      else if (base.prescribe === 'yes') pts = [
        `As a ${prof.label}, you hold independent prescribing authority and may prescribe S4 cosmetic injectables — but each prescription requires a documented clinical consultation.`,
        'Prescriptions must be patient-specific. Bulk scripts, standing orders, and pre-signed prescriptions are never valid.',
        'Keep records of every prescription: patient name, clinical rationale, product, dose, injection site, and consent documentation.',
        `Telehealth consultations are ${state.code === 'QLD' ? 'accepted where clinically appropriate' : 'widely accepted'} for prescribing in ${state.name}.`,
      ];
      else pts = [
        `Dentists hold limited prescribing authority — typically restricted to perioral and jaw regions within dental scope.`,
        'Botulinum toxin for cosmetic areas unrelated to dental conditions (e.g., forehead lines, crow\'s feet) may fall outside dental prescribing scope.',
        'Consult your professional indemnity insurer and AHPRA before prescribing cosmetic injectables beyond perioral areas.',
        `In ${state.name}: ${(accMap['Prescribing Rules']||'').split('.')[0]}.`,
      ];
    } else if (c.iconKey === 'inject') {
      if (base.inject === 'limited') pts = [
        `As an Enrolled Nurse, direct in-person supervision by a Registered Nurse or medical officer is required for every injection — telephone or remote supervision is not acceptable.`,
        'The supervising clinician must be physically present in the clinical area while you administer the injection.',
        'A valid patient-specific prescription must be in place before you commence — this is required in addition to supervision, not instead of it.',
        'Document supervision in every patient record: who supervised, their AHPRA registration number, and the time and date.',
      ];
      else if (base.inject === 'yes') pts = [
        `A valid patient-specific prescription must be in place before you inject — confirm it covers the exact product, concentration, dose, and site(s) you plan to treat.`,
        `In ${state.name}, the prescriber does not need to be physically present during the injection, provided a valid written prescription was issued after an appropriate consultation.`,
        'Document every injection episode immediately: product name, batch number, lot number, dose, site, time, and patient response.',
        'Keep a copy of the prescription in the patient record — state health authority audits may request this at any time.',
      ];
      else pts = [
        `Dental scope covers injections in perioral, jaw, and associated facial areas directly related to dental treatment (e.g., masseter botulinum toxin for bruxism).`,
        'Cosmetic injections for non-dental indications (forehead lines, crow\'s feet) without a dental clinical justification are likely outside dental scope of practice.',
        'Document the dental clinical rationale for every cosmetic injectable treatment you administer as a dentist.',
        `Notify your professional indemnity insurer of all cosmetic injectable services to confirm coverage in ${state.name}.`,
      ];
    } else if (c.iconKey === 'clinic') {
      if (base.own === 'yes') pts = [
        `As a ${prof.label}, you can hold 100% ownership of a cosmetic injectable clinic — no prescriber co-ownership is legally required.`,
        'As owner and prescriber, keep your S4 purchase accounts in the practice name and entirely separate from personal finances.',
        'Implement a formal clinical governance framework: prescribing protocols, emergency procedures, complaints policy, and patient consent forms.',
        `Confirm your professional indemnity insurance covers both clinical and business-owner roles for cosmetic injectables in ${state.name}.`,
      ];
      else if (base.own === 'no') pts = [
        `Enrolled Nurses cannot independently own a cosmetic injectable clinic — the practice must be structured under a prescribing doctor or NP.`,
        'Working as an employed injector within a doctor-led or NP-led clinic is the standard compliant model for Enrolled Nurses.',
        'Any arrangement where you carry the primary financial risk of the business may be scrutinised as de facto ownership — seek legal advice.',
      ];
      else pts = [
        `In ${state.name}: ${state.ownNote}`,
        'A formal written clinical governance agreement with a prescribing doctor or NP is essential — verbal arrangements are unenforceable and insufficient.',
        'The prescriber must retain exclusive control of all S4 medicine custody; your business entity cannot be the registered holder of S4 stock.',
        `Consult a healthcare business lawyer familiar with the ${state.act.split(' (')[0]} before finalising your clinic ownership structure.`,
      ];
    } else if (c.iconKey === 'store') {
      if (base.storeBuy === 'no') pts = [
        `You may not store S4 medicines under any circumstances — not overnight, not temporarily, not even in a locked clinic fridge without the prescriber's custody.`,
        'S4 stock must remain under the exclusive custody and control of the authorised prescribing doctor or NP at all times.',
        'If a patient cancels, the medicine reverts entirely to the prescriber — you cannot retain it for future appointments with other patients.',
        `Under ${state.act}, unauthorised possession of a Schedule 4 medicine is a criminal offence regardless of intent or whether any harm occurs.`,
      ];
      else pts = [
        `As a ${prof.label}, you may store S4 medicines — but strict custody and record-keeping obligations apply under ${state.act}.`,
        'Maintain a medicines register recording batch number, quantity received, used, wasted, and remaining for every S4 medicine and every date of activity.',
        'Storage must meet temperature requirements (typically 2–8°C for botulinum toxin) in a locked facility with access restricted to authorised personnel.',
        'Perform regular stocktakes, reconcile against your register, and report unexplained discrepancies to the relevant state health authority.',
      ];
    } else if (c.iconKey === 'buy') {
      if (base.storeBuy === 'no') pts = [
        `You cannot place purchase orders, pay invoices, or sign delivery receipts for S4 medicines — each of these actions constitutes unlawful possession.`,
        'All purchase orders must be in the prescriber\'s name, billed to the prescriber\'s ABN, and delivered to an address under the prescriber\'s authority.',
        'Reimbursing a prescriber after they purchase stock on your behalf does not transfer lawful ownership — the prescriber must remain the buyer at all times.',
        `In ${state.name}: ${(accMap['Common Mistakes']||'').split('.')[0]}.`,
      ];
      else pts = [
        `As a ${prof.label}, you may purchase S4 medicines directly from an authorised wholesaler or compounding pharmacy under your prescriber registration.`,
        'Your ABN and prescriber registration number must appear on all purchase orders — wholesalers are required to verify your authority before accepting orders.',
        'Retain all purchase invoices and reconcile them against your medicines register — these records are required for regulatory audits.',
        `Medicines must be purchased for identified patients with valid prescriptions — bulk pre-purchasing without linked prescriptions is not acceptable under ${state.act}.`,
      ];
    } else if (c.iconKey === 'prescriber') {
      if (base.prescriberReq === 'yes') pts = [
        'A valid patient-specific prescription must exist before every treatment, including for long-term repeat patients who have been seen before.',
        'The prescriber must personally consult the patient (face-to-face or via approved telehealth) before issuing each prescription — pre-signing blank scripts is never valid.',
        `In ${state.name}, telephone prescriptions are not accepted — the prescription must be in writing (paper or approved electronic format).`,
        `Most common compliance breach: ${(accMap['Common Mistakes']||'').split('.')[0]}.`,
      ];
      else pts = [
        `As a ${prof.label}, you are an independent prescriber — no external prescriber is required, and you can both prescribe and administer within the same appointment.`,
        'Even as your own prescriber, every treatment episode must be documented with a clinical consultation note, prescription, and patient consent record.',
        'You may not issue prescriptions for other practitioners to use — each injector must hold their own prescribing authority or have a prescriber arrangement in place.',
        `Confirm your professional indemnity insurance explicitly covers cosmetic prescribing in ${state.name}.`,
      ];
    } else if (c.iconKey === 'dispense') {
      if (base.dispense === 'no') pts = [
        `As a ${prof.label}, you may administer (inject) — but you may not dispense (hand a labelled medicine to a patient to take home). These are legally distinct activities.`,
        'If a patient requests unused portions to take home, that constitutes dispensing — refer them to the prescribing doctor or a pharmacist.',
        'Emergency antidote kits (e.g., hyaluronidase) that a patient takes home must be arranged through the prescriber or a pharmacist, not supplied by you.',
        `Under ${state.act}, unlicensed dispensing is a separate offence from unlicensed possession and carries its own penalties.`,
      ];
      else if (base.dispense === 'yes') pts = [
        `As a ${prof.label}, you may dispense medicines to patients — but labelling and record-keeping requirements are strictly regulated.`,
        'Labels must include: patient name, dispensing date, product name, strength, quantity, directions for use, and prescriber/dispenser details.',
        'Maintain a dispensing register and reconcile it against your stock register — both must be available for audit.',
        `Dispensing records must be retained per ${state.act} requirements — typically a minimum of 5 to 7 years.`,
      ];
      else pts = [
        `Dentists have limited dispensing authority — typically restricted to medicines within dental scope of practice.`,
        'Dispensing cosmetic injectables for patients to take home is generally not within scope for dental practitioners.',
        `Seek specific guidance from AHPRA and the Australian Dental Association before dispensing any S4 cosmetic medicine in ${state.name}.`,
      ];
    }

    const complianceHTML = pts.length
      ? `<div class="st-modal-divider"></div>
         <div class="st-modal-lbl">Key Points — ${prof.label} in ${state.name}</div>
         <ul class="st-modal-checklist">${pts.map(p=>`<li>${p}</li>`).join('')}</ul>`
      : '';

    const noteHTML = c.profNote ? `<div class="st-modal-note" style="margin-top:20px"><strong>For ${prof.label}s in ${state.name}:</strong> ${c.profNote}</div>` : '';
    const legHTML  = `<div class="st-modal-note" style="margin-top:10px"><strong>Applicable legislation:</strong> ${state.act}</div>`;
    const detailHTML = detail.split('\n\n').filter(Boolean).map(p => `<p>${p}</p>`).join('');

    document.getElementById('st-modal-content').innerHTML = `
      <div class="st-modal-icon-wrap" style="background:${c.iconBg};color:${c.iconColor}">${ICONS_LARGE[c.iconKey]}</div>
      <div class="st-modal-title">${c.title}</div>
      ${pillHTML}
      ${contextHTML}
      <div class="st-modal-lbl">${c.detailKey} — ${state.name}</div>
      <div class="st-modal-body">${detailHTML}</div>
      ${secondaryHTML}${diffHTML}${complianceHTML}${noteHTML}${legHTML}`;
    document.getElementById('st-modal-overlay').classList.add('open');
    document.body.style.overflow = 'hidden';
  };

  window.closeCapModal = function() {
    document.getElementById('st-modal-overlay')?.classList.remove('open');
    document.body.style.overflow = '';
  };

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
      wall.setAttribute('fill', '#C6D8EA');
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
    const badge = document.getElementById('st-map-badge');
    if (badge) { badge.classList.remove('pop'); requestAnimationFrame(() => badge.classList.add('pop')); }
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

  window.selectState = function (code, scroll) {
    activeState = code;
    renderAll();
    if (scroll) setTimeout(() => document.getElementById('st-workspace')?.scrollIntoView({ behavior: 'smooth', block: 'start' }), 80);
  };
  window.selectProfession = function (code) {
    activeProf = code;
    renderAll();
  };

  /* Map shapes: click syncs state only (no scroll) */
  document.querySelectorAll('.st-shape').forEach(el => {
    el.addEventListener('click', () => window.selectState(el.dataset.state, false));
  });

  /* Inject modal overlay once */
  if (!document.getElementById('st-modal-overlay')) {
    const mo = document.createElement('div');
    mo.id = 'st-modal-overlay';
    mo.className = 'st-modal-overlay';
    mo.innerHTML = `
      <div class="st-modal" id="st-modal">
        <button class="st-modal-close" onclick="closeCapModal()" aria-label="Close">
          <svg width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round"><path d="M18 6 6 18M6 6l12 12"/></svg>
        </button>
        <div id="st-modal-content"></div>
      </div>`;
    mo.addEventListener('click', e => { if (e.target === mo) window.closeCapModal(); });
    document.body.appendChild(mo);
    document.addEventListener('keydown', e => { if (e.key === 'Escape') window.closeCapModal(); });
  }

  initWallLayer();
  renderAll();
})();

/* ── Clinic Launch Planner ──────────────────────────────── */
window.toggleClpCard = function(id) {
  const num = parseInt(id.replace('clp-', ''));
  const card = document.getElementById(id);
  if (!card) return;
  const isOpen = card.classList.contains('open');

  // Close everything
  document.querySelectorAll('.clp-card.open').forEach(c => c.classList.remove('open'));
  document.querySelectorAll('.clp-step-btn.clp-active').forEach(b => b.classList.remove('clp-active'));
  document.querySelectorAll('.clp-row-panel.open').forEach(p => p.classList.remove('open'));
  document.querySelectorAll('.clp-panel-pane.active').forEach(s => s.classList.remove('active'));

  if (!isOpen) {
    card.classList.add('open');
    const btn = document.querySelector(`.clp-step-btn[data-step="${num}"]`);
    if (btn) btn.classList.add('clp-active');
    const panelId = num <= 3 ? 'clp-panel-r1' : 'clp-panel-r2';
    const panel = document.getElementById(panelId);
    const pane  = document.getElementById('clp-pane-' + num);
    if (panel) panel.classList.add('open');
    if (pane)  pane.classList.add('active');
  }
};

window.scrollToClp = function(id) {
  window.toggleClpCard(id);
  const num = parseInt(id.replace('clp-', ''));
  setTimeout(function() {
    const panelId = num <= 3 ? 'clp-panel-r1' : 'clp-panel-r2';
    const panel = document.getElementById(panelId);
    if (panel) panel.scrollIntoView({ behavior: 'smooth', block: 'nearest' });
  }, 80);
};

/* ── Contact form ────────────────────────────────────────── */
(function() {
  const form = document.getElementById('contact-form');
  const wrap = document.getElementById('ct-form-wrap');
  if (form && wrap) {
    form.addEventListener('submit', function(e) {
      e.preventDefault();
      wrap.classList.add('submitted');
    });
  }
})();

window.toggleScopeRow = function(row) {
  const rowId = row.dataset.row;
  const expRow = document.querySelector(`.scope-exp-row[data-for="${rowId}"]`);
  const isActive = row.classList.contains('active');
  document.querySelectorAll('.scope-row.active').forEach(r => r.classList.remove('active'));
  document.querySelectorAll('.scope-exp-row.active').forEach(r => r.classList.remove('active'));
  if (!isActive) {
    row.classList.add('active');
    if (expRow) expRow.classList.add('active');
  }
};

/* ═══════════════════════════════════════════════════════
   GET JOB GUIDANCE MODAL
═══════════════════════════════════════════════════════ */
(function() {
  var ggData = { profession:'', state:'', experience:'', goal:'', goingBack:false };

  var PROF = { rn:'Registered Nurse', en:'Enrolled Nurse', np:'Nurse Practitioner', doctor:'Doctor', dentist:'Dentist', other:'Healthcare Professional' };
  var STATE = { qld:'Queensland', nsw:'New South Wales', vic:'Victoria', wa:'Western Australia', sa:'South Australia', tas:'Tasmania', act:'ACT', nt:'Northern Territory' };
  var GOAL = { injector:'Become an Injector', clinic:'Open My Own Clinic', prescribing:'Understand Prescribing', career:'Career Guidance', business:'Business Advice' };

  window.openGgModal = function() {
    var m = document.getElementById('gg-modal');
    m.classList.add('open');
    m.setAttribute('aria-hidden','false');
    document.body.style.overflow = 'hidden';
    ggGoStep(1);
  };

  window.closeGgModal = function() {
    var m = document.getElementById('gg-modal');
    m.classList.remove('open');
    m.setAttribute('aria-hidden','true');
    document.body.style.overflow = '';
  };

  window.ggOverlayClick = function(e) {
    if (e.target === document.getElementById('gg-modal')) closeGgModal();
  };

  window.ggSelectCard = function(btn) {
    var group = btn.dataset.group;
    document.querySelectorAll('.gg-opt-card[data-group="'+group+'"]').forEach(function(c){ c.classList.remove('selected'); });
    btn.classList.add('selected');
    ggData[group] = btn.dataset.val;
  };

  window.ggGoStep = function(step) {
    var steps = { 1:'gg-step-1', 2:'gg-step-2', '3a':'gg-step-3a', '3b':'gg-step-3b' };
    var active = document.querySelector('.gg-step.active');
    if (active) active.classList.remove('active');

    var next = document.getElementById(steps[step]);
    if (!next) return;
    if (ggData.goingBack) next.classList.add('going-back');
    else next.classList.remove('going-back');
    next.classList.add('active');
    ggData.goingBack = false;

    document.querySelector('.gg-box').scrollTop = 0;
    ggUpdateProgress(step);
  };

  function ggUpdateProgress(step) {
    var n = (step === '3a' || step === '3b') ? 3 : parseInt(step);
    [1,2,3].forEach(function(i) {
      var el = document.getElementById('gg-prog-'+i);
      el.classList.toggle('active', i === n);
      el.classList.toggle('done', i < n);
    });
    var l1 = document.getElementById('gg-prog-line-1');
    var l2 = document.getElementById('gg-prog-line-2');
    if (l1) l1.classList.toggle('done', n > 1);
    if (l2) l2.classList.toggle('done', n > 2);
  }

  window.ggStep1Next = function() {
    ggData.profession = document.getElementById('gg-profession').value;
    ggData.state = document.getElementById('gg-state').value;
    var err = document.getElementById('gg-s1-err');
    if (!ggData.profession || !ggData.state || !ggData.experience || !ggData.goal) {
      err.style.display = 'block';
      return;
    }
    err.style.display = 'none';
    ggBuildResults();
    ggGoStep(2);
  };

  function ggBuildResults() {
    var p = ggData.profession, s = ggData.state, e = ggData.experience, g = ggData.goal;

    // Subtitle
    var sub = document.getElementById('gg-result-sub');
    if (sub) sub.textContent = 'Based on your profile as a '+PROF[p]+' in '+(STATE[s]||'your state')+' looking to '+(GOAL[g]||'grow your career')+'.';

    // Insights
    var insights = [];
    if (p === 'rn') {
      insights.push({ ok:1, t:'You may own and operate a cosmetic clinic in Australia.' });
      insights.push({ ok:0, t:'You cannot self-prescribe — a valid prescribing arrangement is required.' });
      insights.push({ ok:1, t:'You can administer injectables once trained with a qualified prescriber in place.' });
    } else if (p === 'en') {
      insights.push({ ok:0, t:'Enrolled Nurses cannot independently administer cosmetic injectables.' });
      insights.push({ ok:0, t:'Formal delegation from a supervising clinician is required at all times.' });
      insights.push({ ok:2, t:'Pathways exist with the right governance structure and clinical support.' });
    } else if (p === 'np') {
      insights.push({ ok:1, t:'Nurse Practitioners can self-prescribe within their scope of practice.' });
      insights.push({ ok:1, t:'You can own and operate a cosmetic clinic independently.' });
      insights.push({ ok:1, t:'Strong direct pathway to independent cosmetic practice.' });
    } else if (p === 'doctor') {
      insights.push({ ok:1, t:'You have full prescribing authority for all cosmetic injectables.' });
      insights.push({ ok:1, t:'You can own and operate a clinic with complete clinical authority.' });
      insights.push({ ok:1, t:'You can act as a prescribing practitioner for nursing staff.' });
    } else if (p === 'dentist') {
      insights.push({ ok:1, t:'Dentists can administer cosmetic injectables within facial scope.' });
      insights.push({ ok:2, t:'Prescribing scope may vary — verify with your state dental board.' });
      insights.push({ ok:1, t:'You can own and operate a cosmetic clinic alongside dental practice.' });
    } else {
      insights.push({ ok:2, t:'Your pathway depends on your specific registration and scope.' });
      insights.push({ ok:1, t:'Our team can help identify the right pathway for your situation.' });
    }
    if (s === 'qld') {
      insights.push({ ok:2, t:'Queensland has additional facility registration and notification requirements.' });
    } else if (s === 'nsw') {
      insights.push({ ok:2, t:'NSW has specific cosmetic medicine guidelines in effect from 2023.' });
    } else if (s === 'vic') {
      insights.push({ ok:2, t:'Victoria requires Health Services Act 1988 compliance for facility setup.' });
    }
    if (g === 'clinic' && (p === 'rn' || p === 'en')) {
      insights.push({ ok:0, t:'A formal prescriber arrangement must be in place before opening.' });
    }

    var icons = {
      1:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><polyline points="20 6 9 17 4 12"/></svg>',
      0:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2.5"><line x1="18" y1="6" x2="6" y2="18"/><line x1="6" y1="6" x2="18" y2="18"/></svg>',
      2:'<svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="#fff" stroke-width="2"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12" y2="12"/><line x1="12" y1="16" x2="12.01" y2="16"/></svg>'
    };
    var cls = {1:'gg-ok',0:'gg-no',2:'gg-info'};

    var insEl = document.getElementById('gg-insights');
    insEl.innerHTML = '<h4>What Applies to You</h4>' +
      insights.slice(0,5).map(function(i){
        return '<div class="gg-insight-item '+cls[i.ok]+'"><div class="gg-insight-ico">'+icons[i.ok]+'</div><span>'+i.t+'</span></div>';
      }).join('');

    // Recommended steps
    var recs = [];
    if (p === 'rn' || p === 'en') recs.push('Understand prescribing arrangement requirements for '+(STATE[s]||'your state'));
    if (g === 'clinic') { recs.push('Research facility compliance requirements and registration'); recs.push('Develop your business and clinical governance plan'); }
    else if (g === 'injector') { recs.push('Complete accredited cosmetic injectables training'); recs.push('Secure your first supervised clinical position'); }
    else if (g === 'prescribing') { recs.push('Review scope of practice for prescribing in '+(STATE[s]||'your state')); }
    if (e === 'none' || e === 'lt1') recs.push('Build supervised experience before moving to independent practice');
    recs.push('Connect with a prescribing practitioner or mentor in your area');

    var recEl = document.getElementById('gg-rec-list');
    recEl.innerHTML = recs.slice(0,3).map(function(r,i){
      return '<div class="gg-rec-item"><div class="gg-rec-num">'+(i+1)+'</div><span>'+r+'</span></div>';
    }).join('');

    // Readiness percentages
    var expMap = {none:32,lt1:52,'1to3':70,'3plus':87};
    var careerPct = expMap[e] || 50;
    var clinicPct = Math.round((g==='clinic' ? 0.9 : 0.75) * careerPct);
    var prescMap = {doctor:90,np:85,dentist:65,rn:44,en:28,other:40};
    var prescPct = prescMap[p] || 45;

    setTimeout(function(){
      animBar('gg-r1-fill','gg-r1-pct', careerPct, '');
      animBar('gg-r2-fill','gg-r2-pct', clinicPct, 'blue');
      animBar('gg-r3-fill','gg-r3-pct', prescPct, 'purple');
    }, 350);
  }

  function animBar(fillId, pctId, target, color) {
    var fill = document.getElementById(fillId);
    var pctEl = document.getElementById(pctId);
    if (!fill || !pctEl) return;
    fill.style.width = '0%';
    pctEl.textContent = '0%';
    if (color) pctEl.classList.add(color);
    var cur = 0;
    var iv = setInterval(function(){
      cur = Math.min(cur + 2, target);
      pctEl.textContent = cur + '%';
      fill.style.width = cur + '%';
      if (cur >= target) clearInterval(iv);
    }, 18);
  }

  window.ggGoStep = window.ggGoStep || function(){};  // already defined above, just guard

  window.ggSelectDoc = function(card) {
    document.querySelectorAll('.gg-doc-card').forEach(function(c){ c.classList.remove('selected'); });
    card.classList.add('selected');
  };

  window.ggBookNow = function() {
    var selected = document.querySelector('.gg-doc-card.selected');
    if (!selected) {
      alert('Please select a doctor before continuing.');
      return;
    }
    // Placeholder — redirect to contact or booking page
    window.location.href = '#contact';
    closeGgModal();
  };

  window.ggSubmit3B = function(e) {
    e.preventDefault();
    document.getElementById('gg-3b-form').style.display = 'none';
    var suc = document.getElementById('gg-3b-success');
    suc.style.display = 'flex';
    suc.classList.add('show');
  };

  // Keyboard ESC to close
  document.addEventListener('keydown', function(e) {
    if (e.key === 'Escape') {
      var m = document.getElementById('gg-modal');
      if (m && m.classList.contains('open')) closeGgModal();
    }
  });
}());
