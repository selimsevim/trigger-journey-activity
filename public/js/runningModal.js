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
        var selectedJourneyName = data.arguments.execute.inArguments.find(arg => arg.selectedJourneyName).selectedJourneyName;

        $('#selected-journey').text(selectedJourneyName || 'No journey selected');

        fetchResults(activityInstanceId);
    }

    function fetchResults(activityInstanceId) {
        $.ajax({
            url: '/getExecutionResults', // Use relative URL if hosted on the same server
            type: 'GET',
            data: { activityInstanceId: activityInstanceId },
            timeout: 10000, // 10 seconds timeout for AJAX request
            success: function(response) {
                displayResults(response.results);
            },
            error: function(xhr, status, error) {
                console.error('Error fetching results:', error);
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
});
