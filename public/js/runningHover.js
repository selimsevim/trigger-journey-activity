define(['postmonger'], function (Postmonger) {
    'use strict';

    var connection = new Postmonger.Session();

    $(window).ready(onRender);
    connection.on('initActivityRunningHover', initialize);

    function onRender() {
        connection.trigger('ready');
    }

    function initialize(data) {
        var inArguments = data.arguments.execute.inArguments;
        var selectedJourneyName = inArguments.find(arg => arg.selectedJourneyName).selectedJourneyName;

        $('#selected-journey').text(`Triggering ${selectedJourneyName}`);

    }
});
