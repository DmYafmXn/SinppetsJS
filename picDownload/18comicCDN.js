// ==UserScript==
// @name         mangaDownload18comic
// @namespace    https://gitee.com/centesimal/sinppets-js/tree/main/picDownload
// @version      0.1
// @author       centesimal
// @description  download manga for 18comic.
// @icon         https://18comic.org/favicon.ico
// @updateURL    https://gitee.com/centesimal/sinppets-js/raw/main/picDownload/18comicCDN.js
// @downloadURL  https://gitee.com/centesimal/sinppets-js/raw/main/picDownload/18comicCDN.js
// @supportURL   https://gitee.com/centesimal/sinppets-js
// @match        *://cdn-msp.18comic.(vip|org)/*
// @run-at       document-idle
// @grant        none
// ==/UserScript==

// 动态加载js库
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

// 从文件中读取漫画信息
function readMangaInformationForFile(mangaJsonFile){
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onload = (event) => {
            let mangaInfoText = event.target.result;
            resolve(JSON.parse(mangaInfoText));
        }
        fileReader.onabort = () => {
            reject('file read abort.')
        }
        fileReader.onerror = (event) => {
            reject(event.target.error);
        }
        fileReader.readAsText(mangaJsonFile);
    });
}

// 漫画下载类
class MangaDownloadFor18Comic{
    constructor(){
        this.downloadImageOnFinish = null;
        this.downloadChapterOnFinish = null;
        this.saveImageOnFinish = null;
        this.saveChapterOnFinish = null;
        this.imageRestoreOnFinish = null;
        this.chapterRestoreOnFinish = null;
    }

    // 漫画图片下载
    __downloadImage(imageInfo,restore){
        return new Promise((resolve, reject) => {
            let imageDownloadInfo;
            if (restore){
                imageDownloadInfo = imageInfo;
            }else{
                imageDownloadInfo = {'imageInfo':imageInfo,'statusCode':null,'blob':null};
            }
            getFileForUrl(imageDownloadInfo['imageInfo']['link'],'blob').then((blob) => {
                imageDownloadInfo['statusCode'] = 200;
                imageDownloadInfo['blob'] = blob;
                resolve(imageDownloadInfo);
            }).catch((error) => {
                imageDownloadInfo['statusCode'] = error;
                reject(imageDownloadInfo);
            });
        });
    }

    // 漫画章节下载
    __downloadChapter(chapterInfo,restore){
        return new Promise((resolve,reject) => {
            // 下载数据初始化
            let chapterDownloadInfo;
            let downloadList;
            if (restore){
                // 恢复下载失败列表
                chapterDownloadInfo = chapterInfo;
                downloadList = [];
                for (let i = 0;i < chapterDownloadInfo['downloadFail'].length;i++){
                    downloadList.push(chapterDownloadInfo['downloadFail'][i]);
                }
                chapterDownloadInfo['downloadFail'] = [];
            }else{
                restore = false;
                chapterDownloadInfo = {'chapterInfo':chapterInfo,'downloadSuccess':[],'downloadFail':[]};
                downloadList = chapterInfo['images'];
            }
            // 开始下载
            let notificationInfo = {'allTask':downloadList.length,'nowTask':0,'successTask':0,'failTask':0,'result':0};
            for (let i = 0;i < notificationInfo['allTask'];i++){
                this.__downloadImage(downloadList[i],restore).then((downloadInfo) => {
                    // 图片下载完成
                    chapterDownloadInfo['downloadSuccess'].push(downloadInfo);
                    notificationInfo['successTask'] += 1;
                    notificationInfo['result'] = downloadInfo;
                }).catch((downloadInfo) => {
                    // 图片下载失败
                    chapterDownloadInfo['downloadFail'].push(downloadInfo);
                    notificationInfo['failTask'] += 1;
                    notificationInfo['result'] = downloadInfo;
                }).finally(() => {
                    // 下载任务完成
                    notificationInfo['nowTask'] += 1;
                    // 通知图片下载完成监听器
                    if (this.downloadImageOnFinish){
                        this.downloadImageOnFinish(notificationInfo);
                    }
                    // 所有任务完成
                    if (notificationInfo['nowTask'] == notificationInfo['allTask']){
                        if (notificationInfo['failTask'] == 0){
                            resolve(chapterDownloadInfo);
                        }else{
                            reject(chapterDownloadInfo);
                        }
                    }
                })
            }
        });
    }

