/* ================================================================
 DIGISTYLZE · SHELL JS PARTAGÉ
 Source unique des comportements mutualisés : préloader,
 transition de page, méga-menu, fill-curseur, marquees,
 reveal global, count-up, formulaires, widget flottant.

 Chargé par les 34 pages via
 <script defer src="assets/js/site.js"></script>
 Chaque IIFE est gardée : elle ne fait rien si son point
 d'ancrage est absent de la page.
 ================================================================ */

/* VERROU DE DÉFILEMENT, partagé par le tiroir de nav et la modale devis.

 Doit être unique : si le tiroir verrouillait en position:fixed et la modale
 en overflow:hidden, ouvrir la modale DEPUIS le tiroir (son pied porte le CTA
 « Audit gratuit ») poserait deux verrous concurrents et perdrait la position
 de défilement à la fermeture. Le compteur gère l'imbrication. */
window.DTZ = window.DTZ || {};
(function (D) {
 var depth = 0, y = 0;
 D.lock = function () {
 if (depth++ > 0) return;
 y = window.scrollY;
 document.body.style.top = -y + 'px';
 document.body.classList.add('is-locked');
 };
 D.unlock = function () {
 if (depth === 0 || --depth > 0) return;
 document.body.classList.remove('is-locked');
 document.body.style.top = '';
 /* `behavior:'instant'` : le scroll-behavior:smooth global ferait GLISSER
 la page depuis le haut vers sa position à chaque fermeture. */
 window.scrollTo({ top: y, left: 0, behavior: 'instant' });
 };
})(window.DTZ);

/* PRELOADER · 1re visite de la session uniquement */
(() => {
 var ld = document.getElementById('loader');
 if (!ld) return;
 var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
 var seen = false;
 try { seen = sessionStorage.getItem('dtz-loaded') === '1'; } catch (e) {}
 if (seen || reduce) { ld.remove(); return; }
 ld.classList.add('is-on');
 setTimeout(function () {
 ld.classList.remove('is-on');
 try { sessionStorage.setItem('dtz-loaded', '1'); } catch (e) {}
 setTimeout(function () { ld.remove(); }, 400);
 }, 700);
})();

/* TRANSITION DE PAGE, fade out au départ */
(() => {
 if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
 document.addEventListener('click', function (e) {
 var a = e.target.closest('a[href]');
 if (!a) return;
 var href = a.getAttribute('href');
 if (!href || href.charAt(0) === '#' || a.target === '_blank' ||
 /^(https?:|mailto:|tel:)/.test(href)) return;
 e.preventDefault();
 document.body.classList.add('is-leaving');
 setTimeout(function () { location.href = href; }, 220);
 });
})();

