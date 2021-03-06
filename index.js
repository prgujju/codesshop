const { Telegraf, session, Extra, Markup, Scenes, wizard } = require('telegraf');
const { BaseScene, Stage } = Scenes
const mongo = require('mongodb').MongoClient;
const { enter, leave } = Stage
const stage = new Stage();
const Scene = BaseScene
const bot = new Telegraf('5063659497:AAFm-WvGJgLsDMbZPDoPKLaZefWdXUP2lmA');
let ch1 = "@rarecodes"
let ch2 = "@StoneTransactions"
var admin = '1095232231'
let db
function rndFloat(min, max) {
  return (Math.random() * (max - min + 1)) + min
}
function rndInt(min, max) {
  return Math.floor(rndFloat(min, max))
}
/* The Bot Config */
var ref_bonus = 5 // Refer Bonus
var bot_cur = 'Stone' // Currency Symbol/Tag
var bot_name = 'CodesShopbot' // Bot Username Add Original username
/* The Bot Msg Config */
const mainMenu = {
  "reply_markup": {
    "resize_keyboard": true,
    "keyboard": [
      ["đ¤ Profile"],
      ["đ Get Codes", "đ Source Code"],
      ["đŤ Redeem Code","đ Support"]
    ]
  }
};
var startMsg = '*Hi, before you start the bot, please Subscribe Youtube Channel And Join Telegram Channel Also.*\n\nâŞď¸ [Rarecodes](https://t.me/rarecodes)\nâŞď¸ [StoneTransactions](https://t.me/StoneTransactions)\nâŞď¸[ Techno Stone](https://youtube.com/technostone)  \n\n*If All Done, Click On check Button*'
mongo.connect('mongodb+srv://stone:2104shop@stoneshop.6csdl.mongodb.net/myFirstDatabase?retryWrites=true&w=majority', { useUnifiedTopology: true }, (err, client) => {
  if (err) {
    console.log(err)
  }

  db = client.db('shopv6')
  bot.telegram.deleteWebhook().then(success => {
    success && console.log('đ¤ is listening to your commands')
    bot.launch()
  })
})
bot.use(session())
bot.use(stage.middleware())

const getWallet = new Scene('getWallet')
stage.register(getWallet)
const buyhandle = new Scene('buyhandle')
stage.register(buyhandle)
const buyapihandle = new Scene('buyapihandle')
stage.register(buyapihandle)
const idhandle = new Scene('idhandle')
stage.register(idhandle)
const redeemC = new Scene('redeemC')
stage.register(redeemC)