    addDownloadImageOnFinishListener(listener){
        this.downloadImageOnFinish = listener;
        return this;
    }

    // 漫画下载
    downloadManga(mangaInfo,restore){
        return new Promise((resolve,reject) => {
            // 下载数据初始化
            let mangaDownloadInfo;
            let downloadList;
            if (restore){
                // 恢复下载失败列表
                mangaDownloadInfo = mangaInfo;
                downloadList = [];
                for (let i = 0;i < mangaDownloadInfo['downloadFail'].length;i++){
                    downloadList.push(mangaDownloadInfo['downloadFail'][i]);
                }
                mangaDownloadInfo['downloadFail'] = [];
            }else{
                restore = false;
                mangaDownloadInfo = {'mangaInfo':mangaInfo,'downloadSuccess':[],'downloadFail':[]};
                downloadList = mangaDownloadInfo['mangaInfo']['chapter'];
            }
            // 开始下载
            let notificationInfo = {'allTask':downloadList.length,'nowTask':0,'successTask':0,'failTask':0,'result':0};
            for (let i = 0;i < notificationInfo['allTask'];i++){
                this.__downloadChapter(downloadList[i],restore).then((chapterDownloadInfo) => {
                    // 章节下载完成
                    mangaDownloadInfo['downloadSuccess'].push(chapterDownloadInfo);
                    notificationInfo['successTask'] += 1;
                    notificationInfo['result'] = chapterDownloadInfo;
                }).catch((chapterDownloadInfo) => {
                    // 章节下载失败
                    mangaDownloadInfo['downloadFail'].push(chapterDownloadInfo);
                    notificationInfo['failTask'] += 1;
                    notificationInfo['result'] = chapterDownloadInfo;
                }).finally(() => {
                    // 下载任务完成
                    notificationInfo['nowTask'] += 1;
                    // 通知章节下载完成监听器
                    if (this.downloadChapterOnFinish){
                        this.downloadChapterOnFinish(notificationInfo);
                    }
                    // 所有任务完成
                    if (notificationInfo['nowTask'] == notificationInfo['allTask']){
                        if (notificationInfo['failTask'] == 0){
                            resolve(mangaDownloadInfo);
                        }else{
                            reject(mangaDownloadInfo);
                        }
                    }
                })
            }
        });
    }
    
    addDownloadChapterOnFinishListener(listener){
        this.downloadChapterOnFinish = listener;
        return this;
    }

    // 漫画章节保存
    __saveChapter(chapterDownloadInfo,chapterDetails,identification){
        return new Promise((resolve,reject) => {
            let zip = new JSZip();
            // 保存章节详情
            zip.file('.details.txt',chapterDetails);
            // 保存章节图片
            let notificationInfo = {
                'allTask':chapterDownloadInfo['downloadSuccess'].length,
                'nowTask':0,
                'successTask':0,
                'failTask':0,
                'result':0
            };
            for (let i = 0;i < notificationInfo['allTask'];i++){
                let imageName = chapterDownloadInfo['downloadSuccess'][i]['imageInfo']['name'];
                let imageBlob = chapterDownloadInfo['downloadSuccess'][i]['blob'];
                zip.file(identification + '_' + imageName,imageBlob);
                // 通知图片压缩完成监听器
                notificationInfo['nowTask'] += 1;
                notificationInfo['successTask'] += 1;
                notificationInfo['result'] = chapterDownloadInfo['downloadSuccess'][i];
                if (this.saveImageOnFinish){
                    this.saveImageOnFinish(notificationInfo);
                }
            }
            zip.generateAsync({type:'blob'}).then((zipFile) => {
                saveAs(zipFile, chapterDownloadInfo['chapterInfo']['title'] + '.zip');
                // 所有任务完成
                resolve(chapterDownloadInfo);
            });
        });
    }

    addSaveImageOnFinishListener(listener){
        this.saveImageOnFinish = listener;
        return this;
    }

