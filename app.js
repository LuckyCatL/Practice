// 引入express模块
var express = require("express");
var sha1 = require("sha1");//sha1加密
var xml2js = require('xml2js');
var bodyParser = require ('body-parser');//消息体解析中间件
var https = require('https');
var fs = require('fs');
var request = require('request')
var cheerio = require('cheerio')//爬取
var urlencode = require('urlencode');//网址解码
var md5 = require('md5')//md5加密
var async = require('async');//同步模块
// var wx = require('http://res.wx.qq.com/open/js/jweixin-1.6.0.js')
var app = express();
var xmlParser = new xml2js.Parser();
var builder = new xml2js.Builder();
// var xmlParser = new xml2js.Parser();

app.use(bodyParser.text({type: 'text/xml'}));
app.use(express.json());

var config = {
    "appID": "xxxxxxxx",
    "appsecret": "xxxxxxxxxx",
    "token": "xxxx",
}
//------------------------------------------验证连接服务器------------------------------------------
app.get("/", (req, res, next)=> {

    // 获取微信服务器发送的数据
    var signature = req.query.signature,
		timestamp = req.query.timestamp,
        nonce = req.query.nonce,
		echostr = req.query.echostr;

	// console.log(signature,timestamp,nonce,echostr,xml)

    // token、timestamp、nonce三个参数进行字典序排序
    var arr = [config.token, timestamp, nonce].sort().join('');
    // sha1加密    
    var result = sha1(arr);
	// console.log(signature)
 //    console.log(result)
    if(result === signature){
        res.send(echostr);
		console.log('成功连接公众号')
    }else{
        res.send('失败');
		// console.log('连接失败')
    }
})

