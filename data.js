/* AGE Club · datos locales del prototipo
   Fuente de verdad: «El recorrido del cliente.pdf» (matriz de 6 planes × 12 meses)
   y «AGE Club — Briefing UX Njord» v1.0 (22 oct 2026).
   Todo lo que no aparece en esas fuentes se marca como POR_CONFIRMAR o DEMO. */

var POR_CONFIRMAR = 'Por confirmar';

/* Catálogo: cada servicio o beneficio que aparece en el PDF, con su etiqueta literal.
   type: tratamiento | revision | regalo | recompensa  */
var CATALOG = {
  'acido-labio':      { name: 'Ácido en labio', type: 'tratamiento' },
  'labio-contorno':   { name: 'Labio + contorno', type: 'tratamiento', note: 'En el plan Premium aparece como «Labios + contorno». Confirmar si es el mismo procedimiento.' },
  'labios-contorno':  { name: 'Labios + contorno', type: 'tratamiento', note: 'En Labios Plus aparece como «Labio + contorno». Confirmar si es el mismo procedimiento.' },
  'peeling-scrub':    { name: 'Peeling / scrub', type: 'tratamiento' },
  'peeling-higiene':  { name: 'Peeling / higiene', type: 'tratamiento' },
  'higiene-facial':   { name: 'Higiene facial', type: 'tratamiento' },
  'botox-tercio':     { name: 'Botox tercio superior', type: 'tratamiento' },
  'botox':            { name: 'Botox', type: 'tratamiento', note: 'El PDF no especifica la zona de aplicación.' },
  'hifu':             { name: 'HIFU', type: 'tratamiento' },
  'skinbooster':      { name: 'Skinbooster', type: 'tratamiento' },
  'radiesse':         { name: 'Radiesse', type: 'tratamiento' },
  'polinucleotidos':  { name: 'Polinucleótidos', type: 'tratamiento' },
  'trat-seguimiento': { name: 'Tratamiento y seguimiento', type: 'tratamiento', note: 'El PDF no indica qué tratamiento es ni en qué consiste el seguimiento.' },
  'mantenimiento':    { name: 'Mantenimiento', type: 'tratamiento', note: 'El PDF no indica qué incluye el mantenimiento.' },
  'retoque-revision': { name: 'Retoque / revisión', type: 'revision', note: 'Confirmar si se reserva como cita independiente.' },
  'valoracion':       { name: 'Valoración', type: 'revision', note: 'Aparece junto a Radiesse en el Mes 1 de Premium.' },
  'age-gift':         { name: 'AGE Gift', type: 'regalo', note: 'Goodie bag en tienda. Forma de recogida por confirmar.' },
  'matcha':           { name: 'Matcha/coffee + croissant', type: 'regalo', note: 'Consumición incluida. Dónde y cómo se canjea, por confirmar.' },
  'rewards':          { name: 'Rewards', type: 'recompensa', note: 'Qué incluyen y cómo se canjean, por confirmar.' }
};

var TYPES = {
  tratamiento: { label: 'Tratamiento', plural: 'Tratamientos' },
  revision:    { label: 'Revisión', plural: 'Revisiones' },
  regalo:      { label: 'Regalo', plural: 'Regalos' },
  recompensa:  { label: 'Recompensa', plural: 'Recompensas' }
};

