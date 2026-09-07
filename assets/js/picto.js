/* ================================================================
 DIGISTYLZE · PICTOGRAMMES TRACÉS

 Un picto = un attribut. `<span data-picto="audit"></span>` suffit :
 la géométrie est prise dans le registre (assets/js/pictos.js), le
 SVG est injecté ici, et le tracé est confié au verbe `draw` de
 assets/js/motion.js, celui qui anime déjà les 13 pages géo.

 POURQUOI PAS UNE COCHE OU UNE PUCE
 Une puce ne dit rien de ce qu'elle accompagne. Un trait qui se
 dessine à la lecture donne un rythme et une intention.

 POURQUOI MOTION ONE ET PAS GSAP
 Le site embarque déjà Motion One, et son verbe `draw` fait
 exactement le travail : il mesure avec getTotalLength(), la même
 méthode que DrawSVGPlugin, avec repli getBBox(), cascade, nettoyage
 final et prefers-reduced-motion verrouillé trois fois. Ajouter GSAP
 à côté, c'était 119 Ko pour refaire ce qui existait.

 ORDRE DE CHARGEMENT · IMPORTANT
 Ce fichier doit s'exécuter AVANT motion.js. motion.js mesure la
 longueur des tracés au moment où il s'enregistre ; si les SVG ne
 sont pas encore dans le document, getTotalLength() renvoie 0 et le
 repli sur getBBox() donne une longueur fausse, le picto se dessine
 alors à une vitesse aberrante. D'où, en fin de <body> :
 <script src="assets/js/pictos.js"></script>
 <script src="assets/js/picto.js"></script>
 <script src="assets/js/motion.js"></script>

 SANS JS
 L'attribut reste vide et `[data-picto]:empty{display:none}` ne
 réserve aucune place. Le picto est décoratif, `aria-hidden`, le
 sens est porté par le texte voisin, donc son absence ne coûte
 rien. C'est l'inverse du contenu, qu'on ne masque jamais.
 ================================================================ */
(() => {
 var hotes = [].slice.call(document.querySelectorAll('[data-picto]'));
 if (!hotes.length) return;

 var REGISTRE = (window.DTZ && window.DTZ.PICTOS) || null;
 if (!REGISTRE) return; // registre absent : on ne pose rien

 var NS = 'http://www.w3.org/2000/svg';

 /* Épaisseur : 1.5 comme le styleguide (« outline 1.5px »). Exposée en
 variable CSS pour qu'une pose particulière puisse l'ajuster sans
 toucher au JS. */
 function dessine(role) {
 var entree = REGISTRE[role];
 if (!entree) return null;
 var svg = document.createElementNS(NS, 'svg');
 svg.setAttribute('viewBox', '0 0 24 24');
 svg.setAttribute('fill', 'none');
 svg.setAttribute('stroke', 'currentColor');
 svg.setAttribute('stroke-width', '1.5');
 svg.setAttribute('stroke-linecap', 'round');
 svg.setAttribute('stroke-linejoin', 'round');
 /* Décoratif : le sens est dans le texte à côté, jamais dans l'icône.
 Un lecteur d'écran n'a rien à y lire. */
 svg.setAttribute('aria-hidden', 'true');
 svg.setAttribute('focusable', 'false');
 entree.forEach(function (forme) {
 var el = document.createElementNS(NS, forme[0]);
 var attrs = forme[1];
 for (var k in attrs) {
 if (Object.prototype.hasOwnProperty.call(attrs, k)) {
 el.setAttribute(k, attrs[k]);
 }
 }
 svg.appendChild(el);
 });
 return svg;
 }

 var inconnus = [];
 function pose(el) {
 var role = el.getAttribute('data-picto');
 var svg = dessine(role);
 if (!svg) { inconnus.push(role); return; }
 el.textContent = '';
 el.appendChild(svg);
 el.classList.add('picto');
 /* Le tracé appartient à motion.js. On se contente de déclarer
 l'intention ; si Motion One n'est pas là, le picto reste
 simplement dessiné, entièrement.

 Sauf si un ANCÊTRE porte déjà data-motion="draw", le cas des
 listes à puces, dont le <ul> est déjà un hôte de tracé. Le verbe
 `draw` cherche ses tracés en DESCENDANTS de son hôte : deux hôtes
 imbriqués animeraient les mêmes chemins deux fois, avec deux
 cascades décalées. Un seul hôte, celui du haut. */
 if (!el.hasAttribute('data-motion') && !el.closest('[data-motion="draw"]')) {
 el.setAttribute('data-motion', 'draw');
 }
 }
 hotes.forEach(pose);

 /* Les contenus construits APRÈS le chargement (la modale d'aperçu)
 appellent ceci sur leur sous-arbre : mêmes tracés, même registre. */
 window.DTZ.posePictos = function (racine) {
 [].forEach.call((racine || document).querySelectorAll('[data-picto]'), function (el) {
 if (!el.firstChild) pose(el);
 });
 };

 /* Un rôle inconnu est une faute de frappe dans le HTML, pas une
 condition d'exécution : on le dit une fois, sans casser la page. */
 if (inconnus.length && window.console) {
 console.warn('[picto] rôle inconnu :', inconnus.join(', '));
 }
})();
