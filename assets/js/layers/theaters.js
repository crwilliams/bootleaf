layers['theaters'] = {
  name: 'Theaters',
  datafile: 'data/DOITT_THEATER_01_13SEPT2010.geojson',
  type: 'point of interest',
  icon: 'assets/img/theater.png',
  metadata: '<p>Theater data courtesy of <a href="https://data.cityofnewyork.us/Recreation/Theaters/kdu2-865w" target="_blank">NYC Department of Information & Telecommunications (DoITT)</a></p>',
  initialSelected: true,
  search: [],
  /* Empty layer placeholder to add to layer control for listening when to add/remove theaters to markerClusters layer */
  emptylayer: L.geoJson(null),
  geojson: L.geoJson(null, {
    pointToLayer: function (feature, latlng) {
      return getDefaultMarker(layers['theaters'], feature, latlng);
    },
    onEachFeature: function (feature, layer) {
      handleFeature('theaters', feature, layer);
    }
  })
};