/* Matriz literal. Cada mes: [textoOriginalDelPDF, [[clave, etiquetaLiteral], ...]] o null si la casilla está vacía */
var PLANS = [
  { id: 'labios-essential', name: 'Labios Essential', price: '25 €', months: [
    ['Ácido en labio', [['acido-labio', 'Ácido en labio']]],
    ['Retoque / revisión', [['retoque-revision', 'Retoque / revisión']]],
    null,
    ['AGE Gift (goodie bag en tienda)', [['age-gift', 'AGE Gift (goodie bag en tienda)']]],
    null,
    ['Peeling / scrub', [['peeling-scrub', 'Peeling / scrub']]],
    null,
    ['AGE Gift (goodie bag en tienda)', [['age-gift', 'AGE Gift (goodie bag en tienda)']]],
    null,
    ['Tratamiento y seguimiento', [['trat-seguimiento', 'Tratamiento y seguimiento']]],
    null,
    ['AGE Gift (goodie, tienda) + Rewards', [['age-gift', 'AGE Gift (goodie, tienda)'], ['rewards', 'Rewards']]]
  ]},
  { id: 'labios-plus', name: 'Labios Plus', price: '45 €', months: [
    ['Labio + contorno', [['labio-contorno', 'Labio + contorno']]],
    ['Retoque / revisión', [['retoque-revision', 'Retoque / revisión']]],
    null,
    ['AGE Gift (goodie bag en tienda)', [['age-gift', 'AGE Gift (goodie bag en tienda)']]],
    null,
    ['Peeling / scrub', [['peeling-scrub', 'Peeling / scrub']]],
    null,
    ['AGE Gift (goodie bag en tienda)', [['age-gift', 'AGE Gift (goodie bag en tienda)']]],
    null,
    ['Labio + contorno', [['labio-contorno', 'Labio + contorno']]],
    null,
    ['Mantenimiento + Rewards', [['mantenimiento', 'Mantenimiento'], ['rewards', 'Rewards']]]
  ]},
  { id: 'botox-essential', name: 'Botox Essential', price: '40 €', months: [
    ['Botox tercio superior', [['botox-tercio', 'Botox tercio superior']]],
    ['Retoque / revisión', [['retoque-revision', 'Retoque / revisión']]],
    null,
    ['AGE Gift (goodie bag en tienda)', [['age-gift', 'AGE Gift (goodie bag en tienda)']]],
    null,
    ['Botox tercio superior', [['botox-tercio', 'Botox tercio superior']]],
    null,
    ['Retoque / revisión', [['retoque-revision', 'Retoque / revisión']]],
    null,
    ['AGE Gift (goodie bag en tienda)', [['age-gift', 'AGE Gift (goodie bag en tienda)']]],
    null,
    ['Higiene facial + Rewards', [['higiene-facial', 'Higiene facial'], ['rewards', 'Rewards']]]
  ]},
  { id: 'botox-plus', name: 'Botox Plus', price: '60 €', months: [
    ['HIFU', [['hifu', 'HIFU']]],
    ['Retoque / revisión + Botox', [['retoque-revision', 'Retoque / revisión'], ['botox', 'Botox']]],
    null,
    ['Retoque / revisión + AGE Gift', [['retoque-revision', 'Retoque / revisión'], ['age-gift', 'AGE Gift']]],
    null,
    ['Peeling / higiene', [['peeling-higiene', 'Peeling / higiene']]],
    null,
    ['Botox', [['botox', 'Botox']]],
    null,
    ['Retoque / revisión + AGE Gift', [['retoque-revision', 'Retoque / revisión'], ['age-gift', 'AGE Gift']]],
    null,
    ['Higiene facial + Rewards', [['higiene-facial', 'Higiene facial'], ['rewards', 'Rewards']]]
  ]},
  { id: 'skinbooster-glow', name: 'Skinbooster Glow', price: '40 €', months: [
    ['Skinbooster', [['skinbooster', 'Skinbooster']]],
    ['AGE Gift (goodie bag en tienda)', [['age-gift', 'AGE Gift (goodie bag en tienda)']]],
    null,
    ['Skinbooster', [['skinbooster', 'Skinbooster']]],
    null,
    ['Matcha/coffee + croissant', [['matcha', 'Matcha/coffee + croissant']]],
    null,
    ['Skinbooster', [['skinbooster', 'Skinbooster']]],
    null,
    ['AGE Gift (goodie bag en tienda)', [['age-gift', 'AGE Gift (goodie bag en tienda)']]],
    null,
    ['Skinbooster + Rewards', [['skinbooster', 'Skinbooster'], ['rewards', 'Rewards']]]
  ]},
  { id: 'premium', name: 'Premium', price: '200 €', months: [
    ['Radiesse + valoración', [['radiesse', 'Radiesse'], ['valoracion', 'Valoración']]],
    ['HIFU', [['hifu', 'HIFU']]],
    ['Botox', [['botox', 'Botox']]],
    ['Retoque / revisión + HIFU', [['retoque-revision', 'Retoque / revisión'], ['hifu', 'HIFU']]],
    ['Peeling / higiene', [['peeling-higiene', 'Peeling / higiene']]],
    ['Polinucleótidos + AGE Gift', [['polinucleotidos', 'Polinucleótidos'], ['age-gift', 'AGE Gift']]],
    ['Labios + contorno', [['labios-contorno', 'Labios + contorno']]],
    ['Peeling / higiene', [['peeling-higiene', 'Peeling / higiene']]],
    ['Botox', [['botox', 'Botox']]],
    ['Retoque / revisión + AGE Gift', [['retoque-revision', 'Retoque / revisión'], ['age-gift', 'AGE Gift']]],
    ['Skinbooster', [['skinbooster', 'Skinbooster']]],
    ['AGE Gift + Rewards', [['age-gift', 'AGE Gift'], ['rewards', 'Rewards']]]
  ]}
];

/* Datos de demostración (no proceden de los documentos) */
var DEMO = {
  baseToday: [2026, 9, 22],           // 22 oct 2026: «hoy» simulado
  user: { nombre: 'Lucía', apellidos: 'Martín Soler', email: 'lucia.martin@ejemplo.com', telefono: '+34 600 000 000', socia: 'AC-0427' },
  times: ['10:00', '10:30', '11:30', '12:00', '13:00', '16:00', '17:00', '18:30'],
  centro: 'AGE Clinic · dirección por confirmar',
  profesional: 'Profesional asignado por confirmar'
};

/* V4 · Categorías de selección (feedback de OUI Creatives). Líneas de apoyo derivadas de la matriz del PDF. */
var CATEGORIES = [
  { id: 'labios',  name: 'Labios',           line: 'Tratamientos de labios con revisión y regalos', plans: ['labios-essential', 'labios-plus'] },
  { id: 'botox',   name: 'Bótox',            line: 'Bótox, con revisiones y regalos. En Plus, también HIFU', plans: ['botox-essential', 'botox-plus'] },
  { id: 'glow',    name: 'Skinbooster Glow', line: 'Skinbooster cuatro veces al año, con regalos', plans: ['skinbooster-glow'] },
  { id: 'premium', name: 'Premium',          line: 'Un tratamiento o servicio en cada uno de los 12 meses', plans: ['premium'] }
];
