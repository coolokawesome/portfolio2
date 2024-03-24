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
const s3 = new AWS.S3();






const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET');
  res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
  next();
});



// post handler (table scan):
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
app.get('/post', (req, res) => {
    const forumPostID = req.query.id;
  
    const params = {
      TableName: 'forumComments',
      KeyConditionExpression: 'forumPostID = :id',
      ExpressionAttributeValues: {
        ':id': { S: forumPostID }
      }
    };
      dynamo.query(params, (err, data) => {
      if (err) {
        console.error('Error querying DynamoDB:', err);
        res.status(500).send(err.message);
      } else {
        console.log('Query results:', data.Items);
        const unmarshalledItems = data.Items.map(item => AWS.DynamoDB.Converter.unmarshall(item));
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
        sessionId: body.sessionId,
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
    //   const imageParams = {
    //     Bucket: 'forumimagesportfolio2',
    //     Key: 'example.jpg',
    //     Body: fs.createReadStream('path/to/your/image.jpg'), 
    //     ACL: 'public-read' 
    //   };
    });
  });



  

app.listen(3001);