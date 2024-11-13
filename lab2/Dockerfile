# Используем базовый образ Node.js
FROM node:20

# Создаем рабочую директорию в контейнере
WORKDIR /app

# Копируем package.json и package-lock.json
COPY package*.json ./

# Устанавливаем зависимости
RUN npm install

# Копируем весь код в контейнер
COPY . .

# Открываем порт 3000 для приложения
EXPOSE 3000

# Запускаем приложение
CMD ["node", "app.js"]
