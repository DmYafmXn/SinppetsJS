class MainBodyFilterKeywordsDAO extends ArticleTypesettingAidDAO{
    constructor(DB){
        super(DB);
        this.objectStoreName = 'main_body_filter_keywords';
        this.indexName = 'main_body_filter_keywords';
    }
    addMainBodyFilterKeywords(keywords,level,successCallable,errorCallable){
        let dataJson={
            'mian_body_filter_keywords':keywords,
            'mian_body_filter_keywords_level':level,
            'add_time':(new Date()).getTime(),
            'change_time':0
        }
        super.addData(this.objectStoreName,dataJson,successCallable,errorCallable);
    }
    putMainBodyFilterKeywords(data,successCallable,errorCallable){
        super.putData(this.objectStoreName,data,successCallable,errorCallable);
    }
    deleteMainBodyFilterKeywordsForKey(key,successCallable,errorCallable){
        super.deleteData(this.objectStoreName,key,successCallable,errorCallable);
    }
    getMainBodyFilterKeywordsForKey(key,successCallable,errorCallable){
        super.getDataForKey(this.objectStoreName,key,successCallable,errorCallable);
    }
    getMainBodyFilterKeywordsForIndex(indexKey,successCallable,errorCallable){
        super.getFirstDataForIndex(this.objectStoreName,this.indexName,indexKey,successCallable,errorCallable);
    }
    getMainBodyFilterKeywordsAll(range,successCallable,errorCallable){
        super.getAllData(this.objectStoreName,range,successCallable,errorCallable);
    }
}