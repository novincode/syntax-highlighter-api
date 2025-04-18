import dotenv from 'dotenv';

dotenv.config();

const API_URL = `http://localhost:${process.env.PORT || 3000}/highlight`;
const API_KEY = process.env.API_KEY || 'your_api_key_here';

async function runTest() {
  const response = await fetch(API_URL, {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'x-api-key': API_KEY,
    },
    body: JSON.stringify({
      code: 'fn main() { println!("Hello, world!"); }',
      lang: 'rust',
      theme: 'github-dark',
    }),
  });
  const data = await response.json();
  console.log('Response:', data);
}

runTest().catch(console.error);