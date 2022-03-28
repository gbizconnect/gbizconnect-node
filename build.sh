#!/bin/bash
 
#ダウンロードファイルのリネーム（プロジェクト名）
DEFAULT_RENAME="node"
#ログファイル名
ERROR_LOG_NAME="error.log"

# スクリプトの絶対パスの取得
SCRIPT_DIR=$(cd $(dirname $0); pwd)
cd $SCRIPT_DIR
 
######################
### helpの表示
######################
function usage {
    cat <<EOM
usage: $(basename "$0") [option]...
--help Helpの表示
--project-name VALUE Dockerコンテナのプロジェクト名を指定。既存のプロジェクト名は指定不可
EOM
    exit 0
}

function out {
    echo "$(date +'%Y/%m/%d %H:%M:%S') [notice]: $1 `[[ -n $2 ]] && echo ${SHOW_STATUS}$2`" >&1
}

#終了ステータスの表記
SHOW_STATUS="return_code="
function err {
    echo "$(date +'%Y/%m/%d %H:%M:%S') [error]: $1 `[[ -n $2 ]] && echo ${SHOW_STATUS}$2`" >&2
}

#ログ出力関連
#ログファイル存在チェック
if [ ! -e ../$ERROR_LOG_NAME ]; then
    err "error.logが存在しません。build.shの実行前にinstall.shを実行してください。"
    exit 1
fi

#シェル名+シェルを実行した際のコマンドライン引数を表示
echo $(date +'%Y/%m/%d %H:%M:%S') $0 $*>>"../$ERROR_LOG_NAME"

#コンソールに出力されたものを、ログに出力
exec 2> >(tee -a ../$ERROR_LOG_NAME) 1>&2

#オプションの取得
while getopts h-: opt; do
    optarg="${!OPTIND}"
    [[ "$opt" = - ]] && opt="-$OPTARG"
 
    case "-$opt" in
        --project-name)
            nodeDir=$optarg
            shift;;
        -h|--help)
            usage
            break;;
    esac
done
 
if [ -z $nodeDir ]; then
    nodeDir=$DEFAULT_RENAME
fi
 
#コンフリクトチェック
containers=(`docker ps -a --format "{{.Names}}"`)
i=0
for container in ${containers[@]}; do
    projectname=`echo $container |  awk -F'_' '{print $1}'`
     if [ $projectname = "$nodeDir" ]; then
        err "--project-nameオプションで、${nodeDir}以外の値を指定してください"
        exit 1
    fi
done
 
#cd $DEFAULT_RENAME
if [ $? -gt 0 ] ; then
    err "${DEFAULT_RENAME}ディレクトリの権限が無い、もしくは存在しません。"
    exit 1
fi


docker-compose -p "${nodeDir}" up -d --no-recreate
docker-compose -p "${nodeDir}" ps