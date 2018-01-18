// ==UserScript==
// @name         Spareroom Prices per Calendar Month
// @namespace    https://github.com/tomviner/spareroom-userscripts/
// @version      0.3
// @description  Add prices per calendar month to Spareroom flat listings pages with per week prices
// @author       Tom V
// @license      MIT
// @homepageURL  https://github.com/tomviner/spareroom-userscripts
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-standalone/6.18.2/babel.js
// @require      https://cdnjs.cloudflare.com/ajax/libs/babel-polyfill/6.16.0/polyfill.js
// @match        *://*.spareroom.co.uk/flatshare/*
// @match        *://*.spareroom.com/flatshare/*
// @match        *://*.spareroom.co.uk/roommate/*
// @match        *://*.spareroom.com/roommate/*
// @match        *://*.spareroom.co.uk/rooms-for-rent/*
// @match        *://*.spareroom.com/rooms-for-rent/*
// @noframes

// ==/UserScript==
/* jshint ignore:end */
/* jshint esnext: false */
/* jshint esversion: 6 */

(function(){
    'use strict';

    // We rely on Spareroom's jQuery
    if (typeof(jQuery)  === "undefined"){
        return;
    }

    // https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Math/round
    /**
     * Decimal adjustment of a number.
     *
     * @param {String}  type  The type of adjustment.
     * @param {Number}  value The number.
     * @param {Integer} exp   The exponent (the 10 logarithm of the adjustment base).
     * @returns {Number} The adjusted value.
     */
    function decimalAdjust(type, value, exp) {
      // If the exp is undefined or zero...
      if (typeof exp === 'undefined' || +exp === 0) {
        return Math[type](value);
      }
      value = +value;
      exp = +exp;
      // If the value is not a number or the exp is not an integer...
      if (value === null || isNaN(value) || !(typeof exp === 'number' && exp % 1 === 0)) {
        return NaN;
      }
      // If the value is negative...
      if (value < 0) {
        return -decimalAdjust(type, -value, exp);
      }
      // Shift
      value = value.toString().split('e');
      value = Math[type](+(value[0] + 'e' + (value[1] ? (+value[1] - exp) : -exp)));
      // Shift back
      value = value.toString().split('e');
      return +(value[0] + 'e' + (value[1] ? (+value[1] + exp) : exp));
    }

    // Decimal round
    function round10(value, exp=1) {
        return decimalAdjust('round', value, exp);
    }

    // https://stackoverflow.com/a/2901298/15890
    const numberWithCommas = (x) => {
      return x.toString().replace(/\B(?=(\d{3})+(?!\d))/g, ",");
    }


    jQuery(function($){
        // One for each room available in the given flat
        let prices = $('.room-list__price');
        // The url @match patterns on this script are liberal as Spareroom
        // puts list and detail views on a variety of similar paths.
        // For this reason, we make an effort to terminate early.
        if (prices.length === 0){
            return;
        }

        prices.each(function(i, el){
            let price = $(el);
            // Fix prices like £275 pw
            let match = price.text().match(/(£|\$|€)(\d+) (?:pw|weekly)/);
            if (match){
                let curr_symbol = match[1];
                let pw = parseInt(match[2]);
                let pcm = round10(pw * 365.25 / 7 / 12);
                let pcm_text = `${curr_symbol}${numberWithCommas(pcm)} pcm`;
                let pw_small = `<small>${price.text()}</small>`;
                let price_inc_pcm = `${pcm_text} ${pw_small}`;
                price.html(price_inc_pcm);
            }
        });
    });

})();
