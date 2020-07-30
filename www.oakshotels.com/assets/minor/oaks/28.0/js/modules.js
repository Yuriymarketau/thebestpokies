/**
 * RR - Language Redirection
 */

var RR = (function (parent, $) {
    'use strict';

    function LanguageManuallySelected() {
        var selected = false;
        var name = "LanguageManuallySelected=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var cookies = decodedCookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i];
            //Remove whitespace before cookie name
            while (cookie.charAt(0) == ' ') {
                cookie = cookie.substring(1);
            }
            //If language cookie then return its value
            if (cookie.indexOf(name) == 0) {
                selected = "true" == cookie.substring(name.length, cookie.length);
            }
        }
        return selected;
    }

    var SetLanguageSelectedCookie = function () {
        //Add a cookie that lasts 5 days to tell the langauge selector not to redirect to the chinese site
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + 5);
        document.cookie = "LanguageManuallySelected=true; expires=" + exdate.toUTCString() + "; path=/";
    }

    $('.language-link').on("click", function () {
        if (LanguageManuallySelected() == false) {
            SetLanguageSelectedCookie();
        }
    });


    /**
     * Export module method
     */
    parent.languageRedirection = {
        SetLanguageSelectedCookie: SetLanguageSelectedCookie,
    };

    return parent;

}(RR || {}, jQuery));/**
 * RR - Accordion
 */

var RR = (function (parent, $) {
    'use strict';

    var $accExpander= $('.custom-accordion dt');

    var desktopEvents = function () {

    };

    var tabletEvents = function () {

    };

    var mobileEvents = function () {

    };

    var setup = function () {
        $accExpander.each(function(){
            var $this=$(this),
                $thisTarget=$this.next(),
                $parentItem=$this.parents('.custom-accordion');

             $this.click(function(){
                if(!$this.hasClass('expanded')){
                    $('dd.expanded',$parentItem).slideUp(function(){
                        $('.expanded').removeClass('expanded');
                    });
                    $thisTarget.slideDown(function(){
                        $this.addClass('expanded');
                        $thisTarget.addClass('expanded');
                    });
                }else{
                     $this.removeClass('expanded');
                     $thisTarget.slideUp(function(){
                        $(this).removeClass('expanded');

                    });
                }
             });
        });


    };

    /**
     * Export module method
     */
    parent.accordionPanel = {
        setup: setup,
        desktopEvents: desktopEvents,
        tabletEvents: tabletEvents,
        mobileEvents: mobileEvents
    };

    return parent;

}(RR || {}, jQuery));/**
 * RR - Booking form
 */
 var RR = (function (parent, $) {
    'use strict';

    var $bookingSection = $('.page-header .header-booking'),
    bookingUrl = '',
    bookingRoomUrl = '';

    var setup = function () {
        loadMapAllData();
    };

    function compareStrings(a, b) {
        a = a.toLowerCase();
        b = b.toLowerCase();
        return (a < b) ? -1 : (a > b) ? 1 : 0;
    }


    var setDataAttr = function (el, suggestion) {

        // get booking url from mapData.json from brandCode
        el.data('booking-url', suggestion.bookingUrl);

        el.data('flexible-url', suggestion.flexibleUrl);

        el.data('date-format', suggestion.dateFormat);

        if (suggestion.startDate) {
            el.data('booking-start-date', suggestion.startDate);
        } else {
            el.data('booking-start-date', '');
        }

        if (suggestion.endDate) {
            el.data('booking-end-date', suggestion.endDate);
        } else {
            el.data('booking-end-date', '');
        }
    }

    var loadMapAllData = function () {
        var url = window.location.origin + '/' + $('html').attr('lang');
        // var dataUrl = url + '/oaksapi/bookingdata';
        var dataUrl = url + '/json/bookingdata';

        $.ajax({
            url: dataUrl,
            // url: '//minor-cm.cloudapp.net/en/oaks/json/bookingdata',
            type: "GET",
            cache: true,
            timeout: 10000,
            dataType: 'json'
        }).done(function (data) {
            // console.log(data)
            var source = [];
            source = source.concat(
                $.map(data, function (dataItem) {
                    if (dataItem && dataItem.bookingUrl) {
                        return {
                            id: dataItem.id,
                            title: dataItem.title,
                            location: dataItem.location,
                            country: dataItem.country,
                            state: dataItem.state,
                            city: dataItem.city,
                            hotelCode: dataItem.hotelCode,
                            brandCode: dataItem.brandCode,
                            dateFormat: dataItem.dateFormat,
                            bookingUrl: dataItem.bookingUrl,
                            flexibleUrl: dataItem.flexibleUrl,
                            startDate: dataItem.startDate,
                            endDate: dataItem.endDate
                        };
                    }
                })
            );


            var title = buildBloodhoundLocal();

            function buildBloodhoundLocal()
            {
                var useChineseTokenization = $('#homepageBookingDestination').data("use-substring-tokenizer") === true || $('#headerBookingDestination').data("use-substring-tokenizer") === true;

                if(useChineseTokenization)
                {
                    return new Bloodhound ({
                    datumTokenizer: function(datum) {
                        var tokens = [];
                          var name = "" + datum.title + datum.location + datum.country + datum.state + datum.city;
                            //the available string is 'name' in your datum
                            var stringSize = name.length;
                            //multiple combinations for every available size
                            //(eg. dog = d, o, g, do, og, dog)
                            for (var size = 1; size <= stringSize; size++){
                              for (var i = 0; i+size<= stringSize; i++){
                                    if(name.substr(i, size).trim() != "")
                                    {
                                        tokens.push(name.substr(i, size).trim());
                                    }
                              }
                            }

                    return tokens;
                    },
                    queryTokenizer: Bloodhound.tokenizers.whitespace,
                    identify: function (obj) {
                        return obj.title;
                    },
                    local: source,
                    sorter:function(a, b) {
                        if (a.id < b.id) {
                            return -1;
                        }
                        else if (a.id > b.id) {
                            return 1;
                        }
                        else return 0;
                    }
                });
                }
                else
                {
                    return new Bloodhound ({
                    datumTokenizer: Bloodhound.tokenizers.obj.whitespace('id','title', 'location', 'country', 'state', 'city'),
                    queryTokenizer: Bloodhound.tokenizers.whitespace,
                    identify: function (obj) {
                        return obj.title;
                    },
                    local: source,
                    sorter:function(a, b) {
                        if (a.id < b.id) {
                            return -1;
                        }
                        else if (a.id > b.id) {
                            return 1;
                        }
                        else return 0;
                    }
                });
                }

            }

            title.initialize();

            function typeaheadDefaults(q, sync) {
                if (q === '') {
                  sync(title.all());
                } else {
                  title.search(q, sync);
                }
            }

            $('#homepageBookingDestination').typeahead({
                hint: true,
                highlight: true,
                minLength: 0
            }, {
                name: 'Place',
                displayKey: 'title',
                limit: 500,
                source: typeaheadDefaults,
                templates: {
                    suggestion: Handlebars.compile('<div class="{{#if country}}tt-country{{/if}}{{#if state}}tt-state{{/if}}{{#if city}}tt-city{{/if}}">{{title}}</div>')
                }
            }).on('focus', function () {
                $(this).typeahead('val', '').typeahead('open');
            });

            $('#headerBookingDestination').typeahead({
                hint: true,
                highlight: true,
                minLength: 0
            }, {
                name: 'Place',
                displayKey: 'title',
                limit: 500,
                source: typeaheadDefaults,
                //source: title.ttAdapter(),
                templates: {
                    suggestion: Handlebars.compile('<div class="{{#if country}}tt-country{{/if}}{{#if state}}tt-state{{/if}}{{#if city}}tt-city{{/if}}">{{title}}</div>')
                }
            }).on('focus', function () {
                $(this).typeahead('val', '').typeahead('open');
            });

            $(document).on('keypress', '#headerBookingDestination', function(e) {
                if(e.keyCode == 13) {
                    e.preventDefault();
                    var selectables = $('#headerBookingDestination').siblings(".tt-menu").find(".tt-selectable");
                    if (selectables.length > 0){
                         $(selectables[0]).trigger('click');
                    }
                    $('#headerBookingDestination').typeahead('close');
                }
            });

            $(document).on('keypress', '#homepageBookingDestination', function(e) {
                if(e.keyCode == 13) {
                    e.preventDefault();
                    var selectables = $('#homepageBookingDestination').siblings(".tt-menu").find(".tt-selectable");
                    if (selectables.length > 0){
                         $(selectables[0]).trigger('click');
                    }
                    $('#homepageBookingDestination').typeahead('close');
                }
            });

            $('#homepageBookingDestination, #headerBookingDestination').on('blur', function() {
                var $this = $(this),
                    text = $this.val(),
                    selected = false;
                $('.tt-selectable').each(function() {
                    if ($(this).text().toUpperCase().trim()  == text.toUpperCase().trim() ) {
                        $(this).trigger('click');
                        selected = true;
                        $this.typeahead('close');
                    }
                })

                if (!selected) {
                    $this.data('booking-url', '');
                    $this.addClass('is-error');
                    if ($this.parents('.homepage-booking-form').length) {
                        $this.parents('.homepage-booking-form').find('.icon-location-2').addClass('is-error');
                    } else {
                        $this.parents('.header-booking-form').find('.icon-location-2').addClass('is-error');
                    }
                } else {
                    $this.removeClass('is-error');
                    if ($this.parents('.homepage-booking-form').length) {
                        $this.parents('.homepage-booking-form').find('.icon-location-2').removeClass('is-error');
                    } else {
                        $this.parents('.header-booking-form').find('.icon-location-2').removeClass('is-error');
                    }
                }
            });

            if($('#headerBookingDestination').hasClass('is-focused')) {
                $('#headerBookingDestination').focus().focus().typeahead('open');
                $('#headerBookingDestination').removeClass('is-focused');
            }

            if($('#homepageBookingDestination').hasClass('is-focused')) {
                $('#homepageBookingDestination').focus().focus().typeahead('open');
                $('#homepageBookingDestination').removeClass('is-focused');
            }

            $('#headerBookingDestination').off('click.header');
            $('#homepageBookingDestination').off('click.homepage');


        }).error(function (error) {
            console.warn(error)
        });
    };



    /**
     * Export module method
     */
    parent.autoComplete = {
        setup: setup,
        setDataAttr: setDataAttr
    };

    return parent;

}(RR || {}, jQuery));/**
 * RR - Layout Events
 * Adjust, move elements based on breakpoints
 */


