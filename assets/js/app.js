var map;

for(layername in layers) {
  if(layers[layername].init !== undefined) {
    layers[layername].init();
  } else {
    layerInit(layers[layername]);
  }
}

$(document).ready(function() {
  getViewport();
  var poi_tab_class = ' class="active"';
  for(layername in layers) {
    if(layers[layername].type == 'point of interest') {
      var th = '';
      if(layers[layername].columns !== undefined) {
        for(i in layers[layername].columns) {
          th += '<th>' + layers[layername].columns[i] + '</th>';
        }
      } else {  
        th += '<th>Name</th>';
        th += '<th>Address</th>';
      }
      $("#sidebar .tab-content").append('\
          <div class="tab-pane active" id="' + layername + '">\
            <p>\
              <div class="row">\
                <div class="col-xs-8 col-md-8">\
                  <input type="text" class="form-control search" placeholder="Search" />\
                </div>\
                <div class="col-xs-4 col-md-4">\
                  <button type="button" class="btn btn-primary pull-right sort" data-sort="' + layername + '-Name"><i class="fa fa-sort"></i>&nbsp;&nbsp;Sort</button>\
                </div>\
              </div>\
            </p>\
            <table class="table table-condensed table-striped" id="'+ layername + '-table">\
              <thead>\
                <tr>' + th + '<tr>\
              </thead>\
              <tbody class="list"></tbody>\
            </table>\
          </div>');
          
      $("#poi-tabs").append('<li' + poi_tab_class + '><a href="#' + layername + '" onclick="$(\'#poi-tabs a[href=\\\'#' + layername + '\\\']\').tab(\'show\'); return false;">' + layers[layername].name + '</a></li>');
      poi_tab_class = '';
      /* Hack to refresh tabs after append */
      $("#poi-tabs a[href='#" + layername + "']").tab("show");
    }
    if(layers[layername].metadata !== undefined) {
      $("#metadata-dropdown").append('<li><a href="#' + layername + '-tab" data-toggle="tab">' + layers[layername].name + '</a></li>');
      $("#aboutTabsContent").append('<div class="tab-pane fade" id="' + layername + '-tab">' + layers[layername].metadata + '</div>');
    }
    if(layers[layername].datafile !== undefined) {
      $("#data-dropdown").append('<li><a href="' + layers[layername].datafile + '" download="' + layername + '.geojson" target="_blank" data-toggle="collapse" data-target=".navbar-collapse.in"><i class="fa fa-download"></i>&nbsp;&nbsp;' + layers[layername].name + '</a></li>');
    }
  }
});

function resetViewport() {
  var bounds = undefined;
  for(layername in layers) {
    if(layers[layername].geojson !== undefined) {
      if(bounds == undefined) {
        bounds = L.latLngBounds(layers[layername].geojson.getBounds());
      } else {
        bounds.extend(layers[layername].geojson.getBounds());
      }
    }
  }
  map.fitBounds(bounds);
}

function getViewport() {
  if (sidebar.isVisible()) {
    map.setActiveArea({
      position: "absolute",
      top: "0px",
      left: $(".leaflet-sidebar").css("width"),
      right: "0px",
      height: $("#map").css("height")
    });
  } else {
    map.setActiveArea({
      position: "absolute",
      top: "0px",
      left: "0px",
      right: "0px",
      height: $("#map").css("height")
    });
  }
}

function sidebarClick(lat, lng, id, layer) {
  /* If sidebar takes up entire screen, hide it and go to the map */
  if (document.body.clientWidth <= 767) {
    sidebar.hide();
    getViewport();
  }
  if(lat !== undefined && lng != undefined) {
    map.setView([lat, lng], 17);
  } else {
    map.fitBounds(layer.getLayer(id));
  }
  if (!map.hasLayer(layer)) {
    map.addLayer(layer);
  }
  if(lat !== undefined && lng != undefined) {
    map._layers[id].fire("click");
  } else {
    layer.getLayer(id).openPopup();
  }
}

/* Basemap Layers */
var mapquestOSM = L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/osm/{z}/{x}/{y}.png", {
  maxZoom: 19,
  subdomains: ["otile1", "otile2", "otile3", "otile4"],
  attribution: 'Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">. Map data (c) <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, CC-BY-SA.'
});
var mapquestOAM = L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg", {
  maxZoom: 18,
  subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"],
  attribution: 'Tiles courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a>. Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
});
var mapquestHYB = L.layerGroup([L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/sat/{z}/{x}/{y}.jpg", {
  maxZoom: 18,
  subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"]
}), L.tileLayer("http://{s}.mqcdn.com/tiles/1.0.0/hyb/{z}/{x}/{y}.png", {
  maxZoom: 19,
  subdomains: ["oatile1", "oatile2", "oatile3", "oatile4"],
  attribution: 'Labels courtesy of <a href="http://www.mapquest.com/" target="_blank">MapQuest</a> <img src="http://developer.mapquest.com/content/osm/mq_logo.png">. Map data (c) <a href="http://www.openstreetmap.org/" target="_blank">OpenStreetMap</a> contributors, CC-BY-SA. Portions Courtesy NASA/JPL-Caltech and U.S. Depart. of Agriculture, Farm Service Agency'
})]);

/* Single marker cluster layer to hold all clusters */
var markerClusters = new L.MarkerClusterGroup({
  spiderfyOnMaxZoom: true,
  showCoverageOnHover: false,
  zoomToBoundsOnClick: true,
  disableClusteringAtZoom: 16
});

map = L.map("map", {
  zoom: 10,
  center: [40.702222, -73.979378],
  layers: [mapquestOSM, markerClusters],
  zoomControl: false,
  attributionControl: false
});

