const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const config = require('./config.json');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

// Endpoint to retrieve journeys
app.get('/journeys', async (req, res) => {
    try {
        const authResponse = await axios.post(config.authUrl, {
            client_id: config.clientId,
            client_secret: config.clientSecret,
            grant_type: 'client_credentials'
        });

        const accessToken = authResponse.data.access_token;

        const journeysResponse = await axios.get(config.journeysUrl, {
            headers: {
                Authorization: `Bearer ${accessToken}`
            }
        });

        res.status(200).json(journeysResponse.data);
    } catch (error) {
        console.error('Error retrieving journeys:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
