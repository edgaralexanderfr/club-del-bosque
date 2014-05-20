/**
 * Copyright 2014 - Edgar Alexander Franco
 *
 * @author Edgar Alexander Franco
 * @version 1.7.1
 */

/**
 * Retorna la fecha actual con un formato específico.
 *
 * @return {string}
 */
exports.getFechaActual = function () {
  var fechaActual = new Date();
  var dia = fechaActual.getDate();
  var mes = fechaActual.getMonth() + 1;
  var ano = fechaActual.getFullYear();
  var hora = fechaActual.getHours();
  var minutos = fechaActual.getMinutes();
  var ampm = (hora >= 12) ? 'pm.' : 'am.' ;
  
  if (hora > 12) {
    hora -= 12;
  } else 
  if (hora == 0) {
    hora = 12;
  }
  
  if (dia < 10) {
    dia = '0' + dia;
  }
  
  if (mes < 10) {
    mes = '0' + mes;
  }
  
  if (hora < 10) {
    hora = '0' + hora;
  }
  
  if (minutos < 10) {
    minutos = '0' + minutos;
  }
  
  return dia + '/' + mes + '/' + ano + ' ' + hora + ':' + minutos + ' ' + ampm;
}