var RR = (function (parent, $) {
    'use strict';

    var datePickerObjs = [],
        $document = $(document),
        $headerBooking = $('.page-header .header-booking'),
        $headerBookingForm = $('.header-booking-form', $headerBooking),
        $headerBookingInput = $('.dates-booking-group .input-text, .guests-booking-group .input-text', $headerBookingForm),
        $promoToggle = $('.js-booking-promo-btn', $headerBooking),
        $promoToggleClose = $('.promo-booking-group .close', $headerBooking),
        dateFormat = $('#headerBookingCheckin').data('dateformat'),
        isAndroid = false,
        roomCode = undefined,
        $ghaAPI = $('#gha-api').val(),
        ghaLocation = '',
        ghaBrands = '',
        ghaBrandHTML = '',
        ghaDatePickerInit = false;

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


    var styleDateRange = function (checkoutDateSelector, momentCheckinDate, duration) {
        $('.pika-table').find(checkoutDateSelector).addClass('is-checkin-date');

        if (duration > 1) {
            var tempMoment = moment(momentCheckinDate.toDate());

            for (var i = 0; i < duration - 1; i++) {
                tempMoment.add(1, 'days');

                var selectedDate = tempMoment.date(),
                    selectedMonth = tempMoment.month(),
                    selectedYear = tempMoment.year(),
                    dateSelector = '';

                dateSelector = '.pika-day[data-pika-day="' + selectedDate + '"]';
                dateSelector += '[data-pika-month="' + selectedMonth + '"]';
                dateSelector += '[data-pika-year="' + selectedYear + '"]';

                $('.pika-table').find(dateSelector).addClass('is-in-range');
            };
        }
    };

    var initializeDatepicker = function (months, dateInputs, dateTriggers, containers, hasOverlay, pickerTheme) {


        var headerCheckin = $('#headerBookingCheckin').val();
        var headerCheckout = $('#headerBookingCheckout').val();
        var checkin = moment();
        var checkout = moment().add(2, 'd');
        
        if(headerCheckin)
        {
            checkin = moment(headerCheckin, "DD-MM-YYYY");
        }
        if(headerCheckout)
        {
            checkout = moment(headerCheckout, "DD-MM-YYYY");
        }

        // console.log('initialize', dateTriggers);
        var checkoutDateSelector = '',
            momentCheckinDate = moment(),
            duration = 0,
            checkinPicker,
            checkinPickerOpts,
            checkoutPicker,
            checkoutPickerOpts,
            containerId = '',
            $overlay = $('.datepicker-overlay');

        var today = moment();
        var nextDate = moment().add(1, 'days');

        // ---------------------------------------------------------------------------------------------------//
        // Check in date picker
        // ---------------------------------------------------------------------------------------------------//

        checkinPickerOpts = {
            field: document.getElementById(dateInputs.checkinId),
            theme:pickerTheme,
            minDate: today.toDate(),
            defaultDate: checkin.toDate(),
            setDefaultDate: true,
            format: dateFormat,
            maxDate: moment().add(1, 'years').toDate(),
            numberOfMonths: months,
            onSelect: function (date) {
                momentCheckinDate = moment(date);

                var selectedDate = momentCheckinDate.date(),
                    selectedMonth = momentCheckinDate.month(),
                    selectedYear = momentCheckinDate.year(),
                    momentCheckinDatePlus1 = moment(momentCheckinDate.toDate()).add(1, 'days'),
                    momentCheckinDatePlus2 = moment(momentCheckinDate.toDate()).add(2, 'days'),
                    momentCheckinDatePlus90 = moment(momentCheckinDate.toDate()).add(90, 'days'),
                    momentCheckoutDate = checkoutPicker.getMoment();

                checkoutDateSelector = '';
                checkoutDateSelector = '.pika-day[data-pika-day="' + selectedDate + '"]';
                checkoutDateSelector += '[data-pika-month="' + selectedMonth + '"]';
                checkoutDateSelector += '[data-pika-year="' + selectedYear + '"]';

                checkoutPicker.setMinDate(momentCheckinDatePlus1.toDate());
                checkoutPicker.gotoDate(momentCheckinDate.toDate());

                setDateButtonsText(momentCheckinDate, momentCheckinDatePlus1);


                // If checkout date has been selected
                /*if (checkoutPicker.getDate()) {

                    // If newly selected checkin date bigger than previously selected checkout date
                    if (momentCheckinDatePlus1.diff(momentCheckoutDate, 'days') > 0) {
                        checkoutPicker.setDate(momentCheckinDatePlus.toDate());

                    } else if (momentCheckoutDate.diff(momentCheckinDatePlus1, 'days') > 90) {
                        checkoutPicker.setDate(momentCheckinDatePlus90.toDate());
                    }

                    setDateButtonsText(momentCheckinDate, checkoutPicker.getMoment());
                }*/

                checkoutPicker.setDate(momentCheckinDatePlus2.toDate());
                setDateButtonsText(momentCheckinDate, checkoutPicker.getMoment());


                duration = checkoutPicker.getMoment().diff(momentCheckinDate, 'days');

                $('#nights-subgroup .booking-info-value').text(duration);

                

                if (duration > 1 ) {
                    $('#nights-subgroup .booking-info-text').text($("#nights-subgroup .booking-info-text").data("nights-text-plural"));
                } else {
                    $('#nights-subgroup .booking-info-text').text($("#nights-subgroup .booking-info-text").data("nights-text"));
                }

                // Redraw checkout datepicker to disable the next button once max date is reached
                checkoutPicker.draw();
            },
            onOpen: function () {
                if (hasOverlay) {
                    $overlay.addClass('is-active');
                    $('.pika-single.is-bound').addClass('is-fixed');
                }


            },
            onClose: function () {
                if (hasOverlay) {
                    $overlay.removeClass('is-active');
                    $('.pika-single.is-bound').removeClass('is-fixed');
                }

            }
        }

        if (containers) {
            checkinPickerOpts.container = document.getElementById(containers.checkinContainer);
        }

        if (dateTriggers) {
            checkinPickerOpts.trigger = document.getElementById(dateTriggers.checkinTriggerId);
        }

        // initialize datepicker
        checkinPicker = new Pikaday(checkinPickerOpts);

        // ---------------------------------------------------------------------------------------------------//
        // Check out date picker
        // ---------------------------------------------------------------------------------------------------//

        checkoutPickerOpts = {
            field: document.getElementById(dateInputs.checkoutId),
            theme:pickerTheme,
            minDate: nextDate.toDate(),
            defaultDate: checkout.toDate(),
            setDefaultDate: true,
            format: dateFormat,
            maxDate: moment().add(1, 'years').toDate(),
            numberOfMonths: months,
            onSelect: function (date) {

                var momentCheckinDate = checkinPicker.getMoment(),
                    momentCheckoutDate = moment(date);

                var tempMoment = moment(momentCheckinDate.toDate());

                duration = momentCheckoutDate.diff(momentCheckinDate, 'days');
                $('#nights-subgroup .booking-info-value').text(duration);

                if (duration > 1 ) {
                    $('#nights-subgroup .booking-info-text').text($("#nights-subgroup .booking-info-text").data("nights-text-plural"));
                } else {
                    $('#nights-subgroup .booking-info-text').text($("#nights-subgroup .booking-info-text").data("nights-text"));
                }

                setDateButtonsText(null, momentCheckoutDate);
            },
            onOpen: function () {
                styleDateRange(checkoutDateSelector, momentCheckinDate, duration);
                if (hasOverlay) {
                    $overlay.addClass('is-active');
                    $('.pika-single.is-bound').addClass('is-fixed');
                }

            },
            onDraw: function () {
                styleDateRange(checkoutDateSelector, momentCheckinDate, duration);
            },
            onClose: function () {

                if (hasOverlay) {
                    $overlay.removeClass('is-active');
                    $('.pika-single.is-bound').removeClass('is-fixed');
                }
            }
        }

        if (containers) {
            checkoutPickerOpts.container = document.getElementById(containers.checkoutContainer);
        }

        if (dateTriggers) {
            checkoutPickerOpts.trigger = document.getElementById(dateTriggers.checkoutTriggerId);
        }

        $('.booking-form-group .js-booking-search').attr('type', 'text');

        // initialize datepicker
        checkoutPicker = new Pikaday(checkoutPickerOpts);

        datePickerObjs.push(checkinPicker);
        datePickerObjs.push(checkoutPicker);

        return [checkinPicker, checkoutPicker];
    };

    var setDateButtonsText = function (checkinMoment, checkoutMoment) {

        var $headerCheckinBtn = $('#headerCheckinBtn'),
            $headerCheckoutBtn = $('#headerCheckoutBtn');

        if (checkinMoment) {
            var checkinDate = checkinMoment;

            $headerCheckinBtn.find('.date').text(checkinDate.date());
            $headerCheckinBtn.find('.month-year').text(checkinDate.format('MMMM YYYY'));
            $headerCheckinBtn.find('.day').text(checkinDate.format('ddd'));
        }

        if (checkoutMoment) {
            var checkoutDate = checkoutMoment;

            $headerCheckoutBtn.find('.date').text(checkoutDate.date());
            $headerCheckoutBtn.find('.month-year').text(checkoutDate.format('MMMM YYYY'));
            $headerCheckoutBtn.find('.day').text(checkoutDate.format('ddd'));
        }
    };

    var destroyDatePickers = function () {
        var i;

        for (i = 0; i < datePickerObjs.length; i++) {
            datePickerObjs[i].destroy();
        }
    };

    var hideDatePickers = function () {
        var i;

        for (i = 0; i < datePickerObjs.length; i++) {
            datePickerObjs[i].hide();
        }
    };

    var showPromoGroup = function ($this) {

        var $promoGroup = $this.parent().parent().find('.promo-booking-group');

        if (!$promoGroup.hasClass('is-active')) {

            $promoGroup.slideDown(200, function (e) {
                $promoGroup.addClass('is-active');
                //auto scroll down for limited height device
                $promoGroup.parent().animate({
                    scrollTop: $promoGroup.parent().prop("scrollHeight") - $promoGroup.parent().height()
                }, 200)
            });

            //$this.hide();
        }
    };

    var hidePromoGroup = function ($this) {

        var $promoGroup = $this.parent().parent();

        if ($promoGroup.hasClass('is-active')) {

            $promoGroup.slideUp(200, function (e) {
                $promoGroup.removeClass('is-active');
            });

            //$this.parent().parent().parent().find('.js-booking-promo-btn').show(200);
        }
    }


    var desktopEvents = function () {

        $document.ready(function () {

            // reset style
            $headerBookingInput.removeClass('visuallyhidden');
            $headerBooking.removeClass('is-active');
            $headerBookingForm.removeAttr('style');

            var dateInputs = {
                checkinId: 'headerBookingCheckin',
                checkoutId: 'headerBookingCheckout'
            }

            var homepageDateInputs = {
                checkinId: 'homepageBookingCheckin',
                checkoutId: 'homepageBookingCheckout'
            }

            var containers = {
                checkinContainer: 'checkin-subgroup',
                checkoutContainer: 'checkout-subgroup'
            }

            var $headerBookingToggle = $('.js-header-booking-toggle', $headerBooking),
                $bookingToggleText = $('.text', $headerBookingToggle);

            $bookingToggleText.text($bookingToggleText.data('text-open'));
            $headerBookingToggle.css('top', '');


            destroyDatePickers();

            var headerBookingMask = initializeDatepicker(2, dateInputs, null, containers, false);

            $('#headerBookingDestination').on('typeahead:select', function (ev, suggestion) {
                RR.autoComplete.setDataAttr($(this), suggestion);
                headerBookingMask[0].setMaxDate(moment().add(1, 'years').toDate());
                headerBookingMask[1].setMaxDate(moment().add(90, 'days').toDate());

                var minDateTimeStamp = '',
                    maxDateTimeStamp = '',
                    minDate = $(this).data('booking-start-date'),
                    maxDate = $(this).data('booking-end-date'),
                    selectedStartDate = moment($('#headerBookingCheckin').val(), dateFormat),
                    selectedEndDate = moment($('#headerBookingCheckout').val(), dateFormat),
                    tempMaxDate = moment().add(1, 'years'),
                    oneYearTimeStamp = moment(tempMaxDate.format('x'))._i;

                if (minDate !== undefined && minDate !== '') {
                    minDateTimeStamp = moment(moment(minDate, 'DD/MM/YYYY').format('x'))._i;
                }

                var selectedStartDateTimeStamp = moment(selectedStartDate.format('x'))._i;

                //if there is min date and the selected date is less than the min date
                if (minDate !== undefined && minDate !== '' && selectedStartDateTimeStamp <= minDateTimeStamp) {
                    minDate = moment($(this).data('booking-start-date'), 'DD/MM/YYYY');
                    headerBookingMask[0].setMinDate(minDate.toDate());
                    headerBookingMask[0].setDate(minDate.format('YYYY-MM-DD'));
                    headerBookingMask[0].setMaxDate(tempMaxDate);
                } else {
                    headerBookingMask[0].setMinDate(moment().toDate());
                    headerBookingMask[0].setDate(selectedStartDate);
                };


                if (maxDate !== undefined && maxDate !== '') {
                    maxDateTimeStamp = moment(moment(maxDate, 'DD/MM/YYYY').format('x'))._i,
                    tempMaxDate = moment($(this).data('booking-start-date'), 'DD/MM/YYYY').add(1, 'years').toDate();
                }

                var selectedEndDateTimeStamp = moment(selectedEndDate.format('x'))._i;

                //if there is max date
                if (maxDate !== undefined && maxDate !== '') {

                    //if maxdate is later than the 1 year from today, use 1 year from today date
                    if (maxDateTimeStamp < oneYearTimeStamp) {
                        tempMaxDate = moment(maxDate, 'DD/MM/YYYY');
                    }

                    //if selected date is later than maxdate, use maxdate
                    if (selectedEndDateTimeStamp > maxDateTimeStamp) {

                        if (selectedStartDateTimeStamp >= maxDateTimeStamp) {
                            headerBookingMask[0].setDate(moment(moment(maxDate, 'DD/MM/YYYY').subtract(1, 'days')).toDate());
                        }

                        headerBookingMask[1].setDate(moment(maxDate, 'DD/MM/YYYY').toDate());
                    }
                }

                headerBookingMask[0].setMaxDate(tempMaxDate);
                headerBookingMask[1].setMaxDate(tempMaxDate);
            });

            $( "#homepageBookingPromoCode, #headerBookingPromoCode" ).keyup(function() {
                $(this).addClass('has-close');

                if ($(this).val() == '') {
                    $(this).removeClass('has-close');
                }
            });


            if ($('body.homepage').length) {

                containers = {
                    checkinContainer: 'homepage-checkin-subgroup',
                    checkoutContainer: 'homepage-checkout-subgroup'
                }

                var homepageBookingMask = initializeDatepicker(2, homepageDateInputs, null, containers, false);

                $('.homepage-booking .js-booking-promo-btn').on('click', function (e) {
                    e.preventDefault();
                    showPromoGroup($(this));
                });

                $('#homepageBookingDestination').on('typeahead:select', function (ev, suggestion) {
                    RR.autoComplete.setDataAttr($(this), suggestion);

                    var minDateTimeStamp = '',
                        maxDateTimeStamp = '',
                        minDate = $(this).data('booking-start-date'),
                        maxDate = $(this).data('booking-end-date'),
                        selectedStartDate = moment($('#homepageBookingCheckin').val(), dateFormat),
                        selectedEndDate = moment($('#homepageBookingCheckout').val(), dateFormat),
                        tempMaxDate = moment().add(1, 'years'),
                        oneYearTimeStamp = moment(tempMaxDate.format('x'))._i;

                    if (minDate !== undefined && minDate !== '') {
                        minDateTimeStamp = moment(moment(minDate, 'DD/MM/YYYY').format('x'))._i;
                    }

                    var selectedStartDateTimeStamp = moment(selectedStartDate.format('x'))._i;

                    //if there is min date and the selected date is less than the min date
                    if (minDate !== undefined && minDate !== '' && selectedStartDateTimeStamp <= minDateTimeStamp) {
                        minDate = moment($(this).data('booking-start-date'), 'DD/MM/YYYY');
                        homepageBookingMask[0].setMinDate(minDate.toDate());
                        homepageBookingMask[0].setDate(minDate.format('YYYY-MM-DD'));
                        homepageBookingMask[0].setMaxDate(tempMaxDate);
                    } else {
                        homepageBookingMask[0].setMinDate(moment().toDate());
                        homepageBookingMask[0].setDate(selectedStartDate);
                    };


                    if (maxDate !== undefined && maxDate !== '') {
                        maxDateTimeStamp = moment(moment(maxDate, 'DD/MM/YYYY').format('x'))._i,
                        tempMaxDate = moment($(this).data('booking-start-date'), 'DD/MM/YYYY').add(1, 'years').toDate();
                    }

                    var selectedEndDateTimeStamp = moment(selectedEndDate.format('x'))._i;

                    //if there is max date
                    if (maxDate !== undefined && maxDate !== '') {

                        //if maxdate is later than the 1 year from today, use 1 year from today date
                        if (maxDateTimeStamp < oneYearTimeStamp) {
                            tempMaxDate = moment(maxDate, 'DD/MM/YYYY');
                        }

                        //if selected date is later than maxdate, use maxdate
                        if (selectedEndDateTimeStamp > maxDateTimeStamp) {

                            if (selectedStartDateTimeStamp >= maxDateTimeStamp) {
                                homepageBookingMask[0].setDate(moment(moment(maxDate, 'DD/MM/YYYY').subtract(1, 'days')).toDate());
                            }

                            homepageBookingMask[1].setDate(moment(maxDate, 'DD/MM/YYYY').toDate());
                        }
                    }

                    homepageBookingMask[0].setMaxDate(tempMaxDate);
                    homepageBookingMask[1].setMaxDate(tempMaxDate);
                });
            }


        });
    };

    var mobileOnlyEvents = function (monthsNumber) {
        $document.ready(function (e) {

            if (isAndroid) {//need to revisit this
                $('#headerBookingPromoCode').focus(function () {
                    $headerBookingForm.addClass('pushUp');
                });

                $('#headerBookingPromoCode').blur(function () {
                    $headerBookingForm.removeClass('pushUp');
                });
            }

            $('#headerBookingDestination').on('typeahead:select', function (ev, suggestion) {
                $('.js-submit-booking').focus();
            }).keypress(function(e) {
                var code = (e.keyCode ? e.keyCode : e.which);
                if ( (code==13) || (code==10)) {
                    $('.js-submit-booking').focus();
                    return false;
                }
            });
        }); // end document ready
    }; // end mobile only events

    var mobileEvents = function (monthsNumber) {
        var $headerBookingToggle = $('.js-header-booking-toggle', $headerBooking),
            $guestStepperButton = $('.guests-booking-group .js-stepper'),
            $nightsStepperButton = $('.dates-booking-group .js-stepper'),
            $datepickerBtn = $('.js-datepicker-btn', $headerBooking);


        $document.ready(function (e) {

            var dateInputs = {
                checkinId: 'headerBookingCheckin',
                checkoutId: 'headerBookingCheckout'
            }

            var dateTriggerInputs = {
                checkinTriggerId: 'headerCheckinBtn',
                checkoutTriggerId: 'headerCheckoutBtn'
            }

            $headerBookingInput.addClass('visuallyhidden');

            var headerCheckin = $('#headerBookingCheckin').val();
            var headerCheckout = $('#headerBookingCheckout').val();
            var checkin = moment();
            var checkout = moment().add(2, 'd');

            if(headerCheckin)
            {
                checkin = moment(headerCheckin, "DD-MM-YYYY");
            }
            if(headerCheckout)
            {
                checkout = moment(headerCheckout, "DD-MM-YYYY");
            }

            setDateButtonsText(checkin, checkout);

            destroyDatePickers();

            var headerBookingMask = initializeDatepicker(monthsNumber, dateInputs, dateTriggerInputs, false, true);

            $('#headerBookingDestination').on('typeahead:select', function (ev, suggestion) {
                RR.autoComplete.setDataAttr($(this), suggestion);
                headerBookingMask[0].setMaxDate(moment().add(1, 'years').toDate());
                headerBookingMask[1].setMaxDate(moment().add(90, 'days').toDate());

                var minDateTimeStamp = '',
                    maxDateTimeStamp = '',
                    minDate = $(this).data('booking-start-date'),
                    maxDate = $(this).data('booking-end-date'),
                    selectedStartDate = moment($('#headerBookingCheckin').val(), dateFormat),
                    selectedEndDate = moment($('#headerBookingCheckout').val(), dateFormat),
                    tempMaxDate = moment().add(1, 'years'),
                    oneYearTimeStamp = moment(tempMaxDate.format('x'))._i;

                if (minDate !== undefined && minDate !== '') {
                    minDateTimeStamp = moment(moment(minDate, 'DD/MM/YYYY').format('x'))._i;
                }

                var selectedStartDateTimeStamp = moment(selectedStartDate.format('x'))._i;

                //if there is min date and the selected date is less than the min date
                if (minDate !== undefined && minDate !== '' && selectedStartDateTimeStamp <= minDateTimeStamp) {
                    minDate = moment($(this).data('booking-start-date'), 'DD/MM/YYYY');
                    headerBookingMask[0].setMinDate(minDate.toDate());
                    headerBookingMask[0].setDate(minDate.format('YYYY-MM-DD'));
                    headerBookingMask[0].setMaxDate(tempMaxDate);
                } else {
                    headerBookingMask[0].setMinDate(moment().toDate());
                    headerBookingMask[0].setDate(selectedStartDate);
                };


                if (maxDate !== undefined && maxDate !== '') {
                    maxDateTimeStamp = moment(moment(maxDate, 'DD/MM/YYYY').format('x'))._i,
                    tempMaxDate = moment($(this).data('booking-start-date'), 'DD/MM/YYYY').add(1, 'years').toDate();
                }

                var selectedEndDateTimeStamp = moment(selectedEndDate.format('x'))._i;

                //if there is max date
                if (maxDate !== undefined && maxDate !== '') {

                    //if maxdate is later than the 1 year from today, use 1 year from today date
                    if (maxDateTimeStamp < oneYearTimeStamp) {
                        tempMaxDate = moment(maxDate, 'DD/MM/YYYY');
                    }

                    //if selected date is later than maxdate, use maxdate
                    if (selectedEndDateTimeStamp > maxDateTimeStamp) {

                        if (selectedStartDateTimeStamp >= maxDateTimeStamp) {
                            headerBookingMask[0].setDate(moment(moment(maxDate, 'DD/MM/YYYY').subtract(1, 'days')).toDate());
                        }

                        headerBookingMask[1].setDate(moment(maxDate, 'DD/MM/YYYY').toDate());
                    }
                }

                headerBookingMask[0].setMaxDate(tempMaxDate);
                headerBookingMask[1].setMaxDate(tempMaxDate);
            })

            $headerBookingToggle.off().on('click', function (e) {

                e.preventDefault();
                var $bookingToggleText = $('.text', $headerBookingToggle);

                if ($headerBooking.hasClass('is-active')) {

                    $headerBookingForm.slideUp(200, function (e) {
                        $headerBooking.removeClass('is-active');
                        $bookingToggleText.text($bookingToggleText.data('text-open'));
                        $headerBookingToggle.css('top', '');
                        if ($window.scrollTop() == 0) {
                            $headerBooking.removeClass('is-fixed');
                        }
                    });

                } else {

                    $headerBookingForm.slideDown(200, function (e) {

                        var winHeight = parseInt($window.outerHeight()),
                            formHeight = parseInt($headerBookingForm.outerHeight()),
                            toggleHeight = parseInt($headerBookingToggle.outerHeight());

                        $headerBookingForm.css('height', winHeight - toggleHeight);
                        if ((formHeight + toggleHeight) < winHeight) {

                            var doubleHeight = toggleHeight * 2,
                                offset = 10;

                            if ((formHeight + doubleHeight) < winHeight) {
                                $headerBookingToggle.css('top', '-' + (toggleHeight + offset) + 'px');
                            }
                        }

                    });

                    $headerBooking.addClass('is-fixed').addClass('is-active');
                    $bookingToggleText.text($bookingToggleText.data('text-close'));
                }
            });

            $guestStepperButton.on('touchend click', function (e) {
                e.preventDefault();

                var $this = $(this),
                    $parent = $this.parent(),
                    op = $this.data('operation'),
                    $guestNumber = $parent.find('.booking-info-value'),
                    $guestText = $parent.find('.booking-info-text'),
                    $inputGuestNumber = $parent.find('.input-text'),
                    $minGuests = parseInt($inputGuestNumber.attr('min')),
                    $maxGuest = parseInt($inputGuestNumber.attr('max')),
                    result = 0;


                $guestStepperButton.removeClass('disabled');

                if (op === 'plus') {
                    result = parseInt($guestNumber.text(), 10) + 1;

                    if (result <= $maxGuest) {
                        $guestNumber.text(result);
                        $inputGuestNumber.val(result);
                        $guestText.text($guestText.data("people-text-plural"));
                    }

                    if (result >= $maxGuest) {
                        $this.addClass('disabled');
                    }

                } else if (op === 'minus') {
                    result = parseInt($guestNumber.text(), 10);
                    if ((result - 1) <= 1) $this.addClass('disabled');
                    if ((result - 1) === 1) {
                        result -= 1;
                        $guestText.text($guestText.data("people-text"));
                        $this.addClass('disabled');

                    } else if ((result - 1) > 1) {

                        result -= 1;
                        $guestText.text($guestText.data("people-text-plural"));
                        $this.removeClass('disabled');
                    }

                    $guestNumber.text(result);
                    $inputGuestNumber.val(result);
                }
            });

            $nightsStepperButton.on('touchend click', function (e) {
                e.preventDefault();

                var $this = $(this),
                    $parent = $this.parent(),
                    op = $this.data('operation'),
                    $guestNumber = $parent.find('.booking-info-value'),
                    $guestText = $parent.find('.booking-info-text'),
                    $inputGuestNumber = $parent.find('.input-text'),
                    result = 0,
                    checkoutPicker = datePickerObjs[1],
                    tempMoment = moment(checkoutPicker.getMoment().toDate());

                if (op === 'plus') {
                    result = parseInt($guestNumber.text(), 10) + 1;

                    $guestNumber.text(result);
                    $inputGuestNumber.val(result);
                    $guestText.text($guestText.data("nights-text-plural"));

                    checkoutPicker.setMoment(tempMoment.add(1, 'days'));

                } else if (op === 'minus') {
                    result = parseInt($guestNumber.text(), 10);

                    if ((result - 1) === 1) {
                        result -= 1;
                        $guestText.text($guestText.data("nights-text"));
                        checkoutPicker.setMoment(tempMoment.subtract(1, 'days'));

                    } else if ((result - 1) > 1) {

                        result -= 1;
                        $guestText.text($guestText.data("nights-text-plural"));
                        checkoutPicker.setMoment(tempMoment.subtract(1, 'days'));
                    }

                    $guestNumber.text(result);
                    $inputGuestNumber.val(result);
                }
            });

            $('.datepicker-overlay').on('touchend click', function (e) {
                e.preventDefault();
                hideDatePickers();
            });

        }); // end document ready
    }; // end mobile events


    var setup = function () {
        $.ajax({
            type: "GET",
            url: $ghaAPI,
            datatype: 'xml',
            crossDomain: true
        }).error(function (a, b, c) {
            console.log(arguments);
        }).done(function (xml) {
            appendOptions(xml);
        });

        $document.ready(function (e) {
            var ua = navigator.userAgent.toLowerCase();

            isAndroid = ua.indexOf("android") > -1 && ua.indexOf("mobile");

            $promoToggle.on('touchend click', function (e) {
                e.preventDefault();

                showPromoGroup($(this));
            });

            $(document).find('.close').on('touchend click', function () {
                $('#homepageBookingPromoCode, #headerBookingPromoCode').val('').removeClass('has-close');
                hidePromoGroup($(this));
            });

            $('.js-submit-booking').on('click', function (e) {
                e.preventDefault();

                var bookingURL = '',
                    bookingDateFormat = '',
                    numChildren = $('#headerBookingChildrenNo').val() == undefined ? 0 : $('#headerBookingChildrenNo').val();


                if ($(this).parents('.homepage-booking-form').length) {
                    var $searchInput = $(this).parents('.homepage-booking-form').find('.js-booking-search.tt-input');
                } else {
                    var $searchInput = $(this).parents('.header-booking-form').find('.js-booking-search.tt-input');
                }

                bookingURL = $searchInput.data('booking-url');

                if ($(this).parent().parent().hasClass('homepage-booking-form')) {
                    var checkIn = $('#homepageBookingCheckin').val(),
                        checkOut = $('#homepageBookingCheckout').val(),
                        numAdults = $('#homepageBookingAdultNo').val(),
                        promoGroup = $('#homepageBookingPromotion').val(),
                        promoCode = $('#homepageBookingPromoCode').val();
                        if(promoCode == '')
                        {
                            promoCode = $('#homepageBookingPromoCode').data('fallback');
                        }
                } else {
                    var checkIn = $('#headerBookingCheckin').val(),
                        checkOut = $('#headerBookingCheckout').val(),
                        numAdults = $('#headerBookingAdultNo').val(),
                        promoGroup = $('#headerBookingPromotion').val(),
                        promoCode = $('#headerBookingPromoCode').val();
                        if(promoCode == '')
                        {
                            promoCode = $('#headerBookingPromoCode').data('fallback');
                        }
                }


                if (bookingURL == '' || bookingURL == undefined) {
                    $searchInput.addClass('is-error');
                    if ($(this).parents('.homepage-booking-form').length) {
                        $(this).parents('.homepage-booking-form').find('.icon-location-2').addClass('is-error');
                    } else {
                        $(this).parents('.header-booking-form').find('.icon-location-2').addClass('is-error');
                    }
                    return false;
                }

                if (checkIn) {

                    bookingDateFormat = $searchInput.data('date-format');

                    if (bookingDateFormat != '') {
                        checkIn = moment(checkIn, 'DD/MM/YYYY');
                        var momentCheckin = moment(checkIn).format(bookingDateFormat);
                        bookingURL = bookingURL.replace('[checkinDate]', momentCheckin);
                    } else {
                        bookingURL = bookingURL.replace('[checkinDate]', checkIn);
                    }
                } else {
                    return false;
                }

                if (bookingURL.indexOf('[checkoutDate]')) {

                    bookingDateFormat = $searchInput.data('date-format');

                    if (bookingDateFormat != '') {
                        checkOut = moment(checkOut, 'DD/MM/YYYY');
                        var momentcheckOut = moment(checkOut).format(bookingDateFormat);
                        bookingURL = bookingURL.replace('[checkoutDate]', momentcheckOut);
                    } else {
                        bookingURL = bookingURL.replace('[checkoutDate]', checkOut);
                    }
                } else {
                    var nights = $('#numOfNights').val();
                    bookingURL = bookingURL.replace('[nights]', nights);
                }

                if (numAdults) {
                    bookingURL = bookingURL.replace('[adults]', numAdults);
                } else {
                    return false;
                }

                if (bookingURL.indexOf('[children]')) {
                    bookingURL = bookingURL.replace('[children]', numChildren);
                }

                if (bookingURL.indexOf('[promogroup]')) {
                    if (promoGroup) {
                        bookingURL = bookingURL.replace('[promogroup]', promoGroup);
                    } else {
                        promoGroup = 'promo';
                        bookingURL = bookingURL.replace('[promogroup]', promoGroup);
                    }
                }

                if (bookingURL.indexOf('[promocode]')) {
                    if (promoCode) {
                        bookingURL = bookingURL.replace('[promocode]', promoCode);
                    } else {
                        bookingURL = bookingURL.replace('&' + promoGroup + '=[promocode]', '');
                    }
                }

                if (bookingURL.indexOf('[roomcode]')) {
                    var roomcode = $('#roomcode').val();

                    if (roomcode) {
                        bookingURL = bookingURL.replace('[roomcode]', roomcode);
                    } else {
                        bookingURL = bookingURL.replace('&roomcode=[roomcode]', '');
                    }
                }

                if (typeof ga !== 'undefined' && ga) {
                    ga(function (tracker) {
                        if (!tracker && ga.getAll()) {
                            tracker = (ga.getAll())[0];
                        }

                        if (tracker && window.gaplugins && window.gaplugins.Linker) {
                            var linker = new window.gaplugins.Linker(tracker);
                            bookingURL = linker.decorate(bookingURL);
                        }
                    });
                }

                var currency = checkCookie('rr_currency');
                bookingURL = bookingURL + '&currency=' + currency;

                $.ajax({
                    async: false,
                    type: "GET",
                    url: "/api/GetSitecoreProfileId",
                    datatype: 'xml',
                    crossDomain: true
                }).error(function (a, b, c) {
                    console.log(arguments);
                    // console.log(bookingURL);
                    if(promoCode)
                    {
                        window.location.href = bookingURL;
                    }
                    else
                    {
                        RR.bookingModal.redirectOrShowModalWindow(bookingURL);
                    }
                }).done(function (xml) {
                    var sitecoreID = xml.replace(/^"(.*)"$/, '$1');
                    if (sitecoreID != '') {
                        bookingURL = bookingURL + '&sitecore_profile_id=' + sitecoreID;
                    }
                    if(promoCode)
                    {
                        window.location.href = bookingURL;
                    }
                    else
                    {
                        RR.bookingModal.redirectOrShowModalWindow(bookingURL);
                    }
                });

            });

            $('.js-book-now').on('click', function (e) {
                e.preventDefault();

                var $this = $(this),
                    roomCode = $this.data('roomcode'),
                    roomName = $('.property-header .title').text();

                $('#headerBookingDestination').typeahead('val', roomName).typeahead('open');
                $('.tt-suggestion').trigger('click');
            });


            $('.js-toggle-gha').each(function () {
                var $this = $(this);

                $this.fancybox({
                    wrapCSS: 'gha-fancybox',
                    autoCenter: false,
                    autoSize: false,
                    padding: 60,
                    scrollOutside: false,
                    height: 420,
                    beforeShow: function () {
                        if (!ghaDatePickerInit) {
                            var dateInputs = {
                                checkinId: 'ghaCheckIn',
                                checkoutId: 'ghaCheckOut'
                            }

                            var dateTriggerInputs = {
                                checkinTriggerId: 'headerCheckinBtn',
                                checkoutTriggerId: 'headerCheckoutBtn'
                            }

                            initializeDatepicker(2, dateInputs, null, null, false,'gha-theme');
                            // RR.bookingForm.initializeDatepicker(2, 'ghaCheckIn', 'ghaCheckOut', 'gha-theme');
                            ghaDatePickerInit = true;
                        }

                        var $jsToggleBooking = $('.js-toggle-booking');

                        if ($jsToggleBooking.hasClass('is-active')) {
                            $('.js-toggle-booking').trigger('click');
                        }
                    }
                });
            });

            $('.js-gha-close').on('click', function (e) {
                e.preventDefault();

                if ($(window).width() >= 1024) {
                    $.fancybox.close();
                }

                if ($('.header-booking').css('opacity') == '1') {
                    $('.js-toggle-booking').trigger('click');
                }
            });

            $('#bookingDestination').val('');

            $('.gha-brown-btn').on('click', function (e) {
                e.preventDefault();

                var $ghaURL = $('#gha-url').val(),
                    $ghaCheckIn = $('.ghaCheckIn').val(),
                    $ghaCheckOut = $('.ghaCheckOut').val();

                $ghaURL = $ghaURL.replace('[CountryCode]', encodeURIComponent(ghaLocation));
                $ghaURL = $ghaURL.replace('[BrandCode]', encodeURIComponent(ghaBrands));

                $ghaCheckIn = moment($ghaCheckIn, 'DD/MM/YYYY').format('YYYY-MM-DD');
                $ghaCheckOut = moment($ghaCheckOut, 'DD/MM/YYYY').format('YYYY-MM-DD');

                $ghaURL = $ghaURL.replace('[StartDate]', encodeURIComponent($ghaCheckIn));
                $ghaURL = $ghaURL.replace('[EndDate]', encodeURIComponent($ghaCheckOut));

                window.open($ghaURL);
            })
        });
    };


    var appendOptions = function (xml) {
        var $xml = $(xml),
            ghaLocHTML = '';

        ghaBrandHTML = '';

        $xml.find('select[name="country"] option').eq(0).text($('.gha-location label').text());
        $xml.find('select[name="country"] option').each(function () {
            var $this = $(this);



            ghaLocHTML += $this[0].outerHTML;
        });

        $xml.find('select[name="brand"] option').eq(0).text($('.gha-brands label').text());
        $xml.find('select[name="brand"] option').each(function () {
            var $this = $(this);

            ghaBrandHTML += $this[0].outerHTML;
        });

        $('#ghaLocation').append(ghaLocHTML).on('change.fs update', function () {
            var $this = $(this),
                id = $this.find('option:selected').attr('id'),
                $ghaBrands = $('#gha-brands').val();

            ghaLocation = id;
            $ghaBrands = $ghaBrands.replace('[CountryCode]', encodeURIComponent(id));

            getBrands($ghaBrands);
        }).trigger('update');

        $('#ghaBrand').append(ghaBrandHTML).on('change.fs update', function () {
            var $this = $(this),
                id = $this.find('option:selected').attr('id');

            ghaBrands = id;
        }).trigger('update');
    };

    var getBrands = function (url) {
        $.ajax({
            type: "GET",
            url: url,
            datatype: 'xml',
            crossDomain: true
        }).error(function (a, b, c) {
            console.log(arguments);
        }).done(function (xml) {
            updateBrands(xml);
        });
    };

    var updateBrands = function (xml) {
        var $xml = $(xml);

        ghaBrandHTML = '';

        $xml.find('select[name="brand"] option').eq(0).text($('.gha-brands label').text());
        $xml.find('select[name="brand"] option').each(function () {
            var $this = $(this);

            ghaBrandHTML += $this[0].outerHTML;
        });

        $('#ghaBrand').empty().append(ghaBrandHTML).trigger('update');
    };


    /**
     * Export module method
     */
    parent.bookingForm = {
        setup: setup,
        desktopEvents: desktopEvents,
        mobileEvents: mobileEvents,
        mobileOnlyEvents: mobileOnlyEvents,
        destroyDatePickers: destroyDatePickers,
        initializeDatepicker: initializeDatepicker
    };

    return parent;

}(RR || {}, jQuery));
/**
 * RR - Layout Events
 * Adjust, move elements based on breakpoints
 */


