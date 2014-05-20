/**
 * Copyright 2014 - Edgar Alexander Franco
 *
 * @author Edgar Alexander Franco
 * @version 1.7.1
 */

/**
 * Retorna el id de la URL del vídeo de YouTube.
 *
 * @param {string} url URL del vídeo de YouTube.
 */
exports.getIdYouTube = function (url) {
  var split = url.split('=', 2);
  
  if (split.length < 2) {
    return null;
  }
  
  var id = split[1].substring(0, 11);
  
  return (id.length == 11) ? id : null ;
}