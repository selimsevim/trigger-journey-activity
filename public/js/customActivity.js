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
        // Clear session storage at the start of each render
        sessionStorage.removeItem('journeys');
        sessionStorage.removeItem('selectedJourneyId');

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
        const storedJourneys = sessionStorage.getItem('journeys');
        const selectedJourneyId = sessionStorage.getItem('selectedJourneyId');

        if (storedJourneys) {
            journeys = JSON.parse(storedJourneys);
            populateJourneys(journeys, selectedJourneyId);
        } else {
            fetchJourneys();
        }
    }

    function save() {
        let selectedJourneyId = $('input[name="journey"]:checked').val();
        let selectedJourney = journeys.find(j => j.id === selectedJourneyId);
        console.log(selectedJourney);

        if (selectedJourney) {
            payload['arguments'].execute.inArguments = [
                {
                    contactKey: '{{Contact.Key}}',
                    journeyId: selectedJourney.id,
                    payload: schema
                }
            ];
            // Save the selected journey ID to session storage
            sessionStorage.setItem('selectedJourneyId', selectedJourney.id);
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
                            let apiEventKey = apiEventEmail.match(/APIEvent-([a-z0-9-]+)/)[0];
                            return apiEventKey !== currentApiEventKey;
                        }
                    }
                    return false;
                });

                if (journeys.length === 0) {
                    $('#loading-message').text('No journeys with API Event entry source was found.');
                } else {
                    const selectedJourneyId = sessionStorage.getItem('selectedJourneyId');
                    populateJourneys(journeys, selectedJourneyId);
                    $('#loading-message').hide();
                    $('#journey-checkboxes').show();
                    sessionStorage.setItem('journeys', JSON.stringify(journeys));
                }
            },
            error: function (xhr, status, error) {
                console.error('Error fetching journeys:', error);
                $('#loading-message').text('Error loading journeys. Please try again.');
            }
        });
    }

    function populateJourneys(journeys, selectedJourneyId = null) {
        let $checkboxGroup = $('#journey-checkboxes');
        $checkboxGroup.empty();
        $checkboxGroup.append('<label>Select Journeys to Monitor:</label>');

        journeys.forEach(function (journey) {
            let apiEventKey = journey.defaults.email.find(email => email.includes('APIEvent')).split('"')[1].split('.')[1];
            let $checkbox = $('<input>', {
                type: 'checkbox',
                name: 'journey',
                value: journey.id,
                'data-api-event-key': apiEventKey
            });

            // Check the checkbox if it matches the selected journey ID
            if (journey.id === selectedJourneyId) {
                $checkbox.prop('checked', true);
            }

            $checkboxGroup.append(
                $('<label>', {
                    text: journey.name
                }).prepend($checkbox)
            );
        });
    }
});
