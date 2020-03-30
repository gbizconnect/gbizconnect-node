FROM centos:7

ADD td.repo /etc/yum.repos.d/treasuredata.repo

RUN rpm --import https://packages.treasuredata.com/GPG-KEY-td-agent && \
    yum -q -y install --enablerepo=treasuredata td-agent && \
    yum update -q -y \
    nss-tools \
    nss-util \
    nss-softokn-freebl \
    nss-softokn \
    nss \
    bind \
    bind-libs \
    bind-utils \
    openldap \
    libuser \
    pam \
    libssh2 \
    libxml2 \
    openssl \
    sqlite && \
    yum clean all

CMD [ "td-agent", "-c", "/etc/td-agent/td-agent.conf", "--use-v1-config" ]
