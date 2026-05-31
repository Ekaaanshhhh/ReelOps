import connectDB from './src/config/db.js';
import User from './src/models/User.js';
import Channel from './src/models/Channel.js';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
dotenv.config();

const test = async () => {
  await connectDB();
  const user = await User.findOne({});
  const channel = await Channel.findOne({});
  console.log("User:", user.email, "Channel:", channel._id.toString());
  
  const token = jwt.sign({ id: user._id }, process.env.JWT_SECRET, { expiresIn: '1h' });
  
  try {
    const res = await fetch(`http://localhost:5005/api/v1/channel/${channel._id}/chat/messages`, {
      headers: { Authorization: `Bearer ${token}` }
    });
    if (!res.ok) {
      const errorText = await res.text();
      console.log("ERROR STATUS:", res.status, errorText);
    } else {
      const data = await res.json();
      console.log("SUCCESS:", data);
    }
  } catch (err) {
    console.log("ERROR:", err.message);
  }
  process.exit(0);
};
test();
