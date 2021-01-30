// Copyright 2020 Amazon.com, Inc. or its affiliates. All Rights Reserved.
// SPDX-License-Identifier: Apache-2.0

/* eslint-disable */
const compression = require('compression');
const fs = require('fs');
const url = require('url');
const uuid = require('uuid/v4');
const AWS = require('aws-sdk');
/* eslint-enable */

let hostname = '127.0.0.1';
let port = 8080;
let protocol = 'http';
let options = {};

const chime = new AWS.Chime({ region: 'us-east-1' });
const alternateEndpoint = process.env.ENDPOINT;
if (alternateEndpoint) {
  console.log('Using endpoint: ' + alternateEndpoint);
  chime.createMeeting({ ClientRequestToken: uuid() }, () => {});
  AWS.NodeHttpClient.sslAgent.options.rejectUnauthorized = false;
  chime.endpoint = new AWS.Endpoint(alternateEndpoint);
} else {
  chime.endpoint = new AWS.Endpoint(
    'https://service.chime.aws.amazon.com/console'
  );
}

const meetingCache = {};
const attendeeCache = {};

const log = message => {
  console.log(`${new Date().toISOString()} ${message}`);
};

const app = process.env.npm_config_app || 'meeting';

const server = require(protocol).createServer(
  options,
  async (request, response) => {
    log(`${request.method} ${request.url} BEGIN`);
    compression({})(request, response, () => {});
    try {
      if (
        request.method === 'GET' &&
        (request.url === '/' ||
          request.url === '/v2/' ||
          request.url.startsWith('/?'))
      ) {
        response.statusCode = 200;
        response.setHeader('Content-Type', 'text/html');
        response.end(fs.readFileSync(`dist/${app}.html`));
      } else if (
        request.method === 'POST' &&
        request.url.startsWith('/join?')
      ) {
        const query = url.parse(request.url, true).query;
        const title = query.title;
        const externalUserId = query.externalUserId || 'NO_EXTERNAL_USER_ID';
        const name = query.name;
        const region = query.region || 'us-east-1';

        if (!meetingCache[title]) {
          meetingCache[title] = await chime
            .createMeeting({
              ClientRequestToken: uuid(),
              MediaRegion: region,
              ExternalMeetingId: externalUserId + '_' + title,
              // Tags associated with the meeting. They can be used in cost allocation console
              Tags: [
                { Key: 'CreatedByUser', Value: externalUserId },
                { Key: 'MeetingId', Value: title },
              ]
            })
            .promise();
          attendeeCache[title] = {};
        }
        const joinInfo = {
          JoinInfo: {
            Title: title,
            Meeting: meetingCache[title].Meeting,
            Attendee: (
              await chime
                .createAttendee({
                  MeetingId: meetingCache[title].Meeting.MeetingId,
                  ExternalUserId: uuid()
                })
                .promise()
            ).Attendee
          }
        };
        attendeeCache[title][joinInfo.JoinInfo.Attendee.AttendeeId] = name;
        response.statusCode = 201;
        response.setHeader('Content-Type', 'application/json');
        response.write(JSON.stringify(joinInfo), 'utf8');
        response.end();
        log(JSON.stringify(joinInfo, null, 2));
      } else if (
        request.method === 'GET' &&
        request.url.startsWith('/attendee?')
      ) {
        const query = url.parse(request.url, true).query;
        const attendeeInfo = {
          AttendeeInfo: {
            AttendeeId: query.attendee,
            Name: attendeeCache[query.title][query.attendee]
          }
        };
        response.statusCode = 200;
        response.setHeader('Content-Type', 'application/json');
        response.write(JSON.stringify(attendeeInfo), 'utf8');
        response.end();
        log(JSON.stringify(attendeeInfo, null, 2));
      } else if (
        request.method === 'POST' &&
        request.url.startsWith('/meeting?')
      ) {
        const query = url.parse(request.url, true).query;
        const title = query.title;
        const externalUserId = query.externalUserId || 'NO_EXTERNAL_USER_ID'
        if (!meetingCache[title]) {
          meetingCache[title] = await chime
            .createMeeting({
              ClientRequestToken: uuid(),
              ExternalMeetingId: externalUserId + '_' + title,
              // Tags associated with the meeting. They can be used in cost allocation console
              Tags: [
                { Key: 'CreatedByUser', Value: externalUserId },
                { Key: 'MeetingId', Value: title },
              ]
              // NotificationsConfiguration: {
              //   SqsQueueArn: 'Paste your arn here',
              //   SnsTopicArn: 'Paste your arn here'
              // }
            })
            .promise();
          attendeeCache[title] = {};
        }
        const joinInfo = {
          JoinInfo: {
            Title: title,
            Meeting: meetingCache[title].Meeting
          }
        };
        response.statusCode = 201;
        response.setHeader('Content-Type', 'application/json');
        response.write(JSON.stringify(joinInfo), 'utf8');
        response.end();
        log(JSON.stringify(joinInfo, null, 2));
      } else if (request.method === 'GET' && requestUrl.pathname === '/create') {
        if (!requestUrl.query.title || !requestUrl.query.region) {
          throw new Error('Invalid Request');
        }
  
        // Look up the meeting by its title. If it does not exist, create the meeting.
        if (!meetingTable[requestUrl.query.title]) {
          const externalUserId = requestUrl.query.externalUserId || 'NO_EXTERNAL_USER_ID';

          meetingTable[requestUrl.query.title] = await chime.createMeeting({
            // Use a UUID for the client request token to ensure that any request retries
            // do not create multiple meetings.
            ClientRequestToken: uuidv4(),
            // Specify the media region (where the meeting is hosted).
            // In this case, we use the region selected by the user.
            MediaRegion: requestUrl.query.region,
            // Any meeting ID you wish to associate with the meeting.
            // For simplicity here, we use the meeting title.
            ExternalMeetingId: externalUserId + '_' + requestUrl.query.title,
            // Tags associated with the meeting. They can be used in cost allocation console
            Tags: [
              { Key: 'CreatedByUser', Value: externalUserId },
              { Key: 'MeetingId', Value: requestUrl.query.title },
            ]
          }).promise();
        }
  
        // Fetch the meeting info
        const meeting = meetingTable[requestUrl.query.title];
        
        // Return the meeting response.
        respond(response, 201, 'application/json', JSON.stringify({
          JoinInfo: {
            Meeting: meeting.Meeting
          },
        }, null, 2));
      } else if (request.method === 'POST' && request.url.startsWith('/end?')) {
        const query = url.parse(request.url, true).query;
        const title = query.title;
        await chime
          .deleteMeeting({
            MeetingId: meetingCache[title].Meeting.MeetingId
          })
          .promise();
        response.statusCode = 200;
        response.end();
      } else if (request.method === 'POST' && request.url.startsWith('/logs')) {
        console.log('Writing logs to cloudwatch');
        response.end('Writing logs to cloudwatch');
      } else {
        response.statusCode = 404;
        response.setHeader('Content-Type', 'text/plain');
        response.end('404 Not Found');
      }
    } catch (err) {
      log(`server caught error: ${err}`);
      response.statusCode = 403;
      response.setHeader('Content-Type', 'application/json');
      response.write(JSON.stringify({ error: err.message }), 'utf8');
      response.end();
    }
    log(`${request.method} ${request.url} END`);
  }
);

server.listen(port, hostname, () => {
  log(`server running at ${protocol}://${hostname}:${port}/`);
});
