/* ================================================================
 DIGISTYLZE · COUCHE FX (GSAP + ScrollTrigger)
 ================================================================
 Chorégraphie de la home et de creation-site-web : intro du héros,
 reveals en cascade, parallaxe, pile de cartes au scroll, marquees
 sensibles à la vélocité, boutons magnétiques, tilt 3D.

 REMPLACE motion.js sur ces deux pages uniquement. Les autres pages
 gardent motion.js ; les deux fichiers ne cohabitent jamais.

 ── L'INVARIANT, HÉRITÉ DE motion.js ────────────────────────────
 Tout élément animé ici est VISIBLE PAR DÉFAUT en CSS. Les états de
 départ (opacité 0, décalages) vivent derrière `html.wf-js.has-fx`,
 et `has-fx` n'est posé que si GSAP est réellement chargé ET que le
 visiteur n'a pas demandé moins de mouvement. Fichier absent, CSP,
 reduced-motion : la classe n'arrive jamais, la page s'affiche
 entièrement. Aucune exception.
 ================================================================ */
(function () {
 'use strict';

 var root = document.documentElement;
 var mqReduce = matchMedia('(prefers-reduced-motion:reduce)');
 if (mqReduce.matches) return;
 if (!window.gsap || !window.ScrollTrigger) return;

 gsap.registerPlugin(ScrollTrigger);
 root.classList.add('has-fx');

 var EASE = 'power4.out';
 var EXPO = 'expo.out';

 function $(sel, ctx) { return (ctx || document).querySelector(sel); }
 function $$(sel, ctx) { return [].slice.call((ctx || document).querySelectorAll(sel)); }
 function num(el, attr, def) {
 var v = parseFloat(el.getAttribute(attr));
 return isNaN(v) ? def : v;
 }

 /* ===============================================================
 LE REGISTRE DE SCÈNES · DTZ.fx
 ===============================================================
 Ajouté le 2026-08-12. Ce fichier était trois IIFE fermées qui
 n'exposaient rien : pas de cycle de vie, pas de démontage, pas
 de registre. Chaque chorégraphie était un `$$(...).forEach(...)`
 copié-collé, et ajouter une scène voulait dire allonger le
 fichier. Trois conséquences mesurées :, une trentaine d'écouteurs n'étaient jamais retirés ;, les déplacements de DOM du théâtre étaient irréversibles,
 d'où le rechargement obligatoire pour franchir 1120 px ;, la bascule à chaud vers `reduced-motion` appelait
 `gsap.globalTimeline.clear()`, qui tue AUSSI ce que site.js
 aurait lancé, et ne savait pas revenir en arrière.

 LES 13 CHORÉGRAPHIES EXISTANTES NE SONT PAS PORTÉES ICI.
 Elles fonctionnent et sont vérifiées ; un big-bang sur du code
 d'animation qui marche coûte cher et ne rapporte rien. Elles
 migreront page par page, quand leur markup sera recomposé et
 qu'on pourra vérifier chacune contre une page réelle. C'est la
 même discipline que sc.css, et c'est ce qui a manqué aux deux
 bibliothèques de composants mortes du projet.

 Ce que le registre sert dès maintenant : la couche WebGL du
 lot 4, qui a besoin d'un montage/démontage propre et d'un
 `gsap.matchMedia()` partagé.

 UTILISATION
 DTZ.fx.register('nappe', {
 select: '[data-gl="nappe"]', // string ou () => Element[]
 media: DTZ.fx.BP.desk, // optionnel
 priority: 10, // → refreshPriority (voir ctx.st)
 mount: function (hote, ctx) { … }
 });
 =============================================================== */
 var DTZ = window.DTZ = window.DTZ || {};

 /* Un seul gsap.matchMedia() pour tout le site : c'est lui qui rend le
 montage réversible dans les DEUX sens, là où les `matchMedia()`
 natifs du fichier sont évalués une seule fois au chargement. */
 var mm = gsap.matchMedia();

 var BP = {
 fin: '(hover:hover) and (pointer:fine)',
 desk: '(min-width:1121px)',
 tablette: '(max-width:1120px)',
 large: '(min-width:768px)'
 };

 var scenes = {};

 function Contexte(priorite) {
 var gctx = gsap.context(function () {});
 var offs = [], rafs = [], timers = [];
 return {
 priorite: priorite || 0,

 /* Tweens et ScrollTrigger : gsap.context les reprend seul. */
 add: function (fn) { gctx.add(fn); return this; },

 /* ScrollTrigger avec la priorité de la scène injectée.
 `refreshPriority` doit être déclaré par toute scène qui épingle :
 sans lui, le pin-spacer d'une épingle décale les mesures de tous
 les déclencheurs créés avant elle. C'est le bug le plus coûteux
 qu'ait connu ce fichier (voir le théâtre, §10), il devient ici
 une propriété du registre plutôt qu'une ligne à ne pas oublier. */
 st: function (vars) {
 if (vars.refreshPriority == null && this.priorite) {
 vars.refreshPriority = this.priorite;
 }
 var t;
 gctx.add(function () { t = ScrollTrigger.create(vars); });
 return t;
 },

 /* Les trois registres que gsap.context ne tient pas. */
 on: function (cible, evt, fn, opts) {
 cible.addEventListener(evt, fn, opts);
 offs.push(function () { cible.removeEventListener(evt, fn, opts); });
 return this;
 },
 raf: function (fn) {
 gsap.ticker.add(fn);
 rafs.push(fn);
 return this;
 },
 timer: function (fn, ms) {
 var id = setInterval(fn, ms);
 timers.push(id);
 return this;
 },

 /* Défait dans l'ordre inverse du montage. */
 revert: function () {
 timers.forEach(clearInterval);
 rafs.forEach(function (f) { gsap.ticker.remove(f); });
 offs.forEach(function (f) { f(); });
 timers = []; rafs = []; offs = [];
 gctx.revert();
 }
 };
 }

 function monter(def) {
 var hotes = typeof def.select === 'function'
 ? def.select()
 : $$(def.select);
 if (!hotes.length) return null;
 var ctx = Contexte(def.priority);
 hotes.forEach(function (h) { def.mount(h, ctx); });
 return ctx;
 }

 DTZ.fx = {
 BP: BP,
 mm: mm,

 register: function (nom, def) {
 scenes[nom] = def;
 var vivants = [];
 function demarrer() {
 var c = monter(def);
 if (c) vivants.push(c);
 /* Toute création ou destruction de scène change potentiellement la
 hauteur du document. On recale à la frame suivante, une seule
 fois, plutôt que de compter sur un refresh implicite. */
 requestAnimationFrame(function () { ScrollTrigger.refresh(); });
 }
 function arreter() {
 vivants.forEach(function (c) { c.revert(); });
 vivants = [];
 }
 if (def.media) {
 mm.add(def.media, function () { demarrer(); return arreter; });
 } else {
 demarrer();
 }
 def._arreter = arreter;
 return this;
 },

 /* Poignée sur une scène déclarée, pour la démonter à la main
 (le gouverneur de performance du lot 4 s'en sert). */
 scene: function (nom) { return scenes[nom] || null; },

 destroy: function (nom) {
 var d = scenes[nom];
 if (d && d._arreter) d._arreter();
 return this;
 }
 };

 /* ---------------------------------------------------------------
 DÉCOUPE EN MOTS, pour les réveils masqués de titres.
 Préserve les enfants riches (em, svg) : un élément est traité
 comme UN mot, jamais démonté. Chaque mot est enveloppé dans un
 cadre à overflow caché ; l'intérieur glisse de 110 % vers 0.
 --------------------------------------------------------------- */
 function splitWords(el) {
 if (el.dataset.fxSplitDone) return $$('.fxw__i', el);
 (function walk(node) {
 [].slice.call(node.childNodes).forEach(function (n) {
 if (n.nodeType === 3) {
 if (!n.textContent.trim()) return;
 var frag = document.createDocumentFragment();
 n.textContent.split(/(\s+)/).forEach(function (part) {
 if (!part) return;
 if (/^\s+$/.test(part)) { frag.appendChild(document.createTextNode(' ')); return; }
 var w = document.createElement('span'); w.className = 'fxw';
 var i = document.createElement('span'); i.className = 'fxw__i';
 i.textContent = part;
 w.appendChild(i); frag.appendChild(w);
 });
 node.replaceChild(frag, n);
 } else if (n.nodeType === 1 && !/^(svg|img|br)$/i.test(n.tagName) &&
 !n.classList.contains('fxw')) {
 if (n.classList.contains('fxu')) {
 /* Unité insécable (ex. un em en dégradé de texte :
 background-clip:text ne survit pas à des spans
 imbriqués) : l'élément entier devient UN mot. */
 var wu = document.createElement('span'); wu.className = 'fxw';
 var iu = document.createElement('span'); iu.className = 'fxw__i';
 node.replaceChild(wu, n); iu.appendChild(n); wu.appendChild(iu);
 } else {
 /* Sinon on descend DANS l'élément : un inline-block d'un
 seul tenant interdirait le retour à la ligne naturel. */
 walk(n);
 }
 }
 });
 })(el);
 el.dataset.fxSplitDone = '1';
 return $$('.fxw__i', el);
 }

 /* ---------------------------------------------------------------
 1 · INTRO DU HÉROS, timeline au chargement.
 [data-fx-hero] sur la section ; les acteurs sont retrouvés par
 classe. Tout ce que la CSS a décalé est animé ici, sans trou.
 --------------------------------------------------------------- */
 $$('[data-fx-hero]').forEach(function (hero) {
 var title = $('h1', hero);
 var words = title ? splitWords(title) : [];
 /* L'état de départ est posé ICI, jamais en CSS : gsap.set puis to()
 dans la même passe, aucun rendu intermédiaire possible. */
 if (words.length) gsap.set(words, { yPercent: 112, rotate: 5 });
 var tl = gsap.timeline({ defaults: { ease: EXPO } });

 /* Tous les acteurs sont optionnels, la nuée n'a ni eyebrow ni
 sub, et GSAP jappe en console sur une liste vide. */
 var eyebrow = $$('.fx-hero-eyebrow', hero);
 if (eyebrow.length) tl.to(eyebrow, { opacity: 1, y: 0, duration: .7 }, .05);
 if (words.length) {
 tl.to(words, { yPercent: 0, rotate: 0, duration: 1.1, stagger: .07 }, .12);
 }
 var sub = $$('.fx-hero-sub', hero);
 if (sub.length) tl.to(sub, { opacity: 1, y: 0, filter: 'blur(0px)', duration: .8 }, .55);
 var ctas = $$('.fx-hero-cta', hero);
 if (ctas.length) tl.to(ctas, { opacity: 1, y: 0, scale: 1, duration: .7, stagger: .08 }, .68);
 var proof = $$('.fx-hero-proof', hero);
 if (proof.length) tl.to(proof, { opacity: 1, y: 0, duration: .7 }, .82);

 var media = $$('.fx-hero-media', hero);
 if (media.length) {
 tl.to(media, {
 opacity: 1, y: 0, rotate: 0, scale: 1,
 duration: 1.2, ease: EXPO, stagger: .1
 }, .4);
 }
 var chips = $$('.fx-hero-chip', hero);
 if (chips.length) {
 tl.to(chips, { opacity: 1, scale: 1, y: 0, duration: .8, ease: 'back.out(1.8)', stagger: .12 }, 1.05);
 }

 /* Acteurs du champ de profondeur : ils arrivent DU fond (petits,
 flous) ou DU premier plan (grands), selon leur profondeur, l'œil lit tout de suite l'espace. */
 var actors = $$('.hf', hero);
 if (actors.length) {
 /* 2026-08-14 (retour client « effet de flou tout en haut à
 l'arrivée ») : sur le héros hélice, l'intro n'a PLUS de
 flou, le repli s'affiche net pendant que la scène GL se
 monte, comme la référence. Les autres héros (constellation
 de creation-site-web) gardent leur arrivée du fond, floue. */
 var sansFlou = hero.classList.contains('hero--nuee');
 actors.forEach(function (a, i) {
 var d = num(a, 'data-depth', 1.6);
 var depart = { opacity: 0, scale: d > 2 ? 1.35 : .62 };
 if (!sansFlou) depart.filter = 'blur(14px)';
 gsap.set(a, depart);
 tl.to(a, sansFlou ? {
 opacity: 1, scale: 1, duration: 1.15, ease: EXPO
 } : {
 opacity: 1, scale: 1, filter: 'blur(0px)',
 duration: 1.15, ease: EXPO,
 clearProps: 'filter'
 }, .3 + i * .09);
 });
 }
 });

 /* ---------------------------------------------------------------
 1b · CHAMP DE PROFONDEUR, [data-fx-field] (héros accueil).
 Chaque acteur est un couple : .hfw (dérive au scroll, scrubbée)
 autour de .hf[data-depth] (suit le pointeur, quickTo). Deux
 transforms séparés, zéro conflit d'axes. La profondeur module
 amplitude, flou et vitesse : un vrai plan de mise au point.
 --------------------------------------------------------------- */
 $$('[data-fx-field]').forEach(function (field) {
 var items = $$('.hf', field);
 if (!items.length) return;

 /* Chaque carte est POSÉE en perspective (data-pose="rotY,rotX"),
 inclinée vers le centre : l'éparpillement devient un écrin.
 Pas d'effet au scroll, la vie vient du pointeur : les plans
 se translatent par profondeur ET chaque pose respire (la
 rotation module doucement autour de sa valeur de repos). */
 var movers = items.map(function (el) {
 var d = num(el, 'data-depth', 1.6);
 var pose = (el.getAttribute('data-pose') || '0,0').split(',');
 var ry = parseFloat(pose[0]) || 0;
 var rx = parseFloat(pose[1]) || 0;
 gsap.set(el, { transformPerspective: 950, rotationY: ry, rotationX: rx });
 return {
 el: el, d: d, ry: ry, rx: rx,
 x: gsap.quickTo(el, 'x', { duration: .9, ease: 'power3' }),
 y: gsap.quickTo(el, 'y', { duration: .9, ease: 'power3' }),
 qry: gsap.quickTo(el, 'rotationY', { duration: 1.1, ease: 'power2' }),
 qrx: gsap.quickTo(el, 'rotationX', { duration: 1.1, ease: 'power2' })
 };
 });

 var host = field.closest('section') || field;

 /* ── LA VIE AU REPOS, À TOUTES LES ENTRÉES ────────────────────
 La parallaxe pointeur ne suffit pas : souris immobile, le
 champ était une image FIXE. C'est le reproche revenu à chaque
 version du héros · « je veux du mouvement perpétuel ». La
 respiration et la dérive tournent donc partout, doigt ou
 souris ; le pointeur n'est qu'une couche EN PLUS, ajoutée
 ensuite pour qui en a un.

 TROIS CANAUX, TROIS PROPRIÉTAIRES, c'est ce qui permet de
 les empiler sans qu'ils se marchent dessus :
 · .hfw `y` → la dérive au scroll, scrubbée
 · .hfw `yPercent` → la respiration perpétuelle
 · .hf x/y/rot → le pointeur (quickTo)
 `y` et `yPercent` sont deux propriétés distinctes pour GSAP,
 qui les recompose en un seul transform : deux tweens sur le
 même nœud, zéro conflit. Mettre la respiration sur .hf comme
 avant la ferait entrer en collision avec le pointeur.

 Le flottement s'arrête dès que le héros quitte l'écran : neuf
 cartes ombrées qui bougent pendant toute la visite, c'est du
 budget compositeur brûlé pour un décor que personne ne
 regarde plus.

 La dérive prend du RETARD au scroll, jamais de l'avance, et
 d'autant plus qu'on est loin : un logo du fond traîne de 48px
 quand un téléphone du premier plan n'en lâche que 20. Une
 carte qui remonterait plus vite que la page viendrait
 traverser la preuve sociale. */
 /* La timeline part d'elle-même : le héros est en haut de page,
 un ScrollTrigger déjà dans sa zone au chargement ne garantit
 pas de bascule initiale. onToggle ne sert donc qu'à couper
 et reprendre, jamais à démarrer. */
 var breathe = gsap.timeline({ delay: 1.3 });
 movers.forEach(function (m, i) {
 var pair = m.el.parentElement;
 if (!pair || !pair.classList.contains('hfw')) return;
 gsap.to(pair, {
 y: Math.round(70 - m.d * 18), ease: 'none',
 scrollTrigger: {
 trigger: host, start: 'top top', end: 'bottom top', scrub: .9
 }
 });
 breathe.to(pair, {
 yPercent: (i % 2 ? 1 : -1) * (1.6 + m.d * 1.5),
 duration: 3.4 + (i % 4) * .5,
 ease: 'sine.inOut', repeat: -1, yoyo: true
 }, i * .17);
 });
 ScrollTrigger.create({
 trigger: host, start: 'top bottom', end: 'bottom top',
 onToggle: function (self) { self.isActive ? breathe.play() : breathe.pause(); }
 });

 if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
 host.addEventListener('pointermove', function (e) {
 var r = host.getBoundingClientRect();
 var px = (e.clientX - r.left) / r.width - .5;
 var py = (e.clientY - r.top) / r.height - .5;
 movers.forEach(function (m) {
 m.x(px * m.d * 24);
 m.y(py * m.d * 16);
 m.qry(m.ry + px * m.d * 3.2);
 m.qrx(m.rx + py * m.d * -2.6);
 });
 });
 host.addEventListener('pointerleave', function () {
 movers.forEach(function (m) {
 m.x(0); m.y(0); m.qry(m.ry); m.qrx(m.rx);
 });
 });
 }
 });

 /* ---------------------------------------------------------------
 1c · ASSEMBLAGE, [data-fx-build] (héros création-site-web).
 Le navigateur monte, puis chaque couche du site vole à sa place
 (nav → visuel → textes → cartes) ; les notifications de
 résultat s'en échappent. Au scroll, chips et plaques dérivent
 à des vitesses différentes.
 --------------------------------------------------------------- */
 $$('[data-fx-build]').forEach(function (build) {
 var frame = $('.wb__frame', build);
 var plates = $$('.wb-plate', build);
 var leads = $$('.wb-lead', build);

 /* Entrée SANS flou : quatre plaques floutées animées ensemble
 saccadaient sur les machines modestes, l'apparition doit se
 lire parfaitement. Rotations adoucies, cascade resserrée. */
 if (frame) gsap.set(frame, { y: 70, opacity: 0, rotationX: 8, transformPerspective: 1100 });
 gsap.set(plates, { y: 90, opacity: 0, rotationX: -12, transformPerspective: 900 });
 gsap.set(leads, { scale: .6, opacity: 0, y: 20 });

 var tl = gsap.timeline({ defaults: { ease: EXPO }, delay: .3 });
 if (frame) tl.to(frame, { y: 0, opacity: 1, rotationX: 0, duration: .9 }, 0);
 tl.to(plates, {
 y: 0, opacity: 1, rotationX: 0,
 duration: .8, stagger: .13
 }, .4)
 .to(leads, { scale: 1, opacity: 1, y: 0, duration: .65, ease: 'back.out(1.9)', stagger: .12 }, 1.15);

 /* La vitrine tourne : le visuel du site assemblé passe d'un
 secteur d'activité à l'autre en fondu · « un site pour chaque
 métier ». Premier visuel affiché sans JS (is-on en dur). Le
 badge-résultat suit le secteur, uniquement des libellés
 traçables : le +68 % publié (réservation), le #1 Google réel
 (charpente), des événements sans chiffre pour le reste. */
 var sectors = $$('.wb-sector', build);
 var leadResult = $('[data-lead-result]', build);
 var LEAD_PAR_SECTEUR = {
 'restauration': ['+68 %', 'de demandes de réservation'],
 'commerce': ['Nouvelle commande', 'en ligne'],
 'bien-être': ['Nouvelle réservation', 'reçue'],
 'construction': ['#1 Google', '« charpente Vaud »']
 };
 function litSecteur(fig) {
 var cap = fig.querySelector('figcaption');
 return cap ? cap.textContent.trim().toLowerCase() : '';
 }
 function montreResultat(fig) {
 if (!leadResult) return;
 var d = LEAD_PAR_SECTEUR[litSecteur(fig)];
 if (!d) return;
 var b = leadResult.querySelector('b');
 var s = leadResult.querySelector('span');
 if (build._leadTl) build._leadTl.kill();
 /* Un seul nœud par texte, remplacé pendant le fondu : aucune
 superposition possible. y (px) et opacity, canaux étanches
 avec la dérive au scroll (xPercent/yPercent). */
 build._leadTl = gsap.timeline()
 .to(leadResult, { opacity: 0, y: 7, duration: .24, ease: 'power2.in' })
 .add(function () {
 if (b) b.textContent = d[0];
 if (s) s.textContent = ' ' + d[1];
 })
 .to(leadResult, { opacity: 1, y: 0, duration: .5, ease: 'power3.out' });
 }
 if (sectors.length > 1) {
 var curSector = 0;
 setInterval(function () {
 if (document.hidden) return;
 sectors[curSector].classList.remove('is-on');
 curSector = (curSector + 1) % sectors.length;
 sectors[curSector].classList.add('is-on');
 montreResultat(sectors[curSector]);
 }, 3400);
 }

 /* Dérive au scroll : chaque notification s'ÉLOIGNE du cadre sur son
 propre vecteur, a monte à droite, b sort à gauche, c descend à
 droite. Les trajectoires divergent : elles ne peuvent plus se
 croiser ni passer sur le contenu de la maquette. En xPercent /
 yPercent, jamais en x/y : l'entrée anime déjà y en pixels, les
 deux canaux restent étanches. Coupé sous 768px, où les pastilles
 se rangent en chips statiques (premium.css §43). */
 if (matchMedia('(min-width:768px)').matches) {
 var flights = [
 { xPercent: 16, yPercent: -130 },
 { xPercent: -26, yPercent: -40 },
 { xPercent: 14, yPercent: 110 }
 ];
 leads.forEach(function (l, i) {
 var f = flights[i % flights.length];
 gsap.to(l, {
 xPercent: f.xPercent, yPercent: f.yPercent, ease: 'none',
 scrollTrigger: { trigger: build, start: 'top top', end: 'bottom top', scrub: 1 }
 });
 });
 }
 plates.forEach(function (p, i) {
 gsap.to(p, {
 yPercent: -5 - i * 3.5, ease: 'none',
 scrollTrigger: { trigger: build, start: 'top top', end: 'bottom top', scrub: 1.2 }
 });
 });
 });




 /* ---------------------------------------------------------------
 1d · DIAGNOSTIC, [data-sitx] : trois situations, une pilule
 coulissante, un panneau qui répond. Le choix anime la pilule
 (glider) et croise les panneaux en fondu.
 --------------------------------------------------------------- */
 $$('[data-sitx]').forEach(function (root) {
 var tabs = $$('.sitx__tab', root);
 var panes = $$('.sitx__pane', root);
 var glider = $('.sitx__glider', root);
 if (tabs.length < 2 || panes.length !== tabs.length) return;
 var cur = 0, busy = false;

 function place(i, animate) {
 if (!glider) return;
 var t = tabs[i];
 gsap.to(glider, {
 x: t.offsetLeft, width: t.offsetWidth,
 duration: animate ? .55 : 0, ease: 'power3.out'
 });
 }
 function activate(i) {
 if (i === cur || busy) return;
 busy = true;
 var old = cur; cur = i;
 tabs.forEach(function (t, k) {
 t.classList.toggle('is-on', k === i);
 t.setAttribute('aria-selected', k === i ? 'true' : 'false');
 });
 place(i, true);
 gsap.timeline({ onComplete: function () { busy = false; } })
 .to(panes[old], {
 opacity: 0, y: -14, duration: .26, ease: 'power2.in',
 onComplete: function () {
 panes[old].classList.remove('is-on');
 gsap.set(panes[old], { clearProps: 'opacity,transform' });
 }
 })
 .add(function () { panes[i].classList.add('is-on'); })
 .fromTo(panes[i], { opacity: 0, y: 18 },
 { opacity: 1, y: 0, duration: .5, ease: 'power3.out' }, '+=.02');
 }
 tabs.forEach(function (t, i) {
 t.addEventListener('click', function () { activate(i); });
 });
 root.classList.add('sitx--fx');
 requestAnimationFrame(function () { place(cur, false); });
 window.addEventListener('resize', function () { place(cur, false); });
 });

 /* ---------------------------------------------------------------
 2 · REVEALS AU SCROLL, [data-fx] par lots.
 Variantes : rise (défaut) · left · right · zoom · flip.
 [data-fx-d] décale au sein d'un même lot (secondes).
 --------------------------------------------------------------- */
 var FROMS = {
 rise: { y: 54, opacity: 0, filter: 'blur(10px)' },
 left: { x: -64, opacity: 0, filter: 'blur(8px)' },
 right: { x: 64, opacity: 0, filter: 'blur(8px)' },
 zoom: { scale: .86, y: 30, opacity: 0, filter: 'blur(10px)' },
 flip: { y: 70, opacity: 0, rotationX: -14, transformPerspective: 900, filter: 'blur(6px)' }
 };
 ScrollTrigger.batch('[data-fx]', {
 start: 'top 88%',
 once: true,
 interval: 0.08,
 onEnter: function (els) {
 els.forEach(function (el, k) {
 /* `is-in` accompagne le réveil : les états ENFANTS écrits en
 CSS (barres de mock-dash, tracés de sparklines… `.x.is-in y`)
 restent synchronisés au scroll pour les éléments migrés de
 wf-rev vers data-fx sur les pages étendues. */
 el.classList.add('is-in');
 var kind = el.getAttribute('data-fx') || 'rise';
 gsap.fromTo(el, FROMS[kind] || FROMS.rise, {
 x: 0, y: 0, scale: 1, opacity: 1, rotationX: 0, filter: 'blur(0px)',
 duration: 1.05, ease: EASE,
 delay: k * .09 + num(el, 'data-fx-d', 0),
 clearProps: 'filter,transform'
 });
 });
 }
 });

 /* Titres de section, réveil masqué mot à mot. */
 $$('[data-fx-title]').forEach(function (h) {
 var words = splitWords(h);
 gsap.set(words, { yPercent: 112, rotate: 4 });
 ScrollTrigger.create({
 trigger: h, start: 'top 86%', once: true,
 onEnter: function () {
 gsap.to(words, { yPercent: 0, rotate: 0, duration: .9, ease: EXPO, stagger: .05 });
 }
 });
 });

 /* ---------------------------------------------------------------
 3 · PARALLAXE, [data-fx-par="18"] : déplacement en yPercent,
 scrubbé sur la traversée du viewport. Transform uniquement.
 --------------------------------------------------------------- */
 $$('[data-fx-par]').forEach(function (el) {
 var range = num(el, 'data-fx-par', 16);
 gsap.fromTo(el, { yPercent: range }, {
 yPercent: -range, ease: 'none',
 scrollTrigger: { trigger: el.parentElement || el, start: 'top bottom', end: 'bottom top', scrub: 1.2 }
 });
 });

 /* ---------------------------------------------------------------
 4 · PILE DE CARTES, .stack[data-fx-stack].
 Le sticky CSS fait l'empilement ; le scrub ajoute le tassement
 continu : la carte recouverte recule et s'assombrit pendant que
 la suivante glisse par-dessus.

 LA RAMPE SE MESURE SUR LE RECOUVREMENT, PAS SUR L'ENTRÉE À
 L'ÉCRAN (corrigé le 2026-08-11 · Bastien : « cette section est
 buggée, tout est flou »). L'ancienne rampe partait de
 `top 92%` / `top 18%` sur la carte SUIVANTE, c'est-à-dire dès que
 celle-ci pointait en bas de l'écran. Or une carte de la pile fait
 ~390px et la suivante la talonne à 27px : mesuré sur un écran de
 700px, au moment exact où la carte 01 s'épingle à sa position de
 lecture, sa rampe était DÉJÀ À 100 %, scale(.92) et blur(2.5px), alors que la carte 02 était encore 27px sous elle et ne
 recouvrait rien. Le visiteur lisait donc une carte floue et
 rétrécie, systématiquement, du début à la fin de la section.

 La rampe va maintenant du moment où la suivante TOUCHE le bas de
 la carte (elles commencent à se recouvrir) à celui où elle s'est
 épinglée par-dessus. Bornes calculées, pas devinées : hauteur
 réelle de la carte + offsets `top` collants des deux, recalculés
 à chaque refresh (`invalidateOnRefresh`) puisqu'ils dépendent du
 viewport via clamp().
 --------------------------------------------------------------- */
 $$('[data-fx-stack]').forEach(function (pile) {
 var cards = $$('.stack-card', pile);
 var collant = function (el) { return parseFloat(getComputedStyle(el).top) || 0; };
 cards.forEach(function (card, i) {
 var next = cards[i + 1];
 if (!next) return;
 gsap.fromTo(card, { scale: 1, filter: 'brightness(1) blur(0px)' }, {
 scale: .92 + i * .012, filter: 'brightness(.9) blur(2.5px)',
 transformOrigin: 'top center', ease: 'none',
 scrollTrigger: {
 trigger: next,
 start: function () { return 'top ' + (collant(card) + card.offsetHeight) + 'px'; },
 end: function () { return 'top ' + collant(next) + 'px'; },
 scrub: .6, invalidateOnRefresh: true
 }
 });
 });
 /* Rail de progression : le point de l'étape visible s'allume. */
 var dots = $$('[data-fx-dot]', pile.parentElement || document);
 if (dots.length === cards.length) {
 cards.forEach(function (card, i) {
 ScrollTrigger.create({
 trigger: card, start: 'top 55%', end: 'bottom 55%',
 onToggle: function (self) {
 if (self.isActive) dots.forEach(function (d, k) { d.classList.toggle('is-on', k <= i); });
 }
 });
 });
 }
 });

 /* ---------------------------------------------------------------
 5 · MARQUEES PILOTÉS, [data-fx-marquee="26"] : boucle xPercent
 GSAP (le CSS coupe sa propre animation sous .has-fx). La vitesse
 réagit à la vélocité du scroll : le bandeau accélère quand la
 page file, reprend son souffle ensuite. `direction:-1` inverse.
 --------------------------------------------------------------- */
 $$('[data-fx-marquee]').forEach(function (track) {
 var dur = num(track, 'data-fx-marquee', 26);
 var dir = track.getAttribute('data-fx-dir') === '-1' ? -1 : 1;
 var tween = gsap.fromTo(track,
 { xPercent: dir === 1 ? 0 : -50 },
 { xPercent: dir === 1 ? -50 : 0, ease: 'none', duration: dur, repeat: -1 });
 /* `data-fx-marquee-stop` : le ruban s'ARRÊTE au survol au lieu de
 ralentir (2026-08-14, bandeau des logos). Un ruban dont chaque
 logo se colore au survol ne peut pas continuer à glisser : à
 timeScale .18 il avance encore d'une trentaine de pixels par
 seconde, les logos défilent sous un curseur immobile, et chacun
 s'allume au passage. Le client voit alors une couleur clignoter
 sur un logo qu'il ne vise pas, le fondu de .35s laisse en plus
 celui qui sort encore coloré pendant que le suivant s'allume.
 C'est aussi ce que fait déjà le CSS de repli sans GSAP
 (.trust__marquee:hover .trust__track{animation-play-state:paused}) :
 les deux chemins se comportent enfin pareil. */
 var stop = track.hasAttribute('data-fx-marquee-stop');
 var fige = false;
 var proxy = { v: 1 };
 ScrollTrigger.create({
 onUpdate: function (self) {
 /* Un ruban figé ne redémarre pas parce qu'on défile : sans ce
 garde-fou, la relance de vélocité réécrirait le timeScale
 par-dessus l'arrêt. */
 if (fige) return;
 var boost = 1 + Math.min(Math.abs(self.getVelocity()) / 900, 3.2);
 gsap.to(proxy, {
 v: boost, duration: .18, overwrite: true,
 onUpdate: function () { tween.timeScale(proxy.v); },
 onComplete: function () {
 gsap.to(proxy, { v: 1, duration: 1.4, ease: 'power2.out',
 onUpdate: function () { tween.timeScale(proxy.v); } });
 }
 });
 }
 });
 track.addEventListener('pointerenter', function () {
 fige = stop;
 gsap.to(tween, { timeScale: stop ? 0 : .18, duration: stop ? .32 : .5, overwrite: true });
 });
 track.addEventListener('pointerleave', function () {
 fige = false;
 proxy.v = 1;
 gsap.to(tween, { timeScale: 1, duration: .5, overwrite: true });
 });
 });

 /* ---------------------------------------------------------------
 6 · MAGNÉTIQUE, pointeur fin uniquement. quickTo, retour
 élastique au départ du curseur, pression au clic.
 --------------------------------------------------------------- */
 if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
 $$('[data-motion="magnetic"], [data-fx-mag]').forEach(function (el) {
 var pull = num(el, 'data-mo-pull', 10);
 var qx = gsap.quickTo(el, 'x', { duration: .35, ease: 'power3' });
 var qy = gsap.quickTo(el, 'y', { duration: .35, ease: 'power3' });
 el.addEventListener('pointermove', function (e) {
 var r = el.getBoundingClientRect();
 qx(((e.clientX - r.left) / r.width - .5) * pull * 2);
 qy(((e.clientY - r.top) / r.height - .5) * pull * 2);
 });
 el.addEventListener('pointerleave', function () {
 gsap.to(el, { x: 0, y: 0, duration: .7, ease: 'elastic.out(1,.4)' });
 });
 el.addEventListener('pointerdown', function () { gsap.to(el, { scale: .965, duration: .12 }); });
 el.addEventListener('pointerup', function () { gsap.to(el, { scale: 1, duration: .3, ease: 'back.out(2.5)' }); });
 });

 /* TILT 3D, [data-fx-tilt] : la carte suit le curseur, le reflet
 (--gx/--gy en CSS) suit le même geste. */
 $$('[data-fx-tilt]').forEach(function (card) {
 var max = num(card, 'data-fx-tilt', 7);
 var rx = gsap.quickTo(card, 'rotationX', { duration: .5, ease: 'power2' });
 var ry = gsap.quickTo(card, 'rotationY', { duration: .5, ease: 'power2' });
 gsap.set(card, { transformPerspective: 900 });
 card.addEventListener('pointermove', function (e) {
 var r = card.getBoundingClientRect();
 var px = (e.clientX - r.left) / r.width, py = (e.clientY - r.top) / r.height;
 rx((py - .5) * -2 * max);
 ry((px - .5) * 2 * max);
 card.style.setProperty('--gx', (px * 100).toFixed(1) + '%');
 card.style.setProperty('--gy', (py * 100).toFixed(1) + '%');
 });
 card.addEventListener('pointerleave', function () {
 gsap.to(card, { rotationX: 0, rotationY: 0, duration: .8, ease: 'elastic.out(1,.5)' });
 });
 });
 }

 /* ---------------------------------------------------------------
 7 · TRACÉ DES PICTOS, [data-motion="draw"], port de motion.js.
 L'état de repos est l'icône entièrement tracée ; le décalage est
 posé ici, juste avant d'animer.
 --------------------------------------------------------------- */
 $$('[data-motion="draw"]').forEach(function (host) {
 ScrollTrigger.create({
 trigger: host, start: 'top 88%', once: true,
 onEnter: function () {
 var paths = $$('path, line, polyline, circle, rect, ellipse', host);
 paths.forEach(function (p, i) {
 var L;
 try { L = p.getTotalLength(); } catch (e) { L = 0; }
 if (!L || !isFinite(L)) { try { var bb = p.getBBox(); L = 2 * (bb.width + bb.height); } catch (e2) { L = 120; } }
 gsap.fromTo(p, { strokeDasharray: L, strokeDashoffset: L }, {
 strokeDashoffset: 0, duration: .8, delay: i * .06, ease: 'power2.inOut',
 onComplete: function () { p.style.strokeDasharray = ''; p.style.strokeDashoffset = ''; }
 });
 });
 }
 });
 });

 /* ---------------------------------------------------------------
 7b · CADRAN DE SCORE, [data-fx-dial="90"] : l'aiguille part
 de la GAUCHE de la jauge et balaie jusqu'au score, l'arc se
 remplit derrière elle, puis un petit tassement d'aiguille, un vrai compteur. L'état de repos (CSS) est le cadran DÉJÀ
 sur son score, sans JS rien n'est vide ; le départ est posé
 ici, juste avant d'animer.
 --------------------------------------------------------------- */
 $$('[data-fx-dial]').forEach(function (fill) {
 var pct = num(fill, 'data-fx-dial', 90) / 100;
 var L = 157.1;
 try { L = fill.getTotalLength() || L; } catch (e) {}
 var dial = fill.closest('.incx-dial');
 var needle = dial ? $('.incx-dial__needle', dial) : null;
 /* 0 % = aiguille couchée à gauche (-90°), 100 % = à droite (+90°).
 Le pivot est écrit DANS l'attribut rotate(angle 60 64) : un seul
 système d'origine, jamais de bras de fer transform-origin
 entre la CSS et GSAP sur un <g> SVG. */
 var angle = -90 + 180 * pct;
 var aig = { a: -90 };
 function pose() {
 if (needle) needle.setAttribute('transform', 'rotate(' + aig.a.toFixed(2) + ' 60 64)');
 }
 gsap.set(fill, { strokeDasharray: L, strokeDashoffset: L });
 pose();
 ScrollTrigger.create({
 trigger: dial || fill, start: 'top 85%', once: true,
 onEnter: function () {
 var tl = gsap.timeline();
 tl.to(fill, {
 strokeDashoffset: L * (1 - pct),
 duration: 1.5, ease: 'power3.inOut'
 }, 0);
 if (needle) {
 tl.to(aig, { a: angle, duration: 1.5, ease: 'power3.inOut', onUpdate: pose }, 0)
 .to(aig, { a: angle - 2.5, duration: .16, ease: 'power1.inOut', onUpdate: pose })
 .to(aig, { a: angle, duration: .3, ease: 'power2.out', onUpdate: pose });
 }
 }
 });
 });

 /* ---------------------------------------------------------------
 8 · PARALLAXE HÉRITÉE, [data-motion="parallax"] de motion.js,
 pour ne rien perdre en le remplaçant.
 --------------------------------------------------------------- */
 $$('[data-motion="parallax"]').forEach(function (el) {
 var range = num(el, 'data-mo-range', 60);
 gsap.fromTo(el, { y: range }, {
 y: -range, ease: 'none',
 scrollTrigger: { trigger: el.parentElement || el, start: 'top bottom', end: 'bottom top', scrub: 1 }
 });
 });

 /* ---------------------------------------------------------------
 9 · AMBIANCES, les nappes de lumière dérivent doucement,
 décorrélées du scroll. Transform uniquement, jamais de layout.
 --------------------------------------------------------------- */
 /* `data-fx-orb-lie` : deux orbes qui portent le même lien reçoivent
 la MÊME dérive (mêmes amplitudes, même durée, créées dans le même
 tick) et restent donc superposables à la seconde près.

 C'est ce qui permet à une nappe de lumière de traverser la
 frontière entre deux sections : la bande de confiance et la roue
 posent le même cercle au même endroit, chacune n'en montrant que
 sa moitié (les `.fx-stage` sont en overflow:clip). Indexées
 normalement, les deux moitiés dériveraient chacune de son côté et
 le raccord s'ouvrirait au bout de quelques secondes. */
 $$('.fx-orb').forEach(function (orb, i) {
 var lien = orb.getAttribute('data-fx-orb-lie');
 var k = lien === null ? i : (parseInt(lien, 10) || 0);
 gsap.to(orb, {
 x: (k % 2 ? -1 : 1) * (36 + k * 14),
 y: (k % 2 ? 1 : -1) * (28 + k * 10),
 scale: 1.12,
 duration: 7 + k * 2.3,
 ease: 'sine.inOut', yoyo: true, repeat: -1
 });
 });


 /* ---------------------------------------------------------------
 Recalage : polices, images et le passage en scrolltelling de
 site.js modifient les hauteurs après coup. On remesure à chaque
 jalon, et au retour de visibilité, car un onglet en arrière-plan
 saute ses refreshes.
 --------------------------------------------------------------- */
 /* `hauteur` retient la hauteur du document au dernier recalage. Un
 ScrollTrigger.refresh() remesure TOUS les déclencheurs de la page · 114 sur l'accueil, 121 sur creation-site-web, sur un document de plus
 de deux mille nœuds : 30 à 80 ms de fil principal bloqué. Le prix est
 justifié quand une police ou une image vient de changer les hauteurs,
 il ne l'est pas au simple retour d'un onglet, où la page est
 rigoureusement identique à ce qu'elle était. On ne remesure donc que
 si la géométrie a réellement bougé. */
 var hauteur = 0;
 function recaler(force) {
 var h = document.documentElement.scrollHeight;
 if (!force && h === hauteur) return;
 hauteur = h;
 ScrollTrigger.refresh();
 }
 window.addEventListener('load', function () { recaler(true); });
 if (document.fonts && document.fonts.ready) {
 document.fonts.ready.then(function () { recaler(true); });
 }
 setTimeout(function () { recaler(true); }, 900);
 document.addEventListener('visibilitychange', function () {
 if (!document.hidden) recaler(false);
 });

 /* ---------------------------------------------------------------
 PROJECTEUR, la lueur qui suit le curseur dans toute carte.

 UN SEUL écouteur, délégué au document. Le site compte plus de
 deux cents cartes sur certaines pages : un `pointermove` par
 carte, c'est deux cents abonnés au même flux d'événements, et
 c'est le défilement lui-même qui devient saccadé (la raison est
 déjà écrite dans site.js à propos des écouteurs de scroll).

 L'écriture est throttlée à la frame : `pointermove` tire à la
 fréquence du périphérique, souvent plus vite que le rendu.
 --------------------------------------------------------------- */
 DTZ.fx.register('projecteur', {
 media: DTZ.fx.BP.fin,
 select: function () { return [document.body]; },
 mount: function (corps, ctx) {
 /* `.whyv-card` ajoutee le 2026-08-12 : la liste portait `.why-card`,
 l'ancienne classe du manifeste, remplacee depuis par `.whyv-card`.
 Les quatre cartes du manifeste n'avaient donc jamais de projecteur. */
 var CARTES = '.sc-card,.gr-card,.pr-card,.res-card,.why-card,.whyv-card,.kpc,' +
 '.sit-card,.next-card,.diff-card,.incx-tile,.stack-card,.fq__card';
 var enAttente = null, tick = false;
 ctx.on(corps, 'pointermove', function (e) {
 var carte = e.target.closest && e.target.closest(CARTES);
 if (!carte) return;
 enAttente = { carte: carte, x: e.clientX, y: e.clientY };
 if (tick) return;
 tick = true;
 requestAnimationFrame(function () {
 tick = false;
 if (!enAttente) return;
 var r = enAttente.carte.getBoundingClientRect();
 enAttente.carte.style.setProperty('--mx',
 ((enAttente.x - r.left) / r.width * 100).toFixed(1) + '%');
 enAttente.carte.style.setProperty('--my',
 ((enAttente.y - r.top) / r.height * 100).toFixed(1) + '%');
 });
 }, { passive: true });
 }
 });

 /* ---------------------------------------------------------------
 CHROMA, la couleur du domaine éclôt sous le curseur.

 Motif « Chroma Grid » de React Bits, réécrit. Chaque carte reçoit
 une valeur `--chroma` de 0 à 1, fonction de sa distance au curseur :
 à moins d'un rayon, sa teinte se mélange à l'encre en proportion.

 UNE SEULE écoute, sur la grille, pas six. Et six `quickTo`, créés
 une fois : GSAP interpole alors la variable sans qu'on repasse par
 le DOM à chaque frame. Le rayon vaut 300px comme le composant
 d'origine ; l'amortissement de .45s aussi.

 Au pointerleave tout redescend à 0 : la grille retrouve son repos
 neutre, ce que le styleguide demande · « la couleur du domaine en
 accents subtils, jamais d'aplat ».
 --------------------------------------------------------------- */
 DTZ.fx.register('chroma', {
 media: DTZ.fx.BP.fin,
 select: '.sc-grid--chroma',
 mount: function (grille, ctx) {
 var cartes = $$('.sc-card', grille);
 if (!cartes.length) return;
 var RAYON = 300;
 var set = cartes.map(function (c) {
 return gsap.quickTo(c, '--chroma', { duration: .45, ease: 'power3' });
 });
 var attente = null, tick = false;
 ctx.on(grille, 'pointermove', function (e) {
 attente = { x: e.clientX, y: e.clientY };
 if (tick) return;
 tick = true;
 requestAnimationFrame(function () {
 tick = false;
 if (!attente) return;
 cartes.forEach(function (c, i) {
 var r = c.getBoundingClientRect();
 var dx = attente.x - (r.left + r.width / 2);
 var dy = attente.y - (r.top + r.height / 2);
 var d = Math.sqrt(dx * dx + dy * dy);
 set[i](Math.max(0, 1 - d / RAYON));
 });
 });
 }, { passive: true });
 ctx.on(grille, 'pointerleave', function () {
 attente = null;
 set.forEach(function (s) { s(0); });
 }, { passive: true });
 }
 });

 /* ---------------------------------------------------------------
 SEUIL, le fondu là où deux valeurs se touchent.

 La page alterne clair / crème / encre. Aux jonctions, la
 frontière était une ligne droite et franche. On pose `.a-seuil`
 sur la section CLAIRE qui précède une section sombre, et on lui
 donne la couleur d'arrivée.

 Rien n'est écrit dans le HTML : la scène LIT les fonds calculés
 et ne décore que les jonctions qui existent réellement. Une
 section qu'on repeindra plus tard sera traitée toute seule.
 --------------------------------------------------------------- */
 DTZ.fx.register('seuil', {
 select: function () {
 return $$('main > section, body > section');
 },
 mount: function (sec, ctx) {
 var suivante = sec.nextElementSibling;
 if (!suivante || suivante.tagName !== 'SECTION') return;

 function clarte(el) {
 var cs = getComputedStyle(el);
 /* Une section peinte au dégradé rend `backgroundColor`
 transparent : c'est l'erreur de relevé qui avait fait
 conclure à tort que la page n'avait qu'une bande d'encre.
 On considère donc le dégradé comme sombre par défaut, ce
 qui est vrai pour les quatre sections concernées. */
 if (cs.backgroundImage !== 'none' &&
 /gradient/.test(cs.backgroundImage) &&
 cs.backgroundColor === 'rgba(0, 0, 0, 0)') return 20;
 var m = cs.backgroundColor.match(/[\d.]+/g);
 if (!m || (m[3] !== undefined && +m[3] === 0)) return 255;
 return .2126 * +m[0] + .7152 * +m[1] + .0722 * +m[2];
 }

 var ici = clarte(sec), la = clarte(suivante);
 /* On ne décore que les vraies ruptures : clair → encre. */
 if (ici < 150 || la > 100) return;
 sec.classList.add('a-seuil');
 var cs = getComputedStyle(suivante);
 sec.style.setProperty('--seuil-vers',
 cs.backgroundColor === 'rgba(0, 0, 0, 0)'
 ? 'var(--night)' : cs.backgroundColor);
 ctx.add(function () {
 return function () {
 sec.classList.remove('a-seuil');
 sec.style.removeProperty('--seuil-vers');
 };
 });
 }
 });

 /* ---------------------------------------------------------------
 REFONTE DE L'ACCUEIL · 2026-08-13. Les scènes 'vitrine' (rail
 de témoignages en scroll-snap) et 'pile' (méthode collante)
 partent avec leur markup ; les huit scènes ci-dessous les
 remplacent. Même discipline partout : le CSS montre tout par
 défaut, la scène pose ses états de départ AU MONTAGE, et ne
 possède qu'un canal par propriété.
 --------------------------------------------------------------- */

 /* ---------------------------------------------------------------
 LA MOSAÏQUE DE CONFIANCE, réveil des cellules + lueur curseur.
 La lueur : deux variables CSS sur la grille, écrites sous rAF
 (une écriture par frame au plus). Pointeur fin seulement.
 --------------------------------------------------------------- */
 DTZ.fx.register('mosaique', {
 select: '[data-mza]',
 mount: function (grille, ctx) {
 var cellules = $$('.mza-cell', grille);

 ctx.add(function () {
 ScrollTrigger.batch(cellules, {
 start: 'top 92%', once: true, interval: 0.1,
 onEnter: function (els) {
 gsap.fromTo(els,
 { y: 26, opacity: 0 },
 { y: 0, opacity: 1, duration: .8, ease: EASE,
 stagger: { each: .04, from: 'random' },
 clearProps: 'transform,opacity' });
 }
 });
 });

 if (!matchMedia(BP.fin).matches) return;
 var attente = null;
 ctx.on(grille, 'pointermove', function (e) {
 if (attente) return;
 attente = requestAnimationFrame(function () {
 attente = null;
 var r = grille.getBoundingClientRect();
 grille.style.setProperty('--mx', ((e.clientX - r.left) / r.width * 100).toFixed(2) + '%');
 grille.style.setProperty('--my', ((e.clientY - r.top) / r.height * 100).toFixed(2) + '%');
 });
 }, { passive: true });
 ctx.on(grille, 'pointerenter', function () { grille.classList.add('mza--allume'); }, { passive: true });
 ctx.on(grille, 'pointerleave', function () {
 grille.classList.remove('mza--allume');
 if (attente) { cancelAnimationFrame(attente); attente = null; }
 }, { passive: true });
 }
 });

 /* ---------------------------------------------------------------
 LE GRAND LIVRE, l'encre du rang suit le scroll. Les compteurs
 appartiennent à site.js ([data-count]) : ici on ne touche que
 l'opacité du rang et le tracé de son filet, jamais le texte.
 --------------------------------------------------------------- */
 DTZ.fx.register('livre', {
 select: '[data-ldg]',
 mount: function (livre, ctx) {
 $$('.ldg-row', livre).forEach(function (rang) {
 ctx.add(function () {
 gsap.fromTo(rang, { opacity: .18 }, {
 opacity: 1, ease: 'none',
 scrollTrigger: {
 trigger: rang, start: 'top 92%', end: 'top 55%', scrub: .4
 }
 });
 gsap.fromTo(rang, { backgroundSize: '0% 1px' }, {
 backgroundSize: '100% 1px', ease: 'none',
 scrollTrigger: {
 trigger: rang, start: 'top 92%', end: 'top 45%', scrub: .4
 }
 });
 });
 });
 /* Le filet qui se trace : un dégradé en fond, dimensionné par
 la scène, le border-bottom du CSS reste le repli sans JS. */
 gsap.set($$('.ldg-row', livre), {
 backgroundImage: 'linear-gradient(var(--fg),var(--fg))',
 backgroundRepeat: 'no-repeat',
 backgroundPosition: 'left bottom'
 });
 }
 });

 /* ---------------------------------------------------------------
 LE PROJECTEUR D'AVIS, un avis en scène, rotation minutée.
 Le CSS cache les avis non actifs (visibility, par classe) ; la
 scène ne fait que croiser les classes et animer opacity/y de
 l'entrant. Le fil du rang actif est une variable CSS (--spo-p)
 animée ici. Pause : survol, focus, hors écran, onglet caché.
 --------------------------------------------------------------- */
 DTZ.fx.register('projecteur', {
 select: '[data-spo]',
 mount: function (jeu, ctx) {
 var avis = $$('.spo-avis', jeu);
 var picks = $$('.spo-pick', jeu);
 if (avis.length < 2 || picks.length !== avis.length) return;

 var N = avis.length, cur = 0, fil = { p: 0 }, tourne = null;
 var CYCLE = 8; /* secondes par avis */
 var visible = true, souris = false, focus = false;

 function jauge(i, depart) {
 if (tourne) tourne.kill();
 picks.forEach(function (b, k) {
 if (k !== i) b.style.setProperty('--spo-p', 0);
 });
 fil.p = 0;
 tourne = gsap.to(fil, {
 p: 1, duration: CYCLE, ease: 'none', delay: depart || 0,
 onUpdate: function () {
 picks[i].style.setProperty('--spo-p', fil.p.toFixed(4));
 },
 onComplete: function () { aller((i + 1) % N); }
 });
 maj();
 }
 function maj() {
 if (!tourne) return;
 if (visible && !souris && !focus && !document.hidden) tourne.play();
 else tourne.pause();
 }
 function aller(i) {
 if (i === cur) { jauge(i); return; }
 var vieux = cur; cur = i;
 picks.forEach(function (b, k) {
 b.classList.toggle('is-on', k === i);
 b.setAttribute('aria-pressed', k === i ? 'true' : 'false');
 });
 avis[vieux].classList.remove('is-on');
 avis[i].classList.add('is-on');
 gsap.fromTo(avis[i], { opacity: 0, y: 22 },
 { opacity: 1, y: 0, duration: .65, ease: EXPO, clearProps: 'transform,opacity' });
 jauge(i, .15);
 }

 picks.forEach(function (b, k) {
 ctx.on(b, 'click', function () { aller(k); });
 ctx.on(b, 'focus', function () { focus = true; maj(); });
 ctx.on(b, 'blur', function () { focus = false; maj(); });
 });
 ctx.on(jeu, 'pointerenter', function () { souris = true; maj(); }, { passive: true });
 ctx.on(jeu, 'pointerleave', function () { souris = false; maj(); }, { passive: true });
 ctx.on(document, 'visibilitychange', maj);
 ctx.st({
 trigger: jeu, start: 'top bottom', end: 'bottom top',
 onToggle: function (st) { visible = st.isActive; maj(); }
 });
 ctx.add(function () { return function () { if (tourne) tourne.kill(); }; });

 jauge(0);
 }
 });

 /* ---------------------------------------------------------------
 L'ÉVENTAIL DES TÉMOIGNAGES, trois cartes, la scène tourne aux
 transforms. GSAP possède x/rotationY/scale/zIndex ; le voile et
 l'estompe du pied restent au CSS (par classe .is-on). Sous
 861px la scène n'est pas montée : défilement natif (§55).
 --------------------------------------------------------------- */
 DTZ.fx.register('eventail', {
 select: '[data-fan]',
 media: '(min-width:861px)',
 mount: function (scene, ctx) {
 var sec = scene.closest('section');
 var cartes = $$('.fan-card', scene);
 if (cartes.length < 2) return;
 var N = cartes.length;
 var cur = Math.min(1, N - 1); /* la carte centrale ouvre */
 var compteur = $('[data-fan-compteur] b', sec);
 var jauge = $('[data-fan-jauge]', sec);

 sec.classList.add('fan--vif');

 function poser(anime) {
 cartes.forEach(function (carte, k) {
 var d = k - cur; /* -1 0 +1 : la place */
 carte.classList.toggle('is-on', d === 0);
 gsap.to(carte, {
 xPercent: d * 78,
 rotationY: d * -14,
 scale: d === 0 ? 1 : .84,
 zIndex: 10 - Math.abs(d),
 transformPerspective: 1400,
 duration: anime ? .85 : 0,
 ease: EXPO,
 overwrite: 'auto'
 });
 if (d !== 0) pauseVideo(carte);
 });
 if (compteur) compteur.textContent = ('0' + (cur + 1)).slice(-2);
 if (jauge) jauge.style.width = ((cur + 1) / N * 100).toFixed(2) + '%';
 }
 function pauseVideo(carte) {
 var v = $('video', carte);
 if (v && !v.paused) { v.pause(); carte.classList.remove('is-live'); }
 }
 function aller(i, anime) {
 cur = Math.max(0, Math.min(N - 1, i));
 poser(anime !== false);
 }

 cartes.forEach(function (carte, k) {
 ctx.on(carte, 'click', function (e) {
 if (k === cur) return;
 e.preventDefault();
 aller(k);
 });
 var bouton = $('[data-fan-play]', carte);
 var video = $('video', carte);
 if (!bouton || !video) return;
 ctx.on(bouton, 'click', function (e) {
 if (k !== cur) return; /* le clic de côté avance */
 e.stopPropagation();
 if (video.paused) {
 cartes.forEach(function (a) { if (a !== carte) pauseVideo(a); });
 video.play();
 carte.classList.add('is-live');
 bouton.setAttribute('aria-label', 'Mettre en pause');
 } else {
 video.pause();
 carte.classList.remove('is-live');
 }
 });
 });
 var prec = $('[data-fan-prec]', sec);
 var suiv = $('[data-fan-suiv]', sec);
 if (prec) ctx.on(prec, 'click', function () { aller(cur === 0 ? N - 1 : cur - 1); });
 if (suiv) ctx.on(suiv, 'click', function () { aller((cur + 1) % N); });

 /* Hors écran : tout s'arrête. */
 ctx.st({
 trigger: sec, start: 'top bottom', end: 'bottom top',
 onLeave: function () { cartes.forEach(pauseVideo); },
 onLeaveBack: function () { cartes.forEach(pauseVideo); }
 });

 ctx.add(function () {
 return function () {
 sec.classList.remove('fan--vif');
 cartes.forEach(function (c) {
 c.classList.remove('is-on');
 gsap.set(c, { clearProps: 'transform,zIndex' });
 });
 };
 });

 poser(false);
 }
 });

 /* ---------------------------------------------------------------
 LE TRAVELLING DES RÉSULTATS, la recette de la roue, tournée
 d'un quart de tour. La hauteur du rail vit en CSS sous
 `.trav--vif` ; ici on ne fait que scruber le X du train et
 tenir la jauge. Ni pin, ni déplacement de DOM.
 --------------------------------------------------------------- */
 DTZ.fx.register('travelling', {
 select: '[data-trav]',
 media: '(min-width:961px) and (min-height:641px)',
 priority: 8,
 mount: function (train, ctx) {
 var sec = train.closest('.trav');
 var rail = $('.trav__rail', sec);
 var cartes = $$('.resx-case', train);
 if (!sec || !rail || cartes.length < 2) return;
 var N = cartes.length;
 var compteur = $('[data-trav-compteur] b', sec);
 var jauge = $('[data-trav-jauge]', sec);

 sec.classList.add('trav--vif');

 ctx.add(function () {
 gsap.fromTo(train, { xPercent: 0 }, {
 /* Chaque carte fait 100% du train + une gouttière de marge :
 xPercent suffit, la marge est absorbée par le clip. */
 xPercent: -100 * (N - 1),
 x: function () {
 var g = parseFloat(getComputedStyle(cartes[1]).marginLeft) || 0;
 return -g * (N - 1);
 },
 ease: 'none',
 scrollTrigger: {
 trigger: rail,
 /* Le collage part a top:4.2rem (le header) : le scrub
 part du meme point, sinon 67px de molette a vide. */
 start: 'top 67px',
 end: 'bottom bottom',
 scrub: .6,
 invalidateOnRefresh: true,
 onUpdate: function (st) {
 var i = Math.min(N - 1, Math.round(st.progress * (N - 1)));
 if (compteur) compteur.textContent = ('0' + (i + 1)).slice(-2);
 if (jauge) jauge.style.width = (st.progress * 100).toFixed(2) + '%';
 }
 }
 });
 });

 ctx.add(function () {
 return function () { sec.classList.remove('trav--vif'); };
 });
 }
 });

 /* ---------------------------------------------------------------
 LE MANIFESTE, l'encre de la phrase suit le scroll, et l'index
 se referme (un rang ouvert à la fois). Sans ce montage, les
 quatre rangs restent dépliés : la fermeture n'existe qu'ici.
 --------------------------------------------------------------- */
 DTZ.fx.register('manifeste', {
 select: '.mfx',
 mount: function (sec, ctx) {
 var phrase = $('[data-mfx-phrase]', sec);
 if (phrase) {
 var mots = splitWords(phrase);
 ctx.add(function () {
 gsap.fromTo(mots, { opacity: .12 }, {
 opacity: 1, ease: 'none', stagger: .06,
 scrollTrigger: {
 trigger: phrase, start: 'top 82%', end: 'top 34%', scrub: .4
 }
 });
 });
 }

 var liste = $('[data-mfx]', sec);
 if (!liste) return;
 var rangs = $$('.mfx-row', liste);
 liste.classList.add('mfx--vif');
 rangs.forEach(function (rang) {
 var q = $('.mfx-row__q', rang);
 if (!q) return;
 ctx.on(q, 'click', function () {
 var ouvert = rang.classList.contains('is-open');
 rangs.forEach(function (r) {
 r.classList.toggle('is-open', r === rang && !ouvert);
 var b = $('.mfx-row__q', r);
 if (b) b.setAttribute('aria-expanded',
 r.classList.contains('is-open') ? 'true' : 'false');
 });
 });
 });
 ctx.add(function () {
 return function () { liste.classList.remove('mfx--vif'); };
 });
 }
 });

 /* ---------------------------------------------------------------
 LE FACE-À-FACE, le commutateur. La pilule glisse, les panneaux
 se croisent en fondu. Sans ce montage les deux adversaires
 restent empilés (CSS §58).
 --------------------------------------------------------------- */
 DTZ.fx.register('face', {
 select: '[data-duel]',
 mount: function (jeu, ctx) {
 var onglets = $$('.duel__onglet', jeu);
 var panneaux = $$('.duel-col--eux', jeu);
 var glisse = $('.duel__glisse', jeu);
 if (onglets.length !== 2 || panneaux.length !== 2) return;
 var sec = jeu.closest('.duel');
 var cur = 0;

 sec.classList.add('duel--vif');

 function placer() {
 if (!glisse) return;
 var t = onglets[cur];
 glisse.style.left = t.offsetLeft + 'px';
 glisse.style.width = t.offsetWidth + 'px';
 }
 function activer(i) {
 if (i === cur) return;
 var vieux = cur; cur = i;
 onglets.forEach(function (o, k) {
 o.classList.toggle('is-on', k === i);
 o.setAttribute('aria-selected', k === i ? 'true' : 'false');
 o.tabIndex = k === i ? 0 : -1;
 });
 placer();
 panneaux[vieux].classList.remove('is-on');
 panneaux[i].classList.add('is-on');
 gsap.fromTo(panneaux[i], { opacity: 0, y: 16 },
 { opacity: 1, y: 0, duration: .5, ease: EXPO, clearProps: 'transform,opacity' });
 }
 onglets.forEach(function (o, k) {
 ctx.on(o, 'click', function () { activer(k); });
 ctx.on(o, 'keydown', function (e) {
 if (e.key !== 'ArrowLeft' && e.key !== 'ArrowRight') return;
 activer(k === 0 ? 1 : 0);
 onglets[cur].focus();
 });
 });
 ctx.on(window, 'resize', placer);
 requestAnimationFrame(placer);

 ctx.add(function () {
 return function () { sec.classList.remove('duel--vif'); };
 });
 }
 });

 /* ---------------------------------------------------------------
 LA LIGNE DE LA MÉTHODE, l'épine s'encre au fil du scroll, les
 nœuds s'allument au passage. Le CSS pose la trace PLEINE : on
 la rembobine au montage, donc jamais de ligne manquante sans
 JS, et jamais de saut visible (le montage précède la peinture
 du bas de page).
 --------------------------------------------------------------- */
 DTZ.fx.register('ligne', {
 select: '[data-lgn]',
 mount: function (fil, ctx) {
 var trace = $('[data-lgn-trace]', fil);
 if (trace) {
 ctx.add(function () {
 gsap.fromTo(trace, { scaleY: 0 }, {
 scaleY: 1, ease: 'none',
 scrollTrigger: {
 trigger: fil, start: 'top 72%', end: 'bottom 62%', scrub: .5
 }
 });
 });
 }
 $$('.lgn-step', fil).forEach(function (step) {
 ctx.st({
 trigger: step, start: 'top 68%',
 onEnter: function () { step.classList.add('is-vu'); },
 onLeaveBack: function () { step.classList.remove('is-vu'); }
 });
 });
 }
 });

 /* ---------------------------------------------------------------
 L'EXTINCTION, [data-etx] (pourquoi nous, réf. storey). Le
 projecteur suit la lecture : chaque rang porte un voile couleur
 du fond, posé à .75 AU MONTAGE (jamais en CSS, sans JS tout
 est plein feu). Deux temps scrubbés sur le même voile :
 · l'ALLUMAGE, .75 → 0 quand le rang monte vers la zone de
 lecture (top 88% → top 45%) ;
 · l'EXTINCTION · 0 → 1 quand il sort par le haut (top top →
 bottom top, mapping mesuré sur la référence).
 Deux tweens `to` scrubbés sur des plages disjointes : chacun
 capture sa valeur de départ à sa première activation, pas au
 montage, pas de guerre d'écriture. GSAP n'écrit que l'opacité
 du voile, un canal, un propriétaire.
 --------------------------------------------------------------- */
 DTZ.fx.register('etx', {
 select: '[data-etx]',
 mount: function (liste, ctx) {
 var rangs = $$('.etx-rang', liste);
 rangs.forEach(function (rang, i) {
 var voile = $('.etx-rang__voile', rang);
 if (!voile) return;
 /* Le premier rang arrive plein feu ; les suivants montent
 légèrement voilés et s'allument à l'approche. */
 gsap.set(voile, { opacity: i ? .55 : 0 });
 if (i) {
 ctx.add(function () {
 gsap.to(voile, {
 opacity: 0, ease: 'none',
 scrollTrigger: {
 trigger: rang, start: 'top 92%', end: 'top 55%', scrub: true
 }
 });
 });
 }
 /* Le recouvrement : le rang est sticky, sa BOÎTE défile mais
 lui reste figé, c'est donc l'arrivée du SUIVANT qui pilote
 son extinction : du moment où le suivant entame le
 chevauchement (sa boîte à une hauteur de rang du haut)
 jusqu'au recouvrement complet. ScrollTrigger mesure les
 boîtes de layout, pas la position sticky dessinée : le
 mapping reste exact. */
 var suivant = rangs[i + 1];
 if (suivant) {
 ctx.add(function () {
 gsap.to(voile, {
 opacity: 1, ease: 'none',
 scrollTrigger: {
 trigger: suivant,
 start: function () { return 'top ' + rang.offsetHeight + 'px'; },
 end: 'top top',
 scrub: true,
 invalidateOnRefresh: true
 }
 });
 });
 }
 });
 }
 });

 /* ---------------------------------------------------------------
 LE TRIPTYQUE, [data-tpk] (chiffres). La nappe fluide du survol
 est ancrée sur --mx/--my (les deux foyers suiveurs de §65) :
 ici on ne fait qu'écrire la position du pointeur en % du volet,
 le motif de la mosaïque §52. Sans pointeur fin (tactile), les
 variables gardent leur repli 50 %/45 %, la nappe vit par ses
 foyers d'ambiance.
 --------------------------------------------------------------- */
 DTZ.fx.register('tpk', {
 select: '[data-tpk]',
 mount: function (bande, ctx) {
 if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
 $$('.tpk-volet', bande).forEach(function (volet) {
 ctx.on(volet, 'pointermove', function (e) {
 var r = volet.getBoundingClientRect();
 volet.style.setProperty('--mx', (100 * (e.clientX - r.left) / r.width).toFixed(1) + '%');
 volet.style.setProperty('--my', (100 * (e.clientY - r.top) / r.height).toFixed(1) + '%');
 }, { passive: true });

 /* v5 · LE FLUIDE (tpk-gl.js, 2026-08-14). Le peintre 2D v4
 ancrait deux foyers sur le pointeur : la vidéo du client
 (SECTION LÀ PREUVE EN CHIFFRE) montre l'inverse, chez
 biograph la nappe moutonne TOUTE SEULE, la souris ne fait
 qu'allumer le volet. La v5 est le shader fBm à domaine
 déformé de gl.js, recoloré par volet, dans un petit canvas
 WebGL2 en demi-résolution, peint seulement pendant le
 survol et la queue du fondu. Si le montage échoue (porte,
 WebGL2), .a-fluide n'est jamais posée : la nappe CSS
 ::after de §65 reste le rendu. */
 var teinte = function (nom) {
 var v = getComputedStyle(volet).getPropertyValue(nom).trim();
 return v ? v.split(',').map(Number) : [200, 200, 200];
 };
 var clair = teinte('--tpk-clair'), dense = teinte('--tpk-dense');
 var vif = false, queue = 0;
 ctx.on(volet, 'pointerenter', function () { vif = true; queue = 70; });
 ctx.on(volet, 'pointerleave', function () { vif = false; });

 import('./tpk-gl.js?v=20260814d').then(function (TG) {
 var cvs = document.createElement('canvas');
 cvs.className = 'tpk-fluide';
 cvs.setAttribute('aria-hidden', 'true');
 var moteur = TG.monterFluide(cvs, clair, dense);
 if (!moteur) return;
 volet.insertBefore(cvs, volet.firstChild);
 volet.classList.add('a-fluide');
 ctx.add(function () { return function () { moteur.demonter(); }; });
 /* le pointeur, lissé, et sa VITESSE, c'est elle qui fait
 tourbillonner le fluide (retour client : « le fluide
 n'interagit pas avec la souris »). La cible vient des
 --mx/--my déjà écrits au pointermove. */
 var ptr = { x: .5, y: .45 }, force = 0;
 ctx.raf(function (t) {
 if (!vif && queue <= 0) return;
 if (!vif) queue--;
 var cx = parseFloat(volet.style.getPropertyValue('--mx') || '50') / 100;
 var cy = parseFloat(volet.style.getPropertyValue('--my') || '45') / 100;
 var dx = cx - ptr.x, dy = cy - ptr.y;
 ptr.x += dx * .09;
 ptr.y += dy * .09;
 var v = Math.min(1, Math.sqrt(dx * dx + dy * dy) * 9);
 force += (v - force) * .08;
 moteur.image(t, ptr.x, ptr.y, force);
 });
 }).catch(function () { /* module absent : le repli CSS suffit */ });
 });
 }
 });

 /* ---------------------------------------------------------------
 LA CLÔTURE, même geste que le manifeste : l'encre du titre se
 remplit mot à mot. La page ouvre et ferme sur la même écriture.
 --------------------------------------------------------------- */
 DTZ.fx.register('cloture', {
 select: '[data-fin-titre]',
 mount: function (titre, ctx) {
 var mots = splitWords(titre);
 ctx.add(function () {
 gsap.fromTo(mots, { opacity: .14 }, {
 opacity: 1, ease: 'none', stagger: .05,
 scrollTrigger: {
 trigger: titre, start: 'top 88%', end: 'top 42%', scrub: .4
 }
 });
 });
 }
 });

 /* ---------------------------------------------------------------
 L'EN-TÊTE : LA CAPSULE ET LE ROULEAU (2026-08-13)

 Trois gestes, tous réversibles, rien sans has-fx :
 1. `is-haut` / `is-flot`, le filet s'efface en haut de page,
 l'intérieur se détache en capsule dès qu'on défile. Un seul
 écouteur de scroll, throttlé au rAF.
 2. Le rouleau du logo (pointeur fin), au survol de l'icône,
 le masque s'étire (CSS) et la colonne roule : les six
 services défilent, le wordmark se pose en dernier. La
 figure du logo-roll de nk.studio, en une seule tween.
 3. Les libellés de nav en double étiquette, le survol roule
 le libellé sur son jumeau (CSS ; ici on ne fait
 qu'envelopper le texte, une fois).
 --------------------------------------------------------------- */
 DTZ.fx.register('entete', {
 select: '.header--v2',
 mount: function (tete, ctx) {

 /* La capsule est l'état de base (CSS §header v2) : plus
 d'états au scroll depuis le retour client du 2026-08-13.

 1, le rouleau du logo. */
 var logo = $('.logo--roll', tete);
 var roue = $('[data-logo-roue]', tete);
 if (logo && roue && matchMedia(BP.fin).matches &&
 matchMedia('(min-width:1121px)').matches) {
 var N = roue.children.length;
 var tl = null;
 ctx.on(logo, 'pointerenter', function () {
 logo.classList.add('is-roll');
 if (tl) tl.kill();
 /* MACHINE À SOUS (retour client, 3e réglage) : plus de
 crans, une vitesse CONSTANTE (ease:none, ~0,42 s par
 rang, assez lent pour lire), et à l'arrivée le rouleau
 dépasse d'un cheveu puis se cale : le cran d'arrêt. */
 tl = gsap.timeline({ delay: .05 });
 tl.to(roue, {
 yPercent: -100 * (N - 1) / N,
 duration: .42 * (N - 1), ease: 'none'
 });
 tl.fromTo(roue, { y: 0 }, { y: -7, duration: .12, ease: 'power1.out' });
 tl.to(roue, { y: 0, duration: .35, ease: 'back.out(3)' });
 }, { passive: true });
 ctx.on(logo, 'pointerleave', function () {
 logo.classList.remove('is-roll');
 if (tl) tl.kill();
 /* Le masque s'efface (CSS) pendant que la colonne se
 rembobine, prête pour le prochain passage. */
 tl = gsap.timeline({ delay: .2 });
 tl.to(roue, { yPercent: 0, y: 0, duration: .35, ease: 'power2.out' });
 }, { passive: true });
 ctx.add(function () {
 return function () {
 logo.classList.remove('is-roll');
 if (tl) tl.kill();
 gsap.set(roue, { clearProps: 'transform' });
 };
 });
 }

 /* 2, les libellés en double étiquette. Le méga-menu est rendu
 par site.js avant nous (les deux sont en defer, dans l'ordre
 des balises) ; au cas où, on retente à la frame suivante. */
 function envelopper() {
 var libs = $$('.mm__btn > span', tete);
 if (!libs.length) { requestAnimationFrame(envelopper); return; }
 libs.forEach(function (s) {
 if ($('.mmr', s)) return;
 var t = s.textContent;
 s.textContent = '';
 var pile = document.createElement('span'); pile.className = 'mmr';
 [t, t].forEach(function (x) {
 var e = document.createElement('span'); e.textContent = x;
 pile.appendChild(e);
 });
 s.appendChild(pile);
 });
 }
 envelopper();
 }
 });

