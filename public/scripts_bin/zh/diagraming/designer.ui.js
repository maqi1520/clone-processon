var UI = {
  timer: null,
  init: function () {
    Designer.events.push("isMember", function (e) {
      flowIsMember = e;
    });
    if (isOpenColl2Owner != "true") {
      $("#colla_btn").remove();
    }
    if (isOpenShare2Owner != "true") {
      $("#share_btn").remove();
    }
    if (isOpenPublish2Owner != "true") {
      $("#publish_btn").remove();
    }
    $(".diagram_title").bind("click", function () {
      if ($(this).hasClass("readonly")) {
        return;
      }
      var e = $.trim($(this).text());
      $(this).hide();
      $("#title_container").append("<input type='text'/>");
      $("#title_container").children("input").val(e).select();
      $("#title_container")
        .children("input")
        .bind("blur", function () {
          var f = $.trim($(this).val());
          UI.changeTitle(f);
        })
        .bind("keydown", function (f) {
          if ($.trim($(this).val()).length > 60) {
            $(this).val($.trim($(this).val()).substring(0, 60));
          }
          if (f.keyCode == 13) {
            var g = $.trim($(this).val());
            UI.changeTitle(g);
          }
        });
    });
    $("#bar_theme").button({
      onMousedown: function () {
        UI.showThemeSelect();
      },
    });
    $("#bar_undo").button({
      onClick: function () {
        MessageSource.undo();
      },
    });
    $("#bar_redo").button({
      onClick: function () {
        MessageSource.redo();
      },
    });
    $("#bar_brush").button({
      onClick: function () {
        if ($("#bar_brush").button("isSelected")) {
          $("#bar_brush").button("unselect");
          $("#designer_op_help").hide();
          $(document).unbind("keydown.cancelbrush");
          Utils.selectCallback = null;
        } else {
          Designer.clipboard.brush();
        }
      },
    });
    $("#bar_font_family").button({
      onMousedown: function () {
        $("#font_list").dropdown({
          target: $("#bar_font_family"),
          onSelect: function (g) {
            var f = g.text();
            Designer.setFontStyle({ fontFamily: f });
            $("#bar_font_family").button("setText", f);
          },
        });
        var e = $("#bar_font_family").text().trim();
        $("#font_list")
          .children()
          .each(function () {
            if ($(this).text() == e) {
              $("#font_list").dropdown("select", $(this));
              return false;
            }
          });
      },
    });
    $("#bar_font_size").spinner({
      min: 12,
      max: 100,
      step: 1,
      unit: "px",
      onChange: function (e) {
        Designer.setFontStyle({ size: e });
      },
    });
    $("#bar_font_size").spinner("setValue", "13px");
    $("#bar_font_bold").button({
      onClick: function (g) {
        var f = !$("#bar_font_bold").button("isSelected");
        Designer.setFontStyle({ bold: f });
        $("#bar_font_bold").toggleClass("selected");
      },
    });
    $("#bar_font_italic").button({
      onClick: function () {
        var e = !$("#bar_font_italic").button("isSelected");
        Designer.setFontStyle({ italic: e });
        $("#bar_font_italic").toggleClass("selected");
      },
    });
    $("#bar_font_underline").button({
      onClick: function () {
        var e = !$("#bar_font_underline").button("isSelected");
        Designer.setFontStyle({ underline: e });
        $("#bar_font_underline").toggleClass("selected");
      },
    });
    $("#bar_font_color").button({
      onMousedown: function () {
        var e = $("#bar_font_color").button("getColor");
        $.colorpicker({
          target: $("#bar_font_color"),
          onSelect: function (f) {
            Designer.setFontStyle({ color: f });
            $("#bar_font_color").button("setColor", f);
          },
          color: e,
          trans: false,
        });
      },
    });
    $("#bar_font_align").button({
      onMousedown: function () {
        $("#font_align_list").dropdown({
          target: $("#bar_font_align"),
          onSelect: function (e) {
            var f = {};
            f[e.attr("cate")] = e.attr("al");
            Designer.setFontStyle(f);
          },
        });
      },
    });
    $("#bar_font_height").button({
      onMousedown: function () {
        $("#font_height_list").dropdown({
          target: $("#bar_font_height"),
          onSelect: function (i) {
            var h = parseFloat(i.text());
            Designer.setFontStyle({ lineHeight: h });
          },
        });
        var f = Utils.getSelected()[0];
        var g = Utils.getShapeFontStyle(f.fontStyle);
        var e = g.lineHeight;
        $("#font_height_list")
          .children()
          .each(function () {
            if (parseFloat($(this).text()) == e) {
              $("#font_height_list").dropdown("select", $(this));
            }
          });
      },
    });
    $("#bar_arrange_align").button({
      onMousedown: function () {
        $("#arrange_align_list").dropdown({
          target: $("#bar_arrange_align"),
          onSelect: function (e) {
            var f = e.attr("al");
            Designer.alignShapes(f);
          },
        });
      },
    });
    $("#bar_fill").button({
      onMousedown: function () {
        var e = $("#bar_fill").button("getColor");
        $.colorpicker({
          target: $("#bar_fill"),
          onSelect: function (f) {
            Designer.setFillStyle({ type: "solid", color: f });
            $("#bar_fill").button("setColor", f);
          },
          color: e,
          extend:
            "<div id='bar_fill_gradient' title='渐变' class='extend_item'><img src='/assets/images/color_picker/bg_gradient.svg'></div><div id='bar_fill_img' title='图片填充' class='extend_item'><img src='/assets/images/color_picker/bg_img.svg'></div>",
        });
        $("#bar_fill_gradient")
          .unbind()
          .bind("click", function () {
            Designer.setFillStyle({ type: "gradient" });
            Dock.showView("graphic", true);
            $("#color_picker").dropdown("close");
          });
        $("#bar_fill_img")
          .unbind()
          .bind("click", function () {
            UI.showImageSelect(function (g, f, i) {
              Designer.setFillStyle({
                type: "image",
                fileId: g,
                imageW: f,
                imageH: i,
              });
            });
            $("#color_picker").dropdown("close");
          });
      },
    });
    $("#bar_line_color").button({
      onMousedown: function () {
        var e = $("#bar_line_color").button("getColor");
        $.colorpicker({
          target: $("#bar_line_color"),
          onSelect: function (f) {
            Designer.setLineStyle({ lineColor: f });
            $("#bar_line_color").button("setColor", f);
          },
          color: e,
          trans: false,
        });
      },
    });
    $("#bar_line_width").button({
      onMousedown: function () {
        $("#line_width_list").dropdown({
          target: $("#bar_line_width"),
          onSelect: function (i) {
            var h = parseInt(i.text());
            Designer.setLineStyle({ lineWidth: h });
          },
        });
        var f = Utils.getSelected()[0];
        var e;
        if (f.name == "linker") {
          e = Utils.getLinkerLineStyle(f.lineStyle);
        } else {
          e = Utils.getShapeLineStyle(f.lineStyle);
        }
        var g = e.lineWidth;
        $("#line_width_list")
          .children()
          .each(function () {
            if (parseInt($(this).text()) == g) {
              $("#line_width_list").dropdown("select", $(this));
            }
          });
      },
    });
    $("#bar_line_style").button({
      onMousedown: function () {
        $("#line_style_list").dropdown({
          target: $("#bar_line_style"),
          onSelect: function (j) {
            var i = j.attr("line");
            Designer.setLineStyle({ lineStyle: i });
          },
        });
        var f = Utils.getSelected()[0];
        var e;
        if (f.name == "linker") {
          e = Utils.getLinkerLineStyle(f.lineStyle);
        } else {
          e = Utils.getShapeLineStyle(f.lineStyle);
        }
        var g = e.lineStyle;
        var h = $("#line_style_list").children("li[line=" + g + "]");
        $("#line_style_list").dropdown("select", h);
      },
    });
    $("#bar_linkertype").button({
      onMousedown: function () {
        $("#line_type_list").dropdown({
          target: $("#bar_linkertype"),
          onSelect: function (f) {
            var e = f.attr("tp");
            Designer.setLinkerType(e);
            $("#bar_linkertype")
              .children("div[tit=" + e + "]")
              .show()
              .siblings(".diagraming-icons")
              .hide();
          },
        });
      },
    });
    $("#bar_beginarrow").button({
      onMousedown: function () {
        $("#beginarrow_list").dropdown({
          target: $("#bar_beginarrow"),
          onSelect: function (i) {
            var j = i.attr("arrow");
            Designer.setLineStyle({ beginArrowStyle: j });
            $("#bar_beginarrow")
              .children("div[arrow=" + j + "]")
              .show()
              .siblings(".diagraming-icons")
              .hide();
          },
        });
        var f = Utils.getSelected()[0];
        var e;
        if (f.name == "linker") {
          e = Utils.getLinkerLineStyle(f.lineStyle);
        } else {
          e = Utils.getShapeLineStyle(f.lineStyle);
        }
        var g = e.beginArrowStyle;
        var h = $("#beginarrow_list").children("li[arrow=" + g + "]");
        $("#beginarrow_list").dropdown("select", h);
      },
    });
    $("#bar_endarrow").button({
      onMousedown: function () {
        $("#endarrow_list").dropdown({
          target: $("#bar_endarrow"),
          onSelect: function (i) {
            var j = i.attr("arrow");
            Designer.setLineStyle({ endArrowStyle: j });
            $("#bar_endarrow")
              .children("div[arrow=" + j + "]")
              .show()
              .siblings(".diagraming-icons")
              .hide();
          },
        });
        var f = Utils.getSelected()[0];
        var e;
        if (f.name == "linker") {
          e = Utils.getLinkerLineStyle(f.lineStyle);
        } else {
          e = Utils.getShapeLineStyle(f.lineStyle);
        }
        var g = e.endArrowStyle;
        var h = $("#endarrow_list").children("li[arrow=" + g + "]");
        $("#endarrow_list").dropdown("select", h);
      },
    });
    $("#bar_front").button({
      onClick: function () {
        Designer.layerShapes("front");
      },
    });
    $("#bar_back").button({
      onClick: function () {
        Designer.layerShapes("back");
      },
    });
    $("#bar_lock").button({
      onClick: function () {
        Designer.lockShapes();
      },
    });
    $("#bar_unlock").button({
      onClick: function () {
        Designer.unlockShapes();
      },
    });
    $("#bar_link").button({
      onClick: function () {
        UI.showInsertLink();
      },
    });
    $("#bar_beautify").button({
      onClick: function () {
        $("#bar_beautify").addClass("disabled");
        var e = Beautify.getBeautifyDefinition();
        if (e.updates.length > 0) {
          Model.updateWithBeautify(e.updates, e.content, e.theme);
          Utils.unselect();
          UI.showTip("美化完成");
          setTimeout(function () {
            UI.hideTip();
          }, 3000);
        }
        $("#bar_beautify").removeClass("disabled");
        poCollect("流程图编辑器功能点击", { 功能: "一键美化" });
      },
    });
    $("#bar_collapse").button({
      onClick: function () {
        var e = UI.toogleTitleBar();
        CLB.setConfig("showToolbar", e);
      },
    });
    $("#bar_lane_num").spinner({
      min: 0,
      max: 20,
      step: 1,
      onChange: function (h) {
        var e = false;
        for (var f = 0; f < Schema.categories.length; f++) {
          var g = Schema.categories[f];
          if (g.name == "lane") {
            e = true;
          }
        }
        if (e) {
          Designer.setLaneNum(h);
        } else {
          Designer.renderSchemaJs("lane", function () {
            Designer.setLaneNum(h);
          });
        }
      },
    });
    $("#bar_pool_horizontal")
      .off("click")
      .on("click", function () {
        var e = false;
        for (var f = 0; f < Schema.categories.length; f++) {
          var g = Schema.categories[f];
          if (g.name == "lane") {
            e = true;
          }
        }
        if (e) {
          Designer.setPoolOrientation("horizontal");
        } else {
          Designer.renderSchemaJs("lane", function () {
            Designer.setPoolOrientation("horizontal");
          });
        }
      });
    $("#bar_pool_vertical")
      .off("click")
      .on("click", function () {
        var e = false;
        for (var f = 0; f < Schema.categories.length; f++) {
          var g = Schema.categories[f];
          if (g.name == "lane") {
            e = true;
          }
        }
        if (e) {
          Designer.setPoolOrientation("vertical");
        } else {
          Designer.renderSchemaJs("lane", function () {
            Designer.setPoolOrientation("vertical");
          });
        }
      });
    $("#bar_text_horizontal")
      .off("click")
      .on("click", function () {
        Designer.setPoolText("vertical");
      });
    $("#bar_text_vertical")
      .off("click")
      .on("click", function () {
        Designer.setPoolText("horizontal");
      });
    $("#bar_grid_row").spinner({
      min: 1,
      max: 40,
      step: 1,
      onChange: function (g) {
        var e = Utils.getSelected()[0].path.length;
        var f = { type: "row", val: g - e };
        Designer.setGridNum(f);
      },
    });
    $("#bar_grid_column").spinner({
      min: 1,
      max: 40,
      step: 1,
      onChange: function (g) {
        var e = Utils.getSelected()[0].path[0].length;
        var f = { type: "column", val: g - e };
        Designer.setGridNum(f);
      },
    });
    $("#bar_column_before").button({
      onClick: function () {
        var e = Utils.getSelected()[0].path[0].length;
        var g = Utils.gridSelectObj;
        var f = g.columns[g.columns.length - 1] + 1;
        var i = g.rows[g.rows.length - 1] + 1;
        var h = {
          type: "column",
          val: 1,
          columnIndex: f,
          rowIndex: i,
          direction: "before",
        };
        Designer.setGridNum(h);
      },
    });
    $("#bar_column_after").button({
      onClick: function () {
        var f = Utils.gridSelectObj;
        var e = f.columns[f.columns.length - 1] + 1;
        var h = f.rows[f.rows.length - 1] + 1;
        var g = {
          type: "column",
          val: 1,
          columnIndex: e,
          rowIndex: h,
          direction: "after",
        };
        Designer.setGridNum(g);
      },
    });
    $("#bar_row_before").button({
      onClick: function () {
        var f = Utils.gridSelectObj;
        var e = f.columns[f.columns.length - 1] + 1;
        var h = f.rows[f.rows.length - 1] + 1;
        var g = {
          type: "row",
          val: 1,
          columnIndex: e,
          rowIndex: h,
          direction: "before",
        };
        Designer.setGridNum(g);
      },
    });
    $("#bar_row_after").button({
      onClick: function () {
        var f = Utils.gridSelectObj;
        var e = f.columns[f.columns.length - 1] + 1;
        var h = f.rows[f.rows.length - 1] + 1;
        var g = {
          type: "row",
          val: 1,
          columnIndex: e,
          rowIndex: h,
          direction: "after",
        };
        Designer.setGridNum(g);
      },
    });
    $("#bar_del_column").button({
      onClick: function () {
        var f = Utils.gridSelectObj;
        var e = f.columns[f.columns.length - 1] + 1;
        var h = f.rows[f.rows.length - 1] + 1;
        var g = { type: "column", val: -1, columnIndex: e, rowIndex: h };
        Designer.setGridNum(g);
      },
    });
    $("#bar_del_row").button({
      onClick: function () {
        var f = Utils.gridSelectObj;
        var e = f.columns[f.columns.length - 1] + 1;
        var h = f.rows[f.rows.length - 1] + 1;
        var g = { type: "row", val: -1, columnIndex: e, rowIndex: h };
        Designer.setGridNum(g);
      },
    });
    $("#bar_grid_fill").colorButton({
      onSelect: function (e) {
        Designer.setFillStyle({ type: "solid", color: e });
      },
    });
    $("#menu_bar")
      .children()
      .bind("mousedown", function (g) {
        var f = $(this);
        b(f);
        g.stopPropagation();
      });
    $("#menu_bar")
      .children()
      .bind("mouseenter", function () {
        var e = $(this);
        if ($("#ui_container").find(".options_menu:visible").length > 0) {
          b(e);
        }
      });
    $("[click-btn]")
      .off("click")
      .on("click", function (g) {
        var f = $(this).attr("click-btn");
        switch (f) {
          case "clearStyle":
            Model.clearDefaultStyle();
            UI.showTip("默认样式已清除成功");
            $(this).hide();
            $("#bar_list_edit").hide();
            setTimeout(function () {
              UI.hideTip();
            }, 1000);
            break;
        }
        g.stopPropagation();
      });
    $("#export_btn").bind("click", function (g) {
      var f = $(this);
      b(f);
      g.stopPropagation();
    });
    function b(f) {
      var i = f.attr("menu");
      if (f.hasClass("readonly")) {
        return;
      }
      if (
        Model.define.defaultStyle == null &&
        Model.define.defaultLinkerStyle == null
      ) {
        $("[click-btn=clearStyle]").hide();
      } else {
        $("[click-btn=clearStyle]").show();
      }
      $("#" + i).dropdown({
        target: f,
        onSelect: function (j) {
          d(j);
        },
      });
      if (i == "bar_list_page") {
        $("#bar_page_color")
          .off("mouseenter")
          .on("mouseenter", function () {
            $.colorpicker({
              target: $("#bar_page_color"),
              color: Model.define.page.backgroundColor || "transparent",
              position: "right",
              dropdown: false,
              trans: true,
              onSelect: function (j) {
                Designer.setPageStyle({ backgroundColor: j });
              },
            });
          });
        $("#bar_page_color")
          .off("mouseleave")
          .on("mouseleave", function () {
            setTimeout(function () {
              if (!$("#bar_page_color").hasClass("selected")) {
                $("#color_picker").hide();
              }
            }, 10);
          });
        var g = $("#bar_list_pagesize").children(
          "li[w=" +
            Model.define.page.width +
            "][h=" +
            Model.define.page.height +
            "]"
        );
        if (g.length > 0) {
          $("#bar_list_pagesize").dropdown("select", g);
        } else {
          $("#bar_list_pagesize").dropdown("select", $("#page_size_custom"));
        }
        $("#page_size_w").spinner("setValue", Model.define.page.width + "px");
        $("#page_size_h").spinner("setValue", Model.define.page.height + "px");
        g = $("#bar_list_padding").children(
          "li[p=" + Model.define.page.padding + "]"
        );
        $("#bar_list_padding").dropdown("select", g);
        g = $("#bar_list_gridsize").children(
          "li[s=" + Model.define.page.gridSize + "]"
        );
        $("#bar_list_gridsize").dropdown("select", g);
        if (Model.define.page.showGrid) {
          $("#bar_list_page").dropdown(
            "select",
            $("#bar_list_page").children("li[ac=set_page_showgrid]")
          );
        } else {
          $("#bar_list_page").dropdown(
            "unselect",
            $("#bar_list_page").children("li[ac=set_page_showgrid]")
          );
        }
        if (Model.define.page.lineJumps) {
          $("#bar_list_page")
            .children("li[ac=set_page_linejumps]")
            .prepend(
              "<div class='ico ico_selected diagraming-icons'>&#xe75c;</div>"
            );
        } else {
          $("#bar_list_page")
            .children("li[ac=set_page_linejumps] > .ico_selected")
            .remove();
        }
        var e = "portrait";
        if (Model.define.page.orientation) {
          e = Model.define.page.orientation;
        }
        var h = $("#bar_list_orientation").children("li[ori=" + e + "]");
        $("#bar_list_orientation").children().menuitem("unselect");
        h.menuitem("select");
      } else {
        if (i == "bar_list_view") {
          var g = $("#bar_list_view").children(
            ".static[zoom='" + Designer.config.scale + "']"
          );
          if (g.length) {
            $("#bar_list_page").dropdown("select", g);
          }
        }
      }
    }
    function d(r) {
      var i = r.attr("ac");
      if (i == "rename") {
        $(".diagram_title").trigger("click");
      } else {
        if (i == "close") {
          window.location.href = "/diagraming/back?id=" + chartId;
        } else {
          if (i == "saveAs") {
            UI.showSaveAs();
          } else {
            if (i == "undo") {
              MessageSource.undo();
            } else {
              if (i == "redo") {
                MessageSource.redo();
              } else {
                if (i == "cut") {
                  Designer.clipboard.cut();
                } else {
                  if (i == "copy") {
                    Designer.clipboard.copy();
                  } else {
                    if (i == "paste") {
                      Designer.clipboard.paste();
                    } else {
                      if (i == "duplicate") {
                        Designer.clipboard.duplicate();
                      } else {
                        if (i == "brush") {
                          Designer.clipboard.brush();
                        } else {
                          if (i == "defaultStyle") {
                            UI.setDefaultStyle(r);
                          } else {
                            if (i == "beautify") {
                              $("#bar_beautify").trigger("click");
                            } else {
                              if (i == "selectall") {
                                Designer.selectAll();
                              } else {
                                if (i == "delete") {
                                  Designer.op.removeShape();
                                } else {
                                  if (i == "zoom") {
                                    var t = r.attr("zoom");
                                    if (t == "in") {
                                      Designer.zoomIn();
                                    } else {
                                      if (t == "out") {
                                        Designer.zoomOut();
                                      } else {
                                        var k = parseFloat(t);
                                        Designer.setZoomScale(k);
                                      }
                                    }
                                  } else {
                                    if (i == "insert") {
                                      var o = r.attr("in");
                                      if (o == "text") {
                                        Designer.op.changeState(
                                          "creating_free_text"
                                        );
                                      } else {
                                        if (o == "image") {
                                          UI.showImageSelect(function (
                                            s,
                                            p,
                                            v
                                          ) {
                                            UI.insertImage(s, p, v);
                                          });
                                        } else {
                                          if (o == "line") {
                                            Designer.op.changeState(
                                              "creating_free_linker"
                                            );
                                          } else {
                                            if (o == "equation") {
                                              var m = Utils.getSelected()[0];
                                              Designer.op.equation.insertLastEquation(
                                                m
                                              );
                                            }
                                          }
                                        }
                                      }
                                    } else {
                                      if (i == "set_page_size") {
                                        var q = parseInt(r.attr("w"));
                                        var j = parseInt(r.attr("h"));
                                        Designer.setPageStyle({
                                          width: q,
                                          height: j,
                                        });
                                      } else {
                                        if (i == "set_page_padding") {
                                          var f = parseInt(r.attr("p"));
                                          Designer.setPageStyle({ padding: f });
                                        } else {
                                          if (i == "set_page_orientation") {
                                            var e = r.attr("ori");
                                            Designer.setPageStyle({
                                              orientation: e,
                                            });
                                          } else {
                                            if (i == "set_page_showgrid") {
                                              if (r.menuitem("isSelected")) {
                                                r.menuitem("unselect");
                                                Designer.setPageStyle({
                                                  showGrid: false,
                                                });
                                              } else {
                                                r.menuitem("select");
                                                Designer.setPageStyle({
                                                  showGrid: true,
                                                });
                                              }
                                            } else {
                                              if (i == "set_page_gridsize") {
                                                var u = parseInt(r.attr("s"));
                                                Designer.setPageStyle({
                                                  gridSize: u,
                                                });
                                              } else {
                                                if (i == "set_page_linejumps") {
                                                  var g = false;
                                                  if (
                                                    r.menuitem("isSelected")
                                                  ) {
                                                    g = true;
                                                    r.menuitem("unselect");
                                                    Designer.setPageStyle({
                                                      lineJumps: false,
                                                    });
                                                  } else {
                                                    r.menuitem("select");
                                                    g = false;
                                                    Designer.setPageStyle({
                                                      lineJumps: true,
                                                    });
                                                  }
                                                  Designer.events.push(
                                                    "resetBrokenLinker",
                                                    g
                                                  );
                                                } else {
                                                  if (i == "front") {
                                                    Designer.layerShapes(
                                                      "front"
                                                    );
                                                  } else {
                                                    if (i == "back") {
                                                      Designer.layerShapes(
                                                        "back"
                                                      );
                                                    } else {
                                                      if (i == "forward") {
                                                        Designer.layerShapes(
                                                          "forward"
                                                        );
                                                      } else {
                                                        if (i == "backward") {
                                                          Designer.layerShapes(
                                                            "backward"
                                                          );
                                                        } else {
                                                          if (
                                                            i == "align_shape"
                                                          ) {
                                                            var l =
                                                              r.attr("al");
                                                            Designer.alignShapes(
                                                              l
                                                            );
                                                          } else {
                                                            if (
                                                              i ==
                                                              "distribute_shape"
                                                            ) {
                                                              var n =
                                                                r.attr("dis");
                                                              Designer.distributeShapes(
                                                                n
                                                              );
                                                            } else {
                                                              if (
                                                                i ==
                                                                "match_size"
                                                              ) {
                                                                if (
                                                                  r.attr(
                                                                    "custom"
                                                                  )
                                                                ) {
                                                                  Dock.showView(
                                                                    "metric",
                                                                    true
                                                                  );
                                                                } else {
                                                                  var n = {};
                                                                  var q =
                                                                    r.attr("w");
                                                                  var j =
                                                                    r.attr("h");
                                                                  if (q) {
                                                                    n.w = q;
                                                                  }
                                                                  if (j) {
                                                                    n.h = j;
                                                                  }
                                                                  Designer.matchSize(
                                                                    n
                                                                  );
                                                                }
                                                              } else {
                                                                if (
                                                                  i == "lock"
                                                                ) {
                                                                  Designer.lockShapes();
                                                                } else {
                                                                  if (
                                                                    i ==
                                                                    "unlock"
                                                                  ) {
                                                                    Designer.unlockShapes();
                                                                  } else {
                                                                    if (
                                                                      i ==
                                                                      "group"
                                                                    ) {
                                                                      Designer.group();
                                                                    } else {
                                                                      if (
                                                                        i ==
                                                                        "ungroup"
                                                                      ) {
                                                                        Designer.ungroup();
                                                                      } else {
                                                                        if (
                                                                          i ==
                                                                          "hotkey"
                                                                        ) {
                                                                          UI.showHotKey();
                                                                        } else {
                                                                          if (
                                                                            i ==
                                                                            "feedback"
                                                                          ) {
                                                                            UI.showFeedBack();
                                                                          } else {
                                                                            if (
                                                                              i ==
                                                                              "getting_started"
                                                                            ) {
                                                                              UI.gettingStart();
                                                                            } else {
                                                                              if (
                                                                                i ==
                                                                                "ai_power"
                                                                              ) {
                                                                                $(
                                                                                  "#brain-power"
                                                                                ).trigger(
                                                                                  "click"
                                                                                );
                                                                              } else {
                                                                                if (
                                                                                  i ==
                                                                                  "export"
                                                                                ) {
                                                                                  var n =
                                                                                    r.attr(
                                                                                      "type"
                                                                                    );
                                                                                  UI.doExport(
                                                                                    n
                                                                                  );
                                                                                  poCollect(
                                                                                    "下载文件",
                                                                                    {
                                                                                      文件类型:
                                                                                        cateType,
                                                                                      下载格式:
                                                                                        n,
                                                                                      用户类型:
                                                                                        flowIsMember
                                                                                          ? orgId
                                                                                            ? "团队版"
                                                                                            : "个人版"
                                                                                          : "免费版",
                                                                                    }
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
    $("#page_size_w").spinner({
      min: 200,
      unit: "px",
      step: 100,
      onChange: function (e) {
        Designer.setPageStyle({ width: e });
      },
    });
    $("#page_size_h").spinner({
      min: 200,
      unit: "px",
      step: 100,
      onChange: function (e) {
        Designer.setPageStyle({ height: e });
      },
    });
    Designer.events.push("selectChanged", 0);
    Designer.events.push("clipboardChanged", 0);
    Designer.events.push("undoStackChanged", 0);
    Designer.events.push("redoStackChanged", 0);
    var a =
      "<div id='extra-box' style='margin-top:12px'><ul class='op-menu-list'><li tit= 'shortcut'><span class='icons'>&#xe70b;</span>快捷键说明</li><li tit= 'equation'><span class='icons'>&#xe736;</span>LaTeX常用方程式</li><li tit = 'guide'><span class='icons'>&#xe712;</span>新用户指引</li><li tit = 'mind_book'><span class='icons'>&#xe711;</span>详细使用手册</li><li tit = 'feedback' ><span class='icons'>&#xe759;</span>意见反馈</li></ul></div>";
    var c = {
      bar_theme: "#bar_theme",
      bar_undo: "#bar_undo",
      bar_redo: "#bar_redo",
      bar_brush: "#bar_brush",
      bar_fill: "#bar_fill",
      bar_line_color: "#bar_line_color",
      bar_line_width: "#bar_line_width",
      bar_line_style: "#bar_line_style",
      bar_linkertype: "#bar_linkertype",
      bar_beginarrow: "#bar_beginarrow",
      bar_endarrow: "#bar_endarrow",
      bar_front: "#bar_front",
      bar_back: "#bar_back",
      bar_lock: "#bar_lock",
      bar_unlock: "#bar_unlock",
      bar_link: "#bar_link",
      bar_beautify: "#bar_beautify",
      dock_btn_navigator: "#dock_btn_navigator",
      dock_btn_graphic: "#dock_btn_graphic",
      dock_btn_metric: "#dock_btn_metric",
      dock_btn_attribute: "#dock_btn_attribute",
      dock_btn_page: "#dock_btn_page",
      dock_btn_history: "#dock_btn_history",
      dock_btn_comment: "#dock_btn_comment",
    };
    if (typeof c == "undefined" || c == "") {
      $("#brain-power").remove();
    }
    $("#brain-power")
      .off("click")
      .on("click", function () {
        $(".equation-list").hide();
        poCollect("流程图图编辑页-点击左下功能查找按钮", { 来源: "官网项目" });
        var f = $("#designer_header"),
          h = f.outerHeight() + 20;
        if ($("#right-help-con").length < 1) {
          var g = 0,
            e = 0;
          smartAiHelpCon.init({
            top: h,
            right: 60,
            height: "560px",
            designerType: e,
            channel: g,
            subUnit: [a],
            ai_tag_list: c,
            extra: false,
            comm_question: true,
          });
        } else {
          smartAiHelpCon.spread();
        }
        $("#extra-box")
          .off("mousedown.power")
          .on("mousedown.power", "li[tit]", function () {
            var j = $(this),
              i = j.attr("tit");
            if (i) {
              switch (i) {
                case "shortcut":
                  UI.showHotKey();
                  break;
                case "equation":
                  UI.loadEquation();
                  break;
                case "guide":
                  UI.gettingStart();
                  break;
                case "mind_book":
                  window.open("/support");
                  break;
                case "feedback":
                  UI.showFeedBack();
                  break;
              }
            }
            smartAiHelpCon.close();
          });
        $("#designer")
          .off("mousedown.clsoeAi")
          .on("mousedown.clsoeAi", function (i) {
            smartAiHelpCon.close();
          });
      });
  },
  changeTitle: function (d) {
    var b = $(".diagram_title").text();
    if (d && d != b && chartId != "") {
      var a = { action: "changeTitle", title: d };
      CLB.send(a);
    }
    var c = d != "" ? d : b;
    $("title").text(c + " - ProcessOn");
    $(".diagram_title").text(c).show();
    $("#title_container").children("input").remove();
  },
  update: function () {
    var i = Utils.getSelectedIds();
    var k = i.length;
    var b = Utils.getSelectedLinkerIds();
    var o = b.length;
    var g = Utils.getSelectedShapeIds();
    var f = g.length;
    var s = Utils.getSelectedLockedIds().length;
    var d = Utils.getSelectedGroups().length;
    var p = Utils.getSelectedGroupsAndShapes().length;
    var h = $("#bar_list_arrange");
    if (k == 0) {
      $(".toolbar").find(".selected").removeClass("selected");
      if ($("#designer_op_help").is(":visible")) {
        $("#bar_brush").button("enable");
        $("#bar_brush").button("select");
      } else {
        $("#bar_brush").button("disable");
      }
      $("#bar_font_family").button("disable");
      $("#bar_font_size").button("disable");
      $("#bar_font_bold").button("disable");
      $("#bar_font_italic").button("disable");
      $("#bar_font_underline").button("disable");
      $("#bar_font_color").button("disable");
      $("#bar_font_align").button("disable");
      $("#bar_font_height").button("disable");
      $("#bar_line_color").button("disable");
      $("#bar_line_width").button("disable");
      $("#bar_line_style").button("disable");
      $("#bar_front").button("disable");
      $("#bar_back").button("disable");
      $("#bar_lock").button("disable");
      var q = $("#bar_list_edit");
      q.children("li[ac=cut]").menuitem("disable");
      q.children("li[ac=copy]").menuitem("disable");
      q.children("li[ac=duplicate]").menuitem("disable");
      q.children("li[ac=brush]").menuitem("disable");
      q.children("li[ac=delete]").menuitem("disable");
      h.children("li[ac=front]").menuitem("disable");
      h.children("li[ac=back]").menuitem("disable");
      h.children("li[ac=forward]").menuitem("disable");
      h.children("li[ac=backward]").menuitem("disable");
      h.children("li[ac=lock]").menuitem("disable");
      $("#bar_list_insert").children("li[in=equation]").menuitem("disable");
      $(".lanebar").css("display", "none");
      $(".gridbar").css("display", "none");
    } else {
      $("#bar_brush").button("enable");
      if ($("#designer_op_help").is(":visible")) {
        $("#bar_brush").button("select");
      }
      $("#bar_font_family").button("enable");
      $("#bar_font_size").button("enable");
      $("#bar_font_bold").button("enable");
      $("#bar_font_italic").button("enable");
      $("#bar_font_underline").button("enable");
      $("#bar_font_color").button("enable");
      $("#bar_font_align").button("enable");
      $("#bar_line_color").button("enable");
      $("#bar_line_width").button("enable");
      $("#bar_line_style").button("enable");
      $("#bar_front").button("enable");
      $("#bar_back").button("enable");
      $("#bar_lock").button("enable");
      var q = $("#bar_list_edit");
      q.children("li[ac=cut]").menuitem("enable");
      q.children("li[ac=copy]").menuitem("enable");
      q.children("li[ac=duplicate]").menuitem("enable");
      q.children("li[ac=brush]").menuitem("enable");
      q.children("li[ac=delete]").menuitem("enable");
      h.children("li[ac=front]").menuitem("enable");
      h.children("li[ac=back]").menuitem("enable");
      h.children("li[ac=forward]").menuitem("enable");
      h.children("li[ac=backward]").menuitem("enable");
      h.children("li[ac=lock]").menuitem("enable");
      var a = Model.getShapeById(i[0]);
      var e;
      var c;
      if (a.name == "linker") {
        e = Utils.getLinkerFontStyle(a.fontStyle);
        c = Utils.getLinkerLineStyle(a.lineStyle);
        $("#bar_font_height").button("disable");
        $("#bar_list_insert").children("li[in=equation]").menuitem("disable");
      } else {
        e = Utils.getShapeFontStyle(a.fontStyle);
        c = Utils.getShapeLineStyle(a.lineStyle);
        $("#bar_font_height").button("enable");
        if (k == 1) {
          $("#bar_list_insert").children("li[in=equation]").menuitem("enable");
        }
      }
      $("#bar_font_family").button("setText", e.fontFamily);
      $("#bar_font_size").spinner("setValue", e.size + "px");
      if (e.bold) {
        $("#bar_font_bold").button("select");
      } else {
        $("#bar_font_bold").button("unselect");
      }
      if (e.italic) {
        $("#bar_font_italic").button("select");
      } else {
        $("#bar_font_italic").button("unselect");
      }
      if (e.underline) {
        $("#bar_font_underline").button("select");
      } else {
        $("#bar_font_underline").button("unselect");
      }
      $("#bar_font_color").button("setColor", e.color);
      $("#bar_line_color").button("setColor", c.lineColor);
      if (a.name.indexOf("Pool") > -1) {
        $(".lanebar").css("display", "block");
        var r = Utils.getLanesByPool(a),
          m = r.length;
        $("#bar_lane_num").spinner("setValue", m);
        if (a.name.indexOf("vertical") > -1) {
          $("#bar_pool_vertical").button("select");
          $("#bar_pool_horizontal").button("unselect");
        } else {
          $("#bar_pool_vertical").button("unselect");
          $("#bar_pool_horizontal").button("select");
        }
        if (a.fontStyle.orientation == "horizontal") {
          $("#bar_text_vertical").button("select");
          $("#bar_text_horizontal").button("unselect");
        } else {
          $("#bar_text_vertical").button("unselect");
          $("#bar_text_horizontal").button("select");
        }
      } else {
        $(".lanebar").css("display", "none");
      }
      if (a.name.indexOf("grid") > -1) {
        $(".gridbar").css("display", "block");
        var n = a.path.length,
          l = a.path[0].length;
        $("#bar_grid_row").spinner("setValue", n);
        $("#bar_grid_column").spinner("setValue", l);
        if (Utils.gridSelectObj.indexs.length > 0) {
          $("#bar_column_before").button("enable");
          $("#bar_column_after").button("enable");
          $("#bar_row_before").button("enable");
          $("#bar_row_after").button("enable");
          $("#bar_del_column").button("enable");
          $("#bar_del_row").button("enable");
        } else {
          $("#bar_column_before").button("disable");
          $("#bar_column_after").button("disable");
          $("#bar_row_before").button("disable");
          $("#bar_row_after").button("disable");
          $("#bar_del_column").button("disable");
          $("#bar_del_row").button("disable");
        }
        if (n >= 40) {
          $("#bar_row_before").button("disable");
          $("#bar_row_after").button("disable");
        }
        if (l >= 40) {
          $("#bar_column_before").button("disable");
          $("#bar_column_after").button("disable");
        }
        if (n <= 1) {
          $("#bar_del_row").button("disable");
        }
        if (l <= 1) {
          $("#bar_del_column").button("disable");
        }
      } else {
        $(".gridbar").css("display", "none");
      }
    }
    if (f == 0) {
      $("#bar_fill").button("disable");
    } else {
      $("#bar_fill").button("enable");
      var a = Model.getShapeById(g[0]);
      var j = Utils.getShapeFillStyle(a.fillStyle);
      if (j.type == "solid") {
        $("#bar_fill").button("setColor", j.color);
      } else {
        if (j.type == "gradient") {
          $("#bar_fill").button("setColor", j.endColor);
        }
      }
    }
    if (f != 1) {
      $("#bar_link").button("disable");
    } else {
      $("#bar_link").button("enable");
    }
    if (o == 0) {
      $("#bar_linkertype").button("disable");
      $("#bar_beginarrow").button("disable");
      $("#bar_endarrow").button("disable");
    } else {
      $("#bar_linkertype").button("enable");
      $("#bar_beginarrow").button("enable");
      $("#bar_endarrow").button("enable");
      var a = Model.getShapeById(b[0]);
      var c = Utils.getLinkerLineStyle(a.lineStyle);
      $("#bar_linkertype")
        .children("div[tit=" + a.linkerType.toLowerCase() + "]")
        .show()
        .siblings(".diagraming-icons")
        .hide();
      $("#bar_beginarrow")
        .children("div[arrow=" + c.beginArrowStyle + "]")
        .show()
        .siblings(".diagraming-icons")
        .hide();
      $("#bar_endarrow")
        .children("div[arrow=" + c.endArrowStyle + "]")
        .show()
        .siblings(".diagraming-icons")
        .hide();
    }
    if (s == 0) {
      $("#bar_unlock").button("disable");
      h.children("li[ac=unlock]").menuitem("disable");
    } else {
      $("#bar_unlock").button("enable");
      h.children("li[ac=unlock]").menuitem("enable");
    }
    if (k == 1) {
      q.children("li[ac=defaultStyle]").menuitem("enable");
    } else {
      if (k < 2) {
        h.children("li[ac=group]").menuitem("disable");
        $("#bar_arrange_align").menuitem("disable");
        $("#menu_arrange_align").menuitem("disable");
        q.children("li[ac=defaultStyle]").menuitem("disable");
      } else {
        h.children("li[ac=group]").menuitem("enable");
        $("#bar_arrange_align").menuitem("enable");
        $("#menu_arrange_align").menuitem("enable");
        q.children("li[ac=defaultStyle]").menuitem("disable");
      }
    }
    if (f < 2) {
      $("#bar_arrange_match").menuitem("disable");
    } else {
      $("#bar_arrange_match").menuitem("enable");
    }
    if (p < 3) {
      $("#bar_arrange_dist").menuitem("disable");
    } else {
      $("#bar_arrange_dist").menuitem("enable");
    }
    if (d == 0) {
      h.children("li[ac=ungroup]").menuitem("disable");
    } else {
      h.children("li[ac=ungroup]").menuitem("enable");
    }
  },
  showInsertLink: function () {
    $("#link_dialog").dlg();
    var a = Utils.getSelected()[0].link;
    if (!a) {
      a = "";
    }
    $("#linkto_addr").val(a).select();
    $("#linkto_addr")
      .unbind()
      .bind("keydown", function (b) {
        if (b.keyCode == 13) {
          UI.setLink();
        }
      });
  },
  setLink: function () {
    var b = $("#linkto_addr").val();
    var a = Utils.getSelected()[0];
    a.link = b;
    Model.update(a);
    $("#link_dialog").dlg("close");
  },
  imageSelectedCallback: null,
  showImageSelect: function (d) {
    if (d) {
      this.imageSelectedCallback = d;
    } else {
      this.imageSelectedCallback = null;
    }
    this.fetchingRequest = null;
    var a = $(window).height() - 200;
    if (a > 550) {
      a = 550;
    } else {
      if (a < 200) {
        a = 200;
      }
    }
    $(".image_list").height(a);
    $("#image_dialog").dlg({
      onClose: function () {
        if (UI.fetchingRequest) {
          UI.fetchingRequest.abort();
        }
      },
    });
    if ($("#image_select_upload").is(":visible")) {
      UI.loadUserImages();
    }
    $(".image_sources")
      .children()
      .unbind("click")
      .bind("click", function () {
        UI.showImageSelectContent($(this).attr("ty"));
      });
    $("#upload_img_res").empty();
    $("#input_upload_image")
      .unbind()
      .bind("change", function () {
        var e = this.files[0].type;
        if ($.trim($(this).val()) == "") {
          return;
        }
        if (e.indexOf("image") < 0) {
          Util.globalTopTip(
            "文件格式不正确，仅支持图像文件。",
            "top_error",
            2000,
            $("#image_dialog"),
            true
          );
          return;
        }
        $("#upload_img_res").html("<span style='color: #666'>上传中...</span>");
        $("#frm_upload_image").submitForm({
          success: function (f) {
            $("#input_upload_image").val("");
            if (f.result == "type_wrong") {
              $("#upload_img_res").html("此文件不是图片，请重新选择");
            } else {
              if (f.result == "size_wrong") {
                $("#upload_img_res").html("文件大小超出要求，最大2M");
              } else {
                if (f.result == "exception") {
                  $("#upload_img_res").html("无法使用此图片，请选择其他图片");
                } else {
                  if (f.result == "svg_error") {
                    $("#upload_img_res").html(
                      "上传失败，svg文件中包含无法支持的foreignObject属性"
                    );
                  } else {
                    var g = f.image;
                    UI.setShapeImage(
                      g.fileId,
                      g.imageW || 100,
                      g.imageH || 100
                    );
                  }
                }
              }
            }
          },
        });
      });
    $("#input_img_url").val("");
    $("#img_url_area").empty();
    var c = "";
    function b() {
      var e = $("#input_img_url").val().trim();
      if (e != c) {
        c = e;
        if (e != "") {
          if (e.indexOf("http") < 0) {
            e = "http://" + e;
          }
          $("#img_url_area").html(
            "<span class='img_url_loading_tip'>正在加载预览...</span>"
          );
          var f = $("<img class='img_url_loading' src='" + e + "'/>").appendTo(
            "#img_url_area"
          );
          f.unbind()
            .bind("load", function () {
              f.show().addClass("img_url_loaded");
              $(".img_url_loading_tip").remove();
            })
            .bind("error", function () {
              $("#img_url_area").html(
                "<div class='img_url_error'>无法在此地址下加载图片。<ul><li>请检查图片地址是否输入正确。</li><li>确保图片地址是公开的。</li><ul></div>"
              );
            });
        }
      }
    }
    $("#input_img_url")
      .unbind()
      .bind("paste", function () {
        b();
      })
      .bind("keyup", function () {
        b();
      })
      .bind("blur", function () {
        b();
      })
      .bind("input", function () {
        b();
      });
    $("#input_img_search")
      .unbind()
      .bind("keydown", function (f) {
        if (f.keyCode == 13) {
          UI.searchImage();
        }
      });
    $("#btn_img_search")
      .unbind()
      .bind("click", function () {
        UI.searchImage();
      });
    $("#set_image_submit").button("enable");
    $("#set_image_submit").button({
      onClick: function () {
        var e = $(".image_sources").children(".active").attr("ty");
        if (e == "upload") {
          var n = $("#user_image_items").children(".image_item_selected");
          if (n.length > 0) {
            var g = n.attr("fileId");
            var m = n.attr("w");
            var j = n.attr("h");
            UI.setShapeImage(g, m, j);
          } else {
            $("#image_dialog").dlg("close");
          }
        } else {
          if (e == "url") {
            var k = $(".img_url_loaded");
            if (k.length > 0) {
              var f = k.attr("src");
              UI.setShapeImage(f, k.width(), k.height());
            } else {
              $("#image_dialog").dlg("close");
            }
          } else {
            var n = $("#google_image_items").children(".image_item_selected");
            if (n.length > 0) {
              var f = n.attr("u");
              var l = parseInt(n.attr("w"));
              var i = parseInt(n.attr("h"));
              UI.setShapeImage(f, l, i);
            } else {
              $("#image_dialog").dlg("close");
            }
          }
        }
      },
    });
    $("#set_image_cancel").button({
      onClick: function () {
        $("#image_dialog").dlg("close");
      },
    });
    $("#set_image_text").empty();
  },
  showImageSelectContent: function (a) {
    $(".image_list").hide();
    $("#image_select_" + a)
      .show()
      .find("input[type=text]")
      .select();
    $(".image_sources").children().removeClass("active");
    $(".image_sources")
      .children("li[ty=" + a + "]")
      .addClass("active");
  },
  loadUserImages: function (a) {
    $("#user_image_items").empty();
    $.ajax({
      url: "/user_image/list",
      success: function (d) {
        if (d.images) {
          for (var c = 0; c < d.images.length; c++) {
            var b = d.images[c];
            UI.appendUserImage(b);
          }
          $("#user_image_items").append("<div style='clear: both'></div>");
        }
      },
    });
    $("#user_image_items").attr("loaded", "true");
  },
  searchIndex: 0,
  searchKeywords: "",
  searchImage: function () {
    var a = $("#input_img_search").val();
    if (a.trim() != "") {
      $("#google_image_items").empty();
      this.searchKeywords = encodeURI(a);
      this.searchIndex = 0;
      UI.loadSearchImg();
    } else {
      $("#input_img_search").focus();
    }
  },
  loadSearchImg: function () {
    $.getJSON(
      "https://api.iconfinder.com/v2/icons/search?query=" +
        this.searchKeywords +
        "&offset=" +
        this.searchIndex +
        "&count=24&minimum_size=128&vector=false&premium=false",
      function (c) {
        if (c.total_count == 0) {
          $("#google_image_items").html(
            "<div class='img_gg_loading_tip'>没有搜索结果，建议使用常见英文单词进行搜索。</div>"
          );
        } else {
          var j = c.icons;
          for (var d = 0; d < j.length; d++) {
            var h = j[d];
            var k = h.raster_sizes;
            k.sort(function (m, i) {
              return m.size - i.size;
            });
            for (var e = 0; e < k.length; e++) {
              var l = k[e];
              if (l.size == 128 || e == k.length - 1) {
                var a = l.formats[0].preview_url;
                var f = $(
                  "<div class='image_item' u='" +
                    a +
                    "' w='" +
                    l.size_width +
                    "' h='" +
                    l.size_height +
                    "'></div>"
                ).appendTo($("#google_image_items"));
                f.unbind().bind("click", function () {
                  $(".image_item_selected").removeClass("image_item_selected");
                  $(this).addClass("image_item_selected");
                });
                var g = $(
                  "<div class='image_box'><img src='" + a + "'/></div>"
                ).appendTo(f);
                var b = $(
                  "<div class='drop_size'><span>" +
                    l.size_width +
                    "x" +
                    l.size_height +
                    "</span></div>"
                ).appendTo(f);
                b.data("sizes", k);
                if (k.length > 1) {
                  b.append("<div class='ico ico_accordion'></div>");
                  b.bind("click", function () {
                    UI.dropImageSizes($(this));
                  });
                } else {
                  b.css({ "padding-left": "9px", cursor: "default" });
                }
                break;
              }
            }
          }
          $("#google_image_items").append("<div style='clear: both'></div>");
          $(".img_gg_loading_tip").remove();
          $(".gg_img_more").remove();
          if (UI.searchIndex + 24 < c.total_count) {
            $("#google_image_items").append(
              "<div onclick='UI.loadSearchImg()' class='gg_img_more toolbar_button active'>显示更多结果...</div>"
            );
          }
        }
      }
    );
    $(".gg_img_more").remove();
    $("#google_image_items").append(
      "<div class='img_gg_loading_tip'>正在加载图片...</div>"
    );
    this.searchIndex += 24;
  },
  dropImageSizes: function (e) {
    var d = e.data("sizes");
    d.sort(function (h, g) {
      return h.size - g.size;
    });
    var f = $("#img_size_menu");
    if (f.length == 0) {
      f = $(
        "<ul id='img_size_menu' class='menu list' style='z-index:1'></ul>"
      ).appendTo("#ui_container");
    }
    f.empty();
    for (var c = 0; c < d.length; c++) {
      var b = d[c];
      var a = b.formats[0].preview_url;
      f.append(
        "<li u='" +
          a +
          "' w='" +
          b.size_width +
          "' h='" +
          b.size_height +
          "'>" +
          b.size_width +
          "x" +
          b.size_height +
          "</li>"
      );
    }
    f.dropdown({
      target: e,
      onSelect: function (h) {
        var g = e.parent();
        g.attr("u", h.attr("u"));
        g.attr("w", h.attr("w"));
        g.attr("h", h.attr("h"));
        e.children("span").text(h.text());
        g.find("img").attr("src", h.attr("u"));
      },
    });
  },
  appendUserImage: function (b) {
    if (b.imageW == 0) {
      b.imageW = 200;
      b.imageH = 100;
    }
    var c = $(
      "<div class='image_item' id='" +
        b.imageId +
        "' fileId='" +
        b.fileId +
        "' w='" +
        b.imageW +
        "' h='" +
        b.imageH +
        "'></div>"
    ).appendTo($("#user_image_items"));
    c.unbind()
      .bind("click", function () {
        $(".image_item_selected").removeClass("image_item_selected");
        $(this).addClass("image_item_selected");
      })
      .bind("mouseenter", function () {
        var f = $(this);
        var e = $("<div class='ico ico_remove_red'></div>").appendTo(f);
        var g = f.attr("id");
        e.bind("click", function () {
          f.fadeOut();
          $.ajax({ url: "/user_image/remove", data: { imageId: g } });
        });
      })
      .bind("mouseleave", function () {
        $(this).find(".ico_remove_red").remove();
      });
    var a = "/file/id/" + b.fileId + "/diagram_user_image";
    if (b.fileId != null && b.fileId.indexOf("http") >= 0) {
      a = b.fileId;
      if (a.indexOf("orgu2a928.bkt.clouddn.com") >= 0) {
        a = a.replace("orgu2a928.bkt.clouddn.com", "cdn2.processon.com");
      } else {
        if (a.indexOf("7xt9nt.com1.z0.glb.clouddn.com") >= 0) {
          a = a.replace("7xt9nt.com1.z0.glb.clouddn.com", "cdn.processon.com");
        } else {
          if (a.indexOf("p7o7ul1nf.bkt.clouddn.com") >= 0) {
            a = a.replace("p7o7ul1nf.bkt.clouddn.com", "cdn1.processon.com");
          }
        }
      }
    }
    var d = $("<div class='image_box'><img src='" + a + "'/></div>").appendTo(
      c
    );
  },
  setShapeImage: function (b, a, c) {
    if (this.imageSelectedCallback) {
      this.imageSelectedCallback(b, a, c);
    }
    $("#image_dialog").dlg("close");
  },
  insertImage: function (b, a, d) {
    a = parseInt(a);
    d = parseInt(d);
    var e = $("#designer_layout");
    var g = e.width() / 2 + e.offset().left;
    var f = e.height() / 2 + e.offset().top;
    var i = Utils.getRelativePos(g, f, $("#designer_canvas"));
    var c = Model.create(
      "standardImage",
      i.x.restoreScale() - a / 2,
      i.y.restoreScale() - d / 2
    );
    c.props.w = a;
    c.props.h = d;
    c.fillStyle = {
      type: "image",
      fileId: b,
      display: "stretch",
      imageW: a,
      imageH: d,
    };
    Model.add(c);
    Designer.painter.renderShape(c);
    Utils.unselect();
    Utils.selectShape(c.id);
  },
  doExport: function (f) {
    this.exportFile.errorNum = 0;
    this.exportFile.errorUrls = [];
    this.exportFile.proUrlObj = {};
    this.exportFile._errorUrls = [];
    this.exportFile.eqImgObj = {};
    this.exportFile.eqDataUrl = {};
    var e = this;
    Designer.setZoomScale(1);
    var i = navigator.userAgent,
      b = i.indexOf("MSIE ") > -1 || i.indexOf("Trident/") > -1;
    var d = [];
    var c = $(".text_canvas .equation-text").length;
    if (c > 0 && f != "pos") {
      var h = $("<div style='z-index:-1'></div>").appendTo("body");
      var g = 0,
        a = 0;
      $(".text_canvas").each(function (l, p) {
        if (p.innerHTML.indexOf('class="equation-text" ') > 0) {
          var m = $(p).width(),
            j = $(p).height(),
            q = $(p).attr("id");
          var o = $(p).find("svg"),
            n = p.getBoundingClientRect();
          o.each(function () {
            var r = $(this);
            r.attr("width", r.width());
            r.attr("height", r.height());
          });
          var k = $(p).clone();
          k.css({ top: g + "px", left: 0 });
          h.append(k);
          e.exportFile.eqImgObj[q] = { w: m, h: j, x: 0, y: g };
          g = g + j;
          a = a < m || a == 0 ? m : a;
        }
      });
      h.css({ height: g, width: a, position: "relative" });
      html2canvas(h[0], {
        useCORS: true,
        backgroundColor: "transparent",
        scale: 3,
      }).then(function (j) {
        e.exportFile.eqDataUrl.src = j.toDataURL("image/png");
        e.exportFile.eqDataUrl.w = a;
        e.exportFile.eqDataUrl.h = g;
        h.remove();
        $.ajax({
          url: "/mindmap/uploadimage",
          type: "post",
          data: {
            id: chartId,
            img: e.exportFile.eqDataUrl.src,
            source: "equation",
          },
          success: function (k) {
            e.exportFile.eqDataUrl.src = k.img_url;
            if (b) {
              e.ieExportImg(f);
            } else {
              e.allExportImg(f);
            }
          },
          error: function () {},
        });
      });
    } else {
      if (b) {
        e.ieExportImg(f);
      } else {
        e.allExportImg(f);
      }
    }
  },
  ieExportImg: function (c) {
    $.simpleAlert("准备下载...", "info", "no");
    var a = $.extend(Model.define, { comments: Model.comments });
    var b = JSON.stringify(a);
    $("#export_definition").val(b);
    $("#export_title").val($(".diagram_title").text() || "未命名文件");
    $("#export_type").val(c);
    if (c == "svg" || c == "pdfHD" || c == "png") {
      var e = flow2svg.init(c);
      $("#export_width").val(e.w);
      $("#export_height").val(e.h);
      var d = $("#svg_exporter")
        .html()
        .replace(/&nbsp;/g, "\u00a0");
      d = d.replace(
        'xmlns="http://www.w3.org/2000/svg"',
        'xmlns:xlink="http://www.w3.org/1999/xlink"'
      );
      $("#export_definition").val(d);
      flow2svg.cleanSvgHtml();
    }
    $.simpleAlert("close");
    $("#export_dialog").dlg("close");
    $("#export_form").submit();
    $("#export_ok").disable();
    $("#global_top_dialog").remove();
    setTimeout(function () {
      $("#export_ok").enable();
    }, 2000);
  },
  allExportImg: function (c) {
    $.simpleAlert("准备下载...", "info", "no");
    var a = $.extend(Model.define, { comments: Model.comments });
    var b = JSON.stringify(a);
    $("#export_definition").val(b);
    $("#export_title").val($(".diagram_title").text() || "未命名文件");
    $("#export_type").val(c);
    if (
      c == "svg" ||
      c == "pdfHD" ||
      c == "png" ||
      c == "image" ||
      c == "jpg"
    ) {
      this.exportSVG(c);
    }
    $.simpleAlert("close");
    if (c == "png" || c == "image" || c == "jpg") {
      return;
    }
    $("#export_dialog").dlg("close");
    $("#export_form").submit();
    $("#export_ok").disable();
    $("#global_top_dialog").remove();
    setTimeout(function () {
      $("#export_ok").enable();
    }, 2000);
  },
  exportSVG: function (b) {
    var f = flow2svg.init(b);
    $("#export_width").val(f.w);
    $("#export_height").val(f.h);
    var d = $("#svg_exporter")
      .html()
      .replace(/&nbsp;/g, "\u00a0")
      .replace(/NS[0-9]+:href/g, "xlink:href");
    var c = 1;
    if (b == "png") {
      c = 2;
    } else {
      if (b == "jpg") {
        c = 1.5;
      } else {
        c = 1;
      }
    }
    $("#export_definition").val(d);
    if (b == "png" || b == "image" || b == "jpg") {
      UI.downImg == true;
      $("#svg_exporter").html(
        '<canvas id="canvas_exporter" width="' +
          f.w * c +
          '" height="' +
          f.h * c +
          '"></canvas>'
      );
      canvg("canvas_exporter", d.replace(/\u00a0/g, "<tspan>\u00a0</tspan>"), {
        log: true,
        ignoreDimensions: true,
        enableRedraw: true,
        ignoreClear: true,
        forceRedraw: true,
        useCORS: true,
        forceRedraw: true,
        scaleWidth: f.w * c,
        scaleHeight: f.h * c,
        renderCallback: function () {
          if (UI.exportFile.errorNum > 0) {
            UI.exportFile.replaceErrorUrl();
            console.log("跨域图片处理");
            return;
          }
          var g = document.getElementById("canvas_exporter");
          var h = g.toDataURL();
          var j = $(".diagram_title").text() || "未命名文件";
          var i = b == "jpg" ? "jpg" : "png";
          e(URL.createObjectURL(a(h)), j + "." + i);
          flow2svg.cleanSvgHtml();
          UI.downImg == false;
        },
      });
      function a(k) {
        var j = atob(k.split(",")[1]),
          h = j.length,
          g = new Uint8Array(h);
        for (var l = 0; l < h; l++) {
          g[l] = j.charCodeAt(l);
        }
        return new Blob([g], { type: "image/png" });
      }
      function e(i, j) {
        var h = new MouseEvent("click", {
          view: window,
          bubbles: false,
          cancelable: true,
        });
        var g = document.createElement("a");
        g.setAttribute("download", j);
        g.setAttribute("href", i);
        g.setAttribute("target", "_blank");
        g.dispatchEvent(h);
      }
    } else {
      flow2svg.cleanSvgHtml();
    }
  },
  exportFile: {
    errorNum: 0,
    errorUrls: [],
    proUrlObj: {},
    _errorUrls: [],
    exportError: function (a) {
      if (this.errorUrls.indexOf(a) < 0) {
        this.errorUrls.push(a);
        this.errorNum++;
      }
    },
    replaceErrorUrl: function () {
      var b = this;
      var a = b.errorUrls.map(function (c) {
        return encodeURIComponent(c);
      });
      $.ajax({
        url: "/chart_cors/process_cors_image",
        data: { urls: a.join(",") },
        type: "post",
        success: function (g) {
          var h = g.proUrls,
            c = h.length;
          for (var f = 0; f < c; f++) {
            b.proUrlObj[b.errorUrls[f]] = h[f];
            if (!h[f]) {
              b._errorUrls.push(b.errorUrls[f]);
            }
          }
          for (key in Model.define.elements) {
            var d = Model.define.elements[key].fillStyle;
            if (d && d.fileId) {
              for (proUrlsKey in b.proUrlObj) {
                var e = d.fileId.replace(/^(http|https):\/\//, "");
                if (proUrlsKey.indexOf(e) != -1) {
                  d.fileId = b.proUrlObj[proUrlsKey];
                }
              }
            }
          }
          CLB.saveVersion();
          $("#svg-wrap").remove();
          if (b._errorUrls.length) {
            b.exportErrorTip(b._errorUrls[0]);
          } else {
            UI.doExport();
          }
        },
      });
    },
    exportErrorTip: function (b) {
      var a = $("html");
      if ($("#export_dialog").length > 0) {
        a = $("#export_dialog");
      } else {
        if ($(".mind-download-dlg").length > 0) {
          a = $(".mind-download-dlg");
        }
      }
      Util.globalTopTip(
        '下载失败，文件中存在不授信或者失效的图片,<br>请检查后重试，<a target="_blank" href="' +
          b +
          '">点击查看</a>',
        "top_error",
        8000,
        a,
        true
      );
      console.log(b);
    },
    eqImgObj: {},
    eqDataUrl: {},
  },
  showHotKey: function () {
    var a = $(window).height() - 175;
    if (a > 500) {
      a = 500 + "px";
    }
    $("#hotkey_list").dlg();
    $("#hotkey_list").css({ top: "28px" });
    $("#hotkey_list .dialog_content").css({ height: a });
  },
  loadEquation: function () {
    var c = {
      "上标、下标及积分等": [
        "a^2",
        "a_2",
        "a^{2+2}",
        "a_{i,j}",
        "{}_1^2\\!X_3^4",
        "\\overset{\\frown} {AB}",
        "\\overline{hij}",
        "\\underline{klm}",
        "\\overbrace{1+2+\\cdots+100}",
        "\\begin{matrix} 5050 \\\\ \\overbrace{ 1+2+\\cdots+100 }\\end{matrix}",
        "\\underbrace{a+b+\\cdots+z}",
        "\\sum_{k=1}^N k^2",
        "\\begin{matrix} \\sum_{k=1}^N k^2 \\end{matrix}",
        "\\prod_{i=1}^N x_i",
        "\\begin{matrix} \\prod_{i=1}^N x_i \\end{matrix}",
        "\\coprod_{i=1}^N x_i",
        "\\begin{matrix} \\coprod_{i=1}^N x_i \\end{matrix}",
        "\\lim_{n \\to \\infty}x_n",
        "\\begin{matrix} \\ lim_{n \\to \\infty}x_n \\end{matrix}",
        "\\int_{-N}^{N} e^x\\, \\mathrm{d}x",
        "\\begin{matrix} \\int_{_N}^{N} e^x\\, \\mathrm{d}x \\end{matrix}",
        "\\iint_{D}^{W} \\, \\mathrm{d}x\\,\\mathrm{d}y",
        "\\iiint_{E}^{V} \\,\\mathrm{d}x\\,\\mathrm{d}y,\\mathrm{d}z",
        "\\oint_{C} x^3\\, \\mathrm{d}x + 4y^2\\, \\mathrm{d}y",
        "\\bigcap_1^{n} p",
        "\\bigcup_1^{k} p",
      ],
      括号和分隔符: [
        "\\left(\\frac{a}{b} \\right)",
        "\\left[\\frac{a}{b} \\right]",
        "\\left\\{\\frac{a}{b} \\right\\}",
        "\\left \\langle \\frac{a}{b} \\right \\rangle",
        "\\left|\\frac{a}{b} \\right|",
        "\\left \\lceil \\frac{c}{d} \\right \\rceil",
        "\\left / \\frac{a}{b} \\right \\backslash",
        "\\left \\Uparrow \\frac{a}{b} \\right \\Downarrow",
        "\\left \\updownarrow \\frac{a}{b} \\right \\Updownarrow",
        "\\left [ 0,1 \\right ) \\left \\langle \\psi \\right |",
        "\\left \\{ \\frac{a}{b} \\right.",
        "\\left . \\frac{a}{b} \\right \\}",
        "\\langle",
        "\\rangle",
        "\\lceil",
        "\\rceil",
        "\\lfloor",
        "\\rfloor",
        "\\lbrace",
        "\\rbrace",
        "\\lvert",
        "\\rvert",
      ],
      根号: ["\\sqrt{3}", "\\sqrt[n]{3}"],
      函数: [
        "\\sin\\theta",
        "\\cos\\theta",
        "\\tan\\theta",
        "\\arcsin\\frac{L}{r}",
        "\\arccos\\frac{T}{r}",
        "\\arctan\\frac{L}{T}",
        "\\sinh g",
        "\\cosh h",
        "\\tanh i",
        "\\coth j",
        "\\operatorname{sh}j",
        "\\operatorname{ch}h",
        "\\operatorname{th}i",
        "\\operatorname{argsh}k",
        "\\operatorname{argch}l",
        "\\operatorname{argth}m",
        "\\limsup S",
        "\\liminf I",
        "\\max H",
        "\\min L",
        "\\inf s",
        "\\sup t",
        "\\exp\\!t",
        "\\ln X",
        "\\lg X",
        "\\log X",
        "\\log_\\alpha X",
        "\\ker x",
        "\\deg x",
        "\\gcd(T,U,V,W,X)",
        "\\Pr x",
        "\\det x",
        "\\hom x",
        "\\arg x",
        "\\dim x",
        "\\lim_{t\\to n}T",
      ],
      微分及导数: [
        "\\nabla\\psi",
        "\\partial x",
        "\\mathrm{d}x",
        "\\dot x",
        "\\ddot y",
        "X^\\prime",
        "\\backprime",
        "f^{(3)}",
      ],
      关系运算符: [
        "\\pm",
        "\\times",
        "\\div",
        "\\mid",
        "\\nmid",
        "\\cdot",
        "\\circ",
        "\\ast",
        "\\bigodot",
        "\\bigotimes",
        "\\bigoplus",
        "\\leq",
        "\\geq",
        "\\leqq",
        "\\geqq",
        "=",
        "\\neq",
        "\\approx",
        "\\equiv",
        "\\not\\equiv",
        "\\sum",
        "\\prod",
        "\\coprod",
        "\\backslash",
        "\\sim",
        "\\backsim",
        "\\simeq",
        "\\cong",
        "\\dot=",
        "\\ggg",
        "\\gg",
        ">",
        "<",
        "\\ll",
        "\\lll",
        "\\propto",
      ],
      集合与逻辑符号: [
        "\\emptyset",
        "\\varnothing",
        "\\in",
        "\\not\\in",
        "\\subset",
        "\\supset",
        "\\subseteq",
        "\\supseteq",
        "\\sqsubseteq",
        "\\sqsupseteq",
        "\\cap",
        "\\cup",
        "\\bigcup",
        "\\bigcap",
        "\\sqcap",
        "\\sqcup",
        "\\uplus",
        "\\biguplus",
        "\\bigsqcup",
        "\\top",
        "\\bot",
        "\\complement",
        "\\vee",
        "\\wedge",
        "\\bigvee",
        "\\bigwedge",
        "\\forall",
        "\\exists",
        "\\not\\subset",
        "\\not=",
        "\\not<",
        "\\not>",
        "\\because",
        "\\therefore",
        "\\neg",
        "\\bar{q} \\to p",
        "\\setminus",
        "\\smallsetminus",
      ],
      几何符号: [
        "\\Diamond",
        "\\Box",
        "\\triangle",
        "\\perp",
        "\\angle\\Alpha\\Beta\\Gamma",
        "60^\\circ",
      ],
      戴帽符号: [
        "\\vec{c}",
        "\\overleftarrow{ab}",
        "\\overrightarrow{cd}",
        "\\overleftrightarrow{ab}",
        "\\widehat{efg}",
        "\\overset{\\frown} {AB}",
        "\\hat{xyz}",
        "\\tilde{xy}",
        "\\bar{y}",
        "\\widetilde{xyz}",
        "\\acute{y}",
        "\\breve{y}",
        "\\check{y}",
        "\\grave{y}",
      ],
      箭头符号: [
        "\\to",
        "\\mapsto",
        "\\underrightarrow{1^\\circ/min}",
        "\\implies",
        "\\impliedby",
        "\\iff",
        "\\uparrow",
        "\\downarrow",
        "\\Uparrow",
        "\\Downarrow",
        "\\leftarrow",
        "\\rightarrow",
        "\\leftrightarrow",
        "\\Leftarrow",
        "\\Rightarrow",
        "\\Leftrightarrow",
        "\\longleftarrow",
        "\\longrightarrow",
        "\\longleftrightarrow",
        "\\Longleftarrow",
        "\\Longrightarrow",
        "\\Longleftrightarrow",
      ],
      特殊符号: [
        "\\eth",
        "\\%",
        "\\dagger",
        "\\ddagger",
        "\\star",
        "*",
        "\\ldots",
        "\\smile",
        "\\frown",
        "\\wr",
      ],
      "分数、矩阵和多行列式": [
        "\\frac{2}{4}=0.5",
        "{2 \\over 3}",
        "{{a+b} \\over {a-b}}",
        "\\tfrac{2}{4} = 0.5",
        "\\cfrac{2}{c + \\cfrac{2}{d + \\cfrac{2}{4}}} = a",
        "\\begin{matrix}\nx & y \\\\\nz & v\n\\end{matrix}",
        "\\begin{vmatrix}\nx & y \\\\\nz & v\n\\end{vmatrix}",
        "\\begin{Vmatrix}\nx & y \\\\\nz & v\n\\end{Vmatrix}",
        "\\begin{bmatrix}\n0& \\cdots & 0\\\\\n\\vdots & \\ddots & \\vdots \\\\\n0& \\cdots & 0\n\\end{bmatrix}",
        "\\begin{Bmatrix}\nx & y \\\\\nz & v\n\\end{Bmatrix}",
        "\\begin{pmatrix}\nx & y \\\\\nz & v\n\\end{pmatrix}",
        "\\begin{cases}\n3x + 5y +  z \\\\\n7x - 2y + 4z \\\\\n-6x + 3y + 2z\n\\end{cases}",
        "\\begin{array}{|c|c||c|} a & b & S \\\\\n\\hline\n0&0&1\\\\\n0&1&1\\\\\n1&0&1\\\\\n1&1&0\\\\\n\\end{array}",
      ],
      希腊字母: [
        "\\alpha",
        "\\beta",
        "\\gamma",
        "\\delta",
        "\\epsilon",
        "\\zeta",
        "\\eta",
        "\\theta",
        "\\iota",
        "\\kappa",
        "\\lambda",
        "\\mu",
        "\\nu",
        "\\xi",
        "o",
        "\\pi",
        "\\rho",
        "\\sigma",
        "\\tau",
        "\\upsilon",
        "\\phi",
        "\\chi",
        "\\psi",
        "\\omega",
      ],
    };
    for (var b in c) {
      $(".eq-select ul").append("<li>" + b + "</li>");
      var d =
        "<h3>" +
        b +
        '</h3><div class="table"><div class="title"><span>效果</span><span>语法</span></div>';
      for (var a = 0; a < c[b].length; a++) {
        d +=
          "<div><span>" +
          katex.renderToString(c[b][a]) +
          '</span><span class="copy">' +
          c[b][a] +
          "</span></div>";
      }
      d += "</div>";
      $("#eq-container>div").append(d);
    }
    $(".equation-list").show();
    $(".eq-select")
      .off()
      .on("click", function (f) {
        f.stopPropagation();
        $(this).toggleClass("on");
      });
    $(".eq-select li")
      .off()
      .on("click", function () {
        var f = $(this);
        $(".eq-input").val(f.text());
        var e =
          document.getElementById("eq-container").getElementsByTagName("h3")[
            f.index()
          ].offsetTop - 108;
        $("#eq-container").scrollTop(e);
      });
    $(".table>div:not(.title)")
      .off()
      .on("click", function (l) {
        l.stopPropagation();
        $(".table .tip").remove();
        var k = $(this);
        var j = document.createElement("input");
        j.setAttribute("value", k.find(".copy").text());
        document.body.appendChild(j);
        j.select();
        try {
          if (document.execCommand("copy", false, null)) {
            k.append('<div class="tip">已复制到剪贴板</div>');
            var h = $(".notranslate");
            if ($(".eq-editor").is(":visible")) {
              var g = h.html() + k.find(".copy").text();
              h.html(g).trigger("input").focus();
              var f = document.createRange();
              f.selectNodeContents(h.get(0));
              f.collapse(false);
              var i = window.getSelection();
              i.removeAllRanges();
              i.addRange(f);
            }
            setTimeout(function () {
              k.find(".tip").remove();
            }, 1000);
          }
        } catch (l) {}
        document.body.removeChild(j);
      })
      .on("mousedown", function (f) {
        f.stopPropagation();
      });
    $("body")
      .off()
      .on("click", function () {
        $(".eq-select").removeClass("on");
      });
    $(".equation-list .dlg_close")
      .off()
      .on("click", function () {
        $(".equation-list").hide();
      });
  },
  showFeedBack: function () {
    $("#send_feedback").css({ width: "auto", height: "auto" });
    var a = $("#send_feedback");
    a.dlg();
    $("#feedback_email").focus();
    $("#feedback_message").val("");
    $(".feedback_error_email_format").hide();
    $(".feedback_error_msg").hide();
  },
  sendFeedBack: function (c) {
    $(".feedback_error_email_format").hide();
    $(".feedback_error_msg").hide();
    var a = $.trim($("#feedback_email").val());
    if (!a.isEmail()) {
      $("#feedback_email").focus();
      $(".feedback_error_email_format").show();
      return;
    }
    var b = $.trim($("#feedback_message").val());
    if (b == "") {
      $("#feedback_message").val("").focus();
      $(".feedback_error_msg").show();
      return;
    }
    Util.ajax({
      url: "/support/save_ask",
      data: {
        content: b,
        username: $("#feedback_name").val(),
        email: a,
        url: location.href,
      },
      success: function (d) {
        $(".dlg_mask").remove();
        $("#send_feedback").animate({
          left: $(window).width(),
          top: $(window).height(),
          width: 0,
          height: 0,
          opacty: 0.2,
        });
      },
    });
  },
  gettingStart: function (a) {
    this.showStartStep(1);
  },
  showStartStep: function (b, e) {
    $(".mark_content").hide();
    var a = $(".mark" + b + "_content");
    a.show();
    var d;
    var c;
    if (b == 1) {
      d = $("#shape_panel").offset().top + 70;
      c = $("#shape_panel").offset().left + $("#shape_panel").width() + 10;
    } else {
      if (b == 2) {
        d = $(".row2").offset().top + 30;
        c =
          $("#menu_bar_insert").offset().left +
          $("#menu_bar_insert").width() -
          a.outerWidth() / 2;
      } else {
        if (b == 3) {
          d = $(".toolbar").offset().top + 40;
          c = 270;
        } else {
          if (b == 4) {
            d = $("#dock").offset().top + 10;
            c = $("#dock").offset().left - a.outerWidth() - 10;
          } else {
            if (b == "created") {
              d = e.offset().top + e.height() / 2 - a.outerHeight() / 2;
              if (d <= 0) {
                d = 0;
              }
              if (d + a.outerHeight() > $(window).height()) {
                d = $(window).height() - a.outerHeight();
              }
              c = e.offset().left + e.width() + 10;
            }
          }
        }
      }
    }
    a.css({ top: d, left: c });
  },
  closeGettingStart: function (a) {
    $(".mark_content").hide();
  },
  showAddColla: function () {
    if (typeof collaboration == "undefined") {
      var a = {
        css: ["/assets/css/collaboration.css"],
        js: ["/assets/js/collaboration.js"],
      };
      bigPipe.render(a, function () {
        collaboration.init(chartId, "chart");
        $("#colla_add").dialog();
        $("#colla_add .colla-suggest-box").empty();
        $("#add_step2").hide();
        $("#add_step1").show();
      });
    } else {
      collaboration.init(chartId, "chart");
      $("#colla_add").dialog();
      $("#colla_add .colla-suggest-box").empty();
      $("#add_step2").hide();
      $("#add_step1").show();
    }
  },
  showMoreContacter: function (b, d) {
    var c = {};
    var a = +$(d).attr("all");
    if (b == "contacters") {
      var e = $(d).parent().find("li[joinType='user']").length;
      c.source = b;
      c.split = e;
    } else {
      if (b == "team") {
        var e = $(d).parent().find("li[joinType='user']").length;
        c.source = b;
        c.teamId = $(d).parent().attr("target");
        c.split = e;
      }
    }
    Util.ajax({
      url: "/collaboration/get_add_more",
      data: c,
      success: function (j) {
        var l = j.users;
        var h = "";
        var g = "",
          i,
          k,
          f;
        $.each(l, function (n) {
          var m = l[n];
          h = "/images/default/default/profile-full-male.png";
          i = m.userId;
          if (m.photoFileName != null && m.photoFileName != "") {
            h = "/file/" + m.photoFileName + "/photo";
          }
          k = m.fullName;
          f = m.email;
          g +=
            '<li joinType="user" target="' +
            i +
            '" username="' +
            k +
            '" email="' +
            f +
            '"><img src="' +
            h +
            '"/>' +
            k +
            "</li>";
        });
        $(d).before(g);
        if ($(d).parent().find("li[joinType='user']").length == a) {
          $(d).hide();
        } else {
          $(d).show();
        }
        $(d).parent().scrollTop(9999);
      },
    });
  },
  getCollaTeamMembers: function () {
    Util.ajax({
      url: "/collaboration/get_contacter_team_members",
      data: { source: "designer" },
      success: function (a) {
        $("#colla_suggest_box")
          .find(".suggest_colla_box")
          .removeClass("colla_loading")
          .html(a);
        $(".colla_suggest")
          .find("li")
          .on("click", function () {
            if ($(this).attr("joinType") == "team") {
              var b = $(this).attr("target");
              if (!$(this).hasClass("active")) {
                $(this).addClass("active");
                $(".team_member[target='" + b + "']").show();
                Util.ajax({
                  url: "/collaboration/show_team_member",
                  data: { teamId: b },
                  success: function (i) {
                    var o = +i.teamMemberCount;
                    var n = +i.firstSize;
                    var g = i.users;
                    var j = "";
                    var k,
                      l = "",
                      m,
                      h;
                    $.each(g, function (q) {
                      l = "/images/default/default/profile-full-male.png";
                      var p = g[q];
                      k = p.userId;
                      if (p.photoFileName != null && p.photoFileName != "") {
                        l = "/file/" + p.photoFileName + "/photo";
                      }
                      m = p.fullName;
                      h = p.email;
                      j +=
                        '<li joinType="user" target="' +
                        k +
                        '" username="' +
                        m +
                        '" email="' +
                        h +
                        '"><img src="' +
                        l +
                        '"/>' +
                        m +
                        "</li>";
                    });
                    if (n < o) {
                      j +=
                        '<div class="slider" all="' +
                        o +
                        '" onclick="UI.showMoreContacter(\'team\', this)"><span></span></div>';
                    }
                    $(".team_member[target='" + b + "']").css({
                      background: "none",
                    });
                    $(".team_member[target='" + b + "']").append(j);
                    $(".colla_suggest.team_member")
                      .find("li")
                      .on("click", function () {
                        $("#add_prompt4").hide();
                        $("#add_prompt3").hide();
                        $("#add_prompt2").show();
                        $("#add_prompt1").hide();
                        var r = $.trim($("#input_add_colla").val());
                        $(".colla_suggest").find("li").removeClass("seled");
                        $(this).addClass("seled");
                        var p = $(this).attr("joinType");
                        var s = $(this).attr("target");
                        if (p == "user") {
                          var q = $(this).attr("username");
                          $("#input_add_colla").val(q);
                          $("#add_userid").val(s);
                        } else {
                          $("#input_add_colla").val(s);
                          $("#add_userid").val(s);
                        }
                        $("#add_type").val(p);
                      });
                  },
                });
              } else {
                $(this).removeClass("active");
                $(".team_member[target='" + b + "']").hide();
                $(".team_member[target='" + b + "']").html("");
                $(".team_member[target='" + b + "']").css({
                  background:
                    "url(/images/default/view_loading.gif) center center no-repeat",
                });
              }
            }
            if (
              $(this).attr("joinType") == "user" ||
              $(this).attr("joinType") == "email"
            ) {
              $("#add_prompt4").hide();
              $("#add_prompt3").hide();
              $("#add_prompt2").show();
              $("#add_prompt1").hide();
              var e = $.trim($("#input_add_colla").val());
              $(".colla_suggest").find("li").removeClass("seled");
              $(this).addClass("seled");
              var c = $(this).attr("joinType");
              var f = $(this).attr("target");
              if (c == "user") {
                var d = $(this).attr("username");
                $("#input_add_colla").val(d);
                $("#add_userid").val(f);
              } else {
                $("#input_add_colla").val(f);
                $("#add_userid").val(f);
              }
              $("#add_type").val(c);
            }
          });
      },
    });
  },
  doAddCollaboration: function () {
    if ($(".colla_suggest").length > 0) {
      if ($(".colla_suggest").find(".seled").length == 0) {
        $("#add_prompt1").hide();
        $("#add_prompt2").show();
        $("#add_prompt3").hide();
        $("#add_prompt4").hide();
        var h = ($(window).outerHeight() - 104) * 0.5 + 100;
        var a = ($(window).outerWidth() - 272) * 0.5;
        $("#confirm_dlg")
          .removeClass("newSize")
          .css({ top: h + "px", left: a + "px" });
        $("#confirm_dlg")
          .addClass("newSize")
          .css({
            top:
              ($(window).outerHeight() - $("#confirm_dlg").height()) * 0.5 +
              "px",
            left:
              ($(window).outerWidth() - $("#confirm_dlg").width()) * 0.5 + "px",
            display: "block",
          });
      } else {
        var i = $(".colla_suggest").find(".seled").find("img").attr("src");
        var d = $("#input_add_colla").val();
        if (d.length > 30) {
          d = d.substr(0, 30) + "...";
        }
        var f = $("#add_userid").val();
        var c = $("#invit_role").val();
        var g = $("#add_type").val();
        $(".add_new_button").find(".designer_button").text("发送中...");
        var e = null;
        if (g == "email") {
          $(".role_list")
            .find(".role_item")
            .each(function () {
              if ($(this).attr("type") == g && $(this).attr("target") == f) {
                e = $(this);
                $(this).find(".inviting_").text("再次邀请");
              }
            });
        }
        var b = { targetTypes: g, targets: f, role: c, chartId: chartId };
        Util.ajax({
          url: "/collaboration/add",
          data: b,
          success: function (k) {
            var j = k.result;
            if (j == "exists") {
              $("#add_prompt2").hide();
              $("#add_prompt1").hide();
              $("#add_prompt4").hide();
              $("#add_prompt3").show();
            } else {
              if (j == "error_text") {
                $("#add_prompt2").hide();
                $("#add_prompt1").hide();
                $("#add_prompt4").hide();
                $("#add_prompt3").show();
              } else {
                Util.ajax({
                  url: "/collaboration/get_colla_role_list",
                  data: { chartId: chartId },
                  success: function (l) {
                    $(".role_list").html(l).scrollTop(999);
                  },
                });
              }
            }
            $(".add_new_button").find(".designer_button").text("发送邀请");
            $("#colla_dialog")
              .addClass("_update")
              .css({
                top:
                  ($(window).height() - $("#colla_dialog").outerHeight()) *
                    0.5 +
                  "px",
              });
            if (j != "exists") {
              setTimeout(function () {
                $("#add_prompt3").hide();
                $("#add_prompt2").hide();
                $("#add_prompt1").hide();
                $("#add_prompt4").show();
              }, 400);
            }
            setTimeout(function () {
              $("#add_prompt3").hide();
              $("#add_prompt2").hide();
              $("#add_prompt4").hide();
              $("#add_prompt1").show();
              $("#input_add_colla").val("");
              if (!$("#colla_suggest_box").hasClass("colla")) {
                var l =
                  '<span class="left"><strong>常用联系人</strong>：</span><span class="right"><strong>我的小组成员</strong>：</span>';
                $(".suggest_bot_tip").html(l);
                $("#colla_suggest_box")
                  .addClass("colla")
                  .html('<div class="suggest_colla_box colla_loading"></div>');
                UI.getCollaTeamMembers();
              }
            }, 1000);
          },
        });
      }
    }
  },
  deleteCollaRole: function (c) {
    var a = $(c).parent(".role_item");
    var b = a.attr("collaborationId");
    Util.ajax({
      url: "/collaboration/delete",
      data: { collaborationId: b },
      success: function (d) {
        if (d.result == "success") {
          a.remove();
        }
      },
    });
    $("#colla_dialog")
      .addClass("_update")
      .css({
        top:
          ($(window).height() - $("#colla_dialog").outerHeight()) * 0.5 + "px",
      });
  },
  changeCollaRole: function (b, a) {
    Util.ajax({
      url: "/collaboration/set_role",
      data: { collaborationId: b, role: $(a).val() },
      success: function (c) {
        if (c.result == "success") {
          $(a)
            .parent(".given_role")
            .find(".change_success")
            .stop()
            .animate({ left: "-38px" }, 200)
            .delay(400)
            .animate({ left: "0px" }, 200);
        }
      },
    });
  },
  showShapesManage: function () {
    $("#shapes_dialog").dlg();
    $("#shape_manage_list")
      .children("li")
      .unbind()
      .bind("click", function () {
        var b = $(this).find("input");
        var c = !b.is(":checked");
        b.attr("checked", c);
        a(b);
      });
    $("#shape_manage_list")
      .find("input")
      .unbind()
      .bind("click", function (b) {
        b.stopPropagation();
        a($(this));
      })
      .each(function () {
        var c = $(this).val();
        var b = c.split(",");
        var f = true;
        for (var d = 0; d < b.length; d++) {
          var e = b[d];

          if (!Schema.selectedCategories.includes(e)) {
            f = false;
            break;
          }
        }
        $(this).attr("checked", f);
      });
    function a(c) {
      var d = c.val();
      var b = d.split(",");
      var e = c.is(":checked");
      if (b.length > 1) {
        $("#shape_manage_list")
          .find("input")
          .each(function () {
            var f = $(this).val();
            if (b.indexOf(f) >= 0) {
              $(this).attr("checked", e);
            }
          });
      } else {
        $("#shape_manage_list")
          .find(".cate_parent")
          .each(function () {
            var g = $(this).val().split(",");
            var f = true;
            for (var h = 0; h < g.length; h++) {
              var j = g[h];
              if (
                !$("#shape_manage_list")
                  .find("input[value=" + j + "]")
                  .is(":checked")
              ) {
                f = false;
                break;
              }
            }
            $(this).attr("checked", f);
          });
      }
    }
  },
  operating: false,
  saveShapesManage: function () {
    if (UI.operating) {
      return;
    }
    UI.operating = true;
    var d = $("#shape_manage_list")
      .find("input:checked:not(.cate_parent)")
      .map(function () {
        return $(this).val();
      })
      .get();
    if (d.includes("network_aliyun")) {
      d = d.concat([
        "ali_app_service",
        "ali_database",
        "ali_devel_resource",
        "ali_domain_website",
        "ali_elastic_calc",
        "ali_industry_cloud",
        "ali_internet_midd",
        "ali_large_scale_calc",
        "ali_manage_monitor",
        "ali_mobile_service",
        "ali_network",
        "ali_other_products",
        "ali_security",
        "ali_storage_cdn",
      ]);
    }
    if (d.includes("network_aws2019")) {
      d = d.concat([
        "aws2019_groups",
        "aws2019_general",
        "aws2019_compute",
        "aws2019_instance",
        "aws2019_storage",
        "aws2019_database",
        "aws2019_ncd",
        "aws2019_mt",
        "aws2019_dt",
        "aws2019_mg",
        "aws2019_sic",
        "aws2019_analytics",
        "aws2019_ml",
        "aws2019_robotics",
        "aws2019_mobile",
        "aws2019_ai",
        "aws2019_ms",
        "aws2019_ba",
        "aws2019_euc",
        "aws2019_iot",
        "aws2019_gt",
        "aws2019_av",
        "aws2019_acm",
        "aws2019_blockchain",
        "aws2019_ce",
        "aws2019_satellite",
      ]);
    }
    if (d.includes("network_aws")) {
      d = d.concat([
        "aws_analytics",
        "aws_app_servers",
        "aws_compute",
        "aws_database",
        "aws_devel_tools",
        "aws_enterprise_apps",
        "aws_general",
        "aws_iot",
        "aws_mgmt_tools",
        "aws_mobile_servers",
        "aws_networking",
        "aws_sdk",
        "aws_security_identity",
        "aws_storage",
        "aws_workforce",
        "aws_groups",
      ]);
    }
    if (d.includes("network_cisco")) {
      d = d.concat([
        "cisco_bulidings",
        "cisco_computers_peripherals",
        "cisco_control_module",
        "cisco_directors",
        "cisco_hubs_gateways",
        "cisco_misc",
        "cisco_modems_phones",
        "cisco_people",
        "cisco_routers",
        "cisco_security",
        "cisco_servers",
        "cisco_storage",
        "cisco_switches",
        "cisco_wireless",
        "standard",
      ]);
    }
    if (d.includes("network_azure")) {
      d = d.concat(["azure"]);
    }

    var b = "";
    var c = { action: "changeSchema", categories: d.join(",") };

    CLB.send(c);
    Designer.setSchema(d, function () {
      $("#shapes_dialog").dlg("close");
      UI.operating = false;
    });
  },
  showUserMenu: function (a) {
    a.stopPropagation();
    $("#user_menu").dropdown({
      target: $(".user"),
      position: "right",
      onSelect: function (b) {
        var c = b.attr("ac");
        if (c == "dia") {
          location.href = "/diagrams";
        } else {
          if (c == "net") {
            location.href = "/network";
          } else {
            if (c == "out") {
              $.post("/api/auth/signout", (res) => {
                location.href = "/";
              });
            }
          }
        }
      },
    });
  },
  showDownload: function () {
    if ($("#export_dialog").attr("key")) {
      $("#export_pdfHD").click();
      $("#export_ok").click();
      return;
    }
    $("#export_dialog").dlg();
    $("#export_png").click();
  },
  showShareMenu: function (f) {
    var a = $("#share_win");
    a.dialog();
    var d = a.find(".dialog-win-left"),
      b = a.find(".dialog-win-right"),
      c = a.outerWidth();
    d.find("li")
      .off("click")
      .on("click", function () {
        var e = $(this).attr("tit");
        $(this).addClass("active").siblings().removeClass("active");
        b.empty();
        b.html(ProShare[e].source);
        ProShare[e].execute(chartId);
      });
    d.find("li:eq(0)").trigger("click");
  },
  showEmbed: function () {
    if (chartId != "") {
      $("#embed_designer_chart").dlg();
      $("#iframe_html").val("");
      $(".embed_preview").html("");
      var a, b;
      a = $("#embed_width").val();
      b = $("#embed_height").val();
      UI.changeEmbedWH(a, b);
      $("#iframe_html").select();
      $(".embed_size")
        .find("input")
        .keyup(function () {
          var c =
            $.trim($("#embed_width").val()) == ""
              ? 340
              : $.trim($("#embed_width").val());
          var d =
            $.trim($("#embed_height").val()) == ""
              ? 160
              : $.trim($("#embed_height").val());
          c = parseInt(c);
          d = parseInt(d);
          $(".embed_preview")
            .find("div:first")
            .css({ width: c + "px", height: d + "px" });
          $(".embed_preview")
            .find("iframe")
            .css({ width: c + "px", height: d + "px" });
          UI.changeEmbedWH(c, d);
        });
      $("#iframe_html")
        .unbind()
        .bind("click", function () {
          $(this).select();
        });
      $(".embed_preview").keydown(function () {
        $(".embed_size").find("input").blur();
      });
    }
  },
  changeEmbedWH: function (a, d) {
    var b =
      '<iframe id="embed_dom" name="embed_dom" frameborder="0" style="border:1px solid #000;display:block;width:' +
      a +
      "px; height:" +
      d +
      'px;" src="https://www.processon.com/embed/' +
      chartId +
      '"></iframe>';
    $("#iframe_html").val(b);
    $(".embed_preview_wrap").css({
      "margin-top": -d / 2 + "px",
      "margin-left": -a / 2 + "px",
    });
    $(".embed_preview").html("").html(b);
    var c = document.getElementById("embed_dom");
    c.onload = c.onreadystatechange = function () {
      if (!c.readyState || c.readyState == "complete") {
        setTimeout(function () {
          $(".embed_preview .preview_dis").remove();
          setTimeout(function () {
            $(".embed_obj").fadeIn();
          }, 100);
        }, 400);
      }
    };
  },
  showViewLink: function () {
    if (chartId == "") {
      return;
    }
    var b = null;
    var a = "";
    Util.get("/view/getlink", { chartId: chartId }, function (e) {
      b = e.chart;
      a = e.viewLinkId;
      $("#share_link_win").dlg();
      if (a == "" || a == null) {
        UI.showCreateViewLink();
      } else {
        var d = "off";
        var c = null;
        if (b.viewPassword != null || b.viewPassword != "") {
          d = "on";
          c = b.viewPassword;
        }
        UI.showShareViewLink(d, c);
        $("#_view_link_input").val(a).select();
      }
    });
  },
  showCreateViewLink: function () {
    $("#share_link_win")
      .find(".txt")
      .css({ width: "390px" })
      .removeAttr("readonly", "readonly");
    if ($("#_locale").val() === "zh") {
      $("#share_link_win").find(".txt").css({ width: "410px" });
    }
    $("#_view_link_input").val("");
    var a =
      "<p>希望分享给别人，又不想完全公开？您可以在此创建一个浏览链接，分享给别人后，可以通过此链接来安全地浏览您的文件。 </p><p>当然，您也可以给浏览链接添加密码，以便您享有更多的控制权限。 </p>";
    $(".create_dis").html(a);
    setTimeout(function () {
      $(".create.designer_button").show();
    }, 200);
  },
  showShareViewLink: function (d, b) {
    var e = "-1px";
    var c = "#fff;color:#323232;text-shadow:0px 1px 0px rgba(255,255,255,0.3)";
    if (d == "on" && b != "" && b != null) {
      e = "33px";
      c = "#5da206;color:#fff;text-shadow:0px 1px 0px rgba(0,0,0,0.3)";
    }
    $(".create.designer_button").hide();
    $("#share_link_win")
      .find(".txt")
      .css({ width: "98%" })
      .attr("readonly", "readonly");
    var a =
      '<p>密码保护</p><p><a href="javascript:;" onclick="UI.deleteViewLink()">删除链接</a>&nbsp;撤销访问权</p><div class="edit_pw_protect" style="background:' +
      c +
      ';" onclick="UI.changePWState(this)"><span class="pw_protect_on">开</span><span class="pw_protect_off">关</span><div class="pw_protect_watch" style="left: ' +
      e +
      ';"></div></div><div class="password_input_w"><input type="text" class="_pw txt" value="" placeholder=\'密码\' /><span class="button add_pw_btn" onclick="UI.addViewLinkPassword(this)">添加 </span><div style="clear:both;"></div></div>';
    $(".create_dis").html(a);
    if (d == "on" && b != "" && b != null) {
      $(".button.add_pw_btn").text("换一换");
      $(".password_input_w").show().find("._pw").val(b);
    }
  },
  createViewLink: function (a) {
    Util.ajax({
      url: "/view/addlink",
      data: { chartId: chartId },
      success: function (d) {
        UI.showShareViewLink("off");
        var b = d.viewLinkId;
        var c = b;
        $("#_view_link_input").val(c).select();
      },
    });
  },
  deleteViewLink: function () {
    Util.ajax({
      url: "/view/dellink",
      data: { chartId: chartId },
      success: function (a) {
        UI.showCreateViewLink();
      },
    });
  },
  changePWState: function (a) {
    var c = $(a).find(".pw_protect_watch")[0];
    var b = c.offsetLeft;
    if (b == -1) {
      $(c).css({ left: "33px" });
      $(".button.add_pw_btn").text("添加");
      $(".password_input_w").show().find("._pw").val("").focus();
    } else {
      Util.ajax({
        url: "/view/removepassword",
        data: { chartId: chartId },
        success: function (d) {
          $(c).css({ left: "-1px" });
          $(".edit_pw_protect").css({
            background: "#fff",
            color: "#323232",
            "text-shadow": "0px 1px 0px rgba(255,255,255,0.3)",
          });
          $(".password_input_w").find("._pw").val("");
          $(".password_input_w").hide();
        },
      });
    }
  },
  addViewLinkPassword: function (b) {
    var a = $.trim($(b).parent().find("._pw").val());
    if (a == "") {
      $("._pw").focus();
      return false;
    }
    Util.ajax({
      url: "/view/addpassword",
      data: { viewPassword: a, chartId: chartId },
      success: function (c) {
        $(".edit_pw_protect").css({
          background: "#5da206",
          color: "#fff",
          "text-shadow": "0px 1px 0px rgba(0,0,0,0.3)",
        });
        $(".button.add_pw_btn").text("换一换");
      },
    });
  },
  showPublish: function (d) {
    poCollect("发布模版-点击", {
      渠道记录: "编辑器内",
      来源记录: "",
      用户属性: "",
    });
    var a = $("#pubpo_win"),
      c = $(".pubpo-content");
    c.html(ProShare.publish.source);
    ProShare.publish.execute(chartId);
    setTimeout(function () {
      a.dialog({
        onClose: function () {
          $("#TencentCaptcha").appendTo("body").hide();
        },
      });
    }, 50);
    function b(f) {
      var g = $("#global_confirm_window");
      var e = "确定";
      if (f.okval) {
        e = f.okval;
      }
      var h = "取消";
      if (f.cancelval) {
        h = f.cancelval;
      }
      var i = "请确认";
      if (f.title) {
        i = f.title;
      }
      if (!g.length) {
        g = $(
          "<div id='global_confirm_window' tabindex='-1' class='confirm-box' title='" +
            i +
            "'><div class='dlg-content'>" +
            f.content +
            "</div><div class='dlg-buttons'><span class='pro-btn default okbtn'>" +
            e +
            "</span>&nbsp;&nbsp;<span class='pro-btn basic cancelbtn close'>" +
            h +
            "</span></div></div>"
        ).appendTo("body");
      } else {
        g.find(".dlg-content").html(f.content);
        g.find(".okbtn").html(e);
      }
      if (f.width) {
        g.css("width", f.width);
      }
      if (f.height) {
        g.css("height", f.height);
      }
      if (f.hiddenOK) {
        g.find(".okbtn").css("visibility", "hidden");
      } else {
        g.find(".okbtn").css("visibility", "visible");
      }
      if (f.hiddenCancel) {
        g.find(".cancelbtn").css("display", "none");
      } else {
        g.find(".cancelbtn").css("visibility", "inline-block");
      }
      g.dialog();
      $(document)
        .off("keyup.confirm")
        .on("keyup.confirm", function (j) {
          if (j.keyCode == 13) {
            g.find(".okbtn").trigger("click");
          }
        });
      g.find(".okbtn")
        .off()
        .on("click", function () {
          g.dialog("close");
          if (f.onConfirm) {
            f.onConfirm();
          }
          $(document).off("keyup.confirm");
        });
      g.find(".cancelbtn")
        .off("click.cancel")
        .on("click.cancel", function () {
          if (f.onCancel) {
            f.onCancel();
          }
          $(document).off("keyup.confirm");
        });
    }
  },
  savePublish: function () {
    var b = $("#publish_category").val();
    var e = $("#publish_language").val();
    var d = $("#publish_description").val();
    var a = $("#publish_tags").val();
    if ($.trim(a) == "") {
      $("#publish_tags").focus();
      return;
    } else {
      if ($.trim(d) == "") {
        $("#publish_description").focus();
        return;
      }
    }
    var c = a.replace("，", ",").split(",");
    Utils.removeFromArray(c, "");
    if (c.length == 0) {
      $("#publish_tags").focus();
      return;
    }
    $("#publish_dialog_savebtn").disable();
    $.ajax({
      url: "/folder/publish",
      data: {
        id: chartId,
        status: "public",
        language: e,
        industry: b,
        description: d,
        tags: c,
        _public_edit: $("#public_edit").is(":checked"),
        _public_clone: $("#public_clone").is(":checked"),
      },
      traditional: true,
      success: function (f) {
        $("#publish_dialog_savebtn").enable();
      },
    });
    cstatus = "public";
    $("#publish_dialog").dlg("close");
  },
  cancelPublish: function () {
    $.ajax({
      url: "/folder/publish",
      data: { id: chartId, status: "private" },
      success: function (a) {
        if (a.result == "overed") {
          UI.showTip(
            "私有存储空间已经不足，只能创建公开文件，您可以 <a target='_blank' href='/support/privatefile'>扩容</a>"
          );
        } else {
          cstatus = "private";
        }
      },
    });
    $("#unpublish_dialog").dlg("close");
  },
  showSaveAs: function () {
    $("#saveas_dialog").dlg();
    $("#saveas_title").val($(".diagram_title").text()).select();
  },
  doSaveAs: function () {
    if ($("#saveas_title").val().trim() == "") {
      $("#saveas_title").focus();
      return;
    }
    $("#hid_saveas_id").val(chartId);
    Util.ajax({
      url: "/diagraming/saveas",
      type: "GET",
      data: {
        id: $("#hid_saveas_id").val(),
        ajaxCheck: "ajaxCheck",
        team: teamId,
        org: orgId,
      },
      success: function (a) {
        if (a.result == "success") {
          $("#saveas_form").submit();
          $("#btn_dosaveas").removeAttr("onclick");
        } else {
          if (a.result == "overd") {
            Util.globalTopTip(
              "您的文件数量不足，无法另存为文件, 您可以<a target='_blank' href='/upgrade'>去升级账号</a>",
              "top_error",
              5000,
              $("#designer_header"),
              true
            );
          }
        }
      },
    });
  },
  showShapeOptions: function () {
    var shapeIds = Utils.getSelectedShapeIds();
    UI.hideShapeOptions();
    if (shapeIds.length == 1) {
      var shape = Model.getShapeById(shapeIds[0]);
      if (shape.name == "uiTab") {
        var activeTab = 0;
        for (var i = 0; i < shape.path.length - 1; i++) {
          var path = shape.path[i];
          if (typeof path.fillStyle == "undefined") {
            activeTab = i + 1;
            break;
          }
        }
        UI.showOptions(shape, [
          {
            label: "Tab数：",
            type: "spinner",
            value: shape.path.length - 1,
            onChange: function (tabCount) {
              var activeIndex = 0;
              for (var i = 0; i < shape.path.length - 1; i++) {
                var path = shape.path[i];
                if (typeof path.fillStyle == "undefined") {
                  activeIndex = i;
                  break;
                }
              }
              var last = shape.path[shape.path.length - 1];
              if (tabCount != shape.path.length - 1) {
                if (activeIndex > tabCount - 1) {
                  activeIndex = tabCount - 1;
                  $("#change_uitab_index").spinner("setValue", tabCount);
                }
                shape.path = [];
                var newBlock = [];
                for (var i = 0; i < tabCount; i++) {
                  var pathCmd = {
                    actions: [
                      { action: "move", x: "w/" + tabCount + "*" + i, y: "h" },
                      { action: "line", x: "w/" + tabCount + "*" + i, y: 7 },
                      {
                        action: "quadraticCurve",
                        x1: "w/" + tabCount + "*" + i,
                        y1: 0,
                        x: "w/" + tabCount + "*" + i + "+7",
                        y: 0,
                      },
                      {
                        action: "line",
                        x: "w/" + tabCount + "*" + (i + 1) + "-7",
                        y: 0,
                      },
                      {
                        action: "quadraticCurve",
                        x1: "w/" + tabCount + "*" + (i + 1),
                        y1: 0,
                        x: "w/" + tabCount + "*" + (i + 1),
                        y: 7,
                      },
                      {
                        action: "line",
                        x: "w/" + tabCount + "*" + (i + 1),
                        y: "h",
                      },
                    ],
                  };
                  if (i != activeIndex) {
                    pathCmd.fillStyle = { color: "r-20,g-20,b-20" };
                    pathCmd.actions.push({ action: "close" });
                  }
                  shape.path.push(pathCmd);
                  if (i < shape.textBlock.length) {
                    var shapeBlock = shape.textBlock[i];
                    shapeBlock.position.x = "w/" + tabCount + "*" + i + "+5";
                    shapeBlock.position.w = "w/" + tabCount + "-10";
                    newBlock.push(shapeBlock);
                  } else {
                    newBlock.push({
                      position: {
                        x: "w/" + tabCount + "*" + i + "+5",
                        y: 5,
                        w: "w/" + tabCount + "-10",
                        h: "h-10",
                      },
                      text: "Tab " + (i + 1),
                    });
                  }
                }
                shape.textBlock = newBlock;
                shape.path.push(last);
                Schema.initShapeFunctions(shape);
                Model.update(shape);
                Designer.painter.renderShape(shape);
                $("#change_uitab_index").spinner("setOptions", {
                  max: tabCount,
                });
              }
            },
          },
          {
            id: "change_uitab_index",
            label: "选中：",
            type: "spinner",
            value: activeTab,
            max: shape.path.length - 1,
            onChange: function (active) {
              var activeIndex = 0;
              for (var i = 0; i < shape.path.length - 1; i++) {
                var path = shape.path[i];
                if (typeof path.fillStyle == "undefined") {
                  activeIndex = i;
                  break;
                }
              }
              if (activeIndex != active - 1) {
                shape.path[activeIndex].fillStyle = { color: "r-20,g-20,b-20" };
                shape.path[activeIndex].actions.push({ action: "close" });
                delete shape.path[active - 1].fillStyle;
                shape.path[active - 1].actions.splice(6, 1);
                Schema.initShapeFunctions(shape);
                Model.update(shape);
                Designer.painter.renderShape(shape);
              }
            },
          },
        ]);
      } else {
        if (shape.attribute.collapsable) {
          UI.showOptions(shape, [
            {
              type: "button",
              value: shape.attribute.collapsed ? "展开" : "收缩",
              onClick: function (btn) {
                MessageSource.beginBatch();
                var updates = [];
                if (!shape.attribute.markers) {
                  shape.attribute.markers = [];
                }
                if (shape.attribute.collapsed) {
                  var collapsed = Utils.getCollapsedShapesById(shape.id);
                  for (var j = 0; j < collapsed.length; j++) {
                    var con = collapsed[j];
                    delete con.attribute.collapseBy;
                    updates.push(con);
                    Designer.painter.renderShape(con);
                  }
                  var linkers = Utils.getOutlinkers(collapsed);
                  for (var j = 0; j < linkers.length; j++) {
                    var linker = linkers[j];
                    delete linker.attribute;
                    updates.push(linker);
                    Designer.painter.renderLinker(linker);
                  }
                  Utils.removeFromArray(shape.attribute.markers, "expand");
                  shape.attribute.container = true;
                  shape.attribute.collapsed = false;
                  var w = shape.attribute.collapseW
                    ? shape.attribute.collapseW
                    : 400;
                  var h = shape.attribute.collapseH
                    ? shape.attribute.collapseH
                    : 300;
                  Designer.setShapeProps({ w: w, h: h }, [shape]);
                  btn.text("收缩");
                } else {
                  var contained = Utils.getContainedShapes([shape]);
                  for (var j = 0; j < contained.length; j++) {
                    var con = contained[j];
                    if (typeof con.attribute == "undefined") {
                      con.attribute = {};
                    }
                    con.attribute.collapseBy = shape.id;
                    updates.push(con);
                    Designer.painter.renderShape(con);
                  }
                  var linkers = Utils.getOutlinkers(contained);
                  for (var j = 0; j < linkers.length; j++) {
                    var linker = linkers[j];
                    linker.attribute = { collapseBy: shape.id };
                    updates.push(linker);
                    Designer.painter.renderLinker(linker);
                  }
                  shape.attribute.markers.push("expand");
                  shape.attribute.container = false;
                  shape.attribute.collapsed = true;
                  shape.attribute.collapseW = shape.props.w;
                  shape.attribute.collapseH = shape.props.h;
                  Designer.setShapeProps({ w: 120, h: 80 }, [shape]);
                  btn.text("展开");
                }
                if (updates.length > 0) {
                  Model.updateMulti(updates);
                }
                Utils.selectShape(shape.id);
                MessageSource.commit();
              },
            },
          ]);
        } else {
          if (shape.name == "uiGrid") {
            var row = 1;
            var column = 1;
            var gridPath = shape.path[2];
            for (var i = 0; i < gridPath.actions.length - 1; i++) {
              var pathAction = gridPath.actions[i];
              if (pathAction.action == "move" && pathAction.x == 0) {
                row++;
              } else {
                if (pathAction.action == "move" && pathAction.y == 0) {
                  column++;
                }
              }
            }
            UI.showOptions(shape, [
              {
                id: "change_uigrid_row",
                label: "行：",
                type: "spinner",
                value: row,
                onChange: function (count) {
                  $("#grid_dom").remove();
                  var props = shape.props,
                    x = props.x,
                    y = props.y,
                    w = props.w,
                    h = props.h;
                  var path2 = shape.path[2].actions;
                  var rowArr = [0.5],
                    columnArr = [0.5];
                  for (var i = 0; i < path2.length; i++) {
                    var pathItem = path2[i];
                    if (pathItem.x == 0) {
                      var pathY = eval(
                        "var w=" + w + ";var h = " + h + ";" + pathItem.y
                      );
                      rowArr.push(pathY);
                    } else {
                      if (pathItem.y == 0) {
                        var pathX = eval(
                          "var w=" + w + ";var h = " + h + ";" + pathItem.x
                        );
                        columnArr.push(pathX);
                      }
                    }
                  }
                  rowArr.push(h + 0.5);
                  columnArr.push(w + 0.5);
                  if (count > row) {
                    var rowLen = rowArr.length;
                    var hVal = rowArr[rowLen - 1] - rowArr[rowLen - 2];
                    for (var i = rowLen - 1; i < count; i++) {
                      rowArr.push(rowArr[rowArr.length - 1] + hVal);
                    }
                    h = rowArr[rowArr.length - 1] - 0.5;
                  } else {
                    if (count < row) {
                      var rowLen = rowArr.length;
                      for (var i = count; i < rowLen - 1; i++) {
                        rowArr.splice(rowArr.length - 1, 1);
                      }
                      h = rowArr[rowArr.length - 1] - 0.5;
                    }
                  }
                  var headActions = shape.path[1].actions;
                  headActions[2].y = "Math.floor(h*" + rowArr[1] / h + ")+0.5";
                  headActions[3].y = "Math.floor(h*" + rowArr[1] / h + ")+0.5";
                  var gridActions = [];
                  for (var i = 1; i < rowArr.length - 1; i++) {
                    var yFormla = "Math.floor(h*" + rowArr[i] / h + ")+0.5";
                    gridActions.push({ action: "move", x: 0, y: yFormla });
                    gridActions.push({ action: "line", x: "w", y: yFormla });
                  }
                  for (var i = 0; i < shape.path[2].actions.length; i++) {
                    var action = shape.path[2].actions[i];
                    if (action.y == 0 || action.y == "h") {
                      gridActions.push(action);
                    }
                  }
                  var textBlockArr = [],
                    textNum = 0;
                  for (var i = 0; i < rowArr.length - 1; i++) {
                    for (var j = 0; j < columnArr.length - 1; j++) {
                      var textX = "Math.floor(w*" + columnArr[j] / w + ")",
                        textW =
                          "Math.floor(w*" +
                          (columnArr[j + 1] - columnArr[j]) / w +
                          ")",
                        textY = "Math.floor(h*" + rowArr[i] / h + ")",
                        textH =
                          "Math.floor(h*" +
                          (rowArr[i + 1] - rowArr[i]) / h +
                          ")";
                      var position = { x: textX, y: textY, w: textW, h: textH };
                      var text = "";
                      if (shape.textBlock[textNum]) {
                        text = shape.textBlock[textNum].text
                          ? shape.textBlock[textNum].text
                          : "";
                      }
                      textBlockArr.push({ position: position, text: text });
                      textNum++;
                    }
                  }
                  shape.textBlock = textBlockArr;
                  shape.path[2].actions = gridActions;
                  shape.props.w = w;
                  shape.props.h = h;
                  Schema.initShapeFunctions(shape);
                  Model.update(shape);
                  Designer.painter.renderShape(shape);
                  row = count;
                  Utils.unselect();
                  Utils.selectShape(shape.id);
                  $("#change_uigrid_row input").focus();
                },
              },
              {
                id: "change_uigrid_column",
                label: "列：",
                type: "spinner",
                value: column,
                onChange: function (count) {
                  $("#grid_dom").remove();
                  var props = shape.props,
                    x = props.x,
                    y = props.y,
                    w = props.w,
                    h = props.h;
                  var path2 = shape.path[2].actions;
                  var rowArr = [0.5],
                    columnArr = [0.5];
                  for (var i = 0; i < path2.length; i++) {
                    var pathItem = path2[i];
                    if (pathItem.x == 0) {
                      var pathY = eval(
                        "var w=" + w + ";var h = " + h + ";" + pathItem.y
                      );
                      rowArr.push(pathY);
                    } else {
                      if (pathItem.y == 0) {
                        var pathX = eval(
                          "var w=" + w + ";var h = " + h + ";" + pathItem.x
                        );
                        columnArr.push(pathX);
                      }
                    }
                  }
                  rowArr.push(h + 0.5);
                  columnArr.push(w + 0.5);
                  if (count > column) {
                    var columnLen = columnArr.length;
                    var wVal =
                      columnArr[columnLen - 1] - columnArr[columnLen - 2];
                    for (var i = columnLen - 1; i < count; i++) {
                      columnArr.push(columnArr[columnArr.length - 1] + wVal);
                    }
                    w = columnArr[columnArr.length - 1] - 0.5;
                  } else {
                    if (count < column) {
                      var columnLen = columnArr.length;
                      for (var i = count; i < columnLen - 1; i++) {
                        columnArr.splice(columnArr.length - 1, 1);
                      }
                      w = columnArr[columnArr.length - 1] - 0.5;
                    }
                  }
                  var gridActions = [];
                  for (var i = 0; i < shape.path[2].actions.length; i++) {
                    var action = shape.path[2].actions[i];
                    if (action.x == 0 || action.x == "w") {
                      gridActions.push(action);
                    }
                  }
                  for (var i = 1; i < columnArr.length - 1; i++) {
                    var xFormla = "Math.floor(w*" + columnArr[i] / w + ")+0.5";
                    gridActions.push({ action: "move", x: xFormla, y: 0 });
                    gridActions.push({ action: "line", x: xFormla, y: "h" });
                  }
                  var textBlockArr = [],
                    textNum = 0;
                  for (var i = 0; i < rowArr.length - 1; i++) {
                    for (var j = 0; j < columnArr.length - 1; j++) {
                      var textX = "Math.floor(w*" + columnArr[j] / w + ")",
                        textW =
                          "Math.floor(w*" +
                          (columnArr[j + 1] - columnArr[j]) / w +
                          ")",
                        textY = "Math.floor(h*" + rowArr[i] / h + ")",
                        textH =
                          "Math.floor(h*" +
                          (rowArr[i + 1] - rowArr[i]) / h +
                          ")";
                      var position = { x: textX, y: textY, w: textW, h: textH };
                      var text = "";
                      if (count > column) {
                        if (count > j + (count - column)) {
                          text = shape.textBlock[textNum].text
                            ? shape.textBlock[textNum].text
                            : "";
                          textNum++;
                        } else {
                          if (i == 0) {
                            text = "标题 " + (j + 1);
                          }
                        }
                      } else {
                        if (count < column) {
                          text = shape.textBlock[textNum].text
                            ? shape.textBlock[textNum].text
                            : "";
                          textNum++;
                          if (count == j + 1) {
                            textNum = textNum + (column - count);
                          }
                        }
                      }
                      textBlockArr.push({ position: position, text: text });
                    }
                  }
                  shape.textBlock = textBlockArr;
                  shape.path[2].actions = gridActions;
                  shape.props.w = w;
                  shape.props.h = h;
                  Schema.initShapeFunctions(shape);
                  Model.update(shape);
                  Designer.painter.renderShape(shape);
                  column = count;
                  UI.hideShapeOptions();
                  Utils.unselect();
                  Utils.selectShape(shape.id);
                  $("#change_uigrid_column input").focus();
                },
              },
            ]);
          }
        }
      }
    }
  },
  showOptions: function (f, m) {
    var e = $("#shape_opt_box");
    if (e.length == 0) {
      e = $(
        "<div id='shape_opt_box'><div class='shape_opts'></div><div class='ico dlg_close'></div></div>"
      ).appendTo("#designer_canvas");
      e.bind("mousedown", function (i) {
        i.stopPropagation();
      }).bind("mousemove", function (i) {
        i.stopPropagation();
      });
      e.children(".dlg_close").bind("click", function (i) {
        e.hide();
      });
    }
    e.show();
    var h = Utils.getShapeBox(f);
    e.css({
      left: (h.x + h.w + 10).toScale(),
      top: h.y.toScale(),
      "z-index": Model.orderList.length + 1,
    });
    var g = e.children(".shape_opts");
    g.empty();
    for (var c = 0; c < m.length; c++) {
      var a = m[c];
      var l = $("<div class='opt'></div>").appendTo(g);
      if (a.type == "spinner") {
        l.append("<label>" + a.label + "</label>");
        var j = $("<div class='field'></div>").appendTo(l);
        var k = $(
          "<div class='spinner active' style='width: 55px;'></div>"
        ).appendTo(j);
        if (a.id) {
          k.attr("id", a.id);
        }
        k.spinner({
          min: 1,
          max: typeof a.max != "undefined" ? a.max : 20,
          step: 1,
          onChange: a.onChange,
        });
        k.spinner("setValue", a.value);
      } else {
        if (a.type == "button") {
          var b = $("<div class='button_box'></div>").appendTo(l);
          var d = $(
            "<div class='toolbar_button active'>" + a.value + "</div>"
          ).appendTo(b);
          d.bind("click", function () {
            a.onClick($(this));
          });
        }
      }
    }
  },
  hideShapeOptions: function () {
    $("#shape_opt_box").hide();
  },
  toogleTitleBar: function () {
    var a = $("#bar_collapse").children("div");
    if (a.hasClass("collapse")) {
      a.attr("class", "ico expand");
      $(".titlebar").slideUp(200);
      $(".layout").animate({ height: $(window).height() - 73 }, 200);
      $(".lanebar").animate({ top: 35 }, 200);
      $(".gridbar").animate({ top: 35 }, 200);
      $("#bar_return").show();
      return false;
    } else {
      a.attr("class", "ico collapse");
      $(".titlebar").slideDown(200);
      $(".layout").animate({ height: $(window).height() - 143 }, 200);
      $(".lanebar").animate({ top: 108 }, 200);
      $(".gridbar").animate({ top: 108 }, 200);
      $("#bar_return").hide();
      return true;
    }
  },
  showThemeSelect: function () {
    $("#themes").dropdown({ target: $("#bar_theme") });
    if ($("#themes").children(".theme_box").length == 0) {
      for (var d in Schema.themes) {
        var f = Schema.themes[d];
        var e = $(
          "<div theme='" +
            d +
            "' class='theme_box'><canvas width='130' height='130'></canvas></div>"
        ).appendTo($("#themes"));
        e.bind("click", function () {
          var g = $(this).attr("theme");
          UI.setTheme(g);
        });
        var c = e.children("canvas");
        var a = c[0].getContext("2d");
        a.save();
        a.fillStyle = "rgb(" + f.shape.fillStyle.color + ")";
        a.lineWidth = f.shape.lineStyle.lineWidth;
        a.strokeStyle = "rgb(" + f.shape.lineStyle.lineColor + ")";
        a.beginPath();
        a.moveTo(10, 14);
        a.quadraticCurveTo(10, 10, 14, 10);
        a.lineTo(81, 10);
        a.quadraticCurveTo(85, 10, 85, 14);
        a.lineTo(85, 51);
        a.quadraticCurveTo(85, 55, 81, 55);
        a.lineTo(14, 55);
        a.quadraticCurveTo(10, 55, 10, 51);
        a.closePath();
        a.closePath();
        a.fill();
        a.stroke();
        a.beginPath();
        a.moveTo(140, 70);
        a.lineTo(100, 100);
        a.lineTo(140, 130);
        a.closePath();
        a.fill();
        a.stroke();
        a.restore();
        a.fillStyle = "rgb(" + f.linker.lineStyle.lineColor + ")";
        a.lineWidth = f.linker.lineStyle.lineWidth;
        a.strokeStyle = "rgb(" + f.linker.lineStyle.lineColor + ")";
        a.beginPath();
        a.moveTo(47, 56);
        a.lineTo(47, 100);
        a.lineTo(90, 100);
        a.stroke();
        a.beginPath();
        a.moveTo(83, 96);
        a.lineTo(95, 100);
        a.lineTo(83, 104);
        a.closePath();
        a.fill();
        a.stroke();
        a.textAlign = "center";
        a.textBaseline = "middle";
        var b = "";
        if (f.shape.fontStyle.italic) {
          b += " italic";
        }
        if (f.shape.fontStyle.bold) {
          b += " bold";
        }
        b +=
          " " + f.shape.fontStyle.size + "px " + f.shape.fontStyle.fontFamily;
        a.font = b;
        a.fillStyle = "rgb(" + f.shape.fontStyle.color + ")";
        a.fillText("流程节点", 47, 32);
        b = "";
        if (f.linker.fontStyle.italic) {
          b += " italic";
        }
        if (f.linker.fontStyle.bold) {
          b += " bold";
        }
        b +=
          " " + f.linker.fontStyle.size + "px " + f.linker.fontStyle.fontFamily;
        a.font = b;
        a.fillStyle = "rgb(" + f.linker.fontStyle.color + ")";
        a.clearRect(30, 71, 30, 18);
        a.fillText("是", 47, 80);
      }
    }
    $("#themes").append("<div style='clear:both'></div>");
  },
  setTheme: function (a) {
    var b = Schema.themes[a];
    Model.setTheme(b);
    $("#themes").dropdown("close");
    Designer.events.push("resetBrokenLinker");
  },
  setDefaultStyle: function (b) {
    var a = Designer.op.setDefaultStyle();
    if (a != null && a == "error") {
      UI.showTip("当前图形不能设置默认样式");
      setTimeout(function () {
        UI.hideTip();
      }, 1000);
      return;
    }
    b.find("[click-btn]").show();
  },
  showTip: function (a, d, c) {
    if (!d) {
      d = "center";
    }
    var b = $("#designer_ui_tip");
    if (b.length == 0) {
      b = $(
        "<div id='designer_ui_tip'><div class='ui_tip_text'></div></div>"
      ).appendTo("#designer_viewport");
    }
    b.children(".ui_tip_text").html(a);
    if (d == "center") {
      b.css("left", ($("#designer_viewport").width() - b.outerWidth()) / 2);
    } else {
      b.css("left", "20px");
    }
    if ($(".gridbar").css("display") || $(".lanebar").css("display")) {
      $("#designer_ui_tip").css("top", "60px");
    } else {
      $("#designer_ui_tip").css("top", "20px");
    }
    b.fadeIn("fast");
  },
  hideTip: function () {
    $("#designer_ui_tip").hide();
  },
  toast: function (b, d, c) {
    var a = this;
    a.showTip(b, d);
    clearTimeout(a.timer);
    a.timer = setTimeout(function () {
      a.hideTip();
    }, c);
  },
  RGB2Hex: function (b) {
    if (b.charAt(0) == "#") {
      return b;
    }
    var c = b.split(/\D+/);
    var a = Number(c[1]) * 65536 + Number(c[2]) * 256 + Number(c[3]);
    return "" + UI.toHex(a, 6);
  },
  toHex: function (a, c) {
    var b = a.toString(16);
    while (b.length < c) {
      b = "0" + b;
    }
    return b;
  },
  hex2RGB: function (d) {
    var c = /^#([0-9a-fA-f]{3}|[0-9a-fA-f]{6})$/;
    if (d && c.test(d)) {
      if (d.length === 4) {
        var e = "#";
        for (var b = 1; b < 4; b += 1) {
          e += d.slice(b, b + 1).concat(d.slice(b, b + 1));
        }
        d = e;
      }
      var a = [];
      for (var b = 1; b < 7; b += 2) {
        a.push(parseInt("0x" + d.slice(b, b + 2)));
      }
      return a.join(",");
    } else {
      return d;
    }
  },
  showUploading: function () {
    var a = $(
      "<div class='uploading-tip'><span class='icons rotate1'>&#xe635;</span> <span>图片正在上传中......</span></div>"
    );
    a.appendTo("body");
    a.show();
  },
  hideUploading: function () {
    $(".uploading-tip").remove();
  },
  editMyshape: {
    params: {},
    config: { width: 90, height: 90, padding: 1 },
    isLoading: true,
    init: function () {
      var e = Schema.myShapes,
        f = e.length;
      var a = $("#myshape_dialog .no_myshape"),
        b = $("#myshape_dialog .myshape_wrap .myshape_box");
      if (e.length == 0) {
        a.css("display", "block");
        a.off().on("click", function (g) {
          $("#import_myshape").trigger("click");
        });
        return;
      } else {
        a.css("display", "none");
        b.remove();
      }
      for (var d = 0; d < e.length; d++) {
        var c = e[d];
        UI.editMyshape.renderMyshape($("#myshape_dialog .myshape_wrap"), c);
      }
      UI.editMyshape.moveEvent();
    },
    renderMyshape: function (b, e) {
      var g = this;
      var c =
        "<div class='myshape_box' id=" +
        e.name +
        " > <div class='canvas_box'> <i></i> <canvas class='myshape_item' width=" +
        UI.editMyshape.config.width +
        " height=" +
        UI.editMyshape.config.height +
        "></canvas></div><input type='text' value='" +
        e.title +
        "' /></div>";
      var d = $(c).appendTo(b);
      var f = d.find("canvas")[0];
      var a = f.getContext("2d");
      a.clearRect(0, 0, 90, 90);
      Designer.painter.drawPanelItemByShape(f, e, UI.editMyshape.config);
      d.find("i")
        .off()
        .on("click", function (i) {
          i.stopPropagation();
          var h = d.attr("id");
          if (!g.isLoading) {
            return;
          }
          UI.editMyshape.deleteMyshape(h, d);
        });
      d.find(":text").focus(function () {
        this.select();
      });
      d.find(":text").blur(function () {
        var h = $.trim($(this).val());
        h = Util.filterXss(h);
        if (e.title == h || h == "") {
          return;
        }
        if (h.length > 20) {
          Util.globalTopTip(
            "图形名称字符不能超过20",
            "top_error",
            2000,
            $("#myshape_dialog"),
            true
          );
          return;
        }
        $.ajax({
          url: "/diagraming/chart_my_shapes/update_title",
          type: "post",
          data: { shapeId: e.id, title: h },
          success: function (i) {
            if (i.result == "success") {
              e.title = h;
              Util.globalTopTip(
                "修改成功",
                "top_success",
                2000,
                $("#myshape_dialog"),
                true
              );
            } else {
              Util.globalTopTip(
                "保存失败",
                "top_error",
                2000,
                $("#myshape_dialog"),
                true
              );
            }
          },
        });
      });
    },
    deleteMyshape: function (c, e) {
      var f = this;
      f.isLoading = false;
      var a = Schema.myShapes.length;
      for (var d = 0; d < a; d++) {
        var b = Schema.myShapes[d];
        if (b.name == c) {
          $.ajax({
            url: "/diagraming/chart_my_shapes/remove",
            type: "GET",
            data: { shapeId: b.id },
            success: function (g) {
              f.isLoading = true;
              if (g.result == "success") {
                Schema.myShapes.splice(d, 1);
                e.remove();
                if (a == 1) {
                  $("#myshape_dialog .no_myshape").css("display", "block");
                }
                Util.globalTopTip(
                  "已删除",
                  "top_success",
                  2000,
                  $("#myshape_dialog"),
                  true
                );
              } else {
                Util.globalTopTip(
                  "保存失败",
                  "top_error",
                  2000,
                  $("#myshape_dialog"),
                  true
                );
              }
            },
            error: function () {
              Util.globalTopTip(
                "保存失败",
                "top_error",
                2000,
                $("#myshape_dialog"),
                true
              );
            },
          });
          break;
        }
      }
    },
    moveEvent: function () {
      var g = this;
      var c = 0,
        f = 0;
      var d = 0;
      var e, i, h, b, a;
      $(".myshape_wrap")
        .off()
        .on("mousedown.myshape", function (m) {
          if (m.button == 2) {
            return;
          }
          (e = $("#myshape_dialog")),
            (i = $(".myshape_wrap")),
            (h = $(".myshape_wrap .myshape_box")),
            (b = $(m.target).parents(".myshape_box"));
          if (
            m.target.tagName == "INPUT" ||
            m.target.tagName == "I" ||
            b.length == 0
          ) {
            return;
          }
          f = b.index() - 1;
          c = b.index();
          d = Schema.myShapes.length;
          var j = e.position();
          var o = i.position();
          var l = i.width(),
            w = i.height();
          var n = h.width(),
            k = h.height();
          var z = h.children(".canvas_box").width(),
            p = h.children(".canvas_box").height();
          var s = m.pageX,
            r = m.pageY;
          var u = { x: s - (j.left + o.left), y: r - (j.top + o.top) };
          a = b
            .children(".canvas_box")
            .clone(false)
            .appendTo(".myshape_wrap")
            .removeAttr("id")
            .addClass("clone_shape")
            .off();
          a.find("canvas_box").off();
          var q = a.find("canvas")[0];
          var v = q.getContext("2d");
          v.clearRect(0, 0, 90, 90);
          var t = Utils.copy(Schema.myShapes[f]);
          Designer.painter.drawPanelItemByShape(q, t, UI.editMyshape.config);
          a.find("i").remove();
          a.css({
            position: "absolute",
            "z-index": "1",
            top: u.y - p / 2 + i.scrollTop() + "px",
            left: u.x - z / 2 + "px",
          });
          setTimeout(function () {
            a.css("transform", "scale(0.7)");
          }, 0);
          b.css({ opacity: 0.3 });
          a.off("contextmenu").on("contextmenu", function (x) {
            return false;
          });
          $(".myshape_wrap").on("mousemove.myshape", function (F) {
            if (F.button == 2) {
              return;
            }
            var B = i.scrollTop();
            var x = F.pageX,
              G = F.pageY;
            var A = x - s;
            cy = G - r;
            var y = u.x + A,
              H = u.y + B + cy;
            a.css({ top: H - p / 2 + "px", left: y - z / 2 + "px" });
            if (y > l || H > w + B || y <= 5 || H <= 5) {
              a.remove();
              b.css({ opacity: 1 });
              $(".myshape_wrap").off("mousemove.myshape");
              $(".myshape_rule").remove();
              return;
            }
            var E = Math.round(y / (n + 30));
            var J = Math.floor(H / (k + 30));
            if (c != J * 5 + E) {
              var C = $(".myshape_rule");
              if (C.length == 0) {
                i.append('<div class="myshape_rule"><div>');
                C = $(".myshape_rule");
              }
              if (J * 5 + E < d) {
                C.css({ left: E * 132 + 20, top: J * 160 + 33 });
              } else {
                var D = d % 5 == 0 ? 5 : d % 5;
                var I = d % 5 == 0 ? Math.floor(d / 5) - 1 : Math.floor(d / 5);
                C.css({ left: D * 132 + 20, top: I * 160 + 33 });
              }
            }
            c = J * 5 + E;
          });
          $(".myshape_wrap")
            .off("mouseup.myshape")
            .on("mouseup.myshape", function (x) {
              if (x.button == 2) {
                return;
              }
              if (
                x.target.tagName == "INPUT" ||
                x.target.tagName == "I" ||
                b.length == 0
              ) {
                return;
              }
              $(".myshape_wrap").off("mousemove.myshape");
              a.remove();
              $(".myshape_rule").remove();
              b.css({ opacity: 1 });
              if (!g.isLoading) {
                return;
              }
              c = c > d ? d : c;
              if (c != f && !(c == 0 && f == 0)) {
                c = f > c ? c : c - 1;
                if (c == f) {
                  return;
                }
                g.isLoading = false;
                var y = $("#panel_myshape .panel_box");
                var A = Schema.myShapes[f].id;
                $.ajax({
                  url: "/diagraming/chart_my_shapes/sort",
                  type: "POST",
                  data: { shapeId: A, offset: f + "-" + c },
                  success: function (E) {
                    if (E.result == "success") {
                      var C = Schema.myShapes.splice(f, 1)[0];
                      Schema.myShapes.splice(c, 0, C);
                      var B = h.eq(f),
                        D = h.eq(c);
                      var F = (c % 5) - (f % 5),
                        G = Math.floor(c / 5) - Math.floor(f / 5);
                      if (f > c) {
                        h.each(function (H, I) {
                          if (H >= c && H < f) {
                            if (H % 5 == 4) {
                              $(I).css({
                                transform: "translate(-528px,162px)",
                              });
                            } else {
                              $(I).css({ transform: "translate(132px,0px)" });
                            }
                          }
                        });
                        B.css({
                          transform:
                            "translate(" + 132 * F + "px ," + 162 * G + "px)",
                        });
                        h.css({ transition: "transform 0.3s" });
                        setTimeout(function () {
                          D.before(B);
                          h.css({
                            transform: "translate(0)",
                            transition: "none",
                          });
                          g.isLoading = true;
                        }, 300);
                      } else {
                        h.each(function (H, I) {
                          if (H <= c && H > f) {
                            if (H % 5 == 0) {
                              $(I).css({
                                transform: "translate(528px,-162px)",
                              });
                            } else {
                              $(I).css({ transform: "translate(-132px,0px)" });
                            }
                          }
                        });
                        B.css({
                          transform:
                            "translate(" + 132 * F + "px ," + 162 * G + "px)",
                        });
                        h.css({ transition: "transform 0.3s" });
                        setTimeout(function () {
                          D.after(B);
                          h.css({
                            transform: "translate(0)",
                            transition: "none",
                          });
                          g.isLoading = true;
                        }, 300);
                      }
                    } else {
                      g.isLoading = true;
                      Util.globalTopTip(
                        "保存失败",
                        "top_error",
                        2000,
                        $("#myshape_dialog"),
                        true
                      );
                    }
                  },
                  error: function () {
                    g.isLoading = true;
                    Util.globalTopTip(
                      "保存失败",
                      "top_error",
                      2000,
                      $("#myshape_dialog"),
                      true
                    );
                  },
                });
              }
            });
        });
    },
  },
};
var Dock = {
  init: function () {
    var a = $("#designer_layout").width();
    var d = $("#layout_block").width();
    var c = a - d;
    $("#dock").css("right", c);
    var e = c + $("#dock").outerWidth() - 1;
    $(".dock_view").css("right", e);
    if ($("#demo_signup").length) {
      var b = $("#demo_signup").outerHeight();
      $("#dock").css("top", b);
      $(".dock_view").css("top", b + 10);
    }
    $(".ico_dock_collapse").bind("click", function () {
      $(".dock_view").hide();
      $(".dock_buttons").children().removeClass("selected");
      if (Dock.currentView == "history") {
        Dock.closeHistory();
      }
      Dock.currentView = "";
      CLB.setConfig("dock", "none");
    });
    $(window).bind("resize.dock", function () {
      if (Dock.currentView == "attribute") {
        Dock.fitAttrList();
      }
    });
    $("#dock_zoom").spinner({
      min: 50,
      max: 200,
      unit: "%",
      step: 10,
      onChange: function (f) {
        Designer.setZoomScale(f / 100);
      },
    });
    $("#dock_line_color").colorButton({
      onSelect: function (f) {
        Designer.setLineStyle({ lineColor: f });
      },
    });
    $("#dock_line_style").button({
      onMousedown: function () {
        $("#line_style_list").dropdown({
          target: $("#dock_line_style"),
          onSelect: function (l) {
            var j = l.attr("line");
            Designer.setLineStyle({ lineStyle: j });
            var k = l.children("div").attr("class");
            $("#dock_line_style").children(".linestyle").attr("class", k);
          },
        });
        var g = Utils.getSelected()[0];
        var f;
        if (g.name == "linker") {
          f = Utils.getLinkerLineStyle(g.lineStyle);
        } else {
          f = Utils.getShapeLineStyle(g.lineStyle);
        }
        var h = f.lineStyle;
        var i = $("#line_style_list").children("li[line=" + h + "]");
        $("#line_style_list").dropdown("select", i);
      },
    });
    $("#dock_line_width").spinner({
      min: 0,
      max: 10,
      unit: "px",
      step: 1,
      onChange: function (f) {
        Designer.setLineStyle({ lineWidth: f });
      },
    });
    $("#dock_fill_type").button({
      onMousedown: function () {
        $("#dock_fill_list").dropdown({
          target: $("#dock_fill_type"),
          onSelect: function (j) {
            var i = j.attr("ty");
            $("#dock_fill_type").button("setText", j.text());
            if (i == "image") {
              UI.showImageSelect(function (m, l, n) {
                Designer.setFillStyle({
                  type: "image",
                  fileId: m,
                  imageW: l,
                  imageH: n,
                });
              });
            } else {
              Designer.setFillStyle({ type: i });
              var k = Utils.getSelectedShapeIds();
              var h = Model.getShapeById(k[0]);
              var g = Utils.getShapeFillStyle(h.fillStyle);
              Dock.setFillStyle(g);
            }
          },
        });
        var f = $("#dock_fill_type").text();
        $("#dock_fill_list")
          .children()
          .each(function () {
            if ($(this).text() == f) {
              $("#dock_fill_list").dropdown("select", $(this));
              return false;
            }
          });
      },
    });
    $("#fill_solid_btn").colorButton({
      onSelect: function (f) {
        Designer.setFillStyle({ type: "solid", color: f });
      },
    });
    $("#fill_gradient_begin").colorButton({
      onSelect: function (f) {
        Designer.setFillStyle({ beginColor: f });
        $("#fill_gradient_begin").attr("c", f);
      },
    });
    $("#fill_gradient_end").colorButton({
      onSelect: function (f) {
        Designer.setFillStyle({ endColor: f });
        $("#fill_gradient_end").attr("c", f);
      },
    });
    $("#gradient_swap").button({
      onClick: function () {
        var g = $("#fill_gradient_begin").attr("c");
        var f = $("#fill_gradient_end").attr("c");
        $("#fill_gradient_begin").attr("c", f).colorButton("setColor", f);
        $("#fill_gradient_end").attr("c", g).colorButton("setColor", g);
        Designer.setFillStyle({ beginColor: f, endColor: g });
      },
    });
    $("#gradient_type").button({
      onMousedown: function () {
        $("#gradient_type_list").dropdown({
          target: $("#gradient_type"),
          onSelect: function (j) {
            var i = j.attr("ty");
            $("#gradient_type").button("setText", j.text());
            Designer.setFillStyle({ gradientType: i });
            $(".gradient_details").hide();
            $("#gradient_type_" + i).show();
            var k = Utils.getSelectedShapeIds();
            var h = Model.getShapeById(k[0]);
            var g = Utils.getShapeFillStyle(h.fillStyle);
            if (i == "linear") {
              $("#gradient_angle").spinner(
                "setValue",
                Math.round((g.angle / Math.PI) * 180) + "°"
              );
            } else {
              $("#gradient_radius").spinner(
                "setValue",
                Math.round(g.radius * 100) + "%"
              );
            }
          },
        });
        var f = $("#gradient_type").text().trim();
        $("#gradient_type_list")
          .children()
          .each(function () {
            if ($(this).text() == f) {
              $("#gradient_type_list").dropdown("select", $(this));
              return false;
            }
          });
      },
    });
    $("#gradient_angle").spinner({
      min: 0,
      max: 360,
      unit: "°",
      step: 15,
      onChange: function (g) {
        var f = (g / 180) * Math.PI;
        Designer.setFillStyle({ angle: f });
      },
    });
    $("#gradient_radius").spinner({
      min: 0,
      max: 100,
      unit: "%",
      step: 5,
      onChange: function (f) {
        Designer.setFillStyle({ radius: f / 100 });
      },
    });
    $("#fill_change_img").button({
      onClick: function () {
        UI.showImageSelect(function (g, f, i) {
          Designer.setFillStyle({
            type: "image",
            fileId: g,
            imageW: f,
            imageH: i,
          });
        });
      },
    });
    $("#fill_img_display").button({
      onMousedown: function () {
        $("#img_display_list").dropdown({
          target: $("#fill_img_display"),
          onSelect: function (g) {
            var f = g.attr("ty");
            $("#fill_img_display").button("setText", g.text());
            Designer.setFillStyle({ display: f });
          },
        });
      },
    });
    $("#spinner_opacity").spinner({
      min: 0,
      max: 100,
      unit: "%",
      step: 5,
      onChange: function (f) {
        Designer.setShapeStyle({ alpha: f / 100 });
      },
    });
    $("#dock_metric_x").spinner({
      min: -800,
      unit: "px",
      step: 5,
      onChange: function (f) {
        Designer.setShapeProps({ x: f });
      },
    });
    $("#dock_metric_x").spinner("setValue", "0px");
    $("#dock_metric_w").spinner({
      min: 20,
      unit: "px",
      step: 5,
      onChange: function (f) {
        Designer.setShapeProps({ w: f });
      },
    });
    $("#dock_metric_y").spinner({
      min: -800,
      unit: "px",
      step: 5,
      onChange: function (f) {
        Designer.setShapeProps({ y: f });
      },
    });
    $("#dock_metric_y").spinner("setValue", "0px");
    $("#dock_metric_h").spinner({
      min: 20,
      unit: "px",
      step: 5,
      onChange: function (f) {
        Designer.setShapeProps({ h: f });
      },
    });
    $("#dock_metric_angle").spinner({
      min: 0,
      max: 360,
      unit: "°",
      step: 15,
      onChange: function (g) {
        var f = (g / 180) * Math.PI;
        Designer.setShapeProps({ angle: f });
      },
    });
    $("#dock_page_size").button({
      onMousedown: function () {
        $("#page_size_list").dropdown({
          target: $("#dock_page_size"),
          onSelect: function (j) {
            var g = parseInt(j.attr("w"));
            var i = parseInt(j.attr("h"));
            Designer.setPageStyle({ width: g, height: i });
            $("#dock_page_size").button("setText", j.text());
          },
        });
        var f = $("#page_size_list").children(
          "li[w=" +
            Model.define.page.width +
            "][h=" +
            Model.define.page.height +
            "]"
        );
        if (f.length > 0) {
          $("#page_size_list").dropdown("select", f);
        } else {
          $("#page_size_list").dropdown("select", $("#dock_size_custom"));
        }
        $("#dock_size_w").spinner("setValue", Model.define.page.width + "px");
        $("#dock_size_h").spinner("setValue", Model.define.page.height + "px");
      },
    });
    $("#dock_size_w").spinner({
      min: 200,
      unit: "px",
      step: 100,
      onChange: function (f) {
        Designer.setPageStyle({ width: f });
      },
    });
    $("#dock_size_h").spinner({
      min: 200,
      unit: "px",
      step: 100,
      onChange: function (f) {
        Designer.setPageStyle({ height: f });
      },
    });
    $("#dock_page_padding").button({
      onMousedown: function () {
        $("#page_padding_list").dropdown({
          target: $("#dock_page_padding"),
          onSelect: function (g) {
            var h = parseInt(g.attr("p"));
            Designer.setPageStyle({ padding: h });
            $("#dock_page_padding").button("setText", g.text());
          },
        });
        var f = $("#page_padding_list").children(
          "li[p=" + Model.define.page.padding + "]"
        );
        $("#page_padding_list").dropdown("select", f);
      },
    });
    $("#dock_page_color").colorButton({
      position: "center",
      trans: true,
      onSelect: function (f) {
        Designer.setPageStyle({ backgroundColor: f });
      },
    });
    $(".dock_page_ori_list")
      .children("input")
      .unbind()
      .bind("click", function () {
        var f = $(this).val();
        Designer.setPageStyle({ orientation: f });
      });
    $(".dock_page_jumps_list")
      .children("input")
      .unbind()
      .bind("click", function () {
        var f = Model.define.page.lineJumps;
        var g = $(this).val() == "true" ? true : false;
        if (f == g) {
          return;
        }
        Designer.setPageStyle({ lineJumps: g });
        Designer.events.push("resetBrokenLinker", f);
      });
    $("#dock_page_showgrid").bind("change", function () {
      var f = $(this).is(":checked");
      Designer.setPageStyle({ showGrid: f });
      if (f) {
        $("#dock_gridsize_box").show();
      } else {
        $("#dock_gridsize_box").hide();
      }
    });
    $("#dock_page_gridsize").button({
      onMousedown: function () {
        $("#page_gridsize_list").dropdown({
          target: $("#dock_page_gridsize"),
          onSelect: function (h) {
            var g = parseInt(h.attr("s"));
            Designer.setPageStyle({ gridSize: g });
            $("#dock_page_gridsize").button("setText", h.text());
          },
        });
        var f = $("#page_gridsize_list").children(
          "li[s=" + Model.define.page.gridSize + "]"
        );
        $("#page_gridsize_list").dropdown("select", f);
      },
    });
    Dock.mindWaterMark.init();
    $("#btn_history_add").button({
      onClick: function () {
        Dock.toggleAddHistory();
      },
    });
    $("#btn_history_restore").button({
      onClick: function () {
        function h() {
          $(".dock_history_revert_con")
            .find("span:first")
            .off()
            .on("click", function (i) {
              Dock.restoreVersion();
              Dock.currentDefinition = null;
              $(".dock_history_revert_con").remove();
              Dock.currentDefinition = null;
              i.stopPropagation();
            });
          $(".dock_history_revert_con")
            .find("span:last")
            .off()
            .on("click", function (i) {
              $(".dock_history_revert_con").remove();
              $("#btn_history_restore").button("enable");
              i.stopPropagation();
            });
        }
        var f = $("#history_versions").children(".selected");
        var g = $(
          "<div class='dock_history_remove_con dock_history_revert_con'><div class='dock_history_remove_div'>确认还原至此历史版本？<div style='margin-top:5px;'><span class='toolbar_button active'>确定</span>&nbsp;&nbsp;<span class='toolbar_button active'>取消</span></div></div></div>"
        );
        g.appendTo(f);
        $("#btn_history_restore").button("disable");
        h();
      },
    });
    $("#txt_sub_comment").bind("keyup", function (j) {
      if (j.keyCode == 13) {
        var f = $(this);
        var i = f.val().replace(/\n/g, "");
        if (i.trim() == "") {
          return;
        }
        var l = "";
        var h = Utils.getSelectedShapeIds();
        if (h.length == 1) {
          l = h[0];
        }
        var k = {
          action: "comment",
          userId: userId,
          id: Utils.newId(),
          name: userName,
          content: i,
          shapeId: l,
          replyId: "",
        };
        CLB.send(k);
        Dock.appendComment(k);
        Dock.bindComment();
        $("#comment_container").scrollTop(9999);
        f.val("");
        if (!Model.comments) {
          Model.comments = [];
        }
        Model.comments.push(k);
        if (l != "") {
          var g = Model.getShapeById(l);
          Designer.painter.renderShape(g);
        }
      }
    });
    $("#show_comment_ico").bind("click", function (h) {
      var f = $("#show_comment_ico").is(":checked");
      CLB.setConfig("showCommentIco", f);
      showCommentIco = f;
      for (var i in Model.define.elements) {
        var g = Model.getShapeById(i);
        if (g.name != "linker") {
          Designer.painter.renderShape(g);
        }
      }
    });
    if (dock != "none") {
      if (dock == "") {
        dock = "navigator";
      }
      this.showView(dock);
    }
  },
  currentView: "",
  showView: function (a, b) {
    if ($("#dock_btn_" + a).button("isDisabled")) {
      return;
    }
    $(".dock_view").hide();
    $(".dock_view_" + a).show();
    $(".dock_buttons").children().removeClass("selected");
    $("#dock_btn_" + a).addClass("selected");
    if (Dock.currentView == "history" && a != "history") {
      Dock.closeHistory();
    }
    this.currentView = a;
    this.update(true);
    if (b) {
      CLB.setConfig("dock", a);
    }
  },
  showViewWithEmbed: function (a, b) {
    $(".dock_view").hide();
    $(".dock_view_" + a).show();
    this.currentView = a;
    this.update(true);
  },
  setFillStyle: function (a) {
    $("#dock_fill_type").button(
      "setText",
      $("#dock_fill_list")
        .children("li[ty=" + a.type + "]")
        .text()
    );
    $(".fill_detail").hide();
    if (a.type == "solid") {
      $(".fill_detail_solid").show();
      $("#fill_solid_btn").colorButton("setColor", a.color);
    } else {
      if (a.type == "gradient") {
        $(".fill_detail_gradient").show();
        $("#fill_gradient_begin")
          .attr("c", a.beginColor)
          .colorButton("setColor", a.beginColor);
        $("#fill_gradient_end")
          .attr("c", a.endColor)
          .colorButton("setColor", a.endColor);
        $("#gradient_type").button(
          "setText",
          $("#gradient_type_list")
            .children("li[ty=" + a.gradientType + "]")
            .text()
        );
        $(".gradient_details").hide();
        if (a.gradientType == "linear") {
          $("#gradient_type_linear").show();
          $("#gradient_angle").spinner(
            "setValue",
            Math.round((a.angle / Math.PI) * 180) + "°"
          );
        } else {
          $("#gradient_type_radial").show();
          $("#gradient_radius").spinner(
            "setValue",
            Math.round(a.radius * 100) + "%"
          );
        }
      } else {
        if (a.type == "image") {
          $(".fill_detail_image").show();
          var b = "fill";
          if (a.display) {
            b = a.display;
          }
          $("#fill_img_display").button(
            "setText",
            $("#img_display_list")
              .children("li[ty=" + b + "]")
              .text()
          );
        }
      }
    }
  },
  update: function (l) {
    if (this.currentView == "navigator") {
      if (l) {
        Navigator.draw();
      }
      $("#dock_zoom").spinner(
        "setValue",
        Math.round(Designer.config.scale * 100) + "%"
      );
    } else {
      if (this.currentView == "graphic") {
        var j = Utils.getSelectedIds();
        var m = j.length;
        var g = Utils.getSelectedShapeIds();
        var f = g.length;
        if (m == 0) {
          $("#dock_line_color").button("disable");
          $("#dock_line_style").button("disable");
          $("#dock_line_width").button("disable");
        } else {
          $("#dock_line_color").button("enable");
          $("#dock_line_style").button("enable");
          $("#dock_line_width").button("enable");
          var a = Model.getShapeById(j[0]);
          var c;
          if (a.name == "linker") {
            c = Utils.getLinkerLineStyle(a.lineStyle);
          } else {
            c = Utils.getShapeLineStyle(a.lineStyle);
          }
          $("#dock_line_color").colorButton("setColor", c.lineColor);
          var p = $("#line_style_list")
            .children("li[line=" + c.lineStyle + "]")
            .children()
            .attr("class");
          $("#dock_line_style").children(".linestyle").attr("class", p);
          $("#dock_line_width").spinner("setValue", c.lineWidth + "px");
        }
        if (f == 0) {
          $("#dock_fill_type").button("disable");
          $("#spinner_opacity").button("disable");
          Dock.setFillStyle({ type: "none" });
        } else {
          $("#dock_fill_type").button("enable");
          $("#spinner_opacity").button("enable");
          var a = Model.getShapeById(g[0]);
          var k = Utils.getShapeFillStyle(a.fillStyle);
          Dock.setFillStyle(k);
          $("#spinner_opacity").spinner(
            "setValue",
            Math.round((a.shapeStyle.alpha / 1) * 100) + "%"
          );
        }
      } else {
        if (this.currentView == "metric") {
          var g = Utils.getSelectedShapeIds();
          var f = g.length;
          if (f == 0) {
            $("#dock_metric_x").button("disable");
            $("#dock_metric_w").button("disable");
            $("#dock_metric_y").button("disable");
            $("#dock_metric_h").button("disable");
            $("#dock_metric_angle").button("disable");
          } else {
            var a = Model.getShapeById(g[0]);
            $("#dock_metric_x")
              .button("enable")
              .spinner("setValue", Math.round(a.props.x) + "px");
            $("#dock_metric_w")
              .button("enable")
              .spinner("setValue", Math.round(a.props.w) + "px");
            $("#dock_metric_y")
              .button("enable")
              .spinner("setValue", Math.round(a.props.y) + "px");
            $("#dock_metric_h")
              .button("enable")
              .spinner("setValue", Math.round(a.props.h) + "px");
            if (a.category == "lane") {
              $("#dock_metric_x").button("disable");
              $("#dock_metric_w").button("disable");
              $("#dock_metric_y").button("disable");
              $("#dock_metric_h").button("disable");
              $("#dock_metric_angle").button("disable");
            } else {
              $("#dock_metric_angle")
                .button("enable")
                .spinner(
                  "setValue",
                  Math.round((a.props.angle / Math.PI) * 180) + "°"
                );
            }
          }
        } else {
          if (this.currentView == "page") {
            var i = Model.define.page;
            var o = i.width;
            var s = i.height;
            var b = $("#page_size_list").children(
              "li[w=" + o + "][h=" + s + "]"
            );
            var r = "";
            if (b.length > 0) {
              r = b.text();
            } else {
              r = $("#dock_size_custom").text();
            }
            $("#dock_page_size").button("setText", r);
            $("#dock_page_padding").button("setText", i.padding + "px");
            $("#dock_page_color").colorButton("setColor", i.backgroundColor);
            $("#dock_page_showgrid").attr("checked", i.showGrid);
            if (i.showGrid) {
              $("#dock_gridsize_box").show();
            } else {
              $("#dock_gridsize_box").hide();
            }
            var n = "";
            var q = $("#page_gridsize_list").children(
              "li[s=" + i.gridSize + "]"
            );
            if (q.length > 0) {
              var n = q.text();
            }
            $("#dock_page_gridsize").button("setText", n);
            var e = "portrait";
            if (Model.define.page.orientation) {
              e = Model.define.page.orientation;
            }
            $(".dock_page_ori_list")
              .children("input[value=" + e + "]")
              .attr("checked", true);
            var d = false;
            if (Model.define.page.lineJumps == true) {
              d = true;
            }
            $(".dock_page_jumps_list")
              .children("input[value=" + d + "]")
              .attr("checked", true);
            if (typeof firstWatermarkSet == "undefined") {
              if (i.watermark && i.watermark != "") {
                $("#watermark_input").val(
                  $("<span/>").html(i.watermark).text()
                );
              }
              firstWatermarkSet = false;
            }
          } else {
            if (this.currentView == "attribute") {
              var j = Utils.getSelectedIds();
              var m = j.length;
              if (m != 1) {
                $(".attr_list").html(
                  "<li class='attr_none'>选择一个图形后，在这里查看数据属性</li>"
                );
                $(".attr_add").hide();
                this.fitAttrList();
              } else {
                this.setAttributeList();
                $(".attr_add").show();
                this.cancelAttrAdd();
              }
            } else {
              if (this.currentView == "history") {
                if (l && Dock.historyVersions == null) {
                  this.loadHistorys();
                }
              } else {
                if (this.currentView == "comment") {
                  this.loadComments();
                  if (showCommentIco) {
                    $("#show_comment_ico").attr("checked", true);
                  } else {
                    $("#show_comment_ico").attr("checked", false);
                  }
                }
              }
            }
          }
        }
      }
    }
  },
  historyVersions: null,
  automation: false,
  splitDate: function (b) {
    if (b == "") {
      return;
    }
    var d = "";
    var a = b.split(" ");
    if (a[0].indexOf("-") >= 0) {
      var c = a[0].split("-");
      if (new Date().getFullYear() == c[0]) {
        d = c[1] + "-" + c[2];
      } else {
        d = c;
      }
    }
    if (a[1].indexOf(":") >= 0) {
      var c = a[1].split(":");
      d += " " + c[0] + ":" + c[1];
    }
    return d;
  },
  switchCheck: function () {
    var a = document.getElementById("switch").checked;
    if (!a) {
      $(".switch-tip").text("显示自己创建的版本记录");
    } else {
      $(".switch-tip").text("显示全部版本记录");
    }
    Dock.automation = !a;
    if (this.currentDefinition != null) {
      Dock.closeHistory();
    }
    Dock.loadHistorys();
  },
  loadingHistory: false,
  historyPage: 0,
  loadHistorys: function (a) {
    var b = $("#history_versions"),
      d = "";
    if (a) {
      this.historyPage = 0;
    }
    var c = ++this.historyPage;
    if (chartId == "") {
      $("#history_container").html(
        "<div style='padding: 20px 10px;'>您正在试用状态，无法浏览历史版本</div>"
      );
      return;
    }
    if (b.length == 0) {
      b = $('<ul id="history_versions"><ul>').appendTo($("#history_container"));
      b.after(
        '<button id="history_more" class="toolbar_button active">加载更多<span class="icons rotate1">&#xe635;</span></button>'
      );
    }
    var e = { chartId: chartId, page: c };
    if (this.loadingHistory) {
      return;
    }
    this.loadingHistory = true;
    $("#history_more").find(".icons").css("display", "inline-block");
    $.ajax({
      url: "/diagraming/get_versions",
      data: e,
      cache: false,
      success: function (k) {
        Dock.historyVersions = "loaded";
        var j = k.list || [];
        if (j.length <= 0) {
          $("#history_more").hide();
        }
        if (a) {
          Dock.historyPage = -1;
          b.html("");
        }
        for (var h = 0, f = j.length; h < f; h++) {
          var g = j[h],
            l = g.id;
          if (!Dock.automation) {
            d +=
              '<li vid="' +
              l +
              '" def="' +
              g.id +
              '"><div class="history_remark">' +
              g.remark +
              '<span class="ico dlg_close dock_history_remove"></span></div><div class="version_name"><span>' +
              g.user.name +
              '</span><span style="margin-left: 5px;">' +
              new Date(g.createTime).toLocaleString() +
              "</span></div></li>";
          } else {
            if (g.remark != "自动存储") {
              d +=
                '<li vid="' +
                l +
                '" def="' +
                g.id +
                '"><div class="history_remark">' +
                g.remark +
                '<span class="ico dlg_close dock_history_remove"></span></div><div class="version_name"><span>' +
                g.user.name +
                '</span><span style="margin-left: 5px;">' +
                new Date(g.createTime).toLocaleString() +
                "</span></div></li>";
            }
          }
          if (h == 0 && j.length == c) {
            $("#history_more").css("display", "block");
          }
        }
        b.append(d);
        if ($("#history_versions li").length > 0) {
          $("#history-none-tip").hide();
        } else {
          $("#history-none-tip").show();
        }
        Dock.resetVersions();
        Dock.initRemoveHistory();
        Dock.loadingHistory = false;
      },
      complete: function () {
        $("#history_more").removeClass("disable");
        $("#history_more").find(".icons").css("display", "none");
      },
    });
  },
  resetVersions: function () {
    if ($("#history_versions").length == 0) {
      return;
    }
    $("#history_versions")
      .children("li")
      .off()
      .on("click", function () {
        if ($(this).hasClass("selected")) {
          Dock.closeHistory();
        } else {
          $("#history_versions").children(".selected").removeClass("selected");
          $(this).addClass("selected");
          var a = $(this).attr("def");
          Dock.showHistoryVersion(a);
        }
        var b = $("#history_versions").children(".selected");
        if (b.length != 0 && b.attr("ind") != "0") {
          $("#btn_history_restore").button("enable");
        } else {
          $("#btn_history_restore").button("disable");
        }
      });
  },
  toggleAddHistory: function () {
    $(".area_history").toggle();
    if ($("#area_history_add").is(":visible")) {
      $("#history_remark").focus();
    }
  },
  addHistory: function () {
    if (chartId != "") {
      var a = $("#history_remark").val();
      if (!a.trim()) {
        $("#history_remark").focus();
        return false;
      }
      CLB.saveVersion(a);
    }
  },
  initRemoveHistory: function () {
    function a() {
      $(".dock_history_remove_div")
        .find("span:first")
        .off()
        .on("click", function (d) {
          var c = $(this).parents("li");
          if (c.hasClass("selected")) {
            return;
          }
          var b = c.attr("vid");
          if (chartId != "") {
            $.ajax({
              url: "/diagraming/del_version",
              type: "POST",
              data: { id: b },
              cache: false,
              success: function (e) {
                c.remove();
                if ($("#history_versions li").length < 1) {
                  $("#history-none-tip").show();
                }
              },
            });
          }
          d.stopPropagation();
        });
      $(".dock_history_remove_div")
        .find("span:last")
        .off()
        .on("click", function (b) {
          $(".dock_history_remove_con").remove();
          b.stopPropagation();
        });
    }
    $(".dock_history_remove")
      .off()
      .on("click", function (f) {
        $(".dock_history_remove_con").remove();
        var c = $(this).parent().parent();
        if (c.hasClass("selected")) {
          f.stopPropagation();
          return;
        }
        var b = c.attr("vid");
        var d = $(
          "<div class='dock_history_remove_con'><div class='dock_history_remove_div'>确认删除此历史版本？<div style='margin-top:5px;'><span class='toolbar_button active'>确定</span>&nbsp;&nbsp;<span class='toolbar_button active'>取消</span></div></div></div>"
        );
        d.appendTo(c);
        a();
        f.stopPropagation();
      });
    $("#history_more").button({
      onClick: function () {
        $("#history_more").addClass("disable");
        Dock.loadHistorys();
      },
    });
  },
  showHistoryVersion: function (a) {
    $("#btn_history_restore").button("disable");
    $.ajax({
      url: "/diagraming/get_versiondef",
      data: { id: a },
      success: function (b) {
        if (b.def == null) {
          return;
        }
        Dock.openHistory(b.def);
        $("#btn_history_restore").button("enable");
        UI.showTip(
          "您在正浏览一个历史版本<a href='javascript:' style='margin-left: 10px;color:#fff;text-decoration:underline;' onclick='Dock.closeHistory()'>点击退出</a>"
        );
      },
    });
  },
  currentDefinition: null,
  openHistory: function (a) {
    if (this.currentDefinition == null) {
      this.currentDefinition = $.extend(true, {}, Model.define);
    }
    Utils.unselect();
    Designer.open(a);
    Designer.hotkey.cancel();
    Designer.op.cancel();
    $("#menu_bar").children().addClass("readonly");
    $(".diagram_title").addClass("readonly");
    $(".dock_buttons").children().addClass("disabled");
    $("#dock_btn_history").removeClass("disabled");
    $(".panel_box").addClass("readonly");
  },
  closeHistory: function () {
    if (this.currentDefinition != null) {
      Designer.open(this.currentDefinition);
      this.currentDefinition = null;
      this.activeOperation();
      UI.hideTip();
    }
  },
  activeOperation: function () {
    Designer.hotkey.init();
    Designer.op.init();
    $("#menu_bar").children().removeClass("readonly");
    $(".diagram_title").removeClass("readonly");
    $(".dock_buttons").children().removeClass("disabled");
    $("#dock_btn_history").removeClass("disabled");
    $(".panel_box").removeClass("readonly");
    $("#history_versions").children(".selected").removeClass("selected");
    $("#btn_history_restore").button("disable");
  },
  restoreVersion: function () {
    var d = $("#history_versions").children(".selected");
    if (d.length) {
      MessageSource.beginBatch();
      var e = Dock.currentDefinition.elements;
      var f = [];
      if (e) {
        for (var h in e) {
          f.push(e[h]);
        }
      }
      MessageSource.send("remove", f);
      var b = {
        page: Utils.copy(Dock.currentDefinition.page),
        update: Utils.copy(Model.define.page),
      };
      MessageSource.send("updatePage", b);
      var a = Model.define.elements;
      var c = [];
      if (a) {
        for (var h in a) {
          c.push(a[h]);
        }
      }
      MessageSource.send("create", c);
      var g = {
        theme: Utils.copy(Dock.currentDefinition.theme),
        update: Utils.copy(Model.define.theme),
      };
      MessageSource.send("setTheme", g);
      MessageSource.commit();
      Dock.activeOperation();
      UI.hideTip();
      $("#btn_history_clear").button("disable");
      $("#history_versions").find("input[type=checkbox]").prop("checked", "");
    }
  },
  currentCommentId: "-1",
  commentOperate: "",
  loadComments: function () {
    if (this.commentOperate == "viewing_comment") {
      return;
    }
    var d = $("#comment_container");
    var c = Utils.getSelectedShapeIds();
    var e;
    if (c.length == 1) {
      e = c[0];
    } else {
      e = "";
    }
    if (this.currentCommentId != e) {
      this.currentCommentId = e;
      if (!Model.comments || Model.comments.length == 0) {
        d.html("<div class='comment_none'>暂时没有评论</div>");
      } else {
        d.empty();
        for (var b = 0; b < Model.comments.length; b++) {
          var a = Model.comments[b];
          if (a.shapeId == e || e == "") {
            Dock.appendComment(a);
          }
        }
        Dock.bindComment();
        Dock.fitComments();
      }
    }
  },
  bindComment: function () {
    var a = $("#comment_container");
    a.find("input")
      .unbind("click")
      .bind("click", function (b) {
        b.stopPropagation();
      });
    a.find(".input_comment_reply")
      .unbind("keydown")
      .bind("keydown", function (d) {
        if (d.keyCode == 13) {
          var c = $(this).val();
          if (c == "") {
            return;
          }
          $(this).val("");
          var b = $(this).parent().parent().parent().attr("id");
          var f = {
            action: "comment",
            userId: userId,
            id: Utils.newId(),
            name: userName,
            content: c,
            shapeId: "",
            replyId: b,
          };
          CLB.send(f);
          Dock.appendComment(f);
          Dock.bindComment();
        }
        Dock.fitComments();
      });
    a.find(".comment_remove")
      .unbind("click")
      .bind("click", function (g) {
        g.stopPropagation();
        $(this).parent().remove();
        var k = $(this).parent().attr("id");
        var h = { action: "removeComment", id: k };
        CLB.send(h);
        Dock.fitComments();
        var f = [];
        for (var d = 0; d < Model.comments.length; d++) {
          var c = Model.comments[d];
          if (c.id != k && c.replyId != k) {
            f.push(c);
          }
        }
        Model.comments = f;
        var j = $(this).parent().attr("shapeId");
        var b = Model.getShapeById(j);
        if (b != null && b.name != "linker") {
          Designer.painter.renderShape(b);
        }
      });
    a.children(".comment_item_outer")
      .unbind()
      .bind("click", function () {
        if ($(this).hasClass("selected")) {
          $(this).removeClass("selected");
        } else {
          a.children(".selected").removeClass("selected");
          $(this).addClass("selected");
        }
        var c = $(this).attr("shapeId");
        Dock.commentOperate = "viewing_comment";
        if (c) {
          var b = Model.getShapeById(c);
          if (b != null) {
            Utils.selectShape(c);
          }
        }
        Dock.fitComments();
        Dock.commentOperate = "";
      });
  },
  fitComments: function () {
    var c = $("#comment_container");
    var e = c.scrollTop();
    c.height("auto");
    var d = c.offset().top;
    var b = d + c.height() + 145;
    if (b > $(window).height()) {
      var a = $(window).height() - d - 145;
      if (a < 120) {
        a = 120;
      }
      c.height(a);
    } else {
      c.height("auto");
    }
    c.scrollTop(e);
  },
  appendComment: function (a) {
    $(".comment_none").remove();
    var b = $("<div class='comment_item' id='" + a.id + "'></div>").appendTo(e);
    if (a.replyId) {
      var e = $("#comment_container")
        .children("#" + a.replyId + ".comment_item")
        .find(".comment_reply_list");
      b = $(
        "<div class='comment_item comment_item_inner' id='" + a.id + "'></div>"
      ).appendTo(e);
    } else {
      var e = $("#comment_container");
      b = $(
        "<div class='comment_item comment_item_outer' id='" + a.id + "'></div>"
      ).appendTo(e);
    }
    if (role == "owner" || a.userId == userId) {
      b.append(
        "<div class='ico comment_remove' disableTitle='true' title='删除'></div>"
      );
    }
    if (a.shapeId) {
      b.attr("shapeId", a.shapeId);
    }
    b.append("<img src='/photo/" + a.userId + ".png'/>");
    var c = $("<div class='comment_content_box'></div>").appendTo(b);
    c.append("<div class='comment_name'>" + a.name + "</div>");
    c.append("<div class='comment_content'>" + a.content + "</div>");
    var g = new Date();
    if (a.time) {
      g.setTime(a.time);
    }
    var f = g.format(dateFormat);
    c.append("<div class='comment_date'>" + f + "</div>");
    if (!a.replyId) {
      c.append("<div class='comment_reply_list'></div>");
      c.append(
        "<div class='comment_reply'><input type='text' class='input_text input_comment_reply' placeholder='回复此评论...'/></div>"
      );
    }
    Dock.fitComments();
  },
  setAttributeList: function () {
    var c = Utils.getSelectedIds();
    var b = Model.getShapeById(c[0]);
    $(".attr_list").empty();
    if (b.dataAttributes) {
      for (var d = 0; d < b.dataAttributes.length; d++) {
        var a = b.dataAttributes[d];
        var f = $("#attr_add_type")
          .children("option[value=" + a.type + "]")
          .text();
        var e = $(
          "<li id='" +
            a.id +
            "' class='attr_item attr_item_" +
            a.id +
            "' onclick=\"Dock.editAttr('" +
            a.id +
            "')\"><div class='attr_name'>" +
            Util.filterXss(a.name) +
            "</div><div class='attr_type'>" +
            f +
            "</div><div class='attr_value'>" +
            Util.filterXss(a.value) +
            "</div><div style='clear: both'></div></li>"
        ).appendTo($(".attr_list"));
        if (a.category != "default") {
          e.append(
            "<div class='ico ico_attr_delete' onclick=\"Dock.deleteAttr('" +
              a.id +
              "', event)\"></div>"
          );
        }
      }
    }
    this.fitAttrList();
  },
  fitAttrList: function () {
    var b = $(".attr_list").scrollTop();
    $(".attr_list").height("auto");
    var d = $(".attr_list").offset().top;
    var c = d + $(".attr_list").height() + 10;
    if (c > $(window).height()) {
      var a = $(window).height() - d - 10;
      if (a < 140) {
        a = 140;
      }
      $(".attr_list").height(a);
    } else {
      $(".attr_list").height("auto");
    }
    $(".attr_list").scrollTop(b);
  },
  showAttrAdd: function () {
    $("#attr_add_btn").hide();
    $(".attr_add_items").show();
    $("#attr_add_name").val("").focus();
    $("#attr_add_type").val("string");
    $("#attr_add_type")
      .unbind()
      .bind("change", function () {
        Dock.setAttrValueInput(null, $(this).val());
      });
    Dock.setAttrValueInput(null, "string");
    this.fitAttrList();
  },
  saveAttrAdd: function () {
    var a = $("#attr_add_name").val();
    if (a == "") {
      $("#attr_add_name").focus();
      return;
    }
    var b = $("#attr_add_type").val();
    var c = $("#attr_add_value_arera").children().val();
    c = Util.filterXss(c);
    a = Util.filterXss(a);
    var d = { name: a, type: b, value: c };
    Designer.addDataAttribute(d);
    this.setAttributeList();
    this.showAttrAdd();
  },
  cancelAttrAdd: function () {
    $("#attr_add_btn").show();
    $(".attr_add_items").hide();
    this.fitAttrList();
  },
  editAttr: function (f) {
    var m = $(".attr_item_" + f);
    if (m.hasClass("attr_editing")) {
      return;
    }
    if ($(".attr_editing").length > 0) {
      var c = $(".attr_editing").attr("id");
      this.saveAttrEdit(c);
    }
    m = $(".attr_item_" + f);
    m.addClass("attr_editing");
    var g = Designer.getDataAttrById(f);
    var j = this.setAttrValueInput(g, g.type);
    j.val(g.value).select();
    if (g.category != "default") {
      var h = m.children(".attr_name");
      h.empty();
      var l = $(
        "<input type='text' class='input_text' style='width: 88px'/>"
      ).appendTo(h);
      l.val(g.name).select();
      var b = m.children(".attr_type");
      b.empty();
      var i = $(
        "<select class='input_select' style='width: 60px'></select>"
      ).appendTo(b);
      i.html($("#attr_add_type").html()).val(g.type);
      i.bind("change", function () {
        Dock.setAttrValueInput(g, $(this).val());
      });
    }
    var k = $("<div class='attr_edit_display'></div>").appendTo(m);
    k.append("<div class='dock_label'>显示为：</div>");
    k.append(
      "<div id='attr_edit_showtype' class='toolbar_button active btn_inline' style='width: 75px;'><div class='text_content'></div><div class='ico ico_dropdown'></div></div>"
    );
    k.append("<div style='clear: both'></div>");
    k.append("<div class='attr_display_options'></div>");
    this.appendDisplayItems();
    var e = "none";
    if (g.showType) {
      e = g.showType;
    }
    this.setAttrDisplay(e);
    $("#attr_edit_showtype")
      .attr("ty", e)
      .button({
        onMousedown: function () {
          $("#attr_display_list").dropdown({
            target: $("#attr_edit_showtype"),
            onSelect: function (p) {
              var o = p.attr("ty");
              $("#attr_edit_showtype")
                .attr("ty", o)
                .button("setText", p.text());
              Dock.setAttrDisplay(o);
            },
          });
          var n = $("#attr_edit_showtype").text().trim();
          $("#attr_display_list")
            .children()
            .each(function () {
              if ($(this).text() == n) {
                $("#attr_display_list").dropdown("select", $(this));
                return false;
              }
            });
        },
      });
    $("#attr_edit_showtype")
      .attr("ty", e)
      .button(
        "setText",
        $("#attr_display_list")
          .children("li[ty=" + e + "]")
          .html()
      );
    if (e != "none") {
      $("#attr_display_name").attr("checked", g.showName);
      if (e == "icon") {
        this.setAttrIcon(g.icon);
      }
    }
    var a = "mostright";
    if (g.horizontal) {
      a = g.horizontal;
    }
    var d = "mostbottom";
    if (g.vertical) {
      d = g.vertical;
    }
    $("#attr_location_h").button(
      "setText",
      $("#attr_location_h_list")
        .children("li[loc=" + a + "]")
        .html()
    );
    $("#attr_location_h").attr("loc", a);
    $("#attr_location_v").button(
      "setText",
      $("#attr_location_v_list")
        .children("li[loc=" + d + "]")
        .html()
    );
    $("#attr_location_v").attr("loc", d);
    m.append(
      "<div class='attr_edit_btns'><div id='save_edit_attr' class='toolbar_button active'>确定</div><div id='cancel_edit_attr' class='toolbar_button active' style='margin-left: 5px;'>取消</div></div>"
    );
    $("#save_edit_attr").bind("click", function (n) {
      n.stopPropagation();
      Dock.saveAttrEdit(f);
    });
    $("#cancel_edit_attr").bind("click", function (n) {
      n.stopPropagation();
      Dock.setAttributeList();
    });
  },
  setAttrValueInput: function (c, e) {
    var b;
    if (c != null) {
      b = $(".attr_editing").children(".attr_value");
    } else {
      b = $("#attr_add_value_arera");
    }
    b.empty();
    var a;
    if (e == "boolean") {
      a = $(
        "<select class='input_select'><option value=''></option><option value='true'>true</option><option value='false'>false</option></select>"
      ).appendTo(b);
    } else {
      if (e == "list") {
        a = $("<select class='input_select'></select>").appendTo(b);
        if (c.listItems) {
          for (var d = 0; d < c.listItems.length; d++) {
            var f = c.listItems[d];
            a.append("<option value='" + f + "'>" + f + "</option>");
          }
        }
      } else {
        a = $("<input type='text' class='input_text'/>").appendTo(b);
      }
    }
    if (c == null) {
      b.children().css("width", "260px");
    } else {
      b.children().css("width", "128px");
    }
    return a;
  },
  appendDisplayItems: function () {
    var e = $(".attr_display_options");
    var f = $("<div class='opt_area'></div>").appendTo(e);
    f.append(
      "<input id='attr_display_name' type='checkbox'/><label for='attr_display_name'>显示属性名</label>"
    );
    var d = $(
      "<div id='attr_icon_area' style='padding-top:5px;'></div>"
    ).appendTo(f);
    d.append("<div class='dock_label'>图标：</div>");
    d.append(
      "<div id='attr_display_icon' ico='' class='toolbar_button active btn_inline' style='width: 50px'><div class='text_content'></div><div class='ico ico_dropdown'></div></div>"
    );
    d.append("<div style='clear: both'></div>");
    if ($("#attr_icon_list").children("li").html() == "") {
      var b = "";
      var a = 1;
      while (a <= 49) {
        if (a == 30) {
          b += "<div></div>";
        }
        b +=
          "<div onmousedown='Dock.setAttrIcon(" +
          a +
          ")' class='attr_icon_item'></div>";
        a++;
      }
      $("#attr_icon_list").children("li").html(b);
    }
    var c = $("<div class='opt_area location_area'></div>").appendTo(e);
    c.append("<div>显示位置：</div>");
    c.append("<div class='dock_label'>水平：</div>");
    c.append(
      "<div id='attr_location_h' class='toolbar_button active btn_inline' loc='mostright'><div class='text_content location_content'><div><span style='left: 11px'></span></div>Most Right</div><div class='ico ico_dropdown'></div></div>"
    );
    c.append("<div style='clear: both'></div>");
    c.append("<div class='dock_label'>垂直：</div>");
    c.append(
      "<div id='attr_location_v' class='toolbar_button active btn_inline' loc='mostbottom'><div class='text_content location_content'><div><span style='top: 11px'></span></div>Most Bottom</div><div class='ico ico_dropdown'></div></div>"
    );
    c.append("<div style='clear: both'></div>");
    e.append("<div style='clear: both'></div>");
    $("#attr_display_icon").button({
      onMousedown: function () {
        $("#attr_icon_list").dropdown({ target: $("#attr_display_icon") });
      },
    });
    $("#attr_location_h").button({
      onMousedown: function () {
        $("#attr_location_h_list").dropdown({
          target: $("#attr_location_h"),
          onSelect: function (g) {
            $("#attr_location_h").button("setText", g.html());
            $("#attr_location_h").attr("loc", g.attr("loc"));
          },
        });
      },
    });
    $("#attr_location_v").button({
      onMousedown: function () {
        $("#attr_location_v_list").dropdown({
          target: $("#attr_location_v"),
          onSelect: function (g) {
            $("#attr_location_v").button("setText", g.html());
            $("#attr_location_v").attr("loc", g.attr("loc"));
          },
        });
      },
    });
  },
  setAttrDisplay: function (a) {
    if (a == "none") {
      $(".attr_display_options").hide();
    } else {
      $(".attr_display_options").show();
      if (a == "icon") {
        $("#attr_icon_area").show();
      } else {
        $("#attr_icon_area").hide();
      }
    }
  },
  setAttrIcon: function (a) {
    $("#attr_display_icon").attr("ico", a).button("setText", "");
    if (a) {
      $("#attr_display_icon").button(
        "setText",
        "<img src='/images/data-attr/" + a + ".png'/>"
      );
    }
  },
  saveAttrEdit: function (f) {
    var j = $(".attr_item_" + f);
    if (!j.hasClass("attr_editing")) {
      return;
    }
    var i = Designer.getDataAttrById(f);
    if (i.category != "default") {
      var a = j.children(".attr_name").children("input").val();
      if (a == "") {
        j.children(".attr_name").children("input").focus();
        return;
      }
      i.name = a;
      i.type = j.children(".attr_type").children("select").val();
    }
    i.value = j.children(".attr_value").children().val();
    var d = $("#attr_edit_showtype").attr("ty");
    i.showType = d;
    if (d != "none") {
      i.showName = $("#attr_display_name").is(":checked");
      i.horizontal = $("#attr_location_h").attr("loc");
      i.vertical = $("#attr_location_v").attr("loc");
      if (d == "icon") {
        i.icon = $("#attr_display_icon").attr("ico");
      }
    }
    var g = Utils.getSelectedIds();
    var h = Model.getShapeById(g[0]);
    if (i.category == "default" && h.category == "bpmn") {
      if (!h.attribute) {
        h.attribute = {};
      }
      if (!h.attribute.markers) {
        h.attribute.markers = [];
      }
      var c = h.attribute.markers;
      if (i.name == "loopCharacteristics" || i.name == "循环特征") {
        Utils.removeFromArray(c, "loop");
        Utils.removeFromArray(c, "sequential");
        Utils.removeFromArray(c, "parallel");
        if (i.value == "StandardLoopCharacteristics" || i.value == "标准") {
          Utils.addToArray(c, "loop");
        } else {
          if (i.value == "MultipleLoopCharacteristics" || i.value == "多例") {
            var b = Designer.getDefaultDataAttrByName("isSequantial");
            if (b == null) {
              b = Designer.getDefaultDataAttrByName("是否为序列");
            }
            if (b != null) {
              if (b.value == "true") {
                Utils.addToArray(c, "sequential");
              } else {
                Utils.addToArray(c, "parallel");
              }
            }
          }
        }
      } else {
        if (i.name == "isSequantial" || i.name == "是否为序列") {
          Utils.removeFromArray(c, "sequential");
          Utils.removeFromArray(c, "parallel");
          var e = Designer.getDefaultDataAttrByName("loopCharacteristics");
          if (e == null) {
            e = Designer.getDefaultDataAttrByName("循环特征");
          }
          if (
            e != null &&
            (e.value == "MultipleLoopCharacteristics" || e.value == "多例")
          ) {
            if (i.value == "true") {
              Utils.addToArray(c, "sequential");
            } else {
              Utils.addToArray(c, "parallel");
            }
          }
        } else {
          if (i.name == "isForCompensation" || i.name == "是否为补偿") {
            Utils.removeFromArray(c, "compensation");
            if (i.value == "true") {
              Utils.addToArray(c, "compensation");
            }
          } else {
            if (
              i.name == "isCollection" ||
              i.name == "participantMultiplicity" ||
              i.name == "是否为集合" ||
              i.name == "多重参与者"
            ) {
              Utils.removeFromArray(c, "parallel");
              if (i.value == "true") {
                Utils.addToArray(c, "parallel");
              }
            } else {
              if (i.name == "loopType" || i.name == "循环类型") {
                Utils.removeFromArray(c, "loop");
                Utils.removeFromArray(c, "sequential");
                Utils.removeFromArray(c, "parallel");
                if (i.value == "Standard" || i.value == "标准") {
                  Utils.addToArray(c, "loop");
                } else {
                  if (
                    i.value == "MultiInstanceSequential" ||
                    i.value == "实例化多例序列"
                  ) {
                    Utils.addToArray(c, "sequential");
                  } else {
                    if (
                      i.value == "MultiInstanceParallel" ||
                      i.value == "实例化多例并行"
                    ) {
                      Utils.addToArray(c, "parallel");
                    }
                  }
                }
              }
            }
          }
        }
      }
    }
    i.value = Util.filterXss(i.value);
    i.name = Util.filterXss(i.name);
    Designer.updateDataAttribute(i);
    this.setAttributeList();
  },
  deleteAttr: function (c, b) {
    b.stopPropagation();
    var a = $(".attr_item_" + c);
    a.remove();
    this.fitAttrList();
    Designer.deleteDataAttribute(c);
  },
  fullScreen: function (a, b) {
    if (a.requestFullscreen) {
      a.requestFullscreen();
    } else {
      if (a.mozRequestFullScreen) {
        a.mozRequestFullScreen();
      } else {
        if (a.webkitRequestFullscreen) {
          a.webkitRequestFullscreen();
        } else {
          if (b) {
            $("#fullscreen_tip")
              .find(".t")
              .text("由于您的浏览器限制，无法进入演示视图。");
          } else {
            $("#fullscreen_tip")
              .find(".t")
              .text("无法进入全屏视图，您可以按(F11)进入。");
          }
          $("#fullscreen_tip").fadeIn();
        }
      }
    }
  },
  enterPresentation: function () {
    $("#designer").bind("webkitfullscreenchange", function (a) {
      Dock.manageFullScreen();
    });
    $(document)
      .bind("mozfullscreenchange", function (a) {
        Dock.manageFullScreen();
      })
      .bind("fullscreenchange", function (a) {
        Dock.manageFullScreen();
      });
    this.fullScreen(Utils.getDomById("designer"), true);
  },
  enterFullScreen: function () {
    this.fullScreen(document.documentElement);
  },
  manageFullScreen: function () {
    var a = Utils.getDomById("designer");
    if (
      document.fullscreenElement ||
      document.webkitFullscreenElement ||
      document.mozFullScreenElement
    ) {
      $("#shape_panel").addClass("readonly");
      $("#designer_viewport").addClass("readonly");
      $(window).unbind("resize.designer");
      $("#designer_layout").height(window.screen.height);
      Designer.hotkey.cancel();
      Designer.op.cancel();
      $("#dock").hide();
      $(".dock_view").hide();
      Designer.contextMenu.destroy();
      Designer.op.canvasFreeDraggable();
    } else {
      $("#shape_panel").removeClass("readonly");
      $("#designer_viewport").removeClass("readonly");
      Designer.initialize.initLayout();
      Designer.hotkey.init();
      Designer.op.init();
      $("#dock").show();
      if (Dock.currentView != "") {
        Dock.showView(Dock.currentView);
      }
      Designer.contextMenu.init();
      $("#designer").unbind("webkitfullscreenchange");
      $("#designer").unbind("mozfullscreenchange").unbind("fullscreenchange");
    }
  },
  mindWaterMark: {
    data: {
      waterMarkUsed: true,
      isBluring: false,
      oldWaterName: "",
      waterMarkList: [],
      that: null,
      isMember: false,
    },
    init: function () {
      this.eventInit.call(this);
      this.dataInit();
    },
    dataInit: function (a) {
      this.data.that = a;
      var b = this;
      b.data.oldWaterName = Model.define.page.watermark;
      Designer.events.push("isMember", function (c) {
        b.data.isMember = c;
        if (c) {
          $("#dock_topic_sytip").remove();
        } else {
          $("#dock_topic_sytip").show();
        }
      });
      b.makeWaterList();
      $("#dock_watermark_list,#watermark_input_sub,#reset-watermark").show();
    },
    eventInit: function () {
      var a = this;
      $("#watermark_input").on("blur keyup", function (d) {
        var b = false;
        var c = $(this),
          f = $.trim(c.val());
        if (d.type === "keyup" && d.keyCode === 13) {
          b = true;
        } else {
          if (d.type === "blur") {
            b = false;
          } else {
            if (d.type === "keyup" && d.keyCode !== 13) {
              b = false;
              a.checkSameWaterMark(f);
            }
          }
        }
        if (b) {
          a.toSetWaterMark(c, f, "add");
        }
      });
      $("#watermark_input").bind("focusin", function () {
        $(this).addClass("watermark_input_focus");
      });
      $("#watermark_input").bind("focusout", function () {
        $(this).removeClass("watermark_input_focus");
      });
      $("#watermark_input_sub").on("click", function (c) {
        var b = $("#watermark_input"),
          d = $.trim(b.val());
        a.toSetWaterMark(b, d, "add");
      });
      $("#watermark_ullist").on("click", "li", function (d) {
        var b = $(this).attr("_index");
        var f = a.data.waterMarkList[parseInt(b)];
        var c = $("#watermark_input");
        a.toSetWaterMark(c, f, "set");
      });
      $("#watermark_ullist").on(
        "click",
        "span.dock_btn_watermark_del",
        function (b) {
          b.stopPropagation();
          a.toDelWaterMark($(this).attr("_index"));
        }
      );
      $("#reset-watermark").on("click", function (b) {
        a.toClearWaterMark();
      });
    },
    checkActived: function (b) {
      var c = this;
      var a = this.data.that;
      if (
        typeof b === "string" &&
        typeof c.data.oldWaterName === "string" &&
        c.data.oldWaterName === b
      ) {
        return true;
      } else {
        return false;
      }
    },
    checkSameWaterMark: function (b) {
      this.data.waterMarkUsed = true;
      var a = true;
      if (this.data.waterMarkList.length <= 0) {
        a = true;
      } else {
        if (this.data.waterMarkList.length >= 10) {
          this.data.waterMarkUsed = false;
        }
      }
      if (this.data.waterMarkList.indexOf(b) > -1) {
        this.data.waterMarkUsed = false;
        a = false;
      } else {
        a = true;
      }
      this.changeStyle();
      return a;
    },
    checkXss: function (b) {
      var a = true;
      if (b.indexOf("<") > -1) {
        a = false;
      }
      if (b.indexOf(">") > -1) {
        a = false;
      }
      return a;
    },
    changeStyle: function () {
      if (this.data.waterMarkUsed) {
        $("#watermark_input_sub").removeClass("watermark_btn_deny");
      } else {
        $("#watermark_input_sub").addClass("watermark_btn_deny");
      }
    },
    toClearWaterMark: function () {
      this.data.oldWaterName = "";
      CLB.setConfig("watermark", "");
      Designer.setPageStyle({ watermark: "" });
      this.makeWaterList();
    },
    toSetWaterMark: function (b, c, a) {
      var e = this.data.isBluring;
      var d = this;
      if (e) {
        return;
      }
      e = true;
      if (a === "add" && !d.checkSameWaterMark(c)) {
        if (d.data.waterMarkList.length >= 10) {
          UI.toast(
            "最多可添加10条水印，如需添加新水印请先删除多余水印",
            "center",
            2000
          );
          return;
        }
        return;
      }
      if (a === "add" && d.data.waterMarkList.length >= 10) {
        UI.toast(
          "最多可添加10条水印，如需添加新水印请先删除多余水印",
          "center",
          2000
        );
        return;
      }
      if (c === "") {
        return;
      }
      if (c.length > 15 && a === "add") {
        UI.toast("最多支持15个字", "center", 2000);
        $("#watermark_input").select();
        e = false;
        return;
      }
      if (!d.checkXss(c)) {
        UI.toast("文本中包含敏感字符，请重新输入", "center", 2000);
        $("#watermark_input").select();
        e = false;
        return;
      }
      d.data.waterMarkUsed = false;
      d.changeStyle();
      Designer.events.push("isMember", function (g) {
        g = true;
        var f = $("<span/>").text(c).html();
        if (g) {
          CLB.setConfig("watermark", f, function (h) {
            if (h != null && h.result == "length") {
              UI.toast("最多支持15个字", "center", 2000);
              $("#watermark_input").select();
            } else {
              if (h != null && h.result == "error_text") {
                UI.toast("文本中包含敏感字符，请重新输入", "center", 2000);
                $("#watermark_input").select();
              } else {
                if (h != null && h.result == "memberlength") {
                  UI.toast("会员专属功能，升级后可以使用", "center", 2000);
                  $("#watermark_input").select();
                } else {
                  Designer.setPageStyle({ watermark: f });
                  if (a === "add") {
                    d.api.addWaterMark(c, function (i) {
                      if (i.result !== "success") {
                        UI.toast(
                          "最多可添加10条水印，如需添加新水印请先删除多余水印",
                          "center",
                          2000
                        );
                        d.data.waterMarkUsed = false;
                        return;
                      }
                      d.data.oldWaterName = c;
                      d.makeWaterList();
                    });
                  } else {
                    if (a === "set") {
                      d.data.oldWaterName = c;
                      d.makeWaterList();
                    }
                  }
                }
              }
            }
            e = false;
          });
        }
      });
    },
    toDelWaterMark: function (b) {
      var c = this;
      var a = this.data.waterMarkList[parseInt(b)];
      this.api.delWaterMark(a, function (d) {
        if (d.result === "success") {
          c.makeWaterList("del");
        }
      });
    },
    makeWaterList: function (b) {
      var c = this;
      var a = typeof b === "string" ? b : "list";
      this.api.getWaterMarks(function (e) {
        if (e.result !== "success" || e.watermarks.length <= 0) {
          if (e.watermarks.length <= 0) {
            c.data.waterMarkUsed = true;
            if (a === "del") {
              c.data.waterMarkList = [];
            }
            $("#watermark_ullist").html("");
            $("#dock_watermark_nothing").show();
            c.changeStyle();
          }
          return;
        }
        c.data.waterMarkList = e.watermarks.sort(function (g, f) {
          return -1;
        });
        $("#dock_watermark_nothing").hide();
        c.data.waterMarkUsed = e.watermarks.length >= 10 ? false : true;
        var d = "";
        $(c.data.waterMarkList).each(function (g, f) {
          d += "<li _index='" + g + "'>";
          if (c.checkActived(f)) {
            d += '<div class="dock_operate">';
            d +=
              "<span class=\"diagraming-icons\" style='color:#333;'>&#xe75c;</span>";
            d += "</div>";
          }
          d += f;
          d += '<div class="dock_operate fr">';
          d +=
            '<span class="diagraming-icons dock_btn_watermark_del" _index=\'' +
            g +
            "'>&#xe637;</span>";
          d += "</div>";
          d += "</li>";
        });
        $("#watermark_ullist").html(d);
        c.checkSameWaterMark($.trim($("#watermark_input").val()));
      });
    },
    api: {
      getWaterMarks: function (a) {
        var b = {};
        $.ajax({
          url: "/diagraming/watermarks",
          data: b,
          cache: false,
          type: "get",
          success: function (c) {
            typeof a === "function" && a(c);
          },
        });
      },
      addWaterMark: function (a, b) {
        var c = { watermark: a };
        $.ajax({
          url: "/diagraming/watermark_add",
          data: c,
          cache: false,
          type: "post",
          success: function (d) {
            typeof b === "function" && b(d);
          },
        });
      },
      delWaterMark: function (a, b) {
        var c = { watermark: a };
        $.ajax({
          url: "/diagraming/watermark_remove",
          data: c,
          cache: false,
          type: "post",
          success: function (d) {
            typeof b === "function" && b(d);
          },
        });
      },
    },
  },
};
var Navigator = {
  init: function () {
    $("#designer_layout").bind("scroll", function () {
      Navigator.setView();
    });
    $("#navigation_eye").bind("mousedown", function (m) {
      var f = $(this);
      var j = f.position();
      $("#designer_layout").unbind("scroll");
      var g = $("#designer_layout");
      var k = g.scrollTop();
      var d = g.scrollLeft();
      var n = $("#designer_canvas");
      var e = n.width();
      var a = n.height();
      var b = $("#navigation_canvas");
      var i = b.width();
      var c = b.height();
      var l = e / i;
      var h = a / c;
      $(document).bind("mousemove.navigator", function (q) {
        var o = q.pageX - m.pageX;
        var s = q.pageY - m.pageY;
        var r = d + o * l;
        g.scrollLeft(r);
        var p = k + s * h;
        g.scrollTop(p);
        f.css({ left: j.left + o, top: j.top + s });
      });
      $(document).bind("mouseup.navigator", function (o) {
        $(document).unbind("mousemove.navigator");
        $(document).unbind("mouseup.navigator");
        Navigator.setView();
        $("#designer_layout").bind("scroll", function () {
          Navigator.setView();
        });
      });
    });
    $("#navigation_canvas").bind("click", function (l) {
      var m = Utils.getRelativePos(l.pageX, l.pageY, $(this));
      var o = $("#designer_canvas");
      var h = o.width();
      var a = o.height();
      var b = $("#navigation_canvas");
      var k = b.width();
      var c = b.height();
      var n = h / k;
      var j = a / c;
      var g = m.x * n;
      var f = m.y * j;
      var i = $("#designer_layout");
      var d = Designer.config.pageMargin;
      i.scrollLeft(g + d - i.width() / 2);
      i.scrollTop(f + d - i.height() / 2);
    });
    this.setView();
  },
  draw: function () {
    if (this.drawNavigationTimeout) {
      window.clearTimeout(this.drawNavigationTimeout);
    }
    this.drawNavigationTimeout = setTimeout(function () {
      var c = $("#navigation_canvas");
      var r = c[0].getContext("2d");
      r.save();
      r.clearRect(0, 0, c.width(), c.height());
      r.scale(
        c.width() / Model.define.page.width,
        c.height() / Model.define.page.height
      );
      for (var g = 0; g < Model.orderList.length; g++) {
        var m = Model.orderList[g].id;
        var l = Model.getShapeById(m);
        r.save();
        if (l.name != "linker") {
          var b = l.props;
          var a = Utils.getShapeLineStyle(l.lineStyle);
          r.translate(b.x, b.y);
          r.translate(b.w / 2, b.h / 2);
          r.rotate(b.angle);
          r.translate(-(b.w / 2), -(b.h / 2));
          r.globalAlpha = l.shapeStyle.alpha;
          Designer.painter.renderShapePath(r, l);
        } else {
          var h = l;
          var a = Utils.getLinkerLineStyle(h.lineStyle);
          var q = h.points;
          var o = h.from;
          var n = h.to;
          r.beginPath();
          r.moveTo(o.x, o.y);
          if (h.linkerType == "curve") {
            var f = q[0];
            var e = q[1];
            r.bezierCurveTo(f.x, f.y, e.x, e.y, n.x, n.y);
          } else {
            for (var d = 0; d < q.length; d++) {
              var k = q[d];
              r.lineTo(k.x, k.y);
            }
            r.lineTo(n.x, n.y);
          }
          r.lineWidth = a.lineWidth;
          r.strokeStyle = "rgb(" + a.lineColor + ")";
          r.stroke();
        }
        r.restore();
      }
      r.restore();
      Navigator.setView();
      this.drawNavigationTimeout = null;
    }, 100);
  },
  setView: function () {
    var a = $("#navigation_eye");
    var r = $("#designer_layout");
    var u = r.width();
    var d = r.height();
    var b = $("#navigation_canvas");
    var g = b.width();
    var n = b.height();
    var o = $("#designer_canvas");
    var f = o.width();
    var m = o.height();
    var l = Designer.config.pageMargin;
    var h = l - r.scrollLeft();
    var t = h + f;
    if (h < 0) {
      h = 0;
    } else {
      if (h > u) {
        h = u;
      }
    }
    if (t > u) {
      t = u;
    } else {
      if (t < 0) {
        t = 0;
      }
    }
    var j = l - r.scrollTop();
    var e = j + m;
    if (j < 0) {
      j = 0;
    } else {
      if (j > d) {
        j = d;
      }
    }
    if (e > d) {
      e = d;
    } else {
      if (e < 0) {
        e = 0;
      }
    }
    var i = t - h;
    var p = e - j;
    if (i == 0 || p == 0) {
      a.hide();
    } else {
      var k = r.scrollLeft() - l;
      if (k < 0) {
        k = 0;
      }
      k = k * (g / f);
      var q = r.scrollTop() - l;
      if (q < 0) {
        q = 0;
      }
      q = q * (n / m);
      var s = i * (g / f);
      var c = p * (n / m);
      a.css({ left: k - 1, top: q - 1, width: s, height: c }).show();
    }
  },
};
var ProShare = {
  publish: {
    source:
      '<div id="publish_toedit" class="pubpo-tab dialog-win-con"><div class="toedit-des">当前文件已发布（公开）到ProcessOn，您可以：</div><div class="publish-content"><div id="btn_submit_private"><span class="icons">&#xe62d;</span>取消发布</div><div class="item-seq">或者</div><div id="to_publish_edit"><span class="icons">&#xe62e;</span>修改发布信息</div></div></div></div><div id="publish_verifying" class="pubpo-tab dialog-win-con"><div class="toedit-des">当前文件正在进行发布审核，请耐心等待</div><div class="publish-content"><div id="btn_verifying"><span class="icons">&#xe676;</span>审核中…</div><div class="item-seq">或者</div><div id="to_publish_edit"><span class="icons">&#xe62e;</span>修改发布信息</div></div></div><div id="publish_topublic" class="pubpo-tab dialog-win-con"> <h3>文件信息</h3><ul class="form"><li class="form-row"><div class="text">标题</div><input type="text" class="txt" name="pub_title" id="pub_title" style="width:70%"></li><li class="form-row"><div class="text" style="vertical-align: top">文件描述</div><textarea id="publish_description" class="textarea txt" placeholder="详情描述限200字内"></textarea></li><li class="form-row"><div class="text">分类</div><div class="select-box" id="industry"><input type="text" class="select" placeholder="选择所属行业" disabled><ul></ul></div></li><li class="form-row"><div class="text">添加标签</div><div id="publish_addtags" class="feedTags txt"><div id="tag_items"></div><input id="tag_input" class="tag-txt" type="text" placeholder="回车键添加标签，最多可添加5个标签"></div><ul class="pro-tags"></ul><div class="change-tags">换一换</div></li><div style="height:1px;background:#F0F0F0;margin:23px 0"></div> <h3>设置文件克隆</h3><li class="form-row" style="padding-bottom:10px;"><div class="text">克隆类型</div><div class="content" style="width:auto!important"><div class="radio-btn-group"><input id="public_clone_free" type="radio" class="clone-radio" name="public_clone" checked><label for="public_clone_free">免费克隆</label></div><div class="radio-btn-group"><input id="public_clone_pay" type="radio" class="clone-radio " name="public_clone"><label for="public_clone_pay">付费克隆<span>（用户克隆后，您可以获取收益）</span></label></div><div class="radio-btn-group"  title_pos="top" title="该设置模板将不被展示在模板首页，<br/>公开后请在推荐页查找此模板"><input type="radio" name="public_clone" id="no_clone" class="clone-radio"><label for="no_clone">不允许克隆<span>（仅可查看）</span></label></div></div></li><li class="form-row selece-price-box" style="padding-bottom:20px;"><div class="text">克隆价格</div><ul class="selece-price"><li class="select-price-item" style="width:154px;"><input id="setprice"  placeholder="请输入3元以上价格" type="text" value="" autocomplete="off"/><li class="select-price-item">3</li><li class="select-price-item">5</li><li class="select-price-item">10</li><li class="select-price-item">15</li><li class="select-price-item">20</li></li></ul></li></ul><div class="bot-line" style="padding:0"><div class="agreement-group" style="display:block;margin:0; "><input id="agreement" type="checkbox" name="agreement" checked=""><label for="agreement">点击发布表示您同意我们的<a href="/tos" target="_blank" class="agreement-detail">《服务条款》</a></label></div><div class="dlg-buttons"><div id="exposure">如何提升创作曝光<a href="https://www.processon.com/support#user-template" target="_blank"><img src="/assets/images/new/exposure.png"></a></div><span id="btn_submit_publish" class="pro-btn default pub-btn btn btn_submit_publish" data-step="publish">发布</span><span class="pro-btn btn-close btn" data-step="close">取消</span></div></div></div>',
    officialTags: [],
    getOfficialTags: function () {
      var a = $("#pub_title").val();
      $.ajax({
        url: "/templates/official_tags",
        data: { title: a == "未命名文件" ? "" : a },
        type: "post",
        success: function (c) {
          ProShare.publish.officialTags = [];
          for (var b = 0; b < c.tags.length; b++) {
            ProShare.publish.officialTags.push(c.tags[b].tagName);
          }
          ProShare.publish.renderOfficialTags();
        },
      });
    },
    renderOfficialTagsCount: 0,
    renderOfficialTags: function () {
      var c = $(".pro-tags");
      var h = c.find("li").length;
      var d = ProShare.publish.getRandomItem(ProShare.publish.officialTags, 5);
      var f = [];
      this.renderOfficialTagsCount++;
      if (this.renderOfficialTagsCount == 1) {
        f = [];
        for (var b = d.length - 1; b >= 0; b--) {
          if (f.indexOf(d[b]) < 0) {
            f.push(d[b]);
          }
        }
        d = f;
      }
      c.empty();
      for (var e = 0; e < d.length; e++) {
        var g = "";
        if (d[e] == "暑期生活" || d[e] == "学霸笔记") {
          g = "hot";
        }
        c.append('<li class="' + g + '">' + d[e] + "</li>");
      }
    },
    getRandomItem: function (a, b) {
      var d = [],
        e = $.extend(true, [], a);
      for (var c = 0; c < b; c++) {
        var f = Math.floor(Math.random() * e.length);
        if (d.indexOf(e[f]) == -1) {
          d.push(e[f]);
          e.splice(f, 1);
        }
      }
      return d;
    },
    execute: function (g) {
      ProShare.publish.renderOfficialTagsCount = 0;
      $("#btn_submit_publish").before($("#TencentCaptcha"));
      $("#TencentCaptcha").show();
      $("#btn_submit_publish").hide();
      Util.get("/view/chart/" + g, {}, function (k) {
        var j = k.chart;
        f(j.status);
        $("#tag_items").children("span").remove();
        $(".selece-price-box").hide();
        if (j.tags != null && j.tags.length > 0) {
          for (var h = 0; h < j.tags.length; h++) {
            c(j.tags[h]);
          }
        }
        if (j.industry != null) {
          $("#industry .select").val(j.industry);
        }
        $("#publish_description").val(Util.restoreXss(j.description));
        $("#pub_title")
          .val(Util.restoreXss(j.title))
          .off()
          .on("blur", function () {
            if ($("#pub_title").val() != Util.restoreXss(j.title)) {
              j.title = $("#pub_title").val();
              ProShare.publish.renderOfficialTagsCount = 0;
              ProShare.publish.getOfficialTags();
            }
          });
        if (j.template == true) {
          $("#public_clone_pay").attr("checked", true);
          $(".selece-price-box").show();
        }
        if (j.publicClone && j.publicClonePrice > 0) {
          $("#public_clone_pay").attr("checked", true);
          $(".selece-price-box").show();
          $(".setprice-btn").val(j.publicClonePrice);
          $("#btn_submit_publish").text("提交审核");
        } else {
          if (!j.publicClone && j.status == "public") {
            $("#no_clone").attr("checked", true);
          } else {
            $("#public_clone_free").attr("checked", true);
          }
        }
        ProShare.publish.getOfficialTags();
      });
      $("#pubpo_win").on("click", "#to_publish_edit", function () {
        a();
        $(".pubpo-tab").hide();
        $("#publish_topublic").show();
      });
      $("#publish_addtags").on("click", function (h) {
        $("#tag_input").focus();
      });
      $(".select-box").click(function (h) {
        h.stopPropagation();
        $(this).find("ul").toggle();
      });
      $("#file_type").on("click", "li", function () {
        $("#file_type .select").val($(this).text());
      });
      $("body").click(function () {
        $(".select-box ul").hide();
      });
      $.ajax({
        url: "/templates/official_industries",
        data: {},
        success: function (j) {
          for (var h in j.industries) {
            $("#industry ul").append("<li>" + j.industries[h] + "</li>");
          }
        },
      });
      $("#industry").on("click", "li", function () {
        $("#industry .select").val($(this).text());
      });
      var b = $(".pro-tags");
      $(".change-tags")
        .off()
        .on("click", function () {
          var h = ProShare.publish.getRandomItem(
            ProShare.publish.officialTags,
            5
          );
          b.empty();
          for (var j = 0; j < h.length; j++) {
            b.append("<li>" + h[j] + "</li>");
          }
        });
      b.off().on("click", "li", function (k) {
        k.stopPropagation();
        var j = $(this);
        if ($("#tag_items").children("span").length < 5) {
          j.remove();
          b.append(
            "<li>" +
              ProShare.publish.getRandomItem(
                ProShare.publish.officialTags,
                1
              )[0] +
              "</li>"
          );
          for (var h = 0; h < ProShare.publish.officialTags.length; h++) {
            if (j.text() == ProShare.publish.officialTags[h]) {
              ProShare.publish.officialTags.splice(h, 1);
            }
          }
        }
        c(j.text());
      });
      $("#tag_items")
        .find(".close-tag")
        .die()
        .live("click", function () {
          var h = $(this).parent().find("input").val();
          $(this).parent().remove();
          if ($("#tag_items").children("span").length < 5) {
            $("#tag_input").val("").focus();
          }
          ProShare.publish.officialTags.push(h);
        });
      $("#tag_input")
        .off("keyup.input")
        .on("keyup.input", function (i) {
          if ($.trim($(this).val()).length > 30) {
            $(this).val($.trim($(this).val()).substring(0, 30));
          }
          var h = i.which;
          if (h == 188) {
            c(
              $("#tag_input")
                .val()
                .substr(0, $("#tag_input").val().length - 1)
            );
            $("#tag_input").val("");
          }
          $("#publish_addtags").scrollTop($(".input_item_box").height());
        })
        .off("keydown.delete")
        .on("keydown.delete", function (h) {
          if (h.which == 8 && $("#tag_input").val() == "") {
            $("#tag_items span:last-child").remove();
          }
        })
        .suggest({
          url: "/tags/suggest",
          valueField: "tagName",
          format: function (h) {
            return h.tagName;
          },
          onEnter: function () {
            c();
            $(".feedTags").scrollTop($(".input_item_box").height());
          },
        });
      $("#pubpo_win .btn-close").click(function () {
        $("#pubpo_win").dialog("close");
      });
      $("#agreement").on("change", function () {
        var i = $(this).prop("checked"),
          h = $("#btn_submit_publish");
        if (!i) {
          h.disable();
          return;
        }
        h.enable();
      });
      $(".clone-radio")
        .off()
        .on("change", function () {
          var i = $("#public_clone_pay").prop("checked"),
            h = $("#btn_submit_publish");
          if (i) {
            $(".selece-price-box").show();
            h.text("提交审核");
            return;
          }
          $(".selece-price-box").hide();
          h.text("发布");
        });
      $(".selece-price")
        .off()
        .on("click", ".select-price-item", function (i) {
          var h = $(this);
          $(".select-price-item").removeClass("active");
          if (h.find("input").length > 0) {
            if ($("#setprice").val() == 0) {
              $("#setprice").val("");
            }
            if ($(this).val() === 0) {
              $(this).val(1);
            }
            $("#setprice")
              .on("input", function (j) {
                $(this).val(
                  $(this)
                    .val()
                    .replace(/^(\-)*(\d+)\.(\d).*$/, "$1$2.$3")
                );
                if ($(this).val() === 0) {
                  $(this).val(1);
                }
              })
              .on("blur", function () {
                if ($(this).val() != "") {
                  $(this).parent().addClass("active");
                } else {
                  $(this).parent().removeClass("active");
                }
                $(this).parent().removeClass("ipterror");
              });
            return;
          } else {
            $(".selece-price input").val("");
            $("#setprice").parent().removeClass("ipterror");
            h.addClass("active");
            return;
          }
        });
      $("#btn_submit_publish")
        .off()
        .on("click", function () {
          var i = "verifying";
          var h = $("#public_clone_free").prop("checked"),
            j = $("#no_clone").prop("checked");
          if (h || j) {
            i = "public";
          }
          d(i);
        });
      $("#btn_submit_private")
        .off()
        .on("click", function () {
          var h = "private";
          d(h);
        });
      function a() {
        $("#TencentCaptcha").show();
        $("#btn_submit_publish").hide();
      }
      function d(n) {
        var i = $("#publish_description"),
          h = $(".clone-radio:checked");
        var o = {};
        o.id = g;
        o.signup_ticket = $("#signup_ticket").val();
        o.randstr = $("#randstr").val();
        o.description = i.val();
        o.title = $.trim($("#pub_title").val());
        o.industry = $("#industry .select").val();
        o.tags = e();
        o.status = n;
        o._public_clone = $("#no_clone")[0].checked == true ? "false" : "true";
        o._public_clone_price = $("#setprice").val()
          ? $("#setprice").val()
          : $(".select-price-item.active").text();
        o.ignore = "description";
        if (n != "private") {
          if (o.title == "" || o.title == "未命名文件") {
            Util.globalTopTip(
              "未命名文件不允许发布，请修改文件标题后再发布",
              "top_error",
              3000,
              $("#pubpo_win"),
              true
            );
            $("#pub_title").focus();
            return;
          }
          if ($.trim(o.description) == "") {
            Util.globalTopTip(
              "请输入文件描述",
              "top_error",
              3000,
              $("#pubpo_win"),
              true
            );
            i.focus();
            return;
          }
          if (!o.industry) {
            Util.globalTopTip(
              "请选择文件分类",
              "top_error",
              3000,
              $("#pubpo_win"),
              true
            );
            return;
          }
          if (o.tags.length == 0) {
            Util.globalTopTip(
              "请输入文件标签",
              "top_error",
              3000,
              $("#pubpo_win"),
              true
            );
            $("#publish_addtags").find("input").focus();
            return;
          }
          if (h.length < 1) {
            Util.globalTopTip(
              "您需要选择是否开放克隆",
              "top_error",
              3000,
              $("#pubpo_win"),
              true
            );
            return;
          }
          var l = $("#public_clone_pay").prop("checked");
          if (l) {
            var m = $("#setprice");
            var k = o._public_clone_price;
            if (k == 0 || k > 99) {
              Util.globalTopTip(
                "请您输入价格(3 - 99)",
                "top_error",
                3000,
                $("#pubpo_win"),
                true
              );
              m.focus();
              return;
            } else {
              if (!/^(\d+\.\d{1,1}|\d+)$/.test(k)) {
                Util.globalTopTip(
                  "克隆价格需为数字，最多一位小数",
                  "top_error",
                  3000,
                  $("#pubpo_win"),
                  true
                );
                m.focus();
                return;
              } else {
                if (k < 3) {
                  Util.globalTopTip(
                    "克隆价格需大于3元",
                    "top_error",
                    3000,
                    $("#pubpo_win"),
                    true
                  );
                  m.focus();
                  return;
                }
              }
            }
          }
        }
        $("#btn_submit_publish").disable();
        var j = n == "verifying" ? "chart/verify" : "publish";
        Util.ajax({
          url: "/folder/" + j,
          data: o,
          success: function (p) {
            $("#btn_submit_publish").enable();
            if (p.result == "clone" || p.result == "error_clone") {
              Util.globalTopTip(
                "克隆的文件暂不允许发布",
                "top_error",
                3000,
                $("#pubpo_win"),
                true
              );
              a();
              return;
            } else {
              if (p.result == "error_owner") {
                Util.globalTopTip(
                  "非自己文件，不允许发布",
                  "top_error",
                  3000,
                  $("#pubpo_win"),
                  true
                );
                a();
                return;
              } else {
                if (p.result == "error_status") {
                  Util.globalTopTip(
                    "文件已在审核中，不允许发布",
                    "top_error",
                    3000,
                    $("#pubpo_win"),
                    true
                  );
                  a();
                  return;
                } else {
                  if (p.result == "error_ticket") {
                    Util.globalTopTip(
                      "发布操作频繁，请操作后重试",
                      "top_error",
                      3000,
                      $("#pubpo_win"),
                      true
                    );
                    a();
                    return;
                  } else {
                    if (p.result == "tag") {
                      Util.globalTopTip(
                        "文件标签填写有误，请修改文件标签后再发布",
                        "top_error",
                        3000,
                        $("#pubpo_win"),
                        true
                      );
                      a();
                      return;
                    } else {
                      if (p.result == "rename") {
                        Util.globalTopTip(
                          "未命名文件不允许发布，请修改文件标题后再发布",
                          "top_error",
                          3000,
                          $("#pubpo_win"),
                          true
                        );
                        a();
                        return;
                      } else {
                        if (p.result == "error") {
                          Util.globalTopTip(
                            "当前模板内容较少，请丰富后再发布~",
                            "top_error",
                            3000,
                            $("#pubpo_win"),
                            true
                          );
                          a();
                          return;
                        } else {
                          if (p.result == "error_text") {
                            a();
                            Util.globalTopTip(
                              "描述或标签中存在敏感词汇，请修改后再发布",
                              "top_error",
                              3000,
                              $("#pubpo_win"),
                              true
                            );
                            return;
                          } else {
                            if (p.result == "error_safe_time") {
                              Util.globalTopTip(
                                "新用户注册时间小于24小时禁止发布、请稍后再发布",
                                "top_error",
                                3000,
                                $("#pubpo_win"),
                                true
                              );
                              a();
                              return;
                            } else {
                              if (p.result == "error_safe_count") {
                                Util.globalTopTip(
                                  "已达到每天发布文件数量限制(默认24张)、请稍后再发布",
                                  "top_error",
                                  3000,
                                  $("#pubpo_win"),
                                  true
                                );
                                a();
                                return;
                              } else {
                                if (p.result == "error_activity") {
                                  Util.globalTopTip(
                                    "当前文件为活动投稿，请您联系 <a href='https://kefu.easemob.com/webim/im.html?configId=4a1146cf-e7d9-4dea-98bd-921192252b7c' style='font-weight:bold;'>官方客服</a> 取消公开",
                                    "top_error",
                                    6000,
                                    $("#pubpo_win"),
                                    true
                                  );
                                  a();
                                  return;
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
            if (n == "verifying" || n == "public") {
              poCollect("模版-发布成功", { 渠道记录: "编辑器内" });
              n = "verifying";
              Util.globalTopTip(
                "文件已经提交审核",
                null,
                3000,
                $("#pubpo_win"),
                true
              );
            } else {
              if (n == "public") {
                poCollect("模版-发布成功", { 渠道记录: "编辑器内" });
                Util.globalTopTip(
                  "文件已经发布成功",
                  null,
                  3000,
                  $("#pubpo_win"),
                  true
                );
              } else {
                Util.globalTopTip(
                  "文件已经取消发布，已处于私密状态",
                  null,
                  3000,
                  $("#pubpo_win"),
                  true
                );
              }
            }
            f(n);
          },
        });
      }
      function f(h) {
        var i = $(".pubpo-tab");
        if (h == "public") {
          i.hide();
          $("#publish_toedit").show();
        } else {
          if (h == "verifying") {
            i.hide();
            $("#publish_verifying").show();
          } else {
            i.hide();
            $("#publish_topublic").show();
            $("#publish_topublic").find("textarea").focus();
          }
        }
      }
      function c(i) {
        if (typeof i == "undefined") {
          i = $("#tag_input").val();
          $("#tag_input").val("");
        }
        if ($("#tag_items").children("span").length >= 5) {
          $("#tag_input").inputTip({
            text: "最多添加五个标签",
            pos: "rightout",
          });
          return;
        }
        if (i != "") {
          i = Util.filterXss(i.trim());
          var h = $("#tag_items")
            .find(".tagitem")
            .map(function () {
              return $(this).find("input").val();
            })
            .get();
          if ($.inArray(i, h) < 0) {
            $("#tag_items").append(
              "<span class='tagitem'><span class='close-tag icons'>&#xe637;</span><input type='hidden' name='tags' value='" +
                i +
                "'/>" +
                i +
                "</span>"
            );
            $("#tag_items").show();
          }
        }
      }
      function e() {
        var h = $("#tag_items")
          .find(".tagitem")
          .map(function () {
            return $(this).find("input").val();
          })
          .get();
        return h;
      }
    },
  },
  viewlink: {
    source:
      '<div class="dlg-content"><h3><span class="tip1">创建浏览链接，分享给别人后，可以通过此链接来安全地浏览您的文件</span></h3><div style="margin:15px 0;"><input type="text" id="view_link_input" class="input txt" style="width:90%;border-radius:0" readonly placeholder="您还没有给文件创建分享链接"><span original-title="复制链接" class="icons link-icon">&#xe6de;</span></div><div class="button-line"><div class="new-form-switch"><span class="switchbutton fl gray" val="false"><span class="switch left"><span class="icons" style="color:#888;">&#xe652;</span></span><span class="switch-left">删除密码</span><span class="switch-right">添加密码</span></span></div><input type="text" class="txt input-pw" style="margin-left:10px;display:none;height:10px;" maxlength="8" placeholder="密码" /></div><div class="share-menu">分享到<a class="share_to_a weixin" style="display:inline-block;" target="_blank" rel="nofollow" hrefs="http://api.qrserver.com/v1/create-qr-code/?data=$viewLinkId"></a><a class="share_to_a weibo" style="display:inline-block;" target="_blank" rel="nofollow" hrefs="http://service.weibo.com/share/share.php?appkey=4181333602&title=$title&pic=https://assets.processon.com/chart_image/id/' +
      chartId +
      '.png&url=https://www.processon.com&ralateUid=2711044785"></a><a class="share_to_a qzone" style="display:inline-block;" target="_blank" rel="nofollow" hrefs="http://sns.qzone.qq.com/cgi-bin/qzshare/cgi_qzshare_onekey?desc=$title&title=$title&pics=https://assets.processon.com/chart_image/id/' +
      chartId +
      '.png&url=https://www.processon.com&summary=$title"></a><a class="share_to_a mingdao" target="_blank" rel="nofollow" hrefs="http://www.mingdao.com/share?appkey=5967E9E0B4ADA1B9C23B1893ABAED0F&pic=http://www.processon.com/chart_image/thumb/$thumb.png&title=$title&url=https://www.processon.com"></a><a class="share_to_a douban" style="display:inline-block;" target="_blank" rel="nofollow" hrefs="http://www.douban.com/share/service?name=$title&href=https://www.processon.com"></a><a class="share_to_a facebook" style="display:inline-block;" target="_blank" rel="nofollow" hrefs="http://www.facebook.com/sharer.php?u=https://www.processon.com&t=ProcessOn"></a><a class="share_to_a google" style="display:inline-block;" target="_blank" rel="nofollow" hrefs="http://www.google.com/bookmarks/mark?op=add&bkmk=https://www.processon.com&title=ProcessOn"></a><a class="share_to_a linkedin" style="display:inline-block;" target="_blank" rel="nofollow" hrefs="http://www.linkedin.com/shareArticle?mini=true&url=https://www.processon.com&title=ProcessOn"></a></div><div class="share-del"><span class="pro-btn default create">创建链接</span><span class=""></span><span id="del-hint" style="margin-left:20px;">删除链接后别人无法浏览你的文件，你可以选择再次创建链接</span></div></div>',
    execute: function (j) {
      var h = null;
      var e = "";
      Util.get("/view/getlink", { chartId: j }, function (m) {
        var o = m.chart_pass;
        var n = m.chart_title;
        e = m.viewLinkId;
        if (e == "" || e == null) {
          a();
        } else {
          var l = "false";
          var k = null;
          if (o != null && o != "") {
            l = "true";
            k = o;
          }
          $(".switchbutton").attr("val", l);
          g(k);
          $("#view_link_input").val(e).select();
        }
        if (locale == "zh") {
          $(".share_to_a.weixin")
            .attr(
              "hrefs",
              $(".share_to_a.weixin").attr("hrefs").replace("$viewLinkId", e)
            )
            .show();
          $(".share_to_a.weibo")
            .attr(
              "hrefs",
              $(".share_to_a.weibo").attr("hrefs").replace("$title", n)
            )
            .show();
          $(".share_to_a.qzone")
            .attr(
              "hrefs",
              $(".share_to_a.qzone").attr("hrefs").replace("$title", n)
            )
            .show();
          $(".share_to_a.mingdao")
            .attr(
              "hrefs",
              $(".share_to_a.mingdao").attr("hrefs").replace("$thumb", h.thumb)
            )
            .show();
          $(".share_to_a.douban")
            .attr(
              "hrefs",
              $(".share_to_a.douban").attr("hrefs").replace("$title", n)
            )
            .show();
          $(".share_to_a.facebook").hide();
          $(".share_to_a.google").hide();
          $(".share_to_a.linkedin").hide();
        } else {
          $(".share_to_a.weixin")
            .attr(
              "hrefs",
              $(".share_to_a.weixin").attr("hrefs").replace("$viewLinkId", e)
            )
            .hide();
          $(".share_to_a.weibo")
            .attr(
              "hrefs",
              $(".share_to_a.weibo").attr("hrefs").replace("$title", n)
            )
            .hide();
          $(".share_to_a.qzone")
            .attr(
              "hrefs",
              $(".share_to_a.qzone").attr("hrefs").replace("$title", n)
            )
            .hide();
          $(".share_to_a.mingdao")
            .attr(
              "hrefs",
              $(".share_to_a.mingdao").attr("hrefs").replace("$thumb", n)
            )
            .hide();
          $(".share_to_a.douban")
            .attr(
              "hrefs",
              $(".share_to_a.douban").attr("hrefs").replace("$title", n)
            )
            .hide();
          $(".share_to_a.facebook").show();
          $(".share_to_a.google").show();
          $(".share_to_a.linkedin").show();
        }
      });
      $(".share_to_a")
        .off("mousedown")
        .on("mousedown", function (l) {
          l.stopPropagation();
          var k = $(this);
          Util.ajax({
            url: "/view/getlink",
            async: false,
            data: { chartId: j },
            success: function (p) {
              if (p.viewLinkId != "") {
                var n = k.attr("hrefs");
                if (n.indexOf("/view/link/") < 0) {
                  k.attr(
                    "hrefs",
                    n.replace("=https://www.processon.com", "=" + p.viewLinkId)
                  );
                }
                if (k.hasClass("weixin")) {
                  var q = k
                    .attr("hrefs")
                    .replace("https://www.processon", "http://test.processon");
                  var m = "";
                  if ($(".share-to-weixin").length < 1) {
                    m = $("<div class='share-to-weixin'></div>").appendTo(
                      "body"
                    );
                    m.css({
                      position: "absolute",
                      width: 200,
                      height: 216,
                      left: "50%",
                      top: "40%",
                      marginLeft: -100,
                      marginTop: -100,
                      textAlign: "center",
                      zIndex: 9999999,
                      border: "1px solid #ccc",
                      background: "#fff",
                      boxShadow: "1px 1px 12px #bbb",
                    });
                    var o = new QRCode(m[0], { width: 180, height: 180 });
                    m.find("img")
                      .css({
                        width: "180px",
                        height: "180px",
                        marginTop: 10,
                        marginLeft: 10,
                      })
                      .after("<div>微信扫一扫 分享</div>");
                    o.makeCode(p.viewLinkId);
                  }
                  m = $(".share-to-weixin");
                  $(document)
                    .off("mousedown.weixin")
                    .on("mousedown.weixin", function () {
                      m.remove();
                    });
                } else {
                  window.open(k.attr("hrefs"));
                }
              }
            },
          });
        });
      $(".switchbutton")
        .off()
        .on("click", function () {
          var k = $(this).attr("val");
          if (k == "true") {
            $(this).attr("val", false);
          } else {
            $(this).attr("val", true);
          }
          c(this);
        });
      $(".icons.link-icon")
        .off()
        .on("click", function () {
          if (!$("#view_link_input").val().trim()) {
            return;
          }
          $("#view_link_input").select();
          try {
            if (document.execCommand("copy", false, null)) {
              Util.globalTopTip(
                "链接已复制到剪切板",
                "top_success",
                3000,
                $("#share_win"),
                true
              );
            } else {
            }
          } catch (k) {}
        });
      $(".input-pw")
        .off()
        .on("change", function (l) {
          var k = $(this).val().trim();
          if (k == "") {
            return;
          }
          if (!/^[0-9a-zA-Z]+$/.test(k.trim())) {
            Util.globalTopTip(
              "只能为数字和字母的组合",
              "top_error",
              3000,
              $("#share_win"),
              true
            );
            return;
          }
          i(k);
        });
      function a() {
        $(".dlg-content .create")
          .text("创建链接")
          .off()
          .on("click", function () {
            d();
            $(".share-menu, .button-line").show();
          });
        $(".share-menu, .button-line").hide();
        $("#del-hint").hide();
        $("#view_link_input").val("").off();
      }
      function d() {
        Util.ajax({
          url: "/view/addlink",
          data: { chartId: j },
          success: function (l) {
            $(".switchbutton").attr("val", "false");
            g();
            var k = l.viewLinkId;
            $("#view_link_input").val(k).select();
          },
        });
      }
      function g(k) {
        $(".dlg-content .create")
          .text("删除链接")
          .off()
          .on("click", function () {
            f();
            $(".share-menu, .button-line").hide();
          });
        $(".share-menu, .button-line").show();
        $("#del-hint").show();
        b(k);
      }
      function b(k) {
        var m = $(".switchbutton");
        var l = m.attr("val");
        if (l == "false") {
          m.removeClass("green").addClass("gray");
          m.find(".switch").removeClass("right").addClass("left");
          m.find(".switch .icons").show();
          m.find(".switch-left").hide();
          m.find(".switch-right").show();
        } else {
          m.removeClass("gray").addClass("green");
          m.find(".switch").removeClass("left").addClass("right");
          m.find(".switch .icons").hide();
          m.find(".switch-left").show();
          m.find(".switch-right").hide();
          if (!!k) {
            $(".input-pw").show().val(k);
          }
        }
      }
      function f() {
        Util.ajax({
          url: "/view/dellink",
          data: { chartId: j },
          success: function (k) {
            a();
          },
        });
      }
      function c(m) {
        var l = $(m).attr("val");
        if (l == "true") {
          var k = Util.creatCode(4);
          $(".input-pw").show().val(k).select();
          i(k);
        } else {
          Util.ajax({
            url: "/view/removepassword",
            data: { chartId: j },
            success: function (n) {
              $(".input-pw").val("").hide();
              b($(".input-pw").val());
            },
          });
        }
      }
      function i(k) {
        Util.ajax({
          url: "/view/addpassword",
          data: { viewPassword: k, chartId: j },
          success: function (l) {
            b($(".input-pw").val());
            Util.globalTopTip(
              "密码设置成功",
              "top_success",
              3000,
              $("#share_win"),
              true
            );
          },
        });
      }
    },
  },
  emb: {
    source:
      '<div class="embed-left"><div class="embed-preview-wrap"><div class="embed-preview"></div></div></div><div class="embed_attributes form"><div id="embed_show_tip">您可以复制下面的代码，嵌入到第三方网站中，比如：<a href="https://www.yuque.com/?chInfo=ch_processon__chsub_embed" target="_blank"><svg style="width:50px;vertical-align:-5px;" xmlns="http://www.w3.org/2000/svg" xmlns:xlink="http://www.w3.org/1999/xlink" viewBox="0 0 81 28" id="logo"><g fill="none" fill-rule="evenodd"><path d="M48.96 6.168c-.282 0-.472-.049-.57-.146-.099-.097-.148-.267-.148-.51 0-.23.05-.4.148-.508.098-.11.288-.164.57-.164h9.77c.257 0 .438.054.542.164.105.109.157.279.157.509 0 .242-.052.412-.157.51-.104.096-.285.145-.542.145h-5.336l-.442 1.855h3.68c.417 0 .748.022.994.064.245.042.426.127.542.255.117.127.19.315.221.564.03.248.046.579.046.991v1.892h1.067c.258 0 .439.054.543.164.104.109.156.279.156.509 0 .218-.052.382-.156.491-.104.11-.285.164-.543.164H48.334c-.27 0-.453-.055-.552-.164-.098-.109-.147-.273-.147-.491 0-.23.05-.4.147-.51.099-.109.283-.163.552-.163h2.282l.607-2.474H49.29c-.208 0-.365-.046-.47-.137-.103-.09-.155-.263-.155-.518 0-.424.208-.637.625-.637h2.245l.441-1.855H48.96zm10.027 13.188c0 .558-.104.956-.313 1.192-.208.236-.582.355-1.122.355h-6.77c-.553 0-.93-.119-1.132-.355-.203-.236-.304-.634-.304-1.192v-3.201c0-.546.101-.934.304-1.164.202-.23.58-.346 1.131-.346h6.771c.54 0 .914.115 1.122.346.209.23.313.618.313 1.164v3.201zM57.662 16.3c0-.206-.08-.309-.239-.309H50.91c-.147 0-.22.103-.22.31v2.946c0 .207.073.31.22.31h6.513c.16 0 .24-.103.24-.31V16.3zm-8.978 1.074c.208.17.31.348.304.536-.007.188-.132.404-.378.646-.319.328-.613.6-.883.819-.27.218-.595.467-.975.746-.245.17-.478.27-.699.3a.848.848 0 01-.589-.119 1.032 1.032 0 01-.395-.509c-.092-.23-.126-.515-.102-.855l.479-7.586c.024-.242-.08-.345-.313-.309l-1.693.182c-.355.036-.595.006-.717-.091-.123-.097-.196-.279-.22-.546-.025-.23.02-.403.137-.518.117-.115.328-.185.635-.21l1.913-.181c.589-.06 1.021.033 1.297.282.276.248.396.7.36 1.355l-.442 7.095c-.013.194.049.23.184.109a13.208 13.208 0 001.03-.928c.38-.4.736-.473 1.067-.218zm3.956-8.06l-.608 2.475h5.023V9.733c0-.182-.018-.297-.055-.345-.037-.049-.141-.073-.313-.073H52.64zm-4.968-.927c-.319.291-.687.218-1.104-.218a84.667 84.667 0 00-1.076-1.119c-.374-.382-.794-.78-1.26-1.191-.405-.34-.43-.704-.074-1.092a.557.557 0 01.47-.182c.19.012.407.128.652.346.54.473.988.888 1.343 1.246.356.358.681.7.975 1.028.233.242.356.451.368.627.013.176-.085.361-.294.555zm28.636.2c-.368.23-.745.449-1.131.655-.386.206-.776.412-1.168.619.073.072.159.188.257.345.098.206.203.43.313.673l.331.728h5.133c.233 0 .405.052.515.155.11.103.166.276.166.518 0 .425-.227.637-.68.637h-5.465v1.273h4.912c.233 0 .405.052.515.155.11.103.166.276.166.518 0 .425-.227.637-.68.637h-4.913v1.219h4.784c.233 0 .404.051.515.154.11.103.165.276.165.519 0 .242-.055.41-.165.5-.11.091-.282.137-.515.137h-4.784v1.327h5.74c.454 0 .681.23.681.692 0 .242-.055.412-.166.51-.11.096-.282.145-.515.145H67.57v.09c0 .243-.058.416-.175.519-.116.103-.291.155-.524.155-.245 0-.42-.052-.524-.155-.105-.103-.157-.276-.157-.518v-8.096a154.592 154.592 0 01-1.582.364c-.38.085-.64.091-.782.018-.141-.072-.23-.248-.267-.527-.037-.23-.003-.403.101-.519.105-.115.298-.203.58-.263a39.981 39.981 0 004.26-1.146c1.355-.449 3.412-1.252 3.412-1.304V8.235v-3.54c0-.486.233-.728.7-.728.465 0 .698.242.698.727v3.984c1.076-.566 1.842-1.002 2.3-1.31.27-.17.49-.254.663-.254.171 0 .337.109.496.327.148.206.19.397.13.573-.062.176-.258.367-.59.573zm-6.44-3.802c.197.146.298.306.304.482.007.176-.095.41-.303.7a21.526 21.526 0 01-1.693 2.065 22.174 22.174 0 01-2.079 1.956c-.319.255-.57.391-.754.41-.184.017-.356-.077-.515-.283-.147-.194-.197-.373-.147-.536.049-.164.202-.361.46-.592a21.672 21.672 0 001.968-1.855 16.81 16.81 0 001.6-1.965c.21-.303.409-.479.599-.527.19-.049.377 0 .56.145zm5.888 1.165c-.233-.23-.364-.431-.395-.6-.03-.17.04-.34.211-.51.184-.17.362-.243.534-.218.172.024.38.145.626.363.552.51 1.143 1.125 1.775 1.847.632.721 1.26 1.5 1.886 2.337.208.28.325.51.35.692.024.182-.062.345-.258.49-.22.17-.42.228-.598.174-.178-.055-.39-.246-.635-.573a38.263 38.263 0 00-1.665-2.074 30.71 30.71 0 00-1.83-1.928zM67.57 19.356h5.648V18.03H67.57v1.327zm0-5.166h5.648v-1.273H67.57v1.273zm0 2.529h5.648v-1.22H67.57v1.22zm5.39-6.349a57.34 57.34 0 01-1.526.637c-.515.206-1.049.406-1.6.6h3.624a23.08 23.08 0 00-.405-.837c-.086-.157-.117-.29-.092-.4z" fill-opacity=".85" fill="#000"></path><g><g fill="#31CC79"><path d="M31.42 3.991l-2.564-.136s-.97-3.38-5.422-3.683c-4.452-.303-7.365-.113-7.365-.113s3.303 2.088 1.979 5.813c-.983 2.01-2.54 3.652-4.198 5.539L2.882 23.84c10.21-.148 16.23-.222 18.058-.222 5.13 0 9.464-4.417 9.287-9.332-.122-3.378-1.205-4.141-1.577-5.62-.373-1.48.373-3.84 2.77-4.676z" id="logo_a"></path></g><g fill-opacity=".6" fill="url(#logo_b)"><path d="M31.42 3.991l-2.564-.136s-.97-3.38-5.422-3.683c-4.452-.303-7.365-.113-7.365-.113s3.303 2.088 1.979 5.813c-.983 2.01-2.54 3.652-4.198 5.539L2.882 23.84c10.21-.148 16.23-.222 18.058-.222 5.13 0 9.464-4.417 9.287-9.332-.122-3.378-1.205-4.141-1.577-5.62-.373-1.48.373-3.84 2.77-4.676z" id="logo_a"></path></g></g><g><g fill="#93E65C"><path d="M13.805 11.45C8.437 17.473 0 27.053 0 27.053c15.178 3.956 22.171-5.646 23.266-8.97 1.468-4.457-.606-6.631-1.78-7.34-3.98-2.405-6.934-.129-7.68.709z" id="logo_c"></path></g><g fill-opacity=".75" fill="url(#logo_d)" style="mix-blend-mode:overlay"><path d="M13.805 11.45C8.437 17.473 0 27.053 0 27.053c15.178 3.956 22.171-5.646 23.266-8.97 1.468-4.457-.606-6.631-1.78-7.34-3.98-2.405-6.934-.129-7.68.709z" id="logo_c"></path></g></g><g opacity=".448"><g fill="#60DB69"><path d="M19.203 23.678c-2.435.016-7.89.086-16.363.209l10.485-11.884.68-.768c.986-.944 3.806-2.75 7.515-.51 1.178.712 3.26 2.896 1.787 7.37-.428 1.298-1.75 3.55-4.104 5.583z" id="logo_e"></path></g><g fill-opacity=".65" fill="url(#logo_f)"><path d="M19.203 23.678c-2.435.016-7.89.086-16.363.209l10.485-11.884.68-.768c.986-.944 3.806-2.75 7.515-.51 1.178.712 3.26 2.896 1.787 7.37-.428 1.298-1.75 3.55-4.104 5.583z" id="logo_e"></path></g></g></g></svg></a> &nbsp;等</div><textarea id="iframe_html" class="textarea txt" readonly="readonly" style="margin-top:6px;height:46px;width:98%;"></textarea><div class="embed-size"><label class="title" for="embed_width">宽度:</label><input type="text" id="embed_width" name="embed_width" class="input txt" value="525"><label for="embed_width">px</label>,<label class="title" for="embed_height">高度:</label><input type="text" id="embed_height" name="embed_height" class="input txt" value="245"><label for="embed_height">px</label><div style="margin-top:10px;">或者直接引用以下地址：</div><textarea id="iframe_html1" class="textarea txt" readonly="readonly" style="margin-top:10px;height:18px;width:98%;"></textarea></div></div>',
    execute: function (g) {
      var d = location.host;
      if (d.indexOf("http") < 0 && d.indexOf("processon.com") < 0) {
        d = "http://" + d;
      } else {
        if (d.indexOf("wxmp.processon.com") >= 0) {
          d = "https://wxmp.processon.com";
        } else {
          if (d.indexOf("processon.com") >= 0) {
            d = "https://www.processon.com";
          }
        }
      }
      $("#iframe_html").val("");
      $("#iframe_html1").val("");
      $(".embed-preview").html("");
      var f = $("#" + g).attr("cate");
      var c = "/embed/";
      var a, b;
      a = $("#embed_width").val();
      b = $("#embed_height").val();
      e(a, b);
      $("#iframe_html").select();
      function e(i, l) {
        var j =
          '<iframe id="embed_dom" name="embed_dom" frameborder="0" style="display:block;width:' +
          i +
          "px; height:" +
          l +
          'px;" src="' +
          (d + c + g) +
          '"></iframe>';
        $("#iframe_html").val(j);
        $("#iframe_html1").val(d + c + g);
        $(".embed-preview-wrap").css({
          "margin-top": -l / 2 + "px",
          "margin-left": -i / 2 + "px",
        });
        $(".embed-preview").html(j);
        var k = document.getElementById("embed_dom");
        k.onload = k.onreadystatechange = function () {
          if (!k.readyState || k.readyState == "complete") {
            setTimeout(function () {
              $(".embed-preview .preview_dis").remove();
              setTimeout(function () {
                $(".embed_obj").fadeIn();
              }, 100);
            }, 400);
          }
        };
      }
      $(".embed-size")
        .find("input")
        .keyup(function () {
          var i =
            $.trim($("#embed_width").val()) == ""
              ? 340
              : $.trim($("#embed_width").val());
          var j =
            $.trim($("#embed_height").val()) == ""
              ? 160
              : $.trim($("#embed_height").val());
          i = parseInt(i);
          j = parseInt(j);
          $(".embed-preview")
            .find("div:first")
            .css({ width: i + "px", height: j + "px" });
          $(".embed-preview")
            .find("iframe")
            .css({ width: i + "px", height: j + "px" });
          e(i, j);
        });
      $("#iframe_html,#iframe_html1")
        .off()
        .on("click", function () {
          $(this).select();
          try {
            if (document.execCommand("copy", false, null)) {
              Util.globalTopTip(
                "链接已复制到剪切板",
                "top_success",
                3000,
                $("#mind-share-dlg"),
                true
              );
            } else {
            }
          } catch (h) {}
        });
      $(".embed-preview").keydown(function () {
        $(".embed-size").find("input").blur();
      });
    },
  },
  image: {
    source:
      '<div class="dlg-content"><h3><span class="tip1">分享图片链接</span></h3><div><input type="text" id="img_link_input" class="input txt" readonly style="width:98%;margin-top:10px;"><div style="clear:both;"></div></div></div>',
    execute: function (a) {
      Util.ajax({
        url: "/folder/on_line_pic/" + a,
        success: function (c) {
          $("#img_link_input").show().prev().hide();
          var b = c.url.replace("www.processon.com", "assets.processon.com");
          $("#img_link_input")
            .val(b)
            .off()
            .on("click", function () {
              $(this).select();
              try {
                if (document.execCommand("copy", false, null)) {
                  Util.globalTopTip(
                    "链接已复制到剪切板",
                    "top_success",
                    3000,
                    $("#mind-share-dlg"),
                    true
                  );
                } else {
                }
              } catch (d) {}
            })
            .select();
        },
      });
    },
  },
};
var smartAiHelpCon = {
  params: {
    newclass: "",
    hotCon: "",
    subUnit: false,
    designerType: 1,
    channel: 1,
    tutorial: "45%",
    resultNum: 5,
    extra: true,
    questions: 5,
  },
  init: function (n) {
    var e = this,
      f = $("#right-help-con");
    var c = (e.params = $.extend({}, this.params, n));
    if (f.length < 1) {
      f = $(
        "<div id='right-help-con' class='right-help-con " +
          (c.ai_class || "") +
          "'></div>"
      )
        .appendTo("body")
        .hide();
      if (c.newclass) {
        f.addClass(c.newclass);
      }
      var j = $(
        "<div class='ai-search-input'><span class='ai-search-btn icons'>&#xe713;</span><input id='powerIpt' autocomplete='off' class='power-input' type='text' placeholder='搜索你想要的功能' /><div class='search-hot tag-box'><div class='hot-temp'></div></div><div class='power-search-del' style='display:none'><i class='icons'>&#xe714;</i></div></div>"
      );
      f.append(j);
      var g = $(
        "<div class='tag-box power-hot-tag colle-box' style='display:none'><h6>热搜</h6><div class='hot-temp'></div></div>"
      );
      f.append(g);
      var m = $(
        "<div class='power-search-result' style='display: none'></div>"
      );
      f.append(m);
      if (c.subUnit) {
        var a = c.subUnit,
          d = "";
        if (typeof a == "string") {
          d = a;
        } else {
          if (a instanceof Array) {
            $.each(a, function (o, p) {
              d += p;
            });
          } else {
            return;
          }
        }
        f.append(d);
      }
      if (c.comm_question) {
        e.renderQuestion(c);
      }
      f.css({
        top: c.top,
        left: c.left,
        right: c.right,
        width: c.width || f.outerWidth(),
        height: c.height || f.outerHeight(),
      });
      e.spread();
    }
    var h = $(".ai-search-input"),
      l = h.find(".power-search-del");
    var k = 0,
      i = null;
    var b = $("#powerIpt");
    b.off().on({
      keydown: function (o) {
        o.stopPropagation();
      },
      keyup: function (o) {
        o.stopPropagation();
      },
      input: function (o) {
        i = null;
        k = o.timeStamp;
        i = setTimeout(function () {
          if (k == o.timeStamp) {
            b.siblings(".ai-search-btn").trigger("click");
          }
        }, 400);
      },
      focus: function (o) {
        o.preventDefault();
        var p = b.val();
        if (p == "") {
          e.hotLabelHideorShow("hide", "show");
        } else {
          e.hotLabelHideorShow("hide", "hide");
          if ($(".power-search-result").css("display") == "block") {
            return;
          }
          e.powerSearch(p);
        }
        if (!c.extra) {
          $("#extra-box").hide();
        }
        l.show();
      },
      blur: function (o) {
        var p = b.val();
        if (p == "") {
          setTimeout(function () {
            e.hotLabelHideorShow("show", "hide");
          }, 10);
          if (!c.extra) {
            $("#extra-box").show();
          }
          l.hide();
        } else {
          e.hotLabelHideorShow("hide", "hide");
        }
        o.stopPropagation();
      },
    });
    h.off("click.search").on("click.search", ".ai-search-btn", function (o) {
      var p = b.val();
      if (p != "") {
        e.powerSearch(p);
        e.hotLabelHideorShow("hide", "hide");
        l.show();
      } else {
        $(".power-search-result").hide();
        e.hotLabelHideorShow("hide", "show");
        l.hide();
      }
      o.stopPropagation();
    });
    h.off("click.del").on("click.del", ".power-search-del", function () {
      b.val("");
      $(".power-search-result").hide();
      e.hotLabelHideorShow("show", "hide");
      $("#extra-box").css("display", "block");
      l.hide();
    });
    $(".search-hot")
      .off("click.hot")
      .on("click.hot", ".hot-item", function (p) {
        p.stopPropagation();
        var q = $(this).text(),
          o = b.val();
        if (q == o) {
          return;
        }
        b.val(q);
        b.focus();
      });
    $(".power-hot-tag, .power-search-result")
      .off("mousedown")
      .on("mousedown", ".hot-item", function (p) {
        p.stopPropagation();
        var q = $(this).text(),
          o = b.val();
        b.focus();
        if (q == o) {
          return;
        }
        b.val(q);
        b.siblings(".ai-search-btn").trigger("click");
      });
    f.off("mousedown.power").on("mousedown.power", ".comm-item, ", function () {
      var r = $(this),
        o = r.text(),
        q = r.attr("desc"),
        p = r.attr("url");
      if (o && q && p) {
        smartAiHelpCon.tutorial(o, q, p);
      }
      smartAiHelpCon.close();
    });
    f.off("click.ai-pin").on("click.ai-pin", ".res-temp", function (x) {
      var v = $(this),
        y = v.attr("tit"),
        u = v.attr("desc") || "",
        o = v.attr("photoUrl") || "";
      var s = c.ai_tag_list;
      if (u || o) {
        var t = v.text();
        e.tutorial(t, u, o);
        e.close();
        return;
      }
      if (s[y] == undefined) {
        return;
      }
      var q = "center";
      var p = "";
      var r = s[y].trigger_btn,
        w = s[y].ponalign;
      if (r) {
        $(r).trigger("click");
        p = $(s[y].tag);
      } else {
        p = $(s[y]);
      }
      if (w) {
        q = w;
      }
      setTimeout(function () {
        e.drawingPin(p, q);
        e.close();
      }, 200);
      x.stopPropagation();
    });
    $("#right-help-con")
      .off("mousedown.helpcon")
      .on("mousedown.helpcon", function (o) {
        o.stopPropagation();
      });
    e.getHotCon(c);
  },
  renderQuestion: function (b) {
    var a =
      "https://ai.processon.com/doc/random/" +
      b.channel +
      "/" +
      b.designerType +
      "/" +
      b.questions;
    $.ajax({
      url: a,
      type: "get",
      contentType: "application/json",
      success: function (f) {
        if (f.result == "success") {
          var f = f.data;
          var d =
            "<div class='comm-question'><div class='comm-question'><div class='comm-set'></div><div class='comm-tit'>常见问题</div>";
          for (var c = 0; c < f.length; c++) {
            var e = f[c];
            d +=
              "<div class='comm-item' desc = '" +
              e.desc +
              "' url = '" +
              e.photoUrl +
              "'>" +
              e.title +
              "</div>";
          }
          d += "</div>";
          if ($("#extra-box").length) {
            $("#extra-box").append(d);
          } else {
            $("#right-help-con").append(d);
          }
        } else {
          console.log(error);
        }
      },
      error: function () {
        console.log("error");
      },
    });
  },
  receiveHot: false,
  getHotCon: function (b) {
    var c = this;
    if (c.receiveHot) {
      return;
    }
    var a =
      "https://ai.processon.com/searchTag/" + b.channel + "/" + b.designerType;
    $.ajax({
      url: a,
      type: "Post",
      success: function (f) {
        if (f.result == "success") {
          if (f.result == "success") {
            if (f.data == null) {
              return;
            }
            b.hotCon = f.data.tag;
            var g = b.hotCon.split(",");
            var e = "",
              d = "";
            $.each(g, function (h, i) {
              if (h > 3) {
                return false;
              }
              if (h < 2) {
                e += "<span class='hot-item'>" + i + "</span>";
              }
              d += "<span class='hot-item'>" + i + "</span>";
            });
          }
          $(".ai-search-input").find(".hot-temp").html(e);
          $(".power-hot-tag").find(".hot-temp").html(d);
          c.receiveHot = true;
        } else {
        }
      },
      error: function () {
        console.log("error");
      },
    });
  },
  resultLoading: false,
  powerSearch: function (e) {
    var c = this;
    if (c.resultLoading) {
      return;
    }
    c.resultLoading = true;
    var a = $(".power-search-result");
    var b = "https://ai.processon.com/search";
    var d = JSON.stringify({
      keyword: e,
      designerType: c.params.designerType,
      channel: c.params.channel,
    });
    $.ajax({
      url: b,
      type: "POST",
      contentType: "application/json",
      data: d,
      success: function (n) {
        if (n.result == "success") {
          var m = n.data,
            q = m.toolbarList,
            p = m.docList;
          var o = [];
          if (!m.elementsCount || m.elementsCount < 1) {
            if ($(".tag-box.empty-rec").length > 0) {
              c.resultLoading = false;
              a.show();
              return;
            }
            a.hide();
            o.push(
              "<div class='tag-box empty-rec colle-box'><h6 style='margin-top:-3px'>找不到你想要的，试试这样搜</h6><div class='hot-temp'>"
            );
            var g = c.params.hotCon.split(",");
            $.each(g, function (i, j) {
              if (i < 4) {
                o.push("<span class='hot-item'>" + j + "</span>");
              }
            });
            o.push("</div></div>");
          } else {
            a.hide();
            if (q.length) {
              for (var h = 0; h < q.length; h++) {
                var s = q[h],
                  l = s.func.split(",")[0];
                var r = f(l, e);
                if (h < c.params.resultNum) {
                  o.push(
                    "<div id='" +
                      s.id +
                      "' class='res-temp' tit='" +
                      s.tit +
                      "'>" +
                      r +
                      "</div>"
                  );
                }
              }
            }
            if (p.length) {
              for (var k = 0; k < p.length; k++) {
                var s = p[k],
                  l = s.title.split(",")[0];
                var r = f(l, e);
                if (k < c.params.resultNum) {
                  o.push(
                    "<div desc='" +
                      s.desc +
                      "' photoUrl='" +
                      s.photoUrl +
                      "' id='" +
                      s.id +
                      "' class='res-temp'>" +
                      r +
                      "</div>"
                  );
                }
              }
            }
          }
          o = o.splice(0, c.params.resultNum).join("");
          a.html(o).show(100);
          c.resultLoading = false;
          function f(j, x) {
            var i = x.length,
              v = j.indexOf(x);
            if (v > -1) {
              var u = j.substring(0, v),
                t = j.substring(v + i);
              var w = u + '<span style="color:#DE0F18">' + x + "</span>" + t;
              return w;
            } else {
              return j;
            }
          }
        } else {
          if ($(".tag-box.empty-rec").length > 0) {
            c.resultLoading = false;
            return;
          }
          var o =
            "<div class='tag-box empty-rec colle-box'><h6 style='margin-top:-3px'>找不到你想要的，试试这样搜</h6><div class='hot-temp'>";
          var g = c.params.hotCon.split(",");
          $.each(g, function (i, j) {
            if (i < 4) {
              o += "<span class='hot-item'>" + j + "</span>";
            }
          });
          o += "</div></div>";
          $(".power-search-result").html(o);
          c.resultLoading = false;
        }
      },
      error: function (f) {
        c.resultLoading = false;
      },
    });
  },
  drawingTime: null,
  drawingPin: function (c, e) {
    if (!c.length) {
      return;
    }
    var j = $("#earch-drawing-pin");
    var h = this;
    if (j.length) {
      clearTimeout(h.drawingTime);
    } else {
      var f = $("#right-help-con").find(".ai-search-btn").offset(),
        a = f.top,
        l = f.left;
      j = $(
        "<div id='earch-drawing-pin' style='top:" +
          (a - 2) +
          "px; left:" +
          l +
          "px' class='search-drawing-pin'><div class='pin'><span class='icons'>&#xe6c1c;</span></div><div class='pulse'></div></div>"
      ).appendTo($("body"));
    }
    var g = c.offset(),
      b = g.left,
      k = g.top,
      d = b,
      i = k - 24;
    if (!isNaN(parseInt(e))) {
      d += parseInt(e);
    } else {
      if (e == "center") {
        d += c.outerWidth() / 2 - 8;
      }
    }
    i = i > 0 ? i : 0;
    setTimeout(function () {
      j.css({ top: i, left: d });
    });
    h.drawingTime = setTimeout(function () {
      j.remove();
    }, 5000);
    $(".power-search-result").hide();
  },
  tutorial: function (f, e, j, h) {
    var c = $("#power-tutorial-con");
    if (c.length < 1) {
      c = $(
        '<div id="power-tutorial-con" style="overflow:hidden" class="tutorial-detail dialog-box"><h3></h3><div class="tutorial-image"></div><div class="tutorial-text"><div class="textarea"></div></div></div>'
      );
      c.appendTo("body");
    }
    var g = c.find("h3"),
      b = c.find(".tutorial-image"),
      i = c.find(".tutorial-text");
    g.text(f);
    i.find(".textarea").html(e);
    if (j != null) {
      b.css({ border: "1px solid #e3e3e3", padding: "20px 0px 20px 0px" });
      c.css({ "z-index": 11, width: this.params.tutorial });
      var d = '<img style="width:100%" src="' + j + '"/>';
      b.html(d);
      b.find("img").on("load", function () {
        a(c);
      });
    } else {
      b.empty();
      b.css({ border: "none", padding: 0 });
      a(c);
    }
    function a(k) {
      k.dialog();
    }
    $(".power-search-result").hide();
  },
  close: function () {
    var b = $("#right-help-con");
    b.addClass("remove");
    var a = $(".ai-search-input");
    a.find(".power-search-del").trigger("click");
    setTimeout(function () {
      b.css("display", "none");
    }, 300);
  },
  spread: function () {
    var a = $("#right-help-con");
    a.removeClass("remove").css("display", "block");
    $("#extra-box").css("display", "block");
  },
  hotLabelHideorShow: function (a, d) {
    var b = $(".tag-box.power-hot-tag"),
      c = $(".ai-search-input").find(".search-hot");
    a == "show" ? c.css({ display: "block" }) : c.css({ display: "none" });
    d == "show" ? b.css({ display: "block" }) : b.css({ display: "none" });
  },
};
(function (c) {
  c.fn.button = function (e) {
    if (typeof e == "string") {
      if (e == "disable") {
        c(this).addClass("disabled");
        c(this).find("input").attr("disabled", true);
      } else {
        if (e == "enable") {
          c(this).removeClass("disabled");
          c(this).find("input").attr("disabled", false);
        } else {
          if (e == "isDisabled") {
            return c(this).hasClass("disabled");
          } else {
            if (e == "isSelected") {
              return c(this).hasClass("selected");
            } else {
              if (e == "unselect") {
                c(this).removeClass("selected");
              } else {
                if (e == "select") {
                  c(this).addClass("selected");
                } else {
                  if (e == "setText") {
                    c(this).children(".text_content").html(arguments[1]);
                  } else {
                    if (e == "setColor") {
                      c(this)
                        .children(".btn_color")
                        .css("background-color", "rgb(" + arguments[1] + ")");
                    } else {
                      if (e == "getColor") {
                        var d = c(this)
                          .children(".btn_color")
                          .css("background-color")
                          .replace(/\s/g, "");
                        return d.substring(4, d.length - 1);
                      }
                    }
                  }
                }
              }
            }
          }
        }
      }
      return c(this);
    }
    var f = c(this);
    f.unbind("click");
    f.unbind("mousedown");
    if (e.onClick) {
      f.bind("click", function (g) {
        if (f.button("isDisabled")) {
          return;
        }
        e.onClick(g);
      });
    }
    if (e.onMousedown) {
      f.bind("mousedown", function (g) {
        if (f.button("isDisabled")) {
          return;
        }
        e.onMousedown();
        g.stopPropagation();
      });
    }
  };
  var b = null;
  c.fn.dropdown = function (e) {
    var i = c(this);
    i.find(".ico_selected").remove();
    if (typeof e == "string") {
      if (e == "close") {
        i.hide();
        b.target.removeClass("selected");
        c(document).unbind("mousedown.ui_dropdown");
        b = null;
      } else {
        if (e == "select") {
          arguments[1].prepend(
            "<div class='ico ico_selected  diagraming-icons'>&#xe75c;</div>"
          );
        }
      }
      return;
    }
    if (b != null) {
      b.menu.dropdown("close");
    }
    var i = c(this);
    var d = e.target;
    b = { target: d, menu: i };
    var h = d.offset();
    d.addClass("selected");
    i.show();
    var g;
    if (e.position == "center") {
      g = h.left + d.outerWidth() / 2 - i.outerWidth() / 2;
    } else {
      if (e.position == "right") {
        g = h.left + d.outerWidth() - i.outerWidth();
      } else {
        g = h.left;
      }
    }
    var f = h.top + d.outerHeight();
    if (f + i.outerHeight() > c(window).height()) {
      f = c(window).height() - i.outerHeight();
    }
    i.css({ top: f, left: g });
    if (typeof e.zindex != "undefined") {
      i.css("z-index", e.zindex);
    }
    i.unbind("mousedown").bind("mousedown", function (j) {
      j.stopPropagation();
    });
    if (typeof e.bind == "undefined" || e.bind == true) {
      i.find("li:not(.devider,.menu_text)")
        .unbind()
        .bind("click", function () {
          var j = c(this);
          if (
            !j.menuitem("isDisabled") &&
            j.children(".extend_menu").length == 0
          ) {
            if (e.onSelect) {
              e.onSelect(j);
            }
            i.dropdown("close");
          }
        });
    }
    c(document).bind("mousedown.ui_dropdown", function (j) {
      if (c(j.target).parents("#color_picker").length) {
        return;
      }
      i.dropdown("close");
    });
  };
  c.colorShow = function (f) {
    var e = c("#color_picker");
    e.find(".selected").removeClass("selected");
    if (!e.attr("init")) {
      e.find("div").each(function () {
        var h = c(this).css("background-color");
        h = h.replace(/\s/g, "");
        h = h.substring(4, h.length - 1);
        c(this).attr("col", h);
      });
      e.attr("init", true);
    }
    var g = c.extend({}, f, { bind: false });
    e.dropdown(g);
    e.children(".color_items")
      .children("div")
      .off()
      .on("mousedown", function (i) {
        i.preventDefault();
        if (f.onSelect) {
          var h = c(this).css("background-color");
          f.onSelect(h);
        }
        c("#color_picker").dropdown("close");
      });
    e.children(".color_items")
      .children("div")
      .off("mouseenter")
      .on("mouseenter", function () {
        var h = c(this).css("background-color");
        h = h.replace(/\s/g, "");
        h = UI.RGB2Hex(h);
        e.children(".color_hex").find("input").val(h);
      });
    e.children(".color_hex")
      .find("input")
      .off("keyup")
      .on("keyup", function () {
        var i = c(this).val();
        if (i.length == 3 || i.length == 6) {
          var h = UI.hex2RGB("#" + i);
          if (f.onSelect) {
            f.onSelect(h);
          }
        }
      });
    if (f.color) {
      e.find("div[col='" + f.color + "']").addClass("selected");
      var d = UI.RGB2Hex("rgb(" + f.color + ")");
      e.children(".color_hex").find("input").val(d);
    }
    if (f.trans == true) {
      e.find(".color_transparent").show();
    } else {
      e.find(".color_transparent").hide();
    }
    c("#color_picker").children(".color_extend").remove();
    if (f.extend) {
      c("#color_picker").append(
        "<div class='color_extend'>" + f.extend + "</div>"
      );
    }
  };
  c.colorpicker = function (f) {
    var e = c("#color_picker");
    var d = {
      data: { hsb: { h: 0, s: 100, b: 100 }, rgba: { r: 0, g: 0, b: 0, a: 1 } },
      init: function () {
        var l = this;
        this.setHistory();
        if (!e.attr("init")) {
          e.find(".color_items>div").each(function () {
            var n = c(this).css("background-color");
            n = n.replace(/\s/g, "");
            n = n.substring(4, n.length - 1);
            var o = n.split(",");
            var m = l.rgbToHex({ r: o[0] - 0, g: o[1] - 0, b: o[2] - 0 });
            c(this)
              .attr("col", n)
              .attr("original-title", "#" + m);
          });
          e.attr("init", true);
        }
        var h = c.extend({}, f, { bind: false });
        if (h.dropdown == undefined || h.dropdown) {
          e.dropdown(h);
        } else {
          var g = f.target;
          var j = g.offset();
          e.css({ top: j.top, left: j.left + g.outerWidth() + 1 }).show();
        }
        e.find(".color_items").children("div").removeClass("selected");
        if (f.color == "transparent") {
          var i = "FFFFFF";
        } else {
          if (f.color) {
            var k = f.color.replace(/[^\d,]/g, "").split(",");
            this.data.rgba.r = k[0] - 0;
            this.data.rgba.g = k[1] - 0;
            this.data.rgba.b = k[2] - 0;
            e.find(".color_items")
              .children("div[col='" + f.color + "']")
              .eq(0)
              .addClass("selected");
            var i = this.rgbToHex(this.data.rgba);
          } else {
            var i = "FFFFFF";
          }
        }
        e.find(".color_show_history")
          .css("background", "#" + i)
          .attr("original-title", "当前色#" + i);
        e.find(".input_hex").val(i);
        this.setColorByInput("input_hex", i);
        if (f.trans == true) {
          e.find(".color_transparent").show();
        } else {
          e.find(".color_transparent").hide();
        }
        e.children(".color_extend").remove();
        if (f.extend) {
          e.append("<div class='color_extend'>" + f.extend + "</div>");
        }
        if (c(document).width() - e.offset().left - e.width() < 196) {
          e.find(".more_panel").addClass("left");
        } else {
          e.find(".more_panel").removeClass("left");
        }
        this.domEvent();
      },
      domEvent: function () {
        var h = this;
        e.find(".color_items")
          .children("div")
          .unbind()
          .bind("click", function () {
            h.selectColor(c(this).css("background-color"));
            d.close();
          });
        e.children(".color_transparent")
          .off("click")
          .on("click", function () {
            if (f.onSelect) {
              f.onSelect("transparent");
            }
            d.close();
          });
        e.find(".color_panel,.hue_horizontal")
          .off("mousedown.colorPicker")
          .on("mousedown.colorPicker", function (k) {
            var l = c(this),
              j = l.offset().left,
              i = l.offset().top;
            h.setPickerPin(l, k.pageX - j, k.pageY - i);
            c(document)
              .off("mousemove.colorPicker")
              .on("mousemove.colorPicker", function (m) {
                h.setPickerPin(l, m.pageX - j, m.pageY - i);
              });
            c(document)
              .off("mouseup.colorPicker")
              .on("mouseup.colorPicker", function () {
                h.selectColor(h.data.rgba);
                c(document).off("mousemove.colorPicker");
                c(document).off("mouseup.colorPicker");
              });
          });
        var g = "";
        e.find(".input_box input")
          .off("focus.colorPicker")
          .on("focus.colorPicker", function (i) {
            g = c(this).val();
          });
        e.find(".input_box input")
          .off("keydown.colorPicker")
          .on("keydown.colorPicker", function (i) {
            if (i.keyCode == 13) {
              d.close();
            }
          });
        e.find(".input_box input")
          .off("paste.colorPicker")
          .on("paste.colorPicker", function (i) {
            i.stopPropagation();
          });
        e.find(".input_box input")
          .off("input.colorPicker")
          .on("input.colorPicker", function (k) {
            var j = c(this).attr("class"),
              l = c(this).val();
            if (j == "input_hex") {
              var i = l.replace(/[^\da-fA-F]/g, "");
              if (i != l) {
                l = i;
                c(this).val(i);
              }
            } else {
              var i = l.replace(/[^\d]/g, "");
              if (i - 255 > 0) {
                i = "255";
              }
              if (i != l) {
                l = i;
                c(this).val(i);
              }
            }
            if (g == l) {
              return;
            }
            g = l;
            h.setColorByInput(j, l);
            h.selectColor(h.data.rgba);
          });
        e.find(".color_show_history")
          .off("click")
          .on("click", function () {
            var i = c(this).attr("original-title").split("#")[1];
            e.find(".input_box .input_hex").val(i);
            h.setColorByInput("input_hex", i);
            h.selectColor(h.data.rgba);
          });
        if (f.dropdown == undefined || f.dropdown) {
          e.off("mouseenter").off("mouseleave");
        } else {
          e.off("mouseenter").on("mouseenter", function (i) {
            f.target.addClass("selected");
          });
          e.off("mouseleave").on("mouseleave", function (i) {
            if (c("#hover_tip").is(":visible")) {
              return;
            }
            f.target.removeClass("selected");
            e.hide();
          });
        }
        if (f.stopPropagation) {
          e.off("mousedown").on("mousedown", function (i) {
            i.preventDefault();
            i.stopPropagation();
          });
        }
      },
      close: function () {
        if (f.dropdown == undefined || f.dropdown) {
          e.dropdown("close");
        } else {
          e.hide();
          f.target.removeClass("selected");
          f.target.parent().dropdown("close");
        }
      },
      setHistory: function (i) {
        var l = this;
        var j = localStorage.getItem("recent_used_color"),
          g = 0;
        try {
          j = JSON.parse(j);
          g = j.length;
        } catch (k) {
          j = [];
          g = 0;
        }
        if (i) {
          var h = { color: i, time: new Date().getTime() };
          j = j.filter(function (m) {
            return m.color != i;
          });
          if (j.length == 8) {
            j.pop();
          }
          j.unshift(h);
          localStorage.setItem("recent_used_color", JSON.stringify(j));
          g = j.length;
        }
        e.find(".history_color>div").each(function (m) {
          if (m < g && j[m]) {
            var o = j[m].color;
            c(this).css("background-color", o).removeClass("disabled");
            o = o.replace(/\s/g, "");
            o = o.substring(4, o.length - 1);
            var p = o.split(",");
            var n = l.rgbToHex({ r: p[0] - 0, g: p[1] - 0, b: p[2] - 0 });
            c(this)
              .attr("col", o)
              .attr("original-title", "#" + n);
            if (j[m].color == "rgb(255,255,255)") {
              c(this).css("border-color", "rgba(238,238,238)");
            } else {
              c(this).css("border-color", "");
            }
          } else {
            c(this).removeAttr("style").removeAttr("col").addClass("disabled");
          }
        });
      },
      selectColor: function (g) {
        if (typeof g == "object") {
          g = "rgb(" + g.r + "," + g.g + "," + g.b + ")";
        }
        if (f.onSelect) {
          g = g.replace(/\s/g, "");
          this.setHistory(g);
          g = g.substring(4, g.length - 1);
          f.onSelect(g);
        }
      },
      setPickerPin: function (m, g, n) {
        var j = this.data.hsb,
          k = this.data.rgba,
          i = m.width(),
          l = m.height();
        g = Math.max(0, Math.min(g, i));
        if (m.hasClass("hue_horizontal")) {
          n = "50%";
          j.h = Math.round((360 * g) / i);
          this.setPancelColor(j.h);
        } else {
          n = Math.max(0, Math.min(n, l));
          j.s = Math.round((100 * g) / i);
          j.b = Math.round((100 * (l - n)) / l);
        }
        m.find(".picker_pin").css({ left: g, top: n });
        this.setShowColor();
        this.setValue(k);
      },
      setPancelColor: function (i) {
        var g = this.HSBToRGB({ h: i, s: 100, b: 100 });
        e.find(".color_panel").css(
          "background",
          "rgba(" + g.r + "," + g.g + "," + g.b + "," + this.data.rgba.a + ")"
        );
      },
      setShowColor: function () {
        var g = this.data.hsb,
          i = this.data.rgba,
          h = this.HSBToRGB(g),
          j = this.rgbToHex(h);
        i.r = h.r;
        i.g = h.g;
        i.b = h.b;
        e.find(".color_show_now")
          .css(
            "background",
            "rgba(" + h.r + "," + h.g + "," + h.b + "," + this.data.rgba.a + ")"
          )
          .attr("original-title", "预览色#" + j);
      },
      setValue: function (g, h) {
        if (h != "hex") {
          e.find(".input_hex").val(this.rgbToHex(g));
        }
        if (h != "rgb") {
          e.find(".input_r").val(g.r);
          e.find(".input_g").val(g.g);
          e.find(".input_b").val(g.b);
        }
      },
      setColorByInput: function (j, n) {
        var m = this.data;
        switch (j) {
          case "input_hex":
            if (n.length == 3) {
              n = "#" + n[0] + n[0] + n[1] + n[1] + n[2] + n[2];
              m.hsb = this.hexToHsb(n);
            } else {
              if (n.length == 6) {
                m.hsb = this.hexToHsb(n);
              }
            }
            j = "hex";
            break;
          default:
            var l = e.find(".input_r").val(),
              k = e.find(".input_g").val(),
              h = e.find(".input_b").val(),
              i = {
                r: l ? parseInt(l) : 0,
                g: k ? parseInt(k) : 0,
                b: h ? parseInt(h) : 0,
              };
            m.hsb = this.rgbToHsb(i);
            j = "rgb";
        }
        this.setPancelColor(m.hsb.h);
        this.setShowColor();
        this.setValue(m.rgba, j);
        this.changeViewByHsb();
      },
      changeViewByHsb: function () {
        var h = this.data.hsb,
          j = e.find(".color_panel"),
          k = e.find(".hue_horizontal"),
          l = k.width(),
          g = j.width(),
          i = j.height();
        j.find(".picker_pin").css({
          left: Math.round((h.s * g) / 100),
          top: Math.round(((100 - h.b) * i) / 100),
        });
        k.find(".picker_pin").css({ left: Math.round((h.h / 360) * l) });
      },
      HSBToRGB: function (g) {
        var j = {};
        var n = Math.round(g.h);
        var m = Math.round((g.s * 255) / 100);
        var i = Math.round((g.b * 255) / 100);
        if (m == 0) {
          j.r = j.g = j.b = i;
        } else {
          var o = i;
          var l = ((255 - m) * i) / 255;
          var k = ((o - l) * (n % 60)) / 60;
          if (n == 360) {
            n = 0;
          }
          if (n < 60) {
            j.r = o;
            j.b = l;
            j.g = l + k;
          } else {
            if (n < 120) {
              j.g = o;
              j.b = l;
              j.r = o - k;
            } else {
              if (n < 180) {
                j.g = o;
                j.r = l;
                j.b = l + k;
              } else {
                if (n < 240) {
                  j.b = o;
                  j.r = l;
                  j.g = o - k;
                } else {
                  if (n < 300) {
                    j.b = o;
                    j.g = l;
                    j.r = l + k;
                  } else {
                    if (n < 360) {
                      j.r = o;
                      j.g = l;
                      j.b = o - k;
                    } else {
                      j.r = 0;
                      j.g = 0;
                      j.b = 0;
                    }
                  }
                }
              }
            }
          }
        }
        return { r: Math.round(j.r), g: Math.round(j.g), b: Math.round(j.b) };
      },
      rgbToHex: function (g) {
        var h = [g.r.toString(16), g.g.toString(16), g.b.toString(16)];
        h.map(function (k, j) {
          if (k.length == 1) {
            h[j] = "0" + k;
          }
        });
        return h.join("").toUpperCase();
      },
      hexToRgb: function (g) {
        var g = parseInt(g.indexOf("#") > -1 ? g.substring(1) : g, 16);
        return { r: g >> 16, g: (g & 65280) >> 8, b: g & 255 };
      },
      hexToHsb: function (g) {
        return this.rgbToHsb(this.hexToRgb(g));
      },
      rgbToHsb: function (i) {
        var h = { h: 0, s: 0, b: 0 };
        var j = Math.min(i.r, i.g, i.b);
        var g = Math.max(i.r, i.g, i.b);
        var k = g - j;
        h.b = g;
        h.s = g != 0 ? (255 * k) / g : 0;
        if (h.s != 0) {
          if (i.r == g) {
            h.h = (i.g - i.b) / k;
          } else {
            if (i.g == g) {
              h.h = 2 + (i.b - i.r) / k;
            } else {
              h.h = 4 + (i.r - i.g) / k;
            }
          }
        } else {
          h.h = -1;
        }
        h.h *= 60;
        if (h.h < 0) {
          h.h += 360;
        }
        h.s *= 100 / 255;
        h.b *= 100 / 255;
        return h;
      },
    };
    d.init();
  };
  c.fn.colorButton = function (e) {
    var d = c(this);
    if (typeof e == "string") {
      if (e == "setColor") {
        if (arguments[1] == "transparent") {
          d.children(".picker_btn_holder").css(
            "background-color",
            "transparent"
          );
        } else {
          d.children(".picker_btn_holder").css(
            "background-color",
            "rgb(" + arguments[1] + ")"
          );
        }
      }
      return;
    }
    d.html(
      "<div class='picker_btn_holder'></div><div class='ico ico_colordrop'></div>"
    );
    d.bind("mousedown", function (h) {
      if (d.button("isDisabled")) {
        return;
      }
      h.stopPropagation();
      var g = c.extend({}, e);
      g.target = d;
      g.onSelect = function (i) {
        d.colorButton("setColor", i);
        if (e.onSelect) {
          e.onSelect(i);
        }
      };
      var f = c(this).children(".picker_btn_holder").css("background-color");
      f = f.replace(/[^\d,]/g, "");
      g.color = f;
      c.colorpicker(g);
    });
  };
  c.fn.spinner = function (g) {
    var j = c(this);
    if (typeof g == "string") {
      if (g == "getValue") {
        var d = j.find("input").val();
        d = parseInt(d);
        return d;
      } else {
        if (g == "setValue") {
          j.find("input").val(arguments[1]);
          j.attr("old", arguments[1]);
        } else {
          if (g == "setOptions") {
            var i = arguments[1];
            if (typeof i.min != "undefined") {
              j.attr("min", i.min);
            }
            if (typeof i.max != "undefined") {
              j.attr("max", i.max);
            }
          }
        }
      }
      return;
    }
    j.html(
      "<div class='spinner_input'><input/></div><div class='buttons'><div class='spinner_up'></div><div class='spinner_down'></div></div>"
    );
    var h = { step: 1, unit: "", max: 20000 };
    g = c.extend(h, g);
    if (typeof g.min != "undefined") {
      j.attr("min", g.min);
    }
    if (typeof g.max != "undefined") {
      j.attr("max", g.max);
    }
    var e = j.children(".spinner_input");
    var f = e.find("input");
    j.spinner("setValue", g.min + g.unit);
    j.find(".spinner_up").bind("click", function () {
      if (j.button("isDisabled")) {
        return;
      }
      var l = j.spinner("getValue");
      var k = l + g.step;
      a(j, k, g);
    });
    j.find(".spinner_down").bind("click", function () {
      if (j.button("isDisabled")) {
        return;
      }
      var l = j.spinner("getValue");
      var k = l - g.step;
      a(j, k, g);
    });
    f.bind("keydown", function (l) {
      if (l.keyCode == 13) {
        var k = parseInt(c(this).val());
        if (isNaN(k)) {
          return;
        }
        a(j, k, g);
      } else {
        if (l.keyCode == 38) {
          j.find(".spinner_up").trigger("click");
          f.focus();
        } else {
          if (l.keyCode == 40) {
            j.find(".spinner_down").trigger("click");
            f.focus();
          }
        }
      }
    })
      .bind("focus", function (l) {
        c(this).select();
        c(this).bind("mouseup", function (m) {
          m.preventDefault();
          c(this).unbind("mouseup");
        });
        var k = c(this).parent().parent();
        if (!k.hasClass("active")) {
          k.addClass("active inset");
        }
      })
      .bind("blur", function (m) {
        var l = c(this).parent().parent();
        if (l.hasClass("inset")) {
          l.removeClass("active inset");
        }
        var k = parseInt(c(this).val());
        if (isNaN(k)) {
          return;
        }
        a(j, k, g);
      });
  };
  function a(j, h, g) {
    if (j.attr("max")) {
      var d = parseInt(j.attr("max"));
      if (h > d) {
        h = d;
      }
    }
    if (j.attr("min")) {
      var f = parseInt(j.attr("min"));
      if (h < f) {
        h = f;
      }
    }
    var e = j.attr("old");
    var i = h + g.unit;
    if (e != i) {
      if (g.onChange) {
        g.onChange(h);
      }
    }
    j.spinner("setValue", h + g.unit);
  }
  c.fn.menuitem = function (d) {
    var e = c(this);
    if (typeof d == "string") {
      if (d == "disable") {
        e.addClass("disabled");
      } else {
        if (d == "enable") {
          e.removeClass("disabled");
        } else {
          if (d == "isDisabled") {
            return e.hasClass("disabled");
          } else {
            if (d == "isSelected") {
              return e.children(".ico_selected").length > 0;
            } else {
              if (d == "unselect") {
                return e.children(".ico_selected").remove();
              } else {
                if (d == "select") {
                  return e.prepend(
                    "<div class='ico ico_selected diagraming-icons'>&#xe75c;</div>"
                  );
                }
              }
            }
          }
        }
      }
    }
  };
  c.fn.dlg = function (d) {
    var g = c(this);
    if (typeof d == "string") {
      if (d == "close") {
        g.children(".dlg_close").trigger("click");
      }
      return;
    }
    var e = { closable: true };
    d = c.extend(e, d);
    var f = g.children(".dlg_close");
    if (f.length == 0) {
      f = c("<div class='ico dlg_close'></div>").appendTo(g);
    }
    if (d.closable == false) {
      f.hide();
    } else {
      f.show();
    }
    c(".dlg_mask").remove();
    c("body").append("<div class='dlg_mask'></div>");
    f.unbind().bind("click", function () {
      g.hide();
      c(".dlg_mask").remove();
      if (d && d.onClose) {
        d.onClose();
      }
      c(document).unbind("keydown.closedlg");
      g.find("input,textarea,select").unbind("keydown.closedlg");
    });
    g.css({
      left: (c(window).width() - g.outerWidth()) / 2,
      top: (c(window).height() - g.outerHeight()) / 2,
    });
    g.show();
    if (d.closable) {
      g.find("input,textarea,select")
        .unbind("keydown.closedlg")
        .bind("keydown.closedlg", function (h) {
          if (h.keyCode == 27) {
            g.children(".dlg_close").trigger("click");
          }
        });
      c(document)
        .unbind("keydown.closedlg")
        .bind("keydown.closedlg", function (h) {
          if (h.keyCode == 27) {
            g.children(".dlg_close").trigger("click");
          }
        });
    }
    g.children(".dialog_header")
      .unbind("mousedown.drag_dlg")
      .bind("mousedown.drag_dlg", function (j) {
        var i = c(this).parent();
        var m = j.pageX;
        var k = j.pageY;
        var l = i.offset().left;
        var h = i.offset().top;
        c(document).bind("mousemove.drag_dlg", function (p) {
          var o = p.pageX - m + l;
          var n = p.pageY - k + h;
          i.offset({ left: o, top: n });
        });
        c(document).bind("mouseup.drag_dlg", function (n) {
          c(document).unbind("mousemove.drag_dlg");
          c(document).unbind("mouseup.drag_dlg");
        });
      });
  };
  window.callback_public = function (e) {
    poCollect("验证发布", { 名称: "发布模板-验证发布" });
    if (e.ret === 0) {
      var d = e.ticket;
      c("#signup_ticket").val(d);
      c("#randstr").val(e.randstr);
      c("#TencentCaptcha").hide();
      c("#btn_submit_publish").show();
    }
  };
})(jQuery);