var RR = (function (parent, $) {
    'use strict';

    var GroupAIdentifier = "GroupA-Visible";
    var GroupBIdentifier = "GroupB-Hidden";
    var DisplayModeShowToAllUsers = "AllUsers";
    var DisplayModeShowToHalfOfUsers = "HalfOfUsers";
    var DisplayModeShowToNoUsers = "NoUsers";

    var MemberRatesPromoCode = "";
    var DisplayMode = "";

    var ExperimentGroup = "";
    var HasViewedModalWindow = false;
    var HasAcceptedMemberRates = null;

    function GetAcceptedMemberRatesCookieValue(){
        return GetCookie("ModalWindowExperimentAcceptedMemberRates");
    }

    function GetMemberTypeCookieValue(){
        return GetCookie("MemberType");
    }

    var SetMemberRatesCookie = function (hasAcceptedRates) {
        // true / false 

        // var exdate = new Date();
        // exdate.setDate(exdate.getDate() + 365);
        // document.cookie = "ModalWindowExperimentAcceptedMemberRates="+hasAcceptedRates+"; expires=" + exdate.toUTCString() + "; path=/";
        
        // This is only triggered by email actions - set cookie as valid for session only
        document.cookie = "ModalWindowExperimentAcceptedMemberRates=" + hasAcceptedRates+"; path=/";
    }
 
    var SetMemberTypeCookie = function (memberType){
        // myoaks / email / null

        // var exdate = new Date();
        // exdate.setDate(exdate.getDate() + 365);
        //document.cookie = "MemberType="+memberType+"; expires=" + exdate.toUTCString() + "; path=/";
        
        // This is only triggered by email actions - set cookie as valid for session only
        document.cookie = "MemberType="+memberType+"; path=/";
    }

    var SetMemberETokenCookie = function (token, expiry){        
        document.cookie = "MemberEToken="+token+"; expires="+expiry+"; path=/";
        document.cookie = "metExpiry="+expiry+"; expires="+expiry+"; path=/";
    }

    function GetExperimentGroupCookie(){
        return GetCookie("ModalWindowExperimentGroup");
    }

    function GetCookie(cookieName){
        var cookieValue = "";
        var name = cookieName + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var cookies = decodedCookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i];
            //Remove whitespace before cookie name
            while (cookie.charAt(0) == ' ') {
                cookie = cookie.substring(1);
            }
            //If key cookie then return its value
            if (cookie.indexOf(name) == 0) {
                cookieValue = cookie.substring(name.length, cookie.length);
            }
        }
        return cookieValue;

    }

    var SetModalExperimentGroupCookie = function (group) {
        //Add a cookie that lasts 5 days to tell the langauge selector not to redirect to the chinese site
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + 365);
        document.cookie = "ModalWindowExperimentGroup="+group+"; expires=" + exdate.toUTCString() + "; path=/";
    }

    var SetRedirectUrls = function (acceptUrl, declineUrl){
        $("#booking-mask-modal-login-link").data("redirect-url", acceptUrl);
        $("#booking-mask-modal-register-link").data("redirect-url", acceptUrl);
        // $("#booking-mask-modal-email-submit").data("redirect-url", acceptUrl);                    
        $("#booking-mask-modal-accepted-link").data("redirect-url", acceptUrl);                    
        $("#booking-mask-modal-declined-link").data("redirect-url", declineUrl);
    }

    var ClearRedirectUrls = function(){
        $("#booking-mask-modal-login-link").data("redirect-url", "");
        $("#booking-mask-modal-register-link").data("redirect-url", "");
        // $("#booking-mask-modal-email-submit").data("redirect-url", "");                    
        $("#booking-mask-modal-accepted-link").data("redirect-url", "");                    
        $("#booking-mask-modal-declined-link").data("redirect-url", "");
    }

    var RedirectOrShowModalWindow = function(url)
    {
        var memberTypeCookie = GetMemberTypeCookieValue();
        var memberRatesCookie = GetAcceptedMemberRatesCookieValue();
         
        if(DisplayMode == DisplayModeShowToNoUsers || url.toLowerCase().indexOf("promo=") >= 0)
        {
            window.location = url;
        }
        else if(DisplayMode == DisplayModeShowToAllUsers)
        {                 
            //if(HasViewedModalWindow == false || HasAcceptedMemberRates == false)
            if(memberTypeCookie == "null" || memberTypeCookie == null)
            {
                var acceptUrl = url + "&ModalTestAcceptedMemberRates=true&promo=" + MemberRatesPromoCode;
                var declineUrl = url + "&ModalTestAcceptedMemberRates=false";

                SetRedirectUrls(acceptUrl, declineUrl);
                $("#booking-mask-modal").addClass("active");
            }
            else
            {
                //If the user has previously accepted the member rates then append the member rates promo code to the query string
                if(memberRatesCookie == "true")
                {
                    if(url.indexOf("?") >= 0)
                    {
                        url += "&";
                    }
                    else
                    {
                        url += "?";
                    }
                    url += "promo=" + MemberRatesPromoCode;

                    if(window.guest_profile != null){
                    
                        // removed as Synxis was behaving incorrectly
                        // if(window.guest_profile.email != ""){
                        //     url += "&email="+window.guest_profile.email;
                        // }
                        if(window.guest_profile.firstname != ""){
                            url += "&firstname="+window.guest_profile.firstname;
                        }
                        if(window.guest_profile.lastname){
                            url += "&lastname="+window.guest_profile.lastname;
                        }                   
                    }
                }

                window.location = url;
            }
        }
        else
        {
            //Begin appending qeury string 
            if(url.indexOf("?") >= 0)
            {
                url += "&";
            }
            else
            {
                url += "?";
            }

            if(ExperimentGroup == GroupAIdentifier)
            {
                url += "ModalTestGroup=GroupA";
                if(HasViewedModalWindow && HasAcceptedMemberRates)
                {
                    url += "&ModalTestFirstView=false";
                    url += "&ModalTestAcceptedMemberRates=true&promo=" + MemberRatesPromoCode;
                    window.location = url;
                }
                else
                {
                    url += "&ModalTestFirstView=true";
                    var acceptUrl = url + "&ModalTestAcceptedMemberRates=true&promo=" + MemberRatesPromoCode;
                    var declineUrl = url + "&ModalTestAcceptedMemberRates=false";

                    SetRedirectUrls(acceptUrl, declineUrl);
                    $("#booking-mask-modal").addClass("active");
                }

            }
            else
            {
                url += "ModalTestGroup=GroupB";
                window.location = url;
            }
        }
    }


    var setup = function () {

        var modal = $("#booking-mask-modal");
        if(modal.length)
        {
            DisplayMode = modal.data("display-mode");
            MemberRatesPromoCode = modal.data("prmo-code");

            if(DisplayMode == DisplayModeShowToHalfOfUsers)
            {
                ExperimentGroup = GetExperimentGroupCookie();
                //If the user has not beena assigned an experiment group, assign them one
                if(ExperimentGroup == "")
                {
                    ExperimentGroup = GroupAIdentifier;

                    if(Math.random() < 0.5)
                    {
                        ExperimentGroup = GroupBIdentifier;
                    }
                    SetModalExperimentGroupCookie(ExperimentGroup);
                }
            }
            //If the user should be displayed the modal window (part of groupA or a display all orverride has been used)
            if(DisplayMode == DisplayModeShowToAllUsers || ExperimentGroup == GroupAIdentifier)
            {
                var modalResultCookie = GetAcceptedMemberRatesCookieValue();
                if(modalResultCookie == "true")
                {
                    HasViewedModalWindow = true;
                    HasAcceptedMemberRates = true;
                }
                else if(modalResultCookie == "false")
                {
                    HasViewedModalWindow = true;
                    HasAcceptedMemberRates = false;
                }
            }

            $('.synxis-redirect-link').on('click', function(e){
                e.preventDefault();
                var redirectUrl = $(this).data("synxis-url");
                RedirectOrShowModalWindow(redirectUrl);
            });

            $("#booking-mask-modal-accepted-link").on('click', function(){
                HasViewedModalWindow = true;
                HasAcceptedMemberRates = true;
                SetMemberRatesCookie("true");
                SetMemberTypeCookie("email");    

                console.log($(this).data("redirect-url"));

                window.location = $(this).data("redirect-url");
            });

            $("#booking-mask-modal-declined-link").on('click', function(){
                HasViewedModalWindow = true;
                HasAcceptedMemberRates = false;
                SetMemberRatesCookie("false");
                SetMemberTypeCookie("null"); 
                $("#booking-mask-modal").removeClass("active");               
                window.location = $(this).data("redirect-url");
            });

            // $("#booking-mask-modal-email-submit").on('click', function(){
            //     // send email to API to validate and invite to register with MyOaks
                
            //     var userEmailAddress = document.getElementById("bookingMaskEmail").value;
            //     var apiUrl = "/OaksApi/PostMemberEmail";
            //     var redirectLink = $(this).data("redirect-url");
                
            //     var exdate = new Date();
            //     exdate.setDate(exdate.getDate() + 365);
            //     exdate.toUTCString();

            //     $.ajax({
            //         type: "POST",
            //         url: apiUrl,
            //         data: { MemberEmail: userEmailAddress, CookieExpiry: exdate },
            //         dataType: "json",
            //         crossDomain: true,
            //     }).success(function (data){

            //         HasViewedModalWindow = true;
            //         HasAcceptedMemberRates = true;
                    
            //         SetMemberRatesCookie("true");
            //         SetMemberTypeCookie("email");
            //         SetMemberETokenCookie(data.MemberEmail, exdate);

            //         $("#booking-mask-modal").removeClass("active");
            //         window.location = redirectLink+"&email="+userEmailAddress;

            //     }).error(function (data) {  
            //         console.log(arguments);

            //         document.getElementById("booking-mask-modal-email-feedback").style.display = "block";

            //     }).done(function () {    
            //     });                
            // });

            $("#booking-mask-modal-close-link").on('click', function(){                
                ClearRedirectUrls();
                $("#booking-mask-modal").removeClass("active");
            });
        }
        else
        {
            $('.synxis-redirect-link').on('click', function(e){
                e.preventDefault();
                alert("stop");
                window.location = $(this).data("synxis-url");
            });
        }

    };

    /**
     * Export module method
     */
    parent.bookingModal = {
        setup: setup,
        redirectOrShowModalWindow: RedirectOrShowModalWindow
    };

    return parent;

}(RR || {}, jQuery));

