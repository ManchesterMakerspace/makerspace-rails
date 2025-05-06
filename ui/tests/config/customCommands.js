
browser.overwriteCommand("setValue", async function (origSetValue, value) {
    const elementVal = await this.getValue();
    if (!!elementVal) {
        const backspaces = new Array(elementVal.length).fill("Backspace");
        await browser.execute((el) => el.focus(), this);
        await browser.execute((el) => el.select(), this);
        await browser.keys(backspaces)
    }
    return origSetValue(value);
}, true) 