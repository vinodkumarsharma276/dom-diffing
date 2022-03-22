const compareDoms = (baseLineDom, candidateDom) => {
    console.log(`Starting comparison`);
    let unreachableNodesInCandidate = [];
    let nodesWithCSSDifference = [];
    let unreachableNodesInBaseline = [];

    for(let i=0; i<candidateDom.length; i++){
        const node = candidateDom[i];
        console.log(`Validating node: ${node.tag}`)
        //check if parent's matched is false then node should also not match.
        if(
            node["parentId"] == -1
            || didParentMatch(candidateDom, node["parentId"]
            )
        ){
            console.log(`Parent Matched`);
            const matchingNode = node["parentId"] == -1 ? baseLineDom[0] : findEquivalentCandidateNodeInBaseline(node, baseLineDom);

            if(matchingNode != undefined){
                node["missing"] = false;
                node["cssComparisonResult"] = compareNodeCSS(node.css, matchingNode.css);

                if(Object.keys(node["cssComparisonResult"]).length > 0){
                    nodesWithCSSDifference.push(node);
                }
            }else{
                unreachableNodesInCandidate.push(node);
            }
        }else{
            console.log(`Parent didn't Matched`);
        }
        delete node.css; // Deleting log css key from node for better readability of result.
    }

    unreachableNodesInBaseline = baseLineDom.filter((node) => node["missing"]);
    
    return {
        "unreachableNodesInCandidate": unreachableNodesInCandidate,
        "unreachableNodesInBaseline": unreachableNodesInBaseline,
        "nodeWithCSSDifference": nodesWithCSSDifference 
    }
}

const findEquivalentCandidateNodeInBaseline = (candidateNode, baseLineDom) => {
    console.log(`Finding equivalent node in baseline`);
    let result;
    for(let i=0; i<baseLineDom.length; i++){
        const node = baseLineDom[i];
        // console.log(`${node["tag"]} ${candidateNode["tag"]} ${node["selector"]} ${candidateNode["selector"]} ${node["missing"]}`)
        if(
            node["tag"] === candidateNode["tag"]
            && node["selector"] === candidateNode["selector"]
            && node["missing"]
            // && compareAttributes(node["attributes"], candidateNode["attributes"])
        ){
            console.log(`Found matching node`);
            node["missing"] = false;
            result = node;
            break;
        }
    }
    return result;
}

const compareNodeCSS = (candidateNode, baseLineNode) => {
    const cssComparisonResult = {};

    for(const [key, value] of Object.entries(baseLineNode)){
        if(candidateNode[key] == undefined) {
            cssComparisonResult[key] = {
                "candidate": "DE",
                "baseline": value
            } 
            continue;
        }
        
        if(candidateNode[key] !== value){
            cssComparisonResult[key] = {
                "candidate": candidateNode[key],
                "baseline": baseLineNode[key]
            }
        }
    }

    for(const [key, value] of Object.entries(candidateNode)){
        if(baseLineNode[key] == undefined) {
            cssComparisonResult[key] = {
                "candidate": value,
                "baseline": "DE"
            }
        }
    }

    return cssComparisonResult;
}

/**
 * This will compare baseLine Node attributes and candidate Node Attributes.
 * It will check if all the attributes of baseline node exist in candidate then both might match.
 * Hence, returning true to calling function for further processing 
 */
const compareAttributes = (baseLineAttributes, candidateAttributes) => {
    console.log(`Comparing attributes`);
    const baseLineKeys = Object.keys(baseLineAttributes);
    
    for(const [key, value] of Object.entries(baseLineAttributes)){
        if(
            candidateAttributes[key] == undefined ||
            candidateAttributes[key] != value
        ){
            return false;
        }
    }

    return true;
}

/**
 * It will check for existence of parent node in candidateDom.
 * If it exists then it will check its "missing" property is set to false it means
 * parent doesn't exit in dom so, will this child node and we can safely say this candidate node
 * doesn't exist.
 */
const didParentMatch = (candidateDom, parentId) => {
    console.log(`Matching parent`);

    for(let i=0; i<candidateDom.length; i++){
        const node = candidateDom[i];
        if((node["userId"] === parentId) && !node["missing"]){
            console.log("Parent not missing");
            return true;
        }
    }
    return false;
    // candidateDom.find((node) => (node["id"] === parentId) && !node["missing"]);
}

export default compareDoms;