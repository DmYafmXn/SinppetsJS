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