// 动态加载
class DynamicLoad{
    constructor(){
        this.jsLoadOnFinishListener = null;
    }

    __jsLoad(url){
        return new Promise((resolve,reject) => {
            let notificationInfo = {'url':url,'result':null,'failInformation':null};

            let headNode = document.getElementsByTagName('head')[0];
            let scriptNode = document.createElement('script');
            scriptNode.setAttribute('type','text/javascript');
            scriptNode.onload = (event) => {
                notificationInfo['result'] = 'success';
                resolve(notificationInfo);
            };
            scriptNode.onerror = (event) => {
                notificationInfo['result'] = 'fail';
                notificationInfo['failInformation'] = 'onerror';
                reject(notificationInfo);
            };
            scriptNode.onabort = () => {
                notificationInfo['result'] = 'fail';
                notificationInfo['failInformation'] = 'onabort';
                reject(notificationInfo);
            };
            scriptNode.setAttribute('src',url);
            headNode.appendChild(scriptNode);
        });
    }

    jsDynamicLoad(jsUrls){
        return new Promise((resolve,reject) => {
            // 加载数据初始化
            let loadTask = {'loadUrls':null,'taskList':null,'successTask':null,'failTask':null};
            if (Array.isArray(jsUrls)){
                if(jsUrls['loadUrls']){
                    // 失败任务重新加载
                    loadTask['taskList'] = [];
                    for (let i = 0;i < loadTask['failTask'];i++){
                        loadTask['taskList'].push(loadTask['failTask'][i]['url']);
                    }
                    loadTask['failTask'] = [];
                }else{
                    // 多个新任务全部加载
                    loadTask['loadUrls'] = jsUrls;
                    loadTask['taskList'] = loadTask['loadUrls'];
                    loadTask['successTask'] = [];
                    loadTask['failTask'] = [];
                }
            }else{
                // 单个新任务加载
                loadTask['loadUrls'] = [jsUrls];
                loadTask['taskList'] = loadTask['loadUrls'];
                loadTask['successTask'] = [];
                loadTask['failTask'] = [];
            }
            let notificationInfo = {'allTask':loadTask['taskList'].length,
                                    'nowTask':0,
                                    'successTask':0,
                                    'failTask':0,
                                    'result':null
            };
            // 开始加载
            for (let i = 0;i < notificationInfo['allTask'];i++){
                this.__jsLoad(loadTask['taskList'][i]).then((loadInfo) => {
                    // js加载成功
                    loadTask['successTask'].push(loadInfo);
                    notificationInfo['successTask'] += 1;
                    notificationInfo['result'] = loadInfo;
                }).catch((loadInfo) => {
                    // js加载失败
                    loadTask['failTask'].push(loadInfo)
                    notificationInfo['failTask'] += 1;
                    notificationInfo['result'] = loadInfo;
                }).finally(() => {
                    // js加载任务完成
                    notificationInfo['nowTask'] += 1;
                    // 通知js加载完成监听器
                    if (this.jsLoadOnFinishListener){
                        this.jsLoadOnFinishListener(notificationInfo);
                    }
                    // 所有任务完成
                    if (notificationInfo['nowTask'] == notificationInfo['allTask']){
                        if (notificationInfo['failTask'] == 0){
                            resolve(loadTask);
                        }else{
                            reject(loadTask);
                        }
                    }
                });
            }
        });
    }

    addJsLoadOnFinishListener(listener){
        this.jsLoadOnFinishListener = listener;
        return this;
    }
    
}

// AJAX GET方法下载文件到内存
function getFileForUrl(url,responseType,header){
    return new Promise((resolve, reject) => {
        let xhr = new XMLHttpRequest();
        xhr.onreadystatechange = () => {
            if (xhr.readyState === XMLHttpRequest.DONE) {
              if (xhr.status === 200) {
                  resolve(xhr.response);
              } else {
                  reject(xhr.status);
              }
            }
        }
        xhr.open('get',url,true);
        if (header){
            xhr.setRequestHeader(header);
        }
        if (responseType){
            xhr.responseType = responseType;
        }
        xhr.send();
    });
}

