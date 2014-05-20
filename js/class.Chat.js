/**
 * Copyright 2014 - Edgar Alexander Franco
 *
 * @author Edgar Alexander Franco
 * @version 1.7.1
 */

var Chat = (function () {
  var self = {};
  
  self.SERVIDOR = 'localhost:55555';
  self.MIN_LONG_ALIAS = 1;
  self.MAX_LONG_ALIAS = 20;
  self.MIN_LONG_MENSAJE = 1;
  self.MAX_LONG_MENSAJE = 200;
  self.ALIAS_POR_DEFECTO = 'Nuevo';
  self.COLOR_POR_DEFECTO = '#ec8500';
  self.MENSAJE_SERVIDOR = 1;
  self.MENSAJE_CLIENTE = 2;
  
  self.io = null;
  self.conectado = false;
  self.alias = self.ALIAS_POR_DEFECTO;
  self.color = self.COLOR_POR_DEFECTO;
  self.listaIgnorar = {};
  
  /**
   * TODO: Llamar a éste método para inicializar el chat.
   */
  self.init = function (servidor) {
    self.conectado = false;
    
    if (typeof servidor == 'undefined' || servidor == null) {
      servidor = self.SERVIDOR;
    }
    
    var script = document.createElement('script');
    script.type = 'text/javascript';
    script.onload = function (evt) {
      self.io = io.connect('http://' + servidor + '/');
      
      /**
       * Se ejecuta cuando el servidor pide las cookies de información al momento de la conexión.
       *
       * @param {object} datos Objeto que mantiene el alias y color del usuario que el servidor generó por defecto, además de su fecha de conexión y un objeto con todos los miembros conectados.
       */
      self.io.on('cargar', function (datos) {
        var cookies = Cookie.get();
        var alias = (typeof cookies['chat_alias'] != 'undefined') ? cookies['chat_alias'] : null ;
        var color = (typeof cookies['chat_color'] != 'undefined') ? cookies['chat_color'] : null ;
        
        self.io.emit('cargar', { alias : alias, color : color });
        self.conectado = true;
        self.alCargar(datos.alias, datos.color, datos.fechaConexion, datos.mensajes, datos.miembros);
      });
      
      /**
       * Se ejecuta cuando se conecta un nuevo usuario.
       *
       * @param {object} datos Mantiene el id, alias, color y fecha de conexión del usuario que acaba de conectarse.
       */
      self.io.on('conectarUsuario', function (datos) {
        self.alConectarUsuario(datos.id, datos.alias, datos.color, datos.fechaConexion);
      });
      
      /**
       * Se ejecuta cuando se desconecta un usuario.
       *
       * @param {object} datos Mantiene el id y alias del usuario que acaba de desconectarse.
       */
      self.io.on('desconectarUsuario', function (datos) {
        self.alDesconectarUsuario(datos.id, datos.alias);
      });
      
      /**
       * Se ejecuta al finalizar el ajuste del alias.
       *
       * @param {string} alias Nuevo alias del usuario.
       */
      self.io.on('ajustarAlias', function (alias) {
        self.alAjustarAlias(alias);
      });
      
      /**
       * Se ejecuta cuando un usuario actualiza su alias.
       *
       * @param {object} datos Mantiene el id y alias nuevo del usuario que actualizó su alias.
       */
      self.io.on('actualizarAlias', function (datos) {
        self.alActualizarAlias(datos.id, datos.alias);
      });
      
      /**
       * Se ejecuta cuando un usuario actualiza su color.
       *
       * @param {object} datos Mantiene el id y color nuevo del usuario que actualizó su color.
       */
      self.io.on('actualizarColor', function (datos) {
        self.alActualizarColor(datos.id, datos.color);
      });
      
      /**
       * Se ejecuta al finalizar el ajuste del color.
       *
       * @param {string} alias Nuevo color del usuario.
       */
      self.io.on('ajustarColor', function (color) {
        self.alAjustarColor(color);
      });
      
      /**
       * Se ejecuta cuando el servidor manda un mensaje.
       *
       * @param {string} mensaje Mensaje del servidor.
       */
      self.io.on('log', function (mensaje) {
        self.alLog(mensaje);
      });
      
      /**
       * Se ejecuta al recibir un MP nuevo.
       *
       * @param {object} datos Mantiene el id, alias, color, cuerpo y destinatario del MP.
       */
      self.io.on('recibirMensajePrivado', function (datos) {
        var id = datos.id;
        
        if (typeof self.listaIgnorar[ id ] == 'undefined') {
          self.alRecibirMensajePrivado(id, datos.alias, datos.color, datos.mensaje, datos.destinatario);
        }
      });
      
      /**
       * Se ejecuta al recibir un mensaje nuevo.
       *
       * @param {object} datos Mantiene el id, alias, color y cuerpo del mensaje.
       */
      self.io.on('recibirMensaje', function (datos) {
        var id = datos.id;
        
        if (typeof self.listaIgnorar[ id ] == 'undefined') {
          self.alRecibirMensaje(id, datos.alias, datos.color, datos.mensaje);
        }
      });
      
      /**
       * Se ejecuta al recibir un audio nuevo.
       *
       * @param {object} datos Mantiene el id, alias, color el Id del audio.
       */
      self.io.on('recibirAudio', function (datos) {
        var id = datos.id;
        
        if (typeof self.listaIgnorar[ id ] == 'undefined') {
          self.alRecibirAudio(id, datos.alias, datos.color, datos.idMd5);
        }
      });
      
      /**
       * Se ejecuta al recibir un audio de YouTube.
       *
       * @param {object} datos Mantiene el id y tiempo del vídeo de YouTube.
       */
      self.io.on('recibirAudioYouTube', function (datos) {
        self.alRecibirAudioYouTube(datos.idVideoYouTube, datos.tiempo);
      });
      
      /**
       * Se ejecuta al recibir un vídeo de YouTube.
       *
       * @param {object} datos Mantiene el id y tiempo del vídeo de YouTube.
       */
      self.io.on('recibirVideoYouTube', function (datos) {
        self.alRecibirVideoYouTube(datos.idVideoYouTube, datos.tiempo);
      });
      
      /**
       * Se ejecuta cuando se pierde la conexión con el servidor.
       */
      self.io.on('disconnect', function () {
        self.alDesconectarse();
      });
    }
    
    script.onerror = function (evt) {
      self.alDesconectarse();
    }
    
    script.src = 'http://' + servidor + '/socket.io/socket.io.js';
    document.head.appendChild(script);
  }
  
  /**
   * Sirve para hacer override.
   *
   * @param {string} alias Alias del usuario generado por el servidor.
   * @param {string} color Color del usuario generado por el servidor.
   * @param {string} fechaConexion Fecha de conexión del usuario.
   * @param {object} mensajes Array con los últimos mensajes del chat.
   * @param {object} miembros Objeto con todos los miembros conectados.
   */
  self.alCargar = function (alias, color, fechaConexion, mensajes, miembros) {
    
  }
  
  /**
   * Sirve para hacer override.
   *
   * @param {string} id Id del usuario que acaba de conectarse.
   * @param {string} alias Alias del usuario que acaba de conectarse.
   * @param {string} color Color del usuario que acaba de conectarse.
   * @param {string} fechaConexion Fecha de conexión del usuario.
   */
  self.alConectarUsuario = function (id, alias, color, fechaConexion) {
    
  }
  
  /**
   * Sirve para hacer override.
   *
   * @param {number} id Id del usuario que acaba de desconectarse.
   * @param {string} alias Alias del usuario que acaba de desconectarse.
   */
  self.alDesconectarUsuario = function (id, alias) {
    
  }
  
  /**
   * Sirve para hacer override.
   *
   * @param {string} alias Nuevo alias del usuario.
   */
  self.alAjustarAlias = function (alias) {
    
  }
  
  /**
   * Sirve para hacer override.
   *
   * @param {string} id Id del usuario que actualizó su alias.
   * @param {string} alias Alias nuevo del usuario que actualizó su alias.
   */
  self.alActualizarAlias = function (id, alias) {
    
  }
  
  /**
   * Sirve para hacer override.
   *
   * @param {string} id Id del usuario que actualizó su color.
   * @param {string} color Color nuevo del usuario que actualizó su color.
   */
  self.alActualizarColor = function (id, color) {
    
  }
  
  /**
   * Sirve para hacer override.
   *
   * @param {string} color Nuevo color del usuario.
   */
  self.alAjustarColor = function (color) {
    
  }
  
  /**
   * Sirve para hacer override.
   *
   * @param {string} mensaje Mensaje del servidor.
   */
  self.alLog = function (mensaje) {
    
  }
  
  /**
   * Sirve para hacer override.
   *
   * @param {string} id Id del remitente del mensaje.
   * @param {string} alias Alias del remitente del mensaje.
   * @param {string} color Color del remitente.
   * @param {string} mensaje El mensaje en sí.
   * @param {string} destinatario Alias del usuario destinatario.
   */
  self.alRecibirMensajePrivado = function (id, alias, color, mensaje, destinatario) {
    
  }
  
  /**
   * Sirve para hacer override.
   *
   * @param {string} id Id del remitente del mensaje.
   * @param {string} alias Alias del remitente del mensaje.
   * @param {string} color Color del remitente.
   * @param {string} mensaje El mensaje en sí.
   */
  self.alRecibirMensaje = function (id, alias, color, mensaje) {
    
  }
  
  /**
   * Sirve para hacer override.
   *
   * @param {string} id Id del remitente del audio.
   * @param {string} alias Alias del remitente del audio.
   * @param {string} color Color del remitente.
   * @param {string} idMd5 Id del audio compartido.
   */
  self.alRecibirAudio = function (id, alias, color, idMd5) {
    
  }
  
  /**
   * Sirve para hacer override.
   *
   * @param {string} idVideoYouTube Id del vídeo de YouTube.
   * @param {number} tiempo Tiempo de inicio de reproducción.
   */
  self.alRecibirAudioYouTube = function (idVideoYouTube, tiempo) {
    
  }
  
  /**
   * Sirve para hacer override.
   *
   * @param {string} idVideoYouTube Id del vídeo de YouTube.
   * @param {number} tiempo Tiempo de inicio de reproducción.
   */
  self.alRecibirVideoYouTube = function (idVideoYouTube, tiempo) {
    
  }
  
  /**
   * Sirve para hacer override.
   */
  self.alDesconectarse = function () {
    
  }
  
  /**
   * Establece el alias del usuario.
   *
   * @param {string} alias Alias nuevo.
   */
  self.setAlias = function (alias) {
    if (!self.conectado || alias == self.alias) {
      return;
    }
    
    var longitud = alias.length;
    
    if (longitud < self.MIN_LONG_ALIAS) {
      throw new ChatException('Alias muy corto.', 1);
    }
    
    if (longitud > self.MAX_LONG_ALIAS) {
      throw new ChatException('Alias muy largo.', 2);
    }
    
    self.io.emit('setAlias', alias);
    self.alias = alias;
    Cookie.set('chat_alias', alias);
  }
  
  /**
   * Establece el color del usuario.
   *
   * @param {string} color Color nuevo.
   */
  self.setColor = function (color) {
    if (!self.conectado || color == self.color) {
      return;
    }
    
    if (!validarColor(color)) {
      throw new ChatException('Color inválido.', 1);
    }
    
    self.io.emit('setColor', color);
    self.color = color;
    Cookie.set('chat_color', color);
  }
  
  /**
   * Envía un mensaje a todos los usuarios del chat.
   *
   * @param {string} mensaje Mensaje a enviar.
   * @param {string} idDestinatario (Opcional) Id del usuario destinatario, si se especifíca se enviará un MP.
   */
  self.enviarMensaje = function (mensaje, idDestinatario) {
    if (!self.conectado) {
      return;
    }
    
    var longitud = mensaje.length;
    
    if (longitud < self.MIN_LONG_MENSAJE) {
      throw new ChatException('Mensaje muy corto.', 1);
    }
    
    if (longitud > self.MAX_LONG_MENSAJE) {
      throw new ChatException('Mensaje muy largo.', 2);
    }
    
    var datos = {
      mensaje : mensaje, 
      idDestinatario : idDestinatario
    };
    
    self.io.emit('enviarMensaje', datos);
  }
  
  /**
   * Envía el id md5 de un archivo de audio a todos los usuarios del chat.
   *
   * @param {string} idMd5 Id del audio a compartir.
   */
  self.enviarAudio = function (idMd5) {
    if (!self.conectado) {
      return;
    }
    
    if (!validarMd5(idMd5)) {
      throw new ChatException('El ID del archivo de audio es inválido.', 1);
    }
    
    self.io.emit('enviarAudio', idMd5);
  }
  
  /**
   * Envía un audio de YouTube a todos los usuarios del chat.
   *
   * @param {string} url URL del vídeo de YouTube.
   */
  self.enviarAudioYouTube = function (url) {
    if (!self.conectado) {
      return;
    }
    
    if (!validarURLYouTube(url)) {
      throw new ChatException('Por favor introduce una URL de vídeo válida.', 1);
    }
    
    self.io.emit('enviarAudioYouTube', url);
  }
  
  /**
   * Envía un vídeo de YouTube a todos los usuarios del chat.
   *
   * @param {string} url URL del vídeo de YouTube.
   */
  self.enviarVideoYouTube = function (url) {
    if (!self.conectado) {
      return;
    }
    
    if (!validarURLYouTube(url)) {
      throw new ChatException('Por favor introduce una URL de vídeo válida.', 1);
    }
    
    self.io.emit('enviarVideoYouTube', url);
  }
  
  /**
   * Reproduce el audio actual de YouTube.
   */
  self.repAudioActualYouTube = function () {
    if (!self.conectado) {
      return;
    }
    
    self.io.emit('repAudioActualYouTube');
  }
  
  /**
   * Reproduce el vídeo actual de YouTube.
   */
  self.repVideoActualYouTube = function () {
    if (!self.conectado) {
      return;
    }
    
    self.io.emit('repVideoActualYouTube');
  }
  
  /**
   * Agrega el id del usuario a ignorar a la lista para ignorar.
   *
   * @param {string} id Id del usuario a ignorar.
   */
  self.ignorar = function (id) {
    self.listaIgnorar[ id ] = id;
  }
  
  /**
   * Retira el id del usuario ignorado de la lista para ignorar (si existe).
   *
   * @param {string} id Id del usuario a escuchar.
   */
  self.escuchar = function (id) {
    delete self.listaIgnorar[ id ];
  }
  
  return self;
})();