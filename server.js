// const express = require('express');
// var path = require('path');

// const app = express();
// app.use(express.static(__dirname + '/public'));
// // app.use(express.static(__dirname, "../public"));
// const port = 3000;
// // rendering html file.
// app.get('/', (req, res) => {
// 	res.sendFile(path.join(__dirname + '/public/static/index.html'));
// })
// app.get('/api/data', (req, res) => {
//     const data = [100, 50, 300, 40, 350, 250]; // change this with the actual data later
//     res.json(data);
// });

// app.listen(port, ()=>{
//     console.log('listening on port '+port);
// });


const express = require('express')
const path = require('path')
const PORT = process.env.PORT || 5000

express()
  .use(express.static(path.join(__dirname, 'public')))
//   .set('views', path.join(__dirname, 'views'))
//   .set('view engine', 'ejs')
  .get('/', (req, res) => res.sendFile(path.join(__dirname + '/public/static/index.html')))
  .listen(PORT, () => console.log(`Listening on ${ PORT }`))