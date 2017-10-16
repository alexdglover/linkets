$(document).ready(function() {
  var keyboard = true;
  var mouse = false;
  var getUrlParameter = function(name) {
    var retVal;
    var url = decodeURIComponent(window.location.search.substring(1));
    var nameValues = url.split('&');

    for (var i = 0; i < nameValues.length; i++) {
      var nameValue = nameValues[i].split('=');

      if (nameValue[0] === name) {
        var value = nameValue[1];

        retVal = (value === undefined) ? true : value;
      }
    }

    return retVal;
  };
  var updateRangeBackground = function($rangeInput) {
    var min = $rangeInput.attr('min') || 0;
    var max = $rangeInput.attr('max');

    if (max && (parseFloat(max) < parseFloat(min))) {
      max = 100;
    }

    var value = max ? (100 * ($rangeInput.val() - min) / (max - min)) : $rangeInput.val();
    var backgroundSize = value + '%';

    $rangeInput.css('background-size', backgroundSize);
  };

  svg4everybody();

  $('a').mousedown(function() {
    mouse = true;
  }).focus(function() {
    if (mouse) {
      $(this).blur();
      mouse = false;
    }
  });

  $('.c-menu__item').mouseup(function() {
    $(this).blur();
  });

  $('.c-range__input').mousedown(function() {
    keyboard = false;
    $(this).parent('.c-range').removeClass('is-focused');
  });

  $('.c-tab__list__item').click(function() {
    var $parent = $(this).parent('.c-tab__list:not(.js-demo)');

    if ($parent.length) {
      $parent.children('.c-tab__list__item').removeClass('is-selected');
      $(this).addClass('is-selected');
    }
  });

  $('.c-tab__list__item').mousedown(function() {
    $(this).blur();

    return false;
  });

  $('.c-tab__list__item').keydown(function(event) {
    if (event.which === 13 || event.which === 32) {
      $(this).children('a')[0].click();
    }
  });

  $('.c-tab__list__item a').click(function() {
    $(this).parent().click();

    return $(this).parents('.c-nav').length > 0;
  });

  $('.js-custom').click(function() {
    $('.c-btn:not(.c-playground .c-btn)').toggleClass('c-btn--custom');
  });

  $('.js-dark').click(function() {
    $('body').toggleClass('is-dark');
    $('.c-avatar:not(.c-playground .c-avatar)').toggleClass('c-avatar--borderless', $('body').hasClass('is-dark'));
    $('.c-btn:not(.c-playground .c-btn)').toggleClass('c-btn--dark', $('body').hasClass('is-dark'));
    $('.c-callout:not(.c-playground .c-callout)').toggleClass('c-callout--dark', $('body').hasClass('is-dark'));
    $('.c-chk:not(.c-playground .c-chk)').toggleClass('c-chk--dark', $('body').hasClass('is-dark'));
    $('.c-dialog:not(.c-playground .c-dialog)').toggleClass('c-dialog--dark', $('body').hasClass('is-dark'));
    $('.c-input-label:not(.c-playground .c-input-label)').toggleClass('c-input-label--dark', $('body').hasClass('is-dark'));
    $('.c-menu:not(.c-playground .c-menu)').toggleClass('c-menu--dark', $('body').hasClass('is-dark'));
    $('.c-pagination:not(.c-playground .c-pagination)').toggleClass('c-pagination--dark', $('body').hasClass('is-dark'));
    $('.c-range:not(.c-playground .c-range)').toggleClass('c-range--dark', $('body').hasClass('is-dark'));
    $('.c-tab:not(.c-playground .c-tab)').toggleClass('c-tab--dark', $('body').hasClass('is-dark'));
    $('.c-table:not(.c-playground .c-table)').toggleClass('c-table--dark', $('body').hasClass('is-dark'));
    $('.c-tooltip:not(.c-playground .c-tooltip)').toggleClass('c-tooltip--dark', $('body').hasClass('is-dark'));
    $('.c-txt:not(.c-playground .c-txt)').toggleClass('c-txt--dark', $('body').hasClass('is-dark'));
  });

  $('.js-rtl').click(function() {
    $('.c-callout:not(.c-playground .c-callout)').toggleClass('is-rtl');
    $('.c-chk:not(.c-ctl .c-chk, .c-playground .c-chk)').toggleClass('is-rtl');
    $('.c-dialog:not(.c-ctl .c-dialog, .c-playground .c-dialog)').toggleClass('is-rtl');
    $('.c-label:not(.c-ctl .c-label, .c-playground .c-label)').toggleClass('is-rtl');
    $('.c-menu:not(.c-ctl .c-menu, .c-playground .c-menu)').toggleClass('is-rtl');
    $('.c-pagination:not(.c-ctl .c-pagination, .c-playground .c-pagination)').toggleClass('is-rtl');
    $('.c-range:not(.c-ctl .c-range, .c-playground .c-range)').toggleClass('is-rtl');
    $('.c-tab:not(.c-ctl .c-tab, .c-playground .c-tab)').toggleClass('is-rtl');
    $('.c-table:not(.c-ctl .c-table, .c-playground .c-table)').toggleClass('is-rtl');
    $('.c-txt:not(.c-ctl .c-txt, .c-playground .c-txt)').toggleClass('is-rtl');
    $('.l-btn-group:not(.c-ctl .l-btn-group, .c-playground .l-btn-group)').toggleClass('is-rtl');
    $('.js-rtl-display').toggleClass('u-display-none');
  });

  $('html').toggleClass('u-font-family-proxima-nova', getUrlParameter('font') === 'proxima-nova');
  $('html').toggleClass('u-font-family-system', getUrlParameter('font') === 'system');
  $('.c-header').toggleClass('is-relative', getUrlParameter('header') === 'fluid');

  $(document).click(function() {
    $('.c-menu').removeClass('is-open').each(function() {
      this.offsetHeight; // trigger reflow
    }).attr('aria-hidden', true);
    $('.js-menu').removeClass('is-active');
    $('.js-menu').children('.c-btn__icon').removeClass('is-rotated');
  });

  var selector = '.c-btn, .c-dialog__close, .c-pagination__page, .c-range__slider__track__rail__thumb';

  $(document).on('focus', selector, function() {
    $(this).addClass('is-focused');
  }).on('blur mouseup', selector, function() {
    $(this).removeClass('is-focused');
  });

  $(document).on('mouseup', '.c-chk__label', function() {
    keyboard = false;
  });

  $(document).on('focus', '.c-chk__input', function() {
    $(this).parent('.c-chk').toggleClass('is-focused', keyboard);
    keyboard = true;
  })

  $(document).on('blur', '.c-chk__input', function() {
    $(this).parent('.c-chk').removeClass('is-focused');
  });

  $(document).on('click', '.c-dialog', function(event) {
    event.stopPropagation();
  });

  $(document).on('click', '.c-dialog__close, .c-dialog .js-close', function() {
    $(this).closest('.c-dialog').hide();
    $(this).closest('.l-backdrop').remove();
    $('body').css('overflow', '');
  });

  $(document).on('focus', '.c-range__input', function() {
    $(this).parent('.c-range').toggleClass('is-focused', keyboard);
    keyboard = true;
  }).on('blur', '.c-range__input', function() {
    $(this).parent('.c-range').removeClass('is-focused');
  }).on('input', '.c-range__input', function() {
    updateRangeBackground($(this));
  });

  $('.c-range__input').trigger('input');

  $('.c-playground').on('change', function() {
    $('.c-range__input', this).trigger('input');
  });

  $(document).on('click', '.l-btn-group[role=tablist] .c-btn:not(:disabled):not(.is-disabled)', function() {
    $(this).addClass('is-selected').siblings('.c-btn').removeClass('is-selected');
  });

  $(document).on('click', '.l-backdrop', function() {
    $(this).find('.c-dialog').hide();
    $(this).remove();
    $('body').css('overflow', '');
  });

  $(document).on('click', '.js-dialog', function() {
    var $this = $(this);
    var dialog = $this.attr('href');

    if ($this.hasClass('js-backdrop')) {
      dialog = $(dialog).clone().appendTo('body').wrap(function() {
        var retVal = $('<div class="l-backdrop"/>');

        $('body').css('overflow', 'hidden');

        if($this.hasClass('js-backdrop--center')) {
          retVal.addClass('l-backdrop--center');
        }

        if ($('.js-rtl').is(':checked')) {
          retVal.addClass('is-rtl');
        }

        return retVal;
      });
    }

    $(dialog).addClass('is-open').show().focus().parent('.l-backdrop').addClass('is-visible');

    setTimeout(function() {
      $(dialog).removeClass('is-open');
    }, 500);

    return false;
  });

  $(document).on('click', '.js-menu', function() {
    var $this = $(this);
    var $menu = $this.parent().find('.c-menu');

    if ($menu.hasClass('is-open')) {
      $(document).trigger('click');
    } else {
      $(document).trigger('click');
      $menu.addClass('is-open').attr('aria-hidden', false);
      $this.addClass('is-active');
      $this.children('.c-btn__icon').addClass('is-rotated');
    }

    return false;
  });
});
