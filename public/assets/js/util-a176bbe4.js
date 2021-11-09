var Util = {
  setCookie: function (t, e, i) {
    var o = new Date();
    o.setDate(o.getDate() + i),
      (document.cookie =
        t +
        "=" +
        escape(e) +
        (null == i ? "" : ";path=/;expires=" + o.toGMTString()));
  },
  getCookies: function (t) {
    if (0 < document.cookie.length) {
      var e = document.cookie.indexOf(t + "=");
      if (-1 != e) {
        e = e + t.length + 1;
        var i = document.cookie.indexOf(";", e);
        return (
          -1 == i && (i = document.cookie.length),
          unescape(document.cookie.substring(e, i))
        );
      }
    }
    return "";
  },
};
(function () {
  (document.ondragstart = function () {
    return !1;
  }),
    $.ajaxSetup({ cache: !1 }),
    $("[title],[original-title]")
      .live("mouseover", function () {
        if ($(this).attr("disableTitle")) return !1;
        if (!(0 < $("#mind_hover_tip").length)) {
          var t = $(this);
          if (
            (t.attr("title") &&
              (t.attr("original-title", t.attr("title")),
              t.removeAttr("title")),
            t.attr("original-title"))
          ) {
            var e = t.attr("original-title"),
              i = $("#hover_tip");
            0 == i.length &&
              (i = $(
                "<div id='hover_tip'><div class='tip_arrow'></div><div class='tip_content radius3'></div></div>"
              ).appendTo("body")),
              $(".tip_content").html(e),
              $("#hover_tip").show(),
              $(".tip_arrow")
                .removeClass("tip_right")
                .removeClass("tip_top")
                .css("top", ""),
              "right" == t.attr("title_pos")
                ? (i.css({
                    left: t.offset().left + t.outerWidth() + 7,
                    top:
                      t.offset().top +
                      t.outerHeight() / 2 -
                      i.outerHeight() / 2,
                  }),
                  $(".tip_arrow")
                    .attr("class", "tip_arrow tip_right")
                    .css("top", i.outerHeight() / 2 - 7))
                : "top" == t.attr("title_pos")
                ? (i.css({
                    left:
                      t.offset().left + t.outerWidth() / 2 - i.outerWidth() / 2,
                    top: t.offset().top - i.outerHeight() - 4,
                  }),
                  $(".tip_arrow").attr("class", "tip_arrow tip_top"))
                : "left" == t.attr("title_pos")
                ? (i.css({
                    left: t.offset().left - i.outerWidth() - 7,
                    top:
                      t.offset().top +
                      t.outerHeight() / 2 -
                      i.outerHeight() / 2,
                  }),
                  $(".tip_arrow").attr("class", "tip_arrow tip_left"))
                : (i.css({
                    left:
                      t.offset().left + t.outerWidth() / 2 - i.outerWidth() / 2,
                    top: t.offset().top + t.outerHeight() + 4,
                  }),
                  $(".tip_arrow").attr("class", "tip_arrow"));
          }
        }
      })
      .live("mouseout", function () {
        $("#hover_tip").hide();
      });
  var fromUrl = document.referrer;
  fromUrl &&
    fromUrl.indexOf("processon.com") < 0 &&
    Util.setCookie("processon_referrer", encodeURI(fromUrl), 1),
    ($.simpleAlert = function (t, e, i) {
      if ("close" != t) {
        $("#simplealert").length && $("#simplealert").remove();
        var o = "simplealert-icon-info";
        e && (o = "simplealert-icon-" + e);
        var n = $("<div id='simplealert' class='simplealert'></div>").appendTo(
            "body"
          ),
          a = "<div class='" + o + "'>";
        "loading" == e &&
          (a +=
            "<img src='/images/default/designer/loading.gif' style='margin:10px 0px 0px 12px'/>"),
          (a +=
            "</div><div class='simplealert-msg'>" +
            t +
            "</div><div class='simplealert-right'></div>"),
          n.html(a),
          n.css(
            "top",
            ($(window).height() - n.height()) / 2 + $(window).scrollTop() + "px"
          ),
          n.css(
            "left",
            ($(window).width() - n.width()) / 2 + $(window).scrollLeft() + "px"
          ),
          n.show(),
          "no" != i &&
            setTimeout(function () {
              n.fadeOut(200);
            }, i || 3500);
      } else $("#simplealert").remove();
    }),
    ($.fn.disable = function (e, i) {
      $(this).attr("disable", !0), $(this).addClass("opacity disable");
      for (var t = 0; t < $(this).length; t++) {
        var o = $(this)[t];
        $(o)
          .unbind("mouseover.disable")
          .bind("mouseover.disable", function () {
            var t = $("<div class='disabled-mask'></div>").appendTo("body");
            e || (e = 2),
              t.css({
                width: $(o).outerWidth() + e,
                height: $(o).outerHeight() + 4,
                top: $(o).offset().top,
                left: $(o).offset().left,
                "z-index": 9999,
              }),
              i && t.css("z-index", i),
              t
                .on("mouseout", function () {
                  $(this).remove();
                })
                .on("mouseup", function (t) {
                  t.stopPropagation();
                });
          });
      }
      return this;
    }),
    ($.fn.enable = function () {
      $(this).attr("disable", !1), $(this).removeClass("opacity disable");
      for (var t = 0; t < $(this).length; t++) {
        var e = $(this)[t];
        $(e).unbind("mouseover.disable").unbind("focus");
      }
      return this;
    }),
    (Util.loginWindow = function (t, e) {
      if ((void 0 === t && (t = "open"), "open" == t)) {
        $("#loginWindow").length && $("#loginWindow").remove();
        var i = $(
          "<div id='loginWindow' style='margin-top:-120px;' class='loginWindow'></div>"
        ).appendTo("body");
        i.append(
          "<div id='loginWindow-content' class='loginWindow-content'><img src='/images/ajaxload.gif' style='margin:80px 0px 0px 45%'/></div>"
        ),
          $("#loginWindow-content").load("/login/window", function () {
            loginCallback = e;
          }),
          i.dialog({
            onClose: function () {
              location.reload();
            },
          });
      } else (t = "close") && $("#loginWindow").dialog("close");
    }),
    (Util.payWindow = function (t, e, i) {
      if ((void 0 === t && (t = "open"), "open" == t)) {
        $("#payWindow").length && $("#payWindow").remove();
        var o = $(
          "<div id='payWindow' style='margin-top:-120px;' class='payWindow'></div>"
        ).appendTo("body");
        o.append(
          "<div id='payWindow-content' class='loginWindow-content'><img src='/images/ajaxload.gif' style='margin:80px 0px 0px 45%'/></div>"
        ),
          $("#payWindow-content").load("/order/pay/window", e, function () {
            console.log("loaded"), (payCallback = i);
          }),
          o.dialog({
            onClose: function () {
              i("close"), $("#weixinpay").dialog("close");
            },
          });
      } else
        (t = "close") &&
          ($("#weixinpay").dialog("close"), $("#payWindow").dialog("close"));
    });
  var maskStackCount = 0;
  ($.mask = function (t) {
    if ((void 0 === t && (t = "open"), "open" == t)) {
      if (0 == maskStackCount) {
        var e = $(
          "<div id='window-mask' class='window-mask' style='display:none'></div>"
        ).appendTo("body");
        e
          .css({
            width: $(window).width() + "px",
            height: $(window).height() + "px",
            filter: "alpha(opacity=60)",
          })
          .show(),
          $(window).bind("resize.mask", function () {
            e.css({
              width: $(window).width() + "px",
              height: $(window).height() + "px",
            });
          });
      }
      maskStackCount++;
    } else
      "close" == t &&
        0 == --maskStackCount &&
        ($("#window-mask").remove(), $(window).unbind("resize.mask"));
  }),
    ($.fn.dialog = function (o) {
      var n = $(this);
      if ("string" == typeof o)
        "close" == o &&
          (n.find(".dialog-close").trigger("click"),
          null != $("#window-mask") && $("#window-mask").hide());
      else {
        (o = $.extend({ fixed: !0, closable: !0, mask: !0 }, o)) || (o = {});
        var t = "";
        o.title
          ? (t = o.title)
          : n.attr("title") && ((t = n.attr("title")), n.attr("title", "")),
          n.addClass("dialog-box").show();
        var e = $("<div class='dialog-close'></div>").appendTo(n);
        e.bind("click", function () {
          if (
            ($(document).off("keyup.confirm"), !o.onClose || 0 != o.onClose())
          ) {
            $.mask("close"),
              n.hide(),
              n.removeClass("dialog-box").find(".dialog-close").remove();
            var t = n.find(".dialog-title");
            n.attr("title", t.text()),
              t.remove(),
              $(window).unbind("resize.dialog");
          }
        }),
          n.find(".close").on("click", function () {
            e.click();
          }),
          o.closable && e.show(),
          o.hideable && e.hide(),
          "" != t && n.prepend("<h2 class='dialog-title'>" + t + "</h2>"),
          o.mask && $.mask(),
          $(window)
            .off("resize.dialog")
            .bind("resize.dialog", function () {
              var t = n.outerWidth(),
                e = n.outerHeight(),
                i = 0;
              i = o.fixed
                ? (n.css("position", "fixed"),
                  ($(window).height() - e) / 2 + "px")
                : (n.css("position", "absolute"),
                  ($(window).height() - e) / 2 +
                    $(document).scrollTop() +
                    "px");
              $(window).width();
              n.css({ top: i, left: "50%", transform: "translate(-50%, 0px)" });
            }),
          $(window).trigger("resize.dialog"),
          n.find(".dialog-title").draggable({ target: n });
      }
      return n;
    }),
    ($.fn.draggable = function (t) {
      var p = $.extend(
        {
          target: "default",
          clone: !1,
          undrag: "",
          scroll: !0,
          start: function () {},
          drag: function () {},
          end: function () {},
        },
        t
      );
      return (
        $(this)
          .off("mousedown.drag")
          .on("mousedown.drag", function (t) {
            $(document).on("selectstart.drag dragstart", function () {
              return !1;
            });
            var a = $(this),
              s =
                "string" == typeof p.target && "default" == p.target
                  ? a
                  : p.target,
              l = t.pageX,
              r = t.pageY,
              d = s.offset().left,
              c = s.offset().top;
            p.clone &&
              ((s = a
                .clone()
                .removeAttr("id")
                .css("position", "absolute")
                .offset({ left: d, top: c })),
              "function" == typeof p.clone &&
                (p.clone.call(s, t),
                (d = 1 * s.css("left").replace("px", "")),
                (c = 1 * s.css("top").replace("px", ""))),
              p.opacity && s.css("opacity", p.opacity)),
              $(document).on("mousemove.drag", function (t) {
                a.hasClass("ondrag") ||
                  (a.addClass("ondrag"),
                  p.clone && s.appendTo(a.parent()),
                  p.start.call(a[0], t));
                var e = t.pageX - l + d,
                  i = t.pageY - r + c;
                if (p.bounding) {
                  var o = p.bounding.offset().left,
                    n = p.bounding.offset().top;
                  o < e &&
                    n < i &&
                    e < o + p.bounding.outerWidth() - s.outerWidth() &&
                    i < n + p.bounding.outerHeight() - s.outerHeight() &&
                    s.offset({ left: e, top: i });
                } else s.offset({ left: e, top: i });
                p.drag.call(a[0], t);
              }),
              $(document).on("mouseup.drag", function (t) {
                p.end.call(a[0], t),
                  p.clone && s.remove(),
                  $(document).off("selectstart.drag dragstart"),
                  $(document).off("mousemove.drag"),
                  $(document).off("mouseup.drag"),
                  $(".drop-hover").length || a.removeClass("ondrag");
              }),
              $(this).on("mouseup.drag", function (t) {
                $(document).trigger("mouseup.drag"),
                  $(this).off("mouseup.drag");
              });
          }),
        p.undrag &&
          $(this)
            .find(p.undrag)
            .off("mousemove.drag")
            .on("mousemove.drag", function (t) {
              t.stopPropagation();
            })
            .on("dragstart", function () {
              return !1;
            }),
        this
      );
    }),
    ($.confirm = function (t) {
      var e = $("#global_confirm_window"),
        i = "确定",
        o = " ";
      t.okval && (i = t.okval),
        t.tokenClass && (o = t.tokenClass),
        e.length
          ? (e.find(".dlg-content").html(t.content), e.find(".okbtn").html(i))
          : (e = $(
              "<div id='global_confirm_window' tabindex='-1' class='confirm-box " +
                o +
                "' title='请确认'><div class='dlg-content'>" +
                t.content +
                "</div><div class='dlg-buttons'><span class='pro-btn default okbtn'>" +
                i +
                "</span>&nbsp;&nbsp;<span class='pro-btn basic cancelbtn close'>取消</span></div></div>"
            ).appendTo("body")),
        t.width && e.css("width", t.width),
        t.height && e.css("height", t.height),
        t.hiddenOK
          ? e.find(".okbtn").css("visibility", "hidden")
          : e.find(".okbtn").css("visibility", "visible"),
        t.hiddenCancel
          ? e.find(".cancelbtn").css("display", "none")
          : e.find(".cancelbtn").css("visibility", "inline-block"),
        e.dialog(),
        $(document)
          .off("keyup.confirm")
          .on("keyup.confirm", function (t) {
            13 == t.keyCode && e.find(".okbtn").trigger("click");
          }),
        e
          .find(".okbtn")
          .off()
          .on("click", function () {
            e.dialog("close"),
              t.onConfirm && t.onConfirm(),
              $(document).off("keyup.confirm");
          }),
        e
          .find(".cancelbtn")
          .off("click.cancel")
          .on("click.cancel", function () {
            t.onCancel && t.onCancel(), $(document).off("keyup.confirm");
          });
    }),
    ($.imgtoast = function (t) {
      var e = $("#upgrade_dlg");
      if (!e.length) {
        e = $(
          '<div id="upgrade_dlg" class="dialog" style="background:#fff;box-shadow:none;"><div class="upgrade-box"><h3 class="upgrade-box-title">升级团队版</h3><p class="upgrade-box-content">更好的保证团队数据安全与协作效率<br>专注工作与协作</p><ul class="upgrade-ul"><li><span class="icons">&#xe658;</span>无限量小组使用，各项目同时推进</li><li><span class="icons">&#xe658;</span>免费克隆系统付费模板</li><li><span class="icons">&#xe658;</span>团队成员高级权限设置灵活协作</li><li><span class="icons">&#xe658;</span>团队数据安全，实时备份</li></ul><a class="button" href="/upgrade">立即升级</a><img src="/assets/images/about/upgrade_bg_right.png"/></div></div>'
        ).appendTo("body");
      }
      t.tid &&
        e.find(".button").attr("href", "/upgrade?tid=" + t.tid + "&addu=pay"),
        e.dialog();
    }),
    ($.fn.popMenu = function (t) {
      var e = $(this);
      if ("string" != typeof t) {
        var i = $.extend(
            {
              position: "left",
              fixed: !1,
              offsetX: 0,
              offsetY: 0,
              zindex: 2,
              autoClose: !0,
              closeAfterClick: !1,
              autoPosition: !0,
            },
            t
          ),
          o = $(i.target);
        e.addClass("popover").css("z-index", i.zindex),
          i.fixed && e.css("position", "fixed"),
          i.autoClose &&
            (0 == i.closeAfterClick &&
              e.unbind("mouseup.popmenu").bind("mouseup.popmenu", function (t) {
                t.stopPropagation();
              }),
            $(document).bind("mouseup.popmenu", function () {
              e.popMenu("close"),
                $(document).unbind("mouseup.popmenu"),
                i.onClose && i.onClose();
            })),
          $(window).bind("resize.popmenu", function () {
            e.popMenu(t);
          }),
          e.show();
        var n = 0;
        (n =
          "center" == i.position
            ? o.offset().left + o.outerWidth() / 2 - e.outerWidth() / 2
            : "right" == i.position
            ? o.offset().left + o.outerWidth() - e.outerWidth()
            : o.offset().left) +
          e.outerWidth() >
          $(window).width() && (n = $(window).width() - e.outerWidth());
        var a = o.offset().top + o.outerHeight();
        i.autoPosition &&
        a + i.offsetY + e.outerHeight() >
          $(window).height() + $(document).scrollTop()
          ? e.css({
              top:
                $(window).height() - e.outerHeight() + $(document).scrollTop(),
              left: n + i.offsetX,
            })
          : e.css({ top: a + i.offsetY, left: n + i.offsetX });
      } else
        "close" == t &&
          (e.hide().removeClass("popover"), $(window).unbind("resize.popmenu"));
    }),
    ($.fn.suggest = function (t) {
      var r = $(this),
        e = {
          valueField: "value",
          offsetX: 0,
          offsetY: 0,
          width: r.outerWidth(),
          format: function (t) {
            return t.text;
          },
        },
        d = $.extend(e, t),
        c = $(".suggest-menu");
      c.length < 1 &&
        (c = $("<ul class='suggest-menu'></ul>").appendTo("body")),
        c.width(d.width);
      var i = -1,
        p = "";
      r.off("keydown.suggest")
        .on("keydown.suggest", function (t) {
          if (40 == t.keyCode)
            t.preventDefault(),
              i < c.children().length - 1 &&
                (i++,
                c.find(".active").removeClass("active"),
                c.find("li[index=" + i + "]").addClass("active"));
          else if (38 == t.keyCode)
            t.preventDefault(),
              c.find(".active").removeClass("active"),
              0 <= i && (i--, c.find("li[index=" + i + "]").addClass("active"));
          else if (13 == t.keyCode) {
            var e = c.find(".active");
            e.length && r.val(e.attr("val")),
              d.onEnter && d.onEnter(r),
              c.hide(),
              (value = "");
          }
        })
        .off("keyup.suggest")
        .on("keyup.suggest", function (t) {
          var l = r.val();
          "" == l
            ? c.hide()
            : l != p &&
              ((i = -1),
              $.get(d.url, { q: l }, function (t) {
                c.empty();
                var e = t.items;
                if (0 == e.length) c.hide(), (l = "");
                else {
                  for (var i = 0; i < e.length; i++) {
                    var o = e[i],
                      n =
                        "<li index='" +
                        i +
                        "' class='suggest-item' val='" +
                        o[d.valueField] +
                        "'>";
                    (n += d.format(o)), (n += "</li>"), c.append(n);
                  }
                  c.show(), c.attr("tabindex", 0);
                  var a = 0;
                  (a =
                    "center" == d.position
                      ? r.offset().left +
                        r.outerWidth() / 2 -
                        c.outerWidth() / 2
                      : "right" == d.position
                      ? r.offset().left + r.outerWidth() - c.outerWidth()
                      : r.offset().left) +
                    c.outerWidth() >
                    $(window).width() &&
                    (a = $(window).width() - c.outerWidth());
                  var s = r.offset().top + r.outerHeight();
                  d.autoPosition &&
                  s + d.offsetY + c.outerHeight() >
                    $(window).height() + $(document).scrollTop()
                    ? c.css({
                        top:
                          $(window).height() -
                          c.outerHeight() +
                          $(document).scrollTop(),
                        left: a + d.offsetX,
                      })
                    : c.css({ top: s + d.offsetY, left: a + d.offsetX }),
                    c
                      .find(".suggest-item")
                      .off("mousedown")
                      .on("mousedown", function (t) {
                        t.preventDefault(),
                          r.val($(this).attr("val")),
                          d.onEnter && d.onEnter(r),
                          c.hide(),
                          (p = l = "");
                      });
                }
              })),
            (p = l);
        })
        .off("blur.suggest")
        .on("blur.suggest", function (t) {
          c.hide(), (p = "");
        });
    }),
    ($.fn.pagination = function (t, e, i, o) {
      if (!(e <= 1)) {
        var n = 5;
        o && (n = o);
        var a = $(this).addClass("pagination"),
          s = 1,
          l = e;
        if (n < e) {
          var r = Math.floor(n / 2);
          e - (s = 0 < t - r ? t - r : 1) < n && (s = e - n + 1);
          l = s + n - 1;
        }
        var d = "";
        (d +=
          1 < t ? "<a p='" + (t - 1) + "'>«</a>" : "<a class='disabled'>«</a>"),
          2 <= s && (d += "<a p='1'>1</a>"),
          3 <= s && (d += "<a class='disabled ellipsis'>...</a>");
        for (var c = s; c <= l && !(e < c); c++)
          d +=
            c == t
              ? '<a class="disabled">' + c + "</a>"
              : "<a p='" + c + "'>" + c + "</a>";
        l <= e - 2
          ? (d +=
              "<a class='disabled ellipsis'>...</a><a p='" +
              e +
              "'>" +
              e +
              "</a>")
          : l <= e - 1 && (d += "<a p='" + e + "'>" + e + "</a>"),
          (d +=
            t < e
              ? "<a p='" + (t + 1) + "'>»</a>"
              : "<a class='disabled'>»</a>"),
          a.html(d),
          i &&
            a.find("a[p]").bind("click", function () {
              var t = $(this).attr("p");
              i(t);
            });
      }
    }),
    ($.fn.multiInput = function (a, t, e) {
      var r = $(this);
      if ("string" != typeof a || "setVal" != a) {
        (a = $.extend(
          {
            text: "请在此输入对方ProcessOn账号邮箱或手机号，回车添加",
            autoComplete: !1,
            url: "",
            params: {},
          },
          a
        )),
          r.html("");
        var i = $('<div class="multi-input-vals"></div>'),
          o = $(
            '<div><input type="text" id="multi-input" placeholder="' +
              a.text +
              '" style="width:96%"></div>'
          );
        r.append(i).append(o),
          o
            .find("input")
            .off()
            .on("keyup", function (t) {
              var e = $.trim($(this).val());
              if ("" != e)
                if (13 == t.keyCode && a.setVal) {
                  var i, o;
                  e = e.split(/[,， ]+/);
                  for (var n = 0; n < e.length; n++)
                    if (
                      ((i = e[n].isEmail()),
                      (o = /^[1][3,4,5,6,7,8,9][0-9]{9}$/.test(e[n])),
                      !i && !o)
                    )
                      return void Util.globalTopTip(
                        "手机号或邮箱输入格式有误，请重新输入",
                        "top_error",
                        3e3,
                        $(this).parents(".dialog-box"),
                        !0
                      );
                  console.log(),
                    (e = e.filter(function (t, e, i) {
                      return i.indexOf(t, 0) === e;
                    })),
                    s(null, a.setVal(e)),
                    $(this).val("");
                } else
                  a.autoComplete &&
                    ((a.params = $.extend(a.params, { value: e })),
                    $.ajax({
                      url: a.url,
                      cache: !1,
                      data: a.params,
                      success: function (t) {
                        var e = a.autoCompleteCallback(t);
                        if (($(".popWindow").remove(), "" != e)) {
                          var i = $("<div class='popWindow'></div>").appendTo(
                            "body"
                          );
                          i.html(e), i.popWindow({ target: "#multi-input" });
                        }
                      },
                    }));
            }),
          $(document).on("click", ".multi-input-vals .closeme", function () {
            var t = $(this),
              e = t.parent().attr("val");
            null != e && a.deleteVal && (t.parent().remove(), a.deleteVal(e));
          });
      } else s(t, e);
      function s(t, e) {
        var i,
          o,
          n = r.find(".multi-input-vals"),
          a = "&#xe63e;";
        if (e instanceof Array)
          for (var s = 0; s < e.length; s++) {
            if (
              ((i = e[s].isEmail()),
              (o = /^[1][3,4,5,7,8][0-9]{9}$/.test(e[s])),
              i)
            )
              (a = "&#xe614;"), (t = e);
            else if (o) (a = "&#xe709;"), (t = e);
            else if (!i && !o) return;
            var l =
              '<span val="' +
              t +
              '" class="multi-input-value"><span class="icons">' +
              a +
              '</span><span class="multi-text">' +
              e[s] +
              '</span><span class="icons closeme">&#xe637;</span></span>';
            n.append(l);
          }
        else {
          if (null == t) return;
          l =
            '<span val="' +
            t +
            '" class="multi-input-value"><span class="icons">' +
            a +
            '</span><span class="multi-text">' +
            e +
            '</span><span class="icons closeme">&#xe637;</span></span>';
          n.append(l);
        }
      }
    }),
    ($.fn.popWindow = function (t) {
      var e = $(this),
        i = $(t.target),
        o = 0;
      (o =
        "center" == t.dropCenter
          ? i.offset().left - 0 + i.width() / 2
          : i.offset().left),
        e
          .css({
            left: o,
            top: i.offset().top + i.height() + (t.mh || 0),
            zIndex: t.index || 1,
          })
          .show()
          .siblings(".popWindow")
          .hide(),
        e.on("click.popwindow", function (t) {
          t.stopPropagation();
        }),
        $(document).on("click.popwindow", function () {
          e.hide().css({ index: -1 });
        });
    }),
    ($.fn.id = function () {
      return this.attr("id");
    }),
    ($.fn.submitForm = function (opt) {
      var defaultOpt = { json: !0 },
        options = $.extend(defaultOpt, opt),
        form = $(this);
      if (!options.onSubmit || 0 != options.onSubmit.call(form)) {
        options.url && form.attr("action", options.url);
        var frameId = "submit_frame_" + new Date().getTime(),
          frame = $("<iframe id=" + frameId + " name=" + frameId + "></iframe>")
            .attr(
              "src",
              window.ActiveXObject ? "javascript:false" : "about:blank"
            )
            .css({ position: "absolute", top: -1e3, left: -1e3 });
        form.attr("target", frameId),
          frame.appendTo("body"),
          frame.bind("load", submitCallback),
          form.append(
            "<input type='hidden' name='submitFormByHiddenFrame' id='submitFormByHiddenFrameParam' value='hiddenFrame'/>"
          ),
          form[0].submit(),
          $("#submitFormByHiddenFrameParam").remove();
        var checkCount = 10;
      }
      function submitCallback() {
        frame.unbind();
        var body = $("#" + frameId)
            .contents()
            .find("body"),
          data = body.html();
        if ("" == data)
          return --checkCount ? void setTimeout(submitCallback, 200) : void 0;
        var ta = body.find(">textarea");
        if (ta.length) data = ta.val();
        else {
          var pre = body.find(">pre");
          pre.length && (data = pre.html());
        }
        try {
          eval("data=" + data),
            "error" == data.error
              ? $.simpleAlert(
                  "暂时无法处理您的请求，请稍候重试。",
                  "error",
                  3e3
                )
              : "notlogin" == data.error
              ? Util.loginWindow("open", function () {
                  form.submitForm(options);
                })
              : options.success && options.success(data);
        } catch (t) {
          options.json
            ? ($.simpleAlert(
                "暂时无法处理您的请求，请稍候重试。",
                "error",
                3e3
              ),
              options.error && options.error(data))
            : options.success && options.success(data);
        }
        setTimeout(function () {
          frame.unbind(), frame.remove();
        }, 100);
      }
    }),
    ($.fn.submitFormAjax = function (e) {
      var i = $(this);
      (e.onSubmit && 0 == e.onSubmit.call()) ||
        $.ajax({
          url: e.url ? e.url : $(this).attr("action"),
          type: "POST",
          data: $(this).serialize(),
          success: function (t) {
            "error" == t.error
              ? $.simpleAlert("暂时无法处理您的请求，请稍候重试", "error", 3e3)
              : "notlogin" == t.error
              ? Util.loginWindow("open", function () {
                  i.submitFormAjax(e);
                })
              : e.success && e.success(t);
          },
          error: function (t) {
            $.simpleAlert("暂时无法处理您的请求，请稍候重试", "error", 3e3),
              e.error && e.error(t);
          },
        });
    }),
    ($.fn.numberTip = function (t) {
      var e = $.extend(
          { val: "+1", size: 14, color: "red", time: 1e3, pos: "right" },
          t
        ),
        i = $(this),
        o = $("<span class='number-tip'>" + e.val + "</span>").appendTo("body"),
        n = i.offset().left;
      "right" == e.pos && (n = i.offset().left + i.outerWidth() / 2),
        o.css({ left: n, top: i.offset().top, opacity: 1 }).show(),
        o.animate({ top: "-=14px", opacity: 0 }, 400, function () {
          o.remove();
        });
    }),
    ($.fn.inputTip = function (t) {
      var e = $.extend({ text: "", time: 500, pos: "rightin" }, t),
        i = $(this),
        o = $(".input-tip");
      if (o.length) o.show();
      else {
        o = $("<span class='input-tip'>" + e.text + "</span>").appendTo("body");
        var n = i.offset().left;
        "rightin" == e.pos
          ? (n = i.offset().left + i.outerWidth() - i.width())
          : "rightout" == e.pos && (n = i.offset().left + i.outerWidth() + 5),
          o.css({ left: n, top: e.top || i.offset().top, opacity: 1 }).show(),
          setTimeout(function () {
            o.fadeOut(function () {
              o.remove();
            });
          }, e.time);
      }
    }),
    ($.fn.spread = function (t) {
      var e = this;
      if ("string" != typeof t && !(e.length <= 0)) {
        var i = $(e[0]),
          o = i.parent(),
          n = parseInt(i.css("padding-left").replace("px", "")),
          a = parseInt(i.css("padding-right").replace("px", "")),
          s = parseInt(i.css("padding-top").replace("px", "")),
          l = parseInt(i.css("padding-bottom").replace("px", "")),
          r = parseInt(o.css("padding-left").replace("px", "")),
          d =
            (parseInt(o.css("padding-right").replace("px", "")),
            parseInt(o.css("padding-top").replace("px", ""))),
          c =
            (parseInt(o.css("padding-bottom").replace("px", "")),
            {
              w: i.width() + n + a,
              h: i.height() + s + l,
              ml: 10,
              mt: 10,
              maxWidth: o.width(),
              s: 150,
            }),
          p = $.extend(c, t),
          f = p.w,
          u = p.h,
          g = p.ml,
          h = p.mt,
          m = p.maxWidth,
          v = p.s;
        $.each(e, function (t, e) {
          $(e).css({ top: "-" + u + "px", left: 0 });
        });
        var w = parseInt((m + g) / (f + g));
        Math.ceil(e.length / w);
        $.each(e, function (t, e) {
          var i = $(e),
            o = parseInt(t / w),
            n = parseInt(t % w),
            a = 0 == n ? r + 10 : n * (f + g) + r + 10,
            s = 0 == o ? d + 6 : o * (u + h) + d + 6;
          i.css({ display: "block", position: "absolute" });
          var l = Math.sqrt(Math.pow(s + 150, 2) + Math.pow(a, 2)) / 150;
          i.animate({ top: s, left: a }, l * v);
        });
      }
    });
  var streamInputStreams = {},
    curr_stream_icon = null;
  $.fn.streamInput = function (t) {
    if (
      this[0] &&
      t.face &&
      "DIV" == this[0].nodeName &&
      !this.attr("stream_id")
    ) {
      var e = { target: this },
        i = $.extend(e, t),
        o = { id: "", range: null },
        n = Object.keys(streamInputStreams);
      (o.id = n.length ? streamInputStreams[n[n.length - 1]].id + 1 : 1),
        (o.stream_id =
          "stream_" +
          (n.length ? streamInputStreams[n[n.length - 1]].id + 1 : 1)),
        this.attr({
          contentEditable: "true",
          spellcheck: "false",
          accesskey: "q",
          stream_id: o.stream_id,
        }),
        $(i.face).attr("for_stream", o.stream_id),
        (streamInputStreams[o.stream_id] = o),
        (curr_stream_icon = o);
      var c = !1,
        p = !1,
        f = 0,
        u = 0,
        g = 0;
      i.home;
      $(i.target)
        .off("click.stream keyup.stream")
        .on("click.stream keyup.stream", function (t) {
          (curr_stream_icon =
            streamInputStreams[$(this).attr("stream_id")]).target = $(this);
          var e = window.getSelection();
          curr_stream_icon.range = e.getRangeAt(0).cloneRange();
        }),
        $(i.target)
          .off("DOMSubtreeModified.stream")
          .on("DOMSubtreeModified.stream", function (t) {
            if (c && ((c = !1), !($(this).children().length < 1)))
              if ((h($(this)), m($(this)), p)) {
                h($(this).find(".paste-cont"));
                var e = $(this).html();
                $(this).empty();
                var i = window.getSelection(),
                  o = i.getRangeAt(0);
                o.deleteContents();
                var n,
                  a,
                  s = $("<div>" + e + "</div>").html(),
                  l = document.createElement("div"),
                  r = document.createDocumentFragment();
                if (s)
                  for (l.innerHTML = s; (n = l.firstChild); )
                    (a = r.appendChild(n)),
                      "SPAN" == n.nodeName &&
                        (f = r.childNodes.length + n.childNodes.length - 1);
                if ((o.insertNode(r), a)) {
                  if (
                    ((o = o.cloneRange()).collapse(!0),
                    (function (t) {
                      var e = t.children(".paste-cont");
                      if (e.length < 1) return;
                      e.each(function (t, e) {
                        $(e).replaceWith($(e).html());
                      });
                    })($(this)),
                    o.setStart(this, f || this.childNodes.length - u),
                    o.setEnd(this, f || this.childNodes.length - u),
                    u && g)
                  ) {
                    var d = this.childNodes.length - u;
                    (n = this.childNodes[d]),
                      o.setStart(n, n.data.length - g),
                      o.setEnd(n, n.data.length - g);
                  }
                  i.removeAllRanges(), i.addRange(o);
                }
              } else v(this);
          }),
        $(i.target)
          .off("paste.stream")
          .on("paste.stream", function (t) {
            var e = (t = t.originalEvent).clipboardData || t.view.clipboardData,
              i = window.getSelection(),
              o = i.getRangeAt(0);
            o.deleteContents();
            try {
              var n =
                e.getData("text/html") ||
                e
                  .getData("text/plain")
                  .replace(/</g, "&lt;")
                  .replace(/>/g, "&gt;");
              n = n
                .replace(/<(\/)?(html|body)(\s|\S)+?>/g, "")
                .replace(/(<!--.+?-->)|(\r\n)/g, "");
              var a = $("<div>" + n + "</div>");
              return h(a), m(a), r(a, i, o, this), !1;
            } catch (t) {
              if (
                ((c = !0),
                "" ==
                  $.trim(
                    $(this)
                      .html()
                      .replace(/\s+|<br>/g, "")
                  ))
              )
                return void (p = !1);
              p = !0;
              var s = document.createElement("span");
              (s.className = "paste-cont"),
                o.insertNode(s),
                (o = o.cloneRange()).selectNodeContents(s),
                i.removeAllRanges(),
                i.addRange(o);
              var l = (function (t) {
                var e = t.cloneNode(!0),
                  i = e.childNodes.length,
                  o = 0,
                  n = 0;
                if (3 < i && 0 < $(e).children(".paste-cont").length)
                  for (var a = 0; a < i; a++) {
                    var s = e.childNodes[a];
                    if ("SPAN" == s.nodeName) {
                      (o = i - a - 1),
                        a < i - 1 &&
                          "#text" == e.childNodes[a + 1].nodeName &&
                          (n = e.childNodes[a + 1].data.length);
                      break;
                    }
                  }
                return { v: o, len: n };
              })(this);
              (u = l.v), (g = l.len);
            }
          }),
        $(i.face)
          .off("click.stream")
          .on("click.stream", function () {
            if (
              (((curr_stream_icon =
                streamInputStreams[$(this).attr("for_stream")]).target = $(
                "div[stream_id='" + $(this).attr("for_stream") + "']"
              )).focus(),
              curr_stream_icon.range)
            ) {
              var t = window.getSelection();
              t.removeAllRanges(), t.addRange(curr_stream_icon.range);
            }
            var e = $("#faces_dialog");
            e.length < 1 &&
              (e = $("<div></div>")
                .attr({ id: "faces_dialog", class: "faces-lib" })
                .append(
                  "<ul><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li><li></li></ul>"
                )
                .appendTo("body")),
              $("#faces_dialog").popMenu({
                target: this,
                position: "right",
                zindex: 4,
              }),
              $("#faces_dialog ul li")
                .off("click.stream")
                .on("click.stream", function (t) {
                  $("#faces_dialog").popMenu("close");
                  var e,
                    i = $(curr_stream_icon.target);
                  if (
                    ((e =
                      "<img class='ico-face' src='/assets/images/faces/faces/" +
                      ($(this).index() + 1) +
                      ".gif'>"),
                    "" == $.trim(i.html().replace(/&nbsp;|<br>/g, "")))
                  )
                    return i.html(e), void v(i[0]);
                  i.focus();
                  var o = window.getSelection(),
                    n = curr_stream_icon.range;
                  n.deleteContents(), r($("<div>" + e + "</div>"), o, n, i);
                }),
              $("#faces_dialog").on("mousedown", function (t) {
                t.stopPropagation();
              });
          });
    }
    function h(t) {
      try {
        var e = t
          .html()
          .replace(/^\s+/g, " ")
          .replace(/(\S)\s+(\S)?/g, "$1 $2");
        t.html(e);
        var i = t.children(":not(.ico-face, .paste-cont)");
        if (i.length < 1) return;
        i.each(function (t, e) {
          $(e).css("display");
          $(e).is("img, title, head, link, style, script")
            ? $(e).remove()
            : $(e).replaceWith($(e).html());
        });
      } catch (t) {}
      0 < (i = t.children(":not(.ico-face, .paste-cont)")).length && h(t);
    }
    function m(t) {
      t.find(".ico-face").each(function (t, e) {
        $(e).replaceWith(
          $(
            "<img class='" +
              $(e).attr("class") +
              "' src='" +
              $(e).attr("src") +
              "'>"
          )
        );
      });
    }
    function v(t) {
      $(t).focus();
      try {
        var e = document.createRange();
        e.selectNode(t.lastChild || t),
          e.collapse(!1),
          window.getSelection().removeAllRanges(),
          window.getSelection().addRange(e),
          $(t).keyup();
      } catch (t) {}
    }
    function r(t, e, i, o) {
      var n,
        a,
        s = t.html(),
        l = document.createElement("div"),
        r = document.createDocumentFragment();
      if (s) for (l.innerHTML = s; (n = l.firstChild); ) a = r.appendChild(n);
      return (
        i.insertNode(r),
        a &&
          ((i = i.cloneRange()).setStartAfter(a),
          i.collapse(!0),
          e.removeAllRanges(),
          e.addRange(i),
          $(o).keyup()),
        i
      );
    }
  };
})(),
  (Util.ajax = function (e) {
    if (!e.onSend || 0 != e.onSend()) {
      return (
        (e = $.extend({ type: "POST" }, e)),
        $.ajax({
          url: e.url,
          type: e.type,
          traditional: !0,
          data: e.data,
          success: function (t) {
            if ("error" == t.error)
              $.simpleAlert("<@i18n resource='global.error'/>", "error", 3e3),
                e.error && e.error(t);
            else if ("notlogin" == t.error)
              e.loginValidate && e.loginValidate(t),
                Util.loginWindow("open", function () {
                  Util.ajax(e);
                });
            else if ("reptile" == t.error) {
              if (
                (console.info("安全校验"), "undefined" != typeof TencentCaptcha)
              )
                return void new TencentCaptcha("2046103261", function (t) {
                  0 === t.ret &&
                    setTimeout(function () {
                      Util.ajax(e);
                    }, 1e3);
                }).show();
            } else e.success && e.success(t);
          },
          error: function (t) {
            t.status && e.error && e.error(t);
          },
        })
      );
    }
  }),
  (Util.get = function (e, i, o) {
    $.ajax({
      url: e,
      type: "GET",
      data: i,
      success: function (t) {
        "error" == t.error
          ? $.simpleAlert("<@i18n resource='global.error'/>", "error", 3e3)
          : "notlogin" == t.error
          ? Util.loginWindow("open", function () {
              Util.get(e, i, o);
            })
          : o(t);
      },
      error: function (t) {},
    });
  }),
  (Util.globalTopTip = function (t, e, i, o, n) {
    if (void 0 !== t) {
      null == i && (i = 5e3), null == e && (e = "top_success");
      var a = $("#global_top_dialog");
      0 < a.length && a.remove(),
        (a = $(
          '<div id="global_top_dialog" class="global_top_dialog"><div class="left_arrow"></div>' +
            t +
            '<div class="right_arrow"></div></div>'
        ).appendTo("body")).addClass(e),
        n &&
          (a.find(".left_arrow").remove(),
          a.find(".right_arrow").remove(),
          a.addClass("noarrow"));
      var s = a.outerWidth();
      o
        ? a.css("top", $(o).offset().top + "px")
        : 0 == $("#header").length && a.css("top", "0px"),
        a.css({ "margin-left": -0.5 * (parseInt(s) - 12) + "px" }).show(),
        setTimeout(function () {
          a.addClass("show"),
            setTimeout(function () {
              a.removeClass("show"),
                setTimeout(function () {
                  a.fadeOut("slow").remove();
                }, 250);
            }, i);
        }, 50);
    }
  }),
  (Util.globalLeftTip = function (t) {
    var e = t;
    if (void 0 !== e.content) {
      e.delay || (e.delay = 5e3),
        null == e.type && (e.type = "left-bot-default");
      var i = $("#global-leftbot-dialog");
      0 < i.length && i.remove(),
        (i = $(
          '<div id="global-leftbot-dialog" class="global-leftbot-dialog">' +
            e.content +
            "</div>"
        ).appendTo("body")).addClass(e.type),
        i.show(),
        setTimeout(function () {
          i.addClass("show"),
            setTimeout(function () {
              i.removeClass("show"),
                setTimeout(function () {
                  i.fadeOut("slow").remove();
                }, 250);
            }, e.delay);
        }, 50);
    }
  }),
  (Util.loading = function (t) {
    if ("string" == typeof t && "close" == t)
      return $("#top_loading_tip").remove(), void $("#dialog_model").remove();
    (t = $.extend(
      { content: "loading...", show: 1e3, delay: 0, model: !1 },
      t
    )),
      0 < $("#top_loading_tip").length && $("#top_loading_tip").remove();
    $(
      "<div id='top_loading_tip' class='loadingTop'><p><b>" +
        t.content +
        "</b></p></div>"
    ).appendTo("body");
    t.model &&
      ($("body").append("<div id='dialog_model'></div>"),
      $("#dialog_model").css({
        width: "100%",
        height: "100%",
        position: "fixed",
        top: 0,
        left: 0,
        "z-index": t.zIndex - 1,
        opacity: 0.6,
        background: "#FFF",
        display: "none",
      })),
      "number" == typeof t.show
        ? $("#top_loading_tip")
            .delay(t.delay)
            .show(0, function () {
              t.model && $("#dialog_model").show();
            })
            .delay(t.show)
            .fadeOut(500, function () {
              t.model && $("#dialog_model").hide();
            })
        : !0 === t.show &&
          $("#top_loading_tip")
            .delay(t.delay)
            .show(0, function () {
              t.model && $("#dialog_model").show();
            });
  }),
  (Util.loadingball = function (t) {
    if (t.close) $(".ball-spinner").hide();
    else {
      var e = t.con;
      e || (e = $("body"));
      var i = e.children(".ball-spinner");
      0 < i.length
        ? i.show()
        : $(
            '<div class="ball-spinner center-middle"><div class="ball1"></div><div class="ball2"></div><div class="ball3"></div>'
          ).appendTo(e),
        t.css && "object" == typeof t.css && $(".ball-spinner>div").css(t.css);
    }
  }),
  (Util.messageNoPrivilege = function (t, e) {
    $.confirm({
      content:
        "<div class='filecheck-con'><span class='icons'>&#xe656;</span><div class='filecheck-right'><div>" +
        t +
        "</div><div>您可以 <a target='_blank' href='/upgrade'>" +
        e +
        "</a></div></div>",
      onConfirm: function () {
        window.location = "/upgrade";
      },
    });
  }),
  (Util.checkOrgExpire = function (e, i) {
    Util.ajax({
      url: "/organizations/check_expire",
      data: i,
      success: function (t) {
        if (t.expire) return $.imgtoast({ tid: i.orgId }), void e(!1);
        e(!0);
      },
    });
  }),
  (Util.checkFileCount = function (e, t) {
    Util.ajax({
      url: "/view/privatefilecount",
      data: t,
      success: function (t) {
        t.member
          ? e()
          : t.filecount >= t.totalcount
          ? $.confirm({
              content:
                "<div class='filecheck-con'><span class='icons'>&#xe656;</span><div class='filecheck-right'><div>您的文件数量不足，无法创建新的文件</div></div></div>",
              onConfirm: function () {
                e(!1);
              },
              okval: "升级扩容",
              hiddenCancel: !0,
            })
          : e();
      },
    });
  }),
  (Util.creatCode = function (t) {
    var e,
      i,
      o = [
        "abcdefghijklmnopqrstuvwxyz",
        "ABCDEFGHIJKLMNOPQRSTUVWXYZ",
        "123456789",
      ],
      n = "";
    for (i = 0; i < t; i++)
      n += o[(e = Math.floor(3 * Math.random()))].substr(
        Math.floor(Math.random() * o[e].length),
        1
      );
    return n;
  }),
  (Util.loadAvatar = function (t) {
    var e = "https://accounts.processon.com";
    return (
      location.origin.toLowerCase().indexOf("processon.com") < 0 && (e = ""),
      t
        ? '<img src="' + e + "/photo/" + t + '.png"/>'
        : '<img src="/assets/imgs/on.png"/>'
    );
  }),
  (Util.filterXss = function (t) {
    return null == t || "" == t
      ? ""
      : (t = (t = (t = (t = (t = (t = (t = t.toString()).replace(
          /</g,
          "&lt;"
        )).replace(/%3C/g, "&lt;")).replace(/>/g, "&gt;")).replace(
          /%3E/g,
          "&gt;"
        )).replace(/'/g, "&apos;")).replace(/"/g, "&quot;"));
  }),
  (Util.restoreXss = function (t) {
    return null == t || "" == t
      ? ""
      : (t = (t = (t = (t = (t = t.replace(/&amp;/g, "&")).replace(
          /&lt;/g,
          "<"
        )).replace(/&gt;/g, ">")).replace(/&apos;/g, "'")).replace(
          /&quot;/g,
          '"'
        ));
  }),
  (String.prototype.isEmpty = function () {
    return this.replace(/(^\s*)|(\s*$)/g, "").length <= 0;
  }),
  (String.prototype.notEmpty = function () {
    return !this.isEmpty();
  }),
  (String.prototype.isEmail = function () {
    return (
      !this.isEmpty() &&
      !!/^\w+((-\w+)|(\.\w+))*\@[A-Za-z0-9]+((\.|-)[A-Za-z0-9]+)*\.[A-Za-z0-9]+$/.test(
        this
      )
    );
  }),
  (Array.prototype.inArray = function (t) {
    for (var e = 0; e < this.length; e++) if (this[e] == t) return !0;
    return !1;
  }),
  (Array.prototype.indexOf = function (t) {
    for (var e = 0; e < this.length; e++) if (this[e] == t) return e;
    return -1;
  }),
  (Array.prototype.remove = function (t) {
    var e = this.indexOf(t);
    -1 < e && this.splice(e, 1);
  }),
  Array.prototype.forEach ||
    (Array.prototype.forEach = function (t, e) {
      var i, o;
      if (null == this) throw new TypeError(" this is null or not defined");
      var n = Object(this),
        a = n.length >>> 0;
      if ("[object Function]" != {}.toString.call(t))
        throw new TypeError(t + " is not a function");
      for (e && (i = e), o = 0; o < a; ) {
        var s;
        o in n && ((s = n[o]), t.call(i, s, o, n)), o++;
      }
    }),
  (Util.getUrlParams = function (t) {
    var e = new RegExp("(^|&)" + t + "=([^&]*)(&|$)", "i"),
      i = window.location.search.substr(1).match(e);
    return null != i ? unescape(i[2]) : null;
  }),
  (Util.shapesCount = function (t) {
    1e3 < $("#designer_canvas").find(".shape_box").length &&
      null != UI &&
      UI.showTip(
        "本文件的图形数量已足够绘制一艘航空母舰，为了好的作图体验，建议您不要制作过大的文件哦"
      );
  }),
  (Util.GetNextMonthDay = function (t) {
    var e = new Date();
    days = e.getDate();
    var i = e.getFullYear(),
      o = parseInt(e.getMonth() + 1) + parseInt(t);
    12 < o &&
      ((i =
        parseInt(i) + parseInt(parseInt(o) / 12 == 0 ? 1 : parseInt(o) / 12)),
      (o = parseInt(o) % 12));
    var n = e.getDate(),
      a = new Date(i, o, 0);
    return (
      (a = a.getDate()) < n && (n = a),
      o < 10 && (o = "0" + o),
      i + "年" + o + "月" + n + "日"
    );
  }),
  (Util.GetNextDay = function (t, e) {
    if (e) var i = new Date(e);
    else i = new Date();
    var o = new Date(i);
    return (
      o.setDate(i.getDate() + t),
      o.getFullYear() + "年" + (o.getMonth() + 1) + "月" + o.getDate() + "日"
    );
  }),
  (Util.numAbb = function (t) {
    return t < 1e3
      ? t
      : 1e7 <= t
      ? '<span class="num_n">' +
        (t / 1e7).toFixed(2) +
        '</span><span class="num_unit">kw</span>'
      : 1e6 <= t
      ? '<span class="num_n">' +
        (t / 1e6).toFixed(2) +
        '</span><span class="num_unit">bw</span>'
      : 1e4 <= t
      ? '<span class="num_n">' +
        (t / 1e4).toFixed(2) +
        '</span><span class="num_unit">w</span>'
      : 1e3 <= t
      ? '<span class="num_n">' +
        (t / 1e3).toFixed(2) +
        '</span><span class="num_unit">k</span>'
      : void 0;
  }),
  (Util.strEllipsis = function (t, e) {
    return "string" != typeof t
      ? ""
      : t.length > e
      ? t.substring(0, e) + "..."
      : t;
  }),
  (Util.ellipsis_title = function (t, e) {
    return "string" != typeof t ? "" : t.length > e ? 'title="' + t + '"' : "";
  }),
  (Util.norm_time = function (t) {
    var e = new Date(t).getTime(),
      i = new Date().getTime() - e;
    if (i < 6e4) return "刚刚";
    if (i < 36e5) return (i / 1e3 / 60).toFixed(0) + "分钟前";
    if (i < 864e5) return (i / 1e3 / 60 / 60).toFixed(0) + "小时前";
    if (i < 864e6) return (i / 1e3 / 60 / 60 / 24).toFixed(0) + "天前";
    var o = new Date(t);
    return (
      (oYear = o.getFullYear()),
      (oMonth = o.getMonth() + 1),
      (oDay = o.getDate()),
      oYear + "-" + oMonth + "-" + oDay
    );
  });
