webcat
------

tornado+websockets+backbone.js

kind of a chat application, but no user stuff... Start the server:

    webcat-serv

and then run something like


    while true;do curl http://localhost:8889/post -d target=`hostname` -d msg="`uptime`";sleep 3;done

or

    sudo tail -f /var/log/messages | while read m;do curl http://localhost:8889/post -d target=`hostname` -d msg="$m";done
