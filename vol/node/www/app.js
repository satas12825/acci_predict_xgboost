
let latlng = {
    lat: 18.789031812467023,
    lng: 98.98201621906692

};
let map = L.map("map", {
    center: latlng,
    zoom: 13
});

// const urlnode = 'http://localhost:3000';
// const urlflask = 'http://localhost:3500';

const urlnode = 'http://34.87.86.125/napi';
const urlflask = 'http://34.87.86.125/fapi';

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

const pro = L.tileLayer.wms("https://rti2dss.com:8443/geoserver/th/wms?", {
    layers: "th:province_4326",
    format: "image/png",
    transparent: true,
    CQL_FILTER: 'pro_code=50'
});


const baseMap = {
    "Mapbox": mapbox.addTo(map),
    "Google Hybrid": ghyb
};

const overlayMap = {
    "ขอบเขตจังหวัด": pro
};
L.control.layers(baseMap, overlayMap).addTo(map);

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

// lc.start();

let rmLyr = () => {
    map.eachLayer(lyr => {
        if (lyr.options.name == 'marker') {
            map.removeLayer(lyr)
        }
    })
}

map.on('pm:create', async (e) => {
    // console.log(e)
    await dist(e)
    await getWeather(e)
    await find(e)
});

function find(e) {
    // console.log(e)
    rmLyr()
    e.layer.options.name = 'line'
    let data = {
        g: JSON.stringify(e.layer.toGeoJSON().geometry)
    }
    // console.log(data)
    $.post(urlnode + "/api/find", data).done(r => {
        predict(e, r.data[0].road_type, r.data[0].surface, r.data[0].lane, r.data[0].oneway, r.data[0].speed, r.data[0].width)
    })
}

function dist(e) {
    rmLyr()
    e.layer.options.name = 'line'
    let data = {
        g: JSON.stringify(e.layer.toGeoJSON().geometry)
    }
    // console.log(data)

    $.post(urlnode + "/api/dist", data).done(r => {
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
    // console.log(dateTime);
    // console.log(hour);

    $("#hour").val(hour)

    g = e.layer.toGeoJSON().geometry

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

            // console.log(a.rain, a.rh, a.tc, a.slp, wind_spd);
        })
    });
}

