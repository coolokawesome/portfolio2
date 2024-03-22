import express from 'express'
import AWS from 'aws-sdk'

const accessKeyId = "AKIAZXKYFLQSGIA6F7XV"
const secretAccessKey = "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"

AWS.config.update({
  region: 'us-east-2',
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
});
const dynamo = new AWS.DynamoDB({apiVersion: "2012-08-10"});

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
  const { body } = req;

  const params = {
    TableName: 'forumPosts',
    Item: {
      forumPostID: {S: body.id},
      date: {N: body.date},
      title: { S: body.title }, 
      comment: { S: body.comment },
      sessionId: {S: body.string },
      subject: {S: body.subject}
    },
  };
  dynamo.putItem(params, (err, data) => {
    if (err) {
      res.send('Unable to add item. Error JSON:', JSON.stringify(err, null, 2));
    } else {
      res.send('Added item:', JSON.stringify(data, null, 2));
    }
  });
});

app.listen(3001);