/* NAVIGATION, méga-menu (pilule + panneau morph) + état actif */
(() => {
 "use strict";
 /* Page courante déduite de l'URL : plus de constante à maintenir par page. */
 var CURRENT = (location.pathname.split('/').pop() || 'index.html');
 var ICONS = {
 site:'<rect width="20" height="14" x="2" y="3" rx="2"/><path d="M8 21h8M12 17v4"/>',
 brand:'<circle cx="13.5" cy="6.5" r=".5" fill="currentColor"/><circle cx="17.5" cy="10.5" r=".5" fill="currentColor"/><circle cx="8.5" cy="7.5" r=".5" fill="currentColor"/><circle cx="6.5" cy="12.5" r=".5" fill="currentColor"/><path d="M12 2C6.5 2 2 6.5 2 12s4.5 10 10 10c.93 0 1.65-.75 1.65-1.69 0-.44-.18-.83-.44-1.12-.29-.29-.44-.65-.44-1.13a1.64 1.64 0 0 1 1.67-1.67h2c3.05 0 5.56-2.5 5.56-5.55C22 6.01 17.46 2 12 2Z"/>',
 seo:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
 social:'<path d="M17 6.1H3M21 12.1H3M15.1 18H3"/>',
 ads:'<path d="m3 11 18-5v12L3 14v-3z"/><path d="M11.6 16.8a3 3 0 1 1-5.8-1.6"/>',
 saas:'<rect width="16" height="16" x="4" y="4" rx="2"/><rect width="6" height="6" x="9" y="9" rx="1"/><path d="M15 2v2M15 20v2M2 15h2M2 9h2M20 15h2M20 9h2M9 2v2M9 20v2"/>',
 g:'<circle cx="11" cy="11" r="8"/><path d="m21 21-4.3-4.3"/>',
 meta:'<path d="M17 6.1H3M21 12.1H3M15.1 18H3"/>',
 li:'<rect width="18" height="18" x="3" y="3" rx="2"/><path d="M8 11v5M8 8v.01M12 16v-5M16 16v-3a2 2 0 0 0-4 0"/>',
 tt:'<path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5"/>'
 };
 function svg(name, tone) {
 return '<span class="mm__ico' + (tone ? ' ' + tone : '') + '"><svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.8" stroke-linecap="round" stroke-linejoin="round">' + (ICONS[name] || '') + '</svg></span>';
 }
 var NAV = [
 { label: "Services", sub: [
 { title: "Création & marque", items: [
 { label: "Site web", desc: "Sites qui convertissent", icon: "site", tone: "t-coral", href: "creation-site-web.html" },
 { label: "Branding", desc: "Identité & brandbook", icon: "brand", tone: "t-violet", href: "branding.html" },
 { label: "SaaS & Applications", desc: "Outils sur mesure", icon: "saas", tone: "t-sky", href: "saas-applications.html" }
 ]},
 { title: "Visibilité", items: [
 { label: "SEO & GEO", desc: "Trouvé sur Google et les IA", icon: "seo", tone: "t-mint", href: "agence-seo.html" },
 { label: "Community management", desc: "Vos réseaux, gérés", icon: "social", tone: "t-sunset", href: "community-management.html" }
 ]},
 { title: "Publicité", items: [
 { label: "Publicité en ligne", desc: "Vue d'ensemble", icon: "ads", tone: "t-sunshine", href: "publicite-en-ligne.html" },
 { label: "Google Ads", desc: "Capter la demande", icon: "g", href: "agence-google-ads.html" },
 { label: "Meta Ads", desc: "Facebook & Instagram", icon: "meta", href: "agence-meta-ads.html" },
 { label: "LinkedIn Ads", desc: "Décideurs B2B", icon: "li", href: "agence-linkedin-ads.html" },
 { label: "TikTok Ads", desc: "Nouvelle génération", icon: "tt", href: "agence-tiktok-ads.html" }
 ]}
 ]},
 { label: "Réalisations", link: "realisations.html" },
 { label: "Agence", link: "agence.html" },
 { label: "Tarifs", link: "tarifs.html" }
 // « Ressources » retiré le 2026-08-05 : la page est masquée tant qu'elle
 // n'a pas d'articles publiés. Le fichier ressources.html reste sur le
 // disque en noindex, remettre cette entrée suffit à la republier.
 ];
 var chev = '<svg class="chev" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="m6 9 6 6 6-6"/></svg>';
 function buildPanelHTML(item) {
 var h = '';
 item.sub.forEach(function (col) {
 h += '<div class="mm__col"><h3>' + col.title + '</h3><ul>';
 col.items.forEach(function (it) {
 var cur = it.href === CURRENT;
 h += '<li><a class="mm__link' + (cur ? ' is-active" aria-current="page' : '') + '" href="' + it.href + '">' +
 svg(it.icon, it.tone) +
 '<span class="mm__txt"><b>' + it.label + '</b>' +
 '<span>' + it.desc + '</span></span></a></li>';
 });
 h += '</ul></div>';
 });
 /* La vitrine, seulement sous le header v2 (les pages géo gardent
 le panneau historique). Un panneau d'encre à droite des colonnes :
 l'entrée en matière, l'appel découverte, la preuve Google. Tous
 les chiffres sont ceux déjà publiés (figures-validees.md). */
 if (document.querySelector('.header--v2')) {
 var etoile = '<svg viewBox="0 0 24 24"><path d="M12 .587l3.668 7.568L24 9.748l-6 5.847 1.42 8.265L12 19.771l-7.42 4.089L6 15.595 0 9.748l8.332-1.593z"/></svg>';
 h += '<aside class="mm__vitrine">' +
 '<span class="mm__vitrine-sur">Par où commencer</span>' +
 '<b>Un appel de 30 minutes, un avis honnête.</b>' +
 '<p>On écoute votre projet et on vous dit franchement si on peut vous aider, plan d\'action chiffré à la clé.</p>' +
 '<a class="mm__vitrine-cta" href="/contact/" data-conversion="lead-cta-megamenu">' +
 'Réserver un appel découverte' +
 '<svg viewBox="0 0 24 24"><path d="M5 12h14M13 6l6 6-6 6"/></svg></a>' +
 '<span class="mm__vitrine-preuve">' + etoile + '4,9/5 sur Google · 64 avis</span>' +
 '</aside>';
 }
 return h;
 }
 function hasCurrent(item) {
 if (!item.sub) return false;
 return item.sub.some(function (col) {
 return col.items.some(function (it) { return it.href === CURRENT; });
 });
 }
 var ul = document.getElementById('mm');
 if (!ul) return;
 var pill = document.createElement('div'); pill.className = 'mm__pill';
 var panel = document.createElement('div'); panel.className = 'mm__panel';
 var inner = document.createElement('div'); inner.className = 'mm__inner';
 var measure = document.createElement('div'); measure.className = 'mm__measure';
 panel.appendChild(inner);
 var mediaMobile = matchMedia('(max-width:860px)');
 var buttons = [];
 var activeBtn = null;
 NAV.forEach(function (item) {
 var li = document.createElement('li'); li.className = 'mm__item';
 if (item.link) {
 var a = document.createElement('a');
 a.className = 'mm__btn'; a.href = item.link;
 a.innerHTML = '<span>' + item.label + '</span>';
 if (item.link === CURRENT) {
 a.classList.add('is-active');
 a.setAttribute('aria-current', 'page');
 activeBtn = a;
 }
 li.appendChild(a); ul.appendChild(li); buttons.push(a);
 } else {
 var b = document.createElement('button');
 b.type = 'button'; b.className = 'mm__btn';
 b.setAttribute('aria-haspopup', 'true');
 b.setAttribute('aria-expanded', 'false');
 b.innerHTML = '<span>' + item.label + '</span>' + chev;
 b._item = item;
 if (hasCurrent(item)) { b.classList.add('is-active'); activeBtn = b; }
 /* Plus de repli mobile ici : sous 860px le .mm est display:none et ces
 boutons sont inatteignables. L'ancien gestionnaire renvoyait vers
 #services, une ancre qui n'existe que sur 4 des 34 pages. */
 li.appendChild(b); ul.appendChild(li); buttons.push(b);
 }
 });
 ul.appendChild(pill); ul.appendChild(panel); ul.appendChild(measure);
 buildMobileNav();
 var openItem = null;

 /* ---------------------------------------------------------------
 TIROIR MOBILE
 Construit depuis le même NAV que le méga-menu, avec les mêmes
 chips d'icônes : aucune des 34 pages n'a de markup de nav, le
 <ul id="mm"> y est vide. Zéro édition HTML.
 --------------------------------------------------------------- */
 function buildMobileNav() {
 var actions = document.querySelector('.header__inner .actions');
 if (!actions || document.querySelector('.nav-burger')) return;

 var burger = document.createElement('button');
 burger.type = 'button';
 burger.className = 'nav-burger';
 burger.setAttribute('aria-label', 'Ouvrir le menu');
 burger.setAttribute('aria-expanded', 'false');
 burger.setAttribute('aria-controls', 'navDrawer');
 burger.innerHTML = '<span></span><span></span><span></span>';
 actions.insertBefore(burger, actions.firstChild);

 var i = 0; // index global pour la cascade
 function linkHTML(href, label, desc, icon, tone) {
 var cur = href === CURRENT;
 return '<a class="nav-drawer__link' + (cur ? ' is-active' : '') + '"' +
 (cur ? ' aria-current="page"' : '') +
 ' href="' + href + '" style="--i:' + (i++) + '">' +
 (icon ? svg(icon, tone) : '') +
 '<span><b>' + label + '</b>' +
 (desc ? '<span>' + desc + '</span>' : '') + '</span></a>';
 }

 var body = '';
 NAV.forEach(function (item) {
 if (item.link) {
 body += '<div class="nav-drawer__group">' +
 linkHTML(item.link, item.label, '', null, null) + '</div>';
 return;
 }
 item.sub.forEach(function (col) {
 body += '<div class="nav-drawer__group"><h3 style="--i:' + (i++) + '">' +
 col.title + '</h3>';
 col.items.forEach(function (it) {
 body += linkHTML(it.href, it.label, it.desc, it.icon, it.tone);
 });
 body += '</div>';
 });
 body += '<div class="nav-drawer__sep"></div>';
 });

 var drawer = document.createElement('div');
 drawer.className = 'nav-drawer';
 drawer.id = 'navDrawer';
 drawer.innerHTML =
 '<div class="nav-drawer__scrim" data-close-drawer></div>' +
 '<div class="nav-drawer__panel" role="dialog" aria-modal="true" ' +
 'aria-label="Navigation principale">' +
 '<div class="nav-drawer__head">' +
 '<img src="assets/img/logo/logo-mono.svg" alt="Digistylze" width="132" height="22">' +
 '<button type="button" class="nav-drawer__close" data-close-drawer ' +
 'aria-label="Fermer le menu">' +
 '<svg viewBox="0 0 24 24"><path d="M18 6 6 18M6 6l12 12"/></svg>' +
 '</button>' +
 '</div>' +
 '<div class="nav-drawer__body">' + body + '</div>' +
 '<div class="nav-drawer__foot">' +
 '<a href="/contact/" class="btn-pill" data-conversion="lead-cta-drawer">Audit gratuit</a>' +
 '<span class="nav-drawer__tel">' +
 '<a href="tel:+41225068276">+41 22 506 82 76</a>' +
 '<a href="mailto:agence@digistylze.ch">agence@digistylze.ch</a>' +
 '</span>' +
 '</div>' +
 '</div>';
 document.body.appendChild(drawer);

 var panelEl = drawer.querySelector('.nav-drawer__panel');
 var isOpen = false;

 function focusables() {
 return [].slice.call(panelEl.querySelectorAll('a[href],button:not([disabled])'));
 }
 var lockTimer = 0;
 function openDrawer() {
 if (isOpen) return;
 isOpen = true;
 /* Deux temps : rendre visible panneau hors écran, committer la frame
 (lecture d'offsetWidth), et glisser seulement à la frame suivante.
 Sans cela, iOS pouvait peindre le panneau avant sa transformation, il traversait l'écran depuis la gauche à la première ouverture. */
 drawer.classList.add('is-visible');
 document.documentElement.classList.add('nav-ouverte');
 void panelEl.offsetWidth;
 requestAnimationFrame(function () { drawer.classList.add('is-open'); });
 burger.setAttribute('aria-expanded', 'true');
 burger.setAttribute('aria-label', 'Fermer le menu');
 /* Le verrou du défilement attend la fin de la glissière : basculer le
 body en position:fixed au même instant que la première peinture du
 tiroir provoquait sur iOS un repaint global qui affichait le panneau
 une demi-seconde au mauvais endroit avant qu'il se cale à droite.
 À 420 ms, le panneau est posé et opaque : le repaint passe dessous. */
 clearTimeout(lockTimer);
 lockTimer = setTimeout(window.DTZ.lock, 420);
 /* Le reste de la page est retiré de l'ordre de tabulation. `inert` fait
 cela proprement ; aria-hidden couvre les navigateurs qui ne l'ont pas. */
 ['main', 'footer', '.header__inner > .logo', '.header__inner nav']
 .forEach(function (sel) {
 [].forEach.call(document.querySelectorAll(sel), function (el) {
 el.inert = true; el.setAttribute('aria-hidden', 'true');
 });
 });
 setTimeout(function () { drawer.querySelector('.nav-drawer__close').focus(); }, 60);
 }
 function closeDrawer(refocus) {
 if (!isOpen) return;
 isOpen = false;
 drawer.classList.remove('is-open');
 /* la visibilité tombe après la glissière de sortie */
 setTimeout(function () {
 if (!isOpen) {
 drawer.classList.remove('is-visible');
 document.documentElement.classList.remove('nav-ouverte');
 }
 }, 420);
 burger.setAttribute('aria-expanded', 'false');
 burger.setAttribute('aria-label', 'Ouvrir le menu');
 /* Si la fermeture précède le verrou différé, on annule ce dernier ;
 unlock() sur un verrou jamais posé est sans effet (compteur à zéro). */
 clearTimeout(lockTimer);
 window.DTZ.unlock();
 ['main', 'footer', '.header__inner > .logo', '.header__inner nav']
 .forEach(function (sel) {
 [].forEach.call(document.querySelectorAll(sel), function (el) {
 el.inert = false; el.removeAttribute('aria-hidden');
 });
 });
 if (refocus !== false) burger.focus();
 }
 drawer._close = closeDrawer;
 drawer._isOpen = function () { return isOpen; };

 burger.addEventListener('click', function () {
 isOpen ? closeDrawer() : openDrawer();
 });
 [].forEach.call(drawer.querySelectorAll('[data-close-drawer]'), function (el) {
 el.addEventListener('click', function () { closeDrawer(); });
 });
 /* La transition de page intercepte le clic et attend 220 ms avant de
 naviguer : sans cette fermeture immédiate, le tiroir reste affiché
 pendant le fondu et réapparaît en flash sur la page suivante. */
 [].forEach.call(drawer.querySelectorAll('.nav-drawer__link, .nav-drawer__foot a'),
 function (a) { a.addEventListener('click', function () { closeDrawer(false); }); });

 panelEl.addEventListener('keydown', function (e) {
 if (e.key !== 'Tab') return;
 var f = focusables();
 if (!f.length) return;
 var first = f[0], last = f[f.length - 1];
 if (e.shiftKey && document.activeElement === first) { e.preventDefault(); last.focus(); }
 else if (!e.shiftKey && document.activeElement === last) { e.preventDefault(); first.focus(); }
 });
 }
 var REDUCE = matchMedia('(prefers-reduced-motion:reduce)').matches;
 function staggerReveal(container) {
 if (REDUCE) return;
 var d = 30;
 [].forEach.call(container.querySelectorAll('.mm__col'), function (col) {
 var els = [col.querySelector('h3')];
 [].push.apply(els, col.querySelectorAll('.mm__link'));
 els.forEach(function (el) {
 if (!el || typeof el.animate !== 'function') return;
 el.animate(
 [{ opacity: 0, transform: 'translateY(16px)' },
 { opacity: 1, transform: 'translateY(0)' }],
 { duration: 520, delay: d, easing: 'cubic-bezier(.16,1,.3,1)', fill: 'backwards' }
 );
 d += 40;
 });
 d += 25;
 });
 }
 function movePill(btn) {
 pill.style.transform = 'translate(' + btn.offsetLeft + 'px,' + btn.offsetTop + 'px)';
 pill.style.width = btn.offsetWidth + 'px';
 pill.style.height = btn.offsetHeight + 'px';
 pill.classList.add('show');
 }
 function openPanel(btn) {
 annuleFermeture();
 var item = btn._item;
 var M = 16; // marge minimale au bord
 var VW = document.documentElement.clientWidth;
 var maxW = Math.min(VW - 2 * M, 1100);

 /* La largeur est bornée AVANT la mesure, pour que le panneau se réorganise
 plutôt que de déborder. L'ancien code ne bornait que `left`, et le
 comparait à ul.clientWidth (~400px) alors que le panneau en fait ~770 :
 maxLeft valait donc toujours 0 et le panneau partait du bord du <ul>
 pour finir hors écran entre 861 et 1105px. */
 measure.style.maxWidth = maxW + 'px';
 measure.innerHTML = buildPanelHTML(item);
 var w = Math.min(measure.offsetWidth, maxW), h = measure.offsetHeight;
 inner.style.maxWidth = maxW + 'px';
 inner.innerHTML = buildPanelHTML(item);
 staggerReveal(inner);

 /* `left` est borné contre le VIEWPORT, pas contre le <ul>. */
 var ulLeft = ul.getBoundingClientRect().left;
 var left = btn.offsetLeft;
 if (ulLeft + left + w > VW - M) left = VW - M - w - ulLeft;
 if (ulLeft + left < M) left = M - ulLeft;
 panel.style.left = left + 'px';
 panel.style.width = w + 'px';
 panel.style.height = h + 'px';
 panel.classList.add('open');
 btn.classList.add('is-open');
 btn.setAttribute('aria-expanded', 'true');
 openItem = btn;
 }
 function closePanel() {
 annuleFermeture();
 panel.classList.remove('open');
 if (openItem) {
 openItem.classList.remove('is-open');
 openItem.setAttribute('aria-expanded', 'false');
 openItem = null;
 }
 }

 /* ------------------------------------------------------------------
 INTENTION DE SURVOL, signalé par Bastien le 2026-08-05 :
 « c'est une galère pour aller dans le menu services, il disparaît si
 on n'est pas assez rapide ».

 Deux causes, pas une :

 1. Le panneau est posé à `top:calc(100% + .6rem)` du <ul>. Ces 9,6px
 de vide n'appartiennent ni à la barre ni au panneau. En les
 traversant, le curseur n'est nulle part, `mouseleave` part sur le
 <ul> et le panneau se ferme sous le doigt.
 2. La fermeture était immédiate. Le moindre écart de trajectoire, le
 moindre passage par le bord, et tout se referme.

 On ne comble pas le vide : `.mm__panel` porte `overflow:hidden`, un
 pseudo-élément de pontage y serait rogné, et l'élargir changerait la
 géométrie du panneau. On donne du temps, ce qui règle aussi la
 diagonale, le trajet oblique du bouton vers une colonne éloignée,
 qui sort de la barre bien avant d'entrer dans le panneau.

 220 ms : au-dessus, un menu qu'on quitte volontairement semble
 collant ; en dessous, on retombe dans le défaut. La fermeture
 délibérée · Escape, clic, changement de palier, reste immédiate,
 elle passe par closePanel() qui annule le minuteur.
 ------------------------------------------------------------------ */
 var minuteurFermeture = null;
 function annuleFermeture() {
 if (minuteurFermeture) { clearTimeout(minuteurFermeture); minuteurFermeture = null; }
 }
 function fermeApresDelai() {
 annuleFermeture();
 minuteurFermeture = setTimeout(function () {
 minuteurFermeture = null;
 pill.classList.remove('show');
 buttons.forEach(function (b) { b.classList.remove('is-active'); });
 if (activeBtn) activeBtn.classList.add('is-active');
 closePanel();
 }, 220);
 }
 buttons.forEach(function (btn) {
 btn.addEventListener('mouseenter', function () {
 if (mediaMobile.matches) return;
 movePill(btn);
 buttons.forEach(function (b) { b.classList.remove('is-active'); });
 btn.classList.add('is-active');
 if (btn._item) openPanel(btn); else if (openItem) closePanel();
 });
 btn.addEventListener('focus', function () {
 if (mediaMobile.matches) return;
 movePill(btn);
 if (btn._item) openPanel(btn); else if (openItem) closePanel();
 });
 });
 /* Le panneau est un descendant du <ul>, donc le survoler ne déclenche pas
 `mouseleave`, sauf pendant la traversée du vide de .6rem, où le curseur
 n'est sur ni l'un ni l'autre. C'est ce trajet-là que le délai couvre. */
 ul.addEventListener('mouseleave', fermeApresDelai);
 ul.addEventListener('mouseenter', annuleFermeture);
 /* Ceinture et bretelles : si le curseur atteint le panneau, on est certain
 que l'intention est d'y aller, quelle que soit la trajectoire suivie. */
 panel.addEventListener('mouseenter', annuleFermeture);
 document.addEventListener('keydown', function (e) {
 if (e.key !== 'Escape') return;
 /* Le tiroir gagne : s'il est ouvert, Escape le ferme et ne touche pas au
 panneau desktop, qui est de toute façon masqué à cette largeur. */
 var drawer = document.getElementById('navDrawer');
 if (drawer && drawer._isOpen && drawer._isOpen()) { drawer._close(); return; }
 pill.classList.remove('show');
 closePanel();
 });

 /* Rien ne réagissait au redimensionnement : faire pivoter une tablette
 laissait le panneau desktop ouvert et orphelin, ou le tiroir ouvert
 au-dessus d'une nav redevenue horizontale. */
 mediaMobile.addEventListener('change', function () {
 var drawer = document.getElementById('navDrawer');
 if (drawer && drawer._isOpen && drawer._isOpen()) drawer._close(false);
 pill.classList.remove('show');
 closePanel();
 });
})();

