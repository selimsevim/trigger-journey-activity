define(['postmonger'], function (Postmonger) {
    'use strict';

    var connection = new Postmonger.Session();

    $(window).ready(onRender);
    connection.on('initActivityRunningModal', initialize);

    function onRender() {
        connection.trigger('ready');
    }

    function initialize(data) {
        var activityInstanceId = data.activityInstanceId;
        var selectedJourneyName = data.arguments.execute.inArguments.find(arg => arg.selectedJourneyName).selectedJourneyName;

        $('#selected-journey').text(selectedJourneyName || 'No journey selected');

        fetchResults(activityInstanceId);
    }

    function fetchResults(activityInstanceId) {
        $.ajax({
            url: '/getExecutionResults',
            type: 'GET',
            data: { activityInstanceId: activityInstanceId },
            success: function(response) {
                displayResults(response.results);
            },
            error: function(xhr, status, error) {
                console.error('Error fetching results:', error);
                $('#selected-journey').append('<p>Error loading results. Please try again.</p>');
            }
        });
    }

    function displayResults(results) {
        var resultsTable = '<table><thead><tr><th>Contact Key</th><th>Status</th><th>Error Log</th></tr></thead><tbody>';

        results.forEach(result => {
            resultsTable += `<tr><td>${result.contactKey}</td><td>${result.status}</td><td>${result.errorLog}</td></tr>`;
        });

        resultsTable += '</tbody></table>';
        $('#selected-journey').append(resultsTable);
    }
});
