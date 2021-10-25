
let latlng = {
    lat: 18.789031812467023,
    lng: 98.98201621906692

};
let map = L.map("map", {
    center: latlng,
    zoom: 13
});

// const url = 'http://localhost:3700';

map.pm.addControls({
    position: 'topleft',
    drawCircle: false,
    drawCircleMarker: false,
    drawPolygon: false,
    drawRectangle: false,
    drawPolyline: false,
    editMode: false,
    dragMode: false,
    cutPolygon: false,
    rotateMode: false,
});


const mapbox = L.tileLayer(
    "https://api.mapbox.com/styles/v1/{id}/tiles/{z}/{x}/{y}?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw",
    {
        maxZoom: 18,
        attribution:
            'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, ' +
            '<a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
        id: "mapbox/light-v9",
        tileSize: 512,
        zoomOffset: -1
    }
);

const ghyb = L.tileLayer("https://{s}.google.com/vt/lyrs=y,m&x={x}&y={y}&z={z}", {
    maxZoom: 20,
    subdomains: ["mt0", "mt1", "mt2", "mt3"]
});

// const pro = L.tileLayer.wms("https://rti2dss.com:8443/geoserver/th/wms?", {
//     layers: "th:province_4326",
//     format: "image/png",
//     transparent: true,
//     CQL_FILTER: 'pro_code=20 OR pro_code=21 OR pro_code=24'
// });


const baseMap = {
    "Mapbox": mapbox.addTo(map),
    "Google Hybrid": ghyb
};

// const overlayMap = {
//     "ขอบเขตจังหวัด": pro.addTo(map)
// };
// L.control.layers(baseMap, overlayMap).addTo(map);

function onLocationFound(e) {

}

function onLocationError(e) {
    console.log(e.message);
}

map.on("locationfound", onLocationFound);
// map.on("locationerror", onLocationError);
// map.locate({ setView: true, maxZoom: 19 });

var lc = L.control.locate({
    position: 'topleft',

}).addTo(map);

lc.start();

let rmLyr = () => {
    map.eachLayer(lyr => {
        if (lyr.options.name == 'marker') {
            map.removeLayer(lyr)
        }
    })
}

map.on('pm:create', e => {
    console.log(e)
    find(e)
    dist(e)
    getWeather(e)
});

function find(e) {
    // console.log(e)
    rmLyr()
    e.layer.options.name = 'line'
    let data = {
        g: e.layer.toGeoJSON().geometry,

    }
    console.log(data)
    $.post("/api/find", data).done(r => {
        console.log(r);
        r.data.map(i => {

            $("#road_type").val(i.road_type)
            $("#surface").val(i.surface)
            $("#lane").val(i.lane)
            $("#oneway").val(i.oneway)
            $("#speed").val(i.speed)
            $("#width").val(i.width)

            console.log(i.road_type, i.surface, i.lane, i.oneway, i.speed, i.width);
            setTimeout(() => {
                predict(e)
            }, 1000);
        })
    })
}

function dist(e) {
    // console.log(e)
    rmLyr()
    e.layer.options.name = 'line'
    let data = {
        g: e.layer.toGeoJSON().geometry,
    }
    console.log(data)

    $.post("/api/dist", data).done(r => {
        console.log(r);
        r.data.map(i => {
            console.log(i.dist);
            $("#distance").val(i.dist)
        })
    })
}

