import express from 'express'
import AWS from 'aws-sdk'
import { marshall, unmarshall } from "@aws-sdk/util-dynamodb"

const accessKeyId = "AKIAZXKYFLQSH2LUREF7"
const secretAccessKey = "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"

AWS.config.update({
  region: 'us-east-2',
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
});
//data & images
const dynamo = new AWS.DynamoDB({apiVersion: "2012-08-10"});


const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET');
  res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
  next();
});



// new comment post (utilizing Global Secondary Index table scan)
app.get('/posts', (req, res) => {
    const forumPostID = req.query.id;    
    const commentParams = {
      TableName: 'forumComments',
      IndexName: 'forumPostID-index',
      KeyConditionExpression: 'forumPostID = :id',
      ScanIndexForward: true,
      ExpressionAttributeValues: {
        ':id': { S: forumPostID }
      }
    };
      dynamo.query(commentParams, (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).send(err.message);
      } else {
        console.log('Query results:', data.Items);
        const unmarshalledItems = data.Items.map(item => AWS.DynamoDB.Converter.unmarshall(item));
        res.send(unmarshalledItems);
      }
    });
  });
  app.get('/post', (req, res) => {
    const forumPostID = req.query.id;    
    const commentParams = {
      TableName: 'forumPosts',
      KeyConditionExpression: 'forumPostID = :id',
      ExpressionAttributeValues: {
        ':id': { S: forumPostID }
      }
    };
      dynamo.query(commentParams, (err, data) => {
      if (err) {
        console.error(err);
        res.status(500).send(err.message);
      } else {
        console.log('Query results:', data.Items);
        const unmarshalledItems = data.Items.map(item => AWS.DynamoDB.Converter.unmarshall(item));
        res.send(unmarshalledItems);
      }
    });
  });

  app.post('/posts', (req, res) => {
    const forumPostID = req.query.id;
    const { body } = req;

    const Item = {
      date: body.date,
      lastUpdated: body.lastUpdated.toString(),
      forumPostID: forumPostID,
      commentID : body.commentID,
      sessionID: body.sessionID,
      comment: body.comment,
    }
    const params = {
      TableName: 'forumComments',
      Item: marshall(Item),
    };
    console.log('PARAMS: ', params)
    dynamo.putItem(params, (err, data) => {
      if (err) {
        console.error('Unable to add item. Error:', err);
          res.status(500).send('Unable to add item. Error: ' + err.message);
      } else {
        res.status(200).send('Added item: ' + JSON.stringify(data));
      }
    });
  });




  // new forum post handler (table scan):
app.get('/', (req, res) => {
  const params = {
      TableName: 'forumPosts'
  };
  dynamo.scan(params, (err, data) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      const { Items } = data;
      const unmarshalledItems = Items.map(item => unmarshall(item));
      console.log(unmarshalledItems);
      res.send(unmarshalledItems);
    }
  });
});

app.post('/', (req, res) => {
    const { body } = req;
    const params = {
      TableName: 'forumPosts',
      Item: marshall({
        forumPostID: body.forumPostID,
        date: body.date,
        title: body.title, 
        comment: body.comment,
        sessionID: body.sessionID,
        lastUpdated: body.lastUpdated.toString()
      }),
    };
  
    console.log(body, params)
    dynamo.putItem(params, (err, data) => {
      if (err) {
        console.error('Unable to add item. Error:', err);
          res.status(500).send('Unable to add item. Error: ' + err.message);
      } else {
        res.status(200).send('Added item: ' + JSON.stringify(data));
      }
    });
  });



  

app.listen(3001);