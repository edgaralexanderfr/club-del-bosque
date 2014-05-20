/**
 * Copyright 2014 - Edgar Alexander Franco
 *
 * @author Edgar Alexander Franco
 * @version 1.7.1
 */

var http = require('http');
var config = require('./config.json');
var htmlspecialchars = require('./lib/php.js/htmlspecialchars.js').htmlspecialchars;
var validarColor = require('./function.validarColor.js').validarColor;
var validarMd5 = require('./function.validarMd5.js').validarMd5;
var getIdYouTube = require('./function.getIdYouTube.js').getIdYouTube;
var getFechaActual = require('./function.getFechaActual.js').getFechaActual;
var vaciarDirectorio = require('./function.vaciarDirectorio.js').vaciarDirectorio;

exports.Chat = (function () {
  var self = {};
  
  const RUTA_SOCKET_IO = config.RUTA_SOCKET_IO;
  const RUTA_AUDIOS = config.RUTA_AUDIOS;
  const ELIMINAR_AUDIOS_AL_INICIAR = config.ELIMINAR_AUDIOS_AL_INICIAR;
  const PUERTO = config.PUERTO;
  const MIN_LONG_ALIAS = config.MIN_LONG_ALIAS;
  const MAX_LONG_ALIAS = config.MAX_LONG_ALIAS;
  const MIN_LONG_MENSAJE = config.MIN_LONG_MENSAJE;
  const MAX_LONG_MENSAJE = config.MAX_LONG_MENSAJE;
  const ALIAS_POR_DEFECTO = config.ALIAS_POR_DEFECTO;
  const COLOR_POR_DEFECTO = config.COLOR_POR_DEFECTO;
  const NUM_MIN_ALIAS_REPETIDO = config.NUM_MIN_ALIAS_REPETIDO;
  const NUM_MAX_ALIAS_REPETIDO = config.NUM_MAX_ALIAS_REPETIDO;
  const REGISTRO_MAX_MENSAJES = config.REGISTRO_MAX_MENSAJES;
  const MENSAJE_SERVIDOR = 1;
  const MENSAJE_CLIENTE = 2;
  const VIDEO_YOUTUBE = 1;
  const AUDIO_YOUTUBE = 2;
  
  self.io = null;
  self.ultimoId = 0;
  self.miembros = {};
  self.mensajes = [];
  self.ultimoAudioYouTube = {
    id : '', 
    duracion : 0, 
    tiempoRepro : 0
  };
  
  self.ultimoVideoYouTube = {
    id : '', 
    duracion : 0, 
    tiempoRepro : 0
  };
  
  /**
   * TODO: Llamar a éste método para inicializar el chat.
   */
  self.init = function () {
    if (ELIMINAR_AUDIOS_AL_INICIAR) {
      vaciarDirectorio(RUTA_AUDIOS);
    }
    
    self.io = require(RUTA_SOCKET_IO).listen(PUERTO);
    self.io.sockets.on('connection', conectar);
  }
  
  /**
   * Conecta un nuevo usuario al chat.
   *
   * @param {object} socket Socket del usuario conectado.
   */
  function conectar (socket) {
    self.ultimoId++;
    
    var id = 'u' + self.ultimoId;
    self.miembros[ id ] = {};
    
    var usuario = self.miembros[ id ];
    usuario.socket = socket;
    usuario.alias = self.getAliasValido(ALIAS_POR_DEFECTO);
    usuario.color = COLOR_POR_DEFECTO;
    usuario.fechaConexion = getFechaActual();
    
    /**
     * Se ejecuta cuando el cliente envía las cookies.
     *
     * @param {object} datos Alias y color del usuario.
     */
    socket.on('cargar', function (datos) {
      var alias = datos.alias;
      var color = datos.color;
      
      if (alias != null) {
        self.setAlias(id, alias);
      }
      
      if (color != null) {
        self.setColor(id, color);
      }
      
      self.registrarMensajeServidor(usuario.alias + ' acaba de llegar.');
      
      var datos = {
        id : id, 
        alias : usuario.alias, 
        color : usuario.color, 
        fechaConexion : usuario.fechaConexion
      };
      
      socket.broadcast.emit('conectarUsuario', datos);
    });
    
    /**
     * Establece el alias del usuario.
     *
     * @param {string} alias Alias nuevo.
     */
    socket.on('setAlias', function (alias) {
      self.setAlias(id, alias);
    });
    
    /**
     * Establece el color del usuario.
     *
     * @param {string} color Color nuevo.
     */
    socket.on('setColor', function (color) {
      self.setColor(id, color);
    });
    
    /**
     * Envía un mensaje a todos los usuarios del chat.
     *
     * @param {object} datos Mensaje e id destinatario (opcional).
     */
    socket.on('enviarMensaje', function (datos) {
      self.enviarMensaje(id, datos.mensaje, datos.idDestinatario);
    });
    
    /**
     * Envía un id md5 de un archivo de audio.
     *
     * @param {string} idMd5 Id del audio a compartir.
     */
    socket.on('enviarAudio', function (idMd5) {
      self.enviarAudio(id, idMd5);
    });
    
    /**
     * Envía un audio de YouTube a todos los usuarios del chat.
     *
     * @param {string} url URL del vídeo de YouTube.
     */
    socket.on('enviarAudioYouTube', function (url) {
      self.compartirVideoYouTube(id, AUDIO_YOUTUBE, url);
    });
    
    /**
     * Envía un vídeo de YouTube a todos los usuarios del chat.
     *
     * @param {string} url URL del vídeo de YouTube.
     */
    socket.on('enviarVideoYouTube', function (url) {
      self.compartirVideoYouTube(id, VIDEO_YOUTUBE, url);
    });
    
    /**
     * Reproduce el audio actual de YouTube.
     */
    socket.on('repAudioActualYouTube', function () {
      self.repVideoActualYouTube(id, AUDIO_YOUTUBE);
    });
    
    /**
     * Reproduce el vídeo actual de YouTube.
     */
    socket.on('repVideoActualYouTube', function () {
      self.repVideoActualYouTube(id, VIDEO_YOUTUBE);
    });
    
    /**
     * Se ejecuta cuando se pierde la conexión con el usuario.
     */
    socket.on('disconnect', function () {
      delete self.miembros[ id ];
      self.registrarMensajeServidor(usuario.alias + ' se ha ido.');
      var datos = {
        id : id, 
        alias : usuario.alias
      };
      
      socket.broadcast.emit('desconectarUsuario', datos);
    });
    
    var miembros = {};
    var miembro;
    
    for (var i in self.miembros) {
      miembro = self.miembros[ i ];
      
      if (miembro.alias != usuario.alias) {
        miembros[ i ] = {
          alias : miembro.alias, 
          color : miembro.color, 
          fechaConexion : miembro.fechaConexion
        };
      }
    }
    
    socket.emit('cargar', { alias : usuario.alias, color : usuario.color, fechaConexion : usuario.fechaConexion, mensajes : self.mensajes, miembros : miembros });
    self.repVideoActualYouTube(id, AUDIO_YOUTUBE);
    self.repVideoActualYouTube(id, VIDEO_YOUTUBE);
  }
  
  /**
   * Establece el alias de un usuario.
   *
   * @param {string} id Id del usuario a actualizar.
   * @param {string} alias Alias nuevo.
   */
  self.setAlias = function (id, alias) {
    var usuario = self.miembros[ id ];
    
    if (alias == usuario.alias) {
      return;
    }
    
    var longitud = alias.length;
    
    if (longitud < MIN_LONG_ALIAS) {
      return;
    }
    
    if (longitud > MAX_LONG_ALIAS) {
      return;
    }
    
    alias = htmlspecialchars(self.getAliasValido(alias));
    usuario.alias = alias;
    
    usuario.socket.emit('ajustarAlias', alias);
    
    var datos = {
      id : id, 
      alias : alias
    };
    
    usuario.socket.broadcast.emit('actualizarAlias', datos);
  }
  
  /**
   * Si el alias especificado está en uso, entonces se retornará un alias con un número adicional.
   *
   * @param {string} alias Alias a validar.
   *
   * @return {string}
   */
  self.getAliasValido = function (alias) {
    var aliasNuevo = alias;
    var usado;
    
    do {
      usado = false;
      
      for (var id in self.miembros) {
        if (aliasNuevo == self.miembros[ id ].alias) {
          aliasNuevo = alias + '' + (Math.floor(Math.random() * NUM_MAX_ALIAS_REPETIDO) + NUM_MIN_ALIAS_REPETIDO);
          usado = true;
          
          break;
        }
      }
    } while (usado);
    
    return aliasNuevo;
  }
  
  /**
   * Establece el color de un usuario.
   *
   * @param {string} id Id del usuario a actualizar.
   * @param {string} color Color nuevo.
   */
  self.setColor = function (id, color) {
    var usuario = self.miembros[ id ];
    
    if (!validarColor(color)) {
      return;
    }
    
    usuario.color = color;
    usuario.socket.emit('ajustarColor', color);
    
    var datos = {
      id : id, 
      color : color
    };
    
    usuario.socket.broadcast.emit('actualizarColor', datos);
  }
  
  /**
   * Envía un mensaje a todos los usuarios del chat.
   *
   * @param {string} id Id del usuario remitente.
   * @param {string} mensaje Mensaje a enviar.
   * @param {string} idDestinatario (Opcional) Id del usuario destinatario, si se especifíca se enviará un MP.
   */
  self.enviarMensaje = function (id, mensaje, idDestinatario) {
    var usuario = self.miembros[ id ];
    var longitud = mensaje.length;
    
    if (longitud < MIN_LONG_MENSAJE) {
      return;
    }
    
    if (longitud > MAX_LONG_MENSAJE) {
      return;
    }
    
    mensaje = htmlspecialchars(mensaje);
    var destinatario = self.miembros[ idDestinatario ];
    
    if (typeof destinatario == 'undefined') {
      self.registrarMensajeCliente(usuario.alias, usuario.color, mensaje);
      self.io.sockets.emit('recibirMensaje', { id : id, alias : usuario.alias, color : usuario.color, mensaje : mensaje });
      
      return;
    }
    
    destinatario.socket.emit('recibirMensajePrivado', { id : id, alias : usuario.alias, color : usuario.color, mensaje : mensaje, destinatario : destinatario.alias });
    
    if (idDestinatario != id) {
      usuario.socket.emit('recibirMensajePrivado', { id : id, alias : usuario.alias, color : usuario.color, mensaje : mensaje, destinatario : destinatario.alias });
    }
  }
  
  /**
   * Envía un Id md5 de un archivo de audio.
   *
   * @param {string} id Id del usuario que comparte.
   * @param {string} idMd5 Id del audio a compartir.
   */
  self.enviarAudio = function (id, idMd5) {
    var usuario = self.miembros[ id ];
    
    if (!validarMd5(idMd5)) {
      return;
    }
    
    self.io.sockets.emit('recibirAudio', { id : id, alias : usuario.alias, color : usuario.color, idMd5 : idMd5 });
  }
  
  /**
   * Comparte un vídeo de YouTube con todos los usuarios conectados.
   *
   * @param {string} id Id del usuario que comparte.
   * @param {number} tipo Enumeración que indica el tipo de compartimiento.
   * @param {string} url URL del vídeo a compartir.
   */
  self.compartirVideoYouTube = function (id, tipo, url) {
    var usuario = self.miembros[ id ];
    var idVideoYouTube = getIdYouTube(url);
    
    if (idVideoYouTube == null) {
      return;
    }
    
    var str = '';
    
    http.request('http://gdata.youtube.com/feeds/api/videos/' + encodeURIComponent(idVideoYouTube) + '?v=2&alt=json', function (respuesta) {
      respuesta.on('data', function (chunk) {
        str += chunk;
      });
      
      respuesta.on('end', function () {
        try {
          var json = JSON.parse(str);
          var duracion = json.entry['media$group']['media$content'][0].duration;
          var tiempoRepro = Math.round(new Date().getTime() / 1000);
          var datos = {
            idVideoYouTube : idVideoYouTube, 
            tiempo : 0
          };
          
          if (tipo == AUDIO_YOUTUBE) {
            self.ultimoAudioYouTube = {
              id : idVideoYouTube, 
              duracion : duracion, 
              tiempoRepro : tiempoRepro
            };
            
            self.io.sockets.emit('recibirAudioYouTube', datos);
          } else {
            self.ultimoVideoYouTube = {
              id : idVideoYouTube, 
              duracion : duracion, 
              tiempoRepro : tiempoRepro
            };
            
            self.io.sockets.emit('recibirVideoYouTube', datos);
          }
        } catch (ex1) {
          
        }
      });
    }).end();
  }
  
  /**
   * Reanuda el vídeo actual para el usuario solicitante.
   *
   * @param {string} id Id del usuario solicitante.
   * @param {number} tipo Enumeración que indica el tipo de compartimiento.
   */
  self.repVideoActualYouTube = function (id, tipo) {
    var video = (tipo == AUDIO_YOUTUBE) ? self.ultimoAudioYouTube : self.ultimoVideoYouTube ;
    
    if (video.id == '') {
      return;
    }
    
    var tiempo = Math.round(new Date().getTime() / 1000) - video.tiempoRepro;
    
    if (tiempo >= video.duracion) {
      return;
    }
    
    var socket = self.miembros[ id ].socket;
    var datos = {
      idVideoYouTube : video.id, 
      tiempo : tiempo
    };
    
    if (tipo == AUDIO_YOUTUBE) {
      socket.emit('recibirAudioYouTube', datos);
    } else {
      socket.emit('recibirVideoYouTube', datos);
    }
  }
  
  /**
   * Registra el mensaje del servidor en la lista de mensajes.
   *
   * @param {string} mensaje Mensaje del servidor.
   */
  self.registrarMensajeServidor = function (mensaje) {
    self.mensajes.push({ tipo : MENSAJE_SERVIDOR, mensaje : mensaje });
    
    if (self.mensajes.length > REGISTRO_MAX_MENSAJES) {
      self.mensajes = self.mensajes.slice(1);
    }
  }
  
  /**
   * Registra el mensaje de cliente en la lista de mensajes.
   *
   * @param {string} alias Alias del usuario.
   * @param {string} color Color del usuario.
   * @param {string} mensaje Mensaje del usuario.
   */
  self.registrarMensajeCliente = function (alias, color, mensaje) {
    self.mensajes.push({ tipo : MENSAJE_CLIENTE, alias : alias, color : color, mensaje : mensaje });
    
    if (self.mensajes.length > REGISTRO_MAX_MENSAJES) {
      self.mensajes = self.mensajes.slice(1);
    }
  }
  
  return self;
})();