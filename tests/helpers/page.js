const puppeteer = require('puppeteer')

class CustomPage {
    static async bulid() {
        const broswer = await puppeteer.launch({
            headless: false
        })

        const page = await broswer.newPage()
        const customPage = new CustomPage(page)

        return new Proxy(customPage, {
            get: function(target, property) {
                return customPage[property] || page[property] || broswer[property]
            }
        })
    }

    constructor(page){
        this.page = page 
    }
}

module.exports = CustomPage