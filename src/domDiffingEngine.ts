// const fs = require("fs");

export const runDomDiffing = (baselineDom, candidateDom) => {
    compareDoms(baselineDom, candidateDom);

    let baselineResult = [];
    let candidateResult = [];

    prepareResult(baselineDom, baselineResult);
    prepareResult(candidateDom, candidateResult);

    return {
        "baseline": baselineResult,
        "candidate": candidateResult
    };
}

const compareDoms = (baselineDom, candidateDom) => {
    console.log(`Object.keys: ${Object.keys(baselineDom)[0]}`);
    let BTagName = Object.keys(baselineDom)[0];
    let CTageName = Object.keys(candidateDom)[0];
    console.log(`BTagName, CTagname: ${BTagName} ${CTageName}`);
    
    if((baselineDom[BTagName]["uniqueId"] == candidateDom[CTageName]["uniqueId"]) && !candidateDom[CTageName]["found"]){
        baselineDom[BTagName]["found"] = true;
        candidateDom[CTageName]["found"] = true;
        console.log(`found`);
        const cssComparisonResult = compareNodeCSS(baselineDom[BTagName]["cssProps"], candidateDom[CTageName]["cssProps"]);
        if(Object.keys(cssComparisonResult).length > 0){
            console.log(`cssComparisonResult: ${baselineDom[BTagName]["uniqueId"]}, ${candidateDom[BTagName]["uniqueId"]}`)
        }
        candidateDom[CTageName]["cssComparisonResult"] = cssComparisonResult;
        baselineDom[BTagName]["cssComparisonResult"] = cssComparisonResult;

        candidateDom[CTageName]["childNodes"].forEach((CChildNode) => {
            for(let i=0; i<baselineDom[BTagName]["childNodes"].length; i++){
                let BChildNode = baselineDom[BTagName]["childNodes"][i];
    
                if(compareDoms(BChildNode, CChildNode)){
                    break;
                }
            }
        });

        return true;
    }

    return false;
}

const prepareResult = (dom, result) => {
    let tag = Object.keys(dom)[0];
    const tempResult = {};
    tempResult[tag] = {
        "deleted": false,
        "cssComparisonResult": {},
        "coordinates": {}
    };
    console.log(`tempResult: ${JSON.stringify(tempResult)}`);
    if(!dom[tag]["found"]){
        tempResult[tag]["deleted"] = true;
        tempResult[tag]["coordinates"] = dom[tag]["coordinates"];        
    }

    if(Object.keys(dom[tag]["cssComparisonResult"]).length !== 0){
        tempResult[tag]["cssComparisonResult"] = dom[tag]["cssComparisonResult"];
        tempResult[tag]["coordinates"] = dom[tag]["coordinates"];
    }

    result.push(tempResult);

    dom[tag]["childNodes"].forEach((childNode) => {
        prepareResult(childNode, result);
    });
}

const compareNodeCSS = (baseLineCSS, candidateCSS) => {
    // console.log(`comparing CSS ${baseLineCSS} ${candidateCSS}`);
    
    const cssComparisonResult = {};

    for(const [key, value] of Object.entries(baseLineCSS)){
        if(candidateCSS[key] == undefined) {
            cssComparisonResult[key] = {
                "candidate": "DE",
                "baseline": value
            } 
            continue;
        }
        
        if(candidateCSS[key] !== value){
            cssComparisonResult[key] = {
                "candidate": candidateCSS[key],
                "baseline": baseLineCSS[key]
            }
        }
    }

    for(const [key, value] of Object.entries(candidateCSS)){
        if(baseLineCSS[key] == undefined) {
            cssComparisonResult[key] = {
                "candidate": value,
                "baseline": "DE"
            }
        }
    }

    return cssComparisonResult;
}

// const baselineDom = JSON.parse(fs.readFileSync("baselineParsedDom.json"));
// const candidateDom = JSON.parse(fs.readFileSync("candidateParsedDom.json"));
// // console.log(`baselineDom: ${baselineDom}`);
// const result = runDomDiffing(baselineDom, candidateDom);

// console.log(`result: ${JSON.stringify(result, null, 2)}`);
