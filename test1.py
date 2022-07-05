from nturl2path import url2pathname
# from pickle import TRUE
import requests
import json
import sqlite3,re,time
from lxml import etree
from pyppeteer import launch
import asyncio
import random
from httpx import AsyncClient
from bs4 import BeautifulSoup

#查询梗api
def get_geng(w:str):
    url='https://api.iyk0.com/gzs/?msg='+w
    headers = {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.146 Safari/537.36'
        }
    t = requests.get(url,headers=headers)
    c = json.loads(t.content)
    num = c['sum']
    result =''
    for i in range(num):
        result = result +str(i+1)+'.'+c['data'][i]['title'] +'\n'
    print(result)
    return result
    
    # return num


#每日60秒
def get_liushi():
    url ='https://api.iyk0.com/60s'
    headers = {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.146 Safari/537.36'
        }
    t = requests.get(url,headers=headers)
    c = json.loads(t.content)
    result = c['imageUrl']
    print(result)









max_page_num = 5      # 最大翻页数
item_per_page = 100   # 每页游戏个数，最大100

def refresh_db():
    for page_num in range(max_page_num):
        print(f'正在刷新{page_num+1}页，共{item_per_page}个游戏')
        page_num *= 100
        webpage = requests.get(
            url=f'https://store.steampowered.com/search/results/?query&start={page_num}&count={item_per_page}&filter=topsellers&supportedlang=schinese',
            headers={'User-Agent':'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/92.0.4515.159 Safari/537.36 Edg/92.0.902.78'}
        ).text
        #print(webpage)
        wp = etree.HTML(webpage) # wp指代初步分析后的webpage
        for num in range(item_per_page):
            num += 1
            raw_released  = wp.xpath(f'//*[@id="search_resultsRows"]/a[{num}]/div[2]/div[2]/text()')
            raw_recommand = wp.xpath(f'//*[@id="search_resultsRows"]/a[{num}]/div[2]/div[3]/span/@data-tooltip-html')
            raw_discount  = wp.xpath(f'//*[@id="search_resultsRows"]/a[{num}]/div[2]/div[4]/div[1]/span/text()')
            rank          = page_num + num
            game_url      = wp.xpath(f'//*[@id="search_resultsRows"]/a[{num}]/@href')[0]
            game_pic      = wp.xpath(f'//*[@id="search_resultsRows"]/a[{num}]/div[1]/img/@src')[0]
            game_name     = wp.xpath(f'//*[@id="search_resultsRows"]/a[{num}]/div[2]/div[1]/span/text()')[0].replace('"', '').replace("'", '')
            price         = wp.xpath(f'//*[@id="search_resultsRows"]/a[{num}]/div[2]/div[4]/div[2]/text()')[-1].replace('¥ ', '').strip()
            released      = '无信息' if raw_released == [] else raw_released[0]
            discount      = '0' if raw_discount == [] else int(raw_discount[0].lstrip('-').rstrip('%'))
            if raw_recommand == []:
                game_review_summary,raw_other_info = ('无信息','0% of the 0 user')
            else:
                raw_recommand_temp = [x for x in raw_recommand[0].split("<br>")]
                game_review_summary,raw_other_info = raw_recommand_temp[0],raw_recommand_temp[1]
            other_info          = [x for x in raw_other_info.split(' ')]
            game_favorable_rate = other_info[0].replace('%', '')
            game_comments_count = str(other_info[3]).replace(',', '')

            print([rank,game_name,price,discount,game_review_summary,game_favorable_rate,game_comments_count,game_url,game_pic,released])
    return f'数据更新于{time.strftime("%Y-%m-%d %H:%M:%S", time.localtime())}'




async def pq():
    browser = await launch(headless=True, dumpio=True,
                           args=['--no-sandbox', '--window-size=1920,1080', '--disable-infobars'])   # 进入有头模式
    page = await browser.newPage()           # 打开新的标签页
    await page.setViewport({'width': 1920, 'height': 5000})      # 页面大小一致
    await page.goto('https://store.steampowered.com/search/?specials=1',{'waitUntil':'load'}) # 访问主页
    # await page.click('#language_pulldown')
    # await page.waitFor(10000)
    # await page.waitForSelector('#language_dropdown > div > a:nth-child(1)')
    # await page.click('#language_dropdown > div > a:nth-child(1)')
    # evaluate()是执行js的方法，js逆向时如果需要在浏览器环境下执行js代码的话可以利用这个方法
    # js为设置webdriver的值，防止网站检测
    await page.evaluate('''() =>{ Object.defineProperties(navigator,{ webdriver:{ get: () => false } }) }''')
    await page.screenshot({'path': './1.jpg'})   # 截图保存路径
    # await page.waitFor(20000)
    #page_text = await page.content()   # 获取网页源码
    # print(page_text)
    # time.sleep(1)



