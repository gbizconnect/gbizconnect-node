out "Basic認証に使用する設定を行います。"

#USER：
while :
do
    read -p "USER: " USER
    if [ -z "$USER" ] ; then
    #ユーザ名が入力されなかった場合
        out "ユーザ名を一文字以上入力してください。"
        continue
    fi
    if [ `echo $USER|grep :` ]; then
    #使用出来ない文字(:)が含まれている場合
        out 'ユーザ名に":"は使えません。'
        continue
    fi
    if [ ${#USER} -gt 255 ]; then
        out "255文字以下で設定してください。"
        continue
    fi
    break
done
echo ""

#PASSWORD：
while :
do
    read -sp "Password: " PASSWD
    if [ -z "$PASSWD" ] ; then
    #パスワードが入力されなかった場合
        out "パスワードを一文字以上入力してください。"
        continue
    fi
    if [ ${#PASSWD} -gt 8 ]; then
        out "8文字以下で設定してください。"
        continue
    fi
    break
done
echo ""

set_debug_redirect_command_string printf "$USER:$(openssl passwd -crypt $PASSWD)\n" $NODE_HOME/edge-module/nginx/.htpasswd
status=$?
if [ $status != 0 ] ; then
#.htpasswdファイルが出力できない場合
    err ".htpasswdファイルが出力出来ませんでした。" $status
    exit 1
fi
out ".htpasswdファイルが出力されました。"