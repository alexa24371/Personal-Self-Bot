"use strict";

const {
  Client,
  Collection,
  MessageAttachment,
  Message,
} = require("discord.js-selfbot-v13");

const { createCanvas, loadImage } = require("canvas");
const fs = require("fs");

const client = new Client();

let hourlyInterval = null;
let homeworkInterval = null;
let cleanInterval = null;
let phInterval = null;

client.on("ready", async () => {
  console.log(`${client.user.username} is ready!`);
});

client.on("messageCreate", async (message) => {
  if (message.content.startsWith("!!ping")) {
    await message.reply("# Pong!");
  }

  if (message.author.id == "1070028694858498070") {
    let botMessgae = message;
    if (botMessgae.flags && botMessgae.flags.has("LOADING")) {
      botMessgae = await waitForUpdate(botMessgae);
    }
    if (!botMessgae || !botMessgae.interaction) return;
    if (botMessgae.interaction.user.id !== client.user.id) return;
    if (botMessgae.interaction.commandName == "工作-代寫作業") {
      await doHomeWork(botMessgae);
      return;
    }
    if (botMessgae.interaction.commandName == "工作-撿垃圾") {
      if (botMessgae.components.length < 1) return;
      await pickRubbish(botMessgae);
      return;
    }
    if (botMessgae.interaction.commandName == "經濟-練注音") {
      if (botMessgae.components.length < 1) return;
      await phonets(botMessgae);
      return;
    }
  }

  if (message.content.startsWith("!!help")) {
    await message.reply(
      "> !!help\n" +
        "> !!ping\n" +
        "> !!uid\n" +
        "> !!zombie\n" +
        "> !!supernoob\n" +
        "> !!most-gay\n" +
        "> !!vote\n" +
        "> !!quote\n" +
        "> !!dice\n"
    );
  }

  if (message.content.startsWith("!!uid")) {
    await message.reply("# 891579197!");
  }

  if (message.content.startsWith("!!quote")) {
    if (!message.reference) return;
    const referedMsg = await message.fetchReference();
    if (!referedMsg.content) return;
    const imageBuffer = await generateQuoteImage(
      referedMsg.author.displayName,
      referedMsg.author.displayAvatarURL({ format: "png", size: 128 }),
      referedMsg.content
    );
    const attachment = new MessageAttachment(imageBuffer);

    await message.reply({ content: "📸 Quoted message:", files: [attachment] });
  }

  if (message.content.startsWith("!!zombie")) {
    await message.reply("# GAY!");
  }

  if (message.content.startsWith("!!supernoob")) {
    await message.reply("# SUPER GAY!");
  }

  if (message.content.startsWith("!!most-gay")) {
    if (message.channel.isText()) {
      client.channels.fetch(message.channel.id);
      const members = message.channel.members.filter((m) => !m.user.bot);
      const memberArray = Array.from(members.values());

      if (memberArray.length === 0) {
        return message.reply("❌ No users found.");
      }

      const randomMember =
        memberArray[Math.floor(Math.random() * memberArray.length)];
      await message.reply(
        `🌈 这个频道中最 G'A'Y 的是: **${randomMember.displayName}** 🏳️‍🌈`
      );
    }
  }

  if (message.content.startsWith("!!vote")) {
    const args = message.content
      .split(" ")
      .slice(1)
      .filter((a) => !a.includes(" ")); // remove '!vote'

    if (args.length < 2) {
      return message.reply(
        "❌ Usage: `!!vote <title> <option1> <option2> ...>` (min 2 options)"
      );
    }

    const title = args[0];
    const options = args.slice(1).slice(0, 5); // up to 5 options

    if (options.length < 2) {
      return message.reply("❌ Please provide at least 2 options.");
    }

    const answers = new Collection();
    for (let i = 0; i < options.length; i++) {
      answers.set(i + 1, { text: options[i] });
    }

    await message.reply({
      poll: {
        question: { text: title },
        allowMultiselect: false,
        answers: answers,
      },
    });
  }

  if (
    message.author.id !== "1069266988326731856" &&
    message.author.id !== client.user.id
  )
    return;

  if (message.content.startsWith("!!hw")) {
    if (homeworkInterval) clearInterval(homeworkInterval);
    await message.channel.sendSlash("1070028694858498070", "工作-代寫作業");
    homeworkInterval = setInterval(async () => {
      await message.channel.sendSlash("1070028694858498070", "工作-代寫作業");
    }, 1000 * 122 + Math.floor(Math.random() * 2000));
    message.reply("started");
  }

  if (message.content.startsWith("!!ph")) {
    if (phInterval) clearInterval(phInterval);
    await message.channel.sendSlash("1070028694858498070", "經濟-練注音");
    phInterval = setInterval(async () => {
      await message.channel.sendSlash("1070028694858498070", "經濟-練注音");
    }, 1000 * 122 + Math.floor(Math.random() * 2000));
    message.reply("started");
  }

  if (message.content.startsWith("!!stophw")) {
    if (homeworkInterval) clearInterval(homeworkInterval);
    message.reply("cleared");
  }

  if (message.content.startsWith("!!stopph")) {
    if (phInterval) clearInterval(phInterval);
    message.reply("cleared");
  }

  if (message.content.startsWith("!!clean")) {
    if (cleanInterval) clearInterval(cleanInterval);
    await message.channel.sendSlash("1070028694858498070", "工作-撿垃圾");
    cleanInterval = setInterval(async () => {
      await message.channel.sendSlash("1070028694858498070", "工作-撿垃圾");
    }, 1000 * 122 + Math.floor(Math.random() * 2000));
    message.reply("started");
  }

  if (message.content.startsWith("!!stopclean")) {
    if (cleanInterval) clearInterval(cleanInterval);
    message.reply("cleared");
  }
  if (message.content.startsWith("!!blackjack")) {
    await message.reply("Starting blackjack game.");
    if (await startBlackJack(message, 10)) {
      message.reply("Wins");
    } else {
      message.reply("lose");
    }
  }

  if (message.content.startsWith("!!bj")) {
    const start = 50;
    const limit = 1600; // Stop if this amount is exceeded
    const reset = limit / 7;
    const maxRound = 100;
    let amount = start;
    let round = 1;

    await message.reply(
      `🎮 Starting auto blackjack loop (base: ${amount}, limit: ${limit})`
    );

    while (amount <= limit) {
      if (round > maxRound) break;
      //await message.channel.send(`🔁 Round ${round}: Betting ${amount}`);
      const win = await startBlackJack(message, amount);
      if (win && reset <= amount) {
        amount = start;
      } else if (!win) {
        amount *= 2;
      }
      round++;
      await wait(Math.floor(Math.random() * 1000 * 2) + 500); // Optional: small delay between games
    }

    await message.channel.send(
      `🛑 Stopped loop — final bet (${amount}) exceeded limit (${limit}) <@${message.author.id}>`
    );
  }

  if (message.content.startsWith("!!dice")) {
    const start = 10;
    let amount = start;
    while (true) {
      const win = await startDice(message, amount);
      if (amount >= start * 2 ** 4) {
        message.channel.send(
          `# <@${message.author.id}> High Value Bet Warning!!!`
        );
      }
      if (win) {
        amount = start;
      } else {
        amount = amount * 2;
      }
    }
  }

  if (message.content.startsWith("!!pTest")) {
    getPhonetic(message, "測試");
  }

  if (message.content.startsWith("!!hourly")) {
    await message.reply("staring /hourly");
    await message.channel.sendSlash("1221230734602141727", "hourly");
    if (hourlyInterval) clearInterval(hourlyInterval);
    hourlyInterval = setInterval(() => {
      message.channel.sendSlash("1221230734602141727", "hourly");
    }, 1000 * 60 * 60 + Math.floor(Math.random() * 1000 * 30) + 10000); // every hour + around 1 min for safety
  }

  if (message.content.startsWith("!!stophourly")) {
    if (hourlyInterval) {
      clearInterval(hourlyInterval);
      hourlyInterval = null;
      await message.reply("Stopped hourly loop.");
    } else {
      await message.reply("No hourly loop is running.");
    }
  }
});

