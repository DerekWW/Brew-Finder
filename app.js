$(function() {
  let infowindow;
  let map;
  let brewData;
  let marker;
  const coordObj = {};
  let bounds;
  let hours;
  let address;
  let website;
  let brewName;
  let prevInfoWindow;
  let mapOptions;
  let logo;
  let description;
  let phone;
  let userCoords;
  let userZip;

  //Styling for google map
  let styledMapType = new google.maps.StyledMapType(
    [{
      "featureType": "all",
      "elementType": "labels.text.fill",
      "stylers": [{
        "color": "#ffffff"
      }]
    }, {
      "featureType": "all",
      "elementType": "labels.text.stroke",
      "stylers": [{
        "color": "#000000"
      }, {
        "lightness": 13
      }]
    }, {
      "featureType": "administrative",
      "elementType": "geometry.fill",
      "stylers": [{
        "color": "#000000"
      }]
    }, {
      "featureType": "administrative",
      "elementType": "geometry.stroke",
      "stylers": [{
        "color": "#144b53"
      }, {
        "lightness": 14
      }, {
        "weight": 1.4
      }]
    }, {
      "featureType": "landscape",
      "elementType": "all",
      "stylers": [{
        "color": "#08304b"
      }]
    }, {
      "featureType": "poi",
      "elementType": "geometry",
      "stylers": [{
        "color": "#0c4152"
      }, {
        "lightness": 5
      }]
    }, {
      "featureType": "road.highway",
      "elementType": "geometry.fill",
      "stylers": [{
        "color": "#000000"
      }]
    }, {
      "featureType": "road.highway",
      "elementType": "geometry.stroke",
      "stylers": [{
        "color": "#0b434f"
      }, {
        "lightness": 25
      }]
    }, {
      "featureType": "road.arterial",
      "elementType": "geometry.fill",
      "stylers": [{
        "color": "#000000"
      }]
    }, {
      "featureType": "road.arterial",
      "elementType": "geometry.stroke",
      "stylers": [{
        "color": "#0b3d51"
      }, {
        "lightness": 16
      }]
    }, {
      "featureType": "road.local",
      "elementType": "geometry",
      "stylers": [{
        "color": "#000000"
      }]
    }, {
      "featureType": "transit",
      "elementType": "all",
      "stylers": [{
        "color": "#146474"
      }]
    }, {
      "featureType": "water",
      "elementType": "all",
      "stylers": [{
        "color": "#021019"
      }]
    }], {
      name: 'Styled Map'
    }

  );

  // initalize a new map
  function initMap() {
    mapOptions = {
      zoom: 5,
      center: new google.maps.LatLng(37.09024, -100.712891),
      panControl: false,
      zoomControl: true,
      mapTypeControlOptions: {
        mapTypeIds: ['roadmap', 'satellite', 'hybrid', 'terrain',
          'styled_map'
        ]
      },
      zoomControlOptions: {
        style: google.maps.ZoomControlStyle.LARGE,
        position: google.maps.ControlPosition.RIGHT_CENTER
      },
      scaleControl: false
    };
    map = new google.maps.Map(document.getElementById('map'), mapOptions);
    bounds = new google.maps.LatLngBounds();
    map.mapTypes.set('styled_map', styledMapType);
    map.setMapTypeId('styled_map');
  }

  // create new map marker from API data passed in and pushes marker into array, used in loop
  function createMarker(brewery, coords) {
    marker = new google.maps.Marker({
      position: coords,
      map: map,
      title: brewery.brewery.name
    });

  }

  // sets event listener on marker to close info window if another opens
  function setEventListner() {
    google.maps.event.addListener(marker, 'click', (function(marker, content, infowindow) {
      return function() {
        if (prevInfoWindow) {
          prevInfoWindow.close();
        }
        prevInfoWindow = infowindow;
        infowindow.open(map, marker);
      };
    })(marker, content, infowindow));
  }

  // creates the coords and info window content and sets the content
  function setInfoWindowContents() {
    for (const store of brewData) {
      coordObj.lat = store.latitude;
      coordObj.lng = store.longitude;
      createMarker(store, coordObj);

      loc = new google.maps.LatLng(marker.position.lat(), marker.position.lng());
      bounds.extend(loc);

      hours = store.hoursOfOperation || '';

      address = store.streetAddress || '';

      description = store.brewery.description || 'No Description Avaliable';

      phone = store.phone || '';

      if (store.website === undefined) {
        website = '';
        brewName = '';
      } else {
        website = store.website;
        brewName = store.brewery.name;
      }

      if (store.brewery.images === undefined) {
        logo = '';
      } else {
        logo = `<img src=${store.brewery.images.medium}>`;
      }


      content = '<div id="content">' +
        `<h3 id="firstHeading" class="firstHeading">${store.brewery.name}</h3>` +
        `<div>${logo}` +
        '<div id="bodyContent">' +
        `${description} ` +
        '</div>' +
        '</br>' +
        `<div>${address}</div>` +
        '</br>' +
        `<div>${hours}</div>` +
        '</br>' +
        `<div><a href='tel:${phone}'>${phone}</div>` +
        '</br>' +
        `<div><a href=${website}>${brewName}</div>` +
        '</div>';

      infowindow = new google.maps.InfoWindow({
        content: content
      });

      setEventListner();
    }
  }

  function throwError() {
    $('#error').text('No Breweries Found!')
  }

  function clearError() {
    $('#error').text('')
  }

  // set click event on button to populate mapwith markers
  function submitClick(event) {
    event.preventDefault();
    brewData = $.getJSON(`https://crossorigin.me/https://api.brewerydb.com/v2/locations/?key=dbf3bd0628e34ab8dd8398fa95503119&postalCode=${$('#number').val()}`);
    brewData.done(function(resData) {
      brewData = resData;
      brewData = brewData.data;
      if (brewData === undefined) {
        throwError();
      } else {
        clearError()
        map = null;
        initMap()
        setInfoWindowContents();
        map.fitBounds(bounds);
        map.panToBounds(bounds);
      }
    });
  }

  initMap(); // initializes first map on page load
  $('#button').click(submitClick); // creates new map with markers generated from API data


});