    // 漫画保存
    saveManga(mangaDownloadInfo){
        return new Promise((resolve,reject) => {
            let notificationInfo = {
                'allTask':mangaDownloadInfo['downloadSuccess'].length,
                'nowTask':0,
                'successTask':0,
                'failTask':0,
                'result':0
            };
            for (let i = 0;i < notificationInfo['allTask'];i++){
                // 章节详情
                let chapterDetails = 'number：' + mangaDownloadInfo['mangaInfo']['number'] + '\n' + 
                                        'title：' + mangaDownloadInfo['mangaInfo']['title'] + '\n' + 
                                        'link：' + mangaDownloadInfo['mangaInfo']['link'] + '\n' + '\n' + 
                                        'chapterTitle：' + mangaDownloadInfo['mangaInfo']['chapter'][i]['title'] + '\n' + 
                                        'chapterLink：' + mangaDownloadInfo['mangaInfo']['chapter'][i]['link'] + '\n' + 
                                        'details：' + mangaDownloadInfo['mangaInfo']['details'];
                this.__saveChapter(
                    mangaDownloadInfo['downloadSuccess'][i],
                    chapterDetails,
                    mangaDownloadInfo['mangaInfo']['identification']).then((chapterDownloadInfo) => {
                    // 章节图片压缩成功
                    notificationInfo['successTask'] += 1;
                    notificationInfo['result'] = chapterDownloadInfo;
                }).catch((chapterDownloadInfo) => {
                    // 章节图片压缩失败
                    notificationInfo['failTask'] += 1;
                    notificationInfo['result'] = chapterDownloadInfo;
                }).finally(() => {
                    // 下载任务完成
                    notificationInfo['nowTask'] += 1;
                    // 通知章节压缩完成监听器
                    if (this.saveChapterOnFinish){
                        this.saveChapterOnFinish(notificationInfo);
                    }
                    // 所有任务完成
                    if (notificationInfo['nowTask'] == notificationInfo['allTask']){
                        if (notificationInfo['failTask'] == 0){
                            resolve();
                        }else{
                            reject();
                        }
                    }
                });
            }
        });
    }

    addSaveChapterOnFinishListener(listener){
        this.saveChapterOnFinish = listener;
        return this;
    }

    // 漫画图片还原
    __imageRestore(mangaNumber,imageDownloadInfo){
        return new Promise((resolve, reject) => {
            let imageLink = imageDownloadInfo['imageInfo']['link'];
            let imageNumber = imageLink.split('?')[0].split('/').pop().split('.')[0];
            let imageBlob = imageDownloadInfo['blob'];
            // 漫画编号小于220980的图片不需要还原
            if (mangaNumber < 220980){
                resolve(imageDownloadInfo);
                return;
            }
            // 图片分割数量
            let splitNum = 10;
            if (mangaNumber >= 268850){
                let mangaInfo = mangaNumber + '' + imageNumber;
                let mangaInfoMD5 = md5(mangaInfo);
                let endStr = mangaInfoMD5.substr(-1);
                let endStrUnicode = endStr.charCodeAt();
                splitNum = 2 + 2 * (endStrUnicode % 10);
            }
            // 将图片加载到img节点上
            let imageNode = new Image();   // 创建img元素
            let url = URL.createObjectURL(imageBlob);
            imageNode.onload = function(){
                // 回收内存
                URL.revokeObjectURL(url);
                // 还原图片
                let canvas = document.createElement('canvas');
                // 设置canvas大小
                canvas.width = imageNode.naturalWidth;
                canvas.height = imageNode.naturalHeight;
                if (canvas.getContext){
                    let canvas2D = canvas.getContext('2d');
                    for (let i = 0;i < splitNum;i++){
                        let randomNum = parseInt(canvas.height % splitNum);
                        let splitHeight = Math.floor(canvas.height / splitNum);
                        let sourceY = canvas.height - splitHeight * (i + 1) - randomNum;
                        let newY = splitHeight * i;
                        if (0 === i){
                            splitHeight += randomNum;
                        }else{
                            newY += randomNum;
                        }
                        canvas2D.drawImage(imageNode,
                                            0,sourceY,canvas.width,splitHeight,
                                            0,newY,canvas.width,splitHeight
                        );
                    }
                    let imageType = imageDownloadInfo['imageInfo']['name'].split('.').pop();
                    if (imageType == 'jpg'){
                        imageType = 'jpeg';
                    }
                    canvas.toBlob(function(blob){
                        imageDownloadInfo['blob'] = blob;
                        resolve(imageDownloadInfo);
                    },'image/' + imageType);
                }
            }
            imageNode.src = url;
        });
    }

