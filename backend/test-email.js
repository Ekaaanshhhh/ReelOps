import { sendSubmissionNotification } from './src/services/email.service.js';
import nodemailer from 'nodemailer';

const test = async () => {
  console.log("Sending test email...");
  
  const dummySubmission = {
    _id: "6a1939996785590d2fcc9851",
    title: "My Awesome Reel",
    platform: "INSTAGRAM",
    channel: "channel123"
  };
  
  await sendSubmissionNotification(
    dummySubmission, 
    "Jane Doe", 
    ["ekanshsatsangi@gmail.com"]
  );
  
  console.log("Test finished.");
  process.exit(0);
};

test();
