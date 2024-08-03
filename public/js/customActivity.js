define(['postmonger'], function (Postmonger) {
    'use strict';

    var connection = new Postmonger.Session();
    var payload = {};
    var schema = {};
    var journeys = [];
    var currentApiEventKey = null;
    var entrySourceData = [];
    var apiEventKeyMap = {}; // Map to store apiEventKey for each journey

    $(window).ready(onRender);
    connection.on('initActivity', initialize);
    connection.on('clickedNext', save);
    connection.on('initActivityRunningModal', initializeRunningModal); // Add this line to handle the running modal

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
        connection.on('requestedSchema', function (data) {
            schema = data['schema'];
            entrySourceData = addEntrySourceAttributesToInArguments(schema);
        });

        var hasInArguments = Boolean(
            payload.arguments &&
            payload.arguments.execute &&
            payload.arguments.execute.inArguments &&
            payload.arguments.execute.inArguments.length > 0
        );

        var inArguments = hasInArguments ? payload.arguments.execute.inArguments : [];

        var selectedJourneyId = null;
        if (inArguments.length > 0) {
            selectedJourneyId = inArguments[0].selectedJourneyId;
        }

        fetchJourneys(selectedJourneyId);
    }

    function save() {
        var selectedJourneyId = $('input[name="journey"]:checked').val();
        var selectedApiEventKey = apiEventKeyMap[selectedJourneyId]; // Retrieve the apiEventKey from the map

        payload.arguments.execute.inArguments = [
            {
                contactKey: '{{Contact.Key}}',
                selectedJourneyAPIEventKey: selectedApiEventKey || null,
                selectedJourneyName: $('input[name="journey"]:checked').siblings('label').text(), // Save the journey name
                payload: entrySourceData
            }
        ];

        payload.metaData.isConfigured = true;
        connection.trigger('updateActivity', payload);
    }

    function fetchJourneys(selectedJourneyId = null) {
        $.ajax({
            url: '/journeys',
            type: 'GET',
            beforeSend: function() {
                $('#loading-message').show();
                $('#journey-radios').hide();
            },
            success: function (response) {
                journeys = response.items.filter(journey => {
                    if (journey.defaults && journey.defaults.email) {
                        let apiEventEmail = journey.defaults.email.find(email => email.includes('APIEvent'));
                        if (apiEventEmail) {
                            let apiEventKey = apiEventEmail.match(/APIEvent-([a-z0-9-]+)/)[0];
                            apiEventKeyMap[journey.id] = apiEventKey; // Store the apiEventKey in the map
                            return apiEventKey !== currentApiEventKey;
                        }
                    }
                    return false;
                });

                if (journeys.length === 0) {
                    $('#loading-message').text('No journeys with API Event entry source were found.');
                } else {
                    populateJourneys(journeys, selectedJourneyId);
                    $('#loading-message').hide();
                    $('#journey-radios').show();
                }
            },
            error: function (xhr, status, error) {
                console.error('Error fetching journeys:', error);
                $('#loading-message').text('Error loading journeys. Please try again.');
            }
        });
    }

    function populateJourneys(journeys, selectedJourneyId = null) {
        var $radioGroup = $('#journey-radios');
        $radioGroup.empty();

        journeys.forEach(function (journey) {
            var apiEventKey = apiEventKeyMap[journey.id];
            var $radio = $('<input>', {
                type: 'radio',
                name: 'journey',
                value: journey.id,
                'data-api-event-key': apiEventKey // Add apiEventKey as a data attribute
            });

            if (journey.id === selectedJourneyId) {
                $radio.prop('checked', true);
            }

            $radioGroup.append(
                $('<label>', {
                    text: journey.name
                }).prepend($radio)
            );
        });
    }

    function addEntrySourceAttributesToInArguments(schema) {
        var data = {};
        for (var i = 0; i < schema.length; i++) {
            let attr = schema[i].key;
            let keyIndex = attr.lastIndexOf('.') + 1;
            data[attr.substring(keyIndex)] = `{{${attr}}}`;
        }
        return data;
    }

    // Function to handle the running modal
    function initializeRunningModal(data) {
        if (data) {
            payload = data;
        }

        var inArguments = payload.arguments.execute.inArguments;
        var selectedJourneyName = inArguments.find(arg => arg.selectedJourneyName).selectedJourneyName;

        $('#selected-journey').text(selectedJourneyName || 'No journey selected');
    }
});
