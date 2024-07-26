'use strict';
const axios = require("axios");
const util = require('util');

// Global Variables
const tokenURL = `${process.env.AUTHENTICATION_URL}/v2/token`;

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
    logData(req);
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
function retrieveToken() {
    return axios.post(tokenURL, {
        grant_type: 'client_credentials',
        client_id: process.env.clientId,
        client_secret: process.env.clientSecret
    })
    .then(response => response.data.access_token)
    .catch(error => {
        console.error('Error retrieving token:', error);
        throw error;
    });
}

/*
 * Function to retrieve journeys
 */
function fetchJourneys(token) {
    const journeysUrl = `https://${process.env.restBaseURL}/interaction/v1/interactions/`;

    return axios.get(journeysUrl, {
        headers: {
            Authorization: `Bearer ${token}`,
            'Content-Type': 'application/json'
        }
    })
    .then(response => response.data)
    .catch(error => {
        console.error('Error fetching journeys:', error);
        throw error;
    });
}

/*
 * GET Handler for /journeys route
 */
exports.getJourneys = function (req, res) {
    retrieveToken()
        .then(token => fetchJourneys(token))
        .then(journeys => res.status(200).json(journeys))
        .catch(error => res.status(500).json({ error: 'Internal Server Error' }));
};
