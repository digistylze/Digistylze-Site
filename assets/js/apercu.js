/* ================================================================
 DIGISTYLZE · APERÇU DE PROJET
 ================================================================
 Ouvre la page d'accueil d'un client dans une modale, parcourable, sans
 quitter le site. Sert `realisations.html` et `creation-site-web.html`.

 POURQUOI UNE CAPTURE ET NON LE SITE EN DIRECT
 La première version montrait le site réel dans une iframe. Sur le poste
 de Bastien, plusieurs ne s'y affichaient pas correctement, et deux le
 refusent carrément par en-tête `X-Frame-Options`, ce que rien côté
 navigateur ne contourne. Une image, elle, ne refuse jamais.

 Elle a d'autres mérites qu'on ne cherchait pas : aucune requête vers un
 serveur tiers au moment du clic, donc aucun cookie déposé chez le
 visiteur par un site qu'il n'a pas choisi de visiter ; aucune bannière
 de consentement en travers de l'aperçu ; un affichage immédiat.

 Elle a un défaut, et il faut le connaître : elle date. Les captures sont
 régénérées par `tools/captures.py`, à relancer quand un client refait son
 site. C'est un échange délibéré, un aperçu figé mais fidèle vaut mieux
 qu'un aperçu vivant mais blanc.

 DEUX MODES
 1. `capture`, la page entière (`data-apercu-capture`), dans un
 conteneur qui défile. C'est le cas normal, les treize
 projets en ont une.
 2. `vignette`, l'image de la carte, centrée. Filet : si une capture
 manque, on montre ce qu'on a plutôt qu'un cadre vide.

 CONTRAT
 Sans ce script, les cartes restent des liens qui ouvrent le site en
 nouvel onglet : c'est leur `href`, écrit dans le HTML. On n'appelle
 `preventDefault()` qu'au moment où la modale s'ouvre vraiment.
 ================================================================ */