async function getPhonetic(message, input) {
  const respond = await message.channel.sendSlash(
    "1070028694858498070",
    "翻譯-成注音",
    input
  );

  if (respond.flags && respond.flags.has("LOADING")) {
    try {
      respond = await waitForUpdate(respond);
    } catch (err) {
      console.error("Error waiting for initial update:", err);
      return;
    }
  }

  if (!(respond instanceof Message)) return;

  let result = respond.content;
  const matches = result.match(/`([^`]+)`/g);
  const values = matches?.map((m) => m.slice(1, -1))[1];

  const list = values.match(/[\u3105-\u3129]+[ˋˇˊ]?/g) || [];

  console.log(list); // ['ㄧ', 'ㄦˋ', 'ㄐㄧㄡˇ', 'ㄙˋ']
  return list;
}
async function startBlackJack(message, amt) {
  console.log("Blackjack game starting...");

  // Helper to check if embed is red
  function isRedEmbed(embed) {
    if (
      embed.description.includes("❌") ||
      embed.description.includes("✅") ||
      embed.title.includes("獲勝") ||
      embed.title.includes("遊戲結束") ||
      embed.title.includes("平局") ||
      embed.title.includes("small_orange_diamond") ||
      embed.title.includes("完美")
    )
      return true;
    const redColor = 15158332;
    const isRed = embed.color && Math.abs(embed.color - redColor) < 1000;
    return isRed;
  }

  let gameMsg;
  try {
    gameMsg = await message.channel.sendSlash(
      "1221230734602141727",
      "blackjack",
      amt
    );
  } catch (err) {
    console.error("Failed to send slash command:", err);
    return;
  }
  const megId = gameMsg.id;

  if (gameMsg.flags && gameMsg.flags.has("LOADING")) {
    try {
      gameMsg = await waitForUpdate(gameMsg);
    } catch (err) {
      console.error("Error waiting for initial update:", err);
      return;
    }
  }

  while (true) {
    if (!gameMsg.embeds.length) {
      console.log("No embeds found, ending game.");
      break;
    }

    const embed = gameMsg.embeds[0];
    if (isRedEmbed(embed)) {
      break;
    }

    const description = embed.description || "";

    const match = description.match(/\*\*你的手牌:\*\*[\s\S]*?# \*\*(\d+)\*\*/);
    if (match) {
      const number = parseInt(match[1], 10);
      if (number < 17) {
        console.log("Hand < 17: Trying to click Hit button.");
        tryClick(() => gameMsg.clickButton({ X: 0, Y: 0 }), "Click Hit");
      } else {
        console.log("Hand >= 17: Trying to click Stand button.");
        tryClick(
          () => gameMsg.clickButton("blackjack:action:stand"),
          "Click Stand"
        );
      }

      try {
        gameMsg = await waitForUpdate(gameMsg);
      } catch (err) {
        console.error("Error waiting for game update:", err);
        break;
      }
    } else {
      console.warn("Hand value not found in embed description.");
      break;
    }
  }

  console.log("Blackjack game ended.");
  const endMsg = await message.channel.messages.fetch(megId);
  if (endMsg.embeds[0].description.startsWith("❌")) {
    return Promise.resolve(false);
  }

  return Promise.resolve(true);
}

async function startDice(message, amt) {
  function winGame(embed) {
    return embed.description.includes("✅");
  }

  let gameMsg;
  try {
    gameMsg = await message.channel.sendSlash(
      "1221230734602141727",
      "dice",
      amt,
      "大 (11-17)"
    );
  } catch (err) {
    console.error("Failed to send slash command:", err);
    return;
  }

  if (gameMsg.flags && gameMsg.flags.has("LOADING")) {
    try {
      gameMsg = await waitForUpdate(gameMsg);
    } catch (err) {
      console.error("Error waiting for initial update:", err);
      return;
    }
  }

  return Promise.resolve(winGame(gameMsg.embeds[0]));
}

function wait(ms) {
  return new Promise(resolve => setTimeout(resolve, ms));
}

async function doHomeWork(botMessgae) {
  const embed = botMessgae.embeds[0];
  if (!embed) return;
  const values = embed.fields[0].value;
  const questions = values.split(/第\d題/).slice(1);
  const correctAnswers = questions.map((q, i) => {
    console.log(`\n--- Question ${i + 1} ---`);
    console.log("Raw:", q);

    // Extract expression from question
    const exprMatch = q.match(/：(.+?)=/);
    if (!exprMatch) {
      console.log("❌ Failed to extract expression.");
      return "?";
    }

    let rawExpr = exprMatch[1]
      .replace(/×/g, "*")
      .replace(/−/g, "-")
      .replace(/÷/g, "/")
      .replace(/\s/g, ""); // remove any extra spaces

    console.log("🧮 Extracted expression:", rawExpr);

    let correctValue;
    try {
      correctValue = eval(rawExpr);
      console.log("✅ Evaluated result:", correctValue);
    } catch (err) {
      console.log("❌ Eval failed:", err);
      return "?";
    }

    // Extract options
    const options = [...q.matchAll(/\((A|B|C)\)\s(\d+)/g)];
    if (options.length === 0) {
      console.log("❌ No answer options found.");
      return "?";
    }

    console.log("📋 Options:");
    options.forEach(([_, letter, val]) => {
      console.log(` - ${letter}: ${val}`);
    });

    for (const [_, letter, value] of options) {
      if (parseInt(value) === correctValue) {
        console.log(`🎯 Correct Answer: ${letter}`);
        return letter;
      }
    }

    console.log("❌ No matching answer found.");
    return "?";
  });

  console.log("\n✅ Final Answers:", correctAnswers);

  for (const answer of correctAnswers) {
    const buttons = botMessgae.components[0].components;
    const correct = buttons.find((b) => b.label === answer);
    if (!correct) {
      console.log(`❌ Couldn't find button for answer: ${answer}`);
      continue;
    }

    tryClick(() => botMessgae.clickButton(correct.customId), correct.customId);
    botMessgae = await waitForUpdate(botMessgae);
    await wait(750);
  }

  const submitButton = botMessgae.components[0].components.find(
    (b) => b.label === "交作業"
  );
  if (submitButton) {
    await tryClick(
      () => botMessgae.clickButton(submitButton.customId),
      submitButton.label
    );
  } else {
    console.log("❌ Submit button not found.");
  }
}

