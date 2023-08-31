import {collection, doc, deleteDoc, getDocs} from 'firebase/firestore';
async function deleteCollection(db, collectionPath) {
    const querySnapshot = await getDocs(collection(db, collectionPath))
    querySnapshot.forEach((doc) => {
        deleteDoc(doc.ref)
      });
    return querySnapshot
  }


// async function deleteCollection(db, collectionPath, batchSize) {
//     const collectionRef = collection(db, collectionPath);
//     const query = collectionRef
  
//     return new Promise((resolve, reject) => {
//       deleteQueryBatch(db, query, resolve).catch(reject);
//     });
// //   }
  
//   async function deleteQueryBatch(db, query, resolve) {
//     const snapshot = await query.get();
  
//     const batchSize = snapshot.size;
//     if (batchSize === 0) {
//       // When there are no documents left, we are done
//       resolve();
//       return;
//     }
  
//     // Delete documents in a batch
//     const batch = db.batch();
//     snapshot.docs.forEach((doc) => {
//       batch.delete(doc.ref);
//     });
//     await batch.commit();
  
//     // Recurse on the next process tick, to avoid
//     // exploding the stack.
//     process.nextTick(() => {
//       deleteQueryBatch(db, query, resolve);
//     });
//   }

  export { deleteCollection }