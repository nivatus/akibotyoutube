console.log("start");
var Discord = require("discord.js");
var puppeteer = require("puppeteer");
var fs = require("fs");
var PREFIX = process.env.PREFIX || "-";
(async () => {
	var browser = await puppeteer.launch({args:["--no-sandbox"/*openvz*/]});
	console.log("chromium launched");

	var client = new Discord.Client();
	await client.login(fs.readFileSync('token.txt','utf8').trim());
	console.log("discord client ready");
	client.user.setActivity(`что тебе надо`);

	client.on("message", processMessage);
	/*client.on("messageUpdate", async (oldMessage, newMessage) => {
		if (newMessage.responses) newMessage.react('🚫');
	});*/
	client.on("messageDelete", async message => {
		if (message.responses) {
			console.log(`[${new Date().toLocaleString()}] [${message?.guild.id}(${message?.guild.name})] [${message.channel.id}(#${message.channel.name})] Deleted command from ${message.author.id} (${message.author.tag}): ${message.content}`);
			message.responses.forEach(async message => {
				(await message).delete();
			});
		}
	});

	async function processMessage(message) {
		if (!message.content.startsWith(PREFIX)) return;
		console.log(`[${new Date().toLocaleString()}] [${message?.guild.id}(${message?.guild.name})] [${message.channel.id}(#${message.channel.name})] User ${message.author.id} (${message.author.tag}) invoked command: ${message.content}`);
		message.responses = [];

		function respond() {
			message.author.pendingResponse = false;
			if (message.deleted) return;
			message.responses.push(message.channel.send.apply(message.channel, arguments));
		}

		var inp = message.content.slice(PREFIX.length);
		var args = inp.split(" ");
		var cmd = args[0].toLowerCase();
		var query = args.slice(1).join(" ").trim();

		switch (cmd) {
			case "команды":
			case "h":
				respond({embed:{
					title: "Команды",
					description:
						`\n\`${PREFIX}скрин <url>\`` +
						`\n\`${PREFIX}гугл <запрос>\`` +
						`\n\`${PREFIX}google-i'm-feeling-lucky <запрос>\`` +
						`\n\`${PREFIX}google-images <запрос>\`` +
						`\n\`${PREFIX}bing <запрос>\`` +
						`\n\`${PREFIX}bing-images <запрос>\`` +
						`\n\`${PREFIX}ютуб <запрос>\`` +
						`\n\`${PREFIX}ebay <запрос>\`` +
						`\n\`${PREFIX}amazon <запрос>\`` +
						`\n\`${PREFIX}duckduckgo <запрос>\`` +
						`\n\`${PREFIX}yahoo <запрос>\`` +
						`\n\`${PREFIX}вики <запрос>\`` +
						`\n\`${PREFIX}старт (игра с акинатором на угадывание персонажа)\`` +
						`\n Pasharik` +
						`\n *Версия бота 0.12*`

				}});
				break;
			case "скрин":
			case "ss":
				pup((query.startsWith("http://") || query.startsWith("https://")) ? query : `http://${query}`);
				break;
			case "гугл":
			case "g":
				pup(`https://www.google.com/search?q=${encodeURIComponent(query)}`);
				break;
			case "google-i'm-feeling-lucky":
			case "gifl":
				pup(`https://www.google.com/search?btnI=I%27m+Feeling+Lucky&q=${encodeURIComponent(query)}`);
				break;
			case "ntcn23":
			case "gi":
				pup(`https://www.google.com/search?q=${encodeURIComponent(query)}&tbm=isch&safe=${(message.channel.nsfw) ? 'off' : 'on'}`);
				break;
			case "bing":
			case "b":
				pup(`https://www.bing.com/search?q=${encodeURIComponent(query)}`);
				break;
			case "bing-images":
			case "bi":
				pup(`https://www.bing.com/images/search?q=${encodeURIComponent(query)}&safeSearch=${(message.channel.nsfw) ? 'off' : 'moderate'}`);
				break;
			case "ютуб":
			case "yt":
				pup(`https://www.youtube.com/results?search_query=${encodeURIComponent(query)}`);
				break;
			case "ebay":
			case "e":
				pup(`https://www.ebay.com/sch/i.html?_nkw=${encodeURIComponent(query)}`);
				break;
			case "снюс":
			case "сн":
				pup(`https://yandex.ru/images/search?text=%D1%81%D0%BD%D1%8E%D1%81&from=tabbar`);
				break;
			case "duckduckgo":
			case "ddg":
				pup(`https://duckduckgo.com/?q=${encodeURIComponent(query)}`);
				break;
			case "yahoo":
			case "y":
				pup(`https://search.yahoo.com/search?p=${encodeURIComponent(query)}`);
				break;
			case "вики":
			case "в":
				pup(`https://en.wikipedia.org/w/index.php?title=Special:Search&search=${encodeURIComponent(query)}`);
				break;

			case "-dis":
			case "discord":
				respond(`**Текущая секретная тестовая версия Discord Android Клиента**\n \n Последняя тестовая версия - **52.1.1** \n Официальная версия с Play Market - **51.2** \n \n **Попытки** \n  Нашёл за 13 ms`);


			case "тест":
			case ">":
				if (message.author.id == (process.env.OWNER || "")) {
					try {
						respond(String(eval(query)));
					} catch(error) {
						respond(String(error));
					}
				}

		}

		async function pup(url) {

			message.author.pendingResponse = true;
			message.react('🆗');
			try {
				var page = await browser.newPage();
				page.on("error", async error => {
					respond(`⚠ что-то пошло не так!`);
				});
				await page.setViewport({width: 1439, height: 900});
				await page.goto(url);
				var screenshot = await page.screenshot({type: 'png'});
				respond({files:[{ attachment: screenshot, name: "screenshot.png" }]});
			} catch(error) {
				console.error(error);
				respond(`⚠️Ошибка: много запросов на бота. Попробуйте ещё раз! `);
			} finally {
				try {
					await page.close();
				} catch(error) {
					console.error(error);
					process.exit(1);
				}
			}
		}
	}
})().catch(error => { console.error(error); process.exit(1); });
const { Client, MessageEmbed  } = require("discord.js"),
      {     prefix, token     } = require("./config"),
      {          Aki          } = require("aki-api"),
      emojis = ["👍", "👎", "❔", "🤔", "🙄", "❌"],
      Started = new Set();

