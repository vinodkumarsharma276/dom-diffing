"use strict";
// const fs = require("fs");
exports.__esModule = true;
exports.runDomDiffing = void 0;
var runDomDiffing = function (baselineDom, candidateDom) {
    compareDoms(baselineDom, candidateDom);
    var baselineResult = [];
    var candidateResult = [];
    prepareResult(baselineDom, baselineResult);
    prepareResult(candidateDom, candidateResult);
    return {
        "baseline": baselineResult,
        "candidate": candidateResult
    };
};
exports.runDomDiffing = runDomDiffing;
var compareDoms = function (baselineDom, candidateDom) {
    console.log("Object.keys: ".concat(Object.keys(baselineDom)[0]));
    var BTagName = Object.keys(baselineDom)[0];
    var CTageName = Object.keys(candidateDom)[0];
    console.log("BTagName, CTagname: ".concat(BTagName, " ").concat(CTageName));
    if ((baselineDom[BTagName]["uniqueId"] == candidateDom[CTageName]["uniqueId"]) && !candidateDom[CTageName]["found"]) {
        baselineDom[BTagName]["found"] = true;
        candidateDom[CTageName]["found"] = true;
        console.log("found");
        var cssComparisonResult = compareNodeCSS(baselineDom[BTagName]["cssProps"], candidateDom[CTageName]["cssProps"]);
        if (Object.keys(cssComparisonResult).length > 0) {
            console.log("cssComparisonResult: ".concat(baselineDom[BTagName]["uniqueId"], ", ").concat(candidateDom[BTagName]["uniqueId"]));
        }
        candidateDom[CTageName]["cssComparisonResult"] = cssComparisonResult;
        baselineDom[BTagName]["cssComparisonResult"] = cssComparisonResult;
        candidateDom[CTageName]["childNodes"].forEach(function (CChildNode) {
            for (var i = 0; i < baselineDom[BTagName]["childNodes"].length; i++) {
                var BChildNode = baselineDom[BTagName]["childNodes"][i];
                if (compareDoms(BChildNode, CChildNode)) {
                    break;
                }
            }
        });
        return true;
    }
    return false;
};
var prepareResult = function (dom, result) {
    var tag = Object.keys(dom)[0];
    var tempResult = {};
    tempResult[tag] = {
        "deleted": false,
        "cssComparisonResult": {},
        "coordinates": {}
    };
    console.log("tempResult: ".concat(JSON.stringify(tempResult)));
    if (!dom[tag]["found"]) {
        tempResult[tag]["deleted"] = true;
        tempResult[tag]["coordinates"] = dom[tag]["coordinates"];
    }
    if (Object.keys(dom[tag]["cssComparisonResult"]).length !== 0) {
        tempResult[tag]["cssComparisonResult"] = dom[tag]["cssComparisonResult"];
        tempResult[tag]["coordinates"] = dom[tag]["coordinates"];
    }
    result.push(tempResult);
    dom[tag]["childNodes"].forEach(function (childNode) {
        prepareResult(childNode, result);
    });
};
var compareNodeCSS = function (baseLineCSS, candidateCSS) {
    // console.log(`comparing CSS ${baseLineCSS} ${candidateCSS}`);
    var cssComparisonResult = {};
    for (var _i = 0, _a = Object.entries(baseLineCSS); _i < _a.length; _i++) {
        var _b = _a[_i], key = _b[0], value = _b[1];
        if (candidateCSS[key] == undefined) {
            cssComparisonResult[key] = {
                "candidate": "DE",
                "baseline": value
            };
            continue;
        }
        if (candidateCSS[key] !== value) {
            cssComparisonResult[key] = {
                "candidate": candidateCSS[key],
                "baseline": baseLineCSS[key]
            };
        }
    }
    for (var _c = 0, _d = Object.entries(candidateCSS); _c < _d.length; _c++) {
        var _e = _d[_c], key = _e[0], value = _e[1];
        if (baseLineCSS[key] == undefined) {
            cssComparisonResult[key] = {
                "candidate": value,
                "baseline": "DE"
            };
        }
    }
    return cssComparisonResult;
};
// const baselineDom = JSON.parse(fs.readFileSync("baselineParsedDom.json"));
// const candidateDom = JSON.parse(fs.readFileSync("candidateParsedDom.json"));
// // console.log(`baselineDom: ${baselineDom}`);
// const result = runDomDiffing(baselineDom, candidateDom);
// console.log(`result: ${JSON.stringify(result, null, 2)}`);
//# sourceMappingURL=domDiffingEngine.js.map