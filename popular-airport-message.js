define('cars.components.popularAirportMessage', ['jquery', 'cars.config', 'cars.service.urgencyRetriever', 'cars.common.analytics', 'cars.util.carsTitlePrefixClassifier', 'uitk'],
        function($, carsConfig, urgencyRetriever, analytics, titleClassifier, uitk) {

    var component = Ember.Component.extend({
        classNames: ['popular-airport-message'],

        abacusHighDemandLocation: function() {
            //Read abacus only for airport searches            
            if (this.get("isPopulerAirportMessageEnabled"))
            {
                return carsConfig.get("abacus.carHighDemandLocation");
            }
        }.property("isPopulerAirportMessageEnabled"),

        shouldShowPopularAirportMessage: function()
        {            
            if (this.get("isPopulerAirportMessageEnabled"))
            {
                var searchCount = this.get("minimumSearchCount");

                //searchCount will be 0 in case of control(static list)
                if(searchCount == 0) {
                    var popularAirportConfig = carsConfig.features.popularAirportMessage;
                    var pickUpAirportCode = this.get("regions.pickup.preferredAirportCode");
                    if($.inArray(pickUpAirportCode, popularAirportConfig.popularAirportCodes) >= 0) {
                        analytics.trackImpression("CAR.SR.DynamicDemandMessageShown");
                        return true;
                    }
                }
                else if(this.get('popularAirportUrgencyCount') >= searchCount) {
                    analytics.trackImpression("CAR.SR.DynamicDemandMessageShown");
                    return true;
                }
            }

            return false;
        }.property("isPopulerAirportMessageEnabled","minimumSearchCount","regions.pickup"),

        minimumSearchCount : function(){
            var highDemandLocationValue = this.get("abacusHighDemandLocation");

            if(highDemandLocationValue === '200SearchesCountIn24Hrs'){
                return 200;
            } else if(highDemandLocationValue === '500SearchesCountIn48Hrs'){
                return 500;
            } else if(highDemandLocationValue === '100BookingCountIn24Hrs'){
                return 100;
            } else {
                return 0; //For control return 0
            }
        }.property("abacusHighDemandLocation"),

        isPopulerAirportMessageEnabled: function() {
            var popularAirportConfig = carsConfig.features.popularAirportMessage;
            return popularAirportConfig && popularAirportConfig.isEnabled && this.get("regions.pickup.isAirport") === true;
        }.property("regions.pickup"),

        shortPickUpRegionName : function() {
            return  titleClassifier.truncateTitleRegionName(this.get("regions.pickup.shortName"));
        }.property("regions.pickup")
       
    });
    return component;
});

Ember.Application.initializer({
    name: 'cars.components.popularAirportMessage',

    initialize: function(container, app) {
        require('cars.components.popularAirportMessage', function(component) {
            app.PopularAirportMessageComponent = component;
        });
    }
});
