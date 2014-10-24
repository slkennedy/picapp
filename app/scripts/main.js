(function (){
	'use strict';

	window.App = {};

	App.Models = {};
	App.Views = {};
	App.Collections = {};

////////////////Routers///////
/////////////////////////////
	App.Router = Parse.Router.extend ({
		initialize: function (){
		},

		routes: {
			'':'logIn',
			'login':'logIn',
			'create': 'create',
			'logout': 'logout',
			'newPost': 'newPost'
		},

		logIn: function (){
			$('.main-section').empty();
			new App.Views.LoginView();
		},

		create: function (){
			$('.main-section').empty();
			new App.Views.CreateAccountView();
		},

		logout: function (){
			$('.main-section').empty();
			new App.Views.LogoutView();
		},

		newPost: function (){
			$('.main-section').empty();
			new App.Views.NewPostView();
		}
	});

////////////////Models///////
////////////////////////////

	App.Models.Photo = Parse.Object.extend('Photo');

////////////////Views////////	
////////////////////////////

	App.Views.CreateAccountView = Parse.View.extend ({
		tagName: 'form',
		className: 'create-form',
		template: _.template($('#templates-create-account').text()),
		
		events: {
			'click .button': 'createAccount'
		},

		createAccount: function (e){
			e.preventDefault();
			var user = new Parse.User ();
			user.set ('email', $('.email').val());
			user.set ('username', $('.username').val());
			user.set ('password', $('.password').val());
			user.signUp(null, {
				success: function (user){
					// App.navigate('login', {trigger: true});
					console.log('user created!');
				},
				error: function (){
					alert('error: '+error.code+' '+error.message);
				}
			});
		},

		initialize: function (){
			$('.main-section').append(this.el);
			this.render();
		},

		render: function (){
			this.$el.html(this.template);
		}
	});

	App.Views.LoginView = Parse.View.extend ({
		tagName: 'form',
		className: 'login-form',
		template: _.template($('#templates-login').text()),

		events: {
			'click .button': 'login'
		},

		login: function (e){
			e.preventDefault();
			Parse.User.logIn(
				$('.username').val(),
				$('.password').val(), {
					success: function (user){
						App.Route.navigate('newPost', {trigger:true});
					}, 
					error: function (user, error){
						console.log(error);
					}
				});
		},
		
		initialize: function (){
			$('.main-section').append(this.el);
			this.render();
		},

		render: function (){
			this.$el.html(this.template);
		}
	});

	App.Views.LogoutView = Parse.View.extend ({


		initialize: function (){
			console.log('initialize');
			this.render();
		},

		render: function (){
			console.log('render');
		}
	});

	App.Views.NewPostView = Parse.View.extend ({
		tagName: 'form',
		className: 'post-form',
		template: _.template($('#templates-new-post').text()),

		events: {
			'click .logout': 'logout',
			'change input[type=file]': 'uploadImage',
			'click .button': 'save'
		},

		uploadImage: function (e){
			console.log('uploadImage starts');
			var self = this;
			e.preventDefault();
			var $uploadFile = $('.upload-image')[0];
			if ($uploadFile.files.length > 0){
				var file = $uploadFile.files[0];
				console.log(file);
			 	var parseFile = new Parse.File(file.name, file);

			 	parseFile.save().then(function(){
					self.model.set('image', parseFile.url());
			 	});
			}
			console.log('uploadImage finishes');
		},

		save: function(){
			this.model.save();
		},

		initialize: function (){
			console.log('initialize starts');			
			this.model = new App.Models.Photo();
			// _.bindAll(this, 'render');
			// this.model.on('click', this.render);
			$('.main-section').append(this.el);
			this.render();
			console.log('Initialize finishes');
		},

		render: function (){
			console.log('render starts');			
			this.$el.append(this.template);
			console.log('render finishes');
		},

		logout: function (e){
			e.preventDefault();
			console.log('test');
			Parse.User.logOut();
			var currentUser = Parse.User.current();
			console.log(currentUser);
		},

	});


////////////////Glue Code/////	
/////////////////////////////

	$(document).ready(function (){
		Parse.initialize("vVC1xm387FRV3TVHQF0hYaSBIFuThELIf74SnM7K", "6caMAmTXeoGZSP0oQWD3H22QfAK4Sjl1QU5VBbtG");
		App.Route = new App.Router();
		Parse.history.start();
	});


})();