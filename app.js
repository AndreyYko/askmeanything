const express = require('express');
const app = express();
const http = require('http');
const mongoClient = require('mongodb').MongoClient;
const url = 'mongodb://localhost:27017/';
const path = require('path');
const hbs = require('express-handlebars');
const session = require('express-session');
const MongoStore = require('connect-mongo')(session);
const cookieParser = require('cookie-parser');
const server = http.createServer(app);
const bodyParser = require('body-parser');
const urlenCoded = bodyParser.urlencoded({extended:false})
const assert = require('assert');
var io = require('socket.io').listen(server);

app.engine('.hbs', hbs({extname:'.hbs'}));
app.set('view engine', '.hbs');
app.set('views', path.join(__dirname, 'views'));
app.use(express.static('views'))

app.use(cookieParser())
var sessionMiddleware = session({
  secret: 'i need more beers',
  resave: false,
  saveUninitialized: false,
  store: new MongoStore({
    url: url,
  })
})
io.use(function(socket, next) {
    sessionMiddleware(socket.request, socket.request.res, next);
});
app.use(sessionMiddleware);

app.get('/', (req, res)=>{
  var date = new Date()
  mongoClient.connect(url,{useNewUrlParser: true},(err, client)=>{
    assert.equal(null, err);
    var collection = client.db('hackaton').collection('users');
    collection.update({login: req.session.login},{$set: {online: date.getTime()}},{upsert:false},(err, result)=>{
    })
    client.db('hackaton').collection('stat').findOne({name: req.session.login}, (err,result)=>{
      res.render('index',{
        balance: result.points
      });
    })
    client.close();
  })
})
app.get('/login', (req, res)=>{
  res.render('login')
})
app.post('/login',urlenCoded,(req,res)=>{
  mongoClient.connect(url,{useNewUrlParser: true},(err, client)=>{
    assert.equal(null, err);

    var collection = client.db('hackaton').collection('users');
    collection.findOne({login: req.body.login},(err, result)=>{
      if(result.password = req.body.password){
        req.session.login = req.body.login;
        req.session.sex = result.sex;
        req.session.age = result.age;
        res.redirect('/');
      }else{
        res.send('oh now');
      }
    })
    client.close();
  })
})
app.get('/stat',(req,res)=>{
  mongoClient.connect(url, (err, client)=>{
    client.db('hackaton').collection('stat').findOne({name: req.session.login}, (err,result)=>{
      res.render('stat',{
        questions:result.questions,
        answers:result.answers,
        earned:result.earned,
        spend:result.spent,
        name: req.session.login
      })
    })
  })

})
app.get('/answers', (req, res)=>{
  mongoClient.connect(url, (err, client)=>{
    var collection = client.db('hackaton').collection('question');
    collection.find({login:req.session.login}).toArray((err, result)=>{
      var body = [];
      var answer = {};
      result.reverse()
      result.forEach((item, i, arr)=>{
        answer = {};
        answer['login'] = item.login;
        answer['qst'] = item.qst;
        answer['answer'] = item.answer;
        answer['date'] = item.date;
        answer['time'] = item.time;
        body.push(answer)
      })
      res.render('answers',{
        body:body
      })
    })
  })

})

server.listen(3000);

io.sockets.on('connection', function (socket) {
  socket.emit('send_login',{
  login:socket.request.session.login
});
  socket.on('send_question',(data)=>{
    var datetime = new Date()
    let date = datetime.toLocaleString()
    date = date.split(' ')
    var date1 = date[0].split('-')
    if (date1[1].length == 2){
      var date2 = date1[2] + '.' + date1[1] + '.' + date1[0].substr(2,3)
    }else{
      var date2 = date1[2] + '.0' + date1[1] + '.' + date1[0].substr(2,3)
    }
    mongoClient.connect(url, (err, client)=>{
      client.db('hackaton').collection('stat').findOne({name: socket.request.session.login}, (err,result)=>{
        questions = result.questions + 1;
        balance = result.points - 50;
        spent = result.spent + 50
        client.db('hackaton').collection('stat').update({name: socket.request.session.login},{$set:{questions: questions, points:balance, spent:spent}},{upsert:false}, (err,resulttt)=>{
          if(err){
            console.log(err)
          }
        })
      })
      var db = client.db('hackaton');
      var collection = db.collection('users');
      var onlinetime = datetime.getTime() - 300000;
      collection.find({sex:{$ne:socket.request.session.sex}, online:{$gte: onlinetime}}).toArray((err, result)=>{
        var rand = Math.floor(Math.random() * result.length);
        var rslt =  result[rand].login;
        socket.request.session.responder = 'xyz';
        let question_info = {login:socket.request.session.login, qst: data.qst, date: date2, time: date[1].substring(0,5), answer: '', responder: rslt };
        var collection2 = db.collection('question');
        io.emit('message',{
          login:question_info['responder'],
          qst:question_info['qst'],
          date:question_info['date'],
          time:question_info["time"],
          requester:question_info['login']
        });
      });
    });
  });
  socket.on('send_answer',(data)=>{
    mongoClient.connect(url, (err, client)=>{
    client.db('hackaton').collection('stat').findOne({name: data.login}, (err,result)=>{
      answers = result.questions + 1;
      balance = result.points + 50;
      earned = result.earned + 50
      client.db('hackaton').collection('stat').update({name: data.login},{$set:{answers: answers, points:balance, earned:earned}},{upsert:false}, (err,resulttt)=>{
        if(err){
          console.log(err)
        }
      })
    })
  })
    io.emit('answer',{
      login:data.requester,
      qst: data.qst,
      answer:data.answer
    })
    let question_info = {login:data.requester, qst: data.qst, date:data.date, time:data.time, answer:data.answer, responder:data.login };
    mongoClient.connect(url, (err, client)=>{
      var db = client.db('hackaton');
      var collection = db.collection('question');
      collection.insertOne(question_info, (err, result)=>{
      });
    });
  });
});
