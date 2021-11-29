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
        // 数据库栏目启用栏目辅助
        let columnNode = databaseAuxiliary.contextMenuView.getColumnNode();
        columnAuxiliary.apply(window,columnNode);

        // 隐藏页面自带的上下文菜单
        let contextMenuNode = windownNode.document.querySelector('#edui_fixedlayer');
        if (contextMenuNode) contextMenuNode.style['top'] = 'auto';
        // -----------------------------------------------------------------------------
        // 正文窗口
        articleChange.mainBodyIframeWindowHook(mainBodyWindow=>{
            // 启用数据库辅助
            databaseAuxiliary.apply(mainBodyWindow);
            let columnNode = databaseAuxiliary.contextMenuView.getColumnNode();
            // 启用栏目推荐辅助
            columnAuxiliary.apply(mainBodyWindow,columnNode);
        });
        // 启用正文辅助
        let mainBodyFilterKeywordsDAO = new MainBodyFilterKeywordsDAO(DB);
        mainBodyFilterKeywordsDAO.getMainBodyFilterKeywordsAll(IDBKeyRange.lowerBound(0),event=>{
            let keywordsList = event.target.result;
            let mainBodyAuxiliary = new MainBodyAuxiliary();
            articleChange.changeMainBody(node=>{
                mainBodyAuxiliary.apply(node,keywordsList);
            })
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