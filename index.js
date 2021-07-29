const express = require('express')
const mongoClient = require('mongodb').MongoClient;
const url = process.env.MONGODB_URI || "mongodb+srv://admin:sfis233aBOFb1D8F@localizationdb.1vnce.mongodb.net/localizationdb?retryWrites=true&w=majority";
const dbname = "Localizationdb";
const path = require('path');
require('dotenv').config();
const app = express()

const ObjectId = require('mongodb').ObjectId; 

app.use(express.static('public'));
app.use(express.json({limit: '1mb'}));

const port = process.env.PORT || 3000;

let  db;

function connect(){
    mongoClient.connect(url,{}, (err,client)=>{
        if(err){
            console.log("Something went wrong with database")
            console.log(err)
            res.end();
            return;
        }
        console.log("Database connection is ok");
        db = client.db(dbname);
    })
}

connect();

app.post('/add',(req,res)=>{
    console.log(req.body);
    
    const pos_time = {
        latitude: req.body.lat,
        longitude: req.body.lon,
        description: req.body.description,
        time:Date.now()
    };

    const delta = 0.0001;

    db.collection('localizations').deleteMany({$and: [{latitude:{$gt: pos_time.latitude-delta}},{latitude:{$lt: pos_time.latitude+delta}},{longitude:{$gt: pos_time.longitude-delta}},{longitude:{$lt: pos_time.longitude+delta}}]});

    db.collection('localizations').insertOne(pos_time,(err,results)=>{
        if(err) console.log(err);
        else{
            console.log(results);
            res.json({status:"Location was added"});
        }
    });
    
});

app.get('/all',(req,res)=>{
    db.collection('localizations').find({}).toArray((err, data) => {
        if(err) console.log(err);
        //console.log(data);
        res.json(data);
    })
});

app.get('/key',(req,res)=>{
    res.json({key:process.env.Leaflet_key});
});

app.get('/all/:id',(req,res)=>{
    console.log(`Searching for: ${req.params.id}`);
    
    db.collection('localizations').find({_id: ObjectId(req.params.id)}).toArray((err, data) => {
        if(err) console.log(err);
        //console.log(data);
        res.json(data);
    })
});

app.get('/pos/:latlon',(req,res)=>{
    //console.log(`Searching for records on position: ${req.params.latlon}`);
    const position = req.params.latlon.split(',');
    
    const lat = parseFloat(position[0]);
    const lon = parseFloat(position[1]);

    
    db.collection('localizations').find({"latitude": lat,"longitude": lon}).toArray((err, data) => {
        if(err) console.log(err);
        //console.log(data);
        res.json(data);
    })
});

app.get('/map',(req,res)=>{
    try {res.sendFile(path.join(__dirname, 'public/map.html'))}
    catch(err){console.log(err)};
});

app.listen(port, ()=>{console.log("Running on port 3000...")})