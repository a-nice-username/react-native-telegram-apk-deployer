const FormData = require('form-data')
const fs = require('fs')
const pretty = require('prettysize')
const userName = require('git-user-name')
const wifiName = require('wifi-name')

deploy()

async function deploy() {
    if (!fs.existsSync(`${process.cwd()}/telegram-credential.js`)) {
        console.log('Telegram credential is invalid, please configure using npm run deployer')
    
        return
    }
    
    const { token, chat_id, filename, additional_message } = require(`${process.cwd()}/telegram-credential`)
    
    if (token == undefined || token == '' || chat_id == undefined || chat_id == '') {
        console.log('Telegram credential is invalid, please configure using npm run deployer')
    
        return
    }

    if (typeof filename != 'string') {
        console.log('Telegram credential filename is invalid')

        return
    }
    
    const filepath = `./android/app/build/outputs/apk/release/${filename}`
    
    if (!fs.existsSync(filepath)) {
        console.log(`Build file of ${filename} not found`)
    
        return
    }
    
    console.log('Processing file upload with size ' + pretty(fs.statSync(filepath).size)) + ' file'
    
    const fileBuffer = fs.readFileSync(filepath)
    const formData = new FormData()
    
    formData.append('chat_id', chat_id)
    
    let chatCaption = `Build success by <pre>${userName() || '<Unknown>'}</pre>\n`
    
    formData.append('caption', `${chatCaption}`)
    formData.append('parse_mode', 'HTML')
    formData.append('document', fileBuffer, { filename, knownLength: fs.statSync(filepath).size })
    
    const startTime = new Date()
    
    const { default: axios } = require('axios')
    
    const wifi_name = await wifiName()
    
    const { spawn } = require('child_process')
    
    const uploadProcess = spawn(
        '/bin/sh',
        [
            '-c',
            `curl -o /tmp/_bu.tmp -# -F "chat_id=${chat_id}" -F document=@${filepath} https://api.telegram.org/bot${token}/sendDocument`
        ],
        {
            stdio: 'inherit'
        }
    )
    
    uploadProcess.on('error', err => {
        throw err
    })
    
    uploadProcess.on('exit', () => {
        const time = ((new Date()).getTime() - startTime.getTime()) / 1000

        chatCaption += `\nUpload time: ${time.toFixed(2)}s ${wifi_name != undefined ? `(WiFi: <b>${wifi_name}</b>)` : ''}\n`

        if (typeof additional_message == 'string') {
            chatCaption += additional_message
        }
    
        axios.post(`https://api.telegram.org/bot${token}/sendMessage`, {
            chat_id,
            parse_mode: 'HTML',
            text: chatCaption
        })
        .then(function () {
            console.log(`Upload file done in ${time.toFixed(2)}s`)
        })
        .catch(function () {
    
        })
    })
}