var RR = (function (parent, $) {
    'use strict';

    var setup = function () {

		// $.ajax({
		// 	url: '/api/token',
		// 	type: "GET",
		// 	cache: false,
		// 	timeout: 10000
		// }).done(function (data) {
		// 	$("#contact-us form").append('<input type="hidden" name="ct_token" value="' + data + '" />');
		// }).error(function(jqXHR, textStatus, errorThrown) {
		// 	console.log(textStatus);
		// });
		
		$('a.captcha').click(function() {
			$('#imgCaptcha').attr('src', $('#imgCaptcha').attr('src') + '&v=' + (Math.random() * 1000));
				
			return false;
		});
    };

    /**
     * Export module method
     */
    parent.captcha = {
        setup: setup
    };

    return parent;

}(RR || {}, jQuery));
/**
 * RR - Carousel events
 */


var RR = (function (parent, $) {
    'use strict';

    var $carousel = $('.carousel .js-carousel');
    var $propertyGallery = $('.property-gallery .js-carousel');
    var $propertyGalleryNav = $('.property-gallery nav ul');
    var $featuredLocations = $('.featured-locations .js-carousel');
    var $featuredPromotions = $('.featured-promotions .js-carousel');
    var $featuredPromotionsList = $('.featured-promotions .featured-promotion');
    var $roomTypeGallery = $('.room-gallery  .js-carousel');
    var $featuredPromotionsUnorderedList = $(".featured-locations .list");
    var isRTL = false;

    if ($('html').attr('dir') === 'rtl') {
        isRTL = true;
    }

    if (isRTL) {
        var prevArrow = '<button type="button" class="slick-prev"><span class="visuallyhidden">Previous</span><span class="icon icon-chevron-right"></span></button>';
        var nextArrow = '<button type="button" class="slick-next"><span class="visuallyhidden">Next</span><span class="icon icon-chevron-left"></span></button>';
    } else {
        var prevArrow = '<button type="button" class="slick-prev"><span class="visuallyhidden">Previous</span><span class="icon icon-chevron-left"></span></button>';
        var nextArrow = '<button type="button" class="slick-next"><span class="visuallyhidden">Next</span><span class="icon icon-chevron-right"></span></button>';
    }

    var desktopEvents = function () {
        function centerNavGallery() {
            // Need to centerlise the nav carousel
            if ($('li', $propertyGalleryNav).length < 6) {
                $propertyGalleryNav.parent().css({ 'width': 115 * $('li', $propertyGalleryNav).length + 'px' });
                $propertyGalleryNav.slick('slickSetOption', { infinite: false }, true);
            } else {
                $propertyGalleryNav.parent().css({ 'width': '' });
                $propertyGalleryNav.slick('slickSetOption', { infinite: true }, true);
            }
        }

        $(document).ready(function () {
            if ($propertyGallery.length && $propertyGallery.hasClass('slick-initialized')) {
                $propertyGallery.slick('unslick');
            }


            if ($featuredPromotionsUnorderedList.length && $featuredPromotionsUnorderedList.hasClass('slick-initialized')){
                $featuredPromotionsUnorderedList.slick('unslick');
            }

            $carousel.each(function (idx) {
                var $this = $(this);

                if ($this.hasClass('slick-initialized')) {
                    $this.slick('unslick');
                }

                $this.slick({
                    mobileFirst: true,
                    dots: false,
                    infinite: true,
                    centerMode: true,
                    centerPadding: '60px',
                    variableWidth: true,
                    rtl: isRTL,
                    prevArrow: prevArrow,
                    nextArrow: nextArrow
                });
            });

            if ($propertyGallery.length) {
                var $propertyGalleryFilter = $('.property-gallery-filter');
                var numSlidesToShowNav = $('li', $propertyGalleryNav).length;

                if ($propertyGalleryNav.length && $propertyGalleryNav.hasClass('slick-initialized')) {
                    $propertyGalleryNav.slick('unslick');
                }

                if (numSlidesToShowNav > 6) {
                    numSlidesToShowNav = 6;
                }

                $propertyGalleryNav.slick({
                    mobileFirst: true,
                    dots: false,
                    slidesToShow: numSlidesToShowNav,
                    infinite: false,
                    centerPadding: '0',
                    variableWidth: true,
                    arrows: false,
                    rtl: isRTL,
                    asNavFor: '.property-gallery .js-carousel'
                });

                $propertyGallery.slick('slickSetOption', { asNavFor: '.property-gallery nav ul' }, true);

                centerNavGallery();

                var selectedCats = 'li';
                var selectedBoxes = 0;

                $propertyGalleryFilter.on('click', 'input[type="checkbox"]', function () {
                    var $this = $(this);

                    if ($this.val() === 'all') {
                        if (!$this.is(':checked') && selectedBoxes >= 1) {
                            selectedBoxes = 0;
                            $propertyGalleryFilter.find('li input[type="checkbox"]').prop('checked', false);
                        } else {
                            selectedCats = 'li';
                            selectedBoxes = $propertyGalleryFilter.find('li').length;

                            $propertyGalleryFilter.find('li input[type="checkbox"]').prop('checked', false);
                            $propertyGalleryFilter.find('li:first-child input[type="checkbox"]').prop('checked', true);
                        }
                    } else {
                        selectedCats = '';
                        selectedBoxes = 0;

                        $propertyGalleryFilter.find('li:first-child input[type="checkbox"]').prop('checked', false);

                        $propertyGalleryFilter.find('li').each(function () {
                            var $this = $(this),
                                $inputTag = $this.find('input[type="checkbox"]');


                            if ($inputTag.is(':checked')) {
                                selectedCats += '.' + $inputTag.val() + ', ';
                                selectedBoxes += 1;
                            }
                        });

                        selectedCats = selectedCats.substring(0, (selectedCats.length - 2));
                    }

                    if (selectedBoxes === 0) {
                        selectedCats = 'li';
                        $propertyGalleryFilter.find('li:first-child input[type="checkbox"]').prop('checked', true);
                    }

                    $propertyGallery.slick('slickUnfilter');
                    $propertyGalleryNav.slick('slickUnfilter');

                    $propertyGallery.slick('slickFilter', selectedCats);
                    $propertyGalleryNav.slick('slickFilter', selectedCats);

                    $propertyGallery.slick('slickGoTo', 0);

                    centerNavGallery();
                });

                // Delegated events to assign click behaviour to cloned slide too
                $('.gallery-nav').on('click', '.js-property-item', function (evt) {
                    evt.preventDefault();

                    var $this = $(this);
                    var $parent = $this.parent();

                    $('.js-property-item', '.gallery-nav').removeClass('active');

                    $this.addClass('active');

                    if ($('li', $propertyGalleryNav).length < 6) {
                        $propertyGallery.slick('slickGoTo', $parent.index());
                    } else {
                        $propertyGallery.slick('slickGoTo', $parent.index() - 6); // minus slidesToShow value
                    }
                });
            }

            if ($featuredPromotions.length) {
                if ($featuredPromotions.hasClass('slick-initialized')) {
                    $featuredPromotions.slick('unslick');
                }

                if ($featuredPromotionsList.length > 4) {
                    $featuredPromotions.slick({
                        mobileFirst: true,
                        dots: false,
                        infinite: true,
                        centerMode: true,
                        slidesToShow: 4,
                        centerPadding: 0,
                        variableWidth: false,
                        adaptiveHeight: true,
                        rtl: isRTL,
                        prevArrow: prevArrow,
                        nextArrow: nextArrow
                    });
                }
            }
        });
    };

    var tabletEvents = function () {
        $(document).ready(function () {
            if ($propertyGallery.length) {
                if ($propertyGallery.hasClass('slick-initialized')) {
                    $propertyGallery.slick('unslick');
                }

                $propertyGallery.slick({
                    mobileFirst: true,
                    dots: false,
                    infinite: true,
                    centerMode: true,
                    slidesToShow: 3,
                    centerPadding: '60px',
                    variableWidth: false,
                    rtl: isRTL,
                    prevArrow: prevArrow,
                    nextArrow: nextArrow
                });
            }

            if ($featuredPromotions.length) {
                if ($featuredPromotions.hasClass('slick-initialized')) {
                    $featuredPromotions.slick('unslick');
                }

                if ($featuredPromotionsList.length > 3) {
                    $featuredPromotions.slick({
                        mobileFirst: true,
                        dots: false,
                        infinite: true,
                        centerMode: true,
                        slidesToShow: 3,
                        centerPadding: 0,
                        variableWidth: false,
                        adaptiveHeight: true,
                        rtl: isRTL,
                        prevArrow: prevArrow,
                        nextArrow: nextArrow,
                    });
                }
            }

            if ($featuredPromotionsUnorderedList.length && $featuredPromotionsUnorderedList.hasClass('slick-initialized')){
                $featuredPromotionsUnorderedList.slick('unslick');
            }
        });
    };

    var mobileEvents = function () {
        $(document).ready(function () {
            if ($propertyGallery.length) {
                if ($propertyGallery.hasClass('slick-initialized')) {
                    $propertyGallery.slick('unslick');
                }

                $propertyGallery.slick({
                    mobileFirst: true,
                    dots: false,
                    infinite: true,
                    centerMode: true,
                    slidesToShow: 1,
                    centerPadding: 0,
                    variableWidth: false,
                    rtl: isRTL,
                    prevArrow: prevArrow,
                    nextArrow: nextArrow
                });
            }

            if ($featuredLocations.length) {
                if ($featuredLocations.hasClass('slick-initialized')) {
                    $featuredLocations.slick('unslick');
                }

                $featuredLocations.slick({
                    mobileFirst: true,
                    dots: false,
                    infinite: true,
                    centerMode: true,
                    slidesToShow: 1,
                    centerPadding: 0,
                    variableWidth: false,
                    adaptiveHeight: true,
                    rtl: isRTL,
                    prevArrow: prevArrow,
                    nextArrow: nextArrow

                });
            }

            if ($featuredPromotions.length) {
                if ($featuredPromotions.hasClass('slick-initialized')) {
                    $featuredPromotions.slick('unslick');
                }

                if ($featuredPromotionsList.length > 1) {
                    $featuredPromotions.slick({
                        mobileFirst: true,
                        dots: false,
                        infinite: true,
                        centerMode: true,
                        slidesToShow: 1,
                        centerPadding: 0,
                        variableWidth: false,
                        adaptiveHeight: true,
                        rtl: isRTL,
                        prevArrow: prevArrow,
                        nextArrow: nextArrow
                    });
                }
            }
        });
    };

    var setup = function () {
        if ($roomTypeGallery.length) {
            $roomTypeGallery.slick({
                mobileFirst: true,
                dots: false,
                infinite: true,
                slidesToShow: 1,
                centerPadding: 0,
                variableWidth: false,
                rtl: isRTL,
                prevArrow: prevArrow,
                nextArrow: nextArrow
            });
        }
    };

    var destroy = function () {
        if ($propertyGallery.length) {
            $propertyGallery.slick('unslick');
        }
    };

    /**
     * Export module method
     */
    parent.carousel = {
        setup: setup,
        desktopEvents: desktopEvents,
        tabletEvents: tabletEvents,
        mobileEvents: mobileEvents,
        destroy: destroy
    };

    return parent;

}(RR || {}, jQuery));/**
 * RR - Accordion
 */

