const express = require('express');
const bodyParser = require('body-parser');
const axios = require('axios');
const config = require('./config.json');

const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());

app.post('/custom-activity', async (req, res) => {
    const payload = req.body;

    console.log('Received payload:', payload);

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

        console.log('List of journeys:', journeysResponse.data);
        res.json(journeysResponse.data);
    } catch (error) {
        console.error('Error listing journeys:', error);
        res.status(500).json({ error: 'Internal Server Error' });
    }
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
