class Person {
    constructor(name, age) {
      this.name = name;
      this.age = age;
    }
  }
  
  function serializeToJSON(obj) {
    let json = '{';
    for (const [key, value] of Object.entries(obj)) {
      json += `"${key}":`;
      if (typeof value === 'string') {
        json += `"${value}"`;
      } else {
        json += value;
      }
      json += ',';
    }
    json = json.slice(0, -1) + '}';
    return json;
  }
  
  function serializeToXML(obj, rootName = 'root') {
    let xml = `<${rootName}>`;
    for (const [key, value] of Object.entries(obj)) {
      xml += `<${key}>${value}</${key}>`;
    }
    xml += `</${rootName}>`;
    return xml;
  }
  
  
//   const person = new Person('University Assistant', 26);
//   console.log(serializeToJSON(person)); 
//   console.log(serializeToXML(person, 'person')); 



  function serialize(data) {    // вызывает саму себя чтобы пройтись по каждому элементу массива
    if (Array.isArray(data)) {
        return `A[${data.map(item => serialize(item)).join("; ")}]`;
    } else if (typeof data === "object" && data !== null) {
        const entries = Object.entries(data).map(                          //преобразует объект в массив 
            ([key, value]) => `${key}:${serialize(value)}`    //используется для серриализации вложенных объектов 
        );
        return `O{${entries.join("; ")}}`;   // для разделения пар ключ значение
    } else if (typeof data === "string") {
        return `S(${data})`;
    } else if (typeof data === "number") {
        return `N(${data})`;
    } else if (typeof data === "boolean") {
        return `B(${data})`;
    }
    return `null`;
}

function deserialize(serializedData) {
  if (!serializedData) return null;

  if (serializedData.startsWith("A[")) {
      const items = [];
      let itemStart = 2; // после "A["

      //  depth, отслеживает уровень вложенности
      for (let i = 2, depth = 0; i < serializedData.length - 1; i++) {
          if (serializedData[i] === '[' || serializedData[i] === '{') depth++;
          if (serializedData[i] === ']' || serializedData[i] === '}') depth--;
          if (serializedData[i] === ';' && depth === 0) {
              items.push(deserialize(serializedData.slice(itemStart, i).trim()));
              itemStart = i + 1;
          }
      }
      if (itemStart < serializedData.length - 1) {
          items.push(deserialize(serializedData.slice(itemStart, serializedData.length - 1).trim()));
      }
      return items;
  } else if (serializedData.startsWith("O{")) {
      const object = {};
      let entryStart = 2; // после "O{"
      for (let i = 2, depth = 0; i < serializedData.length - 1; i++) {
          if (serializedData[i] === '[' || serializedData[i] === '{') depth++;
          if (serializedData[i] === ']' || serializedData[i] === '}') depth--;
          if (serializedData[i] === ';' && depth === 0) {
              const entry = serializedData.slice(entryStart, i).trim();
              const [key, value] = entry.split(/:(.+)/); // разделяем только по первому двоеточию
              if (key && value !== undefined) {
                  object[key] = deserialize(value.trim());
              }
              entryStart = i + 1;
          }
      }
      if (entryStart < serializedData.length - 1) {
          const entry = serializedData.slice(entryStart, serializedData.length - 1).trim();
          const [key, value] = entry.split(/:(.+)/);
          if (key && value !== undefined) {
              object[key] = deserialize(value.trim());
          }
      }
      return object;
  } else if (serializedData.startsWith("S(")) {
      return serializedData.slice(2, -1);
  } else if (serializedData.startsWith("N(")) {
      return parseFloat(serializedData.slice(2, -1));
  } else if (serializedData.startsWith("B(")) {
      return serializedData.slice(2, -1) === "true";
  }
  return null;
}

// Пример использования:
// const data = {
//   name: "Alice",
//   age: 30,
//   isMember: true,
//   favorites: ["chess", "books"],
//   profile: {
//       id: 123,
//       isActive: false
//   }
// };


const data = ['name', {
    name: "Alice",
    age: 30,
    isMember: true,
    favorites: ["chess", "books"],
    profile: {
        id: 123,
        isActive: false
    }
  }];



const serialized = serialize(data);
console.log("Serialized:", serialized);

const deserialized = deserialize(serialized);
console.log("Deserialized:", deserialized);
