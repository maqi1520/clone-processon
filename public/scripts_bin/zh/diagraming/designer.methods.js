Designer.addFunction("open", function (definition) {
  if (definition == "") {
    return;
  }
  if (typeof definition == "string") {
    eval("definition = " + definition);
  }
  $(".shape_box").remove();
  Model.define.elements = {};
  Model.persistence.elements = {};
  Model.define.page = definition.page;
  Model.persistence.page = Utils.copy(definition.page);
  Model.comments = definition.comments;
  if (definition.theme) {
    Model.define.theme = definition.theme;
    Model.persistence.theme = Utils.copy(definition.theme);
  }
  if (definition.defaultStyle) {
    Model.define.defaultStyle = definition.defaultStyle;
  }
  if (definition.defaultLinkerStyle) {
    Model.define.defaultLinkerStyle = definition.defaultLinkerStyle;
  }
  if (localRuntime == false) {
    Designer.initialize.initCanvas();
  }
  var shapes = definition.elements;
  var shapeCount = 0;
  for (var shapeId in shapes) {
    var shape = shapes[shapeId];
    if (shape.name != "linker") {
      Schema.initShapeFunctions(shape);
      Designer.painter.renderShape(shape);
      Model.add(shape, false);
    }
    shapeCount++;
  }
  var outerImages = {};
  for (var shapeId in shapes) {
    var shape = shapes[shapeId];
    if (shape.name == "linker") {
      Designer.painter.renderLinker(shape);
      Model.add(shape, false);
    }
    if (shape.fillStyle != null && shape.fillStyle.fileId != null) {
      var fileId = shape.fillStyle.fileId;
      if (fileId.indexOf("iconfinder.com") >= 0) {
        outerImages[shape.id] = fileId;
      } else {
        if (fileId.indexOf("cayfu.com") >= 0) {
          outerImages[shape.id] = fileId;
        }
      }
    }
  }
  if (shapeCount == 0) {
    Model.build();
  }
  if (localRuntime == false) {
    if (typeof isView == "undefined") {
      Navigator.draw();
    }
  }
  var keys = Object.keys(outerImages),
    imgs = {};
  getImgStr(keys, imgs);
  function getImgStr(keys, imgs) {
    if (keys.length == 0) {
      if (Object.keys(imgs).length > 0) {
        Util.ajax({
          url: "/diagraming/resetimg",
          data: {
            imgs: JSON.stringify(imgs),
            chartId: chartId,
            ignore: "imgs",
          },
          success: function (data) {},
        });
      }
      return;
    }
    var key = keys.pop();
    var url = outerImages[key];
    var image = new Image();
    image.crossOrigin = "Anonymous";
    image.src = url;
    image.onload = function () {
      var canvas = document.createElement("canvas");
      var ctx = canvas.getContext("2d");
      canvas.width = image.width;
      canvas.height = image.height;
      ctx.drawImage(image, 0, 0);
      var dataUrl = canvas.toDataURL();
      image = null;
      imgs[key] = dataUrl;
      getImgStr(keys, imgs);
    };
  }
  Designer.events.push("resetBrokenLinker");
  Designer.events.push("randerComplete");
  Designer.events.push("shapeCount");
});
Designer.addFunction("selectAll", function () {
  var a = Model.define.elements;
  var b = [];
  for (var c in a) {
    b.push(c);
  }
  Utils.selectShape(b);
});
Designer.addFunction("setFontStyle", function (g) {
  var f = Utils.getSelected();
  if (f.length == 0) {
    return;
  }
  var d = Utils.getGridSelectedCells();
  for (var e = 0; e < f.length; e++) {
    var b = f[e];
    b.fontStyle = Utils.copy(b.fontStyle);
    if (Utils.gridSelectObj.id == b.id && d.length > 0) {
      for (var c = 0; c < d.length; c++) {
        var a = d[c].textBlock;
        a.fontStyle = $.extend({}, a.fontStyle, g);
      }
    } else {
      if (typeof g.fontFamily != "undefined") {
        b.fontStyle.fontFamily = g.fontFamily;
      }
      if (typeof g.size != "undefined") {
        b.fontStyle.size = g.size;
      }
      if (typeof g.color != "undefined") {
        b.fontStyle.color = g.color;
      }
      if (typeof g.bold != "undefined") {
        b.fontStyle.bold = g.bold;
      }
      if (typeof g.italic != "undefined") {
        b.fontStyle.italic = g.italic;
      }
      if (typeof g.underline != "undefined") {
        b.fontStyle.underline = g.underline;
      }
      if (typeof g.textAlign != "undefined") {
        b.fontStyle.textAlign = g.textAlign;
      }
      if (typeof g.lineHeight != "undefined") {
        b.fontStyle.lineHeight = g.lineHeight;
      }
    }
    if (b.name == "linker") {
      Designer.painter.renderLinker(b);
    } else {
      if (typeof g.vAlign != "undefined") {
        b.fontStyle.vAlign = g.vAlign;
      }
      Designer.painter.renderShape(b);
    }
  }
  Model.updateMulti(f);
});
Designer.addFunction("setShapeStyle", function (d) {
  var c = Utils.getSelected();
  if (c.length == 0) {
    return;
  }
  var e = [];
  for (var b = 0; b < c.length; b++) {
    var a = c[b];
    if (a.name != "linker") {
      a.shapeStyle = Utils.copy(a.shapeStyle);
      if (typeof d.alpha != "undefined") {
        a.shapeStyle.alpha = d.alpha;
      }
      Designer.painter.renderShape(a);
      e.push(a);
    }
  }
  Model.updateMulti(e);
});
Designer.addFunction("setLineStyle", function (f) {
  var e = Utils.getSelected();
  if (e.length == 0) {
    return;
  }
  var d = Utils.getFamilyShapes(e);
  e = e.concat(d);
  for (var c = 0; c < e.length; c++) {
    var a = e[c];
    a.lineStyle = Utils.copy(a.lineStyle);
    if (typeof f.lineWidth != "undefined") {
      a.lineStyle.lineWidth = f.lineWidth;
    }
    if (typeof f.lineColor != "undefined") {
      a.lineStyle.lineColor = f.lineColor;
    }
    if (typeof f.lineStyle != "undefined") {
      a.lineStyle.lineStyle = f.lineStyle;
    }
    if (a.name == "linker") {
      if (typeof f.beginArrowStyle != "undefined") {
        a.lineStyle.beginArrowStyle = f.beginArrowStyle;
        Designer.defaults.linkerBeginArrowStyle = f.beginArrowStyle;
      }
      if (typeof f.endArrowStyle != "undefined") {
        a.lineStyle.endArrowStyle = f.endArrowStyle;
        Designer.defaults.linkerEndArrowStyle = f.endArrowStyle;
      }
      if (a.lineStyle.lineWidth == 0) {
        a.lineStyle.lineWidth = 1;
      }
    }
  }
  Model.updateMulti(e);
  for (var c = 0; c < e.length; c++) {
    var a = e[c];
    Designer.painter.renderShape(a);
    if (a.name != "linker") {
      var g = Model.getShapeLinkers(a.id);
      if (!g) {
        continue;
      }
      for (var b = 0; b < g.length; b++) {
        if (!Utils.isSelected(g[b])) {
          var h = Model.getShapeById(g[b]);
          Designer.painter.renderShape(h);
        }
      }
    }
  }
  Designer.events.push("resetBrokenLinker");
});
Designer.addFunction("setFillStyle", function (a) {
  var b = Utils.getSelected();
  if (b.length == 0) {
    return;
  }
  if (b.length == 0) {
    return;
  }
  var d = [];
  var k = Utils.getGridSelectedCells();
  for (var e = 0; e < b.length; e++) {
    var f = b[e];
    if (f.name != "linker") {
      if (Utils.gridSelectObj.id == f.id && k.length > 0) {
        for (var c = 0; c < k.length; c++) {
          var l = k[c].path;
          l.fillStyle = $.extend({}, l.fillStyle, a);
        }
        Schema.initShapeFunctions(f);
      } else {
        f.fillStyle = Utils.copy(f.fillStyle);
        var h = f.fillStyle.type;
        if (typeof a.type != "undefined") {
          g(f, a.type);
          h = a.type;
        }
        if (typeof a.color != "undefined") {
          if (h == "solid") {
            f.fillStyle.color = a.color;
            if (f.theme) {
              if (f.theme.row) {
                f.theme.row[0].fillStyle.color = a.color;
              }
              if (f.theme.column) {
                f.theme.column[0].fillStyle.color = a.color;
              }
            }
          } else {
            if (h == "gradient") {
              f.fillStyle.beginColor = GradientHelper.getLighterColor(a.color);
              f.fillStyle.endColor = GradientHelper.getDarkerColor(a.color);
            }
          }
        }
        if (h == "gradient") {
          if (typeof a.beginColor != "undefined") {
            f.fillStyle.beginColor = a.beginColor;
          }
          if (typeof a.endColor != "undefined") {
            f.fillStyle.endColor = a.endColor;
          }
          if (typeof a.gradientType != "undefined") {
            f.fillStyle.gradientType = a.gradientType;
            if (a.gradientType == "linear") {
              delete f.fillStyle.radius;
              f.fillStyle.angle = 0;
            } else {
              delete f.fillStyle.angle;
              f.fillStyle.radius = 0.75;
            }
          }
          if (typeof a.radius != "undefined") {
            f.fillStyle.radius = a.radius;
          }
          if (typeof a.angle != "undefined") {
            f.fillStyle.angle = a.angle;
          }
        }
        if (h == "image") {
          if (typeof a.display != "undefined") {
            f.fillStyle.display = a.display;
          }
          if (typeof a.fileId != "undefined") {
            f.fillStyle.fileId = a.fileId;
          }
          if (typeof a.imageW != "undefined") {
            f.fillStyle.imageW = a.imageW;
          }
          if (typeof a.imageH != "undefined") {
            f.fillStyle.imageH = a.imageH;
          }
        }
      }
      Designer.painter.renderShape(f);
      d.push(f);
    }
  }
  Model.updateMulti(d);
  function g(j, n) {
    var i = j.fillStyle;
    if (i.type != n) {
      var o = { type: n };
      if (n == "solid") {
        if (i.type == "gradient") {
          var m = GradientHelper.getDarkerColor(i.beginColor);
          o.color = m;
        } else {
          o.color = "255,255,255";
        }
      } else {
        if (n == "gradient") {
          var p = i.color;
          if (i.type != "solid") {
            p = "255,255,255";
          }
          o.gradientType = "linear";
          o.angle = 0;
          o.beginColor = GradientHelper.getLighterColor(p);
          o.endColor = GradientHelper.getDarkerColor(p);
        } else {
          if (n == "image") {
            o.fileId = "";
            o.display = "fill";
            o.imageW = 10;
            o.imageH = 10;
          }
        }
      }
      j.fillStyle = o;
    }
  }
});
Designer.addFunction("setLinkerType", function (e) {
  var d = Utils.getSelected();
  if (d.length == 0) {
    return;
  }
  var f = [];
  for (var c = 0; c < d.length; c++) {
    var b = d[c];
    if (b.name == "linker") {
      b.linkerType = e;
      Designer.painter.renderLinker(b, true);
      f.push(b);
    }
  }
  Schema.linkerDefaults.linkerType = e;
  var a = Utils.getSelectedIds();
  if (a.length > 1) {
    Designer.painter.drawControls(a);
  }
  Model.updateMulti(f);
  Utils.showLinkerControls();
});
Designer.addFunction("matchSize", function (l) {
  var c = Utils.getSelected();
  if (c.length == 0 || !l) {
    return;
  }
  var b = null;
  var h = null;
  var k = [];
  for (var e = 0; e < c.length; e++) {
    var g = c[e];
    if (g.name != "linker") {
      if (b == null || g.props.w > b) {
        b = g.props.w;
      }
      if (h == null || g.props.h > h) {
        h = g.props.h;
      }
    }
  }
  if (l.w == "auto") {
    l.w = b;
  }
  if (l.h == "auto") {
    l.h = h;
  }
  Utils.removeAnchors();
  var d = [];
  for (var e = 0; e < c.length; e++) {
    var g = c[e];
    if (g.name != "linker") {
      var j = Designer.op.changeShapeProps(g, l);
      Utils.showAnchors(g);
      Utils.mergeArray(k, j);
      d.push(g);
    }
  }
  for (var e = 0; e < k.length; e++) {
    var a = k[e];
    var f = Model.getShapeById(a);
    Designer.painter.renderLinker(f, true);
    d.push(f);
  }
  Designer.painter.drawControls(Utils.getSelectedIds());
  Model.updateMulti(d);
});
Designer.addFunction("alignShapes", function (c) {
  var r = Utils.getSelected();
  if (r.length == 0 || !c) {
    return;
  }
  var d = Utils.getSelectedIds();
  var l = Utils.getSelectedGroups();
  var k = Utils.getControlBox(d);
  var b = [];
  var n = [];
  Utils.removeAnchors();
  var f = [];
  if (!(l.length == 1 && d.length == Model.getGroupShapes(l[0]).length)) {
    for (var v = 0; v < l.length; v++) {
      var h = l[v];
      var s = Model.getGroupShapes(h);
      var e = Utils.getControlBox(s);
      var p = 0,
        o = 0;
      if (c == "left") {
        p = k.x - e.x;
      } else {
        if (c == "center") {
          p = k.x + k.w / 2 - (e.x + e.w / 2);
        } else {
          if (c == "right") {
            p = k.x + k.w - (e.x + e.w);
          } else {
            if (c == "top") {
              o = k.y - e.y;
            } else {
              if (c == "middle") {
                o = k.y + k.h / 2 - (e.y + e.h / 2);
              } else {
                if (c == "bottom") {
                  o = k.y + k.h - (e.y + e.h);
                }
              }
            }
          }
        }
      }
      for (var u = 0; u < s.length; u++) {
        var q = s[u],
          a = Model.getShapeById(q);
        if (a.name != "linker") {
          var B = { x: a.props.x + p, y: a.props.y + o };
          var t = Designer.op.changeShapeProps(a, B, s);
          Utils.showAnchors(a);
          Utils.mergeArray(b, t);
          f.push(a);
        } else {
          a.from.x = a.from.x + p;
          a.from.y = a.from.y + o;
          a.to.x = a.to.x + p;
          a.to.y = a.to.y + o;
          b.push(a.id);
        }
        n.push(q);
        d = Utils.removeFromArray(d, q);
      }
    }
  }
  for (var v = 0; v < d.length; v++) {
    var a = Model.getShapeById(d[v]);
    if (a.name != "linker") {
      f.push(a);
    }
    if (c == "left") {
      if (a.name != "linker") {
        var z = Utils.getShapeBox(a);
        var B = { x: k.x - (z.x - a.props.x) };
        var t = Designer.op.changeShapeProps(a, B);
        Utils.showAnchors(a);
        Utils.mergeArray(b, t);
      } else {
        if (a.from.id == null && a.to.id == null) {
          var y = Utils.getLinkerBox(a);
          a.from.x -= y.x - k.x;
          a.to.x -= y.x - k.x;
          b.push(a.id);
        }
      }
    } else {
      if (c == "center") {
        var x = k.x + k.w / 2;
        if (a.name != "linker") {
          var B = { x: Math.round(x - a.props.w / 2) };
          var t = Designer.op.changeShapeProps(a, B);
          Utils.showAnchors(a);
          Utils.mergeArray(b, t);
        } else {
          if (a.from.id == null && a.to.id == null) {
            var y = Utils.getLinkerBox(a);
            a.from.x += Math.round(x - y.w / 2 - y.x);
            a.to.x += Math.round(x - y.w / 2 - y.x);
            b.push(a.id);
          }
        }
      } else {
        if (c == "right") {
          var w = k.x + k.w;
          if (a.name != "linker") {
            var z = Utils.getShapeBox(a);
            var B = { x: w - a.props.w - (a.props.x - z.x) };
            var t = Designer.op.changeShapeProps(a, B);
            Utils.showAnchors(a);
            Utils.mergeArray(b, t);
          } else {
            if (a.from.id == null && a.to.id == null) {
              var y = Utils.getLinkerBox(a);
              a.from.x += w - y.x - y.w;
              a.to.x += w - y.x - y.w;
              b.push(a.id);
            }
          }
        } else {
          if (c == "top") {
            if (a.name != "linker") {
              var z = Utils.getShapeBox(a);
              var B = { y: k.y - (z.y - a.props.y) };
              var t = Designer.op.changeShapeProps(a, B);
              Utils.showAnchors(a);
              Utils.mergeArray(b, t);
            } else {
              if (a.from.id == null && a.to.id == null) {
                var y = Utils.getLinkerBox(a);
                a.from.y -= y.y - k.y;
                a.to.y -= y.y - k.y;
                b.push(a.id);
              }
            }
          } else {
            if (c == "middle") {
              var A = k.y + k.h / 2;
              if (a.name != "linker") {
                var B = { y: Math.round(A - a.props.h / 2) };
                var t = Designer.op.changeShapeProps(a, B);
                Utils.showAnchors(a);
                Utils.mergeArray(b, t);
              } else {
                if (a.from.id == null && a.to.id == null) {
                  var y = Utils.getLinkerBox(a);
                  a.from.y += Math.round(A - y.h / 2 - y.y);
                  a.to.y += Math.round(A - y.h / 2 - y.y);
                  b.push(a.id);
                }
              }
            } else {
              if (c == "bottom") {
                var g = k.y + k.h;
                if (a.name != "linker") {
                  var z = Utils.getShapeBox(a);
                  var B = { y: g - a.props.h - (a.props.y - z.y) };
                  var t = Designer.op.changeShapeProps(a, B);
                  Utils.showAnchors(a);
                  Utils.mergeArray(b, t);
                } else {
                  if (a.from.id == null && a.to.id == null) {
                    var y = Utils.getLinkerBox(a);
                    a.from.y += g - y.y - y.h;
                    a.to.y += g - y.y - y.h;
                    b.push(a.id);
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  for (var v = 0; v < b.length; v++) {
    var q = b[v];
    var m = Model.getShapeById(q);
    Designer.painter.renderLinker(m, true);
    f.push(m);
  }
  d = d.concat(n);
  Designer.painter.drawControls(d);
  Model.updateMulti(f);
});
Designer.addFunction("distributeShapes", function (e) {
  var t = Utils.getSelected();
  if (t.length == 0 || !e) {
    return;
  }
  Utils.removeAnchors();
  var g = Utils.getSelectedIds();
  var o = Utils.getSelectedGroups();
  var m = Utils.getControlBox(g);
  var b = [];
  var c = [];
  var l = [];
  for (var y = 0; y < o.length; y++) {
    var u = Model.getGroupShapes(o[y]);
    var k = Utils.getControlBox(u);
    c.push({ type: "group", shapeIds: u, box: k });
  }
  for (var y = 0; y < t.length; y++) {
    var a = t[y];
    if (!a.group) {
      if (a.name != "linker") {
        var B = Utils.getShapeBox(a);
        c.push({ type: "shape", id: a.id, box: B });
      } else {
        if (a.from.id == null && a.to.id == null) {
          var B = Utils.getLinkerBox(a);
          c.push({ type: "linker", id: a.id, box: B });
        }
      }
    }
  }
  if (e == "h") {
    c.sort(function D(i, h) {
      return i.box.x - h.box.x;
    });
    var n = m.w;
    for (var y = 0; y < c.length; y++) {
      var B = c[y];
      n -= B.box.w;
    }
    var A = n / (c.length - 1);
    var f = m.x;
    for (var y = 0; y < c.length; y++) {
      var B = c[y];
      var r = B.box.x - f;
      if (B.type == "group") {
        var d = B.shapeIds;
        for (var x = 0; x < d.length; x++) {
          var a = Model.getShapeById(d[x]);
          if (a.name != "linker") {
            var C = { x: a.props.x - r };
            var v = Designer.op.changeShapeProps(a, C, d);
            Utils.showAnchors(a);
            Utils.mergeArray(b, v);
            l.push(a);
          } else {
            a.from.x = a.from.x - r;
            a.to.x = a.to.x - r;
            b.push(a.id);
          }
        }
      } else {
        if (B.type == "shape") {
          var a = Model.getShapeById(B.id);
          var C = { x: a.props.x - r };
          var v = Designer.op.changeShapeProps(a, C, d);
          Utils.showAnchors(a);
          Utils.mergeArray(b, v);
          l.push(a);
        } else {
          if (B.type == "linker") {
            var a = Model.getShapeById(B.id);
            a.from.x = a.from.x - r;
            a.to.x = a.to.x - r;
            b.push(a.id);
          }
        }
      }
      f += B.box.w + A;
    }
  } else {
    c.sort(function D(i, h) {
      return i.box.y - h.box.y;
    });
    var z = m.h;
    for (var y = 0; y < c.length; y++) {
      var B = c[y];
      z -= B.box.h;
    }
    var A = z / (c.length - 1);
    var f = m.y;
    for (var y = 0; y < c.length; y++) {
      var B = c[y];
      var q = B.box.y - f;
      if (B.type == "group") {
        var d = B.shapeIds;
        for (var x = 0; x < d.length; x++) {
          var a = Model.getShapeById(d[x]);
          if (a.name != "linker") {
            var C = { y: a.props.y - q };
            var v = Designer.op.changeShapeProps(a, C, d);
            Utils.showAnchors(a);
            Utils.mergeArray(b, v);
            l.push(a);
          } else {
            a.from.y = a.from.y - q;
            a.to.y = a.to.y - q;
            b.push(a.id);
          }
        }
      } else {
        if (B.type == "shape") {
          var a = Model.getShapeById(B.id);
          var C = { y: a.props.y - q };
          var v = Designer.op.changeShapeProps(a, C, d);
          Utils.showAnchors(a);
          Utils.mergeArray(b, v);
          l.push(a);
        } else {
          if (B.type == "linker") {
            var a = Model.getShapeById(B.id);
            a.from.y = a.from.y - q;
            a.to.y = a.to.y - q;
            b.push(a.id);
          }
        }
      }
      f += B.box.h + A;
    }
  }
  for (var y = 0; y < b.length; y++) {
    var s = b[y];
    var p = Model.getShapeById(s);
    Designer.painter.renderLinker(p, true);
    l.push(p);
  }
  Designer.painter.drawControls(g);
  Model.updateMulti(l);
});
Designer.addFunction("layerShapes", function (m) {
  var h = Utils.getSelected();
  if (h.length == 0 || !m) {
    return;
  }
  h.sort(function c(r, i) {
    return r.props.zindex - i.props.zindex;
  });
  var b;
  if (m == "front") {
    b = Model.maxZIndex;
    for (var j = 0; j < h.length; j++) {
      var l = h[j];
      b += 1;
      l.props.zindex = b;
    }
  } else {
    if (m == "forward") {
      var d = null;
      var q = null;
      for (var j = 0; j < h.length; j++) {
        var l = h[j];
        d = n(l);
        if (d != null) {
          q = l.props.zindex;
          break;
        }
      }
      if (d == null) {
        return;
      }
      var k = d.props.zindex;
      var f = n(d);
      var p = k + 1;
      if (f != null) {
        p = k + (f.props.zindex - k) / 2;
      }
      var g = p - q;
      for (var j = 0; j < h.length; j++) {
        var l = h[j];
        l.props.zindex += g;
      }
    } else {
      if (m == "back") {
        b = Model.orderList[0].zindex;
        for (var j = h.length - 1; j >= 0; j--) {
          var l = h[j];
          b -= 1;
          l.props.zindex = b;
        }
      } else {
        if (m == "backward") {
          var a = null;
          var q = null;
          for (var j = 0; j < h.length; j++) {
            var l = h[j];
            a = e(l);
            if (a != null) {
              q = l.props.zindex;
              break;
            }
          }
          if (a == null) {
            return;
          }
          var k = a.props.zindex;
          var o = e(a);
          var p = k - 1;
          if (o != null) {
            p = k - (k - o.props.zindex) / 2;
          }
          var g = p - q;
          for (var j = 0; j < h.length; j++) {
            var l = h[j];
            l.props.zindex += g;
          }
        }
      }
    }
  }
  Model.updateMulti(h);
  function n(s) {
    var v = Utils.getShapeBox(s);
    for (var u = 0; u < Model.orderList.length; u++) {
      var i = Model.orderList[u];
      if (i.zindex <= s.props.zindex || Utils.isSelected(i.id)) {
        continue;
      }
      var t = Model.getShapeById(i.id);
      var r = Utils.getShapeBox(t);
      if (Utils.rectCross(v, r)) {
        return t;
      }
    }
    return null;
  }
  function e(s) {
    var v = Utils.getShapeBox(s);
    for (var u = Model.orderList.length - 1; u >= 0; u--) {
      var i = Model.orderList[u];
      if (i.zindex >= s.props.zindex || Utils.isSelected(i.id)) {
        continue;
      }
      var t = Model.getShapeById(i.id);
      var r = Utils.getShapeBox(t);
      if (Utils.rectCross(v, r)) {
        return t;
      }
    }
    return null;
  }
});
Designer.addFunction("group", function () {
  var e = Utils.getSelected();
  var b = Utils.getSelectedIds();
  if (e.length < 2) {
    return;
  }
  var d = Utils.newId();
  for (var c = 0; c < e.length; c++) {
    var a = e[c];
    if (a.name == "linker") {
      if (a.from.id && b.indexOf(a.from.id) < 0) {
        a.from.id = null;
      }
      if (a.to.id && b.indexOf(a.to.id) < 0) {
        a.to.id = null;
      }
    }
    a.group = d;
  }
  Model.updateMulti(e);
});
Designer.addFunction("ungroup", function () {
  var c = Utils.getSelected();
  if (c.length == 0) {
    return;
  }
  for (var b = 0; b < c.length; b++) {
    var a = c[b];
    a.group = null;
  }
  Model.updateMulti(c);
});
Designer.addFunction("lockShapes", function () {
  var b = Utils.getSelectedIds();
  if (b.length == 0) {
    return;
  }
  var d = [];
  for (var c = 0; c < b.length; c++) {
    var a = Model.getShapeById(b[c]);
    a.locked = true;
    d.push(a);
  }
  Utils.unselect();
  Utils.selectShape(b);
  Model.updateMulti(d);
});
Designer.addFunction("unlockShapes", function () {
  var b = Utils.getSelectedLockedIds();
  if (b.length == 0) {
    return;
  }
  var d = [];
  for (var c = 0; c < b.length; c++) {
    var a = Model.getShapeById(b[c]);
    a.locked = false;
    d.push(a);
  }
  var e = Utils.getSelectedIds();
  Utils.unselect();
  Utils.selectShape(e);
  Model.updateMulti(d);
});
Designer.addFunction("setPageStyle", function (a) {
  Model.updatePage(a, true);
});
Designer.addFunction("setReadonly", function (a) {
  if (typeof a != "boolean") {
    return;
  }
  if (a) {
    $(".diagram_title").addClass("readonly");
    $(".menubar").hide();
    $(".toolbar").hide();
    $("#shape_panel").addClass("readonly");
    $("#designer_viewport").addClass("readonly");
    Designer.hotkey.cancel();
    Designer.op.cancel();
    $(window).trigger("resize.designer");
    $("#dock").hide();
    $(".dock_view").hide();
    Dock.currentView = "";
    Designer.contextMenu.destroy();
  }
});
Designer.addFunction("zoomIn", function () {
  var a = Designer.config.scale;
  var b = a + 0.1;
  Designer.setZoomScale(b);
});
Designer.addFunction("zoomOut", function () {
  var a = Designer.config.scale;
  var b = a - 0.1;
  Designer.setZoomScale(b);
});
Designer.addFunction("setZoomScale", function (e) {
  if (e < 0.25) {
    e = 0.25;
  }
  if (e > 4) {
    e = 4;
  }
  Utils.hideLinkerCursor();
  Designer.config.scale = e;
  Designer.initialize.initCanvas();
  for (var d in Model.define.elements) {
    var b = Model.define.elements[d];
    Designer.painter.renderShape(b);
  }
  var a = Utils.getSelectedIds();
  var c = Utils.getSelectedLockedIds();
  Utils.mergeArray(a, c);
  Utils.unselect();
  Utils.selectShape(a);
  Utils.showLinkerCursor();
  if (Model.orderList.length <= 300) {
    Designer.events.push("resetBrokenLinker");
  }
});
Designer.addFunction("setShapeProps", function (h, b) {
  if (!b) {
    b = Utils.getSelected();
  }
  if (b.length == 0 || !h) {
    return;
  }
  var c = [];
  var k = [];
  for (var d = 0; d < b.length; d++) {
    var g = b[d];
    if (g.name != "linker") {
      var j = Designer.op.changeShapeProps(g, h);
      c.push(g);
      if (j && j.length) {
        Utils.mergeArray(k, j);
      }
    }
  }
  for (var d = 0; d < k.length; d++) {
    var a = k[d];
    var e = Model.getShapeById(a);
    Designer.painter.renderLinker(e, true);
    c.push(e);
  }
  if (c.length > 0) {
    Model.updateMulti(c);
  }
  var f = Utils.getSelectedIds();
  Utils.unselect();
  Utils.selectShape(f);
});
Designer.addFunction("addDataAttribute", function (a) {
  var c = Utils.getSelectedIds();
  var b = Model.getShapeById(c[0]);
  if (!b.dataAttributes) {
    b.dataAttributes = [];
  }
  a.id = Utils.newId();
  a.category = "custom";
  b.dataAttributes.push(a);
  MessageSource.doWithoutUpdateDock(function () {
    Model.update(b);
  });
});
Designer.addFunction("updateDataAttribute", function (f) {
  var c = Utils.getSelectedIds();
  var b = Model.getShapeById(c[0]);
  if (!b.dataAttributes) {
    b.dataAttributes = [];
  }
  var e = false;
  for (var d = 0; d < b.dataAttributes.length; d++) {
    var a = b.dataAttributes[d];
    if (a.id == f.id) {
      b.dataAttributes[d] = f;
      e = true;
    }
  }
  if (!e) {
    return;
  }
  MessageSource.doWithoutUpdateDock(function () {
    Model.update(b);
  });
  Designer.painter.renderShape(b);
});
Designer.addFunction("getDataAttrById", function (e) {
  var c = Utils.getSelectedIds();
  var b = Model.getShapeById(c[0]);
  if (!b.dataAttributes) {
    b.dataAttributes = [];
  }
  for (var d = 0; d < b.dataAttributes.length; d++) {
    var a = b.dataAttributes[d];
    if (a.id == e) {
      return a;
    }
  }
  return null;
});
Designer.addFunction("getDefaultDataAttrByName", function (d) {
  var c = Utils.getSelectedIds();
  var b = Model.getShapeById(c[0]);
  if (!b.dataAttributes) {
    b.dataAttributes = [];
  }
  for (var e = 0; e < b.dataAttributes.length; e++) {
    var a = b.dataAttributes[e];
    if (a.category == "default" && a.name == d) {
      return a;
    }
  }
  return null;
});
Designer.addFunction("deleteDataAttribute", function (e) {
  var c = Utils.getSelectedIds();
  var b = Model.getShapeById(c[0]);
  if (!b.dataAttributes) {
    b.dataAttributes = [];
  }
  var f = false;
  for (var d = 0; d < b.dataAttributes.length; d++) {
    var a = b.dataAttributes[d];
    if (a.id == e) {
      b.dataAttributes.splice(d, 1);
      f = true;
    }
  }
  if (!f) {
    return;
  }
  MessageSource.doWithoutUpdateDock(function () {
    Model.update(b);
  });
  Designer.painter.renderShape(b);
});
Designer.addFunction("setSchema", function (schemaCategories, callback) {
  if (schemaCategories.length == 0) {
    schemaCategories = ["standard", "basic", "flow", "lane"];
    return;
  }
  Schema.selectedCategories = schemaCategories;
  //TODO
  //Schema.empty();
  //Schema.init(true);
  Designer.initialize.initShapes();
  if (callback) {
    callback();
  }
});
Designer.addFunction("setLaneNum", function (b) {
  var f = Utils.getSelectedIds();
  var e = Model.getShapeById(f[0]);
  var a = Utils.getLanesByPool(e),
    h = a.length;
  MessageSource.beginBatch();
  if (h > b) {
    var g = [];
    for (var d = b; d < h; d++) {
      g.push(a[d]);
    }
    Model.remove(g);
  }
  if (h < b) {
    var c = [];
    if (e.name == "verticalPool") {
      for (var d = h; d < b; d++) {
        var j = Model.create("verticalLane", 0, 0);
        var k = b - 1 == d ? false : true;
        j.onCreated(e, k);
        c.push(j);
        Model.define.elements[j.id] = j;
      }
      Model.addMulti(c);
    }
    if (e.name == "horizontalPool") {
      for (var d = h; d < b; d++) {
        var j = Model.create("horizontalLane", 0, 0);
        var k = b - 1 == d ? false : true;
        j.onCreated(e, k);
        c.push(j);
        Model.define.elements[j.id] = j;
      }
      Model.addMulti(c);
    }
  }
  Utils.unselect();
  Utils.selectShape(e.id);
  MessageSource.commit();
});
Designer.addFunction("setPoolOrientation", function (q) {
  var C = Utils.getSelected()[0];
  if (!C) {
    return;
  }
  if (C.name.indexOf("Pool") < 0) {
    return;
  }
  var m = Utils.getContainedShapes([C]) || [];
  var e = Utils.getLinkersByShapes(m) || [];
  var l = Utils.getLanesByPool(C) || [];
  var t = Utils.getSeparatorsByPool(C) || [];
  var c = Utils.getSeparatorBarsByPool(C) || [];
  if (q == "horizontal") {
    if (C.name == "horizontalPool") {
      return;
    }
    C.name = "horizontalPool";
    var v = Model.create("horizontalPool", 0, 0);
    var I = Model.create("horizontalLane", 0, 0);
    var r = Model.create("verticalSeparator", 0, 0);
    var D = Model.create("verticalSeparatorBar", 0, 0);
    var A = Utils.copy(C.props);
    C.props.w = A.h;
    C.props.h = A.w;
    C.path = v.path;
    C.getPath = v.getPath;
    C.textBlock[0].position = v.textBlock[0].position;
    C.fontStyle.orientation = "horizontal";
    C.resizeDir = v.resizeDir;
    for (var G = 0; G < l.length; G++) {
      var d = l[G];
      d.name = "horizontalLane";
      var s = Utils.copy(d.props);
      d.props.w = s.h;
      d.props.h = s.w;
      d.props.x = A.x + s.y - A.y;
      d.props.y = A.y + s.x - A.x;
      d.path = I.path;
      d.getPath = I.getPath;
      d.textBlock[0].position = I.textBlock[0].position;
      d.fontStyle.orientation = "horizontal";
      d.resizeDir = I.resizeDir;
      Designer.painter.renderShape(d);
    }
    for (var G = 0; G < t.length; G++) {
      var L = t[G];
      L.name = "verticalSeparator";
      var s = Utils.copy(L.props);
      L.props.w = s.h;
      L.props.h = s.w;
      L.props.x = A.x + s.y - A.y;
      L.props.y = A.y + s.x - A.x;
      L.path = r.path;
      L.getPath = r.getPath;
      L.resizeDir = r.resizeDir;
      L.fontStyle = $.extend(true, L.fontStyle, r.fontStyle);
      delete L.fontStyle.orientation;
      L.textBlock[0].position = r.textBlock[0].position;
      L.resizeDir = r.resizeDir;
      Designer.painter.renderShape(L);
    }
    for (var G = 0; G < c.length; G++) {
      var w = c[G];
      w.name = "horizontalSeparatorBar";
      var s = Utils.copy(w.props);
      w.props.w = s.h;
      w.props.h = s.w;
      w.props.x = A.x + s.y - A.y;
      w.props.y = A.y + s.x - A.x;
      w.path = D.path;
      w.getPath = D.getPath;
      w.getTextBlock = D.getTextBlock;
      w.resizeDir = D.resizeDir;
      Designer.painter.renderShape(w);
    }
    Designer.painter.renderShape(C);
  } else {
    if (C.name == "verticalPool") {
      return;
    }
    C.name = "verticalPool";
    var v = Model.create("verticalPool", 0, 0);
    var I = Model.create("verticalLane", 0, 0);
    var B = Model.create("horizontalSeparator", 0, 0);
    var D = Model.create("verticalSeparatorBar", 0, 0);
    var A = Utils.copy(C.props);
    C.props.w = A.h;
    C.props.h = A.w;
    C.path = v.path;
    C.getPath = v.getPath;
    C.textBlock[0].position = v.textBlock[0].position;
    C.fontStyle.orientation = "vertical";
    C.resizeDir = v.resizeDir;
    for (var G = 0; G < l.length; G++) {
      var d = l[G];
      d.name = "verticalLane";
      var s = Utils.copy(d.props);
      d.props.w = s.h;
      d.props.h = s.w;
      d.props.x = A.x + s.y - A.y;
      d.props.y = A.y + s.x - A.x;
      d.path = I.path;
      d.getPath = I.getPath;
      d.textBlock[0].position = I.textBlock[0].position;
      d.fontStyle.orientation = "vertical";
      d.resizeDir = I.resizeDir;
      Designer.painter.renderShape(d);
    }
    for (var G = 0; G < t.length; G++) {
      var L = t[G];
      L.name = "horizontalSeparator";
      var s = Utils.copy(L.props);
      L.props.w = s.h;
      L.props.h = s.w;
      L.props.x = A.x + s.y - A.y;
      L.props.y = A.y + s.x - A.x;
      L.path = B.path;
      L.getPath = B.getPath;
      L.resizeDir = B.resizeDir;
      L.fontStyle = $.extend(true, L.fontStyle, B.fontStyle);
      L.fontStyle.orientation = "horizontal";
      L.resizeDir = B.resizeDir;
      L.textBlock[0].position = B.textBlock[0].position;
      Designer.painter.renderShape(L);
    }
    for (var G = 0; G < c.length; G++) {
      var w = c[G];
      w.name = "verticalSeparatorBar";
      var s = Utils.copy(w.props);
      w.props.w = s.h;
      w.props.h = s.w;
      w.props.x = A.x + s.y - A.y;
      w.props.y = A.y + s.x - A.x;
      w.path = D.path;
      w.getPath = D.getPath;
      w.getTextBlock = D.getTextBlock;
      w.resizeDir = D.resizeDir;
      Designer.painter.renderShape(w);
    }
    Designer.painter.renderShape(C);
  }
  for (var G = 0; G < m.length; G++) {
    var n = m[G];
    var s = Utils.copy(n.props);
    n.props.x = A.x + (s.y + s.h / 2 - A.y) - s.w / 2;
    n.props.y = A.y + (s.x + s.w / 2 - A.x) - s.h / 2;
    Designer.painter.renderShape(n);
  }
  for (var G = 0; G < e.length; G++) {
    var x = e[G];
    if (x.from.id) {
      var b = Model.getShapeById(x.from.id);
      var h = b.getAnchors();
    } else {
      var j = Utils.copy(x.from);
      var h = [j];
    }
    if (x.to.id) {
      var z = Model.getShapeById(x.to.id);
      var u = z.getAnchors();
    } else {
      var J = Utils.copy(x.to);
      var u = [J];
    }
    var y = null;
    for (var g = 0; g < h.length; g++) {
      var a = h[g];
      if (x.from.id) {
        var k = { x: a.x + b.props.x, y: a.y + b.props.y };
      } else {
        var k = a;
      }
      for (var f = 0; f < u.length; f++) {
        var o = u[f];
        if (x.to.id) {
          var K = { x: o.x + z.props.x, y: o.y + z.props.y };
        } else {
          var K = o;
        }
        var p = Utils.measureDistance(k, K);
        if (y == null) {
          y = { to: K, from: k, distance: p };
        }
        if (p < y.distance) {
          y = { to: K, from: k, distance: p };
        }
      }
    }
    x.points = [];
    x.to = $.extend(true, x.to, y.to);
    x.from = $.extend(true, x.from, y.from);
    if (x.to.id) {
      var F = Utils.getPointAngle(x.to.id, x.to.x, x.to.y, 7);
      x.to.angle = F;
    }
    if (x.from.id) {
      var E = Utils.getPointAngle(x.from.id, x.from.x, x.from.y, 7);
      x.from.angle = E;
    }
    Designer.painter.renderLinker(x, true);
  }
  var H = l.concat(c).concat(t).concat(m).concat(e).concat([C]);
  Model.updateMulti(H);
  Utils.unselect();
  Utils.selectShape(C.id);
});
Designer.addFunction("setPoolText", function (b) {
  var g = Utils.getSelected()[0];
  if (!g) {
    return;
  }
  if (g.name.indexOf("Pool") < 0) {
    return;
  }
  var a = Utils.getLanesByPool(g) || [];
  var e = Utils.getSeparatorsByPool(g) || [];
  var d = Utils.getSeparatorBarsByPool(g) || [];
  var c = a.concat([g]);
  for (var f = 0; f < c.length; f++) {
    var h = c[f];
    h.fontStyle.orientation = "horizontal";
    function j(m) {
      var k = "";
      var l = $("<div>" + m + "</div>").appendTo("body");
      function i(o) {
        for (var p = 0, n = o.length; p < n; p++) {
          if (o[p].nodeName == "#text") {
            k += o[p].data;
          }
          i(o[p].childNodes);
        }
      }
      i(l[0].childNodes);
      l.remove();
      return k;
    }
    h.textBlock[0].text = j(h.textBlock[0].text ? h.textBlock[0].text : "");
    Designer.painter.renderShape(h);
  }
  if (b == "horizontal") {
    for (var f = 0; f < c.length; f++) {
      var h = c[f];
      h.fontStyle.orientation = "horizontal";
      Designer.painter.renderShape(h);
    }
  } else {
    for (var f = 0; f < c.length; f++) {
      var h = c[f];
      delete h.fontStyle.orientation;
      Designer.painter.renderShape(h);
    }
  }
  Model.updateMulti(c);
  UI.update();
});
Designer.addFunction("setGridNum", function (obj) {
  var shape = Utils.getSelected()[0],
    path = shape.path;
  var props = shape.props,
    h = props.h,
    w = props.w;
  var rowVal = path.length,
    columnVal = path[0].length;
  var type = obj.type,
    val = obj.val,
    rowIndex = obj.rowIndex || rowVal,
    columnIndex = obj.columnIndex || columnVal,
    direction = obj.direction || "after";
  var rowHArr = [],
    columnWArr = [];
  for (var i = 0; i < path.length; i++) {
    var pathItem = path[i];
    var rowH = eval(
      "var w=" + w + ";var h = " + h + ";" + pathItem[0].actions[0].h
    );
    rowH = Math.round(rowH * 10000) / 10000;
    rowHArr.push(rowH);
  }
  for (var i = 0; i < path[0].length; i++) {
    var pathItem = path[0][i];
    var columnW = eval(
      "var w=" + w + ";var h = " + h + ";" + pathItem.actions[0].w
    );
    columnW = Math.round(columnW * 10000) / 10000;
    columnWArr.push(columnW);
  }
  if (type == "row") {
    if (val > 0) {
      var copyRowH = rowHArr[rowIndex - 1];
      var copyPath = path[rowIndex - 1];
      for (var i = 0; i < val; i++) {
        if (direction == "after") {
          rowHArr.splice(rowIndex, 0, copyRowH);
          path.splice(rowIndex, 0, copyPath);
          for (var j = 0; j < columnVal; j++) {
            shape.textBlock.splice(rowIndex * columnVal + j, 0, {});
          }
        }
        if (direction == "before") {
          rowHArr.splice(rowIndex - 1, 0, copyRowH);
          path.splice(rowIndex - 1, 0, copyPath);
          for (var j = 0; j < columnVal; j++) {
            shape.textBlock.splice((rowIndex - 1) * columnVal + j, 0, {});
          }
        }
      }
      h = h + copyRowH * val;
    }
    if (val < 0) {
      val = Math.abs(val);
      var delHs = rowHArr.splice(rowIndex - val, val);
      for (var i = 0; i < delHs.length; i++) {
        h = h - delHs[i];
      }
      path.splice(rowIndex - val, val);
      shape.textBlock.splice((rowIndex - val) * columnVal, val * columnVal);
    }
    rowVal = rowHArr.length;
  }
  if (type == "column") {
    if (val > 0) {
      var copyColumnW = columnWArr[columnIndex - 1];
      var copyPath = [];
      for (var i = 0; i < path.length; i++) {
        var p = path[i];
        copyPath.push(p[columnIndex - 1]);
      }
      for (var i = 0; i < val; i++) {
        if (direction == "after") {
          columnWArr.splice(columnIndex, 0, copyColumnW);
          for (var j = 0; j < path.length; j++) {
            var p = path[j];
            p.splice(columnIndex, 0, copyPath[j]);
            var columnNum = j == 0 ? columnVal + i : columnVal + i + 1;
            shape.textBlock.splice(j * columnNum + columnIndex, 0, {});
          }
        }
        if (direction == "before") {
          columnWArr.splice(columnIndex - 1, 0, copyColumnW);
          for (var j = 0; j < path.length; j++) {
            var p = path[j];
            p.splice(columnIndex - 1, 0, copyPath[j]);
            var columnNum = j == 0 ? columnVal + i : columnVal + i + 1;
            shape.textBlock.splice(j * columnNum + columnIndex - 1, 0, {});
          }
        }
      }
      w = w + copyColumnW * val;
    }
    if (val < 0) {
      val = Math.abs(val);
      var delWs = columnWArr.splice(columnIndex - val, val);
      for (var i = 0; i < delWs.length; i++) {
        w = w - delWs[i];
      }
      for (var j = 0; j < path.length; j++) {
        var p = path[j];
        p.splice(columnIndex - val, val);
        var columnNum = j == 0 ? columnVal : columnVal - val;
        shape.textBlock.splice(j * columnNum + columnIndex - val, val);
      }
    }
    columnVal = columnWArr.length;
  }
  var path_ = Utils.copyArray(path);
  var textBlock = [];
  var rowH_ = 0;
  for (var i = 0; i < rowHArr.length; i++) {
    var rowH = rowHArr[i];
    var columnW_ = 0;
    rowH_ = rowH_ + rowH;
    for (var j = 0; j < columnWArr.length; j++) {
      var columnW = columnWArr[j];
      columnW_ = columnW_ + columnW;
      var x1 = "w*" + Math.round(((columnW_ - columnW) / w) * 10000) / 10000,
        y1 = "h*" + Math.round(((rowH_ - rowH) / h) * 10000) / 10000,
        w1 = "w*" + Math.round((columnW / w) * 10000) / 10000,
        h1 = "h*" + Math.round((rowH / h) * 10000) / 10000;
      if (j == columnWArr.length - 1) {
        w1 = "w-" + x1;
      }
      if (i == rowHArr.length - 1) {
        h1 = "h-" + y1;
      }
      path_[i][j].actions = [{ action: "rect", x: x1, y: y1, w: w1, h: h1 }];
      var textPos = { x: x1, y: y1, w: w1, h: h1 };
      var textObj = shape.textBlock[i * columnVal + j];
      var text = textObj ? textObj.text : "";
      if (textObj && textObj.fontStyle) {
        textBlock.push({
          position: textPos,
          text: text,
          fontStyle: textObj.fontStyle,
        });
      } else {
        textBlock.push({ position: textPos, text: text });
      }
    }
  }
  var outlinkers = Utils.getOutlinkers([shape]);
  for (var i = 0; i < outlinkers.length; i++) {
    var linker = outlinkers[i];
    if (linker.from.id == shape.id) {
      if (Math.abs(linker.from.x - shape.props.x - shape.props.w) < 2) {
        linker.from.x = linker.from.x + (w - shape.props.w);
      }
      if (Math.abs(linker.from.y - shape.props.y - shape.props.h) < 2) {
        linker.from.y = linker.from.y + (h - shape.props.h);
      }
    }
    if (linker.to.id == shape.id) {
      if (Math.abs(linker.to.x - shape.props.x - shape.props.w) < 2) {
        linker.to.x = linker.to.x + (w - shape.props.w);
      }
      if (Math.abs(linker.to.y - shape.props.y - shape.props.h) < 2) {
        linker.to.y = linker.to.y + (h - shape.props.h);
      }
    }
    Designer.painter.renderLinker(linker, true);
  }
  shape.textBlock = textBlock;
  shape.path = path_;
  shape.props.h = h;
  shape.props.w = w;
  Schema.initShapeFunctions(shape);
  Designer.painter.renderShape(shape);
  var shapes = outlinkers.concat([shape]);
  Model.updateMulti(shapes);
  var gridSelectObj = Utils.gridSelectObj;
  Utils.unselect();
  Utils.selectShape(shape.id);
  if (gridSelectObj.indexs.length > 0) {
    var rs = gridSelectObj.rows,
      cs = gridSelectObj.columns;
    var r = rs[rs.length - 1],
      c = cs[cs.length - 1];
    r = r > rowVal - 1 ? rowVal - 1 : r;
    c = c > columnVal - 1 ? columnVal - 1 : c;
    if (direction == "before") {
      if (type == "row") {
        r = r + 1;
      } else {
        if (type == "column") {
          c = c + 1;
        }
      }
    }
    var index = r * columnVal + c;
    Utils.selectGrid(shape, [index]);
  }
  Designer.op.changeCanvas(shape.props);
});
Designer.addFunction("renderSchemaJs", function (b, e) {
  var d = document,
    a = this.jsVersion;
  var c = d.createElement("script");
  c.setAttribute("type", "text/javascript");
  c.setAttribute(
    "src",
    "/scripts_bin/zh/diagraming/schema/categories/" + b + ".js"
  );
  c.setAttribute("charset", "UTF-8");
  d.body.appendChild(c);
  c.onload = function () {
    Schema.init(true);
    e();
  };
});