/* FILL-CURSEUR, tous les boutons à disque d'encre (§74 de
 premium.css). Le JS ne fait que POSER le point de départ du
 disque ; l'effet lui-même est CSS et part du centre sans nous.
 Les pages géo portent certaines de ces classes sans le §74 : y
 écrire --x/--y est sans effet, aucune n'est modifiée. */
(() => {
 if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
 if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;
 var CIBLES = '.btn-pill, .actions .cta, .btn-ghost, .roue-pas__aller,' +
 '.fw-form__btn, .cta-form .form__btn, .nform .form__btn, .sitx__cta';
 [].forEach.call(document.querySelectorAll(CIBLES), function (btn) {
 function move(e) {
 var r = btn.getBoundingClientRect();
 btn.style.setProperty('--x', (e.clientX - r.left) + 'px');
 btn.style.setProperty('--y', (e.clientY - r.top) + 'px');
 }
 btn.addEventListener('mouseenter', move);
 btn.addEventListener('mousemove', move);
 });
})();

/* MARQUEES, duplication des pistes (hero mockups + logos) */
(() => {
 ['shotsA', 'shotsB', 'trustTrack'].forEach(function (id) {
 var t = document.getElementById(id);
 if (!t) return;
 /* La piste jumelle est le FRÈRE suivant, pas le premier descendant portant
 aria-hidden : `.shot__bar` (la fausse barre de navigateur des mockups)
 porte elle aussi cet attribut, et un querySelector sur le parent la
 trouvait en premier. Les six cartes étaient donc injectées DANS la barre
 du premier mockup, qui gonflait à 268px et poussait toutes les cartes du
 bandeau à 493px de haut avec une grande zone vide sous chaque image. */
 var clone = t.nextElementSibling;
 if (clone && clone.getAttribute('aria-hidden') === 'true') {
 clone.innerHTML = t.innerHTML;
 }
 });

 /* BOUCLE SANS COUTURE, [data-boucle]
 Une piste de marquee doit contenir DEUX fois son contenu : fx.js §5
 l'anime de xPercent 0 à -50, et -50 % ne revient au point de départ
 que si la seconde moitié répète la première.

 Cette seconde moitié était écrite À LA MAIN dans le HTML. Sur le seul
 bandeau d'avis Google, cela faisait huit cartes dupliquées à l'octet
 près, sur neuf pages : le bloc pesait 34 Ko par page, 313 Ko au total,
 dont la moitié n'était que sa propre copie, marquée `aria-hidden`,
 donc invisible aux lecteurs d'écran et sans aucune valeur de contenu.

 Elle est désormais produite ici. site.js s'exécutant AVANT fx.js, la
 piste est déjà doublée quand la couche FX la mesure : le -50 % reste
 exact. Sans JS, la piste ne contient qu'un jeu, le marquee CSS de
 repli défile alors sur un seul tour, ce qui est moins joli mais
 parfaitement lisible, et les huit avis sont tous là. */
 [].forEach.call(document.querySelectorAll('[data-boucle]'), function (piste) {
 var frag = document.createDocumentFragment();
 [].forEach.call(piste.children, function (n) {
 var c = n.cloneNode(true);
 c.setAttribute('aria-hidden', 'true');
 frag.appendChild(c);
 });
 piste.appendChild(frag);
 });
})();

