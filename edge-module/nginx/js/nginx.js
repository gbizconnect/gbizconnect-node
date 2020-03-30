/**
 * デバッグ用メソッド
 * The HTTP request object
 * @param {Object} r
 * @return {string} s
 * */
function summary(r) {
    var a, s, h, value;
    s = "";
    s += "Method: " + r.method + "\n";
    s += "HTTP version: " + r.httpVersion + "\n";
    s += "Host: " + r.headersIn.host + "\n";
    s += "Remote Address: " + r.remoteAddress + "\n";
    s += "URI: " + r.uri + "\n";
    s += "requestBody: " + r.requestBody + "\n";
    s += "Args:\n";
    for (a = 0; a < r.args.length; a++) {
        if (r.args[a].length > 100) {
            value = r.args[a].substring(0, 30) + "..." + r.args[a].substring(r.args[a].length - 30, r.args[a].length);
        } else {
            value = r.args[a];
        }
        s += "  arg '" + a + "' is '" + value + "'\n";
    }
    s += "Headers:\n";
    for (h = 0; h < r.headersIn.length; h++) {
        if (r.headersIn[h].length > 100) {
            value = r.headersIn[h].substring(0, 30) + "..." + r.headersIn[h].substring(r.headersIn[h].length - 30, r.headersIn[h].length);
        } else {
            value = r.headersIn[h];
        }
        s += "  header '" + h + "' is '" + value + "'\n";
    }
    s += "HeadersOut:\n";
    for (h = 0; h < r.headersOut.length; h++) {
        if (r.headersOut[h].length > 100) {
            value = r.headersOut[h].substring(0, 30) + "..." + r.headersOut[h].substring(r.headersOut[h].length - 30, r.headersOut[h].length);
        } else {
            value = r.headersOut[h];
        }
        s += "  headerOut '" + h + "' is '" + value + "'\n";
    }
    return s;
}

/** 定数 */
/** API参照側:1 API提供側:2*/
var RP_FLAG = {
    'REFERENCE': 1,
    'PROVISION': 2,
};

/** GET:1 SET:2*/
var GET_SET_FLAG = {
    'GET': 1,
    'SET': 2,
};

/** クライアントエラーステータスコードメッセージ */
var CLIENT_ERROR_CODE_MESSAGES = {
    "400": "Bad Request",
    "401": "Unauthorized",
    "403": "Forbidden",
    "404": "Not Found",
    "405": "Method Not Allowed",
    "406": "Not Acceptable",
    "409": "Conflict",
    "410": "Gone",
    "413": "Payload Too Large",
    "414": "URI Too Long",
    "415": "Unsupported Media Type",
    "429": "Too Many Requests",
};

/** サーバエラーステータスコードメッセージ*/
var SERVER_ERROR_CODE_MESSAGES = {
    "500": "Internal Server Error",
    "502": "Bad Gateway",
    "503": "Service Unavailable",
    "504": "Gateway Timeout",
};

/**
 * 400xエラー
 * @param {Object} r
 */
function getClientErrorResponse(r) {
    r.return(parseInt(r.variables.status), createErrorResponse(r, CLIENT_ERROR_CODE_MESSAGES, 400));
}

/**
 * 500xエラー
 * @param {Object} r
 */
function getServerErrorResponse(r) {
    r.return(parseInt(r.variables.status), createErrorResponse(r, SERVER_ERROR_CODE_MESSAGES, 500));
}

/**
 * データストアを呼び出す
 * @private
 * @param {Object} r
 * @param {string} errorCodeMessage
 * @param {string} defaultStatusCode
 * @return {string} '{"error":{"message":"' + statusCodeMsg + '"}}';
 */
function createErrorResponse(r, errorCodeMessage, defaultStatusCode) {
    var statusCode = r.variables.status;
    var statusCodeMsg;
    if (errorCodeMessage[statusCode]) {
        statusCodeMsg = errorCodeMessage[statusCode];
    } else {
        statusCodeMsg = errorCodeMessage[defaultStatusCode];
    }
    return '{"error":{"message":"' + statusCodeMsg + '"}}';
}

/**
 * レスポンス用例外クラスとコンストラクタ
 * @private
 * @param {string} status HTTPステータスコード
 * @param {string} responseMessage レスポンスメッセージ
 * @param {string} logMessage ログ用メッセージ
 */
function EdgeError(status, responseMessage, logMessage) {
    this.status = status;
    this.responseMessage = responseMessage;
    if (typeof (logMessage) === "undefined") {
        this.logMessage = responseMessage;
    } else {
        this.logMessage = logMessage;
    }
    this.getStatus = function () {
        return this.status;
    };
    this.getResponseMessage = function () {
        return this.responseMessage;
    };
    this.getLogMessage = function () {
        return this.logMessage;
    };
    this.getJsonResponse = function () {
        return "{\"error\":{\"message\":\"" + this.responseMessage + "\"}}";
    };
}