const botStart = async (ctx) => {
  try {
    if (ctx.message.chat.type != 'private') { return }
    let dbData = await db.collection('allUsers').find({ userId: ctx.from.id }).toArray()
    let bData = await db.collection('vusers').find({ userId: ctx.from.id }).toArray()
    if (bData.length === 0) {
      if (ctx.startPayload && ctx.startPayload != ctx.from.id) {
        let ref = ctx.startPayload * 1
        if (dbData.length === 0) {
          db.collection('allUsers').insertOne({ userId: ctx.from.id, inviter: ref, join: false })
        } else {
          db.collection('allUsers').updateOne({ userId: ctx.from.id }, { $set: { inviter: ref, join: false } }, { upsert: true })
        }
      } else {
        if (dbData.length === 0) {
          db.collection('allUsers').insertOne({ userId: ctx.from.id, join: false })
        } else {
          db.collection('allUsers').updateOne({ userId: ctx.from.id }, { $set: { join: false } }, { upsert: true })
        }

        // db.collection('allUsers').insertOne({ userId: ctx.from.id , pending: true , join: false})
      }
      // var url = "https://www.googleapis.com/youtube/v3/channels?part=statistics&id=UCMhd_HrdADzW-AU-ni5_-Nw&key=AIzaSyBrnN1WZm8Bsx8V7AtqkKJVlKUdLobrOFc"
      // var config = { method: 'get', url: url }; 
      // axios(config).then(async function(response) {
      // var ans = response.data.items[0].statistics.subscriberCount
      // console.log(ans)
      // db.collection('allUsers').updateOne({ userId: ctx.from.id }, { $set: { answer: 654 } }, { upsert: true })
      // })
      await ctx.replyWithMarkdown(startMsg, { disable_web_page_preview: true, reply_markup: { keyboard: [['âŞď¸ Check âŞď¸']], resize_keyboard: true } })
    } else {
      let joinCheck = await findUser(ctx)
      if (joinCheck) {
        let pData = await db.collection('vusers').find({ userId: ctx.from.id }).toArray()
        if (pData[0].balance === undefined) {
          db.collection('vusers').updateOne({ userId: ctx.from.id }, { $set: { balance: 0 , tbuy:0 ,tdepo : 0 } }, { upsert: true })
        }
        if (('inviter' in pData[0]) && !('referred' in dbData[0])) {
          let bal = await db.collection('allUsers').find({ userId: pData[0].inviter }).toArray()
          var cal = bal[0].balance * 1
          var sen = ref_bonus * 1
          var see = cal + sen
          bot.telegram.sendMessage(pData[0].inviter, 'New Referral on your link you received' + ref_bonus + ' ' + bot_cur + '', { parse_mode: 'markdown' })
          db.collection('allUsers').updateOne({ userId: ctx.from.id }, { $set: { inviter: pData[0].inviter, join: true, referred: 'TechnoStone' } }, { upsert: true })
          db.collection('vusers').updateOne({ userId: pData[0].inviter }, { $set: { balance: see } }, { upsert: true })
          ctx.replyWithMarkdown('đĄ Welcome To Main Menu', mainMenu)
        } else {
          db.collection('allUsers').updateOne({ userId: ctx.from.id }, { $set: { join: true } }, { upsert: true })
          ctx.replyWithMarkdown('đĄ Welcome To Main Menu', mainMenu)
        }
      } else { mustJoin(ctx) }
    }
  } catch (e) { sendError(e, ctx) }
}


bot.start(botStart)
bot.hears(['âŹď¸ Back', 'đ back'], botStart)

bot.hears('âŞď¸ Check âŞď¸', async (ctx) => {

  try {
    // var url = "https://www.googleapis.com/youtube/v3/channels?part=statistics&id=UCMhd_HrdADzW-AU-ni5_-Nw&key=AIzaSyBrnN1WZm8Bsx8V7AtqkKJVlKUdLobrOFc"
    // var config = { method: 'get', url: url }; 
    //   axios(config).then(async function(response) {
    //   var ans2 = response.data.items[0].statistics.subscriberCount

    // let dbData = await db.collection('allUsers').find({ userId: ctx.from.id }).toArray()
    // let ans = dbData[0].answer

    if (ctx.from.last_name) {
      valid = ctx.from.first_name + ' ' + ctx.from.last_name
    } else {
      valid = ctx.from.first_name
    }

    //if (ans == ans2) { return ctx.replyWithMarkdown('đ _Please Subscribe Youtube Channel_\n\n âŞď¸[Go To The Channel](https://youtube.com/technostone)', { reply_markup: { keyboard: [['âŞď¸ Check âŞď¸']], resize_keyboard: true } })}
    //if (ans > ans2) { return ctx.replyWithMarkdown('đ _Why Unsubscribe Please Subscribe Again_ \n\n âŞď¸[Go To The Channel](https://youtube.com/technostone)', { reply_markup: { keyboard: [['âŞď¸ Check âŞď¸']], resize_keyboard: true } })}
    // if (ans < ans2) {

    let joinCheck = await findUser(ctx)
    if (joinCheck) {
      db.collection('vusers').insertOne({ userId: ctx.from.id, tbuy:0 ,tdepo : 0 , name: valid })
      await ctx.deleteMessage()
      let pData = await db.collection('vusers').find({ userId: ctx.from.id }).toArray()
      if (pData[0].balance === undefined) {
        db.collection('vusers').updateOne({ userId: ctx.from.id }, { $set: { balance: 0 ,tbuy:0 ,tdepo : 0} }, { upsert: true })

      }
      if (('inviter' in pData[0]) && !('referred' in dbData[0])) {
        let bal = await db.collection('allUsers').find({ userId: pData[0].inviter }).toArray()
        var cal = bal[0].balance * 1
        var sen = ref_bonus * 1
        var see = cal + sen
        bot.telegram.sendMessage(pData[0].inviter, ' *New Referral on your link* you received ' + ref_bonus + ' ' + bot_cur, { parse_mode: 'markdown' })
        db.collection('allUsers').updateOne({ userId: ctx.from.id }, { $set: { inviter: pData[0].inviter, join: true, referred: 'TechnoStone' } }, { upsert: true })
        db.collection('vusers').updateOne({ userId: pData[0].inviter }, { $set: { balance: see } }, { upsert: true })
        ctx.replyWithMarkdown('đĄ Welcome To Main Menu', mainMenu)

      } else {
        db.collection('allUsers').updateOne({ userId: ctx.from.id }, { $set: { join: true } }, { upsert: true })
        ctx.replyWithMarkdown('đĄ Welcome To Main Menu', mainMenu)
      }
    } else { mustJoin(ctx) }
    // } else {
    //   ctx.replyWithMarkdown('_Some Problem Sorry For facing This Error_')
    // }
    //})
  } catch (err) {
    sendError(err, ctx)
  }
})