/* TRUST, bouton Pause / Lecture */
(() => {
 var btn = document.getElementById('trustPause');
 var mq = document.getElementById('trustMarquee');
 if (!btn || !mq) return;
 btn.addEventListener('click', function () {
 var paused = mq.classList.toggle('is-paused');
 btn.setAttribute('aria-pressed', paused ? 'true' : 'false');
 btn.querySelector('[data-label]').textContent = paused ? 'Lecture' : 'Pause';
 });
})();

/* POURQUOI NOUS, halo qui suit le curseur */
(() => {
 if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
 [].forEach.call(document.querySelectorAll('.why-card'), function (el) {
 el.addEventListener('mousemove', function (e) {
 var r = el.getBoundingClientRect();
 el.style.setProperty('--mouse-x', (e.clientX - r.left) + 'px');
 el.style.setProperty('--mouse-y', (e.clientY - r.top) + 'px');
 });
 });
 [].forEach.call(document.querySelectorAll('.how-step'), function (el) {
 el.addEventListener('mousemove', function (e) {
 var r = el.getBoundingClientRect();
 el.style.setProperty('--mx', (((e.clientX - r.left) / r.width) * 100).toFixed(1) + '%');
 el.style.setProperty('--my', (((e.clientY - r.top) / r.height) * 100).toFixed(1) + '%');
 });
 });
})();

/* MÉTHODE, la bande d'encre (réf. unitedcarriers.com/careers).
 Le JS ne fait que POSER le clip-path de la bande du rang survolé
 sur le calque sombre ; c'est la transition CSS de §72 qui anime.
 Les rangs ayant des hauteurs différentes, la bande se calcule sur
 les offsets réels, la réf en t/N supposait des rangs égaux.
 Sortie par le haut : la bande se referme vers 0 ; par le bas :
 vers 100 ; latérale : elle reste (comportement relevé). */
(() => {
 if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
 var pile = document.querySelector('[data-mth]');
 if (!pile) return;
 var nuit = pile.querySelector('.mth__calque--nuit');
 var rangs = [].slice.call(pile.querySelectorAll('.mth__calque--jour .mth-rang'));
 if (!nuit || !rangs.length) return;
 function bande(haut, bas) {
 nuit.style.clipPath = 'polygon(0 ' + haut + '%,100% ' + haut + '%,100% ' + bas + '%,0 ' + bas + '%)';
 }
 rangs.forEach(function (rang, i) {
 rang.addEventListener('pointerenter', function () {
 /* Rects, pas offsetTop : l'offsetParent des rangs n'est pas le
 calque. Les deux calques étant superposés au pixel, le rect
 du rang clair se lit dans le repère du calque sombre. */
 var cadre = nuit.getBoundingClientRect();
 if (!cadre.height) return; /* calque coupé (≤860) : rien à poser */
 var r = rang.getBoundingClientRect();
 var haut = ((r.top - cadre.top) / cadre.height) * 100;
 var bas = ((r.bottom - cadre.top) / cadre.height) * 100;
 bande(haut.toFixed(3), bas.toFixed(3));
 });
 rang.addEventListener('pointerleave', function () {
 if (pile.matches(':hover')) return;
 if (i === 0) bande(0, 0);
 else if (i === rangs.length - 1) bande(100, 100);
 });
 });
})();


/* REVEAL GLOBAL · IntersectionObserver */
(() => {
 var els = [].slice.call(document.querySelectorAll('.wf-rev, .wf-rev-row'));
 var nums = document.querySelector('.how-nums');
 var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
 if (reduce || !('IntersectionObserver' in window)) {
 els.forEach(function (el) { el.classList.add('is-in'); });
 if (nums) nums.classList.add('is-in');
 return;
 }
 var io = new IntersectionObserver(function (entries, obs) {
 entries.forEach(function (e) {
 if (e.isIntersecting) { e.target.classList.add('is-in'); obs.unobserve(e.target); }
 });
 }, { threshold: .12 });
 els.forEach(function (el) { io.observe(el); });
 if (nums) io.observe(nums);
})();

