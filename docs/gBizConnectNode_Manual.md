# gBizConnect Node 導入マニュアル  

## 1. はじめに
　本マニュアルは、gBizConnect Nodeの導入手順について説明したものです。<br>gBizConnect Nodeの仕様については、「[gBizConnect Node仕様書](https://github.com/gbizconnect/gbizconnect-node/blob/master/docs/gBizConnectNode.md)」を参照してください。

### 1.1.導入の全体の流れ

　gBizConnect Nodeの導入、全体の流れを下記に示します。

<div align="center">
<img src="img/dounyu_flow.png" alt="全体の流れ図" title="全体の流れ図">

 図1-1-1 全体の流れ図
</div>

### 1.2.事前準備
　gBizConnect Nodeの導入に必要なものを下記に示します。

* 事前に用意が必要なもの　<br>(関連：「[2.gBizConnect Nodeの導入・起動](#2gBizConnect-Nodeの導入・起動)」)
    * CA（認証局）が発行したサーバ証明書（PEM形式）
    * サーバ証明書の秘密鍵（PEM形式）

* 事前に準備が必要な設定
    * 全員が必要な準備　<br>(関連：「[3.gBizConnect Nodeの疎通確認](#3gBizConnect-Nodeの疎通確認)」)
     * 外部接続のネットワーク・セキュリティの設定
     * 1.5.事前に必要な設定

    * データ要求者が必要な準備　<br>(関連：「[5.データ要求者 gBizConnect Nodeのシステム間連携の設定](#5データ要求者-gBizConnect-Nodeのシステム間連携の設定)」)
     * データ要求システムの準備
     * gBizID

    * データ提供者が必要な準備　<br>(関連：「[6.データ提供者 gBizConnect Nodeのシステム間連携の設定](#6データ提供者-gBizConnect-Nodeのシステム間連携の設定)」)
     * 提供APIの準備

### 1.3.用語の解説

　用語の定義については、「[gBizConnect Node仕様書：1.1. 用語説明](https://github.com/gbizconnect/gbizconnect-node/blob/master/docs/gBizConnectNode.md#11-用語説明)」を参照してください。

### 1.4.推奨環境

　gBizConnect Nodeを動作させるために、DockerとDocker Composeを導入してください。以降の導入手順については推奨環境を前提に作成しています。

<div align="center">

表1-4-1　推奨環境

</div>

|　|バージョン|
|:-|:-|
|Docker Server (Engine)|19.03.13|
|Docker Client|19.03.13|
|Docker Compose|1.27.4|
|OS|DockerをサポートするOS<br>(Ubuntu 20.04.1 動作確認済み)|
|アーキテクチャ|x86_64 / amd64|


<div align="center">

表1-4-2　推奨スペック

</div>

|　|バージョン|
|:-|:-|
|CPU|8コア|
|メモリ|16GB|

※推奨環境は、gBizConnect運営事務局にて、動作を確認したgBizConnect NodeのバージョンとDockerバージョンの組み合わせになります。<br>
※マニュアルに記載していない環境(バージョン、組み合わせ)は動作保証対象外です。<br>
※gBizConnect Nodeのマイナーバージョンアップは原則後方互換です。<br>
※gBizConnect Nodeのバージョンの考え方は以下の通りとします。<br>
　バージョンナンバーは、メジャー.マイナー.パッチ とする。<br>
　APIの変更に互換性のない場合はメジャーバージョンを上げます。<br>
　後方互換性があり機能性を追加した場合はマイナーバージョン上げます。<br>
　後方互換性を伴うバグ修正をした場合はパッチバージョンを上げます。<br>

### 1.5.事前に必要な設定
#### 1.5.1.名前解決の設定

　gBizConnect Nodeを導入するサーバのホスト名は名前解決できるようにDNSを設定してください。<br>
　※設定しない場合、「[5.データ要求者 gBizConnect Nodeのシステム間連携の設定](#5データ要求者-gBizConnect-Nodeのシステム間連携の設定)」、「[6.データ提供者 gBizConnect Nodeのシステム間連携の設定](#6データ提供者-gBizConnect-Nodeのシステム間連携の設定)」の手順が、実施できない可能性があります。

#### 1.5.2.Dockerのインストール

　下記のURLのOSごとの手順を参照してDockerをインストールしてください。  
　https://docs.docker.com/install/

#### 1.5.3.Docker Composeのインストール

　下記のURLのOSごとの手順を参照してDocker Composeをインストールしてください。  
　https://docs.docker.com/compose/install/

※Docker Composeを使用しない場合、「[2.1.gBizConnect Node導入設定のシェルスクリプト実行](#21gBizConnect-Node導入設定のシェルスクリプト実行)」が実行できません。<br>

### 1.6.各コンテナの説明

　gBizConnect Nodeの各コンテナの説明を下記に示す。

</div>

<div align="center">

表1-6-1　各コンテナの説明

</div>

|コンテナ名|説明|
|:-|:-|
|node_edge-module_1|データ連携機能|
|node_config-nginx-php_1|Node設定ファイル設定用の画面|
|node_swaggereditor_1|API仕様定義機能|
|node_config-php-script_1|Node設定機能（Node設定ファイル取込）|
|node_td-agent_1|ログ転送機能|
|node_jsonserver_1|API仕様公開を実施する、サンプルデータサーバ|
|node_swaggerui_1|API仕様公開機能|

</div>

## 2.gBizConnect Nodeの導入・起動

### 2.1.gBizConnect Node導入設定のシェルスクリプト実行

　gBizConnect Node導入設定用のシェルスクリプト実行の流れを下記に示します。

(1)gBizConnect Nodeの導入に必要な証明書を、下記の名前で任意の場所に配置します。

<div align="center">

表2-1　証明書の名称

</div>

|証明書|証明書のファイル名|
|:-|:-|
|CA（認証局）が発行したサーバ証明書（PEM形式）|server.crt|
|サーバ証明書の秘密鍵（PEM形式）|private.key|  

(2)下記のコマンドで、gBizConnect Nodeの導入設定のシェルスクリプトをダウンロードします。

〇コマンド

```
$ curl https://raw.githubusercontent.com/gbizconnect/gbizconnect-node/master/install.sh -O
```

(3)取得したシェルスクリプト(install.sh)を下記のコマンドで実行します。

〇install.shの実行内容
  * gBizConnect Node導入に必要な資材をGitHubから取得
  * 証明書を資材の中に配置
  * 資材の各種フォルダの権限設定変更
  * gBizConnect Node環境変数設定
  * ホストにgBizConnect Nodeを認識してもらうためのDNS設定

〇コマンド例

```
$ bash install.sh \
--fqdn node.example.jp \
--certificate opt/node/example/server.crt \
--private-key opt/node/example/private.key \
--dns 10.00.00.00
```

〇コマンド例の書き換え箇所
  * node.example.jp ：gBizConnect Nodeを導入したマシンのホスト名
  * opt/node/example/server.crt ：(1)でCA（認証局）が発行したサーバ証明書を配置した任意のディレクトリ
  * opt/node/example/private.key ：(1)でサーバ証明書の秘密鍵（PEM形式）を配置した任意のディレクトリ
  * 10.00.00.00 ：DNSサーバの IP アドレス

※「--help」もしくは[-h]オプションをつけることで、パラメータについての説明を表示することができます。

〇結果

```
YYYY/MM/DD HH:MM:SS [notice]: sudo bash /home/ubuntu/node/build.sh [--project-name arg] 入力して、コンテナを立ち上げてください。
```

(4)(3)が正常に実行出来たら、gBizConnect Nodeを起動するため、nodeディレクトリに含まれるbuild.shを実行する。

〇build.shの実行内容
  * gBizConnect Nodeのコンテナの作成・起動

〇コマンド

```
$sudo bash /home/ubuntu/node/build.sh
```

〇結果

```
(略)
Network node_edge-network  Creating
Network node_edge-network  Created
Container node-swaggereditor-1  Creating
Container node-jsonserver-1  Creating
Container node-config-php-script-1  Creating
Container node-td-agent-1  Creating
Container node-swaggerui-1  Creating
Container node-config-php-script-1  Created
Container node-config-nginx-php-1  Creating
Container node-td-agent-1  Created
Container node-swaggerui-1  Created
Container node-jsonserver-1  Created
Container node-swaggereditor-1  Created
Container node-edge-module-1  Creating
Container node-config-nginx-php-1  Created
Container node-edge-module-1  Created
Container node-swaggerui-1  Starting
Container node-swaggereditor-1  Starting
Container node-config-php-script-1  Starting
Container node-td-agent-1  Starting
Container node-jsonserver-1  Starting
Container node-swaggerui-1  Started
Container node-swaggereditor-1  Started
Container node-edge-module-1  Starting
Container node-config-php-script-1  Started
Container node-config-nginx-php-1  Starting
Container node-td-agent-1  Started
Container node-jsonserver-1  Started
Container node-edge-module-1  Started
Container node-config-nginx-php-1  Started
NAME                       COMMAND                  SERVICE             STATUS              PORTS
node-config-nginx-php-1    "/docker-entrypoint.…"   config-nginx-php    running             0.0.0.0:8080->8080/tcp, :::8080->8080/tcp
node-config-php-script-1   "docker-php-entrypoi…"   config-php-script   running             9000/tcp
node-edge-module-1         "/bin/sh -c 'usermod…"   edge-module         running             0.0.0.0:443->443/tcp, :::443->443/tcp
node-jsonserver-1          "sh /run.sh -r route…"   jsonserver          running             3000/tcp
node-swaggereditor-1       "/docker-entrypoint.…"   swaggereditor       running             8080-8081/tcp
node-swaggerui-1           "/docker-entrypoint.…"   swaggerui           running             8080/tcp
node-td-agent-1            "td-agent -c /etc/td…"   td-agent            running             0.0.0.0:24224->24224/tcp, :::24224->24224/tcp
```

※結果の後半の「State」 「Up」になっていればコンテナが正常に起動しています。

## 3.gBizConnect Nodeの疎通確認

### 3.1.導入したgBizConnect Nodeの疎通確認

(1)下記のコマンドを実行し、下記の結果が表示されることを確認します。

〇コマンド例

```
curl https://localhost/communication/status
```

〇結果

```
{
        "message": "認可サーバへアクセスできています。Ｇビズコネクトポータルからダウンロードしたノード設定ファイルをノードに反映してください。",
        "authorization_server_error_response": {
                "error": "unauthorized_client",
                "error_description": "INVALID_CREDENTIALS: Invalid client credentials"
        }
}
```

※疎通コマンドが結果の通りにならない場合は、「[gBizConnect FAQ](./gBizConnect_faq.pdf)」を参照してください。<br>
※上記のコマンド例はセキュリティリスクの観点で内部からの実行のみ許可としています。

## 4.gBizConnect Nodeのシステム間連携の事前設定

### 4.1.gBizConnect Portalでアカウントの作成

(1)「[gBizConnectに参加する](https://portal.gbiz-connect.go.jp/menu_node)」から、「アカウント登録」を選択します。

<div align="center">
<img src="img/account_set1.png" alt="gBizConnectに参加する画面" title="gBizConnectに参加する画面">

 図4-1-1 gBizConnectに参加する画面
</div>

(2)図4-1-2の画面で登録するアカウントの情報を入力します。

<div align="center">
<img src="img/account_set2.png" alt="アカウント登録申請画面" title="アカウント登録申請画面">

 図4-1-2 アカウント登録申請画面
</div>

(3)図4-1-3の画面で「申請する」を選択し、図4-1-4のようなアカウント登録申請完了画面が表示されます。

<div align="center">
<img src="img/account_set3.png" alt="アカウント登録申請確認画面" title="アカウント登録申請確認画面">

 図4-1-3 アカウント登録申請確認画面
</div>

<div align="center">
<img src="img/account_set4.png" alt="アカウント登録申請完了画面" title="アカウント登録申請完了画面">

 図4-1-4 アカウント登録申請完了画面
</div>

(4)アカウント登録承認後、図4-1-5のようなメールが届くことを確認してください。

<div align="center">
<img src="img/account_set5.png" alt="アカウント登録承認後のメール" title="アカウント登録承認後のメール">

 図4-1-5 アカウント登録承認後のメール
</div>

### 4.2.gBizConnect PortalでgBizConnect接続システムの登録

(1)「[gBizConnectに参加する](https://portal.gbiz-connect.go.jp/menu_node)」から「システム登録」を選択する。

<div align="center">
<img src="img/system_set1.png" alt="gBizConnectに参加する画面" title="gBizConnectに参加する画面">

 図4-2-1 gBizConnectに参加する画面
</div>

(2)図4-2-2の画面でシステムの情報を入力します。

<div align="center">
<img src="img/system_set2.png" alt="システム登録画面" title="システム登録画面">

 図4-2-2 システム登録画面
</div>

<br>

<div align="center">

表4-2-1　システム登録、入力項目説明

</div>

|項番|項目名|説明|
|:-|:-|:-|
|1|システム名|登録したいシステムの名称|
|2|システムURL|登録したいシステムのWebサイト|
|3|ノードURL|導入したgBizConnect NodeのURL|
|4|システム概要|登録したいシステムの概要|
|5|運営組織名|登録したいシステムの運営組織名称|
|6|運営部署名|登録したいシステムの運営部署名称|
|7|住所|登録したいシステムの運営組織の住所|
|8|メールアドレス|登録したいシステムの管理者のメールアドレス|
|9|メールアドレス再入力|メールアドレスの確認|
|10|電話番号|登録したいシステムの管理者の電話番号|

<br>

(3)図4-2-3の画面で「登録する」を選択し、図4-2-4のようなシステム登録完了画面が表示されます。

<div align="center">
<img src="img/system_set3.png" alt="システム登録確認画面" title="システム登録確認画面">

 図4-2-3 システム登録確認画面
</div>

<div align="center">
<img src="img/system_set4.png" alt="システム登録完了画面" title="システム登録完了画面">

 図4-2-4 システム登録完了画面
</div>

# データ要求者の設定

本設定は、データ要求者の設定です。データ提供者の設定は「[6.データ提供者 gBizConnect Nodeのシステム間連携の設定](#6データ提供者-gBizConnect-Nodeのシステム間連携の設定)」を参照してください。

## 5.データ要求者 gBizConnect Nodeのシステム間連携の設定
### 5.1.gBizConnect PortalでAPI利用申請

(1)「[gBizConnectに参加する](https://portal.gbiz-connect.go.jp/menu_node)」から「APIを利用する」を選択します。

<div align="center">
<img src="img/api_riyou1.png" alt="gBizConnectに参加する画面" title="gBizConnectに参加する画面">

 図5-1-1 gBizConnectに参加する画面
</div>

(2)表示されたAPIを利用する画面から「APIを探す」を選択します。

<div align="center">
<img src="img/api_riyou2.png" alt="APIを利用する画面" title="APIを利用する画面">

 図5-1-2 APIを利用する画面
</div>

(3)表示された一覧から利用したいAPIを選択します。

<div align="center">
<img src="img/api_riyou3.png" alt="APIを探す画面" title="APIを探す画面">

 図5-1-3 APIを探す画面
</div>

(4)選択したAPIのメソッド一覧から使用したいAPIメソッドを選択します。

<div align="center">
<img src="img/api_riyou4.png" alt="APIを詳しく見る画面" title="APIを詳しく見る画面">

 図5-1-4 APIを詳しく見る画面
</div>

(5)複数システムを登録した場合は図5-1-5のような子画面が表示され、API連携の対象とするシステムを選択します。1システムのみを登録した場合は、子画面は表示されずに(6)に進みます。

<div align="center">
<img src="img/api_riyou8.png" alt="APIを詳しく見る画面(子画面)" title="APIを詳しく見る画面(子画面)">

 図5-1-5 APIを詳しく見る画面(子画面)
</div>

(6)図5-1-6のような画面が表示され、APIの利用に必要な情報を入力し「申請内容を確認する」を選択します。

<div align="center">
<img src="img/api_riyou5.png" alt="API利用申請画面" title="API利用申請画面">

 図5-1-6 API利用申請画面
</div>

(7)図5-1-7の画面で「申請する」を選択し、図5-1-7のようなAPI利用申請完了画面が表示されます。

<div align="center">
<img src="img/api_riyou6.png" alt="API利用申請確認画面" title="API利用申請確認画面">

 図5-1-7 API利用申請確認画面
</div>

<div align="center">
<img src="img/api_riyou7.png" alt="API利用申請完了画面" title="API利用申請完了画面">

 図5-1-8 API利用申請完了画面
</div>

### 5.2.(任意)gBizConnectの都度同意の設定

 　この項目は都度同意によるシステム間連携を実施する場合の設定です。任意の設定のため、必要に応じて設定してください。

#### 5.2.1gBizConnectの都度同意の流れ

都度同意の流れは次の通りです。

<div align="center">

表5-2-1　事前設定

</div>

|No.|対象ユーザー|システムで実装が必要な内容|対応する手順|
|:-|:-|:-|:-|
|1|データ提供者|gBizConnect PortalのNode設定画面(基本設定)で「データ提供範囲設定」の項目を設定|[6.2.2gBizConnect Portalでデータ提供範囲の設定](#622gBizConnect-Portalでデータ提供範囲の設定)|
|2|データ提供者|gBizConnect Portalで標準データ変換設定を実施する。(データ提供システムのデータが法人標準データの形式であれば不要）|[6.2.3(任意)gBizConnect Portalで標準データ変換の設定](#623任意gBizConnect-Portalで標準データ変換の設定)|
|3|データ要求者|gBizConnect PortalのNode設定画面(都度同意)で「都度同意設定情報」の項目を設定 |[5.2.2データ要求者で必要な都度同意の事前設定](#522データ要求者で必要な都度同意の事前設定)|
|4|データ提供者/データ要求者|双方でNode設定ファイルのダウンロード・反映|[5.3.Node設定ファイルをgBizConnect Nodeへ反映](#53Node設定ファイルをgBizConnect-Nodeへ反映)|

<div align="center">

表5-2-2　都度同意でシステム間連携する際の流れ

</div>

|No.|対象ユーザー|システムで実装が必要な内容|対応する手順|
|:-|:-|:-|:-|
|1|データ要求者|データ要求者システムから、データ要求者システムのスコープ選択画面取得APIを利用しスコープ選択画面を呼び出す|[5.5.都度同意によるシステム間連携](#55都度同意によるシステム間連携)|
|2|データ要求者|スコープ選択画面で取得するデータのスコープを選択|[5.5.都度同意によるシステム間連携](#55都度同意によるシステム間連携)|
|3|データ要求者|gBizIDへログイン画面が表示されるため、認証情報を入力し認証|[5.5.都度同意によるシステム間連携](#55都度同意によるシステム間連携)|
|4|データ要求者|同意画面で同意すると、データ要求者Nodeから都度同意のシステム間連携に必要な情報がリダイレクトがされる|[5.5.都度同意によるシステム間連携](#55都度同意によるシステム間連携)|
|5|データ要求者|リダイレクトされた情報を利用し、データ要求者システムからデータ要求者Nodeの都度同意APIを呼び出すことで、Node間のAPI連携が行われ、データ要求者システムにスコープで絞り込まれた内容が返却される。|[5.5.都度同意によるシステム間連携](#55都度同意によるシステム間連携)|

都度同意の画面遷移のイメージは次のとおりです。
<div align="center">
<img src="img/tsudodouiflow.png">
図5-2-1 都度同意画面遷移イメージ
</div>
<br>
<a name="jump"></a>

#### 5.2.2データ要求者で必要な都度同意の事前設定

 (1)図5-2-2の画面で「gBizConnect Nodeのオプションを設定する」を選択します。

 <div align="center">
 <img src="img/tudodoui_set1.png" alt="gBizConnectに参加する画面" title="gBizConnectに参加する画面">

  図5-2-2 gBizConnectに参加する画面
 </div>

 (2)図5-2-3、図5-2-4の画面で、設定を変更したいシステムを選択します。

 <div align="center">
 <img src="img/tudodoui_set2.png" alt="システム一覧画面(案内表示あり)"システム一覧画面(案内表示あり)">

  図5-2-3 システム一覧画面(案内表示あり)
 </div>

<div align="center">
 <img src="img/tudodoui_set3.png" alt="システム一覧画面"システム一覧画面">

  図5-2-4 システム一覧画面
 </div>

 (3)図5-2-5のNode設定画面(基本設定)で「都度同意」を選択します。

 <div align="center">
 <img src="img/tudodoui_set4.png" alt="Node設定画面(基本設定)" title="Node設定画面(基本設定)">

  図5-2-5 Node設定画面(基本設定)
 </div>

 (4)図5-2-6のNode設定画面(都度同意)で「都度同意設定情報」の必要な項目を入力し、「設定を保存する」を選択します。

 <div align="center">
 <img src="img/tudodoui_set5.png" alt="Node設定画面(都度同意)" title="Node設定画面(都度同意)">

  図5-2-6 Node設定画面(都度同意)
 </div>

 (5)図5-2-7のようなダイアログの「OK」を選択し、図5-2-8に表示が変われば設定完了となります。

 <div align="center">
 <img src="img/tudodoui_set6.png" alt="設定保存確認ダイアログ" title="設定保存確認ダイアログ">

  図5-2-7 設定保存確認ダイアログ
 </div>

 <div align="center">
 <img src="img/tudodoui_set7.png" alt="設定保存完了ダイアログ" title="設定保存完了ダイアログ">

  図5-2-8 設定保存完了ダイアログ
 </div>


### 5.3.Node設定ファイルをgBizConnect Nodeへ反映

※本手順はデータ提供者側で「[5.1.gBizConnect PortalでAPI利用申請](#51gBizConnect-PortalでAPI利用申請)」で実施したAPI利用申請が承認されていることが前提です。API利用申請の確認画面から、申請したAPIのステータスが「完了」になっていることを確認してください。

</div>

<div align="center">
<img src="img/Node_set_douwnload0.png" alt="API利用申請の確認画面" title="API利用申請の確認">

図5-3-1 API利用申請の確認画面
</div>

(1)「[gBizConnectに参加する](https://portal.gbiz-connect.go.jp/menu_node)」から「gBizConnect Nodeのオプションを設定する」を選択します。

</div>

<div align="center">
<img src="img/Node_set_douwnload1.png" alt="gBizConnectに参加する画面" title="gBizConnectに参加する画面">

図5-3-2 gBizConnectに参加する画面
</div>

(2)図5-3-3の画面から任意のシステムの「ダウンロード」を選択し、Node設定ファイルをダウンロードします。

</div>

<div align="center">
<img src="img/Node_set_douwnload2.png" alt="システム一覧画面" title="システム一覧画面">

 図5-3-3 システム一覧画面
</div>

(3)gBizConnect Node設定画面で下記のURL をブラウザで開いて下さい。URLの「node.example.jp」をgBizConnect Nodeを導入したマシンのホスト名に修正します。<br>
　※gBizConnect Node設定画面は外部に公開しないでください。


〇gBizConnect Node設定画面のURL

```
http://node.example.jp:8080/setting.php
```
<br>

<div align="center">
<img src="img/Node_set_douwnload3.png">

図5-3-4 gBizConnect Node設定画面
</div>

(4)図5-3-4の画面で「ファイルの選択」を選択し(2)でダウンロードしたNode設定ファイルを選択します。

(5)図5-3-4の画面で「保存」を選択し、導入したgBizConnect NodeにNode設定ファイルを反映してください。

### 5.4.事前同意によるシステム間連携

　この項目は事前同意によるシステム間連携する場合の手順となります。都度同意によるシステム間連携は「[5.5.都度同意によるシステム間連携](#55都度同意によるシステム間連携)」を参照してください。<br>
API利用申請したAPIを呼び出し、データ連携できることを確認してください。コマンドの例を下記に示します。

〇コマンド例

```
curl -u UserID:PassWord -X POST \
'https://node.youkyu.example.jp/v1/reception_jizen' \
-H "accept: application/json" \
--data-urlencode "call_api=https://node.teikyou.example.jp/v1/example" \
--data-urlencode "method=GET" \
--data-urlencode "header=Accept: application/json" \
--data-urlencode "header=Content-Type: application/json"
```

〇コマンド例の修正箇所
 * UserID：installシェルで登録したユーザ名
 * PassWord：installシェルで登録したパスワード
 * https://node.youkyu.example.jp ：ノードを導入したホストのドメイン
 * https://node.teikyou.example.jp ：API利用申請したNodeのホストのドメイン
 * /v1/example ：API利用申請したAPI

※API利用申請承認後のNode設定ファイルをAPI公開側で反映していない場合、エラーになります。
※上記以外のパターンについて補足事項(「[7.8.事前同意によるシステム間連携のリクエストパターン](#78事前同意によるシステム間連携のリクエストパターン)」)に記載しております。

### 5.5.都度同意によるシステム間連携

この項目は都度同意によるシステム間連携する場合の手順となります。事前同意によるシステム間連携は「[5.4.事前同意によるシステム間連携](#54事前同意によるシステム間連携)」を参照してください。
また下記の手順で記載するgBizConnect NodeのAPIの詳細は「[Node仕様書：2.2. API一覧](https://github.com/gbizconnect/gbizconnect-node/blob/master/docs/gBizConnectNode.md#22-api一覧)」を合わせてご参照ください。

(1)データ要求者システムからデータ提供者Nodeの下記のパラメータを指定しAPIを呼び出してください。

〇呼び出し対象API

```
/scope.html
```
〇パラメータ

```
state *
```

※string(query)
※*：呼び出し側システムで生成するランダム文字列（CSRF対策に使用）

(2)(1)のAPIを呼び出すことで、スコープ選択画面表示されるので、取得したいデータのスコープを選択する。<br>

(3)gBizID認証画面が表示されるので、ログインID、パスワードを入力する。<br>

(4)(3)で認証が成功すると同意画面が表示されるので、同意する。<br>

(5)(4)で同意すると、データ要求者Nodeはブラウザからデータ要求者システムにパラメータ(client_id、state、nonce)付きでリダイレクトさせる。<br>
　　その際、データ要求者システムでパラメータ(state)の値が(1)で渡したものと⼀致するかチェックする。<br>

(6)(5)で確認ができたら、データ要求者システムからデータ要求者Nodeの都度同意リクエスト受付APIを呼び出す。<br>
　リダイレクトのパラメータ(client_id)の値でデータ要求者システムで選択したデータ提供者Nodeを判定して呼び出すAPIリクエストを作成する。<br>
　また、パラメータnonceを都度同意リクエストパラメータに追加し、gBizConnect Nodeの都度同意リクエスト受付APIを呼び出す。

〇コマンド例

```
curl -u admin:password -X POST  'https://example_youkyu_node.com/v1/reception_tsudo'  \
-H "accept: application/json"   \
-H "Content-Type: application/x-www-form-urlencoded"  \
--data-urlencode "call_api=https://example_teikyou_node/v1/corporations/1234567890123"  \
--data-urlencode "method=GET"  --data-urlencode "header=Accept: application/json"  \
--data-urlencode "header=Content-Type: application/json"  \
--data-urlencode "nonce: youkyu_nonce"  \
```

〇コマンド例の修正箇所

```
https://example_youkyu_node.com：データ提供者Nodeのドメイン、パラメータ(client_id)の値が一致するもの。
youkyu_nonce：リダイレクトで取得したパラメータ(nonce)
```

# データ提供者の設定

本設定は、データ提供者の設定です。データ要求者の設定は「[5.データ要求者 gBizConnect Nodeのシステム間連携の設定](#5データ要求者-gBizConnect-Nodeのシステム間連携の設定)」を参照してください。

## 6.データ提供者 gBizConnect Nodeのシステム間連携の設定
### 6.1.gBizConnect PortalでAPI登録

※本設定を実施するには、「[4.2.gBizConnect PortalでgBizConnect接続システムの登録](#42gBizConnect-PortalでgBizConnect接続システムの登録)」の手順で事前にシステム登録をする必要があります。

(1)「[gBizConnectに参加する](https://portal.gbiz-connect.go.jp/menu_node)」から「APIを公開する」を選択します。

<div align="center">
<img src="img/api_set0.png" alt="gBizConnectに参加する画面" title="gBizConnectに参加する画面">

 図6-1-1 gBizConnectに参加する画面
</div>

(2)図6-1-2のシステム一覧画面から任意のシステムの「API登録」を選択します。

<div align="center">
<img src="img/api_set1.png" alt="システム一覧画面" title="システム一覧画面">

 図6-1-2 システム一覧画面
</div>

(3)図6-1-3の画面で登録したいAPIの情報を入力します。

<div align="center">
<img src="img/api_set2.png" alt="API登録画面" title="API登録画面">

 図6-1-3 API登録画面
</div>

「APIエンドポイント」は次の通りに設定してください。

〇APIエンドポイント入力例

```
登録したいAPI：https://node.example.jp/v1/corporations/1234567890123
APIエンドポイント：https://node.example.jp/v1/corporations/{corporate_number}
```

※変数は{}で囲んだ上、正規表現は使用不可となります。

「API情報の公開」を公開にした場合、APIを探す画面においてシステム情報(システム名・運営組織名)も公開されます。

(4)図6-1-4の画面で「登録する」を選択し、図6-1-5の画面が表示されます。

<div align="center">
<img src="img/api_set3.png" alt="API登録確認画面" title="API登録確認画面">

 図6-1-4 API登録確認画面
</div>

<div align="center">
<img src="img/api_set4.png" alt="API登録完了画面" title="API登録完了画面">

 図6-1-5 API登録完了画面
</div>

### 6.2.1gBizConnect PortalでAPIマッピング

gBizConnect Nodeでは、APIマッピングすることで、登録されたAPIからデータ提供システムのAPIに変換し、データ提供システムからデータを取得します。

(1)「[gBizConnectに参加する](https://portal.gbiz-connect.go.jp/menu_node)」から「APIを公開する」を選択します。

<div align="center">
<img src="img/api_mapping_set1.png" alt="gBizConnectに参加する画面" title="gBizConnectに参加する画面">

 図6-2-1 gBizConnectに参加する画面
</div>

(2)図6-2-2のシステム一覧画面から任意のシステムの「Node設定」を選択します。

<div align="center">
<img src="img/api_mapping_set2.png" alt="システム一覧画面" title="システム一覧画面">

 図6-2-2 システム一覧画面
</div>

(3)下記の例を参考に図6-2-3の画面で必要な情報を入力し、「設定を保存」を選択する。

<div align="center">

表6-2-1　APIマッピング設定

</div>

|キー|値|
|:-|:-|
|システムAPIエンドポイントドメイン|gBizConnect Node導入システムのAPIのエンドポイントの<スキーム名>://<ホスト名>[:<ポート番号>]部分を記載してください。<スキーム名>はhttpsまたはhttp、<ポート番号>は標準ポート（80, 443）の場合省略可能です。|
|NodeAPIエンドポイントパス抽出正規表現|gBizConnect Node APIのエンドポイントの<パス>を記載してください（njsの正規表現）。|
|システムAPIエンドポイントパス置換正規表現|マッピングさせる、gBizConnect Node導入システムのAPIのエンドポイントの<パス>を記載してください（njsの正規表現）。|


※"NodeAPIエンドポイントパス抽出正規表現"、"システムAPIエンドポイントパス置換正規表現"は、設定された値を正規表現とみなします。
　njsの正規表現を用いて記載してください。<br>

〇njsの正規表現について<br>
njsはECMAScript 5.1に準拠しており、以下のページの正規表現を使用できます。<br>
http://www.ecma-international.org/ecma-262/5.1/#sec-15.10.1

〇設定例

・API登録(APIエンドポイント)
```
APIエンドポイント：https://node.example.jp/v1/corporations/{corporate_number}
```

・APIマッピング
```
システムAPIエンドポイントドメイン：https://app.datastore.jp
NodeAPIエンドポイントパス抽出正規表現：/v1/corporations/([0-9]+)
システムAPIエンドポイントパス置換正規表現：/corporate/v1/corporate_number/$1
```

・上記例でAPIマッピングによる変換が行われた結果。

```
データ要求者Nodeからのリクエスト：https://node.example.jp/v1/corporations/1234567890123
データ提供システムへのリクエスト：https://app.datastore.jp/corporate/v1/corporate_number/1234567890123
```

<div align="center">
<img src="img/api_mapping_set3.png" alt="Node設定画面（APIマッピング）" title="Node設定画面（APIマッピング">

 図6-2-3 Node設定画面（APIマッピング)
</div>

(4)図6-2-4のようなダイアログの「OK」を選択し、図6-2-5に表示が変われば設定完了となります。

<div align="center">
<img src="img/api_mapping_set4.png" alt="設定保存確認ダイアログ" title="設定保存確認ダイアログ">

 図6-2-4 設定保存確認ダイアログ
</div>

<div align="center">
<img src="img/api_mapping_set5.png" alt="設定保存完了ダイアログ" title="設定保存完了ダイアログ">

 図6-2-5 設定保存完了ダイアログ
</div>

### 6.2.2gBizConnect Portalでデータ提供範囲の設定

 (1)図6-2-6の「[gBizConnectに参加する](https://portal.gbiz-connect.go.jp/menu_node)」画面で「gBizConnect Nodeのオプションを設定する」を選択します。

 <div align="center">
 <img src="img/tudodoui_teikyo_set1.png" alt="gBizConnectに参加する画面" title="gBizConnectに参加する画面">

  図6-2-6 gBizConnectに参加する画面
 </div>

 (2)図6-2-7のシステム一覧画面で、任意のシステムの「Node設定」を選択します。

 <div align="center">
 <img src="img/tudodoui_teikyo_set2.png" alt="システム一覧画面"システム一覧画面">

  図6-2-7 システム一覧画面
 </div>

 (3)図6-2-8のNode設定画面(基本設定)で「データ提供範囲設定」の項目で提供するデータの範囲をチェックし、「設定を保存する」を選択します。

 <div align="center">
 <img src="img/tudodoui_teikyo_set4.png" alt="Node設定画面(基本設定)" title="Node設定画面(基本設定)">

  図6-2-8 Node設定画面(基本設定)
 </div>

 (4)図6-2-9のようなダイアログの「OK」を選択し、図6-2-10に表示が変われば設定完了となります。

 <div align="center">
 <img src="img/tudodoui_teikyo_set5.png" alt="設定保存確認ダイアログ" title="設定保存確認ダイアログ">

  図6-2-9 設定保存確認ダイアログ
 </div>

 <div align="center">
 <img src="img/tudodoui_teikyo_set6.png" alt="設定保存完了ダイアログ" title="設定保存完了ダイアログ">

  図6-2-10 設定保存完了ダイアログ
 </div>

### 6.2.3(任意)gBizConnect Portalで標準データ変換の設定

　データ提供システムの法人標準データの形式に準拠している場合は不要です。<br>
　法人標準データの形式に準拠していない場合は以下の設定を実施してください。<br>
　また標準データ変換の詳細な説明は、「[Node仕様書：2.4.標準データマッピング機能](https://github.com/gbizconnect/gbizconnect-node/blob/master/docs/gBizConnectNode.md#24標準データマッピング機能)」を参照してください。

(1)「[gBizConnectに参加する](https://portal.gbiz-connect.go.jp/menu_node)」から「APIを公開する」を選択します。

<div align="center">
<img src="img/hyouzyun_data_set1.png" alt="gBizConnectに参加する画面" title="gBizConnectに参加する画面">

 図6-2-11 gBizConnectに参加する画面
</div>

(2)図6-2-12の画面から任意のシステムの「Node設定」を選択します。

<div align="center">
<img src="img/hyouzyun_data_set2.png" alt="システム一覧画面" title="システム一覧画面">

 図6-2-12 システム一覧画面
</div>

(3)図6-2-13のNode設定画面(基本設定)で標準データ変換①または標準データ変換②または標準データ変換③を選択します。

<div align="center">
<img src="img/hyouzyun_data_set3.png" alt="Node設定画面(基本設定)" title="Node設定画面(基本設定)">

 図6-2-13 Node設定画面(基本設定)
</div>

(4)図6-2-14の設定画面で必要な項目を入力し、「設定を保存する」を選択します。

<div align="center">
<img src="img/hyouzyun_data_set4.png" alt="Node設定画面(標準データ変換①)" title="Node設定画面(標準データ変換①)">

 図6-2-14 Node設定画面(標準データ変換①)
</div>

入力例について説明します。下記の通り、データ提供システムから取得できる法人データを法人標準データに変換したいとします。


〇データ提供システムから取得できるデータ

```
{
    "corporate-number" : "1234567891011",
    "corporate-name" : "○○株式会社",
    "employees" : {
        "all" : "500",
        "regular" : "400"
    },
    "phonenumber" : "03-1234-5678"
}
```

〇標準データ変換した結果

```
{
    "Basic" : {
        "Destination" : {
            "Corporate number" : "1234567891011",
            "Corporate name" : "○○株式会社"
        },
        "Content" : {
            "Employee number" : "600",
            "Regular employee number" : "400"
        },
        "Contact information" : {
            "Phone number" : "03-1234-5678"
        }
    }
}
```

表6-2-2の通りに図6-2-14 Node設定画面(標準データ変換①)の各項目に入力します。

<div align="center">

表6-2-2　標準データ変換設定例

</div>

|標準法人データJSONキー|システムAPIレスポンスキー|
|:-|:-|
|Basic.Destination.Corporate number|corporate-number|
|Basic.Destination.Corporate name|corporate-name|
|Basic.Content.Employee number|employees.all|
|Basic.Content.Regular employee number|employees.regular|
|Basic.Contact information.Phone number|phonenumber|

<br>

(5)図6-2-15の設定画面で必要な項目を入力し、「設定を保存する」を選択します。

<div align="center">
<img src="img/hyouzyun_data_set5.png" alt="Node設定画面(標準データ変換②)" title="Node設定画面(標準データ変換②)">

 図6-2-15 Node設定画面(標準データ変換②)
</div>

(6)図6-2-16の設定画面で必要な項目を入力し、「設定を保存する」を選択します。

<div align="center">
<img src="img/hyouzyun_data_set6.png" alt="Node設定画面(標準データ変換③)" title="Node設定画面(標準データ変換③)">

 図6-2-16 Node設定画面(標準データ変換③)
</div>

### 6.3.gBizConnect NodeのAPI仕様定義/公開の設定
#### 6.3.1 Swaggerのネットワーク設定
　gBizConnect NodeのAPI仕様定義を公開するため、API情報を編集する必要があります。

(1)gBizConnect　PortalでAPI登録したAPI情報のAPI仕様URLに以下の値を設定する必要があります。<br>
　 はじめに図6-3-1のメニュー画面から「API一覧」を選択します。

〇設定する値

```
https://node.example.jp[:port]/swaggerui/
```

※「node.example.jp[:port]」を実際の値に修正してください。

<div align="center">
<img src="img/api_swagger_set1.png" alt="メニュー画面" title="メニュー画面">

 図6-3-1 メニュー画面
</div>

(2)図6-3-2のAPI一覧画面で、編集したいAPI情報の「編集」を選択します。

<div align="center">
<img src="img/api_swagger_set2.png" alt="API一覧画面" title="API一覧画面">

 図6-3-2 API一覧画面
</div>

(3)図6-3-3のAPI編集画面で、「API仕様URL」の値に(3)で決めた値を入力し、「編集内容を確認する」を選択します。

<div align="center">
<img src="img/api_swagger_set3.png" alt="API編集画面" title="API編集画面">

 図6-3-3 API編集画面
</div>

(4)図6-3-4のAPI編集確認画面で、「編集する」を選択し、図6-3-5のAPI編集完了画面が表示されます。

<div align="center">
<img src="img/api_swagger_set4.png" alt="API編集確認画面" title="API編集確認画面">

 図6-3-4 API編集確認画面
</div>

<div align="center">
<img src="img/api_swagger_set5.png" alt="API編集完了画面" title="API編集完了画面">

 図6-3-5 API編集完了画面
</div>


#### 6.3.2 SwaggerのAPI仕様定義/公開の設定

　gBizConnect NodeのAPI仕様をSwagger Editorで定義し、Swagger UIで公開するための設定を下記に示します。  

<div align="center">
<img src="img/swaggereditor.png">  

図6-3-6　Swagger Editorの表示例
</div>

(1)Swagger Editor（`https://node.example.jp[:port]/swaggereditor/`）をブラウザで開いてください。  

(2)Swagger EditorでAPI仕様を追記してください。  
　API仕様の記載方法は、Swaggerのサイトを参照してください。  
・Swaggerのサイト：https://swagger.io/docs/specification/2-0/basic-structure/  

(3)Swagger Editorの【1】「File」で「Save as JSON」を選択し、ファイル(swagger.json)をローカルに保存し、同ファイルを以下のディレクトリに格納してください。  
・任意の場所/swaggerui/  

### 6.4.API利用申請の承認

この項目は、データ要求者システムからAPI利用申請が実施された場合にする手順となっております。

(1)図6-4-1のメニュー画面で「API利用承認」を選択します。

<div align="center">
<img src="img/api_syounin1.png" alt="メニュー画面" title="メニュー画面">

 図6-4-1 メニュー画面
</div>

(2)図6-4-2のAPI利用承認画面で承認したいAPI利用申請から、「承認」を選択します。

<div align="center">
<img src="img/api_syounin2.png" alt="API利用承認画面" title="API利用承認画面">

 図6-4-2 API利用承認画面
</div>

(3)図6-4-3のAPI利用申請承認画面で「承認する」を選択します。

<div align="center">
<img src="img/api_syounin3.png" alt="API利用申請承認画面" title="API利用申請承認画面">

 図6-4-3 API利用申請承認画面
</div>

(4)図6-4-4のAPI利用申請承認確認画面で「承認する」を選択し、図6-4-5のAPI利用申請承認完了画面が表示されます

<div align="center">
<img src="img/api_syounin4.png" alt="API利用申請承認確認画面" title="API利用申請承認確認画面">

 図6-4-4 API利用申請承認確認画面
</div>


<div align="center">
<img src="img/api_syounin5.png" alt="API利用申請承認完了画面" title="API利用申請承認完了画面">

 図6-4-5 API利用申請承認完了画面
</div>

### 6.5.(任意)gBizConnectの都度同意の設定

 　この項目は都度同意が必要な場合の設定です。任意の設定のため、必要に応じて設定してください。

### 6.5.1gBizConnectの都度同意の流れ

　この項目はデータ要求者の説明と同様のため、「[5.2.1gBizConnectの都度同意の流れ](#521gBizConnectの都度同意の流れ)」をご参照ください。

### 6.6.Node設定ファイルの取得、gBizConnect Nodeへ反映

　この項目はデータ要求者の設定の手順と同様のため、「[5.3.Node設定ファイルをgBizConnect Nodeへ反映](#53Node設定ファイルをgBizConnect-Nodeへ反映)」をご参照ください。

　ただし、「[6.1.gBizConnect PortalでAPI登録](#61gbizconnect-portalでapi登録)」で登録したAPIエンドポイントに以下のいずれかを含む場合は、正規表現と見なされ正常にデータ連携ができないため、「[7.9.Node設定ファイルにおけるAPIエンドポイントのエスケープ](#79Node設定ファイルにおけるAPIエンドポイントのエスケープ)」を実施してください。

〇エスケープ対象文字列

```
・(?!【xxx】)
・(【xxx】)
・{【num】,}
・{【num】,【num】}
・(?:【xxx】)
・(?=【xxx】)
・[^【xxx】]

【xxx】　任意の文字列
【num】　任意の数字
```

## 7.補足事項

### 7.1.gBizConnect NodeにCA証明書を認識させる方法

　gBizConnect NodeでCA証明書を認識させる方法を下記に示します。

(1)自己CA証明書のファイル名を「trusted_ca_cert.crt」に変更し任意の場所に格納します。<br>

(2)下記のコマンドを実行します。<br>
　　
〇コマンド例

```
sudo docker cp /opt/gbizconnect/ssl/trusted_ca_cert.crt node_edge-module_1:/etc/nginx/ssl/trusted_ca_cert.crt \
&& sudo docker exec -it node_edge-module_1 /bin/sh -c 'echo "" >> \
/etc/ssl/certs/ca-certificates.crt' \
&& sudo docker exec -it node_edge-module_1 /bin/sh -c 'echo "# gBizConnectCA" >> \
/etc/ssl/certs/ca-certificates.crt' \
&& sudo docker exec -it node_edge-module_1 /bin/sh -c 'cat \
/etc/nginx/ssl/trusted_ca_cert.crt >> /etc/ssl/certs/ca-certificates.crt'
```

〇コマンド修正箇所
  * /opt/gbizconnect/ssl/trusted_ca_cert.crt：(1)でファイルを格納したディレクトリ

(3)下記のコマンドを実行します。

```　　
sudo docker exec -it node_edge-module_1 nginx -s reload　
```

### 7.2.証明書チェーンの階層の数の設定  
　本設定はgBizConnect Node起動後に、以下のような証明書関連のエラーが発生した場合に必要な設定となります。

〇エラー

```
upstream SSL certificate verify error: (20:unable to get local issuer certificate) while SSL handshaking to upstream
```

(1)proxy_ssl_verify_depthの値、lua_ssl_verify_depthの値を設定したCAルート証明書の階層の数に変更する。

〇proxy_ssl_verify_depth.confの値(proxy_ssl_verify_depth.conf：1行目)

```
proxy_ssl_verify_depth        3;
```

〇lua-ssl-verify-depth.confの値(lua-ssl-verify-depth.conf：1行目)

```
lua_ssl_verify_depth          3;
```
### 7.3.gBizConnect Nodeとデータ提供システム間でSSL通信を行うための設定

　提供側Nodeを導入したサーバからデータ提供システムへSSL通信を行う場合、提供側Nodeにデータ提供システムのCA（認証局）のルート証明書を取り込む必要があります。

(1)gBizConnect Nodeに認識させたいデータ提供システムのCA（認証局）のルート証明書（PEM形式）を用意します。

(2) 「[7.1.gBizConnect NodeにCA証明書を認識させる方法](#71gBizConnect-NodeにCA証明書を認識させる方法)」を参考に、gBizConnect NodeのCA（認証局）のルート証明書（PEM形式）に(1)で用意した証明書の情報を追加します。

### 7.4 gBizConnect Nodeの流量制御設定

gBizConnect Nodeは、利用許可したシステムごとに過剰なリクエストの受付防止が可能な流量制御をすることができます。
詳細な説明は「[Node仕様書：2.8. 流量制御](https://github.com/gbizconnect/gbizconnect-node/blob/master/docs/gBizConnectNode.md#28-流量制御)」を参照してください。

またgBizConnect Node流量制御はnginxの機能を利用しておりますので、NGINXの公式サイト合わせて参照してください。

http://nginx.org/en/docs/http/ngx_http_limit_req_module.html　<br>
https://www.nginx.com/blog/rate-limiting-nginx/

#### 7.4.1.gBizConnect Nodeで指定したIPアドレスに流量制御を設定する方法

(1)rate-limit.http.confを設定する。

〇rate-limit.http.confの記載例

```
geo $rule_XXX {
    default 0;
    YYY.YYY.YYY.YYY/Z 1;
}
map $rule_XXX $rule_XXX_key {
    0 "";
    1 $binary_remote_addr;
}
limit_req_zone $rule_delay_key zone="rule_XXX":10m rate=5r/s;
```

〇編集箇所
  * "$rule_XXX","$rule_XXX_key"：「XXX」に任意の値を設定し、同じになるよう合わせる。
  * "YYY.YYY.YYY.YYY/Z"︓制限したいIPアドレスを設定する。サブネットマスクを使用することが可能。複数項目記載可能。
  * "rate"：リクエストの間隔の最大値を設定できます。例の場合は1秒に5回を超えない程度(0.2秒以上の間隔)を設定。

(2)rate-limit.location.confを設定する。

〇rate-limit.location.confの記載例。

```
limit_req zone="rule_XXX_key" burst=10 "nodelay";
```

〇編集箇所
  * "limit_reqの末尾"："nodelay"を記載すると、制限を超えたリクエストはドロップする。何も記載しないと遅延します。
  * "burst"：rateで設定した制限時間内に来たリクエストの最大保持量を設定できます。例の場合は、0.2秒間隔を待たずに来たリクエストを保持できる最大量となります。

### 7.5 gBizConnect Nodeのメタデータ付与設定

gBizConnectではシステム間連携で取得した値にメタデータを付与することができます。
付与することのできるメタデータの詳細な説明は「[Node仕様書：5.2. メタデータ](https://github.com/gbizconnect/gbizconnect-node/blob/master/docs/gBizConnectNode.md#52-メタデータ)」を参照してください。

(1)メニュー画面から「Node設定の更新」を選択します。

<div align="center">
<img src="img/metadata_fuyo1.png" alt="メニュー画面" title="メニュー画面">

 図7-5-1 メニュー画面
</div>

(2)図7-5-2のシステム一覧画面で設定したいシステムから、「Node設定」を選択します。

<div align="center">
<img src="img/metadata_fuyo2.png" alt="システム一覧画面" title="システム一覧画面">

 図7-5-2 システム一覧画面
</div>

(3)図7-5-3のNode設定画面(基本設定)にある、メタデータ付与情報設定を「true」にします。その後「設定を保存する」を選択します。

<div align="center">
<img src="img/metadata_fuyo4.png" alt="Node設定画面(基本設定)" title="Node設定画面(基本設定)">

 図7-5-3 Node設定画面(基本設定)
</div>

(4)「[5.3.Node設定ファイルをgBizConnect Nodeへ反映](#53Node設定ファイルをgBizConnect-Nodeへ反映)」を参考にNode設定ファイルを更新します。

### 7.6 リバースプロキシ利用環境でのgBizConnect Nodeの導入時の注意点

　リバースプロキシを利用している環境の場合、以下の対策を実施する必要があります。 <br>

〇リバースプロキシ利用環境で必要な対策

```
・リクエストを受け取るリバースプロキシでは、サニタイズ処理を実装すること
・リバースプロキシとサーバ間の通信は盗聴、改変、リプレイ攻撃から保護すること
```

### 7.7 gBizConnect Nodeとデータ提供システム間の認証情報の設定

gBizConnect Nodeからデータ提供システムのデータを取得する際の認証情報を設定することができます。
設定することのできる認証情報の詳細な説明は「[Node仕様書：5.3. gBizConnect Nodeとシステム間の認証機能](https://github.com/gbizconnect/gbizconnect-node/blob/master/docs/gBizConnectNode.md#53-gbizconnect-nodeとシステム間の認証機能)」を参照してください。

(1)メニュー画面から「Node設定の更新」を選択します。

<div align="center">
<img src="img/ninsyo_set1.png" alt="メニュー画面" title="メニュー画面">

 図7-7-1 メニュー画面
</div>

(2)図7-7-2のシステム一覧画面で設定したいシステムから、「Node設定」を選択します。

<div align="center">
<img src="img/ninsyo_set2.png" alt="システム一覧画面" title="システム一覧画面">

 図7-7-2 システム一覧画面
</div>

(3)図7-7-3のNode設定画面(基本設定)の上部にある、認証情報を下のダイアログから、設定したい認証情報の種類を選択します。<br>
　　その後「Basic認証」の場合(4)を実施、「Bearerトークン認証」の場合(5)を実施、「APIキー認証」の場合(6)を実施してください。

<div align="center">
<img src="img/ninsyo_set4.png" alt="Node設定画面(基本設定)" title="Node設定画面(基本設定)">

 図7-7-3 Node設定画面(基本設定)
</div>

(4)【Basic認証の場合】図7-7-4のNode設定画面(基本設定)でIDとPWを入力します。<br>
　　その後(8)を実施します。

<div align="center">
<img src="img/ninsyo_set5.png" alt="Node設定画面(【Basic認証の場合】基本設定)" title="Node設定画面(【Basic認証の場合】基本設定)">

 図7-7-4 Node設定画面(【Basic認証の場合】基本設定)
</div>

(5)【Bearerトークン認証の場合】図7-7-5のNode設定画面(基本設定)でBearerトークンを入力します。<br>
　　その後(8)を実施します。

<div align="center">
<img src="img/ninsyo_set6.png" alt="Node設定画面(【Bearerトークン認証の場合】基本設定)" title="Node設定画面(【Bearerトークン認証の場合】基本設定)">

 図7-7-5 Node設定画面(【Bearerトークン認証の場合】基本設定)
</div>

(6)【APIキー認証の場合】図7-7-6のNode設定画面(基本設定)でAPIキーを入力します。<br>

<div align="center">
<img src="img/ninsyo_set7.png" alt="Node設定画面(【APIキー認証の場合】基本設定)" title="Node設定画面(【APIキー認証の場合】基本設定)">

 図7-7-6 Node設定画面(【APIキー認証の場合】基本設定)
</div>

(7)【APIキー認証の場合】独自ヘッダを用いたAPIキー認証を使用する場合、gBizConnect Nodeの「api.header.conf」に以下の設定をしてください。

〇記載例 (独自ヘッダを使用する場合)

・変更対象ファイル

```
$NODE_HOME/node/edge-module/nginx/conf.d/api.header.conf
```

※$NODE_HOMEはgBizConnect Nodeを導入したディレクトリ。<br>

・編集箇所

```
proxy_set_header X-API-ORIGINAL-KEY $js_call_system_api_api_key;
```

※X-API-ORIGINAL-KEYを独⾃ヘッダ名に変更してください。

その後(8)を実施してください。

(8)「[5.3.Node設定ファイルをgBizConnect Nodeへ反映](#53Node設定ファイルをgBizConnect-Nodeへ反映)」を参考にNode設定ファイルを更新してください。

(9)【APIキー認証の場合】下記のコマンドを実行します。

```
sudo docker exec -it node_edge-module_1 nginx -s reload　
```

### 7.8.事前同意によるシステム間連携のリクエストパターン

本項目は事前同意によるシステム間連携の際に使用するリクエストのパターンについて説明します。

〇データ提供者Nodeのドメインが変更された場合

データ提供者Nodeのドメインが変更された場合でも、正しいドメインにアクセスできるようにクライアントIDからドメインを取得する方法です。

詳細は「[Node仕様書：5.4. データ提供システムNodeの名前解決機能](https://github.com/gbizconnect/gbizconnect-node/blob/master/docs/gBizConnectNode.md#54-データ提供システムnodeの名前解決機能)」を参照してください。

```
curl -u UserID:PassWord -X POST \
'https://node.youkyu.example.jp/v1/reception_jizen' \
-H "accept: application/json" \
--data-urlencode "client_id=teikyou_client_id" \
--data-urlencode "call_api=/v1/example" \
--data-urlencode "method=GET" \
--data-urlencode "header=Accept: application/json" \
--data-urlencode "header=Content-Type: application/json"
```

〇事前同意でシステム間連携する際、取得する法人データ範囲(スコープ)を絞り込みたい場合

スコープの詳細は「[Node仕様書：3.2. gBizConnectのスコープ ](https://github.com/gbizconnect/gbizconnect-node/blob/master/docs/gBizConnectNode.md#32-gbizconnectのスコープ)」を参照してください。

```
curl -u UserID:PassWord -X POST \
'https://node.youkyu.example.jp/v1/reception_jizen' \
-H "accept: application/json" \
--data-urlencode "call_api=https://node.teikyou.example.jp/v1/example" \
--data-urlencode "method=GET" \
--data-urlencode "scope=basic application" \
--data-urlencode "header=Accept: application/json" \
--data-urlencode "header=Content-Type: application/json"
```

〇アクセスするAPIがGET以外のPATCH、POST、PUT(例はPOSTのみ)の場合

```
curl -u UserID:PassWord -X POST \
'https://node.youkyu.example.jp/v1/reception_jizen' \
-H "accept: application/json" \
--data-urlencode "call_api=https://node.teikyou.example.jp/v1/example" \
--data-urlencode "method=POST" \
--data-urlencode "header=Accept: application/json" \
--data-urlencode "header=Content-Type: application/json"  \
--data-urlencode  'body={"Basic":{"Destination":{"Corporate number":"1234567891011"}}}'
```

〇上記コマンド例の修正箇所
 * UserID：installシェルで登録したユーザ名
 * PassWord：installシェルで登録したパスワード
 * https://node.youkyu.example.jp ：ノードを導入したホストのドメイン
 * https://node.teikyou.example.jp ：API利用申請したNodeのホストのドメイン
 * /v1/example ：API利用申請したAPI

### 7.9.Node設定ファイルにおけるAPIエンドポイントのエスケープ

 本項目はNode設定ファイルにおけるAPIエンドポイントのエスケープを実施する方法について説明します。

 (1)「[5.3.Node設定ファイルをgBizConnect Nodeへ反映](#53Node設定ファイルをgBizConnect-Nodeへ反映)」(2)でダウンロードしたNode設定ファイルを開きます。

 (2)下記のように該当記号部分をエスケープします。

〇APIエンドポイントに`https://node.example.jp/v1/(?!example)/{corporate_number}`を入力した場合の例
```
(略)
 "authorized_client_list" : [
   {
     "client_id" : "teikyou_client_id",
     "endpoint" : [
       {
         "uri" : "^https://node\\.example\\.jp/v1/\\(\\?\\!example\\)/([^/]+)$",
         "method" : "GET"
       },
(略)
```
(3)「[5.3.Node設定ファイルをgBizConnect Nodeへ反映](#53Node設定ファイルをgBizConnect-Nodeへ反映)」(3)以降を実施します。

### 8.FAQ

FAQに関しては「[gBizConnect FAQ](gBizConnect_faq.pdf)」を参照してください。
