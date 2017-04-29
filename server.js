var express=require('express');
var path=require('path');
var MarkerClusterer = require('node-js-marker-clusterer');
var nodemailer = require('nodemailer');
var ejs=require('ejs');
var engine=require('ejs-mate');
var firebase=require('firebase');
var gcloud = require('gcloud');
var app=express();
var bodyParser = require('body-parser')
app.use(bodyParser.urlencoded({ extended: false }))
app.use(bodyParser.json())
app.use(express.static(path.join(__dirname, 'public')));
app.use('/MarkerClusterer',express.static(__dirname+'/node_modules/node-js-marker-clusterer/src'));
app.engine('ejs', engine);
app.set('view engine', 'ejs');
var storage = gcloud.storage({
  projectId: 'dump-trace',
  privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDWNbwxMbQ38x3/\nWSwiqXxiNi0L4+46aKl0/om9j8GP9tV3iEiia5p8xZO9dzm6BkGaybTSR3oNiAKg\nr0/EEwMsHwrewTLV6+/Dqv0afuXhFfOncv5UgBTYsh0tFajGiYY9pVMAG8BB/Dj0\n4d57D4RVhQUpTY9VaffJbTeMUI0crCPrsxCoKqI0ZkqZoCTXkUabZ0+A2tVOQWKw\nwWvwzCa0ymNpoaFkYz3mfvBcfpWnSivc1W4h4GWbfqhM8R68hiobQLXQTGHcXFPd\nIJS9DGtTGcXndfsAcAKRDcza7TScTj17s32SwyEZWVn575OVEAKQ8Qzyo4T5n2Yy\nLGgZeOx/AgMBAAECggEBAIBjVJhnogymuqQBXmKoEtUKg5VM18xKTsbAiO4E647N\n8sPh+ybeN4nxIcu9WewVM90CaE5gaNcTXf/RE44BlzUqpek9AqsU7m/oXCs1Q7LU\n5WTHl4gt/FCk8LfE85OLedoY7NZzy5fBBKJBfodjlX1sbNuEkRQwn0MrItAGt40m\nxkg7LSRIIDagSOehkh+GD+tGnFfrV6oaSAgH9R1J1Zqh114Hbg4ss3gOtFEe0n6W\nWikRSZk/+wdHiI1rk8LWW28hfqlcYvl2z63fnNBxVgjqFTDZ/zI4fE66Z5BRspI3\nyg2LYggZDh+Zkzd/lczEb07gCDLFn7+q6ENJ8nCiKoECgYEA+nLHLsSRtDyanEuu\nIQ9Eea4I0/VwZc/nFdH4McQktlBaDeHPDYRpLsyAIKHEpmJaNjuJgXoIyFr7eybz\nvUbdeTy6P9xRBAfpGb+5g9NIXAWsG9Hye1dUlYbTy6thXsIthADcj30bLuD1Muvd\n0hgx4v7HwruaNYaBcKC3abcL9V0CgYEA2vVQeYLl9gFiyAJhbF13jsT4qJoRmCBI\nPxczMPa/7N61CiOexwnTdz5FA3OxdvNVx/XlFwcWxzpymPBCnOhm50QcbOobnKu3\n4s3yukI0bZs33qwy/xyYkWK2yH5Ru/dCA2ChcE3KARNSnZxjoX+dz1xBH4wj/SQB\ncKB1X5sfT4sCgYBVIZDNN+ojLvqLKDp/aFYpWlwL2IElSn9NbnsER50HD9ccouYj\nvR+X1dGzxek3eXUavDAof9feavbSzNHLQ/xiip7wuC4dxaaZpw8jXT1acl8ncb0P\n6gaJcTQrJg1KDY01MqnGaItF6xfOAFj9YlYKx/oVGnn3ucnkA+10lNEOzQKBgFGX\n9QMy+krwPUVXTcK6GeGEGT2LHF9aOFH6bUMj0GWOoFxE5dg6GylmdQVSSaGQEDlR\nsqsgIybe6vF/JvOdzysDQKx9mQiLHR1RrdAm966YlvtNpDtZBqm25XJVUFQBUgI8\nMizNcCdycej17FK0YbRyJnqBGLAuiLLVuKeGAOb9AoGBALVhpRRHxQhzwgKN3mwG\nodAOqx3EkMNzKJig2X1oV8tb6coD2EyylfXGzgDUF394O//QNv7sLm1h0rApl72I\ndREq9MPfLGkPhcIifxy5z7BuKmQosPUGGa887QD5Iy/KOgVmJY+NOdlQ6tfBxTO7\nCmpf63DTfy0F/YX9D3tEFSeA\n-----END PRIVATE KEY-----\n"
});
const bucket = storage.bucket('gs://dump-trace.appspot.com/photos')
var admin=require('firebase-admin');
var locationFactory = function(lat,long,time,address){
 var location = {};
 location.latitude = lat;
 location.longitude = long;
 location.time = time;
 location.address = address;
 return location;
};
admin.initializeApp({
  credential: admin.credential.cert({
    projectId: "dump-trace",
    clientEmail: "dump-trace@appspot.gserviceaccount.com",
    privateKey: "-----BEGIN PRIVATE KEY-----\nMIIEvgIBADANBgkqhkiG9w0BAQEFAASCBKgwggSkAgEAAoIBAQDWNbwxMbQ38x3/\nWSwiqXxiNi0L4+46aKl0/om9j8GP9tV3iEiia5p8xZO9dzm6BkGaybTSR3oNiAKg\nr0/EEwMsHwrewTLV6+/Dqv0afuXhFfOncv5UgBTYsh0tFajGiYY9pVMAG8BB/Dj0\n4d57D4RVhQUpTY9VaffJbTeMUI0crCPrsxCoKqI0ZkqZoCTXkUabZ0+A2tVOQWKw\nwWvwzCa0ymNpoaFkYz3mfvBcfpWnSivc1W4h4GWbfqhM8R68hiobQLXQTGHcXFPd\nIJS9DGtTGcXndfsAcAKRDcza7TScTj17s32SwyEZWVn575OVEAKQ8Qzyo4T5n2Yy\nLGgZeOx/AgMBAAECggEBAIBjVJhnogymuqQBXmKoEtUKg5VM18xKTsbAiO4E647N\n8sPh+ybeN4nxIcu9WewVM90CaE5gaNcTXf/RE44BlzUqpek9AqsU7m/oXCs1Q7LU\n5WTHl4gt/FCk8LfE85OLedoY7NZzy5fBBKJBfodjlX1sbNuEkRQwn0MrItAGt40m\nxkg7LSRIIDagSOehkh+GD+tGnFfrV6oaSAgH9R1J1Zqh114Hbg4ss3gOtFEe0n6W\nWikRSZk/+wdHiI1rk8LWW28hfqlcYvl2z63fnNBxVgjqFTDZ/zI4fE66Z5BRspI3\nyg2LYggZDh+Zkzd/lczEb07gCDLFn7+q6ENJ8nCiKoECgYEA+nLHLsSRtDyanEuu\nIQ9Eea4I0/VwZc/nFdH4McQktlBaDeHPDYRpLsyAIKHEpmJaNjuJgXoIyFr7eybz\nvUbdeTy6P9xRBAfpGb+5g9NIXAWsG9Hye1dUlYbTy6thXsIthADcj30bLuD1Muvd\n0hgx4v7HwruaNYaBcKC3abcL9V0CgYEA2vVQeYLl9gFiyAJhbF13jsT4qJoRmCBI\nPxczMPa/7N61CiOexwnTdz5FA3OxdvNVx/XlFwcWxzpymPBCnOhm50QcbOobnKu3\n4s3yukI0bZs33qwy/xyYkWK2yH5Ru/dCA2ChcE3KARNSnZxjoX+dz1xBH4wj/SQB\ncKB1X5sfT4sCgYBVIZDNN+ojLvqLKDp/aFYpWlwL2IElSn9NbnsER50HD9ccouYj\nvR+X1dGzxek3eXUavDAof9feavbSzNHLQ/xiip7wuC4dxaaZpw8jXT1acl8ncb0P\n6gaJcTQrJg1KDY01MqnGaItF6xfOAFj9YlYKx/oVGnn3ucnkA+10lNEOzQKBgFGX\n9QMy+krwPUVXTcK6GeGEGT2LHF9aOFH6bUMj0GWOoFxE5dg6GylmdQVSSaGQEDlR\nsqsgIybe6vF/JvOdzysDQKx9mQiLHR1RrdAm966YlvtNpDtZBqm25XJVUFQBUgI8\nMizNcCdycej17FK0YbRyJnqBGLAuiLLVuKeGAOb9AoGBALVhpRRHxQhzwgKN3mwG\nodAOqx3EkMNzKJig2X1oV8tb6coD2EyylfXGzgDUF394O//QNv7sLm1h0rApl72I\ndREq9MPfLGkPhcIifxy5z7BuKmQosPUGGa887QD5Iy/KOgVmJY+NOdlQ6tfBxTO7\nCmpf63DTfy0F/YX9D3tEFSeA\n-----END PRIVATE KEY-----\n"
  }),
  databaseURL: 'https://dump-trace.firebaseio.com/'
});
var db = admin.database();
var ref=db.ref("Address of the Dump spots");
var pairs=[];
var debug=[];
var time=[];
var data=[];
var x=1;
ref.orderByChild("Longitude"+"Latitude").on("child_added", function(snapshot) {
  var temp=[];
  debug.push(snapshot.val());
   data.push(snapshot.val());
  temp.push(snapshot.val().Latitude);
  temp.push(snapshot.val().Longitude);
  temp.push(snapshot.val().Time);
  temp.push(snapshot.val().Address);
  temp.push(snapshot.key);
  var timearray=snapshot.val().Time;
  if(timearray!=undefined)
  time.push(timearray);
  if(temp[0]!=undefined && temp[1]!=undefined){
  pairs.push(temp);
  
}
});


