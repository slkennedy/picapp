(function (){
	'use strict';

	window.App = {};

	App.Models = {};
	App.Views = {};
	App.Collections = {};

////////////////Models///////
////////////////////////////
	
	App.Models.Photo = Parse.Object.extend('Photo');

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
			'newPost': 'newPost',
			'yourPhotos' : 'yourPhotos'
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
		},

		yourPhotos: function (){	
			$('.main-section').empty();			
			var query = new Parse.Query(App.Models.Photo);
			var collection = query.collection();
			collection.fetch();
			new App.Views.YourPhotosView({
				collection: collection,
				// el: '.main-section'
			});	
		}
	});

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
			Parse.User.logOut();
			this.render();
		},

		render: function (){
			alert('thanks for logging out');
		}
	});

	App.Views.NewPostView = Parse.View.extend ({
		tagName: 'form',
		className: 'post-form',
		template: _.template($('#templates-new-post').text()),

		events: {
			'click .button': 'save'
		},

		save: function(e){
			var self = this;
			e.preventDefault();
			var $uploadFile = $('.upload-image')[0];
			if ($uploadFile.files.length > 0){
				var file = $uploadFile.files[0];
			 	var parseFile = new Parse.File(file.name, file);

			 	parseFile.save().then(function(){
					self.model.set('image', parseFile.url());
					self.model.set ({
						photographer: Parse.User.current()
					});
					self.model.save(null, {
				 		success: function (parseFile){
				 			App.Route.navigate('yourPhotos', {trigger:true});
			 			},
				 		error: function (parseFile, error){
				 			console.log('error starts');
				 			alert('failed: '+error.message);
				 			console.log('error finishes');
				 		}
			 		});
			 	});
			}
		},

		initialize: function (){
			console.log('initialize starts');			
			this.model = new App.Models.Photo();
			$('.main-section').append(this.el);
			this.render();
			console.log('Initialize finishes');
		},

		render: function (){
			console.log('render starts');			
			this.$el.append(this.template);
			console.log('render finishes');
		},

		// logout: function (e){
		// 	e.preventDefault();
		// 	console.log('test');
		// 	var currentUser = Parse.User.current();
		// 	console.log(currentUser);
		// },

	});

	App.Views.YourPhotosView = Parse.View.extend ({
		tagName: 'ul',
		className: 'your-images',

		initialize: function (){
			console.log('your photos initialize start');
			$('.main-section').append(this.el);
			this.render();
			this.collection.on('reset', this.render, this);
			console.log('your photos initialize finish');
		},

		render: function (){
			console.log('your photos render start');
			// this.$el.empty();
			this.collection.each(this.renderChildren, this);			
			console.log('your photos render finish');
		},

		renderChildren: function (photo){
			console.log('your photos renderchild start');
			new App.Views.YourView ({
				model:photo
			});
			console.log('your photos renderchild finish');
		}
	});

	App.Views.YourView = Parse.View.extend ({
		tagName: 'li',
		className: 'image',
		template: _.template($('#templates-your-photos').text()),

		initialize: function (){
			console.log('your view initialize start');
			$('.your-images').append(this.el);
			this.render();
			console.log('your view intiialize finishes');
		},

		render: function (){
			console.log('your view render start');
			console.log(this.model.toJSON());
			this.$el.append(this.template({photo: this.model.toJSON()}));
			console.log('your view render finishes');
		}
	})

////////////////Glue Code/////	
/////////////////////////////

	$(document).ready(function (){
		Parse.initialize("vVC1xm387FRV3TVHQF0hYaSBIFuThELIf74SnM7K", "6caMAmTXeoGZSP0oQWD3H22QfAK4Sjl1QU5VBbtG");
		App.Route = new App.Router();
		Parse.history.start();
	});


})();