FROM swaggerapi/swagger-ui:v4.19.0

RUN apk --no-cache add tzdata \
  && cp /usr/share/zoneinfo/Asia/Tokyo /etc/localtime \
  && apk del tzdata 
RUN apk update && apk upgrade 

COPY html /usr/share/nginx/html
