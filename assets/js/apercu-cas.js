/* ================================================================
 DIGISTYLZE · ÉTUDES DE CAS DE LA MODALE D'APERÇU
 ================================================================
 Alimente le panneau qui s'affiche à côté de l'aperçu, dans
 `apercu.js`. Une entrée par projet, la clé est le `data-apercu-id`
 porté par la carte dans `realisations.html`.

 Chargé AVANT `apercu.js`. Un projet absent de cette table n'est pas
 une erreur : la modale s'ouvre alors sans panneau, exactement comme
 avant. C'est ce qui permet à `creation-site-web.html` de partager la
 même modale sans porter aucune donnée.

 ----------------------------------------------------------------
 RÈGLE DE SOURCING, à tenir à chaque ajout
 ----------------------------------------------------------------
 Aucun chiffre de cette table n'est inventé. Chacun vient soit de la
 carte elle-même, soit d'une autre page du site qui l'affirme déjà :
 · `community-management.html` pour les quatre comptes sociaux,
 d'où viennent aussi les « point de départ / dispositif /
 résultat » ;
 · `agence-seo.html` pour les six positions Top 3 et le suivi
 sur 12 mois ;
 · la carte pour les sept cas publicité, qui sont anonymisés ;
 · `branding.html` pour les livrables d'identité.

 Douze projets n'ont aucun résultat commercial documenté : neuf
 sites web, plus Neo Management, Monney Conseils et Carreauluxe.
 Ils reçoivent des KPI de LIVRABLE, ce qui a été produit, et qui se
 vérifie sur l'aperçu, jamais un résultat inventé. Ce sont des
 entreprises réelles et nommées : leur attribuer un chiffre qu'on ne
 peut pas recouper les engagerait sans leur accord.

 Quand un chiffre existe déjà sur la carte, il est repris ICI À
 L'IDENTIQUE et placé en premier, pour qu'il n'y ait jamais deux
 vérités pour un même projet.

 `kpis` accepte deux ou trois entrées, la grille s'adapte.
 ================================================================ */
