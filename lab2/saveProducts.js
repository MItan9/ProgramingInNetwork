const fs = require('fs');

const products = [
    { ProductName: 'Tamaris', MDLPrice: 1990, EURPrice: 99.5 },
    { ProductName: 's.Oliver', MDLPrice: 1690, EURPrice: 84.5 },
    { ProductName: 'Rieker', MDLPrice: 1890, EURPrice: 94.5 },
    { ProductName: 'PRIMO VERO', MDLPrice: 1790, EURPrice: 89.5 },
    { ProductName: 'Bugatti', MDLPrice: 1990, EURPrice: 99.5 },
    { ProductName: 's.Oliver', MDLPrice: 1690, EURPrice: 84.5 },
    { ProductName: 'FILA', MDLPrice: 1690, EURPrice: 84.5 },
    { ProductName: 'Bugatti', MDLPrice: 1990, EURPrice: 99.5 },
    { ProductName: 's.Oliver', MDLPrice: 1890, EURPrice: 94.5 },
    { ProductName: 'New Balance', MDLPrice: 1790, EURPrice: 89.5 },
    { ProductName: 'Salamander', MDLPrice: 1690, EURPrice: 84.5 },
    { ProductName: 'EMU', MDLPrice: 1690, EURPrice: 84.5 },
    { ProductName: 'PRIMIGI', MDLPrice: 1790, EURPrice: 89.5 },
    { ProductName: 'New Balance', MDLPrice: 1690, EURPrice: 84.5 },
    { ProductName: 'Salamander', MDLPrice: 1690, EURPrice: 84.5 },
    { ProductName: 'Tamaris', MDLPrice: 1790, EURPrice: 89.5 },
    { ProductName: 'PRIMO VERO', MDLPrice: 1690, EURPrice: 84.5 },
    { ProductName: 's.Oliver', MDLPrice: 1690, EURPrice: 84.5 },
    { ProductName: 'Rieker', MDLPrice: 1890, EURPrice: 94.5 },
    { ProductName: 'FILA', MDLPrice: 1890, EURPrice: 94.5 },
    { ProductName: 'Marco Tozzi', MDLPrice: 1990, EURPrice: 99.5 },
    { ProductName: 'Marco Tozzi', MDLPrice: 2190, EURPrice: 109.5 },
    { ProductName: 'Skechers', MDLPrice: 1790, EURPrice: 89.5 },
    { ProductName: 'PRIMIGI', MDLPrice: 1690, EURPrice: 84.5 },
    { ProductName: 'New Balance', MDLPrice: 1690, EURPrice: 84.5 },
    { ProductName: 'New Balance', MDLPrice: 1690, EURPrice: 84.5 },
    { ProductName: 'New Balance', MDLPrice: 1690, EURPrice: 84.5 },
    { ProductName: 'PRIMIGI', MDLPrice: 1790, EURPrice: 89.5 }
];


fs.writeFile('products.json', JSON.stringify(products, null, 2), (err) => {
    if (err) {
        console.error('Ошибка при записи файла:', err);
    } else {
        console.log('Данные успешно сохранены в products.json');
    }
});
