define(['postmonger'], function (Postmonger) {
    'use strict';

    let connection = new Postmonger.Session();
    let payload = {};
    let schema = {};
    let journeys = [];
    let currentApiEventKey = null;

    $(window).ready(onRender);
    connection.on('initActivity', initialize);
    connection.on('clickedNext', save);
    connection.on('requestedSchema', function(data) {
        schema = data['schema'];
        console.log('Schema:', schema);
    });

    function onRender() {
        connection.trigger('ready');
        connection.trigger('requestTokens');
        connection.trigger('requestEndpoints');
    }

    connection.trigger('requestTriggerEventDefinition');
    connection.on('requestedTriggerEventDefinition', function (eventDefinitionModel) {
        if (eventDefinitionModel) {
            currentApiEventKey = eventDefinitionModel.eventDefinitionKey;
        }
    });

    function initialize(data) {
        if (data) {
            payload = data;
        }
        connection.trigger('requestSchema');
        fetchJourneys();
    }

    function save() {
        let selectedJourneyId = $('input[name="journey"]:checked').val();
        let selectedJourney = journeys.find(j => j.id === selectedJourneyId);

        if (selectedJourney) {
            triggerJourney(selectedJourney);
        }

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
                journeys = response.items.filter(journey => {
                    if (journey.defaults && journey.defaults.email) {
                        let apiEventEmail = journey.defaults.email.find(email => email.includes('APIEvent'));
                        if (apiEventEmail) {
                            let apiEventKey = apiEventEmail.split('"')[1].split('.')[1];
                            console.log(apiEventKey);
                            console.log(currentApiEventKey);
                            return apiEventKey !== currentApiEventKey;
                        }
                    }
                    return false;
                });

                if (journeys.length === 0) {
                    $('#loading-message').text('No journeys with API Event entry source found');
                } else {
                    populateJourneys(journeys);
                    $('#loading-message').hide();
                    $('#journey-checkboxes').show();
                }
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
            let apiEventKey = journey.defaults.email.find(email => email.includes('APIEvent')).split('"')[1].split('.')[1];
            $checkboxGroup.append(
                $('<label>', {
                    text: journey.name
                }).prepend(
                    $('<input>', {
                        type: 'checkbox',
                        name: 'journey',
                        value: journey.id,
                        'data-api-event-key': apiEventKey
                    })
                )
            );
        });
    }

    function triggerJourney(journey) {
        let apiEventKey = $('input[name="journey"]:checked').data('api-event-key');
        let eventData = {};

        schema.forEach(field => {
            eventData[field.key] = `{{${field.key}}}`;
        });

        $.ajax({
            url: '/trigger-journey',
            type: 'POST',
            contentType: 'application/json',
            data: JSON.stringify({
                ContactKey: payload['arguments'].execute.inArguments[0].ContactKey,
                EventDefinitionKey: apiEventKey,
                Data: eventData
            }),
            success: function (response) {
                console.log('Journey triggered successfully:', response);
            },
            error: function (xhr, status, error) {
                console.error('Error triggering journey:', error);
            }
        });
    }
});