var RR = (function (parent, $) {
    'use strict';

    var $countrySelector= $('#jumpto'),
        $propertyDirectory= $('#oaks-hotel-directory'),
        $selectorNote= $('.note',$propertyDirectory),
        $propertyInfo=$('.property-info',$propertyDirectory);

    var desktopEvents = function () {

    };

    var tabletEvents = function () {

    };

    var mobileEvents = function () {

    };

    var setup = function () {
        $countrySelector.fancySelect({includeBlank: true}).on('change.fs', function () {
            var selectVal=$countrySelector.val();

            //$propertyDirectory.matchHeight();
            $('.matchHeight').matchHeight();

            $(this).trigger('change.$');// trigger the DOM's change event when changing FancySelect;

            // do other stuff

            if(selectVal.length > 0){
                $propertyInfo.hide();
                $selectorNote.slideUp();
                $('#'+selectVal).show();
            }
            else{
                $selectorNote.slideDown(function(){
                    $propertyInfo.hide();
                });
            }

        });


    };

    /**
     * Export module method
     */
    parent.contactUs = {
        setup: setup,
        desktopEvents: desktopEvents,
        tabletEvents: tabletEvents,
        mobileEvents: mobileEvents
    };

    return parent;

}(RR || {}, jQuery));/**
 * RR - Media Query background
 */


var RR = (function (parent, $) {
    'use strict';

    var startCookiePopup = function () {

        var cookiePolicyValue = getCookiePolicyAgreement("OaksCookiePolicy");
        if (cookiePolicyValue == "") {            
            setTimeout(FadeInCookiePopup, 750);
        };

    };
    
    function acceptCookiePolicy() {        
        setCookiePolicyAgreement("OaksCookiePolicy", "PolicyAccepted", 180);
        FadeOutCookiePopup();        
    };
    
    function setCookiePolicyAgreement(cname, cvalue, exdays) {
        var d = new Date();
        d.setTime(d.getTime() + (exdays * 24 * 60 * 60 * 1000));
        var expires = "expires=" + d.toUTCString();
        document.cookie = cname + "=" + cvalue + ";" + expires + ";path=/";
    };
        
    function getCookiePolicyAgreement(cname) {
        var name = cname + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var ca = decodedCookie.split(';');
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ') {
                c = c.substring(1);
            }
            if (c.indexOf(name) == 0) {
                return c.substring(name.length, c.length);
            }
        }
        return "";
    };

    function FadeInCookiePopup(){               
        $("#cookiePopup").fadeIn(750);
    }
    function FadeOutCookiePopup(){
        $("#cookiePopup").fadeOut(750); 
    }

    /**
     * Export module method
     */
    parent.cookiePopup = {
        startCookiePopup: startCookiePopup,
        acceptCookiePolicy: acceptCookiePolicy
    };

    return parent;

}(RR || {}, jQuery));/**
 * RR - Layout Events
 * Adjust, move elements based on breakpoints
 */


var RR = (function (parent, $) {
    'use strict';
    var GEOIP_URL='/api/getcurrencycookies';

    var setup = function () {

        var $currencyConverterDropdown = $('.currency-converter .js-currency-converter'),
            $listItem = $('#main .price');

        /* --------------------------------------------------------------
        // On initial page load
        --------------------------------------------------------------*/
        var currency = checkCookie('rr_currency'),
            country = checkCookie('rr_country');

        if (  (currency === false) 
			|| (country === false) 
			|| (currency.search(/^[A-Z|a-z]{3}$/gi) === -1)
			|| (country.search(/^[A-Z|a-z]{2}$/gi) === -1) ) {
            // Ajax call to get cookies fro`m backend
            $.ajax({
                url: GEOIP_URL,
                method: 'get',
                dataType: 'json',
                async: false
            }).done(function(data) {
                if (data.rr_currency !== undefined) {
                    setCookie('rr_currency', data.rr_currency);
                } else {
                    setCookie('rr_currency', 'AUD');
                }

                if (data.rr_country !== undefined) {
                    setCookie('rr_country', data.rr_country);
                } else {
                    setCookie('rr_country', 'AU');
                }
            })
        }

        currency = checkCookie('rr_currency');
        country = checkCookie('rr_country');

        if ($currencyConverterDropdown.length) {
            $currencyConverterDropdown.val(currency);
            $currencyConverterDropdown.trigger('update.fs');
        }

        var rate = $currencyConverterDropdown.find('option:selected').data('fxrate');

        function changeCurrency(rate) {

            $listItem.each(function (idx) {
                if($(this).find('.currency-converter').length) {
                    var $this = $(this),
                        $itemPrice = $this.find('.rate-value'),
                        $itemCurrency = $this.find('.currency'),
                        $baseRate = $itemPrice.attr('data-baserate').toString().replace(/\,/g,"."),
                        $localCurrency = $itemPrice.attr('data-localcurrency');

                    // console.log($localCurrency, $('.js-currency-converter').val());

                    if ($localCurrency == $('.js-currency-converter').val()) {
                        var result = $itemPrice.data('localprice');
                    } else {
                        var result = Math.round(rate * $baseRate);
                    }

                    // German and Russian use dots for thousand separator
                    if($('html').attr('lang') === 'ru' || $('html').attr('lang') === 'de' || $('html').attr('lang') === 'gn' || $('html').attr('lang') === 'pt' || $('html').attr('lang') === 'da' || $('html').attr('lang') === 'el' || $('html').attr('lang') === 'id' || $('html').attr('lang') === 'it' || $('html').attr('lang') === 'nl' || $('html').attr('lang') === 'ro' || $('html').attr('lang') === 'sl' || $('html').attr('lang') === 'tr') {
                        result = result.format(0, 3, '.', ',');
                    } else {
                        result = result.format(0, 3, ',', '.');
                    }

                    $itemPrice.text(result);
                    $itemCurrency.text(currency);
                }
            });

        }

        if($listItem !== null){
            changeCurrency(rate);
        }

        if($('.currency').length) {
            $('.currency').each(function() {
                var $this = $(this);
                if ($this.parent().hasClass('price')) {
                    var $itemPrice = $this.next('.rate-value'),
                        $baseRate = $itemPrice.attr('data-baserate').toString().replace(/\,/g,"."),
                        $localCurrency = $itemPrice.attr('data-localcurrency');

                    if ($localCurrency == $('.js-currency-converter').val()) {
                        var result = $this.next('.rate-value').data('localprice');
                    } else {
                        var result = Math.round(rate * $baseRate);
                    }

                    // German and Russian use dots for thousand separator
                    if (result) {
                        if($('html').attr('lang') === 'ru' || $('html').attr('lang') === 'de' || $('html').attr('lang') === 'gn' || $('html').attr('lang') === 'pt' || $('html').attr('lang') === 'da' || $('html').attr('lang') === 'el' || $('html').attr('lang') === 'id' || $('html').attr('lang') === 'it' || $('html').attr('lang') === 'nl' || $('html').attr('lang') === 'ro' || $('html').attr('lang') === 'sl' || $('html').attr('lang') === 'tr') {
                            result = result.format(0, 3, '.', ',');
                        }else{
                            result = result.format(0, 3, ',', '.');
                        }
                    }

                    $this.text(currency);
                    $this.next('.rate-value').text(result);
                } else {
                    var baserate = $this.attr('data-baserate'),
                        localCurrency = $this.attr('data-localcurrency'),
                        activeCurrency = $this.text().substring(0, 3),
                        result = null,
                        calcRate = null;

                    if (typeof localCurrency === typeof undefined || localCurrency === false) {
                        $this.attr('data-localcurrency', activeCurrency);
                    }

                    if (typeof baserate === typeof undefined || baserate === false) {
                        if($('html').attr('lang') === 'ru' || $('html').attr('lang') === 'de' || $('html').attr('lang') === 'gn' || $('html').attr('lang') === 'pt' || $('html').attr('lang') === 'da' || $('html').attr('lang') === 'el' || $('html').attr('lang') === 'id' || $('html').attr('lang') === 'it' || $('html').attr('lang') === 'nl' || $('html').attr('lang') === 'ro' || $('html').attr('lang') === 'sl' || $('html').attr('lang') === 'tr') {
                            var price  = $this.text().substring(4).replace(/\./g,"").replace(/\,/g,".");
                        } else {
                            var price  = $this.text().substring(4).replace(/\,/g,"");
                        }
                        $this.attr('data-baserate', price);
                        baserate = price;
                    }

                    if (activeCurrency == $('.js-currency-converter').find('option:selected').val() || localCurrency == $('.js-currency-converter').find('option:selected').val()) {
                        result = parseFloat(baserate);
                    } else {
                        calcRate = rate / $('.js-currency-converter').find('option[value="' + activeCurrency + '"]').data('fxrate');
                        result = Math.round(calcRate * baserate);
                    }

                    // German and Russian use dots for thousand separator
                    if (result) {
                        if($('html').attr('lang') === 'ru' || $('html').attr('lang') === 'de' || $('html').attr('lang') === 'gn' || $('html').attr('lang') === 'pt' || $('html').attr('lang') === 'da' || $('html').attr('lang') === 'el' || $('html').attr('lang') === 'id' || $('html').attr('lang') === 'it' || $('html').attr('lang') === 'nl' || $('html').attr('lang') === 'ro' || $('html').attr('lang') === 'sl' || $('html').attr('lang') === 'tr') {
                            result = result.format(0, 3, '.', ',');
                        }else{
                            result = result.format(0, 3, ',', '.');
                        }
                    }
                    $this.text(currency + ' ' + result);
                }
            });
        }

        /* --------------------------------------------------------------
        // On currency change
        --------------------------------------------------------------*/

        $currencyConverterDropdown.on('change', function (e) {
            var $this = $(this),
                rate = $this.find('option:selected').data('fxrate'),
                currency = $this.val();

            $currencyConverterDropdown.val(currency);
            $currencyConverterDropdown.trigger('update.fs');

            if($('.currency').length) {
                $('.currency').each(function() {
                    var $this = $(this);

                    if ($this.parent().hasClass('price')) {
                        var $itemPrice = $this.next('.rate-value'),
                            $baseRate = $itemPrice.attr('data-baserate').toString().replace(/\,/g,"."),
                            $localCurrency = $itemPrice.attr('data-localcurrency');

                        if ($localCurrency == $('.js-currency-converter').val()) {
                            var result = $this.next('.rate-value').data('localprice');
                        } else {
                            var result = Math.round(rate * $baseRate);
                        }

                        // German and Russian use dots for thousand separator
                        if (result) {
                            if($('html').attr('lang') === 'ru' || $('html').attr('lang') === 'de' || $('html').attr('lang') === 'gn' || $('html').attr('lang') === 'pt' || $('html').attr('lang') === 'da' || $('html').attr('lang') === 'el' || $('html').attr('lang') === 'id' || $('html').attr('lang') === 'it' || $('html').attr('lang') === 'nl' || $('html').attr('lang') === 'ro' || $('html').attr('lang') === 'sl' || $('html').attr('lang') === 'tr') {
                                result = result.format(0, 3, '.', ',');
                            }else{
                                result = result.format(0, 3, ',', '.');
                            }
                        }

                        $this.text(currency);
                        $this.next('.rate-value').text(result);

                    } else {
                        var baserate = $this.attr('data-baserate'),
                            localCurrency = $this.attr('data-localcurrency'),
                            activeCurrency = $this.text().substring(0, 3),
                            result = null,
                            calcRate = null;

                        if (typeof localCurrency === typeof undefined || localCurrency === false) {
                            $this.attr('data-localcurrency', activeCurrency);
                        }

                        if (typeof baserate === typeof undefined || baserate === false) {
                            if($('html').attr('lang') === 'ru' || $('html').attr('lang') === 'de' || $('html').attr('lang') === 'gn' || $('html').attr('lang') === 'pt' || $('html').attr('lang') === 'da' || $('html').attr('lang') === 'el' || $('html').attr('lang') === 'id' || $('html').attr('lang') === 'it' || $('html').attr('lang') === 'nl' || $('html').attr('lang') === 'ro' || $('html').attr('lang') === 'sl' || $('html').attr('lang') === 'tr') {
                                var price  = $this.text().substring(4).replace(/\./g,"").replace(/\,/g,".");
                            } else {
                                var price  = $this.text().substring(4).replace(/\,/g,"");
                            }
                            $this.attr('data-baserate', price);
                            baserate = price;
                        }

                        if (localCurrency == $('.js-currency-converter').find('option:selected').val()) {
                            result = parseFloat(baserate);
                        } else {
                            calcRate = rate / $('.js-currency-converter').find('option[value="' + localCurrency + '"]').data('fxrate');
                            result = Math.round(calcRate * baserate);
                        }
                        // German and Russian use dots for thousand separator
                        if (result) {
                            if($('html').attr('lang') === 'ru' || $('html').attr('lang') === 'de' || $('html').attr('lang') === 'gn' || $('html').attr('lang') === 'pt' || $('html').attr('lang') === 'da' || $('html').attr('lang') === 'el' || $('html').attr('lang') === 'id' || $('html').attr('lang') === 'it' || $('html').attr('lang') === 'nl' || $('html').attr('lang') === 'ro' || $('html').attr('lang') === 'sl' || $('html').attr('lang') === 'tr') {
                                result = result.format(0, 3, '.', ',');
                            }else{
                                result = result.format(0, 3, ',', '.');
                            }
                        }

                        $this.text(currency + ' ' + result);
                    };

                });
            }

            changeCurrency(rate);

            setCookie('rr_currency', currency);
        });

    };

    /**
     * Export module method
     */
    parent.currencyConverter = {
        setup: setup
    };

    return parent;

}(RR || {}, jQuery));
/**
 * Gooogle Custom Search
 */
var RR = (function (parent, $) {
    'use strict';

    var appKey = 'AIzaSyB5Ax61bJdiYQhqO_4h66bNvJMHOXufRB4',
        cx = '005131127789740341950:neddnd4nbis',
        $searchInput = $('.google-search input[type=text]'),
        $searchButton = $('.google-search .button'),
        autoSuggestSrc = [],
        params = window.location.search.substr(1).split('&'),
        dataLength = 0;

    var setup = function () {
        if (getURIParameter('q') !== null) {
            $searchInput.val(getURIParameter('q')).parent().addClass('active');
        }

        // Header Search Bar
        $searchInput.on('keyup', function (e) {
            var $this = $(this),
                keycode = (e.keyCode ? e.keyCode : e.which);

            e.stopPropagation();

            if (keycode == '13' && $this.val() !== '') {
                $searchButton.trigger('click');
            } else {
                return false;
            }
        }).on('focus', function () {
            var $this = $(this),
                $parent = $this.parent();

            $parent.addClass('active');
        }).on('blur', function () {
            var $this = $(this),
                $parent = $this.parent();

            if ($this.val() == '') {
                $parent.removeClass('active');
            }
        });

        $searchButton.on('click', function () {
            search($searchInput.val());
        });

        $('.google-search').on('click', '.js-clear-search', function (e) {
            e.preventDefault();

            if ($searchInput.val() !== '') {
                $searchInput.val('').focus();
            } else {
                $searchInput.focus();
            }
        });
    };

    var getURIParameter = function (param, asArray) {
        return document.location.search.substring(1).split('&').reduce(function (p,c) {
            var parts = c.split('=', 2).map(function (param) {
                return decodeURIComponent(param);
            });

            if (parts.length == 0 || parts[0] != param) {
                return (p instanceof Array) && !asArray ? null : p;
            }

            return asArray ? p.concat(parts.concat(true)[1]) : parts.concat(true)[1];
        }, []);
    }

    var search = function (param) {
        window.location.href = '/oaks/search/?q=' + encodeURIComponent(param);
    };

    /**
     * Export module method
     */
    parent.googleCustomSearch = {
        setup : setup,
        search : search
    };

    return parent;

})(RR || {}, jQuery);/**
 * RR - Google map setup
 */
