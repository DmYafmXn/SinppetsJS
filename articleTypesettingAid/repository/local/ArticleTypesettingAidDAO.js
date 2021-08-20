class ArticleTypesettingAidDAO{
    constructor(DB){
        this.DB = DB;
        this.readwrite = 'readwrite';
        this.readonly = 'readonly';
    }
    addData(objectStoreName,addData,successCallable,errorCallable){
        console.log('addData,objectStoreName='+objectStoreName+',addData='+JSON.stringify(addData));
        const transaction = this.DB.transaction([objectStoreName], this.readwrite);
        const objectStore = transaction.objectStore(objectStoreName);
        const request = objectStore.add(addData);
        request.onsuccess = successCallable;
        request.onerror = errorCallable;
    }
    putData(objectStoreName,putData,successCallable,errorCallable){
        console.log('putData,objectStoreName='+objectStoreName+',putData='+JSON.stringify(putData));
        const transaction = this.DB.transaction([objectStoreName], this.readwrite);
        const objectStore = transaction.objectStore(objectStoreName);
        const request = objectStore.put(putData);
        request.onsuccess = successCallable;
        request.onerror = errorCallable;

    }
    deleteData(objectStoreName,deleteDataKey,successCallable,errorCallable){
        console.log('deleteData,objectStoreName='+objectStoreName+',deleteDataKey='+deleteDataKey);
        const transaction = this.DB.transaction([objectStoreName], this.readwrite);
        const objectStore = transaction.objectStore(objectStoreName);
        const request = objectStore.delete(deleteDataKey);
        request.onsuccess = successCallable;
        request.onerror = errorCallable;

    }
    getDataForKey(objectStoreName,key,successCallable,errorCallable){
        console.log('getDataForKey,objectStoreName='+objectStoreName+',key='+key);
        const transaction = this.DB.transaction([objectStoreName], this.readonly);
        const objectStore = transaction.objectStore(objectStoreName);
        const request = objectStore.get(key);
        request.onsuccess = successCallable;
        request.onerror = errorCallable;

    }
    getFirstDataForIndex(objectStoreName,indexName,indexKey,successCallable,errorCallable){
        console.log('getFirstDataForIndex,objectStoreName='+objectStoreName+',indexName='+indexName+',indexKey='+indexKey);
        const transaction = this.DB.transaction([objectStoreName], this.readonly);
        const objectStore = transaction.objectStore(objectStoreName);
        const request = objectStore.index(indexName).get(indexKey);
        request.onsuccess = successCallable;
        request.onerror = errorCallable;
    }
    getAllDataForIndex(objectStoreName,indexName,indexKeypath,indexKeyes,successCallable,errorCallable){
        console.log('getAllDataForIndex,objectStoreName='+objectStoreName
        +',indexName='+indexName+',indexKeypath='+indexKeypath+',indexKeyes='+indexKeyes);
        const transaction = this.DB.transaction([objectStoreName], this.readonly);
        const objectStore = transaction.objectStore(objectStoreName);
        const objectIndex = objectStore.index(indexName);
        const request = objectIndex.openCursor()
        let result = [];
        request.onsuccess = e=>{
            let cursor = e.target.result;
            if (cursor){
                let value = cursor.value[indexKeypath];
                console.log('getAllDataForIndex,result='+cursor.value+',target value='+value);
                if (Array.isArray(indexKeyes)){
                    for (let i = 0;i<indexKeyes.length;i++){
                        if (value == indexKeyes[i]) result.push(cursor.value);
                    }
                }else{
                    if (value == indexKeyes){
                        result.push(cursor.value);
                    }
                }
                cursor.continue();
            }else{
                if (successCallable) successCallable(result);
            }
        }
        request.onerror = errorCallable;
    }
    getAllData(objectStoreName,range,successCallable,errorCallable){
        console.log('getAllData,objectStoreName='+objectStoreName+',range='+range);
        const transaction = this.DB.transaction([objectStoreName], this.readonly);
        const objectStore = transaction.objectStore(objectStoreName);
        const request = objectStore.getAll(range);
        request.onsuccess = successCallable;
        request.onerror = errorCallable;

    }

}