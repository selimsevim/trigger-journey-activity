'use strict';
const axios = require("axios");
const util = require('util');

// Global Variables
const tokenURL = `${process.env.authenticationUrl}/v2/token`;

// Log function for demonstration purposes
function logData(req) {
    console.log(util.inspect(req.body, { showHidden: false, depth: null }));
}

/*
 * POST Handlers for various routes
 */
exports.edit = function (req, res) {
    logData(req);
    res.status(200).send('Edit');
};

exports.save = async function (req, res) {
    logData(req);
    try {
        const payload = req.body;
        // Save the journey ID and payload in your storage (e.g., database)
        await saveToDatabase(payload);
        res.status(200).send('Save');
    } catch (error) {
        console.error('Error saving data:', error);
        res.status(500).send('Error saving data');
    }
};

exports.execute = async function (req, res) {
    logData(req);
    try {
        console.log("Request Body:", req.body);

        const inArguments = req.body.inArguments[0]; // Extract the first item in inArguments array
        const contactKey = inArguments.contactKey;
        const APIEventKey = inArguments.selectedJourneyAPIEventKey;
        const data = inArguments.payload;
        const activityInstanceId = req.body.activityInstanceId || req.body.definitionInstanceId; // Get the activity instance ID

        console.log("Extracted ContactKey:", contactKey);
        console.log("Extracted JourneyId:", APIEventKey);
        console.log("Extracted Data:", data);
        console.log("Extracted ActivityInstanceId:", activityInstanceId);

        const token = await retrieveToken();
        const result = await triggerJourney(token, contactKey, APIEventKey, data);

        // Store success result in external storage
        await storeExecutionResult(activityInstanceId, contactKey, 'Triggered', 'No Error');

        res.status(200).send('Execute');
    } catch (error) {
        console.error('Error executing journey:', error);

        // Store error result in external storage
        await storeExecutionResult(req.body.activityInstanceId, req.body.contactKey, 'Error', error.message);

        res.status(500).send('Error executing journey');
    }
};

exports.publish = function (req, res) {
    logData(req);
    res.status(200).send('Publish');
};

exports.validate = function (req, res) {
    logData(req);
    res.status(200).send('Validate');
};

exports.stop = function (req, res) {
    logData(req);
    res.status(200).send('Stop');
};

/*
 * Function to retrieve an access token
 */
async function retrieveToken() {
    try {
        const response = await axios.post(tokenURL, {
            grant_type: 'client_credentials',
            client_id: process.env.clientId,
            client_secret: process.env.clientSecret
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Error retrieving token:', error);
        throw error;
    }
}

/*
 * Function to trigger a journey
 */
async function triggerJourney(token, contactKey, APIEventKey, data) {
    const triggerUrl = `${process.env.restBaseURL}/interaction/v1/events`;
    const eventPayload = {
        ContactKey: contactKey,
        EventDefinitionKey: APIEventKey,
        Data: data
    };
    try {
        await axios.post(triggerUrl, eventPayload, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return { contactKey, status: 'Triggered', errorLog: 'No Error' };
    } catch (error) {
        console.error('Error triggering journey:', error);
        return { contactKey, status: 'Error', errorLog: error.message };
    }
}

/*
 * GET Handler for /journeys route
 */
exports.getJourneys = async function (req, res) {
    try {
        const token = await retrieveToken();
        const journeys = await fetchJourneys(token);
        res.status(200).json(journeys);
    } catch (error) {
        console.error('Error retrieving journeys:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
}

/*
 * Function to retrieve journeys
 */
async function fetchJourneys(token) {
    const journeysUrl = `${process.env.restBaseURL}/interaction/v1/interactions/`;

    try {
        const response = await axios.get(journeysUrl, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return response.data;
    } catch (error) {
        console.error('Error fetching journeys:', error);
        throw error;
    }
}

/*
 * Function to store execution results
 */
async function storeExecutionResult(activityInstanceId, contactKey, status, errorLog) {
    const result = { contactKey, status, errorLog };
    try {
        await saveToDatabase(activityInstanceId, result);
    } catch (error) {
        console.error('Error storing execution result:', error);
        throw error;
    }
}

/*
 * Placeholder function to simulate saving to a database
 */
async function saveToDatabase(activityInstanceId, result) {
    // Implement your database save logic here
    // Example: using a simple array as a mock database
    const db = getMockDatabase();
    db.push({ activityInstanceId: activityInstanceId, result: result });
    console.log('Database after save:', db);
}

async function getResultsFromDatabase(activityInstanceId) {
    // Implement your database retrieval logic here
    // Example: using a simple array as a mock database
    const db = getMockDatabase();
    const results = db.filter(record => record.activityInstanceId === activityInstanceId).map(record => record.result);
    console.log('Results from database:', results);
    return results;
}

function getMockDatabase() {
    // Example: a simple in-memory database
    if (!global.mockDatabase) {
        global.mockDatabase = [];
    }
    return global.mockDatabase;
}

// Export functions
exports.storeExecutionResult = storeExecutionResult;
exports.getResultsFromDatabase = getResultsFromDatabase;
