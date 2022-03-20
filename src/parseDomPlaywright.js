import playwright from "playwright";
import * as fs from "fs";

const parseHTMLAndKeepRelations = () => {
    let nodes = [];
    const allPageElements = document.querySelectorAll("*");
    
    for(let i=0; i<allPageElements.length; i++){
        let element = allPageElements[i];
        element["visited"] = false;
        element["visitedChild"] = false;
        element["id"] = i;
        element["parentId"] = -1;
    }

    for(let j=0; j<allPageElements.length; j++){
        let element = allPageElements[j];

        if(!element["visited"]){
            let node = {};
            element["visited"] = true;
            node["tag"] = element.tagName;
            node["id"] = element["id"];
            node["parentId"] = element["parentId"];

            if(element.hasAttributes()){
                const attributes = element.attributes;
                const attrsValue = {};
    
                node["attributes"] = attrsValue;
    
                for(let i=0; i<attributes.length; i++){
                    attrsValue[attributes[i].name] = attributes[i].value;
                }    
            }

            const appliedCSS = window.getComputedStyle(element);
            const style = {};
            node["css"] = style;

            for(let i=0; i<appliedCSS.length; i++){
                var propName = appliedCSS.item(i);

                style[propName] = appliedCSS.getPropertyValue(propName);
            }

            element["visited"] = true;
            nodes[j] = node;
        }

        if(!element["visitedChild"]){
            for(let k=0; k<element.childNodes.length; k++){
                let child = element.childNodes[k];
                child["parentId"] = element["id"];
                console.log(`setting parent id: ${child}`);
            }
            element["visitedChild"] = true;
        }
    }

    return nodes;
}


const main = async() => {
    const browser = await playwright.chromium.launch({headless: false});
    const page = await browser.newPage();
    await page.goto("https://www.google.com");
    await page.exposeFunction("iterateElement", iterateElement);
    const result = await page.evaluate(parseHTMLAndKeepRelations);

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