//-----------------------------------------------------------自动回复---------------------------------
var _result;
var resMsg;
app.post("/", (req, res, next)=> {

    // 获取微信服务器发送的数据
    var signature = req.query.signature,
		timestamp = req.query.timestamp,
        nonce = req.query.nonce,
		echostr = req.query.echostr;
		
	var xml = req.body;
	// console.log(xml)
    // token、timestamp、nonce三个参数进行字典序排序
    var arr = [config.token, timestamp, nonce].sort().join('');
	
    // sha1加密    
    var result = sha1(arr);
	
	// var resMsg;
	// _xml = xml.replace(/^\ufeff/i, "")
	// Error: Non-whitespace before first tag. 
	// 错误是在sax模块中抛出来的（xmlreader基于sax），意思是说第一个标签前有非空白符。
	// 我打开文件看了下，没有多余的字符，绝对没有。之后就想到了BOM（对了，我的xml文件编码是UTF-8的），十六进制一看还真是有BOM，去掉BOM之后程序顺利的执行了。
	// 原因找到了，之后我就在将字符串传给xmlreader之前写了如下的一段代码。
	// xml_string = xml_string.replace(/^\ufeff/i, "").replace(/^\ufffe/i, "");
	xmlParser.parseString(xml,function(err,result){
	                                if(err){
										console.log(err)
										return;
									}else{
										_result = result
										// console.log(result.xml.Content[0][0])
										//console.log(result.xml.FromUserName[0])
										// console.log(result.xml.MediaId[0])
										if(result.xml.MsgType[0]=="image"){
											
											resMsg =
												`<xml>
													<ToUserName>${result.xml.FromUserName[0]}</ToUserName>
													<FromUserName>${result.xml.ToUserName[0]}</FromUserName>
													<CreateTime>${parseInt(new Date().valueOf() / 1000)}</CreateTime>
													<MsgType><![CDATA[image]]></MsgType>
													 <Image>
													    <MediaId>${result.xml.MediaId[0]}</MediaId>
													</Image>
												</xml>`
										}else if(result.xml.MsgType[0]=="text" && result.xml.Content[0]=="图片"){
											resMsg =
												`<xml>
													<ToUserName>${result.xml.FromUserName[0]}</ToUserName>
													<FromUserName>${result.xml.ToUserName[0]}</FromUserName>
													<CreateTime>${parseInt(new Date().valueOf() / 1000)}</CreateTime>
													<MsgType><![CDATA[text]]></MsgType>
													<Content><![CDATA[https://wwb.lanzouw.com/b02unkzqh 密码:a0th]]></Content>
												</xml>`
												
										}else if(result.xml.MsgType[0]=="text" && result.xml.Content[0]=="疫情"){
											resMsg =
												`<xml>
													<ToUserName>${result.xml.FromUserName[0]}</ToUserName>
													<FromUserName>${result.xml.ToUserName[0]}</FromUserName>
													<CreateTime>${parseInt(new Date().valueOf() / 1000)}</CreateTime>
													<MsgType><![CDATA[text]]></MsgType>
													<Content><![CDATA[<a href="https://voice.baidu.com/act/newpneumonia/newpneumonia/?from=osari_aladin_banner#tab0">疫情实时查询</a>]]></Content>
												</xml>`
										
										}else if(result.xml.MsgType[0]=="text" && result.xml.Content[0]=="测试"){
											resMsg =
												`<xml>
													<ToUserName>${result.xml.FromUserName[0]}</ToUserName>
													<FromUserName>${result.xml.ToUserName[0]}</FromUserName>
													<CreateTime>${parseInt(new Date().valueOf() / 1000)}</CreateTime>
													<MsgType><![CDATA[text]]></MsgType>
													<Content><![CDATA[<a href="https://tb.ele.me/wow/alsc/mod/3ba3e78bb37a220f352e6799?e=1&open_type=miniapp&inviterId=e8e4896ba2">测试</a>]]></Content>
												</xml>`
										
										}else if(result.xml.MsgType[0]=="text" && result.xml.Content[0]=="每日热点"){
											resMsg =
												`<xml>
													<ToUserName>${result.xml.FromUserName[0]}</ToUserName>
													<FromUserName>${result.xml.ToUserName[0]}</FromUserName>
													<CreateTime>${parseInt(new Date().valueOf() / 1000)}</CreateTime>
													<MsgType><![CDATA[text]]></MsgType>
													<Content><![CDATA[<a href="https://api.qqsuu.cn/api/60s">点击查看</a>]]></Content>
												</xml>`
										
										
										}else if(result.xml.MsgType[0]=="text" && result.xml.Content[0]=="LOL换肤"){
											resMsg =
												`<xml>
													<ToUserName>${result.xml.FromUserName[0]}</ToUserName>
													<FromUserName>${result.xml.ToUserName[0]}</FromUserName>
													<CreateTime>${parseInt(new Date().valueOf() / 1000)}</CreateTime>
													<MsgType><![CDATA[text]]></MsgType>
													<Content><![CDATA[<a href="https://luckycat.iuo.ink/?p=127">LuckyCat的个人博客|密码：LukcyCat</a>]]></Content>
												</xml>`
										
																		
										}else if(result.xml.MsgType[0]=="text" && result.xml.Content[0]=="打卡日志" && result.xml.FromUserName[0] == "o2agC6YJ-6GBSoBBh_KSn-3MK9CY"){
											chalog()
											
										}else if(result.xml.MsgType[0]=="text" && result.xml.Content[0]=="每日一言"){
											yiyan()
																			
										}else if(result.xml.MsgType[0]=="event" && result.xml.Event[0]=="subscribe"){
											resMsg = 
												`<xml>
													<ToUserName>${result.xml.FromUserName[0]}</ToUserName>
													<FromUserName>${result.xml.ToUserName[0]}</FromUserName>
													<CreateTime>${parseInt(new Date().valueOf() / 1000)}</CreateTime>
													<MsgType><![CDATA[text]]></MsgType>
													<Content><![CDATA[
感谢关注！啊~q(≧▽≦q)
-----------------------------------------
查询梗知识：
回复“!+关键词”就可以查梗知识了！( •̀ ω •́ )✧
例如：“!芜湖起飞”（感叹号一定要是英文感叹号哦）
-----------------------------------------
文本翻译：
回复“#+翻译类型+#+翻译内容”就可以翻译语句了
例如：“#zh#this is a apple”
*zh-中文；
 en-英文
 yue-粤语
 wyw-文言文
 jp-日语
 cht-繁体中文
 。。。。。
----------------------------------------
每日一言：
回复“每日一言”就可以收到一句话啦！O(∩_∩)O
----------------------------------------
发送后要耐心等待（重要！大概4~5秒回复）
感谢支持！啊~(o゜▽゜)o☆
我的个人博客：
	https://luckycat.ink
----------------------------------------

													]]></Content>
												</xml>`
										}else if(result.xml.MsgType[0]=="text" && result.xml.Content[0][0]=='!'){
												var aaa = result.xml.Content[0]
												CX = aaa.split('!')
												chageng();
												// async.series([ggg,fff],function(err,result){
												// 	if(err){
												// 		console.log(err)
												// 	}else{
												// 		console.log(result)
												// 	}
												// })
												
												// console.log(resMsg)
										}else if(result.xml.MsgType[0]=="text"&&result.xml.Content[0][0]=='#'){
											var bbb = result.xml.Content[0]
											yuyan.q=bbb.split('#')[2]
											yuyan.to=bbb.split('#')[1]
											wbfy(yuyan);
											// setTimeout(function(){
											// 	console.log(yuyan)
											// },4000)
											
											// resMsg=
											// 	`<xml>
											// 		<ToUserName>${result.xml.FromUserName[0]}</ToUserName>
											// 		<FromUserName>${result.xml.ToUserName[0]}</FromUserName>
											// 		<CreateTime>${parseInt(new Date().valueOf() / 1000)}</CreateTime>
											// 		<MsgType><![CDATA[text]]></MsgType>
											// 		<Content>${result.xml.Content[0]}</Content>
											// 	</xml>`		
										}else{
											resMsg =
												`<xml>
													<ToUserName>${result.xml.FromUserName[0]}</ToUserName>
													<FromUserName>${result.xml.ToUserName[0]}</FromUserName>
													<CreateTime>${parseInt(new Date().valueOf() / 1000)}</CreateTime>
													<MsgType><![CDATA[image]]></MsgType>
													<Image>
													    <MediaId><![CDATA[DXLtbjjvfZ6EiAjAGtXNj-22a1V1ScF4UEwKXgrmvTihNWekiB6FDfv9t1nq4dCw]]></MediaId>
													</Image>
												</xml>`
										}
									}
	                            });
	
	if(result === signature){
	    res.writeHead(200, {'Content-Type': 'application/xml'});
		// setItem(config.token);
		
		if(_result.xml.MsgType[0]=="text" &&(_result.xml.Content[0][0]=="!"||_result.xml.Content[0][0]=="#")){
			setTimeout(function(){
				res.end(resMsg)
			},3000)
		}else if(_result.xml.MsgType[0]=="text" &&((_result.xml.Content[0]=="打卡日志" && _result.xml.FromUserName[0]=="o2agC6YJ-6GBSoBBh_KSn-3MK9CY")||_result.xml.Content[0]=="每日一言")){
			setTimeout(function(){
				res.end(resMsg)
			},1000)
		}else{
			res.end(resMsg)
		}
		// console.log('成功连接公众号')
	}else{
	    res.send('失败');
	}
	
 //    function fasong(){
	// 	if(result === signature){
	// 	    res.writeHead(200, {'Content-Type': 'application/xml'});
	// 		// if(_result.xml.MsgType[0]=="text" &&(_result.xml.Content[0][0]=="!"||_result.xml.Content[0][0]=="#")){
	// 		// 	setTimeout(function(){
	// 		// 		res.end(resMsg)
	// 		// 	},3000)
	// 		// }else{
	// 			res.end(resMsg)
	// 		// }
	// 	}else{
	// 	    res.send('失败');
	// 	}
	// 	callback(null)
	// }

	// var aaa = builder.buildObject(obj);
		
})
//-------------------------------------------------------------------------------------------------------------------------
app.get('/MP_verify_PTUbmdJHG5CbzO9P.txt', function(req, res) {                           
    fs.readFile('/opt/wx_public/MP_verify_PTUbmdJHG5CbzO9P.txt', 'utf8', function(err, data){
        if(err){
			console.log(err)
		}else{
		res.end(data)
		}
    });

});
//--------------------------------------------------动态获取token-----------------------------------------------------------
const access={
	access_token:"",
	expires_in:""
}
function gettoken(){
var url='https://api.weixin.qq.com/cgi-bin/token?grant_type=client_credential&appid=wx98d760a52c44edd1&secret=d8be752e02e4a5dab21f0f627d7f7598'
https.get(url,function(res){
	let body="";
	res.on('data', function(data) {
		body+=data
		// body.push(data);
	});
	
	res.on('end', function() {
		var da = JSON.parse(body)
		access.access_token=da.access_token
		access.expires_in = da.expires_in
		// console.log(access)
	});
})
}
//------------------------------------------------------------------动态获取jsapi_ticket------------------------------------------------------------
const jsapi={
	ticket:"",
	expires_in:""
}
const jsapi_ticket=""
function getjs(){
var urll='https://api.weixin.qq.com/cgi-bin/ticket/getticket?access_token='+access.access_token+'&type=jsapi'
https.get(urll,function(res){
		let body="";
	res.on('data', function(data) {
		body+=data
	});
	
	res.on('end', function() {
		var js = JSON.parse(body)
		// console.log(js)
		if(js.errcode=="41001"){
			gettoken()
			getjs()
		}else{
			jsapi.ticket=js.ticket
			jsapi.expires_in=js.expires_in
			
			console.log(jsapi)
		}
	});
})
}
//--------------------------------------------------------------------------------------------------------------------------------
// function(){
// wx.config({
//   debug: true, // 开启调试模式,调用的所有api的返回值会在客户端alert出来，若要查看传入的参数，可以在pc端打开，参数信息会通过log打出，仅在pc端时才会打印。
//   appId: 'wx98d760a52c44edd1', // 必填，公众号的唯一标识
//   timestamp: , // 必填，生成签名的时间戳
//   nonceStr: '', // 必填，生成签名的随机串
//   signature: '',// 必填，签名
//   jsApiList: [] // 必填，需要使用的JS接口列表
// });
// }
//----------------------------------------------------------前端查看token-----------------------------------------------------------
// app.get('/access_token.txt', function(req, res) {                           
//     fs.readFile('../../wx_public/access_token.txt', 'utf8', function(err, data){
//         res.end(data)
//     });

