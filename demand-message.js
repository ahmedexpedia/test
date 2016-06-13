/* global Ember, define, require, console */
/* jshint strict: true */

define('cars.components.demandMessage', ['jquery', 'cars.util.carsTitlePrefixClassifier', 'cars.common.analytics', 'cars.config'], 
    function ($, titleClassifier, analytics, carsConfig) {
    'use strict';

    var component = Ember.Component.extend({
        classNames: ['urgency-message'],
        config: {fadeInDuration: 700, displayDuration: 10000, fadeOutDuration: 700},
        minCountToShow: 2,

        "actions": {
            "closeMessage": function () {
                this.addTimerToFadeout();
            }
        },
        
        brandName: carsConfig.brandName,
        visallyHidden: false,

        setDemandMessageString: function () {

            Ember.run.later(this, function () {
                this.onFadeIn();
            }, this.config.fadeInDuration);

        }.on('init'),

        demandMessage: function() {            
            return loc._lookup('views_default_includes_cars_search_page-alerts.POPULAR_AIRPORT_MESSAGE_1');
        }.property(),

        onFadeIn: function () {
            Ember.set(this, 'makeNonTransparent', true);
            Ember.run.later(this, function () {
                this.addTimerToFadeout();
            }, this.config.displayDuration);
        },

        addTimerToFadeout: function () {
            Ember.set(this, 'makeNonTransparent', false);
            Ember.run.later(this, function () {
                Ember.set(this, 'visuallyHidden', true);
            }, this.config.fadeOutDuration);
        }
    });
    return component;
});

Ember.Application.initializer({
    name: 'cars.components.demandMessage',

    initialize: function (container, app) {
        require('cars.components.demandMessage', function (component) {
            app.DemandMessageComponent = component;
        });
    }
});