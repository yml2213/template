/*
二三里极速版 app             cron 25 6-23 * * *  esljsb.js


23/1/30      基本任务

-------------------  青龙-配置文件-复制区域  -------------------
# 二三里极速版
export esljsb=" phone # pwd  @  phone # pwd   "  

多账号用 换行 或 @ 分割  
tg频道: https://t.me/yml2213_tg  
*/
const $ = Env('二三里极速版')
const notify = require('./sendNotify')
const crypto = require('crypto-js')

const envSplitor = ['\n', '&', '@']     //支持多种分割，但要保证变量里不存在这个字符
const ckNames = ['esljsb']                //支持多变量
//====================================================================================================
let DEFAULT_RETRY = 1           // 默认重试次数
//====================================================================================================




async function userTasks() {

    $.log('用户信息', { sp: true, console: false })  // 带分割的打印
    list = []
    for (let user of $.userList) {
        list.push(user.login())
    } await Promise.all(list)


    $.log('任务列表', { sp: true, console: false })
    list = []
    for (let user of $.userList) {
        if (user.ckFlog) {
            list.push(user.tasklist())
            // list.push(user.sleep())
        }
    } await Promise.all(list)

    $.log('走路赚豆', { sp: true, console: false })
    list = []
    if ($.ts('h') == 18) {
        for (let user of $.userList) {
            if (user.ckFlog) {
                let a = ['10', '1000', '3000', '5000', '7000', '10000']
                for (let index = 0; index < a.length; index++) {
                    list.push(user.lifeTask(a[index]))
                }
            }
        } await Promise.all(list)
    } else $.log(`走路赚豆--时间不对, 跳过!`)

    $.log('吃饭赚豆', { sp: true, console: false })
    list = []
    for (let user of $.userList) {
        if (user.ckFlog) {
            list.push(user.eat())
        }
    } await Promise.all(list)


    $.log('睡觉赚豆', { sp: true, console: false })
    list = []
    for (let user of $.userList) {
        if (user.ckFlog) {
            list.push(user.sleep())
        }
    } await Promise.all(list)

    $.log('开宝箱', { sp: true, console: false })
    list = []
    for (let user of $.userList) {
        if (user.ckFlog) {
            list.push(user.openBox())
        }
    } await Promise.all(list)


    $.log('里豆查询', { sp: true, console: false })
    list = []
    for (let user of $.userList) {
        if (user.ckFlog) {
            list.push(user.check())
        }
    } await Promise.all(list)



}


class UserClass {
    constructor(ck) {
        this.idx = `账号[${++$.userIdx}]`
        this.ckFlog = true
        this.ck = ck.split('#')
        this.phone = this.ck[0]
        this.pwd = crypto.MD5(crypto.MD5(this.ck[1]).toString()).toString()
        this.rs = `${$.randomString(8)}-${$.randomString(4)}-${$.randomString(4)}-${$.randomString(4)}-${$.randomString(12)}`
        this.hd = { 'User-Agent': 'oke/3.2.8' }

        this.appVersion = '3.2.8'    // 3.2.8 极速版    7.2.9 正式版
        this.ts = $.ts(10)
        this.salt = 'x3pbkWjH4EiBPbRi1DYKgIiuS9ehOCOk0DkqREOIvffOYtAOQvRXkvmvhe9j13QoT3aOsTP/Y6wLlDhg97RhYnt4y23zgd5AV+UiNgerlmwCjWclOwwf1IvZYX4nAjOdCkGgRAboiU+Gh+UvW+CnXjjFx26vk4Y91Mztq8SjCvCwoaQGHXxfy0VxmsS85BBV3E39Ak12n/EcV+/ihk9uIQwqc3BlvR8miZTGh2EesqSqKm+RiwWAQpYrhaWuN9Zc'
        this.deviceId = 'cf873feaf4509842ae76beec9df158f973633ad268db50cbc22206ba1f98185d'
        this.appId = '2'  // 2 极速版   1 正式版
        this.location = '371681'  // 371681 极速版    371601 正式版

    }


