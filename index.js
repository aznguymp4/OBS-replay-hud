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

try {
    obs.connect(process.env.IP, process.env.AUTH)
    .then(console.log)
    .catch(console.error)
    .finally(()=>{
        app.use(express.static('public'));
        app.use(express.json());
        app.get('/', (req,res) => {
            res.contentType('html')
            return res.send(homePage)
        })
        app.get('/save', (req,res) => {
            obs.once('ReplayBufferSaved', val => {
                const vidPath = val.savedReplayPath
                // const vidPath = '/Users/erichnguyen/Movies/OBS/Replay_2023-11-16_12-20-07.mp4'
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
            // setTimeout(()=>{res.json({url:'https://youtu.be/Wq_hA5Q5EXQ'})}, 1000)
        })
    
        app.listen(process.env.API_PORT, () => console.log('Server is listening on port', +process.env.API_PORT));    
    })
    // console.log('OBS client connected!')
} catch (error) {
    console.error('Failed to connect', error.code, error.message);
}
