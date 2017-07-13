FROM node:6.11
MAINTAINER Brian Douglass

RUN apt-get install -y libstdc++6
RUN npm install supervisor gulp -g

ADD run.sh /usr/local/bin/run
RUN chmod +x /usr/local/bin/run

EXPOSE 8080
CMD run
