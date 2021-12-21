const url = "https://earthquake.usgs.gov/earthquakes/feed/v1.0/summary/all_week.geojson"
const tectonicUrl = "https://raw.githubusercontent.com/fraxen/tectonicplates/master/GeoJSON/PB2002_boundaries.json"

d3.json(url).then(function (response) {
    console.log(response)
    createMarker(response)
});

function createMarker(response) {
    function onEachFeature(feature, layer) {
        layer.bindPopup(`<h3> Magnitude: ${feature.properties.mag} </h3> <hr> <h4> Place: ${feature.properties.place} </h4> <h4> Time: ${new Date(feature.properties.time)} </h4>`);
    }
    
    function circleRadius(magnitude) {
        return magnitude * 4
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

    var earthquakeLayer = L.geoJSON(response, {
        pointToLayer: function (features, latlng) {
            return L.circleMarker(latlng, geojsonMarkerOptions(features));
        },
        onEachFeature: onEachFeature
    })

    // geoJson feature layer for tectonicplates 
    d3.json(tectonicUrl).then((data) => {
        console.log(data);

        var tecFeatures = data.features;

        var tectonicLayer = L.geoJSON(tecFeatures, {
            color: "orange",
            weight: 3
        })
        createMap(earthquakeLayer, tectonicLayer)
    });

}

function createMap(earthquakeLayer, tectonicLayer) {
    // street 
    var street = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors'
    })

    // topology
    var topo = L.tileLayer('https://{s}.tile.opentopomap.org/{z}/{x}/{y}.png', {
        attribution: 'Map data: &copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors, <a href="http://viewfinderpanoramas.org">SRTM</a> | Map style: &copy; <a href="https://opentopomap.org">OpenTopoMap</a> (<a href="https://creativecommons.org/licenses/by-sa/3.0/">CC-BY-SA</a>)'
    });

    //satelitte
    var satellite = L.tileLayer('https://basemap.nationalmap.gov/arcgis/rest/services/USGSImageryTopo/MapServer/tile/{z}/{y}/{x}', {
        maxZoom: 20,
        attribution: 'Tiles courtesy of the <a href="https://usgs.gov/">U.S. Geological Survey</a>'
    });

    //basemaps
    var baseMaps = {
        "Street View": street,
        "Topology": topo,
        "Satellite": satellite
    };

    //overlaymaps
    var overlayMaps = {
        "Earthquakes": earthquakeLayer,
        "Tectonic Plates": tectonicLayer
    }

    // creating map variable
    var map = L.map("map", {
        center: [38, -115],
        zoom: 5,
        layers: [satellite, earthquakeLayer, tectonicLayer]
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

function chooseColor(depth) {
    if (depth < 10) return "#99FF99";
    else if (depth > 10 && depth < 30) return "#66FF00";
    else if (depth > 30 && depth < 50) return "#CCCC00";
    else if (depth > 50 && depth < 70) return "#FFCC00";
    else if (depth > 70 && depth < 90) return "#FF9900";
    else return "#FF0000";
}