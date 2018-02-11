var express = require('express');
var app=express();
var bodyParser= require('body-parser');
var jwt=require('jsonwebtoken');

var users=[
{
  name:"xxxx",
  password:"xxxx"
},
{
  name:"yyyy",
  password:"yyyy"
}
]
app.use( bodyParser.json() );
app.use(bodyParser.urlencoded({extended: true}));

app.use(express.static('./'));

app.get('/', (req, res) => {
    res.sendFile('index.html');
});

app.post('/login', (req, res) => {
    for(var user of users){
        if(user.name != req.body.name){
            res.status(403).json({
                message:"Wrong Name"
            });
        } else {
            if(user.password != req.body.password){
                res.status(403).json({
                    message:"Wrong Password"
                });
                break;
            }
            else    {
                //create the token.
                jwt.sign({user}, 'secretkey', {expiresIn: '300000s'}, (err, token) => {
                    if(err){
                        res.status(403).json({
                            message:"Wrong Token"
                        });
                    } else {
                        res.status(200).json({
                            message: "Login Successful",
                            token
                        });
                    }
                });
                break;
            }
        }
    }
});

app.post('/getusers', verifyToken,  (req, res) => {
    var user_list = [];
    users.forEach((user) => {
        user_list.push({"name":user.name});
    })
   // res.json({user_list});
    res.send(JSON.stringify({users:user_list}));
});

app.get('/api', (req, res) => {
    res.json({
        message: 'Welcome to the API'
    });
});

app.post('/api/posts', verifyToken, (req, res) => {
    res.json({
        message: 'Post created...'
    });
});


function verifyToken(req, res, next) {
    const bearerHeader = req.headers['authorization'];
    if(typeof bearerHeader !== 'undefined') {
        //split at the space
        const bearer = bearerHeader.split(' ');
        jwt.verify(bearer[1], 'secretkey', (err, token) => {
            if(err) {
              res.status(403).json({
                message:"Wrong Token"
              });
            } else {
                console.log(token);
              //  req.decoded=token;
                next();
            }
        });
    } else { 
        const token = req.body.token || req.query.token || req.headers['x-access-token'];      
        if(typeof token !== 'undefined') {
            jwt.verify(token, 'secretkey', (err, token) => {
                if(err) {
                  res.status(403).json({
                    message:"Wrong Token"
                  });
                } else {
              //      req.decoded=token;
                    next();
                }
            });
        } else {
            res.status(403).json({
                message:"No Token"
            });
        }
    }
}

app.listen(3000, () => {
  console.log('listening on port 3000');
}); 