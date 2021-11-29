class DatabaseAuxiliary{
    constructor(DB){
        this.DB = DB;
        // 生成上下文菜单
        this.contextMenuView = new DataAddContextMenu();
        this.contextMenuView.setOnClickToAddColumnKeywordsColumn(e=>{
            this.contextMenuView.addColumnKeywordsColumnButtonStart();
            this.addColumnKeywords(this.contextMenuView.getColumnKeywordsValue(),this.contextMenuView.getColumnValue(),e=>{
                //添加成功回调
                console.log('columnKeywords-column添加成功')
                this.contextMenuView.addColumnKeywordsColumnButtonEnd();
            },()=>{
                // 保存失败回调
                console.log('columnKeywords-column添加失败')
                this.contextMenuView.addColumnKeywordsColumnButtonError();
            });

        });
        this.contextMenuView.setOnClickToAddMainBodyKeywords(e=>{
            this.addMainBodyFilterKeywords(this.contextMenuView.getMainBodyKeywordsValue());
        })
    }
    apply(windownsObj){
        this.contextMenuView.hookWindow(windownsObj);
    }

    // 添加栏目关键字-栏目-栏目关系
    addColumnKeywords(keywords,column,successCallable,errorCallable){
        console.log('addColumnKeywords,keywords='+keywords+',column='+column);
        let CKDAO = new ColumnKeywordsDAO(this.DB);
        let columnDAO = new ColumnDAO(this.DB);
        let CKCDAO = new ColumnKeywordsColumnDAO(this.DB);
        new Promise((resolve,reject)=>{
            // 查询栏目关键字是否存在
            CKDAO.getColumnKeywordsForIndex(keywords,e=>{
                let result = e.target.result;
                if (result){
                    // 栏目关键字存在，直接返回
                    resolve(result);
                }else{
                    // 栏目关键字不存在，添加后返回
                    CKDAO.addColumnKeywords(keywords,e=>{
                        let addResult = e.target.result;// 返回key
                        CKDAO.getColumnKeywordsForKey(addResult,e=>{
                            resolve(e.target.result);
                        });
                    })
                }
            },e=>{
                console.log('query column keywords for index fail.')
                reject(e);
            });
        }).then(keywordsQueryResult=>{
            return new Promise((resolve,reject)=>{
                let data = {
                    'columnKeywords':keywordsQueryResult,
                    'column':''
                }
                // 查询栏目是否存在
                columnDAO.getColumnForIndex(column,e=>{
                    let result = e.target.result;
                    // 栏目存在，包装返回
                    if (result){
                        data.column = result;
                        resolve(data);
                    }else{
                        // 栏目不存在，添加后返回
                        columnDAO.addColumn(column,0,e=>{
                            let addResult = e.target.result;
                            columnDAO.getColumnForKey(addResult,e=>{
                                data.column = e.target.result;
                                resolve(data)
                            });
                        });
                    }
                })
            })
        }).then(data=>{
            // 根据栏目关键字获取栏目关键字-栏目对照表对应信息
            CKCDAO.getAllColumnKeywordsColumnForIndex(data.columnKeywords.id,resultes=>{
                // 判断对应信息是否已存在
                let isExist = false;
                for (let i = 0;i < resultes.length;i++){
                    if (resultes[i].column_id == data.column.id){
                        console.log('save fail:column keywords - column relation is exist.')
                        isExist = true;
                        break;
                    }
                }
                if (!isExist){
                    CKCDAO.addColumnKeywordsColumn(data.columnKeywords.id,data.column.id,successCallable)
                }else{
                    if (errorCallable) errorCallable();
                }
            })
        })
    }

    // 添加正文关键字
    addMainBodyFilterKeywords(keywords){
        let mainBodyFilterKeywordsDAO = new MainBodyFilterKeywordsDAO(this.DB);
        mainBodyFilterKeywordsDAO.addMainBodyFilterKeywords(keywords,0,e=>{
            console.log('main body keywords save success.')
        });
    }

}