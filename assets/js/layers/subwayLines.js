layers['subways'] = {
  name: 'Subway Lines',
  datafile: 'data/subways.geojson',
  type: 'reference',
  metadata: '<p><a href="http://spatialityblog.com/2010/07/08/mta-gis-data-update/#datalinks" target="_blank">MTA Subway data</a> courtesy of the <a href="http://www.urbanresearch.org/about/cur-components/cuny-mapping-service" target="_blank">CUNY Mapping Service at the Center for Urban Research</a></p>',
  geojson: L.geoJson(null, {
    style: function (feature) {
      if (feature.properties.route_id === "1" || feature.properties.route_id === "2" || feature.properties.route_id === "3") {
        return {
          color: "#ff3135",
          weight: 3,
          opacity: 1
        };
      }
      if (feature.properties.route_id === "4" || feature.properties.route_id === "5" || feature.properties.route_id === "6") {
        return {
          color: "#009b2e",
          weight: 3,
          opacity: 1
        };
      }
      if (feature.properties.route_id === "7") {
        return {
          color: "#ce06cb",
          weight: 3,
          opacity: 1
        };
      }
      if (feature.properties.route_id === "A" || feature.properties.route_id === "C" || feature.properties.route_id === "E" || feature.properties.route_id === "SI" || feature.properties.route_id === "H") {
        return {
          color: "#fd9a00",
          weight: 3,
          opacity: 1
        };
      }
      if (feature.properties.route_id === "Air") {
        return {
          color: "#ffff00",
          weight: 3,
          opacity: 1
        };
      }
      if (feature.properties.route_id === "B" || feature.properties.route_id === "D" || feature.properties.route_id === "F" || feature.properties.route_id === "M") {
        return {
          color: "#ffff00",
          weight: 3,
          opacity: 1
        };
      }
      if (feature.properties.route_id === "G") {
        return {
          color: "#9ace00",
          weight: 3,
          opacity: 1
        };
      }
      if (feature.properties.route_id === "FS" || feature.properties.route_id === "GS") {
        return {
          color: "#6e6e6e",
          weight: 3,
          opacity: 1
        };
      }
      if (feature.properties.route_id === "J" || feature.properties.route_id === "Z") {
        return {
          color: "#976900",
          weight: 3,
          opacity: 1
        };
      }
      if (feature.properties.route_id === "L") {
        return {
          color: "#969696",
          weight: 3,
          opacity: 1
        };
      }
      if (feature.properties.route_id === "N" || feature.properties.route_id === "Q" || feature.properties.route_id === "R") {
        return {
          color: "#ffff00",
          weight: 3,
          opacity: 1
        };
      }
    },
    onEachFeature: function (feature, layer) {
      if (feature.properties) {
        var content = "<table class='table table-striped table-bordered table-condensed'>" + "<tr><th>Division</th><td>" + feature.properties.Division + "</td></tr>" + "<tr><th>Line</th><td>" + feature.properties.Line + "</td></tr>" + "<table>";
        if (document.body.clientWidth <= 767) {
          layer.on({
            click: function (e) {
              $("#feature-title").html(feature.properties.Line);
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
      }
      layer.on({
        mouseover: function (e) {
          var layer = e.target;
          layer.setStyle({
            weight: 3,
            color: "#00FFFF",
            opacity: 1
          });
          if (!L.Browser.ie && !L.Browser.opera) {
            layer.bringToFront();
          }
        },
        mouseout: function (e) {
          layers['subways'].geojson.resetStyle(e.target);
        }
      });
    }
  })
};