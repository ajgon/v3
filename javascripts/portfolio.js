/*global define */
/*jslint browser: true */

(function ($) {
    'use strict';

    /*jslint unparam: true*/
    var Portfolio = {
        init: function () {
            this.container = $('#portfolioItems');
            this.optionsSetter = $('#portfolio .options');
            this.containerPaddings = parseInt(this.container.css('padding-left'), 10) + parseInt(this.container.css('padding-right'), 10);
            this.masonryCols = -1;

            this.initIsotope();
            this.initFlipboard();
            this.initOptions();

            $(window).resize(function () {
                var containerDistance = Portfolio.container.parent().width() - Portfolio.container.outerWidth();
                if (containerDistance >= 155 || containerDistance <= 0) {
                    if (containerDistance <= 0) {
                        containerDistance -= 155;
                    }
                    Portfolio.container.width(Portfolio.container.width() + parseInt(containerDistance / 155, 10) * 155);
                }
            });

            $(window).load(function() { $(this).resize(); });
        },
        initIsotope: function () {
            this.container.isotope({
                itemSelector: '.item',
                masonry: {
                    columnWidth: 155
                },
                onLayout: this.isotopeOnLayout,
                getSortData: this.sortData
            }).isotope('shuffle');
        },
        initFlipboard: function () {
            this.container
                .on('mouseenter', '.item', function () {
                    var $this = $(this);
                    $this.addClass('hovered');
                    $this.find('.front').addClass('front-animating');
                    $this.find('.back').addClass('back-animating');
                })
                .on('mouseleave', '.item', function () {
                    var frontback = $(this).removeClass('hovered').find('.front, .back');
                    frontback.removeClass('paused');
                    if (!Modernizr.testAllProps('animationName')) {
                        frontback.removeClass('front-animating').removeClass('back-animating');
                    }
                })
                .on('animationend webkitAnimationEnd oanimationend MSAnimationEnd', '.front, .back', function () {
                    var $this = $(this);
                    $this.removeClass('front-animating');
                    $this.removeClass('back-animating');
                })
                .on('animationiteration webkitAnimationIteration oanimationiteration MSAnimationIteration', '.hovered .front, .hovered .back', function () {
                    $(this).addClass('paused');
                });
        },
        initOptions: function () {
            var self = this;
            this.optionsSetter.find('.option-sort').change(function () {
                var opt = $(this).find('option[value="' + $(this).val() + '"]');
                if (opt.attr('value')) {
                    self.container.isotope({
                        sortBy: opt.attr('value'),
                        sortAscending: opt.attr('data-ascending') === 'true'
                    });
                } else {
                    self.container.isotope('shuffle');
                }
            });
            this.optionsSetter.find('.option-filter').change(function () {
                $('.option-filter-item').val('').change().hide().filter('[data-filter="' + $(this).val() + '"]').show();
            }).change();
            this.optionsSetter.find('.option-filter-item').change(function () {
                var ax = $(this).attr('data-includes') === 'true' ? '*' : '';
                if ($(this).val()) {
                    self.container.isotope({filter: '[data-' + $(this).attr('data-filter') + ax + '="' + $(this).val() + '"]'});
                } else {
                    self.container.isotope({filter: '*'});
                }
            });
        },

        isotopeOnLayout: function ($elems, isotope) {
            if (Portfolio.masonryCols !== isotope.masonry.cols) {
                Portfolio.container.width(isotope.masonry.cols * 155);
                Portfolio.masonryCols = isotope.masonry.cols;
            }
        },
        sortData: {
            date: function ($elem) {
                return $elem.attr('data-date');
            },
            client: function ($elem) {
                return $elem.attr('data-client');
            }
        }
    };
    /*jslint unparam: false*/

    Portfolio.init();

})(jQuery);