/* COUNT-UP, stats */
(() => {
 var nums = [].slice.call(document.querySelectorAll('[data-count]'));
 var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;
 if (reduce || !('IntersectionObserver' in window) || !nums.length) return;
 /* Séparateur de milliers suisse : l'apostrophe (7'800), comme dans toute
 la copy du site. Déterministe, contrairement à toLocaleString('fr-CH')
 dont le séparateur varie selon la version d'ICU du navigateur. */
 function swiss(val) {
 return String(val).replace(/\B(?=(\d{3})+(?!\d))/g, "'");
 }
 function fmt(el, val) {
 var pre = el.getAttribute('data-prefix') || '';
 var suf = el.getAttribute('data-suffix') || '';
 return pre + swiss(val) + suf;
 }
 function run(el) {
 var to = parseFloat(el.getAttribute('data-to')), t0 = null, dur = 1400;
 function step(ts) {
 if (t0 === null) t0 = ts;
 var p = Math.min((ts - t0) / dur, 1);
 var e = 1 - Math.pow(1 - p, 3);
 el.textContent = fmt(el, Math.round(to * e));
 if (p < 1) requestAnimationFrame(step);
 }
 el.textContent = fmt(el, 0);
 requestAnimationFrame(step);
 }
 var io = new IntersectionObserver(function (entries) {
 entries.forEach(function (en) {
 if (en.isIntersecting) { run(en.target); io.unobserve(en.target); }
 });
 }, { threshold: .6 });
 nums.forEach(function (el) { io.observe(el); });
})();

/* FORMULAIRES, envoi (front) + honeypot */
(() => {
 function wire(formId) {
 var form = document.getElementById(formId);
 if (!form) return;
 form.addEventListener('submit', function (e) {
 e.preventDefault();
 var hp = form.querySelector('[name="website"]');
 if (hp && hp.value) return;
 if (!form.checkValidity()) { form.reportValidity(); return; }
 /* BACKEND, remplacer par un fetch() vers votre endpoint */
 form.classList.add('is-sent');
 if (form.id === 'auditForm') {
 var sec = form.closest('.audit');
 if (sec) sec.classList.add('is-sent');
 }
 });
 }
 wire('leadForm');
 wire('devisForm');
 wire('auditForm');
})();

/* WIDGET FLOTTANT, visibilité + modale devis */
(() => {
 var widget = document.getElementById('floatWidget');
 if (!widget) return;
 var hero = document.querySelector('.hero');
 var footer = document.querySelector('.ft');
 function update() {
 var y = window.scrollY;
 var pastHero = hero ? (y > hero.offsetHeight * 0.5) : (y > 200);
 var inFooter = footer ? (window.innerHeight + y >= footer.offsetTop + 40) : false;
 widget.classList.toggle('is-visible', pastHero && !inFooter);
 }
 addEventListener('scroll', update, { passive: true });
 addEventListener('resize', update);
 update();

 var modal = document.getElementById('modalDevis');
 var openBtn = document.getElementById('floatDevis');
 if (!modal || !openBtn) return;
 function open() {
 modal.classList.add('is-open');
 window.DTZ.lock();
 var first = modal.querySelector('input, select, textarea');
 if (first) setTimeout(function () { first.focus(); }, 100);
 }
 function close() {
 modal.classList.remove('is-open');
 window.DTZ.unlock();
 openBtn.focus();
 }
 openBtn.addEventListener('click', open);
 [].forEach.call(modal.querySelectorAll('[data-close-modal]'), function (el) {
 el.addEventListener('click', close);
 });
 document.addEventListener('keydown', function (e) {
 if (e.key === 'Escape' && modal.classList.contains('is-open')) close();
 });
})();

/* ============================================================
 COUCHE D'EFFETS DES SECTIONS DE BIBLIOTHÈQUE

 Portée depuis glossaire/couche/motion.js. Un seul
 IntersectionObserver et une seule boucle de défilement pour
 toute la page : au-delà de deux ou trois écouteurs de
 défilement concurrents, c'est le défilement lui-même qui
 devient saccadé.

 Vit ici, et pas dans un fichier à part, pour une raison
 précise : sections.css masque `[data-reveal]` derrière
 `html.wf-js`, drapeau posé dans le <head>. Si l'observer
 vivait dans un second fichier, l'absence de CE fichier
 suffirait à masquer du contenu définitivement. Ici, son
 absence est celle de site.js, cas où les `.wf-rev` sont
 déjà masquées : aucune exposition nouvelle.

 Le compteur du glossaire n'est PAS porté : l'IIFE COUNT-UP
 ci-dessus fait le travail, avec l'apostrophe suisse.
 glossaire_adapt.py convertit data-count="9" en
 data-count data-to="9" à l'intégration.
 ============================================================ */
(() => {
 var reveals = [].slice.call(document.querySelectorAll('[data-reveal]'));
 var paras = [].slice.call(document.querySelectorAll('[data-parallaxe]'));
 var progs = [].slice.call(document.querySelectorAll('[data-progression]'));
 if (!reveals.length && !paras.length && !progs.length) return;
 var reduce = matchMedia('(prefers-reduced-motion:reduce)').matches;

 /* Cascade : l'ordre dans un groupe donne le retard, --i est lu par
 la transition-delay de sections.css. */
 [].forEach.call(document.querySelectorAll('[data-reveal-group]'), function (g) {
 var i = 0;
 [].forEach.call(g.querySelectorAll('[data-reveal]'), function (el) {
 el.style.setProperty('--i', i++);
 });
 });

 /* Mouvement réduit : tout à l'état final, rien n'est masqué, rien ne
 bouge. La progression est posée à 1, la laisser à 0 figerait des
 sections dans leur état de départ, qui est souvent vide. */
 if (reduce || !('IntersectionObserver' in window)) {
 reveals.forEach(function (el) { el.classList.add('is-in'); });
 progs.forEach(function (el) { el.style.setProperty('--progression', '1'); });
 return;
 }

 reveals.forEach(function (el) {
 if (el.hasAttribute('data-reveal-eager')) el.classList.add('is-in');
 });
 var io = new IntersectionObserver(function (entries, obs) {
 entries.forEach(function (e) {
 if (!e.isIntersecting) return;
 aRevele = true;
 clearTimeout(filet);
 e.target.classList.add('is-in');
 obs.unobserve(e.target);
 });
 }, { threshold: .15 });
 reveals.forEach(function (el) {
 if (!el.hasAttribute('data-reveal-eager')) io.observe(el);
 });

 /* Filet de sécurité : si l'observateur n'a rien notifié au bout de quatre
 secondes, on révèle tout.

 Sans lui, le pire scénario de ce site n'est pas une animation ratée,
 c'est une page dont le contenu n'apparaît jamais, sections.css masque
 [data-reveal] dès que html.wf-js est posé, et seule une notification de
 l'observateur le démasque. Un IntersectionObserver qui ne délivre pas
 ses callbacks ne lève aucune erreur : la panne est parfaitement
 silencieuse. Rencontré en vérifiant cette page, dans un navigateur dont
 le rendu était suspendu.

 Quatre secondes : au-delà du temps de chargement d'une page lente, bien
 en deçà du moment où un visiteur conclut que la page est vide. Le
 compteur est annulé dès la première révélation, donc en fonctionnement
 normal il ne s'exécute jamais. */
 var aRevele = false;
 var filet = setTimeout(function () {
 if (aRevele) return;
 reveals.forEach(function (el) { el.classList.add('is-in'); });
 }, 4000);

 /* Parallaxe et progression partagent la boucle, et ne calculent que
 pour les éléments réellement à l'écran. */
 var suivis = paras.concat(progs);
 if (!suivis.length) return;
 var attente = false;

 function boucle() {
 attente = false;
 var vh = window.innerHeight || document.documentElement.clientHeight;
 paras.forEach(function (el) {
 if (!el.__vu) return;
 var r = el.getBoundingClientRect();
 var f = parseFloat(el.getAttribute('data-parallaxe')) || 0;
 /* Écart au CENTRE de la fenêtre : nul quand l'élément est centré,
 ce qui évite le saut d'entrée des parallaxes calées en haut. */
 var ecart = (r.top + r.height / 2 - vh / 2) * f * -1;
 el.style.setProperty(
 el.getAttribute('data-parallaxe-axe') === 'x' ? '--parallaxe-x' : '--parallaxe-y',
 ecart.toFixed(1) + 'px');
 });
 progs.forEach(function (el) {
 if (!el.__vu) return;
 var r = el.getBoundingClientRect();
 var p = (vh - r.top) / (vh + r.height);
 el.style.setProperty('--progression', Math.max(0, Math.min(1, p)).toFixed(4));
 });
 }
 function auDefilement() {
 if (attente) return;
 attente = true;
 requestAnimationFrame(boucle);
 }

 var vue = new IntersectionObserver(function (ents) {
 ents.forEach(function (e) { e.target.__vu = e.isIntersecting; });
 auDefilement();
 }, { rootMargin: '25% 0px' });
 suivis.forEach(function (el) { el.__vu = false; vue.observe(el); });

 addEventListener('scroll', auDefilement, { passive: true });
 addEventListener('resize', auDefilement, { passive: true });
 auDefilement();
})();


