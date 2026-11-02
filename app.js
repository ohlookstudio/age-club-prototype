/* AGE Club · prototipo UX navegable (wireframe de fidelidad media)
   Estado local en memoria. Sin backend. Todo lo simulado se etiqueta como tal. */
(function () {
'use strict';

/* ---------- utilidades ---------- */
var MES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
var MESL = ['enero','febrero','marzo','abril','mayo','junio','julio','agosto','septiembre','octubre','noviembre','diciembre'];
var DIA = ['dom','lun','mar','mié','jue','vie','sáb'];
var DIAL = ['domingo','lunes','martes','miércoles','jueves','viernes','sábado'];
function D(y, m, d) { return new Date(y, m, d); }
function addM(dt, n) { return new Date(dt.getFullYear(), dt.getMonth() + n, dt.getDate()); }
function addD(dt, n) { return new Date(dt.getFullYear(), dt.getMonth(), dt.getDate() + n); }
function cap(s) { return s.charAt(0).toUpperCase() + s.slice(1); }
function fDate(dt) { return dt.getDate() + ' ' + MES[dt.getMonth()] + ' ' + dt.getFullYear(); }
function fDay(dt) { return DIA[dt.getDay()] + ' ' + dt.getDate() + ' ' + MES[dt.getMonth()]; }
function fMY(dt) { return MES[dt.getMonth()] + ' ' + dt.getFullYear(); }
function fMYs(dt) { return MES[dt.getMonth()] + ' ' + String(dt.getFullYear()).slice(2); }
function fLong(dt) { return cap(DIAL[dt.getDay()]) + ', ' + dt.getDate() + ' de ' + MESL[dt.getMonth()]; }
function esc(s) { return String(s).replace(/[&<>"']/g, function (c) { return { '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]; }); }
function plural(n, a, b) { return n + ' ' + (n === 1 ? a : b); }
function go(r, p) { return 'data-go="' + r + '"' + (p ? " data-p='" + JSON.stringify(p) + "'" : ''); }
function act(a, arg) { return 'data-act="' + a + '"' + (arg !== undefined ? ' data-arg="' + esc(arg) + '"' : ''); }

var BASE = D(DEMO.baseToday[0], DEMO.baseToday[1], DEMO.baseToday[2]);

/* ---------- modelo de planes ---------- */
var PLAN = {}, COMPS = {}, COMP = {};
PLANS.forEach(function (p) {
  PLAN[p.id] = p;
  var out = [];
  p.months.forEach(function (mo, mi) {
    if (!mo) return;
    mo[1].forEach(function (c, i) {
      var o = { id: p.id + '|' + (mi + 1) + '|' + i, plan: p.id, m: mi + 1, key: c[0], label: c[1], type: CATALOG[c[0]].type, orig: mo[0] };
      out.push(o); COMP[o.id] = o;
    });
  });
  COMPS[p.id] = out;
});
function monthComps(pid, m) { return COMPS[pid].filter(function (c) { return c.m === m; }); }
function clinical(t) { return t === 'tratamiento' || t === 'revision'; }
function counts(pid) {
  var r = { tratamiento: 0, revision: 0, regalo: 0, recompensa: 0, activos: 0 };
  COMPS[pid].forEach(function (c) { r[c.type]++; });
  r.activos = PLAN[pid].months.filter(Boolean).length;
  return r;
}
function priceM(pid) { return PLAN[pid].price.replace(' €', ' €/mes'); }
var CAT = {}; CATEGORIES.forEach(function (c) { CAT[c.id] = c; });
function catOf(pid) { return CATEGORIES.filter(function (c) { return c.plans.indexOf(pid) > -1; })[0]; }
function keyCounts(pid, types) {
  var cnt = {};
  COMPS[pid].forEach(function (c) { if (!types || types.indexOf(c.type) > -1) cnt[c.key] = (cnt[c.key] || 0) + 1; });
  return cnt;
}
function countsText(pid) {
  var k = counts(pid), a = [];
  a.push(plural(k.tratamiento, 'tratamiento', 'tratamientos'));
  if (k.revision) a.push(plural(k.revision, 'revisión', 'revisiones'));
  if (k.regalo) a.push(plural(k.regalo, 'regalo', 'regalos'));
  if (k.recompensa) a.push('Rewards');
  return a.join(' · ');
}

/* ---------- estado ---------- */
var S;
function freshUI() {
  return { recView: 'timeline', preview: null, calSel: null, recFilter: 'todo', resTab: 'proximas', catFilter: 'plan', planOpen: { trat: true }, promo: { open: false, code: '', state: null }, form: {}, errs: {}, showPass: false, pastOpen: false, draft: null, sheet: null, toast: null, ack: false, recScrolled: false };
}
var ACCOUNTS = [];          /* cuentas creadas en esta sesión (simuladas, solo en memoria) */
var DEMO_SNAP = null;       /* estado guardado de la cuenta de prueba al cerrar sesión */
function reset() {
  S = { auth: { email: DEMO.user.email }, member: null, items: {}, log: [], archive: [], readNotifs: false, scenario: 'nuevo',
    user: JSON.parse(JSON.stringify(DEMO.user)),
    prefs: { recordatorios: true, pendientes: true, beneficios: true, fechas: true, email: false },
    stack: [{ r: 'inicio', p: {} }], ui: freshUI(), capture: false, promoReqs: {} };
}
function today() { return S.member ? addM(S.member.act, S.member.cycle - 1) : BASE; }
function mStart(m) { return addM(S.member.act, m - 1); }
function mEnd(m) { return addD(addM(S.member.act, m), -1); }
function item(id) { return S.items[id] || null; }
function derive() {
  var it = {}, cyc = S.member.cycle;
  COMPS[S.member.plan].forEach(function (c) {
    var cl = clinical(c.type), o = {};
    if (c.m < cyc) { o.status = cl ? 'completado' : 'canjeado'; o.doneAt = addD(mStart(c.m), cl ? 6 : 9); o.time = '10:30'; }
    else if (c.m === cyc) o.status = cl ? 'pendiente' : 'disponible';
    else o.status = cl ? 'previsto' : 'futuro';
    it[c.id] = o;
  });
  S.items = it;
}
function setCycle(n) { S.member.cycle = n; derive(); S.readNotifs = false; S.ui.calSel = null; S.ui.recScrolled = false; }
function archiveCurrent() {
  if (!S.member) return;
  var pn = PLAN[S.member.plan].name;
  COMPS[S.member.plan].forEach(function (c) {
    var it = item(c.id);
    if (it && (it.status === 'completado' || it.status === 'canjeado'))
      S.archive.push({ label: c.label, type: c.type, m: c.m, plan: pn, date: it.doneAt, time: it.time || '10:30', kind: it.status === 'completado' ? 'realizado' : 'canjeado' });
  });
}
function activate(pid) {
  var start = today();
  if (S.member) archiveCurrent();
  S.member = { plan: pid, act: start, cycle: 1 };
  derive(); S.readNotifs = false; S.ui.preview = null; S.ui.calSel = null; S.ui.recScrolled = false;
}
function scenario(name) {
  reset(); S.scenario = name;
  if (name === 'sinsesion') { S.auth = null; S.stack = [{ r: 'bienvenida', p: {} }]; }
  if (name === 'recien') { S.member = { plan: 'botox-essential', act: BASE, cycle: 1 }; derive(); }
  if (name === 'botox' || name === 'botox5') {
    S.member = { plan: 'botox-essential', act: addM(BASE, -5), cycle: 6 }; derive();
    var c6 = monthComps('botox-essential', 6)[0];
    S.items[c6.id] = { status: 'reservado', appt: { date: D(2026, 9, 29), time: '11:30' } };
    var c2 = monthComps('botox-essential', 2)[0];
    S.log.push({ label: c2.label, type: c2.type, m: 2, plan: 'Botox Essential', date: addD(mStart(2), 2), time: '10:30', kind: 'cancelada' });
    if (name === 'botox5') setCycle(5);
  }
  if (name === 'premium') { S.member = { plan: 'premium', act: addM(BASE, -5), cycle: 6 }; derive(); }
}

/* ---------- acciones de dominio ---------- */
function book(id, date, time) { var it = S.items[id]; it.status = 'reservado'; it.appt = { date: date, time: time }; delete it.change; }
function requestChange(id, date, time) { var it = S.items[id]; it.status = 'cambio'; it.change = { date: date, time: time }; }
function cancelAppt(id) {
  var it = S.items[id], c = COMP[id];
  S.log.push({ label: c.label, type: c.type, m: c.m, plan: PLAN[c.plan].name, date: it.appt.date, time: it.appt.time, kind: 'cancelada' });
  it.status = 'pendiente'; delete it.appt; delete it.change;
}
function completeAppt(id) { var it = S.items[id]; it.status = 'completado'; it.doneAt = it.appt.date; it.time = it.appt.time; delete it.appt; delete it.change; }
function confirmChange(id) { var it = S.items[id]; it.appt = it.change; delete it.change; it.status = 'reservado'; }
function redeem(id) { var it = S.items[id]; it.status = 'canjeado'; it.doneAt = today(); }

/* ---------- consultas ---------- */
function plannedComps() { return S.member ? COMPS[S.member.plan] : []; }
function byStatus(sts) { return plannedComps().filter(function (c) { return sts.indexOf(item(c.id).status) > -1; }); }
function upcomingAppts() {
  return byStatus(['reservado', 'cambio']).sort(function (a, b) { return item(a.id).appt.date - item(b.id).appt.date; });
}
function nextMonthWith(after, pid) {
  pid = pid || S.member.plan;
  for (var m = after + 1; m <= 12; m++) if (PLAN[pid].months[m - 1]) return m;
  return null;
}
function progress() {
  var r = { cl: 0, cd: 0, bn: 0, bd: 0 };
  plannedComps().forEach(function (c) {
    var st = item(c.id).status;
    if (clinical(c.type)) { r.cl++; if (st === 'completado') r.cd++; } else { r.bn++; if (st === 'canjeado') r.bd++; }
  });
  return r;
}
function notifs() {
  if (!S.member) return [];
  var out = [], p = S.prefs;
  plannedComps().forEach(function (c) {
    var it = item(c.id), st = it.status;
    if (p.recordatorios && st === 'reservado') out.push({ i: 'cal', t: 'Recordatorio de cita', x: c.label + ' · ' + fDay(it.appt.date) + ', ' + it.appt.time + '.', a: go('cita', { id: c.id }) });
    if (p.recordatorios && st === 'cambio') out.push({ i: 'cal', t: 'Cambio pendiente de confirmar', x: 'Has pedido mover ' + c.label + ' al ' + fDay(it.change.date) + '. La clínica debe confirmarlo.', a: go('cita', { id: c.id }) });
    if (p.pendientes && st === 'pendiente') out.push({ i: 'pend', t: 'Pendiente de reservar', x: c.label + ' corresponde al Mes ' + c.m + ' de tu recorrido.', a: go('reservar-2', { id: c.id }) });
    if (p.beneficios && st === 'disponible') out.push({ i: 'gift', t: CATALOG[c.key].name + ' disponible', x: 'Mes ' + c.m + '. La forma de canje está por confirmar.', a: go('beneficio', { id: c.id }) });
  });
  var nx = nextMonthWith(S.member.cycle);
  if (p.pendientes && nx) out.push({ i: 'next', t: 'Próximo hito: Mes ' + nx, x: PLAN[S.member.plan].months[nx - 1][0] + (S.prefs.fechas ? ' · desde el ' + fDate(mStart(nx)) : '') + '.', a: go('mes', { m: nx }) });
  return out;
}
function historyEntries(onlyClinical) {
  var out = [];
  if (S.member) plannedComps().forEach(function (c) {
    var it = item(c.id);
    if (it.status === 'completado' || it.status === 'canjeado')
      out.push({ label: c.label, type: c.type, m: c.m, plan: PLAN[c.plan].name, date: it.doneAt, time: it.time || '10:30', kind: it.status === 'completado' ? 'realizado' : 'canjeado' });
  });
  out = out.concat(S.archive, S.log);
  if (onlyClinical) out = out.filter(function (e) { return clinical(e.type) && e.kind === 'realizado'; });
  else out = out.filter(function (e) { return clinical(e.type); });
  return out.sort(function (a, b) { return b.date - a.date; });
}
function slotDays() {
  var out = [], d = addD(today(), 1);
  while (out.length < 12) { if (d.getDay() !== 0) out.push(d); d = addD(d, 1); }
  return out;
}
function slotTaken(day, ti) { return ((day.getDate() * 7 + ti * 3) % 5) === 0; }

/* ---------- estados y glifos ---------- */
var ST = {
  previsto: { l: 'Previsto', c: 'prev' }, pendiente: { l: 'Pendiente de reservar', c: 'pend' },
  reservado: { l: 'Reservado', c: 'res' }, cambio: { l: 'Cambio solicitado', c: 'cambio' },
  completado: { l: 'Realizado', c: 'done' }, futuro: { l: 'Próximamente', c: 'prev' },
  disponible: { l: 'Disponible', c: 'pend' }, canjeado: { l: 'Canjeado', c: 'done' }
};
var INK = '#431e0c', MUTE2 = '#c7c7c7', BG = '#ffffff', FILL2 = '#f5d6b3';
function glyph(type, st, size) {
  size = size || 20;
  var cls = st ? ST[st].c : 'neutral';
  var fill = BG, stroke = INK, sw = 1.7, dash = '', inner = '';
  if (cls === 'done') fill = INK;
  else if (cls === 'res') sw = 2.2;
  else if (cls === 'cambio') { sw = 2.2; fill = FILL2; }
  else if (cls === 'pend') { fill = FILL2; sw = 1.8; }
  else if (cls === 'prev') { stroke = MUTE2; sw = 1.5; }
  var a = ' style="fill:' + fill + ';stroke:' + stroke + ';stroke-width:' + sw + ';' + dash + '"';
  var line = cls === 'done' ? BG : stroke, shape;
  if (type === 'tratamiento') shape = '<circle cx="12" cy="12" r="8"' + a + '></circle>';
  else if (type === 'revision') shape = '<rect x="4.5" y="4.5" width="15" height="15" rx="3.5"' + a + '></rect>';
  else if (type === 'regalo') shape = '<rect x="4" y="9.5" width="16" height="10.5" rx="1.6"' + a + '></rect><path d="M12 9.5v10.5M4 13.5h16" style="fill:none;stroke:' + line + ';stroke-width:1.4"></path><path d="M12 9.5c-1.5-3-5-3.4-5-1.4 0 1.3 2.8 1.4 5 1.4zM12 9.5c1.5-3 5-3.4 5-1.4 0 1.3-2.8 1.4-5 1.4z" style="fill:none;stroke:' + stroke + ';stroke-width:1.4"></path>';
  else shape = '<path d="M12 3.6l2.5 5.3 5.8.8-4.2 4 1 5.8L12 16.7l-5.1 2.8 1-5.8-4.2-4 5.8-.8z"' + a.replace('"', '"stroke-linejoin:round;') + '></path>';
  if (cls === 'done' && clinical(type)) inner = '<path d="M8.3 12.3l2.5 2.5 4.9-5" style="fill:none;stroke:' + BG + ';stroke-width:2;stroke-linecap:round;stroke-linejoin:round"></path>';
  if (cls === 'res' && clinical(type)) inner = '<circle cx="12" cy="12" r="2.6" style="fill:' + INK + '"></circle>';
  if (cls === 'cambio' && clinical(type)) inner = '<path d="M12 8v4.6" style="stroke:' + INK + ';stroke-width:2.2;stroke-linecap:round"></path><circle cx="12" cy="15.8" r="1.2" style="fill:' + INK + '"></circle>';
  return '<svg class="gl" width="' + size + '" height="' + size + '" viewBox="0 0 24 24" aria-hidden="true">' + shape + inner + '</svg>';
}
function pill(st) { return '<span class="pill st-' + ST[st].c + '">' + ST[st].l + '</span>'; }
function tbd(t) { return '<span class="tbd">' + esc(t || 'Por confirmar') + '</span>'; }
var DEMO_TAG = '<span class="demo-tag">DEMO</span>';

var ICON = {
  back: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M15.25 6l-6 6 6 6"></path></svg>',
  close: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 6.5l11 11M17.5 6.5l-11 11"></path></svg>',
  chev: '<svg class="ic chev" viewBox="0 0 24 24" aria-hidden="true"><path d="M9.25 6l6 6-6 6"></path></svg>',
  prev: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M15.25 6l-6 6 6 6"></path></svg>',
  next: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M9.25 6l6 6-6 6"></path></svg>',
  down: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 9.25l6 6 6-6"></path></svg>',
  arrow: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M4.5 12h14M12.5 6l6 6-6 6"></path></svg>',
  arrows: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6.5 7l5 5-5 5M12.5 7l5 5-5 5"></path></svg>',
  bell: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M6 16.5V11a6 6 0 0 1 12 0v5.5l1.5 2h-15zM10 20.75a2.2 2.2 0 0 0 4 0"></path></svg>',
  home: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M4 10.5L12 4l8 6.5V20a1 1 0 0 1-1 1h-4.5v-6h-5v6H5a1 1 0 0 1-1-1z"></path></svg>',
  route: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="6" cy="6" r="2.2"></circle><circle cx="18" cy="18" r="2.2"></circle><path d="M8.2 6H15a3 3 0 0 1 0 6H9a3 3 0 0 0 0 6h6.8"></path></svg>',
  cal: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="5" width="17" height="15.5" rx="3"></rect><path d="M3.5 10h17M8 3v4M16 3v4"></path></svg>',
  user: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="8.5" r="3.8"></circle><path d="M4.5 20.5c1.3-3.6 4.2-5.3 7.5-5.3s6.2 1.7 7.5 5.3"></path></svg>',
  plus: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 5v14M5 12h14"></path></svg>',
  info: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><circle cx="12" cy="12" r="8.5"></circle><path d="M12 11v5.25M12 7.9v.1"></path></svg>',
  check: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 12.5l4.25 4.25L18.5 8"></path></svg>',
  tick: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 12.5l4.25 4.25L18.5 8"></path></svg>',
  lock: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="5.5" y="10.5" width="13" height="10" rx="2.5"></rect><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5"></path></svg>',
  spark: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5l1.8 6.5 6.7 2-6.7 2L12 20.5 10.2 14l-6.7-2 6.7-2z"></path></svg>',
  pin: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 21s-6.5-6.1-6.5-11a6.5 6.5 0 0 1 13 0c0 4.9-6.5 11-6.5 11z"></path><circle cx="12" cy="10" r="2.3"></circle></svg>',
  drop: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M12 3.5s6 6.6 6 11a6 6 0 0 1-12 0c0-4.4 6-11 6-11z"></path></svg>',
  list: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><path d="M9 6.5h11M9 12h11M9 17.5h11M4.8 6.5v.01M4.8 12v.01M4.8 17.5v.01"></path></svg>',
  cards: '<svg class="ic" viewBox="0 0 24 24" aria-hidden="true"><rect x="3.5" y="6" width="17" height="12" rx="2.5"></rect><path d="M3.5 10h17"></path></svg>'
};
var NICON = { cal: ICON.cal, pend: glyph('tratamiento', 'pendiente', 22), gift: glyph('regalo', null, 22), next: ICON.route };

/* ---------- componentes reutilizables ---------- */
function nav(title, o) {
  o = o || {};
  var left = '';
  if (o.close) left = '<button class="hb" ' + act('closeFlow') + ' aria-label="Cerrar"><span class="hb-c">' + ICON.close + '</span></button>';
  else if (S.stack.length > 1) left = '<button class="hb" data-back aria-label="Volver a ' + esc(backLabel()) + '"><span class="hb-c">' + ICON.back + '</span><span>' + esc(backLabel()) + '</span></button>';
  return '<header class="nav' + (o.over ? ' over' : '') + '"><div class="nav-l">' + left + '</div><div class="nav-t">' + esc(title || '') + '</div><div class="nav-r">' + (o.right || '') + '</div></header>';
}
function photo(k, cls) { var p = PHOTOS[k]; return '<img' + (cls ? ' class="' + cls + '"' : '') + ' src="' + p[0] + '" alt="' + esc(p[1]) + '"' + (p[1] ? '' : ' aria-hidden="true"') + '>'; }
function img(p, cls, pos) { return '<img' + (cls ? ' class="' + cls + '"' : '') + ' src="' + p[0] + '" alt="' + esc(p[1]) + '"' + (pos ? ' style="object-position:' + pos + '"' : '') + '>'; }
function ctaPhoto(label, attrs, tag) { tag = tag || 'button'; return '<' + tag + ' class="cta-photo"' + (attrs ? ' ' + attrs : '') + '><span class="cta-c">' + ICON.arrow + '</span>' + label + '</' + tag + '>'; }
function avatar() { return S.user && S.user.email === DEMO.user.email ? '<span class="av av-ph" aria-hidden="true"><img src="img/lucia.jpg" alt=""></span>' : '<span class="av" aria-hidden="true">' + initials() + '</span>'; }
function initials() { return esc((S.user.nombre || ' ')[0] + ((S.user.apellidos || '')[0] || '')); }
function backLabel() { var prev = S.stack[S.stack.length - 2]; if (prev && prev.r === 'categoria') return CAT[prev.p.cat].name; return prev ? (TITLES[prev.r] || 'Volver') : 'Volver'; }
function stepper(n, label) {
  var s = '<div class="stepper" aria-label="Paso ' + n + ' de 3"><div class="steps">';
  for (var i = 1; i <= 3; i++) s += '<span class="' + (i <= n ? 'on' : '') + '"></span>';
  return s + '</div><span class="step-l">Paso ' + n + ' de 3 · ' + label + '</span></div>';
}
function seg(opts, cur, a) {
  return '<div class="seg" role="tablist">' + opts.map(function (o) {
    return '<button role="tab" aria-selected="' + (o[0] === cur) + '" class="' + (o[0] === cur ? 'on' : '') + '" ' + act(a, o[0]) + '>' + o[1] + '</button>';
  }).join('') + '</div>';
}
function btn(label, attrs, cls) { return '<button class="btn ' + (cls || '') + '" ' + (attrs || '') + '>' + label + '</button>'; }
function notice(html, cls) { return '<div class="notice ' + (cls || '') + '">' + ICON.info + '<div>' + html + '</div></div>'; }
function empty(title, text, cta) {
  return '<div class="empty"><div class="empty-ic" aria-hidden="true">' + ICON.spark + '</div><div class="empty-t">' + esc(title) + '</div><p>' + text + '</p>' + (cta || '') + '</div>';
}
function lrow(title, sub, attrs, lead) {
  return '<button class="lrow" ' + attrs + '>' + (lead || '') + '<span class="lrow-t"><span class="lrow-n">' + title + '</span>' + (sub ? '<span class="lrow-s">' + sub + '</span>' : '') + '</span>' + ICON.chev + '</button>';
}
function monthLabel(m, short) {
  if (S.member && S.prefs.fechas && !isPreview()) return 'Mes ' + m + ' · ' + (short ? fMYs(mStart(m)) : fMY(mStart(m)));
  return 'Mes ' + m;
}
function compRow(c, o) {
  o = o || {};
  var it = o.preview ? null : item(c.id), st = it ? it.status : null;
  var sub = TYPES[c.type].label + (o.month ? ' · Mes ' + c.m : '');
  if (it && (st === 'reservado' || st === 'cambio') && it.appt) sub += ' · ' + fDay(it.appt.date) + ', ' + it.appt.time;
  if (it && st === 'completado' && it.doneAt) sub += ' · ' + fDate(it.doneAt);
  var cta = '';
  if (!o.noCta && it) {
    if (st === 'pendiente') cta = btn('Reservar', go('reservar-2', { id: c.id }), 'btn-sm btn-dark');
    else if (st === 'reservado' || st === 'cambio') cta = btn('Ver cita', go('cita', { id: c.id }), 'btn-sm');
    else if (st === 'disponible') cta = btn('Ver', go('beneficio', { id: c.id }), 'btn-sm');
  }
  return '<div class="crow">' + glyph(c.type, st) + '<div class="crow-t"><div class="crow-n">' + esc(c.label) + '</div><div class="crow-s">' + esc(sub) + '</div>' + (st ? '<div class="crow-p">' + pill(st) + '</div>' : '') + '</div>' + cta + '</div>';
}
function planStrip(pid) {
  var s = '<div class="strip" aria-hidden="true">';
  PLAN[pid].months.forEach(function (mo, i) {
    var g = mo ? monthComps(pid, i + 1).map(function (c) { return glyph(c.type, null, 12); }).join('') : '<i></i>';
    s += '<span class="strip-c' + (mo ? '' : ' off') + '"><span class="strip-g">' + g + '</span><span class="strip-n">' + (i + 1) + '</span></span>';
  });
  return s + '</div>';
}
function apptHome(c) {
  var it = item(c.id), d = it.appt.date, ph = PHOTOS.cita[c.type] || PHOTOS.cita.tratamiento;
  return '<button class="appt" ' + go('cita', { id: c.id }) + '><span class="appt-tx"><span class="lbl">' + TYPES[c.type].label + ' · Mes ' + c.m + '</span><span class="appt-t">' + it.appt.time + '</span><span class="appt-d">' + cap(DIAL[d.getDay()]) + ' ' + d.getDate() + ' ' + MES[d.getMonth()] + ' ' + DEMO_TAG + '</span><span class="appt-n">' + esc(c.label) + '</span>' + pill(it.status) + '</span>' + img(ph) + '</button>';
}
function apptCard(c, i) {
  var it = item(c.id), d = it.appt.date, ph = i === 0 ? PHOTOS.reserva : (PHOTOS.cita[c.type] || PHOTOS.cita.tratamiento);
  var h = '<article class="rcard">' + img(ph) + '<div class="rsh"><div class="sec-h"><span class="lbl">' + cap(DIAL[d.getDay()]) + ' ' + d.getDate() + ' ' + MES[d.getMonth()] + ' · Mes ' + c.m + '</span>' + pill(it.status) + '</div><span class="rt">' + it.appt.time + '</span><h3>' + esc(c.label) + '</h3><span class="rmeta">' + ICON.pin + 'AGE Clinic ' + DEMO_TAG + '</span>';
  if (it.status === 'cambio') h += '<p class="fine" style="margin-top:6px">Has pedido cambiarla al ' + fDay(it.change.date) + ', ' + it.change.time + '. Falta la confirmación de la clínica.</p>';
  h += '<div class="racts">' + btn('Ver detalle', go('cita', { id: c.id }), 'btn-sm btn-dark') + (it.status === 'reservado' ? btn('Cambiar fecha', go('reservar-2', { id: c.id, mode: 'cambio' }), 'btn-sm btn-beige') : '') + '<button class="link" ' + act('sheet', 'cancel:' + c.id) + '>Cancelar</button></div></div></article>';
  return h;
}
function segBar() {
  var s = '<div class="segbar" aria-hidden="true">';
  plannedComps().filter(function (c) { return clinical(c.type); }).forEach(function (c) { s += '<span class="sb-' + ST[item(c.id).status].c + '"></span>'; });
  return s + '</div>';
}
function legendTypes() {
  return '<div class="legend">' + ['tratamiento', 'revision', 'regalo', 'recompensa'].map(function (t) { return '<span>' + glyph(t, null, 16) + TYPES[t].label + '</span>'; }).join('') + '</div>';
}

/* ---------- títulos ---------- */
var TITLES = { socios: 'Exclusivo para socios', promo: 'Promoción', categoria: 'Categoría', bienvenida: 'Bienvenida', registro: 'Crear cuenta', login: 'Iniciar sesión', inicio: 'Inicio', notificaciones: 'Notificaciones', membresias: 'Membresías', comparar: 'Comparar', plan: 'Membresía', activar: 'Activar', activada: 'Activada', cambiar: 'Cambiar plan',
  recorrido: 'Mi recorrido', mes: 'Mes', tratamientos: 'Tratamientos', tratamiento: 'Tratamiento', 'mis-tratamientos': 'Incluidos', reservas: 'Reservas', 'reservar-1': 'Nueva reserva', 'reservar-2': 'Nueva reserva', 'reservar-3': 'Nueva reserva', 'reserva-ok': 'Reserva', cita: 'Cita',
  perfil: 'Perfil', datos: 'Datos personales', 'mi-membresia': 'Mi membresía', historial: 'Historial', beneficios: 'Beneficios', beneficio: 'Beneficio', ajustes: 'Ajustes', leyenda: 'Leyenda' };
var FLOW = ['reservar-1', 'reservar-2', 'reservar-3', 'reserva-ok', 'activar', 'activada'];

/* ---------- pantallas ---------- */
var SCR = {};

/* B · Inicio */
function ring(cyc) {
  var r = 42, c = 2 * Math.PI * r, d = c * cyc / 12;
  return '<div class="ring" role="img" aria-label="Mes ' + cyc + ' de 12"><svg viewBox="0 0 96 96" aria-hidden="true"><circle cx="48" cy="48" r="' + r + '" fill="none" stroke="#c7c7c7" stroke-width="3"></circle><circle cx="48" cy="48" r="' + r + '" fill="none" stroke="#431e0c" stroke-width="4" stroke-linecap="round" stroke-dasharray="' + d.toFixed(1) + ' ' + c.toFixed(1) + '"></circle></svg><div class="n"><b>' + cyc + '</b><span>de 12</span></div></div>';
}
function doneMonth(pid, m) { return monthComps(pid, m).every(function (c) { var st = item(c.id).status; return st === 'completado' || st === 'canjeado'; }); }
function monthDots() {
  var s = '<div class="dots" aria-hidden="true">', pid = S.member.plan, cyc = S.member.cycle;
  for (var m = 1; m <= 12; m++) {
    var cs = monthComps(pid, m), cls = '';
    if (m === cyc) cls = 'c'; else if (!cs.length) cls = 'o'; else if (m < cyc && doneMonth(pid, m)) cls = 'd';
    s += '<i class="' + cls + '"></i>';
  }
  return s + '</div>';
}
function started() { return plannedComps().some(function (c) { return ['reservado', 'completado', 'cambio', 'canjeado'].indexOf(item(c.id).status) > -1; }); }
function headline(p, cyc) {
  var mc = monthComps(p.id, cyc);
  if (cyc === 1 && !started()) return 'Bienvenida a tu <b>mes 1</b>.';
  if (!mc.length) return 'Mes ' + cyc + ', <b>sin actividades</b>.';
  return 'Este mes te toca <b>' + mc.map(function (c) { return esc(CATALOG[c.key].name); }).join(' y ') + '</b>.';
}
SCR.inicio = function () {
  if (!S.member) return inicioVisitante();
  var p = PLAN[S.member.plan], cyc = S.member.cycle, ns = notifs(), pr = progress();
  var badge = (!S.readNotifs && ns.length) ? '<span class="badge">' + ns.length + '</span>' : '';
  var hl = headline(p, cyc), len = hl.replace(/<[^>]+>/g, '').length;
  var h = '<div class="h-head">' + photo('inicio') + '<div class="h-in"><div class="top-row">' + avatar() + '' +
    '<button class="icon-btn" ' + go('notificaciones') + ' aria-label="Notificaciones' + (badge ? ', ' + ns.length + ' nuevas' : '') + '">' + ICON.bell + badge + '</button></div>' +
    '<p class="hello">Hola, ' + esc(S.user.nombre) + '</p><p class="today">' + fLong(today()) + ' · ' + DEMO_TAG + '</p><h1' + (len > 30 ? ' class="long"' : '') + '>' + hl + '</h1></div></div><div class="home">';
  h += '<section class="mem" aria-label="Membresía activa"><div class="mem-top"><div><span class="lbl">Tu membresía</span><h2>' + esc(p.name) + '</h2><p class="mem-s">' + priceM(p.id) + ' · desde el ' + fDate(S.member.act) + '</p></div>' + ring(cyc) + '</div>' +
    '<div class="mstats"><div><b>' + pr.cd + '/' + pr.cl + '</b><span>actos<br>clínicos</span></div><div><b>' + pr.bd + '/' + pr.bn + '</b><span>beneficios<br>canjeados</span></div></div>' +
    '<button class="link" ' + go('mi-membresia') + '>Ver mi membresía</button></section>';
  if (cyc === 1 && !started()) h += notice('<b>Tu membresía ya está activa.</b> Estás en el Mes 1 de 12. El primer paso es reservar ' + esc(monthComps(p.id, 1).filter(function (c) { return clinical(c.type); }).map(function (c) { return c.label; }).join(' y ')) + '.');
  var up = upcomingAppts(), pend = byStatus(['pendiente']);
  if (up.length) h += '<div class="h-sec"><h2>Próxima cita</h2><button class="link" data-tab="reservas">Mis reservas</button></div>' + apptHome(up[0]);
  else if (pend.length) {
    var c0 = pend[0];
    h += '<div class="h-sec"><h2>Siguiente paso</h2></div><div class="card"><span class="lbl">' + TYPES[c0.type].label + ' · Mes ' + c0.m + '</span><h2>Reserva ' + esc(c0.label) + '</h2><p class="fine">Incluido en tu plan. Aún no tiene cita.</p>' + btn('Elegir fecha y hora', go('reservar-2', { id: c0.id }), 'btn-dark btn-block') + '</div>';
  }
  var mc = monthComps(p.id, cyc), nx = nextMonthWith(cyc);
  h += '<div class="h-sec"><h2>Este mes</h2><button class="link" ' + go('mes', { m: cyc }) + '>Ver detalle</button></div>';
  if (mc.length) h += '<div class="card tight">' + mc.map(function (c) { return compRow(c); }).join('') + '</div>';
  else h += '<div class="card neutral-card"><p>Tu plan no programa actividades en el Mes ' + cyc + '. No tienes nada pendiente.</p>' + (nx ? '<button class="link" ' + go('mes', { m: nx }) + '>Próximo hito: Mes ' + nx + ' · ' + esc(p.months[nx - 1][0]) + '</button>' : '') + '</div>';
  h += '<div class="duo"><button class="tile tall" data-tab="recorrido"><span><span class="tile-t">Mi recorrido</span><span class="tile-s" style="display:block">' + (nx ? 'Siguiente: Mes ' + nx + ' · ' + esc(typeSummary(monthComps(p.id, nx))) : 'Último mes con actividades') + '</span></span>' + monthDots() + '</button>' +
    '<div class="tiles3"><button class="tile" ' + go('reservar-1') + '>' + ICON.plus + '<span class="tile-t">Reservar</span></button><button class="tile" ' + go('tratamientos') + '>' + ICON.drop + '<span class="tile-t">Tratamientos</span></button><button class="tile" ' + go('membresias') + '>' + ICON.cards + '<span class="tile-t">Membresías</span></button></div></div>';
  var nxt = [], m = cyc;
  while (nxt.length < 2 && (m = nextMonthWith(m))) nxt.push(m);
  h += '<div class="h-sec"><h2>Próximamente</h2></div>' + (nxt.length ? '<div class="list">' + nxt.map(function (n) {
    return lrow('Mes ' + n + (S.prefs.fechas ? ' <span class="muted">· desde el ' + fDate(mStart(n)) + '</span>' : ''), esc(p.months[n - 1][0]), go('mes', { m: n }), '<span class="lockc">' + ICON.lock + '</span>');
  }).join('') + '</div>' : '<p class="neutral">Es el último mes con actividades de tu ciclo. La renovación está por confirmar.</p>');
  if (activePromos().length) h += '<button class="excl" ' + go('socios') + '>' + photo('socios') + '<span class="excl-k">Exclusivo para socios</span><span class="excl-t">Tratamientos adicionales para socios</span>' + ctaPhoto('Ver promociones', '', 'span') + '</button>';
  h += '<p class="fine">Actos clínicos = tratamientos y revisiones. Los regalos y Rewards se cuentan aparte.</p>';
  return { html: h + '</div>' };
};
function inicioVisitante() {
  var h = '<div class="h-head">' + photo('membresias') + '<div class="h-in"><div class="top-row">' + avatar() + '<button class="icon-btn" ' + go('notificaciones') + ' aria-label="Notificaciones">' + ICON.bell + '</button></div><p class="hello">Hola, ' + esc(S.user.nombre) + '</p><h1>Elige tu <b>membresía</b>.</h1></div></div><div class="home">';
  h += '<p class="lead" style="margin-top:-8px">Cada membresía ordena tus tratamientos, revisiones y beneficios en un recorrido de 12 meses que empieza el día que la activas.</p>' + catList();
  h += '<p class="fine">Precios mensuales. Duración, permanencia y renovación por confirmar.</p><div class="list">' + lrow('Ver todos los tratamientos', 'Qué incluye cada plan', go('tratamientos')) + '</div>';
  return { html: h + '</div>' };
}

SCR.notificaciones = function () {
  var ns = notifs();
  var h = nav('Notificaciones', { right: ns.length ? '<button class="link" ' + act('readAll') + '>Marcar leídas</button>' : '' }) + '<div class="body">';
  h += '<h1><b>Notificaciones</b></h1>';
  if (!S.member) return { html: h + empty('No tienes notificaciones', 'Cuando actives una membresía verás aquí recordatorios de citas, tratamientos pendientes y beneficios.', btn('Explorar membresías', go('membresias'), 'btn-dark')) + '</div>' };
  if (!ns.length) return { html: h + empty('Todo al día', 'No hay recordatorios. Puedes elegir qué avisos recibir en Preferencias.', btn('Preferencias', go('ajustes'))) + '</div>' };
  h += '<p class="fine">Recordatorios simulados · ' + DEMO_TAG + '</p><div class="list">';
  ns.forEach(function (n) {
    h += '<button class="nrow' + (S.readNotifs ? ' read' : '') + '" ' + n.a + '><span class="nrow-i">' + NICON[n.i] + '</span><span class="lrow-t"><span class="lrow-n">' + esc(n.t) + '</span><span class="lrow-s">' + esc(n.x) + '</span></span>' + (S.readNotifs ? '' : '<span class="dot" aria-label="Sin leer"></span>') + '</button>';
  });
  return { html: h + '</div></div>' };
};

/* A · Membresías (V4: categoría → modalidad → ficha) */
function catList() {
  return '<div class="cats">' + CATEGORIES.map(function (c) {
    var single = c.plans.length === 1, target = single ? go('plan', { id: c.plans[0] }) : go('categoria', { cat: c.id });
    var price = (single ? '' : 'Desde ') + priceM(c.plans[0]), ph = PHOTOS.cat[c.id];
    var mine = S.member && c.plans.indexOf(S.member.plan) > -1 ? '<span class="tag">Tu plan</span>' : '';
    var pr = '<span class="cat-pr">' + (single ? '' : '<span class="cat-from">Desde</span>') + '<span class="cat-p">' + priceM(c.plans[0]).replace(' €/mes', ' <small>€/mes</small>') + '</span></span>';
    var nm = '<span class="cat-n">' + c.name + mine + '</span>', txt = '<span class="cat-t"><span class="cat-l">' + esc(c.line) + '</span></span>';
    if (c.id === 'premium') return '<button class="mcard cat-prem" ' + target + '>' + img(ph, 'mcard-img', ph[2]) + '<span class="mcard-in"><span class="mcard-txt">' + nm + '<span class="mcard-row">' + txt + pr + '</span></span>' + ctaPhoto('Lo quiero todo', '', 'span') + '</span></button>';
    return '<button class="mcard cat" ' + target + '>' + img(ph, 'mcard-img', ph[2]) + '<span class="mcard-in"><span class="mcard-txt">' + nm + '<span class="mcard-row">' + txt + '<span class="cat-go">' + pr + ICON.chev + '</span></span></span></span></button>';
  }).join('') + '</div>';
}
SCR.membresias = function () {
  var h = nav('Membresías') + '<div class="body"><div class="stack"><h1>¿Qué quieres <b>cuidar</b>?</h1><p class="lead">Elige una categoría para ver sus planes.</p></div>' + catList();
  h += '<p class="fine">Precios mensuales. Duración, permanencia y renovación por confirmar.' + (S.auth ? '' : ' Puedes explorar sin cuenta; para activar una membresía te pediremos crear una cuenta o iniciar sesión.') + '</p>';
  return { html: h + '</div>' };
};
function incName(k, n) { return esc(CATALOG[k].name) + (n > 1 ? ' <span class="inc-x">×' + n + '</span>' : ''); }
SCR.categoria = function (pp) {
  var c = CAT[pp.cat], cnt = c.plans.map(function (pid) { return keyCounts(pid); });
  var common = Object.keys(cnt[0]).filter(function (k) { return cnt[1][k] === cnt[0][k]; });
  var h = nav(c.name, { over: true }) + '<div class="hero short">' + img(PHOTOS.cat[c.id], '', PHOTOS.cat[c.id][3]) + '</div><div class="body sheetbody"><div class="stack"><span class="kicker">Membresía</span><h1>' + c.name + '</h1><p class="lead">' + esc(c.line) + '.</p></div>';
  h += '<div class="common"><span class="lbl">En común en los dos planes</span><span>' + common.map(function (k) { return incName(k, cnt[0][k]); }).join(' · ') + '</span></div>';
  h += '<div class="stack">' + c.plans.map(function (pid, i) {
    var p = PLAN[pid], mine = S.member && S.member.plan === pid ? '<span class="tag">Tu plan</span>' : '';
    var own = Object.keys(cnt[i]).filter(function (k) { return common.indexOf(k) < 0; });
    return '<button class="mod" ' + go('plan', { id: pid }) + '><span class="mod-h"><span class="mod-n">' + esc(p.name) + mine + '</span><span class="mod-p">' + priceM(pid) + '</span></span>' +
      '<span class="eyebrow">Además incluye</span><span class="mod-list">' + own.map(function (k) { return '<span class="mod-i">' + glyph(CATALOG[k].type, null, 16) + '<span>' + incName(k, cnt[i][k]) + '</span></span>'; }).join('') + '</span>' +
      '<span class="mod-go">Ver plan' + ICON.chev + '</span></button>';
  }).join('') + '</div>';
  h += '<p class="fine">El recorrido de 12 meses y las condiciones están en la ficha de cada plan.</p>';
  return { html: h + '</div>' };
};
function incRows(pid, types) {
  var cnt = keyCounts(pid, types), keys = Object.keys(cnt);
  if (!keys.length) return '<p class="neutral">No incluye elementos de este tipo.</p>';
  return '<div class="card tight">' + keys.map(function (k) {
    return '<button class="crow as-btn" ' + go('tratamiento', { key: k }) + '>' + glyph(CATALOG[k].type, null) + '<span class="crow-t"><span class="crow-n">' + incName(k, cnt[k]) + '</span></span>' + ICON.chev + '</button>';
  }).join('') + '</div>';
}
function accSec(id, title, meta, body) {
  var open = !!(S.ui.planOpen || {})[id];
  return '<section class="acc"><button class="acc-h" ' + act('planSec', id) + ' aria-expanded="' + open + '" aria-controls="acc-' + id + '"><span class="acc-t"><b>' + title + '</b><span class="muted">' + meta + '</span></span><span class="acc-i" aria-hidden="true">' + ICON.down + '</span></button>' + (open ? '<div class="acc-b" id="acc-' + id + '">' + body + '</div>' : '') + '</section>';
}
SCR.plan = function (pp) {
  var p = PLAN[pp.id], k = counts(p.id), mine = S.member && S.member.plan === p.id, cat = catOf(p.id), prem = p.id === 'premium';
  var h = nav(p.name, { over: true }) + '<div class="hero">' + img(PHOTOS.cat[cat.id], '', PHOTOS.cat[cat.id][3]) + '</div><div class="body sheetbody"><div><span class="kicker">Membresía · ' + cat.name + (mine ? ' · tu plan actual' : '') + '</span><h1 style="margin-top:10px">' + esc(p.name) + '</h1><div class="price">' + priceM(p.id) + '</div><p class="lead" style="margin-top:8px">Recorrido de 12 meses desde la activación.</p></div>';
  h += '<div class="stats">' + ['tratamiento', 'revision', 'regalo', 'recompensa'].map(function (t) {
    return '<div class="stat">' + glyph(t, null, 18) + '<b>' + (t === 'recompensa' ? (k[t] ? 'Sí' : '—') : k[t]) + '</b><span>' + (t === 'recompensa' ? 'Rewards' : TYPES[t].plural) + '</span></div>';
  }).join('') + '</div>';
  if (prem) h += notice('Premium incluye exactamente lo que aparece en esta ficha: un tratamiento o servicio en cada uno de los 12 meses. No incluye todos los tratamientos de AGE Club.');
  var nb = k.revision + k.regalo + k.recompensa;
  var rec = '<div class="plist">' + p.months.map(function (mo, i) {
    return '<div class="plist-r' + (mo ? '' : ' off') + '"><span class="plist-m">Mes ' + (i + 1) + '</span><span class="plist-c">' +
      (mo ? monthComps(p.id, i + 1).map(function (c) { return '<span class="plist-i">' + glyph(c.type, null, 16) + esc(c.label) + '</span>'; }).join('') : '<span class="muted">Sin actividades</span>') + '</span></div>';
  }).join('') + '</div>' + (S.auth ? '<button class="link" ' + act('previewRec', p.id) + '>Ver en Mi recorrido</button>' : '');
  var cond = '<dl class="dl">' + [['Importe', priceM(p.id) + ' (según documento)'], ['Periodicidad del pago', 'Mensual'], ['Duración, permanencia y renovación', tbd()], ['Cuándo se reserva cada mes', tbd('Hipótesis: al empezar el mes')], ['Cambios de plan', tbd()], ['Descripción clínica de cada servicio', tbd('Pendiente de AGE Clinic')]].map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>'; }).join('') + '</dl>';
  h += '<div class="accs">' + accSec('trat', 'Tratamientos incluidos', plural(k.tratamiento, 'tratamiento', 'tratamientos'), incRows(p.id, ['tratamiento'])) +
    accSec('rev', 'Revisiones y beneficios', plural(nb, 'elemento', 'elementos'), incRows(p.id, ['revision', 'regalo', 'recompensa'])) +
    accSec('rec', 'Recorrido de 12 meses', plural(k.activos, 'mes con actividad', 'meses con actividad'), rec) +
    accSec('cond', 'Condiciones', 'Importe mensual · resto por confirmar', cond) + '</div></div>';
  var lab = prem ? 'Lo quiero todo' : 'Elegir esta membresía', cta;
  if (!S.auth) cta = btn(lab, go('registro', { plan: p.id }), 'btn-dark btn-block');
  else if (!S.member) cta = btn(lab, go('activar', { id: p.id }), 'btn-dark btn-block');
  else if (mine) cta = btn('Ver mi recorrido', 'data-tab="recorrido"', 'btn-dark btn-block');
  else cta = btn(prem ? 'Lo quiero todo' : 'Cambiar a este plan', go('cambiar', { id: p.id }), 'btn-dark btn-block');
  h += '<div class="foot">' + cta + '</div>';
  return { html: h };
};
SCR.activar = function (pp) {
  var p = PLAN[pp.id], t = today();
  var first = monthComps(p.id, 1).map(function (c) { return c.label; }).join(' + ');
  var h = nav('Activar membresía', { close: true }) + '<div class="body"><div><span class="kicker">Resumen de tu membresía</span><h1 style="margin-top:10px">' + esc(p.name) + '</h1><div class="price">' + priceM(p.id) + '</div></div>';
  h += '<dl class="dl"><div><dt>Inicio del ciclo</dt><dd>Hoy, ' + fDate(t) + ' ' + DEMO_TAG + '</dd></div><div><dt>Mes 1</dt><dd>' + esc(first) + '</dd></div><div><dt>Mes 12</dt><dd>' + fMY(addM(t, 11)) + ' · ' + esc(p.months[11][0]) + '</dd></div><div><dt>Titular</dt><dd>' + esc(S.user.nombre + ' ' + S.user.apellidos) + '</dd></div><div><dt>Pago</dt><dd>' + tbd('No se simula el pago') + '</dd></div></dl>';
  h += notice('Importe mensual según el documento de AGE Clinic. Duración, permanencia y renovación por confirmar. Esta activación solo crea tu recorrido en el prototipo.');
  var pr = S.ui.promo || {};
  h += '<section class="acc promo"><button class="acc-h" ' + act('promoToggle') + ' aria-expanded="' + !!pr.open + '" aria-controls="promo-b"><span class="acc-t"><b>¿Tienes un código de descuento?</b></span><span class="acc-i" aria-hidden="true">' + ICON.down + '</span></button>';
  if (pr.open) {
    if (pr.state === 'ok') h += '<div class="acc-b" id="promo-b"><div class="promo-ok"><span class="pill st-res">Código «' + esc(pr.code) + '» registrado</span><button class="link" ' + act('promoRemove') + '>Quitar código</button></div><p class="fine">' + DEMO_TAG + ' Simulación: la validación real y el descuento dependerán de la integración técnica. El importe mostrado no cambia.</p></div>';
    else h += '<div class="acc-b" id="promo-b"><div class="field' + (pr.state === 'err' ? ' err' : '') + '"><label for="f-promo">Código de descuento</label><div class="promo-row"><input id="f-promo" type="text" autocomplete="off" autocapitalize="characters" spellcheck="false" value="' + esc(pr.code || '') + '"' + (pr.state === 'err' ? ' aria-invalid="true" aria-describedby="e-promo"' : '') + '>' + btn('Aplicar', act('promoApply'), 'btn-sm') + '</div>' +
      (pr.state === 'err' ? '<span class="ferr" id="e-promo">Código no válido. Usa entre 4 y 20 letras o números, sin espacios ni símbolos.</span>' : '<span class="fhint">Validación simulada en este prototipo.</span>') + '</div></div>';
  }
  h += '</section>';
  h += '<label class="chk" for="ack"><input type="checkbox" id="ack" ' + act('ack') + (S.ui.ack ? ' checked' : '') + '><span>Entiendo que es una activación simulada y que las condiciones están por confirmar.</span></label></div>';
  h += '<div class="foot">' + btn('Activar membresía', act('activate', p.id) + (S.ui.ack ? '' : ' disabled'), 'btn-dark btn-block') + '</div>';
  return { html: h, flow: true };
};
SCR.activada = function () {
  var p = PLAN[S.member.plan];
  var h = '<div class="hero short">' + photo('activada') + '</div><div class="sheetbody"><span class="ok-ic">' + ICON.check + '</span><div class="stack"><h1>Membresía <b>activada</b></h1><p class="lead">' + esc(p.name) + ' · Mes 1 de 12 desde hoy, ' + fDate(S.member.act) + '. ' + DEMO_TAG + '</p></div>';
  h += '<section class="sec"><h2>Tu Mes 1</h2><div class="card tight">' + monthComps(p.id, 1).map(function (c) { return compRow(c); }).join('') + '</div></section>';
  h += notice('Tu inicio, tu recorrido y tus tratamientos ya muestran este plan.') + '</div>';
  h += '<div class="foot">' + btn('Ir a mi inicio', act('toTab', 'inicio'), 'btn-dark btn-block') + '</div>';
  return { html: h, flow: true };
};
SCR.cambiar = function (pp) {
  var cur = PLAN[S.member.plan], nw = PLAN[pp.id];
  function col(p, l) { return '<div class="cmpcard"><div class="eyebrow">' + l + '</div><b>' + esc(p.name) + '</b><span>' + priceM(p.id) + '</span><span class="muted">' + countsText(p.id) + '</span></div>'; }
  var h = nav('Cambiar membresía') + '<div class="body"><h1>Cambiar de <b>membresía</b></h1><div class="two">' + col(cur, 'Actual') + col(nw, 'Nueva') + '</div>';
  h += notice('<b>Regla por confirmar.</b> AGE Clinic no ha definido si se puede cambiar de plan ni cómo afecta al ciclo. En esta simulación el nuevo plan empieza en el Mes 1 hoy, las citas reservadas se anulan y el historial se conserva.', 'warn');
  var up = upcomingAppts();
  if (up.length) h += '<p class="neutral">Se anularán ' + plural(up.length, 'cita reservada', 'citas reservadas') + ': ' + up.map(function (c) { return esc(c.label); }).join(', ') + '.</p>';
  h += '</div><div class="foot two-btn">' + btn('Cancelar', 'data-back') + btn('Confirmar cambio', act('changePlan', nw.id), 'btn-dark') + '</div>';
  return { html: h };
};

/* 0 · Acceso (simulado) */
var BRAND_MARK = '<img class="nav-mark" src="brand/BrandMarck_Club_Black_V01.png" alt="AGE Club">';
SCR.bienvenida = function () {
  var h = '<div class="welcome">' + photo('bienvenida', 'wl-bg') + '<img class="wl-logo" src="brand/Logo_Club-AgeClinic_White.png" alt="AGE Club · AGE Clinic">' +
    '<div class="wl-mid"><h1 class="wl-h">Una nueva forma de llevarte al <b>siguiente nivel</b>.</h1><p class="lead">Tu membresía de medicina estética, con un recorrido de 12 meses.</p></div>' +
    '<div class="wl-act">' + ctaPhoto('Explorar membresías', 'data-join ' + go('membresias')) +
    '<button class="btn-line" ' + go('registro') + '>Crear cuenta</button>' +
    '<p class="wl-sec">¿Ya tienes cuenta? <button class="link wl-login" ' + go('login') + '>Iniciar sesión</button></p></div></div>';
  return { html: h, flow: true };
};
function fieldHtml(id, label, type, ac, hint) {
  var f = S.ui.form || {}, e = S.ui.errs || {};
  return '<div class="field' + (e[id] ? ' err' : '') + '"><label for="f-' + id + '">' + label + '</label><input id="f-' + id + '" type="' + type + '" autocomplete="' + ac + '" value="' + esc(f[id] || '') + '"' + (e[id] ? ' aria-invalid="true" aria-describedby="e-' + id + '"' : '') + '>' +
    (e[id] ? '<span class="ferr" id="e-' + id + '">' + e[id] + '</span>' : (hint ? '<span class="fhint">' + hint + '</span>' : '')) + '</div>';
}
function passHtml(ac, hint) {
  var f = S.ui.form || {}, e = S.ui.errs || {};
  return '<div class="field' + (e.pass ? ' err' : '') + '"><label for="f-pass">Contraseña</label><div class="pw"><input id="f-pass" type="' + (S.ui.showPass ? 'text' : 'password') + '" autocomplete="' + ac + '" value="' + esc(f.pass || '') + '"' + (e.pass ? ' aria-invalid="true" aria-describedby="e-pass"' : '') + '><button type="button" class="pw-t" ' + act('showPass') + ' aria-pressed="' + !!S.ui.showPass + '">' + (S.ui.showPass ? 'Ocultar' : 'Mostrar') + '</button></div>' +
    (e.pass ? '<span class="ferr" id="e-pass">' + e.pass + '</span>' : (hint ? '<span class="fhint">' + hint + '</span>' : '')) + '</div>';
}
SCR.registro = function (pp) {
  var f = S.ui.form || {}, e = S.ui.errs || {}, plan = pp.plan ? PLAN[pp.plan] : null;
  var h = '<div class="flowcol">' + nav('Crear cuenta', { right: BRAND_MARK }) + '<div class="body"><div class="stack"><h1>Crea tu <b>cuenta</b></h1><p class="lead">Solo lo necesario para gestionar tu membresía.</p></div>';
  if (plan) h += '<div class="ctx"><span class="lbl">Membresía elegida</span><b>' + esc(plan.name) + ' · ' + priceM(plan.id) + '</b></div>';
  if (e._form) h += notice(e._form, 'warn');
  h += '<form class="form" id="reg-form" novalidate>' + fieldHtml('nombre', 'Nombre', 'text', 'given-name') + fieldHtml('apellidos', 'Apellidos', 'text', 'family-name') + fieldHtml('email', 'Correo electrónico', 'email', 'email') + passHtml('new-password', 'Mínimo 8 caracteres.') +
    '<div class="field' + (e.terms ? ' err' : '') + '"><label class="chk" for="f-terms"><input type="checkbox" id="f-terms"' + (f.terms ? ' checked' : '') + (e.terms ? ' aria-invalid="true" aria-describedby="e-terms"' : '') + '><span>Acepto las condiciones y la política de privacidad. <span class="tbd">Textos por confirmar</span></span></label>' + (e.terms ? '<span class="ferr" id="e-terms">' + e.terms + '</span>' : '') + '</div></form>';
  h += '<button class="link" ' + go('login', plan ? { plan: pp.plan } : null) + '>¿Ya tienes cuenta? Inicia sesión</button><p class="demo-hint">' + DEMO_TAG + '<span>Registro simulado: los datos no se guardan.</span></p></div>';
  h += '<div class="foot">' + btn('Crear cuenta', act('register', pp.plan || ''), 'btn-dark btn-block') + '</div></div>';
  return { html: h, flow: true };
};
SCR.login = function (pp) {
  var e = S.ui.errs || {};
  var h = '<div class="flowcol">' + nav('Iniciar sesión', { right: BRAND_MARK }) + '<div class="body"><div class="stack"><h1>Hola de <b>nuevo</b></h1><p class="lead">Accede para ver tu membresía y tu recorrido.</p></div>';
  if (e._form) h += notice(e._form, 'warn');
  h += '<form class="form" id="login-form" novalidate>' + fieldHtml('email', 'Correo electrónico', 'email', 'username') + passHtml('current-password') + '</form>';
  h += '<div class="lnks"><button class="link" ' + act('toast', 'Recuperación de contraseña: proceso por confirmar') + '>He olvidado mi contraseña</button>';
  h += '<button class="link" ' + go('registro', pp.plan ? { plan: pp.plan } : null) + '>¿No tienes cuenta? Crear cuenta</button></div>';
  h += '<p class="demo-hint">' + DEMO_TAG + '<span>Cuenta de prueba: ' + esc(DEMO.user.email) + ' · cualquier contraseña</span><button class="link" ' + act('fillDemo') + '>Rellenar</button></p></div>';
  h += '<div class="foot">' + btn('Iniciar sesión', act('login', pp.plan || ''), 'btn-dark btn-block') + '</div></div>';
  return { html: h, flow: true };
};
function readForm(ids) {
  var f = S.ui.form || {};
  ids.forEach(function (k) { var i = document.getElementById('f-' + k); if (i) f[k] = i.type === 'checkbox' ? i.checked : i.value.trim(); });
  S.ui.form = f; return f;
}
var EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
function validateReg(f) {
  var e = {};
  if (!f.nombre) e.nombre = 'Escribe tu nombre.';
  if (!f.apellidos) e.apellidos = 'Escribe tus apellidos.';
  if (!EMAIL_RE.test(f.email || '')) e.email = 'Escribe un correo válido, por ejemplo nombre@dominio.com.';
  if ((f.pass || '').length < 8) e.pass = 'La contraseña debe tener al menos 8 caracteres.';
  if (!f.terms) e.terms = 'Acepta las condiciones para continuar.';
  return e;
}
var LOGIN_ERR = 'No encontramos una cuenta con ese correo o la contraseña no es correcta.';
function snapshot() { return { member: S.member, items: S.items, log: S.log, archive: S.archive, user: S.user, prefs: S.prefs, readNotifs: S.readNotifs, promoReqs: S.promoReqs }; }
function enterApp(email, snap, user) {
  reset(); S.scenario = 'cuenta';
  if (snap) { S.member = snap.member; S.items = snap.items; S.log = snap.log; S.archive = snap.archive; S.user = snap.user; S.prefs = snap.prefs; S.readNotifs = snap.readNotifs; S.promoReqs = snap.promoReqs || {}; }
  else if (user) S.user = user;
  S.auth = { email: email };
}

/* E · Mi recorrido */
function recPlan() { return S.ui.preview || (S.member && S.member.plan); }
function isPreview() { return !!S.ui.preview && (!S.member || S.ui.preview !== S.member.plan); }
function passFilter(c) { var f = S.ui.recFilter; return f === 'todo' || (f === 'beneficio' ? !clinical(c.type) : c.type === f); }
SCR.recorrido = function () {
  var pid = recPlan();
  if (!pid) {
    return { html: '<div class="top"><h1>Mi <b>recorrido</b></h1></div><div class="body">' + empty('Aún no tienes un recorrido', 'Cuando actives una membresía verás aquí tus 12 meses: qué toca cada mes, qué has reservado y qué has completado.',
      btn('Explorar membresías', go('membresias'), 'btn-dark') + btn('Ver un recorrido de ejemplo', act('previewPlan', 'botox-essential'), 'btn-text')) + '</div>' };
  }
  var pv = isPreview(), p = PLAN[pid], h = '<div class="rec">';
  h += '<div class="rec-hd"><span class="lbl">' + (pv ? 'Vista previa' : 'Mi recorrido') + ' · ' + esc(p.name) + '</span><button class="link" ' + act('sheet', 'plans') + ' aria-haspopup="dialog">Cambiar plan</button></div>';
  if (pv) {
    h += '<h1 style="font-size:52px">' + esc(p.name) + '</h1><p class="rec-of">Recorrido de 12 meses · ' + countsText(pid) + '</p>';
    h += '<div style="margin-top:20px">' + notice('Estás viendo el recorrido de <b>' + esc(p.name) + '</b>. Sin estados ni fechas porque no es tu plan.' + (S.member ? ' <button class="link" ' + act('previewPlan', S.member.plan) + '>Volver a mi plan</button>' : ' <button class="link" ' + go('plan', { id: pid }) + '>Ver membresía</button>')) + '</div>';
  } else {
    var cyc = S.member.cycle, pr = progress(), bar = '';
    for (var i = 1; i <= 12; i++) bar += '<i class="' + (i < cyc ? 'd' : i === cyc ? 'c' : '') + '"></i>';
    h += '<h1>Tu <b>mes ' + cyc + '</b></h1><p class="rec-of">de 12' + (S.prefs.fechas ? ' · ' + fDate(mStart(cyc)) + ' – ' + fDate(mEnd(cyc)) : '') + '</p>' +
      '<div class="bar" aria-hidden="true">' + bar + '</div><div class="figs"><div><b>' + pr.cd + '/' + pr.cl + '</b><span>actos clínicos<br>realizados</span></div><div><b>' + pr.bd + '/' + pr.bn + '</b><span>beneficios<br>canjeados</span></div></div>';
  }
  h += '<div class="rec-ctl">' + seg([['timeline', 'Línea temporal'], ['calendar', 'Calendario']], S.ui.recView, 'recView') +
    '<div class="chips" role="group" aria-label="Filtrar por tipo">' + [['todo', 'Todo'], ['tratamiento', 'Tratamientos'], ['revision', 'Revisiones'], ['beneficio', 'Beneficios']].map(function (f) {
      return '<button class="chip' + (S.ui.recFilter === f[0] ? ' on' : '') + '" aria-pressed="' + (S.ui.recFilter === f[0]) + '" ' + act('recFilter', f[0]) + '>' + f[1] + '</button>';
    }).join('') + '<button class="link" ' + go('leyenda') + '>Leyenda</button></div></div></div>';
  h += S.ui.recView === 'timeline' ? timeline(pid, pv) : calendar(pid, pv);
  return { html: h };
};
var SHORT = { completado: ['realizado', 'realizados'], reservado: ['reservado', 'reservados'], cambio: ['con cambio solicitado', 'con cambio solicitado'], pendiente: ['pendiente de reservar', 'pendientes de reservar'], previsto: ['previsto', 'previstos'], disponible: ['disponible', 'disponibles'], canjeado: ['canjeado', 'canjeados'], futuro: ['próximamente', 'próximamente'] };
function statusSummary(cs) {
  var cnt = {}, order = [];
  cs.forEach(function (c) { var st = item(c.id).status; if (!cnt[st]) { cnt[st] = 0; order.push(st); } cnt[st]++; });
  return order.map(function (st) { return cnt[st] + ' ' + SHORT[st][cnt[st] === 1 ? 0 : 1]; }).join(' · ');
}
function typeSummary(cs) {
  var n = { tratamiento: 0, revision: 0, regalo: 0, recompensa: 0 };
  cs.forEach(function (c) { n[c.type]++; });
  var a = [];
  if (n.tratamiento) a.push(plural(n.tratamiento, 'tratamiento', 'tratamientos'));
  if (n.revision) a.push(plural(n.revision, 'revisión', 'revisiones'));
  if (n.regalo) a.push(plural(n.regalo, 'regalo', 'regalos'));
  if (n.recompensa) a.push('Rewards');
  return a.join(' · ');
}
var LOCK = '<svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true"><rect x="5" y="10.5" width="14" height="10" rx="2" style="fill:none;stroke:currentColor;stroke-width:2.2"></rect><path d="M8.5 10.5V8a3.5 3.5 0 0 1 7 0v2.5" style="fill:none;stroke:currentColor;stroke-width:2.2"></path></svg>';
var TICK = '<svg width="12" height="12" viewBox="0 0 24 24" aria-hidden="true"><path d="M5.5 12.5l4 4 9-9" style="fill:none;stroke:#ffffff;stroke-width:3;stroke-linecap:round;stroke-linejoin:round"></path></svg>';
var TN = { tratamiento: ['tratamiento', 'tratamientos'], revision: ['revisión', 'revisiones'], regalo: ['regalo', 'regalos'], recompensa: ['Rewards', 'Rewards'] };
function curHeadline(cs) {
  var g = {}, order = [];
  cs.forEach(function (c) { var k = c.type + '|' + item(c.id).status; if (!g[k]) { g[k] = 0; order.push(k); } g[k]++; });
  return order.map(function (k) { var t = k.split('|')[0], st = k.split('|')[1], n = g[k]; return n + ' ' + TN[t][n === 1 ? 0 : 1] + ' ' + SHORT[st][n === 1 ? 0 : 1]; }).join(' · ');
}
function curItem(c) {
  var it = item(c.id), st = it.status, a = '';
  if (st === 'pendiente') a = btn('Reservar', go('reservar-2', { id: c.id }), 'btn-sm btn-dark');
  else if (st === 'reservado' || st === 'cambio') a = '<button class="link" ' + go('cita', { id: c.id }) + '>Ver cita</button>';
  else if (st === 'disponible') a = btn('Ver', go('beneficio', { id: c.id }), 'btn-sm');
  var when = it.appt && (st === 'reservado' || st === 'cambio') ? '<span class="crow-s">' + cap(fDay(it.appt.date)) + ', ' + it.appt.time + '</span>' : '';
  return '<div class="pt-item">' + glyph(c.type, st, 22) + '<div class="crow-t"><span class="crow-n">' + esc(c.label) + '</span>' + pill(st) + when + '</div>' + a + '</div>';
}
function unlockText(m) { return S.prefs.fechas ? 'Se desbloquea el ' + mStart(m).getDate() + ' ' + MES[mStart(m).getMonth()] : 'Se desbloquea al empezar el Mes ' + m; }
function timeline(pid, pv) {
  var dates = S.member && !pv && S.prefs.fechas, m, h = '<ol class="pt" aria-label="Recorrido de 12 meses">';
  function dl(n) { return dates ? '<span class="pt-d">' + fMYs(mStart(n)) + '</span>' : ''; }
  function row(n, inner) { return '<button class="pt-btn" ' + go('mes', { m: n, plan: pid }) + '>' + inner + '</button>'; }
  if (pv) {
    for (m = 1; m <= 12; m++) {
      var pa = monthComps(pid, m), pvv = pa.filter(passFilter);
      h += '<li class="pt-row ' + (pa.length ? 'ph-prev' : 'ph-empty') + '">' + row(m, (pa.length ? '' : '<span class="ndot"></span>') + '<span class="pt-m">Mes ' + m + '</span><span class="pt-t"><span class="pt-s">' + (pa.length ? (pvv.length ? esc(typeSummary(pvv)) : 'Sin elementos de este tipo') : 'Sin actividades') + '</span></span>' + (pa.length ? ICON.chev : '')) + '</li>';
    }
    return h + '</ol><div class="rec-foot">' + btn('Ver como calendario', act('recView', 'calendar'), 'btn-block') + '</div>';
  }
  var cyc = S.member.cycle;
  // meses anteriores: agrupados, consultables
  if (cyc > 1) {
    var done = 0, pend = 0, dots = '', rows = '';
    for (m = 1; m < cyc; m++) {
      var a = monthComps(pid, m), v = a.filter(passFilter), sum;
      if (!a.length) { dots += '<i></i>'; sum = 'Sin actividades'; }
      else {
        var ok = doneMonth(pid, m); ok ? done++ : pend++;
        dots += '<i class="' + (ok ? 'd' : 'p') + '">' + (ok ? ICON.tick : '') + '</i>';
        sum = (ok ? 'Completado' : 'Con pendientes') + ' · ' + (v.length ? statusSummary(v) : 'sin elementos de este tipo');
      }
      rows += '<li class="pt-row ph-past">' + row(m, '<span class="pt-t"><span class="pt-m">Mes ' + m + dl(m) + '</span><span class="pt-s">' + esc(sum) + '</span></span>' + ICON.chev) + '</li>';
    }
    var open = !!S.ui.pastOpen, rangeL = cyc - 1 === 1 ? 'Mes 1' : 'Meses 1–' + (cyc - 1);
    h += '<li class="pt-past"><button ' + act('pastToggle') + ' aria-expanded="' + open + '" aria-controls="pt-past-l">' + (cyc - 1 <= 6 ? '<span class="pdots" aria-hidden="true">' + dots + '</span>' : '') +
      '<span class="pt-t"><b>' + rangeL + '</b><span class="pt-s">' + plural(done, 'completado', 'completados') + (pend ? ' · ' + pend + ' con pendientes' : '') + '</span></span><span class="acc-i" aria-hidden="true">' + ICON.down + '</span></button>' +
      (open ? '<ol id="pt-past-l">' + rows + '</ol>' : '') + '</li>';
  }
  // mes actual: protagonista
  var all = monthComps(pid, cyc), vis = all.filter(passFilter), nx = nextMonthWith(cyc, pid);
  h += '<li class="pt-row ph-cur is-cur" aria-current="date"><div class="pt-cur"><span class="pt-num" aria-hidden="true">' + cyc + '</span><span class="kicker">Mes actual' + (dates ? ' · ' + fMYs(mStart(cyc)) : '') + '</span>';
  if (!all.length) h += '<h2>Sin actividades este mes</h2><p class="neutral">No es una cita cancelada ni un tratamiento perdido. No tienes nada pendiente.</p>';
  else if (!vis.length) h += '<h2>' + esc(typeSummary(all)) + '</h2><p class="neutral">Sin elementos de este tipo este mes.</p>';
  else { var chl = curHeadline(vis); h += '<h2' + (chl.length > 34 ? ' class="long"' : '') + '>' + esc(chl) + '</h2><div class="pt-items">' + vis.map(curItem).join('') + '</div>'; }
  h += '<div class="pt-cur-f">' + btn('Ver mes', go('mes', { m: cyc, plan: pid }), 'btn-sm btn-dark') + (!all.length && nx ? '<button class="link" ' + go('mes', { m: nx, plan: pid }) + '>Próximo hito: Mes ' + nx + '</button>' : '') + '</div></div></li>';
  // meses futuros
  var lastYear = dates ? mStart(cyc).getFullYear() : null, laterShown = false;
  for (m = cyc + 1; m <= 12; m++) {
    var fa = monthComps(pid, m), fv = fa.filter(passFilter);
    if (nx && m > nx && !laterShown) { h += '<li class="later lbl" aria-hidden="true">Más adelante</li>'; laterShown = true; }
    if (dates) { var y = mStart(m).getFullYear(); if (y !== lastYear) { h += '<li class="pt-year" aria-hidden="true">' + y + '</li>'; lastYear = y; } }
    if (!fa.length) { h += '<li class="pt-row ph-empty">' + row(m, '<span class="ndot"></span><span class="pt-m">Mes ' + m + dl(m) + '</span><span class="pt-t"><span class="pt-s">Sin actividades</span></span>') + '</li>'; continue; }
    var fs = fv.length ? typeSummary(fv) : 'Sin elementos de este tipo';
    if (m === nx) {
      var ph = fa[0].type === 'revision' ? PHOTOS.cita.revision : PHOTOS.tipo[fa[0].type];
      h += '<li class="pt-row ph-fut ph-next"><div class="pt-next">' + row(m, img(ph) + '<span class="nsh"><span class="lbl">Lo siguiente · Mes ' + m + (dates ? ' · ' + fMYs(mStart(m)) : '') + '</span><h3>' + esc(fs) + '</h3><span class="lockline">' + ICON.lock + unlockText(m) + '</span></span>') + '</div></li>';
    } else h += '<li class="pt-row ph-fut">' + row(m, '<span class="pt-m">Mes ' + m + '</span><span class="pt-t"><span class="pt-s">' + esc(fs) + (S.prefs.fechas ? ' · desde el ' + mStart(m).getDate() + ' ' + MES[mStart(m).getMonth()] : '') + '</span></span>' + ICON.lock.replace('class="ic"', 'class="ic lk"')) + '</li>';
  }
  h += '</ol><div class="rec-foot">' + notice('Hipótesis de prototipo, pendiente de validación: los tratamientos y beneficios se desbloquean al empezar su mes. No hay reservas ni canjes anticipados.', 'plain') + btn('Ver como calendario', act('recView', 'calendar'), 'btn-block') + '</div>';
  return h;
}
function calendar(pid, pv) {
  var cyc = (!pv && S.member) ? S.member.cycle : 0;
  var sel = S.ui.calSel || cyc || 1, dates = S.member && !pv && S.prefs.fechas;
  var h = '<div class="body"><p class="fine">Cada casilla es un mes de tu ciclo, no un día de cita.</p><div class="cal" role="group" aria-label="12 meses">';
  for (var m = 1; m <= 12; m++) {
    var cs = monthComps(pid, m).filter(passFilter);
    h += '<button class="cal-c' + (m === cyc ? ' cur' : '') + (m === sel ? ' sel' : '') + (cs.length ? '' : ' off') + '" aria-pressed="' + (m === sel) + '" ' + act('calSel', m) + '>' +
      '<span class="cal-h"><b>Mes ' + m + '</b>' + (m === cyc ? '<span class="now">Actual</span>' : '') + '</span>' + (dates ? '<span class="cal-d">' + fMYs(mStart(m)) + '</span>' : '<span class="cal-d">&nbsp;</span>') +
      '<span class="cal-g">' + (cs.length ? cs.map(function (c) { return glyph(c.type, pv ? null : item(c.id).status, 15); }).join('') : '<span class="muted">—</span>') + '</span></button>';
  }
  h += '</div>' + legendTypes();
  var all = monthComps(pid, sel), vis = all.filter(passFilter);
  h += '<section class="card msum" aria-live="polite"><div class="msum-h"><button class="icon-btn sm" ' + act('calSel', Math.max(1, sel - 1)) + (sel === 1 ? ' disabled' : '') + ' aria-label="Mes anterior">' + ICON.prev + '</button>' +
    '<div class="msum-t"><b>Mes ' + sel + (sel === cyc ? ' · actual' : '') + '</b><span>' + (dates ? fDate(mStart(sel)) + ' – ' + fDate(mEnd(sel)) : (all.length ? plural(all.length, 'elemento', 'elementos') : 'Sin actividades')) + '</span></div>' +
    '<button class="icon-btn sm" ' + act('calSel', Math.min(12, sel + 1)) + (sel === 12 ? ' disabled' : '') + ' aria-label="Mes siguiente">' + ICON.next + '</button></div>';
  if (!all.length) h += '<p class="neutral">El plan no programa actividades este mes.</p>';
  else if (!vis.length) h += '<p class="neutral">Sin elementos de este tipo.</p>';
  else h += vis.map(function (c) { return compRow(c, { preview: pv }); }).join('');
  h += btn('Ver detalle del Mes ' + sel, go('mes', { m: sel, plan: pid }), 'btn-block') + '</section></div>';
  return h;
}
SCR.mes = function (pp) {
  var pid = pp.plan || recPlan(), m = pp.m, p = PLAN[pid];
  var pv = !S.member || pid !== S.member.plan;
  var cyc = pv ? 0 : S.member.cycle, cs = monthComps(pid, m);
  var h = nav(pv ? p.name : 'Mes ' + m) + '<div class="body"><div class="mhead"><div><div class="eyebrow">' + (m === cyc ? 'Mes actual · ' : '') + (pv ? 'Vista previa · ' + esc(p.name) : esc(p.name)) + '</div><h1>Mes <b>' + m + '</b></h1>' +
    (!pv && S.prefs.fechas ? '<div class="muted">' + fDate(mStart(m)) + ' – ' + fDate(mEnd(m)) + ' ' + DEMO_TAG + '</div>' : '<div class="muted">Mes ' + m + ' de 12 desde la activación</div>') + '</div>' +
    '<div class="mnav"><button class="icon-btn" ' + act('mesNav', m - 1) + (m === 1 ? ' disabled' : '') + ' aria-label="Mes anterior">' + ICON.prev + '</button><button class="icon-btn" ' + act('mesNav', m + 1) + (m === 12 ? ' disabled' : '') + ' aria-label="Mes siguiente">' + ICON.next + '</button></div></div>';
  if (!pv && cs.length && m > cyc) h += notice('<b>Mes bloqueado.</b> Su contenido se desbloquea al empezar el Mes ' + m + (S.prefs.fechas ? ' (' + fDate(mStart(m)) + ', fecha simulada)' : '') + '. Hasta entonces no se puede reservar ni canjear. Hipótesis pendiente de validación.', 'warn');
  if (!cs.length) {
    var nx = nextMonthWith(m, pid);
    h += '<div class="card neutral-card"><b>Sin actividades programadas</b><p>El plan no incluye tratamientos ni beneficios este mes. No es una cita cancelada ni un tratamiento perdido.</p>' + (nx ? btn('Próximo hito: Mes ' + nx, act('mesNav', nx), 'btn-sm') : '') + '</div>';
  } else {
    h += '<div class="orig"><span class="lbl">Contenido según el plan</span><b>«' + esc(p.months[m - 1][0]) + '»</b>' + (cs.length > 1 ? '<span class="muted">' + cs.length + ' componentes este mes</span>' : '') + '</div>';
    cs.forEach(function (c) { h += compCard(c, pv); });
  }
  h += btn('Volver al recorrido anual', act('toTab', 'recorrido'), 'btn-block') + '</div>';
  return { html: h };
};
function compCard(c, pv) {
  var it = pv ? null : item(c.id), st = it ? it.status : null, cat = CATALOG[c.key];
  var h = '<article class="card ccard' + (st === 'pendiente' || st === 'disponible' ? ' dashed' : '') + '"><div class="ccard-h">' + glyph(c.type, st, 26) + '<div><div class="eyebrow">' + TYPES[c.type].label + '</div><h2>' + esc(c.label) + '</h2></div>' + (st ? pill(st) : '') + '</div>';
  if (pv) h += '<p class="neutral">Incluido en el Mes ' + c.m + ' de este plan.</p>';
  else if (clinical(c.type)) {
    if (st === 'pendiente') h += '<p class="neutral">Puedes reservarlo ya. Aún no tiene cita.</p>' + btn('Reservar', go('reservar-2', { id: c.id }), 'btn-dark btn-block');
    else if (st === 'previsto') h += '<p class="neutral">Se podrá reservar cuando empiece el Mes ' + c.m + '. Regla de reserva por confirmar.</p>' + btn('Reservar', 'disabled', 'btn-block');
    else if (st === 'reservado' || st === 'cambio') {
      h += '<dl class="dl compact"><div><dt>Fecha</dt><dd>' + cap(fDay(it.appt.date)) + ' ' + it.appt.date.getFullYear() + '</dd></div><div><dt>Hora</dt><dd>' + it.appt.time + '</dd></div><div><dt>Centro</dt><dd>' + tbd(DEMO.centro) + '</dd></div></dl>';
      if (st === 'cambio') h += notice('Has pedido cambiarla al ' + fDay(it.change.date) + ', ' + it.change.time + '. Requiere confirmación de la clínica.', 'warn');
      h += btn('Ver cita', go('cita', { id: c.id }), 'btn-block');
    } else if (st === 'completado') h += '<p class="neutral">Realizado el ' + fDate(it.doneAt) + '. ' + DEMO_TAG + '</p>';
  } else {
    if (st === 'disponible') h += '<p class="neutral">Disponible este mes. ' + esc(cat.note || '') + '</p>' + btn('Ver beneficio', go('beneficio', { id: c.id }), 'btn-block');
    else if (st === 'futuro') h += '<p class="neutral">Estará disponible en el Mes ' + c.m + '.</p>';
    else if (st === 'canjeado') h += '<p class="neutral">Canjeado el ' + fDate(it.doneAt) + '. ' + DEMO_TAG + '</p>';
  }
  h += '<button class="link" ' + go('tratamiento', { key: c.key }) + '>Ver ficha de ' + esc(cat.name) + '</button></article>';
  return h;
}
SCR.leyenda = function () {
  var h = nav('Leyenda') + '<div class="body"><h1>Cómo leer tu <b>recorrido</b></h1><section class="sec"><h2>La forma indica el tipo</h2><div class="card tight">' +
    [['tratamiento', 'Acto clínico programado en el plan.'], ['revision', 'Retoque, revisión o valoración.'], ['regalo', 'AGE Gift o consumición incluida.'], ['recompensa', 'Rewards. Funcionamiento por confirmar.']].map(function (r) {
      return '<div class="crow">' + glyph(r[0], null, 22) + '<div class="crow-t"><div class="crow-n">' + TYPES[r[0]].label + '</div><div class="crow-s">' + r[1] + '</div></div></div>';
    }).join('') + '</div></section><section class="sec"><h2>El relleno indica el estado</h2><div class="card tight">' +
    [['previsto', 'Mes futuro. Todavía no se puede reservar.'], ['pendiente', 'Toca este mes y aún no tiene cita.'], ['reservado', 'Tiene cita.'], ['cambio', 'Has pedido otra fecha y falta la confirmación.'], ['completado', 'Hecho.'], ['disponible', 'Beneficio que puedes recoger.'], ['canjeado', 'Beneficio ya recogido.']].map(function (r) {
      var t = (r[0] === 'disponible' || r[0] === 'canjeado') ? 'regalo' : 'tratamiento';
      return '<div class="crow">' + glyph(t, r[0], 22) + '<div class="crow-t"><div class="crow-n">' + ST[r[0]].l + '</div><div class="crow-s">' + r[1] + '</div></div>' + pill(r[0]) + '</div>';
    }).join('') + '</div></section>' + notice('El estado siempre se indica también con texto. Los meses sin actividades se muestran con un punto pequeño y no significan nada pendiente.') + '</div>';
  return { html: h };
};

/* C · Tratamientos */
var PRIO = ['pendiente', 'cambio', 'reservado', 'disponible', 'previsto', 'futuro', 'completado', 'canjeado'];
function compTarget(c) {
  var st = item(c.id).status;
  if (st === 'pendiente') return go('reservar-2', { id: c.id });
  if (st === 'reservado' || st === 'cambio') return go('cita', { id: c.id });
  if (!clinical(c.type)) return go('beneficio', { id: c.id });
  return go('mes', { m: c.m });
}
SCR.tratamientos = function () {
  var f = S.member ? S.ui.catFilter : 'todos';
  var h = nav('Tratamientos') + '<div class="body"><h1><b>Tratamientos</b></h1>';
  if (S.member) h += seg([['plan', 'En mi plan'], ['todos', 'Catálogo completo']], f, 'catFilter');
  h += notice('AGE Clinic aún no ha facilitado nombres oficiales ni descripciones. Se muestran las etiquetas del documento.');
  ['tratamiento', 'revision', 'regalo', 'recompensa'].forEach(function (t) {
    var keys = Object.keys(CATALOG).filter(function (k) { return CATALOG[k].type === t; });
    if (f === 'plan') keys = keys.filter(function (k) { return COMPS[S.member.plan].some(function (c) { return c.key === k; }); });
    if (!keys.length) return;
    h += '<section class="sec"><h2>' + TYPES[t].plural + '</h2><div class="list">';
    keys.forEach(function (k) {
      var sub = '', title = esc(CATALOG[k].name);
      if (f === 'plan') {
        var occ = COMPS[S.member.plan].filter(function (c) { return c.key === k; });
        var sts = occ.map(function (c) { return item(c.id).status; });
        var top = PRIO.filter(function (st) { return sts.indexOf(st) > -1; })[0];
        if (occ.length > 1) title += ' <span class="inc-x">×' + occ.length + '</span>';
        sub = pill(top);
      }
      h += lrow(title, sub, go('tratamiento', { key: k }), glyph(t, null, 20));
    });
    h += '</div></section>';
  });
  return { html: h + '</div>' };
};
SCR.tratamiento = function (pp) {
  var k = pp.key, cat = CATALOG[k];
  var h = nav(cat.name, { over: true }) + '<div class="hero short">' + img(PHOTOS.tipo[cat.type]) + '</div><div class="body sheetbody"><div class="stack"><span class="kicker">' + TYPES[cat.type].label + '</span><h1>' + esc(cat.name) + '</h1></div>';
  h += '<p class="placeholder">Descripción clínica pendiente de AGE Clinic.</p>';
  if (cat.note) h += notice(esc(cat.note));
  h += clinical(cat.type) ? '<div class="pend-block"><span class="lbl">Duración, preparación y recuperación</span><p>AGE Clinic completará aquí la información clínica del tratamiento.</p></div>' : '<dl class="dl">' + [['Cómo se canjea', tbd()], ['Dónde', cat.key === 'age-gift' ? 'Tienda (según documento)' : tbd()]].map(function (r) { return '<div><dt>' + r[0] + '</dt><dd>' + r[1] + '</dd></div>'; }).join('') + '</dl>';
  if (S.member) {
    var occ = COMPS[S.member.plan].filter(function (c) { return c.key === k; });
    h += '<section class="sec"><h2>En tu plan</h2>' + (occ.length ? '<div class="card tight">' + occ.map(function (c) { return compRow(c, { month: true }); }).join('') + '</div>' : '<p class="neutral">No está incluido en ' + esc(PLAN[S.member.plan].name) + '.</p>') + '</section>';
  }
  h += '<section class="sec"><h2>Planes que lo incluyen</h2><div class="list">';
  PLANS.forEach(function (p) {
    var ms = COMPS[p.id].filter(function (c) { return c.key === k; }).map(function (c) { return c.m; });
    if (ms.length) h += lrow(esc(p.name), (ms.length > 1 ? 'Meses ' : 'Mes ') + ms.join(', '), go('plan', { id: p.id }));
  });
  return { html: h + '</div></section></div>' };
};
SCR['mis-tratamientos'] = function () {
  var h = nav('Tratamientos incluidos') + '<div class="body"><h1>Tratamientos <b>incluidos</b></h1>';
  if (!S.member) return { html: h + empty('Sin membresía activa', 'Activa una membresía para ver tus tratamientos y su estado.', btn('Explorar membresías', go('membresias'), 'btn-dark')) + '</div>' };
  h += '<p class="lead">' + esc(PLAN[S.member.plan].name) + ' · actos clínicos ordenados por estado.</p>';
  [['pendiente', 'Pendientes de reservar'], ['cambio', 'Cambio solicitado'], ['reservado', 'Reservados'], ['previsto', 'Previstos'], ['completado', 'Realizados']].forEach(function (g) {
    var cs = byStatus([g[0]]).filter(function (c) { return clinical(c.type); });
    if (!cs.length) return;
    h += '<section class="sec"><h2>' + g[1] + ' <span class="count">' + cs.length + '</span></h2><div class="list">' + cs.map(function (c) { return lrow(esc(c.label), 'Mes ' + c.m, compTarget(c), glyph(c.type, item(c.id).status, 22)); }).join('') + '</div></section>';
  });
  h += '<div class="list">' + lrow('Regalos y Rewards', 'Ver beneficios', go('beneficios')) + '</div>';
  return { html: h + '</div>' };
};

/* D · Reservas */
function monthCal() {
  var t = today(), y = t.getFullYear(), mo = t.getMonth(), nd = new Date(y, mo + 1, 0).getDate(), off = (new Date(y, mo, 1).getDay() + 6) % 7, marks = {}, anyCh = false;
  upcomingAppts().forEach(function (c) {
    var it = item(c.id);
    [['a', it.appt], ['ch', it.change]].forEach(function (x) { if (x[1] && x[1].date.getFullYear() === y && x[1].date.getMonth() === mo && !marks[x[1].date.getDate()]) { marks[x[1].date.getDate()] = { k: x[0], id: c.id }; if (x[0] === 'ch') anyCh = true; } });
  });
  var h = '<div class="mcal" role="group" aria-label="' + cap(MESL[mo]) + ' ' + y + '"><div class="mcal-dow" aria-hidden="true">' + ['Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb', 'Dom'].map(function (d) { return '<span>' + d + '</span>'; }).join('') + '</div><div class="mcal-days">';
  for (var i = 0; i < off; i++) h += '<span class="e"></span>';
  for (var d = 1; d <= nd; d++) {
    var mk = marks[d], isT = d === t.getDate();
    if (mk) h += '<button class="' + mk.k + '" ' + go('cita', { id: mk.id }) + ' aria-label="' + d + ' de ' + MESL[mo] + ': ' + (mk.k === 'a' ? 'tu cita' : 'cambio solicitado') + '">' + d + '</button>';
    else h += '<span class="' + (d < t.getDate() ? 'p' : isT ? 't' : '') + '"' + (isT ? ' aria-label="Hoy, ' + d + '"' : '') + '>' + d + '</span>';
  }
  return h + '</div></div><div class="mkey"><span><i></i>Tu cita</span>' + (anyCh ? '<span><i class="ch"></i>Cambio solicitado</span>' : '') + '<span><i class="t"></i>Hoy</span></div>';
}
SCR.reservas = function () {
  var h = '<div class="res"><div class="top-row">' + avatar() + '' + (S.member ? '<button class="icon-btn dark" ' + go('reservar-1') + ' aria-label="Nueva reserva">' + ICON.plus + '</button>' : '') + '</div><h1>Mis<br><b>reservas</b></h1>';
  if (!S.member) return { html: h + '</div><div class="body">' + empty('Sin membresía activa', 'Las reservas se hacen sobre los tratamientos de tu membresía.', btn('Explorar membresías', go('membresias'), 'btn-dark')) + '</div>' };
  var up = upcomingAppts(), pend = byStatus(['pendiente']);
  h += '<div class="res-ctl">' + seg([['proximas', 'Próximas' + (up.length ? '<span class="cnt">' + up.length + '</span>' : '')], ['historial', 'Historial']], S.ui.resTab, 'resTab') + '</div></div><div class="body">';
  if (S.ui.resTab === 'proximas') {
    var t = today();
    h += '<div class="stack" style="gap:14px"><div class="res-m"><b>' + cap(MESL[t.getMonth()]) + ' ' + t.getFullYear() + '</b><span class="fine">Mes ' + S.member.cycle + ' de tu ciclo</span></div>' + monthCal() + '</div>';
    if (up.length) h += '<section class="sec"><h2>' + (up.length > 1 ? 'Tus citas' : 'Tu próxima cita') + '</h2>' + up.map(apptCard).join('') + '</section>';
    else h += '<div class="card neutral-card"><b>No tienes citas próximas</b><p>' + (pend.length ? 'Tienes ' + plural(pend.length, 'tratamiento', 'tratamientos') + ' pendiente de reservar.' : 'Nada que reservar este mes.') + '</p></div>';
    if (pend.length) h += '<section class="sec"><h2>Pendientes de reservar</h2><div class="card tight">' + pend.map(function (c) { return compRow(c, { month: true }); }).join('') + '</div></section>';
    var nm = S.member.cycle;
    while ((nm = nextMonthWith(nm)) && !monthComps(S.member.plan, nm).some(function (c) { return clinical(c.type); })) { }
    if (nm) { var nc = monthComps(S.member.plan, nm).filter(function (c) { return clinical(c.type); })[0];
      h += '<button class="upnext" ' + go('mes', { m: nm }) + '>' + ICON.lock + '<span><b>' + esc(nc.label) + ' · Mes ' + nm + '</b>' + (S.prefs.fechas ? 'Podrás reservarlo desde el ' + fDate(mStart(nm)) : 'Podrás reservarlo al empezar el Mes ' + nm) + '</span></button>'; }
  } else {
    var hs = historyEntries(false);
    if (!hs.length) h += empty('Aún no hay historial', 'Aquí aparecerán tus citas realizadas y canceladas.', '');
    else h += '<p class="fine">Historial simulado · ' + DEMO_TAG + '</p><div class="card tight">' + hs.map(function (e) {
      var st = e.kind === 'cancelada' ? '<span class="pill st-cancel">Cancelada</span>' : pill('completado');
      return '<div class="crow">' + glyph(e.type, e.kind === 'cancelada' ? null : 'completado') + '<div class="crow-t"><div class="crow-n">' + esc(e.label) + '</div><div class="crow-s">' + fDay(e.date) + ' ' + e.date.getFullYear() + ', ' + e.time + ' · Mes ' + e.m + (S.archive.indexOf(e) > -1 ? ' · ' + esc(e.plan) : '') + '</div><div class="crow-p">' + st + '</div></div></div>';
    }).join('') + '</div>';
  }
  return { html: h + '</div>' };
};
SCR['reservar-1'] = function () {
  var h = nav('Nueva reserva', { close: true }) + '<div class="body">' + stepper(1, 'Tratamiento') + '<h1>¿Qué quieres <b>reservar</b>?</h1>';
  if (!S.member) return { html: h + empty('Sin membresía activa', 'Activa una membresía para reservar.', btn('Explorar membresías', go('membresias'), 'btn-dark')) + '</div>', flow: true };
  var pend = byStatus(['pendiente']), fut = byStatus(['previsto']);
  if (!pend.length) h += empty('Nada que reservar ahora', 'Los tratamientos de los próximos meses se podrán reservar cuando empiece su mes.', '');
  else h += '<div class="list">' + pend.map(function (c) { return lrow(esc(c.label), TYPES[c.type].label + ' · Mes ' + c.m + ' · incluido en tu plan', go('reservar-2', { id: c.id }), glyph(c.type, 'pendiente', 22)); }).join('') + '</div>';
  if (fut.length) h += '<section class="sec"><h2>Más adelante</h2><div class="list">' + fut.map(function (c) {
    return '<div class="lrow disabled" aria-disabled="true">' + glyph(c.type, 'previsto', 22) + '<span class="lrow-t"><span class="lrow-n">' + esc(c.label) + '</span><span class="lrow-s">Se podrá reservar en el Mes ' + c.m + '</span></span></div>';
  }).join('') + '</div></section>';
  return { html: h + '</div>', flow: true };
};
SCR['reservar-2'] = function (pp) {
  var c = COMP[pp.id], mode = pp.mode || 'nueva';
  if (!S.ui.draft || S.ui.draft.id !== c.id || S.ui.draft.mode !== mode) S.ui.draft = { id: c.id, mode: mode, day: null, time: null };
  var dr = S.ui.draft, days = slotDays();
  var h = nav(mode === 'cambio' ? 'Cambiar fecha' : 'Nueva reserva', { close: true }) + '<div class="body">' + stepper(2, 'Fecha y hora') + '<h1>Elige <b>fecha y hora</b></h1>';
  h += '<div class="card tight">' + compRow(c, { noCta: true, month: true }) + '</div>';
  h += '<div class="sec-h"><h2>Día</h2><span class="demo-tag">Disponibilidad DEMO</span></div><div class="days" role="group" aria-label="Días">' + days.map(function (d, i) {
    return '<button class="day' + (dr.day === i ? ' on' : '') + '" aria-pressed="' + (dr.day === i) + '" ' + act('pickDay', i) + '><span>' + DIA[d.getDay()] + '</span><b>' + d.getDate() + '</b><span>' + MES[d.getMonth()] + '</span></button>';
  }).join('') + '</div>';
  h += '<div class="sec-h"><h2>Hora</h2></div>';
  if (dr.day === null) h += '<p class="neutral">Elige un día para ver las horas.</p>';
  else h += '<div class="times" role="group" aria-label="Horas">' + DEMO.times.map(function (t, i) {
    var taken = slotTaken(days[dr.day], i);
    return '<button class="time' + (dr.time === t ? ' on' : '') + '" ' + act('pickTime', t) + (taken ? ' disabled aria-label="' + t + ', ocupado"' : ' aria-pressed="' + (dr.time === t) + '"') + '>' + t + '</button>';
  }).join('') + '</div>';
  h += '<p class="fine">Disponibilidad simulada. No refleja la agenda real de la clínica.</p></div>';
  h += '<div class="foot">' + btn('Continuar', go('reservar-3', { id: c.id, mode: mode }) + (dr.day !== null && dr.time ? '' : ' disabled'), 'btn-dark btn-block') + '</div>';
  return { html: h, flow: true };
};
SCR['reservar-3'] = function (pp) {
  var c = COMP[pp.id], dr = S.ui.draft, d = slotDays()[dr.day], mode = pp.mode;
  var h = nav(mode === 'cambio' ? 'Cambiar fecha' : 'Nueva reserva', { close: true }) + '<div class="body">' + stepper(3, 'Revisar') + '<h1>Revisa tu <b>reserva</b></h1>';
  h += '<dl class="dl"><div><dt>Tratamiento</dt><dd>' + esc(c.label) + '</dd></div><div><dt>Tipo</dt><dd>' + TYPES[c.type].label + '</dd></div><div><dt>Mes del plan</dt><dd>Mes ' + c.m + ' · ' + esc(PLAN[c.plan].name) + '</dd></div><div><dt>Fecha</dt><dd>' + cap(DIAL[d.getDay()]) + ', ' + fDate(d) + '</dd></div><div><dt>Hora</dt><dd>' + dr.time + '</dd></div><div><dt>Centro</dt><dd>AGE Clinic</dd></div><div><dt>Profesional</dt><dd>Pendiente de asignar</dd></div></dl>';
  if (mode === 'cambio') h += notice('El cambio quedará pendiente hasta que la clínica lo confirme. Mientras tanto se mantiene tu cita actual.', 'warn');
  h += notice('Incluido en tu membresía. Las condiciones de cambio y cancelación están por confirmar.') + '</div>';
  h += '<div class="foot two-btn">' + btn('Atrás', 'data-back') + btn(mode === 'cambio' ? 'Enviar solicitud' : 'Confirmar reserva', act('confirmBook'), 'btn-dark') + '</div>';
  return { html: h, flow: true };
};
SCR['reserva-ok'] = function (pp) {
  var c = COMP[pp.id], it = item(c.id), ch = it.status === 'cambio';
  var a = ch ? it.change : it.appt;
  var h = '<div class="body center-top"><div class="ok-ic">' + ICON.check + '</div><h1>' + (ch ? 'Solicitud <b>enviada</b>' : 'Reserva <b>confirmada</b>') + '</h1><p class="lead">' + esc(c.label) + ' · ' + cap(fDay(a.date)) + ', ' + a.time + ' ' + DEMO_TAG + '</p></div><div class="body">';
  h += '<div class="card tight">' + compRow(c, { noCta: true, month: true }) + '</div>';
  h += notice(ch ? 'La clínica tiene que confirmar el cambio. Te avisaremos (recordatorio simulado).' : 'Ya aparece en tu inicio, en Reservas y en el Mes ' + c.m + ' de tu recorrido.') + '</div>';
  h += '<div class="foot stack">' + btn('Ver mis reservas', act('toTab', 'reservas'), 'btn-dark btn-block') + btn('Ver en mi recorrido', act('toMes', c.m), 'btn-block') + '</div>';
  return { html: h, flow: true };
};
SCR.cita = function (pp) {
  var c = COMP[pp.id], it = item(c.id);
  if (!it || !it.appt) return { html: nav('Cita') + '<div class="body">' + empty('Esta cita ya no está activa', 'Puede que la hayas cancelado o completado.', btn('Ir a Reservas', act('toTab', 'reservas'))) + '</div>' };
  var d = it.appt.date;
  var h = nav('Cita', { over: true }) + '<div class="hero">' + img(PHOTOS.cita[c.type] || PHOTOS.cita.tratamiento) + '</div><div class="body sheetbody"><div class="stack"><span class="kicker">' + TYPES[c.type].label + ' · Mes ' + c.m + '</span><h1>' + esc(c.label) + '</h1>' + pill(it.status) + '</div>';
  h += '<div class="ttime"><b>' + it.appt.time + '</b><span>' + cap(DIAL[d.getDay()]) + ', ' + fDate(d) + ' · ' + DEMO_TAG + '</span></div>';
  h += '<dl class="dl"><div><dt>Centro</dt><dd>AGE Clinic</dd></div><div><dt>Profesional</dt><dd>Pendiente de asignar</dd></div><div><dt>Plan</dt><dd>' + esc(PLAN[c.plan].name) + '</dd></div></dl>';
  if (it.status === 'cambio') h += notice('Has pedido cambiarla al <b>' + cap(fDay(it.change.date)) + ', ' + it.change.time + '</b>. Requiere confirmación de la clínica. Hasta entonces se mantiene la fecha actual.', 'warn');
  h += '<div class="stack">' + (it.status === 'reservado' ? btn('Solicitar cambio de fecha', go('reservar-2', { id: c.id, mode: 'cambio' }), 'btn-block btn-beige') : '') + btn('Cancelar reserva', act('sheet', 'cancel:' + c.id), 'btn-block btn-danger') + '</div>';
  h += '<div class="demo-box"><span class="lbl">Herramientas de demostración</span><p class="fine">Simulan lo que en producción vendría del sistema de la clínica.</p>' +
    (it.status === 'cambio' ? btn('Simular: la clínica confirma el cambio', act('confirmChange', c.id), 'btn-sm') : '') + btn('Simular: cita realizada', act('complete', c.id), 'btn-sm') + '</div>';
  h += '<button class="link" ' + go('tratamiento', { key: c.key }) + '>Ver ficha del tratamiento</button></div>';
  return { html: h };
};

/* G · Exclusivo para socios */
function isoDate(s) { var a = s.split('-'); return new Date(+a[0], +a[1] - 1, +a[2]); }
function promoActive(pr) {
  if (pr.status !== 'ejemplo' && pr.status !== 'aprobada') return false;
  if (pr.plans !== 'all' && (!S.member || pr.plans.indexOf(S.member.plan) < 0)) return false;
  var t = today();
  if (pr.validFrom && t < isoDate(pr.validFrom)) return false;
  if (pr.validTo && t > isoDate(pr.validTo)) return false;
  return true;
}
function activePromos() { return S.member ? PROMOS.filter(promoActive) : []; }
function promoById(id) { return PROMOS.filter(function (x) { return x.id === id; })[0]; }
function promoRel(pr) {
  var ms = S.member ? COMPS[S.member.plan].filter(function (c) { return c.key === pr.key; }).map(function (c) { return c.m; }) : [];
  return ms.length ? { inc: true, months: ms } : { inc: false };
}
function monthsText(ms) { return (ms.length > 1 ? 'Meses ' : 'Mes ') + ms.join(' y '); }
function promoRelText(pr) { var r = promoRel(pr); return r.inc ? 'Incluido en tu plan · ' + monthsText(r.months) : 'Adicional a tu plan'; }
function eur(n) { return n.toLocaleString('es-ES') + ' €'; }
SCR.socios = function () {
  var ps = activePromos();
  var h = nav('Exclusivo para socios') + '<div class="body"><div class="stack"><h1>Exclusivo <b>para socios</b></h1><p class="lead">Tratamientos adicionales con condiciones especiales para socios de AGE Club.</p>';
  if (ps.some(function (x) { return x.status === 'ejemplo'; })) h += '<p class="fine">Promociones de ejemplo · ' + DEMO_TAG + '</p>';
  h += '</div>';
  if (!ps.length) return { html: h + empty('Sin promociones por ahora', 'Cuando AGE Clinic publique una promoción para socios, aparecerá aquí.', btn('Volver a inicio', act('toTab', 'inicio'))) + '</div>' };
  h += '<div class="pcards">' + ps.map(function (pr) {
    return '<button class="pcard" ' + go('promo', { id: pr.id }) + '>' + img([pr.image.src, pr.image.alt]) + '<span class="pcard-b"><span class="pcard-n">' + esc(pr.name) + '</span><span class="pcard-s">' + promoRelText(pr) + '</span><span class="pcard-f"><span class="demo-tag">' + (pr.status === 'ejemplo' ? 'Ejemplo' : '') + '</span><span class="link" style="min-height:0;padding:0">Ver promoción</span></span></span></button>';
  }).join('') + '</div>';
  return { html: h + '</div>' };
};
SCR.promo = function (pp) {
  var pr = promoById(pp.id), r = promoRel(pr), pn = S.member ? PLAN[S.member.plan].name : 'plan', sent = S.promoReqs[pr.id];
  var h = nav(pr.name, { over: true, right: pr.status === 'ejemplo' ? '<span class="over-tag">Ejemplo</span>' : '' }) + '<div class="hero">' + img([pr.image.src, pr.image.alt]) + '</div><div class="body sheetbody"><div class="stack"><span class="kicker">Exclusivo para socios</span><h1>' + esc(pr.name) + '</h1><p class="placeholder">' + (pr.summary ? esc(pr.summary) : 'Descripción pendiente de AGE Clinic.') + '</p></div>';
  h += r.inc ? '<div class="prel inc">' + ICON.info + '<div><b>Incluido en tu ' + esc(pn) + ' · ' + monthsText(r.months) + '</b>Esta promoción sería aparte de lo incluido en tu plan. Su compatibilidad está pendiente de validar con AGE Clinic.</div></div>'
    : '<div class="prel add">' + ICON.spark + '<div><b>Adicional a tu ' + esc(pn) + '</b>No forma parte de tu membresía ni de tu recorrido de 12 meses.</div></div>';
  var hasP = pr.price.regular != null && pr.price.member != null;
  if (hasP) h += '<div class="prices"><div><span class="lbl">Precio habitual</span><b>' + eur(pr.price.regular) + '</b></div><div><span class="lbl">Para socios</span><b>' + eur(pr.price.member) + '</b></div></div>';
  if (pr.conditions.length) h += '<section class="sec"><h2>Condiciones</h2><ul class="conds">' + pr.conditions.map(function (x) { return '<li>' + esc(x) + '</li>'; }).join('') + '</ul></section>';
  if (!hasP || !pr.conditions.length) h += '<div class="pend-block"><span class="lbl">Precio y condiciones · DEMO</span><p>AGE Clinic publicará aquí el precio habitual, el precio para socios y las condiciones de la promoción.</p></div>';
  h += '</div><div class="foot">' + (sent ? btn(ICON.tick + 'Solicitud enviada · simulación', 'disabled', 'btn-block') : btn('Solicitar cita', act('sheet', 'promo:' + pr.id), 'btn-dark btn-block')) + '</div>';
  return { html: h };
};

/* F · Perfil */
SCR.perfil = function () {
  var u = S.user, p = S.member ? PLAN[S.member.plan] : null;
  var h = '<div class="h-head" style="height:auto;min-height:320px">' + photo('perfil') + '<div class="h-in" style="padding-bottom:24px"><div class="idcard">' + avatar() + '<h1>' + esc(u.nombre) + ' <b>' + esc(u.apellidos) + '</b></h1><span>' + (p ? esc(p.name) + ' · Mes ' + S.member.cycle + ' de 12' : 'Sin membresía activa') + ' · ' + DEMO_TAG + '</span></div></div></div><div class="body" style="padding-top:6px">';
  h += '<section class="sec"><h2 class="eyebrow">Cuenta</h2><div class="list">' + lrow('Datos personales', esc(u.email), go('datos')) + '</div></section>';
  h += '<section class="sec"><h2 class="eyebrow">Membresía</h2><div class="list">' + lrow('Mi membresía', p ? esc(p.name) + ' · activa' : 'Explorar y activar', go(p ? 'mi-membresia' : 'membresias')) +
    lrow('Tratamientos incluidos', p ? countsText(p.id) : 'Sin membresía', go('mis-tratamientos')) + lrow('Historial de tratamientos', plural(historyEntries(true).length, 'realizado', 'realizados'), go('historial')) +
    lrow('Beneficios', 'AGE Gift, consumiciones y Rewards', go('beneficios')) + '</div></section>';
  h += '<section class="sec"><h2 class="eyebrow">Aplicación</h2><div class="list">' + lrow('Preferencias y ajustes', 'Avisos, fechas, idioma', go('ajustes')) + lrow('Cómo leer tu recorrido', 'Tipos y estados', go('leyenda')) + '</div></section>';
  h += btn('Cerrar sesión', act('logout'), 'btn-text btn-block');
  return { html: h + '</div>' };
};
SCR.datos = function () {
  var u = S.user;
  function f(id, l, v, t) { return '<div class="field"><label for="f-' + id + '">' + l + '</label><input id="f-' + id + '" type="' + (t || 'text') + '" value="' + esc(v) + '"></div>'; }
  var h = nav('Datos personales') + '<div class="body"><h1>Datos <b>personales</b></h1><form class="form" id="datos-form" novalidate>' + f('nombre', 'Nombre', u.nombre) + f('apellidos', 'Apellidos', u.apellidos) + f('email', 'Correo electrónico', u.email, 'email') + f('telefono', 'Teléfono', u.telefono, 'tel') +
    '<div class="field"><span class="flabel">Nº de socia</span><span class="ro">' + esc(u.socia) + ' · ' + DEMO_TAG + '</span></div></form>' + notice('Qué datos personales se piden y cuáles se sincronizan con la clínica está por confirmar.') + '</div>';
  h += '<div class="foot">' + btn('Guardar cambios', act('saveDatos'), 'btn-dark btn-block') + '</div>';
  return { html: h };
};
SCR['mi-membresia'] = function () {
  var h = nav('Mi membresía') + '<div class="body">';
  if (!S.member) return { html: h + '<h1>Mi <b>membresía</b></h1>' + empty('No tienes una membresía activa', 'Compara los 6 planes y activa el que prefieras.', btn('Explorar membresías', go('membresias'), 'btn-dark')) + '</div>' };
  var p = PLAN[S.member.plan];
  h += '<div class="stack"><span class="kicker">Membresía activa</span><h1>' + esc(p.name) + '</h1><div class="price" style="margin-top:2px">' + priceM(p.id) + '</div></div><dl class="dl"><div><dt>Estado</dt><dd><span class="pill st-done">Activa</span></dd></div><div><dt>Importe</dt><dd>' + priceM(p.id) + '</dd></div><div><dt>Activación</dt><dd>' + fDate(S.member.act) + ' ' + DEMO_TAG + '</dd></div><div><dt>Mes del ciclo</dt><dd>Mes ' + S.member.cycle + ' de 12</dd></div><div><dt>Fin de ciclo y renovación</dt><dd>' + tbd() + '</dd></div><div><dt>Incluye</dt><dd>' + countsText(p.id) + '</dd></div></dl>';
  h += '<div class="stack">' + btn('Ver mi recorrido', act('toTab', 'recorrido'), 'btn-dark btn-block') + btn('Ver detalle del plan', go('plan', { id: p.id }), 'btn-block') + btn('Cambiar de membresía', go('membresias'), 'btn-block') + '</div>';
  h += notice('No se muestra fecha de renovación porque el documento no la define.');
  return { html: h + '</div>' };
};
SCR.historial = function () {
  var hs = historyEntries(true);
  var h = nav('Historial') + '<div class="body"><h1>Historial de <b>tratamientos</b></h1>';
  if (!hs.length) return { html: h + empty('Todavía no hay tratamientos realizados', 'Cuando completes tu primer tratamiento aparecerá aquí.', S.member ? btn('Ver mi recorrido', act('toTab', 'recorrido')) : '') + '</div>' };
  h += '<p class="fine">Fechas simuladas ' + DEMO_TAG + '</p><div class="card tight">' + hs.map(function (e) {
    return '<div class="crow">' + glyph(e.type, 'completado') + '<div class="crow-t"><div class="crow-n">' + esc(e.label) + '</div><div class="crow-s">' + fDate(e.date) + ' · Mes ' + e.m + ' · ' + esc(e.plan) + '</div></div></div>';
  }).join('') + '</div>';
  return { html: h + '</div>' };
};
SCR.beneficios = function () {
  var h = nav('Beneficios') + '<div class="body"><h1><b>Beneficios</b></h1>';
  if (!S.member) return { html: h + empty('Sin beneficios todavía', 'Los regalos y Rewards forman parte de cada membresía.', btn('Explorar membresías', go('membresias'), 'btn-dark')) + '</div>' };
  [['disponible', 'Disponibles'], ['futuro', 'Próximamente'], ['canjeado', 'Canjeados']].forEach(function (g) {
    var cs = byStatus([g[0]]).filter(function (c) { return !clinical(c.type); });
    h += '<section class="sec"><h2>' + g[1] + ' <span class="count">' + cs.length + '</span></h2>' + (cs.length ? '<div class="list">' + cs.map(function (c) {
      return lrow(esc(c.label), 'Mes ' + c.m, go('beneficio', { id: c.id }), glyph(c.type, item(c.id).status, 22));
    }).join('') + '</div>' : '<p class="neutral">Ninguno.</p>') + '</section>';
  });
  h += notice('Qué son las Rewards y cómo se canjean los regalos está por confirmar con AGE Clinic.');
  return { html: h + '</div>' };
};
SCR.beneficio = function (pp) {
  var c = COMP[pp.id], it = item(c.id), cat = CATALOG[c.key];
  var h = nav('Beneficio', { over: true }) + '<div class="hero short">' + img(PHOTOS.tipo[c.type]) + '</div><div class="body sheetbody"><div class="stack"><span class="kicker">' + TYPES[c.type].label + ' · Mes ' + c.m + '</span><h1>' + esc(c.label) + '</h1>' + pill(it.status) + '</div>';
  h += '<dl class="dl"><div><dt>Mes del plan</dt><dd>Mes ' + c.m + (S.prefs.fechas ? ' · desde ' + fDate(mStart(c.m)) : '') + '</dd></div><div><dt>Cómo se canjea</dt><dd>' + tbd() + '</dd></div>' + (it.doneAt ? '<div><dt>Canjeado</dt><dd>' + fDate(it.doneAt) + ' ' + DEMO_TAG + '</dd></div>' : '') + '</dl>';
  if (cat.note) h += notice(esc(cat.note));
  if (it.status === 'disponible') h += '<div class="demo-box"><span class="lbl">Herramienta de demostración</span><p class="fine">No implica que el canje se haga desde la app.</p>' + btn('Simular: beneficio recogido', act('redeem', c.id), 'btn-sm') + '</div>';
  if (it.status === 'futuro') h += '<p class="neutral">Estará disponible en el Mes ' + c.m + '.</p>';
  return { html: h + '</div>' };
};
SCR.ajustes = function () {
  function tg(k, l, s) { return '<div class="tgrow"><span class="lrow-t"><span class="lrow-n">' + l + '</span><span class="lrow-s">' + s + '</span></span><button class="switch" role="switch" aria-checked="' + S.prefs[k] + '" aria-label="' + l + '" ' + act('pref', k) + '><i></i></button></div>'; }
  var h = nav('Ajustes') + '<div class="body"><h1>Preferencias <b>y ajustes</b></h1><section class="sec"><h2 class="eyebrow">Avisos</h2><div class="list">' +
    tg('recordatorios', 'Recordatorios de citas', 'Antes de cada cita reservada') + tg('pendientes', 'Tratamientos pendientes', 'Cuando un mes tiene algo por reservar') + tg('beneficios', 'Beneficios disponibles', 'AGE Gift, consumiciones y Rewards') + tg('email', 'Avisos por correo', 'Además de en la app') +
    '</div></section><section class="sec"><h2 class="eyebrow">Recorrido</h2><div class="list">' + tg('fechas', 'Mostrar meses del calendario', 'Junto a «Mes N», p. ej. «oct 2026»') +
    '</div></section><section class="sec"><h2 class="eyebrow">General</h2><div class="list"><div class="tgrow"><span class="lrow-t"><span class="lrow-n">Idioma</span><span class="lrow-s">Español</span></span></div>' + lrow('Privacidad y consentimientos', 'Textos legales por confirmar', act('toast', 'Contenido legal pendiente de AGE Clinic')) + '</div></section>' +
    notice('Los avisos son simulados y se reflejan en Notificaciones.') + '</div>';
  return { html: h };
};

/* ---------- hojas (sheets) ---------- */
function sheetHtml() {
  var sh = S.ui.sheet; if (!sh) return '';
  var h = '<div class="sheet-bg" ' + act('closeSheet') + '></div><div class="sheet" role="dialog" aria-modal="true" aria-labelledby="sheet-t"><span class="grab" aria-hidden="true"></span>';
  if (sh === 'plans') {
    var cur = recPlan();
    h += '<h2 id="sheet-t">Ver recorrido <b>de</b></h2><div class="list">' + PLANS.map(function (p) {
      var mine = S.member && S.member.plan === p.id;
      return '<button class="lrow' + (p.id === cur ? ' on' : '') + '" ' + act('previewPlan', p.id) + ' aria-pressed="' + (p.id === cur) + '"><span class="radio' + (p.id === cur ? ' on' : '') + '"></span><span class="lrow-t"><span class="lrow-n">' + esc(p.name) + (mine ? ' <span class="tag">Tu plan</span>' : '') + '</span><span class="lrow-s">' + priceM(p.id) + ' · ' + countsText(p.id) + '</span></span></button>';
    }).join('') + '</div><p class="fine">Ver otro plan no cambia tu membresía.</p>';
  } else if (sh.indexOf('cancel:') === 0) {
    var id = sh.slice(7), c = COMP[id], it = item(id);
    h += '<h2 id="sheet-t">¿Cancelar la <b>reserva</b>?</h2><p class="neutral">' + esc(c.label) + ' · ' + cap(fDay(it.appt.date)) + ', ' + it.appt.time + '. El tratamiento volverá a quedar pendiente de reservar. Las condiciones de cancelación están por confirmar.</p>' +
      '<div class="stack">' + btn('Sí, cancelar reserva', act('cancel', id), 'btn-danger-solid btn-block') + btn('Mantener la cita', act('closeSheet'), 'btn-block') + '</div>';
  } else if (sh.indexOf('promo:') === 0) {
    var pr = promoById(sh.slice(6));
    h += '<h2 id="sheet-t">Solicitar <b>cita</b></h2><p class="fine">' + esc(pr.name) + ' · Exclusivo para socios</p>' +
      '<div class="field"><label for="f-pref">Preferencia horaria</label><select id="f-pref"><option>Mañanas</option><option>Tardes</option><option>Sin preferencia</option></select></div>' +
      '<div class="field"><label for="f-msg">Comentario (opcional)</label><textarea id="f-msg" rows="2"></textarea></div>' +
      '<p class="fine">Simulación: no se reserva hueco ni se realiza ningún pago. AGE Clinic confirmaría la cita.</p><div class="stack">' + btn('Enviar solicitud', act('promoSend', pr.id), 'btn-dark btn-block') + btn('Cancelar', act('closeSheet'), 'btn-block btn-text') + '</div>';
  } else if (sh.indexOf('promo-ok:') === 0) {
    var po = promoById(sh.slice(9));
    h += '<div class="empty" style="padding:12px 0 4px"><span class="ok-ic">' + ICON.check + '</span><h2 id="sheet-t">Solicitud <b>registrada</b></h2><p>Simulación. AGE Clinic te contactaría para confirmar la fecha y las condiciones de ' + esc(po.name) + '.</p></div>' + btn('Entendido', act('closeSheet'), 'btn-dark btn-block');
  }
  return h + '</div>';
}

/* ---------- render ---------- */
var screenEl, lastKey = null;
function tabbar(active) {
  return '<nav class="tabbar" aria-label="Navegación principal">' + [['inicio', 'Inicio', ICON.home], ['recorrido', 'Mi recorrido', ICON.route], ['reservas', 'Reservas', ICON.cal], ['perfil', 'Perfil', ICON.user]].map(function (t) {
    return '<button data-tab="' + t[0] + '"' + (t[0] === active ? ' aria-current="page" class="on"' : '') + '>' + t[2] + '<span>' + t[1] + '</span></button>';
  }).join('') + '</nav>';
}
function render() {
  var top = S.stack[S.stack.length - 1];
  var fn = SCR[top.r] || SCR.inicio;
  var out = fn(top.p || {});
  var key = top.r + JSON.stringify(top.p || {});
  var scr = document.getElementById('scr'), keep = (scr && key === lastKey) ? scr.scrollTop : 0;
  var noTabs = out.flow || !S.auth;
  screenEl.innerHTML = '<div class="scr' + (noTabs ? ' flow' : '') + '" id="scr">' + out.html + '</div>' + (noTabs ? '' : tabbar(S.stack[0].r)) + sheetHtml() +
    (S.ui.toast ? '<div class="toast" role="status">' + esc(S.ui.toast) + '</div>' : '');
  scr = document.getElementById('scr');
  if (!S.capture) {
    scr.scrollTop = keep;
    if (top.r === 'recorrido' && S.ui.recView === 'timeline' && !S.ui.recScrolled && key !== lastKey) {
      var el = scr.querySelector('.is-cur'); if (el) scr.scrollTop = Math.max(0, el.offsetTop - 160);
      S.ui.recScrolled = true;
    }
  }
  lastKey = key;
  syncPanel();
}
function push(r, p) { S.stack.push({ r: r, p: p || {} }); }
function setTab(t) { S.stack = [{ r: t, p: {} }]; S.ui.sheet = null; if (t === 'recorrido') S.ui.recScrolled = false; }
function popFlows() { while (S.stack.length > 1 && FLOW.indexOf(S.stack[S.stack.length - 1].r) > -1) S.stack.pop(); }
var toastTimer;
function toast(t) { S.ui.toast = t; clearTimeout(toastTimer); if (!S.capture) toastTimer = setTimeout(function () { S.ui.toast = null; render(); }, 2600); }

/* ---------- eventos ---------- */
function onClick(e) {
  var el = e.target.closest('[data-go],[data-act],[data-back],[data-tab]');
  if (!el || !screenEl.contains(el) || el.disabled) return;
  if (el.hasAttribute('data-tab')) { setTab(el.getAttribute('data-tab')); render(); return; }
  if (el.hasAttribute('data-back')) { S.ui.sheet = null; if (S.stack.length > 1) S.stack.pop(); render(); return; }
  if (el.hasAttribute('data-go')) {
    var r = el.getAttribute('data-go'), p = el.getAttribute('data-p'); p = p ? JSON.parse(p) : {};
    S.ui.sheet = null;
    if (r === 'activar') { S.ui.ack = false; S.ui.promo = { open: false, code: '', state: null }; }
    if (r === 'plan') S.ui.planOpen = { trat: true };
    if (r === 'registro' || r === 'login') { S.ui.form = {}; S.ui.errs = {}; S.ui.showPass = false; }
    push(r, p); render(); return;
  }
  var a = el.getAttribute('data-act'), arg = el.getAttribute('data-arg');
  doAct(a, arg, el);
}
function doAct(a, arg, el) {
  var top = S.stack[S.stack.length - 1];
  switch (a) {
    case 'closeFlow': popFlows(); break;
    case 'toTab': setTab(arg); break;
    case 'toMes': setTab('recorrido'); push('mes', { m: +arg }); break;
    case 'cmp': S.ui.cmp = arg; break;
    case 'recView': S.ui.recView = arg; S.ui.recScrolled = false; if (screenEl.querySelector('#scr')) screenEl.querySelector('#scr').scrollTop = 0; break;
    case 'recFilter': S.ui.recFilter = arg; break;
    case 'calSel': S.ui.calSel = +arg; break;
    case 'catFilter': S.ui.catFilter = arg; break;
    case 'resTab': S.ui.resTab = arg; break;
    case 'sheet': S.ui.sheet = arg; break;
    case 'closeSheet': S.ui.sheet = null; break;
    case 'previewPlan': S.ui.preview = (S.member && S.member.plan === arg) ? null : arg; S.ui.calSel = null; S.ui.sheet = null; S.ui.recScrolled = false; break;
    case 'previewRec': S.ui.preview = (S.member && S.member.plan === arg) ? null : arg; S.ui.calSel = null; S.ui.recView = 'calendar'; setTab('recorrido'); break;
    case 'mesNav': top.p = { m: +arg, plan: top.p.plan }; break;
    case 'readAll': S.readNotifs = true; break;
    case 'ack': S.ui.ack = el.checked; break;
    case 'activate': activate(arg); popFlows(); push('activada'); break;
    case 'changePlan': var n = PLAN[arg].name; activate(arg); setTab('inicio'); toast('Membresía cambiada a ' + n + ' (simulación)'); break;
    case 'pickDay': S.ui.draft.day = +arg; S.ui.draft.time = null; break;
    case 'pickTime': S.ui.draft.time = arg; break;
    case 'confirmBook':
      var dr = S.ui.draft, d = slotDays()[dr.day];
      if (dr.mode === 'cambio') requestChange(dr.id, d, dr.time); else book(dr.id, d, dr.time);
      S.readNotifs = false; S.ui.draft = null; popFlows(); push('reserva-ok', { id: dr.id }); break;
    case 'cancel': cancelAppt(arg); S.ui.sheet = null; setTab('reservas'); S.ui.resTab = 'proximas'; toast('Reserva cancelada. ' + COMP[arg].label + ' vuelve a estar pendiente.'); break;
    case 'complete': completeAppt(arg); S.stack.pop(); toast(COMP[arg].label + ' marcado como realizado'); break;
    case 'confirmChange': confirmChange(arg); toast('Cambio confirmado por la clínica (simulación)'); break;
    case 'redeem': redeem(arg); toast('Beneficio marcado como canjeado'); break;
    case 'pref': S.prefs[arg] = !S.prefs[arg]; break;
    case 'saveDatos':
      ['nombre', 'apellidos', 'email', 'telefono'].forEach(function (k) { var i = document.getElementById('f-' + k); if (i && i.value.trim()) S.user[k] = i.value.trim(); });
      S.stack.pop(); toast('Datos guardados'); break;
    case 'logout':
      var snap = snapshot(), acc = ACCOUNTS.filter(function (a) { return a.email === S.auth.email; })[0];
      if (acc) acc.snap = snap; else DEMO_SNAP = snap;
      scenario('sinsesion'); break;
    case 'planSec': S.ui.planOpen = S.ui.planOpen || {}; S.ui.planOpen[arg] = !S.ui.planOpen[arg]; break;
    case 'promoToggle': S.ui.promo = S.ui.promo || {}; var pi = document.getElementById('f-promo'); if (pi) S.ui.promo.code = pi.value; S.ui.promo.open = !S.ui.promo.open; break;
    case 'promoApply':
      var pc = ((document.getElementById('f-promo') || {}).value || '').trim().toUpperCase();
      S.ui.promo = { open: true, code: pc, state: /^[A-Z0-9]{4,20}$/.test(pc) ? 'ok' : 'err' }; break;
    case 'promoRemove': S.ui.promo = { open: true, code: '', state: null }; break;
    case 'showPass': readForm(['nombre', 'apellidos', 'email', 'pass', 'terms']); S.ui.showPass = !S.ui.showPass; break;
    case 'fillDemo': S.ui.form = { email: DEMO.user.email, pass: 'demo' }; S.ui.errs = {}; break;
    case 'register':
      var rf = readForm(['nombre', 'apellidos', 'email', 'pass', 'terms']), re = validateReg(rf);
      if (!re.email && (rf.email.toLowerCase() === DEMO.user.email || ACCOUNTS.some(function (a) { return a.email === rf.email.toLowerCase(); }))) re._form = 'Ya existe una cuenta con este correo. Inicia sesión.';
      S.ui.errs = re;
      if (Object.keys(re).length) break;
      var em = rf.email.toLowerCase();
      ACCOUNTS.push({ email: em, pass: rf.pass, nombre: rf.nombre, apellidos: rf.apellidos, snap: null });
      enterApp(em, null, { nombre: rf.nombre, apellidos: rf.apellidos, email: em, telefono: '', socia: 'AC-' + (1000 + ACCOUNTS.length) });
      if (arg) { push('activar', { id: arg }); S.ui.ack = false; } else toast('Cuenta creada (simulación)');
      break;
    case 'login':
      var lf = readForm(['email', 'pass']), le = {}, lem = (lf.email || '').toLowerCase();
      if (!EMAIL_RE.test(lem)) le.email = 'Escribe un correo válido, por ejemplo nombre@dominio.com.';
      if (!lf.pass) le.pass = 'Escribe tu contraseña.';
      var la = ACCOUNTS.filter(function (a) { return a.email === lem; })[0];
      if (!Object.keys(le).length && lem !== DEMO.user.email && (!la || la.pass !== lf.pass)) le._form = LOGIN_ERR;
      S.ui.errs = le;
      if (Object.keys(le).length) break;
      if (lem === DEMO.user.email) { if (DEMO_SNAP) enterApp(lem, DEMO_SNAP); else { scenario('botox'); S.scenario = 'cuenta'; } }
      else enterApp(lem, la.snap, { nombre: la.nombre, apellidos: la.apellidos, email: lem, telefono: '', socia: 'AC-' + (1000 + ACCOUNTS.indexOf(la) + 1) });
      if (arg && !S.member) { push('activar', { id: arg }); S.ui.ack = false; }
      break;
    case 'toast': toast(arg); break;
    case 'pastToggle': S.ui.pastOpen = !S.ui.pastOpen; break;
    case 'promoSend': S.promoReqs[arg] = true; S.ui.sheet = 'promo-ok:' + arg; break;
  }
  render();
}

/* ---------- panel de demostración e inventario ---------- */
function withDraft(sc, id, mode, day, time) { return function () { var c = COMP[id]; push('reservar-2', { id: id, mode: mode }); S.ui.draft = { id: id, mode: mode, day: day, time: time }; }; }
function regTo(plan) { push('membresias'); push('categoria', { cat: catOf(plan).id }); push('plan', { id: plan }); push('registro', { plan: plan }); }
var INV = [
  ['0', 'Acceso', [
    ['AC1', 'Bienvenida', 'sinsesion', null],
    ['AC2', 'Crear cuenta', 'sinsesion', function () { regTo('botox-essential'); }],
    ['AC3', 'Crear cuenta · errores', 'sinsesion', function () { regTo('botox-essential'); S.ui.form = { nombre: 'Lucía', apellidos: '', email: 'lucia@', pass: '1234', terms: false }; S.ui.errs = validateReg(S.ui.form); }],
    ['AC4', 'Iniciar sesión', 'sinsesion', function () { push('login'); }],
    ['AC5', 'Iniciar sesión · error', 'sinsesion', function () { push('login'); S.ui.form = { email: 'ana@ejemplo.com', pass: 'contraseña' }; S.ui.errs = { _form: LOGIN_ERR }; }]
  ]],
  ['A', 'Membresías', [
    ['A1', '¿Qué quieres cuidar? · categorías', 'sinsesion', function () { push('membresias'); }],
    ['A2', 'Modalidades · Labios', 'sinsesion', function () { push('membresias'); push('categoria', { cat: 'labios' }); }],
    ['A3', 'Modalidades · Bótox', 'sinsesion', function () { push('membresias'); push('categoria', { cat: 'botox' }); }],
    ['A4', 'Ficha · Botox Essential', 'nuevo', function () { push('membresias'); push('categoria', { cat: 'botox' }); push('plan', { id: 'botox-essential' }); }],
    ['A4b', 'Ficha · secciones desplegadas', 'nuevo', function () { push('membresias'); push('categoria', { cat: 'botox' }); push('plan', { id: 'botox-essential' }); S.ui.planOpen = { trat: true, rev: true, rec: true, cond: true }; }],
    ['A5', 'Ficha · Premium', 'nuevo', function () { push('membresias'); push('plan', { id: 'premium' }); }],
    ['A6', 'Activación · revisión', 'nuevo', function () { push('plan', { id: 'botox-essential' }); push('activar', { id: 'botox-essential' }); }],
    ['A6b', 'Activación · código registrado', 'nuevo', function () { push('plan', { id: 'botox-essential' }); push('activar', { id: 'botox-essential' }); S.ui.promo = { open: true, code: 'PRUEBA1', state: 'ok' }; }],
    ['A6c', 'Activación · código no válido', 'nuevo', function () { push('plan', { id: 'botox-essential' }); push('activar', { id: 'botox-essential' }); S.ui.promo = { open: true, code: 'AB-1', state: 'err' }; }],
    ['A7', 'Activación · confirmada', 'recien', function () { push('activada'); }],
    ['A8', 'Mi membresía activa', 'botox', function () { setTab('perfil'); push('mi-membresia'); }],
    ['A9', 'Cambio de plan · confirmación', 'botox', function () { setTab('perfil'); push('mi-membresia'); push('plan', { id: 'premium' }); push('cambiar', { id: 'premium' }); }]
  ]],
  ['B', 'Inicio', [
    ['B1', 'Inicio · sin membresía', 'nuevo', null],
    ['B2', 'Inicio · recién activada', 'recien', null],
    ['B3', 'Inicio · con próxima cita', 'botox', null],
    ['B4', 'Inicio · varias acciones en el mes', 'premium', null],
    ['B5', 'Inicio · mes sin actividad', 'botox5', null],
    ['B6', 'Notificaciones', 'botox', function () { push('notificaciones'); }],
    ['B7', 'Notificaciones · vacío', 'nuevo', function () { push('notificaciones'); }]
  ]],
  ['C', 'Tratamientos', [
    ['C1', 'Tratamientos · en mi plan', 'botox', function () { push('tratamientos'); }],
    ['C2', 'Catálogo completo', 'botox', function () { S.ui.catFilter = 'todos'; push('tratamientos'); }],
    ['C3', 'Ficha de tratamiento', 'botox', function () { push('tratamientos'); push('tratamiento', { key: 'botox-tercio' }); }],
    ['C4', 'Incluidos por estado', 'botox', function () { setTab('perfil'); push('mis-tratamientos'); }]
  ]],
  ['D', 'Reservas', [
    ['D1', 'Próximas reservas', 'botox', function () { setTab('reservas'); }],
    ['D2', 'Próximas · vacío', 'botox5', function () { setTab('reservas'); }],
    ['D3', 'Historial', 'botox', function () { setTab('reservas'); S.ui.resTab = 'historial'; }],
    ['D4', 'Historial · vacío', 'recien', function () { setTab('reservas'); S.ui.resTab = 'historial'; }],
    ['D5', 'Nueva reserva · tratamiento', 'premium', function () { setTab('reservas'); push('reservar-1'); }],
    ['D6', 'Nueva reserva · fecha y hora', 'premium', function () { setTab('reservas'); push('reservar-1'); withDraft(0, 'premium|6|0', 'nueva', 4, '11:30')(); }],
    ['D7', 'Nueva reserva · revisar', 'premium', function () { setTab('reservas'); push('reservar-1'); withDraft(0, 'premium|6|0', 'nueva', 4, '11:30')(); push('reservar-3', { id: 'premium|6|0', mode: 'nueva' }); }],
    ['D8', 'Reserva confirmada', 'premium', function () { book('premium|6|0', slotDays()[4], '11:30'); push('reserva-ok', { id: 'premium|6|0' }); }],
    ['D9', 'Detalle de cita', 'botox', function () { setTab('reservas'); push('cita', { id: 'botox-essential|6|0' }); }],
    ['D10', 'Cancelar · confirmación', 'botox', function () { setTab('reservas'); push('cita', { id: 'botox-essential|6|0' }); S.ui.sheet = 'cancel:botox-essential|6|0'; }],
    ['D11', 'Reserva cancelada', 'botox', function () { cancelAppt('botox-essential|6|0'); setTab('reservas'); S.ui.toast = 'Reserva cancelada. Botox tercio superior vuelve a estar pendiente.'; }],
    ['D12', 'Cambio solicitado', 'botox', function () { requestChange('botox-essential|6|0', D(2026, 10, 3), '17:00'); setTab('reservas'); push('cita', { id: 'botox-essential|6|0' }); }]
  ]],
  ['E', 'Mi recorrido', [
    ['E1', 'Línea temporal · Botox Essential', 'botox', function () { setTab('recorrido'); }],
    ['E2', 'Línea temporal · Premium', 'premium', function () { setTab('recorrido'); }],
    ['E3', 'Calendario · Botox Essential', 'botox', function () { setTab('recorrido'); S.ui.recView = 'calendar'; }],
    ['E4', 'Calendario · Premium', 'premium', function () { setTab('recorrido'); S.ui.recView = 'calendar'; }],
    ['E5', 'Detalle · mes actual con cita', 'botox', function () { setTab('recorrido'); push('mes', { m: 6 }); }],
    ['E6', 'Detalle · varias acciones', 'premium', function () { setTab('recorrido'); push('mes', { m: 6 }); }],
    ['E7', 'Detalle · mes sin actividad', 'botox', function () { setTab('recorrido'); push('mes', { m: 5 }); }],
    ['E8', 'Selector de plan', 'botox', function () { setTab('recorrido'); S.ui.sheet = 'plans'; }],
    ['E9', 'Vista previa de otro plan', 'botox', function () { setTab('recorrido'); S.ui.preview = 'premium'; }],
    ['E10', 'Sin membresía', 'nuevo', function () { setTab('recorrido'); }],
    ['E11', 'Leyenda de estados', 'botox', function () { setTab('recorrido'); push('leyenda'); }],
    ['E12', 'Detalle · mes futuro bloqueado', 'botox', function () { setTab('recorrido'); push('mes', { m: 8 }); }]
  ]],
  ['F', 'Perfil', [
    ['F1', 'Perfil', 'botox', function () { setTab('perfil'); }],
    ['F2', 'Datos personales', 'botox', function () { setTab('perfil'); push('datos'); }],
    ['F3', 'Historial de tratamientos', 'botox', function () { setTab('perfil'); push('historial'); }],
    ['F4', 'Beneficios', 'premium', function () { setTab('perfil'); push('beneficios'); }],
    ['F5', 'Detalle de beneficio', 'premium', function () { setTab('perfil'); push('beneficios'); push('beneficio', { id: 'premium|6|1' }); }],
    ['F6', 'Preferencias y ajustes', 'botox', function () { setTab('perfil'); push('ajustes'); }],
    ['F7', 'Perfil · sin membresía', 'nuevo', function () { setTab('perfil'); }]
  ]],
  ['G', 'Exclusivo para socios', [
    ['G1', 'Listado de promociones', 'botox', function () { push('socios'); }],
    ['G2', 'Ficha · adicional a tu plan', 'botox', function () { push('socios'); push('promo', { id: 'hifu' }); }],
    ['G3', 'Ficha · incluido en tu plan', 'premium', function () { push('socios'); push('promo', { id: 'hifu' }); }],
    ['G4', 'Solicitar cita · simulación', 'botox', function () { push('socios'); push('promo', { id: 'hifu' }); S.ui.sheet = 'promo:hifu'; }],
    ['G5', 'Solicitud registrada', 'botox', function () { push('socios'); push('promo', { id: 'hifu' }); S.promoReqs.hifu = true; S.ui.sheet = 'promo-ok:hifu'; }]
  ]]
];
var INVMAP = {};
INV.forEach(function (g) { g[2].forEach(function (s) { INVMAP[s[0]] = { code: s[0], name: s[1], sc: s[2], fn: s[3], sec: g[0] + ' · ' + g[1] }; }); });
function show(code) {
  var s = INVMAP[code]; if (!s) return;
  scenario(s.sc); if (s.fn) s.fn(); lastKey = null; S.curCode = code; render();
  var scr = document.getElementById('scr'); if (scr && !S.capture && code !== 'E1' && code !== 'E2') scr.scrollTop = 0;
}
var SCN = { sinsesion: 'Sin sesión · Bienvenida', nuevo: 'Con sesión · sin membresía', recien: 'Recién activada · Botox Essential', botox: 'Socia · Botox Essential, Mes 6', premium: 'Socia · Premium, Mes 6', botox5: 'Socia · Botox Essential, Mes 5' };
function buildPanel() {
  var sc = document.getElementById('scn');
  if (sc) sc.innerHTML = ['sinsesion', 'nuevo', 'recien', 'botox', 'premium'].map(function (k) { return '<button class="pbtn" data-scn="' + k + '">' + SCN[k] + '</button>'; }).join('');
  var inv = document.getElementById('inv');
  if (inv) inv.innerHTML = INV.map(function (g) {
    return '<details' + (g[0] === 'E' || g[0] === 'G' ? ' open' : '') + '><summary><b>' + g[0] + '</b> ' + g[1] + ' <span>' + g[2].length + '</span></summary><ul>' + g[2].map(function (s) { return '<li><button data-code="' + s[0] + '"><code>' + s[0] + '</code>' + s[1] + '</button></li>'; }).join('') + '</ul></details>';
  }).join('');
  var cyc = document.getElementById('cyc');
  if (cyc) { var o = ''; for (var i = 1; i <= 12; i++) o += '<option value="' + i + '">Mes ' + i + '</option>'; cyc.innerHTML = o; }
  document.addEventListener('click', function (e) {
    var tp = e.target.closest('#toggle-panel');
    if (tp) { var on = document.body.classList.toggle('present'); tp.setAttribute('aria-pressed', String(on)); tp.textContent = on ? 'Mostrar panel de demostración' : 'Modo paciente: ocultar panel'; return; }
    if (e.target.closest('#demo-fab')) { document.body.classList.add('panel-open'); return; }
    if (e.target.closest('#close-panel')) { document.body.classList.remove('panel-open'); return; }
    if (e.target.closest('[data-scn],[data-code]')) document.body.classList.remove('panel-open');
    var b = e.target.closest('[data-scn]');
    if (b) { scenario(b.getAttribute('data-scn')); lastKey = null; S.curCode = null; render(); return; }
    var c = e.target.closest('[data-code]');
    if (c) { show(c.getAttribute('data-code')); return; }
    if (e.target.closest('#reset')) { scenario(S.scenario === 'botox5' ? 'botox' : S.scenario); lastKey = null; render(); }
  });
  if (cyc) cyc.addEventListener('change', function () { if (S.member) { setCycle(+cyc.value); lastKey = null; render(); } });
}
function syncPanel() {
  var cyc = document.getElementById('cyc'), w = document.getElementById('cyc-wrap');
  if (cyc) { cyc.disabled = !S.member; if (S.member) cyc.value = S.member.cycle; }
  if (w) w.classList.toggle('dim', !S.member);
  var st = document.getElementById('pstate');
  if (st) st.textContent = !S.auth ? 'Sin sesión · hoy simulado: ' + fDate(today()) : S.member ? PLAN[S.member.plan].name + ' · Mes ' + S.member.cycle + ' de 12 · hoy simulado: ' + fDate(today()) : 'Sin membresía · hoy simulado: ' + fDate(today());
  document.querySelectorAll('[data-scn]').forEach(function (b) { b.setAttribute('aria-pressed', String(b.getAttribute('data-scn') === S.scenario || (S.scenario === 'botox5' && b.getAttribute('data-scn') === 'botox'))); });
  document.querySelectorAll('[data-code]').forEach(function (b) { b.classList.toggle('on', b.getAttribute('data-code') === S.curCode); });
}

/* ---------- arranque ---------- */
function boot() {
  screenEl = document.getElementById('screen');
  screenEl.addEventListener('click', onClick);
  screenEl.addEventListener('submit', function (e) { e.preventDefault(); });
  buildPanel();
  scenario('sinsesion');
  var h = (location.hash || '').slice(1).toUpperCase(), hk = Object.keys(INVMAP).filter(function (k) { return k.toUpperCase() === h; })[0];
  if (hk) show(hk); else render();
}
window.AGE = { show: show, scenario: scenario, render: render, INV: INV, INVMAP: INVMAP, get S() { return S; },
  capture: function (on) { S.capture = on; document.getElementById('device').classList.toggle('cap', on); } };
if (document.readyState === 'loading') document.addEventListener('DOMContentLoaded', boot); else boot();
})();
