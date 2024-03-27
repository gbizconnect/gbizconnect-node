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

/** SERVER_REQUEST:1 SERVER_RESPONSE:2 CLIENT_REQUEST:3 CLIENT_RESPONSE:4*/
var CONVERT_CODE = {
    'SERVER_REQUEST': 1,
    'SERVER_RESPONSE': 2,
    'CLIENT_REQUEST': 3,
    'CLIENT_RESPONSE': 4,
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
 * 
 */
function jsonStringifyFromObject(object) {
    return JSON.stringify(object, undefined, "\t");
}

/**
 * 
 */
function jsonStringifyFromJsonString(jsonString) {
    return jsonStringifyFromObject(JSON.parse(jsonString));
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
 */
var source_client_id = "-";
var desitination_client_id = "-";

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

/** スコープマッピングの定数 */
var SCOPE_MAPPINGS = getScopeMapping();
/**
 * スコープマッピング取得
 * @private
 * @return {Array|EdgeError}
 */
function getScopeMapping() {
    try {
        return config_json.scope_mappings;
    } catch (error) {
        return new EdgeError(500, "[scope_mappings] is not included in Config file .");
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
 * decodeURIComponent に加え、+ をスペースに変更
 * URIの定義はRFC2396、RFC3986と存在するが
 * njsはRFC2396までしか対応していないため 
 * RFC3986によるエンコードへも対応できるようにするメソッド
 * @private
 * @param {string} str
 * @return {string}
 */
function decodeURIComponentForRFC3986(str) {
    if (!isEmpty(str)) {
        str = str.replace(/\+/g, "%20");
    }
    str = decodeURIComponent(str);
    return str;
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
            var headerArray = decodeURIComponentForRFC3986(keyValue_array[1]).split(':');
            if (keyValue_array[1].match('\n|\r|%0A|%0D') !== null) {
                parameterArray[i++] = "This header parameter[" + headerArray[0] + "] contains invalid characters(" + keyValue_array[1].match('\n|\r|%0A|%0D') + ")";
            }
            if (typeof (requestBody_json[decodeURIComponentForRFC3986(headerArray[0].toLowerCase())]) === "undefined") {
                requestBody_json[decodeURIComponentForRFC3986(headerArray[0].toLowerCase())] = decodeURIComponentForRFC3986(headerArray[1]).trim();
            } else {
                parameterArray[i++] = "This header parameter[" + headerArray[0] + "] has multiple keys.";
            }
        } else {
            if (typeof (requestBody_json[decodeURIComponentForRFC3986(keyValue_array[0])]) === "undefined") {
                requestBody_json[decodeURIComponentForRFC3986(keyValue_array[0])] = decodeURIComponentForRFC3986(keyValue_array[1]);
            } else {
                parameterArray[i++] = "This parameter[" + keyValue_array[0] + "] has multiple keys.";
            }
        }
    });

    if (parameterArray.length > 0) {
        return new EdgeError(400, parameterArray.join());
    }
    return requestBody_json;
}
/**
 * POST送信時の
 * リクエストボディをチェックする
 * @private
 * @param {Object} requestBody_json
 * @return {null|EdgeError}
 */
function check_requestBody(requestBody_json) {
    // リクエストボディのチェック
    var client_id = requestBody_json.client_id;
    var call_api_uri = requestBody_json.call_api;
    call_api_uri = addDefaultPort(call_api_uri);
    var call_api_method = requestBody_json.method;
    var call_api_content_type = requestBody_json["content-type"];
    var call_api_body = requestBody_json.body;

    // client_id
    // key なし
    if (typeof (client_id) === "undefined") {
        // call_api
        // key なし
        if (typeof (call_api_uri) === "undefined") {
            return new EdgeError(400, "This parameter[call_api] is missing.");
        } else if (!call_api_uri.match(new RegExp("^https?://", ""))) {
            // value 不正:http https ではない
            return new EdgeError(400, "This parameter [call_api] must start with \"https\" when the parameter [client_id] is missing.[" + requestBody_json.call_api + "]");
        }
        var domain = call_api_uri.match(/^(https?:\/{2,}.*?)\/.*/)[1];
        var authorized_server_list = config_json["authorized_server_list"];
        var flag = 0;
        authorized_server_list.forEach(function (authorized_server) {
            var authorized_server_domain = addDefaultPort(authorized_server.domain);
            if (domain === authorized_server_domain) {
                requestBody_json.client_id = authorized_server.client_id;
                flag = 1;
            }
        });
        if (flag === 0) {
            return new EdgeError(400, "This domain is not included in Config File(authorized_server_list).[" + domain + "]");
        }
        requestBody_json.call_api = call_api_uri.match(/^https?:\/{2,}.*?(\/.*)/)[1];
    } else {
        // client_id
        // key あり
        if (typeof (call_api_uri) === "undefined") {
            // call_api
            // key なし
            return new EdgeError(400, "This parameter[call_api] is missing.");
        } else if (!call_api_uri.match(new RegExp("^/", ""))) {
            // value 不正:"/"始まりではない
            return new EdgeError(400, "This parameter [call_api] must start with slash when the parameter [client_id] is added.[" + requestBody_json.call_api + "]");
        }

        // 許可されているidか
        var isIncludedAuthorizedServer = false;
        var authorized_server_list = config_json["authorized_server_list"];
        authorized_server_list.forEach(function (authorized_server) {
            if (client_id === authorized_server.client_id) {
                isIncludedAuthorizedServer = true;
            }
        });
        if (!isIncludedAuthorizedServer) {
            return new EdgeError(400, "This parameter[client_id] is not included in Config File(authorized_server_list).");
        }
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
    var call_api_body_json;
    try {
        if (call_api_method !== "GET") {
            call_api_body_json = JSON.parse(call_api_body);
        }
    } catch (error) {
        return new EdgeError(400, "This parameter[body] is not JSON.(" + call_api_body + ")");
    }
    //Binary
    // key ある場合はbinary簡易チェックを行う
    if (call_api_method !== "GET") {
        var binary = call_api_body_json["Binary"];
        if (!(typeof (binary) === "undefined")) {
            var parameterArray = [];
            var i = 0;
            //filename,data,last_modified
            var filename = binary["filename"];
            var data = binary["data"];
            var last_modified = binary["last_modified"];
            // key なし
            if (typeof (filename) === "undefined") {
                parameterArray[i++] = "This body parameter does not include the [filename] key.";
            }
            // value null or 空
            if (isEmpty(filename)) {
                parameterArray[i++] = "The [filename] value contained in this body parameter is empty.";
            }
            // key なし
            if (typeof (data) === "undefined") {
                parameterArray[i++] = "This body parameter does not include the [data] key.";
            }
            // value null or 空
            if (isEmpty(data)) {
                parameterArray[i++] = "The [data] value contained in this body parameter is empty.";
            }
            // key なし
            if (typeof (last_modified) === "undefined") {
                parameterArray[i++] = "This body parameter does not include the [last_modified] key.";
            }
            // value null or 空
            if (isEmpty(last_modified)) {
                parameterArray[i++] = "The [last_modified] value contained in this body parameter is empty.";
            }

            if (parameterArray.length > 0) {
                return new EdgeError(400, parameterArray.join());
            }
        }
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
 * システムのAuthorizationヘッダーに登録する値を取得 
 * @private
 * @return {string} 
 */
function getCallSystemApiAuthorization() {
    return nvl(config_json.call_system_api_headers.authorization, "");
}

/**
 * システムのAPIキーを使用した、独自のヘッダーに登録する値を取得 
 * @private
 * @return {string} 
 */
function getCallSystemApiApiKey() {
    return nvl(config_json.call_system_api_headers.api_key, "");
}

/**
 * アクセスログ出力
 * @private
 * @param {Object} r
 */
function create_log_nginx_variables_str(r) {
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
    return log_nginx_variables_str;
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
        request_id = r.variables.request_id;
    } else {
        // API提供側:provision
        request_id = r.variables.http_x_request_id;
    }

    // アクセス元ドメインとポート uriからprotocolとuriを削除
    var from_addr_port = from_uri.replace(/https?:\/\//, "").replace(/\/.*/, "");
    // アクセス先ドメインとポート uriからprotocolとuriを削除
    var to_addr_port = to_uri.replace(/https?:\/\//, "").replace(/\/.*/, "");

    var log_nginx_variables_str = create_log_nginx_variables_str(r);

    // 引数の検査
    if (arguments.length === arg_len_no_success) {
        // 引数4つ目は_access_point(msg)
        r.log(",Info," + request_id + "," + source_client_id + "," + desitination_client_id + "," + formatDate(new Date()) + ",-,-,-,-,\"" + to_uri.replace(/"/g, "\"\"") + "\"" + log_nginx_variables_str);
    } else if (arguments.length === arg_len) {
        // ログ出力
        r.log(",Info," + request_id + "," + source_client_id + "," + desitination_client_id + "," + formatDate(new Date()) + "," + from_addr_port + "," + to_addr_port + "," + to_uri + "," + method + ",\"" + msg.replace(/"/g, "\"\"") + "\"" + log_nginx_variables_str);
    }
}

/**
 * エラーログ出力
 * @private
 * @param {Object} r
 * @param {string} rp_flag API参照側:REFERENCE:1 API提供側:PROVISION:2
 * @param {string} errorName エラー名
 */
function print_warnlog(r, rp_flag, msg) {

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

    var log_nginx_variables_str = create_log_nginx_variables_str(r);

    r.warn(",Warn," + request_id + "," + source_client_id + "," + desitination_client_id + "," + formatDate(new Date()) + ",-,-,-,-,\"" + msg.replace(/"/g, "\"\"") + "\"" + log_nginx_variables_str);
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

    //accessログと同じように
    // API提供側:provision
    var request_id;
    if (rp_flag === RP_FLAG.REFERENCE) {
        // API参照側:reference
        request_id = r.variables.request_id;
    } else {
        // API提供側:provision
        request_id = r.variables.http_x_request_id;
    }

    var log_nginx_variables_str = create_log_nginx_variables_str(r);

    r.error(",Error," + request_id + "," + source_client_id + "," + desitination_client_id + "," + formatDate(new Date()) + ",-,-,-,-," + "\"Error:[" + errorName + "]" + "," + "Description:[" + errorDetail.replace(/"/g, "\"\"") + "]\"" + log_nginx_variables_str);
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
function checkGbizidAndCorpid(r, introspection_response) {
    var i = 0;
    var ErrorArray = [];
    var arg_gbizid = r.args.gbizid;
    var arg_corpid = r.args.corpid;
    var gbizid_sub = introspection_response.gbizid_sub;
    var gbizid_corporate_number = introspection_response.gbizid_corporate_number;


    if (!(typeof (arg_corpid) === "undefined") && !(arg_corpid === gbizid_corporate_number)) {
        ErrorArray[i++] = "The value of the parameter [ corpid ] does not match the registered value . ";
    }
    if (!(typeof (arg_gbizid) === "undefined") && !(arg_gbizid === gbizid_sub)) {
        ErrorArray[i++] = "The value of the parameter [ gbizid ] does not match the registered value . ";
    }

    if (ErrorArray.length > 0) {
        return new EdgeError(403, ErrorArray.join());
    }
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

    // 2. アクセストークンのclient_idのチェック
    if (introspection_response["azp"]) {
        // azpから取得
        source_client_id = introspection_response["azp"];
    } else {
        return new EdgeError(403, "Could not get Client ID from access token.");
    }

    var client_id_exist = false;
    var authorized_client_obj;
    for (var i = 0; i < authorized_client_list.length; i++) {
        var tmp_authorized_client_obj = authorized_client_list[i];
        // 利用許可されているクライアントIDかどうか
        if (tmp_authorized_client_obj["client_id"] === source_client_id) {
            // 一致するならば、エンドポイントを比較するためいったん退避
            authorized_client_obj = tmp_authorized_client_obj;
            client_id_exist = true;
            break;
        }
    }

    // 返却用JSON作成
    if (client_id_exist !== true) {
        return new EdgeError(403, "Unpermitted Client ID.(" + source_client_id + ")");
    }

    // 3. 利用許可したAPIかチェック
    var endpoint_exist = false;
    // 退避したエンドポイントからメソッドとURIの一致をみる
    authorized_client_obj.endpoint.forEach(function (endpoint_obj) {
        var endpoint_obj_uri = addDefaultPort(endpoint_obj.uri);
        if (request_uri.match(endpoint_obj_uri) && endpoint_obj.method === request_method) {
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
 * 
 * @param {reply} reply
 * @param {orgObj} obj 
 * @param {introspection_response} obj 
 * @rturn
 */
function addMetadata(reply, orgObj, introspection_response) {
    var editJson = JSON.parse("{}");
    if (config_json.meta.add_flag) {
        source_client_id = introspection_response["azp"];
        desitination_client_id = config_json.client_id;
        var system_name;

        system_name = config_json.system_name;

        var scope;
        var scopes = [];
        scope = introspection_response.scope;
        if (!(typeof (scope) === "undefined")) {
            var scopesArray = scope.split(" ");
            for (var i = 0; i < scopesArray.length; i++) {
                scopes.push(scopesArray[i]);
            }
        }
        var time;
        time = reply.variables.request_time;

        editJson["meta"] = JSON.parse("{}");
        editJson["meta"]["source_client_id"] = source_client_id;
        editJson["meta"]["desitination_client_id"] = desitination_client_id;
        editJson["meta"]["system_name"] = system_name;
        editJson["meta"]["scopes"] = scopes;
        editJson["meta"]["request_time"] = time;
        editJson["meta"]["timestamp"] = formatDate(new Date());
    }
    editJson["data"] = JSON.parse(orgObj);
    return JSON.stringify(editJson, undefined, "\t");
}



/**
 * オブジェクトの最下層の値の取得
 * @private
 * @param {Object} obj 取得用オブジェクト
 * @param {Array<string>} array "."で分割した配列
 * @param {Object} r リクエストオブジェクト
 * @return {Map<string,string>} retrunMap
 */
function getEndValues(obj, array, r) {
    var deepNum = 0;
    var tempObj = obj;
    var indexMap = {};
    var index = 0;
    var returnMap = {};
    var fullkey = "";

    while (true) {
        var key = array[deepNum];
        key = key.replace(/\[\]$/, "");
        fullkey += key;
        // 末端を登録
        if (deepNum === array.length - 1) {
            if (!(typeof (tempObj[key]) === "undefined")) {
                returnMap[fullkey] = tempObj[key];
            }
            delNum = fullkey.lastIndexOf("[");
            if (delNum === -1) {
                return returnMap;
            } else {
                fullkey = fullkey.substring(0, delNum);
                index = indexMap[fullkey];
                index++;
                indexMap[fullkey] = index;
            }
            // tempObj他、リセット
            deepNum = 0;
            tempObj = obj;
            fullkey = "";
            continue;
        }

        var isArrayValue = Array.isArray(tempObj[key]);

        // 末端でなければ、一つ階層を落とす
        if (isArrayValue) {
            if (!(indexMap.hasOwnProperty(fullkey))) {
                // 最初
                indexMap[fullkey] = 0;
            }
            index = indexMap[fullkey];

            if (index >= tempObj[key].length) {
                var delNum = fullkey.lastIndexOf("[");
                if (delNum === -1) {
                    return returnMap;
                } else {
                    fullkey = fullkey.substring(0, delNum);
                    index = indexMap[fullkey];
                    index++;
                    indexMap[fullkey] = index;
                }
                // tempObj他、リセット
                deepNum = 0;
                tempObj = obj;
                fullkey = "";
                continue;
            }

            fullkey += "[" + index + "]";

            tempObj = tempObj[key][index];
        } else {
            tempObj = tempObj[key];
        }

        if (typeof (tempObj) === "undefined") {
            delNum = fullkey.lastIndexOf("[");
            if (delNum === -1) {
                return returnMap;
            } else {
                fullkey = fullkey.substring(0, delNum);
                index = indexMap[fullkey];
                index++;
                indexMap[fullkey] = index;
            }

            // tempObj他、リセット
            deepNum = 0;
            tempObj = obj;
            fullkey = "";
            continue;
        }

        fullkey += ".";
        deepNum++;
    }
}

/**
 * オブジェクトの最下層の値への登録
 * @private
 * @param {Object} obj 登録用オブジェクト
 * @param {Map<string,string>} map 登録用キーMap
 * @param {Object} r リクエストオブジェクト
 */
function setEndValues(obj, map, r) {
    Object.entries(map).forEach(function (entry) {
        var keyArray = entry[0].split(".");
        setEndValue(entry[1], obj, keyArray, r);
    });
}

/**
 * オブジェクトの最下層の値への登録
 * @private
 * @param {string} value セットする値
 * @param {Object} obj 登録用オブジェクト
 * @param {Array<string>} array "."で分割した配列
 * @param {Object} r リクエストオブジェクト
 */
function setEndValue(value, obj, array, r) {
    if (typeof (value) === "undefined") {
        return;
    }
    var deepNum = 0;
    var nextKey;
    var nextKeySize;
    var nextKeyArray;
    var nextKeyArrayStr;
    var isArrayNextKey;
    var match = /([^[]*)\[([0-9]+)\]$/;

    while (deepNum < array.length - 1) {
        nextKey = array[deepNum];
        isArrayNextKey = nextKey.match(match);
        if (isArrayNextKey) {
            nextKeyArrayStr = nextKey.replace(match, function (str, p1, p2) {
                var obj = { "nextKey": p1, "nextKeySize": parseInt(p2) };
                return JSON.stringify(obj);
            });
            nextKeyArray = JSON.parse(nextKeyArrayStr);
            nextKey = nextKeyArray["nextKey"];
            nextKeySize = nextKeyArray["nextKeySize"];
        }


        if (typeof (obj[nextKey]) === "undefined") {
            // 現在のeditJSONに存在しないなら新規作成
            if (isArrayNextKey) {
                obj[nextKey] = [];
            } else {
                obj[nextKey] = {};
            }
        }

        // 配列分作成
        if (isArrayNextKey) {
            for (var i = 0; i < nextKeySize + 1; i++) {
                if (typeof (obj[nextKey][i]) === "undefined") {
                    obj[nextKey][i] = {};
                }
            }
        }

        // 階層を一つ進める
        if (isArrayNextKey) {
            obj = obj[nextKey][nextKeySize];
        } else {
            obj = obj[nextKey];
        }
        deepNum++;
    }
    // 現在の階層へ値を登録.
    nextKey = array[deepNum];
    isArrayNextKey = nextKey.match(match);
    if (isArrayNextKey) {
        nextKeyArrayStr = nextKey.replace(match, function (str, p1, p2) {
            var obj = { "nextKey": p1, "nextKeySize": parseInt(p2) };
            return JSON.stringify(obj);
        });
        nextKeyArray = JSON.parse(nextKeyArrayStr);
        nextKey = nextKeyArray["nextKey"];
        nextKeySize = nextKeyArray["nextKeySize"];
    }

    if (isArrayNextKey) {
        obj[nextKey][nextKeySize] = value;
    } else {
        obj[nextKey] = value;
    }

    return;
}


/**
 * URI変換
 * @private
 * @param {number} rpFlg 
 * @param {Map<string,string>} map URI変換前キーMap
 * @param {string} extrUri 抽出URI
 * @param {string} replUri 置換URI
 * @param {Object} r リクエストオブジェクト
 */
function convertUri(rpFlg, map, extrUri, replUri, r) {
    var mapUri = Object.keys(map)[0];

    if (typeof (mapUri) === "undefined") {
        print_warnlog(r, rpFlg, "[" + extrUri + "]に該当するキーは存在しないため変換しません。");
        return;
    }

    extrUri = extrUri.replace(/\[\]$/, "");
    replUri = replUri.replace(/\[\]$/, "");
    var arrayExtrUri = extrUri.split(/\[\]./);
    var arrayReplUri = replUri.split(/\[\]./);
    var arraymapUri = mapUri.split(/\[[0-9]*\]./);

    if (arrayExtrUri.length === arrayReplUri.length && arrayReplUri.length === arraymapUri.length) {
        // 同じ場合置換
        Object.entries(map).forEach(function (p) {
            // entry = [key , value]
            var p_value = p[1];
            var p_key = p[0];
            delete map[p_key];

            var new_key = p[0];
            Object.keys(arrayExtrUri).forEach(function (index) {
                new_key = new_key.replace(arrayExtrUri[index], arrayReplUri[index]);
            });

            map[new_key] = p_value;
        });
    } else {
        // 抽出の方が大きい場合
        // 置換の方が大きい場合
        print_warnlog(r, rpFlg, "JSON変換ルールに配列の個数誤りがあるため変換できません。[" + replUri + "],[" + extrUri + "]");
        Object.entries(map).forEach(function (p) {
            delete map[p[0]];
        });
    }
}


/**
 * マッピング変換処理
 * @private
 * @param {Object} obj
 * @param {Array<Object>} json_convert_mappings
 * @param {number} rpFlg
 * @param {number} r
 * @return {Object} edit_obj
 */
function mappingConversion(obj, json_convert_mappings, rpFlg, r) {
    var edit_obj = {};

    for (var i = 0; i < json_convert_mappings.length; i++) {
        var mapping = json_convert_mappings[i];

        // 「source」または「destination」が存在しない場合、マッピングエラー
        if (typeof (mapping.source) === "undefined" || typeof (mapping.destination) === "undefined" ||
            mapping.source.length == 0 || mapping.destination.length == 0) {
            mappingError(rpFlg, "Mapping is missing a required parameter", r);
        }

        // カスタム関数(m:n)が指定された場合
        if (0 < mapping.source.length && 0 < mapping.destination.length && 0 < mapping.function.length &&
            mapping.function[0] === "custom") {
            customFunction(rpFlg, obj, edit_obj, mapping, r);
        } else if (mapping.source.length == 1 && mapping.destination.length == 1) {
            // 1:1マッピング
            mappingExecution(rpFlg, obj, edit_obj, mapping.source[0], mapping.destination[0], r);
        } else if (mapping.source.length == 1 && 1 < mapping.destination.length) {
            // 1:nマッピング
            if (mapping.function.length == 0) {
                // 関数なし
                for (var j = 0; j < mapping.destination.length; j++) {
                    mappingExecution(rpFlg, obj, edit_obj, mapping.source[0], mapping.destination[j], r);
                }
            } else {
                // 関数あり
                switch (mapping.function[0]) {
                    case "SPLIT":
                        split(rpFlg, obj, edit_obj, mapping, r);
                        break;
                    default:
                        // マッピング処理なし（エラー）
                        mappingError(rpFlg, "The specified function does not exist", r);
                }
            }
        } else if (1 < mapping.source.length && mapping.destination.length == 1) {
            // n:1マッピング
            if (mapping.function.length == 0) {
                // 関数なし（エラー）
                mappingError(rpFlg, "No function specified", r);
            } else {
                // 関数あり
                switch (mapping.function[0]) {
                    case "CONCAT":
                        concat(rpFlg, obj, edit_obj, mapping, r);
                        break;
                    default:
                        // マッピング処理なし（エラー）
                        mappingError(rpFlg, "The specified function does not exist", r);
                }
            }
        } else if (1 < mapping.source.length && 1 < mapping.destination.length) {
            // n:mマッピング
            if (mapping.function.length == 0) {
                // 関数なし（エラー）
                mappingError(rpFlg, "No function specified", r);
            } else {
                // 関数あり
                switch (mapping.function[0]) {
                    default:
                        // マッピング処理なし（エラー）
                        mappingError(rpFlg, "The specified function does not exist", r);
                }
            }
        }
    }
    return edit_obj;
}

/**
 * SPLIT関数(1:nマッピング)
 * 
 * @param {number} rpFlg 
 * @param {Object} obj 
 * @param {Object} edit_obj 
 * @param {Array<Object>} mapping 
 * @param {Object} r 
 */
function split(rpFlg, obj, edit_obj, mapping, r) {

    // 区切り文字
    var delim = mapping.function[1];
    if (delim === undefined) {
        mappingError(rpFlg, "Mapping is missing a required parameter", r);
    }
    var listSource = mapping.source[0].split(".");
    var sorceArray = getEndValue(obj, listSource).split(delim);

    let tempObj = new Object();
    for (var i = 0; i < mapping.destination.length; i++) {
        var key = "key" + i;
        if (i < sorceArray.length) {
            tempObj[key] = sorceArray[i];
        } else {
            tempObj[key] = "";
        }
        mappingExecution(rpFlg, tempObj, edit_obj, key, mapping.destination[i], r);
    }
}

/**
 * CONCAT関数(n:1マッピング)
 * 
 * @param {number} rpFlg 
 * @param {Object} obj 
 * @param {Object} edit_obj 
 * @param {Array<Object>} mapping 
 * @param {Object} r 
 */
function concat(rpFlg, obj, edit_obj, mapping, r) {

    // n個のデータを結合
    var concatStr = "";
    for (var j = 0; j < mapping.source.length; j++) {
        var sourceData = "";
        var listSource = mapping.source[j].split(".");
        var endValue = getEndValue(obj, listSource);
        if (endValue !== undefined) {
            sourceData = endValue;
            concatStr = concatStr + sourceData;
        } else {
            print_warnlog(r, rpFlg, "[" + mapping.source[j] + "]に該当するキーは存在しないため変換しません。");
        }
    }
    // 入力データが無い場合、マッピングせずに終了する
    if (concatStr === "") {
        return;
    }

    let tempObj = new Object();
    var key = "key";
    tempObj[key] = concatStr;
    mappingExecution(rpFlg, tempObj, edit_obj, key, mapping.destination[0], r);
}

/**
 * カスタム関数(n:mマッピング)
 * 
 * @param {number} rpFlg 
 * @param {Object} obj 
 * @param {Object} edit_obj 
 * @param {Array<Object>} mapping 
 * @param {Object} r 
 */
function customFunction(rpFlg, obj, edit_obj, mapping, r) {

    // 変換前データ配列(src)
    let s = new Array();
    for (var i = 0; i < mapping.source.length; i++) {
        var listSource = mapping.source[i].split(".");
        var endValue = getEndValue(obj, listSource);
        if (endValue != undefined) {
            s.push(endValue);
        } else {
            print_warnlog(r, rpFlg, 'データマッピングルールにある' + mapping.source[i] + 'に該当するデータ項目は存在しないため変換しません。');
            return;
        }
    }

    // ユーザのコード指定実行により、変換後データ配列(dst)を作成
    var d = new Array();
    try {
        let code = mapping.function[1] + '; return dst';
        let codeFunction = new Function('src', 'dst', code);
        d = codeFunction(s, d);
    } catch (e) {
        print_warnlog(r, rpFlg, mapping.source[0] + 'は関数ロジックに構文エラーがあるため、変換できません。');
        return;
    }

    // 関数実行後の配列数チェック
    if (mapping.destination.length != d.length) {
        print_warnlog(r, rpFlg, mapping.source[0] + 'は関数が成立しないため変換しません。');
        return;
    }

    let tempObj = new Object();
    for (var i = 0; i < mapping.destination.length; i++) {
        var key = "key" + i;
        tempObj[key] = d[i];
        mappingExecution(rpFlg, tempObj, edit_obj, key, mapping.destination[i], r);
    }
}

/**
 * マッピングエラー関数
 * 
 * @param {number} rpFlg 
 * @param {Object} errMsg 
 * @param {Object} r 
 */
function mappingError(rpFlg, errMsg, r) {

    print_errorlog(r, rpFlg, "Internal Mapping Error", errMsg);
    throw new Error("Internal Mapping Error");
}

/**
 * マッピング実行処理
 * @param {number} rpFlg 
 * @param {Object} obj 
 * @param {Object} edit_obj 
 * @param {Object} source 
 * @param {Object} destination 
 * @param {Object} r 
 */

function mappingExecution(rpFlg, obj, edit_obj, source, destination, r) {

    var array_source = source.split(".");
    var map = getEndValues(obj, array_source, r);
    convertUri(rpFlg, map, source, destination, r);
    setEndValues(edit_obj, map, r);
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
 * JSONから配列へのマッピング
 * @private
 * @param {Object} obj
 * @param {Array<Object>} arrayConvertMappings
 * @param {number} frag
 * @return {Object} editObj
 */
function arrayMapping(obj, arrayConvertMappings, convert_code) {
    if (convert_code === CONVERT_CODE.SERVER_RESPONSE) {
        var editObj;
    } else {
        return obj;
    }

    for (var i = 0; i < arrayConvertMappings.length; i++) {
        var mapping = arrayConvertMappings[i];
        var listSource = mapping.datastore.split(".");
        var endValue = getEndValue(obj, listSource);
        editObj = endValue;
        if (editObj != null) {
            return editObj;
        } else {
            return;
        }
    }
    return editObj;
}

/**
 * XML変換
 * @private
 * @param {Object} r
 * @param {string} orgJsonStr
 * @param {number} convert_code
 * @return {Object}
 */
function convertXml(r, orgJsonStr, convert_code) {
    var callApiUri = r.variables.request_uri;
    var callApiMethod = r.method;
    var xmlConverts = config_json.xml_converts;

    //configファイルにxml変換の記述がない場合、xml変換は行わない
    if (!xmlConverts) {
        return orgJsonStr;
    }

    for (var i = 0; i < xmlConverts.length; i++) {
        var xmlConvert = xmlConverts[i];
        if (callApiUri.match(xmlConvert.xml_convert_uri)
            && callApiMethod.match(xmlConvert.xml_convert_method)) {
            //xml変換フラグの取得
            var xmlFlag;
            if (convert_code === CONVERT_CODE.SERVER_RESPONSE) {
                if (callApiMethod.match("GET")) {
                    xmlFlag = xmlConvert.xml_convert_get_flag;
                }
            }
            //xmlFlag=falseもしくはundefinedのときXML変換は行わない
            if (!xmlFlag) {
                return orgJsonStr;
            }
            if (convert_code === CONVERT_CODE.SERVER_RESPONSE) {
                //JSONの"xml":キーにxmlを丸める
                if (!callApiMethod.match("GET")) {
                    return orgJsonStr;
                } else {
                    return "{\"xml\"\: \"" + orgJsonStr.replace(/\n/g, "") + "\"}";
                }
            } else {
                return orgJsonStr;
            }
        }
    }
    return orgJsonStr;
}



/**
 * JSON変換
 * @private
 * @param {Object} r
 * @param {string} org_json_str
 * @param {number} convert_code
 * @return {Object}
 */
function convert_json(r, org_json_str, convert_code, prm_call_api, prm_call_api_method) {
    var call_api_uri = r.variables.request_uri;
    var call_api_method = r.method;
    var rpFlg;
    var json_converts;

    // json_converts, rpFlg
    if (convert_code === CONVERT_CODE.SERVER_REQUEST || convert_code === CONVERT_CODE.SERVER_RESPONSE) {
        json_converts = config_json.json_converts_server;
        rpFlg = RP_FLAG.PROVISION;
    } else {
        json_converts = config_json.json_converts_client;
        rpFlg = RP_FLAG.REFERENCE;
        var call_api_uri = prm_call_api;
        var call_api_method = prm_call_api_method;
        if (convert_code === CONVERT_CODE.CLIENT_RESPONSE) {

        }
    }
    for (var i = 0; i < json_converts.length; i++) {
        var json_convert = json_converts[i];
        if (call_api_uri.match(json_convert.json_convert_uri)
            && call_api_method.match(json_convert.json_convert_method)) {

            // arrayFlagの取得
            var arrayFlag;
            if (convert_code === CONVERT_CODE.SERVER_RESPONSE) {
                arrayFlag = json_convert.array_convert_get_flag;
            }

            if (arrayFlag === true) {
                var arrayConvertRule = json_convert.array_convert_rule;
                var arrayConvertRules = config_json.array_convert_rules;
                var arrayConvertMappings = arrayConvertRules[arrayConvertRule];

                if (typeof (arrayConvertMappings) === "undefined") {
                    // ルールがないときは変換しない
                    print_warnlog(r, rpFlg, "array_convert_mappings variable is undefined.");
                    break;
                }

            } else {

                var json_convert_request_flag = json_convert.json_convert_request_flag;
                var json_convert_response_flag = json_convert.json_convert_response_flag;
                if (((convert_code == CONVERT_CODE.CLIENT_REQUEST || convert_code == CONVERT_CODE.SERVER_REQUEST) && ((typeof (json_convert_request_flag) === "undefined") || json_convert_request_flag !== true))||
                    ((convert_code == CONVERT_CODE.CLIENT_RESPONSE || convert_code == CONVERT_CODE.SERVER_RESPONSE) && ((typeof (json_convert_response_flag) === "undefined") || json_convert_response_flag !== true))) {
                    // 設定値がない、またはレスポンスフラグが実際のリクエスト／レスポンスと異なる場合は変換しない
                    break;
                }

                var json_convert_rule;
                if (convert_code === CONVERT_CODE.SERVER_REQUEST || convert_code === CONVERT_CODE.CLIENT_REQUEST) {
                    json_convert_rule = json_convert.json_convert_request_rule;
                } else {
                    json_convert_rule = json_convert.json_convert_response_rule;
                }

                var json_convert_rules = config_json.json_convert_rules;
                var json_convert_mappings = json_convert_rules[json_convert_rule];

                if (typeof (json_convert_mappings) === "undefined") {
                    // ルールがないときは変換しない
                    print_warnlog(r, rpFlg, "json_convert_mappings variable is undefined.");
                    break;
                }
            }

            // 編集するためにオブジェクトに変換
            var tmpJson = JSON.parse(org_json_str);
            var edit_json;

            if (Array.isArray(tmpJson)) {
                edit_json = [];
                for (var num = 0; num < tmpJson.length; num++) {
                    if (!arrayFlag) {
                        var edit_obj = mappingConversion(tmpJson[num], json_convert_mappings, rpFlg, r);
                        edit_json.push(edit_obj);
                    } else {
                        var edit_obj = arrayMapping(tmpJson[num], arrayConvertMappings, convert_code);
                        if (edit_obj) {
                            edit_json.push(edit_obj);
                        }
                    }
                }
            } else {
                if (!arrayFlag) {
                    edit_json = mappingConversion(tmpJson, json_convert_mappings, rpFlg, r);
                } else {
                    edit_json = arrayMapping(tmpJson, arrayConvertMappings, convert_code);
                }

            }
            // 編集したデータをJSON形式に変換
            var edit_json_str = JSON.stringify(edit_json, undefined, "\t");
            return edit_json_str;
        }
    }
    // URIが一致しない場合、JSON変換はしない
    print_warnlog(r, rpFlg, "This API can not perform JSON conversion.");
    return org_json_str;
}

/**
 * スコープマッピング
 * @private
 * @param {string} tmpJson
 * @param {Array<string>} requestScopes
 * @return {Object}
 */
function scopeMapping(tmpJson, requestScopes) {
    var edit_json = {};
    // 対象APPのスコープ一覧ごとに、requestScopes、responseBody に含まれる場合のみ追加
    for (var i = 0; i < SCOPE_MAPPINGS.length; i++) {
        var scopeMapping = SCOPE_MAPPINGS[i];
        //scopeMapping.scope がrequestScopesに含まれ
        //scopeMapping.data_itemがObject.keys(tmpJson) に含まれる場合
        if (requestScopes.includes(scopeMapping.scope)
            && Object.keys(tmpJson).includes(scopeMapping.data_item)) {
            //返却用jsonのみ取り出し
            edit_json[scopeMapping.data_item] = tmpJson[scopeMapping.data_item];
        }
    }
    return edit_json;
}

/**
 * スコープ絞り込み
 * @private
 * @param {string} responseBody
 * @param {string} scope
 * @return {Object}
 */
function scopeFiltering(responseBody, scope) {
    //1.スコープが指定されているかチェック

    //設定ファイルから対象APPのスコープ一覧を取り出す
    var scopes = [];
    for (var i = 0; i < SCOPE_MAPPINGS.length; i++) {
        scopes.push(SCOPE_MAPPINGS[i].scope);
    }

    //scope を取り出す " "でsplit
    var requestScopes = scope.split(" ");

    //スコープが指定されているかいないか
    var is_scope_specified = false;
    for (var i = 0; i < requestScopes.length; i++) {
        if (scopes.includes(requestScopes[i])) {
            is_scope_specified = true;
            break;
        }
    }

    //スコープが指定されていない場合、全データを返却する
    if (!is_scope_specified) {
        return responseBody;
    }

    //2.スコープを絞り込む
    // 編集するためにオブジェクトに変換
    var tmpJson = JSON.parse(responseBody);

    var edit_json;
    // 配列の場合
    if (Array.isArray(tmpJson)) {
        edit_json = [];
        for (var num = 0; num < tmpJson.length; num++) {
            var edit_obj = scopeMapping(tmpJson[num], requestScopes);
            edit_json.push(edit_obj);
        }
    } else {
        edit_json = scopeMapping(tmpJson, requestScopes);
    }

    var edit_json_str = JSON.stringify(edit_json, undefined, "\t");
    return edit_json_str;
}

/**
 * バイナリデータのリクエストボディに送信元クライアントIDを追加する
 * @private
 * @param {Object} r
 * @param {string} requestBody
 * @param {Object} introspection_response
 * @return {string}
 */
function addClientIdForBinary(r, requestBody, introspection_response) {
    if (isEmpty(requestBody)) {
        return requestBody;
    }
    var tmpRequestBody = JSON.parse(requestBody);
    if (isEmpty(tmpRequestBody["Binary"])) {
        return requestBody;
    } else {
        tmpRequestBody["Binary"]["source_client_id"] = introspection_response["azp"];
        return JSON.stringify(tmpRequestBody);
    }
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
    return (typeof (value) === "undefined") || (value === "") || (value === null);
}

/**
 * 式 expr1 が NULL もしくは undefined なら expr2 の値を戻す。
 * nullValueLogic *
 * @private
 * @param {string} expr1
 * @param {string} expr2
 * @return {boolean}
 */
function nvl(expr1, expr2) {
    return (typeof (expr1) === "undefined" || expr1 === null) ? expr2 : expr1;
}

/**
 * URLにデフォルトポートを付ける
 * @private
 * @param {string} uri
 * @return {boolean}
 */
function addDefaultPort(uri) {
    if (typeof (uri) === "undefined") {
        return uri;
    } else if (uri.match(new RegExp("^.?http://", ""))) {
        var domain = uri.match(/^.?(http:\/\/[^\/]+).*/)[1];
        if (!domain.match(new RegExp(":[0-9]+$", ""))) {
            var domainWithDefaultPort = domain + ":80"
            uri = uri.replace(domain, domainWithDefaultPort)
        }
    } else if (uri.match(new RegExp("^.?https://", ""))) {
        var domain = uri.match(/^.?(https:\/\/[^\/]+).*/)[1];
        if (!domain.match(new RegExp(":[0-9]+$", ""))) {
            var domainWithDefaultPort = domain + ":443"
            uri = uri.replace(domain, domainWithDefaultPort)
        }
    }
    return uri;
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
    source_client_id = config_json.client_id;

    var basicAuthPlaintext = config_json["client_id"] + ":" + config_json["client_secret"];
    // base64変換
    var authHeader = "Basic " + basicAuthPlaintext.toBytes().toString('base64');

    // リクエストボディをデコード
    var requestBody_json = decode_requestBody(r);
    if (requestBody_json instanceof EdgeError || (requestBody_json = check_requestBody(requestBody_json)) instanceof EdgeError) {
        print_errorlog(r, RP_FLAG.REFERENCE, "HTTP Request Error", requestBody_json.getLogMessage());
        r.return(requestBody_json.getStatus(), requestBody_json.getJsonResponse());
        return;
    }

    desitination_client_id = requestBody_json.client_id;
    print_accesslog(r, RP_FLAG.REFERENCE, getRemoteFullUrl(r), getHostFullUrl(r), r.method, "Succeeded in calling the Internal API.");

    // scope組み立て
    // aud に client_id を含める
    var scope = desitination_client_id;
    // scope
    if (typeof (requestBody_json.scope) !== "undefined") {
        scope += " " + requestBody_json.scope;
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
 * ログを出した後、luaへ接続(都度同意)
 * @param {Object} r
 */
function checkAuthorizationServer(r) {
    // 設定ファイルの不正はリターン
    if (config_json instanceof EdgeError) {
        print_errorlog(r, RP_FLAG.REFERENCE, "Config File Error", config_json.getLogMessage());
        r.return(config_json.getStatus(), config_json.getJsonResponse());
        return;
    }
    var basicAuthPlaintext = config_json["client_id"] + ":" + config_json["client_secret"];
    // base64変換
    var authHeader = "Basic " + basicAuthPlaintext.toBytes().toString('base64');

    var uri = "/_oauth2_client_credentials_request";
    r.subrequest(uri,
        { method: r.method, body: "grant_type=client_credentials", args: "authorization=" + authHeader },
        function (reply) {
            if (200 == reply.status) {
                var returnStr = "{\"message\":\"認可サーバへアクセスできています。\"}";
                r.return(reply.status, jsonStringifyFromJsonString(returnStr));
                return;
            } else {
                r.return(reply.status, createErrorResponseForCheckAuthorizationServer(reply.status, reply.responseBody));
                return;
            }
        }
    );
}


/**
 * 認可サーバのレスポンスのうちerror_descriptionがあるかどうか
 */
function checkErrorResponseFromAuthorizationServer(status, responseBody) {
    //ステータスが400番台かつ
    // 以下の形式で返却される場合はauthenticationからの応答
    //    {
    //     "error" : "...."
    //     "error_description" : "...."
    // }
    return (400 <= status && status < 500) && responseBody.hasOwnProperty("error_description");
}

/**
 * Nodeで作ったエラーレスポンスかどうか
 */
function checkErrorResponseFromHTTPStatusCodeOnly(responseBody) {
    // 以下の形式で返却される場合は,Nodeで作られたエラーレスポンス
    //  {
    //    "error" : {
    //       "message":"...." //errorMessages
    //    }
    //  }
    var errorMessages = Object.values(CLIENT_ERROR_CODE_MESSAGES).concat(Object.values(SERVER_ERROR_CODE_MESSAGES));

    return responseBody.hasOwnProperty("error")
        && (errorMessages.includes(responseBody["error"]["message"]));

}

/**
 */
function createErrorResponseForCheckAuthorizationServer(status, responseBody_str) {
    var responseBody;
    try {
        responseBody = JSON.parse(responseBody_str);
    } catch (error) {
        return new EdgeError(status, responseBody_str).getJsonResponse();
    }
    if (checkErrorResponseFromAuthorizationServer(status, responseBody)) {
        //error_descriptionが含まれる場合
        var response = {}
        response["message"] = "認可サーバへアクセスできています。Ｇビズコネクトポータルからダウンロードしたノード設定ファイルをノードに反映してください。";
        response["authorization_server_error_response"] = responseBody;
        return jsonStringifyFromObject(response)
    } else if (checkErrorResponseFromHTTPStatusCodeOnly(responseBody)) {
        //ノードで作ったレスポンスの場合
        //ステータスコードのみのレスポンスの場合、URIを追加
        //typeを変更する
        var rtnJson = responseBody
        rtnJson["error"]["status"] = rtnJson["error"]["message"]
        rtnJson["error"]["message"] = "認可サーバへアクセスできません。";
        rtnJson["error"]["uri"] = getOAuth2TokenEndpoint();
        rtnJson["error"]["type"] = undefined;
        return jsonStringifyFromObject(rtnJson);
    } else {
        //それ以外の場合
        var response = {}
        response["message"] = "認可サーバからのエラーレスポンスを確認してください。";
        response["authorization_server_error_response"] = responseBody;
        return jsonStringifyFromObject(response)
    }
}

/**
 * ログを出した後、luaへ接続(都度同意)
 * @param {Object} r
 */
function redirect_authorized(r) {
    print_accesslog(r, RP_FLAG.REFERENCE, getRemoteFullUrl(r), getHostFullUrl(r), r.method, "Succeeded in calling the Internal API.");
    print_accesslog(r, RP_FLAG.REFERENCE, getHostFullUrl(r), getRemoteFullUrl(r), r.method, "Requested Authentication screen.");
    var uri = "/authorized";
    r.internalRedirect(uri);
}

/**
 * モジュールへ接続 (都度、事前共通)
 * @private
 * @param {Object} r
 * @param {string} access_token
 * @param {Object} requestBody_json
 */
function call_edgemodule(r, access_token, requestBody_json) {
    var client_id = requestBody_json.client_id;
    var call_api = requestBody_json.call_api;
    var call_api_method = requestBody_json.method;
    var call_api_accept = typeof (requestBody_json.accept) === "undefined" ? "" : requestBody_json.accept;
    var call_api_contentType = typeof (requestBody_json["content-type"]) === "undefined" ? "" : requestBody_json["content-type"];
    var call_api_body = requestBody_json.body;

    // client_idからdomainを取ってきてcall_uriを作成
    var domain;
    var authorized_server_list = config_json["authorized_server_list"];
    authorized_server_list.forEach(function (authorized_server) {
        if (client_id === authorized_server.client_id) {
            domain = authorized_server.domain;
        }
    });
    var call_uri = domain + call_api;

    print_accesslog(r, RP_FLAG.REFERENCE, getHostFullUrl(r), call_uri, call_api_method, "Called the External API.");
    //  &call_uri=[call_uri]?key=value
    //->&call_uri=[call_uri]&key=value
    call_uri = call_uri.replace(/\?/, "&");
    var uri = "/_call_edgemodule";
    var args = "access_token=" + access_token + "&call_uri=" + call_uri + "&contentType=" + call_api_contentType + "&accept=" + call_api_accept;

    // JSON変換を行う
    call_api_body = convert_json(r, call_api_body, CONVERT_CODE.CLIENT_REQUEST, call_uri, call_api_method);
    r.subrequest(uri,
        { method: call_api_method, args: args, body: call_api_body },
        function (reply) {
            // エラー用レスポンスボディ退避
            var responseBody = reply.responseBody;
            if (200 <= reply.status && reply.status < 300) {
                // 正常
                print_accesslog(r, RP_FLAG.REFERENCE, call_api, getHostFullUrl(r), r.method, "Succeeded in calling the External API.(request_time:" + reply.variables.request_time + "s)");
                print_accesslog(r, RP_FLAG.REFERENCE, r.method, "The data has been updated.");
                // 正常な場合JSON変換を行う
                var tmpResponseBody = JSON.parse(responseBody);
                var tmpResponseBody2 = JSON.stringify(tmpResponseBody["data"]);
                var tmpResponseBody3 = convert_json(r, tmpResponseBody2, CONVERT_CODE.CLIENT_RESPONSE, call_uri, call_api_method);
                tmpResponseBody["data"] = JSON.parse(tmpResponseBody3);
                responseBody = JSON.stringify(tmpResponseBody, undefined, "\t");
            } else {
                // エラーログのメッセージ
                print_accesslog(r, RP_FLAG.REFERENCE, call_api, getHostFullUrl(r), r.method, "Failed to call the External API.");
                print_errorlog(r, RP_FLAG.REFERENCE, "Call Node API Error", reply.responseBody);
                // JSON形式で返却する;
                responseBody = reply.responseBody;
            }
            // 上記以外のステータスはログ
            // 共通
            print_accesslog(r, RP_FLAG.REFERENCE, getHostFullUrl(r), getRemoteFullUrl(r), r.method, "Called the Internal API.");
            // そのまま返却する
            r.return(reply.status, toJSON(reply.status, responseBody));
            return;
        }
    );
}

/**
 * 都度同意
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
    // リクエストボディをチェック
    if (requestBody_json instanceof EdgeError || (requestBody_json = check_requestBody(requestBody_json)) instanceof EdgeError) {
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
        print_errorlog(r, RP_FLAG.PROVISION, "Config File Error", config_json.getLogMessage());
        r.return(config_json.getStatus(), config_json.getJsonResponse());
        return;
    }
    desitination_client_id = config_json.client_id;

    try {
        if (!isEmpty(r.variables.access_token)) {
            var payloadStr = r.variables.access_token.split(".")[1];
            //base64デコード
            var payloadBase64decode = String.bytesFrom(payloadStr, 'base64');
            var payload = JSON.parse(payloadBase64decode);
            source_client_id = payload.azp;
        } else {
            throw new Error("Access token is missing or invalid.");
        }
    } catch (e) {
        print_errorlog(r, RP_FLAG.PROVISION, "Authorization Error", e.stack);
        r.return(401);// 401 Authorization Required
        return;
    }

    // イントロスペクションリクエストのAuthorizationヘッダーを準備する
    var basicAuthPlaintext = config_json["client_id"] + ":" + config_json["client_secret"];
    // base64変換
    var authHeader = "Basic " + basicAuthPlaintext.toBytes().toString('base64');

    var call_api_method = r.variables.call_api_method;

    print_accesslog(r, RP_FLAG.PROVISION, getRemoteFullUrl(r), getCallAPI(r), call_api_method, "Succeeded in calling the External API.");

    print_accesslog(r, RP_FLAG.PROVISION, getHostFullUrl(r), getOAuth2TokenIntrospectEndpoint(), call_api_method, "Called Authorization Server.");
    // Make the OAuth 2.0 Token Introspection request
    r.subrequest("/_oauth2_send_introspection_request", "token=" + r.variables.access_token + "&authorization=" + authHeader,
        function (reply) {
            if (reply.status !== 200) {
                print_accesslog(r, RP_FLAG.PROVISION, getOAuth2TokenIntrospectEndpoint(), getCallAPI(r), call_api_method, "Failed to call Authorization Server.");
                print_errorlog(r, RP_FLAG.PROVISION, "Authorization Error", reply.responseBody);
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
                    print_errorlog(r, RP_FLAG.PROVISION, "Authorization Error", reply.responseBody);
                    r.return(403);
                    return;
                }
            } catch (e) {
                print_accesslog(r, RP_FLAG.PROVISION, getOAuth2TokenIntrospectEndpoint(), getCallAPI(r), call_api_method, "OAuth token introspection response is not JSON: " + reply.body);
                print_errorlog(r, RP_FLAG.PROVISION, "Authorization Error", reply.responseBody);
                r.return(401);// 401 Authorization Required
                return;
            }
        }
    );
}

/**
 * データ提供システムを呼び出す
 * @param {Object} r
 */
function call_system_api_init(r) {
    desitination_client_id = config_json.client_id;

    // 有効なイントロスペクション応答があるか確認します
    var introspection_response_str = r.variables.token_response;
    var introspection_response = JSON.parse(introspection_response_str);

    // デコード
    var call_api = getCallAPI(r);
    var call_api_method = r.method;

    call_api = addDefaultPort(call_api);

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

    //都度同意の設定
    if (typeof (introspection_response.gbizid_sub) !== "undefined") {
        // アクセストークンaud,idの妥当性検証
        var gbizCheck = checkGbizidAndCorpid(r, introspection_response);
        if (gbizCheck instanceof EdgeError) {
            r.return(gbizCheck.getStatus(), gbizCheck.getJsonResponse());
            print_errorlog(r, RP_FLAG.PROVISION, "Validation Error", gbizCheck.getLogMessage());
            return;
        }

        // 新規に追加するパラメータの設定
        param_obj.sub = encodeURIComponent(introspection_response.gbizid_sub);
        param_obj.account_type = encodeURIComponent(introspection_response.gbizid_account_type);
        param_obj.scope = encodeURIComponent(introspection_response.scope);
    }
    // パラメータの作成
    var parameter = create_parameter(param_obj);

    // requestBody
    var requestBody = r.requestBody;

    // Binaryの場合はクライアントIDの付与
    requestBody = addClientIdForBinary(r, requestBody, introspection_response);

    // JSON変換を行う
    requestBody = convert_json(r, requestBody, CONVERT_CODE.SERVER_REQUEST);
    requestBody = convertXml(r, requestBody, CONVERT_CODE.SERVER_REQUEST);

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
                    // 正常な場合XML変換JSON変換を行う
                    responseBody = convertXml(r, responseBody, CONVERT_CODE.SERVER_RESPONSE);
                    responseBody = convert_json(r, responseBody, CONVERT_CODE.SERVER_RESPONSE);
                    //絞り込み
                    responseBody = scopeFiltering(responseBody, introspection_response.scope);
                } else {
                    print_errorlog(r, RP_FLAG.PROVISION, "Call SYSTEM API Error", reply.responseBody);
                    // JSON形式で返却する;
                    r.return(reply.status, toJSON(reply.status, reply.responseBody));
                    return;
                }
            } else {
                if (reply.status === 200) {
                    // データ提供システムに正常に書き込み完了
                    print_accesslog(r, RP_FLAG.PROVISION, r.method, "The data has been updated.");
                    responseBody = convert_json(r, responseBody, CONVERT_CODE.SERVER_RESPONSE);
                } else if (reply.status === 201) {
                    // データ提供システムに正常に書き込み完了
                    print_accesslog(r, RP_FLAG.PROVISION, r.method, "The data has been created.");
                    responseBody = convert_json(r, responseBody, CONVERT_CODE.SERVER_RESPONSE);
                } else {
                    print_errorlog(r, RP_FLAG.PROVISION, "Call SYSTEM API Error", reply.responseBody);
                    // JSON形式で返却する;
                    r.return(reply.status, toJSON(reply.status, reply.responseBody));
                    return;
                }
            }
            print_accesslog(r, RP_FLAG.PROVISION, get_call_system_api(r), getHostFullUrl(r), r.method, "Succeeded in calling the Internal API.(request_time:" + reply.variables.request_time + "s)");
            print_accesslog(r, RP_FLAG.PROVISION, getHostFullUrl(r), getRemoteFullUrl(r), r.method, "Called the External API.");
            // そのまま返却する
            responseBody = addMetadata(reply, responseBody, introspection_response);
            r.return(reply.status, responseBody);
        }
    );
}
export default { EdgeError, addClientIdForBinary, addDefaultPort, addMetadata, arrayMapping, call_edgemodule, call_system_api_init, checkAuthorizationServer, checkErrorResponseFromAuthorizationServer, checkErrorResponseFromHTTPStatusCodeOnly, checkGbizidAndCorpid, checkIdAud, check_requestBody, convertUri, convertXml, convert_json, createErrorResponse, createErrorResponseForCheckAuthorizationServer, create_log_nginx_variables_str, create_parameter, decodeURIComponentForRFC3986, decode_requestBody, formatDate, getCallAPI, getCallSystemApiApiKey, getCallSystemApiAuthorization, getClientErrorResponse, getConfig, getEndValue, getEndValues, getHostFullUrl, getOAuth2TokenEndpoint, getOAuth2TokenIntrospectEndpoint, getRemoteFullUrl, getScopeMapping, getServerErrorResponse, get_access_token, get_call_system_api, introspectAccessToken, isEmpty, jsonStringifyFromJsonString, jsonStringifyFromObject, mapping: mappingConversion, nvl, print_accesslog, print_errorlog, print_warnlog, redirect_authorized, scopeFiltering, scopeMapping, setEndValue, setEndValues, summary, toJSON, tsudodoi };