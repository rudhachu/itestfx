let commands = [];
function rudhra(info, func) {
  commands.push({...info, function: func});
  return info;
}
module.exports = { rudhra, commands };