    // 漫画章节还原
    __chapterRestore(mangaNumber,chapterDownloadInfo){
        return new Promise((resolve,reject) => {
            let notificationInfo = {
                'allTask':chapterDownloadInfo['downloadSuccess'].length,
                'nowTask':0,
                'successTask':0,
                'failTask':0,
                'result':0
            };
            for (let i = 0;i < notificationInfo['allTask'];i++){
                this.__imageRestore(mangaNumber,chapterDownloadInfo['downloadSuccess'][i]).then((imageRestoreInfo) => {
                    notificationInfo['successTask'] += 1;
                    notificationInfo['result'] = imageRestoreInfo;
                }).catch((imageRestoreInfo) => {
                    // 章节图片压缩失败
                    notificationInfo['failTask'] += 1;
                    notificationInfo['result'] = imageRestoreInfo;
                }).finally(() => {
                    // 下载任务完成
                    notificationInfo['nowTask'] += 1;
                    // 通知图片还原完成监听器
                    if (this.imageRestoreOnFinish){
                        this.imageRestoreOnFinish(notificationInfo);
                    }
                    // 所有任务完成
                    if (notificationInfo['nowTask'] == notificationInfo['allTask']){
                        if (notificationInfo['failTask'] == 0){
                            resolve();
                        }else{
                            reject();
                        }
                    }
                });
            }
        });
    }
    
    addImageRestoreOnFinishListener(listener){
        this.imageRestoreOnFinish = listener;
        return this;
    }

    // 漫画还原
    mangaImageRetore(mangaDownloadInfo){
        return new Promise((resolve,reject) => {
            let notificationInfo = {
                'allTask':mangaDownloadInfo['downloadSuccess'].length,
                'nowTask':0,
                'successTask':0,
                'failTask':0,
                'result':0
            };
            for (let i = 0;i < notificationInfo['allTask'];i++){
                let mangaNumber = parseInt(mangaDownloadInfo['mangaInfo']['chapter'][i]['link'].split('/')[4]);
                this.__chapterRestore(mangaNumber,mangaDownloadInfo['downloadSuccess'][i])
                    .then((restoreChapterDownloadInfo) => {
                    // 通知章节还原完成监听器
                    notificationInfo['successTask'] += 1;
                    notificationInfo['result'] = restoreChapterDownloadInfo;
                }).catch((restoreChapterDownloadInfo) => {
                    // 章节图片压缩失败
                    notificationInfo['failTask'] += 1;
                    notificationInfo['result'] = restoreChapterDownloadInfo;
                }).finally(() => {
                    // 下载任务完成
                    notificationInfo['nowTask'] += 1;
                    // 通知章节还原完成监听器
                    if (this.chapterRestoreOnFinish){
                        this.chapterRestoreOnFinish(notificationInfo);
                    }
                    // 所有任务完成
                    if (notificationInfo['nowTask'] == notificationInfo['allTask']){
                        if (notificationInfo['failTask'] == 0){
                            resolve();
                        }else{
                            reject();
                        }
                    }
                });
            }
        });
    }
    
    addChapterRestoreOnFinishListener(listener){
        this.chapterRestoreOnFinish = listener;
        return this;
    }

}

// 操作视图
class ImageInformationUpView{
    constructor(){
        this.actionView = this.__upViewGenerate();
        this.chapterProgress = new HorizontalProgress();
        this.imageProgress = new HorizontalProgress();

        this.actionView.appendChild(this.chapterProgress.getProgressView());
        this.actionView.appendChild(this.imageProgress.getProgressView());
    }