(function () {
 'use strict';

 var modal = document.getElementById('pvModal');
 if (!modal) return;

 var scene = modal.querySelector('.pv__scene');
 var img = modal.querySelector('.pv__scroll img');
 var boutonLive = modal.querySelector('[data-pv-live]');
 var cadreSite = modal.querySelector('.pv__iframe iframe');
 var dernierFocus = null;

 if (cadreSite) {
 cadreSite.addEventListener('load', function () {
 /* Le `load` d'une iframe sans src (about:blank) ne doit pas retirer
 un voile qui couvre autre chose. */
 if (cadreSite.getAttribute('src')) scene.classList.remove('is-loading');
 });
 }

 /* Panneau d'étude de cas, facultatif. Les pages qui n'ont ni le markup
 `.pv__cas` ni `window.DTZ_CAS` gardent la modale d'avant, sans panneau :
 c'est ce qui laisse `creation-site-web.html` fonctionner inchangé. */
 var corps = modal.querySelector('.pv__body');
 var cas = modal.querySelector('.pv__cas');
 var casDonnees = window.DTZ_CAS || null;
 /* Le clone du visuel de carte sert les catégories sans image, publicité et
 SEO n'ont qu'un dashboard ou une sparkline, tous deux en CSS et SVG
 autonomes. Les redessiner ici serait un doublon de plus à maintenir. */
 var cloneHote = modal.querySelector('.pv__clone');
 var barre = modal.querySelector('.pv__bar');

 function texte(el, valeur) {
 if (el) el.textContent = valeur || '';
 }

 function vide(el) {
 while (el && el.firstChild) el.removeChild(el.firstChild);
 }

 /* Rend intro, KPI et sections. Renvoie false si le projet n'a pas de fiche,
 auquel cas l'appelant replie la colonne. */
 function remplitCas(id) {
 if (!cas || !casDonnees || !id) return false;
 var d = casDonnees[id];
 if (!d) return false;

 texte(cas.querySelector('.pv__cas-intro'), d.intro);

 var grille = cas.querySelector('.pv__kpis');
 vide(grille);
 (d.kpis || []).forEach(function (k) {
 var cell = document.createElement('div');
 cell.className = 'pv__kpi';
 var b = document.createElement('b');
 b.textContent = k.value;
 var s = document.createElement('span');
 s.textContent = k.label;
 cell.appendChild(b);
 cell.appendChild(s);
 grille.appendChild(cell);
 });
 /* Deux ou trois KPI selon les projets : la colonne est posée ici plutôt
 qu'en CSS, pour qu'une fiche à deux entrées ne laisse pas un vide. */
 grille.style.gridTemplateColumns = 'repeat(' + ((d.kpis || []).length || 1) + ',minmax(0,1fr))';

 var blocs = cas.querySelector('.pv__cas-sections');
 vide(blocs);
 (d.sections || []).forEach(function (s) {
 var bloc = document.createElement('div');
 bloc.className = 'pv__cas-bloc';
 var h = document.createElement('h4');
 h.textContent = s.title;
 var p = document.createElement('p');
 p.textContent = s.body;
 bloc.appendChild(h);
 bloc.appendChild(p);
 blocs.appendChild(bloc);
 });
 return true;
 }

 function ouvre(declencheur) {
 var carte = declencheur.closest('[data-apercu-carte]') || declencheur.closest('article');
 var url = declencheur.getAttribute('href');
 var capture = declencheur.getAttribute('data-apercu-capture');
 /* La vignette peut être hors du déclencheur : sur les cartes non-web le
 déclencheur est un bouton posé en surimpression, pas le média lui-même. */
 var vignette = declencheur.querySelector('img') || (carte && carte.querySelector('.g-brandimg img:not(.alt), .g-social img:not(.alt), .g-logo img'));
 /* Publicité et SEO n'ont aucune image : on clone leur visuel de carte. */
 var source = carte && carte.querySelector('.g-dash, .g-spark');
 /* SITE NAVIGABLE, `data-apercu-embed` désigne les sites qui ACCEPTENT
 l'iframe (en-têtes vérifiés un à un le 2026-08-07 : 11 sur 13 ; Hygie
 Services et Négo Médiation refusent par X-Frame-Options et gardent la
 capture défilante). L'attribut est une liste blanche, pas une devinette :
 un refus d'iframe ne se détecte pas de façon fiable côté client. */
 var embed = declencheur.hasAttribute('data-apercu-embed') && url && cadreSite;
 var mode = embed ? 'embed'
 : (capture ? 'capture' : (vignette ? 'vignette' : (source ? 'clone' : 'vide')));

 var titre = carte && carte.querySelector('[data-apercu-titre], h3');
 var etiquette = carte && carte.querySelector('[data-apercu-tag]');
 var metas = carte ? [].slice.call(carte.querySelectorAll('[data-apercu-meta]')) : [];
 var meta = metas.map(function (e) { return e.textContent.trim(); })
 .filter(Boolean).join(' · ');

 texte(modal.querySelector('.pv__tag'), etiquette ? etiquette.textContent : '');
 texte(modal.querySelector('.pv__title'), titre ? titre.textContent : '');
 /* Monogramme d'en-tête : la première lettre du projet, dans sa tuile. */
 var mono = modal.querySelector('.pv__mono');
 if (mono) texte(mono, titre ? titre.textContent.trim().charAt(0).toUpperCase() : '');

 /* Méta en rangées à pictos quand les cartes les déclarent
 (data-apercu-picto) ; sinon, la ligne d'avant. */
 var metaHote = modal.querySelector('.pv__meta');
 if (metaHote) {
 vide(metaHote);
 var aPictos = metas.length && metas.some(function (m) { return m.hasAttribute('data-apercu-picto'); });
 metaHote.classList.toggle('pv__meta--rows', !!aPictos);
 if (aPictos) {
 metas.forEach(function (m) {
 var t = m.textContent.trim();
 if (!t) return;
 var rangee = document.createElement('span');
 rangee.className = 'pv__meta-row';
 var pic = document.createElement('span');
 pic.className = 'picto-slot';
 pic.setAttribute('data-picto', m.getAttribute('data-apercu-picto') || 'perimetre');
 pic.setAttribute('aria-hidden', 'true');
 rangee.appendChild(pic);
 rangee.appendChild(document.createTextNode(t));
 metaHote.appendChild(rangee);
 });
 if (window.DTZ && window.DTZ.posePictos) window.DTZ.posePictos(metaHote);
 } else {
 metaHote.textContent = meta;
 }
 }
 texte(modal.querySelector('.pv__bar b'), url ? url.replace(/^https?:\/\//, '') : '');
 boutonLive.dataset.href = url || '';

 /* Seuls les projets web ont un site à ouvrir. Ailleurs, la fausse barre de
 navigateur et le bouton « Ouvrir le site » annonceraient une adresse qui
 n'existe pas, on les retire plutôt que de les afficher vides. */
 boutonLive.hidden = !url;
 if (barre) barre.hidden = !url;

 scene.setAttribute('data-mode', mode);
 /* `img` reste sans `src` en mode clone : un `src` vide déclencherait une
 requête vers la page courante et un événement `error`. Son affichage est
 piloté par `data-mode` en CSS et non par `hidden`, `.pv__scroll img`
 porte `display:block`, un style auteur qui l'emporte sur l'attribut. */
 if (mode === 'capture' || mode === 'vignette') {
 img.src = capture || vignette.src;
 img.alt = vignette ? vignette.alt : '';
 } else {
 img.removeAttribute('src');
 img.alt = '';
 }

 /* Mode embed : le site réel, chargé au moment de l'ouverture seulement.
 Un voile de chargement couvre la scène jusqu'au `load` de l'iframe. */
 if (cadreSite) {
 if (mode === 'embed') {
 scene.classList.add('is-loading');
 cadreSite.title = 'Site ' + (titre ? titre.textContent.trim() : 'client') + ', navigable';
 if (cadreSite.getAttribute('src') !== url) cadreSite.setAttribute('src', url);
 else scene.classList.remove('is-loading');
 } else {
 /* Sortir l'iframe du circuit : un site resté chargé continuerait de
 vivre (sons, timers) derrière une capture. */
 cadreSite.removeAttribute('src');
 scene.classList.remove('is-loading');
 }
 }

 if (cloneHote) {
 vide(cloneHote);
 cloneHote.removeAttribute('data-tone');
 if (mode === 'clone') {
 /* La teinte du dashboard est portée par l'<article>, pas par le visuel
 lui-même : sans ce report, les barres du clone perdent leur dégradé
 et retombent sur la couleur par défaut. */
 var tone = carte && carte.getAttribute('data-tone');
 if (tone) cloneHote.setAttribute('data-tone', tone);
 var copie = source.cloneNode(true);
 copie.removeAttribute('id');
 /* Les identifiants de dégradé SVG des sparklines sont dupliqués par le
 clone. Deux `<defs>` de même id dans le document, et c'est le premier
 trouvé qui l'emporte, la copie hériterait des couleurs d'un autre
 projet. On les suffixe. */
 [].forEach.call(copie.querySelectorAll('[id]'), function (n) {
 var ancien = n.id;
 n.id = ancien + '-pv';
 [].forEach.call(copie.querySelectorAll('[stroke],[fill]'), function (u) {
 ['stroke', 'fill'].forEach(function (a) {
 var v = u.getAttribute(a);
 if (v && v.indexOf('url(#' + ancien + ')') === 0) u.setAttribute(a, 'url(#' + n.id + ')');
 });
 });
 });
 cloneHote.appendChild(copie);
 }
 }

 /* Remis en haut à chaque ouverture : sans cela, la modale rouvre à la
 hauteur où le visiteur avait laissé le projet précédent. */
 scene.scrollTop = 0;
 if (cas) {
 var aCas = remplitCas(carte && carte.getAttribute('data-apercu-id'));
 cas.hidden = !aCas;
 if (corps) corps.classList.toggle('pv__body--cas', aCas);
 cas.scrollTop = 0;
 }
 texte(modal.querySelector('.pv__hint'), mode === 'embed'
 ? 'Site réel, navigable, cliquez, faites défiler, changez de page.'
 : mode === 'capture'
 ? 'Page d’accueil entière, faites défiler.'
 : url ? 'Aperçu, ouvrez le site pour le parcourir.' : '');

 dernierFocus = document.activeElement;
 modal.hidden = false;
 if (window.DTZ && window.DTZ.lock) window.DTZ.lock();
 setTimeout(function () { modal.querySelector('.pv__close').focus(); }, 60);
 }

 function ferme() {
 if (modal.hidden) return;
 modal.hidden = true;
 /* Le site embarqué s'arrête avec la modale : sons, vidéos et timers
 n'ont rien à faire derrière une page fermée. */
 if (cadreSite) cadreSite.removeAttribute('src');
 if (window.DTZ && window.DTZ.unlock) window.DTZ.unlock();
 if (dernierFocus) dernierFocus.focus();
 }

 /* Délégation sur le document : la grille des réalisations est filtrée en
 permanence, attacher un écouteur par carte obligerait à le refaire à
 chaque filtrage.

 TOUTE LA CARTE OUVRE L'APERÇU : le clic sur [data-apercu-carte] est
 rabattu sur son déclencheur, sauf s'il visait un lien ou un bouton
 qui a son propre travail (étude de cas, CTA internes). */
 document.addEventListener('click', function (e) {
 var d = e.target.closest('[data-apercu]');
 if (!d) {
 var carte = e.target.closest('[data-apercu-carte]');
 if (carte && !e.target.closest('a, button')) {
 d = carte.querySelector('[data-apercu]');
 }
 }
 if (!d) return;
 e.preventDefault();
 ouvre(d);
 });

 boutonLive.addEventListener('click', function () {
 if (this.dataset.href) window.open(this.dataset.href, '_blank', 'noopener');
 });
 [].forEach.call(modal.querySelectorAll('[data-pv-close]'), function (el) {
 el.addEventListener('click', ferme);
 });
 document.addEventListener('keydown', function (e) {
 if (e.key === 'Escape' && !modal.hidden) ferme();
 });

 /* La molette doit agir sur la capture, pas sur la page derrière. C'est
 `overscroll-behavior:contain` qui s'en charge côté CSS ; ici on ne
 fait que donner le focus clavier à la zone qui défile, pour que les
 flèches et la barre d'espace marchent sans clic préalable. */
 scene.setAttribute('tabindex', '0');

 /* Piège à focus : une modale qu'on peut quitter au clavier sans la fermer
 laisse le lecteur d'écran parcourir la page derrière le voile. */
 modal.addEventListener('keydown', function (e) {
 if (e.key !== 'Tab') return;
 var f = [].slice.call(modal.querySelectorAll(
 'button, [href], [tabindex]:not([tabindex="-1"])'))
 .filter(function (el) { return el.offsetParent !== null; });
 if (!f.length) return;
 var premier = f[0], dernier = f[f.length - 1];
 if (e.shiftKey && document.activeElement === premier) { e.preventDefault(); dernier.focus(); }
 else if (!e.shiftKey && document.activeElement === dernier) { e.preventDefault(); premier.focus(); }
 });
})();
