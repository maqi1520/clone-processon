var bigPipe = {
    jsVersion: "",
    cssVersion: "",
    count: 0,
    jsCounter: 0,
    render: function (e, n) {
      for (
        var i = document.getElementsByTagName("script"),
          t = document.getElementsByTagName("link"),
          s = 0;
        s < i.length;
        s++
      ) {
        if ((a = i[s].getAttribute("src")) && 0 <= a.indexOf("/assets/js/")) {
          if (a.indexOf("-") < 0) break;
          var o = a.substring(a.indexOf("-"), a.indexOf(".js"));
          bigPipe.jsVersion = o;
          break;
        }
      }
      for (s = 0; s < t.length; s++) {
        var a;
        if ((a = t[s].getAttribute("href")) && 0 <= a.indexOf("/assets/css/")) {
          if (a.indexOf("-") < 0) break;
          o = a.substring(a.indexOf("-"), a.indexOf(".css"));
          bigPipe.cssVersion = o;
          break;
        }
      }
      var r = e.css || [],
        c = e.js || [];
      this.jsCounter = c.length;
      for (s = 0; s < r.length; s++) {
        var l = r[s];
        this.renderCss(l);
      }
      s = 0;
      for (var u = c.length; s < u; s++) {
        var d = c[s];
        this.renderJs(d, n);
      }
    },
    renderCss: function (e) {
      var n = document,
        i = this.cssVersion,
        t = n.createElement("link");
      t.setAttribute("rel", "stylesheet"),
        t.setAttribute("type", "text/css"),
        0 <= e.indexOf("http") && (i = ""),
        (e = e.replace(".css", i + ".css")),
        t.setAttribute("href", e);
      var s = n.getElementsByTagName("head");
      s.length ? s[0].appendChild(t) : n.documentElement.appendChild(t);
    },
    renderJs: function (e, n) {
      var i = document,
        t = this.jsVersion,
        s = i.createElement("script");
      0 <= e.indexOf("http") && (t = ""),
        s.setAttribute("type", "text/javascript"),
        (e = e.replace(".js", t + ".js")),
        s.setAttribute("src", e),
        s.setAttribute("charset", "UTF-8"),
        i.body.appendChild(s),
        (s.onload = function () {
          bigPipe.count++, bigPipe.handle(n);
        });
    },
    handle: function (e) {
      this.count == this.jsCounter &&
        (null != e && e(), (this.count = 0), (this.jsCounter = 0));
    },
    init: function () {
      var e = !1;
      $(document)
        .off("mousemove.ck")
        .on("mousemove.ck", function () {
          e || ($.get("/popular/init"), (e = !0));
        });
    },
  },
  userCommon = {
    showMenu: function () {
      var e = $(".user-menu");
      e.length ||
        (e = $(
          "<ul style='width:140px;' class='user-menu menu noarrow'><li><a href='/diagrams'><span class='icons'>&#xe696;</span> 个人文件</a></li><li class='sep'></li><li><a href='/setting'><span class='icons'>&#xe698;</span> 账户中心</a></li><li><a href='/u/profile'><span class='icons'>&#xe699;</span> 个人主页</a></li><li><a href='/setting#payment' tit='profile'><span class='icons'>&#xe6ff;</span> 交易记录</a></li><li><a href='/setting#personal' tit='profile'><span class='icons'>&#xe69b;</span> 偏好设置</a></li><li><a href='/support' tit='help'><span class='icons'>&#xe69c;</span> 入门教程</a></li><li class='updatelog-btn'><a ><span class='icons'>&#xe69d;</span> 新功能</a></li><li class='sep'></li><li><a tit='loginout' href='/login/out'><span class='icons'>&#xe69e;</span> 退出登录</a></li></ul>"
        )).appendTo("body"),
        e.popMenu({
          target: ".user-logo",
          position: "right",
          onClose: function () {
            $(".user-logo").removeClass("active");
          },
        });
    },
    updatelog: {
      loaded: !1,
      init: function () {
        var e = this;
        if ("undefined" == typeof updateLog) {
          if (!this.loaded) {
            bigPipe.render(
              {
                js: ["/assets/js/updatelog.js"],
                css: ["/assets/css/updatelog.css"],
              },
              function () {
                updateLog.init(), (e.loaded = !0);
              }
            );
          }
        } else updateLog.init();
      },
    },
    organizations: {
      loaded: !1,
      init: function () {
        var e = this;
        if ("undefined" == typeof organization) {
          if (!this.loaded) {
            bigPipe.render(
              {
                js: ["/assets/js/org/organization.js"],
                css: ["/assets/css/organization.css"],
              },
              function () {
                organization.renderCon(), (e.loaded = !0);
              }
            );
          }
        } else organization.renderCon();
      },
    },
    teams: {
      loaded: !1,
      init: function () {
        var e = this;
        if ("undefined" == typeof team) {
          if (!this.loaded) {
            bigPipe.render(
              { js: ["/assets/js/team.js"], css: ["/assets/css/team.css"] },
              function () {
                team.renderCon(), (e.loaded = !0);
              }
            );
          }
        } else team.renderCon();
      },
    },
    notice: {
      loaded: !1,
      init: function (e) {
        var n = this;
        if ("undefined" == typeof notification) {
          if (!this.loaded) {
            bigPipe.render(
              {
                js: ["/assets/js/notification/notification.js"],
                css: ["/assets/css/notification.css"],
              },
              function () {
                notification.renderCon(e), (n.loaded = !0);
              }
            );
          }
        } else notification.renderCon(e);
      },
    },
  };
!(function () {
  if ("undefined" != typeof activeOrgId && activeOrgId) {
    var e = $("#menu_organization"),
      i = !1;
    Util.ajax({
      url: "/organizations/myorgs",
      success: function (e) {
        for (var n = 0; n < e.teams.length; n++)
          if (e.teams[n].orgId == activeOrgId) {
            $("#menu_organization .orgName").html(
              $("#menu_organization .orgName").text()
            ),
              (i = !0);
            break;
          }
        i || $("#menu_organization .orgName").text("团队");
      },
    }),
      e.click(function (e) {
        if (-1 < location.href.indexOf("organizations"))
          return e.stopPropagation(), void userCommon.organizations.init();
        i
          ? (location.href = "/organizations/" + activeOrgId)
          : (e.stopPropagation(), userCommon.organizations.init());
      });
  } else
    $("#menu_organization").click(function (e) {
      e.stopPropagation(), userCommon.organizations.init();
    });
  $("#menu_organization .icons")
    .off()
    .on("click", function (e) {
      e.stopPropagation(), userCommon.organizations.init();
    }),
    $("#menu_team")
      .off()
      .on("click", function (e) {
        e.stopPropagation(), userCommon.teams.init();
      });
  var n = $(".notice-icon");
  if (0 < n.length) {
    var t = n.find(".icon-warp .badge");
    $.get("/notification/count", {}, function (e) {
      0 < e.count
        ? 0 < t.length
          ? t.text(e.count)
          : $(
              "<span class='badge warning global-tip'>" + e.count + "</span>"
            ).appendTo(".notice-icon .icon-warp")
        : $(".notice-icon .icon-warp .badge").remove();
    });
  }
  $(".check-box")
    .off("click.check")
    .on("click.check", function (e) {
      e.stopPropagation();
      var n = $(this);
      n.hasClass("checked") ? n.removeClass("checked") : n.addClass("checked");
    });
})();
