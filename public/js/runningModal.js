define(['postmonger'], function (Postmonger) {
    'use strict';

    var connection = new Postmonger.Session();

    $(window).ready(onRender);
    connection.on('initActivityRunningModal', initialize);

    function onRender() {
        connection.trigger('ready');
    }

    function initialize(data) {
        var inArguments = data.arguments.execute.inArguments;
        var selectedJourneyName = inArguments.find(arg => arg.selectedJourneyName).selectedJourneyName;
        var executionResults = inArguments.find(arg => arg.executionResults).executionResults || [];

        $('#selected-journey').text(selectedJourneyName || 'No journey selected');

        var resultsTable = '<table><thead><tr><th>Contact Key</th><th>Status</th><th>Error Log</th></tr></thead><tbody>';

        executionResults.forEach(result => {
            resultsTable += `<tr><td>${result.contactKey}</td><td>${result.status}</td><td>${result.errorLog}</td></tr>`;
        });

        resultsTable += '</tbody></table>';
        $('#selected-journey').append(resultsTable);
    }
});
