/**
 * Copyright 2014 - Edgar Alexander Franco
 *
 * @author Edgar Alexander Franco
 * @version 1.7.1
 */

var Microfono = (function () {
  var self = {};
  
  self.URL_AUDIOS = './audios/';
  self.SCRIPT_DESTINO = './guardar-audio.php';
  self.NOMBRE_AUDIO = 'audio';
  
  var TIEMPO_MAX_GRABACION = 5;
  var TAMANO_MAX_AUDIO = 1572864;
  
  self.recordRTC = null;
  self.grabarAlConfirmar = true;
  
  var grabando = false;
  var parando = false;
  var tiempoGrabacion = 0;
  var timer;
  
  /**
   * Incluye la librería RecordRTC como dependencia.
   * //www.WebRTC-Experiment.com/RecordRTC.js
   */
  self.incluirRecordRTC = function () {
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.src = '//www.WebRTC-Experiment.com/RecordRTC.js';
    document.head.appendChild(script);
  }
  
  /**
   * Le pide permiso al usuario para usar el micrófono.
   */
  self.pedirConfirmacion = function () {
    var getUserMedia = navigator.mozGetUserMedia || navigator.webkitGetUserMedia || navigator.msGetUserMedia || navigator.getUserMedia;
    
    if (getUserMedia == undefined || getUserMedia == null) {
      throw new ChatException('Tu navegador no soporta ésta característica.', 1);
    }
    
    navigator.getUserMedia = getUserMedia;
    navigator.getUserMedia({ video : false, audio : true }, function (stream) {
      self.recordRTC = RecordRTC(stream);
      
      if (self.grabarAlConfirmar) {
        self.grabar();
      }
    }, function (err) {
      console.log(err);
    });
  }
  
  /**
   * Inicia una nueva grabación.
   */
  self.grabar = function () {
    if (grabando) {
      return;
    }
    
    if (FormData == undefined || FormData == null) {
      throw new ChatException('Tu navegador no soporta ésta característica.', 1);
    }
    
    if (self.recordRTC == null) {
      self.pedirConfirmacion();
      
      return;
    }
    
    grabando = true;
    self.recordRTC.startRecording();
    tiempoGrabacion = 0;
    
    timer = setInterval(function () {
      tiempoGrabacion++;
      
      if (tiempoGrabacion == TIEMPO_MAX_GRABACION) {
        self.pararDeGrabar();
      }
      
      self.alContar(tiempoGrabacion);
    }, 1000);
    
    self.alGrabar();
    self.alContar(tiempoGrabacion);
  }
  
  /**
   * Detiene la grabación en curso.
   */
  self.pararDeGrabar = function () {
    if (!grabando || parando) {
      return;
    }
    
    parando = true;
    clearInterval(timer);
    self.recordRTC.stopRecording(function (url) {
      var blob = self.recordRTC.getBlob();
      
      if (blob.size > TAMANO_MAX_AUDIO) {
        parando = false;
        grabando = false;
        self.alGuardarAudio(null);
        
        return;
      }
      
      var formData = new FormData();
      formData.append(self.NOMBRE_AUDIO, blob);
      
      var xhr = new XMLHttpRequest();
      xhr.open('POST', self.SCRIPT_DESTINO);
      xhr.onreadystatechange = function (evt) {
        if (xhr.readyState != 4) {
          return;
        }
        
        parando = false;
        grabando = false;
        self.alGuardarAudio(xhr);
      }
      
      xhr.send(formData);
    });
    
    self.alEnviarAudio();
  }
  
  /**
   * Empieza o detiene una grabación.
   */
  self.palanquear = function () {
    if (grabando) {
      self.pararDeGrabar();
    } else {
      self.grabar();
    }
  }
  
  /**
   * Indica si el micrófono está grabando.
   *
   * @return {boolean}
   */
  self.getGrabando = function () {
    return grabando;
  }
  
  /**
   * Indica si se está parando la grabación.
   *
   * @return {boolean}
   */
  self.getParando = function () {
    return parando;
  }
  
  /**
   * Retorna el tiempo de grabación actual.
   *
   * @return {number}
   */
  self.getTiempoGrabacion = function () {
    return tiempoGrabacion;
  }
  
  /**
   * Sirve para hacer override.
   */
  self.alGrabar = function () {
    
  }
  
  /**
   * Sirve para hacer override.
   *
   * @param {number} tiempo Tiempo de grabación transcurrido en segundos.
   */
  self.alContar = function (tiempo) {
    
  }
  
  /**
   * Sirve para hacer override.
   */
  self.alEnviarAudio = function () {
    
  }
  
  /**
   * Sirve para hacer override.
   *
   * @param {string} xhr Objeto XMLHttpRequest con que se hizo la subida.
   */
  self.alGuardarAudio = function (xhr) {
    
  }
  
  return self;
})();