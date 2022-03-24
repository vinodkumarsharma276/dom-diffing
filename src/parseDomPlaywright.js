import playwright from "playwright";
import * as fs from "fs";
import compareDoms from "./domDiffingEngine.js";

/**
 *  _parseHTMLAndKeepRelations_TBR will be removed in future. We have changed the logic of parsing DOM.
 *  parseHTMLAndKeepRelations (Without underscore) contains the logic of parsing DOM.
 */
const _parseHTMLAndKeepRelations_TBR = () => {
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
    // console.log("test");
    const pageElements = document.querySelectorAll("*");
    let pageParsedDom = {}
    let totalDomElementParsed = 0;

    for(const element of pageElements){
        if(!element["visited"]){
            pageParsedDom = iterateDomElements(element, "", 0, 0, 1);    
        }
    }    
    // console.log(`pageParsedDom = ${JSON.stringify(pageParsedDom, null, 2)}`);
    return [
        pageParsedDom,
        totalDomElementParsed
    ];

    function iterateDomElements(node, parent, id, parentId, _nthChild) {
        // console.log(parent + " --> " + node.tagName);
        ++totalDomElementParsed;
        node["visited"] = true;
        let name = node["tagName"].toLowerCase();
        const domElement = {};

        domElement[name] ={
            "nthChild": _nthChild,
            "cssComparisonResult": {},
            "attributes": {},
            "cssProps": {},
            "path": ((parentId == 0 ? "" : parent+">") + node.tagName.toLowerCase()).trim() + ":nth-child(" + _nthChild + ")",
            "childNodes": []
        };

        setParsedDomKeys(node, domElement, name, id, parentId);
        // console.log(`domElement ${JSON.stringify(domElement)}`);
        let nthChild = 0;
        for(const childNode of node.childNodes){
            if(childNode.tagName && !childNode["visited"]){   
                // console.log(childNode.tagName);
                if (childNode.tagName.toLowerCase() == "script"){
                    childNode["visited"] = true;
                }else{
                    // console.log(node["nthChild"]);
                    domElement[name]["childNodes"].push(iterateDomElements(childNode, domElement[name]["path"], id+1, id+1, ++nthChild));
                }
            }
        }

        return domElement;
    }

    function setParsedDomKeys(node, domElement, name, id, parentId){
        domElement[name]["attributes"] = findElementAttributes(node);
        domElement[name]["cssProps"] = findAppliedCSSOnElement(node);
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

const parseWebPage = async (page, url, filename) => {
    await page.goto(url);
    const type = filename.toLowerCase().includes("baseline") ? "BASELINE" : "CANDIDATE";

    console.log(`\n\n********  PARSING DOM ${type} ********`);
    const result = await page.evaluate(parseHTMLAndKeepRelations);
    // console.log(`element: ${JSON.stringify(result, null, 2)}`);
    console.log(`\n\nHURRAYYY !!!...COMPLETED PARSING ${type}`);
    fs.writeFileSync(filename, JSON.stringify(result[0], null, 2), "utf-8");
    return result[0];
}

const main = async() => {
    console.log("********   STARTING DOM DIFFING   ********");
    const baseLineURL = "https://victorious-pond-0e5552910.1.azurestaticapps.net/";
    const candidateURL = " https://ambitious-smoke-0a8712010.1.azurestaticapps.net/";

    const browser = await playwright.chromium.launch({headless: false});
    const page = await browser.newPage();

    //Parse Baseline URL
    const baseLineParsedDom = await parseWebPage(page, baseLineURL, "baselineParsedDom.json");

    // Parse Candidate URL
    const candidateParsedDom = await parseWebPage(page, candidateURL, "candidateParsedDom.json");

    //Intentionally changing CSS and deleting nodes
    candidateParsedDom["html"]["childNodes"][1]["body"]["childNodes"][0]["nav"]["childNodes"][3]["ul"]["cssProps"]["accent-color"] = "blue";
    candidateParsedDom["html"]["childNodes"][1]["body"]["childNodes"][1]["div"]["cssProps"]["accent-color"] = "blue";
    candidateParsedDom["html"]["childNodes"][1]["body"]["childNodes"][1]["div"]["cssProps"]["align-items"] = "wide";
    candidateParsedDom["html"]["childNodes"][1]["body"]["childNodes"].pop();
    // candidateParsedDom["html"]["childNodes"][1]["body"]["childNodes"].pop();
    const result = compareDoms(baseLineParsedDom, candidateParsedDom);
    fs.writeFileSync("result.json", JSON.stringify(result, null, 2), "utf-8");

    page.on("close", () => {
        process.exit(0);
    })

    page.close();    
}

await main();
// console.log("done");