    // 添加上传按钮到页面
    __upViewGenerate(){
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
        // 上传文件按钮
        let upButton = document.createElement('input');
        upButton.setAttribute('id','imageInfoFile');
        upButton.setAttribute('type','file');
        upButton.setAttribute('name','imageInfoFile');
        upButton.setAttribute('accept','text/json')
        showBox.appendChild(upButton);
        // 确定按钮
        let okButton = document.createElement('input');
        okButton.setAttribute('id','imageInfoOk');
        okButton.setAttribute('type','button');
        okButton.setAttribute('name','imageInfoOk');
        okButton.setAttribute('value','确定')
        okButton.setAttribute('style','display: block;\
                width:100%;\
                margin:16px 0 0 0;\
                padding:4px 0;\
                font-size:1.5em;'
        );
        showBox.appendChild(okButton);
        // 当前任务标题
        let taskTitle = document.createElement('h3');
        taskTitle.setAttribute('id','taskTitle');
        showBox.appendChild(taskTitle);
        
        return showBox;
    }

    // 设置任务标题
    setTaskTitle(title){
        let taskNode = document.querySelector('#taskTitle');
        if (title && taskNode){
            taskNode.innerHTML = title;
        }
        return this;
    }

    // 获取文件选择按钮
    getUpFileButton(){
        return document.querySelector('#imageInfoFile');
    }
    // 获取确定按钮
    getOkButton(){
        return document.querySelector('#imageInfoOk');
    }

    // 获取章节进度视图
    getChapterProgressView(){
        return this.chapterProgress;
    }

    // 获取图片进度视图
    getImageProgressView(){
        return this.imageProgress;
    }
}

// 进度条视图
class HorizontalProgress{
    constructor(){
        this.progressBox = this.__progressBoxGenerate();
        this.slider = this.__sliderGenerate();
        this.progressTitle = this.__progressTitleGenerate();
        this.progressText = this.__progressTextGenerate();

        this.progressBox.appendChild(this.slider);
        this.progressBox.appendChild(this.progressTitle);
        this.progressBox.appendChild(this.progressText);
    }

    getProgressView(){
        return this.progressBox;
    }

    // 进度挂载点
    __progressBoxGenerate(){
        let progressBox = document.createElement('div');
        progressBox.setAttribute('style','width: 100%;\
                                            position: relative;\
                                            margin: 8px 0;\
                                            display: flex;\
                                            justify-content: space-between;\
                                            overflow: hidden;\
                                            height: 24px;\
                                            font-size: .5em;\
                                            background-color: #eee;'
        );
        return progressBox;
    }

    // 进度条滑块
    __sliderGenerate(){
        let slider = document.createElement('div');
        slider.setAttribute('style','width: 0.00%;\
                                                height: 100%;\
                                                z-index: 100;\
                                                position: absolute;\
                                                background-color: #03a9f4;'
        );
        return slider;
    }

    // 进度条标题
    __progressTitleGenerate(){
        let progressTitle = document.createElement('span');
        progressTitle.setAttribute('style','padding: 0 8px;\
                                            height: 100%;\
                                            z-index: 200;\
                                            display: flex;\
                                            align-items: center;\
                                            background-color: rgba(0,0,0,.2);\
                                            color: #f0f0f0;'
        );
        return progressTitle;
    }

    // 进度文本
    __progressTextGenerate(){
        let progressText = document.createElement('span');
        progressText.setAttribute('style','padding: 0 8px;\
                                            height: 100%;\
                                            z-index: 200;\
                                            display: flex;\
                                            align-items: center;\
                                            color: #000;'
        );
        progressText.innerHTML = '0.00%';
        return progressText;
    }

    // 设置标题
    setTitle(title){
        this.progressTitle.innerHTML = title;
    }

    // 设置进度
    setProgress(nowProgress,allProgress){
        let onePercent = (allProgress / 100).toFixed(2);
        let percentage = (nowProgress / onePercent).toFixed(2) + '%';

        this.slider.style['width'] = percentage;
        this.progressText.innerHTML = percentage;
    }
}

// 添加全局样式
function addGlobalStyle(css) {
	let head = document.getElementsByTagName('head')[0];
	if (!head) { return; }
	let style = document.createElement('style');
	style.type = 'text/css';
	style.innerHTML = css;
	head.appendChild(style);
}

