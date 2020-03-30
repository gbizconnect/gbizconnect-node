<?php
$msg = "　";

//例外処理
//E_WARNING など php で発生するエラー はその場でthrow
set_error_handler(function($error_no, $error_msg, $error_file, $error_line, $error_vars) {
    if (error_reporting() === 0) {
        return;
    }
    throw new ErrorException($error_msg, 0, $error_no, $error_file, $error_line);
});

// コード上で catch されなかった例外（Exception）をログに出力
set_exception_handler(function($throwable) {
    send_error_log(new ErrorException($throwable));
    echo '不明なエラー：エラーログを確認してください';
    return;
});

//シンタックスエラー以外の Fatal Error 
register_shutdown_function(function() {
    $error = error_get_last();
    if ($error === null) {
        return;
    }
    // fatal error の場合はすでに何らかの出力がされているはずなので、何もしない
    send_error_log(new ErrorException($error['message'], 0, 0, $error['file'], $error['line']));
});


//php のコード上で処理できない Fatal Error
ini_set('display_errors', 'Off');

//実際のエラー処理
function send_error_log($throwable) {
    // エラーログに出力
    $php_error_log_url = '/var/www/html/log/php_error.log' ; 
    //書き込み
    $log_message =$throwable->getmessage();

    $date = getUnixTimeMillSecond();
    //【実行日時(yyyy/MM/dd HH:mm:ss.SSS)】,【ログメッセージ】
    file_put_contents($php_error_log_url,$date . "," . $log_message . PHP_EOL , FILE_APPEND | LOCK_EX) ;
}

//設定変更ログ
function send_changed_config_error_log($throwable) {
    // 何かエラーをどこかに渡すコードをここに。
    $php_error_log_url = '/var/www/html/log/php_error.log' ; 
    //書き込み
    $log_message =$throwable->getmessage();
    $date = getUnixTimeMillSecond();
    //【実行日時(yyyy/MM/dd HH:mm:ss.SSS)】,【ログメッセージ】
    file_put_contents($php_error_log_url,$date . "," . $log_message . PHP_EOL , FILE_APPEND | LOCK_EX) ;
}

//共通
//画面にエラーを出さない
ini_set("display_errors", 0); 
ini_set("display_startup_errors", 0); 
//全部のエラーを出力
error_reporting(E_ALL);
//ミリ秒.SSSまで(小数点第４位を切り捨て)
function getUnixTimeMillSecond(){ 
    //microtimeを.で分割 
    $config_arrTime = explode('.',microtime(true)); 
    //日時＋ミリ秒 
    return date('Y/m/d H:i:s', $config_arrTime[0]) . '.' .substr($config_arrTime[1], 0,3)  ; 
}

//処理
//url
$url = "/var/www/html/resources/config.json";

try{
    //読み込み
    $before_config = file_get_contents($url);
    //文字化け対応
    $before_config = mb_convert_encoding($before_config, 'UTF8', 'ASCII,JIS,UTF-8,EUC-JP,SJIS-WIN');
    //連想配列に
    $before_config_arr = json_decode($before_config,true,JSON_THROW_ON_ERROR);
}catch (ErrorException $e){
    send_error_log(new ErrorException($e));
    echo '<h1>永続領域に存在する設定ファイルが読み込めません。<br>ログを参照してください。<h1>';
    return;
}

if ($_SERVER["REQUEST_METHOD"] != "POST"){
    // ブラウザからHTMLページを要求された場合
    if ($before_config_arr === NULL) {
        //初期値false
        $msg = "<h1>設定ファイルがJSON形式ではありません。</h1>";
    }else{
        $msg = "<h1></h1>";
    }
    $config =$before_config;
}else{
    // フォームからPOSTによって要求された場合(保存反映の場合)
    try{
        $refer_config =  file_get_contents($_FILES['userfile']['tmp_name']);
        //文字化け対応
        $refer_config = mb_convert_encoding($refer_config, 'UTF8', 'ASCII,JIS,UTF-8,EUC-JP,SJIS-WIN');
        //連想配列に
        $refer_config_arr = json_decode($refer_config,true,JSON_THROW_ON_ERROR);
        if ($refer_config_arr === NULL) {
            $msg = "<h1>設定の反映に失敗しました。<br>参照するファイルがJSON形式ではありません。</h1>";
            send_error_log(new ErrorException('The file is not JSON format.'));
            $config =$before_config;
        }else{
            $config =$refer_config;
            // 
            file_put_contents($url,$config );
            // 書き込み成功
            $msg = "<h1>設定の反映が完了しました。</h1>";
            send_changed_config_error_log(new ErrorException('The data has been updated.'));
           
        }
    }catch (ErrorException $e){
        //Filename cannot be empty
        if(strcmp($e->getmessage(),"file_get_contents(): Filename cannot be empty")==0){
            $msg = "<h1>参照するファイルが指定されていません。</h1>" ;
            send_error_log(new ErrorException("The file is not."));
        }else{
            $msg = "<h1>設定の反映に失敗しました。</h1>" ;
            send_error_log(new ErrorException($e));
        }
        $config =$before_config;
    }
}
?>

<!DOCTYPE html>
<html lang = "ja">
<head>
<meta charset = "UTF-8">
<title>gBizConnect Node設定画面</title>
</head>
<body>
<h1>gBizConnect Node設定項目一覧</h1>
<h2><?php echo $msg;?></h2>
<!-- 保存反映form  -->
<form  name="file1" enctype="multipart/form-data" action="setting.php" method="POST">
<!-- MAX_FILE_SIZE は、必ず "file" input フィールドより前 -->
<input type="hidden" name="MAX_FILE_SIZE" value="30000" >
<!-- input 要素の name 属性の値が、$_FILES 配列のキー-->
<input name="userfile" type="file">
<!-- <br>現在の設定ファイル<br>  -->
<!-- <?php echo $config; ?> -->
<!-- 送信-->
<br/>
<p><input type="submit" value="保存"></p>
</form>
</body>
</html>