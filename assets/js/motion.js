/* ================================================================
 DIGISTYLZE · COUCHE MOTION

 Anime les éléments portant un attribut [data-motion], au moyen de
 Motion One (motion.dev), hébergé localement dans assets/js/motion-one.js.

 Hébergé et non chargé depuis un CDN : le site n'a jamais eu de
 dépendance externe hors Google Fonts, et un CDN aurait ajouté une
 panne possible (indisponibilité, SRI invalidé par un rebuild,
 proxy d'entreprise, CSP) sur du code qui touche à la VISIBILITÉ du
 contenu. En local, c'est une requête same-origin sur une connexion
 déjà ouverte, sans requête tierce ni fuite de referrer.

 ── LA RÈGLE QUI NE DOIT JAMAIS ÊTRE ENFREINTE ──────────────────
 Tout élément animé ici est VISIBLE PAR DÉFAUT en CSS. Motion n'a
 le droit d'animer QUE depuis un décalage vers l'état de repos,
 jamais de laisser un élément dans un état non-défaut.

 Le décalage de départ vit derrière `html.wf-js.has-motion`, et
 `has-motion` n'est posé qu'à l'intérieur de la promesse résolue,
 donc uniquement si Motion s'est réellement exécuté. CDN en panne,
 SRI invalide, proxy d'entreprise, CSP stricte, mode hors ligne :
 la classe n'arrive jamais, le sélecteur ne s'applique jamais, la
 page s'affiche entièrement. C'est la raison d'être de ce fichier.

 ── CE QUE CE FICHIER NE TOUCHE PAS ─────────────────────────────
 Le système de reveal historique (.wf-rev piloté par
 IntersectionObserver dans site.js) reste seul maître de son
 domaine et n'a aucune dépendance à Motion. C'est l'animation
 garantie du site sur les 34 pages. Les deux ensembles sont
 disjoints : aucun élément ne porte à la fois .wf-rev et
 [data-motion].
 ================================================================ */