bot.hears('đ Support', ctx => {
  ctx.replyWithMarkdown('*You are now in direct contact with our Team And User*\n_Send Your Message In @StoneChats, you will receive the answer directly in chat!_ \n\n*Regards* @rarecodes')
  })

bot.action(/bmt_+/, async ctx => {
  ctx.scene.leave();
  var v = ctx.match.input.split("_")[1]
  
  let lists
  let codeId
  let base  
  if (v == "BMS"){ 
    lists = 'bmlist'
    base = 'bmsaved'
    codeId = "BM00"
  }
  if (v == "NODE"){ 
    lists = 'nodelist'
    codeId = "NODE00"
  }
  if (v == "BJS"){ 
    lists = 'bjslist'
    base = 'bjssaved'
    codeId = "BJS00"
  }

  let dData = await db.collection(lists).find().toArray()
  if (dData.length == 0) { ctx.answerCbQuery( text = "Coming Soon", show_alert = true)} else {
  await ctx.deleteMessage()
  var code = dData[0].codelist
  ctx.scene.enter('buyhandle')
  var msg = '*Select From The Below List.*\n==========================\n\n' + code + '\n\n*For 1 type 1\nFor 2 type 2\nAnd so on...*'
  bot.telegram.sendMessage(ctx.chat.id, msg,{
    parse_mode: 'markdown',
    reply_markup: {
        inline_keyboard: [
            [
                {text: 'âŠď¸ Main Menu', callback_data: "/getcodes"},
            ]
        ]
    }
}) 
}

buyhandle.on('text', async (ctx) => {
// bot.on('message', async(ctx) => {
  await ctx.deleteMessage()
  if(!isNumeric(ctx.message.text)) {return ctx.scene.leave();}
  var num = codeId + ctx.message.text
  let user = await db.collection('vusers').find({ userId: ctx.from.id }).toArray()
  var buy = await db.collection(base).find({codeId : num}).toArray()
  var totalS = await db.collection('extra').find({totalS : "status"}).toArray()
  
  if (buy[0].price <= user[0].balance) {
    if (totalS == "") {
      db.collection('extra').insertOne({ totalS: "status" , timebuy: 1 })
   }else{
     let timebuy = totalS[0].timebuy + 1 
     db.collection('extra').updateOne({ totalS: "status" }, { $set: { timebuy: timebuy } }, { upsert: true })
   }
    var addnow = parseInt(user[0].balance - buy[0].price);
    db.collection('vusers').updateOne({ userId: ctx.from.id }, { $set: { balance: addnow } }, { upsert: true })
    if (buy[0].cmd2n == undefined  ) {
      ctx.scene.leave();
    ctx.replyWithHTML("đĽł Code Purchased Successfully\n\n<i>Name: "+buy[0].Name+"\n\nCommand Name: AsYouWish</i>\n\nCode:\n <code>"+buy[0].code+"</code>")
    }else{
    ctx.scene.leave();
    ctx.replyWithHTML("đĽł Code Purchased Successfully\n\n<i>Name: "+buy[0].Name+"\n\nCommand Name: AsYouWish</i> \n\n<b>Code:</b>\n <code>"+buy[0].code+"</code> \n\n<i>Command2 Name:</i> <code>"+buy[0].cmd2n+"</code>\n\n<b>Command2 Code:</b> \n <code>"+buy[0].cmd2+"</code>")}
    bot.telegram.sendMessage('@StoneTransactions', 
      '_đ New '+v+' Code Purchased by_ *'+ctx.from.first_name+'*\n\n_đ Bought:_ ' +buy[0].Name+'\n\n_đľ Amount:_ '+buy[0].price+'\n\n *đ¤Š Get Now Your Codes From Here âŹď¸\n @' +bot_name+'*', 
      { parse_mode: 'markdown' })
  }else{
    ctx.scene.leave();
    ctx.reply("Recharge please")
  }

 })  

})
/* Code Show Here */


