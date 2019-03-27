require('dotenv').config()

const express = require('express')

//
//*--------------------------------------------------/
//*         INIT APP
//*--------------------------------------------------/
const app = express()
// Set PORT
const port = process.env.PORT || 3000

//
//*--------------------------------------------------/
//*         MIDDLEWARE
//*--------------------------------------------------/
app.use(express.static('public'))

app.get('/', (req, res, next) => {
  res.sendFile('index.html')
})

//
//*--------------------------------------------------/
//*         RUN SERVER
//*--------------------------------------------------/
app.listen(port, () => console.log(`Server up on port ${port}`))
