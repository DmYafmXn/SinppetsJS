class ArticleTypesettingAidDB{
    constructor(onSuccess,onError) {
        const request = window.indexedDB.open('ArticleTypesettingAidDB',2);

        request.onupgradeneeded = e=> {
            console.log('indexed db onupgradeneeded:'+e);
            // 创建存储空间（表）和item（记录）
            const db = e.target.result;// 获取数据库操作句柄
            if (!db.objectStoreNames.contains('column_keywords')){
                const column_keywords = db.createObjectStore('column_keywords', {keyPath: 'id', autoIncrement: true});
                column_keywords.createIndex('column_keywords', 'column_keywords', {unique: true});
            }
            if (!db.objectStoreNames.contains('column')){
                const column = db.createObjectStore('column', {keyPath: 'id', autoIncrement: true});
                column.createIndex('column_name', 'column_name', {unique: true});
            }
            if (!db.objectStoreNames.contains('column_keywords_column')){
                const column_keywords_column = db.createObjectStore('column_keywords_column',
                 {keyPath: 'id', autoIncrement: true});
                 column_keywords_column.createIndex('column_keywords_id_column_id', 'column_keywords_id', {unique: false});
            }
            if (!db.objectStoreNames.contains('main_body_filter_keywords')){
                const main_body_filter_keywords = db.createObjectStore('main_body_filter_keywords',
                 {keyPath: 'id', autoIncrement: true});
                 main_body_filter_keywords.createIndex('main_body_filter_keywords', 'mian_body_filter_keywords', {unique: true});
            }
        };
        request.onsuccess = e=>{
            console.log('indexed DB connection success:'+e);
            if (onSuccess) onSuccess(e)
        };
        request.onerror = e=>{
            console.log('indexed DB connnection error'+e);
            if (onError) onError(e);
        };
    }
}