function getWeather(e) {
    var now = new Date();
    var year = now.getFullYear();
    var month = now.getMonth() + 1;
    var day = now.getDate();
    var hour = now.getHours();
    var minute = now.getMinutes();
    var second = now.getSeconds();
    if (month.toString().length == 1) {
        month = '0' + month;
    }
    if (day.toString().length == 1) {
        day = '0' + day;
    }

    var dateTime = year + '-' + month + '-' + day
    console.log(dateTime);
    console.log(hour);

    $("#hour").val(hour)

    g = e.layer.toGeoJSON().geometry
    console.log(g.coordinates[0]);

    var settings = {
        "async": true,
        "crossDomain": true,
        // "url": "https://data.tmd.go.th/nwpapi/v1/forecast/hourly/at?lat=" + g.coordinates[1] + "&lon=" + g.coordinates[0] + "&fields=tc,rh&date=" + dateTime + "&hour=" + hour + "&duration=1",
        "url": `https://data.tmd.go.th/nwpapi/v1/forecast/location/hourly/at?lat=${g.coordinates[1]}&lon=${g.coordinates[0]}&fields=tc,rh,rain,slp,rain,ws10m&date=${dateTime}&hour=${hour}&duration=1`,
        "method": "GET",
        "headers": {
            "accept": "application/json",
            "authorization": "Bearer eyJ0eXAiOiJKV1QiLCJhbGciOiJSUzI1NiIsImp0aSI6ImQxZDc0Yzg1ODE2Zjg4MmNkOGY0NDdjOTU0ZWNkMTIyMGU1YWZiMDVjYmMwYThmMzNkNTZiNjNkY2Y3NDMyZmU3ZGMyNGUzODkwMTNhNmZlIn0.eyJhdWQiOiIyIiwianRpIjoiZDFkNzRjODU4MTZmODgyY2Q4ZjQ0N2M5NTRlY2QxMjIwZTVhZmIwNWNiYzBhOGYzM2Q1NmI2M2RjZjc0MzJmZTdkYzI0ZTM4OTAxM2E2ZmUiLCJpYXQiOjE2MzIzMTk0MjAsIm5iZiI6MTYzMjMxOTQyMCwiZXhwIjoxNjYzODU1NDIwLCJzdWIiOiIzNjciLCJzY29wZXMiOltdfQ.IHaaCbqArUj5dU_plSNg5HcUYehCmED7pZkpyPh-Pxy_13UdG_JBZgAw0Ud40in73mygxqgBlJn1S6-tRnDOJn5TabZ0hwoOjAXWfYzmVXgvhBNByzNTaEUTIZTNoo50gGw2Zvbf3aeJgkkGCt4X1SVdLOBNjREam3aKPWC0AT4DOLS6cOjOzrLLVYQDm3N7spzEK3hUlHlpO-C5Z-EYAUFoU7zOvkx3MyMc4pz1CrkIk6CLUC7WQAQqp4AxYUBGaqbg7KSFyNGn6O7hzPJrcmYPHkyQqAsKL-bG9Ilq5o3t7XYiE6eLhetRzPrXmrm9lnjUDnIBegQ9i58_Almnp6dfuxy0ORKtYJPAj6cau7NEZCdlGzoh_8ZKCcuLv5K5IkdrvmU1WygnhYYA9a1ebBtwtjr2khUi7RmNFhXHon86B73hF9gdACJouaJytNF0ecq2RkQmBeEJ8I2ahurW4udHZhcDRmvGGlnVd5oCcVy6ebpsdbkQHMCgsgikqm0L794dmlMEcgTOIO6DSHP4lmbp_fFd_R16f4UQ67VngTMqG1VTrYSCZ3PglSJ3b-P24IlOVd2M6mcDNf34S2rhCQUFRN0mTt-dM_9n-uU0g1ZZmJQJvoX0iWGzhtK4xc1JFQnjazWMqNGiDGU4mC_I5jvFjlJycke0aONy8CZX56U",
        }
    }

    $.ajax(settings).done(function (response) {
        data = response.WeatherForecasts
        data.map((i) => {
            console.log(i.forecasts);
            a = i.forecasts[0].data
            console.log(a);
            wind_spd = a.ws10m * 3.6
            $("#rain").val(a.rain)
            $("#humidity").val(a.rh)
            $("#temp").val(a.tc)
            $("#press").val(a.slp)
            $("#wind_spd").val(wind_spd)

            console.log(a.rain, a.rh, a.tc, a.slp, wind_spd);
        })
    });
}

let num = []
let label = []
function predict(g) {

    setTimeout(() => {

        let road_type = $("#road_type").val()
        let surface = $("#surface").val()
        let lane = $("#lane").val()
        let oneway = $("#oneway").val() == "FT" ? 1 : 0;
        let speed = $("#speed").val()
        let width = $("#width").val()
        let distance = $("#distance").val()
        let rain = $("#rain").val()
        let humidity = $("#humidity").val()
        let temp = $("#temp").val()
        let press = $("#press").val()
        let wind_speed = $("#wind_spd").val()
        let hour = $("#hour").val()

        console.log(rain, road_type);

        let myJSON = `{"roadtype":${road_type}, "surface":${surface}, "lane":${lane},"oneway":${oneway},"speed":${speed},"width":${width},"distance":${distance},"rain":${rain},"humidity":${humidity},"wind_spd":${wind_speed},"temp":${temp},"pressure":${press},"hour":${hour}}`
        console.log(myJSON);
        console.log(myJSON.canApprove);

        $.post("http://localhost:3002/predict", myJSON).done(r => {
            console.log(r.prediction);
            percent = r.prediction * 100
            num.push(percent)
            label.push("ตำแหน่งที่" + num.length)

            setTimeout(() => {
                callChart(num, label)
            }, 700)


            let e = g.layer.toGeoJSON().geometry
            var greenIcon = new L.Icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-green.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });

            var redIcon = new L.Icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-red.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });

            var yellowIcon = new L.Icon({
                iconUrl: 'https://raw.githubusercontent.com/pointhi/leaflet-color-markers/master/img/marker-icon-2x-yellow.png',
                shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/0.7.7/images/marker-shadow.png',
                iconSize: [25, 41],
                iconAnchor: [12, 41],
                popupAnchor: [1, -34],
                shadowSize: [41, 41]
            });
            if (r.prediction < 0.5) {
                L.marker([e.coordinates[1], e.coordinates[0]], { pmIgnore: true, icon: greenIcon }).addTo(map);
            }
            else if (0.5 <= r.prediction && r.prediction <= 0.75) {
                L.marker([e.coordinates[1], e.coordinates[0]], { pmIgnore: true, icon: yellowIcon }).addTo(map);
            } else {
                L.marker([e.coordinates[1], e.coordinates[0]], { pmIgnore: true, icon: redIcon }).addTo(map);
            }
            // r.data.map(i => {
            //     console.log(i.dist);

            // })
        })
    }, 1000);
}

function callChart(g, label) {
    // num = g * 100
    var ctx = document.getElementById('myChart').getContext('2d');
    var myChart = new Chart(ctx, {
        type: 'bar',
        data: {
            labels: label,
            datasets: [{
                label: 'เปอร์เซ็นความเสี่ยงที่จะเกิดอุบัติเหตุ',
                data: g,
                backgroundColor: [
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(255, 99, 132, 0.2)',
                    'rgba(255, 99, 132, 0.2)'
                ],
                borderColor: [
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 99, 132, 1)',
                    'rgba(255, 99, 132, 1)'
                ],
                borderWidth: 1
            }]
        },
        options: {
            scales: {
                y: {
                    beginAtZero: true
                }
            }
        }
    });
}