import playwright from "playwright";
import * as fs from "fs";
import compareDoms from "./domDiffingEngine.js";

const _parseHTMLAndKeepRelations = () => {
    let nodes = [];
    const allPageElements = document.querySelectorAll("*");
    
    for(let i=0; i<allPageElements.length; i++){
        let element = allPageElements[i];
        element["visited"] = false;
        element["visitedChild"] = false;
        element["userId"] = parseInt(i);
        element["parentId"] = -1;
        element["selector"] = element.tagName.toLowerCase();
        element["missing"] = true;
        element["cssMatched"] = false;
    }

    for(let j=0; j<allPageElements.length; j++){
        let element = allPageElements[j];
        if(element.tagName.toLowerCase() === "html"){
            element["missing"] = false;
        }
        if(!element["visited"]){
            let node = {};
            element["visited"] = true;
            node["tag"] = element.tagName;
            node["userId"] = parseInt(element["userId"]);
            node["parentId"] = parseInt(element["parentId"]);
            node["missing"] = element["missing"];
            node["selector"] = element.tagName.toLowerCase() === "html" ? "html" : element["selector"] + " " + element.tagName.toLowerCase();
            element["selector"] = node["selector"];

            if(element.hasAttributes()){
                const attributes = element.attributes;
                const attrsValue = {};
    
                node["attributes"] = attrsValue;
    
                for(let i=0; i<attributes.length; i++){
                    if(attributes[i].name !== "userId"){
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
                child["parentId"] = element["userId"];
                child["selector"] = element["selector"];
                // console.log(`setting parent id: ${child}`);
            }
            element["visitedChild"] = true;
        }
    }

    return nodes;
}

const parseHTMLAndKeepRelations = () => {
    const pageElements = document.querySelectorAll("*");
    let pageParsedDom = {}

    for(const element of pageElements){
        if(!element["visited"]){
            pageParsedDom = iterateDomElements(element, "", 0, -1, 0);    
        }
    }    
    // console.log(`pageParsedDom = ${JSON.stringify(pageParsedDom, null, 2)}`);
    return pageParsedDom;

    function iterateDomElements(node, parent, id, parentId, _nthChild) {
        // console.log(parent + " --> " + node.tagName);
        node["visited"] = true;
        let name = node["tagName"].toLowerCase();
        const domElement = {};

        domElement[name] ={
            "nthChild": _nthChild,
            "attributes": {},
            "cssProps": {},
            "path": (parent + " " + node.tagName.toLowerCase()).trim(),
            "childNodes": []
        };

        setParsedDomKeys(node, domElement, name, id, parentId);
        // console.log(`domElement ${JSON.stringify(domElement)}`);
        let nthChild = 0;
        for(const childNode of node.childNodes){
            if(childNode.tagName && !childNode["visited"]){
                domElement[name]["childNodes"].push(iterateDomElements(childNode, parent + " " + node.tagName.toLowerCase(), id+1, id, ++nthChild));
            }
        }

        return domElement;
    }

    function setParsedDomKeys(node, domElement, name, id, parentId){
        domElement[name]["attributes"] = findElementAttributes(node);
        // domElement[name]["cssProps"] = findAppliedCSSOnElement(node);
        domElement[name]["missing"] = true;
        domElement[name]["userId"] = id;
        domElement[name]["parentId"] = parentId;
    }

    function findAppliedCSSOnElement(node){
        const appliedCSS = window.getComputedStyle(node);
        const style = {};

        for(let i=0; i<appliedCSS.length; i++){
            var propName = appliedCSS.item(i);

            style[propName] = appliedCSS.getPropertyValue(propName);
        }
        
        return style;
    }

    function findElementAttributes(node){
        const attrsValue = {};

        if(node.hasAttributes()){
            const attributes = node.attributes;
            for(let i=0; i<attributes.length; i++){
                if(attributes[i].name !== "userId"){
                    attrsValue[attributes[i].name] = attributes[i].value;
                }
            }    
        }

        return attrsValue;
    }
    
}

const main = async() => {

    const baseLineURL = "https://www.google.com";
    const candidateURL = "https://www.google.com";

    const browser = await playwright.chromium.launch({headless: true});
    const page = await browser.newPage();

    //Parse Baseline URL
    const baseLineParsedDom = await parseWebPage(page, baseLineURL, "baselineParsedDom.json");

    //Parse Candidate URL
    // const candidateParsedDom = await parseWebPage(page, candidateURL, "candidateParsedDom.json");

    // //Rum domDiffingEngine
    // const result = compareDoms(baselineParsedDom, candidateParsedDom);

    // // console.log(`result: ${JSON.stringify(result, null, 2)}`);
    // fs.writeFileSync("result.json", JSON.stringify(result, null, 2), "utf-8");
    // await page.evaluate((result) => {
    //     // console.log(JSON.stringify(dom));
    //     for(let i=0; i<dom.length; i++){
    //         const elements = document.querySelectorAll(result[i]["selector"]);
    //         for(let j=0; j<elements.length; j++) {
    //             const element = elements.item(j);
    //             element.style.setProperty("border-style", "solid");
    //             element.style.setProperty("border-color", "purple");
    //             element.style.setProperty("border-width", "2px");
    //         }
    //     }        
    // }, dom);
    // console.log(`dom: ${JSON.stringify(dom)}`);

    page.on("close", () => {
        process.exit(0);
    })

    // page.close();    
}

const parseWebPage = async (page, url, filename) => {
    await page.goto(url);
    const parsedDom = await page.evaluate(parseHTMLAndKeepRelations);
    // console.log(`element: ${JSON.stringify(result, null, 2)}`);
    console.log("COMPLETED: parsedDom to file");
    fs.writeFileSync(filename, JSON.stringify(parsedDom, null, 2), "utf-8");
    return parsedDom;
}


await main();
// console.log("done");