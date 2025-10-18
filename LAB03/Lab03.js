// LAB03 - Simple Math Server using Connect
// Author: [Your Name]
// Course: COMP2068 - Web Programming
// Lab: 03

const connect = require('connect');
const url = require('url');

const app = connect();

function calculate(req, res) {
  const query = url.parse(req.url, true).query;
  const method = query.method;
  const x = parseFloat(query.x);
  const y = parseFloat(query.y);

  res.writeHead(200, { 'Content-Type': 'text/plain' });

  // Check if parameters are valid
  if (!method || isNaN(x) || isNaN(y)) {
    res.end(
      'Error: Please provide valid parameters.\nExample: http://localhost:3000/lab3?method=add&x=10&y=5'
    );
    return;
  }

  let result;
  let symbol;

  // Select math operation
  switch (method) {
    case 'add':
      result = x + y;
      symbol = '+';
      break;
    case 'subtract':
      result = x - y;
      symbol = '-';
      break;
    case 'multiply':
      result = x * y;
      symbol = '*';
      break;
    case 'divide':
      if (y === 0) {
        res.end('Error: Cannot divide by zero.');
        return;
      }
      result = x / y;
      symbol = '/';
      break;
    default:
      res.end('Error: Invalid method. Use add, subtract, multiply, or divide.');
      return;
  }

  res.end(`${x} ${symbol} ${y} = ${result}`);
}

// Route setup
app.use('/Lab03', calculate);

// Start the server
app.listen(3000, () => {
  console.log('✅ Server running at http://localhost:3000/Lab03');
});
