const {
    plugin,
    mode,
    getJson,
    getBuffer,
    PREFIX,
    toAudio,
    toPTT,
    toVideo,
    ffmpeg,
    isAdmin,
    isBotAdmin,
    parsedJid,
    isNumber,
    getRandom,
    qrcode,
    isIgUrl,
    imageToWebp,
    videoToWebp,
    writeExifImg,
    writeExifVid,
    writeExifWebp,
    parsedUrl,
    isUrl,
    jsonFormat,
    formatTime,
    getFile,
    sleep,
    serialize,
    Imgur,
    numToJid,
    sudoIds,
    postJson,
    Imgbb,
    getUrl,
    igdl,
    uploadToServer
} = require("../lib/");

const {
    extensionForMediaMessage,
    extractMessageContent,
    jidNormalizedUser,
    getContentType,
    normalizeMessageContent,
    proto,
    delay,
    areJidsSameUser,
    downloadContentFromMessage,
    getBinaryNodeChild,
    WAMediaUpload,
    generateForwardMessageContent,
    generateLinkPreviewIfRequired,
    generateWAMessageFromContent,
    getBinaryNodeChildren
} = require("@whiskeysockets/baileys");

const bs = require("@whiskeysockets/baileys");
const lib = require('../lib');
const util = require("util");
const Config = require("../config");
const fs = require('fs');
const axios = require('axios');
const path = require('path');
const cheerio = require('cheerio');

/**
 * **Eval Command (`>`)**
 * - Evaluates JavaScript code from user input.
 * - Restricted to owner usage.
 */
plugin({
    on: "all",
    fromMe: true,
    onlyPm: false,
    onlyGroup: false,
    pattern: 'eval',
    desc: 'Executes JavaScript code and returns output',
    react: "💥",
    type: "owner",
    usage: "Use `> code` to evaluate JavaScript"
}, async (message, Texts, cmd, chatUpdate, match, client) => {
    let m = message, sock = c = conn = message.client;
    if (!message.body.trim().startsWith('>')) return;

    let inputCode = message.body.replace('>', '').trim();
    try {
        let evaled = await eval(`(async () => { ${inputCode} })()`);
        if (typeof evaled !== "string") evaled = await util.inspect(evaled);
        await message.reply(evaled);
    } catch (err) {
        await message.reply(util.format(err));
    }
});

/**
 * **Shell Command (`$`)**
 * - Executes JavaScript code using `$` prefix.
 * - Returns results or errors.
 */
plugin({
    on: 'text',
    fromMe: true,
    dontAddCommandList: true
}, async (message, match, client) => {
    if (message.message.startsWith("$")) {
        let m = message;
        let conn = message.client;
        const json = (x) => JSON.stringify(x, null, 2);

        try {
            let return_val = await eval(`(async () => { ${message.message.replace("$", "")} })()`);
            if (return_val && typeof return_val !== 'string') return_val = util.inspect(return_val);
            if (return_val) await message.send(return_val || "No return value");
        } catch (e) {
            if (e) await message.send(util.format(e));
        }
    }
});
