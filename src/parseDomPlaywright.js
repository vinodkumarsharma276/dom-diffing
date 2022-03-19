import playwright from "playwright";
import * as fs from "fs";

const script = () => {
    let nodes = [];
    const allPageElements = document.querySelectorAll("*");
    
    for(var j=0; j<allPageElements.length; j++){
        let node = {};
        let element = allPageElements[j];

        node["tag"] = element.tagName;
        
        if(element.hasAttributes()){
            const attributes = element.attributes;
            const appliedCSS = window.getComputedStyle(element);
            const attrsValue = {};
            const style = {};

            node["attributes"] = attrsValue;
            node["css"] = style;

            for(var i=0; i<attributes.length; i++){
                attrsValue[attributes[i].name] = attributes[i].value;
            }

            //Calculate Style
            for(var i=0; i<appliedCSS.length; i++){
                var propName = appliedCSS.item(i);

                style[propName] = appliedCSS.getPropertyValue(propName);
            }
        }
        nodes[j] = node;
    }

    return nodes;
}

const main = async() => {
    const browser = await playwright.chromium.launch({headless: false});
    const page = await browser.newPage();
    await page.goto("https://www.google.com");
    
    const result = await page.evaluate(script);

    // console.log(`element: ${JSON.stringify(result, null, 2)}`);

    fs.writeFileSync("pageDom.json", JSON.stringify(result, null, 2), "utf-8");
    console.log("COMPLETED: parsedDom to file");

    page.on("close", () => {
        process.exit(0);
    })

    page.close();    
}

await main();
console.log("done");