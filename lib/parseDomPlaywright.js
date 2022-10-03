"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __generator = (this && this.__generator) || function (thisArg, body) {
    var _ = { label: 0, sent: function() { if (t[0] & 1) throw t[1]; return t[1]; }, trys: [], ops: [] }, f, y, t, g;
    return g = { next: verb(0), "throw": verb(1), "return": verb(2) }, typeof Symbol === "function" && (g[Symbol.iterator] = function() { return this; }), g;
    function verb(n) { return function (v) { return step([n, v]); }; }
    function step(op) {
        if (f) throw new TypeError("Generator is already executing.");
        while (_) try {
            if (f = 1, y && (t = op[0] & 2 ? y["return"] : op[0] ? y["throw"] || ((t = y["return"]) && t.call(y), 0) : y.next) && !(t = t.call(y, op[1])).done) return t;
            if (y = 0, t) op = [op[0] & 2, t.value];
            switch (op[0]) {
                case 0: case 1: t = op; break;
                case 4: _.label++; return { value: op[1], done: false };
                case 5: _.label++; y = op[1]; op = [0]; continue;
                case 7: op = _.ops.pop(); _.trys.pop(); continue;
                default:
                    if (!(t = _.trys, t = t.length > 0 && t[t.length - 1]) && (op[0] === 6 || op[0] === 2)) { _ = 0; continue; }
                    if (op[0] === 3 && (!t || (op[1] > t[0] && op[1] < t[3]))) { _.label = op[1]; break; }
                    if (op[0] === 6 && _.label < t[1]) { _.label = t[1]; t = op; break; }
                    if (t && _.label < t[2]) { _.label = t[2]; _.ops.push(op); break; }
                    if (t[2]) _.ops.pop();
                    _.trys.pop(); continue;
            }
            op = body.call(thisArg, _);
        } catch (e) { op = [6, e]; y = 0; } finally { f = t = 0; }
        if (op[0] & 5) throw op[1]; return { value: op[0] ? op[1] : void 0, done: true };
    }
};
exports.__esModule = true;
exports.parseWebPage = void 0;
var fs = require("fs");
var compress_json_1 = require("compress-json");
/**
 *  parseHTMLAndKeepRelations (Without underscore) contains the logic of parsing DOM.
 */
