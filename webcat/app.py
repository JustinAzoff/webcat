import tornado.ioloop
import os
import tornado.web
from tornado.escape import json_decode, json_encode

from webcat.dictstore import DictStore

STORE = DictStore()

class MainHandler(tornado.web.RequestHandler):
    def get(self):
        self.render("index.html")

class ChannelsHandler(tornado.web.RequestHandler):
    def get(self):
        channels = STORE.get_channels()
        self.write({"channels": channels})

class PostHandler(tornado.web.RequestHandler):
    def post(self):
        msg = self.get_argument("msg")
        targets = self.get_arguments("target")
        for t in targets:
            STORE.add_msg(t, msg)
        self.write('"ok"')

class MsgHandler(tornado.web.RequestHandler):
    def get(self, target):
        self.write({"messages": STORE.get_msgs(target)})

def make_app():
    settings = dict(
        template_path=os.path.join(os.path.dirname(__file__), "templates"),
        static_path=os.path.join(os.path.dirname(__file__), "static"),
    )
    application = tornado.web.Application([
        (r"/static/(.*)", tornado.web.StaticFileHandler),
        (r"/", MainHandler),
        (r"/post", PostHandler),
        (r"/msgs/(.*)", MsgHandler),
        (r"/channels", ChannelsHandler),
    ], **settings)
    return application

if __name__ == "__main__":
    application = make_app()
    application.listen(8888)
    tornado.ioloop.IOLoop.instance().start()
