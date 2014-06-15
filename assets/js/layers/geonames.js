layers['geonames'] = {
  name: 'GeoNames',
  icon: 'assets/img/globe.png',
  init: function() {
    this.bh = new Bloodhound({
      name: "GeoNames",
      datumTokenizer: function (d) {
        return Bloodhound.tokenizers.whitespace(d.name);
      },
      queryTokenizer: Bloodhound.tokenizers.whitespace,
      remote: {
        url: "http://api.geonames.org/searchJSON?username=bootleaf&featureClass=P&maxRows=5&countryCode=US&name_startsWith=%QUERY",
        filter: function (data) {
          return $.map(data.geonames, function (result) {
            return {
              name: result.name + ", " + result.adminCode1,
              lat: result.lat,
              lng: result.lng,
              source: "GeoNames"
            };
          });
        },
        ajax: {
          beforeSend: function (jqXhr, settings) {
            settings.url += "&east=" + map.getBounds().getEast() + "&west=" + map.getBounds().getWest() + "&north=" + map.getBounds().getNorth() + "&south=" + map.getBounds().getSouth();
            $("#searchicon").removeClass("fa-search").addClass("fa-refresh fa-spin");
          },
          complete: function (jqXHR, status) {
            $('#searchicon').removeClass("fa-refresh fa-spin").addClass("fa-search");
          }
        }
      },
      limit: 10
    })
  },
  tatemplate: {
    header: "<h4 class='typeahead-header'><img src='assets/img/globe.png' width='25' height='25'>&nbsp;GeoNames</h4>"
  },
  selected: function(map, datum) {
    map.setView([datum.lat, datum.lng], 14);
  }
};