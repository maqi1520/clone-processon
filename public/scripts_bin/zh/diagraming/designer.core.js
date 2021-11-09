Schema.init(true);
Schema.initMarkers();
$(function () {
  Designer.init();
  if (typeof isView != "undefined") {
    return;
  }
  if (role == "trial") {
    Designer.status = "demo";
  } else {
    if (role == "viewer") {
      Designer.status = "readonly";
    }
  }
  if (Designer.status == "readonly") {
    if (localRuntime == false) {
      Designer.setReadonly(true);
    }
  } else {
    setTimeout(function () {
      UI.init();
      Dock.init();
      Navigator.init();
    }, 300);
  }
  if (tutorial) {
    createdTip = true;
    UI.gettingStart();
  }
  if (!showToolbar) {
    var a = $("#bar_collapse").children("div");
    a.attr("class", "ico expand");
    $(".titlebar").hide();
    $("#bar_return").show();
    $(".layout").height($(window).height() - 73);
    $(".lanebar").css({ top: 35 });
  }
  $("#load_mask").remove();
});
var Designer = {
  defaults: { linkerBeginArrowStyle: null, linkerEndArrowStyle: null },
  config: {
    panelItemWidth: 50,
    panelItemHeight: 50,
    pageMargin: 1000,
    anchorSize: 8,
    rotaterSize: 9,
    anchorColor: "#067bef",
    selectorColor: "#067bef",
    scale: 1,
  },
  status: "",
  initialize: {
    initialized: false,
    initLayout: function () {
      $(window).bind("resize.designer", function () {
        var a =
          $(window).height() -
          $("#designer_header").outerHeight() -
          $("#designer_footer").outerHeight();
        $(".layout").height(a);
        if ($("#demo_signup").length) {
          $("#designer_layout").height(a - $("#demo_signup").outerHeight());
        }
      });
      $(window).trigger("resize.designer");
    },
    initModel: function () {
      Model.define = { page: Utils.copy(Schema.pageDefaults), elements: {} };
      Model.persistence = {
        page: Utils.copy(Schema.pageDefaults),
        elements: {},
      };
    },
    initCanvas: function () {
      var n = Model.define.page.width.toScale();
      var g = Model.define.page.height.toScale();
      if (n > 20000) {
        n = 20000;
      }
      if (g > 20000) {
        g = 20000;
      }
      if (Model.define.page.orientation == "landscape") {
        var q = n;
        n = g;
        g = q;
      }
      var a = Model.define.page.backgroundColor;
      if (a == "transparent") {
        a = "255,255,255";
      }
      var l = Utils.getDarkerColor(a);
      var b = Utils.getDarkestColor(a);
      $("#designer_canvas").css({ "background-color": "rgb(" + l + ")" });
      var e = $("#designer_grids");
      if (e.length > 0) {
        e.attr({ width: n, height: g });
        var r = e[0].getContext("2d");
        r.clearRect(0, 0, n, g);
        var m = Model.define.page.padding.toScale();
        var c = n - m * 2;
        var p = g - m * 2;
        r.fillStyle = "rgb(" + a + ")";
        r.beginPath();
        r.rect(m, m, c, p);
        r.fill();
        var d = Math.round(Model.define.page.gridSize.toScale());
        if (d < 10) {
          d = 10;
        }
        if (Model.define.page.showGrid) {
          r.translate(m, m);
          r.lineWidth = 1;
          r.save();
          var k = 0.5;
          var j = 0;
          while (k <= p) {
            r.restore();
            if (j % 4 == 0) {
              r.strokeStyle = "rgb(" + b + ")";
            } else {
              r.strokeStyle = "rgb(" + l + ")";
            }
            r.beginPath();
            r.moveTo(0, k);
            r.lineTo(c, k);
            k += d;
            j++;
            r.stroke();
          }
          k = 0.5;
          j = 0;
          while (k <= c) {
            r.restore();
            if (j % 4 == 0) {
              r.strokeStyle = "rgb(" + b + ")";
            } else {
              r.strokeStyle = "rgb(" + l + ")";
            }
            r.beginPath();
            r.moveTo(k, 0);
            r.lineTo(k, p);
            k += d;
            j++;
            r.stroke();
          }
        }
        o();
      } else {
        if (
          Model.define.page.watermark === "" ||
          typeof Model.define.page.watermark === "undefined"
        ) {
          $("#designer_watermark_canvas").remove();
          return;
        }
        var f = $(window).width(),
          i = $(window).height();
        if ($("#designer_watermark_canvas").length <= 0) {
          $("#designer_canvas").append(
            '<canvas id="designer_watermark_canvas"  width="' +
              f +
              '" height="' +
              i +
              '"></canvas>'
          );
          $("#designer_watermark_canvas").css({
            position: "fixed",
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
          });
        }
        var r = $("#designer_watermark_canvas")[0].getContext("2d");
        r.beginPath();
        r.clearRect(0, 0, f, i);
        r.rect(0, 0, f, i);
        r.fill();
        o();
      }
      $("#canvas_container").css({
        width: n,
        height: g,
        padding: Designer.config.pageMargin,
      });
      if (!this.initialized) {
        $("#designer_layout").scrollTop(Designer.config.pageMargin - 10);
        $("#designer_layout").scrollLeft(Designer.config.pageMargin - 10);
      }
      function o() {
        var t = Model.define.page.watermark;
        if (t) {
          t = $("<span/>").html(t).text();
          if (!$("#watermarkCanvas").length) {
            var v =
              '<canvas id = "watermarkCanvas" width = "300px"  height = "300px" style="display:none;"></canvas>';
            $("body").append(v);
          }
          var s = $("#watermarkCanvas")[0];
          var u = s.getContext("2d");
          u.clearRect(0, 0, 300, 300);
          u.font = "18px Arial";
          u.rotate((-45 * Math.PI) / 180);
          u.fillStyle = "rgba(" + b + ",0.8)";
          u.fillText(t, -190, 210);
          u.rotate((45 * Math.PI) / 180);
          var h = r.createPattern(s, "repeat");
          if (!Model.define.page.showGrid) {
            r.translate(m, m);
          }
          r.rect(0, 0, c, p);
          r.fillStyle = h;
          r.fill();
        }
      }
    },
    canvasSizeAuto: function () {
      var e = Model.define.page;
      var b = e.width;
      var d = e.height;
      if (chartVersion == 0 && Object.keys(Model.define.elements).length == 0) {
        var c = $("#designer_layout").width() - 30;
        var a = $("#designer_layout").height() - 33;
        c = c < 500 ? 500 : c;
        a = a < 500 ? 500 : a;
        if (b != c || d != a) {
          Designer.setPageStyle({ width: c, height: a });
        }
      }
      $("#designer_layout").scrollTop(Designer.config.pageMargin - 10);
      $("#designer_layout").scrollLeft(Designer.config.pageMargin - 10);
    },
    initShapes: function () {
      $("#shape_panel").empty();
      $("#shape_panel").append(
        "<div class='panel_container panel_collapsed'><h3 class='panel_title search'><input id='shape_search' placeholder='搜索'  title='搜索ProcessOn图形和网络图标' title_pos='right'/> <span class='ico diagraming-icons search-icons'>&#xe78c;</span><span class='ico diagraming-icons close-icons'>&#xe637;</span></span></h3><div id='panel_search' class='content'></div></div>"
      );
      $("#shape_panel").append(
        "<div class='panel_container panel_myshape_container'><h3 class='panel_title'><div class='ico ico_accordion'></div>我的图形 <div id='edit_myshape' class='edit_myshape' original-title='编辑我的图形' > <span class='ico diagraming-icons' style='font-size: 14px;color:#333;'> &#xe78d;</span></div> </h3><div id='myshapes' class='content'><div class='my_content'>拖到此处<br>添加到我的图形</div></div><div id='panel_myshape' class='content'></div></div>"
      );
      Designer.events.push("isTeam", function (isTeam) {
        if (isTeam) {
          if (typeof TeamShape == "undefined") {
            var data = {
              js: ["/scripts_bin/zh/diagraming/designer.team.js"],
              css: ["/themes/default/diagraming/designer.team.css"],
            };
            bigPipe.render(data, function () {
              TeamShape.init();
            });
          } else {
            TeamShape.init();
          }
        }
      });
      var selectedCategories = Schema.categories.filter((c) =>
        Schema.selectedCategories.includes(c.name)
      );
      for (var i = 0; i < selectedCategories.length; i++) {
        var cate = selectedCategories[i];
        if (cate.name == "standard") {
          continue;
        }
        $("#shape_panel").append(
          "<div class='panel_container'><h3 class='panel_title'><div class='ico ico_accordion'></div>" +
            cate.text +
            "</h3><div id='panel_" +
            cate.name +
            "' class='content'></div></div>"
        );
      }
      $(".panel_title")
        .unbind()
        .bind("click", function () {
          if (!$(this).hasClass("search")) {
            $(this).parent().toggleClass("panel_collapsed");
          }
        });
      $(".panel_title .close-icons")
        .off()
        .on("click", function () {
          $("#shape_search").val("").parent().removeClass("search-close");
          $("#panel_search").empty();
        });
      var indexs = 0;
      for (var name in Schema.shapes) {
        var shape = Schema.shapes[name];
        if (Schema.selectedCategories.includes(shape.category) && shape.attribute.visible && shape.category != "standard") {
          if (!shape.groupName) {
            appendPanelItem(shape);
            indexs++;
          } else {
            var groupShapes = SchemaGroup.getGroup(shape.groupName);
            if (groupShapes[0] == name) {
              appendPanelItem(shape, shape.groupName);
            }
          }
        }
      }
      if (typeof isView == "undefined") {
        renderMyshape(1);
      }
      function renderMyshape(page) {
        if (location.href.indexOf("iframe") > -1) {
          return;
        }
        $(".myshape_panel_btn").remove();
        $.ajax({
          url: "/diagraming/chart_my_shapes",
          type: "get",
          data: { curPage: page },
          success: function (res) {
            if (page == 1) {
              Schema.myShapes = [];
              $("#panel_myshape").html("");
            }
            var myShapesLen = Schema.myShapes.length,
              len = (page - 1) * 20,
              cNun = myShapesLen - len;
            var myShapeData = res.definition || [];
            for (var i = 0; i < myShapeData.length; i++) {
              if (i < cNun) {
                continue;
              }
              var shape = myShapeData[i],
                els = shape.elements;
              for (var j = 0; j < els.length; j++) {
                var el = els[j];
                for (key in el) {
                  var v = el[key];
                  if (v.indexOf && v.indexOf("function") > -1) {
                    el[key] = eval("(function(){return " + v + " })()");
                  }
                }
              }
              Schema.myShapes.push(shape);
              appendPanelItem(shape);
            }
            if (Schema.myShapes.length == 0) {
              $("#myshapes .my_content").css("display", "block");
            }
            if (page < res.pageCount) {
              var btn = $(
                "<div class='toolbar_button active myshape_panel_btn' style='margin-bottom: 5px;' >加载更多</div>"
              ).appendTo("#panel_myshape");
              btn.bind("click", function () {
                page++;
                renderMyshape(page);
              });
            }
          },
          error: function () {},
        });
      }
      if (indexs > 300) {
        Utils.toast(
          "当前加载的图形过多，可能会造成页面卡顿，<br><br>请取消勾选不需要的图形",
          ".designer_button",
          9000
        );
      }
      function appendPanelItem(shape, group, addShape) {
        shape = Utils.copy(shape);
        shape.category = shape.category || "";
        var itemW = Designer.config.panelItemWidth,
          itemH = Designer.config.panelItemHeight;
        if (
          shape.category == "ui" ||
          shape.category == "ui_input" ||
          shape.category.indexOf("ios_") >= 0 ||
          shape.category.indexOf("andriod_") >= 0
        ) {
          itemW = 30;
          itemH = 30;
        }
        var html =
          "<div class='panel_box' shapeName='" +
          shape.name +
          "'><canvas class='panel_item' width='" +
          itemW +
          "' height='" +
          itemH +
          "'></canvas></div>";
        if (!addShape) {
          var panelBox = $(html).appendTo("#panel_" + shape.category);
        } else {
          var panelBox = $(html).prependTo("#panel_" + shape.category);
        }
        if (group) {
          panelBox.append(
            "<div class='group_icon' onmousedown='Designer.op.showPanelGroup(\"" +
              group +
              "\", event, this)'></div>"
          );
        }
        var canvas = panelBox.children()[0];
        panelBox
          .bind("mouseenter", function () {
            if (
              $(this).hasClass("readonly") ||
              Designer.op.state == "dragging"
            ) {
              return;
            }
            var thumb = $("#shape_thumb");
            thumb.children("div").html(shape.title),
              (canvas = thumb.children("canvas")[0]);
            var ctx = canvas.getContext("2d");
            thumb.attr("current", shape.name);
            var maxWidth = 160;
            var maxHeight = 160;
            ctx.clearRect(0, 0, maxWidth, maxHeight);
            thumb.show();
            if (shape.category == "myshape") {
              var boxPos = { x: 0, y: 0, w: shape.boxPos.w, h: shape.boxPos.h };
              var scale = 1;
              if (shape.boxPos.w >= shape.boxPos.h) {
                if (shape.boxPos.w > maxWidth) {
                  scale = maxWidth / shape.boxPos.w;
                  boxPos.w = maxWidth;
                  boxPos.h = parseInt(
                    (shape.boxPos.h / shape.boxPos.w) * boxPos.w
                  );
                }
              } else {
                if (shape.boxPos.h > maxHeight) {
                  scale = maxHeight / shape.boxPos.h;
                  boxPos.h = maxHeight;
                  boxPos.w = parseInt(
                    (shape.boxPos.w / shape.boxPos.h) * boxPos.h
                  );
                }
              }
              thumb
                .children("canvas")
                .attr({ width: maxWidth + 20, height: boxPos.h + 20 });
              ctx.clearRect(0, 0, maxWidth, maxHeight);
              var myshape = Utils.copy(shape);
              for (var i = 0; i < myshape.elements.length; i++) {
                var shapeItem = myshape.elements[i];
                if (shapeItem.name == "linker") {
                  var lineStyle = Utils.getLinkerLineStyle(shapeItem.lineStyle);
                  shapeItem.lineStyle.lineWidth =
                    (lineStyle.lineWidth * scale) / 2;
                } else {
                  var lStyle = Utils.getShapeLineStyle(shapeItem.lineStyle);
                  shapeItem.lineStyle.lineWidth = lStyle.lineWidth * scale;
                }
              }
              var config = {
                width: maxWidth,
                height: boxPos.h,
                padding: 10,
                isPanel: false,
              };
              Designer.painter.drawPanelItemByShape(canvas, myshape, config);
            } else {
              var props = {
                x: 0,
                y: 0,
                w: shape.props.w,
                h: shape.props.h,
                angle: shape.props.angle,
              };
              if (shape.props.w >= shape.props.h) {
                if (shape.props.w > maxWidth) {
                  props.w = maxWidth;
                  props.h = parseInt((shape.props.h / shape.props.w) * props.w);
                }
              } else {
                if (shape.props.h > maxHeight) {
                  props.h = maxHeight;
                  props.w = parseInt((shape.props.w / shape.props.h) * props.h);
                }
              }
              thumb
                .children("canvas")
                .attr({ width: maxWidth + 20, height: props.h + 20 });
              shape.props = props;
              ctx.save();
              ctx.lineJoin = "round";
              ctx.globalAlpha = shape.shapeStyle.alpha;
              var translateX = (maxWidth + 20 - props.w) / 2;
              var translateY = 10;
              ctx.translate(translateX, translateY);
              ctx.translate(props.w / 2, props.h / 2);
              ctx.rotate(props.angle);
              ctx.translate(-(props.w / 2), -(props.h / 2));
              Designer.painter.renderShapePath(ctx, shape, false, function () {
                if (
                  $("#shape_thumb[current=" + shape.name + "]:visible").length >
                  0
                ) {
                  panelBox.trigger("mouseenter");
                }
              });
              Designer.painter.renderMarkers(ctx, shape, false);
              ctx.restore();
              ctx.translate(translateX, translateY);
            }
            var top =
              panelBox.offset().top -
              $("#designer_header").outerHeight() +
              panelBox.height() / 2 -
              thumb.outerHeight() / 2;
            if (top < 5) {
              top = 5;
            } else {
              if (
                top + thumb.outerHeight() >
                $("#designer_viewport").height() - 5
              ) {
                top =
                  $("#designer_viewport").height() - 5 - thumb.outerHeight();
              }
            }
            thumb.css("top", top);
          })
          .bind("mouseleave", function () {
            $("#shape_thumb").hide();
          });
        if (shape.category == "myshape") {
          var ctx = canvas.getContext("2d");
          ctx.clearRect(0, 0, itemW, itemH);
          Designer.painter.drawPanelItemByShape(canvas, shape);
        } else {
          Designer.painter.drawPanelItem(canvas, shape.name);
        }
      }
      initPanelShapes();
      function initPanelShapes() {
        $(".panel_box")
          .die()
          .live("mousedown", function (downE) {
            var currentShape = $(this);
            if (currentShape.hasClass("readonly")) {
              return;
            }
            var name = currentShape.attr("shapeName");
            var anchorInLinkers = [];
            var newLinkerFocus;
            Designer.op.changeState("creating_from_panel");
            var createdShapes = null;
            var createdShapeIds = [];
            var createdBoxs = [];
            var designer_canvas = $("#designer_canvas");
            var creatingCanvas = getCreatingCanvas(name);
            $("#designer").bind("mousemove.creating", function (moveE) {
              setCreatingCanvas(creatingCanvas, moveE);
            });
            var shapeBoxs = [];
            for (var i = Model.orderList.length - 1; i >= 0; i--) {
              var shapeId = Model.orderList[i].id;
              var shape = Model.getShapeById(shapeId);
              if (shape.attribute && shape.attribute.collapseBy) {
                continue;
              }
              if (shape.name == "linker" || shape.parent) {
                continue;
              }
              var boxPos = Utils.getControlBox([shapeId]);
              boxPos.id = shapeId;
              shapeBoxs.push(boxPos);
            }
            $("#canvas_container").bind("mousemove.create", function (e) {
              var location = Utils.getRelativePos(
                e.pageX,
                e.pageY,
                designer_canvas
              );
              if (createdShapes == null) {
                createdShapes = createShape(name, location.x, location.y);
                for (var i = 0; i < createdShapes.length; i++) {
                  var createdShape = createdShapes[i];
                  createdShape.pos = Utils.copy(createdShape.props);
                  if (createdShape.name == "linker") {
                    createdShape.to_ = Utils.copy(createdShape.to);
                    createdShape.from_ = Utils.copy(createdShape.from);
                    createdShape.points_ = Utils.copyArray(createdShape.points);
                  }
                  createdShapeIds.push(createdShape.id);
                  $("#" + createdShape.id).attr("class", "shape_box_creating");
                  createdBoxs.push($("#" + createdShape.id));
                }
              }
              for (var j = 0; j < createdShapes.length; j++) {
                var createdBox = createdBoxs[j];
                var createdShape = createdShapes[j];
                if (createdShape.boxPos) {
                  createdShape.props.x =
                    location.x.restoreScale() -
                    createdShape.boxPos.w / 2 +
                    createdShape.pos.x;
                  createdShape.props.y =
                    location.y.restoreScale() -
                    createdShape.boxPos.h / 2 +
                    createdShape.pos.y;
                } else {
                  createdShape.props.x =
                    location.x.restoreScale() - createdShape.props.w / 2;
                  createdShape.props.y =
                    location.y.restoreScale() - createdShape.props.h / 2;
                }
                if (createdShape.name == "linker") {
                  createdShape.from = $.extend(
                    true,
                    createdShape.from,
                    resetPosByMouse(location, createdShape.from_, createdShape)
                  );
                  createdShape.to = $.extend(
                    true,
                    createdShape.to,
                    resetPosByMouse(location, createdShape.to_, createdShape)
                  );
                  if (
                    createdShape.linkerType == "broken" ||
                    createdShape.linkerType == "curve"
                  ) {
                    for (var i = 0; i < createdShape.points_.length; i++) {
                      createdShape.points[i] = resetPosByMouse(
                        location,
                        createdShape.points_[i],
                        createdShape
                      );
                    }
                  }
                }
                var p = createdShape.props;
                var snaped = Designer.op.snapLine(
                  p,
                  [createdShape.id],
                  true,
                  createdShape,
                  shapeBoxs
                );
                if (snaped.attach) {
                  createdShape.attachTo = snaped.attach.id;
                } else {
                  delete createdShape.attachTo;
                }
                if (!createdShape.container) {
                  if (snaped.container) {
                    createdShape.container = snaped.container.id;
                  } else {
                    delete createdShape.container;
                  }
                }
                createdBox.css({
                  left:
                    createdShape.props.x.toScale() -
                    (createdBox.width() - createdShape.props.w.toScale()) / 2 +
                    "px",
                  top:
                    createdShape.props.y.toScale() -
                    (createdBox.height() - createdShape.props.h.toScale()) / 2 +
                    "px",
                  "z-index": Model.orderList.length,
                });
              }
              anchorInLinkers = Utils.getShapeAnchorInLinker(createdShapes[0]);
              Designer.op.hideLinkPoint();
              for (var i = 0; i < anchorInLinkers.length; i++) {
                var anchorInLinker = anchorInLinkers[i];
                for (var ai = 0; ai < anchorInLinker.anchors.length; ai++) {
                  var an = anchorInLinker.anchors[ai];
                  Designer.op.showLinkPoint(Utils.toScale(an));
                }
              }
              if (createdShapes[0].name == "linker") {
                newLinkerFocus = Designer.op.moveLinkerFocus(createdShapes[0]);
              }
            });
            var created = false;
            $("#canvas_container").bind("mouseup.create", function (e) {
              created = true;
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
              if (createdShapes != null) {
                if (created == false) {
                  for (var i = 0; i < createdBoxs.length; i++) {
                    var createdBox = createdBoxs[i];
                    createdBox.remove();
                  }
                } else {
                  MessageSource.beginBatch();
                  if (newLinkerFocus) {
                    createdShapes[0] = Utils.copy(newLinkerFocus);
                  }
                  for (var j = 0; j < createdShapes.length; j++) {
                    var createdShape = createdShapes[j];
                    var createdBox = createdBoxs[j];
                    if (createdShape.onCreated && name.indexOf("myshape") < 0) {
                      var result = createdShape.onCreated();
                      if (createdShape.parent) {
                        delete createdShape.container;
                      }
                      if (result == false) {
                        createdBox.remove();
                        MessageSource.commit();
                        return;
                      }
                    }
                    for (key in createdShape) {
                      if (key.indexOf("_") > -1) {
                        delete createdShape[key];
                      }
                      if (key == "boxPos") {
                        delete createdShape[key];
                      }
                      if (key == "pos") {
                        delete createdShape[key];
                      }
                    }
                    if (createdShape.name == "linker") {
                      createdShape.props = {
                        zindex: createdShape.props.zindex,
                      };
                    }
                    createdBox.attr("class", "shape_box");
                    Designer.events.push("created", createdShape);
                  }
                  Model.addMulti(createdShapes);
                  Utils.unselect();
                  Utils.selectShape(createdShapeIds);
                  if (createdShapes.length == 1) {
                    Designer.op.editShapeText(createdShapes[0]);
                  }
                  var shapeCtx = Utils.getShapeContext(createdShapes[0].id);
                  var shapeBoxPos = createdBoxs[0].position();
                  var radius = 7;
                  for (var i = 0; i < anchorInLinkers.length; i++) {
                    var anchorInLinker = anchorInLinkers[i];
                    var linker = anchorInLinker.linker;
                    if (anchorInLinker.type == "line") {
                      var oriLinker = Utils.copy(linker);
                      var newLinker = Utils.copy(linker);
                      newLinker.id = Utils.newId();
                      if (anchorInLinker.anchors.length == 1) {
                        var anchor = anchorInLinker.anchors[0];
                        var angle = Utils.getPointAngle(
                          createdShapes[0].id,
                          anchor.x,
                          anchor.y,
                          radius
                        );
                        linker.to = {
                          id: createdShapes[0].id,
                          x: anchor.x,
                          y: anchor.y,
                          angle: angle,
                        };
                        newLinker.from = {
                          id: createdShapes[0].id,
                          x: anchor.x,
                          y: anchor.y,
                          angle: angle,
                        };
                      } else {
                        if (anchorInLinker.anchors.length == 2) {
                          var anchor1 = anchorInLinker.anchors[0];
                          var anchor2 = anchorInLinker.anchors[1];
                          var distance1 = Utils.measureDistance(
                            linker.from,
                            anchor1
                          );
                          var distance2 = Utils.measureDistance(
                            linker.from,
                            anchor2
                          );
                          var toAnchor, fromAnchor;
                          if (distance1 < distance2) {
                            toAnchor = anchor1;
                            fromAnchor = anchor2;
                          } else {
                            toAnchor = anchor2;
                            fromAnchor = anchor1;
                          }
                          var angle = Utils.getPointAngle(
                            createdShapes[0].id,
                            toAnchor.x,
                            toAnchor.y,
                            radius
                          );
                          linker.to = {
                            id: createdShapes[0].id,
                            x: toAnchor.x,
                            y: toAnchor.y,
                            angle: angle,
                          };
                          angle = Utils.getPointAngle(
                            createdShapes[0].id,
                            fromAnchor.x,
                            fromAnchor.y,
                            radius
                          );
                          newLinker.from = {
                            id: createdShapes[0].id,
                            x: fromAnchor.x,
                            y: fromAnchor.y,
                            angle: angle,
                          };
                        }
                      }
                      if (anchorInLinker.anchors.length <= 2) {
                        linker = Designer.op.beautifyLinkerFocus(linker, true);
                        newLinker = Designer.op.beautifyLinkerFocus(
                          newLinker,
                          true
                        );
                        Designer.painter.renderLinker(linker, true);
                        Model.update(linker);
                        Designer.painter.renderLinker(newLinker, true);
                        newLinker.props.zindex = Model.maxZIndex + 1;
                        Model.add(newLinker);
                        Designer.events.push("linkerCreated", newLinker);
                      }
                    } else {
                      var anchor = anchorInLinker.anchors[0];
                      var angle = Utils.getPointAngle(
                        createdShapes[0].id,
                        anchor.x,
                        anchor.y,
                        radius
                      );
                      if (anchorInLinker.type == "from") {
                        linker.from = {
                          id: createdShapes[0].id,
                          x: anchor.x,
                          y: anchor.y,
                          angle: angle,
                        };
                      } else {
                        linker.to = {
                          id: createdShapes[0].id,
                          x: anchor.x,
                          y: anchor.y,
                          angle: angle,
                        };
                      }
                      linker = Designer.op.beautifyLinkerFocus(linker, true);
                      Designer.painter.renderLinker(linker, true);
                      Model.update(linker);
                    }
                  }
                  MessageSource.commit();
                  var shapeW = createdShapes[0].props.w;
                  var shapeH = createdShapes[0].props.h;
                  var createdShapesBox = Utils.getControlBox(createdShapeIds);
                  Designer.op.changeCanvas(createdShapesBox);
                  Designer.events.push("resetBrokenLinker");
                }
              }
              currentShape.css({ left: "0px", top: "0px" });
              Designer.op.resetState();
            });
          });
      }
      function resetPosByMouse(location, pos1, createdShape) {
        var obj = {};
        obj.x = location.x.restoreScale() + pos1.x - createdShape.boxPos.w / 2;
        obj.y = location.y.restoreScale() + pos1.y - createdShape.boxPos.h / 2;
        return obj;
      }
      function getCreatingCanvas(name) {
        var canvas = $("#creating_shape_canvas");
        var container = $("#creating_shape_container");
        if (canvas.length == 0) {
          container = $("<div id='creating_shape_container'></div>").appendTo(
            "#designer"
          );
          canvas = $(
            "<canvas id='creating_shape_canvas' width='" +
              Designer.config.panelItemWidth +
              "' height='" +
              Designer.config.panelItemHeight +
              "'></canvas>"
          ).appendTo(container);
        }
        container.css({
          left: "0px",
          top: "0px",
          width: $(".panel_container").width(),
          height: $("#shape_panel").outerHeight(),
        });
        if (name.indexOf("myshape") > -1) {
          var myShape = getMyshapeByName(name);
          var itemW = Designer.config.panelItemWidth,
            itemH = Designer.config.panelItemHeight;
          var ctx = canvas[0].getContext("2d");
          ctx.clearRect(0, 0, itemW, itemH);
          Designer.painter.drawPanelItemByShape(canvas[0], myShape);
        } else {
          Designer.painter.drawPanelItem(canvas[0], name);
        }
        return canvas;
      }
      function setCreatingCanvas(canvas, e) {
        $("#creating_shape_container").show();
        var location = Utils.getRelativePos(
          e.pageX,
          e.pageY,
          $("#creating_shape_container")
        );
        canvas.css({
          left: location.x - Designer.config.panelItemWidth / 2,
          top: location.y - Designer.config.panelItemHeight / 2,
        });
      }
      function createShape(shapeName, centerX, centerY) {
        if (shapeName.indexOf("myshape") > -1) {
          var elements = getMyshapeByName(shapeName).elements,
            shapes = Utils.copyArray(elements),
            newShapes = [],
            oldIds = {};
          for (var i = 0; i < shapes.length; i++) {
            var shape = shapes[i];
            var newId = Utils.newId();
            oldIds[shapes[i].id] = newId;
            if (shape.group) {
              oldIds[shape.group] = Utils.newId();
            }
            shapes[i].id = newId;
          }
          for (var i = 0; i < shapes.length; i++) {
            var shape = shapes[i];
            var x = centerX.restoreScale() - shape.props.w / 2;
            var y = centerY.restoreScale() - shape.props.h / 2;
            var newShape = Model.createByShape(shape, x, y);
            if (shape.name == "linker") {
              if (shape.from.id != null) {
                newShape.from.id = oldIds[shape.from.id];
              }
              if (shape.to.id != null) {
                newShape.to.id = oldIds[shape.to.id];
              }
              if (shape.textPos != null) {
                delete newShape.textPos;
              }
            }
            if (shape.group) {
              newShape.group = oldIds[shape.group];
            }
            if (shape.children) {
              for (var ci = 0; ci < shape.children.length; ci++) {
                var childId = shape.children[ci];
                newShape.children[ci] = oldIds[childId];
              }
            }
            if (shape.parent) {
              newShape.parent = oldIds[shape.parent];
            }
            if (shape.container) {
              newShape.container = oldIds[shape.container];
            }
            Designer.painter.renderShape(newShape);
            newShapes.push(newShape);
          }
          return newShapes;
        } else {
          if (shapeName.indexOf("linker_shape_") > -1) {
            var shape = Schema.shapes[shapeName].element;
            shape.id = Utils.newId();
            var x = centerX.restoreScale() - shape.props.w / 2;
            var y = centerY.restoreScale() - shape.props.h / 2;
            var newShape = Model.createByShape(shape, x, y);
            Designer.painter.renderShape(newShape);
            return [newShape];
          } else {
            var shape = Schema.shapes[shapeName];
            var x = centerX.restoreScale() - shape.props.w / 2;
            var y = centerY.restoreScale() - shape.props.h / 2;
            var newShape = Model.create(shapeName, x, y);
            Designer.painter.renderShape(newShape);
            return [newShape];
          }
        }
      }
      function getMyshapeByName(name) {
        var myShape = null;
        for (var i = 0; i < Schema.myShapes.length; i++) {
          if (Schema.myShapes[i].name == name) {
            myShape = Schema.myShapes[i];
            break;
          }
        }
        return myShape;
      }
      $(".layout_bar")
        .off("mousedown.resize")
        .on("mousedown.resize", function (e) {
          var panel = $("#shape_panel"),
            panelWidth = panel.width(),
            x = e.pageX;
          var viewPort = $("#designer_viewport");
          var panelBasic = $("#panel_basic"),
            panelWidth_ = panelBasic.width();
          var lanebar = $(".lanebar");
          var gridbar = $(".gridbar");
          var bottom_temp_wrap = $(".bottom_temp_wrap");
          $(document).on("mousemove.panelresize", function (e1) {
            var x1 = e1.pageX,
              calcX = x1 - x;
            if (Math.abs(calcX) > 2) {
              var finalWidth = panelWidth + calcX;
              if (finalWidth < 60 || finalWidth > 650) {
                return;
              }
              panel.width(finalWidth);
              panelBasic.width(panelWidth_ + calcX);
              viewPort.css("margin-left", finalWidth + 1 + "px");
              lanebar.css("left", finalWidth + 11 + "px");
              gridbar.css("left", finalWidth + 11 + "px");
              bottom_temp_wrap.css("left", finalWidth + 5 + "px");
            }
          });
          $(document).on("mouseup.panelresize", function (e1) {
            $(document).off("mousemove.panelresize");
            $(document).off("mouseup.panelresize");
          });
        });
      $("#shape_search")
        .unbind("keydown")
        .bind("keydown", function (e) {
          if (e.keyCode == 13) {
            $("#panel_search").empty();
            var keywords = $(this).val().toLowerCase();
            if (keywords.trim() != "") {
              $("#shape_search").parent().addClass("search-close");
              $("#panel_search").parent().removeClass("panel_collapsed");
              for (var name in Schema.shapes) {
                if (name.indexOf("image_search_") >= 0) {
                  delete Schema.shapes[name];
                }
              }
              for (var name in SchemaGroup.groups) {
                if (name.indexOf("image_search_") >= 0) {
                  delete SchemaGroup.groups[name];
                }
              }
              var hasSystemShapes = false;
              for (var name in Schema.shapes) {
                var shape = Schema.shapes[name];
                if (
                  shape.title &&
                  shape.title.toLowerCase().indexOf(keywords) >= 0 &&
                  shape.attribute.visible &&
                  shape.category != "standard"
                ) {
                  hasSystemShapes = true;
                  var copy = Utils.copy(shape);
                  copy.category = "search";
                  appendPanelItem(copy);
                }
              }
              if (hasSystemShapes) {
                $("#panel_search").prepend(
                  "<div class='search_panel_title'>ProcessOn图形</div>"
                );
              }
              $("#panel_search").append(
                "<div class='search_panel_title'>网络图标</div>"
              );
              var searchOffset = 1;
              function searchIconfinder() {
                $("#panel_search").append(
                  "<div class='search_panel_loading'>正在搜索网络图标...</div>"
                );
                $(".search_panel_btn").remove();
                var imageShape = Schema.shapes.standardImage;
                $.getJSON(
                  "https://iconsapi.com/api/search?appkey=5eed8a83e4b0b8982239fcab&query=" +
                    keywords +
                    "&page=" +
                    searchOffset +
                    "&size=24",
                  function (data) {
                    data = data.pages;
                    if (data.elementsCount == 0) {
                      $(".search_panel_loading").text(
                        "没有搜索到网络图标，建议更换关键词再次尝试。"
                      );
                      return;
                    }
                    if (searchOffset == 1) {
                      $("#panel_search .panel_box").each(function (
                        index,
                        item
                      ) {
                        if (
                          $(item).attr("shapename").indexOf("image_search_") >
                          -1
                        ) {
                          $(item).remove();
                        }
                      });
                      $("#panel_search .search_panel_btn").remove();
                    }
                    $(".search_panel_loading").remove();
                    var icons = data.elements;
                    for (var i = 0; i < icons.length; i++) {
                      var icon = icons[i];
                      var group = "image_search_" + Utils.newId();
                      var title = icon.iconName;
                      var url = icon.url;
                      var sizew = 100,
                        sizeh = 100;
                      var newShape = Utils.copy(imageShape);
                      newShape.props = { w: sizew, h: sizeh };
                      newShape.fillStyle = {
                        type: "image",
                        fileId: url,
                        display: "stretch",
                        imageW: sizew,
                        imageH: sizeh,
                      };
                      newShape.attribute.visible = true;
                      newShape.name = "image_search_" + Utils.newId();
                      newShape.category = "search";
                      newShape.title = title + "<br/>" + sizew + "x" + sizeh;
                      newShape.groupName = group;
                      Schema.shapes[newShape.name] = newShape;
                      SchemaGroup.addGroupShape(group, newShape.name);
                      appendPanelItem(newShape);
                    }
                    searchOffset++;
                    if (searchOffset < data.elementsCount) {
                      var btn = $(
                        "<div class='toolbar_button active search_panel_btn'>加载更多</div>"
                      ).appendTo("#panel_search");
                      btn.bind("click", function () {
                        searchIconfinder();
                      });
                    }
                  }
                );
              }
              searchIconfinder();
            } else {
              $("#panel_search").parent().addClass("panel_collapsed");
            }
          }
        });
      $(".panel_myshape_container").on("mouseup.myshapes", function () {
        if (Designer.op.state != "dragging") {
          return;
        }
        var selectedIds = Utils.getSelectedIds();
        if (selectedIds.length > 50) {
          Util.globalTopTip(
            "最多可以包含50个图形组合",
            "top_error",
            2000,
            $("#designer"),
            true
          );
          return;
        }
        var boxPos = Utils.getControlBox(selectedIds);
        if (selectedIds.length > 0) {
          var shapes = [];
          for (var i = 0, len = selectedIds.length; i < len; i++) {
            var selectedId = selectedIds[i],
              shape = Utils.copy(Model.getShapeById(selectedId));
            shapes.push(shape);
            if (shape.children) {
              for (var j = 0; j < shape.children.length; j++) {
                if (selectedIds.indexOf(shape.children[j]) < 0) {
                  var childrenShape = Utils.copy(
                    Model.getShapeById(shape.children[j])
                  );
                  shapes.push(childrenShape);
                }
              }
            }
          }
          var containedShapes = Utils.copyArray(
            Utils.getContainedShapes(shapes)
          );
          var containedShapeIds = [];
          shapes = shapes.concat(containedShapes);
          for (var i = 0; i < containedShapes.length; i++) {
            containedShapeIds.push(containedShapes[i].id);
          }
          var def = Model.define.elements;
          for (key in def) {
            if (def[key].name == "linker") {
              var cLinker = Utils.copy(def[key]);
              if (
                containedShapeIds.indexOf(cLinker.to.id) > -1 &&
                containedShapeIds.indexOf(cLinker.from.id) > -1
              ) {
                shapes.push(cLinker);
              }
            }
          }
          shapes.sort(function compare(a, b) {
            return a.props.zindex - b.props.zindex;
          });
          for (var i = 0; i < shapes.length; i++) {
            var shapeItem = shapes[i];
            if (shapeItem.name == "linker") {
              shapeItem.from = resetPos(shapeItem.from);
              shapeItem.to = resetPos(shapeItem.to);
              if (
                shapeItem.linkerType == "broken" ||
                shapeItem.linkerType == "curve"
              ) {
                for (var j = 0; j < shapeItem.points.length; j++) {
                  shapeItem.points[j] = resetPos(shapeItem.points[j]);
                }
              }
              var to = shapeItem.to,
                from = shapeItem.from,
                points = shapeItem.points;
              var minX = to.x;
              var minY = to.y;
              var maxX = from.x;
              var maxY = from.y;
              if (to.x < from.x) {
                minX = to.x;
                maxX = from.x;
              } else {
                minX = from.x;
                maxX = to.x;
              }
              if (to.y < from.y) {
                minY = to.y;
                maxY = from.y;
              } else {
                minY = from.y;
                maxY = to.y;
              }
              for (var j = 0; j < points.length; j++) {
                var point = points[j];
                if (point.x < minX) {
                  minX = point.x;
                } else {
                  if (point.x > maxX) {
                    maxX = point.x;
                  }
                }
                if (point.y < minY) {
                  minY = point.y;
                } else {
                  if (point.y > maxY) {
                    maxY = point.y;
                  }
                }
              }
              var box = { x: minX, y: minY, w: maxX - minX, h: maxY - minY };
              shapeItem.props = $.extend(shapeItem.props, box);
            } else {
              shapeItem.props.x = shapeItem.props.x - boxPos.x;
              shapeItem.props.y = shapeItem.props.y - boxPos.y;
            }
            shapeItem.boxPos = boxPos;
          }
          if (Schema.myShapes.length > 0) {
            $("#myshapes .my_content").css("display", "none");
          }
          if (Schema.myShapes.length == 9) {
            Designer.events.push("isMember", function (isMember) {
              if (isMember) {
                addMyshape(shapes, boxPos);
              } else {
                poCollect("触发会员升级提示", { 功能: "流程图-我的图形" });
                Util.globalTopTip(
                  "升级到个人版或者团队版后，才可以继续添加图形， <a style='color:#fff;letter-spacing:1px;' href='/upgrade?pos=6_2' target='_blank' onclick='poCollect(\"访问升级页面\",{\"触发位置\":\"流程图-添加我的图形\"})'> 升级</a>",
                  "top_error",
                  4000,
                  $("#designer"),
                  true
                );
              }
            });
          } else {
            if (Schema.myShapes.length < 60) {
              addMyshape(shapes, boxPos);
            } else {
              Util.globalTopTip(
                "最多可以添加60个图形",
                "top_error",
                2000,
                $("#designer"),
                true
              );
            }
          }
          function resetPos(pos) {
            pos.x = pos.x - boxPos.x;
            pos.y = pos.y - boxPos.y;
            return pos;
          }
        }
      });
      function addMyshape(shapes, boxPos) {
        var newShapeId = Utils.newId();
        var newShape = {
          id: newShapeId,
          name: "myshape_" + newShapeId,
          category: "myshape",
          title: "custom shape",
          boxPos: boxPos,
          elements: shapes,
        };
        var newShape_ = Utils.copy(newShape);
        newShape_ = JSON.stringify(newShape_, function (key, val) {
          if (typeof val === "function") {
            return val + "";
          }
          return val;
        });
        $.ajax({
          url: "/diagraming/chart_my_shapes/add ",
          type: "post",
          data: { content: newShape_, ignore: "content" },
          success: function (res) {
            if (res.result == "success") {
              appendPanelItem(newShape, null, true);
              Schema.myShapes.unshift(newShape);
              if (Schema.myShapes.length > 0) {
                $("#myshapes .my_content").css("display", "none");
              }
            } else {
              Util.globalTopTip(
                "图形添加失败",
                "top_error",
                2000,
                $("#designer"),
                true
              );
            }
          },
          error: function () {},
        });
      }
      $(document)
        .off("mousemove.myshape")
        .on("mousemove.myshape", function (e) {
          var $target = $(e.target).parents(".panel_myshape_container");
          if (Designer.op.state == "dragging" && $target.length > 0) {
            var $addMyshapeBox = $("#add_myshape_box");
            if ($addMyshapeBox.length == 0) {
              $target.css("cursor", "url(/assets/images/add.png) 4 4, pointer");
              var addMyshapeBoxW = $("#panel_myshape").width(),
                addMyshapeBoxH = $("#panel_myshape").height(),
                addMyshapeBoxTop = $(".team_panel_tab").height() || 0;
              if (Schema.myShapes.length > 0) {
                addMyshapeBoxH = addMyshapeBoxH - 80;
                $target.prepend(
                  '<div id="add_myshape_box" style="width:' +
                    (addMyshapeBoxW + 2) +
                    "px;height:" +
                    (addMyshapeBoxH + 80) +
                    "px; top:" +
                    (addMyshapeBoxTop + 74) +
                    'px;"></div>'
                );
              }
            }
          } else {
            $target.css("cursor", "auto");
            $("#add_myshape_box").remove();
          }
        });
      $("#edit_myshape").on("click", function (e) {
        e.stopPropagation();
        if (UI.editMyshape) {
          UI.editMyshape.init();
          $("#myshape_dialog").dlg({
            onClose: function () {
              renderMyshape(1);
            },
          });
        }
      });
      $("#import_myshape")
        .off("click")
        .on("click", function (e) {
          e.stopPropagation();
          $("#import_myshape_input").trigger("click");
          $("#import_myshape_input")
            .off("change")
            .on("change", function (e) {
              var t = this.files[0].type,
                size = this.files[0].size / 1204;
              if ($.trim($(this).val()) == "") {
                return;
              }
              if (t.indexOf("image") < 0) {
                Util.globalTopTip(
                  "此文件不是图片，请重新选择",
                  "top_error",
                  2000,
                  $("#myshape_dialog"),
                  true
                );
                return;
              }
              if (size > 300) {
                Util.globalTopTip(
                  "文件大小超出要求，最大300K",
                  "top_error",
                  2000,
                  $("#myshape_dialog"),
                  true
                );
                return;
              }
              $("#frm_import_myshape").submitForm({
                success: function (result) {
                  $("#import_myshape_input").val("");
                  if (result.result == "type_wrong") {
                    Util.globalTopTip(
                      "此文件不是图片，请重新选择",
                      "top_error",
                      2000,
                      $("#myshape_dialog"),
                      true
                    );
                  } else {
                    if (result.result == "size_wrong") {
                      Util.globalTopTip(
                        "文件大小超出要求，最大2M",
                        "top_error",
                        2000,
                        $("#myshape_dialog"),
                        true
                      );
                    } else {
                      if (result.result == "exception") {
                        Util.globalTopTip(
                          "无法使用此图片，请选择其他图片",
                          "top_error",
                          2000,
                          $("#myshape_dialog"),
                          true
                        );
                      } else {
                        if (result.result == "svg_error") {
                          Util.globalTopTip(
                            "上传失败，svg文件中包含无法支持的foreignObject属性",
                            "top_error",
                            2000,
                            $("#myshape_dialog"),
                            true
                          );
                        } else {
                          var img = result.image;
                          var shape = Utils.copy(Schema.shapes.standardImage);
                          shape.fillStyle = {
                            display: "stretch",
                            fileId: img.fileId,
                            imageH: img.imageW || 100,
                            imageW: img.imageH || 100,
                            type: "image",
                          };
                          shape.props.w = img.imageW || 100;
                          shape.props.h = img.imageH || 100;
                          var pos = {
                            x: 0,
                            y: 0,
                            w: shape.props.w,
                            h: shape.props.h,
                          };
                          $("#myshape_dialog").dlg("close");
                          if (Schema.myShapes.length == 9) {
                            Designer.events.push(
                              "isMember",
                              function (isMember) {
                                if (isMember) {
                                  addMyshape([shape], pos);
                                } else {
                                  Util.globalTopTip(
                                    "升级到个人版或者团队版后，才可以继续添加图形， <a style='color:#fff;letter-spacing:1px;' href='/upgrade?pos=6_2' target='_blank'> 升级</a>",
                                    "top_error",
                                    4000,
                                    $("#designer"),
                                    true
                                  );
                                }
                              }
                            );
                          } else {
                            if (Schema.myShapes.length <= 60) {
                              addMyshape([shape], pos);
                            } else {
                              Util.globalTopTip(
                                "最多可以添加60个图形",
                                "top_error",
                                2000,
                                $("#designer"),
                                true
                              );
                            }
                          }
                        }
                      }
                    }
                  }
                },
              });
            });
        });
    },
  },
  hotkey: {
    init: function () {
      var a = null;
      $(window)
        .unbind("keydown.hotkey")
        .bind("keydown.hotkey", function (j) {
          if ((j.ctrlKey || j.metaKey) && j.keyCode == 83) {
            j.preventDefault();
          } else {
            if ((j.ctrlKey || j.metaKey) && j.keyCode == 65) {
              Designer.selectAll();
              j.preventDefault();
            } else {
              if (j.keyCode == 46 || j.keyCode == 8) {
                Designer.op.removeShape();
                $(".shape_dashboard.menu").hide();
                j.preventDefault();
              } else {
                if ((j.ctrlKey || j.metaKey) && j.keyCode == 90) {
                  MessageSource.undo();
                  j.preventDefault();
                } else {
                  if ((j.ctrlKey || j.metaKey) && j.keyCode == 89) {
                    MessageSource.redo();
                    j.preventDefault();
                  } else {
                    if (
                      (j.ctrlKey || j.metaKey) &&
                      !j.shiftKey &&
                      j.keyCode == 67
                    ) {
                      Designer.clipboard.copy();
                      var n = document.createElement("input");
                      document.body.appendChild(n);
                      n.value = " ";
                      n.style.width = "0px";
                      n.style.height = "0px";
                      n.style.position = "fixed";
                      n.style.left = "-1000px";
                      n.style.top = "-1000px";
                      n.setAttribute("class", "temp_input");
                      n.select();
                      document.execCommand("copy");
                      setTimeout(function () {
                        $(".temp_input").remove();
                      }, 500);
                      j.preventDefault();
                    } else {
                      if ((j.ctrlKey || j.metaKey) && j.keyCode == 88) {
                        Designer.clipboard.cut();
                        var n = document.createElement("input");
                        document.body.appendChild(n);
                        n.value = " ";
                        n.style.width = "0px";
                        n.style.height = "0px";
                        n.style.position = "fixed";
                        n.style.left = "-1000px";
                        n.style.top = "-1000px";
                        n.setAttribute("class", "temp_input");
                        n.setAttribute("z-index", "-99999");
                        n.select();
                        document.execCommand("copy");
                        setTimeout(function () {
                          $(".temp_input").remove();
                        }, 500);
                        j.preventDefault();
                      } else {
                        if ((j.ctrlKey || j.metaKey) && j.keyCode == 86) {
                        } else {
                          if ((j.ctrlKey || j.metaKey) && j.keyCode == 68) {
                            Designer.clipboard.duplicate();
                            j.preventDefault();
                          } else {
                            if (
                              (j.ctrlKey || j.metaKey) &&
                              j.shiftKey &&
                              j.keyCode == 66
                            ) {
                              Designer.clipboard.brush();
                              j.preventDefault();
                            } else {
                              if (j.altKey && j.keyCode == 76) {
                                Designer.alignShapes("left");
                                j.preventDefault();
                              } else {
                                if (j.altKey && j.keyCode == 82) {
                                  Designer.alignShapes("right");
                                  j.preventDefault();
                                } else {
                                  if (j.altKey && j.keyCode == 67) {
                                    Designer.alignShapes("center");
                                    j.preventDefault();
                                  } else {
                                    if (
                                      (j.altKey || j.metaKey || j.ctrlKey) &&
                                      (j.keyCode == 187 || j.keyCode == 107)
                                    ) {
                                      Designer.zoomIn();
                                      j.preventDefault();
                                    } else {
                                      if (
                                        (j.altKey || j.metaKey || j.ctrlKey) &&
                                        (j.keyCode == 189 || j.keyCode == 109)
                                      ) {
                                        Designer.zoomOut();
                                        j.preventDefault();
                                      } else {
                                        if (
                                          j.keyCode >= 37 &&
                                          j.keyCode <= 40
                                        ) {
                                          if (
                                            a == null ||
                                            Utils.getSelected().length > 0
                                          ) {
                                            var d = Utils.getSelected();
                                            var m = Utils.getFamilyShapes(d);
                                            d = d.concat(m);
                                            var g = Utils.getContainedShapes(d);
                                            d = d.concat(g);
                                            var f = Utils.getAttachedShapes(d);
                                            d = d.concat(f);
                                            var k = Utils.getCollapsedShapes(d);
                                            d = d.concat(k);
                                            var p = Utils.getOutlinkers(d);
                                            a = d.concat(p);
                                          }
                                          if (a.length > 0) {
                                            j.preventDefault();
                                            var b = 10;
                                            if (j.ctrlKey || j.shiftKey) {
                                              b = 1;
                                            }
                                            Utils.hideLinkerCursor();
                                            UI.hideShapeOptions();
                                            if (j.keyCode == 37) {
                                              Designer.op.moveShape(a, {
                                                x: -b,
                                                y: 0,
                                              });
                                            } else {
                                              if (j.keyCode == 38) {
                                                Designer.op.moveShape(a, {
                                                  x: 0,
                                                  y: -b,
                                                });
                                                j.preventDefault();
                                              } else {
                                                if (j.keyCode == 39) {
                                                  Designer.op.moveShape(a, {
                                                    x: b,
                                                    y: 0,
                                                  });
                                                } else {
                                                  if (j.keyCode == 40) {
                                                    Designer.op.moveShape(a, {
                                                      x: 0,
                                                      y: b,
                                                    });
                                                    j.preventDefault();
                                                  }
                                                }
                                              }
                                            }
                                            $(document)
                                              .unbind("keyup.moveshape")
                                              .bind(
                                                "keyup.moveshape",
                                                function () {
                                                  Model.updateMulti(a);
                                                  Designer.events.push(
                                                    "changeLinkers",
                                                    a
                                                  );
                                                  a = null;
                                                  $(document).unbind(
                                                    "keyup.moveshape"
                                                  );
                                                  Designer.op.hideTip();
                                                  Utils.showLinkerCursor();
                                                  UI.showShapeOptions();
                                                }
                                              );
                                          }
                                        } else {
                                          if (
                                            (j.ctrlKey || j.metaKey) &&
                                            j.keyCode == 221
                                          ) {
                                            var l = "front";
                                            if (j.shiftKey) {
                                              l = "forward";
                                            }
                                            Designer.layerShapes(l);
                                          } else {
                                            if (
                                              (j.ctrlKey || j.metaKey) &&
                                              j.keyCode == 219
                                            ) {
                                              var l = "back";
                                              if (j.shiftKey) {
                                                l = "backward";
                                              }
                                              Designer.layerShapes(l);
                                            } else {
                                              if (
                                                (j.ctrlKey || j.metaKey) &&
                                                j.keyCode == 71
                                              ) {
                                                j.preventDefault();
                                                if (j.shiftKey) {
                                                  Designer.ungroup();
                                                } else {
                                                  Designer.group();
                                                }
                                              } else {
                                                if (
                                                  (j.ctrlKey || j.metaKey) &&
                                                  j.keyCode == 76
                                                ) {
                                                  j.preventDefault();
                                                  if (j.shiftKey) {
                                                    Designer.unlockShapes();
                                                  } else {
                                                    Designer.lockShapes();
                                                  }
                                                } else {
                                                  if (
                                                    j.keyCode == 18 &&
                                                    j.ctrlKey
                                                  ) {
                                                  } else {
                                                    if (j.keyCode == 18) {
                                                    } else {
                                                      if (j.keyCode == 27) {
                                                        if (
                                                          !Designer.op.state
                                                        ) {
                                                          Utils.unselect();
                                                          $(
                                                            ".options_menu"
                                                          ).hide();
                                                          $(
                                                            ".color_picker"
                                                          ).hide();
                                                        } else {
                                                          if (
                                                            Designer.op.state ==
                                                              "creating_free_text" ||
                                                            Designer.op.state ==
                                                              "creating_free_linker"
                                                          ) {
                                                            Designer.op.resetState();
                                                          }
                                                        }
                                                      } else {
                                                        if (
                                                          j.keyCode == 84 &&
                                                          !(
                                                            j.ctrlKey ||
                                                            j.metaKey
                                                          )
                                                        ) {
                                                          $(
                                                            ".options_menu"
                                                          ).hide();
                                                          $(
                                                            ".color_picker"
                                                          ).hide();
                                                          Designer.op.changeState(
                                                            "creating_free_text"
                                                          );
                                                        } else {
                                                          if (
                                                            j.keyCode == 73 &&
                                                            !(
                                                              j.ctrlKey ||
                                                              j.metaKey
                                                            )
                                                          ) {
                                                            $(
                                                              ".options_menu"
                                                            ).hide();
                                                            $(
                                                              ".color_picker"
                                                            ).hide();
                                                            UI.showImageSelect(
                                                              function (
                                                                q,
                                                                e,
                                                                r
                                                              ) {
                                                                UI.insertImage(
                                                                  q,
                                                                  e,
                                                                  r
                                                                );
                                                              }
                                                            );
                                                            $(
                                                              "#designer_contextmenu"
                                                            ).hide();
                                                          } else {
                                                            if (
                                                              j.keyCode == 76 &&
                                                              !(
                                                                j.ctrlKey ||
                                                                j.metaKey
                                                              )
                                                            ) {
                                                              $(
                                                                ".options_menu"
                                                              ).hide();
                                                              $(
                                                                ".color_picker"
                                                              ).hide();
                                                              Designer.op.changeState(
                                                                "creating_free_linker"
                                                              );
                                                            } else {
                                                              if (
                                                                j.keyCode ==
                                                                  66 &&
                                                                (j.ctrlKey ||
                                                                  j.metaKey)
                                                              ) {
                                                                var i =
                                                                  Utils.getSelectedIds();
                                                                if (
                                                                  i.length > 0
                                                                ) {
                                                                  var h =
                                                                    Model.getShapeById(
                                                                      i[0]
                                                                    );
                                                                  var c =
                                                                    Utils.getShapeFontStyle(
                                                                      h.fontStyle
                                                                    );
                                                                  Designer.setFontStyle(
                                                                    {
                                                                      bold: !c.bold,
                                                                    }
                                                                  );
                                                                  UI.update();
                                                                }
                                                                j.preventDefault();
                                                              } else {
                                                                if (
                                                                  j.keyCode ==
                                                                    73 &&
                                                                  (j.ctrlKey ||
                                                                    j.metaKey)
                                                                ) {
                                                                  var i =
                                                                    Utils.getSelectedIds();
                                                                  if (
                                                                    i.length > 0
                                                                  ) {
                                                                    var h =
                                                                      Model.getShapeById(
                                                                        i[0]
                                                                      );
                                                                    var c =
                                                                      Utils.getShapeFontStyle(
                                                                        h.fontStyle
                                                                      );
                                                                    Designer.setFontStyle(
                                                                      {
                                                                        italic:
                                                                          !h
                                                                            .fontStyle
                                                                            .italic,
                                                                      }
                                                                    );
                                                                    UI.update();
                                                                  }
                                                                  j.preventDefault();
                                                                } else {
                                                                  if (
                                                                    j.keyCode ==
                                                                      85 &&
                                                                    (j.ctrlKey ||
                                                                      j.metaKey)
                                                                  ) {
                                                                    var i =
                                                                      Utils.getSelectedIds();
                                                                    if (
                                                                      i.length >
                                                                      0
                                                                    ) {
                                                                      var h =
                                                                        Model.getShapeById(
                                                                          i[0]
                                                                        );
                                                                      var c =
                                                                        Utils.getShapeFontStyle(
                                                                          h.fontStyle
                                                                        );
                                                                      Designer.setFontStyle(
                                                                        {
                                                                          underline:
                                                                            !c.underline,
                                                                        }
                                                                      );
                                                                      UI.update();
                                                                    }
                                                                    j.preventDefault();
                                                                  } else {
                                                                    if (
                                                                      j.keyCode ==
                                                                        32 &&
                                                                      !(
                                                                        j.ctrlKey ||
                                                                        j.metaKey
                                                                      )
                                                                    ) {
                                                                      var i =
                                                                        Utils.getSelectedIds();
                                                                      if (
                                                                        i.length ==
                                                                        1
                                                                      ) {
                                                                        var h =
                                                                          Model.getShapeById(
                                                                            i[0]
                                                                          );
                                                                        var o =
                                                                          Utils.gridSelectObj;
                                                                        if (
                                                                          o.id ==
                                                                          h.id
                                                                        ) {
                                                                          Designer.op.editShapeText(
                                                                            h,
                                                                            false,
                                                                            o
                                                                              .indexs[0]
                                                                          );
                                                                        } else {
                                                                          Designer.op.editShapeText(
                                                                            h
                                                                          );
                                                                        }
                                                                      } else {
                                                                        Designer.op.changeState(
                                                                          "drag_canvas"
                                                                        );
                                                                      }
                                                                      j.preventDefault();
                                                                    } else {
                                                                      if (
                                                                        j.keyCode ==
                                                                        121
                                                                      ) {
                                                                        j.preventDefault();
                                                                        Dock.enterPresentation();
                                                                      } else {
                                                                        if (
                                                                          j.keyCode ==
                                                                          91
                                                                        ) {
                                                                          Designer.op.isMetaKey = true;
                                                                          j.preventDefault();
                                                                          return false;
                                                                        } else {
                                                                          if (
                                                                            j.keyCode ==
                                                                            68
                                                                          ) {
                                                                          }
                                                                        }
                                                                      }
                                                                    }
                                                                  }
                                                                }
                                                              }
                                                            }
                                                          }
                                                        }
                                                      }
                                                    }
                                                  }
                                                }
                                              }
                                            }
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        });
      $("input,textarea,select,div[contenteditable]")
        .die()
        .live("keydown.hotkey", function (b) {
          b.stopPropagation();
        });
      $(window)
        .unbind("keyup.hotkey")
        .bind("keyup.hotkey", function (b) {
          if (b.keyCode == 91) {
            b.preventDefault();
            Designer.op.isMetaKey = false;
            return false;
          }
        });
      $(document)
        .off("paste")
        .on("paste", function (g) {
          if (
            $(g.target).hasClass("input_text") ||
            g.target.tagName.toLowerCase() == "textarea" ||
            g.target.id == "shape_search" ||
            $(g.target).parent().hasClass("color_hex")
          ) {
            return;
          }
          if (Utils.isChrome() || Utils.isFirefox() || Utils.isSafari()) {
            var j = g.clipboardData || g.originalEvent.clipboardData,
              h,
              c,
              f;
            if (j) {
              h = j.items;
              f = j.types || [];
              for (var e = 0; e < f.length; e++) {
                if (f[e] === "Files") {
                  c = h[e];
                  break;
                }
              }
              if (
                c &&
                c.kind === "file" &&
                c.type.match(/^image\//i) &&
                h.length != 4
              ) {
                var d = c.getAsFile(),
                  b = new FileReader();
                if (d == null) {
                  return;
                }
                UI.showUploading();
                b.readAsDataURL(d);
                b.onload = function (k) {
                  var i = b.result;
                  Designer.op.uploadImage(i, function (m) {
                    if (m.result) {
                      poCollect("触发会员升级提示", {
                        功能: "流程图-粘贴截图",
                      });
                      Util.globalTopTip(
                        "升级到个人版或者团队版后，才可以直接粘贴截图， <a style='color:#fff;letter-spacing:1px;' href='/upgrade?pos=6_2' target='_blank'>去升级</a>",
                        "top_error",
                        4000,
                        $("#designer"),
                        true
                      );
                      UI.hideUploading();
                    } else {
                      var l = new Image();
                      l.src = m.img_url;
                      l.onload = function () {
                        UI.insertImage(m.img_url, l.width, l.height);
                        UI.hideUploading();
                      };
                    }
                  });
                };
                g.stopPropagation();
                return false;
              } else {
                Designer.clipboard.paste();
              }
            }
          } else {
            var j = g.clipboardData || g.originalEvent.clipboardData;
            if (j) {
              h = j.items;
              f = j.types || [];
              for (var e = 0; e < f.length; e++) {
                if (f[e] === "Files") {
                  c = h[e];
                  break;
                }
              }
              if (
                c &&
                c.kind === "file" &&
                c.type.match(/^image\//i) &&
                h.length != 4
              ) {
                Util.globalTopTip(
                  "该浏览器暂时还不支持粘贴截图",
                  "top_error",
                  4000,
                  $("#designer"),
                  true
                );
              }
            }
            Designer.clipboard.paste();
          }
        });
      $("#designer").on("mousewheel DOMMouseScroll", function (c) {
        var b = c.originalEvent.wheelDelta || -c.originalEvent.detail;
        var d = Math.max(-1, Math.min(1, b));
        if (c.ctrlKey || c.metaKey) {
          c.preventDefault();
          if (d < 0) {
            Designer.zoomOut();
          } else {
            Designer.zoomIn();
          }
        }
      });
    },
    cancel: function () {
      $(window).unbind("keydown.hotkey");
    },
  },
  contextMenu: {
    init: function () {
      $("#designer_contextmenu")
        .unbind("mousedown")
        .bind("mousedown", function (a) {
          a.stopPropagation();
        });
      $("#designer_contextmenu")
        .find("li:not(.devider)")
        .unbind("click")
        .bind("click", function () {
          var a = $(this);
          if (
            !a.menuitem("isDisabled") &&
            a.children(".extend_menu").length == 0
          ) {
            Designer.contextMenu.execAction(a);
            Designer.contextMenu.hide();
          }
        });
      $("#canvas_container")
        .unbind("contextmenu")
        .bind("contextmenu", function (b) {
          b.preventDefault();
          if (!b.ctrlKey) {
            var a = $("#designer_canvas");
            var c = Utils.getRelativePos(b.pageX, b.pageY, a);
            Designer.contextMenu.show(c.x, c.y);
          }
        });
    },
    destroy: function () {
      $("#canvas_container").unbind("contextmenu");
      this.hide();
    },
    menuPos: { x: 0, y: 0, shape: null },
    show: function (i, h) {
      this.menuPos.x = i;
      this.menuPos.y = h;
      var c = $("#designer_contextmenu");
      var a = Utils.getShapeByPosition(i, h, false);
      c.children().hide();
      c.children("li[ac=selectall]").show();
      c.children(".devi_selectall").show();
      c.children("li[ac=drawline]").show();
      var b = Designer.clipboard.elements.length;
      if (b == 0) {
        if (localStorage.clipboard) {
          var d = JSON.parse(localStorage.clipboard);
          b = d.length;
        }
      }
      if (a == null) {
        if (b > 0) {
          c.children("li[ac=paste]").show();
          c.children(".devi_clip").show();
        }
      } else {
        var f = a.shape;
        this.menuPos.shape = f;
        if (f.locked) {
          if (b > 0) {
            c.children("li[ac=paste]").show();
            c.children(".devi_clip").show();
          }
          c.children("li[ac=unlock]").show();
          c.children(".devi_shape").show();
        } else {
          c.children("li[ac=cut]").show();
          c.children("li[ac=copy]").show();
          c.children("li[ac=duplicate]").show();
          c.children("li[ac=replace]").show();
          if (b > 0) {
            c.children("li[ac=paste]").show();
          }
          c.children(".devi_clip").show();
          c.children("li[ac=front]").show();
          c.children("li[ac=back]").show();
          c.children("li[ac=lock]").show();
          var g = Utils.getSelectedIds();
          var e = g.length;
          if (e >= 2) {
            c.children("li[ac=group]").show();
            $("#ctxmenu_align").show();
          }
          if (e == 1) {
            c.children("li[ac=defaultStyle]").show();
            if (f.name != "linker") {
              c.children("li[ac=equation]").show();
            }
          } else {
            c.children("li[ac=defaultStyle]").hide();
          }
          var j = Utils.getSelectedGroups().length;
          if (j >= 1) {
            c.children("li[ac=ungroup]").show();
          }
          c.children(".devi_shape").show();
          if (e == 1 && f.name != "linker" && f.link) {
            c.children("li[ac=changelink]").show();
          }
          if (f.name == "linker" || (f.textBlock && f.textBlock.length > 0)) {
            c.children("li[ac=edit]").show();
          }
          c.children("li[ac=delete]").show();
          c.children(".devi_del").show();
        }
      }
      c.css({
        display: "block",
        "z-index": Model.orderList.length + 3 + 99999,
        left: i,
        top: h,
      });
      $(document).bind("mousedown.ctxmenu", function () {
        Designer.contextMenu.hide();
      });
    },
    hide: function () {
      $("#designer_contextmenu").hide();
      $(document).unbind("mousedown.ctxmenu");
    },
    execAction: function (c) {
      var d = c.attr("ac");
      if (d == "cut") {
        Designer.clipboard.cut();
      } else {
        if (d == "copy") {
          Designer.clipboard.copy();
        } else {
          if (d == "paste") {
            Designer.clipboard.paste(this.menuPos.x, this.menuPos.y);
          } else {
            if (d == "duplicate") {
              Designer.clipboard.duplicate();
            } else {
              if (d == "front") {
                Designer.layerShapes("front");
              } else {
                if (d == "back") {
                  Designer.layerShapes("back");
                } else {
                  if (d == "lock") {
                    Designer.lockShapes();
                  } else {
                    if (d == "unlock") {
                      Designer.unlockShapes();
                    } else {
                      if (d == "group") {
                        Designer.group();
                      } else {
                        if (d == "ungroup") {
                          Designer.ungroup();
                        } else {
                          if (d == "align_shape") {
                            var e = c.attr("al");
                            Designer.alignShapes(e);
                          } else {
                            if (d == "edit") {
                              Designer.op.editShapeText(
                                this.menuPos.shape,
                                this.menuPos
                              );
                            } else {
                              if (d == "delete") {
                                Designer.op.removeShape();
                              } else {
                                if (d == "selectall") {
                                  Designer.selectAll();
                                } else {
                                  if (d == "drawline") {
                                    Designer.op.changeState(
                                      "creating_free_linker"
                                    );
                                  } else {
                                    if (d == "changelink") {
                                      UI.showInsertLink();
                                    } else {
                                      if (d == "replace") {
                                        var b = Utils.getSelectedIds();
                                        Designer.op.linkDashboard(b[0]);
                                      } else {
                                        if (d == "defaultStyle") {
                                          Designer.events.push(
                                            "setDefaultStyle",
                                            c
                                          );
                                        } else {
                                          if (d == "equation") {
                                            var a = this.menuPos.shape;
                                            Designer.op.equation.insertLastEquation(
                                              a
                                            );
                                          }
                                        }
                                      }
                                    }
                                  }
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
  },
  init: function () {
    this.initialize.initLayout();
    this.initialize.initModel();
    if (localRuntime == false) {
      this.initialize.initCanvas();
    }
    this.initialize.initShapes();
    this.hotkey.init();
    this.contextMenu.init();
    Designer.op.init();
    this.initialize.initialized = true;
    Designer.events.push("initialized");
    $("#designer_layout").on("scroll", function () {
      $(document).trigger("mouseup.multiselect");
    });
    if (typeof isView != "undefined") {
    }
  },
  op: {
    init: function () {
      var b = $("#designer_canvas");
      var a = $("#canvas_container");
      a.unbind("mousemove.operate").bind("mousemove.operate", function (g) {
        if (Designer.op.state != null) {
          return;
        }
        Designer.op.destroy();
        var f = Utils.getRelativePos(g.pageX, g.pageY, b);
        var c = Utils.getShapeByPosition(f.x, f.y);
        if (c != null) {
          if (c.type == "dataAttribute") {
            Designer.op.linkClickable(c.attribute.value, f);
          } else {
            if (c.type == "linker") {
              a.css("cursor", "pointer");
              Designer.op.shapeSelectable(c.shape);
              var e = c.shape;
              var d = c.pointIndex;
              if (e.linkerType == "broken" && d > 1 && d <= e.points.length) {
                Designer.op.brokenLinkerChangable(e, d - 1);
              } else {
                if (e.from.id == null && e.to.id == null) {
                  a.css("cursor", "move");
                  Designer.op.shapeDraggable();
                } else {
                  if (e.group) {
                    a.css("cursor", "move");
                    Designer.op.shapeDraggable();
                  }
                }
              }
              Designer.op.linkerEditable(e);
            } else {
              if (c.type == "linker_point") {
                a.css("cursor", "move");
                Designer.op.shapeSelectable(c.shape);
                if (c.shape.group) {
                  Designer.op.shapeDraggable();
                } else {
                  Designer.op.linkerDraggable(c.shape, c.point);
                }
                Designer.op.linkerEditable(c.shape);
              } else {
                if (c.type == "linker_text") {
                  a.css("cursor", "text");
                  Designer.op.shapeSelectable(c.shape);
                  Designer.op.linkerEditable(c.shape);
                } else {
                  if (c.type == "shape") {
                    if (c.shape.locked) {
                      a.css("cursor", "default");
                      Designer.op.shapeSelectable(c.shape);
                    } else {
                      a.css("cursor", "move");
                      Designer.op.shapeSelectable(c.shape);
                      Designer.op.shapeEditable(c.shape);
                      Designer.op.shapeDraggable();
                      if (c.shape.link) {
                        Designer.op.linkClickable(c.shape.link, f);
                      }
                      if (c.shape.category == "grid") {
                        Designer.events.push("gridSelect", c.shape);
                      }
                      Designer.events.push("renderShapeDom", c);
                    }
                    Designer.events.push("renderShapeDom", c);
                  } else {
                    a.css("cursor", "crosshair");
                    Designer.op.shapeSelectable(c.shape);
                    Designer.op.shapeLinkable(c.shape, c.linkPoint);
                  }
                  if (c.shape.parent) {
                    Utils.showAnchors(Model.getShapeById(c.shape.parent));
                  } else {
                    Utils.showAnchors(c.shape);
                  }
                }
              }
            }
          }
        } else {
          a.css("cursor", "default");
          Designer.op.shapeMultiSelectable();
        }
      });
    },
    cancel: function () {
      $("#canvas_container")
        .unbind("mousemove.operate")
        .css("cursor", "default");
      this.destroy();
    },
    destroy: function () {
      $("#designer_canvas")
        .unbind("mousedown.drag")
        .unbind("dblclick.edit")
        .unbind("mousedown.draglinker")
        .unbind("mousedown.select")
        .unbind("mousedown.brokenLinker")
        .unbind("dblclick.edit_linker");
      $("#canvas_container")
        .unbind("mousedown.link")
        .unbind("mousedown.create_text")
        .unbind("mousedown.drag_canvas");
      $("#designer_layout").unbind("mousedown.multiselect");
      Utils.hideAnchors();
      $("#link_spot").hide();
    },
    state: null,
    changeState: function (a) {
      this.state = a;
      if (a == "creating_free_text") {
        this.destroy();
        $("#canvas_container").css("cursor", "crosshair");
        this.textCreatable();
      } else {
        if (a == "creating_free_linker") {
          this.destroy();
          $("#canvas_container").css("cursor", "crosshair");
          this.shapeLinkable();
        } else {
          if (a == "drag_canvas") {
            this.destroy();
            this.canvasDraggable();
          } else {
            if (a == "changing_curve") {
              this.destroy();
            }
          }
        }
      }
    },
    resetState: function () {
      this.state = null;
      $("#canvas_container").css("cursor", "default");
    },
    shapeSelectable: function (a) {
      var b = $("#designer_canvas");
      b.bind("mousedown.select", function (d) {
        Designer.op.changeState("seelcting_shapes");
        var e = a.id;
        var c = [];
        if (d.ctrlKey || d.metaKey) {
          var c = Utils.getSelectedIds();
          if (Utils.isSelected(e)) {
            Utils.removeFromArray(c, e);
          } else {
            c.push(e);
          }
          Utils.unselect();
          if (c.length > 0) {
            Utils.selectShape(c);
          }
        } else {
          if (Utils.selectIds.indexOf(e) < 0) {
            Utils.unselect();
            Utils.selectShape(e);
          }
        }
        $(document).bind("mouseup.select", function () {
          Designer.op.resetState();
          b.unbind("mousedown.select");
          $(document).unbind("mouseup.select");
        });
      });
    },
    isMetaKey: false,
    shapeDraggable: function () {
      var c = $("#designer_canvas");
      var b = $("#canvas_container");
      var a = false;
      c.bind("mousedown.drag", function (f) {
        Utils.hideLinkerCursor();
        Utils.hideLinkerControls();
        Designer.op.changeState("dragging");
        var x = Utils.getSelected();
        var B = Utils.getRelativePos(f.pageX, f.pageY, c);
        var w = true;
        if (
          (x.length == 1 && x[0].name == "linker") ||
          (x.length == 1 && x[0].name != "linker" && x[0].props.angle)
        ) {
          w = false;
        }
        var m = null;
        if (w) {
          m = Utils.toScale(Utils.getShapesBounding(x));
        }
        var u = Utils.getFamilyShapes(x);
        x = x.concat(u);
        var q = Utils.getContainedShapes(x);
        x = x.concat(q);
        var G = Utils.getAttachedShapes(x);
        x = x.concat(G);
        var j = Utils.getCollapsedShapes(x);
        x = x.concat(j);
        var d = [];
        var k = [];
        if (w) {
          for (var A = 0; A < x.length; A++) {
            var h = x[A];
            if (h.name == "linker") {
              if (h.from.id && d.indexOf(h.from.id) < 0) {
                d.push(h.from.id);
              }
              if (h.to.id && d.indexOf(h.to.id) < 0) {
                d.push(h.to.id);
              }
            }
            if (d.indexOf(h.id) < 0) {
              d.push(h.id);
            }
          }
          for (var A = Model.orderList.length - 1; A >= 0; A--) {
            var F = Model.orderList[A].id;
            var h = Model.getShapeById(F);
            if (h.attribute && h.attribute.collapseBy) {
              continue;
            }
            if (h.name == "linker" || d.indexOf(F) >= 0 || h.parent) {
              continue;
            }
            var D = Utils.toScale(Utils.getControlBox([F]));
            D.id = F;
            k.push(D);
          }
        }
        var E = x;
        if (x.length == 0) {
          c.unbind("mousedown.drag");
          return;
        }
        var e = Utils.getOutlinkers(x);
        x = x.concat(e);
        var z = [];
        for (var C = 0; C < x.length; C++) {
          var h = x[C];
          z.push(h.id);
        }
        var g = Model.define.page.width.toScale();
        var o = Model.define.page.height.toScale();
        var l = E[0].props.w;
        var t = E[0].props.h;
        Designer.op.initScrollPos();
        var v = f.pageX,
          s = f.pageY,
          r = 0,
          p = 0;
        var n = Utils.copyArray(x);
        var y;
        b.bind("mousemove.drag", function (K) {
          UI.hideShapeOptions();
          (r = K.pageX - v), (p = K.pageY - s);
          var J = Utils.getRelativePos(K.pageX, K.pageY, c);
          var M = { x: J.x - B.x, y: J.y - B.y };
          if (
            (Designer.op.isMetaKey || K.ctrlKey) &&
            (Math.abs(M.x) > 1 || Math.abs(M.y) > 1)
          ) {
            if (a == false) {
              Designer.clipboard.copy();
              Designer.clipboard.paste();
              x = Utils.getSelected();
              a = true;
            }
          }
          var i = null;
          if (w) {
            var N = Utils.copy(m);
            N.x += M.x;
            N.y += M.y;
            var L = Designer.op.snapLine(N, d, null, null, k);
            M = { x: N.x - m.x, y: N.y - m.y };
            J = { x: B.x + M.x, y: B.y + M.y };
            m.x += M.x;
            m.y += M.y;
            if (E.length == 1 && E[0].groupName == "boundaryEvent") {
              if (L.attach) {
                E[0].attachTo = L.attach.id;
              } else {
                delete x[0].attachTo;
              }
            }
            if (L.container) {
              i = L.container;
            }
          }
          if (M.x == 0 && M.y == 0) {
            return;
          }
          for (var I = 0; I < x.length; I++) {
            var H = x[I];
            if (H.name == "linker") {
              if (x.length == 1) {
                y = Designer.op.moveLinkerFocus(H);
              }
              continue;
            } else {
              if ((H.container && z.indexOf(H.container) >= 0) || H.parent) {
                continue;
              }
            }
            if (i) {
              H.container = i.id;
            } else {
              delete H.container;
            }
          }
          Designer.op.moveShape(x, M);
          B = J;
          Designer.op.isScroll(K.pageX, K.pageY);
          Designer.events.push("changeLinkers", x);
        });
        $(document)
          .unbind("mouseup.drop")
          .bind("mouseup.drop", function (L) {
            $(document).unbind("mouseup.drop");
            if (r == 0 && p == 0) {
              return;
            }
            var H = $(L.target);
            if (
              H.parents(".panel_myshape_container").length > 0 ||
              H.attr("id") == "add_myshape_icon" ||
              H.parents(".panel_team_container").length > 0
            ) {
              for (var K = 0; K < n.length; K++) {
                var J = n[K];
                Model.define.elements[J.id] = J;
                Designer.painter.renderShape(J);
              }
              setTimeout(function () {
                Utils.selectShape(z);
              }, 0);
              return;
            }
            if (y) {
              Designer.painter.renderLinker(y);
              Model.updateMulti([y]);
            } else {
              Model.updateMulti(x);
            }
            var I = Utils.getControlBox(z);
            Designer.op.changeCanvas(I);
          });
        $(document).bind("mouseup.drag", function () {
          Designer.op.isMetaKey = false;
          a = false;
          UI.showShapeOptions();
          Designer.op.resetState();
          b.unbind("mousemove.drag");
          c.unbind("mousedown.drag");
          $(document).unbind("mouseup.drag");
          Designer.op.hideTip();
          Designer.op.hideSnapLine();
          Utils.showLinkerCursor();
          Utils.showLinkerControls();
          Designer.op.stopScroll();
          Designer.op.hideLinkPoint();
        });
      });
    },
    changeSpacing: function (n, c) {
      var j = Utils.getSelectedIds();
      var r = Utils.getSelected();
      Utils.hideLinkerCursor();
      var l = $("#canvas_container");
      var f = $("#designer_canvas");
      var q = Utils.getControlBox(j);
      var y = n.attr("resizeDir");
      var x = {};
      if (y.indexOf("l") >= 0) {
        x.x = q.x + q.w;
      } else {
        if (y.indexOf("r") >= 0) {
          x.x = q.x;
        } else {
          x.x = q.x + q.w / 2;
        }
      }
      if (y.indexOf("t") >= 0) {
        x.y = q.y + q.h;
      } else {
        if (y.indexOf("b") >= 0) {
          x.y = q.y;
        } else {
          x.y = q.y + q.h / 2;
        }
      }
      function v(i, C) {
        if (i.id == null) {
          if (C) {
            return { type: "box", x: (i.x - q.x) / q.w, y: (i.y - q.y) / q.h };
          } else {
            return { type: "fixed" };
          }
        } else {
          if (Utils.isSelected(i.id)) {
            var A = Model.getShapeById(i.id);
            var B = {
              x: A.props.x + A.props.w / 2,
              y: A.props.y + A.props.h / 2,
            };
            var p = Utils.getRotated(B, i, -A.props.angle);
            return {
              type: "shape",
              x: (p.x - A.props.x) / A.props.w,
              y: (p.y - A.props.y) / A.props.h,
            };
          } else {
            return { type: "fixed" };
          }
        }
      }
      var h = [];
      var a = {};
      var e = [];
      var z = Utils.getAttachedShapes(r);
      r = r.concat(z);
      var s = [];
      var b = { w: 20, h: 20 };
      for (var u = 0; u < r.length; u++) {
        var d = r[u];
        s.push(d.id);
        if (d.parent) {
          s.push(d.parent);
        }
        if (d.name == "linker") {
          if (e.indexOf(d.id) == -1) {
            e.push(d.id);
          }
        } else {
          h.push(d);
          if (d.props.w > b.w) {
            b.w = d.props.w;
          }
          if (d.props.h > b.h) {
            b.h = d.props.h;
          }
          if (d.attachTo && !Utils.isSelected(d.id)) {
            a[d.id] = {
              type: "attached",
              x: (d.props.x + d.props.w / 2 - q.x) / q.w,
              y: (d.props.y + d.props.h / 2 - q.y) / q.h,
            };
          } else {
            a[d.id] = {
              x: (d.props.x - q.x) / q.w,
              y: (d.props.y - q.y) / q.h,
            };
          }
          var t = Model.getShapeLinkers(d.id);
          if (t && t.length > 0) {
            for (var k = 0; k < t.length; k++) {
              var o = t[k];
              if (e.indexOf(o) == -1) {
                e.push(o);
              }
            }
          }
        }
      }
      for (var u = 0; u < e.length; u++) {
        var o = e[u];
        var m = Model.getShapeById(o);
        h.push(m);
        var r = Utils.isSelected(o);
        a[m.id] = { from: v(m.from, r), to: v(m.to, r) };
      }
      var g = n.css("cursor");
      l.css("cursor", g);
      var w = [];
      Designer.events.push("beforeResize", { minSize: b, shapes: h, dir: y });
      l.bind("mousemove.resize", function (A) {
        UI.hideShapeOptions();
        w = [];
        var B = Utils.getRelativePos(A.pageX, A.pageY, f);
        B = Utils.restoreScale(B);
        var D = Utils.copy(q);
        if (y.indexOf("r") >= 0) {
          D.w = B.x - x.x;
        } else {
          if (y.indexOf("l") >= 0) {
            D.w = x.x - B.x;
          }
        }
        if (y.indexOf("b") >= 0) {
          D.h = B.y - x.y;
        } else {
          if (y.indexOf("t") >= 0) {
            D.h = x.y - B.y;
          }
        }
        if (D.w < b.w) {
          D.w = b.w;
        }
        if (D.h < b.h) {
          D.h = b.h;
        }
        if (y.indexOf("l") >= 0) {
          D.x = x.x - D.w;
        }
        if (y.indexOf("t") >= 0) {
          D.y = x.y - D.h;
        }
        Utils.removeAnchors();
        for (var E = 0; E < h.length; E++) {
          var H = h[E];
          var G = a[H.id];
          if (H.name != "linker") {
            if (G.type == "attached") {
              H.props.x = D.x + D.w * G.x - H.props.w / 2;
              H.props.y = D.y + D.h * G.y - H.props.h / 2;
            } else {
              H.props.x = D.x + D.w * G.x;
              H.props.y = D.y + D.h * G.y;
              Designer.painter.renderShape(H);
              Utils.showAnchors(H);
            }
          } else {
            if (G.from.type == "box") {
              H.from.x = D.x + D.w * G.from.x;
              H.from.y = D.y + D.h * G.from.y;
            } else {
              if (G.from.type == "shape") {
                var p = Model.getShapeById(H.from.id);
                var J = {
                  x: p.props.x + p.props.w * G.from.x,
                  y: p.props.y + p.props.h * G.from.y,
                };
                var F = {
                  x: p.props.x + p.props.w / 2,
                  y: p.props.y + p.props.h / 2,
                };
                var C = Utils.getRotated(F, J, p.props.angle);
                H.from.x = C.x;
                H.from.y = C.y;
              }
            }
            if (G.to.type == "box") {
              H.to.x = D.x + D.w * G.to.x;
              H.to.y = D.y + D.h * G.to.y;
            } else {
              if (G.to.type == "shape") {
                var p = Model.getShapeById(H.to.id);
                var J = {
                  x: p.props.x + p.props.w * G.to.x,
                  y: p.props.y + p.props.h * G.to.y,
                };
                var F = {
                  x: p.props.x + p.props.w / 2,
                  y: p.props.y + p.props.h / 2,
                };
                var C = Utils.getRotated(F, J, p.props.angle);
                H.to.x = C.x;
                H.to.y = C.y;
              }
            }
            Designer.painter.renderLinker(H, true);
          }
        }
        Designer.painter.drawControls(j);
        var I = "W: " + Math.round(D.w) + "&nbsp;&nbsp;H: " + Math.round(D.h);
        if (D.x != q.x) {
          I =
            "X: " +
            Math.round(D.x) +
            "&nbsp;&nbsp;Y: " +
            Math.round(D.y) +
            "<br/>" +
            I;
        }
        Designer.op.showTip(I);
        $(document)
          .unbind("mouseup.resize_ok")
          .bind("mouseup.resize_ok", function () {
            if (w.length > 0) {
              h = h.concat(w);
            }
            if (y.indexOf("t") >= 0 || y.indexOf("l") >= 0) {
              for (var M = 0; M < h.length; M++) {
                var L = h[M];
                if (L.attribute && L.attribute.collapsed) {
                  var O = Utils.getCollapsedShapesById(L.id);
                  if (O.length > 0) {
                    var N = Utils.getOutlinkers(O);
                    O = O.concat(N);
                    var K = Model.getPersistenceById(L.id);
                    var i = L.props.x - K.props.x;
                    var P = L.props.y - K.props.y;
                    Designer.op.moveShape(O, { x: i, y: P }, true);
                    h = h.concat(O);
                  }
                }
              }
              Designer.painter.drawControls(j);
            }
            Model.updateMulti(h);
            $(document).unbind("mouseup.resize_ok");
          });
      });
      $(document).bind("mouseup.resize", function () {
        UI.showShapeOptions();
        l.css("cursor", "default");
        Designer.op.resetState();
        l.unbind("mousemove.resize");
        $(document).unbind("mouseup.resize");
        Designer.op.hideTip();
        Utils.showLinkerCursor();
        Designer.op.hideSnapLine();
      });
    },
    shapeResizable: function () {
      $(".shape_controller").bind("mousedown", function (c) {
        c.stopPropagation();
        Designer.op.changeState("resizing");
        var j = Utils.getSelectedIds();
        var r = Utils.getSelected();
        $("#shape_text_edit").on("blur");
        Utils.hideLinkerCursor();
        Utils.unselectGrid();
        var l = $("#canvas_container");
        var f = $("#designer_canvas");
        var n = $(this);
        var q;
        if (j.length == 1) {
          var d = Model.getShapeById(j[0]);
          q = Utils.copy(d.props);
        } else {
          q = Utils.getControlBox(j);
          q.angle = 0;
        }
        var y = { x: q.x + q.w / 2, y: q.y + q.h / 2 };
        var z = n.attr("resizeDir");
        var x = {};
        if (z.indexOf("l") >= 0) {
          x.x = q.x + q.w;
        } else {
          if (z.indexOf("r") >= 0) {
            x.x = q.x;
          } else {
            x.x = q.x + q.w / 2;
          }
        }
        if (z.indexOf("t") >= 0) {
          x.y = q.y + q.h;
        } else {
          if (z.indexOf("b") >= 0) {
            x.y = q.y;
          } else {
            x.y = q.y + q.h / 2;
          }
        }
        x = Utils.getRotated(y, x, q.angle);
        function v(i, D) {
          if (i.id == null) {
            if (D) {
              return {
                type: "box",
                x: (i.x - q.x) / q.w,
                y: (i.y - q.y) / q.h,
              };
            } else {
              return { type: "fixed" };
            }
          } else {
            if (Utils.isSelected(i.id)) {
              var B = Model.getShapeById(i.id);
              var C = {
                x: B.props.x + B.props.w / 2,
                y: B.props.y + B.props.h / 2,
              };
              var p = Utils.getRotated(C, i, -B.props.angle);
              return {
                type: "shape",
                x: (p.x - B.props.x) / B.props.w,
                y: (p.y - B.props.y) / B.props.h,
              };
            } else {
              return { type: "fixed" };
            }
          }
        }
        var h = [];
        var b = {};
        var e = [];
        var A = Utils.getAttachedShapes(r);
        r = r.concat(A);
        var s = [];
        for (var u = 0; u < r.length; u++) {
          var d = r[u];
          s.push(d.id);
          if (d.parent) {
            s.push(d.parent);
          }
          if (d.name == "linker") {
            if (e.indexOf(d.id) == -1) {
              e.push(d.id);
            }
          } else {
            h.push(d);
            if (d.attachTo && !Utils.isSelected(d.id)) {
              b[d.id] = {
                type: "attached",
                x: (d.props.x + d.props.w / 2 - q.x) / q.w,
                y: (d.props.y + d.props.h / 2 - q.y) / q.h,
              };
            } else {
              b[d.id] = {
                x: (d.props.x - q.x) / q.w,
                y: (d.props.y - q.y) / q.h,
                w: d.props.w / q.w,
                h: d.props.h / q.h,
              };
            }
            var t = Model.getShapeLinkers(d.id);
            if (t && t.length > 0) {
              for (var k = 0; k < t.length; k++) {
                var o = t[k];
                if (e.indexOf(o) == -1) {
                  e.push(o);
                }
              }
            }
          }
        }
        for (var u = 0; u < e.length; u++) {
          var o = e[u];
          var m = Model.getShapeById(o);
          h.push(m);
          var r = Utils.isSelected(o);
          b[m.id] = { from: v(m.from, r), to: v(m.to, r) };
        }
        var g = n.css("cursor");
        l.css("cursor", g);
        var w = [];
        var a = { w: 20, h: 20 };
        if (h.length == 1 && h[0].name.indexOf("Separator") > -1) {
          a = { w: 60, h: 60 };
        }
        Designer.events.push("beforeResize", { minSize: a, shapes: h, dir: z });
        l.bind("mousemove.resize", function (W) {
          UI.hideShapeOptions();
          w = [];
          var F = Utils.getRelativePos(W.pageX, W.pageY, f);
          F = Utils.restoreScale(F);
          var N = Utils.getRotated(x, F, -q.angle);
          var C = Utils.copy(q);
          if (z.indexOf("r") >= 0) {
            C.w = N.x - x.x;
          } else {
            if (z.indexOf("l") >= 0) {
              C.w = x.x - N.x;
            }
          }
          if (z.indexOf("b") >= 0) {
            C.h = N.y - x.y;
          } else {
            if (z.indexOf("t") >= 0) {
              C.h = x.y - N.y;
            }
          }
          if ((W.ctrlKey || W.shiftKey) && z.length == 2) {
            if (q.w >= q.h) {
              C.h = (q.h / q.w) * C.w;
              if (C.h < a.h) {
                C.h = a.h;
                C.w = (q.w / q.h) * C.h;
              }
            } else {
              C.w = (q.w / q.h) * C.h;
              if (C.w < a.w) {
                C.w = a.w;
                C.h = (q.h / q.w) * C.w;
              }
            }
          } else {
            if (C.w < a.w) {
              C.w = a.w;
            }
            if (C.h < a.h) {
              C.h = a.h;
            }
          }
          var T = {};
          if (z.indexOf("r") >= 0) {
            T.x = x.x + C.w;
          } else {
            if (z.indexOf("l") >= 0) {
              T.x = x.x - C.w;
            } else {
              T.x = x.x;
            }
          }
          if (z.indexOf("b") >= 0) {
            T.y = x.y + C.h;
          } else {
            if (z.indexOf("t") >= 0) {
              T.y = x.y - C.h;
            } else {
              T.y = x.y;
            }
          }
          var J = Utils.getRotated(x, T, q.angle);
          var L = { x: 0.5 * x.x + 0.5 * J.x, y: 0.5 * x.y + 0.5 * J.y };
          var R = Utils.getRotated(L, x, -q.angle);
          if (z.indexOf("r") >= 0) {
            C.x = R.x;
          } else {
            if (z.indexOf("l") >= 0) {
              C.x = R.x - C.w;
            } else {
              C.x = R.x - C.w / 2;
            }
          }
          if (z.indexOf("b") >= 0) {
            C.y = R.y;
          } else {
            if (z.indexOf("t") >= 0) {
              C.y = R.y - C.h;
            } else {
              C.y = R.y - C.h / 2;
            }
          }
          if (C.angle == 0) {
            var p = h[0];
            var P = Designer.op.snapResizeLine(C, s, z);
          }
          Utils.removeAnchors();
          for (var S = 0; S < h.length; S++) {
            var E = h[S];
            var O = b[E.id];
            if (E.name == "linker") {
              if (O.from.type == "box") {
                E.from.x = C.x + C.w * O.from.x;
                E.from.y = C.y + C.h * O.from.y;
              } else {
                if (O.from.type == "shape") {
                  var U = Model.getShapeById(E.from.id);
                  var Q = {
                    x: U.props.x + U.props.w * O.from.x,
                    y: U.props.y + U.props.h * O.from.y,
                  };
                  var V = {
                    x: U.props.x + U.props.w / 2,
                    y: U.props.y + U.props.h / 2,
                  };
                  var G = Utils.getRotated(V, Q, U.props.angle);
                  E.from.x = G.x;
                  E.from.y = G.y;
                }
              }
              if (O.to.type == "box") {
                E.to.x = C.x + C.w * O.to.x;
                E.to.y = C.y + C.h * O.to.y;
              } else {
                if (O.to.type == "shape") {
                  var U = Model.getShapeById(E.to.id);
                  var Q = {
                    x: U.props.x + U.props.w * O.to.x,
                    y: U.props.y + U.props.h * O.to.y,
                  };
                  var V = {
                    x: U.props.x + U.props.w / 2,
                    y: U.props.y + U.props.h / 2,
                  };
                  var G = Utils.getRotated(V, Q, U.props.angle);
                  E.to.x = G.x;
                  E.to.y = G.y;
                }
              }
              Designer.painter.renderLinker(E, true);
            } else {
              if (O.type == "attached") {
                E.props.x = C.x + C.w * O.x - E.props.w / 2;
                E.props.y = C.y + C.h * O.y - E.props.h / 2;
              } else {
                var B = Utils.copy(E.props);
                E.props.x = C.x + C.w * O.x;
                E.props.y = C.y + C.h * O.y;
                E.props.w = C.w * O.w;
                E.props.h = C.h * O.h;
                var D = Model.getShapeById(E.id).props;
                D.x = C.x + C.w * O.x;
                D.y = C.y + C.h * O.y;
                D.w = C.w * O.w;
                D.h = C.h * O.h;
                var I = {
                  x: E.props.x - B.x,
                  y: E.props.y - B.y,
                  w: E.props.w - B.w,
                  h: E.props.h - B.h,
                };
                var M = { shape: E, offset: I, dir: z };
                var K = Designer.events.push("resizing", M);
                if (K) {
                  w = w.concat(K);
                }
              }
              Designer.painter.renderShape(E);
              Utils.showAnchors(E);
            }
          }
          Designer.painter.drawControls(j);
          var H = "W: " + Math.round(C.w) + "&nbsp;&nbsp;H: " + Math.round(C.h);
          if (C.x != q.x) {
            H =
              "X: " +
              Math.round(C.x) +
              "&nbsp;&nbsp;Y: " +
              Math.round(C.y) +
              "<br/>" +
              H;
          }
          Designer.op.showTip(H);
          $(document)
            .unbind("mouseup.resize_ok")
            .bind("mouseup.resize_ok", function () {
              if (w.length > 0) {
                h = h.concat(w);
              }
              if (z.indexOf("t") >= 0 || z.indexOf("l") >= 0) {
                for (var Z = 0; Z < h.length; Z++) {
                  var Y = h[Z];
                  if (Y.attribute && Y.attribute.collapsed) {
                    var ac = Utils.getCollapsedShapesById(Y.id);
                    if (ac.length > 0) {
                      var ab = Utils.getOutlinkers(ac);
                      ac = ac.concat(ab);
                      var X = Model.getPersistenceById(Y.id);
                      var i = Y.props.x - X.props.x;
                      var ad = Y.props.y - X.props.y;
                      Designer.op.moveShape(ac, { x: i, y: ad }, true);
                      h = h.concat(ac);
                    }
                  }
                }
                Designer.painter.drawControls(j);
              }
              Model.updateMulti(h);
              Designer.events.push("changeLinkers", h);
              $(document).unbind("mouseup.resize_ok");
              var aa = Utils.getControlBox(j);
              Designer.op.changeCanvas(aa);
            });
        });
        $(document).bind("mouseup.resize", function () {
          UI.showShapeOptions();
          l.css("cursor", "default");
          Designer.op.resetState();
          l.unbind("mousemove.resize");
          $(document).unbind("mouseup.resize");
          Designer.op.hideTip();
          Utils.showLinkerCursor();
          Designer.op.hideSnapLine();
        });
      });
    },
    shapeRotatable: function () {
      $(".shape_rotater").bind("mousemove", function (d) {
        var c = $(this);
        var a = d.pageX - c.offset().left;
        var f = d.pageY - c.offset().top;
        var b = c[0].getContext("2d");
        c.unbind("mousedown");
        c.removeClass("rotate_enable");
        if (b.isPointInPath(a, f)) {
          c.addClass("rotate_enable");
          c.bind("mousedown", function (q) {
            Utils.hideLinkerCursor();
            Utils.unselectGrid();
            if ($("#shape_text_edit").length) {
              $("#shape_text_edit").trigger("blur");
            }
            q.stopPropagation();
            Designer.op.changeState("rotating");
            var m = Utils.getSelectedIds();
            var p;
            var l;
            if (m.length == 1) {
              var n = Model.getShapeById(m[0]);
              p = n.props;
              l = n.props.angle;
            } else {
              p = Utils.getControlBox(m);
              l = 0;
            }
            var e = { x: p.x + p.w / 2, y: p.y + p.h / 2 };
            var o = Utils.toScale(e);
            var g = $("#designer_canvas");
            var i = Utils.getSelected();
            var k = Utils.getAttachedShapes(i);
            i = i.concat(k);
            var j = Utils.getContainedShapes(i);
            i = i.concat(j);
            var r = Utils.getOutlinkers(i);
            i = i.concat(r);
            var h = l;
            $(document)
              .bind("mousemove.rotate", function (s) {
                UI.hideShapeOptions();
                var D = Utils.getRelativePos(s.pageX, s.pageY, g);
                var w = Math.atan(Math.abs(D.x - o.x) / Math.abs(o.y - D.y));
                if (D.x >= o.x && D.y >= o.y) {
                  w = Math.PI - w;
                } else {
                  if (D.x <= o.x && D.y >= o.y) {
                    w = Math.PI + w;
                  } else {
                    if (D.x <= o.x && D.y <= o.y) {
                      w = Math.PI * 2 - w;
                    }
                  }
                }
                w = w % (Math.PI * 2);
                var E = Math.PI / 36;
                var B = Math.round(w / E);
                w = E * B;
                if (w == h) {
                  return;
                }
                h = w;
                Designer.op.showTip(((B * 5) % 360) + "°");
                Designer.painter.rotateControls(p, w);
                Utils.removeAnchors();
                var F = w - l;
                for (var x = 0; x < i.length; x++) {
                  var z = i[x];
                  var v = Model.getPersistenceById(z.id);
                  if (z.name != "linker") {
                    z.props.angle = Math.abs(
                      (F + v.props.angle) % (Math.PI * 2)
                    );
                    var y = {
                      x: v.props.x + v.props.w / 2,
                      y: v.props.y + v.props.h / 2,
                    };
                    var C = Utils.getRotated(e, y, F);
                    z.props.x = C.x - z.props.w / 2;
                    z.props.y = C.y - z.props.h / 2;
                    Designer.painter.renderShape(z);
                    Utils.showAnchors(z);
                  } else {
                    var A = false;
                    if (
                      (Utils.isSelected(z.id) && z.from.id == null) ||
                      Utils.isSelected(z.from.id)
                    ) {
                      var t = Utils.getRotated(e, v.from, F);
                      z.from.x = t.x;
                      z.from.y = t.y;
                      if (z.from.angle != null) {
                        z.from.angle = Math.abs(
                          (v.from.angle + F) % (Math.PI * 2)
                        );
                      }
                      A = true;
                    }
                    var u = false;
                    if (
                      (Utils.isSelected(z.id) && z.to.id == null) ||
                      Utils.isSelected(z.to.id)
                    ) {
                      var t = Utils.getRotated(e, v.to, F);
                      z.to.x = t.x;
                      z.to.y = t.y;
                      if (z.to.angle != null) {
                        z.to.angle = Math.abs((v.to.angle + F) % (Math.PI * 2));
                      }
                      u = true;
                    }
                    if (A || u) {
                      Designer.painter.renderLinker(z, true);
                    }
                  }
                }
              })
              .bind("mouseup.rotate", function () {
                UI.showShapeOptions();
                $(document).unbind("mousemove.rotate").unbind("mouseup.rotate");
                Designer.op.resetState();
                Model.updateMulti(i);
                Designer.painter.drawControls(m);
                Designer.op.hideTip();
                Utils.showLinkerCursor();
                Designer.events.push("changeLinkers", i);
              });
          });
        } else {
          c.removeClass("rotate_enable");
          c.unbind("mousedown");
        }
      });
    },
    groupShapeChangable: function () {
      $(".change_shape_icon").bind("mousedown", function (f) {
        f.stopPropagation();
        var a = Utils.getSelected()[0];
        var h = a.groupName;
        var d = $(this).parent();
        var g = d.position();
        var c = g.left + d.width();
        var b = g.top + d.height() + 10;
        Designer.op.groupDashboard(h, c, b, function (e) {
          if (a.name != e) {
            var i = Designer.events.push("shapeChanged", { shape: a, name: e });
            Model.changeShape(a, e);
            var j = [a];
            if (i && i.length > 0) {
              j = j.concat(i);
            }
            Model.updateMulti(j);
          }
        });
      });
    },
    shapeMultiSelectable: function () {
      var b = $("#designer_canvas");
      var c = $("#designer_layout");
      var a = $("#canvas_container");
      c.off("mousedown.multiselect").on("mousedown.multiselect", function (g) {
        var e = null;
        if (!g.ctrlKey) {
          Utils.unselect();
        }
        var h = g.target,
          f = h.classList + "";
        if (f.indexOf("layout") >= 0) {
          return;
        }
        var d = Utils.getRelativePos(g.pageX, g.pageY, b);
        Designer.op.changeState("multi_selecting");
        Designer.op.initScrollPos();
        a.off("mousemove.multiselect").on(
          "mousemove.multiselect",
          function (j) {
            if (e == null) {
              e = $("<div id='selecting_box'></div>").appendTo(b);
            }
            var i = Utils.getRelativePos(j.pageX, j.pageY, b);
            var k = { "z-index": Model.orderList.length, left: i.x, top: i.y };
            if (i.x > d.x) {
              k.left = d.x;
            }
            if (i.y > d.y) {
              k.top = d.y;
            }
            k.width = Math.abs(i.x - d.x);
            k.height = Math.abs(i.y - d.y);
            e.css(k);
            Designer.op.isScroll(j.pageX, j.pageY);
          }
        );
        a.off("mouseup.multiselect").on("mouseup.multiselect", function (k) {
          if (e != null) {
            var i = {
              x: e.position().left.restoreScale(),
              y: e.position().top.restoreScale(),
              w: e.width().restoreScale(),
              h: e.height().restoreScale(),
            };
            var l = Utils.getShapesByRange(i);
            if (k.ctrlKey) {
              var j = Utils.getSelectedIds();
              Utils.mergeArray(l, j);
            }
            Utils.unselect();
            Utils.selectShape(l);
            e.remove();
          }
          Designer.op.resetState();
          a.off("mouseup.multiselect");
          a.off("mousemove.multiselect");
          Designer.op.stopScroll();
        });
        c.off("mousedown.multiselect");
      });
    },
    shapeEditable: function (a) {
      var b = $("#designer_canvas");
      b.unbind("dblclick.edit").bind("dblclick.edit", function (c) {
        b.unbind("dblclick.edit");
        var d = Utils.getRelativePos(c.pageX, c.pageY, b);
        Utils.unselectGrid();
        Designer.op.editShapeText(a, d);
      });
    },
    editShapeText: function (a, h, v) {
      if (a.name == "linker") {
        this.editLinkerText(a);
        return;
      }
      if (!a.textBlock || a.textBlock.length == 0) {
        return;
      }
      var g = a.getTextBlock();
      var l = 0;
      if (h) {
        h.x = h.x.restoreScale();
        h.y = h.y.restoreScale();
        if (a.props.angle != 0) {
          var y = {
            x: a.props.x + a.props.w / 2,
            y: a.props.y + a.props.h / 2,
          };
          h = Utils.getRotated(y, h, -a.props.angle);
        }
        var f = h.x - a.props.x;
        var e = h.y - a.props.y;
        for (var r = 0; r < g.length; r++) {
          var n = g[r];
          if (Utils.pointInRect(f, e, n.position)) {
            l = r;
            break;
          }
        }
      }
      if (v) {
        l = v;
      }
      Designer.contextMenu.hide();
      var q = $("#shape_text_edit");
      if (q.length == 0) {
        q = $(
          "<div contenteditable='true' spellcheck=false id='shape_text_edit'></div>"
        ).appendTo("#designer_canvas");
      }
      var p = $("#shape_text_ruler");
      if (p.length == 0) {
        p = $(
          "<div contenteditable='true' spellcheck=false id='shape_text_ruler'></div>"
        ).appendTo("#designer_canvas");
      }
      $(".text_canvas[forshape=" + a.id + "][ind=" + l + "]").hide();
      var x = g[l];
      var z = a.textBlock[l];
      var b = Utils.getShapeFontStyle(a.fontStyle);
      b = $.extend({}, b, x.fontStyle);
      var s = x.position;
      if (b.orientation == "horizontal") {
        var m = { x: s.x + s.w / 2, y: s.y + s.h / 2 };
        s = { x: m.x - s.h / 2, y: m.y - s.w / 2, w: s.h, h: s.w };
      }
      var t = {
        width: s.w + "px",
        "z-index": Model.orderList.length + 2,
        "line-height": 100 * b.lineHeight + "%",
        "font-size": b.size + "px",
        "font-family": b.fontFamily,
        "font-weight": b.bold ? "bold" : "normal",
        "font-style": b.italic ? "italic" : "normal",
        "text-align": b.textAlign,
        color: "rgb(" + b.color + ")",
        "text-decoration": b.underline ? "underline" : "none",
        "word-wrap": "break-word",
      };
      q.css(t);
      p.css(t);
      q.show();
      s.x += a.props.x;
      s.y += a.props.y;
      if (x.text != null) {
        var o = x.text
          .replace(/\n/g, "<br>")
          .replace(/\t/g, "&nbsp;")
          .replace(/\  /g, "&nbsp;&nbsp;");
        if (typeof isNewTextV != "undefined" && !isNewTextV) {
          o = o.replace(/</g, "&lt;").replace(/>/g, "&gt;");
          o = o.replace(/&lt;br&gt;/gi, "<br>");
          o = o.replace(/&lt;b&gt;/gi, "<b>").replace(/&lt;\/b&gt;/gi, "</b>");
          o = o
            .replace(/&lt;div&gt;/gi, "<div>")
            .replace(/&lt;\/div&gt;/gi, "</div>");
          o = o.replace(/&lt;i&gt;/gi, "<i>").replace(/&lt;\/i&gt;/gi, "</i>");
          o = o.replace(/&lt;u&gt;/gi, "<u>").replace(/&lt;\/u&gt;/gi, "</u>");
          o = o
            .replace(/&lt;font/gi, "<font")
            .replace(/\"&gt;/gi, '">')
            .replace(/&lt;\/font&gt;/gi, "</font>");
          o = o
            .replace(/&lt;span/gi, "<span")
            .replace(/&lt;\/span&gt;/gi, "</span>");
          o = o.replace(/&lt;p/gi, "<p").replace(/&lt;\/p&gt;/gi, "</p>");
        }
        q.html(o);
        Designer.op.equation.renderEquation(q);
      }
      var d = 0;
      var w = 0,
        u = 0,
        k = false,
        j = false;
      $("#shape_text_edit")
        .off()
        .on("keyup", function (C) {
          p.html($(this).html());
          d = p.height();
          q.css({ height: d });
          var B = { x: s.x + s.w / 2, y: s.y + s.h / 2 };
          var D = 0;
          var F = 0;
          var J = s.h;
          if (b.vAlign == "middle") {
            if (d > J) {
              J = d;
              D = B.y - J / 2;
              F = 0;
            } else {
              D = B.y - s.h / 2;
              F = (s.h - d) / 2;
              J = s.h - F;
            }
          } else {
            if (b.vAlign == "bottom") {
              if (d > J) {
                J = d;
                D = B.y + s.h / 2 - J;
                F = 0;
              } else {
                D = B.y - s.h / 2;
                F = s.h - d;
                J = s.h - F;
              }
            } else {
              D = B.y - s.h / 2;
              F = 0;
              if (d > J) {
                J = d;
              } else {
                J = s.h;
              }
            }
          }
          var I = F + J;
          var H = { x: s.x + s.w / 2, y: D + I / 2 };
          var G = a.props.angle;
          if (G != 0) {
            var i = {
              x: a.props.x + a.props.w / 2,
              y: a.props.y + a.props.h / 2,
            };
            H = Utils.getRotated(i, H, G);
          }
          if (b.orientation == "horizontal") {
            G = (Math.PI * 1.5 + G) % (Math.PI * 2);
          }
          var A = Math.round((G / (Math.PI * 2)) * 360);
          var E = "rotate(" + A + "deg) scale(" + Designer.config.scale + ")";
          q.css({
            width: s.w,
            height: J,
            "padding-top": F,
            left: H.x.toScale() - s.w / 2 - 2,
            top: H.y.toScale() - I / 2 - 2,
            "-webkit-transform": E,
            "-ms-transform": E,
            "-o-transform": E,
            "-moz-transform": E,
            transform: E,
          });
          if (k && j) {
            Utils.popEditor.renderMenuPos($(this));
          }
          C.stopPropagation();
        })
        .on("keydown", function (I) {
          I.stopPropagation();
          var K = $(this);
          if (I.keyCode == 13 && I.ctrlKey) {
            c();
            return false;
          } else {
            if (I.keyCode == 27) {
              K.unbind().remove();
              $(".text_canvas[forshape=" + a.id + "][ind=" + l + "]").show();
            } else {
              if (I.keyCode == 66 && I.ctrlKey) {
                var C = !b.bold;
                if (a.textBlock.length == 1) {
                  a.fontStyle.bold = C;
                } else {
                  z.fontStyle = $.extend(z.fontStyle, { bold: C });
                }
                b.bold = C;
                Model.update(a);
                var H = C ? "bold" : "normal";
                $(this).css("font-weight", H);
                p.css("font-weight", H);
                UI.update();
                I.preventDefault();
              } else {
                if (I.keyCode == 73 && I.ctrlKey) {
                  var C = !b.italic;
                  if (a.textBlock.length == 1) {
                    a.fontStyle.italic = C;
                  } else {
                    z.fontStyle = $.extend(z.fontStyle, { italic: C });
                  }
                  b.italic = C;
                  Model.update(a);
                  var H = C ? "italic" : "normal";
                  $(this).css("font-style", H);
                  p.css("font-style", H);
                  UI.update();
                  I.preventDefault();
                } else {
                  if (I.keyCode == 85 && I.ctrlKey) {
                    var C = !b.underline;
                    if (a.textBlock.length == 1) {
                      a.fontStyle.underline = C;
                    } else {
                      z.fontStyle = $.extend(z.fontStyle, { underline: C });
                    }
                    b.underline = C;
                    Model.update(a);
                    var H = C ? "underline" : "none";
                    $(this).css("text-decoration", H);
                    p.css("text-decoration", H);
                    I.preventDefault();
                    UI.update();
                    I.preventDefault();
                  } else {
                    if (I.keyCode == 13) {
                      if (Utils.isIE() && !I.shiftKey) {
                        I.preventDefault();
                      }
                    } else {
                      if (
                        (I.keyCode == 67 || I.keyCode == 88) &&
                        (I.ctrlKey || I.metaKey)
                      ) {
                        var G = window.getSelection().getRangeAt(0),
                          A = G.cloneContents().childNodes;
                        if (
                          A.length > 1 ||
                          (A.length == 1 && A[0].nodeType == 1)
                        ) {
                          if (I.keyCode == 88) {
                            document.addEventListener("cut", L, true);
                          } else {
                            document.addEventListener("copy", L, true);
                          }
                        }
                        function L(P) {
                          var N = document.createElement("div");
                          N.innerHTML = '<div class="mind-clipboard"></div>';
                          N.querySelector(".mind-clipboard").appendChild(
                            G.cloneContents()
                          );
                          var R = N.innerHTML;
                          var Q = N.cloneNode(true);
                          var O = $(Q).find(".equation-text");
                          if (O.length > 0) {
                            O.html(O.data("equation"));
                          }
                          P.clipboardData.setData("Text", $(Q).text());
                          P.clipboardData.setData("text/html", R);
                          if (I.keyCode == 88) {
                            window.getSelection().deleteFromDocument();
                            document.removeEventListener("cut", L, true);
                            if ($(R).find(".equation-text").length > 0) {
                              K.find(".equation-text").each(function (S, T) {
                                $(T).attr("data-index", S);
                              });
                            }
                          } else {
                            document.removeEventListener("copy", L, true);
                          }
                          P.preventDefault();
                        }
                      } else {
                        if (I.keyCode == 37 || I.keyCode == 39) {
                          if (q.find(".equation-text").length > 0) {
                            var B = window.getSelection();
                            var G = B.getRangeAt(0);
                            var i = document.createElement("span");
                            i.className = "equation-temp";
                            G.insertNode(i);
                            G.collapse(false);
                            var M = G.startContainer;
                            var D = M.nodeType == 1 ? M : M.parentNode;
                            E(D);
                          }
                          function E(P) {
                            var O = P.childNodes;
                            for (var N = 0; N < O.length; N++) {
                              if (O[N].nodeType == 3 && O[N].nodeValue == "") {
                                P.removeChild(O[N]);
                              }
                            }
                            for (var N = 0; N < O.length; N++) {
                              if (O[N].className == "equation-temp") {
                                if (I.keyCode == 39) {
                                  if (N == O.length - 1) {
                                    F(P);
                                  } else {
                                    if (O[N + 1].className == "equation-text") {
                                      Designer.op.equation.equationInit(
                                        q,
                                        $(O[N + 1])
                                      );
                                    } else {
                                      if (O[N + 1].nodeType == 1) {
                                        J(O[N + 1]);
                                      }
                                    }
                                  }
                                } else {
                                  if (N == 0) {
                                    F(P);
                                  } else {
                                    if (O[N - 1].className == "equation-text") {
                                      Designer.op.equation.equationInit(
                                        q,
                                        $(O[N - 1])
                                      );
                                    } else {
                                      if (O[N - 1].nodeType == 1) {
                                        J(O[N - 1]);
                                      }
                                    }
                                  }
                                }
                                q.find(".equation-temp").remove();
                                break;
                              }
                            }
                          }
                          function F(O) {
                            var N = O.parentNode;
                            if (N.childNodes.length == 1) {
                              F(N);
                            } else {
                              if (N.id != "designer_canvas") {
                                if (I.keyCode == 39) {
                                  O.after(i);
                                } else {
                                  O.before(i);
                                }
                                E(N);
                              }
                            }
                          }
                          function J(N) {
                            if (
                              N.childNodes.length == 1 &&
                              N.childNodes[0].className != "equation-text"
                            ) {
                              J(N.childNodes[0]);
                            } else {
                              if (N.nodeType == 1) {
                                if (I.keyCode == 39) {
                                  N.insertBefore(i, N.childNodes[0]);
                                } else {
                                  N.appendChild(i);
                                }
                                E(N);
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        })
        .on("blur", function (i) {
          if ($(".eq-editor").is(":visible")) {
            return;
          }
          c();
        })
        .on("mouseup", function (E) {
          var G = "";
          if (window.getSelection) {
            var C = window.getSelection();
            G = C.toString();
          } else {
            if (document.selection) {
              var C = document.selection;
              var B = C.createRange();
              G = B.text;
            }
          }
          if (k && j) {
            Utils.popEditor.init(this);
          }
          var F = $(".eq-editor");
          var A = $(E.target).parents(".equation-text");
          if (F.is(":visible")) {
            if (A.length > 0) {
              var D, i;
              if (window.getSelection) {
                D = window.getSelection();
                i = D.getRangeAt(0);
              } else {
                D = document.selection;
                i = D.createRange();
              }
              i.setStartAfter(A.get(0));
              i.collapse(false);
              D.removeAllRanges();
              D.addRange(i);
              $(".pop-editor").hide();
            }
            var A = q.find(".equation-text.cur");
            F.hide();
            $(".eq-shade").remove();
            if ($(".notranslate").html() == "") {
              A.remove();
            }
            A.removeClass("cur");
          } else {
            if (A.length > 0) {
              Designer.op.equation.equationInit(q, A);
            }
          }
          E.stopPropagation();
        })
        .on("mousemove", function (i) {
          i.stopPropagation();
          k = true;
        })
        .on("mousedown", function (i) {
          w = i.pageX;
          u = i.pageY;
          j = true;
          i.stopPropagation();
        })
        .on("mouseenter", function (i) {
          Designer.op.destroy();
        })
        .on("paste", function (I) {
          var K = $(this);
          var B =
              I.clipboardData ||
              I.originalEvent.clipboardData ||
              window.clipboardData,
            D,
            H,
            J;
          if (B) {
            var C = $(B.getData("text/html"));
            var A = $(C[1]).hasClass("mind-clipboard")
              ? C[1]
              : $(C[0]).hasClass("mind-clipboard")
              ? C[0]
              : C[2];
            D = B.items;
            J = B.types || [];
            for (var F = 0; F < J.length; F++) {
              if (J[F] == "text/plain") {
                H = D[F];
                break;
              }
            }
            if (typeof H != "undefined") {
              H.getAsString(function (N) {
                if (A && A.className == "mind-clipboard") {
                  N = A.innerHTML;
                } else {
                  N = Utils.filterXss(N);
                  N = N.replace(/\n/g, "<div></div>");
                }
                var M = window.getSelection();
                var i = M.getRangeAt(0);
                if (document.queryCommandSupported("insertHTML")) {
                  document.execCommand("insertHTML", false, N);
                } else {
                  if (i.pasteHTML) {
                    i.pasteHTML(N);
                  }
                }
              });
            }
            if (H == null && Utils.isIE()) {
              var E = B.getData("Text");
              if (E != "" && E != null) {
                E = E.replace(/\n/g, "<div></div>");
                var L = window.getSelection();
                var G = L.getRangeAt(0);
                G.pasteHTML(E);
              }
            }
            if ($(A).find(".equation-text").length > 0) {
              setTimeout(function () {
                K.find(".equation-text").each(function (M, N) {
                  $(N).attr("data-index", M);
                });
              }, 10);
            }
          }
          I.stopPropagation();
          I.preventDefault();
        });
      $("#shape_text_edit").trigger("keyup");
      Utils.selectText(q[0]);
      function c() {
        Utils.popEditor.close();
        var D = $("#shape_text_edit").html();
        var E = q.find(".equation-text");
        if (E.length > 0) {
          D = Designer.op.equation.equationHtml(E, D);
        }
        if (
          $("#shape_text_edit").length &&
          $("#shape_text_edit").is(":visible")
        ) {
          var C = Model.getShapeById(a.id);
          z.text = typeof z.text == "undefined" ? "" : z.text;
          var A = [C];
          if (D != z.text && !q.hasClass("invalid")) {
            C.textBlock[l].text = D;
            if (a.name == "interface" || a.name == "cls") {
              A = Designer.op.shapeChangeHeight(C, l, d, D) || [];
              for (var B = 0; B < A.length; B++) {
                var i = A[B];
                if (i.name == "linker") {
                  Designer.painter.renderLinker(i, true);
                }
              }
            }
            Model.updateMulti(A);
          }
          Designer.painter.renderShape(C);
          $("#shape_text_edit").remove();
          a = null;
        }
      }
    },
    equation: {
      equationInit: function (j, t) {
        var v;
        $(".pop-editor").hide();
        var s = $(".eq-editor");
        if (s.length == 0) {
          s = $(
            '<div class="eq-editor"><div><div class="notranslate" contenteditable="true"></div><div class="done">完成</div></div><div class="eg-title"><span>上/下标</span><span>根号/分号</span><span>积分/极限/求和/乘积</span><div class="icons">&#xe796;</div></div><div class="eg-con"></div></div>'
          ).appendTo("#designer_canvas");
          s = $(".eq-editor");
        }
        $(".eg-con").html("");
        $(".eg-title span").removeClass("on");
        var n, l, f;
        if (document.selection) {
          n = document.selection.createRange();
          l = document.getSelection().toString().replace(/\n/g, "");
          f = n.htmlText;
        } else {
          var r = window.getSelection();
          n = r.getRangeAt(0);
          l = r.toString().replace(/\n/g, "");
          var k = document.createElement("div");
          k.appendChild(n.cloneContents());
          f = k.innerHTML;
        }
        var a = document.createElement("div");
        a.innerHTML = f;
        var c = $(a).find(".equation-text");
        if (c.length > 0 && !t) {
          t = j.find(
            ".equation-text[data-index=" + c.eq(0).data("index") + "]"
          );
        }
        var w = $(".notranslate");
        if (!t) {
          var p = document.createElement("span");
          p.className = "eq-l";
          var m = document.createElement("span");
          m.className = "eq-r";
          n.insertNode(p);
          n.collapse(false);
          n.insertNode(m);
          v = j.clone(true);
          v.find(".equation-temp").remove();
          n.setStart(p, 0);
          n.setEnd(m, 0);
          j.find(".eq-l,.eq-r").remove();
          w.text(l);
          var i =
            '<span class="equation-text" contenteditable="false"><span></span><span>&#65279;</span></span>';
          var u = $(i)[0];
          u.childNodes[0].appendChild(n.cloneContents());
          var g = $(n.startContainer).parents(".equation-text");
          if (g.length > 0) {
            n.setStartAfter(g.get(0));
          }
          var e = n.startContainer,
            b = n.endContainer;
          n.deleteContents();
          n.insertNode(u);
          r.removeAllRanges();
          h(b);
          q(b);
          function h(x) {
            if (e != x) {
              if (x.id == "shape_text_edit") {
                var y = n.extractContents();
                e.append(y);
                return;
              }
              h(x.parentNode);
            }
          }
          function q(x) {
            if (!x.innerHTML) {
              var y = x.parentNode;
              x.remove();
              q(y);
            }
          }
          t = $(u);
        } else {
          w.text($(t[0].outerHTML).data("equation"));
        }
        j.find(".equation-text").each(function (x, y) {
          $(y).attr("data-index", x);
        });
        if (!v) {
          v = j.clone(true);
        }
        t.addClass("cur");
        var d = parseFloat(j.css("left"));
        var o = parseFloat(j.css("top"));
        s.css({
          left: d + (j.outerWidth() / 2 - s.outerWidth() / 2),
          top: o + j.outerHeight().toScale(),
        }).show();
        $("#designer_canvas").append(
          "<div class='eq-shade' style='position:fixed;top:0;left:0;width:100%;height:100%;z-index:2'></div>"
        );
        setTimeout(function () {
          Utils.selectText(w.get(0));
        });
        this.equationInitEvent(j, v, t);
      },
      equationInitEvent: function (e, b, f) {
        var k = false,
          i = false,
          c = false;
        var h = $(".eq-editor"),
          d = $(".notranslate"),
          j = h.find(".done");
        h.off()
          .on("keydown", function (l) {
            l.stopPropagation();
          })
          .on(
            "click",
            ".eg-title span, .eg-title .icons, .eg-con",
            function (r) {
              var u = [
                "x^{y^z_w}=(1+{\\rm e}^x)^{-2xy^w}",
                "x=\\frac{-b\\pm\\sqrt{b^2-4ac}}{2a}",
                "x = (-b +- sqrt(b^2-4ac))/(2a)",
              ];
              var s = r.target;
              var o = s.className ? s.className : s.parentNode.className;
              if (o == "icons") {
                var l = $(".equation-list");
                if (l.is(":visible")) {
                  l.hide();
                } else {
                  l.show();
                  UI.loadEquation();
                }
              } else {
                if (o == "eg-con") {
                  d.html(u[$(".eg-title .on").index()])
                    .trigger("input")
                    .focus();
                  var q = document.createRange();
                  q.selectNodeContents(d.get(0));
                  q.collapse(false);
                  var m = window.getSelection();
                  m.removeAllRanges();
                  m.addRange(q);
                } else {
                  var t = $(this);
                  poCollect("点击-方程式编辑器-" + t.text() + "（例）", {
                    来源: "流程图",
                    用户属性: "",
                  });
                  t.addClass("on").siblings().removeClass("on");
                  var n = u[t.index()];
                  var p = katex.renderToString(n);
                  $(".eg-con").html(
                    '<span style="align-self: flex-start;color:#999">例：</span><div style="margin:0 auto 10px;pointer-events:none">' +
                      p +
                      "</div>"
                  );
                }
              }
              r.stopPropagation();
            }
          );
        j.off()
          .on("mousedown", function (l) {
            l.stopPropagation();
          })
          .on("mouseup", function (l) {
            l.stopPropagation();
            k = true;
            a();
          });
        d.off()
          .on("mousedown", function (l) {
            l.stopPropagation();
          })
          .on("keydown", function (o) {
            i = true;
            if (o.keyCode == 13) {
              if (e.hasClass("invalid")) {
                o.preventDefault();
                return;
              }
              k = true;
              a();
              return;
            }
            if (o.keyCode == 39 || o.keyCode == 37) {
              var n, l;
              if (window.getSelection) {
                n = window.getSelection();
                l = n.getRangeAt(0);
              } else {
                n = document.selection;
                l = n.createRange();
              }
              if (
                (n.anchorOffset == d.text().length && o.keyCode == 39) ||
                (n.anchorOffset == 0 && o.keyCode == 37)
              ) {
                if (c) {
                  setTimeout(function () {
                    m(o);
                    c = true;
                  }, 10);
                } else {
                  setTimeout(function () {
                    if (!c) {
                      m(o);
                      c = true;
                    }
                  }, 300);
                }
              }
            }
            function m() {
              l.deleteContents();
              l = l.cloneRange();
              var p = $(f[0].outerHTML).data("index"),
                q;
              if (e.hasClass("invalid")) {
                b.find(".equation-temp").remove();
                e.html(b.html());
                if (o.keyCode == 37) {
                  q = e.find(".eq-l").get(0);
                } else {
                  q = e.find(".eq-r").get(0);
                }
              }
              if (!q) {
                q = e.find(".equation-text[data-index=" + p + "]").get(0);
              }
              e.focus();
              if (o.keyCode == 37) {
                l.setEndBefore(q);
              } else {
                l.setStartAfter(q);
              }
              l.collapse(true);
              n.removeAllRanges();
              n.addRange(l);
              a(o);
            }
            c = false;
          })
          .on("keyup", function (l) {
            c = true;
          })
          .on("input", function () {
            g();
          })
          .on("paste", function (m) {
            m.preventDefault();
            var n = null;
            if (window.clipboardData && clipboardData.setData) {
              n = window.clipboardData.getData("text");
            } else {
              n = (m.originalEvent || m).clipboardData.getData("text/plain");
            }
            if (document.body.createTextRange) {
              if (document.selection) {
                textRange = document.selection.createRange();
              } else {
                if (window.getSelection) {
                  sel = window.getSelection();
                  var l = sel.getRangeAt(0);
                  var o = document.createElement("span");
                  o.innerHTML = "&#FEFF;";
                  l.deleteContents();
                  l.insertNode(o);
                  textRange = document.body.createTextRange();
                  textRange.moveToElementText(o);
                  o.parentNode.removeChild(o);
                }
              }
              textRange.text = n;
              textRange.collapse(false);
              textRange.select();
            } else {
              document.execCommand("insertText", false, n);
            }
          });
        $(".eq-shade")
          .off()
          .on("click", function () {
            a();
          })
          .on("mousedown", function () {
            return false;
          });
        g();
        function g() {
          try {
            var n = d.text();
            var l = katex.renderToString(n);
            j.removeClass("disable");
            f.attr("data-equation", n);
            e.removeClass("invalid");
          } catch (m) {
            var l = "无效方程式";
            j.addClass("disable");
            e.addClass("invalid");
          }
          f.children(":first").html(l);
          $("#shape_text_edit").trigger("keyup");
        }
        function a(l) {
          if ($(f[0].outerHTML).data("equation") == "") {
            f.remove();
            e.find(".equation-text").each(function (m, n) {
              $(n).attr("data-index", m);
            });
          }
          h.hide();
          $(".eq-shade").remove();
          f.removeClass("cur");
          e.find(".eq-l,.eq-r").remove();
          if (!l) {
            if (!k) {
              e.addClass("invalid");
            }
            e.trigger("blur");
          }
        }
      },
      equationHtml: function (b, c) {
        $("body").append('<div id="html_temp" style="display:none"></div>');
        var a = $("#html_temp");
        a.html(c);
        b.each(function (d) {
          a.find(".equation-text:eq(" + d + ")")
            .attr("data-index", d)
            .children(":first")
            .html("");
        });
        c = a.html();
        a.remove();
        return c;
      },
      renderEquation: function (b) {
        var a = b.find(".equation-text");
        a.each(function () {
          var d = $(this);
          var e = d.data("equation") ? d.data("equation").toString() : "";
          var c = katex.renderToString(e);
          d.children(":first").html(c);
        });
      },
      insertLastEquation: function (b) {
        Designer.op.editShapeText(b, b.props);
        var a = document.createRange();
        a.collapse(false);
        var d = $("#shape_text_edit");
        if (d.find("li").length > 0) {
          var f = d.find("li");
        } else {
          var f = d;
        }
        var c = f[0];
        c.focus();
        var a = document.createRange();
        a.selectNodeContents(c);
        a.collapse(false);
        var e = window.getSelection();
        if (e.anchorOffset != 0) {
          return;
        }
        e.removeAllRanges();
        e.addRange(a);
        this.equationInit(d);
      },
    },
    shapeReplace: function (c, d) {
      var b = Schema.shapes[c];
      var a = Utils.copy(Model.getShapeById(d));
      Model.changeShape(a, c);
      Model.update(a);
    },
    shapeChangeHeight: function (k, h, a, n) {
      var o = Utils.copy(k.props);
      var c = [k];
      if (k.name == "interface") {
        if (h == 1) {
          a = a < 30 ? 30 : a;
          var d = k.props.h - k.textBlock[0].position.h;
          k.props.h += a - d;
        } else {
          if (h == 0) {
            a = a < 30 ? 30 : a;
            var g = "h-" + a;
            k.props.h += a - k.path[1].actions[0].y;
            k.path[1].actions[0].y = a;
            k.path[1].actions[1].y = a;
            k.textBlock[0].position.h = a;
            k.textBlock[1].position.y = a;
            k.textBlock[1].position.h = g;
          }
        }
        Schema.initShapeFunctions(k);
      } else {
        if (k.name == "cls") {
          var m = Number(k.textBlock[0].position.h);
          var l = k.textBlock[1].position.h + "";
          var j = k.textBlock[2].position.h + "";
          if (l.indexOf("h") >= 0) {
            l = (k.props.h - m) / 2;
          }
          if (j.indexOf("h") >= 0) {
            j = (k.props.h - m) / 2;
          }
          l = Number(l);
          j = Number(j);
          a = a < 30 ? 30 : a;
          if (h == 0) {
            var q = a - m;
            if (q == 0) {
              return c;
            }
            k.props.h = a + l + j;
            k.textBlock[0].position.h = a;
            k.textBlock[1].position.y = a;
            k.textBlock[1].position.h = l;
            k.textBlock[2].position.y = l + a;
            k.textBlock[2].position.h = j;
            k.path[1].actions[0].y = a;
            k.path[1].actions[1].y = a;
            k.path[1].actions[2].y = l + a;
            k.path[1].actions[3].y = l + a;
          }
          if (h == 1) {
            var q = a - l;
            if (q == 0) {
              return c;
            }
            k.props.h += q;
            k.textBlock[1].position.h = a;
            k.textBlock[1].position.y = m;
            k.textBlock[2].position.y = m + a + 2;
            k.textBlock[2].position.h = k.props.h - a - m;
            k.path[1].actions[0].y = m;
            k.path[1].actions[1].y = m;
            k.path[1].actions[2].y = m + a + 2;
            k.path[1].actions[3].y = m + a + 2;
          } else {
            if (h == 2) {
              var q = a - j;
              if (q == 0) {
                return c;
              }
              k.props.h = a + l + m;
              k.textBlock[1].position.h = l;
              k.path[1].actions[2].y = m + l;
              k.path[1].actions[3].y = m + l;
              k.textBlock[2].position.y = Number(m) + Number(l);
              k.textBlock[2].position.h = a;
            }
          }
          Schema.initShapeFunctions(k);
        }
      }
      var p = Utils.getOutlinkers([k]);
      for (var e = 0; e < p.length; e++) {
        var f = p[e];
        var b = true;
        if (f.from.id == k.id) {
          if (Math.abs(f.from.y - k.props.y - o.h) < 2) {
            f.from.y = f.from.y + (k.props.h - o.h);
            c.push(f);
            b = false;
          }
        }
        if (f.to.id == k.id) {
          if (Math.abs(f.to.y - k.props.y - o.h) < 2) {
            f.to.y = f.to.y + (k.props.h - o.h);
            if (b) {
              c.push(f);
            }
          }
        }
      }
      return c;
    },
    shapeLinkable: function (c, a) {
      var d = $("#designer_canvas");
      var b = $("#canvas_container");
      b.unbind("mousedown.link").bind("mousedown.link", function (h) {
        if (h.button == 2) {
          return;
        }
        Designer.op.changeState("linking_from_shape");
        var f = null;
        var g = null;
        var j;
        if (!c) {
          var i = Utils.getRelativePos(h.pageX, h.pageY, d);
          j = {
            x: i.x.restoreScale(),
            y: i.y.restoreScale(),
            id: null,
            angle: null,
          };
        } else {
          j = a;
          j.id = c.id;
        }
        Designer.op.initScrollPos();
        b.bind("mousemove.link", function (l) {
          b.css("cursor", "default");
          var k = Utils.getRelativePos(l.pageX, l.pageY, d);
          if (g == null) {
            g = e(j, k);
            Designer.events.push("linkerCreating", g);
          }
          Designer.op.moveLinker(g, "to", k.x, k.y);
          $(document)
            .unbind("mouseup.droplinker")
            .bind("mouseup.droplinker", function (m) {
              if (m.button == 2) {
                return;
              }
              if (Math.abs(g.to.x - j.x) > 20 || Math.abs(g.to.y - j.y) > 20) {
                Model.add(g);
                Designer.events.push("linkerCreated", g);
                if (g.to.id == null && g.from.id != null) {
                  Designer.op.linkDashboard(g);
                }
                Utils.showLinkerCursor();
              } else {
                $("#" + g.id).remove();
              }
              Designer.op.hideSnapLine();
              $(document).unbind("mouseup.droplinker");
            });
          Designer.op.isScroll(l.pageX, l.pageY);
        });
        $(document).bind("mouseup.link", function () {
          Designer.op.hideLinkPoint();
          Designer.op.resetState();
          b.unbind("mousedown.link");
          b.unbind("mousemove.link");
          $(document).unbind("mouseup.link");
          Designer.op.stopScroll();
        });
      });
      function e(k, j) {
        var g = Utils.newId();
        var i = Utils.copy(Schema.linkerDefaults);
        i.from = k;
        i.to = { id: null, x: j.x, y: j.y, angle: null };
        i.props = { zindex: Model.maxZIndex + 1 };
        delete i.fontStyle;
        var f = {};
        if (Designer.defaults.linkerBeginArrowStyle) {
          f.beginArrowStyle = Designer.defaults.linkerBeginArrowStyle;
        }
        if (Designer.defaults.linkerEndArrowStyle) {
          f.endArrowStyle = Designer.defaults.linkerEndArrowStyle;
        }
        var h = Model.define;
        if (
          h.defaultLinkerStyle != null &&
          h.defaultLinkerStyle.linkerStyle != null
        ) {
          f = $.extend(f, h.defaultLinkerStyle.linkerStyle);
        }
        i.lineStyle = f;
        i.id = g;
        return i;
      }
    },
    linkerEditable: function (c) {
      var b = $("#designer_canvas");
      b.off("dblclick.edit_linker").on("dblclick.edit_linker", function () {
        Designer.op.editLinkerText(c);
        b.off("dblclick.edit_linker");
      });
      var a = "false";
      b.off("mousedown.linkerdrag").on("mousedown.linkerdrag", function (n) {
        var g = n.target.classList + "";
        if (g == "" || g.indexOf("linker_text") < 0) {
          b.off("mousemove.linkerdrag");
          b.off("mouseup.linkerdrag");
          b.off("mousedown.linkerdrag");
          a = "false";
          return;
        }
        var r = n.pageX,
          o = n.pageY;
        var d = { moving: false };
        var t = $("#" + c.id);
        if (t.length == 0) {
          return;
        }
        var k = t.children(".linker_text"),
          l = t.attr("id"),
          s = k.position().left,
          q = k.position().top;
        k.addClass("active");
        b.addClass("moving_status");
        var v = Utils.getLinkerLinesPoints(c);
        var m = [];
        for (var j = 0; j < v.length; j++) {
          var f = v[j];
          var u = Math.floor(f.x),
            h = Math.floor(f.y);
          m.push([u, h]);
        }
        d.points = m;
        d.plen = v.length;
        d.tval = -1;
        d.moving = false;
        d.target = k;
        d.baseH = k.outerHeight();
        d.baseW = k.outerWidth();
        d.minX = t.position().left - 1;
        d.minY = t.position().top - 1;
        d.fromX = c.from.x;
        d.toX = c.to.x;
        d.fromY = c.from.y;
        d.toY = c.to.y;
        n.stopPropagation();
        b.off("mousemove.linkerdrag").on("mousemove.linkerdrag", function (C) {
          var M = C.target.classList + "";
          if (Math.abs(C.pageX - r) <= 3 && Math.abs(C.pageY - o) <= 3) {
            a = "false";
            d.moving = false;
            return;
          } else {
            d.moving = true;
          }
          var B = Utils.getRelativePos(C.pageX, C.pageY, b);
          var L = Math.floor(B.x.restoreScale());
          var x = Math.floor(B.y.restoreScale());
          var I = d.points,
            D = I.length;
          var z = null;
          for (var J = 0; J < D; J++) {
            var H = I[J];
            var e = H[0],
              G = H[1];
            var F = Utils.measureDistance({ x: L, y: x }, { x: e, y: G });
            if (z == null) {
              z = F;
              continue;
            }
            if (z > F) {
              z = F;
              d.currentX = e;
              d.currentY = G;
              if (x < G - 16 && d.fromX != d.toX) {
                d.pos = "top";
              } else {
                if (x > G + 16 && d.fromX != d.toX) {
                  d.pos = "bottom";
                } else {
                  d.pos = "in";
                }
              }
              d.tval = J;
            }
            if (d.currentX != null) {
              var A = d.currentX.toScale() - d.minX;
              var E = d.currentY.toScale() - d.minY;
              var K = Math.floor(A);
              var w = Math.floor(E);
              var y = 6;
              if (d.pos == "top") {
                w = w - d.baseH - y.toScale();
              } else {
                if (d.pos == "bottom") {
                  w += y.toScale();
                } else {
                  if (d.pos == "in") {
                    w -= d.baseH / 2;
                  }
                }
              }
              d.target.css({ top: w, left: K - d.baseW / 2 });
              a = "true";
            }
          }
        });
        b.off("mouseup.linkerdrag").on("mouseup.linkerdrag", function () {
          b.off("mousemove.linkerdrag");
          b.off("mouseup.linkerdrag");
          b.off("mousedown.linkerdrag");
          d.target.removeClass("active");
          b.removeClass("moving_status");
          if (d.moving && a == "true") {
            var i = d.currentX;
            var e = d.currentY;
            if (d.tval >= 0) {
              c.textPos = { x: i, y: e, t: d.tval, pos: d.pos };
              Model.update(c);
            }
            d = { moving: false };
            a = "false";
          }
        });
      });
    },
    editLinkerText: function (e) {
      Designer.contextMenu.hide();
      var d = null;
      if (e.textPos != null) {
        d = { x: e.textPos.x, y: e.textPos.y };
      } else {
        d = Designer.painter.getLinkerMidpoint(e);
      }
      var h = $("#" + e.id).find(".text_canvas");
      var b = $("#linker_text_edit");
      if (b.length == 0) {
        b = $("<textarea id='linker_text_edit'></textarea>").appendTo(
          "#designer_canvas"
        );
      }
      $("#" + e.id)
        .find(".text_canvas")
        .hide();
      var g = Utils.getLinkerFontStyle(e.fontStyle);
      var f = "scale(" + Designer.config.scale + ")";
      var a = Math.round(g.size * 1.25);
      b.css({
        "z-index": Model.orderList.length + 99999,
        "line-height": a + "px",
        "font-size": g.size + "px",
        "font-family": g.fontFamily,
        "font-weight": g.bold ? "bold" : "normal",
        "font-style": g.italic ? "italic" : "normal",
        "text-align": g.textAlign,
        color: "rgb(" + g.color + ")",
        "text-decoration": g.underline ? "underline" : "none",
        "-webkit-transform": f,
        "-ms-transform": f,
        "-o-transform": f,
        "-moz-transform": f,
        transform: f,
      });
      b.val(e.text).show().select();
      b.unbind()
        .bind("keyup", function () {
          var k = $(this).val();
          var m = k
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/\n/g, "<br/>");
          h.html(m + "<br/>");
          var i = h.width();
          if (i < 50) {
            i = 50;
          }
          var j = h.height();
          if (j < a) {
            j = a;
          }
          if (typeof e.textPos != "undefined") {
            var l = d.y.toScale() - j / 2 - 2;
            if (e.textPos.pos != null && e.textPos.pos == "top") {
              l = l - j / 2 - 6;
            } else {
              if (e.textPos.pos != null && e.textPos.pos == "bottom") {
                l += j / 2 + 6;
              }
            }
            b.css({
              left: d.x.toScale() - i / 2 - 2,
              top: l,
              width: i,
              height: j,
            });
          } else {
            b.css({
              left: d.x.toScale() - i / 2 - 2,
              top: d.y.toScale() - j / 2 - 2,
              width: i,
              height: j,
            });
          }
        })
        .bind("mousedown", function (i) {
          i.stopPropagation();
        })
        .bind("keydown", function (k) {
          if (k.keyCode == 13 && k.ctrlKey) {
            c();
            return false;
          } else {
            if (k.keyCode == 27) {
              b.unbind().remove();
              Designer.painter.renderLinkerText(e);
            } else {
              if (k.keyCode == 66 && k.ctrlKey) {
                var l = Utils.getLinkerFontStyle(e.fontStyle);
                var i = !l.bold;
                e.fontStyle.bold = i;
                Model.update(e);
                var j = i ? "bold" : "normal";
                $(this).css("font-weight", j);
                h.css("font-weight", j);
                UI.update();
              } else {
                if (k.keyCode == 73 && k.ctrlKey) {
                  var l = Utils.getLinkerFontStyle(e.fontStyle);
                  var i = !l.italic;
                  e.fontStyle.italic = i;
                  Model.update(e);
                  var j = i ? "italic" : "normal";
                  $(this).css("font-style", j);
                  h.css("font-style", j);
                  UI.update();
                } else {
                  if (k.keyCode == 85 && k.ctrlKey) {
                    var l = Utils.getLinkerFontStyle(e.fontStyle);
                    var i = !l.underline;
                    e.fontStyle.underline = i;
                    Model.update(e);
                    var j = i ? "underline" : "none";
                    $(this).css("text-decoration", j);
                    h.css("text-decoration", j);
                    k.preventDefault();
                    UI.update();
                  }
                }
              }
            }
          }
        })
        .bind("blur", function () {
          c();
        });
      b.trigger("keyup");
      function c() {
        var i = $("#linker_text_edit");
        if (i.length && i.is(":visible")) {
          var j = i.val();
          if (j != e.text) {
            e.text = j;
            if (j == "") {
              delete e.textPos;
            }
            Model.update(e);
          }
          if (Model.intersection[e.id]) {
            Designer.painter.renderLinker(
              e,
              null,
              null,
              Model.intersection[e.id]
            );
          } else {
            Designer.painter.renderLinker(e);
          }
          i.remove();
        }
      }
    },
    linkerDraggable: function (d, a) {
      if (d.locked) {
        return;
      }
      var c = $("#designer_canvas");
      var b = $("#canvas_container");
      c.bind("mousedown.draglinker", function (f) {
        Utils.hideLinkerControls();
        Designer.op.changeState("dragging_linker");
        var e = Utils.getSelectedIds();
        var g = false;
        if (e.length > 1) {
          g = true;
        }
        Designer.op.initScrollPos();
        b.bind("mousemove.draglinker", function (i) {
          b.css("cursor", "default");
          var h = Utils.getRelativePos(i.pageX, i.pageY, c);
          Designer.op.moveLinker(d, a, h.x, h.y);
          if (g) {
            Designer.painter.drawControls(e);
          }
          $(document)
            .unbind("mouseup.droplinker")
            .bind("mouseup.droplinker", function () {
              $(document).unbind("mouseup.droplinker");
              Model.update(d);
              Utils.showLinkerControls();
              Designer.op.hideSnapLine();
              Designer.events.push("linkerCreated", d);
            });
          Designer.op.isScroll(i.pageX, i.pageY);
        });
        $(document).bind("mouseup.draglinker", function () {
          Designer.op.hideLinkPoint();
          Designer.op.resetState();
          c.unbind("mousedown.draglinker");
          b.unbind("mousemove.draglinker");
          $(document).unbind("mouseup.draglinker");
          Utils.showLinkerControls();
          Designer.op.stopScroll();
        });
      });
    },
    linkClickable: function (a, c) {
      var b = $("#link_spot");
      if (b.length == 0) {
        b = $(
          "<a id='link_spot' target='_blank' style='cursor: pointer'></a>"
        ).appendTo("#designer_canvas");
        b.bind("dragstart", function () {
          return false;
        });
      }
      if (a.trim().toLowerCase().indexOf("http") == -1) {
        a = "http://" + a;
      }
      b.attr("href", a);
      b.show().css({
        left: c.x - 50,
        top: c.y - 50,
        "z-index": Model.orderList.length + 3,
      });
    },
    textCreatable: function () {
      var b = $("#designer_canvas");
      var a = $("#canvas_container");
      a.unbind("mousedown.create_text").bind(
        "mousedown.create_text",
        function (f) {
          var d = null;
          if (!f.ctrlKey) {
            Utils.unselect();
          }
          var c = Utils.getRelativePos(f.pageX, f.pageY, b);
          var e = null;
          a.bind("mousemove.create_text", function (g) {
            if (d == null) {
              d = $("<div id='texting_box'></div>").appendTo(b);
            }
            var h = Utils.getRelativePos(g.pageX, g.pageY, b);
            e = {
              "z-index": Model.orderList.length,
              left: h.x - 1,
              top: h.y - 1,
            };
            if (h.x > c.x) {
              e.left = c.x - 1;
            }
            if (h.y > c.y) {
              e.top = c.y - 1;
            }
            e.width = Math.abs(h.x - c.x - 2);
            e.height = Math.abs(h.y - c.y - 2);
            d.css(e);
          });
          $(document)
            .unbind("mouseup.create_text")
            .bind("mouseup.create_text", function (h) {
              if (e != null && e.width >= 20 && e.height >= 20) {
                var g = Model.create(
                  "standardText",
                  e.left.restoreScale(),
                  e.top.restoreScale()
                );
                g.props.w = e.width.restoreScale();
                g.props.h = e.height.restoreScale();
                Model.add(g);
                Designer.painter.renderShape(g);
                Designer.op.editShapeText(g);
                Utils.unselect();
                Utils.selectShape(g.id);
              }
              d.remove();
              Designer.op.resetState();
              $(document).unbind("mouseup.create_text");
              a.unbind("mousemove.create_text");
            });
          a.unbind("mousedown.create_text");
        }
      );
    },
    canvasDragTimeout: null,
    canvasDraggable: function () {
      var a = $("#canvas_container");
      a.css(
        "cursor",
        "url(/themes/default/images/diagraming/cursor_hand.png) 8 8, auto"
      );
      a.off("mousedown.drag_canvas").on("mousedown.drag_canvas", function (d) {
        var c = $("#designer_layout").scrollTop();
        var b = $("#designer_layout").scrollLeft();
        a.on("mousemove.drag_canvas", function (f) {
          var e = f.pageX - d.pageX;
          var g = f.pageY - d.pageY;
          $("#designer_layout").scrollLeft(b - e);
          $("#designer_layout").scrollTop(c - g);
        });
        $(document)
          .off("mouseup.drag_canvas")
          .on("mouseup.drag_canvas", function (e) {
            a.off("mousemove.drag_canvas");
            $(document).off("mouseup.drag_canvas");
          });
      });
      $(document)
        .off("keyup.drag_canvas")
        .on("keyup.drag_canvas", function (b) {
          a.off("mousedown.drag_canvas");
          Designer.op.resetState();
          $(document).off("mouseup.drag_canvas");
          b.preventDefault();
          a.off("mousemove.drag_canvas");
        });
    },
    canvasFreeDraggable: function () {
      var a = $("#canvas_container");
      a.css(
        "cursor",
        "url(/themes/default/images/diagraming/cursor_hand.png) 8 8, auto"
      );
      a.unbind("mousedown.drag_canvas").bind(
        "mousedown.drag_canvas",
        function (d) {
          var c = $("#designer_layout").scrollTop();
          var b = $("#designer_layout").scrollLeft();
          a.bind("mousemove.drag_canvas", function (f) {
            var e = f.pageX - d.pageX;
            var g = f.pageY - d.pageY;
            $("#designer_layout").scrollLeft(b - e);
            $("#designer_layout").scrollTop(c - g);
          });
          $(document)
            .unbind("mouseup.drag_canvas")
            .bind("mouseup.drag_canvas", function (e) {
              a.unbind("mousemove.drag_canvas");
              $(document).unbind("mouseup.drag_canvas");
            });
        }
      );
    },
    moveShape: function (q, h, c) {
      var r = [];
      for (var t = 0; t < q.length; t++) {
        var b = q[t];
        r.push(b.id);
      }
      var w = Utils.getControlBox(r);
      if (w.x + h.x < -1000 || w.y + h.y < -1000) {
      }
      var y = Utils.restoreScale(h);
      for (var t = 0; t < q.length; t++) {
        var b = q[t];
        if (b.name == "linker") {
          var m = b;
          var s = m.from;
          var d = m.to;
          var j = false;
          var n = false;
          if (!Utils.isSelected(m.id)) {
            if (s.id != null && r.indexOf(s.id) >= 0) {
              m.from.x += y.x;
              m.from.y += y.y;
              j = true;
            }
            if (d.id != null && r.indexOf(d.id) >= 0) {
              m.to.x += y.x;
              m.to.y += y.y;
              n = true;
            }
          } else {
            if (s.id == null || r.indexOf(s.id) >= 0) {
              m.from.x += y.x;
              m.from.y += y.y;
              j = true;
            }
            if (d.id == null || r.indexOf(d.id) >= 0) {
              m.to.x += y.x;
              m.to.y += y.y;
              n = true;
            }
          }
          if (j && n) {
            for (var v = 0; v < m.points.length; v++) {
              var o = m.points[v];
              o.x += y.x;
              o.y += y.y;
            }
            var x = $("#" + b.id);
            if (x.length > 0) {
              var f = x.position();
              x.css({ left: (f.left += h.x), top: (f.top += h.y) });
            }
          } else {
            if (j || n) {
              Designer.painter.renderLinker(m, true);
            }
          }
          if (m.textPos != null) {
            m.textPos.x += y.x;
            m.textPos.y += y.y;
          }
        } else {
          a(b);
          $(".shape_contour[forshape=" + b.id + "]").css({
            left: b.props.x.toScale(),
            top: b.props.y.toScale(),
          });
        }
      }
      var e = Utils.getSelectedLinkerIds();
      if (q.length == 1 && e.length == 1) {
        return;
      }
      if (typeof c == "undefined") {
        if (e.length > 0) {
          var g = Utils.getSelectedIds();
          Designer.painter.drawControls(g);
        } else {
          var l = $("#shape_controls");
          l.css({
            left: parseFloat(l.css("left")) + h.x,
            top: parseFloat(l.css("top")) + h.y,
          });
          var u = $("#grid_selects");
          u.css({
            left: parseFloat(u.css("left")) + h.x,
            top: parseFloat(u.css("top")) + h.y,
          });
        }
        var k = $("#shape_controls").position();
        Designer.op.showTip(
          "X: " +
            Math.round(k.left.restoreScale()) +
            "&nbsp;&nbsp;Y: " +
            Math.round(k.top.restoreScale())
        );
      }
      function a(i) {
        i.props.x += y.x;
        i.props.y += y.y;
        var p = $("#" + i.id);
        p.css({
          left: parseFloat(p.css("left")) + h.x,
          top: parseFloat(p.css("top")) + h.y,
        });
      }
    },
    moveLinkerFocus: function (c) {
      var d = Utils.copy(c);
      var b = Utils.getShapeByPosition(
        c.to.x.toScale(),
        c.to.y.toScale(),
        true
      );
      var a = Utils.getShapeByPosition(
        c.from.x.toScale(),
        c.from.y.toScale(),
        true
      );
      Designer.op.hideLinkPoint();
      Utils.hideAnchors();
      if (b && b.type == "bounding") {
        Designer.op.showLinkPoint(Utils.toScale(b.linkPoint));
        Utils.showAnchors(b.shape);
        d.to.x = b.linkPoint.x;
        d.to.y = b.linkPoint.y;
        d.to.angle = b.linkPoint.angle;
        d.to.id = b.shape.id;
        Designer.painter.renderLinker(d, true, null, null, true);
      } else {
        Designer.painter.renderLinker(d);
      }
      if (a && a.type == "bounding") {
        Designer.op.showLinkPoint(Utils.toScale(a.linkPoint));
        Utils.showAnchors(a.shape);
        d.from.x = a.linkPoint.x;
        d.from.y = a.linkPoint.y;
        d.from.angle = a.linkPoint.angle;
        d.from.id = a.shape.id;
        Designer.painter.renderLinker(d, true, null, null, true);
      } else {
        Designer.painter.renderLinker(d);
      }
      d = Designer.op.beautifyLinkerFocus(d);
      return d;
    },
    beautifyLinkerFocus: function (e, l) {
      var c = 8;
      var f = Utils.copy(e);
      var a = e.to.id,
        j = e.to.x,
        h = e.to.y;
      var d = e.from.id,
        i = e.from.x,
        g = e.from.y;
      var b = e.linkerType;
      var k = e.points;
      if (b == "broken" && l) {
        if (a && !d) {
          if (Math.abs(h - g) < Math.abs(j - i)) {
            if (Math.abs(h - g) < c) {
              f.from.y = h;
            }
          } else {
            if (Math.abs(j - i) < c) {
              f.from.x = j;
            }
          }
        } else {
          if (!a && d) {
            if (Math.abs(h - g) < Math.abs(j - i)) {
              if (Math.abs(h - g) < c) {
                f.to.y = g;
              }
            } else {
              if (Math.abs(j - i) < c) {
                f.to.x = i;
              }
            }
          }
        }
      } else {
        if (b == "broken" && k.length == 2) {
          if (a && !d) {
            if (k[0].x == k[1].x) {
              if (Math.abs(k[0].y - k[1].y) < c && k[0].y != k[1].y) {
                f.points[0].y = h;
                f.points[1].y = h;
                f.from.y = h;
              }
            } else {
              if (Math.abs(k[0].x - k[1].x) < c && k[0].x != k[1].x) {
                f.x = j;
                f.x = j;
                f.from.x = j;
              }
            }
          } else {
            if (!a && d) {
              if (k[0].x == k[1].x) {
                if (Math.abs(k[0].y - k[1].y) < c && k[0].y != k[1].y) {
                  f.points[0].y = g;
                  f.points[1].y = g;
                  f.to.y = g;
                }
              } else {
                if (Math.abs(k[0].x - k[1].x) < c && k[0].x != k[1].x) {
                  f.x = i;
                  f.x = i;
                  f.to.x = i;
                }
              }
            }
          }
        }
      }
      return f;
    },
    moveLinker: function (j, r, g, f) {
      var b = null;
      var k = null;
      var n = Utils.getShapeByPosition(g, f, true);
      Designer.op.hideLinkPoint();
      if (n != null) {
        var a = n.shape;
        Utils.showAnchors(a);
        k = a.id;
        if (n.type == "bounding") {
          b = n.linkPoint;
          Designer.op.showLinkPoint(Utils.toScale(b));
        } else {
          if (n.type == "shape") {
            var t;
            var e;
            if (r == "from") {
              t = { x: j.to.x, y: j.to.y };
              e = j.to.id;
            } else {
              t = { x: j.from.x, y: j.from.y };
              e = j.from.id;
            }
            if (a.id == e) {
              Designer.op.hideLinkPoint();
              b = { x: g.restoreScale(), y: f.restoreScale() };
              b.angle = null;
              k = null;
            } else {
              var l = a.getAnchors();
              var i = -1;
              var m;
              var u = {
                x: a.props.x + a.props.w / 2,
                y: a.props.y + a.props.h / 2,
              };
              for (var s = 0; s < l.length; s++) {
                var p = l[s];
                var h = Utils.getRotated(
                  u,
                  { x: a.props.x + p.x, y: a.props.y + p.y },
                  a.props.angle
                );
                var q = Utils.measureDistance(h, t);
                if (i == -1 || q < i) {
                  i = q;
                  m = h;
                }
              }
              var c = Utils.getPointAngle(a.id, m.x, m.y, 4);
              b = { x: m.x, y: m.y, angle: c };
              Designer.op.showLinkPoint(Utils.toScale(b));
            }
          }
        }
      } else {
        Designer.op.hideLinkPoint();
        Utils.hideAnchors();
        var o = Designer.op.snapLinkerLine(g, f);
        b = { x: o.x.restoreScale(), y: o.y.restoreScale() };
        b.angle = null;
        k = null;
      }
      var d = 2;
      if (k == null) {
        d = 6;
      }
      if (r == "from") {
        j.from.id = k;
        j.from.x = b.x;
        j.from.y = b.y;
        j.from.angle = b.angle;
        if (b.x >= j.to.x - d && b.x <= j.to.x + d) {
          j.from.x = j.to.x;
        }
        if (b.y >= j.to.y - d && b.y <= j.to.y + d) {
          j.from.y = j.to.y;
        }
        if (j.from.x == j.to.x && j.from.y == j.to.y) {
          return;
        }
      } else {
        j.to.x = b.x;
        j.to.y = b.y;
        j.to.id = k;
        j.to.angle = b.angle;
        if (b.x >= j.from.x - d && b.x <= j.from.x + d) {
          j.to.x = j.from.x;
        }
        if (b.y >= j.from.y - d && b.y <= j.from.y + d) {
          j.to.y = j.from.y;
        }
        if (j.from.x == j.to.x && j.from.y == j.to.y) {
          return;
        }
      }
      Designer.painter.renderLinker(j, true);
    },
    showLinkPoint: function (a) {
      var c = $(
        "<canvas class='link_point_canvas' width=32 height=32></canvas>"
      ).appendTo($("#designer_canvas"));
      var b = c[0].getContext("2d");
      b.translate(1, 1);
      b.lineWidth = 1;
      b.globalAlpha = 0.3;
      b.strokeStyle = Designer.config.anchorColor;
      b.fillStyle = Designer.config.anchorColor;
      b.beginPath();
      b.moveTo(0, 15);
      b.bezierCurveTo(0, -5, 30, -5, 30, 15);
      b.bezierCurveTo(30, 35, 0, 35, 0, 15);
      b.closePath();
      b.fill();
      b.stroke();
      c.css({
        left: a.x - 16,
        top: a.y - 16,
        "z-index": Model.orderList.length,
      }).show();
    },
    hideLinkPoint: function () {
      $(".link_point_canvas").remove();
    },
    brokenLinkerChangable: function (d, c) {
      var a = $("#canvas_container");
      var b = $("#designer_canvas");
      var f = d.points[c - 1];
      var e = d.points[c];
      if (Math.abs(f.x - e.x) < 1) {
        a.css("cursor", "e-resize");
      } else {
        a.css("cursor", "n-resize");
      }
      b.bind("mousedown.brokenLinker", function (i) {
        Designer.op.changeState("changing_broken_linker");
        var h = Utils.getRelativePos(i.pageX, i.pageY, b);
        var g = Utils.getSelectedIds();
        a.bind("mousemove.brokenLinker", function (k) {
          var j = Utils.getRelativePos(k.pageX, k.pageY, b);
          var p = { x: j.x - h.x, y: j.y - h.y };
          p = Utils.restoreScale(p);
          var m = 0,
            l = 0;
          if (Math.abs(f.x - e.x) < 1) {
            var o = Designer.op.brokenLinkerChangableDisabled(
              d,
              c,
              f.x + p.x,
              null
            );
            m = o - f.x;
            f.x = o;
            e.x = o;
          } else {
            var n = Designer.op.brokenLinkerChangableDisabled(
              d,
              c,
              null,
              f.y + p.y
            );
            l = n - f.y;
            f.y = n;
            e.y = n;
          }
          Designer.painter.renderLinker(d);
          Designer.op.resetLinkerText(d);
          Designer.events.push("linkerCreated", d);
          if (g.length > 1) {
            Designer.painter.drawControls(g);
          }
          h = { x: h.x + m.toScale(), y: h.y + l.toScale() };
          $(document)
            .unbind("mouseup.changed")
            .bind("mouseup.changed", function () {
              Model.update(d);
              $(document).unbind("mouseup.changed");
            });
        });
        $(document).bind("mouseup.brokenLinker", function () {
          Designer.op.resetState();
          a.unbind("mousemove.brokenLinker");
          b.unbind("mousedown.brokenLinker");
          $(document).unbind("mouseup.brokenLinker");
        });
      });
    },
    brokenLinkerChangableDisabled: function (d, k, h, f) {
      var e = 15;
      var l = d.points,
        i = d.from,
        j = d.to;
      var g = d.lineStyle.beginArrowStyle || "none",
        a = d.lineStyle.endArrowStyle || "solidArrow";
      var n = [],
        m = [],
        c = [],
        b = [];
      if (k == 1 && g != "none") {
        if (i.x == l[0].x) {
          m.push(i.y - e, i.y + e);
        } else {
          n.push(i.x - e, i.x + e);
        }
      }
      if (k == l.length - 1 && a != "none") {
        if (j.x == l[l.length - 1].x) {
          b.push(j.y - e, j.y + e);
        } else {
          c.push(j.x - e, j.x + e);
        }
      }
      if (h != null) {
        if (n.length && c.length) {
          if (n[0] > c[0] && n[0] < c[1] && h > c[0] && h < n[1]) {
            h = Math.abs(h - c[0]) < Math.abs(h - n[1]) ? c[0] : n[1];
          } else {
            if (n[1] > c[0] && n[1] < c[1] && h > n[0] && h < c[1]) {
              h = Math.abs(h - n[0]) < Math.abs(h - c[1]) ? n[0] : c[1];
            } else {
              if (h > n[0] && h < n[1]) {
                h = Math.abs(h - n[0]) < Math.abs(h - n[1]) ? n[0] : n[1];
              } else {
                if (h > c[0] && h < c[1]) {
                  h = Math.abs(h - c[0]) < Math.abs(h - c[1]) ? c[0] : c[1];
                }
              }
            }
          }
        } else {
          if (n.length) {
            if (h > n[0] && h < n[1]) {
              h = Math.abs(h - n[0]) < Math.abs(h - n[1]) ? n[0] : n[1];
            }
          } else {
            if (c.length) {
              if (h > c[0] && h < c[1]) {
                h = Math.abs(h - c[0]) < Math.abs(h - c[1]) ? c[0] : c[1];
              }
            }
          }
        }
        return h;
      }
      if (f != null) {
        if (m.length && b.length) {
          if (m[0] > b[0] && m[0] < b[1] && f > b[0] && f < m[1]) {
            f = Math.abs(f - b[0]) < Math.abs(f - m[1]) ? b[0] : m[1];
          } else {
            if (m[1] > b[0] && m[1] < b[1] && f > m[0] && f < b[1]) {
              f = Math.abs(f - m[0]) < Math.abs(f - b[1]) ? m[0] : b[1];
            } else {
              if (f > m[0] && f < m[1]) {
                f = Math.abs(f - m[0]) < Math.abs(f - m[1]) ? m[0] : m[1];
              } else {
                if (f > b[0] && f < b[1]) {
                  f = Math.abs(f - b[0]) < Math.abs(f - b[1]) ? b[0] : b[1];
                }
              }
            }
          }
        } else {
          if (m.length) {
            if (f > m[0] && f < m[1]) {
              f = Math.abs(f - m[0]) < Math.abs(f - m[1]) ? m[0] : m[1];
            }
          } else {
            if (b.length) {
              if (f > b[0] && f < b[1]) {
                f = Math.abs(f - b[0]) < Math.abs(f - b[1]) ? b[0] : b[1];
              }
            }
          }
        }
        return f;
      }
    },
    resetLinkerText: function (d) {
      var f = $("#" + d.id);
      var a = f.find(".text_canvas");
      var b = null;
      if (d.textPos != null) {
        var c = Utils.getLinkerLinesPoints(d);
        if (d.textPos.t > c.length) {
          d.textPos.t = c.length - 1;
        }
        b = c[d.textPos.t];
        if (b != null) {
          d.textPos.x = b.x;
          d.textPos.y = b.y;
        }
      }
      if (b != null && b.x != null) {
        var g = f.position();
        var e = b.y.toScale() - g.top - a.height() / 2;
        if (d.textPos != null) {
          if (d.textPos.pos != null && d.textPos.pos == "top") {
            e = e - a.height() / 2 - 6;
          } else {
            if (d.textPos.pos != null && d.textPos.pos == "bottom") {
              e += a.height() / 2 + 6;
            }
          }
        }
        a.css({ left: b.x.toScale() - g.left - a.width() / 2, top: e });
      }
    },
    removeShape: function () {
      var d = Utils.getSelected();
      if (d.length > 0) {
        Utils.unselect();
        var e = Utils.getAttachedShapes(d);
        d = d.concat(e);
        var c = [];
        for (var b = 0; b < d.length; b++) {
          var a = Utils.getChildrenShapes(d[b]);
          c = c.concat(a);
        }
        d = d.concat(c);
        var f = Utils.getCollapsedShapes(d);
        d = d.concat(f);
        Model.remove(d);
      }
    },
    setDefaultStyle: function () {
      var c = Utils.getSelected();
      if (c.length == 1) {
        var a = c[0];
        if (
          a.name == "standardImage" ||
          a.name == "note" ||
          a.name == "uiNote"
        ) {
          return "error";
        }
        if (
          a.category != null &&
          (a.category.indexOf("ios_") >= 0 ||
            a.category.indexOf("andriod_") >= 0)
        ) {
          return "error";
        }
        if (a.category != null && a.category.indexOf("network") >= 0) {
          return "error";
        }
        if (
          a.category != null &&
          (a.category.indexOf("aws_") >= 0 ||
            a.category.indexOf("azure") >= 0 ||
            a.category.indexOf("aws2019") >= 0)
        ) {
          return "error";
        }
        if (
          a.category != null &&
          (a.category.indexOf("ali_") >= 0 || a.category.indexOf("cisco_") >= 0)
        ) {
          return "error";
        }
        var d = {},
          b = "shape";
        if (a.name == "linker") {
          b = "linker";
          d = { linkerStyle: Utils.copy(a.lineStyle) };
        } else {
          d = {
            lineStyle: Utils.copy(a.lineStyle),
            fontStyle: Utils.copy(a.fontStyle),
            fillStyle: Utils.copy(a.fillStyle),
          };
          if (d.fontStyle.orientation == "horizontal") {
            delete d.fontStyle.orientation;
          }
        }
        Model.setDefaultStyle(b, d);
      }
    },
    showTip: function (c) {
      var a = $("#designer_op_tip");
      if (a.length == 0) {
        a = $("<div id='designer_op_tip'></div>").appendTo("#designer_canvas");
      }
      a.stop().html(c);
      var b = $("#shape_controls");
      var d = b.position();
      a.css({
        top: d.top + b.height() + 5,
        left: d.left + b.width() / 2 - a.outerWidth() / 2,
        "z-index": Model.orderList.length,
      }).show();
    },
    hideTip: function () {
      $("#designer_op_tip").fadeOut(100);
    },
    snapLine: function (u, v, F, j, e) {
      var t = u.y;
      var J = u.y + u.h / 2;
      var k = u.y + u.h;
      var g = u.x;
      var E = u.x + u.w / 2;
      var B = u.x + u.w;
      var f = 2;
      var m = {
        v: null,
        h: null,
        attach: null,
        container: null,
        hLinePosS: [],
        vLinePosS: [],
      };
      var C = null;
      if (F) {
        C = j;
      } else {
        C = Model.getShapeById(v[0]);
      }
      if (v.length == 1 && C.groupName == "boundaryEvent") {
        for (var y = Model.orderList.length - 1; y >= 0; y--) {
          var H = Model.orderList[y].id;
          var c = Model.getShapeById(H);
          if (c.attribute && c.attribute.collapseBy) {
            continue;
          }
          if (c.name != "linker" && c.id != C.id) {
            var w = c.props;
            if (
              m.attach == null &&
              w.angle == 0 &&
              (c.groupName == "task" ||
                c.groupName == "callActivity" ||
                c.groupName == "subProcess")
            ) {
              var A = {
                x: w.x - f,
                y: w.y - f,
                w: w.w + f * 2,
                h: w.h + f * 2,
              };
              if (Utils.pointInRect(E, J, A)) {
                var b = w.y;
                var l = w.y + w.h;
                var I = w.x;
                var x = w.x + w.w;
                var s = false;
                var o = false;
                if (b >= J - f && b <= J + f) {
                  u.y = b - u.h / 2;
                  o = true;
                } else {
                  if (l >= J - f && l <= J + f) {
                    u.y = l - u.h / 2;
                    o = true;
                  }
                }
                if (I >= E - f && I <= E + f) {
                  u.x = I - u.w / 2;
                  s = true;
                } else {
                  if (x >= E - f && x <= E + f) {
                    u.x = x - u.w / 2;
                    s = true;
                  }
                }
                if (s || o) {
                  m.attach = c;
                }
              }
            }
          }
        }
      }
      this.hideSnapLine();
      var d = $("#designer_canvas");
      if (m.attach == null) {
        var n = [],
          q = [];
        for (var y = e.length - 1; y >= 0; y--) {
          var G = e[y];
          var D = {
            top: G.y,
            middle: G.y + G.h / 2,
            bottom: G.y + G.h,
            left: G.x,
            center: G.x + G.w / 2,
            right: G.x + G.w,
            id: G.id,
          };
          if (
            !Utils.rectInRect(G, u) &&
            !Utils.rectInRect(u, G) &&
            !Utils.rectCross(G, u)
          ) {
            if (!(D.top > k + f * 3 || D.bottom < t - f * 3)) {
              n.push(D);
            } else {
              if (!(D.left > B + f * 3 || D.right < g - f * 3)) {
                q.push(D);
              }
            }
          }
          if (m.container == null) {
            var c = Model.getShapeById(G.id);
            if (c.attribute && c.attribute.container) {
              if (Utils.rectInRect(u, c.props)) {
                m.container = c;
              }
            }
          }
        }
        Utils.getShapeRuleLine(u, n, q, F);
      }
      if (m.attach != null || m.container != null) {
        var r = $("#designer_op_snapline_attach");
        if (r.length == 0) {
          r = $("<div id='designer_op_snapline_attach'></div>").appendTo(d);
        }
        var z = m.attach || m.container;
        var h = Utils.getShapeLineStyle(z.lineStyle);
        var a = h.lineWidth;
        r.css({
          width: (z.props.w + a).toScale(),
          height: (z.props.h + a).toScale(),
          left: (z.props.x - a / 2).toScale() - 2,
          top: (z.props.y - a / 2).toScale() - 2,
          "z-index": $("#" + z.id).css("z-index"),
        }).show();
      }
      return m;
    },
    snapLinkerLine: function (o, m) {
      var q = { v: null, h: null };
      var k = 2;
      for (var h = Model.orderList.length - 1; h >= 0; h--) {
        var n = Model.orderList[h].id;
        var l = Model.getShapeById(n);
        if (l.attribute && l.attribute.collapseBy) {
          continue;
        }
        if (l.name == "linker" || l.parent) {
          continue;
        }
        var f = l.props;
        if (q.h == null) {
          var d = f.y;
          var j = f.y + f.h;
          if (d >= m - k && d <= m + k) {
            q.h = d;
          } else {
            if (j >= m - k && j <= m + k) {
              q.h = j;
            }
          }
        }
        if (q.v == null) {
          var p = f.x;
          var e = f.x + f.w;
          if (p >= o - k && p <= o + k) {
            q.v = p;
          } else {
            if (e >= o - k && e <= o + k) {
              q.v = e;
            }
          }
        }
        if (q.h != null && q.v != null) {
          break;
        }
      }
      this.hideSnapLine();
      var c = $("#designer_canvas");
      if (q.h != null) {
        var g = $(".designer_op_snapline_h");
        if (g.length == 0) {
          g = $("<div class='designer_op_snapline_h'></div>").appendTo(c);
        }
        g.css({
          width: c.width() + Designer.config.pageMargin * 2,
          left: -Designer.config.pageMargin,
          top: Math.round(q.h.toScale()),
          "z-index": Model.orderList.length + 1,
        }).show();
      }
      if (q.v != null) {
        var a = $(".designer_op_snapline_v");
        if (a.length == 0) {
          a = $("<div class='designer_op_snapline_v'></div>").appendTo(c);
        }
        a.css({
          height: c.height() + Designer.config.pageMargin * 2,
          top: -Designer.config.pageMargin,
          left: Math.round(q.v.toScale()),
          "z-index": Model.orderList.length + 1,
        }).show();
      }
      var b = { x: o, y: m };
      if (q.h != null) {
        b.y = q.h;
      }
      if (q.v != null) {
        b.x = q.v;
      }
      return b;
    },
    snapResizeLine: function (m, o, n) {
      var l = m.y;
      var z = m.y + m.h / 2;
      var g = m.y + m.h;
      var f = m.x;
      var v = m.x + m.w / 2;
      var u = m.x + m.w;
      var e = 2;
      var j = { v: null, h: null };
      for (var s = Model.orderList.length - 1; s >= 0; s--) {
        var w = Model.orderList[s].id;
        var b = Model.getShapeById(w);
        if (b.attribute && b.attribute.collapseBy) {
          continue;
        }
        if (b.name == "linker" || o.indexOf(w) >= 0 || b.parent) {
          continue;
        }
        var q = b.props;
        if (j.h == null && (n.indexOf("t") >= 0 || n.indexOf("b") >= 0)) {
          var c = q.y;
          var a = q.y + q.h / 2;
          var h = q.y + q.h;
          if (a >= z - e && a <= z + e) {
            j.h = { type: "middle", y: a };
            if (n.indexOf("t") >= 0) {
              m.h = (g - a) * 2;
              m.y = g - m.h;
            } else {
              m.h = (a - m.y) * 2;
            }
          } else {
            if (n.indexOf("t") >= 0 && c >= l - e && c <= l + e) {
              j.h = { type: "top", y: c };
              m.y = c;
              m.h = g - c;
            } else {
              if (n.indexOf("b") >= 0 && h >= g - e && h <= g + e) {
                j.h = { type: "bottom", y: h };
                m.h = h - l;
              } else {
                if (n.indexOf("t") >= 0 && h >= l - e && h <= l + e) {
                  j.h = { type: "top", y: h };
                  m.y = h;
                  m.h = g - h;
                } else {
                  if (n.indexOf("b") >= 0 && c >= g - e && c <= g + e) {
                    j.h = { type: "bottom", y: c };
                    m.h = c - m.y;
                  }
                }
              }
            }
          }
        }
        if (j.v == null && (n.indexOf("l") >= 0 || n.indexOf("r") >= 0)) {
          var y = q.x;
          var x = q.x + q.w / 2;
          var r = q.x + q.w;
          if (x >= v - e && x <= v + e) {
            j.v = { type: "center", x: x };
            if (n.indexOf("l") >= 0) {
              m.w = (u - x) * 2;
              m.x = u - m.w;
            } else {
              m.w = (x - m.x) * 2;
            }
          } else {
            if (n.indexOf("l") >= 0 && y >= f - e && y <= f + e) {
              j.v = { type: "left", x: y };
              m.x = y;
              m.w = u - y;
            } else {
              if (n.indexOf("r") >= 0 && r >= u - e && r <= u + e) {
                j.v = { type: "right", x: r };
                m.w = r - m.x;
              } else {
                if (n.indexOf("l") >= 0 && r >= f - e && r <= f + e) {
                  j.v = { type: "left", x: r };
                  m.x = r;
                  m.w = u - r;
                } else {
                  if (n.indexOf("r") >= 0 && y >= u - e && y <= u + e) {
                    j.v = { type: "right", x: y };
                    m.w = y - m.x;
                  }
                }
              }
            }
          }
        }
        if (j.h != null && j.v != null) {
          break;
        }
      }
      this.hideSnapLine();
      var d = $("#designer_canvas");
      if (j.h != null) {
        var t = $(".designer_op_snapline_h");
        if (t.length == 0) {
          t = $("<div class='designer_op_snapline_h'></div>").appendTo(d);
        }
        t.css({
          width: d.width() + Designer.config.pageMargin * 2,
          left: -Designer.config.pageMargin,
          top: Math.round(j.h.y.toScale()),
          "z-index": Model.orderList.length + 1,
        }).show();
      }
      if (j.v != null) {
        var k = $(".designer_op_snapline_v");
        if (k.length == 0) {
          k = $("<div class='designer_op_snapline_v'></div>").appendTo(d);
        }
        k.css({
          height: d.height() + Designer.config.pageMargin * 2,
          top: -Designer.config.pageMargin,
          left: Math.round(j.v.x.toScale()),
          "z-index": Model.orderList.length + 1,
        }).show();
      }
      return j;
    },
    drawSnpLine: function (b, g, a, i) {
      i = i ? i : "";
      var c = $("#designer_canvas");
      if (typeof b == "undefined" || typeof b == "undefined") {
        return;
      }
      var e, h;
      if (a) {
        e = Utils.toScale(Utils.copy(b));
        h = Utils.toScale(Utils.copy(g));
      } else {
        e = Utils.copy(b);
        h = Utils.copy(g);
      }
      if (Math.abs(e.x - h.x) < 2) {
        var f = "";
        if (i == "line") {
          f =
            "<span class='text' style='top:" +
            Math.round(h.y - e.y) / 2 +
            "px;'>" +
            Math.round(h.y.restoreScale() - e.y.restoreScale()) +
            "px</span>";
        } else {
          f =
            "<span class='top'><span class='diagraming-icons'>&#xe869;</span></span><span class='bottom'><span class='diagraming-icons'>&#xe86b;</span></span><span class='text' style='top:" +
            Math.round(h.y - e.y) / 2 +
            "px;'>" +
            Math.round(h.y.restoreScale() - e.y.restoreScale()) +
            "px</span>";
        }
        var d = $(
          "<div class='designer_op_snapline_v " + i + "'>" + f + "</div>"
        ).appendTo(c);
        d.css({
          height: Math.round(h.y - e.y),
          left: Math.round(e.x),
          top: Math.round(e.y),
          "z-index": Model.orderList.length + 1,
        });
      } else {
        if (Math.abs(e.y - h.y) < 2) {
          if (i == "line") {
            f =
              "<span class='text'>" +
              Math.round(h.x.restoreScale() - e.x.restoreScale()) +
              "px</span>";
          } else {
            f =
              "<span class='left'><span class='diagraming-icons'>&#xe690;</span></span><span class='right'><span class='diagraming-icons'>&#xe86a;</span></span><span class='text'>" +
              Math.round(h.x.restoreScale() - e.x.restoreScale()) +
              "px</span>";
          }
          var d = $(
            "<div class='designer_op_snapline_h " + i + "'>" + f + "</div>"
          ).appendTo(c);
          d.css({
            width: Math.round(h.x - e.x),
            left: Math.round(e.x),
            top: Math.round(e.y),
            "z-index": Model.orderList.length + 1,
          });
        }
      }
    },
    hideSnapLine: function () {
      $(".designer_op_snapline_h").remove();
      $(".designer_op_snapline_v").remove();
      $("#designer_op_snapline_attach").remove();
    },
    linkDashboard: function (h) {
      var f = 0,
        e = 0;
      var l = null;
      var b = typeof h == "string" ? false : true;
      if (!b) {
        l = Model.getShapeById(h);
        f = l.props.x.toScale() + l.props.w;
        e = l.props.y.toScale();
      } else {
        l = Model.getShapeById(h.from.id);
        f = h.to.x.toScale();
        e = h.to.y.toScale();
      }
      var c = l.category;
      if ($("#panel_" + c).length != 0) {
        var j = $("#shape_dashboard_" + c);
        if (j.length == 0) {
          j = $(
            "<div id='shape_dashboard_" +
              c +
              "' class='shape_dashboard menu'></div>"
          ).appendTo("#designer_canvas");
          function g(p, s) {
            var r =
              "<div class='dashboard_box' shapeName='" +
              p.name +
              "'><canvas title='" +
              p.title +
              "' title_pos='right' class='panel_item' width='" +
              Designer.config.panelItemWidth +
              "' height='" +
              Designer.config.panelItemHeight +
              "'></canvas></div>";
            var o = $(r).appendTo(j);
            if (s) {
              o.append(
                "<div class='group_icon link_shape_icon' group='" +
                  s +
                  "'></div>"
              );
            }
            var q = o.children()[0];
            Designer.painter.drawPanelItem(q, p.name);
          }
          for (var m in Schema.shapes) {
            var i = Schema.shapes[m];
            if (i.category == c) {
              var d = i.attribute;
              var a = i.anchors || [];
              if (d.visible && d.linkable && a.length > 0) {
                if (!i.groupName) {
                  g(i);
                } else {
                  var n = SchemaGroup.getGroup(i.groupName);
                  if (n[0] == i.name) {
                    g(i, i.groupName);
                  }
                }
              }
            }
          }
          j.bind("mousemove", function (o) {
            o.stopPropagation();
          }).bind("mousedown", function (o) {
            o.stopPropagation();
          });
        }
        j.css({ left: f, top: e, "z-index": Model.orderList.length }).show();
        j.find(".link_shape_icon")
          .unbind()
          .bind("mousedown", function (r) {
            r.stopPropagation();
            var q = $(this).attr("group");
            var t = $(this).parent().position();
            var s = j.position();
            var p = t.left + s.left + $(this).parent().outerWidth() - 10;
            var o = t.top + s.top + $(this).parent().outerHeight();
            Designer.op.groupDashboard(q, p, o, function (u) {
              k(u);
              j.hide();
              $(document).unbind("mousedown.dashboard");
            });
          })
          .bind("click", function (o) {
            o.stopPropagation();
          });
        j.children(".dashboard_box")
          .unbind()
          .bind("click", function () {
            j.hide();
            $(document).unbind("mousedown.dashboard");
            var p = $(this);
            var o = p.attr("shapeName");
            if (!b) {
              Designer.op.shapeReplace(o, h);
            } else {
              k(o);
            }
            if ($("#hover_tip").length > 0) {
              $("#hover_tip").remove();
            }
          });
        $(document).bind("mousedown.dashboard", function () {
          j.hide();
          $(document).unbind("mousedown.dashboard");
        });
        function k(I) {
          var o = Schema.shapes[I];
          var s = Utils.getEndpointAngle(h, "to");
          var w = Utils.getAngleDir(s);
          var u = o.getAnchors();
          var t;
          if (w == 1) {
            var C = null;
            for (var A = 0; A < u.length; A++) {
              var y = u[A];
              if (C == null || y.y < C) {
                C = y.y;
                t = y;
              }
            }
          } else {
            if (w == 2) {
              var D = null;
              for (var A = 0; A < u.length; A++) {
                var y = u[A];
                if (D == null || y.x > D) {
                  D = y.x;
                  t = y;
                }
              }
            } else {
              if (w == 3) {
                var B = null;
                for (var A = 0; A < u.length; A++) {
                  var y = u[A];
                  if (B == null || y.y > B) {
                    B = y.y;
                    t = y;
                  }
                }
              } else {
                if (w == 4) {
                  var F = null;
                  for (var A = 0; A < u.length; A++) {
                    var y = u[A];
                    if (F == null || y.x < F) {
                      F = y.x;
                      t = y;
                    }
                  }
                }
              }
            }
          }
          var E = Model.create(I, h.to.x - t.x, h.to.y - t.y);
          Designer.painter.renderShape(E);
          MessageSource.beginBatch();
          if (E.onCreated) {
            E.onCreated();
          }
          var q = [];
          for (var z = Model.orderList.length - 1; z >= 0; z--) {
            var H = Model.orderList[z].id;
            var o = Model.getShapeById(H);
            if (o.attribute && o.attribute.collapseBy) {
              continue;
            }
            if (o.name == "linker" || o.parent) {
              continue;
            }
            var G = Utils.getControlBox([H]);
            G.id = H;
            q.push(G);
          }
          var v = E.props;
          var x = Designer.op.snapLine(v, [E.id], true, E, q);
          if (x.container) {
            E.container = x.container.id;
          }
          Designer.events.push("created", E);
          Model.add(E);
          var r = Utils.getPointAngle(E.id, h.to.x, h.to.y, 7);
          h.to.id = E.id;
          h.to.angle = r;
          Designer.painter.renderLinker(h, true);
          Model.update(h);
          MessageSource.commit();
          Utils.unselect();
          Utils.selectShape(E.id);
          Designer.op.editShapeText(E);
          Designer.op.hideSnapLine();
          Designer.op.changeCanvas(E.props);
          Designer.events.push("linkerCreated", h);
        }
      }
    },
    groupDashboard: function (k, d, j, c) {
      $(".group_dashboard").hide();
      var h = $("#shape_group_dashboard_" + k);
      if (h.length == 0) {
        h = $(
          "<div id='shape_group_dashboard_" +
            k +
            "' class='group_dashboard menu'></div>"
        ).appendTo("#designer_canvas");
        var l = SchemaGroup.getGroup(k);
        for (var e = 0; e < l.length; e++) {
          var a = l[e];
          var g = Schema.shapes[a];
          if (g.attribute.visible) {
            var f = $(
              "<div class='dashboard_box' shapeName='" +
                a +
                "'><canvas title='" +
                g.title +
                "' title_pos='right' width='" +
                Designer.config.panelItemWidth +
                "' height='" +
                Designer.config.panelItemHeight +
                "'></canvas></div>"
            ).appendTo(h);
            var b = f.children("canvas")[0];
            Designer.painter.drawPanelItem(b, g.name);
          }
        }
        h.bind("mousedown", function (i) {
          i.stopPropagation();
        });
      }
      h.css({ left: d, top: j, "z-index": Model.orderList.length + 1 }).show();
      $(".dashboard_box")
        .unbind()
        .bind("click", function () {
          var i = $(this).attr("shapeName");
          c(i);
          h.hide();
          $(document).unbind("mousedown.group_dashboard");
        });
      $(document).bind("mousedown.group_dashboard", function () {
        h.hide();
        $(document).unbind("mousedown.group_dashboard");
      });
      return h;
    },
    showPanelGroup: function (m, a, g) {
      a.stopPropagation();
      var h = $("#group_dashboard_" + m);
      $(".group_dashboard").hide();
      if (h.length == 0) {
        h = $(
          "<div id='group_dashboard_" +
            m +
            "' class='group_dashboard menu'></div>"
        ).appendTo("#designer");
        var n = SchemaGroup.getGroup(m);
        for (var e = 0; e < n.length; e++) {
          var b = n[e];
          var j = Schema.shapes[b];
          if (j.attribute.visible) {
            var f = $(
              "<div class='panel_box' shapeName='" +
                b +
                "'><canvas title='" +
                j.title +
                "' title_pos='right' width='" +
                Designer.config.panelItemWidth +
                "' height='" +
                Designer.config.panelItemHeight +
                "'></canvas></div>"
            ).appendTo(h);
            var c = f.children("canvas")[0];
            Designer.painter.drawPanelItem(c, j.name);
          }
        }
        h.css("position", "fixed");
      }
      var l = $(g).parent();
      var d = l.offset();
      h.show();
      var k = d.top + l.outerHeight() - 2;
      if (k + h.outerHeight() > $(window).height()) {
        k = $(window).height() - h.outerHeight();
      }
      h.css({ left: d.left - 5, top: k });
      $(document).bind("mousedown.group_board", function () {
        h.hide();
        $(document).unbind("mousedown.group_board");
      });
    },
    changeShapeProps: function (g, h, e) {
      function b(j) {
        if (typeof h.x != "undefined") {
          j.x += h.x - g.props.x;
        }
        if (typeof h.y != "undefined") {
          j.y += h.y - g.props.y;
        }
        if (
          typeof h.w != "undefined" ||
          typeof h.h != "undefined" ||
          typeof h.angle != "undefined"
        ) {
          var r = $.extend({}, g.props, h);
          var q = {
            x: g.props.x + g.props.w / 2,
            y: g.props.y + g.props.h / 2,
          };
          var m = Utils.getRotated(q, j, -g.props.angle);
          var l = g.props.w;
          var o = g.props.h;
          if (typeof h.w != "undefined") {
            j.x = g.props.x + ((m.x - g.props.x) / g.props.w) * h.w;
            l = h.w;
          } else {
            j.x = m.x;
          }
          if (typeof h.h != "undefined") {
            j.y = g.props.y + ((m.y - g.props.y) / g.props.h) * h.h;
            o = h.h;
          } else {
            j.y = m.y;
          }
          var k = { x: g.props.x + l / 2, y: g.props.y + o / 2 };
          var n = Utils.getRotated(k, j, r.angle);
          j.x = n.x;
          j.y = n.y;
        }
        if (typeof h.angle != "undefined") {
          j.angle += h.angle - g.props.angle;
        }
      }
      var c = [];
      var e = e || [];
      var i = Model.getShapeLinkers(g.id);
      if (i && i.length > 0) {
        for (var f = 0; f < i.length; f++) {
          var a = i[f];
          var d = Model.getShapeById(a);
          if (g.id == d.from.id && e.indexOf(d.id) < 0) {
            b(d.from);
          }
          if (g.id == d.to.id && e.indexOf(d.id) < 0) {
            b(d.to);
          }
          if (e.indexOf(d.id) < 0) {
            c.push(d.id);
          }
        }
      }
      $.extend(g.props, h);
      Designer.painter.renderShape(g);
      Utils.showLinkerCursor();
      UI.showShapeOptions();
      return c;
    },
    googleImgCallback: function (e) {
      var c = e.responseData;
      var b = c.results;
      for (var a = 0; a < b.length; a++) {
        var d = b[a];
        UI.appendGoogleImage(d);
      }
      $("#google_image_items").append("<div style='clear: both'></div>");
      $(".img_gg_loading_tip").remove();
      $(".gg_img_more").remove();
      if (this.searchIndex <= 3) {
        $("#google_image_items").append(
          "<div onclick='UI.loadGoogleImg()' class='gg_img_more toolbar_button active'>显示更多结果...</div>"
        );
      }
    },
    scrollStv: null,
    scrollIsOver: false,
    scrollLayout: null,
    scrollPos: {},
    initScrollPos: function () {
      var a = $("#designer");
      this.scrollLayout = $("#designer_layout");
      this.scrollPos.b = a.height() + a.offset().top - 30;
      this.scrollPos.t = a.offset().top + 20;
      this.scrollPos.l = a.find("#shape_panel").width() + 20;
      this.scrollPos.r = a.width() - 20;
    },
    isScroll: function (a, c) {
      var b = this;
      if (a < b.scrollPos.l) {
        b.startScroll("l");
      } else {
        if (a > b.scrollPos.r) {
          b.startScroll("r");
        } else {
          if (c < b.scrollPos.t) {
            b.startScroll("t");
          } else {
            if (c > b.scrollPos.b) {
              b.startScroll("b");
            } else {
              if (b.scrollIsOver) {
                b.stopScroll();
              }
            }
          }
        }
      }
    },
    stopScroll: function () {
      var a = this;
      window.clearInterval(a.scrollStv);
      a.scrollStv = null;
      a.scrollIsOver = false;
    },
    startScroll: function (b) {
      var a = this;
      if (a.scrollIsOver) {
        return;
      }
      a.scrollIsOver = true;
      a.scrollStv = setInterval(function () {
        a.scrolling(b);
      }, 20);
    },
    scrolling: function (c) {
      var b = this,
        a = b.scrollLayout;
      switch (c) {
        case "t":
          a.scrollTop(a.scrollTop() - 5);
          break;
        case "b":
          a.scrollTop(a.scrollTop() + 5);
          break;
        case "l":
          break;
        case "r":
          a.scrollLeft(a.scrollLeft() + 5);
          break;
      }
    },
    uploading: false,
    uploadImage: function (b, c) {
      var a = this;
      if (a.uploading) {
        return;
      }
      a.uploading = true;
      $.ajax({
        url: "/mindmap/uploadimage",
        type: "post",
        data: { id: chartId, img: b },
        success: function (d) {
          a.uploading = false;
          if (c != null) {
            c(d);
          }
        },
        error: function () {
          a.uploading = false;
        },
      });
    },
    changeCanvas: function (e) {
      if (Model.define.page.orientation == "portrait") {
        var d = Model.define.page.width;
        var g = Model.define.page.height;
        var a = e.x;
        var f = e.y;
        var b = e.w;
        var c = e.h;
        if (a + b > d) {
          Designer.setPageStyle({ width: Math.floor(a + b) + 30 });
        }
        if (f + c > g) {
          Designer.setPageStyle({ height: Math.floor(f + c) + 30 });
        }
      }
    },
  },
  events: {
    push: function (c, a) {
      var b = this.listeners[c];
      if (b) {
        return b(a);
      }
      return null;
    },
    listeners: {},
    addEventListener: function (b, a) {
      this.listeners[b] = a;
    },
  },
  clipboard: {
    elements: [],
    presetedIds: {},
    presetIds: function () {
      this.presetedIds = {};
      for (var b = 0; b < this.elements.length; b++) {
        var a = this.elements[b];
        this.presetedIds[a.id] = Utils.newId();
        if (a.group && !this.presetedIds[a.group]) {
          this.presetedIds[a.group] = Utils.newId();
        }
      }
      localStorage.presetedIds = JSON.stringify(this.presetedIds);
    },
    plus: true,
    copy: function () {
      this.elements = [];
      var d = Utils.getSelected();
      var c = Utils.getFamilyShapes(d);
      d = d.concat(c);
      d.sort(function e(g, f) {
        return g.props.zindex - f.props.zindex;
      });
      for (var b = 0; b < d.length; b++) {
        var a = Utils.copy(d[b]);
        if (a.name == "linker") {
          if (a.from.id != null) {
            if (!Utils.isSelected(a.from.id)) {
              a.from.id = null;
              a.from.angle = null;
            }
          }
          if (a.to.id != null) {
            if (!Utils.isSelected(a.to.id)) {
              a.to.id = null;
              a.to.angle = null;
            }
          }
        }
        this.elements.push(a);
      }
      this.elements.sort(function e(g, f) {
        return g.props.zindex - f.props.zindex;
      });
      this.presetIds();
      this.plus = true;
      Designer.events.push("clipboardChanged", this.elements.length);
      localStorage.clipboard = JSON.stringify(this.elements);
      localStorage.clientId = CLB.clientId;
    },
    cut: function () {
      this.copy();
      Designer.op.removeShape();
      this.plus = false;
    },
    paste: function (n, m) {
      if (localStorage.clipboard) {
        var e = JSON.parse(localStorage.clipboard);
        var c = localStorage.clientId;
        if (CLB.clientId != c) {
          this.elements = e;
          for (var w = 0; w < this.elements.length; w++) {
            var a = this.elements[w];
            if (a.name != "linker") {
              Schema.initShapeFunctions(a);
            }
          }
          this.presetedIds = JSON.parse(localStorage.presetedIds);
          if (typeof n == "undefined") {
            var b = $("#designer_layout").scrollTop();
            var k =
              b -
              Designer.config.pageMargin +
              $("#designer_layout").height().restoreScale() / 2;
            var t = $("#designer_layout").scrollLeft();
            var l =
              t -
              Designer.config.pageMargin +
              $("#designer_layout").width().restoreScale() / 2;
            n = l;
            m = k;
          }
        }
      }
      if (this.elements.length > 0) {
        var A = 20;
        var z = 20;
        if (typeof n != "undefined") {
          var g = Utils.getShapesBounding(this.elements);
          A = n - g.x - g.w / 2;
          z = m - g.y - g.h / 2;
        }
        var h = [];
        var d = [];
        for (var w = 0; w < this.elements.length; w++) {
          var a = this.elements[w];
          if (a.name != "linker") {
            var C;
            var a = this.elements[w];
            a.props.zindex = Model.maxZIndex + (w + 1);
            var q = this.presetedIds[a.id];
            if (this.plus || typeof n != "undefined") {
              a.props.x += A;
              a.props.y += z;
            }
            C = Utils.copy(a);
            for (var v = 0; v < C.dataAttributes.length; v++) {
              var s = C.dataAttributes[v];
              s.id = Utils.newId();
            }
            C.id = q;
            if (C.children) {
              for (var o = 0; o < C.children.length; o++) {
                var u = C.children[o];
                C.children[o] = this.presetedIds[u];
              }
            }
            if (C.parent) {
              C.parent = this.presetedIds[C.parent];
            }
            h.push(C);
            d.push(q);
            if (a.group) {
              var f = this.presetedIds[a.group];
              C.group = f;
            }
          }
        }
        for (var w = 0; w < this.elements.length; w++) {
          var a = this.elements[w];
          if (a.name == "linker") {
            var C;
            a.props.zindex = Model.maxZIndex + (w + 1);
            var q = this.presetedIds[a.id];
            if (this.plus || typeof n != "undefined") {
              a.from.x += A;
              a.from.y += z;
              a.to.x += A;
              a.to.y += z;
              for (var B = 0; B < a.points.length; B++) {
                var r = a.points[B];
                r.x += A;
                r.y += z;
              }
            }
            C = Utils.copy(a);
            if (!C.dataAttributes) {
              C.dataAttributes = [];
            }
            for (var v = 0; v < C.dataAttributes.length; v++) {
              var s = C.dataAttributes[v];
              s.id = Utils.newId();
            }
            if (a.from.id != null) {
              C.from.id = this.presetedIds[a.from.id];
            }
            if (a.to.id != null) {
              C.to.id = this.presetedIds[a.to.id];
            }
            if (a.textPos != null) {
              delete C.textPos;
            }
            C.id = q;
            h.push(C);
            d.push(q);
            if (a.group) {
              var f = this.presetedIds[a.group];
              C.group = f;
            }
          }
        }
        Model.addMulti(h);
        for (var w = 0; w < h.length; w++) {
          var a = h[w];
          Designer.painter.renderShape(a);
        }
        Model.build();
        this.presetIds();
        Utils.unselect();
        Utils.selectShape(d);
        this.plus = true;
        Util.shapesCount();
      }
    },
    duplicate: function () {
      this.copy();
      this.paste();
    },
    brush: function () {
      var g = Utils.getSelected();
      if (g.length == 0) {
        return;
      }
      var a = {
        fontStyle: {},
        lineStyle: {},
        fillStyle: null,
        shapeStyle: null,
      };
      for (var f = 0; f < g.length; f++) {
        var c = g[f];
        if (c.name == "linker") {
          $.extend(a.lineStyle, c.lineStyle);
          $.extend(a.fontStyle, c.fontStyle);
        } else {
          if (a.fillStyle == null) {
            a.fillStyle = {};
          }
          if (a.shapeStyle == null) {
            a.shapeStyle = {};
          }
          var e = Utils.getGridSelectedCells();
          if (e.length > 0) {
            for (var d = 0; d < e.length; d++) {
              var b = e[d].textBlock;
              var h = e[d].path;
              $.extend(a.fontStyle, b.fontStyle);
              $.extend(a.fillStyle, h.fillStyle);
            }
          } else {
            $.extend(a.lineStyle, c.lineStyle);
            $.extend(a.fontStyle, c.fontStyle);
            $.extend(a.shapeStyle, c.shapeStyle);
            $.extend(a.fillStyle, c.fillStyle);
          }
        }
      }
      delete a.fontStyle.orientation;
      $("#bar_brush").button("select");
      UI.showTip("选择目标图形并使用格式刷样式，Esc取消", "left", function () {
        $("#bar_brush").button("unselect");
        $(document).unbind("keydown.cancelbrush");
        Utils.selectCallback = null;
        $("#bar_brush").button("disable");
      });
      $(document)
        .unbind("keydown.cancelbrush")
        .bind("keydown.cancelbrush", function (i) {
          if (i.keyCode == 27) {
            UI.hideTip();
            $("#bar_brush").button("unselect");
            $(document).unbind("keydown.cancelbrush");
            Utils.selectCallback = null;
            $("#bar_brush").button("disable");
          }
        });
      Utils.selectCallback = function () {
        var o = Utils.getSelected();
        for (var p = 0; p < o.length; p++) {
          var l = o[p];
          if (l.category == "grid") {
            var n = Utils.getGridSelectedCells();
            if (n.length > 0) {
              for (var m = 0; m < n.length; m++) {
                var k = n[m].textBlock;
                var q = n[m].path;
                k.fontStyle = a.fontStyle;
                q.fillStyle = a.fillStyle;
              }
            }
          } else {
            $.extend(l.lineStyle, a.lineStyle);
            $.extend(l.fontStyle, a.fontStyle);
            if (l.name != "linker") {
              l.lineStyle = a.lineStyle;
              delete l.lineStyle.beginArrowStyle;
              delete l.lineStyle.endArrowStyle;
              if (a.fillStyle != null) {
                l.fillStyle = a.fillStyle;
              }
              if (a.shapeStyle != null) {
                l.shapeStyle = a.shapeStyle;
              }
            } else {
              if (l.fontStyle) {
                delete l.fontStyle.vAlign;
              }
            }
          }
          if (l.name != "linker") {
            Schema.initShapeFunctions(l);
          }
          Designer.painter.renderShape(l);
        }
        Model.updateMulti(o);
      };
    },
  },
  addFunction: function (b, a) {
    if (Designer[b]) {
      throw "Duplicate function name!";
    } else {
      this[b] = a;
    }
  },
  painter: {
    actions: {
      move: function (a) {
        this.moveTo(a.x, a.y);
        this.prePoint = a;
        if (this.beginPoint == null) {
          this.beginPoint = a;
        }
      },
      line: function (d) {
        if (
          typeof this.webkitLineDash != "undefined" &&
          typeof this.lineDashOffset == "undefined" &&
          this.lineWidth != 0
        ) {
          var f = this.webkitLineDash;
          var c = this.prePoint;
          var h = Utils.measureDistance(c, d);
          var k = 0;
          var b = 1 / h;
          var j = c;
          var e = 0;
          var g = true;
          while (k < 1) {
            k += b;
            if (k > 1) {
              k = 1;
            }
            var i = { x: (1 - k) * c.x + k * d.x, y: (1 - k) * c.y + k * d.y };
            var a = Utils.measureDistance(j, i);
            if (a >= f[e] || k >= 1) {
              if (g) {
                this.lineTo(i.x, i.y);
              } else {
                this.moveTo(i.x, i.y);
              }
              g = !g;
              j = i;
              e++;
              if (e >= f.length) {
                e = 0;
              }
            }
          }
          this.moveTo(d.x, d.y);
        } else {
          this.lineTo(d.x, d.y);
        }
        this.prePoint = d;
        if (this.beginPoint == null) {
          this.beginPoint = d;
        }
      },
      curve: function (e) {
        if (
          typeof this.webkitLineDash != "undefined" &&
          typeof this.lineDashOffset == "undefined" &&
          this.lineWidth != 0
        ) {
          var g = this.webkitLineDash;
          var d = this.prePoint;
          var i = Utils.measureDistance(d, e);
          var n = 0;
          var b = 1 / i;
          var l = d;
          var f = 0;
          var h = true;
          var c = 0;
          while (n < 1) {
            n += b;
            if (n > 1) {
              n = 1;
            }
            var k = {
              x:
                d.x * Math.pow(1 - n, 3) +
                e.x1 * n * Math.pow(1 - n, 2) * 3 +
                e.x2 * Math.pow(n, 2) * (1 - n) * 3 +
                e.x * Math.pow(n, 3),
              y:
                d.y * Math.pow(1 - n, 3) +
                e.y1 * n * Math.pow(1 - n, 2) * 3 +
                e.y2 * Math.pow(n, 2) * (1 - n) * 3 +
                e.y * Math.pow(n, 3),
            };
            var a = Utils.measureDistance(l, k);
            if (a >= g[f] || n >= 1) {
              if (h) {
                var m = c + (n - c) / 2;
                var j = {
                  x:
                    d.x * Math.pow(1 - m, 3) +
                    e.x1 * m * Math.pow(1 - m, 2) * 3 +
                    e.x2 * Math.pow(m, 2) * (1 - m) * 3 +
                    e.x * Math.pow(m, 3),
                  y:
                    d.y * Math.pow(1 - m, 3) +
                    e.y1 * m * Math.pow(1 - m, 2) * 3 +
                    e.y2 * Math.pow(m, 2) * (1 - m) * 3 +
                    e.y * Math.pow(m, 3),
                };
                this.lineTo(j.x, j.y);
                this.lineTo(k.x, k.y);
              } else {
                this.moveTo(k.x, k.y);
              }
              h = !h;
              l = k;
              c = n;
              f++;
              if (f >= g.length) {
                f = 0;
              }
            }
          }
          this.moveTo(e.x, e.y);
        } else {
          this.bezierCurveTo(e.x1, e.y1, e.x2, e.y2, e.x, e.y);
        }
        this.prePoint = e;
        if (this.beginPoint == null) {
          this.beginPoint = e;
        }
      },
      quadraticCurve: function (e) {
        if (
          typeof this.webkitLineDash != "undefined" &&
          typeof this.lineDashOffset == "undefined" &&
          this.lineWidth != 0
        ) {
          var g = this.webkitLineDash;
          var d = this.prePoint;
          var i = Utils.measureDistance(d, e);
          var n = 0;
          var b = 1 / i;
          var l = d;
          var f = 0;
          var h = true;
          var c = 0;
          while (n < 1) {
            n += b;
            if (n > 1) {
              n = 1;
            }
            var k = {
              x:
                d.x * Math.pow(1 - n, 2) +
                e.x1 * n * (1 - n) * 2 +
                e.x * Math.pow(n, 2),
              y:
                d.y * Math.pow(1 - n, 2) +
                e.y1 * n * (1 - n) * 2 +
                e.y * Math.pow(n, 2),
            };
            var a = Utils.measureDistance(l, k);
            if (a >= g[f] || n >= 1) {
              if (h) {
                var m = c + (n - c) / 2;
                var j = {
                  x:
                    d.x * Math.pow(1 - m, 2) +
                    e.x1 * m * (1 - m) * 2 +
                    e.x * Math.pow(m, 2),
                  y:
                    d.y * Math.pow(1 - m, 2) +
                    e.y1 * m * (1 - m) * 2 +
                    e.y * Math.pow(m, 2),
                };
                this.lineTo(j.x, j.y);
                this.lineTo(k.x, k.y);
              } else {
                this.moveTo(k.x, k.y);
              }
              h = !h;
              l = k;
              c = n;
              f++;
              if (f >= g.length) {
                f = 0;
              }
            }
          }
          this.moveTo(e.x, e.y);
        } else {
          this.quadraticCurveTo(e.x1, e.y1, e.x, e.y);
        }
        this.prePoint = e;
        if (this.beginPoint == null) {
          this.beginPoint = e;
        }
      },
      close: function () {
        if (
          typeof this.webkitLineDash != "undefined" &&
          typeof this.lineDashOffset == "undefined" &&
          this.lineWidth != 0
        ) {
          var f = this.webkitLineDash;
          var c = this.prePoint;
          var d = this.beginPoint;
          var h = Utils.measureDistance(c, d);
          var k = 0;
          var b = 1 / h;
          var j = c;
          var e = 0;
          var g = true;
          while (k < 1) {
            k += b;
            if (k > 1) {
              k = 1;
            }
            var i = { x: (1 - k) * c.x + k * d.x, y: (1 - k) * c.y + k * d.y };
            var a = Utils.measureDistance(j, i);
            if (a >= f[e] || k >= 1) {
              if (g) {
                this.lineTo(i.x, i.y);
              } else {
                this.moveTo(i.x, i.y);
              }
              g = !g;
              j = i;
              e++;
              if (e >= f.length) {
                e = 0;
              }
            }
          }
        }
        this.closePath();
      },
      rect: function (c, b, a) {
        b = b || { color: "255,255,255" };
        a = a || {};
        this.fillStyle = "rgb(" + b.color + ")";
        this.fillRect(c.x, c.y, c.w, c.h);
        this.strokeStyle = "rgb(" + a.lineColor + ")";
        this.lineWidth = a.lineWidth;
        this.strokeRect(c.x, c.y, c.w, c.h);
      },
    },
    setLineDash: function (a, b) {
      if (!a.setLineDash) {
        a.setLineDash = function () {};
      }
      a.setLineDash(b);
      a.mozDash = b;
      a.webkitLineDash = b;
    },
    renderShapePath: function (a, b, c, d, e) {
      var f;
      if (c && b.drawIcon) {
        f = b.drawIcon(b.props.w, b.props.h);
      } else {
        f = b.getPath();
      }
      if (e) {
        c = e;
      }
      this.renderPath(a, b, f, c, d);
    },
    renderPath: function (n, l, p, b, f) {
      var a = Utils.getShapeFillStyle(l.fillStyle, !b);
      var q = Utils.getShapeLineStyle(l.lineStyle, !b);
      for (var g = 0; g < p.length; g++) {
        var c = p[g];
        n.save();
        var h = $.extend({}, q, c.lineStyle);
        var m = $.extend({}, a, c.fillStyle);
        if (l.category == "grid") {
          for (var e = 0, k = c.actions.length; e < k; e++) {
            var o = c.actions[e];
            if (!b && o.action == "rect") {
              l.theme = l.theme || {};
              if (l.theme.name == "header") {
                if (c.row == 0) {
                  if (a.color == "255,255,255") {
                    m = $.extend(
                      {},
                      { type: "solid", color: "240, 240, 240" },
                      l.theme.row[0].fillStyle,
                      c.fillStyle
                    );
                  } else {
                    m = $.extend({}, a, l.theme.row[0].fillStyle, c.fillStyle);
                  }
                } else {
                  m = $.extend({}, a, l.theme.row[1].fillStyle, c.fillStyle);
                }
              } else {
                if (l.theme.name == "striping") {
                  if (l.theme.row) {
                    if (a.color == "255,255,255") {
                      m = $.extend(
                        {},
                        { type: "solid", color: "240, 240, 240" },
                        l.theme.row[c.row % 2].fillStyle,
                        c.fillStyle
                      );
                    } else {
                      m = $.extend(
                        {},
                        a,
                        l.theme.row[c.row % 2].fillStyle,
                        c.fillStyle
                      );
                    }
                  }
                  if (l.theme.column) {
                    if (a.color == "255,255,255") {
                      m = $.extend(
                        {},
                        { type: "solid", color: "240, 240, 240" },
                        l.theme.column[c.column % 2].fillStyle,
                        c.fillStyle
                      );
                    } else {
                      m = $.extend(
                        {},
                        a,
                        l.theme.column[c.column % 2].fillStyle,
                        c.fillStyle
                      );
                    }
                  }
                }
              }
            }
            this.actions[o.action].call(n, o, m, h);
          }
          continue;
        }
        var d = false;
        if (
          h.lineStyle != "solid" &&
          typeof n.lineDashOffset == "undefined" &&
          m.type != "none"
        ) {
          d = true;
        }
        if (d) {
          n.save();
          n.beginPath();
          n.lineWidth = 0;
          delete n.webkitLineDash;
          for (var e = 0; e < c.actions.length; e++) {
            var o = c.actions[e];
            this.actions[o.action].call(n, o);
          }
          this.fillShape(l, n, m, f);
          n.restore();
        }
        n.beginPath();
        n.beginPoint = null;
        if (h.lineWidth) {
          n.lineWidth = h.lineWidth;
          if (h.lineStyle == "dashed") {
            if (b) {
              this.setLineDash(n, [h.lineWidth * 3, h.lineWidth * 1]);
            } else {
              this.setLineDash(n, [h.lineWidth * 5, h.lineWidth * 2]);
            }
          } else {
            if (h.lineStyle == "dot") {
              this.setLineDash(n, [h.lineWidth, h.lineWidth * 1.5]);
            } else {
              if (h.lineStyle == "dashdot") {
                this.setLineDash(n, [
                  h.lineWidth * 5,
                  h.lineWidth * 2,
                  h.lineWidth,
                  h.lineWidth * 2,
                ]);
              } else {
                delete n.webkitLineDash;
              }
            }
          }
        } else {
          n.lineWidth = 0;
          delete n.webkitLineDash;
        }
        for (var e = 0; e < c.actions.length; e++) {
          var o = c.actions[e];
          if (h.lineWidth == 1) {
            o.x += 0.5;
            o.y += 0.5;
          }
          this.actions[o.action].call(n, o);
        }
        if (d == false) {
          this.fillShape(l, n, m, f);
        }
        if (h.lineWidth) {
          n.lineWidth = h.lineWidth;
          n.strokeStyle = "rgb(" + h.lineColor + ")";
          n.stroke();
        }
        n.restore();
      }
    },
    drawImage: function (a, b) {
      var c = $(".shape_img[src='" + b.image + "']");
      if (c.length == 0) {
        c = $("<img class='shape_img' loaded='0' src=''/>").appendTo(
          "#shape_img_container"
        );
        c.bind("load.drawshape", function () {
          a.drawImage(c[0], b.x, b.y, b.w, b.h);
          $(this).attr("loaded", "1");
        });
        c.attr("src", b.image);
      } else {
        if (c.attr("loaded") == "0") {
          c.bind("load.drawshape", function () {
            a.drawImage(c[0], b.x, b.y, b.w, b.h);
          });
        } else {
          a.drawImage(c[0], b.x, b.y, b.w, b.h);
        }
      }
    },
    drawPanelItem: function (c, h) {
      var j = c.getContext("2d");
      var f = Utils.copy(Schema.shapes[h]);
      var i = Designer.config.panelItemWidth,
        e = Designer.config.panelItemHeight;
      if (
        f.category == "ui" ||
        f.category == "ui_input" ||
        f.category.indexOf("ios_") >= 0 ||
        f.category.indexOf("andriod_") >= 0
      ) {
        i = 30;
        e = 30;
      }
      var g = { x: 0, y: 0, w: f.props.w, h: f.props.h, angle: f.props.angle };
      j.clearRect(0, 0, i, e);
      if (g.w >= i || g.h >= i) {
        var d = Utils.getShapeLineStyle(f.lineStyle, false);
        if (f.props.w >= f.props.h) {
          g.w = i - d.lineWidth * 2;
          g.h = parseInt((f.props.h / f.props.w) * g.w);
        } else {
          g.h = e - d.lineWidth * 2;
          g.w = parseInt((f.props.w / f.props.h) * g.h);
        }
      }
      f.props = g;
      j.save();
      j.lineJoin = "round";
      j.globalAlpha = f.shapeStyle.alpha;
      var b = (i - g.w) / 2;
      var a = (e - g.h) / 2;
      j.translate(b, a);
      j.translate(g.w / 2, g.h / 2);
      j.rotate(g.angle);
      j.translate(-(g.w / 2), -(g.h / 2));
      this.renderShapePath(j, f, true, function () {
        Designer.painter.drawPanelItem(c, h);
      });
      this.renderMarkers(j, f, true);
      j.restore();
    },
    drawPanelItemByShape: function (canvas, myshape, config) {
      var myshape = Utils.copy(myshape);
      var ctx = canvas.getContext("2d");
      var itemW = Designer.config.panelItemWidth - 2,
        itemH = Designer.config.panelItemHeight - 2;
      var padding = 1,
        isPanel = true;
      if (config) {
        itemW = config.width - 2;
        itemH = config.height - 2;
        padding = config.padding;
        isPanel = config.isPanel == false ? false : true;
      }
      var boxPos = { x: 0, y: 0, w: myshape.boxPos.w, h: myshape.boxPos.h };
      var scale = 1;
      if (myshape.boxPos.w >= myshape.boxPos.h) {
        if (myshape.boxPos.w > itemW) {
          scale = itemW / myshape.boxPos.w;
          boxPos.w = itemW;
          boxPos.h = parseInt((myshape.boxPos.h / myshape.boxPos.w) * boxPos.w);
        }
      } else {
        if (myshape.boxPos.h > itemH) {
          scale = itemH / myshape.boxPos.h;
          boxPos.h = itemH;
          boxPos.w = parseInt((myshape.boxPos.w / myshape.boxPos.h) * boxPos.h);
        }
      }
      myshape.boxPos = boxPos;
      var imgNum = 0;
      for (var i = 0; i < myshape.elements.length; i++) {
        var shape = myshape.elements[i];
        if (shape.name != "linker") {
          if (shape.fillStyle.type == "image") {
            imgNum++;
          }
        }
        if (imgNum > 10) {
          myshape.elements.splice(i, 1);
        }
      }
      for (var i = 0; i < myshape.elements.length; i++) {
        var shape = myshape.elements[i];
        if (shape.name == "linker") {
          shape.from = resetPos(shape.from);
          shape.to = resetPos(shape.to);
          if (shape.linkerType == "broken" || shape.linkerType == "curve") {
            for (var j = 0; j < shape.points.length; j++) {
              shape.points[j] = resetPos(shape.points[j]);
            }
          }
          ctx.save();
          ctx.lineJoin = "round";
          if (isPanel) {
            shape.lineStyle.lineWidth =
              shape.lineStyle.lineWidth > 0.5 ? shape.lineStyle.lineWidth : 0.5;
          } else {
            shape.lineStyle.lineWidth = 0.5;
          }
          if (!shape.lineStyle.lineColor) {
            shape.lineStyle.lineColor = "50,50,50";
          }
          Designer.painter.renderPanelLinker(ctx, shape);
          ctx.restore();
        } else {
          var props = {
            x: shape.props.x * scale,
            y: shape.props.y * scale,
            w: shape.props.w * scale,
            h: shape.props.h * scale,
            angle: shape.props.angle,
          };
          shape.props = props;
          ctx.save();
          ctx.lineJoin = "round";
          ctx.globalAlpha = shape.shapeStyle.alpha;
          var translateX = (itemW - boxPos.w) / 2 + shape.props.x;
          var translateY = (itemH - boxPos.h) / 2 + shape.props.y;
          ctx.translate(translateX + padding, translateY + padding);
          ctx.translate(props.w / 2, props.h / 2);
          ctx.rotate(props.angle);
          ctx.translate(-(props.w / 2), -(props.h / 2));
          if (isPanel) {
            shape.lineStyle.lineWidth =
              shape.lineStyle.lineWidth > 1 ? shape.lineStyle.lineWidth : 1;
          } else {
            shape.lineStyle.lineWidth = 1;
          }
          if (shape.name == "verticalPool") {
            shape.drawIcon = function (w, h) {
              w += 8;
              var x = -4;
              return [
                {
                  fillStyle: { type: "none" },
                  actions: [
                    { action: "move", x: x, y: 0 },
                    { action: "line", x: w, y: 0 },
                    { action: "line", x: w, y: h },
                    { action: "line", x: x, y: h },
                    { action: "close" },
                  ],
                },
                {
                  actions: [
                    { action: "move", x: x, y: 0 },
                    { action: "line", x: w, y: 0 },
                    { action: "line", x: w, y: 4 },
                    { action: "line", x: x, y: 4 },
                    { action: "close" },
                  ],
                },
                {
                  actions: [
                    { action: "move", x: (x + w) / 2, y: 4 },
                    { action: "line", x: (x + w) / 2, y: h },
                  ],
                },
              ];
            };
          }
          if (shape.name.indexOf("Lane") > -1) {
            shape.getPath = shape.getPath.toString().replace(/30/g, 30 * scale);
            shape.getPath = eval(
              "(function(){return " + shape.getPath + " })()"
            );
          }
          if (shape.name.indexOf("Separator") > -1) {
            shape.getPath = shape.getPath.toString().replace(/20/g, 20 * scale);
            shape.getPath = eval(
              "(function(){return " + shape.getPath + " })()"
            );
          }
          if (shape.name.indexOf("note") > -1) {
            shape.getPath = shape.getPath.toString().replace(/16/g, 16 * scale);
            shape.getPath = eval(
              "(function(){return " + shape.getPath + " })()"
            );
          }
          if (shape.name == "text") {
            shape.path[0].lineStyle.lineWidth = 1;
            Schema.initShapeFunctions(shape);
          }
          if (!(shape.name.indexOf("Pool") > -1 && shape.children.length > 0)) {
            this.renderShapePath(
              ctx,
              shape,
              false,
              function () {
                Designer.painter.drawPanelItemByShape(canvas, myshape, config);
              },
              isPanel
            );
          }
          this.renderMarkers(ctx, shape, true);
          ctx.restore();
        }
      }
      function resetPos(pos) {
        pos.x = (pos.x * scale + (itemW - boxPos.w) / 2 + padding) / 2;
        pos.y = (pos.y * scale + (itemH - boxPos.h) / 2 + padding) / 2;
        return Utils.copy(pos);
      }
    },
    renderPanelLinker: function (m, k) {
      if (k.linkerType == "curve" || k.linkerType == "broken") {
        if (!k.points || k.points.length == 0) {
          k.points = Utils.getLinkerPoints(k);
        }
      }
      var q = k.points;
      var n = Utils.copy(k.from);
      var b = Utils.copy(k.to);
      var j = Utils.isMac(),
        h = 1;
      if (j) {
        h = 2;
      }
      if (j) {
        m.scale(2, 2);
      }
      var r = Utils.getLinkerLineStyle(k.lineStyle);
      m.lineWidth = r.lineWidth;
      m.strokeStyle = "rgb(" + r.lineColor + ")";
      m.fillStyle = "rgb(" + r.lineColor + ")";
      m.save();
      var w = { x: n.x, y: n.y };
      var g = { x: b.x, y: b.y };
      if (r.lineWidth == 1) {
        w.x += 0.5;
        w.y += 0.5;
        g.x += 0.5;
        g.y += 0.5;
      }
      m.save();
      if (r.lineStyle == "dashed") {
        this.setLineDash(m, [r.lineWidth * 5, r.lineWidth * 2]);
      } else {
        if (r.lineStyle == "dot") {
          this.setLineDash(m, [r.lineWidth, r.lineWidth * 1.5]);
        } else {
          if (r.lineStyle == "dashdot") {
            this.setLineDash(m, [
              r.lineWidth * 5,
              r.lineWidth * 2,
              r.lineWidth,
              r.lineWidth * 2,
            ]);
          }
        }
      }
      var f = Model.define.page.lineJumps;
      m.lineJoin = "round";
      m.beginPath();
      this.actions.move.call(m, w);
      var l = null;
      if (k.linkerType == "curve") {
        var v = q[0];
        var u = q[1];
        var s = { x1: v.x, y1: v.y, x2: u.x, y2: u.y, x: g.x, y: g.y };
        this.actions.curve.call(m, s);
      } else {
        var e = n;
        e.y = Math.round(e.y);
        var t = 0,
          d = 0;
        if (r.lineWidth == 1) {
          t = 0.5;
          d = 0.5;
          l = 8;
        }
        var c = Utils.copyArray(q);
        if (q.length == 2) {
          if (q[0].x == q[1].x && q[0].y == q[1].y) {
            c = [];
          }
        }
        c.push(b);
        for (var p = 0; p < c.length; p++) {
          var x = c[p];
          x.y = Math.round(x.y);
          if (x.x == e.x && x.y == e.y) {
            continue;
          }
          var o = x.x + t;
          var a = x.y + d;
          this.actions.line.call(m, { x: o, y: a });
          e = x;
        }
      }
      m.stroke();
      m.restore();
      delete m.webkitLineDash;
      m.restore();
    },
    renderShape: function (b) {
      if (b.name == "linker") {
        this.renderLinker(b);
        return;
      }
      var s = $("#" + b.id);
      if (s.length == 0) {
        var m = $("#designer_canvas");
        s = $(
          "<div id='" +
            b.id +
            "' class='shape_box'><canvas class='shape_canvas'></canvas></div>"
        ).appendTo(m);
      }
      if (typeof isView != "undefined" && b.link) {
        var q = b.link;
        if (q.trim().toLowerCase().indexOf("http") == -1) {
          q = "http://" + q;
        }
        var o = $(
          "<a title='" +
            b.link +
            "' target='_blank' href='" +
            q +
            "' class='shape_link'></a>"
        );
        o.appendTo(s);
      }
      if (b.attribute && b.attribute.collapseBy) {
        s.hide();
      } else {
        s.show();
      }
      var j = Utils.isMac(),
        g = 1;
      if (j) {
        g = 2;
      }
      var k = Utils.getShapeBox(b);
      var r = (k.w + 20).toScale();
      var c = (k.h + 20).toScale();
      var p = s.find(".shape_canvas")[0].getContext("2d");
      s.find(".shape_canvas").attr({ width: r * g, height: c * g });
      s.css({
        left: (k.x - 10).toScale() + "px",
        top: (k.y - 10).toScale() + "px",
        width: r,
        height: c,
      });
      var d = b.props;
      if (j) {
        p.scale(g, g);
      }
      p.clearRect(0, 0, d.w + 20, d.h + 20);
      p.scale(Designer.config.scale, Designer.config.scale);
      p.translate(10, 10);
      p.translate(d.x - k.x, d.y - k.y);
      p.translate(d.w / 2, d.h / 2);
      p.rotate(d.angle);
      p.translate(-(d.w / 2), -(d.h / 2));
      p.globalAlpha = b.shapeStyle.alpha;
      p.lineJoin = "round";
      this.renderShapePath(p, b, false, function () {
        Designer.painter.renderShape(b);
      });
      if (j) {
        s.find(".shape_canvas").css({ width: r + "px", height: c + "px" });
      }
      this.renderMarkers(p, b);
      var n = b.getPath();
      var f = Utils.copy(n[n.length - 1]);
      f.fillStyle = { type: "none" };
      f.lineStyle = { lineWidth: 0 };
      var h = [f];
      this.renderPath(p, b, h, null, null, true);
      this.renderText(b, k);
      this.renderDataAttributes(b, k);
      s.children(".shape_comment_ico").remove();
      if (showCommentIco) {
        var a = false;
        if (Model.comments && Model.comments.length > 0) {
          for (var l = 0; l < Model.comments.length; l++) {
            var e = Model.comments[l];
            if (e.shapeId == b.id) {
              a = true;
              break;
            }
          }
        }
        if (a) {
          var i = $("<div class='shape_comment_ico'></div>").appendTo(s);
          i.bind("mousedown", function (t) {
            t.stopPropagation();
            Dock.showView("comment");
            Utils.selectShape(b.id);
          });
        }
      }
    },
    fillShape: function (f, i, h, e) {
      i.save();
      if (h.type != "none" && typeof h.alpha != "undefined") {
        i.globalAlpha = h.alpha;
      }
      if (h.type == "solid") {
        i.fillStyle = "rgb(" + h.color + ")";
        i.fill();
      } else {
        if (h.type == "gradient") {
          var g;
          if (h.gradientType == "linear") {
            g = GradientHelper.createLinearGradient(f, i, h);
          } else {
            g = GradientHelper.createRadialGradient(f, i, h);
          }
          i.fillStyle = g;
          i.fill();
        } else {
          if (h.type == "image") {
            var a;
            if (h.fileId.indexOf("qiniu/") >= 0) {
              a = h.fileId.replace(
                /^qiniu/,
                "http://7xpicf.com1.z0.glb.clouddn.com"
              );
            } else {
              if (h.fileId.indexOf("http") == 0) {
                a = h.fileId;
                if (a.indexOf("orgu2a928.bkt.clouddn.com") >= 0) {
                  a = a.replace(
                    "orgu2a928.bkt.clouddn.com",
                    "cdn2.processon.com"
                  );
                } else {
                  if (a.indexOf("7xt9nt.com1.z0.glb.clouddn.com") >= 0) {
                    a = a.replace(
                      "7xt9nt.com1.z0.glb.clouddn.com",
                      "cdn.processon.com"
                    );
                  } else {
                    if (a.indexOf("p7o7ul1nf.bkt.clouddn.com") >= 0) {
                      a = a.replace(
                        "p7o7ul1nf.bkt.clouddn.com",
                        "cdn1.processon.com"
                      );
                    }
                  }
                }
              } else {
                if (h.fileId.indexOf("/images/") >= 0) {
                  a = h.fileId;
                  if (localRuntime) {
                    a = "http://localhost:8080" + a;
                  }
                } else {
                  a = "/file/id/" + h.fileId + "/diagram_user_image";
                  if (localRuntime) {
                    a = "http://localhost:8080" + a;
                  }
                }
              }
            }
            var d = Utils.isFirefox();
            if (d) {
              a += "?s=100_100";
            }
            var c = $(".shape_img[src='" + a + "']");
            if (c.length == 0) {
              c = $("<img class='shape_img' loaded='0' src=''/>").appendTo(
                "#shape_img_container"
              );
              c.bind("load.drawshape", function () {
                $(this).attr("loaded", "1");
                if (e) {
                  e();
                }
              });
              c.attr("src", a);
            } else {
              if (c.attr("loaded") == "0") {
                c.bind("load.drawshape", function () {
                  if (e) {
                    e();
                  }
                });
              } else {
                b(c);
              }
            }
          }
        }
      }
      i.restore();
      function b(k) {
        i.save();
        i.clip();
        if (h.display == "fit") {
          var o = k.width();
          var l = k.height();
          var r = o / l;
          var n = f.props.w / f.props.h;
          if (r > n) {
            var m = f.props.w;
            var q = 0;
            var j = m / r;
            var p = f.props.h / 2 - j / 2;
            i.drawImage(k[0], q, p, m, j);
          } else {
            var j = f.props.h;
            var p = 0;
            var m = j * r;
            var q = f.props.w / 2 - m / 2;
            i.drawImage(k[0], q, p, m, j);
          }
        } else {
          if (h.display == "stretch") {
            i.drawImage(k[0], 0, 0, f.props.w, f.props.h);
          } else {
            if (h.display == "original") {
              var o = k.width();
              var l = k.height();
              var q = f.props.w / 2 - o / 2;
              var p = f.props.h / 2 - l / 2;
              i.drawImage(k[0], q, p, o, l);
            } else {
              if (h.display == "tile") {
                var q = 0;
                var o = k.width();
                var l = k.height();
                while (q < f.props.w) {
                  var p = 0;
                  while (p < f.props.h) {
                    i.drawImage(k[0], q, p, o, l);
                    p += l;
                  }
                  q += o;
                }
              } else {
                if (h.display == "static") {
                  var q = 0;
                  var o = k.width();
                  var l = k.height();
                  i.drawImage(k[0], h.imageX, h.imageY, o, l);
                } else {
                  var o = k.width();
                  var l = k.height();
                  var r = o / l;
                  var n = f.props.w / f.props.h;
                  if (r > n) {
                    var j = f.props.h;
                    var p = 0;
                    var m = j * r;
                    var q = f.props.w / 2 - m / 2;
                    i.drawImage(k[0], q, p, m, j);
                  } else {
                    var m = f.props.w;
                    var q = 0;
                    var j = m / r;
                    var p = f.props.h / 2 - j / 2;
                    i.drawImage(k[0], q, p, m, j);
                  }
                }
              }
            }
          }
        }
        i.restore();
      }
    },
    renderText: function (a, v) {
      var p = $("#" + a.id);
      var b = a.getTextBlock();
      p.find(".text_canvas").remove();
      for (var o = 0; o < b.length; o++) {
        var t = b[o];
        var m = $("#text_" + a.id + "_" + o);
        if (m.length == 0) {
          m = $(
            "<div contenteditable=true id='text_" +
              a.id +
              "_" +
              o +
              "' spellcheck=false class='text_canvas' forshape='" +
              a.id +
              "' ind='" +
              o +
              "'></div>"
          ).appendTo(p);
          m.bind("focus", function () {
            $(this).blur();
          });
        }
        m.attr("readonly", "readonly");
        if (!t.text || t.text.trim() == "") {
          m.css({ height: "0px", width: "0px" }).hide();
          continue;
        }
        var d = Utils.getShapeFontStyle(a.fontStyle);
        d = $.extend({}, d, t.fontStyle);
        var r = d.fontFamily;
        if (localRuntime) {
          if (Utils.containsChinese(t.text) && !Utils.containsChinese(r)) {
            r = "宋体";
          }
        }
        var q = {
          "line-height": 100 * d.lineHeight + "%",
          "font-size": d.size + "px",
          "font-family": r,
          "font-weight": d.bold ? "bold" : "normal",
          "font-style": d.italic ? "italic" : "normal",
          "text-align": d.textAlign,
          color: "rgb(" + d.color + ")",
          "text-decoration": d.underline ? "underline" : "none",
          opacity: a.shapeStyle.alpha,
          "word-wrap": "break-word",
        };
        m.css(q);
        m.show();
        var e = t.position;
        if (d.orientation == "horizontal") {
          var h = { x: e.x + e.w / 2, y: e.y + e.h / 2 };
          e = { x: h.x - e.h / 2, y: h.y - e.w / 2, w: e.h, h: e.w };
        }
        m.css({ width: e.w });
        var j = t.text
          .replace(/\n/g, "<br>")
          .replace(/\t/g, "&nbsp;")
          .replace(/\  /g, "&nbsp;&nbsp;");
        if (typeof isNewTextV != "undefined" && !isNewTextV) {
          j = j.replace(/</g, "&lt;").replace(/>/g, "&gt;");
          j = j.replace(/&lt;br&gt;/gi, "<br>");
          j = j.replace(/&lt;b&gt;/gi, "<b>").replace(/&lt;\/b&gt;/gi, "</b>");
          j = j
            .replace(/&lt;div&gt;/gi, "<div>")
            .replace(/&lt;\/div&gt;/gi, "</div>");
          j = j.replace(/&lt;i&gt;/gi, "<i>").replace(/&lt;\/i&gt;/gi, "</i>");
          j = j.replace(/&lt;u&gt;/gi, "<u>").replace(/&lt;\/u&gt;/gi, "</u>");
          j = j
            .replace(/&lt;font/gi, "<font")
            .replace(/\"&gt;/gi, '">')
            .replace(/&lt;\/font&gt;/gi, "</font>");
          j = j
            .replace(/&lt;span/gi, "<span")
            .replace(/&lt;\/span&gt;/gi, "</span>");
          j = j.replace(/&lt;p/gi, "<p").replace(/&lt;\/p&gt;/gi, "</p>");
        }
        m.html(j);
        Designer.op.equation.renderEquation(m);
        var w = m.height();
        var n = 0;
        if (d.vAlign == "middle") {
          n = e.y + e.h / 2 - w / 2;
        } else {
          if (d.vAlign == "bottom") {
            n = e.y + e.h - w;
          } else {
            n = e.y;
          }
        }
        var g = { x: e.x + e.w / 2, y: n + w / 2 };
        var f = a.props.angle;
        if (f != 0) {
          var u = { x: a.props.w / 2, y: a.props.h / 2 };
          g = Utils.getRotated(u, g, f);
        }
        if (d.orientation == "horizontal") {
          f = (Math.PI * 1.5 + f) % (Math.PI * 2);
        }
        var k = Math.round((f / (Math.PI * 2)) * 360);
        var s = "rotate(" + k + "deg) scale(" + Designer.config.scale + ")";
        var c = e.w;
        var l = w;
        m.css({
          width: c,
          height: Utils.isFirefox() ? l + 1 : l,
          left: (g.x + (a.props.x - v.x) + 10).toScale() - e.w / 2,
          top: (g.y + (a.props.y - v.y) + 10).toScale() - w / 2,
          "-webkit-transform": s,
          "-ms-transform": s,
          "-o-transform": s,
          "-moz-transform": s,
          transform: s,
        });
      }
    },
    calculateTextLines: function (g, u, n) {
      var f = u.w;
      var r = u.h;
      var a = [];
      var c = g.split(/\n/);
      for (var q = 0; q < c.length; q++) {
        var l = c[q];
        var m = n.measureText(l);
        if (m.width <= f) {
          a.push(l);
        } else {
          var k = l.split(/\s/);
          var e = "";
          for (var o = 0; o < k.length; o++) {
            var t = k[o];
            if (o != k.length - 1) {
              t += " ";
            }
            var v = n.measureText(t).width;
            if (v > f) {
              for (var b = 0; b < t.length; b++) {
                var s = e + t[b];
                var d = n.measureText(s).width;
                if (d > f) {
                  a.push(e);
                  e = t[b];
                } else {
                  e = s;
                }
              }
            } else {
              var s = e + t;
              var d = n.measureText(s).width;
              if (d > f) {
                a.push(e);
                e = t;
              } else {
                e = s;
              }
            }
          }
          if (e != "") {
            a.push(e);
          }
        }
      }
      return a;
    },
    renderMarkers: function (l, g, c) {
      if (
        g.attribute &&
        g.attribute.markers &&
        g.attribute.markers.length > 0
      ) {
        var d = g.attribute.markers;
        var m = Schema.config.markerSize;
        var h = 4;
        if (c) {
          m = 10;
        }
        var e = g.attribute.markerOffset;
        if (c) {
          e = 5;
        }
        var b = d.length * m + (d.length - 1) * h;
        var j = g.props.w / 2 - b / 2;
        for (var f = 0; f < d.length; f++) {
          var k = d[f];
          l.save();
          l.translate(j, g.props.h - m - e);
          var a = Schema.markers[k].call(g, m);
          this.renderPath(l, g, a);
          l.restore();
          j += m + h;
        }
      }
    },
    renderDataAttributes: function (e, h) {
      $("#" + e.id)
        .children(".attr_canvas")
        .remove();
      if (!e.dataAttributes || e.dataAttributes.length == 0) {
        return;
      }
      var d = { x: e.props.w / 2, y: e.props.h / 2 };
      var a = Utils.getShapeFontStyle(e);
      for (var c = 0; c < e.dataAttributes.length; c++) {
        var f = e.dataAttributes[c];
        if (f.showType == "none") {
          continue;
        }
        var j = "";
        var g = "";
        if (f.showName) {
          j = f.name + ": ";
        }
        if (f.showType == "text") {
          j += f.value;
        } else {
          if (f.showType == "icon") {
            g = f.icon;
          }
        }
        if (j == "" && g == "") {
          continue;
        }
        b(f, j, g);
      }
      function b(z, r, D) {
        var E = z.horizontal;
        var k = z.vertical;
        var l = $(
          "<canvas id='attr_canvas_" + z.id + "' class='attr_canvas'></canvas>"
        ).appendTo($("#" + e.id));
        var A = l[0].getContext("2d");
        var s = "12px ";
        var C = a.fontFamily;
        if (localRuntime) {
          if (Utils.containsChinese(r) && !Utils.containsChinese(C)) {
            C = "宋体";
          }
        }
        s += C;
        A.font = s;
        var q = A.measureText(r).width;
        var B = 20;
        if (D != "") {
          q += 20;
        }
        var p, o;
        if (E == "mostleft") {
          p = -q - 2;
        } else {
          if (E == "leftedge") {
            p = -q / 2;
          } else {
            if (E == "left") {
              p = 2;
            } else {
              if (E == "center") {
                p = (e.props.w - q) / 2;
              } else {
                if (E == "right") {
                  p = e.props.w - q - 2;
                } else {
                  if (E == "rightedge") {
                    p = e.props.w - q / 2;
                  } else {
                    p = e.props.w + 2;
                  }
                }
              }
            }
          }
        }
        if (k == "mosttop") {
          o = -B;
        } else {
          if (k == "topedge") {
            o = -B / 2;
          } else {
            if (k == "top") {
              o = 0;
            } else {
              if (k == "middle") {
                o = (e.props.h - B) / 2;
              } else {
                if (k == "bottom") {
                  o = e.props.h - B;
                } else {
                  if (k == "bottomedge") {
                    o = e.props.h - B / 2;
                  } else {
                    o = e.props.h;
                  }
                }
              }
            }
          }
        }
        var F = { x: p, y: o, w: q, h: B };
        var n = Utils.getRotatedBox(F, e.props.angle, d);
        l.attr({ width: n.w.toScale(), height: n.h.toScale() });
        A.font = s;
        var v = (n.x + (e.props.x - h.x) + 10).toScale();
        var u = (n.y + (e.props.y - h.y) + 10).toScale();
        l.css({ left: v, top: u });
        A.scale(Designer.config.scale, Designer.config.scale);
        A.translate(n.w / 2, n.h / 2);
        A.rotate(e.props.angle);
        A.translate(-n.w / 2, -n.h / 2);
        A.translate((n.w - F.w) / 2, (n.h - F.h) / 2);
        A.globalAlpha = e.shapeStyle.alpha;
        if (z.type == "link") {
          A.fillStyle = "#4183C4";
        } else {
          A.fillStyle = "#333";
        }
        A.textBaseline = "middle";
        A.fillText(r, 0, B / 2);
        if (D != "") {
          var i = "/images/data-attr/" + D + ".png";
          if (localRuntime) {
            i = "http://localhost:8080" + i;
          }
          var t = $(".shape_img[src='" + i + "']");
          if (t.length == 0) {
            t = $(
              "<img class='shape_img' loaded='false' src='" + i + "'/>"
            ).appendTo("#shape_img_container");
          }
          if (t.attr("loaded") == "true") {
            A.drawImage(t[0], F.w - 20, 0, 20, 20);
          } else {
            t.bind("load.drawshape", function () {
              $(this).attr("loaded", "true");
              A.drawImage(t[0], F.w - 20, 0, 20, 20);
            });
          }
        }
        A.beginPath();
        A.rect(0, 0, q, B);
        A.closePath();
        if (z.type == "link") {
          var m = $(
            "<a href='" +
              z.value +
              "' target='_blank' class='attr_link'></canvas>"
          ).appendTo($("#" + e.id));
          m.css({
            left: v,
            top: u,
            width: n.w.toScale(),
            height: n.h.toScale(),
            position: "absolute",
          });
        }
      }
    },
    renderLinker: function (D, d, U, r, J) {
      if (d) {
        D.points = Utils.getLinkerPoints(D, J);
      }
      if (D.linkerType == "curve" || D.linkerType == "broken") {
        if (!D.points || D.points.length == 0) {
          D.points = Utils.getLinkerPoints(D, J);
        }
      }
      var H = D.points;
      var n = Utils.copy(D.from);
      var V = Utils.copy(D.to);
      if (D.attribute && D.attribute.collapseBy) {
        $("#" + D.id).hide();
        return;
      } else {
        $("#" + D.id).show();
      }
      var c = Utils.getEndpointAngle(D, "from");
      if (isNaN(c)) {
        c = 0;
      }
      var G = Utils.getEndpointAngle(D, "to");
      var h = Utils.getLinkerLineStyle(D.lineStyle);
      k(n, D, h.beginArrowStyle, c);
      k(V, D, h.endArrowStyle, G);
      var M = V.x;
      var K = V.y;
      var w = n.x;
      var t = n.y;
      if (V.x < n.x) {
        M = V.x;
        w = n.x;
      } else {
        M = n.x;
        w = V.x;
      }
      if (V.y < n.y) {
        K = V.y;
        t = n.y;
      } else {
        K = n.y;
        t = V.y;
      }
      for (var R = 0; R < H.length; R++) {
        var E = H[R];
        if (E.x < M) {
          M = E.x;
        } else {
          if (E.x > w) {
            w = E.x;
          }
        }
        if (E.y < K) {
          K = E.y;
        } else {
          if (E.y > t) {
            t = E.y;
          }
        }
      }
      var f = { x: M, y: K, w: w - M, h: t - K };
      var L = $("#" + D.id);
      if (L.length == 0) {
        var e = $("#designer_canvas");
        L = $(
          "<div id='" +
            D.id +
            "' class='shape_box linker_box'><canvas class='shape_canvas'></canvas></div>"
        ).appendTo(e);
      }
      if (!Model.getShapeById(D.id)) {
        L.css("z-index", Model.orderList.length + 1);
      }
      var P = Utils.isMac(),
        q = 1;
      if (P) {
        q = 2;
      }
      var o = L.find(".shape_canvas");
      o.attr({
        width: (f.w + 20).toScale() * q,
        height: (f.h + 20).toScale() * q,
      });
      L.css({
        left: (f.x - 10).toScale(),
        top: (f.y - 10).toScale(),
        width: (f.w + 20).toScale(),
        height: (f.h + 20).toScale(),
      });
      var u = o[0].getContext("2d");
      if (P) {
        u.scale(2, 2);
      }
      u.scale(Designer.config.scale, Designer.config.scale);
      u.translate(10, 10);
      var O = Utils.getLinkerLineStyle(D.lineStyle);
      u.lineWidth = O.lineWidth;
      u.strokeStyle = "rgb(" + O.lineColor + ")";
      u.fillStyle = "rgb(" + O.lineColor + ")";
      u.save();
      var m = { x: n.x - f.x, y: n.y - f.y };
      var s = { x: V.x - f.x, y: V.y - f.y };
      if (O.lineWidth == 1) {
        m.x += 0.5;
        m.y += 0.5;
        s.x += 0.5;
        s.y += 0.5;
      }
      u.save();
      if (P) {
        o.css({
          width: (f.w + 20).toScale() + "px",
          height: (f.h + 20).toScale() + "px",
        });
      }
      if (O.lineStyle == "dashed") {
        this.setLineDash(u, [O.lineWidth * 5, O.lineWidth * 2]);
      } else {
        if (O.lineStyle == "dot") {
          this.setLineDash(u, [O.lineWidth, O.lineWidth * 1.5]);
        } else {
          if (O.lineStyle == "dashdot") {
            this.setLineDash(u, [
              O.lineWidth * 5,
              O.lineWidth * 2,
              O.lineWidth,
              O.lineWidth * 2,
            ]);
          }
        }
      }
      var b = Model.define.page.lineJumps;
      u.lineJoin = "round";
      u.beginPath();
      this.actions.move.call(u, m);
      var S = null;
      if (D.linkerType == "curve") {
        var A = H[0];
        var z = H[1];
        var g = {
          x1: A.x - f.x,
          y1: A.y - f.y,
          x2: z.x - f.x,
          y2: z.y - f.y,
          x: s.x,
          y: s.y,
        };
        this.actions.curve.call(u, g);
      } else {
        var I = n;
        I.y = Math.round(I.y);
        var p = 0,
          X = 0;
        if (O.lineWidth == 1) {
          p = 0.5;
          X = 0.5;
          S = 8;
        }
        var W = Utils.copyArray(H);
        if (H.length == 2) {
          if (H[0].x == H[1].x && H[0].y == H[1].y) {
            W = [];
          }
        }
        W.push(V);
        for (var R = 0; R < W.length; R++) {
          var F = W[R];
          F.y = Math.round(F.y);
          if (F.x == I.x && F.y == I.y) {
            continue;
          }
          if (r && F.y == I.y && F.x != I.x && O.lineWidth < 6) {
            var a = r.points,
              N = false;
            for (var Q = 0; Q < a.length; Q++) {
              var y = a[Q];
              if (y.y == F.y && Math.abs(y.x - F.x) <= 6) {
                N = true;
              }
            }
            if (N) {
              continue;
            }
            if (F.x < I.x) {
              for (var Q = a.length - 1; Q >= 0; Q--) {
                var y = a[Q];
                if (y.y == F.y && y.x >= F.x && y.x <= I.x) {
                  var x = y.x - f.x + p;
                  var v = y.y - f.y + X;
                  u.arc(x, v, 6, 0, Math.PI, true);
                }
              }
            } else {
              for (var Q = 0; Q < a.length; Q++) {
                var y = a[Q];
                if (y.y == F.y && y.x < F.x && y.x > I.x) {
                  var x = y.x - f.x + p;
                  var v = y.y - f.y + X;
                  u.arc(x, v, 6, Math.PI, 0);
                }
              }
            }
          }
          var l = F.x - f.x + p;
          var T = F.y - f.y + X;
          this.actions.line.call(u, { x: l, y: T });
          I = F;
        }
      }
      var C = Utils.isSelected(D.id);
      if (C) {
        u.shadowBlur = 4;
        u.shadowColor = "#833";
        if (D.linkerType == "curve" && Utils.getSelectedIds().length == 1) {
        }
        L.css("z-index", 99999);
      } else {
        L.css("z-index", Model.orderList[D.id]);
      }
      u.stroke();
      u.restore();
      delete u.webkitLineDash;
      B(m, c, n.id, O.beginArrowStyle, D, n.angle, S);
      B(s, G, V.id, O.endArrowStyle, D, V.angle, S);
      u.restore();
      this.renderLinkerText(D, d, U);
      function k(af, aa, i, ac) {
        if (af.id) {
          var j = Model.getShapeById(af.id);
          if (j) {
            var Z = { x: 0, y: 0 };
            var ab = Utils.getShapeLineStyle(j.lineStyle);
            var ae = Utils.getLinkerLineStyle(aa.lineStyle);
            if (i == "none" || i == "cross") {
              Z.x = -ab.lineWidth / 2;
            } else {
              if (i == "solidArrow" || i == "dashedArrow") {
                Z.x = -ab.lineWidth / 2 - ae.lineWidth * 1.3;
              } else {
                if (i == "solidDiamond" || i == "dashedDiamond") {
                  Z.x = -ab.lineWidth / 2 - ae.lineWidth;
                } else {
                  Z.x = -ab.lineWidth / 2 - ae.lineWidth / 2;
                }
              }
            }
            var ad = { x: 0, y: 0 };
            var Y = Utils.getRotated(ad, Z, ac);
            af.x += Y.x;
            af.y += Y.y;
          }
        }
      }
      function B(ap, af, aj, ar, ak, j, aw) {
        if (ar == "normal") {
          var al = 12;
          var ax = Math.PI / 5;
          var ao = al / Math.cos(ax);
          var ae = ap.x - ao * Math.cos(af - ax);
          var ad = ap.y - ao * Math.sin(af - ax);
          var ah = ap.x - ao * Math.sin(Math.PI / 2 - af - ax);
          var ag = ap.y - ao * Math.cos(Math.PI / 2 - af - ax);
          u.beginPath();
          u.moveTo(ae, ad);
          u.lineTo(ap.x, ap.y);
          u.lineTo(ah, ag);
          u.stroke();
        } else {
          if (ar == "solidArrow") {
            var al = aw || 10;
            var ax = Math.PI / 10;
            var ao = al / Math.cos(ax);
            var ae = ap.x - ao * Math.cos(af - ax);
            var ad = ap.y - ao * Math.sin(af - ax);
            var ah = ap.x - ao * Math.sin(Math.PI / 2 - af - ax);
            var ag = ap.y - ao * Math.cos(Math.PI / 2 - af - ax);
            u.beginPath();
            u.moveTo(ap.x, ap.y);
            u.lineTo(ae, ad);
            u.lineTo(ah, ag);
            u.lineTo(ap.x, ap.y);
            u.closePath();
            u.fill();
            u.stroke();
          } else {
            if (ar == "dashedArrow") {
              u.save();
              var al = aw || 12;
              var ax = Math.PI / 10;
              var ao = al / Math.cos(ax);
              var ae = ap.x - ao * Math.cos(af - ax);
              var ad = ap.y - ao * Math.sin(af - ax);
              var ah = ap.x - ao * Math.sin(Math.PI / 2 - af - ax);
              var ag = ap.y - ao * Math.cos(Math.PI / 2 - af - ax);
              u.beginPath();
              u.moveTo(ap.x, ap.y);
              u.lineTo(ae, ad);
              u.lineTo(ah, ag);
              u.lineTo(ap.x, ap.y);
              u.closePath();
              u.fillStyle = "white";
              u.fill();
              u.stroke();
              u.restore();
            } else {
              if (ar == "solidCircle") {
                u.save();
                var i = 4;
                var ac = ap.x - i * Math.cos(af);
                var ab = ap.y - i * Math.sin(af);
                u.beginPath();
                u.arc(ac, ab, i, 0, Math.PI * 2, false);
                u.closePath();
                u.fill();
                u.stroke();
                u.restore();
              } else {
                if (ar == "dashedCircle") {
                  u.save();
                  var i = 4;
                  var ac = ap.x - i * Math.cos(af);
                  var ab = ap.y - i * Math.sin(af);
                  u.beginPath();
                  u.arc(ac, ab, i, 0, Math.PI * 2, false);
                  u.closePath();
                  u.fillStyle = "white";
                  u.fill();
                  u.stroke();
                  u.restore();
                } else {
                  if (ar == "solidDiamond") {
                    u.save();
                    var al = 8;
                    var ax = Math.PI / 7;
                    var ao = al / Math.cos(ax);
                    var ae = ap.x - ao * Math.cos(af - ax);
                    var ad = ap.y - ao * Math.sin(af - ax);
                    var ah = ap.x - ao * Math.sin(Math.PI / 2 - af - ax);
                    var ag = ap.y - ao * Math.cos(Math.PI / 2 - af - ax);
                    var an = ap.x - al * 2 * Math.cos(af);
                    var am = ap.y - al * 2 * Math.sin(af);
                    u.beginPath();
                    u.moveTo(ap.x, ap.y);
                    u.lineTo(ae, ad);
                    u.lineTo(an, am);
                    u.lineTo(ah, ag);
                    u.lineTo(ap.x, ap.y);
                    u.closePath();
                    u.fill();
                    u.stroke();
                    u.restore();
                  } else {
                    if (ar == "dashedDiamond") {
                      u.save();
                      var al = 8;
                      var ax = Math.PI / 7;
                      var ao = al / Math.cos(ax);
                      var ae = ap.x - ao * Math.cos(af - ax);
                      var ad = ap.y - ao * Math.sin(af - ax);
                      var ah = ap.x - ao * Math.sin(Math.PI / 2 - af - ax);
                      var ag = ap.y - ao * Math.cos(Math.PI / 2 - af - ax);
                      var an = ap.x - al * 2 * Math.cos(af);
                      var am = ap.y - al * 2 * Math.sin(af);
                      u.beginPath();
                      u.moveTo(ap.x, ap.y);
                      u.lineTo(ae, ad);
                      u.lineTo(an, am);
                      u.lineTo(ah, ag);
                      u.lineTo(ap.x, ap.y);
                      u.closePath();
                      u.fillStyle = "white";
                      u.fill();
                      u.stroke();
                      u.restore();
                    } else {
                      if (ar == "cross") {
                        var aa = 6;
                        var ai = 14;
                        var av = aa * Math.cos(Math.PI / 2 - af);
                        var au = aa * Math.sin(Math.PI / 2 - af);
                        var at = ap.x + av;
                        var Z = ap.y - au;
                        var an = ap.x - ai * Math.cos(af);
                        var am = ap.y - ai * Math.sin(af);
                        var aq = an - av;
                        var Y = am + au;
                        u.beginPath();
                        u.moveTo(at, Z);
                        u.lineTo(aq, Y);
                        u.stroke();
                      } else {
                        if (ar == "asynch1") {
                          u.save();
                          var al = 14;
                          var ax = Math.PI / 6.5;
                          var ao = al / Math.cos(ax);
                          var ae = ap.x - ao * Math.cos(af - ax);
                          var ad = ap.y - ao * Math.sin(af - ax);
                          var an = ap.x - al * 2 * Math.cos(af);
                          var am = ap.y - al * 2 * Math.sin(af);
                          u.beginPath();
                          u.moveTo(ap.x, ap.y);
                          u.lineTo(ae, ad);
                          u.fillStyle = "white";
                          u.fill();
                          u.stroke();
                          u.restore();
                        } else {
                          if (ar == "asynch2") {
                            u.save();
                            var al = 14;
                            var ax = Math.PI / 6.5;
                            var ao = al / Math.cos(ax);
                            var ah =
                              ap.x - ao * Math.sin(Math.PI / 2 - af - ax);
                            var ag =
                              ap.y - ao * Math.cos(Math.PI / 2 - af - ax);
                            var an = ap.x - al * 2 * Math.cos(af);
                            var am = ap.y - al * 2 * Math.sin(af);
                            u.beginPath();
                            u.moveTo(ap.x, ap.y);
                            u.lineTo(ah, ag);
                            u.fillStyle = "white";
                            u.fill();
                            u.stroke();
                            u.restore();
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
    },
    renderLinkerText: function (i, m, d) {
      var h = $("#" + i.id);
      var b = h.find(".text_canvas");
      if (b.length == 0) {
        b = $("<div class='text_canvas linker_text'></div>").appendTo(h);
      }
      var f = Utils.getLinkerFontStyle(i.fontStyle);
      var c = "scale(" + Designer.config.scale + ")";
      var g = f.fontFamily;
      if (localRuntime) {
        if (Utils.containsChinese(i.text) && !Utils.containsChinese(g)) {
          g = "宋体";
        }
      }
      var a = {
        "line-height": Math.round(f.size * 1.25) + "px",
        "font-size": f.size + "px",
        "font-family": g,
        "font-weight": f.bold ? "bold" : "normal",
        "font-style": f.italic ? "italic" : "normal",
        "text-align": f.textAlign,
        color: "rgb(" + f.color + ")",
        "text-decoration": f.underline ? "underline" : "none",
        "-webkit-transform": c,
        "-ms-transform": c,
        "-o-transform": c,
        "-moz-transform": c,
        transform: c,
      };
      b.css(a);
      if (i.text == null || i.text == "") {
        b.hide();
        return;
      }
      b.show();
      var l = i.text
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/\n/g, "<br/>");
      b.html(l + "<br/>");
      var n = null;
      if (i.textPos != null) {
        if (m || d) {
          var k = Utils.getLinkerLinesPoints(i);
          if (i.textPos.t > k.length) {
            i.textPos.t = k.length - 1;
          }
          n = k[i.textPos.t];
          if (n != null) {
            i.textPos.x = n.x;
            i.textPos.y = n.y;
          }
        } else {
          n = { x: i.textPos.x, y: i.textPos.y };
        }
      } else {
        n = this.getLinkerMidpoint(i);
      }
      if (n != null && n.x != null) {
        var e = h.position();
        var j = n.y.toScale() - e.top - b.height() / 2;
        if (i.textPos != null) {
          if (i.textPos.pos != null && i.textPos.pos == "top") {
            j = j - b.height() / 2 - 6;
          } else {
            if (i.textPos.pos != null && i.textPos.pos == "bottom") {
              j += b.height() / 2 + 6;
            }
          }
        }
        b.css({ left: n.x.toScale() - e.left - b.width() / 2, top: j });
      }
    },
    getLinkerMidpoint: function (c) {
      var g = {};
      if (c.linkerType == "normal") {
        g = {
          x: 0.5 * c.from.x + 0.5 * c.to.x,
          y: 0.5 * c.from.y + 0.5 * c.to.y,
        };
      } else {
        if (c.linkerType == "curve") {
          var o = c.from;
          var m = c.points[0];
          var h = c.points[1];
          var f = c.to;
          g = {
            x: o.x * 0.125 + m.x * 0.375 + h.x * 0.375 + f.x * 0.125,
            y: o.y * 0.125 + m.y * 0.375 + h.y * 0.375 + f.y * 0.125,
          };
        } else {
          var i = [];
          i.push(c.from);
          i = i.concat(c.points);
          i.push(c.to);
          var l = 0;
          for (var b = 1; b < i.length; b++) {
            var m = i[b - 1];
            var h = i[b];
            var e = Utils.measureDistance(m, h);
            l += e;
          }
          var k = l / 2;
          var a = 0;
          for (var b = 1; b < i.length; b++) {
            var m = i[b - 1];
            var h = i[b];
            var e = Utils.measureDistance(m, h);
            var j = a + e;
            if (j >= k) {
              var n = (k - a) / e;
              g = { x: (1 - n) * m.x + n * h.x, y: (1 - n) * m.y + n * h.y };
              break;
            }
            a = j;
          }
        }
      }
      return g;
    },
    controlStatus: { resizeDir: [], rotatable: true },
    drawControls: function (h) {
      var g = $("#shape_controls");
      if (g.length == 0) {
        var c = $("#designer_canvas");
        g = $("<div id='shape_controls'></div>").appendTo(c);
        g.append("<canvas id='controls_bounding'></canvas>");
        g.append(
          "<div class='shape_controller' index='0' resizeDir='tl'></div>"
        );
        g.append(
          "<div class='shape_controller' index='1' resizeDir='tr'></div>"
        );
        g.append(
          "<div class='shape_controller' index='2' resizeDir='br'></div>"
        );
        g.append(
          "<div class='shape_controller' index='3' resizeDir='bl'></div>"
        );
        g.append("<div class='shape_controller' resizeDir='l'></div>");
        g.append("<div class='shape_controller' resizeDir='t'></div>");
        g.append("<div class='shape_controller' resizeDir='r'></div>");
        g.append("<div class='shape_controller' resizeDir='b'></div>");
        Designer.op.shapeResizable();
        g.append(
          "<canvas class='shape_rotater' width='41px' height='40px'></canvas>"
        );
        Designer.op.shapeRotatable();
        g.append("<div class='group_icon change_shape_icon'></div>");
        Designer.op.groupShapeChangable();
        $(".shape_controller").css({
          "border-color": Designer.config.anchorColor,
          width: Designer.config.anchorSize - 2,
          height: Designer.config.anchorSize - 2,
        });
      }
      $(".shape_controller").css({ "z-index": Model.orderList.length });
      $(".change_shape_icon").hide();
      g.show();
      var e = 0;
      var k;
      var d;
      if (h.length == 1) {
        var j = Model.getShapeById(h[0]);
        k = j.props;
        e = j.props.angle;
        d = j.resizeDir;
        if (j.groupName && SchemaGroup.groupExists(j.groupName)) {
          $(".change_shape_icon").show();
        }
      } else {
        k = Utils.getControlBox(h);
        d = ["tl", "tr", "br", "bl"];
      }
      var a = true;
      for (var f = 0; f < h.length; f++) {
        var b = h[f];
        var j = Model.getShapeById(b);
        if (j.attribute && j.attribute.rotatable == false) {
          a = false;
        }
        if (
          (j.resizeDir && j.resizeDir.length == 0) ||
          (j.parent && h.length > 1)
        ) {
          d = [];
        }
      }
      this.controlStatus.rotatable = a;
      this.controlStatus.resizeDir = d;
      this.rotateControls(k, e);
      return g;
    },
    rotateControls: function (g, u) {
      var k = $("#shape_controls");
      var l = Utils.getRotatedBox(g, u);
      var z = l.w.toScale();
      var h = l.h.toScale();
      k.css({
        left: l.x.toScale(),
        top: l.y.toScale(),
        width: z,
        height: h,
        "z-index": Model.orderList.length,
      });
      var j = z + 20;
      var o = h + 20;
      var f = $("#controls_bounding");
      f.attr({ width: j, height: o });
      var p = f[0].getContext("2d");
      p.lineJoin = "round";
      if (this.controlStatus.resizeDir.length == 0) {
        p.lineWidth = 2;
        p.strokeStyle = Designer.config.selectorColor;
        p.globalAlpha = 0.8;
      } else {
        p.lineWidth = 1;
        p.strokeStyle = Designer.config.selectorColor;
        p.globalAlpha = 0.5;
      }
      p.save();
      p.clearRect(0, 0, j, o);
      p.translate(j / 2, o / 2);
      p.rotate(u);
      p.translate(-j / 2, -o / 2);
      p.translate(9.5, 9.5);
      var b = {
        x: Math.round((g.x - l.x).toScale()),
        y: Math.round((g.y - l.y).toScale()),
        w: Math.floor(g.w.toScale() + 1),
        h: Math.floor(g.h.toScale() + 1),
      };
      p.strokeRect(b.x, b.y, b.w, b.h);
      p.restore();
      var y = 0 - Designer.config.anchorSize / 2;
      var s = {};
      g = Utils.toScale(g);
      l = Utils.toScale(l);
      var v = { x: g.x + g.w / 2, y: g.y + g.h / 2 };
      k.children(".shape_controller").hide();
      for (var r = 0; r < this.controlStatus.resizeDir.length; r++) {
        var n = this.controlStatus.resizeDir[r];
        var a = $(".shape_controller[resizeDir=" + n + "]");
        a.show();
        var d, c;
        if (n.indexOf("l") >= 0) {
          d = g.x;
        } else {
          if (n.indexOf("r") >= 0) {
            d = g.x + g.w;
          } else {
            d = g.x + g.w / 2;
          }
        }
        if (n.indexOf("t") >= 0) {
          c = g.y;
        } else {
          if (n.indexOf("b") >= 0) {
            c = g.y + g.h;
          } else {
            c = g.y + g.h / 2;
          }
        }
        var e = Utils.getRotated(v, { x: d, y: c }, u);
        a.css({ left: e.x - l.x + y, top: e.y - l.y + y });
      }
      var m = Math.PI / 8;
      k.children(".shape_controller").removeClass("s n e w");
      if (u > m && u <= m * 3) {
        k.children("div[resizeDir=tl]").addClass("n");
        k.children("div[resizeDir=tr]").addClass("e");
        k.children("div[resizeDir=br]").addClass("s");
        k.children("div[resizeDir=bl]").addClass("w");
        k.children("div[resizeDir=l]").addClass("n w");
        k.children("div[resizeDir=r]").addClass("s e");
        k.children("div[resizeDir=b]").addClass("s w");
        k.children("div[resizeDir=t]").addClass("n e");
      } else {
        if (u > m * 3 && u <= m * 5) {
          k.children("div[resizeDir=tl]").addClass("n e");
          k.children("div[resizeDir=tr]").addClass("s e");
          k.children("div[resizeDir=br]").addClass("s w");
          k.children("div[resizeDir=bl]").addClass("n w");
          k.children("div[resizeDir=l]").addClass("n");
          k.children("div[resizeDir=r]").addClass("s");
          k.children("div[resizeDir=b]").addClass("w");
          k.children("div[resizeDir=t]").addClass("e");
        } else {
          if (u > m * 5 && u <= m * 7) {
            k.children("div[resizeDir=tl]").addClass("e");
            k.children("div[resizeDir=tr]").addClass("s");
            k.children("div[resizeDir=br]").addClass("w");
            k.children("div[resizeDir=bl]").addClass("n");
            k.children("div[resizeDir=l]").addClass("n e");
            k.children("div[resizeDir=r]").addClass("s w");
            k.children("div[resizeDir=b]").addClass("n w");
            k.children("div[resizeDir=t]").addClass("s e");
          } else {
            if (u > m * 7 && u <= m * 9) {
              k.children("div[resizeDir=tl]").addClass("s e");
              k.children("div[resizeDir=tr]").addClass("s w");
              k.children("div[resizeDir=br]").addClass("n w");
              k.children("div[resizeDir=bl]").addClass("n e");
              k.children("div[resizeDir=l]").addClass("e");
              k.children("div[resizeDir=r]").addClass("w");
              k.children("div[resizeDir=b]").addClass("n");
              k.children("div[resizeDir=t]").addClass("s");
            } else {
              if (u > m * 9 && u <= m * 11) {
                k.children("div[resizeDir=tl]").addClass("s");
                k.children("div[resizeDir=tr]").addClass("w");
                k.children("div[resizeDir=br]").addClass("n");
                k.children("div[resizeDir=bl]").addClass("e");
                k.children("div[resizeDir=l]").addClass("s e");
                k.children("div[resizeDir=r]").addClass("n w");
                k.children("div[resizeDir=b]").addClass("n e");
                k.children("div[resizeDir=t]").addClass("s w");
              } else {
                if (u > m * 11 && u <= m * 13) {
                  k.children("div[resizeDir=tl]").addClass("s w");
                  k.children("div[resizeDir=tr]").addClass("n w");
                  k.children("div[resizeDir=br]").addClass("n e");
                  k.children("div[resizeDir=bl]").addClass("s e");
                  k.children("div[resizeDir=l]").addClass("s");
                  k.children("div[resizeDir=r]").addClass("n");
                  k.children("div[resizeDir=b]").addClass("e");
                  k.children("div[resizeDir=t]").addClass("w");
                } else {
                  if (u > m * 13 && u <= m * 15) {
                    k.children("div[resizeDir=tl]").addClass("w");
                    k.children("div[resizeDir=tr]").addClass("n");
                    k.children("div[resizeDir=br]").addClass("e");
                    k.children("div[resizeDir=bl]").addClass("s");
                    k.children("div[resizeDir=l]").addClass("s w");
                    k.children("div[resizeDir=r]").addClass("n e");
                    k.children("div[resizeDir=b]").addClass("s e");
                    k.children("div[resizeDir=t]").addClass("n w");
                  } else {
                    k.children("div[resizeDir=tl]").addClass("n w");
                    k.children("div[resizeDir=tr]").addClass("n e");
                    k.children("div[resizeDir=br]").addClass("s e");
                    k.children("div[resizeDir=bl]").addClass("s w");
                    k.children("div[resizeDir=l]").addClass("w");
                    k.children("div[resizeDir=r]").addClass("e");
                    k.children("div[resizeDir=b]").addClass("s");
                    k.children("div[resizeDir=t]").addClass("n");
                  }
                }
              }
            }
          }
        }
      }
      if (this.controlStatus.rotatable) {
        var x = k.find(".shape_rotater");
        x.show();
        var w = { x: g.x + g.w / 2, y: g.y - 20 };
        var t = Utils.getRotated(v, w, u);
        x.css({ top: t.y - 20 - l.y, left: t.x - 20.5 - l.x });
        var q = x[0].getContext("2d");
        q.lineWidth = 1;
        q.strokeStyle = Designer.config.selectorColor;
        q.fillStyle = "white";
        q.save();
        q.clearRect(0, 0, 41, 40);
        q.translate(20.5, 20);
        q.rotate(u);
        q.translate(-20.5, -20);
        q.beginPath();
        q.moveTo(20.5, 20);
        q.lineTo(20.5, 40);
        q.stroke();
        q.beginPath();
        q.arc(20.5, 20, Designer.config.rotaterSize / 2, 0, Math.PI * 2);
        q.closePath();
        q.fill();
        q.stroke();
        q.restore();
      } else {
        k.find(".shape_rotater").hide();
      }
    },
  },
};
var Model = {
  define: {},
  persistence: {},
  orderList: [],
  orderListGroup: {},
  maxZIndex: 0,
  linkerMap: {
    map: {},
    add: function (b, a) {
      if (!this.map[b]) {
        this.map[b] = [];
      }
      if (this.map[b].indexOf(a) < 0) {
        this.map[b].push(a);
      }
    },
    remove: function (b, a) {
      if (this.map[b]) {
        Utils.removeFromArray(this.map[b], a);
      }
    },
    empty: function () {
      this.map = {};
    },
  },
  intersection: {},
  groupMap: {
    map: {},
    add: function (a, b) {
      this.map[a] = b;
    },
    push: function (a, b) {
      if (!this.map[a]) {
        this.map[a] = [];
      }
      if (this.map[a].indexOf(b) < 0) {
        this.map[a].push(b);
      }
    },
    remove: function (a) {
      delete this.map[a];
    },
    empty: function () {
      this.map = {};
    },
  },
  create: function (e, b, h) {
    var d = Utils.newId();
    var c = Utils.copy(Schema.shapes[e]);
    c.id = d;
    c.props.x = b;
    c.props.y = h;
    if (c.attribute.container) {
      c.props.zindex = -1;
    } else {
      c.props.zindex = Model.maxZIndex + 1;
    }
    c.props = $.extend(true, {}, Schema.shapeDefaults.props, c.props);
    for (var f = 0; f < c.dataAttributes.length; f++) {
      var a = c.dataAttributes[f];
      a.id = Utils.newId();
    }
    var g = Model.define;
    if (
      g.defaultStyle != null &&
      g.defaultStyle.fillStyle != null &&
      $.isEmptyObject(c.fillStyle)
    ) {
      c.fillStyle = g.defaultStyle.fillStyle;
    }
    if (
      g.defaultStyle != null &&
      g.defaultStyle.lineStyle != null &&
      $.isEmptyObject(c.lineStyle)
    ) {
      c.lineStyle = g.defaultStyle.lineStyle;
    }
    if (
      g.defaultStyle != null &&
      g.defaultStyle.fontStyle != null &&
      $.isEmptyObject(c.fontStyle)
    ) {
      c.fontStyle = g.defaultStyle.fontStyle;
    }
    Designer.events.push("create", c);
    return c;
  },
  createByShape: function (c, b, g) {
    var d = Utils.copy(c);
    if (d.name == "linker") {
      d.props.zindex = Model.maxZIndex + 1;
    } else {
      if (d.attribute.container) {
        d.props.zindex = -1;
      } else {
        Model.maxZIndex = Model.maxZIndex + 1;
        d.props.zindex = Model.maxZIndex;
      }
    }
    if (c.name.indexOf("SeparatorBar") > -1) {
      d.props.zindex = 0;
    }
    d.props = $.extend(true, {}, Schema.shapeDefaults.props, d.props);
    d.dataAttributes = d.dataAttributes || [];
    for (var e = 0; e < d.dataAttributes.length; e++) {
      var a = d.dataAttributes[e];
      a.id = Utils.newId();
    }
    var f = Model.define;
    if (
      f.defaultStyle != null &&
      f.defaultStyle.fillStyle != null &&
      $.isEmptyObject(d.fillStyle)
    ) {
      d.fillStyle = f.defaultStyle.fillStyle;
    }
    if (
      f.defaultStyle != null &&
      f.defaultStyle.lineStyle != null &&
      $.isEmptyObject(d.lineStyle)
    ) {
      d.lineStyle = f.defaultStyle.lineStyle;
    }
    if (
      f.defaultStyle != null &&
      f.defaultStyle.fontStyle != null &&
      $.isEmptyObject(d.fontStyle)
    ) {
      d.fontStyle = f.defaultStyle.fontStyle;
    }
    Designer.events.push("create", d);
    return d;
  },
  add: function (a, c, b) {
    this.addMulti([a], c, b);
  },
  addMulti: function (b, f, e) {
    if (typeof f == "undefined") {
      f = true;
    }
    var a = [];
    for (var d = 0; d < b.length; d++) {
      var c = b[d];
      a.push(Utils.copy(c));
      this.define.elements[c.id] = Utils.copy(c);
      this.persistence.elements[c.id] = Utils.copy(c);
    }
    this.build();
    if (f) {
      MessageSource.send("create", a, e);
      Util.shapesCount();
    }
  },
  update: function (a) {
    this.updateMulti([a]);
  },
  updateMulti: function (c) {
    var a = [];
    var b = [];
    for (var e = 0; e < c.length; e++) {
      var d = c[e];
      if (this.define.elements[d.id]) {
        this.define.elements[d.id] = Utils.copy(d);
        b.push(Utils.copy(this.getPersistenceById(d.id)));
        a.push(Utils.copy(d));
        this.persistence.elements[d.id] = Utils.copy(d);
      }
    }
    this.build();
    var f = { shapes: b, updates: a };
    MessageSource.send("update", f);
  },
  remove: function (b, k) {
    if (typeof k == "undefined") {
      k = true;
    }
    if (k) {
      b = Designer.events.push("beforeRemove", b);
    }
    var h = [];
    var n = [];
    var e = [];
    var o = [];
    var d = [];
    if (b.length == 0) {
      return false;
    }
    for (var f = 0; f < b.length; f++) {
      var j = b[f];
      if (j.name == "linker") {
        d.push(j.id);
      } else {
        o.push(j.id);
      }
    }
    for (var f = 0; f < b.length; f++) {
      var j = b[f];
      h.push(Utils.copy(j));
      $("#" + j.id).remove();
      delete this.define.elements[j.id];
      delete this.persistence.elements[j.id];
      this.groupMap.remove(j.group);
      if (j.name == "linker") {
        if (j.from.id != null) {
          this.linkerMap.remove(j.from.id, j.id);
        }
        if (j.to.id != null) {
          this.linkerMap.remove(j.to.id, j.id);
        }
      } else {
        if (j.parent && o.indexOf(j.parent) < 0) {
          var l = Model.getShapeById(j.parent);
          if (l) {
            Utils.removeFromArray(l.children, j.id);
            if (n.indexOf(j.parent) < 0) {
              n.push(j.parent);
              e.push(l);
            }
          }
        }
        var p = this.getShapeLinkers(j.id);
        if (p && p.length > 0) {
          for (var g = 0; g < p.length; g++) {
            var a = p[g];
            if (d.indexOf(a) < 0) {
              var c = this.getShapeById(a);
              if (c.from.id != null && c.from.id == j.id) {
                c.from.id = null;
                c.from.angle = null;
              }
              if (c.to.id != null && c.to.id == j.id) {
                c.to.id = null;
                c.to.angle = null;
              }
              if (n.indexOf(a) < 0) {
                n.push(a);
                e.push(c);
              }
            }
          }
        }
        delete this.linkerMap.map[j.id];
      }
    }
    this.build();
    MessageSource.beginBatch();
    MessageSource.send("remove", h);
    if (k) {
      var m = Designer.events.push("removed", {
        shapes: b,
        changedIds: n,
        range: o,
      });
      if (m && m.length) {
        e = e.concat(m);
      }
    }
    if (e.length > 0) {
      this.updateMulti(e);
    }
    MessageSource.commit();
    Designer.events.push("changeLinkers", h);
    return true;
  },
  updatePage: function (a, c) {
    var b = $.extend(Model.define.page, a);
    var d = { page: Utils.copy(Model.persistence.page), update: Utils.copy(b) };
    Model.persistence.page = Utils.copy(b);
    MessageSource.send("updatePage", d);
    Designer.initialize.initCanvas();
  },
  setTheme: function (b) {
    Model.define.theme = b;
    var c = {
      theme: Utils.copy(Model.persistence.theme),
      update: Utils.copy(b),
    };
    Model.persistence.theme = Utils.copy(b);
    MessageSource.send("setTheme", c);
    for (var d in Model.define.elements) {
      var a = Model.getShapeById(d);
      Designer.painter.renderShape(a);
    }
  },
  updateWithBeautify: function (h, g, c) {
    var b = { content: g, updates: h };
    if (c != undefined && JSON.stringify(c) != "{}") {
      b.theme = c;
      b.oldTheme = Model.define.theme;
    }
    var j = Model.define.elements;
    MessageSource.send("update_with_beautify", b);
    if (c != undefined) {
      Model.define.theme = c;
    }
    for (var d = 0, e = h.length; d < e; d++) {
      var a = h[d].id;
      j[a] = $.extend(true, j[a], h[d]);
    }
    for (var a in Model.define.elements) {
      var f = Model.getShapeById(a);
      Designer.painter.renderShape(f);
    }
    Designer.events.push("resetBrokenLinker");
  },
  setDefaultStyle: function (b, d) {
    var a = null;
    if (b == "linker") {
      a = Utils.copy(Model.define.defaultLinkerStyle);
      Model.define.defaultLinkerStyle = d;
    } else {
      if (b == "all") {
        a = {
          linkerStyle: Utils.copy(Model.define.defaultLinkerStyle),
          shapeStyle: Utils.copy(Model.define.defaultStyle),
        };
        Model.define.defaultStyle = d.shapeStyle;
        Model.define.defaultLinkerStyle = d.linkerStyle;
      } else {
        a = Utils.copy(Model.define.defaultStyle);
        Model.define.defaultStyle = d;
      }
    }
    var c = { style: a, type: b, update: Utils.copy(d) };
    MessageSource.send("setDefaultStyle", c);
  },
  clearDefaultStyle: function () {
    var a = {
      linkerStyle: Utils.copy(Model.define.defaultLinkerStyle),
      shapeStyle: Utils.copy(Model.define.defaultStyle),
    };
    if (
      Model.define.defaultStyle == null &&
      Model.define.defaultLinkerStyle == null
    ) {
      return;
    }
    delete Model.define.defaultStyle;
    delete Model.define.defaultLinkerStyle;
    var b = { style: a, update: {} };
    MessageSource.send("clearDefaultStyle", b);
  },
  getShapeById: function (a) {
    return this.define.elements[a];
  },
  getPersistenceById: function (a) {
    return this.persistence.elements[a];
  },
  getLinkers: function (b) {
    var c = [];
    for (var d in Model.define.elements) {
      var a = Model.getShapeById(d);
      if (a.name == "linker" && a.linkerType == b) {
        c.push(a);
      }
    }
    return c;
  },
  build: function () {
    this.orderList = [];
    this.orderListGroup = {};
    this.linkerMap.empty();
    for (var f in Model.define.elements) {
      var a = Model.getShapeById(f);
      this.orderList.push({ id: a.id, zindex: a.props.zindex });
      this.buildOrderListGroup(a);
      if (a.name == "linker") {
        if (a.from.id != null) {
          this.linkerMap.add(a.from.id, a.id);
        }
        if (a.to.id != null) {
          this.linkerMap.add(a.to.id, a.id);
        }
      }
      if (a.group) {
        this.groupMap.push(a.group, a.id);
      }
    }
    this.orderList.sort(function e(h, g) {
      return h.zindex - g.zindex;
    });
    for (var d in this.orderListGroup) {
      this.orderListGroup[d].sort(function e(h, g) {
        return h.zindex - g.zindex;
      });
    }
    for (var c = 0; c < Model.orderList.length; c++) {
      var f = Model.orderList[c].id;
      $("#" + f).css("z-index", c);
    }
    var b = 0;
    if (this.orderList.length > 0) {
      b = this.orderList[this.orderList.length - 1].zindex;
    }
    this.maxZIndex = b;
  },
  buildOrderListGroup: function (h) {
    if (h.name != "linker") {
      var i = Utils.getShapeBox(h);
      var f = Math.ceil((i.x - 10) / 500),
        d = Math.ceil((i.x + i.w + 10) / 500),
        b = Math.ceil((i.y - 10) / 500),
        a = Math.ceil((i.y + i.h + 10) / 500);
    } else {
      if (h.name == "linker") {
        var g = Utils.getLinkerBox(h);
        var f = Math.ceil((g.x - 10) / 500),
          d = Math.ceil((g.x + g.w + 10) / 500),
          b = Math.ceil((g.y - 10) / 500),
          a = Math.ceil((g.y + g.h + 10) / 500);
      }
    }
    for (var e = f; e <= d; e++) {
      for (var c = b; c <= a; c++) {
        if (this.orderListGroup[e + "_" + c] == undefined) {
          this.orderListGroup[e + "_" + c] = [];
        }
        this.orderListGroup[e + "_" + c].push({
          id: h.id,
          zindex: h.props.zindex,
        });
      }
    }
  },
  getOrderListGroup: function (a, b) {
    return (
      this.orderListGroup[
        Math.ceil(a.restoreScale() / 500) +
          "_" +
          Math.ceil(b.restoreScale() / 500)
      ] || []
    );
  },
  getShapeLinkers: function (a) {
    return this.linkerMap.map[a];
  },
  getGroupShapes: function (a) {
    return this.groupMap.map[a];
  },
  changeShape: function (c, f) {
    var d = Utils.copy(Schema.shapes[f]);
    c.name = f;
    c.title = d.shapeName;
    var b = d.attribute;
    if (c.attribute && typeof c.attribute.collapsed != "undefined") {
      b.collapsed = c.attribute.collapsed;
    }
    if (c.attribute && typeof c.attribute.collapseW != "undefined") {
      b.collapseW = c.attribute.collapseW;
    }
    if (c.attribute && typeof c.attribute.collapseH != "undefined") {
      b.collapseH = c.attribute.collapseH;
    }
    if (
      c.attribute &&
      c.attribute.markers &&
      c.attribute.markers.indexOf("expand") >= 0
    ) {
      if (!b.markers) {
        b.markers = [];
      }
      b.markers.push("expand");
    }
    c.attribute = b;
    c.dataAttributes = d.dataAttributes;
    if (c.dataAttributes) {
      for (var e = 0; e < c.dataAttributes.length; e++) {
        var b = c.dataAttributes[e];
        b.id = Utils.newId();
      }
    }
    var a = "";
    if (c.textBlock.length > 0) {
      a = c.textBlock[0].text;
    }
    c.path = d.path;
    c.textBlock = d.textBlock;
    if (c.textBlock.length > 0) {
      c.textBlock[0].text = a;
    }
    c.anchors = d.anchors;
    if (
      c.fillStyle &&
      c.fillStyle.type == "image" &&
      d.fillStyle &&
      d.fillStyle.type == "image"
    ) {
      c.fillStyle = d.fillStyle;
    }
    Schema.initShapeFunctions(c);
    Designer.painter.renderShape(c);
  },
};
var Utils = {
  getDomById: function (a) {
    return document.getElementById(a);
  },
  newId: function () {
    var b = Math.random();
    var a = b + new Date().getTime();
    return a.toString(16).replace(".", "");
  },
  isChrome: function () {
    return navigator.userAgent.toLowerCase().indexOf("chrome") >= 0;
  },
  isFirefox: function () {
    return navigator.userAgent.toLowerCase().indexOf("firefox") >= 0;
  },
  isSafari: function () {
    var a = navigator.userAgent.toLowerCase();
    return a.indexOf("safari") !== -1 && a.indexOf("chrome") === -1;
  },
  isIE: function () {
    var a = navigator.userAgent;
    return (
      a.indexOf("MSIE ") > -1 ||
      a.indexOf("Trident/") > -1 ||
      a.indexOf("Edge/") > -1
    );
  },
  isMac: function () {
    return true;
  },
  getShapeByPosition: function (O, N, I) {
    var m = [],
      W = Utils.isMac();
    var v = Model.getOrderListGroup(O, N);
    for (var Y = v.length - 1; Y >= 0; Y--) {
      var R = v[Y].id;
      var aa = $("#" + R);
      if (aa.length == 0) {
        return;
      }
      var s = Model.getShapeById(R);
      if (s.attribute && s.attribute.collapseBy) {
        continue;
      }
      var Z = 1;
      if (W) {
        Z = 2;
      }
      var u = aa.position();
      var H = O - u.left;
      var G = N - u.top;
      var S = { x: u.left, y: u.top, w: aa.width(), h: aa.height() };
      var U = aa.find(".shape_canvas")[0];
      var k = U.getContext("2d");
      if (s.name == "linker") {
        if (s.textPos != null) {
          if (s.textPos.pos == "top") {
            S.y = Math.min(
              S.y,
              s.textPos.y - aa.children(".linker_text").outerHeight()
            );
          } else {
            if (s.textPos.pos == "bottom") {
              S.h += aa.children(".linker_text").outerHeight();
            }
          }
        }
        var c = this.pointInRect(O, N, S);
        if (!c) {
          continue;
        }
        if (I) {
          continue;
        }
        var P = 10;
        P = P.toScale();
        var F = { x: O - P, y: N - P, w: P * 2, h: P * 2 };
        if (this.pointInRect(s.to.x.toScale(), s.to.y.toScale(), F)) {
          var t = { type: "linker_point", point: "end", shape: s };
          m.push(t);
          continue;
        } else {
          if (this.pointInRect(s.from.x.toScale(), s.from.y.toScale(), F)) {
            var t = { type: "linker_point", point: "from", shape: s };
            m.push(t);
            continue;
          } else {
            var w = aa.find(".text_canvas");
            var B = w.position();
            var F = {
              x: B.left,
              y: B.top,
              w: w.outerWidth(),
              h: w.outerHeight(),
            };
            if (this.pointInRect(H, G, F)) {
              var t = { type: "linker_text", shape: s };
              m.push(t);
              continue;
            }
            P = 7;
            P = P.toScale();
            var D = this.pointInLinker(
              { x: O.restoreScale(), y: N.restoreScale() },
              s,
              P
            );
            if (D > -1) {
              var t = { type: "linker", shape: s, pointIndex: D };
              m.push(t);
              continue;
            }
          }
        }
      } else {
        var c = this.pointInRect(O, N, S);
        if (c && s.locked && !I) {
          if (k.isPointInPath(H * Z, G * Z)) {
            var t = { type: "shape", shape: s };
            m.push(t);
          }
          continue;
        }
        var P = 7;
        if (c) {
          P = P.toScale();
          var F = { x: O - P, y: N - P, w: P * 2, h: P * 2 };
          var K = {
            x: s.props.x + s.props.w / 2,
            y: s.props.y + s.props.h / 2,
          };
          var q = s.getAnchors();
          var t = null;
          for (var h = 0; h < q.length; h++) {
            var f = q[h];
            f = this.getRotated(
              K,
              { x: s.props.x + f.x, y: s.props.y + f.y },
              s.props.angle
            );
            if (Utils.pointInRect(f.x.toScale(), f.y.toScale(), F)) {
              var r = Utils.getPointAngle(R, f.x, f.y, P);
              f.angle = r;
              t = { type: "bounding", shape: s, linkPoint: f };
              if (k.isPointInPath(H * Z, G * Z)) {
                t.inPath = true;
              }
              break;
            }
          }
          if (t != null) {
            m.push(t);
            continue;
          }
        }
        if (s.dataAttributes) {
          var t = null;
          for (var l = 0; l < s.dataAttributes.length; l++) {
            var p = s.dataAttributes[l];
            if (p.type == "link" && p.showType && p.showType != "none") {
              var E = aa.children("#attr_canvas_" + p.id);
              if (E.length > 0) {
                var z = E.position();
                var M = H - z.left;
                var L = G - z.top;
                var n = E[0].getContext("2d");
                if (n.isPointInPath(M, L)) {
                  t = { type: "dataAttribute", shape: s, attribute: p };
                  break;
                }
              }
            }
          }
          if (t != null) {
            m.push(t);
            continue;
          }
        }
        if (!c) {
          continue;
        }
        var V = H,
          C = G;
        if (W) {
          (V = H * 2 + 4), (C = G * 2 + 6);
        }
        if (k.isPointInPath(V, C)) {
          if (I) {
            var q = s.getAnchors();
            if (q && q.length) {
              var A = false;
              for (var X = Y + 1; X < v.length; X++) {
                var a = v[X].id;
                var T = Model.getShapeById(a);
                if (Utils.rectInRect(T.props, s.props)) {
                  A = true;
                  continue;
                }
              }
              if (A) {
                continue;
              }
              var t = { type: "shape", shape: s };
              m.push(t);
              continue;
            } else {
              continue;
            }
          } else {
            var t = { type: "shape", shape: s };
            m.push(t);
            continue;
          }
        } else {
          if (
            !s.attribute ||
            typeof s.attribute.linkable == "undefined" ||
            s.attribute.linkable
          ) {
            var r = Utils.getPointAngle(
              R,
              O.restoreScale(),
              N.restoreScale(),
              P
            );
            if (r != null) {
              var t = null;
              var b = { angle: r };
              for (var J = 1; J <= P; J++) {
                if (r == 0) {
                  b.x = H + J;
                  b.y = G;
                } else {
                  if (r < Math.PI / 2) {
                    b.x = H + J * Math.cos(r);
                    b.y = G + J * Math.sin(r);
                  } else {
                    if (r == Math.PI / 2) {
                      b.x = H;
                      b.y = G + J;
                    } else {
                      if (r < Math.PI) {
                        b.x = H - J * Math.sin(r - Math.PI / 2);
                        b.y = G + J * Math.cos(r - Math.PI / 2);
                      } else {
                        if (r == Math.PI) {
                          b.x = H - J;
                          b.y = G;
                        } else {
                          if (r < (Math.PI / 2) * 3) {
                            b.x = H - J * Math.cos(r - Math.PI);
                            b.y = G - J * Math.sin(r - Math.PI);
                          } else {
                            if (r == (Math.PI / 2) * 3) {
                              b.x = H;
                              b.y = G - J;
                            } else {
                              b.x = H + J * Math.sin(r - (Math.PI / 2) * 3);
                              b.y = G - J * Math.cos(r - (Math.PI / 2) * 3);
                            }
                          }
                        }
                      }
                    }
                  }
                }
                if (k.isPointInPath(b.x * Z, b.y * Z)) {
                  b.x += u.left;
                  b.y += u.top;
                  b.x = b.x.restoreScale();
                  b.y = b.y.restoreScale();
                  t = { type: "bounding", shape: s, linkPoint: b };
                  break;
                }
              }
              if (t != null) {
                m.push(t);
                continue;
              }
            }
          }
        }
      }
    }
    var t = null;
    if (m.length == 1) {
      t = m[0];
    }
    if (m.length > 1 && I) {
      t = m[0];
    } else {
      if (m.length > 1) {
        var g = m[0];
        if (
          g.type == "bounding" &&
          g.type != "linker_point" &&
          g.type != "linker"
        ) {
          return g;
        }
        var D = [];
        var d = [];
        var o = [];
        for (var Y = 0; Y < m.length; Y++) {
          var Q = m[Y];
          if (Q.type == "bounding") {
            o.push(Q);
          } else {
            if (Q.type == "linker") {
              D.push(Q);
            } else {
              if (Q.type == "linker_point") {
                d.push(Q);
              }
            }
          }
        }
        if (o.length > 0 && d.length > 0) {
          for (var Y = 0; Y < o.length; Y++) {
            var Q = o[Y];
            if (Q.inPath) {
              t = Q;
              break;
            }
          }
        }
        if (t == null && d.length > 0) {
          d.sort(function e(j, i) {
            if (Utils.isSelected(j.shape.id) && !Utils.isSelected(i.shape.id)) {
              return -1;
            } else {
              if (
                !Utils.isSelected(j.shape.id) &&
                Utils.isSelected(i.shape.id)
              ) {
                return 1;
              } else {
                return i.shape.props.zindex - j.shape.props.zindex;
              }
            }
          });
          t = d[0];
        }
        if (t == null && D.length > 0) {
          D.sort(function e(j, i) {
            if (Utils.isSelected(j.shape.id) && !Utils.isSelected(i.shape.id)) {
              return -1;
            } else {
              if (
                !Utils.isSelected(j.shape.id) &&
                Utils.isSelected(i.shape.id)
              ) {
                return 1;
              } else {
                return i.shape.props.zindex - j.shape.props.zindex;
              }
            }
          });
          t = D[0];
        }
        if (t == null) {
          t = m[0];
        }
      }
    }
    return t;
  },
  checkCross: function (i, g, f, e) {
    var a = false;
    var h = (g.x - i.x) * (e.y - f.y) - (g.y - i.y) * (e.x - f.x);
    if (h != 0) {
      var c = ((i.y - f.y) * (e.x - f.x) - (i.x - f.x) * (e.y - f.y)) / h;
      var b = ((i.y - f.y) * (g.x - i.x) - (i.x - f.x) * (g.y - i.y)) / h;
      if (c >= 0 && c <= 1 && b >= 0 && b <= 1) {
        a = true;
      }
    }
    return a;
  },
  rectCross: function (h, g) {
    var d = h.x;
    var f = h.x + h.w;
    var j = h.y;
    var b = h.y + h.h;
    var c = g.x;
    var e = g.x + g.w;
    var i = g.y;
    var a = g.y + g.h;
    if (d < e && c < f && j < a && i < b) {
      return true;
    } else {
      return false;
    }
  },
  rectInRect: function (c, a) {
    var f = { x: c.x, y: c.y };
    var e = { x: c.x + c.w, y: c.y };
    var d = { x: c.x + c.w, y: c.y + c.h };
    var b = { x: c.x, y: c.y + c.h };
    if (
      this.pointInRect(f.x, f.y, a) &&
      this.pointInRect(e.x, e.y, a) &&
      this.pointInRect(d.x, d.y, a) &&
      this.pointInRect(b.x, b.y, a)
    ) {
      return true;
    } else {
      return false;
    }
  },
  pointInPolygon: function (a, c) {
    var h, g, f, e;
    h = a;
    g = { x: -1000000, y: a.y };
    var d = 0;
    for (var b = 0; b < c.length - 1; b++) {
      f = c[b];
      e = c[b + 1];
      if (Utils.checkCross(h, g, f, e) == true) {
        d++;
      }
    }
    f = c[c.length - 1];
    e = c[0];
    if (Utils.checkCross(h, g, f, e) == true) {
      d++;
    }
    return d % 2 == 0 ? false : true;
  },
  pointInRect: function (b, a, c) {
    if (b >= c.x && b <= c.x + c.w && a >= c.y && a <= c.y + c.h) {
      return true;
    }
    return false;
  },
  pointInLinker: function (h, e, f) {
    var j = this.getLinkerLinePoints(e);
    var c = { x: h.x - f, y: h.y };
    var b = { x: h.x + f, y: h.y };
    var a = { x: h.x, y: h.y - f };
    var l = { x: h.x, y: h.y + f };
    for (var d = 1; d < j.length; d++) {
      var k = j[d - 1];
      var i = j[d];
      var g = this.checkCross(c, b, k, i);
      if (g) {
        return d;
      }
      g = this.checkCross(a, l, k, i);
      if (g) {
        return d;
      }
    }
    return -1;
  },
  intersection: function (o, n, m, k) {
    var c = o.x,
      l = o.y,
      b = n.x,
      j = n.y,
      a = m.x,
      i = m.y,
      p = k.x,
      h = k.y,
      f,
      e,
      g;
    g = (c - b) * (i - h) - (l - j) * (a - p);
    f = (c * j - l * b) * (a - p) - (c - b) * (a * h - i * p);
    e = (c * j - l * b) * (i - h) - (l - j) * (a * h - i * p);
    return { x: f / g, y: e / g };
  },
  getLinesFromLinker: function (e) {
    var g = e.from,
      h = e.to;
    var f = [],
      i = e.points;
    if (i.length == 2 && i[0].x == i[1].x && i[0].y == i[1].y) {
      f.push({ x1: g.x, y1: g.y, x2: h.x, y2: h.y });
    } else {
      var c = g;
      for (var d = 0; d < i.length; d++) {
        var a = i[d];
        if (a.x == c.x && a.y == c.y) {
          continue;
        }
        var b = { x1: c.x, y1: c.y, x2: a.x, y2: a.y };
        f.push(b);
        c = a;
      }
      f.push({ x1: c.x, y1: c.y, x2: h.x, y2: h.y });
    }
    return f;
  },
  getLinkerLength: function (c) {
    var b = this.getLinkerLinePoints(c);
    var a = 0;
    for (var f = 1; f < b.length; f++) {
      var h = b[f - 1];
      var e = b[f];
      var g = Utils.measureDistance(h, e);
      a += g;
    }
    return a;
  },
  getShapesByRange: function (c) {
    var a = [];
    for (var e in Model.define.elements) {
      var b = Model.getShapeById(e);
      var d = b.props;
      if (b.name == "linker") {
        d = this.getLinkerBox(b);
      } else {
        d = this.getShapeBox(b);
      }
      if (
        this.pointInRect(d.x, d.y, c) &&
        this.pointInRect(d.x + d.w, d.y, c) &&
        this.pointInRect(d.x + d.w, d.y + d.h, c) &&
        this.pointInRect(d.x, d.y + d.h, c)
      ) {
        a.push(b.id);
      }
    }
    return a;
  },
  getControlBox: function (e) {
    var g = { x1: null, y1: null, x2: null, y2: null };
    for (var b = 0; b < e.length; b++) {
      var f = e[b];
      var a = Model.getShapeById(f);
      var d;
      if (a.name == "linker") {
        d = this.getLinkerBox(a);
      } else {
        d = this.getShapeBox(a);
      }
      if (g.x1 == null || d.x < g.x1) {
        g.x1 = d.x;
      }
      if (g.y1 == null || d.y < g.y1) {
        g.y1 = d.y;
      }
      if (g.x2 == null || d.x + d.w > g.x2) {
        g.x2 = d.x + d.w;
      }
      if (g.y2 == null || d.y + d.h > g.y2) {
        g.y2 = d.y + d.h;
      }
    }
    var c = { x: g.x1, y: g.y1, w: g.x2 - g.x1, h: g.y2 - g.y1 };
    return c;
  },
  getShapesBounding: function (a) {
    var f = { x1: null, y1: null, x2: null, y2: null };
    for (var c = 0; c < a.length; c++) {
      var b = a[c];
      var d;
      if (b.name == "linker") {
        d = this.getLinkerBox(b);
      } else {
        d = b.props;
      }
      if (f.x1 == null || d.x < f.x1) {
        f.x1 = d.x;
      }
      if (f.y1 == null || d.y < f.y1) {
        f.y1 = d.y;
      }
      if (f.x2 == null || d.x + d.w > f.x2) {
        f.x2 = d.x + d.w;
      }
      if (f.y2 == null || d.y + d.h > f.y2) {
        f.y2 = d.y + d.h;
      }
    }
    var e = { x: f.x1, y: f.y1, w: f.x2 - f.x1, h: f.y2 - f.y1 };
    return e;
  },
  getShapeContext: function (b) {
    var a = Utils.getDomById(b);
    return a.getElementsByTagName("canvas")[0].getContext("2d");
  },
  selectIds: [],
  selectShape: function (h, d) {
    if (typeof h == "string") {
      var m = h;
      h = [];
      h.push(m);
    }
    if (h.length <= 0) {
      return;
    }
    var j = [];
    for (var f = 0; f < h.length; f++) {
      var b = h[f];
      var l = Model.getShapeById(b);
      if (l.attribute && l.attribute.collapseBy) {
        continue;
      }
      j.push(b);
      if (l.group) {
        var c = Model.getGroupShapes(l.group);
        Utils.mergeArray(j, c);
      }
    }
    var a = [];
    for (var f = 0; f < j.length; f++) {
      var b = j[f];
      var l = Model.getShapeById(b);
      if (l.parent && l.resizeDir.length == 0 && a.indexOf(l.parent) < 0) {
        a.push(l.parent);
      } else {
        if (a.indexOf(b) < 0) {
          a.push(b);
        }
      }
    }
    h = a;
    Utils.removeAnchors();
    Utils.selectIds = [];
    for (var k = 0; k < h.length; k++) {
      var m = h[k];
      var l = Model.getShapeById(m);
      Utils.selectIds.push(m);
      if (l.name == "linker") {
        if (this.isLocked(l.id)) {
          Utils.showLockers(l);
        } else {
          if (Model.intersection[l.id]) {
            Designer.painter.renderLinker(
              l,
              null,
              null,
              Model.intersection[l.id]
            );
          } else {
            Designer.painter.renderLinker(l);
          }
        }
      } else {
        if (this.isLocked(l.id)) {
          Utils.showLockers(l);
        } else {
          Utils.showAnchors(l);
        }
      }
    }
    var a = Utils.getSelectedIds();
    var n = false;
    if (a.length == 1) {
      var g = Model.getShapeById(a[0]);
      if (g.name == "linker") {
        n = true;
        Utils.showLinkerControls();
      }
    }
    if (a.length > 0 && !n) {
      var e = Designer.painter.drawControls(a);
    }
    if (typeof d == "undefined") {
      d = true;
    }
    if (this.selectCallback && d) {
      this.selectCallback();
    }
    Designer.events.push("selectChanged");
    this.showLinkerCursor();
  },
  selectCallback: null,
  unselect: function () {
    var c = this.selectIds;
    this.selectIds = [];
    this.unselectGrid();
    for (var b = 0; b < c.length; b++) {
      var d = c[b];
      var a = Model.getShapeById(d);
      if (a.name == "linker") {
        if (Model.intersection[a.id]) {
          Designer.painter.renderLinker(
            a,
            null,
            null,
            Model.intersection[a.id]
          );
        } else {
          Designer.painter.renderLinker(a);
        }
      }
    }
    $("#shape_controls").hide();
    Utils.removeLockers();
    Utils.removeAnchors();
    Designer.events.push("selectChanged");
    this.hideLinkerCursor();
    this.hideLinkerControls();
  },
  getSelected: function () {
    var a = [];
    for (var b = 0; b < this.selectIds.length; b++) {
      var d = this.selectIds[b];
      if (!Utils.isLocked(d)) {
        var c = Model.getShapeById(d);
        a.push(c);
      }
    }
    return a;
  },
  getSelectedIds: function () {
    var a = [];
    for (var b = 0; b < this.selectIds.length; b++) {
      var c = this.selectIds[b];
      if (!Utils.isLocked(c)) {
        a.push(c);
      }
    }
    return a;
  },
  getSelectedLinkers: function () {
    var a = [];
    for (var b = 0; b < this.selectIds.length; b++) {
      var d = this.selectIds[b];
      if (!Utils.isLocked(d)) {
        var c = Model.getShapeById(d);
        if (c.name == "linker") {
          a.push(c);
        }
      }
    }
    return a;
  },
  getSelectedLinkerIds: function () {
    var a = [];
    for (var b = 0; b < this.selectIds.length; b++) {
      var d = this.selectIds[b];
      if (!Utils.isLocked(d)) {
        var c = Model.getShapeById(d);
        if (c.name == "linker") {
          a.push(d);
        }
      }
    }
    return a;
  },
  getSelectedShapeIds: function () {
    var a = [];
    for (var b = 0; b < this.selectIds.length; b++) {
      var d = this.selectIds[b];
      if (!Utils.isLocked(d)) {
        var c = Model.getShapeById(d);
        if (c.name != "linker") {
          a.push(d);
        }
      }
    }
    return a;
  },
  getSelectedLockedIds: function () {
    var a = [];
    for (var b = 0; b < this.selectIds.length; b++) {
      var c = this.selectIds[b];
      if (Utils.isLocked(c)) {
        a.push(c);
      }
    }
    return a;
  },
  getSelectedGroups: function () {
    var a = [];
    for (var c = 0; c < this.selectIds.length; c++) {
      var d = this.selectIds[c];
      var b = Model.getShapeById(d);
      if (b.group && a.indexOf(b.group) < 0) {
        a.push(b.group);
      }
    }
    return a;
  },
  getSelectedGroupsAndShapes: function () {
    var a = [];
    for (var c = 0; c < this.selectIds.length; c++) {
      var d = this.selectIds[c];
      var b = Model.getShapeById(d);
      if (b.group && a.indexOf(b.group) < 0) {
        a.push(b.group);
      }
      if (!b.group) {
        if (b.name != "linker") {
          a.push(b.id);
        } else {
          if (b.from.id == null && b.to.id == null) {
            a.push(b.id);
          }
        }
      }
    }
    return a;
  },
  isSelected: function (a) {
    if (this.selectIds.indexOf(a) >= 0 && !this.isLocked(a)) {
      return true;
    }
    return false;
  },
  selectText: function (b) {
    var d = document;
    if (d.body.createTextRange) {
      var a = document.body.createTextRange();
      a.moveToElementText(b);
      a.select();
    } else {
      if (window.getSelection) {
        var c = window.getSelection();
        var a = document.createRange();
        a.selectNodeContents(b);
        c.removeAllRanges();
        c.addRange(a);
      }
    }
  },
  isLocked: function (a) {
    if (Model.getShapeById(a).locked) {
      return true;
    } else {
      return false;
    }
  },
  linkerCursorTimer: null,
  showLinkerCursor: function () {
    this.hideLinkerCursor();
    var l = Utils.getSelectedIds();
    if (l.length == 1) {
      var c = Model.getShapeById(l[0]);
      if (c.name != "linker") {
        var f = Model.linkerMap.map[c.id];
        if (f && f.length) {
          var m = [];
          for (var o = 0; o < f.length; o++) {
            var v = f[o];
            var j = Model.getShapeById(v);
            if (c.id != j.from.id || !j.to.id) {
              continue;
            }
            var q = this.getLinkerLength(j).toScale();
            var n = [];
            if (j.linkerType == "broken") {
              n.push({ x: j.from.x.toScale(), y: j.from.y.toScale(), t: 0 });
              for (var t = 0; t < j.points.length; t++) {
                var k = j.points[t];
                n.push({ x: k.x.toScale(), y: k.y.toScale() });
              }
              n.push({ x: j.to.x.toScale(), y: j.to.y.toScale() });
              var s = 0;
              for (var t = 1; t < n.length; t++) {
                var b = n[t - 1];
                var a = n[t];
                s += Utils.measureDistance(b, a);
                a.t = s / q;
              }
            }
            var h = Math.floor(q / 120) + 1;
            var e = 3 / q;
            var u = (Math.ceil(q / 120) * 120) / q;
            var r = 0;
            while (r < q) {
              var g = { t: r / q, step: e, linker: j, points: n, maxT: u };
              m.push(g);
              r += 120;
            }
          }
          this.playLinkerCursor(m);
        }
      }
    }
  },
  playLinkerCursor: function (f) {
    for (var c = 0; c < f.length; c++) {
      var h = f[c];
      var g = $("<div class='linker_cursor'></div>").appendTo(
        "#designer_canvas"
      );
      var e = h.linker;
      var a = Utils.getLinkerLineStyle(e.lineStyle);
      var b = (a.lineWidth + 2).toScale();
      if (b < 5) {
        b = 5;
      }
      var d = b / 2;
      h.half = d;
      h.dom = g;
      g.css({
        width: b,
        height: b,
        "-webkit-border-radius": d,
        "-moz-border-radius": d,
        "-ms-border-radius": d,
        "-o-border-radius": d,
        "border-radius": d,
        "z-index": $("#" + e.id).css("z-index"),
      });
    }
    this.linkerCursorTimer = setInterval(function () {
      for (var j = 0; j < f.length; j++) {
        var q = f[j];
        var l = q.linker;
        if (q.t >= q.maxT) {
          q.t = 0;
          q.dom.show();
        }
        var u = q.t;
        if (l.linkerType == "broken") {
          for (var k = 1; k < q.points.length; k++) {
            var r = q.points[k - 1];
            var p = q.points[k];
            if (u >= r.t && u < p.t) {
              var v = (u - r.t) / (p.t - r.t);
              var n = (1 - v) * r.x + v * p.x;
              var m = (1 - v) * r.y + v * p.y;
              q.dom.css({ left: n - q.half, top: m - q.half });
              break;
            }
          }
        } else {
          if (l.linkerType == "curve") {
            var s = l.from;
            var r = l.points[0];
            var p = l.points[1];
            var o = l.to;
            var n =
              s.x.toScale() * Math.pow(1 - u, 3) +
              r.x.toScale() * u * Math.pow(1 - u, 2) * 3 +
              p.x.toScale() * Math.pow(u, 2) * (1 - u) * 3 +
              o.x.toScale() * Math.pow(u, 3);
            var m =
              s.y.toScale() * Math.pow(1 - u, 3) +
              r.y.toScale() * u * Math.pow(1 - u, 2) * 3 +
              p.y.toScale() * Math.pow(u, 2) * (1 - u) * 3 +
              o.y.toScale() * Math.pow(u, 3);
            q.dom.css({ left: n - q.half, top: m - q.half });
          } else {
            var n = (1 - u) * l.from.x.toScale() + u * l.to.x.toScale();
            var m = (1 - u) * l.from.y.toScale() + u * l.to.y.toScale();
            q.dom.css({ left: n - q.half, top: m - q.half });
          }
        }
        q.t += q.step;
        if (q.t >= 1) {
          q.dom.hide();
        }
      }
    }, 30);
  },
  hideLinkerCursor: function () {
    if (this.linkerCursorTimer) {
      clearInterval(this.linkerCursorTimer);
    }
    $(".linker_cursor").remove();
  },
  showLinkerControls: function () {
    this.hideLinkerControls();
    var b = Utils.getSelectedIds();
    var c = null;
    if (b.length == 1) {
      var a = Model.getShapeById(b[0]);
      if (a.name == "linker" && a.linkerType == "curve") {
        c = a;
      }
    }
    if (c == null) {
      return;
    }
    function d(i, h) {
      var g = null;
      var n = null;
      if (h == "from") {
        g = i.from;
        n = i.points[0];
      } else {
        g = i.to;
        n = i.points[1];
      }
      var j = Utils.measureDistance(g, n).toScale() - 6;
      var m = {
        x: (0.5 * g.x + 0.5 * n.x).toScale(),
        y: (0.5 * g.y + 0.5 * n.y).toScale(),
      };
      var f = Utils.getAngle(g, n) + Math.PI / 2;
      var o = $("<div class='linker_control_line'></div>").appendTo(
        "#designer_canvas"
      );
      var l = $("<div class='linker_control_point'></div>").appendTo(
        "#designer_canvas"
      );
      var e = Math.round((f / (Math.PI * 2)) * 360);
      var k = "rotate(" + e + "deg)";
      o.css({
        left: m.x,
        top: m.y - j / 2,
        height: j,
        "z-index": Model.orderList.length,
        "-webkit-transform": k,
        "-ms-transform": k,
        "-o-transform": k,
        "-moz-transform": k,
        transform: k,
      });
      l.css({
        left: n.x.toScale() - 4,
        top: n.y.toScale() - 4,
        "z-index": 999999,
      });
      l.attr("ty", h);
      l.unbind().bind("mousedown", function (t) {
        i = Model.getShapeById(i.id);
        var v = null;
        if (h == "from") {
          v = i.points[0];
        } else {
          v = i.points[1];
        }
        t.stopPropagation();
        l.addClass("moving");
        Designer.op.changeState("changing_curve");
        var q = t.pageX,
          p = t.pageY,
          u = 0,
          s = 0;
        if (i.textPos != null) {
          u = i.textPos.x;
          s = i.textPos.y;
        }
        var r = $("#designer_canvas");
        $(document).bind("mousemove.change_curve", function (x) {
          var y = Utils.getRelativePos(x.pageX, x.pageY, r);
          v.x = y.x.restoreScale();
          v.y = y.y.restoreScale();
          if (i.textPos != null) {
            var w = Utils.restoreScale({ x: x.pageX - q, y: x.pageY - p });
            i.textPos.x = u + w.x;
            i.textPos.y = s + w.y;
          }
          Designer.painter.renderLinker(i, null, true);
          Model.define.elements[i.id] = i;
          Utils.showLinkerControls();
          $(".linker_control_point[ty=" + l.attr("ty") + "]").addClass(
            "moving"
          );
          $(document)
            .unbind("mouseup.changed_curve")
            .bind("mouseup.changed_curve", function (z) {
              Model.update(i);
              $(document).unbind("mouseup.changed_curve");
            });
        });
        $(document)
          .unbind("mouseup.change_curve")
          .bind("mouseup.change_curve", function (w) {
            $(document).unbind("mouseup.change_curve");
            $(document).unbind("mousemove.change_curve");
            $(".linker_control_point").removeClass("moving");
            Designer.op.resetState();
          });
      });
      return l;
    }
    d(c, "from");
    d(c, "to");
  },
  hideLinkerControls: function () {
    $(".linker_control_line").remove();
    $(".linker_control_point").remove();
  },
  showAnchors: function (i) {
    if ($(".shape_contour[forshape=" + i.id + "]").length > 0) {
      return;
    }
    var f = $(
      "<div class='shape_contour' forshape='" + i.id + "'></div>"
    ).appendTo($("#designer_canvas"));
    f.css({
      left: i.props.x.toScale(),
      top: i.props.y.toScale(),
      "z-index": Model.orderList.length + 1,
    });
    if (!Utils.isSelected(i.id)) {
      f.addClass("hovered_contour");
    }
    var c = Designer.config.anchorSize - 2;
    var b = {
      "border-color": Designer.config.anchorColor,
      "border-radius": Designer.config.anchorSize / 2,
      width: c,
      height: c,
    };
    var a = i.getAnchors();
    var h = { x: i.props.w / 2, y: i.props.h / 2 };
    var e = i.props.angle;
    for (var j = 0; j < a.length; j++) {
      var g = a[j];
      var k = $("<div class='shape_anchor'></div>").appendTo(f);
      var d = this.getRotated(h, g, e);
      b.left = d.x.toScale() - Designer.config.anchorSize / 2;
      b.top = d.y.toScale() - Designer.config.anchorSize / 2;
      k.css(b);
    }
  },
  hideAnchors: function () {
    $(".hovered_contour").remove();
  },
  removeAnchors: function () {
    $(".shape_contour").remove();
  },
  showLockers: function (d) {
    var j = $("#" + d.id);
    var f = j.position();
    function c() {
      var n = $(
        "<canvas class='shape_locker' width='10px' height='10px'></canvas>"
      ).appendTo(j);
      var m = n[0].getContext("2d");
      m.strokeStyle = "#777";
      m.lineWidth = 1;
      var l = 9;
      m.beginPath();
      m.moveTo(2, 2);
      m.lineTo(l, l);
      m.moveTo(2, l);
      m.lineTo(l, 2);
      m.stroke();
      return n;
    }
    function e(l) {
      var m = c();
      m.css({
        left: l.x.toScale() - f.left - 5,
        top: l.y.toScale() - f.top - 5,
      });
    }
    if (d.name != "linker") {
      var b = d.props;
      var a = { x: b.x + b.w / 2, y: b.y + b.h / 2 };
      var k = this.getRotated(a, { x: b.x, y: b.y }, d.props.angle);
      e(k);
      var i = this.getRotated(a, { x: b.x + b.w, y: b.y }, d.props.angle);
      e(i);
      var h = this.getRotated(a, { x: b.x + b.w, y: b.y + b.h }, d.props.angle);
      e(h);
      var g = this.getRotated(a, { x: b.x, y: b.y + b.h }, d.props.angle);
      e(g);
    } else {
      e(d.from);
      e(d.to);
    }
  },
  removeLockers: function () {
    $(".shape_locker").remove();
  },
  measureDistance: function (d, c) {
    var b = c.y - d.y;
    var a = c.x - d.x;
    return Math.sqrt(Math.pow(b, 2) + Math.pow(a, 2));
  },
  removeFromArray: function (c, b) {
    var a = c.indexOf(b);
    if (a >= 0) {
      c.splice(a, 1);
    }
    return c;
  },
  addToArray: function (c, b) {
    var a = c.indexOf(b);
    if (a < 0) {
      c.push(b);
    }
    return c;
  },
  mergeArray: function (b, a) {
    for (var c = 0; c < a.length; c++) {
      var d = a[c];
      if (b.indexOf(d) < 0) {
        b.push(d);
      }
    }
    return b;
  },
  getCirclePoints: function (a, h, e) {
    var g = Math.PI / 18;
    var d = [];
    for (var c = 0; c < 36; c++) {
      var b = g * c;
      var f = { x: a - Math.cos(b) * e, y: h - Math.sin(b) * e, angle: b };
      d.push(f);
    }
    return d;
  },
  getPointAngle: function (v, g, e, j) {
    var w = $("#" + v).position();
    var c = Utils.getShapeContext(v);
    var f = Utils.isMac();
    g = g.toScale() - w.left;
    e = e.toScale() - w.top;
    var d = this.getCirclePoints(g, e, j);
    var q = d.length;
    var n = false;
    for (var o = 0; o < q; o++) {
      var l = d[o];
      var t = l.x,
        a = l.y;
      if (f) {
        t = l.x * 2 + 4;
        a = l.y * 2 + 6;
      }
      if (c.isPointInPath(t, a)) {
        l.inPath = true;
        n = true;
      } else {
        l.inPath = false;
      }
    }
    if (n == false) {
      return null;
    }
    var u = null;
    var b = null;
    for (var o = 0; o < q; o++) {
      var l = d[o];
      if (!l.inPath) {
        if (u == null) {
          var k = d[(o - 1 + q) % q];
          if (k.inPath) {
            u = l.angle;
          }
        }
        if (b == null) {
          var m = d[(o + 1 + q) % q];
          if (m.inPath) {
            b = l.angle;
          }
        }
        if (u != null && b != null) {
          break;
        }
      }
    }
    var h = ((Math.PI * 2 + b - u) % (Math.PI * 2)) / 2;
    var s = (u + h) % (Math.PI * 2);
    return s;
  },
  getAngleDir: function (b) {
    var a = Math.PI;
    if (b >= a / 4 && b < (a / 4) * 3) {
      return 1;
    } else {
      if (b >= (a / 4) * 3 && b < (a / 4) * 5) {
        return 2;
      } else {
        if (b >= (a / 4) * 5 && b < (a / 4) * 7) {
          return 3;
        } else {
          return 4;
        }
      }
    }
  },
  getLinkerPoints: function (u, e) {
    var B = [];
    if (u.linkerType == "broken") {
      var D = Math.PI;
      var z = u.from;
      var d = u.to;
      var o = Math.abs(d.x - z.x);
      var E = Math.abs(d.y - z.y);
      var s = 30;
      e = e ? 20 : 0;
      if (z.id != null && d.id != null) {
        var c = this.getAngleDir(z.angle);
        var b = this.getAngleDir(d.angle);
        var h, j, m;
        if (c == 1 && b == 1) {
          if (z.y < d.y) {
            h = z;
            j = d;
            m = false;
          } else {
            h = d;
            j = z;
            m = true;
          }
          var i = Model.getShapeById(h.id).props;
          var w = Model.getShapeById(j.id).props;
          if (j.x >= i.x - s && j.x <= i.x + i.w + s) {
            var p;
            if (j.x < i.x + i.w / 2) {
              p = i.x - s;
            } else {
              p = i.x + i.w + s;
            }
            var n = h.y - s;
            B.push({ x: h.x, y: n });
            n = j.y - s;
            B.push({ x: j.x, y: n });
          } else {
            var n = h.y - s;
            B.push({ x: h.x, y: n });
            B.push({ x: j.x, y: n });
          }
        } else {
          if (c == 3 && b == 3) {
            if (z.y > d.y) {
              h = z;
              j = d;
              m = false;
            } else {
              h = d;
              j = z;
              m = true;
            }
            var i = Model.getShapeById(h.id).props;
            var w = Model.getShapeById(j.id).props;
            if (j.x >= i.x - s && j.x <= i.x + i.w + s) {
              var n = h.y + s;
              var p;
              if (j.x < i.x + i.w / 2) {
                p = i.x - s;
              } else {
                p = i.x + i.w + s;
              }
              B.push({ x: h.x, y: n });
              n = j.y + s;
              B.push({ x: j.x, y: n });
            } else {
              var n = h.y + s;
              B.push({ x: h.x, y: n });
              B.push({ x: j.x, y: n });
            }
          } else {
            if (c == 2 && b == 2) {
              if (z.x > d.x) {
                h = z;
                j = d;
                m = false;
              } else {
                h = d;
                j = z;
                m = true;
              }
              var i = Model.getShapeById(h.id).props;
              var w = Model.getShapeById(j.id).props;
              if (j.y >= i.y - s && j.y <= i.y + i.h + s) {
                var p = h.x + s;
                var n;
                if (j.y < i.y + i.h / 2) {
                  n = i.y - s;
                } else {
                  n = i.y + i.h + s;
                }
                B.push({ x: p, y: h.y });
                p = j.x + s;
                B.push({ x: p, y: j.y });
              } else {
                var p = h.x + s;
                B.push({ x: p, y: h.y });
                B.push({ x: p, y: j.y });
              }
            } else {
              if (c == 4 && b == 4) {
                if (z.x < d.x) {
                  h = z;
                  j = d;
                  m = false;
                } else {
                  h = d;
                  j = z;
                  m = true;
                }
                var i = Model.getShapeById(h.id).props;
                var w = Model.getShapeById(j.id).props;
                if (j.y >= i.y - s && j.y <= i.y + i.h + s) {
                  var p = h.x - s;
                  var n;
                  if (j.y < i.y + i.h / 2) {
                    n = i.y - s;
                  } else {
                    n = i.y + i.h + s;
                  }
                  B.push({ x: p, y: h.y });
                  p = j.x - s;
                  B.push({ x: p, y: j.y });
                } else {
                  var p = h.x - s;
                  B.push({ x: p, y: h.y });
                  B.push({ x: p, y: j.y });
                }
              } else {
                if ((c == 1 && b == 3) || (c == 3 && b == 1)) {
                  if (c == 1) {
                    h = z;
                    j = d;
                    m = false;
                  } else {
                    h = d;
                    j = z;
                    m = true;
                  }
                  var i = Model.getShapeById(h.id).props;
                  var w = Model.getShapeById(j.id).props;
                  if (j.y <= h.y) {
                    var n = h.y - E / 2;
                    B.push({ x: h.x, y: n });
                    B.push({ x: j.x, y: n });
                  } else {
                    var a = i.x + i.w;
                    var k = w.x + w.w;
                    var n = h.y - s;
                    var p;
                    if (k >= i.x && w.x <= a) {
                      var A = i.x + i.w / 2;
                      if (j.x < A) {
                        p = i.x < w.x ? i.x - s : w.x - s;
                      } else {
                        p = a > k ? a + s : k + s;
                      }
                      if (w.y < h.y) {
                        n = w.y - s;
                      }
                    } else {
                      if (j.x < h.x) {
                        p = k + (i.x - k) / 2;
                      } else {
                        p = a + (w.x - a) / 2;
                      }
                    }
                    B.push({ x: h.x, y: n });
                    B.push({ x: p, y: n });
                    n = j.y + s;
                    B.push({ x: p, y: n });
                    B.push({ x: j.x, y: n });
                  }
                } else {
                  if ((c == 2 && b == 4) || (c == 4 && b == 2)) {
                    if (c == 2) {
                      h = z;
                      j = d;
                      m = false;
                    } else {
                      h = d;
                      j = z;
                      m = true;
                    }
                    var i = Model.getShapeById(h.id).props;
                    var w = Model.getShapeById(j.id).props;
                    if (j.x > h.x) {
                      var p = h.x + o / 2;
                      B.push({ x: p, y: h.y });
                      B.push({ x: p, y: j.y });
                    } else {
                      var v = i.y + i.h;
                      var q = w.y + w.h;
                      var p = h.x + s;
                      var n;
                      if (q >= i.y && w.y <= v) {
                        var A = i.y + i.h / 2;
                        if (j.y < A) {
                          n = i.y < w.y ? i.y - s : w.y - s;
                        } else {
                          n = v > q ? v + s : q + s;
                        }
                        if (w.x + w.w > h.x) {
                          p = w.x + w.w + s;
                        }
                      } else {
                        if (j.y < h.y) {
                          n = q + (i.y - q) / 2;
                        } else {
                          n = v + (w.y - v) / 2;
                        }
                      }
                      B.push({ x: p, y: h.y });
                      B.push({ x: p, y: n });
                      p = j.x - s;
                      B.push({ x: p, y: n });
                      B.push({ x: p, y: j.y });
                    }
                  } else {
                    if ((c == 1 && b == 2) || (c == 2 && b == 1)) {
                      if (c == 2) {
                        h = z;
                        j = d;
                        m = false;
                      } else {
                        h = d;
                        j = z;
                        m = true;
                      }
                      var i = Model.getShapeById(h.id).props;
                      var w = Model.getShapeById(j.id).props;
                      if (j.x > h.x && j.y > h.y) {
                        B.push({ x: j.x, y: h.y });
                      } else {
                        if (j.x > h.x && w.x > h.x) {
                          var p;
                          if (w.x - h.x < s * 2) {
                            p = h.x + (w.x - h.x) / 2;
                          } else {
                            p = h.x + s;
                          }
                          var n = j.y - s;
                          B.push({ x: p, y: h.y });
                          B.push({ x: p, y: n });
                          B.push({ x: j.x, y: n });
                        } else {
                          if (j.x <= h.x && j.y > i.y + i.h) {
                            var v = i.y + i.h;
                            var p = h.x + s;
                            var n;
                            if (j.y - v < s * 2) {
                              n = v + (j.y - v) / 2;
                            } else {
                              n = j.y - s;
                            }
                            B.push({ x: p, y: h.y });
                            B.push({ x: p, y: n });
                            B.push({ x: j.x, y: n });
                          } else {
                            var p;
                            var k = w.x + w.w;
                            if (k > h.x) {
                              p = k + s;
                            } else {
                              p = h.x + s;
                            }
                            var n;
                            if (j.y < i.y) {
                              n = j.y - s;
                            } else {
                              n = i.y - s;
                            }
                            B.push({ x: p, y: h.y });
                            B.push({ x: p, y: n });
                            B.push({ x: j.x, y: n });
                          }
                        }
                      }
                    } else {
                      if ((c == 1 && b == 4) || (c == 4 && b == 1)) {
                        if (c == 4) {
                          h = z;
                          j = d;
                          m = false;
                        } else {
                          h = d;
                          j = z;
                          m = true;
                        }
                        var i = Model.getShapeById(h.id).props;
                        var w = Model.getShapeById(j.id).props;
                        var k = w.x + w.w;
                        if (j.x < h.x && j.y > h.y) {
                          B.push({ x: j.x, y: h.y });
                        } else {
                          if (j.x < h.x && k < h.x) {
                            var p;
                            if (h.x - k < s * 2) {
                              p = k + (h.x - k) / 2;
                            } else {
                              p = h.x - s;
                            }
                            var n = j.y - s;
                            B.push({ x: p, y: h.y });
                            B.push({ x: p, y: n });
                            B.push({ x: j.x, y: n });
                          } else {
                            if (j.x >= h.x && j.y > i.y + i.h) {
                              var v = i.y + i.h;
                              var p = h.x - s;
                              var n;
                              if (j.y - v < s * 2) {
                                n = v + (j.y - v) / 2;
                              } else {
                                n = j.y - s;
                              }
                              B.push({ x: p, y: h.y });
                              B.push({ x: p, y: n });
                              B.push({ x: j.x, y: n });
                            } else {
                              var p;
                              if (w.x < h.x) {
                                p = w.x - s;
                              } else {
                                p = h.x - s;
                              }
                              var n;
                              if (j.y < i.y) {
                                n = j.y - s;
                              } else {
                                n = i.y - s;
                              }
                              B.push({ x: p, y: h.y });
                              B.push({ x: p, y: n });
                              B.push({ x: j.x, y: n });
                            }
                          }
                        }
                      } else {
                        if ((c == 2 && b == 3) || (c == 3 && b == 2)) {
                          if (c == 2) {
                            h = z;
                            j = d;
                            m = false;
                          } else {
                            h = d;
                            j = z;
                            m = true;
                          }
                          var i = Model.getShapeById(h.id).props;
                          var w = Model.getShapeById(j.id).props;
                          if (j.x > h.x && j.y < h.y) {
                            B.push({ x: j.x, y: h.y });
                          } else {
                            if (j.x > h.x && w.x > h.x) {
                              var p;
                              if (w.x - h.x < s * 2) {
                                p = h.x + (w.x - h.x) / 2;
                              } else {
                                p = h.x + s;
                              }
                              var n = j.y + s;
                              B.push({ x: p, y: h.y });
                              B.push({ x: p, y: n });
                              B.push({ x: j.x, y: n });
                            } else {
                              if (j.x <= h.x && j.y < i.y) {
                                var p = h.x + s;
                                var n;
                                if (i.y - j.y < s * 2) {
                                  n = j.y + (i.y - j.y) / 2;
                                } else {
                                  n = j.y + s;
                                }
                                B.push({ x: p, y: h.y });
                                B.push({ x: p, y: n });
                                B.push({ x: j.x, y: n });
                              } else {
                                var p;
                                var k = w.x + w.w;
                                if (k > h.x) {
                                  p = k + s;
                                } else {
                                  p = h.x + s;
                                }
                                var n;
                                if (j.y > i.y + i.h) {
                                  n = j.y + s;
                                } else {
                                  n = i.y + i.h + s;
                                }
                                B.push({ x: p, y: h.y });
                                B.push({ x: p, y: n });
                                B.push({ x: j.x, y: n });
                              }
                            }
                          }
                        } else {
                          if ((c == 3 && b == 4) || (c == 4 && b == 3)) {
                            if (c == 4) {
                              h = z;
                              j = d;
                              m = false;
                            } else {
                              h = d;
                              j = z;
                              m = true;
                            }
                            var i = Model.getShapeById(h.id).props;
                            var w = Model.getShapeById(j.id).props;
                            var k = w.x + w.w;
                            if (j.x < h.x && j.y < h.y) {
                              B.push({ x: j.x, y: h.y });
                            } else {
                              if (j.x < h.x && k < h.x) {
                                var p;
                                if (h.x - k < s * 2) {
                                  p = k + (h.x - k) / 2;
                                } else {
                                  p = h.x - s;
                                }
                                var n = j.y + s;
                                B.push({ x: p, y: h.y });
                                B.push({ x: p, y: n });
                                B.push({ x: j.x, y: n });
                              } else {
                                if (j.x >= h.x && j.y < i.y) {
                                  var p = h.x - s;
                                  var n;
                                  if (i.y - j.y < s * 2) {
                                    n = j.y + (i.y - j.y) / 2;
                                  } else {
                                    n = j.y + s;
                                  }
                                  B.push({ x: p, y: h.y });
                                  B.push({ x: p, y: n });
                                  B.push({ x: j.x, y: n });
                                } else {
                                  var p;
                                  if (w.x < h.x) {
                                    p = w.x - s;
                                  } else {
                                    p = h.x - s;
                                  }
                                  var n;
                                  if (j.y > i.y + i.h) {
                                    n = j.y + s;
                                  } else {
                                    n = i.y + i.h + s;
                                  }
                                  B.push({ x: p, y: h.y });
                                  B.push({ x: p, y: n });
                                  B.push({ x: j.x, y: n });
                                }
                              }
                            }
                          }
                        }
                      }
                    }
                  }
                }
              }
            }
          }
        }
        if (m) {
          B.reverse();
        }
      } else {
        if (z.id != null || d.id != null) {
          var h, j, m, C;
          if (z.id != null) {
            h = z;
            j = d;
            m = false;
            C = z.angle;
          } else {
            h = d;
            j = z;
            m = true;
            C = d.angle;
          }
          var f = Model.getShapeById(h.id).props;
          if (C >= D / 4 && C < (D / 4) * 3) {
            if (j.y < h.y - e) {
              if (o >= E) {
                B.push({ x: h.x, y: j.y });
              } else {
                var A = E / 2;
                B.push({ x: h.x, y: h.y - A });
                B.push({ x: j.x, y: h.y - A });
              }
            } else {
              B.push({ x: h.x, y: h.y - s });
              if (o >= E) {
                if (j.x >= f.x - s && j.x <= f.x + f.w + s) {
                  var r = f.x + f.w / 2;
                  if (j.x < r) {
                    B.push({ x: f.x - s, y: h.y - s });
                    B.push({ x: f.x - s, y: j.y });
                  } else {
                    B.push({ x: f.x + f.w + s, y: h.y - s });
                    B.push({ x: f.x + f.w + s, y: j.y });
                  }
                } else {
                  if (j.x < f.x) {
                    B.push({ x: j.x + s, y: h.y - s });
                    B.push({ x: j.x + s, y: j.y });
                  } else {
                    B.push({ x: j.x - s, y: h.y - s });
                    B.push({ x: j.x - s, y: j.y });
                  }
                }
              } else {
                if (j.x >= f.x - s && j.x <= f.x + f.w + s) {
                  var r = f.x + f.w / 2;
                  if (j.x < r) {
                    B.push({ x: f.x - s, y: h.y - s });
                    B.push({ x: f.x - s, y: j.y - s });
                    B.push({ x: j.x, y: j.y - s });
                  } else {
                    B.push({ x: f.x + f.w + s, y: h.y - s });
                    B.push({ x: f.x + f.w + s, y: j.y - s });
                    B.push({ x: j.x, y: j.y - s });
                  }
                } else {
                  B.push({ x: j.x, y: h.y - s });
                }
              }
            }
          } else {
            if (C >= (D / 4) * 3 && C < (D / 4) * 5) {
              if (j.x > h.x + e) {
                if (o >= E) {
                  var A = o / 2;
                  B.push({ x: h.x + A, y: h.y });
                  B.push({ x: h.x + A, y: j.y });
                } else {
                  B.push({ x: j.x, y: h.y });
                }
              } else {
                B.push({ x: h.x + s, y: h.y });
                if (o >= E) {
                  if (j.y >= f.y - s && j.y <= f.y + f.h + s) {
                    var r = f.y + f.h / 2;
                    if (j.y < r) {
                      B.push({ x: h.x + s, y: f.y - s });
                      B.push({ x: j.x + s, y: f.y - s });
                      B.push({ x: j.x + s, y: j.y });
                    } else {
                      B.push({ x: h.x + s, y: f.y + f.h + s });
                      B.push({ x: j.x + s, y: f.y + f.h + s });
                      B.push({ x: j.x + s, y: j.y });
                    }
                  } else {
                    B.push({ x: h.x + s, y: j.y });
                  }
                } else {
                  if (j.y >= f.y - s && j.y <= f.y + f.h + s) {
                    var r = f.y + f.h / 2;
                    if (j.y < r) {
                      B.push({ x: h.x + s, y: f.y - s });
                      B.push({ x: j.x, y: f.y - s });
                    } else {
                      B.push({ x: h.x + s, y: f.y + f.h + s });
                      B.push({ x: j.x, y: f.y + f.h + s });
                    }
                  } else {
                    if (j.y < h.y) {
                      B.push({ x: h.x + s, y: j.y + s });
                      B.push({ x: j.x, y: j.y + s });
                    } else {
                      B.push({ x: h.x + s, y: j.y - s });
                      B.push({ x: j.x, y: j.y - s });
                    }
                  }
                }
              }
            } else {
              if (C >= (D / 4) * 5 && C < (D / 4) * 7) {
                if (j.y > h.y + e) {
                  if (o >= E) {
                    B.push({ x: h.x, y: j.y });
                  } else {
                    var A = E / 2;
                    B.push({ x: h.x, y: h.y + A });
                    B.push({ x: j.x, y: h.y + A });
                  }
                } else {
                  B.push({ x: h.x, y: h.y + s });
                  if (o >= E) {
                    if (j.x >= f.x - s && j.x <= f.x + f.w + s) {
                      var r = f.x + f.w / 2;
                      if (j.x < r) {
                        B.push({ x: f.x - s, y: h.y + s });
                        B.push({ x: f.x - s, y: j.y });
                      } else {
                        B.push({ x: f.x + f.w + s, y: h.y + s });
                        B.push({ x: f.x + f.w + s, y: j.y });
                      }
                    } else {
                      if (j.x < f.x) {
                        B.push({ x: j.x + s, y: h.y + s });
                        B.push({ x: j.x + s, y: j.y });
                      } else {
                        B.push({ x: j.x - s, y: h.y + s });
                        B.push({ x: j.x - s, y: j.y });
                      }
                    }
                  } else {
                    if (j.x >= f.x - s && j.x <= f.x + f.w + s) {
                      var r = f.x + f.w / 2;
                      if (j.x < r) {
                        B.push({ x: f.x - s, y: h.y + s });
                        B.push({ x: f.x - s, y: j.y + s });
                        B.push({ x: j.x, y: j.y + s });
                      } else {
                        B.push({ x: f.x + f.w + s, y: h.y + s });
                        B.push({ x: f.x + f.w + s, y: j.y + s });
                        B.push({ x: j.x, y: j.y + s });
                      }
                    } else {
                      B.push({ x: j.x, y: h.y + s });
                    }
                  }
                }
              } else {
                if (j.x < h.x - e) {
                  if (o >= E) {
                    var A = o / 2;
                    B.push({ x: h.x - A, y: h.y });
                    B.push({ x: h.x - A, y: j.y });
                  } else {
                    B.push({ x: j.x, y: h.y });
                  }
                } else {
                  B.push({ x: h.x - s, y: h.y });
                  if (o >= E) {
                    if (j.y >= f.y - s && j.y <= f.y + f.h + s) {
                      var r = f.y + f.h / 2;
                      if (j.y < r) {
                        B.push({ x: h.x - s, y: f.y - s });
                        B.push({ x: j.x - s, y: f.y - s });
                        B.push({ x: j.x - s, y: j.y });
                      } else {
                        B.push({ x: h.x - s, y: f.y + f.h + s });
                        B.push({ x: j.x - s, y: f.y + f.h + s });
                        B.push({ x: j.x - s, y: j.y });
                      }
                    } else {
                      B.push({ x: h.x - s, y: j.y });
                    }
                  } else {
                    if (j.y >= f.y - s && j.y <= f.y + f.h + s) {
                      var r = f.y + f.h / 2;
                      if (j.y < r) {
                        B.push({ x: h.x - s, y: f.y - s });
                        B.push({ x: j.x, y: f.y - s });
                      } else {
                        B.push({ x: h.x - s, y: f.y + f.h + s });
                        B.push({ x: j.x, y: f.y + f.h + s });
                      }
                    } else {
                      if (j.y < h.y) {
                        B.push({ x: h.x - s, y: j.y + s });
                        B.push({ x: j.x, y: j.y + s });
                      } else {
                        B.push({ x: h.x - s, y: j.y - s });
                        B.push({ x: j.x, y: j.y - s });
                      }
                    }
                  }
                }
              }
            }
          }
          if (m) {
            B.reverse();
          }
        } else {
          if (o >= E) {
            var A = (d.x - z.x) / 2;
            B.push({ x: z.x + A, y: z.y });
            B.push({ x: z.x + A, y: d.y });
          } else {
            var A = (d.y - z.y) / 2;
            B.push({ x: z.x, y: z.y + A });
            B.push({ x: d.x, y: z.y + A });
          }
        }
      }
    } else {
      if (u.linkerType == "curve") {
        var z = u.from;
        var d = u.to;
        var g = this.measureDistance(z, d);
        var l = g * 0.4;
        function t(F, G) {
          if (F.id != null) {
            return {
              x: F.x - l * Math.cos(F.angle),
              y: F.y - l * Math.sin(F.angle),
            };
          } else {
            var H = Math.abs(F.y - G.y);
            var y = Math.abs(F.x - G.x);
            var I = Math.atan(H / y);
            var x = {};
            if (F.x <= G.x) {
              x.x = F.x + l * Math.cos(I);
            } else {
              x.x = F.x - l * Math.cos(I);
            }
            if (F.y <= G.y) {
              x.y = F.y + l * Math.sin(I);
            } else {
              x.y = F.y - l * Math.sin(I);
            }
            return x;
          }
        }
        B.push(t(z, d));
        B.push(t(d, z));
      }
    }
    return B;
  },
  getLinkerLinePoints: function (d) {
    var b = [];
    if (d.linkerType != "curve") {
      b.push(d.from);
      b = b.concat(d.points);
    } else {
      var c = 0.05;
      var a = 0;
      while (a <= 1) {
        var e = {
          x:
            (1 - a) * (1 - a) * (1 - a) * d.from.x +
            3 * (1 - a) * (1 - a) * a * d.points[0].x +
            3 * (1 - a) * a * a * d.points[1].x +
            a * a * a * d.to.x,
          y:
            (1 - a) * (1 - a) * (1 - a) * d.from.y +
            3 * (1 - a) * (1 - a) * a * d.points[0].y +
            3 * (1 - a) * a * a * d.points[1].y +
            a * a * a * d.to.y,
        };
        b.push(e);
        a += c;
      }
    }
    b.push(d.to);
    return b;
  },
  getLinkerLinesPoints: function (e) {
    var g = [];
    var c = 0.05;
    var h = 0;
    if (e.linkerType == "broken") {
      var j = [];
      j.push(e.from);
      j = j.concat(e.points);
      j.push(e.to);
      for (var d = 1; d < j.length; d++) {
        var f = j[d];
        var b = j[d - 1];
        h = 0;
        while (h <= 1) {
          var a = { x: b.x * (1 - h) + f.x * h, y: b.y * (1 - h) + f.y * h };
          g.push(a);
          h += c;
        }
      }
    }
    if (e.linkerType == "normal") {
      while (h < 1) {
        var a = {
          x: e.from.x * (1 - h) + e.to.x * h,
          y: e.from.y * (1 - h) + e.to.y * h,
        };
        g.push(a);
        h += c;
      }
    } else {
      while (h < 1) {
        var a = {
          x:
            (1 - h) * (1 - h) * (1 - h) * e.from.x +
            3 * (1 - h) * (1 - h) * h * e.points[0].x +
            3 * (1 - h) * h * h * e.points[1].x +
            h * h * h * e.to.x,
          y:
            (1 - h) * (1 - h) * (1 - h) * e.from.y +
            3 * (1 - h) * (1 - h) * h * e.points[0].y +
            3 * (1 - h) * h * h * e.points[1].y +
            h * h * h * e.to.y,
        };
        g.push(a);
        h += c;
      }
    }
    return g;
  },
  getLinkerBox: function (g) {
    var j = this.getLinkerLinePoints(g);
    var d = j[0].x;
    var c = j[0].y;
    var b = j[0].x;
    var a = j[0].y;
    for (var e = 0; e < j.length; e++) {
      var h = j[e];
      if (h.x < d) {
        d = h.x;
      } else {
        if (h.x > b) {
          b = h.x;
        }
      }
      if (h.y < c) {
        c = h.y;
      } else {
        if (h.y > a) {
          a = h.y;
        }
      }
    }
    var f = { x: d, y: c, w: b - d, h: a - c };
    return f;
  },
  getShapeBox: function (a) {
    var b = a.props;
    var c = a.props.angle;
    return this.getRotatedBox(b, c);
  },
  getRotatedBox: function (g, e, b) {
    if (e == 0) {
      return g;
    } else {
      if (!b) {
        b = { x: g.x + g.w / 2, y: g.y + g.h / 2 };
      }
      var k = this.getRotated(b, { x: g.x, y: g.y }, e);
      var j = this.getRotated(b, { x: g.x + g.w, y: g.y }, e);
      var i = this.getRotated(b, { x: g.x + g.w, y: g.y + g.h }, e);
      var h = this.getRotated(b, { x: g.x, y: g.y + g.h }, e);
      var f = Math.min(k.x, j.x, i.x, h.x);
      var c = Math.max(k.x, j.x, i.x, h.x);
      var d = Math.min(k.y, j.y, i.y, h.y);
      var a = Math.max(k.y, j.y, i.y, h.y);
      return { x: f, y: d, w: c - f, h: a - d };
    }
  },
  getRotated: function (c, b, g) {
    var f = this.measureDistance(c, b);
    if (f == 0 || g == 0) {
      return b;
    }
    var d = Math.atan(Math.abs(b.x - c.x) / Math.abs(c.y - b.y));
    if (b.x >= c.x && b.y >= c.y) {
      d = Math.PI - d;
    } else {
      if (b.x <= c.x && b.y >= c.y) {
        d = Math.PI + d;
      } else {
        if (b.x <= c.x && b.y <= c.y) {
          d = Math.PI * 2 - d;
        }
      }
    }
    d = d % (Math.PI * 2);
    var e = (d + g) % (Math.PI * 2);
    var a = { x: c.x + Math.sin(e) * f, y: c.y - Math.cos(e) * f };
    return a;
  },
  getShapeAnchorInLinker: function (c) {
    if (c.name == "linker") {
      return [];
    }
    var l = c.getAnchors();
    var d = [];
    var t = { x: c.props.x + c.props.w / 2, y: c.props.y + c.props.h / 2 };
    for (var r = 0; r < l.length; r++) {
      var n = l[r];
      var o = { x: n.x + c.props.x, y: n.y + c.props.y };
      var f = this.getRotated(t, o, c.props.angle);
      d.push(f);
    }
    var j = [];
    var e = 2;
    for (var q = Model.orderList.length - 1; q >= 0; q--) {
      var m = Model.orderList[q].id;
      var u = Model.getShapeById(m);
      if (u.name != "linker" || (u.attribute && u.attribute.collapseBy)) {
        continue;
      }
      var k = u;
      var s = null;
      e = 3;
      for (var r = 0; r < d.length; r++) {
        var a = d[r];
        var b = { x: a.x - e, y: a.y - e, w: e * 2, h: e * 2 };
        if (k.from.id == null && this.pointInRect(k.from.x, k.from.y, b)) {
          s = { linker: k, anchors: [a], type: "from" };
          break;
        }
        if (k.to.id == null && this.pointInRect(k.to.x, k.to.y, b)) {
          s = { linker: k, anchors: [a], type: "to" };
          break;
        }
      }
      e = 2;
      if (s == null) {
        for (var r = 0; r < d.length; r++) {
          var a = d[r];
          var h = Utils.pointInLinker(a, k, e);
          var g = Utils.pointInRect(k.to.x, k.to.y, c.props);
          var p = Utils.pointInRect(k.from.x, k.from.y, c.props);
          if (h > -1 && !p && !g) {
            if (s == null) {
              s = { linker: k, anchors: [], type: "line" };
            }
            s.anchors.push(a);
          }
        }
      }
      if (s != null) {
        j.push(s);
      }
    }
    return j;
  },
  getEndpointAngle: function (d, f) {
    var a;
    if (f == "from") {
      a = d.from;
    } else {
      a = d.to;
    }
    var c;
    if (d.linkerType == "normal") {
      if (f == "from") {
        c = d.to;
      } else {
        c = d.from;
      }
    } else {
      if (d.linkerType == "broken") {
        if (f == "from") {
          c = d.points[0];
        } else {
          c = d.points[d.points.length - 1];
        }
      } else {
        var e = 12;
        var b;
        var g = Utils.measureDistance(d.from, d.to);
        if (f == "from") {
          b = e / g;
        } else {
          b = 1 - e / g;
        }
        c = {
          x:
            (1 - b) * (1 - b) * (1 - b) * d.from.x +
            3 * (1 - b) * (1 - b) * b * d.points[0].x +
            3 * (1 - b) * b * b * d.points[1].x +
            b * b * b * d.to.x,
          y:
            (1 - b) * (1 - b) * (1 - b) * d.from.y +
            3 * (1 - b) * (1 - b) * b * d.points[0].y +
            3 * (1 - b) * b * b * d.points[1].y +
            b * b * b * d.to.y,
        };
      }
    }
    return this.getAngle(c, a);
  },
  getAngle: function (c, a) {
    var b = Math.atan(Math.abs(c.y - a.y) / Math.abs(c.x - a.x));
    b = isNaN(b) ? 1.5707963267948966 : b;
    if (a.x <= c.x && a.y > c.y) {
      b = Math.PI - b;
    } else {
      if (a.x < c.x && a.y <= c.y) {
        b = Math.PI + b;
      } else {
        if (a.x >= c.x && a.y < c.y) {
          b = Math.PI * 2 - b;
        }
      }
    }
    return b;
  },
  getDarkerColor: function (c, h) {
    if (!h) {
      h = 13;
    }
    var f = c.split(",");
    var a = parseInt(f[0]);
    var e = parseInt(f[1]);
    var i = parseInt(f[2]);
    var d = Math.round(a - (a / 255) * h);
    if (d < 0) {
      d = 0;
    }
    var j = Math.round(e - (e / 255) * h);
    if (j < 0) {
      j = 0;
    }
    var k = Math.round(i - (i / 255) * h);
    if (k < 0) {
      k = 0;
    }
    return d + "," + j + "," + k;
  },
  getDarkestColor: function (a) {
    return this.getDarkerColor(a, 26);
  },
  toScale: function (c) {
    var a = {};
    for (var b in c) {
      a[b] = c[b];
      if (typeof c[b] == "number") {
        a[b] = a[b].toScale();
      }
    }
    return a;
  },
  restoreScale: function (c) {
    var a = {};
    for (var b in c) {
      a[b] = c[b];
      if (typeof c[b] == "number") {
        a[b] = a[b].restoreScale();
      }
    }
    return a;
  },
  getOutlinkers: function (c) {
    var a = [];
    for (var e = 0; e < c.length; e++) {
      var g = c[e];
      a.push(g.id);
    }
    var h = [];
    var d = [];
    for (var e = 0; e < c.length; e++) {
      var g = c[e];
      if (g.name != "linker") {
        var j = Model.getShapeLinkers(g.id);
        if (j && j.length > 0) {
          for (var f = 0; f < j.length; f++) {
            var b = j[f];
            if (!this.isSelected(b) && d.indexOf(b) < 0 && a.indexOf(b) < 0) {
              h.push(Model.getShapeById(b));
              d.push(b);
            }
          }
        }
      }
    }
    return h;
  },
  getFamilyShapes: function (b) {
    var h = [],
      a = [];
    for (var e = 0; e < b.length; e++) {
      var c = b[e];
      if (c.name != "linker") {
        if (c.parent) {
          var g = Model.getShapeById(c.parent);
          if (!Utils.isSelected(c.parent)) {
            h.push(g);
          }
          var f = this.getChildrenShapes(g);
          h = h.concat(f);
        }
        var d = this.getChildrenShapes(c);
        h = h.concat(d);
      }
    }
    for (var e = 0; e < h.length; e++) {
      if (a.indexOf(h[e].id) > -1) {
        h.splice(e, 1);
        e--;
      } else {
        a.push(h[e].id);
      }
    }
    return h;
  },
  getChildrenShapes: function (a) {
    var c = [];
    if (a.children && a.children.length > 0) {
      for (var b = 0; b < a.children.length; b++) {
        var d = a.children[b];
        if (!Utils.isSelected(d)) {
          c.push(Model.getShapeById(d));
        }
      }
    }
    return c;
  },
  isFamilyShape: function (b, a) {
    if (b.parent == a.id) {
      return true;
    } else {
      if (b.id == a.parent) {
        return true;
      } else {
        if (b.parent && b.parent == a.parent) {
          return true;
        }
      }
    }
    return false;
  },
  getContainedShapes: function (c) {
    var b = [];
    var e = [];
    for (var f = 0; f < c.length; f++) {
      var d = c[f];
      if (d.name != "linker" && d.attribute && d.attribute.container) {
        var g = a(d);
        b = b.concat(g);
      }
    }
    function a(h) {
      var l = [];
      for (var k = Model.orderList.length - 1; k >= 0; k--) {
        var n = Model.orderList[k].id;
        if (h.id != n && !Utils.isSelected(n) && e.indexOf(n) < 0) {
          var j = Model.getShapeById(n);
          if (
            !j.attribute ||
            typeof j.attribute.container == "undefined" ||
            j.attribute.container == false
          ) {
            if (!Utils.isFamilyShape(j, h)) {
              var m = Utils.getShapeBox(j);
              if (Utils.rectInRect(m, h.props) && j.container == h.id) {
                l.push(j);
                e.push(n);
              }
            }
          }
        }
      }
      return l;
    }
    return b;
  },
  getAttachedShapes: function (c) {
    var a = [];
    for (var f = 0; f < c.length; f++) {
      a.push(c[f].id);
    }
    var g = [];
    for (var f = 0; f < c.length; f++) {
      var h = c[f];
      if (
        h.groupName == "task" ||
        h.groupName == "callActivity" ||
        h.groupName == "subProcess"
      ) {
        var b = [];
        for (var d = Model.orderList.length - 1; d >= 0; d--) {
          var k = Model.orderList[d].id;
          var e = Model.getShapeById(k);
          if (e.attachTo == h.id && !Utils.isSelected(k) && a.indexOf(k) < 0) {
            b.push(e);
          }
        }
        g = g.concat(b);
      }
    }
    return g;
  },
  copy: function (a) {
    return $.extend(true, {}, a);
  },
  copyArray: function (a) {
    return $.extend(true, [], a);
  },
  rangeChildren: function (j) {
    var e = [];
    if (j.children && j.children.length > 0) {
      if (j.name == "verticalPool") {
        var o = [];
        var b = [];
        for (var f = 0; f < j.children.length; f++) {
          var d = j.children[f];
          var c = Model.getShapeById(d);
          if (c.name == "horizontalSeparator") {
            b.push(c);
          } else {
            o.push(c);
          }
        }
        o.sort(function (i, h) {
          return i.props.x - h.props.x;
        });
        var l = j.props.x;
        for (var f = 0; f < o.length; f++) {
          var c = o[f];
          c.props.x = l;
          Designer.painter.renderShape(c);
          e.push(c);
          l += c.props.w;
        }
        b.sort(function (i, h) {
          return i.props.y - h.props.y;
        });
        var k = j.props.y + 40;
        for (var f = 0; f < b.length; f++) {
          var c = b[f];
          var a = c.props.y + c.props.h;
          c.props.w = j.props.w;
          c.props.y = k;
          var g = a - k;
          c.props.h = g;
          Designer.painter.renderShape(c);
          e.push(c);
          k += g;
        }
      } else {
        if (j.name == "horizontalPool") {
          var o = [];
          var b = [];
          for (var f = 0; f < j.children.length; f++) {
            var d = j.children[f];
            var c = Model.getShapeById(d);
            if (c.name == "verticalSeparator") {
              b.push(c);
            } else {
              o.push(c);
            }
          }
          o.sort(function (i, h) {
            return i.props.y - h.props.y;
          });
          var k = j.props.y;
          for (var f = 0; f < o.length; f++) {
            var c = o[f];
            c.props.y = k;
            Designer.painter.renderShape(c);
            e.push(c);
            k += c.props.h;
          }
          b.sort(function (i, h) {
            return i.props.x - h.props.x;
          });
          var l = j.props.x + 40;
          for (var f = 0; f < b.length; f++) {
            var c = b[f];
            var n = c.props.x + c.props.w;
            c.props.h = j.props.h;
            c.props.x = l;
            var m = n - l;
            c.props.w = m;
            Designer.painter.renderShape(c);
            e.push(c);
            l += m;
          }
        }
      }
    }
    return e;
  },
  getRelativePos: function (c, b, d) {
    var a = d.offset();
    if (a == null) {
      a = { left: 0, top: 0 };
    }
    return { x: c - a.left + d.scrollLeft(), y: b - a.top + d.scrollTop() };
  },
  getCollapsedShapes: function (b) {
    var k = [];
    var a = [];
    for (var e = 0; e < b.length; e++) {
      var f = b[e];
      if (f.attribute && f.attribute.collapsed) {
        var h = [];
        for (var c = Model.orderList.length - 1; c >= 0; c--) {
          var g = Model.orderList[c].id;
          var d = Model.getShapeById(g);
          if (
            d.attribute &&
            d.attribute.collapseBy == f.id &&
            a.indexOf(g) < 0
          ) {
            h.push(d);
          }
        }
        k = k.concat(h);
      }
    }
    return k;
  },
  getCollapsedShapesById: function (e) {
    var a = [];
    for (var c = Model.orderList.length - 1; c >= 0; c--) {
      var d = Model.orderList[c].id;
      var b = Model.getShapeById(d);
      if (b.attribute && b.attribute.collapseBy == e) {
        a.push(b);
      }
    }
    return a;
  },
  getShapeLineStyle: function (a, b) {
    if (b == false || !Model.define.theme || !Model.define.theme.shape) {
      return $.extend({}, Schema.shapeDefaults.lineStyle, a);
    } else {
      return $.extend(
        {},
        Schema.shapeDefaults.lineStyle,
        Model.define.theme.shape.lineStyle,
        a
      );
    }
  },
  getLinkerLineStyle: function (a, b) {
    if (b == false || !Model.define.theme || !Model.define.theme.linker) {
      return $.extend({}, Schema.linkerDefaults.lineStyle, a);
    } else {
      return $.extend(
        {},
        Schema.linkerDefaults.lineStyle,
        Model.define.theme.linker.lineStyle,
        a
      );
    }
  },
  getShapeFontStyle: function (c, b) {
    var a = Model.define;
    if (b == false || !Model.define.theme || !Model.define.theme.shape) {
      return $.extend({}, Schema.shapeDefaults.fontStyle, c);
    } else {
      return $.extend(
        {},
        Schema.shapeDefaults.fontStyle,
        Model.define.theme.shape.fontStyle,
        c
      );
    }
  },
  getLinkerFontStyle: function (b, a) {
    if (a == false || !Model.define.theme || !Model.define.theme.linker) {
      return $.extend({}, Schema.linkerDefaults.fontStyle, b);
    } else {
      return $.extend(
        {},
        Schema.linkerDefaults.fontStyle,
        Model.define.theme.linker.fontStyle,
        b
      );
    }
  },
  getShapeFillStyle: function (a, c) {
    var b = Model.define;
    if (c == false || !Model.define.theme || !Model.define.theme.shape) {
      return $.extend({}, Schema.shapeDefaults.fillStyle, a);
    } else {
      return $.extend(
        {},
        Schema.shapeDefaults.fillStyle,
        Model.define.theme.shape.fillStyle,
        a
      );
    }
  },
  getLanesByPool: function (e) {
    var e = Utils.copy(e);
    var f = e.children,
      a = f.length;
    var c = [];
    for (var d = 0; d < a; d++) {
      var b = Utils.copy(Model.getShapeById(f[d]));
      if (b.name.indexOf("Lane") > -1) {
        c.push(b);
      }
    }
    return c;
  },
  getSeparatorsByPool: function (e) {
    var e = Utils.copy(e);
    var f = e.children,
      a = f.length;
    var d = [];
    for (var c = 0; c < a; c++) {
      var b = Utils.copy(Model.getShapeById(f[c]));
      if (
        b.name.indexOf("Separator") > -1 &&
        b.name.indexOf("SeparatorBar") < 0
      ) {
        d.push(b);
      }
    }
    return d;
  },
  getSeparatorBarsByPool: function (d) {
    var d = Utils.copy(d);
    var e = d.children,
      a = e.length;
    var f = [];
    for (var c = 0; c < a; c++) {
      var b = Utils.copy(Model.getShapeById(e[c]));
      if (b.name.indexOf("SeparatorBar") > -1) {
        f.push(b);
      }
    }
    return f;
  },
  getLinkersByShapes: function (a) {
    var e = [];
    var d = Model.define.elements;
    var c = [];
    for (var b = 0; b < a.length; b++) {
      c.push(a[b].id);
    }
    for (key in d) {
      if (d[key].name == "linker") {
        var f = d[key];
        if (c.indexOf(f.to.id) > -1 || c.indexOf(f.from.id) > -1) {
          e.push(f);
        }
      }
    }
    return e;
  },
  containsChinese: function (a) {
    if (escape(a).indexOf("%u") >= 0) {
      return true;
    } else {
      return false;
    }
  },
  filterXss: function (a) {
    a = a.toString();
    a = a.replace(/</g, "&lt;");
    a = a.replace(/%3C/g, "&lt;");
    a = a.replace(/>/g, "&gt;");
    a = a.replace(/%3E/g, "&gt;");
    a = a.replace(/'/g, "&#39;");
    a = a.replace(/"/g, "&quot;");
    a = a.replace(/&lt;div&gt;/g, "<div>").replace(/&lt;\/div&gt;/g, "</div>");
    a = a.replace(/&lt;u&gt;/g, "<u>").replace(/&lt;\/u&gt;/g, "</u>");
    a = a.replace(/&lt;br&gt;/g, "<br>");
    a = a.replace(/&lt;b&gt;/g, "<b>").replace(/&lt;\/b&gt;/g, "</b>");
    a = a.replace(/&lt;i&gt;/g, "<i>").replace(/&lt;\/i&gt;/g, "</i>");
    a = a
      .replace(/&lt;font&gt;/g, "<font")
      .replace(/&lt;\/font&gt;/g, "</font>");
    return a;
  },
  showError: function () {
    var a = $("#canvas-error");
    if (a.length) {
      a = $(
        "<div id='canvas-error'><span>保存出现了异常，为了防止内容丢失，请及时刷新页面或者反馈问题</span></div>"
      ).appendTo("body");
      a.show();
    }
  },
  RGB2Hex: function (b) {
    if (b.charAt(0) == "#") {
      return b;
    }
    var c = b.split(/\D+/);
    var a = Number(c[1]) * 65536 + Number(c[2]) * 256 + Number(c[3]);
    return "" + Utils.toHex(a, 6);
  },
  toHex: function (a, c) {
    var b = a.toString(16);
    while (b.length < c) {
      b = "0" + b;
    }
    return b;
  },
  popEditor: {
    params: { span: null, range: null, selection: null },
    close: function () {
      var a = $(".pop-editor");
      a.hide();
    },
    init: function (e) {
      e = $(e);
      var d = this.getSelection(),
        b = "",
        a;
      if (d == null) {
        return;
      }
      this.params.range = d.range;
      this.params.selection = d.selection;
      var c = this.renderMenu();
      this.renderMenuPos(e);
      this.initEvent(e);
    },
    getSelection: function () {
      var a = document.getSelection();
      if (!a.isCollapsed) {
        return { selection: a, range: a.getRangeAt(0) };
      } else {
        return null;
      }
    },
    initEvent: function (c) {
      var b = this,
        a = $(".pop-editor");
      a.children("div")
        .off("mousedown")
        .on("mousedown", function (f) {
          var g = $(this),
            d = g.data("key");
          if (d == "down") {
            a.find(".pop-editor-items").hide();
            g.find(".pop-editor-items").show();
          } else {
            if (d == "color") {
              f.stopPropagation();
              f.preventDefault();
              $.colorpicker({
                target: g,
                stopPropagation: true,
                setColor: "red",
                onSelect: function (e) {
                  if (e == null || e == "transparent") {
                    e = "transparent";
                  } else {
                    e = "rgb(" + e + ")";
                  }
                  if (e.indexOf("rgb") >= 0) {
                    e = Utils.RGB2Hex(e);
                  }
                  b.setStyle("ForeColor", e);
                },
              });
              return;
            } else {
              if (d == "equation") {
                Designer.op.equation.equationInit(c);
              } else {
                b.setStyle(d);
              }
            }
          }
          f.preventDefault();
          f.stopPropagation();
        });
      a.children("div")
        .off("mouseup")
        .on("mouseup", function (d) {
          d.stopPropagation();
          d.preventDefault();
        });
      a.find(".pop-editor-items > div")
        .off("mousedown")
        .on("mousedown", function (i) {
          var g = $(this),
            f = g.parent().data("key"),
            h = g.text();
          var d = b.setStyle(f, h);
          i.stopPropagation();
          return false;
        });
    },
    renderMenu: function () {
      var b = $(".pop-editor");
      if (b.length == 0) {
        var d =
          "<div class='pop-editor-items' data-key='f'><div>微软雅黑</div><div>宋体</div><div>黑体</div><div>楷体</div><div>宋体</div><div>Arial</div><div>Verdana</div><div>Georgia</div><div>Courier New</div><div>Impact</div><div>Tahoma</div><div>Lucida Console</div><div>Comic Sans MS</div><div>Times New Roman</div></div>";
        var a =
          "<div class='pop-editor-items' data-key='h'><div>H1</div><div>H2</div><div>H3</div><div>H4</div><div>H5</div><div>H6</div><div>P</div></div>";
        var c =
          "<div class='pop-editor'><div data-key='bold'><div class='icons bold'>&#xe747;</div></div><div data-key='italic'><div class='icons italic'>&#xe744;</div></div><div data-key='underline'><div class='icons underline'>&#xe740;</div></div><div data-key='color'><span class='icons'><svg class='icon icon-color' aria-hidden='true'><use xlink:href='#icon-guangbiaobianjiqi_zitiyanse'></use></svg></span></div><div data-key='equation'><div class='icons equation'><span class='eq-tip'>方程式VIP限免</span>&#xe741;</div></div>";
        b = $(c).appendTo("#designer_canvas");
      }
      return b;
    },
    renderMenuPos: function (e) {
      var b = e,
        a = $(".pop-editor");
      var d = parseFloat(b.css("left"));
      var c = parseFloat(b.css("top"));
      a.css({
        left: d + (b.outerWidth() / 2 - a.outerWidth() / 2),
        top:
          c +
          b.outerHeight() +
          (b.outerHeight().toScale() - b.outerHeight()) / 2,
      }).show();
    },
    setStyle: function (b, d) {
      var a = "",
        e = this.params,
        c = this;
      switch (b) {
        case "h":
          document.execCommand("formatBlock", false, "<" + d + ">");
          break;
        case "f":
          document.execCommand("FontName", false, d);
          break;
        default:
          document.execCommand(b, false, d);
          break;
      }
      return a;
    },
  },
  toast: function (c, d, b) {
    var a = $(".toast-con");
    if (a.length == 0) {
      a = $(
        '<div class="toast-con moving"><span>' + c + "</span></div>"
      ).appendTo("#ui_container");
    }
    d = $(d);
    var e = d.offset();
    a.css({
      left: e.left - (a.outerWidth() - d.outerWidth()) / 2,
      top: e.top - a.outerHeight() - 15,
    }).show();
    setTimeout(function () {
      $(".toast-con").fadeOut().remove();
    }, b);
  },
  gridSelectObj: { id: null, indexs: [], rows: [], columns: [] },
  selectGrid: function (h, g) {
    var l = this.gridSelectObj,
      k = l.indexs,
      n = l.rows,
      c = l.columns,
      a = l.id,
      d = h.textBlock.length;
    if (a != h.id) {
      l.id = h.id;
      k = [];
      n = [];
      c = [];
    }
    if (g.length == 1 && k.indexOf(g[0]) > -1) {
      k = [];
      n = [];
      c = [];
    } else {
      k = [];
      n = [];
      c = [];
      for (var f = 0; f < g.length; f++) {
        var j = g[f];
        if (k.indexOf(j) == -1) {
          if (j >= d) {
            continue;
          }
          var m = Math.floor(j / h.path[0].length);
          var b = j % h.path[0].length;
          k.push(j);
          n.push(m);
          c.push(b);
        } else {
          var e = k.indexOf(j);
          k.splice(e, 1);
          n.splice(e, 1);
          c.splice(e, 1);
        }
      }
    }
    this.gridSelectObj.indexs = k;
    this.gridSelectObj.rows = n;
    this.gridSelectObj.columns = c;
    Designer.events.push("renderGridSelect", h);
    if (this.selectCallback) {
      this.selectCallback();
    }
  },
  unselectGrid: function () {
    this.gridSelectObj = { id: null, indexs: [], rows: [], columns: [] };
    var a = $("#grid_selects");
    a.remove();
  },
  getGridSelectedCells: function () {
    var f = this.gridSelectObj;
    var g = [];
    if (f.id) {
      var c = Model.getShapeById(f.id);
      for (var b = 0; b < f.indexs.length; b++) {
        var h = f.rows[b],
          a = f.columns[b],
          d = f.indexs[b];
        var j = c.path[h][a],
          e = c.textBlock[d];
        g.push({ id: f.id, path: j, textBlock: e });
      }
    }
    return g;
  },
  getShapeRuleLine: function (ac, v, o, k) {
    var T = 4;
    var f = ac.x,
      J = ac.y + ac.h / 2,
      ab = ac.x + ac.w,
      h = ac.y,
      a = ac.x + ac.w / 2,
      d = ac.y + ac.h;
    var H = null;
    var e = null;
    var D = null;
    var X = null;
    var A = { d: null, pos: null },
      aa = { d: null, pos: null },
      P = { d: null, pos: null },
      s = { d: null, pos: null };
    var R = null,
      z = 0,
      K = null,
      ap = null;
    for (var aj = 0, w = v.length; aj < w; aj++) {
      var aq = v[aj];
      var ag = aq.left,
        V = aq.right,
        S = aq.top,
        ao = aq.bottom,
        af = aq.middle;
      if (aq.right < f) {
        R = "left";
        z = f - aq.right;
        if (Math.abs(J - af) < T) {
          if (K == null || z < K) {
            K = z;
            var Z = af - J;
            e = {
              target: aq.id,
              s: Z,
              targetPos: { x: V, y: J + Z },
              ac: "left",
            };
          }
        } else {
          if (Math.abs(S - h) < T || Math.abs(ao - h) < T) {
            if (K == null || z < K) {
              K = z;
              var Z = Math.abs(h - S) < T ? S - h : ao - h;
              e = {
                target: aq.id,
                s: Z,
                targetPos: { x: V, y: h + Z },
                ac: "left",
              };
            }
          } else {
            if (Math.abs(S - d) < T || Math.abs(ao - d) < T) {
              if (K == null || z < K) {
                K = z;
                var Z = Math.abs(d - S) < T ? S - d : ao - d;
                e = {
                  target: aq.id,
                  s: Z,
                  targetPos: { x: V, y: d + Z },
                  ac: "left",
                };
              }
            }
          }
        }
        if (A.d == null || A.d > z) {
          A.d = z;
          A.pos = aq;
        }
      } else {
        if (aq.left > ab) {
          R = "right";
          z = aq.left - ab;
          if (Math.abs(J - af) < T) {
            if (K == null || z < K) {
              K = z;
              var Z = af - J;
              e = {
                target: aq.id,
                s: Z,
                targetPos: { x: ag, y: J + Z },
                ac: "right",
              };
            }
          } else {
            if (Math.abs(S - h) < T || Math.abs(ao - h) < T) {
              if (K == null || z < K) {
                K = z;
                var Z = Math.abs(h - S) < T ? S - h : ao - h;
                e = {
                  target: aq.id,
                  s: Z,
                  targetPos: { x: ag, y: h + Z },
                  ac: "right",
                };
              }
            } else {
              if (Math.abs(S - d) < T || Math.abs(ao - d) < T) {
                if (K == null || z < K) {
                  K = z;
                  var Z = Math.abs(d - S) < T ? S - d : ao - d;
                  e = {
                    target: aq.id,
                    s: Z,
                    targetPos: { x: ag, y: d + Z },
                    ac: "right",
                  };
                }
              }
            }
          }
          if (aa.d == null || aa.d > z) {
            aa.d = z;
            aa.pos = aq;
          }
        }
      }
      for (var ai = 0, w = v.length; ai < w; ai++) {
        var C = v[ai];
        var ah = C.left,
          U = C.right,
          Q = C.top,
          an = C.bottom;
        if (R == "left") {
          if (U < ag && Math.abs(ag - U - z) < T && !(an < S || Q > ao)) {
            if (ap == null || ag - U < ap) {
              ap = ag - U;
              var af = (Math.max(h, S) + Math.min(ao, d)) / 2,
                ae = (Math.max(Q, S) + Math.min(an, ao)) / 2,
                H = {
                  target: aq.id,
                  d: ap,
                  s: ap - z,
                  targetPos: aq,
                  ruleLine: { start: { x: U, y: ae }, end: { x: ag, y: ae } },
                  ac: "left",
                };
            }
          }
        } else {
          if (R == "right") {
            if (ah > V && Math.abs(ah - V - z) < T && !(an < S || Q > ao)) {
              if (ap == null || ah - V < ap) {
                ap = ah - V;
                var af = (Math.max(h, S) + Math.min(ao, d)) / 2,
                  ae = (Math.max(Q, S) + Math.min(ao, an)) / 2,
                  H = {
                    target: aq.id,
                    d: ap,
                    s: z - ap,
                    targetPos: aq,
                    ruleLine: { start: { x: V, y: ae }, end: { x: ah, y: ae } },
                    ac: "right",
                  };
                break;
              }
            }
          }
        }
      }
    }
    var Y = null,
      g = 0,
      B = null,
      F = null;
    for (var aj = 0, w = o.length; aj < w; aj++) {
      var aq = o[aj];
      var ag = aq.left,
        V = aq.right,
        S = aq.top,
        ao = aq.bottom,
        af = aq.middle,
        al = aq.center;
      if (ao < h) {
        Y = "top";
        g = h - ao;
        if (Math.abs(a - al) < T) {
          if (B == null || g < B) {
            B = g;
            var Z = al - a;
            X = {
              target: aq.id,
              s: Z,
              targetPos: { x: a + Z, y: ao },
              ac: "top",
            };
          }
        } else {
          if (Math.abs(f - ag) < T || Math.abs(f - V) < T) {
            if (B == null || g < B) {
              B = g;
              var Z = Math.abs(f - ag) < T ? ag - f : V - f;
              X = {
                target: aq.id,
                s: Z,
                targetPos: { x: f + Z, y: ao },
                ac: "top",
              };
            }
          } else {
            if (Math.abs(ab - ag) < T || Math.abs(ab - V) < T) {
              if (B == null || g < B) {
                B = g;
                var Z = Math.abs(ag - ab) < T ? ag - ab : V - ab;
                X = {
                  target: aq.id,
                  s: Z,
                  targetPos: { x: ab + Z, y: ao },
                  ac: "top",
                };
              }
            }
          }
        }
        if (P.d > g || P.d == null) {
          P.d = g;
          P.pos = aq;
        }
      } else {
        if (S > d) {
          Y = "bottom";
          g = S - d;
          if (Math.abs(a - al) < T) {
            if (B == null || g < B) {
              B = g;
              var Z = al - a;
              X = {
                target: aq.id,
                s: Z,
                targetPos: { x: a + Z, y: S },
                ac: "bottom",
              };
            }
          } else {
            if (Math.abs(f - ag) < T || Math.abs(f - V) < T) {
              if (B == null || g < B) {
                B = g;
                var Z = Math.abs(f - ag) < T ? ag - f : V - f;
                X = {
                  target: aq.id,
                  s: Z,
                  targetPos: { x: f + Z, y: S },
                  ac: "bottom",
                };
              }
            } else {
              if (Math.abs(ab - ag) < T || Math.abs(ab - V) < T) {
                if (B == null || g < B) {
                  B = g;
                  var Z = Math.abs(ag - ab) < T ? ag - ab : V - ab;
                  X = {
                    target: aq.id,
                    s: Z,
                    targetPos: { x: ab + Z, y: S },
                    ac: "bottom",
                  };
                }
              }
            }
          }
          if (s.d == null || s.d > g) {
            s.d = g;
            s.pos = aq;
          }
        }
      }
      for (var ai = 0, w = o.length; ai < w; ai++) {
        var C = o[ai];
        var ah = C.left,
          U = C.right,
          Q = C.top,
          an = C.bottom;
        if (Y == "top") {
          if (an < S && Math.abs(S - an - g) < T && !(U < ag || ah > V)) {
            if (F == null || S - an < F) {
              F = S - an;
              var ae = (Math.max(ah, ag) + Math.min(V, U)) / 2,
                D = {
                  target: aq.id,
                  d: F,
                  s: F - g,
                  targetPos: aq,
                  ruleLine: { start: { x: ae, y: an }, end: { x: ae, y: S } },
                  ac: "top",
                };
              break;
            }
          }
        } else {
          if (Y == "bottom") {
            if (Q > ao && Math.abs(Q - ao - g) < T && !(U < ag || ah > V)) {
              if (F == null || Q - ao < F) {
                F = Q - ao;
                var ae = (Math.max(ah, ag) + Math.min(V, U)) / 2,
                  D = {
                    target: aq.id,
                    d: F,
                    s: g - F,
                    targetPos: aq,
                    ruleLine: { start: { x: ae, y: ao }, end: { x: ae, y: Q } },
                    ac: "bottom",
                  };
                break;
              }
            }
          }
        }
      }
    }
    var L = null;
    if (Math.abs(aa.d - A.d) < T * 2 && aa.d != null && A.d != null) {
      L = {
        s: (aa.d - A.d) / 2,
        d: (aa.d + A.d) / 2,
        leftPos: A.pos,
        rightPos: aa.pos,
      };
    }
    var ak = null;
    if (Math.abs(P.d - s.d) < T * 2 && s.d != null && P.d != null) {
      ak = {
        s: (s.d - P.d) / 2,
        d: (s.d + P.d) / 2,
        topPos: P.pos,
        bottomPos: s.pos,
      };
    }
    var I = e ? e.s : ak ? ak.s : D ? D.s : 0;
    ac.y = ac.y + I;
    var am = X ? X.s : L ? L.s : H ? H.s : 0;
    ac.x = ac.x + am;
    if (e) {
      var E = null,
        u = null,
        M = "";
      if (e.ac == "left") {
        E = e.targetPos;
        u = { x: ac.x, y: E.y };
      } else {
        u = e.targetPos;
        E = { x: ac.x + ac.w, y: u.y };
      }
      Designer.op.drawSnpLine(E, u, k, "line");
    } else {
      if (ak) {
        var O = ak.topPos,
          n = ak.bottomPos;
        var E = {
            x: (Math.max(ac.x, O.left) + Math.min(O.right, ac.x + ac.w)) / 2,
            y: O.bottom,
          },
          u = { x: E.x, y: ac.y },
          ad = {
            x: (Math.max(ac.x, n.left) + Math.min(n.right, ac.x + ac.w)) / 2,
            y: ac.y + ac.h,
          },
          G = { x: ad.x, y: n.top };
        Designer.op.drawSnpLine(E, u, k);
        Designer.op.drawSnpLine(ad, G, k);
      } else {
        if (D) {
          var N = D.targetPos,
            x = D.ruleLine,
            q = D.ac,
            E = null,
            u = null;
          if (q == "top") {
            E = {
              x: (Math.max(N.left, ac.x) + Math.min(N.right, ac.x + ac.w)) / 2,
              y: N.bottom,
            };
            u = { x: E.x, y: ac.y };
          } else {
            if (q == "bottom") {
              u = {
                x:
                  (Math.max(N.left, ac.x) + Math.min(N.right, ac.x + ac.w)) / 2,
                y: N.top,
              };
              E = { x: u.x, y: ac.y + ac.h };
            }
          }
          Designer.op.drawSnpLine(E, u, k);
          Designer.op.drawSnpLine(x.start, x.end, k);
        }
      }
    }
    if (X) {
      var E = null,
        u = null;
      if (X.ac == "top") {
        E = X.targetPos;
        u = { x: E.x, y: ac.y };
      } else {
        u = X.targetPos;
        E = { x: u.x, y: ac.y + ac.h };
      }
      Designer.op.drawSnpLine(E, u, k, "line");
    } else {
      if (L) {
        var y = L.leftPos,
          W = L.rightPos;
        var E = {
            x: y.right,
            y: (Math.max(ac.y, y.top) + Math.min(y.bottom, ac.y + ac.h)) / 2,
          },
          u = { x: ac.x, y: E.y },
          ad = {
            x: ac.x + ac.w,
            y: (Math.max(ac.y, W.top) + Math.min(W.bottom, ac.y + ac.h)) / 2,
          };
        G = { x: W.left, y: ad.y };
        Designer.op.drawSnpLine(E, u, k);
        Designer.op.drawSnpLine(ad, G, k);
      } else {
        if (H) {
          var N = H.targetPos,
            x = H.ruleLine,
            q = H.ac,
            E = null,
            u = null;
          if (q == "left") {
            E = {
              x: N.right,
              y: (Math.max(N.top, ac.y) + Math.min(N.bottom, ac.y + ac.h)) / 2,
            };
            u = { x: ac.x, y: E.y };
          } else {
            if (q == "right") {
              u = {
                x: N.left,
                y:
                  (Math.max(N.top, ac.y) + Math.min(N.bottom, ac.y + ac.h)) / 2,
              };
              E = { x: ac.x + ac.w, y: u.y };
            }
          }
          Designer.op.drawSnpLine(E, u, k);
          Designer.op.drawSnpLine(x.start, x.end, k);
        }
      }
    }
  },
};
var GradientHelper = {
  createLinearGradient: function (f, i, h) {
    var b = f.props;
    var c;
    var e;
    var d;
    if (b.w > b.h) {
      c = { x: 0, y: b.h / 2 };
      e = { x: b.w, y: b.h / 2 };
      d = (h.angle + Math.PI / 2) % (Math.PI * 2);
    } else {
      c = { x: b.w / 2, y: 0 };
      e = { x: b.w / 2, y: b.h };
      d = h.angle;
    }
    if (d != 0) {
      var a = { x: b.w / 2, y: b.h / 2 };
      c = Utils.getRotated(a, c, d);
      e = Utils.getRotated(a, e, d);
      if (c.x < 0) {
        c.x = 0;
      }
      if (c.x > f.props.w) {
        c.x = f.props.w;
      }
      if (c.y < 0) {
        c.y = 0;
      }
      if (c.y > f.props.h) {
        c.y = f.props.h;
      }
      if (e.x < 0) {
        e.x = 0;
      }
      if (e.x > f.props.w) {
        e.x = f.props.w;
      }
      if (e.y < 0) {
        e.y = 0;
      }
      if (e.y > f.props.h) {
        e.y = f.props.h;
      }
    }
    var g = i.createLinearGradient(c.x, c.y, e.x, e.y);
    g.addColorStop(0, "rgb(" + h.beginColor + ")");
    g.addColorStop(1, "rgb(" + h.endColor + ")");
    return g;
  },
  createRadialGradient: function (c, a, b) {
    var f = c.props;
    var d = f.h;
    if (f.w < f.h) {
      d = f.w;
    }
    var e = a.createRadialGradient(
      f.w / 2,
      f.h / 2,
      10,
      f.w / 2,
      f.h / 2,
      d * b.radius
    );
    e.addColorStop(0, "rgb(" + b.beginColor + ")");
    e.addColorStop(1, "rgb(" + b.endColor + ")");
    return e;
  },
  getLighterColor: function (c) {
    var h = 60;
    var f = c.split(",");
    var a = parseInt(f[0]);
    var e = parseInt(f[1]);
    var i = parseInt(f[2]);
    var d = Math.round(a + ((255 - a) / 255) * h);
    if (d > 255) {
      d = 255;
    }
    var j = Math.round(e + ((255 - e) / 255) * h);
    if (j > 255) {
      j = 255;
    }
    var k = Math.round(i + ((255 - i) / 255) * h);
    if (k > 255) {
      k = 255;
    }
    return d + "," + j + "," + k;
  },
  getDarkerColor: function (c) {
    var h = 60;
    var f = c.split(",");
    var a = parseInt(f[0]);
    var e = parseInt(f[1]);
    var i = parseInt(f[2]);
    var d = Math.round(a - (a / 255) * h);
    if (d < 0) {
      d = 0;
    }
    var j = Math.round(e - (e / 255) * h);
    if (j < 0) {
      j = 0;
    }
    var k = Math.round(i - (i / 255) * h);
    if (k < 0) {
      k = 0;
    }
    return d + "," + j + "," + k;
  },
};
var MessageSource = {
  batchSize: 0,
  messages: [],
  withUndo: true,
  withMessage: true,
  withDock: true,
  undoStack: {
    stack: [],
    push: function (b, a) {
      this.stack.push(b);
      if (typeof a == "undefined") {
        a = true;
      }
      if (a) {
        MessageSource.redoStack.stack = [];
      }
      Designer.events.push("undoStackChanged", this.stack.length);
    },
    pop: function () {
      var b = this.stack.length;
      if (b == 0) {
        return null;
      }
      var a = this.stack[b - 1];
      this.stack.splice(b - 1, 1);
      MessageSource.redoStack.push(a);
      Designer.events.push("undoStackChanged", this.stack.length);
      return a;
    },
  },
  redoStack: {
    stack: [],
    push: function (a) {
      this.stack.push(a);
      Designer.events.push("redoStackChanged", this.stack.length);
    },
    pop: function () {
      var b = this.stack.length;
      if (b == 0) {
        return null;
      }
      var a = this.stack[b - 1];
      this.stack.splice(b - 1, 1);
      MessageSource.undoStack.push(a, false);
      Designer.events.push("redoStackChanged", this.stack.length);
      return a;
    },
  },
  beginBatch: function () {
    this.batchSize++;
  },
  commit: function () {
    this.batchSize--;
    this.submit();
  },
  submit: function () {
    if (this.batchSize == 0 && this.messages.length != 0) {
      if (this.withDock) {
        Dock.update(true);
      }
      Designer.events.push("shapeCount");
      if (this.withMessage == false) {
        this.messages = [];
        return;
      }
      if (this.withUndo) {
        this.undoStack.push(this.messages);
      }
      if (chartId != "") {
        var c = Utils.copyArray(this.messages);
        for (var b = 0; b < c.length; b++) {
          var d = c[b];
          if (d.action == "update") {
            d.content.shapes = [];
          }
        }
        var a = { action: "command", messages: c, name: userName };
        CLB.send(a);
      }
      this.messages = [];
    }
  },
  send: function (c, b, a) {
    this.messages.push({ action: c, content: b, tempId: a });
    this.submit();
  },
  receive: function (a) {
    this.doWithoutMessage(function () {
      MessageSource.executeMessages(a, true);
      Utils.showLinkerControls();
      Utils.showLinkerCursor();
    });
  },
  undo: function () {
    var a = this.undoStack.pop();
    if (a == null) {
      return;
    }
    this.doWithoutUndo(function () {
      MessageSource.beginBatch();
      for (var e = 0; e < a.length; e++) {
        var h = a[e];
        if (h.action == "create") {
          Utils.unselect();
          Model.remove(h.content, false);
          $(".shape_dashboard.menu").hide();
          Designer.events.push("changeLinkers");
        } else {
          if (h.action == "update") {
            var c = h.content.shapes;
            Model.updateMulti(c);
            for (var d = 0; d < c.length; d++) {
              var g = c[d];
              Designer.painter.renderShape(g);
            }
            var f = Utils.getSelectedIds();
            Utils.unselect();
            Utils.selectShape(f, false);
            Designer.events.push("changeLinkers");
          } else {
            if (h.action == "remove") {
              var c = h.content;
              Model.addMulti(c);
              for (var d = 0; d < c.length; d++) {
                var g = c[d];
                Designer.painter.renderShape(g);
              }
              Designer.events.push("changeLinkers");
            } else {
              if (h.action == "updatePage") {
                var b = Model.define.page.lineJumps;
                Model.updatePage(h.content.page);
                Designer.events.push("resetBrokenLinker", b);
              } else {
                if (h.action == "setTheme") {
                  Model.setTheme(h.content.theme);
                  Designer.events.push("changeLinkers");
                } else {
                  if (h.action == "setDefaultStyle") {
                    Model.setDefaultStyle(h.content.type, h.content.style);
                  } else {
                    if (h.action == "update_with_beautify") {
                      Model.updateWithBeautify(
                        h.content.content,
                        h.content.updates,
                        h.content.oldTheme
                      );
                    }
                  }
                }
              }
            }
          }
        }
      }
      MessageSource.commit();
    });
  },
  redo: function () {
    var a = this.redoStack.pop();
    if (a == null) {
      return;
    }
    this.doWithoutUndo(function () {
      MessageSource.executeMessages(a, false);
    });
  },
  executeMessages: function (f, k) {
    MessageSource.beginBatch();
    for (var g = 0; g < f.length; g++) {
      var d = f[g];
      if (d.action == "create") {
        var b = d.content;
        if (k) {
          for (var j = 0; j < b.length; j++) {
            var h = b[j];
            if (h.name != "linker") {
              Schema.initShapeFunctions(h);
            }
          }
        }
        Model.addMulti(b);
        for (var j = 0; j < b.length; j++) {
          var h = b[j];
          Designer.painter.renderShape(h);
        }
        Model.build();
        Designer.events.push("changeLinkers");
      } else {
        if (d.action == "update") {
          var l = d.content.updates;
          for (var j = 0; j < l.length; j++) {
            var e = l[j];
            if (k && e.name != "linker") {
              Schema.initShapeFunctions(e);
            }
            Designer.painter.renderShape(e);
          }
          Model.updateMulti(l);
          Designer.events.push("changeLinkers");
          var a = Utils.getSelectedIds();
          Utils.unselect();
          Utils.selectShape(a);
        } else {
          if (d.action == "remove") {
            Utils.unselect();
            Model.remove(d.content);
            Designer.events.push("changeLinkers");
          } else {
            if (d.action == "updatePage") {
              var c = Model.define.page.lineJumps;
              Model.updatePage(d.content.update);
              Designer.events.push("resetBrokenLinker", c);
            } else {
              if (d.action == "setTheme") {
                Model.setTheme(d.content.update);
                Designer.events.push("changeLinkers");
              } else {
                if (d.action == "setDefaultStyle") {
                  Model.setDefaultStyle(d.content.type, d.content.update);
                } else {
                  if (d.action == "clearDefaultStyle") {
                    Model.clearDefaultStyle();
                  } else {
                    if (d.action == "update_with_beautify") {
                      Model.updateWithBeautify(
                        d.content.updates,
                        d.content.content,
                        d.content.theme
                      );
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    MessageSource.commit();
  },
  doWithoutUndo: function (a) {
    this.withUndo = false;
    a();
    this.withUndo = true;
  },
  doWithoutMessage: function (a) {
    this.withMessage = false;
    a();
    this.withMessage = true;
  },
  doWithoutUpdateDock: function (a) {
    this.withDock = false;
    a();
    this.withDock = true;
  },
};
Number.prototype.toScale = function () {
  return this * Designer.config.scale;
};
Number.prototype.restoreScale = function () {
  return this / Designer.config.scale;
};
Date.prototype.format = function (b) {
  var c = {
    "M+": this.getMonth() + 1,
    "d+": this.getDate(),
    "h+": this.getHours(),
    "m+": this.getMinutes(),
    "s+": this.getSeconds(),
    "q+": Math.floor((this.getMonth() + 3) / 3),
    S: this.getMilliseconds(),
  };
  if (/(y+)/.test(b)) {
    b = b.replace(
      RegExp.$1,
      (this.getFullYear() + "").substr(4 - RegExp.$1.length)
    );
  }
  for (var a in c) {
    if (new RegExp("(" + a + ")").test(b)) {
      b = b.replace(
        RegExp.$1,
        RegExp.$1.length == 1 ? c[a] : ("00" + c[a]).substr(("" + c[a]).length)
      );
    }
  }
  return b;
};
