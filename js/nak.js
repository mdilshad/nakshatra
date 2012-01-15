$(function() {
				var $nak_background	= $('#nak_background'),
				$nak_bgimage		= $nak_background.find('.nak_bgimage'),
				$nak_loading		= $nak_background.find('.nak_loading'),
				
				$nak_content		= $('#nak_content'),
				$title			= $nak_content.find('h1'),
				$menu			= $nak_content.find('.nak_menu'),
				$mainNav		= $menu.find('ul:first'),
				$menuItems		= $mainNav.children('li'),
				totalItems		= $menuItems.length,
				$ItemImages		= new Array();
				
				/* 
				for this menu, we will preload all the images. 
				let's add all the image sources to an array,
				including the bg image
				*/
				$menuItems.each(function(i) {
					$ItemImages.push($(this).children('a:first').attr('href'));
				});
				$ItemImages.push($nak_bgimage.attr('src'));
					  
				
				var Menu 			= (function(){
					var init				= function() {
						loadPage();
						initWindowEvent();
					},
					loadPage			= function() {
						/*
							1- loads the bg image and all the item images;
							2- shows the bg image;
							3- shows / slides out the menu;
							4- shows the menu items;
							5- initializes the menu items events
						 */
						$nak_loading.show();//show loading status image
						$.when(loadImages()).done(function(){
							$.when(showBGImage()).done(function(){
								//hide the loading status image
								$nak_loading.hide();
								$.when(slideOutMenu()).done(function(){
										$.when(toggleMenuItems('up')).done(function(){
										initEventsSubMenu();
									});
								});
							});
						});
					},
					showBGImage			= function() {
						return $.Deferred(
						function(dfd) {
							//adjusts the dimensions of the image to fit the screen
							adjustImageSize($nak_bgimage);
							$nak_bgimage.fadeIn(1000, dfd.resolve);
						}
					).promise();
					},
					slideOutMenu		= function() {
						/* calculate new width for the menu */
						var new_w	= $(window).width() - (4*$title.outerWidth(true));
						return $.Deferred(
						function(dfd) {
							//slides out the menu
							$menu.stop()
							.animate({
								width	: new_w + 'px'
							}, 700, dfd.resolve);
						}
					).promise();
					},
						/* shows / hides the menu items */
						toggleMenuItems		= function(dir) {
						return $.Deferred(
						function(dfd) {
							/*
							slides in / out the items. 
							different animation time for each one.
							*/
							$menuItems.each(function(i) {
										var $el_title	= $(this).children('a:first'),
											marginTop, opacity, easing;
										if(dir === 'up'){
											marginTop	= '0px';
											opacity		= 1;
											easing		= 'easeOutBack';
										}
										else if(dir === 'down'){
											marginTop	= '60px';
											opacity		= 0;
											easing		= 'easeInBack';
						}
								$el_title.stop()
								.animate({
													marginTop	: marginTop,
													opacity		: opacity
												 }, 200 + i * 200 , easing, function(){
									if(i === totalItems - 1)
										dfd.resolve();
								});
							});
						}
					).promise();
					},
					initEventsSubMenu	= function() {
						$menuItems.each(function(i) {
							var $item		= $(this), // the <li>
							$el_title	= $item.children('a:first'),
							el_image	= $el_title.attr('href'),
							$sub_menu	= $item.find('.nak_subitem'),
							$nak_close	= $sub_menu.find('.nak_close');
							
							/* user clicks one item from menu*/
							$el_title.bind('click.Menu', function(e) {
									$.when(toggleMenuItems('down')).done(function(){

									openSubMenu($item, $sub_menu, el_image);
								});
								return false;
							});
							/* closes the submenu */
							$nak_close.bind('click.Menu', function(e) {
								closeSubMenu($sub_menu);
								return false;
							});
						});
					},
					openSubMenu			= function($item, $sub_menu, el_image) {
						$sub_menu.stop()
						.animate({
							height		: '400px',
							marginTop	: '-300px'
						}, 400, function() {
										//the bg image changes
							showItemImage(el_image);
						});
					},
						/* changes the background image */
					showItemImage		= function(source) {
							//if its the current one return
						if($nak_bgimage.attr('src') === source)
							return false;
								
						var $itemImage = $('<img src="'+source+'" alt="Background" class="nak_bgimage"/>');
						$itemImage.insertBefore($nak_bgimage);
						adjustImageSize($itemImage);
						$nak_bgimage.fadeOut(1500, function() {
							$(this).remove();
							$nak_bgimage = $itemImage;
						});
						$itemImage.fadeIn(1500);
					},
					closeSubMenu		= function($sub_menu) {
						$sub_menu.stop()
						.animate({
							height		: '0px',
							marginTop	: '0px'
						}, 400, function() {
							//show items
										toggleMenuItems('up');
						});
					},
						/*
						on window resize, ajust the bg image dimentions,
						and recalculate the menus width
						*/
					initWindowEvent		= function() {
						/* on window resize set the width for the menu */
						$(window).bind('resize.Menu' , function(e) {
							adjustImageSize($nak_bgimage);
							/* calculate new width for the menu */
							var new_w	= $(window).width() - (4*$title.outerWidth(true));
							$menu.css('width', new_w + 'px');
						});
					},
						/* makes an image "fullscreen" and centered */
					adjustImageSize		= function($img) {
						var w_w = $(window).width(),
						w_h	= $(window).height(),
						r_w	= w_h / w_w,
						i_w	= $img.width(),
						i_h	= $img.height(),
						r_i	= i_h / i_w,
						new_w,new_h,
						new_left,new_top;
							
						if(r_w > r_i){
							new_h	= w_h;
							new_w	= w_h / r_i;
						}
						else{
							new_h	= w_w * r_i;
							new_w	= w_w;
						}
							
						$img.css({
							width	: new_w + 'px',
							height	: new_h + 'px',
							left	: (w_w - new_w) / 2 + 'px',
							top		: (w_h - new_h) / 2 + 'px'
						});
					},
						/* preloads a set of images */
					loadImages			= function() {
						return $.Deferred(
						function(dfd) {
							var total_images 	= $ItemImages.length,
							loaded			= 0;
							for(var i = 0; i < total_images; ++i){
								$('<img/>').load(function() {
									++loaded;
									if(loaded === total_images)
										dfd.resolve();
								}).attr('src' , $ItemImages[i]);
							}
						}
					).promise();
					};
						
					return {
						init : init
					};
				})();
			
				/*
			call the init method of Menu
				 */
				Menu.init();
			});
