const puppeteer = require('puppeteer');		//模拟浏览器的包
const schedule = require('node-schedule');	//定时任务的包
const fs = require('fs');
 
function daka(){
(async () => {
 const browser = await puppeteer.launch({		//使用puppeteer.launch创建浏览器
	headless: false,
	args: ['--no-sandbox']
	});	
 const page = await browser.newPage();	//创建一个新页面
 console.log(new Date()+'：开始上报')
 await page.goto('https://lnzy.login.timkj.cn/yrsb/dist/index.html?t=1#/form-redirect?p=p&app_id=2&token=eyJkYXRhIjp7InVzZXJfaWQiOjI5ODUwLCJnZW5fdGltZSI6MTY1MjU5MjcyMDg5OSwid29yZCI6IuWkqeeOi~ebluWcsOiZjiJ9LCJrZXkiOiJlSzltVEpxRHBwOWFxZFhGcE1mcXhqdnowak9oMjRNZnNXeEtwaWNiNmFGTzZDZ1BZcnpOckNGaThPd0JhdXFNeklUSFp6Z3RCR2VQS2loV0JPWDFmM1ZCZThCSHhUWjJBWFREckx6TXByeWZaQTlSeEdHbmZyekd2NEpTejBlMjV6NHdzOWxtaTVMK2ZMMStja1FGYkxCY09SaDZ4MUZHcEhmL0tDeDB4bHM9IiwibWQ1IjoiMDJkYjY2ZjFjYmVmZDgyZiJ9&state=LOGIN');
 //await page.goto('https://lnzy.login.timkj.cn/yrsb/dist/index.html?t=1#/form-submit')
 //await page.screenshot({path: 'ccc.png'});
 await page.waitForTimeout(3000);
 // const links = await page.$$("#app > div > div > div > a > div > a");
 await page.click('#app > div > div > div > a > div > a');
 await page.waitForTimeout(3000);
 const links = await page.$$("#app > div > div > div > input");
 await links[0].type('36.5');
 await page.waitForTimeout(10000);
 await page.click('#app > div > div > button')
 await page.waitForTimeout(1000);
 // console.log(links)
 await browser.close();	//关闭浏览器
 await log();
 console.log(new Date()+'：上报完毕')
})();
}

function log(){
	var a = `\n上报记录：${new Date().toLocaleString()}`
	fs.appendFile('log.txt',a, (err) => {
	  if (err) {
	    console.error(err)
	    return
	  }
	  //done!
	})
}

let rule = new schedule.RecurrenceRule();
	//rule.date = [1];//每月1号
	//rule.dayOfWeek = [1,3,5];每周一、周三、周五
	rule.hour = [13]; // 每天6,11,17
	rule.minute = [33]; // 每个小时的第20分钟
	rule.second = 0;//每分钟的0秒执行
	
// 启动任务
let job = schedule.scheduleJob(rule, () => {
  daka();
  //console.log(new Date());
});

//job.cancel();//取消任务