var OAuth = {
  oauth_token: '',
  oauth_token_secret: '',
  oauth_access_token: '',
  oauth_access_token_secret: ''
};
function setupOAuth() {
  var cacheToken = localStorage.getItem('oauth_token');
  var cacheTokenSecret = localStorage.getItem('oauth_token_secret');
  var cacheAccessToken = localStorage.getItem('oauth_access_token');
  var cacheAccessTokenSecret = localStorage.getItem('oauth_access_token_secret');
  if (cacheToken && cacheTokenSecret && cacheAccessToken && cacheAccessTokenSecret) {
    OAuth.oauth_token = cacheToken;
    OAuth.oauth_token_secret = cacheTokenSecret;
    OAuth.oauth_access_token = cacheAccessToken;
    OAuth.oauth_access_token_secret = cacheAccessTokenSecret;
  }
  else {
    var elmForm = document.getElementById('oauth');
    for (var i=0; i < elmForm.length; i++) {
      var elm = elmForm.elements[i];
      if (elm.value && elm.value.length > 0) {
        OAuth[elm.name] = elm.value;
      }
    }
    if (OAuth.oauth_token.length > 0 &&
        OAuth.oauth_token_secret.length > 0 &&
        OAuth.oauth_access_token.length > 0 &&
        OAuth.oauth_access_token_secret.length > 0)
    {
      localStorage.setItem('oauth_token', OAuth.oauth_token);
      localStorage.setItem('oauth_token_secret', OAuth.oauth_token_secret);
      localStorage.setItem('oauth_access_token', OAuth.oauth_access_token);
      localStorage.setItem('oauth_access_token_secret', OAuth.oauth_access_token_secret);
    }
  }
}

function startAnimation(animationImages, e){
  if (!this.t) {
    var self = this;
    var elm = document.getElementById(self.elmId);
    if (self.fixPosition) self.fixPosition(e);
    var count = 0;
    self.animationCount = 0;
    self.t = setInterval(function(){
      var image = animationImages[count];
      elm.src = "/image/" + image + ".png";
      count++;
      self.animationCount++;
      if (count >= animationImages.length) count = 0;
      if (self.animationStopCount && self.animationCount > self.animationStopCount) {
        self.stopAnimation();
      }
    }, self.animationTick);
  }
};
function stopAnimation(e){
  if (this.t) {
    clearInterval(this.t);
    this.t = null;
    document.getElementById(this.elmId).src = this.normalImage;
    this.animationCount = 0;
  }
}

var Screen = {
  status: '',
  wFactor: 1,
  hFactor: 1,
  t: null,
  elmId: 'screen',
  normalImage: '/image/screen_blank.png',
  animationCount: 0,
  animationTick: 500
};
Screen.startSendingAnimation = _.bind(startAnimation, Screen, ['screen_post1', 'screen_post2']);
Screen.startOkAnimation = _.bind(startAnimation, Screen, ['screen_ok1', 'screen_ok2']);
Screen.stopAnimation = _.bind(stopAnimation, Screen, null);

var Touch = {
  status: '',
  t: null,
  elmId: 'touch',
  normalImage: "/image/anim_touch_transparent.png",
  animationStopCount: 4,
  animationCount: 0,
  animationTick: 100,
  fixPosition: function(e){
    console.log(e.clientX + ':' + e.clientY);
    var elm = document.getElementById("touch");
    elm.style.left = e.clientX - images.touch.w * Screen.wFactor / 2;
    elm.style.top = e.clientY - images.touch.h * Screen.hFactor / 2;
  }
};
Touch.startAnimation = _.bind(startAnimation, Touch, ['anim_touch_001', 'anim_touch_002', 'anim_touch_003', 'anim_touch_004']);
Touch.stopAnimation = _.bind(stopAnimation, Touch, null);

var buttonUrl = function(label, status){
  return "button_" + label + "_" + status + ".png";
}
var images = {
  screen: {
    url: function(label, status){ return "screen_" + status + ".png" },
    x: 42,
    y: 46,
    w: 301,
    h: 218,
  },
  touch: {
    url: function(label, status){ return "anim_touch_" + status + ".png" },
    x: 0,
    y: 0,
    w: 150,
    h: 150
  },
  batari: {
    msg_id: 'basic_batari',
    url: buttonUrl,
    x: 81,
    y: 292,
    w: 147,
    h: 152
  },
  gabari: {
    msg_id: 'basic_gabari',
    url: buttonUrl,
    x: 98,
    y: 443,
    w: 106,
    h: 111
  },
  furoha: {
    msg_id: 'basic_furoha',
    url: buttonUrl,
    x: 228,
    y: 292,
    w: 133,
    h: 143
  },
  furoa: {
    msg_id: 'basic_furoa',
    url: buttonUrl,
    x: 238,
    y: 438,
    w: 156,
    h: 129
  }
};

function buttonClicked(text){
  var url = '/post_to_twitter';
  var xhr = new XMLHttpRequest();
  xhr.open('POST', url, true);
  xhr.setRequestHeader('Content-Type', 'application/x-www-form-urlencoded');
  xhr.onreadystatechange = function(){
    if (xhr.readyState === 4) {
      var data = xhr.responseText;
      Screen.stopAnimation();
      Screen.startOkAnimation();
      setTimeout(function(){
        Screen.stopAnimation();
      }, 4000);
//      window.alert('done');
    }
  }
  xhr.send([
    'msg_id=' + text,
    'oauth_token=' + OAuth.oauth_token,
    'oauth_token_secret=' + OAuth.oauth_token_secret,
    'oauth_access_token=' + OAuth.oauth_access_token,
    'oauth_access_token_secret=' + OAuth.oauth_access_token_secret,
  ].join('&'));
  Screen.startSendingAnimation();
}
document.onclick = function(){
// タッチアニメーションはスクリーン全体に対して実行
  Touch.startAnimation(window.event);
}

function imageHtml(label, imageStatus) {
  var image = images[label];
  var x = image.x * Screen.wFactor;
  var y = image.y * Screen.hFactor;
  var w = image.w * Screen.wFactor;
  var h = image.h * Screen.hFactor;
  var clickHandler = (image.msg_id) ? 'onclick="javascript:buttonClicked(\'' + image.msg_id + '\')" ' : '';
  var html = [
    '<img id="' + label + '" ',
    clickHandler,
    'src="/image/' + image.url(label, imageStatus) + '"',
    'style="position:absolute; padding:0; margin:0; left:'+x+'px; top:'+y+'px; width:'+w+'px; height:'+h+'px" ',
    ' />'
  ].join('');
  return html;
}

function setup(){
  var bodyOriginalWidth = 438;
  var bodyOriginalHeight = 600;
  var width = document.width;
  var height = document.height;
  Screen.wFactor = width / bodyOriginalWidth;
  Screen.hFactor = height / bodyOriginalHeight;
  var html = imageHtml('screen', 'blank');
  html += [
    'batari',
    'gabari',
    'furoha',
    'furoa',
  ].map(function(label){ return imageHtml(label, 'off') }).join('');
  html += imageHtml('touch', 'transparent');
  var elmTarget = document.getElementById('keitaibody');
  elmTarget.innerHTML = html;
  setupOAuth();
}
//function resize(){} PC向けやる気あるなら実装する

window.onload = setup;