    async login() { // 登录
        let params = {
            'name': this.phone,
            'password': this.pwd,
            'clientType': '3',
            'deviceId': this.deviceId,
            'appId': this.appId,
            'appVersion': this.appVersion,
            'osVersion': '12',
            'timestamp': this.ts,
            'nonce_str': this.rs,
            'location': this.location,
        }
        params.sign = await this.getSign(params)
        // console.log(params)

        let options = {
            fn: '登录',
            method: 'post',
            url: `https://api.ersanli.cn/kilos/apis/passport/login.action`,
            headers: this.hd,
            form: params
        }
        // console.log(options)
        let resp = await $.request(options)
        // console.log(resp)
        if (resp.code == 'A00000') {
            this.userCookie = resp.data.userCookie
            this.nickname = resp.data.userInfo.name
            $.log(`${this.idx}: ${options.fn} ${resp.msg}, ${this.nickname}, 手机号 ${$.phoneNum(resp.data.userInfo.mobile)}`, { notify: true })
            this.ckFlog = true
            await $.wait(2)
        } else console.log(`${options.fn}: 失败,  ${JSON.stringify(resp)}`), this.ckFlog = false

    }

    async tasklist() { // 任务列表 
        let params = {
            'userCookie': this.userCookie,
            'clientType': '3',
            'deviceId': this.deviceId,
            'appId': this.appId,
            'appVersion': this.appVersion,
            'osVersion': '12',
            'timestamp': this.ts,
            'nonce_str': this.rs,
            'location': this.location,
        }
        params.sign = await this.getSign(params)

        let options = {
            fn: '任务列表',
            method: 'post',
            url: `https://api.ersanli.cn/kilos/apis/user/task.action`,
            headers: this.hd,
            form: params
        }
        // console.log(options)
        let resp = await $.request(options)
        // console.log(resp)
        if (resp.code == 'A00000') {

            let tasks = resp.taskList
            for (const task of tasks) {
                // console.log(task)
                let { taskId, taskName, currentCount, maxCount } = task

                if (currentCount < maxCount) {
                    if (taskId == 1) $.log(`${this.idx}: ${taskName}--${currentCount}/${maxCount}`), await this.doSign()    // 每日签到
                    if (taskId == 11) $.log(`${this.idx}: ${taskName}--${currentCount}/${maxCount}`), await this.jsb(taskName)    // 往正式版 - 领取100里豆
                    if (taskId == 2) { // 浏览文章
                        let n = maxCount - currentCount
                        $.log(`${this.idx}: ${taskName}--${currentCount}/${maxCount}`)
                        for (let index = 0; index < n; index++) await this.read(taskName)
                    }

                } else {
                    $.log(`${this.idx}: ${taskName} 已完成`)
                }
            }

        } else console.log(`${options.fn}: 失败,  ${JSON.stringify(resp)}`)

    }

    async doSign() { // 签到
        let params = {
            'userCookie': this.userCookie,
            'areaCode': this.location,
            'clientType': '3',
            'deviceId': this.deviceId,
            'appId': this.appId,
            'appVersion': this.appVersion,
            'osVersion': '12',
            'timestamp': this.ts,
            'nonce_str': this.rs,
            'location': this.location,
        }
        params.sign = await this.getSign(params)
        let options = {
            fn: '签到',
            method: 'post',
            url: `https://api.ersanli.cn/kilos/apis/user/sign.action`,
            headers: this.hd,
            form: params
        }
        // console.log(options)
        let resp = await $.request(options)
        // console.log(resp)
        if (resp.code == 'A00000') {
            $.log(`${this.idx}: ${resp.msg}, 签到第 ${resp.data.sign} 天, 获得里豆 ${resp.data.money}`)
        } else if (resp.code == 'A00007') {
            $.log(`${this.idx}: ${resp.msg}`)
        } else console.log(`${options.fn}: 失败,  ${JSON.stringify(resp)}`)

    }

    async jsb(name) { // 正式版
        let params = {
            'userCookie': this.userCookie,
            'areaCode': this.location,
            'from': 'jsb',
            'clientType': '3',
            'deviceId': this.deviceId,
            'appId': this.appId,
            'appVersion': this.appVersion,
            'osVersion': '12',
            'timestamp': this.ts,
            'nonce_str': this.rs,
            'location': this.location,
        }
        params.sign = await this.getSign(params)
        let options = {
            fn: '正式版',
            method: 'post',
            url: `https://api.ersanli.cn/kilos/apis/user/sign.action`,
            headers: this.hd,
            form: params
        }
        // console.log(options)
        let resp = await $.request(options)
        // console.log(resp)
        if (resp.code == 'A00000') {
            $.log(`${this.idx}: ${name}${resp.msg}`)
        } else console.log(`${options.fn}: 失败,  ${JSON.stringify(resp)}`)

    }

