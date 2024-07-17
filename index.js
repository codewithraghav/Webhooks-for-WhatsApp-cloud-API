const express=require("express");
const body_parser=require("body-parser");
const axios=require("axios");
require('dotenv').config();

const app=express().use(body_parser.json());

const token=process.env.TOKEN;
const mytoken=process.env.MYTOKEN;//prasath_token

app.listen(process.env.PORT,()=>{
    console.log("webhook is listening");
});

//to verify the callback url from dashboard side - cloud api side
app.get("/webhook",(req,res)=>{
   let mode=req.query["hub.mode"];
   let challange=req.query["hub.challenge"];
   let token=req.query["hub.verify_token"];


    if(mode && token){

        if(mode==="subscribe" && token===mytoken){
            res.status(200).send(challange);
        }else{
            res.status(403);
        }

    }

});

app.post("/webhook",(req,res)=>{ //i want some 

    let body_param=req.body;

    console.log(JSON.stringify(body_param,null,2));

    if(body_param.object){
        console.log("inside body param");
        if(body_param.entry && 
            body_param.entry[0].changes && 
            body_param.entry[0].changes[0].value.messages && 
            body_param.entry[0].changes[0].value.messages[0]  
            ){
               let phon_no_id=body_param.entry[0].changes[0].value.metadata.phone_number_id;
               let from = body_param.entry[0].changes[0].value.messages[0].from; 
               let sel_id='';
               let msg_body='';
               let msg_type=body_param.entry[0].changes[0].value.messages[0].type;
                let randomtoken='';
                console.log(msg_type);

                if(msg_type=='text'){

                   
                     msg_body = body_param.entry[0].changes[0].value.messages[0].text.body;
                     console.log("text:"+msg_body);
                }



                if(msg_type=='interactive')
                {
                    let user_reply=body_param.entry[0].changes[0].value.messages[0].interactive.list_reply.title;
                    sel_id=body_param.entry[0].changes[0].value.messages[0].interactive.list_reply.id;
                    msg_body=user_reply;
                    console.log("reply:"+msg_body);
                }

            

               let msg_id =  body_param.entry[0].changes[0].value.messages[0].id; 




             
               console.log("phone number "+phon_no_id);
               console.log("from "+from);
            //   console.log("boady param "+msg_body);


           


//https://app.primlyapp.com/?productname=test&appname=test&fromphone=1&fromphoneid=1&tophone=1&msgid=1&msgbody=1&msgdate=1

            axios({
                method:"POST",
                url:"https://app.primlyapp.com/?productname=whatsapp&appname=fresh-menu&fromphone="+from+"&msg="+encodeURIComponent(msg_body)+"&fromphoneid="+phon_no_id+"&msgid="+msg_id+"&selid="+sel_id+"&msgtype="+msg_type,
                data:{
                   from:from,
                },
                headers:{
                    "Content-Type":"application/json"
                }

            }).then(function (response) {
                randomtoken=response.data
                console.log('axios12'+response.data);
               


              })
              .catch(function (error) {
                console.log(error);
              });


              axios({
                method:"POST",
                url:"https://graph.facebook.com/v13.0/"+phon_no_id+"/messages?access_token="+token,
                data:{
                    messaging_product:"whatsapp",
                    to:"+919921232400",
                    text:{
                        body:"quick message ? link https://dstaevents.in/demo/waitems.php?token="+randomtoken
                    }
                },
                headers:{
                    "Content-Type":"application/json"
                }

            });

               



               /* var bodyFormData = new FormData();

                bodyFormData.append('msg', msg_body);

                axios({
                    method: "post",
                    url: "https://dstaevents.in/demo/app/test.php",
                    data: bodyFormData,
                    headers: { "Content-Type": "multipart/form-data" },
                  })
                    .then(function (response) {
                      //handle success
                      console.log('response is');
                      console.log(response);
                    })
                    .catch(function (response) {
                      //handle error
                      console.log('error is');
                      console.log(response);
                    });
               */

               res.sendStatus(200);
            }else{
                res.sendStatus(404);
            }

    }

});

app.get("/",(req,res)=>{
    res.status(200).send("Welcome to PrimlyApp webhook. Added encodeURIComponent");
});