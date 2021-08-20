class ColumnDAO extends ArticleTypesettingAidDAO{
    constructor(DB){
        super(DB);
        this.objectStoreName = 'column';
        this.indexName = 'column_name';
    }
    addColumn(columnName,level,successCallable,errorCallable){
        let dataJson = {
            'column_name':columnName,
            'column_level':level,
            'add_time':(new Date()).getTime(),
            'change_time':0
        }
        super.addData(this.objectStoreName,dataJson,successCallable,errorCallable);
    }
    putColumn(data,successCallable,errorCallable){
        super.putData(this.objectStoreName,data,successCallable,errorCallable);
    }
    deleteColumnForKey(key,successCallable,errorCallable){
        super.deleteData(this.objectStoreName,key,successCallable,errorCallable);
    }
    getColumnForKey(key,successCallable,errorCallable){
        super.getDataForKey(this.objectStoreName,key,successCallable,errorCallable);
    }
    getColumnForIndex(indexKey,successCallable,errorCallable){
        super.getFirstDataForIndex(this.objectStoreName,this.indexName,indexKey,successCallable,errorCallable);
    }
    getColumnAll(range,successCallable,errorCallable){
        super.getAllData(this.objectStoreName,range,successCallable,errorCallable);
    }
}