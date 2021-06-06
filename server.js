const express = require('express');
const connectDB = require('./config/db');

const app = express();

//Connect DataBase
connectDB();

app.use(express.json({ extended: false }));

const PORT = process.env.PORT || 5000;

//app.use('/', (req, res) => res.send('Hello There!'));
app.use('/bot', require('./telBot'));

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
