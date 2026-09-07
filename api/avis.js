// /api/avis : avis Google de la fiche Digistylze via Places API (New).
// Appelé par le front ; la clé reste côté serveur (env GOOGLE_PLACES_API_KEY).
// Cache CDN 14 jours : environ 2 appels Google par mois, dans le quota gratuit.
// En cas d'échec, le front retombe sur les avis intégrés en dur dans la page.

// Fiche : Digistylze, Rue De-Candolle 20, 1205 Genève
// cid=12171512187117843411 · ftid=0x478c7be153f1483b:0xa8e9e5d8c47f33d3 · kg=/g/11w1vnj1vq
const KEY = process.env.GOOGLE_PLACES_API_KEY || '';
let cachedPlaceId = process.env.GOOGLE_PLACE_ID || ''; // optionnel ; sinon résolu au 1er appel

// Résout le Place ID (format "places/ChIJ...") via une recherche texte, une seule fois.
async function resolvePlaceId() {
  if (cachedPlaceId) return cachedPlaceId;
  const r = await fetch('https://places.googleapis.com/v1/places:searchText', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'X-Goog-Api-Key': KEY,
      'X-Goog-FieldMask': 'places.id,places.displayName,places.formattedAddress',
    },
    body: JSON.stringify({ textQuery: 'Digistylze Rue De-Candolle 20 1205 Genève', languageCode: 'fr' }),
  });
  if (!r.ok) throw new Error('searchText ' + r.status);
  const data = await r.json();
  const hit = (data.places || [])[0];
  if (!hit || !hit.id) throw new Error('fiche introuvable via searchText');
  cachedPlaceId = 'places/' + hit.id;
  return cachedPlaceId;
}

module.exports = async (req, res) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Content-Type', 'application/json; charset=utf-8');

  if (!KEY) {
    res.statusCode = 503;
    res.end(JSON.stringify({ error: 'API non configurée (GOOGLE_PLACES_API_KEY manquante)' }));
    return;
  }

  try {
    const placeId = await resolvePlaceId();
    const url =
      'https://places.googleapis.com/v1/' +
      placeId +
      '?languageCode=fr&fields=rating,userRatingCount,reviews';

    const r = await fetch(url, {
      headers: { 'X-Goog-Api-Key': KEY },
    });

    if (!r.ok) {
      const detail = await r.text();
      res.statusCode = 502;
      res.end(JSON.stringify({ error: 'Places API ' + r.status, detail: detail.slice(0, 300) }));
      return;
    }

    const data = await r.json();

    // Seuls les avis de 4 étoiles et plus sont AFFICHÉS sur le site (un avis
    // 1 étoile déposé par un concurrent traînait dans la fiche). Le filtre est
    // ici, en amont du cache : la valeur mise en cache ne le contient jamais.
    // NOTE : `rating` et `count` restent ceux que Google publie, tous avis
    // confondus — ils ne sont pas recalculés. La page affiche donc la vraie
    // moyenne de la fiche et renvoie vers celle-ci pour l'intégralité des avis.
    const NOTE_MINI = 4;

    const bruts = data.reviews || [];
    const retenus = bruts.filter((rev) => (rev.rating || 5) >= NOTE_MINI);

    const out = {
      rating: data.rating || null,
      count: data.userRatingCount || null,
      reviews: retenus.map((rev) => ({
        author: rev.authorAttribution ? rev.authorAttribution.displayName : '',
        photo: rev.authorAttribution ? rev.authorAttribution.photoUri : '',
        rating: rev.rating || 5,
        when: rev.relativePublishTimeDescription || '',
        text: rev.text ? rev.text.text : '',
      })),
      minRating: NOTE_MINI,
      filtered: bruts.length - retenus.length,   // combien ont été écartés
      fetchedAt: new Date().toISOString(),
    };

    // Cache CDN Vercel : 14 jours, avec resservie de l'ancien pendant la revalidation.
    res.setHeader('Cache-Control', 's-maxage=1209600, stale-while-revalidate=86400');
    res.statusCode = 200;
    res.end(JSON.stringify(out));
  } catch (e) {
    res.statusCode = 502;
    res.end(JSON.stringify({ error: 'fetch failed', detail: String(e).slice(0, 200) }));
  }
};
