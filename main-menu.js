const fs = require('fs')
const inquirer = require('inquirer')
const path = require('path')

showMainMenu()

function showMainMenu() {
    let hasTelegramCredential = true

    if (!fs.existsSync(`${process.cwd()}/telegram-credential.js`)) {
        hasTelegramCredential = false
    } else {
        const { token, chat_id } = require(`${process.cwd()}/telegram-credential.js`)

        if (token == undefined || token == '' || chat_id == undefined || chat_id == '') {
            hasTelegramCredential = false
        }
    }

    inquirer.prompt([
        {
            type: 'list',
            name: 'choice',
            message: 'APK Deployer Menu',
            choices: hasTelegramCredential ?
                [
                    'Configure Telegram Credential',
                    'Deploy APK to Telegram Bot',
                    'Exit'
                ]
                :
                [
                    'Configure Telegram Credential',
                    'Exit'
                ],
            default: 'Configure Telegram Credential'
        }
    ])
    .then(async({choice}) => {
        const { spawn } = require('child_process')

        if (choice == 'Configure Telegram Credential') {
            inquirer.prompt([
                {
                    type: 'input',
                    name: 'new_token',
                    message: 'Telegram Bot Token :'
                },
                {
                    type: 'input',
                    name: 'new_chat_id',
                    message: 'Chat ID :'
                }
            ])
            .then(({new_token, new_chat_id}) => {
                const credential = `module.exports = ${JSON.stringify({
                    token: new_token,
                    chat_id: new_chat_id,
                    filename: 'app-release.apk'
                }, null, 2)}\n`

                fs.writeFile('./telegram-credential.js', credential, 'utf8', () => {
                    console.log('Telegram credential added with filename \'app-release.apk\'')

                    showMainMenu()
                })
            })
        } else if (choice == 'Deploy APK to Telegram Bot') {
            spawn('npx', ['ts-node', path.join(__dirname, '/deploy.js')], {stdio: 'inherit'})
        }
    })
}