// 保存漫画
function mangaSave(file,progressListenerFn){
    let notificationInfo = {
                'taskName':'',
                'taskLevel':0,
                'taskProgress':null
    };
    let jsZipUrl = 'https://cdn.bootcdn.net/ajax/libs/jszip/3.6.0/jszip.min.js';
    let fileSaverUrl = 'https://cdn.bootcdn.net/ajax/libs/FileSaver.js/2.0.5/FileSaver.min.js';
    let md5Url = 'https://cdn.bootcdn.net/ajax/libs/blueimp-md5/2.18.0/js/md5.min.js';
    let dynamicLoad = new DynamicLoad();
    let comic18 = new MangaDownloadFor18Comic();
    let downloadInfo;
    // 设置通知
    comic18.addDownloadImageOnFinishListener((data) => {
        // 漫画下载通知
        notificationInfo['taskName'] = '漫画下载';
        notificationInfo['taskLevel'] = 0;
        notificationInfo['taskProgress'] = data;

        if (progressListenerFn){
            progressListenerFn(notificationInfo);
        }
    }).addDownloadChapterOnFinishListener((data) => {
        // 漫画章节下载通知
        notificationInfo['taskName'] = '漫画下载';
        notificationInfo['taskLevel'] = 1;
        notificationInfo['taskProgress'] = data;

        if (progressListenerFn){
            progressListenerFn(notificationInfo);
        }
        
    }).addImageRestoreOnFinishListener((data) => {
        // 漫画恢复通知
        notificationInfo['taskName'] = '漫画恢复';
        notificationInfo['taskLevel'] = 0;
        notificationInfo['taskProgress'] = data;

        if (progressListenerFn){
            progressListenerFn(notificationInfo);
        }
        
    }).addChapterRestoreOnFinishListener((data) => {
        // 漫画章节恢复通知
        notificationInfo['taskName'] = '漫画恢复';
        notificationInfo['taskLevel'] = 1;
        notificationInfo['taskProgress'] = data;

        if (progressListenerFn){
            progressListenerFn(notificationInfo);
        }
        
    });
    // 加载依赖脚本
    dynamicLoad.jsDynamicLoad([jsZipUrl,fileSaverUrl,md5Url]).then((loadInfo) => {
        // 脚本加载完成
        console.log('load script finish.');
        // 从文件中读取漫画信息
        return readMangaInformationForFile(file);
    }).then((mangaInfoJson) => {
        // 读取完成
        console.log(mangaInfoJson);
        // 漫画下载
        return comic18.downloadManga(mangaInfoJson,false);
    }).then((mangaDownloadInfo) => {
        // 下载完成
        downloadInfo = mangaDownloadInfo;
        // 漫画图片恢复
        return comic18.mangaImageRetore(downloadInfo);
    }).then(() => {
        // 恢复完成
        // 漫画保存
        return comic18.saveManga(downloadInfo);
    }).then(() => {
        // 保存完成
        console.log('save success.');
    });
    
}

// 页面识别
function pageDistinguish(){
    let patternUrl = /(http|https):\/\/cdn-msp.18comic.(vip|org)/g;
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

// 休眠函数
function sleep(time){
    return new Promise((resolve) => setTimeout(resolve,time));
}

// 下载开始
function downloadStart(){
    // 添加操作视图
    let upView = new ImageInformationUpView();
    upView.getOkButton().addEventListener('click',() => {
        let upFile = upView.getUpFileButton().files;
        if (upFile.length === 1){
            let chapterProgress = upView.getChapterProgressView();
            let imageProgress = upView.getImageProgressView();
            chapterProgress.setTitle('章节');
            imageProgress.setTitle('图片');

            mangaSave(upFile[0],(notificationInfo) => {
                upView.setTaskTitle(notificationInfo['taskName']);
                let nowTask = notificationInfo['taskProgress']['nowTask'];
                let allTask = notificationInfo['taskProgress']['allTask'];
                switch(notificationInfo['taskLevel']){
                    case 0: 
                        imageProgress.setProgress(nowTask,allTask);
                        break;
                    case 1:
                        chapterProgress.setProgress(nowTask,allTask);
                        break;
                }

            });
        }
    });
}

// ---------------- script start ---------------- //
(() => {
    if (scriptExecuteJudge()){
        // 脚本已经执行过，直接返回
        return;
    }
    // 脚本第一次执行
    // 判断页面是否符合要求
    if (!pageDistinguish()){
        // 不符合要求，直接返回
        return;
    }
    // 页面符合要求
    downloadStart();
})();

