const fs = require('fs');
const file = 'client/src/pages/CheckQuote.jsx';
let content = fs.readFileSync(file, 'utf8');

const t2 = '          return; // EXIT FUNCTION\r\n        }\r\n      } else {';
const r2 = '          return; // EXIT FUNCTION\r\n        }\r\n        }\r\n      } else {';

const t1 = '          return; // EXIT FUNCTION\n        }\n      } else {';
const r1 = '          return; // EXIT FUNCTION\n        }\n        }\n      } else {';

if (content.includes(t2)) {
    content = content.replace(t2, r2);
    fs.writeFileSync(file, content);
    console.log('Fixed using \\r\\n');
} else if (content.includes(t1)) {
    content = content.replace(t1, r1);
    fs.writeFileSync(file, content);
    console.log('Fixed using \\n');
} else {
    console.log('Target string not found!');
}
