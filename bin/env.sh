#Nodeの環境変数の設定
set_debug_redirect_command_string echo "NODE_DOMAIN=${fqdn}" .env
status=$?
if [ $status != 0 ] ; then
    err "ドメインを.envに書き込めませんでした。" $status
    exit 1
fi
set_debug_redirect_command_string_append echo "NODE_PORT=${port}" .env
status=$?
if [ $status != 0 ] ; then
    err "ポートを.envに書き込めませんでした。" $status
    exit 1
fi
set_debug_redirect_command_string_append echo "gBizConnect_UID=`id -u`" .env
status=$?
if [ $status != 0 ] ; then
    err "ファイル権限ユーザUIDを.envに書き込めませんでした。" $status
    exit 1
fi
set_debug_redirect_command_string_append echo "gBizConnect_GID=`id -g`" .env
status=$?
if [ $status != 0 ] ; then
    err "ファイル権限ユーザGIDを.envに書き込めませんでした。" $status
    exit 1
fi
out "nodeの環境変数設定を行いました。"