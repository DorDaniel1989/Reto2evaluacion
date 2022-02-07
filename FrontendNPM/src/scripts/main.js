import { get } from 'jquery';
import L from 'leaflet';

var map = L.map('map').
  setView([42.89737768694974, -2.2058275610106755],
    8);

L.tileLayer('http://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
  attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, <a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="http://cloudmade.com">CloudMade</a>',
  maxZoom: 18
}).addTo(map);
L.control.scale().addTo(map);

const URL = "http://10.10.17.126/apiTiempo/";
//const URL = "http://192.168.1.60/apiTiempo/"
//**************************************************************** */

$(".draggable").draggable({
  revert: true,
  revertDuration: 300
});

//FONDO PARALLAX
$(window).scroll(function () {
  var barra = $(window).scrollTop();
  var posicion = (barra * 0.06);
  $('body').css({
    'background-position': '0 -' + posicion + 'px'
  });

});
//CAMBIAR TEXTO DE OCULTAR A MOSTRAR MAPA!!!!!!!!!!!!!!!!!!
$("#ocultar").click(function () {
  $("#map").toggle(function () {
    $("#ocultar")
  });
});

$(`#botonLogin`).click(function () {

  var user = $(`#usr`).val();
  var pass = $(`#pass`).val();
  console.log("user :" + user + " pass:" + pass)
  loguear(user, pass)

});

$(`#botonRegistrar`).click(function () {
  registrarUsuario();

});

$(`#registrarse`).click(function () {
  $(`.container2`).fadeIn("5000").css("display", "flex");
  $(`.container3`).fadeOut("5000")
  console.log("clikkkkk")
});

$(`#cerrarFormulario`).click(function () {
  $(`.container2`).fadeOut("10000").css("display", "flex");
  console.log("clikkkkk")
});

$(`#one`).click(function () {
  console.log("holaaa")
  openform()
});

$(`#closeForm`).click(function () {
  console.log("adiosss")
  closeform()
});

function openform() {
  document.getElementById("tab").style.display = "flex";
  document.getElementById("one").style.display = "none";
}
function closeform() {
  document.getElementById("tab").style.display = "none";
  document.getElementById("one").style.display = "block";
}

activarReloj()

//Leyendo datos de la WebApiTiempo
//**************************************************************** */
//

var token;

fetch(`${URL}Users/authenticate`, {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    "username": 'shandyss',
    "password": '1234'
  })
}).then(response => response.json())
  .then(validacion => {
    console.log(validacion.token)
    token = validacion.token;
  })


fetch(`${URL}TiempoItems`)
  .then(response => response.json())
  .then(registrosTiempo => {

    //Objeto para guardar la configuracion del usuario
    var configUser = [];
    //Genero el contenido de la etiqueta select
    for (let i = 0; i < registrosTiempo.length; i++) {
      document.getElementById('opcionLocalidad').innerHTML += `<option value="${registrosTiempo[i].municipio}">${registrosTiempo[i].municipio}</option>`;
    }
    var numeroMaximoOpciones = { cantidad: 0 }
    localStorage.setItem('numeroMaximoOpciones', JSON.stringify(numeroMaximoOpciones));

    //Si es la primera vez que entramos a la Web
    if (localStorage.getItem('configUser') == null) {

      console.log("localstorage vacio, asique lo hemos rellenado")
      localStorage.setItem('configUser', JSON.stringify(configUser));

      var aCiudadesInicio = ["donostia", "bilbao", "orio", "gasteiz"]
      for (let i = 0; i < aCiudadesInicio.length; i++) {
        getFichaDesdeApi(aCiudadesInicio[i]);
      }

      //Si tenenos guardada una configuracion en localStorage
    } else {

      //recuperarDatosDeLocalStorage()

    }
  });


function registrarUsuario() {

  var nombre = $(`#fNameInput`).val()
  var apellido = $(`#lNameInput`).val()
  var username = $(`#userInput`).val()
  var rol = $(`#roleInput`).val()
  var pass = $(`#passInput`).val()

  var user = {
    "firstName": nombre,
    "lastName": apellido,
    "username": username,
    "role": rol,
    "password": pass
  }

  let headers = new Headers();
  headers.append('Content-Type', 'application/json');
  headers.append('Access-Control-Allow-Credentials', 'true');
  console.log(JSON.stringify(user))

  fetch(`${URL}Users`, {
    method: 'POST',
    headers: headers,
    body: JSON.stringify(user)
  })
}

function loguear(user, pass) {
  let headersL = new Headers();
  headersL.append('Content-Type', 'application/json');

  headersL.append('Access-Control-Allow-Credentials', 'true');

  fetch(`${URL}Users/authenticate`, {
    method: 'POST',
    headers: headersL,
    body: JSON.stringify({
      "username": user,
      "password": pass
    })
  })
    .then(response => response.json())
    .then(validacion => {

      token = validacion.token;
      if (token.length > 30) {
        $('.loginOculto').css("display", "none")
        recuperarDatosDeLocalStorage()
      }

      return false;
    })

}

