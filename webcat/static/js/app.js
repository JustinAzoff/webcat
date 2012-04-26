// Load the application once the DOM is ready, using `jQuery.ready`:
$(function(){

  // Channel Model
  // ----------

  // Our basic **Channel** model has `name` and `unread` attributes
  var Channel = Backbone.Model.extend({
    urlRoot: '/channel',

    // Default attributes for the todo item.
    defaults: function() {
      return {
        name: "unnamed?",
        unread: "0"
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
        $("#messages").html("");
        console.log("Loading messages for " + this.model.get("name"));
        this.model.messages.bind('add', this.addOne, this);
        this.model.messages.bind('reset', this.addAll, this);
        this.model.messages.fetch();
    },
    addOne: function(message) {
      console.log("Added..");
      console.log(message);
      var view = new MessageView({model: message});
      $("#messages").append(view.render().el);
    },
    addAll: function(messages) {
      messages.each(this.addOne);
    },

    // The ChannelView listens for changes to its model, re-rendering. Since there's
    // a one-to-one correspondence between a **Channel** and a **ChannelView** in this
    // app, we set a direct reference on the model for convenience.
    initialize: function() {
      this.model.bind('change', this.render, this);
      this.model.bind('destroy', this.remove, this);
    },

    // Re-render the titles of the todo item.
    render: function() {
      this.$el.html(this.template(this.model.toJSON()));
      return this;
    },

    // Remove the item, destroy the model.
    clear: function() {
      this.model.clear();
    }

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

    // Re-render the titles of the todo item.
    render: function() {
      console.log("rendering..");
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

    // Delegated events for creating new items, and clearing completed ones.
    //events: {
    //  "keypress #new-todo":  "createOnEnter",
    //  "click #clear-completed": "clearCompleted",
    //  "click #toggle-all": "toggleAllComplete"
    //},

    // At initialization we bind to the relevant events on the `Channels`
    // collection, when items are added or changed. Kick things off by
    // loading any preexisting todos that might be saved in *jquery*.
    initialize: function() {
        Channels.bind('add', this.addOne, this);
        Channels.bind('reset', this.addAll, this);
        Channels.fetch();

        //Messages.add([{"msg": "hi", "time": "now!"}]);
    },

    // Re-rendering the App just means refreshing the statistics -- the rest
    // of the app doesn't change.
    render: function() {
      //  this.main.show();
      //  this.footer.show();
      //  this.footer.html(this.statsTemplate({done: done, remaining: remaining}));
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

    var ws = new WebSocket("ws://localhost:8888/websocket");
    ws.onopen = function() {
        ws.send("Hello, world");
    };
    ws.onmessage = function (evt) {
        console.log(evt.data);
        var data = JSON.parse(evt.data);
        if(data.channel){
            var name = data.channel;
            var c = Channels.get(name);
            if(!c){
                Channels.add({name:name});
                c = Channels.get(name);
            }
            c.messages.fetch()
            c.messages.add(data);
        }        
    };

});