async def lol():
    browser = await launch(headless=True, dumpio=True,
                           args=['--no-sandbox', '--window-size=1920,1080', '--disable-infobars'])   # 进入有头模式
    page = await browser.newPage()           # 打开新的标签页
    await page.setViewport({'width': 1920, 'height': 5000})      # 页面大小一致
    await page.goto('https://www.scoregg.com/schedule',{'waitUntil':'load'}) # 访问主页
    # await page.click('body > div> header > div > div> div > ul > li > span')
    await page.mouse.move(1900, 100)
    # evaluate()是执行js的方法，js逆向时如果需要在浏览器环境下执行js代码的话可以利用这个方法
    # js为设置webdriver的值，防止网站检测
    await page.evaluate('''() =>{ Object.defineProperties(navigator,{ webdriver:{ get: () => false } }) }''')
    await page.screenshot({'path': './1.jpg'})   # 截图保存路径
    #page_text = await page.content()   # 获取网页源码
    # print(page_text)
    # time.sleep(1)',{'waitUntil':'load'}) # 访问主页
    await page.waitFor(20000)
    #page_text = await page.content()   # 获取网页源码
    # print(page_text)
    # time.sleep(1)




#查询百度百科
def bdbk(gjc:str):
    url='https://api.iyk0.com/bk/?msg='+gjc
    headers = {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.146 Safari/537.36'
        }
    t = requests.get(url,headers=headers)
    c = json.loads(t.content)
    print(c['content'])
    # result =''
    # return result
    
    # return num



max_num = 3
magnet_url = "https://clm9.me/search?word=蜘蛛侠"
headers = {
    "cookie":"challenge=a0909810a6d132832e28ef6da18ec77c; ex=1; _ga=GA1.1.326405849.1656734676; _ga_W7KV15XZN0=GS1.1.1656817532.3.1.1656817536.0",
    "user-agent":"Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.0.0 Safari/537.36",
}

async def get_magnet(url):
    async with AsyncClient() as client:
        # 发送请求
        res = await client.get(url=url, headers=headers, timeout=30)
        res=res.text
        soup = BeautifulSoup(res, "lxml")
        item_lst = soup.find_all("a", {"class": "SearchListTitle_result_title"})
        async with AsyncClient() as client2:
            tasks = []
            # 获取每一个url, 异步访问
            for item in item_lst:
                url = magnet_url + item.get("href")
                tasks.append(get_info(url,client2))
            data = await asyncio.gather(*tasks)
    # num是每次发送的条数        
    num = max_num
    # 防止数组越界
    if len(data) < max_num:
        num = len(data)
    # 随机选择一些条目 
    message_list = random.sample(data, num)
    message = ""
    # message拼接
    for msg in message_list:
        message = message + msg + "\n"
    # 在控制台输出一下
    print(message)
    return message


async def get_info(url,client):
    res = await client.get(url=url, headers=headers, timeout=30)
    res=res.text
    soup = BeautifulSoup(res, "lxml")
    Information_l_content = soup.find_all("div", {"class": "Information_l_content"})
    # 这个是磁力链接
    magnet = Information_l_content[0].find("a").get("href")
    #  这个是文件大小
    size = list(Information_l_content[1])[4]
    size = re.sub(u"\\<.*?\\>", "", str(size)) 
    # 访问File_list_info, 目的是为了获取文件名
    name = soup.find_all('div',{'class':'File_list_info'})
    name = list(name[0])[0]
    message = f"文件名: {name} \n大小: {size}\n链接: {magnet}\n"
    print(message)
    return message



# bdbk('苹果')
# asyncio.get_event_loop().run_until_complete(pq()) #调用
# asyncio.get_event_loop().run_until_complete(lol())
# refresh_db()
#get_geng('芜湖起飞')
# get_liushi()
asyncio.get_event_loop().run_until_complete(get_magnet(magnet_url))
# get_magnet(magnet_url)