/*, heros_hero-studio-clock (glossaire), */
(function () {
 var racine = document.getElementById('dz-hsc');
 if (!racine) return;
 var meta = racine.querySelector('[data-tz]');
 var horloge = racine.querySelector('[data-horloge]');
 if (!meta || !horloge) return;

 var tz = meta.getAttribute('data-tz') || undefined;
 function format(opts) {
 try { opts.timeZone = tz; return new Intl.DateTimeFormat('fr-CH', opts); }
 catch (e) { delete opts.timeZone; return new Intl.DateTimeFormat('fr-CH', opts); }
 }
 var heure = format({ hour: '2-digit', minute: '2-digit', hour12: false });

 /* Le libelle de fuseau vient du meme identifiant IANA que l'horloge. */
 var zone = racine.querySelector('.dz-hsc__fuseau');
 if (zone) {
 try {
 var parts = format({ timeZoneName: 'shortOffset' }).formatToParts(new Date());
 var nom = parts.filter(function (p) { return p.type === 'timeZoneName'; })[0];
 if (nom && nom.value) zone.textContent = nom.value;
 } catch (e) { /* le repli ecrit dans le HTML reste affiche */ }
 }

 /* Pas d'aria-live : une valeur qui change seule ne doit pas interrompre la lecture.
 L'affichage s'arrete a la minute, et le minuteur se cale sur la minute suivante
 plutot que de battre la seconde pour rien. */
 var minuteur = null;
 function tic() {
 var maintenant = new Date();
 var texte = heure.format(maintenant);
 horloge.textContent = texte;
 horloge.setAttribute('datetime', texte);
 minuteur = setTimeout(tic, 60000 - (maintenant.getSeconds() * 1000 + maintenant.getMilliseconds()));
 }
 function arrete() { clearTimeout(minuteur); minuteur = null; }
 document.addEventListener('visibilitychange', function () {
 arrete();
 if (!document.hidden) tic();
 });
 window.addEventListener('pagehide', arrete);
 tic();
})();


/*, dominante-et-satellites (glossaire), */
(function () {
 var s = document.getElementById('dz-dsat');
 if (!s) return;
 var duree = { lente: 2400, normale: 1500, rapide: 800 }[s.getAttribute('data-vitesse')] || 1500;
 var cibles = s.querySelectorAll('[data-mise-en-avant] [data-to]');
 [].forEach.call(cibles, function (el) {
 el.setAttribute('data-count', el.getAttribute('data-to'));
 el.setAttribute('data-count-duration', duree);
 });
 })();


/*, placard-declaration-typo (glossaire), */
(function () {
 var racine = document.getElementById('dz-pla');
 if (!racine) return;

 var lignes = racine.querySelectorAll('.dz-pla__ligne');
 if (!lignes.length) return;
 if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;

 var enAttente = false;

 function joue() {
 var r = racine.getBoundingClientRect();
 var vh = window.innerHeight || document.documentElement.clientHeight;
 if (r.top > vh * 0.85 || r.bottom < 0) return false;
 racine.classList.add('est-entre');
 return true;
 }

 function maj() {
 enAttente = false;
 if (joue()) arrete();
 }

 function auDefilement() {
 if (enAttente) return;
 enAttente = true;
 requestAnimationFrame(maj);
 }

 function arrete() {
 removeEventListener('scroll', auDefilement);
 removeEventListener('resize', auDefilement);
 }

 function arme() {
 arrete();
 racine.classList.remove('est-entre');
 if (racine.getAttribute('data-entree') === 'aucune') {
 racine.classList.remove('est-anime');
 return;
 }
 racine.classList.add('est-anime');
 addEventListener('scroll', auDefilement, { passive: true });
 addEventListener('resize', auDefilement, { passive: true });
 // deux trames : l'etat de depart doit etre peint avant qu'on transite vers l'arrivee
 requestAnimationFrame(function () { requestAnimationFrame(maj); });
 }

 // le glossaire change l'attribut en direct, on rejoue au lieu d'attendre un rechargement
 new MutationObserver(arme).observe(racine, { attributes: true, attributeFilter: ['data-entree'] });

 arme();
 })();

/* ================================================================
 COMPOSANTS 2026-08-07, refonte des retours client
 ================================================================ */

/* PLATEAU VIDÉO v2, l'accordéon de nuit. Au survol la bande joue
 en MUET (l'aperçu, réf. arcads.ai) ; le clic donne le SON, une
 seule source sonore à la fois. À la sortie : pause et silence.
 Hors écran : coupure. Sur tactile (pas de survol), le clic reste
 lecture/pause simple, sonore. */
(function () {
 var plateau = document.querySelector('[data-plt]');
 if (!plateau) return;
 var cartes = [].slice.call(plateau.querySelectorAll('.plt-card'));
 var survolPossible = matchMedia('(hover:hover) and (pointer:fine)').matches;
 function lire(video) {
 /* play() rend une promesse : une pause qui la double (double
 clic, sortie d'écran immédiate) la rejette, on l'avale. */
 var p = video.play();
 if (p && p.catch) p.catch(function () {});
 }
 function couper(carte) {
 var v = carte.querySelector('video');
 if (v) { if (!v.paused) v.pause(); v.muted = true; }
 carte.classList.remove('is-live');
 }
 cartes.forEach(function (carte) {
 var bouton = carte.querySelector('.plt-card__play');
 var video = carte.querySelector('video');
 if (!bouton || !video) return;
 if (survolPossible) {
 carte.addEventListener('pointerenter', function () {
 video.muted = true;
 lire(video);
 });
 carte.addEventListener('pointerleave', function () {
 couper(carte);
 bouton.setAttribute('aria-label',
 bouton.getAttribute('aria-label').replace('Couper le son du', 'Écouter le'));
 });
 }
 bouton.addEventListener('click', function () {
 if (video.muted || video.paused) {
 cartes.forEach(function (a) { if (a !== carte) couper(a); });
 video.muted = false;
 lire(video);
 carte.classList.add('is-live');
 bouton.setAttribute('aria-label',
 bouton.getAttribute('aria-label').replace('Écouter le', 'Couper le son du'));
 } else {
 couper(carte);
 bouton.setAttribute('aria-label',
 bouton.getAttribute('aria-label').replace('Couper le son du', 'Écouter le'));
 }
 });
 });
 if ('IntersectionObserver' in window) {
 var io = new IntersectionObserver(function (entrees) {
 entrees.forEach(function (en) { if (!en.isIntersecting) couper(en.target); });
 }, { threshold: .15 });
 cartes.forEach(function (c) { io.observe(c); });
 }
})();

