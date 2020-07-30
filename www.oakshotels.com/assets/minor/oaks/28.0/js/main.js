/* --------------------------------------------------------------------------
	Oaks - main.js
	------------------------------------------------------------------- */

// Avoid `console` errors in browsers that lack a console.
(function () {
    var method,
        noop = function () {},
        methods = [
            'assert', 'clear', 'count', 'debug', 'dir', 'dirxml', 'error',
            'exception', 'group', 'groupCollapsed', 'groupEnd', 'info', 'log',
            'markTimeline', 'profile', 'profileEnd', 'table', 'time', 'timeEnd',
            'timeline', 'timelineEnd', 'timeStamp', 'trace', 'warn'
        ],
        length = methods.length,
        console = (window.console = window.console || {});

    while (length--) {
        method = methods[length];

        // Only stub undefined methods.
        if (!console[method]) {
            console[method] = noop;
        }
    }
}());

var $window = $j(window);

RR.cookiePopup.startCookiePopup();

$j(document).ready(function ($) {

    RR.videoControls.setup();
    RR.accordionPanel.setup();
    RR.autoComplete.setup();
    RR.bookingForm.setup();
    //RR.carousel.setup();
    RR.contactUs.setup();
    RR.currencyConverter.setup();
    RR.googleCustomSearch.setup();
    RR.layoutComposer.setup();
    RR.listeners.setup();
    RR.megaMenu.setup();
    RR.mobileMenu.setup();
    RR.responsiveBackground.setup();
    RR.roomDetailExpander.setup();
    RR.scrollingEvents.setup();
    RR.bookingModal.setup();
    RR.captcha.setup();

    var $ie8 = $('.lt-ie9').length;

    var $matchHeight = $('.matchHeight');

    if ($matchHeight.length) {
        $matchHeight.matchHeight();
    }

    $('.location .location-city').matchHeight();
    var isRTL = false;

    if ($('html').attr('dir') === 'rtl') {
        isRTL = true;
    }

    (function () {
        if (isRTL) {
            $('.icon-chevron-left').addClass('exLeft');
            $('.icon-chevron-right').addClass('exRight');
            $('.exLeft').addClass('icon-chevron-right').removeClass('icon-chevron-left');
            $('.exRight').addClass('icon-chevron-left').removeClass('icon-chevron-right');
        }
    })();

    $('.tooltip').tooltipster({
        trigger: 'hover',
        position: 'bottom'
    });

    $('.tooltip').on('click',function(e) {
        e.preventDefault();
    })

    RR.carousel.setup();

    $('.responsive-table').each(function() {
        if ($(this).find('thead').length) {
            if ($(this).is('div')) {
                $(this).find('table').responsiveTable();
                $(this).addClass('hasStackTable');
            } else {
                $(this).responsiveTable();
            }
        } else {
            $(this).addClass('responsive-table-no-head');
        }
    });

    //this caused currency dropdown to not take value from cookies. sp need to put :not currency
    $('select:not(.js-currency-converter)').each(function () {
        var select = $(this);
        var selectedValue = select.find('option[selected]').val();

        if (selectedValue) {
          select.val(selectedValue);
        } else {
          select.prop('selectedIndex', 0);
        }
    });

    // Don't initialise if only option is the 'please select' drop down
    if($('.language-dropdown').find('option').length != 0) {
        // If only one item without a value, remove it

        if(!($('.language-dropdown').find('option').length == 1 && $('.language-dropdown').find('option').val() == "")) {
            $('.language-dropdown').fancySelect({
                forceiOS: true,
                optionTemplate: function(optionEl) {
                    return '<a class="lang-link" href="' + optionEl.data('url') + '">'+optionEl.text()+'</a>';
                }
            });
        }
    }


    var dateFormat = $('#headerBookingCheckin').data('dateformat');

    if (dateFormat == '' || dateFormat == undefined) {
        dateFormat = 'DD/MM/YYYY'
    }

    if ($('html').attr('lang') == 'zh' || $('html').attr('lang') == 'cn' || $('html').attr('lang') == 'ja') {
        if (dateFormat == 'D MMM YYYY' || dateFormat == 'DD MMM YYYY' || dateFormat == 'D MMMM YYYY' || dateFormat == 'DD MMMM YYYY') {
            dateFormat = 'D日M月YYYY年';
        } else if (dateFormat == 'MMM D YYYY' || dateFormat == 'MMM DD YYYY' || dateFormat == 'MMMM D YYYY' || dateFormat == 'MMMM DD YYYY') {
            dateFormat = 'M月D日YYYY年';
        } else if (dateFormat == 'YYYY MMM D' || dateFormat == 'YYYY MMM DD' || dateFormat == 'YYYY MMMM D' || dateFormat == 'YYYY MMMM DD') {
            dateFormat = 'YYYY年M月D日';
        }
    }

    var meetingBookingFrom = new Pikaday({
        field: document.getElementById('CheckInDate'),
        minDate: moment().toDate(),
        defaultDate: moment().toDate(),
        setDefaultDate: true,
        format: dateFormat,
        //maxDate: moment().add(1, 'years').toDate(),
        numberOfMonths: 1,
		theme: "single"
    });

    var meetingBookingTo = new Pikaday({
        field: document.getElementById('CheckOutDate'),
        minDate: moment().toDate(),
        defaultDate: moment().toDate(),
        setDefaultDate: true,
        format: dateFormat,
        //maxDate: moment().add(1, 'years').toDate(),
        numberOfMonths: 1,
		theme: "single"
    });

    if ($('#CheckOutDate').val()) {
        meetingBookingTo.setDate(moment($('#CheckOutDate').val(), "DD-MM-YYYY"));
    } else {
        meetingBookingTo.setDate(moment().add(1, 'days').toDate());
    }

    if ($('#CheckInDate').val()) {
        meetingBookingFrom.setDate(moment($('#CheckInDate').val(), "DD-MM-YYYY"));
        meetingBookingTo.setMinDate(moment($('#CheckInDate').val(), "DD-MM-YYYY"));
    } else {
        meetingBookingFrom.setDate(moment().toDate());
    }

    var eventDate = new Pikaday({
        field: document.getElementById('WeddingDate'),
        minDate: moment().toDate(),
        format: dateFormat,
        //maxDate: moment().add(1, 'years').toDate(),
        numberOfMonths: 1,
		theme: "single"
    });

    if ($('#WeddingDate').val()) {
        eventDate.setDate(moment($('#WeddingDate').val(), "DD-MM-YYYY"));
    } else {
        eventDate.setDate(moment().toDate());
    }

    $('.currency-converter select').fancySelect({forceiOS: true}).on('change.fs', function () {
        $(this).trigger('change.$');
    }); // trigger the DOM's change event when changing FancySelect;

    $('.scfForm select').each(function() {
        $(this).fancySelect();
        $(this).change(function() {
            $(this).trigger('update.fs');
        });
    });


    $('#dest-state,#dest-city,#offer-cat,#offer-loc').fancySelect().on('change.fs', function () {
        var $this = $(this);

        $this.trigger('change.$');
        window.location.href = $this.val();
    }); // trigger the DOM's change event when changing FancySelect;

    $('#offer-loc option').each(function(){
        $(this).html($(this).html().replace(/&amp;nbsp;/g, ""))
    });

    $('#offer-property').fancySelect().on('change.fs', function () {
        var $this = $(this);
        var location = $('#offer-loc').val();
        var propertyUUID = $this.val();

        $this.trigger('change.$');

        if(location == "")
        {
            window.location.href = propertyUUID;
        }
        else
        {
            window.location.href = location + "&" + propertyUUID.substring(1, propertyUUID.length);
        }

    }); // trigger the DOM's change event when changing FancySelect;


    $('#press-release-hotel').fancySelect({includeBlank: true});


    $("a.fancybox.iframe").click(function(e) {
        e.preventDefault();
        var ifURL=$(this).attr('href');
        $.fancybox.open({
            href : ifURL,
            type : 'iframe',
            padding : 5
        });
    });
    enquire
        .register('screen and (max-width: 767px)', {
            match: function () {
                console.log('mobile');
                // RR.bookingForm.destroyDatePickers();
                RR.bookingForm.mobileEvents(1);
                RR.bookingForm.mobileOnlyEvents();
                RR.layoutComposer.mobileEvents();

                RR.mobileMenu.mobileEvents();
                RR.roomDetailExpander.mobileEvents();
                RR.scrollingEvents.mobileEvents();

                RR.carousel.mobileEvents();
                RR.listeners.mobileSetup();
            }
        })
        .register('screen and (min-width: 768px) and (max-width: 1023px)', {

            match : function () {
                console.log('tablet');
                // RR.bookingForm.destroyDatePickers();
                RR.layoutComposer.tabletEvents();
                RR.bookingForm.mobileEvents(2);
                RR.mobileMenu.mobileEvents();
                RR.scrollingEvents.mobileEvents();

                RR.carousel.tabletEvents();
                RR.listeners.tabletSetup();
                RR.listeners.nonMobileSetup();

                RR.responsiveBackground.tabletEvents();

            }
        })
        .register('screen and (min-width: 1024px) and (max-width: 1339px)', {

            match : function () {
                console.log('small desktop');

                RR.layoutComposer.desktopEvents();
                RR.listeners.desktopSetup();
                RR.listeners.nonMobileSetup();

                RR.responsiveBackground.desktopEvents();

                RR.scrollingEvents.desktopEvents();

                RR.bookingForm.desktopEvents();
                RR.carousel.desktopEvents();
                RR.megaMenu.desktopEvents();

                // Custom dropdown
                $('.header-booking select, .homepage-booking select').fancySelect();
            }
        }, true)
        .register('screen and (min-width: 1340px)', {

            match : function () {
                console.log('large desktop');

                RR.layoutComposer.desktopEvents();
                RR.listeners.largeDesktopSetup();
                RR.listeners.nonMobileSetup();
                RR.responsiveBackground.desktopEvents();
                RR.scrollingEvents.desktopEvents();

                RR.bookingForm.desktopEvents();

                RR.carousel.desktopEvents();
                RR.megaMenu.desktopEvents();

                // Custom dropdown
                $('.header-booking select, .homepage-booking select').fancySelect();

            }
        }, true);

});


