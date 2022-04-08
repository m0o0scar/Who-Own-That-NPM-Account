#!/usr/bin/env node

const md5 = require("md5");
const jwtDecode = require("jwt-decode");
const { program } = require('commander');
const { version, description } = require('./package.json');
const getAvatarUrl = require("./src/npm");

program
  .name('Who Own That NPM Account')
  .description(description)
  .version(version)
  .option('-a, --account <string>', 'NPM account name')
  .option('-e, --email <string>', 'one or more email addresses (separate by comma)')
  .parse();

const { account, email } = program.opts();
if (!account || !email) {
  program.help();
}

async function main() {
  try {
    // get the JWT token from npm user avatar
    console.log('[>] fetching npm user avatar ...');
    const avatar = await getAvatarUrl(account);
    const jwtToken = avatar.match(/npm-avatar\/.+\.(.+)\./)[1];

    // decode the JWT token, get the gravatar url hash
    console.log('[>] decoding avatar hash ...');
    const decoded = jwtDecode(jwtToken, {header:true});
    const hash = decoded.avatarURL.match(/avatar\/(.+)\?/)[1];

    // check against given email addresses
    const addresses = email.split(',');
    for (const address of addresses) {
      const emailHash = md5(address);
      if (emailHash === hash) {
        console.log(`[Y] NPM account ${account} is owned by ${address}`);
        return;
      } else {
        console.warn(`[N] ${address} not match`);
      }
    }
    console.warn(`can't find owner of ${account} from given email addresses`);
  } catch (error) {
    console.error('ERROR', error);
  }
}

main();