/* FAQ V2, l'ouverture s'anime en hauteur mesurée.
 Sans ce bloc, <details> bascule d'un coup : fonctionnel, juste sec.
 `.is-closing` permet à l'icône et au cadre de répondre dès le clic,
 sans attendre la fin de la transition (l'attribut open ne tombe
 qu'une fois la hauteur revenue à zéro). */
(function () {
 var items = [].slice.call(document.querySelectorAll('.fq-item'));
 if (!items.length) return;
 if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;

 items.forEach(function (d) {
 var resume = d.querySelector('.fq-item__q');
 var corps = d.querySelector('.fq-item__a');
 if (!resume || !corps) return;
 var enCours = false;

 function termine(fin) {
 var fait = false;
 function solde() {
 if (fait) return;
 fait = true;
 corps.removeEventListener('transitionend', solde);
 fin();
 enCours = false;
 }
 corps.addEventListener('transitionend', solde);
 /* filet : si la transition ne se signale pas (onglet caché), on
 solde quand même, sinon l'accordéon resterait verrouillé */
 setTimeout(solde, 520);
 }

 resume.addEventListener('click', function (e) {
 e.preventDefault();
 if (enCours) return;
 enCours = true;

 if (d.open) {
 d.classList.add('is-closing');
 corps.style.height = corps.scrollHeight + 'px';
 requestAnimationFrame(function () {
 corps.style.transition = 'height .36s cubic-bezier(.16,1,.3,1)';
 corps.style.height = '0px';
 });
 termine(function () {
 corps.style.cssText = '';
 d.open = false;
 d.classList.remove('is-closing');
 });
 } else {
 d.open = true;
 var h = corps.scrollHeight;
 corps.style.height = '0px';
 requestAnimationFrame(function () {
 corps.style.transition = 'height .42s cubic-bezier(.16,1,.3,1)';
 corps.style.height = h + 'px';
 });
 termine(function () { corps.style.cssText = ''; });
 }
 });
 });
})();

/* CARROUSEL, flèches + défilement automatique sur [data-crsl].
 La piste est un scroll-snap natif : les flèches et l'autoplay ne font
 que la déplacer d'une carte, le navigateur gère l'inertie et le doigt.
 L'autoplay se coupe dès que l'utilisateur s'approche (survol, focus,
 toucher), ne tourne que quand la rangée est à l'écran, et jamais en
 mouvement réduit. */
(function () {
 var blocs = [].slice.call(document.querySelectorAll('[data-crsl]'));
 if (!blocs.length) return;
 var reduit = matchMedia('(prefers-reduced-motion:reduce)').matches;

 blocs.forEach(function (bloc) {
 var piste = bloc.querySelector('.crsl__track');
 if (!piste) return;
 var prev = bloc.querySelector('[data-crsl-prev]');
 var next = bloc.querySelector('[data-crsl-next]');

 function pas() {
 var carte = piste.firstElementChild;
 if (!carte) return 0;
 var gap = parseFloat(getComputedStyle(piste).columnGap) || 0;
 return carte.getBoundingClientRect().width + gap;
 }
 function enBout() {
 return piste.scrollLeft + piste.clientWidth >= piste.scrollWidth - 4;
 }
 function avance() {
 if (enBout()) piste.scrollTo({ left: 0, behavior: 'smooth' });
 else piste.scrollBy({ left: pas(), behavior: 'smooth' });
 }
 function recule() {
 if (piste.scrollLeft <= 4) piste.scrollTo({ left: piste.scrollWidth, behavior: 'smooth' });
 else piste.scrollBy({ left: -pas(), behavior: 'smooth' });
 }

 if (next) next.addEventListener('click', avance);
 if (prev) prev.addEventListener('click', recule);

 var auto = parseInt(bloc.getAttribute('data-crsl-auto') || '0', 10);
 if (!auto || reduit) return;
 var minuteur = null, visible = false, suspendu = false;

 function demarre() {
 if (!minuteur && visible && !suspendu) minuteur = setInterval(avance, auto);
 }
 function coupe() { clearInterval(minuteur); minuteur = null; }

 ['pointerenter', 'focusin', 'touchstart'].forEach(function (ev) {
 bloc.addEventListener(ev, function () { suspendu = true; coupe(); }, { passive: true });
 });
 ['pointerleave', 'focusout'].forEach(function (ev) {
 bloc.addEventListener(ev, function () { suspendu = false; demarre(); });
 });
 if ('IntersectionObserver' in window) {
 new IntersectionObserver(function (entrees) {
 visible = entrees[0].isIntersecting;
 if (visible) demarre(); else coupe();
 }, { threshold: .25 }).observe(bloc);
 } else { visible = true; demarre(); }
 document.addEventListener('visibilitychange', function () {
 if (document.hidden) coupe(); else demarre();
 });
 });
})();

/* STACK CARDS, tassement des cartes recouvertes.
 Le collant (sticky) fait l'empilement tout seul ; ici on ajoute le
 léger retrait d'échelle de la carte recouverte et l'encre du grand
 ordinal de la carte de tête. Purement décoratif : coupé en mouvement
 réduit, et sans JS la pile reste une pile. */
(function () {
 var piles = [].slice.call(document.querySelectorAll('[data-stack]'));
 if (!piles.length) return;
 if (matchMedia('(prefers-reduced-motion:reduce)').matches) return;

 piles.forEach(function (pile) {
 var cartes = [].slice.call(pile.querySelectorAll('.stack-card'));
 if (cartes.length < 2) return;
 var attente = false;
 /* le cran vertical entre deux offsets sticky (2.9rem desktop), une constante suffit, l'effet est esthétique, pas géométrique */
 var CRAN = 46;

 function maj() {
 attente = false;
 var cadre = pile.getBoundingClientRect();
 var vh = window.innerHeight || document.documentElement.clientHeight;
 if (cadre.bottom < -80 || cadre.top > vh + 80) return;
 var tete = null;
 cartes.forEach(function (carte, i) {
 var r = carte.getBoundingClientRect();
 var suiv = cartes[i + 1];
 var p = 0;
 if (suiv) {
 var rs = suiv.getBoundingClientRect();
 p = 1 - Math.min(Math.max((rs.top - r.top - CRAN) / Math.max(r.height, 1), 0), 1);
 }
 carte.style.transform = p ? 'scale(' + (1 - p * 0.05).toFixed(4) + ')' : '';
 carte.style.filter = p ? 'brightness(' + (1 - p * 0.07).toFixed(3) + ')' : '';
 if (r.top < vh * 0.55) tete = carte;
 });
 cartes.forEach(function (c) { c.classList.toggle('is-front', c === tete); });
 }
 function auDefilement() {
 if (attente) return;
 attente = true;
 requestAnimationFrame(maj);
 }
 addEventListener('scroll', auDefilement, { passive: true });
 addEventListener('resize', auDefilement, { passive: true });
 maj();
 });
})();


/* HALO SOUS CURSEUR, [data-spot] : la carte note la position du pointeur
 dans --mx/--my, le CSS y accroche son dégradé radial. Pointeurs fins
 seulement, au doigt, il n'y a pas de survol. */
(function () {
 if (!matchMedia('(hover:hover) and (pointer:fine)').matches) return;
 var cartes = [].slice.call(document.querySelectorAll('[data-spot]'));
 cartes.forEach(function (el) {
 el.addEventListener('mousemove', function (e) {
 var r = el.getBoundingClientRect();
 el.style.setProperty('--mx', (e.clientX - r.left) + 'px');
 el.style.setProperty('--my', (e.clientY - r.top) + 'px');
 });
 });
})();


/* ÉTUDES DE CAS EN POP-UP, [data-cas] ouvre le <dialog> du même id
 (section « Nos résultats » de l'accueil). Le natif fait le gros du
 travail : focus piégé, Échap ferme. On y ajoute le clic sur le
 fond assombri (= fermer), et la vidéo du cas qui joue à
 l'ouverture puis se rend en fermant. Sans <dialog> (navigateur
 ancien), les boutons restent muets, les chiffres clés sont déjà
 sur les cartes, rien d'essentiel n'est enfermé dans le pop-up. */
