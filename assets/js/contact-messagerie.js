/* ============================================================
   FORMULAIRE-CONVERSATION du bas de page (source unique, 29.08)
   ------------------------------------------------------------
   Le formulaire contact est une fenetre de messagerie : les etapes se
   revelent au fil des reponses (points de frappe entre chaque), la
   barre de saisie porte le message optionnel, l'envoi affiche la bulle
   d'accuse. ENVOI FRONT SEULEMENT, comme partout sur le site.
   ============================================================ */
(function(){
  'use strict';
  var form = document.getElementById('ctForm');
  if (!form || !form.classList.contains('ctm')) return;
  var fil = document.getElementById('ctmFil');
  var stamp = document.getElementById('ctmStamp');
  var envoye = document.getElementById('ctmEnvoye');
  var merci = document.getElementById('ctmMerci');
  var barre = form.querySelector('.ctm-barre');
  var doux = matchMedia('(prefers-reduced-motion: reduce)').matches;
  if (stamp){
    try { stamp.textContent = 'Aujourd\u2019hui \u00b7 ' + new Date().toLocaleTimeString('fr-CH', {hour:'2-digit', minute:'2-digit'}); }
    catch(_){ }
  }
  var etapes = [].slice.call(form.querySelectorAll('.ctm-etape'));
  var frappe = null;

  function prete(n){
    var e = etapes[n];
    if (!e) return false;
    var oblig = [].slice.call(e.querySelectorAll('input[required]'));
    if (oblig.length) return oblig.every(function(i){ return i.value.trim() !== '' && i.checkValidity(); });
    var coches = e.querySelectorAll('input[type="checkbox"]');
    if (coches.length) return [].some.call(coches, function(c){ return c.checked; });
    return true;
  }
  function pointsDeFrappe(){
    var p = document.createElement('div');
    p.className = 'ctm-typing';
    p.innerHTML = '<span></span><span></span><span></span>';
    return p;
  }
  function montre(n){
    if (n >= etapes.length || !etapes[n].hidden || frappe) return;
    if (doux){ etapes[n].hidden = false; return; }
    frappe = pointsDeFrappe();
    fil.insertBefore(frappe, etapes[n]);
    setTimeout(function(){
      if (frappe){ frappe.remove(); frappe = null; }
      etapes[n].hidden = false;
      etapes[n].classList.add('ctm-nee');
      avance();                       /* si l'etape suivante est deja prete */
    }, 750);
  }
  function avance(){
    for (var n = 0; n < etapes.length - 1; n++){
      if (!etapes[n].hidden && etapes[n + 1].hidden && prete(n)){ montre(n + 1); break; }
    }
  }
  form.addEventListener('input', avance);
  form.addEventListener('change', avance);

  form.addEventListener('submit', function(e){
    e.preventDefault();
    var hp = form.querySelector('[name="website"]');
    if (hp && hp.value) return;
    /* tout doit etre visible pour que la validation puisse pointer un champ */
    if (frappe){ frappe.remove(); frappe = null; }
    etapes.forEach(function(et){ et.hidden = false; });
    if (!form.checkValidity()){ if (form.reportValidity) form.reportValidity(); return; }
    var msg = document.getElementById('ct-msg');
    if (msg && msg.value.trim() && envoye){
      envoye.textContent = msg.value.trim();
      envoye.hidden = false;
    }
    if (barre) barre.style.display = 'none';
    function fin(){
      if (merci){ merci.hidden = false; try{ merci.focus(); }catch(_){ } }
    }
    if (doux){ fin(); return; }
    var p = pointsDeFrappe();
    fil.insertBefore(p, merci);
    setTimeout(function(){ p.remove(); fin(); }, 800);
  });
})();
