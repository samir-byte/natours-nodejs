/* eslint-disable */
export const displayMap = (locations) => {
    mapboxgl.accessToken =
        'pk.eyJ1Ijoib2x3YWgiLCJhIjoiY2tlMGVwYnF5M2VjbDM0anp3eXhhMHd5NCJ9.wtcRIqXC_210X0V3FHwkJg';

    var map = new mapboxgl.Map({
        container: 'map',
        style: 'mapbox://styles/olwah/cke0i1j0r0hgv19pcocm96pzd',
        scrollZoom: false
        // center: [-118.113491, 34.111745],
        // zoom: 4
    });

    const bounds = new mapboxgl.LngLatBounds();

    locations.forEach((loc) => {
        // Create marker
        const el = document.createElement('div');
        el.className = 'marker';

        // Add marker
        new mapboxgl.Marker({
            element: el,
            anchor: 'bottom'
        })
            .setLngLat(loc.coordinates)
            .addTo(map); // Read from the DB in locations.coordinates

        // Add popup
        new mapboxgl.Popup({
            offset: 30
        })
            .setLngLat(loc.coordinates)
            .setHTML(`<p>Day ${loc.day}: ${loc.description}</p>`)
            .addTo(map);

        // Extend map bound to include current location
        bounds.extend(loc.coordinates);
    });

    map.fitBounds(bounds, {
        padding: {
            top: 200,
            bottom: 150,
            left: 100,
            right: 100
        }
    });
}


