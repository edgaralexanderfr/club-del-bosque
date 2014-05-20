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

Luego de haber descargado el repositorio separa el directorio servidor del resto y colócalo en un sitio aparte, preferiblemente en el escritorio o en directorio para tu comodidad, una vez aislado mueve el directorio club-del-bosque (sin el directorio "servidor"), a algún sitio accesible de tu servidor web en la carpeta "htdocs".

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
2. RUTA_AUDIOS: Ruta de los archivos de audio grabados por el voice chat, debemos apuntarlo hacia la ruta en nuestro servidor web (la carpeta htdocs/club-del-bosque/audios/).

Del resto, puedes configurar otras cosas a tu criterio, éstas son las más esenciales.
