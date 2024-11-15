const net = require("net"); // Модуль для работы с TCP-серверами
const fs = require("fs").promises; // Модуль для работы с файловой системой с использованием промисов
const { Mutex } = require("async-mutex"); // Библиотека для управления блокировками (мьютексами)

const PORT = 12345;
const FILE_PATH = "shared_file.txt"; 
const mutex = new Mutex(); // Мьютекс для синхронизации доступа к файлу
let writeCount = 0; 


const USE_SYNC = true;


async function handleClient(socket) {
  let buffer = ""; 

  // Обработка события получения данных
  socket.on("data", async (data) => {
    buffer += data.toString(); // Добавляем данные в буфер

    let lines = buffer.split("\n"); // Разделяем буфер на строки, используя символ новой строки
    buffer = lines.pop(); // Оставляем неоконченную строку в буфере для дальнейшей обработки

    for (let line of lines) {
      const message = line.trim(); 
      console.log("Received command:", message);

      if (message === "write") {
        if (USE_SYNC) {
          await handleWriteOperationWithSync(socket);
        } else {
          await handleWriteOperationWithoutSync(socket);
        }
      } else if (message === "read") {
        if (USE_SYNC) {
          await handleReadOperationWithSync(socket);
        } else {
          await handleReadOperationWithoutSync(socket);
        }
      } else {
        socket.write("Unknown command\n");
      }
    }
  });

  // Обработка события отключения клиента
  socket.on("end", () => {
    console.log("Client disconnected");
  });
}

// Task 9: Обработка команды записи без синхронизации
async function handleWriteOperationWithoutSync(socket) {
  try {
    const content = `Written data at ${new Date().toISOString()}\n`; 
    await fs.appendFile(FILE_PATH, content, "utf8"); 
    socket.write("Data written to file\n"); 
    console.log("Data written to file.");
  } catch (err) {
    console.error("Error writing to file:", err);
    socket.write("Error writing to file\n"); 
  }
}

// Task 9: Обработка команды чтения без синхронизации
async function handleReadOperationWithoutSync(socket) {
  try {
    const content = await fs.readFile(FILE_PATH, "utf8"); 
    socket.write("Data read from file:\n" + content); 
    console.log("Data read from file:\n", content);
  } catch (err) {
    console.error("Error reading from file:", err);
    socket.write("Error reading to file\n");
  }
}

// Task 10: Обработка команды записи с синхронизацией
async function handleWriteOperationWithSync(socket) {
  writeCount++; 

  const release = await mutex.acquire(); 
  try {
    const content = `Written data at ${new Date().toISOString()}\n`; 

    console.log("Writing to file... Simulating delay.");
    await new Promise((resolve) => setTimeout(resolve, 7000)); 

    await fs.appendFile(FILE_PATH, content, "utf8"); 
    socket.write("Data written to file\n"); 
    console.log("Data written to file.");
  } catch (err) {
    console.error("Error writing to file:", err);
    socket.write("Error writing to file\n"); 
  } finally {
    writeCount--; 
    release(); // Освобождаем мьютекс
  }
}

// Task 10: Обработка команды чтения с синхронизацией
async function handleReadOperationWithSync(socket) {
  
  while (writeCount > 0) {
    await new Promise((resolve) => setTimeout(resolve, 100)); // Проверяем каждые 100 мс
  }

  const release = await mutex.acquire(); // Захватываем мьютекс, чтобы другие операции не могли получить доступ к файлу
  try {
    const content = await fs.readFile(FILE_PATH, "utf8"); // Читаем содержимое файла
    socket.write("Data read from file:\n" + content); 
    console.log("Data read from file:\n", content);
  } catch (err) {
    console.error("Error reading from file:", err);
    socket.write("Error reading to file\n"); 
  } finally {
    release(); // Освобождаем мьютекс
  }
}

// Запуск TCP-сервера
const server = net.createServer((socket) => {
  console.log("Client connected"); 
  handleClient(socket); 
});

server.listen(PORT, () => {
  console.log(`Server is listening on port ${PORT}`); 
  console.log(`Running in ${USE_SYNC ? "synchronized" : "non-synchronized"} mode.`); 
});
