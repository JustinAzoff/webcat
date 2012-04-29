import collections
import datetime

class DictStore:
    def __init__(self):
        self.channels = collections.defaultdict(list)

    def msg_factory(self, channel, msg):
        return {
            "channel": channel,
            "time": datetime.datetime.utcnow().strftime('%Y-%m-%dT%H:%M:%S'),
            "msg": msg
            }
            

    def add_msg(self, channel, msg):
        m = self.msg_factory(channel, msg)
        self.channels[channel].append(m)
        return m

    def get_msgs(self, channel):
        return self.channels[channel]

    def get_channels(self):
        return [{ "name": name, "unread": len(items)} for (name, items) in self.channels.items()]
