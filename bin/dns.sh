set_debug cp $NODE_HOME/edge-module/nginx/conf.d/resolver.conf \
$NODE_HOME/edge-module/nginx/conf.d/resolver.conf_bk
status=$?
if [ $status != 0 ] ; then
    err "resolver.confのバックアップに失敗しました。" $status
    exit 1
fi

set_debug_redirect_command_string echo "resolver ${dns} ipv6=off;" $NODE_HOME/edge-module/nginx/conf.d/resolver.conf
status=$?
if [ $status != 0 ] ; then
    err "DNSの設定に失敗しました。" $status
    exit 1
fi