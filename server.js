var express = require('express')
  , OAuth = require('oauth').OAuth
  , conf = require('node-config')
  , mime = require('mime')
  , app = express.createServer();

mime.define({
  'text/cache-manifest': ['manifest']
});

conf.initConfig(function(err){
  if (err) throw err;

  var callbackUrl = ['http://', conf.host, ':', conf.port, '/login'].join('');
  var oauth = new OAuth("http://twitter.com/oauth/request_token",
                        "http://twitter.com/oauth/access_token",
                        conf.twitter.consumer,
                        conf.twitter.consumer_secret,
                        "1.0A",
                        callbackUrl,
                        "HMAC-SHA1");

  function postToTwitter(req, res, text) {
    console.log("[postToTwitter]");
    console.log(JSON.stringify(req.session));
    if (req.session.oauth && req.session.oauth.oauth_token_secret) {
      console.log('  oatuh');
      var oauth_access_token = req.session.oauth.oauth_access_token;
      var oauth_access_token_secret = req.session.oauth.oauth_access_token_secret;
      console.log('  ' + oauth_access_token + ':' + oauth_access_token_secret);
      oauth.post("http://api.twitter.com/1/statuses/update.json",
                 oauth_access_token, oauth_access_token_secret,
                 {"status":text}, function(error, data){
                   console.log('  getProtectedResource handler');
                   if (error) {
                     console.log('    error:' + JSON.stringify(error));
                     res.send(error);
                   } else {
                     console.log('    ok');
                     res.send('ok');
                   }
                 });
    } else {
      res.redirect('/signin/twitter');
    }
  }

  var message = {
    'basic_batari': 'バタリ',
    'basic_gabari': 'ガバリ',
    'basic_furoha': 'フロハ',
    'basic_furoa': 'フロア',
//    '': '',
  };

  app.configure(function(){
    [express.staticProvider(__dirname + '/static'),
     express.cookieDecoder(),
     express.bodyDecoder(),
     express.session({
       secret: 'ooojiiichankeitai2',
     })
    ].forEach(function(m){
      app.use(m);
    });
    app.set('view engine', 'haml');
    app.set('views', __dirname + '/views');
  });

  app.get('/', function(req, res){
    res.render('index');
  });

  app.get('/login', function(req, res){
    console.log('/login');
    var oauth_token = req.query.oauth_token;
    var oauth_verifier = req.query.oauth_verifier;
    console.log('o_token = ' + oauth_token);
    console.log('o_verifier = ' + oauth_verifier);
    console.log(JSON.stringify(req.session));
    if (oauth_token && oauth_verifier && req.session.oauth) {
      console.log('authenticateDDD');
      oauth.getOAuthAccessToken(oauth_token,
                                null,
                                oauth_verifier,
                                function(error, oauth_access_token, oauth_access_token_secret, results) {
                                  console.log('  getOauthAccessToken');
                                  if (error) {
                                    console.log('    error');
                                    res.send(error, 500);
                                  } else {
                                    console.log('    ok');
                                    req.session.user = results.screen_name;
                                    req.session.oauth.oauth_access_token = oauth_access_token;
                                    req.session.oauth.oauth_access_token_secret = oauth_access_token_secret;
                                    req.session.oauth.access_token_results = results;
                                    res.redirect('/ojiichankeitai2');
                                  }
                                });
    } else {
      console.log('authenticate');
      oauth.getOAuthRequestToken(function(error, oauth_token, oauth_token_secret, results){
        if (error) {
          res.send(error, 500);
        } else {
          req.session.oauth = {
            oauth_token: oauth_token,
            oauth_token_secret: oauth_token_secret,
            request_token_results: results
          };
          res.redirect('https://api.twitter.com/oauth/authorize?oauth_token=' + oauth_token);
        }
      });
    }
  });
  app.get('/logout', function(req, res){
    req.session.destroy(function(){
      res.redirect('/');
    });
  });

  app.get('/ojiichankeitai2', function(req, res){
    var token = '';
    var token_secret = '';
    var access_token = '';
    var access_token_secret = '';
    if (req.session.oauth &&
        req.session.oauth.oauth_token &&
        req.session.oauth.oauth_token_secret &&
        req.session.oauth.oauth_access_token &&
        req.session.oauth.oauth_access_token_secret) {
      token = req.session.oauth.oauth_token;
      token_secret = req.session.oauth.oauth_token_secret;
      access_token = req.session.oauth.oauth_access_token;
      access_token_secret = req.session.oauth.oauth_access_token_secret;
    }
    res.render('ojiichankeitai2', {
      locals: {
        user: req.session.user,
        oauth_token: token,
        oauth_token_secret: token_secret,
        oauth_access_token: access_token,
        oauth_access_token_secret: access_token_secret
      }
    });
  });

  app.post('/post_to_twitter', function(req, res){
    console.log('/post_to_twitter');
    console.log(JSON.stringify(req.params));
    console.log(JSON.stringify(req.session));
    console.log(JSON.stringify(req.body));
    var msg_id = req.body.msg_id;
    if (message[msg_id]) {
      if (req.body.oauth_token &&
          req.body.oauth_token_secret &&
          req.body.oauth_access_token &&
          req.body.oauth_access_token_secret) {
        if (!req.session.oauth) {
          req.session.oauth = {};
        }
        req.session.oauth.oauth_token = req.body.oauth_token;
        req.session.oauth.oauth_token_secret = req.body.oauth_token_secret;
        req.session.oauth.oauth_access_token = req.body.oauth_access_token;
        req.session.oauth.oauth_access_token_secret = req.body.oauth_access_token_secret;
        console.log('  OAUTH TOKEN FROM REQUEST.PARAMS');
      }
      console.log('Post to Twitter: ' + message[msg_id]);
      postToTwitter(req, res, message[msg_id]);
      res.send(message[msg_id]);
    } else {
      res.redirect('/');
    }
  });

  app.listen(process.env.PORT || conf.port);
  console.log('Server running at http"//' + conf.host + ':' + conf.port + '/');
});

