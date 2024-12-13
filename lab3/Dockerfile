FROM node:18

# Установка рабочей директории
WORKDIR /app

# Копирование package.json и package-lock.json
COPY package*.json ./

# Установка зависимостей
RUN npm install

# Копирование всех файлов в контейнер
COPY . .

# Открытие порта для приложения
EXPOSE 3000

# Команда запуска приложения
CMD ["node", "ftp.js"]
