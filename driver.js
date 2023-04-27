'use strict';

const { Consumer } = require('sqs-consumer'); 
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' });

const { v4: uuidv4 } = require('uuid');
const { Producer } = require('sqs-producer');
const AWS_REGION = 'us-west-2';
const AWS_QUEUE_URL = 'https://sqs.us-west-2.amazonaws.com/584607906861/flowerDeliveries';


//poll the packages fifo SQS queue and send delivered to the flowerDeliveries standard queue
const app = Consumer.create({
  region: 'us-west-2',
  queueUrl: 'https://sqs.us-west-2.amazonaws.com/584607906861/packages.fifo',
  //somehow send a delivery message to the flowerDeliveries queue
  handleMessage: async (message) => {
    console.log('In handleMessage Driver.js')
    let data = JSON.parse(message.Body);
    console.log(data);
    let dataMessage = JSON.parse(data.Message);
    console.log(dataMessage.vendorUrl);

    const producer = Producer.create({
      queueUrl: dataMessage.vendorUrl,
      region: AWS_REGION,
    });

    producer.send({
      id: uuidv4(),
      body: JSON.stringify(data),
    }).then(data => {
      console.log('SQS MESSAGE DATA: ', data);
    })
    .catch(err => {
      console.log('SQS PRODUCER ERROR: ', err);
    });
  },
});

app.start();