// });
//--------------------------------------------------------------公众号自定义菜单（个人公众号用不了）-------------------------------------------------------
// var btn = {
//             "button": [{
//                     "type": "click",
//                     "name": "小玩具",
//                     "key": "V1001_TODAY_MUSIC"
//                 }]
//         }

// function setItem(token){
// 	let con={
// 		url:'https://api.weixin.qq.com/cgi-bin/menu/create?access_token'+token
// 		form:JSON.stringify(btn)
// 	}
// 	app.post(con,function(err,result){
// 		if(err){
// 			console.log(err)
// 		}else{
// 			console.log(result)
// 		}
// 	})
// }
//-----------------------------------------------------------------爬取某些网址（小鸡词典）----------------------------------------------------
var CX=''
// var JG=''
function chageng(){
var _CX=urlencode(CX)
var url2 = 'https://jikipedia.com/search?phrase='+_CX
// console.log(url)
request(url2,function(err,res,body){
	// console.log(body)
	var $ = cheerio.load(body)
	var JG = $('.brax-render').addClass('render').first().text()
	// console.log(JG)
	// console.log(JG.replace(/\s*/g,""))
	if(JG!=""){
	resMsg=
			`<xml>
				<ToUserName>${_result.xml.FromUserName[0]}</ToUserName>
				<FromUserName>${_result.xml.ToUserName[0]}</FromUserName>
				<CreateTime>${parseInt(new Date().valueOf() / 1000)}</CreateTime>
				<MsgType><![CDATA[text]]></MsgType>
				<Content>${JG}</Content>
			</xml>`
	}else{
	resMsg=
			`<xml>
				<ToUserName>${_result.xml.FromUserName[0]}</ToUserName>
				<FromUserName>${_result.xml.ToUserName[0]}</FromUserName>
				<CreateTime>${parseInt(new Date().valueOf() / 1000)}</CreateTime>
				<MsgType><![CDATA[text]]></MsgType>
				<Content><![CDATA[这个搜索不到啊！
换个词试试吧！(oﾟvﾟ)ノ]]></Content>
			</xml>`
	}
	
})
// callback(null)
}
//-------------------------------------------------------------百度图片翻译api(获取token部分)------------------------------------------------------
// var FYapi={
// 	'grant_type': 'client_credentials',
// 	'client_id': '91a68d965500453ca884dcbfd7f63094',
// 	'client_secret': '320a4348a04a444d9b884f15ee763083'
// }
// var url3 = 'https://aip.baidubce.com/oauth/2.0/token?grant_type=client_credentials&client_id='+FYapi.client_id+'&client_secret='+FYapi.client_secret
// https.get(url3,function(res){
// 	res.pipe(process.stdout);
// 	// 在标准输出中查看运行结果
// })
//----------------------------------------------------------------百度文本翻译api(获取token部分)-------------------------------------------
var PZ={
	'appid':'20220114001055700',
	'secret':'fw0zNGpZqQUUuTCY3aWp',
	'from':'auto'
}

