/**
 * Copyright 2014 - Edgar Alexander Franco
 *
 * @author Edgar Alexander Franco
 * @version 1.7.0
 */

/**
 * Excepci�n para el chat.
 *
 * @param {string} mensaje Mensaje de error.
 * @param {number} codigo C�digo de error.
 */
exports.ChatException = function (mensaje, codigo) {
  this.mensaje = mensaje;
  this.codigo = codigo;
}