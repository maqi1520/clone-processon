var flow2svg = {
  init: function (o) {
    var k = this;
    k.type = o;
    var b = $("#svg_exporter");
    this.cleanSvgHtml();
    var s = this.calcCanvasSize();
    var q = SVG("svg_exporter").size(s.w, s.h);
    var a = Model.define.elements;
    var l = Model.define.theme == null ? false : true;
    var n = Model.define.page;
    if (
      o == "jpg" &&
      (n.backgroundColor == null || n.backgroundColor == "transparent")
    ) {
      q.rect(s.w, s.h).fill("rgb(250,250,250)");
    } else {
      if (n.backgroundColor != null && n.backgroundColor != "transparent") {
        q.rect(s.w, s.h).fill("rgb(" + n.backgroundColor + ")");
      }
    }
    var p = [];
    for (var r in a) {
      p.push(Utils.copy(a[r]));
    }
    p = p.sort(function (j, i) {
      return j.props.zindex - i.props.zindex;
    });
    for (var g = 0, h = p.length; g < h; g++) {
      var m = p[g];
      if (m.name == "linker") {
        this.linker2svg(m, q, s, l);
      } else {
        if (m.parent == "" || m.parent == null) {
          this.shape2svg(m, q, s);
          if (m.children != null && m.children.length > 0) {
            var d = m.children;
            for (var f = 0; f < d.length; f++) {
              var e = d[f];
              if (!a[e]) {
                console.log(e);
                break;
              }
              var c = Utils.copy(a[e]);
              this.shape2svg(c, q, s, l);
            }
          }
        }
      }
    }
    if (Model.define.page.watermark) {
      this.setWatermark(Model.define.page.watermark, s);
    }
    return { w: s.w, h: s.h };
  },
  getSvgHtml: function () {
    this.init();
    var a = $("#svg_exporter").html();
    return a;
  },
  cleanSvgHtml: function () {
    $("#svg_exporter").html("");
  },
  shape2svg: function (shape, draw, canvasSize, hasTheme) {
    if ($.isEmptyObject(shape) || shape.name == "linker") {
      return;
    }
    var props = shape.props,
      x = 25,
      y = 25,
      w = props.w,
      h = props.h,
      path = shape.path,
      textBlock = shape.textBlock,
      dataAttr = shape.dataAttributes;
    props.x -= canvasSize.minX;
    props.y -= canvasSize.minY;
    x = props.x - 15;
    y = props.y - 15;
    var fStyle = Utils.getShapeFillStyle(shape.fillStyle, hasTheme);
    var lStyle = Utils.getShapeLineStyle(shape.lineStyle, hasTheme);
    var shapeBox = Utils.getShapeBox(shape);
    var shapeStyle = shape.shapeStyle;
    var defs = draw.defs();
    var group = draw
      .group()
      .attr("transform", "translate(" + x + "," + y + ")");
    renderShape(path, group, fStyle, lStyle, defs);
    renderShapeMarkers(group);
    renderText(textBlock, group);
    renderDataAttr(dataAttr, group);
    function renderShapeMarkers(group) {
      if (
        shape.attribute &&
        shape.attribute.markers &&
        shape.attribute.markers.length > 0
      ) {
        var markers = shape.attribute.markers;
        var size = Schema.config.markerSize;
        var spacing = 4;
        var offset = shape.attribute.markerOffset;
        var markersWidth =
          markers.length * size + (markers.length - 1) * spacing;
        var x = shape.props.w / 2 - markersWidth / 2;
        for (var i = 0; i < markers.length; i++) {
          var markerName = markers[i];
          var top = shape.props.h - size - offset;
          var marker_g = group
            .group()
            .attr("transform", "translate(" + x + "," + top + ")");
          var markerPaths = Schema.markers[markerName].call(shape, size);
          renderShape(markerPaths, marker_g, fStyle, lStyle, defs);
          x += size + spacing;
        }
      }
    }
    function renderShape(path, group, fStyle, lStyle, defs) {
      if (shape.category == "grid") {
        var gridPath = [];
        for (var i = 0; i < path.length; i++) {
          for (var j = 0; j < path[i].length; j++) {
            path[i][j].row = i;
            path[i][j].column = j;
            gridPath.push(path[i][j]);
          }
        }
        path = gridPath;
      }
      for (var i = 0; i < path.length; i++) {
        var cmd = path[i];
        var lineStyle = $.extend({}, lStyle, cmd.lineStyle);
        var fillStyle = $.extend({}, fStyle, cmd.fillStyle);
        var actions = cmd.actions,
          pathStr = "";
        for (var j = 0; j < actions.length; j++) {
          var action = actions[j];
          pathStr += parsePath(action, w, h, lineStyle.lineWidth);
        }
        var group_path = group.path(pathStr);
        renderBorder(lineStyle, fillStyle, group_path);
        shape.theme = shape.theme || {};
        if (shape.theme.name == "header") {
          if (cmd.row == 0) {
            fillStyle = $.extend(
              {},
              fStyle,
              shape.theme.row[0].fillStyle,
              cmd.fillStyle
            );
          } else {
            fillStyle = $.extend(
              {},
              fStyle,
              shape.theme.row[1].fillStyle,
              cmd.fillStyle
            );
          }
        } else {
          if (shape.theme.name == "striping") {
            if (shape.theme.row) {
              fillStyle = $.extend(
                {},
                fStyle,
                shape.theme.row[cmd.row % 2].fillStyle,
                cmd.fillStyle
              );
            }
            if (shape.theme.column) {
              fillStyle = $.extend(
                {},
                fStyle,
                shape.theme.column[cmd.column % 2].fillStyle,
                cmd.fillStyle
              );
            }
          }
        }
        renderFill(fillStyle, group_path, defs);
      }
      if (props.angle != null && props.angle != 0) {
        var angle = (180 * props.angle) / Math.PI;
        group.rotate(angle, props.w / 2, props.h / 2);
      }
    }
    function renderFill(fillStyle, group_path, defs) {
      if (fillStyle.type == "none") {
        if (group_path != null) {
          group_path.fill("none");
        }
        return;
      } else {
        if (fillStyle.type == "image") {
          var image = fillStyle.fileId;
          if (image.indexOf("http") < 0) {
            if (image.indexOf("/") < 0) {
              image =
                location.origin +
                "/file/id/" +
                image +
                "/diagram_user_image.png";
            } else {
              if (image.indexOf("/") == 0) {
                image = location.origin + image;
              } else {
                image = location.origin + "/" + image;
              }
            }
            if (location.origin.indexOf("processon.com") > -1) {
              image = image.replace("http://", "https://");
            }
          } else {
            if (image.indexOf("orgu2a928.bkt.clouddn.com") >= 0) {
              image = image
                .replace("orgu2a928.bkt.clouddn.com", "cdn2.processon.com")
                .replace("http://", "https://");
            } else {
              if (image.indexOf("7xt9nt.com1.z0.glb.clouddn.com") >= 0) {
                image = image
                  .replace(
                    "7xt9nt.com1.z0.glb.clouddn.com",
                    "cdn.processon.com"
                  )
                  .replace("http://", "https://");
              } else {
                if (image.indexOf("p7o7ul1nf.bkt.clouddn.com") >= 0) {
                  image = image
                    .replace("p7o7ul1nf.bkt.clouddn.com", "cdn1.processon.com")
                    .replace("http://", "https://");
                }
              }
            }
            image = image.replace(/^http:\/\//, "https://");
          }
          var imgW = fillStyle.imageW,
            imgH = fillStyle.imageH,
            imgX = 0,
            imgY = 0;
          switch (fillStyle.display) {
            case "static":
              imgX = eval(
                "var w=" +
                  props.w +
                  ";var h = " +
                  props.h +
                  ";" +
                  fillStyle.imageX
              );
              imgY = eval(
                "var w=" +
                  props.w +
                  ";var h = " +
                  props.h +
                  ";" +
                  fillStyle.imageY
              );
              break;
            case "stretch":
              imgW = props.w;
              imgH = props.h;
              break;
            case "fill":
              if (h / imgH > w / imgW) {
                imgW = imgW * (h / imgH);
                imgH = h;
                imgX = (w - imgW) / 2;
              } else {
                imgH = imgH * (w / imgW);
                imgW = w;
                imgY = (h - imgH) / 2;
              }
              break;
            case "fit":
              if (h / imgH < w / imgW) {
                imgW = imgW * (h / imgH);
                imgH = h;
                imgX = (w - imgW) / 2;
              } else {
                imgH = imgH * (w / imgW);
                imgW = w;
                imgY = (h - imgH) / 2;
              }
              break;
            case "original":
              imgX = (w - imgW) / 2;
              imgY = (h - imgH) / 2;
              break;
            case "tile":
              w = imgW;
              h = imgH;
              break;
          }
          imgW = imgW > 0 ? imgW : 1;
          imgH = imgH > 0 ? imgH : 1;
          w = w > 0 ? w : 1;
          h = h > 0 ? h : 1;
          if (fillStyle.display == "stretch" && flow2svg.type == "pdfHD") {
            var image = group
              .image(image)
              .size(imgW, imgH)
              .attr({ preserveAspectRatio: "none", crossOrigin: "anonymous" });
            group_path.fill("transparent");
            image = null;
          } else {
            var pattern = group.pattern(w, h, function (img) {
              img
                .image(image)
                .size(imgW, imgH)
                .attr({ preserveAspectRatio: "none", crossOrigin: "anonymous" })
                .move(imgX, imgY);
            });
            group_path.fill(pattern);
            pattern = null;
          }
          return;
        }
      }
      if (fillStyle.type == "gradient" && fillStyle.gradientType == "radial") {
        fillStyle.alpha =
          fillStyle.alpha != null ? fillStyle.alpha : shapeStyle.alpha;
        var gradient = defs.gradient("radial", function (stop) {
          stop.at(0, "rgb(" + fillStyle.beginColor + ")", fillStyle.alpha);
          stop.at(1, "rgb(" + fillStyle.endColor + ")", fillStyle.alpha);
        });
        gradient.radius(fillStyle.radius);
        group_path.fill(gradient);
      } else {
        if (
          fillStyle.type == "gradient" &&
          fillStyle.gradientType == "linear"
        ) {
          fillStyle.alpha =
            fillStyle.alpha != null ? fillStyle.alpha : shapeStyle.alpha;
          var gradient = defs.gradient("linear", function (stop) {
            stop.at(0, "rgb(" + fillStyle.beginColor + ")", fillStyle.alpha);
            stop.at(1, "rgb(" + fillStyle.endColor + ")", fillStyle.alpha);
          });
          gradient.from(1, 0).to(0, 1);
          group_path.fill(gradient);
        } else {
          var st = $.extend(shape.fillStyle, fillStyle);
          var fillStyle_ = Utils.getShapeFillStyle(st, hasTheme);
          var color = fillStyle_.color;
          if (color.indexOf("r") >= 0) {
            var colors = [];
            if ($.isEmptyObject(shape.fillStyle)) {
              colors = fillStyle_.color.split(",");
            } else {
              colors = shape.fillStyle.color.split(",");
            }
            var r = colors[0];
            var g = colors[1];
            var b = colors[2];
            if (typeof r == "string") {
              color = color
                .replace("r", 255)
                .replace("g", 255)
                .replace("b", 255);
            } else {
              color = color.replace("r", r).replace("g", g).replace("b", b);
            }
            var cs = color.split(",");
            var newColor = [];
            newColor.push(eval(cs[0]));
            newColor.push(eval(cs[1]));
            newColor.push(eval(cs[2]));
            color = newColor.join(",");
          }
          var fs = { color: "rgb(" + color + ")" };
          if (fillStyle.alpha != null) {
            fs.opacity = fillStyle.alpha;
          } else {
            if (shapeStyle.alpha != null) {
              fs.opacity = shapeStyle.alpha;
            }
          }
          group_path.fill(fs);
        }
      }
    }
    function renderBorder(lineStyle, fillStyle, group_path) {
      var lineStyle_ = Utils.getShapeLineStyle(shape.lineStyle, false);
      var lineWidth = lineStyle.lineWidth;
      if (typeof lineStyle.lineWidth == "string") {
        lineWidth = eval(
          "var lineWidth=" + lineStyle_.lineWidth + ";" + lineStyle.lineWidth
        );
      }
      lineStyle.lineColor = lineStyle.lineColor ? lineStyle.lineColor : "0,0,0";
      shapeStyle.alpha = shapeStyle.alpha ? shapeStyle.alpha : "1";
      var style = {
        width: lineWidth,
        color: "rgba(" + lineStyle.lineColor + "," + shapeStyle.alpha + ")",
      };
      if (lineStyle.lineStyle == "dot") {
        style = $.extend(style, { dasharray: "3,4" });
      } else {
        if (lineStyle.lineStyle == "dashed") {
          style = $.extend(style, { dasharray: "10,6" });
        } else {
          if (lineStyle.lineStyle == "dashdot") {
            style = $.extend(style, { dasharray: "10,6,3,6" });
          }
        }
      }
      if (lineStyle.lineWidth == 0) {
        group_path.stroke("none");
      } else {
        group_path.stroke(style);
      }
    }
    function renderText(textBlock, group) {
      for (var i = 0; i < textBlock.length; i++) {
        var textObj = textBlock[i];
        var pos = textObj.position,
          text = textObj.text || "",
          style = null;
        var _group = group.group();
        var fontStyle = Utils.getShapeFontStyle(shape.fontStyle);
        fontStyle = $.extend({}, fontStyle, textObj.fontStyle);
        var _w = eval("var w=" + props.w + ";var h = " + props.h + ";" + pos.w);
        var _h = eval("var w=" + props.w + ";var h = " + props.h + ";" + pos.h);
        var _x = eval("var w=" + props.w + ";var h = " + props.h + ";" + pos.x);
        var _y = eval("var w=" + props.w + ";var h = " + props.h + ";" + pos.y);
        if (fontStyle.orientation == "horizontal") {
          var blockCenter = { x: _x + _w / 2, y: _y + _h / 2 };
          pos = {
            x: blockCenter.x - _h / 2,
            y: blockCenter.y - _w / 2,
            w: _h,
            h: _w,
          };
        }
        if (!$.isEmptyObject(UI.exportFile.eqImgObj)) {
          var eqImg = UI.exportFile.eqImgObj["text_" + shape.id + "_" + i];
          if (eqImg) {
            var latextTop = 0;
            if (fontStyle.vAlign == "middle") {
              latextTop = (_h - eqImg.h) / 2;
            } else {
              if (fontStyle.vAlign == "bottom") {
                latextTop = _h - eqImg.h;
              } else {
                latextTop = 0;
              }
            }
            var latextRect = _group.rect(eqImg.w, eqImg.h);
            latextRect.attr(
              "transform",
              "translate(" + _x + "," + (_y + latextTop) + ")"
            );
            var pattern = group.pattern(eqImg.w, eqImg.h, function (img) {
              img
                .image(UI.exportFile.eqDataUrl.src)
                .size(UI.exportFile.eqDataUrl.w, UI.exportFile.eqDataUrl.h)
                .attr({ preserveAspectRatio: "none", crossOrigin: "anonymous" })
                .move(eqImg.x, -eqImg.y);
            });
            latextRect.fill(pattern);
            pattern = null;
            continue;
          }
        }
        var style =
          "font-family:" +
          fontStyle.fontFamily +
          ";text-align:" +
          fontStyle.textAlign +
          ";font-size:" +
          fontStyle.size +
          "px;vertical-align:" +
          fontStyle.vAlign +
          ";color:rgb(" +
          fontStyle.color +
          ");";
        if (fontStyle.bold) {
          style += "font-weight:700;";
        } else {
          style += "font-weight:400;";
        }
        if (fontStyle.italic) {
          style += "font-style:italic;";
        }
        if (fontStyle.underline) {
          style += "text-decoration:underline;";
        }
        if (fontStyle.orientation == "horizontal") {
          style +=
            "line-height:" +
            100 * fontStyle.lineHeight +
            "%;width:" +
            Math.ceil(_h) +
            "px; -ms-word-wrap: break-word;word-break:break-word;overflow-wrap: break-word;border:0;";
        } else {
          style +=
            "line-height:" +
            100 * fontStyle.lineHeight +
            "%;width:" +
            Math.ceil(_w) +
            "px; -ms-word-wrap: break-word;word-break:break-word;overflow-wrap: break-word;border:0;";
        }
        text = text || "";
        text = text
          .replace(/\n/g, "</br>")
          .replace(/\u001C/g, " ")
          .replace(//g, " ")
          .replace(/<br><div><\/div>/g, "<br>");
        if (typeof isNewTextV != "undefined" && !isNewTextV) {
          text = text.replace(/</g, "&lt;").replace(/>/g, "&gt;");
          text = text.replace(/&lt;br&gt;/gi, "<br>");
          text = text
            .replace(/&lt;b&gt;/gi, "<b>")
            .replace(/&lt;\/b&gt;/gi, "</b>");
          text = text
            .replace(/&lt;div&gt;/gi, "<div>")
            .replace(/&lt;\/div&gt;/gi, "</div>");
          text = text
            .replace(/&lt;i&gt;/gi, "<i>")
            .replace(/&lt;\/i&gt;/gi, "</i>");
          text = text
            .replace(/&lt;u&gt;/gi, "<u>")
            .replace(/&lt;\/u&gt;/gi, "</u>");
          text = text
            .replace(/&lt;font/gi, "<font")
            .replace(/\"&gt;/gi, '">')
            .replace(/&lt;\/font&gt;/gi, "</font>");
          text = text
            .replace(/&lt;span/gi, "<span")
            .replace(/&lt;\/span&gt;/gi, "</span>");
          text = text.replace(/&lt;p/gi, "<p").replace(/&lt;\/p&gt;/gi, "</p>");
        }
        var tempDiv = $(
          "<div contenteditable=true style='" +
            style +
            ";display:inline-block;position: relative;'>" +
            text +
            "</div>"
        ).appendTo("body");
        var textH = tempDiv.outerHeight();
        var top = 0;
        if (fontStyle.vAlign == "middle") {
          top = (_h - textH) / 2;
        } else {
          if (fontStyle.vAlign == "bottom") {
            top = _h - textH;
          } else {
            top = 0;
          }
        }
        top = top + _y;
        var deg = 0;
        if (fontStyle.orientation == "horizontal") {
          top = _w / 2 - textH / 2;
          var textAngle = shape.props.angle;
          textAngle = (Math.PI * 1.5 + textAngle) % (Math.PI * 2);
          deg = Math.round((textAngle / (Math.PI * 2)) * 360);
          top = _x + top;
          _x = (props.h - _h) / 2 - props.h;
        }
        flow2svg.richText2svg(tempDiv, _group, _x, top, deg, shapeStyle.alpha);
        tempDiv.remove();
      }
    }
    function renderText1(textBlock, group) {
      for (var i = 0; i < textBlock.length; i++) {
        var textObj = textBlock[i];
        var pos = textObj.position,
          text = textObj.text,
          style = null;
        var fontStyle = Utils.getShapeFontStyle(shape.fontStyle);
        fontStyle = $.extend({}, fontStyle, textObj.fontStyle);
        var _w = eval("var w=" + props.w + ";var h = " + props.h + ";" + pos.w);
        var _h = eval("var w=" + props.w + ";var h = " + props.h + ";" + pos.h);
        var _x = eval("var w=" + props.w + ";var h = " + props.h + ";" + pos.x);
        var _y = eval("var w=" + props.w + ";var h = " + props.h + ";" + pos.y);
        if (fontStyle.orientation == "horizontal") {
          var blockCenter = { x: _x + _w / 2, y: _y + _h / 2 };
          pos = {
            x: blockCenter.x - _h / 2,
            y: blockCenter.y - _w / 2,
            w: _h,
            h: _w,
          };
        }
        var _group = group.group();
        var fobj = _group.foreignObject(_w, _h);
        fobj.attr("x", _x);
        fobj.attr("style", "overflow:visible;");
        var style =
          "font-family:" +
          fontStyle.fontFamily +
          ";text-align:" +
          fontStyle.textAlign +
          ";font-size:" +
          fontStyle.size +
          "px;vertical-align:" +
          fontStyle.vAlign +
          ";color:rgb(" +
          fontStyle.color +
          ");";
        if (fontStyle.bold) {
          style += "font-weight:700;";
        } else {
          style += "font-weight:400;";
        }
        if (fontStyle.italic) {
          style += "font-style:italic;";
        }
        if (fontStyle.underline) {
          style += "text-decoration:underline;";
        }
        if (fontStyle.orientation == "horizontal") {
          style +=
            "line-height:" +
            Math.round(fontStyle.size * 1.25) +
            "px;width:" +
            Math.ceil(_h) +
            "px;word-break:break-word;border:0;";
        } else {
          style +=
            "line-height:" +
            Math.round(fontStyle.size * 1.25) +
            "px;width:" +
            Math.ceil(_w) +
            "px;word-break:break-word;border:0;";
        }
        var tempDiv = $(
          "<div contenteditable=true style='" +
            style +
            ";display:inline-block;'></div>"
        ).appendTo("body");
        var text1 = (text || "")
          .replace(
            /<br><br>/g,
            "<div style='padding-top:" +
              Math.round(fontStyle.size * 1.25) +
              "px;'></div><div></div>"
          )
          .replace(/&nbsp;/g, "\u00a0")
          .replace(
            /<div><br>/g,
            "<div style='padding-top:" +
              Math.round(fontStyle.size * 1.25) +
              "px;'>"
          )
          .replace(/<br>/g, "<div></div>");
        text1 = text1
          .replace(/\n/g, "<div></div>")
          .replace(/\t/g, "&nbsp;")
          .replace(/\  /g, "&nbsp;&nbsp;");
        if (typeof isNewTextV != "undefined" && !isNewTextV) {
          text1 = text1.replace(/</g, "&lt;").replace(/>/g, "&gt;");
          text1 = text1.replace(/&lt;br&gt;/gi, "<br>");
          text1 = text1
            .replace(/&lt;b&gt;/gi, "<b>")
            .replace(/&lt;\/b&gt;/gi, "</b>");
          text1 = text1
            .replace(/&lt;div&gt;/gi, "<div>")
            .replace(/&lt;\/div&gt;/gi, "</div>");
          text1 = text1
            .replace(/&lt;i&gt;/gi, "<i>")
            .replace(/&lt;\/i&gt;/gi, "</i>");
          text1 = text1
            .replace(/&lt;u&gt;/gi, "<u>")
            .replace(/&lt;\/u&gt;/gi, "</u>");
          text1 = text1
            .replace(/&lt;font/gi, "<font")
            .replace(/\"&gt;/gi, '">')
            .replace(/&lt;\/font&gt;/gi, "</font>");
          text1 = text1
            .replace(/&lt;span/gi, "<span")
            .replace(/&lt;\/span&gt;/gi, "</span>");
          text1 = text1
            .replace(/&lt;p/gi, "<p")
            .replace(/&lt;\/p&gt;/gi, "</p>");
        }
        tempDiv.html(text1);
        var textH = tempDiv.outerHeight();
        fobj.attr("height", textH);
        var top = 0;
        if (fontStyle.vAlign == "middle") {
          top = _h / 2 - textH / 2;
        } else {
          if (fontStyle.vAlign == "bottom") {
            top = _h - textH;
          } else {
            top = 0;
          }
        }
        fobj.attr("y", top + _y);
        tempDiv.remove();
        if (fontStyle.orientation == "horizontal") {
          top = _w / 2 - textH / 2;
          var textCenter = { x: _x + _w / 2, y: top + textH / 2 };
          var textAngle = shape.props.angle;
          if (textAngle != 0) {
            var center = { x: shape.props.w / 2, y: shape.props.h / 2 };
            textCenter = Utils.getRotated(center, textCenter, textAngle);
          }
          textAngle = (Math.PI * 1.5 + textAngle) % (Math.PI * 2);
          var deg = Math.round((textAngle / (Math.PI * 2)) * 360);
          var left = textCenter.x + (shape.props.x - shapeBox.x) - pos.w / 2;
          var degStr =
            "width:" + Math.ceil(pos.w) + "px;height:" + textH + "px;";
          fobj.attr({
            y: _x + top,
            x: (props.h - _h) / 2 - props.h,
            width: pos.w,
            transform: "rotate(" + deg + ")",
          });
          style += degStr;
        } else {
          style += "";
        }
        fobj.appendChild("div", { innerHTML: text1, style: style });
      }
    }
    function renderDataAttr(dataAttr, group) {
      for (var i = 0, len = dataAttr.length; i < len; i++) {
        var dataAttrBoj = dataAttr[i],
          text = "",
          iconRect = null;
        if (dataAttrBoj.showType == "text" || dataAttrBoj.showType == "icon") {
          var _group = group.group();
          if (dataAttrBoj.showType == "text") {
            text = dataAttrBoj.value;
            if (dataAttrBoj.type == "link") {
              text =
                "<a style='color:#4183C4;' href=" +
                text +
                " target='_blank'> " +
                text +
                " </a>";
            }
            if (dataAttrBoj.showName == true) {
              text = dataAttrBoj.name + ":" + text;
            }
          } else {
            if (dataAttrBoj.showType == "icon") {
              var imgUrl =
                "http://192.168.10.11:8080/themes/default/images/diagraming/data-attr-icons.png";
              var left = 0,
                top = 0;
              dataAttrBoj.icon =
                dataAttrBoj.icon > 29
                  ? parseInt(dataAttrBoj.icon) + 1
                  : dataAttrBoj.icon;
              left = (-(dataAttrBoj.icon - 1) % 5) * 24 - 5 + "px";
              top = -Math.floor(dataAttrBoj.icon / 5) * 23 - 4 + "px";
              text =
                '<i style="display:inline-block;width:21px;height:21px;background:url(https://www.processon.com/themes/default/images/diagraming/data-attr-icons.png) ' +
                left +
                " " +
                top +
                '"></i>';
              if (dataAttrBoj.type == "link") {
                text =
                  "<a href=" +
                  dataAttrBoj.value +
                  ' target="_blank" style="display:inline-block;width:21px;height:21px;background:url(https://www.processon.com/themes/default/images/diagraming/data-attr-icons.png) ' +
                  left +
                  " " +
                  top +
                  '"></a>';
              }
              if (dataAttrBoj.showName == true) {
                text =
                  '<span style ="position: relative;top:-7px">' +
                  dataAttrBoj.name +
                  ": </span>" +
                  text;
              }
              if (dataAttrBoj.icon > 0) {
                if (location.origin.indexOf("processon.com") > -1) {
                  image =
                    "https://www.processon.com/images/data-attr/" +
                    dataAttrBoj.icon +
                    ".png";
                } else {
                  image =
                    location.origin +
                    "/images/data-attr/" +
                    dataAttrBoj.icon +
                    ".png";
                }
                iconRect = _group.image(image, 20, 20);
              }
            }
          }
          var tempDiv = $(
            "<div contenteditable=true style='display:inline-block;font-size:12px;color:#333;'>" +
              text +
              "</div>"
          ).appendTo("body");
          var h = tempDiv.outerHeight();
          var w = tempDiv.outerWidth();
          var x, y;
          var horizontal = dataAttrBoj.horizontal,
            vertical = dataAttrBoj.vertical;
          if (horizontal == "mostleft") {
            x = -w - 2;
          } else {
            if (horizontal == "leftedge") {
              x = -w / 2;
            } else {
              if (horizontal == "left") {
                x = 2;
              } else {
                if (horizontal == "center") {
                  x = (shape.props.w - w) / 2;
                } else {
                  if (horizontal == "right") {
                    x = shape.props.w - w - 2;
                  } else {
                    if (horizontal == "rightedge") {
                      x = shape.props.w - w / 2;
                    } else {
                      x = shape.props.w + 2;
                    }
                  }
                }
              }
            }
          }
          if (vertical == "mosttop") {
            y = -h;
          } else {
            if (vertical == "topedge") {
              y = -h / 2;
            } else {
              if (vertical == "top") {
                y = 0;
              } else {
                if (vertical == "middle") {
                  y = (shape.props.h - h) / 2;
                } else {
                  if (vertical == "bottom") {
                    y = shape.props.h - h;
                  } else {
                    if (vertical == "bottomedge") {
                      y = shape.props.h - h / 2;
                    } else {
                      y = shape.props.h;
                    }
                  }
                }
              }
            }
          }
          flow2svg.richText2svg(tempDiv, _group, x, y, 0);
          if (iconRect) {
            iconRect.attr({ x: x + w - 21, y: y });
          }
          iconRect = null;
          tempDiv.remove();
        }
      }
    }
    function renderDataAttr1(dataAttr, group) {
      for (var i = 0, len = dataAttr.length; i < len; i++) {
        var dataAttrBoj = dataAttr[i],
          text = "";
        if (dataAttrBoj.showType == "text" || dataAttrBoj.showType == "icon") {
          var _group = group.group();
          if (dataAttrBoj.showType == "text") {
            text = dataAttrBoj.value;
            if (dataAttrBoj.type == "link") {
              text =
                "<a style='color:#4183C4;' href=" +
                text +
                " target='_blank'> " +
                text +
                " </a>";
            }
            if (dataAttrBoj.showName == true) {
              text = dataAttrBoj.name + ":" + text;
            }
          } else {
            if (dataAttrBoj.showType == "icon") {
              var imgUrl =
                "http://192.168.10.11:8080/themes/default/images/diagraming/data-attr-icons.png";
              var left = 0,
                top = 0;
              dataAttrBoj.icon =
                dataAttrBoj.icon > 29
                  ? parseInt(dataAttrBoj.icon) + 1
                  : dataAttrBoj.icon;
              left = (-(dataAttrBoj.icon - 1) % 5) * 23 - 3 + "px";
              top = -Math.floor(dataAttrBoj.icon / 5) * 23 + "px";
              text =
                '<i style="display:inline-block;width:21px;height:21px;background:url(https://www.processon.com/themes/default/images/diagraming/data-attr-icons.png) ' +
                left +
                " " +
                top +
                '"></i>';
              if (dataAttrBoj.type == "link") {
                text =
                  "<a href=" +
                  dataAttrBoj.value +
                  ' target="_blank" style="display:inline-block;width:21px;height:21px;background:url(https://www.processon.com/themes/default/images/diagraming/data-attr-icons.png) ' +
                  left +
                  " " +
                  top +
                  '"></a>';
              }
              if (dataAttrBoj.showName == true) {
                text =
                  '<span style ="position: relative;top:-7px">' +
                  dataAttrBoj.name +
                  ": </span>" +
                  text;
              }
            }
          }
          var tempDiv = $(
            "<div contenteditable=true style='display:inline-block;font-size:12px;color:#333;'>" +
              text +
              "</div>"
          ).appendTo("body");
          var h = tempDiv.outerHeight();
          var w = tempDiv.outerWidth();
          tempDiv.remove();
          var fobj = _group.foreignObject(w, h);
          var x, y;
          var horizontal = dataAttrBoj.horizontal,
            vertical = dataAttrBoj.vertical;
          if (horizontal == "mostleft") {
            x = -w - 2;
          } else {
            if (horizontal == "leftedge") {
              x = -w / 2;
            } else {
              if (horizontal == "left") {
                x = 2;
              } else {
                if (horizontal == "center") {
                  x = (shape.props.w - w) / 2;
                } else {
                  if (horizontal == "right") {
                    x = shape.props.w - w - 2;
                  } else {
                    if (horizontal == "rightedge") {
                      x = shape.props.w - w / 2;
                    } else {
                      x = shape.props.w + 2;
                    }
                  }
                }
              }
            }
          }
          if (vertical == "mosttop") {
            y = -h;
          } else {
            if (vertical == "topedge") {
              y = -h / 2;
            } else {
              if (vertical == "top") {
                y = 0;
              } else {
                if (vertical == "middle") {
                  y = (shape.props.h - h) / 2;
                } else {
                  if (vertical == "bottom") {
                    y = shape.props.h - h;
                  } else {
                    if (vertical == "bottomedge") {
                      y = shape.props.h - h / 2;
                    } else {
                      y = shape.props.h;
                    }
                  }
                }
              }
            }
          }
          fobj.attr({ x: x, y: y });
          fobj.appendChild("div", {
            innerHTML: text,
            style: "font-size : 12px;color:#333;",
          });
        }
      }
    }
    function parsePath(action, w, h, lineWidth) {
      var path = "";
      if (action.action == "close") {
        return "Z";
      }
      var ac = action.action.substring(0, 1).toUpperCase();
      path += ac + " ";
      var baseStr = "var w = " + w + ";var h = " + h + ";";
      if (action.action == "curve") {
        return (
          path +
          eval(baseStr + action.x1) +
          " " +
          eval(baseStr + action.y1) +
          " " +
          eval(baseStr + action.x2) +
          " " +
          eval(baseStr + action.y2) +
          " " +
          eval(baseStr + action.x) +
          " " +
          eval(baseStr + action.y)
        );
      } else {
        if (action.action == "quadraticCurve") {
          return (
            path +
            eval(baseStr + action.x1) +
            " " +
            eval(baseStr + action.y1) +
            " " +
            eval(baseStr + action.x) +
            " " +
            eval(baseStr + action.y)
          );
        } else {
          if (action.action == "rect") {
            var rectW = eval(baseStr + action.w),
              rectH = eval(baseStr + action.h),
              rectX = eval(baseStr + action.x),
              rectY = eval(baseStr + action.y);
            return (
              "M" +
              rectX +
              " " +
              rectY +
              "L" +
              (rectX + rectW) +
              " " +
              rectY +
              "L" +
              (rectX + rectW) +
              " " +
              (rectY + rectH) +
              " L" +
              rectX +
              " " +
              (rectY + rectH) +
              "Z"
            );
          }
        }
      }
      return path + eval(baseStr + action.x) + " " + eval(baseStr + action.y);
    }
  },
  linker2svg: function (l, j, c, i) {
    var q = l.points;
    var o = l.from;
    var d = l.to;
    var p = Utils.getEndpointAngle(l, "from");
    if (isNaN(p)) {
      p = 0;
    }
    var f = Utils.getEndpointAngle(l, "to");
    var e = Utils.getLinkerLineStyle(l.lineStyle);
    n(o, l, e.beginArrowStyle, p);
    n(d, l, e.endArrowStyle, f);
    if (e.lineWidth == 0) {
      e.lineWidth = 1;
    }
    var o = g(o);
    var d = g(d);
    if (l.attribute && l.attribute.collapseBy) {
      return;
    }
    if (Math.abs(o.y - d.y) < 1 && Math.abs(o.x - d.x) < 1) {
      return;
    }
    if (l.linkerType == "broken") {
      var s = Model.intersection[l.id];
      if (s) {
        q = m(l.from, l.points, s.points, l.to);
      }
    }
    b();
    function b() {
      var B = "";
      var A = j.group();
      if (l.linkerType == "curve") {
        B += "M" + o.x + " " + o.y + "C";
        for (var w = 0; w < q.length; w++) {
          var z = g(q[w]);
          B += " " + z.x + " " + z.y;
        }
        B += " " + d.x + " " + d.y;
      } else {
        if (l.linkerType == "broken") {
          var t = Model.intersection[l.id];
          if (t) {
            o = g(o);
            d = g(d);
          }
          B += "M" + o.x + " " + o.y;
          for (var w = 0; w < q.length; w++) {
            var z = g(q[w]);
            if (z.type == "intersectionR") {
              var v = z.x,
                u = z.y;
              B +=
                "L" + (v - 6) + " " + u + "A 3 3, 0, 0, 1," + (v + 6) + " " + u;
            } else {
              if (z.type == "intersectionL") {
                var v = z.x,
                  u = z.y;
                B +=
                  "L" +
                  (v + 6) +
                  " " +
                  u +
                  "A 3 3, 0, 0, 0," +
                  (v - 6) +
                  " " +
                  u;
              } else {
                if (z.type != "equal") {
                  B += "L" + z.x + " " + z.y;
                }
              }
            }
          }
          B += "L" + d.x + " " + d.y;
        } else {
          if (l.linkerType == "normal") {
            B += "M" + o.x + " " + o.y;
            B += "L" + d.x + " " + d.y;
          }
        }
      }
      var y = A.path(B);
      var x = { width: e.lineWidth, color: "rgb(" + e.lineColor + ")" };
      if (e.lineStyle == "dashed") {
        x = $.extend(x, { dasharray: "8,5" });
      } else {
        if (e.lineStyle == "dot") {
          x = $.extend(x, { dasharray: "3,3" });
        } else {
          if (e.lineStyle == "dashdot") {
            x = $.extend(x, { dasharray: "10,5,3,5" });
          }
        }
      }
      y.stroke(x);
      y.fill("none");
      r(e, y);
      k(A);
    }
    function n(C, x, t, z) {
      if (C.id) {
        var u = Model.getShapeById(C.id);
        if (u) {
          var w = { x: 0, y: 0 };
          var y = Utils.getShapeLineStyle(u.lineStyle);
          var B = Utils.getLinkerLineStyle(x.lineStyle);
          if (t == "none" || t == "cross") {
            w.x = -y.lineWidth / 2;
          } else {
            if (t == "solidArrow" || t == "dashedArrow") {
              w.x = -y.lineWidth / 2 - B.lineWidth * 1.3;
            } else {
              if (t == "solidDiamond" || t == "dashedDiamond") {
                w.x = -y.lineWidth / 2 - B.lineWidth;
              } else {
                w.x = -y.lineWidth / 2 - B.lineWidth / 2;
              }
            }
          }
          var A = { x: 0, y: 0 };
          var v = Utils.getRotated(A, w, z);
          C.x += v.x;
          C.y += v.y;
        }
      }
    }
    function r(u, x) {
      var w = null;
      switch (u.beginArrowStyle) {
        case "solidArrow":
          var t = u.lineWidth;
          var y =
              "M" +
              (t + 5) * 2 +
              ",0 L0," +
              (t + 3) +
              " L" +
              (t + 5) * 2 +
              "," +
              (t + 3) * 2 +
              " L" +
              (t + 5) * 2 +
              ",0",
            v = t + 2;
          w = j
            .marker((t + 5) * 2, (t + 3) * 2, function (A) {
              A.path(y)
                .fill("rgb(" + u.lineColor + ")")
                .stroke({ width: 1, color: "rgb(" + u.lineColor + ")" });
            })
            .attr("markerUnits", "userSpaceOnUse")
            .attr("refX", v);
          break;
        case "normal":
          w = j
            .marker(16, 20, function (A) {
              A.path("M15,1 L1,10 L15,19")
                .fill("none")
                .stroke({
                  width: u.lineWidth,
                  color: "rgb(" + u.lineColor + ")",
                });
            })
            .attr("markerUnits", "userSpaceOnUse")
            .attr("refX", 0);
          break;
        case "dashedArrow":
          w = j
            .marker(16, 12, function (A) {
              A.path("M1,6 L15,1 L15,11L1,6")
                .fill("#fff")
                .stroke({
                  width: u.lineWidth,
                  color: "rgb(" + u.lineColor + ")",
                });
            })
            .attr("markerUnits", "userSpaceOnUse")
            .attr("refX", 0);
          break;
        case "solidDiamond":
          w = j
            .marker(20, 12, function (A) {
              A.path("M2,6 L10,2 L18,6 L10,10L2,6")
                .fill("rgb(" + u.lineColor + ")")
                .stroke({
                  width: u.lineWidth,
                  color: "rgb(" + u.lineColor + ")",
                });
            })
            .attr("markerUnits", "userSpaceOnUse")
            .attr("refX", 0);
          break;
        case "dashedDiamond":
          w = j
            .marker(20, 12, function (A) {
              A.path("M2,6 L10,2 L18,6 L10,10L2,6")
                .fill("#fff")
                .stroke({
                  width: u.lineWidth,
                  color: "rgb(" + u.lineColor + ")",
                });
            })
            .attr("markerUnits", "userSpaceOnUse")
            .attr("refX", 0);
          break;
        case "solidCircle":
          w = j
            .marker(16, 16, function (A) {
              A.circle(8)
                .center(8, 8)
                .fill("rgb(" + u.lineColor + ")")
                .stroke({
                  width: u.lineWidth,
                  color: "rgb(" + u.lineColor + ")",
                });
            })
            .attr("markerUnits", "userSpaceOnUse")
            .attr("refX", 3);
          break;
        case "dashedCircle":
          w = j
            .marker(16, 16, function (A) {
              A.circle(8)
                .center(8, 8)
                .fill("#fff")
                .stroke({
                  width: u.lineWidth,
                  color: "rgb(" + u.lineColor + ")",
                });
            })
            .attr("markerUnits", "userSpaceOnUse")
            .attr("refX", 3);
          break;
        case "cross":
          w = j
            .marker(14, 12, function (A) {
              A.path("M14,0 L0,12")
                .fill("none")
                .stroke({
                  width: u.lineWidth,
                  color: "rgb(" + u.lineColor + ")",
                });
            })
            .attr("markerUnits", "userSpaceOnUse")
            .attr("refX", -1);
          break;
        case "asynch1":
          w = j
            .marker(20, 12, function (A) {
              A.path("M0,8 L15,0")
                .fill("none")
                .stroke({
                  width: u.lineWidth,
                  color: "rgb(" + u.lineColor + ")",
                });
            })
            .attr("markerUnits", "userSpaceOnUse")
            .attr("refX", 0)
            .attr("refY", 8);
          break;
        case "asynch2":
          w = j
            .marker(20, 12, function (A) {
              A.path("M0,0 L15,8")
                .fill("none")
                .stroke({
                  width: u.lineWidth,
                  color: "rgb(" + u.lineColor + ")",
                });
            })
            .attr("markerUnits", "userSpaceOnUse")
            .attr("refX", 0)
            .attr("refY", 0);
          break;
        default:
          break;
      }
      var z = null;
      switch (u.endArrowStyle) {
        case "solidArrow":
          var t = u.lineWidth;
          var y =
              "M0,0 L" +
              (t + 5) * 2 +
              "," +
              (t + 3) +
              " L0," +
              (t + 3) * 2 +
              " L0,0",
            v = t + 8;
          z = j
            .marker((t + 5) * 2, (t + 3) * 2, function (A) {
              A.path(y)
                .fill("rgb(" + u.lineColor + ")")
                .stroke({ width: 1, color: "rgb(" + u.lineColor + ")" });
            })
            .attr("markerUnits", "userSpaceOnUse")
            .attr("refX", v);
          break;
        case "normal":
          z = j
            .marker(16, 16, function (A) {
              A.path("M0,0 L10,8 L0,16")
                .fill("none")
                .stroke({
                  width: u.lineWidth,
                  color: "rgb(" + u.lineColor + ")",
                });
            })
            .attr("markerUnits", "userSpaceOnUse")
            .attr("refX", 11);
          break;
        case "dashedArrow":
          z = j
            .marker(14, 12, function (A) {
              A.path("M1,1 L14,6 L1,11L1,1")
                .fill("#fff")
                .stroke({
                  width: u.lineWidth,
                  color: "rgb(" + u.lineColor + ")",
                });
            })
            .attr("markerUnits", "userSpaceOnUse")
            .attr("refX", 16);
          break;
        case "solidDiamond":
          z = j
            .marker(20, 12, function (A) {
              A.path("M2,6 L10,2 L18,6 L10,10L2,6")
                .fill("rgb(" + u.lineColor + ")")
                .stroke({
                  width: u.lineWidth,
                  color: "rgb(" + u.lineColor + ")",
                });
            })
            .attr("markerUnits", "userSpaceOnUse")
            .attr("refX", 20);
          break;
        case "dashedDiamond":
          z = j
            .marker(20, 12, function (A) {
              A.path("M2,6 L10,2 L18,6 L10,10L2,6")
                .fill("#fff")
                .stroke({
                  width: u.lineWidth,
                  color: "rgb(" + u.lineColor + ")",
                });
            })
            .attr("markerUnits", "userSpaceOnUse")
            .attr("refX", 20);
          break;
        case "solidCircle":
          z = j
            .marker(16, 16, function (A) {
              A.circle(8)
                .center(8, 8)
                .fill("rgb(" + u.lineColor + ")")
                .stroke({
                  width: u.lineWidth,
                  color: "rgb(" + u.lineColor + ")",
                });
            })
            .attr("markerUnits", "userSpaceOnUse")
            .attr("refX", 13);
          break;
        case "dashedCircle":
          z = j
            .marker(16, 16, function (A) {
              A.circle(8)
                .center(8, 8)
                .fill("#fff")
                .stroke({
                  width: u.lineWidth,
                  color: "rgb(" + u.lineColor + ")",
                });
            })
            .attr("markerUnits", "userSpaceOnUse")
            .attr("refX", 13);
          break;
        case "cross":
          z = j
            .marker(14, 12, function (A) {
              A.path("M14,0 L0,12")
                .fill("none")
                .stroke({
                  width: u.lineWidth,
                  color: "rgb(" + u.lineColor + ")",
                });
            })
            .attr("markerUnits", "userSpaceOnUse")
            .attr("refX", 15);
          break;
        case "asynch1":
          z = j
            .marker(20, 12, function (A) {
              A.path("M15,0 L0,8")
                .fill("none")
                .stroke({
                  width: u.lineWidth,
                  color: "rgb(" + u.lineColor + ")",
                });
            })
            .attr("markerUnits", "userSpaceOnUse")
            .attr("refX", 16)
            .attr("refY", 0);
          break;
        case "asynch2":
          z = j
            .marker(20, 12, function (A) {
              A.path("M15,8 L0,0")
                .fill("none")
                .stroke({
                  width: u.lineWidth,
                  color: "rgb(" + u.lineColor + ")",
                });
            })
            .attr("markerUnits", "userSpaceOnUse")
            .attr("refX", 16)
            .attr("refY", 8);
          break;
        default:
          break;
      }
      if (w != null) {
        if (typeof u.lineStyle != "undefined" || u.lineStyle !== "solid") {
          w.attr("stroke-dasharray", "0,0");
        }
        x.attr("marker-start", "url(#" + w.node.id + ")");
      }
      if (z != null) {
        if (typeof u.lineStyle != "undefined" || u.lineStyle !== "solid") {
          z.attr("stroke-dasharray", "0,0");
        }
        x.attr("marker-end", "url(#" + z.node.id + ")");
      }
    }
    function k(D) {
      if (l.text == null || l.text == "") {
        return;
      }
      var E = null;
      if (l.textPos != null) {
        var A = g({ x: l.textPos.x, y: l.textPos.y });
        E = { x: A.x, y: A.y };
        var v = $("#" + l.id).children(".linker_text");
        if (l.textPos.pos == "bottom") {
          E.y += v.outerHeight() / 2 + 4;
        } else {
          if (l.textPos.pos == "top") {
            E.y -= v.outerHeight() / 2 + 4;
          }
        }
      } else {
        E = a();
      }
      var x = Utils.getLinkerFontStyle(l.fontStyle);
      var y = x.fontFamily;
      var t =
        "display:none;vertical-align: top;text-align:" +
        x.textAlign +
        ";color:rgb(" +
        x.color +
        ");line-height:" +
        Math.round(x.size * 1.25) +
        "px;font-size:" +
        x.size +
        "px;font-family:" +
        y +
        ";white-space:nowrap;display:inline-block;background:#fff;";
      if (x.bold) {
        t += "font-weight:700;";
      } else {
        t += "font-weight:400;";
      }
      if (x.italic) {
        t += "font-style:italic;";
      }
      if (x.underline) {
        t += "text-decoration:underline;";
      }
      var C = l.text
        .replace(/\n/g, "<br>")
        .replace(/\u001C/g, " ")
        .replace(//g, " ")
        .replace(/</g, "&lt;")
        .replace(/>/g, "&gt;")
        .replace(/&lt;br&gt;/gi, "<br>")
        .replace(/&lt;div&gt;/gi, "<div>")
        .replace(/&lt;\/div&gt;/gi, "</div>");
      var w = $(
        "<div contenteditable=true style='" +
          t +
          ";display:inline-block;'></div>"
      ).appendTo("body");
      w.html(C);
      var z = w.width(),
        u = w.outerHeight();
      w.css("width", z);
      var B = D.rect();
      B.attr({
        width: z,
        height: u,
        x: E.x - z / 2,
        y: E.y - u / 2,
        fill: "#fff",
      });
      flow2svg.richText2svg(w, D, E.x - z / 2, E.y - u / 2, 0);
      w.remove();
    }
    function a() {
      var A = {};
      if (l.linkerType == "normal") {
        A = { x: 0.5 * o.x + 0.5 * d.x, y: 0.5 * o.y + 0.5 * d.y };
      } else {
        if (l.linkerType == "curve") {
          var H = o;
          var F = q[0];
          var B = q[1];
          var z = d;
          A = {
            x: H.x * 0.125 + F.x * 0.375 + B.x * 0.375 + z.x * 0.125,
            y: H.y * 0.125 + F.y * 0.375 + B.y * 0.375 + z.y * 0.125,
          };
        } else {
          var I = [];
          I.push(o);
          for (var v = 0; v < q.length; v++) {
            var u = q[v];
            I.push(u);
          }
          I.push(d);
          var E = 0;
          for (var x = 1; x < I.length; x++) {
            var F = I[x - 1];
            var B = I[x];
            var y = Utils.measureDistance(F, B);
            E += y;
          }
          var D = E / 2;
          var w = 0;
          for (var x = 1; x < I.length; x++) {
            var F = I[x - 1];
            var B = I[x];
            var y = Utils.measureDistance(F, B);
            var C = w + y;
            if (C >= D) {
              var G = (D - w) / y;
              A = { x: (1 - G) * F.x + G * B.x, y: (1 - G) * F.y + G * B.y };
              break;
            }
            w = C;
          }
        }
      }
      return A;
    }
    function m(F, H, w, G) {
      for (var A = 0; A < H.length - 1; A++) {
        var E = H[A].x,
          B = H[A].y,
          v = H[A + 1].x,
          D = H[A + 1].y;
        if (Math.abs(B - D) < 1 && Math.abs(E - v) < 1) {
          H[A + 1].type = "equal";
          H[A].type = "equal";
        }
      }
      H.unshift(h(F));
      H.push(h(G));
      for (var A = 0; A < H.length - 1; A++) {
        var E = H[A].x,
          B = H[A].y,
          v = H[A + 1].x,
          D = H[A + 1].y;
        if (Math.abs(B - D) < 1) {
          H[A].intersectionArr = [];
          if (v > E) {
            for (var z = 0; z < w.length; z++) {
              var u = w[z].x,
                C = w[z].y;
              if (Math.abs(B - C) < 1 && u > E && u < v) {
                w[z].type = "intersectionR";
                H[A].intersectionArr.push(w[z]);
              }
            }
            H[A].intersectionArr = I(H[A].intersectionArr, "x");
          } else {
            for (var z = 0; z < w.length; z++) {
              var u = w[z].x,
                C = w[z].y;
              if (Math.abs(B - C) < 1 && u < E && u > v) {
                w[z].type = "intersectionL";
                H[A].intersectionArr.push(w[z]);
              }
            }
            H[A].intersectionArr = I(H[A].intersectionArr, "x").reverse();
          }
        }
      }
      var J = [];
      for (var A = 0; A < H.length; A++) {
        J.push(H[A]);
        var t = H[A].intersectionArr;
        if (t != undefined && t.length > 0) {
          for (var z = 0; z < t.length; z++) {
            J.push(t[z]);
          }
        }
      }
      J.splice(0, 1);
      J.splice(J.length - 1, 1);
      return J;
      function I(x, M) {
        var y;
        for (var L = 0; L < x.length - 1; L++) {
          for (var K = 0; K < x.length - 1; K++) {
            if (x[K][M] > x[K + 1][M]) {
              y = x[K];
              x[K] = x[K + 1];
              x[K + 1] = y;
            }
          }
        }
        return x;
      }
    }
    function g(u) {
      var t = 15;
      u.x = u.x - c.minX - t;
      u.y = u.y - c.minY - t;
      return u;
    }
    function h(u) {
      var t = 15;
      u.x = u.x + c.minX + t;
      u.y = u.y + c.minY + t;
      return u;
    }
  },
  calcCanvasSize: function () {
    var a = null;
    var h = null;
    var e = null;
    var d = null;
    var g = Model.define.elements;
    $(".shape_box").each(function () {
      var y = $(this);
      var q = y.position();
      if (y.hasClass("linker_box")) {
        var k = y.attr("id");
        var u = g[k].from.x,
          r = g[k].from.y,
          v = g[k].to.x,
          s = g[k].to.y;
        if (Math.abs(u - v) < 1 && Math.abs(r - s) < 1) {
          return true;
        }
      }
      var w = q.left + y.width();
      var j = q.top + y.height();
      if (y.children(".linker_text").length > 0) {
        var o = y.children(".linker_text").position().left;
        var n = q.left + o + y.children(".linker_text").width();
        if (o < 0) {
          q.left = q.left + o;
        }
        if (n > w) {
          w = n;
        }
      }
      if (y.children(".text_canvas").length > 0) {
        var p = y.children(".text_canvas");
        var i = p.position(),
          l = p.height(),
          x = y.height();
        if (i.top < 0) {
          q.top = q.top + i.top;
        }
        if (i.top + l > x) {
          j = y.position().top + i.top + l;
        }
      }
      var t = 0;
      var m = 0;
      y.find(".attr_canvas").each(function () {
        var z = $(this);
        var A = z.position();
        var B = A.left + z.width() - y.width();
        if (A.left < 0) {
          if (t == 0 || A.left < t) {
            t = A.left;
          }
        } else {
          if (m == 0 || B > m) {
            m = B;
          }
        }
      });
      if (a == null || q.left + t < a) {
        a = q.left + t;
      }
      if (h == null || q.top < h) {
        h = q.top;
      }
      if (e == null || w + m > e) {
        e = w + m;
      }
      if (d == null || j > d) {
        d = j;
      }
    });
    var b = $("#designer_canvas");
    if (a == null) {
      a = 0;
      h = 0;
      e = 0;
      d = 0;
    }
    a = a - 30;
    h = h - 30;
    var c = e - a;
    var f = d - h;
    return { w: c, h: f, minX: a, minY: h };
  },
  richText2svg: function (y, k, D, C, n, g) {
    var t = y[0].style;
    var q = {
      anchor:
        t.textAlign == "center"
          ? "middle"
          : t.textAlign == "right"
          ? "end"
          : "start",
      family: t.fontFamily,
      size: t.fontSize,
      width: t.width ? t.width : 0,
      fill: t.color,
      weight: t.fontWeight,
      align: t.verticalAlign,
      lineHeight: t.lineHeight,
    };
    var p = {
      boxW: parseInt(q.width),
      boxX: D || 0,
      boxY: C || 0,
      deg: n || 0,
      alpha: g || 1,
    };
    y.find("font").each(function () {
      var i = $(this).attr("color");
      if (typeof i != "undefined") {
        $(this).css(
          "fill",
          i.indexOf("#") == -1 && i.indexOf("rgb") == -1 ? "#" + i : i
        );
      }
    });
    y.find("b").css("font-weight", "bold");
    y.find("i").css("font-style", "italic");
    y.find("u").css("text-decoration", "underline");
    var m = [];
    function a(F) {
      for (var H = 0, E = F.length; H < E; H++) {
        if (F[H].nodeName == "#text") {
          for (var G = 0; G < F[H].data.length; G++) {
            if (F[H].parentNode.nodeName == "DIV") {
              var I = { text: F[H].data[G], style: "" };
            } else {
              var I = {
                text: F[H].data[G],
                style: F[H].parentNode.getAttribute("style"),
              };
            }
            m.push(I);
          }
        } else {
          if (F[H].nodeName == "BR") {
            if (H > 0 && F[H - 1].nodeName == "DIV") {
              var I = { text: "</br>", style: "" };
              m.push(I);
            }
            var I = { text: "</br>", style: "" };
            m.push(I);
          } else {
            if (F[H].nodeName == "DIV") {
              if (m.length > 0 && m[m.length - 1].text != "</br>") {
                var I = { text: "</br>", style: "" };
                m.push(I);
              }
            } else {
              if (F[H].parentNode.nodeName == "DIV") {
                if (typeof F[H].getAttribute == "function") {
                  F[H].setAttribute("style", F[H].getAttribute("style"));
                }
              } else {
                F[H].setAttribute(
                  "style",
                  F[H].parentNode.getAttribute("style") +
                    F[H].getAttribute("style")
                );
              }
            }
          }
        }
        a(F[H].childNodes);
      }
    }
    a(y[0].childNodes);
    y.empty();
    var s = [];
    for (var w = 0; w < m.length; w++) {
      var e = "";
      if (m[w].text == "</br>") {
        e = m[w].text;
      } else {
        e = '<span style="' + m[w].style + '">' + m[w].text + "</span>";
      }
      $(e).appendTo(y);
    }
    y.children().each(function (j) {
      if (m[j].text == "</br>") {
        if (typeof m[j - 1] == "undefined" || m[j - 1].text == "</br>") {
          m[j].dy = null;
          s.push(m[j]);
        }
      } else {
        m[j].dy = $(this)[0].offsetTop;
        m[j].dx = $(this)[0].offsetLeft;
        m[j].w = $(this).width();
        m[j].h = $(this).height();
        if (
          s.length != 0 &&
          s[s.length - 1].style == m[j].style &&
          s[s.length - 1].dy == m[j].dy &&
          s.dy !== 0
        ) {
          s[s.length - 1].text += m[j].text;
          s[s.length - 1].w += m[j].w;
        } else {
          s.push(m[j]);
        }
      }
    });
    for (var w = 0; w < s.length; w++) {
      var A = s[w];
      if (A.style.indexOf("underline") > -1) {
        var B = A.style.split(";");
        var u = q.fill;
        for (var v = 0; v < B.length - 1; v++) {
          if (B[v].indexOf("fill") > -1) {
            u = B[v].split(":")[1];
            break;
          }
        }
        s[w].style = B.join(";");
        var z = A.dx + p.boxX,
          x = z + A.w,
          d = p.boxY + A.dy + A.h - parseInt(q.size) / 10,
          b = d;
        if (!(flow2svg.type == "svg" || flow2svg.type == "pdfHD")) {
          var l = k
            .line(z, d, x, b)
            .stroke({ width: Math.round(parseInt(q.size) / 20), color: u });
        }
      } else {
        if (t.textDecoration == "underline") {
          var B = A.style.split(";");
          var u = q.fill;
          for (var v = 0; v < B.length - 1; v++) {
            if (B[v].indexOf("fill") > -1) {
              u = B[v].split(":")[1];
              break;
            }
          }
          s[w].style = B.join(";");
          var z = A.dx + p.boxX,
            x = z + A.w,
            d = p.boxY + A.dy + A.h - parseInt(q.size) / 10,
            b = d;
          if (!(flow2svg.type == "svg" || flow2svg.type == "pdfHD")) {
            var l = k
              .line(z, d, x, b)
              .stroke({ width: Math.round(parseInt(q.size) / 20), color: u });
          }
        }
      }
    }
    var h = [];
    for (var w = 0; w < s.length; w++) {
      if (h.length != 0 && s[w].dy == s[w - 1].dy && s[w].dy !== null) {
        h[h.length - 1].texts.push(s[w]);
      } else {
        h.push({ texts: [s[w]], dy: s[w].dy });
      }
    }
    var r = 0;
    r =
      q.anchor == "middle"
        ? p.boxX + p.boxW / 2
        : q.anchor == "end"
        ? p.boxX + p.boxW
        : p.boxX;
    var c = 1.25;
    if (q.lineHeight && q.lineHeight.indexOf("%") > -1) {
      c = parseInt(q.lineHeight) / 100;
    }
    var o = k.text(function (E) {
      for (var j = 0; j < h.length; j++) {
        E.tspan(function (F) {
          var G = h[j].texts;
          for (var i = 0; i < G.length; i++) {
            G[i].text = G[i].text == "</br>" ? "\u00a0" : G[i].text;
            G[i].style =
              "text-decoration:" + t.textDecoration + ";" + G[i].style;
            F.tspan(G[i].text).attr("style", G[i].style);
          }
        })
          .dy(Math.floor(parseInt(q.size) * c))
          .attr({ x: r });
      }
    });
    var f = parseInt(q.size) > 20 ? 2 : 0;
    o.font(q).attr("font-style", t.fontStyle);
    o.attr("opacity", p.alpha);
    o.attr({
      y: p.boxY - parseInt(q.size) * ((c - 1) / 2) - f,
      transform: "rotate(" + p.deg + ")",
    });
  },
  setWatermark: function (e, n) {
    var a = Model.define.page.backgroundColor;
    if (a == "transparent") {
      a = "255,255,255";
    }
    var b = Utils.getDarkestColor(a);
    var h = $("#canvas_container").width();
    var f = $("#canvas_container").height();
    var l = Model.define.page.padding;
    var g = $("#svg_exporter>svg");
    var k = $("#svg_exporter>svg>rect").length
      ? $("#svg_exporter>svg>rect").last()
      : "";
    var d = g.find("defs")[0];
    var j = "http://www.w3.org/2000/svg";
    var c = document.createElementNS(j, "pattern");
    c.setAttributeNS(null, "patternUnits", "userSpaceOnUse");
    c.setAttributeNS(null, "id", "pattern_mark");
    c.setAttributeNS(null, "width", "300");
    c.setAttributeNS(null, "height", "300");
    d.appendChild(c);
    var m = document.createElementNS(j, "text");
    m.setAttributeNS(null, "x", "-50");
    m.setAttributeNS(null, "y", "150");
    m.setAttributeNS(null, "fill", "rgba(" + b + ",0.8)");
    m.setAttributeNS(null, "font-size", "18");
    m.setAttributeNS(null, "transform", "rotate(-45, 150, 150)");
    m.textContent = $("<span/>").html(e).text();
    c.appendChild(m);
    var i = document.createElementNS(j, "rect");
    i.setAttributeNS(null, "fill", "url(#pattern_mark)");
    i.setAttributeNS(
      null,
      "transform",
      "translate(" + (l - 8 - n.minX) + "," + (l - 24 - n.minY) + ")"
    );
    i.setAttributeNS(null, "width", h);
    i.setAttributeNS(null, "height", f);
    i.setAttributeNS(null, "id", "rect_mark");
    i.setAttributeNS(null, "pointer-events", "none");
    if (k) {
      k.after(i);
    } else {
      g.prepend(i);
    }
  },
};
