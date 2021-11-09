var TeamShape = {
  config: { panelItemWidth: 60, panelItemHeight: 60, host: "" },
  categories: [{ id: "123", name: "", title: "未命名分类" }],
  shapeMaps: {},
  keyWord: "",
  moveCategorieId: "",
  acComponentId: "",
  acCategoryId: "",
  init: function () {
    var a = this;
    $.ajax({
      url: a.config.host + "/api/chart/component/item/list",
      type: "post",
      data: { orgId: orgId },
      success: function (c) {
        if (c.code == "200") {
          a.categories = c.data.chartComponentItems;
          for (var b = 0; b < a.categories.length; b++) {
            var d = a.categories[b];
            d.id = d.componentItemId;
            a.renderCategory(d);
            var f = localStorage.getItem("team_categories");
            if (f == null) {
              if (b == 0) {
                a.getCategoryList(d.id);
                $("#" + d.id).removeClass("panel_team_collapsed");
              }
            } else {
              if (f.indexOf(d.id) > -1) {
                a.getCategoryList(d.id);
                $("#" + d.id).removeClass("panel_team_collapsed");
              }
            }
          }
          a.ui.init();
        }
      },
      error: function () {},
    });
    this.initEvt();
    $("#shape_panel")
      .off("click.categories_edit li")
      .on("click", ".categories_edit li", function (c) {
        c.stopPropagation();
        var b = $(this);
        var h = b.parent().attr("data-categories");
        var g = b.parent().attr("data-title");
        if (b.attr("tit") == "delete") {
          TeamShape.removeCategory(h, g);
        } else {
          var f = $("#" + h + " .panel_team_title_content");
          var d = f.text();
          f.html(
            '<input type="text" class="panel_team_title_input" value="' +
              d +
              '"/>'
          );
          $(".edit_team_container").css("right", "1000px");
          $(".panel_team_title_input").focus();
          $(".panel_team_title_input").select();
          $(".panel_team_title_input")
            .off("keyup")
            .on("keyup", function (i) {
              i.stopPropagation();
              if (i.keyCode == 13) {
                TeamShape.updataCategory(h, $(this).val());
                return;
              }
            });
          $(".panel_team_title_input")
            .off("blur")
            .on("blur", function () {
              TeamShape.updataCategory(h, $(this).val());
            });
          $(".panel_team_title_input")
            .off("click")
            .on("click", function (i) {
              i.stopPropagation();
            });
        }
        $(this).parent().remove();
      });
    $("#shape_panel")
      .off("click.team_shape_edit li")
      .on("click", ".team_shape_edit li", function (k) {
        k.stopPropagation();
        var j = $(this);
        var b = j.parent().attr("data-shapeid");
        var d = j.parent().attr("data-categories");
        var l = j.attr("tit");
        var m = j.parent().attr("data-title");
        if (l == "edit") {
          var f = { elements: {} };
          TeamShape.shapeMaps[b].elements = TeamShape.utils.resetShapes(
            TeamShape.shapeMaps[b].elements,
            { x: 100, y: 100 }
          );
          for (var h = 0; h < TeamShape.shapeMaps[b].elements.length; h++) {
            var c = TeamShape.shapeMaps[b].elements[h];
            f.elements[c.id] = c;
          }
          f.page = {
            padding: 20,
            backgroundColor: "transparent",
            orientation: "portrait",
            gridSize: 15,
            width: 1855,
            showGrid: true,
            lineJumps: false,
            height: 844,
          };
          $(".team_shape_title").text(
            "编辑组件: " + TeamShape.shapeMaps[b].title
          );
          $("#team_shape_form_title").val(TeamShape.shapeMaps[b].title);
          $("#team_shape_form_def").val(
            window.btoa(encodeURIComponent(JSON.stringify(f)))
          );
          $("#team_shape_dialog").css("top", "0px");
          if ($(".team_shape_iframe").length == 0) {
            $(".team_shape_content").append(
              '<iframe style="width:100%;height: calc(100% - 30px);border:1px solid #ccc;" name="iframe_team_shape" id="team_shape_iframe"></iframe>'
            );
          }
          $("#team_shape_form")[0].submit();
          $("#team_shape_iframe").onreadystatecgange = function () {
            if (this.readyState == "complete") {
            }
          };
          TeamShape.initMessage(b, d);
        } else {
          if (l == "copy") {
            TeamShape.copyShape(b, d);
          } else {
            if (l == "move") {
              TeamShape.moveShape(b, d);
            } else {
              if (l == "info") {
                var g = $("#teamshape_" + b + " .panel_team_item_title");
                var n = g.text();
                g.html(
                  '<input type="text" class="panel_team_shape_input" value="' +
                    n +
                    '"/>'
                );
                $(".panel_team_shape_input").focus();
                $(".panel_team_shape_input").select();
                $(".panel_team_shape_input")
                  .off("keyup")
                  .on("keyup", function (i) {
                    i.stopPropagation();
                    if (i.keyCode == 13) {
                      TeamShape.updataTitle(b, $(this).val());
                      return;
                    }
                  });
                $(".panel_team_shape_input")
                  .off("blur")
                  .on("blur", function () {
                    TeamShape.updataTitle(b, $(this).val());
                  });
                $(".panel_team_shape_input")
                  .off("click")
                  .on("click", function (i) {
                    i.stopPropagation();
                  });
              } else {
                if (l == "delete") {
                  TeamShape.removeShape(b, d, m);
                }
              }
            }
          }
        }
        $(this).parent().remove();
      });
    $("body").click(function () {
      $(".categories_edit").hide();
      $(".team_shape_edit").hide();
    });
    $(function () {
      $(window).unbind("beforeunload");
      window.onbeforeunload = null;
    });
    if (typeof window.addEventListener != "undefined") {
      window.addEventListener("message", a.onmessage, false);
    } else {
      if (typeof window.attachEvent != "undefined") {
        window.attachEvent("onmessage", a.onmessage);
      }
    }
  },
  initEvt: function () {
    var a = this;
    $(".panel_team_title")
      .unbind()
      .bind("click", function () {
        if (!$(this).hasClass("search")) {
          $(this).parent().toggleClass("panel_team_collapsed");
          var c = "";
          $(".panel_team_container").each(function (d, f) {
            if ($(f).hasClass("panel_team_collapsed") == false) {
              var g = $(f).attr("id");
              if (g) {
                c += g + ",";
              }
            }
          });
          localStorage.setItem("team_categories", c);
          if (
            !$(this).parent().hasClass("panel_team_collapsed") &&
            $(this).parent().find(".panel_team_box").length == 0
          ) {
            var b = $(this).parent().attr("id");
            a.getCategoryList(b);
          }
        }
      });
    $(".panel_team_container")
      .off()
      .on("mouseup.myshapes", function () {
        if (Designer.op.state != "dragging") {
          return;
        }
        if (isComponentAdmin != "true") {
          Util.globalTopTip(
            "您当前没有操作权限，请联系管理员开通",
            "top_error",
            2000,
            $("#designer"),
            true
          );
          return;
        }
        var c = $(this).attr("id");
        var p = Utils.getSelectedIds();
        if (p.length > 100) {
          Util.globalTopTip(
            "图形数量不能超出100",
            "top_error",
            2000,
            $("#designer"),
            true
          );
          return;
        }
        var t = Utils.getControlBox(p);
        if (p.length > 0) {
          var d = [];
          for (var l = 0, o = p.length; l < o; l++) {
            var h = p[l],
              q = Utils.copy(Model.getShapeById(h));
            d.push(q);
            if (q.children) {
              for (var k = 0; k < q.children.length; k++) {
                if (p.indexOf(q.children[k]) < 0) {
                  var m = Utils.copy(Model.getShapeById(q.children[k]));
                  d.push(m);
                }
              }
            }
          }
          var n = Utils.copyArray(Utils.getContainedShapes(d));
          var r = [];
          d = d.concat(n);
          for (var l = 0; l < n.length; l++) {
            r.push(n[l].id);
          }
          var f = Model.define.elements;
          for (key in f) {
            if (f[key].name == "linker") {
              var g = Utils.copy(f[key]);
              if (r.indexOf(g.to.id) > -1 && r.indexOf(g.from.id) > -1) {
                d.push(g);
              }
            }
          }
          var b = a.flow2svg.init(d);
          d = a.utils.resetShapes(d);
          var s = {
            id: Utils.newId(),
            category: c,
            title: "未命名组件",
            elements: d,
            box: Utils.getShapesBounding(d),
            thumbnail: b,
          };
          $.ajax({
            url: a.config.host + "/api/chart/component/save",
            type: "post",
            data: {
              orgId: orgId,
              componentItemId: c,
              title: "未命名组件",
              definition: JSON.stringify(d),
              thumbFileStr: b,
              ownerId: userId,
              ownerName: userName,
            },
            success: function (i) {
              if (i.code == "200") {
                s.id = i.data.chartComponent.componentId;
                s.thumbnail = i.data.chartComponent.thumbUrl;
                $("#" + c)
                  .find(".team_content")
                  .hide();
                a.updateShape(s, true);
              } else {
                Util.globalTopTip(
                  e.message,
                  "top_error",
                  2000,
                  $("#designer_viewport"),
                  true
                );
              }
            },
            error: function () {},
          });
        }
      });
    $(".panel_team_box")
      .off("mousedown")
      .on("mousedown", function (s) {
        s.stopPropagation();
        var m = $(this);
        var b = m.attr("shapeId");
        if (m.hasClass("readonly") || a.shapeMaps[b].elements == "") {
          return;
        }
        var q = [];
        var h;
        Designer.op.changeState("creating_from_panel");
        var n = null;
        var o = [];
        var k = [];
        var g = $("#designer_canvas");
        var c = a.utils.getCreatingImg(b);
        $("#designer").bind("mousemove.creating", function (i) {
          a.utils.setCreatingImg(c, i);
        });
        var j = [];
        for (var f = Model.orderList.length - 1; f >= 0; f--) {
          var p = Model.orderList[f].id;
          var l = Model.getShapeById(p);
          if (l.attribute && l.attribute.collapseBy) {
            continue;
          }
          if (l.name == "linker" || l.parent) {
            continue;
          }
          var r = Utils.getControlBox([p]);
          r.id = p;
          j.push(r);
        }
        $("#canvas_container").bind("mousemove.create", function (A) {
          var D = Utils.getRelativePos(A.pageX, A.pageY, g);
          if (n == null) {
            n = a.utils.createShapes(b, D.x, D.y);
            for (var y = 0; y < n.length; y++) {
              var v = n[y];
              v.pos = Utils.copy(v.props);
              if (v.name == "linker") {
                v.to_ = Utils.copy(v.to);
                v.from_ = Utils.copy(v.from);
                v.points_ = Utils.copyArray(v.points);
              }
              o.push(v.id);
              $("#" + v.id).attr("class", "shape_box_creating");
              k.push($("#" + v.id));
            }
          }
          for (var x = 0; x < n.length; x++) {
            var C = k[x];
            var v = n[x];
            if (v.boxPos) {
              v.props.x = D.x.restoreScale() - v.boxPos.w / 2 + v.pos.x;
              v.props.y = D.y.restoreScale() - v.boxPos.h / 2 + v.pos.y;
            } else {
              v.props.x = D.x.restoreScale() - v.props.w / 2;
              v.props.y = D.y.restoreScale() - v.props.h / 2;
            }
            if (v.name == "linker") {
              v.from = $.extend(
                true,
                v.from,
                TeamShape.utils.resetPosByMouse(D, v.from_, v)
              );
              v.to = $.extend(
                true,
                v.to,
                TeamShape.utils.resetPosByMouse(D, v.to_, v)
              );
              if (v.linkerType == "broken" || v.linkerType == "curve") {
                for (var y = 0; y < v.points_.length; y++) {
                  v.points[y] = TeamShape.utils.resetPosByMouse(
                    D,
                    v.points_[y],
                    v
                  );
                }
              }
            }
            var u = v.props;
            var w = Designer.op.snapLine(u, [v.id], true, v, j);
            if (w.attach) {
              v.attachTo = w.attach.id;
            } else {
              delete v.attachTo;
            }
            if (!v.container) {
              if (w.container) {
                v.container = w.container.id;
              } else {
                delete v.container;
              }
            }
            C.css({
              left:
                v.props.x.toScale() -
                (C.width() - v.props.w.toScale()) / 2 +
                "px",
              top:
                v.props.y.toScale() -
                (C.height() - v.props.h.toScale()) / 2 +
                "px",
              "z-index": Model.orderList.length,
            });
          }
          q = Utils.getShapeAnchorInLinker(n[0]);
          Designer.op.hideLinkPoint();
          for (var y = 0; y < q.length; y++) {
            var t = q[y];
            for (var B = 0; B < t.anchors.length; B++) {
              var z = t.anchors[B];
              Designer.op.showLinkPoint(Utils.toScale(z));
            }
          }
          if (n[0].name == "linker") {
            h = Designer.op.moveLinkerFocus(n[0]);
          }
        });
        var d = false;
        $("#canvas_container").bind("mouseup.create", function (i) {
          d = true;
        });
        $(document).bind("mouseup.create", function () {
          $(this).unbind("mouseup.create");
          $("#designer").unbind("mousemove.creating");
          $("#creating_shape_container").hide();
          Designer.op.hideLinkPoint();
          Designer.op.hideSnapLine();
          $("#canvas_container")
            .unbind("mouseup.create")
            .unbind("mousemove.create");
          if (n != null) {
            if (d == false) {
              for (var K = 0; K < k.length; K++) {
                var I = k[K];
                I.remove();
              }
            } else {
              MessageSource.beginBatch();
              if (h) {
                n[0] = Utils.copy(h);
              }
              for (var J = 0; J < n.length; J++) {
                var z = n[J];
                var I = k[J];
                if (z.onCreated && name.indexOf("myshape") < 0) {
                  var A = z.onCreated();
                  if (A == false) {
                    I.remove();
                    MessageSource.commit();
                    return;
                  }
                }
                for (key in z) {
                  if (key.indexOf("_") > -1) {
                    delete z[key];
                  }
                  if (key == "boxPos") {
                    delete z[key];
                  }
                  if (key == "pos") {
                    delete z[key];
                  }
                }
                if (z.name == "linker") {
                  z.props = { zindex: z.props.zindex };
                }
                I.attr("class", "shape_box");
                Designer.events.push("created", z);
              }
              Model.addMulti(n);
              Utils.unselect();
              Utils.selectShape(o);
              if (n.length == 1) {
                Designer.op.editShapeText(n[0]);
              }
              var v = Utils.getShapeContext(n[0].id);
              var P = k[0].position();
              var u = 7;
              for (var K = 0; K < q.length; K++) {
                var M = q[K];
                var D = M.linker;
                if (M.type == "line") {
                  var B = Utils.copy(D);
                  var G = Utils.copy(D);
                  G.id = Utils.newId();
                  if (M.anchors.length == 1) {
                    var y = M.anchors[0];
                    var L = Utils.getPointAngle(n[0].id, y.x, y.y, u);
                    D.to = { id: n[0].id, x: y.x, y: y.y, angle: L };
                    G.from = { id: n[0].id, x: y.x, y: y.y, angle: L };
                  } else {
                    if (M.anchors.length == 2) {
                      var O = M.anchors[0];
                      var N = M.anchors[1];
                      var H = Utils.measureDistance(D.from, O);
                      var F = Utils.measureDistance(D.from, N);
                      var E, x;
                      if (H < F) {
                        E = O;
                        x = N;
                      } else {
                        E = N;
                        x = O;
                      }
                      var L = Utils.getPointAngle(n[0].id, E.x, E.y, u);
                      D.to = { id: n[0].id, x: E.x, y: E.y, angle: L };
                      L = Utils.getPointAngle(n[0].id, x.x, x.y, u);
                      G.from = { id: n[0].id, x: x.x, y: x.y, angle: L };
                    }
                  }
                  if (M.anchors.length <= 2) {
                    D = Designer.op.beautifyLinkerFocus(D, true);
                    G = Designer.op.beautifyLinkerFocus(G, true);
                    Designer.painter.renderLinker(D, true);
                    Model.update(D);
                    Designer.painter.renderLinker(G, true);
                    G.props.zindex = Model.maxZIndex + 1;
                    Model.add(G);
                    Designer.events.push("linkerCreated", G);
                  }
                } else {
                  var y = M.anchors[0];
                  var L = Utils.getPointAngle(n[0].id, y.x, y.y, u);
                  if (M.type == "from") {
                    D.from = { id: n[0].id, x: y.x, y: y.y, angle: L };
                  } else {
                    D.to = { id: n[0].id, x: y.x, y: y.y, angle: L };
                  }
                  D = Designer.op.beautifyLinkerFocus(D, true);
                  Designer.painter.renderLinker(D, true);
                  Model.update(D);
                }
              }
              MessageSource.commit();
              var w = n[0].props.w;
              var C = n[0].props.h;
              var t = Utils.getControlBox(o);
              Designer.op.changeCanvas(t);
              Designer.events.push("resetBrokenLinker");
            }
          }
          m.css({ left: "0px", top: "0px" });
          Designer.op.resetState();
        });
      });
    $(".edit_team_container")
      .off()
      .on("click", function (g) {
        g.stopPropagation();
        $(".team_shape_edit").hide();
        var i = $(this);
        $("#shape_panel .categories_edit").remove();
        var b = i.parent().parent();
        var c = b.attr("id");
        var h = b.find(".panel_team_title_content").text();
        var f =
          "<ul class='categories_edit menu'  data-title='" +
          h +
          "' data-categories='" +
          c +
          "' ><li tit='info'> &nbsp;&nbsp;修改标题</li><li tit='delete'>&nbsp;&nbsp;删除</li></ul>";
        b.append(f);
        var d = b.offset().top;
        if (window.innerHeight - d < 100) {
          d -= 80;
        }
        $("#shape_panel .categories_edit").css({ top: d + "px" });
        $("#shape_panel .categories_edit").css({
          left: $(this).offset().left + "px",
        });
      });
    $(".edit_team_shape")
      .off()
      .on("click", function (g) {
        g.stopPropagation();
        $(".categories_edit").hide();
        var j = $(this);
        $("#shape_panel .team_shape_edit").remove();
        $("#shape_team_thumb").hide();
        var b = j.parent();
        var i = b.attr("shapeid");
        var c = b.parent().attr("id").substring(11);
        var h = b.find(".panel_team_item_title").text();
        var f =
          "<ul class='team_shape_edit menu' data-categories='" +
          c +
          "' data-title='" +
          h +
          "' data-shapeId='" +
          i +
          "' ><li tit='edit'> &nbsp;&nbsp;编辑</li><li tit='copy'>&nbsp;&nbsp;复制</li><li tit='move'>&nbsp;&nbsp;移动</li><li tit='info'>&nbsp;&nbsp;修改标题</li><li tit='delete'>&nbsp;&nbsp;删除</li></ul>";
        b.append(f);
        var d = b.offset().top;
        if (window.innerHeight - d < 170) {
          d -= 100;
        }
        $("#shape_panel .team_shape_edit").css({ top: d + "px" });
        $("#shape_panel .team_shape_edit").css({
          left: $(this).offset().left + "px",
        });
      });
    $(".panel_team_box")
      .off("mouseenter")
      .on("mouseenter", function () {
        if ($(this).hasClass("readonly") || Designer.op.state == "dragging") {
          return;
        }
        var h = 160,
          g = 160;
        var b = $(this);
        var j = $(this).attr("shapeId");
        var d = TeamShape.shapeMaps[j];
        var c = $("#shape_team_thumb");
        c.children("div").html(d.title);
        var f = c.children("iframe");
        f.css({
          width: d.imgW,
          height: d.imgH,
          transform: "scale(" + 200 / d.imgH + ")",
        });
        f.attr("src", d.thumbnail);
        c.attr("current", j);
        c.show();
        var i =
          b.offset().top -
          $("#designer_header").outerHeight() +
          b.height() / 2 -
          c.outerHeight() / 2;
        if (i < 5) {
          i = 5;
        } else {
          if (i + c.outerHeight() > $("#designer_viewport").height() - 5) {
            i = $("#designer_viewport").height() - 5 - c.outerHeight();
          }
        }
        c.css("top", i);
        if (!a.shapeMaps[j].elements) {
          $.ajax({
            url: a.config.host + "/api/chart/component/get",
            type: "post",
            data: { orgId: orgId, componentId: j },
            success: function (l) {
              if (l.code == "200") {
                var k = l.data.chartComponent;
                a.shapeMaps[j].elements = JSON.parse(k.definition);
              }
            },
            error: function () {},
          });
        }
      })
      .off("mouseleave")
      .on("mouseleave", function () {
        $("#shape_team_thumb").hide();
      });
  },
  initMessage: function (a, b) {
    TeamShape.acComponentId = a;
    TeamShape.acCategoryId = b;
  },
  onmessage: function (c) {
    if (c.origin != "https://api.processon.com") {
      return;
    }
    var f = c.data;
    var b = f.thumbnailSvg;
    var d = JSON.parse(decodeURIComponent(window.atob(f.def)));
    $("#team_shape_dialog").css("top", "100vh");
    var a = [];
    for (item in d.elements) {
      a.push(d.elements[item]);
    }
    a = TeamShape.utils.resetShapes(a);
    TeamShape.updataShape(
      TeamShape.acComponentId,
      TeamShape.acCategoryId,
      JSON.stringify(a),
      b
    );
    $("#team_shape_iframe").remove();
  },
  updateShape: function (a, c) {
    if (c) {
      var b = a.elements;
      b = this.utils.resetShapes(b);
      a.box = Utils.getShapesBounding(b);
    }
    this.shapeMaps[a.id] = a;
    this.renderPanelItem(a);
  },
  renderPanelItem: function (g, i) {
    var f = this;
    var k = this.config.panelItemWidth,
      d = this.config.panelItemHeight;
    var j = $("#teamshape_" + g.id + "");
    var h = 60,
      b = 60,
      a = 1;
    var c = new Image();
    c.src = g.thumbnail;
    c.onload = function () {
      h = c.width;
      b = c.height;
      a = 60 / h;
      g.imgW = h;
      g.imgH = b;
      if (j.length == 0) {
        var m =
          "<div class='panel_team_box' id ='teamshape_" +
          g.id +
          "' shapeId ='" +
          g.id +
          "'><div style='width: 70px;height: 70px;position: absolute; z-index: 1;'></div> <span class='panel_team_item_bg'><iframe class='panel_team_item' scrolling='no' style='border:none; transform: scale(" +
          a +
          ");' src='" +
          g.thumbnail +
          "' width='" +
          h +
          "' height='" +
          b +
          "'></iframe> </span><p class='panel_team_item_title'>" +
          g.title +
          "</p> " +
          (isComponentAdmin == "true"
            ? "<span class='edit_team_shape' ><span class='ico diagraming-icons' style='font-size: 14px;color:#333;'> &#xe868;</span></span> "
            : "") +
          "</div>";
        var l = null;
        if (i) {
          l = $(m).appendTo("#panel_team_" + g.category);
        } else {
          l = $(m).prependTo("#panel_team_" + g.category);
        }
      } else {
        j.children("img").attr("src", g.thumbnail);
      }
      j.children("img").css({});
      f.initEvt();
      c = null;
    };
  },
  removeShape: function (d, b, c) {
    var a = this;
    $.confirm({
      content:
        "是否要删除图形 <span style='color:#4386F5'>「" +
        c +
        "」</span> ，请确认？<br/> 此操作无法恢复，请谨慎操作。",
      okval: "删除",
      tokenClass: "team-shape-remove-confirm",
      onConfirm: function () {
        $.ajax({
          url: a.config.host + "/api/chart/component/remove",
          type: "post",
          data: { componentId: d },
          success: function (f) {
            if (f.code == "200") {
              Util.globalTopTip(
                "组件删除成功",
                "top_success",
                2000,
                $("#designer_viewport"),
                true
              );
              a.getCategoryList(b);
              delete a.shapeMaps[d];
            } else {
              Util.globalTopTip(
                f.message,
                "top_error",
                2000,
                $("#designer_viewport"),
                true
              );
            }
          },
          error: function () {
            Util.globalTopTip(
              "组件删除失败",
              "top_error",
              2000,
              $("#designer_viewport"),
              true
            );
          },
        });
      },
    });
  },
  copyShape: function (a, c) {
    var b = this;
    $.ajax({
      url: b.config.host + "/api/chart/component/copy",
      type: "post",
      data: { componentId: a },
      success: function (d) {
        if (d.code == "200") {
          Util.globalTopTip(
            "复制图形成功",
            "top_success",
            2000,
            $("#designer_viewport"),
            true
          );
          b.getCategoryList(c);
        } else {
          Util.globalTopTip(
            d.message,
            "top_error",
            2000,
            $("#designer_viewport"),
            true
          );
        }
      },
      error: function () {
        Util.globalTopTip(
          "复制图形失败",
          "top_error",
          2000,
          $("#designer_viewport"),
          true
        );
      },
    });
  },
  moveShape: function (b, d) {
    var c = this;
    $("#search-team-category").val("");
    TeamShape.keyWord = "";
    c.renderCategoryList(b, d);
    var a = $("#teamcategory_dialog");
    a.dialog();
  },
  renderCategoryList: function (a, c) {
    var b = this;
    Util.ajax({
      url: b.config.host + "/api/chart/component/item/list",
      data: { orgId: orgId, keyword: TeamShape.keyWord },
      success: function (j) {
        var d = j.data.chartComponentItems,
          g = [];
        if (d.length == 0) {
          $("#team_category_list")
            .empty()
            .html(
              "<div class='nofiles'><img src='/assets/images/icon/empty_state_dustbin.svg'/><div>未找到对应小组</div></div>"
            );
        }
        for (var f = 0; f < d.length; f++) {
          var h = d[f];
          g.push(
            '<li data-category="' +
              h.componentItemId +
              '" class="team-component-row"><span class="member-col2 "><span class="icons category-ico">&#xe632;</span>' +
              h.title +
              "</span></li>"
          );
        }
        $("#team_category_list").empty().append(g.join(""));
        $(".team-component-row").off().on("click", TeamShape.selectCategory);
        $(".team-category-footer .okbtn")
          .off()
          .on("click", function () {
            if (TeamShape.moveCategorieId == "") {
              Util.globalTopTip(
                "请选择要移动的项目组",
                "top_error",
                2000,
                $("#teamcategory_dialog"),
                true
              );
              return;
            }
            if (TeamShape.moveCategorieId == c) {
              Util.globalTopTip(
                "图形已在分类中",
                "top_error",
                2000,
                $("#teamcategory_dialog"),
                true
              );
              return;
            }
            $.ajax({
              url: b.config.host + "/api/chart/component/move",
              type: "post",
              data: {
                componentId: a,
                toComponentItemId: TeamShape.moveCategorieId,
              },
              success: function (i) {
                if (i.code == "200") {
                  Util.globalTopTip(
                    "移动图形成功",
                    "top_success",
                    2000,
                    $("#teamcategory_dialog"),
                    true
                  );
                  b.getCategoryList(TeamShape.moveCategorieId);
                  b.getCategoryList(c);
                  TeamShape.moveCategorieId = "";
                  $("#teamcategory_dialog").dialog("close");
                } else {
                  Util.globalTopTip(
                    i.message,
                    "top_error",
                    2000,
                    $("#designer_viewport"),
                    true
                  );
                }
              },
              error: function () {
                Util.globalTopTip(
                  "移动图形失败",
                  "top_error",
                  2000,
                  $("#teamcategory_dialog"),
                  true
                );
              },
            });
            $("#teamCategory_dialog").dialog("close");
          });
      },
    });
  },
  selectCategory: function () {
    var a = $(this).attr("data-category");
    if (a && TeamShape.moveCategorieId == a) {
      $(this).removeClass("active");
      TeamShape.moveCategorieId = "";
    } else {
      TeamShape.moveCategorieId = a;
      $(this).addClass("active").siblings().removeClass("active");
    }
  },
  bindCategoryEvent: function (a, b) {
    $("#search-team-category")
      .off()
      .on("keyup", function (d) {
        var c = $(this);
        var f = c.val();
        if (d.keyCode == 13) {
          $("#team_member_list").empty();
          TeamShape.keyWord = f;
          TeamShape.renderCategoryList(a, b);
        }
      });
    $("#search-category-icons")
      .off()
      .on("click", function (d) {
        var c = $(this);
        var f = c.val();
        $("#team_member_list").empty();
        TeamShape.keyWord = f;
        TeamShape.renderCategoryList(a, b);
      });
  },
  renderCategory: function (a) {
    if ($("#" + a.id).length == 0) {
      $("#shape_panel").append(
        "<div class='panel_team_container panel_team_collapsed' id=" +
          a.id +
          " ><h3 class='panel_team_title'><div class='ico ico_accordion'></div> <span class='panel_team_title_content'>" +
          a.title +
          "  </span> " +
          (isComponentAdmin == "true"
            ? "<div class='edit_team_container' > <span class='ico diagraming-icons' style='font-size: 14px;color:#333;'> &#xe868;</span></div>"
            : "") +
          " </h3> <div class='content'><div class='team_content'>拖到此处<br>添加到此分类</div></div><div id='panel_team_" +
          a.id +
          "' class='content'></div></div>"
      );
    }
    this.initEvt();
  },
  renderAddCategory: function (a) {
    if ($("#" + a.id).length == 0) {
      $(".panel_team_add").after(
        "<div class='panel_team_container panel_team_collapsed' id=" +
          a.id +
          " ><h3 class='panel_team_title'><div class='ico ico_accordion'></div> <span class='panel_team_title_content'>" +
          a.title +
          "  </span> " +
          (isComponentAdmin == "true"
            ? "<div class='edit_team_container' > <span class='ico diagraming-icons' style='font-size: 14px;color:#333;'> &#xe868;</span></div>"
            : "") +
          " </h3> <div class='content'><div class='team_content '>拖到此处<br>添加到此分类</div></div><div id='panel_team_" +
          a.id +
          "' class='content'></div></div>"
      );
    }
    this.initEvt();
    $("#" + a.id)
      .find(".team_content")
      .show();
  },
  addCategory: function () {
    var a = this;
    var b = "未命名分类";
    $("#name-team-category").val(b);
    $("#addcategory_dialog").dialog();
    $("#name-team-category").focus();
    $("#name-team-category").select();
    $(".add-category-footer .okbtn")
      .off()
      .on("click", function () {
        b = $("#name-team-category").val();
        if (b == "") {
          Util.globalTopTip(
            "文件夹名不能为空",
            "top_error",
            2000,
            $("#addcategory_dialog"),
            true
          );
          return;
        }
        $.ajax({
          url: a.config.host + "/api/chart/component/item/save",
          type: "post",
          data: {
            orgId: orgId,
            title: b,
            ownerId: userId,
            ownerName: userName,
          },
          success: function (c) {
            if (c.code == "200") {
              var d = c.data.chartComponentItem;
              a.categories.unshift({ id: d.componentItemId, title: d.title });
              a.renderAddCategory({ id: d.componentItemId, title: d.title });
            }
          },
          error: function () {},
        });
        $("#addcategory_dialog").dialog("close");
      });
  },
  removeCategory: function (b, c) {
    var a = this;
    $.confirm({
      content:
        "是否要删除组件 <span style='color:#4386F5'>「" +
        c +
        "」</span> ，请确认？<br/> 此操作无法恢复，请谨慎操作。",
      okval: "删除",
      tokenClass: "team-shape-remove-confirm",
      onConfirm: function () {
        $.ajax({
          url: a.config.host + "/api/chart/component/item/remove",
          type: "post",
          data: { componentItemId: b },
          success: function (d) {
            if (d.code == "200") {
              Util.globalTopTip(
                "删除分类成功",
                "top_success",
                2000,
                $("#designer_viewport"),
                true
              );
              $("#" + b).remove();
            } else {
              Util.globalTopTip(
                d.message,
                "top_error",
                2000,
                $("#designer_viewport"),
                true
              );
            }
          },
          error: function () {
            Util.globalTopTip(
              "删除分类失败",
              "top_error",
              2000,
              $("#designer_viewport"),
              true
            );
          },
        });
      },
    });
  },
  updataCategory: function (b, c) {
    var a = this;
    $.ajax({
      url: a.config.host + "/api/chart/component/item/save",
      type: "post",
      data: { componentItemId: b, orgId: orgId, title: c },
      success: function (d) {
        if (d.code == "200") {
          Util.globalTopTip(
            "更换标题成功",
            "top_success",
            2000,
            $("#designer_viewport"),
            true
          );
          $("#" + b + " .panel_team_title_content").html(c);
          $(".edit_team_container").css("right", "0px");
        } else {
          Util.globalTopTip(
            d.message,
            "top_error",
            2000,
            $("#designer_viewport"),
            true
          );
        }
      },
      error: function () {
        Util.globalTopTip(
          "更换标题失败",
          "top_error",
          2000,
          $("#designer_viewport"),
          true
        );
      },
    });
  },
  getCategoryList: function (b) {
    var a = this;
    $("#panel_team_" + b).empty();
    $.ajax({
      url: a.config.host + "/api/chart/component/list",
      type: "post",
      data: { orgId: orgId, componentItemId: b },
      success: function (h) {
        if (h.code == "200") {
          var j = h.data.chartComponents;
          if (j.length > 0) {
            $("#" + b)
              .find(".team_content")
              .hide();
          } else {
            $("#" + b)
              .find(".team_content")
              .show();
          }
          for (var g = 0, d = j.length; g < d; g++) {
            var c = j[g];
            var f = {
              id: c.componentId,
              category: c.componentItemId,
              title: c.title,
              elements: JSON.parse(c.definition),
              thumbnail: c.thumbUrl,
            };
            a.shapeMaps[f.id] = f;
            a.renderPanelItem(f, true);
          }
        }
      },
      error: function () {},
    });
  },
  updataTitle: function (a, c) {
    var b = this;
    $.ajax({
      url: b.config.host + "/api/chart/component/save",
      type: "post",
      data: { componentId: a, orgId: orgId, title: c },
      success: function (d) {
        if (d.code == "200") {
          Util.globalTopTip(
            "更换标题成功",
            "top_success",
            2000,
            $("#designer_viewport"),
            true
          );
          $("#teamshape_" + a + " .panel_team_item_title").html(c);
          TeamShape.shapeMaps[a].title = c;
        } else {
          Util.globalTopTip(
            d.message,
            "top_error",
            2000,
            $("#designer_viewport"),
            true
          );
        }
      },
      error: function () {
        Util.globalTopTip(
          "更换标题失败",
          "top_error",
          2000,
          $("#designer_viewport"),
          true
        );
      },
    });
  },
  updataShape: function (b, f, d, a) {
    var c = this;
    $.ajax({
      url: c.config.host + "/api/chart/component/save",
      type: "post",
      data: { componentId: b, orgId: orgId, definition: d, thumbFileStr: a },
      success: function (g) {
        if (g.code == "200") {
          Util.globalTopTip(
            "编辑组件成功",
            "top_success",
            2000,
            $("#designer_viewport"),
            true
          );
          c.getCategoryList(f);
        }
      },
      error: function () {
        Util.globalTopTip(
          "编辑组件失败",
          "top_error",
          2000,
          $("#designer_viewport"),
          true
        );
      },
    });
  },
  ui: {
    init: function () {
      $("#shape_panel .panel_container")
        .eq(0)
        .after(
          "<div class='panel_container'><ul class='team_panel_tab'><li ac='shape' class='active'>图形库</li><li ac='team'>团队库</li></ul></div>" +
            (isComponentAdmin == "true"
              ? "<div class='panel_team_add'><h3 class='panel_title TEAM_add_shape_class'><span class='ico diagraming-icons' style='font-size: 17px;position: absolute; font-weight: 500; left: 8px;'> &#xe866;</span>新建分类 " +
                (orgRole == "1_owner" || orgRole == "2_admin"
                  ? "<div class='goto_team_container' > <span class='ico diagraming-icons' style='font-size: 16px;color:#333;'> &#xe867;</span></div>"
                  : "") +
                "</h3></div>"
              : "")
        );
      $(".team_panel_tab li")
        .off()
        .on("click", function () {
          var b = $(this).attr("ac");
          $(this).addClass("active").siblings().removeClass("active");
          if (b == "shape") {
            $("#shape_panel .panel_team_add").css("display", "none");
            $("#shape_panel .panel_container").each(function (c, d) {
              if (c > 0) {
                $(d).css("display", "block");
              }
            });
            $("#shape_panel .panel_team_container").each(function (c, d) {
              $(d).css("display", "none");
            });
          } else {
            $("#shape_panel .panel_team_add").css("display", "block");
            $("#shape_panel .panel_container").each(function (c, d) {
              if (c > 1) {
                $(d).css("display", "none");
              }
            });
            $("#shape_panel .panel_team_container").each(function (c, d) {
              $(d).css("display", "block");
            });
          }
          localStorage.setItem("team_shape_tab", b == "shape" ? false : true);
        });
      $(".TEAM_add_shape_class")
        .off()
        .on("click", function () {
          TeamShape.addCategory();
        });
      $("#shape_panel .panel_team_add").css("display", "none");
      $("#shape_panel .panel_container").each(function (b, c) {
        if (b > 0) {
          $(c).css("display", "block");
        }
      });
      $("#shape_panel .panel_team_container").each(function (b, c) {
        $(c).css("display", "none");
      });
      $("#designer_viewport").append(
        '<div id="shape_team_thumb" class="menu"><iframe style="border:0;" scrolling="no" width="200px" height="200px"></iframe><div></div></div>'
      );
      $(".goto_team_container")
        .off()
        .on("click", function (b) {
          b.stopPropagation();
          window.open(
            "/corp/manage/index?orgId=" + orgId + "#category-management"
          );
        });
      $("#shape_panel .panel_team_add").css("display", "none");
      $("#shape_panel .panel_container").each(function (b, c) {
        if (b > 0) {
          $(c).css("display", "block");
        }
      });
      $("#shape_panel .panel_team_container").each(function (b, c) {
        $(c).css("display", "none");
      });
      var a = localStorage.getItem("team_shape_tab");
      if (a == "true") {
        $(".team_panel_tab li[ac=team]").click();
      }
    },
  },
  utils: {
    resetShapes: function (b, l) {
      l = l || { x: 0, y: 0 };
      b.sort(function a(j, i) {
        return j.props.zindex - i.props.zindex;
      });
      var m = Utils.getShapesBounding(b);
      for (var f = 0, h = b.length; f < h; f++) {
        var k = b[f];
        if (k.name == "linker") {
          k.from = c(k.from);
          k.to = c(k.to);
          if (k.linkerType == "broken" || k.linkerType == "curve") {
            for (var d = 0; d < k.points.length; d++) {
              k.points[d] = c(k.points[d]);
            }
          }
          var g = Utils.getLinkerBox(k);
          k.props = $.extend(k.props, g);
        } else {
          k.props.x = k.props.x - m.x + l.x;
          k.props.y = k.props.y - m.y + l.y;
        }
        k.boxPos = m;
      }
      function c(i) {
        i.x = i.x - m.x + l.x;
        i.y = i.y - m.y + l.y;
        return i;
      }
      return b;
    },
    getCreatingImg: function (d) {
      var c = $("#creating_shape_img");
      var a = $("#creating_shape_container");
      var b = TeamShape.shapeMaps[d];
      if (c.length == 0) {
        a = $("<div id='creating_shape_container'></div>").appendTo(
          "#designer"
        );
        c = $(
          "<img id='creating_shape_img' src='" +
            b.thumbnail +
            "' width='" +
            TeamShape.config.panelItemWidth * 1.5 +
            "' height='" +
            TeamShape.config.panelItemHeight * 1.5 +
            "'/>"
        ).appendTo(a);
      } else {
        $("#creating_shape_img").attr("src", b.thumbnail);
      }
      a.css({
        left: "0px",
        top: "0px",
        width: $(".panel_container").width(),
        height: $("#shape_panel").outerHeight(),
      });
      return c;
    },
    setCreatingImg: function (b, c) {
      $("#creating_shape_container").show();
      var a = Utils.getRelativePos(
        c.pageX,
        c.pageY,
        $("#creating_shape_container")
      );
      b.css({
        left: a.x - (TeamShape.config.panelItemWidth * 1.5) / 2,
        top: a.y - (TeamShape.config.panelItemHeight * 1.5) / 2,
      });
    },
    createShapes: function (b, j, h) {
      var a = TeamShape.shapeMaps[b].elements,
        c = Utils.copyArray(a),
        f = [],
        m = {};
      for (var k = 0; k < c.length; k++) {
        var l = c[k];
        var d = Utils.newId();
        m[c[k].id] = d;
        if (l.group) {
          m[l.group] = Utils.newId();
        }
        c[k].id = d;
      }
      for (var k = 0; k < c.length; k++) {
        var l = c[k];
        var o = j.restoreScale() - l.props.w / 2;
        var n = h.restoreScale() - l.props.h / 2;
        var p = Model.createByShape(l, o, n);
        if (l.name == "linker") {
          if (l.from.id != null) {
            p.from.id = m[l.from.id];
          }
          if (l.to.id != null) {
            p.to.id = m[l.to.id];
          }
          if (l.textPos != null) {
            delete p.textPos;
          }
        } else {
          Schema.initShapeFunctions(p);
        }
        if (l.group) {
          p.group = m[l.group];
        }
        if (l.children) {
          for (var q = 0; q < l.children.length; q++) {
            var g = l.children[q];
            p.children[q] = m[g];
          }
        }
        if (l.parent) {
          p.parent = m[l.parent];
        }
        if (l.container) {
          p.container = m[l.container];
        }
        Designer.painter.renderShape(p);
        f.push(p);
      }
      return f;
    },
    resetPosByMouse: function (a, b, d) {
      var c = {};
      c.x = a.x.restoreScale() + b.x - d.boxPos.w / 2;
      c.y = a.y.restoreScale() + b.y - d.boxPos.h / 2;
      return c;
    },
  },
  flow2svg: {
    init: function (a) {
      var k = this;
      var q = k.calcCanvasSize(a);
      var l = Model.define.theme == null ? false : true;
      if ($("#team_thumbnail_box").length == 0) {
        $("body").append(
          "<div id='team_thumbnail_box' style='display:none;'></div>"
        );
      }
      var r = q.w > q.h ? q.w : q.h;
      var p = SVG("team_thumbnail_box").size(r, r);
      a = a.sort(function (j, i) {
        return j.props.zindex - i.props.zindex;
      });
      for (var g = 0, m = a.length; g < m; g++) {
        var n = Utils.copy(a[g]);
        if (n.name == "linker") {
          flow2svg.linker2svg(n, p, q, l);
        } else {
          if (n.parent == "" || n.parent == null) {
            flow2svg.shape2svg(n, p, q);
            if (n.children != null && n.children.length > 0) {
              var c = n.children;
              for (var f = 0; f < c.length; f++) {
                var d = c[f];
                var b = Utils.copy(elements[d]);
                flow2svg.shape2svg(b, p, q, l);
              }
            }
          }
        }
      }
      p.attr("viewBox", "0 0 " + q.w + " " + q.h);
      var o = $("#team_thumbnail_box")
        .html()
        .replace(/&nbsp;/g, "\u00a0");
      $("#team_thumbnail_box").remove();
      var h =
        "data:image/svg+xml;base64," +
        window.btoa(unescape(encodeURIComponent(o)));
      return h;
    },
    calcCanvasSize: function (t) {
      var B = null;
      var y = null;
      var z = null;
      var x = null;
      for (var v = 0, w = t.length; v < w; v++) {
        var f = t[v];
        var n = $("#" + f.id);
        var k = n.position();
        if (n.hasClass("linker_box")) {
          var r = n.attr("id");
          var q = f.from.x,
            o = f.from.y,
            d = f.to.x,
            c = f.to.y;
          if (Math.abs(q - d) < 1 && Math.abs(o - c) < 1) {
            return true;
          }
        }
        var A = k.left + n.width();
        var l = k.top + n.height();
        if (n.children(".linker_text").length > 0) {
          var s = n.children(".linker_text").position().left;
          var b = k.left + s + n.children(".linker_text").width();
          if (s < 0) {
            k.left = k.left + s;
          }
          if (b > A) {
            A = b;
          }
        }
        if (n.children(".text_canvas").length > 0) {
          var j = n.children(".text_canvas");
          var u = j.position(),
            C = j.height(),
            p = n.height();
          if (u.top < 0) {
            k.top = k.top + u.top;
          }
          if (u.top + C > p) {
            l = n.position().top + u.top + C;
          }
        }
        var h = 0;
        var a = 0;
        n.find(".attr_canvas").each(function () {
          var i = $(this);
          var D = i.position();
          var E = D.left + i.width() - n.width();
          if (D.left < 0) {
            if (h == 0 || D.left < h) {
              h = D.left;
            }
          } else {
            if (a == 0 || E > a) {
              a = E;
            }
          }
        });
        if (B == null || k.left + h < B) {
          B = k.left + h;
        }
        if (y == null || k.top < y) {
          y = k.top;
        }
        if (z == null || A + a > z) {
          z = A + a;
        }
        if (x == null || l > x) {
          x = l;
        }
      }
      if (B == null) {
        B = 0;
        y = 0;
        z = 0;
        x = 0;
      }
      B = B - 10;
      y = y - 10;
      var g = z - B;
      var m = x - y;
      return {
        w: g.restoreScale() - 20,
        h: m.restoreScale() - 20,
        minX: B.restoreScale() - 2,
        minY: y.restoreScale() - 2,
      };
    },
  },
};
