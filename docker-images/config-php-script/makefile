NAME	= config-php-script
IMAGE	= gbizconnect/gbizconnect-node-config-php-script
VERSION	= v1.0.5

# make build
construct: build

build:
	docker build -t $(IMAGE):$(VERSION) . 

run:
	docker run --init --name $(NAME) -itd $(IMAGE):$(VERSION)

restart:
	docker restart $(NAME)

start:
	docker start $(NAME)

stop:
	docker stop $(NAME)

attach:
	docker exec -it $(NAME) /bin/sh

rm:
	docker rm -f $(NAME)

rmi:
	docker rmi $(image);\

# for debug
inspect: 
	docker inspect $(NAME)

top:
	docker top $(NAME)

logs:
	docker logs -f $(NAME)
