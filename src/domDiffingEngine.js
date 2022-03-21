const compareDoms = (baseLineDom, candidateDom) => {
    const result = {};

    compareCandidateWithBaseline(baseLineDom, candidateDom)
}

const compareCandidateWithBaseline = (baseLineDom, candidateDom) => {
    for(let i=0; i<candidateDom.length; i++){
        const node = candidateDom[i];

        const query = {
            "tag": node["tag"],
            "parentId": node["parentId"],
            "selector": node["selector"],
        }

        //check if parent's matched is false then node should also not match.
        if(!didParentMatch(baseLineDom, query.parentId)){
            compareCandidateNodeCSS();
        }
    }
}

const didParentMatch = (baseLineDom, parentId) => {
    return baseLineDom.find((node) => (node["id"] === parentId) && !node["missing"]);
}

const findUnmatchedElementsInBaseline = () => {

}

export default compareDoms;