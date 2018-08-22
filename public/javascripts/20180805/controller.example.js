const Controller = new function () {
  
  const $loginButton = $('.nav-profile-field');
  const $signIn = $('.nav-profile-field.flex.align-center[type="logout"]');
  const $signOut = $('.login-logout-cover.flex');
  const $userPart = $('.travellers-part');
  const $cardPart = $('.card-part');
  const $uploadPart = $('.upload-field');
  const $search = $('#search');
  const $selectedCategory = $('.category-card-outer');
  const $resetButton = $('.reset-button');
  const $sideBar = $('.side-bar-cover');
  const $loadingPart = $('.loading-part');
  const $categoryPercent = $('.storage-description-part > .category > .text > i');
  const $storagePartText = $('.used-storage-part');
  const $categoryPart = $('.category-card');
  const $storagePart = $('.storage-part');
  
  let currentUser = null;
  let selectedUser = null;
  
  const userTemplate = `<div class="travellers-cell flex align-center">
     <div class="photo-div">
          <div class="travellers-photo"></div>
     </div>
     <div class="travellers-name-div flex-1"></div>
     <div class="radio-box flex align-center">
          <div class="circle"></div>
      </div>
  </div>`;
  
  const cardTemplate = `<div class="card-cover-cell">
    <div class="sights-card-cell">
        <div class="sights-photo-div flex align-center">
            <div class="hover-dark-background"></div>
            <div class="type-icon"></div>
        </div>
        <div class="sights-content-div flex align-center">
            <div class="content flex-1">
                <div class="text bold"></div>
                <div class="text desc"></div>
            </div>
            <div class="download-icon">
              <i class="i fas fa-download"></i>
            </div>
        </div>
    </div>
</div>`;
  
  $signIn.on('click', FirebaseApi.signIn);
  $signOut.on('click', (e) => {
    e.stopPropagation();
    FirebaseApi.signOut();
  });
  
  $('.logo-field').on('click', () => {
    if (currentUser !== null) {
      $(`#${currentUser.uid}`).trigger('click');
      $search.val('');
    }
  });
  
  $selectedCategory.on('click', function () {
    const $this = $(this);
    const type = $this.find('.name').text().toLowerCase().trim();
    $selectedCategory.attr('type', 'deselected');
    $this.attr('type', '');
    const list = $cardPart.find('.card-cover-cell');
    
    for (let i = 0; i < list.length; i++) {
      if ($(list[i]).find('.type-icon').hasClass(`${type}`)) {
        $(list[i]).css('display', 'block');
      }
      else {
        $(list[i]).css('display', 'none');
      }
    }
    
    $sideBar.attr('type', 'false');
    
  });
  
  $resetButton.on('click', () => {
    $selectedCategory.attr('type', 'deselected');
    $cardPart.find('.card-cover-cell').css('display', 'block');
    $sideBar.attr('type', 'false');
    
  });
  
  $search.on('keyup', async (e) => {
    
    if (e.keyCode === 13 && currentUser !== null) {
      const val = $search.val().toLowerCase();
      
      $cardPart.empty();
      $cardPart.addClass('display-none');
      $loadingPart.removeClass('display-none');
      const test = await FirebaseDB.searchFile(selectedUser.uid, 'name', val);
      
      $loadingPart.addClass('display-none');
      $cardPart.removeClass('display-none');
      
      for (let i = 0; i < test.length; i++) {
        new addCard(test[i]);
      }
      
    }
    
    // if (e.keyCode === 13) {
    //   const val = $search.val().toLowerCase();
    //   const list = $cardPart.find('.card-cover-cell');
    //
    //   for (let i = 0; i < list.length; i++) {
    //
    //     if ($(list[i]).find('.text.bold').text().toLowerCase().indexOf(val) < 0) {
    //       $(list[i]).css('display', 'none');
    //     }
    //     else {
    //       $(list[i]).css('display', 'block');
    //     }
    //   }
    // }
    
  });
  
  FirebaseApi.setOnUpdateCardListener((id, file) => {
    if (id === selectedUser.uid) {
      file.uid = id;
      new addCard(file);
    }
  });
  
  FirebaseApi.setOnUploadListener(() => {
    $cardPart.addClass('display-none');
    $uploadPart.addClass('display-none');
    $loadingPart.removeClass('display-none');
  });
  
  
  FirebaseApi.setOnAuthStateChanged(async (u) => {
    if (!_.isNil(u)) {
      $loginButton.attr('type', 'login');
      currentUser = u;
      selectedUser = u;
      $('.nick-name-grid').text(u.displayName);
      $('.email-grid').text(u.email);
      $('.profile-photo-grid').css('background-image', `url(${u.photoURL})`);
      
      setUsersInfo(await FirebaseDB.getUserList());
      uploadFileButton.setState(true);
      
      updateProfile(currentUser, FileToJson(await FirebaseDB.readFile('uid', '==', currentUser.uid)));
      
      checkFiles(currentUser.uid);
    }
    else {
      $loginButton.attr('type', 'logout');
      $userPart.empty();
      uploadFileButton.setState(false);
      $('.changing-field').attr('type', false);
      $('.condition-bar-field').attr('type', false);
      $uploadPart.removeClass('display-none');
      $cardPart.addClass('display-none');
      $loadingPart.addClass('display-none');
      currentUser = null;
      initProfile();
    }
    
  });
  
  
  function setUsersInfo(files) {
    
    const users = [];
    for (let i = 0; i < files.length; i++) {
      users.push(new addUserInfo(files[i]));
    }
    
  }
  
  function addUserInfo(file) {
    
    const $ele = $(userTemplate);
    
    $ele.attr('id', file.uid);
    $ele.find('.travellers-name-div').text(file.displayName);
    $ele.find('.travellers-photo').css('background-image', `url(${file.photoURL})`);
    $ele.find('.radio-box').addClass('.animation-bounce-in');
    $userPart.append($ele);
    
    if (file.uid === currentUser.uid) {
      $ele.find('.photo-div').append(`<i class="fas fa-crown crown"></i>`);
      $ele.attr('check', 'on');
    }
    
    $ele.on('click', async () => {
      
      $cardPart.addClass('display-none');
      $loadingPart.removeClass('display-none');
      updateProfile(file, FileToJson(await FirebaseDB.readFile('uid', '==', file.uid)));
      $loadingPart.addClass('display-none');
      $cardPart.removeClass('display-none');
      checkFiles(file.uid);
      selectedUser = file;
      
    });
    
    const radioButton = new function () {
      
      const $travellers = $('.travellers-cell');
      
      $travellers.on('click', async function () {
        
        const $this = $(this);
        if ($this.attr('check') !== 'on') {
          $this.attr('check', 'on');
          
          $selectedCategory.attr('type', 'deselected');
        }
        if ($this.attr('check') === 'on') {
          $userPart.find($travellers).attr('check', '');
          $this.attr('check', 'on');
        }
        
      });
    };
    
    return this;
    
    
  }
  
  function updateProfile(user, json) {
    
    initProfile();
    
    const $leftBar = $('.left-side-bar');
    $leftBar.find('.profile-photo').css('background-image', `url(${user.photoURL})`);
    $leftBar.find('.nick-name').text(user.displayName);
    $leftBar.find('.email').text(user.email);
    let totalSize = 0;
    for (let i = 0; i < Object.keys(json).length; i++) {
      const keys = Object.keys(json)[i];
      const size = json[keys].size;
      const number = json[keys].number;
      const category = json[keys].category;
      
      let $categoryInfo = $(`.category-card > .text-group[type=${category}]`);
      let storageElement = $storagePart.find(`#storage-${category}`);
      storageElement.attr('style', `width: ${getStoragePercentage(size, 1.0737e+10)}%`);
      
      $categoryPart.find(`#category-${category}`).text(`    ${getStoragePercentage(size, 1.0737e+10)}%`);
      $categoryInfo.find('.count').text(number);
      $categoryInfo.find('.capacity').text(`/ ${convertByteUnitToString(size)}`);
      
      
      totalSize += size;
    }
    
    $storagePartText.text(`${convertByteUnitToString(totalSize)} / 10GB`);
    
  }
  
  
  async function checkFiles(id) {
    $cardPart.empty();
    
    const cards = [];
    const files = await FirebaseApi.readFileData(id);
    $loadingPart.addClass('display-none');
    
    if (files.length > 0) {
      $uploadPart.addClass('display-none');
      $cardPart.removeClass('display-none');
      
      for (let i = 0; i < files.length; i++) {
        cards.push(new addCard(files[i]));
      }
    }
    else {
      if (currentUser.uid === id) {
        $uploadPart.removeClass('display-none');
        $cardPart.addClass('display-none');
      }
      else {
        $uploadPart.addClass('display-none');
        $cardPart.removeClass('display-none');
      }
    }
    
  }
  
  function addCard(file) {
    
    if (!$uploadPart.hasClass('display-none'))
      $uploadPart.addClass('display-none');
    if ($cardPart.hasClass('display-none'))
      $cardPart.removeClass('display-none');
    
    const $ele = $(cardTemplate);
    $ele.find('.text.bold').text(file.name);
    $ele.find('.text.desc').text(convertByteUnitToString(file.size));
    $ele.attr('id', file.uploadDate);
    $ele.find('.download-icon').on('click', function () {
      FirebaseDB.downloadFile(file.name);
    });
    
    
    if (currentUser.uid === file.uid) {
      const deleteButton = `<div class="i fas fa-trash-alt"></div>`;
      $ele.find('.sights-card-cell').append(deleteButton);
    }
    
    if (!_.isNil(file.type)) {
      const type = file.type.split('/')[0];
      
      switch (type) {
        case 'image':
          $ele.find('.type-icon').addClass('i fas fa-image image');
          $ele.find('.sights-photo-div').addClass('type-image-color');
          break;
        
        case 'audio':
          $ele.find('.type-icon').addClass('i fas fa-music audio');
          $ele.find('.sights-photo-div').addClass('type-sound-color');
          break;
        case 'application':
          $ele.find('.type-icon').addClass('i fas fa-code application');
          $ele.find('.sights-photo-div').addClass('type-code-color');
          break;
        case 'video':
          $ele.find('.type-icon').addClass('i fas fa-video video');
          $ele.find('.sights-photo-div').addClass('type-video-color');
          
          break;
        case 'text':
          $ele.find('.type-icon').addClass('i fas fa-font text');
          $ele.find('.sights-photo-div').addClass('type-text-color');
          
          break;
        default :
          $ele.find('.type-icon').addClass('i fas fa-file etc');
          $ele.find('.sights-photo-div').addClass('type-etc-color');
          break;
      }
    } else {
      $ele.find('.type-icon').addClass('i fas fa-file etc');
      $ele.find('.sights-photo-div').addClass('type-etc-color');
      
    }
    
    $cardPart.append($ele);
    $ele.on('click', '.fa-trash-alt', async function () {
      FirebaseDB.deleteFile(file.uploadDate);
      FirebaseApi.deleteFileData(file.name);
      $ele.remove();
      
      const files = await FirebaseApi.readFileData(auth.currentUser.uid);
      if (files.length < 1) {
        $uploadPart.removeClass('display-none');
        $cardPart.addClass('display-none');
      }
      updateProfile(currentUser, FileToJson(files));
    });
    
  }
  
  function initProfile() {
    $sideBar.find('.nick-name').text('Nobody');
    $sideBar.find('.email').text('-');
    $sideBar.find('.profile-photo').css('background-image', ``);
    $categoryPercent.text('    0%');
    $storagePartText.text('0GB / 10GB');
    $categoryPart.find('.count').text(' 0');
    $categoryPart.find('.capacity').text(' / 0GB');
  }
  
  
};