window.DTZ_CAS = {

 /*, , , , , , , , , , , , , , , , , , , , , , , · SITES WEB, aperçu : capture pleine page défilante, , , , , , , , , , , , , , , , , , , , , , , */

 'akb-project': {
 intro: "Maîtrise d'ouvrage déléguée à Genève : AKB pilote des chantiers pour des institutionnels, des fonds et des coopératives. Le site devait parler à trois publics très différents.",
 kpis: [
 { value: '3', label: 'Publics adressés' },
 { value: 'Devis', label: 'Formulaire avec pièces jointes' },
 { value: 'Références', label: 'Architectes et promoteurs' }
 ],
 sections: [
 { title: 'Enjeu', body: "Institutionnels, propriétaires de biens d'exception et bureaux d'architecture ne cherchent pas la même chose. Un discours unique n'aurait convaincu personne." },
 { title: 'Réponse', body: "Trois entrées distinctes, une galerie de réalisations commentées, et un formulaire qui accepte les plans en pièce jointe dès la première prise de contact." }
 ]
 },

 'mcm-charpente': {
 intro: "Charpentier et menuisier depuis plus de 25 ans, MCM travaille le bois de la structure extérieure à l'agencement intérieur. Deux métiers, un seul site.",
 kpis: [
 { value: '#1', label: 'Google « charpente Vaud »' },
 { value: '2', label: 'Métiers distingués' },
 { value: '3 étapes', label: 'Méthode expliquée' }
 ],
 sections: [
 { title: 'Enjeu', body: "Charpente extérieure et menuiserie intérieure s'adressent au même client à des moments différents. Les mélanger brouillait le propos." },
 { title: 'Réponse', body: "Une galerie à deux onglets, la méthode détaillée en trois étapes, étude, atelier, pose, et la première place Google sur la requête prioritaire." }
 ]
 },

 'oz-dessin-web': {
 intro: "Bureau de dessin technique et génie civil à Genève. Un métier de précision qui se vend sur la lisibilité des plans, pas sur une vitrine commerciale.",
 kpis: [
 { value: '3', label: 'Pôles de service' },
 { value: 'Devis', label: 'Estimation gratuite' },
 { value: 'Galerie', label: 'Plans et chantiers' }
 ],
 sections: [
 { title: 'Enjeu', body: "Dessin technique, métrés et suivi de chantier sont trois prestations distinctes, souvent confondues par les clients qui les commandent." },
 { title: 'Réponse', body: "Chaque pôle a sa section et son entrée propre, une galerie montre les plans livrés, et une FAQ traite les questions posées avant chaque devis." }
 ]
 },

 'dimension-soi-web': {
 intro: "Cabinet de neurofeedback à Carouge. Une pratique que le public connaît mal et cherche souvent par le symptôme plutôt que par son nom.",
 kpis: [
 { value: 'RDV', label: 'Prise en ligne' },
 { value: 'Top 3', label: 'Google « neurofeedback »' },
 { value: '5,0', label: 'Avis Google intégrés' }
 ],
 sections: [
 { title: 'Enjeu', body: "Les visiteurs arrivent avec une difficulté, pas avec un vocabulaire. Il fallait les accueillir par leur problème et expliquer avant de proposer." },
 { title: 'Réponse', body: "Une entrée par difficulté, le parcours de soin détaillé, les avis Google affichés, et la prise de rendez-vous directement sur la page." }
 ]
 },

 'metadir': {
 intro: "Construction métallique : garde-corps, façades et structures. Metadir travaille pour des donneurs d'ordre exigeants, dont plusieurs grandes maisons suisses.",
 kpis: [
 { value: '3', label: 'Familles de produits' },
 { value: '24 h', label: 'Réactivité annoncée' },
 { value: 'Références', label: 'Logos clients affichés' }
 ],
 sections: [
 { title: 'Enjeu', body: "L'image en ligne devait arriver au niveau de l'atelier, un décalage courant dans l'industrie, et coûteux face à des donneurs d'ordre institutionnels." },
 { title: 'Réponse', body: "Trois familles de produits clairement séparées, le processus de prise de contact à la pose, et le mur de références mis en avant très tôt dans la page." }
 ]
 },

 'feuer-pro-tech-web': {
 intro: "Protection incendie à Carouge. Un métier normé, où le client vérifie les certifications avant de regarder quoi que ce soit d'autre.",
 kpis: [
 { value: '#1', label: 'Google « protection incendie Genève »' },
 { value: 'AEAI · VKF', label: 'Certifications mises en avant' },
 { value: 'Multilingue', label: 'Sélecteur de langue' }
 ],
 sections: [
 { title: 'Enjeu', body: "Sur ce marché la recherche est déclenchée par une obligation ou un contrôle : la conformité doit être visible avant l'argumentaire." },
 { title: 'Réponse', body: "Certifications AEAI, VKF et K-SEG affichées en section propre, références institutionnelles assumées, et la première place Google sur la requête du canton." }
 ]
 },

 'nego-mediation': {
 intro: "Médiation, négociation et enquêtes internes en entreprise, depuis Genève et Lausanne. Six domaines d'intervention à rendre lisibles sans les diluer.",
 kpis: [
 { value: '6', label: "Domaines d'intervention" },
 { value: '2', label: 'Sièges, Genève et Lausanne' },
 { value: 'Blog', label: 'Publications régulières' }
 ],
 sections: [
 { title: 'Enjeu', body: "Personne de confiance, formation, médiation, négociation, lancement d'alerte, enquêtes internes : six offres proches, que le visiteur doit distinguer vite." },
 { title: 'Réponse', body: "Un code couleur par domaine tenu sur toute la page, les références clients affichées tôt, et un blog qui installe l'expertise dans la durée." }
 ]
 },

 'imsg-web': {
 intro: "Business school genevoise, en concurrence avec des institutions au budget sans commune mesure. Quatre programmes, du bachelor au doctorat.",
 kpis: [
 { value: '4', label: 'Programmes présentés' },
 { value: 'Top 3', label: 'Google « école de management Genève »' },
 { value: 'Eduqua', label: 'Accréditation affichée' }
 ],
 sections: [
 { title: 'Enjeu', body: "Un candidat hésite rarement entre BBA, MBA, DBA et brevet fédéral en connaissance de cause : il faut l'orienter avant de le convaincre." },
 { title: 'Réponse', body: "Un questionnaire d'orientation vers le bon programme, les accréditations en évidence, un fil d'actualités, et le Top 3 Google sur la requête prioritaire." }
 ]
 },

 'medusapack': {
 intro: "Studio de packaging à Nyon, qui travaille pour des marques agroalimentaires en Suisse et à l'international. Le site est en anglais, comme ses clients.",
 kpis: [
 { value: '5', label: 'Pôles de compétence' },
 { value: '11', label: 'Projets au catalogue' },
 { value: 'Anglais', label: 'Langue du site' }
 ],
 sections: [
 { title: 'Enjeu', body: "Un studio de design est jugé sur son portfolio : l'acheteur veut voir les gammes livrées avant de lire la moindre promesse." },
 { title: 'Réponse', body: "Un menu qui donne accès aux onze projets d'un seul geste, cinq compétences présentées comme un parcours, et des études de cas illustrées." }
 ]
 },

 'hygie-services': {
 intro: "Nettoyage, conciergerie et logistique événementielle à Meyrin. Trois publics aux besoins opposés, sur un seul site.",
 kpis: [
 { value: '3', label: 'Publics séparés' },
 { value: '6', label: 'Prestations professionnelles' },
 { value: 'Devis', label: 'Parcours principal' }
 ],
 sections: [
 { title: 'Enjeu', body: "Une régie ne cherche pas la même chose qu'un particulier en fin de bail, ni qu'un organisateur d'événement. Un menu unique les aurait perdus." },
 { title: 'Réponse', body: "Trois entrées dès la navigation, professionnels, particuliers, nettoyage spécifique, et une demande de devis atteignable depuis chacune." }
 ]
 },

 'eveil-immobilier': {
 intro: "Agence immobilière en Haute-Savoie, à la frontière suisse. Le site devait porter le catalogue de biens et l'estimation, pas seulement présenter l'agence.",
 kpis: [
 { value: 'Recherche', label: 'Filtres ville, type, prix' },
 { value: 'Annonces', label: 'Statuts tenus à jour' },
 { value: 'Estimation', label: 'Entrée vendeur dédiée' }
 ],
 sections: [
 { title: 'Enjeu', body: "Acheteur et vendeur arrivent avec deux intentions opposées : trouver un bien, ou faire estimer le sien. Les deux devaient avoir leur chemin." },
 { title: 'Réponse', body: "Un moteur de recherche filtré en tête de page pour l'acheteur, une entrée d'estimation pour le vendeur, et des annonces dont le statut reste à jour." }
 ]
 },

 'bati-clean-web': {
 intro: "Nettoyage de façades en Suisse romande. L'argument commercial est un comparatif de coût : nettoyer plutôt que repeindre.",
 kpis: [
 { value: 'Top 3', label: 'Google « nettoyage de façade »' },
 { value: '4 étapes', label: 'Processus détaillé' },
 { value: 'Essai', label: 'Zone test gratuite' }
 ],
 sections: [
 { title: 'Enjeu', body: "Le prospect compare spontanément avec un ravalement peinture. Autant poser la comparaison nous-mêmes, chiffres à l'appui." },
 { title: 'Réponse', body: "Un comparatif de coût assumé en pleine page, des avant-après, le processus en quatre étapes, et une zone d'essai gratuite pour lever le dernier doute." }
 ]
 },

 /*, , , , , , , , , , , , , , , , , , , , , , , · PUBLICITÉ · DORMANT
 Chiffres tels qu'affichés sur la carte, cas anonymisés.

 Le CTA « Voir le projet » a été retiré des cartes publicité et SEO :
 ces treize fiches ne sont donc plus atteignables. Elles restent ici
 parce qu'elles sont sourcées et vérifiées, les remettre en service
 ne demande que de rendre leur bouton aux cartes concernées dans
 realisations.html. Les supprimer perdrait le travail de sourcing., , , , , , , , , , , , , , , , , , , , , , , */

 'pub-immobilier': {
 intro: "Un acteur immobilier romand, en Meta Ads. Cas anonymisé à la demande du client.",
 kpis: [
 { value: '300K CHF', label: 'Générés' },
 { value: "2'480 CHF", label: 'Investis' },
 { value: '6 CHF', label: 'Le lead' }
 ],
 sections: [
 { title: 'Dispositif', body: "Campagnes Meta ciblées, créatifs testés en continu, formulaire raccourci au strict nécessaire." },
 { title: 'Pilotage', body: "Coupure rapide des créas sous-performantes et réallocation du budget sur les gagnantes. Coût par lead tenu à 6 CHF." }
 ]
 },

 'pub-negoce-bois': {
 intro: "Un négoce de bois en Google Ads, sur des recherches d'achat très qualifiées. Cas anonymisé.",
 kpis: [
 { value: "7'800 CHF", label: 'Générés' },
 { value: '600 CHF', label: 'Investis' },
 { value: '7 CHF', label: 'Le lead' }
 ],
 sections: [
 { title: 'Dispositif', body: "Campagnes Search branchées sur les recherches d'achat, plutôt que sur le volume générique." },
 { title: 'Pilotage', body: "Budget serré, mots-clés resserrés. 7'800 CHF générés pour 600 CHF investis." }
 ]
 },

 'pub-ecole-privee': {
 intro: "Une école privée en Meta Ads, sur un cycle de décision long. Cas anonymisé.",
 kpis: [
 { value: '+80K CHF', label: 'Générés' },
 { value: "3'000 CHF", label: 'Investis' },
 { value: '18 CHF', label: 'Le lead' }
 ],
 sections: [
 { title: 'Dispositif', body: "Campagnes orientées inscription, avec un message qui traite l'objection avant le formulaire." },
 { title: 'Pilotage', body: "Un coût par lead plus élevé qu'ailleurs, assumé : la valeur d'une inscription le justifie." }
 ]
 },

 'pub-clinique': {
 intro: "Une clinique en Google Ads, sur des requêtes disputées qui exigent un Quality Score irréprochable. Cas anonymisé.",
 kpis: [
 { value: '47', label: 'Rendez-vous' },
 { value: '800 CHF', label: 'Investis' },
 { value: "6'500 CHF", label: 'CA généré' }
 ],
 sections: [
 { title: 'Dispositif', body: "Search ciblé sur les requêtes de prise de rendez-vous, page d'atterrissage dédiée." },
 { title: 'Pilotage', body: "47 rendez-vous pour 800 CHF investis, et 6'500 CHF de chiffre d'affaires rattaché." }
 ]
 },

 'pub-therapeute': {
 intro: "Un thérapeute indépendant en Google Ads, avec un objectif simple : remplir l'agenda. Cas anonymisé.",
 kpis: [
 { value: "12'000 CHF", label: 'Générés' },
 { value: "1'000 CHF", label: 'Investis' },
 { value: '10-15', label: 'RDV par mois' }
 ],
 sections: [
 { title: 'Dispositif', body: "Campagne locale resserrée, sans dispersion géographique ni mots-clés larges." },
 { title: 'Pilotage', body: "Un rythme régulier de 10 à 15 rendez-vous par mois, pour 1'000 CHF investis." }
 ]
 },

 'pub-location-voitures': {
 intro: "Un loueur de véhicules en Meta Ads, sur une demande saisonnière. Cas anonymisé.",
 kpis: [
 { value: '15K CHF', label: 'Générés' },
 { value: "1'500 CHF", label: 'Investis' },
 { value: '20 CHF', label: 'Le lead' }
 ],
 sections: [
 { title: 'Dispositif', body: "Créas orientées réservation, avec une offre lisible dès la première seconde." },
 { title: 'Pilotage', body: "Budget concentré sur les périodes de demande. 15K CHF générés pour 1'500 CHF investis." }
 ]
 },

 'pub-restaurant': {
 intro: "Un restaurant en Meta Ads, avec un objectif de réservations directes plutôt que via les plateformes. Cas anonymisé.",
 kpis: [
 { value: "2'690 CHF", label: 'Générés' },
 { value: '560 CHF', label: 'Investis' },
 { value: '4 CHF', label: 'Le lead' }
 ],
 sections: [
 { title: 'Dispositif', body: "Ciblage de proximité, créas appétissantes, réservation en direct sans intermédiaire." },
 { title: 'Pilotage', body: "Coût par lead à 4 CHF, le plus bas des sept cas, et des réservations qui ne passent plus par une commission." }
 ]
 },

 /*, , , , , , , , , , , , , , , , , , , , , , , · SEO · DORMANT, voir la note du bloc publicité ci-dessus.
 Positions et suivi 12 mois : agence-seo.html, , , , , , , , , , , , , , , , , , , , , , , */

 'seo-feuer-pro-tech': {
 intro: "Protection incendie à Genève : une recherche déclenchée par une obligation, où la première réponse emporte le mandat.",
 kpis: [
 { value: '#1', label: 'Google' },
 { value: '12 mois', label: 'Position suivie' }
 ],
 sections: [
 { title: 'Mot-clé prioritaire', body: "« protection incendie Genève », la requête qui concentre la demande du canton." },
 { title: 'Résultat', body: "Première place Google, et un trafic organique qui génère des demandes chaque semaine." }
 ]
 },

 'seo-axius': {
 intro: "Conseil B2B : peu de volume, mais chaque visiteur compte. Le SEO y vaut plus que la publicité.",
 kpis: [
 { value: 'Top 3', label: 'Google' },
 { value: '12 mois', label: 'Position suivie' }
 ],
 sections: [
 { title: 'Mots-clés prioritaires', body: "Les requêtes métier sur lesquelles se décide un premier contact qualifié." },
 { title: 'Résultat', body: "Top 3 Google sur les mots-clés les plus importants, position tenue sur douze mois." }
 ]
 },

 'seo-bati-clean': {
 intro: "Nettoyage de façades : une requête courte et très disputée, qui concentre presque toute la demande.",
 kpis: [
 { value: 'Top 3', label: 'Google' },
 { value: '12 mois', label: 'Position suivie' }
 ],
 sections: [
 { title: 'Mot-clé prioritaire', body: "« nettoyage de façade », y être ou ne pas exister." },
 { title: 'Résultat', body: "Top 3 Google, et un trafic organique qui génère des demandes chaque semaine." }
 ]
 },

 'seo-imsg': {
 intro: "École de management à Genève, face à des institutions au budget sans commune mesure.",
 kpis: [
 { value: 'Top 3', label: 'Google' },
 { value: '12 mois', label: 'Position suivie' }
 ],
 sections: [
 { title: 'Mot-clé prioritaire', body: "« école de management Genève », la requête d'intention la plus forte du secteur." },
 { title: 'Résultat', body: "Top 3 Google sur une requête très disputée, position suivie sur douze mois." }
 ]
 },

 'seo-dimension-soi': {
 intro: "Neurofeedback : une pratique encore mal connue, qu'il faut expliquer autant que référencer.",
 kpis: [
 { value: 'Top 3', label: 'Google' },
 { value: '12 mois', label: 'Position suivie' }
 ],
 sections: [
 { title: 'Mot-clé prioritaire', body: "« neurofeedback », un terme que le public cherche sans toujours savoir l'écrire." },
 { title: 'Résultat', body: "Top 3 Google, avec un contenu qui informe avant de convertir." }
 ]
 },

 'seo-fiduciaire-cornavin': {
 intro: "Fiduciaire à Genève : un marché saturé où la confiance se joue dès la page de résultats.",
 kpis: [
 { value: 'Top 3', label: 'Google' },
 { value: '12 mois', label: 'Position suivie' }
 ],
 sections: [
 { title: 'Mot-clé prioritaire', body: "« fiduciaire Genève », l'une des requêtes les plus concurrentielles du canton." },
 { title: 'Résultat', body: "Top 3 Google, position tenue et suivie sur douze mois." }
 ]
 },

 /*, , , , , , , , , , , , , , , , , , , , , , , · BRANDING, aperçu : visuel de la carte
 Livrables : branding.html (logo, charte, brandbook,
 fichiers sources inclus, droits cédés définitivement)., , , , , , , , , , , , , , , , , , , , , , , */

 'brand-oz-dessin': {
 intro: "Bureau de dessin technique et génie civil à Genève : une expertise pointue, une image qui ne la portait pas.",
 kpis: [
 { value: '+38 %', label: 'De devis signés' },
 { value: 'Logo + charte', label: 'Identité complète' },
 { value: 'Droits cédés', label: 'Fichiers sources inclus' }
 ],
 sections: [
 { title: 'Enjeu', body: "Un métier de précision, jugé sur la rigueur : le devis devait inspirer la même confiance que le travail." },
 { title: 'Réponse', body: "Identité complète déclinée sur la papeterie et les documents commerciaux. +38 % de devis signés." }
 ]
 },

 'brand-learning-impact': {
 intro: "Ingénierie de formation : une marque qui devait se voir et se retenir sur des supports très variés.",
 kpis: [
 { value: '+62 %', label: "D'engagement" },
 { value: 'Logo + charte', label: 'Identité complète' },
 { value: 'Droits cédés', label: 'Fichiers sources inclus' }
 ],
 sections: [
 { title: 'Enjeu', body: "Des supports nombreux, présentations, réseaux, imprimés, et aucune règle commune pour les tenir." },
 { title: 'Réponse', body: "Système de couleurs et gabarits déclinables. +62 % d'engagement constaté." }
 ]
 },

 'brand-constantin-tecafin': {
 intro: "Fiduciaire genevoise : dans ce métier, l'image dit la sériosité avant le premier rendez-vous.",
 kpis: [
 { value: '+47 %', label: 'De prises de contact' },
 { value: 'Logo + charte', label: 'Identité complète' },
 { value: 'Droits cédés', label: 'Fichiers sources inclus' }
 ],
 sections: [
 { title: 'Enjeu', body: "Une architecture de marque à clarifier, entre les entités et leurs supports." },
 { title: 'Réponse', body: "Identité déclinée en système cohérent sur l'ensemble des supports. +47 % de prises de contact." }
 ]
 },

 'brand-neo-management': {
 intro: "Cabinet de conseil : une identité à poser de zéro, sobre et durable.",
 kpis: [
 { value: 'Logo + charte', label: 'Identité complète' },
 { value: 'Fichiers sources', label: 'Inclus' },
 { value: 'Droits cédés', label: 'Définitivement' }
 ],
 sections: [
 { title: 'Enjeu', body: "Le conseil se vend sur la crédibilité : une identité trop marquée dessert autant qu'une identité absente." },
 { title: 'Réponse', body: "Un logotype sobre et une charte réduite à l'essentiel, faciles à tenir dans le temps." }
 ]
 },

 'brand-monney-conseils': {
 intro: "Conseil indépendant : une marque qui devait tenir aussi bien en signature d'e-mail qu'en façade.",
 kpis: [
 { value: 'Logo + charte', label: 'Identité complète' },
 { value: 'Fichiers sources', label: 'Inclus' },
 { value: 'Droits cédés', label: 'Définitivement' }
 ],
 sections: [
 { title: 'Enjeu', body: "Une identité de petite structure doit rester lisible à toutes les tailles, du tampon au web." },
 { title: 'Réponse', body: "Un logotype pensé pour les petites tailles, livré avec ses fichiers sources et ses droits." }
 ]
 },

 'brand-carreauluxe': {
 intro: "Carrelage et revêtements : un métier d'artisanat où l'image doit dire le haut de gamme sans en faire trop.",
 kpis: [
 { value: 'Logo + charte', label: 'Identité complète' },
 { value: 'Fichiers sources', label: 'Inclus' },
 { value: 'Droits cédés', label: 'Définitivement' }
 ],
 sections: [
 { title: 'Enjeu', body: "Se distinguer d'un secteur où presque tout le monde communique de la même façon." },
 { title: 'Réponse', body: "Un logotype net et une charte resserrée, déclinables du véhicule au devis." }
 ]
 },

 /*, , , , , , , , , , , , , , , , , , , , , , , · RÉSEAUX SOCIAUX, aperçu : publication de la carte
 Chiffres et récits : community-management.html, , , , , , , , , , , , , , , , , , , , , , , */

 'social-bni-geneva': {
 intro: "Point de départ : un compte associatif peu actif.",
 kpis: [
 { value: '+86k', label: 'Vues par mois' },
 { value: "+1'800", label: 'Abonnés' },
 { value: '7,1 %', label: 'Engagement' }
 ],
 sections: [
 { title: 'Dispositif', body: "Couverture des événements, portraits de membres, Reels réguliers." },
 { title: 'Résultat', body: "Un moteur de recommandations qualifiées pour le groupe." }
 ]
 },

 'social-lili-flow-studio': {
 intro: "Point de départ : un studio confidentiel, quasi invisible en ligne.",
 kpis: [
 { value: '+38', label: 'Réservations par semaine' },
 { value: '+220k', label: 'Vues par mois' },
 { value: '+186 %', label: 'Messages privés' }
 ],
 sections: [
 { title: 'Dispositif', body: "Contenus incarnés, Reels et offres claires en bio." },
 { title: 'Résultat', body: "Un planning qui se remplit chaque mois via Instagram." }
 ]
 },

 'social-open-future': {
 intro: "Point de départ : un compte technique qui ne parlait qu'aux initiés.",
 kpis: [
 { value: '+128', label: 'Leads B2B' },
 { value: '+340 %', label: 'Engagement' },
 { value: '×3,2', label: 'Inscriptions webinaires' }
 ],
 sections: [
 { title: 'Dispositif', body: "Vulgarisation, cas clients, rendez-vous éditoriaux LinkedIn." },
 { title: 'Résultat', body: "Un vrai canal d'acquisition B2B." }
 ]
 },

 'social-pass-senior': {
 intro: "Point de départ : une carte d'avantages seniors, remises bien-être, restaurants et loisirs à Genève, sans présence sociale.",
 kpis: [
 { value: '+72', label: 'Adhésions par mois' },
 { value: '+310k', label: 'Vues par trimestre' }
 ],
 sections: [
 { title: 'Dispositif', body: "Contenus de proximité, témoignages, relais partenaires." },
 { title: 'Résultat', body: "Une vraie communauté qui s'engage et adhère." }
 ]
 }

};