let num = []
let label = []
let chartDat = []
function predict(g, roadtype, surface, lane, oneway, speed, width) {
    let myJSON = {
        roadtype,
        surface,
        lane,
        speed,
        width,
        oneway: oneway == "FT" ? 1 : 0,
        "distance": $("#distance").val(),
        "rain": $("#rain").val(),
        "humidity": $("#humidity").val(),
        "wind_spd": $("#wind_spd").val(),
        "temp": $("#temp").val(),
        "pressure": $("#press").val(),
        "hour": $("#hour").val()
    }
    // console.log(JSON.stringify(myJSON));

    $.post(urlflask + "/predict", JSON.stringify(myJSON)).done(r => {
        console.log(r.prediction);
        percent = r.prediction * 100
        num.push(percent)
        label.push("ตำแหน่งที่" + num.length)

        color = percent < 50 ? "#009900" : percent < 75 ? "#c9c322" : "#ca273a"

        chartDat.push({
            "cat": "ตำแหน่งที่" + num.length,
            "val": percent,
            "color": color
        })

        setTimeout(() => {
            callChart(chartDat, "myChart", "โอกาสเกิดอุบัติเหตุ (%)")
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
        let mk = L.marker()
        if (r.prediction < 0.5) {
            mk = L.marker([e.coordinates[1], e.coordinates[0]], {
                pmIgnore: true,
                icon: greenIcon,
                data: myJSON
            }).addTo(map);
        }
        else if (0.5 <= r.prediction && r.prediction <= 0.75) {
            mk = L.marker([e.coordinates[1], e.coordinates[0]], {
                pmIgnore: true,
                icon: yellowIcon,
                data: myJSON
            }).addTo(map);
        } else {
            mk = L.marker([e.coordinates[1], e.coordinates[0]], {
                pmIgnore: true,
                icon: redIcon,
                data: myJSON
            }).addTo(map);
        }

        mk.on('mouseover', (e) => {
            highlightFeature(e)
        })
        mk.on('mouseout', (e) => {
            resetHighlight(e)
        })
    })
}

let callChart = (data, div, label) => {
    console.log(data, div, label);
    // Create chart instance
    var chart = am4core.create(div, am4charts.XYChart);

    // Add data
    chart.data = data;

    // Create axes
    var categoryAxis = chart.xAxes.push(new am4charts.CategoryAxis());
    categoryAxis.dataFields.category = "cat";
    categoryAxis.renderer.grid.template.location = 0;
    categoryAxis.renderer.minGridDistance = 30;
    // categoryAxis.renderer.labels.template.horizontalCenter = "right";
    categoryAxis.renderer.labels.template.verticalCenter = "middle";
    // categoryAxis.renderer.labels.template.rotation = 270;
    categoryAxis.tooltip.disabled = true;
    categoryAxis.renderer.minHeight = 110;

    var valueAxis = chart.yAxes.push(new am4charts.ValueAxis());
    valueAxis.renderer.minWidth = 50;

    valueAxis.title.text = label;

    // Create series
    var series = chart.series.push(new am4charts.ColumnSeries());
    series.sequencedInterpolation = true;
    series.dataFields.valueY = "val";
    series.dataFields.categoryX = "cat";
    // series.tooltipText = "{categoryX}: [bold]{valueY}[/]";
    series.columns.template.strokeWidth = 0;
    // series.tooltip.pointerOrientation = "vertical";
    series.columns.template.column.cornerRadiusTopLeft = 10;
    series.columns.template.column.cornerRadiusTopRight = 10;
    // series.columns.template.column.fillOpacity = 0.8;

    var labelBullet = series.bullets.push(new am4charts.LabelBullet());
    labelBullet.label.verticalCenter = "bottom";
    labelBullet.label.dy = 0;
    labelBullet.label.text = "{values.valueY.workingValue.formatNumber('#.')}";

    series.columns.template.adapter.add("fill", function (fill, target) {
        // return chart.colors.getIndex(target.dataItem.index);
        return target.dataItem.dataContext["color"];
    });

    // Cursor
    chart.cursor = new am4charts.XYCursor();

    chart.exporting.menu = new am4core.ExportMenu();
    chart.exporting.menu.align = "left";
    chart.exporting.menu.verticalAlign = "top";
    chart.exporting.adapter.add("data", function (data, target) {
        var data = [];
        chart.series.each(function (series) {
            for (var i = 0; i < series.data.length; i++) {
                series.data[i].name = series.name;
                data.push(series.data[i]);
            }
        });
        return { data: data };
    });

    var indicator;
    function showIndicator() {
        if (indicator) {
            indicator.show();
        }
        else {
            indicator = chart.tooltipContainer.createChild(am4core.Container);
            indicator.background.fill = am4core.color("#fff");
            indicator.background.fillOpacity = 0.8;
            indicator.width = am4core.percent(100);
            indicator.height = am4core.percent(100);

            var indicatorLabel = indicator.createChild(am4core.Label);
            indicatorLabel.text = "ไม่มีข้อมูล";
            indicatorLabel.align = "center";
            indicatorLabel.valign = "middle";
            indicatorLabel.fontSize = 20;
        }
    }

    chart.events.on("beforedatavalidated", function (ev) {
        // console.log(ev.target.data)
        if (ev.target.data.length == 1) {
            let dat = ev.target.data
            if (dat[0].val == 0) {
                showIndicator();
            }
        }
    });
}


var info = L.control({ position: 'bottomright' });

info.onAdd = function (map) {
    this._div = L.DomUtil.create('div', 'info'); // create a div with a class "info"
    this.update();
    return this._div;
};

info.update = function (props) {
    console.log(props);
    if (props) {
        this._div.innerHTML = `<b>ระยะห่างจากทางแยก:</b> ${Number(props.distance).toFixed(2)}  เมตร <br/>
        <b>ความชื้นสัมพัทธ์:</b> ${props.humidity}  <br/>
        <b>ความเร็วลม:</b> ${props.wind_spd} <br/>
        <b>อุณหภูมิ:</b> ${props.temp}  <br/>
        <b>ความกดอากาศ:</b>${props.pressure}  <br/>
        <b>จำนวนช่องทางเดินรถ:</b>${props.lane} <br/>
        <b>ความก้างของถนน:</b> ${props.width} <br/>
        <b>พื้นผิวจราจร:</b>${props.surface}  <br/>`;
    } else {
        this._div.innerHTML = ''
    }

};

info.addTo(map);

function highlightFeature(e) {
    console.log(e);
    info.update(e.target.options.data);
}

function resetHighlight(e) {
    info.update();
    // this._div.innerHTML = ''
    // info.update(e.target.options.data);
}