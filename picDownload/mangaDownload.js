// ==UserScript==
// @name         mangaDownload
// @namespace    https://gitee.com/centesimal/sinppets-js/tree/main/picDownload
// @version      0.1
// @author       centesimal
// @description  download manga.
// @updateURL    https://gitee.com/centesimal/sinppets-js/raw/main/picDownload/mangaDownload.js
// @downloadURL  https://gitee.com/centesimal/sinppets-js/raw/main/picDownload/mangaDownload.js
// @supportURL   https://gitee.com/centesimal/sinppets-js
// @run-at       document-idle
// @grant        none
// ==/UserScript==

// 从文件中读取漫画信息
function readMangaInformationForFile(mangaJsonFile){
    return new Promise((resolve, reject) => {
        const fileReader = new FileReader();
        fileReader.onload = (event) => {
            let mangaInfoText = event.target.result;
            resolve(JSON.parse(mangaInfoText));
        }
        fileReader.onabort = () => {
            reject('file read abort.');
        }
        fileReader.onerror = (event) => {
            reject(event.target.error);
        }
        fileReader.readAsText(mangaJsonFile);
    });
}

// 漫画下载类
class MangaDownload{
    constructor(){
        this.downloadImageOnFinish = null;
        this.downloadChapterOnFinish = null;
        this.saveImageOnFinish = null;
        this.saveChapterOnFinish = null;
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
    let download = new MangaDownload();
    let downloadInfo;
    // 设置通知
    download.addDownloadImageOnFinishListener((data) => {
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
        return download.downloadManga(mangaInfoJson,false);
    }).then((mangaDownloadInfo) => {
        // 下载完成
        downloadInfo = mangaDownloadInfo;
        // 漫画保存
        return download.saveManga(downloadInfo);
    }).then(() => {
        // 保存完成
        console.log('save success.');
    });
    
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
    downloadStart();
})();

