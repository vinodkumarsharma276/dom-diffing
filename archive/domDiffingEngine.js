const compareDoms = (baseLineDom, candidateDom) => {
    // console.log("Comparing elements");
    const baseLineTags = Object.keys(baseLineDom);
    const candidateTags = Object.keys(candidateDom);
    let cssComparisonResult = {};

    for(let i=0; i<candidateTags.length; i++){
        if(candidateTags[i] == baseLineTags[i]){
            candidateDom[candidateTags[i]]["missing"] = false;
            baseLineDom[baseLineTags[i]]["missing"] = false;

            cssComparisonResult = compareNodeCSS(baseLineDom[baseLineTags[i]]["cssProps"], candidateDom[candidateTags[i]]["cssProps"]);
            baseLineDom[baseLineTags[i]]["cssComparisonResult"] = cssComparisonResult;
            candidateDom[candidateTags[i]]["cssComparisonResult"] = cssComparisonResult;
            
            const baseLineChildNodes = baseLineDom[baseLineTags[i]]["childNodes"];
            const candidateDomChildNodes = candidateDom[baseLineTags[i]]["childNodes"];

            for(let j=0; j<candidateDomChildNodes.length; j++){
                if(baseLineChildNodes[j]){
                    compareDoms(baseLineChildNodes[j], candidateDomChildNodes[j]);
                }
            }
        }
    }

    return [
        baseLineDom,
        candidateDom
    ]
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