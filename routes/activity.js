'use strict';
const axios = require("axios");
const util = require('util');

// Global Variables
const tokenURL = `${process.env.AUTHENTICATION_URL}/v2/token`;
const interactionsURL = `${process.env.REST_BASE_URL}/interaction/v1/interactions/`;
const triggerURL = `${process.env.REST_BASE_URL}/interaction/v1/events`;

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

exports.save = function (req, res) {
    console.log("test");
    res.status(200).send('Save');
};

exports.execute = function (req, res) {
    logData(req);
    res.status(200).send('Execute');
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
            client_id: process.env.CLIENT_ID,
            client_secret: process.env.CLIENT_SECRET
        });
        return response.data.access_token;
    } catch (error) {
        console.error('Error retrieving token:', error);
        throw error;
    }
}

/*
 * Function to retrieve journeys
 */
async function fetchJourneys(token) {
    try {
        const response = await axios.get(interactionsURL, {
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
 * GET Handler for /journeys route
 */
exports.getJourneys = async function (req, res) {
    try {
        const token = await retrieveToken();
        const journeys = await fetchJourneys(token);
        res.status(200).json(journeys);
    } catch (error) {
        res.status(500).json({ error: 'Internal Server Error' });
    }
};

/*
 * POST Handler for /trigger-journey route
 */
exports.triggerJourney = async function (req, res) {
    try {
        const token = await retrieveToken();
        const response = await axios.post(triggerURL, req.body, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        res.status(200).json(response.data);
    } catch (error) {
        console.error('Error triggering journey:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
};
