import express from 'express'
import AWS from 'aws-sdk'
import {
  marshall,
  unmarshall
} from "@aws-sdk/util-dynamodb"
import https from 'https'


// keep these a secret!
const accessKeyId = "AKIAZXKYFLQSH2LUREF7"
const secretAccessKey = "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"
const token = ""


AWS.config.update({
  region: 'us-east-2',
  accessKeyId: accessKeyId,
  secretAccessKey: secretAccessKey,
});

// data 
const dynamo = new AWS.DynamoDB({
  apiVersion: "2012-08-10"
});

const app = express();
app.use(express.json());
app.use((req, res, next) => {
  res.setHeader('Access-Control-Allow-Origin', '*');
  res.setHeader('Access-Control-Allow-Methods', 'POST, GET, PUT, DELETE');
  res.setHeader("Access-Control-Allow-Headers", "Access-Control-Allow-Headers, Origin,Accept, X-Requested-With, Content-Type, Access-Control-Request-Method, Access-Control-Request-Headers");
  next();
});


// get all the forum posts
app.get('/', (req, res) => {
  const params = {
    TableName: 'forumPosts'
  };
  dynamo.scan(params, (err, data) => {
    if (err) {
      res.status(500).send(err.message);
    } else {
      const {
        Items
      } = data;
      const unmarshalledItems = Items.map(item => unmarshall(item)).sort(
        (a, b) => {
          if (a.pinned && !b.pinned) {
            return -1
          } else if (!a.pinned && b.pinned) {
            return 1
          } else {
            const aLastUpdated = a.lastUpdated ? parseInt(a.lastUpdated) : 0;
            const bLastUpdated = b.lastUpdated ? parseInt(b.lastUpdated) : 0;
            return bLastUpdated - aLastUpdated;
          }
        }
      );
      res.send(unmarshalledItems);
    }
  });
});

// new forum post
app.post('/', (req, res) => {
  const {
    body
  } = req;
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

  dynamo.putItem(params, (err, data) => {
    if (err) {
      console.error('Unable to add item: ', err);
      res.status(500).send('Unable to add item:  ' + err.message);
    } else {
      res.status(200).send('Added item: ' + JSON.stringify(data));
    }
  });
});
// get just the one post
app.get('/post', (req, res) => {
  const forumPostID = req.query.id;
  const commentParams = {
    TableName: 'forumPosts',
    KeyConditionExpression: 'forumPostID = :id',
    ExpressionAttributeValues: {
      ':id': {
        S: forumPostID
      }
    }
  };
  dynamo.query(commentParams, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send(err.message);
    } else {
      const unmarshalledItems = data.Items.map(item => AWS.DynamoDB.Converter.unmarshall(item));
      res.send(unmarshalledItems);
    }
  });
});
// delete the one post
app.delete('/post', (req, res) => {
  const forumPostID = req.query.id;
  const params = {
    TableName: 'forumPosts',
    Key: {
      forumPostID: {
        S: forumPostID
      }
    },
  }
  dynamo.deleteItem(params, (err, data) => {
    if (err) {
      console.error(err)
      res.status(500).send(err.message)
    } else {
      res.send(data);
    }
  })
})

// do what reddit does to deleted comments
app.delete('/posts', (req, res) => {
  const pk = req.query.id;
  const sk = req.query.skId;

  const updateParams = {
    TableName: 'forumComments',
    Key: {
      'commentID': {
        S: pk
      },
      'forumPostID': {
        S: sk
      }
    },
    UpdateExpression: 'SET #deleted = :val',
    ExpressionAttributeNames: {
      '#deleted': 'deleted'
    },
    ExpressionAttributeValues: {
      ':val': {
        BOOL: true
      }
    },
    ReturnValues: 'ALL_NEW'
  };
  dynamo.updateItem(updateParams, (err, data) => {
    if (err) {
      console.error("Unable to update item. Error:", JSON.stringify(err, null, 2));
    } else {
      res.status(200).json({
        message: "success",
        updatedItem: data.Attributes
      });
    }
  });
});

// get all comments for a post (utilizing Global Secondary Index table scan)
app.get('/posts', (req, res) => {
  const forumPostID = req.query.id;
  const commentParams = {
    TableName: 'forumComments',
    IndexName: 'forumPostID-index',
    KeyConditionExpression: 'forumPostID = :pk',
    ScanIndexForward: true,
    ExpressionAttributeValues: {
      ':pk': {
        S: forumPostID
      }
    }
  };
  dynamo.query(commentParams, (err, data) => {
    if (err) {
      console.error(err);
      res.status(500).send(err.message);
    } else {
      const unmarshalledItems = data.Items?.sort(
        (a, b) => parseInt(a.lastUpdated) - parseInt(b.lastUpdated)
      ).map(item => AWS.DynamoDB.Converter.unmarshall(item));
      res.send(unmarshalledItems);
    }
  });
});
// put a new forum comment in
app.post('/posts', (req, res) => {
  const forumPostID = req.query.id;
  const {
    body
  } = req;

  // parameters for the forum comments
  const itemParams = {
    date: body.date,
    lastUpdated: body.lastUpdated.toString(),
    forumPostID: forumPostID,
    commentID: body.commentID,
    sessionID: body.sessionID,
    comment: body.comment,
  };

  const addParams = {
    TableName: 'forumComments',
    Item: marshall(itemParams),
  };

  // parameters for the forum post to update its recent activity field
  const updateParams = {
    TableName: "forumPosts",
    Key: {
      forumPostID: {
        S: forumPostID
      }
    },
    UpdateExpression: "SET lastUpdated = :newValue",
    ExpressionAttributeValues: {
      ":newValue": {
        S: Math.floor(new Date().getTime() / 1000).toString()
      }
    },
    ReturnValues: "NONE"
  };

  dynamo.putItem(addParams, (err, data) => {
    if (err) {
      console.error('Unable to add item: ', err);
      res.status(500).send('Unable to add item: ' + err.message);
    } else {
      console.log('updateParams: ', updateParams)
      // If the add item operation succeeded, then update the forum post
      dynamo.updateItem(updateParams, (updateErr, updateData) => {
        if (updateErr) {
          console.error(updateErr);
        } else {
          console.log(updateData);
        }
      });

      res.status(200).send('Added item: ' + JSON.stringify(data));
    }
  });
});

// get a list of activity to this repository using GitHub's API (Dont share my token plz)
app.get('/commits', (req, res) => {
  const options = {
    hostname: 'api.github.com',
    path: `/repos/coolokawesome/portfolio2/commits`,
    headers: {
      'Authorization': `token ${token}`,
      'User-Agent': 'Node.js'
    }
  };
  https.get(options, (response) => {
    let data = '';
    response.on('data', (chunk) => {
      data += chunk;
    });
    response.on('end', () => {
      if (response.statusCode === 200) {
        res.json(JSON.parse(data));
      } else {
        res.status(response.statusCode).json({
          error: response.statusMessage
        });
      }
    });
  }).on('error', (error) => {
    console.error('Error fetching commits:', error);
    res.status(500).json({
      error: 'Internal Server Error'
    });
  });
});



app.listen(3001);