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

console.log(`User selected: ${userSelection}`);
    console.log(`Computer selected: ${computerSelection}`);

       if (userSelection === computerSelection) {
        console.log("It's a tie"); // Tie condition
    } else if (
        (userSelection === 'ROCK' && computerSelection === 'SCISSORS') ||
        (userSelection === 'PAPER' && computerSelection === 'ROCK') ||
        (userSelection === 'SCISSORS' && computerSelection === 'PAPER')
    ) {
        console.log("User Wins"); // User wins condition
    } else {
        console.log("Computer Wins"); // Computer wins condition
    }