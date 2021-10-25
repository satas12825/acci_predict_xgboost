from flask import Flask, request, jsonify
import joblib
import traceback
import pandas as pd
import numpy as np
import pickle
import xgboost
from flask_cors import CORS

# Your API definition
app = Flask(__name__)

CORS(app)


@app.route('/testapi', methods=['GET'])
def test():
    return jsonify({'tatus': "success 3002"})


@app.route('/predict', methods=['POST'])
def predict():

    json_ = request.get_json(force=True)
    road_type = json_["roadtype"]
    surface = json_["surface"]
    lane = json_["lane"]
    oneway = json_["oneway"]
    speed = json_["speed"]
    width = json_["width"]
    distance = json_["distance"]
    rain = json_["rain"]
    humidity = json_["humidity"]
    temp = json_["temp"]
    press = json_["pressure"]
    wind_speed = json_["wind_spd"]
    hour = json_["hour"]

    print(road_type, surface, lane, oneway, speed, width,
          distance, rain, humidity, temp, press, wind_speed, hour)

    import os

    if os.path.exists("demofile3.csv"):
        os.remove("demofile3.csv")
    else:
        print("The file does not exist")

    f = open("demofile3.csv", "a")
    filed = 'distance,rain,temp,wind_spd,Speed,WIDTH,humidity,pressure,ROAD_TYPE_1,ROAD_TYPE_2,ROAD_TYPE_3,ROAD_TYPE_5,ROAD_TYPE_6,ROAD_TYPE_7,ROAD_TYPE_9,SURFACE_1,SURFACE_2,SURFACE_3,SURFACE_9,ONEWAY_0,ONEWAY_1,LANE_1,LANE_2,LANE_3,LANE_4,LANE_6,hour_0,hour_1,hour_2,hour_3,hour_4,hour_5,hour_6,hour_7,hour_8,hour_9,hour_10,hour_11,hour_12,hour_13,hour_14,hour_15,hour_16,hour_17,hour_18,hour_19,hour_20,hour_21,hour_22,hour_23'

    lane2 = ''
    if int(lane) == 1:
        lane2 = '1,0,0,0,0'
    elif int(lane) == 2:
        lane2 = '0,1,0,0,0'
    elif int(lane) == 3:
        lane2 = '0,0,1,0,0'
    elif int(lane) == 4:
        lane2 = '0,0,0,1,0'
    elif int(lane) == 6:
        lane2 = '0,0,0,0,1'

    road_type2 = ''
    if int(road_type) == 1:
        road_type2 = '1,0,0,0,0,0,0'
    elif int(road_type) == 2:
        road_type2 = '0,1,0,0,0,0,0'
    elif int(road_type) == 3:
        road_type2 = '0,0,1,0,0,0,0'
    elif int(road_type) == 5:
        road_type2 = '0,0,0,1,0,0,0'
    elif int(road_type) == 6:
        road_type2 = '0,0,0,0,1,0,0'
    elif int(road_type) == 7:
        road_type2 = '0,0,0,0,0,1,0'
    elif int(road_type) == 9:
        road_type2 = '0,0,0,0,0,0,1'

    surface2 = ''
    if int(surface) == 1:
        surface2 = '1,0,0,0'
    elif int(surface) == 2:
        surface2 = '0,1,0,0'
    elif int(surface) == 3:
        surface2 = '0,0,1,0'
    elif int(surface) == 9:
        surface2 = '0,0,0,1'

    oneway2 = ''
    if int(oneway) == 0:
        oneway2 = '1,0'
    elif int(oneway) == 1:
        oneway2 = '0,1'

    hour2 = ''
    if int(hour) == 0:
        hour2 = '1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0'
    elif int(hour) == 1:
        hour2 = '0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0'
    elif int(hour) == 2:
        hour2 = '0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0'
    elif int(hour) == 3:
        hour2 = '0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0'
    elif int(hour) == 4:
        hour2 = '0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0'
    elif int(hour) == 5:
        hour2 = '0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0'
    elif int(hour) == 6:
        hour2 = '0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0'
    elif int(hour) == 7:
        hour2 = '0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0'
    elif int(hour) == 8:
        hour2 = '0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0'
    elif int(hour) == 9:
        hour2 = '0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0,0'
    elif int(hour) == 10:
        hour2 = '0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0,0'
    elif int(hour) == 11:
        hour2 = '0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0,0'
    elif int(hour) == 12:
        hour2 = '0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0,0'
    elif int(hour) == 13:
        hour2 = '0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0,0'
    elif int(hour) == 14:
        hour2 = '0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0,0'
    elif int(hour) == 15:
        hour2 = '0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0,0'
    elif int(hour) == 16:
        hour2 = '0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0,0'
    elif int(hour) == 17:
        hour2 = '0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0,0'
    elif int(hour) == 18:
        hour2 = '0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0,0'
    elif int(hour) == 19:
        hour2 = '0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0,0'
    elif int(hour) == 20:
        hour2 = '0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0,0'
    elif int(hour) == 21:
        hour2 = '0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0,0'
    elif int(hour) == 22:
        hour2 = '0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1,0'
    elif int(hour) == 23:
        hour2 = '0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,0,1'

    f.write(filed)
    f.write(f"\n{distance},{rain},{temp},{wind_speed},{speed},{width},{humidity},{press},{road_type2},{surface2},{oneway2},{lane2},{hour2}")
    f.close()

    dataset = r"demofile3.csv"
    df = pd.read_csv(dataset)
    df = df.dropna(how='any', axis=0)
    feature_names = df.columns.tolist()
    feature_sel = range(len(feature_names))
    fnames = np.array(feature_names)[feature_sel]
    X = df.values
    ddata = xgboost.DMatrix(X, feature_names=fnames)
    model = joblib.load('accmodel.joblib')
    a = model.predict(ddata)
    b = float(a)
    print(b, a)

    return jsonify({'prediction': b})


# if __name__ == '__main__':
#     port = 3002

#     app.run(port=port, debug=True)
if __name__ == '__main__':
    app.run(host="0.0.0.0", port=3002)
