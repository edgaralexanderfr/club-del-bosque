/**
 * Copyright 2014 - Edgar Alexander Franco
 *
 * @author Edgar Alexander Franco
 * @version 1.7.1
 */

$(document).ready(function () {
  /**
   * Prepara el evento de los botones para ignorar.
   */
  function crearEventoBotonIgnorar () {
    $('[name="botonIgnorar"]').unbind('click');
    $('[name="botonIgnorar"]').click(function (evt) {
      var id = $(this).parent().parent().attr('data-id');
      
      if ($(this).attr('data-ignorado') == '0') {
        Chat.ignorar(id);
        $(this).attr('data-ignorado', '1');
        $(this).html('Escuchar');
      } else {
        Chat.escuchar(id);
        $(this).attr('data-ignorado', '0');
        $(this).html('Ignorar');
      }
    });
  }
  
  /**
   * Ajusta el scroll del chat y reproduce el beep.
   */
  function mostrarMensaje () {
    $('.chat').scrollTop($('.chat')[0].scrollHeight);
    
    var mensaje = $('.chat').children().last();
    mensaje.css('opacity', '0');
    mensaje.animate({ opacity : 1 }, 'slow');
    
    if (beepActivado) {
      Sonido.play('beep');
    }
  }
  
  /**
   * Se ejecuta cuando el servidor recibe las cookies.
   */
  Chat.alCargar = function (alias, color, fechaConexion, mensajes, miembros) {
    var total = mensajes.length;
    var htmlMensajes = '';
    var mensaje;
    
    for (var i = 0; i < total; i++) {
      mensaje = mensajes[ i ];
      
      if (mensaje.tipo == Chat.MENSAJE_SERVIDOR) {
        htmlMensajes += 
        '<div class="mensaje">' + 
          '<div class="log">' + mensaje.mensaje + '</div>' + 
        '</div>';
      } else {
        htmlMensajes += 
        '<div class="mensaje">' + 
          '<div class="logMensaje">' + 
            '<span class="logMensajeRemitente" style="color : ' + mensaje.color + ';">' + mensaje.alias + ':</span>' + mensaje.mensaje + 
          '</div>' + 
        '</div>';
      }
    }
    
    htmlMensajes += 
    '<div class="mensaje">' + 
      '<div class="log">Bienvenido al club del bosque.</div>' + 
    '</div>';
    
    var htmlMiembros = '';
    var htmlDestinatarios = '';
    var destinatario;
    
    for (var id in miembros) {
      destinatario = miembros[ id ];
      
      htmlMiembros += 
      '<div class="miembro" data-id="' + id + '">' + 
        '<div class="username" style="color : ' + destinatario.color + '">' + 
          destinatario.alias + 
        '</div>' + 
        '<div class="fechaConexion" title="Llegó el: ' + destinatario.fechaConexion + '">' + 
          destinatario.fechaConexion + 
        '</div>' + 
        '<div class="ignorar">' + 
          '<button class="boton" name="botonIgnorar" data-ignorado="0">Ignorar</button>' + 
        '</div>' + 
      '</div>';
      
      htmlDestinatarios += 
      '<option value="' + id + '" title="Susurrar a ' + destinatario.alias + '">' + destinatario.alias + '</option>';
    }
    
    $('.miembros').html(htmlMiembros);
    $('.chat').html(htmlMensajes);
    $('.inputAlias').val(alias);
    $('.inputColor').val(color);
    $('.selectDestinatarios').append(htmlDestinatarios);
    
    crearEventoBotonIgnorar();
    mostrarMensaje();
  }
  
  /**
   * Se ejecuta cuando se conecta un nuevo usuario.
   */
  Chat.alConectarUsuario = function (id, alias, color, fechaConexion) {
    $('.chat').append(
      '<div class="mensaje">' + 
        '<div class="log">' + alias + ' acaba de llegar.</div>' + 
      '</div>'
    );
    
    $('.miembros').append(
      '<div class="miembro" data-id="' + id + '">' + 
        '<div class="username" style="color : ' + color + '">' + 
          alias + 
        '</div>' + 
        '<div class="fechaConexion" title="Llegó el: ' + fechaConexion + '">' + 
          fechaConexion + 
        '</div>' + 
        '<div class="ignorar">' + 
          '<button class="boton" name="botonIgnorar" data-ignorado="0">Ignorar</button>' + 
        '</div>' + 
      '</div>'
    );
    
    $('.selectDestinatarios').append(
      '<option value="' + id + '" title="Susurrar a ' + alias + '">' + alias + '</option>'
    );
    
    crearEventoBotonIgnorar();
    mostrarMensaje();
  }
  
  /**
   * Se ejecuta cuando se desconecta un usuario.
   */
  Chat.alDesconectarUsuario = function (id, alias) {
    $('.chat').append(
      '<div class="mensaje">' + 
        '<div class="log">' + alias + ' se ha ido.</div>' + 
      '</div>'
    );
    
    $('.miembro').each(function () {
      if ($(this).attr('data-id') == id) {
        $(this).remove();
      }
    });
    
    $('.selectDestinatarios option').each(function () {
      if ($(this).val() == id) {
        $(this).remove();
      }
    });
    
    mostrarMensaje();
  }
  
  /**
   * Se ejecuta cuando se actualiza el alias en el servidor.
   */
  Chat.alAjustarAlias = function (alias) {
    $('.inputAlias').val(alias);
  }
  
  /**
   * Se ejecuta cuando un usuario actualiza su alias.
   */
  Chat.alActualizarAlias = function (id, alias) {
    $('.miembro').each(function () {
      if ($(this).attr('data-id') == id) {
        $(this).children().first().html(alias);
      }
    });
    
    $('.selectDestinatarios option').each(function () {
      if ($(this).val() == id) {
        $(this).prop('title', alias);
        $(this).html(alias);
      }
    });
  }
  
  /**
   * Se ejecuta cuando se actualiza el color en el cliente.
   */
  Chat.alAjustarColor = function (color) {
    $('.inputColor').val(color);
  }
  
  /**
   * Se ejecuta cuando un usuario actualiza su color.
   */
  Chat.alActualizarColor = function (id, color) {
    $('.miembro').each(function () {
      if ($(this).attr('data-id') == id) {
        $(this).children().first().css('color', color);
      }
    });
  }
  
  /**
   * Se ejecuta al recibir un MP nuevo.
   */
  Chat.alRecibirMensajePrivado = function (id, alias, color, mensaje, destinatario) {
    $('.chat').append(
      '<div class="mensaje">' + 
        '<div class="logSusurro">' + 
          '<span class="logMensajeRemitente" style="color : ' + color + ';">' + alias + ' le susurra a ' + destinatario + ':</span>' + mensaje + 
        '</div>' + 
      '</div>'
    );
    
    mostrarMensaje();
  }
  
  /**
   * Se ejecuta al recibir un mensaje nuevo.
   */
  Chat.alRecibirMensaje = function (id, alias, color, mensaje) {
    $('.chat').append(
      '<div class="mensaje">' + 
        '<div class="logMensaje">' + 
          '<span class="logMensajeRemitente" style="color : ' + color + ';">' + alias + ':</span>' + mensaje + 
        '</div>' + 
      '</div>'
    );
    
    mostrarMensaje();
  }
  
  /**
   * Se ejecuta al recibir un audio nuevo.
   */
  Chat.alRecibirAudio = function (id, alias, color, idMd5) {
    $('.chat').append(
      '<div class="mensaje">' + 
        '<div class="logMensaje">' + 
          '<span class="logMensajeRemitente" style="color : ' + color + ';">' + alias + ':</span>' + 
          '<audio id="audio_' + idMd5 + '" src="' + Microfono.URL_AUDIOS + idMd5 + Sonido.tipo + '"></audio>' + 
          '<a class="linkAudio" href="' + Microfono.URL_AUDIOS + idMd5 + Sonido.tipo + '" data-id="' + idMd5 + '" title="Click para reproducir.">Ha dicho algo.</a>' + 
        '</div>' + 
      '</div>'
    );
    
    $('.linkAudio').click(function (evt) {
      evt.preventDefault();
      var id = '#audio_' + $(this).attr('data-id');
      
      $(id)[0].play();
    });
    
    $('#audio_' + idMd5).on('loadeddata', function (evt) {
      $(this)[0].play();
    });
    
    mostrarMensaje();
  }
  
  /**
   * Se ejecuta al recibir un audio de YouTube.
   */
  Chat.alRecibirAudioYouTube = function (idVideoYouTube, tiempo) {
    $('#audioYouTube').html('');
    $('#audioYouTube').html('<iframe width="0" height="0" src="//www.youtube.com/embed/' + idVideoYouTube + '?html5=1&vq=small&autoplay=1&start=' + tiempo + '" frameborder="0"></iframe>');
    
    if (tiempo == 0) {
      Sonido.play('moneda');
    } else {
      Sonido.play('tocadiscos');
    }
  }
  
  /**
   * Se ejecuta al recibir un vídeo de YouTube.
   */
  Chat.alRecibirVideoYouTube = function (idVideoYouTube, tiempo) {
    $('#videoYouTube').html('');
    $('#videoYouTube').html('<iframe width="640" height="390" src="//www.youtube.com/embed/' + idVideoYouTube + '?html5=1&showinfo=0&controls=0&iv_load_policy=3&vq=small&autoplay=1&start=' + tiempo + '&rel=0" frameborder="0"></iframe>');
    $('#ventanaVideo').fadeIn('slow');
    Sonido.play('proyector');
  }
  
  /**
   * Se ejecuta si se pierde la conexión con el servidor.
   */
  Chat.alDesconectarse = function () {
    window.location = 'cerrado.php';
  }
  
  Chat.init();
  
  Sonido.cargar('beep', './audio/beep');
  Sonido.cargar('moneda', './audio/moneda');
  Sonido.cargar('tocadiscos', './audio/tocadiscos');
  Sonido.cargar('proyector', './audio/proyector');
  
  /**
   * Se ejecuta cuando el micrófono empieza a grabar.
   */
  Microfono.alGrabar = function () {
    $('#botonGrabar').attr('class', 'botonGrabarGrabando');
    $('#botonGrabar').attr('title', 'Grabando...');
  }
  
  /**
   * Se ejecuta cuando se comienza a procesar la grabación y se envía al servidor.
   */
  Microfono.alEnviarAudio = function () {
    $('#botonGrabar').attr('class', 'botonGrabarGuardando');
    $('#botonGrabar').attr('title', 'Guardando...');
  }
  
  /**
   * Se ejecuta cuando la grabación termina de guardarse en el servidor.
   */
  Microfono.alGuardarAudio = function (xhr) {
    $('#botonGrabar').attr('class', 'botonGrabar');
    $('#botonGrabar').attr('title', 'Grabar un audio de 5 segundos.');
    
    if (xhr == null || xhr.status != 200) {
      alert('No se pudo transportar la grabación.');
      
      return;
    }
    
    var respuesta = JSON.parse(xhr.responseText);
    
    if (respuesta.codigo != 0) {
      alert(respuesta.mensaje);
      
      return;
    }
    
    Chat.enviarAudio(respuesta.id);
  }
  
  $(window).keydown(function (evt) {
    if (evt.which != 9) {
      return;
    }
    
    if ($('#ventanaVideo').css('display') == 'none') {
      $('#ventanaVideo').fadeIn('fast');
    } else {
      $('#ventanaVideo').fadeOut('fast');
    }
  });
  
  $('#botonOcultarVideo').click(function (evt) {
    $('#ventanaVideo').fadeOut('fast');
  });
  
  function compartirVideo () {
    try {
      Chat.enviarVideoYouTube($('#inputVideo').val());
      $('#inputVideo').val('');
      $('#ventanaVideos').hide();
    } catch (ex1) {
      alert(ex1.mensaje);
    }
  }
  
  $('#inputVideo').keydown(function (evt) {
    if (evt.which == 13) {
      compartirVideo();
    }
  });
  
  $('#botonCompartirVideo').click(function (evt) {
    compartirVideo();
  });
  
  $('#botonMostrarVideo').click(function (evt) {
    $('#ventanaVideos').hide();
    $('#ventanaVideo').fadeIn('fast');
  });
  
  $('#botonReanudarVideo').click(function (evt) {
    $('#ventanaVideos').hide();
    Chat.repVideoActualYouTube();
  });
  
  $('#botonCerrarVentanaVideos').click(function (evt) {
    $('#ventanaVideos').fadeOut('fast');
  });
  
  function cargarRelatos () {
    $.getJSON('./js/relatos.json', function (relatos) {
      var total = relatos.length;
      
      if (total == 0) {
        $('.relatos').html('Lo sentimos, no hay relatos disponibles.');
        
        return;
      }
      
      var html = '';
      var relato;
      
      for (var i = 0; i < total; i++) {
        relato = relatos[ i ];
        html += 
        '<a class="relato" href="' + relato.url + '" title="Click para reproducir.">' + relato.titulo + '</a>';
      }
      
      $('.relatos').html(html);
      $('.relato').click(function (evt) {
        evt.preventDefault();
        
        try {
          Chat.enviarAudioYouTube($(this).attr('href'));
        } catch (ex1) {
          
        }
      });
    });
  }
  
  function compartirAudio () {
    try {
      Chat.enviarAudioYouTube($('#inputAudio').val());
      $('#inputAudio').val('');
    } catch (ex1) {
      alert(ex1.mensaje);
    }
  }
  
  $('#inputAudio').keydown(function (evt) {
    if (evt.which == 13) {
      compartirAudio();
    }
  });
  
  $('#botonCompartirAudio').click(function (evt) {
    compartirAudio();
  });
  
  $('#botonPararAudio').click(function (evt) {
    $('#audioYouTube').html('');
  });
  
  $('#botonReanudarAudio').click(function (evt) {
    Chat.repAudioActualYouTube();
  });
  
  $('#botonCerrarVentanaAudios').click(function (evt) {
    $('#ventanaAudios').fadeOut('fast');
  });
  
  $('#botonCerrarVentanaMiembros').click(function (evt) {
    $('#ventanaMiembros').fadeOut('fast');
  });
  
  /**
   * Desplaza la niebla del chat hacia la izquierda.
   */
  function animarNiebla () {
    $('.chat').css('background-position', xNiebla + 'px top, right top, center center');
    
    xNiebla--;
    
    if (xNiebla == -910) {
      xNiebla = 955;
    }
  }
  
  var xNiebla = 954;
  
  window.setInterval(animarNiebla, 350);
  
  $('#botonAbrirVentanaVideos').click(function (evt) {
    $('#ventanaVideos').fadeIn('fast', function () {
      $('#inputVideo').focus();
    });
  });
  
  $('#botonAbrirVentanaAudios').click(function (evt) {
    $('#ventanaAudios').fadeIn('fast', function () {
      $('#inputAudio').focus();
    });
  });
  
  $('#botonAbrirVentanaMiembros').click(function (evt) {
    $('#ventanaMiembros').fadeIn('fast');
  });
  
  var beepActivado = true;
  
  $('#botonBeep').click(function (evt) {
    if (beepActivado) {
      beepActivado = false;
      $(this).html('Activar Beep');
    } else {
      beepActivado = true;
      $(this).html('Desactivar Beep');
    }
  });
  
  var URL_BGS = '//www.youtube.com/embed/5f11DmWpOUk?html5=1&vq=small&autoplay=1&playlist=5f11DmWpOUk&loop=1';
  var bgsActivado = true;
  
  /**
   * Activa el sonido de fondo.
   */
  function activarBGS () {
    bgsActivado = true;
    $('#bgs').html('<iframe width="0" height="0" src="' + URL_BGS + '" frameborder="0"></iframe>');
  }
  
  $('#botonBGS').click(function (evt) {
    if (bgsActivado) {
      bgsActivado = false;
      $('#bgs').html('');
      $(this).html('Activar BGS');
    } else {
      activarBGS();
      $(this).html('Desactivar BGS');
    }
  });
  
  $('.inputAlias').blur(function (evt) {
    try {
      Chat.setAlias($(this).val());
    } catch (ex1) {
      alert(ex1.mensaje);
    }
  });
  
  $('.inputColor').blur(function (evt) {
    try {
      Chat.setColor($(this).val());
    } catch (ex1) {
      alert(ex1.mensaje);
    }
  });
  
  $('#botonGrabar').click(function (evt) {
    try {
      Microfono.palanquear();
    } catch (ex1) {
      alert(ex1.mensaje);
    }
  });
  
  /**
   * Envía un mensaje a todos los usuarios del chat.
   */
  function enviarMensaje () {
    try {
      Chat.enviarMensaje($('.inputMensaje').val(), $('.selectDestinatarios').val());
      $('.inputMensaje').val('');
    } catch (ex1) {
      alert(ex1.mensaje);
    }
  }
  
  $('.inputMensaje').keydown(function (evt) {
    if (evt.which == 9) {
      evt.preventDefault();
      
      return;
    }
    
    if (evt.which == 13) {
      enviarMensaje();
    }
  });
  
  $('#botonEnviarMensaje').click(function (evt) {
    enviarMensaje();
  });
  
  cargarRelatos();
  activarBGS();
  $('.inputMensaje').focus();
});