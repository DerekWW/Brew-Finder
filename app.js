$(function() {

  let userCords;
  let contentString;
  let infowindow;
  let map;
  let brewData;
  let filteredBrewData;
  let jsonString;
  let marker;
  let coordObj = {};
  let bounds;


  if (navigator.geolocation) {

    function error(err) {
      console.warn('ERROR(' + err.code + '): ' + err.message);
    }

    function success(pos) {
      userCords = pos.coords;

      //return userCords;
    }

    // Get the user's current position
    navigator.geolocation.getCurrentPosition(success, error);
    //console.log(pos.latitude + " " + pos.longitude);
  } else {
    alert('Geolocation is not supported in your browser');
  }

  let mapOptions = {
    zoom: 5,
    center: new google.maps.LatLng(37.09024, -100.712891),
    panControl: false,
    zoomControl: true,
    zoomControlOptions: {
      style: google.maps.ZoomControlStyle.LARGE,
      position: google.maps.ControlPosition.RIGHT_CENTER
    },
    scaleControl: false

  };



  map = new google.maps.Map(document.getElementById('map'), mapOptions);

  bounds = new google.maps.LatLngBounds();



  function submitClick(event) {
    event.preventDefault();
    brewData = $.getJSON(`http://cors-anywhere.herokuapp.com/api.brewerydb.com/v2/locations/?key=dbf3bd0628e34ab8dd8398fa95503119&postalCode=${$('#number').val()}`);
    console.log(brewData);
    brewData.done(function(resData) {
      console.log(resData);
      brewData = resData;
      brewData = brewData.data;

      function clearMarkers() {
        setMapOnAll(null);
      }


      for (var store of brewData) {
        console.log(store);
        coordObj.lat = store.latitude;
        coordObj.lng = store.longitude;
        console.log(coordObj);
        marker = new google.maps.Marker({
          position: coordObj,
          map: map,
          title: store.name
        });

        loc = new google.maps.LatLng(marker.position.lat(), marker.position.lng());
        bounds.extend(loc);

        content = '<div id="content">' +
          '<div id="siteNotice">' +
          '</div>' +
          `<h3 id="firstHeading" class="firstHeading">${store.brewery.name}</h3>` +
          '<div id="bodyContent">' +
          `${store.brewery.description} ` +
          '</div>' +
          '</br>' +
          `<div>${store.streetAddress}</div>` +
          '</br>' +
          `<div>${store.hoursOfOperation}</div>` +
          '</br>' +
          `<div><a href=${store.website}>${store.brewery.name}</div>` +
          '</div>';

        infowindow = new google.maps.InfoWindow({
          content: content
        });

        google.maps.event.addListener(marker, 'click', (function(marker, content, infowindow) {
          return function() {
            infowindow.setContent(content);
            infowindow.open(map, marker);
          };
        })(marker, content, infowindow));





      }
      map.fitBounds(bounds);
      map.panToBounds(bounds);

    });

  }









  $('#button').click(submitClick);

});
