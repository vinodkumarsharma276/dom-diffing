export const compareDoms = (baselineDom, candidateDom) => {
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

export default compareDoms;