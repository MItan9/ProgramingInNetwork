const net = require("net");
const fs = require("fs").promises;
const { Mutex } = require("async-mutex");

const PORT = 12345;
const FILE_PATH = "shared_file.txt";
const mutex = new Mutex();
let writeCount = 0;

// Функция для обработки каждого соединения с клиентом
async function handleClient(socket) {
  let buffer = ""; // Буфер для накопления данных

  socket.on("data", async (data) => {
    buffer += data.toString(); // Добавляем данные в буфер

    // Проверяем, есть ли в буфере полная команда
    let lines = buffer.split("\n");
    buffer = lines.pop(); // Оставляем неоконченную часть в буфере

    for (let line of lines) {
      const message = line.trim(); // Убираем пробелы и символы новой строки

      // Отладочный вывод для проверки полученных данных
      console.log("Received command:", message);

      // Добавляем случайную задержку от 1 до 7 секунд
      await new Promise((resolve) => setTimeout(resolve, Math.floor(Math.random() * 7000) + 1000));

      if (message === "write") {
        await handleWriteOperation(socket);
      } else if (message === "read") {
        await handleReadOperation(socket);
      } else {
        socket.write("Unknown command\n"); // Если команда не 'write' или 'read', сервер возвращает 'Unknown command'
      }
    }
  });

  socket.on("end", () => {
    console.log("Client disconnected");
  });
}

// Обработка команды записи
async function handleWriteOperation(socket) {
  writeCount++;

  const release = await mutex.acquire(); // Блокируем доступ к файлу для записи
  try {
    const content = `Written data at ${new Date().toISOString()}\n`;
    await fs.appendFile(FILE_PATH, content, "utf8");
    socket.write("Data written to file\n");
    console.log("Data written to file.");
  } catch (err) {
    console.error("Error writing to file:", err);
    socket.write("Error writing to file\n");
  } finally {
    writeCount--;
    release(); // Освобождаем блокировку
  }
}

// Обработка команды чтения
async function handleReadOperation(socket) {
  // Ждём завершения всех операций записи
  while (writeCount > 0) {
    await new Promise((resolve) => setTimeout(resolve, 100)); // Периодически проверяем наличие активных операций записи
  }

  const release = await mutex.acquire(); // Блокируем доступ к файлу для чтения
  try {
    const content = await fs.readFile(FILE_PATH, "utf8");
    socket.write("Data read from file:\n" + content);
    console.log("Data read from file:\n", content);
  } catch (err) {
    console.error("Error reading from file:", err);
    socket.write("Error reading from file\n");
  } finally {
    release(); // Освобождаем блокировку
  }
}

// Запуск TCP-сервера
const server = net.createServer((socket) => {
  console.log("Client connected");
  handleClient(socket);
});

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`);
});
