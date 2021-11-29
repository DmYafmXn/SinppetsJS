class CandidateView{
    constructor(){
        this.boxId = 'container_box';
        this.groupId = 'cotainer_group';
        let candidateBox = this.__containerGenerate();
        let groupNode = this.__groupNodeGenerate();
        candidateBox.appendChild(groupNode);
        // 添加候选区到页面
        if (!this.isExist(document.body)){
            document.body.appendChild(candidateBox);
        }
    }

    hookNode(windowNode,node){
        let candidateBox = this.getCandidateView();
        // 获取window之间的偏移
        let windowOffsetX = windowNode.top.innerWidth - windowNode.innerWidth;
        let windowOffsetY = windowNode.top.innerHeight - windowNode.innerHeight;
        console.log('wX='+windowOffsetX+'wY='+windowOffsetY);
        // 添加输入监听器
        node.addEventListener('input',e=>{
            console.log('candidate view hook node input event.')
            this.clearCandidateTexts();
        });
        // 添加获取焦点监听器
        node.addEventListener('focus',e=>{
            console.log('candidate view hook node focus event.')
            let eventNode = e.target;
            // 获取input节点偏移
            let nodeOffsetX = this.__getOffsetX(eventNode);
            let nodeOffsetY = this.__getOffsetY(eventNode);
            // 计算候选区节点所需偏移
            let x = windowOffsetX + nodeOffsetX;
            let y = windowOffsetY + nodeOffsetY + eventNode.offsetHeight;
            // 获取当前候选区的偏移
            let nowX = this.__getOffsetX(candidateBox) + windowOffsetX;
            let nowY = this.__getOffsetY(candidateBox) + windowOffsetY;
            // 设置候选区偏移
            if (nowX != x || nowY != y){
                this.setPosition(x,y);
            }
            // 设置候选区宽度
            if (candidateBox.offsetWidth != eventNode.offsetWidth){
                this.setSize(eventNode.offsetWidth,eventNode.offsetWidth);
            }
            // 清除候选区文本
            this.clearCandidateTexts();
            // 候选区显示
            this.setVisibility(true);
        });
        // 添加失去焦点监听器
        node.addEventListener('blur',e=>{
            console.log('candidate view hook node blur event.')
            let inputNode = e.target;
            // 输入节点位置范围
            let inputNodeX1 = inputNode.offsetLeft;
            let inputNodeY1 = inputNode.offsetTop;
            let inputNodeX2 = inputNode.offsetWidth + inputNodeX1;
            let inputNodeY2 = inputNode.offsetHeight + inputNodeY1;
            // 候选区位置范围
            let x1 = candidateBox.offsetLeft;
            let y1 = candidateBox.offsetTop;
            let x2 = x1 + candidateBox.offsetWidth;
            let y2 = y1 + candidateBox.offsetHeight;
            // 当前鼠标位置
            let mouseX = e.clientX;
            let mouseY = e.clientY;
            // 鼠标位置不在候选区范围内则隐藏菜单
            if (mouseX < x1 || mouseX > x2 || mouseY < y1 || mouseY > y2){
                console.log('hidden candidateBox.');
                this.setVisibility(false);
            }
        });
        // 添加鼠标右键监听器
        node.addEventListener('mouseup', e=>{
            console.log('candidate view hook node mouseup event.')
            if(e.button == 2){
                this.setVisibility(false);
            }
        });
    }

    isExist(node){
        let result = false;
        if (node.querySelector('#'+this.boxId)){
            result = true;
        }
        return result;
    }
    setCandidateText(text){
        let groupNode = this.getCandidateGroup();
        if (groupNode.firstChild){
            groupNode.insertBefore(this.__itemNodeGeneraate(text),groupNode.firstChild);
        }else{
            groupNode.appendChild(this.__itemNodeGeneraate(text));
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
        this.getCandidateGroup().innerHTML = '';
    }
    setPosition(x,y){
        let candidateBox = this.getCandidateView();
        if (x && y){
            candidateBox.style['left'] = x+'px';
            candidateBox.style['top'] = y+'px';
        }
    }
    setSize(width,height){
        let candidateBox = this.getCandidateView();
        if (width && height){
            let setWidth;
            let setHeight;
            if (width == 'auto') setWidth = width; else setWidth = width+'px';
            if (height == 'auto') setHeight = height; else setHeight = height+'px';
            candidateBox.style['width'] = setWidth;
            candidateBox.style['height'] = setHeight;
        }
    }
    isVisibility(){
        return this.getCandidateView().style['visibility'] == 'visible';
    }
    setVisibility(visible){
        let candidateBox = this.getCandidateView();
        if (visible){
            candidateBox.style['visibility'] = 'visible';
        }else{
            candidateBox.style['visibility'] = 'hidden';
        }
    }
    getCandidateView(){
        return document.querySelector('#' + this.boxId);
    }
    getCandidateGroup(){
        return document.querySelector('#' + this.groupId);
    }
    __containerGenerate(){
        // 容器样式
        let style_div = 'position:absolute;\
            overflow: auto;\
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
        groupNode.setAttribute('id',this.groupId);
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
}