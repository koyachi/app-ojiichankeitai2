function clearCache(){
  var keys = ['oauth_token', 'oauth_token_secret', 'oauth_access_token', 'oauth_access_token_secret'];
  keys.forEach(function(k){
    localStorage.removeItem(k);
  });
}

clearCache();