new Client({messageCacheMaxSize: 50})
.on("ready", () => console.log(`готов!`))
.on("message", async message => {
if (message.author.bot || !message.guild) return;
if (message.content.startsWith(prefix + "старт")) {
if(!Started.has(message.author.id))Started.add(message.author.id);
else return message.channel.send("**:x: | ИГРА УЖЕ НАЧАЛАСЬ ЧЕ ТУПИШЬ**");
      const aki = new Aki("ru"); // Full languages list at: https://github.com/jgoralcz/aki-api
      await aki.start();
const msg = await message.channel.send(new MessageEmbed()
                                       .setTitle(`Вопрос для ${message.author.username}, Вопрос ${aki.currentStep + 1}`)
                                       .setColor("RANDOM")
                                       .setDescription(`**${aki.question}**\n${aki.answers.map((x, i) => `${x} | ${emojis[i]}`).join("\n")}`));
for(let emoji of emojis)await msg.react(emoji).catch(console.error);
const collector = msg.createReactionCollector((reaction, user) => emojis.includes(reaction.emoji.name) && user.id === message.author.id,{ time: 60000 * 1 });
      collector.on("collect", async (reaction, user) => {
      reaction.users.remove(user).catch(console.error);
if(reaction.emoji.name == "❌")return collector.stop();

await aki.step(emojis.indexOf(reaction.emoji.name));
if (aki.progress >= 70 || aki.currentStep >= 78) {
          await aki.win();
          collector.stop();
          message.channel.send(new MessageEmbed()
              .setTitle(`Признайся: ты угадал этого персонажа? ${message.author.username}`)
              .setDescription(`**${aki.answers[0].name}**\n${aki.answers[0].description}\n **#${aki.answers[0].ranking}**\n\n[да (**y**) / нет (**n**)]`)
              .setImage(aki.answers[0].absolute_picture_path)

              .setColor("RANDOM"));

message.channel.awaitMessages(response => ["yes","y","no","n"].includes(response.content.trim().toLowerCase()) &&
response.author.id == message.author.id, { max: 1, time: 30000, errors: ["time"] })
        .then(collected => {
           const content = collected.first().content.trim().toLowerCase();
              if (content == "y" || content == "yes")
                   return message.channel.send(new MessageEmbed()
                    .setColor("RANDOM")
                    .setTitle("Я победил хахаха")
                    .setDescription("Ты крутой"));
              else 
                  return message.channel.send(new MessageEmbed()
                    .setColor("RANDOM")
                    .setTitle("ты победил меня")
                    .setDescription("Ладно пофигу."));
            });
          return;
        }
         msg.edit(new MessageEmbed()
                  .setTitle(`${message.author.username},Вопрос ${aki.currentStep + 1}`)
                  .setColor("RANDOM")
                  .setDescription(`**${aki.question}**\n${aki.answers.map((x, i) => `${x} | ${emojis[i]}`).join("\n")}`));
   });
  
  
collector.on("end",()=>{ Started.delete(message.author.id);
                         msg.delete({ timeout: 1000 }).catch(()=>{});
                       });   
}}).login(token);
