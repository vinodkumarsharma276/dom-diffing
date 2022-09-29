"use strict";
exports.__esModule = true;
exports.compareDoms = void 0;
var compareDoms = function (baselineDom, candidateDom) {
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
                if ((0, exports.compareDoms)(BChildNode, CChildNode)) {
                    break;
                }
            }
        });
        return true;
    }
    return false;
};
exports.compareDoms = compareDoms;
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
exports["default"] = exports.compareDoms;
//# sourceMappingURL=domDiffingEngine.js.map