FROM centos:centos8.3.2011

LABEL version="gbizconnect.20.01"

RUN dnf -y update && \
    dnf -y install yum-utils && \
    dnf clean all

RUN rpm --import https://packages.treasuredata.com/GPG-KEY-td-agent
RUN echo -e "\n\
[treasuredata]\n\
name=TreasureData\n\
baseurl=http://packages.treasuredata.com/3/redhat/\$releasever/\$basearch\n\
gpgcheck=1\n\
gpgkey=https://packages.treasuredata.com/GPG-KEY-td-agent\n\
" > /etc/yum.repos.d/td.repo

RUN dnf install -y td-agent && \
    td-agent-gem install fluent-plugin-secure-forward

ENV LANG="ja_JP.UTF-8" \
    LANGUAGE="ja_JP:ja" \
    TZ=Asia/Tokyo

RUN echo 'alias ll="ls -l"' >> ~/.bashrc
#RUN systemctl enable td-agent
#CMD "/sbin/init"

CMD [ "td-agent", "-c", "/etc/td-agent/td-agent.conf", "--use-v1-config" ]
