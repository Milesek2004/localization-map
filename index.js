const express = require('express')
const Datastore = require('nedb')
const path = require('path');
require('dotenv').config();
const app = express()

app.use(express.static('public'));
app.use(express.json({limit: '1mb'}));

const port = process.env.PORT || 3000;

const database = new Datastore('localizations.db');
database.loadDatabase();

app.post('/add',(req,res)=>{
    console.log(req.body);
    try{
        const pos_time = {
            latitude: req.body.lat,
            longitude: req.body.lon,
            description: req.body.description,
            time:Date.now()
        };
        console.log(pos_time);
        database.insert(pos_time);
        res.json({status:"Location was added",values: pos_time});
    }catch(err){
        console.warn(err);
    }
});

app.get('/all',(req,res)=>{
    database.find({},(err,data)=>{
        if(err){
            console.error(err);
            res.end();
            return;
        }
        res.json(data);
    });
});

app.get('/key',(req,res)=>{
    res.json({key:process.env.Leaflet_key});
});

app.get('/all/:id',(req,res)=>{
    console.log(`Searching for: ${req.params.id}`);
    database.find({_id: req.params.id},(err,data)=>{
        if(err){
            console.error(err);
            res.end();
            return;
        }
        res.json(data);
    });
});

app.get('/pos/:latlon',(req,res)=>{
    console.log(`Searching for records on position: ${req.params.latlon}`);
    const position = req.params.latlon.split(',');
    
    const lat = parseFloat(position[0]);
    const lon = parseFloat(position[1]);

    database.find({"latitude": lat,"longitude": lon},(err,data)=>{
        if(err){
            console.error(err);
            res.end();
            return;
        }
        res.json(data);
    });
});

app.get('/map',(req,res)=>{
    try {res.sendFile(path.join(__dirname, 'public/map.html'))}
    catch(err){console.log(err)};
});

app.listen(port, ()=>{console.log("Running on port 3000...")})