    async read(name) { // 阅读
        let newsId = $.randomInt(123870142596668, 123870142599999)
        let params = {
            'userCookie': this.userCookie,
            'newsId': newsId,
            'clientType': '3',
            'deviceId': this.deviceId,
            'appId': this.appId,
            'appVersion': this.appVersion,
            'osVersion': '12',
            'timestamp': this.ts,
            'nonce_str': this.rs,
            'location': this.location,
        }
        params.sign = await this.getSign(params)

        let options = {
            fn: '阅读',
            method: 'post',
            url: `https://api.ersanli.cn/kilos/apis/news/read.action`,
            headers: this.hd,
            form: params
        }
        // console.log(options)
        let resp = await $.request(options)
        // console.log(resp)
        if (resp.code == 'A00000') {
            $.log(`${this.idx}: ${name} ${newsId}--${resp.msg}`)
            await $.wait($.randomInt(3, 6))
        } else console.log(`${options.fn}: 失败,  ${JSON.stringify(resp)}`)

    }

    async openBox() { // 开宝箱
        let params = {
            'userCookie': this.userCookie,
            'clientType': '3',
            'deviceId': this.deviceId,
            'appId': this.appId,
            'appVersion': this.appVersion,
            'osVersion': '12',
            'timestamp': this.ts,
            'nonce_str': this.rs,
            'location': this.location,
        }
        params.sign = await this.getSign(params)

        let options = {
            fn: '开宝箱',
            method: 'post',
            url: `https://api.ersanli.cn/kilos/apis/user/teapot_open.action`,
            headers: this.hd,
            form: params
        }
        // console.log(options)
        let resp = await $.request(options)
        // console.log(resp)
        if (resp.code == 'A00000') {
            $.log(`${this.idx}: ${options.fn}, ${resp.msg}`)
        } else if (resp.code == 'E00003') {
            $.log(`${this.idx}: ${resp.msg}`)
        } else console.log(`${options.fn}: 失败,  ${JSON.stringify(resp)}`)

    }

    async lifeTask(names) { // 走路赚豆
        let params = {
            'userCookie': this.userCookie,
            'names': names,
            'type': '3',
            'clientType': '3',
            'deviceId': this.deviceId,
            'appId': this.appId,
            'appVersion': this.appVersion,
            'osVersion': '12',
            'timestamp': this.ts,
            'nonce_str': this.rs,
            'location': this.location,
        }
        params.sign = await this.getSign(params)
        let options = {
            fn: '走路赚豆',
            method: 'post',
            url: `https://api.ersanli.cn/kilos/apis/user/life_task.action`,
            headers: this.hd,
            form: params
        }
        // console.log(options)
        let resp = await $.request(options)
        // console.log(resp)
        if (resp.code == 'A00000') {
            $.log(`${this.idx}: ${options.fn} 领取 ${names} 步--${resp.msg}`)
            await $.wait($.randomInt(5, 10))
        } else if (resp.code == 'E00001') {
            $.log(`${this.idx}: 领取 ${names} 步--${resp.msg}`)
        } else console.log(`${options.fn}: 失败,  ${JSON.stringify(resp)}`)

    }

    async eat() { // 吃饭赚豆调度
        let h = $.ts('h')
        if (h >= 7 && h < 10) {
            await this.life_eat('早餐补贴')
        } else if (h >= 12 && h < 14) {
            await this.life_eat('午餐补贴')
        } else if (h >= 18 && h < 19) {
            await this.life_eat('晚餐补贴')
        } else if (h >= 22 && h < 23) {
            await this.life_eat('夜宵补贴')
        } else {
            $.log(`${this.idx}: 吃饭赚豆--时间不对, 跳过!`)
        }

    }

