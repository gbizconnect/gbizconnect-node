#! /bin/bash
#
USER=
PASSWD=
printf "$USER:$(openssl passwd -crypt $PASSWD)\n" > .htpasswd
#