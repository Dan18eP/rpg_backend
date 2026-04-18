const express = require('express');
const cors = require('cors');

const app = express();

app.use(cors());
app.use(express.json());

app.use('/personajes', require('./routes/personajes.routes'));
app.use('/batallas', require('./routes/batallas.routes'));

app.listen(3000, () => {
    console.log('Servidor corriendo en puerto 3000');
});