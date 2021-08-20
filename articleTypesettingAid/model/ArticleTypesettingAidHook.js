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