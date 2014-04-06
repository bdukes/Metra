/* Slidin Menu 
 * Author: Abadi Kurniawan
 * Sliding menu javascript library for mobile device
 * requirement: jQuery
 **/

var swipeMenu = function() {
	var self = this;
	var navbar, navbarToggle, navbarCollapse;
	var movements;
	var currentTouchData;

	/* Tweaks these value to change the animation / behavior of the swipe menu */
	var animationTotalDuration = 0.2;
	var percentageThreshold = 0.1;
	var movementsMaxLength = 2;

	// all options
	var paramBackClass;
	var paramBackText;

	if (!jQuery) {
		throw "jQuery is required";
	}

	navbar = $('.swipe-menu .navbar-nav');
	navbarCollapse = $('.navbar-collapse.swipe-menu');
	navbarToggle = $('button.swipe-menu-toggle');

	// initialize the swipe menu, adding all back link
	var init = function() {
		// grab the params from data-* attribute
		paramBackClass = navbarCollapse.data('swipeBackClass');
		paramBackText = navbarCollapse.data('swipeBackText');

		// init the back nav
		var dropdownMenus = navbar.add(navbar.find('ul.dropdown-menu, ul.navbar-nav'));
		dropdownMenus.each(function(index) {
			var menuItems = $(this).children('li');
			menuItems.each(function(index) {
				var link = $(this).children('a');
				var text = (paramBackText === undefined) ? link.text() : paramBackText;
				var href = link.attr('href');
				if (isLink(href)) {
					// if this is a link, then generate 2 separate <a>
					$(this).children('ul').prepend('<li class="back"><a class="swipe-arrow"><span class="swipe-nav-back glyphicon ' + paramBackClass + '"></span></a><a href="' + href + '">'+ text +'</a></li>');
				} else {
					$(this).children('ul').prepend('<li class="back"><a href="' + href + '"><span class="swipe-nav-back glyphicon ' + paramBackClass + '"></span>'+ text +'</a></li>');
				}
			})
		});
	}

	// reset position to the top most level menu
	var resetToTopLevel = function() {
		if (!isNavbarOpen()) { return true; }

		//console.log('resetToTopLevel');
		// navbar.css('left', 0);
		stopListenToTouchEvent(navbar.find('li'));
		startListenToTouchEvent(navbar.children('li'));
		translate(navbar, 0, 0);
		navbar.find('ul').removeClass('visible');
		navbar.addClass('visible', 'true');
		// navbar.find('.dropdown-menu').hide();
	};

	// hide the navbar when windows is resized, to prevent the collapse.in state to stick on the navbar when windows is resized when navbar is open.
	var hideNavbar = function() {
		if (navbarCollapse.hasClass('in')) {
			////console.log('hideNavbar');
			navbarCollapse.removeClass('in');
			navbarCollapse.addClass('collapse');
			navbarToggle.addClass('collapsed');
		}
	};

	var TouchData = function(touch, menuItem) {
		var self = this;
		self.navbarStartX = navbar.offset().left;
		if (touch) {
			self.touchStartX = touch.pageX;
			self.touchStartY = touch.pageY;
			self.touchStartRelativeX = self.touchStartX - self.navbarStartX;
		}

		self.isVertical = null;
		self.isRight = null;
		self.isMoving = false;

		self.canMove = function() {
			if (!self.isRight) {
				return $(menuItem).children('.dropdown-menu').length > 0;
			} else {
				return $(menuItem).parent('.dropdown-menu').length > 0
			}
		}
	};

	var MovementData = function(touch) {
		var self = this;
		self.time = new Date().getTime();
		self.x = touch.pageX;
		self.y = touch.pageY;
	};

	var isVisible = function(menuItem) {
		// console.log('isVisible:' + menuItem.toArray().toString());
		return true;
		if (menuItem[0].getBoundingClientRect == null) return false;
		var boundingBox = menuItem[0].getBoundingClientRect()
		return boundingBox.left >= 0 || boundingBox.right >= 0;
		// return menuItem.parent().hasClass('visible');
	};

	var touchStartHandler = function(evt) {
		// console.log("touchStartHandler");
		// console.log('touch:' + touch.clientX);
		if (!isNavbarOpen()) { return true; }

		var menuItem = $(evt.target).closest('li');
		if (!isVisible(menuItem)) return;

		var touch = evt.changedTouches[0];
		currentTouchData = new TouchData(touch, this);
		movements = [new MovementData(touch)];
		// console.log("end touchStartHandler");
	};

	var hideSubmenu = function(menuItem) {
		//console.log('hideSubmenu:'+menuItem.children('a').text());
		// navbar.find('ul').removeClass('visible');
		menuItem.parent().children('li').children('.dropdown-menu').removeClass('visible');
	};

	var showSubmenu = function(menuItem) {
		//console.log('showSubmenu:'+menuItem.children('a').text());
		// $(menuItem).parent().find('a').blur();
		menuItem.children('a').focus();
		hideSubmenu(menuItem);
		menuItem.children('ul').addClass('visible');
	};

	var touchMoveHandler = function(evt) {
		// console.log('touchMoveHandler');
		if (!isNavbarOpen()) { return true; }

		var menuItem = $(evt.target).closest('li');
		if (!isVisible(menuItem)) return;

		var touches = evt.changedTouches;
		if (touches.length > 1) return;

		var touch = touches[0];

		if (movements.length === movementsMaxLength) movements.pop();
		movements.unshift(new MovementData(touch));

		var stillDetectingMovements = movements.length < movementsMaxLength;
		
		if (!stillDetectingMovements && currentTouchData.isVertical === null) {
			//console.log('touchMoveHandler1');
			var deltaX = movements[0].x - currentTouchData.touchStartX;
			var deltaY = movements[0].y - currentTouchData.touchStartY;
			currentTouchData.isVertical = Math.abs(deltaY) > Math.abs(deltaX);
			currentTouchData.isRight = !currentTouchData.isVertical && deltaX > 0
		}

		if (!stillDetectingMovements) {
			//console.log('touchMoveHandler2');
			if (!currentTouchData.isVertical) {
				//console.log('touchMoveHandler3');
				evt.preventDefault();
			}

			if (!currentTouchData.isMoving && currentTouchData.canMove()) {
				//console.log('touchMoveHandler4');
				currentTouchData.isMoving = true;

				if (!currentTouchData.isVertical) {
					//console.log('touchMoveHandler5');
					showSubmenu(menuItem);
				} else {
					//console.log('touchMoveHandler6');
					hideSubmenu(menuItem);
				}
			}

		 	if (!currentTouchData.isVertical) {
				//console.log('touchMoveHandler7');
				moveHorizontal(this, touch);
			}			
		}
	};

	var translate = function(navbar, dist, speed) {
		////console.log('translate');
		transformRecalculateWidtHackStart();
		// navbar.css('display', 'inline-block'); // this is a hack to make the browser calculate the nav width correctly after translation

	    navbar.css('webkitTransitionDuration', speed + 's');
	    navbar.css('MozTransitionDuration', speed + 's');
	    navbar.css('msTransitionDuration', speed + 's');
	    navbar.css('OTransitionDuration', speed + 's');
	    navbar.css('transitionDuration', speed + 's');

	    navbar.css("webkitTransform", 'translate(' + dist + 'px,0)' + 'translateZ(0)');
	    navbar.css('msTransform', 'translateX(' + dist + 'px)');
	    navbar.css('MozTransform', 'translateX(' + dist + 'px)'); 
	    navbar.css('OTransform',  'translateX(' + dist + 'px)');
		
		// navbar.css('display', 'inline-block'); // this is a hack to make the browser calculate the nav width correctly after translation	    
	}


	var transformRecalculateWidtHackStart= function() {
		// console.log("transformRecalculateWidtHackStart");
		navbar.css('left', '');
	}

	var transformRecalculateWidtHackEnd = function() {
		// console.log("transformRecalculateWidtHackEnd");
		navbar.css('left', 0);
	}

	var moveHorizontal = function(menuItem, touch) {
		if (!currentTouchData.canMove()) return;

		var newLeft = touch.pageX - currentTouchData.touchStartRelativeX;
		translate(navbar, newLeft, 0);
	};

	var touchCancelHandler = function(evt) {
		// console.log("touchCancelHandler");
		touchEndHandler(evt);
		// console.log("endTouchCancelHandler");
	}

	var touchEndHandler = function(evt) {
		// console.log("touchEndHandler");
		//console.log('touchEndHandler.clientX:' + evt.changedTouches[0].clientX);
		if (!isNavbarOpen()) { return true; }
		
		var movementsLength = movements.length;
		movements = null;
		var menuItem = $(evt.target).closest('li');

		if (!isVisible(menuItem)) {
			// console.log('touchEndHandler.invisible')
			return false;
		}
		
		// this is a tap event
		if (movementsLength < movementsMaxLength) {
			// console.log("touchEndHandler.this is a tap event");
			return true;
		}

		// this is definitely a swipe, prevent the click event.
		//console.log('touchEndHandler.preventDefault');
		evt.preventDefault();
		evt.stopPropagation();

		// when swiping to an empty children
		if (!currentTouchData.canMove()) {
			//console.log('!canMove');
			hideSubmenu(menuItem);
			return false;
		}

		if (!currentTouchData.isVertical) {
			var bodyHeight = document.body.getBoundingClientRect().height;
			// console.log(menuItem);
			var menu = menuItem.parent();
			// console.log(menu);

			var open = percentageOpen(menu);
			if (open < percentageThreshold) {
				closeMenu(menuItem);
			} else {
				if (!currentTouchData.isRight) {
					openMenu(menuItem);
				} else {
					openParent(menuItem);
				}
			}
		}

		// console.log("endTouchEndHandler");
		return false;
	};

	var percentageOpen = function(menu) {
		var currentLeft = menu.offset().left;
		var navWidth = menu.width();
			
		if (!currentTouchData.isRight)
		{
			return 1 - Math.abs((navWidth + currentLeft) / navWidth);
		} else {
			return 1 - Math.abs((navWidth - currentLeft) / navWidth);
		}
	};

	var animationSpeed = function(menu) {
		return (1 - percentageOpen(menu)) * animationTotalDuration;
	}

	var openMenu = function(menuItem) {
		var menu = menuItem.parent();
		stopListenToTouchEvent(menu.children('li'));
		
		// move navbar to the left
		var moveAmount = currentTouchData.navbarStartX - navbar.width();
		translate(navbar, moveAmount, animationSpeed(menu));
		
		navbar.one(whichTransitionEvent(), function() {
			////console.log('openMenu.transitionEvent');
			transformRecalculateWidtHackEnd();
			scrollToMenuTop();
			startListenToTouchEvent(menuItem.children('ul').children('li'));
		});
	};

	var openParent = function(menuItem) {
		//console.log('openParent');
		var menu = menuItem.parent();
		stopListenToTouchEvent(menu.children('li'));
		var parent = menu.parent('.dropdown, .dropdown-submenu').parent();
		
		// move navbar to the left
		var moveAmount = currentTouchData.navbarStartX + navbar.width();
		translate(navbar, moveAmount, animationSpeed(menu));
		
		navbar.one(whichTransitionEvent(), function() {
			//console.log('openParent.transitionEnd');
			menu.removeClass('visible')
			transformRecalculateWidtHackEnd();			
			scrollToMenuTop();
			startListenToTouchEvent(parent.children('li'));
		});
	};

	var closeMenu = function(menuItem) {
		//console.log('closeMenu');
		var menu = menuItem.parent();
		stopListenToTouchEvent(menu.children('li'));

		// move navbar to the right
		var moveAmount = currentTouchData.navbarStartX;
		translate(navbar, moveAmount, animationSpeed(menu));

		navbar.one(whichTransitionEvent(), function() {
			//console.log('closeMenu.transitionEnd');
			hideSubmenu(menuItem);
			startListenToTouchEvent(menu.children('li'));
		});
	};

	var scrollToMenuTop = function() {
		if ($('.swipe-menu .navbar-nav')[0].getBoundingClientRect().top < 0) {
			 $('html,body').animate({scrollTop: navbar.offset().top});
		}
	}

	var navbarToggleClick = function(evt) {
		if (!navbarCollapse.hasClass('in')) {
			resetToTopLevel();
		}
	};

	var nextClickHandler = function(evt) {
		// console.log('nextClickHandler');
		if (!isNavbarOpen()) { return true; }

		if (movements != null && movements.length >= movementsMaxLength) {
			// console.log("nextClickHandler.this is a swipe event");
			return true;
		}

		evt.preventDefault();
		openNextMenu($(evt.target).closest('li'));
	}

	var openNextMenu = function(menuItem) {
		//console.log('nextClick');
		currentTouchData = new TouchData(null, menuItem);
		currentTouchData.isRight = false;
		showSubmenu(menuItem);
		openMenu(menuItem);
		////console.log('done nextClick');	
	};

	var backClickHandler = function(evt) {
		//console.log('backClickHandler');
		if (!isNavbarOpen()) { return true; }

		if (movements != null && movements.length >= movementsMaxLength) {
			//console.log("backClickHandler.this is a swipe event");
			return true;
		}

		evt.preventDefault();
		openPreviousMenu($(evt.target).closest('li'));
	}

	var openPreviousMenu = function(menuItem) {
		//console.log('backClick');
		currentTouchData = new TouchData(null, menuItem);
		currentTouchData.isRight = true;
		openParent(menuItem);
	};

	var whichTransitionEvent = function(){	
	    var t;
	    var el = document.createElement('fakeelement');
	    var transitions = {
	      'transition':'transitionend',
	      'OTransition':'oTransitionEnd',
	      'MozTransition':'transitionend',
	      'WebkitTransition':'webkitTransitionEnd'
	    }

	    for(t in transitions){
	        if( el.style[t] !== undefined ){
	            return transitions[t];
	        }
	    }
	};

	var bounceEffect = function(delta) {
		return 2.5 * Math.pow(delta, 0.5);
	};

	var startListenToTouchEvent = function(menus) {
		menus.each(function(index, item) {
			if (item.addEventListener) {
				item.addEventListener('touchstart', touchStartHandler, false);
				item.addEventListener('touchmove', touchMoveHandler, false);
				item.addEventListener('touchend', touchEndHandler, false);
				item.addEventListener('touchcancel', touchCancelHandler, false);
			}
		});
	};

	var stopListenToTouchEvent = function(menus) {
		menus.each(function(index, item) {
			if (item.addEventListener) {
				item.removeEventListener('touchstart', touchStartHandler, false);
				item.removeEventListener('touchmove', touchMoveHandler, false);
				item.removeEventListener('touchend', touchEndHandler, false);
				item.removeEventListener('touchcancel', touchCancelHandler, false);
			}
		});	
	};

	// just to prevent actual clicking on the nav button
	var preventClick = function(evt) {
		evt.preventDefault();
	};

	var isNavbarOpen = function() {
		return navbarCollapse.hasClass('in');
	}

	var interruptLinkClick = function(evt) {
		// console.log('doClick');
		if (!isNavbarOpen()) {
			return true;
		}

		var target = $(evt.target);
		var href = target.attr('href');
		if (!isLink(href)) {
			evt.preventDefault();
			if (target.closest('li').hasClass('back')) {
				backClickHandler(evt);
			} else {
				nextClickHandler(evt);
			}

			return false;
		}
	}

	// check if the href is a link
	var isLink = function(href) {
		return href !== '#' && href !== '';
	}

	init();

	// document.getElementsByTagName("body")[0].addEventListener("touchstart",function(){});	
	// $(window).resize(hideNavbar);
	$(window).on('orientationchange', hideNavbar);

	startListenToTouchEvent(navbar.children('li'));

	navbar.find('.swipe-nav-next').on('touchend mouseup', nextClickHandler);
	navbar.find('.swipe-nav-back').on('touchend mouseup', backClickHandler);
	navbar.find('.swipe-nav-next').on('click', preventClick);
	navbar.find('.swipe-nav-back').on('click', preventClick);
	navbar.find('a').on('click', interruptLinkClick);

	navbarToggle.on('click', navbarToggleClick);

	resetToTopLevel();
};

jQuery(window).one('load', function() {
	window.swipeMenu = new swipeMenu();	
});