const express = require('express');
const app = express.Router();




///////////////////////////////
app.get('https://api.weather.com/v1/location/VTCC:9:TH/observations/historical.json?apiKey=e1f10a1e78da46f5b10a1e78da96f525&units=m&startDate=20180101&endDate=20180131', (req, res) => {
    if (!error && response.statusCode == 200) {
        res.json(body);
    }

})
let wantee = 'https://api.weather.com/v1/location/VTCC:9:TH/observations/historical.json?apiKey=e1f10a1e78da46f5b10a1e78da96f525&units=m&startDate=20171201&endDate=20171231'

const getdata = () => {
    axios.get(wantee).then(response => {
        // console.log(response.data.observations);
        a = response.data.observations
        a.map(i => {
            temp = i.temp
            humidity = i.rh
            pressure = i.pressure
            visibility = i.vis
            wind_dir = i.wdir_cardinal
            wind_spd = i.wspd
            unix_timestamp = i.valid_time_gmt
            var date = new Date(unix_timestamp * 1000);
            var hours = date.getHours();
            var minutes = "0" + date.getMinutes();


            let sql = `INSERT INTO con_data3(date, hour, minute, temp, humidity ,press,visi,wind_dir,wind_spd)VALUES(
                '${unix_timestamp}', '${hours}','${minutes}','${temp}',${humidity},'${pressure}',${visibility},'${wind_dir}','${wind_spd}')
                `
            tat.query(sql).then(res => {
                console.log("ok insert");
                console.log(date, 'hour =' + hours, minutes, temp);
            })

        })
    });
};



////////api499///////////
app.post('/api/find', function (req, res) {
    let { g } = req.body
    let geomTxt = JSON.stringify(g)
    console.log(g.coordinates)
    let sql = `select ra.*,
    st_distance(st_transform(ra.geom,32647),
    st_transform(ST_geomfromtext('POINT(${g.coordinates[0]} ${g.coordinates[1]})',4326),32647)) as dist 
    from (select r.* from road_cm_1 r
    where ST_DWithin(st_transform(r.geom,32647),
    st_transform(ST_geomfromtext('POINT(${g.coordinates[0]} ${g.coordinates[1]})',4326),32647),100)) as ra 
    order by dist asc
    limit 1`
    tat.query(sql).then(r => {
        res.json({
            status: "insert done",
            data: r.rows

        })
        // console.log(r);
    })
})

app.post('/api/dist', function (req, res) {
    let { g } = req.body
    console.log(g.coordinates)
    let sql = `select st_distance(st_transform(r.geom,32647),
    st_transform(ST_geomfromtext('POINT(${g.coordinates[0]} ${g.coordinates[1]}2)',4326),32647)) as dist 
    from  road_segment r
    order by dist asc
    limit 1`
    tat.query(sql).then(r => {
        res.json({
            status: "insert done",
            data: r.rows

        })
        console.log(r);
    })
})





module.exports = app;