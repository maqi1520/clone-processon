Designer.events.addEventListener("randerComplete", function (a) {
  if (location.href.indexOf("/diagraming/pop") > -1) {
    if (typeof exportCanHandle != "undefined") {
      exportCanHandle.status = true;
    }
  }
});
Designer.events.addEventListener("initialized", function () {
  if (localRuntime) {
    Designer.open(definition);
  } else {
    var a = CLB.findLocal();
    if (a == false) {
      b(function (c) {
        $("#title_container .diagram_title").text(c.title);
        document.title = c.title;
        Designer.open(c);
        Designer.initialize.canvasSizeAuto();
      });
    }
  }
  function b(c) {
    $.get("/diagraming/getdef", { id: chartId }, function (f) {
      if (f.error == "reptile") {
        var e = new TencentCaptcha("2046103261", function (d) {
          if (d.ret === 0) {
            setTimeout(function () {
              b(c);
            }, 1000);
          }
        });
        e.show();
        return;
      } else {
        if ($.isEmptyObject(f)) {
          location.reload();
        } else {
          c(JSON.parse(f.def));
        }
      }
    });
  }
});
Designer.events.addEventListener("create", function (a) {});
var createdTip = false;
Designer.events.addEventListener("created", function (a) {
  if (createdTip) {
    UI.showStartStep("created", $("#" + a.id));
    createdTip = false;
  }
});
Designer.events.addEventListener("linkerCreating", function (a) {});
Designer.events.addEventListener("resetBrokenLinker", function (c) {
  var h = Model.define.page.lineJumps;
  if (h != null && h == false && c == true) {
    var m = Model.getLinkers("broken");
    for (var C = 0, E = m.length; C < E; C++) {
      var r = m[C];
      Designer.painter.renderLinker(r);
      Model.intersection = {};
    }
    return;
  } else {
    if (c == h || h == null) {
      return;
    } else {
      if (c == null && h == false) {
        return;
      }
    }
  }
  var k = Model.orderList.length;
  if (k > 400) {
    Model.intersection = {};
    if (k <= 1000) {
      UI.showTip(
        "温馨提示：当前图形数量偏多，为了提高作图体验，不再显示连线的跨线。但不影响下载图片"
      );
    }
    return;
  }
  var m = Model.getLinkers("broken");
  var t = {},
    D = {},
    B = {};
  for (var C = 0, E = m.length; C < E; C++) {
    var r = m[C];
    t[r.id] = Utils.getLinesFromLinker(r);
  }
  var u = [];
  for (var J in t) {
    var F = t[J];
    for (var I in t) {
      var l = t[I];
      if (I == J) {
        continue;
      }
      for (var C = 0; C < F.length; C++) {
        var v = F[C];
        var e = { x: v.x1, y: v.y1 };
        var d = { x: v.x2, y: v.y2 };
        for (var A = 0; A < l.length; A++) {
          var g = {};
          var f = l[A];
          var b = { x: f.x1, y: f.y1 };
          var a = { x: f.x2, y: f.y2 };
          if (Utils.checkCross(e, d, b, a)) {
            var y = Utils.intersection(e, d, b, a);
            if (Math.abs(y.x - e.x) < 12 && Math.abs(y.y - e.y) < 8) {
              continue;
            }
            if (Math.abs(y.x - d.x) < 12 && Math.abs(y.y - d.y) < 8) {
              continue;
            }
            if (Math.abs(y.x - b.x) < 20 && Math.abs(y.y - b.y) < 8) {
              continue;
            }
            if (Math.abs(y.x - a.x) < 20 && Math.abs(y.y - a.y) < 8) {
              continue;
            }
            y.y = Math.round(y.y);
            var z = J,
              s = C;
            if (e.y != d.y && b.y == a.y) {
              z = I;
              s = A;
            }
            var w = false;
            if (u.length > 0) {
              for (var n = 0; n < u.length; n++) {
                var q = u[n];
                if (q.curveId && q.curveId == z) {
                  g = q;
                  w = true;
                  break;
                }
              }
            }
            if (g.points == null) {
              g.points = [];
            }
            g.points.push(y);
            if (!w) {
              g.curveId = z;
              u.push(g);
            }
          }
        }
      }
    }
  }
  var G = Utils.copy(Model.intersection);
  Model.intersection = {};
  if (u.length > 0) {
    var H = function () {
      return function (j, i) {
        if (j.x < i.x) {
          return -1;
        } else {
          if (j.x > i.x) {
            return 1;
          }
        }
      };
    };
    for (var C = 0; C < u.length; C++) {
      var o = u[C];
      var r = Model.getShapeById(o.curveId);
      o.points = o.points.sort(H());
      for (var A = 0; A < o.points.length - 1; A++) {
        if (
          o.points[A].x == o.points[A + 1].x &&
          o.points[A].y == o.points[A + 1].y
        ) {
          o.points.splice(A, 1);
          A--;
        }
      }
      Designer.painter.renderLinker(r, null, null, o);
      Model.intersection[o.curveId] = o;
    }
  }
  if (!$.isEmptyObject(G)) {
    for (var J in G) {
      if (Model.intersection[J] != null) {
        continue;
      }
      var r = Model.getShapeById(J);
      if (r == null) {
        continue;
      }
      Designer.painter.renderLinker(r);
    }
  }
  u = {};
  t = null;
});
Designer.events.addEventListener("changeLinkers", function (a) {
  Designer.events.push("resetBrokenLinker");
});
Designer.events.addEventListener("linkerCreated", function (a) {
  Designer.events.push("resetBrokenLinker");
});
Designer.events.addEventListener("setDefaultStyle", function (a) {
  UI.setDefaultStyle(a);
});
Designer.events.addEventListener("selectChanged", function () {
  UI.update();
  Dock.update();
  UI.showShapeOptions();
});
Designer.events.addEventListener("clipboardChanged", function (a) {
  if (a > 0) {
    $("#bar_list_edit").children("li[ac=paste]").menuitem("enable");
  } else {
    $("#bar_list_edit").children("li[ac=paste]").menuitem("disable");
  }
});
Designer.events.addEventListener("undoStackChanged", function (a) {
  if (a == 0) {
    $("#bar_list_edit").children("li[ac=undo]").menuitem("disable");
    $("#bar_undo").button("disable");
  } else {
    $("#bar_list_edit").children("li[ac=undo]").menuitem("enable");
    $("#bar_undo").button("enable");
  }
});
Designer.events.addEventListener("redoStackChanged", function (a) {
  if (a == 0) {
    $("#bar_list_edit").children("li[ac=redo]").menuitem("disable");
    $("#bar_redo").button("disable");
  } else {
    $("#bar_list_edit").children("li[ac=redo]").menuitem("enable");
    $("#bar_redo").button("enable");
  }
});
Designer.events.addEventListener("beforeResize", function (a) {
  var c = a.shapes;
  var b = a.minSize;
  var f = a.dir;
  if (c.length == 1) {
    var l = c[0];
    if (l.name == "verticalPool") {
      if (f == "b") {
        var n = 0;
        for (var j = 0; j < l.children.length; j++) {
          var h = l.children[j];
          var d = Model.getShapeById(h);
          if (d.name == "horizontalSeparator") {
            n += d.props.h;
          }
        }
        if (n == 0) {
          n = 90;
        } else {
          n += 40;
        }
        b.h = n;
      } else {
        if (f == "l" || f == "r") {
          var g = 20;
          var e = null;
          var m = 0;
          for (var j = 0; j < l.children.length; j++) {
            var h = l.children[j];
            var d = Model.getShapeById(h);
            if (d.name == "horizontalSeparator") {
              m++;
            } else {
              if (d.name == "verticalLane") {
                if (
                  e == null ||
                  (d.props.x < e.props.x && f == "l") ||
                  (d.props.x > e.props.x && f == "r")
                ) {
                  e = d;
                }
                g += d.props.w;
              }
            }
          }
          if (e != null) {
            g -= e.props.w;
          }
          if (m > 0) {
            g += 20;
          }
          b.w = g;
        }
      }
    } else {
      if (l.name == "verticalLane" && f == "b") {
        var n = 0;
        var e = l;
        var k = Model.getShapeById(e.parent);
        for (var j = 0; j < k.children.length; j++) {
          var h = k.children[j];
          var d = Model.getShapeById(h);
          if (d.name == "horizontalSeparator") {
            n += d.props.h;
          }
        }
        if (n == 0) {
          n = 50;
        }
        b.h = n;
      } else {
        if (l.name == "horizontalPool") {
          if (f == "r") {
            var g = 0;
            for (var j = 0; j < l.children.length; j++) {
              var h = l.children[j];
              var d = Model.getShapeById(h);
              if (d.name == "verticalSeparator") {
                g += d.props.w;
              }
            }
            if (g == 0) {
              g = 90;
            } else {
              g += 40;
            }
            b.w = g;
          } else {
            if (f == "t" || f == "b") {
              var n = 20;
              var e = null;
              var m = 0;
              for (var j = 0; j < l.children.length; j++) {
                var h = l.children[j];
                var d = Model.getShapeById(h);
                if (d.name == "verticalSeparator") {
                  m++;
                } else {
                  if (d.name == "horizontalLane") {
                    if (
                      e == null ||
                      (d.props.y < e.props.y && f == "t") ||
                      (d.props.y > e.props.y && f == "b")
                    ) {
                      e = d;
                    }
                    n += d.props.h;
                  }
                }
              }
              if (e != null) {
                n -= e.props.h;
              }
              if (m > 0) {
                n += 20;
              }
              b.h = n;
            }
          }
        } else {
          if (l.name == "horizontalLane" && f == "r") {
            var g = 0;
            var e = l;
            var k = Model.getShapeById(e.parent);
            for (var j = 0; j < k.children.length; j++) {
              var h = k.children[j];
              var d = Model.getShapeById(h);
              if (d.name == "verticalSeparator") {
                g += d.props.w;
              }
            }
            if (g == 0) {
              g = 50;
            }
            b.w = g;
          } else {
            if (
              l.name == "cls" ||
              l.name == "interface" ||
              l.name == "package" ||
              l.name == "combinedFragment"
            ) {
              b.h = 50;
            }
          }
        }
      }
    }
  }
});
Designer.events.addEventListener("resizing", function (b) {
  var n = b.shape;
  var e = b.dir;
  var g = b.offset;
  var h = [];
  if (n.name == "verticalPool") {
    if (e == "b") {
      for (var j = 0; j < n.children.length; j++) {
        var f = n.children[j];
        var c = Model.getShapeById(f);
        if (c.name == "verticalLane" || c.name == "verticalSeparatorBar") {
          c.props.h = n.props.h - 40;
          Designer.painter.renderShape(c);
          h.push(c);
        }
      }
    } else {
      if (e == "r") {
        if (n.children && n.children.length > 0) {
          var d = null;
          for (var j = 0; j < n.children.length; j++) {
            var f = n.children[j];
            var c = Model.getShapeById(f);
            if (c.name == "horizontalSeparator") {
              c.props.w = n.props.w;
              Designer.painter.renderShape(c);
              h.push(c);
            }
            if (
              c.name == "verticalLane" &&
              (d == null || c.props.x > d.props.x)
            ) {
              d = c;
            }
          }
          if (d != null) {
            d.props.w += g.w;
            Designer.painter.renderShape(d);
            h.push(d);
          }
        }
      } else {
        if (e == "l") {
          if (n.children && n.children.length > 0) {
            var d = null;
            for (var j = 0; j < n.children.length; j++) {
              var f = n.children[j];
              var c = Model.getShapeById(f);
              if (c.name == "horizontalSeparator") {
                c.props.x += g.x;
                c.props.w += g.w;
                Designer.painter.renderShape(c);
                h.push(c);
              } else {
                if (c.name == "verticalSeparatorBar") {
                  c.props.x += g.x;
                  Designer.painter.renderShape(c);
                  h.push(c);
                }
              }
              if (
                c.name == "verticalLane" &&
                (d == null || c.props.x < d.props.x)
              ) {
                d = c;
              }
            }
            if (d != null) {
              d.props.w += g.w;
              d.props.x += g.x;
              Designer.painter.renderShape(d);
              h.push(d);
            }
          }
        }
      }
    }
  } else {
    if (n.name == "verticalLane") {
      var m = Model.getShapeById(n.parent);
      h = [m];
      m.props.w += g.w;
      m.props.h = n.props.h + 40;
      m.props.x += g.x;
      Designer.painter.renderShape(m);
      if (e == "r") {
        var o = [];
        var k = Model.getPersistenceById(n.id);
        for (var j = 0; j < m.children.length; j++) {
          var f = m.children[j];
          if (f != n.id) {
            var a = Model.getPersistenceById(f);
            var c = Model.getShapeById(f);
            if (c.name == "horizontalSeparator") {
              c.props.w += g.w;
              Designer.painter.renderShape(c);
              h.push(c);
            } else {
              if (a.props.x > k.props.x && a.name == "verticalLane") {
                o.push(c);
              }
            }
          }
        }
        if (o.length > 0) {
          var l = Utils.getContainedShapes(o);
          var p = Utils.getOutlinkers(l);
          l = l.concat(p);
          o = o.concat(l);
          Designer.op.moveShape(o, { x: g.w.toScale(), y: 0 });
          h = h.concat(o);
        }
      } else {
        if (e == "b") {
          for (var j = 0; j < m.children.length; j++) {
            var f = m.children[j];
            if (f != n.id) {
              var c = Model.getShapeById(f);
              if (
                c.name == "verticalLane" ||
                c.name == "verticalSeparatorBar"
              ) {
                c.props.h = n.props.h;
                Designer.painter.renderShape(c);
                h.push(c);
              }
            }
          }
        } else {
          if (e == "l") {
            var o = [];
            var k = Model.getPersistenceById(n.id);
            for (var j = 0; j < m.children.length; j++) {
              var f = m.children[j];
              if (f != n.id) {
                var a = Model.getPersistenceById(f);
                var c = Model.getShapeById(f);
                if (c.name == "horizontalSeparator") {
                  c.props.x += g.x;
                  c.props.w += g.w;
                  Designer.painter.renderShape(c);
                  h.push(c);
                } else {
                  if (c.name == "verticalSeparatorBar") {
                    c.props.x += g.x;
                    Designer.painter.renderShape(c);
                    h.push(c);
                  } else {
                    if (a.props.x < k.props.x && a.name == "verticalLane") {
                      o.push(c);
                    }
                  }
                }
              }
            }
            if (o.length > 0) {
              var l = Utils.getContainedShapes(o);
              var p = Utils.getOutlinkers(l);
              l = l.concat(p);
              o = o.concat(l);
              Designer.op.moveShape(o, { x: g.x.toScale(), y: 0 });
              h = h.concat(o);
            }
          }
        }
      }
    } else {
      if (n.name == "horizontalSeparator") {
        var m = Model.getShapeById(n.parent);
        h = [m];
        m.props.h += g.h;
        Designer.painter.renderShape(m);
        for (var j = 0; j < m.children.length; j++) {
          var f = m.children[j];
          var c = Model.getShapeById(f);
          if (f == n.id) {
            continue;
          }
          if (c.name != "horizontalSeparator") {
            c.props.h += g.h;
            Designer.painter.renderShape(c);
            h.push(c);
          } else {
            if (c.props.y > n.props.y) {
              c.props.y += g.h;
              Designer.painter.renderShape(c);
              h.push(c);
            }
          }
        }
      } else {
        if (n.name == "horizontalPool") {
          if (e == "r") {
            for (var j = 0; j < n.children.length; j++) {
              var f = n.children[j];
              var c = Model.getShapeById(f);
              if (
                c.name == "horizontalLane" ||
                c.name == "horizontalSeparatorBar"
              ) {
                c.props.w = n.props.w - 40;
                Designer.painter.renderShape(c);
                h.push(c);
              }
            }
          } else {
            if (e == "b") {
              if (n.children && n.children.length > 0) {
                var d = null;
                for (var j = 0; j < n.children.length; j++) {
                  var f = n.children[j];
                  var c = Model.getShapeById(f);
                  if (c.name == "verticalSeparator") {
                    c.props.h = n.props.h;
                    Designer.painter.renderShape(c);
                    h.push(c);
                  }
                  if (
                    c.name == "horizontalLane" &&
                    (d == null || c.props.y > d.props.y)
                  ) {
                    d = c;
                  }
                }
                if (d != null) {
                  d.props.h += g.h;
                  Designer.painter.renderShape(d);
                  h.push(d);
                }
              }
            } else {
              if (e == "t") {
                if (n.children && n.children.length > 0) {
                  var d = null;
                  for (var j = 0; j < n.children.length; j++) {
                    var f = n.children[j];
                    var c = Model.getShapeById(f);
                    if (c.name == "verticalSeparator") {
                      c.props.y += g.y;
                      c.props.h += g.h;
                      Designer.painter.renderShape(c);
                      h.push(c);
                    } else {
                      if (c.name == "horizontalSeparatorBar") {
                        c.props.y += g.y;
                        Designer.painter.renderShape(c);
                        h.push(c);
                      }
                    }
                    if (
                      c.name == "horizontalLane" &&
                      (d == null || c.props.y < d.props.y)
                    ) {
                      d = c;
                    }
                  }
                  if (d != null) {
                    d.props.h += g.h;
                    d.props.y += g.y;
                    Designer.painter.renderShape(d);
                    h.push(d);
                  }
                }
              }
            }
          }
        } else {
          if (n.name == "horizontalLane") {
            var m = Model.getShapeById(n.parent);
            h = [m];
            m.props.h += g.h;
            m.props.w += g.w;
            m.props.y += g.y;
            Designer.painter.renderShape(m);
            if (e == "r") {
              for (var j = 0; j < m.children.length; j++) {
                var f = m.children[j];
                if (f != n.id) {
                  var c = Model.getShapeById(f);
                  if (
                    c.name == "horizontalLane" ||
                    c.name == "horizontalSeparatorBar"
                  ) {
                    c.props.w = n.props.w;
                    Designer.painter.renderShape(c);
                    h.push(c);
                  }
                }
              }
            } else {
              if (e == "b") {
                var o = [];
                var k = Model.getPersistenceById(n.id);
                for (var j = 0; j < m.children.length; j++) {
                  var f = m.children[j];
                  if (f != n.id) {
                    var a = Model.getPersistenceById(f);
                    var c = Model.getShapeById(f);
                    if (c.name == "verticalSeparator") {
                      c.props.h += g.h;
                      Designer.painter.renderShape(c);
                      h.push(c);
                    } else {
                      if (a.props.y > k.props.y && a.name == "horizontalLane") {
                        o.push(c);
                      }
                    }
                  }
                }
                if (o.length > 0) {
                  var l = Utils.getContainedShapes(o);
                  var p = Utils.getOutlinkers(l);
                  l = l.concat(p);
                  o = o.concat(l);
                  Designer.op.moveShape(o, { x: 0, y: g.h.toScale() });
                  h = h.concat(o);
                }
              } else {
                if (e == "t") {
                  var o = [];
                  var k = Model.getPersistenceById(n.id);
                  for (var j = 0; j < m.children.length; j++) {
                    var f = m.children[j];
                    if (f != n.id) {
                      var a = Model.getPersistenceById(f);
                      var c = Model.getShapeById(f);
                      if (c.name == "verticalSeparator") {
                        c.props.y += g.y;
                        c.props.h += g.h;
                        Designer.painter.renderShape(c);
                        h.push(c);
                      } else {
                        if (c.name == "horizontalSeparatorBar") {
                          c.props.y += g.y;
                          Designer.painter.renderShape(c);
                          h.push(c);
                        } else {
                          if (
                            a.props.y < k.props.y &&
                            a.name == "horizontalLane"
                          ) {
                            o.push(c);
                          }
                        }
                      }
                    }
                  }
                  if (o.length > 0) {
                    var l = Utils.getContainedShapes(o);
                    var p = Utils.getOutlinkers(l);
                    l = l.concat(p);
                    o = o.concat(l);
                    Designer.op.moveShape(o, { x: 0, y: g.y.toScale() });
                    h = h.concat(o);
                  }
                }
              }
            }
          } else {
            if (n.name == "verticalSeparator") {
              var m = Model.getShapeById(n.parent);
              h = [m];
              m.props.w += g.w;
              Designer.painter.renderShape(m);
              for (var j = 0; j < m.children.length; j++) {
                var f = m.children[j];
                var c = Model.getShapeById(f);
                if (f == n.id) {
                  continue;
                }
                if (c.name != "verticalSeparator") {
                  c.props.w += g.w;
                  Designer.painter.renderShape(c);
                  h.push(c);
                } else {
                  if (c.props.x > n.props.x) {
                    c.props.x += g.w;
                    Designer.painter.renderShape(c);
                    h.push(c);
                  }
                }
              }
            }
          }
        }
      }
    }
  }
  return h;
});
Designer.events.addEventListener("beforeRemove", function (c) {
  var n = {};
  for (var g = 0; g < c.length; g++) {
    var k = c[g];
    n[k.id] = k;
  }
  var a = [];
  for (var g = 0; g < c.length; g++) {
    var k = c[g];
    if (
      k.name == "verticalSeparatorBar" &&
      !n[k.parent] &&
      a.indexOf(k.id) < 0
    ) {
      delete n[k.id];
    } else {
      if (
        k.name == "horizontalSeparatorBar" &&
        !n[k.parent] &&
        a.indexOf(k.id) < 0
      ) {
        delete n[k.id];
      } else {
        if (k.name == "horizontalSeparator") {
          var m = Model.getShapeById(k.parent);
          var h = null;
          var l = 0;
          for (var f = 0; f < m.children.length; f++) {
            var e = m.children[f];
            var d = Model.getShapeById(e);
            if (d.name == "horizontalSeparator" && !n[e]) {
              l += 1;
            } else {
              if (d.name == "verticalSeparatorBar") {
                h = d;
              }
            }
          }
          if (l == 0 && h != null) {
            n[h.id] = h;
            if (a.indexOf(h.id) < 0) {
              a.push(h.id);
            }
          }
        } else {
          if (k.name == "verticalSeparator") {
            var m = Model.getShapeById(k.parent);
            var h = null;
            var l = 0;
            for (var f = 0; f < m.children.length; f++) {
              var e = m.children[f];
              var d = Model.getShapeById(e);
              if (d.name == "verticalSeparator" && !n[e]) {
                l += 1;
              } else {
                if (d.name == "horizontalSeparatorBar") {
                  h = d;
                }
              }
            }
            if (l == 0 && h != null) {
              n[h.id] = h;
              if (a.indexOf(h.id) < 0) {
                a.push(h.id);
              }
            }
          }
        }
      }
    }
  }
  c = [];
  for (var b in n) {
    c.push(n[b]);
  }
  return c;
});
Designer.events.addEventListener("removed", function (b) {
  var c = b.shapes;
  var m = b.range;
  var s = b.changedIds;
  var g = [];
  var r = [];
  for (var j = 0; j < c.length; j++) {
    var o = c[j];
    if (
      o.name == "verticalLane" &&
      m.indexOf(o.parent) < 0 &&
      r.indexOf(o.parent) < 0
    ) {
      r.push(o.parent);
    } else {
      if (
        o.name == "horizontalLane" &&
        m.indexOf(o.parent) < 0 &&
        r.indexOf(o.parent) < 0
      ) {
        r.push(o.parent);
      } else {
        if (o.name == "verticalSeparatorBar" && m.indexOf(o.parent) < 0) {
          var q = Model.getShapeById(o.parent);
          q.props.w -= o.props.w;
          q.props.x += o.props.w;
          Designer.painter.renderShape(q);
          if (s.indexOf(o.parent) < 0) {
            s.push(o.parent);
            g.push(q);
          }
        } else {
          if (o.name == "horizontalSeparatorBar" && m.indexOf(o.parent) < 0) {
            var q = Model.getShapeById(o.parent);
            q.props.y += o.props.h;
            q.props.h -= o.props.h;
            Designer.painter.renderShape(q);
            if (s.indexOf(o.parent) < 0) {
              s.push(o.parent);
              g.push(q);
            }
          } else {
            if (
              o.name == "horizontalSeparator" &&
              m.indexOf(o.parent) < 0 &&
              r.indexOf(o.parent) < 0
            ) {
              r.push(o.parent);
            } else {
              if (
                o.name == "verticalSeparator" &&
                m.indexOf(o.parent) < 0 &&
                r.indexOf(o.parent) < 0
              ) {
                r.push(o.parent);
              }
            }
          }
        }
      }
    }
  }
  for (var n = 0; n < r.length; n++) {
    var l = r[n];
    var q = Model.getShapeById(l);
    if (q.name == "verticalPool") {
      var p = 0;
      var e = 0;
      for (var j = 0; j < q.children.length; j++) {
        var f = q.children[j];
        var d = Model.getShapeById(f);
        if (d.name == "verticalLane") {
          e++;
          p += d.props.w;
        } else {
          if (d.name == "verticalSeparatorBar") {
            p += d.props.w;
          }
        }
      }
      if (e > 0) {
        q.props.w = p;
        Designer.painter.renderShape(q);
        if (s.indexOf(l) < 0) {
          s.push(l);
          g.push(q);
        }
        var a = Utils.rangeChildren(q);
        g = g.concat(a);
      }
    } else {
      if (q.name == "horizontalPool") {
        var k = 0;
        var e = 0;
        for (var j = 0; j < q.children.length; j++) {
          var f = q.children[j];
          var d = Model.getShapeById(f);
          if (d.name == "horizontalLane") {
            e++;
            k += d.props.h;
          } else {
            if (d.name == "horizontalSeparatorBar") {
              k += d.props.h;
            }
          }
        }
        if (e > 0) {
          q.props.h = k;
          Designer.painter.renderShape(q);
          if (s.indexOf(l) < 0) {
            s.push(l);
            g.push(q);
          }
          var a = Utils.rangeChildren(q);
          g = g.concat(a);
        }
      }
    }
  }
  return g;
});
Designer.events.addEventListener("shapeChanged", function (a) {});
Designer.events.addEventListener("renderShapeDom", function (focus) {
  if (focus != null) {
    if (focus.type == "shape") {
      var shape = focus.shape;
      if (shape.name == "uiGrid" && $("#grid_dom").length == 0) {
        var props = shape.props,
          x = props.x,
          y = props.y,
          w = props.w,
          h = props.h,
          zindex = props.zindex,
          angle = props.angle;
        if (angle != 0) {
          return;
        }
        var minVal = 20;
        var lineColor = "50,50,50";
        var dom = $("<div id='grid_dom'></div>").appendTo(
          $("#designer_canvas")
        );
        dom.css({
          position: "absolute",
          left: x.toScale(),
          top: y.toScale(),
          width: w.toScale(),
          height: h.toScale(),
          "z-index": zindex + 1,
        });
        var path2 = shape.path[2].actions;
        var rowArr = [0.5],
          columnArr = [0.5];
        for (var i = 0; i < path2.length; i++) {
          var pathItem = path2[i];
          if (pathItem.x == 0) {
            var pathY = eval("var w=" + w + ";var h = " + h + ";" + pathItem.y);
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
        for (var i = 1; i < rowArr.length; i++) {
          dom.append(
            "<div class='line row' sort=" +
              i +
              " style='cursor:s-resize; padding-top:" +
              (6).toScale() +
              "px; border-top:2px dotted transparent; width:" +
              (w - 12).toScale() +
              "px; position:absolute; left:6px; top:" +
              rowArr[i].toScale() +
              "px;'></div>"
          );
        }
        for (var i = 1; i < columnArr.length; i++) {
          dom.append(
            "<div class='line column' sort=" +
              i +
              " style='cursor:e-resize; padding-left:" +
              (6).toScale() +
              "px; border-left:2px dotted transparent; height:" +
              (h - 12).toScale() +
              "px; position:absolute; top:6px; left:" +
              columnArr[i].toScale() +
              "px;'></div>"
          );
        }
        var sort = 0,
          yL = 0,
          xL = 0;
        dom
          .children(".row")
          .off("mousedown.uigrid")
          .on("mousedown.uigrid", function (e) {
            e.stopPropagation();
            var $that = $(this);
            $that.css({
              "border-top-color": "rgb(" + lineColor + ")",
              width: (w + 16).toScale() + "px",
              left: "-" + (8).toScale() + "px",
            });
            sort = $that.attr("sort");
            var pageY = e.pageY;
            var domPos = $that.position();
            var domPos1 = dom
              .children(".row")
              .eq(sort - 2)
              .position();
            $(document)
              .off("mousemove.uigrid")
              .on("mousemove.uigrid", function (e1) {
                e1.stopPropagation();
                var pageY_ = e1.pageY;
                domPos1.top = sort == 1 ? 0 : domPos1.top;
                var top_ = domPos.top + (pageY_ - pageY);
                top_ =
                  top_ < domPos1.top + minVal ? domPos1.top + minVal : top_;
                $that.css({ top: top_ });
                yL = (top_ - domPos.top).restoreScale();
              });
          });
        dom
          .children(".column")
          .off("mousedown.uigrid")
          .on("mousedown.uigrid", function (e) {
            e.stopPropagation();
            $("#shape_opt_box").css({ "pointer-events": "none" });
            var $that = $(this);
            $that.css({
              "border-left-color": "rgb(" + lineColor + ")",
              height: (h + 16).toScale() + "px",
              top: "-" + (8).toScale() + "px",
            });
            sort = $that.attr("sort");
            var pageX = e.pageX;
            var domPos = $that.position();
            var domPrevPos = $that.prev().position();
            var domNextPos = $that.next().position(),
              domPrevPosL = sort == 1 ? 0 : domPrevPos.left,
              domNextPosL = domNextPos == null ? 9999 : domNextPos.left;
            $(document)
              .off("mousemove.uigrid")
              .on("mousemove.uigrid", function (e1) {
                e1.stopPropagation();
                var pageX_ = e1.pageX;
                var left_ = domPos.left + (pageX_ - pageX);
                left_ =
                  left_ < domPrevPosL + minVal ? domPrevPosL + minVal : left_;
                left_ =
                  left_ > domNextPosL - minVal ? domNextPosL - minVal : left_;
                $that.css({ left: left_ });
                xL = (left_ - domPos.left).restoreScale();
              });
          });
        $(document)
          .off("mouseup.uigrid")
          .on("mouseup.uigrid", function (e) {
            $(document).off("mousemove.uigrid");
            $(document).off("mouseup.uigrid");
            $("#shape_opt_box").css({ "pointer-events": "auto" });
            if (yL != 0) {
              if (Math.abs(yL) < 2) {
                return;
              }
              dom.remove();
              h = h + +yL;
              for (var i = sort; i < rowArr.length; i++) {
                rowArr[i] = rowArr[i] + yL;
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
            } else {
              if (Math.abs(xL) < 2) {
                return;
              }
              dom.remove();
              columnArr[sort] = columnArr[sort] + xL;
              w = columnArr[columnArr.length - 1];
              var gridActions = [];
              for (var i = 0; i < shape.path[2].actions.length; i++) {
                var action = shape.path[2].actions[i];
                if (action.x == 0 || action.x == "w") {
                  gridActions.push(action);
                }
              }
              for (var i = 1; i < columnArr.length - 1; i++) {
                var yFormla = "Math.floor(w*" + columnArr[i] / w + ")+0.5";
                gridActions.push({ action: "move", x: yFormla, y: 0 });
                gridActions.push({ action: "line", x: yFormla, y: "h" });
              }
            }
            var textBlock = shape.textBlock;
            var textNum = 0;
            for (var i = 0; i < rowArr.length - 1; i++) {
              for (var j = 0; j < columnArr.length - 1; j++) {
                var textX = "Math.floor(w*" + columnArr[j] / w + ")",
                  textW =
                    "Math.floor(w*" +
                    (columnArr[j + 1] - columnArr[j]) / w +
                    ")",
                  textY = "Math.floor(h*" + rowArr[i] / h + ")",
                  textH =
                    "Math.floor(h*" + (rowArr[i + 1] - rowArr[i]) / h + ")";
                textBlock[textNum].position.x = textX;
                textBlock[textNum].position.w = textW;
                textBlock[textNum].position.y = textY;
                textBlock[textNum].position.h = textH;
                textNum++;
              }
            }
            shape.path[2].actions = gridActions;
            shape.props.h = h;
            shape.props.w = w;
            Schema.initShapeFunctions(shape);
            Model.update(shape);
            Designer.painter.renderShape(shape);
            Utils.unselect();
          });
        $(document).on("mouseup.uigrid", function () {
          $(document).off("mouseup.uigrid");
          $("#grid_dom").remove();
        });
        $(window).on("keydown.uigrid", function () {
          $(window).off("keydown.uigrid");
          $("#grid_dom").remove();
        });
      }
      if (shape.category == "grid" && $("#grid_dom").length == 0) {
        var props = shape.props,
          x = props.x,
          y = props.y,
          w = props.w,
          h = props.h,
          zindex = props.zindex,
          angle = props.angle;
        if (angle != 0) {
          return;
        }
        var minVal = 20;
        var lineColor = "50,50,50";
        var dom = $("<div id='grid_dom'></div>").appendTo(
          $("#designer_canvas")
        );
        dom.css({
          position: "absolute",
          left: x.toScale(),
          top: y.toScale(),
          width: w.toScale(),
          height: h.toScale(),
          "z-index": zindex + 1,
        });
        var path = shape.path;
        var rowHArr = [],
          columnWArr = [];
        for (var i = 0; i < path.length; i++) {
          var pathItem = path[i];
          var rowH = eval(
              "var w=" + w + ";var h = " + h + ";" + pathItem[0].actions[0].h
            ),
            rowY = eval(
              "var w=" + w + ";var h = " + h + ";" + pathItem[0].actions[0].y
            );
          rowHArr.push(rowH);
          dom.append(
            "<div class='line row' sort=" +
              (i + 1) +
              " style='cursor:s-resize; padding-top:" +
              (6).toScale() +
              "px; border-top:2px dotted transparent; width:" +
              (w - 12).toScale() +
              "px; position:absolute; left:6px; top:" +
              (rowY + rowH).toScale() +
              "px;'></div>"
          );
        }
        for (var i = 0; i < path[0].length; i++) {
          var pathItem = path[0][i];
          var columnW = eval(
              "var w=" + w + ";var h = " + h + ";" + pathItem.actions[0].w
            ),
            columnX = eval(
              "var w=" + w + ";var h = " + h + ";" + pathItem.actions[0].x
            );
          columnWArr.push(columnW);
          dom.append(
            "<div class='line column' sort=" +
              (i + 1) +
              " style='cursor:e-resize; padding-left:" +
              (6).toScale() +
              "px; border-left:2px dotted transparent; height:" +
              (h - 12).toScale() +
              "px; position:absolute; top:6px; left:" +
              (columnW + columnX).toScale() +
              "px;'></div>"
          );
        }
        var sort = 0,
          yL = 0,
          xL = 0;
        dom
          .children(".row")
          .off("mousedown.grid")
          .on("mousedown.grid", function (e) {
            e.stopPropagation();
            var $that = $(this);
            $that.css({
              "border-top-color": "rgb(" + lineColor + ")",
              width: (w + 16).toScale() + "px",
              left: "-" + (8).toScale() + "px",
            });
            sort = $that.attr("sort");
            var pageY = e.pageY;
            var domPos = $that.position();
            var domPos1 = dom
              .children(".row")
              .eq(sort - 2)
              .position();
            $(document)
              .off("mousemove.grid")
              .on("mousemove.grid", function (e1) {
                e1.stopPropagation();
                var pageY_ = e1.pageY;
                domPos1.top = sort == 1 ? 0 : domPos1.top;
                var top_ = domPos.top + (pageY_ - pageY);
                top_ =
                  top_ < domPos1.top + minVal ? domPos1.top + minVal : top_;
                $that.css({ top: top_ });
                yL = (top_ - domPos.top).restoreScale();
              });
          });
        dom
          .children(".column")
          .off("mousedown.grid")
          .on("mousedown.grid", function (e) {
            e.stopPropagation();
            $("#shape_opt_box").css({ "pointer-events": "none" });
            var $that = $(this);
            $that.css({
              "border-left-color": "rgb(" + lineColor + ")",
              height: (h + 16).toScale() + "px",
              top: "-" + (8).toScale() + "px",
            });
            sort = $that.attr("sort");
            var pageX = e.pageX;
            var domPos = $that.position();
            var domPrevPos = $that.prev().position();
            var domNextPos = $that.next().position(),
              domPrevPosL = sort == 1 ? 0 : domPrevPos.left,
              domNextPosL = domNextPos == null ? 9999 : domNextPos.left;
            $(document)
              .off("mousemove.grid")
              .on("mousemove.grid", function (e1) {
                e1.stopPropagation();
                var pageX_ = e1.pageX;
                var left_ = domPos.left + (pageX_ - pageX);
                left_ =
                  left_ < domPrevPosL + minVal ? domPrevPosL + minVal : left_;
                left_ =
                  left_ > domNextPosL - minVal ? domNextPosL - minVal : left_;
                $that.css({ left: left_ });
                xL = (left_ - domPos.left).restoreScale();
              });
          });
        $(document)
          .off("mouseup.grid")
          .on("mouseup.grid", function (e) {
            $(document).off("mousemove.uigrid");
            $(document).off("mouseup.uigrid");
            $("#shape_opt_box").css({ "pointer-events": "auto" });
            if (yL != 0) {
              if (Math.abs(yL) < 2) {
                return;
              }
              dom.remove();
              h = h + +yL;
              rowHArr[sort - 1] = rowHArr[sort - 1] + yL;
            } else {
              if (Math.abs(xL) < 2) {
                return;
              }
              dom.remove();
              columnWArr[sort - 1] = columnWArr[sort - 1] + xL;
              if (sort == columnWArr.length) {
                w = w + xL;
              } else {
                columnWArr[sort] = columnWArr[sort] - xL;
              }
            }
            var columnVal = columnWArr.length;
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
                var x1 =
                    "w*" +
                    Math.round(((columnW_ - columnW) / w) * 10000) / 10000,
                  y1 = "h*" + Math.round(((rowH_ - rowH) / h) * 10000) / 10000,
                  w1 = "w*" + Math.round((columnW / w) * 10000) / 10000,
                  h1 = "h*" + Math.round((rowH / h) * 10000) / 10000;
                if (j == columnWArr.length - 1) {
                  w1 = "w-" + x1;
                }
                if (i == rowHArr.length - 1) {
                  h1 = "h-" + y1;
                }
                path_[i][j].actions = [
                  { action: "rect", x: x1, y: y1, w: w1, h: h1 },
                ];
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
                if (
                  Math.abs(linker.from.x - shape.props.x - shape.props.w) < 2
                ) {
                  linker.from.x = linker.from.x + (w - shape.props.w);
                }
                if (
                  Math.abs(linker.from.y - shape.props.y - shape.props.h) < 2
                ) {
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
            Utils.unselect();
            Utils.selectShape(shape.id);
          });
        $(document).on("mouseup.grid", function () {
          $(document).off("mouseup.grid");
          $("#grid_dom").remove();
        });
        $(window).on("keydown.grid", function () {
          $(window).off("keydown.grid");
          $("#grid_dom").remove();
        });
      }
    }
  }
});
Designer.events.addEventListener("gridSelect", function (a) {
  if (Utils.getSelected().length > 0 && a.category == "grid") {
    a = Utils.getSelected()[0];
  } else {
    return;
  }
  var b = $("#designer_canvas");
  b.off("mouseup touchend.gridSelect").on(
    "mouseup touchend.gridSelect",
    function (n) {
      b.off("mouseup touchend.gridSelect");
      if (n.type == "touchend") {
        n = n.originalEvent.changedTouches[0];
      }
      var p = Utils.getRelativePos(n.pageX, n.pageY, b);
      var q = a.getTextBlock();
      var m = a.path.length,
        o = a.path[0].length;
      p.x = p.x.restoreScale();
      p.y = p.y.restoreScale();
      if (a.props.angle != 0) {
        return;
      }
      var f = p.x - a.props.x;
      var d = p.y - a.props.y;
      for (var k = 0; k < q.length; k++) {
        var g = q[k];
        if (Utils.pointInRect(f, d, g.position)) {
          var l = [];
          if (f > 0 && f < 10) {
            for (var h = 0; h < o; h++) {
              l.push(k + h);
            }
          } else {
            if (d > 0 && d < 10) {
              for (var h = 0; h < m; h++) {
                l.push(k + h * o);
              }
            } else {
              l.push(k);
            }
          }
          Utils.selectGrid(a, l);
          break;
        }
      }
    }
  );
});
Designer.events.addEventListener("renderGridSelect", function (c) {
  var f = c.getTextBlock();
  var e = $("#designer_canvas");
  var s = $("#grid_selects");
  s.remove();
  s = $("<div id='grid_selects'></div>").appendTo(e);
  s.css({
    top: c.props.y.toScale(),
    left: c.props.x.toScale(),
    width: c.props.w.toScale(),
    height: c.props.h.toScale(),
    "z-index": c.props.zindex,
  });
  var t = Utils.gridSelectObj.indexs,
    l = Utils.gridSelectObj.rows,
    d = Utils.gridSelectObj.columns;
  var m = Utils.getShapeFillStyle(c.fillStyle);
  for (var q = 0; q < t.length; q++) {
    var h = t[q];
    var b = $("<div class='grid_select' num=" + h + " ></div>").appendTo(s);
    var r = f[h];
    var g = {};
    var o = c.getPath()[h];
    c.theme = c.theme || {};
    if (c.theme.name == "header") {
      if (o.row == 0) {
        g = $.extend({}, m, c.theme.row[0].fillStyle, o.fillStyle);
      } else {
        g = $.extend({}, m, c.theme.row[1].fillStyle, o.fillStyle);
      }
    } else {
      if (c.theme.name == "striping") {
        if (c.theme.row) {
          g = $.extend({}, m, c.theme.row[o.row % 2].fillStyle, o.fillStyle);
        }
        if (c.theme.column) {
          g = $.extend(
            {},
            m,
            c.theme.column[o.column % 2].fillStyle,
            o.fillStyle
          );
        }
      } else {
        g = $.extend({}, m, o.fillStyle);
      }
    }
    var p = [67, 134, 245];
    var k = g.color.split(",");
    var u = true;
    for (var n = 0; n < k.length; n++) {
      if (Math.abs(k[n] - p[n]) < 80) {
        u = false;
      } else {
        u = true;
        break;
      }
    }
    var a = "rgb(";
    if (u) {
      a = a + p.join(",") + ")";
    } else {
      for (var n = 0; n < k.length; n++) {
        if (n == k.length - 1) {
          a += 255 - k[n] + ")";
        } else {
          a += 255 - k[n] + ",";
        }
      }
    }
    b.css({
      top: (r.position.y + 1).toScale(),
      left: (r.position.x + 1).toScale(),
      width: (r.position.w - 6).toScale(),
      height: (r.position.h - 6).toScale(),
      "border-color": a,
    });
    $("#bar_grid_fill").colorButton("setColor", g.color || "255,255,255");
  }
  UI.update();
});
// Designer.events.addEventListener("isMember", function (a) {
//   $.ajax({
//     url: "/view/privatefilecount",
//     type: "POST",
//     success: function (b) {
//       var c = b.teammember || b.member ? true : false;
//       a(c);
//     },
//   });
// });
Designer.events.addEventListener("shapeCount", function () {
  var b = (Model.orderList || []).length;
  if (b == 0) {
    if (typeof DesignerInsertTemp == "undefined") {
      var a = {
        js: ["/assets/js/designer_insert_temp.js"],
        css: ["/assets/css/designer_insert_temp.css"],
      };
      bigPipe.render(a, function () {
        DesignerInsertTemp.init("flow");
      });
    } else {
      DesignerInsertTemp.init("flow");
    }
  } else {
    if (typeof DesignerInsertTemp != "undefined") {
      DesignerInsertTemp.clear();
    }
  }
});
Designer.events.addEventListener("isTeam", function (a) {
  var b = orgId ? true : false;
  a(b);
});
