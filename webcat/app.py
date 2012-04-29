import tornado.ioloop
import os
import tornado.web
import tornado.websocket
from tornado.escape import json_decode, json_encode

from tornadio2 import SocketConnection, TornadioRouter, SocketServer

from webcat.dictstore import DictStore

STORE = DictStore()
SOCKETS = set()

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("index.html")

class ChannelsHandler(tornado.web.RequestHandler):
    def get(self):
        channels = STORE.get_channels()
        self.write(json_encode(channels))
        #self.write({"models": channels})

class ChannelMessagesHandler(tornado.web.RequestHandler):
    def get(self, target):
        messages = STORE.get_msgs(target)
        self.write(json_encode(messages))

class PostHandler(tornado.web.RequestHandler):
    def post(self):
        msg = self.get_argument("msg")
        targets = self.get_arguments("target")
        for t in targets:
            m = STORE.add_msg(t, msg)
        self.write('"ok"')
        for s in SOCKETS:
            s.emit("message", m)

class Live(SocketConnection):
    def on_open(self, request):
        print "WebSocket open"
        self.emit("channels", {"channels": STORE.get_channels()})
        SOCKETS.add(self)

    def on_message(self, message):
        self.send({"msg": "You said: " + message})

    def on_close(self):
        print "WebSocket closed"
        SOCKETS.remove(self)

LiveRouter = TornadioRouter(Live)


def make_app(port=8889):
    settings = dict(
        template_path=os.path.join(os.path.dirname(__file__), "templates"),
        static_path=os.path.join(os.path.dirname(__file__), "static"),
        socket_io_port=port
    )
    application = tornado.web.Application(LiveRouter.apply_routes([
        (r"/static/(.*)", tornado.web.StaticFileHandler),
        (r"/", MainHandler),
        (r"/channels/.*", MainHandler),
        (r"/post", PostHandler),
        (r"/channel/(.*)/messages", ChannelMessagesHandler),
        (r"/channels", ChannelsHandler),
        (r"/websocket", Live),
    ]), **settings)
    return application

def serv():
    port = int(os.environ.get('PORT', 8889))
    application = make_app(port)
    #application.listen(port)
    SocketServer(application,xheaders=True)
    #tornado.ioloop.IOLoop.instance().start()

if __name__ == "__main__":
    serv()
