/*global window*/
define(["jquery", "marionette", "hbars!template/WidgetPreview"],
    function ($, Marionette, WidgetPreview) {
        "use strict";

        var ENRICHED_MAX_LENGTH = 255;

        /**
         * Preview pane view with widget iframe and URL display.
         *
         * @author Bo Gotthardt
         */
        return Marionette.ItemView.extend({
            template: WidgetPreview,
            ui: {
                newWindow: "#newwindow",
                refresh: "#refresh",
                url: "#url",
                lengthWarning: "#warning-length",
                iframe: "#preview-frame"
            },
            events: {
                "click .select-on-click": function (e) {
                    $(e.currentTarget).select();
                },
                "click #refresh": "onRefreshButtonClick"
            },
            onRender: function () {
                this.listenTo(this.model, "change", this.onUrlChange);
                this.ui.iframe.prop("src", this.model.get("baseUrl"));
            },

            onUrlChange: function () {
                var url = this.model.get("url");

                this.ui.newWindow.prop("href", url);
                this.ui.url.val(url);
                this.ui.lengthWarning.toggle(url.length > ENRICHED_MAX_LENGTH);

                var parameters = this.model.get("parameters");
                this.sendMessage({
                    widgetCommand: "parameters",
                    parameters: parameters
                });
            },

            onRefreshButtonClick: function () {
                this.sendMessage({
                    widgetCommand: "activate"
                });
            },

            sendMessage: function (data) {
                this.ui.iframe[0].contentWindow.postMessage(JSON.stringify(data), "*");
            }
        });
    });