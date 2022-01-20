#!/bin/bash
# スクリプトの絶対パスの取得
SCRIPT_DIR=$(cd $(dirname $0); pwd)
cd $SCRIPT_DIR

#Dockerコンテナにマウントするディレクトリ・ファイルのダウンロードURL
URL="https://github.com/gbizconnect/gbizconnect-node/archive/master.tar.gz"
#ダウンロードtarファイル名
TAR_FILE_NAME="master.tar.gz"
#展開後のディレクトリ名
EXTRACT_DIR_NAME="gbizconnect-node-master"
#ダウンロードファイルのリネーム（プロジェクト名）
DEFAULT_RENAME="node"
#ログファイル名
ERROR_LOG_NAME="error.log"

######################
### helpの表示
######################
function usage {
    cat << EOS
使用法:
$(basename "$0") --fqdn arg --certificate arg -- private-key arg [option]...
--fqdn VALUE gBizConnect Nodeのドメイン
--certificate PATH CA（認証局）が発行したサーバ証明書（PEM形式)
--private-key PATH 秘密鍵（PEM形式）パスフレーズ付きは使用できません。
--dns VALUE DNSのアドレス

オプション:
--proxy [PROTOCOL://]HOST[:PORT] 使用するプロキシ
--help Helpの表示
--port VALUE gBizConnect Nodeのポート
EOS
}

#コンソールへの各種出力
#標準出力
function out {
    echo "$(date +'%Y/%m/%d %H:%M:%S') [notice]: $1 `[[ -n $2 ]] && echo ${SHOW_STATUS}$2`" >&1
}

#エラー出力
#終了ステータスの表記
SHOW_STATUS="return_code="
function err {
    echo "$(date +'%Y/%m/%d %H:%M:%S') [error]: $1 `[[ -n $2 ]] && echo ${SHOW_STATUS}$2`" >&2
}

#警告
function warn {
    echo "$(date +'%Y/%m/%d %H:%M:%S') [warn]: $1 `[[ -n $2 ]] && echo ${SHOW_STATUS}$2`" >&2
}

#コマンドをコンソールに出力・実行
function set_debug {
    out "$*"
    $*
    return $?
}

#curlコマンドをコンソールに出力・実行
function set_debug_curl {
    if [ -z $5 ]; then
        out "$1 $2 $3"
        $($1 "$2" -LO)
    else
        out "$1 $2 $3 $4 $5"
        $(curl "$2" -LO -x "$5")
    fi
    return $?
}

#文字列を含むリダイレクトをコンソールに出力・実行
function set_debug_redirect_command_string {
    out "$1 $2 >$3"
    $($1 "$2" >$3)
    return $?
}

function set_debug_redirect_command_string_append {
    out "$1 $2 >>$3"
    $($1 "$2" >>$3)
    return $?
}

#シェル起動前チェック
id_commands=`id -u`
if [ $id_commands = 0 ]; then
    err "シェルの実行ユーザはroot(0)以外を指定してください。"
    err "# id"
    id
    exit 1
fi

#ログ出力関連
#ログファイル存在チェック
if [ ! -e $ERROR_LOG_NAME ]; then
    touch "$ERROR_LOG_NAME"
fi

#シェル名+シェルを実行した際のコマンドライン引数を表示
echo $(date +'%Y/%m/%d %H:%M:%S') $0 $*>>"$ERROR_LOG_NAME"
status=$?
if [ $status != 0 ]; then
    err "$(pwd)/${ERROR_LOG_NAME}にログを出力出来ませんでした。" $status
    exit 1
    echo "after exit"
fi

#コンソールに出力されたものを、ログに出力
exec 2> >(tee -a $ERROR_LOG_NAME) 1>&2

while getopts h-: opt; do
    optarg="${!OPTIND}"
    [[ "$opt" = - ]] && opt="-$OPTARG"

    case "-$opt" in
        --fqdn)
            fqdn=$optarg
            shift;;
        --port)
            port=$optarg
            shift;;
        --certificate)
            certificate=$optarg
            shift;;
        --private-key)
            private_key=$optarg
            shift;;
        --proxy)
            proxy=$optarg
            shift;;
        --dns)
            dns=$optarg
            shift;;
        -h|--help)
            usage &
            wait
            exit 0
            break;;
    esac
done
flag=0
if [ -z $fqdn ]; then
    err "ドメインが指定されていません --fqdn VALUE"
    flag=1
fi
#portは指定しなければデフォルトで443
if [ -z $port ]; then
    port="443"
fi
if [ -z $certificate ]; then
    err "CA（認証局）が発行したサーバ証明書 が指定されていません。--certificate PATH"
    flag=1
fi
if [ -z $private_key ]; then
    err "秘密鍵が指定されていません。 --private-key PATH"
    flag=1
fi

if [ -z $dns ]; then
    err "DNSが指定されていません。 --dns VALUE"
    flag=1
fi

if [ $flag != 0 ]; then
    exit 1
fi

if [ ! -e $DEFAULT_RENAME ]; then
    #Dockerコンテナにマウントするディレクトリ・ファイルのダウンロード
    if [ ! -e $TAR_FILE_NAME ]; then
        if [ -n "$proxy" ]; then
            set_debug_curl curl $URL -LO -x $proxy
        else
            set_debug_curl curl $URL -LO
        fi
        status=$?
        if [ $status != 0 ]; then
            err "Dockerコンテナにマウントするディレクトリ・ファイルのダウンロードが出来ませんでした。" $status
            exit 1
        fi
        out "Dockerコンテナにマウントするディレクトリ・ファイルをダウンロードしました。"
    else
        warn "Dockerコンテナにマウントするディレクトリ・ファイルのダウンロードをスキップしました。"
    fi

    #Nodeファイルの展開
    if [ ! -e $EXTRACT_DIR_NAME ]; then 
        set_debug tar -zxf $TAR_FILE_NAME
        status=$?
        if [ $status != 0 ] ; then
            err "ファイルの展開が出来ませんでした。" $status
            exit 1
        fi
        #set_debug rm $TAR_FILE_NAME
        out "ファイルを展開しました。"
    else
        err "${EXTRACT_DIR_NAME}が既に存在します。一時ファイルの作成が出来ませんでした。${EXTRACT_DIR_NAME}を削除して、再度インストールシェルを実行してください。"
        exit 1
    fi

    #新しいフォルダへの移動
    set_debug mv "$EXTRACT_DIR_NAME" "$DEFAULT_RENAME"
    status=$?
    if [ $status != 0 ] ; then
        err "ディレクトリ'${DEFAULT_RENAME}'の作成が出来ませんでした。${DEFAULT_RENAME}ディレクトリを削除してください。" $status
        exit 1
    fi
fi

cd $DEFAULT_RENAME
#現在のパスを取得
NODE_HOME=`pwd`

. ./bin/copy_ca_key.sh
. ./bin/basic.sh
. ./bin/permission.sh
. ./bin/env.sh
. ./bin/dns.sh

out "sudo bash ${SCRIPT_DIR}/${DEFAULT_RENAME}/build.sh [--project-name arg] 入力して、コンテナを立ち上げてください。"