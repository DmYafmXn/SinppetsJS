// ==UserScript==
// @name         Android Document to Plantuml
// @namespace    DW
// @version      0.1
// @description  将Android参考文档的interface、class转换成plantuml类型
// @author       DW
// @match        *://developer.android.google.cn/reference/*
// @grant        unsafeWindow
// @run-at       document-end
// ==/UserScript==
(function() {
    addUItoPage();
    function addUItoPage(){
        let caseButton = getCaseButton();
        let layoutPanel = getLayoutPanel();
        let copyButton = getCopyButton();
        let codeArea = getCodeArea();
        let action = false;

        let UINode = document.createElement("div");
        UINode.appendChild(caseButton);
        UINode.appendChild(layoutPanel);
        layoutPanel.appendChild(codeArea);
        layoutPanel.appendChild(copyButton);
        document.body.appendChild(UINode)
        caseButton.addEventListener("mouseenter",function(){
            caseButton.style["visibility"] = "hidden";
            layoutPanel.style["visibility"] = "visible";
            codeArea.value = pageToPlantuml();
        });
        layoutPanel.addEventListener("mouseleave",function(){
            layoutPanel.style["visibility"] = "hidden";
            caseButton.style["visibility"] = "visible";
        });
        copyButton.addEventListener("click",function(){
            codeArea.select();
            document.execCommand("copy");
        })
    }

    function getCaseButton(){
        let caseButton = document.createElement("p");
        caseButton.id = "caseButton"
        caseButton.style["z-index"] = "10000"
        caseButton.style["height"] = "24p"
        caseButton.style["position"] = "fixed";
        caseButton.style["top"] = "40%";
        caseButton.style["right"] = "0";
        caseButton.style["padding"] = "4px 16px";
        caseButton.style["line-height"] = "24px";
        caseButton.style["color"] = "white";
        caseButton.style["background-color"] = "#039be5";
        caseButton.style["box-shadow"] = "0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)";
        caseButton.style["border-radius"] = "2px";
        caseButton.textContent = "<";
        return caseButton;
    }

    function getCopyButton(){
        let copyButton = document.createElement("p");
        copyButton.id = "copyButton"
        copyButton.style["position"] = "absolute";
        copyButton.style["top"] = "0";
        copyButton.style["right"] = "16px";
        copyButton.style["color"] = "white";
        copyButton.style["background-color"] = "#039be5";
        copyButton.style["margin"] = "0"
        copyButton.style["padding"] = "4px 16px";
        copyButton.style["cursor"] = "pointer";
        copyButton.style["box-shadow"] = "0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15)";
        copyButton.style["border-radius"] = "2px";
        copyButton.textContent = "复制";
        return copyButton;
    }

    function getCodeArea(){
        let codeArea = document.createElement("textarea");
        codeArea.id = "codeArea"
        codeArea.style["width"] = "100%"
        codeArea.style["height"] = "100%"
        codeArea.style["padding"] = "16px"
        codeArea.style["border"] = "0px"
        codeArea.style["color"] = "#5f6368"
        codeArea.style["font"] = "550 90%/1 Roboto Mono,monospace"
        codeArea.style["line-height"] = "20px"
        codeArea.style["letter-spacing"] = ".8px"
        codeArea.style["white-space"] = "pre"
        codeArea.style["background-color"] = "rgba(255, 255, 255, .87)";
        codeArea.style["resize"] = "none";
        return codeArea;
    }

    function getLayoutPanel(){
        let layoutPanel = document.createElement("div");
        layoutPanel.id = "layoutPanel"
        layoutPanel.style["z-index"] = "10000"
        layoutPanel.style["visibility"] = "hidden"
        layoutPanel.style["position"] = "fixed"
        layoutPanel.style["right"] = "0"
        layoutPanel.style["top"] = "0"
        layoutPanel.style["bottom"] = "0"
        layoutPanel.style["min-width"] = "48%"
        layoutPanel.style["height"] = "100%"
        layoutPanel.style["background-color"] = "#e8eaed";
        layoutPanel.style["box-shadow"] = "0 0 2px 0 rgba(60,64,67,.3), 0 0 8px 3px rgba(60,64,67,.15)"

        return layoutPanel;
    }

    function pageToPlantuml(){
        let template = "@startuml {title}\ntitle {title}\n{classHead}{\n{fields}\n--\n{construtors}\n--\n{publicMethods}\n}\n@enduml";
        template = template.replace(/{title}/g,getClassName());

        template = template.replace(/{classHead}/,caseToPlantUML(getClassBody()));

        template = template.replace(/{fields}/,"");

        let constructors = getConstructors();
        constructors = caseToPlantUML(constructors);
        constructors = constructors.toString().replace(/\n,/g,"\n");
        template = template.replace(/{construtors}/,constructors);

        let publicMethods = getPublicMethods();
        publicMethods = caseToPlantUML(publicMethods);
        publicMethods = publicMethods.toString().replace(/\n,/g,"\n");
        template = template.replace(/{publicMethods}/,publicMethods);

        //         console.log(template);
        return template;
    }

    function getClassBody(){
        let classNode = document.querySelector(".api-signature");
        let regx = /\s+/g;
        let classBody = classNode.textContent.replace(regx," ").trim();
        //         console.log("classBody:"+classBody);
        return classBody;
    }

    function getClassName(){
        let className = document.querySelector(".api-title").textContent;
        //         console.log("className:"+className);
        return className;
    }

    function getConstructors(){
        let nodeList = document.querySelectorAll("#pubctors td");
        //         console.log("constructors:"+nodeList.length);
        let spaceRegx = /\s+/g;
        let methodRegx = /.+?\)/;

        let constructorsList = new Array();
        for(let i = 0;i<nodeList.length;i++){
            let constructors = nodeList[i].textContent.replace(spaceRegx," ");
            constructors = methodRegx.exec(constructors).toString().trim();
            let index = constructorsList.push("public "+constructors+"\n");
            //             console.log("constructors:"+constructorsList[index-1]);
        }
        return constructorsList;
    }

    function getPublicMethods(){
        let tdNode = document.querySelectorAll("#pubmethods td");
        //         console.log("publicMethodsLength:"+tdNode.length);
        let spaceRegx = /\s+/g;
        let methodRegx = /.+?\)/;

        let attr = null;
        let methodList = new Array();
        for (let i = 0;i<tdNode.length;i++){
            if(i%2 == 0){
                attr = tdNode[i].textContent.replace(spaceRegx," ").trim();
            }else{
                let method = tdNode[i].textContent.replace(spaceRegx," ");
                method = methodRegx.exec(method).toString().trim();
                let length = methodList.push("public "+attr+" "+method+"\n");
                //                     console.log("method:"+methodList[length-1]);
            }
        }

        //         console.log("method:"+methodList.toString());

        return methodList;
    }

    function caseToPlantUML(caseStrings){
        let isArray = Array.isArray(caseStrings);
        if(isArray){
            for(let i = 0;i<caseStrings.length;i++){
                caseStrings[i] = plantUMLCase(caseStrings[i]);
            }
        }else{
            caseStrings = plantUMLCase(caseStrings);
        }
        return caseStrings;
    }

    function plantUMLCase(caseString){
        let publicRegx = /public\s/g;
        caseString = caseString.replace(publicRegx,"+");

        let staticRegx = /static/g;
        caseString = caseString.replace(staticRegx,"{static}");

        let abstractRegx = /abstract/g;
        caseString = caseString.replace(abstractRegx,"{abstract}");

        return caseString;
    }

})();