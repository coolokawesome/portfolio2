import express from 'express'

const app = express();
app.use(express.json());

app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', 'http://localhost:5173');
  res.setHeader('Access-Control-Allow-Methods', 'POST');
  res.setHeader('Access-Control-Allow-Headers', 'Content-Type');
  next();
});

app.post('/', (req, res) => {
  console.log(req.body);
  res.send('POST request received successfully.');
});

app.listen(3001);