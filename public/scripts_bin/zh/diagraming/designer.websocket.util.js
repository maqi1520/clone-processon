(function () {
  if (!("WebSocket" in window)) {
    return;
  }
  function a() {}
  function b() {
    var e = Math.random(),
      d = e + new Date().getTime();
    return d.toString(16).replace(".", "");
  }
  function c(e, p, t) {
    var t = t || {},
      d = t.clientId,
      r = t.heartMsg || JSON.stringify({ type: "PING" }),
      h = t.onOpen || a,
      s = t.onMessage || a,
      n = t.onClose || a,
      j = t.onError || a,
      g = t.onCatchError || a,
      m = t.timeoutInterval || 60000,
      i = t.reconnectInterval || 30000;
    this.url = e + "&clientId=" + (d || b());
    this.maxReconnectAttempts = t.maxReconnectAttempts || 5;
    this.reconnectAttempts = 0;
    this.protocols = p;
    this.readyState = WebSocket.CONNECTING;
    var q = this,
      k = false,
      o = new Date().getTime(),
      f = false,
      l;
    this.open = function (w) {
      try {
        if (f) {
          return;
        }
        l = new WebSocket(q.url, p || []);
        if (w) {
          if (
            this.maxReconnectAttempts &&
            this.reconnectAttempts > this.maxReconnectAttempts
          ) {
            this.close();
            return;
          }
        } else {
          this.reconnectAttempts = 0;
        }
        var u = setTimeout(function () {
          l && l.close();
        }, m);
        l.onopen = function (x) {
          clearTimeout(u);
          q.readyState = WebSocket.OPEN;
          q.reconnectAttempts = 0;
          w = false;
          o = new Date().getTime();
          h(x);
          q.heartCheck.reset().start();
        };
        l.onclose = function (x) {
          l = null;
          q.heartCheck.reset();
          if (k) {
            q.readyState = WebSocket.CLOSED;
            if (f) {
              n(x, "timeout");
            } else {
              n(x, "force");
            }
          } else {
            q.readyState = WebSocket.CONNECTING;
            setTimeout(function () {
              q.reconnectAttempts++;
              q.open(true);
            }, i);
          }
        };
        l.onmessage = function (x) {
          q.heartCheck.reset().start();
          if (new Date().getTime() - o > 3600000) {
            f = true;
            q.close();
          }
          s(x);
        };
        l.onerror = function (x) {
          j(x);
        };
      } catch (v) {
        g(v);
      }
    };
    this.send = function (u) {
      if (l) {
        if (JSON.parse(u).type != "PING") {
          o = new Date().getTime();
        }
        return l.send(u);
      } else {
      }
    };
    this.close = function () {
      q.readyState = WebSocket.CLOSED;
      k = true;
      if (l) {
        l.close();
      }
    };
    this.heartCheck = {
      timeout: 15000,
      resetCount: 0,
      timeoutObj: null,
      reset: function () {
        clearTimeout(this.timeoutObj);
        return this;
      },
      start: function () {
        var u = this;
        u.timeoutObj = setTimeout(function () {
          q.send(r);
        }, u.timeout);
      },
    };
  }
  window.WebSocketPo = c;
})();
var flowWebsocketUtil = {
  MESSAGE_TYPE: {
    PING: "PING",
    PONG: "pong",
    JOIN_IN: "JOIN_IN",
    LEAVE_OUT: "LEAVE_OUT",
    ONLINE_USER: "ONLINE_USER",
    DELIVER_MESSAGE: "_s@deliver",
  },
  ws: null,
  websocketUrl: websocketUrl,
  clientId: null,
  chartId: chartId,
  userId: userId,
  userName: userName || "访客",
  usersMap: {},
  collaUserList: [],
  init: function () {
    var a = this;
    a.clientId = a.newClientId();
    this.websocketInit();
  },
  newClientId: function () {
    var b = Math.random(),
      a = b + new Date().getTime();
    return a.toString(16).replace(".", "");
  },
  websocketInit: function () {
    var h = this,
      f = h.websocketUrl,
      e = h.usersMap,
      g = h.chartId,
      c = h.userId,
      d = h.userName,
      a = h.clientId,
      b;
    if ("WebSocketPo" in window) {
      if (location.href.indexOf("iframe") > -1) {
        return;
      }
      b = h.ws = new WebSocketPo(
        f +
          "?chartId=" +
          g +
          "&userId=" +
          c +
          "&userName=" +
          encodeURIComponent(d),
        null,
        {
          clientId: a,
          reconnectInterval: 1,
          heartMsg: JSON.stringify({ type: h.MESSAGE_TYPE.PING }),
          onOpen: function () {
            h.deliverMsg({ type: h.MESSAGE_TYPE.ONLINE_USER });
          },
          onMessage: function (i) {
            try {
              var m = JSON.parse(i.data);
              if (m.type == h.MESSAGE_TYPE.PONG) {
              } else {
                if (m.type === h.MESSAGE_TYPE.ONLINE_USER) {
                  CLB.manageOnlineUsers(m.clients);
                } else {
                  if (m.type === h.MESSAGE_TYPE.JOIN_IN) {
                    h.deliverMsg({ type: h.MESSAGE_TYPE.ONLINE_USER });
                  } else {
                    if (m.type === h.MESSAGE_TYPE.LEAVE_OUT) {
                      h.deliverMsg({ type: h.MESSAGE_TYPE.ONLINE_USER });
                    } else {
                      if (m.type === "forceRefresh") {
                        mind.messageSource.excuteMsgDirect.call(
                          mind,
                          m,
                          function () {}
                        );
                      } else {
                        if (m.type === h.MESSAGE_TYPE.DELIVER_MESSAGE) {
                          var j = m.content,
                            l = j.msg;
                          CLB.onMessage(l);
                          var k = l[0].messages[0];
                          var o = null;
                          if (k.action == "update") {
                            o = k.content.shapes[0].id;
                          } else {
                            o = k.content[0].id;
                          }
                          CLB.showUserOp(o, j.client);
                        }
                      }
                    }
                  }
                }
              }
            } catch (n) {
              return;
            }
          },
          onClose: function (i, j) {
            h.ws = null;
          },
          onError: function (i) {
            h.ws = null;
          },
          onCatchError: function (i) {
            h.ws = null;
            $.showTip(
              "当前浏览器不支持WebSocket，请选择其他浏览器(Chrome, FireFox, Safari)"
            );
          },
        }
      );
      b.open();
    } else {
      $.showTip(
        "当前浏览器不支持WebSocket，请选择其他浏览器(Chrome, FireFox, Safari)"
      );
    }
  },
  deliverMsg: function (b) {
    var a = this;
    if (a.ws && a.ws.readyState === WebSocket.OPEN) {
      a.ws.send(JSON.stringify(b));
    } else {
      a.getCollaUserNum(function (c) {
        if (typeof c == "object" && c.length > 1) {
          CLB.renderOff(true);
        }
      });
    }
  },
  getCollaUserNum: function (a) {
    $.get(
      "https://wpscb.processon.com/online_user",
      { chartId: chartId },
      function (b) {
        a(b);
      }
    );
  },
};
flowWebsocketUtil.init();
