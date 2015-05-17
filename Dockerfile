FROM node:0.10

#Install needed packages
RUN apt-get update --fix-missing
RUN apt-get install -y apt-utils openssh-server sudo curl wget nfs-common g++ fontconfig mongodb
#Cleanup to reduce image size
RUN apt-get clean

#Setup app
RUN mkdir -p /srv/ubuntu-appstore
WORKDIR /srv/ubuntu-appstore
RUN npm install supervisor -g

EXPOSE 8080
CMD npm start
