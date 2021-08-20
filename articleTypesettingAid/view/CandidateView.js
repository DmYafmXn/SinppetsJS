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