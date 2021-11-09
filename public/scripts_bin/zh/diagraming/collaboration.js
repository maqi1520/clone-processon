$(function () {
  if (chartId == "" || userId == "") {
    return;
  }
  CLB.init();
});
var CLB = {
  clientId: null,
  isOffLine: false,
  saving: false,
  collaClient: null,
  collaItv: null,
  collaUsers: null,
  collaUserClient: {},
  collaUserCount: 1,
  collaCount: 1,
  collaPollTimeSingle: 8000,
  collaPollTime: 3000,
  baseUrl:
    window.location.host.indexOf("processon.com") >= 0
      ? "https://cb.processon.com/"
      : "/",
  versionSaveTime: 180000,
  versionNow: 0,
  version: 0,
  offLineCount: 0,
  init: function () {
    var d = Math.random();
    var b = d + new Date().getTime();
    this.clientId = b.toString(16).replace(".", "");
    var c = this,
      a = "";
    window.onbeforeunload = function (e) {
      if (c.isOffLine || c.saving || c.sending || c.tempMess.length > 0) {
        if (c.tempMess.length > 0) {
          c.send([]);
        }
        return "当前数据还未上传成功，退出前请保存";
      }
      c.stop(false);
    };
    window.setInterval(function () {
      if (c.version != c.versionNow) {
        c.versionNow = c.version;
        CLB.saveVersion();
      }
    }, CLB.versionSaveTime);
  },
  saveVersion: function (c) {
    var e = userName;
    var a = $.extend(Model.define, { comments: Model.comments });
    var b = JSON.stringify(a),
      d = "自动存储";
    if (c != null && c != "") {
      d = c;
    }
    $.ajax({
      url: "/diagraming/add_version",
      data: {
        chartId: chartId,
        userId: userId,
        fullName: e,
        def: b,
        remark: d,
        ignore: "def",
      },
      type: "post",
      success: function (f) {
        Dock.loadHistorys(true);
        $("#history_remark").val("");
        $("#btn_history_clear").button("disable");
      },
    });
  },
  poll: function () {
    return;
  },
  stop: function (d) {
    return;
  },
  renderOff: function (a) {
    var c = this;
    if ($("#stop_listen_tip").length) {
      return;
    }
    var b =
      '<div id="stop_listen_tip"><div style="font-size:17px;margin-top:40px;color:#999;font-size:16px;">温馨提示</div><div style="font-size:16px;margin-top:58px;color:#666;">由于您长时间未编辑图形<br><br>系统已自动为您存储历史版本并暂停了作图</div><div style="color:#666;font-size:16px;margin-top:40px;">点击 <a style="color:#63abf7;cursor:pointer" onclick="location.reload();">恢复</a></div></div>';
    if (a) {
      b =
        '<div id="stop_listen_tip"><div style="font-size:17px;margin-top:40px;color:#999;font-size:16px;">温馨提示</div><div style="font-size:16px;margin-top:58px;color:#666;">协作服务器连接断开，多人协作状态下无法进行编辑操作</div><div style="font-size:16px;margin-top:8px;color:#666;">请刷新页面后操作</div><div style="color:#666;font-size:16px;margin-top:40px;">点击 <a style="color:#63abf7;cursor:pointer" onclick="location.reload();">刷新页面</a></div></div>';
    }
    if (a == "more") {
      b =
        '<div id="stop_listen_tip"><div style="font-size:17px;margin-top:40px;color:#999;font-size:16px;">温馨提示</div><div style="font-size:16px;margin-top:58px;color:#666;">该文件存在多端或者多人打开，不可以进入离线模式</div><div style="font-size:16px;margin-top:8px;color:#666;">请刷新页面后操作</div><div style="color:#666;font-size:16px;margin-top:40px;">点击 <a style="color:#63abf7;cursor:pointer" onclick="location.reload();">刷新页面</a></div></div>';
    }
    $(b).appendTo("body").show();
    $.mask();
  },
  sending: false,
  mess: [],
  tempMess: [],
  send: function (e) {
    var d = this;
    d.collaCount = 0;
    d.version++;
    if (d.isOffLine) {
      $("#saving_tip").text("");
      d.saveLocal();
      if (d.offLineCount % 5 == 0) {
        d.saveOnline();
      }
      return;
    }
    if (d.sending) {
      d.tempMess = d.tempMess.concat(e);
      if (d.tempMess.length % 5 == 0) {
        d.onError();
      }
      return;
    }
    d.sending = true;
    var c = d.collaUk;
    var a = d.collaClient;
    d.mess = d.tempMess.concat(e);
    var b = JSON.stringify(this.mess);
    d.tempMess = [];
    $("#saving_tip").text("正在保存...");
    $.ajax({
      url: "/diagraming/msg",
      data: { msgStr: b, ignore: "msgStr", chartId: chartId, uk: c, client: a },
      cache: false,
      type: "post",
      success: function (i) {
        if (i.error == "error") {
          d.onError();
        } else {
          if (i.error == "error_text") {
            Util.loading({
              content: "保存失败，名称涉及敏感字符、请重新输入",
              show: 4000,
              model: false,
            });
            d.sending = false;
          } else {
            try {
              var f = d.mess;
              d.mess = [];
              if (
                typeof flowWebsocketUtil != "undefined" &&
                flowWebsocketUtil
              ) {
                var h = {
                  type: "_s@deliver",
                  content: {
                    client: flowWebsocketUtil.clientId,
                    source: "flow",
                    msg: f,
                  },
                };
                flowWebsocketUtil.deliverMsg(h);
              }
            } catch (g) {
              d.mess = [];
            }
            d.sending = false;
            d.mess = [];
            $("#saving_tip").text("所有更改已保存");
            localStorage.setItem("version_local_" + chartId, i.version || 1);
            var j = localStorage.getItem("network_fail_" + chartId);
            if (j) {
              localStorage.removeItem("network_fail_" + chartId);
            }
          }
        }
      },
      error: function (f) {
        d.onError();
      },
    });
  },
  onError: function () {
    localStorage.setItem("network_fail_" + chartId, chartId);
    var d = this;
    d.sending = false;
    d.mess = [];
    d.isOffLine = true;
    d.saveLocal();
    if (d.collaUserCount > 1) {
      d.renderOff("more");
      var b = {};
      for (var c = 0; c < d.collaUsers.length; c++) {
        var a = d.collaUsers[c];
        b[a.userId] = a;
      }
      if (Object.keys(b).length > 1) {
        d.stop();
      } else {
        d.stop(false);
      }
      return;
    } else {
      d.stop(false);
    }
    Util.loading({
      content: "保存失败，已切换到离线模式，您可以继续编辑并手动保存",
      show: 4000,
      model: false,
    });
  },
  sendErrorCount: 0,
  localSaveCount: 0,
  saveLocal: function (c) {
    var a = $.extend(Model.define, { comments: Model.comments });
    localStorage.setItem("def_" + chartId, JSON.stringify(a));
    var b = localStorage.getItem("version_local_" + chartId);
    if (b == null || b == "") {
      b = 1;
    }
    localStorage.setItem("version_local_" + chartId, parseInt(b) + 1);
    setTimeout(function () {
      $("#saving_tip").html(
        "<span>已保存到本地<a title='保存到线上' onclick='CLB.saveOnline()'>保存</a></span>"
      );
    }, 100);
    this.offLineCount++;
  },
  saveOnline: function () {
    var b = this;
    if (b.saving) {
      return;
    }
    b.saving = true;
    b.sending = true;
    b.isOffLine = false;
    var d = localStorage.getItem("def_" + chartId);
    if (d == null || $.trim(d) == "") {
      Util.loading({
        content: "未发现本地数据，请编辑一个图形后，再次尝试",
        show: 3000,
        model: false,
      });
      return;
    }
    var c = Object.keys(Model.define.elements).length;
    var a = localStorage.getItem("version_local_" + chartId);
    if (isNaN(a)) {
      a = c;
    }
    Util.loading({ content: "正在保存到云端......", show: true, model: false });
    $.ajax({
      url: "/diagraming/saveonline",
      type: "post",
      cache: false,
      data: { id: chartId, def: d, shapecount: c, version: a, ignore: "def" },
      success: function (e) {
        b.saving = false;
        b.sending = false;
        if (e.error == "error") {
          b.isOffLine = true;
          Util.loading({
            content: "保存失败，请网络恢复后或者稍后再次尝试",
            show: 3000,
            model: false,
          });
          return;
        }
        localStorage.removeItem("def_" + chartId);
        localStorage.removeItem("version_local_" + chartId);
        $("#saving_tip").text("所有更改已保存");
        b.isOffLine = false;
        b.offLineCount = 0;
        Util.loading({
          content: "保存成功，已退出离线模式",
          show: 3000,
          model: false,
        });
        var f = localStorage.getItem("network_fail_" + chartId);
        if (f) {
          localStorage.removeItem("network_fail_" + chartId);
        }
        b.init();
      },
      error: function () {
        Util.loading({
          content: "保存失败，请网络恢复后或者稍后再次尝试",
          show: 3000,
          model: false,
        });
        b.saving = false;
        b.isOffLine = true;
      },
    });
  },
  sendDirectly: function (b, e) {
    var d = { userId: userId, subject: chartId };
    var c = $.extend(d, b);
    var a = JSON.stringify(c);
    $.ajax({
      url: "/diagraming/msg_directly",
      data: { msgStr: a, ignore: "msgStr", chartId: chartId },
      cache: false,
      type: "post",
      success: function (f) {
        if (e) {
          e(f);
        }
      },
    });
  },
  onMessage: function (b) {
    for (var a = 0; a < b.length; a++) {
      var d = b[a];
      var c = d.action;
      if (c == "changeTitle") {
        $(".diagram_title").text(d.title);
      } else {
        if (c == "chat") {
          this.appendChatMsg(d.name, d.message, true);
        } else {
          if (c == "changeSchema") {
            if (d.categories == "") {
              Designer.setSchema([]);
            } else {
              Designer.setSchema(d.categories.split(","));
            }
          } else {
            if (c == "command") {
              MessageSource.receive(d.messages);
            } else {
              if (c == "addHistory") {
                Dock.loadHistorys();
              }
            }
          }
        }
      }
    }
  },
  findLocal: function () {
    var a = false;
    return a;
  },
  removeLocal: function () {
    localStorage.removeItem("def_local_" + chartId);
    localStorage.removeItem("title_local_" + chartId);
    localStorage.removeItem("version_local_" + chartId);
  },
  manageOnlineUsers1: function (b) {
    $("#collaborators").children().attr("class", "");
    for (var d = 0; d < b.length; d++) {
      var a = JSON.parse(b[d]);
      if ($("#chat_user_" + a.userId).length == 0) {
        var c = "https://accounts.processon.com/photo/" + a.userId + ".png";
        $("#collaborators").append(
          "<a href='/u/profile/" +
            a.userId +
            "' target='_blank' ><img id='chat_user_" +
            a.userId +
            "' src='" +
            c +
            "' title='" +
            a.name +
            "' title_pos='top'/></a>"
        );
      }
      $("#chat_user_" + a.userId).attr("class", "online");
    }
    $("#collaborators").children("img[class!=online]").remove();
  },
  manageOnlineUsers: function (b) {
    CLB.collaUsers = b;
    CLB.collaUserCount = b.length;
    $("#collaborators").empty();
    $("#collaborators").children().attr("class", "");
    for (var e = 0; e < b.length; e++) {
      var a = b[e];
      var d = decodeURIComponent(a.userName);
      d = d
        .replace(/</g, "&lte;")
        .replace(/>/g, "&gte;")
        .replace(/'/g, "")
        .replace(/“/g, "");
      CLB.collaUserClient[a.clientId] = a;
      if ($("#chat_user_" + a.userId).length == 0) {
        var c = "https://accounts.processon.com/photo/" + a.userId + ".png";
        $("#collaborators").append(
          "<a href='/u/profile/" +
            a.userId +
            "' target='_blank' ><img id='chat_user_" +
            a.userId +
            "' src='" +
            c +
            "' title='" +
            d +
            "' title_pos='top'/></a>"
        );
      }
      $("#chat_user_" + a.userId).attr("class", "online");
    }
    $("#collaborators").children("img[class!=online]").remove();
  },
  userOpCount: {},
  showUserOp: function (g, a) {
    var c = CLB.collaUserClient[a];
    if (c == null) {
      return;
    }
    if (!g) {
      return;
    }
    var f = $("#" + g);
    if (f.length > 0) {
      var e = f.offset();
      var b = $(".colla-user-tip-con[uk=" + a + "]");
      if (b.length == 0) {
        var d = "/photo/" + c.userId + ".png";
        if (window.location.host.indexOf("processon.com") >= 0) {
          d = "https://accounts.processon.com/photo/" + c.userId + ".png";
        }
        b = $(
          "<div uk='" +
            a +
            "' class='colla-user-tip-con'><img src='" +
            d +
            "'/> <span>" +
            decodeURIComponent(c.userName) +
            "</span>正在编辑此图形</div>"
        ).appendTo("body");
        if (CLB.userOpCount[a] != null) {
          window.clearTimeout(CLB.userOpCount[a]);
        }
        CLB.userOpCount[a] = setTimeout(function () {
          b.fadeOut().remove();
        }, 2000);
      }
      b.css({
        left: e.left + f.outerWidth() + 12,
        top: e.top + f.outerHeight() / 2 - b.outerHeight() / 2,
      }).show();
    }
  },
  setConfig: function (b, a, c) {
    localStorage.setItem(b, a);
  },
};