function recuperarDatosDeLocalStorage() {

  let localS = JSON.parse(localStorage.getItem('configUser'));

  for (let i = 0; i < localS.length; i++) {
    fetch(`${URL}TiempoItems/${localS[i].municipio}`, {
      headers: {
        'Content-Type': 'application/json'
      }
    })
      .then(response => response.json())
      .then(registroTiempo => {
        console.table(registroTiempo)
        crearFicha(registroTiempo)
      })
  }

  for (let item in localS) {
    for (const parametro in localS[item].opciones) {
      console.log("Opcion " + localS[item].opciones[`${parametro}`])
      if (localS[item].opciones[`${parametro}`]) {
        console.log("match recuperar datos ls")
        localS[item].opciones[`${parametro}`]=false;    //FIX
        //imprimirParametroLS(localS[item].municipio, parametro)   //VA MAL
        localStorage.setItem(`configUser`, JSON.stringify(localS))
      }
    }
  }
}
//NO FUNCIONA CORRECTAMENTE, NI IDEA DE QUE ESTA PASANDO
function imprimirParametroLS(municipio, parametro) {
  let localS = JSON.parse(localStorage.getItem('configUser'));
  let indice = 0;

  for (let i = 0; i < localS.length; i++)
    if (municipio == localS[i].municipio) {
      indice = i;
      console.log("match en el localStorage")
    }
  console.log(parametro)
  console.log(municipio)
  console.log(localS[indice].precipitacionAcumulada)
  console.log(localS[indice].velocidadViento)
  console.log(localS[indice].humedad)
  console.log(localS[indice].tempMax)
  console.log(localS[indice].tempMedia)
  console.log(localS[indice].tempMin)


  switch (parametro) {
    case "precipitacion": {
      console.log("entra al case precipitacion")
      $('#panel').find(`#${municipio}`).find(`#ul_${municipio}`).append(`<li class="list-group-item borrable" id="prec_${municipio}"><img class="icono" src="drop32.fe545c84.png" alt=>${localS[indice].precipitacionAcumulada} ml <div class="borrarInfo">X</div></li>`);
      console.log("sale del case precipitacion")
      break;
    }
    case "viento": {
      console.log("entra al case viento ")
      $(`#ul_${municipio}`).append(`<li class="list-group-item borrable" id="vien_${municipio}"><img class="icono" src="wind32.f6a10780.png" alt=>${localS[indice].velocidadViento} Km/h <div class="borrarInfo">X</div></li>`);
      console.log("sale al case viento ")
      break;
    }
    case "humedad": {
      console.log("entra al case humedad")
      $(`#ul_${municipio}`).append(`<li class="list-group-item borrable" id="hume_${municipio}"><img class="icono" src="humedad32.8950c319.png" alt=>${localS[indice].humedad}  <div class="borrarInfo">X</div></li>`);
      console.log("entra al case humendad ")
      break;
    }
    case "tempMax": {
      console.log("entra al case tempMax ")
      $(`#ul_${municipio}`).append(`<li class="list-group-item borrable" id="tmax_${municipio}"><img class="icono" src="temperatura-alta32.fe483ef0.png" alt=>${localS[indice].tempMax}  <div class="borrarInfo">X</div></li>`);
      console.log("entra al case tempMax ")
      break;
    }
    case "tempMin": {
      console.log("entra al case tempMin")
      $(`#ul_${municipio}`).append(`<li class="list-group-item borrable" id="tmin_${municipio}"><img class="icono" src="frio32.b308c914.png" alt=>${localS[indice].tempMin}  <div class="borrarInfo">X</div></li>`);
      console.log("entra al case tempMin ")
      break;
    }
    case "tempMedia": {
      console.log("entra al case tempMedia")
      $(`#ul_${municipio}`).append(`<li class="list-group-item borrable" id="tmed_${municipio}"><img class="icono" src="tempMedia64.217a9864.png" alt=>${localS[indice].tempMedia.substring(0, 3)} <div class="borrarInfo">X</div></li>`);
      console.log("entra al case tempMedia ")
      break;
    }

  }
  $(`.borrarInfo`).click(function () {
    console.log("Evento borrar info activado")
    let opt = $(this).parents()[0]
    let loc = $(this).parents()[2]
    console.log(opt.id.substring(0, 4) + "    " + loc.id)
    cambiarOpcionAFalse(opt.id.substring(0, 4), loc.id)
    $(this).parent().remove()
    //Borrar markador y cambiar a false el local storage
  });

}



//Se conecta a la api al endpoint TiempoITem/id
function getFichaDesdeApi(nombreMunicipio) {

  if (ElMunicipioExisteLocalStorage(nombreMunicipio)) {
    console.log("GetFichaDesdeApi => Este municipio ya existe")
    return;
  }

  fetch(`${URL}TiempoItems/${nombreMunicipio}`, {
    headers: {
      'Content-Type': 'application/json'
      //'Authentication': `Bearer ${token}`,
    }
  })
    .then(response => response.json())
    .then(registroTiempo => {
      console.table(registroTiempo)
      crearFicha(registroTiempo)
    })
}

//Crear fichas a partir del municipio seleccionado
document.getElementById('añadir').addEventListener('click', recogerValorSelect);

function recogerValorSelect() {
  let ls = JSON.parse(localStorage.getItem('configUser'));
  if (ls.length == 4) {
    console.log(" maximo de municipios alcanzado, no se pueden guardar mas")
    return;
  }
  var opcion = $("#opcionLocalidad").val();
  if (ElMunicipioExisteLocalStorage(opcion)) {
    console.log(" Funcion GetITemLS =>  El municipio ya existe en LS")
    return;
  }

  getFichaDesdeApi(opcion);
}

function comprobarNumeroMaximoDeCartasLocalStorage() {

  var ObjectReturn = localStorage.getItem('numeroMaximoOpciones');
  ObjectReturn = JSON.parse(ObjectReturn)
  var cantidad = ObjectReturn.cantidad

  if (cantidad == 4) {
    console.log("Numero maximo de cartas alcanzado")
    return false;
  }
  else {
    let numeroMaximoOpciones = { cantidad: `${parseInt(cantidad) + 1}` }
    console.log(numeroMaximoOpciones)
    localStorage.setItem('numeroMaximoOpciones', JSON.stringify(numeroMaximoOpciones));
    return true;
  }
}

