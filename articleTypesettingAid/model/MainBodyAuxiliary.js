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