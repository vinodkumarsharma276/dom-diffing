import playwright from "playwright";
import * as fs from "fs";

const parseResultAnsShowDomDiff = async () => {
    console.log("********   HIGHLIGHTING ELEMENTS WITH DIFFERENCE    ********");
    const domDiffResult =JSON.parse(fs.readFileSync("result.json", "utf-8"));

    const baselineResult = domDiffResult[0];
    const candidateResult = domDiffResult[1];
    const nodesToHighlight = [];

    // calculateNodesToHighlight(baselineResult, candidateResult, nodesToHighlight);

    await highlightDomDiffInBrowser_Baseline(baselineResult);
    await highlightDomDiffInBrowser_Candidate(candidateResult);
}

const highlightDomDiffInBrowser_Baseline = async (baseLineResult) => {
    const resultPageBaseline = "https://victorious-pond-0e5552910.1.azurestaticapps.net/";

    const browser = await playwright.chromium.launch({args: ["--disable-web-security"], headless: false});
    const page = await browser.newPage();
    await page.setViewportSize({
        width: 1620,
        height: 800,
      });
      
    await page.goto(resultPageBaseline);

    await page.evaluate((baseLineResult) => {
        //Set page title to Baseline
        document.title = "Baseline";

        iterateElements(baseLineResult);

        const showToolTip = (element, toolTipText) => {
            const span = document.createElement("span");
            span.className = "tooltiptext";
            span.id = "tip";
            span.innerHTML = JSON.stringify(toolTipText);
            span.style.opacity = "1";
            span.style.color = "white";
            element.appendChild(span);
            span.style.backgroundColor = "black";
        }

        const hideToolTip = () => {
            const span = document.getElementById("tip");
            span.remove();
        }

        function iterateElements(baseLineResult){
            const tag = Object.keys(baseLineResult)[0];

            if(Object.keys(baseLineResult[tag]["cssComparisonResult"]).length > 0){
                const path = baseLineResult[tag]["path"];
                const element = document.querySelector(path);
                element.style.setProperty("border-style", "solid");
                element.style.setProperty("border-color", "orange");
                element.style.setProperty("border-width", "4px");

                element.addEventListener("mouseover", () => showToolTip(element, baseLineResult[tag]["cssComparisonResult"]));
                element.addEventListener("mouseout", () => hideToolTip());                
            }

            if(baseLineResult[tag]["missing"]){
                const path = baseLineResult[tag]["path"];
                console.log(path);
                const element = document.querySelector(path);

                element.style.setProperty("border-style", "solid");
                element.style.setProperty("border-color", "green");
                element.style.setProperty("border-width", "4px");

                element.addEventListener("mouseover", () => showToolTip(element, `tag: ${tag} path: ${baseLineResult[tag]["path"]} removed`));
                element.addEventListener("mouseout", () => hideToolTip());
            }

            for(const childNode of baseLineResult[tag]["childNodes"]){
                iterateElements(childNode);
            }
        }

    }, baseLineResult);

    page.on("close", () => {
        process.exit(0);
    })
}

const highlightDomDiffInBrowser_Candidate = async (candidateResult) => {
    const resultPageCandidate = "https://ambitious-smoke-0a8712010.1.azurestaticapps.net/";

    const browser = await playwright.chromium.launch({args: ["--disable-web-security"], headless: false});
    const page = await browser.newPage();
    await page.setViewportSize({
        width: 1620,
        height: 800,
      });
      
    await page.goto(resultPageCandidate);

    await page.evaluate((candidateResult) => {
        //Set page title to Candidate
        document.title = "Candidate";

        iterateElements(candidateResult);

        const showToolTip = (element, toolTipText) => {
            const span = document.createElement("span");
            span.className = "tooltiptext";
            span.id = "tip";
            span.innerHTML = JSON.stringify(toolTipText);
            span.style.opacity = "1";
            span.style.color = "white";
            element.appendChild(span);
            span.style.backgroundColor = "black";
        }

        const hideToolTip = () => {
            const span = document.getElementById("tip");
            span.remove();
        }

        function iterateElements(candidateResult){
            const tag = Object.keys(candidateResult)[0];

            if(Object.keys(candidateResult[tag]["cssComparisonResult"]).length > 0){
                const path = candidateResult[tag]["path"];
                const element = document.querySelector(path);
                element.style.setProperty("border-style", "solid");
                element.style.setProperty("border-color", "orange");
                element.style.setProperty("border-width", "4px");

                element.addEventListener("mouseover", (event) => showToolTip(element, candidateResult[tag]["cssComparisonResult"]));
                element.addEventListener("mouseout", (event) => hideToolTip());  
            }

            if(candidateResult[tag]["missing"]){
                const path = candidateResult[tag]["path"];
                const elements = document.querySelectorAll(path);
                const element = elements[candidateResult[tag]["nthChild"]];
                element.style.setProperty("border-style", "solid");
                element.style.setProperty("border-color", "green");
                element.style.setProperty("border-width", "4px");

                element.addEventListener("mouseover", () => showToolTip(element, `tag: ${tag} path: ${baseLineResult[tag]["path"]} removed`));
                element.addEventListener("mouseout", () => hideToolTip());    
            }

            for(const childNode of candidateResult[tag]["childNodes"]){
                iterateElements(childNode);
            }
        }

    }, candidateResult);

    page.on("close", () => {
        process.exit(0);
    })
}

const calculateNodesToHighlight = () => {
    findElementsToHighlightInBaseline(baselineResult, nodesToHighlight);
    findElementsToHighlightInCandidate(candidateResult, nodesToHighlight);

    console.log(nodesToHighlight);
}

const findElementsToHighlightInBaseline = (node, nodesToHighlight) => {
    const tag = Object.keys(node)[0];
    const item = {};
    console.log(tag);
    console.log(node[tag]["path"] + " " + node[tag]["nthChild"] + " " + node[tag]["cssComparisonResult"]);

   if(Object.keys(node[tag]["cssComparisonResult"]).length > 0 || node[tag]["missing"]){
       console.log(tag);
       item["cssComparisonResult"] = node[tag]["cssComparisonResult"];
       item["deleted"] = node[tag]["missing"];
       item["path"] = node[tag]["path"];

       nodesToHighlight.push(item);
   }

   for(const childNode of node[tag]["childNodes"]){
    findElementsToHighlightInBaseline(childNode, nodesToHighlight);
   }
}

const findElementsToHighlightInCandidate = (node, nodesToHighlight) => {
    const tag = Object.keys(node)[0];
    const item = {};

    // console.log(tag);

   if(node[tag]["missing"]){
       item["added"] = true;
       item["path"] = node[tag]["path"];

       nodesToHighlight.push(item);
   }

   for(const childNode of node[tag]["childNodes"]){
    findElementsToHighlightInCandidate(childNode, nodesToHighlight);
   }
}

await parseResultAnsShowDomDiff();