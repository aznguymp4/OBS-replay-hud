const express = require('express')
const app = express()
const fs = require('fs')
const path = require('path')
const OBSWebSocket = require('obs-websocket-js').default
const obs = new OBSWebSocket()
const homePage = fs.readFileSync(path.join(__dirname, './public/page.html'))
const {uploadVideo} = require('./upload.js')
require('dotenv').config()
const TAGS = 'DDR,DanceDanceRevolution,dance,revolution,rhythm,game,a3,a20,plus,a20plus,ace,babylon,galaxy'.split(',')

require('child_process').exec((process.platform == 'darwin'? 'open': process.platform == 'win32'? 'start': 'xdg-open') + ' http://localhost:'+process.env.HOSTING_PORT);

try {
    obs.connect(process.env.OBS_WS_IP, process.env.OBS_WS_PASS)
    .then(d=>console.log(`Connected to obs-websocket v${d.obsWebSocketVersion}`))
    .catch(console.error)
    .finally(()=>{
        app.use(express.static('public'))
        app.use(express.json())
        app.get('/', (req,res) => {
            res.contentType('html')
            return res.send(homePage)
        })
        app.get('/save', (req,res) => {
            obs.once('ReplayBufferSaved', val => {
                const vidPath = val.savedReplayPath
                console.log('saved,', vidPath)
                return res.json({
                    success: true,
                    path: vidPath
                })
            })
            obs.call('SaveReplayBuffer')
        })
        app.post('/upload', (req,res)=>{
            const {title,desc,vidPath} = req.body
            uploadVideo(title, desc, TAGS, vidPath)
            .then(vid => {
                res.json({
                    url: 'https://youtu.be/'+vid.id,
                    id: vid.id,
                    title: vid.snippet.title
                })
            })
            .catch(e => {
                res.statusCode(500)
                res.json({
                    success: false,
                    msg: e
                })
            })
        })

        obs.call('StartReplayBuffer')
        app.listen(process.env.HOSTING_PORT, () => console.log('Server is running!', 'http://localhost:'+process.env.HOSTING_PORT))
    })
} catch (error) {
    console.error('Failed to connect', error.code, error.message)
}
