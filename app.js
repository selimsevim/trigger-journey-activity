const express = require('express');
const bodyParser = require('body-parser');
const app = express();
const port = process.env.PORT || 3000;

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));
app.use(express.static('public'));

app.post('/execute', (req, res) => {
    const { inArguments } = req.body;
    console.log('Received inArguments:', inArguments);

    // Sample response
    res.status(200).json({ foundSignupDate: '2016-03-10' });
});

app.post('/save', (req, res) => {
    console.log('Save request:', req.body);
    res.status(200).send('Save Successful');
});

app.post('/publish', (req, res) => {
    console.log('Publish request:', req.body);
    res.status(200).send('Publish Successful');
});

app.post('/validate', (req, res) => {
    console.log('Validate request:', req.body);
    res.status(200).send('Validate Successful');
});

app.post('/stop', (req, res) => {
    console.log('Stop request:', req.body);
    res.status(200).send('Stop Successful');
});

app.listen(port, () => {
    console.log(`Server is running on port ${port}`);
});