function FileToJson(files) {
  const data = {};
  
  for (let i = 0; i < files.length; i++) {
    let file = files[i];
    
    let category = file.type.split("/")[0];
    if (category === "") category = "etc";
    if (!data.hasOwnProperty(category)) {
      data[category] = {
        category: category,
        size: 0,
        number: 0
      }
    }
    data[category].size += file.size;
    data[category].number++;
  }
  
  return data;
}

function getStoragePercentage(byte, total) {
  return (byte / total).toFixed(2) * 100;
}


function convertByteUnitToString(size) {
  
  if (size < Math.pow(2, 10)) {
    return size + 'B';
  }
  else if (size < Math.pow(2, 20)) {
    return (size / Math.pow(2, 10)).toFixed(2) + 'KB';
    
  }
  else if (size < Math.pow(2, 30)) {
    return (size / Math.pow(2, 20)).toFixed(2) + 'MB';
  }
  else if (size < Math.pow(2, 40)) {
    return (size / Math.pow(2, 30)).toFixed(2) + 'GB';
  }
  else if (size < Math.pow(2, 50)) {
    return (size / Math.pow(2, 40)).toFixed(2) + 'TB';
  }
  else
    return (size / Math.pow(2, 50)).toFixed(2) + 'PB';
  
}


const uploadFileButton = new function () {
  
  const $drop = $('.upload-condition-zone');
  const $uploadButton = $('.upload-button');
  const $inputZone = $('#fileUploader');
  let loginState = false;
  
  this.setState = (s) => {
    loginState = s;
  };
  
  $inputZone.on('change', (e) => {
    console.log(e.target.files);
    FirebaseApi.uploadFileData(e.target.files);
  });
  
  $uploadButton.on('click', () => {
    if (loginState) {
      $inputZone.trigger('click');
    }
  });
  
  
  $drop.on('dragenter', function (e) {
    e.stopPropagation();
    e.preventDefault();
  });
  
  $drop.on('dragleave', function (e) {
    e.stopPropagation();
    e.preventDefault();
  });
  
  $drop.on('dragover', function (e) {
    console.log('over');
    e.stopPropagation();
    e.preventDefault();
  });
  
  $drop.on('drop', function (e) {
    e.preventDefault();
    if (loginState) {
      const files = e.originalEvent.dataTransfer.files;
      FirebaseApi.uploadFileData(files);
    }
  });
  
  
  return this;
  
};