var air=[];
var ti=[];


ref.on("value", function(snapshot) {
      var newPost = snapshot.val();
      var temp=[];
      var tim=[];
       var jump=[];
      var a,b,c,d;
 ref.on("child_changed", function(newPost,pre){
      var pair=[];
     data.push(newPost.val());
      tim=newPost.val().Time;
 if(tim!=undefined){
      if(ti[0]==null){
          ti.push(tim);}}

 if(temp[0]==null)
  temp.push(newPost.val().Latitude);
  if(temp[0]==undefined && temp[0]==null)
    temp.pop();
  if(temp[1]==null)
  temp.push(newPost.val().Longitude);
  if(temp[1]==undefined && temp[1]==null)
    temp.pop();
 temp.push(newPost.val().Time);
 temp.push(newPost.val().Address);
 temp.push(newPost.key);
         if(pair[0]==null)
            pair.push(temp);
            air=pair;
            

      });
  });

//

//
var x=[];
function json(){
   x=[];
  data.forEach(function (element){
    var count=0;
    data.forEach(function (e){
      if(element.Address==e.Address)
        count++;
      if(count==1){var pa=1;

        x.forEach(function(f){
          if(f.Address==element.Address){
              pa=0;}
        })
        if(pa==1){
          x.push(element);
          console.log("original"+x);
        }
      }
    })
  })
}

