// Import the prompt module
const prompt = require('prompt');

// Start the prompt
prompt.start();

// Ask the user for their choice
prompt.get(['userSelection'], function (err, result) {
    if (err) {
        console.error(err);
        return;
    }

    const userSelection = result.userSelection.toUpperCase();