(function () {
 "use strict";

 var root = document.documentElement;
 if (!document.querySelector('[data-motion]')) return;

 /* Motion One n'honore PAS prefers-reduced-motion de lui-même : c'est
 entièrement notre responsabilité. Verrou n°1, avant tout le reste. */
 var mqReduce = matchMedia('(prefers-reduced-motion:reduce)');
 if (mqReduce.matches) return;

 var handles = []; // pour pouvoir tout arrêter si l'utilisateur bascule

 /* ---------------------------------------------------------------
 Résolution de Motion, jamais bloquante.

 motion-one.js est chargé en `defer` : il s'exécute après l'analyse
 du document, donc potentiellement APRÈS ce fichier selon l'ordre
 d'insertion. window.Motion peut donc encore être undefined ici,
 ce qui est normal. Le timeout couvre le cas où le fichier est
 absent ou tronqué sans que l'événement 'error' se déclenche, sans lui la promesse resterait pendante à vie.
 --------------------------------------------------------------- */
 function resolveMotion() {
 return new Promise(function (resolve) {
 if (window.Motion) return resolve(window.Motion);
 var s = document.getElementById('motion-lib');
 if (!s) return resolve(null);
 var done = false;
 var t = setTimeout(function () { settle(null); }, 2000);
 function settle(v) { if (!done) { done = true; clearTimeout(t); resolve(v); } }
 s.addEventListener('load', function () { settle(window.Motion || null); });
 s.addEventListener('error', function () { settle(null); });
 });
 }

 function each(sel, fn) { [].forEach.call(document.querySelectorAll(sel), fn); }
 function num(el, attr, def) {
 var v = parseFloat(el.getAttribute(attr));
 return isNaN(v) ? def : v;
 }

 resolveMotion().then(function (M) {
 if (!M) return; // dégradation : tout reste visible
 var animate = M.animate, inView = M.inView, scroll = M.scroll, stagger = M.stagger;
 if (!animate || !inView) return;

 /* À partir d'ici seulement, le CSS a le droit de masquer les états
 de départ. L'ordre importe : la classe est posée avant le premier
 inView, sinon le décalage n'aurait jamais lieu. */
 root.classList.add('has-motion');

 var SPRING = { type: 'spring', stiffness: 100, damping: 20 };
 var EASE = [0.16, 1, 0.3, 1];

 /* reveal, apparition simple à l'entrée dans le viewport. */
 each('[data-motion="reveal"]', function (el) {
 inView(el, function () {
 handles.push(animate(el,
 { opacity: [0, 1], transform: ['translateY(' + num(el, 'data-mo-y', 24) + 'px)', 'none'] },
 { duration: 0.7, easing: EASE, delay: num(el, 'data-mo-delay', 0) }));
 el.classList.add('is-in');
 return false; // une seule fois
 }, { margin: '0px 0px -12% 0px' });
 });

 /* stagger, cascade sur les enfants directs, ou sur un sélecteur donné. */
 each('[data-motion="stagger"]', function (el) {
 var sel = el.getAttribute('data-mo-child');
 var kids = sel ? el.querySelectorAll(sel) : el.children;
 if (!kids.length) return;
 inView(el, function () {
 handles.push(animate(kids,
 { opacity: [0, 1], transform: ['translateY(20px)', 'none'] },
 { delay: stagger(num(el, 'data-mo-step', 0.06)), duration: 0.6, easing: EASE }));
 el.classList.add('is-in');
 return false;
 }, { margin: '0px 0px -10% 0px' });
 });

 /* draw, le picto se trace lui-même à l'entrée dans le viewport.

 Technique : stroke-dasharray posé à la longueur exacte du tracé, puis
 stroke-dashoffset ramené à 0. Rien d'autre ne bouge, pas de rotation,
 pas de rebond. C'est ce qui rend l'effet lisible sur une icône de 20px
 et le garde discret quand il y en a huit dans la même section.

 L'état de repos est l'icône ENTIÈREMENT TRACÉE : le décalage est posé
 ici, en JS, juste avant d'animer. Sans Motion, sans JS, ou si l'élément
 n'entre jamais dans le viewport, l'icône reste simplement dessinée.
 C'est le même invariant que partout ailleurs dans ce fichier. */
 each('[data-motion="draw"]', function (host) {
 var paths = host.querySelectorAll('path, line, polyline, circle, rect, ellipse');
 if (!paths.length) return;
 var lens = [];
 for (var i = 0; i < paths.length; i++) {
 /* getTotalLength n'existe pas sur <rect> et <ellipse> dans tous les
 moteurs : on retombe alors sur le périmètre de la boîte. */
 var L;
 try { L = paths[i].getTotalLength(); } catch (e) { L = 0; }
 if (!L || !isFinite(L)) {
 var bb = paths[i].getBBox();
 L = 2 * (bb.width + bb.height);
 }
 lens.push(L);
 }
 inView(host, function () {
 for (var i = 0; i < paths.length; i++) {
 var p = paths[i], L = lens[i];
 p.style.strokeDasharray = L;
 p.style.strokeDashoffset = L;
 handles.push(animate(p, { strokeDashoffset: [L, 0] }, {
 duration: 0.75,
 delay: i * 0.07 + num(host, 'data-mo-delay', 0),
 easing: EASE
 }).finished.then(function () {
 /* On rend la main au CSS une fois le tracé terminé : un
 dasharray résiduel altère le rendu au zoom et à l'impression. */
 for (var j = 0; j < paths.length; j++) {
 paths[j].style.strokeDasharray = '';
 paths[j].style.strokeDashoffset = '';
 }
 }));
 }
 host.classList.add('is-in');
 return false; // une seule fois
 }, { margin: '0px 0px -10% 0px' });
 });

 /* parallax, translation liée au défilement, sur transform uniquement. */
 if (scroll) {
 each('[data-motion="parallax"]', function (el) {
 var range = num(el, 'data-mo-range', 60);
 handles.push(scroll(
 animate(el, { transform: ['translateY(' + range + 'px)', 'translateY(-' + range + 'px)'] },
 { easing: 'linear' }),
 { target: el, offset: ['start end', 'end start'] }));
 });
 }

 /* magnetic, le bouton se déporte vers le curseur.
 Strictement réservé au pointeur fin : sur tactile, un drag
 déclencherait le déport sans jamais le relâcher. */
 if (matchMedia('(hover:hover) and (pointer:fine)').matches) {
 each('[data-motion="magnetic"]', function (el) {
 var pull = num(el, 'data-mo-pull', 8);
 el.addEventListener('pointermove', function (e) {
 var r = el.getBoundingClientRect();
 animate(el, {
 x: ((e.clientX - r.left) / r.width - 0.5) * pull * 2,
 y: ((e.clientY - r.top) / r.height - 0.5) * pull * 2
 }, SPRING);
 });
 el.addEventListener('pointerleave', function () {
 animate(el, { x: 0, y: 0 }, SPRING);
 });
 });
 }

 /* Le compte à rebours des chiffres n'est PAS réimplémenté ici.
 Celui de site.js encode délibérément l'apostrophe suisse comme
 séparateur de milliers (toLocaleString varie selon la version
 d'ICU du navigateur) ; le réécrire casserait la règle 3 de
 check.py. data-motion="counter" est donc un simple marqueur
 documentaire : le comportement reste celui de site.js. */
 });

 /* Verrou n°3 : bascule à chaud vers reduced-motion. */
 mqReduce.addEventListener('change', function (e) {
 if (!e.matches) return;
 handles.forEach(function (h) { if (h && h.stop) h.stop(); });
 handles.length = 0;
 root.classList.remove('has-motion');
 });
})();
