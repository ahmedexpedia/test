define('cars.service.urgencyRetriever', ['jquery', 'cars.config', 'cars.util.logging'], function($, config, logging) {
    var urgencyPathShopping = '//urgency.expedia.com/urgencyservice/v1/getSearches?';
    var urgencyPathBooking = '//urgency.expedia.com/urgencyservice/v1/getBookings?';
    var clientId = 'maserati';

    function buildAjaxCallUrl(url, tla, duration) {
        return url +
            "tlaList=" + tla +
            "&productType=car" +
            "&duration=" + duration +
            "&clientId=" + clientId;
    }

    function callback(result) {
        console.log("test");
    }

    function performAjaxCall(url, promise) {
        var callbackFunctionName =  "urgencyRetrieverCallback" + Math.floor(Math.random()*1000001);

        window[callbackFunctionName] = function(result) {
            if (result.responseStatusCode === 0
                && result.productResponseList.productData.length > 0) {
                var count = parseInt(result.productResponseList.productData[0].count, 10);
                promise.resolve(count);
            }
            else {
                promise.reject();
            }
        };
        logging.logServiceTime("Urgency", promise);
        $.ajax({
            url: url,
            dataType: "jsonp",
            timeout : 3000,
            jsonpCallback: callbackFunctionName
        });
        return promise;
    }

    function getSearchDuration(highDemandLocation){
        if(highDemandLocation === '200SearchesCountIn24Hrs'){
            return '24h';
        } else if(highDemandLocation === '500SearchesCountIn48Hrs'){
            return '48h';
        }
    }

    var module = {};

    module.getUrgencyCount = function (tla, duration) {
        var url = buildAjaxCallUrl(urgencyPathShopping, tla, duration),
            promise = $.Deferred();

        return performAjaxCall(url, promise);
    };

    module.getUrgencyBookingCount = function (tla, duration) {
        var url = buildAjaxCallUrl(urgencyPathBooking, tla, duration),
            promise = $.Deferred();

        return performAjaxCall(url, promise);
    };

    module.loadUrgencyMessageCount = function(pickUpAirportCode)
    {
        var promise = $.Deferred();
        var popularAirportConfig = config.features.popularAirportMessage;

        if (popularAirportConfig && popularAirportConfig.isEnabled)
        {
            //Read abacus only for airport searches
            var highDemandLocation = config.get("abacus.carHighDemandLocation");
            var searchDuration = getSearchDuration(highDemandLocation);

            if(highDemandLocation === '200SearchesCountIn24Hrs' || highDemandLocation === '500SearchesCountIn48Hrs'){
                this.getUrgencyCount(pickUpAirportCode, searchDuration)
                        .then(function (count) {
                            promise.resolve({popularAirportUrgencyCount: count});
                        }, function(error){
                            promise.reject(error);
                        });
            } else if(highDemandLocation === '100BookingCountIn24Hrs') {
                this.getUrgencyBookingCount(pickUpAirportCode, '24h')
                        .then(function (count) {
                            promise.resolve({popularAirportUrgencyCount: count});
                        }, function(error){
                            promise.reject(error);
                        });
            } else {
                //For static list of airports we do not need to call Urgency Service
                promise.resolve();
            }
        } else {
            // if not airport or not enabled, resolve empty promise
            promise.resolve();
        }
        return promise;
    }

    return module;
})