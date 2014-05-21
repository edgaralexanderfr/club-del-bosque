Club del bosque
===============

Introducción
------------

Club del bosque es un sitio dedicado a reunir varias personas interesadas en el mundo paranormal para que así puedan compartir intereses comunes.

Varias e interesantes características son: la comunicación en tiempo real con un chat hecho con WebSockets, compartir relatos, audios y vídeos de YouTube, personalizar el color del nombre de usuario, respaldo de datos básicos a través de cookies y la más importante que es la comunicación a través de voice chat.

La versión actual y estable es la 1.7.1.

Requerimientos
--------------

Para instalar dicho chat, se requiere un servidor que tenga instalado los siguientes softwares:

1. Node.js - http://nodejs.org/
2. Socket.IO - http://socket.io/
3. Apache server (o cualquier servidor web con PHP preferiblemente) - https://www.apachefriends.org/
4. FFMPEG (programa ejecutable, hay una copia para Windows disponible en el directorio "servidor") - http://www.ffmpeg.org/

Instalación
-----------

Una vez preparado el servidor, el siguiente paso será descargar una copia del repositorio, para ello ve a la raíz del repositorio y das en el botón "Descargar como zip", otra forma de hacerlo es abriendo una nueva sesión en una terminal UNIX / Windows y escribiendo el siguiente comando en el directorio donde quieres descargar el repositorio:

```
git clone http://github.com/edgaralexanderfr/club-del-bosque.git
```

Luego de haber descargado el repositorio separa el directorio servidor del resto y colócalo en un sitio aparte, preferiblemente en el escritorio o en un directorio para tu comodidad, una vez aislado mueve el directorio club-del-bosque (sin el directorio "servidor"), a algún sitio accesible de tu servidor web en la carpeta "htdocs".

Una vez hecho ésto lo único que nos queda por hacer es configurar el chat.

Configuración
-------------

Existen 4 archivos que debemos modificar para configurar el chat, primero empezarémos configurando el servidor como tal, para ello debemos dirigirnos a la ubicación de nuestro directorio "servidor" (sí, debemos ir al sitio dónde lo colocamos), ubicamos el archivo "config.json", lo abrímos con un editor de texto, y verémos lo siguiente:

```javascript
{
  "RUTA_SOCKET_IO" : "C:\\Program Files\\nodejs\\node_modules\\socket.io", 
  "RUTA_AUDIOS" : "../audios/", 
  "ELIMINAR_AUDIOS_AL_INICIAR" : true, 
  "PUERTO" : 55555, 
  "MIN_LONG_ALIAS" : 1, 
  "MAX_LONG_ALIAS" : 20, 
  "MIN_LONG_MENSAJE" : 1, 
  "MAX_LONG_MENSAJE" : 200, 
  "ALIAS_POR_DEFECTO" : "Nuevo", 
  "COLOR_POR_DEFECTO" : "#ec8500", 
  "NUM_MIN_ALIAS_REPETIDO" : 1000, 
  "NUM_MAX_ALIAS_REPETIDO" : 8999, 
  "REGISTRO_MAX_MENSAJES" : 20
}
```

En dónde nos enfocarémos en las constantes:

1. RUTA_SOCKET_IO: Determina la ruta del módulo socket.io para node.js, si socket.io está denotado globalmente solo debémos dejarlo como "socket.io".
2. RUTA_AUDIOS: Ruta de los archivos de audio grabados por el voice chat, debemos apuntarlo hacia la ruta en nuestro servidor web (la carpeta htdocs/club-del-bosque/audios/) de forma global o relativa.

Del resto, puedes configurar otras cosas a tu criterio, éstas son las más esenciales.

Luego nos regresamos a nuestro directorio del servidor web (club-del-bosque) y abrímos el archivo "guardar-audio.php", enfocándonos en la siguientes líneas:

```php
<?php
  
  /**
   * Copyright 2014 - Edgar Alexander Franco
   *
   * @author Edgar Alexander Franco
   * @version 1.7.1
   */
  
  header('Access-Control-Allow-Origin: http://club-del-bosque.hol.es');
  header('Access-Control-Allow-Methods: GET, POST');
  
  ini_set('max_execution_time', 180);
  
  define('RUTA_FFMPEG', 'servidor\\');
  define('RUTA_AUDIOS', './audios/');
  define('NOMBRE_AUDIO_ENT', 'audio');
  define('TAMANO_MAX_AUDIO', 1572864);
  
  $TIPOS_AUDIO_ENT = array(
    'audio/x-wav' => '', 
    'application/ogg' => ''
  );
  
  $TIPOS_AUDIO_SAL = array(
    'mp3', 
    'ogg'
  );
```

En los headers debemos especificar los dominios que podrán utilizar el script, en nuestro caso podemos dejar 'http://localhost' (sin comillas) si queremos que solo sea accesible por el servidor local.

Luego en las constantes definidas tenemos:

1. RUTA_FFMPEG: Si tenemos el programa reconocido de forma global, entonces podemos dejarlo como una cadena vacía, de lo contrario debemos especificar la ruta hacia el programa (solo el directorio) de forma global o relativa. Recuerda que el repositorio brinda una copia del programa para Windows.
2. RUTA_AUDIOS: Es la ruta global o relativa hacia nuestro directorio de audios de voice chat (recuerda: htdocs/club-del-bosque/audios/).

El resto puedes dejarlo a tu criterio, cabe mencionar que los archivos de audio se guardarán en el directorio "audios", y en su defecto cada ID deberá tener por lo menos un archivo de tipo .mp3 y otro de tipo .ogg.

Luego abrímos el archivo js/class.Chat.js y nos enfocamos en:

```javascript
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
```

En dónde SERVIDOR es el dominio y puerto que debemos especificar para nuestro chat, nótese que el resto de la configuración es similar a la del servidor, se recomienda tener a ambos iguales.

Lo último que debemos hacer es configurar el chat de voz, para ello abrímos el archivo js/class.Microfono.js (en la misma carpeta), y tenemos:

```javascript
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
```

En dónde:

1. URL_AUDIOS: Determina la ruta de los archivos de audio del voice chat, puede ser un path absoluto (http://localhost/club-del-bosque/audios/) o un path relativo como se muestra en el ejemplo.
2. SCRIPT_DESTINO: Determina la ruta hacia el script que deberá guardar el archivo de audio en la carpeta de "audios", en nuestro caso es guardar-audio.php.

Corriendo el chat
-----------------

¡Bingo! ya tenemos nuestro chat instalado, por último debemos dirigirnos a nuestro directorio "servidor" y ejecutar el archivo main.js, para ello dispones del archivo correr.bat (si estás en Windows), de lo contrario abre una nueva sesión en la terminal con el siguiente comando:

```
node main.js
```

¡Y listo, para ingresar nos dirigímos a nuestra dirección web http://localhost/club-del-bosque/!

Notas
-----

1. Los archivos html, php, y css figuran para la interfaz de usuario que implementa las clases del código cliente (principalmente index.html), yo brindo la intefaz de mi sitio, solo te pido que por favor no la clones, trata de crear la tuya propia basándote en dichos archivos y tus necesidades.

2. Debo admitir que configurar el chat puede ser algo tedioso y me disculpo por ello, sin embargo trato de ser lo más explícito en la documentación para que así la instalación pueda lograrse exitosamente, si tienes alguna duda no dudes en contactarme :)
