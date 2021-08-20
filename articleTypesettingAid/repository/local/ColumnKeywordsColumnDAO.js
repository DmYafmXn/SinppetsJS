class ColumnKeywordsColumnDAO extends ArticleTypesettingAidDAO{
    constructor(DB){
        super(DB);
        this.objectStoreName = 'column_keywords_column';
        this.indexName = 'column_keywords_id_column_id';
        this.indexKeyPath = 'column_keywords_id'
    }
    addColumnKeywordsColumn(columnKeywordsId,columnId,successCallable,errorCallable){
        let dataJson = {
            'column_keywords_id':columnKeywordsId,
            'column_id':columnId,
            'add_time':(new Date()).getTime(),
            'change_time':0
        }
        super.addData(this.objectStoreName,dataJson,successCallable,errorCallable);
    }
    putColumnKeywordsColumn(data,successCallable,errorCallable){
        super.putData(this.objectStoreName,data,successCallable,errorCallable);
    }
    deleteColumnKeywordsColumnForKey(key,successCallable,errorCallable){
        super.deleteData(this.objectStoreName,key,successCallable,errorCallable);
    }
    getColumnKeywordsColumnForKey(key,successCallable,errorCallable){
        super.getDataForKey(this.objectStoreName,key,successCallable,errorCallable);
    }
    getColumnKeywordsColumnForIndex(indexKey,successCallable,errorCallable){
        super.getFirstDataForIndex(this.objectStoreName,this.indexName,indexKey,successCallable,errorCallable);
    }
    getAllColumnKeywordsColumnForIndex(indexKeyes,successCallable,errorCallable){
        super.getAllDataForIndex(this.objectStoreName,this.indexName,this.indexKeyPath,indexKeyes,successCallable,errorCallable);
    }
    getColumnKeywordsColumnAll(range,successCallable,errorCallable){
        super.getAllData(this.objectStoreName,range,successCallable,errorCallable);
    }
}