/* ================================================================
 LA ROUE DES EXPERTISES, remplace le théâtre épinglé (§10, v5).

 POURQUOI PLUS D'ÉPINGLE. Le théâtre coûtait `pin:true`, et avec lui
 le bug le plus cher du fichier : GSAP rafraîchit ses ScrollTrigger
 dans l'ordre de création, le pin-spacer s'insérait donc APRÈS que le
 lot [data-fx] du §2 avait mesuré, et les neuf sections du dessous
 gardaient des coordonnées trop hautes de toute la distance
 d'épingle. On s'en sortait avec `refreshPriority`.

 Ici la hauteur du rail est portée par le CSS (§47). Elle existe au
 premier layout : il n'y a plus de « page d'avant le spacer », donc
 plus rien à prioriser. Le sticky fait le collage, le scrub fait le
 mouvement, exactement la recette de `.stack-card` (§4). On déclare
 quand même `priority`, et on le passe au déclencheur : c'est gratuit,
 et ça reste juste si quelqu'un rebascule un jour sur une épingle.

 QUATRE PROPRIÉTAIRES, QUATRE PROPRIÉTÉS :
 · attribut `transform` de .roue__ring → ICI, par setAttribute
 · attribut `transform` de .roue__slot → le HTML, jamais touché
 · opacity/visibility/y des .roue-pas → ICI, par autoAlpha
 · font-size/opacity des <text> → CSS, pilotées par classe

 RÈGLE N°1 : aucun état de départ n'est écrit en CSS. Sans ce
 fichier, `.roue--vif` n'arrive pas, le rail n'a pas de hauteur et
 les six pas se lisent entiers. C'est le montage qui cache, jamais
 la feuille de style.
 ================================================================ */
 DTZ.fx.register('roue', {
 select: '.roue',
 /* PAS de garde `media`. La scène se monte à TOUTES les largeurs :
 c'est ce que fait la référence, où la séquence tient aussi sur un
 téléphone (5 × la hauteur d'écran), et six rangées empilées ne
 racontent pas la même chose. Ce qui change sous 860px, c'est la
 mise en page, l'arc se replie sur le bord gauche et l'objet
 passe au-dessus de la copie, pas le mécanisme. */
 priority: 1,
 mount: function (sec, ctx) {
 var rail = $('.roue__rail', sec);
 var scene = $('.roue__scene', sec);
 var pas = $$('.roue-pas', sec);
 if (!rail || !scene || !pas.length) return;

 /* Deux arcs, le vertical du desktop, l'horizontal du mobile, montés en même temps, un seul visible à la fois (§47). Chacun
 porte SA géométrie dans le markup : on ne code aucune
 coordonnée ici, on lit celles qui sont dessinées. */
 var bagues = $$('.roue__ring', sec).map(function (g) {
 return {
 g: g,
 cx: parseFloat(g.getAttribute('data-cx')) || 0,
 cy: parseFloat(g.getAttribute('data-cy')) || 0,
 sens: parseFloat(g.getAttribute('data-sens')) || 1,
 slots: $$('.roue__slot', g)
 };
 });
 if (!bagues.length || pas.length < 2) return;

 var N = pas.length;
 var CRAN = 19; /* l'écart angulaire, §47 */

 /* Le drapeau qui allume la hauteur du rail et le collage. Posé
 ici et retiré au démontage : franchir 1120px dans un sens ou
 dans l'autre ne demande aucun rechargement. */
 sec.classList.add('roue--vif');

 pas.forEach(function (p, i) {
 gsap.set(p, { autoAlpha: i ? 0 : 1 });
 /* Cinq pas invisibles restent tabulables : le focus partirait
 dans le vide, sur cinq liens « Découvrir » qu'on ne voit pas. */
 if (i) { p.setAttribute('inert', ''); p.setAttribute('aria-hidden', 'true'); }
 });

 ctx.add(function () {
 return function () {
 sec.classList.remove('roue--vif');
 pas.forEach(function (p) {
 p.removeAttribute('inert');
 p.removeAttribute('aria-hidden');
 });
 };
 });

 var cur = 0, fondu = null;

 function bascule(i) {
 if (i === cur || !pas[i]) return;
 var sortant = pas[cur], entrant = pas[i];
 cur = i;

 bagues.forEach(function (b) {
 b.slots.forEach(function (s, k) {
 s.classList.toggle('is-on', k === i);
 s.classList.toggle('is-pres', Math.abs(k - i) === 1);
 });
 });
 scene.setAttribute('data-tone', entrant.getAttribute('data-tone') || '');

 sortant.setAttribute('inert', '');
 sortant.setAttribute('aria-hidden', 'true');
 entrant.removeAttribute('inert');
 entrant.removeAttribute('aria-hidden');

 /* Tuée avant chaque échange : deux fondus qui se chevauchent
 laissent un pas à mi-opacité quand on scrolle vite.

 Mais TUER une timeline fige aussi son sortant là où il en
 était. En traversant vite, la scène enchaîne 6→5→4→3 : à
 chaque cran on tue le fondu précédent, et le pas qu'il était
 en train d'éteindre reste à mi-course, définitivement, on
 finit avec deux textes superposés. Le balai ci-dessous éteint
 donc SÈCHEMENT tout ce qui n'est ni le sortant ni l'entrant.
 Au plus deux pas à l'écran, quelle que soit la vitesse. */
 if (fondu) fondu.kill();
 pas.forEach(function (p, k) {
 if (p !== sortant && p !== entrant) gsap.set(p, { autoAlpha: 0, y: 0 });
 });
 fondu = gsap.timeline()
 .to(sortant, { autoAlpha: 0, y: -14, duration: .26, ease: 'power2.in' }, 0)
 .fromTo(entrant, { autoAlpha: 0, y: 18 },
 { autoAlpha: 1, y: 0, duration: .44, ease: 'power3.out' }, .12);
 }

 /* La bague suit la molette au degré près, c'est elle qui donne
 la sensation de mécanisme. La copie, elle, ne se croise qu'au
 changement de cran : à l'arrêt le texte est TOUJOURS dans un
 état lisible et le lien toujours cliquable, ce qu'un fondu
 scrubbé ne garantit pas. */
 var etat = { p: 0 };

 function pose() {
 bagues.forEach(function (b) {
 b.g.setAttribute('transform', 'rotate(' +
 (b.sens * etat.p * CRAN).toFixed(2) + ' ' + b.cx + ' ' + b.cy + ')');
 });
 var i = Math.round(etat.p);
 /* Bande morte : un tremblement de trackpad à mi-course ne doit
 pas faire clignoter la copie. */
 if (i !== cur && Math.abs(etat.p - i) < .44) bascule(i);
 }
 pose();

 ctx.add(function () {
 gsap.to(etat, {
 p: N - 1, ease: 'none', onUpdate: pose,
 scrollTrigger: {
 trigger: rail,
 start: 'top ' + (4.2 * 16) + 'px', /* le haut du rail sous le header */
 end: 'bottom bottom', /* le rail EST le budget */
 scrub: .55,
 invalidateOnRefresh: true,
 refreshPriority: ctx.priorite
 }
 });
 });

 /* L'objet du cran actif respire, le client demande du mouvement
 perpétuel dans une scène, pas une image qui attend. Un seul
 tween, sur la figure visible : les cinq autres sont en
 visibility:hidden, le navigateur ne les peint pas. */
 ctx.add(function () {
 var vues = pas.map(function (p) { return $('.roue-pas__vue img', p); });
 var t = gsap.to(vues.filter(Boolean), {
 yPercent: -3.2, duration: 3.6, ease: 'sine.inOut',
 repeat: -1, yoyo: true, stagger: { each: .35, from: 'random' }
 });
 return function () { t.kill(); };
 });
 }
 });

 /* ---------------------------------------------------------------
 LA COUCHE WEBGL, chargée à la demande, jamais dans le chemin
 critique.

 L'ordre des signaux compte : `load` et non DOMContentLoaded, parce
 que le héros de l'accueil porte six images en `loading="eager"`
 pour environ 350 Ko, le LCP passe avant le décor. Puis un temps
 mort, avec un plafond pour ne pas attendre indéfiniment sur une
 page qui ne se calme jamais.

 Si la porte refuse, `import()` n'est jamais appelé : zéro octet
 téléchargé, et le repli, les .fx-orb et le grain CSS d'aujourd'hui, reste seul à l'écran, ce qu'il est déjà en production.
 --------------------------------------------------------------- */
 window.addEventListener('load', function () {
 var creneau = window.requestIdleCallback ||
 function (f) { return setTimeout(f, 200); };
 creneau(function () {
 /* La nuée en verre (héros accueil) : même contrat que la nappe, porte, import différé, repli CSS intact tant que la première
 image n'est pas tirée. */
 var toileNuee = $('[data-gl-nuee]');
 if (toileNuee) {
 import('./nuee-gl.js?v=20260814h').then(function (NG) {
 return NG.monterNuee(toileNuee);
 }).then(function (moteur) {
 if (!moteur) return;
 DTZ.fx.register('nuee-verre', {
 select: function () { return [toileNuee]; },
 mount: function (h, ctx) {
 ctx.raf(moteur.image);
 if ('IntersectionObserver' in window) {
 var io = new IntersectionObserver(function (e) {
 /* la DERNIÈRE entrée : un callback peut livrer
 plusieurs franchissements (aller-retour rapide),
 ordonnés du plus ancien au plus récent, e[0]
 inversait l'état jusqu'au franchissement suivant */
 moteur.visibilite(e[e.length - 1].isIntersecting);
 });
 io.observe(h);
 ctx.add(function () { return function () { io.disconnect(); }; });
 }
 ctx.on(window, 'resize', function () { moteur.taille(); }, { passive: true });
 ctx.on(window, 'pointermove', function (e) {
 moteur.pointeur(e.clientX / innerWidth, e.clientY / innerHeight);
 }, { passive: true });
 ctx.add(function () { return function () { moteur.demonter(); }; });
 }
 });
 }).catch(function () {});
 }

 var hote = $('[data-fx-hero] .fx-stage');
 if (!hote) return;

 import('./gl.js').then(function (GL) {
 var refus = GL.porteOuverte();
 if (refus) return;

 DTZ.fx.register('nappe', {
 select: function () { return [hote]; },
 mount: function (h, ctx) {
 var moteur = GL.monter(h);
 if (!moteur) return;

 /* Le rendu partage le ticker de GSAP : une seule boucle de
 frame pour toute la page, jamais un rAF concurrent. C'est
 déjà le motif du fichier. */
 ctx.raf(moteur.image);

 /* Hors écran, on ne tire rien. Le héros quitte le viewport
 dès le deuxième écran d'une page qui en fait dix-neuf. */
 if ('IntersectionObserver' in window) {
 var io = new IntersectionObserver(function (e) {
 /* même correctif que la nuée : la dernière entrée */
 moteur.visibilite(e[e.length - 1].isIntersecting);
 });
 io.observe(h);
 ctx.add(function () { return function () { io.disconnect(); }; });
 }

 ctx.on(window, 'resize', function () { moteur.taille(); }, { passive: true });
 ctx.on(window, 'pointermove', function (e) {
 var r = h.getBoundingClientRect();
 moteur.pointeur((e.clientX - r.left) / r.width,
 (e.clientY - r.top) / r.height);
 }, { passive: true });
 }
 });
 }).catch(function () { /* module absent ou CSP : le repli suffit */ });
 }, { timeout: 1500 });
 });

 /* Bascule à chaud vers reduced-motion : on fige tout, états finaux. */
 mqReduce.addEventListener('change', function (e) {
 if (!e.matches) return;
 ScrollTrigger.getAll().forEach(function (t) { t.kill(); });
 gsap.globalTimeline.clear();
 root.classList.remove('has-fx');
 $$('.fxw__i').forEach(function (w) { w.style.transform = 'none'; });
 });
})();

