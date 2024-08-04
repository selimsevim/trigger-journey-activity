define(['postmonger'], function (Postmonger) {
    'use strict';

    var connection = new Postmonger.Session();

    $(window).ready(onRender);
    connection.on('initActivityRunningModal', initialize);

    function onRender() {
        connection.trigger('ready');
    }

    function initialize(data) {
        var activityInstanceId = data.definitionInstanceId || data.activityInstanceId;
        console.log(activityInstanceId);
        var selectedJourneyName = data.arguments.execute.inArguments.find(arg => arg.selectedJourneyName).selectedJourneyName;

        $('#selected-journey').text(selectedJourneyName || 'No journey selected');

        fetchResults(activityInstanceId);
        fetchActivityInstanceData(activityInstanceId);
    }

    function fetchResults(activityInstanceId) {
        $.ajax({
            url: '/getExecutionResults', // Use relative URL if hosted on the same server
            type: 'GET',
            data: { activityInstanceId: activityInstanceId },
            success: function(response) {
                displayResults(response.results);
            },
            error: function(xhr, status, error) {
                console.error('Error fetching results:', error);
            }
        });
    }

    function fetchActivityInstanceData(activityInstanceId) {
        $.ajax({
            url: '/getActivityInstanceId', // Use relative URL if hosted on the same server
            type: 'GET',
            data: { activityInstanceId: activityInstanceId },
            success: function(response) {
                displayActivityInstanceData(response.payload);
            },
            error: function(xhr, status, error) {
                console.error('Error fetching activity instance data:', error);
            }
        });
    }

    function displayResults(results) {
        var $resultsTable = $('<table>').append(
            $('<tr>').append(
                $('<th>').text('Contact Key'),
                $('<th>').text('Status'),
                $('<th>').text('Error Log')
            )
        );

        results.forEach(function(result) {
            $resultsTable.append(
                $('<tr>').append(
                    $('<td>').text(result.contactKey),
                    $('<td>').text(result.status),
                    $('<td>').text(result.errorLog)
                )
            );
        });

        $('#selected-journey').after($resultsTable);
    }

    function displayActivityInstanceData(payload) {
        if (payload) {
            var selectedJourneyName = payload.inArguments.find(arg => arg.selectedJourneyName).selectedJourneyName;
            $('#selected-journey').text(selectedJourneyName || 'No journey selected');
        }
    }
});
