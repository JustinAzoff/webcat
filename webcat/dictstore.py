import collections
import datetime

class DictStore:
    def __init__(self):
        self.channels = collections.defaultdict(list)

    def msg_factory(self, msg):
        return {
            "time": datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S'),
            "msg": msg
            }
            

    def add_msg(self, channel, msg):
        self.channels[channel].append(self.msg_factory(msg))

    def get_msgs(self, channel):
        return self.channels[channel]

    def get_channels(self):
        return self.channels.keys()