/* ================================================================
 11 · LES VISUELS DE « NOS RÉSULTATS », du mouvement, jamais de
 bascule.

 Les trois cadres portaient un tilt 3D au pointeur ([data-fx-tilt]) :
 ce qui les faisait bouger les faisait aussi PENCHER, et une maquette
 de travers se lit comme une maquette de travers (retour Bastien
 2026-08-11 : « les images doivent être droites »). Le tilt est
 retiré du HTML ; le mouvement revient ici, en translation pure.

 · LA DÉRIVE AU SCROLL, chaque visuel remonte doucement pendant que
 sa carte traverse l'écran. Sur une pile, chaque planche dérive à
 SA vitesse : c'est ce décalage qui creuse la profondeur, pas une
 rotation.
 · LA PARALLAXE AU POINTEUR, le même geste au doigt, par plan.

 CANAUX ÉTANCHES, et c'est la règle du fichier : GSAP écrit
 `transform` (x / y / yPercent), la CSS garde `translate:` pour
 l'ouverture au survol et `left/top` pour la composition. Trois
 auteurs, trois propriétés, personne ne s'écrase.
 ================================================================ */
(function () {
 'use strict';
 if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
 if (!window.gsap || !window.ScrollTrigger) return;
 var cartes = [].slice.call(document.querySelectorAll('.resx-case'));
 if (!cartes.length) return;

 cartes.forEach(function (carte) {
 var slot = carte.querySelector('.resx-slot');
 if (!slot) return;
 /* Les plans du visuel : les planches d'une pile, sinon le visuel
 entier (l'image détourée, la carte du résultat Google). */
 var plans = [].slice.call(slot.querySelectorAll('.resx-pile img'));
 var solo = !plans.length;
 if (solo) {
 var seul = slot.querySelector('img, .resx-serp');
 if (!seul) return;
 plans = [seul];
 }

 /* La dérive : le fond bouge moins que le premier plan. Amplitudes
 en % de la hauteur du plan, elles suivent donc la taille du
 visuel sans réglage par palier. */
 plans.forEach(function (el, k) {
 var amp = solo ? 3.5 : 2.5 + k * 2;
 gsap.fromTo(el, { yPercent: amp }, {
 yPercent: -amp, ease: 'none',
 scrollTrigger: {
 trigger: carte, start: 'top bottom', end: 'bottom top', scrub: 1
 }
 });
 });

 if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
 var movers = plans.map(function (el, k) {
 return {
 d: solo ? 1 : .45 + k * .8,
 x: gsap.quickTo(el, 'x', { duration: .7, ease: 'power3' }),
 y: gsap.quickTo(el, 'y', { duration: .7, ease: 'power3' })
 };
 });
 /* Le pointeur est écouté sur la CARTE, pas sur le cadre : le geste
 commence dès qu'on entre dans la carte, colonne de texte
 comprise, sinon le visuel ne réagit qu'une fois la souris
 posée dessus, et l'effet passe pour un défaut. */
 carte.addEventListener('pointermove', function (e) {
 var r = carte.getBoundingClientRect();
 var px = (e.clientX - r.left) / r.width - .5;
 var py = (e.clientY - r.top) / r.height - .5;
 movers.forEach(function (m) { m.x(px * m.d * 20); m.y(py * m.d * 13); });
 });
 carte.addEventListener('pointerleave', function () {
 movers.forEach(function (m) { m.x(0); m.y(0); });
 });
 });
})();