//Resta una unidad en el Local Storage
function restarCartaLocalStorage() {

  var ObjectReturn = localStorage.getItem('numeroMaximoOpciones');
  ObjectReturn = JSON.parse(ObjectReturn);
  var cantidad = ObjectReturn.cantidad;
  let numeroMaximoOpciones = { cantidad: `${parseInt(cantidad) - 1}` };
  console.log(numeroMaximoOpciones);
  localStorage.setItem('numeroMaximoOpciones', JSON.stringify(numeroMaximoOpciones));

}
//Crea una plantilla para la ficha
function stringHtmlFicha(objetoJSON) {
  let htmlFicha = `<div class="card  " id="${objetoJSON.municipio}" >
  <div class="card-body"> 
      <h5 class="card-title">${(objetoJSON.municipio).toUpperCase()}</h5><div class="borrarCartas">X</div>
      
  </div>
  <ul class="list-group list-group-flush droppable" id="ul_${objetoJSON.municipio}">
      <li class="list-group-item temp"><div class="numTemp">${objetoJSON.temperatura}</div> <div class="grados" ></div><div class="termometro" ></div> </li>
      <li class="list-group-item">${objetoJSON.descripcion}</li>
      <li class="list-group-item"> <img class="imgTiempo" src="https://opendata.euskadi.eus/${objetoJSON.pathImg}" alt=""></li>
  </ul>
    </div>`
  return htmlFicha;

}
//genera el registro en el localStorage
function crearObjetoFichaLocalStorage(oJSON) {

  let ls = JSON.parse(localStorage.getItem("configUser"))

  let infoMunicipio = {
    municipio: `${oJSON.municipio}`, temperatura: `${oJSON.temperatura}`, tempMax: `${oJSON.tempMax}`, tempMin: `${oJSON.tempMin}`, tempMedia: `${oJSON.tempMedia}`, humedad: `${oJSON.humedad}`, precipitacionAcumulada: `${oJSON.precipitacionAcumulada}`, velocidadViento: `${oJSON.velocidadViento}`, descripcion: `${oJSON.descripcion}`, fecha: `${oJSON.fecha}`, latitud: `${oJSON.latitud}`, longitud: `${oJSON.longitud}`,
    opciones: {
      precipitacion: false,
      humedad: false,
      viento: false,
      tempMax: false,
      tempMin: false,
      tempMedia: false
    }
  };

  ls.push(infoMunicipio);
  localStorage.setItem(`configUser`, JSON.stringify(ls))
  // localStorage.setItem(`${oJSON.municipio}`, JSON.stringify(infoMunicipio))

}

function crearFicha(objetoJson) {

  if (!comprobarNumeroMaximoDeCartasLocalStorage()) {
    console.log("no se puede insertar ese elementos");

  } else {

    let ficha = stringHtmlFicha(objetoJson);
    document.getElementById('panel').innerHTML += ficha;

    if (!ElMunicipioExisteLocalStorage(objetoJson.municipio))
      crearObjetoFichaLocalStorage(objetoJson)

    $(`.borrarCartas`).click(function () {
      $(this).parent().parent().remove();
      let idCarta = $(this).parent().parent()[0].id
      restarCartaLocalStorage();
      window.localstor = JSON.parse(localStorage.getItem('configUser'));

      //aqui hay que borrar EL OBJETO DE LA CARTA del local storage
      let objeto;
      let indice = 0;

      for (let i = 0; i < localstor.length; i++) {
        if (idCarta == localstor[i].municipio) {
          indice = i;
          console.log("match borrar cartas");
        }
      }
      localstor = JSON.stringify(localstor.filter(objeto => objeto.municipio != idCarta))
      localStorage.setItem('configUser', `${localstor}`)


      //En este loop busco el marcador que hay que eliminar, el markador tiene el id del municipio

      map.eachLayer(layer => {
        if (layer.options.Id === $(this).parent().parent()[0].id)
          layer.remove()
      })
    });

    //Asignamos la funcion al elemento droppable despues de crearlo en la funcion stringHtmlFicha()
    $(`.droppable`).droppable({
      drop: function (event, ui) {

        var idParametro = ui.draggable[0].id;
        let idCarta = $(this).parent().attr("id");
        console.log("comprobar id :" + idCarta)
        // var objetoLS = JSON.parse(localStorage.getItem(`${idCarta}`));
        let localS = JSON.parse(localStorage.getItem('configUser'));

        //Buscamos el indice donde se encuentra el municipio a tratar
        let indice = 0;

        for (let i = 0; i < localS.length; i++)
          if (idCarta == localS[i].municipio) {
            indice = i;
            console.log("match en el localStorage")

          }
        console.log("municipio " + localS[indice].municipio + "parametro" + idParametro)

        switch (idParametro) {
          case "precipitaciones": {
            if (!localS[indice].opciones.precipitacion) {
              $(this).append(`<li class="list-group-item borrable" id="prec_${idCarta}"><img class="icono" src="drop32.fe545c84.png" alt=>${localS[indice].precipitacionAcumulada} ml <div class="borrarInfo">X</div></li>`);
              localS[indice].opciones.precipitacion = true;
              localStorage.setItem(`configUser`, JSON.stringify(localS))
            }
            break;
          }
          case "velocidadViento": {
            if (!localS[indice].opciones.viento) {
              $(this).append(`<li class="list-group-item borrable" id="vien_${idCarta}"><img class="icono" src="wind32.f6a10780.png" alt=>${localS[indice].velocidadViento} Km/h <div class="borrarInfo">X</div></li>`);
              localS[indice].opciones.viento = true;
              localStorage.setItem(`configUser`, JSON.stringify(localS))
            }
            break;
          }
          case "humedad": {
            if (!localS[indice].opciones.humedad) {
              $(this).append(`<li class="list-group-item borrable" id="hume_${idCarta}"><img class="icono" src="humedad32.8950c319.png" alt=>${localS[indice].humedad}  <div class="borrarInfo">X</div></li>`);
              localS[indice].opciones.humedad = true;
              localStorage.setItem(`configUser`, JSON.stringify(localS))
            }
            break;
          }
          case "tempMax": {
            if (!localS[indice].opciones.tempMax) {
              $(this).append(`<li class="list-group-item borrable" id="tmax_${idCarta}"><img class="icono" src="temperatura-alta32.fe483ef0.png" alt=>${localS[indice].tempMax}  <div class="borrarInfo">X</div></li>`);
              localS[indice].opciones.tempMax = true;
              localStorage.setItem(`configUser`, JSON.stringify(localS))
            }
            break;
          }
          case "tempMin": {
            if (!localS[indice].opciones.tempMin) {
              $(this).append(`<li class="list-group-item borrable" id="tmin_${idCarta}"><img class="icono" src="frio32.b308c914.png" alt=>${localS[indice].tempMin}  <div class="borrarInfo">X</div></li>`);
              localS[indice].opciones.tempMin = true;
              localStorage.setItem(`configUser`, JSON.stringify(localS))
            }
            break;
          }
          case "tempMedia": {
            if (!localS[indice].opciones.tempMedia) {
              $(this).append(`<li class="list-group-item borrable" id="tmed_${idCarta}"><img class="icono" src="tempMedia64.217a9864.png" alt=>${localS[indice].tempMedia.substring(0, 3)} <div class="borrarInfo">X</div></li>`);
              localS[indice].opciones.tempMedia = true;
              localStorage.setItem(`configUser`, JSON.stringify(localS))
            }
            break;
          }
        }

        $(`.borrarInfo`).click(function () {
          console.log("Evento borrar info activado")

          let opt = $(this).parents()[0]
          let loc = $(this).parents()[2]
          console.log(opt.id.substring(0, 4) + "    " + loc.id)
          cambiarOpcionAFalse(opt.id.substring(0, 4), loc.id)
          $(this).parent().remove()

        });
      }
    });

    crearMarcador(objetoJson);

  }
}