/* Layer control listeners that allow for a single markerClusters layer */
map.on("overlayadd", function(e) {
  for(layername in layers) {
    if(e.layer == layers[layername].emptylayer) {
      markerClusters.addLayer(layers[layername].geojson);
    }
  }
});

map.on("overlayremove", function(e) {
  for(layername in layers) {
    if(e.layer == layers[layername].emptylayer) {
      markerClusters.removeLayer(layers[layername].geojson);
    }
  }
});

/* Attribution control */
function updateAttribution(e) {
  $.each(map._layers, function(index, layer) {
    if (layer.getAttribution) {
      $("#attribution").html((layer.getAttribution()));
    }
  });
}
map.on("layeradd", updateAttribution);
map.on("layerremove", updateAttribution);

var attributionControl = L.control({
  position: "bottomright"
});
attributionControl.onAdd = function (map) {
  var div = L.DomUtil.create("div", "leaflet-control-attribution");
  div.innerHTML = "Developed by <a href='http://bryanmcbride.com'>bryanmcbride.com</a> | <a href='#' onclick='$(\"#attributionModal\").modal(\"show\"); return false;'>Attribution</a>";
  return div;
};
map.addControl(attributionControl);

var zoomControl = L.control.zoom({
  position: "bottomright"
}).addTo(map);

var locateControl = L.control.locate({
  position: "bottomright",
  drawCircle: true,
  follow: true,
  setView: true,
  keepCurrentZoomLevel: true,
  markerStyle: {
    weight: 1,
    opacity: 0.8,
    fillOpacity: 0.8
  },
  circleStyle: {
    weight: 1,
    clickable: false
  },
  icon: "icon-direction",
  metric: false,
  strings: {
    title: "My location",
    popup: "You are within {distance} {unit} from this point",
    outsideMapBoundsMsg: "You seem located outside the boundaries of the map"
  },
  locateOptions: {
    maxZoom: 17,
    watch: true,
    enableHighAccuracy: true,
    maximumAge: 10000,
    timeout: 10000
  }
}).addTo(map);

var baseLayers = {
  "Street Map": mapquestOSM,
  "Aerial Imagery": mapquestOAM,
  "Imagery with Streets": mapquestHYB
};

var groupedOverlays = {
  "Points of Interest": {},
  "Reference": {}
};

for(layername in layers) {
  if(layers[layername].type == 'point of interest') {
    groupedOverlays["Points of Interest"][makeHeader(layers[layername])] = layers[layername].emptylayer;
  }
  if(layers[layername].type == 'reference') {
    groupedOverlays["Reference"][makeHeader(layers[layername])] = layers[layername].geojson;
  }
}

/* Larger screens get expanded layer control */
if (document.body.clientWidth <= 767) {
  var isCollapsed = true;
} else {
  var isCollapsed = false;
}

var layerControlBaseLayers = baseLayers;
if(Object.keys(layerControlBaseLayers).length == 1) {
  layerControlBaseLayers = [];
}
var layerControl = L.control.groupedLayers(layerControlBaseLayers, groupedOverlays, {
  collapsed: isCollapsed
}).addTo(map);

var sidebar = L.control.sidebar("sidebar", {
  closeButton: true,
  position: "left"
}).on("shown", function () {
  getViewport();
}).on("hidden", function () {
  getViewport();
}).addTo(map);

/* Highlight search box text on click */
$("#searchbox").click(function () {
  $(this).select();
});

/* Typeahead search functionality */
$(document).one("ajaxStop", function () {
  /* Fit map to masterLayer bounds */
  resetViewport();
  $("#loading").hide();

  var lists = [];
  for(layername in layers) {
    if(layers[layername].type == 'point of interest') {
      lists[layername] = makeList(layername, layers[layername].columns);
    }
  }

  for(layername in layers) {
    if(layers[layername].bh !== undefined) {
      layers[layername].bh.initialize();
    }
  }

  /* instantiate the typeahead UI */
  var args = [{
    minLength: 3,
    highlight: true,
    hint: false
  }];
  for(layername in layers) {
    if(layers[layername].bh !== undefined) {
      args.push({
        name: layers[layername].name,
        displayKey: "name",
        source: layers[layername].bh.ttAdapter(),
        templates: getTypeaheadTemplate(layers[layername])
      });
    }
  }
  $("#searchbox").typeahead.apply($("#searchbox"), args).on("typeahead:selected", function (obj, datum) {
    for(layername in layers) {
      if(layers[layername].name === datum.source) {
        defaultSelected(layers[layername], map, datum)
      }
    }
    if ($(".navbar-collapse").height() > 50) {
      $(".navbar-collapse").collapse("hide");
    }
  }).on("typeahead:opened", function () {
    $(".navbar-collapse.in").css("max-height", $(document).height() - $(".navbar-header").height());
    $(".navbar-collapse.in").css("height", $(document).height() - $(".navbar-header").height());
  }).on("typeahead:closed", function () {
    $(".navbar-collapse.in").css("max-height", "");
    $(".navbar-collapse.in").css("height", "");
  });
  $(".twitter-typeahead").css("position", "static");
  $(".twitter-typeahead").css("display", "block");
});

/* Placeholder hack for IE */
if (navigator.appName == "Microsoft Internet Explorer") {
  $("input").each(function () {
    if ($(this).val() === "" && $(this).attr("placeholder") !== "") {
      $(this).val($(this).attr("placeholder"));
      $(this).focus(function () {
        if ($(this).val() === $(this).attr("placeholder")) $(this).val("");
      });
      $(this).blur(function () {
        if ($(this).val() === "") $(this).val($(this).attr("placeholder"));
      });
    }
  });
}
