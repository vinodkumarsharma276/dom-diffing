import playwright from "playwright";
import * as fs from "fs";

const parseHTMLAndKeepRelations = () => {
    let nodes = [];
    const allPageElements = document.querySelectorAll("*");
    
    for(let i=0; i<allPageElements.length; i++){
        let element = allPageElements[i];
        element["visited"] = false;
        element["visitedChild"] = false;
        element["id"] = parseInt(i);
        element["parentId"] = -1;
        element["selector"] = element.tagName.toLowerCase();
        element["matched"] = false;
    }

    for(let j=0; j<allPageElements.length; j++){
        let element = allPageElements[j];

        if(!element["visited"]){
            let node = {};
            element["visited"] = true;
            node["tag"] = element.tagName;
            node["id"] = parseInt(element["id"]);
            node["parentId"] = parseInt(element["parentId"]);
            node["selector"] = element.tagName.toLowerCase() === "html" ? "html" : element["selector"] + " " + element.tagName.toLowerCase();
            element["selector"] = node["selector"];

            if(element.hasAttributes()){
                const attributes = element.attributes;
                const attrsValue = {};
    
                node["attributes"] = attrsValue;
    
                for(let i=0; i<attributes.length; i++){
                    if(attributes[i].name !== "id"){
                        attrsValue[attributes[i].name] = attributes[i].value;
                    }
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
                child["selector"] = element["selector"];
                // console.log(`setting parent id: ${child}`);
            }
            element["visitedChild"] = true;
        }
    }

    return nodes;
}

const iterateNodeForParent = (dom, i, tags) => {
    // console.log(`Iterating Node for parent`);
    tags.push(dom[i]["tag"]);

    if(dom[i]["parentId"] !== -1){
        iterateNodeForParent(dom, dom[i]["parentId"], tags);
    }
}

const main = async() => {
    const browser = await playwright.chromium.launch({headless: false});
    const page = await browser.newPage();
    await page.goto("https://www.google.com");
    const result = await page.evaluate(parseHTMLAndKeepRelations);
    // console.log(`element: ${JSON.stringify(result, null, 2)}`);
    console.log("COMPLETED: parsedDom to file");

    fs.writeFileSync("pageDom.json", JSON.stringify(result, null, 2), "utf-8");
    await page.exposeFunction("highlightElements", highlightElements);
    await page.evaluate((result) => {
        // console.log(JSON.stringify(dom));
        for(let i=0; i<result.length; i++){
            const element = document.querySelector(result[i]["selector"]);
            element.style.setProperty("border-style", "solid");
            element.style.setProperty("border-color", "purple");
            element.style.setProperty("border-width", "2px");
        }        
    }, result);
    // console.log(`dom: ${JSON.stringify(dom)}`);

    page.on("close", () => {
        process.exit(0);
    })

    // page.close();    
}

await main();
console.log("done");