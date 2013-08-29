/*

Copyright (c) 2009 Dimas Begunoff, http://www.farinspace.com

Licensed under the MIT license
http://en.wikipedia.org/wiki/MIT_License

Permission is hereby granted, free of charge, to any person
obtaining a copy of this software and associated documentation
files (the "Software"), to deal in the Software without
restriction, including without limitation the rights to use,
copy, modify, merge, publish, distribute, sublicense, and/or sell
copies of the Software, and to permit persons to whom the
Software is furnished to do so, subject to the following
conditions:

The above copyright notice and this permission notice shall be
included in all copies or substantial portions of the Software.

THE SOFTWARE IS PROVIDED "AS IS", WITHOUT WARRANTY OF ANY KIND,
EXPRESS OR IMPLIED, INCLUDING BUT NOT LIMITED TO THE WARRANTIES
OF MERCHANTABILITY, FITNESS FOR A PARTICULAR PURPOSE AND
NONINFRINGEMENT. IN NO EVENT SHALL THE AUTHORS OR COPYRIGHT
HOLDERS BE LIABLE FOR ANY CLAIM, DAMAGES OR OTHER LIABILITY,
WHETHER IN AN ACTION OF CONTRACT, TORT OR OTHERWISE, ARISING
FROM, OUT OF OR IN CONNECTION WITH THE SOFTWARE OR THE USE OR
OTHER DEALINGS IN THE SOFTWARE.

*/

