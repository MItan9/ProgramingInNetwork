import fetch from 'node-fetch';
import { JSDOM } from 'jsdom';
import amqp from 'amqplib';

const targetUrl = 'https://www.salamander.md/ro';
const RABBITMQ_URL = 'amqp://localhost';

const publishToQueue = async (queue, message) => {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();

    await channel.assertQueue(queue, { durable: true });
    channel.sendToQueue(queue, Buffer.from(JSON.stringify(message)));
    console.log(`Message published to queue: ${queue}`, message);

    await channel.close();
    await connection.close();
  } catch (error) {
    console.error('Error publishing to queue:', error.message);
  }
};

const fetchData = async () => {
  try {
    const response = await fetch(targetUrl, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/114.0.0.0 Safari/537.36',
      },
    });

    if (!response.ok) {
      throw new Error(`Failed to fetch: ${response.statusText}`);
    }

    const html = await response.text();
    console.log('HTML fetched successfully');
    processHTML(html);
  } catch (error) {
    console.error('Error fetching HTML:', error);
  }
};

const processHTML = async (html) => {
  const dom = new JSDOM(html);
  const document = dom.window.document;

  const products = [];
  const productElements = document.querySelectorAll('.product-card');

  productElements.forEach((element) => {
    const nameElement = element.querySelector('.product-title');
    const name = nameElement ? nameElement.textContent.trim() : 'Unknown Product';

    const priceElement = element.querySelector('.text-accent');
    const price = priceElement
      ? parseFloat(priceElement.textContent.trim().replace(/[^\d.]/g, ''))
      : 0;

    if (name && price) {
      products.push({ ProductName: name, MDLPrice: price, EURPrice: price * 0.05 });
    }
  });

  console.log('Extracted products:', products);

  for (const product of products) {
    await publishToQueue('products_queue', product);
  }
};

fetchData();
