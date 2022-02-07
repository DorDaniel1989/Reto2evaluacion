﻿using System;

using System.Net.Http;
using System.Net.Http.Headers;
using NW = Newtonsoft.Json;
using System.Linq;
using System.Threading.Tasks;
using System.Threading;
using Colorful;
using System.Drawing;
using Console = Colorful.Console;
using Newtonsoft.Json;
using System.Collections.Generic;

namespace ConsoleAppConsultas
{
    class Program
    {
        static async Task Main(string[] args)
        {


            //Guardamos valores de la fecha actual del sistema
            var diaHoy = DateTime.Today.Day;
            var AñoHoy = DateTime.Today.Year;
            var mesHoy = DateTime.Today.Month;
            var hora = DateTime.Now.Hour;

            var client2 = new HttpClient();
            var key2 = "7b2ad854f11f627f32da19668a5afa19";
            client2.DefaultRequestHeaders.Add("User-Agent", "mi consola");
            client2.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            client2.DefaultRequestHeaders.Add("Authorization", "Bearer " + key2);
            //var url22 = $"https://api.openweathermap.org/data/2.5/weather?q={"irun"}&appid={key2}";
            //HttpResponseMessage respuesta = await client2.GetAsync(url22);
            //var sResp = await respuesta.Content.ReadAsStringAsync();
            ////Parseamos la respuesta de string a objeto json
            ////dynamic jsonObjectRegiones = NW.JsonConvert.DeserializeObject(sResp);
            //Root2 myDeserializedClass = JsonConvert.DeserializeObject<Root2>(sResp);

            //Console.WriteLine(myDeserializedClass.coord.lat);
            //Console.WriteLine(myDeserializedClass.coord.lon);
            //Console.WriteLine(myDeserializedClass.main.humidity);


            var client = new HttpClient();
            var key = "eyJhbGciOiJSUzI1NiIsInR5cCI6IkpXVCJ9.eyJhdWQiOiJtZXQwMS5hcGlrZXkiLCJpc3MiOiJJRVMgUExBSUFVTkRJIEJISSBJUlVOIiwiZXhwIjoyMjM4MTMxMDAyLCJ2ZXJzaW9uIjoiMS4wLjAiLCJpYXQiOjE2NDE5NzM4MDcsImVtYWlsIjoiaWtiZHZAcGxhaWF1bmRpLm5ldCJ9.IofLYTTBr0PZoiLxmVzrqBU6vYWnoQX8Bi2SorSrvnzinBIG28AutQL3M6CEvLWstteyX74gQzCltKxZYrWUYkrsi9GXWsMzz20TiiSkz1D2KarxLiV5a4yFN71NybjYG_XHEWmnkoMIZmlFQ6O3f4ixyFdSFmLEVjI1-2Ud4XD8LNm035o_8_kkFxKYLYhElnn8wwC44tt5CeT9efMOxQLKa9JrsHUMapypWOybXIeSyScRAgjN8dMySX6IZx7YX6Wt3-buzFxXmBQAlmjvNULWQ0r2VPHnthETr72RWLT1hYhXxOaLdBEnGe6F7hiwTHonU9fy_wBkr2i697qGTA";
            client.DefaultRequestHeaders.Add("User-Agent", "mi consola");
            client.DefaultRequestHeaders.Accept.Add(new MediaTypeWithQualityHeaderValue("application/json"));
            client.DefaultRequestHeaders.Add("Authorization", "Bearer " + key);
            //Hacemos la primera peticion a la API para recibir las regiones
            var urlRegiones = $"https://api.euskadi.eus/euskalmet/geo/regions/basque_country/zones";
            //Esperamos a recibir la respuesta de la API
            HttpResponseMessage respuestaRegiones = await client.GetAsync(urlRegiones);
            //Esperamos a recibir el contenido de la respuesta
            var sRespRegiones = await respuestaRegiones.Content.ReadAsStringAsync();
            //Parseamos la respuesta de string a objeto json
            dynamic jsonObjectRegiones = NW.JsonConvert.DeserializeObject(sRespRegiones);
            //Limpiamos lo que haya en la consola para arrancar de 0
            Console.Clear();
            var fig2 = new Figlet();
            var asciiart2 = fig2.ToAscii("METEOAPP");
            Console.WriteLine(asciiart2, Color.Gold);

            //APLICACION DE EL TIEMPO DE CONSOLA PARA PREGUNTAR DESDE TERMINAL

            var bucle = true;
            while (bucle)
            {
                Console.WriteLine("     # SELECCIONA UNA REGION");
                //Imprimimos lo que tenemos dentro de el objeto que contiene las Regiones recibidas
                foreach (var item in jsonObjectRegiones)
                {

                    Console.WriteLine($"         {item.regionZoneId}", Color.Yellow);
                }

                Console.WriteLine("**********************************", Color.Purple);
                Console.WriteLine("Introduce la zona....");
                var zona = Console.ReadLine();
                Console.WriteLine("**********************************", Color.White);
                Console.WriteLine("     # LOCALIDADES EN LA REGION SELECCIONADA", Color.Purple);
                //Construimos la url con la zona que ha introducido el usuario
                var urlLocalidades = $"https://api.euskadi.eus/euskalmet/geo/regions/basque_country/zones/{zona}/locations";
                //Y hacemos la peticion como antes
                HttpResponseMessage respuestaLocalidades = await client.GetAsync(urlLocalidades);
                var sRespLocalidades = await respuestaLocalidades.Content.ReadAsStringAsync();
                dynamic jsonObjectLocalidades = NW.JsonConvert.DeserializeObject(sRespLocalidades);

                var i = 1; //Variable que numera la lista de localidades
                string respuestaContinuar; //Variable que corta el programa

                //Imprimimos las localidades asociadas a la region introducida por el usuario
                foreach (var item in jsonObjectLocalidades)
                {
                    Console.WriteLine($"         {i}- {item.regionZoneLocationId}", Color.Yellow);
                    i++;
                }

                Console.WriteLine("**********************************", Color.White);
                Console.WriteLine("Introduce la localidad....", Color.White);
                var municipio = Console.ReadLine();
                //Formamos la url de la peticion que nos devuelve los registros en Euskalmet con la informacion del tiempo para la localidad introducida por el usuario
                var urlLocalizacionForecast = $"https://api.euskadi.eus/euskalmet/weather/regions/basque_country/zones/{zona}/locations/{municipio}/forecast/trends/measures/at/{AñoHoy}/0{mesHoy}/{diaHoy}/for/{AñoHoy}0{mesHoy}{diaHoy}";
                HttpResponseMessage respuestaRegistrosDeTiempo = await client.GetAsync(urlLocalizacionForecast);
                var sRespRegistrosDeTiempo = await respuestaRegistrosDeTiempo.Content.ReadAsStringAsync();
                //Este objeto contiene 24 registros diferentes, uno por cada hora
                dynamic jsonObjectRegistrosDeTiempo = NW.JsonConvert.DeserializeObject(sRespRegistrosDeTiempo);



                try
                {
                    if (hora == 0) hora = 24;// La hora del Pc marca 0 cuando son las 12 de la noche, asi se corrige el error que produciria
                    string sHora;
                    //Si es antes de las 10 de la mañana agregamos
                    if (hora < 11)
                    {
                        sHora = "0" + (hora +2);
                    }
                    else
                    {
                        sHora = (hora +2).ToString();
                    }
                    Console.WriteLine($"Iterando sobre los {jsonObjectRegistrosDeTiempo.trends.set.Count} registros para buscar el mas cercano a la hora actual....");
                    int ultimoRegistro = 0;
                    //En este bucle buscamos el registro mas actual basada en la hora del pc
                    for (var x = 0; x < jsonObjectRegistrosDeTiempo.trends.set.Count; x++)
                    {
                        Console.WriteLine($"{(jsonObjectRegistrosDeTiempo.trends.set[x].range).ToString()} ", Color.BlueViolet);
                        //Si el string del apartado range del registro que estamos iterando contiene los digitos buscados, lo hemos encontrado
                        if (((jsonObjectRegistrosDeTiempo.trends.set[x].range)).ToString().Contains(sHora))
                        {
                            Console.WriteLine($" =>>>> {jsonObjectRegistrosDeTiempo.trends.set[x].range} ", Color.Gold);
                            ultimoRegistro = x; //Guardamos la posicion de la iteracion, ya que coincidira con la posicion del registro en el jsonObjectRegistrosDeTiempo
                        }
                    }
                    //Recuperamos los valores del registro deseado
                    dynamic temp = jsonObjectRegistrosDeTiempo.trends.set[ultimoRegistro].temperature;
                    dynamic prec = jsonObjectRegistrosDeTiempo.trends.set[ultimoRegistro].precipitation;
                    dynamic vvi = jsonObjectRegistrosDeTiempo.trends.set[ultimoRegistro].windspeed;
                    dynamic desc = jsonObjectRegistrosDeTiempo.trends.set[ultimoRegistro].symbolSet.weather.nameByLang.SPANISH;
                    dynamic pathImg = jsonObjectRegistrosDeTiempo.trends.set[ultimoRegistro].symbolSet.weather.path;
                    dynamic rangHor = jsonObjectRegistrosDeTiempo.trends.set[ultimoRegistro].range;


                    //Algunas consultas con LINQ
                    Root jsonObjectHistorialDeTiempo = JsonConvert.DeserializeObject<Root>(sRespRegistrosDeTiempo);

                    // Temperaturas maximas y minimas del dia
                    var registrosOrdenados = from reg in jsonObjectHistorialDeTiempo.trends.set orderby reg.temperature.value ascending select reg;
                    var tempMin = registrosOrdenados.First().temperature.value;
                    var tempMax = registrosOrdenados.Last().temperature.value;

                    //Temperatura media del dia

                    var listaTemperaturas = from reg in jsonObjectHistorialDeTiempo.trends.set select reg.temperature.value;
                    var tempMedia = listaTemperaturas.Average();


                    //Ahora sacamos otros datos de la otra API
                    var url22 = $"https://api.openweathermap.org/data/2.5/weather?q={municipio}&appid={key2}&lang=es&units=metric";
                    HttpResponseMessage respuesta = await client2.GetAsync(url22);
                    var sResp = await respuesta.Content.ReadAsStringAsync();
                    //Parseamos la respuesta de string a objeto json
                    //dynamic jsonObjectRegiones = NW.JsonConvert.DeserializeObject(sResp);
                    Root2 myDeserializedClass = JsonConvert.DeserializeObject<Root2>(sResp);

                    var lat=myDeserializedClass.coord.lat;
                    var lon =myDeserializedClass.coord.lon;
                    var hum =myDeserializedClass.main.humidity;
                    var t = myDeserializedClass.main.temp;



                    //Imprimimos los resultados 

                    Console.Write($" INFORMACION DEL TIEMPO EN ", Color.Blue);
                    Console.Write($"{municipio.ToUpper()} ", Color.Yellow);
                    Console.Write($"a fecha {AñoHoy} / 0{mesHoy} / {diaHoy} Hora : {hora - 1}", Color.Blue);
                    Console.WriteLine();
                    Console.WriteLine("DATOS EXTRAIDOS DE EUSKALMET" ,Color.White);
                    Console.Write($"Temperatura  =", Color.Yellow);
                    Console.Write($" {temp.value} Cº ", Color.Green);
                    Console.WriteLine();
                    Console.Write($"Precitipacion acumulada  =", Color.Yellow);
                    Console.Write($" {prec.value} ml ", Color.Green);
                    Console.WriteLine();
                    Console.Write($"Velocidad del Viento  =", Color.Yellow);
                    Console.Write($" {vvi.value} Km/h  ", Color.Green);
                    Console.WriteLine();
                    Console.Write($"Descripcion  =", Color.Yellow);
                    Console.Write($" {desc}  ", Color.Green);
                    Console.WriteLine();
                    Console.Write($"Ruta de la imagen  =", Color.Yellow);
                    Console.Write($"  {pathImg}  ", Color.Green);
                    Console.WriteLine();
                    Console.Write($"Rango horario  =", Color.Yellow);
                    Console.Write($"  {rangHor}  ", Color.Green);
                    Console.WriteLine();
                    Console.WriteLine("**********************", Color.Gold);
                    Console.WriteLine("DATOS EXTRAIDOS DE OPEN-WEATHER",Color.White);
                    Console.Write($"Latitud   =", Color.Yellow);
                    Console.Write($"  {lat}  ", Color.Green);
                    Console.WriteLine();
                    Console.Write($"Longitud   =", Color.Yellow);
                    Console.Write($"  {lon}  ", Color.Green);
                    Console.WriteLine();
                    Console.Write($"Humedad   =", Color.Yellow);
                    Console.Write($"  {hum}  %", Color.Green);
                    Console.WriteLine();
                    Console.Write($"T   =", Color.Yellow);
                    Console.Write($"  {t}  ºC", Color.Green);
                    Console.WriteLine();
                    Console.WriteLine("**********************",Color.Gold);
                    Console.WriteLine("ESTADISTICAS DEL DIA HECHAS CON LINQ" ,Color.White);
                    Console.Write($"Temperatura max   =", Color.Yellow);
                    Console.Write($"  {tempMax}  ºC", Color.Green);
                    Console.WriteLine();
                    Console.Write($"Temperatura min   =", Color.Yellow);
                    Console.Write($"  {tempMin} ºC ", Color.Green);
                    Console.WriteLine();
                    Console.Write($"Temperatura media   =", Color.Yellow);
                    Console.Write($"  {tempMedia}  ºC", Color.Green);
                    Console.WriteLine();

                    //Preguntamos al usuario si quiere continuar
                    Console.WriteLine("================", Color.White);
                    Console.WriteLine("Presiona N para salir, para continuar introduce cualquier otra tecla...", Color.White);
                    respuestaContinuar = Console.ReadLine();
                    if (respuestaContinuar.Equals("N"))
                    {
                        bucle = false;

                    }
                    //Console.Clear();
                }
                //Saltara excepcion si no se recibe una respuesta en la API, y nos avisara de que no existe ese dato en Euskalmet
                catch (Exception e)
                {
                    Console.WriteLine("Lo siento no hay datos en Euskalmet", Color.Red);
                    Console.WriteLine("Presiona N para salir, para continuar introduce cualquier otra tecla...", Color.White);
                    respuestaContinuar = Console.ReadLine();
                    if (respuestaContinuar.Equals("N"))
                    {
                        bucle = false;
                    }
                    //Console.Clear();
                }
            }
        }
    }
 }


    //MODELOS PARA RECIBIR LAS RESPUESTAS API EUSKALMET
    public class Region
    {
        public string typeId { get; set; }
        public string key { get; set; }
        public string regionId { get; set; }
    }

    public class RegionZone
    {
        public string typeId { get; set; }
        public string key { get; set; }
        public string regionId { get; set; }
        public string regionZoneId { get; set; }
    }

    public class RegionZoneLocation
    {
        public string typeId { get; set; }
        public string key { get; set; }
        public string regionId { get; set; }
        public string regionZoneId { get; set; }
        public string regionZoneLocationId { get; set; }
    }

    public class Temperature
    {
        public double value { get; set; }
        public string unit { get; set; }
    }

    public class Precipitation
    {
        public double value { get; set; }
        public string unit { get; set; }
    }

    public class Winddirection
    {
        public double value { get; set; }
        public string unit { get; set; }
        public string cardinalpoint { get; set; }
    }

    public class Windspeed
    {
        public double value { get; set; }
        public string unit { get; set; }
    }

    public class NameByLang
    {
        public string SPANISH { get; set; }
        public string BASQUE { get; set; }
    }

    public class DescriptionByLang
    {
        public string SPANISH { get; set; }
        public string BASQUE { get; set; }
    }

    public class Weather
    {
        public string id { get; set; }
        public string path { get; set; }
        public NameByLang nameByLang { get; set; }
        public DescriptionByLang descriptionByLang { get; set; }
    }

    public class SymbolSet
    {
        public Weather weather { get; set; }
    }

    public class ShortDescription
    {
        public string SPANISH { get; set; }
        public string BASQUE { get; set; }
    }

    public class Set
    {
        public string range { get; set; }
        public Temperature temperature { get; set; }
        public Precipitation precipitation { get; set; }
        public Winddirection winddirection { get; set; }
        public Windspeed windspeed { get; set; }
        public SymbolSet symbolSet { get; set; }
        public ShortDescription shortDescription { get; set; }
    }

    public class Trends
    {
        public List<Set> set { get; set; }
    }

    public class Root

    {
        public string oid { get; set; }
        public int numericId { get; set; }
        public int entityVersion { get; set; }
        public DateTime at { get; set; }
        public DateTime @for { get; set; }
        public Region region { get; set; }
        public RegionZone regionZone { get; set; }
        public RegionZoneLocation regionZoneLocation { get; set; }
        public Trends trends { get; set; }
    }




   //MODELO PARA API OPEN-WEATHER
    public class Coord
    {
        public double lon { get; set; }
        public double lat { get; set; }
    }

    public class Weather2
    {
        public int id { get; set; }
        public string main { get; set; }
        public string description { get; set; }
        public string icon { get; set; }
    }

    public class Main
    {
        public double temp { get; set; }
        public double feels_like { get; set; }
        public double temp_min { get; set; }
        public double temp_max { get; set; }
        public int pressure { get; set; }
        public int humidity { get; set; }
    }

    public class Wind
    {
        public double speed { get; set; }
        public int deg { get; set; }
    }

    public class Clouds
    {
        public int all { get; set; }
    }

    public class Sys
    {
        public int type { get; set; }
        public int id { get; set; }
        public double message { get; set; }
        public string country { get; set; }
        public int sunrise { get; set; }
        public int sunset { get; set; }
    }

    public class Root2
    {
        public Coord coord { get; set; }
        public List<Weather2> weather { get; set; }
        public string @base { get; set; }
        public Main main { get; set; }
        public int visibility { get; set; }
        public Wind wind { get; set; }
        public Clouds clouds { get; set; }
        public int dt { get; set; }
        public Sys sys { get; set; }
        public int timezone { get; set; }
        public int id { get; set; }
        public string name { get; set; }
        public int cod { get; set; }
    }