setTimeout(json,4000);
function ui(){
  var duplicate=[];
  console.log("x "+ x.length);
  x.forEach(function (d){
    
      if(d.count>=1){
        duplicate.push(d);
      }
})
  console.log(duplicate);
}

setTimeout(ui,5000);

//listing areas and its count
var area=[];
var ria=[];
var fox=1;

var lairs=[];
 
function datesandcount1(){
ria=[];
lairs=[];
var i=0;
var j=0;
var k=0;
var l=0;
var SanJose=[];
 var SantaClara=[];
 var Sunnyvale=[];
 var Milpitas=[];
  ref.orderByChild("Longitude"+"Latitude").on("child_added", function(snapshot) {
  var krish=[];
  
  krish.push(snapshot.val().Latitude);
  krish.push(snapshot.val().Longitude);
  krish.push(snapshot.val().Time);
  krish.push(snapshot.val().Address);
  krish.push(snapshot.key);
  lairs.push(krish);
})

lairs.forEach(function(first){
  console.log("krishnatejaare is a very good");
  var String=first[3];
  console.log("string is"+String);
 // var list=["Sunnyvale","San Jose","Cupertino", "Milpitas","Palo Alto","Mountain View","Fremont","Campbell","Union City"];
  var list=["Santa Clara","San Jose","Sunnyvale","Milpitas"];
  list.forEach(function(e){
    var swift=String.search(e);
    if(swift!=-1)
      {
        if(e=="San Jose"){
          i++;
      }
      if(e=="Santa Clara"){
          j++;    
      }
      if(e=="Sunnyvale"){
          k++;
      }
      if(e=="Milpitas"){
          l++;    
      }
        
      }
  })

  // fox++;  
});
SanJose.push("San Jose");
  SanJose.push(i);
  SantaClara.push("Santa Clara");
  SantaClara.push(j);
  Sunnyvale.push("Sunnyvale");
  Sunnyvale.push(k);
  Milpitas.push("Milpitas");
  Milpitas.push(l);
  ria.push(SanJose);
  ria.push(SantaClara);
  ria.push(Sunnyvale);
  ria.push(Milpitas);

  console.log(i);
console.log(SanJose);
console.log(ria);
}
//setTimeout(datesandcount1,5000);

