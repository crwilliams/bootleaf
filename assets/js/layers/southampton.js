var southamptonMetadata = '<p>This layer makes use of the following datasets:<ul><li><a href="http://id.southampton.ac.uk/dataset/places">Buildings and Places</a> (available under the <a href="http://reference.data.gov.uk/id/open-government-licence">Open Government Licence</a>)</li><li><a href="http://id.southampton.ac.uk/dataset/catering">Catering</a> (available under the <a href="http://reference.data.gov.uk/id/open-government-licence">Open Government Licence</a>)</li><li><a href="http://id.southampton.ac.uk/dataset/amenities">Local Amenities</a> (available under the <a href="http://reference.data.gov.uk/id/open-government-licence">Open Government Licence</a>)</li><li><a href="http://id.southampton.ac.uk/dataset/bus-info">Southampton Bus Information</a> (available under the <a href="http://reference.data.gov.uk/id/open-government-licence">Open Government Licence</a>)</li><li><a href="http://id.southampton.ac.uk/dataset/room-features">Teaching Room Features</a> (available under the <a href="http://reference.data.gov.uk/id/open-government-licence">Open Government Licence</a>)</li><li><a href="http://id.southampton.ac.uk/dataset/wifi">WiFi</a> (available under the <a href="http://reference.data.gov.uk/id/open-government-licence">Open Government Licence</a>)</li><li><a href="http://data.ordnancesurvey.co.uk">Ordnance Survey Linked Data</a> (available under the <a href="http://reference.data.gov.uk/id/open-government-licence">Open Government Licence</a>)</li></ul></p><p>Contains Ordnance Survey data &copy; Crown copyright and database right 2011.<br/>Contains Royal Mail data &copy; Royal Mail copyright and database right 2011.</p>';

function createSouthamptonLayer(layername, name)
{
  createLayer(
    'southampton/' + layername,
    name,
    'http://data.southampton.ac.uk/map-icons/' + layername + '/blank.png',
    southamptonMetadata
  );
}

createSouthamptonLayer('Transportation', 'Transport');
createSouthamptonLayer('Restaurants-and-Hotels', 'Catering-Accommodation');
createSouthamptonLayer('Offices', 'Services');
createSouthamptonLayer('Culture-and-Entertainment', 'Culture-Entertainment');
createSouthamptonLayer('Health', 'Health-Beauty');
createSouthamptonLayer('Tourism', 'Tourism-Religion');
createSouthamptonLayer('Stores', 'Retail');
createSouthamptonLayer('Education', 'Education');
createSouthamptonLayer('Sports', 'Sports');

layers['buildings'] = {
  name: 'Buildings',
  datafile: 'data/southampton/buildings.geojson',
  type: 'reference',
  metadata: southamptonMetadata,
  initialSelected: true,
  search: [],
  geojson: L.geoJson(null, {
    style: function (feature) {
      return {
        color: "black",
        fill: true,
        opacity: 1,
        clickable: true,
        weight: "1px"
      };
    },
    onEachFeature: function (feature, layer) {
      handleFeature('buildings', feature, layer);
    }
  }),
  tatemplate: {
    header: "<h4 class='typeahead-header'>Southampton Buildings</h4>"
  },
  selected: function(map, datum) {
    map.fitBounds(datum.bounds);
  },
  columns: ['Name']
};

layers['sites'] = {
  name: 'Sites',
  datafile: 'data/southampton/sites.geojson',
  type: 'reference',
  metadata: southamptonMetadata,
  initialSelected: true,
  search: [],
  geojson: L.geoJson(null, {
    style: function (feature) {
      return {
        color: "black",
        fill: false,
        opacity: 1,
        clickable: true,
        weight: "3px"
      };
    },
    onEachFeature: function (feature, layer) {
      handleFeature('sites', feature, layer);
    }
  }),
  tatemplate: {
    header: "<h4 class='typeahead-header'>Southampton Sites</h4>"
  },
  selected: function(map, datum) {
    map.fitBounds(datum.bounds);
  },
  columns: ['Name']
};

setTitle('University of Southampton Map');
var defaultViewport = L.latLngBounds(L.latLng(50.932858999577164, -1.4007300639873421), L.latLng(50.938211037309856, -1.3923620003962731));
