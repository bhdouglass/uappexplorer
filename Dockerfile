FROM ubuntu:trusty

RUN apt-get update --fix-missing && \
    apt-get install -y nodejs npm curl wget g++ mongodb && \
    apt-get clean

RUN ln -s `which nodejs` /usr/bin/node

RUN mkdir -p /srv/uappexplorer
WORKDIR /srv/uappexplorer
RUN npm install supervisor -g

EXPOSE 8080
CMD npm start
