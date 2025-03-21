const {
	rudhra,
	mode,
	getCompo,
	sleep,
	config,
	isAdmin,
	isBotAdmin
} = require('../lib');
const {
	WA_DEFAULT_EPHEMERAL
} = require("@whiskeysockets/baileys");

rudhra({
        pattern: 'whois ?(.*)',
        fromMe: mode,
        type: 'info',
        desc: 'get user bio and image'
}, async (message, match) => {
                let user = (message.reply_message.sender || match).replace(/[^0-9]/g, '');
                if (!user) return message.send('_Need a User!_')
                user += '@s.whatsapp.net';
                try {
                        pp = await message.client.profilePictureUrl(user, 'image')
                } catch {
                        pp = 'https://i.imgur.com/b3hlzl5.jpg'
                }
                let status = await message.client.fetchStatus(user)
                const date = new Date(status.setAt);
                const options = {
                        year: 'numeric',
                        month: 'long',
                        day: 'numeric',
                        hour: 'numeric',
                        minute: 'numeric',
                        second: 'numeric'
                };
                const setAt = date.toLocaleString('en-US', options);
                await message.send({
                        url: pp
                }, {
                        caption: `*Name :* ${await message.getName(user)}\n*About :* ${status.status}\n*About Set Date :* ${setAt}`,
                        quoted: message.data
                }, 'image')
})

rudhra({
	pattern: 'dlt',
	desc: 'deleted a message thet send by bot',
	react: "⚒️",
	type: 'whatsapp',
	fromMe: true,
	onlyGroup: true
}, async (message, match) => {
	if (!message.reply_message.text) return;
	return await message.send({
		key: message.reply_message.data.key
	}, {}, 'delete');
});
rudhra({
	pattern: 'del',
	desc: 'delete messages using bot',
	react: "🤌",
	fromMe: mode,
	type: 'whatsapp',
	onlyGroup: true
}, async (message, match) => {
	if (match) return;
	let admin = await isAdmin(message);
	let BotAdmin = await isBotAdmin(message);
	if (!BotAdmin) return await message.reply('bot is not admin');
	if (!message.reply_message.msg) return message.send('*Please reply to a message*');
	return await message.send({
		key: message.reply_message.data.key
	}, {}, 'delete');
})

rudhra({
	pattern: 'jid',
	fromMe: mode,
	desc: 'get jid',
	react: "💯",
	type: "general"
}, async (message) => {
	if (message.reply_message.sender) {
		await message.send(message.reply_message.sender)
	} else {
		await message.send(message.from)
	}
});
rudhra({
	pattern: 'block',
	desc: 'block a user',
	react: "💯",
	type: "owner",
	fromMe: true
}, async (message) => {
	if (message.isGroup) {
		await message.client.updateBlockStatus(message.reply_message.sender, "block") // Block user
	} else {
		await message.client.updateBlockStatus(message.from, "block")
	}
}); // Block user
rudhra({
	pattern: 'unblock',
	desc: 'unblock a person',
	react: "💯",
	type: "owner",
	fromMe: true
}, async (message) => {
	if (message.isGroup) {
		await message.client.updateBlockStatus(message.reply_message.sender, "unblock") // Unblock user
	} else {
		await message.client.updateBlockStatus(message.from, "unblock") // Unblock user
	}
});
rudhra({
	pattern: "pp",
	desc: 'change profile picture',
	react: "😁",
	type: 'owner',
	fromMe: true
}, async (message, match) => {
	if (!message.reply_message.image) return await message.send('*Please reply to a image message*');
	let download = await message.client.downloadMediaMessage(message.reply_message.image);
	await message.client.updateProfilePicture(message.botNumber, download);
	return message.send('*Profile picture updated!*');
});
rudhra({
	pattern: "fullpp",
	desc: 'set profile picture',
	react: "🔥",
	type: 'owner',
	fromMe: true
}, async (message, match) => {
	if (!message.reply_message.image) return await message.send('*Please reply to a image message*');
	let download = await message.reply_message.download();
	await message.updateProfilePicture(message.botNumber, download);
	return message.send('*Profile picture updated!*');
});

