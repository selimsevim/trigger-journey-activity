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
        // This is a placeholder, replace it with actual storage logic
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
        const { contactKey, journeyId, payload } = req.body;
        const token = await retrieveToken();
        await triggerJourney(token, contactKey, journeyId, payload);
        res.status(200).send('Execute');
    } catch (error) {
        console.error('Error executing journey:', error);
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
async function triggerJourney(token, contactKey, journeyId, payload) {
    const triggerUrl = `${process.env.restBaseURL}/interaction/v1/events`;
    const eventPayload = {
        ContactKey: contactKey,
        EventDefinitionKey: journeyId,
        Data: payload
    };
    try {
        await axios.post(triggerUrl, eventPayload, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
    } catch (error) {
        console.error('Error triggering journey:', error);
        throw error;
    }
}

/*
 * Placeholder function to simulate saving to a database
 */
async function saveToDatabase(data) {
    // Implement your database save logic here
    console.log('Saving to database:', data);
    return Promise.resolve();
}