// 漫画信息解析
class MangaAnalysis{
    constructor(mangaInfoPage){
        this.mangaInfoPage = mangaInfoPage;
    }

    // 解析漫画编号
    mangaNumberAnalysis(){
        let patternMangeNumber = /\d+/;
        return window.location.pathname.match(patternMangeNumber).toString();
    }

    // 解析漫画标题
    mangaTitleAnalysis(){
        let patternTitle = /(?<=<h1>).*(?=<\/h1>)/;
        return this.mangaInfoPage.match(patternTitle).toString();
    }

    // 解析漫画简介
    mangaDetailsAnalysis(){
        /*
        * return 如果提取到简介会返回一个字符串，否则返回null
        */
        let patternDivBlock = /(?<=intro-block">)(.|\s)*?<\/div>/g;
        let divBlockResult = this.mangaInfoPage.match(patternDivBlock);
        // 提取简介
        let details = null;
        if (divBlockResult){
            let patternDetails = /(?<=>)(.|\s)*?(?=<\/div>)/g;
            details = divBlockResult.toString().match(patternDetails);
            if(details){
                details = details.toString();
            }
        }
        return details.trim();
    }

    // 解析漫画章节标题
    mangaChapterTitlesAnalysis(){
        /*
        * return 如果提取到标题会返回一个数组，否则返回null
        */
        // 提取相关信息块
        let patternDivBlock = /download-block(.|\s)*?<\/div>/g;
        let divBlockResult = this.mangaInfoPage.match(patternDivBlock);
        // 提取标题
        let titles = null;
        if (divBlockResult){
            let patternTitle = /(?<=<li>\s)(.|\s)*?(?=<i)/g;
            titles = divBlockResult.toString().match(patternTitle);
        }

        return titles;
    }
    // 解析漫画章节链接
    mangaChapterLinkAnalysis(){
        // 提取相关信息块
        let patternUlBlock = /<ul class="btn-toolbar(.|\s)*?<\/ul>/i;
        let ulBlockResult = this.mangaInfoPage.match(patternUlBlock);
        let patternLink,linkResult;
        if (ulBlockResult){
            // 相关信息块存在，该漫画为多章漫画，多章提取链接
            patternLink = /(?<=\<a href=").*?(?=\">)/g;
            linkResult = ulBlockResult[0].match(patternLink);
        }else{
            // 相关信息块为空，该漫画为单章漫画
            patternLink = /(?<=\<a href=")\/photo\/.*?(?=\">)/g;
            linkResult = this.mangaInfoPage.match(patternLink);
            // 删除重复项
            linkResult.pop();
        }
        let links = [];
        let baseUrl = window.location.protocol + '//' + window.location.host;
        for (let i = 0;i < linkResult.length;i++){
            links.push(baseUrl + linkResult[i]);
        }

        return links;
    }

    // 解析漫画章节图片链接
    mangaChapterImageLinkAnalysis(chapterImagePage){
        let patternLink = /(?<=data-original=").*?(?=" id=)/g;
        let links = chapterImagePage.match(patternLink);
        return links;
    }

    // 漫画图片名称生成
    generateImageName(imageLinks){
        let result = [];
        for (let i = 0;i < imageLinks.length;i++){
            // 提取图片格式
            let imageType = imageLinks[i].split('?')[0].split('.').pop();
            // 名称生成
            let name = i.toString().padStart(5,'0') + '.' + imageType;
            result.push({'name':name,'link':imageLinks[i]});
        }
        return result;
    }

}

// 漫画信息生成
class MangaInfoGeneration{
    constructor(mangaAnalysis,identification){
        this.mangaInfoGeneration = null;
        this.mangaAnalysis = mangaAnalysis;
        this.mangaInfo = {
            'identification':identification,
            'number':null,
            'title':null,
            'details':null,
            'link':window.location.href,
            'chapter':[]
        };
        // 设置漫画编号
        let number = mangaAnalysis.mangaNumberAnalysis();
        this.mangaInfo['number'] = number;
        // 设置漫画标题
        let title = mangaAnalysis.mangaTitleAnalysis();
        this.mangaInfo['title'] = title;
        // 设置漫画简介
        let details = mangaAnalysis.mangaDetailsAnalysis();
        this.mangaInfo['details'] = details;
        // 设置漫画章节标题、章节链接
        let chapterTitles = mangaAnalysis.mangaChapterTitlesAnalysis();
        let chapterLinks = mangaAnalysis.mangaChapterLinkAnalysis();
        for (let i = 0;i < chapterLinks.length;i++){
            // 绑定章节链接
            let chapter = {
                'title':null,
                'link':chapterLinks[i],
                'images':null
            }
            // 绑定章节标题
            if (chapterTitles){
                chapter['title'] = chapterTitles[i].trim();
            }else{
                if (chapterLinks.length == 1){
                    chapter['title'] = number;
                }else{
                    chapter['title'] = '第' + (i + 1) + '章';
                }
            }
            this.mangaInfo['chapter'].push(chapter);
        }
    }

    // 获取漫画章节图片链接
    __getChapterImageLinks(chapterPosition,chapter){
        return new Promise((resolve,reject) => {
            // 数据初始化
            let chapterInfo = {'chapterPosition':chapterPosition,'chapter':chapter};
            // 开始获取
            getFileForUrl(chapterInfo['chapter']['link']).then((chapterImagePage) => {
                // 保存链接
                let images = this.mangaAnalysis.mangaChapterImageLinkAnalysis(chapterImagePage);
                chapterInfo['chapter']['images'] = this.mangaAnalysis.generateImageName(images);
                resolve(chapterInfo);
            }).catch((err) => {
                reject(chapterInfo);
            });
        });
    }

    // 漫画信息生成
    generationMangaInfo(){
        return new Promise((resolve,reject) => {
            let notificationInfo = {
                'allTask':this.mangaInfo['chapter'].length,
                'nowTask':0,
                'successTask':0,
                'failTask':0,
                'result':0
            };
            for (let i = 0;i < notificationInfo['allTask'];i++){
                this.__getChapterImageLinks(i,this.mangaInfo['chapter'][i]).then((chapterInfo) => {
                    notificationInfo['successTask'] += 1;
                    notificationInfo['result'] = chapterInfo;
                }).catch((chapterInfo) => {
                    notificationInfo['failTask'] += 1;
                    notificationInfo['result'] = chapterInfo;
                }).finally(() => {
                    notificationInfo['nowTask'] += 1;
                    // 通知图片链接保存完成监听器
                    if (this.mangaInfoGeneration){
                        this.mangaInfoGeneration(notificationInfo);
                    }
                    // 所有任务完成
                    if (notificationInfo['nowTask'] == notificationInfo['allTask']){
                        notificationInfo['result'] = this.mangaInfo;
                        if (notificationInfo['failTask'] == 0){
                            resolve(notificationInfo);
                        }else{
                            reject(notificationInfo)
                        }
                    }
                })
            }
        });
    }

    addMangaInfoGenerationListener(listener){
        this.mangaInfoGeneration = listener;
        return this;
    }

    // 漫画信息保存
    saveMangaInformation(){
        let saveBlob = new Blob([JSON.stringify(this.mangaInfo)],{type: "text/json;charset=utf-8"});
        saveAs(saveBlob,this.mangaInfo['number'] + '.json');
    }

}

// 操作视图
class MangaInfoActionView{
    constructor(){
        this.__actionViewGenerate();
    }

    // 添加上传按钮到页面
    __actionViewGenerate(){
        // 移除旧节点
        let oldNode = document.querySelector('#hookNode');
        if (oldNode){
            document.body.removeChild(oldNode);
        }
        // 创建挂载节点
        let showBox = document.createElement('div');
        showBox.setAttribute('id','hookNode');
        showBox.setAttribute('style','position:fixed;\
                bottom:30%;\
                right:0;\
                background-color:#fff;\
                box-shadow:0 1px 2px 0 rgba(60,64,67,.3), 0 1px 3px 1px rgba(60,64,67,.15);\
                z-index:200;\
                padding:16px;'
        );
        document.body.appendChild(showBox);
        // 漫画解析按钮
        let analysisButton = document.createElement('input');
        analysisButton.setAttribute('id','analysisButton');
        analysisButton.setAttribute('type','button');
        analysisButton.setAttribute('name','analysisButton');
        analysisButton.setAttribute('value','解析');
        analysisButton.setAttribute('style','display: block;\
                font-size:1em;'
        );
        showBox.appendChild(analysisButton);
        // 跳转按钮
        let jumpButton = document.createElement('input');
        jumpButton.setAttribute('id','jumpButton');
        jumpButton.setAttribute('type','button');
        jumpButton.setAttribute('name','jumpButton');
        jumpButton.setAttribute('value','去下载 >>>');
        jumpButton.setAttribute('style','display: block;\
                margin: 16px 0 0 0;\
                font-size:1em;'
        );
        showBox.appendChild(jumpButton);
    }

    // 添加解析按钮点击事件
    addAnalysisButtonOnClickListener(listener){
        let analysisButton = document.querySelector('#analysisButton');
        if (analysisButton && listener){
            analysisButton.addEventListener('click',listener);
        }
        return this;
    }

    // 添加跳转按钮点击事件
    addJumpButtonOnClickListener(listener){
        let jumpButton = document.querySelector('#jumpButton');
        if (jumpButton && listener){
            jumpButton.addEventListener('click',listener);
        }
        return this;
    }

}

// 保存漫画信息
function saveMangaInformationToJson(){
    let identification = '18comic';
    let fileSaverUrl = 'https://cdn.bootcdn.net/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js';
    let dynamicLoad = new DynamicLoad();
    let mangaAnalysis;
    let mangaInfoGeneration;
    // 加载依赖脚本
    dynamicLoad.jsDynamicLoad(fileSaverUrl).then(() => {
        // 脚本加载完成
        console.log('load script finish.');
        // 获取当前页面文本
        return getFileForUrl(document.URL);
    }).then((mangaInfoPage) => {
        // 文本获取成功
        mangaAnalysis = new MangaAnalysis(mangaInfoPage);
        mangaInfoGeneration = new MangaInfoGeneration(mangaAnalysis,identification);
        // 漫画信息生成
        return mangaInfoGeneration.generationMangaInfo();
    }).then(() => {
        // 漫画信息生成成功
        mangaInfoGeneration.saveMangaInformation();
    });
}

// 页面识别
function pageDistinguish(){
    let patternUrl = /(http|https):\/\/18comic.(vip|org)\/album\/\d+/g;
    return window.location.href.search(patternUrl) > -1;
}

//脚本是否执行判断
function scriptExecuteJudge(){
    let key = encodeURIComponent('5%6#jdIfeQP94@h^');
    if (window[key]) {
        return true;
    };
    window[key] = true;

    return false;
}

// ---------------- script start ---------------- //
(() => {
    if (scriptExecuteJudge()){
        console.log('script is running.');
        // 脚本已经执行过，直接返回
        return;
    }
    // 脚本第一次执行
    // 判断页面是否符合要求
    if (!pageDistinguish()){
        console.log('This page is no distinguish.');
        // 不符合要求，直接返回
        return;
    }
    // 页面符合要求
    let actionView = new MangaInfoActionView();
    actionView.addAnalysisButtonOnClickListener(() => {
        saveMangaInformationToJson();
    }).addJumpButtonOnClickListener(() => {
        window.location.href = document.querySelector('img[itemprop=image]').src;
    });
})();