var yuyan={
	'q':'',
	'to':''
}
// var q='自由'
// var to='en'
// var from='auto'
function wbfy(a){
	var salt='ormg'
	var sign = md5(PZ.appid + a.q + salt + PZ.secret);
	var url= 'https://api.fanyi.baidu.com/api/trans/vip/translate?q='+a.q+'&from=auto&to='+a.to+'&appid='+PZ.appid+'&salt='+salt+'&sign='+sign
https.get(url,function(res){
	// res.pipe(process.stdout);
	let body="";
	res.on('data', function(data) {
		body+=data
	});
	
	res.on('end', function() {
		var js = JSON.parse(body)
		// console.log(js.error_msg)
	if(!js.error_msg){
		// console.log(js)
		var JGy=js.trans_result[0].src
		var JG=js.trans_result[0].dst
		if(JG==''){
			resMsg=
					`<xml>
						<ToUserName>${_result.xml.FromUserName[0]}</ToUserName>
						<FromUserName>${_result.xml.ToUserName[0]}</FromUserName>
						<CreateTime>${parseInt(new Date().valueOf() / 1000)}</CreateTime>
						<MsgType><![CDATA[text]]></MsgType>
						<Content><![CDATA[这个翻译不了啊！
换个词试试吧！(oﾟvﾟ)ノ]]></Content>
					</xml>`
		}else{
			resMsg=
					`<xml>
						<ToUserName>${_result.xml.FromUserName[0]}</ToUserName>
						<FromUserName>${_result.xml.ToUserName[0]}</FromUserName>
						<CreateTime>${parseInt(new Date().valueOf() / 1000)}</CreateTime>
						<MsgType><![CDATA[text]]></MsgType>
						<Content>${'原:'+JGy}
${'译:'+JG}</Content>
					</xml>`
			
		}
	}else{
			resMsg=
					`<xml>
						<ToUserName>${_result.xml.FromUserName[0]}</ToUserName>
						<FromUserName>${_result.xml.ToUserName[0]}</FromUserName>
						<CreateTime>${parseInt(new Date().valueOf() / 1000)}</CreateTime>
						<MsgType><![CDATA[text]]></MsgType>
						<Content><![CDATA[出现错误了！
请检查格式或者联系管理员哦！
(っ °Д °;)っ]]></Content>
					</xml>`
	}
	});
})
}

