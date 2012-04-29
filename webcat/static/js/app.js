// Load the application once the DOM is ready, using `jQuery.ready`:
$(function(){

  // Channel Model
  // ----------

  // Our basic **Channel** model has `name` and `unread` attributes
  var Channel = Backbone.Model.extend({
    urlRoot: '/channel',

    defaults: function() {
      return {
        name: "unnamed?",
        unread: 0
      };
    },

    // Ensure that each Channel created has `name`.
    initialize: function() {
      if (!this.get("name")) {
        this.set({"name": this.defaults().name});
      }
      if (!this.get("unread")) {
        this.set({"unread": this.defaults().unread});
      }
      this.set({"id": this.get("name")}) 
      this.messages = new Messages()
      this.messages.url = this.url() + "/messages";
      console.log("messages url set to " + this.messages.url);
    },

  });

  // Channel Collection
  // ---------------

  // The collection of Channels
  var Channels = Backbone.Collection.extend({

    // Reference to this collection's model.
    model: Channel,
    url: "/channels",

    // Channels are sorted by their name
    comparator: function(channel) {
      return channel.get('name');
    }

  });

  // Create our global collection of **Channels**.
  var Channels = new Channels;

  // Channel Item View
  // --------------

  // The DOM element for a channel
  var ChannelView = Backbone.View.extend({

    //... is a list tag.
    tagName:  "li",

    // Cache the template function for a single item.
    template: _.template($('#channel-template').html()),

    // The DOM events specific to an item.
    events: {
      "click"           : "show_messages"
    },

    show_messages: function(){
        var name = this.model.get("name");
        chan = Channels.get(name);
        chan.set("unread", 0);
        app_router.navigate("channels/" + name);
    },
    // The ChannelView listens for changes to its model, re-rendering. Since there's
    // a one-to-one correspondence between a **Channel** and a **ChannelView** in this
    // app, we set a direct reference on the model for convenience.
    initialize: function() {
      this.model.bind('change', this.render, this);
      this.model.bind('destroy', this.remove, this);
    },

    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },

    // Remove the item, destroy the model.
    clear: function() {
      this.model.clear();
    }

  });

  var ChannelMessagesView = Backbone.View.extend({
    tagName: "ul",
    className: "messages",
    template: _.template($('#channel-messages-template').html()),
    render: function(){
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },
    initialize: function() {
      this.model.bind('add', this.addOne, this);
      this.model.bind('reset', this.addAll, this);
      this.model.fetch();
      $("#messages").append(this.el);
    },
    addOne: function(message, that) {
      console.log("Rendering message " + message.get('msg'));
      var view = new MessageView({model: message});
      this.$el.append(view.render().el);
      //$("#messages-" + this.model.get("name")).append(view.render().el);
      var height = this.el.scrollHeight;
      this.$el.scrollTop(height);
    },
    addAll: function(messages) {
      messages.each(this.addOne, this);
    },

  });

  // Messages

  var Message  = Backbone.Model.extend({
    initialize: function() {
    }
  });

  var Messages = Backbone.Collection.extend({
    model: Message,
  });

  var MessageView = Backbone.View.extend({
    //... is a list tag.
    tagName:  "li",

    // Cache the template function for a single item.
    template: _.template($('#message-template').html()),

    // The DOM events specific to an item.

    initialize: function() {
      this.model.bind("reset", this.render, this);
      this.model.bind("add",   this.render, this);
      this.model.bind('change', this.render, this);

      this.model.bind('destroy', this.remove, this);
    },

    render: function() {
      //console.log("rendering..");
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },

    // Remove the item, destroy the model.
    clear: function() {
      this.model.clear();
    }
  });

  // The Application
  // ---------------

  // Our overall **AppView** is the top-level piece of UI.
  var AppView = Backbone.View.extend({

    // Instead of generating a new element, bind to the existing skeleton of
    // the App already present in the HTML.
    el: $("#webcatapp"),

    // Our template for the line of statistics at the bottom of the app.

    // At initialization we bind to the relevant events on the `Channels`
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting todos that might be saved in *jquery*.
    initialize: function() {
        Channels.bind('add', this.addOne, this);
        Channels.bind('reset', this.addAll, this);
        Channels.fetch();
    },

    render: function() {
    },

    // Add a single todo item to the list by creating a view for it, and
    // appending its element to the `<ul>`.
    addOne: function(channel) {
      var view = new ChannelView({model: channel});
      this.$("#channel_list").append(view.render().el);
    },

    // Add all items in the **Channels** collection at once.
    addAll: function() {
      Channels.each(this.addOne);
    }

  });

  // Finally, we kick things off by creating the **App**.
  var App = new AppView;

    var Workspace = Backbone.Router.extend({
        routes: {
            "channels/:channel":   "channel",    // #channels/foo
        },

        initialize: function() {
            this.views = {};
        },
        channel: function(name) {
            console.log("Route for " + name);
            chan = Channels.get(name);
            mview = this.views[name];
            if(!this.views[name]){
                var mview = new ChannelMessagesView({model: chan.messages, id: "messages-" + name});
                this.views[name]=mview;
            }
            chan.set("unread", 0);
            _.each(this.views, function(v) {
                if(v != mview){
                    v.$el.hide();
                }
            });
            $(".messages").hide()
            mview.$el.show();
            document.title=name + " - messages";
        },

    });
    var app_router = new Workspace;
    //FIXME - The above Workspace.channel is being called before channels are done loading.
    //        One way to fix this is to include the json channel list in the html page and call Channels.reset
    //        from there.  Need to return per-channel templates though, which makes sense anyway
    window.setTimeout(function () {
        Backbone.history.start({pushState: true});
    }, 1000);


    var ws = new WebSocket("ws://" + document.location.hostname + ":" + document.location.port + "/websocket");
    ws.onopen = function() {
        //
    };
    ws.onmessage = function (evt) {
        //console.log(evt.data);
        var data = JSON.parse(evt.data);
        if(data.channel){
            var name = data.channel;
            var c = Channels.get(name);
            if(!c){
                Channels.add({name:name});
                c = Channels.get(name);
                c.messages.fetch()
            } else {
                //console.log("adding ", data, " to ", c);
                c.messages.add(data);
            }
            c.set("unread", c.get("unread") + 1);
            //console.log(c);
        }        
    };
});
