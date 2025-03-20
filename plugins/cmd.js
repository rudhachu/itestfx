const {
    rudhra,
    personalDB
} = require("../lib")

rudhra({
    pattern: 'setcmd',
    desc: 'set sticker as command',
    react: "😛",
    type: "action",
    fromMe :true,
    media: "sticker"//you can get this type of active action from 'eval'=>() return lib.commands[0]
}, async (message, match) => {
    if (!message.reply_message.msg?.fileSha256) return message.send('_Internal server error!_')
    if (!match) return await message.send('_which command?!_')
    await personalDB(['sticker_cmd'], {content:{[match]: message.reply_message.msg.fileSha256.join("")}},'add');
    return await message.reply(`_successfully set command *${match}*_`)
});
rudhra({
    pattern: 'dltcmd',
    desc: 'delete a media command',
    react: "💥",
    type: "action",
    fromMe :true
}, async (message, match) => {
    if (!match) return await message.send('_which command?!_')
    await personalDB(['sticker_cmd'], {content:{id: match}},'delete');
    return await message.reply(`_successfully removed command *${match}*_`)
});
rudhra({
    pattern: 'getcmd',
    desc: 'get list of sticker command',
    react: "💥",
    type: "action",
    fromMe :true
}, async (message, match) => {
    const {sticker_cmd} = await personalDB(['sticker_cmd'], {content:{}},'get');
    if(!Object.keys(sticker_cmd)[0]) return await message.send('_Not Found_');
    let cmds = '*LIST OF MEDIA COMMAND*' +'\n\n';
    let n = 1;
    for(const cmd in sticker_cmd) {
        cmds += '```'+`${n++}  ${cmd}`+'```'+`\n`
    };
    return await message.reply(cmds)
});
