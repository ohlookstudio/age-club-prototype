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
  { id: 'botox-essential', name: 'TOX Essential', price: '40 €', months: [
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
  { id: 'botox-plus', name: 'TOX Plus', price: '60 €', months: [
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

/* V5.6 · Nomenclatura comercial: la categoría «Bótox» pasa a «TOX» (TOX Essential, TOX Plus) por indicación del cliente.
   Los nombres de tratamiento del PDF («Botox tercio superior», «Botox») se mantienen. Los ids internos no cambian. */

/* Datos de demostración (no proceden de los documentos) */
var DEMO = {
  baseToday: [2026, 9, 22],           // 22 oct 2026: «hoy» simulado
  user: { nombre: 'Lucía', apellidos: 'Martín Soler', email: 'lucia.martin@ejemplo.com', telefono: '+34 600 000 000', socia: 'AC-0427' },
  times: ['10:00', '10:30', '11:30', '12:00', '13:00', '16:00', '17:00', '18:30'],
  centro: 'AGE Clinic · dirección por confirmar',
  profesional: 'Asignado por la clínica'   // la paciente nunca elige profesional
};

/* V5.5 · Duración de las citas — PENDIENTE DE CONFIRMAR CON AGE CLINIC.
   Ningún documento define qué tratamientos o planes admiten 60 minutos: estos valores son de demostración.
   slot: minutos de cada espacio de agenda. Una cita de 60 min ocupa 2 espacios consecutivos de 30 min.
   Prioridad de las reglas: byPlan[plan][clave] > byPlan[plan].default > byKey[clave] > default.
   Cada regla es la lista de duraciones permitidas, en minutos. Si solo hay una, no se pregunta. */
var DURATIONS = {
  status: 'demo',
  slot: 30,
  'default': [30],
  byKey: {},
  byPlan: {
    'premium':    { 'default': [30, 60], 'valoracion': [30], 'retoque-revision': [30] },
    'botox-plus': { 'hifu': [30, 60] }
  }
};

/* V5.5 · Avisos generales visibles sin iniciar sesión. Ejemplos sin datos personales (DEMO).
   go: pantalla a la que lleva el aviso (o null si es solo informativo). */
var GENERAL_NOTIFS = [
  { i: 'cards', t: 'Conoce AGE Club', x: 'Seis membresías con un recorrido de 12 meses. Puedes explorarlas sin crear una cuenta.', go: 'membresias' },
  { i: 'spark', t: 'Exclusivo para socios', x: 'Con una membresía activa verás promociones de tratamientos adicionales.', go: null },
  { i: 'user',  t: 'Tus avisos personales', x: 'Los recordatorios de citas y beneficios aparecen después de iniciar sesión.', go: 'login' }
];

/* V4 · Categorías de selección (feedback de OUI Creatives). Líneas de apoyo derivadas de la matriz del PDF. */
var CATEGORIES = [
  { id: 'labios',  name: 'Labios',           line: 'Tratamientos de labios con revisión y regalos', plans: ['labios-essential', 'labios-plus'] },
  { id: 'botox',   name: 'TOX',              line: 'Tratamientos con neuromoduladores, revisiones y regalos. En Plus, también HIFU', plans: ['botox-essential', 'botox-plus'] },   // V5.6: antes «Bótox»
  { id: 'glow',    name: 'Skinbooster Glow', line: 'Skinbooster cuatro veces al año, con regalos', plans: ['skinbooster-glow'] },
  { id: 'premium', name: 'Premium',          line: 'Un tratamiento o servicio en cada uno de los 12 meses', plans: ['premium'] }
];

/* V5 · Exclusivo para socios. Promociones de tratamientos adicionales, independientes de lo incluido en cada membresía.
   Para añadir una promoción, añade un objeto; para retirarla, cambia status a 'retirada' o bórrala.
   status: 'ejemplo' (se muestra marcada como ejemplo) | 'aprobada' | 'retirada' (no se muestra).
   key: clave del catálogo; la app la cruza con el plan activo para indicar si el tratamiento ya está incluido.
   price.regular / price.member: importe en euros o null (sin confirmar). El descuento solo se muestra si ambos existen.
   plans: 'all' o lista de ids de plan a los que se ofrece. validFrom / validTo: 'AAAA-MM-DD' o null. */
var PROMOS = [
  { id: 'hifu', status: 'ejemplo', key: 'hifu', name: 'HIFU', summary: null,
    image: { src: 'img/promo-hifu.jpg', alt: 'Profesional realizando un tratamiento con aparatología en una cabina de AGE Clinic', source: 'DSCF0282.jpeg' },
    price: { regular: null, member: null }, conditions: [], plans: 'all', validFrom: null, validTo: null },
  { id: 'peeling', status: 'ejemplo', key: 'peeling-higiene', name: 'Peeling / higiene', summary: null,
    image: { src: 'img/promo-peel.jpg', alt: 'Aplicación de un producto con pincel sobre la piel de un paciente', source: 'DSCF9956.jpeg' },
    price: { regular: null, member: null }, conditions: [], plans: 'all', validFrom: null, validTo: null },
  { id: 'labios', status: 'ejemplo', key: 'labios-contorno', name: 'Labios + contorno', summary: null,
    image: { src: 'img/promo-labios.jpg', alt: 'Preparación de los labios de una paciente antes del tratamiento', source: 'DSCF0379.jpeg' },
    price: { regular: null, member: null }, conditions: [], plans: 'all', validFrom: null, validTo: null }
];

/* V5 · Fotografías reales de AGE Clinic (carpeta Imagenes_Clinica), recortadas y optimizadas para web. */
var PHOTOS = {
  bienvenida: ['img/ageclub_bienvenida.jpg', 'Mano apoyada en el rostro de una mujer'],
  inicio: ['img/inicio.jpg', ''],
  membresias: ['img/membresias.jpg', ''],
  socios: ['img/socios.jpg', 'Recepción de AGE Clinic con el equipo atendiendo'],
  reserva: ['img/reserva.jpg', 'Sala de tratamiento de AGE Clinic vista a través de un espejo en arco'],
  activada: ['img/activada.jpg', ''],
  perfil: ['img/perfil.jpg', ''],
  /* [src, alt, encuadre en tarjeta, encuadre en cabecera] */
  cat: { labios: ['img/ageclub_labios.jpg', 'Detalle de unos labios', '50% 42%', '50% 45%'], botox: ['img/ageclub_botox.jpg', 'Retrato de un hombre de tres cuartos', '50% 30%', '50% 30%'], glow: ['img/ageclub_skinbooster.jpg', 'Rostro de una mujer con la piel luminosa', '50% 22%', '50% 25%'], premium: ['img/ageclub_premium.jpg', 'Detalle de una mirada', '0% 50%', '30% 50%'] },
  tipo: { tratamiento: ['img/trat-tratamiento.jpg', 'Infiltración en el rostro de un paciente'], revision: ['img/trat-revision.jpg', 'Una profesional valora el rostro de una paciente'], regalo: ['img/trat-regalo.jpg', 'Producto de cuidado facial en manos de una profesional'], recompensa: ['img/trat-recompensa.jpg', 'Estanterías con productos en AGE Clinic'] },
  cita: { tratamiento: ['img/cita.jpg', 'Profesional con guantes preparando un vial y una jeringa'], revision: ['img/revision.jpg', 'Una doctora revisa el rostro de una paciente'] }
};
