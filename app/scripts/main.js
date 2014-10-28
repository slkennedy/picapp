(function (){
	'use strict';

	window.App = {};

	App.Models = {};
	App.Views = {};
	App.Collections = {};

////////////////Models///////
////////////////////////////
	
	App.Models.Photo = Parse.Object.extend('Photo');

// ////////////////Collections///
// /////////////////////////////

// 	App.Collections.Photos = Parse.Collection.extend ({
// 		model: App.Models.Photo
// 	});

////////////////Routers///////
/////////////////////////////
	App.Router = Parse.Router.extend ({
		initialize: function (){
			this.render();
		},

		render: function (){
			// new App.Views.SubheaderView({
			// 	model: App.Models.Users
			// });
		},

		routes: {
			'':'logIn',
			'login':'logIn',
			'create': 'create',
			'logout': 'logout',
			'newPost': 'newPost',
			'yourPhotos' : 'yourPhotos',
			'allPics' : 'allPics'
			// 'others' : 'othersPhotos'
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
			query.equalTo('photographer', Parse.User.current());
			var collection = query.collection();
			collection.fetch();
			new App.Views.YourPhotosView({
				collection: collection,
				model: App.Models.Photo
				// el: '.main-section'
			});	
		},

		// othersPhotos: function (){
		// 	// var userQuery = new Parse.Query(App.Models.User);
		// 	// userQuery.equalTo('objectId', App.Photo.photographer);
		// 	console.log('hey');
		// 	var photoQuery = new Parse.Query(App.Models.Photo);
		// 	photoQuery.equalTo('photographer', );
		// 	var collection = photoQuery.collection();
		// 	collection.fetch();
		// 	new App.Views.OthersPhotosView ({
		// 		collection:collection
		// 	});
		// }

		allPics: function (){
			$('.main-section').empty();
			var query = new Parse.Query(App.Models.Photo);
			query.exists('image');
			var collection = query.collection();
			collection.fetch();
			new App.Views.allPicsView({
				model: App.photo.model,
				collection: collection
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
					Parse.User.logIn(
						$('.username').val(),
						$('.password').val(), {
							success: function(){
								App.Route.navigate('yourPhotos', {trigger: true});
								console.log('user created!');
							},
							error: function (){
								App.Route.navigate('login', {trigger: true});
							}
						}
					)
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
			'click .button': 'login',
			// 'click .resetPassword' : 'resetPassword'
		},

		login: function (e){
			e.preventDefault();
			Parse.User.logIn(
				$('.username').val(),
				$('.password').val(), {
					success: function (user){
						App.Route.navigate('yourPhotos', {trigger:true});
					}, 
					error: function (user, error){
						console.log(error);
					}
				});
		},

		// resetPassword: function (){
		// 	Parse.User.requestPasswordReset('email', {
		// 		success: function (){
		// 			alert('You have been emailed a link to reset your password');
		// 		},
		// 		error: function (error){
		// 			alert("Error: "+ error.message);
		// 		}
		// 	});
		// },
		
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
			App.Route.navigate('login', {trigger:true});
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
						photographer: Parse.User.current(),
					});

					self.model.save(null, {
				 		success: function (parseFile){
				 			App.Route.navigate('yourPhotos', {trigger:true});
			 			},
				 		error: function (parseFile, error){
				 			alert('failed: '+error.message);
				 		}
			 		});
			 	});
			}
		},

		initialize: function (){
			this.model = new App.Models.Photo();
			$('.main-section').append(this.el);
			this.render();
		},

		render: function (){
			this.$el.append(this.template);
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
		template: _.template($('#templates-your-photo-header').text()),

		initialize: function (){
			$('.main-section').append(this.el);
			this.render();
			this.collection.on('reset', this.render, this);
		},

		render: function (){
			this.$el.prepend(this.template);	
			this.collection.each(this.renderChildren, this);		
		},

		renderChildren: function (photo){
			new App.Views.YourView ({
				model:photo
			});
		}
	});

	App.Views.YourView = Parse.View.extend ({
		tagName: 'li',
		className: 'image',
		template: _.template($('#templates-your-photos').text()),

		initialize: function (){
			$('.your-images').append(this.el);
			this.render();
		},

		render: function (){
			this.$el.append(this.template({photo: this.model.toJSON()}));
		}
	});

	// App.Views.OthersPhotosView = Parse.View.extend ({
	// 	tagName: 'ul',
	// 	className: 'your-images',
	// 	template: _.template($('#templates-your-photo-header').text()),

	// 	initialize: function (){
	// 		console.log('othersphotosview initialize starts');
	// 		$('.main-section').append(this.el);
	// 		this.render();
	// 		this.collection.on('reset', this.render, this);
	// 		console.log('othersphotosview initialize ends');
	// 	},

	// 	render: function (){
	// 		console.log('othersphotosview render starts');
	// 		this.$el.prepend(this.template);	
	// 		this.collection.each(this.renderChildren, this);	
	// 		console.log('othersphotosview render ends');
	// 	},

	// 	renderChildren: function (photo){
	// 		console.log('othersphotosview renderChildren starts');
	// 		new App.Views.OthersView ({
	// 			model:photo
	// 		});
	// 		console.log('othersphotosview renderChildren ends');
	// 	}
	// });

	// App.Views.OthersView = Parse.View.extend ({
	// 	tagName: 'li',
	// 	className: 'image',
	// 	template: _.template($('#templates-your-photos').text()),

	// 	initialize: function (){
	// 		console.log('othersview initialize starts');
	// 		console.log(this.model);
	// 		$('.your-images').append(this.el);
	// 		this.render();
	// 		console.log('othersview initialize ends');
	// 	},

	// 	render: function (){
	// 		console.log('othersview render starts');
	// 		console.log(this.model);
	// 		this.$el.append(this.template({photo: this.model.toJSON()}));
	// 		console.log('othersview render ends');
	// 	}
	// });
	
	App.Views.allPicsView = Parse.View.extend ({
		template: _.template($('#templates-all-pics').text()),

		initialize: function (){
			console.log(this.collection);
			console.log(this);
			console.log(this.model);
			console.log(JSON.stringify(this.collection));
			// $('.main-section').append(this.el);
			this.render();
		},

		render: function (){
			this.$el.append(this.template);
		}
	});

////////////////Glue Code/////	
/////////////////////////////

	$(document).ready(function (){
		Parse.initialize("vVC1xm387FRV3TVHQF0hYaSBIFuThELIf74SnM7K", "6caMAmTXeoGZSP0oQWD3H22QfAK4Sjl1QU5VBbtG");
		App.Route = new App.Router();
		Parse.history.start();
	});


})();