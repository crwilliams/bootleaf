layers['boroughs'] = {
  name: 'Boroughs',
  datafile: 'data/boroughs.geojson',
  type: 'reference',
  metadata: '<p>Borough data courtesy of <a href="http://www.nyc.gov/html/dcp/html/bytes/meta_dis_nyboroughwi.shtml" target="_blank">New York City Department of City Planning</a></p>',
  search: [],
  geojson: L.geoJson(null, {
    style: function (feature) {
      return {
        color: "black",
        fill: false,
        opacity: 1,
        clickable: false
      };
    },
    onEachFeature: function (feature, layer) {
      layers['boroughs'].search.push({
        name: layer.feature.properties.BoroName,
        source: "Boroughs",
        id: L.stamp(layer),
        bounds: layer.getBounds()
      });
    }
  }),
  tatemplate: {
    header: "<h4 class='typeahead-header'>Boroughs</h4>"
  },
  selected: function(map, datum) {
    map.fitBounds(datum.bounds);
  }
};