/**
 *
 * @private
 * @param {string} status HTTPステータスコード
 * @param {string} responseBody レスポンス
 * @return {JSON|EdgeError}
 */
function toJSON(status, responseBody) {
    try {
        JSON.parse(responseBody);
        return responseBody;
    } catch (error) {
        return new EdgeError(status, responseBody).getJsonResponse();
    }
}

/**
 * 設定ファイルから読み込んだcall_apiマッピング
 * nginxに変数のセットするため,js_set で呼び出される
 * @param {Object} r
 * @return {string} call_system_api;
 */
function get_call_system_api(r) {
    var internal_api_mappings = config_json.internal_api_mappings;
    var call_api_uri = r.variables.request_uri;
    for (var i = 0; i < internal_api_mappings.length; i++) {
        var internal_api_mapping = internal_api_mappings[i];
        var extrRegExp = new RegExp(internal_api_mapping.system_api_uri_extract, 'g');
        if (call_api_uri.match(extrRegExp).length) {
            // addrを変更する
            var call_system_api_addr = internal_api_mapping.system_api_addr;
            // uriを置き換える
            var replRegExp = internal_api_mapping.system_api_uri_replace;
            var call_system_api_uri = call_api_uri.replace(extrRegExp, replRegExp);
            // addr + uri
            return call_system_api_addr + call_system_api_uri;
        }
    }
    print_errorlog(r, RP_FLAG.PROVISION, "Internal Mapping Error", "This URI cannot do API mapping.(call_api:" + call_api_uri + ")");
    throw new Error("Internal Mapping Error");
}

/**
 * グローバル変数
 * 設定ファイルを読み込む
 */
var config_json = getConfig();

/**
 * 設定ファイル取得
 * @private
 * @return {JSON|EdgeError}
 */
function getConfig() {
    // 設定ファイルを読み込む
    var fs = require('fs');
    var strFile;
    try {
        strFile = fs.readFileSync('/etc/nginx/resources/config.json');
    } catch (error) {
        return new EdgeError(500, error);
    }
    try {
        // JSON OBJECT形式に
        return JSON.parse(strFile);
    } catch (error) {
        return new EdgeError(500, "Config file is not JSON.");
    }
}

/**
 * オブジェクトからパラメータを作成
 * @private
 * @param {Object} obj
 * @return {string} parameter ?aaa=bbb&ccc=ddd
 */
function create_parameter(obj) {
    var parameter = "";
    var keys = Object.keys(obj);
    for (var i = 0, l = keys.length; i < l; i++) {
        if (i === 0) {
            parameter += keys[i] + "=" + obj[keys[i]];
        } else {
            parameter += "&" + keys[i] + "=" + obj[keys[i]];
        }
    }
    return parameter;
}

/**
 * POST送信時の
 * リクエストボディをデコードする
 * @private
 * @param {Object} r
 * @return {obj|EdgeError}
 */
function decode_requestBody(r) {
    if (typeof (r.requestBody) === "undefined") {
        return new EdgeError(400, "No Request Body.");
    }
    var request_body = r.requestBody;

    var requestBody_KV_array = request_body.split('&');
    var requestBody_json = {};
    requestBody_json["headers"] = [];
    var i = 0;
    var parameterArray = [];
    requestBody_KV_array.forEach(function (value) {
        var keyValue_array = [];
        var count = value.match(new RegExp("=", "g")).length;
        if (count === 0) {
            parameterArray[i++] = "This parameter[" + value + "] does not contain equals.";
        } else if (count === 1) {
            keyValue_array[0] = value.replace(/([^=]+)=(.*)/, "$1");
            keyValue_array[1] = value.replace(/([^=]+)=(.*)/, "$2");
        } else {
            parameterArray[i++] = "This parameter[" + value + "] contains multiple equals.";
        }
        if (keyValue_array[0] === "header") {
            var headerArray = decodeURIComponent(keyValue_array[1]).split(':');
            if (typeof (requestBody_json[decodeURIComponent(headerArray[0].toLowerCase())]) === "undefined") {
                requestBody_json[decodeURIComponent(headerArray[0].toLowerCase())] = decodeURIComponent(headerArray[1]).trim();
            } else {
                parameterArray[i++] = "This header parameter[" + headerArray[0] + "] has multiple keys.";
            }
        } else {
            if (typeof (requestBody_json[decodeURIComponent(keyValue_array[0])]) === "undefined") {
                requestBody_json[decodeURIComponent(keyValue_array[0])] = decodeURIComponent(keyValue_array[1]);
            } else {
                parameterArray[i++] = "This parameter[" + keyValue_array[0] + "] has multiple keys.";
            }
        }
    });

    if (parameterArray.length > 0) {
        return new EdgeError(400, parameterArray.join());
    }

    // リクエストボディのチェック
    var call_api_uri = requestBody_json.call_api;
    var call_api_method = requestBody_json.method;
    var call_api_content_type = requestBody_json["content-type"];
    var call_api_body = requestBody_json.body;

    // call_api
    // key なし
    if (typeof (call_api_uri) === "undefined") {
        return new EdgeError(400, "This parameter[call_api] is missing.");
    }
    // value 不正:http https ではない
    if (!call_api_uri.match(new RegExp("^https?://", ""))) {
        return new EdgeError(400, "This parameter[call_api] must start with http or https.[" + requestBody_json.call_api + "]");
    }

    // method
    // key なし
    if (typeof (call_api_method) === "undefined") {
        return new EdgeError(400, "This parameter[method] is missing.");
    }

    // header Content-type
    // key なし
    if (call_api_method !== "GET" && typeof (call_api_content_type) === "undefined") {
        return new EdgeError(400, "This header parameter[Content-Type] is missing.");
    }
    // value 不正
    if (call_api_method !== "GET" && !call_api_content_type.match("application/json")) {
        return new EdgeError(400, "This header parameter[Content-Type] is not [application/json].");
    }

    // body
    // key なし
    // GET bodyあり
    if (call_api_method === "GET" && typeof (call_api_body) !== "undefined") {
        return new EdgeError(400, "This method[" + call_api_method + "] does not require HTTP Request body.");
    }
    // GET以外 bodyなし
    if (call_api_method !== "GET" && typeof (call_api_body) === "undefined") {
        return new EdgeError(400, "This method[" + call_api_method + "] requires HTTP Request body.");
    }
    // value 不正
    try {
        if (call_api_method !== "GET") {
            JSON.parse(call_api_body);
        }
    } catch (error) {
        return new EdgeError(400, "This parameter[body] is not JSON.");
    }

    return requestBody_json;
}

