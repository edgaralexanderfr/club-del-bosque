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
  
  try {
    if (!isset($_FILES[ NOMBRE_AUDIO_ENT ])) {
      throw new Exception('No se ha subido un archivo.', 1);
    }
    
    $audio = $_FILES[ NOMBRE_AUDIO_ENT ];
    
    if ($audio['error'] != UPLOAD_ERR_OK) {
      throw new Exception('Ha ocurrido un error durante la subida.', 2);
    }
    
    $tmp = $audio['tmp_name'];
    
    if (!isset($TIPOS_AUDIO_ENT[ @mime_content_type($tmp) ])) {
      throw new Exception('Tipo de audio no válido.', 3);
    }
    
    if (@filesize($tmp) > TAMANO_MAX_AUDIO) {
      throw new Exception('Audio muy grande.', 4);
    }
    
    $id = md5(((string) time()) . ((string) rand(100, 999)));
    $ruta = RUTA_AUDIOS . $id;
    $formatos = '';
    
    foreach ($TIPOS_AUDIO_SAL as $formato) {
      $formatos .= ' -f ' . $formato . ' "' . $ruta . '.' . $formato . '"';
    }
    
    @exec('"' . RUTA_FFMPEG . 'ffmpeg" -i "' . $tmp . '"' . $formatos, $salida, $codigo);
    
    if ($codigo != 0) {
      throw new Exception('No se pudo procesar el audio.', 5);
    }
    
    echo json_encode(array(
      'codigo' => 0, 
      'id' => $id
    ));
  } catch (Exception $ex1) {
    echo json_encode(array(
      'mensaje' => utf8_encode($ex1->getMessage()), 
      'codigo' => 1
    ));
  }