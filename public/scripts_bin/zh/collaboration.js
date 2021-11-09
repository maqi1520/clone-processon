var collaboration = {
  loadingcolla: false,
  followingPage: 0,
  followerPage: 0,
  loadAvatar: function (b) {
    var a = "https://accounts.processon.com";
    var d = location.origin.toLowerCase();
    var c = d.indexOf(".processon.com");
    if (c < 0) {
      a = "";
    }
    if (!b) {
      return '<img src="/assets/imgs/on.png"/>';
    } else {
      return '<img src="' + a + "/photo/" + b + '.png"/>';
    }
  },
  isMember: false,
  getIsMember: function () {
    Util.ajax({
      url: "/view/privatefilecount",
      success: function (a) {
        collaboration.isMember = a.member;
      },
    });
  },
  init: function (d, c) {
    var b = this;
    b.multiVal = [];
    b.multiType = [];
    b.getContacters();
    b.getRoleList();
    b.getIsMember();
    type = c == "folder" ? "f" : "c";
    if (!$("#colla_add").length) {
      var a =
        '<div id="colla_add" style="padding:24px 0;width:550px;z-index:3;" class="dialog" title="添加协作成员"><div style="margin-top: 20px;padding:0 24px 20px 24px;"><div class="colla-tabs"><a tit="colla_users" class="colla-tab active">最近联系人</a><a tit="colla_teams" class="colla-tab">团队成员</a><a tit="colla_following" class="colla-tab">我的关注</a><a tit="colla_follower" class="colla-tab">我的粉丝</a></div><div class="colla-context-con thick-scrollbar"><div id="colla_users" class="colla-tab-content"></div><div id="colla_teams" class="colla-tab-content"></div><div id="colla_following" data-type="following"  class="colla-tab-content"></div><div id="colla_follower" data-type="follower" class="colla-tab-content"></div></div></div><div style="margin-top: 16px;padding:0 24px;"><div style="margin-bottom: 20px"><div style="color:#333">添加邀请</div></div><div class="multi-input" id="multi-input-colla" style="margin-bottom: 10px;"></div><div><select id="role" class="txt" style="height: 30px;padding: 0px;margin-top: -3px;width:80px;"><option value="editor" selected="selected">编辑者</option><option value="viewer">浏览者</option></select><div style="float:right;cursor: pointer;"><span id="send-colla-invite" class="pro-btn default okbtn" style="margin-top:-2px;">发送邀请</span><span id="send-colla-invite-loading" class="pro-btn default okbtn" style="margin-top:-5px;display: none;cursor: wait;">发送中...</span></div></div><div id="send-colla-invite-success" class="alert success" style="text-align: center;display: none">邀请已发送，请耐心等待受邀人接受您的邀请。</div><div id="send-colla-invite-danger" class="alert danger" style="text-align: center;display: none">邀请发送失败。</div></div><div style="margin-top: 16px;padding:0 24px"><div style="color:#333;padding: 12px 0;">权限列表</div><div id="role_list"></div></div></div>';
      $(a).appendTo("body");
    }
    $(".colla-tab")
      .off()
      .on("click", function () {
        var f = $(this).attr("tit");
        if ($(this).hasClass("active")) {
          return;
        }
        $(this).addClass("active").siblings().removeClass("active");
        switch (f) {
          case "colla_users":
            $("#colla_users").show().siblings().hide();
            break;
          case "colla_teams":
            var e = $(".colla-team-user").length;
            if (e < 1) {
              b.getTeams();
            }
            $("#colla_teams").show().siblings().hide();
            break;
          case "colla_following":
            var g = $("#colla_following"),
              j = g.find(".colla-follow-user").length;
            if (j < 1) {
              g.empty();
              b.getCollaFollwinger("following", 0);
            }
            g.show().siblings().hide();
            break;
          case "colla_follower":
            var i = $("#colla_follower"),
              h = i.find(".colla-follow-user").length;
            if (h < 1) {
              i.empty();
              b.getCollaFollwinger("follower", 0);
            }
            i.show().siblings().hide();
            break;
        }
      });
    $(".colla-context-con").on("click", ".colla-follow-more", function (g) {
      var f = $(this).parent().data("type");
      b[f + "Page"] += 1;
      b.getCollaFollwinger(f, b[f + "Page"]);
    });
    $(document).off("click", ".colla-team");
    $(document).on("click", ".colla-team", function (j) {
      var i = $(this),
        h = i.attr("tid"),
        g = i.find(".icons"),
        f = g.hasClass("active");
      if (!f) {
        if ($(".colla-team-user[tid=" + h + "]").length > 0) {
          b.showTeamsMbs(null, h);
        } else {
          b.getTeamMembers(h);
        }
        g.addClass("active");
      } else {
        g.removeClass("active");
        b.hideTeamMbs(h);
      }
    });
    $(document).off("click", ".colla-user, .colla-team-user > div");
    $(document).on(
      "click",
      ".colla-user, .colla-team-user > div",
      function (g) {
        var f = $(this).attr("uid"),
          h = $(this).text();
        if (!f || b.multiVal.indexOf(f) >= 0) {
          return;
        }
        $("#multi-input-colla").multiInput("setVal", f, h);
        b.multiVal.push(f);
        b.multiType.push("user");
      }
    );
    $("#send-colla-invite")
      .off()
      .on("click", function (j) {
        var i = $("#colla_add"),
          f = $("#multi-input");
        if (f.length > 0 && f.val() != "") {
          var j = $.Event("keyup");
          j.keyCode = 13;
          f.trigger(j);
        }
        var h = b.multiVal;
        if (h.length == 0 || f.val() != "") {
          return;
        }
        var g = new TencentCaptcha("2046103261", function (k) {
          if (k.ret === 0) {
            $("#send-colla-invite").hide();
            $("#send-colla-invite-loading").show();
            var e = [];
            $.ajax({
              url: "/collaboration/add",
              type: "post",
              data: {
                type: "email",
                targets: h.join(","),
                targetTypes: b.multiType.join(","),
                folderId: c == "folder" ? d : "",
                chartId: c == "chart" ? d : "",
                role: $("#role").val(),
                signup_ticket: k.ticket,
                randstr: k.randstr,
              },
              success: function (m) {
                b.multiVal = [];
                b.multiType = [];
                $("#send-colla-invite-loading").hide();
                $("#send-colla-invite").show();
                $(".multi-input-vals").empty();
                var l =
                  typeof cateType != "undefined"
                    ? cateType
                    : $("#" + d).attr("cate");
                if (m.result == "error") {
                  Util.globalTopTip(
                    "添加协作成员失败",
                    "top_error",
                    "3000",
                    i,
                    true
                  );
                }
                if (m.result == "error_text") {
                  Util.globalTopTip(
                    "文件标题或昵称存在敏感字符，无法邀请协作",
                    "top_error",
                    "3000",
                    i,
                    true
                  );
                }
                if (m.result == "error_ticket") {
                  Util.globalTopTip(
                    "安全校验未通过，无法邀请协作",
                    "top_error",
                    "3000",
                    i,
                    true
                  );
                }
                if (m.result == "exists") {
                  Util.globalTopTip(
                    "邀请人已加入协作",
                    "top_error",
                    "3000",
                    i,
                    true
                  );
                }
                if (m.result == "error_limit") {
                  var l =
                    l == "mind_free"
                      ? "思维导图"
                      : l == "flow"
                      ? "流程图"
                      : "文件夹";
                  poCollect("触发会员升级提示", { 功能: l + "-协作" });
                  Util.globalTopTip(
                    '协作次数已达到每日上限,请<a style="color:#fff;" href="/upgrade?pos=7_" target="_blank">升级至个人版</a>解锁全部功能',
                    "top_error",
                    "4000",
                    i,
                    true
                  );
                }
                if (m.result == "expired") {
                  var l =
                    l == "mind_free"
                      ? "思维导图"
                      : l == "flow"
                      ? "流程图"
                      : "文件夹";
                  poCollect("触发会员升级提示", { 功能: l + "-协作" });
                  Util.globalTopTip(
                    '协作人数已达到上限,请<a style="color:#fff;" href="/upgrade?pos=7_" target="_blank">升级至个人版</a>解锁全部功能',
                    "top_error",
                    "4000",
                    i,
                    true
                  );
                }
                if (m.result == "success") {
                  poCollect("协作成功", {
                    文件类型: l,
                    文件ID: d,
                    用户类型: collaboration.isMember
                      ? orgId
                        ? "团队版"
                        : "个人版"
                      : "免费版",
                  });
                  if (m.exclude.length > 0) {
                    b.collaInviteTip(m.exclude);
                  } else {
                    if (m.exists.length > 0) {
                      Util.globalTopTip(
                        "邀请人已加入协作",
                        "top_error",
                        "3000",
                        i,
                        true
                      );
                    } else {
                      Util.globalTopTip(
                        "邀请协作发送成功",
                        "top_success",
                        "3000",
                        i,
                        true
                      );
                    }
                  }
                  b.getRoleList();
                  return false;
                }
              },
            });
          }
        });
        g.show();
      });
    $("#multi-input-colla").multiInput({
      setVal: function (g) {
        var e = [];
        for (var f = 0; f < g.length; f++) {
          if (b.multiVal.indexOf(g[f]) == -1) {
            b.multiVal.push(g[f]);
            b.multiType.push("email");
            e.push(g[f]);
          } else {
            Util.globalTopTip(
              "已存在，请勿重复添加",
              "top_error",
              "3000",
              $("#colla_add"),
              true
            );
          }
        }
        return e;
      },
      deleteVal: function (f) {
        var e = b.multiVal.indexOf(f);
        b.multiVal.splice(e, 1);
        b.multiType.splice(e, 1);
      },
    });
  },
  collaInviteTip: function (b) {
    if (!$("#colla_invite_tip").length) {
      var c =
        '<div id="colla_invite_tip" class="dialog" style="width:300px;z-index:888"><h2 class="dialog-title" style="margin-bottom:12px;">邀请提示</h2><div style="font-size:13px;line-height:25px">您邀请的以下用户还未注册 ProcessOn 账号，系统已自动发送短信或者邮件邀请通知，对方注册成功后点击通知中链接即可加入协作</div><ul class="not-colla-user" style="line-height:40px;margin:20px 0;max-height:180px;overflow:auto;">';
      c +=
        '</ul><div style="text-align:right"><span class="send pro-btn default okbtn">我知道了</span></div></div>';
      $(c).appendTo("body");
    }
    for (var a = 0; a < b.length; a++) {
      $(".not-colla-user").append(
        '<li style="background:#F9F9F9;font-size:14px;margin-bottom:8px;padding:0 10px;border-radius:2px;"><span class="icons" style="width:30px;float:left;color:#ccc;margin-right:6px;">&#xe708;</span><span>' +
          b[a] +
          "</span></li>"
      );
    }
    $("#window-mask,#body-mask").css("z-index", "777");
    $("#colla_invite_tip").dialog({
      onClose: function () {
        $(".not-colla-user").html("");
        if (!$("#window-mask").length) {
          $("<div id='body-mask'></div>").appendTo("body");
        }
        $("#window-mask").css("z-index", "2");
      },
    });
    $("#colla_invite_tip .okbtn")
      .off()
      .click(function () {
        $(
          "#colla_invite_tip .mind-dlog-close,#colla_invite_tip .dialog-close"
        ).click();
      });
  },
  multiType: [],
  multiVal: [],
  totalCount: 0,
  showCount: 0,
  showCollaList: function (d) {
    var c = "";
    var e = d.users;
    for (var b = 0; b < e.length; b++) {
      var a = e[b];
      c +=
        '<div><span class="pop-text">' +
        a.fullName +
        '</span><span class="pop-text-i"><' +
        a.email +
        "></span></div>";
    }
    return c;
  },
  getContacters: function () {
    var a = this;
    $.ajax({
      url: "/collaboration/get_contacter",
      success: function (b) {
        a.showContacters(b);
      },
    });
  },
  getTeams: function () {
    var b = this;
    var a = "/collaboration/get_orgs";
    $.ajax({
      url: a,
      success: function (c) {
        b.showOrgs(c);
      },
    });
  },
  getCollaFollwinger: function (a, b) {
    var c = this;
    if (this.loadingcolla) {
      return;
    }
    this.loadingcolla = true;
    $.ajax({
      url: "/u/colla/more",
      data: { page: b, type: a },
      success: function (d) {
        c.loadingcolla = false;
        c.showFollowinger(d, $("#colla_" + a), a);
      },
    });
  },
  getTeamMembers: function (c, d) {
    var b = this,
      d = d || 1;
    var a = "/collaboration/get_orgs_mbs";
    $.ajax({
      url: a,
      data: { teamId: c, orgId: c, pn: d },
      success: function (e) {
        b.totalCount = e.total;
        b.showCount = e.skip;
        if (orgId && typeof chartId == "undefined") {
          b.users = e.users.filter(function (f) {
            return f.userId != pageContext.chartsEventParams.userId;
          });
        }
        b.showTeamsMbs(e, c);
        $("#loadMore")
          .off()
          .on("click", function (f) {
            b.getTeamMembers(c, d + 1);
          });
      },
    });
  },
  showContacters: function (e) {
    var d = "";
    if (e != null && e.contacters.length > 0) {
      for (var c = 0, a = e.contacters.length; c < a; c++) {
        var b = e.contacters[c];
        if (b == null) {
          continue;
        }
        d +=
          '<div uid="' +
          b.userId +
          '" class="colla-user"><span>' +
          collaboration.loadAvatar(b.userId) +
          "</span><span>" +
          (typeof pageContext != "undefined" &&
          pageContext.nickNameData &&
          pageContext.nickNameData[b.userId]
            ? pageContext.nickNameData[b.userId]
            : b.fullName) +
          "</span></div>";
      }
    } else {
      d =
        "<div class='colla-users-none'><img src='/assets/images/icon/empty_contact.svg'/><div>还没有最近联系人</div></div>";
    }
    $("#colla_users").html(d);
  },
  showFollowinger: function (d, g, j) {
    var f = "";
    var a = d.users.length;
    var k = g.find(".colla-follow-more");
    if (a == 6) {
      if (k.length < 1) {
        k = $("<div class='colla-follow-more'>更多</div>");
        k.appendTo(g);
      }
      k.show();
    } else {
      if (a < 6) {
        if (k.length > 0) {
          k.hide();
        }
      }
    }
    if (d != null && a > 0) {
      for (var e = 0, h = a; e < h; e++) {
        var c = d.users[e];
        if (c == null) {
          continue;
        }
        var b =
          '<div class="user-logo tmu-photo">' +
          collaboration.loadAvatar(c.userId) +
          "</div>";
        f +=
          '<div uid="' +
          c.userId +
          '" class="colla-user colla-follow-user"><span>' +
          b +
          "</span><span>" +
          (typeof pageContext != "undefined" &&
          pageContext.nickNameData &&
          pageContext.nickNameData[c.userId]
            ? pageContext.nickNameData[c.userId]
            : c.fullName) +
          "</span></div>";
      }
    }
    g.append(f);
    if (g.find(".colla-user ").length < 1) {
      var l = "您还没有关注用户";
      if (j != "following") {
        l = "您还没有粉丝";
      }
      g.html(
        "<div class='colla-users-none'><img src='/assets/images/icon/empty_contact.svg'/><div>" +
          l +
          "</div></div>"
      );
    }
  },
  showOrgs: function (e) {
    var d = "";
    if (e != null && e.teams.length > 0) {
      for (var c = 0, a = e.teams.length; c < a; c++) {
        var b = e.teams[c];
        if (b == null) {
          continue;
        }
        d +=
          '<div tid="' +
          b.orgId +
          '" class="colla-team"><span class="title">' +
          b.orgName +
          '</span><span class="icons">&#xe618;</span></div>';
      }
    } else {
      d =
        "<div class='colla-users-none'><img src='/assets/images/icon/empty_team.svg'/><div>您还未创建或者加入任何团队</div></div>";
    }
    $("#colla_teams").html(d);
  },
  getTeamLogo: function (b) {
    var a = "<span class='icons teamlogo'>&#xe668;</span>";
    if (b != null && b.logoFileName != null && b.logoFileName != "") {
      a = "<img src='/file/response/" + b.logoFileName + "/team_logo'/>";
    }
    return a;
  },
  showTeamsMbs: function (f, h) {
    var e = "";
    if (f != null && f.users.length > 0) {
      for (var d = 0, a = f.users.length; d < a; d++) {
        var b = f.users[d];
        if (b == null) {
          continue;
        }
        var c = "<span>" + collaboration.loadAvatar(b.userId) + "</span>";
        e +=
          '<div uid="' +
          b.userId +
          '"><div class="colla-user">' +
          c +
          "<span>" +
          (typeof pageContext != "undefined" &&
          pageContext.nickNameData &&
          pageContext.nickNameData[b.userId]
            ? pageContext.nickNameData[b.userId]
            : b.fullName) +
          "</span></div></div>";
      }
      var g = $(".colla-team-user[tid=" + h + "]");
      if (g.length == 0) {
        g = $("<div class='colla-team-user' tid='" + h + "' ></div>");
        $(".colla-team[tid=" + h + "]").after(g);
      }
      if (this.showCount < this.totalCount) {
        if ($("#loadMore").length > 0) {
          $("#loadMore").before(e);
        } else {
          e +=
            "<div id='loadMore' style='padding:0px;height: 12px;width: 50%;margin-left:25%;text-align: center;cursor: pointer;margin-top: 5px;border-radius: 6px;border: 1px solid #dcdcdc;'><span class='icons' style='width:10px;height:10px;margin-top:-3px;'>&#xe618;</span></div>";
          g.append(e);
        }
      } else {
        g.append(e);
        $("#loadMore").hide();
      }
    } else {
      $(".colla-team-user[tid=" + h + "]").show();
    }
  },
  hideTeamMbs: function (a) {
    $(".colla-team-user[tid=" + a + "]").hide();
  },
  getRoleList: function (e, d) {
    var c = this;
    if (typeof chartId == "undefined") {
      var b = pageContext.util.getSelected();
      if (b.length > 0) {
        collaboration.activeSelect = b;
      }
      var g = collaboration.activeSelect.attr("id"),
        a = collaboration.activeSelect.attr("tp");
      f = {
        folderId: a == "folder" ? g : "",
        chartId: a == "chart" ? g : "",
        pg: d || 1,
      };
    } else {
      var f = { chartId: chartId, pg: d || 1 };
    }
    $.ajax({
      url: "/collaboration/list_users",
      data: f,
      success: function (h) {
        c.showRoleList(h);
      },
    });
  },
  showRoleList: function (g) {
    $("#role_list").empty();
    var e = "";
    if (g.owner != null) {
      e =
        '<div class="role-item"><span class="item-portrait">' +
        collaboration.loadAvatar(g.owner.userId) +
        '</span><span class="item-user-fullname">' +
        (typeof pageContext != "undefined" &&
        pageContext.nickNameData &&
        pageContext.nickNameData[g.owner.userId]
          ? pageContext.nickNameData[g.owner.userId]
          : g.owner.fullName) +
        '</span><span class="item-role-status"></span><span class="role-sel-con">创建者</span></div>';
    }
    if (g.collaborations != null) {
      for (var d = 0; d < g.collaborations.length; d++) {
        var a = g.collaborations[d].user,
          c = g.collaborations[d];
        if (a == null) {
          continue;
        }
        var f =
          '<span class="item-role-status" >' +
          (c.email ? c.email : c.phone) +
          "</span>";
        if (c.email && c.phone) {
          f =
            '<span class="item-role-status" >' +
            c.email +
            '<span class="icons" style="margin-left: 3px;font-size: 12px;" title="' +
            c.phone +
            '">&#xe709;</span></span>';
        }
        var b =
          '<div class="user-logo tmu-photo">' +
          collaboration.loadAvatar(a.userId) +
          "</div>";
        e +=
          '<div id="item_' +
          c.collborationId +
          '" class="role-item"><span class="item-portrait">' +
          b +
          '</span><span class="item-user-fullname">' +
          (typeof pageContext != "undefined" &&
          pageContext.nickNameData &&
          pageContext.nickNameData[a.userId]
            ? pageContext.nickNameData[a.userId]
            : a.fullName) +
          "</span>" +
          f +
          '<span class="role-sel-con" ><select onchange="collaboration.setRole(\'' +
          c.collborationId +
          '\',this)"><option value="editor" ' +
          (c.role == "editor" ? 'selected="selected"' : "") +
          ' ">编辑者</option><option value="viewer" ' +
          (c.role == "viewer" ? 'selected="selected"' : "") +
          ' ">浏览者</option></select></span><span title="移除" onclick="collaboration.removeRoleUser(\'' +
          c.collborationId +
          "','" +
          c.user.userId +
          '\')" class="icons closeme">&#xe637;</span></div>';
      }
    }
    $("#role_list").html(e);
    $(window).trigger("resize.dialog");
  },
  setRole: function (a, b) {
    if (a != "") {
      $.ajax({
        url: "/collaboration/set_role",
        data: { role: b.value, collaborationId: a },
        success: function (c) {
          Util.globalTopTip("修改成功", null, 2000, $("#colla_add"), true);
        },
      });
    }
  },
  removeRoleUser: function (b, a) {
    $.ajax({
      url: "/collaboration/delete",
      data: { type: "user", collaborationId: b },
      success: function (c) {
        $("#item_" + b).remove();
        Util.globalTopTip("已删除", null, 900, $("#colla_add"), true);
      },
    });
  },
  renderExcludeInut: function (d) {
    var b = "";
    for (var c = 0, a = d.length; c < a; c++) {
      b +=
        '<span val="' +
        d[0] +
        '" class="multi-input-value"><span class="icons" style="color:#f60;">&#xe614;</span><span class="multi-text" style="color:#f60;">' +
        d[0] +
        '</span><span class="icons closeme" style="color:#f20;">&#xe637;</span></span>';
    }
    $(".multi-input-vals").append(b);
  },
};
