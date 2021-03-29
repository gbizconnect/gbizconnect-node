--設定ファイル読み込み
local file,val;
local json = require 'cjson';
local file_path = "/etc/nginx/resources/config.json";
local text = "";
file = io.open(file_path,"r");
for m in file:lines() do 
  text = text .. m
end 
val = json.decode(text);
io.close(file);

local template = require "resty.template".new({
  root = "/usr/share/nginx/html"
})
template.render("scope.html", {
  authorized_servers = val.authorized_server_list,
  scope_authenticate_url = val.openid_connect.scope_authenticate_url,
  scope_no_authenticate_url= val.openid_connect.scope_no_authenticate_url
})