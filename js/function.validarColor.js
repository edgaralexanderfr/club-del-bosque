/**
 * Copyright 2014 - Edgar Alexander Franco
 *
 * @author Edgar Alexander Franco
 * @version 1.7.1
 */

/**
 * Comprueba si la cadena es un color hexadecimal v�lido.
 *
 * @param {string} color Color a validar.
 *
 * @return {boolean}
 */
function validarColor (color) {
  return /^\#([0-9a-fA-F]{6})$/g.test(color);
}