//listing the differenct dates and their respective incident count

var date=[];
var bigdata=[];

function datesandcount(){
  var chairs=[];
ref.orderByChild("Longitude"+"Latitude").on("child_added", function(snapshot) {
  var krishna=[];
  bigdata.push(snapshot.val());
  krishna.push(snapshot.val().Latitude);
  krishna.push(snapshot.val().Longitude);
  krishna.push(snapshot.val().Time);
  krishna.push(snapshot.val().Address);
  krishna.push(snapshot.key);
  chairs.push(krishna);
  

});
  date=[];
   pairs=pairs.concat(air);

   air=[];
  var i=0;
 var kri=[];
 kri.push(chairs[0]);
  if(chairs[0]==chairs[1])
  var count=0;
  var pemp=[];
   var counts=[];
   var bool=1;
   var checkcount=[];   
chairs.forEach(function(first){
  var count=0;
  var bool=1;
  var check=0;
  var hashmaparray=[];
  var ids=[];
  chairs.forEach(function(second){
    if(first[2]==second[2])
    {   ids.push(second[4]);

      check++;
        if(pemp[0]!=undefined)
          {
            pemp.forEach(function(third){
            if(first[2]==third[2]) 
              {
                bool=0;
              }              
            });
          }
          if(bool==1)
          {
            pemp.push(first);    
          }  
  }
 count=count+1;
 
 });
  checkcount.push(check);
  var print=1;
  var prit=1;
bigdata.forEach(function (element){
  
  if(element.Time==first[2])
    //if(element.count==null){
   { element.id=first[4];
    element.count=check;
    element.list=ids;
  }
   // console.log(element);
    //}
})
  
  date.forEach(function(hash)
  {
      hash.forEach(function(bash)
    {
      if(first[2]==bash[2])
      {
       print=0; 
      }
    });
  });

  if(print==1)
    { 
      //console.log(data);
      first.push(check);
      first.push(ids);
      hashmaparray.push(first);
      date.push(hashmaparray);
    } 
});
console.log("krishna teja");

//console.log(data);
date.forEach(function(e){
  e.forEach(function (element){
  var exchange;
  exchange=element[0];
 // console.log(exchange);
  element[0]=element[2];
  element[2]=exchange;
  //console.log("exchange");
  //console.log(element);
  //e[0]=e[2];
  //[2]=exchange;
 // console.log(e);
})
})
date.sort();

for(var i=0;i<date.length;i++){
  console.log("datearray is")
       console.log(date[i]);
      
    }
}
setTimeout(datesandcount,4000);
//listing the different places and its count
var final=[];
var Zeta=[];

