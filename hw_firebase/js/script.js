$(document).ready(function(){
  // Initialize Firebase
  var config = {
    apiKey: "AIzaSyAiDiSx0OFmuSPpowcYQ0i_ZA4_muQSLx8",
    authDomain: "f2e-hw-73312.firebaseapp.com",
    databaseURL: "https://f2e-hw-73312.firebaseio.com",
    projectId: "f2e-hw-73312",
    storageBucket: "f2e-hw-73312.appspot.com",
    messagingSenderId: "301704231585"
  };

  firebase.initializeApp(config);

  var storageRef = firebase.database().ref();
  var dbUser = firebase.database().ref().child('user');
  var dbChatRoom = firebase.database().ref().child('chatroom');
  var user = firebase.auth().currentUser;
  var photoURL = '';
  var typeName;

  const $email = $('#email');
  const $password = $('#password');
  const $btnSignIn = $('#btnSignIn');
  const $btnSignUp = $('#btnSignUp');
  const $btnSignOut = $('#btnSignOut');
  const $btnSubmit = $('#btnSubmit');
  const $signInfo = $('#sign-info');
  const $messageField = $('#messageInput');
  const $messageList = $('#example-message');

    // Hovershadow
  // $hovershadow.hover(
  //   function(){
  //     $(this).addClass("mdl-shadow--4dp");
  //   },
  //   function(){
  //     $(this).removeClass("mdl-shadow--4dp");
  //   }
  // );

  // SignIn
  $btnSignIn.click(function(e){
    const email = $email.val();
    const pass = $password.val();
    const auth = firebase.auth();
    // signIn
    const promise = auth.signInWithEmailAndPassword(email, pass);
    promise.catch(function(e){
      console.log(e.message);
      $signInfo.html(e.message);
    });
    promise.then(function(e){
      console.log("sign in suceesfully");
      $signInfo.html("sign in suceesfully");
      window.location.href = "./loginShow.html";
    });
  });

  // SignUp
  $btnSignUp.click(function(e){
    const email = $email.val();
    const pass = $password.val();
    const auth = firebase.auth();
    // signUp
    const promise = auth.createUserWithEmailAndPassword(email, pass);
    promise.catch(function(e){
      console.log(e.message);
      $signInfo.html(e.message);
    });
    promise.then(function(user){
      console.log('SignUp user is'+user.email);
      const dbUserid = dbUser.child(user.uid);
      dbUserid.set({
        email:email,
        userName: "",
        age: "",
        occupation: "",
        photoURL: "",
        description: ""
      });
      window.location.href = "./loginShow.html";
    });
  });

  // for save file
  var storageRef = firebase.storage().ref();
  function handleFileSelect(evt) {
    evt.stopPropagation();
    evt.preventDefault();
    var file = evt.target.files[0];

    var metadata = {
      'contentType': file.type
    };

    // Push to child path.
    // [START oncomplete]
    storageRef.child('images/' + file.name).put(file, metadata).then(function(snapshot) {
      console.log('Uploaded', snapshot.totalBytes, 'bytes.');
      console.log(snapshot.metadata);
      photoURL = snapshot.metadata.downloadURLs[0];
      console.log('File available at', photoURL);
    }).catch(function(error) {
      // [START onfailure]
      console.error('Upload failed:', error);
      // [END onfailure]
    });
    // [END oncomplete]
  }

  window.onload = function () {
    $('#file').change(handleFileSelect);
  }

  // Listening Login User
  firebase.auth().onAuthStateChanged(function(user){
    if(user) {
      console.log(user);
      $signInfo.html(user.email +" is login...");
      //const dbUserid = dbUser.child(user.uid);
      loadData(user);

      user.providerData.forEach(function(profile) {
        console.log("  Sign-in provider: "+profile.providerId);
        console.log("  Provider-specific UID: "+profile.uid);
        console.log("  Name: "+profile.userName);
        console.log("  Email: "+profile.email);
        console.log("  Photo URL: "+profile.photoURL);
      });
    } else {
      console.log("not logged in");
    }
  });

  // SignOut
  $btnSignOut.click(function(){
    firebase.auth().signOut();
    console.log('LogOut');
    $signInfo.html('No one login...');
    window.location.href = "./index.html";
  });

    // Submit
  $btnSubmit.click(function(){
    var user = firebase.auth().currentUser;
    const $userName = $('#userName').val();
    const dbUserid = dbUser.child(user.uid);
    dbUserid.update({
      userName: $userName,
      age: $('#userAge').val(),
      photoURL: photoURL,
      occupation: $('#userOccupation').val(),
      description: $('#userDescription').val()
    });
    typeName = $('#userName').val();
    window.location.href = "./loginShow.html";
  });

  //load data to firebase
  function loadData(currentUser){
    var userId = firebase.auth().currentUser.uid;
    var dbUserInfo = firebase.database().ref().child('/user/' + userId);
    dbUserInfo.on("value", function(snapshot){
      var username = snapshot.val().userName;
      var occupation = snapshot.val().occupation;
      var age = snapshot.val().age;
      var description = snapshot.val().description;
      var photoURL = snapshot.val().photoURL;
      typeName = username;
      if (typeName != "") {
        $('typeName').html(typeName);
      }
      $('#profile-name').html(username);
      $('#profile-email').html(snapshot.val().email);
      $('#profile-occupation').html(occupation);
      $('#profile-age').html(age);
      $('#profile-description').html(description);
      $('img').attr("src", photoURL);
    });

    // chatroom
    dbChatRoom.limitToLast(10).on('child_added', function (snapshot) {
      //GET DATA
      var data = snapshot.val();
      var username = data.username||"anonymous";
      var message = data.text;
      var $messageElement = $("<li>");
      var $image = $("<img>");
      var $nameElement = $("<strong class='example-chat-username'></strong>");
      var uid = data.uid;
      $nameElement.text(username + " : ");
      $messageElement.text(message).prepend($nameElement);
      $messageElement.prepend()
      //ADD MESSAGE
      $messageList.append($messageElement);

      //SCROLL TO BOTTOM OF MESSAGE LIST
      $('#messageInput')[0].scrollTop = $('#messageInput')[0].scrollHeight;
    });
  }

  // 當按下enter
  $messageField.keypress(function (e) {
    console.log("confirm click");
    if (e.keyCode == 13 && $('#messageInput').val()) {
      //FIELD VALUES
      var message = $messageField.val();
      console.log(typeName);
      console.log(message);
      //SAVE DATA TO FIREBASE AND EMPTY FIELD
      dbChatRoom.push({username: typeName, message: message});
      $messageField.val('');
    }
  });

});
