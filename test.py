from email import message
import random
import requests
import json
import nonebot
from datetime import date
from nonebot.plugin import on_keyword
from nonebot import on_command,CommandGroup
from nonebot.matcher import Matcher
from nonebot.adapters.onebot.v11 import Bot, Event
from nonebot.params import Arg, CommandArg, ArgPlainText
from nonebot.adapters.onebot.v11.message import Message
from nonebot.adapters.onebot.v11 import MessageSegment
from nonebot import require
require("nonebot_plugin_apscheduler")
from nonebot_plugin_apscheduler import scheduler

group_id_list = [495222073,627289633,981723666]

def luck_simple(num):
    if num < 18:
        return '大吉'
    elif num < 53:
        return '吉'
    elif num < 58:
        return '半吉'
    elif num < 62:
        return '小吉'
    elif num < 65:
        return '末小吉'
    elif num < 71:
        return '末吉'
    else:
        return '凶'
    

jrrp = on_command("今日人品",priority=10)
@jrrp.handle()
async def jrrp_handle(bot: Bot, event: Event):
    rnd = random.Random()
    rnd.seed(int(date.today().strftime("%y%m%d")) + int(event.get_user_id()))
    lucknum = rnd.randint(1,100)
    await jrrp.finish(Message(f'[CQ:at,qq={event.get_user_id()}]您今日的幸运指数是{lucknum}/100（越低越好），为"{luck_simple(lucknum)}"'))



# 梗查询
geng = on_command("梗",priority=10)
@geng.handle()
async def handle_first_receive(matcher: Matcher, args: Message = CommandArg()):
    plain_text = args.extract_plain_text()  # 首次发送命令时跟随的参数，例：/天气 上海，则args为上海
    if plain_text:
        matcher.set_arg("word", args)  # 如果用户发送了参数则直接赋值

@geng.got("word", prompt="你想查的词语是：")
async def handle_word(word: Message = Arg(), words: str = ArgPlainText("word")):
        # 可以使用平台的 Message 类直接构造模板消息
    wordw = get_geng(words)
    await geng.finish(wordw)




# 百度查询
bk = on_command("百度百科",priority=10)
@bk.handle()
async def handle_first_receive(matcher: Matcher, args: Message = CommandArg()):
    plain_text = args.extract_plain_text()  # 首次发送命令时跟随的参数，例：/天气 上海，则args为上海
    if plain_text:
        matcher.set_arg("word", args)  # 如果用户发送了参数则直接赋值

@bk.got("word", prompt="你想查的词语是：")
async def handle_bk(word: Message = Arg(), wordss: str = ArgPlainText("word")):
        # 可以使用平台的 Message 类直接构造模板消息  
    bd = bdbk(wordss)
    if bd['code']==200:
        a = MessageSegment.image(str(bd['img']))
        b = 'Name：'+bd['name']+'\n'+'Content：'+bd['content']+'\n'+'Url：'+bd['url']
        await bk.finish(a+'\n'+b)
    else:
        await bk.finish('我不知道'+MessageSegment.image('https://luckycat.ink/wp-content/uploads/2022/06/baka.jpg'))



# 帮助菜单
help = on_command("help",priority=10)
@help.handle()
async def help_handle(bot: Bot, event: Event):
    helpurl = 'https://luckycat.ink/wp-content/uploads/2022/06/help.png'
    a = MessageSegment.image(str(helpurl))
    b = Message(f'[CQ:at,qq={event.get_user_id()}]')
    await help.finish(b+a)


helpck = on_command("help抽卡",priority=10)
@helpck.handle()
async def helpck_handle(bot: Bot, event: Event):
    helpurl = 'https://luckycat.ink/wp-content/uploads/2022/06/helpck.png'
    a = MessageSegment.image(str(helpurl))
    b = Message(f'[CQ:at,qq={event.get_user_id()}]')
    await helpck.finish(b+a)

helpst = on_command("helpsetu",priority=10)
@helpst.handle()
async def helpst_handle(bot: Bot, event: Event):
    helpurl = 'https://luckycat.ink/wp-content/uploads/2022/06/helpst.png'
    a = MessageSegment.image(str(helpurl))
    b = Message(f'[CQ:at,qq={event.get_user_id()}]')
    await helpst.finish(b+a)


#helpt = CommandGroup(help)


# 每日60s
@scheduler.scheduled_job('cron', hour='8',minute='30',id='liushis')
async def liushis():
    (bot,)= nonebot.get_bots().values()
    url = str(get_liushi())
    for id in group_id_list:
        await bot.send_msg(
                        message_type='group',
                        group_id=int(id),
                        message=MessageSegment.image(str(url))
                    )


#---------------------------------------------------------------------------------------------------------------------------------------
# ------------------------------------------------------------------------------api调用部分-----------------------------------------------------------
#查询梗api
def get_geng(w:str):
    url='https://api.iyk0.com/gzs/?msg='+w
    headers = {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.146 Safari/537.36'
        }
    t = requests.get(url,headers=headers)
    c = json.loads(t.content)
    num = 0
    result =''
    if c['sum'] > 5:
        num = 5
    else:
        num = c['sum']
    for i in range(num):
        result = result +'【'+str(i+1)+'】'+'.'+c['data'][i]['title'] +'\n'
    #print(result)
    return result
    
    # return num




#60S api调用
def get_liushi():
    url ='https://api.iyk0.com/60s'
    headers = {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.146 Safari/537.36'
        }
    t = requests.get(url,headers=headers)
    c = json.loads(t.content)
    result = c['imageUrl']
    print(result)
    return result


#百度百科api调用
def bdbk(gjc:str):
    url='https://api.iyk0.com/bk/?msg='+gjc
    headers = {
            'user-agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.146 Safari/537.36'
        }
    t = requests.get(url,headers=headers)
    c = json.loads(t.content)
    # print(c['content'])
    return c