var http = require('http');
var url = require('url');

var server = http.createServer(function(req, res) 
{
  var page = url.parse(req.url).pathname; //Page chargée
  
  res.writeHead(200, {"Content-Type": "text/plain"});
  switch(page)
  {
	  case '/':
	  {
		  res.write("Accueil " + params['prenom']);
		  break;
	  }
	  default:
	  {
		  res.write("Error " + params['prenom']);
		  break;
	  }
  }
  res.end();
});

server.listen(8080);