;(function($){

	var scrollbarWidth = 0;
	String.prototype.endsWith = function(suffix) {
    			return this.indexOf(suffix, this.length - suffix.length) !== -1;
	};
	// http://jdsharp.us/jQuery/minute/calculate-scrollbar-width.php
	
	var methods={
			undo:function(){
			return this.each(function(){
				if($(this).hasClass('tablescroll_body')){
					var container=$(this).parent().parent().parent();
					var thead=container.find('.tablescroll_head');
					var head=thead.find('th').attr({style:''}).parent().html();
					
					if(thead.length>0){
						
						container.append($(this).removeClass('tablescroll_body').prepend('<thead>'+head+'<thead>')).find('.tablescroll').remove();
					}
					else{
						container.append($(this).removeClass('tablescroll_body')).find('.tablescroll').remove();
					}
					$(this).find('thead:empty').remove();
				}
				});
			
		
		},
		init:function(options){
		

		var settings = $.extend({},$.fn.tableScroll.defaults,options);

		// Bail out if there's no vertical overflow
		//if ($(this).height() <= settings.height)
		//{
		//  return this;
		//}

		settings.scrollbarWidth = core.getScrollbarWidth();

		return this.each(function()
		{
			
			var flush = settings.flush;
			var total=0;
			var tb = $(this).addClass('tablescroll_body');

            // find or create the wrapper div (allows tableScroll to be re-applied)
            var wrapper;
            if (tb.parent().hasClass('tablescroll_wrapper')) {
                wrapper = tb.parent();
            }
            else {
                wrapper = $('<div class="tablescroll_wrapper"></div>').insertBefore(tb).append(tb);
            }
			var parent=wrapper.parent();

			// check for a predefined container
			if (!wrapper.parent('div').hasClass(settings.containerClass))
			{
				$('<div></div>').addClass(settings.containerClass).insertBefore(wrapper).append(wrapper);
			}

			var width = settings.width ? settings.width : tb.outerWidth();
			width=core.toPixels(width,parent);
			wrapper.css
			({
				'width': width/parent.width()*100+'%',
				'height': settings.height,
				'overflow': 'auto'
			});

			tb.css('width',width/tb.parent().width()*100+'%');

			// with border difference
			var wrapper_width = wrapper.outerWidth();
			var diff = wrapper_width-width;

			// assume table will scroll
			wrapper.css({width:(width-diff)/parent.width()*100+'%'});
			tb.css('width',(wrapper.width()-settings.scrollbarWidth)/tb.parent().width()*100+'%');

			

			// using wrap does not put wrapper in the DOM right 
			// away making it unavailable for use during runtime
			// tb.wrap(wrapper);

			// possible speed enhancements
			var has_thead = $('thead',tb).length ? true : false ;
			var has_tfoot = $('tfoot',tb).length ? true : false ;
			var thead_tr_first = $('thead tr:first',tb);
			var tbody_tr_first = $('tbody tr:first',tb);
			var tfoot_tr_first = $('tfoot tr:first',tb);

			// remember width of last cell
			var w = 0;

			$('th, td',thead_tr_first).each(function(i)
			{
				w = $(this).width();
				
				var wpar=w/$(this).parent().width()*100+'%';
				
				
				$('th:eq('+i+'), td:eq('+i+')',thead_tr_first).css('width',wpar);
				if (has_tfoot) $('th:eq('+i+'), td:eq('+i+')',tfoot_tr_first).css('width',wpar);
			});

			if (has_thead) 
			{
				var tbh = $('<table class="tablescroll_head" cellspacing="0"></table>').insertBefore(wrapper).prepend($('thead',tb));
			}

			if (has_tfoot) 
			{
				var tbf = $('<table class="tablescroll_foot" cellspacing="0"></table>').insertAfter(wrapper).prepend($('tfoot',tb));
			}

			if (tbh != undefined)
			{
				tbh.css('width',width/parent.width()*100+'%');
				
				if (flush)
				{
					$('tr:first th:last, tr:first td:last',tbh).css('width',w/tb.width()*100+'%');
					tbh.css('width',wrapper.outerWidth()/parent.width()*100+'%');
				}
			}

			if (tbf != undefined)
			{
				tbf.css('width',width/parent.width()*100+'%');

				if (flush)
				{
					$('tr:first th:last, tr:first td:last',tbf).css('width',w/tb.width()*100+'%');
					tbf.css('width',wrapper.outerWidth()/parent.width()*100+'%');
				}
			}
			var ths=tbh.find('th');
			var len=ths.length;
			ths.each(function(i)
			{
				
				w = $(this).outerWidth();
				var current=w/tb.outerWidth()*100;
				
			
				var td = $('th:eq('+i+'), td:eq('+i+')',tbody_tr_first);
				if(i!=(len-1)){
					total+=current;
					
					td.css('width',current+'%');
				}
				else{
					td.css('width',(100-total)+'%');
				}
				
			});
		});
		
		
		
		}
	};
	var core={
		toPixels:function(adjust,main){
			adjust=String(adjust);
			
			if(adjust.endsWith('%')){
				size=parseInt(adjust.slice(0,-1))*main.parent().width()/100;
			}
			else if(adjust.endsWith('px')){
				size=parseInt(adjust.slice(0,-2));
			}
			else if(adjust.endsWith('em')){
				size=parseInt(adjust.slice(0,-1))*10;
			}
			else{
				size=adjust*1;
			}
			return size;
		},
		getScrollbarWidth:function() 
			{
				if (scrollbarWidth) return scrollbarWidth;
				var div = $('<div style="width:50px;height:50px;overflow:hidden;position:absolute;top:-200px;left:-200px;"><div style="height:100px;"></div></div>'); 
				$('body').append(div); 
				var w1 = $('div', div).innerWidth(); 
				div.css('overflow-y', 'auto'); 
				var w2 = $('div', div).innerWidth(); 
				$(div).remove(); 
				scrollbarWidth = (w1 - w2);
				return scrollbarWidth;
			}
	}
	$.fn.tableScroll = function()
	{
		method=arguments[0];
 
		// Check if the passed method exists
		if(methods[method]) {
 
			// If the method exists, store it for use
			// Note: I am only doing this for repetition when using "each()", later.
			method = methods[method];
            arguments = Array.prototype.slice.call(arguments, 1);		
		// If the method is not found, check if the method is an object (JSON Object) or one was not sent.
		}
		else{
 
			// If we passed parameters as the first object or no arguments, just use the "init" methods
			method = methods.init;
			
		}
		return method.apply(this, arguments);
	};

	// public
	$.fn.tableScroll.defaults =
	{
		flush: true, // makes the last thead and tbody column flush with the scrollbar
		width: null, // width of the table (head, body and foot), null defaults to the tables natural width
		height: 100, // height of the scrollable area
		containerClass: 'tablescroll' // the plugin wraps the table in a div with this css class
	};

})(jQuery);