var parseHTMLAndKeepRelations = function (selector) {
    var pageElements;
    var dummy = document.createElement('element-' + (new Date().getTime()));
    document.body.appendChild(dummy);
    // console.log(`dummmy: ${JSON.stringify(window.getComputedStyle(dummy))}`);    
    var dummyElementStyleKeys = Object.keys(window.getComputedStyle(dummy));
    if (selector !== "") {
        console.log("selector exist");
        pageElements = document.querySelectorAll(selector);
    }
    else {
        console.log("selector doesn't exist");
        pageElements = document.querySelectorAll("*");
    }
    // console.log(`selector, pageElements: ${selector}, ${pageElements}`);
    var pageParsedDom = {};
    var totalDomElementParsed = 0;
    for (var _i = 0, pageElements_1 = pageElements; _i < pageElements_1.length; _i++) {
        var element = pageElements_1[_i];
        if (!element["visited"]) {
            pageParsedDom = iterateDomElements(element, "", 0, 0, 1);
        }
        else {
            // console.log(`element, visited ${JSON.stringify(element["visited"])}`);
        }
    }
    for (var _a = 0, pageElements_2 = pageElements; _a < pageElements_2.length; _a++) {
        var element = pageElements_2[_a];
        if (element["visited"]) {
            element["visited"] = false;
            markElementNonVisited(element);
        }
    }
    // console.log(`pageParsedDom = ${JSON.stringify(pageParsedDom, null, 2)}`);
    return [
        pageParsedDom,
        totalDomElementParsed
    ];
    function markElementNonVisited(node) {
        console.log("marking element false");
        for (var _i = 0, _a = node.childNodes; _i < _a.length; _i++) {
            var childNode = _a[_i];
            childNode["visited"] = false;
        }
    }
    function iterateDomElements(node, parent, id, parentId, _nthChild) {
        // console.log(parent + " --> " + node.tagName);
        ++totalDomElementParsed;
        node["visited"] = true;
        var name = node["tagName"].toLowerCase();
        var domElement = {};
        domElement[name] = {
            "coordinates": {
                "x": 0,
                "y": 0,
                "height": 0,
                "width": 0
            },
            "uniqueId": "",
            "shifted": false,
            "nthChild": _nthChild,
            "cssComparisonResult": {},
            "attributes": {},
            "cssProps": {},
            "path": ((parentId == 0 ? "" : parent + ">") + node.tagName.toLowerCase()).trim() + ":nth-child(" + _nthChild + ")",
            "childNodes": []
        };
        setParsedDomKeys(node, domElement, name, id, parentId);
        // console.log(`domElement ${JSON.stringify(domElement)}`);
        var nthChild = 0;
        for (var _i = 0, _a = node.childNodes; _i < _a.length; _i++) {
            var childNode = _a[_i];
            if (childNode.tagName && !childNode["visited"]) {
                // console.log(childNode.tagName);
                if (childNode.tagName.toLowerCase() == "script") {
                    childNode["visited"] = true;
                }
                else {
                    // console.log(node["nthChild"]);
                    domElement[name]["childNodes"].push(iterateDomElements(childNode, domElement[name]["path"], id + 1, id + 1, ++nthChild));
                }
            }
        }
        return domElement;
    }
    function setParsedDomKeys(node, domElement, name, id, parentId) {
        var coordinates = node.getBoundingClientRect();
        // console.log(coordinates["x"]);
        // console.log(coordinates["y"]);
        domElement[name]["attributes"] = findElementAttributes(node);
        domElement[name]["cssProps"] = findAppliedCSSOnElement(node);
        domElement[name]["found"] = false;
        domElement[name]["userId"] = id;
        domElement[name]["parentId"] = parentId;
        domElement[name]["uniqueId"] = name + "-" + cleanAttributes(domElement[name]["attributes"]);
        domElement[name]["coordinates"]["x"] = coordinates["x"];
        domElement[name]["coordinates"]["y"] = coordinates["y"];
        domElement[name]["coordinates"]["height"] = coordinates["height"];
        domElement[name]["coordinates"]["width"] = coordinates["width"];
    }
    function cleanAttributes(attr) {
        var uniqueStr = "";
        Object.entries(attr).forEach(function (entry) {
            var key = entry[0], value = entry[1];
            // console.log(`${key}: ${value}`);
            uniqueStr += "".concat(key, ":").concat(value, "*");
        });
        return uniqueStr;
    }
    function findAppliedCSSOnElement(node) {
        var appliedCSS = window.getComputedStyle(node);
        var style = {};
        for (var i = 0; i < appliedCSS.length; i++) {
            var propName = appliedCSS.item(i);
            if (!dummyElementStyleKeys.includes(propName)) {
                style[propName] = appliedCSS.getPropertyValue(propName);
            }
        }
        return style;
    }
    function findElementAttributes(node) {
        var attrsValue = {};
        if (node.hasAttributes()) {
            var attributes = node.attributes;
            for (var i = 0; i < attributes.length; i++) {
                if (attributes[i].name !== "userId") {
                    attrsValue[attributes[i].name] = attributes[i].value;
                }
            }
        }
        return attrsValue;
    }
};
var parseWebPage = function (page, filename, selector) { return __awaiter(void 0, void 0, void 0, function () {
    var result, compressedResult;
    return __generator(this, function (_a) {
        switch (_a.label) {
            case 0:
                console.log('In paseWebPages');
                return [4 /*yield*/, page.evaluate(parseHTMLAndKeepRelations, selector)];
            case 1:
                result = _a.sent();
                // console.log(`result: ${JSON.stringify(result, null, 2)}`);
                // console.log(`\n\nHURRAYYY !!!...COMPLETED PARSING ${type}`);
                console.log("filename, selector: ".concat(filename, ", ").concat(selector));
                // if (!fs.existsSync("dist\\snapshots")){
                //     fs.mkdirSync("dist\\snapshots");
                // }
                // const compressedResult = compress(result[0]);
                compress_json_1.compress;
                compressedResult = result[0];
                fs.writeFileSync(filename, JSON.stringify(compressedResult), "utf-8");
                fs.writeFileSync(filename, JSON.stringify(compressedResult), "utf-8");
                return [2 /*return*/, result[0]];
        }
    });
}); };
exports.parseWebPage = parseWebPage;
//# sourceMappingURL=parseDomPlaywright.js.map