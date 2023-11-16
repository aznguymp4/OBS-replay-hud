const E = {};
['saveBtn','blur','modal','vidName','vidDesc','uploadBtn','cancelBtn','qrcode','mostRecentTitle','mostRecentThumb','mostRecent']
.map(k=>E[k]=document.getElementById(k))
const saveBtnOldTxt = E.saveBtn.textContent
const upldBtnOldTxt = E.uploadBtn.textContent

const checkEmpty = ()=>E.uploadBtn.disabled = !(E.vidName.value && E.vidDesc.value)
E.vidName.addEventListener('input',checkEmpty)
E.vidDesc.addEventListener('input',checkEmpty)

let [saving,uploading] = [false,false]
E.saveBtn.addEventListener('click', e=>{
    if(saving) return
    saving = true
    E.saveBtn.textContent = 'Saving...'

    fetch('/save')
    .then(r=>r.json())
    .then(d => {
        console.log(d)
        if(!d.success) return alert('Error saving replay!')
        
        E.vidName.value = d.path.split('/').slice(-1)[0].replace('.mp4','')
        E.vidDesc.value = ''
        checkEmpty()
        E.uploadBtn.dataset.path = d.path
        E.blur.dataset.visible = 1
        E.modal.dataset.visible = 1
    })
    .catch(console.error)
    .finally(()=>{
        saving = false
        E.saveBtn.textContent = saveBtnOldTxt
    })
})

E.cancelBtn.addEventListener('click', e=> {
    E.blur.dataset.visible = 0
    E.modal.dataset.visible = 0
})

E.uploadBtn.addEventListener('click', e=> {
    if(uploading) return alert('Wait for the current video to finish uploading!')
    uploading = true
    E.uploadBtn.textContent = 'Uploading video...'
    E.uploadBtn.disabled = true

    fetch('/upload', {
        headers: {'Content-Type':'application/json'},
        method: 'POST',
        body: JSON.stringify({
            title: E.vidName.value.trim(),
            desc: E.vidDesc.value.trim(),
            vidPath: E.uploadBtn.dataset.path
        })
    })
    .then(r=>r.json())
    .then(vid => {
        localStorage.setItem('recentUrl', vid.url)
        localStorage.setItem('recentTitle', vid.title.trim())
        localStorage.setItem('recentThumb', `https://i3.ytimg.com/vi/${vid.id}/maxresdefault.jpg`)
        makeQR()
    })
    .finally(()=>{
        E.blur.dataset.visible = 0
        E.modal.dataset.visible = 0
        E.uploadBtn.textContent = upldBtnOldTxt
        E.uploadBtn.disabled = false
        uploading = false
    })
})

if(!localStorage.getItem('recentUrl')) localStorage.setItem('recentUrl', 'https://youtu.be/gbO6r74yptc')
if(!localStorage.getItem('recentTitle')) localStorage.setItem('recentTitle', '[aznguy] TWO MFCs IN A ROW!')
if(!localStorage.getItem('recentThumb')) localStorage.setItem('recentThumb', 'https://i3.ytimg.com/vi/gbO6r74yptc/maxresdefault.jpg')
const makeQR = () => {
    const url = localStorage.getItem('recentUrl')
    E.mostRecent.classList.add('animate__bounce')
    setTimeout(()=>{
        E.qrcode.innerHTML=''
        new QRCode(E.qrcode, {
            text: url,
            width: 128,
            height: 128,
            colorDark : "#000000",
            colorLight : "#ffffff",
            correctLevel : QRCode.CorrectLevel.H
        })
        E.mostRecentTitle.textContent = localStorage.getItem('recentTitle')
        E.mostRecentTitle.href = url
        E.mostRecentThumb.src = localStorage.getItem('recentThumb')
    },500)
    setTimeout(()=>E.mostRecent.classList.remove('animate__bounce'),1000)
}
makeQR()