function crearMarcador(objetoJSON) {

  try {
    let latitud = (objetoJSON.latitud).toString().replace(',', '.');
    let longitud = (objetoJSON.longitud).toString().replace(',', '.');
    const marker = new L.marker([parseFloat(latitud), parseFloat(longitud)], { Id: objetoJSON.municipio })

    marker.bindPopup(objetoJSON.municipio + " " + objetoJSON.municipio).addTo(map);
    //marker.layerId(objetoJson.municipio)
    //console.clear();
    var css = "text-shadow: -1px -1px hsl(0,100%,50%), 1px 1px hsl(5.4, 100%, 50%), 3px 2px hsl(10.8, 100%, 50%), 5px 3px hsl(16.2, 100%, 50%), 7px 4px hsl(21.6, 100%, 50%), 9px 5px hsl(27, 100%, 50%), 11px 6px hsl(32.4, 100%, 50%), 13px 7px hsl(37.8, 100%, 50%), 14px 8px hsl(43.2, 100%, 50%), 16px 9px hsl(48.6, 100%, 50%), 18px 10px hsl(54, 100%, 50%), 20px 11px hsl(59.4, 100%, 50%), 22px 12px hsl(64.8, 100%, 50%), 23px 13px hsl(70.2, 100%, 50%), 25px 14px hsl(75.6, 100%, 50%), 27px 15px hsl(81, 100%, 50%), 28px 16px hsl(86.4, 100%, 50%), 30px 17px hsl(91.8, 100%, 50%), 32px 18px hsl(97.2, 100%, 50%), 33px 19px hsl(102.6, 100%, 50%), 35px 20px hsl(108, 100%, 50%), 36px 21px hsl(113.4, 100%, 50%), 38px 22px hsl(118.8, 100%, 50%), 39px 23px hsl(124.2, 100%, 50%), 41px 24px hsl(129.6, 100%, 50%), 42px 25px hsl(135, 100%, 50%), 43px 26px hsl(140.4, 100%, 50%), 45px 27px hsl(145.8, 100%, 50%), 46px 28px hsl(151.2, 100%, 50%), 47px 29px hsl(156.6, 100%, 50%), 48px 30px hsl(162, 100%, 50%), 49px 31px hsl(167.4, 100%, 50%), 50px 32px hsl(172.8, 100%, 50%), 51px 33px hsl(178.2, 100%, 50%), 52px 34px hsl(183.6, 100%, 50%), 53px 35px hsl(189, 100%, 50%), 54px 36px hsl(194.4, 100%, 50%), 55px 37px hsl(199.8, 100%, 50%), 55px 38px hsl(205.2, 100%, 50%), 56px 39px hsl(210.6, 100%, 50%), 57px 40px hsl(216, 100%, 50%), 57px 41px hsl(221.4, 100%, 50%), 58px 42px hsl(226.8, 100%, 50%), 58px 43px hsl(232.2, 100%, 50%), 58px 44px hsl(237.6, 100%, 50%), 59px 45px hsl(243, 100%, 50%), 59px 46px hsl(248.4, 100%, 50%), 59px 47px hsl(253.8, 100%, 50%), 59px 48px hsl(259.2, 100%, 50%), 59px 49px hsl(264.6, 100%, 50%), 60px 50px hsl(270, 100%, 50%), 59px 51px hsl(275.4, 100%, 50%), 59px 52px hsl(280.8, 100%, 50%), 59px 53px hsl(286.2, 100%, 50%), 59px 54px hsl(291.6, 100%, 50%), 59px 55px hsl(297, 100%, 50%), 58px 56px hsl(302.4, 100%, 50%), 58px 57px hsl(307.8, 100%, 50%), 58px 58px hsl(313.2, 100%, 50%), 57px 59px hsl(318.6, 100%, 50%), 57px 60px hsl(324, 100%, 50%), 56px 61px hsl(329.4, 100%, 50%), 55px 62px hsl(334.8, 100%, 50%), 55px 63px hsl(340.2, 100%, 50%), 54px 64px hsl(345.6, 100%, 50%), 53px 65px hsl(351, 100%, 50%), 52px 66px hsl(356.4, 100%, 50%), 51px 67px hsl(361.8, 100%, 50%), 50px 68px hsl(367.2, 100%, 50%), 49px 69px hsl(372.6, 100%, 50%), 48px 70px hsl(378, 100%, 50%), 47px 71px hsl(383.4, 100%, 50%), 46px 72px hsl(388.8, 100%, 50%), 45px 73px hsl(394.2, 100%, 50%), 43px 74px hsl(399.6, 100%, 50%), 42px 75px hsl(405, 100%, 50%), 41px 76px hsl(410.4, 100%, 50%), 39px 77px hsl(415.8, 100%, 50%), 38px 78px hsl(421.2, 100%, 50%), 36px 79px hsl(426.6, 100%, 50%), 35px 80px hsl(432, 100%, 50%), 33px 81px hsl(437.4, 100%, 50%), 32px 82px hsl(442.8, 100%, 50%), 30px 83px hsl(448.2, 100%, 50%), 28px 84px hsl(453.6, 100%, 50%), 27px 85px hsl(459, 100%, 50%), 25px 86px hsl(464.4, 100%, 50%), 23px 87px hsl(469.8, 100%, 50%), 22px 88px hsl(475.2, 100%, 50%), 20px 89px hsl(480.6, 100%, 50%), 18px 90px hsl(486, 100%, 50%), 16px 91px hsl(491.4, 100%, 50%), 14px 92px hsl(496.8, 100%, 50%), 13px 93px hsl(502.2, 100%, 50%), 11px 94px hsl(507.6, 100%, 50%), 9px 95px hsl(513, 100%, 50%), 7px 96px hsl(518.4, 100%, 50%), 5px 97px hsl(523.8, 100%, 50%), 3px 98px hsl(529.2, 100%, 50%), 1px 99px hsl(534.6, 100%, 50%), 7px 100px hsl(540, 100%, 50%), -1px 101px hsl(545.4, 100%, 50%), -3px 102px hsl(550.8, 100%, 50%), -5px 103px hsl(556.2, 100%, 50%), -7px 104px hsl(561.6, 100%, 50%), -9px 105px hsl(567, 100%, 50%), -11px 106px hsl(572.4, 100%, 50%), -13px 107px hsl(577.8, 100%, 50%), -14px 108px hsl(583.2, 100%, 50%), -16px 109px hsl(588.6, 100%, 50%), -18px 110px hsl(594, 100%, 50%), -20px 111px hsl(599.4, 100%, 50%), -22px 112px hsl(604.8, 100%, 50%), -23px 113px hsl(610.2, 100%, 50%), -25px 114px hsl(615.6, 100%, 50%), -27px 115px hsl(621, 100%, 50%), -28px 116px hsl(626.4, 100%, 50%), -30px 117px hsl(631.8, 100%, 50%), -32px 118px hsl(637.2, 100%, 50%), -33px 119px hsl(642.6, 100%, 50%), -35px 120px hsl(648, 100%, 50%), -36px 121px hsl(653.4, 100%, 50%), -38px 122px hsl(658.8, 100%, 50%), -39px 123px hsl(664.2, 100%, 50%), -41px 124px hsl(669.6, 100%, 50%), -42px 125px hsl(675, 100%, 50%), -43px 126px hsl(680.4, 100%, 50%), -45px 127px hsl(685.8, 100%, 50%), -46px 128px hsl(691.2, 100%, 50%), -47px 129px hsl(696.6, 100%, 50%), -48px 130px hsl(702, 100%, 50%), -49px 131px hsl(707.4, 100%, 50%), -50px 132px hsl(712.8, 100%, 50%), -51px 133px hsl(718.2, 100%, 50%), -52px 134px hsl(723.6, 100%, 50%), -53px 135px hsl(729, 100%, 50%), -54px 136px hsl(734.4, 100%, 50%), -55px 137px hsl(739.8, 100%, 50%), -55px 138px hsl(745.2, 100%, 50%), -56px 139px hsl(750.6, 100%, 50%), -57px 140px hsl(756, 100%, 50%), -57px 141px hsl(761.4, 100%, 50%), -58px 142px hsl(766.8, 100%, 50%), -58px 143px hsl(772.2, 100%, 50%), -58px 144px hsl(777.6, 100%, 50%), -59px 145px hsl(783, 100%, 50%), -59px 146px hsl(788.4, 100%, 50%), -59px 147px hsl(793.8, 100%, 50%), -59px 148px hsl(799.2, 100%, 50%), -59px 149px hsl(804.6, 100%, 50%), -60px 150px hsl(810, 100%, 50%), -59px 151px hsl(815.4, 100%, 50%), -59px 152px hsl(820.8, 100%, 50%), -59px 153px hsl(826.2, 100%, 50%), -59px 154px hsl(831.6, 100%, 50%), -59px 155px hsl(837, 100%, 50%), -58px 156px hsl(842.4, 100%, 50%), -58px 157px hsl(847.8, 100%, 50%), -58px 158px hsl(853.2, 100%, 50%), -57px 159px hsl(858.6, 100%, 50%), -57px 160px hsl(864, 100%, 50%), -56px 161px hsl(869.4, 100%, 50%), -55px 162px hsl(874.8, 100%, 50%), -55px 163px hsl(880.2, 100%, 50%), -54px 164px hsl(885.6, 100%, 50%), -53px 165px hsl(891, 100%, 50%), -52px 166px hsl(896.4, 100%, 50%), -51px 167px hsl(901.8, 100%, 50%), -50px 168px hsl(907.2, 100%, 50%), -49px 169px hsl(912.6, 100%, 50%), -48px 170px hsl(918, 100%, 50%), -47px 171px hsl(923.4, 100%, 50%), -46px 172px hsl(928.8, 100%, 50%), -45px 173px hsl(934.2, 100%, 50%), -43px 174px hsl(939.6, 100%, 50%), -42px 175px hsl(945, 100%, 50%), -41px 176px hsl(950.4, 100%, 50%), -39px 177px hsl(955.8, 100%, 50%), -38px 178px hsl(961.2, 100%, 50%), -36px 179px hsl(966.6, 100%, 50%), -35px 180px hsl(972, 100%, 50%), -33px 181px hsl(977.4, 100%, 50%), -32px 182px hsl(982.8, 100%, 50%), -30px 183px hsl(988.2, 100%, 50%), -28px 184px hsl(993.6, 100%, 50%), -27px 185px hsl(999, 100%, 50%), -25px 186px hsl(1004.4, 100%, 50%), -23px 187px hsl(1009.8, 100%, 50%), -22px 188px hsl(1015.2, 100%, 50%), -20px 189px hsl(1020.6, 100%, 50%), -18px 190px hsl(1026, 100%, 50%), -16px 191px hsl(1031.4, 100%, 50%), -14px 192px hsl(1036.8, 100%, 50%), -13px 193px hsl(1042.2, 100%, 50%), -11px 194px hsl(1047.6, 100%, 50%), -9px 195px hsl(1053, 100%, 50%), -7px 196px hsl(1058.4, 100%, 50%), -5px 197px hsl(1063.8, 100%, 50%), -3px 198px hsl(1069.2, 100%, 50%), -1px 199px hsl(1074.6, 100%, 50%), -1px 200px hsl(1080, 100%, 50%), 1px 201px hsl(1085.4, 100%, 50%), 3px 202px hsl(1090.8, 100%, 50%), 5px 203px hsl(1096.2, 100%, 50%), 7px 204px hsl(1101.6, 100%, 50%), 9px 205px hsl(1107, 100%, 50%), 11px 206px hsl(1112.4, 100%, 50%), 13px 207px hsl(1117.8, 100%, 50%), 14px 208px hsl(1123.2, 100%, 50%), 16px 209px hsl(1128.6, 100%, 50%), 18px 210px hsl(1134, 100%, 50%), 20px 211px hsl(1139.4, 100%, 50%), 22px 212px hsl(1144.8, 100%, 50%), 23px 213px hsl(1150.2, 100%, 50%), 25px 214px hsl(1155.6, 100%, 50%), 27px 215px hsl(1161, 100%, 50%), 28px 216px hsl(1166.4, 100%, 50%), 30px 217px hsl(1171.8, 100%, 50%), 32px 218px hsl(1177.2, 100%, 50%), 33px 219px hsl(1182.6, 100%, 50%), 35px 220px hsl(1188, 100%, 50%), 36px 221px hsl(1193.4, 100%, 50%), 38px 222px hsl(1198.8, 100%, 50%), 39px 223px hsl(1204.2, 100%, 50%), 41px 224px hsl(1209.6, 100%, 50%), 42px 225px hsl(1215, 100%, 50%), 43px 226px hsl(1220.4, 100%, 50%), 45px 227px hsl(1225.8, 100%, 50%), 46px 228px hsl(1231.2, 100%, 50%), 47px 229px hsl(1236.6, 100%, 50%), 48px 230px hsl(1242, 100%, 50%), 49px 231px hsl(1247.4, 100%, 50%), 50px 232px hsl(1252.8, 100%, 50%), 51px 233px hsl(1258.2, 100%, 50%), 52px 234px hsl(1263.6, 100%, 50%), 53px 235px hsl(1269, 100%, 50%), 54px 236px hsl(1274.4, 100%, 50%), 55px 237px hsl(1279.8, 100%, 50%), 55px 238px hsl(1285.2, 100%, 50%), 56px 239px hsl(1290.6, 100%, 50%), 57px 240px hsl(1296, 100%, 50%), 57px 241px hsl(1301.4, 100%, 50%), 58px 242px hsl(1306.8, 100%, 50%), 58px 243px hsl(1312.2, 100%, 50%), 58px 244px hsl(1317.6, 100%, 50%), 59px 245px hsl(1323, 100%, 50%), 59px 246px hsl(1328.4, 100%, 50%), 59px 247px hsl(1333.8, 100%, 50%), 59px 248px hsl(1339.2, 100%, 50%), 59px 249px hsl(1344.6, 100%, 50%), 60px 250px hsl(1350, 100%, 50%), 59px 251px hsl(1355.4, 100%, 50%), 59px 252px hsl(1360.8, 100%, 50%), 59px 253px hsl(1366.2, 100%, 50%), 59px 254px hsl(1371.6, 100%, 50%), 59px 255px hsl(1377, 100%, 50%), 58px 256px hsl(1382.4, 100%, 50%), 58px 257px hsl(1387.8, 100%, 50%), 58px 258px hsl(1393.2, 100%, 50%), 57px 259px hsl(1398.6, 100%, 50%), 57px 260px hsl(1404, 100%, 50%), 56px 261px hsl(1409.4, 100%, 50%), 55px 262px hsl(1414.8, 100%, 50%), 55px 263px hsl(1420.2, 100%, 50%), 54px 264px hsl(1425.6, 100%, 50%), 53px 265px hsl(1431, 100%, 50%), 52px 266px hsl(1436.4, 100%, 50%), 51px 267px hsl(1441.8, 100%, 50%), 50px 268px hsl(1447.2, 100%, 50%), 49px 269px hsl(1452.6, 100%, 50%), 48px 270px hsl(1458, 100%, 50%), 47px 271px hsl(1463.4, 100%, 50%), 46px 272px hsl(1468.8, 100%, 50%), 45px 273px hsl(1474.2, 100%, 50%), 43px 274px hsl(1479.6, 100%, 50%), 42px 275px hsl(1485, 100%, 50%), 41px 276px hsl(1490.4, 100%, 50%), 39px 277px hsl(1495.8, 100%, 50%), 38px 278px hsl(1501.2, 100%, 50%), 36px 279px hsl(1506.6, 100%, 50%), 35px 280px hsl(1512, 100%, 50%), 33px 281px hsl(1517.4, 100%, 50%), 32px 282px hsl(1522.8, 100%, 50%), 30px 283px hsl(1528.2, 100%, 50%), 28px 284px hsl(1533.6, 100%, 50%), 27px 285px hsl(1539, 100%, 50%), 25px 286px hsl(1544.4, 100%, 50%), 23px 287px hsl(1549.8, 100%, 50%), 22px 288px hsl(1555.2, 100%, 50%), 20px 289px hsl(1560.6, 100%, 50%), 18px 290px hsl(1566, 100%, 50%), 16px 291px hsl(1571.4, 100%, 50%), 14px 292px hsl(1576.8, 100%, 50%), 13px 293px hsl(1582.2, 100%, 50%), 11px 294px hsl(1587.6, 100%, 50%), 9px 295px hsl(1593, 100%, 50%), 7px 296px hsl(1598.4, 100%, 50%), 5px 297px hsl(1603.8, 100%, 50%), 3px 298px hsl(1609.2, 100%, 50%), 1px 299px hsl(1614.6, 100%, 50%), 2px 300px hsl(1620, 100%, 50%), -1px 301px hsl(1625.4, 100%, 50%), -3px 302px hsl(1630.8, 100%, 50%), -5px 303px hsl(1636.2, 100%, 50%), -7px 304px hsl(1641.6, 100%, 50%), -9px 305px hsl(1647, 100%, 50%), -11px 306px hsl(1652.4, 100%, 50%), -13px 307px hsl(1657.8, 100%, 50%), -14px 308px hsl(1663.2, 100%, 50%), -16px 309px hsl(1668.6, 100%, 50%), -18px 310px hsl(1674, 100%, 50%), -20px 311px hsl(1679.4, 100%, 50%), -22px 312px hsl(1684.8, 100%, 50%), -23px 313px hsl(1690.2, 100%, 50%), -25px 314px hsl(1695.6, 100%, 50%), -27px 315px hsl(1701, 100%, 50%), -28px 316px hsl(1706.4, 100%, 50%), -30px 317px hsl(1711.8, 100%, 50%), -32px 318px hsl(1717.2, 100%, 50%), -33px 319px hsl(1722.6, 100%, 50%), -35px 320px hsl(1728, 100%, 50%), -36px 321px hsl(1733.4, 100%, 50%), -38px 322px hsl(1738.8, 100%, 50%), -39px 323px hsl(1744.2, 100%, 50%), -41px 324px hsl(1749.6, 100%, 50%), -42px 325px hsl(1755, 100%, 50%), -43px 326px hsl(1760.4, 100%, 50%), -45px 327px hsl(1765.8, 100%, 50%), -46px 328px hsl(1771.2, 100%, 50%), -47px 329px hsl(1776.6, 100%, 50%), -48px 330px hsl(1782, 100%, 50%), -49px 331px hsl(1787.4, 100%, 50%), -50px 332px hsl(1792.8, 100%, 50%), -51px 333px hsl(1798.2, 100%, 50%), -52px 334px hsl(1803.6, 100%, 50%), -53px 335px hsl(1809, 100%, 50%), -54px 336px hsl(1814.4, 100%, 50%), -55px 337px hsl(1819.8, 100%, 50%), -55px 338px hsl(1825.2, 100%, 50%), -56px 339px hsl(1830.6, 100%, 50%), -57px 340px hsl(1836, 100%, 50%), -57px 341px hsl(1841.4, 100%, 50%), -58px 342px hsl(1846.8, 100%, 50%), -58px 343px hsl(1852.2, 100%, 50%), -58px 344px hsl(1857.6, 100%, 50%), -59px 345px hsl(1863, 100%, 50%), -59px 346px hsl(1868.4, 100%, 50%), -59px 347px hsl(1873.8, 100%, 50%), -59px 348px hsl(1879.2, 100%, 50%), -59px 349px hsl(1884.6, 100%, 50%), -60px 350px hsl(1890, 100%, 50%), -59px 351px hsl(1895.4, 100%, 50%), -59px 352px hsl(1900.8, 100%, 50%), -59px 353px hsl(1906.2, 100%, 50%), -59px 354px hsl(1911.6, 100%, 50%), -59px 355px hsl(1917, 100%, 50%), -58px 356px hsl(1922.4, 100%, 50%), -58px 357px hsl(1927.8, 100%, 50%), -58px 358px hsl(1933.2, 100%, 50%), -57px 359px hsl(1938.6, 100%, 50%), -57px 360px hsl(1944, 100%, 50%), -56px 361px hsl(1949.4, 100%, 50%), -55px 362px hsl(1954.8, 100%, 50%), -55px 363px hsl(1960.2, 100%, 50%), -54px 364px hsl(1965.6, 100%, 50%), -53px 365px hsl(1971, 100%, 50%), -52px 366px hsl(1976.4, 100%, 50%), -51px 367px hsl(1981.8, 100%, 50%), -50px 368px hsl(1987.2, 100%, 50%), -49px 369px hsl(1992.6, 100%, 50%), -48px 370px hsl(1998, 100%, 50%), -47px 371px hsl(2003.4, 100%, 50%), -46px 372px hsl(2008.8, 100%, 50%), -45px 373px hsl(2014.2, 100%, 50%), -43px 374px hsl(2019.6, 100%, 50%), -42px 375px hsl(2025, 100%, 50%), -41px 376px hsl(2030.4, 100%, 50%), -39px 377px hsl(2035.8, 100%, 50%), -38px 378px hsl(2041.2, 100%, 50%), -36px 379px hsl(2046.6, 100%, 50%), -35px 380px hsl(2052, 100%, 50%), -33px 381px hsl(2057.4, 100%, 50%), -32px 382px hsl(2062.8, 100%, 50%), -30px 383px hsl(2068.2, 100%, 50%), -28px 384px hsl(2073.6, 100%, 50%), -27px 385px hsl(2079, 100%, 50%), -25px 386px hsl(2084.4, 100%, 50%), -23px 387px hsl(2089.8, 100%, 50%), -22px 388px hsl(2095.2, 100%, 50%), -20px 389px hsl(2100.6, 100%, 50%), -18px 390px hsl(2106, 100%, 50%), -16px 391px hsl(2111.4, 100%, 50%), -14px 392px hsl(2116.8, 100%, 50%), -13px 393px hsl(2122.2, 100%, 50%), -11px 394px hsl(2127.6, 100%, 50%), -9px 395px hsl(2133, 100%, 50%), -7px 396px hsl(2138.4, 100%, 50%), -5px 397px hsl(2143.8, 100%, 50%), -3px 398px hsl(2149.2, 100%, 50%), -1px 399px hsl(2154.6, 100%, 50%); font-size: 40px;";

    console.log("%cWoOOOooW %s", css, 'una ventana al backend');
    console.table(objetoJSON)

  } catch (e) {
    console.log(e)
    console.error("Actualmente no dispongo coordenadas para esa ubicacion")
  }

}
//Restaura el valor de el parametro a false en el objeto LocalStorage del municipio que corresponde, para que puedan añadirse en otro momento si se desea
function cambiarOpcionAFalse(idOpcion, idCarta) {

  let localS = JSON.parse(localStorage.getItem('configUser'));
  //Buscamos el indice donde se encuentra el municipio a tratar
  let indice = 0;

  for (let i = 0; i < localS.length; i++) {
    if (idCarta == localS[i].municipio) {
      indice = i;
      console.log("match en el localStorage");

    }
  }
  console.log("cambiar opcion a false " + localS[indice].municipio)
  switch (idOpcion) {
    case "prec": {
      localS[indice].opciones.precipitacion = false;
      localStorage.setItem(`configUser`, JSON.stringify(localS))
    }

    case "hume": {
      localS[indice].opciones.humedad = false;
      localStorage.setItem(`configUSer`, JSON.stringify(localS))
    }
    case "vien": {
      localS[indice].opciones.viento = false;
      localStorage.setItem(`configUser`, JSON.stringify(localS))
    }
    case "tmax": {
      localS[indice].opciones.tempMax = false;
      localStorage.setItem(`configUser`, JSON.stringify(localS))
    }
    case "tmin": {
      localS[indice].opciones.tempMin = false;
      localStorage.setItem(`configUser`, JSON.stringify(localS))
    }
    case "tmed": {
      localS[indice].opciones.tempMedia = false;
      localStorage.setItem(`configUser`, JSON.stringify(localS))
    }

  }
}

