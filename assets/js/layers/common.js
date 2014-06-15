var layers = [];
var masterLayerName = 'boroughs';

function layerInit(layer) {
  $.getJSON(layer.datafile, function (data) {
    layer.geojson.addData(data);
    if(layer.initialSelected) {
      map.addLayer(layer.emptylayer);
    }
    if(layer.search !== undefined) {
      layer.bh = new Bloodhound({
        name: layer.name,
        datumTokenizer: function (d) {
          return Bloodhound.tokenizers.whitespace(d.name);
        },
        queryTokenizer: Bloodhound.tokenizers.whitespace,
        local: layer.search,
        limit: 10
      });
    }
  });
}

function defaultSelected(layer, map, datum) {
  if(layer.selected !== undefined) {
    layer.selected(map, datum);
  } else {
    if (!map.hasLayer(layer.emptylayer)) {
      map.addLayer(layer.emptylayer);
    }
    map.setView([datum.lat, datum.lng], 17);
    if (map._layers[datum.id]) {
      map._layers[datum.id].fire("click");
    }
  }
}

function makeHeader(layer) {
  if(layer.icon !== undefined) {
    return "<img src='" + layer.icon + "' width='24' height='28'>&nbsp;" + layer.name;
  } else {
    return layer.name;
  }
}

function makeList(layername) {
  return new List(layername, {valueNames: [layername + "-name", layername + "-address"]}).sort(layername + "-name", {order:"asc"});
}

function getDefaultMarker(layer, feature, latlng) {
  return L.marker(latlng, {
    icon: L.icon({
      iconUrl: layer.icon,
      iconSize: [24, 28],
      iconAnchor: [12, 28],
      popupAnchor: [0, -25]
    }),
    title: feature.properties.NAME,
    riseOnHover: true
  });
}

function handleFeature(layername, feature, layer) {
  if (feature.properties) {
    var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Name</th><td>" + feature.properties.NAME + "</td></tr>" + "<tr><th>Phone</th><td>" + feature.properties.TEL + "</td></tr>" + "<tr><th>Address</th><td>" + feature.properties.ADDRESS1 + "</td></tr>" + "<tr><th>Website</th><td><a class='url-break' href='" + feature.properties.URL + "' target='_blank'>" + feature.properties.URL + "</a></td></tr>" + "<table>";
    if (document.body.clientWidth <= 767) {
      layer.on({
        click: function (e) {
          $("#feature-title").html(feature.properties.NAME);
          $("#feature-info").html(content);
          $("#featureModal").modal("show");
        }
      });
    } else {
      layer.bindPopup(content, {
        maxWidth: "auto",
        closeButton: false
      });
    }
    $("#" + layername + "-table tbody").append('<tr><td class="' + layername + '-name">'+layer.feature.properties.NAME+'</td><td class="' + layername + '-address"><a href="#" onclick="sidebarClick('+layer.feature.geometry.coordinates[1]+', '+layer.feature.geometry.coordinates[0]+', '+L.stamp(layer)+', layers[\'' + layername + '\'].emptylayer); return false;">'+layer.feature.properties.ADDRESS1+'</a></td></tr>');
    layers[layername].search.push({
      name: layer.feature.properties.NAME,
      address: layer.feature.properties.ADDRESS1,
      source: layers[layername].name,
      id: L.stamp(layer),
      lat: layer.feature.geometry.coordinates[1],
      lng: layer.feature.geometry.coordinates[0]
    });
  }
}

function getTypeaheadTemplate(layer) {
  var typeaheadTemplate = {
    header: "<h4 class='typeahead-header'>" + makeHeader(layer) + "</h4>"
  }
  if(layer.type == 'point of interest') {
    typeaheadTemplate.suggestion = Handlebars.compile(["{{name}}<br>&nbsp;<small>{{address}}</small>"].join(""));
  }
  return typeaheadTemplate;
}