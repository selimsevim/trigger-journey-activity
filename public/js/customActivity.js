define(['postmonger'], function(Postmonger) {
    'use strict';

    var connection = new Postmonger.Session();
    var payload = {};

    $(window).ready(onRender);

    connection.on('initActivity', initialize);
    connection.on('clickedNext', onClickedNext);

    function onRender() {
        connection.trigger('ready');
        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');

        $.get('/journeys', function(data) {
            var journeys = data.items || [];
            var $select = $('#journey-select');
            $select.empty();

            journeys.forEach(function(journey) {
                $select.append(
                    $('<option>', {
                        value: journey.id,
                        text: journey.name
                    })
                );
            });
        });
    }

    function initialize(data) {
        if (data) {
            payload = data;
        }
    }

    function onClickedNext() {
        var selectedJourney = $('#journey-select').val();
        payload.arguments = payload.arguments || {};
        payload.arguments.execute = payload.arguments.execute || {};
        payload.arguments.execute.inArguments = [{ journeyId: selectedJourney }];

        payload.metaData = payload.metaData || {};
        payload.metaData.isConfigured = true;

        connection.trigger('updateActivity', payload);
    }
});