// request(url,function(err,res,body){
// 	console.log(body)
// })
//----------------------------------------------查询打卡日志----------------------------------------------------------------------------------------------
//var rz
function chalog(){
	fs.readFile('log.txt',(err,data)=>{
		if(err){
			console.log(err)
		}else{
			//console.log(data.toString())
			var rizhi=data.toString().split('\n')
			//console.log(rizhi[rizhi.length-1])
			var rz = rizhi[rizhi.length-3]+'\n'+rizhi[rizhi.length-2]+'\n'+rizhi[rizhi.length-1]
			// for(i=rizhi.length-3;i<rizhi.length;i++){
			// 	var rz = rizhi[i]
				//console.log(rz)
			// }
			resMsg=
				`<xml>
					<ToUserName>${_result.xml.FromUserName[0]}</ToUserName>
					<FromUserName>${_result.xml.ToUserName[0]}</FromUserName>
					<CreateTime>${parseInt(new Date().valueOf() / 1000)}</CreateTime>
					<MsgType><![CDATA[text]]></MsgType>
					<Content>${rz}</Content>
				</xml>`
			//console.log(resMsg)
		}
		
	})
}
//--------------------------------------------------------每日一言----------------------------------------------
function yiyan(){
	let leixing = 'a'
	let yiyanurl = 'https://v1.hitokoto.cn/?c='+leixing
	request(yiyanurl,function(err,res,body){
		if(err){
			console.log(err)
		}else{
			// console.log(JSON.parse(body).hitokoto)
			// console.log(JSON.parse(body).from)
			let yiyan = JSON.parse(body)
			//console.log(yiyan)
			resMsg=
				`<xml>
					<ToUserName>${_result.xml.FromUserName[0]}</ToUserName>
					<FromUserName>${_result.xml.ToUserName[0]}</FromUserName>
					<CreateTime>${parseInt(new Date().valueOf() / 1000)}</CreateTime>
					<MsgType><![CDATA[text]]></MsgType>
					<Content>${yiyan.hitokoto}
					
${'From：'+yiyan.from}</Content>
				</xml>`
		}
	})
}
//--------------------------------------------------------------------------------------------------------------------------------------
// 监听80端口
app.listen(80)
console.log("服务启动")
