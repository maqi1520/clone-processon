var chartId = Util.getUrlParams("id");
var userId = "5981853de4b06886663b8419";
var userName = "小马";
var teamId = "";
var orgId = "";
var role = "owner";
var cateType = "network";
var time = "1635492617645";
var orgRole = "";
var dock = localStorage.getItem("dock") || "none";
var tutorial = false;
var locale = "zh";
var isOpenColl2Owner = "true";
var isOpenShare2Owner = "true";
var isOpenPublish2Owner = "true";
var isOpenClone2Owner = "true";
var isComponentAdmin = "false";
var waterMark = "";
var websocketUrl = "wss://wpscb.processon.com/websocket";
var flowIsMember = false;

var showToolbar = true;

var cstatus = "private";
var dateFormat = "yyyy-MM-dd hh:mm";
var showCommentIco = true;

var localRuntime = false;
var chartVersion = 892;
var isNewTextV = new Date("2018-02-23 16:28:05") > new Date("2019-01-01");
//判断safari浏览器
var issafariBrowser =
  /Safari/.test(navigator.userAgent) ||
  (/Trident/.test(navigator.userAgent) && !/Chrome/.test(navigator.userAgent));
if (issafariBrowser) {
  var createTime = "2018-02-23 16:28:05";
  createTime = createTime.replace(/\-/g, "/");
  isNewTextV = new Date(createTime) > new Date("2019/01/01");
}

$(document).on("ajaxError", function (e, request) {
  switch (request.status) {
    case 500:
      UI.showTip("服务器错误");
    case 401:
      UI.showTip("请登录");
      window.location.href = "/";
  }
});

let ajaxtoLoacl = {};

$.get("/api/user/me", (res) => {
  console.log(res);
  userId = res.id;
  userName = res.name;
  $("#user-name").html(res.name);
  if (res.avatar_url) {
    $(".js-user-avater").each(function () {
      $(this).attr("src", res.avatar_url);
    });
  }
});

$(document).ready(() => {
  document.getElementById("selectFiles").onchange = function (e) {
    var files = e.target.files;
    if (files.length <= 0) {
      return false;
    }

    var fr = new FileReader();

    fr.onload = function (e) {
      const result = JSON.parse(e.target.result);
      Designer.open(result.diagram.elements);
    };

    fr.readAsText(files.item(0));
    e.target.value = null;
  };
});
