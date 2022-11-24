FROM node:18.7.0-alpine3.16

RUN npm install -g json-server


WORKDIR /data
VOLUME /data

EXPOSE 3000
COPY run.sh /run.sh
COPY /data /data

ENTRYPOINT ["sh", "/run.sh"]
CMD []