// Returns a function, that, as long as it continues to be invoked, will not
// be triggered. The function will be called after it stops being called for
// N milliseconds. If `immediate` is passed, trigger the function on the
// leading edge, instead of the trailing.
function debounce(func, wait, immediate) {
    var timeout;
    return function () {
        var context = this, args = arguments;
        var later = function () {
            timeout = null;
            if (!immediate) {
                func.apply(context, args);
            }
        };
        var callNow = immediate && !timeout;
        clearTimeout(timeout);
        timeout = setTimeout(later, wait);
        if (callNow) {
            func.apply(context, args);
        }
    };
}

// To check whether element is viewable in current viewport
function elementInViewport(el) {
    var rect = el.getBoundingClientRect();

    return (
        rect.top  >= 0 &&
        rect.left >= 0 &&
        rect.top  <= (window.innerHeight || document.documentElement.clientHeight)
    );
}

/* --------------------------------------------------------------
    setCookie, sets a cookie in browser
    Parameters: cookiename (name of cookie)
                value (value to set to cookie of cookiename)
    Returns: true
-------------------------------------------------------------- */

function setCookie(cookiename, value) {
    document.cookie = cookiename + '=' + value + '; path=/; max-age=' + (10 * 365 * 24 * 60 * 60);
    return true;
}

