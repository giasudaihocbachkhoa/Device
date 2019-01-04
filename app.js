import request from 'request';
import aws4 from 'aws4';
import DeviceSdk from 'aws-iot-device-sdk';
var https = require('https');
main();
async function main() {
    try {
        const idToken = await Signin('+841698785471','5g5y72yM!');
        const Credentials = await Get_Credentials(idToken);
        const policy = await Promise.all([
            Attach_connect(Credentials),
            Attach_pub(Credentials),
            Attach_sub(Credentials),
            Attach_reciev(Credentials)
        ]);
        const device = test_device(Credentials);
    } catch (error) {
        console.log(error);
    }
}
async function Signin(phone_number, password){
  let options = { method: 'POST',
    url: 'https://api.pyralink.io/v1/auth/signin',
    form: { phone_number: phone_number, password:  password}
  };
  return new Promise((resolve,rejects)=>{
    request(options, function (error, response, body) {
        if (error) return rejects(error);
        let idtoken = JSON.parse(body).data.idToken;
        console.log('Signin successfull !!');
        return resolve(idtoken);
    });
  });
}
async function Get_Credentials(token) {
    let options = { method: 'POST',region: 'ap-southeast-2',
    url: 'https://api.pyralink.io/v1/auth/credentials',
    form: { token: token} };
    return new Promise((resolve,rejects)=>{
        request(options, function (error, response, body) {
            if (error) return rejects(error);
            let Credentials = JSON.parse(body).data;
            console.log("Get Credentials successfull !!");
            return resolve(Credentials);
          }); 
    });
}

async function Attach_connect(Credentials){
    let options = {
      method: 'POST',
      host: 'api.pyralink.io',
      path: '/v1/policy/attach_connect',
      region: 'ap-southeast-1',
      service: 'execute-api'
    };
    aws4.sign(options,Credentials);
    return new Promise((resolve,rejects)=>{
        let req = https.request(options, function(res) {
            res.on('data',(d)=>{
                console.log('Attach connect successfull !!');
                resolve(d);
            });
        });
        req.on('error',(e) => rejects(e));
        req.end();
    });
}
async function Attach_pub(Credentials){
    var options = {
      method: 'POST',
      host: 'api.pyralink.io',
      path: '/v1/policy/attach_publish',
      region: 'ap-southeast-1',
      service: 'execute-api'
    };
    aws4.sign(options,Credentials);
    return new Promise((resolve,rejects)=>{
        let req = https.request(options, function(res) {
            res.on('data',(d)=>{
                console.log('Attach pub successfull !!');
                resolve(d);
            });
        });
        req.on('error',(e) => rejects(e));
        req.end();
    });
  }

async function Attach_sub(Credentials, device){
    var options = {
      method: 'POST',
      host: 'api.pyralink.io',
      path: '/v1/policy/attach_subscribe',
      region: 'ap-southeast-1',
      service: 'execute-api'
    };
    aws4.sign(options,Credentials);
    return new Promise((resolve,rejects)=>{
        let req = https.request(options, function(res) {
            res.on('data',(d)=>{
                console.log('Attach sub successfull !!');
                resolve(d);
            });
        });
        req.on('error',(e) => rejects(e));
        req.end();
    });
  }
  async function Attach_reciev(Credentials){
    var options = {
      method: 'POST',
      host: 'api.pyralink.io',
      path: '/v1/policy/attach_receive',
      region: 'ap-southeast-1',
      service: 'execute-api'
    };
    aws4.sign(options,Credentials);
    return new Promise((resolve,rejects)=>{
        let req = https.request(options, function(res) {
            res.on('data',(d)=>{
                console.log('Attach reciev successfull !!');
                resolve(d);
            });
        });
        req.on('error',(e) => rejects(e));
        req.end();
    });
  }
async function test_device(Credentials){
    const device = DeviceSdk.device({
        region: "ap-southeast-1",
        host: "a1tqxkj7szwc5k.iot.ap-southeast-1.amazonaws.com",
        clientId: `${Math.floor((Math.random() * 1000000) + 1)}`,
        protocol: 'wss',
        accessKeyId: Credentials.accessKeyId,
        secretKey: Credentials.secretAccessKey,
        sessionToken: Credentials.sessionToken
      });
      device.on('connect', function() {
        console.log('connected IoT core');
        device.subscribe('topicsb');
        device.publish('topicpb', "msg from IoT Core");
      });
      device.on('message', function(topic, payload) {
        console.log('message', topic, payload.toString());
      });
}