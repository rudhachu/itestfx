const {
    rudhra,
    getJson,
    isUrl,
    mode
} = require("../lib/");
const fetch = require('node-fetch');
const yts = require("yt-search");

// Helper functions to detect URLs
const isIgUrl = (text) => /(https?:\/\/(?:www\.)?instagram\.com\/p\/[\w-]+\/?)/.test(text);
const isFbUrl = (text) => /(https?:\/\/(?:www\.)?(?:facebook\.com|fb\.com|fb\.watch)\/[^\s]+)/.test(text);
const isYtUrl = (text) => /(https?:\/\/(?:www\.)?(?:youtube\.com\/watch\?v=|youtu\.be\/)[\w-]+)/.test(text);

// Plugin to handle auto media downloads
rudhra({
    on: "text",
    fromMe: mode,
    desc: "Auto download media from any URL",
    type: "auto",
}, async (message, match) => {
    const text = match;

    if (isIgUrl(text)) {
        await downloadInstaMedia(message, text);
    } else if (isFbUrl(text)) {
        await downloadFacebookMedia(message, text);
    } else if (isYtUrl(text)) {
        await downloadYoutubeMedia(message, text);
    }
});

// **Instagram Media Downloader**
const downloadInstaMedia = async (message, match) => {
    try {
        await message.reply("_Downloading..._");

        const regex = /(https?:\/\/[^\s]+)/;
        const Inurl = match.match(regex)[0];

        const { result, status } = await getJson(`https://api-25ca.onrender.com/api/instagram?url=${Inurl}`);

        if (!status || result.length < 1) {
            return await message.reply("*No media found!*");
        }

        await message.reply("_Uploading media... ⎙_", { quoted: message.data });

        for (const url of result) {
            await message.sendFromUrl(url);
        }
    } catch (error) {
        console.error(error);
        await message.reply("*Failed to fetch media.*\n_Please try again later._");
    }
};

// **Facebook Media Downloader**
const downloadFacebookMedia = async (message, match) => {
    try {
        await message.reply("_Downloading..._");

        const regex = /(https?:\/\/[^\s]+)/;
        const link = match.match(regex)[0];

        const fbApi = `https://api.siputzx.my.id/api/d/igdl?url=${link}`;
        const res = await fetch(fbApi);

        if (!res.ok) {
            return await message.reply("Please try again.");
        }

        await message.reply("_Uploading media... ⎙_", { quoted: message.data });

        const data = await res.json();
        const igmedia = data.data;

        if (igmedia && igmedia.length > 0) {
            let counter = 0;
            for (const media of igmedia) {
                if (counter >= 10) break;
                await message.sendFile(media.url);
                counter++;
            }
        } else {
            await message.reply("No media found for the provided URL.");
        }
    } catch (error) {
        console.error(error);
        await message.reply("*Error fetching media.*");
    }
};

// **YouTube Media Downloader**
const downloadYoutubeMedia = async (message, match) => {
    try {
        await message.reply("_Downloading..._");

        // Extract YouTube link from message
        const regex = /(https?:\/\/[^\s]+)/;
        const linkMatch = match.match(regex);
        if (!linkMatch) return message.reply("Invalid YouTube link.");

        const link = linkMatch[0];
        const ytApi = `https://api.siputzx.my.id/api/d/ytmp4?url=${link}`;
        
        // Fetch video details
        const response = await fetch(ytApi);
        const result = await response.json();
        
        if (!result || !result.data || !result.data.dl) {
            return message.reply("Failed to fetch media. Please try again.");
        }

        const { dl: mp4, title } = result.data;

        // Send media selection menu
        const optionsText = `*${title}*\n\n *1.* *Video*\n *2.* *Audio*\n *3.* *Document*\n\n*Reply with a number to download*`;
        const contextInfoMessage = {
            text: optionsText,
            contextInfo: {
                externalAdReply: {
                    title: "𝗬𝗼𝘂𝗧𝘂𝗯𝗲 𝗗𝗼𝘄𝗻𝗹𝗼𝗮𝗱𝗲𝗿",
                    body: "ʀᴜᴅʜʀᴀ ʙᴏᴛ",
                    sourceUrl: link,
                    mediaUrl: link,
                    mediaType: 1,
                    showAdAttribution: true,
                    thumbnailUrl: "https://i.imgur.com/xWzUYiF.png"
                }
            }
        };

        const sentMsg = await message.client.sendMessage(message.jid, contextInfoMessage, { quoted: message.data });

        // Wait for user response
        conn.ev.on('messages.upsert', async (msg) => {
        const newMessage = msg.messages[0];
            
            if (
                newMessage.key.remoteJid === message.jid &&
                newMessage.message?.extendedTextMessage?.contextInfo?.stanzaId === sentMsg.key.id
            ) {
                const userReply = newMessage.message?.conversation || newMessage.message?.extendedTextMessage?.text;

                if (userReply === '1') {
                    await message.client.sendMessage(
                        message.jid,
                        { video: { url: mp4 }, mimetype: "video/mp4" },
                        { quoted: message.data }
                    );
                } else if (userReply === '2') {
                    await message.client.sendMessage(
                        message.jid,
                        { audio: { url: mp4 }, mimetype: "audio/mpeg" },
                        { quoted: message.data }
                    );
                } else if (userReply === '3') {
                    await message.client.sendMessage(
                        message.jid,
                        {
                            document: { url: mp4 },
                            mimetype: 'audio/mpeg',
                            fileName: `${title}.mp3`,
                            caption: `_${title}_`
                        },
                        { quoted: message.data }
                    );
                } else {
                    await message.client.sendMessage(message.jid, { text: "Invalid option. Reply with 1, 2, or 3." });
                }
            }
        });

    } catch (error) {
        console.error("Error in downloadYoutubeMedia:", error);
        message.reply("An error occurred. Please try again later.");
    }
};
