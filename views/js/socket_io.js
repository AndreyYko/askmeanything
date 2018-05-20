  var socket = io.connect('http://localhost:3000');
  var login, requester, time, date, qst
  socket.on('send_login',(data)=>{
    console.log(data)
    login = data.login
  })
  socket.on('message',(data)=>{
    console.log(data),
    qst = data.qst,
    date = data.date,
    time = data.time,
    requester = data.requester
    if(data.login == login){
      $(".pop-up-back").css("display", "flex");
      $(".message").text(data.qst);
    }
  });
  socket.on('answer', (data)=>{
    console.log(data.login);
    if(data.login == login){
      $("#pop-up-new-answer").css("display", "block");
      $("#pop-up-question-q").text("Q: " + data.qst);
      $("#pop-up-answer-q").text("A: " + data.answer);

    }
  })
  function somefunction(){
    var answerr = document.getElementById('pop-up-form-textarea').value;
    $("#pop-up-div").hide();
    socket.emit('send_answer',{
      answer: answerr,
      login:login,
      qst:qst,
      date:date,
      time:time,
      requester:requester
    });
    console.log('answer send');
  }
  function sendQuestion(){
    var qst = document.getElementById('question-form-textarea').value;
    socket.emit('send_question',{
      login: login,
      qst: qst
    })
    console.log('send question');
  }