var RR = (function (parent, $, undefined) {

    var $window = $(window),
        $map = $('.google-map'),
        isDraggable = false,
        origin,
        globalMapData,
        googleMarker = new Array(),
        locationMarkers = new Array(),
        locationMarker,
        directionsDisplay,
        whatsAroundIdx
        htmlLang = $('html').attr('lang');

        function getCountryCookie(cname) {
            var name = cname + "=";
            var decodedCookie = decodeURIComponent(document.cookie);
            var ca = decodedCookie.split(';');
            for (var i = 0; i < ca.length; i++) {
                var c = ca[i];
                while (c.charAt(0) == ' ') {
                    c = c.substring(1);
                }
                if (c.indexOf(name) == 0) {
                    return c.substring(name.length, c.length);
                }
            }
            return "";
        };

    // load google map asynchronously
    var loadGoogleMap = function () {
        /**
         * Determine if user is from CN or not
         */            
        if (getCountryCookie("rr_country") != "CN") {
            console.log("Google Map loading...");

            var script = document.createElement('script'),
                scriptStr = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCV9iXCCss2aJ8gcxu8rh1kuGoxGun5c4o&v=3.exp&callback=RR.googleMap.load';

            if ($('html').attr('lang') == 'zh' || $('html').attr('lang') == 'cn') {
                scriptStr = 'https://maps.googleapis.com/maps/api/js?key=AIzaSyCV9iXCCss2aJ8gcxu8rh1kuGoxGun5c4o&v=3.exp&callback=RR.googleMap.load&language=zh-CN';
            }

            script.type = 'text/javascript';
            script.src = scriptStr;
            document.body.appendChild(script);
        }
    };

    // Creating Property Marker
    var createMarker = function (markerData, map, i) {

        var position = markerData.position,
            title = markerData.content.title,
            marker = markerData.content.marker;

        var icon = {
            url: marker,
            size: new google.maps.Size(78,78), // the orignal size
            origin: new google.maps.Point(0,0), // position in the sprite
            anchor: new google.maps.Point(39,39),
            index: 1
        };

        var marker = new google.maps.Marker({
            position: position,
            map: map,  // google.maps.Map
            title: title,
            icon: icon,
            id: i
        });

        origin = position;
        googleMarker.push(marker);
    };

    // Setup Property Marker
    var setupMarker = function (markersData, map) {
        googleMarker = new Array();

        createMarker(markersData[0], map, 0);
    };

    // Creating Location Markers (Plural)
    var createLocationMarkers = function (data, map, i) {
        var position = data.position,
            title = data.content.title,
            marker = data.content.marker;

        var icon = {
            url: marker,
            size: new google.maps.Size(78,78), // the orignal size
            origin: new google.maps.Point(0,0), // position in the sprite
            anchor: new google.maps.Point(39,39),
            index: 1
        };

        var marker = new google.maps.Marker({
            position: position,
            map: map,  // google.maps.Map
            title: title,
            icon: icon,
            id: i
        });

        var $locationMapList = $('.location-map-list');
        google.maps.event.addListener(marker, 'click', function () {
            $locationMapList.find('li:nth-child(' + (whatsAroundIdx + 1) + ') li:nth-child(' + (marker.id + 1) + ') .js-location-list-toggle').trigger('click');
        });

        locationMarkers.push(marker);
    };

    // Setup Location Markers (Plural)
    var setupLocationMarkers = function (map, idx) {
        var aroundTheArea = globalMapData.aroundTheArea[idx];

        clearLocationMarkers();

        for (var i = 0; i < aroundTheArea.length; i++) {
            createLocationMarkers(aroundTheArea[i], map, i);
        }
    };

    // Setting Up Event Listeners (Clicks and what not)
    var setListeners = function (map) {
        var $jsLocationListingToggle = $('.js-location-listing-toggle'),
            $locationMapList = $('.location-map-list'),
            $locationListingToggle = $('.location-listing-toggle');

        if ($locationMapList.length) {
            $jsLocationListingToggle.on('click', function (evt) {
                evt.preventDefault();

                var $this = $(this),
                    $parent = $this.parent(),
                    $next = $this.next();

                if (!$parent.hasClass('active')) {
                    $locationMapList.find('.active').removeClass('active');
                    $locationMapList.find('.icon-minus').removeClass('icon-minus').addClass('icon-plus');
                    $locationMapList.find('ul').slideUp();

                    $parent.toggleClass('active');
                    $this.find('.icon').toggleClass('icon-plus').toggleClass('icon-minus');
                    $next.slideToggle();

                    whatsAroundIdx = $parent.index();
                    setupLocationMarkers(map, $parent.index());
                } else {
                    clearLocationMarkers();
                    clearDirectionDisplay();

                    // var pt = new google.maps.LatLng(lat, lng);

                    map.setCenter(globalMapData.mainMarker[0].position);
                    map.setZoom(globalMapData.mapOptions.zoom);

                    $parent.toggleClass('active');
                    $this.find('.icon').toggleClass('icon-plus').toggleClass('icon-minus');
                    $next.slideUp();
                }
            });

            var $jsLocationListToggle = $('.js-location-list-toggle');

            $jsLocationListToggle.on('click', function (e) {
                e.preventDefault();

                // clearLocationMarkers();
                var $this = $(this),
                    $parent = $this.parent(),
                    $grandParent = $parent.parent().parent(),
                    $grandParentIndex = $grandParent.index(),
                    $childIndex = $parent.index(),
                    position = globalMapData.aroundTheArea[$grandParentIndex][$childIndex].position,
                    marker = globalMapData.aroundTheArea[$grandParentIndex][$childIndex].content.marker;

                $grandParent.find('.active').removeClass('active');
                $this.addClass('active');

                requestDirections(map, origin, position);
            });
        }
    };

    // Clears Location Markers from map
    var clearLocationMarkers = function () {
        if (locationMarkers.length) {
            for (var i = 0, l = locationMarkers.length; i < l; i++) {
                locationMarkers[i].setMap(null);
            };
        }

        locationMarkers = [];
    };

    // Clears Directions from 2 points
    var clearDirectionDisplay = function () {
        if (directionsDisplay !== undefined) {
            directionsDisplay.setMap(null);
        }
    };

    // Calls Google API for directions
    var requestDirections = function (map, org, dest) {

        clearDirectionDisplay();

        var request = {
            origin: org,
            destination: dest,
            travelMode: google.maps.DirectionsTravelMode.DRIVING
        },
        directionsService = new google.maps.DirectionsService(),
        rendererOptions = {
            map: map,
            suppressMarkers: true
        };

        directionsDisplay = new google.maps.DirectionsRenderer(rendererOptions);

        directionsService.route(request, function (response, status) {
            if (status == google.maps.DirectionsStatus.OK) {
                directionsDisplay.setDirections(response);
            } else {
                alert ('failed to get directions');
            }
        });
    }

    var load = function () {
        var map,
            mapOptions;


        // GENERAL MAP
        if ($map.length && mapData) {

            // mapData is inline json object
            var markersData = mapData.mainMarker,
                center,
                controlPosition;

            globalMapData = mapData;
            center = mapData.mapOptions.center;
            controlPosition = google.maps.ControlPosition.RIGHT_TOP;

            var mapOptions = {
                draggable      : isDraggable,
                center         : center,
                zoom           : mapData.mapOptions.zoom,
                scrollwheel    : mapData.mapOptions.scrollwheel,
                mapTypeControl : mapData.mapOptions.mapTypeControl,
                mapTypeId      : mapData.mapOptions.mapTypeId,
                panControlOptions: {
                    position: controlPosition
                },
                zoomControlOptions: {
                    position: controlPosition
                },
                streetViewControlOptions: {
                    position: controlPosition
                }
            }

            setTimeout(function () {
                map = new google.maps.Map(document.getElementById('map'), mapOptions);
                setupMarker(markersData, map);

                setListeners(map);
            }, 200);
        }
    };

    // initial load
    $window.load(function () {

        if ($map.length) {

            // Place image placeholder in the back of the map
            if ($map.find('img').length) {
                $map.css({
                    'background-image': 'url(' + $map.find('img').attr('src') + ')',
                    'background-repeat': 'no-repeat',
                    'background-size': 'cover'
                });
            }

             if (RR.mediaQuery.check() === 'mobile' || RR.mediaQuery.check() === 'tablet' || RR.mediaQuery.hasTouch()) {
                isDraggable = false;
            }else{
                isDraggable = true;
            }
            
            try{

                // initiate lazy load
                var options = {
                    rootMargin: '400px',
                    threshold: 0
                }

                var observableMap = document.getElementById('map')

            var observer = new IntersectionObserver(
                function (entries, observer) {                            
                    var isIntersecting = typeof entries[0].isIntersecting === 'boolean' ? entries[0].isIntersecting : entries[0].intersectionRatio > 0
                    if (isIntersecting) {
                        loadGoogleMap();
                        observer.unobserve(observableMap)
                    }
                },
                options
                )

                observer.observe(observableMap)
            }
            catch(ex){
                console.log("Error initialising lazy load for map");
                console.log(ex);
                loadGoogleMap();
            }
        }
    });

    parent.googleMap = {
        load: load
    }

    return parent;

}(RR || {}, jQuery));
/**
 * RR - Layout Events
 * Adjust, move elements based on breakpoints
 */


var RR = (function (parent, $) {
    'use strict';

    var $footerBrand = $('.footer-brands .footer-brand-link');
    var $featuredLocationContent = $('.featured-location .featured-location-content');

    var isRTL = false;

    if ($('html').attr('dir') === 'rtl') {
        isRTL = true;
    }


    var desktopEvents = function () {
        $(document).ready(function () {
            var $pageFooter = $('.page-footer .footer-nav'),
                $offCanvas = $('.off-canvas');

            // Match heights stuff
            $featuredLocationContent.matchHeight();

            $('.offer-places-item').matchHeight();

            $('.location .has-matched-height').matchHeight({
                byRow: true
            });

            $('.events .has-matched-height').matchHeight();
            $('.mega-menu .location-nav-item').matchHeight();
            $('.offer-list-item .offer-list-image').matchHeight();
            $('.offer-list-item .offer-list-body').matchHeight();

            $pageFooter.detach();

            $('.page-footer .footer-location-nav').after($pageFooter);

            $('#main').removeClass('has-top-margin');

            $offCanvas.each(function (idx) {
                var $this = $(this);

                if ($this.hasClass('is-active')) {
                    $this.find('.js-off-canvas-toggle').trigger('click');

                };

            });

            var widthPromo = $('.homepage-booking .booking-form-gha').width() + 30;

            // if (isRTL) {
            //     $('.homepage-booking .promo-booking-group').css({'left': widthPromo});
            // } else {
            //     $('.homepage-booking .promo-booking-group').css({'right': widthPromo});
            // }

            //move promo code


        });
    };

    var tabletEvents = function () {

        $(document).ready(function () {
            $featuredLocationContent.matchHeight();

            $('.offer-places-item').matchHeight();

            $('.location .has-matched-height').matchHeight({
                byRow: true
            });

            $footerBrand.matchHeight({
                byRow: true
            });

            $('.offer-list-item .offer-list-image').matchHeight();
            $('.offer-list-item .offer-list-body').matchHeight();


        });
    };

    var mobileEvents = function () {

        $(document).ready(function () {
            $featuredLocationContent.matchHeight();

            $footerBrand.matchHeight({
                byRow: true
            });

        });

    };

    var setup = function () {
        if(isRTL) {
            $('.featured-location-content .btn').each(function(){
                var content = $(this).text();
                $(this).html('<span class="icon icon-chevron-right"></span>'+content);
            });
            $('.offer-list-item .btn').each(function(){
                var content = $(this).text();
                $(this).html('<span class="icon icon-chevron-right"></span>'+content);
            });
            $('.offer-list-rate + .btn').each(function(){
                var content = $(this).text();
                $(this).html('<span class="icon icon-chevron-right"></span>'+content);
            });
            $('.offer-grid-item .btn').each(function(){
                var content = $(this).text();
                $(this).html('<span class="icon icon-chevron-right"></span>'+content);
            });
        }

        //set instagram to have ellipsis
        $(".instagram-details").dotdotdot({
            watch       : true
        });

    };

    /**
     * Export module method
     */
    parent.layoutComposer = {
        setup: setup,
        desktopEvents: desktopEvents,
        tabletEvents: tabletEvents,
        mobileEvents: mobileEvents
    };

    return parent;

}(RR || {}, jQuery));/**
 * RR - Listeners
 * All major event listeners
 */


