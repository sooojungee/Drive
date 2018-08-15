const Controller = new function () {
  
  const $loginButton = $('.nav-profile-field');
  const $signIn = $('.nav-profile-field.flex.align-center[type="logout"]');
  const $signOut = $('.login-logout-cover.flex');
  const $userPart = $('.travellers-part');
  const userTemplate = `<div class="travellers-cell flex align-center">
     <div class="photo-div">
          <div class="travellers-photo"></div>
     </div>
     <div class="travellers-name-div flex-1"></div>
     <div class="radio-box flex align-center">
          <div class="circle"></div>
      </div>
  </div>`;
  
  let currentUser = null;
  let selectedUser = null;
  
  
  $signIn.on('click', FirebaseApi.signIn);
  $signOut.on('click', (e) => {
    e.stopPropagation();
    FirebaseApi.signOut();
  });
  
  FirebaseApi.setOnAuthStateChanged(async (u) => {
    
    if (!_.isNil(u)) {
      
      $loginButton.attr('type', 'login');
      currentUser = u;
      $('.nick-name-grid').text(u.displayName);
      $('.email-grid').text(u.email);
      $('.profile-photo-grid').css('background-image', `url(${u.photoURL})`);
      
      setUsersInfo(await FirebaseDB.getUserList());
      
    }
    else {
      $loginButton.attr('type', 'logout');
      $userPart.empty();
    }
    
  });
  
  function setUsersInfo(files) {
    
    console.log(files);
    const users = [];
    for (let i = 0; i < files.length; i++) {
      users.push(new addUserInfo(files[i]));
    }
    
  }
  
  function addUserInfo(file) {
    
    const $ele = $(userTemplate);
    
    $ele.find('.travellers-name-div').text(file.displayName);
    $ele.find('.travellers-photo').css('background-image', `url(${file.photoURL})`);
    $ele.find('.radio-box').addClass('.animation-bounce-in');
    $userPart.append($ele);

    if(file.uid === currentUser.uid){
      $ele.attr('check', 'on');
    }
  
    const radioButton = new function () {
      
      const $travellers = $('.travellers-cell');
      
      $travellers.on('click', function () {
        const $this = $(this);
        if ($this.attr('check') !== 'on') {
          $this.attr('check', 'on');
        }
        console.log(file.uid);
        if ($this.attr('check') === 'on') {
          $userPart.find($travellers).attr('check', '');
          $this.attr('check', 'on');
        }
        
      });
    };
    
    return this;
  }
  
  
};