    async life_eat(name) { // 吃饭赚豆 
        let params = {
            'userCookie': this.userCookie,
            'name': name,
            'type': '1',
            'clientType': '3',
            'deviceId': this.deviceId,
            'appId': this.appId,
            'appVersion': this.appVersion,
            'osVersion': '12',
            'timestamp': this.ts,
            'nonce_str': this.rs,
            'location': this.location,
        }
        params.sign = await this.getSign(params)
        params.name = encodeURI(name)

        let options = {
            fn: '吃饭赚豆',
            method: 'post',
            url: `https://api.ersanli.cn/kilos/apis/user/life_task.action`,
            headers: this.hd,
            form: params
        }
        console.log(options)
        let resp = await $.request(options)
        console.log(resp)
        if (resp.code == 'A00000') {
            $.log(`${this.idx}: ${options.fn} 领取 ${name} --${resp.msg}`)
            await $.wait($.randomInt(5, 10))
        } else if (resp.code == 'E00001' || resp.code == 'E00002') {
            $.log(`${this.idx}: 领取 ${name} 步--${resp.msg}`)
        } else console.log(`${options.fn}: 失败,  ${JSON.stringify(resp)}`)

    }

    async sleep() { // 睡觉赚豆调度
        let h = $.ts('h')
        if (h >= 20 && h < 4) {
            $.log(`${this.idx}: 休息时间, 检查是否 休息!`)
            await this.sleepCheck('休息')

        } else if (h >= 12 && h < 14) {
            $.log(`${this.idx}: 午休时间, 检查是否 午休!`)
            await this.sleepCheck('午休')
        } else {
            $.log(`${this.idx}: 不在午休或睡觉时间, 跳过!`)
        }
        if (h == 8) {
            await this.sleepCheck('休息')
        }

    }

    async sleepCheck(name) { // 睡觉检查
        let params = {
            'userCookie': this.userCookie,
            'type': '2',
            'clientType': '3',
            'deviceId': this.deviceId,
            'appId': this.appId,
            'appVersion': this.appVersion,
            'osVersion': '12',
            'timestamp': this.ts,
            'nonce_str': this.rs,
            'location': this.location,
        }
        params.sign = await this.getSign(params)


        let options = {
            fn: '睡觉检查',
            method: 'post',
            url: `https://api.ersanli.cn/kilos/apis/user/life_task.action`,
            headers: this.hd,
            form: params
        }
        // console.log(options)
        let resp = await $.request(options)
        // console.log(resp)
        if (resp.code == 'A00000') {
            if (name == '休息') {
                if (!resp.data[0].sleepStatus) await this.doSleep(name)
            }
            if (name == '午休') {
                if (!resp.data[1].sleepStatus) await this.doSleep(name)
            }

        } else console.log(`${options.fn}: 失败,  ${JSON.stringify(resp)}`)

    }

    async doSleep(name) { // 睡觉 -- 休息
        let params = {
            'userCookie': this.userCookie,
            'name': name,
            'type': '2',
            'clientType': '3',
            'deviceId': this.deviceId,
            'appId': this.appId,
            'appVersion': this.appVersion,
            'osVersion': '12',
            'timestamp': this.ts,
            'nonce_str': this.rs,
            'location': this.location,
        }
        params.sign = await this.getSign(params)
        params.name = encodeURI(name)

        let options = {
            fn: '休息',
            method: 'post',
            url: `https://api.ersanli.cn/kilos/apis/user/life_task.action`,
            headers: this.hd,
            form: params
        }
        // console.log(options)
        let resp = await $.request(options)
        // console.log(resp)
        if (resp.code == 'A00000') {
            $.log(`${this.idx}: ${name}--${resp.msg}`)
            await $.wait($.randomInt(5, 10))
        } else console.log(`${options.fn}: 失败,  ${JSON.stringify(resp)}`)

    }

    async check() { // 查询
        let params = {
            'userCookie': this.userCookie,
            'clientType': '3',
            'deviceId': this.deviceId,
            'appId': this.appId,
            'appVersion': this.appVersion,
            'osVersion': '12',
            'timestamp': this.ts,
            'nonce_str': this.rs,
            'location': this.location,
        }
        params.sign = await this.getSign(params)

        let options = {
            fn: '查询',
            method: 'post',
            url: `https://api.ersanli.cn/kilos/apis/user/wallet.action`,
            headers: this.hd,
            form: params
        }
        // console.log(options)
        let resp = await $.request(options)
        // console.log(resp)
        if (resp.code == 'A00000') {
            $.log(`${this.idx}: ${this.nickname}, 共有豆豆 ${resp.data.gold}个, 今天获得 ${resp.data.withdrawToday}`, { notify: true })
        } else console.log(`${options.fn}: 失败,  ${JSON.stringify(resp)}`)

    }



    async getSign(params) {
        delete params.sign
        let a = new URLSearchParams(Object.entries(params)).toString()
        let sign = crypto.MD5(`${crypto.MD5(a).toString()}${this.salt}`).toString()
        return sign
    }


}


