FROM registry.access.redhat.com/ubi8/ubi-minimal:8.5-230

LABEL version="gbizconnect.22.01"

RUN microdnf -y update && \
    microdnf -y install yum-utils && \
    microdnf clean all

RUN rpm --import https://packages.treasuredata.com/GPG-KEY-td-agent
RUN echo -e "\n\
[treasuredata]\n\
name=TreasureData\n\
baseurl=http://packages.treasuredata.com/3/redhat/\$releasever/\$basearch\n\
gpgcheck=1\n\
gpgkey=https://packages.treasuredata.com/GPG-KEY-td-agent\n\
" > /etc/yum.repos.d/td.repo

RUN microdnf install -y td-agent && \
    td-agent-gem install fluent-plugin-secure-forward

ENV LANG="ja_JP.UTF-8" \
    LANGUAGE="ja_JP:ja" \
    TZ=Asia/Tokyo

RUN echo 'alias ll="ls -l"' >> ~/.bashrc
#RUN systemctl enable td-agent
#CMD "/sbin/init"

CMD [ "td-agent", "-c", "/etc/td-agent/td-agent.conf", "--use-v1-config" ]
