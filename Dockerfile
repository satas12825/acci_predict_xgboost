FROM ubuntu:latest
WORKDIR /mnt/
RUN apt update && DEBIAN_FRONTEND="noninteractive" TZ="Asia/Bangkok" apt-get install -y tzdata
RUN apt update && apt install -y software-properties-common
RUN add-apt-repository ppa:deadsnakes/ppa
RUN apt update && apt install -y python3 python3-pip
RUN pip install numpy
RUN pip install Flask
RUN apt update && add-apt-repository ppa:ubuntugis/ppa
RUN apt update && apt install -y otb-bin otb-bin-qt
RUN apt update && apt install -y libpq-dev gdal-bin libgdal-dev
RUN apt update && apt install python3-gdal
RUN export CPLUS_INCLUDE_PATH=/usr/include/gdal
RUN export C_INCLUDE_PATH=/usr/include/gdal
RUN pip install GDAL
RUN pip install -U flask-cors
RUN apt update && apt -y install nodejs
RUN apt update && apt -y install npm
RUN npm i -g nodemon
RUN npm i -g pm2

# install postgres
RUN apt -y install postgresql postgresql-contrib
RUN apt -y install postgis