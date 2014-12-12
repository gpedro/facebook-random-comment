$(document).ready(function() {

	$('#container').hide();
	$('#login').click(function() {
		FB.getLoginStatus(function(response) {
			if(response.status == 'connected') {
				FB.logout(function(){
					$('#name').text('Visitante');
					$('#login').text('entrar');
					$('#container').hide();
				});
			} else {
				FB.login(function(response) {
					checkLoginState();
				});
			}

			checkLoginState();
		}, { scope: 'user_groups,publish_actions'});
	});
	var k = 0;
	var members = {};
	var makeProfile = function(id, name, message) {
		members[k] = {'id': id, 'name': name};
		var size = 126 + k;
		return '<div class="media"><a class="pull-left" href="http://facebook.com/' + id + '"><img class="media-object" src="http://lorempixel.com/' + size + '/' + size + '/cats/" width="64" height="64" alt="' + name + '"></a><div class="media-body"><a href="http://facebook.com/' + id + '" alt="' + name + '"><h4 class="media-heading">' + name + ' #' + k + '</h4></a>' + message + '</div></div>';
	};

	var callApi = function(addr, method) {
		FB.api(addr, 'get', undefined, function(response) {
			if (!response || response.error) {
				alert('Error occured!');
			} else {
				callback(response);
			}
		});
	};

	var next = 0;

	var callback = function(response) {
		var comments = (next) ? response : response.comments;
		for (var i = 0; i < comments.data.length; i++) {
			k++;
			var message = comments.data[i];
			$(makeProfile(message.from.id, message.from.name, message.message)).appendTo('#comments');
		};

		if(typeof(comments.paging.next) == 'undefined') {
			console.log(JSON.stringify(members));
			return;
		} else {
			next = 1;
			callApi(comments.paging.next, 'get');
		}
	};

	var getComments = function(next) {
		var post = $('#post');
		callApi('/' + post.val(), 'get', function(response) {
			$('#public').html(response.message);
			callback(response);
		});
	};

	$('#send').click(function(e) {
		e.preventDefault();
		//var body = {};
		var post = $('#post');
		//var link = $('#link');

		if(post.val().length == 0) {
			alert('Digite o número da publicação.');
			post.focus();
			return;
		}
		getComments();
	});

	var checkLoginState = function() {
		FB.getLoginStatus(function(response) {
			statusChangeCallback(response);
		});
	}

	var getData = function() {
		FB.api('/me?fields=name', function(response) {
			$('#name').text(response.name);
			$('#login').text('sair');
		});
	};

	var statusChangeCallback = function(response) {
		if(response.status == 'connected') {
			getData();
		} else if (response.status == 'not_authorized') {
			$('#status').text('Falha ao tentar conectar. Acesso não autorizado');
		} else {
			$('#status').text('Você não está conectado no Facebook.')
		}
	};

	$.ajaxSetup({ cache: true });
	$.getScript('//connect.facebook.net/pt_BR/all.js', function(){
		FB.init({
			appId: '833736903305717',
		});
		FB.getLoginStatus(statusChangeCallback);
	});
});
