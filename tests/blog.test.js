Number.prototype._called = {}

const Page = require('./helpers/page')

let page

beforeEach(async () => {
    page = await Page.build()
    await page.goto('http://localhost:3000')
})

afterEach(async () => {
    await page.close()
})


describe('when logged in', async () => {
    beforeEach(async () => {
        await page.login()
        await page.click('a.btn-floating')
    })

    test('blog form renders', async () => {
        const label = await page.getContentsOf('form label')
        expect(label).toEqual('Blog Title')
    })

    describe('using valid inputs', async () => {
        beforeEach(async () => {
            await page.type('.title input', 'This is the title string')
            await page.type('.content input', 'This is the content string')
            await page.click('form button')
        })

        test('submit takes user to review screen', async () => {
            const text = await page.getContentsOf('h5')
            expect(text).toEqual('Please confirm your entries')
        })

        test('saving adds blog to index', async () => {
            await page.click('button.green')
            await page.waitFor('.card')

            const title = await page.getContentsOf('.card-title')
            const content = await page.getContentsOf('p')

            expect(title).toEqual('This is the title string')
            expect(content).toEqual('This is the content string')
        })

    })

    describe('using invalid inputs', async () => {
        beforeEach(async () => {
            await page.click('form button')
        })

        test('form shows error message', async () => {
            const titleError = await page.getContentsOf('.title .red-text')
            const contentError = await page.getContentsOf('.content .red-text')
            expect(titleError).toEqual('You must provide a value')
            expect(contentError).toEqual('You must provide a value')

        })
    })
})

describe('when user is not logged in', async () => {
    test('user cannot create blog posts', async () => {
        const result = await page.evaluate(
            () => {
                return fetch('api/blogs', {
                    method: 'POST',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        title: 'Title',
                        content: 'Content'
                    })
                }).then(res => res.json())
            }
        )
        // console.log(result)
        expect(result).toEqual({ error: 'You must log in!' })
    })

    test('user cannot view blogs', async () => {
        const result = await page.evaluate(
            () => {
                return fetch('api/blogs', {
                    method: 'GET',
                    credentials: 'same-origin',
                    headers: {
                        'Content-Type': 'application/json'
                    }
                }).then(res => res.json())
            }
        )
        expect(result).toEqual({ error: 'You must log in!' })
    })
})