var RR = (function (parent, $) {
    'use strict';

    var devicePlatform = null,
        collapsedHeight,
        expandedHeight,
        sectionWatchers = [];

    var setup = function () {

        // Featured Amenities Toggle
        var $jsAmenitiesToggle = $('.js-amenities-toggle'),
            $featuredAmenities = $('.featured-amenities'),
            $pageHeader = $('.page-header');

        if ($featuredAmenities.length && $('.feature',$featuredAmenities).length > 6) {
            $jsAmenitiesToggle.find('.text').text($jsAmenitiesToggle.data('text-more'));

            $jsAmenitiesToggle.on('click', function (e) {
                e.preventDefault();
                var $this = $(this);

                $this.toggleClass('active');
                $this.find('.icon').toggleClass('icon-chevron-down').toggleClass('icon-chevron-up');

                if ($this.hasClass('active')) {

                    TweenMax.to('.featured-amenities', 0.75, { height: expandedHeight, ease: Expo.easeOut });
                    TweenMax.to('.feature-overlay', 0.75, { opacity: 0, ease: Expo.easeOut });

                    $this.find('.text').text($this.data('text-less'));
                } else {

                    var sectionScrollPosition = $('.section[data-section="Features"]').offset().top - $pageHeader.find('.header-navbar').outerHeight()  - $pageHeader.find('.header-booking').outerHeight();

                    TweenMax.to(window, 0.75, { scrollTo: { y: sectionScrollPosition, ease: Ease.easeInOut }});

                    TweenMax.to('.featured-amenities', 0.75, { height: collapsedHeight, ease: Expo.easeOut });
                    TweenMax.to('.feature-overlay', 0.75, { opacity: 1, ease: Expo.easeOut });

                    $this.find('.text').text($this.data('text-more'));

                }
            });
        }
        else $jsAmenitiesToggle.remove();


        var $jsToggleText = $('.js-toggle-text'),
            $featuredEvent = $('.event-text'),
            featuredEventHeight;

        if ($jsToggleText.length) {

            $featuredEvent.each(function () {
                var $this = $(this);
                if ($this.parentsUntil('event').hasClass('featured-event')) {
                    if ($this.height() > 250) {
                        $this
                            .data('orig-height', $this.height())
                            .css({
                                height: 250
                            });
                    } else {
                        $this.addClass('short');
                        $this.siblings('.js-toggle-text').hide();
                    }
                } else {
                    if ($this.height() > 80) {
                        $this
                            .data('orig-height', $this.height())
                            .css({
                                height: 80
                            });
                    } else {
                        $this.addClass('short');
                        $this.siblings('.js-toggle-text').hide();
                    }
                }

            });


            $('.js-toggle-text').on('click', function (e) {
                e.preventDefault();

                var $this = $(this),
                    $prev = $this.prev(),
                    $more = $this.data('more'),
                    $less = $this.data('less');

                $prev.toggleClass('expanded');

                if ($prev.hasClass('expanded')) {
                    $this.text($less);

                    TweenMax.to($prev, 0.75, {
                        height: $prev.data('orig-height'),
                        ease: Expo.easeOut
                    });
                } else {
                    $this.text($more);

                    if ($this.parentsUntil('event').hasClass('featured-event')) {
                        TweenMax.to($prev, 0.75, {
                            height: 250,
                            ease: Expo.easeOut
                        });
                    } else {
                        TweenMax.to($prev, 0.75, {
                            height: 80,
                            ease: Expo.easeOut
                        });
                    }

                }
            });
        }

        //fill up email parameter for fancybox href
        $('#inputEmailNewsletter').keydown(function (e) {
          var keyCode = e.keyCode || e.which;

          if (keyCode == 13) {
            $('.js-form-lightbox-need-validate').trigger('click');
            return false;
          }
        });
    };

    var scrollingEvents = function () {

        // Property Listing
        var $propertyHeader = $('.property-header'),
            $propertyFooter = $('.property-footer'),
            $section = $('.section');

        for (var i = sectionWatchers.length - 1; i >= 0; i--) {
            sectionWatchers[i].destroy();
        };

        sectionWatchers = [];

        if ($propertyFooter.length) {

            var sections = [];

            $section.each(function (i, el) {
                var $this = $(this);


                if ($this.is(':visible')) {
                    var sectionWatcher = scrollMonitor.create(el);
                    sectionWatchers.push(sectionWatcher);

                    if ($this.data('section') !== undefined) {
                        sections.push($this.data('section'));
                    }

                    sectionWatcher.enterViewport (function () {

                        var $this = $(el),
                            sectionIdx = $.inArray($this.data('section'), sections),
                            sectionText = sections[sectionIdx + 1];

                        if ($this.data('section') !== undefined && sectionWatcher.isBelowViewport) {
                            $propertyFooter.find('span').text(sectionText);
                            $propertyFooter.find('button').data('next-section',  sectionText);

                            // $propertyHeader.find('.active').removeClass('active');
                            // $propertyHeader.find('li:nth-child(' + (sectionIdx + 1) + ') a').addClass('active');

                            TweenMax.to('.property-footer', 0.75, { autoAlpha: 1, ease: Expo.easeOut });
                        } else {
                            TweenMax.to('.property-footer', 0.75, { autoAlpha: 0, ease: Expo.easeOut });
                        }


                        if (sections[sections.length - 1] === $this.data('section')) {
                            TweenMax.to('.property-footer', 0.75, { autoAlpha: 0, ease: Expo.easeOut });
                        }
                    });
                }
            });

            $propertyFooter.on('click touchend', 'button', function (e) {
                e.preventDefault();
                var $this = $(this),
                    $pageHeader = $('.page-header');

                TweenMax.to(window, 1, { scrollTo: { y: $('.section[data-section="' + $this.data('next-section') + '"]').offset().top - $pageHeader.find('.header-navbar').outerHeight() - $pageHeader.find('.header-booking').outerHeight(), ease: Ease.easeInOut }});
            });
        }
    }

    var calcAmenitiesHeight = function () {
        var $jsAmenitiesToggle = $('.js-amenities-toggle'),
            $featuredAmenities = $('.featured-amenities');

        // Check if featured-amenities is present in page
        if (!$featuredAmenities.length || $('.feature',$featuredAmenities).length < 7) {
            return false;
        }

        if ($jsAmenitiesToggle.hasClass('active')) {
            $jsAmenitiesToggle.removeClass('active');
            $jsAmenitiesToggle.find('.icon').addClass('icon-chevron-down').removeClass('icon-chevron-up');
            $jsAmenitiesToggle.find('.text').text($jsAmenitiesToggle.data('text-more'));
            TweenMax.set('.feature-overlay', { opacity: 1 });
        }

        // Set the element to full height to get actual height for TweenMax
        TweenMax.set('.featured-amenities', { height: '100%' });

        // Manually Trigger matchHeight for proper height of featured-amenities
        $.fn.matchHeight._update();

        // Store the expanded height for TweenMax
        expandedHeight = $('.featured-amenities').outerHeight();

        // get the collapsed height of the element.  Different across all platforms
        switch (devicePlatform){
            case 'mobile':
                collapsedHeight = 135;
                for (var i = 0; i < 4; i++) {
                    collapsedHeight += $featuredAmenities.find('.feature:eq(' + i + ')').outerHeight();
                }
                break;

            case 'tablet':
                collapsedHeight = 25;
                for (var i = 0; i < 6; i+=2) {
                    collapsedHeight += $featuredAmenities.find('.feature:eq(' + i + ')').outerHeight();
                }
                break;

            case 'desktop':
                collapsedHeight = 0;
                for (var i = 0; i < 6; i+=2) {
                    collapsedHeight += $featuredAmenities.find('.feature:eq(' + i + ')').outerHeight();
                }
                break;

            case 'large desktop':
                collapsedHeight = 10;
                for (var i = 0; i < 6; i+=2) {
                    collapsedHeight += $featuredAmenities.find('.feature:eq(' + i + ')').outerHeight();
                }
                break;
        }

        // Collapse the element
        TweenMax.set('.featured-amenities', { height: collapsedHeight });
    };

    var mobileSetup = function () {
        devicePlatform = 'mobile';
        calcAmenitiesHeight();
        scrollingEvents();
        $('.js-form-lightbox-need-validate').unbind().click(function(e){
            e.preventDefault();

            var $this=$(this),
                $bookingURL=$this.attr('href'),
                $email=$('#inputEmailNewsletter').val(),
                href=$bookingURL;

            if($email.length>0){

                href+='?email='+encodeURIComponent($email)+"&mobile=true";

                window.open(href, '_blank');
            }

        });
    };

    var nonMobileSetup = function() {
        $('.js-form-lightbox-need-validate').unbind().click(function(e){
            e.preventDefault();

            var $this=$(this),
                $bookingURL=$this.attr('href'),
                $email=$('#inputEmailNewsletter').val(),
                href=$bookingURL;

            if($email.length>0){

                href+='?email='+encodeURIComponent($email);

                $.fancybox.open({
                    padding     : 0,
                    fitToView   : false,
                    maxWidth    : 800,
                    width       : '80%',
                    height      : 550,
                    maxHeight   : '80%',
                    autoSize    : false,
                    closeClick  : false,
                    openEffect  : 'none',
                    closeEffect : 'none',
                    type        : 'iframe',
                    href        : href,
                    tpl: {
                        closeBtn: '<a href="#" class="fancybox-close"> <span class="icon icon-close"></span> </a>'
                    }
                });
            }
        });

        $('.js-form-lightbox').off().fancybox({
            autoCenter: true,
            height: 602,
            maxWidth: '100%',
            maxHeight: '80%',
            padding: 20,
            tpl: {
                closeBtn: '<a href="#" class="fancybox-close"> <span class="icon icon-close"></span> </a>'
            }
        });
    }

    var tabletSetup = function () {
        devicePlatform = 'tablet';
        calcAmenitiesHeight();
        scrollingEvents();
    };

    var desktopSetup = function () {
        devicePlatform = 'desktop';
        calcAmenitiesHeight();
        scrollingEvents();
    };

    var largeDesktopSetup = function () {
        devicePlatform = 'large desktop';
        calcAmenitiesHeight();
        scrollingEvents();
    }

    /**
     * Export module method
     */
    parent.listeners = {
        setup: setup,
        mobileSetup: mobileSetup,
        nonMobileSetup: nonMobileSetup,
        tabletSetup: tabletSetup,
        desktopSetup: desktopSetup,
        largeDesktopSetup: largeDesktopSetup
    };

    return parent;

}(RR || {}, jQuery));/**
 * RR - Media Query background
 */


var RR = (function (parent, $) {
    'use strict';

    var check = function () {
        var $windowWidth = $(window).width();

        if ( $windowWidth < 768 ){
            return 'mobile';
        } else if ( $windowWidth >= 768 && $windowWidth < 1024 ){
            return 'tablet';
        } else {
            return 'desktop';
        }

    };

    var hasTouch = function (){
        return $('.touch').length;
    }

    /**
     * Export module method
     */
    parent.mediaQuery = {
        check: check,
        hasTouch: hasTouch
    };

    return parent;

}(RR || {}, jQuery));/**
 * RR - Mega menu
 */


var RR = (function (parent, $) {
    'use strict';

    var $mainNavLink = $('.main-nav .js-main-nav');

    var desktopEvents = function () {
        $(document).ready(function () {

            $mainNavLink.hoverIntent({
                over: function () {

                    var $megaMenu = $(this).find('.mega-menu'),
                        $subMenu = $(this).find('.main-subnav');


                    if ($megaMenu.length) {
                        $megaMenu.addClass('is-active');
                    }
                    if ($subMenu.length) {
                        $subMenu.addClass('is-active');
                    }

                },
                out: function () {

                    var $megaMenu = $(this).find('.mega-menu'),
                        $subMenu = $(this).find('.main-subnav');

                    if ($megaMenu.length) {
                        $megaMenu.removeClass('is-active');
                    }
                    if ($subMenu.length) {
                        $subMenu.removeClass('is-active');
                    }

                },
                timeout: 300
            });
        });
    };

    var tabletEvents = function () {

    };

    var mobileEvents = function () {


    };

    var setup = function () {


    };

    /**
     * Export module method
     */
    parent.megaMenu = {
        setup: setup,
        desktopEvents: desktopEvents,
        tabletEvents: tabletEvents,
        mobileEvents: mobileEvents
    };

    return parent;

}(RR || {}, jQuery));/**
 * RR - Layout Events
 * Adjust, move elements based on breakpoints
 */


var RR = (function (parent, $) {
    'use strict';



    var desktopEvents = function () {
    };

    var mobileEvents = function () {
        var $mobileNavOffcanvas = $('body .mobile-nav-off-canvas'),
            $locationNavOffcanvas = $('body .location-nav-off-canvas'),
            $mainSection = $('body .main-section'),
            $mobileNavToggle = $('.js-nav-toggle', $mainSection),
            $mobileNavOffcanvasToggle = $('.js-off-canvas-toggle', $mobileNavOffcanvas),
            $locationNavToggle = $('.js-locations-toggle'),
            $locationNavOffcanvasToggle = $('.js-off-canvas-toggle', $locationNavOffcanvas),
            $locationSubnavToggle = $('.js-location-subnav-toggle', $locationNavOffcanvas),
            $mobileSubnavToggle = $('.js-location-subnav-toggle', $mobileNavOffcanvas);

        $(document).ready(function (e) {

            var isRTL = false;

            if ($('html').attr('dir') === 'rtl') {
                isRTL = true;
            }
            // -----------------------------------------------------
            // Calculate height
            // To make fixed positioned nav scrollable
            // -----------------------------------------------------

            var windowsHeight = $window.outerHeight();

            $mobileNavOffcanvas
                .find('.mobile-nav')
                .css('height', windowsHeight - $mobileNavOffcanvas.find('.off-canvas-title').outerHeight());

            $locationNavOffcanvas
                .find('.location-nav')
                .css('height', windowsHeight - $locationNavOffcanvas.find('.off-canvas-title').outerHeight());


            // -----------------------------------------------------
            // Mobile main navigation
            // -----------------------------------------------------

            if (isRTL) {
                var mobileNavTween = new TweenMax($mainSection, 0.3, {
                    x: '-95%',
                    ease: Power3.easeOut,
                    onReverseComplete: function () {
                        $mainSection.removeAttr('style');
                        $mainSection.removeClass('has-border');
                        $mobileNavOffcanvas.removeClass('is-active');
                    }
                });
            } else {
                var mobileNavTween = new TweenMax($mainSection, 0.3, {
                    x: '95%',
                    ease: Power3.easeOut,
                    onReverseComplete: function () {
                        $mainSection.removeAttr('style');
                        $mainSection.removeClass('has-border');
                        $mobileNavOffcanvas.removeClass('is-active');
                    }
                });
            }

            mobileNavTween.pause();

            $mobileNavToggle.on('click', function (e) {
                e.preventDefault();

                $mobileNavOffcanvas.addClass('is-active');
                mobileNavTween.play();
                $mainSection.addClass('has-border');
            });

            $mobileNavOffcanvasToggle.on('click', function (e) {
                e.preventDefault();
                mobileNavTween.reverse();
            });


            // -----------------------------------------------------
            // Mobile location navigation
            // -----------------------------------------------------

            if (isRTL) {
                var locationNavTween = new TweenMax($mainSection, 0.3, {
                    x: '95%',
                    ease: Power3.easeOut,
                    onReverseComplete: function () {
                        $mainSection.removeAttr('style');
                        $mainSection.removeClass('has-border');
                        $locationNavOffcanvas.removeClass('is-active');
                    }
                });
            } else {
                var locationNavTween = new TweenMax($mainSection, 0.3, {
                    x: '-95%',
                    ease: Power3.easeOut,
                    onReverseComplete: function () {
                        $mainSection.removeAttr('style');
                        $mainSection.removeClass('has-border');
                        $locationNavOffcanvas.removeClass('is-active');
                    }
                });
            }

            locationNavTween.pause();

            $locationNavToggle.on('click', function (e) {
                e.preventDefault();
                $locationNavOffcanvas.addClass('is-active');
                locationNavTween.play();
                $mainSection.addClass('has-border');
            });

            $locationNavOffcanvasToggle.on('click', function (e) {
                e.preventDefault();
                locationNavTween.reverse();
            });

            var tlSubnav = new TimelineMax();

            $locationSubnavToggle.on('click', function (e) {
                e.preventDefault();

                var $this = $(this),
                    $lines = $this.find('.line'),
                    $subnav = $this.next('.location-subnav');

                tlSubnav.clear();

                if ($subnav.hasClass('is-active')) {
                    $subnav.slideUp(400, function (e) {
                        $subnav.removeClass('is-active');
                    });

                    tlSubnav.to($lines.eq(0), 0.4, {rotation: 90});
                    tlSubnav.to($lines.eq(1), 0.65, {rotation: 0}, '-=0.5');

                    tlSubnav.pause();
                    tlSubnav.play();

                } else {
                    $subnav.slideDown(400, function (e) {
                        $subnav.addClass('is-active');
                    });

                    tlSubnav.to($lines.eq(0), 0.4, {rotation: 180});
                    tlSubnav.to($lines.eq(1), 0.65, {rotation: 180}, '-=0.5');

                    tlSubnav.pause();
                    tlSubnav.play();
                }

            });

            var tl2Subnav = new TimelineMax();

            $mobileSubnavToggle.on('click', function (e) {
                e.preventDefault();

                var $this = $(this),
                    $lines = $this.find('.line'),
                    $subnav = $this.parent().next('.main-subnav');

                tl2Subnav.clear();

                if ($subnav.hasClass('is-active')) {
                    $subnav.slideUp(400, function (e) {
                        $subnav.removeClass('is-active');
                    });

                    tl2Subnav.to($lines.eq(0), 0.4, {rotation: 90});
                    tl2Subnav.to($lines.eq(1), 0.65, {rotation: 0}, '-=0.5');

                    tl2Subnav.pause();
                    tl2Subnav.play();

                } else {
                    $subnav.slideDown(400, function (e) {
                        $subnav.addClass('is-active');
                    });

                    tl2Subnav.to($lines.eq(0), 0.4, {rotation: 180});
                    tl2Subnav.to($lines.eq(1), 0.65, {rotation: 180}, '-=0.5');

                    tl2Subnav.pause();
                    tl2Subnav.play();
                }

            });


        });

    };

    var setup = function () {


    };

    /**
     * Export module method
     */
    parent.mobileMenu = {
        setup: setup,
        desktopEvents: desktopEvents,
        mobileEvents: mobileEvents
    };

    return parent;

}(RR || {}, jQuery));/**
 * RR - Responsive background
 */


var RR = (function (parent, $) {
    'use strict';

    var $responsiveImagesContainer = $('#main .responsive-bg');

    var desktopEvents = function () {
        $window.load(function () {

            $responsiveImagesContainer.each(function (idx) {
                var $this = $(this),
                    $responsiveImages = $this.find('.img'),
                    $newImg = $responsiveImages.data('src-large');

                if ($newImg) {
                    $responsiveImages.attr('src', $newImg);
                    $this.css('background-image', 'url(' + $newImg + ')');
                }

            });


        });
    };

    var tabletEvents = function () {
    };

    var mobileEvents = function () {

    };

    var setup = function () {


    };

    /**
     * Export module method
     */
    parent.responsiveBackground = {
        setup: setup,
        desktopEvents: desktopEvents,
        tabletEvents: tabletEvents,
        mobileEvents: mobileEvents
    };

    return parent;

}(RR || {}, jQuery));/**
 * RR - Mega menu
 */


var RR = (function (parent, $) {
    'use strict';

    var $roomListMore= $('.room-item-full .room-expander .more'),
        $roomListLess = $('.room-item-full .room-expander .less');

    var desktopEvents = function () {

    };

    var tabletEvents = function () {

    };

    var mobileEvents = function () {
        $('.room-item-fulldetails').css('display','');
    };

    var setup = function () {
        $roomListMore.each(function(){
            var $this=$(this),
                $parentItem=$this.parents('.room-item-full');

             $this.click(function(){

                $('.room-item-fulldetails',$parentItem).slideDown(function(){
                    $this.next().show();
                    $this.hide();
                    $('.room-gallery .js-carousel',$parentItem).slick('slickGoTo', 0, true);
                });

             });
        });

        $roomListLess.each(function(){
            var $this=$(this),
                $parentItem=$this.parents('.room-item-full');

             $this.click(function(){
                $('.room-item-fulldetails',$parentItem).slideUp(function(){
                    $this.prev().show();
                    $this.hide();
                    $('.room-gallery .js-carousel',$parentItem).slick('slickGoTo', 0, true);
                });
             });
        });

        $('.room-item-full .room-name h3').each(function(){
            var $this=$(this),
                $parentItem=$this.parents('.room-item-full');

             $this.click(function(){

                $('.room-expander .more',$parentItem).trigger('click');

             });
        });

        //do this once only

        var offsetHeight=$('header.page-header').height()+10;

        //compute for header height



        var itemToPreload=window.location.hash,
            $itemObj=$(itemToPreload);
            if(itemToPreload.length > 0 && itemToPreload.indexOf('#')>=0){
                $('.room-expander .more',$itemObj).trigger('click');
                $('html, body').animate({
                    scrollTop: $itemObj.offset().top-offsetHeight
                }, 1000);

            }

    };

    /**
     * Export module method
     */
    parent.roomDetailExpander = {
        setup: setup,
        desktopEvents: desktopEvents,
        tabletEvents: tabletEvents,
        mobileEvents: mobileEvents
    };

    return parent;

}(RR || {}, jQuery));/**
 * RR - Scrolling Events
 */


