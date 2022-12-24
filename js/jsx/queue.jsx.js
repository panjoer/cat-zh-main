/* global

    $r,
    WQueue: writable,
    game
*/

WQueue = React.createClass({

    getInitialState: function(){
        return {
            typeId: "buildings",
            itemId: null,
            itemLabel: null,
            game: this.props.game
        };
    },

    componentDidMount: function(){
        var self = this;

        //TODO: uncomment and change all game references to this.state.game if you want to update it dynamically

        this.onUpdateHandler = dojo.subscribe("ui/update", function(game){
            self.setState({game: game});
        });
    },

    getQueueTypeSelect: function(){
        var options = [];
        var self = this;
        var queueSources = game.time.queue.queueSourcesArr;
        /*for (var i in queueSources){
            if(queueSources[i]){
                options.push($r("option", { value: i}, i));
            }
        }*/
        for (var i in queueSources){
                options.push($r("option", { value: queueSources[i]}, queueSources[i]));
        }
        return $r("select", {
            value: this.state.queueTypeId,
            onChange: function(e){
                var typeId = e.target.value;

                self.setState({
                    typeId: typeId
                });
                var options = game.time.queue.getQueueOptions(typeId);
                if (options.length){
                    self.setState({
                        //itemId: options[0].name,
                        itemId: 0,
                        itemLabel: options[0].label
                    });
                }

            }
        }, options);
    },

    getQueueItemSelect: function(options){
        var self = this;
        var selectOpts = [];

        for (var i in options){
            var option = options[i];
            console.log()
            //selectOpts.push($r("option", { value: option.name, "data-label": option.label}, option.label));
            selectOpts.push($r("option", { value: i, "data-label": option.label}, option.label));
        }

        if (!options.length){
            selectOpts.push($r("option", {}, "-"));
        }

        return $r("select", {
            value: this.state.itemId,
            onChange: function(e){
                self.setState({
                    itemId: e.target.value,
                    //itemLabel: e.target.dataset.label
                    //itemId: options[e.target.value].name,
                    itemLabel: options[e.target.value].label
                });
            }
        }, selectOpts);
    },

    getQueueItems: function(){
        var self = this;
        var items = [];

        var queueItems = self.state.game.time.queue.queueItems;
        for (var i in queueItems){
            var item = queueItems[i];
            buttons = [];
            if (item.value){
                buttons = [
                    $r("a", {
                        href: "#",
                        onClick: dojo.hitch(game.time.queue, game.time.queue.remove, item.type, item.name, i, false),
                        //onClick: dojo.hitch(game.time.queue, game.time.queue.remove, item.type, item.name, i),
                    }, "[-]"),
                    $r("a", {
                        href: "#",
                        onClick: dojo.hitch(game.time.queue, game.time.queue.remove, item.type, item.name, i, item.value),
                        //onClick: dojo.hitch(game.time.queue, game.time.queue.remove, item.type, item.name, i),
                    }, "[x]")
                ]
            }else{
                buttons = [
                    $r("a", {
                        href: "#",
                        onClick: dojo.hitch(game.time.queue, game.time.queue.remove, item.type, item.name, i, false),
                        //onClick: dojo.hitch(game.time.queue, game.time.queue.remove, item.type, item.name, i),
                    }, "[x]")
                ]
            }
            items.push($r("div", {}, [
                "[" + item.type + "][" + item.name + "] - " + item.label + ((item.value)? " " + item.value: "")
            ].concat(buttons)
            ));
        }
        return $r("div", {},
            items
        );
    },

    render: function(){
        var self = this;

        var typeId = this.state.typeId;
        var options = game.time.queue.getQueueOptions(typeId);

        return $r("div", {
        }, [
            this.getQueueTypeSelect(),
            this.getQueueItemSelect(options),
            $r("button", {
                onClick: function(e){
                    if(self.state.itemId){
                        game.time.queue.addToQueue(
                            //self.state.itemId,
                            options[self.state.itemId].name,
                            self.state.typeId,
                            self.state.itemLabel,
                            e.shiftKey
                        );
                    }else if(options.length){
                        game.time.queue.addToQueue(
                            options[0].name,
                            self.state.typeId,
                            options[0].label,
                            e.shiftKey
                        );
                    }

                    //re-render component
                    self.forceUpdate();
                }
            }, "加入队列"),

            this.getQueueItems()
        ]);
    }
});