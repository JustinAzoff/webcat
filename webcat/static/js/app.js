// Load the application once the DOM is ready, using `jQuery.ready`:
$(function(){

  // Channel Model
  // ----------

  // Our basic **Channel** model has `name` and `unread` attributes
  var Channel = Backbone.Model.extend({

    // Default attributes for the todo item.
    defaults: function() {
      return {
        name: "unnamed?",
        unread: 0
      };
    },

    // Ensure that each Channel created has `name`.
    initialize: function() {
      if (!this.get("name")) {
        this.set({"name": this.defaults.name});
      }
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
        alert("clicked?");
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
        var c = new Channel({name: "test"});
        this.addOne(c);
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
      this.$("#channel-list").append(view.render().el);
    },

    // Add all items in the **Channels** collection at once.
    addAll: function() {
      Channels.each(this.addOne);
    },

  });

  // Finally, we kick things off by creating the **App**.
  var App = new AppView;

    var ws = new WebSocket("ws://localhost:8888/websocket");
    ws.onopen = function() {
        ws.send("Hello, world");
    };
    ws.onmessage = function (evt) {
        var data = JSON.parse(evt.data);
        if(data.channels){
            //Channels.create({name: "test"});
        }
    };

});
