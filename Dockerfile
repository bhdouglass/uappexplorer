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
ENV ALLOWED_DOMAINS=appstore.bhdouglass.com,local.appstore.bhdouglass.com,localhost,127.0.0.1
ENV PRERENDER_SERVICE_URL=http://127.0.0.1:3000
CMD npm start
