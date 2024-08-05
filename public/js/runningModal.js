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
        var uuid = inArguments.find(arg => arg.uuid).uuid;

        fetch(`/activity/${uuid}`)
            .then(response => response.json())
            .then(activityData => {
                populateTable(activityData);
            })
            .catch(error => console.error('Error fetching activity data:', error));
    }

    function populateTable(activityData) {
        var tableHtml = `
            <table>
                <thead>
                    <tr>
                        <th>ContactKey</th>
                        <th>TriggerDate</th>
                        <th>Status</th>
                        <th>Error Log</th>
                    </tr>
                </thead>
                <tbody>
                    <tr>
                        <td>${activityData.contactKey}</td>
                        <td>${new Date(activityData.triggerDate).toLocaleDateString()}</td>
                        <td>${activityData.status}</td>
                        <td>${activityData.errorLog || ''}</td>
                    </tr>
                </tbody>
            </table>
        `;
        $('#activity-data').html(tableHtml);
    }
});
