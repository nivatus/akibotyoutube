// Pasharok

const { Client, MessageEmbed  } = require("discord.js"),
      {     prefix, token     } = require("./config"),
      {          Aki          } = require("aki-api"),
      emojis = ["👍", "👎", "❔", "🤔", "🙄", "❌"],
      Started = new Set();

new Client({messageCacheMaxSize: 50})
.on("ready", () => console.log(`я онлайн и готов отвечать на сообщения! \n не забудь подписаться на https://www.youtube.com/channel/UCzJeCnilfIRFCIoiMv9V2hQ?view_as=subscriber`))
.on("message", async message => {
if (message.author.bot || !message.guild) return;
if (message.content.startsWith(prefix + "старт")) {
if(!Started.has(message.author.id))Started.add(message.author.id);
else return message.channel.send("**:x: | ИГРА УЖЕ НАЧАЛАСЬ**");
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
                    .setTitle("Я победил!")
                    .setDescription("Поиграем ещё?!"));
              else 
                  return message.channel.send(new MessageEmbed()
                    .setColor("RANDOM")
                    .setTitle("Ты победил меня! :(")
                    .setDescription("Поиграем ещё?!"));
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
