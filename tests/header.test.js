const Page = require('./helpers/page')

let page

beforeEach(async() => {
    page = await Page.build()
    await page.goto('http://localhost:3000')
})

afterEach(async() => {
    await page.close()
})

test("header has correct text", async () => {
    // const text = await page.$eval('a.brand-logo', i => i.innerHTML)
    const text = await page.getContentsOf('a.brand-logo')
    expect(text).toEqual('playing time')
})

test('clicking login starts oauth flow', async () => {
    await page.click('.right a')
    const url = await page.url()
    console.log(url)
    expect(url).toMatch(/accounts\.google\.com/)
})

test('shows logout button if signed in', async () => {
    await page.login()
    const check = await page.$eval('a[href="/auth/logout"]', i => i.innerHTML)
    expect(check).toEqual('Logout')
})

