import amqp from 'amqplib';
import axios from 'axios';

const RABBITMQ_URL = 'amqp://localhost';
const WEB_SERVER_URL = 'http://localhost:3001/products';

async function consumeAndForward() {
  try {
    const connection = await amqp.connect(RABBITMQ_URL);
    const channel = await connection.createChannel();
    const queue = 'products_queue';

    await channel.assertQueue(queue, { durable: true });
    console.log(`Waiting for messages in queue: ${queue}`);

    channel.consume(queue, async (message) => {
      if (message !== null) {
        const product = JSON.parse(message.content.toString());
        console.log(`Received product: ${JSON.stringify(product)}`);

        try {
          const response = await axios.post(WEB_SERVER_URL, product);
          console.log(`POST request successful: ${response.data.message}`);
        } catch (error) {
          console.error('Error sending product to web server:', error.message);
        }

        channel.ack(message); // Подтверждаем обработку сообщения
      }
    });
  } catch (error) {
    console.error('Error in consumeAndForward:', error);
  }
}

consumeAndForward();
