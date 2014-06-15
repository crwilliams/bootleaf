layers['museums'] = {
  name: 'Museums',
  datafile: 'data/DOITT_MUSEUM_01_13SEPT2010.geojson',
  type: 'point of interest',
  icon: 'assets/img/museum.png',
  metadata: '<p>Museum data courtesy of <a href="https://data.cityofnewyork.us/Recreation/Museums-and-Galleries/sat5-adpb" target="_blank">NYC Department of Information & Telecommunications (DoITT)</a></p>',
  search: [],
  /* Empty layer placeholder to add to layer control for listening when to add/remove museums to markerClusters layer */
  emptylayer: L.geoJson(null),
  geojson: L.geoJson(null, {
    pointToLayer: function (feature, latlng) {
      return getDefaultMarker(layers['museums'], feature, latlng);
    },
    onEachFeature: function (feature, layer) {
      handleFeature('museums', feature, layer);
    }
  })
};