bot.hears('đ Get Codes',ctx=>{
  getCodeMsg(ctx)
  })
bot.action(/getcodes/, async ctx=>{
  ctx.answerCbQuery()
  getCodeMsg(ctx)
  })
async function getCodeMsg( ctx){
  await ctx.deleteMessage()
  ctx.scene.leave('buyhandle');
    bot.telegram.sendMessage(ctx.chat.id, '*Select From The Below List.*',{
      parse_mode: 'markdown',
      reply_markup: {
          inline_keyboard: [
              [
                  {text: 'đ BJScript', callback_data: "/bmt_BJS"},
              ],
              [
                {text: 'đ Botmate', callback_data: `/bmt_BMS`},
            ],
            [
              {text: 'đ Nodejs', callback_data: "/bmt_NODE"},
          ]
          ]
      }
  
  })
  }

  bot.hears('đ Source Code',ctx=>{
    getCodesMsg(ctx)
    })
  bot.action(/sourcecodes/, async ctx=>{
    ctx.answerCbQuery()
    getCodesMsg(ctx)
    })
  async function getCodesMsg( ctx){
    await ctx.deleteMessage()
    ctx.scene.leave('buyapihandle');
      bot.telegram.sendMessage(ctx.chat.id, '*Select From The Below List.*',{
        parse_mode: 'markdown',
        reply_markup: {
            inline_keyboard: [
                [
                    {text: 'đ HTML Source Code', callback_data: "/scode_HTML"},
                ],
                [
                  {text: 'đ API Source Code', callback_data: `/scode_API`},
              ],
              [
                {text: 'đ PHP Script', callback_data: "/scode_PHP"},
            ]
            ]
        }
    
    })
    }
    

bot.hears('đ¤ Profile', async (ctx) => {
  try {
    if (ctx.message.chat.type != 'private') { return }
    let user = await db.collection('vusers').find({ userId: ctx.from.id }).toArray()
    let sum = user[0].balance
    let allRefs = await db.collection('allUsers').find({ inviter: ctx.from.id }).toArray() // all invited users
    let redLink = 'https://t.me/' + bot_name + '?start=' + ctx.from.id + ''
    ctx.reply(
      '<b>đĽł Hello ' + ctx.from.first_name + '\n\nYour Info </b>\n<i>  - Your UserID : <code>' +ctx.from.id+ '</code>\n  - Your Balance : <b>' + sum + ' ' + bot_cur + '</b>\n  - Total Buyed Codes : <b>'+user[0].tbuy+'</b>\n  - Total Deposit : <b>'+user[0].tdepo+'</b>\n  - Total Referrals <b>' + allRefs.length + '</b> . \n\n</i><b>Your Invite Link </b>\n  - <code>Disabled</code>', { disable_web_page_preview: true, parse_mode: 'html' })
  } catch (err) {
    sendError(err, ctx)
  }
})

