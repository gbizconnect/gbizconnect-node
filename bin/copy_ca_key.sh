#!/bin/bash

# サーバ証明書ファイルの存在チェック
if [ ! -e $certificate ]; then
    err "サーバ証明書${certificate}は存在しません。"
exit 1
fi
# CA（認証局）が発行したサーバ証明書（PEM形式)
set_debug cp $certificate $NODE_HOME/edge-module/nginx/ssl/server.crt
status=$?
if [ $status != 0 ] ; then
    err "サーバ証明書${certificate}のコピーが出来ませんでした。" $status
    exit 1
fi
out "サーバ証明書を読み込みました"

# 秘密鍵（PEM形式）
if [ ! -e $private_key ]; then
    err "秘密鍵${private-key}は存在しません。"
    exit 1
fi
set_debug cp $private_key $NODE_HOME/edge-module/nginx/ssl/private.key
status=$?
if [ $status != 0 ] ; then
    err "秘密鍵${private_key}をコピー出来ませんでした。" $status
    exit 1
fi
out "秘密鍵を読み込みました。"
