const { rudhra, mode, linkPreview, runtime } = require("../lib/");

rudhra({
    pattern: "uptime",
    type: "info",
    desc: "Shows bot uptime.",
    fromMe: mode,
  },
  async (message, match) => {
    const uptimeText = `*Current uptime: ${runtime(process.uptime())}*`;
    return await message.send(uptimeText, {
		linkPreview: linkPreview()
	})
});
  
rudhra({
    pattern: 'ping ?(.*)',
    desc: 'check bot speed',
    react: "🚀",
    fromMe: mode,
    type: 'info'
}, async (message, match) => {
    const start = new Date().getTime();
    const msg = await message.send('Checking!');
    const end = new Date().getTime();
    const responseTime = (end - start) / 1000;
    return await msg.edit(`*Response: ${responseTime} secs*`);
});
