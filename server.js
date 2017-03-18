var express=require('express');
var path=require('path');
var MarkerClusterer = require('node-js-marker-clusterer');

var ejs=require('ejs');
var engine=require('ejs-mate');


var app=express();
app.use(express.static(path.join(__dirname, 'public')));
app.use('/MarkerClusterer',express.static(__dirname+'/node_modules/node-js-marker-clusterer/src'));

app.engine('ejs', engine);
app.set('view engine', 'ejs');

var admin=require('firebase-admin');


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
var lat=[],log=[];
var pairs=[];
var time=[];
var x=1;

ref.orderByChild("Longitude"+"Latitude").on("child_added", function(snapshot) {
  //ref.on("child_changed", function(snapshot) {
  var temp=[];
  //console.log(x++);
  //console.log("---"+ snapshot.val().Latitude+"---"+snapshot.val().Longitude);
  temp.push(snapshot.val().Latitude);
  temp.push(snapshot.val().Longitude);
  temp.push(snapshot.val().Time);
  temp.push(snapshot.val().Address);

  var location1={};
    //if(snapshot.val().Latitude!=undefined)
      location1.latitude=snapshot.val().Latitude;
    //if(snapshot.val().Longitude!=undefined)
      location1.longitude=snapshot.val().Longitude;
   // if(snapshot.val().Time!=undefined)
      location1.time=snapshot.val().Time;
   // if(snapshot.val().Address!=undefined)
      location1.address=snapshot.val().Address;

  
  console.log("location"+location1.latitude);
  var latitudearray=snapshot.val().Latitude;
  var longitudearray=snapshot.val().Longitude;

  var timearray=snapshot.val().Time;
  if(timearray!=undefined)
  time.push(timearray);
 //console.log(time);
  //console.log(time.length);

  lat.push(latitudearray);
  log.push(longitudearray);
  //console.log(snapshot.val());
  if(temp[0]!=undefined && temp[1]!=undefined)
  pairs.push(temp);
 

});



var air=[];
var ti=[];

ref.on("value", function(snapshot) {
      var newPost = snapshot.val();
     // console.log(newPost);
var temp=[];
var tim=[];

 ref.on("child_changed", function(newPost,pre){
  var pair=[];
           
tim=newPost.val().Time;
 if(tim!=undefined){
      if(ti[0]==null){
          ti.push(tim);}}
        //console.log(ti);
 if(temp[0]==null)
  temp.push(newPost.val().Latitude);
  if(temp[0]==undefined && temp[0]==null)
  
    temp.pop();
  if(temp[1]==null)
  temp.push(newPost.val().Longitude);

  if(temp[1]==undefined && temp[1]==null)
    temp.pop();
 //console.log(temp);
 temp.push(newPost.val().Time);
 temp.push(newPost.val().Address);
         if(pair[0]==null)
          //if(temp[0]==null && temp[1]==null)
            pair.push(temp);
            air=pair;

            //pr();
      });
      
  });
// function filter(){
//   var i=0;
//   pairs=[1,2,3,4,2,3,4,5,6,6];
//  //console.log(pairs[0]);
//  var kri=[];
//  kri.push(pairs[0]);
//  //console.log(kri[0]);
//   //console.log(pairs[1]);
//   //console.log("krishna");
//   if(pairs[0]==pairs[1])
//     console.log(pairs[0]);
//   var count=0;
//   var pemp=[];
//    var counts=[];
//    var bool=1;
// for(i=0;i<pairs.length;i++){
//   var count=0;

//   for(var j=i+1;j<pairs.length;j++)
//   {
    
//     if(pairs[i]==pairs[j])
//     {
      
//         if(count==0)
//         {
          
//           if(pemp[0]!=undefined)
//           {
            
//             for(var z=0;z<pemp.length;z++)
//             {
             
//             if(pairs[i]==pemp[z]) 
//               {
//                 bool=0;
//               console.log("bye");
//               }
//               else
//                 bool=1
//             }
//           }
//           if(bool==1)
//           {
//             pemp.push(pairs[i]);
      
//               count++;
//           }
//        }

     
//   }
//   counts.push(count);
//   count=0;
//  }
// }
// for(var i=0;i<pemp.length;i++){

