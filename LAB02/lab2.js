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

       // Generate computer selection
    const randomNum = Math.random();
    let computerSelection = '';

    if (randomNum <= 0.34) {
        computerSelection = 'PAPER';
    } else if (randomNum <= 0.67) {
        computerSelection = 'SCISSORS';
    } else {
        computerSelection = 'ROCK';
    }

