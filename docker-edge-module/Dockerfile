FROM alpine:3.4

ENV NGINX_VERSION 1.17.4
ENV DEVEL_KIT_MODULE_VERSION 0.3.1
ENV LUA_MODULE_VERSION 0.10.15
ENV NJS_VERSION 0.3.7
ENV LUA_CJSON_VERSION 2.1.0.7
ENV LUAJIT_LIB=/usr/lib
ENV LUAJIT_INC=/usr/include/luajit-2.0

RUN GPG_KEYS=B0F4253373F8F6F510D42178520A9993A1C052F8 \
	&& CONFIG="\
		--prefix=/etc/nginx \
		--sbin-path=/usr/sbin/nginx \
		--modules-path=/usr/lib/nginx/modules \
		--conf-path=/etc/nginx/nginx.conf \
		--error-log-path=/var/log/nginx/error.log \
		--http-log-path=/var/log/nginx/access.log \
		--pid-path=/var/run/nginx.pid \
		--lock-path=/var/run/nginx.lock \
		--http-client-body-temp-path=/var/cache/nginx/client_temp \
		--http-proxy-temp-path=/var/cache/nginx/proxy_temp \
		--http-fastcgi-temp-path=/var/cache/nginx/fastcgi_temp \
		--http-uwsgi-temp-path=/var/cache/nginx/uwsgi_temp \
		--http-scgi-temp-path=/var/cache/nginx/scgi_temp \
		--user=nginx \
		--group=nginx \
		--with-http_ssl_module \
		--with-http_realip_module \
		--with-http_addition_module \
		--with-http_sub_module \
		--with-http_dav_module \
		--with-http_flv_module \
		--with-http_mp4_module \
		--with-http_gunzip_module \
		--with-http_gzip_static_module \
		--with-http_random_index_module \
		--with-http_secure_link_module \
		--with-http_stub_status_module \
		--with-http_auth_request_module \
		--with-http_xslt_module=dynamic \
		--with-http_image_filter_module=dynamic \
		--with-http_geoip_module \
		--with-http_perl_module=dynamic \
		--with-threads \
		--with-stream \
		--with-stream_ssl_module \
		--with-stream_geoip_module=dynamic \
		--with-http_slice_module \
		--with-mail \
		--with-mail_ssl_module \
		--with-file-aio \
		--with-http_v2_module \
		--with-ipv6 \
		--add-module=/usr/src/ngx_devel_kit-$DEVEL_KIT_MODULE_VERSION \
		--add-module=/usr/src/lua-nginx-module-$LUA_MODULE_VERSION \
		--add-module=/usr/src/njs-$NJS_VERSION/nginx \
	" \
	&& addgroup -S nginx \
	&& adduser -D -S -h /var/cache/nginx -s /sbin/nologin -G nginx nginx \
	&& apk add --no-cache --virtual .build-deps \
		gcc \
		libc-dev \
		make \
		openssl-dev \
		pcre-dev \
		zlib-dev \
		linux-headers \
		curl \
		gnupg \
		libxslt-dev \
		gd-dev \
		geoip-dev \
		perl-dev \
		luajit-dev \
		lua-dev \
	&& curl -fSL http://nginx.org/download/nginx-$NGINX_VERSION.tar.gz -o nginx.tar.gz \
	&& curl -fSL http://nginx.org/download/nginx-$NGINX_VERSION.tar.gz.asc  -o nginx.tar.gz.asc \
	&& curl -fSL https://github.com/simpl/ngx_devel_kit/archive/v$DEVEL_KIT_MODULE_VERSION.tar.gz -o ndk.tar.gz \
	&& curl -fSL https://github.com/openresty/lua-nginx-module/archive/v$LUA_MODULE_VERSION.tar.gz -o lua.tar.gz \
	&& curl -fSL https://github.com/nginx/njs/archive/$NJS_VERSION.tar.gz -o njs-$NJS_VERSION.tar.gz \
	&& curl -fSL https://github.com/openresty/lua-cjson/archive/$LUA_CJSON_VERSION.tar.gz -o lua-cjson-$LUA_CJSON_VERSION.tar.gz  \
	&& export GNUPGHOME="$(mktemp -d)" \
	&& gpg --keyserver ha.pool.sks-keyservers.net --recv-keys "$GPG_KEYS" \
	&& gpg --batch --verify nginx.tar.gz.asc nginx.tar.gz \
	&& rm -r "$GNUPGHOME" nginx.tar.gz.asc \
	&& mkdir -p /usr/src \
	&& tar -zxC /usr/src -f nginx.tar.gz \
	&& tar -zxC /usr/src -f ndk.tar.gz \
	&& tar -zxC /usr/src -f lua.tar.gz \
	&& tar -zxC /usr/src -f njs-$NJS_VERSION.tar.gz \
	&& tar -zxC /usr/src -f lua-cjson-$LUA_CJSON_VERSION.tar.gz \
	&& rm njs-$NJS_VERSION.tar.gz lua-cjson-$LUA_CJSON_VERSION.tar.gz \
	&& rm nginx.tar.gz ndk.tar.gz lua.tar.gz \
	&& cd /usr/src/nginx-$NGINX_VERSION \
	&& ./configure $CONFIG --with-debug \
	&& make -j$(getconf _NPROCESSORS_ONLN) \
	&& mv objs/nginx objs/nginx-debug \
	&& mv objs/ngx_http_xslt_filter_module.so objs/ngx_http_xslt_filter_module-debug.so \
	&& mv objs/ngx_http_image_filter_module.so objs/ngx_http_image_filter_module-debug.so \
	&& mv objs/ngx_http_perl_module.so objs/ngx_http_perl_module-debug.so \
	&& mv objs/ngx_stream_geoip_module.so objs/ngx_stream_geoip_module-debug.so \
	&& ./configure $CONFIG \
	&& make -j$(getconf _NPROCESSORS_ONLN) \
	&& make install \
	&& rm -rf /etc/nginx/html/ \
	&& mkdir /etc/nginx/conf.d/ \
	&& mkdir -p /usr/share/nginx/html/ \
	&& install -m644 html/index.html /usr/share/nginx/html/ \
	&& install -m644 html/50x.html /usr/share/nginx/html/ \
	&& install -m755 objs/nginx-debug /usr/sbin/nginx-debug \
	&& install -m755 objs/ngx_http_xslt_filter_module-debug.so /usr/lib/nginx/modules/ngx_http_xslt_filter_module-debug.so \
	&& install -m755 objs/ngx_http_image_filter_module-debug.so /usr/lib/nginx/modules/ngx_http_image_filter_module-debug.so \
	&& install -m755 objs/ngx_http_perl_module-debug.so /usr/lib/nginx/modules/ngx_http_perl_module-debug.so \
	&& install -m755 objs/ngx_stream_geoip_module-debug.so /usr/lib/nginx/modules/ngx_stream_geoip_module-debug.so \
	&& ln -s ../../usr/lib/nginx/modules /etc/nginx/modules \
	&& strip /usr/sbin/nginx* \
	&& strip /usr/lib/nginx/modules/*.so \
	&& cd /usr/src/lua-cjson-$LUA_CJSON_VERSION \
	&& make \
	&& mkdir /usr/share/nginx/lualib \
	&& cp cjson.so /usr/share/nginx/lualib/ \
	&& rm -rf /usr/src/lua-cjson-$LUA_CJSON_VERSION \
	&& rm -rf /usr/src/njs-$NJS_VERSION \
	&& rm -rf /usr/src/nginx-$NGINX_VERSION \
    && tempDir="$(mktemp -d)" \
	&& curl -fSL https://github.com/openresty/lua-resty-core/archive/v0.1.17.zip -o ${tempDir}/lua-resty-core-0.1.17.zip \
	&& curl -fSL https://github.com/openresty/lua-resty-lrucache/archive/v0.09.zip -o ${tempDir}/lua-resty-lrucache-0.09.zip \
	&& curl -fSL https://github.com/openresty/lua-resty-string/archive/v0.12rc1.zip -o ${tempDir}/lua-resty-string-0.12rc1.zip \
	&& curl -fSL https://github.com/zmartzone/lua-resty-openidc/archive/v1.7.2.zip -o ${tempDir}/lua-resty-openidc-1.7.2.zip \
	&& curl -fSL https://github.com/ledgetech/lua-resty-http/archive/v0.14.zip -o ${tempDir}/lua-resty-http-0.14.zip \
	&& curl -fSL https://github.com/bungle/lua-resty-session/archive/v2.24.zip -o ${tempDir}/lua-resty-session.zip \
	&& curl -fSL https://github.com/iresty/lua-resty-jwt/archive/v0.2.0.zip -o ${tempDir}/lua-resty-jwt-0.20.zip \
	&& curl -fSL https://github.com/jkeys089/lua-resty-hmac/archive/493942b4b82e597bfbd7943e9367e480138e865a.zip -o ${tempDir}/lua-resty-hmac-0.03.zip \
	&& unzip -oq ${tempDir}/lua-resty-core-0.1.17.zip -d ${tempDir} \
	&& unzip -oq ${tempDir}/lua-resty-lrucache-0.09.zip -d ${tempDir} \
	&& unzip -oq ${tempDir}/lua-resty-string-0.12rc1.zip -d ${tempDir} \
	&& unzip -oq ${tempDir}/lua-resty-openidc-1.7.2.zip -d ${tempDir} \
	&& unzip -oq ${tempDir}/lua-resty-http-0.14.zip -d ${tempDir} \
	&& unzip -oq ${tempDir}/lua-resty-session.zip -d ${tempDir} \
	&& unzip -oq ${tempDir}/lua-resty-jwt-0.20.zip -d ${tempDir} \
	&& unzip -oq ${tempDir}/lua-resty-hmac-0.03.zip -d ${tempDir} \
	&& mkdir -p /usr/share/nginx/lualib \
	&& cp -r ${tempDir}/lua-resty-core-0.1.17/lib/* /usr/share/nginx/lualib/ \
	&& cp -r ${tempDir}/lua-resty-lrucache-0.09/lib/* /usr/share/nginx/lualib/ \
	&& cp -r ${tempDir}/lua-resty-string-0.12rc1/lib/* /usr/share/nginx/lualib/ \
	&& cp -r ${tempDir}/lua-resty-openidc-1.7.2/lib/* /usr/share/nginx/lualib/ \
	&& cp -r ${tempDir}/lua-resty-http-0.14/lib/* /usr/share/nginx/lualib/ \
	&& cp -r ${tempDir}/lua-resty-session-2.24/lib/* /usr/share/nginx/lualib/ \
	&& cp -r ${tempDir}/lua-resty-jwt-0.2.0/lib/* /usr/share/nginx/lualib/ \
	&& cp -r ${tempDir}/lua-resty-hmac-493942b4b82e597bfbd7943e9367e480138e865a/lib/* /usr/share/nginx/lualib/ \
	&& rm -rf ${tempDir} \
	\
	# Bring in gettext so we can get `envsubst`, then throw
	# the rest away. To do this, we need to install `gettext`
	# then move `envsubst` out of the way so `gettext` can
	# be deleted completely, then move `envsubst` back.
	&& apk add --no-cache --virtual .gettext gettext \
	&& mv /usr/bin/envsubst /tmp/ \
	\
	&& runDeps="$( \
		scanelf --needed --nobanner /usr/sbin/nginx /usr/lib/nginx/modules/*.so /tmp/envsubst \
			| awk '{ gsub(/,/, "\nso:", $2); print "so:" $2 }' \
			| sort -u \
			| xargs -r apk info --installed \
			| sort -u \
	)" \
	&& apk add --no-cache --virtual .nginx-rundeps $runDeps \
	&& apk del .build-deps \
	&& apk del .gettext \
	&& mv /tmp/envsubst /usr/local/bin/ \
	\
	# forward request and error logs to docker log collector
	&& ln -sf /dev/stdout /var/log/nginx/access.log \
	&& ln -sf /dev/stderr /var/log/nginx/error.log

COPY nginx.conf /etc/nginx/nginx.conf
COPY nginx.vh.default.conf /etc/nginx/conf.d/default.conf

EXPOSE 80 443

CMD ["nginx", "-g", "daemon off;"]
