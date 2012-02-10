var update_channels = function(channels)
{
    $.each(channels, function(count, item) {
        txt = '<li><a href="#" data-channel="'+ item + '">' + item + '</a></li>';
        $("#channel_list").append(txt);
    });
}

$(function(){
    var ws = new WebSocket("ws://localhost:8888/websocket");
    ws.onopen = function() {
        ws.send("Hello, world");
    };
    ws.onmessage = function (evt) {
        var data = JSON.parse(evt.data);
        if(data.channels){
            update_channels(data.channels);
        }
    };
});
