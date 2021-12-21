const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"

d3.json(url).then((response) => {
    console.log(response)
    createMap(response)
});

function createMap(response) {
    // street 
    var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })

    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3> Magnitude: ${feature.properties.mag} </h3> <hr> <h4> Place: ${feature.properties.place} </h4> <h4> Time: ${new Date(feature.properties.time)} </h4>`);
    }

    function circleRadius(magnitude) {
        return magnitude * 4
    }

    function chooseColor(depth) {
        if (depth < 10) return "#99FF99";
        else if (depth > 10 && depth < 30) return "#66FF00";
        else if (depth > 30 && depth < 50) return "#CCCC00";
        else if (depth > 50 && depth < 70) return "#FFCC00";
        else if (depth > 70 && depth < 90) return "#FF9900";
        else return "#FF0000";
    }

    function geojsonMarkerOptions(features) {
        return {
            radius: circleRadius(parseInt(features.properties.mag)),
            fillColor: chooseColor(features.geometry.coordinates[2]),
            color: "#000",
            weight: 1,
            opacity: 1,
            fillOpacity: 0.8
        }
    }

    // feature layer for eartquake data
    var earthquakeLayer = L.geoJSON(response, {
        pointToLayer: function (features, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions(features));
        },
        onEachFeature: onEachFeature
    })

    //basemaps
    var baseMaps = {
        "Street View": street,
    };

    //overlaymaps
    var overlayMaps = {
        "Earthquakes": earthquakeLayer
    }

    // creating map variable
    var map = L.map("map", {
        center: [38, -115],
        zoom: 5,
        layers: [street, earthquakeLayer]
    });

    // control of layers
    L.control.layers(baseMaps, overlayMaps, {
        collapsed: false
    }).addTo(map)


    // map lengend 
    var legend = L.control({ position: 'bottomright' });

    legend.onAdd = function (map) {
        var div = L.DomUtil.create('div', 'info legend'),
            grades = [-10, 10, 30, 50, 70, 90],
            labels = [];

        // loop density intervals and add label
        for (var i = 0; i < grades.length; i++) {
            div.innerHTML +=
                '<i style="background:' + chooseColor(grades[i] + 1) + '"></i> ' +
                grades[i] + (grades[i + 1] ? '&ndash;' + grades[i + 1] + '<br>' : '+');
        }
        return div;
    };
    legend.addTo(map);
}