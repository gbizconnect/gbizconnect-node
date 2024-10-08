# お知らせ

2024年9月30日<br>
**【重要】当該リポジトリのパブリック公開終了のお知らせ**<br>
gBizConnectの公開資材をご利用頂きまして、誠にありがとうございます。<br>
この度、GithubやDockerHubにて公開中の当該資材におきまして、順次公開終了とさせて頂くこととなりました。<br>
当該<a href="https://github.com/gbizconnect/" target="_blank">リポジトリ</a>を<b>2024年10月末</b>を持ちまして公開終了予定となります。<br>
当該リポジトリのフォーク先（当該リポジトリをフォークされている方）への影響としましては、フォーク元（当該リポジトリ）とのリンクが失われるため、独立したリポジトリとして扱われます。<br>
ご理解のほどどうぞよろしくお願いいたします。

gBizConnect運営事務局

2024年3月14日<br>
**【重要】サービス終了のお知らせ**<br>
gBizConnectをご利用頂きまして、誠にありがとうございます。<br>
この度、皆様によりよいサービスを提供するための新たな取り組みに移行していくことを検討している中で、gBizConnectを3月末にサービス終了することといたしました。ご利用を検討頂いていた方には、終了に伴いご不便をおかけすることをお詫び申し上げます。<br>
なお、gBizConnectの資材につきましては、現在公開している<a href="https://github.com/gbizconnect/" target="_blank">GitHub</a>と<a href="https://hub.docker.com/u/gbizconnect/" target="_blank">DockerHub</a>にて引き続き提供させて頂きますが、今後は特段のメンテナンス予定はございませんので、ライセンスに準じて自己責任にてご利用頂けますようお願い申し上げます。また、資材提供においても終了となる可能性がございますので、予めご承知おきください。<br>
改めて、ご理解とご協力を賜りますようお願い申し上げます。

gBizConnect運営事務局

2022年3月29日<br>下記変更によりgbizconnect-nodeのバージョンがv2.0.0になりました。
- Gビズコネクトのドメインが「gbiz-connect.go.jp」に変わりました。
- ログ転送機能のOSがRedHat Universal Base Images Minimal 8.5に変わりました。

2021年12月20日<br>「Apache Log4j」の脆弱性(CVE-2021-44228)について、対策を実施いたしました。
当該リポジトリ(gbizconnect-node)においては、「Apache Log4j」の脆弱性(CVE-2021-44228)による影響はございません。

2021年09月01日<br>デジタル庁設置に伴い、本プラットフォームを経済産業省からデジタル庁へ移管しました。
ドメイン名やサーバー証明書の名義等が当面の間、旧所管府省名となっておりますが、システムを御利用いただくに当たって支障はございません。

# **gBizConnectについて**

## プロダクトのコンセプト  
* gBizConnect(法人データ連携基盤)とは、法人向け行政手続における添付書類撤廃・ワンスオンリーのための基盤として、官民が保有する法人情報を閲覧・取得して申請処理等に活用する仕組みを提供します。

<div align="center">
<img src="docs/img/concept.png">
</div>  

## プロダクト概要  
* gBizConnectは、法人データを利用して手続きの申請処理等を行うデータ要求システムと、 法人データを蓄積しデータ要求システムへ法人データを提供するデータ提供システムの間で、インターネットを介してAPIによるシステム連携を行う仕組みです。
* システム連携を行うデータ要求システムとデータ提供システムの開発・運用の負担を軽減するため、データ連携処理や認証・認可、ログ記録等の共通機能をパッケージングしたgBizConnect Nodeを、システム連携を行うそれぞれのシステムに配布・配置することで動作します。
* また、データ要求システム及びデータ提供システムの開発者に対して情報提供や支援を行うポータルや、API・データの仕様を参照することができるカタログ、認証・認可やgBizConnectへの参加システムを管理するシステム・サービス管理等の共通的な機能等をgBizConnect Portalにて提供します。

<div align="center">
<img src="docs/img/System.png">
</div>  


## gBizConnect利用のメリット  

gBizConnectを利用することで、次のメリットがもたらされます。

* 手続きコストの削減

　　特定の行政手続きを行った後に、申請した申請内容を別の行政手続きで、参照取得することができます。（ワンスオンリー）

* システム開発コストの削減

　　データ連携に必要な機能(アクセス管理、流量制御、ログ集約・可視化、利用状況管理)を共通化することにより、個々のシステムの機能開発負荷を軽減できます。

* データ利活用の容易性

　　データを法人標準データの形式で取得可能とすることで、データ品質を一定化することができます。

gBizConnectを利用するシステムが増えるほど、これらのメリットの効果を上げることができます。

<div align="center">
<img src="docs/img/merit.png">
</div>    

## 環境構築  
以下のドキュメントを参照してください。
* [gBizConnect Node導入マニュアル](docs/gBizConnectNode_Manual.md)  
* [gBizConnect Node仕様書](docs/gBizConnectNode.md)  


## gBizConnect Node APIの実装に使用している主なライブラリ等
* OpenID Connectの認可コードフローの処理に下記URLのライブラリとその依存ライブラリを使用しています。  
https://github.com/zmartzone/lua-resty-openidc

* OAuth 2.0 Token Introspectionの処理は下記URLのソースを基にしています。  
https://github.com/nginxinc/NGINX-Demos/tree/master/oauth2-token-introspection-oss

* docker-edge-moduleのDockerfileは下記URLのDockerfileを基にnjsとLuaライブラリを追加しています。  
https://github.com/ilagnev/docker-alpine-nginx-lua

## gBizConnect関連資料
  * [gBizConnect ガイドライン](docs/gBizConnect_guidelines.pdf)
  * [gBizConnect 利用規約](docs/gBizConnect_Riyoukiyaku.pdf)  
  * [gBizConnect プライバシーポリシー](docs/gBizConnect_privacy.md)
  * [gBizConnect セキュリティ管理方針](docs/gBizConnect_security.pdf)
  * [gBizConnect よくあるお問い合わせ](docs/gBizConnect_faq.pdf)

 ### gBizConnect Node

  * [gBizConnect Node導入マニュアル](docs/gBizConnectNode_Manual.md)  
  * [gBizConnect Node仕様書](docs/gBizConnectNode.md)  

 ### gBizConnect Portal
  * [gBizConnect Portal サービス仕様書](docs/gBizConnectPortal_service.pdf)



 ## gBizConnectと関連のあるシステム  
 * [gBizID](https://gbiz-id.go.jp/top/)


 ## プロダクトロゴ  
 gBizConnectでは下記のロゴを使用します。</br>
 ![logo1](docs/img/icon_posi.png)
 ![logo2](docs/img/icon_nega.png)  

 ## ライセンス  
 本ソフトウェアは、[MITライセンス](LICENSE)の元提供されています。

 ## 使用しているソフトウェアについて
使用しているソフトウェアのライセンスについては以下のドキュメントを参照してください。
* [included_licenses](docs/included_licenses.md)