!(async () => {
    console.log(await $.yiyan())
    $.read_env(UserClass)

    await userTasks()

})()
    .catch((e) => $.log(e))
    .finally(() => $.exitNow())



//===============================================================     
function Env(name) {
    return new class {
        constructor(name) {
            this.name = name
            this.startTime = Date.now()
            this.log(`[${this.name}]开始运行`, { time: true })

            this.notifyStr = []
            this.notifyFlag = true

            this.userIdx = 0
            this.userList = []
            this.userCount = 0
        }
        async request(opt) {
            const got = require('got')
            let DEFAULT_TIMEOUT = 8000      // 默认超时时间
            let resp = null, count = 0
            let fn = opt.fn || opt.url
            let resp_opt = opt.resp_opt || 'body'
            opt.timeout = opt.timeout || DEFAULT_TIMEOUT
            opt.retry = opt.retry || { limit: 0 }
            opt.method = opt?.method?.toUpperCase() || 'GET'
            while (count++ < DEFAULT_RETRY) {
                try {
                    resp = await got(opt)
                    break
                } catch (e) {
                    if (e.name == 'TimeoutError') {
                        this.log(`[${fn}]请求超时，重试第${count}次`)
                    } else {
                        this.log(`[${fn}]请求错误(${e.message})，重试第${count}次`)
                    }
                }
            }
            if (resp == null) return Promise.resolve({ statusCode: 'timeout', headers: null, body: null })
            let { statusCode, headers, body } = resp
            if (body) try { body = JSON.parse(body) } catch { }
            if (resp_opt == 'body') {
                return Promise.resolve(body)
            } else if (resp_opt == 'hd') {
                return Promise.resolve(headers)
            } else if (resp_opt == 'statusCode') {
                return Promise.resolve(statusCode)
            }

        }

        log(msg, options = {}) {
            let opt = { console: true }
            Object.assign(opt, options)

            if (opt.time) {
                let fmt = opt.fmt || 'hh:mm:ss'
                msg = `[${this.time(fmt)}]` + msg
            }
            if (opt.notify) {
                this.notifyStr.push(msg)
            }
            if (opt.console) {
                console.log(msg)
            }
            if (opt.sp) {
                console.log(`\n-------------- ${msg} --------------`)
            }
        }
        read_env(Class) {
            let envStrList = ckNames.map(x => process.env[x])
            for (let env_str of envStrList.filter(x => !!x)) {
                let sp = envSplitor.filter(x => env_str.includes(x))
                let splitor = sp.length > 0 ? sp[0] : envSplitor[0]
                for (let ck of env_str.split(splitor).filter(x => !!x)) {
                    this.userList.push(new Class(ck))
                }
            }
            this.userCount = this.userList.length
            if (!this.userCount) {
                this.log(`未找到变量，请检查变量${ckNames.map(x => '[' + x + ']').join('或')}`, { notify: true })
                return false
            }
            this.log(`共找到${this.userCount}个账号`)
            return true
        }
        async taskThread(taskName, conf, opt = {}) {
            while (conf.idx < $.userList.length) {
                let user = $.userList[conf.idx++]
                await user[taskName](opt)
            }
        }
        async threadManager(taskName, thread) {
            let taskAll = []
            let taskConf = { idx: 0 }
            while (thread--) {
                taskAll.push(this.taskThread(taskName, taskConf))
            }
            await Promise.all(taskAll)
        }
        time(t, x = null) {
            let xt = x ? new Date(x) : new Date
            let e = {
                "M+": xt.getMonth() + 1,
                "d+": xt.getDate(),
                "h+": xt.getHours(),
                "m+": xt.getMinutes(),
                "s+": xt.getSeconds(),
                "q+": Math.floor((xt.getMonth() + 3) / 3),
                S: this.padStr(xt.getMilliseconds(), 3)
            };
            /(y+)/.test(t) && (t = t.replace(RegExp.$1, (xt.getFullYear() + "").substr(4 - RegExp.$1.length)))
            for (let s in e)
                new RegExp("(" + s + ")").test(t) && (t = t.replace(RegExp.$1, 1 == RegExp.$1.length ? e[s] : ("00" + e[s]).substr(("" + e[s]).length)))
            return t
        }
        async showmsg() {
            if (!this.notifyFlag) return
            if (!this.notifyStr) return
            let notify = require('./sendNotify')
            this.log('\n============== 推送 ==============')
            await notify.sendNotify(this.name, this.notifyStr.join('\n'))
        }
        padStr(num, length, opt = {}) {
            let padding = opt.padding || '0'
            let mode = opt.mode || 'l'
            let numStr = String(num)
            let numPad = (length > numStr.length) ? (length - numStr.length) : 0
            let pads = ''
            for (let i = 0; i < numPad; i++) {
                pads += padding
            }
            if (mode == 'r') {
                numStr = numStr + pads
            } else {
                numStr = pads + numStr
            }
            return numStr
        }
        json2str(obj, c, encode = false) {
            let ret = []
            for (let keys of Object.keys(obj).sort()) {
                let v = obj[keys]
                if (v && encode) v = encodeURIComponent(v)
                ret.push(keys + '=' + v)
            }
            return ret.join(c)
        }
        str2json(str, decode = false) {
            let ret = {}
            for (let item of str.split('&')) {
                if (!item) continue
                let idx = item.indexOf('=')
                if (idx == -1) continue
                let k = item.substr(0, idx)
                let v = item.substr(idx + 1)
                if (decode) v = decodeURIComponent(v)
                ret[k] = v
            }
            return ret
        }
        phoneNum(phone_num) {
            if (phone_num.length == 11) {
                let data = phone_num.replace(/(\d{3})\d{4}(\d{4})/, "$1****$2")
                return data
            } else {
                return phone_num
            }
        }
        randomInt(min, max) {
            return Math.round(Math.random() * (max - min) + min)
        }
        async yiyan() {
            const got = require('got')
            return new Promise((resolve) => {
                (async () => {
                    try {
                        const response = await got('https://v1.hitokoto.cn')
                        // console.log(response.body)
                        let data = JSON.parse(response.body)
                        let data_ = `[一言]: ${data.hitokoto}  by--${data.from}`
                        // console.log(data_)
                        resolve(data_)
                    } catch (error) {
                        console.log(error.response.body)
                    }
                })()
            })
        }
        ts(type = false, _data = "") {
            let myDate = new Date()
            let a = ""
            switch (type) {
                case 10:
                    a = Math.round(new Date().getTime() / 1000).toString()
                    break
                case 13:
                    a = Math.round(new Date().getTime()).toString()
                    break
                case "h":
                    a = myDate.getHours()
                    break
                case "m":
                    a = myDate.getMinutes()
                    break
                case "y":
                    a = myDate.getFullYear()
                    break
                case "h":
                    a = myDate.getHours()
                    break
                case "mo":
                    a = myDate.getMonth()
                    break
                case "d":
                    a = myDate.getDate()
                    break
                case "ts2Data":
                    if (_data != "") {
                        time = _data
                        if (time.toString().length == 13) {
                            let date = new Date(time + 8 * 3600 * 1000)
                            a = date.toJSON().substr(0, 19).replace("T", " ")
                        } else if (time.toString().length == 10) {
                            time = time * 1000
                            let date = new Date(time + 8 * 3600 * 1000)
                            a = date.toJSON().substr(0, 19).replace("T", " ")
                        }
                    }
                    break
                default:
                    a = "未知错误,请检查"
                    break
            }
            return a
        }
        randomPattern(pattern, charset = 'abcdef0123456789') {
            let str = ''
            for (let chars of pattern) {
                if (chars == 'x') {
                    str += charset.charAt(Math.floor(Math.random() * charset.length))
                } else if (chars == 'X') {
                    str += charset.charAt(Math.floor(Math.random() * charset.length)).toUpperCase()
                } else {
                    str += chars
                }
            }
            return str
        }
        randomString(len, charset = 'abcdef0123456789') {
            let str = ''
            for (let i = 0; i < len; i++) {
                str += charset.charAt(Math.floor(Math.random() * charset.length))
            }
            return str
        }
        randomList(a) {
            let idx = Math.floor(Math.random() * a.length)
            return a[idx]
        }
        wait(t) {
            return new Promise(e => setTimeout(e, t * 1000))
        }
        async exitNow() {
            await this.showmsg()
            let e = Date.now()
            let s = (e - this.startTime) / 1000
            this.log(`[${this.name}]运行结束，共运行了${s}秒`)
            process.exit(0)
        }
    }(name)
}