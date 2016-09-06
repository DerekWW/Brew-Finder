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
  let markers = [];
  let prev_infowindow = false;

  function initMap() {
    const mapOptions = {
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

  function createMarker(store, coordObj) {
    marker = new google.maps.Marker({
      position: coordObj,
      map: map,
      title: store.name
    });
    markers.push(marker);
  }

  function setMapOnAll(map) {
    for (var i = 0; i < markers.length; i++) {
      markers[i].setMap(map);
    }
  }

  function setEventListner() {
    google.maps.event.addListener(marker, 'click', (function(marker, content, infowindow) {
      return function() {
        if (prev_infowindow) {
          prev_infowindow.close();
        }
        infowindow.setContent(content);
        prev_infowindow = infowindow;
        infowindow.open(map, marker);
      };
    })(marker, content, infowindow));
  }



  initMap();


  function submitClick(event) {
    event.preventDefault();
    brewData = $.getJSON(`http://cors-anywhere.herokuapp.com/api.brewerydb.com/v2/locations/?key=dbf3bd0628e34ab8dd8398fa95503119&postalCode=${$('#number').val()}`);
    console.log(brewData);
    brewData.done(function(resData) {
      console.log(resData);
      brewData = resData;
      brewData = brewData.data;
      map = null;

      initMap();

      for (var store of brewData) {
        coordObj.lat = store.latitude;
        coordObj.lng = store.longitude;
        createMarker(store, coordObj);

        loc = new google.maps.LatLng(marker.position.lat(), marker.position.lng());
        bounds.extend(loc);

        if (store.hoursOfOperation === undefined) {
          hours = '';
        } else {
          hours = store.hoursOfOperation;
        }

        if (store.streetAddress === undefined) {
          address = '';
        } else {
          address = store.streetAddress;
        }

        if (store.website === undefined) {
          website = '';
          brewName = '';
        } else {
          website = store.website;
          brewName = store.brewery.name;
        }

        content = '<div id="content">' +
          `<h3 id="firstHeading" class="firstHeading">${store.brewery.name}</h3>` +
          `<div><img src=${store.brewery.images.squareMedium}></div>` +
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

      map.fitBounds(bounds);
      map.panToBounds(bounds);

    });
    setMapOnAll(map);
  }

  $('#button').click(submitClick);

});