//         console.log(pemp[i]);
//     }

//  //console.log(pairs[i]);

// }
// setTimeout(filter,2000);


//listing all the values only exactly once.


function filter1(){
  var i=0;
  //console.log("krishna");
 //console.log(pairs[0]);
 var kri=[];
 kri.push(pairs[0]);
 //console.log(kri[0]);
  //console.log(pairs[1]);
  //console.log(pairs[0]);
  if(pairs[0]==pairs[1])
    //console.log(pairs[0]);
  var count=0;
  var pemp=[];
   var counts=[];
   var bool=1;
   var checkcount=[];
   var final=[];
pairs.forEach(function(first){
  var count=0;
  var bool=1;
  var check=0;
  var hashmaparray=[];
 //console.log("first" +first[3]);

  pairs.forEach(function(second){
    //console.log(count);
    //console.log("second"+second[3]);
    if(first[3]==second[3])
    {   check++;
      console.log("equals");
      
        //if(count>0)
        //{
         // console.log("count");
          
          if(pemp[0]!=undefined)
          {
            //console.log("passed undefined")
            
            
            pemp.forEach(function(third){
            
            if(first[3]==third[3]) 
              {
                //console.log("passed equal undefined");
                bool=0;
              //console.log("bye");
              }
               

              
            });
          }
          if(bool==1)
          {
            //console.log("bool");
            pemp.push(first);
            //console.log(pemp);
      
              
          }
      // }
      

     
  }
 count=count+1;
 });

  checkcount.push(check);




});
for(var i=0;i<pemp.length;i++){

       // console.log(pemp[i]);
    }

  


 //console.log(pairs[i]);

}
setTimeout(filter1,2000);


//listing only duplicates//
function filter(){
  var i=0;
  
 //console.log(pairs[0]);
 var kri=[];
 kri.push(pairs[0]);
 //console.log(kri[0]);
  //console.log(pairs[1]);
  //console.log(pairs[0]);
  if(pairs[0]==pairs[1])
    //console.log(pairs[0]);
  var count=0;
  var pemp=[];
   var counts=[];
   var bool=1;
   var checkcount=[];
pairs.forEach(function(first){
  var count=0;
  var bool=1;
  var check=0;
 //console.log("first" +first[3]);

  pairs.forEach(function(second){
   // console.log(count);
    //console.log("second"+second[3]);
    if(first[3]==second[3])
    {
      check++;
      //console.log("equals");
      
        if(check>1)
        {
          //console.log("count");
          
          if(pemp[0]!=undefined)
          {
            //console.log("passed undefined")
            
            
            pemp.forEach(function(third){
            
            if(first[3]==third[3]) 
              {
                //console.log("passed equal undefined");
                bool=0;
              //console.log("bye");
              }
               

              
            });
          }
          if(bool==1)
          {
            //console.log("bool");
            pemp.push(first);

            //console.log(pemp);
      
              
          }
       }
      

     
  }
 count=count+1;
 });
  checkcount.push(check);

});
for(var i=0;i<pemp.length;i++){

        //console.log(pemp[i]);
    }
for(var i=0;i<checkcount.length;i++){

        //console.log(checkcount[i]);

    }
    
 //console.log(pairs[i]);

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
	res.render('pages/about.ejs');
});

app.get('/a',function(req,res){
  res.render('pages/timemapview.ejs');
});

app.get('/MapView',function(req,res){
  i=1;
  console.log("value"+i);
  i++;

  console.log(pairs.length);
time=time.concat(ti);
console.log(air.length);
  pairs=pairs.concat(air);
  air=[];
  
  for(var i=0;i<pairs.length;i++){
        console.log(pairs[i]);
    }
    
console.log(pairs.length);

 //res.render('pages/index.ejs',{val:pairs,time:time});
 res.render('pages/index.ejs',{val:pairs});
  
});

app.get('/timemapview',function(req,res){
time=time.concat(ti);

  pairs=pairs.concat(air);
  
  for(var i=0;i<pairs.length;i++){
        console.log(pairs[i]);
    }
    

 res.render('pages/timemapview.ejs',{val:pairs,time:time});
});




app.listen(8080);
console.log('8080 is the magic port');