async function pickRubbish(botMessgae) {
  console.log("🧹 picking rubbish");

  while (true) {
    // Flatten all buttons from all action rows
    let buttons = [];
    botMessgae.components.forEach((row) => {
      buttons = buttons.concat(row.components);
    });

    if (!buttons.length) {
      console.log("❌ no buttons");
      break;
    }

    // Find the first rubbish button (not 🟩)
    const rubbishButton = buttons.find((b) => b.emoji?.name !== "🟩");

    if (!rubbishButton) {
      console.log("✅ no rubbish left");

      const submitButton = buttons.find((b) => b.label === "交作業");
      if (!submitButton) {
        console.log("❌ No submit button found.");
        return;
      }

      console.log("📤 submitting...");
      await tryClick(
        () => botMessgae.clickButton(submitButton.customId),
        submitButton.label
      );
      break;
    }

    console.log("🗑️ clicking rubbish:", rubbishButton.customId);

    await tryClick(
      () => botMessgae.clickButton(rubbishButton.customId),
      rubbishButton.customId
    );

    botMessgae = botMessgae.channel.messages.fetch(botMessgae.id);
  }
  console.log("finished clean", botMessgae.id);
}


function splitSyllable(syl) {
  const toneMarks = ["ˊ", "ˇ", "ˋ", "˙"];
  let tone = "˙";
  if (toneMarks.includes(syl.slice(-1))) {
    tone = syl.slice(-1);
    syl = syl.slice(0, -1);
  }
  // finals that are 2‑char
  const finals2 = ["ㄞ", "ㄟ", "ㄠ", "ㄡ", "ㄢ", "ㄣ", "ㄤ", "ㄥ"];
  const units = [];
  if (syl.length === 2 && finals2.includes(syl.slice(1))) {
    units.push(syl[0], syl.slice(1));
  } else {
    syl.split("").forEach((ch) => units.push(ch));
  }
  if (tone) {
    units.push(tone);
  } else units.push("˙");
  return units;
}

