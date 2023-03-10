//libmain
(function(){

//import fileio
if(typeof fileio!="object"){
if(typeof fileio=="undefined"){
var fileio;
}
let fileio_1=fileio;
if(typeof require=="function"){
fileio_1=require("./libfileio.js");
}
if(typeof fileio_1!="object"){
console.error("error: cannot access or require fileio. libmain@L14");
throw "error: cannot access or require fileio. libmain@L15";
}
fileio=fileio_1;
}

//import oicq
if(typeof oicq!="object"){
if(typeof oicq=="undefined"){
var oicq;
}
let oicq_1=oicq;
if(typeof require=="function"){
oicq_1=require("@vikiboss/oicq");
}
if(typeof oicq_1!="object"){
console.error("error: cannot access or require oicq. libmain@L30");
throw "error: cannot access or require oicq. libmain@L31";
}
oicq=oicq_1;
}

//import libyiyan
if(typeof libyiyan!="object"){
if(typeof libyiyan=="undefined"){
var libyiyan;
}
let libyiyan_1=libyiyan;
if(typeof require=="function"){
libyiyan_1=require("./libyiyan.js");
}
if(typeof libyiyan_1!="object"){
console.error("error: cannot access or require libyiyan. libmain@L47");
throw "error: cannot access or require libyiyan. libmain@L48";
}
libyiyan=libyiyan_1;
}


var libmain={};

libmain.savepath="./savefile.json";

var getsave=function(){
var res=fileio.file_get_contents(libmain.savepath);
if(res===false){
console.warn("warn: cannot get save file. use empty object instead. libmain@L60");
return {};
}
try{
res=JSON.parse(res);
}catch(e){
console.error(e);
console.error("error: cannot parse save file as json object. libmain@L67");
return false;
}
return res;
};

var setsave=function(obj){
try{
obj=JSON.stringify(obj);
}catch(e){
console.error(e);
console.error("error: cannot stringify input as json. libmain@L78");
return false;
}
obj=fileio.file_put_contents(libmain.savepath,obj);
if(obj===false){
console.error("error: cannot write save file. libmain@L83");
return false;
}
return true;
};

libmain.sign=function(uid,gid,reply){
var sf=getsave();
if(sf===false){
reply(oicq.cqcode.at(uid)+" "+"😣💦你干嘛～哈哈～哎哟 file_read_fail libmain@L92");
return;
}
if(!(gid in sf)){
sf[gid]={};
}
var flag_cansign=false;
var flag_newusr=false;
if(!(uid in sf[gid])){
sf[gid][uid]={"scores":0,"continue":0,"lastsign":0,"customTitle":""};
flag_newusr=true;
}
if(!("scores" in sf[gid][uid])){
sf[gid][uid]["scores"]=0;
}
if(!("continue" in sf[gid][uid])){
sf[gid][uid]["continue"]=0;
}
if(!("lastsign" in sf[gid][uid])){
sf[gid][uid]["lastsign"]=0;
}
if(!("customTitle" in sf[gid][uid])){
sf[gid][uid]["customTitle"]="";
}
var todayzero=(new Date().setHours(0,0,0,0))/100000;
if(sf[gid][uid]["lastsign"]<todayzero){
flag_cansign=true;
}
if(!flag_cansign){
libyiyan.get(reply,sf[gid][uid]["customTitle"]+oicq.cqcode.at(uid)+" "+"今天已经签过了\r\n");
return;
}
sf[gid][uid]["lastsign"]=Number((Date.now()/100000).toFixed(0));
sf[gid][uid]["continue"]=Math.max(0,sf[gid][uid]["continue"]);
sf[gid][uid]["continue"]+=1;
var addscore=Math.max(Math.min(sf[gid][uid]["continue"],7),0);
var res=sf[gid][uid]["customTitle"]+oicq.cqcode.at(uid)+" ";
res+="签到成功";
res+="，获得"+addscore+"积分";
if(flag_newusr){
addscore+=20;
res+="，🧧已为你额外加成首签20积分";
}
sf[gid][uid]["scores"]+=addscore;
res+="，🧧连签"+sf[gid][uid]["continue"]+"天🧧";
sf=setsave(sf);
if(sf===false){
reply(oicq.cqcode.at(uid)+" "+"😣💦你干嘛～哈哈～哎哟 file_write_fail libmain@L139");
return;
}
libyiyan.get(reply,res+"\r\n");
return;
};

libmain.myscore=function(uid,gid){
var sf=getsave();
if(sf===false){
return oicq.cqcode.at(uid)+" "+"😣💦你干嘛～哈哈～哎哟 file_read_fail libmain@L149";
}
if(!(gid in sf)||!(uid in sf[gid])){
return oicq.cqcode.at(uid)+" "+"😣💦你干嘛～哈哈～哎哟，先签个到吧 no_such_key libmain@L152";
}
return sf[gid][uid]["customTitle"]+oicq.cqcode.at(uid)+" "+"你当前拥有积分"+sf[gid][uid]["scores"];
};

libmain.group_ranking=function(gid){
var sf=getsave();
if(sf===false){
return oicq.cqcode.at(uid)+" "+"😣💦你干嘛～哈哈～哎哟 file_read_fail libmain@L160";
}
if(!(gid in sf)){
return "😣💦你干嘛～哈哈～哎哟，先签个到吧 no_such_key libmain@L163";
}
var arr=[];
var kl=Object.keys(sf[gid]);
for(var a in kl){
var b={};
b["uin"]=kl[a];
b["scores"]=sf[gid][kl[a]]["scores"];
b["continue"]=sf[gid][kl[a]]["continue"];
b["lastsign"]=sf[gid][kl[a]]["lastsign"];
b["customTitle"]=sf[gid][kl[a]]["customTitle"];
arr.push(b);
}
var res="=== 🎇积分排行榜🎇 ===";
arr.sort(function(a,b){return b["scores"]-a["scores"]});
var todayzero=(new Date().setHours(0,0,0,0))/100000;
for(var a=1;a<=Math.min(10,arr.length);a++){
res+="\r\n🎇第 "+a+" 名：";
res+=arr[a-1]["customTitle"]+oicq.cqcode.at(arr[a-1]["uin"],undefined,true);
res+="🧧共 "+arr[a-1]["scores"]+" 积分";
if(arr[a-1]["lastsign"]>=todayzero){
res+="，连签 "+arr[a-1]["continue"]+" 天";
}
}
return res;
};

libmain.buy=function(uid,gid,name,parm1){

};

libmain.myitem=function(uid,gid){

};

libmain.use=function(uid,gid,name,count){

};


if(typeof window==="object"){
//web browser
window.libmain=libmain;
}else if(typeof global==="object"){
//nodejs
module.exports=libmain;
}
})();