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
        var activityInstanceId = inArguments.activityInstanceId;
        console.log(activityInstanceId);
        var activityInstanceId2 = inArguments.find(arg => arg.activityInstanceId).activityInstanceId;
        console.log(activityInstanceId2);

        $('#selected-journey').text(selectedJourneyName || 'No journey selected');
    }
});
