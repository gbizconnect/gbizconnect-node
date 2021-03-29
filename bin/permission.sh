out "ファイルの権限を変更します。"

set_debug chmod -R 600 $NODE_HOME/permanent/config.json
status=$?
if [ $status != 0 ] ; then
    err "${NODE_HOME}/permanent/config.jsonの権限変更が出来ませんでした。" $status
    exit 1
fi

set_debug chmod -R 600 $NODE_HOME/edge-module/nginx/ssl/private.key
status=$?
if [ $status != 0 ] ; then
    err "${NODE_HOME}/edge-module/nginx/ssl/private.keyの権限変更が出来ませんでした。" $status
    exit 1
fi

set_debug chmod -R 600 $NODE_HOME/edge-module/nginx/ssl/server.crt
status=$?
if [ $status != 0 ] ; then
    err "${NODE_HOME}/edge-module/nginx/ssl/server.crtの権限変更が出来ませんでした。" $status
    exit 1
fi

out "ファイルの権限を変更しました。"