bot.action(/scode_+/, async ctx => {
  ctx.scene.leave();
  var v = ctx.match.input.split("_")[1]
  
  let lists
  let codeId
  let base  
  if (v == "HTML"){ 
    lists = 'htmllist'
    base = 'htmlsaved'
    codeId = "HTML00"
  }
  if (v == "API"){ 
    lists = 'apilist'
    base = 'apisaved'
    codeId = "API00"
  }
  if (v == "PHP"){ 
    lists = 'phplist'
    base = 'phpsaved'
    codeId = "PHP00"
  }
  let dData = await db.collection(lists).find().toArray()
  if (dData.length == 0) { ctx.answerCbQuery( text = "Coming Soon", show_alert = true)} else {
  await ctx.deleteMessage()
  var code = dData[0].codelist
  ctx.scene.enter('buyapihandle')
  var msg = '*Select From The Below List.*\n==========================\n\n' + code + '\n\n*For 1 type 1\nFor 2 type 2\nAnd so on...*'
  bot.telegram.sendMessage(ctx.chat.id, msg,{
    parse_mode: 'markdown',
    reply_markup: {
        inline_keyboard: [
            [
                {text: 'âŠď¸ Main Menu', callback_data: "/sourcecodes"},
            ]
        ]
    }
}) 
}

buyapihandle.on('text', async (ctx) => {
  await ctx.deleteMessage()
  // bot.on('message', async(ctx) => {
    if(!isNumeric(ctx.message.text)) { return ctx.scene.leave(); }
    var num = codeId + ctx.message.text
    var buy = await db.collection(base).find({codeId : num}).toArray()
    let msg = `Demo: ${buy[0].dLink} \n\nPrice: ${buy[0].price}\n\nInfo: ${buy[0].des}`
      bot.telegram.sendPhoto(ctx.chat.id, buy[0].pId,{caption: msg, parse_mode:"HTML",reply_markup: {
            inline_keyboard: [
                [
                    {text: 'Buy Now', callback_data: `buyapi_${num}`},
                ],
                [
                  {text: `Go To ${v} list`, callback_data: `/scode_${v}`},
              ]
            ]
          }})  
   }) 

})
bot.action(/buyapi_+/, async ctx=>{
  var d = ctx.match.input.split("_")[1]
  var v = d.split("0")[0]
 console.log(d);
  let base  
  if (v == "HTML"){ 
    base = 'htmlsaved'
  }
  if (v == "API"){ 
    base = 'apisaved'
  }
  if (v == "PHP"){ 
    base = 'phpsaved'
  }
  let user = await db.collection('vusers').find({ userId: ctx.from.id }).toArray()
  var buy = await db.collection(base).find({codeId : d}).toArray()
  var totalS = await db.collection('extra').find({totalS : "status"}).toArray()
  console.log(user[0].balance);
  if (buy[0].price <= user[0].balance) {
    if (totalS == "") {
      db.collection('extra').insertOne({ totalS: "status" , timebuy: 1 })
   }else{
     let timebuy = totalS[0].timebuy + 1 
     db.collection('extra').updateOne({ totalS: "status" }, { $set: { timebuy: timebuy } }, { upsert: true })
   }
    var addnow = parseInt(user[0].balance - buy[0].price);
    db.collection('vusers').updateOne({ userId: ctx.from.id }, { $set: { balance: addnow } }, { upsert: true })
  bot.telegram.sendDocument(ctx.chat.id, buy[0].fileId,{caption: "Thank U For Buying", parse_mode:"HTML"})
  bot.telegram.sendMessage('@StoneTransactions', 
  '_đ New '+v+' Purchased by_ *'+ctx.from.first_name+'*\n\n_đ Bought:_ ' +buy[0].Name+'\n\n_đľ Amount:_ '+buy[0].price+'\n\n *đ¤Š Get Now Your Codes From Here âŹď¸\n @' +bot_name+'*', 
  { parse_mode: 'markdown' })
  }else{
    ctx.reply("Must Recharge")
  }
  })


bot.hears(['đ Status'], async ctx => {
  ctx.scene.leave();
  let maindata = await db.collection('vusers').find().toArray()
  var totalS = await db.collection('extra').find({totalS : "status"}).toArray()
  let bjsData = await db.collection('bjssaved').find().toArray()
  let dData = await db.collection('allUsers').find().toArray()
  // <b>Total Codes </b>\n<i>  - Total Codes in Bot: ' + dData.length + '</i>\n<i>  - Total BJS Codes : ' + dData.length + '</i>\n<i>  - Total Telegraf Codes : ' + dData.length + '</i>\n<i>  - Total APi Codes : ' + dData.length + '</i>
  ctx.reply(
    '<b>đĽł Hello ' + ctx.from.first_name + '\n\nCodesShop Bot Stats </b>\n<i>  - Total  User : ' + dData.length + '\n  - Total Verify User : <b>'+maindata.length+'</b>\n  - Total Buyed Codes : \n  - Total Time Deposit : <b></b>\n  - Total Redeem Code: <b></b>\n  - Total Redeemed Code: <b></b> . \n\n</i>', { disable_web_page_preview: true, parse_mode: 'html' })
})

