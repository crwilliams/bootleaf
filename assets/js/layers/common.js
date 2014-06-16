var layers = [];

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
    return "<img src='" + layer.icon + "' width='12' height='14'>&nbsp;" + layer.name;
  } else {
    return layer.name;
  }
}

function getValueNames(layername, columns) {
  if(columns == undefined) {
     columns = ["Name", "Address"];
  }
  var valueNames = [];
  for(i in columns) {
    valueNames.push(layername + '-' + columns[i]);
  }
  return valueNames;
}

function makeList(layername, columns) {
  var valueNames = getValueNames(layername, columns);
  return new List(layername, {valueNames: valueNames}).sort(valueNames[0], {order:"asc"});
}

function getDefaultMarker(layer, feature, latlng) {
  var icon = layer.icon;
  if(feature.properties.ICON !== undefined) {
    icon = feature.properties.ICON;
  }
  return L.marker(latlng, {
    icon: L.icon({
      iconUrl: icon,
      iconSize: [24, 28],
      iconAnchor: [12, 28],
      popupAnchor: [0, -25]
    }),
    title: feature.properties.NAME,
    riseOnHover: true
  });
}

function makeLabel(properties) {
  if(properties.ICON !== undefined) {
    return "<img src='" + properties.ICON + "' width='12' height='14'>&nbsp;" + properties.NAME;
  } else {
    return properties.NAME;
  }
}

function handleFeature(layername, feature, layer) {
  if (feature.properties) {
    var content = "";
    if(feature.properties.CONTENT !== undefined) {
      content = feature.properties.CONTENT;
    } else {
      content += "<table class='table table-striped table-bordered table-condensed'>";
      content += "<tr><th>Name</th><td>" + feature.properties.NAME + "</td></tr>";
      content += "<tr><th>Phone</th><td>" + feature.properties.TEL + "</td></tr>";
      content += "<tr><th>Address</th><td>" + feature.properties.ADDRESS1 + "</td></tr>";
      content += "<tr><th>Website</th><td><a class='url-break' href='" + feature.properties.URL + "' target='_blank'>" + feature.properties.URL + "</a></td></tr>";
      content += "<table>";
    }
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
    var onclick = ' onclick="sidebarClick('+layer.feature.geometry.coordinates[1]+', '+layer.feature.geometry.coordinates[0]+', '+L.stamp(layer)+', layers[\'' + layername + '\'].emptylayer); return false;"';
    var row = '';
    row += '<tr>';
    var valueNames = getValueNames(layername, layers[layername].columns);
    for(i in valueNames) {
      row += '<td class="' + valueNames[i] + '">';
      var value = valueNames[i];
      var title = value;
      if(valueNames[i] == layername + '-Address') {
        value = layer.feature.properties.ADDRESS1;
        title = value;
      } else if(valueNames[i] == layername + '-Name') {
        value = makeLabel(layer.feature.properties);
        title = layer.feature.properties.NAME;
      }
      if(valueNames[i] == valueNames[valueNames.length-1]) {
        row += '<span title="' + title.toLowerCase() + '"></span><a title="' + title + '" href="#"' + onclick + '>';
      }
      row += value;
      if(valueNames[i] == valueNames[valueNames.length-1]) {
        row += '</a>';
      }
      row += '</td>';
    }
    row += '</tr>';
    $("#" + layername + "-table tbody").append(row);
    layers[layername].search.push({
      name: layer.feature.properties.NAME,
      address: layer.feature.properties.ADDRESS1,
      icon: layer.feature.properties.ICON,
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
    var format = "{{name}}<br>&nbsp;<small>{{address}}</small>";
    if(layer.typeaheadFormat !== undefined) {
      format = layer.typeaheadFormat;
    }
    typeaheadTemplate.suggestion = Handlebars.compile(format);
  }
  return typeaheadTemplate;
}