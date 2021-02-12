const express = require('express');

const app = express();

app.use(express.json({ extended: false }));

app.get('/', (req, res) => res.send('API Running'));

const PORT = process.env.PORT || 5001;

app.use('/bot', require('./telBot'));

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
