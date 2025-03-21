const simpleGit = require('simple-git');
const git = simpleGit();
const exec = require('child_process').exec;
const Heroku = require('heroku-client');
const axios = require("axios");
const {
	PassThrough
} = require('stream');
const heroku = new Heroku({
	token: process.env.HEROKU_API_KEY
})
const {
	rudhra,
	GenListMessage,
	linkPreview
} = require('../lib');

rudhra({
	pattern: 'update$',
	fromMe: true,
	desc: 'update the bot',
	type: 'owner'
}, async (message) => {
	if (!message.text) {
		return await message.send({
				name: "𝗖𝗟𝗜𝗖𝗞 𝗔𝗡 𝗢𝗣𝗧𝗜𝗢𝗡",
				values: [{
					name: 'update now',
					id: 'update now'
				}, {
					name: 'update check',
					id: 'update check'
				}],
			withPrefix: true,
			onlyOnce: true,
			participates: [message.sender],
			selectableCount: true
		}, {}, 'poll');
} else if (message.text.includes("now")) {
	await git.fetch();
	let commits = await git.log(['main' + '..origin/' + 'main']);
	if (commits.total === 0) {
		return await message.send('*Already Up-to-date*', {linkPreview: linkPreview()})
	} else {
		await message.send("*Updating...*");
		let al
		try {
			await heroku.get('/apps/' + process.env.HEROKU_APP_NAME)
		} catch {
			await git.reset("hard", ["HEAD"])
			await git.pull()
			await message.send("*Successfully updated. Please manually update npm modules if applicable!*", {linkPreview: linkPreview()})
			process.exit(0);
		}
		git.fetch('upstream', 'main');
		git.reset('hard', ['FETCH_HEAD']);
		const app = await heroku.get('/apps/' + process.env.HEROKU_APP_NAME)
		const git_url = app.git_url.replace("https://", "https://api:" + process.env.HEROKU_API_KEY + "@")
		try {
			await git.addRemote('heroku', git_url);
		} catch (e) {
			console.log(e)
		}
		await git.push('heroku', 'main');
		return await message.send("*Successfully updated*");
	}
} else if (message.text.includes("check")) {
	await git.fetch();
	let commits = await git.log(['main' + '..origin/' + 'main']);
	if (commits.total === 0) {
		return await message.send('*Already up-to-date*', {linkPreview: linkPreview()})
	} else {
		let updates = '𝗟𝗜𝗦𝗧 𝗢𝗙 𝗡𝗘𝗪 𝗨𝗣𝗗𝗔𝗧𝗘𝗦\n\n';
		commits['all'].map(
			(commit) => {
				updates += "```commit: " + commit.date.substring(0, 10)+'```\n```message: ' +commit.message+'```\n```author: ' +commit.author_name + "```\n\n";
			});
		return await message.send(updates);
	}
}
});
