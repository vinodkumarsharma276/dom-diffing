import * as fs from "fs";
import { chromium } from "playwright";

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
            "coordinates": {
                "x": 0,
                "y": 0,
                "height": 0,
                "width": 0
            },
            "uniqueId": "",
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
        const coordinates = node.getBoundingClientRect();
        console.log(coordinates["x"]);
        console.log(coordinates["y"]);
        domElement[name]["attributes"] = findElementAttributes(node);
        domElement[name]["cssProps"] = findAppliedCSSOnElement(node);
        domElement[name]["missing"] = true;
        domElement[name]["userId"] = id;
        domElement[name]["parentId"] = parentId;
        domElement[name]["uniqueId"] = name + "*" + cleanAttributes(domElement[name]["attributes"]);
        domElement[name]["coordinates"]["x"] = coordinates["x"];
        domElement[name]["coordinates"]["y"] = coordinates["y"];
        domElement[name]["coordinates"]["height"] = coordinates["height"];
        domElement[name]["coordinates"]["width"] = coordinates["width"];
    }

    function cleanAttributes(attr) {
        let uniqueStr = "";
        Object.entries(attr).forEach((entry) => {
            const [key, value] = entry;
            // console.log(`${key}: ${value}`);
            uniqueStr += `${key}:${value}*`
        });
        return uniqueStr;
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
                if(attributes[i].name !== "userId" && attributes[i].name != "class"){
                    attrsValue[attributes[i].name] = attributes[i].value;
                }
            }    
        }

        return attrsValue;
    }    
}

const highlightImages = (coordinates) => {
    console.log(`highlighting elements: ${JSON.stringify(coordinates)}`);
    // window.onload = function () {
    console.log("window.onload");
    var canvas1 = document.getElementById('myCanvas1');
    var context1 = canvas1.getContext('2d');
    var canvas2 = document.getElementById('myCanvas2');
    var context2 = canvas2.getContext('2d');
    var imageObj1 = null;            

    imageObj1 = new Image();
    var imageObj2 = new Image();

    // imageObj1.onload = function () {  };
    imageObj1.src = "C://Users//vinodsharma//Documents//workspace//onejs//ooui//packages//visual-regression-tests//dist//screenshots//FileMenu.FileMenu CompoundButtons.Hovered on first button in page.chromium.png"; 

    imageObj2.src = "C://Users//vinodsharma//Documents//workspace//1JS//ooui//packages//visual-regression-tests//dist//screenshots//FileMenu.FileMenu CompoundButtons.Hovered on first button in page.chromium.png";

    // imageObj1.src = "https://www.pexels.com/photo/butterfly-perched-on-flower-462118/";

    // init();
    imageObj1.onload =  function() {
        console.log("image.onload");
        context1.drawImage(imageObj1, 0, 0);
        for(let i=0; i<coordinates.length; i++){
            const c = coordinates[i];
            context1.beginPath();
            context1.rect(c[0], c[1], c[2], c[3]);
            context1.lineWidth = 2;
            context1.strokeStyle = 'orange';
            context1.stroke();
        }
        
    }

    imageObj2.onload =  function() {
        console.log("image.onload");
        context2.drawImage(imageObj2, 0, 0);
        for(let i=0; i<coordinates.length; i++){
            const c = coordinates[i];
            context2.beginPath();
            context2.rect(c[0], c[1], c[2], c[3]);
            context2.lineWidth = 2;
            context2.strokeStyle = 'orange';
            context2.stroke();
        }
        
    }
    // }
}

const coordinates = [];

const collectCoordinates = (node) => {
    
    // console.log(`nodeCoordinates: ${JSON.stringify(node["coordinates"])}`);
    if(Object.keys(node["cssComparisonResult"]).length > 0){
        coordinates.push([node["coordinates"]["x"], node["coordinates"]["y"], node["coordinates"]["width"], node["coordinates"]["height"]]);
    }   

    const childNodes = node["childNodes"];

    for(let i=0; i<childNodes.length; i++){
        Object.keys(childNodes[i]).map((key) => {
            collectCoordinates(childNodes[i][key]);
        });
    }
}

const main = async () => {
    // console.log(`main()`);
    let browser = await chromium.launch({headless: false});    
    const context = await browser.newContext();
    const page = await context.newPage();
    await page.setViewportSize({
        width: 2000,
        height: 1000
    });
    // await page.goto("https://www.google.com");
    // await page.screenshot({
    //     path: "googlehome.png"
    // });

    // const result = await page.evaluate(parseHTMLAndKeepRelations);

    const result = JSON.parse(fs.readFileSync("C://Users//vinodsharma//Documents//workspace//1JS//ooui//packages//visual-regression-tests//dist//result//candidateDom.json", "utf-8"));

    Object.keys(result).map((key) => {
        collectCoordinates(result[key]);
    });

    console.log(`coordinates: ${JSON.stringify(coordinates, null, 2)}`);

    await page.goto("file://C:/Users/vinodsharma/Documents/workspace_personal/dom-diffing/src/mapDOMToPNG/highlightPNG.html");

    await page.evaluate(highlightImages, coordinates);
    
    // await page.close();
    // await browser.close();
    
    await page.waitForEvent("close", { timeout: 90000 });
}

await main();