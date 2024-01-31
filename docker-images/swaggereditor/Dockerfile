FROM swaggerapi/swagger-editor:v4.9.2	
	
RUN apk --no-cache add tzdata \
  && cp /usr/share/zoneinfo/Asia/Tokyo /etc/localtime \
  && apk del tzdata
RUN apk update && apk upgrade 
COPY html /usr/share/nginx/html/

#8081に上書き
COPY nginx.conf /etc/nginx/

EXPOSE 8081