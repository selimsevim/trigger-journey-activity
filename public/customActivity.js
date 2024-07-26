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
            var $checkboxGroup = $('#journey-checkboxes');
            $checkboxGroup.empty();
            $checkboxGroup.append('<label>Select Journeys to Monitor:</label>');

            journeys.forEach(function(journey) {
                $checkboxGroup.append(
                    $('<label>', {
                        text: journey.name
                    }).prepend(
                        $('<input>', {
                            type: 'checkbox',
                            name: 'journey',
                            value: journey.id
                        })
                    )
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
        var selectedJourneys = $('input[name="journey"]:checked').map(function() {
            return $(this).val();
        }).get();

        payload.arguments = payload.arguments || {};
        payload.arguments.execute = payload.arguments.execute || {};
        payload.arguments.execute.inArguments = [{ journeyIds: selectedJourneys }];

        payload.metaData = payload.metaData || {};
        payload.metaData.isConfigured = true;

        connection.trigger('updateActivity', payload);
    }
});