//Para comprobar que el municipio lo tengamos ya visible/registrado en localStorage
function ElMunicipioExisteLocalStorage(idMunicipio) {

  let localS = JSON.parse(localStorage.getItem('configUser'));

  for (let i = 0; i < localS.length; i++)
    if (idMunicipio == localS[i].municipio) {
      console.log("El municipio ya existe en el panel")
      return true;
    }
  return false;
}
//FUNCION PARA IMPRIMIR LA FECHA Y LA HORA

function activarReloj() {
  window.fechaHoy = new Date();
  var diaHoy = fechaHoy.getDate()
  var diaHoyCastellano = fechaHoy.getDay();
  var añoActual = fechaHoy.getFullYear();
  var mesActual = fechaHoy.getMonth()

  switch (diaHoyCastellano) {
    case 0: diaHoyCastellano = "Domingo"; break;
    case 1: diaHoyCastellano = "Lunes"; break;
    case 2: diaHoyCastellano = "Martes"; break;
    case 3: diaHoyCastellano = "Miercoles"; break;
    case 4: diaHoyCastellano = "Jueves"; break;
    case 5: diaHoyCastellano = "Viernes"; break;
    case 6: diaHoyCastellano = "Sabado"; break;
  }

  switch (mesActual) {
    case 0: mesActual = "Enero"; break;
    case 1: mesActual = "Febero"; break;
    case 2: mesActual = "Marzo"; break;
    case 3: mesActual = "Abril"; break;
    case 4: mesActual = "Mayo"; break;
    case 5: mesActual = "Junio"; break;
    case 6: mesActual = "Julio"; break;
    case 7: mesActual = "Agosto"; break;
    case 8: mesActual = "Septiembre"; break;
    case 9: mesActual = "Octubre"; break;
    case 10: mesActual = "Noviembre"; break;
    case 11: mesActual = "Diciembre"; break;
  }

  document.getElementById('año').innerHTML = añoActual
  document.getElementById('mes').innerHTML = mesActual
  document.getElementById('dia').innerHTML = diaHoy
  document.getElementById('diaS').innerHTML = diaHoyCastellano
}







