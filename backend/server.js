const express = require('express');
const app = express();
const port = 3001;

app.get('/', (req, res)=> {
    res.send('Hello from Roomloop Backend!');
});

app.listen(port, ()=> {
    console.log(`Roomloop backend listening at http://localhost:${port}`);
});