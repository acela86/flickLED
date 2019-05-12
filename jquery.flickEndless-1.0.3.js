/*!
 * jquery.flickEndless  v1.0.3 2013/04/11
 *
 * Copyright (c) 2013 N.Uehara
 * Dual licensed under the MIT and GPL licenses.
 * http://pochi-tools.com
 *
 */

(function($) {
	var flickEndless,
		document = window.document,
		__flickEndless_uid=0;

	$.extend( $.easing, {
		flickEndless_easing: function (x, t, b, c, d) {
			return -c *(t/=d)*(t-2) + b;
		}
	});

	$.fn.flickEndless = flickEndless = function(options) {
		if (typeof options === "string") {
			var args = Array.prototype.slice.call(arguments, 1),
				returnValue = this;

			this.each(function() {
				var instance = $.data(this, 'flickEndless'),
					value = instance && $.isFunction(instance[options]) ?
						instance[options].apply(instance, args) : instance;

				if (value !== instance && value !== undefined) {
					returnValue = value;
					return false;
				}
			});

			return returnValue;
		} else {
			return this.each(function() {
				var instance = $.data(this, 'flickEndless');

				if (instance) {
					$.extend(true, instance.options, options);
					instance.init();
				} else {
					$.data(this, 'flickEndless', new flickEndless.prototype.create(options, this));
				}
			});
		}
	};

	flickEndless.prototype = {
		options: {
			disabled: false,
			vertical: false,
			useCssTansform: true,
			handle: null,
			clickable: null,
			distance: 3,
			ratio: 5,
			hSize: null,
			vSize: null,
			forceTranslate3d: true,
			endless: true,
			increment: 1,
			turn: null,
			duration: 300,
			onClick: null,
			onPageChange: null
		},
		invalidDemand: false,
		prefix: 'ui-flickendless',
		isTouchDevice: ('ontouchend' in document),

		create: function(options, elem) {
			if (elem == window || elem == document || /^(html|body)$/i.test(elem.nodeName)) {
				this.invalidDemand=true;
				return this;
			}

			//! unique id
			__flickEndless_uid++;

			this.options=$.extend({}, this.options, options || {});
			this.element = elem;
			this.$this = $(elem);
			this.$handle= null;
			this.cmdTranslateBefore='translate(';
			this.cmdTranslateAfter=')';
			this.namespace='.'+this.prefix+'_'+__flickEndless_uid;
			this.trannamespace=this.namespace+'_transition';
			this.position = this.$this.css('position');
			this.cloneClass=this.prefix+'_clone',
			this.$handle=$((this.options.handle) ? this.$this.find(this.options.handle).first() : this.$this.children().first());
			this.$originChild=this.$handle.children();

			var $this = this.$this,
				$handle=this.$handle;

			this.orignThisStyle=$this.attr('style');
			this.orignHandlesStyle=$handle.attr('style');

			//! vender judging
			function vender( prop ) {
				var venderPrefix = ['-webkit-', '-moz-', '-o-', '-ms-', ''];
				var $div = $('<div />');
				for(var i=0; i<venderPrefix.length; i++) {
					if (typeof $div.css(venderPrefix[i]+prop) === "string") {
						return venderPrefix[i]+prop;
					}
				}
				return null;
			}
			//! 3d judging
			function has3d() {
			    return ('WebKitCSSMatrix' in window && 'm11' in new WebKitCSSMatrix());
			}

			this.transform=vender('transform');
			this.transition=vender('transition');
			$.support.transform=(this.transform==null) ? false : true;
			$.support.transition=(this.transition==null) ? false : true;
			$.support.transform3d=(has3d()) ? true : false;

			//! since all the procedure was completed, it initializes
			this.init();

		},
		init: function() {
			if(this.invalidDemand) return this;

			this.$handle.attr('style', this.orignHandleStyle);
			this.base={'x':0, 'y':0};
			this.current={'x':0, 'y':0};
			this.viewCount={'x':0, 'y':0};
			this.pageSize={'x':0, 'y':0};
			this.contentSize={'x':0, 'y':0};
			this.contentsCount={'x':0, 'y':0};
			this.contentSizeExpanded={'x':0, 'y':0};
			this.movement={'x':0, 'y':0};
			this.difference=0;
			this.page=0;
			this.lastPage=0;
			this.prevPage=1;
			this.isAminationRunning=false;

			var $this=this.$this,
				$handle=this.$handle,
				viewCount=this.viewCount,
				pageSize=this.pageSize,
				contentSize=this.contentSize,
				contentsCount=this.contentsCount,
				contentSizeExpanded=this.contentSizeExpanded,
				options=this.options,
				cloneClass=this.cloneClass,
				contentSizeMax={'x':0, 'y':0},
				contentsCountMax={'x':0, 'y':0};

			this.clean();
			//! Original element
			this.$originChild=$handle.children();
			//! 0 cases are inapplicable
			if(this.$originChild.length<1) return this;

			var $originChild=this.$originChild;
			//! Size of one page of element
			pageSize.x=(options.hSize) ? this.toInt(options.hSize) : $originChild.eq(0).outerWidth();
			pageSize.y=(options.vSize) ? this.toInt(options.vSize) : $originChild.eq(0).outerHeight();

			//! number in View
			viewCount.x=(pageSize.x==0) ? 0 : Math.ceil($this.width()/pageSize.x);
			viewCount.y=(pageSize.y==0) ? 0 : Math.ceil($this.height()/pageSize.y);

			//! size and number of contents
			var first=$originChild.eq(0).position();
			$originChild.each( function(i) {
				var position=$originChild.eq(i).position();
				if(first.top==position.top) {
					contentsCount.x++;
					contentSize.x+=$(this).outerWidth();
				}
				if(first.left==position.left) {
					contentsCount.y++;
					contentSize.y+=$(this).outerHeight();
				}
			});

			//! the biggest range when I do not roll that I deducted for 1 screen (here)
			contentSizeMax.x=-(contentSize.x-(pageSize.x*viewCount.x));
			contentSizeMax.y=-(contentSize.y-(pageSize.y*viewCount.y));

			//! the biggest count when I do not roll that I deducted for 1 screen (here)
			contentsCountMax.x=contentsCount.x-viewCount.x;
			contentsCountMax.y=contentsCount.y-viewCount.y;

			//! number of pages
			this.lastPage=(options.vertical) ? contentsCount.y : contentsCount.x;

			//! maximum pages when I do not roll
			this.notEndlessLastPage=(options.vertical) ? contentsCountMax.y : contentsCountMax.x;

			//! change to the central page at the time of the rolling
			this.difference=(options.endless) ? options.increment*this.lastPage : 0;

			//! lapel position at the time of the rolling
			var turn=(options.turn) ? this.toInt(options.turn) : Math.ceil((options.increment*this.lastPage)/2);
			this.turnMin=turn;
			this.turnMax=(this.lastPage*(options.increment*2+1))-turn;

			//! add a dummy later
			if(options.endless) {
				var increment=options.increment*2;
				//! at the time of horizontal scrolling
				if(!options.vertical) {
					var width=contentSize.x*(increment+1);
					contentSizeExpanded.x=-(width-(pageSize.x*viewCount.x));
					contentSizeExpanded.y=-contentSize.y;
					$handle.width(width);
				}
				else {
					contentSizeExpanded.x=-contentSize.x;
					contentSizeExpanded.y=-(contentSize.y*(increment+1)-(pageSize.y*viewCount.y));
				}
				for(var i=0;i<increment;i++) {
					$originChild.each(function() {
						$(this).clone().removeAttr('id').addClass(cloneClass).data('origin', this).appendTo($handle);
					});
				}
			}
			else {
				contentSizeExpanded.x=contentSizeMax.x;
				contentSizeExpanded.y=contentSizeMax.y;
			}

			//! transform & transition is not supported.
			if(! $.support.transform || ! $.support.transition) {
				if(options.useCssTansform) this.setOption('useCssTansform', false);
			}
			//! transform3d is not supported.
			if(! $.support.transform3d) {
				if(options.forceTranslate3d) this.setOption('forceTranslate3d', false);
			}
			this.cmdTranslateBefore=(options.forceTranslate3d) ? 'translate3d(' : 'translate(';
			this.cmdTranslateAfter=(options.forceTranslate3d) ? ',0)' : ')';

			$this.css({
				'overflow': 'hidden'
			});
			$handle.css({
				'position': /(absolute|fixed)/.test(this.position) ? this.position : 'relative'
			});

			//! base position
			var axes=$handle.position();
			this.current=(!options.useCssTansform && /(absolute|fixed)/.test(this.position)) ? {x:axes.left, y:axes.top} : {'x':0, 'y':0};
			this.base.x=axes.left;
			this.base.y=axes.top;

			if(!options.disabled) this.enable();

			this.silentGoto(this.prevPage);
			if($.isFunction(options.onPageChange)) {
				var data={
					'target':$originChild,
					'page':1,
					'count':this.lastPage
				};
				setTimeout(function () {
					options.onPageChange.call(data);
				}, 0);
			}

			return this;
		},
		//! enable
		enable: function() {
			if(this.invalidDemand) return this;

			var self=this,
				$handle=this.$handle,
				namespace=this.namespace,
				movement=this.movement,
				current=this.current,
				options=this.options,
				previous={'x':0, 'y':0},
				_transform= this.transform,
				touchstart=false,
				touchmove=false,
				cmdTranslateBefore=this.cmdTranslateBefore,
				cmdTranslateAfter=this.cmdTranslateAfter;

			var $scope=this.$this;
			if($.isFunction(options.onClick)) {
				if(options.clickable) {
					$handle.find(options.clickable).each(function() {
						$(this).bind('touchend'+namespace+' mouseup'+namespace, function(event) {
							if(touchstart) {
								$scope.unbind(namespace);
								touchstart=touchmove=false;
								//! Cancel the link behavior
								event.preventDefault();
								//! event babbling is suspended and it is made not to perform subsequent event hair driers, either further.
								event.stopImmediatePropagation();
								var target=this;
								setTimeout(function () {
									options.onClick.call(target);
								}, 0);
							}
						});
					});
				}
				else {
					$handle.children().each(function() {
						$(this).bind('touchend'+namespace+' mouseup'+namespace, function(event) {
							if(touchstart) {
								$scope.unbind(namespace);
								touchstart=touchmove=false;
								//! Cancel the link behavior
								event.preventDefault();
								//! event babbling is suspended and it is made not to perform subsequent event hair driers, either further.
								event.stopImmediatePropagation();
								var target=$(this).data('origin') || this;
								setTimeout(function () {
									options.onClick.call(target);
								}, 0);
							}
						});
					});
				}
			}

			//! element interruption set up.
			$handle.bind('touchstart'+namespace+' mousedown'+namespace, function(event) {
				//! all are canceled.
				touchstart=touchmove=false;
				$scope.unbind(namespace);

				//! more than 2 fingers ignore.
				if(event.type === 'touchstart' && event.originalEvent.touches.length > 1) return;
				//! left click only
				if(event.type === 'mousedown' && event.which!=1) return;

				event.preventDefault();

				//! single touch
				touchstart=true;
				var e = event.type === 'touchstart' ? event.originalEvent.changedTouches[0] : event;

				movement.x=movement.y=0;
				previous.x=e.pageX;
				previous.y=e.pageY;

				//! because there is cancellation in the middle of an animation, I acquire a coordinate
				self.cancelAnimation();
				//! window interruption is set up.
				windowInterruption();

			});

			//! window interruption is set up.
			function windowInterruption() {
				$scope.bind('touchmove'+namespace+' mousemove'+namespace, function(event) {
					//! more than 2 fingers cancel.
					if (event.type === 'touchmove' && event.originalEvent.touches.length > 1) {
						$scope.unbind(namespace);
						touchstart=touchmove=false;
						return;
					}

					var e = event.type === 'touchmove' ? event.originalEvent.changedTouches[0] : event;
					if(touchstart) {
						event.preventDefault();

						if(options.distance>1) {
							if(Math.abs(previous.x-e.pageX)<options.distance && Math.abs(previous.y-e.pageY)<options.distance) return;
						}

						$handle.trigger('scrollStart', self);
						touchstart=false;
						touchmove=true;
					}
					if(touchmove) {
						event.preventDefault();

						//! quantity of movement (use later)
						movement.x=e.pageX-previous.x;
						movement.y=e.pageY-previous.y;
						if(options.vertical) {
							current.y+=movement.y;
						}
						else {
							current.x+=movement.x;
						}

						previous.x=e.pageX;
						previous.y=e.pageY;
						if(options.useCssTansform) {
							$handle.css(_transform, cmdTranslateBefore+current.x+'px, '+current.y+'px'+cmdTranslateAfter);
						}
						else {
							$handle.css({'left':current.x, 'top':current.y});
						}
					}
				}).bind('touchend'+namespace+' mouseup'+namespace+' mouseleave'+namespace, function(event) {
					$scope.unbind(namespace);
					if(touchmove) {
						self.scrollover(movement.x, movement.y, function() {
							$handle.trigger('scrollEnd', self);
						});
					}

					touchstart=touchmove=false;
				});
			}

			$(window).one('unload', function(event) {
				self.destroy();
			});

			return this;
		},
		disable: function() {
			if(this.invalidDemand) return this;

			this.clean();
			if(this.isAminationRunning) {
				if(this.options.useCssTansform) {
					this.$handle.unbind(this.trannamespace).css(this.transition, 'none');
				}
				else {
					this.$handle.stop(true, false);
				}
				this.isAminationRunning=false;
			}

			return this;
		},
		clean: function() {
			var $this=this.$this,
				options=this.options,
				$handle=this.$handle,
				namespace=this.namespace;

			$(window).unbind(namespace);
			$this.unbind(namespace);
			if($.isFunction(options.onClick)) {
				if(options.clickable) {
					$handle.find(options.clickable).each(function() {
						$(this).unbind(namespace);
					});
				}
				else {
					$handle.children().each(function() {
						$(this).unbind(namespace);
					});
				}
			}
			//! delete clone
			this.$handle.find('.'+this.cloneClass).each(function() {
				$(this).removeData('origin').remove();
			});

			return this;
		},
		locate: function(page, callback) {
			var self=this;
			this.internalLocate(page, true, function() {
				setTimeout( function () {
					if($.isFunction(callback)) callback.call(self);
				}, 0);
			});
		},
		internalLocate: function(page, logical, callback) {
			var self=this,
				$handle=this.$handle,
				options=this.options,
				current=this.current,
				_transform= this.transform,
				_transition=this.transition,
				cmdTranslateBefore=this.cmdTranslateBefore,
				cmdTranslateAfter=this.cmdTranslateAfter;

			var data=this.coordinateTransformation(page, logical);
			this.isAminationRunning=true;
			$handle.trigger('scrollStart', self);
			if(options.useCssTansform) {
				$handle.css(_transition+'-property', _transform)
					.css(_transition+'-duration', options.duration+'ms')
					.css(_transition+'-timing-function', 'ease')
					.css(_transform, cmdTranslateBefore+data.x+'px, '+data.y+'px'+cmdTranslateAfter);
				this.transitionEndHandler(function() {
					self.isAminationRunning=false;
					self.page=data.page;
					current.x=data.x;
					current.y=data.y;
					$handle.trigger('scrollEnd', self);
					self.checkChangeEvents();
					if($.isFunction(callback)) callback.call(self);
				});
			}
			else {
				$handle.stop(true, false).animate({'left':data.x, 'top':data.y}, options.duration, null, function() {
					self.isAminationRunning=false;
					self.page=data.page;
					current.x=data.x;
					current.y=data.y;
					$handle.trigger('scrollEnd', self);
					self.checkChangeEvents();
					if($.isFunction(callback)) callback.call(self);
				});
			}

			return this;
		},
		next: function(page, callback) {
			var self=this,
				movePage=(page || 1);

			if(movePage<1 || movePage>this.lastPage) {
				setTimeout( function () {
					if($.isFunction(callback)) callback.call(self);
				}, 0);
				return this;
			}
			var destLogicalPage=this.page+movePage;
			if(this.options.endless) {
				//! page calculation in prospect of an error
				var info=this.pageInfo(this.current.x, this.current.y);

				if(destLogicalPage>this.lastPage) destLogicalPage=1;
				this.internalLocate((info.physical+movePage), false, function() {
					self.silentGoto(destLogicalPage);
					setTimeout( function () {
						if($.isFunction(callback)) callback.call(self);
					}, 0);
				});
			}
			else {
				if(this.page>this.notEndlessLastPage) return this;
				this.internalLocate(destLogicalPage, true, function() {
					setTimeout( function () {
						if($.isFunction(callback)) callback.call(self);
					}, 0);
				});
			}

			return this;
		},
		prev: function(page, callback) {
			var self=this,
				movePage=(page || 1);

			if(movePage<1 || movePage>this.lastPage) {
				setTimeout( function () {
					if($.isFunction(callback)) callback.call(self);
				}, 0);
				return this;
			}
			var destLogicalPage=this.page-movePage;
			if(this.options.endless) {
				//! page calculation in prospect of an error
				var info=this.pageInfo(this.current.x, this.current.y);
				if(destLogicalPage<1) destLogicalPage+=this.lastPage;
				this.internalLocate((info.physical-movePage), false, function() {
					self.silentGoto(destLogicalPage);
					setTimeout( function () {
						if($.isFunction(callback)) callback.call(self);
					}, 0);
				});
			}
			else {
				if(this.page<2) return this;
				this.internalLocate(destLogicalPage, true, function() {
					setTimeout( function () {
						if($.isFunction(callback)) callback.call(self);
					}, 0);
				});
			}

			return this;
		},
		coordinateTransformation: function(page, logical) {
			var options=this.options,
				current=this.current,
				pageSize=this.pageSize;

			//! logical page revision
			var logicalPage=page%this.lastPage;
			if(logicalPage==0) logicalPage=this.lastPage;
			if(!options.endless && logicalPage>this.notEndlessLastPage) {
				logicalPage=this.notEndlessLastPage+1;
			}
			//! revise it to the center
			var destPage=(!logical || !options.endless) ? page-1 : logicalPage+this.difference-1;
			var y=(options.vertical) ? -(destPage*pageSize.y) : current.y;
			var x=(options.vertical) ? current.x : -(destPage*pageSize.x);

			return {'page':logicalPage, 'x':x, 'y':y};
		},
		pageInfo: function(x, y, callback) {
			var pageSize=this.pageSize,
				contentsCount=this.contentsCount;

			//! page calculation in prospect of an error
			var physicalPage=(Math.round((-y)/pageSize.y)*contentsCount.x)+Math.round((-x)/pageSize.x)+1;
			var logicalPage=physicalPage%this.lastPage;
			if(logicalPage==0) logicalPage=this.lastPage;

			return {'physical': physicalPage, 'logical':logicalPage};
		},
		moveTo: function(x, y, easing, timing, callback) {
			var self=this,
				$handle=this.$handle,
				options=this.options,
				current=this.current,
				contentSizeExpanded=this.contentSizeExpanded,
				_transform= this.transform,
				_transition=this.transition,
				cmdTranslateBefore=this.cmdTranslateBefore,
				cmdTranslateAfter=this.cmdTranslateAfter;

			//! coordinate revision
			if(!options.endless) {
				if(options.vertical) {
					if(y>0) {
						y=0;
					}
					else if(y<contentSizeExpanded.y) {
						y=contentSizeExpanded.y;
					}
				}
				else {
					if(x>0) {
						x=0;
					}
					else if(x<contentSizeExpanded.x) {
						x=contentSizeExpanded.x;
					}
				}
			}
			//! page calculation in prospect of an error
			var page=this.pageInfo(x, y);

			this.isAminationRunning=true;
			if(options.useCssTansform) {
				$handle.css(_transition+'-property', _transform)
					.css(_transition+'-duration', options.duration+'ms')
					.css(_transition+'-timing-function', timing)
					.css(_transform, cmdTranslateBefore+x+'px, '+y+'px'+cmdTranslateAfter);
				this.transitionEndHandler(function() {
					self.isAminationRunning=false;
					self.page=page.logical;
					current.x=x;
					current.y=y;
					if(options.endless) {
						if(page.physical<self.turnMin || page.physical>self.turnMax) {
							self.silentGoto(page.logical);
						}
					}
					self.checkChangeEvents();
					if($.isFunction(callback)) callback.call(self);
				});
			}
			else {
				$handle.stop(true, false).animate({'left':x, 'top':y}, options.duration, easing, function() {
					self.isAminationRunning=false;
					self.page=page.logical;
					current.x=x;
					current.y=y;
					if(options.endless) {
						if(page.physical<self.turnMin || page.physical>self.turnMax) {
							self.silentGoto(page.logical);
						}
					}
					self.checkChangeEvents();
					if($.isFunction(callback)) callback.call(self);
				});
			}

			return this;
		},
		silentGoto: function(page) {
			var $handle=this.$handle,
				options=this.options,
				current=this.current,
				_transform= this.transform,
				_transition=this.transition,
				cmdTranslateBefore=this.cmdTranslateBefore,
				cmdTranslateAfter=this.cmdTranslateAfter;

			var data=this.coordinateTransformation(page, true);
			if(options.useCssTansform) {
				$handle.css(_transition, 'none').css(_transform, cmdTranslateBefore+data.x+'px, '+data.y+'px'+cmdTranslateAfter);
			}
			else {
				$handle.css({'left':data.x, 'top':data.y});
			}

			this.page=data.page;
			current.x=data.x;
			current.y=data.y;
			this.checkChangeEvents();

			return this;
		},
		transitionEndHandler: function(callback) {
			var self=this,
				namespace=this.trannamespace;

			this.$handle.unbind(namespace).bind('webkitTransitionEnd'+namespace+' transitionend'+namespace+' oTransitionEnd'+namespace+' msTransitionEnd'+namespace+' transitionEnd'+namespace, function() {
				$(this).unbind(namespace).css(self.transition, 'none');
				if($.isFunction(callback)) callback.call(self);
			});
			return this;
		},
		cancelAnimation: function() {
			var self=this,
				$handle=this.$handle,
				current=this.current,
				base=this.base,
				options=this.options;

			if(this.isAminationRunning) {
				this.isAminationRunning=false;
				if(this.options.useCssTansform) {
					this.$handle.unbind(this.trannamespace).css(this.transition, 'none');
					current.x=$handle.position().left-base.x;
					current.y=$handle.position().top-base.y;
				}
				else {
					this.$handle.stop(true, false);
					current.x=self.toInt($handle.css('left'));
					current.y=self.toInt($handle.css('top'));
				}
				$handle.trigger('scrollEnd', self);
				//! page calculation in prospect of an error
				var page=this.pageInfo(current.x, current.y);
				this.page=page.logical;
				this.checkChangeEvents();

				if(options.endless) {
					if(page.physical<this.turnMin || page.physical>this.turnMax) {
						this.silentGoto(this.page);
					}
				}
			}

			return this;
		},
		checkChangeEvents: function() {
			var options=this.options;

			if(this.prevPage!=this.page) {
				this.prevPage=this.page;
				if($.isFunction(this.options.onPageChange)) {
					var data={
						'target':$(this.$originChild.eq(this.page-1)),
						'page':this.page,
						'count':this.lastPage
					};
					setTimeout(function () {
						options.onPageChange.call(data);
					}, 0);
				}
			}

			return this;
		},
		scrollover: function(x, y, callback) {
			var options=this.options,
				current=this.current,
				pageSize=this.pageSize,
				contentSizeExpanded=this.contentSizeExpanded;

			var destX=0;
			var destY=0;
			if(options.vertical) {
				destX=current.x;
				var tempY=current.y+y*options.ratio;
				if(tempY>0) tempY=0; else if(tempY<contentSizeExpanded.y) tempY=contentSizeExpanded.y;
				destY=(y>0) ? Math.ceil(tempY/pageSize.y)*pageSize.y : Math.floor(tempY/pageSize.y)*pageSize.y;
			}
			else {
				tempX=current.x+x*options.ratio;
				if(tempX>0) tempX=0; else if(tempX<contentSizeExpanded.x) tempX=contentSizeExpanded.x;
				destX=(x>0) ? Math.ceil(tempX/pageSize.x)*pageSize.x : Math.floor(tempX/pageSize.x)*pageSize.x;
				destY=current.y;
			}
			this.moveTo(destX, destY, 'flickEndless_easing', 'ease-out', callback);

			return this;
		},
		destroy: function() {
			//! interruption is canceled.
			this.disable();
			if(this.orignThisStyle === undefined) {
				this.$this.removeAttr('style');
			}
			else {
				this.$this.attr('style', this.orignThisStyle);
			}
			if(this.orignHandlesStyle === undefined) {
				this.$handle.removeAttr('style');
			}
			else {
				this.$handle.attr('style', this.orignHandlesStyle);
			}

			return this;
		},
		option: function(key, value) {
			var self = this;
			var options = key;

			if (arguments.length === 0) {
				return $.extend({}, this.options);
			}

			if (typeof key === "string") {
				if (value === undefined) {
					return this.options[key];
				}
				options = {};
				options[key] = value;
			}

			$.each(options, function(key, value) {
				self.setOption(key, value);
			});

			return this;
		},
		setOption: function(key, value) {
			this.options[key] = value;
		},
		toInt: function(values) {
			if (values === undefined) return 0;
			var val = parseInt(String(values).replace("px", ""), 10);
			return ( isFinite( val ) ) ? val : 0;
		}

	};

	flickEndless.prototype.create.prototype = flickEndless.prototype;

})(jQuery);