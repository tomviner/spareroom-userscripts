// ==UserScript==
// @name         Spareroom Directions to Work
// @namespace    https://github.com/tomviner/spareroom-userscripts/
// @version      0.4
// @description  Add a Directions to Work button to Spareroom flat listings pages
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

    jQuery(function($){
        let map = $('.feature--map');
        // The url @match patterns on this script are liberal as Spareroom
        // puts list and detail views on a variety of similar paths.
        // For this reason, we make an effort to terminate early.
        if (map.length === 0){
            return;
        }

        // Property coordinates are written in the page as follows:
        //
        // SR.listing.detail.init({
        //   coords: {
        //     lat: '51.4992180788083',
        //     lon: '-0.0817307614796427'
        //   }
        // });
        //
        // Currently we scrape this from a script tag as text, would be better
        // if the coords could be located in the SR data structure directly.
        let script_tag = $('script')
            .filter(function(i, e){
                // filter by presence of a "unique string"
                return $(e).text().indexOf('SR.listing.detail.init({') >= 0;
            });

        // Basically screenscraping. Contributions welcome!
        let coords_json = script_tag
            .text()
            .split('coords:')[1]
            .split('})')[0]
            .replace(/lat/, '"lat"')
            .replace(/lon/, '"lon"')
            .replace(/'/g, '"');

        let coords = JSON.parse(coords_json);

        // https://developers.google.com/maps/documentation/urls/guide#directions-action
        let base = 'https://www.google.com/maps/dir/?api=1';
        let origin = `${coords.lat},${coords.lon}`;
        // TODO: find a way to make travelmode and dest customisable
        let travelmode = 'transit';
        // This relies on setting your workplace in your Google Maps account.
        // See https://support.google.com/maps/answer/3093979
        let dest = 'Work';
        let url = `${base}&travelmode=${travelmode}&origin=${origin}&destination=${dest}`;

        $('<button/>')
            .text('Directions to Work')
            .appendTo(map)
            .click(function(){
                window.open(url);
            })
            .wrap('<p></p>');
    });

})();
