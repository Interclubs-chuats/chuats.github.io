
/*
 * Gilles 05/2023
 * sert à naviguer dans le svg généré par topocalc'R
 *
 * biblio :
 *
 * DEPLACER :
 * https://www.petercollingridge.co.uk/tutorials/svg/interactive/dragging/
 * https://www.petercollingridge.co.uk/tutorials/svg/interactive/pan-and-zoom/
 * view-source:https://www.petercollingridge.co.uk/tutorials/svg/interactive/pan-and-zoom/
 *
 * ZOOM :
 * boutons + et - :  https://www.petercollingridge.co.uk/tutorials/svg/interactive/dragging/
 * 2 doigts smartphone : https://developer.mozilla.org/fr/docs/Web/API/Pointer_events/Pinch_zoom_gestures
 *
 * VIEWPORT (fenêtre) et VIEWBOX (télescope) :
 * https://webdesign.tutsplus.com/fr/tutorials/svg-viewport-and-viewbox-for-beginners--cms-30844
 * https://svground.fr//viewbox-et-ratio.php#zdd
 * https://stackoverflow.com/questions/45762516/how-to-keep-viewbox-centered-when-zooming-in-svgs
 * Gilles : le viewbox, c'est une fenêtre sur le svg :
 * viewbox(400 600 200 200) signifie qu'on regarde uniquement une portion du svg
 * à travers une fenêtre de 200 x 200m qui occupe tout l'écran,
 * et qu'on se place à 400m sur les X et 600m sur les Y
 * par rapport au bord supérieur gauche du svg total
 */

var transformMatrix = [1, 0, 0, 1, 0, 0];

function addSvgNavigation(svg) {
  var viewbox = svg.getAttributeNS(null, "viewBox").split(" ");
  var initX = parseFloat(viewbox[0]);
  var initY = parseFloat(viewbox[1]);
  var centerX = parseFloat(viewbox[2]) / 2;
  var centerY = parseFloat(viewbox[3]) / 2;

  var matrixGroup = svg.getElementById("viewport");

  // donne la position de la souris dans les coordonnées du SVG
  function get_position_souris_dans_SVG(evt)
  {
    var CTM = svg.getScreenCTM();
    if (evt.touches)
    {
      evt = evt.touches[0]; // pour ne garder qu'un seul doigt sur smartphone
    }
    // Gilles : les deux derniers paramètres du viewbox = screen,
    // auquel on rajoute placement initial de la fenêtre dans le svg
    return {
      x: initX + (evt.clientX - CTM.e) / CTM.a,
      y: initY + (evt.clientY - CTM.f) / CTM.d
    };
  }


  /***************************** DEPLACER *******************************/

  var selectedElement = false;
  var anciennes_coord;

  // événements souris
  svg.addEventListener('mousedown', sur_appui_bouton);
  svg.addEventListener('mousemove', sur_deplacement_souris);
  svg.addEventListener('mouseup', sur_relachement_bouton);
  svg.addEventListener('mouseleave', sur_relachement_bouton);

  // événements smartphone
  svg.addEventListener('touchstart', sur_appui_bouton);
  svg.addEventListener('touchmove', sur_deplacement_souris);
  svg.addEventListener('touchend', sur_relachement_bouton);
  svg.addEventListener('touchleave', sur_relachement_bouton);
  svg.addEventListener('touchcancel', sur_relachement_bouton);

  function deplacer(dx, dy)
  {
    transformMatrix[4] += dx;
    transformMatrix[5] += dy;
    var newMatrix = "matrix(" + transformMatrix.join(' ') + ")";
    matrixGroup.setAttributeNS(null, "transform", newMatrix);
  }

  function sur_appui_bouton(evt)
  {
    selectedElement = evt.target;
    anciennes_coord = get_position_souris_dans_SVG(evt);
  }

  function sur_deplacement_souris(evt)
  {
    if (selectedElement)
    {
      evt.preventDefault();
      var current_coord = get_position_souris_dans_SVG(evt);
      deplacer(current_coord.x - anciennes_coord.x, current_coord.y - anciennes_coord.y);
      anciennes_coord.x = current_coord.x;
      anciennes_coord.y = current_coord.y;
    }
  }

  function sur_relachement_bouton(evt)
  {
    selectedElement = null;
  }


  /*********************************** ZOOM ******************************/

  // la molette de la souris pour le zoom sur PC
  if (navigator.userAgent.toLowerCase().indexOf('webkit') >= 0)
    svg.addEventListener('mousewheel', sur_zoom, false); // Chrome/Safari
  else
    svg.addEventListener('DOMMouseScroll', sur_zoom, false); // Others

  // ou bien les boutons + et -
  button_plus.addEventListener("click", function ()  { zoomIn();  }); // zoom(1.25);
  button_moins.addEventListener("click", function () { zoomOut(); }); // zoom(0.8);

  // ou bien les deux doigts sur tactile... TODO !

  function sur_zoom(evt)
  {
    var delta = 0;
    if (evt.preventDefault) { evt.preventDefault(); }
    evt.returnValue = false;

    // voir https://adom.as/javascript-mouse-wheel/
    if (!event) { event = window.event; }                   // IE
    if (evt.wheelDelta) { delta = evt.wheelDelta / 120; }   // IE, Opera, Chrome, Safari
    else if (event.detail) { delta = -evt.detail / 3; }     // Mozilla
    // Voilà, ici notre delta vaut 1 à chaque incrément de molette.

    if (delta > 0) { zoomIn();  } // zoom(1.25);
    if (delta < 0) { zoomOut(); } // zoom(0.8);
  }

  var viewBox = svg.viewBox.baseVal;

  // voir https://itnext.io/javascript-zoom-like-in-maps-for-svg-html-89c0df016d8d
  function zoomIn()
  {
    viewBox.x = viewBox.x + viewBox.width / 4;
    viewBox.y = viewBox.y + viewBox.height / 4;
    viewBox.width = viewBox.width / 2;
    viewBox.height = viewBox.height / 2;
  }

  function zoomOut()
  {
    //          centre    -  moitié de la largeur
    viewBox.x = viewBox.x - viewBox.width / 2;
    viewBox.y = viewBox.y - viewBox.height / 2;
    viewBox.width = viewBox.width * 2;
    viewBox.height = viewBox.height * 2;
  }
}

window.addSvgNavigation = addSvgNavigation;