/**
 * 日付フォーマット関数
 * @private
 * @param {Date} date
 * @return {string} yyyy/MM/dd HH:mm:ss.SSS
 */
function formatDate(date) {
    var format = 'yyyy/MM/dd HH:mm:ss.SSS';
    format = format.replace(/yyyy/g, date.getFullYear());
    format = format.replace(/MM/g, ('0' + (date.getMonth() + 1)).slice(-2));
    format = format.replace(/dd/g, ('0' + date.getDate()).slice(-2));
    format = format.replace(/HH/g, ('0' + date.getHours()).slice(-2));
    format = format.replace(/mm/g, ('0' + date.getMinutes()).slice(-2));
    format = format.replace(/ss/g, ('0' + date.getSeconds()).slice(-2));
    format = format.replace(/SSS/g, ('00' + date.getMilliseconds()).slice(-3));
    return format;
}

/**
 * 現在のURLを取得
 * @private
 * @param {Object} r
 * @return {string}
 */
function getHostFullUrl(r) {
    return r.variables.scheme + "://" + r.variables.http_host + r.variables.uri;
}

/**
 * APIのURLの取得
 * @private
 * @param {Object} r
 * @return {string}
 */
function getCallAPI(r) {
    return r.variables.scheme + "://" + r.variables.http_host + r.variables.x_call_api_uri;
}

/**
 * 戻り先のURLを取得
 * @private
 * @param {Object} r
 * @return {string}
 */
function getRemoteFullUrl(r) {
    return r.variables.scheme + "://" + r.variables.remote_addr + ":" + r.variables.remote_port + "/";
}

/**
 * イントロスペクションURLを取得
 * @private
 * @return {string}
 */
function getOAuth2TokenIntrospectEndpoint() {
    return config_json.oauth.oauth_token_introspect_endpoint;
}

/**
 * トークンエンドポイントURLを取得
 * @private
 * @return {string}
 */
function getOAuth2TokenEndpoint() {
    return config_json.oauth.oauth_token_endpoint;
}

/**
 * アクセスログ出力
 * @private
 * @param {Object} r
 * @param {number} rp_flag API参照側 API提供側 1,2
 * @param {string} from_uri REMOTE or HOST or ACCESS
 * @param {string} to_uri アクセスするURI
 * @param {string} method r.method もしくはcall_api_method
 * @param {string} msg メッセージ
 */
