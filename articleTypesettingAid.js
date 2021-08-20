// ==UserScript==
// @name         文章排版辅助
// @namespace    http://tampermonkey.net/
// @version      0.1
// @description  try to take over the world!
// @author       You
// @match        http://oa.gzpinda.com/*
// @icon         data:image/gif;base64,R0lGODlhAQABAAAAACH5BAEKAAEALAAAAAABAAEAAAICTAEAOw==
// @grant        none
// @run-at       document-idle
// ==/UserScript==

(function() {
    'use strict';// 严格模式
    console.log('script is injection.');
    // 文章排版辅助数据库
    class ArticleTypesettingAidDB{
        constructor(onSuccess,onError) {
            const request = window.indexedDB.open('ArticleTypesettingAidDB',2);

            request.onupgradeneeded = e=> {
                console.log('indexed db onupgradeneeded:'+e);
                // 创建存储空间（表）和item（记录）
                const db = e.target.result;// 获取数据库操作句柄
                if (!db.objectStoreNames.contains('column_keywords')){
                    const column_keywords = db.createObjectStore('column_keywords', {keyPath: 'id', autoIncrement: true});
                    column_keywords.createIndex('column_keywords', 'column_keywords', {unique: true});
                }
                if (!db.objectStoreNames.contains('column')){
                    const column = db.createObjectStore('column', {keyPath: 'id', autoIncrement: true});
                    column.createIndex('column_name', 'column_name', {unique: true});
                }
                if (!db.objectStoreNames.contains('column_keywords_column')){
                    const column_keywords_column = db.createObjectStore('column_keywords_column',
                     {keyPath: 'id', autoIncrement: true});
                     column_keywords_column.createIndex('column_keywords_id_column_id', 'column_keywords_id', {unique: false});
                }
                if (!db.objectStoreNames.contains('main_body_filter_keywords')){
                    const main_body_filter_keywords = db.createObjectStore('main_body_filter_keywords',
                     {keyPath: 'id', autoIncrement: true});
                     main_body_filter_keywords.createIndex('main_body_filter_keywords', 'mian_body_filter_keywords', {unique: true});
                }
            };
            request.onsuccess = e=>{
                console.log('indexed DB connection success:'+e);
                if (onSuccess) onSuccess(e)
            };
            request.onerror = e=>{
                console.log('indexed DB connnection error'+e);
                if (onError) onError(e);
            };
        }
    }
    class ArticleTypesettingAidDAO{
        constructor(DB){
            this.DB = DB;
            this.readwrite = 'readwrite';
            this.readonly = 'readonly';
        }
        addData(objectStoreName,addData,successCallable,errorCallable){
            console.log('addData,objectStoreName='+objectStoreName+',addData='+JSON.stringify(addData));
            const transaction = this.DB.transaction([objectStoreName], this.readwrite);
            const objectStore = transaction.objectStore(objectStoreName);
            const request = objectStore.add(addData);
            request.onsuccess = successCallable;
            request.onerror = errorCallable;
        }
        putData(objectStoreName,putData,successCallable,errorCallable){
            console.log('putData,objectStoreName='+objectStoreName+',putData='+JSON.stringify(putData));
            const transaction = this.DB.transaction([objectStoreName], this.readwrite);
            const objectStore = transaction.objectStore(objectStoreName);
            const request = objectStore.put(putData);
            request.onsuccess = successCallable;
            request.onerror = errorCallable;

        }
        deleteData(objectStoreName,deleteDataKey,successCallable,errorCallable){
            console.log('deleteData,objectStoreName='+objectStoreName+',deleteDataKey='+deleteDataKey);
            const transaction = this.DB.transaction([objectStoreName], this.readwrite);
            const objectStore = transaction.objectStore(objectStoreName);
            const request = objectStore.delete(deleteDataKey);
            request.onsuccess = successCallable;
            request.onerror = errorCallable;

        }
        getDataForKey(objectStoreName,key,successCallable,errorCallable){
            console.log('getDataForKey,objectStoreName='+objectStoreName+',key='+key);
            const transaction = this.DB.transaction([objectStoreName], this.readonly);
            const objectStore = transaction.objectStore(objectStoreName);
            const request = objectStore.get(key);
            request.onsuccess = successCallable;
            request.onerror = errorCallable;

        }
        getFirstDataForIndex(objectStoreName,indexName,indexKey,successCallable,errorCallable){
            console.log('getFirstDataForIndex,objectStoreName='+objectStoreName+',indexName='+indexName+',indexKey='+indexKey);
            const transaction = this.DB.transaction([objectStoreName], this.readonly);
            const objectStore = transaction.objectStore(objectStoreName);
            const request = objectStore.index(indexName).get(indexKey);
            request.onsuccess = successCallable;
            request.onerror = errorCallable;
        }
        getAllDataForIndex(objectStoreName,indexName,indexKeypath,indexKeyes,successCallable,errorCallable){
            console.log('getAllDataForIndex,objectStoreName='+objectStoreName
            +',indexName='+indexName+',indexKeypath='+indexKeypath+',indexKeyes='+indexKeyes);
            const transaction = this.DB.transaction([objectStoreName], this.readonly);
            const objectStore = transaction.objectStore(objectStoreName);
            const objectIndex = objectStore.index(indexName);
            const request = objectIndex.openCursor()
            let result = [];
            request.onsuccess = e=>{
                let cursor = e.target.result;
                if (cursor){
                    let value = cursor.value[indexKeypath];
                    console.log('getAllDataForIndex,result='+cursor.value+',target value='+value);
                    if (Array.isArray(indexKeyes)){
                        for (let i = 0;i<indexKeyes.length;i++){
                            if (value == indexKeyes[i]) result.push(cursor.value);
                        }
                    }else{
                        if (value == indexKeyes){
                            result.push(cursor.value);
                        }
                    }
                    cursor.continue();
                }else{
                    if (successCallable) successCallable(result);
                }
            }
            request.onerror = errorCallable;
        }
        getAllData(objectStoreName,range,successCallable,errorCallable){
            console.log('getAllData,objectStoreName='+objectStoreName+',range='+range);
            const transaction = this.DB.transaction([objectStoreName], this.readonly);
            const objectStore = transaction.objectStore(objectStoreName);
            const request = objectStore.getAll(range);
            request.onsuccess = successCallable;
            request.onerror = errorCallable;

        }

    }
    class ColumnKeywordsDAO extends ArticleTypesettingAidDAO{
        constructor(DB){
            super(DB);
            this.objectStoreName = 'column_keywords';
            this.indexName = 'column_keywords';
        }
        addColumnKeywords(data,successCallable,errorCallable){
            let dataJson = {
                'column_keywords':data,
                'add_time':(new Date()).getTime(),
                'change_time':0
            }
            super.addData(this.objectStoreName,dataJson,successCallable,errorCallable);
        }
        putColumnKeywords(data,successCallable,errorCallable){
            super.putData(this.objectStoreName,data,successCallable,errorCallable);
        }
        deleteColumnKeywordsForKey(key,successCallable,errorCallable){
            super.deleteData(this.objectStoreName,key,successCallable,errorCallable);
        }
        getColumnKeywordsForKey(key,successCallable,errorCallable){
            super.getDataForKey(this.objectStoreName,key,successCallable,errorCallable);
        }
        getColumnKeywordsForIndex(indexKey,successCallable,errorCallable){
            super.getFirstDataForIndex(this.objectStoreName,this.indexName,indexKey,successCallable,errorCallable);
        }
        getColumnKeywordsAll(range,successCallable,errorCallable){
            super.getAllData(this.objectStoreName,range,successCallable,errorCallable);
        }
    }
    class ColumnDAO extends ArticleTypesettingAidDAO{
        constructor(DB){
            super(DB);
            this.objectStoreName = 'column';
            this.indexName = 'column_name';
        }
        addColumn(columnName,level,successCallable,errorCallable){
            let dataJson = {
                'column_name':columnName,
                'column_level':level,
                'add_time':(new Date()).getTime(),
                'change_time':0
            }
            super.addData(this.objectStoreName,dataJson,successCallable,errorCallable);
        }
        putColumn(data,successCallable,errorCallable){
            super.putData(this.objectStoreName,data,successCallable,errorCallable);
        }
        deleteColumnForKey(key,successCallable,errorCallable){
            super.deleteData(this.objectStoreName,key,successCallable,errorCallable);
        }
        getColumnForKey(key,successCallable,errorCallable){
            super.getDataForKey(this.objectStoreName,key,successCallable,errorCallable);
        }
        getColumnForIndex(indexKey,successCallable,errorCallable){
            super.getFirstDataForIndex(this.objectStoreName,this.indexName,indexKey,successCallable,errorCallable);
        }
        getColumnAll(range,successCallable,errorCallable){
            super.getAllData(this.objectStoreName,range,successCallable,errorCallable);
        }
    }
    class ColumnKeywordsColumnDAO extends ArticleTypesettingAidDAO{
        constructor(DB){
            super(DB);
            this.objectStoreName = 'column_keywords_column';
            this.indexName = 'column_keywords_id_column_id';
            this.indexKeyPath = 'column_keywords_id'
        }
        addColumnKeywordsColumn(columnKeywordsId,columnId,successCallable,errorCallable){
            let dataJson = {
                'column_keywords_id':columnKeywordsId,
                'column_id':columnId,
                'add_time':(new Date()).getTime(),
                'change_time':0
            }
            super.addData(this.objectStoreName,dataJson,successCallable,errorCallable);
        }
        putColumnKeywordsColumn(data,successCallable,errorCallable){
            super.putData(this.objectStoreName,data,successCallable,errorCallable);
        }
        deleteColumnKeywordsColumnForKey(key,successCallable,errorCallable){
            super.deleteData(this.objectStoreName,key,successCallable,errorCallable);
        }
        getColumnKeywordsColumnForKey(key,successCallable,errorCallable){
            super.getDataForKey(this.objectStoreName,key,successCallable,errorCallable);
        }
        getColumnKeywordsColumnForIndex(indexKey,successCallable,errorCallable){
            super.getFirstDataForIndex(this.objectStoreName,this.indexName,indexKey,successCallable,errorCallable);
        }
        getAllColumnKeywordsColumnForIndex(indexKeyes,successCallable,errorCallable){
            super.getAllDataForIndex(this.objectStoreName,this.indexName,this.indexKeyPath,indexKeyes,successCallable,errorCallable);
        }
        getColumnKeywordsColumnAll(range,successCallable,errorCallable){
            super.getAllData(this.objectStoreName,range,successCallable,errorCallable);
        }
    }
    class MainBodyFilterKeywordsDAO extends ArticleTypesettingAidDAO{
        constructor(DB){
            super(DB);
            this.objectStoreName = 'main_body_filter_keywords';
            this.indexName = 'main_body_filter_keywords';
        }
        addMainBodyFilterKeywords(keywords,level,successCallable,errorCallable){
            let dataJson={
                'mian_body_filter_keywords':keywords,
                'mian_body_filter_keywords_level':level,
                'add_time':(new Date()).getTime(),
                'change_time':0
            }
            super.addData(this.objectStoreName,dataJson,successCallable,errorCallable);
        }
        putMainBodyFilterKeywords(data,successCallable,errorCallable){
            super.putData(this.objectStoreName,data,successCallable,errorCallable);
        }
        deleteMainBodyFilterKeywordsForKey(key,successCallable,errorCallable){
            super.deleteData(this.objectStoreName,key,successCallable,errorCallable);
        }
        getMainBodyFilterKeywordsForKey(key,successCallable,errorCallable){
            super.getDataForKey(this.objectStoreName,key,successCallable,errorCallable);
        }
        getMainBodyFilterKeywordsForIndex(indexKey,successCallable,errorCallable){
            super.getFirstDataForIndex(this.objectStoreName,this.indexName,indexKey,successCallable,errorCallable);
        }
        getMainBodyFilterKeywordsAll(range,successCallable,errorCallable){
            super.getAllData(this.objectStoreName,range,successCallable,errorCallable);
        }
    }

    // 文章排版辅助页面挂钩
    class ArticleTypesettingAidHook{
        constructor(onLoad) {
            console.log('page hook start.');
            // 获取第一个iframe
            let iframeRightNode = document.getElementsByTagName('iframe')[1];
            if (iframeRightNode) {
                console.log('set iframe listener.')
                iframeRightNode.addEventListener('load',()=>{
                    console.log('iframe node onload finish.');
                    if (onLoad) onLoad(iframeRightNode.contentWindow);
                });
                return;
            }else{
                console.log('iframe hook node no found!');
            }
            // 直接使用当前window
            console.log('window onload hook.')
            window.addEventListener('load',()=>{
                console.log('window onload finish.');
                if (onLoad) onLoad(window);
            })
            
        }

    }
    // 页面修改接口
    class ArticleChangeAPI{
        constructor(windownsNode){
            this.windownNode = windownsNode;
            this.documentNode = windownsNode.document;
        }
        windownHook(callable){
            console.log('windownHook');
            if (callable) callable(this.windownNode);
        }
        documentHook(callable){
            console.log('documentHook');
            if (callable) callable(this.documentNode);
        }
        changeTitle(callable){
            console.log('changeTitle');
            let titleNode = this.documentNode.getElementsByClassName('oa_input oa_input_large')[0];
            // 当前页面不是【正文整理】
            if (!titleNode) return;

            if (callable){
                callable(titleNode);
            }
        }
        changeColumn(callable){
            console.log('changeColumn');
            let columnNode = this.documentNode.getElementsByClassName('oa_input oa_input_large')[1];
            // 当前页面不是【正文整理】
            if (!columnNode) return;

            if (callable){
                callable(columnNode);
            }
        }
        mainBodyIframeWindowHook(callable){
            console.log('mainBodyIframeWindowHook');
            // 获取目标iframe
            let iframeContentNode = this.documentNode.getElementsByTagName('iframe')[0];
            // 当前页面不是【正文整理】
            if (!iframeContentNode) return;
            if (callable) callable(iframeContentNode.contentWindow);
        }
        changeMainBody(callable){
            console.log('changeMainBody');
            // 获取目标iframe
            let iframeContentNode = this.documentNode.getElementsByTagName('iframe')[0];
            // 当前页面不是【正文整理】
            if (!iframeContentNode) return;
            // 获取主体内容
            let mainBodyNode = iframeContentNode.contentWindow.document.querySelector('body[contenteditable]');
            // 获取所有p节点
            let textNodes = mainBodyNode.querySelectorAll('p');
            // 节点分派
            for (let i=0;i<textNodes.length;i++){
                if (callable){
                    callable(textNodes[i]);
                }
            }
        }
    }

    // 标题辅助
    class TitleAuxiliary{
        constructor(){}
        apply(){

        }
    }
    // 候选区view
    class CandidateView{
        constructor(windowNode,hookNode){
            this.hookNode = hookNode;
            this.boxId = 'container_box';
            this.candidateBox = this.__containerGenerate();
            this.groupNode = this.__groupNodeGenerate();
            this.candidateBox.appendChild(this.groupNode);
            // 添加鼠标监听
            this.inBoxRange = false;
            this.candidateBox.addEventListener('mouseenter',e=>{
                this.inBoxRange = true;
            });
            this.candidateBox.addEventListener('mouseleave',e=>{
                this.inBoxRange = false;
            });
            // 添加候选区到页面
            if (!this.isExist(windowNode.document.body)){
                windowNode.document.body.appendChild(this.candidateBox);
            }
            // 添加输入监听器
            hookNode.addEventListener('input',e=>{
                this.clearCandidateTexts();
            });
            // 添加获取焦点监听器
            hookNode.addEventListener('focus',e=>{
                let eventNode = e.target;
                let nodeOffsetX = this.__getOffsetX(eventNode);
                let nodeOffsetY = this.__getOffsetY(eventNode);
                let x = nodeOffsetX;
                let y = nodeOffsetY + eventNode.offsetHeight;
                if (this.__getOffsetX(this.candidateBox) == x && this.__getOffsetY(this.candidateBox) == y){
                    if (this.isVisibility()){
                        return;
                    }else{
                        this.setVisibility(true);
                    }
                }
                this.setPosition(x,y);
                this.setSize(eventNode.offsetWidth,'auto');
                this.clearCandidateTexts();
                this.setVisibility(true);
            });
            // 添加失去焦点监听器
            hookNode.addEventListener('blur',e=>{
                if (!this.inBoxRange){
                    this.setVisibility(false);
                }
            });
            // 添加鼠标右键监听器
            hookNode.addEventListener('mouseup', e=>{
                if(e.button == 2){
                    this.setVisibility(false);
                }
            });
        }
        __getOffsetX(node){
            let nodeOffsetX = node.offsetLeft;
            if (node.offsetParent){
                nodeOffsetX += this.__getOffsetX(node.offsetParent);
            }
            return nodeOffsetX;
        }
        __getOffsetY(node){
            let nodeOffsetY = node.offsetTop;
            if (node.offsetParent){
                nodeOffsetY += this.__getOffsetY(node.offsetParent);
            }
            return nodeOffsetY;
        }
        isExist(node){
            let result = false;
            if (node.querySelector('#'+this.boxId)){
                result = true;
            }
            return result;
        }
        setCandidateText(text){
            if (this.groupNode.firstChild){
                this.groupNode.insertBefore(this.__itemNodeGeneraate(text),this.groupNode.firstChild);
            }else{
                this.groupNode.appendChild(this.__itemNodeGeneraate(text));
            }
        }
        setCandidateTexts(textList){
            // 清除旧候选词
            this.clearCandidateTexts();
            // 添加新的候选词
            for (let i = textList.length-1;i > 0;i--){
                this.setCandidateText(textList[i]);
            }
        }
        clearCandidateTexts(){
            this.groupNode.innerHTML = '';
        }
        setPosition(x,y){
            if (x && y){
                this.candidateBox.style['left'] = x+'px';
                this.candidateBox.style['top'] = y+'px';
            }
        }
        setSize(width,height){
            if (width && height){
                let setWidth;
                let setHeight;
                if (width == 'auto') setWidth = width; else setWidth = width+'px';
                if (height == 'auto') setHeight = height; else setHeight = height+'px';
                this.candidateBox.style['width'] = setWidth;
                this.candidateBox.style['height'] = setHeight;
            }
        }
        isVisibility(){
            return this.candidateBox.style['visibility'] == 'visible';
        }
        setVisibility(visible){
            if (visible){
                this.candidateBox.style['visibility'] = 'visible';
            }else{
                this.candidateBox.style['visibility'] = 'hidden';
            }
        }
        getCandidateView(){
            return this.candidateBox;
        }
        __containerGenerate(){
            // 容器样式
            let style_div = 'position:absolute;\
                min-width:100px;\
                min-height:50px;\
                visibility:hidden;\
                line-height:32px;\
                font-size:18px;\
                background-color:#fff;\
                box-shadow:0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15);\
                z-index:300;';
            let containerBox = document.createElement('div');
            containerBox.setAttribute('style',style_div);
            containerBox.setAttribute('id',this.boxId);
            return containerBox;
        }
        __groupNodeGenerate(){
            let groupStyle = 'margin:0;padding:0;width:100%;'
            let groupNode = document.createElement('ul');
            groupNode.setAttribute('style',groupStyle);
            return groupNode;
        }
        __itemNodeGeneraate(text){
            let itemStyle = 'padding:0px 8px;font-size:16px;list-style-type:none;';
            let itemNode = document.createElement('li');
            itemNode.textContent = text;
            itemNode.setAttribute('style',itemStyle);
            itemNode.addEventListener('mouseenter',e=>{
                itemNode.style['background-color'] = '#eee';
            });
            itemNode.addEventListener('mouseleave',e=>{
                itemNode.style['background-color'] = 'transparent';
            });
            itemNode.addEventListener('click',e=>{
                this.hookNode.value = itemNode.textContent;
                this.setVisibility(false);
            });
            return itemNode;
        }
    }
    // 栏目辅助
    class ColumnAuxiliary{
        constructor(DB){
            this.DB = DB;
        }
        apply(windowNode,inputNode){
            let candidateView = new CandidateView(windowNode,inputNode);
            // 添加输入监听器
            inputNode.addEventListener('input',e=>{
                console.log(e.target.value);
                // this.__queryAllRelevantColumn(e.target.value,e=>{
                //     console.log('query result='+JSON.stringify(e.target.result));
                //     this.candidateView.setCandidateText(e.target.result.column_name);
                // })
                this.__queryAllRelevantColumnHyphenation(e.target.value,columnWeightList=>{
                    console.log('query result='+JSON.stringify(columnWeightList));
                    for (let i = 0;i < columnWeightList.length;i++){
                        candidateView.setCandidateText(columnWeightList[i].column.column_name);
                    }
                });
            });
            // 添加获取焦点监听器
            inputNode.addEventListener('focus',e=>{
                console.log('get focus');
                this.__queryAllRelevantColumnHyphenation(e.target.value,columnWeightList=>{
                    console.log('query result='+JSON.stringify(columnWeightList));
                    for (let i = 0;i < columnWeightList.length;i++){
                        candidateView.setCandidateText(columnWeightList[i].column.column_name);
                    }
                });
            });
        }
        __queryAllRelevantColumn(text,callable){
            let columnKeywordsDAO = new ColumnKeywordsDAO(this.DB);
            let columnKeywordsColumnDAO = new ColumnKeywordsColumnDAO(this.DB);
            let columnDAO = new ColumnDAO(this.DB);

            new Promise((resolve,reject)=>{
                // 获取所有栏目关键字
                columnKeywordsDAO.getColumnKeywordsAll(IDBKeyRange.lowerBound(0),event=>{
                    // 栏目关键字与现在的栏目匹配
                    let keywordsList = event.target.result;
                    console.log('get all lenght='+keywordsList.length);
                    let patternKeywords = [];
                    for (let i = 0;i<keywordsList.length;i++){
                        if (keywordsRegularMatching(keywordsList[i].column_keywords,text)) {
                            patternKeywords.push(keywordsList[i]);
                        }
                    }
                    // 返回关键字匹配成功列表
                    resolve(patternKeywords);
                });
            }).then(keywordsList=>{
                return new Promise((resolve,reject)=>{
                    // 根据栏目关键字id获取栏目id
                    let columnKeywordsIdList = [];
                    for (let i = 0;i<keywordsList.length;i++){
                        columnKeywordsIdList.push(keywordsList[i].id);
                    }
                    columnKeywordsColumnDAO.getAllColumnKeywordsColumnForIndex(columnKeywordsIdList,list=>{
                        // TODO list去重
                        resolve(list);
                    });
                });
            }).then(columnKeywordsColumnList=>{
                for (let i=0;i<columnKeywordsColumnList.length;i++){
                    // 根据栏目key获取栏目
                    columnDAO.getColumnForKey(columnKeywordsColumnList[i].column_id,e=>{
                        if (callable) callable(e);
                    })
                }
            });
        }
        __queryAllRelevantColumnHyphenation(text,successCallable,errorCallable){
            // 查询所有栏目
            new Promise((resolve,reject)=>{
                let columnDAO = new ColumnDAO(this.DB);
                columnDAO.getColumnAll(IDBKeyRange.lowerBound(0),e=>{
                    resolve(e.target.result);
                });
            }).then(columnList=>{
                // 数据包装，增加权重属性
                return new Promise((resolve,reject)=>{
                    let columnWeightList = [];
                    for (let i = 0;i < columnList.length;i++){
                        columnWeightList.push({
                            'column':columnList[i],
                            'weight':0
                        });
                    }
                    resolve(columnWeightList);
                });
            }).then(columnWeightList=>{
                // 进行权重赋值
                return new Promise((resolve,reject)=>{
                    for(let i = 0;i < text.length;i++){
                        let charText = text.charAt(i);
                        for (let j = 0;j < columnWeightList.length;j++){
                            if (columnWeightList[j].column.column_name.search(charText) != -1){
                                columnWeightList[j].weight += 1;
                            }
                        }
                    }
                    resolve(columnWeightList);
                });
            }).then(columnWeightList=>{
                // 进行按权重排序
                columnWeightList.sort((a,b)=>{
                    return a.weight - b.weight;
                })
                if (successCallable) successCallable(columnWeightList);
            })
        }

    }
    // 正文辅助
    class MainBodyAuxiliary{
        apply(node,keywordsList){
            console.log('mainBodyAuxiliary');
            let result = {'result':false,'keywords':''};
            for (let i = 0;i < keywordsList.length;i++){
                if (keywordsRegularMatching(keywordsList[i].mian_body_filter_keywords,node.innerHTML)) {
                    result.result = true;
                    result.keywords = keywordsList[i].mian_body_filter_keywords;
                    break;
                }
            }
            if (result.result){
                // 这种灰色背景色
                node.style["background-color"] = "#dddddd";
                // 添加过滤原因显示
                let filterHintButton = document.createElement('input');
                filterHintButton.setAttribute('type','button');
                filterHintButton.setAttribute('value','hint');
                filterHintButton.onclick = function(){
                    alert(result.keywords);
                }
                node.appendChild(filterHintButton);
                // 添加删除功能
                let deleteButton = document.createElement('input');
                deleteButton.setAttribute('type','button');
                deleteButton.setAttribute('value','delete');
                deleteButton.onclick = function(){
                    node.parentNode.removeChild(node);
                }
                node.appendChild(deleteButton);
                // 添加还原功能
                let resetButton = document.createElement('input');
                resetButton.setAttribute('type','button');
                resetButton.setAttribute('value','reset');
                resetButton.onclick = function(){
                    // 撤销背景颜色
                    node.removeAttribute('style');
                    let buttons = node.getElementsByTagName('input');
                    console.log(buttons.length);
                    // 删除功能按钮
                    for (let i=buttons.length - 1;i>=0;i--){
                        console.log('length='+buttons.length+',i='+i);
                        node.removeChild(buttons[i]);
                    }
                }
                node.appendChild(resetButton);
            }
        }
    }
    // 上下文菜单
    class DataAddContextMenu{
        constructor(){
            this.dataAddContextMenu = this.__contextMenuGenerate();
            this.dataAddContextMenu.appendChild(this.__actionMenuGenerate());
        }
        getDataAddContextMenu(){
            return this.dataAddContextMenu;
        }
        setValueToInputText(text){
            let inputTextNodes = this.dataAddContextMenu.querySelectorAll('[type=text]');
            for (let i = 0;i < inputTextNodes.length;i++){
                inputTextNodes[i].setAttribute('value',text);
            }
        }
        isVisibility(){
            return this.dataAddContextMenu.style['visibility'] == 'visible';
        }
        setVisibility(visible){
            if (visible){
                this.dataAddContextMenu.style['visibility'] = 'visible';
            }else{
                this.dataAddContextMenu.style['visibility'] = 'hidden';
            }
        }
        setPosition(x,y){
            if (x && y){
                this.dataAddContextMenu.style['left'] = x+'px';
                this.dataAddContextMenu.style['top'] = y+'px';
            }
        }
        getColumnKeywordsNode(){
            return this.dataAddContextMenu.querySelector('[name=columnKeywords]');
        }
        getColumnKeywordsValue(){
            let result = '';
            let node = this.dataAddContextMenu.querySelector('[name=columnKeywords]');
            if (node) result = node.value;
            return result;
        }
        getColumnNode(){
            return this.dataAddContextMenu.querySelector('[name=column]');
        }
        getColumnValue(){
            let result = '';
            let node = this.dataAddContextMenu.querySelector('[name=column]');
            if (node) result = node.value;
            return result;
        }
        getMainBodyKeywordsNode(){
            return this.dataAddContextMenu.querySelector('[name=mainBodyKeywords]');
        }
        getMainBodyKeywordsValue(){
            let result = '';
            let node = this.dataAddContextMenu.querySelector('[name=mainBodyKeywords]');
            if (node) result = node.value;
            return result;
        }
        getAddColumnKeywordsColumnButton(){
            return this.dataAddContextMenu.querySelector('[name=columnKeywordsColumnSave]');
        }
        setOnClickToAddColumnKeywordsColumn(callable){
            if (!callable) return;
            let addButtonNode = this.getAddColumnKeywordsColumnButton();
            if (addButtonNode) addButtonNode.addEventListener('click',callable);
        }
        addColumnKeywordsColumnButtonStart(){
            let node = this.getAddColumnKeywordsColumnButton();
            node.value = '保存中...'
            node.setAttribute('disabled',true);
        }
        addColumnKeywordsColumnButtonEnd(){
            let node = this.getAddColumnKeywordsColumnButton();
            node.value = '保存成功'
        }
        addColumnKeywordsColumnButtonError(){
            let node = this.getAddColumnKeywordsColumnButton();
            node.value = '保存失败'
        }
        addColumnKeywordsColumnButtonReset(){
            let node = this.getAddColumnKeywordsColumnButton();
            node.value = '保存'
            node.removeAttribute('disabled');
        }
        getAddMainBodyKeywordsButton(){
            return this.dataAddContextMenu.querySelector('[name=mainBodyKeywordsSave]');
        }
        setOnClickToAddMainBodyKeywords(callable){
            if (!callable) return;
            let addButtonNode = this.getAddMainBodyKeywordsButton();
            if (addButtonNode) addButtonNode.addEventListener('click',callable);
        }
        addMainBodyKeywordsButtonStart(){
            let node = this.getAddMainBodyKeywordsButton();
            node.value = '保存中...'
            node.setAttribute('disabled',true);
        }
        addMainBodyKeywordsButtonEnd(){
            let node = this.getAddMainBodyKeywordsButton();
            node.value = '保存成功'
        }
        addMainBodyKeywordsButtonEnd(){
            let node = this.getAddMainBodyKeywordsButton();
            node.value = '保存失败'
        }
        addMainBodyKeywordsButtonReset(){
            let node = this.getAddMainBodyKeywordsButton();
            node.value = '保存'
            node.removeAttribute('disabled');
        }
        getAddMainBodyKeywordsButton(){
            return this.dataAddContextMenu.querySelector('[name=mainBodyKeywordsSave]');
        }
        setOnMouseEnterListener(callable){
            if (!callable) return;
            this.dataAddContextMenu.addEventListener('mouseenter',callable);
        }
        setOnMouseLeaveListener(callable){
            if (!callable) return;
            this.dataAddContextMenu.addEventListener('mouseleave',callable);
        }

        // 上下文菜单容器
        __contextMenuGenerate(){
            let contextMenuBox = document.createElement('div');
            contextMenuBox.setAttribute('style','position:absolute;\
                visibility:hidden;\
                background-color:#fff;\
                box-shadow:0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15);\
                z-index:200;\
                padding:16px;');
            return contextMenuBox;
        }
        // 上下文菜单具体实现
        __actionMenuGenerate(){
            // 节点样式
            let style_label = 'font-size: 16px;\
                width: 100px;\
                height: 24px;\
                line-height: 24px;\
                text-align: right;\
                display: inline-block;';
            let style_input_text = 'border: 1px solid;\
                width: 180px;\
                height: 24px;\
                margin: 8px 0px;\
                padding: 0 4px;';
            let style_input_button = 'margin: 8px 0px 8px auto;\
                display: block;\
                background: #1d95ee;\
                color: #fff;\
                border-radius: 4px;\
                pointer-events: auto;\
                text-transform: none;\
                box-shadow: 0 2px 2px 0 rgb(0 0 0 / 14%), 0 1px 5px 0 rgb(0 0 0 / 12%), 0 3px 1px -2px rgb(0 0 0 / 20%);\
                border:0;\
                align-items: center;\
                cursor: pointer;\
                user-select: none;\
                width: 180px;\
                height: 28px;';

                // padding: 0 8px;\
                // border: 1px solid;';
            let style_hr = 'border-style: dotted;\
                background-color: transparent;\
                height: 0px;\
                border-width: 1px;\
                margin: 16px 0;'
            // 根容器
            let actionBox = document.createElement('div')
            // 栏目关键字容器
            let columnKeywordsBox = document.createElement('div');
            // 栏目关键字
            let columnKeywordsHint = document.createElement('label');
            columnKeywordsHint.textContent = '栏目关键字：';
            columnKeywordsHint.setAttribute('style',style_label);
            let columnKeywordsInput = document.createElement('input');
            columnKeywordsInput.setAttribute('type','text');
            columnKeywordsInput.setAttribute('name','columnKeywords');
            columnKeywordsInput.setAttribute('style',style_input_text);
            columnKeywordsBox.appendChild(columnKeywordsHint);
            columnKeywordsBox.appendChild(columnKeywordsInput);
            actionBox.appendChild(columnKeywordsBox);
            // 栏目容器
            let columnBox = document.createElement('div');
            // 栏目
            let columnHint = document.createElement('label');
            columnHint.setAttribute('style',style_label);
            columnHint.textContent = '栏目：';
            let columnInput = document.createElement('input');
            columnInput.setAttribute('type','text');
            columnInput.setAttribute('name','column');
            columnInput.setAttribute('style',style_input_text);
            columnBox.appendChild(columnHint);
            columnBox.appendChild(columnInput);
            actionBox.appendChild(columnBox);
            // 提交
            let columnKeywordsSaveButton = document.createElement('input');
            columnKeywordsSaveButton.setAttribute('type','button');
            columnKeywordsSaveButton.setAttribute('value','保存');
            columnKeywordsSaveButton.setAttribute('name','columnKeywordsColumnSave');
            columnKeywordsSaveButton.setAttribute('style',style_input_button);
            actionBox.appendChild(columnKeywordsSaveButton);
            // 分割
            let splitLine = document.createElement('hr');
            splitLine.setAttribute('style',style_hr);
            actionBox.appendChild(splitLine);
            // 正文关键字容器
            let mainBodyBox = document.createElement('div');
            // 正文关键字
            let mainBodyKeywordsHint = document.createElement('label');
            mainBodyKeywordsHint.setAttribute('style',style_label);
            mainBodyKeywordsHint.textContent = '正文关键字：';
            let mainBodyKeywordsInput = document.createElement('input');
            mainBodyKeywordsInput.setAttribute('type','text');
            mainBodyKeywordsInput.setAttribute('name','mainBodyKeywords');
            mainBodyKeywordsInput.setAttribute('style',style_input_text);
            mainBodyBox.appendChild(mainBodyKeywordsHint);
            mainBodyBox.appendChild(mainBodyKeywordsInput);
            actionBox.appendChild(mainBodyBox);
            // 提交
            let mainBodyKeywordsSaveButton = document.createElement('input');
            mainBodyKeywordsSaveButton.setAttribute('type','button');
            mainBodyKeywordsSaveButton.setAttribute('value','保存');
            mainBodyKeywordsSaveButton.setAttribute('name','mainBodyKeywordsSave');
            mainBodyKeywordsSaveButton.setAttribute('style',style_input_button);
            actionBox.appendChild(mainBodyKeywordsSaveButton);

            return actionBox;
        }
    }
    //数据库快捷辅助
    class DatabaseAuxiliary{
        constructor(DB){
            this.DB = DB;
            // 生成上下文菜单
            this.contextMenuView = new DataAddContextMenu();
            this.contextMenuView.setOnClickToAddColumnKeywordsColumn(e=>{
                this.contextMenuView.addColumnKeywordsColumnButtonStart();
                this.addColumnKeywords(this.contextMenuView.getColumnKeywordsValue(),this.contextMenuView.getColumnValue(),e=>{
                    //添加成功回调
                    console.log('columnKeywords-column添加成功')
                    this.contextMenuView.addColumnKeywordsColumnButtonEnd();
                },()=>{
                    // 保存失败回调
                    console.log('columnKeywords-column添加失败')
                    this.contextMenuView.addColumnKeywordsColumnButtonError();
                });

            });
            this.contextMenuView.setOnClickToAddMainBodyKeywords(e=>{
                this.addMainBodyFilterKeywords(this.contextMenuView.getMainBodyKeywordsValue());
            })
        }
        apply(windownsObj){
            // 添加上下文菜单到body
            windownsObj.document.body.appendChild(this.contextMenuView.getDataAddContextMenu());
            // 设置上下文菜单事件
            windownsObj.document.oncontextmenu = e=>{
                console.log('windows oncontext menu event invoke.')
                // 调用系统上下文菜单
                let selection = windownsObj.getSelection()
                if (selection.toString().length == 0) return true;
                // 调用自定义上下文菜单
                let x = e.pageX;
                let y = e.pageY;
                console.log('window pageXOffset='+windownsObj.pageXOffset)
                console.log('window pageYOffset='+windownsObj.pageYOffset)
                console.log('mouse pageX='+e.pageX)
                console.log('mouse pageY='+e.pageY)
                let text = selection.toString();
                console.log('text='+text+',x='+x+',y='+y);
                
                this.contextMenuView.addColumnKeywordsColumnButtonReset();
                this.contextMenuView.addMainBodyKeywordsButtonReset();

                this.contextMenuView.setPosition(x,y);
                this.contextMenuView.setValueToInputText(text);
                this.contextMenuView.setVisibility(true);

                return false;
            }
            // 设置鼠标取消上下文事件
            windownsObj.document.onmouseup = e=>{
                // 上下文菜单位置范围
                let node = this.contextMenuView.getDataAddContextMenu();
                let x1 = node.offsetLeft;
                let y1 = node.offsetTop;
                let x2 = x1 + node.offsetWidth;
                let y2 = y1 + node.offsetHeight;
                // 当前鼠标位置
                let mouseX = e.clientX;
                let mouseY = e.clientY;
                // 鼠标位置不在上下文菜单范围内则隐藏菜单
                if (mouseX < x1 || mouseX > x2 || mouseY < y1 || mouseY > y2){
                    console.log('hidden context menu.');
                    this.contextMenuView.setVisibility(false);
                }
            }
        }

        addColumnKeywords(keywords,column,successCallable,errorCallable){
            console.log('addColumnKeywords,keywords='+keywords+',column='+column);
            let CKDAO = new ColumnKeywordsDAO(this.DB);
            let columnDAO = new ColumnDAO(this.DB);
            let CKCDAO = new ColumnKeywordsColumnDAO(this.DB);
            new Promise((resolve,reject)=>{
                // 查询栏目关键字是否存在
                CKDAO.getColumnKeywordsForIndex(keywords,e=>{
                    let result = e.target.result;
                    if (result){
                        // 栏目关键字存在，直接返回
                        resolve(result);
                    }else{
                        // 栏目关键字不存在，添加后返回
                        CKDAO.addColumnKeywords(keywords,e=>{
                            let addResult = e.target.result;// 返回key
                            CKDAO.getColumnKeywordsForKey(addResult,e=>{
                                resolve(e.target.result);
                            });
                        })
                    }
                },e=>{
                    console.log('query column keywords for index fail.')
                    reject(e);
                });
            }).then(keywordsQueryResult=>{
                return new Promise((resolve,reject)=>{
                    let data = {
                        'columnKeywords':keywordsQueryResult,
                        'column':''
                    }
                    // 查询栏目是否存在
                    columnDAO.getColumnForIndex(column,e=>{
                        let result = e.target.result;
                        // 栏目存在，包装返回
                        if (result){
                            data.column = result;
                            resolve(data);
                        }else{
                            // 栏目不存在，添加后返回
                            columnDAO.addColumn(column,0,e=>{
                                let addResult = e.target.result;
                                columnDAO.getColumnForKey(addResult,e=>{
                                    data.column = e.target.result;
                                    resolve(data)
                                });
                            });
                        }
                    })
                })
            }).then(data=>{
                // 根据栏目关键字获取栏目关键字-栏目对照表对应信息
                CKCDAO.getAllColumnKeywordsColumnForIndex(data.columnKeywords.id,resultes=>{
                    // 判断对应信息是否已存在
                    let isExist = false;
                    for (let i = 0;i < resultes.length;i++){
                        if (resultes[i].column_id == data.column.id){
                            console.log('save fail:column keywords - column relation is exist.')
                            isExist = true;
                            break;
                        }
                    }
                    if (!isExist){
                        CKCDAO.addColumnKeywordsColumn(data.columnKeywords.id,data.column.id,successCallable)
                    }else{
                        if (errorCallable) errorCallable();
                    }
                })
            })
        }

        addMainBodyFilterKeywords(keywords){
            let mainBodyFilterKeywordsDAO = new MainBodyFilterKeywordsDAO(this.DB);
            mainBodyFilterKeywordsDAO.addMainBodyFilterKeywords(keywords,0,e=>{
                console.log('main body keywords save success.')
            });
        }

    }
    // --------------------------------start--------------------------------
    // 数据库连接
    new ArticleTypesettingAidDB(e=>{
        let DB = e.target.result;
        // 进行页面hook
        new ArticleTypesettingAidHook(node=>{
            start(DB,node);
        })
    },e=>{
        console.log('database connection fail.e='+e);
    });

    function start(DB,hookNode){
        // 实例化页面hook接口
        let articleChange = new ArticleChangeAPI(hookNode);
        // 主窗口
        articleChange.windownHook(windownNode=>{
            // 启用标题辅助

            // 启用栏目推荐辅助
            let columnAuxiliary = new ColumnAuxiliary(DB);
            articleChange.changeColumn((node)=>{
                columnAuxiliary.apply(windownNode,node);
            });

            // 启用数据库辅助
            let databaseAuxiliary = new DatabaseAuxiliary(DB);
            databaseAuxiliary.apply(windownNode);
            let columnNode = databaseAuxiliary.contextMenuView.getColumnNode();
            columnAuxiliary.apply(windownNode,columnNode);

            // 隐藏页面自带的上下文菜单
            let contextMenuNode = windownNode.document.querySelector('#edui_fixedlayer');
            if (contextMenuNode) contextMenuNode.style['top'] = 'auto';
        })
        // 正文窗口
        articleChange.mainBodyIframeWindowHook(mainBodyWindow=>{
            // 启用数据库辅助
            let databaseAuxiliary = new DatabaseAuxiliary(DB);
            databaseAuxiliary.apply(mainBodyWindow);
            let columnNode = databaseAuxiliary.contextMenuView.getColumnNode();
            // 启用栏目推荐辅助
            let columnAuxiliary = new ColumnAuxiliary(DB);
            columnAuxiliary.apply(mainBodyWindow,columnNode);
        });
        // 启用正文辅助
        let mainBodyFilterKeywordsDAO = new MainBodyFilterKeywordsDAO(DB);
        mainBodyFilterKeywordsDAO.getMainBodyFilterKeywordsAll(IDBKeyRange.lowerBound(0),event=>{
            let keywordsList = event.target.result;
            let mainBodyAuxiliary = new MainBodyAuxiliary();
            articleChange.changeMainBody(node=>{
                mainBodyAuxiliary.apply(node,keywordsList);
            });
        });
    }

    // 关键词正则匹配
    function keywordsRegularMatching(keywords,text){
        let pattern = new RegExp(keywords,'i');
        return pattern.test(text);
    }

    // 关键字过滤
    function keyStrFilter(text){
        console.log('keyStrFilter');
        let keyStr = ['参考','推荐','投稿','作文网','相关作文','推荐阅读','本篇','论文之家','作文标题','本作文',
                      '原创文章','为你们解答','来信请注明','请猛戳','个人简历','小编','点击','分享一些','快来看看',
                      '为你而选','相关作文',
                      '\.com','\\d{4}年','\\D\\d{4}\\D'];

        let result = {'result':false,'keyWord':''};
        for (let i = 0;i<keyStr.length;i++){
            let pattern = new RegExp(keyStr[i],'i');
            let patternResult = pattern.test(text);
            if (patternResult) {
                result.result = true;
                result.keyWord = keyStr[i];
                break;
            }
        }
        return result;
    }

    // 栏目识别
    function columnDistinguish(){
        console.log('columnDistinguish');
        let column = ['一年级作文','二年级作文','三年级作文','四年级作文','五年级作文','六年级作文','小学作文',
                      '初一作文','初二作文','初三作文','初中作文',
                      '高一作文','高二作文','高三作文','高中作文','高考英语作文',
                      '优秀作文',
                      '短句','书信','祝福语','评语','周记','观后感',
                      '写物作文','写人作文','写事作文','写景作文',
                      '个人简历','委托书','方案','培训计划',
                      '母亲节作文',
                      '','','','','','','','','','','','','','','','','','','','','','','','',];
    }

}
)();
