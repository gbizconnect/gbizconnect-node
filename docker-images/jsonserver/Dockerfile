FROM node:18.18.2-alpine3.17

RUN npm install -g json-server@v0.17.4 \
  && apk --no-cache add tzdata \
  && cp /usr/share/zoneinfo/Asia/Tokyo /etc/localtime \
  && apk del tzdata

RUN apk update && apk upgrade 

WORKDIR /data
VOLUME /data

EXPOSE 3000
COPY run.sh /run.sh
COPY /data /data

ENTRYPOINT ["sh", "/run.sh"]
CMD []