function print_accesslog(r, rp_flag, from_uri, to_uri, method, msg) {
    var arg_len_no_success = 4;
    var arg_len = 6;
    if (arguments.length !== arg_len_no_success && arguments.length !== arg_len) {
        throw new SyntaxError('It was called with ' + arguments.length + ' arguments,but ' + arg_len + ' arguments are required.' + "," + msg);
    }
    if (typeof (from_uri) === "undefined") {
        throw new SyntaxError('from_uri null.');
    }
    if (typeof (to_uri) === "undefined") {
        throw new SyntaxError('to_uri null.');
    }
    // 共通
    // API参照側とAPI提供側で分ける
    var request_id;
    if (rp_flag === RP_FLAG.REFERENCE) {
        // API参照側:reference
        request_id = r.variables.request_id;
    } else {
        // API提供側:provision
        request_id = r.variables.http_x_request_id;
    }

    // アクセス元ドメインとポート uriからprotocolとuriを削除
    var from_addr_port = from_uri.replace(/https?:\/\//, "").replace(/\/.*/, "");
    // アクセス先ドメインとポート uriからprotocolとuriを削除
    var to_addr_port = to_uri.replace(/https?:\/\//, "").replace(/\/.*/, "");

    // ログの設定変更機能
    var log_nginx_variables_str = "";
    var log_nginx_variables = config_json.log_nginx_variables;
    if (typeof (log_nginx_variables) === "undefined") {
        throw new SyntaxError('log_nginx_variables null ');
    }
    // 全出力
    log_nginx_variables.forEach(function (log_nginx_variable_obj) {
        // ","は中身によらず追加
        log_nginx_variables_str += ",";
        if (log_nginx_variable_obj["flag"] === true) {
            // trueならば追加
            var log_nginx_variable_name = log_nginx_variable_obj["log_nginx_variable"];
            log_nginx_variables_str += r.variables[log_nginx_variable_name];
        }
    });

    // 引数の検査
    if (arguments.length === arg_len_no_success) {
        // 引数4つ目は_access_point(msg)
        r.log(",Info," + request_id + "," + formatDate(new Date()) + ",-,-,-,-," + to_uri + log_nginx_variables_str);
    } else if (arguments.length === arg_len) {
        // ログ出力
        r.log(",Info," + request_id + "," + formatDate(new Date()) + "," + from_addr_port + "," + to_addr_port + "," + to_uri + "," + method + "," + msg + log_nginx_variables_str);
    }
}

/**
 * エラーログ出力
 * @private
 * @param {Object} r
 * @param {string} rp_flag API参照側:REFERENCE:1 API提供側:PROVISION:2
 * @param {string} errorName エラー名
 * @param {string} errorDetail エラー詳細 stacktraceや説明(description)
 */
function print_errorlog(r, rp_flag, errorName, errorDetail) {
    // 共通
    // API参照側とAPI提供側で分ける
    var request_id;
    if (rp_flag === RP_FLAG.REFERENCE) {
        // API参照側:reference
        request_id = r.variables.request_id;
    } else {
        // API提供側:provision
        request_id = r.variables.http_x_request_id;
    }
    r.error(",Error," + request_id + "," + formatDate(new Date()) + "," + "Error:[" + errorName + "]" + "," + "Description:[" + errorDetail + "]");
}

/**
 * アクセストークンaud,idの妥当性検証
 * @private
 * @param {Object} config_json 設定ファイル
 * @param {string} request_uri call_api_url
 * @param {string} request_method call_api_method
 * @param {Object} introspection_response introspection_response
 * @return {obj|EdgeError}\{"check_flag":boolean,"message":string"}
 */
function checkIdAud(config_json, request_uri, request_method, introspection_response) {
    var result_obj = {};

    // 1. アクセストークンのaudのチェック
    //   aud と 自分のクライアントID
    if (introspection_response["aud"] !== config_json.client_id) {
        // 一致しないとき
        return new EdgeError(403, "Client ID does not match with aud.(aud:" + introspection_response["aud"] + ")");
    }

    // マップから利用許可したクライアントIDのリストを取得
    var authorized_client_list = config_json.authorized_client_list;

    var token_client_id;
    // 2. アクセストークンのclient_idのチェック
    if (introspection_response["azp"]) {
        // azpから取得
        token_client_id = introspection_response["azp"];
    } else {
        return new EdgeError(403, "Could not get Client ID from access token.");
    }

    var client_id_exist = false;
    var authorized_client_obj;
    for (var i = 0; i < authorized_client_list.length; i++) {
        var tmp_authorized_client_obj = authorized_client_list[i];
        // 利用許可されているクライアントIDかどうか
        if (tmp_authorized_client_obj["client_id"] === token_client_id) {
            // 一致するならば、エンドポイントを比較するためいったん退避
            authorized_client_obj = tmp_authorized_client_obj;
            client_id_exist = true;
            break;
        }
    }

    // 返却用JSON作成
    if (client_id_exist !== true) {
        return new EdgeError(403, "Unpermitted Client ID.(" + token_client_id + ")");
    }

    // 3. 利用許可したAPIかチェック
    var endpoint_exist = false;
    // 退避したエンドポイントからメソッドとURIの一致をみる
    authorized_client_obj.endpoint.forEach(function (endpoint_obj) {
        if (request_uri.match(endpoint_obj.uri) && endpoint_obj.method === request_method) {
            endpoint_exist = true;
        }
    });

    // 返却用JSON作成
    if (endpoint_exist !== true) {
        return new EdgeError(403, "Unpermitted URI.(" + request_uri + "," + request_method + ")");
    }

    // 正常な場合のみここへ到達する
    result_obj.check_flag = true;
    return result_obj;
}

/**
 * オブジェクトの最下層の値の取得
 * @private
 * @param {Object} obj 取得用オブジェクト
 * @param {Array<string>} array "."で分割した配列
 * @return {Object} obj
 */
function getEndValue(obj, array) {
    var deepNum = 0;
    while (deepNum < array.length) {
        if (typeof (obj[array[deepNum]]) === "undefined") {
            // 存在しないKeyは取得しない
            return;
        } else {
            // 階層を一つ進める
            obj = obj[array[deepNum]];
        }
        deepNum++;
    }
    // 現在の階層の値をreturn
    return obj;
}

/**
 * オブジェクトの最下層の値への登録
 * @private
 * @param {string} value セットする値
 * @param {Object} obj 登録用オブジェクト
 * @param {Array<string>} array "."で分割した配列
 */
function setEndValue(value, obj, array) {
    if (typeof (value) === "undefined") {
        return;
    }
    var deepNum = 0;
    while (deepNum < array.length - 1) {
        if (typeof (obj[array[deepNum]]) === "undefined") {
            // 現在のeditJSONに存在しないなら新規作成
            obj[array[deepNum]] = {};
        }
        // 階層を一つ進める
        obj = obj[array[deepNum]];
        deepNum++;
    }
    // 現在の階層へ値を登録
    obj[array[deepNum]] = value;
    return;
}

/**
 * マッピング
 * @private
 * @param {Object} obj
 * @param {Array<Object>} json_convert_mappings
 * @param {number} get_set_flag
 * @return {Object} edit_obj
 */
function mapping(obj, json_convert_mappings, get_set_flag) {
    var edit_obj = {};

    var methodNum = 0;
    if (get_set_flag === GET_SET_FLAG.GET) {
        methodNum++;
    }

    for (var i = 0; i < json_convert_mappings.length; i++) {
        var mapping = json_convert_mappings[i];
        var array_datastore = mapping.datastore.split(".");
        var array_response = mapping.response.split(".");
        var arrayArray = [array_datastore, array_response];
        // XOR GET 1^1->0 1^0->1 ^GET 0^1->1 0^0->0
        var endValue = getEndValue(obj, arrayArray[methodNum ^ 1]);
        setEndValue(endValue, edit_obj, arrayArray[methodNum ^ 0]);
    }
    return edit_obj;
}

/**
 * JSON変換
 * @private
 * @param {Object} r
 * @param {string} org_json_str
 * @param {number} get_set_flag
 * @return {Object}
 */
function convert_json(r, org_json_str, get_set_flag) {
    var call_api_uri = r.variables.request_uri;
    var call_api_method = r.method;
    // json_converts
    var json_converts = config_json.json_converts;

    for (var i = 0; i < json_converts.length; i++) {
        var json_convert = json_converts[i];
        if (call_api_uri.match(json_convert.json_convert_uri)
            && call_api_method.match(json_convert.json_convert_method)) {
            // json_flagの取得
            var json_flag;
            if (get_set_flag === GET_SET_FLAG.GET) {
                json_flag = json_convert.json_convert_get_flag;
            } else {
                json_flag = json_convert.json_convert_set_flag;
            }
            // json_flag=falseもしくはundefinedのときJSON変換は行わない
            if (!json_flag) {
                return org_json_str;
            }
            var json_convert_rule = json_convert.json_convert_rule;
            var json_convert_rules = config_json.json_convert_rules;
            var json_convert_mappings = json_convert_rules[json_convert_rule];
            if (typeof (json_convert_mappings) === "undefined") {
                // ルールがないときは変換しない
                r.warn("json_convert_mappings variable is undefined.");
                break;
            }
            // 編集するためにオブジェクトに変換
            var tmpJson = JSON.parse(org_json_str);
            var edit_json;
            if (Array.isArray(tmpJson)) {
                edit_json = [];
                for (var num = 0; num < tmpJson.length; num++) {
                    var edit_obj = mapping(tmpJson[num], json_convert_mappings, get_set_flag);
                    edit_json.push(edit_obj);
                }
            } else {
                edit_json = mapping(tmpJson, json_convert_mappings, get_set_flag);
            }
            // 編集したデータをJSON形式に変換
            var edit_json_str = JSON.stringify(edit_json);
            return edit_json_str;
        }
    }
    // URIが一致しない場合、JSON変換はしない
    r.warn("This API can not perform JSON conversion.");
    return org_json_str;
}

/**
 * audに登録するクライアントIDを取得
 * @private
 * @param {string} call_api
 * @return {string|EdgeError}
 */
function get_aud_scope(call_api) {
    var aud_scope;
    var authorized_server_list = config_json["authorized_server_list"];
    authorized_server_list.forEach(function (authorized_server) {
        var domain = authorized_server.domain;
        if (!isEmpty(domain) && call_api.match(domain)) {
            aud_scope = authorized_server.client_id;
        }
    });
    if (isEmpty(aud_scope)) {
        return new EdgeError(400, "Unable to get client_id of Destination Server.");
    }
    return aud_scope;
}

/**
 * 空判定
 * value =undefined true
 * value ="" true
 * @private
 * @param {string} value
 * @return {boolean}
 */
function isEmpty(value) {
    return (typeof (value) === "undefined") || (value === "");
}

/**
 * アクセストークンの取得 (事前同意)
 * BASE64エンコードおよびアクセストークンの取得
 * @param {Object} r
 */
function get_access_token(r) {
    // 設定ファイルの不正はリターン
    if (config_json instanceof EdgeError) {
        print_errorlog(r, RP_FLAG.REFERENCE, "Config File Error", config_json.getLogMessage());
        r.return(config_json.getStatus(), config_json.getJsonResponse());
        return;
    }
    print_accesslog(r, RP_FLAG.REFERENCE, getRemoteFullUrl(r), getHostFullUrl(r), r.method, "Succeeded in calling the Internal API.");

    var basicAuthPlaintext = config_json["client_id"] + ":" + config_json["client_secret"];
    // base64変換
    var authHeader = "Basic " + basicAuthPlaintext.toBytes().toString('base64');
    // リクエストボディをデコード
    var requestBody_json = decode_requestBody(r);
    if (requestBody_json instanceof EdgeError) {
        print_errorlog(r, RP_FLAG.REFERENCE, "HTTP Request Error", requestBody_json.getLogMessage());
        r.return(requestBody_json.getStatus(), requestBody_json.getJsonResponse());
        return;
    }
    // scope組み立て
    var scope = get_aud_scope(requestBody_json.call_api);
    if (scope instanceof EdgeError) {
        print_errorlog(r, RP_FLAG.REFERENCE, "Config File Error", scope.getLogMessage());
        r.return(scope.getStatus(), scope.getJsonResponse());
        return;
    }

    print_accesslog(r, RP_FLAG.REFERENCE, getHostFullUrl(r), getOAuth2TokenEndpoint(), r.method, "Called Authorization Server.");
    var uri = "/_oauth2_client_credentials_request";
    r.subrequest(uri,
        { method: r.method, body: "grant_type=client_credentials" + "&scope=" + scope, args: "authorization=" + authHeader },
        function (reply) {
            var response;
            if (200 <= reply.status && reply.status < 300) {
                try {
                    response = JSON.parse(reply.responseBody);
                    // 認証の成功を確認する
                    if (typeof (response.access_token) !== "undefined") {
                        // 認証に成功している場合
                        print_accesslog(r, RP_FLAG.REFERENCE, getOAuth2TokenEndpoint(), getHostFullUrl(r), r.method, "Succeeded in calling Authorization Server.");
                        // 法人データモジュール へリクエストを投げる
                        call_edgemodule(r, response.access_token, requestBody_json);
                    } else {
                        // 認証に失敗している場合
                        print_accesslog(r, RP_FLAG.REFERENCE, getOAuth2TokenEndpoint(), getHostFullUrl(r), r.method, "Invalid error.");
                        print_errorlog(r, RP_FLAG.REFERENCE, "Authorization Error", reply.responseBody);
                        r.return(reply.status, reply.responseBody);
                        return;
                    }
                } catch (e) {
                    print_accesslog(r, RP_FLAG.REFERENCE, getOAuth2TokenEndpoint(), getHostFullUrl(r), r.method, "Failed to call Authorization Server.");
                    print_errorlog(r, RP_FLAG.REFERENCE, "Authorization Error", reply.responseBody);
                    r.return(reply.status, reply.responseBody);
                    return;
                }
            } else {
                // 成功レスポンス以外
                print_accesslog(r, RP_FLAG.REFERENCE, getOAuth2TokenEndpoint(), getHostFullUrl(r), r.method, "Failed to call Authorization Server.");
                print_errorlog(r, RP_FLAG.REFERENCE, "Authorization Error", reply.responseBody);
                r.return(reply.status, toJSON(reply.status, reply.responseBody));
                return;
            }
        }
    );
}

/**
 * ログを出した後、luaへ接続(個別同意)
 * @param {Object} r
 */
function redirect_authorized(r) {
    print_accesslog(r, RP_FLAG.REFERENCE, getRemoteFullUrl(r), getHostFullUrl(r), r.method, "Succeeded in calling the Internal API.");
    print_accesslog(r, RP_FLAG.REFERENCE, getHostFullUrl(r), getRemoteFullUrl(r), r.method, "Requested Authentication screen.");
    var uri = "/authorized";
    r.internalRedirect(uri);
}

/**
 * モジュールへ接続 (個別、事前共通)
 * @private
 * @param {Object} r
 * @param {string} access_token
 * @param {Object} requestBody_json
 */
function call_edgemodule(r, access_token, requestBody_json) {
    var call_api = requestBody_json.call_api;
    var call_api_method = requestBody_json.method;
    var call_api_accept = typeof (requestBody_json.accept) === "undefined" ? "" : requestBody_json.accept;
    var call_api_contentType = typeof (requestBody_json["content-type"]) === "undefined" ? "" : requestBody_json["content-type"];
    var call_api_body = requestBody_json.body;

    print_accesslog(r, RP_FLAG.REFERENCE, getHostFullUrl(r), call_api, call_api_method, "Called the External API.");

    var uri = "/_call_edgemodule";
    var args = "access_token=" + access_token + "&call_uri=" + call_api + "&contentType=" + call_api_contentType + "&accept=" + call_api_accept;

    r.subrequest(uri,
        { method: call_api_method, args: args, body: call_api_body },
        function (reply) {
            if (200 <= reply.status && reply.status < 300) {
                // 正常
                print_accesslog(r, RP_FLAG.REFERENCE, call_api, getHostFullUrl(r), r.method, "Succeeded in calling the External API.(request_time:" + reply.variables.request_time + "s)");
            } else {
                // エラーログのメッセージ
                print_accesslog(r, RP_FLAG.REFERENCE, call_api, getHostFullUrl(r), r.method, "Failed to call the External API.");
                print_errorlog(r, RP_FLAG.REFERENCE, "Call Node API Error", reply.responseBody);
            }
            // 上記以外のステータスはログ
            // 共通
            print_accesslog(r, RP_FLAG.REFERENCE, getHostFullUrl(r), getRemoteFullUrl(r), r.method, "Called the Internal API.");
            // そのまま返却する
            r.return(reply.status, toJSON(reply.status, reply.responseBody));
            return;
        }
    );
}

/**
 * 個別同意
 * 取得
 * @param {Object} r
 */
function tsudodoi(r) {
    print_accesslog(r, RP_FLAG.REFERENCE, getRemoteFullUrl(r), getHostFullUrl(r), r.method, "Succeeded in calling the Internal API.");
    print_accesslog(r, RP_FLAG.REFERENCE, getHostFullUrl(r), getRemoteFullUrl(r), r.method, "Requested Authentication screen.");

    print_accesslog(r, RP_FLAG.REFERENCE, getHostFullUrl(r), getOAuth2TokenEndpoint(), r.method, "Called Authorization Server.");
    print_accesslog(r, RP_FLAG.REFERENCE, getOAuth2TokenEndpoint(), getHostFullUrl(r), r.method, "Succeeded in calling Authorization Server.");
    // リクエストボディをデコード
    var requestBody_json = decode_requestBody(r);
    if (requestBody_json instanceof EdgeError) {
        print_errorlog(r, RP_FLAG.REFERENCE, "HTTP Request Error", requestBody_json.getLogMessage());
        r.return(requestBody_json.getStatus(), requestBody_json.getJsonResponse());
        return;
    }
    // 法人データモジュール へリクエストを投げる
    call_edgemodule(r, r.variables.http_x_access_token, requestBody_json);
}

/**
 * イントロスペクション
 * @param {Object} r
 */
function introspectAccessToken(r) {
    // 設定ファイルの不正はリターン
    if (config_json instanceof EdgeError) {
        print_errorlog(r, RP_FLAG.REFERENCE, "Config File Error", config_json.getLogMessage());
        r.return(config_json.getStatus(), config_json.getJsonResponse());
        return;
    }
    print_accesslog(r, RP_FLAG.PROVISION, getRemoteFullUrl(r), getCallAPI(r), call_api_method, "Succeeded in calling the External API.");

    // イントロスペクションリクエストのAuthorizationヘッダーを準備する
    var basicAuthPlaintext = config_json["client_id"] + ":" + config_json["client_secret"];
    // base64変換
    var authHeader = "Basic " + basicAuthPlaintext.toBytes().toString('base64');

    var call_api_method = r.variables.call_api_method;

    print_accesslog(r, RP_FLAG.PROVISION, getHostFullUrl(r), getOAuth2TokenIntrospectEndpoint(), call_api_method, "Called Authorization Server.");
    // Make the OAuth 2.0 Token Introspection request
    r.subrequest("/_oauth2_send_introspection_request", "token=" + r.variables.access_token + "&authorization=" + authHeader,
        function (reply) {
            if (reply.status !== 200) {
                print_accesslog(r, RP_FLAG.PROVISION, getOAuth2TokenIntrospectEndpoint(), getCallAPI(r), call_api_method, "Failed to call Authorization Server.");
                print_errorlog(r, RP_FLAG.REFERENCE, "Authorization Error", reply.responseBody);
                r.return(401);// 401 Authorization Required
                return;
            }
            // We have a response from authorization server, validate it has expected JSON schema
            try {
                var response = JSON.parse(reply.responseBody);
                // We have a valid introspection response
                // Check for validation success
                if (response.active === true) {
                    print_accesslog(r, RP_FLAG.PROVISION, getOAuth2TokenIntrospectEndpoint(), getCallAPI(r), call_api_method, "Succeeded in calling Authorization Server.");
                    // Iterate over all members of the response and return them as response headers
                    r.headersOut['token-response'] = reply.responseBody;
                    r.status = 204;
                    r.sendHeader();
                    r.finish();
                    return;
                } else {
                    print_accesslog(r, RP_FLAG.PROVISION, getOAuth2TokenIntrospectEndpoint(), getCallAPI(r), call_api_method, "OAuth token introspection found inactive token.");
                    print_errorlog(r, RP_FLAG.REFERENCE, "Authorization Error", reply.responseBody);
                    r.return(403);
                    return;
                }
            } catch (e) {
                print_accesslog(r, RP_FLAG.PROVISION, getOAuth2TokenIntrospectEndpoint(), getCallAPI(r), call_api_method, "OAuth token introspection response is not JSON: " + reply.body);
                print_errorlog(r, RP_FLAG.REFERENCE, "Authorization Error", reply.responseBody);
                r.return(401);// 401 Authorization Required
                return;
            }
        }
    );
}

/**
 * データストアを呼び出す
 * @param {Object} r
 */
function call_system_api_init(r) {
    // 有効なイントロスペクション応答があるか確認します
    var introspection_response_str = r.variables.token_response;
    var introspection_response = JSON.parse(introspection_response_str);

    // デコード
    var call_api = getCallAPI(r);
    var call_api_method = r.method;
    // アクセストークンaud,idの妥当性検証
    var check = checkIdAud(config_json, call_api, call_api_method, introspection_response);
    if (check instanceof EdgeError) {
        r.return(check.getStatus(), check.getJsonResponse());
        print_errorlog(r, RP_FLAG.PROVISION, "Validation Error", check.getLogMessage());
        return;
    }

    // 内部のsystemAPIへの変更はここ
    // methodは各APIを引き継ぐ
    var call_system_api_method = call_api_method;
    // call_system_api のURL設定
    // nginxのjs_setディレクティブからメソッドを呼び出すためここでは処理なし

    // パラメータ
    var param_obj = {};
    // 既存のパラメータを追加
    Object.keys(r.args).forEach(function (key) {
        param_obj[key] = this[key];
    }, r.args);
    // 新規に追加するパラメータの設定
    if (typeof (introspection_response.gbizid_sub) !== "undefined") {
        param_obj.sub = encodeURIComponent(introspection_response.gbizid_sub);
        param_obj.account_type = encodeURIComponent(introspection_response.gbizid_account_type);
        param_obj.scope = encodeURIComponent(introspection_response.scope);
    }
    // パラメータの作成
    var parameter = create_parameter(param_obj);

    // requestBody
    var requestBody = r.requestBody;
    requestBody = convert_json(r, r.requestBody, GET_SET_FLAG.SET);

    print_accesslog(r, RP_FLAG.PROVISION, getHostFullUrl(r), get_call_system_api(r), call_system_api_method, "Called the Internal API.");
    var uri = "/_call_system_api";
    // システムのAPIを呼び出す
    r.subrequest(uri,
        { method: call_system_api_method, args: parameter, body: requestBody },
        function (reply) {
            // エラー用レスポンスボディ退避
            var responseBody = reply.responseBody;
            if (r.method === "GET") {
                if (reply.status === 200) {
                    // 例外情報からメッセージを取得
                    print_accesslog(r, RP_FLAG.PROVISION, r.method, "Completed the acquisition of data.");
                    // 正常な場合JSON変換を行う
                    responseBody = convert_json(r, reply.responseBody, GET_SET_FLAG.GET);
                } else if (reply.status === 404) {
                    // 例外情報からメッセージを取得
                    print_accesslog(r, RP_FLAG.PROVISION, r.method, "The data is not registered.");
                } else {
                    print_errorlog(r, RP_FLAG.REFERENCE, "Call SYSTEM API Error", reply.responseBody);
                    // JSON形式で返却する;
                    r.return(reply.status, toJSON(reply.status, reply.responseBody));
                    return;
                }
            } else {
                if (reply.status === 200) {
                    // データストアに正常に書き込み完了
                    print_accesslog(r, RP_FLAG.PROVISION, r.method, "The data has been updated.");
                    responseBody = convert_json(r, reply.responseBody, GET_SET_FLAG.GET);
                } else if (reply.status === 201) {
                    // データストアに正常に書き込み完了
                    print_accesslog(r, RP_FLAG.PROVISION, r.method, "The data has been created.");
                    responseBody = convert_json(r, reply.responseBody, GET_SET_FLAG.GET);
                } else {
                    print_errorlog(r, RP_FLAG.REFERENCE, "Call SYSTEM API Error", reply.responseBody);
                    // JSON形式で返却する;
                    r.return(reply.status, toJSON(reply.status, reply.responseBody));
                    return;
                }
            }
            print_accesslog(r, RP_FLAG.PROVISION, get_call_system_api(r), getHostFullUrl(r), r.method, "Succeeded in calling the Internal API.(request_time:" + reply.variables.request_time + "s)");
            print_accesslog(r, RP_FLAG.PROVISION, getHostFullUrl(r), getRemoteFullUrl(r), r.method, "Called the External API.");
            // そのまま返却する
            r.return(reply.status, responseBody);
        }
    );
}
