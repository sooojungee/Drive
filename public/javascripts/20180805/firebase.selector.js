var config = {
  apiKey: "AIzaSyC5CkychCxorVQPC4-J4LrAjL7vbiCMusQ",
  authDomain: "drivesystem-d2dfd.firebaseapp.com",
  databaseURL: "https://drivesystem-d2dfd.firebaseio.com",
  projectId: "drivesystem-d2dfd",
  storageBucket: "drivesystem-d2dfd.appspot.com",
  messagingSenderId: "750997686378"
};

firebase.initializeApp(config);


const auth = firebase.auth();
const provider = new firebase.auth.GoogleAuthProvider();
const store = firebase.firestore();
const storage = firebase.storage();

const storageRef = storage.ref();
const settings = {timestampsInSnapshots: true};
store.settings(settings);


const FirebaseDB = {
  
  createUser: async (user) => {
    const data = {
      uid: user.uid,
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      createdAt: new Date().getTime(),
      signAt: new Date().getTime(),
    };
    
    return await store.collection('users').doc(user.uid).set(data);
  },
  
  
  signUser: async (user) => {
    const data = {
      displayName: user.displayName,
      email: user.email,
      photoURL: user.photoURL,
      signAt: new Date().getTime(),
      
    };
    
    return await store.collection("users").doc(user.uid).update(data);
  },
  
  readUser: async (uid) => {
    const refUser = store.collection("users").doc(uid);
    const doc = await refUser.get();
    if (doc.exists) return doc.data();
    else return null;
  },
  
  getUserList: async () => {
    
    const userList = [];
    
    await store.collection("users").get().then(function (querySnapshot) {
      
      querySnapshot.forEach(function (doc) {
        userList.push(doc.data());
      });
      
    });
    
    return userList;
    
  },
  
  uploadFile: async (uid, file) => {
    
    const fileId = new Date().getTime().toString();
    const data = {
      uid: uid,
      name: file.name,
      size: file.size,
      type: file.type,
      lastModifiedDate: file.lastModifiedDate,
      uploadDate: fileId
      
    };
    
    return await store.collection("files").doc(fileId).set(data);
    
  },
  
  readFile: async (checkId, sign, id) => {
    
    const files = [];
    await store.collection("files").where(checkId, sign, id)
      .get()
      .then(function (querySnapshot) {
        querySnapshot.forEach(function (doc) {
          files.push(doc.data());
        });
      })
      .catch(function (error) {
        console.log("Error getting documents: ", error);
      });
    
    return files;
  },
  
  searchFile: async (id, key, val) => {
    const files = [];
    await store.collection("files").where('uid', '==', id).get().then(function (querySnapshot) {
      querySnapshot.forEach(function (doc) {
        /// nn
        if (doc.data().name.toLowerCase().indexOf(val) >= 0)
          files.push(doc.data());
      });
    });
    
    return files;
  },
  
  downloadFile: async (filename) => {
    const url = await storageRef.child(filename).getDownloadURL();
    window.open(url);
  },
  
  deleteFile: async (key) => {
    
    store.collection("files").doc(key).delete().then(function () {
      console.log("Document successfully deleted!");
    }).catch(function (error) {
      console.error("Error removing document: ", error);
    });
  }
  
};

const FirebaseApi = new function () {
  
  let listener = null;
  let updateCardListener = null;
  let uploadListener = null;
  
  function setOnUpdateCardListener(callback) {
    updateCardListener = callback;
  }
  
  function setOnUploadListener(callback) {
    uploadListener = callback;
  }
  
  
  function setOnAuthStateChanged(callback) {
    listener = callback;
  }
  
  auth.onAuthStateChanged(async (user) => {
    uploadListener();
    
    if (_.isNil(user)) {
      if (!_.isNil(listener)) listener(null);
      return;
    }
    
    let u = await FirebaseDB.readUser(user.uid);
    if (_.isNil(u)) {
      await FirebaseDB.createUser(user);
      u = await FirebaseDB.readUser(user.uid);
    }
    else {
      await FirebaseDB.signUser(user);
      u = await FirebaseDB.readUser(user.uid);
    }
    
    if (!_.isNil(listener)) listener(u);
    
  });
  
  async function uploadFileData(files) {
    
    const user = auth.currentUser;
    for (let i = 0; i < files.length; i++) {
      
      const ref = storageRef.child(files[i].name).put(files[i]);
      
      await ref.on('state_changed', function (snapshot) {
        var progress = (snapshot.bytesTransferred / snapshot.totalBytes) * 100;
        console.log('Upload is ' + progress + '% done');
      }, function (error) {
        console.log(error);
      }, await function () {
        ref.snapshot.ref.getDownloadURL().then(function (downloadURL) {
          console.log('File available at', downloadURL);
        });
        
      });
      
      await FirebaseDB.uploadFile(user.uid, files[i]);
      updateCardListener(user.uid, files[i]);
    }
    
  }
  
  function deleteFileData(filename) {
    const desertRef = storageRef.child(filename);
    
    desertRef.delete().then(function () {
    
    }).catch(function (error) {
    
    });
  }
  
  
  async function readFileData(id) {
    
    const files = await FirebaseDB.readFile('uid', '==', id);
    console.log(files);
    // readListener(files);
    return files;
    
    
    try {
      await auth.signInWithPopup(provider)
    } catch (error) {
    }
  }
  
  return {
    signIn: async () => {
      try {
        await auth.signInWithPopup(provider)
      } catch (error) {
      }
    },
    signOut: async () => await auth.signOut(),
    setOnAuthStateChanged,
    uploadFileData,
    readFileData,
    setOnUploadListener,
    setOnUpdateCardListener,
    deleteFileData
  };
  
  
};