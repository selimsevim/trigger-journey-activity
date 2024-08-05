define(['postmonger'], function (Postmonger) {
    'use strict';

    var connection = new Postmonger.Session();
    var payload = {};
    var schema = {};
    var journeys = [];
    var currentApiEventKey = null;
    var entrySourceData = [];
    var apiEventKeyMap = {}; // Map to store apiEventKey for each journey
    var uniqueId = null; // Declare the uniqueId variable

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
            currentApiEventKey = eventDefinitionModel.eventDefinitionKey;
        }
    });

    function initialize(data) {
        if (data) {
            payload = data;
        }

        // Check if the uuid already exists in the payload
        if (payload.arguments && payload.arguments.execute && payload.arguments.execute.inArguments) {
            var inArguments = payload.arguments.execute.inArguments[0];
            if (inArguments.uuid) {
                uniqueId = inArguments.uuid;
            } else {
                uniqueId = UUIDjs.create().toString(); // Generate a new unique identifier
            }
        } else {
            uniqueId = UUIDjs.create().toString(); // Generate a new unique identifier
        }

        console.log('UUID:', uniqueId);

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
        var selectedJourneyName = $('input[name="journey"]:checked').closest('label').text().trim();
        
        payload.arguments.execute.inArguments = [
            {
                contactKey: '{{Contact.Key}}',
                selectedJourneyId: selectedJourneyId || null,
                selectedJourneyAPIEventKey: selectedApiEventKey || null,
                selectedJourneyName: selectedJourneyName || 'No journey selected',
                payload: entrySourceData,
                uuid: uniqueId // Use the existing or new unique identifier
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
                console.log('Pre-selecting journey:', journey.name);
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
});
