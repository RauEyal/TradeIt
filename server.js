const express = require('express');

const app = express();

app.use(express.json({ extended: false }));

const PORT = process.env.PORT || 5000;

app.use('/bot', require('./telBot'));

app.listen(PORT, () => console.log(`Server started on port ${PORT}`));
