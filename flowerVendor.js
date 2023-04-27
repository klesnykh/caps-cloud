'use strict';

const { Consumer } = require('sqs-consumer'); 
const AWS = require('aws-sdk');
AWS.config.update({ region: 'us-west-2' });
const { v4: uuidv4 } = require('uuid');

const sns = new AWS.SNS();

const input = {
  Message: process.argv[2],
  vendorUrl: 'https://sqs.us-west-2.amazonaws.com/584607906861/flowerDeliveries',
}; //  this accesses command line arguments, this will be our pickup message

const topic = 'arn:aws:sns:us-west-2:584607906861:pickups.fifo';

//poll the flowerDeliveries standard SQS queue and console log the delivery
const app = Consumer.create({
  region: 'us-west-2',
  queueUrl: 'https://sqs.us-west-2.amazonaws.com/584607906861/flowerDeliveries',
  handleMessage: async (message) => {
    try{
      let data = JSON.parse(message.Body);
      console.log(data);
    }
    catch (e){
      console.log(e);
    }
  },
});

app.start();


//make the pickup message into a payload with the arn of the SQS fifo: packages
const payload = {
  Message: JSON.stringify(input),
  TopicArn: topic,
  MessageGroupId: uuidv4()
}
//send the pickup through sns to the SQS fifo: packages queue
sns.publish(payload).promise()
.then(data => {
  console.log("pickup sent to packages SQS!!", data);
})
.catch((e) => {
  console.log('SNS message error: ', e);
});