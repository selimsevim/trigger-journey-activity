define(['postmonger'], function (Postmonger) {
    'use strict';

    var connection = new Postmonger.Session();
    var payload = {};
    var schema = {};
    var journeys = [];
    var currentApiEventKey = null;

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

        connection.trigger('requestSchema');
        connection.on('requestedSchema', function (data) {

    // add entry source attributes as inArgs
        const schema = data['schema'];

    for (var i = 0, l = schema.length; i < l; i++) {
        var inArg = {};
        let attr = schema[i].key;
        let keyIndex = attr.lastIndexOf('.') + 1;
        inArg[attr.substring(keyIndex)] = '{{' + attr + '}}';
        payload['arguments'].execute.inArguments.push(inArg);
    }
  });

  const argArr = payload['arguments'].execute.inArguments;

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
            schema = inArguments[0].schema || {};
        }

        fetchJourneys(selectedJourneyId);
    }

    function save() {
        var selectedJourneyId = $('input[name="journey"]:checked').val();



        payload.arguments.execute.inArguments = [
            {
                contactKey: '{{Contact.Key}}',
                selectedJourneyId: selectedJourneyId || null,
                payload: argArr
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
            var apiEventKey = journey.defaults.email.find(email => email.includes('APIEvent')).match(/APIEvent-([a-z0-9-]+)/)[0];
            var $radio = $('<input>', {
                type: 'radio',
                name: 'journey',
                value: journey.id,
                'data-api-event-key': apiEventKey
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
});