var RR = (function (parent, $) {
    'use strict';

    var $pageHeader = $('.page-header'),
        $headerBooking = $('.header-booking', $pageHeader),
        $headerNavbar = $('.header-navbar', $pageHeader),
        $headerTools = $('.header-tools', $pageHeader),
        $pageHeaderMain = $('.header-tools', $pageHeader),
        $headerBookingForm = $('.header-booking-form', $headerBooking),
        $main = $('#main'),
        $document = $(document),
        $propertyHeader = $('.property-header.desktop-only'),
        mainNavPosition = 0,
        pageHeaderTween;


    var desktopEvents = function () {

        function toggleHomepageHeader(scrollTop, homepageBookingPosition, headerBookingTween) {
            var $siteLogo = $('.site-logo .img.desktop-only');

            if (scrollTop > 0) {
                $pageHeader.addClass('is-scrolled');
                $siteLogo.attr('src', $siteLogo.data('logo-blue'));
            } else {
                $pageHeader.removeClass('is-scrolled');
                $siteLogo.attr('src', $siteLogo.data('logo-white'));
            }

            var $pageHeaderHeight = ($headerBooking.hasClass('is-visible')) ? $pageHeader.outerHeight() - $headerBooking.outerHeight() : $pageHeader.outerHeight();
            if (scrollTop > homepageBookingPosition - $pageHeaderHeight) {
                $headerBooking.addClass('is-visible');
                headerBookingTween.kill().play();
            } else {
                headerBookingTween.kill().reverse();
            }
        }

        function togglePageHeader(scrollTop, prevScrollTop, pageHeaderTween) {

            if (scrollTop > 0) {  //scroll down
                if (!$('.homepage').length) {
                    $pageHeader.next().find('.main-banner').css("margin-top", "153px");
                }
                pageHeaderTween.kill().play();

            } else {  //scroll up
                pageHeaderTween.kill().reverse();
            }
        }

        var prevScrollTop = $window.scrollTop();

        $document.ready(function () {

            var $homepage = []; // $('.homepage');

            // If resized from mobile/tablet, remove unused class
            $headerNavbar.removeClass('is-fixed');
            $headerTools.removeClass('is-fixed');
            $headerBooking.removeClass('is-fixed');

            if ($homepage.length) {

                var homepageBookingPosition = $('.homepage-booking-form', $homepage).offset().top;

                var headerBookingTween = new TweenMax($headerBooking, .3, {
                    opacity: 1,
                    onReverseComplete: function () {
                        $headerBooking.removeClass('is-visible');
                    }
                });

                headerBookingTween.pause();

                // initial load
                toggleHomepageHeader($window.scrollTop(), homepageBookingPosition, headerBookingTween);
                $window.off('scroll');
                $window.scroll(debounce(function () {

                    toggleHomepageHeader($window.scrollTop(), homepageBookingPosition, headerBookingTween);
                }, 50));
            }

            // No debouncing here to have smoother transition
            if ($propertyHeader.length) {
                mainNavPosition = $propertyHeader.offset().top; // get vertical position of main nav relative to document
            }

            // Hide header tool bar once scroll down
            if ($headerTools.length && $headerNavbar.length) {
                pageHeaderTween = new TweenMax($pageHeaderMain, .2, {
                    height: 0,
                    padding: 0,
                    display: "none",
                    onReverseComplete: function () {
                        if (!$('.homepage').length) {
                            $pageHeader.next().find('.main-banner').css("margin-top", "204px");
                        }
                        $headerTools.attr('style','');
                    }
                });

                pageHeaderTween.pause();
            }

            $window.scroll(debounce(function (e) {

                togglePageHeader($window.scrollTop(), prevScrollTop, pageHeaderTween);

                prevScrollTop = $window.scrollTop();
                if ($propertyHeader.length) {
                    //viewport position
                    var scrollPos = {
                        'top': $window.scrollTop(),
                        'bottom': $window.scrollTop() + $window.height()
                    };

                    //updateMainNav($propertyHeader, mainNavPosition, scrollPos);
                }
            }, 50)).trigger('scroll');

        });
    };

    var tabletEvents = function () {
    };

    var mobileEvents = function () {
        $document.ready(function (e) {
            $pageHeader.removeClass('is-scrolled').attr('style');
            $headerTools.attr('style','');
            if (!$('.homepage').length) {
                $pageHeader.next().find('.main-banner').removeAttr('style');
            }

            var headerBookingTween = new TweenMax($headerBooking, .3, {opacity: 1});

            // Set navbar and booking to fixed position
            // if the page has been scrolled past the header tools/language bar
            function updateFixPosition() {

                var scrollTop = $window.scrollTop();

                if (scrollTop > $headerTools.outerHeight()) {
                    $headerNavbar.addClass('is-fixed');
                    $headerBooking.addClass('is-fixed');
                    $main.addClass('has-top-margin');
                } else {
                    $headerNavbar.removeClass('is-fixed');
                    if (!$headerBooking.hasClass('is-active')){
                        $headerBooking.removeClass('is-fixed');
                    }
                    $main.removeClass('has-top-margin');
                }
            }

            // initial load
            updateFixPosition();
            $window.off('scroll');
            $window.scroll(debounce(function () {
                updateFixPosition();
            }, 5));

        });

    };

    var setup = function () {


    };


    var updateMainNav = function ($propertyHeader, mainNavPosition, scrollPos) {

        // var offset = mainNavPosition - $('.page-header').outerHeight() + 10;

        // if we've scrolled down past the main navigation, fix the position

        // if (offset > 0 && scrollPos.top >= offset) {
        //     $propertyHeader.addClass('fixed');
        // } else {
        //     $propertyHeader.removeClass('fixed');
        // }
    };

    /**
     * Export module method
     */
    parent.scrollingEvents = {
        setup: setup,
        desktopEvents: desktopEvents,
        tabletEvents: tabletEvents,
        mobileEvents: mobileEvents
    };

    return parent;

}(RR || {}, jQuery));/**
 * RR - User Login Process
 */
var RR = (function (parent, $) {
    'use strict';
    
    
   
    function GetAcceptedMemberRatesCookieValue(){
        return GetCookie("ModalWindowExperimentAcceptedMemberRates");
    }

    function GetMemberTypeCookieValue(){
        return GetCookie("MemberType");
    }

    function GetMemberETokenValue(){
        return GetCookie("MemberEToken");
    }
    function GetMemberETokenExpiryValue(){
        return GetCookie("metExpiry");
    }

    function GetCookie(cookieName){
        var cookieValue = "";
        var name = cookieName + "=";
        var decodedCookie = decodeURIComponent(document.cookie);
        var cookies = decodedCookie.split(';');
        for (var i = 0; i < cookies.length; i++) {
            var cookie = cookies[i];
            //Remove whitespace before cookie name
            while (cookie.charAt(0) == ' ') {
                cookie = cookie.substring(1);
            }
            //If key cookie then return its value
            if (cookie.indexOf(name) == 0) {
                cookieValue = cookie.substring(name.length, cookie.length);
            }
        }
        return cookieValue;
    }

    
    function ShowLoggedInDialog(){               
        $("#joinPrivilegeAfterLogin").fadeIn(1000);

        setTimeout(FadeOutDialog, 4000);
    }
    function FadeOutDialog(){
        $("#joinPrivilegeAfterLogin").fadeOut(2500); 
    }

    var SetMemberRatesCookie = function (hasAcceptedRates) {
        // true / false        
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + 365);
        document.cookie = "ModalWindowExperimentAcceptedMemberRates="+hasAcceptedRates+"; expires=" + exdate.toUTCString() + "; path=/";
    }
 
    var SetMemberTypeCookie = function (memberType){
        // myoaks / email / null
        var exdate = new Date();
        exdate.setDate(exdate.getDate() + 365);
        document.cookie = "MemberType="+memberType+"; expires=" + exdate.toUTCString() + "; path=/";
    }

    var DeleteMemberETokenCookie = function (){
        var exdate = new Date();
        exdate.setDate(exdate.getDate() - 1);
        document.cookie = "MemberEToken=null; expires=" + exdate.toUTCString() + "; path=/";
        document.cookie = "metExpiry=null; expires=" + exdate.toUTCString() + "; path=/";
    }

    var FrameMessenging = {
        windowProxy: null,
        guestDomain: '',
        frameMessagingLink: '',
        // language: 'en',
        init: function (guestDomain, frameMessagingLink) {
            FrameMessenging.guestDomain = guestDomain;
            // FrameMessenging.language = language;

            FrameMessenging.windowProxy = new Porthole.WindowProxy(FrameMessenging.frameMessagingLink, 'IBEFrame');
            FrameMessenging.windowProxy.addEventListener(FrameMessenging.onMessage);            
        },
        getUrlVars: function () {
            var vars = [], hash;
            var hashes = window.location.href.slice(window.location.href.indexOf('?') + 1).split('&');
            for (var i = 0; i < hashes.length; i++) {
                hash = hashes[i].split('=');
                vars.push(hash[0]);
                vars[hash[0]] = hash[1];
            }

            return vars;
        },
        getUrlVar: function (name) {
            return FrameMessenging.getUrlVars()[name] === undefined ? '' : FrameMessenging.getUrlVars()[name];
        },
        onMessage: function (messageEvent) {            
            
            // console.log("Message Event:");
            // console.log(messageEvent);

            if (messageEvent.origin == FrameMessenging.guestDomain) {
                if (messageEvent.data["html"]) {
                    /*
                        Inject HTML element to the page when the IFRAME is completed load
                        parameter1: messageEvent.data["html"] - contain HTML need to be injected to the page
                        parameter2: messageEvent.data["cookie"] - privilege cookie to determine whether to show privilege banner or not
                        parameter3: messageEvent.data["profile"] - privilege member profile data a json object (sample below) if logged in or false
                                    {"id":"6039290","firstname":"XXXXXX","lastname":"XXXXXXXXXX","title":"XX","email":"xxxx@minor.com","country_code":"TH","phone_number":"66-12345678"}
                    */

                    // populate login navbar
                    document.getElementById('loginarea').innerHTML = messageEvent.data["html"];
                    
                    // get user cookies
                    var memberRatesCookie = GetAcceptedMemberRatesCookieValue();
                    var memberTypeCookie = GetMemberTypeCookieValue();
                    var memberETokenCookie = GetMemberETokenValue();
                    var memberETokenExpiry = GetMemberETokenExpiryValue();
                    
                    //TODO: need to retrieve the cookie expiry also and send that to the API endpoint.
                    //var memberEmail = getMemberEmailUrl(memberETokenCookie["Member")

                    if (messageEvent.data["profile"]) {
                        // true = profile found, user is logged in
                        // Set user rates to true and set membertype to myoaks                        

                        if(memberTypeCookie != "myoaks"){
                            // login cookie not set - set cookie and show dialog
                            DeleteMemberETokenCookie();
                            SetMemberTypeCookie("myoaks");
                            ShowLoggedInDialog();
                        }

                        if(memberRatesCookie != "true"){
                            SetMemberRatesCookie("true");
                        }
                                                
                        window.guest_profile = messageEvent.data["profile"];
                    }
                    else{
                        // no profile found, user is not logged in
                        // check for existing email membertype and session data - if not exist, clear member and rates cookies                        
                        if(memberTypeCookie == "email"){                            
                            // check email

                            // var getMemberEmailUrl = "/OaksApi/GetMemberEmail";        

                            // $.ajax({
                            //     type: "GET",
                            //     url: getMemberEmailUrl,
                            //     data: { email: memberETokenCookie, expiry: memberETokenExpiry },
                            //     dataType: "json",
                            //     crossDomain: true,
                            // }).success(function (data){

                            //     if(memberRatesCookie != "true"){
                            //         SetMemberRatesCookie("true");
                            //     }                                
                            //     window.guest_profile = data.profile;

                            // }).error(function (data) {  
                            //     if(memberRatesCookie != "false"){
                            //         SetMemberRatesCookie("false");
                            //     }
                            //     if(memberTypeCookie != "null"){
                            //         SetMemberTypeCookie("null");
                            //     }
                            //     window.guest_profile = null;
                            // }); 
                        }
                        else{
                            if(memberRatesCookie != "false"){
                                SetMemberRatesCookie("false");
                            }
                            if(memberTypeCookie != "null"){
                                SetMemberTypeCookie("null");
                            }
                            window.guest_profile = null;
                            
                        }                        
                    }

                    Login.init(true, FrameMessenging.guestDomain, FrameMessenging.windowProxy);                    
                }
                else if (messageEvent.data["StatusFail"]) {
                    /*
                        Called when login fail.
                        parameter1: messageEvent.data["StatusFail"] (true/false)
                    */                   
                }
                else if (messageEvent.data["reqOWSId"]) {
                    /*
                        Called after register via Facebook and email already have Privilege account so system need to  show popup asking for Privilege account password to map existing Privilege account to FB account
                        parameter1: messageEvent.data["reqOWSId"] (true/false)
                    */                   
                }
                else if (messageEvent.data["hideAgent"]) {
                    /*
                        Hide (Travel Agent) option in promotion code dropdownlist.
                        parameter1: messageEvent.data["hideAgent"] (true/false)
                    */                   
                }
                else if (messageEvent.data["HideLoadingOverlay"]) {
                    /*
                        Hide overlay loading.
                        parameter1: messageEvent.data["HideLoadingOverlay"] (true/false)
                    */                   
                }
                else if (messageEvent.data["signupnewfail"]) {
                    /*
                        SignUp Fail.
                        parameter1: messageEvent.data["signupnewfail"] (true/false)
                        parameter2: messageEvent.data["message"] - message to display to the user
                    */                   
                }
                else if (messageEvent.data["fbconfirmpasswordfail"]) {
                    /*
                        Confirm password fail when try to link facebook with OWS member.
                        parameter1: messageEvent.data["fbconfirmpasswordfail"] (true/false)
                        parameter2: messageEvent.data["message"] - message to display to the user
                    */                   
                }
                else if (messageEvent.data["redirectAfterLogin"]) {
                    /*
                        Return object after login successful for redirect to another page.
                        parameter1: messageEvent.data["redirectAfterLogin"] (true/false)
                        parameter2: messageEvent.data["result"] (object)
                    */                   
                }
                else if (messageEvent.data["forgetResult"]) {
                    /*
                        Hide and show the result of forget password.
                        parameter1: messageEvent.data["forgetResult"] (true/false)
                        parameter2: messageEvent.data["message"] (value)
                        parameter3: messageEvent.data["status"] (value)
                    */                   
                } else if (messageEvent.data["displayloyaltymessage"]) {
                    /*
                        Show the result of Loyolty section.
                        parameter1: messageEvent.data["displayloyaltymessage"] (true/false)
                        parameter2: messageEvent.data["message"] (value)
                    */                   
                }
                else if (messageEvent.data["bookingcookie_found"]) {
                    /*
                        Called when booking step cookie exist so display "finish your booking" (call on page loaded by an IFRAME).
                        parameter1: messageEvent.data["bookingcookie_found"] (true/false)
                        parameter2: messageEvent.data["bookingcookie_data"] - Json Object contained data related to search criteria
                    */                   
                }
                else if (messageEvent.data["bookingcookie_notfound"]) {
                    /*
                        Called when booking step cookie not found so hide "finish your booking" (call on page loaded by an IFRAME)
                        parameter1: messageEvent.data["bookingcookie_notfound"] (true/false)
                        parameter2: messageEvent.data["haveacode_click"] (true/false)
                    */                   
                }
                else if (messageEvent.data["clearBookingCookieSuccess"]) {
                    /*
                        Called when user click "New Booking" button for clear cookie and start new booking
                        parameter1: messageEvent.data["clearBookingCookieSuccess"] (true/false)
                    */                   
                }
                else if (messageEvent.data["addToken"]) {                    
                    jQuery("#frmSignUp, #frmJoinGHA").append('<input type="hidden" name="hidCT" value="' + messageEvent.data["result"] + '" />');                    
                }
                else if (messageEvent.data["reload"]) {                    
                    location.reload();
                }

            }
        }
    }

    parent.userLogin = {
        FrameMessenging: FrameMessenging
    };

    return parent;

    // Comment out because this is initialised from within the view to pass language code
    //FrameMessenging.init('https://secure.minorhotels.com','en');

}(RR || {}, jQuery));/**
 * RR - Video Controls
 */


var RR = (function (parent, $) {
    'use strict';

    var setup = function () {
        var video = document.getElementById("main-banner-video__source");

        if(video != null)
        {
            $('.js-toggle-play').on('click', function (e) {
            
            $("#main-banner-video-wrapper").show();
            $("#main-banner-image-wrapper").hide();

            e.preventDefault();
            var $this = $(this);


            if ($this.hasClass('-pause')) {
                $this.removeClass('-pause').addClass('-play');
                video.pause();
            } else {
                $this.removeClass('-play').addClass('-pause');
                video.play();
            }
        });

        $('.js-toggle-audio').on('click', function (e) {
            e.preventDefault();
            var $this = $(this);

            if ($this.hasClass('-mute')) {
                $this.removeClass('-mute').addClass('-audio');
                video.muted = false;
            } else {
                $this.removeClass('-audio').addClass('-mute');
                video.muted = true;
            }
        });

        if (!Modernizr.mq('(min-width: 1025px)')) {
            $('.js-toggle-play').removeClass('-pause').addClass('-play');
            video.pause();
        }
        }
        
    }

    /**
     * Export module method
     */
    parent.videoControls = {
        setup: setup
    };

    return parent;

}(RR || {}, jQuery));
