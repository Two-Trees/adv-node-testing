const puppeteer = require('puppeteer')
const { cookieKey } = require('../config/prod')
const sessionFactory = require('./factories/sessionFactory')
const userFactory = require('./factories/userFactory')

let browser, page 

beforeEach(async () => {
    browser = await puppeteer.launch({
        headless: false
    })
    page = await browser.newPage()
    await page.goto('localhost:3000')
})

afterEach(async() => {
    await browser.close()
})

test("check header text", async () => {
    const text = await page.$eval('a.brand-logo', i => i.innerHTML)
    console.log(text)
    expect(text).toEqual('playing time')
})

test('check login starts oauth flow', async () => {
    await page.click('.right a')
    const url = await page.url()
    console.log(url)
    expect(url).toMatch(/accounts\.google\.com/)
})

test.only('shows logout when signed in', async () => {
    const user = await userFactory()
    const { session, sig } = sessionFactory(user)
    await page.setCookie({ name: 'session', value: session })
    await page.setCookie({ name: 'session.sig', value: sig})
    await page.goto('localhost:3000')
    await page.waitFor('a[href="/auth/logout"]')
    const check = await page.$eval('a[href="/auth/logout"]', i => i.innerHTML)
    expect(check).toEqual('Logout')

})



// test('shows logout when signed in', async () => {
//     const id = '629ad0cbcded9bc204ddb0f3'
//     const Buffer = require('safe-buffer').Buffer
//     const sessionObject = {
//         passport: {
//             user: id
//         }
//     }
//     const sessionString = Buffer.from(
//         JSON.stringify(sessionObject)
//     ).toString('base64')

//     const Keygrip = require('keygrip')
//     const keys = require('../config/keys')
//     const keygrip = new Keygrip([keys.cookieKey])
//     const sig = keygrip.sign('session=' + sessionString)
//     console.log(sessionString, sig)

//     await page.setCookie({ name: 'session', value: sessionString })
//     await page.setCookie({ name: 'session.sig', value: sig})
//     await page.goto('localhost:3000')
//     await page.waitFor('a[href="/auth/logout"]')
//     const check = await page.$eval('a[href="/auth/logout"]', i => i.innerHTML)
//     expect(check).toEqual('Logout')

// })