function filter1(){
  var hairs=[];
ref.orderByChild("Longitude"+"Latitude").on("child_added", function(snapshot) {
  var krishna=[];
  
  krishna.push(snapshot.val().Latitude);
  krishna.push(snapshot.val().Longitude);
  krishna.push(snapshot.val().Time);
  krishna.push(snapshot.val().Address);
  krishna.push(snapshot.key);
  hairs.push(krishna);
  

});

  var i=0;
 var kri=[];
 kri.push(hairs[0]);
  if(hairs[0]==hairs[1])
  var count=0;
  var pemp=[];
   var counts=[];
   var bool=1;
   var checkcount=[];   
hairs.forEach(function(first){
  var count=0;
  var bool=1;
  var check=0;
  var hashmaparray=[];
  var ids=[];
  hairs.forEach(function(second){
    if(first[3]==second[3])
    {   ids.push(second[4]);

      check++;
        if(pemp[0]!=undefined)
          {
            pemp.forEach(function(third){
            if(first[3]==third[3]) 
              {
                bool=0;
              }              
            });
          }
          if(bool==1)
          {
            pemp.push(first);    
          }  
  }
 count=count+1;
 
 });
  checkcount.push(check);
  var print=1;
  var prit=1;
data.forEach(function (element){
  
  if(element.Address==first[3])
    //if(element.count==null){
   {var str = element.Address;
    var x=str.search(",");
     var sub=str.substring(x+2);
     var supersub=sub.search(",");
     var result=sub.substring(0,supersub); 
    element.id=first[4];
    element.count=check;
    element.list=ids;
    element.city=result;
  }
   // console.log(element);
    //}
})
  
  final.forEach(function(hash)
  {
      hash.forEach(function(bash)
    {
      if(first[3]==bash[3])
      {
       print=0; 
      }
    });
  });

  if(print==1)
    { 
      //console.log(data);
      first.push(check);
      first.push(ids);
      hashmaparray.push(first);
      final.push(hashmaparray);
    } 
});
console.log("krishna teja");
//console.log(data);

for(var i=0;i<final.length;i++){
       //console.log(final[i]);
      
    }
}
setTimeout(filter1,4000);

//listing only duplicates//
function filter(){
  var i=0;
  var count=0;
  var pemp=[];
   var bool=1;
pairs.forEach(function(first)
{
  var count=0;
  var bool=1;
  var check=0;
  pairs.forEach(function(second)
  {
    if(first[3]==second[3])
    {
        check++;
        if(check>1)
        { 
          if(pemp[0]!=undefined)
          {
            pemp.forEach(function(third)
            {
            
            if(first[3]==third[3]) 
              {
                bool=0;
              }
            });
          }
          if(bool==1)
          {
            pemp.push(first);   
          }
       }    
  }
 count=count+1;
 });
  

});
for(var i=0;i<pemp.length;i++){
        //console.log(pemp[i]);
    }
}
setTimeout(filter,2000);

function pr(){
    for(var i=0;i<air.length;i++){
       // console.log(air[i]);
    }
    //console.log(air.length);
}
 
function pri(){
    for(var i=0;i<pairs.length;i++){
        //console.log(pairs[i]);
    }
   // console.log(pairs.length);
   
}

setTimeout(pri, 2000);

app.get('/',function(req,res){
  res.render('pages/about.ejs',{val:final,data:x});
});