bot.hears(['/id'], async ctx => {
  ctx.scene.enter('idhandle')
  ctx.reply("Send File")

idhandle.on('message', async (ctx) => {

  const { photo, document } = ctx.message;
  let message = `File Info\n\n`;

  if (!photo && !document) {
    ctx.reply("Please send any media or document.");
    return;
  }
  if (photo) {
   message += `Size [${photo[0].file_size}]\n\n<code>${photo[0].file_id}</code>\n\n`;
  } else if (document) {
    
    message += `File Id\n\n<code>${document.file_id}</code>\n\n`;
  }
  ctx.reply(message, {
    parse_mode: "Html",
  });
})
 })


  bot.hears('đŤ Redeem Code', async ctx => {
    try {
        ctx.scene.enter('redeemC')
        ctx.reply('*đŽââ Send Reedem Code* ', { parse_mode: 'markdown' })
      } catch (error) {
        console.log(error)
      } 
  })
  
  redeemC.on('text', async (ctx) => {
    ctx.scene.leave();
    let num = ctx.message.text
    if(num.length < 12){ return ctx.replyWithMarkdown('*Code Not Valid*')}
    let rData = await db.collection('extra').find({ redeemcode: num }).toArray()
    if(rData.length === 0){ return ctx.replyWithMarkdown('*Code Not Valid*')} 
    else 
    if(rData[0].null === true){ return ctx.replyWithMarkdown('*Already Redeemed*')}
    {
      try{
        let thisUsersData = await db.collection('vusers').find({ userId: ctx.from.id }).toArray()
        var sum = thisUsersData[0].balance
        var redeem = sum + rData[0].rvalue
        bot.telegram.sendMessage('@StoneTransactions', 
      '_đ REEDEMED CODE BY_ *'+ctx.from.first_name+'*\n\n_đľ Amount:_ *'+rData[0].rvalue+'\n\n *đ¤Š CODE:* '+num+'*', 
      { parse_mode: 'markdown' })
        ctx.replyWithMarkdown('*đCongratulations, Code Successfully Redeemed, \n '+rData[0].rvalue+' * Stone added to Balance')
        db.collection('vusers').updateOne({ userId: ctx.from.id }, { $set: { balance: redeem } }, { upsert: true })
        db.collection('extra').updateOne({ redeemcode: num }, { $set: { null: true  } }, { upsert: true })
        var totalS = await db.collection('extra').find({ totalS: "status" }).toArray()
          if (totalS == "") {
            db.collection('extra').insertOne({ totalS: "status" , totalRedeemed: 1 })
         }else{
           let totalRedeemed = totalS[0].totalRedeemed + 1
           db.collection('extra').updateOne({ totalS: "status" }, { $set: { totalRedeem: totalRedeemed } }, { upsert: true })
         }
      }
      catch(e){
        console.log(e)
      }
    }
         
  })

function sendError(err, ctx) {
  ctx.reply('An Error Happened âšď¸: ' + err.message)
  bot.telegram.sendMessage(admin, `Error From [${ctx.from.first_name}](tg://user?id=${ctx.from.id}) \n\nError: ${err}`, { parse_mode: 'markdown' })
}


function isNumeric(n) {
  return !isNaN(parseFloat(n)) && isFinite(n);
}
async function findUser(ctx) {
  let isInChannel = true;

  for (let i = 0; i < ch1.length; i++) {
    let cc1 = await bot.telegram.getChatMember(ch1, ctx.from.id)
    let cc2 = await bot.telegram.getChatMember(ch2, ctx.from.id)
    const c1s = ['creator', 'administrator', 'member'].includes(cc1.status && cc2.status)
    if (!c1s) {
      isInChannel = false;
      break;
    }
  }
  return isInChannel
}

function mustJoin(ctx) {
  ctx.replyWithMarkdown(startMsg, {disable_web_page_preview: true, 
    reply_markup: {
      keyboard: [['âŞď¸ Check âŞď¸']],
      resize_keyboard: true
    }
  })
}
