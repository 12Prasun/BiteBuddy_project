const express = require('express')
const app = express()
const port = 5000;
const dotenv = require("dotenv");
const mongoDB = require("./db")
const path=require("path");

dotenv.config();
app.use((req,res,next)=>{
res.setHeader("Access-Control-Allow-Origin","http://localhost:3000");
res.header(
  "Access-Control-Allow-Headers",
  "Origin, X-Requested-With, Content-Type, Accept"
);
next();
})
app.use(express.json())
app.use('/api', require("./Routes/CreateUser"));
app.use('/api', require("./Routes/DisplayData"));
app.use('/api', require("./Routes/OrderData"));
const __dirname1=path.resolve();
if(process.env.NODE_ENV === "production")
{
  app.use(express.static(path.join(__dirname1,"/frontend/build")));

  app.get("/*",(req,res)=>{
    res.sendFile(path.resolve(__dirname1,"frontend","build","index.html"));
})
}
else{
  app.get('/', (req, res) => {
  res.send('Hello World!')
});
}


app.listen(port, () => {
  console.log(`Example app listening on port ${port}`)
})
module.exports= mongoDB();
