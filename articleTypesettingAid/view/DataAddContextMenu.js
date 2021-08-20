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