(function () {
 var boutons = [].slice.call(document.querySelectorAll('[data-cas]'));
 if (!boutons.length || typeof HTMLDialogElement === 'undefined') return;
 boutons.forEach(function (b) {
 var d = document.getElementById(b.getAttribute('data-cas'));
 if (!d || !d.showModal) return;
 b.addEventListener('click', function () {
 d.showModal();
 var v = d.querySelector('video');
 if (v) v.play().catch(function () {});
 });
 });
 [].slice.call(document.querySelectorAll('dialog.casx')).forEach(function (d) {
 /* le cadre remplit le dialog : un clic qui atteint le dialog
 lui-même est donc un clic sur le fond */
 d.addEventListener('click', function (e) {
 if (e.target === d) d.close();
 });
 d.addEventListener('close', function () {
 var v = d.querySelector('video');
 if (v) v.pause();
 });
 var x = d.querySelector('[data-cas-close]');
 if (x) x.addEventListener('click', function () { d.close(); });
 });

 /* ÉCHAP, EN PROPRE. Le natif ferme normalement un dialog modal sur
 Escape, mesuré le 2026-08-10 : la touche atteint bien la page,
 mais l'événement `cancel` ne part pas sur tous les moteurs, et le
 pop-up restait ouvert. Ce filet ferme le dialog ouvert quoi qu'il
 arrive ; si le natif a déjà fait le travail, `close()` sur un
 dialog fermé ne fait rien. Pas de preventDefault : on ne prend
 rien aux autres écouteurs d'Échap de la page (tiroir, panneaux). */
 document.addEventListener('keydown', function (e) {
 if (e.key !== 'Escape') return;
 var ouvert = document.querySelector('dialog.casx[open]');
 if (ouvert) ouvert.close();
 });
})();

/* LE RAIL D'ÉTAPES DES ÉTUDES DE CAS, le pop-up raconte le mandat
 en quatre temps (Objectif, Contraintes, Dispositif, Résultat) et
 n'en montre qu'un à la fois. C'est un motif d'onglets, pas un
 accordéon : rôles ARIA `tablist`/`tab`/`tabpanel`, flèches au
 clavier, et un seul onglet dans l'ordre de tabulation.

 SANS JAVASCRIPT, RIEN N'EST PERDU : le HTML sort avec les quatre
 panneaux visibles (seul le premier porte `is-on`, et `hidden` n'est
 posé que par ce moteur). Le pop-up redevient alors la longue page
 qu'il était, lisible, juste moins agréable. */
(function () {
 var etudes = [].slice.call(document.querySelectorAll('.casx--etude'));
 if (!etudes.length) return;

 etudes.forEach(function (d) {
 var onglets = [].slice.call(d.querySelectorAll('[role="tab"]'));
 var vues = [].slice.call(d.querySelectorAll('[role="tabpanel"]'));
 if (!onglets.length || onglets.length !== vues.length) return;

 var prec = d.querySelector('[data-casx-prev]');
 var suiv = d.querySelector('[data-casx-next]');
 var jauge = d.querySelector('[data-casx-jauge]');
 var panneau = d.querySelector('[data-casx-pane]');
 var rail = d.querySelector('.casx__rail');
 /* -1 et non 0 : le HTML sort déjà avec `is-on` sur l'étape 01, et
 le garde-fou « recliquer l'étape ouverte ne fait rien » ferait
 sortir le `aller(0)` d'initialisation avant qu'il ait posé les
 `hidden`, les tabIndex et la jauge. */
 var i = -1;

 /* SOUS 900px, LE RAIL EST UNE PISTE HORIZONTALE et l'étape 04 est
 hors champ. « Suivant » doit donc l'y ramener, sinon le rail
 affiche encore l'étape 01 pendant qu'on lit la 04. On déplace le
 rail À LA MAIN plutôt qu'avec scrollIntoView : celui-ci remonte
 la chaîne des ancêtres et ferait aussi défiler le panneau. */
 function suivreLeRail() {
 if (!rail || rail.scrollWidth <= rail.clientWidth + 1) return;
 var o = onglets[i];
 var vise = o.offsetLeft - (rail.clientWidth - o.offsetWidth) / 2;
 var max = rail.scrollWidth - rail.clientWidth;
 rail.scrollLeft = Math.max(0, Math.min(max, vise));
 }

 /* REJOUER L'ARRIVÉE DE L'ÉTAPE COURANTE. La chorégraphie
 (premium.css) est accrochée à `.is-on` : elle ne se déclenche
 qu'au moment où la classe est POSÉE. À l'ouverture du pop-up,
 l'étape 01 la portait déjà depuis le chargement de la page, son animation s'était donc jouée dans le vide, et le pop-up
 s'ouvrait figé. On retire la classe, on force le recalcul de
 style, on la remet : sans le `offsetWidth`, le navigateur
 regroupe les deux changements et rien ne rejoue. */
 function rejouer() {
 var v = vues[i];
 v.classList.remove('is-on');
 void v.offsetWidth;
 v.classList.add('is-on');
 }

 function aller(n, prendreLeFocus) {
 n = Math.max(0, Math.min(onglets.length - 1, n));
 /* Recliquer l'étape ouverte ne doit rien faire : sinon le
 panneau remonterait en haut sous le doigt du visiteur. */
 if (n === i && vues[n].classList.contains('is-on')) {
 if (prendreLeFocus) onglets[n].focus();
 return;
 }
 i = n;
 onglets.forEach(function (o, k) {
 o.setAttribute('aria-selected', k === i ? 'true' : 'false');
 o.tabIndex = k === i ? 0 : -1;
 });
 vues.forEach(function (v, k) {
 v.classList.toggle('is-on', k === i);
 v.hidden = k !== i;
 });
 if (prec) prec.disabled = i === 0;
 if (suiv) suiv.disabled = i === onglets.length - 1;
 if (jauge) jauge.style.width = ((i + 1) / onglets.length * 100) + '%';
 /* Chaque étape repart du haut : c'est le panneau qui défile, pas
 le cadre, et il garde sinon la position de l'étape précédente. */
 if (panneau) panneau.scrollTop = 0;
 suivreLeRail();
 if (prendreLeFocus) onglets[i].focus();
 }

 onglets.forEach(function (o, k) {
 o.addEventListener('click', function () { aller(k); });
 o.addEventListener('keydown', function (e) {
 var pas = (e.key === 'ArrowDown' || e.key === 'ArrowRight') ? 1
 : (e.key === 'ArrowUp' || e.key === 'ArrowLeft') ? -1
 : (e.key === 'Home') ? -onglets.length
 : (e.key === 'End') ? onglets.length : 0;
 if (!pas) return;
 e.preventDefault();
 aller(k + pas, true);
 });
 });
 if (prec) prec.addEventListener('click', function () { aller(i - 1); });
 if (suiv) suiv.addEventListener('click', function () { aller(i + 1); });

 /* L'appel à l'action pointe une ancre de la page qui est DERRIÈRE
 le pop-up : sans fermeture, le navigateur défile vers un
 formulaire que le visiteur ne voit pas. */
 var cta = d.querySelector('[data-casx-cta]');
 if (cta) cta.addEventListener('click', function () { d.close(); });

 /* LE POP-UP EST UN RÉCIT, PAS UN ÉTAT À RETENIR : il rouvre
 toujours sur l'étape 01.

 On surveille l'attribut `open` plutôt que l'événement `close`.
 Mesuré le 2026-08-11 : `dialog.close()` ne déclenche PAS
 l'événement `close` dans le moteur de prévisualisation, le
 récit rouvrait alors sur la dernière étape lue. L'attribut,
 lui, tombe toujours, quelle que soit la manière dont le pop-up
 se ferme (croix, fond, Échap, `close()`). */
 if (typeof MutationObserver === 'function') {
 new MutationObserver(function () {
 if (d.hasAttribute('open')) rejouer();
 else if (i !== 0) aller(0);
 }).observe(d, { attributes: true, attributeFilter: ['open'] });
 } else {
 d.addEventListener('close', function () { aller(0); });
 }
 aller(0);
 });
})();
