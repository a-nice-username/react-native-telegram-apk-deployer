#! /usr/bin/env node

const commander = require('commander')
const path = require('path')
const { spawn } = require('child_process')

commander
    .version(require('./package.json').version)
    .description('Quick React-Native Deploy to Telegram')
    .action(() => spawn('npx', ['ts-node', path.join(__dirname, '/main-menu.js')], {stdio: 'inherit'}))

commander
    .command('deploy')
    .action(() => spawn('npx', ['ts-node', path.join(__dirname, '/deploy.js')], {stdio: 'inherit'}))

commander.parse(process.argv)