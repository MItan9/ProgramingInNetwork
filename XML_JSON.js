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



const person = {
    name: "John",
    age: 30,
    address: {
      street: "Main",
      city: "New York"
    }
  };
  

  function serialize(obj, rootName = 'root') {
    let result = `[${rootName}]\n`;
    
    for (const [key, value] of Object.entries(obj)) {
      if (typeof value === 'object' && value !== null) {
        result += serialize(value, key);
      } else {
        result += `- ${key}: ${value}\n`;
      }
    }
    
    return result;
  }
  
  function deserialize(str) {
    const lines = str.split('\n');
    const stack = [];
    let currentObj = {};
    let currentKey = '';
  
    lines.forEach(line => {
      line = line.trim();
      if (line.startsWith('[') && line.endsWith(']')) {
        if (currentKey) {
          stack.push({ obj: currentObj, key: currentKey });
        }
        currentKey = line.slice(1, -1);
        currentObj = {};
      } else if (line.startsWith('-')) {
        const [key, value] = line.slice(2).split(':').map(part => part.trim());
        currentObj[key] = isNaN(value) ? value : Number(value);
      } else if (line === '') {
        if (stack.length > 0) {
          const { obj: parentObj, key } = stack.pop();
          parentObj[key] = currentObj;
          currentObj = parentObj;
        }
      }
    });
  
    return currentObj;
  }
  
  const serialized = serialize(person, 'person');
  console.log(serialized);
  /*
  [person]
  - name: John
  - age: 30
  [address]
  - street: Main
  - city: New York
  */
  
  const deserialized = deserialize(serialized);
  console.log(deserialized);
  // { name: 'John', age: 30, address: { street: 'Main', city: 'New York' } }
  
  