async function phonets(botMessage) {
  console.log("🧹 Starting phonetics quiz for", botMessage.id);

  const embed = botMessage.embeds[0];
  if (!embed) return console.error("❌ No embed found");

  // 1) Extract the word from field.name
  const field = embed.fields[0];
  const nameMatch = field.name.match(/題目：\s*(.+)/);
  if (!nameMatch) {
    return console.error("❌ Cannot find '題目：' in field name:", field.name);
  }
  const word = nameMatch[1].trim();
  console.log("🔍 Word to phoneticize:", word);

  // 2) Lookup its phonetic syllables
  const rawSeq = await getPhonetic(botMessage, word);
  if (!rawSeq.length) {
    return console.error("❌ No phonetic mapping for word:", word);
  }
  console.log("✅ raw phonetic sequence:", rawSeq);

  // 3) Build the **ordered** click‑sequence
  const clickSeq = rawSeq.flatMap(splitSyllable);
  console.log("✅ full click sequence:", clickSeq);

  // 4) Iterate, click each, then submit
  while (true) {
    // refetch fresh state
    botMessage = await botMessage.channel.messages.fetch(botMessage.id);

    let buttons = botMessage.components.flatMap((r) => r.components);

    for (const label of clickSeq) {
      await wait(1000);
      botMessage = await botMessage.channel.messages.fetch(botMessage.id);
      buttons = botMessage.components.flatMap((r) => r.components);

      // refetch buttons each time if needed…
      const btn = buttons.find(
        (b) => b.label === label && b.style !== "SUCCESS"
      );
      if (!btn) {
        console.log(label, "not found");

        continue;
        
      } ;

      console.log("🖱️ Clicking:", label);
      // ✨ Await the click helper so we actually pause until it completes
      tryClick(() => botMessage.clickButton(btn.customId), label);

      // Wait for the message to update
      botMessage = await waitForUpdate(botMessage);

      // Pause before next click
      await wait(500);
    }

    // verify everything is now green
    const fresh = await botMessage.channel.messages.fetch(botMessage.id);
    const allBtns = fresh.components.flatMap((r) => r.components);

    // submit
    const submit = allBtns.find((b) => ["交卷", "交作業"].includes(b.label));
    if (!submit) {
      return console.error("❌ Submit button missing");
    }
    console.log("📤 Submitting quiz");
    await tryClick(() => botMessage.clickButton(submit.customId), "submit");
    break;
  }

  console.log("✅ Done with phonetics quiz for", botMessage.id);
}