rudhra({
	pattern: 'clear ?(.*)',
	fromMe: true,
	desc: 'delete whatsapp chat',
	type: 'whatsapp'
}, async (message, match) => {
	await message.client.chatModify({
		delete: true,
		lastMessages: [{
			key: message.data.key,
			messageTimestamp: message.messageTimestamp
		}]
	}, message.jid)
	await message.send('_Cleared_')
})

rudhra({
	pattern: 'archive ?(.*)',
	fromMe: true,
	desc: 'archive whatsapp chat',
	type: 'whatsapp'
}, async (message, match) => {
	const lstMsg = {
		message: message.message,
		key: message.key,
		messageTimestamp: message.messageTimestamp
	};
	await message.client.chatModify({
		archive: true,
		lastMessages: [lstMsg]
	}, message.jid);
	await message.send('_Archived_')
})

rudhra({
	pattern: 'unarchive ?(.*)',
	fromMe: true,
	desc: 'unarchive whatsapp chat',
	type: 'whatsapp'
}, async (message, match) => {
	const lstMsg = {
		message: message.message,
		key: message.key,
		messageTimestamp: message.messageTimestamp
	};
	await message.client.chatModify({
		archive: false,
		lastMessages: [lstMsg]
	}, message.jid);
	await message.send('_Unarchived_')
})

rudhra({
	pattern: 'chatpin ?(.*)',
	fromMe: true,
	desc: 'pin a chat',
	type: 'whatsapp'
}, async (message, match) => {
	await message.client.chatModify({
		pin: true
	}, message.jid);
	await message.send('_Pined_')
})

rudhra({
	pattern: 'unpin ?(.*)',
	fromMe: true,
	desc: 'unpin a msg',
	type: 'whatsapp'
}, async (message, match) => {
	await message.client.chatModify({
		pin: false
	}, message.jid);
	await message.send('_Unpined_')
})

rudhra({
	pattern: 'setbio ?(.*)',
	fromMe: true,
	desc: 'To change your profile status',
	type: 'whatsapp'
}, async (message, match) => {
	match = match || message.reply_message.text
	if (!match) return await message.send('*Need Status!*\n*Example: setbio Hey there! I am using WhatsApp*.')
	await message.client.updateProfileStatus(match)
	await message.send('_Profile status updated_')
})

rudhra({
	pattern: 'setname ?(.*)',
	fromMe: true,
	desc: 'To change your profile name',
	type: 'whatsapp'
}, async (message, match) => {
	match = match || message.reply_message.text
	if (!match) return await message.send('*Need Name!*\n*Example: setname your name*.')
	await message.client.updateProfileName(match)
	await message.send('_Profile name updated_')
})

rudhra({
	pattern: 'disappear  ?(.*)',
	fromMe: true,
	desc: 'turn on default disappear messages',
	type: 'whatsapp'
}, async (message, match) => {
	await message.client.sendMessage(
		message.jid, {
			disappearingMessagesInChat: WA_DEFAULT_EPHEMERAL
		}
	)
	await message.send('_disappearmessage activated_')
})

