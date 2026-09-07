/* ================================================================
 DIGISTYLZE · VIZ : la part qui a besoin de JavaScript
 ================================================================
 viz.css fait tout le reste. Ce fichier ne contient que les deux choses
 qu'une feuille de style ne sait pas faire :

 1. Le comparateur avant/après, qui a besoin d'un pointeur.
 2. Le repli des animations liées au défilement, pour les navigateurs
 qui ne connaissent pas `animation-timeline: view()`.

 CONTRAT
 Rien ici n'est nécessaire pour LIRE un graphique. Les briques sont
 dessinées à leur état final par le CSS ; ce script ne fait qu'ajouter du
 mouvement et une poignée. Fichier absent, JS coupé, erreur au chargement :
 la page reste complète. C'est la règle n°1 du BUILD-GUIDE.

 Il ne touche pas non plus à l'IntersectionObserver de `.wf-rev` dans
 site.js, qui est le seul propriétaire de cette classe sur les 34 pages.
 Celui-ci observe `[data-viz-fill]`, personne d'autre.
 ================================================================ */
(function () {
 'use strict';

 var moinsDeMouvement = window.matchMedia &&
 window.matchMedia('(prefers-reduced-motion: reduce)').matches;

 /* ------------------------------------------------------------
 1. COMPARATEUR AVANT / APRÈS
 ------------------------------------------------------------
 Sans ce script, `.viz-ab` est une grille de deux images légendées :
 la comparaison se fait déjà. `is-live` les superpose et donne la
 poignée. On n'ajoute la classe qu'une fois les écouteurs posés, la
 mise en page superposée n'existe donc jamais sans son pilote.
 */
 function comparateurs() {
 /* Opt-in délibéré. Le côte à côte est la forme par défaut et convient
 aux visuels portrait ; le curseur ne vaut que sur des visuels larges,
 et c'est l'auteur de la page qui le sait, pas ce script. */
 var lot = document.querySelectorAll('.viz-ab[data-viz-ab="curseur"]');
 for (var i = 0; i < lot.length; i++) poseComparateur(lot[i]);
 }

 function poseComparateur(ab) {
 if (ab.children.length < 2) return; // il faut un avant ET un après

 var poignee = document.createElement('span');
 poignee.className = 'viz-ab__handle';
 ab.appendChild(poignee);

 // Le curseur est aussi un contrôle : il doit être atteignable au clavier.
 var glisseur = document.createElement('input');
 glisseur.type = 'range';
 glisseur.min = 0; glisseur.max = 100; glisseur.value = 50;
 glisseur.className = 'viz-ab__range';
 glisseur.setAttribute('aria-label', 'Curseur de comparaison avant / après');
 glisseur.style.cssText = 'position:absolute;inset:auto 0 0 0;width:100%;' +
 'opacity:0;height:2.6rem;cursor:ew-resize';
 ab.appendChild(glisseur);

 function place(pct) {
 pct = Math.max(0, Math.min(100, pct));
 ab.style.setProperty('--split', pct + '%');
 glisseur.value = pct;
 }

 function depuisEvenement(e) {
 var r = ab.getBoundingClientRect();
 var x = (e.touches ? e.touches[0].clientX : e.clientX) - r.left;
 place((x / r.width) * 100);
 }

 var actif = false;
 ab.addEventListener('pointerdown', function (e) {
 actif = true; ab.setPointerCapture(e.pointerId); depuisEvenement(e);
 });
 ab.addEventListener('pointermove', function (e) {
 if (actif) depuisEvenement(e);
 });
 ab.addEventListener('pointerup', function () { actif = false; });
 ab.addEventListener('pointercancel', function () { actif = false; });
 glisseur.addEventListener('input', function () { place(+glisseur.value); });

 place(50);
 ab.classList.add('is-live');
 }

 /* ------------------------------------------------------------
 2. REPLI DES ANIMATIONS LIÉES AU DÉFILEMENT
 ------------------------------------------------------------
 `animation-timeline: view()` fait tout le travail là où il existe.
 Ailleurs, et seulement là, on rejoue la même chose à l'entrée dans
 l'écran, avec une transition CSS. On n'anime QUE ce qui porte
 `data-viz-fill`, pour que l'auteur d'une page choisisse explicitement
 ce qui bouge, plutôt que de subir un balayage global.
 */
 function repliDefilement() {
 var natif = CSS.supports && CSS.supports('animation-timeline', 'view()');
 if (natif || moinsDeMouvement || !window.IntersectionObserver) return;

 var lot = document.querySelectorAll('[data-viz-fill]');
 if (!lot.length || !document.body.animate) return;

 /* AUCUN ÉTAT DE DÉPART N'EST ÉCRIT DANS LE DOM.
 La première version mettait les briques à zéro puis attendait
 l'observateur pour les rendre. Éprouvée dans un cadre que
 l'observateur ne voit jamais, elle laissait des graphiques vides, exactement ce que le contrat interdit. Un filet à 4 secondes ne
 rachète pas un graphique vide pendant 4 secondes.

 On passe donc par l'API d'animation : le zéro n'existe que dans la
 trame de l'animation, jamais dans le style de l'élément. Si
 l'observateur ne se déclenche jamais, si l'animation échoue, si le
 navigateur l'ignore, la brique reste à la hauteur que le CSS lui a
 donnée. Il n'y a plus de chemin qui mène à un graphique vide. */
 var obs = new IntersectionObserver(function (entrees) {
 entrees.forEach(function (e) {
 if (!e.isIntersecting) return;
 obs.unobserve(e.target);
 var el = e.target;
 var largeur = el.getAttribute('data-viz-fill') === 'largeur';
 var cible = getComputedStyle(el)[largeur ? 'flexGrow' : 'height'];
 try {
 el.animate(
 largeur ? [{ flexGrow: 0.001 }, { flexGrow: cible }]
 : [{ height: '0px' }, { height: cible }],
 { duration: 900, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'none' });
 } catch (err) { /* la brique est déjà à sa valeur finale */ }
 });
 }, { threshold: 0.25 });

 for (var k = 0; k < lot.length; k++) obs.observe(lot[k]);
 }

 /* ------------------------------------------------------------
 3. LONGUEUR DU TIRET DES COURBES
 ------------------------------------------------------------
 `pathLength="1"` devait suffire à normaliser la longueur, et suffisait, jusqu'à ce que `vector-effect:non-scaling-stroke` entre en jeu. Le
 moteur calcule alors les tirets dans l'espace RENDU sans réappliquer le
 rapport de pathLength : `stroke-dasharray:1` couvrait 1/échelle de la
 courbe, et le tracé s'arrêtait avant son point final (60 % sur la page
 SEO, où l'échelle vaut 1,66).

 On mesure donc, une fois par courbe et à chaque redimensionnement :
 longueur géométrique × échelle de rendu = longueur en pixels du tracé
 réellement dessiné. C'est cette valeur que le CSS consomme, pour le
 tiret comme pour le point de départ de l'animation.

 Sans ce passage, script absent, erreur, JS coupé, `--viz-dash` reste
 indéfini, `stroke-dasharray` retombe sur `none` et la courbe est pleine.
 */
 function tracesCourbes() {
 var lot = document.querySelectorAll('.viz-line__path');
 if (!lot.length) return;

 function mesure(chemin) {
 var svg = chemin.ownerSVGElement;
 if (!svg || typeof chemin.getTotalLength !== 'function') return;
 var boite = svg.getBoundingClientRect();
 /* Élément masqué ou pas encore mis en page : on ne pose rien plutôt
 que de poser un zéro, qui masquerait la courbe. */
 if (!boite.width) return;
 var vb = svg.viewBox && svg.viewBox.baseVal;
 var largeurUtile = vb && vb.width ? vb.width : boite.width;
 var echelle = boite.width / largeurUtile;
 var longueur = chemin.getTotalLength() * echelle;
 if (!longueur) return;
 /* Une fraction de pixel en plus : aux échelles fractionnaires, le
 moteur arrondit vers le bas et laissait apparaître la pointe du
 tiret suivant au bout de la courbe. */
 chemin.style.setProperty('--viz-dash', (longueur + 1).toFixed(2) + 'px');
 }

 function toutes() {
 for (var i = 0; i < lot.length; i++) mesure(lot[i]);
 }

 toutes();

 if (window.ResizeObserver) {
 var ro = new ResizeObserver(toutes);
 for (var j = 0; j < lot.length; j++) {
 if (lot[j].ownerSVGElement) ro.observe(lot[j].ownerSVGElement);
 }
 } else {
 window.addEventListener('resize', toutes);
 }
 }

 function demarre() {
 try { comparateurs(); } catch (e) { /* la grille côte à côte reste lisible */ }
 try { repliDefilement(); } catch (e) { /* les graphiques restent pleins */ }
 try { tracesCourbes(); } catch (e) { /* les courbes restent pleines */ }
 }

 if (document.readyState === 'loading') {
 document.addEventListener('DOMContentLoaded', demarre);
 } else {
 demarre();
 }
})();
