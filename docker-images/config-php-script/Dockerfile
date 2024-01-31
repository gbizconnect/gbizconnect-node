FROM php:8.2.6-fpm-alpine3.17

RUN apk add shadow && mkdir -p /var/www/myapp \
  && apk --no-cache add tzdata \
  && cp /usr/share/zoneinfo/Asia/Tokyo /etc/localtime \
  && apk del tzdata
RUN apk update && apk upgrade
COPY ./html/ /var/www/html 
COPY ./conf/php.ini /usr/local/etc/php/php.ini
