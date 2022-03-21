const express = require('express');
var path = require('path');

const app = express();
app.use(express.static('public'));
const port = 3000;
// rendering html file.
app.get('/', (req, res) => {
	res.sendFile(path.join(__dirname + '/public/static/index.html'));
})
app.get('/api/data', (req, res) => {
    const data = [100, 50, 300, 40, 350, 250]; // change this with the actual data later
    res.json(data);
});

app.listen(port, ()=>{
    console.log('listening on port '+port);
});