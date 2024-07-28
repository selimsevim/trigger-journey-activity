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
        fetchJourneys();
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
       
    }

    function save() {
        let selectedJourneys = $('input[name="journey"]:checked').map(function () {
            return $(this).val();
        }).get();

        payload['arguments'].execute.inArguments = [
            {
                SAMPLE_PARAM: "SAMPLE PARAM DATA FROM CONFIG.JSON",
                journeyIds: selectedJourneys
            }
        ];
        payload['metaData'].isConfigured = true;
        connection.trigger('updateActivity', payload);
    }

    function fetchJourneys() {
        $.ajax({
            url: '/journeys',
            type: 'GET',
            success: function (response) {
                populateJourneys(response.items);
            },
            error: function (xhr, status, error) {
                console.error('Error fetching journeys:', error);
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