/* --------------------------------------------------------------
    checkCookie, checks a cookie of cookie name if exists
    Parameters: cookiename (name of cookie)
    Returns: value of cookie if exists, false if doesn't exist
-------------------------------------------------------------- */

function checkCookie(cookiename) {
    //reworked to turn document.cookie into object

    // get document.cookie and store in var
    var cookies = document.cookie;
    //convert into array
    var cookiearr = cookies.split('; ');
    //get length of array items
    var arrlen = cookiearr.length;

    //declare object to store cookie details in
    var cookieobj = {};
    //declare holding array for name and values
    var holdingarr = [];

    //loop through and split into JS object
    for (var i = 0; i < arrlen; i++) {
        //split array item into name and value and store in holding array at 0 for name and 1 for value
        holdingarr = cookiearr[i].split('=');
        //store in key value pair in object
        cookieobj[holdingarr[0]] = holdingarr[1];
    }

    //check if cookie name exists as key in object
    if (cookiename in cookieobj) {
        //if does exist return cookie value
        return cookieobj[cookiename];
    } else {
        return false;
    }
}
/* --------------------------------------------------------------
Number formatting
-------------------------------------------------------------- */
/**
 * Number.prototype.format(n, x, s, c)
 *
 * @param integer n: length of decimal
 * @param integer x: length of whole part
 * @param mixed   s: sections delimiter
 * @param mixed   c: decimal delimiter
 */

Number.prototype.format = function (n, x, s, c) {
    var re = '\\d(?=(\\d{' + (x || 3) + '})+' + (n > 0 ? '\\D' : '$') + ')',
        num = this.toFixed(Math.max(0, ~~n));

    return (c ? num.replace('.', c) : num).replace(new RegExp(re, 'g'), '$&' + (s || ','));
}
