import express from "express";
import path from 'path';

const __dirname = path.resolve();
const app = express();

app.use('/', express.static(__dirname + '/public'));

app.get("/", (req, res) => {
    res.sendFile(join(__dirname, 'public', 'index.html'));
});


// PORT
const PORT = 3000;

app.listen(PORT, () => {
   console.log(`Server is running on PORT: ${PORT}`);
});