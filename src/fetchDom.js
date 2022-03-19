import fs from 'fs';
import got from 'got';
import { JSDOM } from "jsdom";

const vgmUrl= 'https://www.twilio.com/blog/web-scraping-and-parsing-html-in-node-js-with-jsdom';

const response = await got('https://www.twilio.com/blog/web-scraping-and-parsing-html-in-node-js-with-jsdom');
// console.log(response.body);
const dom = new JSDOM(response.body);
const body = dom.window.document.body;
// const element = dom.window.document.getElementsByTagName("div")[4];
// console.log(element.getAttributeNames());
// const elementCss = dom.window.getComputedStyle(element);
// console.log(elementCss);
// const valueObject = elementCss._values;
// Object.keys(valueObject).map((key) => {
//    console.log(`${key} , ${valueObject[key]}`);
// });

const iterateHTMLPage = async(window, node) => {
   console.log(node.tagName);

   if(node.hasChildNodes()){
      // console.log(`Total childNodes: ${node.childNodes.length}`);
      const elementCss = window.getComputedStyle(node);
      const valueObject = elementCss._values;
      const keys = Object.keys(valueObject);
      // console.log(`${key} , ${valueObject[key]}`);
      
      // for (let i = 0; i < keys.length; i++) {
      //    console.log(`${keys[i]} , ${valueObject[keys[i]]}`);
      // }

      const nodeList = node.childNodes;
      for (let i = 0; i < nodeList.length; i++) {
         if(nodeList[i].tagName != undefined) iterateHTMLPage(nodeList[i]); else continue;
      }
   }
} 


await iterateHTMLPage(dom.window, body);