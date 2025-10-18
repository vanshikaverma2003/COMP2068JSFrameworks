
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
