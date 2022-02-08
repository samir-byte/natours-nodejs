/* eslint-disable */
// export const displayMap = (locations) => {
    mapboxgl.accessToken =
        'pk.eyJ1Ijoic2FtaXItYnl0ZSIsImEiOiJja3o2c2pndGQwZjVkMm5ueHZsMzlmcm9yIn0.YENDvxf1gXceokKf03b-yQ';

    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/samir-byte/ckz6smpmn002l14qivpcubpn7',
        scrollZoom: false
        // center: [-118.113491, 34.111745],
        // zoom: 4
    });

    // const bounds = new mapboxgl.LngLatBounds();

    // locations.forEach((loc) => {
    //     // Create marker
    //     const el = document.createElement('div');
    //     el.className = 'marker';

    //     // Add marker
    //     new mapboxgl.Marker({
    //         element: el,
    //         anchor: 'bottom'
    //     })
    //         .setLngLat(loc.coordinates)
    //         .addTo(map); // Read from the DB in locations.coordinates

    //     // Add popup
    //     new mapboxgl.Popup({
    //         offset: 30
    //     })
    //         .setLngLat(loc.coordinates)
    //         .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
    //         .addTo(map);

    //     // Extend map bound to include current location
    //     bounds.extend(loc.coordinates);
    // });

    // map.fitBounds(bounds, {
    //     padding: {
    //         top: 200,
    //         bottom: 150,
    //         left: 100,
    //         right: 100
    //     }
    // });
// }


