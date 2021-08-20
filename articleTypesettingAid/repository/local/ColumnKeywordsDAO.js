class ColumnKeywordsDAO extends ArticleTypesettingAidDAO{
    constructor(DB){
        super(DB);
        this.objectStoreName = 'column_keywords';
        this.indexName = 'column_keywords';
    }
    addColumnKeywords(data,successCallable,errorCallable){
        let dataJson = {
            'column_keywords':data,
            'add_time':(new Date()).getTime(),
            'change_time':0
        }
        super.addData(this.objectStoreName,dataJson,successCallable,errorCallable);
    }
    putColumnKeywords(data,successCallable,errorCallable){
        super.putData(this.objectStoreName,data,successCallable,errorCallable);
    }
    deleteColumnKeywordsForKey(key,successCallable,errorCallable){
        super.deleteData(this.objectStoreName,key,successCallable,errorCallable);
    }
    getColumnKeywordsForKey(key,successCallable,errorCallable){
        super.getDataForKey(this.objectStoreName,key,successCallable,errorCallable);
    }
    getColumnKeywordsForIndex(indexKey,successCallable,errorCallable){
        super.getFirstDataForIndex(this.objectStoreName,this.indexName,indexKey,successCallable,errorCallable);
    }
    getColumnKeywordsAll(range,successCallable,errorCallable){
        super.getAllData(this.objectStoreName,range,successCallable,errorCallable);
    }
}