function wrapText(ctx, text, maxWidth) {
  const words = text.split(" ");
  const lines = [];
  let line = "";

  for (let i = 0; i < words.length; i++) {
    const testLine = line + words[i] + " ";
    const metrics = ctx.measureText(testLine);
    const testWidth = metrics.width;
    if (testWidth > maxWidth && i > 0) {
      lines.push(line.trim());
      line = words[i] + " ";
    } else {
      line = testLine;
    }
  }
  lines.push(line.trim());
  return lines;
}

async function generateQuoteImage(username, avatarURL, messageText) {
  const width = 800;
  const height = 400;
  const canvas = createCanvas(width, height);
  const ctx = canvas.getContext("2d");

  // Radial gradient: white outer → black center
  const gradient = ctx.createRadialGradient(
    width / 2,
    height / 2,
    0,
    width / 2,
    height / 2,
    Math.sqrt(width ** 2 + height ** 2) * 1.5
  );
  gradient.addColorStop(0, "#000000");
  gradient.addColorStop(1, "#ffffff");
  ctx.fillStyle = gradient;
  ctx.fillRect(0, 0, width, height);

  // Draw avatar
  const avatar = await loadImage(avatarURL);
  const avatarSize = 64;
  ctx.save();
  ctx.beginPath();
  ctx.arc(
    avatarSize / 2 + 20,
    avatarSize / 2 + 20,
    avatarSize / 2,
    0,
    Math.PI * 2
  );
  ctx.closePath();
  ctx.clip();
  ctx.drawImage(avatar, 20, 20, avatarSize, avatarSize);
  ctx.restore();

  // Draw username
  ctx.fillStyle = "#ffffff";
  ctx.font = "bold 24px Sans";

  // Draw quoted message (centered)
  ctx.fillStyle = "#ffffff";
  ctx.font = "italic 28px Serif";
  const lines = wrapText(ctx, `"${messageText}"\n\n-${username}`, 700);

  const totalHeight = lines.length * 40;
  const startY = height / 2 - totalHeight / 2;

  lines.forEach((line, i) => {
    const textWidth = ctx.measureText(line).width;
    const x = (width - textWidth) / 2;
    ctx.fillText(line, x, startY + i * 40);
  });

  // Save or return buffer
  return canvas.toBuffer("image/png");
}

function waitForUpdate(msg) {
  return new Promise((resolve, reject) => {
    const timeout = setTimeout(() => {
      console.log("Timeout while waiting for message update.");
      reject("timeout");
    }, 15 * 60 * 1000);

    const handler = (oldMsg, newMsg) => {
      if (oldMsg.id === msg.id) {
        clearTimeout(timeout);
        msg.client.off("messageUpdate", handler);
        resolve(newMsg);
      }
    };

    msg.client.on("messageUpdate", handler);
  });
}

async function tryClick(fn, label) {
  const maxAttempts = 3;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try {
      console.log(`${label}: Attempt ${attempt}`);
      await fn();
      return true;
    } catch (err) {
      console.warn(`${label} failed on attempt ${attempt}:`, err);
      if (attempt < maxAttempts) {
        await wait(750); // wait before retrying
      } else {
        console.error(`${label} failed after ${maxAttempts} attempts.`);
      }
    }
  }
  return false;
}

client.login(
  "user-token"
);