rudhra({
	pattern: 'getprivacy ?(.*)',
	fromMe: true,
	desc: 'get your privacy settings',
	type: 'privacy'
}, async (message, match) => {
	const {
		readreceipts,
		profile,
		status,
		online,
		last,
		groupadd,
		calladd
	} = await message.client.fetchPrivacySettings(true);
	const msg = `*MY PRIVACY*

*name :* ${message.client.user.name}
*online:* ${online}
*profile :* ${profile}
*last seen :* ${last}
*read receipt :* ${readreceipts}
*about seted time :*
*group add settings :* ${groupadd}
*call add settings :* ${calladd}`;
	let img;
	try {
		img = {
			url: await message.client.profilePictureUrl(message.user.jid, 'image')
		};
	} catch (e) {
		img = {
			url: "https://i.imgur.com/Zim2VKH.jpeg"
		};
	}
	await message.send(img, {
		caption: msg
	}, 'image');
})
rudhra({
	pattern: 'lastseen ?(.*)',
	fromMe: true,
	desc: 'to change lastseen privacy',
	type: 'privacy'
}, async (message, match, cmd) => {
	if (!match) return await message.send(`_*Example:-* ${cmd} all_\n_to change last seen privacy settings_`);
	const available_privacy = ['all', 'contacts', 'contact_blacklist', 'none'];
	if (!available_privacy.includes(match)) return await message.send(`_action must be *${available_privacy.join('/')}* values_`);
	await message.client.updateLastSeenPrivacy(match)
	await message.send(`_Privacy settings *last seen* Updated to *${match}*_`);
})
rudhra({
	pattern: 'online ?(.*)',
	fromMe: true,
	desc: 'to change online privacy',
	type: 'privacy'
}, async (message, match, cmd) => {
	if (!match) return await message.send(`_*Example:-* ${cmd} all_\n_to change *online*  privacy settings_`);
	const available_privacy = ['all', 'match_last_seen'];
	if (!available_privacy.includes(match)) return await message.send(`_action must be *${available_privacy.join('/')}* values_`);
	await message.client.updateOnlinePrivacy(match)
	await message.send(`_Privacy Updated to *${match}*_`);
})
rudhra({
	pattern: 'mypp ?(.*)',
	fromMe: true,
	desc: 'privacy setting profile picture',
	type: 'privacy'
}, async (message, match, cmd) => {
	if (!match) return await message.send(`_*Example:-* ${cmd} all_\n_to change *profile picture*  privacy settings_`);
	const available_privacy = ['all', 'contacts', 'contact_blacklist', 'none'];
	if (!available_privacy.includes(match)) return await message.send(`_action must be *${available_privacy.join('/')}* values_`);
	await message.client.updateProfilePicturePrivacy(match)
	await message.send(`_Privacy Updated to *${match}*_`);
})
rudhra({
	pattern: 'mystatus ?(.*)',
	fromMe: true,
	desc: 'privacy for my status',
	type: 'privacy'
}, async (message, match, cmd) => {
	if (!match) return await message.send(`_*Example:-* ${cmd} all_\n_to change *status*  privacy settings_`);
	const available_privacy = ['all', 'contacts', 'contact_blacklist', 'none'];
	if (!available_privacy.includes(match)) return await message.send(`_action must be *${available_privacy.join('/')}* values_`);
	await message.client.updateStatusPrivacy(match)
	await message.send(`_Privacy Updated to *${match}*_`);
})
rudhra({
	pattern: 'read ?(.*)',
	fromMe: true,
	desc: 'privacy for read message',
	type: 'privacy'
}, async (message, match, cmd) => {
	if (!match) return await message.send(`_*Example:-* ${cmd} all_\n_to change *read and receipts message*  privacy settings_`);
	const available_privacy = ['all', 'none'];
	if (!available_privacy.includes(match)) return await message.send(`_action must be *${available_privacy.join('/')}* values_`);
	await message.client.updateReadReceiptsPrivacy(match)
	await message.send(`_Privacy Updated to *${match}*_`);
})
rudhra({
	pattern: 'groupadd ?(.*)',
	fromMe: true,
	desc: 'privacy for group add',
	type: 'privacy'
}, async (message, match, cmd) => {
	if (!match) return await message.send(`_*Example:-* ${cmd} all_\n_to change *group add*  privacy settings_`);
	const available_privacy = ['all', 'contacts', 'contact_blacklist', 'none'];
	if (!available_privacy.includes(match)) return await message.send(`_action must be *${available_privacy.join('/')}* values_`);
	await message.client.updateGroupsAddPrivacy(match)
	await message.send(`_Privacy Updated to *${match}*_`);
})
