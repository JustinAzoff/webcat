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
        chans = self.channels.keys()
        return [{ "name": chan, "unread": 0} for chan in chans]
