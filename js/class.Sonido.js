/**
 * Copyright 2014 - Edgar Alexander Franco
 *
 * @author Edgar Alexander Franco
 * @version 1.6
 */

var Sonido = (function () {
  var self = {};
  
  self.sonidos = {};
  self.tipo = (document.createElement('audio').canPlayType('audio/ogg') == '') ? '.mp3' : '.ogg' ;
  
  /**
   * Carga el audio en la lista.
   */
  self.cargar = function (nombre, ruta) {
    self.sonidos[ nombre ] = {};
    self.sonidos[ nombre ].listo = false;
    self.sonidos[ nombre ].audio = new Audio();
    self.sonidos[ nombre ].audio.src = ruta + self.tipo;
    self.sonidos[ nombre ].audio.onloadeddata = function (evt) {
      self.sonidos[ nombre ].listo = true;
    }
    
    self.sonidos[ nombre ].audio.load();
  }
  
  /**
   * Detiene y reproduce el audio especificado.
   */
  self.play = function (nombre) {
    if (self.sonidos[ nombre ].listo) {
      self.sonidos[ nombre ].audio.pause();
      self.sonidos[ nombre ].audio.currentTime = 0;
      self.sonidos[ nombre ].audio.play();
    }
  }
  
  return self;
})();