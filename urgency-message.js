/* global Ember, define, require, console */
/* jshint strict: true */

define('cars.components.urgencyMessage', ['jquery', 'cars.service.urgencyRetriever', 'cars.util.carsTitlePrefixClassifier', 'cars.common.analytics', 'cars.config'], 
    function ($, urgencyRetriever, titleClassifier, analytics, carsConfig) {
    'use strict';

    var component = Ember.Component.extend({
        classNames: ['urgency-message'],
        config: {fadeInDuration: 700, displayDuration: 5000, fadeOutDuration: 700},
        minCountToShow: 2,

        "actions": {
            "closeMessage": function () {
                this.addTimerToFadeout();
            }
        },
        
        brandName: carsConfig.brandName,

        visallyHidden: false,

        setUrgencyCount: function () {
            var isAirportSearch = this.get('regions.pickup.isAirport'),
                tla = this.get('regions.pickup.preferredAirportCode'),
                self = this;

            if (isAirportSearch) {                 
                return urgencyRetriever.getUrgencyBookingCount(tla, this.get('bookingDuration'))
                    .then(function (count) {
                        Ember.set(self, 'urgencyCount', count);
                        //Ember.set(self, 'showUrgencyMessage', true);
                    });
            }
        }.on('init'),

        region: function () {
            return titleClassifier.truncateTitleRegionName(this.get("regions.pickup.shortName"));
        }.property('regions'),

        showUrgencyMessage: function () {          
            var count = this.get('urgencyCount');
            if (count && count >= this.minCountToShow) {
                analytics.trackImpression("CAR.SR.UrgencyMessageShown");
                return true;
            }
            return false;
        }.property('urgencyCount'),

        bookingDuration: '48h',

        urgencyMessage: function() {
            return loc._lookup('views_default_pages_cars_search_list-view.48hrs_booking_urgency_message', { urgencyCount : this.get("urgencyCount"),
                region : this.get("region"), brandName : this.get("brandName")});
        }.property("urgencyCount", "region"),

        addTimeout: function () {
            var urgencyFlag = this.get('showUrgencyMessage');
            if (urgencyFlag) {
                Ember.run.later(this, function () {
                    this.onFadeIn();
                }, this.config.fadeInDuration);
            }
        }.observes('showUrgencyMessage'),

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
    name: 'cars.components.urgencyMessage',

    initialize: function (container, app) {
        require('cars.components.urgencyMessage', function (component) {
            app.UrgencyMessageComponent = component;
        });
    }
});