/**
 * Copyright 2014 - Edgar Alexander Franco
 *
 * @author Edgar Alexander Franco
 * @version 1.7.1
 */

/**
 * Comprueba si la URL de un vídeo de YouTube es válida.
 *
 * @param url {string} URL del vídeo de YouTube.
 */
function validarURLYouTube (url) {
  return /^(http|https)\:\/\/www\.youtube\.com\/watch\?v\=(.{11})((.{0})|((\&)(.+)))$/g.test(url);
}