// Points d'eau potable de Raanana.
// IMPORTANT : ne rien ajouter ici sans vérification. Chaque point doit avoir
// des coordonnées réelles ; les champs inconnus restent null (affichés « non vérifié »).
// Format :
// { id:'unique', name:{fr:'',he:'',en:''}, lat:32.18, lng:34.87, type:'fountain|park|building|school|other',
//   address:null, hours:null, access:{wheelchair:null,dog:null,bottle:null}, notes:null,
//   verified:false, status:'unknown|ok|broken', source:'', lastChecked:null }
window.WATER_POINTS = [];

// Centre de Raanana (approximatif) et zone de recherche OSM (sud, ouest, nord, est)
window.RAANANA_CENTER = [32.1848, 34.8713];
window.RAANANA_BBOX = [32.160, 34.835, 32.215, 34.905];
