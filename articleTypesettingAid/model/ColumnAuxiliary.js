class ColumnAuxiliary{
    constructor(DB){
        this.DB = DB;
        this.candidateView = new CandidateView();
    }
    apply(windowNode,inputNode){
        this.candidateView.hookNode(windowNode,inputNode);
        // 添加输入监听器
        inputNode.addEventListener('input',e=>{
            console.log(e.target.value);
            // this.__queryAllRelevantColumn(e.target.value,e=>{
            //     console.log('query result='+JSON.stringify(e.target.result));
            //     this.candidateView.setCandidateText(e.target.result.column_name);
            // })
            this.__queryAllRelevantColumnHyphenation(e.target.value,columnWeightList=>{
                console.log('query result='+JSON.stringify(columnWeightList));
                for (let i = 0;i < columnWeightList.length;i++){
                    this.candidateView.setCandidateText(columnWeightList[i].column.column_name);
                }
            });
        });
        // 添加获取焦点监听器
        inputNode.addEventListener('focus',e=>{
            console.log('get focus');
            this.__queryAllRelevantColumnHyphenation(e.target.value,columnWeightList=>{
                console.log('query success.');
                for (let i = 0;i < columnWeightList.length;i++){
                    this.candidateView.setCandidateText(columnWeightList[i].column.column_name);
                }
            });
        });
    }
    __queryAllRelevantColumn(text,callable){
        let columnKeywordsDAO = new ColumnKeywordsDAO(this.DB);
        let columnKeywordsColumnDAO = new ColumnKeywordsColumnDAO(this.DB);
        let columnDAO = new ColumnDAO(this.DB);

        new Promise((resolve,reject)=>{
            // 获取所有栏目关键字
            columnKeywordsDAO.getColumnKeywordsAll(IDBKeyRange.lowerBound(0),event=>{
                // 栏目关键字与现在的栏目匹配
                let keywordsList = event.target.result;
                console.log('get all lenght='+keywordsList.length);
                let patternKeywords = [];
                for (let i = 0;i<keywordsList.length;i++){
                    if (keywordsRegularMatching(keywordsList[i].column_keywords,text)) {
                        patternKeywords.push(keywordsList[i]);
                    }
                }
                // 返回关键字匹配成功列表
                resolve(patternKeywords);
            });
        }).then(keywordsList=>{
            return new Promise((resolve,reject)=>{
                // 根据栏目关键字id获取栏目id
                let columnKeywordsIdList = [];
                for (let i = 0;i<keywordsList.length;i++){
                    columnKeywordsIdList.push(keywordsList[i].id);
                }
                columnKeywordsColumnDAO.getAllColumnKeywordsColumnForIndex(columnKeywordsIdList,list=>{
                    // TODO list去重
                    resolve(list);
                });
            });
        }).then(columnKeywordsColumnList=>{
            for (let i=0;i<columnKeywordsColumnList.length;i++){
                // 根据栏目key获取栏目
                columnDAO.getColumnForKey(columnKeywordsColumnList[i].column_id,e=>{
                    if (callable) callable(e);
                })
            }
        });
    }
    __queryAllRelevantColumnHyphenation(text,successCallable,errorCallable){
        // 查询所有栏目
        new Promise((resolve,reject)=>{
            let columnDAO = new ColumnDAO(this.DB);
            columnDAO.getColumnAll(IDBKeyRange.lowerBound(0),e=>{
                resolve(e.target.result);
            });
        }).then(columnList=>{
            // 数据包装，增加权重属性
            return new Promise((resolve,reject)=>{
                let columnWeightList = [];
                for (let i = 0;i < columnList.length;i++){
                    columnWeightList.push({
                        'column':columnList[i],
                        'weight':0
                    });
                }
                resolve(columnWeightList);
            });
        }).then(columnWeightList=>{
            // 进行权重赋值
            return new Promise((resolve,reject)=>{
                for(let i = 0;i < text.length;i++){
                    let charText = text.charAt(i);
                    for (let j = 0;j < columnWeightList.length;j++){
                        if (columnWeightList[j].column.column_name.search(charText) != -1){
                            columnWeightList[j].weight += 1;
                        }
                    }
                }
                resolve(columnWeightList);
            });
        }).then(columnWeightList=>{
            // 进行按权重排序
            columnWeightList.sort((a,b)=>{
                return a.weight - b.weight;
            })
            if (successCallable) successCallable(columnWeightList);
        })
    }

}