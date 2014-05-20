/**
 * Copyright 2014 - Edgar Alexander Franco
 *
 * @author Edgar Alexander Franco
 * @version 1.7.1
 */

var Cookie = (function () {
  var self = {};
  
  self.TIEMPO = 31536000;
  
  /**
   * Establece el valor de una cookie.
   *
   * @param {string} nombre Nombre de la cookie.
   * @param {string} valor Valor de la cookie.
   */
  self.set = function (nombre, valor) {
    var fecha = new Date();
    fecha.setTime(fecha.getTime() + self.TIEMPO * 1000);
    document.cookie = nombre + '=' + encodeURIComponent(valor) + '; expires=' + fecha.toGMTString();
  }
  
  /**
   * Obtiene un objeto con todas las cookies.
   *
   * @return {string}
   */
  self.get = function () {
    var cookies = {};
    var strCookies = document.cookie.split('; ');
    var total = strCookies.length;
    var split;
    
    for (var i = 0; i < total; i++) {
      split = strCookies[ i ].split('=');
      cookies[ split[0] ] = decodeURIComponent(split[1]);
    }
    
    return cookies;
  }
  
  return self;
})();