define(['postmonger'], function (Postmonger) {
    'use strict';

    let connection = new Postmonger.Session();
    let payload = {};

    $(window).ready(onRender);
    connection.on('initActivity', initialize);
    connection.on('clickedNext', save);

    function onRender() {
        connection.trigger('ready');
        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');
    }

    connection.trigger('requestTriggerEventDefinition');
    connection.on('requestedTriggerEventDefinition', function (eventDefinitionModel) {
        if (eventDefinitionModel) {
            console.log('Event Definition Key:', eventDefinitionModel.eventDefinitionKey);
        }
    });

    function initialize(data) {
        if (data) {
            payload = data;
        }
        fetchJourneys();
    }

    function save() {
        let selectedJourneys = $('input[name="journey"]:checked').map(function () {
            return $(this).val();
        }).get();

        var hasInArguments = Boolean(
            payload["arguments"] &&
            payload["arguments"].execute &&
            payload["arguments"].execute.inArguments &&
            payload["arguments"].execute.inArguments.length > 0
        );

        var inArguments = hasInArguments
            ? payload["arguments"].execute.inArguments
            : [];

        inArguments.push({
            SAMPLE_PARAM: "SAMPLE PARAM DATA FROM CONFIG.JSON"
        });
        inArguments.push({
            journeyIds: selectedJourneys
        });

        payload["arguments"].execute.inArguments = inArguments;
        payload['metaData'].isConfigured = true;
        connection.trigger('updateActivity', payload);
    }

    function fetchJourneys() {
        $.ajax({
            url: '/journeys',
            type: 'GET',
            beforeSend: function() {
                $('#loading-message').show();
                $('#journey-checkboxes').hide();
            },
            success: function (response) {
                populateJourneys(response.items);
                $('#loading-message').hide();
                $('#journey-checkboxes').show();
            },
            error: function (xhr, status, error) {
                console.error('Error fetching journeys:', error);
                $('#loading-message').text('Error loading journeys. Please try again.');
            }
        });
    }

    function populateJourneys(journeys) {
        let $checkboxGroup = $('#journey-checkboxes');
        $checkboxGroup.empty();
        $checkboxGroup.append('<label>Select Journeys to Monitor:</label>');

        journeys.forEach(function (journey) {
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
    }
});
