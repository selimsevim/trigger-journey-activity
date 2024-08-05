'use strict';
const axios = require("axios");
const util = require('util');
const { Client } = require('pg'); // Assuming you are using PostgreSQL

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

        const inArguments = req.body.inArguments[0];
        const contactKey = inArguments.contactKey;
        const APIEventKey = inArguments.selectedJourneyAPIEventKey;
        const data = inArguments.payload;
        const uuid = inArguments.uuid;

        console.log("Extracted ContactKey:", contactKey);
        console.log("Extracted JourneyId:", APIEventKey);
        console.log("Extracted Data:", data);

        const token = await retrieveToken();
        const response = await triggerJourney(token, contactKey, APIEventKey, data);

        const responsePayload = {
            uuid: uuid,
            contactKey: contactKey,
            triggerDate: new Date(),
            status: response.status,
            errorLog: response.error ? response.error.message : null
        };

        await saveToDatabase(responsePayload);

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
async function triggerJourney(token, contactKey, APIEventKey, data) {
    const triggerUrl = `${process.env.restBaseURL}/interaction/v1/events`;
    const eventPayload = {
        ContactKey: contactKey,
        EventDefinitionKey: APIEventKey,
        Data: data
    };
    try {
        const response = await axios.post(triggerUrl, eventPayload, {
            headers: {
                Authorization: `Bearer ${token}`,
                'Content-Type': 'application/json'
            }
        });
        return { status: 'Success', error: null };
    } catch (error) {
        console.error('Error triggering journey:', error);
        return { status: 'Error', error: error };
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
 * Handler to get activity data by UUID
 */
exports.getActivityByUUID = async function (req, res) {
    const uuid = req.params.uuid;

    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    await client.connect();

    const query = 'SELECT * FROM activity_data WHERE uuid = $1';
    const values = [uuid];

    try {
        const result = await client.query(query, values);
        if (result.rows.length > 0) {
            res.json(result.rows[0]);
        } else {
            res.status(404).send('Activity not found');
        }
    } catch (err) {
        console.error('Error retrieving activity data from database:', err.stack);
        res.status(500).send('Internal Server Error');
    } finally {
        await client.end();
    }
}

/*
 * Placeholder function to simulate saving to a database
 */
async function saveToDatabase(data) {
    const client = new Client({
        connectionString: process.env.DATABASE_URL,
        ssl: {
            rejectUnauthorized: false
        }
    });

    await client.connect();

    const query = 'INSERT INTO activity_data(uuid, contact_key, trigger_date, status, error_log) VALUES($1, $2, $3, $4, $5)';
    const values = [data.uuid, data.contactKey, data.triggerDate, data.status, data.errorLog];

    try {
        await client.query(query, values);
    } catch (err) {
        console.error('Error saving data to database:', err.stack);
    } finally {
        await client.end();
    }
}