app.get('/charts',function(req,res){
   filter1();
   json();
//ria=[];
   datesandcount();
datesandcount1();
  res.render('pages/charts.ejs',{val:x,date:date,bod:ria});
});

app.get('/ListView',function(req,res){
   filter1();
   json();
  // datesandcount();
   console.log("date after loading");
   console.log(date);
  res.render('pages/listview.ejs',{val:final});
});

app.get('/listviewData',function(req,res){
  //console.log("length"+data.length);
  filter1();
   json();
   console.log("values of x after loading  "+x);
  res.send({data:x});
})

app.get('/MapView',function(req,res){
//   i=1;
//   i++;
// time=time.concat(ti);
// console.log("before pairs concatenation");
// console.log(debug.length);
// console.log(debug);
// console.log("air is ");
// console.log(air.length);
// console.log(air);
//   pairs=pairs.concat(air);
//  // debug=debug.concat(air);
//   air=[];
//   for(var i=0;i<pairs.length;i++){
//     console.log("pairs is ")
//         console.log(pairs[i]);
//     }
    
// console.log(pairs.length);
debug=[];

ref.orderByChild("Longitude"+"Latitude").on("child_added", function(snapshot) {
  var temp=[];
  debug.push(snapshot.val());
  
});
 res.render('pages/index.ejs',{val:debug});
  
});

app.get('/timemapview',function(req,res){
time=time.concat(ti);
  pairs=pairs.concat(air);
  for(var i=0;i<pairs.length;i++){
        console.log(pairs[i]);
    }
 res.render('pages/timemapview.ejs',{val:pairs,time:time});
});

app.get('/email',function(req,res){
    // Not the movie transporter!
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'arekrishnateja@gmail.com', // Your email id
            pass: 'Krish123rayalu' // Your password
        }
    });
    var text = 'Hello world from \n\n';

    var mailOptions = {
    from: 'arekrishnateja@gmail.com', // sender address
    to: 'krishnateja.are@sjsu.edu', // list of receivers
    subject: 'Email Example', // Subject line
    text: text //, // plaintext body
    // html: '<b>Hello world ✔</b>' // You can choose to send an HTML body instead
};
transporter.sendMail(mailOptions, function(error, info){
    if(error){
        console.log(error);
        res.json({yo: 'error'});
    }else{
        console.log('Message sent: ' + info.response);
        res.json({yo: info.response});
    };
});

});

app.post('/email',function(req,res){
    // Not the movie transporter!
    console.log(req.body);
    var json=JSON.stringify(req.body);
    console.log(json);
    var transporter = nodemailer.createTransport({
        service: 'Gmail',
        auth: {
            user: 'arekrishnateja@gmail.com', // Your email id
            pass: 'Krish123rayalu' // Your password
        }
    });
    var text = "The payment paid is "+req.body.Payment+". "+"\n"+"The Payment Id is "+req.body.PaymentId+"."+"\n"+"The payment status is "+req.body.PaymentStatus+". "+"\n"+"The Total Item Count is "+req.body.ItemCount+"."+"\n"+"Name is "+req.body.Name+". "+"\n"+"Address is "+req.body.Address+"."+"\n"+"Phone Number is "+req.body.PhoneNumber+". "+"\n"+"The Pick up Date is "+req.body.Date+"."+"\n"+"Pick Up Time is "+req.body.Time+".";

    console.log(text);
    var mailOptions = {
    from: 'arekrishnateja@gmail.com', // sender address
    to: req.body.Email,// list of receivers
    subject: 'Payment Confirmation', // Subject line
    text:text
};
transporter.sendMail(mailOptions, function(error, info){
    if(error){
        console.log(error);
        res.json({yo: 'error'});
    }else{
        console.log('Message sent: ' + info.response);
        res.json({yo: info.response});
    };
});
});
app.listen(process.env.PORT || 8080);
console.log('8080 is the magic port');