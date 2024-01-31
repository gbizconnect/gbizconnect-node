FROM nginx:1.24.0-alpine3.17

RUN apk --no-cache add tzdata \
  && cp /usr/share/zoneinfo/Asia/Tokyo /etc/localtime \
  && apk del tzdata 

RUN apk update && apk upgrade 

COPY nginx /etc/nginx/
