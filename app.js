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
  const markers = [];
  let prevInfoWindow;
  let mapOptions;

  // initalize a new map
  function initMap() {
    mapOptions = {
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
  }

  // create new map marker from API data passed in and pushes marker into array, used in loop
  function createMarker(brewery, coords) {
    marker = new google.maps.Marker({
      position: coords,
      map: map,
      title: brewery.name
    });
    markers.push(marker);
  }

  //sets all the markers from markers array onto map
  function setMapOnAll(map) {
    for (let i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
    }
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

      if (store.website === undefined) {
        website = '';
        brewName = '';
      } else {
        website = store.website;
        brewName = store.brewery.name;
      }


      content = '<div id="content">' +
        `<h3 id="firstHeading" class="firstHeading">${store.brewery.name}</h3>` +
        `<div><img src=${store.brewery.images.medium}></div>` +
        '<div id="bodyContent">' +
        `${store.brewery.description} ` +
        '</div>' +
        '</br>' +
        `<div>${address}</div>` +
        '</br>' +
        `<div>${hours}</div>` +
        '</br>' +
        `<div><a href=${website}>${brewName}</div>` +
        '</div>';

      infowindow = new google.maps.InfoWindow({
        content: content
      });

      setEventListner();
    }
  }

  // set click event on button to populate mapwith markers
  function submitClick(event) {
    event.preventDefault();
    brewData = $.getJSON(`http://cors-anywhere.herokuapp.com/api.brewerydb.com/v2/locations/?key=dbf3bd0628e34ab8dd8398fa95503119&postalCode=${$('#number').val()}`);
    brewData.done(function(resData) {
      brewData = resData;
      brewData = brewData.data;
      map = null;
      initMap();
      setInfoWindowContents();
      map.fitBounds(bounds);
      map.panToBounds(bounds);
    });

    setMapOnAll(map);
  }

  initMap(); // initializes first map on page load
  $('#button').click(submitClick); // creates new map with markers generated from API data

});
